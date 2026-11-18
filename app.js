"use strict";

const icons = {
  bolt: '<path d="m13 2-8 12h6l-1 8 9-12h-6l1-8Z"/>',
  overview: '<rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/>',
  layers: '<path d="m3 8 9-5 9 5-9 5-9-5Zm0 4 9 5 9-5M3 16l9 5 9-5"/>',
  flask: '<path d="M9 3h6M10 3v6l-5.3 8.5A2.2 2.2 0 0 0 6.6 21h10.8a2.2 2.2 0 0 0 1.9-3.5L14 9V3M7.5 14h9"/>',
  bell: '<path d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9m-8 12a2 2 0 0 0 4 0"/>',
  database: '<ellipse cx="12" cy="5" rx="8" ry="3"/><path d="M4 5v7c0 1.7 3.6 3 8 3s8-1.3 8-3V5M4 12v7c0 1.7 3.6 3 8 3s8-1.3 8-3v-7"/>',
  activity: '<path d="M2 12h5l3-8 4 16 3-8h5"/>',
  chevron: '<path d="m9 6 6 6-6 6"/>',
  arrow: '<path d="M4 12h15m-6-6 6 6-6 6"/>',
  upRight: '<path d="M7 17 17 7M7 7h10v10"/>',
  external: '<path d="M13 4h7v7m0-7-9 9m7 0v6H5V6h6"/>',
  menu: '<path d="M4 6h16M4 12h16M4 18h16"/>',
  train: '<rect x="5" y="3" width="14" height="15" rx="4"/><path d="M5 11h14M9 3v8m6-8v8M8 18l-2 3m10-3 2 3M9 15h.01M15 15h.01"/>',
  warning: '<path d="M10.3 4.9a2 2 0 0 1 3.4 0l7.2 12.2a2 2 0 0 1-1.7 3H4.8a2 2 0 0 1-1.7-3L10.3 4.9ZM12 9v4m0 3h.01"/>',
  terminal: '<path d="M4 21V7l8-4 8 4v14H4Zm5 0v-5h6v5M8 10h1m6 0h1"/>',
  pin: '<path d="M20 10c0 5-8 11-8 11S4 15 4 10a8 8 0 1 1 16 0Z"/><circle cx="12" cy="10" r="2.4"/>',
  pulse: '<path d="M4 20h16M5 15l5-6 4 4 6-8"/>',
  clock: '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>',
  play: '<path d="M8 5v14l11-7-11-7Z"/>',
  pause: '<path d="M9 5v14m6-14v14"/>',
  reset: '<path d="M4 11a8 8 0 1 1 2 6m-2-6V5m0 6h6"/>',
  focus: '<path d="M9 3H3v6m12-6h6v6m0 6v6h-6m-6 0H3v-6"/><circle cx="12" cy="12" r="3"/>',
  info: '<circle cx="12" cy="12" r="9"/><path d="M12 11v5m0-8h.01"/>',
  check: '<path d="m5 12 4 4L19 6"/>',
  close: '<path d="m6 6 12 12M18 6 6 18"/>',
  search: '<circle cx="10.5" cy="10.5" r="5.5"/><path d="m15 15 5 5"/>',
  track: '<path d="M3 9h18M3 15h18M6 6v12M12 6v12m6-12v12"/>',
  ground: '<path d="M12 3v10M4 13h16M7 17h10m-7 4h4"/>',
  settings: '<path d="M4 6h16M4 12h16M4 18h16"/><circle cx="8" cy="6" r="2"/><circle cx="15" cy="12" r="2"/><circle cx="10" cy="18" r="2"/>',
  file: '<path d="M6 3h8l4 4v14H6V3Zm8 0v5h4M9 12h6m-6 4h6"/>',
};

function icon(name, size = 20) {
  return `<svg aria-hidden="true" width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round">${icons[name]}</svg>`;
}

const viewLabels = { overview: "运行总览", assets: "资产台账", simulation: "仿真实验", events: "诊断事件", sources: "数据与模型" };
const assetList = [
  { id: "SS01", name: "西端牵引变电所", type: "牵引变电所", location: "K0+000", icon: "terminal" },
  { id: "SS02", name: "东端牵引变电所", type: "牵引变电所", location: "K12+000", icon: "terminal" },
  { id: "F01", name: "西端直流馈线", type: "直流馈线", location: "K0+000", icon: "bolt" },
  { id: "F02", name: "东端直流馈线", type: "直流馈线", location: "K12+000", icon: "bolt" },
  { id: "OC01", name: "区间接触网", type: "接触网", location: "K0+000 – K12+000", icon: "track" },
  ...TwinModel.zones.map(zone => ({ ...zone, type: "钢轨回流", location: `K${zone.from}+000 – K${zone.to}+000`, icon: "ground" })),
  { id: "T01", name: "列车 T01", type: "移动负荷", icon: "train" },
];

function loadAcknowledged() {
  try { return new Set(JSON.parse(localStorage.getItem("traction-twin-ack") || "[]")); }
  catch { return new Set(); }
}

const initialView = () => Object.hasOwn(viewLabels, location.hash.slice(1)) ? location.hash.slice(1) : "overview";
const state = {
  view: initialView(), settings: { ...TwinModel.defaults }, selected: "R02", layer: "power", expanded: false,
  sample: 0, playing: false, assetSearch: "", assetType: "all", eventFilter: "all",
  ack: loadAcknowledged(), openEvent: null, runGeneration: 0,
};
state.run = TwinModel.makeRun(state.settings);

