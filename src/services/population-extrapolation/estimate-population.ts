import { EEFeatureCollection, EEImage } from "../../types";
import {
  createRandomPointsWithDistance,
  recursiveGetRandomPointsWithDistance,
} from "./random-population";
import { evaluatePromisify } from "../utils/ee-image";
import { writeFileSync } from "fs";
import { generateRandomGrid } from "./random-grid";

export const estimatePopulationService = async ({
  points,
  areas,
  classified_image,
  regionOfInterest,
  seed,
}: {
  classified_image: EEImage;
  regionOfInterest: any;
  points: EEFeatureCollection;
  areas?: EEFeatureCollection;
  seed?: number;
}) => {
  const distances = calcDistances(points);
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
      minDistance: minDistance.divide(2),
      maxDistance: averageDistance
        .multiply(2)
        .subtract(minDistance.multiply(2)),
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
  const inArea = randoms.filterBounds(areas);
  return {
    randoms,
    randomsOutput,
    inArea,
    averageDistance,
    minDistance,
    averageDistanceRandoms,
    minDistanceRandoms,
  };
};
export function calcDistances(centroids: EEFeatureCollection) {
  return centroids.map(function (curr: any) {
    const inBuffer = centroids.filterBounds(curr.buffer(20000).geometry());
    const nearest = curr.distance(
      inBuffer.geometry().difference(curr.geometry())
    );

    return curr.set("nearest", nearest);
  });
}
