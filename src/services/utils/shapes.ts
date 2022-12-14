const fs = require("fs/promises");
const util = require("util");
const shp = require("shpjs");

export async function importShapesToFeatureCollection(path: string) {
  const shapeBuffer = await fs.readFile(path);
  const geojson = await shp(shapeBuffer);
  const featureCollection = ee.FeatureCollection(
    geojson.features.map((it: any) =>
      ee.Feature(ee.Geometry.Polygon(it.geometry.coordinates, null, false), {
        ...it.properties,
        id: it.properties.NAME,
      })
    )
  );
  return featureCollection;
}
