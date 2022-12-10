import { AnalyticsScriptResult } from "./index";
import { EEFeatureCollection, EEImage } from "../../types";

const DATASET_ID = "projects/sat-io/open-datasets/Geomorpho90m";
const NASADEM_DATASET_ID = "NASA/NASADEM_HGT/001";

const util = require("util");
const vars = ["cti", "tri", "slope", "vrm", "roughness", "tpi", "spi"];
const calcCollection = (
  regions: EEFeatureCollection,
  dataset: string,
  band: string
) =>
  ee
    .ImageCollection(dataset)
    .filterBounds(regions)
    .map((it: EEImage) =>
      it.reduceRegions(regions, ee.Reducer.first().setOutputs([band]))
    )
    .flatten()
    .getInfo();
export const geomorphScript = (regions: EEFeatureCollection) => {
  let res: AnalyticsScriptResult = {};
  for (let band of vars) {
    res[band] = ee
      .ImageCollection(`projects/sat-io/open-datasets/Geomorpho90m/${band}`)
      .filterBounds(regions)
      .map((it: EEImage) =>
        it.reduceRegions(regions, ee.Reducer.first().setOutputs([band]))
      )
      .flatten();
  }
  res.geom = ee
    .Image("projects/rrrcn2022/assets/geomorph-geom")
    .reduceRegions(regions, ee.Reducer.first().setOutputs(["geom"]));
  res.aspect = ee.Terrain.aspect(
    ee.Image(NASADEM_DATASET_ID).select("elevation")
  ).reduceRegions(regions, ee.Reducer.first().setOutputs(["aspect"]));
  return res;
};
