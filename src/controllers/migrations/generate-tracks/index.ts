import { generateRandomPoints } from "../../../services/migrations/random-points";
import {
  GeneratedTrack,
  GenerateTracksResponse,
  IdType,
  IndexedArea,
  NextAreaToIndex,
  TrackPoint,
} from "@rrrcn/common-types/services/api/migrations/generate-tracks/response";
import {
  Directions,
  findNeighbourAreaIndex,
  getAreaMigrationProbabilities,
  GetAreaMigrationProbabilitiesReturn,
  isPointOutsideBBox,
  oppositeDirections,
  randomlyChooseAltitude,
  randomlyChooseDirection,
} from "../../../services/migrations/area-probabilities";
import {
  area,
  bboxPolygon,
  feature,
  featureCollection,
  pointOnFeature,
  randomPoint,
} from "@turf/turf";
import { SplitMigrationsArea } from "../split-area";
import { GeoJSON } from "geojson";
import { elevationScript } from "../../../services/ee-data/scripts/elevation";
import { evaluateFeatures } from "../../../utils/gee-api";
import { getFeatures } from "../../../utils/ee-image";
import { reduceRegionsFromImageOrCollection } from "../../../utils/io";
import { MigrationGenerationConfigType } from "@rrrcn/common-types/services/api/migrations/generate-tracks/config";

