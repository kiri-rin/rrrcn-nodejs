import { getDateIntervals } from "../../../../services/utils/dates";
import {
  commonImportantRFParamsCollinearFiltered,
  commonImportantRFParamsForAll,
} from "../common-important-for-RF";
import {
  DataExtractionConfig,
  RandomForestConfig,
} from "../../../../analytics_config_types2";
export const karatauUniqParams: DataExtractionConfig["scripts"] = [
  { key: "elevation" },
  {
    key: "geomorph",
    bands: ["cti", "tri", "slope", "aspect", "vrm", "roughness", "geom"],
  },

  {
    key: "global_habitat",
    bands: [
      "cov",
      "contrast",
      "dissimilarity",
      "entropy",
      "maximum",
      "mean",
      "pielou",
      "homogeneity",
      "range",
      "shannon",
      "simpson",
      "sd",
      "uniformity",
    ],
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
      "bio02",
      "bio03",
      "bio04",
      "bio07",
      "bio08",
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
    },
  },
  {
    key: "world_cover_convolve",
    scale: 10,
    bands: ["Shrubland", "Grassland", "Cropland"],
  },
];
export const karatauProbRFConfigUniqParams: RandomForestConfig = {
  outputMode: "PROBABILITY",
  trainingPoints: {
    type: "all-points",
    allPoints: {
      points: {
        type: "csv",
        path: "./src/for-papers/static/Random_forest/Karatau/np-karatau-for-RF.csv",
      },
    },
  },
  regionOfInterest: {
    type: "csv",
    path: "./src/for-papers/static/Random_forest/Saker_Sterv2010-2022/region-of-interest.csv",
  },
  params: {
    type: "scripts",
    scripts: karatauUniqParams,
  },
  validation: { type: "split", split: 0.2 },
  outputs: "FINAL_RFS/KARATAU/UNIQ_CROSS_PROB",
};

export const karatauProbRFConfigCommonParamsForAll: RandomForestConfig = {
  ...karatauProbRFConfigUniqParams,
  params: {
    type: "scripts",
    scripts: commonImportantRFParamsForAll,
  },
  outputs: "FINAL_RFS/KARATAU/FOR_ALL_CROSS_PROB",
};

export const karatauProbRFConfigCommonParamsForAllFiltered: RandomForestConfig =
  {
    ...karatauProbRFConfigUniqParams,
    params: {
      type: "scripts",
      scripts: commonImportantRFParamsCollinearFiltered,
    },
    outputs: "FINAL_RFS/KARATAU/COLLINEAR_FILTERED_CROSS_PROB_SEEDED",
  };

export const karatauRegrRFConfigUniqParams: RandomForestConfig = {
  ...karatauProbRFConfigUniqParams,
  outputMode: "REGRESSION",
  outputs: "FINAL_RFS/KARATAU/UNIQ_CROSS_REGR",
};
export const karatauRegrRFConfigCommonParamsForAll: RandomForestConfig = {
  ...karatauProbRFConfigCommonParamsForAll,
  outputMode: "REGRESSION",
  outputs: "FINAL_RFS/KARATAU/FOR_ALL_CROSS_REGR",
};
export const karatauRegrRFConfigCommonParamsForAllFiltered: RandomForestConfig =
  {
    ...karatauProbRFConfigCommonParamsForAllFiltered,
    outputMode: "REGRESSION",
    outputs: "FINAL_RFS/KARATAU/COLLINEAR_FILTERED_CROSS_REGR",
  };
