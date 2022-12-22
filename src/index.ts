import { main } from "./main";
const ee = require("@google/earthengine");
const key = require("../.local/ee-key.json");
declare global {
  let ee: any;
}
//@ts-ignore
globalThis.ee = ee;

ee.data.authenticateViaPrivateKey(
  key,
  () => {
    ee.initialize(null, null, async () => {
      await main();
    });
  },
  (r: any) => {
    console.log(r);
  }
);
