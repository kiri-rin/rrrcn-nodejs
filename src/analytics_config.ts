import { scriptKey } from "./services/alalytics";
import {
  dateIntervalsToConfig,
  DatesConfig,
  getDateIntervals,
} from "./services/utils/dates";

const intervalsInMonth: [number, number | "end"][] = [
  [1, 10],
  [11, 20],
  [20, "end"],
];
const monthIntervals: [number, number][] = [
  [3, 3],
  [4, 4],
  [5, 5],
  [6, 6],
];
const yearIntervals: [number, number][] = [
  // [2010, 2011],
  // [2014, 2014],
  [2020, 2020],
];
export type analyticsConfigType = {
  pointsCsvPath: string;
  buffer: number;
  scripts: scriptKey[];
  dates: DatesConfig;
  outputs: string;
};
export const analyticsConfig: analyticsConfigType = {
  pointsCsvPath: "./src/static/Saker-Sterv2010-2022.csv",
  buffer: 2000,
  scripts: ["ndvi", "evi"],
  dates: {
    aprils_2005_2010: getDateIntervals([[2005, 2010]], [[3, 3]], [[1, "end"]]),
    marches_2005_2010: getDateIntervals([[2005, 2010]], [[4, 4]], [[1, "end"]]),
    junes_2005_2010: getDateIntervals([[2005, 2010]], [[5, 5]], [[1, "end"]]),
    julies_2005_2010: getDateIntervals([[2005, 2010]], [[6, 6]], [[1, "end"]]),
    augusts_2005_2010: getDateIntervals([[2005, 2010]], [[7, 7]], [[1, "end"]]),
    aprils_2017_2022: getDateIntervals([[2017, 2022]], [[3, 3]], [[1, "end"]]),
    marches_2017_2022: getDateIntervals([[2017, 2022]], [[4, 4]], [[1, "end"]]),
    junes_2017_2022: getDateIntervals([[2017, 2022]], [[5, 5]], [[1, "end"]]),
    julies_2017_2022: getDateIntervals([[2017, 2022]], [[6, 6]], [[1, "end"]]),
    augusts_2017_2022: getDateIntervals([[2017, 2022]], [[7, 7]], [[1, "end"]]),
  },
  outputs: "saker-sterv",
};
