import { GeometriesImportConfig } from "../../analytics_config_types2";
import fsPromises from "fs/promises";
import { parse } from "csv-parse/sync";
import shp from "shpjs";
import { JSCSVTable } from "./points";
import { EEFeatureCollection } from "../../types";

export const importGeometries = async (
  conf: GeometriesImportConfig,
  geometryType = "points"
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
      });
    }
    case "shp": {
      return await importShapesToFeatureCollection(conf.path);
    }
    case "asset": {
      return ee.FeatureCollection(conf.path);
    }
  }
};
export async function importShapesToFeatureCollection(path: string) {
  const shapeBuffer = await fsPromises.readFile(path);
  const geojson = await shp(shapeBuffer);
  return ee.FeatureCollection(geojson);
}
export const importPolygonFromCsv = ({
  csv,
  lat_key = "latitude",
  long_key = "longitude",
}: {
  csv: JSCSVTable;
  lat_key?: string;
  long_key?: string;
  id_key?: string;
}) => {
  ee.Geometry.Polygon([
    csv.map((row) => [Number(row[long_key]), Number(row[lat_key])]),
  ]);
};
export function importPointsFromCsv({
  csv,
  lat_key = "latitude",
  long_key = "longitude",
  id_key = "id",
}: {
  csv: JSCSVTable;
  lat_key?: string;
  long_key?: string;
  id_key?: string;
}) {
  return ee
    .FeatureCollection(
      csv.map((row) =>
        ee.Feature(
          ee.Geometry.Point([Number(row[long_key]), Number(row[lat_key])]),
          {
            ...row,
            id: row[id_key],
            longitude: row[long_key],
            latitude: row[lat_key],
          }
        )
      )
    )
    .distinct(["latitude", "longitude"]);
}
