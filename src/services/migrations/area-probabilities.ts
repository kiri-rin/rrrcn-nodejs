import {
  IndexedMigration,
  MigrationPath,
} from "../../controllers/migrations/types";

export type GetAreaMigrationProbabilitiesArgs = {
  area: GeoJSON.BBox;
  migrations: MigrationPath[];
};
export type FindFirsOutlierArgs = {
  area: GeoJSON.BBox;
  migration: MigrationPath;
};
export type GetAreaMigrationProbabilitiesReturn = {
  top: number;
  right: number;
  left: number;
  bottom: number;
};

export const getAreaMigrationProbabilities = ({
  migrations,
  area,
}: GetAreaMigrationProbabilitiesArgs): GetAreaMigrationProbabilitiesReturn => {
  const res: GetAreaMigrationProbabilitiesReturn = {
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  };
  let total = 0;
  for (let migration of migrations) {
    const reversedFeatures = migration.features.reverse();
    const lastInlierIndex = reversedFeatures.findIndex(
      (it, index) => !isPointOutsideBBox(it.geometry, area)
    );
    if (lastInlierIndex === -1 || lastInlierIndex === migrations.length - 1) {
      continue;
    }

    total++;

    const inlier = reversedFeatures[lastInlierIndex];
    const outlier = reversedFeatures[lastInlierIndex + 1];
    const line = getLineFunction(inlier.geometry, outlier.geometry);
    const outlierX = outlier.geometry.coordinates[0];
    const outlierY = outlier.geometry.coordinates[1];
    if (outlierX < area[0]) {
      const leftEdgeIntersectionY = line(area[0]);
      if (leftEdgeIntersectionY < area[1]) {
        res.bottom++;
      } else {
        if (leftEdgeIntersectionY > area[3]) {
          res.top++;
        } else {
          res.left++;
        }
      }
    } else {
      if (outlierX > area[2]) {
        const rightEdgeIntersectionY = line(area[2]);
        if (rightEdgeIntersectionY < area[1]) {
          res.bottom++;
        } else {
          if (rightEdgeIntersectionY > area[3]) {
            res.top++;
          } else {
            res.left++;
          }
        }
      } else {
        if (outlierY < area[1]) {
          res.bottom++;
        } else {
          res.top++;
        }
      }
    }
  }
  return res;
};
const isPointOutsideBBox = (point: GeoJSON.Point, bbox: GeoJSON.BBox) =>
  bbox[0] > point.coordinates[0] ||
  bbox[1] > point.coordinates[1] ||
  bbox[2] < point.coordinates[0] ||
  bbox[3] > point.coordinates[1];
const getLineFunction =
  (point1: GeoJSON.Point, point2: GeoJSON.Point) =>
  (x: number): number => {
    const c =
      (point2.coordinates[0] - point1.coordinates[0]) /
      (point2.coordinates[1] - point1.coordinates[1]);
    return (x - point1.coordinates[0] + c * point1.coordinates[1]) / c;
  };
