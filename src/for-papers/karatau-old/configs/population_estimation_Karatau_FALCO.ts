import { populationEstimationType } from "@rrrcn/common-types/services/api/common-body";

export const populationEstimationKaratauFalcoThiessens: populationEstimationType =
  {
    // areasSHPZIPPath: "./src/for-papers/karatau-old/assets/merge-plots.zip",
    areasSHPZIPPath: "./src/for-papers/karatau-old/assets/FALCO/tissen.ZIP",
    pointsCsvPath:
      "./src/for-papers/karatau-old/assets/FALCO/Балобан для численности.csv",
    regionOfInterestCsvPath:
      "./src/for-papers/karatau-old/assets/FALCO/Экстент Каратау кз.csv",
    classified_image_id: "users/kirillknizhov/falco_best_mean_50",
    // outputs: "FINAL_RFS/KARATAU-OLD/population/best_theissens_by_aver",
    // seed: 2501,
    outputs: "FINAL_RFS/KARATAU-OLD-FALCO/population/cross_100_thiessens_kz",
  };
export const populationEstimationKaratauFalcoAreas: populationEstimationType = {
  ...populationEstimationKaratauFalcoThiessens,
  areasSHPZIPPath: "./src/for-papers/karatau-old/assets/FALCO/plots.ZIP",
  outputs: "FINAL_RFS/KARATAU-OLD-FALCO/population/cross_100_areas_kz",
};
