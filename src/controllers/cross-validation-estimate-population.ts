import { populationEstimationType } from "../population_config";
import { mkdir } from "fs/promises";
import { getPoints, getRegionOfInterest } from "./random-forest/random-forest";
import { estimatePopulationService } from "../services/population-extrapolation/estimate-population";
import { evaluatePromisify } from "../services/utils/ee-image";
import { writeFileSync } from "fs";
import { importShapesToFeatureCollection } from "../services/utils/import-geometries";

export const crossValidationPopulationEstimation = async (
  config: populationEstimationType
) => {
  const {
    outputs,
    latitude_key,
    longitude_key,
    id_key,
    pointsCsvPath,
    seed: configSeed,
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
  const results = [];
  for (let i = 0; i < 100; i++) {
    const seed = (configSeed || 1) + i * i;

    const areasWithRandom = areas.randomColumn("random", seed); //map random*pointsNumber
    const trainingAreas = areasWithRandom.filter(ee.Filter.gt("random", 0.2));
    const validationAreas = areasWithRandom.filter(
      ee.Filter.lte("random", 0.2)
    );
    const trainingPoints = points.filterBounds(trainingAreas);
    const validationPoints = points.filterBounds(validationAreas);
    const promise = estimatePopulationService({
      classified_image,
      points: trainingPoints,
      regionOfInterest: regionOfInterest.difference(trainingAreas.geometry()),
      areas: validationAreas,
      seed,
      prevRandoms: trainingPoints,
    }).then(
      ({
        randomsOutput,
        inArea,
        averageDistance,
        minDistance,
        averageDistanceRandoms,
        minDistanceRandoms,
      }) =>
        evaluatePromisify(
          ee.List([
            inArea.size(),
            minDistance,
            averageDistance,
            minDistanceRandoms,
            averageDistanceRandoms,
            validationPoints.size(),
            trainingPoints.size(),
          ])
        ).then(
          //@ts-ignore
          ([
            inAreaEv,
            minDistanceEv,
            averageDistanceEv,
            minDistanceRandEv,
            averageDistanceRandEv,
            realInArea,
            trainingSize,
          ]) => {
            const res = {
              total: randomsOutput.features?.length,
              inAreas: inAreaEv,
              realInArea,
              minDistanceEv,
              averageDistanceEv,
              minDistanceRandEv,
              averageDistanceRandEv,
              trainingSize,
              seed,
            };
            console.log(res);
            return res;
          }
        )
    );
    results.push(promise);
  }
  let processed = await Promise.all(results);
  writeFileSync(
    `${outputDir}cross.json`,
    JSON.stringify(
      {
        processed,
        SD:
          processed.reduce(
            (acc: number, curr: any) =>
              acc +
              Math.sqrt(
                Math.abs((curr.inAreas - curr.realInArea) / curr.realInArea)
              ),
            0
          ) / processed.length,
        averageDeviation:
          processed.reduce(
            (acc: number, curr: any) =>
              acc + (curr.inAreas - curr.realInArea) / curr.realInArea,
            0
          ) / processed.length,
        averageAbsDeviation:
          processed.reduce(
            (acc: number, curr: any) =>
              acc +
              Math.abs((curr.inAreas - curr.realInArea) / curr.realInArea),
            0
          ) / processed.length,
      },
      null,
      4
    )
  );
  console.log("FINISH");
};
