import { EEFeature, EEFeatureCollection } from "../../types";

export type GenerateRandpomPointsArgs = {
  count: number;
  area: EEFeature;
};
export const generateRandomPoints =
  ({}: GenerateRandpomPointsArgs): EEFeatureCollection => {};
