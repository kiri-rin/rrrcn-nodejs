import {
  karatauOldProbRFConfigInModel,
  karatauOldRegrRFConfigInModel,
} from "./configs/RF-configs-NEOPHRON";
import { withGEE } from "../../index";
import { meanClassifiedImages } from "../../controllers/classifications/random-forest/meanClassifiedImages";
import { validateClassifiedImage } from "../../controllers/classifications/random-forest/validateClassifier";
import { downloadClassifiedImage } from "../../controllers/classifications/random-forest/utils";
import { mkdir } from "fs/promises";

const bestProbModelConfig = { ...karatauOldProbRFConfigInModel };
const bestRegrModelConfig = { ...karatauOldRegrRFConfigInModel };
//@ts-ignore
bestProbModelConfig.validation.seed = 7 * 7 * 7;
//@ts-ignore
bestRegrModelConfig.validation.seed = 7 * 7 * 7;
bestProbModelConfig.outputs = "FINAL_RFS/KARATAU-OLD/BEST/PROB";
bestRegrModelConfig.outputs = "FINAL_RFS/KARATAU-OLD/BEST/REGR";
const meanOutputs = "FINAL_RFS/KARATAU-OLD/BEST/MEAN";

withGEE(async () => {
  const { meanImage, meanImageSplitted, regionOfInterest } =
    await meanClassifiedImages(
      bestProbModelConfig,
      bestRegrModelConfig,
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

  await validateClassifiedImage({
    classified_image: { type: "computedObject", object: meanImage },
    validationPoints: {
      type: "all-points",
      allPoints: {
        points: {
          type: "csv",
          id_key: "Name",
          latitude_key: "Y_coord",
          longitude_key: "X_coord",
          path: "./src/for-papers/karatau-old/assets/np-karatau-для валидации.csv",
        },
      },
    },
    outputs: meanOutputs + "/validation-new",
  });
  await validateClassifiedImage({
    classified_image: { type: "computedObject", object: meanImage },
    validationPoints: {
      type: "separate-points",
      presencePoints: {
        type: "csv",
        path: "./src/for-papers/karatau-old/assets/birds-kz-valid.csv",
      },
      absencePoints: {
        type: "csv",
        id_key: "Name",
        latitude_key: "Y_coord",
        longitude_key: "X_coord",
        path: "./src/for-papers/karatau-old/assets/absence-points.csv",
      },
    },
    outputs: meanOutputs + "/validation-birds-kz",
  });
  await promise;
});
