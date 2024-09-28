import { EEFeatureCollection } from "../../../types";
import { mergeDateIntervalsFilters } from "../../../utils/ee-image-collection";
import { AnalyticsScriptParams, AnalyticsScriptResult } from "../index";
import fs from "fs/promises";
import { JSCSVTable } from "../../../utils/points";
import { parse } from "csv-parse/sync";
import { DatesConfig } from "@rrrcn/common-types/services/api/common-body";

export const worldCoverTargetsKeys = {
  Tree_cover: 10,
  Shrubland: 20,
  Grassland: 30,
  Cropland: 40,
  Built_up: 50,
  Bare_sparse_vegetation: 60,
  Snow_and_ice: 70,
  Permanent_water_bodies: 80,
  Herbaceous_wetland: 90,
  Mangroves: 95,
  Moss_and_lichen: 100,
};
export const worldCoverScript = async ({ regions }: AnalyticsScriptParams) => {
  const res: AnalyticsScriptResult = {};

  const collection = ee.ImageCollection("ESA/WorldCover/v100");
  let period_available = collection.select(["Map"]);
  res[`world_cover`] = period_available
    .filterBounds(regions)
    .reduce(ee.Reducer.mode().setOutputs(["world_cover"]));
  return res;
};
