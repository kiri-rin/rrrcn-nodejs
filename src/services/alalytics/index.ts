import { elevationScript } from "./elevation";
import { EEFeatureCollection } from "../../types";
import { geomorphScript } from "./geomorph";
import { globalHabitatScript } from "./global_habitat";
import { era5MounthlyScript } from "./era5_monthly";
export type AnalyticsScriptResult = {
  [param: string]: typeof ee.ComputedObject;
};
export type AnalyticsScript = (
  regions: EEFeatureCollection
) => AnalyticsScriptResult;
const scripts = {
  elevation: elevationScript,
  geomorph: geomorphScript,
  // era5_hourly: require("./era5_hourly"),
  era5_monthly: era5MounthlyScript,
  global_habitat: globalHabitatScript,
};
export default scripts;
