"use strict";

const TwinModel = (() => {
  const length = 12;
  const injectionIndex = 25;
  const sourceVoltage = 780;
  const departure = 1.5;
  const coastSeconds = 35;
  const nominalDeceleration = 0.9;
  const stopRange = { min: 4, max: 11.5, step: 0.1 };
  const phases = { ready: "发车准备", traction: "启动加速", cruise: "巡航", coast: "惰行", brake: "制动", stopped: "停车" };
  const vehicle = { mass: 170_000, maxForce: 165_000, maxWheelPower: 950_000, auxiliary: 35_000, efficiency: 0.9,
    regenEfficiency: 0.85, regenLimit: 850_000, stationAbsorbLimit: 450_000, minVoltage: 550, maxVoltage: 900, maxDraw: 1400, maxRegen: 900 };
  const zones = [
    { id: "R01", from: 0, to: 4, name: "西段回流区" },
    { id: "R02", from: 4, to: 8, name: "中段回流区" },
    { id: "R03", from: 8, to: 12, name: "东段回流区" },
  ];
  const defaults = { fault: "insulation", zone: "R02", feed: "both", receiver: "reversible", speed: 70, stopKm: stopRange.max };
  const scenarioNames = { normal: "健康基线", insulation: "轨地绝缘下降", sensor: "轨电位测点偏置" };

  function solveRail(nodes, fixed, resistance, loads, shunts) {
    const n = nodes.length;
    const lower = new Array(n).fill(0);
    const upper = new Array(n).fill(0);
    const diagonal = new Array(n).fill(0);
    const rhs = loads.slice();
    for (let i = 0; i < n; i++) {
      if (fixed[i] !== undefined) {
        diagonal[i] = 1;
        rhs[i] = fixed[i];
        continue;
      }
      diagonal[i] = shunts[i];
      for (const neighbor of [i - 1, i + 1]) {
        if (neighbor < 0 || neighbor >= n) continue;
        const conductance = 1 / (resistance * Math.abs(nodes[i] - nodes[neighbor]));
        diagonal[i] += conductance;
        if (fixed[neighbor] !== undefined) rhs[i] += conductance * fixed[neighbor];
        else if (neighbor < i) lower[i] = -conductance;
        else upper[i] = -conductance;
      }
    }
    for (let i = 1; i < n; i++) {
      const ratio = lower[i] / diagonal[i - 1];
      diagonal[i] -= ratio * upper[i - 1];
      rhs[i] -= ratio * rhs[i - 1];
    }
    const volts = new Array(n);
    volts[n - 1] = rhs[n - 1] / diagonal[n - 1];
    for (let i = n - 2; i >= 0; i--) volts[i] = (rhs[i] - upper[i] * volts[i + 1]) / diagonal[i];
    return volts;
  }

  function simulate({ position, current, feed, fault, zone }) {
    const nearest = Math.round(position);
    // A calculated station stop can differ from an integer kilometre by roundoff.
    if (Math.abs(position - nearest) < 1e-9) position = nearest;
    const nodes = Array.from({ length: length + 1 }, (_, i) => i);
    if (!Number.isInteger(position)) nodes.push(position);
    nodes.sort((a, b) => a - b);
    const train = nodes.indexOf(position);
    const end = nodes.length - 1;
    const sourceR = 0.022;
    const railR = 0.018;
    const loads = nodes.map((_, i) => i === train ? current : 0);
    // Lump the distributed rail-to-ground conductance at the three zone meters.
    const shunts = nodes.map(km => {
      const section = zones.find(region => km === region.from + 2);
      if (!section) return 0;
      return fault === "insulation" && zone === section.id ? 1.25 : 0.16;
    });
    const send = feed === "both" ? { 0: sourceVoltage, [end]: sourceVoltage } : { 0: sourceVoltage };
    const drain = feed === "both" ? { 0: 0, [end]: 0 } : { 0: 0 };
    const positive = solveRail(nodes, send, sourceR, loads.map(amp => -amp), nodes.map(() => 0));
    const negative = solveRail(nodes, drain, railR, loads, shunts);
    const stationA = (positive[0] - positive[1]) / (sourceR * nodes[1]);
    const stationB = feed === "both" ? (positive[end] - positive[end - 1]) / (sourceR * (length - nodes[end - 1])) : 0;
    const returnA = negative[1] / (railR * nodes[1]);
    const returnB = feed === "both" ? negative[end - 1] / (railR * (length - nodes[end - 1])) : 0;
    const meters = Object.fromEntries(zones.map(region => {
      const index = nodes.indexOf(region.from + 2);
      const rail = negative[index];
      const measured = rail + (fault === "sensor" && region.id === zone ? 8 : 0);
      return [region.id, { rail, measured, leakage: rail * shunts[index], resistance: 1 / shunts[index] }];
    }));
    return { voltage: positive[train] - negative[train], railVoltage: negative[train], meters, stationA, stationB, returnA, returnB, current,
      leakage: Object.values(meters).reduce((total, meter) => total + meter.leakage, 0) };
  }

  function electrical(point, wheelDemand, generated, receiver) {
    const resistance = sourceVoltage - simulate({ ...point, current: 1 }).voltage;
    const desired = wheelDemand / vehicle.efficiency + vehicle.auxiliary - generated;
    let current;
    if (desired >= 0) {
      const limit = Math.min(vehicle.maxDraw, (sourceVoltage - vehicle.minVoltage) / resistance);
      const power = Math.min(desired, limit * (sourceVoltage - resistance * limit));
      current = 2 * power / (sourceVoltage + Math.sqrt(sourceVoltage ** 2 - 4 * resistance * power));
    } else {
      const accepted = receiver === "reversible" ? vehicle.stationAbsorbLimit / sourceVoltage : 0;
      const limit = Math.min(accepted, vehicle.maxRegen, (vehicle.maxVoltage - sourceVoltage) / resistance);
      const requested = (-2 * desired) / (sourceVoltage + Math.sqrt(sourceVoltage ** 2 - 4 * resistance * desired));
      current = limit ? -Math.min(limit, requested) : 0;
    }
    const result = simulate({ ...point, current });
    result.power = result.voltage * current;
    result.wheelPower = Math.max(0, result.power + generated - vehicle.auxiliary) * vehicle.efficiency;
    result.rheostat = generated ? Math.max(0, generated - vehicle.auxiliary + result.power) : 0;
    return result;
  }

  const runningResistance = speed => 3600 + 72 * speed + 18 * speed ** 2;
  function coastAndBrakeDistance(speed) {
    let metres = 0;
    for (let t = 0; t < coastSeconds; t++) {
      const nextSpeed = Math.max(0, speed - runningResistance(speed) / vehicle.mass);
      metres += (speed + nextSpeed) / 2;
      speed = nextSpeed;
    }
    return (metres + speed ** 2 / (2 * nominalDeceleration)) / 1000;
  }

  function makeRun(settings) {
    const samples = [];
    const stages = [];
    const target = settings.speed / 3.6;
    let speed = 0;
    let position = departure;
    let deceleration = nominalDeceleration;
    let phase = "ready";
    let phaseStart = 0;
    for (let index = 0; ; index++) {
      let next = phase;
      if (phase === "ready" && index >= 5) next = "traction";
      if (phase === "traction" && speed >= target - 1e-6) next = "cruise";
      if (phase === "cruise" && settings.stopKm - position <= coastAndBrakeDistance(speed) + speed / 2000) next = "coast";
      if (phase === "coast" && index - phaseStart >= coastSeconds) {
        next = "brake";
        // Match the remaining distance from the 1 s sampled coasting transition.
        deceleration = speed ** 2 / (2 * (settings.stopKm - position) * 1000);
      }
      if (phase === "brake" && speed <= 1e-6) next = "stopped";
      if (next !== phase || index === 0) {
        phase = next;
        phaseStart = index;
        stages.push({ phase, index });
      }
      const drag = runningResistance(speed);
      const ramp = Math.min(1, (index - phaseStart + 1) / 4);
      const force = phase === "traction"
        ? Math.min(vehicle.maxForce * ramp, vehicle.maxWheelPower / Math.max(0.01, speed), drag + vehicle.mass * Math.max(0, target - speed))
        : phase === "cruise" ? drag : 0;
      const brakeForce = phase === "brake" ? vehicle.mass * deceleration - drag : 0;
      const brakePower = brakeForce * speed;
      const lowSpeedBlend = Math.min(1, Math.max(0, (speed * 3.6 - 5) / 10));
      const generated = Math.min(vehicle.regenLimit, brakePower * vehicle.regenEfficiency * lowSpeedBlend);
      const point = { position, feed: settings.feed, zone: settings.zone };
      const fault = index >= injectionIndex ? settings.fault : "normal";
      const observed = electrical({ ...point, fault }, force * speed, generated, settings.receiver);
      const baseline = fault === "normal" ? observed : electrical({ ...point, fault: "normal" }, force * speed, generated, settings.receiver);
      const residuals = zones.map(({ id }) => ({
        id,
        leakage: observed.meters[id].leakage - baseline.meters[id].leakage,
        rail: observed.meters[id].measured - baseline.meters[id].measured,
      }));
      const largest = field => residuals.reduce((a, b) => Math.abs(a[field]) >= Math.abs(b[field]) ? a : b);
      const leakage = largest("leakage");
      const rail = largest("rail");
      const diagnosis = Math.abs(leakage.leakage) >= 3
        ? { type: "insulation", zone: leakage.id, residual: leakage.leakage }
        : Math.abs(rail.rail) >= 5 ? { type: "sensor", zone: rail.id, residual: rail.rail } : null;
      samples.push({ index, position, speed, phase, observed, baseline, diagnosis, generated, brakePower,
        friction: Math.max(0, brakePower - generated / vehicle.regenEfficiency) });
      if (phase === "stopped" && index - phaseStart >= 5) break;
      const effectiveForce = speed > 1e-6 ? Math.min(force, observed.wheelPower / speed) : force;
      const dt = phase === "brake" ? Math.min(1, speed / deceleration) : 1;
      const nextSpeed = Math.max(0, speed + (effectiveForce - drag - brakeForce) / vehicle.mass * dt);
      position += (speed + nextSpeed) * dt / 2000;
      speed = nextSpeed;
    }
    return { samples, stages, firstDetection: samples.find(sample => sample.diagnosis)?.index };
  }

  function time(index, full = false) {
    const minute = String(Math.floor(index / 60)).padStart(2, "0");
    const seconds = String(index % 60).padStart(2, "0");
    return full ? `+${minute}:${seconds}` : `${minute}:${seconds}`;
  }

  return { defaults, zones, injectionIndex, scenarioNames, phases, vehicle, stopRange, simulate, makeRun, time };
})();

if (typeof module !== "undefined") module.exports = TwinModel;
