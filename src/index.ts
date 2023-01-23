import { analyticsConfig } from "./analytics_config";
import { main } from "./controllers/extract-data";
import { randomForest } from "./controllers/random-forest";
import { randomForestCV } from "./controllers/cross-validation-random-forest";
const ee = require("@google/earthengine");
const key = require("../.local/ee-key.json");
declare global {
  //@ts-ignore
  let ee: any;
}
//@ts-ignore
globalThis.ee = ee;

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
    });
  },
  (r: any) => {
    console.log(r);
  }
);
