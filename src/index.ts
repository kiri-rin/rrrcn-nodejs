import { analyticsConfig } from "./analytics_config";
import { main } from "./controllers/extract-data";
import { randomForest } from "./controllers/random-forest/random-forest";
import { randomForestCV } from "./controllers/random-forest/cross-validation-random-forest";
import {
  SEKZProbRFConfigCommonParamsForAll,
  SEKZProbRFConfigCommonParamsForAllFiltered,
  SEKZProbRFConfigUniqParams,
  SEKZRegrRFConfigCommonParamsForAll,
  SEKZRegrRFConfigCommonParamsForAllFiltered,
  SEKZRegrRFConfigUniqParams,
} from "./for-papers/configs/SE-KZ/RF-configs";
import {
  usturtProbRFConfigCommonParamsForAll,
  usturtProbRFConfigCommonParamsForAllFiltered,
  usturtProbRFConfigUniqParams,
  usturtRegrRFConfigCommonParamsForAll,
  usturtRegrRFConfigCommonParamsForAllFiltered,
  usturtRegrRFConfigUniqParams,
} from "./for-papers/configs/Usturt/RF-configs";
import {
  karatauProbRFConfigUniqParams,
  karatauRegrRFConfigUniqParams,
} from "./for-papers/configs/Karatau/RF-configs";
import { meanClassifiedImages } from "./controllers/random-forest/meanClassifiedImages";
import { randomForestConfig } from "./analytics_config_types";
const ee = require("@google/earthengine");
const key = require("../.local/ee-key.json");
declare global {
  //@ts-ignore
  let ee: any;
}
//@ts-ignore
globalThis.ee = ee;
// const configs = [
//   SEKZRegrRFConfigUniqParams,
//   usturtProbRFConfigCommonParamsForAll,
//   usturtProbRFConfigCommonParamsForAllFiltered,
//   usturtProbRFConfigUniqParams,
//   usturtRegrRFConfigCommonParamsForAll,
//   usturtRegrRFConfigCommonParamsForAllFiltered,
//   usturtRegrRFConfigUniqParams,
// ];
export const withGEE = async (callback: () => any) => {
  //@ts-ignore

  ee.data.authenticateViaPrivateKey(
    key,
    async () => {
      ee.initialize(null, null, async () => callback());
    },
    (r: string) => {
      console.log(r);
    }
  );
};
// withGEE(async () => {
// await meanClassifiedImages(
//   {
//     ...usturtProbRFConfigCommonParamsForAllFiltered,
//     randomForest: {
//       ...(usturtProbRFConfigCommonParamsForAllFiltered.randomForest as randomForestConfig),
//       validationSeed: 7 * 7 * 7,
//     },
//   },
//   {
//     ...usturtRegrRFConfigCommonParamsForAllFiltered,
//     randomForest: {
//       ...(usturtRegrRFConfigCommonParamsForAllFiltered.randomForest as randomForestConfig),
//       validationSeed: 7 * 7 * 7,
//     },
//   }
// );
// await meanClassifiedImages(
//   {
//     ...SEKZProbRFConfigUniqParams,
//     randomForest: {
//       ...(SEKZProbRFConfigUniqParams.randomForest as randomForestConfig),
//       validationSeed: 8 * 8 * 8,
//     },
//   },
//   {
//     ...SEKZRegrRFConfigUniqParams,
//     randomForest: {
//       ...(SEKZRegrRFConfigUniqParams.randomForest as randomForestConfig),
//       validationSeed: 8 * 8 * 8,
//     },
//   }
// );
// await meanClassifiedImages(
//   {
//     ...karatauProbRFConfigUniqParams,
//     randomForest: {
//       ...(karatauProbRFConfigUniqParams.randomForest as randomForestConfig),
//       validationSeed: 2 * 2 * 2,
//     },
//   },
//   {
//     ...karatauRegrRFConfigUniqParams,
//     randomForest: {
//       ...(karatauRegrRFConfigUniqParams.randomForest as randomForestConfig),
//       validationSeed: 2 * 2 * 2,
//     },
//   }
// );
// if (analyticsConfig.randomForest) {
//   await (analyticsConfig.randomForest.crossValidation
//     ? randomForestCV
//     : randomForest)(analyticsConfig);
// } else {
//   await main(analyticsConfig);
// }
// for (let conf of configs) {
//   conf.randomForest &&
//     (await (conf.randomForest.crossValidation
//       ? randomForestCV
//       : randomForest)(conf));
// }
// });
