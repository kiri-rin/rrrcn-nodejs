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
    id?: number | string;
    type: ClassificationGeojsonTypes;
  };
};
export interface ClassificationGeojsonMean extends ClassificationGeojsonCommon {
  meta: {
    id: number;
    type: ClassificationGeojsonTypes.MEAN;
    origId: number;
  };
}
export interface ClassificationGeojsonSplit
  extends ClassificationGeojsonCommon {
  meta: {
    id: number;
    type: ClassificationGeojsonTypes.SPLIT;
    split: number;
  };
}
export interface ClassificationGeojsonBuffer
  extends ClassificationGeojsonCommon {
  meta: {
    id: number;
    type: ClassificationGeojsonTypes.BUFFER;
    buffer: number;
    origId: number;
  };
}
export interface ClassificationGeojsonClassification
  extends ClassificationGeojsonCommon {
  meta: {
    id: number;
    type: ClassificationGeojsonTypes.CLASSIFICATION;
    seed?: number;
  };
}
export interface ClassificationGeojsonMeanSplit
  extends ClassificationGeojsonCommon {}
export type ClassificationGeojson =
  | ClassificationGeojsonMean
  | ClassificationGeojsonBuffer
  | ClassificationGeojsonMeanSplit;
export type ClassificationControllerResult = {
  classifier?: any;
  classified_image: any;
  regionOfInterest: any;
  geojson_geometries: ClassificationGeojson[];
};
