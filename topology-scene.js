"use strict";

const TopologyScene = (() => {
  const left = 105;
  const right = 855;
  const wireY = 177;
  const railY = 258;
  const xAt = km => left + (right - left) * km / 12;

  const definitions = `<defs>
    <linearGradient id="scene-sky" x2="0" y2="1"><stop stop-color="#182841"/><stop offset=".54" stop-color="#507080"/><stop offset="1" stop-color="#67838b"/></linearGradient>
    <radialGradient id="scene-light" cx="69%" cy="8%" r="76%"><stop stop-color="#b5ccd3" stop-opacity=".29"/><stop offset="1" stop-color="#b5ccd3" stop-opacity="0"/></radialGradient>
    <linearGradient id="scene-ground" x2="0" y2="1"><stop stop-color="#394e51"/><stop offset=".62" stop-color="#273b40"/><stop offset="1" stop-color="#1a2a37"/></linearGradient>
    <linearGradient id="scene-slab" x2="0" y2="1"><stop stop-color="#67767c"/><stop offset=".37" stop-color="#849096"/><stop offset="1" stop-color="#49575f"/></linearGradient>
    <linearGradient id="scene-steel" x2="0" y2="1"><stop stop-color="#f0f5f5"/><stop offset=".15" stop-color="#cbdde1"/><stop offset=".46" stop-color="#86a7b3"/><stop offset=".54" stop-color="#c4d7da"/><stop offset="1" stop-color="#6d8998"/></linearGradient>
    <linearGradient id="scene-windows" x2=".4" y2="1"><stop stop-color="#183449"/><stop offset=".52" stop-color="#375c70"/><stop offset=".55" stop-color="#193140"/><stop offset="1" stop-color="#29434f"/></linearGradient>
    <linearGradient id="scene-wall" x2="0" y2="1"><stop stop-color="#b1b7ae"/><stop offset="1" stop-color="#687c7e"/></linearGradient>
    <linearGradient id="scene-roof" x2=".5" y2="1"><stop stop-color="#a8b8bb"/><stop offset="1" stop-color="#647f8c"/></linearGradient>
    <pattern id="scene-sleepers" width="17" height="35" patternUnits="userSpaceOnUse" y="232"><path d="M9 1h6L7 31H1Z" fill="#9da7a6"/><path d="m1 31 6 0 1 3H2Z" fill="#3f4a50"/><path d="m8 7 6 0m-10 15h6" stroke="#404d53" stroke-width="1.2"/></pattern>
    <pattern id="scene-gravel" width="24" height="17" patternUnits="userSpaceOnUse"><path d="m3 2 3 1-2 2zm9 4 2-2 2 2zm7 7 3-2 1 3zm-11 2 2-3 3 3z" fill="#a8b4b9" opacity=".25"/><path d="m4 11 3-2 1 2zm12-1 3 0-2 2zm5-7 2 1-3 1z" fill="#253c46" opacity=".55"/></pattern>
    <pattern id="scene-fence" width="9" height="21" patternUnits="userSpaceOnUse"><path d="M1 0v21M6 0v21" stroke="#b0c2c2" stroke-opacity=".47" stroke-width=".65"/></pattern>
  </defs>`;

  const skyline = [
    [22, 14, 21], [49, 22, 31], [78, 16, 23], [106, 25, 37], [138, 36, 29], [187, 14, 31],
    [234, 30, 19], [281, 19, 28], [314, 24, 41], [346, 21, 30], [395, 29, 23], [423, 20, 34],
    [452, 40, 29], [503, 31, 19], [562, 22, 31], [591, 13, 37], [613, 28, 29], [650, 23, 25],
    [702, 24, 37], [742, 18, 50], [767, 31, 38], [807, 19, 28], [837, 33, 36], [881, 24, 25], [919, 29, 42],
  ].map(([x, width, height]) => `<g transform="translate(${x} ${151 - height})">
    <path d="M0 0h${width}v${height}H0Z" fill="#415e67"/><path d="M${width} 0l4 3v${height - 3}h-4Z" fill="#3c5661"/>
    <path d="M4 5h${width - 8}m-${width - 8} 6h${width - 8}m-${width - 8} 6h${width - 8}" stroke="#8b9991" stroke-opacity=".44" stroke-dasharray="1 4"/>
  </g>`).join("");

  const shrubbery = [28, 46, 182, 194, 252, 269, 308, 401, 414, 496, 519, 595, 622, 682, 769, 777, 895, 919]
    .map((x, i) => `<path transform="translate(${x} ${160 + (i % 4) * 5}) scale(${.7 + (i % 3) * .23})" d="M-12 4Q-15-3-10-5Q-9-10-4-8Q1-15 5-7Q11-9 12-3Q17-2 14 4Z" fill="${i % 2 ? '#42605c' : '#334f4d'}"/>`).join("");

  const backdrop = `<g aria-hidden="true" pointer-events="none">
    <rect width="960" height="366" fill="url(#scene-sky)"/><rect width="960" height="180" fill="url(#scene-light)"/>
    <path d="M0 116 34 102 79 96 120 108 162 114 209 101 312 107 354 119 421 111 476 116 532 101 586 105 635 117 691 107 746 95 808 105 860 91 920 104 960 101V156H0Z" fill="#6c8791" opacity=".61"/>
    <path d="M0 136Q91 110 175 127T343 127T521 132T704 122T960 133V174H0Z" fill="#4d6c73"/>
    ${skyline}<path d="M0 154Q160 155 310 147Q460 146 579 151T960 147V366H0Z" fill="url(#scene-ground)"/>
    <path d="M0 178Q297 150 545 182T960 172M0 193Q286 167 542 194T960 184" fill="none" stroke="#95a09b" stroke-opacity=".23" stroke-width="1.2"/>
    ${shrubbery}<path d="M0 224H960V222H0Z" fill="#65767c"/><path d="M0 207H960L960 220H0Z" fill="#4c595e"/>
    <path d="M0 214H960" stroke="#aeb3a6" stroke-opacity=".4" stroke-dasharray="13 12"/>
    <path d="M0 284H960V292H0Z" fill="#111e2a" opacity=".78"/>
    <path d="M0 270H960V284H0Z" fill="#35464f"/><path d="M0 235H960V274H0Z" fill="url(#scene-slab)"/><path d="M0 232H960V275H0Z" fill="url(#scene-gravel)"/>
    <rect y="233" width="960" height="34" fill="url(#scene-sleepers)"/>
    <path d="M0 239H960M0 259H960" stroke="#253740" stroke-width="4"/><path d="M0 237H960M0 257H960" stroke="#d4dcdb" stroke-width="1.55"/>
    <path d="M0 274H960" stroke="#a1a9a9" stroke-opacity=".66"/>
  </g>`;

  const supports = [0, 2, 4, 6, 8, 10, 12].map((km, i, masts) => {
    const x = xAt(km);
    const next = i < masts.length - 1 ? xAt(masts[i + 1]) : x;
    const span = next === x ? "" : `<path d="M${x} 162Q${(x + next) / 2} 184 ${next} 162" fill="none" stroke="#abb9bb" stroke-width=".85"/>
      <path d="M${x + 25} 168v9m38-4v4m37-9v9" stroke="#b5c2bd" opacity=".75" stroke-width=".7"/>`;
    return `${span}<g transform="translate(${x} 0)">
      <path d="M-9 224h10l5 4h-17z" fill="#607177"/><path d="M-6 226v-76h4v76Z" fill="#9aabaf"/>
      <path d="M-6 150h1v76h-1Z" fill="#d2d7ce"/><path d="M-4 150 16 159-4 172m3-9h16l-2 14" fill="none" stroke="#a4b5b7" stroke-width="1.25"/>
      <path d="M10 162h7m-6 2h5m-4 2h4" stroke="#d6d9c7" stroke-width="1.1"/>
    </g>`;
  }).join("");

  function station(x, name, description, flip) {
    const mirror = flip ? -1 : 1;
    return `<g transform="translate(${x},0)">
      <g transform="scale(${mirror},1)">
        <path d="M-71 128h131l21 26-145 1-15-15Z" fill="#273e48" opacity=".65"/>
        <path d="M-70 112h86l20-14H-50Z" fill="url(#scene-roof)" stroke="#c1cdd0" stroke-width=".65"/>
        <path class="station-wall" d="M-70 112h86v34h-86Z" fill="url(#scene-wall)" stroke="#7f9298" stroke-width=".8"/>
        <path d="M16 112l20-14v34l-20 14Z" fill="#64777d"/><path d="M-71 113h87l20-14" fill="none" stroke="#d4dddb" stroke-width="1.15"/>
        <path d="M-61 121h12v12h-12zm17 0h12v12h-12zm36-1h14v26H-8Z" fill="#334c55"/>
        <path d="M-59 123h8v6h-8zm17 0h8v6h-8z" fill="#d7cba2" opacity=".75"/><path d="M-7 135H-4" stroke="#b6c1b8"/>
        <path d="M-68 143h82m3-1 18-13" fill="none" stroke="#49626a" stroke-width="2"/>
        <path d="M-40 151h111l11 8H-37z" fill="#425a5f"/>
        <path d="M42 123h20l6 5v18l-26 1z" fill="#83999c"/><path d="M44 126v18m3-18v18m3-18v18m3-18v18m3-18v18m3-18v18" stroke="#415e69" stroke-width="1.15"/>
        <path d="M43 123v-9m8 9v-14m8 14v-11m-18 4h4m4-5h4m4 3h4" stroke="#bcc9c3" stroke-width="1.25"/>
        <path d="M30 155h48v-19H30z" fill="url(#scene-fence)" stroke="#9eb0ad" stroke-opacity=".65" stroke-width=".8"/>
      </g>
      <rect class="station-caption" x="-75" y="48" width="150" height="43" rx="9"/>
      <path d="M0 91v8" stroke="#b1c5d5"/>
      <text class="station-name" x="0" y="65" text-anchor="middle">${name}</text>
      <text class="map-meta" x="0" y="81" text-anchor="middle">${description}</text>
    </g>`;
  }

  function feeder(x, id, off, flip) {
    const dx = flip ? -1 : 1;
    const route = `M${x + dx * 59} 139L${x + dx * 34} 151H${x + dx * 20}L${x} ${wireY}`;
    return `<path class="hit-line" d="${route}"/><path class="feed-line" d="${route}"/>
      <rect class="feed-switch" x="${x + dx * 31 - 4}" y="147" width="8" height="8" rx="1.5"/>
      ${off ? `<path d="M${x + dx * 31 - 2} 153l4-4" stroke="#fff"/>` : ""}
      <rect class="map-caption" x="${x + dx * 61 - 16}" y="151" width="32" height="16" rx="5"/>
      <text class="map-meta feed-text" x="${x + dx * 61}" y="162" text-anchor="middle">${id}</text>`;
  }

  function zone(from, to, name, alert, value) {
    const start = xAt(from) + 3;
    const end = xAt(to) - 3;
    const mid = (start + end) / 2;
    return `<path class="zone-fill" d="M${start} 253H${end}l-7 25H${start - 7}Z"/>
      <path class="zone-rail" d="M${start} ${railY}H${end}"/>
      <path class="zone-meter-line" d="M${mid} ${railY}v43"/>
      <path d="M${mid - 5} 269h10v13h-10Z" fill="#4d6265" stroke="#a3b7b5" stroke-width=".65"/>
      <circle class="zone-meter" cx="${mid}" cy="${railY}" r="3.5"/>
      <rect class="zone-caption" x="${mid - 59}" y="299" width="118" height="27" rx="7"/>
      <text class="zone-label" x="${mid}" y="316" text-anchor="middle">${alert ? "▲ " : ""}${name}${value ? ` · ${value}` : ""}</text>`;
  }

  function train(x, description) {
    const cars = [-77, -25, 27].map((start, index) => `<g transform="translate(${start} 0)">
      <path d="M8 229h31v6H8Z" fill="#283640"/>
      <circle cx="12" cy="234" r="3.7" fill="#202b33" stroke="#8d9b9c" stroke-width=".8"/><circle cx="36" cy="234" r="3.7" fill="#202b33" stroke="#8d9b9c" stroke-width=".8"/>
      <path d="M2 201h40l7 7H0Z" fill="#adbdc1"/><path class="train-body" d="${index === 2 ? 'M0 207h41q10 1 15 17l-2 5H0Z' : index === 0 ? 'M3 207h46v22H-5v-4Z' : 'M0 207h49v22H0Z'}"/>
      <path d="M0 220h${index === 2 ? 53 : 49}v3H0Z" fill="#237a83"/>
      <path d="M4 210h41v7H4Z" fill="url(#scene-windows)"/>
      <path d="M12 210v7m7-7v7m14-7v7m7-7v7" stroke="#b0c9cc" stroke-width="1.4"/>
      <path d="M20 209h10v18H20Zm5 0v18" fill="none" stroke="#6b838c" stroke-width=".7"/>
      ${index === 2 ? '<path d="M44 209q6 3 9 11l-8-2Z" fill="#172f45"/><path d="M51 224h4" stroke="#fff2cd" stroke-width="1.6"/>' : '<path d="M49 219h3v7h-3Z" fill="#283e4f"/>'}
      <path d="M6 203h10m14 0h10" stroke="#d4dfdd" stroke-width=".8"/>
    </g>`).join("");
    return `<g transform="translate(${x} 0)">
      <path class="train-pantograph" d="M-5 202 10 190-5 178m-9 0H3m-16 24H4" fill="none"/>
      <path d="M-84 238H83" stroke="#1a2736" stroke-width="4" opacity=".54"/>
      ${cars}<path d="M-66 239v34" stroke="#b9c9d4" stroke-dasharray="2 2"/>
      <rect class="train-caption" x="-80" y="272" width="160" height="21" rx="6"/>
      <text class="train-label" x="0" y="286" text-anchor="middle">${description}</text>
    </g>`;
  }

  return { left, right, wireY, railY, xAt, definitions, backdrop, supports, station, feeder, zone, train };
})();
