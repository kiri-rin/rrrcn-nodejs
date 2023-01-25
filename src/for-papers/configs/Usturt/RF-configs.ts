import {
  analyticsConfigType,
  randomForestConfig,
} from "../../../analytics_config_types";
import { getDateIntervals } from "../../../services/utils/dates";
import {
  commonImportantRFParamsCollinearFiltered,
  commonImportantRFParamsForAll,
} from "../common-important-for-RF";

export const usturtProbRFConfigUniqParams: analyticsConfigType = {
  pointsCsvPath: "",
  outputs: "FINAL_RFS/USTURT/UNIQ_CROSS_PROB",
  randomForest: {
    crossValidation: true,
    presencePointsCsvPath:
      "./src/for-papers/static/Random_forest/Usturt/NP-Usturt.csv",
    absencePointsCsvPath:
      "./src/for-papers/static/Random_forest/Usturt/Points-withoutNP-Usturt.csv",
    regionOfInterestCsvPath:
      "./src/for-papers/static/Random_forest/Usturt/Extent-Usturt.csv",
    validationSplit: 0.2,
    outputMode: "PROBABILITY",
  },
  scripts: [
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
  ],
};
export const usturtProbRFConfigCommonParamsForAll: analyticsConfigType = {
  ...usturtProbRFConfigUniqParams,
  outputs: "FINAL_RFS/USTURT/FOR_ALL_CROSS_PROB",
  scripts: commonImportantRFParamsForAll,
};
export const usturtProbRFConfigCommonParamsForAllFiltered: analyticsConfigType =
  {
    ...usturtProbRFConfigUniqParams,
    outputs: "FINAL_RFS/USTURT/COLLINEAR_FILTERED_CROSS_PROB",
    scripts: commonImportantRFParamsCollinearFiltered,
  };

export const usturtRegrRFConfigUniqParams: analyticsConfigType = {
  ...usturtProbRFConfigUniqParams,
  randomForest: {
    ...(usturtProbRFConfigUniqParams.randomForest as randomForestConfig),
    outputMode: "REGRESSION",
  },
  outputs: "FINAL_RFS/USTURT/UNIQ_CROSS_REGR",
};
export const usturtRegrRFConfigCommonParamsForAll: analyticsConfigType = {
  ...usturtProbRFConfigUniqParams,
  randomForest: {
    ...(usturtProbRFConfigUniqParams.randomForest as randomForestConfig),
    outputMode: "REGRESSION",
  },
  outputs: "FINAL_RFS/USTURT/FOR_ALL_CROSS_REGR",
  scripts: commonImportantRFParamsForAll,
};
export const usturtRegrRFConfigCommonParamsForAllFiltered: analyticsConfigType =
  {
    ...usturtProbRFConfigUniqParams,
    randomForest: {
      ...(usturtProbRFConfigUniqParams.randomForest as randomForestConfig),
      outputMode: "REGRESSION",
    },
    outputs: "FINAL_RFS/USTURT/COLLINEAR_FILTERED_CROSS_REGR",
    scripts: commonImportantRFParamsCollinearFiltered,
  };
