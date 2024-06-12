import { EEFeature, EEFeatureCollection } from "../types";

const { stringify } = require("csv-stringify");
export type JSCSVTable = { [colName: string]: any }[];

export async function exportFeatureCollectionsToCsv(
  collection: GeoJSON.Feature<any, { id: any } & { [p: string]: any }>[]
): Promise<string> {
  console.log("READY TO PROCESS TABLE");
  //@ts-ignore
  strapiLogger("READY TO PROCESS TABLE");
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
  return await getCsv(table);
}

export const getCsv = async (table: any[][]) => {
  return await new Promise<string>((resolve, reject) => {
    //@ts-ignore
    stringify(table, (error, res) => {
      if (error) {
        reject(error);
      } else {
        console.log("READY TO WRITE");
        //@ts-ignore
        strapiLogger("READY TO WRITE");
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
