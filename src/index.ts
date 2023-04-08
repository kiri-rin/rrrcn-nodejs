const ee = require("@google/earthengine");
const key = require("../.local/ee-key.json");
declare global {
  //@ts-ignore
  let ee: any;
  let strapiLogger: (...log: any) => any;
}
//@ts-ignore
globalThis.ee = ee;
//@ts-ignore
globalThis.strapiLogger = strapiLogger || (() => {});

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
