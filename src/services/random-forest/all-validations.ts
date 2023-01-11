import { evaluatePromisify } from "../utils/ee-image";
import { getAcc, getAUCROC } from "./auc-roc-validation";
import { EEFeatureCollection, EEImage } from "../../types";
const regression = require("regression");

export const validateClassifier = async (
  classifier: any,
  classified_image: EEImage,
  validationData: EEFeatureCollection,
  trainingData: EEFeatureCollection
) => {
  const explainedClassifier: any = await evaluatePromisify(
    classifier.explain()
  );
  var predictedValidation = classified_image.sampleRegions({
    collection: validationData,
    geometries: true,
    scale: 100,
  });
  var predictedTraining = classified_image.sampleRegions({
    collection: trainingData,
    geometries: true,
    scale: 100,
  });
  const data_regression = regression.linear(
    //@ts-ignore
    sampleTraining.features.map(
      ({ properties: { Presence, classification } }: any) => [
        classification,
        Presence,
      ]
    )
  );
  let ROC = getAcc(predictedValidation);
  const AUC = await evaluatePromisify(getAUCROC(ROC));
  ROC = await evaluatePromisify(ROC);
  //TODO add kappa, ccr
  return { AUC, ROC, regression };
};
