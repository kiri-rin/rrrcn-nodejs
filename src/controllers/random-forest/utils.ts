import { EEFeatureCollection, EEImage } from "../../types";
import {
  RandomForestConfig,
  RandomForestParamsConfig,
} from "../../analytics_config_types";
import { setDefaultsToScriptsConfig } from "../extract-data/extract-data";
import allScripts, { scriptKey } from "../../services/ee-data";
import { DatesConfig } from "../../utils/dates";
import { importGeometries } from "../../utils/import-geometries";
import { getThumbUrl, getTiffUrl } from "../../utils/ee-image";
import { downloadFile } from "../../utils/io";
import { mkdir } from "fs/promises";

export const getAllPoints = async (
  trainingPointsConfig: RandomForestConfig["trainingPoints"]
) => {
  switch (trainingPointsConfig.type) {
    case "all-points": {
      const presenceProp = trainingPointsConfig.allPoints.presenceProperty;
      const allPoints = await importGeometries(
        trainingPointsConfig.allPoints.points,
        "points",
        [presenceProp || "Presence"]
      );
      // if (presenceProp && presenceProp !== "Presence") {
      //   return allPoints.map((it: any) =>
      //     it.set("Presence", it.get(presenceProp))
      //   );
      // } else {
      return allPoints;
      // }
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
  validationConfig: RandomForestConfig["validation"],
  seed?: number
) => {
  switch (validationConfig.type) {
    case "split": {
      const pointsWithRandom = allPoints.randomColumn(
        "random",
        seed || validationConfig.seed
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
      const parametersImageArray = (
        await Promise.all(
          scripts.map(({ key: script, dates, bands }) =>
            allScripts[script]({
              regions: regionOfInterest,
              datesConfig: dates as DatesConfig,
              bands,
            })
          )
        )
      ).flatMap((it) => [...Object.values(it)]);
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
  outputMode: RandomForestConfig["outputMode"];
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

export const downloadClassifiedImage = async ({
  classified_image,
  regionOfInterest,
  output,
  filename = "classification",
  discrete = false,
}: {
  classified_image: EEImage;
  regionOfInterest?: EEImage;
  output: string;
  filename?: string;
  discrete?: boolean;
}) => {
  const thumbUrl: string = await getThumbUrl(
    classified_image,
    regionOfInterest,
    discrete && {
      min: 0,
      max: 1,
      palette: ["white", "blue", "black"],
    }
  );
  const tiffUrl: string = await getTiffUrl(classified_image, regionOfInterest);
  await mkdir(output, { recursive: true });

  return {
    promise: Promise.all([
      downloadFile(thumbUrl, `${output}/${filename}.png`),
      downloadFile(tiffUrl, `${output}/${filename}.zip`),
    ]),
    tiffUrl,
    thumbUrl,
  };
};
