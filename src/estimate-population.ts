import { estimatePopulation } from "./controllers/population-estimation/estimate-population";
import { estimationConfig } from "./population_config";
import { crossValidationPopulationEstimation } from "./controllers/population-estimation/cross-validation-estimate-population";

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
      // await crossValidationPopulationEstimation(estimationConfig);

      await estimatePopulation(estimationConfig);
    });
  },
  (r: any) => {
    console.log(r);
  }
);
