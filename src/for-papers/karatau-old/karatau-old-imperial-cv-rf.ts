import { withGEE } from "../../index";
import { randomForestCV } from "../../controllers/random-forest/cross-validation-random-forest";
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

const configs = [
  // karatauOldImperialProbRFConfigAll,
  karatauOldImperialProbRFConfigDFR,
  karatauOldImperialProbRFConfigInModel,
  karatauOldImperialProbRFConfigInModelDFR,
  karatauOldImperialRegrRFConfigAll,
  karatauOldImperialRegrRFConfigDFR,
  karatauOldImperialRegrRFConfigInModel,
  karatauOldImperialRegrRFConfigInModelDFR,
];
withGEE(async () => {
  for (let config of configs) {
    await randomForestCV(config);
  }
});
