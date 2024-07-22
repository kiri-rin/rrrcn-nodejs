import {
  AreaMigrationDensityConfig,
  AreaMigrationDensityResult,
} from "./types";
import { MigrationPath } from "../../../controllers/migrations/types";
import { area, intersect, pointsWithinPolygon } from "@turf/turf";
import { featureCollection } from "@turf/helpers";
import { all } from "axios";

export const getAreaMigrationsDensity = (
  config: AreaMigrationDensityConfig
): AreaMigrationDensityResult => {
  const monthsPointsMap = config.migrations
    .flatMap((migration) => migration.features)
    .reduce<Map<number, MigrationPath["features"]>>((acc, point) => {
      const month = new Date(point.properties.date).getMonth();
      if (!acc.has(month)) {
        acc.set(month, []);
      }
      acc.get(month)!.push(point);
      return acc;
    }, new Map());

  return new Array(12).fill(0).map((__, index) => {
    const allMonthPoints: MigrationPath["features"] =
      monthsPointsMap.get(index) || [];
    const areaMonthPoints = pointsWithinPolygon(
      featureCollection(allMonthPoints),
      config.area
    );
    const birdsCount = allMonthPoints
      ? (config.birds_count * areaMonthPoints.features.length) /
        allMonthPoints.length
      : 0;
    return birdsCount * ((1000 * 1000) / area(config.area));
  }) as AreaMigrationDensityResult;
};
