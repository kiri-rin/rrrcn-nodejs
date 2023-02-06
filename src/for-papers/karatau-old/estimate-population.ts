import { withGEE } from "../../index";
import { estimatePopulation } from "../../controllers/population-estimation/estimate-population";
import { crossValidationPopulationEstimation } from "../../controllers/population-estimation/cross-validation-estimate-population";
import {
  populationEstimationKaratauAreas,
  populationEstimationKaratauThiessens,
} from "./configs/population_estimation_Karatau";
import { writeFile } from "fs/promises";
import { getCsv } from "../../services/utils/points";
import {
  findBestAver,
  findBestDeviations,
} from "../../services/population-extrapolation/find_best";

withGEE(async () => {
  const thiessens = await crossValidationPopulationEstimation(
    populationEstimationKaratauThiessens
  );
  const areas = await crossValidationPopulationEstimation(
    populationEstimationKaratauAreas
  );

  const csvColumns = [
    "minTotal",
    "maxTotal",
    "averageTotal",
    "totalSD",
    "minEstimate",
    "maxEstimate",
    "averageValidationDeviation",
    "averageValidationAbsDeviation",
    "averageTrainingDeviation",
    "averageTrainingAbsDeviation",
  ];
  const csvTable = [
    ["name", ...csvColumns],
    ["Thiessen", ...csvColumns.map((it) => thiessens[it])],
    ["Areas", ...csvColumns.map((it) => areas[it])],
  ];
  await writeFile(
    ".local/outputs/FINAL_RFS/KARATAU-OLD/population/results.csv",
    await getCsv(csvTable)
  );
  const thiessensBest = findBestAver(thiessens);
  const areasBest = findBestAver(areas);
  const thiessensBestDev = findBestDeviations(thiessens);
  const areasBestDev = findBestDeviations(areas);
  console.log({ areasBest, thiessensBest, thiessensBestDev, areasBestDev });

  await Promise.all([
    estimatePopulation({
      ...populationEstimationKaratauThiessens,
      seed: thiessensBest.seed,
      outputs: "FINAL_RFS/KARATAU-OLD/population/thiessensBestMean",
    }),
    estimatePopulation({
      ...populationEstimationKaratauAreas,
      seed: areasBest.seed,
      outputs: "FINAL_RFS/KARATAU-OLD/population/areasBestMean",
    }),
    estimatePopulation({
      ...populationEstimationKaratauThiessens,
      seed: thiessensBestDev.seed,
      outputs: "FINAL_RFS/KARATAU-OLD/population/thiessensBestDev",
    }),
    estimatePopulation({
      ...populationEstimationKaratauAreas,
      seed: areasBestDev.seed,
      outputs: "FINAL_RFS/KARATAU-OLD/population/areasBestDev",
    }),
  ]);
});
