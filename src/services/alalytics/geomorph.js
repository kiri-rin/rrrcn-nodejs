const DATASET_ID = "projects/sat-io/open-datasets/Geomorpho90m";
const util = require("util");
const vars = ["cti", "tri", "slope", "vrm", "roughness", "tpi", "spi"];
const calcCollection = (regions, dataset, band) =>
  ee
    .ImageCollection(dataset)
    .filterBounds(regions)
    .map((it) =>
      it.reduceRegions(regions, ee.Reducer.first().setOutputs([band]))
    )
    .flatten()
    .getInfo();
module.exports = (regions) => {
  let res = {};
  for (let band of vars) {
    res[band] = ee
      .ImageCollection(`projects/sat-io/open-datasets/Geomorpho90m/${band}`)
      .filterBounds(regions)
      .map((it) =>
        it.reduceRegions(regions, ee.Reducer.first().setOutputs([band]))
      )
      .flatten()
      .getInfo();
  }
  res.geom = ee
    .Image("projects/rrrcn2022/assets/geomorph-geom")
    .reduceRegions(regions, ee.Reducer.first().setOutputs(["geom"]))
    .getInfo();
  return Object.values(res)
    .map((it) => it.features)
    .flat();
};
