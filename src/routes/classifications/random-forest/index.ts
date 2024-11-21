import { IRoute } from "express";
import { IRouterHandler, RequestHandler } from "express-serve-static-core";
import { ClassificationApi } from "@rrrcn/common-types/services/api/classifications";
import { maxent } from "../../../controllers/classifications/maxent/maxent";
import { randomForest } from "../../../controllers/classifications/random-forest/random-forest";

export const classificationsRandomForestRoute: RequestHandler<
  any,
  ClassificationApi.PostRandomForest.Response,
  ClassificationApi.PostRandomForest.Body
> = async (req, res, next) => {
  const response = await randomForest(req.body);
  return res.send(response);
};
