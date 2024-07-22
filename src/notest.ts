import { withGEE } from "./index";
import { evaluateFeatures } from "./utils/gee-api";
import { evaluatePromisify } from "./utils/ee-image";

withGEE(async () => {
  const feature = ee.Feature(null, { tes: 1 });
  // await feature.evaluate(() => {
  const res = await evaluateFeatures(feature);
  // console.log(await res.promise);

  // });
});
