import { scriptKey } from "./services/ee-data";
import {
  dateIntervalsToConfig,
  DatesConfig,
  getDateIntervals,
} from "./services/utils/dates";
export type ScriptConfig = {
  key: scriptKey;
  filename?: string;
  dates?: DatesConfig;
  buffer?: number;
  outputs?: string;
  scale?: number;
  bands?: string[];
};
export type analyticsConfigType = {
  pointsCsvPath: string;

  scripts: ScriptConfig[] | scriptKey[];
  buffer?: number;
  dates: DatesConfig;
  outputs: string;
  scale?: number;
} & (
  | { regionOfInterestCsvPath: string; randomForest: true }
  | { randomForest?: false }
);
const ndviEviDates = {
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
// export const analyticsConfig: analyticsConfigType = {
//   pointsCsvPath: "./src/static/Saker-Sterv2010-2022.csv",
//   buffer: 0,
//   scripts: ["global_wind_atlas", "world_clim_bio"],
//   dates: {},
//   outputs: "saker-sterv",
// };
//
// export const analyticsConfig: analyticsConfigType = {
//   pointsCsvPath: "./src/static/randoms.csv",
//   buffer: 2000,
//   dates: {},
//   scripts: [2017,2018,2019,2020, 2021, 2022]
//     .map(
//       (year) =>
//         ({
//           key: "dynamic_world",
//           scale: 100,
//           filename: `dynamic_world_${year}`,
//           dates: dateIntervalsToConfig(
//             getDateIntervals([[year, year]], [[3, 7]], [[1, "end"]])
//           ),
//         } as ScriptConfig)
//     )
//     .concat([
//       {
//         key: "dynamic_world_means",
//         scale: 100,
//         dates: {
//           means_2017: getDateIntervals([[2017, 2017]], [[3, 7]], [[1, "end"]]),
//           means_2018: getDateIntervals([[2018, 2018]], [[3, 7]], [[1, "end"]]),
//           means_2019: getDateIntervals([[2019, 2019]], [[3, 7]], [[1, "end"]]),
//           means_2020: getDateIntervals([[2020, 2020]], [[3, 7]], [[1, "end"]]),
//           means_2021: getDateIntervals([[2021, 2021]], [[3, 7]], [[1, "end"]]),
//           means_2022: getDateIntervals([[2022, 2022]], [[3, 7]], [[1, "end"]]),
//         },
//       },
//       { key: "ndvi", dates: ndviEviDates, scale: 100 },
//       { key: "evi", dates: ndviEviDates, scale: 100 },
//       { key: "elevation" },
//       { key: "global_wind_atlas" },
//       { key: "era5_monthly" },
//       { key: "world_clim_bio" },
//       { key: "global_habitat" },
//       { key: "geomorph" },
//       { key: "world_cover", scale: 10 },
//       { key: "world_cover_convolve", scale: 10 },
//     ]),
//   outputs: "randoms",
// };
export const analyticsConfig: analyticsConfigType = {
  pointsCsvPath: "./src/static/artificialnests.csv",
  buffer: 1430,
  dates: {},
  scripts: [2020, 2021, 2022]
    .map(
      (year) =>
        ({
          key: "dynamic_world",
          scale: 100,
          filename: `dynamic_world_${year}`,
          dates: dateIntervalsToConfig(
            getDateIntervals([[year, year]], [[3, 7]], [[1, "end"]])
          ),
        } as ScriptConfig)
    )
    .concat([
      {
        key: "ndvi",
        dates: dateIntervalsToConfig(
          getDateIntervals([[2020, 2022]], [[3, 6]], [[1, "end"]])
        ),
        scale: 100,
      },
      {
        key: "evi",
        dates: dateIntervalsToConfig(
          getDateIntervals([[2020, 2022]], [[3, 6]], [[1, "end"]])
        ),
        scale: 100,
      },
    ]),
  outputs: "artificialnests",
};
// export const analyticsConfig: analyticsConfigType = {
//   // pointsCsvPath: "./src/static/Random_forest/Saker_Sterv2010-2022/NEOPHRON.csv",
//   // pointsCsvPath: "./src/static/Random_forest/Saker_Sterv2010-2022/NEOPHRON.csv",
//   pointsCsvPath: "./src/static/Random_forest/Saker_Sterv_Tuva/SAKER.csv",
//   buffer: 0,
//   scripts: [
//     { key: "elevation" },
//     {
//       key: "geomorph",
//       bands: ["cti", "slope", "aspect", "vrm", "tpi", "spi", "geom"],
//     },
//     {
//       key: "global_wind_atlas",
//       bands: ["wind_speed_50", "power_density_10", "RIX"],
//     },
//     {
//       key: "global_habitat",
//       bands: ["cov", "corr", "entropy", "homogeneity", "pielou", "range"],
//     },
//     {
//       key: "world_clim_bio",
//       bands: [
//         "bio02",
//         "bio03",
//         "bio06",
//         "bio07",
//         "bio08",
//         "bio14",
//         "bio15",
//         "bio19",
//       ],
//     },
//     {
//       key: "ndvi",
//       scale: 100,
//       dates: {
//         summer_2022: getDateIntervals([[2022, 2022]], [[4, 4]], [[1, "end"]]),
//       },
//     },
//     {
//       key: "evi",
//       scale: 100,
//       dates: {
//         summer_2022: getDateIntervals([[2022, 2022]], [[4, 4]], [[1, "end"]]),
//       },
//     },
//     { key: "world_cover", scale: 10 },
//     {
//       key: "world_cover_convolve",
//       scale: 10,
//       bands: [
//         "Tree_cover",
//         "Shrubland",
//         "Grassland",
//         "Cropland",
//         "Bare_sparse_vegetation",
//       ],
//     },
//     // world_cover_convolve: {
//     //   scale: 10,
//     // },
//   ],
//
//   dates: dateIntervalsToConfig([]),
//   outputs: `saker-tuva-RF_FINAL`,
//   randomForest: true,
//   regionOfInterestCsvPath:
//     "./src/static/Random_forest/Saker_Sterv_Tuva/region-of-interest.csv",
//   // regionOfInterestCsvPath: "./src/static/Random_forest/Saker_Sterv2010-2022/region-of-interest.csv",
// };
