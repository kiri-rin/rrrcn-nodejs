const DATASET_ID = "NASA/NASADEM_HGT/001";

module.exports = (regions) => {
  var dataset = ee.Image(DATASET_ID);
  var elevation = dataset.select(["elevation"]);
  return elevation
    .reduceRegions(regions, ee.Reducer.first().setOutputs(["elevation"]))
    .getInfo().features;
};
