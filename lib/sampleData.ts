export type SampleScenario = {
  id: string;
  label: string;
  description: string;
  content: string;
};

export const sampleScenarios: SampleScenario[] = [
  {
    id: "tim-weekly",
    label: "TIM weekly status + partner sync",
    description: "Weekly program update covering partner data ingestion, model v2 rollout, and EU compliance.",
    content: `TIM Program — Weekly Status (Week of Sep 8, 2026)

Overall: Amber. Partner data ingestion is the critical path for the Q4 TIM v2 rollout.

1) Partner data ingestion
- Two of five airline partners (SkyAlps, Nordwind) have completed sandbox integration; remaining three blocked on API credentials issued by our BD team. Meridian Air escalated that their engineering capacity is limited to 2 engineers until Oct.
- Fuel-burn data feed from Aurora Freight failed validation twice this week — unit mismatch (kg vs. litres). Their data team needs our validation spec; we promised to send by Wed.
- Decision (made by Priya + BD): sandbox credentials for remaining partners go out by Sep 12, else we escalate to the partner engineering director.

2) Model v2 rollout
- Science team signed off on v2 methodology changes for load factor assumptions on Sep 9. changelog is drafted but needs a legal/compliance review before we can publish provenance docs.
- Engineering estimates 3 sprints to implement v2 in the API; can start immediately in parallel since the methodology is now frozen.
- Risk: if legal review takes >2 weeks, we miss the Q4 rollout window and Flights UI commitments.

3) Contrail avoidance trial
- Zürich trial flight plan agreed with ATC for Oct 5-16 window. Humidity forecast model integration with the research partner is behind — their scientist is on leave; interim coverage is manual.
- Need a decision on whether the trial proceeds with manual humidity inputs or waits for automated feed. Leaning manual, but needs sign-off from Ravi (Eng lead).

4) Regional compliance (EU/CH)
- Swiss regulator asked for documentation of our uncertainty methodology by end of September. Compliance doc is 60% drafted by Lena.
- EU Green Claims directive mapping workshop scheduled Sep 24 with legal.

Actions:
- Priya: send validation spec to Aurora Freight (Wed Sep 10)
- BD team (Marc): issue sandbox credentials to 3 remaining partners (Sep 12)
- Lena: finish uncertainty methodology doc (Sep 26)
- Ravi: decide manual vs automated humidity feed for trial (Sep 13)
- Engineering: kickoff v2 API implementation sprint (Mon Sep 15)
- Tom: schedule legal review of methodology changelog (Sep 11)

Open questions:
- Should Q4 rollout date move if legal review exceeds 2 weeks? (raised by Ravi)
- Do we need partner contracts amended for contrail trial data sharing? (raised by Marc)`,
  },
  {
    id: "exec-prep",
    label: "Quarterly planning + exec review notes",
    description: "Quarterly planning session notes with exec asks, budget, and cross-program dependencies.",
    content: `Quarterly Planning Session — Sustainable Journeys (Sep 5, 2026, Zürich + remote)

Attendees: Priya (PM), Ravi (Eng), Lena (Compliance), Marc (BD), Sofia (UX), Tom (PgM), Dr. Weber (Science)

Q4 objectives discussion:
- Objective 1: Launch TIM v2 with provenance transparency features globally by Dec 1. Engineering confirms feasibility but flags: v2 depends on partner emissions data coverage reaching 85% of flights (currently 71%).
- Objective 2: Contrail avoidance trial with 2 airline partners; success criteria defined by science team: >15% contrail reduction in trial corridors, measured per Humidity-Model v3.
- Objective 3: EU Green Claims compliance readiness — legal wants all public-facing claims mapped by Nov 15.

Budget: Contrail trial underfunded by ~120k CHF (sensor + flight hours). Decision needed from leadership by Sep 30 or trial slips to Q1. Priya to draft one-pager for exec review.

Dependencies flagged:
- TIM v2 launch depends on: partner data coverage (85%), legal sign-off on methodology changelog, Flights UI team availability in November (they own the display changes).
- Contrail trial depends on: budget approval, ATC slot confirmation (Oct 5-16), research partner humidity feed.
- EU compliance depends on: TIM v2 provenance docs (legal reviews them together).

Risks:
- Partner data coverage stuck at 71% for 6 weeks. Marc says 2 partners cite "no engineering capacity" — need exec-level push. Severity: high.
- Humidity model v3 accuracy in tropical corridors still unvalidated; science team wants a fallback rule. Severity: medium.
- Flights UI team may be pulled into holiday-season freeze in mid-November. Severity: medium.

Decisions made:
- Trial flight window locked: Oct 5-16 (Ravi + ATC).
- Provenance docs go to legal no later than Sep 20 (Tom).

Asks for exec:
- Approve 120k CHF contrail trial budget top-up (Priya to submit by Sep 18).
- Escalate partner engineering capacity with airline CTO offices (Marc + exec sponsor).
- Confirm Flights UI November availability (Ravi to raise with Flights leads).

Momentum: steady overall, but partner data coverage trend is concerning.
Next quarterly review: Dec 10.`,
  },
  {
    id: "contrail-readiness",
    label: "Contrail trial readiness review",
    description: "Flight-window readiness for the Oct contrail-avoidance trial: ATC, humidity model, sensors, budget.",
    content: `Contrail Avoidance Trial — Flight-Window Readiness Review (Sep 22, 2026, Zürich)

Target flight window: Oct 5–16. This review decides whether the window holds.

1) ATC & airspace coordination
- Zürich ACC confirmed trial corridor slots for Oct 5–16 on Sep 19. Written confirmation received. ATC asks for final flight profiles 10 days before first flight (Sep 25) — SkyAlps flight plans are drafted but Nordwind hasn't submitted aircraft performance data yet.
- Go/no-go: ATC readiness = GREEN.

2) Humidity & contrail forecast model (v3)
- Research partner confirms Humidity Model v3 integration is slipping: lead scientist on parental leave until Oct 20, interim engineer ramping up. Automated feed will NOT be ready for the window.
- Fallback proposal (science team, Dr. Weber): run the trial with manual humidity inputs — twice-daily radiosonde launches + manual forecast upload. Accuracy acceptable per v2.5 baseline, but doubles ops staffing during the window.
- Decision needed by Sep 28: trial proceeds with manual humidity inputs vs. wait for automated feed (slips trial to Q1).

3) Sensor & instrumentation
- 20 of 22 contrail sensors calibrated and installed. 2 units on the A350 test aircraft failed bench tests; replacement ETA Oct 2 — cutting it close. Engineering can fly with 20/22 if the two gaps are non-critical positions (to be confirmed by Dr. Weber by Sep 30).
- Sensor data pipeline to the research partner is live and tested end-to-end as of Sep 20.

4) Budget
- Trial is CHF 120k underfunded (sensor replacements + extra ops staffing for manual humidity). Priya's one-pager went to leadership Sep 18; approval expected by Sep 26. If budget approval slips past Sep 30, flight hours get cut from 12 to 8, weakening statistical significance.

5) Partner airline coordination
- SkyAlps: committed, flight crew briefing scheduled Oct 1.
- Nordwind: still awaiting their instrumented-fleet availability confirmation (due Sep 26). Two consecutive weeks of no response — escalation to their program office needed.
- Data sharing agreement amendment for trial telemetry is with legal (Marc submitted Sep 15); legal estimates 10 business days.

6) Science success criteria (locked)
- Success: >15% contrail reduction in trial corridors, measured per Humidity Model v3 (fallback: v2.5 baseline if manual ops).
- All flights need pre/post imagery validated by two independent annotators.

Decisions made:
- Flight window stays Oct 5–16 unless budget approval slips past Sep 30 (Ravi + Priya, Sep 22).

Actions:
- Nordwind flight plans + fleet data: Nordwind ops team, due Sep 26
- Confirm 20/22 sensor coverage acceptable: Dr. Weber, due Sep 30
- Manual-vs-automated humidity decision: Ravi, due Sep 28
- Budget approval follow-up: Priya, due Sep 25
- ATC final flight plans: SkyAlps ops + Ravi, due Sep 25
- Legal: data-sharing amendment sign-off: Tom, due Oct 1

Risks:
- Budget not approved by Sep 30 → flight hours cut, weaker science outcome (severity: high)
- Nordwind non-responsive → corridor slots partially wasted, trial statistical power drops (severity: high)
- Sensor replacements arrive late (Oct 2) → aircraft swaps mid-window, ops disruption (severity: medium)
- Manual humidity ops staffing strain during 12 flight days (severity: medium)

Open questions:
- Do we need a second dry-run flight before Oct 5? (raised by Ravi)
- Who signs off the go/no-go on Oct 2 — Ravi alone or with Dr. Weber? (raised by Tom)`,
  },
  {
    id: "partner-incident-slack",
    label: "#tim-ops partner data incident",
    description: "Raw Slack thread during a production data-quality incident with a partner and a regulator query.",
    content: `#tim-ops — Sep 24, 2026 (thread, raw)

**Priya 09:02** — Heads up, flagged in the support inbox overnight: Meridian Air says the TIM emissions figures shown for their A320neo fleet in production are ~40% higher than their own calculations. They're asking whether our model version changed. This is customer-visible on Google Flights. P1.

**Ravi 09:04** — Nothing changed on our side in the last deploy. But: we onboarded their July fuel-flow data last week (the Aurora-batch ingestion). If their fuel-flow telemetry format changed in July, our model would chew it as if valid.

**Priya 09:05** — So suspect = new data batch, not model change. Can we bisect?

**Ravi 09:07** — Doing it now. Need Meridian's raw July feed though — request it from their data team via BD, our sandbox access to their raw export expired Aug 31.

**Marc 09:09** — I'll ping Meridian's data lead. Also heads up: BAZL (Swiss federal office) sent a formal query this morning about the provenance of our load-factor assumptions — deadline for a response is Oct 3. Legal wants our methodology team to draft the response.

**Lena 09:12** — On it. Provenance docs for v2 aren't public yet — BAZL's question touches exactly that. Draft due Sep 30 latest, ideally sooner. Legal review then Tom's desk.

**Priya 09:15** — Agreed priority order: 1) stop the bleeding for Meridian figures, 2) BAZL response, 3) post-mortem.

**Ravi 11:40** — Update: bisected. Figures for A320neo since Sep 18 come from the July batch where fuel density field is NULL for 60% of rows. Our ingestion defaults NULL → 0.8 kg/L; the correct default per their data dictionary is 0.787. That's the delta. Older data unaffected.

**Ravi 11:41** — Fix = two lines in the ingestion defaults + recompute for affected rows. Deploy window tomorrow 07:00 CET. Recompute job ~4h for the affected fleet.

**Priya 11:43** — Need: comms plan for Meridian before we deploy (they should not see numbers jump without a heads-up), and a partner-facing explanation that doesn't sound like "our bad" — neutral, factual, with corrected-timetable.

**Marc 11:45** — Drafting to Meridian today. Suggest we also proactively tell the other 4 partners — if the NULL-default affects them too this becomes a trust issue. Engineering: can you scan all partners' July–Sep batches for NULL fuel-flow by tonight?

**Ravi 11:47** — Scan is cheap, tonight works. Early guess: Aurora Freight had NULLs too but in a column we don't use. Will confirm.

**Tom 13:20** — Status page: do we publish an incident note publicly? Flights UI shows TIM figures globally; sustainability comms wants to know if we need a footnote. Deadline-wise they need an answer by tomorrow noon.

**Priya 13:22** — If scan shows only Meridian affected: no public note, partner-level comms only. If wider: footnote + note to Flights leads. Decision tomorrow 10:00 after the scan.

**Lena 14:05** — For BAZL: need engineering input on the ingestion audit trail (when was the batch ingested, checksums) — can engineering produce that by Sep 29? It goes into the response annex.

**Ravi 14:08** — Yes, but only after tomorrow's deploy. Sep 27 realistically.

**Priya 15:30** — Summary of asks: Ravi scan tonight, deploy tomorrow 07:00, recompute done by tomorrow evening; Marc partner comms today; Tom incident-note decision input by tomorrow 10:00; Lena BAZL draft Sep 30; Ravi+Eng audit annex Sep 27. Retro scheduled Oct 2.

**Marc 15:33** — One more: this is the second ingestion data-quality miss this quarter. I think we need a standing data-validation gate before any partner batch hits production. Proposing for the next ops review.`,
  },
];
