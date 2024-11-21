import { evaluatePromisify } from "../../utils/ee-image";
import { EEFeature } from "../../types";
import { getAreaMigrationProbabilities } from "../../services/migrations/area-probabilities";

import { MigrationPath } from "@rrrcn/common-types/services/api/migrations/generate-tracks/config";

export type SplitMigrationAreaConfigType = {
  migrations: MigrationPath[];
};
export const SplitMigrationsArea = async (
  config: SplitMigrationAreaConfigType
) => {
  const migrations = config.migrations.map((it) => ({
    ...it,
    features: [...it.features],
  }));

  const allFeaturesCollection = ee.FeatureCollection(
    migrations.reduce(
      (acc, geojson) => {
        if (!acc.geojson) {
          acc.geojson = geojson; //fixme WARNING assertion by pointer!!!! breaks below
        } else {
          acc.geojson.features.push(...geojson.features);
        }
        return acc;
      },
      { geojson: null as GeoJSON.FeatureCollection | null }
    ).geojson
  );
  const convexHull = allFeaturesCollection.geometry().convexHull();
  const coveringGrid = convexHull.coveringGrid(
    ee.Projection("EPSG:4326"),
    100000
  );

  const evaluatedGrid = await evaluatePromisify(
    coveringGrid.map((it: any) => it.bounds())
  );

  return {
    grid: evaluatedGrid,
  };
};
