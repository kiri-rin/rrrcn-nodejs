import {
  dateIntervalsToConfig,
  DatesConfig,
} from "@rrrcn/common/src/utils/dates";
import { EEFeatureCollection, EEImage } from "../../../types";
import { AnalyticsScriptResult } from "../index";
import { mergeDateIntervalsFilters } from "../../../utils/ee-image-collection";

export const alosScript = ({
  regions,
  datesConfig = dateIntervalsToConfig([]),
}: {
  regions: EEFeatureCollection;
  datesConfig?: DatesConfig;
}) => {
  const collection = ee.ImageCollection("JAXA/ALOS/PALSAR/YEARLY/SAR");
  const res: AnalyticsScriptResult = {};

  Object.entries(datesConfig).forEach(([key, intervals], index) => {
    const period_available = mergeDateIntervalsFilters(collection, intervals)
      .filterBounds(regions)
      .select(["HH", "HV"]);
    const median = period_available.median();
    res[`alos_${key}`] = median.rename(
      median.bandNames().map((name: any) => ee.String(name).cat(`_${key}`))
    );
  });

  return res;
};
