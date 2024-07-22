import {
  DataExtractionConfig,
  RandomForestConfig,
} from "@rrrcn/common/src/types/services/analytics_config_types";
import { getDateIntervals } from "@rrrcn/common/src/utils/dates";
export const karatauOldImperialAllParams: DataExtractionConfig["scripts"] = [
  {
    key: "landsat",
    dates: {
      median_5_6: getDateIntervals([[2018, 2021]], [[4, 5]]),
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
    bands: ["nir", "ndvi"],
    dates: {
      median_5_6: getDateIntervals([[2018, 2021]], [[4, 5]]),
    },
  },
  {
    key: "alos",
    dates: {
      median: [[new Date(2018, 0, 1), new Date(2022, 0, 1)]],
    },
  },
];

export const karatauOldImperialInModelParams: DataExtractionConfig["scripts"] =
  [
    {
      key: "landsat",
      bands: ["blue", "ndvi", "red", "nir", "swir1"],
      dates: {
        median_5_6: getDateIntervals([[2018, 2021]], [[4, 5]]),
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
      bands: ["Bare_sparse_vegetation", "Grassland"],
    },
    {
      key: "world_cover_convolve",
      filename: "300",
      buffer: 300,
      bands: ["Shrubland", "Cropland"],
    },
    {
      key: "world_cover_convolve",
      filename: "600",
      buffer: 600,
      bands: ["Tree_cover", "Built_up", "Herbaceous_wetland"],
    },
  ];

export const karatauOldImperialInModelDFRParams: DataExtractionConfig["scripts"] =
  [
    {
      key: "landsat",
      dates: {
        median_5_6: getDateIntervals([[2018, 2021]], [[4, 5]]),
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
  outputs: "IMPERIAL/M1-PROB",
};

export const karatauOldImperialProbRFConfigDFR: RandomForestConfig = {
  ...karatauOldImperialProbRFConfigAll,
  params: {
    type: "scripts",
    scripts: karatauOldImperialDFRParams,
  },
  outputs: "IMPERIAL/M2-PROB",
};

export const karatauOldImperialProbRFConfigInModel: RandomForestConfig = {
  ...karatauOldImperialProbRFConfigAll,
  params: {
    type: "scripts",
    scripts: karatauOldImperialInModelParams,
  },
  outputs: "IMPERIAL/M3-PROB",
};

export const karatauOldImperialProbRFConfigInModelDFR: RandomForestConfig = {
  ...karatauOldImperialProbRFConfigAll,
  params: {
    type: "scripts",
    scripts: karatauOldImperialInModelDFRParams,
  },
  outputs: "IMPERIAL/M4-PROB",
};

export const karatauOldImperialRegrRFConfigAll: RandomForestConfig = {
  ...karatauOldImperialProbRFConfigAll,
  outputMode: "REGRESSION",
  outputs: "IMPERIAL/M1-REGR",
};

export const karatauOldImperialRegrRFConfigDFR: RandomForestConfig = {
  ...karatauOldImperialProbRFConfigDFR,
  outputMode: "REGRESSION",
  outputs: "IMPERIAL/M2-REGR",
};

export const karatauOldImperialRegrRFConfigInModel: RandomForestConfig = {
  ...karatauOldImperialProbRFConfigInModel,
  outputMode: "REGRESSION",
  outputs: "IMPERIAL/M3-REGR",
};

export const karatauOldImperialRegrRFConfigInModelDFR: RandomForestConfig = {
  ...karatauOldImperialProbRFConfigInModelDFR,
  outputMode: "REGRESSION",
  outputs: "IMPERIAL/M4-REGR",
};
