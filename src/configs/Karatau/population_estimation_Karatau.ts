import { populationEstimationType } from "../../population_config";

export const populationEstimationKaratau: populationEstimationType = {
  seed: 15,
  areasSHPZIPPath: "./src/static/Random_forest/Karatau/merge-plots.zip",
  pointsSHPZIPPath:
    "./src/static/Random_forest/Karatau/np-for-extrapolation.zip",
  regionOfInterestCsvPath:
    "./src/static/Random_forest/Saker_Sterv2010-2022/region-of-interest.csv",
  classified_image_id: "users/kirillknizhov/neophron_classification_mean_50",
  outputs: "POPULATION_ESTIMATE_KARATAU",
};
