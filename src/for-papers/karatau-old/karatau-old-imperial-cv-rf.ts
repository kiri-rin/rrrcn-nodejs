import { withGEE } from "../../index";
import { randomForestCV } from "../../controllers/classifications/random-forest/cross-validation-random-forest";
import {
  karatauOldImperialProbRFConfigAll,
  karatauOldImperialProbRFConfigDFR,
  karatauOldImperialProbRFConfigInModel,
  karatauOldImperialProbRFConfigInModelDFR,
  karatauOldImperialRegrRFConfigAll,
  karatauOldImperialRegrRFConfigDFR,
  karatauOldImperialRegrRFConfigInModel,
  karatauOldImperialRegrRFConfigInModelDFR,
} from "./configs/RF-configs-IMPERIAL";
import { downloadClassifiedImage } from "../../controllers/classifications/random-forest/utils";
import { randomForest } from "../../controllers/classifications/random-forest/random-forest";

const configs = [
  {
    ...karatauOldImperialProbRFConfigAll,
    validation: {
      ...karatauOldImperialProbRFConfigAll.validation,
      seed: 8 * 8 * 8,
    },
  },
  {
    ...karatauOldImperialRegrRFConfigAll,
    validation: {
      ...karatauOldImperialRegrRFConfigAll.validation,
      seed: 8 * 8 * 8,
    },
  },
  {
    ...karatauOldImperialProbRFConfigDFR,
    validation: {
      ...karatauOldImperialProbRFConfigDFR.validation,
      seed: 7 * 7 * 7,
    },
  },
  {
    ...karatauOldImperialRegrRFConfigDFR,
    validation: {
      ...karatauOldImperialRegrRFConfigDFR.validation,
      seed: 7 * 7 * 7,
    },
  },
  {
    ...karatauOldImperialProbRFConfigInModel,
    validation: {
      ...karatauOldImperialProbRFConfigInModel.validation,
      seed: 3 * 3 * 3,
    },
  },
  {
    ...karatauOldImperialRegrRFConfigInModel,
    validation: {
      ...karatauOldImperialRegrRFConfigInModel.validation,
      seed: 3 * 3 * 3,
    },
  },
  {
    ...karatauOldImperialProbRFConfigInModelDFR,
    validation: {
      ...karatauOldImperialProbRFConfigInModelDFR.validation,
      seed: 8 * 8 * 8,
    },
  },
  {
    ...karatauOldImperialRegrRFConfigInModelDFR,
    validation: {
      ...karatauOldImperialRegrRFConfigInModelDFR.validation,
      seed: 10 * 10 * 10,
    },
  },
];
withGEE(async () => {
  await Promise.all(configs.map((config) => randomForest(config)));
});
// withGEE(async () => {
//   for (let [config1, config2] of configs) {
//     const {
//       mean_image: mean1,
//       best_image: best1,
//       regionOfInterest,
//     } = await randomForestCV(config1);
//     const { mean_image: mean2, best_image: best2 } = await randomForestCV(
//       config2
//     );
//     const output =
//       "IMPERIAL/" +
//       config1.outputs?.split("/").reverse()[0] +
//       "_" +
//       config2.outputs?.split("/").reverse()[0];
//     for (let [key, meanImage] of Object.entries({
//       mean: mean1.add(mean2).divide(2),
//       bestMean: best1.add(best2).divide(2),
//     })) {
//       await downloadClassifiedImage({
//         classified_image: meanImage,
//         regionOfInterest,
//         output: "./.local/outputs/" + output,
//         filename: key,
//       });
//       // await downloadClassifiedImage({
//       //   classified_image: meanImage.gte(60),
//       //   regionOfInterest,
//       //   output: output,
//       //   filename: key,
//       // });
//       // await downloadClassifiedImage({
//       //   classified_image: meanImage
//       //     .gte(60)
//       //     .convolve(ee.Kernel.circle(7500, "meters", false, 1))
//       //     .gt(0),
//       //   regionOfInterest,
//       //   output: output,
//       //   filename: key,
//       // });
//     }
//   }
// });
