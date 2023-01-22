import { EEFeature, EEFeatureCollection, EEImage } from "../types";
import {
  analyticsConfig,
  analyticsConfigType,
  randomForestConfig,
  ScriptConfig,
} from "../analytics_config_types";
import fsPromises, { mkdir, writeFile } from "fs/promises";
import fs from "fs";
import { importPointsFromCsv, JSCSVTable } from "../services/utils/points";
import { parse } from "csv-parse/sync";
import allScripts, { scriptKey } from "../services/ee-data";
import { it } from "node:test";
import { evaluatePromisify } from "../services/utils/ee-image";
import { printRandomForestCharts } from "../services/random-forest/charts";
import http from "https";
import {
  reduceRegionsFromImageOrCollection,
  writeScriptFeaturesResult,
} from "../services/utils/io";
import { DatesConfig } from "../services/utils/dates";
import { estimatePopulation } from "../services/random/population";
export const getPoints = async (
  path: string,
  lat_key: string = "Latitude",
  long_key: string = "Longitude",
  id_key: string = "id"
) => {
  const pointsFile = await fsPromises.readFile(path);
  const pointsParsed = parse(pointsFile, { delimiter: ",", columns: true });
  return importPointsFromCsv({
    csv: pointsParsed,
    lat_key: "Latitude",
    long_key: "Longitude",
    id_key: "id",
    inheritProps: ["Presence"],
  });
};
export const getRegionOfInterest = async (
  path: string,
  lat_key: string = "Latitude",
  long_key: string = "Longitude"
) => {
  const regionPointsRaw = await fsPromises.readFile(path);
  const regionPointsParsed: JSCSVTable = parse(regionPointsRaw, {
    delimiter: ",",
    columns: true,
  });
  return ee.Geometry.Polygon([
    regionPointsParsed.map((row) => [
      Number(row[long_key]),

      Number(row[lat_key]),
    ]),
  ]);
};
export const setDefaultsToScriptsConfig = (
  analyticsConfig: analyticsConfigType
) => {
  const scriptObjects = analyticsConfig.scripts.map((it) => {
    const obj = typeof it === "string" ? { key: it } : it;
    if (obj.dates === undefined) {
      obj.dates = analyticsConfig.dates;
    }
    return obj as Required<ScriptConfig>;
  });
  return scriptObjects;
};
export const getParamsImage = async ({
  scripts,
  regionOfInterest,
}: {
  scripts: Required<ScriptConfig>[];
  regionOfInterest: EEImage;
}) => {
  const parametersImageArray = [];

  for (let { key: script, dates, bands } of scripts) {
    console.log(script);
    parametersImageArray.push(
      ...Object.values(
        await allScripts[script as scriptKey]({
          regions: regionOfInterest,
          datesConfig: dates as DatesConfig,
          bands,
        })
      )
      //   .map(([key, image], index, array) =>
      // array.length > 1
      //   ? image.rename(
      //       image
      //         .bandNames()
      //         .map((name: any) => ee.String(name).cat(`_${key}`))
      //     )
      //   : image
      // )
    );
  }
  return parametersImageArray.reduce((acc, it, index) => {
    return index ? acc.addBands(it) : acc;
  }, parametersImageArray[0]);
};
export const getRFClassifier = async ({
  trainingPoints,
  outputMode,
  paramsImage,
}: {
  trainingPoints: EEFeatureCollection;
  paramsImage: EEImage;
  outputMode: randomForestConfig["outputMode"];
}) => {
  // console.log(await evaluatePromisify(training.size()));

  const classifier = ee.Classifier.smileRandomForest(20)
    .setOutputMode(outputMode)
    .train({
      features: trainingPoints,
      classProperty: "Presence",
      inputProperties: paramsImage.bandNames(),
    });

  const classified_image = paramsImage
    .select(paramsImage.bandNames())
    .classify(classifier)
    .multiply(100)
    .round();
  return { classified_image, classifier };
};
export const randomForest = async (analyticsConfig: analyticsConfigType) => {
  if (!analyticsConfig.randomForest) return;
  const {
    scripts,
    pointsCsvPath,
    latitude_key,
    longitude_key,
    id_key,
    dates: defaultDates,
    outputs: defaultOutputs,
    randomForest: {
      regionOfInterestCsvPath,
      validationSplit,
      outputMode,
      bufferPerAreaPoint,
      classificationSplit,
      validationPointsCsvPath,
      validationSeed,
    },
  } = analyticsConfig;
  const outputDir = `./.local/outputs/${defaultOutputs}/`;
  await mkdir(`./.local/outputs/${defaultOutputs}`, { recursive: true });

  let raw_points = await getPoints(
    pointsCsvPath,
    latitude_key,
    longitude_key,
    id_key
  );
  const regionOfInterest = await getRegionOfInterest(
    regionOfInterestCsvPath,
    latitude_key,
    longitude_key
  );
  raw_points = raw_points.randomColumn("random", validationSeed);
  let externalValidationPoints;
  if (validationPointsCsvPath) {
    externalValidationPoints = await getPoints(
      validationPointsCsvPath,
      latitude_key,
      longitude_key,
      id_key
    );
  }
  const abs_raw_points = raw_points.filter(ee.Filter.eq("Presence", 0));
  const pres_raw_points = raw_points.filter(ee.Filter.eq("Presence", 1));
  var validationPoints = externalValidationPoints
    ? externalValidationPoints.merge(
        abs_raw_points.filter(ee.Filter.lt("random", validationSplit))
      )
    : raw_points.filter(ee.Filter.lt("random", validationSplit));
  var points = externalValidationPoints
    ? pres_raw_points.merge(
        abs_raw_points.filter(ee.Filter.gt("random", validationSplit))
      )
    : raw_points.filter(ee.Filter.gte("random", validationSplit));

  const scriptObjects = setDefaultsToScriptsConfig(analyticsConfig);
  const paramsImage = await getParamsImage({
    scripts: scriptObjects,
    regionOfInterest,
  });
  const trainingPoints = paramsImage.sampleRegions({
    collection: points,
    properties: ["Presence"],
    scale: 100,
  });
  const { classified_image, classifier } = await getRFClassifier({
    trainingPoints,
    outputMode,
    paramsImage,
  });
  const toDownload = [];
  if (outputMode !== "CLASSIFICATION") {
    const classified_image_classes = classified_image.gte(
      classificationSplit || 50
    );
    // await estimatePopulation({
    //   image: classified_image_classes,
    //   regionOfInterest,
    //   meanDistance: 5600,
    //   minDistance: 1000,
    //   maxDistance: 10200,
    //   presencePoints: abs_raw_points,
    // });
    const thumbUrl: string = await getThumbUrl(
      classified_image_classes.multiply(100),
      regionOfInterest
    );
    const tiffUrl: string = await getTiffUrl(
      classified_image_classes,
      regionOfInterest
    );
    // toDownload.push(
    //   downloadFile(
    //     thumbUrl,
    //     `${outputDir}classification_classes_${classificationSplit}.png`
    //   ),
    //   downloadFile(
    //     tiffUrl,
    //     `${outputDir}classification_classes_${classificationSplit}.zip`
    //   )
    // );
    if (bufferPerAreaPoint) {
      const buffered_classes = classified_image_classes
        .convolve(ee.Kernel.circle(bufferPerAreaPoint, "meters", false, 1))
        .gt(0);
      const _thumbUrl = await getThumbUrl(
        buffered_classes.multiply(100),
        regionOfInterest
      );
      const _tiffUrl = await getTiffUrl(buffered_classes, regionOfInterest);
      // toDownload.push(
      //   downloadFile(
      //     _thumbUrl,
      //     `${outputDir}classification_classes_buffered_${classificationSplit}_${bufferPerAreaPoint}.png`
      //   ),
      //   downloadFile(
      //     _tiffUrl,
      //     `${outputDir}classification_classes_buffered_${classificationSplit}_${bufferPerAreaPoint}.zip`
      //   )
      // );
    }
  }

  const json: any = await evaluatePromisify(classifier.explain());
  await printRandomForestCharts({
    classifiedImage: classified_image,
    explainedClassifier: json,
    trainingData: points,
    validationData: validationPoints,
    regionOfInterest,
    output: `./.local/outputs/${defaultOutputs}`,
  });
  const allData = await reduceRegionsFromImageOrCollection(
    points,
    paramsImage,
    100,
    []
  );
  await writeScriptFeaturesResult({ allData }, `${outputDir}dataset.csv`);
  json.thumbUrl = await getThumbUrl(classified_image, regionOfInterest);
  json.downloadUrl = await getTiffUrl(classified_image, regionOfInterest);

  // toDownload.push(
  //   downloadFile(json.thumbUrl, `${outputDir}classification.png`),
  //   downloadFile(json.downloadUrl, `${outputDir}classification.zip`)
  // );
  // await Promise.all(toDownload);
  const vector = classified_image.sample({
    region: regionOfInterest,
    scale: 1000,
    geometries: true,
  });
  // json.downloadJSONUrl = await new Promise((resolve) => {
  //   vector.getDownloadURL(
  //     "JSON",
  //     ["classification", ".geo"],
  //     "EXPORTED",
  //     (res: any, error: any) => {
  //       console.log({ res, error });
  //       console.log(res, " URL");
  //       resolve(res);
  //     }
  //   );
  // });
  // json.downloadKMLUrl = await new Promise((resolve) => {
  //   vector.getDownloadURL(
  //     "KML",
  //     ["classification"],
  //     "EXPORTED",
  //     (res: any, error: any) => {
  //       console.log({ res, error });
  //       console.log(res, " URL");
  //       resolve(res);
  //     }
  //   );
  // });

  await writeFile(`${outputDir}trained.json`, JSON.stringify(json, null, 4));

  return;
};
export const downloadFile = async (url: string, path: string) =>
  new Promise((resolve, reject) => {
    console.log("DOWNLOADING ", url);
    const file = fs.createWriteStream(path);
    const request = http.get(url, function (response) {
      response.pipe(file);

      // after download completed close filestream
      file.on("finish", () => {
        file.close();
        resolve(true);
        console.log("Download Completed");
      });
    });
  });
export const getThumbUrl = async (
  classified_image: EEImage,
  regionOfInterest: EEFeature
): Promise<string> =>
  await new Promise((resolve) =>
    classified_image.getThumbURL(
      {
        image: classified_image,
        min: 0,
        region: regionOfInterest,
        max: 100,
        dimensions: 1000,
        palette: ["FFFFFF", "C6AC94", "8D8846", "395315", "031A00"],
      },
      (res: string) => {
        console.log(res, " URL");
        resolve(res as string);
      }
    )
  );
export const getTiffUrl = async (
  classified_image: EEImage,
  regionOfInterest: EEFeature
): Promise<string> =>
  await new Promise((resolve) => {
    classified_image.getDownloadURL(
      {
        image: classified_image,
        maxPixels: 1e20,
        scale: 500,
        region: regionOfInterest,
      },
      (res: string) => {
        console.log(res, " URL");
        resolve(res as string);
      }
    );
  });
