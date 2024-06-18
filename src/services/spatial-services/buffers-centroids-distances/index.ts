import { Feature, FeatureCollection, Point, Polygon } from "@turf/helpers";
import * as turf from "@turf/turf";
import { Position } from "@turf/helpers/dist/js/lib/geojson";
export type BuffersCentroidsDistancesBufferParameters = {
  probability: number;
  date_string: string;
  id: string;
};
export type BuffersCentroidsDistancesServiceArgs = {
  buffers: FeatureCollection<
    Polygon,
    BuffersCentroidsDistancesBufferParameters
  >;
};
export type BuffersCentroidsDistancesServiceResponse = {
  [date_string: string]: {
    min: {
      distance: number | null;
      ["95_kernel_id"]: string | null;
      lines: GeoJSON.Feature<GeoJSON.LineString>[];
    };
    max: {
      distance: number | null;
      ["50_kernel_id"]: string | null;
      ["95_kernel_id"]: string | null;
      lines: GeoJSON.Feature<GeoJSON.LineString>[];
    };
  };
};
export async function buffersCentroidsDistancesService(
  args: BuffersCentroidsDistancesServiceArgs
): Promise<BuffersCentroidsDistancesServiceResponse> {
  const deduplicatedBuffers = Array.from(
    args.buffers.features
      .reduce((acc, it) => {
        acc.set(String(it.properties.id!), it);
        return acc;
      }, new Map<string, Feature<Polygon, BuffersCentroidsDistancesBufferParameters>>())
      .values()
  );
  const buffersByMonths = deduplicatedBuffers.reduce(
    (acc, it) => {
      if (!acc[it.properties.date_string]) {
        acc[it.properties.date_string] = [];
      }
      acc[it.properties.date_string].push(it);
      return acc;
    },
    {} as {
      [date_string: string]: Feature<
        Polygon,
        BuffersCentroidsDistancesBufferParameters
      >[];
    }
  );
  const res: BuffersCentroidsDistancesServiceResponse = {};
  for (let [date_string, buffers] of Object.entries(buffersByMonths)) {
    const buffers_50 = buffers.filter((it) => it.properties.probability === 50);
    const buffers_95 = buffers.filter((it) => it.properties.probability === 95);
    const min: BuffersCentroidsDistancesServiceResponse[string]["min"] = {
      distance: null,
      ["95_kernel_id"]: null,
      lines: [],
    };
    const max: BuffersCentroidsDistancesServiceResponse[string]["max"] = {
      distance: null,
      ["50_kernel_id"]: null,
      ["95_kernel_id"]: null,
      lines: [],
    };
    for (let buffer of buffers_95) {
      const centroid = turf.centroid(buffer);
      const { point, distance } = findFarthestPoint(
        centroid.geometry,
        buffer.geometry.coordinates.flatMap((it) => it)
      );
      point &&
        min.lines.push(
          turf.lineString(
            [
              centroid.geometry.coordinates,
              Array.isArray(point) ? point : point.coordinates,
            ],
            { ["95_kernel_id"]: buffer.properties.id, distance }
          )
        );
      if (min.distance === null || min.distance < distance) {
        min.distance = distance;
        min["95_kernel_id"] = buffer.properties.id;
      }
    }
    for (let buffer of buffers_50) {
      const centroid = turf.centroid(buffer);
      for (let targetBuffer of buffers_95) {
        const { point, distance } = findFarthestPoint(
          centroid.geometry,
          targetBuffer.geometry.coordinates.flatMap((it) => it)
        );
        point &&
          max.lines.push(
            turf.lineString(
              [
                centroid.geometry.coordinates,
                Array.isArray(point) ? point : point.coordinates,
              ],
              {
                ["95_kernel_id"]: targetBuffer.properties.id,
                ["50_kernel_id"]: buffer.properties.id,
                distance,
              }
            )
          );
        if (max.distance === null || max.distance < distance) {
          max.distance = distance;
          max["95_kernel_id"] = targetBuffer.properties.id;
          max["50_kernel_id"] = buffer.properties.id;
        }
      }
    }
    res[date_string] = { min, max };
  }
  return res;
  // const result: BuffersCentroidsDistancesServiceResponse;
}
function findFarthestPoint(
  point: Point,
  points: Point[] | Position[]
): { point: Point | Position | null; distance: number } {
  const res = {
    point: null as Point | Position | null,
    distance: 0,
  };
  for (let targetPoint of points) {
    const distance = turf.distance(targetPoint, point);
    if (distance > res.distance) {
      res.distance = distance;
      res.point = targetPoint;
    }
  }
  return res;
}
