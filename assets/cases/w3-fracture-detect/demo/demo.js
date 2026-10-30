/* w3-fracture-detect 示范 · 成像测井裂缝识别 */
(function () {
  "use strict";
  window.W3FractureDetectDemo = function (root) {
    /* ---------- 画布与数据 ---------- */
    var W = 620, H = 420, GX = 40, GY = 26;
    var CW = 15, CH = 15;             // 单元格尺寸
    var m = { l: 46, r: 10, t: 28, b: 30 };
    var pw = W - m.l - m.r, ph = H - m.t - m.b;
    var DEPTH0 = 3200;                // 顶部深度（m）

    /* 固定种子伪随机（每次渲染一致） */
    function mulberry32(a) {
      return function () {
        a |= 0; a = (a + 0x6D2B79F5) | 0;
        var t = Math.imul(a ^ (a >>> 15), 1 | a);
        t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
        return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
      };
    }

    /* 裂缝定义：mid 基线、period 周期(px)、phase、width 视开度(px)、induced 假裂缝 */
    var fracs = [
      { mid: 150, period: 300, phase: -0.5, width: 7, induced: false, id: 1 },
      { mid: 260, period: 420, phase: 2.2, width: 5, induced: false, id: 2 },
      { mid: 350, period: 520, phase: 4.0, width: 6, induced: false, id: 3 },
      { mid: 90, period: 9999, phase: 0, width: 6, induced: true, id: 4 }
    ];
    var AMP_K = 0.95;                 // 倾角 → 半幅映射
    var dip1 = 34;                    // 裂缝 1 当前倾角（滑杆控制）
    var thresh = 22;                  // 分割阈值 1—50
    var filterInd = true;

    function ampOf(f) {
      if (f.induced) return 0;
      return f.id === 1 ? Math.tan(dip1 * Math.PI / 180) * AMP_K * 60 : f.period * 0.16;
    }
    function fy(f, x) {               // 像素 y
      return f.mid + ampOf(f) * Math.sin(2 * Math.PI * (x - m.l) / f.period + f.phase);
    }

    /* 背景纹理值（0-1，值越大越"暗"= 低电阻率） */
    var tex = [];
    (function () {
      var r = mulberry32(20261030);
      for (var j = 0; j < GY; j++) {
        for (var i = 0; i < GX; i++) {
          var v = 0.12 + r() * 0.3;                       // 基线噪声
          var cx = m.l + i * CW + CW / 2, cy = m.t + j * CH + CH / 2;
          fracs.forEach(function (f) {
            if (f.induced) return;
            var d = Math.abs(cy - fy(f, cx));
            if (d < 26) v += 0.55 * Math.exp(-(d * d) / 40);   // 裂缝暗带
          });
          /* 诱导缝：两条对称竖纹 */
          if (Math.abs(cx - (m.l + 105)) < 9 || Math.abs(cx - (m.l + 105 + pw / 2)) < 9) v += 0.5 * Math.exp(-Math.pow((cy - 100) / 60, 2));
          tex.push(Math.min(1, v));
        }
      }
    })();

    root.innerHTML = '' +
      '<div style="font-family:-apple-system,sans-serif;padding:12px 0">' +
      '<div style="font-size:18px;font-weight:600;margin-bottom:4px">成像测井裂缝识别：分割 + 正弦拟合</div>' +
      '<div style="font-size:12px;color:#79828a;margin-bottom:12px;line-height:1.7">调低阈值：只检出裂缝核心（边缘漏检）；调高阈值：裂缝带外的噪声也被算进来（橙色误检）。拖动倾角滑杆看正弦幅度随倾角变化；勾选规则过滤可剔除 180° 对称的钻井诱导缝。</div>' +
      '<div style="display:flex;gap:16px;margin-bottom:10px;font-size:12px;color:#5d666d;flex-wrap:wrap;align-items:center">' +
      '<label>分割阈值 <input id="w3th" type="range" min="1" max="50" value="22" style="vertical-align:middle"> <b id="w3thv" style="font-family:monospace">22</b></label>' +
      '<label>裂缝 1 倾角 <input id="w3dp" type="range" min="8" max="72" value="34" style="vertical-align:middle"> <b id="w3dpv" style="font-family:monospace">34°</b></label>' +
      '<label><input id="w3fi" type="checkbox" checked> 假裂缝过滤（诱导缝规则）</label>' +
      '</div>' +
      '<div style="display:grid;grid-template-columns:1fr 210px;gap:14px">' +
      '<div><svg id="w3svg" style="width:100%" viewBox="0 0 620 420" role="img"></svg></div>' +
      '<div style="background:#fdfcf9;border:1px solid #e9e4d8;border-radius:8px;padding:12px;font-size:12px;line-height:1.7">' +
      '<div style="font-size:10px;color:#79828a;text-transform:uppercase;letter-spacing:1px;margin-bottom:8px">分割输出</div>' +
      '<div style="display:flex;justify-content:space-between;padding:2px 0"><span style="color:#5d666d">检出裂缝</span><span style="font-family:monospace;font-weight:600" id="w3cnt">—</span></div>' +
      '<div style="display:flex;justify-content:space-between;padding:2px 0"><span style="color:#5d666d">平均倾角</span><span style="font-family:monospace;font-weight:600" id="w3dip">—</span></div>' +
      '<div style="display:flex;justify-content:space-between;padding:2px 0"><span style="color:#5d666d">平均视开度</span><span style="font-family:monospace;font-weight:600" id="w3wd">—</span></div>' +
      '<div style="display:flex;justify-content:space-between;padding:2px 0"><span style="color:#5d666d">密度 P10</span><span style="font-family:monospace;font-weight:600" id="w3p10">—</span></div>' +
      '<div style="display:flex;justify-content:space-between;padding:2px 0"><span style="color:#5d666d">误检点</span><span style="font-family:monospace;font-weight:600" id="w3fp">—</span></div>' +
      '<div id="w3tip" style="margin-top:10px;padding:8px;background:#f8f8f5;border-radius:4px;font-size:11px;line-height:1.6"></div>' +
      '</div></div></div>';

    var svg = root.querySelector('#w3svg');

    function draw() {
      var tol = thresh * 0.34;        // 检出容差（px）
      var s = '';
      /* 纹理格 */
      var r2 = mulberry32(99);
      var falsePos = 0;
      for (var j = 0; j < GY; j++) {
        for (var i = 0; i < GX; i++) {
          var v = tex[j * GX + i];
          var g = Math.round(246 - v * 96);
          var cx = m.l + i * CW + CW / 2, cy = m.t + j * CH + CH / 2;
          /* 判定：是否被检出 */
          var hitF = null, hitD = 1e9;
          fracs.forEach(function (f) {
            if (f.induced && filterInd) return;
            var d = Math.abs(cy - fy(f, cx));
            if (f.induced) {
              var near = Math.abs(cx - (m.l + 105)) < 9 || Math.abs(cx - (m.l + 105 + pw / 2)) < 9;
              if (near) { d = Math.abs(cy - 100); }
              else d = 1e9;
            }
            if (d < hitD) { hitD = d; hitF = f; }
          });
          var detected = hitF && hitD < hitF.width / 2 + tol && v > 0.28;
          var isNoise = detected && hitD > hitF.width / 2 + 1.2;
          s += '<rect x="' + (m.l + i * CW + 0.5) + '" y="' + (m.t + j * CH + 0.5) + '" width="' + (CW - 1) + '" height="' + (CH - 1) + '" fill="rgb(' + g + ',' + (g + 1) + ',' + (g + 3) + ')"/>';
          if (detected) {
            s += '<rect x="' + (cx - 2.4) + '" y="' + (cy - 2.4) + '" width="4.8" height="4.8" rx="1" fill="' + (isNoise ? '#d89a4e' : (hitF.induced ? '#b05a51' : '#2f7d6b')) + '" opacity="0.85"/>';
            if (isNoise) falsePos++;
          }
        }
      }
      /* 拟合正弦（虚线）与真裂缝参考线 */
      fracs.forEach(function (f) {
        if (f.induced) {
          if (!filterInd) {
            s += '<line x1="' + (m.l + 105) + '" y1="' + m.t + '" x2="' + (m.l + 103) + '" y2="' + (m.t + 150) + '" stroke="#b05a51" stroke-width="2.4"/>';
            s += '<line x1="' + (m.l + 105 + pw / 2) + '" y1="' + m.t + '" x2="' + (m.l + 107 + pw / 2) + '" y2="' + (m.t + 150) + '" stroke="#b05a51" stroke-width="2.4"/>';
            s += '<text x="' + (m.l + 115) + '" y="' + (m.t + 60) + '" font-size="9" fill="#b05a51">诱导缝未过滤</text>';
          }
          return;
        }
        var pts = [], x;
        for (x = 0; x <= pw; x += 6) {
          pts.push((x ? 'L' : 'M') + (m.l + x).toFixed(1) + ' ' + fy(f, m.l + x).toFixed(1));
        }
        s += '<path d="' + pts.join(' ') + '" fill="none" stroke="#2f7d6b" stroke-width="1.6" stroke-dasharray="5 3" opacity="0.9"/>';
      });
      /* 框与坐标 */
      s += '<rect x="' + m.l + '" y="' + m.t + '" width="' + pw + '" height="' + ph + '" fill="none" stroke="#c9c2b0"/>';
      for (var a = 0; a <= 360; a += 90) {
        var xa = m.l + a / 360 * pw;
        s += '<line x1="' + xa + '" y1="' + (m.t + ph) + '" x2="' + xa + '" y2="' + (m.t + ph + 4) + '" stroke="#9ba3a9"/>';
        s += '<text x="' + xa + '" y="' + (m.t + ph + 16) + '" font-size="9" font-family="monospace" fill="#9ba3a9" text-anchor="middle">' + a + '°</text>';
      }
      for (var d2 = 0; d2 <= 400; d2 += 200) {
        var yd = m.t + d2 / 400 * ph;
        s += '<line x1="' + (m.l - 4) + '" y1="' + yd + '" x2="' + m.l + '" y2="' + yd + '" stroke="#9ba3a9"/>';
        s += '<text x="' + (m.l - 7) + '" y="' + (yd + 3) + '" font-size="9" font-family="monospace" fill="#9ba3a9" text-anchor="end">' + (DEPTH0 + d2) + '</text>';
      }
      s += '<text x="' + (m.l + pw / 2) + '" y="' + (m.t + ph + 28) + '" font-size="9" font-family="monospace" fill="#9ba3a9" text-anchor="middle">方位角（井壁展开 0—360°）</text>';
      s += '<text x="' + (m.l - 7) + '" y="' + (m.t - 10) + '" font-size="9" font-family="monospace" fill="#9ba3a9">深度 m</text>';
      s += '</svg>';
      svg.innerHTML = s;

      /* 统计 */
      var kept = fracs.filter(function (f) { return !(f.induced && filterInd); });
      var trueFr = kept.filter(function (f) { return !f.induced; });
      var dipSum = 0;
      trueFr.forEach(function (f) {
        var A = ampOf(f);
        dipSum += Math.atan(A / (60 * AMP_K)) * 180 / Math.PI;
      });
      var avgW = (trueFr.reduce(function (a, f) { return a + f.width; }, 0) / trueFr.length * 0.09).toFixed(1);
      var p10 = (trueFr.length / 4).toFixed(2);
      root.querySelector('#w3cnt').textContent = kept.length + ' 条';
      root.querySelector('#w3dip').textContent = Math.round(dipSum / trueFr.length) + '°';
      root.querySelector('#w3wd').textContent = avgW + ' mm';
      root.querySelector('#w3p10').textContent = p10 + ' 条/m';
      root.querySelector('#w3fp').textContent = falsePos + '（橙）';
      root.querySelector('#w3tip').innerHTML = thresh < 12
        ? '<b style="color:#b26a39">阈值偏低</b>：只检出裂缝核心带，边缘像素缺失，视开度会被低估。'
        : (thresh > 34
          ? '<b style="color:#b05a51">阈值偏高</b>：裂缝带外的噪声格点也被检出（橙色误检点 ' + falsePos + ' 个），密度被高估。'
          : '<b style="color:#2f7d6b">阈值适中</b>：检出点贴近真实裂缝带，误检可控。实际项目里阈值由验证集 IoU 网格搜索确定。');
    }

    root.querySelector('#w3th').addEventListener('input', function () {
      thresh = +this.value;
      root.querySelector('#w3thv').textContent = thresh;
      draw();
    });
    root.querySelector('#w3dp').addEventListener('input', function () {
      dip1 = +this.value;
      root.querySelector('#w3dpv').textContent = dip1 + '°';
      draw();
    });
    root.querySelector('#w3fi').addEventListener('change', function () {
      filterInd = this.checked;
      draw();
    });
    draw();
  };

  window.W3FractureDetectDemoCleanup = function () {};
})();
