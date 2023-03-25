const DATASET_ID = "ECMWF/ERA5_LAND/HOURLY";
const years = Array(1)
  .fill(0)
  .map((it, index) => it + 2010);
const monthsRange = [2, 2];
module.exports = (regions) => {
  const collection = ee
    .ImageCollection("ECMWF/ERA5_LAND/HOURLY")
    .filterBounds(regions);
  for (let year of years) {
    for (
      let date = new Date(year, monthsRange[0], 1, 0, 0, 0, 0);
      date < new Date(year, monthsRange[1] + 1, 1, 0, 0, 0, 0);
      date && date.setDate(date.getDate() + 1)
    ) {
      const endDate = new Date(date);
      endDate.setDate(date.getDate() + 1);
      const min_temp = collection
        .filterDate(ee.Date(date), ee.Date(endDate))
        .select([""]);
      return min_temp
        .map((it) => it.reduceRegions(regions, ee.Reducer.first()))
        .flatten()
        .getInfo();
    }
  }
};
