import { EEFeatureCollection } from "../../types";
import { AnalyticsScriptResult } from "./index";

export const globalWindAtlasScript = (regions: EEFeatureCollection) => {
  const data = {
    air_density_50: ee.Image(
      "projects/sat-io/open-datasets/global_wind_atlas/air-density/gwa3_250_air-density_50m"
    ),
    air_density_100: ee.Image(
      "projects/sat-io/open-datasets/global_wind_atlas/air-density/gwa3_250_air-density_100m"
    ),
    air_density_10: ee.Image(
      "projects/sat-io/open-datasets/global_wind_atlas/air-density/gwa3_250_air-density_10m"
    ),
    wind_speed_50: ee.Image(
      "projects/sat-io/open-datasets/global_wind_atlas/wind-speed/gwa3_250_wind-speed_50m"
    ),
    wind_speed_100: ee.Image(
      "projects/sat-io/open-datasets/global_wind_atlas/wind-speed/gwa3_250_wind-speed_100m"
    ),
    wind_speed_10: ee.Image(
      "projects/sat-io/open-datasets/global_wind_atlas/wind-speed/gwa3_250_wind-speed_10m"
    ),
    power_density_50: ee.Image(
      "projects/sat-io/open-datasets/global_wind_atlas/power-density/gwa3_250_power-density_50m"
    ),
    power_density_100: ee.Image(
      "projects/sat-io/open-datasets/global_wind_atlas/power-density/gwa3_250_power-density_100m"
    ),
    power_density_10: ee.Image(
      "projects/sat-io/open-datasets/global_wind_atlas/power-density/gwa3_250_power-density_10m"
    ),
  };
  const res: AnalyticsScriptResult = {};
  Object.entries(data).forEach(([key, image]) => {
    res[key] = image.reduceRegions(
      regions,
      ee.Reducer.first().setOutputs([key])
    );
  });
  res["RIX"] = ee
    .Image("projects/sat-io/open-datasets/global_wind_atlas/ruggedness-index")
    .reduceRegions(regions, ee.Reducer.first().setOutputs(["RIX"]));
  return res;
};
