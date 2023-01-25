import { AnalyticsScriptParams, AnalyticsScriptResult } from "../index";
import { EEFeatureCollection, EEImage } from "../../../types";

const DATASET_ID = "projects/sat-io/open-datasets/Geomorpho90m";
const NASADEM_DATASET_ID = "NASA/NASADEM_HGT/001";
const vars = ["cti", "tri", "slope", "vrm", "roughness", "tpi", "spi"];

export const geomorphScript = ({ regions, bands }: AnalyticsScriptParams) => {
  let res: AnalyticsScriptResult = {};
  const bandsArray = bands || vars;
  for (let band of bandsArray) {
    res[band] = ee
      .ImageCollection(`projects/sat-io/open-datasets/Geomorpho90m/${band}`)
      .filterBounds(regions)
      .reduce(ee.Reducer.firstNonNull().setOutputs([band]))
      .select([0], [band]);
  }
  if (!bands || bandsArray.includes("geom")) {
    res.geom = ee
      .Image("projects/rrrcn2022/assets/geomorph-geom")
      .select([0], ["geom"]);
  }
  if (!bands || bandsArray.includes("aspect")) {
    res.aspect = ee.Terrain.aspect(
      ee.Image(NASADEM_DATASET_ID).select(["elevation"])
    ).select("aspect");
  }
  return res;
};
