# ECG reliability research

**Unpublished manuscript draft — not peer reviewed.**

[Project page](https://ksricharan7.github.io/portfolio/ecg.html) · [Manuscript PDF](../ecg-manuscript-draft.pdf) · [Supplement PDF](../ecg-supplement-draft.pdf)

## Question
Does waveform quality improve selective classification under recorded ECG artifact, while retaining AF-positive cases?

## Study and findings
- 15,292 adult human-reviewed PTB-XL ECG records from 13,796 participants; single lead II.
- Participant-separated development roles and final test set; controlled recorded-artifact noise conditions.
- Primary combined-versus-adjusted balanced retained-error difference: −0.2635 percentage points, paired participant-bootstrap 95% CI −2.7034 to +1.1410. Superiority was not established.
- At 90% matched overall coverage, AF-positive-record retention for the combined filter was 9.27%, 11.26%, 21.19%, and 48.34% at 24, 12, 6, and 0 dB, respectively. All failed the 80% research retention criterion.
- A [new followup](https://github.com/KSRICHARAN7/ecg-selective-classification/tree/main/extensions/quality-replication) tests the quality-without-predicted-class ablation across two fresh seeds and 930 new external records. Internal gains persisted; all five new comparisons met the AF-retention criterion, but one external interval crossed zero and the complete replication requirement was not met.

The contribution is an audited benchmark and an explanation of how aggregate retention can conceal poor AF-case retention, rather than a validated clinical tool.

## Public materials
The PDFs are the reviewed minimal-edit versions of the author's supplied rewrite. The manuscript retains its AI-assistance statement. The [public reproducibility repository](https://github.com/KSRICHARAN7/ecg-selective-classification) now contains original source code, fixed models, aggregate evidence, 64 scientific checks, and a tested fixed-model primary replay. See its [reproduction guide](https://github.com/KSRICHARAN7/ecg-selective-classification/blob/main/REPRODUCING.md) and [verification record](https://github.com/KSRICHARAN7/ecg-selective-classification/blob/main/docs/VERIFICATION.md). Source waveforms, participant-level files, and private research archives are not included.

## Limits
Single-lead extraction from clinical 12-lead recordings is not wearable validation. Controlled artifact is not a prospective sensor-failure trial. No clinical deployment or journal publication is claimed.

## Interactive reliability explorer

The [ECG project page](https://ksricharan7.github.io/portfolio/ecg.html) includes an interactive companion with five filtering methods, three target coverage settings (80%, 90%, 95%), clean input and four recorded-artifact conditions. The separately labeled waveform illustration is generated mathematically, does not contain participant waveforms, and is not run through the classifier.

### Data and provenance
[Download aggregate CSV](explorer-results.csv). The explorer uses 95 saved aggregate rows: 80 rows from the frozen primary matched-coverage output (four methods, five conditions, four coverages including the unfiltered baseline), and 15 rows from the quality-without-predicted-class ablation (five conditions, three coverages). The JSON export at [assets/ecg-results.json](../../assets/ecg-results.json) records the SHA-256 digest of each source table and the primary-result file. All 16 primary method-by-noise comparisons at 90% coverage were checked against the primary-result record before publication.

The source aggregate table paths are `final_experiment/matched_coverage_metrics.csv` and `robustness/ablation_matched_metrics.csv` within the frozen research package's outputs. Exported values are copied, not interpolated or fitted anew. Participant records and model predictions are not exported.

### Reading the numbers
- **Coverage:** retained records / all 2,085 records.
- **AF retention:** retained AF-positive records / all 151 AF-positive records.
- **Overall retained error:** (false positives + false negatives) / retained records.
- **Balanced retained error:** one half of the retained AF false-negative rate plus one half of the retained non-AF false-positive rate. It is undefined if a class has no retained records.
- **AF correctly classified / all AF:** retained true positives / 151. Retention alone does not imply detection.
- **80% AF criterion:** a research requirement used in this study, not a clinical safety threshold.

Matched coverage is a retrospective comparison that cuts each method's ranking to a specified fraction. It is not the separately evaluated fixed-threshold deployment policy. Rows show conditional point estimates; the dashboard does not calculate new significance tests or claim that the exploratory ablation is validated.

The full primary study conclusion and conditional participant-bootstrap confidence interval remain in the manuscript and project page. The explorer does not run or retrain the classifier.
