const ee = require("@google/earthengine");
const key = require("../.local/ee-key.json");
const allScripts = require("./services/alalytics");
const {
  importPointsFromCsv,
  exportFeatureCollectionsToCsv,
} = require("./services/data/points");
const fs = require("fs/promises");
const util = require("util");
const { parse } = require("csv-parse/sync");
globalThis.ee = ee;
const analysis = ["elevation", "geomorph"];
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
  for (let script of analysis) {
    const features = allScripts[script](points);
    await fs.mkdir(`./.local/outputs`, { recursive: true });
    await fs.writeFile(
      `./.local/outputs/${script}.csv`,
      exportFeatureCollectionsToCsv(features)
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
  (r) => {
    console.log(r);
  }
);
