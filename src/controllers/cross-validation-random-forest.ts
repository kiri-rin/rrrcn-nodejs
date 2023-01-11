import { analyticsConfigType } from "../analytics_config";
import {
  getPoints,
  getRegionOfInterest,
  getRFClassifier,
  setDefaultsToScriptsConfig,
} from "./random-forest";
import { EEImage } from "../types";
import { validateClassifier } from "../services/random-forest/all-validations";
type trainedModelType = {
  explained: {
    importance: { [p: string]: number };
    outOfBagErrorEstimate: number;
  };
  classified_image: EEImage;
  classified_regression: EEImage;
  AUC: number;
  R2: number;
  CCR: number;
  kappa: number;
};
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
  let raw_points = await getPoints(pointsCsvPath);
  const regionOfInterest = await getRegionOfInterest(regionOfInterestCsvPath);
  let modelsValidations: any[] = [];
  const scriptObjects = setDefaultsToScriptsConfig(analyticsConfig);

  for (let i = 0; i < 10; i++) {
    const pointsWithRandom = raw_points.randomColumn("random");

    const validationPoints = pointsWithRandom.filter(
      ee.Filter.lt("random", validationSplit)
    );
    const trainingPoints = pointsWithRandom.filter(
      ee.Filter.gte("random", validationSplit)
    );
    const { classifier, classified_image } = await getRFClassifier({
      regionOfInterest,
      scripts: scriptObjects,
      points: trainingPoints,
      outputMode,
    });
    modelsValidations.push(
      await validateClassifier(
        classifier,
        classified_image,
        validationPoints,
        trainingPoints
      )
    );
  }
};
