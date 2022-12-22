import {
  exportFeatureCollectionsToCsv,
  importPointsFromCsv,
} from "./services/utils/points";
import allScripts from "./services/alalytics";
import { evaluateScriptResultsToFeaturesArray } from "./services/utils/ee-image";
import { analyticsConfig } from "./analytics_config";
import { EEFeature, EEFeatureCollection } from "./types";
const fs = require("fs/promises");
const fsCommon = require("fs");
const { parse } = require("csv-parse/sync");
type scriptKey = keyof typeof allScripts;

const { dates, scripts, pointsCsvPath, buffer } = analyticsConfig;
export const main = async () => {
  const saker_dates_raw = await fs.readFile(pointsCsvPath);
  const sakerDates = parse(saker_dates_raw, { delimiter: ",", columns: true });
  const points = importPointsFromCsv({
    csv: sakerDates,
    lat_key: "Latitude",
    long_key: "Longitude",
    id_key: "id",
  });
  console.log(points);

  for (let script of scripts) {
    await writeScriptFeaturesResult(
      script,
      `${script}.csv`,
      buffer
        ? points.map((it: EEFeature) => it.buffer(buffer))
        : (points as EEFeatureCollection),
      dates
    );
  }
};
const writeScriptFeaturesResult = async (
  script: scriptKey,
  fileName: string = script,

  ...args: Parameters<typeof allScripts[scriptKey]>
) => {
  //@ts-ignore
  const features = await allScripts[script](...args);
  await fs.mkdir(`./.local/outputs/${analyticsConfig.outputs}`, {
    recursive: true,
  });
  const stream = fsCommon.createWriteStream(
    `./.local/outputs/${analyticsConfig.outputs}/${fileName}`
  );
  console.log({ features });
  const res = await exportFeatureCollectionsToCsv(
    await evaluateScriptResultsToFeaturesArray(features)
  );
  for (let chank of res.match(/(.|[\r\n]){1,100}/g) || []) {
    stream.write(chank);
  }
  return new Promise((resolve, reject) => {
    stream.end("", "utf-8", () => {
      console.log("finish", fileName);
      resolve(true);
    });
  });
};
