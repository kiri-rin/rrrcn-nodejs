import {
  commonImportantRFParamsCollinearFiltered,
  commonImportantRFParamsForAll,
} from "../common-important-for-RF";
import {
  DataExtractionConfig,
  RandomForestConfig,
} from "../../../../analytics_config_types2";
export const usturtUniqParams: DataExtractionConfig["scripts"] = [
  { key: "elevation" },
  {
    key: "geomorph",
    bands: ["cti", "tri", "slope", "aspect", "vrm", "roughness", "geom"],
  },

  {
    key: "global_habitat",
    bands: [
      "cov",
      "corr",
      "entropy",
      "maximum",
      "pielou",
      "shannon",
      "simpson",
      "uniformity",
    ],
  },
  {
    key: "global_wind_atlas",
    bands: [
      "power_density_10",
      "power_density_50",
      "power_density_100",
      "air_density_10",
      "air_density_50",
      "air_density_100",
      "RIX",
    ],
  },
  {
    key: "world_clim_bio",
    bands: [
      "bio01",
      "bio02",
      "bio04",
      "bio05",
      "bio06",
      "bio07",
      "bio11",
      "bio13",
      "bio14",
      "bio15",
      "bio16",
      "bio17",
      "bio18",
      "bio19",
    ],
  },

  {
    key: "world_cover_convolve",
    scale: 10,
    bands: ["Grassland", "Bare_sparse_vegetation"],
  },
];
export const usturtProbRFConfigUniqParams: RandomForestConfig = {
  params: {
    type: "scripts",
    scripts: usturtUniqParams,
  },
  trainingPoints: {
    type: "separate-points",
    presencePoints: {
      type: "csv",
      path: "./src/for-papers/new_paper/assets/Usturt/NP-Usturt.csv",
    },
    absencePoints: {
      type: "csv",
      path: "./src/for-papers/new_paper/assets/Usturt/Points-withoutNP-Usturt.csv",
    },
  },
  regionOfInterest: {
    type: "csv",
    path: "./src/for-papers/new_paper/assets/Usturt/Extent-Usturt.csv",
  },
  validation: { type: "split", split: 0.2 },
  outputMode: "PROBABILITY",

  outputs: "FINAL_RFS/USTURT/UNIQ_CROSS_PROB",
};
export const usturtProbRFConfigCommonParamsForAll: RandomForestConfig = {
  ...usturtProbRFConfigUniqParams,
  outputs: "FINAL_RFS/USTURT/FOR_ALL_CROSS_PROB",
  params: {
    type: "scripts",
    scripts: commonImportantRFParamsForAll,
  },
};
export const usturtProbRFConfigCommonParamsForAllFiltered: RandomForestConfig =
  {
    ...usturtProbRFConfigUniqParams,
    params: {
      type: "scripts",
      scripts: commonImportantRFParamsCollinearFiltered,
    },
    outputs: "FINAL_RFS/USTURT/COLLINEAR_FILTERED_CROSS_PROB",
  };

export const usturtRegrRFConfigUniqParams: RandomForestConfig = {
  ...usturtProbRFConfigUniqParams,
  outputMode: "REGRESSION",
  outputs: "FINAL_RFS/USTURT/UNIQ_CROSS_REGR",
};
export const usturtRegrRFConfigCommonParamsForAll: RandomForestConfig = {
  ...usturtProbRFConfigCommonParamsForAll,
  outputMode: "REGRESSION",
  outputs: "FINAL_RFS/USTURT/FOR_ALL_CROSS_REGR",
};
export const usturtRegrRFConfigCommonParamsForAllFiltered: RandomForestConfig =
  {
    ...usturtProbRFConfigCommonParamsForAllFiltered,
    outputMode: "REGRESSION",
    outputs: "FINAL_RFS/USTURT/COLLINEAR_FILTERED_CROSS_REGR",
  };
