import {
  DataExtractionConfig,
  ScriptConfig,
} from "../../analytics_config_types2";
import { importGeometries } from "../../services/utils/import-geometries";
import {
  reduceRegionsFromImageOrCollection,
  writeScriptFeaturesResult,
} from "../../services/utils/io";
import { EEFeature } from "../../types";
import allScripts, { scriptKey } from "../../services/ee-data";
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
  const { defaultScriptParams, points: pointsConfig, scripts } = config;

  const points = await importGeometries(pointsConfig);

  const scriptObjects = setDefaultsToScriptsConfig(config);

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
    });

    for (let [key, imageOrCollection] of Object.entries(scriptResults)) {
      scriptResults[key] = await reduceRegionsFromImageOrCollection(
        regions,
        imageOrCollection,
        scale,
        [key],
        mode
      );
    }

    await writeScriptFeaturesResult(
      scriptResults,
      `./.local/outputs/${outputs}/${filename || script}.csv`
    );
  }
};