const main = document.getElementById("main");
const dialog = document.getElementById("event-dialog");
const get = id => document.getElementById(id);
const asset = id => assetList.find(item => item.id === id);
const currentSample = () => state.run.samples[state.sample];
const zoneAsset = item => item.type === "钢轨回流";
const feedLabel = () => state.settings.feed === "both" ? "双边供电" : "西端单边供电";
const driveLabel = () => TwinModel.phases[currentSample().phase];
const lastSample = () => state.run.samples.length - 1;
const fmt = (number, digits = 1) => Number(number).toFixed(digits);
const signed = (number, digits = 1) => `${number >= 0 ? "+" : "−"}${fmt(Math.abs(number), digits)}`;
const km = position => `K${Math.floor(Math.round(position * 1000) / 1000)}+${String(Math.round(position * 1000) % 1000).padStart(3, "0")}`;
const activeStatus = id => state.settings.feed === "west" && ["SS02", "F02"].includes(id) ? "off" : currentSample().diagnosis?.zone === id ? "warn" : "ok";
const status = statusName => `<span class="status ${statusName}"><i></i>${{ warn: "需关注", ok: "正常", off: "退出供电" }[statusName]}</span>`;

function events() {
  const rows = [{ id: "started", index: 0, title: "仿真场景已初始化", location: `直流 750 V · ${feedLabel()}`, type: "info", icon: "check",
    detail: "建立两端变电所、接触网和钢轨回流的等效网络，并载入列车运行工况。" }];
  for (const { phase, index } of state.run.stages.slice(1)) {
    if (state.sample < index) break;
    const sample = state.run.samples[index];
    rows.unshift({ id: `phase-${phase}`, index, title: TwinModel.phases[phase], location: `T01 · ${km(sample.position)}`, type: "info", icon: "activity",
      detail: `阶段起点速度 ${fmt(sample.speed * 3.6)} km/h，列车网侧功率 ${signed(sample.observed.power / 1000)} kW，网侧电流 ${signed(sample.observed.current, 0)} A。` });
  }
  const at = state.run.firstDetection;
  if (at !== undefined && state.sample >= at) {
    const detection = state.run.samples[at].diagnosis;
    const insulation = detection.type === "insulation";
    rows.unshift({ id: `alarm-${state.runGeneration}-${detection.type}-${detection.zone}`, index: at,
      title: insulation ? "轨地绝缘下降线索" : "轨电位测点偏置线索", location: `${detection.zone} · ${asset(detection.zone).name}`, type: "warn", icon: "warning",
      detail: insulation ? "同工况基线比较发现漏流偏差达到演示阈值。该回流区段列为候选范围，可结合相邻轨电位及现场绝缘测量复核。" : "轨电位读数与基线的偏差达到演示阈值，漏流残差低于门限。该测点列为复核对象。",
      signal: insulation ? "分区漏流残差" : "轨电位残差", value: `${signed(detection.residual)} ${insulation ? "A" : "V"}`,
      limit: insulation ? "绝对值 ≥ 3 A" : "绝对值 ≥ 5 V", asset: detection.zone });
  }
  return rows.sort((a, b) => b.index - a.index);
}

function pageHeading(title, summary, actions = "") {
  return `<div class="page-heading"><div class="heading-copy"><h1>${title}</h1><p>${summary}</p></div>${actions ? `<div class="page-actions">${actions}</div>` : ""}</div>`;
}

function overview() {
  return `${pageHeading("牵引供电数字孪生", "示例区间 A · 城轨直流牵引供电状态监测", `<button type="button" class="button secondary playback-toggle" data-action="play"></button><a class="button primary" href="#simulation">${icon("flask", 17)}设置仿真工况</a>`)}
    <section class="kpi-grid" id="kpi-grid" aria-label="运行指标"></section>
    <section class="card phase-card" aria-label="列车运行阶段"><div class="phase-title"><strong>T01 运行阶段</strong><small>点击阶段查看数据</small></div><div id="phase-strip" class="phase-strip"></div></section>
    <div class="dashboard-grid dashboard-top">
      <section class="card topology-card" id="topology-card" aria-labelledby="topology-heading">
        <div class="card-head topology-head"><div><h2 id="topology-heading">供电网络拓扑</h2><p>示例区间 A <span class="text-dot">·</span> <span id="feed-caption"></span></p></div>
        <div class="map-actions"><div class="segment-control" role="group" aria-label="拓扑图层"><button type="button" data-layer="power">供电</button><button type="button" data-layer="return">回流</button></div><button class="icon-button outline" type="button" data-action="expand" aria-label="放大拓扑" aria-pressed="false">${icon("focus", 17)}</button></div></div>
        <div class="topology-map" id="topology-map"></div>
        <div class="map-footer"><div class="map-legend"><span><i class="legend-power"></i>接触网</span><span><i class="legend-return"></i>钢轨回流</span><span><i class="legend-meter"></i>轨电位测点</span><span><i class="legend-alert"></i>异常区段</span></div><span class="map-length"><strong>12.0 km</strong> · 设备放大示意</span><span class="map-scroll-hint">横滑查看全线</span></div>
      </section>
      <section class="card asset-card" id="inspector" aria-label="资产详情"></section>
    </div>
    <div class="dashboard-bottom">
      <section class="card trend-card" aria-labelledby="trend-heading">
        <div class="card-head trend-head"><div><h2 id="trend-heading">监测趋势</h2><p>全程 ${TwinModel.time(lastSample())} · 曲线随回放同步定位</p></div><div class="chart-legend"><span><i></i>仿真值</span><span><i></i>同工况基线</span></div></div>
        <div class="playback-controls"><button class="icon-button outline" type="button" data-action="reset" aria-label="回到仿真起点" title="回到仿真起点">${icon("reset", 16)}</button><button class="icon-button outline playback-toggle" type="button" data-action="play" data-compact="true"></button><label class="sr-only" for="timeline">仿真时间</label><input type="range" min="0" max="${lastSample()}" id="timeline"><output id="clock" for="timeline"></output></div>
        <div class="trace-summary" id="trace-summary"></div><div class="trend-grid" id="trend"></div>
      </section>
      <section class="card recent-card" aria-labelledby="recent-heading"><div class="card-head"><div><h2 id="recent-heading">诊断事件</h2><p>仿真记录 · 按时间排序</p></div><a class="text-button" href="#events">全部事件 ${icon("arrow", 15)}</a></div><div id="recent"></div></section>
    </div>`;
}

