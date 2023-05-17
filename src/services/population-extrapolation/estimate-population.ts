import { EEFeatureCollection, EEImage } from "../../types";
import {
  createRandomPointsWithDistance,
  recursiveGetRandomPointsWithDistance,
} from "./random-population";
import { evaluatePromisify } from "../../utils/ee-image";
import { writeFileSync } from "fs";
import { generateRandomGrid } from "./random-grid";
import {
  PopulationDistanceConfigType,
  PopulationRandomGenerationConfigType,
} from "../../analytics_config_types";
import { importGeometries } from "../../utils/import-geometries";
const util = require("node:util");

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
  const calculatedBuffer = calcMaxBuffer(trainingAreas);
  console.log({ calculatedBuffer });
  const distances = calcDistances(trainingPoints, calculatedBuffer);
  const averageDistance = ee.Number(
    distances.filter(`nearest < ${calculatedBuffer}`).aggregate_mean("nearest")
  );
  const minDistance = ee.Number(
    distances.filter(`nearest < ${calculatedBuffer}`).aggregate_min("nearest")
  );
  console.log(region);
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
  const distancesRandoms = calcDistances(randoms, calculatedBuffer);

  const averageDistanceRandoms = ee.Number(
    distancesRandoms
      .filter(`nearest < ${calculatedBuffer}`)
      .aggregate_mean("nearest")
  );
  const minDistanceRandoms = ee.Number(
    distancesRandoms
      .filter(`nearest < ${calculatedBuffer}`)
      .aggregate_min("nearest")
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
export function calcDistances(centroids: EEFeatureCollection, buffer: any) {
  return centroids.map(function (curr: any) {
    const inBuffer = centroids.filterBounds(curr.buffer(20000).geometry());
    const nearest = curr.distance(
      inBuffer.geometry().difference(curr.geometry())
    );

    return curr.set("nearest", nearest);
  });
}
export function calcMaxBuffer(areas: EEFeatureCollection) {
  const buffers = areas.map((area: any) => {
    const geometryBounds = area.geometry().bounds();
    const coords = ee.List(geometryBounds.coordinates().get(0));
    const diag = ee.Geometry.Point(coords.get(0)).distance(
      ee.Geometry.Point(coords.get(2))
    );
    return area.set("diag", diag);
  });
  return ee.Number(buffers.aggregate_max("diag")).getInfo();
}
