import { EEFeature, EEFeatureCollection, EEImage } from "../types";
import { AnalyticsScriptResult } from "../services/ee-data";
import { clearTimeout, setTimeout } from "timers";
import { evaluateFeatures } from "./gee-api";

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
          strapiLogger("Processing", key);
          return getFeatures(it).then((_it) => {
            console.log("Success", key);
            strapiLogger("Success", key);
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
): Promise<any> {
  let timeoutId;
  try {
    const { promise, controller } = evaluateFeatures(image);
    timeoutId = setTimeout(() => {
      controller.abort();
    }, _timeout);
    const {
      data: { result },
    } = await promise;
    clearTimeout(timeoutId);

    return result;
  } catch (error: any) {
    strapiLogger("ERROR IN REQUEST!");
    strapiLogger(String(error));
    console.log("ERROR IN REQUEST!");
    console.log(String(error), { error });
    clearTimeout(timeoutId);
    if (
      (String(error).includes("ECONNRESET") ||
        String(error).includes("socket hang up") ||
        String(error).includes("AbortError") ||
        String(error).includes(
          "disconnected before secure TLS connection was established"
        ) ||
        String(error).includes("ECONNREFUSED")) &&
      shouldRetry
    ) {
      await setTimeoutPromise(5000);
      console.log("RETRYING");
      strapiLogger("RETRYING");
      return await evaluatePromisify(
        image,
        shouldRetry > 0 ? shouldRetry - 1 : 0
      );
    } else {
      throw error;
    }
  }
}

export const getThumbUrl = async (
  classified_image: EEImage,
  regionOfInterest?: EEFeature,
  props?: any
): Promise<string> =>
  await new Promise((resolve) =>
    classified_image.getThumbURL(
      {
        image: classified_image.select([1]),
        min: 0,
        region: regionOfInterest,
        max: 100,
        dimensions: 1000,
        palette: ["FFFFFF", "C6AC94", "8D8846", "395315", "031A00"],
        ...props,
      },
      (res: string) => {
        resolve(res as string);
      }
    )
  );
export const getTiffUrl = async (
  classified_image: EEImage,
  regionOfInterest?: EEFeature
): Promise<string> => {
  // console.log(util.inspect(ee.data.getOperation(task.id), false, null, true));

  return await new Promise((resolve) => {
    classified_image.getDownloadURL(
      {
        image: classified_image,
        maxPixels: 1e19,
        scale: 500,
        region: regionOfInterest,
      },
      (res: string) => {
        resolve(res as string);
      }
    );
  });
};
