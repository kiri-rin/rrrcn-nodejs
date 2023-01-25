import { EEFeatureCollection, EEImage } from "../../types";
import {
  randomForestConfig,
  RandomForestParamsConfig,
} from "../../analytics_config_types2";
import { setDefaultsToScriptsConfig } from "../extract-data/extract-data";
import allScripts, { scriptKey } from "../../services/ee-data";
import { DatesConfig } from "../../services/utils/dates";
import { importGeometries } from "../../services/utils/import-geometries";

export const getAllPoints = async (
  trainingPointsConfig: randomForestConfig["trainingPoints"]
) => {
  switch (trainingPointsConfig.type) {
    case "all-points": {
      const presenceProp = trainingPointsConfig.allPoints.presenceProperty;
      const allPoints = await importGeometries(
        trainingPointsConfig.allPoints.points
      );
      if (presenceProp && presenceProp !== "Presence") {
        return allPoints.map((it: any) =>
          it.set("Presence", it.get(presenceProp))
        );
      } else {
        return allPoints;
      }
    }
    case "separate-points": {
      const absencePoints = (
        await importGeometries(trainingPointsConfig.absencePoints)
      ).map((it: any) => it.set("Presence", 0));
      const presencePoints = (
        await importGeometries(trainingPointsConfig.presencePoints)
      ).map((it: any) => it.set("Presence", 1));
      return presencePoints.merge(absencePoints);
    }
  }
};
export const getTrainingValidationPointsPare = (
  allPoints: EEFeatureCollection,
  validationConfig: randomForestConfig["validation"]
) => {
  switch (validationConfig.type) {
    case "split": {
      const pointsWithRandom = allPoints.randomColumn(
        "random",
        validationConfig.seed
      );
      return {
        trainingPoints: pointsWithRandom.filter(
          ee.Filter.gte("random", validationConfig.split)
        ),
        validationPoints: pointsWithRandom.filter(
          ee.Filter.lt("random", validationConfig.split)
        ),
      };
    }
    case "external": {
      return {
        trainingPoints: allPoints,
        validationPoints: getAllPoints(validationConfig.points),
      };
    }
  }
};
export const getParamsImage = async ({
  params,
  regionOfInterest,
}: {
  params: RandomForestParamsConfig;
  regionOfInterest: EEImage;
}) => {
  switch (params.type) {
    case "scripts": {
      const scripts = setDefaultsToScriptsConfig(params);
      const parametersImageArray = await Promise.all(
        scripts.map(({ key: script, dates, bands }) =>
          allScripts[script as scriptKey]({
            regions: regionOfInterest,
            datesConfig: dates as DatesConfig,
            bands,
          })
        )
      );
      return parametersImageArray.reduce((acc, it, index) => {
        return index ? acc.addBands(it) : acc;
      }, parametersImageArray[0]);
    }
    case "asset": {
      return ee.Image(params.path);
    }
  }
};
export const getRFClassifier = async ({
  trainingSamples,
  outputMode,
  paramsImage,
}: {
  trainingSamples: EEFeatureCollection;
  paramsImage: EEImage;
  outputMode: randomForestConfig["outputMode"];
}) => {
  const classifier = ee.Classifier.smileRandomForest(20)
    .setOutputMode(outputMode)
    .train({
      features: trainingSamples,
      classProperty: "Presence",
      inputProperties: paramsImage.bandNames(),
    });

  const classified_image = paramsImage
    .select(paramsImage.bandNames())
    .classify(classifier)
    .multiply(100)
    .round();
  return { classified_image, classifier };
};
