import { mkdir, writeFile } from "fs/promises";
import { printRandomForestCharts } from "../../services/random-forest/charts";
import { importGeometries } from "../../utils/import-geometries";
import { RandomForestConfig } from "../../analytics_config_types";
import {
  downloadClassifiedImage,
  getAllPoints,
  getParamsImage,
  getTrainingValidationPointsPare,
} from "./utils";
import {
  randomForestAndValidateService,
  RandomForestServiceParams,
} from "../../services/random-forest";
import { randomForestCV } from "./cross-validation-random-forest";
import { cloneDeep } from "lodash";
import {
  classifierValidationType,
  validateClassifier,
} from "../../services/random-forest/all-validations";
import { EEImage } from "../../types";

export const randomForest = async (config: RandomForestConfig) => {
  if (!config.outputs) {
    return;
  }
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
    return await randomForestCV(config);
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
  let res;
  if (config.outputMode === "MEAN") {
    const { classifier: probClassifier, classified_image: probImage } =
      await trainRFAndDownloadResults({
        outputs: outputs + "/probability",
        trainingPoints,
        regionOfInterest,
        paramsImage,
        outputMode: "PROBABILITY",
        validationPoints,
      });
    const { classifier: regrClassifier, classified_image: regrImage } =
      await trainRFAndDownloadResults({
        outputs: outputs + "/regression",
        trainingPoints,
        regionOfInterest,
        paramsImage,
        outputMode: "REGRESSION",
        validationPoints,
      });
    const meanImage = probImage.add(regrImage).divide(2);
    const validations = (await validateClassifier(
      meanImage,
      validationPoints,
      trainingPoints
    )) as classifierValidationType;
    await outputRFResults({
      outputs,
      classified_image: meanImage,
      validations,
      trainingPoints,
      validationPoints,
      regionOfInterest,
    });
    res = { classifier: {}, classified_image: meanImage, regionOfInterest };
  } else {
    const { classifier, classified_image } = await trainRFAndDownloadResults({
      outputs: outputs,
      trainingPoints,
      regionOfInterest,
      paramsImage,
      outputMode,
      validationPoints,
    });
    res = { classifier, classified_image, regionOfInterest };
  }
  if (config.classificationSplits?.length && outputMode !== "CLASSIFICATION") {
    for (let split of config.classificationSplits) {
      const splittedImage = res.classified_image.gte(split);
      await (
        await downloadClassifiedImage({
          classified_image: splittedImage,
          output: `${outputs}/split${split}`,
          regionOfInterest,
          filename: `spit${split}`,
          discrete: true,
        })
      ).promise;
      for (let buffer of config.buffersPerAreaPoint || []) {
        const bufferedImage = splittedImage
          .convolve(ee.Kernel.circle(buffer, "meters", false, 1))
          .gt(0);
        await (
          await downloadClassifiedImage({
            classified_image: bufferedImage,
            output: `${outputs}/split${split}`,
            regionOfInterest,
            filename: `buffer${buffer}`,
            discrete: true,
          })
        ).promise;
      }
    }
  }
  if (outputMode === "CLASSIFICATION") {
    for (let buffer of config.buffersPerAreaPoint || []) {
      const bufferedImage = res.classified_image
        .convolve(ee.Kernel.circle(buffer, "meters", false, 1))
        .gt(0);
      await (
        await downloadClassifiedImage({
          classified_image: bufferedImage,
          output: `${outputs}`,
          regionOfInterest,
          filename: `buffer${buffer}`,
          discrete: true,
        })
      ).promise;
    }
  }

  return res;
};
const trainRFAndDownloadResults = async ({
  outputs,
  trainingPoints,
  regionOfInterest,
  paramsImage,
  outputMode,
  validationPoints,
}: RandomForestServiceParams & { outputs: string }) => {
  const { classified_image, classifier, validations } =
    await randomForestAndValidateService({
      trainingPoints,
      regionOfInterest,
      paramsImage,
      outputMode,
      validationPoints,
    });
  await outputRFResults({
    outputs,
    classified_image,
    validations,
    trainingPoints,
    validationPoints,
    regionOfInterest,
  });
  return { classifier, classified_image, regionOfInterest };
};
const outputRFResults = async ({
  outputs,
  classified_image,
  validations,
  trainingPoints,
  validationPoints,
  regionOfInterest,
}: Omit<RandomForestServiceParams, "paramsImage" | "outputMode"> & {
  outputs: string;
  classified_image: any;
  validations: classifierValidationType;
}) => {
  const outputDir = `${outputs}`;
  await mkdir(outputDir, { recursive: true });
  await printRandomForestCharts({
    classifiedImage: classified_image,
    explainedClassifier: validations.explainedClassifier,
    trainingData: trainingPoints,
    validationData: validationPoints,
    output: outputDir,
  });
  validations.explainedClassifier &&
    (await writeFile(
      `${outputDir}/trained.json`,
      JSON.stringify(validations.explainedClassifier, null, 4)
    ));
  const { promise } = await downloadClassifiedImage({
    classified_image,
    regionOfInterest,
    output: outputDir,
  });
  return promise;
};
