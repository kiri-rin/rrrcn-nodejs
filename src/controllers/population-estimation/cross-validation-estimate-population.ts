import { populationEstimationType } from "../../analytics_config_types";
import { mkdir } from "fs/promises";
import { estimatePopulationService } from "../../services/population-extrapolation/estimate-population";
import { evaluatePromisify } from "../../services/utils/ee-image";
import { writeFileSync } from "fs";
import { importShapesToFeatureCollection } from "../../services/utils/import-geometries";
import { getPoints, getRegionOfInterest } from "./estimate-population";

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

    const promise = estimatePopulationService({
      points,
      classified_image,
      regionOfInterest: regionOfInterest,
      validationAreas,
      trainingAreas,
      seed,
    }).then(
      ({
        randomsOutput,
        inArea,
        averageDistance,
        minDistance,
        averageDistanceRandoms,
        minDistanceRandoms,
        inTrainingArea,
        trainingErrorPercent,
        trainingPointsSize,
        validatingErrorPercent,
        validationPointsSize,
        fixedValidationErrorPercent,
      }) =>
        evaluatePromisify(
          ee.List([
            inArea.size(),
            validationPointsSize,
            inTrainingArea.size(),
            trainingPointsSize,
            trainingErrorPercent,
            validatingErrorPercent,
            minDistance,
            averageDistance,
            minDistanceRandoms,
            averageDistanceRandoms,
            fixedValidationErrorPercent,
            inArea.size().divide(ee.Number(1).add(trainingErrorPercent)),
          ])
        ).then(
          //@ts-ignore
          ([
            inValidationArea,
            validationPointsSize,
            inTrainingArea,
            trainingPointsSize,
            trainingErrorPercent,
            validatingErrorPercent,
            minNearestDistanceTraining,
            averageNearestDistanceTraining,
            minNearestDistanceResult,
            averageNearestDistanceResult,
            fixedValidationErrorPercent,
            fixedInArea,
          ]) => {
            const res = {
              total: randomsOutput.features?.length,
              inValidationArea,
              validationPointsSize,
              inTrainingArea,
              trainingPointsSize,
              trainingErrorPercent,
              validatingErrorPercent,
              minNearestDistanceTraining,
              averageNearestDistanceTraining,
              minNearestDistanceResult,
              averageNearestDistanceResult,
              fixedValidationErrorPercent,
              fixedInArea,
              fixedTotal:
                randomsOutput.features?.length / (1 + trainingErrorPercent),
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
  const means = processed.reduce(
    (acc: any, curr: any, index, arr) => {
      acc.averageFixedValidationDeviation += curr.fixedValidationErrorPercent;
      acc.averageFixedValidationAbsDeviation += Math.abs(
        curr.fixedValidationErrorPercent
      );
      // acc.validationFixedSD +=
      //   curr.fixedValidationErrorPercent * curr.fixedValidationErrorPercent;
      acc.averageValidationDeviation += curr.validatingErrorPercent;
      acc.averageValidationAbsDeviation += Math.abs(
        curr.validatingErrorPercent
      );
      // acc.validationSD +=
      //   curr.validatingErrorPercent * curr.validatingErrorPercent;
      acc.averageTrainingDeviation += curr.trainingErrorPercent;
      acc.averageTrainingAbsDeviation += Math.abs(curr.trainingErrorPercent);
      // acc.trainingSD += curr.trainingErrorPercent * curr.trainingErrorPercent;
      acc.averageTotal += curr.total;
      acc.averageFixedTotal += curr.fixedTotal;
      if (index === arr.length - 1) {
        for (let [key, val] of Object.entries(acc)) {
          acc[key] = Number(val) / arr.length;
        }
      }
      return acc;
    },
    {
      averageValidationDeviation: 0,
      averageValidationAbsDeviation: 0,
      averageFixedValidationDeviation: 0,
      averageFixedValidationAbsDeviation: 0,
      averageTrainingDeviation: 0,
      averageTrainingAbsDeviation: 0,
      // validationSD: 0,
      // validationFixedSD: 0,
      // trainingSD: 0,
      averageTotal: 0,
      averageFixedTotal: 0,
    }
  ) as any;
  means.totalSD = Math.sqrt(
    processed.reduce((acc: number, curr: any) => {
      acc +=
        (curr.total - means.averageTotal) * (curr.total - means.averageTotal);
      return acc;
    }, 0) / processed.length
  );

  means.fixedTotalSD = Math.sqrt(
    processed.reduce((acc: number, curr: any) => {
      acc +=
        (curr.fixedTotal - means.averageFixedTotal) *
        (curr.fixedTotal - means.averageFixedTotal);
      return acc;
    }, 0) / processed.length
  );

  means.maxTotal = processed.reduce((acc: number, curr: any) => {
    acc = acc <= curr.total ? curr.total : acc;
    return acc;
  }, 0);
  means.minTotal = processed.reduce((acc: number, curr: any) => {
    acc = acc = acc >= curr.total ? curr.total : acc;
    return acc;
  }, means.averageTotal);

  means.maxFixedTotal = processed.reduce((acc: number, curr: any) => {
    acc = acc <= curr.fixedTotal ? curr.fixedTotal : acc;
    return acc;
  }, 0);
  means.minFixedTotal = processed.reduce((acc: number, curr: any) => {
    acc = acc = acc >= curr.fixedTotal ? curr.fixedTotal : acc;
    return acc;
  }, means.averageFixedTotal);

  means.minEstimate =
    means.averageTotal / (1 + means.averageValidationAbsDeviation);
  means.maxEstimate =
    means.averageTotal / (1 - means.averageValidationAbsDeviation);

  means.minFixedEstimate =
    means.averageTotal / (1 + means.averageFixedValidationAbsDeviation);
  means.maxFixedEstimate =
    means.averageFixedTotal / (1 - means.averageFixedValidationAbsDeviation);
  writeFileSync(
    `${outputDir}cross.json`,
    JSON.stringify(
      {
        processed,
        ...means,
      },
      null,
      4
    )
  );
  console.log("FINISH");
  return means;
};