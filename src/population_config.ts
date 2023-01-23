import { scriptKey } from "./services/ee-data";
import { DatesConfig } from "./services/utils/dates";
import { randomForestConfig, ScriptConfig } from "./analytics_config_types";
import { populationEstimationKaratau } from "./configs/Karatau/population_estimation_Karatau";

export type populationEstimationType = {
  latitude_key?: string;
  longitude_key?: string;
  id_key?: string;
  outputs: string;
  seed?: number;
  areasSHPZIPPath: string;
  regionOfInterestCsvPath: string;
  classified_image_id: string;
} & (
  | { pointsCsvPath: string; pointsSHPZIPPath?: undefined }
  | { pointsCsvPath?: undefined; pointsSHPZIPPath: string }
);
export const estimationConfig: populationEstimationType =
  populationEstimationKaratau;
