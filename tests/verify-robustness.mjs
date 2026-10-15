import assert from 'node:assert/strict';
import fs from 'node:fs';
import {comparisonRows,label} from '../emg/robustness.mjs';
const d=JSON.parse(fs.readFileSync(new URL('../emg/channel-dropout-results.json',import.meta.url)));
assert.equal(d.conditions.length,40);assert.equal(d.validation.status,'PASS');assert.equal(d.validation.participant_condition_controller_evaluations,320);
for(const controller of ['raw','asymmetric']){
 const rows=d.conditions.filter(r=>r.controller===controller);assert.equal(rows.length,20);assert.equal(new Set(rows.map(r=>r.condition)).size,20);
 const intact=rows.find(r=>r.condition==='intact');
 for(const r of rows){assert.equal(r.participants,8);assert.equal(r.joint_successes,0);assert.ok(Math.abs(r.means.active_command_coverage-r.means.interior_correct_fraction-r.means.interior_wrong_active_fraction)<1e-12);assert.ok(Math.abs(r.delta_from_intact_pp.interior_correct_fraction-100*(r.means.interior_correct_fraction-intact.means.interior_correct_fraction))<1e-10)}
 const comparison=comparisonRows(d,controller);assert.equal(comparison.length,5);assert.ok(Math.abs(100*(intact.means.interior_correct_fraction-comparison[1].means.interior_correct_fraction)-d.primary[controller].mean_loss_correct_pp)<1e-10);
 const all=rows.find(r=>r.condition==='missing_all');assert.equal(all.means.interior_correct_fraction,0);assert.equal(all.means.rest_exposure,0);
}
assert.equal(label('missing_16'),'Channel 16');console.log('PASS: all 40 source rows, cohort arithmetic, primary estimate and all-missing failure.');
