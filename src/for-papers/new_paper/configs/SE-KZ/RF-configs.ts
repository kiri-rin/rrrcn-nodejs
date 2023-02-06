import { getDateIntervals } from "../../../../services/utils/dates";
import {
  commonImportantRFParamsCollinearFiltered,
  commonImportantRFParamsForAll,
} from "../common-important-for-RF";
import {
  DataExtractionConfig,
  RandomForestConfig,
} from "../../../../analytics_config_types";
export const SEKUniqParams: DataExtractionConfig["scripts"] = [
  { key: "elevation" },
  {
    key: "geomorph",
    bands: ["tri", "slope", "aspect", "vrm", "roughness", "spi", "geom"],
  },

  {
    key: "global_habitat",
    bands: ["entropy", "pielou", "shannon", "simpson"],
  },
  {
    key: "global_wind_atlas",
    bands: [
      "wind_speed_10",
      "wind_speed_50",
      "wind_speed_100",
      "power_density_10",
      "power_density_50",
      "power_density_100",
    ],
  },
  {
    key: "world_clim_bio",
    bands: [
      "bio01",
      "bio02",
      "bio03",
      "bio04",
      "bio06",
      "bio07",
      "bio08",
      "bio11",
      "bio12",
      "bio13",
      "bio14",
      "bio16",
      "bio17",
      "bio19",
    ],
  },

  {
    key: "ndvi",
    scale: 100,
    dates: {
      april_2022: getDateIntervals([[2022, 2022]], [[3, 3]], [[1, "end"]]),
    },
  },
  {
    key: "world_cover_convolve",
    scale: 10,
    bands: ["Cropland", "Bare_sparse_vegetation", "Permanent_water_bodies"],
  },
];
export const SEKZProbRFConfigUniqParams: RandomForestConfig = {
  params: {
    type: "scripts",
    scripts: SEKUniqParams,
  },
  trainingPoints: {
    type: "separate-points",
    presencePoints: {
      type: "csv",
      path: "./src/for-papers/new_paper/assets/SE-KZ/NP-SE-KZ.csv",
    },
    absencePoints: {
      type: "csv",
      path: "./src/for-papers/new_paper/assets/SE-KZ/Points-withoutNP-SE-KZ.csv",
    },
  },
  regionOfInterest: {
    type: "csv",
    path: "./src/for-papers/new_paper/assets/SE-KZ/Extent-SE-KZ.csv",
  },
  validation: { type: "split", split: 0.2 },
  outputMode: "PROBABILITY",

  outputs: "FINAL_RFS/SEKZ/UNIQ_CROSS_PROB2",
};
export const SEKZProbRFConfigCommonParamsForAll: RandomForestConfig = {
  ...SEKZProbRFConfigUniqParams,
  params: {
    type: "scripts",
    scripts: commonImportantRFParamsForAll,
  },
  outputs: "FINAL_RFS/SEKZ/FOR_ALL_CROSS_PROB",
};
export const SEKZProbRFConfigCommonParamsForAllFiltered: RandomForestConfig = {
  ...SEKZProbRFConfigUniqParams,
  params: {
    type: "scripts",
    scripts: commonImportantRFParamsCollinearFiltered,
  },
  outputs: "FINAL_RFS/SEKZ/COLLINEAR_FILTERED_CROSS_PROB",
};

export const SEKZRegrRFConfigUniqParams: RandomForestConfig = {
  ...SEKZProbRFConfigUniqParams,
  outputMode: "REGRESSION",
  outputs: "FINAL_RFS/SEKZ/UNIQ_CROSS_REGR",
};
export const SEKZRegrRFConfigCommonParamsForAll: RandomForestConfig = {
  ...SEKZProbRFConfigCommonParamsForAll,
  outputMode: "REGRESSION",

  outputs: "FINAL_RFS/SEKZ/FOR_ALL_CROSS_REGR",
};
export const SEKZRegrRFConfigCommonParamsForAllFiltered: RandomForestConfig = {
  ...SEKZProbRFConfigCommonParamsForAllFiltered,
  outputMode: "REGRESSION",
  outputs: "FINAL_RFS/SEKZ/COLLINEAR_FILTERED_CROSS_REGR",
};
