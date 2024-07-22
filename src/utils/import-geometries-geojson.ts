import { GeometriesImportConfig } from "@rrrcn/common/src/types/services/analytics_config_types";
import fsPromises, { readFile } from "fs/promises";
import { parse } from "csv-parse/sync";
import shp from "shpjs";
import { EEFeatureCollection } from "../types";
import { featureCollection } from "@turf/helpers";
import {
  importGeojsonPointsFromCsv,
  importGeojsonPolygonFromCsv,
} from "@rrrcn/common/src/utils/geometry/parsers/csv";

export const importGeometriesGeojson = async (
  conf: GeometriesImportConfig,
  geometryType: "points" | "polygon" = "points",
  inheritProps = [] as string[]
): Promise<EEFeatureCollection> => {
  // | GeoJSON.FeatureCollection
  // | GeoJSON.FeatureCollection[]
  // | GeoJSON.Feature
  // | undefined
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
