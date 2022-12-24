import { EEFeatureCollection, EEImage, EEImageCollection } from "../../types";
import { exportFeatureCollectionsToCsv } from "./points";
import { evaluateScriptResultsToFeaturesArray } from "./ee-image";
import { type } from "os";
import { AnalyticsScriptResult } from "../ee-data";
const fsCommon = require("fs");
const path = require("path");
const fs = require("fs/promises");
export const reduceImageRegions = (
  regions: EEFeatureCollection,
  image: EEImage,
  scale?: number,
  keys?: string[]
) => {
  let reducer = ee.Reducer.sum();

  const bands = image.bandNames().getInfo(); //TODO MOVE TO SERVER  SIDE CALC
  if (bands.length === keys?.length) {
    reducer = reducer.setOutputs(keys);
  } else {
    if (bands.length === 1) {
      reducer = reducer.setOutputs(bands);
    }
  }
  return image.reduceRegions(regions, reducer, scale || 1);
};
export const reduceRegionsFromImageOrCollection = (
  regions: EEFeatureCollection,
  imageOrCollection: EEImage | EEImageCollection,
  scale?: number,
  keys?: string[]
) => {
  if (typeof imageOrCollection.map === "function") {
    return imageOrCollection
      .map((image: EEImage) => {
        return reduceImageRegions(regions, image, scale, keys);
      })
      .flatten();
  } else {
    return reduceImageRegions(regions, imageOrCollection, scale, keys);
  }
};
export const writeScriptFeaturesResult = async (
  features: { [p: string]: EEFeatureCollection },
  fileName: string
) => {
  //@ts-ignore
  const dirName = path.dirname(fileName);
  await fs.mkdir(`./.local/outputs/${dirName}`, {
    recursive: true,
  });
  const stream = fsCommon.createWriteStream(`./.local/outputs/${fileName}`);
  console.log({ features });
  const res = await exportFeatureCollectionsToCsv(
    await evaluateScriptResultsToFeaturesArray(features)
  );
  for (let chank of res.match(/(.|[\r\n]){1,100}/g) || []) {
    stream.write(chank);
  }
  return new Promise((resolve, reject) => {
    stream.end("", "utf-8", () => {
      console.log("finish", fileName);
      resolve(true);
    });
  });
};
