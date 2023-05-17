import {
  AnalyticsScript,
  AnalyticsScriptParams,
  AnalyticsScriptResult,
} from "../index";
import {
  dateIntervalsToConfig,
  DatesConfig,
  getDateIntervals,
  getDefaultIntervalKey,
} from "../../../utils/dates";
import { mergeDateIntervalsFilters } from "../../../utils/ee-image-collection";
import { EEFeatureCollection } from "../../../types";

var targets = [
  "Water",
  "Trees",
  "Grass",
  "Flooded_vegetation",
  "Crops",
  "Shrub_and_scrub",
  "Built",
  "Bare",
  "Snow_and_ice",
];

export const dynamicWorldModeScript = ({
  regions,
  datesConfig = dateIntervalsToConfig([]),
}: {
  regions: EEFeatureCollection;
  datesConfig?: DatesConfig;
}): AnalyticsScriptResult => {
  const collection = ee.ImageCollection("GOOGLE/DYNAMICWORLD/V1");
  const res: AnalyticsScriptResult = {};

  Object.entries(datesConfig || {}).forEach(([key, intervals], index) => {
    let period_available = mergeDateIntervalsFilters(collection, intervals)
      .filterBounds(regions)
      .select(["label"]);

    res[`dw_${key}`] = period_available.reduce(ee.Reducer.mode());
  });
  return res;
};
