import { analyticsConfigType } from "../../analytics_config_types";
import {
  getParamsImage,
  getPoints,
  getRegionOfInterest,
  getRFClassifier,
  setDefaultsToScriptsConfig,
} from "./random-forest";
import { EEImage } from "../../types";
import {
  classifierValidationType,
  validateClassifier,
} from "../../services/random-forest/all-validations";
import { mkdirSync, writeFileSync } from "fs";
import { getCsv } from "../../services/utils/points";
import {
  drawHistogramChart,
  drawMarkerChart,
  saveChart,
} from "../../services/charts";
import { evaluatePromisify } from "../../services/utils/ee-image";
import { printRandomForestCharts } from "../../services/random-forest/charts";
import { mkdir } from "fs/promises";

export const randomForestCV = async (analyticsConfig: analyticsConfigType) => {
  if (!analyticsConfig.randomForest) return;
  const {
    latitude_key,
    longitude_key,
    id_key,
    pointsCsvPath,
    outputs: defaultOutputs,
    randomForest: {
      regionOfInterestCsvPath,
      validationSplit,
      outputMode,
      absencePointsCsvPath,
      presencePointsCsvPath,
    },
  } = analyticsConfig;

  const outputDir = `./.local/outputs/${defaultOutputs}/`;
  let raw_points;
  if (absencePointsCsvPath && presencePointsCsvPath) {
    raw_points = (
      await getPoints(
        presencePointsCsvPath,
        latitude_key,
        longitude_key,
        id_key
      )
    )
      .map((it: any) => it.set("Presence", 1))
      .merge(
        (
          await getPoints(
            absencePointsCsvPath,
            latitude_key,
            longitude_key,
            id_key
          )
        ).map((it: any) => it.set("Presence", 0))
      );
  } else {
    raw_points = await getPoints(
      pointsCsvPath,
      latitude_key,
      longitude_key,
      id_key
    );
  }

  const regionOfInterest = await getRegionOfInterest(
    regionOfInterestCsvPath,
    latitude_key,
    longitude_key
  );

  let modelsValidations: {
    classifier: any;
    classified_image: any;
    validation: classifierValidationType;
  }[] = [];

  const scriptObjects = setDefaultsToScriptsConfig(analyticsConfig);
  const paramsImage = await getParamsImage({
    scripts: scriptObjects,
    regionOfInterest,
  });
  await mkdir(outputDir, { recursive: true });

  for (let i = 1; i <= 10; i++) {
    const pointsWithRandom = raw_points.randomColumn("random", i * i * i);

    const validationPoints = pointsWithRandom.filter(
      ee.Filter.lt("random", validationSplit)
    );
    const trainingPoints = pointsWithRandom.filter(
      ee.Filter.gte("random", validationSplit)
    );
    const allPointsWithParams = paramsImage.sampleRegions({
      collection: trainingPoints,
      properties: ["Presence"],
      scale: 100,
    });
    const { classifier, classified_image } = await getRFClassifier({
      paramsImage,
      trainingPoints: allPointsWithParams,
      outputMode,
    });
    // mkdirSync(`${outputDir}model${i}`);
    //
    // await printRandomForestCharts({
    //   classifiedImage: classified_image,
    //   explainedClassifier: await evaluatePromisify(classifier.explain()),
    //   output: `${outputDir}model${i}`,
    //   regionOfInterest,
    //   trainingData: trainingPoints,
    //   validationData: validationPoints,
    // });
    const validation = (await validateClassifier(
      classified_image,
      validationPoints,
      trainingPoints
    )) as classifierValidationType;
    validation.explainedClassifier = await evaluatePromisify(
      classifier.explain()
    );
    modelsValidations.push({
      classifier,
      classified_image,
      validation,
    });

    writeFileSync(
      `${outputDir}/model${i}.json`,
      JSON.stringify(validation, null, 4)
    );
    console.log(i, " success");
  }
  await writeValidationTable(modelsValidations, outputDir);
  const meanClassifiedImage = ee
    .ImageCollection(modelsValidations.map((it) => it.classified_image))
    .reduce(ee.Reducer.mean());
};
const validationTableKeys = [
  "AUC",
  "training_regression_r2",
  "validation_regression_r2",
  "max_kappa",
  "max_kappa_cutoff",
  "max_ccr",
  "max_ccr_cutoff",
];
const writeValidationTable = async (
  validations: { validation: classifierValidationType }[],
  outputDir: string
) => {
  let average_validation_data: any;
  const ROCsArray = [] as { [p: string]: { TPR: number; FPR: number } }[];
  const importanceArray = [] as { [p: string]: number }[];
  const { values, CSV } = validations.reduce(
    (acc, { validation }, index) => {
      importanceArray.push(validation.explainedClassifier.importance);
      const ccrAndKappaArray = validation.ROC.features.map(
        ({ properties: { ccr, kappa, cutoff, TPR, FPR } }) => ({
          ccr,
          kappa,
          cutoff,
          TPR,
          FPR,
        })
      );
      ROCsArray.push(
        ccrAndKappaArray.reduce((acc, { TPR, FPR, cutoff }) => {
          acc[cutoff] = { TPR, FPR };
          return acc;
        }, {} as { [p: number]: { TPR: number; FPR: number } })
      );
      const { ccr: max_ccr, cutoff: max_ccr_cutoff } = ccrAndKappaArray.sort(
        (a, b) => (a.ccr > b.ccr ? -1 : 1)
      )[0];
      const { kappa: max_kappa, cutoff: max_kappa_cutoff } =
        ccrAndKappaArray.sort((a, b) => (a.kappa > b.kappa ? -1 : 1))[0];

      const values = {
        AUC: validation.AUC,
        max_kappa,
        max_ccr,
        max_kappa_cutoff,
        max_ccr_cutoff,
        training_regression_r2: validation.training_regression.r2,
        validation_regression_r2: validation.validation_regression.r2,
      };
      acc.values.push(values);
      acc.CSV.push(getCSVRow(values, validationTableKeys, "Model" + index));

      return acc;
    },
    { CSV: [] as any[], values: [] as typeof average_validation_data[] }
  );

  average_validation_data = getAverageValues(values);
  const averageRoc = Object.keys(ROCsArray[0])
    .map((cutoff) =>
      getAverageValues(ROCsArray.map((it) => ({ ...it[cutoff] })))
    )
    .sort((a, b) => (a.FPR < b.FPR ? -1 : 1));
  values.push(average_validation_data);
  const averageImportance = getAverageValues(importanceArray);
  CSV.push(getCSVRow(average_validation_data, validationTableKeys, "Average"));
  CSV.unshift(["name"].concat(validationTableKeys));

  const ROCHart = await drawMarkerChart(
    averageRoc.map(({ TPR, FPR }) => [FPR, TPR]),
    "AUC:" + average_validation_data.AUC
  );
  const paramsHistogram = await drawHistogramChart(
    Object.entries(averageImportance)
  );
  paramsHistogram.xAxis().labels().height(15);
  paramsHistogram.xAxis().labels().rotation(90);
  await saveChart(ROCHart, `${outputDir}aver_roc.jpg`);
  await saveChart(paramsHistogram, `${outputDir}aver_importance.jpg`);
  writeFileSync(`${outputDir}validations.csv`, (await getCsv(CSV)) as string);
};

const getAverageValues = (objs: { [p: string]: number }[]) => {
  const average = Object.fromEntries(
    Object.entries(objs[0]).map(([key, value]) => [key, 0])
  );
  return objs.reduce(
    (aver, obj, index, arr) =>
      Object.entries(obj).reduce((acc, [key, value]) => {
        acc[key] = acc[key] + value;
        if (index === arr.length - 1) {
          acc[key] = acc[key] / arr.length;
        }
        return acc;
      }, aver),
    average
  );
};
const getCSVRow = (
  obj: { [p: string]: number },
  keys: (keyof typeof obj)[],
  rowName: string
) => {
  return ([rowName] as any[]).concat(keys.map((key) => obj[key]));
};
