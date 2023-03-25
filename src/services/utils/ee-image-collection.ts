import { EEImageCollection } from "../../types";
import { DateInterval } from "./dates";

export const mergeDateIntervalsFilters = (
  collection: EEImageCollection,
  intervals: DateInterval[] = []
) => {
  console.error({ intervals });
  return intervals.reduce((acc, interval) => {
    const [startDate, endDate] = interval.map((it) => ee.Date(it));
    acc = acc.merge(collection.filterDate(startDate, endDate));
    return acc;
  }, ee.ImageCollection([]));
};
