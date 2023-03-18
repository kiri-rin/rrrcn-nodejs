import { populationEstimationType } from "../../analytics_config_types";
import { crossValidationPopulationEstimation } from "./cross-validation-estimate-population";
import { writeFile } from "fs/promises";
import { getCsv } from "../../services/utils/points";
import {
  findBestAver,
  findBestDeviations,
} from "../../services/population-extrapolation/find_best";
import { estimatePopulation } from "./estimate-population";
import {
  populationEstimationKaratauAreas,
  populationEstimationKaratauThiessens,
} from "../../for-papers/karatau-old/configs/population_estimation_Karatau";

export const estimatePopulationFotPaper = async (
  thiessensConfig: populationEstimationType,
  areasConfig: populationEstimationType,
  output: string
) => {
  const thiessens = await crossValidationPopulationEstimation(thiessensConfig);
  const areas = await crossValidationPopulationEstimation(areasConfig);

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
    `./.local/outputs/${output}/population/results.csv`,
    await getCsv(csvTable)
  );
  // const areas = require("../../../.local/outputs/FINAL_RFS/SEKZ/population/cross_100_areas_kz/cross.json");
  // const thiessens = require("../../../.local/outputs/FINAL_RFS/SEKZ/population/cross_100_thiessens_kz/cross.json");
  const thiessensBest = findBestAver(thiessens);
  const areasBest = findBestAver(areas);
  const thiessensBestDev = findBestDeviations(thiessens);
  const areasBestDev = findBestDeviations(areas);
  console.log({ areasBest, thiessensBest, thiessensBestDev, areasBestDev });

  await Promise.all([
    estimatePopulation({
      ...thiessensConfig,
      seed: thiessensBest.seed,
      outputs: `${output}/population/thiessensBestMean`,
    }),
    estimatePopulation({
      ...areasConfig,
      seed: areasBest.seed,
      outputs: `${output}/population/areasBestMean`,
    }),
    estimatePopulation({
      ...thiessensConfig,
      seed: thiessensBestDev.seed,
      outputs: `${output}/population/thiessensBestDev`,
    }),
    estimatePopulation({
      ...areasConfig,
      seed: areasBestDev.seed,
      outputs: `${output}/population/areasBestDev`,
    }),
  ]);
};
