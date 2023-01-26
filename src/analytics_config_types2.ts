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
type CsvImportConfig = {
  type: "csv";
  path: string;
  latitude_key?: string;
  longitude_key?: string;
  id_key?: string;
  csvParseConfig?: ParseOptions;
};
type CommonScriptParams = {
  buffer?: number;
  dates?: DatesConfig;
  outputs?: string;
  mode?: "MEAN" | "SUM";
  scale?: number;
};
type ShpImportConfig = { type: "shp"; path: string };
type AssetImportConfig = { type: "asset"; path: string };
export type GeometriesImportConfig =
  | { type: "asset" | "shp" | "csv" } & (
      | CsvImportConfig
      | ShpImportConfig
      | AssetImportConfig
    );

export type ScriptConfig = {
  key: scriptKey;
  filename?: string;
  bands?: string[];
} & CommonScriptParams;
export type DataExtractionConfig = {
  points: GeometriesImportConfig;
  defaultScriptParams?: CommonScriptParams;
  scripts: (ScriptConfig | string)[];
} & CommonConfig;
export type RandomForestParamsConfig =
  | { type: "asset"; path: string }
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
  classified_image: string;
  validationPoints: RandomForestConfig["trainingPoints"];
} & CommonConfig;
//@ts-ignore
const rfConf: RandomForestConfig = {
  trainingPoints: {
    type: "all-points",
    allPoints: { points: { type: "csv", path: "" } },
  },
  validation: {
    type: "split",
    split: 0.2,
    seed: 1,
  },
  regionOfInterest: { type: "csv", path: "" },
  outputMode: "REGRESSION",
};
