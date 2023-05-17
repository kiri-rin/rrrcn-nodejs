import { EEFeatureCollection, EEImage } from "../types";
const { JWT } = require("google-auth-library");
console.log({ __dirname });

const keys = require("../../../../../.local/ee-key.json");

const client = new JWT({
  email: keys.client_email,
  key: keys.private_key,
  scopes: ["https://www.googleapis.com/auth/cloud-platform"],
});
const isClearObject = (obj: any): boolean =>
  typeof obj === "object" && (!Array.isArray(obj) || isClearObject(obj[0]));
const computeTableUrl =
  "https://earthengine.googleapis.com/v1beta/projects/rrrcn2022/value:compute";
const removeUnusedFields = (serialized: { [p: string]: any }): any => {
  const res: any = Array.isArray(serialized) ? [] : {};
  for (let key of Object.keys(serialized)) {
    if (key === "Serializable$values") {
      return typeof serialized[key] !== "object"
        ? serialized[key]
        : removeUnusedFields(serialized[key]);
    }
    if (!isClearObject(serialized[key])) {
      res[key] = serialized[key];
    } else {
      if (serialized[key] !== null) {
        res[key] = removeUnusedFields(serialized[key]);
      }
    }
  }
  return res;
};
export const evaluateFeatures = (collection: EEFeatureCollection) => {
  const controller = new AbortController();

  const promise = client.request({
    url: computeTableUrl,
    method: "POST",
    data: {
      expression: removeUnusedFields(
        ee.Serializer.encodeCloudApiExpression(collection)
      ),
    },
    signal: controller.signal,
  });
  return { promise, controller };
};
export const evaluateImage = (image: EEImage) => {};
export const exportImage = (image: EEImage) => {};
export const getExportStatus = (operationName: string) => {};
