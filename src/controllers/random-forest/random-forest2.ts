import { EEFeature, EEImage } from "../../types";

import { mkdir, writeFile } from "fs/promises";
import fs from "fs";
import { evaluatePromisify } from "../../services/utils/ee-image";
import { printRandomForestCharts } from "../../services/random-forest/charts";
import http from "https";
import { importGeometries } from "../../services/utils/import-geometries";
import { randomForestConfig } from "../../analytics_config_types2";
import {
  getAllPoints,
  getParamsImage,
  getRFClassifier,
  getTrainingValidationPointsPare,
} from "./utils";
import { validateClassifier } from "../../services/random-forest/all-validations";

export const randomForest = async (config: randomForestConfig) => {
  const {
    outputMode,
    regionOfInterest: regionOfInterestConfig,
    trainingPoints: trainingPointsConfig,
    validation: validationConfig,
    params,
  } = config;
  const outputDir = `./.local/outputs/${defaultOutputs}/`;
  await mkdir(`./.local/outputs/${defaultOutputs}`, { recursive: true });

  let raw_points = await getAllPoints(trainingPointsConfig);
  const regionOfInterest = await importGeometries(
    regionOfInterestConfig,
    "polygon"
  );
  const paramsImage = await getParamsImage({
    params,
    regionOfInterest,
  });
  const { trainingPoints, validationPoints } = getTrainingValidationPointsPare(
    raw_points,
    validationConfig
  );

  const trainingSamples = paramsImage.sampleRegions({
    collection: trainingPoints,
    properties: ["Presence"],
    scale: 100,
  });
  const { classified_image, classifier } = await getRFClassifier({
    trainingSamples,
    outputMode,
    paramsImage,
  });

  const json: any = await evaluatePromisify(classifier.explain());
  const validations = validateClassifier(
    classified_image,
    trainingPoints,
    validationPoints
  );
  await printRandomForestCharts({
    classifiedImage: classified_image,
    explainedClassifier: json,
    trainingData: trainingPoints,
    validationData: validationPoints,
    output: `./.local/outputs/${defaultOutputs}`,
  });

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
