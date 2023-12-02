import { EEFeatureCollection, EEImage } from "../../types";
import {
  MaxentConfig,
  RandomForestConfig,
  RandomForestParamsConfig,
} from "../../analytics_config_types";
import { setDefaultsToScriptsConfig } from "../extract-data/extract-data";
import allScripts, { scriptKey } from "../../services/ee-data";
import { DatesConfig } from "../../utils/dates";
import { importGeometries } from "../../utils/import-geometries";
import {
  evaluatePromisify,
  getThumbUrl,
  getTiffUrl,
} from "../../utils/ee-image";
import { downloadFile } from "../../utils/io";
import { mkdir, writeFile } from "fs/promises";

export const getAllPoints = async (
  trainingPointsConfig: MaxentConfig["trainingPoints"]
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
      const absencePoints =
        trainingPointsConfig.absencePoints &&
        (await importGeometries(trainingPointsConfig.absencePoints)).map(
          (it: any) => it.set("Presence", 0)
        );
      const presencePoints = (
        await importGeometries(trainingPointsConfig.presencePoints)
      ).map((it: any) => it.set("Presence", 1));
      return absencePoints
        ? presencePoints.merge(absencePoints)
        : presencePoints;
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
          scripts.map(({ key: script, dates, bands, filename }) => {
            const res = allScripts[script]({
              regions: regionOfInterest,
              datesConfig: dates as DatesConfig,
              bands,
            });
            if (filename) {
              for (let [key, image] of Object.entries(res)) {
                res[key] = res[key].rename([`${filename}_${key}`]);
              }
            }
            return res;
          })
        )
      ).flatMap((it) => [...Object.values(it)]);
      return parametersImageArray
        .reduce((acc, it, index) => {
          return index ? acc.addBands(it) : acc;
        }, parametersImageArray[0])
        .clip(regionOfInterest);
    }
    case "asset": {
      return ee.Image(params.path).clip(regionOfInterest);
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
    discrete
      ? {
          min: 0,
          max: 1,
          palette: ["white", "blue", "black"],
        }
      : {
          min: 0,
          max: 100,
          palette: ["white", "blue", "black"],
        }
  );
  const tiffUrl: string = await getTiffUrl(classified_image, regionOfInterest);
  const geojson =
    discrete &&
    (await evaluatePromisify(
      classified_image.gt(0).selfMask().reduceToVectors({
        geometry: regionOfInterest,
        scale: 1000,
      })
    ));
  await mkdir(output, { recursive: true });
  // var task = ee.batch.Export.image.toDrive({
  //   image: classified_image,
  //   folder: "GEE_DEMO",
  //   description: "demo",
  //   fileNamePrefix: `${output}/${filename}`,
  //   scale: 500,
  //   region: regionOfInterest,
  // });
  // task.start(
  //   () => {},
  //   (err: string) => {
  //     console.log({ err });
  //   }
  // );
  console.log({ thumbUrl, tiffUrl });
  return {
    promise: Promise.all([
      downloadFile(thumbUrl, `${output}/${filename}.png`),
      downloadFile(tiffUrl, `${output}/${filename}.zip`),
      geojson
        ? writeFile(`${output}/${filename}.geojson`, JSON.stringify(geojson))
        : Promise.resolve(null),
    ]),
    tiffUrl,
    thumbUrl,
  };
};
