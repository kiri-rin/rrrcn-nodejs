import { getAreaMigrationsDensity } from "../get-area-migrations-density";
import { AreaMigrationDensityConfig } from "../types";
import { MigrationPath } from "../../../../controllers/migrations/types";
import { Feature, MultiPolygon, Polygon } from "@turf/helpers";
import testMigrationsJson from "./test-migrations.json";
import testAreaJson from "./test-area.json";
import { area } from "@turf/turf";
const testArea = testAreaJson as unknown as Feature<Polygon | MultiPolygon>;
const testMigrations = [testMigrationsJson] as unknown as MigrationPath[];
const testConfig: AreaMigrationDensityConfig = {
  area: testArea,
  migrations: testMigrations,
  birds_count: 1000,
};
describe("Calculate habitat area density from migration track", () => {
  test("", () => {
    const density = getAreaMigrationsDensity(testConfig);
    expect(density).toBeDefined();
    expect(density).toStrictEqual(Array(12).fill(expect.any(Number)));
    const maxDensity =
      testConfig.birds_count * ((1000 * 1000) / area(testConfig.area));

    density.forEach((monthDensity) =>
      expect(monthDensity).toBeLessThanOrEqual(maxDensity)
    );
    console.log(density);
  });
});