function kpis() {
  const p = currentSample();
  const pending = events().find(row => row.type === "warn" && !state.ack.has(row.id));
  const values = [
    { title: "列车速度", icon: "train", color: "blue", value: fmt(p.speed * 3.6), unit: "km/h", note: driveLabel(), sub: km(p.position) },
    { title: "列车网侧功率", icon: "bolt", color: "violet", value: fmt(p.observed.power / 1000, 0), unit: "kW", note: p.observed.power < 0 ? "向网回馈" : p.observed.power > 0 ? "从网取电" : "无网侧交换", sub: `端电压 ${fmt(p.observed.voltage, 0)} V` },
    { title: "列车网侧电流", icon: "activity", color: "teal", value: fmt(p.observed.current, 0), unit: "A", note: feedLabel(), sub: "正取电 · 负回馈" },
    { title: "待确认告警", icon: "warning", color: pending ? "amber" : "teal", value: pending ? "01" : "00", unit: "条", note: pending ? "需复核" : "无待办", sub: pending ? pending.location : "仿真事件" },
  ];
  get("kpi-grid").innerHTML = values.map(item => `<article class="card kpi"><div class="kpi-head"><span>${item.title}</span><span class="metric-icon ${item.color}">${icon(item.icon, 18)}</span></div><div class="kpi-value">${item.value}<small>${item.unit}</small></div><div class="kpi-foot"><span class="kpi-tag ${item.color}">${item.note}</span><span>${item.sub}</span></div></article>`).join("");
}

function phaseStrip() {
  const strip = get("phase-strip");
  if (!strip.childElementCount) strip.innerHTML = state.run.stages.map(({ phase, index }) => `<button type="button" data-phase-index="${index}" data-phase="${phase}"><span>${TwinModel.phases[phase]}</span><small>${TwinModel.time(index, true)}</small></button>`).join("");
  Array.from(strip.children).forEach(button => button.setAttribute("aria-current", button.dataset.phase === currentSample().phase ? "step" : "false"));
}

function traceSummary() {
  const root = get("trace-summary");
  if (root.childElementCount) return;
  const samples = state.run.samples;
  const peak = samples.filter(sample => sample.phase === "traction").reduce((a, b) => b.observed.current > a.observed.current ? b : a);
  const brake = samples.filter(sample => sample.phase === "brake");
  const exportPeak = brake.reduce((a, b) => b.observed.power < a.observed.power ? b : a);
  root.innerHTML = `<button type="button" data-phase-index="${peak.index}">启动峰值电流 <strong>${fmt(peak.observed.current, 0)} A</strong></button><button type="button" data-phase-index="${exportPeak.index}">${exportPeak.observed.power < 0 ? "制动最大回馈" : "制动无网侧回馈"} <strong>${fmt(Math.max(0, -exportPeak.observed.power) / 1000, 0)} kW</strong></button>`;
}

function svgAsset(id, decoration, shapes) {
  const item = asset(id);
  return `<g class="map-asset ${decoration}${state.selected === id ? " is-selected" : ""}" tabindex="0" role="button" aria-label="查看${item.name}" aria-pressed="${state.selected === id}" data-asset="${id}">${shapes}</g>`;
}

function topology() {
  const p = currentSample();
  const scene = TopologyScene;
  const { left, right, wireY, railY, xAt } = scene;
  const trainX = xAt(p.position);
  const off = state.settings.feed === "west";
  const railLayer = state.layer === "return";
  const currentZone = p.diagnosis?.zone;
  const zoneBands = TwinModel.zones.map((zone, index) => {
    const alert = currentZone === zone.id;
    const reading = railLayer ? `${fmt(p.observed.meters[zone.id].measured)} V` : "";
    return svgAsset(zone.id, `zone ${alert ? "zone-alert" : ""}`,
      scene.zone(zone.from, zone.to, `${zone.id} ${["西段", "中段", "东段"][index]}`, alert, reading));
  }).join("");
  const arrow = (x, y, direction) => direction ? `<path d="M-6 -4 0 0-6 4m9-8 6 4-6 4" transform="translate(${x},${y}) scale(${direction},1)"/>` : "";
  const direction = Math.sign(p.observed.current);
  const westMid = (trainX + left) / 2;
  const eastMid = (trainX + right) / 2;
  const powerArrows = `<g class="flow-arrows">${arrow(westMid, wireY, direction)}${off ? "" : arrow(eastMid, wireY, -direction)}</g>`;
  const returnArrows = railLayer ? `<g class="return-arrows">${arrow(westMid, railY, -Math.sign(p.observed.returnA))}${arrow(eastMid, railY, Math.sign(p.observed.returnB))}</g>` : "";
  const station = (id, x, amps, isOff, flip) => svgAsset(id, `station ${isOff ? "map-off" : ""}`,
    scene.station(x, asset(id).name, `${id} · ${isOff ? "退出供电" : `${fmt(amps, 0)} A`}`, flip));
  const feeder = (id, x, isOff, flip) => svgAsset(id, `feeder ${isOff ? "map-off" : ""}`, scene.feeder(x, id, isOff, flip));
  const railPath = `M${left - 3} 198v60H${right - 3}${off ? "" : "v-60"}`;
  const train = svgAsset("T01", "map-train", scene.train(trainX, `T01 · ${km(p.position)} · ${fmt(p.speed * 3.6, 0)} km/h`));
  get("feed-caption").textContent = `${feedLabel()} · 停车目标 ${km(state.settings.stopKm)}`;
  document.querySelectorAll("[data-layer]").forEach(button => button.setAttribute("aria-pressed", button.dataset.layer === state.layer));
  const expand = document.querySelector('[data-action="expand"]');
  expand.setAttribute("aria-pressed", state.expanded);
  expand.setAttribute("aria-label", state.expanded ? "退出放大拓扑" : "放大拓扑");
  get("topology-card").classList.toggle("expanded", state.expanded);
  const map = get("topology-map");
  const focusedAsset = map.contains(document.activeElement) ? document.activeElement.dataset.asset : null;
  if (!map.firstElementChild) {
    const ticks = Array.from({ length: 13 }, (_, i) => `<path d="M${xAt(i)} 341v${i % 2 ? 3 : 5}"/>${i % 2 ? "" : `<text x="${xAt(i)}" y="359" text-anchor="middle">K${i}</text>`}`).join("");
    map.innerHTML = `<svg class="schematic" viewBox="0 0 960 366" aria-label="K0 至 K12 直流牵引供电与回流场景示意图">
      ${scene.definitions}${scene.backdrop}<g class="scene-supports" aria-hidden="true">${scene.supports}</g>
      <rect class="map-caption" x="17" y="12" width="148" height="24" rx="6"/><text class="map-overline" x="28" y="28" data-map-mode></text>
      <rect class="map-caption" x="819" y="12" width="124" height="24" rx="6"/><circle cx="832" cy="24" r="3" fill="#83e1c6"/><text class="map-overline map-time" x="843" y="28" data-map-time></text>
      <g data-map-assets></g><g class="distance-scale"><path d="M${left} 341H${right}"/>${ticks}</g>
    </svg>`;
  }
  const svg = map.firstElementChild;
  svg.classList.toggle("return-view", railLayer);
  svg.querySelector("[data-map-mode]").textContent = railLayer ? "钢轨回流图层" : "直流 750 V · 供电图层";
  svg.querySelector("[data-map-time]").textContent = `T = ${TwinModel.time(p.index, true)}`;
  const overhead = `M${left} ${wireY}H${right}`;
  svg.querySelector("[data-map-assets]").innerHTML = `<path class="rail-base" d="${railPath}"/>
    ${zoneBands}${returnArrows}
    ${svgAsset("OC01", "overhead", `<path class="hit-line" d="${overhead}"/><path class="wire wire-glow" d="${overhead}"/><path class="wire" d="${overhead}"/>`)}${powerArrows}
    ${station("SS01", left, p.observed.stationA, false, false)}${station("SS02", right, p.observed.stationB, off, true)}
    ${feeder("F01", left, false, false)}${feeder("F02", right, off, true)}${train}`;
  if (focusedAsset) map.querySelector(`[data-asset="${focusedAsset}"]`)?.focus({ preventScroll: true });
}

