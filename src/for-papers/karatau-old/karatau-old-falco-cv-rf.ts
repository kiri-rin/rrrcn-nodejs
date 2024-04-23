import { withGEE } from "../../index";
import { randomForestCV } from "../../controllers/classifications/random-forest/cross-validation-random-forest";
import {
  karatauOldFalcoProbRFConfigAll,
  karatauOldFalcoProbRFConfigDFR,
  karatauOldFalcoProbRFConfigInModel,
  karatauOldFalcoProbRFConfigInModelDFR,
  karatauOldFalcoRegrRFConfigAll,
  karatauOldFalcoRegrRFConfigDFR,
  karatauOldFalcoRegrRFConfigInModel,
  karatauOldFalcoRegrRFConfigInModelDFR,
} from "./configs/RF-configs-FALCO";
const configs = [
  karatauOldFalcoProbRFConfigAll,
  // karatauOldFalcoProbRFConfigDFR,
  // karatauOldFalcoProbRFConfigInModel,
  // karatauOldFalcoProbRFConfigInModelDFR,
  karatauOldFalcoRegrRFConfigAll,
  // karatauOldFalcoRegrRFConfigDFR,
  // karatauOldFalcoRegrRFConfigInModel,
  // karatauOldFalcoRegrRFConfigInModelDFR,
];
withGEE(async () => {
  for (let config of configs) {
    await randomForestCV(config);
  }
});
