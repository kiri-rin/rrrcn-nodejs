import { getDateIntervals } from "../../../services/utils/dates";
import { DataExtractionConfig } from "../../../analytics_config_types";

export const commonImportantRFParamsCollinearFiltered: DataExtractionConfig["scripts"] =
  [
    {
      key: "geomorph",
      bands: ["cti", "slope", "aspect", "vrm", "spi", "geom"],
    },
    {
      key: "global_habitat",
      bands: ["cov", "corr", "entropy", "pielou"],
    },
    {
      key: "global_wind_atlas",
      bands: ["power_density_50"],
    },
    {
      key: "world_clim_bio",
      bands: ["bio02", "bio03", "bio04", "bio07", "bio08", "bio11"],
    },

    {
      key: "ndvi",
      scale: 100,
      dates: {
        april_2022: getDateIntervals([[2022, 2022]], [[3, 3]], [[1, "end"]]),
      },
    },

    {
      key: "world_cover_convolve",
      scale: 10,
      bands: [
        "Tree_cover",
        "Shrubland",
        "Grassland",
        "Cropland",
        "Bare_sparse_vegetation",
      ],
    },
  ];

export const commonImportantRFParamsForAll: DataExtractionConfig["scripts"] = [
  { key: "elevation" },
  {
    key: "geomorph",
    bands: ["cti", "tri", "slope", "aspect", "vrm", "roughness", "geom"],
  },
  {
    key: "global_habitat",
    bands: ["entropy", "pielou", "shannon", "simpson"],
  },
  {
    key: "global_wind_atlas",
    bands: ["power_density_50"],
  },
  {
    key: "world_clim_bio",
    bands: ["bio02", "bio04", "bio07", "bio13", "bio16", "bio19"],
  },
];
