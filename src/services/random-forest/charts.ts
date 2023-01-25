import { EEFeatureCollection, EEImage } from "../../types";
import { evaluatePromisify } from "../utils/ee-image";
import { writeFile } from "fs/promises";
import {
  drawMarkerChart,
  drawHistogramChart,
  drawRegressionChart,
  saveChart,
} from "../charts";
import { getAcc, getAUCROC } from "./auc-roc-validation";
import { validateClassifier } from "./all-validations";

type RandomForestChartsMeta = {
  classifiedImage: EEImage;
  trainingData: EEFeatureCollection;
  validationData: EEFeatureCollection;
  explainedClassifier: any;
  regionOfInterest: any;
  output: string;
};
export const printRandomForestCharts = async ({
  classifiedImage,
  trainingData,
  explainedClassifier,
  validationData,
  output,
}: RandomForestChartsMeta) => {
  var predictedTraining = classifiedImage.sampleRegions({
    collection: trainingData,
    geometries: true,
    scale: 100,
  });
  var predictedValidation = classifiedImage.sampleRegions({
    collection: validationData,
    geometries: true,
    scale: 100,
  });

  // Separate the observed (REDOX_CM) and predicted (regression) properties
  var sampleTraining = await evaluatePromisify(
    predictedTraining.select(["Presence", "classification"])
  );
  var sampleValidation = await evaluatePromisify(
    predictedValidation.select(["Presence", "classification"])
  );

  // const histogram = await drawHistogramChart(
  //   //@ts-ignore
  //   histogramData.map(({ classification }, index) => [index, classification])
  // );
  const paramsHistogram = await drawHistogramChart(
    //@ts-ignore
    Object.entries(explainedClassifier.importance)
  );
  paramsHistogram.xAxis().labels().height(15);
  paramsHistogram.xAxis().labels().rotation(90);
  let ROC = getAcc(predictedValidation);
  const AUC = await evaluatePromisify(getAUCROC(ROC));
  ROC = await evaluatePromisify(ROC);
  await writeFile(output + "/ROC.json", JSON.stringify(ROC, null, 4));
  const ROCChart = await drawMarkerChart(
    //@ts-ignore
    ROC.features //@ts-ignore
      .map(({ properties: { TPR, FPR } }) => [FPR, TPR])
      .reverse(),
    "AUC_ROC" + "\nAUC: " + AUC
  );
  await saveChart(ROCChart, output + "/roc.jpg");
  // await saveChart(histogram, output + "/histogram.jpg");
  const regression = await drawRegressionChart(
    //@ts-ignore
    sampleTraining.features.map(
      ({ properties: { Presence, classification } }: any) => [
        classification,
        Presence,
      ]
    )
  );
  const regressionValidation = await drawRegressionChart(
    //@ts-ignore
    sampleValidation.features.map(
      ({ properties: { Presence, classification } }: any) => [
        classification,
        Presence,
      ]
    )
  );
  await saveChart(regression, output + "/regression.jpg");
  await saveChart(paramsHistogram, output + "/paramsHistogram.jpg");
  await saveChart(regressionValidation, output + "/regression_valid.jpg");
};
