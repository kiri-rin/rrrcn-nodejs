import { withGEE } from "../../index";
import { randomForestCV } from "../../controllers/classifications/random-forest/cross-validation-random-forest";
import {
  karatauOldProbRFConfigAll,
  karatauOldProbRFConfigDFR,
  karatauOldProbRFConfigInModel,
  karatauOldProbRFConfigInModelDFR,
  karatauOldRegrRFConfigAll,
  karatauOldRegrRFConfigDFR,
  karatauOldRegrRFConfigInModel,
  karatauOldRegrRFConfigInModelDFR,
} from "./configs/RF-configs-NEOPHRON";
const configs = [
  karatauOldProbRFConfigAll,
  karatauOldProbRFConfigDFR,
  karatauOldProbRFConfigInModel,
  karatauOldProbRFConfigInModelDFR,
  karatauOldRegrRFConfigAll,
  karatauOldRegrRFConfigDFR,
  karatauOldRegrRFConfigInModel,
  karatauOldRegrRFConfigInModelDFR,
];
withGEE(async () => {
  for (let config of configs) {
    await randomForestCV(config);
  }
});
