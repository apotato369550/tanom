# Further testing and model improvements

## Purpose and current boundary

Test whether statistical post-processing improves archived ECMWF IFS rainfall
forecasts for Cebu against ERA5 historical rainfall, both downloaded through
Open-Meteo. ERA5 is a modeled reference, not gauge truth. Shared model ancestry,
different grid resolutions, and possible hindcast provenance limit interpretation.
This experiment does not predict flooding or currently correct the dashboard.

The current scripts train one Ridge model per month: days 1–20 train, day 21 is a
gap, and days 22 onward test. Forecast initialization leads are 24–47 hours—not
next-six-hour forecasts. The enhancements below are proposed work, not existing
CLI capabilities.

## 1. Diagnose the existing result before changing models

The reported June 2025 experiment reduced held-out MAE from 0.691 to 0.520 mm
(24.8%) but Ridge detected none of four ERA5 hours at or above 5 mm. Those four
hours may belong to the same storm; this is too little evidence for heavy-rain skill.

Add these comparisons on identical held-out hours:

- Raw forecast, always-zero prediction, training-set mean, and training-set median.
- A simple correction using raw precipitation alone, versus all current features.
- MAE, RMSE, R², mean signed error, total rainfall bias, and maximum rainfall.
- Error by reference intensity: below 0.1, 0.1–5, 5–10, and at least 10 mm/hour.
- Precision, recall, F1, hits, misses, and false alarms at 5 and 10 mm/hour.
- Non-overlapping six-hour accumulation errors; do not bridge missing hours.

Plot reference, raw, and corrected time series, especially around heavy-rain hours.
Plot predicted versus reference rainfall and residuals by lead time. Check whether
Ridge suppresses peaks or whether forecast rain arrives early/late. Timing plots
are diagnostic; do not shift predictions after inspecting the test data to improve scores.
Undefined metrics remain null, with event counts displayed.

## 2. Expand testing across time

First repeat the unchanged monthly experiment for additional months to check
whether the procedure consistently helps. Each run fits a new model; this is not
testing one frozen model on future months.

Then add multi-month loading and explicit date-based split configuration:

1. Collect a contiguous year where the chosen archive/model is available.
2. Reserve the final two months as an untouched final test.
3. On the earlier months, use expanding-window validation: train on earlier months,
   leave a temporal gap, validate on the next month, then move forward.
4. Fit preprocessing within each training fold, never before splitting.
5. Select settings using validation only; freeze them before the final test.

Keep at least the existing 24-hour gap. Also purge samples whose forecast would
have been available before the preceding split's reference labels were available;
use a conservative documented ERA5 availability delay rather than assuming labels
were immediately obtainable. Avoid overlapping target hours across splits.

June's inspected test results are now exploratory, not an untouched confirmation
set. Compare models on the same dates and retain poor months in the report.
Summarize uncertainty with paired day- or storm-block resampling, not independent
hour resampling. Report event counts and per-month results alongside averages.

## 3. Candidate models, in execution order

Keep the raw forecast and original Ridge as permanent baselines. Use the same
feature availability rules and nonnegative prediction handling for fair comparisons.

| Candidate | Why test it | Bounded first experiment |
| --- | --- | --- |
| Tuned Ridge | Establish whether regularization or irrelevant features hurt the current model | Alpha 0.1, 1, 10, 100; raw-rainfall-only versus current features |
| Residual Ridge | Learn a correction rather than replacing the forecast outright | Target = reference minus raw; final = max(0, raw + predicted correction) |
| Tweedie regression | Model nonnegative, zero-plus-positive rainfall with a log link | Power 1.5; alpha 0.1, 1, 10; train-only imputation and scaling |
| HistGradientBoostingRegressor | Capture nonlinear thresholds and feature interactions | Squared-error loss; max_iter 100, max_leaf_nodes 7 or 15, min_samples_leaf 20, l2_regularization 1, random_state 42 |

Do not run all candidates immediately. Test tuned Ridge first, then Tweedie or
histogram gradient boosting if diagnostics justify it. All are available in
scikit-learn; no TensorFlow, PyTorch, or XGBoost dependency is needed.
Residual Ridge changes the effective regularization preference, not the underlying
linear function family; it is not guaranteed to solve peak suppression.

If heavy-rain detection becomes the primary objective, consider a later two-stage
model: classify rain occurrence, then estimate positive rainfall amounts. Validate
its combined output and classification thresholds on validation data. More complex
models and rain-weighted training can increase false alarms; lower MAE and higher
heavy-rain recall are separate objectives.

## 4. Reproducibility and acceptance

For every experiment save dataset fingerprints, source/model provenance, split
boundaries, features, settings, package versions, validation results, and hourly
held-out predictions. Use distinct experiment IDs so candidates do not overwrite
one another. Retraining and inference must apply identical transformations.

Add fixture tests for multi-month boundaries, publication/label-availability
purging, train-only preprocessing, metric edge cases, saved-model parity, and
zero/negative predictions. Keep network-free unit tests separate from download checks.

A candidate is worth further investigation when it beats raw and trivial baselines
across multiple forward validation periods, has acceptable rainfall bias, and its
heavy-rain misses/false alarms are explicitly understood. A single favorable MAE
or one storm is insufficient. Fix the primary selection metric before comparing
candidates; initially use validation MAE and report heavy-rain tradeoffs separately.
Do not claim deployment readiness or measured-rainfall improvement from ERA5 scores.

## Recommended next increment

Add baseline comparisons, intensity breakdowns, and diagnostic plots without
changing the trained model. Next add multi-month forward validation. Only then
compare a tuned Ridge with one nonlinear candidate. Keep all work within `ml/`;
no database, scheduled collection, or application integration is required.

## References

- [Open-Meteo Single Runs API](https://open-meteo.com/en/docs/single-runs-api)
- [Open-Meteo Historical Weather API](https://open-meteo.com/en/docs/historical-weather-api)
- [Scikit-learn time-series splitting](https://scikit-learn.org/stable/modules/generated/sklearn.model_selection.TimeSeriesSplit.html)
- [Dummy baselines](https://scikit-learn.org/stable/modules/generated/sklearn.dummy.DummyRegressor.html)
- [Tweedie regression](https://scikit-learn.org/stable/modules/generated/sklearn.linear_model.TweedieRegressor.html)
- [Histogram gradient boosting](https://scikit-learn.org/stable/modules/generated/sklearn.ensemble.HistGradientBoostingRegressor.html)
