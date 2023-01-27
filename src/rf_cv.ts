import { RandomForestConfig } from "./analytics_config_types2";
import { randomForestCV } from "./controllers/random-forest/cross-validation-random-forest2";
import { karatauUniqParams } from "./for-papers/configs/Karatau/RF-configs";
import { randomForest } from "./controllers/random-forest/random-forest2";
import { validateClassifiedImage } from "./controllers/random-forest/validateClassifier";
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
      await validateClassifiedImage({
        classified_image: {
          type: "asset",
          path: "users/kirillknizhov/neophron_classification_mean_50",
        },
        validationPoints: {
          type: "all-points",
          allPoints: {
            points: {
              id_key: "Name",
              latitude_key: "Y_coord",
              longitude_key: "X_coord",
              type: "csv",
              path: "./src/for-papers/static/Random_forest/Karatau/np-karatau-для валидации.csv",
            },
          },
        },
        outputs: "KARATAU_VALIDATION_50",
      });
    });
  },
  (r: any) => {
    console.log(r);
  }
);
