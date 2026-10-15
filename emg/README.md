# EMG replay lab — Edition 1

Live: https://ksricharan7.github.io/portfolio/emg-lab.html

A browser-only educational companion to [the EMG command-filtering benchmark](https://github.com/KSRICHARAN7/emg-command-filtering-benchmark).

- `engine.mjs`: causal raw, symmetric persistence, asymmetric persistence and trailing majority controllers; stable endpoint confirmation and toy-stream metrics.
- `lab.mjs`: scenario selection, timeline, playback, parameter controls and fixed study-results rendering.
- `study-results.json`: unchanged DB5 primary and DB2 transported/reselected paired-comparison records from benchmark commit `ccc9e5df419ac8b6ecc9ab52988367f8579e4e7d`.

All interactive streams are invented, deterministic sequences of decoder labels. They are not participant data, EMG signals, fitted-model output, virtual-hand dynamics or clinical performance. The fixed results view contains actual released descriptive study contrasts; sliders never recompute those study results.

The demo uses 25 ms decisions, 100 ms stable confirmation at the confirming endpoint, a 250 ms onset budget, 150 ms release budget and active coverage starting 500 ms after onset. This is one toy event with no EMG feature warmup, no participant aggregation and no decoder. Counts up to ten are exploratory demonstration settings, not all settings from the frozen study grid.

Run `node tests/verify-lab.mjs` from the portfolio root. The test fixture compares the JavaScript implementations against 160 sequences from the benchmark's Python `controllers.py` and `confirm_stable` implementation, including majority tie handling and active-to-active transitions. Additional hand checks cover causal behavior and wrong-command coverage.
