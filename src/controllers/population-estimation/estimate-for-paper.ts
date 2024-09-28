import { populationEstimationType } from "@rrrcn/common-types/services/api/common-body";
import {
  crossValidationPopulationEstimation,
  CrossValidationPopulationEstimationResult,
} from "./cross-validation-estimate-population";
import { writeFile } from "fs/promises";
import {
  findBestAver,
  findBestDeviations,
} from "../../services/population-extrapolation/find_best";
import {
  populationEstimationKaratauAreas,
  populationEstimationKaratauThiessens,
} from "../../for-papers/karatau-old/configs/population_estimation_Karatau";
import { estimatePopulationRandomGeneration } from "./estimate-population-random-points";
import { getCsv } from "../../utils/points";
import { PopulationRandomGenerationConfigType } from "../../../../common-types/services/api/population-estimation/configs";

export const estimatePopulationFotPaper = async (
  thiessensConfig: PopulationRandomGenerationConfigType,
  areasConfig: PopulationRandomGenerationConfigType,
  output: string
) => {
  const thiessens = await crossValidationPopulationEstimation(thiessensConfig);
  const areas = await crossValidationPopulationEstimation(areasConfig);

  const csvColumns: (keyof CrossValidationPopulationEstimationResult)[] = [
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
    estimatePopulationRandomGeneration({
      ...thiessensConfig,
      seed: thiessensBest.seed,
      outputs: `${output}/population/thiessensBestMean`,
    }),
    estimatePopulationRandomGeneration({
      ...areasConfig,
      seed: areasBest.seed,
      outputs: `${output}/population/areasBestMean`,
    }),
    estimatePopulationRandomGeneration({
      ...thiessensConfig,
      seed: thiessensBestDev.seed,
      outputs: `${output}/population/thiessensBestDev`,
    }),
    estimatePopulationRandomGeneration({
      ...areasConfig,
      seed: areasBestDev.seed,
      outputs: `${output}/population/areasBestDev`,
    }),
  ]);
};
export const printGenerationPointsCSV = (
  result: CrossValidationPopulationEstimationResult
) => {
  const csvColumns: (keyof CrossValidationPopulationEstimationResult)[] = [
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
    // ["Thiessen", ...csvColumns.map((it) => thiessens[it])],
    ["Areas", ...csvColumns.map((it) => result[it])],
  ];
};
