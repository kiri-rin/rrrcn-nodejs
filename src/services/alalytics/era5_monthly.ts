import { AnalyticsScript, AnalyticsScriptResult } from "./index";
import { EEImage } from "../../types";

const DATASET_ID = "ECMWF/ERA5_LAND/MONTHLY";
const years = Array(13)
  .fill(0)
  .map((it, index) => index + 2010);
const monthsRange = [6, 7];
export const era5MounthlyScript: AnalyticsScript = (regions) => {
  const collection = ee.ImageCollection(DATASET_ID).filterBounds(regions);
  const results: AnalyticsScriptResult = {};
  for (let year of years) {
    const date = new Date(year, monthsRange[0], 1, 0, 0, 0, 0);
    const endDate = new Date(year, monthsRange[1], 1, 0, 0, 0, 0);

    const filtered = collection
      .filterDate(ee.Date(date), ee.Date(endDate))
      .select([
        "temperature_2m",
        "total_precipitation",
        "u_component_of_wind_10m",
        "v_component_of_wind_10m",
      ])
      .map(function (image: EEImage) {
        const temperature = recalculateTempToCelsius(image);
        const precipitations = recalculatePrecipitationToTotal(image);
        const windspeed = calculateWindSpeed(image);
        const winddir = calculateWindDir(image);
        image = image.addBands({
          srcImg: temperature
            .addBands(precipitations)
            .addBands(winddir)
            .addBands(windspeed),
          overwrite: true,
        });
        return image
          .select([
            "temperature_2m",
            "total_precipitation",
            "windspeed",
            "winddir",
          ])
          .rename([
            ee.String("temperature_2m_").cat(image.id()),
            ee.String("total_precipitation_").cat(image.id()),
            ee.String("windspeed_").cat(image.id()),
            ee.String("winddir_").cat(image.id()),
          ])
          .reduceRegions(regions, ee.Reducer.first());
      });
    results[`${year}`] = filtered.flatten();
  }
  return results;
};

const recalculateTempToCelsius = (image: EEImage) => {
  return image.select("temperature_2m").subtract(273.15);
};
const recalculatePrecipitationToTotal = (image: EEImage) => {
  //https://confluence.ecmwf.int/pages/viewpage.action?pageId=197702790
  //calculation follows the link above: ERA5 monthly averaged reanalysis
  var month_start = ee.Date(image.get("system:time_start"));
  var month_end = month_start.advance(1, "months");
  var delta = month_end.difference(month_start, "days");

  return image.select("total_precipitation").multiply(1000).multiply(delta);
};
const calculateWindSpeed = (image: EEImage) =>
  image
    .expression("sqrt(u**2 + v**2)", {
      u: image.select("u_component_of_wind_10m"),
      v: image.select("v_component_of_wind_10m"),
    })
    .rename("windspeed");

const calculateWindDir = (image: EEImage) =>
  image
    .expression("mod(180 + (180/3.14) * atan2(v,u),360)", {
      u: image.select("u_component_of_wind_10m"),
      v: image.select("v_component_of_wind_10m"),
    })
    .rename("winddir");
