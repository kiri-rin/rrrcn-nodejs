import { mkdir, writeFile } from "fs/promises";
import { printMaxentCharts } from "../../services/maxent/charts";
import { importGeometries } from "../../utils/import-geometries";
import { MaxentConfig } from "../../analytics_config_types";
import {
  downloadClassifiedImage,
  getAllPoints,
  getParamsImage,
  getTrainingValidationPointsPare,
} from "../random-forest/utils";
import { maxentAndValidateService } from "../../services/maxent";
import { maxentCV } from "./cross-validation-maxent";

export const maxent = async (config: MaxentConfig) => {
  const {
    outputMode,
    regionOfInterest: regionOfInterestConfig,
    trainingPoints: trainingPointsConfig,
    validation: validationConfig,
    params,
    outputs,
  } = config;
  if (
    validationConfig.type === "split" &&
    (validationConfig?.cross_validation || 0) > 1
  ) {
    return await maxentCV(config);
  }
  console.log("preparing data");
  strapiLogger("preparing data");
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
  console.log("processing random forest");
  strapiLogger("processing random forest");

  const { classified_image, classifier, validations } =
    await maxentAndValidateService({
      trainingPoints,
      regionOfInterest,
      paramsImage,
      outputMode,
      validationPoints,
    });

  const outputDir = `${outputs}`;
  await mkdir(outputDir, { recursive: true });
  await printMaxentCharts({
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
