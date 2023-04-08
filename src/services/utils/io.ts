import { EEFeatureCollection, EEImage, EEImageCollection } from "../../types";
import { exportFeatureCollectionsToCsv } from "./points";
import { evaluateScriptResultsToFeaturesArray } from "./ee-image";
import http from "https";

const fsCommon = require("fs");
const path = require("path");
const fs = require("fs/promises");
export const reduceImageRegions = async (
  regions: EEFeatureCollection,
  image: EEImage,
  scale?: number,
  keys?: string[],
  mode: "SUM" | "MEAN" = "SUM"
) => {
  let reducer = mode === "MEAN" ? ee.Reducer.mean() : ee.Reducer.sum();

  const bands = image.bandNames();
  reducer = ee.Algorithms.If(
    bands.size().eq(keys?.length || 0),
    reducer.setOutputs(keys),
    ee.Algorithms.If(bands.size().eq(1), reducer.setOutputs(bands), reducer)
  );

  return image.reduceRegions(regions, reducer, scale || 1);
};
export const reduceRegionsFromImageOrCollection = async (
  regions: EEFeatureCollection,
  imageOrCollection: EEImage | EEImageCollection,
  scale?: number,
  keys?: string[],
  mode: "SUM" | "MEAN" = "SUM"
) => {
  if (typeof imageOrCollection.map === "function") {
    return imageOrCollection
      .map((image: EEImage) => {
        return reduceImageRegions(regions, image, scale, keys, mode);
      })
      .flatten();
  } else {
    return reduceImageRegions(regions, imageOrCollection, scale, keys, mode);
  }
};
export const writeScriptFeaturesResult = async (
  features: { [p: string]: EEFeatureCollection },
  fileName: string
) => {
  //@ts-ignore
  const dirName = path.dirname(fileName);
  await fs.mkdir(`${dirName}`, {
    recursive: true,
  });
  const stream = fsCommon.createWriteStream(`${fileName}`);
  const res = await exportFeatureCollectionsToCsv(
    await evaluateScriptResultsToFeaturesArray(features)
  );
  for (let chank of res.match(/(.|[\r\n]){1,100}/g) || []) {
    stream.write(chank);
  }
  return new Promise((resolve, reject) => {
    stream.end("", "utf-8", () => {
      console.log("finish", fileName);
      strapiLogger("finish", fileName);
      resolve(true);
    });
  });
};
export const downloadFile = async (url: string, path: string) =>
  new Promise((resolve, reject) => {
    console.log("DOWNLOADING result files");
    strapiLogger("DOWNLOADING result files");
    const file = fsCommon.createWriteStream(path);
    const request = http.get(url, function (response) {
      response.pipe(file);

      // after download completed close filestream
      file.on("finish", () => {
        file.close();
        resolve(true);
        console.log("Download Completed");
        strapiLogger("Download Completed");
      });
    });
  });
