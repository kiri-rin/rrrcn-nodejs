import { getAllPoints } from "./utils";
import { validateClassifier } from "../../../services/random-forest/all-validations";
import { printRandomForestCharts } from "../../../services/random-forest/charts";
import { mkdir } from "fs/promises";

import { ValidateClassifiedImageConfig } from "@rrrcn/common-types/services/api/classifications/validate-classified-image";
export const getClassifiedImage = (
  congif: ValidateClassifiedImageConfig["classified_image"]
) => {
  switch (congif.type) {
    case "asset":
      return ee.Image(congif.path).rename(["classification"]);
    case "computedObject":
      return congif.object.rename(["classification"]);
  }
};
export const validateClassifiedImage = async (
  config: ValidateClassifiedImageConfig
) => {
  const classifiedImage = await getClassifiedImage(config.classified_image);
  const validationPoints = await getAllPoints(config.validationPoints);

  const outputDir = `./.local/outputs/${config.outputs}`;
  await mkdir(outputDir, { recursive: true });

  await printRandomForestCharts({
    classifiedImage,
    validationData: validationPoints,
    trainingData: ee.FeatureCollection([]),
    explainedClassifier: { importance: {} },
    output: outputDir,
  });
};
