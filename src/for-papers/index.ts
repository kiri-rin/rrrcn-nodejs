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
import { karatauRegrRFConfigUniqParams } from "./for-papers/configs/Karatau/RF-configs";
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
ee.data.authenticateViaPrivateKey(
  key,
  () => {
    ee.initialize(null, null, async () => {
      if (analyticsConfig.randomForest) {
        await (analyticsConfig.randomForest.crossValidation
          ? randomForestCV
          : randomForest)(analyticsConfig);
      } else {
        await main(analyticsConfig);
      }
      // for (let conf of configs) {
      //   conf.randomForest &&
      //     (await (conf.randomForest.crossValidation
      //       ? randomForestCV
      //       : randomForest)(conf));
      // }
    });
  },
  (r: any) => {
    console.log(r);
  }
);
