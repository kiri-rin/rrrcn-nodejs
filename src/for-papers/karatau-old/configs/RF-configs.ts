import { getDateIntervals } from "../../../services/utils/dates";

import {
  DataExtractionConfig,
  RandomForestConfig,
} from "../../../analytics_config_types2";
export const karatauOldAllParams: DataExtractionConfig["scripts"] = [
  { key: "elevation" },
  {
    key: "geomorph",
  },

  {
    key: "global_habitat",
  },
  {
    key: "global_wind_atlas",
  },
  {
    key: "world_clim_bio",
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
      conv_april_2022: getDateIntervals([[2022, 2022]], [[3, 3]], [[1, "end"]]),
    },
  },
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

export const karatauOldDFRParams: DataExtractionConfig["scripts"] = [
  { key: "elevation" },
  {
    key: "geomorph",
    bands: ["tri", "slope", "vrm", "roughness", "geom"],
  },

  {
    key: "global_habitat",
    bands: [
      "cov",
      "contrast",
      "dissimilarity",
      "homogeneity",
      "range",
      "shannon",
      "simpson",
      "sd",
      "variance",
    ],
  },
  {
    key: "global_wind_atlas",
    bands: [
      "wind_speed_10",
      "power_density_10",
      "power_density_50",
      "power_density_100",
      "RIX",
    ],
  },
  {
    key: "world_clim_bio",
    bands: [
      "bio01",
      "bio03",
      "bio04",
      "bio06",
      "bio07",
      "bio11",
      "bio12",
      "bio13",
      "bio16",
      "bio19",
    ],
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
      conv_april_2022: getDateIntervals([[2022, 2022]], [[3, 3]], [[1, "end"]]),
    },
  },
  {
    key: "world_cover_convolve",
    scale: 10,
    bands: ["Cropland", "Bare_sparse_vegetation"],
  },
];

export const karatauOldInModelParams: DataExtractionConfig["scripts"] = [
  { key: "elevation" },
  {
    key: "geomorph",
    bands: ["cti", "slope", "aspect", "vrm", "tpi", "spi", "geom"],
  },

  {
    key: "global_habitat",
    bands: ["cov", "corr", "entropy", "mean"],
  },
  {
    key: "global_wind_atlas",
    bands: ["power_density_10"],
  },
  {
    key: "world_clim_bio",
    bands: ["bio02", "bio03", "bio04", "bio07", "bio08", "bio11"],
  },

  {
    key: "ndvi",
    scale: 100,
    dates: {
      april_2022: getDateIntervals([[2022, 2022]], [[3, 3]], [[1, "end"]]),
    },
  },
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

export const karatauOldInModelDFRParams: DataExtractionConfig["scripts"] = [
  {
    key: "geomorph",
    bands: ["slope", "vrm", "geom"],
  },

  {
    key: "global_habitat",
    bands: ["cov"],
  },
  {
    key: "global_wind_atlas",
    bands: ["power_density_10"],
  },
  {
    key: "world_clim_bio",
    bands: ["bio03", "bio04", "bio11"],
  },
  {
    key: "world_cover_convolve",
    scale: 10,
    bands: ["Cropland", "Bare_sparse_vegetation"],
  },
];

export const karatauOldProbRFConfigAll: RandomForestConfig = {
  outputMode: "PROBABILITY",
  trainingPoints: {
    type: "all-points",
    allPoints: {
      points: {
        type: "csv",
        path: "./src/for-papers/karatau-old/assets/NEOPHRON.csv",
      },
    },
  },
  regionOfInterest: {
    type: "csv",
    path: "./src/for-papers/karatau-old/assets/region-of-interest.csv",
  },
  params: {
    type: "scripts",
    scripts: karatauOldAllParams,
  },
  validation: { type: "split", split: 0.2 },
  outputs: "FINAL_RFS/KARATAU-OLD/ALL_CROSS_PROB",
};

export const karatauOldProbRFConfigDFR: RandomForestConfig = {
  ...karatauOldProbRFConfigAll,
  params: {
    type: "scripts",
    scripts: karatauOldDFRParams,
  },
  outputs: "FINAL_RFS/KARATAU-OLD/DFR_CROSS_PROB",
};

export const karatauOldProbRFConfigInModel: RandomForestConfig = {
  ...karatauOldProbRFConfigAll,
  params: {
    type: "scripts",
    scripts: karatauOldInModelParams,
  },
  outputs: "FINAL_RFS/KARATAU-OLD/IN_MODEL_CROSS_PROB",
};

export const karatauOldProbRFConfigInModelDFR: RandomForestConfig = {
  ...karatauOldProbRFConfigAll,
  params: {
    type: "scripts",
    scripts: karatauOldInModelDFRParams,
  },
  outputs: "FINAL_RFS/KARATAU-OLD/IN_MODEL_DFR_CROSS_PROB",
};

export const karatauOldRegrRFConfigAll: RandomForestConfig = {
  ...karatauOldProbRFConfigAll,
  outputMode: "REGRESSION",
  outputs: "FINAL_RFS/KARATAU-OLD/ALL_CROSS_REGR",
};

export const karatauOldRegrRFConfigDFR: RandomForestConfig = {
  ...karatauOldProbRFConfigDFR,
  outputMode: "REGRESSION",
  outputs: "FINAL_RFS/KARATAU-OLD/DFR_CROSS_REGR",
};

export const karatauOldRegrRFConfigInModel: RandomForestConfig = {
  ...karatauOldProbRFConfigInModel,
  outputMode: "REGRESSION",
  outputs: "FINAL_RFS/KARATAU-OLD/IN_MODEL_CROSS_REGR",
};

export const karatauOldRegrRFConfigInModelDFR: RandomForestConfig = {
  ...karatauOldProbRFConfigInModelDFR,
  outputMode: "REGRESSION",
  outputs: "FINAL_RFS/KARATAU-OLD/IN_MODEL_DFR_CROSS_REGR",
};
