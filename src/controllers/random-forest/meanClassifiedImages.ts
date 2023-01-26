import { mkdir } from "fs/promises";
import { downloadFile } from "../../services/utils/io";
import { getThumbUrl, getTiffUrl } from "../../services/utils/ee-image";
import { RandomForestConfig } from "../../analytics_config_types2";
import { randomForest } from "./random-forest2";

export const meanClassifiedImages = async (
  config1: RandomForestConfig,
  config2: RandomForestConfig
) => {
  //@ts-ignore
  const { classified_image: image1, regionOfInterest } = await randomForest(
    config1
  );
  //@ts-ignore
  const { classified_image: image2 } = await randomForest(config2);
  const outputs = config1.outputs + "/MEAN";
  const meanImage = image1.add(image2).divide(2);
  const meanImageSplitted = meanImage.gte(50);
  const outputDir = `./.local/outputs/MEANS/${outputs}/`;
  await mkdir(`./.local/outputs/MEANS/${outputs}`, { recursive: true });
  const thumbUrl_mean = await getThumbUrl(meanImage, regionOfInterest);
  const downloadUrl_mean = await getTiffUrl(meanImage, regionOfInterest);
  const thumbUrl_splitted = await getThumbUrl(
    meanImageSplitted,
    regionOfInterest,
    { min: 0, max: 1, palette: ["white", "blue", "black"] }
  );
  const downloadUrl_splitted = await getTiffUrl(
    meanImageSplitted,
    regionOfInterest
  );

  const toDownload = [
    downloadFile(thumbUrl_mean, `${outputDir}classification.png`),
    downloadFile(downloadUrl_mean, `${outputDir}classification.zip`),
    downloadFile(thumbUrl_splitted, `${outputDir}classification50.png`),
    downloadFile(downloadUrl_splitted, `${outputDir}classification50.zip`),
  ];
  await Promise.all(toDownload);
};
