import { EEFeature, EEFeatureCollection, EEImage } from "../types";
import {
  analyticsConfig,
  analyticsConfigType,
  randomForestConfig,
  ScriptConfig,
} from "../analytics_config";
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
export const getPoints = async (path: string) => {
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
export const getRegionOfInterest = async (path: string) => {
  const regionPointsRaw = await fsPromises.readFile(path);
  const regionPointsParsed: JSCSVTable = parse(regionPointsRaw, {
    delimiter: ",",
    columns: true,
  });
  return ee.Geometry.Polygon([
    regionPointsParsed.map((row) => [
      Number(row.Longitude),

      Number(row.Latitude),
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
export const getRFClassifier = async ({
  points,
  scripts,
  regionOfInterest,
  outputMode,
}: {
  points: EEFeatureCollection;
  scripts: Required<ScriptConfig>[];
  regionOfInterest: EEImage;
  outputMode: randomForestConfig["outputMode"];
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
    );
  }
  const paramsImage = parametersImageArray.reduce((acc, it, index) => {
    return index ? acc.addBands(it) : acc;
  }, parametersImageArray[0]);
  const bands = paramsImage.bandNames();

  const training = paramsImage.select(bands).sampleRegions({
    collection: points,
    properties: ["Presence"],
    scale: 100,
  });
  // console.log(await evaluatePromisify(training.size()));

  const classifier = ee.Classifier.smileRandomForest(20)
    .setOutputMode(outputMode)
    .train({
      features: training,
      classProperty: "Presence",
      inputProperties: bands,
    });

  const classified_image = paramsImage
    .select(bands)
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
    dates: defaultDates,
    outputs: defaultOutputs,
    randomForest: {
      regionOfInterestCsvPath,
      validationSplit,
      outputMode,
      validationPointsCsvPath,
    },
  } = analyticsConfig;
  const outputDir = `./.local/outputs/${defaultOutputs}/`;
  let raw_points = await getPoints(pointsCsvPath);
  const regionOfInterest = await getRegionOfInterest(regionOfInterestCsvPath);
  raw_points = raw_points.randomColumn("random");
  let externalValidationPoints;
  if (validationPointsCsvPath) {
    externalValidationPoints = await getPoints(validationPointsCsvPath);
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
  const { classified_image, classifier } = await getRFClassifier({
    points,
    outputMode,
    scripts: scriptObjects,
    regionOfInterest,
  });

  await mkdir(`./.local/outputs/${defaultOutputs}`, { recursive: true });
  const json: any = await evaluatePromisify(classifier.explain());
  await printRandomForestCharts({
    classifiedImage: classifier,
    explainedClassifier: json,
    trainingData: points,
    validationData: validationPoints,
    regionOfInterest,
    output: `./.local/outputs/${defaultOutputs}`,
  });
  // const allData = await reduceRegionsFromImageOrCollection(
  //   points,
  //   paramsImage,
  //   100,
  //   []
  // );
  // await writeScriptFeaturesResult({ allData }, `${outputDir}dataset.csv`);
  json.thumbUrl = await new Promise((resolve) =>
    classified_image.getThumbURL(
      {
        image: classified_image,
        min: 0,
        region: regionOfInterest,
        max: 100,
        dimensions: 1000,
        palette: ["FFFFFF", "C6AC94", "8D8846", "395315", "031A00"],
      },
      (res: any) => {
        console.log(res, " URL");
        resolve(res);
      }
    )
  );
  json.downloadUrl = await new Promise((resolve) => {
    classified_image.getDownloadURL(
      {
        image: classified_image,
        maxPixels: 1e20,
        scale: 500,
        region: regionOfInterest,
      },
      (res: any) => {
        console.log(res, " URL");
        resolve(res);
      }
    );
  });
  // await Promise.all([
  //   downloadFile(json.thumbUrl, `${outputDir}classification.png`),
  //   downloadFile(json.downloadUrl, `${outputDir}classification.zip`),
  // ]);
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
export const downloadFile = (url: string, path: string) =>
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
