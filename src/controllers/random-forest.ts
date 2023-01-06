import { EEFeature, EEFeatureCollection, EEImage } from "../types";
import { analyticsConfigType } from "../analytics_config";
import fsPromises, { mkdir, writeFile } from "fs/promises";
import fs from "fs";
import { importPointsFromCsv, JSCSVTable } from "../services/utils/points";
import { parse } from "csv-parse/sync";
import allScripts, { scriptKey } from "../services/ee-data";
import { it } from "node:test";
import { evaluatePromisify } from "../services/utils/ee-image";
import { printRandomForestCharts } from "../services/random-forest/charts";
import http from "https";

export const randomForest = async (analyticsConfig: analyticsConfigType) => {
  const parametersImageArray = [];
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
  const pointsRaw = await fsPromises.readFile(pointsCsvPath);
  const pointsParsed = parse(pointsRaw, { delimiter: ",", columns: true });
  let raw_points = importPointsFromCsv({
    csv: pointsParsed,
    lat_key: "Latitude",
    long_key: "Longitude",
    id_key: "id",
    inheritProps: ["Presence"],
  });
  let externalValidationPoints;
  if (validationPointsCsvPath) {
    const val_pointsRaw = await fsPromises.readFile(validationPointsCsvPath);
    const val_pointsParsed = parse(val_pointsRaw, {
      delimiter: ",",
      columns: true,
    });
    externalValidationPoints = importPointsFromCsv({
      csv: val_pointsParsed,
      lat_key: "Latitude",
      long_key: "Longitude",
      id_key: "id",
      inheritProps: ["Presence"],
    });
  }

  const regionPointsRaw = await fsPromises.readFile(regionOfInterestCsvPath);
  const regionPointsParsed: JSCSVTable = parse(regionPointsRaw, {
    delimiter: ",",
    columns: true,
  });
  const regionOfInterest = ee.Geometry.Polygon([
    regionPointsParsed.map((row) => [
      Number(row.Longitude),

      Number(row.Latitude),
    ]),
  ]);

  raw_points = raw_points.randomColumn("random", 2);
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

  const scriptObjects = scripts.map((it) =>
    typeof it === "string" ? { key: it } : it
  );
  for (let { key: script, dates, bands } of scriptObjects) {
    let scriptDates = dates === undefined ? defaultDates : dates;

    console.log(script);
    parametersImageArray.push(
      ...Object.values(
        await allScripts[script as scriptKey]({
          regions: regionOfInterest,
          datesConfig: scriptDates,
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
  console.log(await evaluatePromisify(training.size()));

  const classifier_prob = ee.Classifier.smileRandomForest(20)
    .setOutputMode(outputMode)
    .train({
      features: training,
      classProperty: "Presence",
      inputProperties: bands,
    });
  const classified_prob = paramsImage
    .select(bands)
    .classify(classifier_prob)
    .multiply(100)
    .round();
  await mkdir(`./.local/outputs/${defaultOutputs}`, { recursive: true });

  await printRandomForestCharts({
    classifiedImage: classified_prob,
    trainingData: points,
    validationData: validationPoints,
    regionOfInterest,
    output: `./.local/outputs/${defaultOutputs}`,
  });

  const json: any = await evaluatePromisify(classifier_prob.explain());
  json.thumbUrl = await new Promise((resolve) =>
    classified_prob.getThumbURL(
      {
        image: classified_prob,
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
    classified_prob.getDownloadURL(
      {
        image: classified_prob,
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
  await Promise.all([
    downloadFile(json.thumbUrl, `${outputDir}classification.png`),
    downloadFile(json.downloadUrl, `${outputDir}classification.zip`),
  ]);
  const vector = classified_prob.sample({
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
