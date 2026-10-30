/* c3-loss-pred 示范 · 固井漏失风险预测 */
(function () {
  "use strict";
  window.C3LossPredDemo = function (root) {
    function predict(pp, fp, cd, rate, angle) {
      var windowWidth = fp - pp;
      var margin = fp - cd;
      var logit = 0;
      logit += -6 * Math.max(0, margin);
      logit += 3 * Math.max(0, -margin + 0.02);
      logit += -4 * Math.max(0, windowWidth);
      logit += 1.2 * (cd - 1.05);
      logit += 0.04 * rate;
      logit += 0.8 * (angle / 90) - 0.4;
      var p = 1 / (1 + Math.exp(-logit));
      var shap = { margin: -6 * Math.max(0, margin) + 3 * Math.max(0, -margin + 0.02), windowWidth: -4 * Math.max(0, windowWidth), cd: 1.2 * (cd - 1.05), rate: 0.04 * rate - 1.0, angle: 0.8 * (angle / 90) - 0.4 };
      return { p: p, shap: shap };
    }

    root.innerHTML = '' +
      '<div style="font-family:-apple-system,sans-serif;padding:12px 0">' +
      '<div style="font-size:18px;font-weight:600;margin-bottom:4px">固井漏失风险预测</div>' +
      '<div style="font-size:12px;color:#79828a;margin-bottom:14px;line-height:1.6">简化 GBDT 模型，实时计算漏失概率并展示 SHAP 特征归因。</div>' +

      '<div style="display:grid;grid-template-columns:320px 1fr;gap:14px">' +
      '<div style="background:#fdfcf9;border:1px solid #e9e4d8;border-radius:8px;padding:14px">' +
      '<div style="font-size:12px;color:#79828a;text-transform:uppercase;letter-spacing:1px;margin-bottom:10px">井况 & 设计</div>' +
      '<div style="margin-bottom:10px;font-size:12px;display:flex;align-items:center;gap:6px"><label style="min-width:80px;color:#5d666d">孔隙压力</label><input id="c3pp" type="range" min="0.85" max="1.25" step="0.01" value="1.02" style="flex:1"><span id="c3ppv" style="min-width:40px;text-align:right;font-family:monospace;font-weight:600;color:#2f7d6b">1.02</span></div>' +
      '<div style="margin-bottom:10px;font-size:12px;display:flex;align-items:center;gap:6px"><label style="min-width:80px;color:#5d666d">破裂压力</label><input id="c3fp" type="range" min="1.00" max="1.40" step="0.01" value="1.12" style="flex:1"><span id="c3fpv" style="min-width:40px;text-align:right;font-family:monospace;font-weight:600;color:#2f7d6b">1.12</span></div>' +
      '<div style="margin-bottom:10px;font-size:12px;display:flex;align-items:center;gap:6px"><label style="min-width:80px;color:#5d666d">水泥浆密度</label><input id="c3cd" type="range" min="0.95" max="1.45" step="0.01" value="1.08" style="flex:1"><span id="c3cdv" style="min-width:40px;text-align:right;font-family:monospace;font-weight:600;color:#2f7d6b">1.08</span></div>' +
      '<div style="margin-bottom:10px;font-size:12px;display:flex;align-items:center;gap:6px"><label style="min-width:80px;color:#5d666d">排量</label><input id="c3r" type="range" min="8" max="50" step="1" value="25" style="flex:1"><span id="c3rv" style="min-width:24px;text-align:right;font-family:monospace;font-weight:600;color:#2f7d6b">25</span></div>' +
      '<div style="font-size:12px;display:flex;align-items:center;gap:6px"><label style="min-width:80px;color:#5d666d">井斜角</label><input id="c3a" type="range" min="0" max="80" step="1" value="15" style="flex:1"><span id="c3av" style="min-width:24px;text-align:right;font-family:monospace;font-weight:600;color:#2f7d6b">15</span></div>' +
      '</div>' +

      '<div>' +
      '<svg id="c3shap" style="width:100%" viewBox="0 0 420 160"></svg>' +
      '<div id="c3gauge" style="margin-top:10px;background:#fdfcf9;border:1px solid #e9e4d8;border-radius:8px;padding:14px">' +
      '<div style="font-size:12px;color:#79828a;text-transform:uppercase;letter-spacing:1px;margin-bottom:6px">漏失概率</div>' +
      '<div style="font-size:32px;font-weight:700;font-family:monospace" id="c3pval">—%</div>' +
      '<div id="c3badge"></div>' +
      '<div id="c3advice" style="margin-top:10px;font-size:12px;line-height:1.6"></div>' +
      '</div></div></div></div>';

    var shapSvg = root.querySelector('#c3shap');

    function draw() {
      var pp = +root.querySelector('#c3pp').value;
      var fp = +root.querySelector('#c3fp').value;
      var cd = +root.querySelector('#c3cd').value;
      var rate = +root.querySelector('#c3r').value;
      var angle = +root.querySelector('#c3a').value;
      root.querySelector('#c3ppv').textContent = pp.toFixed(2);
      root.querySelector('#c3fpv').textContent = fp.toFixed(2);
      root.querySelector('#c3cdv').textContent = cd.toFixed(2);
      root.querySelector('#c3rv').textContent = rate;
      root.querySelector('#c3av').textContent = angle;

      var r = predict(pp, fp, cd, rate, angle);
      var pct = (r.p * 100).toFixed(1);
      var pval = root.querySelector('#c3pval');
      pval.textContent = pct + '%';
      pval.style.color = r.p > 0.7 ? '#b05a51' : r.p > 0.3 ? '#b26a39' : '#2f7d6b';

      root.querySelector('#c3badge').innerHTML = r.p > 0.7
        ? '<span style="display:inline-block;padding:3px 8px;border-radius:4px;background:#f9e9e5;color:#b05a51;font-size:11px;font-weight:600">⚠ 高风险</span>'
        : r.p > 0.3
        ? '<span style="display:inline-block;padding:3px 8px;border-radius:4px;background:#f8ecdf;color:#b26a39;font-size:11px;font-weight:600">⚡ 中风险</span>'
        : '<span style="display:inline-block;padding:3px 8px;border-radius:4px;background:#e6f1ec;color:#2f7d6b;font-size:11px;font-weight:600">✓ 低风险</span>';

      var features = [
        { name: '裕度', v: r.shap.margin },
        { name: '窗口', v: r.shap.windowWidth },
        { name: '密度', v: r.shap.cd },
        { name: '排量', v: r.shap.rate },
        { name: '井斜', v: r.shap.angle }
      ];
      var vals = features.map(function (f) { return f.v; });
      var maxAbs = Math.max.apply(null, vals.map(Math.abs)) || 0.01;

      var SW = 420, SH = 160, m = { l: 60, r: 20, t: 14, b: 24 };
      var bw = SW - m.l - m.r;
      var nF = features.length, fh = (SH - m.t - m.b) / nF;
      var midX = m.l + bw / 2;

      var s = '<line x1="' + midX + '" y1="' + m.t + '" x2="' + midX + '" y2="' + (SH - m.b) + '" stroke="#c9c2b0" stroke-dasharray="3 3"/>';
      features.forEach(function (f, i) {
        var y = m.t + i * fh + fh / 2;
        var barLen = Math.abs(f.v) / maxAbs * (bw / 2 - 6);
        var x0 = f.v >= 0 ? midX : midX - barLen;
        var col = f.v >= 0 ? '#b05a51' : '#2f7d6b';
        s += '<text x="' + (m.l - 6) + '" y="' + (y + 3) + '" font-size="10" fill="#5d666d" text-anchor="end">' + f.name + '</text>';
        s += '<rect x="' + x0 + '" y="' + (y - 7) + '" width="' + barLen + '" height="14" rx="2" fill="' + col + '" opacity="0.85"/>';
        s += '<text x="' + (f.v >= 0 ? x0 + barLen + 4 : x0 - 4) + '" y="' + (y + 3) + '" font-size="9" fill="' + col + '" font-family="monospace" text-anchor="' + (f.v >= 0 ? 'start' : 'end') + '">' + f.v.toFixed(2) + '</text>';
      });
      shapSvg.innerHTML = s;

      var adv = root.querySelector('#c3advice');
      if (r.p > 0.7) adv.innerHTML = '<b style="color:#b05a51">⚠ 不建议当前设计</b><br>主要风险：' + (r.shap.margin > r.shap.windowWidth ? '窗口裕度不足' : '密度窗口过窄') + '。建议降低密度至 ' + (Math.max(pp + 0.03, cd - 0.06)).toFixed(2) + ' g/cm³。';
      else if (r.p > 0.3) adv.innerHTML = '<b style="color:#b26a39">⚡ 建议复核</b><br>主要影响：' + (r.shap.cd > r.shap.rate ? '密度偏高' : '排量偏大') + '。可降低密度 0.03 g/cm³ 或增大排量提高顶替。';
      else adv.innerHTML = '<b style="color:#2f7d6b">✓ 设计合理</b><br>可按当前设计施工。';
    }
    ['#c3pp', '#c3fp', '#c3cd', '#c3r', '#c3a'].forEach(function (id) { root.querySelector(id).addEventListener('input', draw); });
    draw();
  };
  window.C3LossPredDemoCleanup = function () {};
})();
