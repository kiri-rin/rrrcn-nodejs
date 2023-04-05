import { PopulationConfig } from "../../analytics_config_types";
import { estimatePopulationRandomGeneration } from "./estimate-population-random-points";
import { estimatePopulationDistance } from "./estimate-population-distance";

export const populationEstimation = async (config: PopulationConfig) => {
  switch (config.type) {
    case "random-points":
      return await estimatePopulationRandomGeneration({
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
      return "Not implemented";
  }
};
