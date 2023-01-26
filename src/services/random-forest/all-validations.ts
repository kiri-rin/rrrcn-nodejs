import { evaluatePromisify } from "../utils/ee-image";
import { getAcc, getAUCROC } from "./auc-roc-validation";
import { EEFeatureCollection, EEImage } from "../../types";
const regression = require("regression");
export type classifierValidationType = {
  AUC: number;
  ROC: {
    features: {
      properties: {
        cutoff: number;
        TP: number;
        TN: number;
        FP: number;
        FN: number;
        TPR: number;
        TNR: number;
        FPR: number;
        Precision: number;
        SUMSS: number;
        ccr: number;
        kappa: number;
      };
    }[];
  };
  training_regression: { r2: number };
  validation_regression: { r2: number };
  explainedClassifier: any;
};
export const validateClassifier = async (
  classified_image: EEImage,
  validationData: EEFeatureCollection,
  trainingData: EEFeatureCollection
) => {
  const predictedValidation = classified_image.sampleRegions({
    collection: validationData,
    geometries: true,
    scale: 100,
  });
  const predictedTraining = classified_image.sampleRegions({
    collection: trainingData,
    geometries: true,
    scale: 100,
  });

  const sampleTraining = await evaluatePromisify(
    predictedTraining.select(["Presence", "classification"])
  );
  const sampleValidation = await evaluatePromisify(
    predictedValidation.select(["Presence", "classification"])
  );
  const training_regression = regression.linear(
    //@ts-ignore
    sampleTraining.features.map(
      ({ properties: { Presence, classification } }: any) => [
        classification,
        Presence,
      ]
    )
  );
  const validation_regression = regression.linear(
    //@ts-ignore
    sampleValidation.features.map(
      ({ properties: { Presence, classification } }: any) => [
        classification,
        Presence,
      ]
    )
  );
  let ROC = getAcc(predictedValidation);
  const AUC = await evaluatePromisify(getAUCROC(ROC));
  ROC = await evaluatePromisify(ROC);
  delete training_regression.points;
  delete validation_regression.points;
  return {
    AUC,
    ROC,
    training_regression,
    validation_regression,
  };
};
