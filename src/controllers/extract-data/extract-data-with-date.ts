import {
  DataExtractionConfig,
  ScriptConfig,
} from "@rrrcn/common-types/services/api/common-body";
import { importGeometries } from "../../utils/import-geometries";
import {
  reduceRegionsFromImageOrCollection,
  writeScriptFeaturesResult,
} from "../../utils/io";
import { EEFeature } from "../../types";
import allScripts from "../../services/ee-data";
import { getParamsImage } from "../classifications/random-forest/utils";
import { mkdir } from "fs/promises";
import {
  evaluatePromisify,
  evaluateScriptResultsToFeaturesArray,
} from "../../utils/ee-image";
import { scriptWithDatesFromPoints } from "../../services/ee-data/with-date-from-points";
import { importGeometriesGeojson } from "../../utils/import-geometries-geojson";
import { inspect } from "util";
import { writeFileSync } from "fs";
import { exportFeatureCollectionsToCsv } from "../../utils/points";
import { featureCollection } from "@turf/helpers";
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
    return obj;
  });

export const extractDataWithDate = async (config: DataExtractionConfig) => {
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
    const regions = points;
    const pointsWithDates = (
      await importGeometriesGeojson(pointsConfig)
    ).features.map((it: any) => ({
      ...it,
      properties: { ...it.properties, date: new Date(it.properties.date) },
    }));

    const totalRes: any = [];
    let index = 0;
    for (let point of pointsWithDates) {
      let reducedRes: any = {};
      const dateInterval: [Date, Date] = [
        new Date(point.properties.date.getTime() - 1000 * 60 * 30),
        new Date(point.properties.date.getTime() + 1000 * 60 * 30),
      ];

      const regions = ee.FeatureCollection(
        //@ts-ignore
        featureCollection([{ ...point, id: point.properties.id }])
      );
      const res = allScripts[script]({
        regions: regions,
        bands,
        buffer,
        datesConfig: {
          [`${index}_${point.properties.date.toISOString()}`]: [dateInterval],
        },
      });
      for (let [key, imageOrCollection] of Object.entries(res)) {
        reducedRes[key] = await reduceRegionsFromImageOrCollection(
          key === "world_cover_convolve" ? points : regions,
          imageOrCollection,
          scale,
          [key],
          mode
        );
      }
      const features = await evaluateScriptResultsToFeaturesArray(reducedRes);

      features.forEach(
        (f) =>
          (f.properties.date = (point.properties?.date as Date)?.toISOString())
      );
      totalRes.push(...features);
      index++;
    }
    // console.log(inspect(scriptResults, false, null, true), "scriptResults");

    // results = Object.assign(results, scriptResults);

    await writeFileSync(
      `${outputs || config.outputs}/${filename || script}.csv`,
      await exportFeatureCollectionsToCsv(totalRes)
    );
  }
  await mkdir(`${config.outputs}`, { recursive: true });
  return results;
};
