import { populationEstimationType } from "../../../../analytics_config_types";

export const populationEstimationSEKZThiessens: populationEstimationType = {
  longitude_key: "X_coord",
  latitude_key: "Y_coord",
  id_key: "Name",
  // areasSHPZIPPath: "./src/for-papers/new_paper/assets/SE-KZ/merge-plots.zip",
  areasSHPZIPPath: "./src/for-papers/new_paper/assets/SE-KZ/SEKZ-tissen.ZIP",
  pointsCsvPath:
    "./src/for-papers/new_paper/assets/SE-KZ/точки для численности se.csv",
  regionOfInterestCsvPath:
    "./src/for-papers/new_paper/assets/SE-KZ/Экстент для численности.csv",
  classified_image_id: "users/kirillknizhov/se_best_50",
  // outputs: "FINAL_RFS/KARATAU-OLD/population/best_theissens_by_aver",
  // seed: 2501,
  outputs: "FINAL_RFS/SEKZ/population/cross_100_thiessens_kz",
};
export const populationEstimationSEKZAreas: populationEstimationType = {
  ...populationEstimationSEKZThiessens,
  areasSHPZIPPath: "./src/for-papers/new_paper/assets/SE-KZ/SEKZ-plots.ZIP",
  outputs: "FINAL_RFS/SEKZ/population/cross_100_areas_kz",
};
