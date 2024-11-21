import { estimatePopulationRandomGeneration } from "./estimate-population-random-points";
import { estimatePopulationDistance } from "./estimate-population-distance";
import { estimatePopulationDensity } from "./estimate-population-density";
import { crossValidationPopulationEstimation } from "./cross-validation-estimate-population";
import { Configs } from "../../../../common-types/services/api/population-estimation/configs";

export const populationEstimation = async (config: Configs) => {
  switch (config.type) {
    case "random-points":
      return await (config.config.crossValidation
        ? crossValidationPopulationEstimation
        : estimatePopulationRandomGeneration)({
        ...config.config,
        outputs: config.outputs || config.config.outputs,
      });
    case "distance": {
      return await estimatePopulationDistance({
        ...config.config,
        outputs: config.outputs || config.config.outputs,
      });
    }
    case "density":
    default:
      return await estimatePopulationDensity({
        ...config.config,
        outputs: config.outputs || config.config.outputs,
      });
  }
};
