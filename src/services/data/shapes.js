const fs = require("fs/promises");
const util = require("util");
const shp = require("shpjs");
module.exports = {
  async importShapesToFeatureCollection(path) {
    const shapeBuffer = await fs.readFile(path);
    const geojson = await shp(shapeBuffer);
    const featureCollection = ee.FeatureCollection(geojson);
    return featureCollection;
  },
};
