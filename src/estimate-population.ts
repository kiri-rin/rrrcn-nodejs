import { estimatePopulation } from "./controllers/estimate-population";
import { estimationConfig } from "./population_config";

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
      await estimatePopulation(estimationConfig);
    });
  },
  (r: any) => {
    console.log(r);
  }
);
