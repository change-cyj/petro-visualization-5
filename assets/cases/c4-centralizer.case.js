/* 案例 c4 · 套管居中度智能评估与扶正器优化 */
(function () {

  /* ---------- SVG 插图 ---------- */
  /* 截面几何：套管偏心 vs 居中 */
  function figCentralization() {
    var s = '<svg viewBox="0 0 620 200" xmlns="http://www.w3.org/2000/svg">';
    // 左侧：偏心（标题 y=20，图形顶部从 y=44 起，留足间距）
    var cx1 = 130, cy = 112, r = 68;
    s += '<text x="' + cx1 + '" y="20" text-anchor="middle" font-size="11" font-weight="600" fill="#242b2e">偏心（居中度 38%）</text>';
    s += '<circle cx="' + cx1 + '" cy="' + cy + '" r="' + r + '" fill="#fdfcf9" stroke="#79828a" stroke-width="1.5"/>';
    s += '<circle cx="' + (cx1 + 28) + '" cy="' + (cy + 18) + '" r="28" fill="none" stroke="#31393d" stroke-width="2"/>';
    // 水泥环厚/薄标注
    s += '<path d="M' + (cx1 - 42) + ' ' + cy + ' L' + (cx1 - 30) + ' ' + cy + '" stroke="#2f7d6b" stroke-width="1"/>';
    s += '<text x="' + (cx1 - 48) + '" y="' + (cy + 3) + '" font-size="8" fill="#2f7d6b" text-anchor="end" paint-order="stroke" stroke="#fdfcf9" stroke-width="3">厚</text>';
    s += '<path d="M' + (cx1 + 56) + ' ' + (cy + 18) + ' L' + (cx1 + 66) + ' ' + (cy + 18) + '" stroke="#b05a51" stroke-width="1"/>';
    s += '<text x="' + (cx1 + 70) + '" y="' + (cy + 21) + '" font-size="8" fill="#b05a51" paint-order="stroke" stroke="#fdfcf9" stroke-width="3">薄</text>';
    // 扶正器暗示（虚线）
    s += '<circle cx="' + (cx1 + 28) + '" cy="' + (cy + 18) + '" r="38" fill="none" stroke="#b26a39" stroke-width="1" stroke-dasharray="3 2"/>';
    // 中间箭头
    s += '<path d="M244 112 h26 m-5-4 5 4 -5 4" stroke="#79828a" fill="none" stroke-width="1.4"/>';
    // 中间：加扶正器后居中（齿缩短到 r=56，距标题 36px）
    var cx2 = 372;
    s += '<text x="' + cx2 + '" y="20" text-anchor="middle" font-size="11" font-weight="600" fill="#242b2e">加扶正器后（居中度 85%）</text>';
    s += '<circle cx="' + cx2 + '" cy="' + cy + '" r="' + r + '" fill="#fdfcf9" stroke="#79828a" stroke-width="1.5"/>';
    s += '<circle cx="' + cx2 + '" cy="' + cy + '" r="30" fill="none" stroke="#31393d" stroke-width="2"/>';
    s += '<g stroke="#2f7d6b" stroke-width="3" stroke-linecap="round" fill="none">';
    s += '<line x1="' + (cx2 - 34) + '" y1="' + cy + '" x2="' + (cx2 - 56) + '" y2="' + cy + '"/>';
    s += '<line x1="' + (cx2 + 34) + '" y1="' + cy + '" x2="' + (cx2 + 56) + '" y2="' + cy + '"/>';
    s += '<line x1="' + cx2 + '" y1="' + (cy - 34) + '" x2="' + cx2 + '" y2="' + (cy - 56) + '"/>';
    s += '<line x1="' + cx2 + '" y1="' + (cy + 34) + '" x2="' + cx2 + '" y2="' + (cy + 56) + '"/>';
    s += '</g>';
    // 右侧：沿井深示意（矩形顶部 y=48，距标题 28px）
    var rx = 520, ry = 112, rH = 128;
    s += '<text x="' + rx + '" y="20" text-anchor="middle" font-size="11" font-weight="600" fill="#242b2e">沿井深扶正器安放</text>';
    s += '<rect x="' + (rx - 12) + '" y="' + (ry - rH / 2) + '" width="24" height="' + rH + '" fill="#efe9f4" stroke="#79828a"/>';
    s += '<rect x="' + (rx - 6) + '" y="' + (ry - rH / 2) + '" width="12" height="' + rH + '" fill="#31393d" fill-opacity="0.15"/>';
    [ry - rH / 2 + 14, ry - 12, ry + 24, ry + rH / 2 - 24, ry + rH / 2 - 6].forEach(function (yy) {
      s += '<circle cx="' + rx + '" cy="' + yy + '" r="4" fill="#2f7d6b"/>';
    });
    s += '<text x="' + (rx - 12) + '" y="' + (ry + rH / 2 + 14) + '" font-size="8" fill="#79828a">深 →</text>';
    s += '</svg>';
    return s;
  }

  /* 沿井深的居中度曲线对比 */
  function figProfileCompare() {
    var ml = 48, mb = 30, mr = 20, mt = 20;
    var W = 620 - ml - mr, H = 160 - mt - mb;
    var s = '<svg viewBox="0 0 620 160" xmlns="http://www.w3.org/2000/svg">';
    s += '<rect x="' + ml + '" y="' + mt + '" width="' + W + '" height="' + H + '" fill="#fdfcf9" stroke="#e9e4d8"/>';
    // Y 轴刻度
    s += '<line x1="' + ml + '" y1="' + mt + '" x2="' + ml + '" y2="' + (mt + H) + '" stroke="#79828a"/>';
    s += '<line x1="' + ml + '" y1="' + (mt + H) + '" x2="' + (ml + W) + '" y2="' + (mt + H) + '" stroke="#79828a"/>';
    // 67% 红线
    var y67 = mt + H * (1 - 0.67);
    s += '<line x1="' + ml + '" y1="' + y67 + '" x2="' + (ml + W) + '" y2="' + y67 + '" stroke="#b05a51" stroke-width="1.2" stroke-dasharray="4 3"/>';
    s += '<text x="' + (ml + W - 4) + '" y="' + (y67 - 4) + '" font-size="8" fill="#b05a51" text-anchor="end">API 67% 下限</text>';
    // 无扶正器曲线（灰）
    var noPath = 'M' + ml + ' ' + (mt + H * 0.5);
    for (var i = 1; i <= 10; i++) {
      var x = ml + (W * i / 10);
      var y = mt + H * (0.5 - Math.sin(i / 2) * 0.15 + (i > 6 ? 0.25 : 0));
      noPath += ' L' + x.toFixed(0) + ' ' + y.toFixed(0);
    }
    s += '<path d="' + noPath + '" fill="none" stroke="#79828a" stroke-width="1.8" stroke-dasharray="4 2"/>';
    // 优化后曲线（绿）
    var optPath = 'M' + ml + ' ' + (mt + H * 0.2);
    for (var i2 = 1; i2 <= 10; i2++) {
      var x2 = ml + (W * i2 / 10);
      var y2 = mt + H * (0.2 - Math.sin(i2 / 2) * 0.08 + (i2 > 6 ? 0.1 : -0.05));
      optPath += ' L' + x2.toFixed(0) + ' ' + y2.toFixed(0);
    }
    s += '<path d="' + optPath + '" fill="none" stroke="#2f7d6b" stroke-width="2"/>';
    // 优化前不达标段 (红底)
    s += '<rect x="' + (ml + W * 0.6) + '" y="' + mt + '" width="' + (W * 0.25) + '" height="' + H + '" fill="#b05a51" fill-opacity="0.08"/>';
    // 标注
    s += '<text x="' + ml + '" y="' + (mt - 6) + '" font-size="9" fill="#79828a" font-family="monospace">0 m</text>';
    s += '<text x="' + (ml + W / 2) + '" y="' + (mt - 6) + '" font-size="9" fill="#79828a" font-family="monospace" text-anchor="middle">居中度</text>';
    s += '<text x="' + (ml + W) + '" y="' + (mt - 6) + '" font-size="9" fill="#79828a" font-family="monospace" text-anchor="end">2500 m</text>';
    // Y 轴刻度放绘图区外，避免与曲线重叠
    s += '<text x="' + (ml - 6) + '" y="' + (mt + 8) + '" font-size="9" fill="#79828a" text-anchor="end">100%</text>';
    s += '<text x="' + (ml - 6) + '" y="' + (mt + H - 4) + '" font-size="9" fill="#79828a" text-anchor="end">0%</text>';
    s += '<text x="' + (ml + W * 0.3) + '" y="' + (mt + 22) + '" font-size="9" fill="#2f7d6b" paint-order="stroke" stroke="#fdfcf9" stroke-width="3">— 优化方案（41只）</text>';
    s += '<text x="' + (ml + W * 0.55) + '" y="' + (mt + 22) + '" font-size="9" fill="#79828a" paint-order="stroke" stroke="#fdfcf9" stroke-width="3">--- 无扶正器基线</text>';
    s += '<text x="' + (ml + W * 0.72) + '" y="' + (mt + H + 18) + '" font-size="9" fill="#b05a51" text-anchor="middle">扩径段（瓶颈）</text>';
    s += '</svg>';
    return s;
  }

  Cases.register({
    id: 'c4-centralizer',
    sceneId: 'c4',
    title: '套管居中度智能评估与扶正器优化',
    status: 'ready',
    version: '1.0.0',
    updated: '2026-10-23',
    tabs: {
      background: {
        label: '专业背景',
        judge: [
          { label: '任务类型', value: '组合优化', desc: '扶正器位置 × 间距', html: '<span style="color:var(--c-opt)">OPT</span>' },
          { label: '数据门槛', value: '单井即可', desc: '井径 + 井斜 + 套管程序' },
          { label: '收益', value: '计算几分钟', desc: '扶正器安放方案' },
          { label: '难度', value: '低', desc: '几何计算为主', html: K.dtag('低') }
        ],
        lede: '套管居中度决定了水泥环是否均匀——居中差的一侧（窄边）水泥环薄、甚至缺水泥，直接导致后期层间窜通。居中度由井径、井斜、套管偏心和扶正器安放共同决定。传统扶正器安放按经验公式，实际井径不规则时居中效果偏差大。',
        sections: [
          { no: 1, en: 'PROBLEM', title: '当前做法与问题',
            html: '<p>居中度 = (套管半径 + 扶正器外径 − 井径最小值) / (井径最大值 − 井径最小值) × 100%，API 要求通常 ≥ 67%。传统做法是按经验公式算扶正器个数 = (井斜度 / 15) × 套管根数，然后均匀安放。</p>' +
              K.figure(figCentralization(), 2, '图 1 · 左：偏心时水泥环一侧薄、窜通风险高；中：加扶正器后居中；右：沿井深安放示意') +
              '<p>问题：真实井径是不规则曲线——某些段井径扩大（溶洞、冲蚀），某些段井径缩小（缩径、岩屑床）。均匀安放扶正器在缩径段可能太多（浪费），在扩径段又太少（居中度不够）。下套管前也难以预判。</p>' },
          { no: 2, en: 'INTERVENTION', title: 'AI 能做什么',
            html: '<p>把扶正器安放建模为<b>沿井深的组合优化</b>问题：</p>' +
              '<p>① 计算<b>无扶正器时的居中度基线</b>，识别瓶颈段；</p>' +
              '<p>② 枚举每根套管位置"放 / 不放"，用动态规划搜索<b>最小扶正器用量下满足全井段居中度 ≥ 67%</b>的方案；</p>' +
              '<p>③ 输出方案 + 标注瓶颈段（哪些位置加扶正器边际效益最高）。</p>' +
              K.figure(figProfileCompare(), 2, '图 2 · 沿井深的居中度曲线对比。灰色虚线是无扶正器基线（扩径段不达标），绿色实线是优化方案（全段越过 API 67% 下限）') +
              '<p>这是几何计算 + 组合优化的组合，完全可解释——不需要"黑盒"。</p>' },
          { no: 3, en: 'DATA', title: '需要准备什么',
            html: '<p style="margin-bottom:14px">优化数据清单：</p>' +
              K.checklist([
                ['井径曲线', '0.1 m 采样（多臂井径仪）', '裸眼测井或套管测井'],
                ['井斜曲线', '每 10—30 m 一个', 'MWD 或裸眼测井'],
                ['套管程序', '外径、壁厚、段长、下深', '设计数据'],
                ['扶正器规格', '外径、类型', '厂家手册']
              ]) },
          { no: 4, en: 'DIFFICULTY', title: '难度与参考方向',
            html: '<div style="display:flex;align-items:center;gap:14px;margin-bottom:2px">' +
              K.dtag('低') + '<span class="small muted">以几何计算为主，可解释性强。</span></div>' +
              K.meter('低') +
              '<p>难度低，注意：</p>' +
              '<p>① 井斜数据通常比井径稀疏，需要插值；</p>' +
              '<p>② 套管自重和浮力会让套管在大井斜段倾向井眼低侧，必须建模；</p>' +
              '<p>③ 结果要可解释——工程师能接受 > 算法最优。</p>' +
              '<p style="margin-top:18px"><span class="kicker plain" style="color:var(--ink-4)">可借鉴技术</span></p>' +
              K.refs(['动态规划', '启发式搜索', '几何计算', '组合优化'], '#/method/opt') }
        ]
      },
      workflow: {
        label: '案例流程',
        title: '案例：一口 2500 m 定向井的扶正器优化',
        lead: [
          '某定向井深 2500 m，最大井斜 42°，井径有多处扩径段。传统经验方案安放 36 只扶正器，居中度 63%（不达标）。用优化方案安放 41 只，居中度提升到 78%。',
          '核心洞察：扶正器不是越多越好，在扩径段加扶正器的边际效益远高于在井斜缓的直井段加。'
        ],
        stats: [['井深', '2500 m'], ['最大井斜', '42°'], ['传统方案', '36 只 · 居中 63%'], ['优化方案', '41 只 · 居中 78%']],
        steps: [
          { name: '井径/井斜数据处理', role: '数据', do: '井径重采样到 1 m，井斜做样条插值对齐深度。', effect: '统一深度轴。', trap: '造斜段插值可能不准。' },
          { name: '基线居中度计算', role: '计算', do: '假设无扶正器，计算每米居中度，识别瓶颈段。', effect: '知道哪里最需要扶正器。', trap: '简化偏心模型可能低估扩径段偏心。' },
          { name: '扶正器效应建模', role: '计算', do: '计算每放一只扶正器对上下 3—5 m 居中度的提升量。', effect: '得到"安放 → 提升"贡献表。', trap: '相邻扶正器效应重叠（边际效益递减）。' },
          { name: '组合优化搜索', role: '算法', do: '动态规划在"每根套管放/不放"空间搜索，目标最少扶正器满足 ≥ 67%。', effect: '最优安放方案。', trap: '要设最大间距约束，避免直井段空档。' },
          { name: '工程师交互式调整', role: '闭环', do: '工程师可拖拽扶正器位置，实时看到居中度变化。', effect: '人机协同的最终方案。', trap: '调整后要重新评估全段约束。' }
        ],
        metrics: { title: '怎么算"居中好了"', html: '<p>API 要求居中度 ≥ 67%，实际评价看<b>全井段达标比例</b>（≥90%）和<b>最差点</b>（≥50%）。水泥环薄的一侧厚度直接决定后期窜通风险。</p>' },
        fails: [
          { name: '扩径段仍不达标', why: '井径扩大 2 倍以上时刚性扶正器也撑不住。解决：改用更大外径或尾管。' },
          { name: '扶正器效应重叠', why: '相邻太近时边际效益低。解决：搜索里显式建模。' },
          { name: '大井斜段偏心模型不准', why: '套管整体下滑。解决：引入分段拉力/压力计算。' }
        ]
      },
      demo: { label: '可运行示范', mount: function (root, ctx) { if (window.C4CentralizerDemo) window.C4CentralizerDemo(root); else root.innerHTML = '<div style="color:#b05a51">示范脚本未加载</div>'; }, unmount: function () { if (window.C4CentralizerDemoCleanup) window.C4CentralizerDemoCleanup(); } }
    }
  });
})();
