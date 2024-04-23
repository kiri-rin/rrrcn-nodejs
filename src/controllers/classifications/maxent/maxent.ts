import { mkdir, writeFile } from "fs/promises";
import { printMaxentCharts } from "../../../services/maxent/charts";
import { importGeometries } from "../../../utils/import-geometries";
import { MaxentConfig } from "../../../analytics_config_types";
import {
  downloadClassifiedImage,
  getAllPoints,
  getParamsImage,
  getTrainingValidationPointsPare,
} from "../random-forest/utils";
import { maxentAndValidateService } from "../../../services/maxent";
import { maxentCV } from "./cross-validation-maxent";
import { ClassificationControllerResult } from "../types";

export const maxent = async (
  config: MaxentConfig
): Promise<ClassificationControllerResult | undefined> => {
  const {
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
  if (config.backgroundCount) {
    const randomGrid = ee.FeatureCollection.randomPoints(
      regionOfInterest,
      config.backgroundCount
    );
    raw_points = raw_points.merge(
      randomGrid.map((it: any) => it.set("Presence", 0))
    );
  }
  const paramsImage = await getParamsImage({
    params,
    regionOfInterest,
  });
  const { trainingPoints, validationPoints } = getTrainingValidationPointsPare(
    raw_points,
    validationConfig
  );

  console.log("processing maxent");
  strapiLogger("processing maxent");
  const { classified_image, classifier, validations } =
    await maxentAndValidateService({
      trainingPoints,
      regionOfInterest,
      paramsImage,
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
  if (config.classificationSplits?.length) {
    for (let split of config.classificationSplits) {
      const splittedImage = classified_image.gte(split);
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
  return {
    classifier,
    classified_image,
    regionOfInterest,
    geojson_geometries: [],
  };
};
