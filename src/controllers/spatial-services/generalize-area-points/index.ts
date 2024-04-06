import {
  generalizeAreaPointsService,
  GeneralizeAreaPointsServiceArgs,
} from "../../../services/spatial-services/generalize-area-points";
import * as turf from "@turf/turf";
import { GeometriesImportConfig } from "../../../analytics_config_types";
import { importGeometriesGeojson } from "../../../utils/import-geometries-geojson";
import { FeatureCollection, Point } from "@turf/turf";
import { writeFile } from "fs/promises";
export type GeneralizeAreaPointsControllerArgs = {
  area?: GeoJSON.Polygon;
  points: GeometriesImportConfig;
  cellSide: number;
  outputs: string;
};
export const generalizeAreaPointsController = async (
  args: GeneralizeAreaPointsControllerArgs
) => {
  const pointsCollection: FeatureCollection<Point> =
    await importGeometriesGeojson(args.points, "points");
  const points = args.area
    ? pointsCollection.features.filter((it) =>
        turf.booleanPointInPolygon(it, args.area!)
      )
    : pointsCollection.features;
  // for (let i = 0; i < points.length; i += 10000) {
  const res = await generalizeAreaPointsService({
    points: points,
    cellSide: args.cellSide,
  });
  console.log(res.length, "res length");
  await writeFile(
    `${args.outputs}/generalize_${args.cellSide}.json`,
    JSON.stringify(res, null, 4)
  );
  // }
  return "res";
};
