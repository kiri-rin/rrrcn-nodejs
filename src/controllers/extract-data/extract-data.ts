import {
  DataExtractionConfig,
  ScriptConfig,
} from "../../analytics_config_types";
import { importGeometries } from "../../services/utils/import-geometries";
import {
  reduceRegionsFromImageOrCollection,
  writeScriptFeaturesResult,
} from "../../services/utils/io";
import { EEFeature } from "../../types";
import allScripts, { scriptKey } from "../../services/ee-data";
import { getParamsImage } from "../random-forest/utils";
import { mkdir } from "fs/promises";
export const setDefaultsToScriptsConfig = (
  config: Omit<DataExtractionConfig, "points">
) =>
  config.scripts.map((it) => {
    const obj = typeof it === "string" ? ({ key: it } as ScriptConfig) : it;
    for (let [key, val] of Object.entries(config?.defaultScriptParams || {})) {
      //@ts-ignore
      if (obj[key] === undefined) {
        //@ts-ignore
        obj[key] = val;
      }
    }
    console.log(obj);
    return obj;
  });

export const extractData = async (config: DataExtractionConfig) => {
  const { points: pointsConfig } = config;

  const points = await importGeometries(pointsConfig);

  const scriptObjects = setDefaultsToScriptsConfig(config);
  let results: { [p: string]: any } = {};
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
    const regions = buffer
      ? points.map((it: EEFeature) => it.buffer(buffer))
      : points;

    const scriptResults = await allScripts[script]({
      regions,
      datesConfig: dates,
      bands,
      buffer,
    });

    for (let [key, imageOrCollection] of Object.entries(scriptResults)) {
      scriptResults[key] = await reduceRegionsFromImageOrCollection(
        key === "world_cover_convolve" ? points : regions,
        imageOrCollection,
        scale,
        [key],
        mode
      );
    }
    results = Object.assign(results, scriptResults);

    if (!config.inOneFile) {
      await writeScriptFeaturesResult(
        scriptResults,
        `${outputs || config.outputs}/${filename || script}.csv`
      );
    }
  }
  await mkdir(`${config.outputs}`, { recursive: true });
  if (config.inOneFile) {
    await writeScriptFeaturesResult(
      results,
      `${config.outputs}/${config.inOneFile}.csv`
    );
  }
  return results;
};
