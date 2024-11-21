import express from "express";
import { classificationsMaxentRoute } from "./routes/classifications/maxent";

const app = express();
app.post("/classification/maxent", classificationsMaxentRoute);
app.post("/classification/random-forest", classificationsMaxentRoute);
