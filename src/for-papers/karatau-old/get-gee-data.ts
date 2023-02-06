import { withGEE } from "../../index";
import { extractData } from "../../controllers/extract-data/extract-data";
import { karatau_old_data_export_config } from "./configs/ee-data-config";

withGEE(async () => {
  await extractData(karatau_old_data_export_config);
});
