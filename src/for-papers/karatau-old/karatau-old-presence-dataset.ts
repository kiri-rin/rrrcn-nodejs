import { withGEE } from "../../index";
import { extractData } from "../../controllers/extract-data/extract-data";
import { karatauOldAllParams } from "./configs/RF-configs-NEOPHRON";

withGEE(async () => {
  await extractData({
    outputs: "FINAL_RFS/KARATAU-OLD/datasets",
    scripts: karatauOldAllParams,
    inOneFile: "presence",
    points: {
      type: "csv",
      path: "./src/for-papers/karatau-old/assets/presence.csv",
    },
  });
});
