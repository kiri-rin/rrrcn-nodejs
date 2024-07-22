import {
  DataExtractionConfig,
  RandomForestConfig,
} from "@rrrcn/common/src/types/services/analytics_config_types";
import { getDateIntervals } from "@rrrcn/common/src/utils/dates";
export const karatauOldFalcoAllParams: DataExtractionConfig["scripts"] = [
  // { key: "elevation" },
  // {
  //   key: "geomorph",
  // },
  //
  // {
  //   key: "global_habitat",
  // },
  // {
  //   key: "global_wind_atlas",
  // },
  // {
  //   key: "world_clim_bio",
  // },
  //
  // {
  //   key: "evi",
  //   scale: 100,
  //   dates: {
  //     april_2022: getDateIntervals([[2022, 2022]], [[3, 3]], [[1, "end"]]),
  //     may_2022: getDateIntervals([[2022, 2022]], [[4, 4]], [[1, "end"]]),
  //     june_2022: getDateIntervals([[2022, 2022]], [[5, 5]], [[1, "end"]]),
  //     july_2022: getDateIntervals([[2022, 2022]], [[6, 6]], [[1, "end"]]),
  //     august_2022: getDateIntervals([[2022, 2022]], [[7, 7]], [[1, "end"]]),
  //   },
  // },
  // {
  //   key: "evi",
  //   scale: 100,
  //   buffer: 100,
  //   mode: "MEAN",
  //   dates: {
  //     conv_april_2022: getDateIntervals([[2022, 2022]], [[3, 3]], [[1, "end"]]),
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
];

export const karatauOldFalcoDFRParams: DataExtractionConfig["scripts"] = [
  { key: "elevation" },
  {
    key: "geomorph",
    bands: ["cti", "aspect", "vrm", "roughness", "tpi", "spi", "geom"],
  },

  {
    key: "global_habitat",
    bands: ["cov", "corr", "maximum", "mean", "pielou", "simpson"],
  },
  {
    key: "global_wind_atlas",
    bands: ["wind_speed_50"],
  },
  {
    key: "world_clim_bio",
    bands: ["bio02", "bio03", "bio06", "bio16"],
  },

  {
    key: "evi",
    scale: 100,
    dates: {
      april_2022: getDateIntervals([[2022, 2022]], [[3, 3]], [[1, "end"]]),
    },
  },
  { key: "world_cover", scale: 10 },
  {
    key: "world_cover_convolve",
    scale: 10,
    bands: ["Tree_cover", "Shrubland", "Cropland", "Bare_sparse_vegetation"],
  },
];

export const karatauOldFalcoInModelParams: DataExtractionConfig["scripts"] = [
  {
    key: "geomorph",
    bands: ["cti", "tri", "slope", "vrm", "roughness", "tpi", "geom"],
  },

  {
    key: "global_habitat",
    bands: ["cov", "mean", "simpson"],
  },
  {
    key: "global_wind_atlas",
  },

  {
    key: "evi",
    scale: 100,
    dates: {
      april_2022: getDateIntervals([[2022, 2022]], [[3, 3]], [[1, "end"]]),
      july_2022: getDateIntervals([[2022, 2022]], [[6, 6]], [[1, "end"]]),
      august_2022: getDateIntervals([[2022, 2022]], [[7, 7]], [[1, "end"]]),
    },
  },
  {
    key: "evi",
    scale: 100,
    buffer: 100,
    mode: "MEAN",
    dates: {
      conv_april_2022: getDateIntervals([[2022, 2022]], [[3, 3]], [[1, "end"]]),
    },
  },
  {
    key: "world_cover_convolve",
    scale: 10,
    bands: ["Bare_sparse_vegetation"],
  },
];

export const karatauOldFalcoInModelDFRParams: DataExtractionConfig["scripts"] =
  [
    {
      key: "geomorph",
      bands: ["cti", "vrm", "roughness", "tpi", "geom"],
    },

    {
      key: "global_habitat",
      bands: ["cov", "mean", "simpson"],
    },
    {
      key: "global_wind_atlas",
      bands: ["wind_speed_50"],
    },
    {
      key: "evi",
      scale: 100,
      dates: {
        april_2022: getDateIntervals([[2022, 2022]], [[3, 3]], [[1, "end"]]),
      },
    },
    {
      key: "world_cover_convolve",
      scale: 10,
      bands: ["Bare_sparse_vegetation"],
    },
  ];

export const karatauOldFalcoProbRFConfigAll: RandomForestConfig = {
  outputMode: "PROBABILITY",
  trainingPoints: {
    type: "separate-points",
    absencePoints: {
      type: "csv",
      path: "./src/for-papers/karatau-old/assets/FALCO/Точки отсутствия балобана.csv",
    },
    presencePoints: {
      type: "csv",
      path: "./src/for-papers/karatau-old/assets/FALCO/Балобан-точки присутствия.csv",
    },
  },
  regionOfInterest: {
    type: "csv",
    path: "./src/for-papers/karatau-old/assets/region-of-interest.csv",
  },
  params: {
    type: "scripts",
    scripts: karatauOldFalcoAllParams,
  },
  validation: { type: "split", split: 0.2 },
  outputs: "FINAL_RFS/KARATAU-OLD-FALCO/ALL_CROSS_PROB222",
};

export const karatauOldFalcoProbRFConfigDFR: RandomForestConfig = {
  ...karatauOldFalcoProbRFConfigAll,
  params: {
    type: "scripts",
    scripts: karatauOldFalcoDFRParams,
  },
  outputs: "FINAL_RFS/KARATAU-OLD-FALCO/DFR_CROSS_PROB",
};

export const karatauOldFalcoProbRFConfigInModel: RandomForestConfig = {
  ...karatauOldFalcoProbRFConfigAll,
  params: {
    type: "scripts",
    scripts: karatauOldFalcoInModelParams,
  },
  outputs: "FINAL_RFS/KARATAU-OLD-FALCO/IN_MODEL_CROSS_PROB",
};

export const karatauOldFalcoProbRFConfigInModelDFR: RandomForestConfig = {
  ...karatauOldFalcoProbRFConfigAll,
  params: {
    type: "scripts",
    scripts: karatauOldFalcoInModelDFRParams,
  },
  outputs: "FINAL_RFS/KARATAU-OLD-FALCO/IN_MODEL_DFR_CROSS_PROB",
};

export const karatauOldFalcoRegrRFConfigAll: RandomForestConfig = {
  ...karatauOldFalcoProbRFConfigAll,
  outputMode: "REGRESSION",
  outputs: "FINAL_RFS/KARATAU-OLD-FALCO/ALL_CROSS_REGR",
};

export const karatauOldFalcoRegrRFConfigDFR: RandomForestConfig = {
  ...karatauOldFalcoProbRFConfigDFR,
  outputMode: "REGRESSION",
  outputs: "FINAL_RFS/KARATAU-OLD-FALCO/DFR_CROSS_REGR",
};

export const karatauOldFalcoRegrRFConfigInModel: RandomForestConfig = {
  ...karatauOldFalcoProbRFConfigInModel,
  outputMode: "REGRESSION",
  outputs: "FINAL_RFS/KARATAU-OLD-FALCO/IN_MODEL_CROSS_REGR",
};

export const karatauOldFalcoRegrRFConfigInModelDFR: RandomForestConfig = {
  ...karatauOldFalcoProbRFConfigInModelDFR,
  outputMode: "REGRESSION",
  outputs: "FINAL_RFS/KARATAU-OLD-FALCO/IN_MODEL_DFR_CROSS_REGR",
};