function inspector() {
  const item = asset(state.selected);
  const p = currentSample();
  const observed = p.observed;
  const reference = p.baseline;
  const alert = events().find(e => e.asset === item.id);
  let readings;
  let context;
  if (zoneAsset(item)) {
    const meter = observed.meters[item.id];
    const expected = reference.meters[item.id];
    readings = [["轨电位", fmt(meter.measured), "V"], ["分区漏流", fmt(meter.leakage), "A"], ["等效轨地电阻", fmt(meter.resistance, 2), "Ω"], ["漏流残差", signed(meter.leakage - expected.leakage), "A"]];
    context = alert ? `首次触发时，${alert.signal}为 ${alert.value}。` : "同工况基线比较未触发该区段的演示告警。";
  } else if (item.id === "T01" || item.id === "OC01") {
    readings = [["轮上牵引功率", fmt(observed.wheelPower / 1000, 0), "kW"], ["轮上制动功率", fmt(p.brakePower / 1000, 0), "kW"], ["制动电阻功率", fmt(observed.rheostat / 1000, 0), "kW"], ["摩擦制动功率", fmt(p.friction / 1000, 0), "kW"]];
    context = p.phase === "brake" ? `电制动发电 ${fmt(p.generated / 1000, 0)} kW。优先供给车载辅助负荷，其余按接收限值回馈，剩余由制动电阻消耗。` : `${driveLabel()} · 车载辅助负荷 ${TwinModel.vehicle.auxiliary / 1000} kW。网侧电流是接触网输入电流。`;
  } else {
    const west = item.id === "F01" || item.id === "SS01";
    const offline = activeStatus(item.id) === "off";
    readings = [["源端电压", offline ? "—" : "780", offline ? "" : "V"], ["馈电电流", fmt(west ? observed.stationA : observed.stationB, 0), "A"], ["回所电流", fmt(west ? observed.returnA : observed.returnB, 0), "A"], ["额定电压", "750", "V"]];
    context = offline ? "当前场景由西端变电所单独供电。" : `${feedLabel()} · ${driveLabel()}。负电流表示再生能量回送。`;
  }
  const info = item.location || km(p.position);
  get("inspector").innerHTML = `<div class="card-head asset-head"><h2>资产详情</h2><span class="asset-code">${item.id}</span></div>
    <div class="asset-content"><div class="asset-identity"><span class="asset-symbol ${activeStatus(item.id) === "warn" ? "amber" : "blue"}">${icon(item.icon, 22)}</span><div><h3>${item.name}</h3><p>${item.type}</p></div>${status(activeStatus(item.id))}</div>
    <div class="asset-location">${icon("pin", 14)}<span>${info}</span></div>
    <div class="readings">${readings.map(([label, value, unit]) => `<div><span>${label}</span><strong>${value}${unit ? `<small>${unit}</small>` : ""}</strong></div>`).join("")}</div>
    <div class="inspector-note ${alert ? "attention" : ""}">${icon(alert ? "warning" : "info", 16)}<div><strong>${alert ? (alert.signal === "轨电位残差" ? "测点需复核" : "绝缘状态异常线索") : "当前工况"}</strong><p>${context}</p></div></div>
    ${alert ? `<button class="text-button inspector-link" type="button" data-event="${alert.id}">查看诊断证据 ${icon("arrow", 15)}</button>` : `<a class="text-button inspector-link" href="#assets">查看资产台账 ${icon("arrow", 15)}</a>`}</div>`;
}

