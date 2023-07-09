import { EEFeature, EEFeatureCollection } from "../../types";
import { recursiveGetRandomPointsWithDistance } from "./random-population";
import { generateRandomGrid } from "./random-grid";

export const estimatePopulationService = async ({
  points,
  validationAreas = ee.FeatureCollection([]),
  trainingAreas,
  region,
  seed,
}: {
  prevRandoms?: EEFeatureCollection;
  region: any;
  points: EEFeatureCollection;
  validationAreas?: EEFeatureCollection;
  trainingAreas?: EEFeatureCollection;
  seed?: number;
}) => {
  const trainingPoints = points.filterBounds(trainingAreas);
  const validationPoints = points.filterBounds(validationAreas);

  const connectedAreas = prepareAreas(trainingAreas);
  const distances = calcDistances(trainingPoints, connectedAreas);
  const averageDistance = ee.Number(distances.aggregate_mean("nearest"));
  const minDistance = ee.Number(distances.aggregate_min("nearest"));
  const randomGrid = generateRandomGrid({
    region: region,
    seed,
    cellSize: minDistance,
  });
  const { randoms, randomsOutput } = await recursiveGetRandomPointsWithDistance(
    {
      grid: randomGrid,
      minDistance: minDistance,
      averageDistance,
      seed,
    }
  );
  const distancesRandoms = calcDistances(randoms, connectedAreas);

  const averageDistanceRandoms = ee.Number(
    distancesRandoms.aggregate_mean("nearest")
  );
  const minDistanceRandoms = ee.Number(
    distancesRandoms.aggregate_min("nearest")
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
    distances: distances,
    distancesRandoms: distancesRandoms,
    trainingPointsSize: trainingPoints.size(),
    validationPointsSize: validationPoints.size(),
  };
};
export function calcDistances(
  centroids: EEFeatureCollection,
  areas: EEFeatureCollection
) {
  return areas.iterate(function (area: EEFeature, res: EEFeatureCollection) {
    const areaPoints = centroids.filterBounds(area.geometry());
    ee.Algorithm.if(areaPoints.size > 1, function () {
      const areaNearest = areaPoints.map((curr: EEFeature) => {
        const nearest = curr.distance(
          areaPoints.geometry().difference(curr.geometry())
        );
        return curr.set("nearest", nearest);
      });
      res = res.merge(areaNearest);
    });
  }, ee.FeatureCollection([]));
}
export const prepareAreas = (
  areas: EEFeatureCollection
): EEFeatureCollection => {
  const imageAreas = ee.Image(1).filterBounds(areas);
  return imageAreas.reduceToVectors({ scale: 500 });
};
