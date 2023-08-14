import { generateRandomPoints } from "../../services/migrations/random-points";
import { MigrationGenerationConfigType } from "./types";
import { EEFeature } from "../../types";
import { getAreaMigrationProbabilities } from "../../services/migrations/area-probabilities";

export const generateMigrationTracks = async ({
  migrations,
  allAreas,
  selectedAreas,
  initArea,
}: MigrationGenerationConfigType) => {
  const targetAreas = [];
  const initAreaFeature: EEFeature = ee.Feature(initArea, {});
  const initPoints = generateRandomPoints({
    area: initArea,
    count: migrations.length,
  });
  allAreas.features.forEach((area, index) => {
    const { top, right, left, bottom } = getAreaMigrationProbabilities({
      area: area.geometry,
      migrations,
    });
    let pointsGenerationTargetArea = area;
    const presencePoints = migrations.flatMap((migration) =>
      migration.points.filterBounds(area)
    );
    const interectsMigrationsCount; // =
    if (selectedAreas.includes(index)) {
      const absencePoints; //????
      const randomForestResult; // = RF(area,RFParams,presencePoints,absencePoints)
      pointsGenerationTargetArea = randomForestResult.then(({ area }) => area);
    } else {
    }
    targetAreas.push({
      pointsGenerationTargetArea,
      presencePointsCount: presencePoints.length,
      interectsMigrationsCount,
      probabilities,
    });
  });
  return Promise.all(
    targetAreas.map((it) => it.pointsGenerationTargetArea)
  ).then(async (resolvedAreas) => {
    await Promise.all(
      resolvedAreas.map(async (targetArea, index) => {
        targetAreas[index].generatedTracks = await generateRandomPoints(
          targetArea,
          targetAreas[index].precensePointsCount
        ).then((points) =>
          connectPointsToLocalTracks(
            points,
            targetAreas[index].interectsMigrationsCount
          )
        );
        return targetAreas[index].generatedTracks;
      })
    );
    const tracks = Array(initPoints.length);
    resolvedAreas.forEach((area, index) => {
      const fullArea = targetAreas[index];
      connectTrackPoints(fullArea, tracks);
    });
    return tracks;
  });
};
