import { withGEE } from "./index";
import { evaluatePromisify } from "./services/utils/ee-image";
import util from "util";
withGEE(async () => {
  const feature = ee.Feature(null, { tes: 1 });

  const expression = ee.data.expressionAugmenter_(
    ee.Serializer.encodeCloudApiExpression(feature)
  );
  const request = { expression };
  const workloadTag = ee.data.getWorkloadTag();
  if (workloadTag) {
    //@ts-ignore
    request.workloadTag = workloadTag;
  }
  console.log(util.inspect(feature, false, null, true));
  console.log(util.inspect(expression, false, null, true));
  console.log(
    util.inspect(new ee.api.ComputeValueRequest(request), false, null, true)
  );

  console.log(ee.apiclient.getApiBaseUrl());
  const res = await evaluatePromisify(feature);
});
