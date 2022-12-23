import { scriptKey } from "./services/alalytics";
import {
  dateIntervalsToConfig,
  DatesConfig,
  getDateIntervals,
} from "./services/utils/dates";

export type analyticsConfigType = {
  pointsCsvPath: string;
  buffer: number;
  scripts: scriptKey[];
  dates: DatesConfig;
  outputs: string;
};
// export const analyticsConfig: analyticsConfigType = {
//   pointsCsvPath: "./src/static/Saker-Sterv2010-2022.csv",
//   buffer: 2000,
//   scripts: ["ndvi", "evi"],
//   dates: {
//     aprils_2005_2010: getDateIntervals([[2005, 2010]], [[3, 3]], [[1, "end"]]),
//     marches_2005_2010: getDateIntervals([[2005, 2010]], [[4, 4]], [[1, "end"]]),
//     junes_2005_2010: getDateIntervals([[2005, 2010]], [[5, 5]], [[1, "end"]]),
//     julies_2005_2010: getDateIntervals([[2005, 2010]], [[6, 6]], [[1, "end"]]),
//     augusts_2005_2010: getDateIntervals([[2005, 2010]], [[7, 7]], [[1, "end"]]),
//     aprils_2017_2022: getDateIntervals([[2017, 2022]], [[3, 3]], [[1, "end"]]),
//     marches_2017_2022: getDateIntervals([[2017, 2022]], [[4, 4]], [[1, "end"]]),
//     junes_2017_2022: getDateIntervals([[2017, 2022]], [[5, 5]], [[1, "end"]]),
//     julies_2017_2022: getDateIntervals([[2017, 2022]], [[6, 6]], [[1, "end"]]),
//     augusts_2017_2022: getDateIntervals([[2017, 2022]], [[7, 7]], [[1, "end"]]),
//   },
//   outputs: "saker-sterv",
// };
// export const analyticsConfig: analyticsConfigType = {
//   pointsCsvPath: "./src/static/Saker-Sterv2010-2022.csv",
//   buffer: 2000,
//   scripts: ["dynamic_world_means"],
//   dates: {
//     means_2017: getDateIntervals([[2017, 2017]], [[3, 7]], [[1, "end"]]),
//     means_2018: getDateIntervals([[2018, 2018]], [[3, 7]], [[1, "end"]]),
//     means_2019: getDateIntervals([[2019, 2019]], [[3, 7]], [[1, "end"]]),
//     means_2020: getDateIntervals([[2020, 2020]], [[3, 7]], [[1, "end"]]),
//     means_2021: getDateIntervals([[2021, 2021]], [[3, 7]], [[1, "end"]]),
//     means_2022: getDateIntervals([[2022, 2022]], [[3, 7]], [[1, "end"]]),
//   },
//   outputs: "saker-sterv",
// };
export const analyticsConfig: analyticsConfigType = {
  pointsCsvPath: "./src/static/Saker-Sterv2010-2022.csv",
  buffer: 0,
  scripts: ["global_wind_atlas", "world_clim_bio"],
  dates: {},
  outputs: "saker-sterv",
};
