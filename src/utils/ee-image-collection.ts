import { EEImageCollection } from "../types";

import { DateInterval } from "@rrrcn/common-types/services/api/common-body";

export const mergeDateIntervalsFilters = (
  collection: EEImageCollection,
  intervals: DateInterval[] = []
) => {
  console.error({ intervals });
  return intervals.reduce((acc, interval) => {
    console.log({ interval });
    const [startDate, endDate] = interval.map((it) => ee.Date(it));
    acc = acc.merge(collection.filterDate(startDate, endDate));
    return acc;
  }, ee.ImageCollection([]));
};
