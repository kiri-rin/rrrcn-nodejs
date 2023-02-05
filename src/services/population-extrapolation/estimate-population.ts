import { EEFeatureCollection, EEImage } from "../../types";
import {
  createRandomPointsWithDistance,
  recursiveGetRandomPointsWithDistance,
} from "./random-population";
import { evaluatePromisify } from "../utils/ee-image";
import { writeFileSync } from "fs";
import { generateRandomGrid } from "./random-grid";
const util = require("node:util");
export const estimatePopulationService = async ({
  points,
  validationAreas = ee.FeatureCollection([]),
  trainingAreas,
  classified_image,
  regionOfInterest,
  seed,
}: {
  prevRandoms?: EEFeatureCollection;
  classified_image: EEImage;
  regionOfInterest: any;
  points: EEFeatureCollection;
  validationAreas?: EEFeatureCollection;
  trainingAreas?: EEFeatureCollection;
  seed?: number;
}) => {
  const trainingPoints = points.filterBounds(trainingAreas);
  const validationPoints = points.filterBounds(validationAreas);
  const distances = calcDistances(trainingPoints);
  const averageDistance = ee.Number(
    distances.filter("nearest < 50000").aggregate_mean("nearest")
  );
  const minDistance = ee.Number(
    distances.filter("nearest < 50000").aggregate_min("nearest")
  );
  const randomGrid = generateRandomGrid({
    regionOfInterest,
    seed,
    cellSize: minDistance,
    mask: classified_image.selfMask(),
  });
  const { randoms, randomsOutput } = await recursiveGetRandomPointsWithDistance(
    {
      grid: randomGrid,
      minDistance: minDistance,
      averageDistance,
      seed,
    }
  );
  const distancesRandoms = calcDistances(randoms);

  const averageDistanceRandoms = ee.Number(
    distancesRandoms.filter("nearest < 50000").aggregate_mean("nearest")
  );
  const minDistanceRandoms = ee.Number(
    distancesRandoms.filter("nearest < 50000").aggregate_min("nearest")
  );
  const inArea = randoms.filterBounds(validationAreas);
  const inTrainingArea = randoms.filterBounds(trainingAreas);
  const trainingErrorPercent = inTrainingArea
    .size()
    .subtract(trainingPoints.size())
    .divide(trainingPoints.size());
  const validatingErrorPercent = inArea
    .size()
    .subtract(validationPoints.size())
    .divide(validationPoints.size());
  const fixedValidationErrorPercent = inArea
    .size()
    .divide(ee.Number(1).add(trainingErrorPercent))
    .subtract(validationPoints.size())
    .divide(validationPoints.size());
  return {
    randoms,
    randomsOutput,
    inArea,
    inTrainingArea,
    averageDistance,
    minDistance,
    averageDistanceRandoms,
    minDistanceRandoms,
    trainingErrorPercent,
    validatingErrorPercent,
    fixedValidationErrorPercent,
    distances: distances.filter("nearest < 50000"),
    distancesRandoms: distancesRandoms.filter("nearest < 50000"),
    trainingPointsSize: trainingPoints.size(),
    validationPointsSize: validationPoints.size(),
  };
};
export function calcDistances(
  centroids: EEFeatureCollection,
  areas?: EEFeatureCollection,
  randomSamples?: EEFeatureCollection
) {
  return areas
    ? centroids.map(function (curr: any) {
        const buffer = curr.buffer(50000).geometry();
        const inBuffer = centroids.filterBounds(buffer);
        const nearest = curr.distance(
          inBuffer.geometry().difference(curr.geometry())
        );
        const nearestBuffer = curr.buffer(ee.Number(nearest)).geometry();

        const trueNearest = ee.Algorithms.If(
          nearest.gt(20000),
          0,
          nearestBuffer.difference(areas).area().eq(0)
        );

        return curr.set("nearest", nearest).set("true_nearest", trueNearest);
      })
    : // .map((curr: any) => {
      //   const nearest = curr.getNumber("nearest");
      //   const nearestBuffer = curr.buffer(ee.Number(nearest)).geometry();
      //
      //   return curr.set(
      //     "nearest",
      //     ee.Algorithms.If(
      //       nearest.gte(20000),
      //       nearest,
      //       nearest
      //         .multiply(areas.geometry().intersection(nearestBuffer).area())
      //         .divide(nearestBuffer.area())
      //     )
      //   );
      // })
      centroids.map(function (curr: any) {
        const inBuffer = centroids.filterBounds(curr.buffer(20000).geometry());
        const nearest = curr.distance(
          inBuffer.geometry().difference(curr.geometry())
        );

        return curr.set("nearest", nearest);
      });
}
