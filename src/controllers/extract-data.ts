import { analyticsConfigType } from "../analytics_config";
import { importPointsFromCsv } from "../services/utils/points";
import allScripts, { scriptKey } from "../services/ee-data";
import { EEFeature, EEFeatureCollection } from "../types";
import {
  reduceRegionsFromImageOrCollection,
  writeScriptFeaturesResult,
} from "../services/utils/io";
import fs from "fs/promises";
import fsCommon from "fs";
import path from "path";
import { parse } from "csv-parse/sync";
export const main = async (analyticsConfig: analyticsConfigType) => {
  const { dates, scripts, pointsCsvPath, buffer, outputs, scale } =
    analyticsConfig;

  const pointsRaw = await fs.readFile(pointsCsvPath);
  const pointsParsed = parse(pointsRaw, { delimiter: ",", columns: true });
  const points = importPointsFromCsv({
    csv: pointsParsed,
    lat_key: "Latitude",
    long_key: "Longitude",
    id_key: "id",
  });

  const scriptsKeys: scriptKey[] = Array.isArray(scripts)
    ? scripts
    : (Object.keys(scripts) as scriptKey[]);
  for (let script of scriptsKeys) {
    let scriptDates = Array.isArray(scripts)
      ? dates
      : scripts[script]?.dates || dates;
    let scriptBuffer = Array.isArray(scripts)
      ? buffer
      : scripts[script]?.buffer || buffer;
    let scriptOutput = Array.isArray(scripts)
      ? outputs
      : scripts[script]?.outputs || outputs;
    let scriptScale = Array.isArray(scripts)
      ? scale
      : scripts[script]?.scale || scale;
    const regions = scriptBuffer
      ? points.map((it: EEFeature) => it.buffer(scriptBuffer))
      : (points as EEFeatureCollection);
    const scriptResults = await allScripts[script](regions, scriptDates);
    for (let [key, imageOrCollection] of Object.entries(scriptResults)) {
      scriptResults[key] = reduceRegionsFromImageOrCollection(
        regions,
        imageOrCollection,
        scriptScale,
        [key]
      );
    }

    await writeScriptFeaturesResult(
      scriptResults,
      `${scriptOutput}/${script}.csv`
    );
  }
};
