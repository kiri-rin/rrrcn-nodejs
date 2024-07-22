import { PopulationRandomGenerationConfigType } from "@rrrcn/common/src/types/services/analytics_config_types";
import { mkdir } from "fs/promises";
import { estimatePopulationService } from "../../services/population-extrapolation/estimate-population";
import { evaluatePromisify } from "../../utils/ee-image";
import { writeFileSync } from "fs";
import { importGeometries } from "../../utils/import-geometries";
import {
  estimatePopulationWriteResult,
  getPresenceRegion,
} from "./estimate-population-random-points";
import {
  findBestAver,
  findBestDeviations,
} from "../../services/population-extrapolation/find_best";
import type { EstimatePopulationRandomGenerationResult } from "./estimate-population-random-points";

export type CrossValidationPopulationEstimationResult = {
  processed: EstimatePopulationRandomGenerationResult[];
  totalSD: number;
  fixedTotalSD: number;
  maxTotal: number;
  minTotal: number;
  maxFixedTotal: number;
  minFixedTotal: number;
  minEstimate: number;
  maxEstimate: number;
  minFixedEstimate: number;
  maxFixedEstimate: number;
  averageValidationDeviation: number;
  averageValidationAbsDeviation: number;
  averageTrainingDeviation: number;
  averageTrainingAbsDeviation: number;
  averageTotal: number;
};
export const crossValidationPopulationEstimation = async (
  config: PopulationRandomGenerationConfigType
) => {
  const {
    outputs,
    seed: configSeed,
    presenceArea: presenceAreaConfig,
    points: pointsConfig,
    areas: areasConfig,
    validationSplit: validationSplitConfig = 0.2,
    crossValidation = 100,
  } = config;
  const region = await getPresenceRegion(presenceAreaConfig);
  const outputDir = `${outputs}/`;
  await mkdir(`${outputs}`, { recursive: true });
  const areas = await importGeometries(areasConfig);
  const points = await importGeometries(pointsConfig);
  const results = [];
  for (let i = 0; i < crossValidation; i++) {
    const seed = (configSeed || 1) + i * i;

    const areasWithRandom = areas.randomColumn("random", seed); //map random*pointsNumber
    const validationSplit = ee
      .Number(validationSplitConfig)
      .max(areasWithRandom.aggregate_min("random"));
    const trainingAreas = areasWithRandom.filter(
      ee.Filter.gt("random", validationSplit)
    );
    const validationAreas = areasWithRandom.filter(
      ee.Filter.lte("random", validationSplit)
    );

    try {
      const promise = estimatePopulationService({
        points,
        region,
        validationAreas,
        trainingAreas,
        seed,
      })
        .then(
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
            distances,
            distancesRandoms,
            // fixedValidationErrorPercent,
          }) =>
            Promise.all([
              evaluatePromisify(inArea),
              evaluatePromisify(validationPointsSize),
              evaluatePromisify(inTrainingArea),
              evaluatePromisify(trainingPointsSize),
              evaluatePromisify(trainingErrorPercent),
              evaluatePromisify(validatingErrorPercent),
              evaluatePromisify(minDistance),
              evaluatePromisify(averageDistance),
              evaluatePromisify(minDistanceRandoms),
              evaluatePromisify(averageDistanceRandoms),
              evaluatePromisify(distances),
              evaluatePromisify(distancesRandoms),
              // fixedValidationErrorPercent,
              // inArea.size().divide(ee.Number(1).add(trainingErrorPercent)),
            ]).then(
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
                distancesEv,
                distancesRandomsEv,
                // fixedValidationErrorPercent,
                // fixedInArea,
              ]) => {
                const res: EstimatePopulationRandomGenerationResult = {
                  total: randomsOutput.features?.length,
                  inValidationArea,
                  inTrainingAreaSize: inTrainingArea.features?.length,
                  inValidationAreaSize: inValidationArea.features?.length,
                  validationPointsSize,
                  inTrainingArea,
                  trainingPointsSize,
                  trainingErrorPercent,
                  validatingErrorPercent,
                  minNearestDistanceTraining,
                  averageNearestDistanceTraining,
                  minNearestDistanceResult,
                  averageNearestDistanceResult,
                  randomsOutput,
                  trainingDistances: distancesEv,
                  resultDistances: distancesRandomsEv,
                  // fixedValidationErrorPercent,
                  // fixedInArea,
                  // fixedTotal:
                  //   randomsOutput.features?.length / (1 + trainingErrorPercent),
                  seed,
                };
                return res;
              }
            )
        )
        .catch((e) => {
          console.log("DROP ", seed);
        });
      promise && results.push(promise);
      await promise;
    } catch (e) {
      console.log(e, "DROP ", seed);
    }
  }
  let processed: EstimatePopulationRandomGenerationResult[] = (
    await Promise.allSettled(results)
  )
    .map((it) => it.status === "fulfilled" && it.value)
    .filter((it) => it) as EstimatePopulationRandomGenerationResult[];
  const means = processed.reduce(
    (acc: any, curr: any, index, arr) => {
      // acc.averageFixedValidationDeviation += curr.fixedValidationErrorPercent;
      // acc.averageFixedValidationAbsDeviation += Math.abs(
      //   curr.fixedValidationErrorPercent
      // );
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
      // averageFixedValidationDeviation: 0,
      // averageFixedValidationAbsDeviation: 0,
      averageTrainingDeviation: 0,
      averageTrainingAbsDeviation: 0,
      // validationSD: 0,
      // validationFixedSD: 0,
      // trainingSD: 0,
      averageTotal: 0,
      // averageFixedTotal: 0,
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
        processed: processed.map(
          ({ randomsOutput, trainingDistances, resultDistances, ..._res }) =>
            _res
        ),
        ...means,
        successCrossValidationCount: processed.length,
      },
      null,
      4
    )
  );

  const res: CrossValidationPopulationEstimationResult = {
    processed,
    ...means,
  };
  const averBest = findBestAver(res);
  const devBest = findBestDeviations(res);
  await estimatePopulationWriteResult(averBest, `${outputDir}average_best/`);
  await estimatePopulationWriteResult(devBest, `${outputDir}deviance_best/`);
  console.log("FINISH");
  strapiLogger("FINISH");
  return res;
};
