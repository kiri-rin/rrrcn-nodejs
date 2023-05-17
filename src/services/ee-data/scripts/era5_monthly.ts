import { AnalyticsScript, AnalyticsScriptResult } from "../index";
import { EEFeatureCollection, EEImage } from "../../../types";
import { afterEach } from "node:test";
import { dateIntervalsToConfig } from "../../../utils/dates";

const DATASET_ID = "ECMWF/ERA5_LAND/MONTHLY";
const years = Array(13)
  .fill(0)
  .map((it, index) => index + 2010);
const monthsRange = [6, 7];
const recalc_bands: any = {
  windspeed: ["u_component_of_wind_10m", "v_component_of_wind_10m"],
  winddir: ["u_component_of_wind_10m", "v_component_of_wind_10m"],
};
export const era5MounthlyScript: AnalyticsScript = ({
  regions,
  bands = ["temperature_2m", "total_precipitation", "windspeed", "winddir"],
  datesConfig = dateIntervalsToConfig([]),
}) => {
  const collection = ee.ImageCollection(DATASET_ID).filterBounds(regions);
  const results: AnalyticsScriptResult = {};
  for (let [key, dateIntervals] of Object.entries(datesConfig || {})) {
    for (let [start, end] of dateIntervals) {
      const filtered = collection
        .filterDate(ee.Date(start), ee.Date(end))
        .select(bands?.flatMap((band) => recalc_bands[band] || [band]))
        .map(function (image: EEImage) {
          for (let band of bands) {
            if (band?.includes("temperature")) {
              image = image.addBands({
                srcImg: recalculateTempToCelsius(image.select(band)),
                overwrite: true,
              });
            }
          }
          if (bands?.includes("total_precipitation")) {
            image = image.addBands({
              srcImg: recalculatePrecipitationToTotal(image),
              overwrite: true,
            });
          }
          if (bands?.includes("windspeed")) {
            image = image.addBands(calculateWindSpeed(image));
          }
          if (bands?.includes("winddir")) {
            image = image.addBands(calculateWindDir(image));
          }

          return ee.Image(
            image
              .select(bands)
              .rename(
                bands.map((band) => ee.String(`${band}_`).cat(image.id()))
              )
          );
        });
      results[`${key}`] = filtered.reduce(ee.Reducer.mode());
    }
  }

  return results;
};

const recalculateTempToCelsius = (image: EEImage) => {
  return image.subtract(273.15);
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
