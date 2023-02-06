import { dateIntervalsToConfig } from "../../../../services/utils/dates";
import { commonScripts } from "../common-scripts";
import { DataExtractionConfig } from "../../../../analytics_config_types";

export const Usturt_randoms_allParameters = {
  scripts: commonScripts,
  dates: dateIntervalsToConfig([]),
  id_key: "id",
  pointsCsvPath:
    "./src/for-papers/static/Random_forest/SE-KZ/randompoints-se-kz.csv",
  outputs: `SE_KZ/SE_KZ_RANDOMS`,
};
export const Usturt_neophronPresence_allParameters = {
  scripts: commonScripts,
  dates: dateIntervalsToConfig([]),
  id_key: "id",
  pointsCsvPath: "./src/for-papers/static/Random_forest/SE-KZ/NP-SE-KZ.csv",
  outputs: `SE_KZ/SE_KZ_NP`,
};
export const Usturt_absence_allParameters = {
  scripts: commonScripts,
  dates: dateIntervalsToConfig([]),
  id_key: "id",
  pointsCsvPath:
    "./src/for-papers/static/Random_forest/SE-KZ/Points-withoutNP-SE-KZ.csv",
  outputs: `SE_KZ/SE_KZ_ABSENCE`,
};
