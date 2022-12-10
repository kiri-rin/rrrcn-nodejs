import { EEFeatureCollection, EEImage } from "../../types";
import { AnalyticsScriptResult } from "../alalytics";

export async function evaluateScriptResultsToFeaturesArray(
  scriptResults: AnalyticsScriptResult
) {
  return (
    await Promise.all(Object.values(scriptResults).map((it) => getFeatures(it)))
  ).flat();
}
export async function getFeatures(featureCollection: EEFeatureCollection) {
  return evaluatePromisify(featureCollection).then((it: any) => it.features);
}
export async function evaluatePromisify(image: EEImage) {
  return new Promise((resolve, reject) => {
    try {
      image.evaluate((res: any) => {
        resolve(res);
      });
    } catch (e) {
      reject(e);
    }
  });
}
