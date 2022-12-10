import {
  exportFeatureCollectionsToCsv,
  importPointsFromCsv,
} from "./services/data/points";
import allScripts from "./services/alalytics/index";
import { evaluateScriptResultsToFeaturesArray } from "./services/data/ee-image";
const ee = require("@google/earthengine");
const key = require("../.local/ee-key.json");

const fs = require("fs/promises");
const util = require("util");
const { importShapesToFeatureCollection } = require("./services/data/shapes");
const { parse } = require("csv-parse/sync");
declare global {
  let ee: any;
}

//@ts-ignore
globalThis.ee = ee;

const analysis: (keyof typeof allScripts)[] = [
  "global_habitat",
  "elevation",
  "era5_monthly",
  "geomorph",
];
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
  for (let script of analysis) {
    const features = await allScripts[script](points);
    await fs.mkdir(`./.local/outputs`, { recursive: true });
    await fs.writeFile(
      `./.local/outputs/${script}_shapes.csv`,
      exportFeatureCollectionsToCsv(
        await evaluateScriptResultsToFeaturesArray(features)
      )
    );
  }
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
