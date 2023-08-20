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
import { mkdir } from "fs/promises";
import { RandomForestConfig } from "../../analytics_config_types";
import {
  downloadClassifiedImage,
  getAllPoints,
  getParamsImage,
  getTrainingValidationPointsPare,
} from "./utils";
import { importGeometries } from "../../services/utils/import-geometries";
import { randomForestAndValidateService } from "../../services/random-forest";
import { EEImage } from "../../types";

export const randomForestCV = async (config: RandomForestConfig) => {
  const {
    outputMode,
    regionOfInterest: regionOfInterestConfig,
    trainingPoints: trainingPointsConfig,
    validation: validationConfig,
    params,
    outputs,
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
  // await evaluatePromisify(regionOfInterest);
  // console.log("RAW POINTS");
  const outputDir = `./.local/outputs/${outputs}`;

  let modelsValidations: {
    classifier: any;
    classified_image: any;
    validations: classifierValidationType;
  }[] = [];

  await mkdir(outputDir, { recursive: true });
  const images: EEImage[] = [];
  const jobs = [];
  for (let i = 1; i <= 10; i++) {
    jobs.push(
      (async () => {
        const { trainingPoints, validationPoints } =
          getTrainingValidationPointsPare(
            raw_points,
            validationConfig,
            i * i * i
          );

        const res = await randomForestAndValidateService({
          trainingPoints,
          validationPoints,
          outputMode,
          paramsImage,
          regionOfInterest,
        });
        images[i - 1] = res.classified_image;
        modelsValidations[i - 1] = res;

        writeFileSync(
          `${outputDir}/model${i}.json`,
          JSON.stringify({ seed: i * i * i, ...res.validations }, null, 4)
        );
        console.log(i, " success");
      })()
    );
  }
  await Promise.all(jobs);
  const mean_image = ee.ImageCollection(images).reduce(ee.Reducer.mean());
  const { promise } = await downloadClassifiedImage({
    classified_image: mean_image,
    regionOfInterest,
    output: outputDir,
    filename: "mean",
  });
  const { values: validationValues, bestImageIndex } =
    await writeValidationTable(modelsValidations, outputDir);
  const { promise: bestPromise } = await downloadClassifiedImage({
    classified_image: images[bestImageIndex],
    regionOfInterest,
    output: outputDir,
    filename: "best",
  });
  await Promise.all([promise, bestPromise]);
  return { mean_image, best_image: images[bestImageIndex], regionOfInterest };
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
  validations: { validations: classifierValidationType }[],
  outputDir: string
) => {
  let average_validation_data: any;
  const ROCsArray = [] as { [p: string]: { TPR: number; FPR: number } }[];
  const importanceArray = [] as { [p: string]: number }[];
  const { values, CSV } = validations.reduce(
    (acc, { validations }, index) => {
      importanceArray.push(validations.explainedClassifier.importance);
      const ccrAndKappaArray = validations.ROC.features.map(
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
        AUC: validations.AUC,
        max_kappa,
        max_ccr,
        max_kappa_cutoff,
        max_ccr_cutoff,
        training_regression_r2: validations.training_regression.r2,
        validation_regression_r2: validations.validation_regression.r2,
      };
      acc.values.push(values);
      acc.CSV.push(getCSVRow(values, validationTableKeys, "Model" + index));

      return acc;
    },
    { CSV: [] as any[], values: [] as typeof average_validation_data[] }
  );

  average_validation_data = getAverageValues(values);
  const bestImageIndex = findBest(values);

  const averageRoc = Object.keys(ROCsArray[0])
    .map((cutoff) =>
      getAverageValues(ROCsArray.map((it) => ({ ...it[cutoff] })))
    )
    .sort((a, b) => (a.FPR < b.FPR ? -1 : 1));
  values.push(average_validation_data);
  const averageImportance = getAverageValues(importanceArray);
  CSV.push(getCSVRow(average_validation_data, validationTableKeys, "Average"));
  CSV.push(["best_index", bestImageIndex]);
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
  await saveChart(ROCHart, `${outputDir}/aver_roc.jpg`);
  await saveChart(paramsHistogram, `${outputDir}/aver_importance.jpg`);
  writeFileSync(`${outputDir}/validations.csv`, (await getCsv(CSV)) as string);
  return { values, bestImageIndex };
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
const sortOrder: (
  | "AUC"
  | "max_kappa"
  | "max_ccr"
  | "validation_regression_r2"
  | "training_regression_r2"
)[] = [
  "AUC",
  "max_kappa",
  "max_ccr",
  "validation_regression_r2",
  "training_regression_r2",
];
const findBest = (
  values: {
    AUC: number;
    max_kappa: number;
    max_ccr: number;
    max_kappa_cutoff: number;
    max_ccr_cutoff: number;
    training_regression_r2: number;
    validation_regression_r2: number;
  }[]
) => {
  const sorted = [...values]
    .map((it, index) => ({ ...it, index }))
    .sort((a, b) => {
      for (let key of sortOrder) {
        if (Math.abs(a[key] - b[key]) > 0.01) {
          return Math.sign(b[key] - a[key]); //DESCENDING
        }
      }
      return 0;
    });
  return sorted[0].index;
};
const getCSVRow = (
  obj: { [p: string]: number },
  keys: (keyof typeof obj)[],
  rowName: string
) => {
  return ([rowName] as any[]).concat(keys.map((key) => obj[key]));
};
