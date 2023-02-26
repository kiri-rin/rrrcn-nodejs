import { Options as ParseOptions } from "csv-parse/sync";
import { scriptKey } from "./services/ee-data";
import {
  dateIntervalsToConfig,
  DatesConfig,
  getDateIntervals,
} from "./services/utils/dates";

export type CommonConfig = {
  outputs?: string;
};
export type CsvImportConfig<FileType = string> = {
  type: "csv";
  path: FileType;
  latitude_key?: string;
  longitude_key?: string;
  id_key?: string;
  csvParseConfig?: ParseOptions;
};
export type CommonScriptParams = {
  buffer?: number;
  dates?: DatesConfig;
  outputs?: string;
  mode?: "MEAN" | "SUM";
  scale?: number;
};
export type ShpImportConfig<FileType = string> = {
  type: "shp";
  path: FileType;
};
export type AssetImportConfig = { type: "asset"; path: string };
export type GeojsonImportConfig = {
  type: "geojson";
  json: GeoJSON.FeatureCollection;
};
export type GeojsonFileImportConfig<FileType = string> = {
  type: "geojson_file";
  path: FileType;
};
export type ComputedObjectImportConfig = {
  type: "computedObject";
  object: any;
};
export type GeometriesImportConfig<FileType = string> =
  | { type: "asset" | "shp" | "csv" | "computedObject" } & (
      | CsvImportConfig<FileType>
      | ShpImportConfig<FileType>
      | GeojsonFileImportConfig<FileType>
      | GeojsonImportConfig
      | AssetImportConfig
      | ComputedObjectImportConfig
    );
export type ImageImportConfig = AssetImportConfig | ComputedObjectImportConfig;
export type ScriptConfig = {
  key: scriptKey;
  filename?: string;
  bands?: string[];
} & CommonScriptParams;
export type DataExtractionConfig<FileType = string> = {
  points: GeometriesImportConfig<FileType>;
  inOneFile?: string;
  defaultScriptParams?: CommonScriptParams;
  scripts: (ScriptConfig | scriptKey)[];
} & CommonConfig;
export type RandomForestParamsConfig =
  | AssetImportConfig
  | ComputedObjectImportConfig
  | {
      type: "scripts";
      defaultScriptParams?: CommonScriptParams;
      scripts: (ScriptConfig | scriptKey)[];
    };
export type RandomForestConfig = {
  params: RandomForestParamsConfig;
  crossValidation?: number;
  regionOfInterest: GeometriesImportConfig;
  validation:
    | { type: "split"; split: number; seed?: number }
    | { type: "external"; points: RandomForestConfig["trainingPoints"] };
  trainingPoints:
    | {
        type: "all-points";
        allPoints: {
          points: GeometriesImportConfig;
          presenceProperty?: string;
        };
      }
    | {
        type: "separate-points";
        absencePoints: GeometriesImportConfig;
        presencePoints: GeometriesImportConfig;
      };
  classificationSplits?: number[];
  buffersPerAreaPoint?: number[];
  outputMode: "CLASSIFICATION" | "REGRESSION" | "PROBABILITY";
} & CommonConfig;

export type ValidateClassifiedImageConfig = {
  classified_image: AssetImportConfig | ComputedObjectImportConfig;
  validationPoints: RandomForestConfig["trainingPoints"];
} & CommonConfig;

export type populationEstimationType = {
  latitude_key?: string;
  longitude_key?: string;
  id_key?: string;
  outputs: string;
  seed?: number;
  areasSHPZIPPath: string;
  regionOfInterestCsvPath: string;
  classified_image_id: string;
} & (
  | { pointsCsvPath: string; pointsSHPZIPPath?: undefined }
  | { pointsCsvPath?: undefined; pointsSHPZIPPath: string }
);

export type populationEstimationType2 = {
  outputs: string;
  seed?: number;
  points: GeometriesImportConfig;
  areas: GeometriesImportConfig;
  regionOfInterest: GeometriesImportConfig;
  classified_image: ImageImportConfig;
};
