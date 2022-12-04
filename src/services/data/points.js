const ee = require("@google/earthengine");
const { stringify } = require("csv-stringify/sync");
module.exports = {
  importPointsFromCsv({ csv, lat_key, long_key, id_key }) {
    return ee.FeatureCollection(
      csv.map((row) =>
        ee.Feature(
          ee.Geometry.Point([Number(row[long_key]), Number(row[lat_key])]),
          { id: row[id_key], longitude: row[long_key], latitude: row[lat_key] }
        )
      )
    );
  },
  exportFeatureCollectionsToCsv(collection) {
    const points = {};
    let keys = new Set(["id", "longitude", "latitude"]);
    for (let feature of collection) {
      points[feature.properties.id] = {
        ...points[feature.properties.id],
        ...feature.properties,
      };
      Object.keys(points[feature.properties.id]).forEach(
        (key) => !keys.has(key) && keys.add(key)
      );
    }
    keys = [...keys];
    const array = Object.values(points).map((it, index) =>
      keys.map((key) => it[key])
    );
    array.unshift(keys);
    return stringify(array);
  },
};
