import { populationEstimationType } from "../../../../population_config";

export const populationEstimationKaratau: populationEstimationType = {
  seed: 2,
  areasSHPZIPPath:
    "./src/for-papers/static/Random_forest/Karatau/thiessens.zip",
  pointsSHPZIPPath:
    "./src/for-papers/static/Random_forest/Karatau/np-for-extrapolation.zip",
  regionOfInterestCsvPath:
    "./src/for-papers/static/Random_forest/Saker_Sterv2010-2022/region-of-interest.csv",
  classified_image_id: "users/kirillknizhov/neophron_classification_mean_50",
  outputs: "POPULATION_ESTIMATE_KARATAU_102",
};
