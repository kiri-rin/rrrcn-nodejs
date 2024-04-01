import { GeometriesImportConfig } from "../analytics_config_types";
import fsPromises, { readFile } from "fs/promises";
import { parse } from "csv-parse/sync";
import shp from "shpjs";
import { JSCSVTable } from "./points";
import { EEFeatureCollection } from "../types";
import { feature, featureCollection, point, polygon } from "@turf/helpers";
import { parse as parseDate, parseISO } from "date-fns";

export const importGeometriesGeojson = async (
  conf: GeometriesImportConfig,
  geometryType: "points" | "polygon" = "points",
  inheritProps = [] as string[]
): Promise<EEFeatureCollection> => {
  switch (conf.type) {
    case "csv": {
      const pointsFile = await fsPromises.readFile(conf.path);
      const pointsParsed = parse(pointsFile, { delimiter: ",", columns: true });
      return (
        geometryType === "polygon"
          ? importGeojsonPolygonFromCsv
          : importGeojsonPointsFromCsv
      )({
        csv: pointsParsed,
        lat_key: conf.latitude_key,
        long_key: conf.longitude_key,
        id_key: conf.id_key,
        inheritProps,
      });
    }
    case "shp": {
      return await importShapesToGeojsonFeatureCollection(conf.path);
    }
    case "geojson": {
      const fc = featureCollection(
        conf.json.features.map((it, index) => ({
          ...it,
          id: String(it.id) || index,
          properties: { ...it.properties, id: it.id || index },
        }))
      );
      return fc;
    }
    case "geojson_file": {
      const json = JSON.parse(
        await readFile(conf.path).then((res) => res.toString())
      );
      return importGeometriesGeojson(
        { type: "geojson", json },
        geometryType,
        inheritProps
      );
    }
  }
};
export async function importShapesToGeojsonFeatureCollection(path: string) {
  const shapeBuffer = await fsPromises.readFile(path);
  const geojson = await shp(shapeBuffer);
  return geojson;
}
export const importGeojsonPolygonFromCsv = ({
  csv,
  lat_key = "Latitude",
  long_key = "Longitude",
  inheritProps = [],
}: {
  csv: JSCSVTable;
  lat_key?: string;
  long_key?: string;
  id_key?: string;
  inheritProps?: string[];
}) =>
  polygon([csv.map((row) => [Number(row[long_key]), Number(row[lat_key])])]);
export function importGeojsonPointsFromCsv({
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
  inheritStringProps?: string[];
}) {
  return featureCollection(
    csv.map((row) =>
      point([Number(row[long_key]), Number(row[lat_key])], {
        ...Object.entries(row).reduce((acc, [key, value]) => {
          acc[key] = value;
          return acc;
        }, {} as any),
        id: row[id_key],
        longitude: row[long_key],
        latitude: row[lat_key],
        ...(row.date && {
          date: parseDate(row.date + " Z", "dd.MM.yyyy k:mm X", new Date()),
        }),
        ...inheritProps?.reduce((acc, key) => {
          acc[key] = Number(row[key]);
          return acc;
        }, {} as any),
      })
    )
  );
}
