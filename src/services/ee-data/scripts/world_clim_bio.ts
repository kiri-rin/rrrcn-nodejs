import { EEFeatureCollection } from "../../../types";
import { AnalyticsScriptParams } from "../index";

export const worldClimBioScript = ({
  regions,
  bands,
}: AnalyticsScriptParams) => {
  const dataset = ee.Image("WORLDCLIM/V1/BIO");

  return {
    clim_bio: bands ? dataset.select(bands) : dataset,
  };
};
