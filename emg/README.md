# EMG replay lab — Edition 2

Live: https://ksricharan7.github.io/portfolio/emg-lab.html

A browser-only educational companion to [the EMG command-filtering benchmark](https://github.com/KSRICHARAN7/emg-command-filtering-benchmark).

- `engine.mjs`: causal raw, symmetric persistence, asymmetric persistence and trailing majority controllers; stable endpoint confirmation and toy-stream metrics.
- `hand.mjs`: three schematic command-driven hands and highlighted replay moments. Poses track current command labels with no added motor delay.
- `lab.mjs`: scenario selection, timeline, playback, parameter controls and fixed study-results rendering.
- `study-results.json`: unchanged DB5 primary and DB2 transported/reselected paired-comparison records from benchmark commit `ccc9e5df419ac8b6ecc9ab52988367f8579e4e7d`.

All interactive streams are invented, deterministic sequences of decoder labels. They are not participant data, EMG signals, fitted-model output, measured hand kinematics, biomechanics or clinical performance. The fixed results view contains actual released descriptive study contrasts; sliders never recompute those study results.

The demo uses 25 ms decisions, 100 ms stable confirmation at the confirming endpoint, a 250 ms onset budget, 150 ms release budget and active coverage starting 500 ms after onset. This is one toy event with no EMG feature warmup, no participant aggregation and no decoder. Counts up to ten are exploratory demonstration settings, not all settings from the frozen study grid.

Run `node tests/verify-lab.mjs` from the portfolio root. The test fixture compares the JavaScript implementations against 160 sequences from the benchmark's Python `controllers.py` and `confirm_stable` implementation, including majority tie handling and active-to-active transitions. Additional hand checks cover causal behavior and wrong-command coverage.

The hand display maps toy label 0 to an open hand, label 1 to a closed grip and label 2 to a turned open hand. This mapping is illustrative, not the Ninapro class map. The annotation is a replay reference, not a measurement of intention. Highlight buttons set explicit scenario/controller parameters and seek to a documented moment; they do not alter the frozen study results.
