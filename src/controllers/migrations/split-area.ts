import { evaluatePromisify } from "../../utils/ee-image";

export type SplitMigrationAreaConfigType = {
  migrations: { geojson: GeoJSON.FeatureCollection<GeoJSON.Point> }[];
};
export const SplitMigrationsArea = async (
  config: SplitMigrationAreaConfigType
) => {
  const featureCollections = config.migrations.map(({ geojson }) =>
    ee.FeatureCollection(geojson)
  );
  const allFeaturesCollection = ee.FeatureCollection(
    config.migrations.reduce(
      (acc, { geojson }) => {
        if (!acc.geojson) {
          acc.geojson = geojson;
        } else {
          acc.geojson.features.push(...geojson.features);
        }
        return acc;
      },
      { geojson: null as GeoJSON.FeatureCollection | null }
    )
  );
  const convexHull = allFeaturesCollection.geometry().convexHull();
  const coveringGrid = convexHull.coveringGrid(
    ee.Projection("EPSG:4326"),
    100000
  );
  return evaluatePromisify(coveringGrid);
};
