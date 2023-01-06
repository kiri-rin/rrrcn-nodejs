import { EEFeatureCollection, EEImage } from "../../types";
import { evaluatePromisify } from "../utils/ee-image";
import { writeFile } from "fs/promises";
import {
  drawMarkerChart,
  drawHistogramChart,
  drawRegressionChart,
  saveChart,
} from "../charts";
import { getAcc, getAUCROC } from "./validation";

type RandomForestChartsMeta = {
  classifiedImage: EEImage;
  trainingData: EEFeatureCollection;
  validationData: EEFeatureCollection;
  regionOfInterest: any;
  output: string;
};
export const printRandomForestCharts = async ({
  classifiedImage,
  trainingData,
  validationData,
  regionOfInterest,
  output,
}: RandomForestChartsMeta) => {
  const histogramData = await evaluatePromisify(
    ee.List(
      new Array(101)
        .fill(0)
        .map((it, index) =>
          classifiedImage
            .eq(index)
            .reduceRegion(ee.Reducer.sum(), regionOfInterest, 1000)
        )
    ),
    10,
    100000
  );
  console.log(histogramData);
  var predictedTraining = classifiedImage.sampleRegions({
    collection: trainingData,
    geometries: true,
  });
  var predictedValidation = classifiedImage.sampleRegions({
    collection: validationData,
    geometries: true,
  });

  // Separate the observed (REDOX_CM) and predicted (regression) properties
  var sampleTraining = await evaluatePromisify(
    predictedTraining.select(["Presence", "classification"])
  );
  var sampleValidation = await evaluatePromisify(
    predictedValidation.select(["Presence", "classification"])
  );
  console.log(
    //@ts-ignore
    sampleValidation.features.length,
    await evaluatePromisify(predictedValidation.size()),
    await evaluatePromisify(validationData.size()),
    "VALIDATION SIZE"
  );
  // console.log(sampleTraining);
  // Create chart, print it

  const histogram = await drawHistogramChart(
    //@ts-ignore
    histogramData.map(({ classification }, index) => [index, classification])
  );
  let ROC = getAcc(classifiedImage, validationData, 1);
  const AUC = await evaluatePromisify(getAUCROC(ROC));
  ROC = await evaluatePromisify(ROC);
  await writeFile(output + "/ROC.json", JSON.stringify(ROC));
  const ROCChart = await drawMarkerChart(
    //@ts-ignore
    ROC.features //@ts-ignore
      .map(({ properties: { TPR, TNR, FPR } }) => [FPR, TPR])
      .reverse(),
    "AUC_ROC" + "\nAUC: " + AUC
  );
  await saveChart(ROCChart, output + "/roc.jpg");
  await saveChart(histogram, output + "/histogram.jpg");
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
  await saveChart(regressionValidation, output + "/regression_valid.jpg");
};
