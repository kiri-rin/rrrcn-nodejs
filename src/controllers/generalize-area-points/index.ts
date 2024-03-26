import {
  generalizeAreaPointsService,
  GeneralizeAreaPointsServiceArgs,
} from "../../services/generalize-area-points";
import * as turf from "@turf/turf";
export type GeneralizeAreaPointsControllerArgs = {
  area: GeoJSON.Polygon;
  points: GeoJSON.Feature<GeoJSON.Point>[];
  cellSide: number;
};
export const generalizeAreaPointsController = async (
  args: GeneralizeAreaPointsControllerArgs
) => {
  const points = args.points.filter((it) =>
    turf.booleanPointInPolygon(it, args.area)
  );
  console.log(points.length);
  return generalizeAreaPointsService({ points, cellSide: args.cellSide });
};
