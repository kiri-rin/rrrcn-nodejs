import { PopulationRandomGenerationConfigType } from "../../analytics_config_types";
import { mkdir, writeFile } from "fs/promises";
import { estimatePopulationService } from "../../services/population-extrapolation/estimate-population";
import { evaluatePromisify } from "../../utils/ee-image";
import { writeFileSync } from "fs";
import { importGeometries } from "../../utils/import-geometries";
import { getCsv } from "../../utils/points";

export const getPresenceRegion = async (
  regionConfig: PopulationRandomGenerationConfigType["presenceArea"]
) => {
  switch (regionConfig.type) {
    case "asset": {
      return ee.Image(regionConfig.path).reduceToVectors();
    }
    case "computedObject": {
      return regionConfig.object;
    }
    default: {
      return await importGeometries(regionConfig, "polygon");
    }
  }
};
export const estimatePopulationRandomGeneration = async (
  config: PopulationRandomGenerationConfigType
) => {
  const {
    outputs,

    seed,
    presenceArea: presenceAreaConfig,
    points: pointsConfig,
    areas: areasConfig,
  } = config;
  const region = await getPresenceRegion(presenceAreaConfig);
  const outputDir = `${outputs}/`;
  await mkdir(`${outputs}`, { recursive: true });
  const areas = await importGeometries(areasConfig);
  const points = await importGeometries(pointsConfig);
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
    points,
    region,
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
  const res = {
    total: randomsOutput.features?.length,
    inAreas: inAreaEv.features?.length,
    minDistanceEv,
    averageDistanceEv,
    minDistanceRandEv,
    averageDistanceRandEv,
    trainingErrorPercentEv,
    validatingErrorPercentEv,
  };
  console.log(res);
  writeFileSync(`${outputDir}points.json`, JSON.stringify(randomsOutput));
  writeFileSync(`${outputDir}result.json`, JSON.stringify(res));
  writeFileSync(`${outputDir}inArea.json`, JSON.stringify(inArea));
};
