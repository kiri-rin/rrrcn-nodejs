import { EEFeature, EEFeatureCollection } from "../../types";

const { stringify } = require("csv-stringify/sync");
export type JSCSVTable = { [rowName: string]: any }[];

export function importPointsFromCsv({
  csv,
  lat_key,
  long_key,
  id_key,
}: {
  csv: JSCSVTable;
  lat_key: string;
  long_key: string;
  id_key: string;
}) {
  return ee.FeatureCollection(
    csv.map((row) =>
      ee.Feature(
        ee.Geometry.Point([Number(row[long_key]), Number(row[lat_key])]),
        { id: row[id_key], longitude: row[long_key], latitude: row[lat_key] }
      )
    )
  );
}
export function exportFeatureCollectionsToCsv(collection: EEFeatureCollection) {
  const pointsIndices = new Map();
  let keysIndices = new Map(
    ["id", "longitude", "latitude"].map((it, index) => [it, index])
  );
  const table = [];
  for (let feature of collection) {
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
  return stringify(table);
}
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