function buildTrend({ name, unit, id, read, compare = true, includeZero = true, annotation }) {
  const samples = state.run.samples;
  const measured = samples.map(p => read(p.observed, p));
  const baseline = compare ? samples.map(p => read(p.baseline, p)) : [];
  const min = Math.min(...measured, ...baseline);
  const rawMin = includeZero ? Math.min(0, min) : min;
  const rawMax = Math.max(...measured, ...baseline);
  const gap = Math.max((rawMax - rawMin) * 1.15, 2) / 4;
  const scale = 10 ** Math.floor(Math.log10(gap));
  const step = ([1, 2, 2.5, 5, 10].find(value => value >= gap / scale) || 10) * scale;
  const lower = Math.floor((rawMin - (step * 0.15)) / step) * step;
  const upper = Math.ceil((rawMax + (step * 0.15)) / step) * step;
  const top = 10, bottom = 101, left = 42, right = 330;
  const x = index => left + index * ((right - left) / (samples.length - 1));
  const y = value => bottom - (value - lower) * (bottom - top) / (upper - lower);
  const path = array => array.map((value, index) => `${index ? "L" : "M"}${x(index).toFixed(1)},${y(value).toFixed(1)}`).join(" ");
  const grid = Array.from({ length: Math.round((upper - lower) / step) + 1 }, (_, i) => {
    const value = lower + i * step;
    return `<path class="${value === 0 ? "zero-line" : ""}" d="M${left},${y(value)}H${right}"/><text x="${left - 6}" y="${y(value) + 3}" text-anchor="end">${Number(value.toFixed(2))}</text>`;
  }).join("");
  const labels = Array.from({ length: 5 }, (_, i) => Math.round(i * lastSample() / 4)).map(index => `<text x="${x(index)}" y="118" text-anchor="middle">${TwinModel.time(index)}</text>`).join("");
  const stageBands = state.run.stages.map(({ phase, index }, i) => {
    const end = state.run.stages[i + 1]?.index ?? lastSample();
    const fill = phase === "traction" ? "#a7adf22e" : phase === "brake" ? "#8ad9ca44" : "none";
    return `<rect x="${x(index)}" y="${top}" width="${x(end) - x(index)}" height="${bottom - top}" fill="${fill}"/>`;
  }).join("");
  const markup = `<section class="trend-panel"><div class="trend-panel-head"><div><h3>${name}</h3><small>${id}</small></div><div class="trend-reading"><strong data-reading></strong> <span>${unit}</span></div></div>
    <svg class="chart" viewBox="0 0 350 126" role="img"><title></title>${stageBands}<g class="chart-grid">${grid}${labels}</g>
    <path class="measured-line" d="${path(measured)}"/>${compare ? `<path class="baseline-line" d="${path(baseline)}"/>` : ""}
    ${annotation !== undefined ? `<path stroke="#c17a33" stroke-dasharray="3 4" d="M${x(annotation)},${top}V${bottom}"/>` : ""}
    <line class="chart-cursor" y1="${top}" y2="${bottom}"/><circle class="chart-point" r="3.5"/></svg></section>`;
  return { markup, name, unit, measured, baseline, x, y };
}

let trendView;
function plot() {
  const root = get("trend");
  const zone = zoneAsset(asset(state.selected)) ? state.selected : state.settings.zone;
  if (trendView?.root !== root || trendView.run !== state.run || trendView.zone !== zone) {
    const firstDetection = state.run.firstDetection;
    const annotation = state.run.samples[firstDetection]?.diagnosis.zone === zone ? firstDetection : undefined;
    const charts = [
      { name: "列车网侧功率", unit: "kW", id: "T01", read: side => side.power / 1000 },
      { name: "列车网侧电流", unit: "A", id: "T01", read: side => side.current },
      { name: "运行速度", unit: "km/h", id: "T01", read: (_side, sample) => sample.speed * 3.6, compare: false },
      { name: "列车端电压", unit: "V", id: "T01", read: side => side.voltage, includeZero: false },
      { name: "分区漏流", unit: "A", id: zone, read: side => side.meters[zone].leakage, annotation },
      { name: "轨电位", unit: "V", id: zone, read: side => side.meters[zone].measured, annotation },
    ].map(buildTrend);
    root.innerHTML = charts.map(chart => chart.markup).join("");
    const panels = root.children;
    const views = charts.map((chart, index) => {
      const panel = panels[index];
      return { ...chart, reading: panel.querySelector("[data-reading]"), title: panel.querySelector("title"),
        cursor: panel.querySelector(".chart-cursor"), point: panel.querySelector(".chart-point") };
    });
    trendView = { root, run: state.run, zone, views };
  }
  const horizon = state.sample;
  const time = TwinModel.time(horizon, true);
  for (const chart of trendView.views) {
    const value = chart.measured[horizon];
    const x = chart.x(horizon);
    chart.reading.textContent = fmt(value);
    const baseline = chart.baseline[horizon];
    chart.title.textContent = `${chart.name} · ${time} · ${fmt(value)} ${chart.unit}${baseline === undefined ? "" : ` · 基线 ${fmt(baseline)} ${chart.unit}`}`;
    chart.cursor.setAttribute("x1", x);
    chart.cursor.setAttribute("x2", x);
    chart.point.setAttribute("cx", x);
    chart.point.setAttribute("cy", chart.y(value));
  }
  get("timeline").value = horizon;
  get("timeline").setAttribute("aria-valuetext", time);
  get("clock").textContent = time;
}

function eventIcon(row) {
  return `<span class="event-icon ${row.type === "warn" ? "amber" : "blue"}">${icon(row.icon, 17)}</span>`;
}

function recent() {
  const rows = events();
  const latest = rows.slice(0, 3);
  const alarm = rows.find(row => row.type === "warn");
  if (alarm && !latest.includes(alarm)) latest[2] = alarm;
  get("recent").innerHTML = latest.map(row => `<button type="button" class="event-row" data-event="${row.id}">${eventIcon(row)}<span class="event-meta"><strong>${row.title}</strong><small>${row.location}</small></span><span class="event-time"><time>${TwinModel.time(row.index, true)}</time>${row.type === "warn" ? `<span class="event-state ${state.ack.has(row.id) ? "ack" : ""}">${state.ack.has(row.id) ? "已确认" : "待确认"}</span>` : ""}</span></button>`).join("");
}

