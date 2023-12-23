import { MigrationPath } from "../../controllers/migrations/types";
import * as turf from "@turf/turf";
export type GetAreaMigrationProbabilitiesArgs = {
  area: GeoJSON.BBox;
  migrations: MigrationPath[];
};
export type FindFirsOutlierArgs = {
  area: GeoJSON.BBox;
  migration: MigrationPath;
};
export type GetAreaMigrationProbabilitiesReturn = {
  [p in Directions]: number;
};
export enum Directions {
  TOP = "top",
  LEFT = "left",
  BOTTOM = "bottom",
  RIGHT = "right",
  STOP = "stop",
}
export const getAreaMigrationProbabilities = ({
  migrations,
  area,
}: GetAreaMigrationProbabilitiesArgs): GetAreaMigrationProbabilitiesReturn => {
  const res: GetAreaMigrationProbabilitiesReturn = {
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    stop: 0,
  };
  let total = 0;
  let intersection: GeoJSON.Feature<GeoJSON.Point> | undefined;

  for (let migration of migrations) {
    const reversedFeatures = [...migration.features].reverse();
    const currentMigrationRes = {
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      stop: 0,
    };
    const allLastInliers = reversedFeatures.reduce((acc, it, index, arr) => {
      if (
        (!isPointOutsideBBox(it.geometry, area) &&
          (!arr[index - 1] ||
            isPointOutsideBBox(arr[index - 1].geometry, area))) ||
        (isPointOutsideBBox(it.geometry, area) &&
          arr[index - 1] &&
          isPointOutsideBBox(arr[index - 1].geometry, area) &&
          turf.lineIntersect(
            turf.lineString([
              arr[index - 1].geometry.coordinates,
              it.geometry.coordinates,
            ]),
            turf.lineString(turf.bboxPolygon(area).geometry.coordinates[0])
          ).features[0])
      ) {
        acc.push(index);
      }
      return acc;
    }, [] as number[]);
    // let lastInlierIndex = reversedFeatures.findIndex(
    //   (it, index, arr) =>
    //     !isPointOutsideBBox(it.geometry, area) ||
    //     (arr[index - 1] &&
    //       turf.lineIntersect(
    //         turf.lineString([
    //           arr[index - 1].geometry.coordinates,
    //           it.geometry.coordinates,
    //         ]),
    //         turf.lineString(turf.bboxPolygon(area).geometry.coordinates[0])
    //       ).features[0])
    // );
    for (let lastInlierIndex of allLastInliers) {
      if (lastInlierIndex === 0) {
        !currentMigrationRes.stop && currentMigrationRes.stop++;
        continue;
      }

      const inlier = reversedFeatures[lastInlierIndex];
      const outlier = reversedFeatures[lastInlierIndex - 1];
      const line = getLineFunction(inlier.geometry, outlier.geometry);
      const outlierX = outlier.geometry.coordinates[0];
      const outlierY = outlier.geometry.coordinates[1];
      if (outlierX < area[0]) {
        const leftEdgeIntersectionY = line(area[0]);
        if (leftEdgeIntersectionY < area[1]) {
          !currentMigrationRes.bottom && currentMigrationRes.bottom++;
        } else {
          if (leftEdgeIntersectionY >= area[3]) {
            !currentMigrationRes.top && currentMigrationRes.top++;
          } else {
            !currentMigrationRes.left && currentMigrationRes.left++;
          }
        }
      } else {
        if (outlierX > area[2]) {
          const rightEdgeIntersectionY = line(area[2]);
          if (rightEdgeIntersectionY < area[1]) {
            !currentMigrationRes.bottom && currentMigrationRes.bottom++;
          } else {
            if (rightEdgeIntersectionY > area[3]) {
              !currentMigrationRes.top && currentMigrationRes.top++;
            } else {
              !currentMigrationRes.right && currentMigrationRes.right++;
            }
          }
        } else {
          if (outlierY < area[1]) {
            !currentMigrationRes.bottom && currentMigrationRes.bottom++;
          } else {
            !currentMigrationRes.top && currentMigrationRes.top++;
          }
        }
      }
    }
    total += Object.values(currentMigrationRes).filter((it) => it).length
      ? 1
      : 0;
    res.top += currentMigrationRes.top;
    res.bottom += currentMigrationRes.bottom;
    res.left += currentMigrationRes.left;
    res.right += currentMigrationRes.right;
    res.stop += currentMigrationRes.stop;
  }
  // if (total) {
  //   res.top = res.top / total;
  //   res.bottom = res.bottom / total;
  //   res.left = res.left / total;
  //   res.right = res.right / total;
  //   res.stop = res.stop / total;
  // }
  return res;
};
export const randomlyChooseDirection = (
  probabiities: GetAreaMigrationProbabilitiesReturn
) => {
  console.log({ probabiities });
  const intervals: { [p in Directions]?: [number, number] } = {};
  intervals[Directions.TOP] = [0, probabiities.top];
  intervals[Directions.LEFT] = [
    intervals[Directions.TOP][1],
    intervals[Directions.TOP][1] + probabiities.left,
  ];
  intervals[Directions.BOTTOM] = [
    intervals[Directions.LEFT][1],
    intervals[Directions.LEFT][1] + probabiities.bottom,
  ];
  intervals[Directions.RIGHT] = [
    intervals[Directions.BOTTOM][1],
    intervals[Directions.BOTTOM][1] + probabiities.right,
  ];
  intervals[Directions.STOP] = [
    intervals[Directions.RIGHT][1],
    intervals[Directions.RIGHT][1] + probabiities.stop,
  ];
  const randomNumber =
    Math.random() * Object.values(probabiities).reduce((a, b) => a + b, 0);

  for (let [direction, interval] of Object.entries(intervals)) {
    console.log(randomNumber, interval);
    if (isNumberInInterval(randomNumber, interval)) {
      return direction as Directions;
    }
  }
};
export const oppositeDirections: { [p in Directions]: Directions } = {
  [Directions.RIGHT]: Directions.LEFT,
  [Directions.TOP]: Directions.BOTTOM,
  [Directions.BOTTOM]: Directions.TOP,
  [Directions.LEFT]: Directions.RIGHT,
  [Directions.STOP]: Directions.STOP,
};
export const findNeighbourAreaIndex = (
  areas: GeoJSON.BBox[],
  area: GeoJSON.BBox,
  direction: Directions
) => {
  switch (direction) {
    case Directions.BOTTOM: {
      return areas.findIndex(
        ([left, bottom, right, top]) => left === area[0] && top === area[1]
      );
    }
    case Directions.RIGHT: {
      return areas.findIndex(
        ([left, bottom, right, top]) => left === area[2] && top === area[3]
      );
    }
    case Directions.TOP: {
      return areas.findIndex(
        ([left, bottom, right, top]) => left === area[0] && bottom === area[3]
      );
    }
    case Directions.LEFT: {
      return areas.findIndex(
        ([left, bottom, right, top]) => right === area[0] && top === area[3]
      );
    }
    default:
      return -1;
  }
};
const isNumberInInterval = (number: number, interval: [number, number]) =>
  interval[0] !== interval[1] && interval[0] <= number && interval[1] >= number;

