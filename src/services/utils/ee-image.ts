import { EEFeatureCollection, EEImage } from "../../types";
import { AnalyticsScriptResult } from "../ee-data";
import { clearTimeout, setTimeout } from "timers";
const { setTimeout: setTimeoutPromise } = require("timers/promises");

export async function evaluateScriptResultsToFeaturesArray(
  scriptResults: AnalyticsScriptResult
) {
  const success = [];
  const errors = [];
  return (
    (
      await Promise.allSettled(
        Object.entries(scriptResults).map(([key, it]) => {
          console.log("Processing", key);
          return getFeatures(it).then((_it) => {
            console.log("Success", key);
            return _it;
          });
        })
      )
    ).filter((it) => it.status === "fulfilled") as PromiseFulfilledResult<any>[]
  )
    .map((it) => it.value)
    .flat();
}

export async function getFeatures(featureCollection: EEFeatureCollection) {
  return evaluatePromisify(featureCollection).then((it: any) => it.features);
}
export async function evaluatePromisify(
  image: EEImage,
  shouldRetry = 10,
  _timeout = 200000
) {
  return new Promise((resolve, reject) => {
    try {
      let isRetrying = false;
      const timeout = setTimeout(() => {
        console.log("RETRYING BY TIMEOUT");
        isRetrying = true;
        evaluatePromisify(image, shouldRetry > 0 ? shouldRetry - 1 : 0)
          .then((_res) => resolve(_res))
          .catch((e) => reject(e));
      }, _timeout);
      image.evaluate(async (res: string, error: string) => {
        if (error) {
          console.log(error);
          if (
            (error.includes("ECONNRESET") ||
              error.includes("socket hang up") ||
              error.includes("ECONNREFUSED")) &&
            shouldRetry &&
            !isRetrying
          ) {
            await setTimeoutPromise(5000);
            console.log("RETRYING");

            evaluatePromisify(image, shouldRetry > 0 ? shouldRetry - 1 : 0)
              .then((_res) => resolve(_res))
              .catch((e) => reject(e));
          } else {
            clearTimeout(timeout);
            !isRetrying && reject(error);
          }
        } else {
          clearTimeout(timeout);
          resolve(res);
        }
      });
    } catch (e) {
      console.log("CONNECTION", e);
      reject(e);
    }
  });
}
