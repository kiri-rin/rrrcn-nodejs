import { elevationScript } from "./elevation";
import { EEFeatureCollection } from "../../types";
import { geomorphScript } from "./geomorph";
import { globalHabitatScript } from "./global_habitat";
import { era5MounthlyScript } from "./era5_monthly";
import { dynamicWorldScript } from "./dynamic-world";
import { ndviEviScript } from "./ndvi";
import { DatesConfig } from "../utils/dates";
export type AnalyticsScriptResult = {
  [param: string]: typeof ee.ComputedObject;
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
  ndvi: ((regions, dates: DatesConfig) =>
    ndviEviScript(regions, dates, ["NDVI"])) as AnalyticsScript,
  evi: ((regions, dates: DatesConfig) =>
    ndviEviScript(regions, dates, ["EVI"])) as AnalyticsScript,
};
export type scriptKey = keyof typeof scripts;

export default scripts;
