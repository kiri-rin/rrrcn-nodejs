import { getCsv } from "./services/utils/points";
import { ROCTOCSV } from "./services/random-forest/all-validations";
import { readFileSync, writeFileSync } from "fs";

getCsv(
  ROCTOCSV(
    JSON.parse(
      String(
        readFileSync(".local/outputs/FINAL_RFS/KARATAU-OLD/BEST/REGR/ROC.json")
      )
    )
  )
).then((csv) => {
  writeFileSync(".local/outputs/FINAL_RFS/KARATAU-OLD/BEST/REGR/ROC.csv", csv);
});
