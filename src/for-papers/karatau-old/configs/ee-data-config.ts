import {
  DataExtractionConfig,
  ScriptConfig,
} from "../../../analytics_config_types";
import { karatauOldAllParams } from "./RF-configs-NEOPHRON";

import { karatauOldFalcoAllParams } from "./RF-configs-FALCO";
import { getDateIntervals } from "../../../utils/dates";
const ndviEviDates = {
  aprils_2005_2010: getDateIntervals([[2005, 2010]], [[3, 3]], [[1, "end"]]),
  marches_2005_2010: getDateIntervals([[2005, 2010]], [[4, 4]], [[1, "end"]]),
  junes_2005_2010: getDateIntervals([[2005, 2010]], [[5, 5]], [[1, "end"]]),
  julies_2005_2010: getDateIntervals([[2005, 2010]], [[6, 6]], [[1, "end"]]),
  augusts_2005_2010: getDateIntervals([[2005, 2010]], [[7, 7]], [[1, "end"]]),
  aprils_2017_2022: getDateIntervals([[2017, 2022]], [[3, 3]], [[1, "end"]]),
  marches_2017_2022: getDateIntervals([[2017, 2022]], [[4, 4]], [[1, "end"]]),
  junes_2017_2022: getDateIntervals([[2017, 2022]], [[5, 5]], [[1, "end"]]),
  julies_2017_2022: getDateIntervals([[2017, 2022]], [[6, 6]], [[1, "end"]]),
  augusts_2017_2022: getDateIntervals([[2017, 2022]], [[7, 7]], [[1, "end"]]),
};

export const karatau_old_data_export_config: DataExtractionConfig = {
  points: {
    type: "csv",
    path: "./src/for-papers/karatau-old/assets/FALCO/Балобан-точки присутствия.csv",
  },
  inOneFile: "falco-dataset.csv",
  outputs: "FINAL_RFS/KARATAU_OLD-FALCO/all_data",
  scripts: [
    ...karatauOldFalcoAllParams,
    // {
    //   key: "dynamic_world_means",
    //   scale: 100,
    //   buffer: 2000,
    //   dates: {
    //     dw_means_2017: getDateIntervals([[2017, 2017]], [[3, 7]], [[1, "end"]]),
    //     dw_means_2018: getDateIntervals([[2018, 2018]], [[3, 7]], [[1, "end"]]),
    //     dw_means_2019: getDateIntervals([[2019, 2019]], [[3, 7]], [[1, "end"]]),
    //     dw_means_2020: getDateIntervals([[2020, 2020]], [[3, 7]], [[1, "end"]]),
    //     dw_means_2021: getDateIntervals([[2021, 2021]], [[3, 7]], [[1, "end"]]),
    //     dw_means_2022: getDateIntervals([[2022, 2022]], [[3, 7]], [[1, "end"]]),
    //   },
    // },
    // { key: "evi", dates: ndviEviDates, scale: 100 },
    // { key: "ndvi", dates: ndviEviDates, scale: 100 },
    // ...Array(18)
    //   .fill(0)
    //   .map((it, index) => index + 2005)
    //   .flatMap((year: any) => {
    //     const dates = dateIntervalsToConfig(
    //       getDateIntervals([[year, year]], [[3, 7]], [[1, "end"]])
    //     );
    //     return [
    //       {
    //         key: "era5_monthly",
    //         filename: `${year}_era5_2000`,
    //         dates,
    //         scale: 100,
    //         bands: [
    //           "temperature_2m",
    //           "skin_temperature",
    //           "total_precipitation",
    //         ],
    //       } as ScriptConfig,
    //     ];
    //   }, {}),
  ],
};
