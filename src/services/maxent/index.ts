import { evaluatePromisify } from "../../utils/ee-image";
import { EEFeatureCollection, EEImage } from "../../types";
import {
  classifierValidationType,
  validateClassifier,
} from "../random-forest/all-validations";
export type MaxentServiceParams = {
  trainingPoints: any;
  validationPoints: any;
  regionOfInterest: any;
  paramsImage: any;
};
export const maxentAndValidateService = async ({
  trainingPoints,
  validationPoints,
  paramsImage,
}: MaxentServiceParams) => {
  const trainingSamples = paramsImage.sampleRegions({
    collection: trainingPoints,
    properties: ["Presence"],
    scale: 100,
  });
  // console.log(await evaluatePromisify(paramsImage), "PARAMS IMAGE");
  // console.log(
  //   inspect(await evaluatePromisify(trainingPoints), false, null, true),
  //   "TRAINING"
  // );

  const { classified_image, classifier } = await getMaxentClassifier({
    trainingSamples,
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
  paramsImage,
}: {
  trainingSamples: EEFeatureCollection;
  paramsImage: EEImage;
}) => {
  const classifier = ee.Classifier.amnhMaxent({
    addAllSamplesToBackground: true,
  }).train({
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
