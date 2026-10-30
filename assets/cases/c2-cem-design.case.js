/* 案例 c2 · 注水泥参数智能优化 */
(function () {

  /* ---------- SVG 插图 ---------- */
  /* 密度窗口示意：沿井深的孔隙压力-破裂压力剖面 */
  function figDensityWindow() {
    var s = '<svg viewBox="0 0 620 200" xmlns="http://www.w3.org/2000/svg">';
    var ml = 48, mb = 30, mr = 20, mt = 20;
    var W = 620 - ml - mr, H = 200 - mt - mb;
    // 密度窗口带
    s += '<rect x="' + ml + '" y="' + mt + '" width="' + W + '" height="' + H + '" fill="#fdfcf9" stroke="#e9e4d8"/>';
    // 孔隙压力 (线性)
    s += '<path d="M' + ml + ' ' + (mt + H * 0.75) + ' Q' + (ml + W * 0.3) + ' ' + (mt + H * 0.65) + ' ' + (ml + W) + ' ' + (mt + H * 0.5) + '" fill="none" stroke="#41699b" stroke-width="2"/>';
    // 破裂压力 (线性+波动)
    s += '<path d="M' + ml + ' ' + (mt + H * 0.25) + ' Q' + (ml + W * 0.3) + ' ' + (mt + H * 0.38) + ' ' + (ml + W * 0.55) + ' ' + (mt + H * 0.28) + ' T' + (ml + W) + ' ' + (mt + H * 0.2) + '" fill="none" stroke="#b05a51" stroke-width="2"/>';
    // 密度窗口着色 (填充两条曲线之间)
    s += '<path d="M' + ml + ' ' + (mt + H * 0.75) + ' Q' + (ml + W * 0.3) + ' ' + (mt + H * 0.65) + ' ' + (ml + W) + ' ' + (mt + H * 0.5) + ' L' + (ml + W) + ' ' + (mt + H * 0.2) + ' T' + (ml + W * 0.55) + ' ' + (mt + H * 0.28) + ' Q' + (ml + W * 0.3) + ' ' + (mt + H * 0.38) + ' ' + ml + ' ' + (mt + H * 0.25) + ' Z" fill="#2f7d6b" fill-opacity="0.15"/>';
    // 选中的水泥浆密度 (虚线)
    s += '<line x1="' + ml + '" y1="' + (mt + H * 0.55) + '" x2="' + (ml + W) + '" y2="' + (mt + H * 0.32) + '" stroke="#31393d" stroke-width="1.3" stroke-dasharray="5 3"/>';
    // 标注
    s += '<text x="' + ml + '" y="' + (mt - 6) + '" font-size="9" fill="#79828a" font-family="monospace" text-anchor="start">0 m</text>';
    s += '<text x="' + (ml + W) + '" y="' + (mt - 6) + '" font-size="9" fill="#79828a" font-family="monospace" text-anchor="end">3500 m</text>';
    s += '<text x="' + (ml + 6) + '" y="' + (mt + H * 0.88) + '" font-size="10" fill="#41699b" font-weight="600" paint-order="stroke" stroke="#fdfcf9" stroke-width="3">孔隙压力</text>';
    s += '<text x="' + (ml + 6) + '" y="' + (mt + H * 0.14) + '" font-size="10" fill="#b05a51" font-weight="600" paint-order="stroke" stroke="#fdfcf9" stroke-width="3">破裂压力</text>';
    s += '<text x="' + (ml + 6) + '" y="' + (mt + H * 0.45) + '" font-size="10" fill="#2f7d6b" font-weight="600" paint-order="stroke" stroke="#fdfcf9" stroke-width="3">密度窗口</text>';
    s += '<text x="' + (ml + W - 6) + '" y="' + (mt + H * 0.57) + '" font-size="10" fill="#31393d" font-weight="600" text-anchor="end">水泥浆设计密度</text>';
    // 窄窗口段高亮
    s += '<rect x="' + (ml + W * 0.55) + '" y="' + mt + '" width="' + (W * 0.15) + '" height="' + H + '" fill="#b05a51" fill-opacity="0.08"/>';
    s += '<text x="' + (ml + W * 0.625) + '" y="' + (mt + H + 18) + '" font-size="9" fill="#b05a51" text-anchor="middle">窄窗口段（漏失高风险）</text>';
    // Y 轴刻度
    s += '<text x="' + (ml - 6) + '" y="' + (mt + H * 0.25 + 3) + '" font-size="8" fill="#79828a" text-anchor="end">破裂</text>';
    s += '<text x="' + (ml - 6) + '" y="' + (mt + H * 0.5 + 3) + '" font-size="8" fill="#79828a" text-anchor="end">密度</text>';
    s += '<text x="' + (ml - 6) + '" y="' + (mt + H * 0.75 + 3) + '" font-size="8" fill="#79828a" text-anchor="end">孔隙</text>';
    s += '</svg>';
    return s;
  }

  /* Pareto 前沿示意 */
  function figParetoFront() {
    var s = '<svg viewBox="0 0 620 200" xmlns="http://www.w3.org/2000/svg">';
    var ml = 40, mb = 40, mr = 20, mt = 20;
    var W = 620 - ml - mr, H = 200 - mt - mb;
    s += '<rect x="' + ml + '" y="' + mt + '" width="' + W + '" height="' + H + '" fill="#fdfcf9" stroke="#e9e4d8"/>';
    // 坐标轴
    s += '<line x1="' + ml + '" y1="' + (mt + H) + '" x2="' + (ml + W) + '" y2="' + (mt + H) + '" stroke="#79828a"/>';
    s += '<line x1="' + ml + '" y1="' + mt + '" x2="' + ml + '" y2="' + (mt + H) + '" stroke="#79828a"/>';
    // 轴标签
    s += '<text x="' + (ml + W / 2) + '" y="' + (mt + H + 28) + '" text-anchor="middle" font-size="10" fill="#5d666d">顶替效率 →</text>';
    s += '<text x="' + (ml - 8) + '" y="' + (mt + H / 2) + '" text-anchor="middle" font-size="10" fill="#5d666d" transform="rotate(-90 ' + (ml - 8) + ' ' + (mt + H / 2) + ')">漏失概率 →</text>';
    // Pareto 前沿 (曲线)
    s += '<path d="M' + (ml + W * 0.1) + ' ' + (mt + H * 0.85) + ' Q' + (ml + W * 0.45) + ' ' + (mt + H * 0.5) + ' ' + (ml + W * 0.9) + ' ' + (mt + H * 0.15) + '" fill="none" stroke="#2f7d6b" stroke-width="2.5"/>';
    // 前沿上的点
    var pts = [[0.2, 0.75], [0.35, 0.55], [0.55, 0.4], [0.72, 0.25], [0.88, 0.12]];
    pts.forEach(function (p) {
      s += '<circle cx="' + (ml + p[0] * W) + '" cy="' + (mt + p[1] * H) + '" r="4" fill="#2f7d6b" stroke="#fff" stroke-width="1.5"/>';
    });
    // 前沿下方的被支配方案（确定性散点，约束在前沿右下方，不压标注文字）
    s += '<g fill="#c9c2b0">';
    var seed = 7;
    function rnd() { seed = (seed * 9301 + 49297) % 233280; return seed / 233280; }
    for (var i = 0; i < 18; i++) {
      var fx = 0.12 + rnd() * 0.76;
      var yTop = 0.87 - (fx - 0.1) * 0.875; // 前沿的线性近似
      var fy = yTop + 0.05 + rnd() * Math.max(0.02, 0.86 - yTop - 0.05);
      s += '<circle cx="' + (ml + W * fx).toFixed(1) + '" cy="' + (mt + H * fy).toFixed(1) + '" r="2.5"/>';
    }
    s += '</g>';
    // 标注
    s += '<text x="' + (ml + W * 0.3) + '" y="' + (mt + H * 0.48) + '" font-size="9" fill="#2f7d6b" font-weight="600" paint-order="stroke" stroke="#fdfcf9" stroke-width="3">Pareto 前沿</text>';
    s += '<text x="' + (ml + W * 0.7) + '" y="' + (mt + H * 0.75) + '" font-size="8" fill="#9ba3a9" paint-order="stroke" stroke="#fdfcf9" stroke-width="3">被支配方案</text>';
    // 右上角不可达
    s += '<path d="M' + (ml + W * 0.92) + ' ' + (mt + H * 0.12) + ' L' + (ml + W) + ' ' + (mt + H * 0.12) + ' L' + (ml + W) + ' ' + mt + ' Z" fill="#b05a51" fill-opacity="0.08"/>';
    s += '<text x="' + (ml + W * 0.96) + '" y="' + (mt + H * 0.2) + '" font-size="8" fill="#b05a51" text-anchor="end">不可达</text>';
    // 左下为安全区
    s += '<text x="' + ml + '" y="' + (mt + H + 14) + '" font-size="8" fill="#b26a39">安全</text>';
    s += '<text x="' + (ml + W - 20) + '" y="' + (mt + H + 14) + '" font-size="8" fill="#b26a39">高效</text>';
    s += '</svg>';
    return s;
  }

  Cases.register({
    id: 'c2-cem-design',
    sceneId: 'c2',
    title: '注水泥参数智能优化：密度窗口内的多目标寻优',
    status: 'ready',
    version: '1.0.0',
    updated: '2026-10-23',
    tabs: {
      background: {
        label: '专业背景',
        judge: [
          { label: '任务类型', value: '多目标优化', desc: '密度窗口内最大化顶替效率', html: '<span style="color:var(--c-opt)">OPT</span>' },
          { label: '数据门槛', value: '200+ 井次', desc: '历史施工 + 结果标签' },
          { label: '收益', value: '降漏失 30%', desc: '代理模型 + 贝叶斯优化' },
          { label: '难度', value: '中', desc: '施工样本有限，标签噪声大', html: K.dtag('中') }
        ],
        lede: '注水泥是把水泥浆通过套管和地层之间的环空顶替到位的工序。设计要确定水泥浆密度、排量与替浆方案，核心约束是不能漏失——一旦泵压超过地层破裂压力，环空液体就会跑进地层，水泥返高不够。常规设计靠工程师手算水力循环，在密度窗口内找一个经验值。',
        sections: [
          { no: 1, en: 'PROBLEM', title: '当前做法与问题',
            html: '<p>注水泥设计的核心矛盾是<b>漏失 vs 顶替效率</b>：密度越高、排量越大，环空的顶替效率越好，但当量密度也越容易超过破裂压力导致漏失。常规做法是先算出密度窗口（孔隙压力 < 当量密度 < 破裂压力），再在窗口内选一个经验值。</p>' +
              K.figure(figDensityWindow(), 2, '图 1 · 沿井深的密度窗口示意。两条曲线之间的绿色带是允许的密度范围；窗口在某些深度段会变窄，漏失风险陡增') +
              '<p>问题：窗口窄的井，经验值选不好就漏；不同深度段的密度窗口不一样，水泥浆密度应该分层但传统只配一个密度；排量、密度、替浆方式三者耦合，手算只能枚举少数方案。</p>' },
          { no: 2, en: 'INTERVENTION', title: 'AI 能做什么',
            html: '<p>① 用<b>机理模型批量仿真</b>生成上万组映射对，解决真实施工样本少的问题；</p>' +
              '<p>② 训练<b>高斯过程回归代理模型</b>学习"参数 → 顶替效率/漏失概率"的非线性映射，单次推理毫秒级；</p>' +
              '<p>③ 用<b>约束贝叶斯优化</b>在密度窗口内搜索 Pareto 前沿，输出一组候选方案供工程师挑选——每个方案都附带量化的风险边界。</p>' +
              K.figure(figParetoFront(), 2, '图 2 · 多目标优化的 Pareto 前沿：右上角（又安全又高效）在物理上不可达，AI 搜索出前沿上的候选方案') +
              '<p>AI 不替工程师做最终决策，但能把"凭经验选一个"变成"从一组有依据的候选里挑一个"。</p>' },
          { no: 3, en: 'DATA', title: '需要准备什么',
            html: '<p style="margin-bottom:14px">注水泥优化的数据清单：</p>' +
              K.checklist([
                ['井况数据', '井径、井斜、孔隙/破裂压力剖面', '无需标注'],
                ['水泥浆配方', '密度、流变性、失水量', '历史记录'],
                ['施工记录', '密度、排量、返高', '200+ 井次'],
                ['施工结果', 'CBL 评价 + 漏失/返高', '作为标签'],
                ['温度剖面', '沿井深地温', '用于修正流变性']
              ]) },
          { no: 4, en: 'DIFFICULTY', title: '难度与参考方向',
            html: '<div style="display:flex;align-items:center;gap:14px;margin-bottom:2px">' +
              K.dtag('中') + '<span class="small muted">"好结果"受多因素影响，标签噪声大。</span></div>' +
              K.meter('中') +
              '<p>难点在于<b>同样的参数组合在不同井上可能一次成功一次漏失</b>。解决方向：</p>' +
              '<p>① 用机理正演模型生成大规模"干净"训练集，真实数据只用于微调；</p>' +
              '<p>② 贝叶斯优化引入安全约束，不要为了效率冒风险；</p>' +
              '<p>③ 对窄窗口井特殊处理，把"漏失风险"作为首要目标。</p>' +
              '<p style="margin-top:18px"><span class="kicker plain" style="color:var(--ink-4)">可借鉴技术</span></p>' +
              K.refs(['高斯过程回归', '贝叶斯优化', 'Pareto 前沿', '机理-数据混合建模'], '#/method/opt') }
        ]
      },
      workflow: {
        label: '案例流程',
        title: '案例：某窄密度窗口区块的注水泥设计优化',
        lead: [
          '目标区块有 24 口井密度窗口较窄（平均 0.08 g/cm³），历史注水泥漏失率达 27%。用代理模型 + 约束优化降低漏失率并保持顶替效率。',
          '先离线训练代理模型，再在线用贝叶斯优化给每口井推荐候选方案。'
        ],
        stats: [['历史漏失率', '27%'], ['优化后漏失率', '↓30%'], ['方案推荐时间', '<5 min'], ['候选方案数', '5']],
        steps: [
          { name: '数据收集与清洗', role: '数据', do: '收集 200+ 历史井次的注水泥设计与施工结果，剔除异常记录，统一当量密度计算方法。', effect: '得到带标签的历史施工数据集。', trap: '标签噪声需要在模型里显式建模。' },
          { name: '机理模型正演', role: '仿真', do: '用水力循环模型批量仿真 5000 组参数组合，输出顶替效率、当量密度、漏失标志。', effect: '得到大规模"干净"训练集。', trap: '机理模型本身有假设，需要定期校准。' },
          { name: '代理模型训练', role: '算法', do: '用高斯过程回归学习"参数 → 顶替效率/漏失概率"两个映射。', effect: '把分钟级正演压缩到毫秒级推理。', trap: 'GP 在高维空间性能下降，先用 PCA 降维。' },
          { name: '约束贝叶斯优化', role: '优化', do: '对每口新井搜索 Pareto 前沿，输出 5 个候选方案。', effect: '每个方案都有量化的风险边界。', trap: '优化目标权重需要现场工程师参与定义。' },
          { name: '工程师决策与回流', role: '闭环', do: '工程师挑选或修改方案，施工结果回流训练集。', effect: '持续迭代优化。', trap: '没有回流机制，模型会逐渐过时。' }
        ],
        metrics: { title: '怎么算"优化了"', html: '<p>核心指标：<b>漏失率</b>（≤历史 70%）、<b>成功井顶替效率</b>（≥历史）、<b>工程师采纳率</b>（推荐方案被实际采用的比例）。</p>' },
        fails: [
          { name: '代理模型外推失效', why: '参数超出训练集范围时不准。解决：加硬约束 + 拒绝外推请求。' },
          { name: '机理模型与实际偏差', why: '仿真假设与真实施工有差距。解决：定期用真实数据校准。' },
          { name: '优化目标冲突', why: '效率和安全是 trade-off。解决：强制输出 Pareto 前沿，让决策透明。' }
        ]
      },
      demo: {
        label: '可运行示范',
        mount: function (root, ctx) { if (window.C2CemDesignDemo) window.C2CemDesignDemo(root); else root.innerHTML = '<div style="color:#b05a51">示范脚本未加载</div>'; },
        unmount: function () { if (window.C2CemDesignDemoCleanup) window.C2CemDesignDemoCleanup(); }
      }
    }
  });
})();
