export type DateInterval = [Date, Date];
export type DatesConfig = { [key: string]: DateInterval[] };
export const getDateIntervals = (
  yearsIntervals: ([number, number] | number)[],
  monthIntervals: ([number, number] | number)[],
  intervalsInMonth?: [number, number | string][]
): DateInterval[] =>
  yearsIntervals.flatMap((years) => {
    const [yearStart, yearEnd] =
      typeof years === "number" ? [years, years] : years;
    const res: [Date, Date][] = [];
    for (let year = yearStart; year <= yearEnd; year++) {
      const currentYearIntervals = monthIntervals.flatMap((months) => {
        const [monthStart, monthEnd] =
          typeof months === "number" ? [months, months] : months;
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
      });
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
