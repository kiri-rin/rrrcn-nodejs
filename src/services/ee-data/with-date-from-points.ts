import {
  AnalyticsScript,
  AnalyticsScriptParams,
  AnalyticsScriptResult,
} from "./index";
import { feature, featureCollection } from "@turf/helpers";
enum timeUnits {
  hours = "h",
  seconds = "s",
  milliseconds = "ms",
  days = "d",
}
export const scriptWithDatesFromPoints = async (
  params: Omit<AnalyticsScriptParams, "regions"> & {
    regions: GeoJSON.FeatureCollection<
      GeoJSON.GeometryObject,
      { date: Date | string }
    >;
  },
  script: AnalyticsScript,
  intervalRadius: number
): Promise<{ point: GeoJSON.Feature; res: AnalyticsScriptResult }[]> => {
  const sortedByDates = params.regions.features
    .map((it) => ({
      ...it,
      properties: { ...it.properties, date: new Date(it.properties.date) },
    }))
    .sort((a, b) =>
      a.properties.date < b.properties.date ? -1 : 1
    ) as GeoJSON.Feature<GeoJSON.GeometryObject, { date: Date }>[];
  return sortedByDates.reduce((acc, it, index) => {
    const dateInterval: [Date, Date] = [
      new Date(it.properties.date.getTime() - intervalRadius * 1000),
      new Date(it.properties.date.getTime() + intervalRadius * 1000),
    ];
    const regions = ee.FeatureCollection(
      //@ts-ignore
      featureCollection([{ ...it, id: it.properties.id }])
    );
    const dateRes = script({
      ...params,
      regions: regions,
      datesConfig: {
        [`${index}_${it.properties.date.toISOString()}`]: [dateInterval],
      },
    });
    console.log({ dateRes });
    acc.push({ point: it, res: dateRes });
    return acc;
  }, [] as { point: GeoJSON.Feature; res: AnalyticsScriptResult }[]);
};
