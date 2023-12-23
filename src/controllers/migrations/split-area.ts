import { evaluatePromisify } from "../../utils/ee-image";
import { EEFeature } from "../../types";
import { getAreaMigrationProbabilities } from "../../services/migrations/area-probabilities";

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
  const evaluatedIntersections = (
    await evaluatePromisify(intersections)
  ).features.map((it: any) => it.properties.size);
  const evaluatedGrid = await evaluatePromisify(
    coveringGrid.map((it: any) => it.bounds())
  );
  console.log(evaluatedGrid.features[0]);
  return {
    intersections: evaluatedIntersections,
    probabilities: evaluatedIntersections.map(
      //@ts-ignore
      (it, index) =>
        it &&
        getAreaMigrationProbabilities({
          area: [
            evaluatedGrid.features[index].geometry.coordinates[0][0][0],
            evaluatedGrid.features[index].geometry.coordinates[0][0][1],
            evaluatedGrid.features[index].geometry.coordinates[0][2][0],
            evaluatedGrid.features[index].geometry.coordinates[0][2][1],
          ] as GeoJSON.BBox, //@ts-ignore
          migrations: config.migrations.map((it) => it.geojson),
        })
    ),
    grid: evaluatedGrid,
  };
};
