import { withGEE } from "../../index";
import { meanClassifiedImages } from "../../controllers/classifications/random-forest/meanClassifiedImages";
import { downloadClassifiedImage } from "../../controllers/classifications/random-forest/utils";
import {
  karatauOldFalcoAllParams,
  karatauOldFalcoProbRFConfigAll,
  karatauOldFalcoRegrRFConfigAll,
} from "./configs/RF-configs-FALCO";
import {
  karatauOldImperialInModelDFRParams,
  karatauOldImperialProbRFConfigInModel,
  karatauOldImperialProbRFConfigInModelDFR,
  karatauOldImperialRegrRFConfigInModel,
  karatauOldImperialRegrRFConfigInModelDFR,
} from "./configs/RF-configs-IMPERIAL";

const bestProbModelConfig = { ...karatauOldImperialProbRFConfigInModelDFR };
const bestRegrModelConfig = { ...karatauOldImperialRegrRFConfigInModel };
//@ts-ignore
bestProbModelConfig.validation = {
  ...bestProbModelConfig.validation, //@ts-ignore
  seed: 6 * 6 * 6,
};
//@ts-ignore
bestRegrModelConfig.validation = {
  ...bestRegrModelConfig.validation, //@ts-ignore
  seed: 6 * 6 * 6,
};
bestProbModelConfig.outputs = "FINAL_RFS/KARATAU-OLD-IMPERIAL/BEST/PROB";
bestRegrModelConfig.outputs = "FINAL_RFS/KARATAU-OLD-IMPERIAL/BEST/REGR";
const meanOutputs = "FINAL_RFS/KARATAU-OLD-IMPERIAL/BEST/MEAN";

withGEE(async () => {
  const { meanImage, meanImageSplitted, regionOfInterest } =
    await meanClassifiedImages(
      bestRegrModelConfig,
      bestProbModelConfig,

      meanOutputs,
      40
    );
  const bufferedImage = meanImageSplitted
    .convolve(ee.Kernel.circle(7500, "meters", false, 1))
    .gt(0);

  const { promise } = await downloadClassifiedImage({
    classified_image: bufferedImage,
    output: "./.local/outputs/" + meanOutputs,
    regionOfInterest,
    filename: "buffered7500",
    discrete: true,
  });

  await promise;
});
