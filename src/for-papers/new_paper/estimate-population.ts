import { withGEE } from "../../index";
import {
  populationEstimationKaratauAreas,
  populationEstimationKaratauThiessens,
} from "../karatau-old/configs/population_estimation_Karatau";
import {
  populationEstimationUsturtAreas,
  populationEstimationUsturtThiessens,
} from "./configs/Usturt/population_estimation_Usturt";
import { estimatePopulationFotPaper } from "../../controllers/population-estimation/estimate-for-paper";
import {
  populationEstimationSEKZAreas,
  populationEstimationSEKZThiessens,
} from "./configs/SE-KZ/population_estimation_SEKZ";

withGEE(async () => {
  await estimatePopulationFotPaper(
    populationEstimationSEKZThiessens,
    populationEstimationSEKZAreas,
    "FINAL_RFS/SEKZ"
  );
});