function assetPage() {
  const options = [...new Set(assetList.map(item => item.type))];
  return `${pageHeading("资产台账", "按资产编码和位置查找供电设备、区段和移动负荷。", `<a class="button secondary" href="#overview">${icon("overview", 17)}查看拓扑</a>`)}
    <section class="card data-card"><div class="card-head"><div><h2>区间资产</h2><p id="asset-count"></p></div><div class="filters"><label class="search-field">${icon("search", 17)}<input type="search" id="asset-search" aria-label="搜索资产" placeholder="搜索名称、编码或里程" autocomplete="off"></label><select id="asset-type" aria-label="资产类型"><option value="all">全部资产类型</option>${options.map(type => `<option value="${type}">${type}</option>`).join("")}</select></div></div><div id="asset-results" class="table-scroll"></div></section>`;
}

function assetResults() {
  const position = currentSample().position;
  const keyword = state.assetSearch.trim().toLowerCase();
  const rows = assetList.filter(item => (state.assetType === "all" || item.type === state.assetType) && [item.id, item.name, item.location || km(position)].some(value => value.toLowerCase().includes(keyword)));
  get("asset-count").textContent = `${rows.length} 项资产 · 示例区间 A`;
  get("asset-results").innerHTML = rows.length ? `<table><thead><tr><th scope="col">资产名称</th><th scope="col">类型</th><th scope="col">里程</th><th scope="col">当前状态</th><th scope="col"><span class="sr-only">操作</span></th></tr></thead><tbody>${rows.map(item => `<tr><td><div class="table-asset"><span class="metric-icon blue">${icon(item.icon, 17)}</span><span><strong>${item.name}</strong><small>${item.id}</small></span></div></td><td>${item.type}</td><td class="mono">${item.location || km(position)}</td><td>${status(activeStatus(item.id))}</td><td><button type="button" class="text-button" data-asset="${item.id}">定位 ${icon("arrow", 15)}</button></td></tr>`).join("")}</tbody></table>` : `<div class="empty">${icon("search", 24)}<p>没有匹配的资产</p></div>`;
}

function simulationPage() {
  const fields = state.settings;
  const options = (list, value) => list.map(([key, name]) => `<option value="${key}"${key === value ? " selected" : ""}>${name}</option>`).join("");
  return `${pageHeading("仿真实验", "配置一次从发车到停车的过程，比较不同供电和再生接收条件下的功率与电流。")}
    <div class="dashboard-grid experiment-grid"><form id="experiment-form" class="card data-card experiment-form"><div class="card-head"><div><h2>工况参数</h2><p>直流 750 V · 示例区间 A · 12.0 km</p></div><span class="metric-icon blue">${icon("settings", 19)}</span></div>
    <div class="form-body"><div class="form-grid"><label>供电方式<select name="feed">${options([["both", "双边供电"], ["west", "西端单边供电"]], fields.feed)}</select></label><label>再生能量接收<select name="receiver">${options([["reversible", "可逆变电所（全网 450 kW）"], ["none", "普通整流所（无其他受电负荷）"]], fields.receiver)}</select></label>
    <label>巡航目标速度（km/h）<input type="number" name="speed" required min="40" max="80" step="5" value="${fields.speed}"></label><label>停车里程（km）<input type="number" name="stopKm" required min="${TwinModel.stopRange.min}" max="${TwinModel.stopRange.max}" step="${TwinModel.stopRange.step}" value="${fields.stopKm}"></label>
    <label>扰动场景<select name="fault">${options(Object.entries(TwinModel.scenarioNames), fields.fault)}</select></label><label>扰动注入区段<select name="zone">${options(TwinModel.zones.map(z => [z.id, `${z.id} · ${z.name}`]), fields.zone)}</select></label></div>
    <div class="form-footer"><button type="button" class="button secondary" data-action="defaults">恢复默认参数</button><button type="submit" class="button primary">${icon("play", 17)}运行仿真</button></div></div></form>
    <section class="card data-card run-summary"><div class="card-head"><div><h2>实验流程</h2><p>K1+500 发车 · 步长 1 秒 · 停车后记录 5 秒</p></div><span class="metric-icon teal">${icon("activity", 18)}</span></div><div class="experiment-steps"><div><b>1</b><span><strong>启动并巡航</strong><small>牵引力逐步建立，按轮上功率、电流与端电压限值加速。到设定速度后巡航。</small></span></div><div><b>2</b><span><strong>惰行并定点停车</strong><small>按剩余里程提前结束巡航，惰行 35 秒后制动到目标位置。</small></span></div><div><b>3</b><span><strong>比较观测与健康基线</strong><small>扰动从 +00:25 起注入。使用同位置、速度和控制指令计算健康基线。</small></span></div></div><a class="text-button source-link" href="#sources">查看模型与限值 ${icon("arrow", 16)}</a></section></div>`;
}

function eventsPage() {
  return `${pageHeading("诊断事件", "回看仿真过程中的事件，并查看告警触发时的测量证据。")}
    <section class="card data-card"><div class="card-head"><div><h2>事件记录</h2><p id="event-count"></p></div><select id="event-filter" aria-label="事件状态"><option value="all">全部事件</option><option value="pending">待确认告警</option><option value="ack">已确认告警</option><option value="info">工况记录</option></select></div><div id="event-results" class="table-scroll"></div></section>`;
}

