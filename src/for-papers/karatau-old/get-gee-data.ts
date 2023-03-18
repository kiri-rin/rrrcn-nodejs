import { withGEE } from "../../index";
import { extractData } from "../../controllers/extract-data/extract-data";
import { karatau_old_data_export_config } from "./configs/ee-data-config";
import {
  imperialDataConfig,
  imperialRandomDataConfig,
} from "./configs/ee-data-imperial";

withGEE(async () => {
  // await extractData(karatau_old_data_export_config);
  await extractData(imperialDataConfig);
  await extractData(imperialRandomDataConfig);
});
