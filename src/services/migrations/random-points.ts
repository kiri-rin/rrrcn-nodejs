import { EEFeature, EEFeatureCollection } from "../../types";
import { evaluatePromisify } from "../../utils/ee-image";

export type GenerateRandpomPointsArgs = {
  count: number;
  area: EEFeature;
};
export const generateRandomPoints = async ({
  count,
  area,
}: GenerateRandpomPointsArgs): Promise<
  GeoJSON.FeatureCollection<GeoJSON.Point>
> => {
  return await evaluatePromisify(
    ee.FeatureCollection.randomPoints(area, count)
  );
};