function eventResults() {
  const rows = events().filter(row => state.eventFilter === "all" || (state.eventFilter === "info" ? row.type === "info" : row.type === "warn" && (state.eventFilter === "ack") === state.ack.has(row.id)));
  get("event-count").textContent = `${rows.length} 条记录 · 示例区间 A`;
  get("event-results").innerHTML = rows.length ? `<table><thead><tr><th scope="col">事件</th><th scope="col">发生时间</th><th scope="col">对象</th><th scope="col">状态</th><th scope="col"><span class="sr-only">操作</span></th></tr></thead><tbody>${rows.map(row => `<tr><td><div class="table-asset">${eventIcon(row)}<strong>${row.title}</strong></div></td><td class="mono">${TwinModel.time(row.index, true)}</td><td>${row.location}</td><td>${row.type === "warn" ? `<span class="status ${state.ack.has(row.id) ? "ok" : "warn"}"><i></i>${state.ack.has(row.id) ? "已确认" : "待确认"}</span>` : "仿真记录"}</td><td><button type="button" class="text-button" data-event="${row.id}">查看 ${icon("arrow", 15)}</button></td></tr>`).join("")}</tbody></table>` : `<div class="empty">${icon("bell", 24)}<p>当前筛选条件下没有记录</p></div>`;
}

function sourcesPage() {
  return `${pageHeading("数据与模型", "示例资产与监测量均由本地仿真生成，用于验证拓扑、资产和诊断的联动。")}
    <div class="dashboard-grid experiment-grid"><section class="card data-card"><div class="card-head"><div><h2>直流牵引等效电路</h2><p>集中参数稳态模型</p></div><span class="metric-icon blue">${icon("bolt", 19)}</span></div><dl class="technical-list"><div><dt>网络与边界</dt><dd>12 km 单区间。供电端为 780 V 理想电源，所端钢轨回流电位固定为 0 V。单边供电时东端边界开路。</dd></div><div><dt>线路及负荷</dt><dd>接触网 0.022 Ω/km、钢轨 0.018 Ω/km。根据列车端压与网侧功率联立求解电流（P = UI），正值取电，负值回馈。</dd></div><div><dt>车辆与启动</dt><dd>170 t，牵引力上限 165 kN，轮上牵引功率上限 950 kW。牵引力逐步建立，轮上功率为力 × 速度。牵引效率 90%，网侧先供 35 kW 辅助负荷，取电上限 1400 A，端压降至 550 V 时削减牵引功率。</dd></div><div><dt>制动与能量分配</dt><dd>按 0.9 m/s² 估算制动距离，再根据剩余里程微调减速度。电制动发电上限 850 kW，效率 85%，15–5 km/h 逐渐退出。发电先供车载辅助负荷。可逆模式下变电所合计最多吸收 450 kW，列车端压上限 900 V、回馈电流上限 900 A。剩余电能由制动电阻耗散，剩余制动力由摩擦制动补足。</dd></div><div><dt>扰动参数</dt><dd>正常轨地支路 6.25 Ω。绝缘场景将目标区段的支路降至 0.80 Ω。测点偏置场景只在读数上增加 8 V。</dd></div><div><dt>诊断阈值</dt><dd>按同工况基线计算残差。漏流残差绝对值 ≥ 3 A 时提示复核绝缘；轨电位残差绝对值 ≥ 5 V 时提示复核测点。阈值为演示参数。</dd></div><div><dt>应用范围</dt><dd>示例参数用于整车纵向与直流网络稳态联算。车载电机相电流、变流器瞬态、坡度和其他列车的动态用电需引入对应模型与数据。</dd></div></dl></section>
    <section class="card data-card"><div class="card-head"><div><h2>设计依据</h2><p>调研、直流牵引建模与接触网数据</p></div><span class="metric-icon teal">${icon("file", 18)}</span></div>
    <div class="source-links"><a href="https://www.mdpi.com/1996-1073/11/11/3211" target="_blank" rel="noopener noreferrer"><span><strong>直流铁路多列车电气建模</strong><small>普通整流所、再生接收与车载制动电阻</small></span>${icon("external", 17)}</a><a href="https://github.com/Light-ZhangTao/Insulator-Defect-Detection" target="_blank" rel="noopener noreferrer"><span><strong>CID 绝缘子数据</strong><small>接触网缺陷检测的数据入口</small></span>${icon("external", 17)}</a><a href="https://doi.org/10.1038/s41597-024-02918-9" target="_blank" rel="noopener noreferrer"><span><strong>RailFOD23</strong><small>铁路供电线路异物图像数据</small></span>${icon("external", 17)}</a></div></section></div>`;
}

function playbackButtons() {
  document.querySelectorAll(".playback-toggle").forEach(button => {
    const label = state.playing ? "暂停回放" : "播放仿真";
    button.setAttribute("aria-label", label);
    button.title = label;
    button.innerHTML = icon(state.playing ? "pause" : "play", 17) + (button.dataset.compact ? "" : label);
  });
}

function updateIndicators() {
  const alerts = events().filter(row => row.type === "warn" && !state.ack.has(row.id)).length;
  get("nav-count").hidden = !alerts;
  get("nav-count").textContent = alerts;
  get("bell-dot").hidden = !alerts;
}

function updateOverview() {
  kpis();
  phaseStrip();
  topology();
  inspector();
  plot();
  traceSummary();
  recent();
  playbackButtons();
  updateIndicators();
}

function render() {
  get("breadcrumb").textContent = viewLabels[state.view];
  document.querySelectorAll("[data-view]").forEach(link => {
    if (link.dataset.view === state.view) link.setAttribute("aria-current", "page");
    else link.removeAttribute("aria-current");
  });
  const pages = { overview, assets: assetPage, simulation: simulationPage, events: eventsPage, sources: sourcesPage };
  main.innerHTML = pages[state.view]();
  if (state.view === "overview") updateOverview();
  if (state.view === "assets") {
    get("asset-search").value = state.assetSearch;
    get("asset-type").value = state.assetType;
    assetResults();
  }
  if (state.view === "events") {
    get("event-filter").value = state.eventFilter;
    eventResults();
  }
  updateIndicators();
}

