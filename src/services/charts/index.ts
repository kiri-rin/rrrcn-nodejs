// require file system and jsdom
var fs = require("fs");

// For jsdom version 10 or higher.
// Require JSDOM Class.
var JSDOM = require("jsdom").JSDOM;
// Create instance of JSDOM.
var jsdom = new JSDOM(
  '<body><div font-familt="ASd" id="container"></div></body>',
  {
    runScripts: "dangerously",
  }
);
const regression = require("regression");
// Get window
var window = jsdom.window;

// For jsdom version 9 or lower
// var jsdom = require('jsdom').jsdom;
// var document = jsdom('<body><div id="container"></div></body>');
// var window = document.defaultView;

// require anychart and anychart export modules
var anychart = require("anychart")(window);
var anychartExport = require("anychart-nodejs")(anychart);

// create and a chart to the jsdom window.
// chart creating should be called only right after anychart-nodejs module requiring

// generate JPG image and save it to a file
// anychartExport.loadFontSync("../../assets/Ubuntu-Regular.ttf");

export const saveChart = async (chart: any, output: any) => {
  await new Promise((resolve, reject) => {
    anychartExport.exportTo(chart, "jpg").then(
      function (image: any) {
        fs.writeFile(output, image, function (fsWriteError: any) {
          if (fsWriteError) {
            console.log(fsWriteError);
            resolve(true);
          } else {
            console.log("Complete");
            resolve(true);
          }
        });
      },
      function (generationError: any) {
        console.log(generationError);
        resolve(true);
      }
    );
  });
};
export const drawHistogramChart = (data: any) => {
  const chart = anychart.column(data);
  chart.bounds(0, 0, 1200, 600);

  chart.container("container");
  chart.draw();
  return chart;
};
export const drawRegressionChart = (data: any) => {
  var result = regression.linear(data);

  //get coefficients from the calculated formula
  var coeff = result.equation;

  var data_1 = data;
  var data_2 = setTheoryData(data, coeff);

  const chart = anychart.scatter();

  chart.title(
    "The calculated formula: " +
      result.string +
      "\nThe coefficient of determination (R2): " +
      result.r2.toPrecision(2)
  );

  chart.legend(true);

  // creating the first series (marker) and setting the experimental data
  var series1 = chart.marker(data_1);
  series1.name("Experimental data");

  // creating the second series (line) and setting the theoretical data
  var series2 = chart.line(data_2);
  series2.name("Theoretically calculated data");
  series2.markers(true);
  chart.bounds(0, 0, 800, 600);

  chart.container("container");
  chart.draw();
  return chart;
};
export const drawMarkerChart = async (data: any, title: string) => {
  let chart = anychart.area(data);
  let series = chart.spline(data);
  chart.title(title);
  data.map((point: any) => {
    const seriest = chart.spline([point]).markers(true);
    seriest.markers().type("circle");
    seriest.markers().fill("blue");
  });
  chart.xScale(anychart.scales.linear());
  chart.yScale(anychart.scales.linear());
  // const series = chart.line(data);
  // chart.spline(data);
  chart.bounds(0, 0, 800, 600);

  chart.container("container");
  chart.draw();
  return chart;
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