export const isPointOutsideBBox = (point: GeoJSON.Point, bbox: GeoJSON.BBox) =>
  bbox[0] > point.coordinates[0] ||
  bbox[1] > point.coordinates[1] ||
  bbox[2] < point.coordinates[0] ||
  bbox[3] < point.coordinates[1];

const getLineFunction =
  (point1: GeoJSON.Point, point2: GeoJSON.Point) =>
  (x: number): number => {
    const c =
      (x - point1.coordinates[0]) /
      (point2.coordinates[0] - point1.coordinates[0]);
    return (
      (point2.coordinates[1] - point1.coordinates[1]) * c +
      point1.coordinates[1]
    );
  };
// const getLineFunctionY =
//   (point1: GeoJSON.Point, point2: GeoJSON.Point) =>
//   (y: number): number => {
//     const c =
//       (y - point1.coordinates[1]) /
//       (point2.coordinates[1] - point1.coordinates[1]);
//     return (
//       (point2.coordinates[0] - point1.coordinates[0]) * c +
//       point1.coordinates[0]
//     );
//   };
//
// const isIntervalIntersectsBBox = (
//   interval: [GeoJSON.Point, GeoJSON.Point],
//   area: GeoJSON.BBox
// ): false | GeoJSON.Feature<GeoJSON.Point> => {
//   const [x1, y1] = interval[0].coordinates;
//   const [x2, y2] = interval[1].coordinates;
//   const [a_x1, a_y1, a_x2, a_y2] = area;
//   if (
//     (x1 - a_x1) * (x1 - a_x2) > 0 &&
//     (x2 - a_x1) * (x2 - a_x2) > 0 &&
//     (x1 - a_x1) * (x2 - a_x1) > 0
//   ) {
//     return false;
//   }
//   if (
//     (y1 - a_y1) * (y1 - a_y2) > 0 &&
//     (y2 - a_y1) * (y2 - a_y2) > 0 &&
//     (y1 - a_y1) * (y2 - a_y1) > 0
//   ) {
//     return false;
//   }
//   const line = getLineFunction(interval[0], interval[1]);
//   const leftIntersectionY = line(a_x1);
//   if ((leftIntersectionY - a_y1) * (leftIntersectionY - a_y2) < 0) {
//     return {
//       type: "Feature",
//       properties: {},
//       geometry: { type: "Point", coordinates: [a_x1, leftIntersectionY] },
//     };
//   }
//   const rightIntersectionY = line(a_x2);
//   if ((rightIntersectionY - a_y1) * (rightIntersectionY - a_y2) < 0) {
//     return {
//       type: "Feature",
//       properties: {},
//       geometry: { type: "Point", coordinates: [a_x2, rightIntersectionY] },
//     };
//   }
//   const lineY = getLineFunctionY(interval[0], interval[1]);
//   const topIntersectionX = lineY(a_y1);
//   if ((topIntersectionX - a_x1) * (topIntersectionX - a_x2) < 0) {
//     return {
//       type: "Feature",
//       properties: {},
//       geometry: { type: "Point", coordinates: [a_y1, leftIntersectionY] },
//     };
//   }
//   const bottomIntersectionX = line(a_y2);
//   if ((bottomIntersectionX - a_x1) * (bottomIntersectionX - a_x2) < 0) {
//     return {
//       type: "Feature",
//       properties: {},
//       geometry: { type: "Point", coordinates: [a_y2, rightIntersectionY] },
//     };
//   }
//   return false;
// };