function openEvent(id) {
  const row = events().find(e => e.id === id);
  if (!row) return;
  stopPlayback();
  state.openEvent = id;
  const ack = state.ack.has(id);
  dialog.innerHTML = `<div class="dialog-head">${eventIcon(row)}<div><h2 id="dialog-heading">${row.title}</h2><p>${row.location} · ${TwinModel.time(row.index, true)}</p></div><button type="button" class="icon-button" data-action="close-event" aria-label="关闭">${icon("close", 20)}</button></div><div class="dialog-body"><p>${row.detail}</p>${row.signal ? `<div class="dialog-evidence"><div><span>触发信号</span><strong>${row.signal}</strong></div><div><span>首次触发残差</span><strong>${row.value}</strong></div><div><span>演示阈值</span><strong>${row.limit}</strong></div></div>` : ""}</div><div class="dialog-actions">${row.asset ? `<button type="button" class="button secondary" data-asset="${row.asset}">定位区段</button><button type="button" class="button primary" data-action="ack" ${ack ? "disabled" : ""}>${icon("check", 17)}${ack ? "已确认" : "确认告警"}</button>` : '<button type="button" class="button secondary" data-action="close-event">关闭</button>'}</div>`;
  if (!dialog.open) dialog.showModal();
}

let timer;
let toastTimer;
function stopPlayback() {
  clearInterval(timer);
  state.playing = false;
  playbackButtons();
}

function setSample(index) {
  state.sample = index;
  if (state.view === "overview") updateOverview();
}

function togglePlayback() {
  if (state.playing) {
    stopPlayback();
    return;
  }
  state.playing = true;
  if (state.sample === lastSample()) setSample(0);
  playbackButtons();
  timer = setInterval(() => {
    setSample(Math.min(lastSample(), state.sample + 3));
    if (state.sample === lastSample()) stopPlayback();
  }, 100);
}

function toast(message) {
  clearTimeout(toastTimer);
  get("toast").textContent = message;
  get("toast").hidden = false;
  toastTimer = setTimeout(() => { get("toast").hidden = true; }, 3500);
}

function closeMenu() {
  document.body.classList.remove("menu-open");
  get("mobile-menu").setAttribute("aria-expanded", "false");
}

function selectAsset(id) {
  if (!asset(id)) return;
  state.selected = id;
  if (dialog.open) dialog.close();
  if (state.view === "overview") updateOverview();
  else location.hash = "overview";
}

document.addEventListener("click", event => {
  const target = event.target.closest("[data-action], [data-asset], [data-layer], [data-event], [data-open-view], [data-phase-index], #mobile-menu");
  if (!target) return;
  if (target.id === "mobile-menu") {
    target.setAttribute("aria-expanded", document.body.classList.toggle("menu-open"));
    return;
  }
  if (target.dataset.asset) selectAsset(target.dataset.asset);
  if (target.dataset.phaseIndex !== undefined) {
    stopPlayback();
    setSample(Number(target.dataset.phaseIndex));
  }
  if (target.dataset.event) openEvent(target.dataset.event);
  if (target.dataset.openView) location.hash = target.dataset.openView;
  if (target.dataset.layer) {
    state.layer = target.dataset.layer;
    topology();
  }
  switch (target.dataset.action) {
    case "play": togglePlayback(); break;
    case "reset": stopPlayback(); setSample(0); break;
    case "expand": state.expanded = !state.expanded; topology(); break;
    case "close-event": dialog.close(); break;
    case "defaults": {
      const form = get("experiment-form");
      for (const [name, value] of Object.entries(TwinModel.defaults)) form.elements.namedItem(name).value = value;
      break;
    }
    case "ack": {
      state.ack.add(state.openEvent);
      try { localStorage.setItem("traction-twin-ack", JSON.stringify([...state.ack])); } catch { /* Session state still applies. */ }
      dialog.close();
      if (state.view === "overview") updateOverview();
      if (state.view === "events") eventResults();
      updateIndicators();
      toast("告警已确认");
      break;
    }
  }
});

document.addEventListener("keydown", event => {
  if (event.key === "Escape") {
    if (document.body.classList.contains("menu-open")) closeMenu();
    if (state.expanded && state.view === "overview" && !dialog.open) {
      state.expanded = false;
      topology();
      document.querySelector('[data-action="expand"]').focus();
    }
  }
  if (event.target.matches("svg [data-asset]") && (event.key === "Enter" || event.key === " ")) {
    event.preventDefault();
    selectAsset(event.target.dataset.asset);
  }
});

document.addEventListener("input", event => {
  const { id, value } = event.target;
  if (id === "asset-search") { state.assetSearch = value; assetResults(); }
  if (id === "timeline") { stopPlayback(); setSample(Number(value)); }
});

document.addEventListener("change", event => {
  const { id, value } = event.target;
  if (id === "asset-type") { state.assetType = value; assetResults(); }
  if (id === "event-filter") { state.eventFilter = value; eventResults(); }
});

document.addEventListener("submit", event => {
  if (event.target.id !== "experiment-form") return;
  event.preventDefault();
  const form = Object.fromEntries(new FormData(event.target));
  const settings = { ...form, speed: Number(form.speed), stopKm: Number(form.stopKm) };
  stopPlayback();
  state.settings = settings;
  state.run = TwinModel.makeRun(settings);
  state.sample = 0;
  state.runGeneration = Date.now();
  state.selected = settings.zone;
  location.hash = "overview";
  toast(`已生成场景 · ${TwinModel.scenarioNames[settings.fault]}`);
});

window.addEventListener("hashchange", () => {
  if (location.hash === "#main") return;
  stopPlayback();
  closeMenu();
  if (dialog.open) dialog.close();
  state.view = initialView();
  state.expanded = false;
  render();
  main.focus({ preventScroll: true });
  window.scrollTo(0, 0);
});

document.querySelectorAll("[data-icon]").forEach(node => node.insertAdjacentHTML("afterbegin", icon(node.dataset.icon, node.classList.contains("crumb-chevron") ? 14 : 20)));
render();
