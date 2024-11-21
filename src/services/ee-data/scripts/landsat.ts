import { EEFeatureCollection, EEImage } from "../../../types";
import { AnalyticsScriptParams, AnalyticsScriptResult } from "../index";
import { mergeDateIntervalsFilters } from "../../../utils/ee-image-collection";

export const landsatScript = ({
  regions,
  datesConfig = {},
  bands,
}: AnalyticsScriptParams) => {
  // return {
  //   median: bands
  //     ? ee.Image("users/kirillknizhov/my-landsat").select(bands)
  //     : ee.Image("users/kirillknizhov/my-landsat"),
  // };
  const collection = ee
    .ImageCollection("LANDSAT/LC08/C02/T1_L2")
    .filterBounds(regions);
  const res: AnalyticsScriptResult = {};
  Object.entries(datesConfig).forEach(([key, intervals], index) => {
    const period_available = mergeDateIntervalsFilters(collection, intervals);
    const l8sr8nocld = period_available.map(maskL8sr(regions, bands));

    const l8srcompmedian = l8sr8nocld.median();
    res[`l8sr_${key}`] = l8srcompmedian.rename(
      l8srcompmedian
        .bandNames()
        .map((name: any) => ee.String(name).cat(`_${key}`))
    );
  });

  return res;
};

const maskL8sr = (regions: any, bands?: string[]) => (image: EEImage) => {
  // Bit 0 - Fill
  // Bit 1 - Dilated Cloud
  // Bit 2 - Cirrus
  // Bit 3 - Cloud
  // Bit 4 - Cloud Shadow
  var qaMask = image.select("QA_PIXEL").bitwiseAnd(parseInt("11111", 2)).eq(0);
  var saturationMask = image.select("QA_RADSAT").eq(0);

  // Apply the scaling factors to the appropriate bands.
  var opticalBands = image.select("SR_B.").multiply(0.0000275).add(-0.2);
  var thermalBands = image.select("ST_B.*").multiply(0.00341802).add(149.0);

  // Replace the original bands with the scaled ones and apply the masks.
  const res = image
    .addBands(opticalBands, null, true)
    .addBands(thermalBands, null, true)
    .updateMask(qaMask)
    .updateMask(saturationMask);
  const lsBands =
    bands?.filter((it) => Object.values(landsatBands).includes(it)) ||
    originalLandsatBands.map((it) => landsatBands[it]);
  var imgNewBands = res
    .select(["SR_B2", "SR_B3", "SR_B4", "SR_B5", "SR_B6"])
    .rename(["blue", "green", "red", "nir", "swir1"]);
  if (!bands || bands?.includes("ndvi")) {
    var ndvi = imgNewBands.normalizedDifference(["nir", "red"]).rename("ndvi");
    return imgNewBands.select(lsBands).addBands(ndvi).clip(regions);
  } else {
    return imgNewBands.select(lsBands).clip(regions);
  }
};
const originalLandsatBands = ["SR_B2", "SR_B3", "SR_B4", "SR_B5", "SR_B6"];

const landsatBands = {
  SR_B2: "blue",
  SR_B3: "green",
  SR_B4: "red",
  SR_B5: "nir",
  SR_B6: "swir1",
} as any;
