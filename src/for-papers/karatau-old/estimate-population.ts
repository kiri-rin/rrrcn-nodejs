import { withGEE } from "../../index";
import {
  populationEstimationKaratauAreas,
  populationEstimationKaratauThiessens,
} from "./configs/population_estimation_Karatau";
import { estimatePopulationFotPaper } from "../../controllers/population-estimation/estimate-for-paper";
import { estimatePopulationRandomGeneration } from "../../controllers/population-estimation/estimate-population-random-points";

withGEE(async () => {
  await estimatePopulationRandomGeneration(populationEstimationKaratauAreas);
});
