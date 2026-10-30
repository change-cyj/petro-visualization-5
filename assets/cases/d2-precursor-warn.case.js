/* 案例 d2 · 井下复杂事故前兆预警 */
(function () {

  /* ---------- SVG 插图 ---------- */
  /* 多变量时序中的前兆示意 */
  function figPrecursorTimeline() {
    var N = 4, tracks = ['扭矩', '立压', '钻压', '流量'];
    var cols = ['#41699b', '#2f7d6b', '#b26a39', '#b05a51'];
    var W = 620, mt = 16, mb = 36, ml = 56, mr = 20, th = 34, gap = 4;
    var H = mt + N * (th + gap) + mb;
    var s = '<svg viewBox="0 0 ' + W + ' ' + H + '" xmlns="http://www.w3.org/2000/svg">';
    // 时间分区
    s += '<rect x="' + ml + '" y="' + mt + '" width="' + (W - ml - mr) + '" height="' + (N * (th + gap) - gap) + '" fill="#fdfcf9" stroke="#e9e4d8"/>';
    // 三个时间带
    var xNormal = ml + (W - ml - mr) * 0.45;
    var xPrecur = ml + (W - ml - mr) * 0.7;
    s += '<rect x="' + ml + '" y="' + mt + '" width="' + (xNormal - ml) + '" height="' + (N * (th + gap) - gap) + '" fill="#e6f1ec" fill-opacity="0.4"/>';
    s += '<rect x="' + xNormal + '" y="' + mt + '" width="' + (xPrecur - xNormal) + '" height="' + (N * (th + gap) - gap) + '" fill="#f8ecdf" fill-opacity="0.5"/>';
    s += '<rect x="' + xPrecur + '" y="' + mt + '" width="' + (W - ml - mr - (xPrecur - ml)) + '" height="' + (N * (th + gap) - gap) + '" fill="#b05a51" fill-opacity="0.15"/>';
    s += '<text x="' + (ml + (xNormal - ml) / 2) + '" y="10" text-anchor="middle" font-size="9" fill="#2f7d6b">正常钻进</text>';
    s += '<text x="' + ((xNormal + xPrecur) / 2) + '" y="10" text-anchor="middle" font-size="9" fill="#b26a39">前兆期（22 min）</text>';
    s += '<text x="' + ((xPrecur + W - mr) / 2) + '" y="10" text-anchor="middle" font-size="9" fill="#b05a51">卡钻发生</text>';
    // 每条轨道上画一段波形
    for (var i = 0; i < N; i++) {
      var y = mt + i * (th + gap) + th / 2;
      var lo = y - 10, hi = y + 10;
      var pw = W - ml - mr;
      var path = 'M' + ml + ' ' + y;
      for (var j = 1; j <= 40; j++) {
        var t = j / 40;
        var yy = y + Math.sin(j / 3 + i) * 5;
        if (t > 0.45 && t <= 0.7) yy += Math.sin(j / 2 + i) * 6 + (i === 3 ? -4 : 0);
        if (t > 0.7) yy += Math.sin(j / 1 + i) * 12 + (i === 3 ? -8 : 0);
        path += ' L' + (ml + t * pw).toFixed(0) + ' ' + yy.toFixed(1);
      }
      s += '<path d="' + path + '" fill="none" stroke="' + cols[i] + '" stroke-width="1.6"/>';
      s += '<text x="' + (ml - 6) + '" y="' + (y + 3) + '" text-anchor="end" font-size="9" fill="#5d666d">' + tracks[i] + '</text>';
    }
    // 时间轴
    s += '<line x1="' + ml + '" y1="' + (H - mb + 6) + '" x2="' + (W - mr) + '" y2="' + (H - mb + 6) + '" stroke="#79828a"/>';
    s += '<text x="' + ml + '" y="' + (H - mb + 20) + '" font-size="8" fill="#79828a">0 min</text>';
    s += '<text x="' + (xNormal) + '" y="' + (H - mb + 20) + '" font-size="8" fill="#b26a39" text-anchor="middle">↓ 前兆开始</text>';
    s += '<text x="' + (xPrecur) + '" y="' + (H - mb + 20) + '" font-size="8" fill="#b05a51" text-anchor="middle">↓ 卡钻</text>';
    s += '<text x="' + (W - mr) + '" y="' + (H - mb + 20) + '" font-size="8" fill="#79828a" text-anchor="end">+60 min</text>';
    s += '</svg>';
    return s;
  }

  /* AI 预警架构 */
  function figAnomalyPipeline() {
    var steps = [
      ['多通道时序', '扭矩/立压/钻压/流量', '#e6f1ec', '#2f7d6b'],
      ['基线偏离度', '自编码器\n+ 隔离森林', '#efe9f4', '#7e5a8d'],
      ['窗口特征', '5 min vs 30 min\n变化率', '#f8ecdf', '#b26a39'],
      ['规则过滤', '接单根降敏\n持续 ≥ 3 min', '#f1f1dd', '#767a2e'],
      ['分级预警', '信息 + 可疑通道\n交给司钻', '#fdfcf9', '#31393d']
    ];
    var w = 102, gap = 10, x = 4, y = 22;
    var H = 80;
    var s = '<svg viewBox="0 0 620 ' + (y + H + 28) + '" xmlns="http://www.w3.org/2000/svg">';
    steps.forEach(function (st, i) {
      s += '<rect x="' + x + '" y="' + y + '" width="' + w + '" height="' + H + '" rx="8" fill="' + st[2] + '" stroke="' + st[3] + '" stroke-opacity=".35"/>';
      s += '<rect x="' + x + '" y="' + y + '" width="3" height="' + H + '" rx="1.5" fill="' + st[3] + '"/>';
      s += '<text x="' + (x + 14) + '" y="' + (y + 22) + '" font-size="11" font-weight="600" fill="#242b2e">' + st[0] + '</text>';
      st[1].split('\n').forEach(function (line, k) {
        s += '<text x="' + (x + 14) + '" y="' + (y + 42 + k * 14) + '" font-size="9" fill="#5d666d">' + line + '</text>';
      });
      s += '<text x="' + (x + w - 10) + '" y="' + (y + H - 6) + '" font-size="8" font-family="monospace" fill="' + st[3] + '">0' + (i + 1) + '</text>';
      if (i < steps.length - 1) {
        s += '<path d="M' + (x + w + 2) + ' ' + (y + H / 2) + 'h8m-3-3 3 3-3 3" stroke="#c9c2b0" stroke-width="1.3" fill="none"/>';
      }
      x += w + gap;
    });
    s += '<text x="6" y="' + (y + H + 18) + '" font-size="9" fill="#2f7d6b">无监督算法</text>';
    s += '<text x="' + (6 + (w + gap) * 2) + '" y="' + (y + H + 18) + '" font-size="9" fill="#b26a39">特征工程</text>';
    s += '<text x="' + (6 + (w + gap) * 3) + '" y="' + (y + H + 18) + '" font-size="9" fill="#767a2e">规则引擎</text>';
    s += '<text x="' + (6 + (w + gap) * 4) + '" y="' + (y + H + 18) + '" font-size="9" fill="#31393d">人机协同</text>';
    s += '</svg>';
    return s;
  }

  Cases.register({
    id: 'd2-precursor-warn',
    sceneId: 'd2',
    title: '井下复杂事故前兆预警：多变量时序异常检测',
    status: 'ready',
    version: '1.0.0',
    updated: '2026-10-23',
    tabs: {
      background: {
        label: '专业背景',
        judge: [
          { label: '任务类型', value: '多变量异常检测', desc: '实时时序 · 无监督', html: '<span style="color:var(--c-ts)">TS</span>' },
          { label: '数据门槛', value: '单井即可', desc: '10+ 通道 · 1-10 s' },
          { label: '收益', value: '提前 10-30 min', desc: '留反应窗口' },
          { label: '难度', value: '高', desc: '异常样本少 + 误报代价高', html: K.dtag('高') }
        ],
        lede: '卡钻、井漏、气侵等井下复杂情况一旦发生，损失以小时到天计。但多数事故前会有"暗流涌动"——扭矩小幅波动、立管压力微升、返出流量缓慢下降这些前兆混在正常工况噪声里，司钻难以及时识别。传统报警用固定阈值，误报和漏报都高。',
        sections: [
          { no: 1, en: 'PROBLEM', title: '当前做法与问题',
            html: '<p>司钻同时监控十几条参数曲线。事故前兆的特点是<b>微弱且跨通道相关</b>：</p>' +
              K.figure(figPrecursorTimeline(), 2, '图 1 · 多变量时序中的卡钻前兆。正常段噪声平稳；前兆期（左 22 min）各通道同时出现微弱异常；随后卡钻发生') +
              '<p>· 卡钻：扭矩波动变大 + 钻压传递效率下降 + 返出流量略降</p>' +
              '<p>· 井漏：立管压力微升 + 返出流量持续低于泵入量 + 钻时加快</p>' +
              '<p>· 气侵：返出流量增加 + 密度下降 + 立管压力波动</p>' +
              '<p>传统固定阈值的问题：设高了漏报，设低了误报（接单根、划眼都会触发）。现场反馈"误报多到麻木"。</p>' },
          { no: 2, en: 'INTERVENTION', title: 'AI 能做什么',
            html: '<p>把预警建模为<b>多变量时序上的异常检测</b>：</p>' +
              '<p>① 用无监督方法（自编码器、隔离森林、MSPC）建立正常基线，计算<b>偏离度分数</b>；</p>' +
              '<p>② 引入<b>滑动窗口变化率特征</b>（最近 5 min vs 前 30 min），捕捉"缓慢恶化"；</p>' +
              '<p>③ 用规则引擎过滤已知工况切换（接单根等），避免误报；</p>' +
              '<p>④ 输出的不只是"报警"，还要给<b>可疑通道列表</b>和<b>趋势图</b>，让司钻知道"什么参数不对劲"。</p>' +
              K.figure(figAnomalyPipeline(), 2, '图 2 · AI 预警架构：无监督算法 + 特征工程 + 规则引擎 + 人机协同，四重过滤后才触发预警') +
              '<p>关键：<b>不要用监督学习硬分类</b>——事故样本太少，无监督基线 + 规则引擎更可行。</p>' },
          { no: 3, en: 'DATA', title: '需要准备什么',
            html: '<p style="margin-bottom:14px">预警数据清单：</p>' +
              K.checklist([
                ['多通道钻井参数', '扭矩、立压、泵压、钻压、转速、流量等', '10+ 通道，1-10 s 采样'],
                ['工况标签', '钻进、接单根、起下钻', '可由规则自动划分'],
                ['事故台账', '时间、类型、处理过程', '用于验证'],
                ['历史参数曲线', '至少 3 口井的完整回放', '无标注也可']
              ]) },
          { no: 4, en: 'DIFFICULTY', title: '难度与参考方向',
            html: '<div style="display:flex;align-items:center;gap:14px;margin-bottom:2px">' +
              K.dtag('高') + '<span class="small muted">闭环最难的环节：异常少 + 分布漂移 + 误报代价高。</span></div>' +
              K.meter('高') +
              '<p>核心难点：</p>' +
              '<p>① 异常样本极少（一口井可能整井没事故），监督学习不可行；</p>' +
              '<p>② 不同钻机、地层的"正常"分布漂移显著；</p>' +
              '<p>③ 预警必须可解释——"扭矩波动 + 钻压传递下降"比一个数字有用。</p>' +
              '<p>改进路线：先从<b>单井无监督基线</b>起步，再加<b>工况感知规则</b>，最后积累样本做弱监督微调。</p>' +
              '<p style="margin-top:18px"><span class="kicker plain" style="color:var(--ink-4)">可借鉴技术</span></p>' +
              K.refs(['隔离森林', '自编码器重构误差', '多变量统计过程控制', '滑动窗口特征'], '#/method/ts') }
        ]
      },
      workflow: {
        label: '案例流程',
        title: '案例：3 口井的钻进过程异常监控',
        lead: [
          '某区块 3 口水平井钻进，其中 1 口发生卡钻事故（直接损失 30 万）。事后回放发现卡钻事故前 22 分钟扭矩开始小幅波动、钻压传递效率缓慢下降——但司钻当时没有及时识别。',
          '目标：把"事后回放"变成"实时预警"，提前 15 分钟以上给出先兆提示。'
        ],
        stats: [['监控通道', '12'], ['采样频率', '5 s'], ['卡钻预警提前', '22 min'], ['误报率', '<5%']],
        steps: [
          { name: '历史数据回放', role: '数据', do: '把 3 口井的高频参数解编、对齐时间戳，标注已知工况和事故时间。', effect: '带时间戳的完整时序。', trap: '不同通道采样时间有偏差，需插值对齐。' },
          { name: '基线建模', role: '算法', do: '用正常钻进段训练隔离森林 + 自编码器，输出多变量异常分数。', effect: '"偏离正常"的连续分数。', trap: '只在正常段训练，事故段本身会被判异常。' },
          { name: '窗口特征提取', role: '特征', do: '计算滑动窗口（5 min vs 30 min）的变化率特征，捕捉"缓慢恶化"。', effect: '对趋势型前兆敏感。', trap: '窗口长度是关键超参。' },
          { name: '规则引擎过滤', role: '后处理', do: '接单根时自动降低敏感度；只在"偏离度高 + 持续 ≥ 3 min + ≥ 2 通道异常"时报警。', effect: '大幅降低误报。', trap: '规则要随钻机调整。' },
          { name: '实时部署与回流', role: '部署', do: '现场服务器实时运行，每 30 s 更新基线，工程师可"标记这次是正常波动"——标记回流后自适应。', effect: '模型越用越准。', trap: '没有回流机制，三个月就过时。' }
        ],
        metrics: { title: '怎么算"预警有效"', html: '<p>核心指标：<b>提前时间</b>（预警到事故 ≥ 15 min）、<b>告警准确率</b>（≥ 80%）。<b>误报率 < 5%</b> 是硬约束——超过阈值工程师就麻木了。</p>' },
        fails: [
          { name: '工况切换触发误报', why: '接单根、划眼偏离正常基线。解决：工况感知的自动敏感度调整。' },
          { name: '缓慢漂移漏检', why: '扭矩每天慢涨 5%，单看绝对值不异常。解决：窗口变化率特征。' },
          { name: '新井分布漂移', why: '不同井地层不同。解决：每口井先跑 2-3 小时建立专属基线。' }
        ]
      },
      demo: { label: '可运行示范', mount: function (root, ctx) { if (window.D2PrecursorWarnDemo) window.D2PrecursorWarnDemo(root); else root.innerHTML = '<div style="color:#b05a51">示范脚本未加载</div>'; }, unmount: function () { if (window.D2PrecursorWarnDemoCleanup) window.D2PrecursorWarnDemoCleanup(); } }
    }
  });
})();
