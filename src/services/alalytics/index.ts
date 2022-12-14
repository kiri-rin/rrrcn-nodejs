import { elevationScript } from "./elevation";
import { EEFeatureCollection } from "../../types";
import { geomorphScript } from "./geomorph";
import { globalHabitatScript } from "./global_habitat";
import { era5MounthlyScript } from "./era5_monthly";
import { dynamicWorldScript } from "./dynamic-world";
export type AnalyticsScriptResult = {
  [param: string]: typeof ee.ComputedObject;
};
export type AnalyticsScript = (
  regions: EEFeatureCollection,
  dateIntervals?: [Date, Date][]
) => AnalyticsScriptResult;
const scripts = {
  elevation: elevationScript,
  geomorph: geomorphScript,
  // era5_hourly: require("./era5_hourly"),
  era5_monthly: era5MounthlyScript,
  global_habitat: globalHabitatScript,
  dynamic_world: dynamicWorldScript,
};
export default scripts;
