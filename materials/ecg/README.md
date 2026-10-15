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
- A favorable quality-only ablation is exploratory and has not received fresh external or multi-seed replication.

The contribution is an audited benchmark and an explanation of how aggregate retention can conceal poor AF-case retention, rather than a validated clinical tool.

## Public materials
The PDFs are the reviewed minimal-edit versions of the author's supplied rewrite. The manuscript retains its AI-assistance statement. This release contains manuscripts and project notes; it is not yet the public code/reproducibility release. Source waveforms, participant-level files, and private research archives are not included.

## Limits
Single-lead extraction from clinical 12-lead recordings is not wearable validation. Controlled artifact is not a prospective sensor-failure trial. No clinical deployment or journal publication is claimed.
