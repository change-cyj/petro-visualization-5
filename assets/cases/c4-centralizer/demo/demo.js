/* c4-centralizer 示范 · 套管居中度 */
(function () {
  "use strict";
  window.C4CentralizerDemo = function (root) {
    var N = 250, DEPTH = 2500;
    function makeWell() {
      var wellbore = new Float64Array(N), inc = new Float64Array(N);
      for (var i = 0; i < N; i++) {
        wellbore[i] = 216 + 10 * Math.sin(i / 18) + 6 * Math.cos(i / 9);
        if (i > 60 && i < 75) wellbore[i] += 35 * Math.sin((i - 60) / 15 * Math.PI);
        if (i > 140 && i < 165) wellbore[i] += 45 * Math.sin((i - 140) / 25 * Math.PI);
        if (i > 200 && i < 210) wellbore[i] -= 30 * Math.sin((i - 200) / 10 * Math.PI);
        if (i < 50) inc[i] = 0.84 * i;
        else if (i < 90) inc[i] = 42;
        else inc[i] = 42 + 8 * Math.sin((i - 90) / 40);
      }
      return { wb: wellbore, inc: inc };
    }
    function centralization(wb, inc, csleeve, csizer, ctrls) {
      var c = new Float64Array(N);
      var oR = csleeve / 2, ceR = csizer / 2;
      for (var i = 0; i < N; i++) {
        var w = wb[i] / 2;
        var incR = inc[i] * Math.PI / 180;
        var ecc;
        if (ctrls[i]) ecc = Math.max(0, w - oR - ceR + 2);
        else ecc = Math.max(0, w - oR - w * Math.sin(incR) * 0.7);
        c[i] = Math.max(0, Math.min(100, (w - ecc - oR) / Math.max(1, (w - oR)) * 100));
      }
      return c;
    }
    var well = makeWell();
    var ctrls = new Uint8Array(N);

    root.innerHTML = '' +
      '<div style="font-family:-apple-system,sans-serif;padding:12px 0">' +
      '<div style="font-size:18px;font-weight:600;margin-bottom:4px">套管居中度智能评估</div>' +
      '<div style="font-size:12px;color:#79828a;margin-bottom:14px;line-height:1.6">点击井深位置安放/移除扶正器（绿色点），居中度曲线实时更新。</div>' +
      '<div style="display:flex;gap:10px;margin-bottom:10px;font-size:12px;flex-wrap:wrap">' +
      '<label>扶正器外径 <select id="c4cs" style="padding:2px 4px;border-radius:4px;border:1px solid #e9e4d8"><option value="130">130mm</option><option value="140" selected>140mm</option><option value="150">150mm</option></select></label>' +
      '<label>套管外径 <select id="c4sl" style="padding:2px 4px;border-radius:4px;border:1px solid #e9e4d8"><option value="114">114mm</option><option value="139" selected>139mm</option><option value="178">178mm</option></select></label>' +
      '<button id="c4opt" style="background:#e6f1ec;color:#2f7d6b;border:none;padding:4px 12px;border-radius:4px;font-size:12px;font-weight:600;cursor:pointer">一键优化</button>' +
      '<button id="c4clear" style="background:#f9e9e5;color:#b05a51;border:none;padding:4px 12px;border-radius:4px;font-size:12px;font-weight:600;cursor:pointer">清除</button>' +
      '<button id="c4even" style="background:#f1f1dd;color:#767a2e;border:none;padding:4px 12px;border-radius:4px;font-size:12px;font-weight:600;cursor:pointer">均匀（传统）</button>' +
      '</div>' +
      '<div style="display:grid;grid-template-columns:1fr 200px;gap:14px">' +
      '<div><svg id="c4svg" style="width:100%;cursor:pointer" viewBox="0 0 600 420"></svg></div>' +
      '<div>' +
      '<div style="background:#fdfcf9;border:1px solid #e9e4d8;border-radius:8px;padding:12px;font-size:12px;line-height:1.7">' +
      '<div style="font-size:10px;color:#79828a;text-transform:uppercase;letter-spacing:1px;margin-bottom:8px">当前方案</div>' +
      '<div style="display:flex;justify-content:space-between;padding:2px 0"><span style="color:#5d666d">扶正器</span><span style="font-family:monospace;font-weight:600" id="c4cnt">0</span></div>' +
      '<div style="display:flex;justify-content:space-between;padding:2px 0"><span style="color:#5d666d">达标率</span><span style="font-family:monospace;font-weight:600" id="c4pct">—</span></div>' +
      '<div style="display:flex;justify-content:space-between;padding:2px 0"><span style="color:#5d666d">平均居中</span><span style="font-family:monospace;font-weight:600" id="c4avg">—</span></div>' +
      '<div style="display:flex;justify-content:space-between;padding:2px 0"><span style="color:#5d666d">最差点</span><span style="font-family:monospace;font-weight:600" id="c4worst">—</span></div>' +
      '<div id="c4tip" style="margin-top:10px;padding:8px;background:#f8f8f5;border-radius:4px;font-size:11px;line-height:1.5"></div>' +
      '</div></div></div></div>';

    var svg = root.querySelector('#c4svg');
    function draw() {
      var csizer = +root.querySelector('#c4cs').value, csleeve = +root.querySelector('#c4sl').value;
      var c = centralization(well.wb, well.inc, csleeve, csizer, ctrls);

      var W = 600, H = 420, m = { l: 48, r: 8, t: 10, b: 24 };
      var pw = W - m.l - m.r, ph = H - m.t - m.b;
      var Y = function (i) { return m.t + i / (N - 1) * ph; };
      var CEN = 67;

      var s = '';
      for (var d = 0; d <= DEPTH; d += 500) {
        var yd = m.t + d / DEPTH * ph;
        s += '<line x1="' + m.l + '" y1="' + yd + '" x2="' + (m.l + pw) + '" y2="' + yd + '" stroke="#eeeae0"/>';
        s += '<text x="' + (m.l - 5) + '" y="' + (yd + 3) + '" fill="#9ba3a9" font-size="9" font-family="monospace" text-anchor="end">' + d + ' m</text>';
      }
      s += '<text x="' + m.l + '" y="' + (m.t - 2) + '" font-size:9 fill="#79828a" font-family="monospace">深度 ↓</text>';

      // 居中度 67% 阈值线
      var thrY = m.t + (1 - CEN / 100) * ph;
      s += '<line x1="' + m.l + '" y1="' + thrY + '" x2="' + (m.l + pw) + '" y2="' + thrY + '" stroke="#b26a39" stroke-dasharray="4 3"/>';
      s += '<text x="' + (m.l + pw - 4) + '" y="' + (thrY - 3) + '" font-size="9" fill="#b26a39" font-family="monospace" text-anchor="end">67%</text>';

      // 井径轨（左 0-40%）
      var wbL = m.l, wbW = pw * 0.22;
      var wbX = function (v) { return wbL + Math.max(0, Math.min(1, (v - 150) / (280 - 150))) * wbW; };
      var wbPath = '';
      for (var i2 = 0; i2 < N; i2++) wbPath += (i2 ? 'L' : 'M') + wbX(well.wb[i2]).toFixed(1) + ' ' + Y(i2).toFixed(1);
      s += '<path d="' + wbPath + '" fill="none" stroke="#41699b" stroke-width="1.2" opacity="0.85"/>';

      // 井斜轨
      var incL = wbL + wbW + 8, incW = pw * 0.18;
      var incX = function (v) { return incL + Math.max(0, Math.min(1, v / 60)) * incW; };
      var incPath = '';
      for (var i3 = 0; i3 < N; i3++) incPath += (i3 ? 'L' : 'M') + incX(well.inc[i3]).toFixed(1) + ' ' + Y(i3).toFixed(1);
      s += '<path d="' + incPath + '" fill="none" stroke="#b26a39" stroke-width="1.2" opacity="0.85"/>';

      // 居中度轨（右侧）
      var cL = incL + incW + 10, cW = pw - (incL + incW - m.l + 18);
      var cX = function (v) { return cL + v / 100 * cW; };
      for (var i4 = 1; i4 < N; i4++) {
        var col = c[i4] >= CEN ? '#2f7d6b' : '#b05a51';
        s += '<line x1="' + cX(c[i4 - 1]).toFixed(1) + '" y1="' + Y(i4 - 1).toFixed(1) + '" x2="' + cX(c[i4]).toFixed(1) + '" y2="' + Y(i4).toFixed(1) + '" stroke="' + col + '" stroke-width="1.5"/>';
      }
      // 扶正器标记
      for (var j = 0; j < N; j++) {
        if (ctrls[j]) {
          var yy = Y(j);
          s += '<circle cx="' + cX(c[j]) + '" cy="' + yy + '" r="4" fill="#b26a39" stroke="#fff" stroke-width="1"/>';
          s += '<circle cx="' + wbX(well.wb[j]) + '" cy="' + yy + '" r="3" fill="#b26a39"/>';
        }
      }
      s += '<text x="' + (wbL + wbW / 2) + '" y="' + (m.t - 2) + '" font-size="9" fill="#79828a" text-anchor="middle" font-family="monospace">井径</text>';
      s += '<text x="' + (incL + incW / 2) + '" y="' + (m.t - 2) + '" font-size="9" fill="#79828a" text-anchor="middle" font-family="monospace">井斜</text>';
      s += '<text x="' + (cL + cW / 2) + '" y="' + (m.t - 2) + '" font-size="9" fill="#79828a" text-anchor="middle" font-family="monospace">居中度 %</text>';

      svg.innerHTML = s;

      svg.onclick = function (e) {
        var r = svg.getBoundingClientRect();
        var sy = (e.clientY - r.top) / r.height * H;
        var idx = Math.round((sy - m.t) / ph * (N - 1));
        if (idx < 0 || idx >= N) return;
        // 最小间距
        var ok = true;
        for (var dd = 1; dd <= 20; dd++) {
          if ((idx - dd >= 0 && ctrls[idx - dd]) || (idx + dd < N && ctrls[idx + dd])) { ok = false; break; }
        }
        if (ok) ctrls[idx] = ctrls[idx] ? 0 : 1;
        draw();
      };

      // 统计
      var cnt = 0, sum = 0, worst = 100, below = 0;
      for (var i5 = 0; i5 < N; i5++) {
        if (ctrls[i5]) cnt++;
        sum += c[i5];
        if (c[i5] < worst) worst = c[i5];
        if (c[i5] < CEN) below++;
      }
      root.querySelector('#c4cnt').textContent = cnt;
      root.querySelector('#c4pct').textContent = ((1 - below / N) * 100).toFixed(0) + '%';
      root.querySelector('#c4avg').textContent = (sum / N).toFixed(1) + '%';
      root.querySelector('#c4worst').textContent = worst.toFixed(1) + '%';
      var tip = root.querySelector('#c4tip');
      if (below > N * 0.3) tip.innerHTML = '<b style="color:#b05a51">⚠ ' + ((below / N) * 100).toFixed(0) + '% 不达标</b>，瓶颈在井径扩径区和大井斜段，建议加密扶正器。';
      else if (below > N * 0.1) tip.innerHTML = '<b style="color:#b26a39">⚡ ' + ((below / N) * 100).toFixed(0) + '% 不达标</b>，主要在个别扩径段，可考虑更大外径扶正器。';
      else tip.innerHTML = '<b style="color:#2f7d6b">✓ 整体达标</b>，方案可接受。';
    }

    root.querySelector('#c4cs').addEventListener('change', draw);
    root.querySelector('#c4sl').addEventListener('change', draw);
    root.querySelector('#c4opt').addEventListener('click', function () {
      ctrls = new Uint8Array(N);
      // 简单贪心：在居中度最低的 20 个位置放置扶正器
      var csiz = +root.querySelector('#c4cs').value, csle = +root.querySelector('#c4sl').value;
      var scores = [];
      for (var i = 0; i < N; i++) scores.push({ i: i, c: centralization(well.wb, well.inc, csle, csiz, ctrls)[i] });
      scores.sort(function (a, b) { return a.c - b.c; });
      for (var k = 0; k < Math.min(20, scores.length); k++) {
        var idx = scores[k].i;
        var ok = true;
        for (var dd = 1; dd <= 20; dd++) if ((idx - dd >= 0 && ctrls[idx - dd]) || (idx + dd < N && ctrls[idx + dd])) { ok = false; break; }
        if (ok) ctrls[idx] = 1;
      }
      draw();
    });
    root.querySelector('#c4clear').addEventListener('click', function () { ctrls = new Uint8Array(N); draw(); });
    root.querySelector('#c4even').addEventListener('click', function () {
      ctrls = new Uint8Array(N);
      for (var i = 20; i < N; i += 60) ctrls[i] = 1;
      draw();
    });
    draw();
  };
  window.C4CentralizerDemoCleanup = function () {};
})();
