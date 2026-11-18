"use strict";

const { test } = require("node:test");
const assert = require("node:assert/strict");
const model = require("./model");

const approximate = (actual, expected, tolerance = 1e-5) => {
  assert.ok(Math.abs(actual - expected) <= tolerance, `${actual} differs from ${expected}`);
};

test("a trip starts at rest, accelerates, coasts and stops in every supported network scenario", () => {
  const v = model.vehicle;
  for (const feed of ["both", "west"]) {
    for (const receiver of ["reversible", "none"]) {
      for (const fault of ["normal", "insulation", "sensor"]) {
        for (const zone of model.zones) {
          for (const [speed, stopKm] of [[40, 4], [70, 7.3], [80, 4], [80, 11.5]]) {
            const run = model.makeRun({ ...model.defaults, feed, receiver, fault, zone: zone.id, speed, stopKm });
            assert.deepEqual(run.stages.map(stage => stage.phase), Object.keys(model.phases));
            const start = run.samples[0];
            const finish = run.samples.at(-1);
            assert.equal(start.speed, 0);
            assert.equal(finish.speed, 0);
            approximate(finish.position, stopKm, 1e-7);
            approximate(run.samples[run.stages[2].index].speed * 3.6, speed);
            for (const [index, sample] of run.samples.entries()) {
              const p = sample.observed;
              assert.ok(p.voltage >= v.minVoltage - 1e-5 && p.voltage <= v.maxVoltage + 1e-5);
              assert.ok(p.current >= -v.maxRegen - 1e-5 && p.current <= v.maxDraw + 1e-5);
              approximate(p.power, p.voltage * p.current);
              approximate(p.stationA + p.stationB, p.current);
              approximate(p.returnA + p.returnB + p.leakage, p.current);
              if (index) assert.ok(sample.position >= run.samples[index - 1].position);
              if (sample.phase === "coast" || sample.phase === "stopped") approximate(p.power, v.auxiliary, 1e-3);
              if (sample.phase === "brake") {
                const next = run.samples[index + 1];
                assert.ok(next.speed < sample.speed && sample.speed - next.speed < 1.1);
                approximate(p.power + sample.generated, p.rheostat + v.auxiliary, 1e-3);
                approximate(sample.brakePower, sample.friction + sample.generated / v.regenEfficiency);
                if (receiver === "none") assert.ok(p.current >= 0);
                else assert.ok(780 * -p.current <= v.stationAbsorbLimit + 1e-5);
              }
            }
            if (fault === "normal") assert.equal(run.firstDetection, undefined);
            if (fault === "sensor") assert.equal(run.firstDetection, model.injectionIndex);
          }
        }
      }
    }
  }
});

test("starting draw grows with acceleration and regenerative output requires a receiver", () => {
  const reversible = model.makeRun(model.defaults);
  const noReceiver = model.makeRun({ ...model.defaults, receiver: "none" });
  const launch = reversible.stages.find(stage => stage.phase === "traction").index;
  const brake = reversible.stages.find(stage => stage.phase === "brake").index;
  approximate(reversible.samples[launch].observed.wheelPower, 0);
  assert.ok(reversible.samples[launch + 10].observed.current > reversible.samples[launch].observed.current);
  assert.ok(reversible.samples[brake].observed.power < 0);
  approximate(noReceiver.samples[brake].observed.power, 0);
  assert.ok(noReceiver.samples[brake].observed.rheostat > reversible.samples[brake].observed.rheostat);
});
