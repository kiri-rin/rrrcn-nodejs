import suncalc from "suncalc";
export const getDateLightDayLength = (point: GeoJSON.Point, date: Date) => {
  const {
    sunrise,
    sunset,
  }: {
    sunrise: Date;
    sunset: Date;
  } = suncalc.getTimes(date, point.coordinates[1], point.coordinates[0]);
  if (!sunrise) {
    return 0;
  }
  if (!sunset) {
    return 24;
  }
  return Math.max(
    Math.min((sunset.getTime() - sunrise.getTime()) / (1000 * 60 * 60), 24),
    0
  );
};
export const getMonthLightDayLength = (
  point: GeoJSON.Point,
  month: number
): { dayHours: number; nightHours: number } => {
  let date = new Date(new Date().getFullYear(), month, 1);
  let res = { dayHours: 0, nightHours: 0 };
  let currentDay = 1;
  while (date.getMonth() === month) {
    const currentDayLightHours = getDateLightDayLength(point, date);
    res.dayHours += currentDayLightHours;
    res.nightHours += 24 - currentDayLightHours;
    currentDay++;
    date = new Date(2021, month, currentDay);
  }
  return res;
};
export const getLightDayLengthPerMonth = (point: GeoJSON.Point) => {
  return new Array(12)
    .fill(0)
    .map((it, index) => getMonthLightDayLength(point, index));
};
