import * as turf from "@turf/turf";
import { writeFile } from "fs/promises";
import { Feature, featureCollection, Point } from "@turf/turf";
export type GeneralizeAreaPointsServiceArgs = {
  points: GeoJSON.Feature<GeoJSON.Point>[];
  cellSide: number;
};
export const generalizeAreaPointsService = async ({
  points,
  cellSide,
}: GeneralizeAreaPointsServiceArgs) => {
  const convexHull = turf.convex(featureCollection(points));
  console.log("success convex");
  const bbox = turf.bbox(convexHull);
  console.log("success bbox");

  const hexGrid = turf.hexGrid(bbox, cellSide, {
    units: "meters",
    mask: convexHull!.geometry,
  });
  let pointsLeft = points;
  const resultPoints = [];
  for (let hex of hexGrid.features) {
    const centroid = turf.centroid(hex);
    const newPointsLeft: Feature<Point>[] = [];
    const pointsInside: Feature<Point>[] = [];
    if (!pointsLeft.length) {
      break;
    }
    for (let point of pointsLeft) {
      if (turf.booleanPointInPolygon(point, hex)) {
        pointsInside.push(point);
      } else {
        newPointsLeft.push(point);
      }
    }

    pointsLeft = newPointsLeft;
    if (pointsInside.length) {
      console.log("inside", pointsInside.length);
      const nearestPoint = turf.nearest(
        centroid,
        featureCollection(pointsInside)
      );
      resultPoints.push(nearestPoint);
    }
  }
  return resultPoints;
};
