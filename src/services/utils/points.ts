import { EEFeature, EEFeatureCollection } from "../../types";

const { stringify } = require("csv-stringify");
export type JSCSVTable = { [rowName: string]: any }[];

export function importPointsFromCsv({
  csv,
  lat_key,
  long_key,
  id_key,
  inheritProps,
}: {
  csv: JSCSVTable;
  lat_key: string;
  long_key: string;
  id_key: string;
  inheritProps?: string[];
}) {
  return ee
    .FeatureCollection(
      csv.map((row) =>
        ee.Feature(
          ee.Geometry.Point([Number(row[long_key]), Number(row[lat_key])]),
          {
            id: row[id_key],
            longitude: row[long_key],
            latitude: row[lat_key],
            ...inheritProps?.reduce((acc, key) => {
              acc[key] = Number(row[key]);
              return acc;
            }, {} as any),
          }
        )
      )
    )
    .distinct(["latitude", "longitude"]);
}
export async function exportFeatureCollectionsToCsv(
  collection: EEFeatureCollection
): Promise<string> {
  console.log("READY TO PROCESS TABLE");
  const pointsIndices = new Map();
  let keysIndices = new Map(
    ["id", "longitude", "latitude"].map((it, index) => [it, index])
  );
  const table: any[] = [];
  for (let feature of collection) {
    // console.log(feature);
    const pointRow = pointsIndices.get(feature.properties.id);
    if (pointRow === undefined) {
      const row: any[] = [];
      fulfillRowWithPoint(row, feature, pointsIndices, keysIndices);
      pointsIndices.set(feature.properties.id, table.push(row) - 1);
    } else {
      fulfillRowWithPoint(table[pointRow], feature, pointsIndices, keysIndices);
    }
  }
  const keysArray = [...keysIndices.entries()].reduce(
    (acc: any[], [key, index]) => {
      acc[index] = key;
      return acc;
    },
    []
  );
  table.unshift(keysArray);
  console.log("READY TO STRINGIFY");
  return await new Promise((resolve, reject) => {
    //@ts-ignore
    stringify(table, (error, res) => {
      if (error) {
        reject(error);
      } else {
        console.log("READY TO WRITE");
        resolve(res);
      }
    });
  });
}
export const getCsv = async (table: any[][]) => {
  return await new Promise((resolve, reject) => {
    //@ts-ignore
    stringify(table, (error, res) => {
      if (error) {
        reject(error);
      } else {
        console.log("READY TO WRITE");
        resolve(res);
      }
    });
  });
};
const fulfillRowWithPoint = (
  row: any[],
  point: EEFeature,
  pointsIndices: Map<string, number>,
  keysIndices: Map<string, number>
) => {
  for (let [key, prop] of Object.entries(point.properties)) {
    let colIndex = keysIndices.get(key);
    if (colIndex === undefined) {
      colIndex = keysIndices.set(key, keysIndices.size) && keysIndices.size - 1;
    }
    row[colIndex] = prop;
  }
};
