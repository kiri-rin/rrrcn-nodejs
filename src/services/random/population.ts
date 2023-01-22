import { EEFeatureCollection, EEImage } from "../../types";
import { createRandomPointsWithDistance } from "./randomPoints";
import { evaluatePromisify } from "../utils/ee-image";
import { writeFileSync } from "fs";

export const estimatePopulation = async ({
  image,
  minDistance,
  maxDistance,
  meanDistance,
  regionOfInterest,
  presencePoints,
  seed = 15,
}: {
  image: EEImage;
  regionOfInterest: any;
  minDistance: number;
  meanDistance: number;
  maxDistance: number;
  presencePoints: EEFeatureCollection;
  seed?: number;
}) => {
  const max = await getBestDistance(
    minDistance,
    meanDistance,
    image,
    regionOfInterest,
    presencePoints.map((it: any) => it.buffer(minDistance / 2))
  );
  writeFileSync("restest_max.json", JSON.stringify(max, null, 4));

  const min = await getBestDistance(
    meanDistance,
    maxDistance,
    image,
    regionOfInterest,
    presencePoints.map((it: any) => it.buffer(minDistance / 2))
  );
  console.log("FINISHED");
  writeFileSync("restest_min.json", JSON.stringify(min, null, 4));
};
const getBestDistance = async (
  leftDist: number,
  rightDist: number,
  image: EEImage,
  regionOfInterest: any,
  points: EEFeatureCollection
) => {
  const minStep = (rightDist - leftDist) / 100;
  let best = ee.Number(0);
  let bestDistance = ee.Number(0);
  const results = ee.Array([]);
  const allRes = [];

  for (let dist = rightDist; dist >= leftDist; dist = dist - minStep) {
    const randomPoints = createRandomPointsWithDistance({
      image,
      regionOfInterest,
      distance: dist,
    });
    const count = randomPoints.filterBounds(points).size();
    console.log({ dist });
    allRes.push(
      evaluatePromisify(
        ee.Feature(null, { valid: count, size: randomPoints.size() })
      ).then((res) => {
        console.log("CURRENT COUNT", res, dist);
        //@ts-ignore
        return { ...res.properties, dist };
      })
    );
    // evaluatePromisify(
    //   ee.Feature(null, { valid: count, size: randomPoints.size() })
    // ).then((res) => console.log("CURRENT COUNT", res, dist));

    best = ee.Algorithms.If(count.gt(best), count, best);
    bestDistance = ee.Algorithms.If(count.gt(best), dist, bestDistance);
    results.add(count);
  }
  const all = await Promise.all(allRes);

  return all;
};
