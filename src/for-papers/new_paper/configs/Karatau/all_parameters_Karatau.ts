import { commonScripts } from "../common-scripts";
import {
  CsvImportConfig,
  DataExtractionConfig,
} from "../../../../analytics_config_types";
const Karatau_points: CsvImportConfig = {
  type: "csv",
  latitude_key: "Y_coord",
  longitude_key: "X_coord",
  id_key: "ID",
  path: "./src/for-papers/static/Random_forest/SE-KZ/randompoints-karatau.csv",
};
export const Karatau_randoms_allParameters: DataExtractionConfig = {
  scripts: commonScripts,
  points: Karatau_points,
  outputs: `KARATAU/KARATAU_RANDOMS`,
};
export const Karatau_neophronPresence_allParameters: DataExtractionConfig = {
  ...Karatau_randoms_allParameters,
  points: {
    ...Karatau_points,
    path: "./src/for-papers/static/Random_forest/SE-KZ/np-karatau.csv",
  },
  outputs: `KARATAU/KARATAU_NP`,
};
export const Karatau_validations_allParameters: DataExtractionConfig = {
  ...Karatau_randoms_allParameters,
  points: {
    ...Karatau_points,
    path: "./src/for-papers/static/Random_forest/SE-KZ/np-karatau-для валидации.csv",
  },
  outputs: `KARATAU/KARATAU_VALIDATIONS`,
};
