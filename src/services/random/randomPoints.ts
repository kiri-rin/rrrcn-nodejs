//https://medium.com/google-earth/random-samples-with-buffering-6c8737384f8c
import { EEFeature, EEImage } from "../../types";

export const createRandomPointsWithDistance = ({
  image,
  distance,
  regionOfInterest,
  seed = 1,
}: {
  image: EEImage;
  regionOfInterest: any;
  distance: number;
  seed?: number;
}) => {
  var cellSize = distance;
  var region = image
    .reduceToVectors({
      geometry: regionOfInterest,
      scale: 500,
    })
    .geometry();
  // Get the contiguous United States as a region.

  // Generate a random image of integers in Albers projection at the specified cell size.
  var proj = ee.Projection("EPSG:5070").atScale(cellSize);
  var cells = ee.Image.random(seed)
    .multiply(10000000)
    .int()
    .clip(region)
    .reproject(proj);
  //Map.addLayer(cells.randomVisualizer())
  var mask = ee.Image.pixelCoordinates(proj).expression(
    "!((b('x') + 0.5) % 2 != 0 || (b('y') + 0.5) % 2 != 0)"
  );
  var strictCells = cells.updateMask(mask).reproject(proj);

  var random = ee.Image.random(seed).multiply(10000000).int();
  var maximum = cells
    .addBands(random)
    .reduceConnectedComponents(ee.Reducer.max());

  // Find all the points that are local maximums.
  var points = random.eq(maximum).selfMask().clip(region);

  //Map.addLayer(points.reproject(proj.scale(1/4, 1/4)), {palette: ["white"]})

  var strictMax = strictCells
    .addBands(random)
    .reduceConnectedComponents(ee.Reducer.max());
  var strictPoints = random.eq(strictMax).selfMask().clip(region);
  return strictPoints.reduceToVectors({
    reducer: ee.Reducer.countEvery(),
    geometry: region,
    geometryType: "centroid",
    crs: proj.scale(1 / 16, 1 / 16),
    maxPixels: 1e20,
  });
};
