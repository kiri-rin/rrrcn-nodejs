import { GeoJSON, Point } from "geojson";
import { MigrationYear } from "web/src/features/migrations/types";
export type IndexedMigration = {
  meta?: {};
  title: string;
  geojson: MigrationPath;
  years: { [year: string]: MigrationYear };
};
export type MigrationPath = GeoJSON.FeatureCollection<Point, { date: Date }>;
export type MigrationGenerationConfigType = {
  migrations: MigrationPath[];
  allAreas: GeoJSON.FeatureCollection<GeoJSON.Polygon>;
  selectedAreas: number[];
  initArea: GeoJSON.Polygon;
};
