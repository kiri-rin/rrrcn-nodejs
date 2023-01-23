import { populationEstimationType } from "../population_config";
import { mkdir } from "fs/promises";
import { getPoints, getRegionOfInterest } from "./random-forest";
import {
  importShapesPointsToFeatureCollection,
  importShapesToFeatureCollection,
} from "../services/utils/shapes";
import { recursiveGetRandomPointsWithDistance } from "../services/population-extrapolation/random-population";
import { estimatePopulationService } from "../services/population-extrapolation/estimate-population";
import { evaluatePromisify } from "../services/utils/ee-image";
import { writeFileSync } from "fs";

export const estimatePopulation = async (config: populationEstimationType) => {
  const {
    outputs,
    latitude_key,
    longitude_key,
    id_key,
    pointsCsvPath,
    seed,
    pointsSHPZIPPath,
    regionOfInterestCsvPath,
    classified_image_id,
    areasSHPZIPPath,
  } = config;
  const classified_image = ee.Image(classified_image_id);
  const outputDir = `./.local/outputs/${outputs}/`;
  await mkdir(`./.local/outputs/${outputs}`, { recursive: true });
  const areas = await importShapesToFeatureCollection(areasSHPZIPPath);
  const points = pointsCsvPath
    ? await getPoints(pointsCsvPath, latitude_key, longitude_key, id_key)
    : pointsSHPZIPPath &&
      (await importShapesToFeatureCollection(pointsSHPZIPPath));
  const regionOfInterest = await getRegionOfInterest(
    regionOfInterestCsvPath,
    latitude_key,
    longitude_key
  );
  const {
    randomsOutput,
    randoms,
    inArea,
    averageDistance,
    minDistance,
    averageDistanceRandoms,
    minDistanceRandoms,
  } = await estimatePopulationService({
    classified_image,
    points,
    regionOfInterest,
    areas,
    seed,
  });
  const [
    inAreaEv,
    minDistanceEv,
    averageDistanceEv,
    minDistanceRandEv,
    averageDistanceRandEv,
  ]: any[] = await Promise.all([
    evaluatePromisify(inArea),
    evaluatePromisify(minDistance),
    evaluatePromisify(averageDistance),
    evaluatePromisify(minDistanceRandoms),
    evaluatePromisify(averageDistanceRandoms),
  ]);

  console.log({
    total: randomsOutput.features?.length,
    inAreas: inAreaEv.features?.length,
    minDistanceEv,
    averageDistanceEv,
    minDistanceRandEv,
    averageDistanceRandEv,
  });
  writeFileSync(`${outputDir}points.jsoon`, JSON.stringify(randomsOutput));
  writeFileSync(`${outputDir}inArea.jsoon`, JSON.stringify(inArea));
};
