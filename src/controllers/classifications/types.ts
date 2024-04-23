export enum ClassificationGeojsonTypes {
  MEAN,
  BEST,
  BUFFER,
  SPLIT,
  CLASSIFICATION,
}
export type ClassificationGeojsonCommon = {
  polygon: GeoJSON.Polygon;
  meta: {
    type: ClassificationGeojsonTypes;
  };
};
export interface ClassificationGeojsonMean extends ClassificationGeojsonCommon {
  meta: {
    type: ClassificationGeojsonTypes.MEAN;
  };
}
export interface ClassificationGeojsonBuffer
  extends ClassificationGeojsonCommon {}
export interface ClassificationGeojsonMeanSplit
  extends ClassificationGeojsonCommon {}
export type ClassificationGeojson =
  | ClassificationGeojsonMean
  | ClassificationGeojsonBuffer
  | ClassificationGeojsonMeanSplit;
export type ClassificationControllerResult = {
  classifier: any;
  classified_image: any;
  regionOfInterest: any;
  geojson_geometries: ClassificationGeojson[];
};
