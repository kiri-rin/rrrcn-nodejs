//https://medium.com/google-earth/random-samples-with-buffering-6c8737384f8c

import { EEFeature, EEImage } from "../../types";

export const generateRandomGrid = ({
  regionOfInterest,
  cellSize,
  mask,
  seed,
}: {
  regionOfInterest: EEFeature;
  cellSize: number;
  mask: EEImage;
  seed?: number;
}) => {
  var region = mask
    .reduceToVectors({
      geometry: regionOfInterest,
    })
    .geometry();
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
