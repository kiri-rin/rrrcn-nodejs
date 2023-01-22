import { scriptKey } from "../../services/ee-data";
import {
  dateIntervalsToConfig,
  DatesConfig,
  getDateIntervals,
} from "../../services/utils/dates";
import { analyticsConfigType } from "../../analytics_config_types";
import { commonScripts } from "../common-scripts";

export const Karatau_randoms_allParameters: analyticsConfigType = {
  buffer: 0,
  scripts: commonScripts,
  dates: dateIntervalsToConfig([]),
  latitude_key: "Y_coord",
  longitude_key: "X_coord",
  id_key: "ID",
  pointsCsvPath: "./src/static/Random_forest/SE-KZ/randompoints-karatau.csv",
  outputs: `KARATAU/KARATAU_RANDOMS`,
};
export const Karatau_neophronPresence_allParameters: analyticsConfigType = {
  buffer: 0,
  scripts: commonScripts,
  dates: dateIntervalsToConfig([]),
  latitude_key: "Y_coord",
  longitude_key: "X_coord",
  id_key: "Name",
  pointsCsvPath: "./src/static/Random_forest/SE-KZ/np-karatau.csv",
  outputs: `KARATAU/KARATAU_NP`,
};
export const Karatau_validations_allParameters: analyticsConfigType = {
  buffer: 0,
  scripts: commonScripts,
  dates: dateIntervalsToConfig([]),
  latitude_key: "Y_coord",
  longitude_key: "X_coord",
  id_key: "ID",
  pointsCsvPath:
    "./src/static/Random_forest/SE-KZ/np-karatau-для валидации.csv",
  outputs: `KARATAU/KARATAU_VALIDATIONS`,
};
