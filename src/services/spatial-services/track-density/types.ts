import { Feature, MultiPolygon, Polygon } from "@turf/turf";
import { MigrationPath } from "../../../controllers/migrations/types";

export type AreaMigrationDensityConfig = {
  area: Feature<Polygon | MultiPolygon>;
  migrations: MigrationPath[];
  birds_count: number;
};
export type AreaMigrationDensityResult = [
  number,
  number,
  number,
  number,
  number,
  number,
  number,
  number,
  number,
  number,
  number,
  number
];
