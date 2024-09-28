import { getRFClassifier } from "../../controllers/classifications/random-forest/utils";
import {
  classifierValidationType,
  validateClassifier,
} from "./all-validations";
import { evaluatePromisify } from "../../utils/ee-image";
import {RandomForestConfig} from "@rrrcn/common-types/services/api/classifications/random-forest";

export type RandomForestServiceParams = {
  trainingPoints: any;
  validationPoints: any;
  regionOfInterest: any;
  paramsImage: any;
  outputMode: RandomForestConfig["outputMode"];
};
export const randomForestAndValidateService = async ({
  trainingPoints,
  validationPoints,
  paramsImage,
  outputMode,
}: RandomForestServiceParams) => {
  const trainingSamples = paramsImage.sampleRegions({
    collection: trainingPoints,
    properties: ["Presence"],
    scale: 100,
  });
  console.log("PRE GET CLASSIFIER");

  const { classified_image, classifier } = await getRFClassifier({
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
  return { classified_image, classifier, validations };
};
