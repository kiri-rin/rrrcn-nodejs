import { AnalyticsScript, AnalyticsScriptResult } from "../index";
import { getEra5Script } from "./era5_monthly";

const DATASET_ID = "ECMWF/ERA5_LAND/HOURLY";
const years = Array(13)
  .fill(0)
  .map((it, index) => index + 2010);
const monthsRange = [6, 7];
const recalc_bands: any = {
  windspeed: ["u_component_of_wind_10m", "v_component_of_wind_10m"],
  winddir: ["u_component_of_wind_10m", "v_component_of_wind_10m"],
};
export const era5HourlyScript: AnalyticsScript = getEra5Script(DATASET_ID);
