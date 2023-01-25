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
import { randomForestConfig } from "../../analytics_config_types2";
import { getAllPoints, getTrainingValidationPointsPare } from "./utils";
import { importGeometries } from "../../services/utils/import-geometries";
import { randomForestAndValidateService } from "../../services/random-forest";

export const randomForestCV = async (config: randomForestConfig) => {
  const {
    outputMode,
    regionOfInterest: regionOfInterestConfig,
    trainingPoints: trainingPointsConfig,
    validation: validationConfig,
    params,
  } = config;
  let raw_points = await getAllPoints(trainingPointsConfig);
  const regionOfInterest = await importGeometries(
    regionOfInterestConfig,
    "polygon"
  );
  const paramsImage = await getParamsImage({
    params,
    regionOfInterest,
  });
  const outputDir = `./.local/outputs/${defaultOutputs}/`;

  let modelsValidations: {
    classifier: any;
    classified_image: any;
    validation: classifierValidationType;
  }[] = [];

  await mkdir(outputDir, { recursive: true });

  for (let i = 1; i <= 10; i++) {
    const { trainingPoints, validationPoints } =
      getTrainingValidationPointsPare(raw_points, validationConfig);
    const trainingSamples = paramsImage.sampleRegions({
      collection: trainingPoints,
      properties: ["Presence"],
      scale: 100,
    });
    const res = await randomForestAndValidateService({
      trainingSamples,
      validationPoints,
      outputMode,
      paramsImage,
      regionOfInterest,
    });
    modelsValidations.push(res);

    writeFileSync(
      `${outputDir}/model${i}.json`,
      JSON.stringify(res.validations, null, 4)
    );
    console.log(i, " success");
  }
  await writeValidationTable(modelsValidations, outputDir);
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
