import { evaluatePromisify } from "../../utils/ee-image";
import { EEFeature } from "../../types";

export type SplitMigrationAreaConfigType = {
  migrations: { geojson: GeoJSON.FeatureCollection<GeoJSON.Point> }[];
};
export const SplitMigrationsArea = async (
  config: SplitMigrationAreaConfigType
) => {
  const featureCollections = ee.FeatureCollection(
    config.migrations.map(({ geojson }) =>
      ee.Feature(ee.FeatureCollection(geojson).geometry())
    )
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
  return {
    intersections: (await evaluatePromisify(intersections)).features.map(
      (it: any) => it.properties.size
    ),
    grid: await evaluatePromisify(coveringGrid.map((it: any) => it.bounds())),
  };
};
