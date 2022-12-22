export type DateInterval = [Date, Date];
export type DatesConfig = { [key: string]: DateInterval[] };
export const getDateIntervals = (
  yearsIntervals: [number, number][],
  monthIntervals: [number, number][],
  intervalsInMonth?: [number, number | string][]
): DateInterval[] =>
  yearsIntervals.flatMap(([yearStart, yearEnd]) => {
    const res: [Date, Date][] = [];
    for (let year = yearStart; year <= yearEnd; year++) {
      const currentYearIntervals = monthIntervals.flatMap(
        ([monthStart, monthEnd]) => {
          const monthsRes: [Date, Date][] = [];
          if (!intervalsInMonth) {
            res.push([
              new Date(year, monthStart, 1),
              new Date(year, monthEnd + 1, 0),
            ]);
          } else {
            for (let month = monthStart; month <= monthEnd; month++) {
              const currentMonthIntervals = intervalsInMonth.map(
                ([dateStart, dateEnd]) => {
                  let start = new Date(year, month, dateStart);
                  let end = new Date(year, month);
                  if (typeof dateEnd === "string") {
                    end = new Date(year, month + 1, 0);
                  } else {
                    end.setDate(dateEnd);
                  }
                  return [start, end] as [Date, Date];
                }
              );
              monthsRes.push(...currentMonthIntervals);
            }
          }
          return monthsRes;
        }
      );
      res.push(...currentYearIntervals);
    }
    return res;
  });
export const getDefaultIntervalKey = (dateInterval: DateInterval) =>
  dateInterval
    .map((it) => it.toLocaleDateString("ru").split(".").join(""))
    .join("_");
export const dateIntervalsToConfig = (dateIntervals: DateInterval[]) =>
  dateIntervals.reduce((acc, interval) => {
    acc[getDefaultIntervalKey(interval)] = [interval];
    return acc;
  }, {} as DatesConfig);
