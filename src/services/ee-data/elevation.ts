const DATASET_ID = "NASA/NASADEM_HGT/001";

export const elevationScript = (regions: typeof ee.FeatureCollection) => {
  const dataset = ee.Image(DATASET_ID);
  const elevation = dataset.select(["elevation"]);

  return {
    elevation: elevation,
  };
};
