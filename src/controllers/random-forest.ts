import { EEFeature, EEFeatureCollection, EEImage } from "../types";
import { analyticsConfigType } from "../analytics_config";
import fs, { mkdir, writeFile } from "fs/promises";
import { importPointsFromCsv, JSCSVTable } from "../services/utils/points";
import { parse } from "csv-parse/sync";
import allScripts, { scriptKey } from "../services/ee-data";
import { it } from "node:test";
import { evaluatePromisify } from "../services/utils/ee-image";

export const randomForest = async (analyticsConfig: analyticsConfigType) => {
  const parametersImageArray = [];
  if (!analyticsConfig.randomForest) return;
  const {
    scripts,
    pointsCsvPath,
    dates: defaultDates,
    outputs: defaultOutputs,
    regionOfInterestCsvPath,
  } = analyticsConfig;

  const pointsRaw = await fs.readFile(pointsCsvPath);
  const pointsParsed = parse(pointsRaw, { delimiter: ",", columns: true });
  const points = importPointsFromCsv({
    csv: pointsParsed,
    lat_key: "Latitude",
    long_key: "Longitude",
    id_key: "id",
    inheritProps: ["Presence"],
  });
  const regionPointsRaw = await fs.readFile(regionOfInterestCsvPath);
  const regionPointsParsed: JSCSVTable = parse(regionPointsRaw, {
    delimiter: ",",
    columns: true,
  });

  const regionOfInterest = ee.Geometry.Polygon([
    regionPointsParsed.map((row) => [
      Number(row.Longitude),

      Number(row.Latitude),
    ]),
  ]);

  const scriptObjects = scripts.map((it) =>
    typeof it === "string" ? { key: it } : it
  );
  for (let { key: script, dates, bands } of scriptObjects) {
    let scriptDates = dates === undefined ? defaultDates : dates;

    console.log(script);
    parametersImageArray.push(
      ...Object.values(
        await allScripts[script as scriptKey]({
          regions: regionOfInterest,
          datesConfig: scriptDates,
          bands,
        })
      )
    );
  }

  const paramsImage = parametersImageArray.reduce((acc, it, index) => {
    return index ? acc.addBands(it) : acc;
  }, parametersImageArray[0]);
  const bands = paramsImage.bandNames();

  const training = paramsImage.select(bands).sampleRegions({
    collection: points,
    properties: ["Presence"],
    scale: 100,
  });
  console.log(await evaluatePromisify(training.size()));

  const classifier_prob = ee.Classifier.smileRandomForest(20)
    .setOutputMode("PROBABILITY")
    .train({
      features: training,
      classProperty: "Presence",
      inputProperties: bands,
    });
  const classified_prob = paramsImage
    .select(bands)
    .classify(classifier_prob)
    .multiply(100)
    .round();

  // const sampleClassifierSize = await evaluatePromisify(
  //   ee.List(
  //     new Array(101)
  //       .fill(0)
  //       .map((it, index) =>
  //         classified_prob
  //           .updateMask(classified_prob.eq(index))
  //           .sample({ scale: 1000 })
  //           .size()
  //       )
  //   ),
  //   10,
  //   500000
  // );
  // console.log({ sampleClassifierSize });

  const json: any = await evaluatePromisify(classifier_prob.explain());
  json.thumbUrl = await new Promise((resolve) =>
    classified_prob.getThumbURL(
      {
        image: classified_prob,
        min: 0,
        region: regionOfInterest,
        max: 100,
        dimensions: 1000,
        palette: ["FFFFFF", "C6AC94", "8D8846", "395315", "031A00"],
      },
      (res: any) => {
        console.log(res, " URL");
        resolve(res);
      }
    )
  );
  json.downloadUrl = await new Promise((resolve) => {
    classified_prob.getDownloadURL(
      {
        image: classified_prob,
        maxPixels: 1e20,
        scale: 500,
        region: regionOfInterest,
      },
      (res: any) => {
        console.log(res, " URL");
        resolve(res);
      }
    );
  });
  // const vector = classified_prob.sample({
  //   projection: ee.Projection("EPSG:4326"),
  //   region: regionOfInterest,
  //   scale: 1000,
  //   factor: 1,
  //
  //   geometries: true,
  // });
  // json.downloadJSONUrl = await new Promise((resolve) => {
  //   vector.getDownloadURL(
  //     "JSON",
  //     ["classification"],
  //     "EXPORTED",
  //     (res: any, error: any) => {
  //       console.log({ res, error });
  //       console.log(res, " URL");
  //       resolve(res);
  //     }
  //   );
  // });
  // json.downloadKMLUrl = await new Promise((resolve) => {
  //   vector.getDownloadURL(
  //     "KML",
  //     ["classification"],
  //     "EXPORTED",
  //     (res: any, error: any) => {
  //       console.log({ res, error });
  //       console.log(res, " URL");
  //       resolve(res);
  //     }
  //   );
  // });

  await mkdir(`./.local/outputs/${defaultOutputs}`, { recursive: true });
  await writeFile(
    `./.local/outputs/${defaultOutputs}/trained.json`,
    JSON.stringify(json, null, 4)
  );

  return;
};
