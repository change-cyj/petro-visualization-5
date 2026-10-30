/* d2-precursor-warn 示范 · 井下复杂事故前兆预警 */
(function () {
  "use strict";
  window.D2PrecursorWarnDemo = function (root) {
    var N = 200, NCH = 4;
    var chs = [
      { name: '扭矩', base: 250, amp: 8, col: '#41699b' },
      { name: '立压', base: 22, amp: 1.2, col: '#2f7d6b' },
      { name: '钻压', base: 18, amp: 2.0, col: '#b26a39' },
      { name: '流量', base: 32, amp: 1.8, col: '#b05a51' }
    ];
    function mulberry32(a) { return function () { a |= 0; a = a + 0x6D2B79F5 | 0; var t = Math.imul(a ^ a >>> 15, 1 | a); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; }
    var seeds = chs.map(function (_, i) { return mulberry32(20261023 + i); });

    var data = [];
    for (var t = 0; t < N; t++) {
      var row = { t: t };
      for (var c = 0; c < NCH; c++) {
        var ch = chs[c], n = seeds[c]();
        row['ch' + c] = ch.base + (n - 0.5) * 2 * ch.amp + ch.amp * 0.6 * Math.sin(t / 12 + c);
      }
      data.push(row);
    }
    var state = { injecting: false, injectStart: -1, noise: 30, intensity: 60 };

    function tick() {
      if (state.injecting) {
        state.injectStart = data.length;
      }
      var row = { t: data.length };
      for (var c = 0; c < NCH; c++) {
        var ch = chs[c], r = seeds[c]();
        row['ch' + c] = ch.base + (r - 0.5) * 2 * ch.amp * (1 + state.noise / 200) + ch.amp * 0.6 * Math.sin(row.t / 12 + c);
        if (state.injecting) {
          var f = state.intensity / 100;
          if (c === 0) row['ch' + c] += (r - 0.5) * 2 * 12 * f + 10 * f;
          if (c === 1) row['ch' + c] += 3 * f;
          if (c === 3) row['ch' + c] -= 5 * f;
        }
      }
      data.push(row);
      if (data.length > N) { data.shift(); }
    }
    for (var i = 0; i < 8; i++) tick();

    function score() {
      var cur = [];
      for (var i = data.length - 10; i < data.length; i++) cur.push(data[i]);
      var prev = data.slice(Math.max(0, data.length - 30), Math.max(0, data.length - 10));
      var s = 0;
      for (var c = 0; c < NCH; c++) {
        var valsCur = cur.map(function (r) { return r['ch' + c]; });
        var valsPrev = prev.map(function (r) { return r['ch' + c]; });
        var m1 = valsCur.reduce(function (a, b) { return a + b; }, 0) / valsCur.length;
        var m2 = valsPrev.reduce(function (a, b) { return a + b; }, 0) / valsPrev.length;
        var v2 = valsPrev.reduce(function (a, b) { return a + Math.pow(b - m2, 2); }, 0) / valsPrev.length;
        s += v2 < 0.01 ? 0 : Math.abs(m1 - m2) / Math.sqrt(v2);
      }
      return s / NCH;
    }

    root.innerHTML = '' +
      '<div style="font-family:-apple-system,sans-serif;padding:12px 0">' +
      '<div style="font-size:18px;font-weight:600;margin-bottom:4px">井下前兆预警 · 多变量异常检测</div>' +
      '<div style="font-size:12px;color:#79828a;margin-bottom:14px;line-height:1.6">实时生成 4 通道钻进时序，偶尔注入卡钻前兆模式。偏离度分数超过阈值时自动预警。</div>' +
      '<div style="display:flex;gap:10px;margin-bottom:12px;font-size:12px;flex-wrap:wrap">' +
      '<button id="d2inj" style="background:#f8ecdf;color:#b26a39;border:none;padding:4px 12px;border-radius:4px;font-size:12px;font-weight:600;cursor:pointer">注入卡钻前兆 8s</button>' +
      '<button id="d2reset" style="background:#f1f1dd;color:#767a2e;border:none;padding:4px 12px;border-radius:4px;font-size:12px;font-weight:600;cursor:pointer">重置</button>' +
      '<label style="display:flex;align-items:center;gap:4px">阈值 <input id="d2th" type="range" min="0.5" max="3" step="0.1" value="1.5" style="width:120px"><span id="d2thv" style="min-width:28px;text-align:right;font-family:monospace">1.5</span></label>' +
      '</div>' +
      '<svg id="d2tracks" style="width:100%" viewBox="0 0 620 260"></svg>' +
      '<div style="margin-top:8px;display:grid;grid-template-columns:1fr 1fr 1fr;gap:12px">' +
      '<div id="d2score" style="background:#fdfcf9;border:1px solid #e9e4d8;border-radius:8px;padding:12px"></div>' +
      '<div id="d2sus" style="background:#fdfcf9;border:1px solid #e9e4d8;border-radius:8px;padding:12px"></div>' +
      '<div id="d2alert" style="border-radius:8px;padding:12px;font-size:12px;line-height:1.6"></div>' +
      '</div></div>';

    var tracksEl = root.querySelector('#d2tracks');
    function draw() {
      var th = +root.querySelector('#d2th').value;
      root.querySelector('#d2thv').textContent = th.toFixed(1);
      var curScore = score();

      var TRACK_H = 60, W = 620, m = { l: 60, r: 10, t: 6, b: 8 };
      var pw = W - m.l - m.r;
      var Y = function (track, v, lo, hi) { return m.t + track * TRACK_H + (1 - (v - lo) / (hi - lo)) * (TRACK_H - m.t - m.b); };
      var X = function (i) { return m.l + (i / (N - 1)) * pw; };

      var s = '';
      for (var c = 0; c < NCH; c++) {
        var ch = chs[c];
        var lo = ch.base - ch.amp * 2.5, hi = ch.base + ch.amp * 2.5;
        var yTop = m.t + c * TRACK_H;
        s += '<rect x="' + m.l + '" y="' + yTop + '" width="' + pw + '" height="' + TRACK_H + '" fill="#fdfcf9"/>';
        s += '<line x1="' + m.l + '" y1="' + yTop + '" x2="' + (m.l + pw) + '" y2="' + yTop + '" stroke="#eeeae0"/>';
        var path = '';
        for (var i = 0; i < data.length; i++) path += (i ? 'L' : 'M') + X(i).toFixed(1) + ' ' + Y(c, data[i]['ch' + c], lo, hi).toFixed(1);
        s += '<path d="' + path + '" fill="none" stroke="' + ch.col + '" stroke-width="1.3"/>';
        // 最近 10 点异常着色
        for (var k = data.length - 10; k < data.length; k++) {
          if (k < 0) continue;
          var d0 = data[k];
          // 简化：对当前通道计算 z-score
          var vals = data.slice(Math.max(0, data.length - 30), data.length - 10).map(function (r) { return r['ch' + c]; });
          var m2 = vals.reduce(function (a, b) { return a + b; }, 0) / vals.length;
          var v2 = vals.reduce(function (a, b) { return a + Math.pow(b - m2, 2); }, 0) / vals.length;
          var z = Math.abs(d0['ch' + c] - m2) / Math.sqrt(v2 + 0.01);
          var col = z > 2 ? '#b05a51' : z > 1.2 ? '#b26a39' : ch.col;
          s += '<circle cx="' + X(k) + '" cy="' + Y(c, d0['ch' + c], lo, hi) + '" r="2" fill="' + col + '"/>';
        }
        s += '<text x="' + (m.l - 6) + '" y="' + (yTop + TRACK_H / 2 + 3) + '" fill="#79828a" font-size="9" font-family="monospace" text-anchor="end">' + ch.name + '</text>';
      }
      tracksEl.innerHTML = s;

      // 分数
      root.querySelector('#d2score').innerHTML = '<div style="font-size:10px;color:#79828a;text-transform:uppercase;letter-spacing:1px;margin-bottom:6px">偏离度分数</div>' +
        '<div style="font-size:24px;font-weight:700;font-family:monospace;color:' + (curScore > th ? '#b05a51' : curScore > th * 0.7 ? '#b26a39' : '#2f7d6b') + '">' + curScore.toFixed(2) + '</div>' +
        '<div style="font-size:11px;color:#79828a;margin-top:4px">阈值 ' + th.toFixed(1) + ' · 20 点滚动均值</div>';

      // 可疑通道
      var sus = [];
      for (var c2 = 0; c2 < NCH; c2++) {
        var last10 = data.slice(-10).map(function (r) { return r['ch' + c2]; });
        var prev20 = data.slice(-30, -10).map(function (r) { return r['ch' + c2]; });
        if (prev20.length < 5) continue;
        var m1b = last10.reduce(function (a, b) { return a + b; }, 0) / last10.length;
        var m2b = prev20.reduce(function (a, b) { return a + b; }, 0) / prev20.length;
        var v2b = prev20.reduce(function (a, b) { return a + Math.pow(b - m2b, 2); }, 0) / prev20.length;
        var z = Math.abs(m1b - m2b) / Math.sqrt(v2b + 0.01);
        if (z > 1.2) sus.push({ name: chs[c2].name, z: z });
      }
      sus.sort(function (a, b) { return b.z - a.z; });
      root.querySelector('#d2sus').innerHTML = '<div style="font-size:10px;color:#79828a;text-transform:uppercase;letter-spacing:1px;margin-bottom:6px">可疑通道</div>' +
        (sus.length ? sus.map(function (s) { return '<div style="padding:2px 0;font-size:12px"><span style="font-weight:600">' + s.name + '</span><span style="color:#9ba3a9;margin-left:8px">z=' + s.z.toFixed(2) + '</span></div>'; }).join('') : '<span style="color:#9ba3a9;font-size:12px">—</span>');

      // 告警
      var alert = root.querySelector('#d2alert');
      if (curScore > th) {
        alert.style.background = '#f9e9e5'; alert.style.color = '#b05a51';
        alert.innerHTML = '<b>⚠ 异常</b><br>偏离度 ' + curScore.toFixed(2) + ' > 阈值，立即检查可疑通道！';
      } else if (curScore > th * 0.7) {
        alert.style.background = '#f8ecdf'; alert.style.color = '#b26a39';
        alert.innerHTML = '<b>⚡ 关注</b><br>偏离度接近阈值，持续观察。';
      } else {
        alert.style.background = '#e6f1ec'; alert.style.color = '#2f7d6b';
        alert.innerHTML = '<b>✓ 正常</b><br>所有通道在基线范围内。';
      }
    }

    root.querySelector('#d2inj').addEventListener('click', function () {
      state.injecting = true;
      setTimeout(function () { state.injecting = false; }, 8000);
    });
    root.querySelector('#d2reset').addEventListener('click', function () { data = []; for (var i = 0; i < 100; i++) tick(); draw(); });
    root.querySelector('#d2th').addEventListener('input', draw);

    // 定时更新
    var timer = setInterval(function () { tick(); draw(); }, 1200);
    draw();
    root.querySelector('#d2inj').onclick = function () { /* 已经绑定 */ };

    // 暴露 cleanup
    window.D2PrecursorWarnDemoCleanup = function () { clearInterval(timer); };
  };
  window.D2PrecursorWarnDemoCleanup = function () {};
})();
