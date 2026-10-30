/* 案例 c3 · 固井漏失风险预测 */
(function () {

  /* ---------- SVG 插图 ---------- */
  /* 沿井深的当量密度 vs 破裂压力 —— 风险段高亮 */
  function figRiskProfile() {
    var s = '<svg viewBox="0 0 620 180" xmlns="http://www.w3.org/2000/svg">';
    var ml = 48, mb = 28, mr = 20, mt = 20;
    var W = 620 - ml - mr, H = 180 - mt - mb;
    s += '<rect x="' + ml + '" y="' + mt + '" width="' + W + '" height="' + H + '" fill="#fdfcf9" stroke="#e9e4d8"/>';
    // 破裂压力 + 误差带
    s += '<path d="M' + ml + ' ' + (mt + H * 0.3) + ' Q' + (ml + W * 0.3) + ' ' + (mt + H * 0.4) + ' ' + (ml + W * 0.7) + ' ' + (mt + H * 0.32) + ' T' + (ml + W) + ' ' + (mt + H * 0.25) + '" fill="none" stroke="#b05a51" stroke-width="2.2"/>';
    // 破裂压力的误差带（灰色虚线区域）
    s += '<path d="M' + ml + ' ' + (mt + H * 0.24) + ' Q' + (ml + W * 0.3) + ' ' + (mt + H * 0.34) + ' ' + (ml + W * 0.7) + ' ' + (mt + H * 0.26) + ' T' + (ml + W) + ' ' + (mt + H * 0.19) + ' L' + (ml + W) + ' ' + (mt + H * 0.31) + ' T' + (ml + W * 0.7) + ' ' + (mt + H * 0.38) + ' Q' + (ml + W * 0.3) + ' ' + (mt + H * 0.46) + ' ' + ml + ' ' + (mt + H * 0.36) + ' Z" fill="#b05a51" fill-opacity="0.1" stroke="#b05a51" stroke-opacity="0.35" stroke-dasharray="3 2"/>';
    // 当量密度（带波动）
    s += '<path d="M' + ml + ' ' + (mt + H * 0.55) + ' Q' + (ml + W * 0.2) + ' ' + (mt + H * 0.48) + ' ' + (ml + W * 0.4) + ' ' + (mt + H * 0.45) + ' Q' + (ml + W * 0.55) + ' ' + (mt + H * 0.38) + ' ' + (ml + W * 0.65) + ' ' + (mt + H * 0.33) + ' Q' + (ml + W * 0.78) + ' ' + (mt + H * 0.28) + ' ' + (ml + W) + ' ' + (mt + H * 0.4) + '" fill="none" stroke="#31393d" stroke-width="2"/>';
    // 超过破裂压力的漏失风险段 (红色填充)
    s += '<rect x="' + (ml + W * 0.62) + '" y="' + mt + '" width="' + (W * 0.1) + '" height="' + H + '" fill="#b05a51" fill-opacity="0.15"/>';
    s += '<text x="' + (ml + W * 0.67) + '" y="' + (mt + H + 18) + '" font-size="9" fill="#b05a51" text-anchor="middle">漏失风险段</text>';
    // 标注
    s += '<text x="' + ml + '" y="' + (mt - 6) + '" font-size="9" fill="#79828a" font-family="monospace">0 m</text>';
    s += '<text x="' + (ml + W) + '" y="' + (mt - 6) + '" font-size="9" fill="#79828a" font-family="monospace" text-anchor="end">3500 m</text>';
    s += '<text x="' + (ml + 6) + '" y="' + (mt + H * 0.16) + '" font-size="10" fill="#b05a51" font-weight="600" paint-order="stroke" stroke="#fdfcf9" stroke-width="3">破裂压力（±0.04 误差带）</text>';
    s += '<text x="' + (ml + 6) + '" y="' + (mt + H * 0.65) + '" font-size="10" fill="#31393d" font-weight="600" paint-order="stroke" stroke="#fdfcf9" stroke-width="3">当量密度（实时监控）</text>';
    // 裕度指示
    s += '<text x="' + ml + '" y="' + (mt + H * 0.85) + '" font-size="9" fill="#2f7d6b">安全裕度 = 破裂压力 − 当量密度</text>';
    s += '</svg>';
    return s;
  }

  /* SHAP 特征归因条形图 */
  function figSHAPBar() {
    var feat = [
      ['密度窗口裕度', -1.8, '#b05a51'],
      ['破裂压力误差', -1.2, '#b26a39'],
      ['排量', 0.8, '#41699b'],
      ['井斜角', -0.6, '#7e5a8d'],
      ['孔隙压力', 0.5, '#2f7d6b'],
      ['水泥浆密度', 0.3, '#767a2e'],
      ['井径扩大率', -0.2, '#79828a']
    ];
    var ml = 100, mb = 24, mr = 20, mt = 16;
    var W = 620 - ml - mr, barH = 16, gap = 4;
    var H = mt + feat.length * (barH + gap) + mb;
    var s = '<svg viewBox="0 0 620 ' + H + '" xmlns="http://www.w3.org/2000/svg">';
    s += '<rect x="' + (ml - 60) + '" y="0" width="' + (W + 80) + '" height="' + H + '" fill="#fdfcf9" stroke="#e9e4d8"/>';
    var zeroX = ml + W / 2;
    s += '<line x1="' + zeroX + '" y1="' + mt + '" x2="' + zeroX + '" y2="' + (mt + feat.length * (barH + gap) - gap) + '" stroke="#c9c2b0" stroke-width="1"/>';
    feat.forEach(function (f, i) {
      var y = mt + i * (barH + gap);
      var v = f[1], col = f[2];
      var bw = Math.abs(v) * (W / 4); // 最大绝对值 ~2
      var x = v >= 0 ? zeroX : zeroX - bw;
      s += '<rect x="' + x + '" y="' + y + '" width="' + bw + '" height="' + barH + '" fill="' + col + '" fill-opacity="0.75" rx="3"/>';
      s += '<text x="' + (ml - 6) + '" y="' + (y + barH / 2 + 3) + '" text-anchor="end" font-size="10" fill="#242b2e">' + f[0] + '</text>';
      s += '<text x="' + (v >= 0 ? x + bw + 4 : x - 4) + '" y="' + (y + barH / 2 + 3) + '" text-anchor="' + (v >= 0 ? 'start' : 'end') + '" font-size="9" fill="#5d666d" font-family="monospace">' + (v >= 0 ? '+' : '') + v.toFixed(1) + '</text>';
    });
    // 底部标签（右侧文字收进画布内，避免被 viewBox 裁剪）
    s += '<text x="' + (ml - 10) + '" y="' + (H - 6) + '" font-size="9" fill="#b05a51" text-anchor="end">↓ 降低漏失概率</text>';
    s += '<text x="' + (ml + W) + '" y="' + (H - 6) + '" font-size="9" fill="#41699b" text-anchor="end">↑ 提高漏失概率</text>';
    s += '</svg>';
    return s;
  }

  Cases.register({
    id: 'c3-loss-pred',
    sceneId: 'c3',
    title: '固井漏失风险预测：密度窗口与当量密度的实时监控',
    status: 'ready',
    version: '1.0.0',
    updated: '2026-10-23',
    tabs: {
      background: {
        label: '专业背景',
        judge: [
          { label: '任务类型', value: '二分类 + 分级', desc: '漏失概率输出', html: '<span style="color:var(--c-opt)">OPT</span>' },
          { label: '数据门槛', value: '200+ 井次', desc: '井况 + 浆柱 + 漏失记录' },
          { label: '收益', value: '误报降 40%', desc: '风险分级 + 可解释' },
          { label: '难度', value: '中', desc: '漏失事件占比低', html: K.dtag('中') }
        ],
        lede: '固井漏失是最常见的固井事故，一旦泵压超过地层破裂压力，环空液体进入地层，水泥返高不够，严重时整井需要重注。传统风险判断靠工程师手算当量密度并与破裂压力对比，但破裂压力本身有解释误差，循环附加压力也依赖经验估算。',
        sections: [
          { no: 1, en: 'PROBLEM', title: '当前做法与问题',
            html: '<p>固井漏失的本质是<b>当量密度 > 破裂压力</b>。工程师在设计阶段会计算各深度段的当量密度曲线，与破裂压力剖面对比，看窗口是否被顶破。</p>' +
              K.figure(figRiskProfile(), 2, '图 1 · 沿井深的当量密度曲线 vs 破裂压力剖面。红色虚线带是破裂压力的解释误差区间；当量密度一旦进入风险区（右段），漏失概率陡增') +
              '<p>问题：破裂压力本身是解释值，误差常在 0.03—0.05 g/cm³；循环附加压力的估算依赖经验公式；漏失事件占比通常只有 10—15%，训练样本严重不均衡。传统用固定阈值预警，误报率偏高——工程师对误报已经麻木，真漏失来了反而不重视。</p>' },
          { no: 2, en: 'INTERVENTION', title: 'AI 能做什么',
            html: '<p>① 训练<b>GBDT / XGBoost 分类器</b>，用 SMOTE 处理类不均衡，输出<b>漏失概率</b>而非硬分类；</p>' +
              '<p>② 用<b>SHAP / LIME 特征归因</b>让工程师知道"为什么这口井风险高——因为破裂压力窗口窄 + 排量大"；</p>' +
              '<p>③ 施工中每 30 秒更新当量密度和漏失概率，超过阈值分级推送预警。</p>' +
              K.figure(figSHAPBar(), 2, '图 2 · SHAP 特征归因条形图：哪些因素主导漏失风险。宽度代表对概率的贡献方向，红色负向（降低风险），蓝色正向（提高风险）') +
              '<p>关键洞察：<b>不要硬分类</b>——输出概率 + 置信区间，让工程师根据业务代价自己判断阈值。</p>' },
          { no: 3, en: 'DATA', title: '需要准备什么',
            html: '<p style="margin-bottom:14px">建模数据清单：</p>' +
              K.checklist([
                ['孔隙压力剖面', '沿井深逐点', '解释值（带误差）'],
                ['破裂压力剖面', '沿井深逐点', '解释值（带误差）'],
                ['井况参数', '井径、井斜、套管程序', '静态'],
                ['浆柱设计', '密度、流变性、排量', '设计值'],
                ['漏失标签', '是否漏失、漏失段、漏失原因', '结果记录']
              ]) },
          { no: 4, en: 'DIFFICULTY', title: '难度与参考方向',
            html: '<div style="display:flex;align-items:center;gap:14px;margin-bottom:2px">' +
              K.dtag('中') + '<span class="small muted">漏失事件少且标签噪声大，可解释性是关键。</span></div>' +
              K.meter('中') +
              '<p>核心难点：漏失事件少（10—15%）+ 破裂压力解释误差传导。解决方向：</p>' +
              '<p>① 用 SMOTE 或焦点损失处理类不均衡；</p>' +
              '<p>② 输出概率区间而非点估计；</p>' +
              '<p>③ 强制加入特征归因，"黑盒"预警没人信。</p>' +
              '<p style="margin-top:18px"><span class="kicker plain" style="color:var(--ink-4)">可借鉴技术</span></p>' +
              K.refs(['GBDT/XGBoost', 'SMOTE 过采样', 'SHAP/LIME 归因', '概率校准'], '#/method/opt') }
        ]
      },
      workflow: {
        label: '案例流程',
        title: '案例：180 井次固井漏失风险建模',
        lead: [
          '某油田 180 井次的固井数据，其中 23 次发生漏失（12.8%）。建模目标：施工前预测漏失概率，施工中实时监控当量密度。',
          '用概率输出替代硬分类，让工程师在风险和效率之间做权衡。'
        ],
        stats: [['总井次', '180'], ['漏失井次', '23'], ['模型 AUC', '0.89'], ['漏失召回率', '87%']],
        steps: [
          { name: '数据清洗与特征工程', role: '数据', do: '把原始井况参数转换为密度窗口裕度、当量密度峰值等特征，统一单位。', effect: '数值化特征矩阵。', trap: '破裂压力解释误差直接影响特征质量。' },
          { name: '类不均衡处理', role: '算法', do: '对训练集做 SMOTE 过采样 + 分层 K 折交叉验证。', effect: '模型不再倾向于"全判非漏失"。', trap: '过采样后要单独评估真实验证集。' },
          { name: '分类器训练', role: '算法', do: '训练 GBDT 分类器，输出漏失概率而非硬标签。', effect: '可校准的概率输出。', trap: '阈值不是 0.5，要根据业务代价调。' },
          { name: '特征归因分析', role: '可解释', do: '用 SHAP 值分析每个特征的贡献，生成"风险因子排名"。', effect: '工程师知道风险来自哪里。', trap: '归因要可视化呈现。' },
          { name: '实时监控系统', role: '部署', do: '施工中每 30 秒更新当量密度和漏失概率，分级推送预警。', effect: '给司钻争取处置时间。', trap: '预警太多会被忽略，要分级。' }
        ],
        metrics: { title: '怎么算"预测对了"', html: '<p>因为漏失只占 13%，<b>准确率 90% 毫无意义</b>——全判非漏失也有 87%。正确的指标是：<b>AUC</b>（概率排序能力）、<b>召回率</b>（漏失井被找回的比例）、<b>告警准确率</b>（工程师收到预警后真漏了的比例）。</p>' },
        fails: [
          { name: '类不均衡导致召回率低', why: '模型倾向于全判多数类。解决：SMOTE + 代价敏感学习。' },
          { name: '破裂压力解释误差传导', why: '输入本身有误差。解决：用概率区间代替点估计。' },
          { name: '新井分布漂移', why: '不同区块地层不同。解决：定期增量训练 + 区块专属模型。' }
        ]
      },
      demo: { label: '可运行示范', mount: function (root, ctx) { if (window.C3LossPredDemo) window.C3LossPredDemo(root); else root.innerHTML = '<div style="color:#b05a51">示范脚本未加载</div>'; }, unmount: function () { if (window.C3LossPredDemoCleanup) window.C3LossPredDemoCleanup(); } }
    }
  });
})();
