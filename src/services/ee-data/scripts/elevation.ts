import { EEFeatureCollection } from "../../../types";

const DATASET_ID = "NASA/NASADEM_HGT/001";

export const elevationScript = ({
  regions,
}: {
  regions: EEFeatureCollection;
}) => {
  const dataset = ee.Image(DATASET_ID);
  const elevation = dataset.select(["elevation"]);

  return {
    elevation: elevation,
  };
};
