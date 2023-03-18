import { withGEE } from "../../index";
import {
  populationEstimationKaratauAreas,
  populationEstimationKaratauThiessens,
} from "./configs/population_estimation_Karatau";
import { estimatePopulationFotPaper } from "../../controllers/population-estimation/estimate-for-paper";

withGEE(async () => {
  await estimatePopulationFotPaper(
    populationEstimationKaratauThiessens,
    populationEstimationKaratauAreas,
    "FINAL_RFS/KARATAU-OLD"
  );
});
