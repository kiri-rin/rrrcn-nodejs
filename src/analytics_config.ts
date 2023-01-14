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
  mode?: "MEAN" | "SUM";

  scale?: number;
  bands?: string[];
};
export type randomForestConfig = {
  crossValidation?: boolean;
  regionOfInterestCsvPath: string;
  validationPointsCsvPath?: string;
  validationSplit: number;
  outputMode: "CLASSIFICATION" | "REGRESSION" | "PROBABILITY";
};
export type analyticsConfigType = {
  pointsCsvPath: string;

  scripts: ScriptConfig[] | scriptKey[];
  buffer?: number;
  dates: DatesConfig;
  outputs: string;
  mode?: "MEAN" | "SUM";

  scale?: number;
  randomForest?: randomForestConfig;
};
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
//   dates: dateIntervalsToConfig(getDateIntervals([], [], [])),
//   mode: "MEAN",
//   buffer: 2000,
//   // scripts: [
//   //   { key: "ndvi", scale: 100 },
//   //   { key: "evi", scale: 100 },
//   // ],
//   scripts: Array(18)
//     .fill(0)
//     .map((it, index) => index + 2005)
//     .flatMap((year: any) => {
//       const dates = dateIntervalsToConfig(
//         getDateIntervals([[year, year]], [[3, 7]], [[1, "end"]])
//       );
//       return [
//         {
//           key: "era5_monthly",
//           filename: `${year}_era5_2000`,
//           dates,
//           scale: 100,
//           bands: ["temperature_2m", "skin_temperature", "total_precipitation"],
//         },
//         // { key: "evi", filename: `${year}_evi_2000.csv`, dates, scale: 100 },
//       ];
//     }, {}),
//   // dates: {
//   //   aprils_2005_2010: getDateIntervals([[2005, 2010]], [[3, 3]], [[1, "end"]]),
//   //   marches_2005_2010: getDateIntervals([[2005, 2010]], [[4, 4]], [[1, "end"]]),
//   //   junes_2005_2010: getDateIntervals([[2005, 2010]], [[5, 5]], [[1, "end"]]),
//   //   julies_2005_2010: getDateIntervals([[2005, 2010]], [[6, 6]], [[1, "end"]]),
//   //   augusts_2005_2010: getDateIntervals([[2005, 2010]], [[7, 7]], [[1, "end"]]),
//   //   aprils_2017_2022: getDateIntervals([[2017, 2022]], [[3, 3]], [[1, "end"]]),
//   //   marches_2017_2022: getDateIntervals([[2017, 2022]], [[4, 4]], [[1, "end"]]),
//   //   junes_2017_2022: getDateIntervals([[2017, 2022]], [[5, 5]], [[1, "end"]]),
//   //   julies_2017_2022: getDateIntervals([[2017, 2022]], [[6, 6]], [[1, "end"]]),
//   //   augusts_2017_2022: getDateIntervals([[2017, 2022]], [[7, 7]], [[1, "end"]]),
//   // },
//   outputs: "saker-sterv_evi_ndvi_5years_2000_2005-2009",
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
//   buffer: 0,
//   dates: {},
//   scripts: []
//     .map(
//       (year) =>
//         ({
//           key: "dynamic_world",
//           scale: 100,
//           buffer: 2000,
//
//           filename: `dynamic_world_${year}`,
//           dates: dateIntervalsToConfig(
//             getDateIntervals([[year, year]], [[3, 7]], [[1, "end"]])
//           ),
//         } as ScriptConfig)
//     )
//     .concat([
// {
//   key: "dynamic_world_means",
//   scale: 100,
//   buffer: 2000,
//
//   dates: {
//     means_2017: getDateIntervals([[2017, 2017]], [[3, 7]], [[1, "end"]]),
//     means_2018: getDateIntervals([[2018, 2018]], [[3, 7]], [[1, "end"]]),
//     means_2019: getDateIntervals([[2019, 2019]], [[3, 7]], [[1, "end"]]),
//     means_2020: getDateIntervals([[2020, 2020]], [[3, 7]], [[1, "end"]]),
//     means_2021: getDateIntervals([[2021, 2021]], [[3, 7]], [[1, "end"]]),
//     means_2022: getDateIntervals([[2022, 2022]], [[3, 7]], [[1, "end"]]),
//   },
// },
// { key: "ndvi", dates: ndviEviDates, buffer: 2000, scale: 100 },
// { key: "evi", buffer: 2000, dates: ndviEviDates, scale: 100 },
// { key: "elevation" },
// { key: "global_wind_atlas" },
// { key: "era5_monthly" },
// { key: "world_clim_bio" },
// { key: "global_habitat" },
// { key: "geomorph" },
// { key: "world_cover", scale: 10 },
// { key: "world_cover_convolve", scale: 10 },
//     ]),
//   outputs: "randoms",
// };
// export const analyticsConfig: analyticsConfigType = {
//   pointsCsvPath: "./src/static/artificialnests.csv",
//   buffer: 1430,
//   dates: {},
//   scripts: [2020, 2021, 2022]
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
//         key: "ndvi",
//         dates: dateIntervalsToConfig(
//           getDateIntervals([[2020, 2022]], [[3, 6]], [[1, "end"]])
//         ),
//         scale: 100,
//       },
//       {
//         key: "evi",
//         dates: dateIntervalsToConfig(
//           getDateIntervals([[2020, 2022]], [[3, 6]], [[1, "end"]])
//         ),
//         scale: 100,
//       },
//     ]),
//   outputs: "artificialnests",
// };
export const analyticsConfig: analyticsConfigType = {
  buffer: 0,
  scripts: [
    { key: "elevation" },
    {
      key: "geomorph",
      // bands: [
      //   "cti",
      //   // "tri",
      //   // "slope",
      //   // "aspect",
      //   "vrm",
      //   "roughness",
      //   "tpi",
      //   // "spi",
      //   "geom",
      // ],
    },
    {
      key: "global_wind_atlas",
      // bands: [
      //   "wind_speed_50",
      //   // "power_density_10",
      //   // "power_density_50",
      //   // "power_density_100",
      //   // "RIX",
      // ],
    },
    {
      key: "global_habitat",
      // bands: [
      //   "cov",
      //   // "contrast",
      //   // "corr",
      //   // "dissimilarity",
      //   // "entropy",
      //   // "maximum",
      //   "mean",
      //   // "pielou",
      //   // "homogeneity",
      //   // "range",
      //   // "shannon",
      //   "simpson",
      //   // "sd",
      //   // "variance",
      // ],
    },
    {
      key: "world_clim_bio",
      // bands: [
      //   // "bio01",
      //   "bio02",
      //   "bio03",
      //   // "bio04",
      //   "bio06",
      //   // "bio07",
      //   // "bio08",
      //   // "bio11",
      //   // "bio12",
      //   // "bio13",
      //   "bio16",
      //   // "bio19",
      // ],
    },

    {
      key: "ndvi",
      scale: 100,
      dates: {
        april_2022: getDateIntervals([[2022, 2022]], [[3, 3]], [[1, "end"]]),
        may_2022: getDateIntervals([[2022, 2022]], [[4, 4]], [[1, "end"]]),
        june_2022: getDateIntervals([[2022, 2022]], [[5, 5]], [[1, "end"]]),
        july_2022: getDateIntervals([[2022, 2022]], [[6, 6]], [[1, "end"]]),
        august_2022: getDateIntervals([[2022, 2022]], [[7, 7]], [[1, "end"]]),
      },
    },
    {
      key: "ndvi",
      scale: 100,
      buffer: 100,
      mode: "MEAN",
      dates: {
        conv_april_2022: getDateIntervals(
          [[2022, 2022]],
          [[3, 3]],
          [[1, "end"]]
        ),
      },
    },
    // {
    //   key: "evi",
    //   scale: 100,
    //   dates: {
    //     summer_2022: getDateIntervals([[2022, 2022]], [[4, 4]], [[1, "end"]]),
    //   },
    // },
    { key: "world_cover", scale: 10 },
    {
      key: "world_cover_convolve",
      scale: 10,
      bands: [
        "Tree_cover",
        "Shrubland",
        "Grassland",
        "Cropland",
        "Bare_sparse_vegetation",
      ],
    },
    // world_cover_convolve: {
    //   scale: 10,
    // },
  ],

  dates: dateIntervalsToConfig([]),
  // pointsCsvPath: "./src/static/Random_forest/Saker_Sterv2010-2022/NEOPHRON.csv",
  pointsCsvPath: "./src/static/Random_forest/Saker_Sterv2010-2022/NEOPHRON.csv",
  // pointsCsvPath: "./src/static/Random_forest/Saker_Sterv2010-2022/FALCO.csv",
  outputs: `NEOPHRON_RF_REGR_CV_ALL`,
  randomForest: {
    crossValidation: true,
    // validationPointsCsvPath:
    //   "./src/static/Random_forest/Saker_Sterv2010-2022/birds-kz-valid.csv",
    regionOfInterestCsvPath:
      "./src/static/Random_forest/Saker_Sterv2010-2022/region-of-interest.csv",
    validationSplit: 0.2,
    outputMode: "REGRESSION",
    // regionOfInterestCsvPath:
    //   "./src/static/Random_forest/Saker_Sterv2010-2022/region-of-interest.csv",
  },
};
// regionOfInterestCsvPath:
//   "./src/static/Random_forest/Saker_Sterv2010-2022/region-of-interest.csv",
// }
