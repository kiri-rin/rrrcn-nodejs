//https://smithsonian.github.io/SDMinGEE/#accuracy-assessment-1
import { EEFeatureCollection, EEImage } from "../../types";

export function getAcc(img: EEImage, TP: any, scale: number = 100) {
  var Pr_Prob_Vals = img.sampleRegions({
    collection: TP,
    properties: ["Presence"],
    scale,
    tileScale: 16,
  });
  var seq = ee.List.sequence({ start: 0, end: 100, count: 25 });
  return ee.FeatureCollection(
    seq.map(function (cutoff: number) {
      var Pres = Pr_Prob_Vals.filter(ee.Filter.eq("Presence", 1));
      // true-positive and true-positive rate, sensitivity
      var TP = ee.Number(
        Pres.filter(ee.Filter.gte("classification", cutoff)).size()
      );
      var TPR = TP.divide(Pres.size());
      var Abs = Pr_Prob_Vals.filter(ee.Filter.eq("Presence", 0));
      // false-negative
      var FN = ee.Number(
        Pres.filter(ee.Filter.lt("classification", cutoff)).size()
      );
      // true-negative and true-negative rate, specificity
      var TN = ee.Number(
        Abs.filter(ee.Filter.lt("classification", cutoff)).size()
      );
      var TNR = TN.divide(Abs.size());
      // false-positive and false-positive rate
      var FP = ee.Number(
        Abs.filter(ee.Filter.gte("classification", cutoff)).size()
      );
      var FPR = FP.divide(Abs.size());
      // precision
      var Precision = TP.divide(TP.add(FP));
      // sum of sensitivity and specificity
      var SUMSS = TPR.add(TNR);
      return ee.Feature(null, {
        cutoff: cutoff,
        TP: TP,
        TN: TN,
        FP: FP,
        FN: FN,
        TPR: TPR,
        TNR: TNR,
        FPR: FPR,
        Precision: Precision,
        SUMSS: SUMSS,
      });
    })
  );
}

// Calculate AUC of the Receiver Operator Characteristic
export function getAUCROC(x: EEFeatureCollection) {
  var X = ee.Array(x.aggregate_array("FPR"));
  var Y = ee.Array(x.aggregate_array("TPR"));
  var X1 = X.slice(0, 1).subtract(X.slice(0, 0, -1));
  var Y1 = Y.slice(0, 1).add(Y.slice(0, 0, -1));
  return X1.multiply(Y1).multiply(0.5).reduce("sum", [0]).abs().toList().get(0);
}

function AUCROCaccuracy(image: EEImage, TData: EEFeatureCollection) {
  var Acc = getAcc(image, TData);
  return getAUCROC(Acc);
}
