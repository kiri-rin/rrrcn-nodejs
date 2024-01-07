import { generateRandomPoints } from "../../../services/migrations/random-points";
import {
  GeneratedTrack,
  IdType,
  IndexedArea,
  MigrationGenerationConfigType,
  NextAreaToIndex,
  TrackPoint,
} from "../types";
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
import { area, bboxPolygon, pointOnFeature, randomPoint } from "@turf/turf";
import { SplitMigrationsArea } from "../split-area";
import { GeoJSON } from "geojson";

export const generateMigrationTracks = async ({
  migrations,
  initCount = 10,
  outputs,
}: MigrationGenerationConfigType) => {
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
      points: [{ id: index, trackId: index, point: it, areaId: 0 }],
    })
  );

  const indexedInitPoints = generatedTracks.map((it) => it.points[0]!);

  let nextAreasToIndex: { [p: number]: NextAreaToIndex } = {};
  for (let initAreaIndex of initAreasIndices) {
    const area = allAreas[initAreaIndex];

    const areaInitPoints = indexedInitPoints.filter(
      (it) => !isPointOutsideBBox(it.point!.geometry, area)
    );
    areaInitPoints.forEach((it) => {
      it.areaId = initAreaIndex;
    });
    console.log({ areaInitPoints: areaInitPoints.length });

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
          neighboursAreasIds: {},
        };
      }
      for (let [direction, prob] of Object.entries(
        indexedAreas[id].probabilities
      ) as [Directions, number][]) {
        if (prob && !indexedAreas[id].neighboursAreasIds[direction]) {
          indexedAreas[id].neighboursAreasIds[direction] =
            findNeighbourAreaIndex(allAreas, area, direction);
        }
      }
      for (let { point, from } of areaToIndex.points) {
        const currentPointTrack = generatedTracks[point.trackId];

        const isDeadEnd =
          tracksDeadEnds.get(point.trackId)?.has(id) ||
          Object.entries(indexedAreas[id].probabilities.probabilities).every(
            ([direct, prob]) =>
              !prob ||
              tracksDeadEnds
                .get(point.trackId)
                ?.has(
                  indexedAreas[id]?.neighboursAreasIds[direct as Directions] ??
                    -1
                ) ||
              direct === from ||
              generatedTracks[point.trackId].points.filter(
                (it) =>
                  it.areaId ===
                  indexedAreas[id]?.neighboursAreasIds[direct as Directions]
              ).length
          );
        if (id === 1324) {
          console.log({
            from,
            probabilities: indexedAreas[id].probabilities,
            isDeadEnd,
          });
        }
        if (isDeadEnd) {
          tracksDeadEnds.get(point.trackId)?.add(id);
        }
        let shouldRollback = isDeadEnd;

        if (shouldRollback) {
          const fromAreaId = indexedAreas[id].neighboursAreasIds[from];
          if (fromAreaId !== undefined) {
            currentPointTrack.points.pop();

            const prevTrackPoint =
              currentPointTrack.points[currentPointTrack?.points.length - 1];
            if (prevTrackPoint) {
              const prevTrackPointArea = prevTrackPoint.areaId;
              const prevTrackPointFromPoint =
                currentPointTrack.points[currentPointTrack?.points.length - 2];
              if (prevTrackPointFromPoint) {
                const prevTrackPointFromPointArea =
                  prevTrackPointFromPoint.areaId;
                const prevTrackPointFrom = Object.keys(
                  indexedAreas[prevTrackPointArea].neighboursAreasIds
                ).find(
                  (it, arr) =>
                    indexedAreas[prevTrackPointArea].neighboursAreasIds[
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
            tracksDeadEnds.get(point.trackId)?.has(neighId)
          )
          .map(([dir]) => [dir, 0]);
        //TODO Rename areaToIndex
        const exitDirection = randomlyChooseDirection({
          ...indexedAreas[id].probabilities.probabilities,
          ...Object.fromEntries(deadEndDirections),
          ...(from && { [from]: 0 }),
        });

        if (!point.point) {
          //TODO refactor to plain geojson models
          point.point = randomPoint(1, bboxPolygon(area)).features[0];
          if (!point.point.properties) {
            point.point.properties = {};
          }
          point.point.properties.altitude = randomlyChooseAltitude(
            indexedAreas[id].probabilities.altitudes
          );
        }
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
          const nextPoint: TrackPoint = {
            areaId: neighbourIndex,
            id: generatedTracks[point.trackId].points.length,
            trackId: point.trackId,
          };
          generatedTracks[point.trackId].points.push(nextPoint);
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
  return { generatedTracks, indexedAreas, grid: allAreasFeatureCollection };
};
