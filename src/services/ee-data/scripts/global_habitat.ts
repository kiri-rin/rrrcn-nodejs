import { AnalyticsScript, AnalyticsScriptResult } from "../index";
import { EEFeatureCollection } from "../../../types";

export const globalHabitatScript: AnalyticsScript = async ({
  regions,
  bands,
}) => {
  const data = {
    cov: ee.Image(
      "projects/sat-io/open-datasets/global_habitat_heterogeneity/coefficient_of_variation_1km"
    ),
    contrast: ee.Image(
      "projects/sat-io/open-datasets/global_habitat_heterogeneity/contrast_1km"
    ),
    corr: ee.Image(
      "projects/sat-io/open-datasets/global_habitat_heterogeneity/correlation_1km"
    ),
    dissimilarity: ee.Image(
      "projects/sat-io/open-datasets/global_habitat_heterogeneity/dissimilarity_1km"
    ),
    entropy: ee.Image(
      "projects/sat-io/open-datasets/global_habitat_heterogeneity/entropy_1km"
    ),
    homogeneity: ee.Image(
      "projects/sat-io/open-datasets/global_habitat_heterogeneity/homogeneity_1km"
    ),
    maximum: ee.Image(
      "projects/sat-io/open-datasets/global_habitat_heterogeneity/maximum_1km"
    ),
    mean: ee.Image(
      "projects/sat-io/open-datasets/global_habitat_heterogeneity/mean_1km"
    ),
    pielou: ee.Image(
      "projects/sat-io/open-datasets/global_habitat_heterogeneity/pielou_1km"
    ),
    range: ee.Image(
      "projects/sat-io/open-datasets/global_habitat_heterogeneity/range_1km"
    ),
    shannon: ee.Image(
      "projects/sat-io/open-datasets/global_habitat_heterogeneity/shannon_1km"
    ),
    simpson: ee.Image(
      "projects/sat-io/open-datasets/global_habitat_heterogeneity/simpson_1km"
    ),
    sd: ee.Image(
      "projects/sat-io/open-datasets/global_habitat_heterogeneity/standard_deviation_1km"
    ),
    uniformity: ee.Image(
      "projects/sat-io/open-datasets/global_habitat_heterogeneity/uniformity_1km"
    ),
    variance: ee.Image(
      "projects/sat-io/open-datasets/global_habitat_heterogeneity/variance_1km"
    ),
  };
  Object.keys(data).forEach((key) => {
    //@ts-ignore
    if (!bands || bands.includes(key)) {
      //@ts-ignore
      data[key] = data[key].select([0], [key]);
    } else {
      //@ts-ignore
      delete data[key];
    }
  });
  return data;
};
