import { generateRandomPoints } from "../../services/migrations/random-points";
import {
  GeneratedTrack,
  IndexedArea,
  MigrationGenerationConfigType,
  NextAreaToIndex,
  TrackPoint,
} from "./types";
import {
  Directions,
  findNeighbourAreaIndex,
  getAreaMigrationProbabilities,
  isPointOutsideBBox,
  oppositeDirections,
  randomlyChooseDirection,
} from "../../services/migrations/area-probabilities";
import { all } from "axios";
import { getRFClassifier } from "../random-forest/utils";
import { randomForest } from "../random-forest/random-forest";
import * as path from "path";
import { maxent } from "../maxent/maxent";

export const generateMigrationTracks = async ({
  migrations,
  allAreas: allAreasFeatureCollection,
  selectedAreasIndices,
  initAreasIndices: _,
  initCount = 10,
  params,
  outputs,
}: MigrationGenerationConfigType) => {
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
      points: [{ id: index, trackId: index, point: it.geometry }],
    })
  );

  const indexedInitPoints = generatedTracks.map((it) => it.points[0]!);

  let nextAreasToIndex: { [p: number]: NextAreaToIndex } = {};
  for (let initAreaIndex of initAreasIndices) {
    const area = allAreas[initAreaIndex];

    const areaInitPoints = indexedInitPoints.filter(
      (it) => !isPointOutsideBBox(it.point!, area)
    );
    nextAreasToIndex[initAreaIndex] = {
      id: initAreaIndex,
      points: areaInitPoints.map((point) => ({ point, from: Directions.STOP })),
    };
  }
  const rfJobs = [];
  let rfProgress = 0;
  for (let selectedAreaIndex of selectedAreasIndices) {
    const regionOfInterestBBox = allAreas[selectedAreaIndex];
    const points = migrations.flatMap((it) =>
      it.features.filter(
        (it) => !isPointOutsideBBox(it.geometry, regionOfInterestBBox)
      )
    );
    console.log({ points: points.length }, regionOfInterestBBox);
    const promise = maxent({
      params,
      trainingPoints: {
        type: "separate-points",
        presencePoints: {
          type: "geojson",
          json: {
            type: "FeatureCollection",
            features: points,
          },
        },
      },
      regionOfInterest: {
        type: "geojson",
        json: {
          type: "FeatureCollection",
          features: [
            {
              type: "Feature",
              properties: {},
              geometry: {
                type: "Polygon",
                coordinates: [
                  [
                    [regionOfInterestBBox[0], regionOfInterestBBox[1]],
                    [regionOfInterestBBox[0], regionOfInterestBBox[3]],
                    [regionOfInterestBBox[2], regionOfInterestBBox[3]],
                    [regionOfInterestBBox[2], regionOfInterestBBox[1]],
                  ],
                ],
              },
            },
          ],
        },
      },
      outputs: path.join(outputs || "", String(selectedAreaIndex)),
      validation: { split: 0.2, type: "split" },
    }).then((res) => {
      rfProgress++;
      return res;
    });
    rfJobs.push(promise);
  }
  const processedAreas = (await Promise.all(rfJobs)).map(
    ({ classified_image }) => classified_image
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
      //TODO Optimize cycle
      for (let { point, from } of areaToIndex.points) {
        //TODO Rename areaToIndex
        const exitDirection = randomlyChooseDirection(
          indexedAreas[id].probabilities
        );

        if (!point.point) {
          point.point = generateEdgePoint(area, from);
        }
        if (exitDirection === from) {
          continue;
        }
        if (exitDirection && exitDirection !== Directions.STOP) {
          const nextPoint: TrackPoint = {
            id: generatedTracks[point.trackId].points.length,
            trackId: point.trackId,
          };
          generatedTracks[point.trackId].points.push(nextPoint);
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
            }
          }
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
  return generatedTracks;
};
const generateEdgePoint = (
  area: GeoJSON.BBox,
  direction: Directions
): GeoJSON.Point | undefined => {
  const randomNumber = Math.random();
  let coordinates;
  switch (direction) {
    case Directions.TOP: {
      coordinates = [area[0] + randomNumber * (area[2] - area[0]), area[3]];
      break;
    }
    case Directions.LEFT: {
      coordinates = [area[0], area[1] + randomNumber * (area[3] - area[1])];
      break;
    }
    case Directions.RIGHT: {
      coordinates = [area[2], area[1] + randomNumber * (area[3] - area[1])];
      break;
    }
    case Directions.BOTTOM: {
      coordinates = [area[0] + randomNumber * (area[2] - area[0]), area[1]];
      break;
    }
    default:
      return undefined;
  }
  return { type: "Point", coordinates: coordinates };
};
