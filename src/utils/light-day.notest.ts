import { getDateLightDayLength } from "./light-day";
import { point } from "@turf/helpers";

for (let i = 0; i <= 365; i++) {
  const date = new Date(2020, 0, i);
  console.log(date, getDateLightDayLength(point([43.5, 43.5]).geometry, date));
}
