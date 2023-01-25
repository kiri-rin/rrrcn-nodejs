import {
  analyticsConfigType,
  randomForestConfig,
} from "../../../analytics_config_types";
import { getDateIntervals } from "../../../services/utils/dates";
import {
  commonImportantRFParamsCollinearFiltered,
  commonImportantRFParamsForAll,
} from "../common-important-for-RF";

export const SEKZProbRFConfigUniqParams: analyticsConfigType = {
  id_key: "Name",
  latitude_key: "Y_coord",
  longitude_key: "X_coord",
  pointsCsvPath: "",
  outputs: "FINAL_RFS/SEKZ/UNIQ_CROSS_PROB",
  randomForest: {
    crossValidation: true,
    presencePointsCsvPath:
      "./src/for-papers/static/Random_forest/SE-KZ/NP-SE-KZ.csv",
    absencePointsCsvPath:
      "./src/for-papers/static/Random_forest/SE-KZ/Points-withoutNP-SE-KZ.csv",
    regionOfInterestCsvPath:
      "./src/for-papers/static/Random_forest/SE-KZ/Extent-SE-KZ.csv",
    validationSplit: 0.2,
    outputMode: "PROBABILITY",
  },
  scripts: [
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
  ],
};
export const SEKZProbRFConfigCommonParamsForAll: analyticsConfigType = {
  ...SEKZProbRFConfigUniqParams,
  outputs: "FINAL_RFS/SEKZ/FOR_ALL_CROSS_PROB",
  scripts: commonImportantRFParamsForAll,
};
export const SEKZProbRFConfigCommonParamsForAllFiltered: analyticsConfigType = {
  ...SEKZProbRFConfigUniqParams,
  outputs: "FINAL_RFS/SEKZ/COLLINEAR_FILTERED_CROSS_PROB",
  scripts: commonImportantRFParamsCollinearFiltered,
};

export const SEKZRegrRFConfigUniqParams: analyticsConfigType = {
  ...SEKZProbRFConfigUniqParams,
  randomForest: {
    ...(SEKZProbRFConfigUniqParams.randomForest as randomForestConfig),
    outputMode: "REGRESSION",
  },
  outputs: "FINAL_RFS/SEKZ/UNIQ_CROSS_REGR",
};
export const SEKZRegrRFConfigCommonParamsForAll: analyticsConfigType = {
  ...SEKZProbRFConfigUniqParams,
  randomForest: {
    ...(SEKZProbRFConfigUniqParams.randomForest as randomForestConfig),
    outputMode: "REGRESSION",
  },
  outputs: "FINAL_RFS/SEKZ/FOR_ALL_CROSS_REGR",
  scripts: commonImportantRFParamsForAll,
};
export const SEKZRegrRFConfigCommonParamsForAllFiltered: analyticsConfigType = {
  ...SEKZProbRFConfigUniqParams,
  randomForest: {
    ...(SEKZProbRFConfigUniqParams.randomForest as randomForestConfig),
    outputMode: "REGRESSION",
  },
  outputs: "FINAL_RFS/SEKZ/COLLINEAR_FILTERED_CROSS_REGR",
  scripts: commonImportantRFParamsCollinearFiltered,
};
