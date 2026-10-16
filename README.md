# Sricharan Karthigeyan — personal portfolio

Live: https://ksricharan7.github.io/portfolio/

A buildless, multi-page GitHub Pages portfolio. The homepage introduces Sri and links to Projects, Activities, Awards and About. Individual project pages collect their manuscripts, interactive companions, code and evidence. Old homepage fragments redirect to the appropriate project or activity page.

## Pages

- `index.html`: short introduction and page directory
- `projects.html`: selected projects
- `emg.html`, `emg-lab.html`, `emg-manuscript.html`: EMG project, replay lab, unchanged manuscript draft
- `oai.html`, `manuscript.html`: knee-pain research and unchanged author-shared manuscript
- `ecg.html`: ECG reliability overview, manuscript, supplement and project notes
- `hourquest.html`: HourQuest description, sourced platform totals and evidence links
- `activities.html`, `awards.html`, `about.html`: activities, confirmed recognition and personal introduction
- `connect.html`: GitHub, LinkedIn and ORCID

The homepage uses the author's supplied portrait at `assets/sricharan-portrait.jpg`, with a subtle smile added through the requested AI edit. LinkedIn points to the author-supplied profile URL.

## Interactive EMG companion

[Lab documentation](emg/README.md). Four causal controller families operate on deterministic, explicitly synthetic decoder-command streams. Three schematic hands display annotation, raw-decoder and filtered-command states at the replay clock, with shortcuts to delayed-start, delayed-stop and wrong-movement examples. Three four-step failure-case walkthroughs explain start delay, stop delay and wrong-command coverage with verified replay timestamps and calculated takeaways. Actual published results are shown separately and do not change when sliders move. No raw participant recordings, fitted models or sample-level participant traces are distributed.

## Checks

```sh
node tests/verify-lab.mjs
node tests/verify-hand.mjs
node tests/verify-guides.mjs
node tests/verify-tour.mjs
node tests/verify-robustness.mjs
node tests/verify-ecg.mjs
node tests/verify-oai.mjs
python3 tests/verify-site.py
# Optional, with the benchmark dependencies installed:
python3 tests/verify-python-metrics.py /path/to/emg-command-filtering-benchmark
```

The 160 Python reference cases were generated from the EMG benchmark's `controllers.py` and `emg_pipeline.confirm_stable` at benchmark commit `ccc9e5df419ac8b6ecc9ab52988367f8579e4e7d`. See `tests/generate-python-reference.py`; it accepts the path to a local benchmark checkout. These cover majority tie handling, persistence and confirmation timing. Additional hand checks cover causality, wrong-command coverage, and exact held-output exposure.

## Content scope

EMG is an unpublished manuscript draft; OAI review status remains stated on its project page. No journal acceptance is claimed. E2D device totals are event-wide, not personal output. HLCA Ambassador selection appears on Awards. Activities follow the nine entries supplied by the author on October 15, 2026. Honors are limited to the five selected application honors: PVSA Gold, DECA district finalist, TSA regional Gold, HLCA Ambassador selection, and Junior Marshal. Earlier simulated volunteer-hour totals are not published.

Website implementation and interactive research communication tools were prepared with ChatGPT/Codex assistance. This does not assign credit for historical research, activities or achievements.

## Communication materials

`emg-tour.html` is a six-scene, approximately 126-second browser-narrated tour with captions, transcript, scene navigation, pause/resume and a silent timed fallback. Browser voices and speaking pace vary. No recording of the author is implied. The synthetic examples remain separate from the actual study findings.

`materials/emg/EMG_Engineering_Poster.pdf` is a one-page, 18 x 24 inch research poster. Its comparison values come from `emg/study-results.json`. Rebuild with `python3 scripts/build-emg-poster.py` using ReportLab and the DejaVu Sans fonts.

The OAI companion is integrated at `oai-lab.html` with the shared portfolio navigation. Its teaching model, browser logic, and aggregate data are copied unchanged from `oai-model-reliability` at commit e8ea54031cf5c85d274cbe591d1dbbf9bc1308fc. Scoped styles keep the explorer consistent with the portfolio.
