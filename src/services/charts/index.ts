// require file system and jsdom
import { ChartJSNodeCanvas } from "chartjs-node-canvas";
import { createWriteStream, writeFileSync } from "fs";
import Chart from "chart.js/auto";
import { writeFile } from "fs/promises";
import { ChartConfiguration } from "chart.js";
import { Stream } from "stream";
const regression = require("regression");
const chartjs = require("chart.js");
import { uniq } from "lodash";
const backgroundColour = "white"; // Uses https://www.w3schools.com/tags/canvas_fillstyle.asp

// create and a chart to the jsdom window.
// chart creating should be called only right after anychart-nodejs module requiring

// generate JPG image and save it to a file
// anychartExport.loadFontSync("../../assets/Ubuntu-Regular.ttf");

export const saveChart = async (
  chart: { chart: ChartConfiguration; width: number; height: number },
  output: any
) => {
  const chartJSNodeCanvas = new ChartJSNodeCanvas({
    width: chart.width,
    height: chart.height,
    backgroundColour,
  });

  const writeStream = createWriteStream(output);
  chartJSNodeCanvas.renderToStream(chart.chart).pipe(writeStream);

  return new Promise((resolve, reject) => {
    writeStream.on("finish", () => {
      resolve(true);
    });
    writeStream.on("error", () => {
      reject();
    });
  });
};
const chartJSNodeCanvas = new ChartJSNodeCanvas({
  width: 1200,
  height: 600,
  backgroundColour,
  chartCallback: () => chartjs,
});
export const drawHistogramChart = (data: any) => {
  const chart: ChartConfiguration = {
    type: "bar",
    options: {
      color: "blue",
      bar: { datasets: {} },
    },
    data: {
      datasets: [
        {
          label: "Importance",
          type: "bar",
          data: data.map((it: any) => it[1]),

          backgroundColor: ["rgba(0,0,255,0.5)"],
        },
      ],
      labels: data.map((it: any) => it[0]),
    },
  };

  return { chart, width: 1200, height: 600 };
};
export const drawRegressionChart = (data: any) => {
  var result = regression.linear(data);

  //get coefficients from the calculated formula
  var coeff = result.equation;

  var data_1 = data.map((it: any) => ({ x: it[0], y: it[1] }));
  var data_2 = setTheoryData(data, coeff).map((it: any) => ({
    x: it[0],
    y: it[1],
  }));
  var data_3 = data_2.map((it: any) => ({
    x: it.x,
    y: it.y,
  }));

  const chart: ChartConfiguration = {
    type: "scatter",
    options: {
      color: "blue",
      plugins: {
        title: {
          display: true,
          text:
            "The calculated formula: " +
            result.string +
            "\nThe coefficient of determination (R2): " +
            result.r2.toPrecision(2),
        },
      },
    },
    data: {
      labels: uniq(
        data_1.map((it: any) => it.x).sort((a: any, b: any) => (a < b ? -1 : 1))
      ),

      datasets: [
        {
          type: "scatter",
          label: "Experimental data",
          data: data_1,
          backgroundColor: "blue",
        },
        {
          type: "line",
          data: data_3.map((it) => ({ ...it })),
          label: "Theoretically calculated data",
          borderColor: "green",
          backgroundColor: "green",
        },
      ],
    },
  };

  // chart.title(
  //   "The calculated formula: " +
  //     result.string +
  //     "\nThe coefficient of determination (R2): " +
  //     result.r2.toPrecision(2)
  // );
  //
  // chart.legend(true);
  //
  // // creating the first series (marker) and setting the experimental data
  // var series1 = chart.marker(data_1);
  // series1.name("Experimental data");
  //
  // // creating the second series (line) and setting the theoretical data
  // var series2 = chart.line(data_2);
  // series2.name("Theoretically calculated data");
  // series2.markers(true);
  // chart.bounds(0, 0, 800, 600);
  //
  // chart.container("container");
  // chart.draw();

  return { chart, width: 800, height: 600 };
};
export const drawMarkerChart = async (data: any, title: string) => {
  var data_1 = data.map((it: any) => ({ x: it[0], y: it[1] }));

  const chart: ChartConfiguration = {
    type: "line",
    options: {
      color: "blue",
      plugins: {
        title: {
          display: true,
          text: title,
        },
      },
    },
    data: {
      labels: uniq(
        data_1.map((it: any) => it.x).sort((a: any, b: any) => (a < b ? -1 : 1))
      ),

      datasets: [
        {
          type: "line",
          fill: "origin",
          data: data_1,
          label: "",
          normalized: false,
        },
      ],
    },
  };

  return { chart, width: 600, height: 600 };
  // let chart = anychart.area(data);
  // let series = chart.spline(data);
  // chart.title(title);
  // data.map((point: any) => {
  //   const seriest = chart.spline([point]).markers(true);
  //   seriest.markers().type("circle");
  //   seriest.markers().fill("blue");
  // });
  // chart.xScale(anychart.scales.linear());
  // chart.yScale(anychart.scales.linear());
  // // const series = chart.line(data);
  // // chart.spline(data);
  // chart.bounds(0, 0, 800, 600);
  //
  // chart.container("container");
  // chart.draw();
  // return chart;
};
function formula(coeff: any, x: any) {
  let result = null;
  for (let i = 0, j = coeff.length - 1; i < coeff.length; i++, j--) {
    //@ts-ignore
    result += coeff[i] * Math.pow(x, j);
  }
  return result;
}

//setting theoretical data array of [X][Y] using experimental X coordinates
//this works with all types of regression
function setTheoryData(rawData: any, coeff: any) {
  let theoryData = [];
  for (let i = 0; i < rawData.length; i++) {
    theoryData[i] = [rawData[i][0], formula(coeff, rawData[i][0])];
  }
  return theoryData;
}
