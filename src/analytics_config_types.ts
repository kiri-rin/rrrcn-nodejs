import { Options as ParseOptions } from "csv-parse/sync";
import { scriptKey } from "./services/ee-data";
import {
  dateIntervalsToConfig,
  DatesConfig,
  getDateIntervals,
} from "./utils/dates";

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
  | {
      type:
        | "asset"
        | "shp"
        | "csv"
        | "computedObject"
        | "geojson"
        | "geojson_file";
    } & (
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
export type SeparateTrainingPoints<FileType = string> = {
  type: "separate-points";
  absencePoints?: GeometriesImportConfig<FileType>;
  presencePoints: GeometriesImportConfig<FileType>;
};
export type AllTrainingPoints<FileType = string> = {
  type: "all-points";
  allPoints: {
    points: GeometriesImportConfig<FileType>;
    presenceProperty?: string;
  };
};
export type RandomForestConfig<FileType = string> = {
  params: RandomForestParamsConfig;
  crossValidation?: number;
  regionOfInterest: GeometriesImportConfig<FileType>;
  validation:
    | {
        type: "split";
        split: number;
        seed?: number;
        cross_validation?: boolean;
        render_mean?: boolean;
        render_best?: boolean;
        return_default?: "best" | "mean";
      }
    | { type: "external"; points: RandomForestConfig["trainingPoints"] };
  trainingPoints:
    | AllTrainingPoints<FileType>
    | Required<SeparateTrainingPoints<FileType>>;
  classificationSplits?: number[];
  buffersPerAreaPoint?: number[];
  outputMode: "CLASSIFICATION" | "REGRESSION" | "PROBABILITY";
} & CommonConfig;

export type MaxentConfig<FileType = string> = {
  params: RandomForestParamsConfig;
  crossValidation?: number;
  backgroundCount?: number;
  regionOfInterest: GeometriesImportConfig<FileType>;
  validation:
    | {
        type: "split";
        split: number;
        seed?: number;
        cross_validation?: boolean;
        render_mean?: boolean;
        render_best?: boolean;
        return_default?: "best" | "mean";
      }
    | { type: "external"; points: RandomForestConfig["trainingPoints"] };
  trainingPoints:
    | AllTrainingPoints<FileType>
    | SeparateTrainingPoints<FileType>;
  classificationSplits?: number[];
  buffersPerAreaPoint?: number[];
  outputMode: "CLAMP" | "PROBABILITY";
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
export type ImageOrGeometryAsset = {
  type: "asset";
  image?: boolean;
  path: string;
};
export type PopulationRandomGenerationConfigType<FileType = string> = {
  areas: GeometriesImportConfig<FileType>;
  regionOfInterest: GeometriesImportConfig<FileType>;
  points: GeometriesImportConfig<FileType>;
  seed?: number;
  outputs: string;
  presenceArea: GeometriesImportConfig<FileType>;
};
export type PopulationDistanceConfigType<FileType = string> = {
  distanceFile: FileType;
  densityFunction: "hn" | "hr";
  outputs?: string;
};
export type SurvivalNestConfig<FileType = string> = {
  survivalFile: FileType;
  outputs?: string;
};
export type PopulationDensityType<FileType = string> = {
  densityFile: FileType;
  totalArea: number;
  outputs?: string;
};
export type PopulationConfig<FileType = string> = (
  | {
      type: "random-points";
      config: PopulationRandomGenerationConfigType<FileType>;
    }
  | {
      type: "distance";
      config: PopulationDistanceConfigType<FileType>;
    }
  | {
      type: "density";
      config: PopulationDensityType<FileType>;
    }
) & { outputs?: string };

export type populationEstimationType2 = {
  outputs: string;
  seed?: number;
  points: GeometriesImportConfig;
  areas: GeometriesImportConfig;
  regionOfInterest: GeometriesImportConfig;
  classified_image: ImageImportConfig;
};
