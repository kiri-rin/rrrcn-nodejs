import { populationEstimationType } from "../../../../analytics_config_types";

export const populationEstimationUsturtThiessens: populationEstimationType = {
  longitude_key: "X_coord",
  latitude_key: "Y_coord",
  id_key: "Name",
  // areasSHPZIPPath: "./src/for-papers/new_paper/assets/Usturt/merge-plots.zip",
  areasSHPZIPPath: "./src/for-papers/new_paper/assets/Usturt/тиссена.zip",
  pointsCsvPath: "./src/for-papers/new_paper/assets/Usturt/population_np.csv",
  regionOfInterestCsvPath:
    "./src/for-papers/new_paper/assets/Usturt/population_extent_usturt.csv",
  classified_image_id: "users/kirillknizhov/usturt_best_50",
  // outputs: "FINAL_RFS/KARATAU-OLD/population/best_theissens_by_aver",
  // seed: 2501,
  outputs: "FINAL_RFS/USTURT2/population/cross_100_thiessens_kz",
};
export const populationEstimationUsturtAreas: populationEstimationType = {
  ...populationEstimationUsturtThiessens,
  areasSHPZIPPath: "./src/for-papers/new_paper/assets/Usturt/plots.zip",
  outputs: "FINAL_RFS/USTURT2/population/cross_100_areas_kz",
};
