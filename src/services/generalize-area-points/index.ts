import * as turf from "@turf/turf";
import { Feature, featureCollection, Point } from "@turf/turf";
export type GeneralizeAreaPointsServiceArgs = {
  points: GeoJSON.Feature<GeoJSON.Point>[];
  cellSide: number;
};
export const generalizeAreaPointsService = ({
  points,
  cellSide,
}: GeneralizeAreaPointsServiceArgs) => {
  const convexHull = turf.convex(featureCollection(points));
  const hexGrid = turf.hexGrid(turf.bbox(convexHull), cellSide, {
    units: "meters",
  });
  let pointsLeft = [...points];
  const resultPoints = [];
  for (let hex of hexGrid.features) {
    const centroid = turf.centroid(hex);
    const { pointsInside, pointsLeft: newPointsLeft } = pointsLeft.reduce(
      (acc, point) => {
        if (turf.booleanPointInPolygon(point, hex)) {
          acc.pointsInside.push(point);
        } else {
          acc.pointsLeft.push(point);
        }
        return acc;
      },
      {
        pointsLeft: [] as Feature<Point>[],
        pointsInside: [] as Feature<Point>[],
      }
    );
    pointsLeft = newPointsLeft;
    if (pointsInside.length) {
      const nearestPoint = turf.nearest(
        centroid,
        featureCollection(pointsInside)
      );
      resultPoints.push(nearestPoint);
    }
  }
  return resultPoints;
};
