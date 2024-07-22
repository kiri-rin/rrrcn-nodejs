import { AnalyticsScript, AnalyticsScriptResult } from "../index";
import { EEFeatureCollection, EEImage } from "../../../types";
import {
  dateIntervalsToConfig,
  DatesConfig,
} from "@rrrcn/common/src/utils/dates";
import { mergeDateIntervalsFilters } from "../../../utils/ee-image-collection";

export const ndviEviScript = ({
  regions,
  datesConfig = dateIntervalsToConfig([]),
  bands = ["NDVI", "EVI"],
}: {
  regions: EEFeatureCollection;
  datesConfig?: DatesConfig;
  bands?: string[];
}) => {
  const collection = ee.ImageCollection("MODIS/006/MOD13A1");
  const res: AnalyticsScriptResult = {};
  console.error(datesConfig);

  Object.entries(datesConfig || {}).forEach(([key, intervals], index) => {
    console.error({ key, intervals });
    const period_available = mergeDateIntervalsFilters(collection, intervals)
      .filterBounds(regions)
      .select(bands)
      .map((it: EEImage) => it.divide(10000));
    const image = period_available.reduce(ee.Reducer.mean());
    res[`${bands.join("_")}_${key}`] = image.rename(
      image.bandNames().map((name: any) => ee.String(name).cat(`_${key}`))
    );
  });

  return res;
};
