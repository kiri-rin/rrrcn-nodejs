const DATASET_ID = "NASA/NASADEM_HGT/001";

export const elevationScript = (regions: typeof ee.FeatureCollection) => {
  var dataset = ee.Image(DATASET_ID);
  var elevation = dataset.select(["elevation"]);

  return {
    elevation: elevation.reduceRegions(
      regions,
      ee.Reducer.first().setOutputs(["elevation"])
    ),
  };
};
