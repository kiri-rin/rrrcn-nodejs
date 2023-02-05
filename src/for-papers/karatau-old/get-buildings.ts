import { withGEE } from "../../index";
import { drawAUCROCChart } from "../../services/random-forest/charts";
import { importGeometries } from "../../services/utils/import-geometries";
import {
  worldCoverScript,
  worldCoverTargetsKeys,
} from "../../services/ee-data/scripts/world-cover";

withGEE(async () => {
  const regionOfInterest = await importGeometries(
    {
      type: "csv",
      path: "./src/for-papers/karatau-old/assets/region-of-interest.csv",
    },
    "polygon"
  );
  console.log(await worldCoverScript({ regions: regionOfInterest }));
  const wcimage = ee
    .Image((await worldCoverScript({ regions: regionOfInterest })).world_cover)
    .eq(worldCoverTargetsKeys.Built_up)
    .selfMask();
  const vector = wcimage.sample({
    region: regionOfInterest,
    scale: 1000,
    geometries: true,
  });
  const downloadJSONUrl = await new Promise((resolve) => {
    vector.getDownloadURL(
      "JSON",
      undefined,
      "EXPORTED",
      (res: any, error: any) => {
        console.log({ res, error });
        console.log(res, " URL");
        resolve(res);
      }
    );
  });
  const downloadKMLUrl = await new Promise((resolve) => {
    vector.getDownloadURL(
      "KML",
      undefined,
      "EXPORTED",
      (res: any, error: any) => {
        console.log({ res, error });
        console.log(res, " URL");
        resolve(res);
      }
    );
  });
  console.log(downloadJSONUrl, downloadKMLUrl);
});
