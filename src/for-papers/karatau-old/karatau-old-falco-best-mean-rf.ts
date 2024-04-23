import { withGEE } from "../../index";
import { meanClassifiedImages } from "../../controllers/classifications/random-forest/meanClassifiedImages";
import { downloadClassifiedImage } from "../../controllers/classifications/random-forest/utils";
import {
  karatauOldFalcoAllParams,
  karatauOldFalcoProbRFConfigAll,
  karatauOldFalcoRegrRFConfigAll,
} from "./configs/RF-configs-FALCO";

const bestProbModelConfig = { ...karatauOldFalcoProbRFConfigAll };
const bestRegrModelConfig = { ...karatauOldFalcoRegrRFConfigAll };
//@ts-ignore
bestProbModelConfig.validation = {
  ...bestProbModelConfig.validation, //@ts-ignore
  seed: 3 * 3 * 3,
};
//@ts-ignore
bestRegrModelConfig.validation = {
  ...bestRegrModelConfig.validation, //@ts-ignore
  seed: 7 * 7 * 7,
};
bestProbModelConfig.outputs = "FINAL_RFS/KARATAU-OLD-FALCO/BEST/PROB";
bestRegrModelConfig.outputs = "FINAL_RFS/KARATAU-OLD-FALCO/BEST/REGR";
const meanOutputs = "FINAL_RFS/KARATAU-OLD-FALCO/BEST/MEAN";

withGEE(async () => {
  const { meanImage, meanImageSplitted, regionOfInterest } =
    await meanClassifiedImages(
      bestProbModelConfig,
      bestRegrModelConfig,
      meanOutputs
    );
  const bufferedImage = meanImageSplitted
    .convolve(ee.Kernel.circle(2590, "meters", false, 1))
    .gt(0);

  const { promise } = await downloadClassifiedImage({
    classified_image: bufferedImage,
    output: "./.local/outputs/" + meanOutputs,
    regionOfInterest,
    filename: "buffered2590",
    discrete: true,
  });

  await promise;
});
