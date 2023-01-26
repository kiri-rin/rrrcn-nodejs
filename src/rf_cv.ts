import { RandomForestConfig } from "./analytics_config_types2";
import { randomForestCV } from "./controllers/random-forest/cross-validation-random-forest2";
import { karatauUniqParams } from "./for-papers/configs/Karatau/RF-configs";
import { randomForest } from "./controllers/random-forest/random-forest2";
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
const config: RandomForestConfig = {
  outputMode: "PROBABILITY",
  trainingPoints: {
    type: "all-points",
    allPoints: {
      points: {
        type: "csv",
        path: "./src/for-papers/static/Random_forest/Karatau/np-karatau-for-RF.csv",
      },
    },
  },
  regionOfInterest: {
    type: "csv",
    path: "./src/for-papers/static/Random_forest/Saker_Sterv2010-2022/region-of-interest.csv",
  },
  params: {
    type: "scripts",
    scripts: karatauUniqParams,
  },
  validation: { type: "split", split: 0.2, seed: 2 * 2 * 2 },
  outputs: "FINAL_RFS/KARATAU/UNIQ_CROSS_PROB_new",
};
ee.data.authenticateViaPrivateKey(
  key,
  () => {
    ee.initialize(null, null, async () => {
      await randomForest(config);
    });
  },
  (r: any) => {
    console.log(r);
  }
);
