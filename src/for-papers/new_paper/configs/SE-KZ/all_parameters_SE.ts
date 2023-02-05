import { dateIntervalsToConfig } from "../../../../services/utils/dates";
import { commonScripts } from "../common-scripts";
import { DataExtractionConfig } from "../../../../analytics_config_types2";

export const SEKZ_randoms_allParameters = {
  buffer: 0,
  scripts: commonScripts,
  dates: dateIntervalsToConfig([]),
  latitude_key: "Y_coord",
  longitude_key: "X_coord",
  id_key: "ID",
  pointsCsvPath:
    "./src/for-papers/static/Random_forest/SE-KZ/randompoints-se-kz.csv",
  outputs: `SE_KZ/SE_KZ_RANDOMS`,
};
export const SEKZ_neophronPresence_allParameters = {
  buffer: 0,
  scripts: commonScripts,
  dates: dateIntervalsToConfig([]),
  latitude_key: "Y_coord",
  longitude_key: "X_coord",
  id_key: "Name",
  pointsCsvPath: "./src/for-papers/static/Random_forest/SE-KZ/NP-SE-KZ.csv",
  outputs: `SE_KZ/SE_KZ_NP`,
};
export const SEKZ_absence_allParameters = {
  buffer: 0,
  scripts: commonScripts,
  dates: dateIntervalsToConfig([]),
  latitude_key: "Y_coord",
  longitude_key: "X_coord",
  id_key: "ID",
  pointsCsvPath:
    "./src/for-papers/static/Random_forest/SE-KZ/Points-withoutNP-SE-KZ.csv",
  outputs: `SE_KZ/SE_KZ_ABSENCE`,
};
