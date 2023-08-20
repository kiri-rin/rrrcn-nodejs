import { GeoJSON, Point } from "geojson";
import { MigrationYear } from "web/src/features/migrations/types";
import {
  Directions,
  GetAreaMigrationProbabilitiesReturn,
} from "../../services/migrations/area-probabilities";
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
  selectedAreasIndices: number[];
  initAreasIndices: number[];
  initCount: number;
};
export type IdType = number;
export type IndexedArea = {
  id: IdType;
  neighboursAreasIds: { [p in Directions]?: IdType };
  probabilities: GetAreaMigrationProbabilitiesReturn;
  area: GeoJSON.BBox;
};
export type NextAreaToIndex = {
  id: IdType;
  points: {
    point: TrackPoint;
    from: Directions;
  }[];
};
export type GeneratedTrack = {
  id: number;
  points: TrackPoint[];
};
export type TrackPoint = {
  trackId: number;
  point?: GeoJSON.Point;
  id: number;
};
