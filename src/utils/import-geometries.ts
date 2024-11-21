import { GeometriesImportConfig } from "@rrrcn/common-types/services/api/common-body";
import fsPromises, { readFile } from "fs/promises";
import { parse } from "csv-parse/sync";
import shp from "shpjs";
import { JSCSVTable } from "./points";
import { EEFeatureCollection } from "../types";
import * as util from "util";
import { evaluatePromisify } from "./ee-image";

export const importGeometries = async (
  conf: GeometriesImportConfig,
  geometryType: "points" | "polygon" = "points",
  inheritProps = [] as string[]
): Promise<EEFeatureCollection> => {
  switch (conf.type) {
    case "csv": {
      const pointsFile = await fsPromises.readFile(conf.path);
      const pointsParsed = parse(pointsFile, { delimiter: ",", columns: true });
      return (
        geometryType === "polygon" ? importPolygonFromCsv : importPointsFromCsv
      )({
        csv: pointsParsed,
        lat_key: conf.latitude_key,
        long_key: conf.longitude_key,
        id_key: conf.id_key,
        inheritProps,
      });
    }
    case "shp": {
      const fc = await importShapesToFeatureCollection(conf.path);
      if (geometryType === "polygon") {
        //TODO refactor
        return fc.geometry();
      } else {
        return fc;
      }
    }
    case "geojson": {
      const fc = ee.FeatureCollection(
        conf.json.features.map((it, index) => ({
          ...it,
          id: String(it.id) || index,
          properties: { ...it.properties, id: it.id || index },
        }))
      );
      if (geometryType === "polygon") {
        return fc.geometry();
      } else {
        return fc;
      }
    }
    case "geojson_file": {
      const json = JSON.parse(
        await readFile(conf.path).then((res) => res.toString())
      );
      return importGeometries(
        { type: "geojson", json },
        geometryType,
        inheritProps
      );
    }
    case "asset": {
      const fc = ee.FeatureCollection(conf.path);
      if (geometryType === "polygon") {
        return fc.geometry();
      } else {
        return fc;
      }
    }
  }
};
export async function importShapesToFeatureCollection(path: string) {
  const shapeBuffer = await fsPromises.readFile(path);
  const geojson = await shp(shapeBuffer);
  return ee.FeatureCollection(geojson).map((it: any) => it.set("id", it.id()));
}
export const importPolygonFromCsv = ({
  csv,
  lat_key = "latitude",
  long_key = "longitude",
  inheritProps = [],
}: {
  csv: JSCSVTable;
  lat_key?: string;
  long_key?: string;
  id_key?: string;
  inheritProps?: string[];
}) =>
  ee.Geometry.Polygon([
    csv.map((row) => [Number(row[long_key]), Number(row[lat_key])]),
  ]);
export function importPointsFromCsv({
  csv,
  lat_key = "latitude",
  long_key = "longitude",
  id_key = "id",
  inheritProps = [],
}: {
  csv: JSCSVTable;
  lat_key?: string;
  long_key?: string;
  id_key?: string;
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
