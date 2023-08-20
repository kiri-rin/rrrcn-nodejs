import { withGEE } from "../../index";
import { estimatePopulationFotPaper } from "../../controllers/population-estimation/estimate-for-paper";
import {
  populationEstimationKaratauFalcoAreas,
  populationEstimationKaratauFalcoThiessens,
} from "./configs/population_estimation_Karatau_FALCO";

withGEE(async () => {
  // await estimatePopulationFotPaper(
  //   populationEstimationKaratauFalcoThiessens,
  //   populationEstimationKaratauFalcoAreas,
  //   "FINAL_RFS/KARATAU-OLD-FALCO"
  // );
});
