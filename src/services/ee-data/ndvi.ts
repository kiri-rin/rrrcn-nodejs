import { AnalyticsScript, AnalyticsScriptResult } from "./index";
import { EEFeatureCollection, EEImage } from "../../types";
import { DatesConfig } from "../utils/dates";
import { mergeDateIntervalsFilters } from "../utils/ee-image-collection";

export const ndviEviScript = (
  regions: EEFeatureCollection,
  dateIntervals: DatesConfig,
  bands: string[] = ["NDVI", "EVI"]
) => {
  const collection = ee.ImageCollection("MODIS/006/MOD13A1");
  const res: AnalyticsScriptResult = {};

  Object.entries(dateIntervals).forEach(([key, intervals], index) => {
    const period_available = mergeDateIntervalsFilters(collection, intervals)
      .filterBounds(regions)
      .select(bands)
      .map((it: EEImage) => it.divide(10000));
    res[`${bands.join("_")}_${key}`] = period_available.reduce(
      ee.Reducer.mean()
    );
  });

  return res;
};
