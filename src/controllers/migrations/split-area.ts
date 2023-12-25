import { evaluatePromisify } from "../../utils/ee-image";
import { EEFeature } from "../../types";
import { getAreaMigrationProbabilities } from "../../services/migrations/area-probabilities";
import { inspect } from "util";

export type SplitMigrationAreaConfigType = {
  migrations: { geojson: GeoJSON.FeatureCollection<GeoJSON.Point> }[];
};
export const SplitMigrationsArea = async (
  config: SplitMigrationAreaConfigType
) => {
  const migrations = config.migrations.map((it) => ({
    ...it,
    geojson: { ...it.geojson, features: [...it.geojson.features] },
  }));

  const featureCollections = ee.FeatureCollection(
    migrations.map(({ geojson }) =>
      ee.Feature(ee.FeatureCollection(geojson).geometry())
    )
  );
  const allFeaturesCollection = ee.FeatureCollection(
    migrations.reduce(
      (acc, { geojson }) => {
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
  const intersections = coveringGrid.map((square: EEFeature) =>
    ee.Feature(null, {
      size: featureCollections.filterBounds(square.geometry()).size(),
    })
  );
  const evaluatedIntersections = (
    await evaluatePromisify(intersections)
  ).features.map((it: any) => it.properties.size);
  const evaluatedGrid = await evaluatePromisify(
    coveringGrid.map((it: any) => it.bounds())
  );
  console.log(evaluatedGrid.features[0]);
  console.log(
    "LENGTH",
    config.migrations.map((it) => it.geojson.features.length)
  );
  return {
    intersections: evaluatedIntersections,
    probabilities: evaluatedGrid.features.map(
      //@ts-ignore
      (it, index) =>
        it &&
        getAreaMigrationProbabilities({
          area:
            it.bbox ||
            ([
              it.geometry.coordinates[0][0][0],
              it.geometry.coordinates[0][0][1],
              it.geometry.coordinates[0][2][0],
              it.geometry.coordinates[0][2][1],
            ] as GeoJSON.BBox), //@ts-ignore
          migrations: config.migrations.map((it) => it.geojson),
        })
    ),
    grid: evaluatedGrid,
  };
};
