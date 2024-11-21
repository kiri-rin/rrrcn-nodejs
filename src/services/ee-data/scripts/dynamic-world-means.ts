import { AnalyticsScriptResult } from "../index";
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

export const dynamicWorldMeansScript = ({
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
      res[`${target}_${key}`] = ee
        .ImageCollection(
          intervals.map((interval) => {
            const [startDate, endDate] = interval.map((it) => ee.Date(it));
            let period_available = collection
              .filterDate(startDate, endDate)
              .filterBounds(regions)
              .select("label");
            return ee.Image(
              ee.Algorithms.If(
                period_available.size().gt(0),
                period_available
                  .reduce(ee.Reducer.mode())
                  .eq(target_index)
                  .selfMask()
                  .multiply(areaPerPixel)
                  .divide(1e6),
                ee.Image(-1)
              )
            );
          })
        )
        .reduce(ee.Reducer.mean());
    });
  }
  return res;
};
