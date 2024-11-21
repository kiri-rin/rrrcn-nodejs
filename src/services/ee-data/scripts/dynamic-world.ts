import {
  AnalyticsScript,
  AnalyticsScriptParams,
  AnalyticsScriptResult,
} from "../index";
import { mergeDateIntervalsFilters } from "../../../utils/ee-image-collection";
import { EEFeatureCollection } from "../../../types";
import { DatesConfig } from "@rrrcn/common-types/services/api/common-body";

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

export const dynamicWorldScript = ({
  regions,
  datesConfig = {},
}: {
  regions: EEFeatureCollection;
  datesConfig?: DatesConfig;
}): AnalyticsScriptResult => {
  const areaPerPixel = ee.Image.pixelArea();

  const collection = ee.ImageCollection("GOOGLE/DYNAMICWORLD/V1");
  const res: AnalyticsScriptResult = {};

  for (let target of targets) {
    const target_index = targets.indexOf(target);
    Object.entries(datesConfig || {}).forEach(([key, intervals], index) => {
      let period_available = mergeDateIntervalsFilters(collection, intervals)
        .filterBounds(regions)
        .select("label");

      res[`${target}_${key}`] = ee.Image(
        ee.Algorithms.If(
          period_available.size().gt(0),
          period_available
            .reduce(ee.Reducer.mode())
            .eq(target_index)
            .selfMask()
            .multiply(areaPerPixel)
            .divide(1e6),
          ee.Image(-1).rename([`${target}_${key}`])
        )
      );
    });
  }
  return res;
};
