import { scriptKey } from "./services/ee-data";
import {
  dateIntervalsToConfig,
  DatesConfig,
  getDateIntervals,
} from "./services/utils/dates";

export type analyticsConfigType = {
  pointsCsvPath: string;

  scripts:
    | Partial<{
        [key in scriptKey]: {
          dates?: DatesConfig;
          buffer?: number;
          outputs?: string;
          scale?: number;
        };
      }>
    | scriptKey[];
  buffer?: number;
  dates: DatesConfig;
  outputs: string;
  scale?: number;
} & (
  | { regionOfInterestCsvPath: string; randomForest: true }
  | { randomForest?: false }
);
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
// export const analyticsConfig: analyticsConfigType = {
//   pointsCsvPath: "./src/static/Saker-Sterv2010-2022.csv",
//   buffer: 0,
//   scripts: ["global_wind_atlas", "world_clim_bio"],
//   dates: {},
//   outputs: "saker-sterv",
// };
//
// export const analyticsConfig: analyticsConfigType | analyticsConfigType[] = [
//   2017, 2018, 2019, 2020, 2021, 2022,
// ].map((year) => ({
//   pointsCsvPath: "./src/static/Saker-Sterv2010-2022.csv",
//   buffer: 2000,
//   scripts: ["dynamic_world"],
//   dates: dateIntervalsToConfig(
//     getDateIntervals([[year, year]], [[3, 7]], [[1, "end"]])
//   ),
//   outputs: `saker-sterv-dw/${year}`,
// }));
export const analyticsConfig: analyticsConfigType = {
  pointsCsvPath: "./src/static/NEOPHRON.csv",
  buffer: 0,
  scripts: {
    elevation: {},
    geomorph: {},
    global_wind_atlas: {},
    global_habitat: {},
    world_clim_bio: {},
    ndvi: {
      scale: 100,
      dates: {
        summer_2022: getDateIntervals([[2022, 2022]], [[3, 7]], [[1, "end"]]),
      },
    },
    evi: {
      scale: 100,
      dates: {
        summer_2022: getDateIntervals([[2022, 2022]], [[3, 7]], [[1, "end"]]),
      },
    },
    // dynamic_world_mode: {
    //   scale: 100,
    //
    //   dates: dateIntervalsToConfig(
    //     getDateIntervals([[2017, 2017]], [[6, 6]], [[1, "end"]])
    //   ),
    // },
  },
  dates: dateIntervalsToConfig([]),
  outputs: `saker-sterv-RF_NEOPHRON`,
  // randomForest: true,
  // regionOfInterestCsvPath: "./src/static/region-of-interest.csv",
};
