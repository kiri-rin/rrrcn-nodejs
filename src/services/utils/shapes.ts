const fs = require("fs/promises");
const util = require("util");
const shp = require("shpjs");

export async function importShapesToFeatureCollection(path: string) {
  const shapeBuffer = await fs.readFile(path);
  const geojson = await shp(shapeBuffer);
  return ee.FeatureCollection(geojson);
}

export async function importShapesPointsToFeatureCollection(path: string) {
  const shapeBuffer = await fs.readFile(path);
  const geojson = await shp(shapeBuffer);
  const featureCollection = ee.FeatureCollection(
    geojson.features.map((it: any) =>
      ee.Feature(ee.Geometry.Point(it.geometry.coordinates, null, false), {
        ...it.properties,
      })
    )
  );
  return featureCollection;
}
