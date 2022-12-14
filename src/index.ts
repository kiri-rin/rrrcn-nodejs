import {
  exportFeatureCollectionsToCsv,
  importPointsFromCsv,
} from "./services/utils/points";
import allScripts from "./services/alalytics/index";
import { evaluateScriptResultsToFeaturesArray } from "./services/utils/ee-image";
import { importShapesToFeatureCollection } from "./services/utils/shapes";
import { EEFeatureCollection } from "./types";
import { arrayBuffer } from "stream/consumers";
import { getDateIntervals } from "./services/alalytics/dynamic-world";
const ee = require("@google/earthengine");
const key = require("../.local/ee-key.json");

const fs = require("fs/promises");
const fsCommon = require("fs");
const util = require("util");
const { parse } = require("csv-parse/sync");
declare global {
  let ee: any;
}

//@ts-ignore
globalThis.ee = ee;
type scriptKey = keyof typeof allScripts;
const analysis: scriptKey[] = [
  "global_habitat",
  "elevation",
  "era5_monthly",
  "geomorph",
];
const intervalsInMonth: [number, number | "end"][] = [
  [1, 10],
  [11, 20],
  [20, "end"],
];
const monthIntervals: [number, number][] = [
  [3, 3],
  [4, 4],
  [5, 5],
  [5, 6],
];
const years: [number, number] = [2016, 2022];
const shapesAnalysis: (keyof typeof allScripts)[] = ["dynamic_world"];
const main = async () => {
  const saker_dates_raw = await fs.readFile(
    "./src/static/saker-productive-dates.csv"
  );
  const sakerDates = parse(saker_dates_raw, { delimiter: ";", columns: true });
  const points = importPointsFromCsv({
    csv: sakerDates,
    lat_key: "latitude",
    long_key: "longitude",
    id_key: "Id",
  });
  const shapes = await importShapesToFeatureCollection(
    "./src/static/saker-buf-shape.zip"
  );
  // for (let script of analysis) {
  //   await writeScriptFeaturesResult(script,points)
  // }
  for (let script of shapesAnalysis) {
    for (let year = years[0]; year <= years[1]; year++) {
      await writeScriptFeaturesResult(
        script,
        `${script}_one_month_${year}.csv`,
        points.map((it: any) => it.buffer(1430)),
        getDateIntervals([[year, year]], monthIntervals)
      );
    }
  }
};
const writeScriptFeaturesResult = async (
  script: scriptKey,
  fileName: string = script,

  ...args: Parameters<typeof allScripts[scriptKey]>
) => {
  //@ts-ignore
  const features = await allScripts[script](...args);
  await fs.mkdir(`./.local/outputs/modes_one_month`, { recursive: true });
  const stream = fsCommon.createWriteStream(
    `./.local/outputs/modes_one_month/${fileName}`
  );
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
ee.data.authenticateViaPrivateKey(
  key,
  () => {
    ee.initialize(null, null, async () => {
      await main();
    });
  },
  (r: any) => {
    console.log(r);
  }
);
