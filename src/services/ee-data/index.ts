import { elevationScript } from "./elevation";
import { EEFeatureCollection, EEImage } from "../../types";
import { geomorphScript } from "./geomorph";
import { globalHabitatScript } from "./global_habitat";
import { era5MounthlyScript } from "./era5_monthly";
import { dynamicWorldScript } from "./dynamic-world";
import { ndviEviScript } from "./ndvi";
import { DatesConfig } from "../utils/dates";
import { dynamicWorldMeansScript } from "./dynamic-world-means";
import { globalWindAtlasScript } from "./global-wind-atlas";
import { worldClimBioScript } from "./world_clim_bio";
import { dynamicWorldModeScript } from "./dynamic-world-mode";
import { worldCoverScript } from "./world-cover";
import { worldCoverConvolveScript } from "./world-cover-convolve";
export type AnalyticsScriptResult = {
  [param: string]: EEImage;
};
export type AnalyticsScript = (
  regions: EEFeatureCollection,
  datesConfig?: DatesConfig,
  ...args: any
) => AnalyticsScriptResult;
const scripts = {
  elevation: elevationScript,
  geomorph: geomorphScript,
  // era5_hourly: require("./era5_hourly"),
  era5_monthly: era5MounthlyScript,
  global_habitat: globalHabitatScript,
  dynamic_world: dynamicWorldScript,
  dynamic_world_means: dynamicWorldMeansScript,
  dynamic_world_mode: dynamicWorldModeScript,
  global_wind_atlas: globalWindAtlasScript,
  world_clim_bio: worldClimBioScript,
  world_cover: worldCoverScript,
  world_cover_convolve: worldCoverConvolveScript,
  ndvi: ((regions, dates: DatesConfig) =>
    ndviEviScript(regions, dates, ["NDVI"])) as AnalyticsScript,
  evi: ((regions, dates: DatesConfig) =>
    ndviEviScript(regions, dates, ["EVI"])) as AnalyticsScript,
};
export type scriptKey = keyof typeof scripts;

export default scripts;
