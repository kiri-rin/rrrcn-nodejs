import { populationEstimationType } from "../../../population_config";

export const populationEstimationKaratauThiessens: populationEstimationType = {
  // areasSHPZIPPath: "./src/for-papers/karatau-old/assets/merge-plots.zip",
  areasSHPZIPPath: "./src/for-papers/karatau-old/assets/thiessens.zip",
  pointsSHPZIPPath:
    "./src/for-papers/karatau-old/assets/np-for-extrapolation.zip",
  regionOfInterestCsvPath: "./src/for-papers/karatau-old/assets/extent-kz.csv",
  classified_image_id: "users/kirillknizhov/neophron_best_mean_50",
  // outputs: "FINAL_RFS/KARATAU-OLD/population/best_theissens_by_aver",
  // seed: 2501,
  outputs: "FINAL_RFS/KARATAU-OLD/population/cross_100_thiessens_kz",
};
export const populationEstimationKaratauAreas: populationEstimationType = {
  ...populationEstimationKaratauThiessens,
  areasSHPZIPPath: "./src/for-papers/karatau-old/assets/merge-plots.zip",
  outputs: "FINAL_RFS/KARATAU-OLD/population/cross_100_areas_kz",
};
