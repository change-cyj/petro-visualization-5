/* c2-cem-design 示范 · 注水泥参数优化 */
(function () {
  "use strict";
  window.C2CemDesignDemo = function (root) {
    var DEPTH_BOT = 3500, N = 140;
    function makeProfiles(ppGrad, fpGrad) {
      var pp = new Float64Array(N), fp = new Float64Array(N);
      for (var i = 0; i < N; i++) {
        pp[i] = ppGrad + 0.03 * Math.sin(i / 12) + 0.02 * Math.cos(i / 7);
        fp[i] = fpGrad + 0.04 * Math.sin(i / 9 + 1) + 0.02 * Math.cos(i / 5);
      }
      return { pp: pp, fp: fp };
    }
    function ecd(density, rate, depthRatio) { return density + 0.02 * Math.sqrt(rate / 25) * depthRatio; }
    function lossProb(ecdVal, fp) {
      var x = -(fp - ecdVal) / 0.04; return 1 / (1 + Math.exp(-x));
    }
    function dispEff(density, rate, ppGrad, fpGrad) {
      var windowWidth = fpGrad - ppGrad;
      var margin = Math.min(fpGrad - density, density - ppGrad);
      if (margin < 0) return 0;
      return 0.55 + 0.25 * Math.min(rate / 30, 1) + 0.20 * Math.min(windowWidth / 0.3, 1);
    }

    root.innerHTML = '' +
      '<div style="font-family:-apple-system,sans-serif;padding:12px 0">' +
      '<div style="font-size:18px;font-weight:600;margin-bottom:4px">注水泥参数智能优化</div>' +
      '<div style="font-size:12px;color:#79828a;margin-bottom:14px;line-height:1.6">实时计算当量密度沿井深的分布、漏失概率和顶替效率，以及 Pareto 前沿 trade-off。</div>' +

      '<div style="display:flex;flex-wrap:wrap;gap:10px;margin-bottom:12px;font-size:12px">' +
      '<div style="display:flex;align-items:center;gap:4px"><label>孔隙压力 <input id="c2pp" type="range" min="0.8" max="1.3" step="0.01" value="1.02" style="width:110px"><span id="c2ppv" style="min-width:36px;text-align:right;font-family:monospace;font-weight:600;color:#2f7d6b">1.02</span></label></div>' +
      '<div style="display:flex;align-items:center;gap:4px"><label>破裂压力 <input id="c2fp" type="range" min="1.0" max="1.5" step="0.01" value="1.15" style="width:110px"><span id="c2fpv" style="min-width:36px;text-align:right;font-family:monospace;font-weight:600;color:#2f7d6b">1.15</span></label></div>' +
      '<div style="display:flex;align-items:center;gap:4px"><label>水泥浆密度 <input id="c2cd" type="range" min="0.9" max="1.6" step="0.01" value="1.10" style="width:110px"><span id="c2cdv" style="min-width:36px;text-align:right;font-family:monospace;font-weight:600;color:#2f7d6b">1.10</span></label></div>' +
      '<div style="display:flex;align-items:center;gap:4px"><label>排量 <input id="c2r" type="range" min="10" max="50" step="1" value="25" style="width:110px"><span id="c2rv" style="min-width:24px;text-align:right;font-family:monospace;font-weight:600;color:#2f7d6b">25</span></label></div>' +
      '</div>' +

      '<div style="display:grid;grid-template-columns:1fr 240px;gap:14px">' +
      '<div><svg id="c2prof" style="width:100%" viewBox="0 0 520 300"></svg></div>' +
      '<div>' +
      '<svg id="c2pareto" style="width:100%;max-width:240px" viewBox="0 0 240 170"></svg>' +
      '<div id="c2result" style="margin-top:10px;background:#fdfcf9;border:1px solid #e9e4d8;border-radius:8px;padding:12px;font-size:12px;line-height:1.6"></div>' +
      '</div></div></div>';

    var prof = root.querySelector('#c2prof'), pareto = root.querySelector('#c2pareto');

    function draw() {
      var ppGrad = +root.querySelector('#c2pp').value;
      var fpGrad = +root.querySelector('#c2fp').value;
      var cd = +root.querySelector('#c2cd').value;
      var rate = +root.querySelector('#c2r').value;
      root.querySelector('#c2ppv').textContent = ppGrad.toFixed(2);
      root.querySelector('#c2fpv').textContent = fpGrad.toFixed(2);
      root.querySelector('#c2cdv').textContent = cd.toFixed(2);
      root.querySelector('#c2rv').textContent = rate;

      if (fpGrad <= ppGrad + 0.02) {
        root.querySelector('#c2result').innerHTML = '<b style="color:#b05a51">⚠ 窗口过小</b>：破裂压力 ≤ 孔隙压力，无法安全注水泥。';
        prof.innerHTML = ''; pareto.innerHTML = ''; return;
      }
      var pf = makeProfiles(ppGrad, fpGrad);

      // 当量密度
      var maxLoss = 0;
      for (var i = 0; i < N; i++) {
        var e = ecd(cd, rate, i / N);
        var lp = lossProb(e, pf.fp[i]);
        if (lp > maxLoss) maxLoss = lp;
      }
      var curEff = dispEff(cd, rate, ppGrad, fpGrad);

      var W = 520, H = 300, m = { l: 50, r: 10, t: 14, b: 24 };
      var pw = W - m.l - m.r, ph = H - m.t - m.b;
      var eMax = Math.max(1.6, fpGrad + 0.15, cd + 0.2);
      var eMin = Math.min(0.8, ppGrad - 0.1);
      var X = function (v) { return m.l + (v - eMin) / (eMax - eMin) * pw; };
      var Y = function (i) { return m.t + (1 - i / (N - 1)) * ph; };

      var s = '';
      [0, 1000, 2000, 3000].forEach(function (d) {
        var y = m.t + (d / DEPTH_BOT) * ph;
        s += '<line x1="' + m.l + '" y1="' + y + '" x2="' + (m.l + pw) + '" y2="' + y + '" stroke="#eeeae0"/>';
        s += '<text x="' + (m.l - 6) + '" y="' + (y + 3) + '" fill="#9ba3a9" font-size="9" font-family="monospace" text-anchor="end">' + d + '</text>';
      });
      // 孔隙/破裂压力带
      var ppPath = '', fpPath = '';
      for (var i2 = 0; i2 < N; i2++) {
        ppPath += (i2 ? 'L' : 'M') + X(pf.pp[i2]).toFixed(1) + ' ' + Y(i2).toFixed(1);
        fpPath += (i2 ? 'L' : 'M') + X(pf.fp[i2]).toFixed(1) + ' ' + Y(i2).toFixed(1);
      }
      s += '<path d="' + fpPath + ' L' + X(eMin) + ' ' + Y(N - 1) + ' L' + X(eMin) + ' ' + Y(0) + ' Z" fill="#b05a51" opacity="0.12"/>';
      s += '<path d="' + ppPath + ' L' + X(eMin) + ' ' + Y(N - 1) + ' L' + X(eMin) + ' ' + Y(0) + ' Z" fill="#6b89a3" opacity="0.18"/>';
      s += '<path d="' + ppPath + '" fill="none" stroke="#6b89a3" stroke-width="1.2"/>';
      s += '<path d="' + fpPath + '" fill="none" stroke="#b05a51" stroke-width="1.2"/>';
      // 当量密度曲线（异常段着色）
      var ecdPath = '';
      for (var i3 = 0; i3 < N; i3++) {
        var e2 = ecd(cd, rate, i3 / N);
        var col = lossProb(e2, pf.fp[i3]) > 0.3 ? '#b05a51' : lossProb(e2, pf.fp[i3]) > 0.15 ? '#b26a39' : '#242b2e';
        if (i3 > 0) {
          var pe = ecd(cd, rate, (i3 - 1) / N);
          var pcol = lossProb(pe, pf.fp[i3 - 1]) > 0.3 ? '#b05a51' : lossProb(pe, pf.fp[i3 - 1]) > 0.15 ? '#b26a39' : '#242b2e';
          if (pcol !== col) { ecdPath += ' M' + X(e2).toFixed(1) + ' ' + Y(i3).toFixed(1); continue; }
        }
        ecdPath += (i3 ? 'L' : 'M') + X(e2).toFixed(1) + ' ' + Y(i3).toFixed(1);
      }
      s += '<path d="' + ecdPath + '" fill="none" stroke-width="1.4" stroke-linejoin="round" stroke="#242b2e"/>';
      s += '<text x="' + X(eMin + 0.02) + '" y="' + (m.t + 12) + '" font-size="9" fill="#b05a51">破裂压力</text>';
      s += '<text x="' + X(eMin + 0.02) + '" y="' + (m.t + 24) + '" font-size="9" fill="#6b89a3">孔隙压力</text>';
      prof.innerHTML = s;

      // Pareto
      var pareto = [];
      var dMin = Math.max(ppGrad + 0.02, 0.95);
      var dMax = Math.min(fpGrad - 0.02, 1.5);
      for (var dd = dMin; dd <= dMax; dd += 0.01) {
        for (var rr = 10; rr <= 50; rr += 5) {
          var mlp = 0;
          for (var k = 0; k < N; k++) {
            var e3 = ecd(dd, rr, k / N);
            var lp3 = lossProb(e3, pf.fp[k]);
            if (lp3 > mlp) mlp = lp3;
          }
          var eff = dispEff(dd, rr, ppGrad, fpGrad);
          pareto.push({ lp: mlp, eff: eff });
        }
      }
      var front = pareto.filter(function (p) {
        return !pareto.some(function (q) { return q.eff >= p.eff && q.lp <= p.lp && (q.eff > p.eff || q.lp < p.lp); });
      }).sort(function (a, b) { return a.lp - b.lp; });

      var PW = 240, PH = 170, Pm = { l: 28, r: 8, t: 14, b: 22 };
      var px = function (lp) { return Pm.l + Math.min(lp, 1) * (PW - Pm.l - Pm.r); };
      var py = function (eff) { return Pm.t + (1 - eff) * (PH - Pm.t - Pm.b); };
      var ps = '';
      [0, 0.5, 1.0].forEach(function (v) {
        ps += '<line x1="' + px(v) + '" y1="' + Pm.t + '" x2="' + px(v) + '" y2="' + (PH - Pm.b) + '" stroke="#eeeae0"/>';
        ps += '<text x="' + px(v) + '" y="' + (PH - 10) + '" fill="#9ba3a9" font-size="8" font-family="monospace" text-anchor="middle">' + v.toFixed(1) + '</text>';
      });
      [0.5, 0.7, 0.9].forEach(function (v) {
        ps += '<line x1="' + Pm.l + '" y1="' + py(v) + '" x2="' + (PW - Pm.r) + '" y2="' + py(v) + '" stroke="#eeeae0"/>';
        ps += '<text x="' + (Pm.l - 3) + '" y="' + (py(v) + 3) + '" fill="#9ba3a9" font-size="8" font-family="monospace" text-anchor="end">' + v.toFixed(1) + '</text>';
      });
      pareto.forEach(function (p) { ps += '<circle cx="' + px(p.lp) + '" cy="' + py(p.eff) + '" r="1.2" fill="#d4cfc2"/>'; });
      front.forEach(function (p) {
        var col = p.lp > 0.2 ? '#b26a39' : '#2f7d6b';
        ps += '<circle cx="' + px(p.lp) + '" cy="' + py(p.eff) + '" r="3.5" fill="' + col + '" stroke="#fff" stroke-width="1"/>';
      });
      ps += '<circle cx="' + px(maxLoss) + '" cy="' + py(curEff) + '" r="5" fill="none" stroke="#242b2e" stroke-width="1.5"/>';
      pareto.innerHTML = ps;

      // 结果
      var el = root.querySelector('#c2result');
      if (maxLoss > 0.5) el.innerHTML = '<b style="color:#b05a51">⚠ 高漏失风险 ' + (maxLoss * 100).toFixed(0) + '%</b><br>顶替效率 ' + (curEff * 100).toFixed(0) + '%。建议降低密度或增大排量。';
      else if (maxLoss > 0.15) el.innerHTML = '<b style="color:#b26a39">⚡ 中等风险 ' + (maxLoss * 100).toFixed(0) + '%</b><br>顶替效率 ' + (curEff * 100).toFixed(0) + '%。可考虑 Pareto 前沿上更安全的方案。';
      else el.innerHTML = '<b style="color:#2f7d6b">✓ 安全 ' + (maxLoss * 100).toFixed(1) + '%</b><br>顶替效率 ' + (curEff * 100).toFixed(0) + '%。方案合理。';
    }
    ['#c2pp', '#c2fp', '#c2cd', '#c2r'].forEach(function (id) { root.querySelector(id).addEventListener('input', draw); });
    draw();
  };
  window.C2CemDesignDemoCleanup = function () {};
})();