export const generateMigrationTracks = async ({
  migrations,
  initCount = 10,
  outputs,
}: MigrationGenerationConfigType): Promise<GenerateTracksResponse> => {
  const {
    grid: allAreasFeatureCollection,
  }: { grid: GeoJSON.FeatureCollection<GeoJSON.Polygon> } =
    await SplitMigrationsArea({ migrations });
  const initAreasIndices: number[] = [];
  allAreasFeatureCollection.features.forEach((it, index) => {
    if (
      migrations.find(
        (migr) =>
          !isPointOutsideBBox(
            migr.features[0].geometry,
            it.bbox ||
              ([
                it.geometry.coordinates[0][0][0],
                it.geometry.coordinates[0][0][1],
                it.geometry.coordinates[0][2][0],
                it.geometry.coordinates[0][2][1],
              ] as GeoJSON.BBox)
          )
      )
    ) {
      initAreasIndices.push(index);
    }
  });
  for (let migration of migrations) {
    const elevations = await getFeatures(
      await reduceRegionsFromImageOrCollection(
        ee.FeatureCollection(migration.features),
        elevationScript({ regions: ee.FeatureCollection(migration.features) })
          .elevation,
        undefined,
        ["elevation"]
      )
    );
    migration.features.forEach((point, index) => {
      point.properties.altitude = Math.max(
        (point?.properties?.altitude || 0) -
          elevations[index].properties.elevation,
        0
      );
    });
  }

  const targetAreas = allAreasFeatureCollection.features.filter((it, index) =>
    initAreasIndices.includes(index)
  );
  const allAreas: GeoJSON.BBox[] = allAreasFeatureCollection.features.map(
    (it) =>
      it.bbox ||
      ([
        it.geometry.coordinates[0][0][0],
        it.geometry.coordinates[0][0][1],
        it.geometry.coordinates[0][2][0],
        it.geometry.coordinates[0][2][1],
      ] as GeoJSON.BBox)
  );

  const initPoints = await generateRandomPoints({
    area: ee.FeatureCollection(targetAreas).geometry(),
    count: initCount,
  });
  const indexedAreas: { [p: string]: IndexedArea } = {};

  const generatedTracks: GeneratedTrack[] = initPoints.features.map(
    (it, index) => ({
      id: index,
      points: featureCollection([
        feature(it.geometry, {
          ...it.properties,
          id: index,
          trackId: index,
          areaId: 0,
        }),
      ]),
    })
  );

  const indexedInitPoints = generatedTracks.map((it) => it.points.features[0]!);

  let nextAreasToIndex: { [p: number]: NextAreaToIndex } = {};
  for (let initAreaIndex of initAreasIndices) {
    const area = allAreas[initAreaIndex];

    const areaInitPoints = indexedInitPoints.filter(
      (it) => !isPointOutsideBBox(it!.geometry!, area)
    );
    areaInitPoints.forEach((it) => {
      it.properties.areaId = initAreaIndex;
    });

    nextAreasToIndex[initAreaIndex] = {
      id: initAreaIndex,
      points: areaInitPoints.map((point) => ({
        point,
        from: Directions.STOP,
      })),
    };
  }

  const tracksDeadEnds = new Map(
    generatedTracks.map((it) => [it.id, new Set()])
  );
  let firstArea = false;

  while (Object.values(nextAreasToIndex).length) {
    const newNextAreasToIndex: typeof nextAreasToIndex = {};

    for (let { id, ...areaToIndex } of Object.values(nextAreasToIndex)) {
      const area = allAreas[id];
      if (!area) {
        continue;
      }
      if (!indexedAreas[id]) {
        const probabilities = getAreaMigrationProbabilities({
          area,
          migrations,
        });
        indexedAreas[id] = {
          id: id,
          area: allAreas[id],
          probabilities,
          tracksCount: 0,
          altitudeStatistics: {},
          neighboursAreasIds: {},
        };
      }
      for (let [direction, prob] of Object.entries(
        indexedAreas[id].probabilities
      ) as [Directions, number][]) {
        if (
          prob &&
          indexedAreas[id].neighboursAreasIds[direction] === undefined
        ) {
          indexedAreas[id].neighboursAreasIds[direction] =
            findNeighbourAreaIndex(allAreas, area, direction);
        }
      }
      for (let { point, from } of areaToIndex.points) {
        const currentPointTrack = generatedTracks[point.properties.trackId!];

        const isDeadEnd =
          tracksDeadEnds.get(point.properties.trackId!)?.has(id) ||
          Object.entries(indexedAreas[id].probabilities.probabilities).every(
            ([direct, prob]) =>
              !prob ||
              tracksDeadEnds
                .get(point.properties.trackId!)
                ?.has(
                  indexedAreas[id]?.neighboursAreasIds[direct as Directions] ??
                    -1
                ) ||
              direct === from ||
              generatedTracks[point.properties.trackId!].points.features.filter(
                (it) =>
                  it.properties.areaId ===
                  indexedAreas[id]?.neighboursAreasIds[direct as Directions]
              ).length
          );

        if (!point.geometry) {
          point.geometry = randomPoint(
            1,
            bboxPolygon(area)
          ).features[0].geometry;
        }
        if (!point.properties) {
          point.properties = {};
        }

        point.properties.altitude = randomlyChooseAltitude(
          indexedAreas[id].probabilities.altitudes
        );
        if (!firstArea) {
          console.log(point, id, indexedAreas[id].probabilities.altitudes);
          firstArea = true;
        }
        if (isDeadEnd) {
          tracksDeadEnds.get(point.properties.trackId!)?.add(id);
        }
        let shouldRollback = isDeadEnd;

        if (shouldRollback) {
          const fromAreaId = indexedAreas[id].neighboursAreasIds[from];
          if (fromAreaId !== undefined) {
            currentPointTrack.points.features.pop();

            const prevTrackPoint =
              currentPointTrack.points.features[
                currentPointTrack?.points.features.length - 1
              ];
            if (prevTrackPoint) {
              const prevTrackPointArea = prevTrackPoint.properties.areaId;
              const prevTrackPointFromPoint =
                currentPointTrack.points.features[
                  currentPointTrack?.points.features.length - 2
                ];
              if (prevTrackPointFromPoint) {
                const prevTrackPointFromPointArea =
                  prevTrackPointFromPoint.properties.areaId;
                const prevTrackPointFrom = Object.keys(
                  indexedAreas[prevTrackPointArea!].neighboursAreasIds
                ).find(
                  (it, arr) =>
                    indexedAreas[prevTrackPointArea!].neighboursAreasIds[
                      it as Directions
                    ] === prevTrackPointFromPointArea
                ) as Directions;
                if (!newNextAreasToIndex[fromAreaId]) {
                  newNextAreasToIndex[fromAreaId] = {
                    id: fromAreaId,
                    points: [],
                  };
                }
                newNextAreasToIndex[fromAreaId].points.push({
                  point: prevTrackPoint,
                  from: prevTrackPointFrom!,
                });
              } else {
                if (!newNextAreasToIndex[fromAreaId]) {
                  newNextAreasToIndex[fromAreaId] = {
                    id: fromAreaId,
                    points: [],
                  };
                }
                newNextAreasToIndex[fromAreaId].points.push({
                  point: prevTrackPoint,
                  from: Directions.STOP,
                });
              }
            }
          }

          continue;
        }
        const deadEndDirections = Object.entries(
          indexedAreas[id].neighboursAreasIds
        )
          .filter(([dir, neighId]) =>
            tracksDeadEnds.get(point.properties.trackId!)?.has(neighId)
          )
          .map(([dir]) => [dir, 0]);
        //TODO Rename areaToIndex
        const exitDirection = randomlyChooseDirection({
          ...indexedAreas[id].probabilities.probabilities,
          ...Object.fromEntries(deadEndDirections),
          ...(from && { [from]: 0 }),
        });

        if (exitDirection === from) {
          continue;
        }

        if (exitDirection && exitDirection !== Directions.STOP) {
          let neighbourIndex =
            indexedAreas[id].neighboursAreasIds[exitDirection];
          if (!neighbourIndex) {
            neighbourIndex = findNeighbourAreaIndex(
              allAreas,
              area,
              exitDirection
            );
            if (neighbourIndex !== -1) {
              indexedAreas[id].neighboursAreasIds[exitDirection] =
                neighbourIndex;
              if (!indexedAreas[neighbourIndex]) {
                indexedAreas[neighbourIndex] = {
                  neighboursAreasIds: {
                    [oppositeDirections[exitDirection]]: id,
                  },
                  tracksCount: 0,
                  altitudeStatistics: {},
                  id: neighbourIndex,
                  probabilities: getAreaMigrationProbabilities({
                    area: allAreas[neighbourIndex],
                    migrations,
                  }),
                  area: allAreas[neighbourIndex],
                };
              } else {
                indexedAreas[neighbourIndex].neighboursAreasIds[
                  oppositeDirections[exitDirection]
                ] = id;
              }
            }
          }
          const nextPoint: TrackPoint = feature(null, {
            areaId: neighbourIndex,
            id: generatedTracks[point.properties.trackId!].points.features
              .length,
            trackId: point.properties.trackId,
          });
          generatedTracks[point.properties.trackId!].points.features.push(
            nextPoint
          );
          if (newNextAreasToIndex[neighbourIndex]) {
            newNextAreasToIndex[neighbourIndex].points.push({
              point: nextPoint,
              from: oppositeDirections[exitDirection],
            });
          } else {
            newNextAreasToIndex[neighbourIndex] = {
              points: [
                { point: nextPoint, from: oppositeDirections[exitDirection] },
              ],
              id: neighbourIndex,
            };
          }
        }
      }
    }
    nextAreasToIndex = newNextAreasToIndex;
  }
  generatedTracks.forEach((track) => {
    track.points.features.forEach((point, index) => {
      if (point.properties.altitude !== undefined) {
        const altitude = Math.round(point.properties.altitude!);
        indexedAreas[point.properties.areaId!]!.tracksCount++;
        if (
          !indexedAreas[point.properties.areaId!].altitudeStatistics[altitude]
        ) {
          indexedAreas[point.properties.areaId!].altitudeStatistics[
            altitude
          ] = 0;
        }
        indexedAreas[point.properties.areaId!].altitudeStatistics[altitude]++;
      }
    });
  });
  return {
    generatedTracks: generatedTracks as GeneratedTrack<GeoJSON.Point>[],
    indexedAreas,
    grid: allAreasFeatureCollection,
  };
};
