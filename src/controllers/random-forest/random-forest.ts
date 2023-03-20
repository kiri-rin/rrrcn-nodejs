import { mkdir, writeFile } from "fs/promises";
import { printRandomForestCharts } from "../../services/random-forest/charts";
import { importGeometries } from "../../services/utils/import-geometries";
import { RandomForestConfig } from "../../analytics_config_types";
import {
  downloadClassifiedImage,
  getAllPoints,
  getParamsImage,
  getTrainingValidationPointsPare,
} from "./utils";
import { randomForestAndValidateService } from "../../services/random-forest";

export const randomForest = async (config: RandomForestConfig) => {
  const {
    outputMode,
    regionOfInterest: regionOfInterestConfig,
    trainingPoints: trainingPointsConfig,
    validation: validationConfig,
    params,
    outputs,
  } = config;
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
  const { classified_image, classifier, validations } =
    await randomForestAndValidateService({
      trainingPoints,
      regionOfInterest,
      paramsImage,
      outputMode,
      validationPoints,
    });

  const outputDir = `${outputs}`;
  await mkdir(outputDir, { recursive: true });
  await printRandomForestCharts({
    classifiedImage: classified_image,
    explainedClassifier: validations.explainedClassifier,
    trainingData: trainingPoints,
    validationData: validationPoints,
    output: outputDir,
  });
  await writeFile(
    `${outputDir}/trained.json`,
    JSON.stringify(validations.explainedClassifier, null, 4)
  );
  const { promise } = await downloadClassifiedImage({
    classified_image,
    regionOfInterest,
    output: outputDir,
  });
  await promise;
  return { classifier, classified_image, regionOfInterest };
};
