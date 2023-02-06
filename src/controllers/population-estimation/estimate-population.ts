import { populationEstimationType } from "../../analytics_config_types";
import { mkdir, writeFile } from "fs/promises";
import { recursiveGetRandomPointsWithDistance } from "../../services/population-extrapolation/random-population";
import { estimatePopulationService } from "../../services/population-extrapolation/estimate-population";
import { evaluatePromisify } from "../../services/utils/ee-image";
import { writeFileSync } from "fs";
import {
  importPointsFromCsv,
  importShapesToFeatureCollection,
} from "../../services/utils/import-geometries";
import { writeScriptFeaturesResult } from "../../services/utils/io";
import {
  exportFeatureCollectionsToCsv,
  getCsv,
  JSCSVTable,
} from "../../services/utils/points";
import { parse } from "csv-parse/sync";
import fsPromises from "fs/promises";
export const getPoints = async (
  path: string,
  lat_key: string = "Latitude",
  long_key: string = "Longitude",
  id_key: string = "id",
  inheritProps = ["Presence"]
) => {
  const pointsFile = await fsPromises.readFile(path);
  const pointsParsed = parse(pointsFile, { delimiter: ",", columns: true });
  return importPointsFromCsv({
    csv: pointsParsed,
    lat_key,
    long_key,
    id_key,
    inheritProps,
  });
};
export const getRegionOfInterest = async (
  path: string,
  lat_key: string = "Latitude",
  long_key: string = "Longitude"
) => {
  const regionPointsRaw = await fsPromises.readFile(path);
  const regionPointsParsed: JSCSVTable = parse(regionPointsRaw, {
    delimiter: ",",
    columns: true,
  });
  return ee.Geometry.Polygon([
    regionPointsParsed.map((row) => [
      Number(row[long_key]),

      Number(row[lat_key]),
    ]),
  ]);
};
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
  const areasWithRandom = areas.randomColumn("random", seed); //map random*pointsNumber
  const trainingAreas = areasWithRandom.filter(ee.Filter.gt("random", 0.2));
  const validationAreas = areasWithRandom.filter(ee.Filter.lte("random", 0.2));
  const {
    randomsOutput,
    randoms,
    distances,
    inArea,
    averageDistance,
    minDistance,
    averageDistanceRandoms,
    minDistanceRandoms,
    trainingErrorPercent,
    distancesRandoms,
    validatingErrorPercent,
  } = await estimatePopulationService({
    classified_image,
    points,
    regionOfInterest,
    trainingAreas,
    validationAreas,

    seed,
  });
  const [
    inAreaEv,
    minDistanceEv,
    averageDistanceEv,
    minDistanceRandEv,
    averageDistanceRandEv,
    trainingErrorPercentEv,
    validatingErrorPercentEv,
    distancesEv,
    distancesRandomsEv,
  ]: any[] = await Promise.all([
    evaluatePromisify(inArea),
    evaluatePromisify(minDistance),
    evaluatePromisify(averageDistance),
    evaluatePromisify(minDistanceRandoms),
    evaluatePromisify(averageDistanceRandoms),
    evaluatePromisify(trainingErrorPercent),
    evaluatePromisify(validatingErrorPercent),
    evaluatePromisify(distances),
    evaluatePromisify(distancesRandoms),
  ]);
  const distancesTable = distancesEv.features.map((it: any) => [
    it.properties.nearest,
  ]);
  const distancesRandomsTable = distancesRandomsEv.features.map((it: any) => [
    it.properties.nearest,
  ]);
  await writeFile(`${outputDir}distances.csv`, await getCsv(distancesTable));
  await writeFile(
    `${outputDir}distancesRandoms.csv`,
    await getCsv(distancesRandomsTable)
  );

  console.log({
    total: randomsOutput.features?.length,
    inAreas: inAreaEv.features?.length,
    minDistanceEv,
    averageDistanceEv,
    minDistanceRandEv,
    averageDistanceRandEv,
    trainingErrorPercentEv,
    validatingErrorPercentEv,
  });
  writeFileSync(`${outputDir}points.json`, JSON.stringify(randomsOutput));
  writeFileSync(`${outputDir}inArea.json`, JSON.stringify(inArea));
};
