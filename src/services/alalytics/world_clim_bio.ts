import { EEFeatureCollection } from "../../types";

export const worldClimBioScript = (regions: EEFeatureCollection) => {
  const dataset = ee.Image("WORLDCLIM/V1/BIO");

  return {
    clim_bio: dataset.reduceRegions(regions, ee.Reducer.first()),
  };
};
