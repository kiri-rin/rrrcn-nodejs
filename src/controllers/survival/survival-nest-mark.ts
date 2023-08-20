import {
  PopulationDistanceConfigType,
  SurvivalNestConfig,
} from "../../analytics_config_types";
import axios from "axios";
import fs, { writeFileSync } from "fs";
import { writeFile } from "fs/promises";
import FormData from "form-data";
const apiRService = axios.create({
  baseURL: process.env.R_BASE_URL || "http://localhost:8000",
});
export const estimateNestSurvivalDistance = async (
  config: SurvivalNestConfig
) => {
  const form = new FormData();
  form.append("data", fs.readFileSync(config.markFile).toString());
  try {
    const { data } = await apiRService.post("/distance", form, {
      params: {
        output: config.outputs,
      },
      headers: form.getHeaders(),
    });
    config.outputs &&
      (await writeFile(
        `${config.outputs}/result.json`,
        JSON.stringify(data, null, 4)
      ));
    return data;
  } catch (e) {
    console.log("ERROR IN DISTANCE");
    console.log(e);
    throw "Error in Distance service";
  }
};
