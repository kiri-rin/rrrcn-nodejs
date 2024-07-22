import { DataExtractionConfig } from "@rrrcn/common/src/types/services/analytics_config_types";
import { getDateIntervals } from "@rrrcn/common/src/utils/dates";

export const imperialDataConfig: DataExtractionConfig = {
  points: {
    type: "csv",
    id_key: "id",
    latitude_key: "latitude",
    longitude_key: "longitude",
    path: "./src/for-papers/karatau-old/assets/IMPERIAL/могильник мойыкум без дублей.csv",
  },
  scripts: [
    {
      key: "landsat",
      dates: {
        median: getDateIntervals([[2018, 2021]], [[4, 7]]),
      },
    },
    {
      key: "alos",
      dates: {
        median: [[new Date(2018, 0, 1), new Date(2022, 0, 1)]],
      },
    },
    { key: "elevation" },
    { key: "geomorph" },
    { key: "world_cover" },
    {
      key: "world_cover_convolve",
      filename: "wc_convolve_100",
      scale: 10,
      buffer: 100,
    },

    {
      key: "world_cover_convolve",
      filename: "wc_convolve_300",
      scale: 10,
      buffer: 300,
    },
    {
      key: "world_cover_convolve",
      filename: "wc_convolve_600",
      scale: 10,
      buffer: 600,
    },
  ],
  outputs: "FINAL_RFS/KARATAU_OLD-IMPERIAL/presence-data-fixed2",
};
export const imperialRandomDataConfig: DataExtractionConfig = {
  points: {
    type: "csv",
    id_key: "id",
    latitude_key: "latitude",
    longitude_key: "longitude",
    path: "./src/for-papers/karatau-old/assets/IMPERIAL/Случайные.csv",
  },
  scripts: imperialDataConfig.scripts,
  outputs: "FINAL_RFS/KARATAU_OLD-IMPERIAL/random-data-fixed2",
};
