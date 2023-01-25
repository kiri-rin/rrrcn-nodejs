import { scriptKey } from "../../../services/ee-data";
import {
  dateIntervalsToConfig,
  DatesConfig,
  getDateIntervals,
} from "../../../services/utils/dates";
import { analyticsConfigType } from "../../../analytics_config_types";
import { commonScripts } from "../common-scripts";

export const Usturt_randoms_allParameters: analyticsConfigType = {
  scripts: commonScripts,
  dates: dateIntervalsToConfig([]),
  id_key: "id",
  pointsCsvPath:
    "./src/for-papers/static/Random_forest/SE-KZ/randompoints-se-kz.csv",
  outputs: `SE_KZ/SE_KZ_RANDOMS`,
};
export const Usturt_neophronPresence_allParameters: analyticsConfigType = {
  scripts: commonScripts,
  dates: dateIntervalsToConfig([]),
  id_key: "id",
  pointsCsvPath: "./src/for-papers/static/Random_forest/SE-KZ/NP-SE-KZ.csv",
  outputs: `SE_KZ/SE_KZ_NP`,
};
export const Usturt_absence_allParameters: analyticsConfigType = {
  scripts: commonScripts,
  dates: dateIntervalsToConfig([]),
  id_key: "id",
  pointsCsvPath:
    "./src/for-papers/static/Random_forest/SE-KZ/Points-withoutNP-SE-KZ.csv",
  outputs: `SE_KZ/SE_KZ_ABSENCE`,
};
