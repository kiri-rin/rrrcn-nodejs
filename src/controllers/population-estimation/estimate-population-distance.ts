import { PopulationDistanceConfigType } from "../../analytics_config_types";
import axios from "axios";
import fs, { writeFileSync } from "fs";
import { writeFile } from "fs/promises";
import FormData from "form-data";
const apiRService = axios.create({ baseURL: "http://localhost:8000" }); //TODO add env
export const estimatePopulationDistance = async (
  config: PopulationDistanceConfigType
) => {
  const form = new FormData();
  form.append("data", fs.readFileSync(config.distanceFile).toString());
  try {
    const { data } = await apiRService.post("/distance", form, {
      params: { totalArea: config.totalArea },
      headers: form.getHeaders(),
    });
    config.outputs &&
      (await writeFile(`${config.outputs}/result.json`, JSON.stringify(data)));
    return data;
  } catch (e) {
    console.log("ERROR IN DISTANCE");
    console.log(e);
    throw "Error in Distance service";
  }
};
