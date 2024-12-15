import {
  PopulationDensityType,
  PopulationDistanceConfigType,
} from "../../analytics_config_types";
import axios from "axios";
import fs, { writeFileSync } from "fs";
import { mkdir, readFile, writeFile } from "fs/promises";
import FormData from "form-data";
import { parse } from "csv-parse/sync";
import shp from "shpjs";
import { JSCSVTable } from "../../utils/points";
import {stringify} from "csv-stringify/lib/sync";
const apiRService = axios.create({
  baseURL: process.env.R_BASE_URL || "http://localhost:8000",
});
export const estimatePopulationDensity = async (
  config: PopulationDensityType
) => {
  console.log("DENSITY");
  const densityInfo = await parseDensityFile(config.densityFile);
  console.log(densityInfo);
  const { totalPlotsArea, totalNumber } = densityInfo.reduce(
    (acc, it) => {
      acc.totalPlotsArea += Number(it.Area);
      acc.totalNumber += Number(it.Number);
      return acc;
    },
    { totalPlotsArea: 0, totalNumber: 0 }
  );
  const averageDensity = totalNumber / totalPlotsArea;
  const averageDensityError = calculateError({
    density: averageDensity,
    densityInfo,
    totalArea: totalPlotsArea,
  });
  const minDensity = averageDensity / (1 + 1.64 * averageDensityError);
  const maxDensity = averageDensity * (1 + 1.64 * averageDensityError);
  const res = {
    n:totalNumber,
    AreaOfHabitats:config.totalArea,
    minDensity,
    maxDensity,
    averageDensity,
    averageDensityError,
    averageNumber: averageDensity * config.totalArea,
    minNumber: minDensity * config.totalArea,
    maxNumber: maxDensity * config.totalArea,
  };
  await mkdir(config.outputs || "", { recursive: true });
  await writeFile(
    `${config.outputs || ""}/density.json`,
    JSON.stringify(res, null, 4)
  );
  await writeFile(
    `${config.outputs || ""}/density.csv`,
    getCsv(res)
  );
  console.log({ res });
  return res;
};
const parseDensityFile = async (csvPath: string) => {
  const file = await readFile(csvPath);
  const parsed: JSCSVTable = parse(file, { delimiter: ",", columns: true });
  return parsed.filter((it) => it["Plot"]);
};
const calculateError = ({
  density,
  densityInfo,
  totalArea,
}: {
  density: number;
  densityInfo: JSCSVTable;
  totalArea: number;
}) => {
  const X = densityInfo.reduce((acc, it) => {
    return (
      acc +
      Math.pow((Number(it.Density) - density) * Number(it.Area), 2) /
        (totalArea - Number(it.Area))
    );
  }, 0);
  return (1 / density) * Math.sqrt((1 / totalArea) * X);
};
export const getCsv=(res:{
  n:number,
  minDensity:number,
  maxDensity:number,
  averageDensity:number,
  averageDensityError:number,
  averageNumber:number,
  minNumber:number,
  maxNumber:number,
  AreaOfHabitats:number,
})=>{
const keys=[
  "minDensity",
  "maxDensity",
  "averageDensity",
  "averageDensityError (SE)",
  "averageNumber (estimation)",
  "minNumber",
  "maxNumber",
  "n",
  "Area of habitats",
]
const values=[
  res.minDensity,
  res.maxDensity,
  res.averageDensity,
  res.averageDensityError,
  res.averageNumber,
  res.minNumber,
  res.maxNumber,
  res.n,
  res.AreaOfHabitats,
]
  return stringify([keys,values])
}
