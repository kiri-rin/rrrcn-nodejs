import { MaxentConfig, RandomForestConfig } from "../../analytics_config_types";

import { evaluatePromisify } from "../../utils/ee-image";
import { EEFeatureCollection, EEImage } from "../../types";
import {
  classifierValidationType,
  validateClassifier,
} from "../random-forest/all-validations";

type MaxentServiceParams = {
  trainingPoints: any;
  validationPoints: any;
  regionOfInterest: any;
  paramsImage: any;
  outputMode: MaxentConfig["outputMode"];
};
export const maxentAndValidateService = async ({
  trainingPoints,
  validationPoints,
  paramsImage,
  outputMode,
}: MaxentServiceParams) => {
  const trainingSamples = paramsImage.sampleRegions({
    collection: trainingPoints,
    properties: ["Presence"],
    scale: 100,
  });

  const { classified_image, classifier } = await getMaxentClassifier({
    trainingSamples,
    outputMode,
    paramsImage,
  });

  const validations = (await validateClassifier(
    classified_image,
    validationPoints,
    trainingPoints
  )) as classifierValidationType;
  console.log("PRE EVALUEAT");
  validations.explainedClassifier = await evaluatePromisify(
    classifier.explain()
  );
  console.log("EVALUATE SUCCESS");
  return {
    classified_image,
    classifier,
    validations,
  };
};
export const getMaxentClassifier = async ({
  trainingSamples,
  outputMode,
  paramsImage,
}: {
  trainingSamples: EEFeatureCollection;
  paramsImage: EEImage;
  outputMode: MaxentConfig["outputMode"];
}) => {
  const classifier = ee.Classifier.amnhMaxent()
    .setOutputMode(outputMode)
    .train({
      features: trainingSamples,
      classProperty: "Presence",
      inputProperties: paramsImage.bandNames(),
    });

  const classified_image = paramsImage
    .select(paramsImage.bandNames())
    .classify(classifier)
    .select("probability")
    .rename("classification")
    .multiply(100)
    .round();
  return { classified_image, classifier };
};
