import { analyticsConfigType } from "../analytics_config_types";
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
import { importPointsFromCsv } from "../services/utils/import-geometries";
export const main = async (analyticsConfig: analyticsConfigType) => {
  const {
    dates: defaultDates,
    scripts,
    id_key,
    latitude_key,
    longitude_key,
    pointsCsvPath,
    buffer: defaultBuffer,
    outputs: defaultOutput,
    scale: defaultScale,
    mode: defaultMode,
  } = analyticsConfig;

  const pointsRaw = await fs.readFile(pointsCsvPath);
  const pointsParsed = parse(pointsRaw, { delimiter: ",", columns: true });
  const points = importPointsFromCsv({
    csv: pointsParsed,
    lat_key: latitude_key || "Latitude",
    long_key: longitude_key || "Longitude",
    id_key: id_key || "id",
  });

  const scriptObjects = scripts.map((it) =>
    typeof it === "string" ? { key: it } : it
  );
  for (let {
    key: script,
    dates,
    buffer,
    bands,
    scale,
    outputs,
    filename,
    mode,
  } of scriptObjects) {
    let scriptDates = dates === undefined ? defaultDates : dates;
    let scriptBuffer = buffer === undefined ? defaultBuffer : buffer;
    let scriptOutput = outputs === undefined ? defaultOutput : outputs;
    let scriptScale = scale === undefined ? defaultScale : scale;
    let scriptMode = mode || defaultMode || "SUM";
    const regions = scriptBuffer
      ? points.map((it: EEFeature) => it.buffer(scriptBuffer))
      : (points as EEFeatureCollection);
    const scriptResults = await allScripts[script as keyof typeof allScripts]({
      regions,
      datesConfig: scriptDates,
      bands,
    });
    for (let [key, imageOrCollection] of Object.entries(scriptResults)) {
      scriptResults[key] = await reduceRegionsFromImageOrCollection(
        regions,
        imageOrCollection,
        scriptScale,
        [key],
        scriptMode
      );
    }

    await writeScriptFeaturesResult(
      scriptResults,
      `./.local/outputs/${scriptOutput}/${filename || script}.csv`
    );
  }
};
