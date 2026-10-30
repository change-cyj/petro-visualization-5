/* c1-cement-quality 示范 · CBL/VDL 固井质量评价
   导出 window.C1CementQualityDemo(root) 供 case.js 挂载 */
(function () {
  "use strict";
  window.C1CementQualityDemo = function (root) {

    var N = 400;
    var DEPTH_TOP = 1500, DEPTH_BOT = 2000;
    var FAST_START = 200, FAST_END = 320;
    var MICRO = 140;

    var SEGMENTS = [
      { a: 0, b: 100, truth: 0, label: '好胶结' },
      { a: 100, b: 200, truth: 1, label: '中等胶结' },
      { a: 200, b: 320, truth: 2, label: '差胶结' },
      { a: 320, b: 400, truth: 3, label: '缺水泥' }
    ];
    var GRADES = [
      { color: '#2f7d6b', name: '好' },
      { color: '#b26a39', name: '中' },
      { color: '#b05a51', name: '差' },
      { color: '#6b4b8a', name: '缺水泥' }
    ];

    function mulberry32(a) {
      return function () {
        a |= 0; a = a + 0x6D2B79F5 | 0;
        var t = Math.imul(a ^ a >>> 15, 1 | a);
        t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t;
        return ((t ^ t >>> 14) >>> 0) / 4294967296;
      };
    }
    var rnd = mulberry32(20261023);

    function makeCBL(quality, noise, fastOn, microOn) {
      var base = [8, 20, 38, 58];
      var scale = quality / 60;
      var cbl = new Float64Array(N);
      for (var i = 0; i < N; i++) {
        var g = 0;
        for (var k = 0; k < SEGMENTS.length; k++) if (i >= SEGMENTS[k].a) g = k;
        cbl[i] = base[g] * scale;
      }
      for (var j = 0; j < N; j++) cbl[j] += 3 * Math.sin(j / 50);
      if (fastOn) for (var f = FAST_START; f < FAST_END; f++) cbl[f] *= 0.55;
      if (microOn) for (var m = MICRO - 4; m < MICRO + 6; m++) if (m >= 0 && m < N) cbl[m] += 10;
      var noiseAmt = noise / 100 * 6;
      for (var n = 0; n < N; n++) cbl[n] += (rnd() - 0.5) * 2 * noiseAmt;
      var sm = new Float64Array(N);
      for (var p = 0; p < N; p++) {
        var s = 0, w = 0;
        for (var q = -2; q <= 2; q++) {
          var idx = p + q;
          if (idx >= 0 && idx < N) { s += cbl[idx] * (3 - Math.abs(q)); w += (3 - Math.abs(q)); }
        }
        sm[p] = Math.max(2, s / w);
      }
      return sm;
    }

    function classify(cbl, fastOn) {
      var grades = new Int8Array(N);
      var conf = new Float64Array(N);
      for (var i = 0; i < N; i++) {
        var isFast = fastOn && i >= FAST_START && i < FAST_END;
        var v = isFast ? cbl[i] / 0.55 : cbl[i];
        if (v < 15) { grades[i] = 0; conf[i] = Math.min(1, (15 - v) / 15 + 0.5); }
        else if (v < 30) { grades[i] = 1; conf[i] = 0.7 + Math.random() * 0.2; }
        else if (v < 45) { grades[i] = 2; conf[i] = 0.6 + Math.random() * 0.3; }
        else { grades[i] = 3; conf[i] = 0.8 + Math.random() * 0.15; }
      }
      return { grades: grades, conf: conf };
    }

    // 生成 HTML
    root.innerHTML = '' +
      '<div style="font-family:-apple-system,sans-serif;max-width:100%;padding:12px 0">' +
      '<div style="font-size:18px;font-weight:600;margin-bottom:4px">CBL/VDL 固井质量智能评价</div>' +
      '<div style="font-size:12px;color:#79828a;margin-bottom:14px;line-height:1.6">拖动滑杆改变条件，看 CBL 曲线、VDL 变密度图和 AI 分级。</div>' +

      '<div style="display:flex;flex-wrap:wrap;gap:10px;margin-bottom:10px;font-size:12px">' +
      '<div style="display:flex;align-items:center;gap:6px"><label>整体胶结 <input id="c1q" type="range" min="0" max="100" value="60" style="width:130px"><span id="c1qv" style="min-width:32px;text-align:right;font-family:monospace;color:#2f7d6b;font-weight:600">60</span></label></div>' +
      '<div style="display:flex;align-items:center;gap:6px"><label>噪声 <input id="c1n" type="range" min="0" max="100" value="20" style="width:130px"><span id="c1nv" style="min-width:32px;text-align:right;font-family:monospace;color:#2f7d6b;font-weight:600">20</span></label></div>' +
      '<div><label><input id="c1f" type="checkbox" checked>快速地层</label></div>' +
      '<div><label><input id="c1m" type="checkbox">微环隙</label></div>' +
      '<div><label><input id="c1g" type="checkbox" checked>显示基准</label></div>' +
      '</div>' +

      '<div style="display:grid;grid-template-columns:1fr 240px;gap:14px">' +
      '<div>' +
      '<svg id="c1tracks" style="width:100%" viewBox="0 0 600 400"></svg>' +
      '</div>' +
      '<div>' +
      '<div style="background:#fdfcf9;border:1px solid #e9e4d8;border-radius:8px;padding:12px;margin-bottom:10px">' +
      '<div style="font-size:10px;color:#79828a;text-transform:uppercase;letter-spacing:1px;margin-bottom:6px">分类统计</div>' +
      '<div id="c1stats"></div>' +
      '</div>' +
      '<div style="background:#fdfcf9;border:1px solid #e9e4d8;border-radius:8px;padding:12px">' +
      '<div style="font-size:10px;color:#79828a;text-transform:uppercase;letter-spacing:1px;margin-bottom:6px">判读</div>' +
      '<div id="c1verdict" style="font-size:12px;line-height:1.6"></div>' +
      '</div>' +
      '</div></div></div>';

    var svg = root.querySelector('#c1tracks');
    var statsEl = root.querySelector('#c1stats');
    var verdictEl = root.querySelector('#c1verdict');

    function draw() {
      var quality = +root.querySelector('#c1q').value;
      var noise = +root.querySelector('#c1n').value;
      var fastOn = root.querySelector('#c1f').checked;
      var microOn = root.querySelector('#c1m').checked;
      var showGt = root.querySelector('#c1g').checked;
      root.querySelector('#c1qv').textContent = quality;
      root.querySelector('#c1nv').textContent = noise;

      var cbl = makeCBL(quality, noise, fastOn, microOn);
      var cls = classify(cbl, fastOn);

      var W = 600, H = 400, m = { l: 54, r: 10, t: 10, b: 22 };
      var cblL = m.l, cblW = 130, vdlL = cblL + cblW + 10, vdlW = 110, gdL = vdlL + vdlW + 10, gdW = 80;
      var Y = function (i) { return m.t + (i / (N - 1)) * (H - m.t - m.b); };

      var s = '';
      // 深度刻度
      for (var d = 0; d <= DEPTH_BOT - DEPTH_TOP; d += 100) {
        var yd = Y(d / (DEPTH_BOT - DEPTH_TOP) * N);
        s += '<line x1="' + m.l + '" y1="' + yd + '" x2="' + (gdL + gdW) + '" y2="' + yd + '" stroke="#eeeae0"/>';
        s += '<text x="' + (m.l - 6) + '" y="' + (yd + 3) + '" fill="#9ba3a9" font-size="9" font-family="monospace" text-anchor="end">' + (DEPTH_TOP + d) + '</text>';
      }

      // CBL 轨
      var cblMin = 0, cblMax = 70;
      var cblX = function (v) { return cblL + Math.min(Math.max(v, cblMin), cblMax) / (cblMax - cblMin) * cblW; };
      for (var th = 15; th <= 45; th += 15) {
        var xt = cblX(th);
        s += '<line x1="' + xt + '" y1="' + m.t + '" x2="' + xt + '" y2="' + (m.t + H - m.t - m.b) + '" stroke="#c9c2b0" stroke-dasharray="2 2" opacity="0.5"/>';
      }
      var path = '';
      for (var i = 0; i < N; i++) path += (i ? 'L' : 'M') + cblX(cbl[i]).toFixed(1) + ' ' + Y(i).toFixed(1);
      s += '<path d="' + path + '" fill="none" stroke="#242b2e" stroke-width="1.3"/>';
      if (fastOn) {
        s += '<rect x="' + cblL + '" y="' + Y(FAST_START) + '" width="' + cblW + '" height="' + (Y(FAST_END) - Y(FAST_START)) + '" fill="#efe9f4" opacity="0.3"/>';
      }
      if (microOn) {
        s += '<circle cx="' + cblX(cbl[MICRO]) + '" cy="' + Y(MICRO) + '" r="3" fill="none" stroke="#b26a39" stroke-width="1.5"/>';
      }
      // 真实底色
      for (var seg = 0; seg < SEGMENTS.length; seg++) {
        s += '<rect x="' + cblL + '" y="' + Y(SEGMENTS[seg].a) + '" width="' + cblW + '" height="' + (Y(SEGMENTS[seg].b - 1) - Y(SEGMENTS[seg].a)) + '" fill="' + GRADES[SEGMENTS[seg].truth].color + '" opacity="0.1"/>';
      }
      s += '<text x="' + (cblL + cblW / 2) + '" y="' + (m.t - 2) + '" font-size="9" fill="#79828a" text-anchor="middle" font-family="monospace">CBL</text>';

      // VDL 轨
      for (var yi = 0; yi < N; yi++) {
        var depth = DEPTH_TOP + yi / N * (DEPTH_BOT - DEPTH_TOP);
        var t0 = 10 + (cbl[yi] < 20 ? 30 : cbl[yi] < 35 ? 20 : cbl[yi] < 50 ? 10 : 5);
        for (var j = 0; j < 40; j++) {
          var val = Math.exp(-Math.pow(j / 40 - t0 / 60, 2) * 60) * (0.4 + cbl[yi] / 70) + rnd() * 0.06;
          val = Math.min(1, Math.max(0, val));
          var g = Math.round(val * 255);
          s += '<rect x="' + (vdlL + j / 40 * vdlW) + '" y="' + Y(yi) + '" width="' + (vdlW / 40 + 0.5) + '" height="' + ((Y(1) - Y(0)) + 0.5) + '" fill="rgb(' + g + ',' + g + ',' + g + ')"/>';
        }
      }
      s += '<text x="' + (vdlL + vdlW / 2) + '" y="' + (m.t - 2) + '" font-size="9" fill="#79828a" text-anchor="middle" font-family="monospace">VDL</text>';

      // AI 分级轨
      for (var k = 0; k < N; k++) {
        var gp = cls.grades[k];
        var yp = Y(k);
        var yp2 = Y(Math.min(N - 1, k + 1));
        s += '<rect x="' + gdL + '" y="' + yp + '" width="' + gdW + '" height="' + Math.max(1, yp2 - yp) + '" fill="' + GRADES[gp].color + '" opacity="0.85"/>';
      }
      if (showGt) {
        for (var s2 = 0; s2 < SEGMENTS.length; s2++) {
          s += '<rect x="' + gdL + '" y="' + Y(SEGMENTS[s2].a) + '" width="' + (gdW / 2) + '" height="' + (Y(SEGMENTS[s2].b - 1) - Y(SEGMENTS[s2].a)) + '" fill="' + GRADES[SEGMENTS[s2].truth].color + '" opacity="0.5"/>';
        }
      }
      s += '<text x="' + (gdL + gdW / 2) + '" y="' + (m.t - 2) + '" font-size="9" fill="#79828a" text-anchor="middle" font-family="monospace">AI</text>';

      svg.innerHTML = s;

      // 统计
      var counts = [0, 0, 0, 0], match = 0;
      for (var i2 = 0; i2 < N; i2++) {
        var truth = 0;
        for (var k2 = 0; k2 < SEGMENTS.length; k2++) if (i2 >= SEGMENTS[k2].a) truth = k2;
        counts[cls.grades[i2]]++;
        if (cls.grades[i2] === truth) match++;
      }
      var pct = (match / N * 100).toFixed(1);
      var statHtml = '';
      for (var g = 0; g < 4; g++) {
        statHtml += '<div style="display:flex;justify-content:space-between;font-size:12px;padding:2px 0"><span style="color:#5d666d"><span style="display:inline-block;width:10px;height:10px;background:' + GRADES[g].color + ';border-radius:2px;vertical-align:middle;margin-right:4px"></span>' + GRADES[g].name + '</span><span style="font-family:monospace;font-weight:600">' + counts[g] + '</span></div>';
      }
      statHtml += '<div style="border-top:1px solid #ddd;margin-top:4px;padding-top:4px;display:flex;justify-content:space-between;font-size:12px"><span style="color:#5d666d">与基准一致率</span><span style="font-family:monospace;font-weight:600;color:#2f7d6b">' + pct + '%</span></div>';
      statsEl.innerHTML = statHtml;

      // 判读
      var badCount = counts[2] + counts[3];
      if (+pct < 70) {
        verdictEl.innerHTML = '<b style="color:#b05a51">⚠ 效果不佳</b>：噪声过高或快速地层未校正。';
      } else if (badCount > N * 0.3) {
        verdictEl.innerHTML = '<b style="color:#b26a39">⚡ 大量缺陷段</b>：' + ((badCount / N) * 100).toFixed(0) + '% 为差/缺水泥，重点复核。';
      } else {
        verdictEl.innerHTML = '<b style="color:#2f7d6b">✓ 整体一致 ' + pct + '%</b>，AI 分级可靠，只复核低置信度段。';
      }
    }

    ['#c1q', '#c1n', '#c1f', '#c1m', '#c1g'].forEach(function (id) {
      root.querySelector(id).addEventListener('input', draw);
      root.querySelector(id).addEventListener('change', draw);
    });
    draw();
  };
  window.C1CementQualityDemoCleanup = function () {};
})();
