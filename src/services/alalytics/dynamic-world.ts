import { AnalyticsScript, AnalyticsScriptResult } from "./index";
import { EEImage } from "../../types";

const util = require("util");
var targets = [
  "Water",
  "Trees",
  "Grass",
  "Flooded_vegetation",
  "Crops",
  "Shrub_and_scrub",
  "Built",
  "Bare",
  "Snow_and_ice",
];
const intervalsInMonth: [number, number | "end"][] = [
  [1, 10],
  [11, 20],
  [20, "end"],
];
const monthIntervals: [number, number][] = [[3, 6]];
const yearsIntervals: [number, number][] = [[2020, 2020]];
export const getDateIntervals = (
  yearsIntervals: [number, number][],
  monthIntervals: [number, number][],
  intervalsInMonth?: [number, number | string][]
) =>
  yearsIntervals.flatMap(([yearStart, yearEnd]) => {
    const res: [Date, Date][] = [];
    for (let year = yearStart; year <= yearEnd; year++) {
      const currentYearIntervals = monthIntervals.flatMap(
        ([monthStart, monthEnd]) => {
          const monthsRes: [Date, Date][] = [];
          if (!intervalsInMonth) {
            res.push([
              new Date(year, monthStart, 1),
              new Date(year, monthEnd + 1, 0),
            ]);
          } else {
            for (let month = monthStart; month <= monthEnd; month++) {
              const currentMonthIntervals = intervalsInMonth.map(
                ([dateStart, dateEnd]) => {
                  let start = new Date(year, month, dateStart);
                  let end = new Date(year, month);
                  if (typeof dateEnd === "string") {
                    end = new Date(year, month + 1, 0);
                  } else {
                    end.setDate(dateEnd);
                  }
                  return [start, end] as [Date, Date];
                }
              );
              monthsRes.push(...currentMonthIntervals);
            }
          }
          return monthsRes;
        }
      );
      res.push(...currentYearIntervals);
    }
    return res;
  });
let dateIntervalsDefault: [Date, Date][] = getDateIntervals(
  yearsIntervals,
  monthIntervals,
  intervalsInMonth
);
// dateIntervals = [[new Date(2017, 4, 1), new Date(2017, 4, 10)]];

export const dynamicWorldScript: AnalyticsScript = (
  regions,
  dateIntervals: [Date, Date][] = dateIntervalsDefault
) => {
  const areaPerPixel = ee.Image.pixelArea();

  const collection = ee.ImageCollection("GOOGLE/DYNAMICWORLD/V1");
  const res: AnalyticsScriptResult = {};

  for (let target of targets) {
    const target_index = targets.indexOf(target);
    dateIntervals.forEach((interval, index) => {
      const [startDate, endDate] = interval.map((it) => ee.Date(it));
      const nDays = Math.round(
        (interval[1].getTime() - interval[0].getTime()) / (1000 * 60 * 60 * 24)
      );
      const key = interval
        .map((it) => it.toLocaleDateString("ru").split(".").join(""))
        .join("_");
      const step = 1;
      var period_available = collection
        .filterDate(startDate, endDate)
        .filterBounds(regions)
        .select("label");
      res[`${target}_${key}`] = ee
        .Image(
          ee.Algorithms.If(
            period_available.size().gt(0),
            period_available
              .reduce(ee.Reducer.mode())
              .eq(target_index)
              .selfMask()
              .multiply(areaPerPixel)
              .divide(1e6)
              .set("system:time_start", startDate),
            ee.Image().set("empty", 1)
          )
        )

        // res[`${target}_${key}`] = ee
        //   .ImageCollection(
        //     // console.log({ interval });
        //     Array(nDays)
        //       .fill(0)
        //       .map((zero, n: Number) => {
        //         const ini = startDate.advance(n, "day");
        //         const end = ini.advance(step, "day");
        //         var period_available = collection
        //           .filterDate(ini, end)
        //           .filterBounds(regions)
        //           .select("label");
        //         return ee.Algorithms.If(
        //           period_available.size().gt(0),
        //           period_available
        //             .reduce(ee.Reducer.mode())
        //             .eq(target_index)
        //             .selfMask()
        //             .multiply(areaPerPixel)
        //             .divide(1e6)
        //             .set("system:time_start", ini),
        //           ee.Image().set("empty", 1)
        //         );
        //       })
        //   )
        //   .filter("empty != 1")
        //   .reduce(ee.Reducer.mean())
        .reduceRegions(
          regions,
          ee.Reducer.sum().setOutputs([`${target}_${key}`]),
          100
        );
    });
  }
  return res;
  // var step = 3;
  //
  // var water_value_in_original_dataset = 6;
  //
  //
  // var target_index = 5;
  // var target = "Water";
  //
  // function generate_collection(geometry, target_index) {
  //   var byMonth = ee.ImageCollection(
  //     ee.List.sequence(0, nMonths, step).map(function (n) {
  //       var ini = ee.Date(startDate).advance(n, "month");
  //       var end = ini.advance(step, "month");
  //
  //       return image;
  //     })
  //   );
  //   return byMonth;
  // }
  //
  // function control(panel) {
  //   function refresh(geometry, target) {
  //     target_index = targets.indexOf(target);
  //
  //     var ini = ee.Date(startDate).advance(0, "month");
  //     var end = ini.advance(3, "month");
  //
  //     var byMonth = generate_collection(geometry, target_index);
  //     const data = byMonth
  //       .map(function (image) {
  //         return image.rename([target]);
  //       })
  //       .map((it) => {
  //         const reduction = it.reduceRegion(ee.Reducer.sum(), geometry, 100);
  //         return ee.Feature(null, {
  //           [target]: reduction.get(target),
  //           "system:time_start": it.get("system:time_start"),
  //         });
  //       });
  //   }
  //
  //   refresh(geometry, target);
  // }
  // control();
};
// const generateCollectionByDays = (nDays, step, startDate, key, target) => {};
