import {
  analyticsConfigType,
  randomForestConfig,
} from "../../../analytics_config_types";
import { getDateIntervals } from "../../../services/utils/dates";
import {
  commonImportantRFParamsCollinearFiltered,
  commonImportantRFParamsForAll,
} from "../common-important-for-RF";
export const karatauUniqParams: analyticsConfigType["scripts"] = [
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
export const karatauProbRFConfigUniqParams: analyticsConfigType = {
  pointsCsvPath:
    "./src/for-papers/static/Random_forest/Karatau/np-karatau-for-RF.csv",
  outputs: "FINAL_RFS/KARATAU/UNIQ_CROSS_PROB_seeded",
  randomForest: {
    crossValidation: true,
    regionOfInterestCsvPath:
      "./src/for-papers/static/Random_forest/Saker_Sterv2010-2022/region-of-interest.csv",
    validationSplit: 0.2,
    outputMode: "PROBABILITY",
  },
  scripts: karatauUniqParams,
};
export const karatauProbRFConfigCommonParamsForAll: analyticsConfigType = {
  ...karatauProbRFConfigUniqParams,
  outputs: "FINAL_RFS/KARATAU/FOR_ALL_CROSS_PROB",
  scripts: commonImportantRFParamsForAll,
};
export const karatauProbRFConfigCommonParamsForAllFiltered: analyticsConfigType =
  {
    ...karatauProbRFConfigUniqParams,
    outputs: "FINAL_RFS/KARATAU/COLLINEAR_FILTERED_CROSS_PROB_SEEDED",
    scripts: commonImportantRFParamsCollinearFiltered,
  };

export const karatauRegrRFConfigUniqParams: analyticsConfigType = {
  ...karatauProbRFConfigUniqParams,
  randomForest: {
    ...(karatauProbRFConfigUniqParams.randomForest as randomForestConfig),

    outputMode: "REGRESSION",
  },
  outputs: "FINAL_RFS/KARATAU/UNIQ_CROSS_REGR",
};
export const karatauRegrRFConfigCommonParamsForAll: analyticsConfigType = {
  ...karatauProbRFConfigUniqParams,
  randomForest: {
    ...(karatauProbRFConfigUniqParams.randomForest as randomForestConfig),
    outputMode: "REGRESSION",
  },
  outputs: "FINAL_RFS/KARATAU/FOR_ALL_CROSS_REGR",
  scripts: commonImportantRFParamsForAll,
};
export const karatauRegrRFConfigCommonParamsForAllFiltered: analyticsConfigType =
  {
    ...karatauProbRFConfigUniqParams,
    randomForest: {
      ...(karatauProbRFConfigUniqParams.randomForest as randomForestConfig),
      outputMode: "REGRESSION",
    },
    outputs: "FINAL_RFS/KARATAU/COLLINEAR_FILTERED_CROSS_REGR",
    scripts: commonImportantRFParamsCollinearFiltered,
  };
