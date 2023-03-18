import { getDateIntervals } from "../../../services/utils/dates";

import {
  DataExtractionConfig,
  RandomForestConfig,
} from "../../../analytics_config_types";
export const karatauOldImperialAllParams: DataExtractionConfig["scripts"] = [
  {
    key: "landsat",
    dates: {
      median: getDateIntervals([[2018, 2021]], [[4, 7]]),
    },
  },
  {
    key: "alos",
    dates: {
      median: [[new Date(2018, 0, 1), new Date(2022, 0, 1)]],
    },
  },
  { key: "elevation" },
  { key: "geomorph" },
  { key: "world_cover" },

  {
    key: "world_cover_convolve",
    buffer: 600,
    filename: "600",
    bands: [
      "Tree_cover",
      "Shrubland",
      "Grassland",
      "Cropland",
      "Bare_sparse_vegetation",
    ],
  },
];

export const karatauOldImperialDFRParams: DataExtractionConfig["scripts"] = [
  {
    key: "landsat",
    dates: {
      median: getDateIntervals([[2018, 2021]], [[4, 7]]),
    },
  },
  {
    key: "alos",
    dates: {
      median: [[new Date(2018, 0, 1), new Date(2022, 0, 1)]],
    },
  },

  { key: "world_cover" },
];

export const karatauOldImperialInModelParams: DataExtractionConfig["scripts"] =
  [
    {
      key: "landsat",
      dates: {
        median: getDateIntervals([[2018, 2021]], [[4, 7]]),
      },
    },
    {
      key: "alos",
      dates: {
        median: [[new Date(2018, 0, 1), new Date(2022, 0, 1)]],
      },
    },
    { key: "elevation" },
    { key: "geomorph", bands: ["slope", "aspect", "tpi", "spi", "geom"] },
    { key: "world_cover" },
    {
      key: "world_cover_convolve",
      filename: "100",
      buffer: 100,
      bands: ["Shrubland"],
    },
    {
      key: "world_cover_convolve",
      filename: "300",
      buffer: 300,
      bands: ["Grassland", "Cropland", "Bare_sparse_vegetation"],
    },
    {
      key: "world_cover_convolve",
      filename: "600",
      buffer: 600,
      bands: ["Bare_sparse_vegetation"],
    },
  ];

export const karatauOldImperialInModelDFRParams: DataExtractionConfig["scripts"] =
  [
    {
      key: "landsat",
      dates: {
        median: getDateIntervals([[2018, 2021]], [[4, 7]]),
      },
    },
    {
      key: "alos",
      dates: {
        median: [[new Date(2018, 0, 1), new Date(2022, 0, 1)]],
      },
    },
    { key: "elevation" },
    { key: "geomorph", bands: ["slope", "aspect"] },
    { key: "world_cover" },
    {
      key: "world_cover_convolve",
      filename: "100",
      buffer: 100,
      bands: ["Shrubland", "Grassland", "Cropland", "Bare_sparse_vegetation"],
    },
  ];

export const karatauOldImperialProbRFConfigAll: RandomForestConfig = {
  outputMode: "PROBABILITY",
  trainingPoints: {
    type: "separate-points",
    absencePoints: {
      type: "csv",
      id_key: "id",
      longitude_key: "X_coord",
      latitude_key: "Y_coord",
      path: "./src/for-papers/karatau-old/assets/IMPERIAL/Точки отсутствия мог.csv",
    },
    presencePoints: {
      type: "csv",
      id_key: "id",
      path: "./src/for-papers/karatau-old/assets/IMPERIAL/могильник мойыкум без дублей.csv",
      longitude_key: "longitude",
      latitude_key: "latitude",
    },
  },
  regionOfInterest: {
    type: "csv",
    path: "./src/for-papers/karatau-old/assets/IMPERIAL/Экстент мог.csv",
  },
  params: {
    type: "scripts",
    scripts: karatauOldImperialAllParams,
  },
  validation: { type: "split", split: 0.2 },
  outputs: "FINAL_RFS/KARATAU-OLD-IMPERIAL/ALL_CROSS_PROB",
};

export const karatauOldImperialProbRFConfigDFR: RandomForestConfig = {
  ...karatauOldImperialProbRFConfigAll,
  params: {
    type: "scripts",
    scripts: karatauOldImperialDFRParams,
  },
  outputs: "FINAL_RFS/KARATAU-OLD-IMPERIAL/DFR_CROSS_PROB",
};

export const karatauOldImperialProbRFConfigInModel: RandomForestConfig = {
  ...karatauOldImperialProbRFConfigAll,
  params: {
    type: "scripts",
    scripts: karatauOldImperialInModelParams,
  },
  outputs: "FINAL_RFS/KARATAU-OLD-IMPERIAL/IN_MODEL_CROSS_PROB",
};

export const karatauOldImperialProbRFConfigInModelDFR: RandomForestConfig = {
  ...karatauOldImperialProbRFConfigAll,
  params: {
    type: "scripts",
    scripts: karatauOldImperialInModelDFRParams,
  },
  outputs: "FINAL_RFS/KARATAU-OLD-IMPERIAL/IN_MODEL_DFR_CROSS_PROB",
};

export const karatauOldImperialRegrRFConfigAll: RandomForestConfig = {
  ...karatauOldImperialProbRFConfigAll,
  outputMode: "REGRESSION",
  outputs: "FINAL_RFS/KARATAU-OLD-IMPERIAL/ALL_CROSS_REGR",
};

export const karatauOldImperialRegrRFConfigDFR: RandomForestConfig = {
  ...karatauOldImperialProbRFConfigDFR,
  outputMode: "REGRESSION",
  outputs: "FINAL_RFS/KARATAU-OLD-IMPERIAL/DFR_CROSS_REGR",
};

export const karatauOldImperialRegrRFConfigInModel: RandomForestConfig = {
  ...karatauOldImperialProbRFConfigInModel,
  outputMode: "REGRESSION",
  outputs: "FINAL_RFS/KARATAU-OLD-IMPERIAL/IN_MODEL_CROSS_REGR",
};

export const karatauOldImperialRegrRFConfigInModelDFR: RandomForestConfig = {
  ...karatauOldImperialProbRFConfigInModelDFR,
  outputMode: "REGRESSION",
  outputs: "FINAL_RFS/KARATAU-OLD-IMPERIAL/IN_MODEL_DFR_CROSS_REGR",
};
