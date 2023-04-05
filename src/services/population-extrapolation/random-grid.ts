//https://medium.com/google-earth/random-samples-with-buffering-6c8737384f8c

import { EEFeature, EEImage } from "../../types";

export const generateRandomGrid = ({
  region,
  cellSize,
  seed,
}: {
  region: EEFeature;
  cellSize: number;
  seed?: number;
}) => {
  const mask = ee.Image(1).clip(region);

  var proj = ee.Projection("EPSG:5070").atScale(cellSize);
  var cells = ee.Image.random(seed)
    .multiply(10000000)
    .int()
    .clip(region)
    .reproject(proj);
  var random = ee.Image.random(seed).multiply(10000000).int();

  var maximum = cells
    .addBands(random.multiply(mask))
    .reduceConnectedComponents(ee.Reducer.max());
  var points = random.mask(mask).eq(maximum).selfMask();
  return points.reduceToVectors({
    reducer: ee.Reducer.countEvery(),
    geometry: region,
    geometryType: "centroid",
    crs: proj.scale(1 / 16, 1 / 16),
    maxPixels: 1e20,
  });
};
