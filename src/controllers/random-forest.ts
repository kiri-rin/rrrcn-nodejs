import { EEFeature, EEFeatureCollection, EEImage } from "../types";
import { analyticsConfigType } from "../analytics_config";
import fs, { writeFile } from "fs/promises";
import { importPointsFromCsv, JSCSVTable } from "../services/utils/points";
import { parse } from "csv-parse/sync";
import allScripts, { scriptKey } from "../services/ee-data";
import { it } from "node:test";
import { evaluatePromisify } from "../services/utils/ee-image";

export const randomForest = async (analyticsConfig: analyticsConfigType) => {
  const parametersImageArray = [];
  if (!analyticsConfig.randomForest) return;
  const {
    scripts,
    randomForest,
    pointsCsvPath,
    dates,
    buffer,
    outputs,
    regionOfInterestCsvPath,
  } = analyticsConfig;

  const pointsRaw = await fs.readFile(pointsCsvPath);
  const pointsParsed = parse(pointsRaw, { delimiter: ",", columns: true });
  const points = importPointsFromCsv({
    csv: pointsParsed,
    lat_key: "Latitude",
    long_key: "Longitude",
    id_key: "id",
    inheritProps: ["Presence"],
  });
  const regionPointsRaw = await fs.readFile(regionOfInterestCsvPath);
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

  const scriptsKeys: scriptKey[] = Array.isArray(scripts)
    ? scripts
    : (Object.keys(scripts) as scriptKey[]);
  for (let script of scriptsKeys) {
    let scriptDates = Array.isArray(scripts)
      ? dates
      : scripts[script]?.dates || dates;

    console.log(script);
    parametersImageArray.push(
      ...Object.values(await allScripts[script](regionOfInterest, scriptDates))
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
  const classifier_prob = ee.Classifier.smileRandomForest(20)
    .setOutputMode("PROBABILITY")
    .train({
      features: training,
      classProperty: "Presence",
      inputProperties: bands,
    });
  const classified_prob = paramsImage
    .select(bands)
    .classify(classifier_prob)
    .multiply(100);
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
  await writeFile(
    `./.local/outputs/${outputs}/trained_falco.json`,
    JSON.stringify(json)
  );

  return;
};
