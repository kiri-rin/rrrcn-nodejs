import { GeoJSON, Point } from "geojson";
import {
  Directions,
  GetAreaMigrationProbabilitiesReturn,
} from "../../services/migrations/area-probabilities";
import {
  CommonConfig,
  RandomForestParamsConfig,
} from "../../analytics_config_types";
export enum SEASONS {
  SPRING = "spring",
  SUMMER = "summer",
  AUTUMN = "autumn",
  WINTER = "winter",
}

export type MigrationYear = {
  meta?: any;
  title?: string;

  [SEASONS.SUMMER]?: [number, number];
  [SEASONS.AUTUMN]?: [number, number];
  [SEASONS.WINTER]?: [number, number];
  [SEASONS.SPRING]?: [number, number];
};
export type MigrationPointProperties = {
  date: Date;
  altitude?: number;
  index?: number;
  description?: { value?: string };
};
export type MigrationPath = GeoJSON.FeatureCollection<
  Point,
  MigrationPointProperties
>;

export type IndexedMigration = {
  id: string;
  meta?: {};
  title: string;
  geojson: MigrationPath;
  years: { [year: string]: MigrationYear };
};
export type MigrationGenerationConfigType = {
  migrations: MigrationPath[];
  initCount: number;
} & CommonConfig;
export type IdType = number;
export type IndexedArea = {
  id: IdType;
  neighboursAreasIds: { [p in Directions]?: IdType };
  probabilities: GetAreaMigrationProbabilitiesReturn;
  area: GeoJSON.BBox;
  isDeadEnd?: boolean;
};
export type NextAreaToIndex = {
  id: IdType;
  points: {
    point: TrackPoint;
    from: Directions;
  }[];
};
export type GeneratedTrack = {
  id: IdType;
  points: GeoJSON.FeatureCollection<GeoJSON.Point | null, TrackPointProperties>;
};
export type TrackPointProperties = {
  trackId?: IdType;
  id?: IdType;
  areaId?: IdType;
  altitude?: number;
};
export type TrackPoint = GeoJSON.Feature<
  GeoJSON.Point | null,
  TrackPointProperties
>;
export type GenerateTracksResponse = {
  generatedTracks: GeneratedTrack[];
  indexedAreas: { [p: string]: IndexedArea };
  grid: GeoJSON.FeatureCollection<GeoJSON.Polygon, GeoJSON.GeoJsonProperties>;
};
