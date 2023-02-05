const ee = require("@google/earthengine");
const key = require("../.local/ee-key.json");
declare global {
  //@ts-ignore
  let ee: any;
}
//@ts-ignore
globalThis.ee = ee;

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
