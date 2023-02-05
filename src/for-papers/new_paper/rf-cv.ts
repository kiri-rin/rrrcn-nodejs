import { withGEE } from "../../index";
import {
  SEKZProbRFConfigCommonParamsForAll,
  SEKZProbRFConfigCommonParamsForAllFiltered,
  SEKZProbRFConfigUniqParams,
  SEKZRegrRFConfigCommonParamsForAll,
  SEKZRegrRFConfigCommonParamsForAllFiltered,
  SEKZRegrRFConfigUniqParams,
} from "./configs/SE-KZ/RF-configs";
import {
  usturtProbRFConfigCommonParamsForAll,
  usturtProbRFConfigCommonParamsForAllFiltered,
  usturtProbRFConfigUniqParams,
  usturtRegrRFConfigCommonParamsForAll,
  usturtRegrRFConfigCommonParamsForAllFiltered,
  usturtRegrRFConfigUniqParams,
} from "./configs/Usturt/RF-configs";
import {
  karatauProbRFConfigCommonParamsForAll,
  karatauProbRFConfigCommonParamsForAllFiltered,
  karatauProbRFConfigUniqParams,
  karatauRegrRFConfigCommonParamsForAll,
  karatauRegrRFConfigCommonParamsForAllFiltered,
} from "./configs/Karatau/RF-configs";
import { randomForestCV } from "../../controllers/random-forest/cross-validation-random-forest";
const configs = [
  karatauProbRFConfigUniqParams,
  karatauProbRFConfigCommonParamsForAll,
  karatauProbRFConfigCommonParamsForAllFiltered,
  karatauRegrRFConfigCommonParamsForAll,
  karatauRegrRFConfigCommonParamsForAllFiltered,

  SEKZProbRFConfigUniqParams,
  SEKZProbRFConfigCommonParamsForAll,
  SEKZProbRFConfigCommonParamsForAllFiltered,
  SEKZRegrRFConfigCommonParamsForAll,
  SEKZRegrRFConfigCommonParamsForAllFiltered,
  SEKZRegrRFConfigUniqParams,

  usturtProbRFConfigCommonParamsForAll,
  usturtProbRFConfigCommonParamsForAllFiltered,
  usturtProbRFConfigUniqParams,
  usturtRegrRFConfigCommonParamsForAll,
  usturtRegrRFConfigCommonParamsForAllFiltered,
  usturtRegrRFConfigUniqParams,
];
withGEE(async () => {
  for (let config of configs) {
    // await randomForestCV(config);
  }
});
