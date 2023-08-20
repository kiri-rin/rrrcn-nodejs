import {
  populationEstimationType,
  PopulationRandomGenerationConfigType,
} from "../../../analytics_config_types";

export const populationEstimationKaratauThiessens: PopulationRandomGenerationConfigType =
  {
    // areasSHPZIPPath: "./src/for-papers/karatau-old/assets/merge-plots.zip",
    areas: {
      type: "shp",
      path: "./src/for-papers/karatau-old/assets/thiessens.zip",
    },
    points: {
      type: "shp",
      path: "./src/for-papers/karatau-old/assets/np-for-extrapolation.zip",
    },
    regionOfInterest: {
      type: "csv",
      path: "./src/for-papers/karatau-old/assets/extent-kz.csv",
    },
    presenceArea: {
      type: "asset",
      path: "users/kirillknizhov/neophron_best_mean_50",
    },

    // outputs: "FINAL_RFS/KARATAU-OLD/population/best_theissens_by_aver",
    // seed: 2501,
    outputs: "FINAL_RFS/KARATAU-OLD/population/cross_100_thiessens_kz",
  };
export const populationEstimationKaratauAreas: PopulationRandomGenerationConfigType =
  {
    ...populationEstimationKaratauThiessens,
    areas: {
      type: "shp",
      path: "./src/for-papers/karatau-old/assets/merge-plots.zip",
    },
    outputs: "FINAL_RFS/KARATAU-OLD/population/cross_100_areas_kz",
  };
