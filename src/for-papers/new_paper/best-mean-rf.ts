import { withGEE } from "../../index";
import { meanClassifiedImages } from "../../controllers/random-forest/meanClassifiedImages";
import { validateClassifiedImage } from "../../controllers/random-forest/validateClassifier";
import { downloadClassifiedImage } from "../../controllers/random-forest/utils";
import { mkdir } from "fs/promises";
import {
  karatauProbRFConfigUniqParams,
  karatauRegrRFConfigUniqParams,
} from "./configs/Karatau/RF-configs";
import {
  usturtProbRFConfigCommonParamsForAllFiltered,
  usturtRegrRFConfigCommonParamsForAllFiltered,
} from "./configs/Usturt/RF-configs";
import {
  SEKZProbRFConfigUniqParams,
  SEKZRegrRFConfigUniqParams,
} from "./configs/SE-KZ/RF-configs";

const bestKaratauNewProbModelConfig = { ...karatauProbRFConfigUniqParams };
const bestKaratauNewRegrModelConfig = { ...karatauRegrRFConfigUniqParams };

const bestUsturtProbModelConfig = {
  ...usturtProbRFConfigCommonParamsForAllFiltered,
};
const bestUsturtRegrModelConfig = {
  ...usturtRegrRFConfigCommonParamsForAllFiltered,
};

const bestSEKZProbModelConfig = { ...SEKZProbRFConfigUniqParams };
const bestSEKZRegrModelConfig = { ...SEKZRegrRFConfigUniqParams };

//@ts-ignore
bestUsturtProbModelConfig.validation.seed = 4 * 4 * 4;
//@ts-ignore
bestUsturtRegrModelConfig.validation.seed = 4 * 4 * 4;
//@ts-ignore
bestSEKZProbModelConfig.validation.seed = 7 * 7 * 7;
//@ts-ignore
bestSEKZRegrModelConfig.validation.seed = 7 * 7 * 7;

bestKaratauNewProbModelConfig.outputs = "FINAL_RFS/KARATAU/BEST/PROB";
bestKaratauNewRegrModelConfig.outputs = "FINAL_RFS/KARATAU/BEST/REGR";
bestUsturtProbModelConfig.outputs = "FINAL_RFS/USTURT/BEST/PROB";
bestUsturtRegrModelConfig.outputs = "FINAL_RFS/USTURT/BEST/REGR";
bestSEKZProbModelConfig.outputs = "FINAL_RFS/SEKZ/BEST/PROB";
bestSEKZRegrModelConfig.outputs = "FINAL_RFS/SEKZ/BEST/REGR";

const meanOutputs = "FINAL_RFS/SE/BEST/MEAN";

withGEE(async () => {
  const { meanImage, meanImageSplitted, regionOfInterest } =
    await meanClassifiedImages(
      bestSEKZProbModelConfig,
      bestSEKZRegrModelConfig,
      meanOutputs
    );
  const bufferedImage = meanImageSplitted
    .convolve(ee.Kernel.circle(5600, "meters", false, 1))
    .gt(0);

  const { promise } = await downloadClassifiedImage({
    classified_image: bufferedImage,
    output: "./local/outputs/" + meanOutputs,
    regionOfInterest,
    filename: "buffered5600",
    discrete: true,
  });

  await promise;
});
