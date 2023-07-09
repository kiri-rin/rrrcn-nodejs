//https://smithsonian.github.io/SDMinGEE/#accuracy-assessment-1
import { EEFeatureCollection, EEImage } from "../../types";

export function getAcc(predictedPoints: EEFeatureCollection) {
  const Pr_Prob_Vals = predictedPoints;
  const seq = ee.List.sequence({ start: 0, end: 100, count: 25 });
  return ee.FeatureCollection(
    seq.map(function (cutoff: number) {
      const Pres = Pr_Prob_Vals.filter(ee.Filter.eq("Presence", 1));
      // true-positive and true-positive rate, sensitivity
      const TP = ee.Number(
        Pres.filter(ee.Filter.gte("classification", cutoff)).size()
      );
      const TPR = TP.divide(Pres.size());
      const Abs = Pr_Prob_Vals.filter(ee.Filter.eq("Presence", 0));
      // false-negative
      const FN = ee.Number(
        Pres.filter(ee.Filter.lt("classification", cutoff)).size()
      );
      // true-negative and true-negative rate, specificity
      const TN = ee.Number(
        Abs.filter(ee.Filter.lt("classification", cutoff)).size()
      );
      const TNR = TN.divide(Abs.size());
      // false-positive and false-positive rate
      const FP = ee.Number(
        Abs.filter(ee.Filter.gte("classification", cutoff)).size()
      );
      const FPR = FP.divide(Abs.size());
      // precision
      const Precision = TP.divide(TP.add(FP));
      // sum of sensitivity and specificity
      const SUMSS = TPR.add(TNR);
      const kappa = TP.multiply(TN)
        .add(FN.multiply(FP))
        .multiply(2)
        .divide(
          TP.add(FP)
            .multiply(FP.add(TN))
            .add(TP.add(FN).multiply(FN.add(TN)))
        );
      const ccr = TP.add(TN).divide(TP.add(TN).add(FN).add(FP));
      return ee.Feature(null, {
        //fix me null break logic in gee api module
        cutoff,
        TP,
        TN,
        FP,
        FN,
        TPR,
        TNR,
        FPR,
        Precision,
        SUMSS,
        kappa,
        ccr,
      });
    })
  );
}

// Calculate AUC of the Receiver Operator Characteristic
export function getAUCROC(x: EEFeatureCollection) {
  const X = ee.Array(x.aggregate_array("FPR"));
  const Y = ee.Array(x.aggregate_array("TPR"));
  const X1 = X.slice(0, 1).subtract(X.slice(0, 0, -1));
  const Y1 = Y.slice(0, 1).add(Y.slice(0, 0, -1));
  return X1.multiply(Y1).multiply(0.5).reduce("sum", [0]).abs().toList().get(0);
}

function AUCROCaccuracy(predictedPoints: EEFeatureCollection) {
  const Acc = getAcc(predictedPoints);
  return getAUCROC(Acc);
}
