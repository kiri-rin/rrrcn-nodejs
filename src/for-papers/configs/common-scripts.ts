import {
  analyticsConfigType,
  ScriptConfig,
} from "../../analytics_config_types";
import {
  dateIntervalsToConfig,
  getDateIntervals,
} from "../../services/utils/dates";

export const commonScripts: ScriptConfig[] = [
  { key: "elevation" },
  {
    key: "geomorph",
  },
  {
    key: "global_wind_atlas",
  },
  {
    key: "global_habitat",
  },
  {
    key: "world_clim_bio",
  },

  {
    key: "ndvi",
    scale: 100,
    dates: {
      april_2022: getDateIntervals([[2022, 2022]], [[3, 3]], [[1, "end"]]),
      may_2022: getDateIntervals([[2022, 2022]], [[4, 4]], [[1, "end"]]),
      june_2022: getDateIntervals([[2022, 2022]], [[5, 5]], [[1, "end"]]),
      july_2022: getDateIntervals([[2022, 2022]], [[6, 6]], [[1, "end"]]),
      august_2022: getDateIntervals([[2022, 2022]], [[7, 7]], [[1, "end"]]),
    },
  },

  { key: "world_cover", scale: 10 },
  {
    key: "world_cover_convolve",
    scale: 10,
  },
];
