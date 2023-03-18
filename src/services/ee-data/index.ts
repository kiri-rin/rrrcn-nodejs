import { elevationScript } from "./scripts/elevation";
import { EEFeatureCollection, EEImage } from "../../types";
import { geomorphScript } from "./scripts/geomorph";
import { globalHabitatScript } from "./scripts/global_habitat";
import { era5MounthlyScript } from "./scripts/era5_monthly";
import { dynamicWorldScript } from "./scripts/dynamic-world";
import { ndviEviScript } from "./scripts/ndvi";
import { DatesConfig } from "../utils/dates";
import { dynamicWorldMeansScript } from "./scripts/dynamic-world-means";
import { globalWindAtlasScript } from "./scripts/global-wind-atlas";
import { worldClimBioScript } from "./scripts/world_clim_bio";
import { dynamicWorldModeScript } from "./scripts/dynamic-world-mode";
import { worldCoverScript } from "./scripts/world-cover";
import { worldCoverConvolveScript } from "./scripts/world-cover-convolve";
import { landsatScript } from "./scripts/landsat";
import { alosScript } from "./scripts/alos";
export type AnalyticsScriptResult = {
  [param: string]: EEImage;
};
export type AnalyticsScriptParams = {
  regions: EEFeatureCollection;
  datesConfig?: DatesConfig;
  bands?: string[];
  buffer?: number;
};
export type AnalyticsScript = (
  params: AnalyticsScriptParams
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
  landsat: landsatScript,
  alos: alosScript,
  world_cover_convolve: worldCoverConvolveScript,
  ndvi: (({ regions, datesConfig }: AnalyticsScriptParams) =>
    ndviEviScript({
      regions,
      datesConfig,
      bands: ["NDVI"],
    })) as AnalyticsScript,
  evi: (({ regions, datesConfig }: AnalyticsScriptParams) =>
    ndviEviScript({ regions, datesConfig, bands: ["EVI"] })) as AnalyticsScript,
};
export type scriptKey = keyof typeof scripts;

export default scripts;
