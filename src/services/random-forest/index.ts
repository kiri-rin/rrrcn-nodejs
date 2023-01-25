import { getRFClassifier } from "../../controllers/random-forest/utils";
import { randomForestConfig } from "../../analytics_config_types2";
import { validateClassifier } from "./all-validations";

type RandomForestServiceParams = {
  trainingSamples: any;
  validationPoints: any;
  regionOfInterest: any;
  paramsImage: any;
  outputMode: randomForestConfig["outputMode"];
};
export const randomForestAndValidateService = async ({
  trainingSamples,
  validationPoints,
  paramsImage,
  outputMode,
}: RandomForestServiceParams) => {
  const { classified_image, classifier } = await getRFClassifier({
    trainingSamples,
    outputMode,
    paramsImage,
  });
  const validations = validateClassifier(
    classified_image,
    validationPoints,
    trainingSamples
  );
  return { classified_image, classifier, validations };
};
