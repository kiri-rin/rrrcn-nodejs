import type { CrossValidationPopulationEstimationResult } from "../../controllers/population-estimation/cross-validation-estimate-population";
import { EstimatePopulationRandomGenerationResult } from "../../controllers/population-estimation/estimate-population-random-points";

export const findBestAver = (
  cross: CrossValidationPopulationEstimationResult
): EstimatePopulationRandomGenerationResult => {
  return cross.processed.reduce((acc: any, curr: any) => {
    if (
      Math.abs(curr.total - cross.averageTotal) <
      Math.abs(acc.total - cross.averageTotal)
    ) {
      acc = curr;
    }
    return acc;
  }, cross.processed[0]);
};
export const findBestDeviations = (
  cross: CrossValidationPopulationEstimationResult
): EstimatePopulationRandomGenerationResult => {
  return cross.processed.reduce((acc: any, curr: any) => {
    if (
      curr.validatingErrorPercent * curr.validatingErrorPercent +
        curr.trainingErrorPercent * curr.trainingErrorPercent <
      acc.validatingErrorPercent * acc.validatingErrorPercent +
        acc.trainingErrorPercent * acc.trainingErrorPercent
    ) {
      acc = curr;
    }
    return acc;
  }, cross.processed[0]);
};
