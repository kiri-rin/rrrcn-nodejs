import { IRoute } from "express";
import { IRouterHandler, RequestHandler } from "express-serve-static-core";
import { ClassificationApi } from "@rrrcn/common-types/services/api/classifications";
import { maxent } from "../../../controllers/classifications/maxent/maxent";

export const classificationsMaxentRoute: RequestHandler<
  any,
  ClassificationApi.PostMaxent.Response,
  ClassificationApi.PostMaxent.Body
> = async (req, res, next) => {
  const response = await maxent(req.body);
  return res.send(response);
};
