import { EEFeatureCollection, EEImage } from "../../types";
import { AnalyticsScriptResult } from "../alalytics";
import { setTimeout } from "timers";

export async function evaluateScriptResultsToFeaturesArray(
  scriptResults: AnalyticsScriptResult
) {
  return (
    (
      await Promise.allSettled(
        Object.entries(scriptResults).map(([key, it]) => {
          console.log("Processing", key);
          return getFeatures(it).then((it) => {
            console.log("Success", key);
            return it;
          });
        })
      )
    ).filter((it) => it.status === "fulfilled") as PromiseFulfilledResult<any>[]
  )
    .map((it) => it.value)
    .flat();
}
export async function evaluateScriptResultsToFeaturesArrayByOne(
  scriptResults: AnalyticsScriptResult
) {
  const res = [];
  for (let [key, it] of Object.entries(scriptResults)) {
    console.log("Processing", key);

    res.push(
      await getFeatures(it).then((it) => {
        console.log("Success", key);
        return it;
      })
    );
    console.log("YES", key);
  }
  return res.flat();
}
export async function getFeatures(featureCollection: EEFeatureCollection) {
  return evaluatePromisify(featureCollection).then((it: any) => it.features);
}
export async function evaluatePromisify(image: EEImage, shouldRetry = 5) {
  return new Promise((resolve, reject) => {
    try {
      image.evaluate(async (res: string, error: string) => {
        if (error) {
          console.log(error);
          if (error.includes("ECONNRESET") && shouldRetry) {
            console.log("RETRYING");
            const res = await evaluatePromisify(
              image,
              shouldRetry > 0 ? shouldRetry - 1 : 0
            );
            resolve(res);
          } else {
            reject(error);
          }
        }
        resolve(res);
      });
    } catch (e) {
      console.log("CONNECTION", e);
      reject(e);
    }
  });
}
