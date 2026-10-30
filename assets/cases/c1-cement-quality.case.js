/* =========================================================
   案例 c1 · 固井质量智能评价（CBL/VDL 分段分类）
   ---------------------------------------------------------
   对应场景：c1 固井质量智能评价
   ========================================================= */
(function () {

  /* ---------- SVG 插图 ---------- */
  /* 好胶结 vs 差胶结的 CBL/VDL 对比 */
  function figCBLConcept() {
    var s = '<svg viewBox="0 0 620 180" xmlns="http://www.w3.org/2000/svg" role="img">' +
      '<text x="20" y="16" font-size="10" font-family="monospace" fill="#79828a">好胶结</text>' +
      '<rect x="20" y="22" width="280" height="60" fill="#e6f1ec" rx="4"/>' +
      '<path d="M30 60 Q60 30 90 55 T150 45 T210 50 T270 42" fill="none" stroke="#2f7d6b" stroke-width="2"/>';
    // VDL 纹理示意
    for (var j = 0; j < 8; j++) {
      var x0 = 20 + j * 35 + 5, t0 = 55;
      for (var k = 0; k < 4; k++) {
        s += '<rect x="' + x0 + '" y="' + (22 + k * 15) + '" width="30" height="14" fill="rgb(' + (220 + k * 8) + ',' + (220 + k * 8) + ',' + (220 + k * 8) + ')"/>';
      }
    }
    s += '<text x="20" y="100" font-size="10" font-family="monospace" fill="#79828a">差胶结</text>' +
      '<rect x="20" y="106" width="280" height="60" fill="#f9e9e5" rx="4"/>' +
      '<path d="M30 140 Q60 90 90 145 T150 130 T210 140 T270 125" fill="none" stroke="#b05a51" stroke-width="2"/>';
    for (var j2 = 0; j2 < 8; j2++) {
      var x2 = 20 + j2 * 35 + 5;
      for (var k2 = 0; k2 < 4; k2++) {
        s += '<rect x="' + x2 + '" y="' + (106 + k2 * 15) + '" width="30" height="14" fill="rgb(' + (240 - k2 * 8) + ',' + (240 - k2 * 8) + ',' + (240 - k2 * 8) + ')"/>';
      }
    }
    // 右侧：整井段剖面（4 级评级）
    s += '<text x="350" y="16" font-size="10" font-family="monospace" fill="#79828a">整井段剖面</text>' +
      '<rect x="350" y="22" width="250" height="144" fill="#fdfcf9" stroke="#e9e4d8" rx="4"/>' +
      '<rect x="355" y="26" width="240" height="30" fill="#2f7d6b" opacity="0.2"/>' +
      '<rect x="355" y="56" width="240" height="30" fill="#b26a39" opacity="0.25"/>' +
      '<rect x="355" y="86" width="240" height="35" fill="#b05a51" opacity="0.25"/>' +
      '<rect x="355" y="121" width="240" height="40" fill="#6b4b8a" opacity="0.25"/>' +
      '<path d="M360 40 Q420 70 480 50 T560 45 M360 56 Q420 40 480 70 T560 55 M360 90 Q420 120 480 95 T560 105 M360 125 Q420 155 480 130 T560 140" fill="none" stroke="#31393d" stroke-width="1" stroke-dasharray="3 2"/>' +
      '<text x="600" y="42" font-size="9" fill="#2f7d6b" text-anchor="end" paint-order="stroke" stroke="#fdfcf9" stroke-width="3">好</text>' +
      '<text x="600" y="72" font-size="9" fill="#b26a39" text-anchor="end" paint-order="stroke" stroke="#fdfcf9" stroke-width="3">中</text>' +
      '<text x="600" y="105" font-size="9" fill="#b05a51" text-anchor="end" paint-order="stroke" stroke="#fdfcf9" stroke-width="3">差</text>' +
      '<text x="600" y="140" font-size="9" fill="#6b4b8a" text-anchor="end" paint-order="stroke" stroke="#fdfcf9" stroke-width="3">缺水泥</text>';
    s += '</svg>';
    return s;
  }

  /* AI 介入点流程：双路融合 */
  function figDualPath() {
    var steps = [
      ['CBL 曲线', '1D U-Net\n分段分类', '#e6f1ec', '#2f7d6b'],
      ['VDL 图', '2D U-Net\n语义分割', '#efe9f4', '#7e5a8d'],
      ['融合', '深度拼接\n+ 后处理', '#f8ecdf', '#b26a39'],
      ['分级曲线', '好/中/差\n/缺水泥', '#f1f1dd', '#767a2e']
    ];
    var s = '<svg viewBox="0 0 620 110" xmlns="http://www.w3.org/2000/svg">';
    var w = 120, gap = 12, x = 6, y = 22;
    steps.forEach(function (st, i) {
      s += '<rect x="' + x + '" y="' + y + '" width="' + w + '" height="60" rx="8" fill="' + st[2] + '" stroke="' + st[3] + '" stroke-opacity=".35"/>';
      s += '<rect x="' + x + '" y="' + y + '" width="3" height="60" rx="1.5" fill="' + st[3] + '"/>';
      s += '<text x="' + (x + 14) + '" y="' + (y + 22) + '" font-size="11" font-weight="600" fill="#242b2e">' + st[0] + '</text>';
      st[1].split('\n').forEach(function (line, k) {
        s += '<text x="' + (x + 14) + '" y="' + (y + 40 + k * 14) + '" font-size="9" fill="#5d666d">' + line + '</text>';
      });
      s += '<text x="' + (x + w - 10) + '" y="' + (y + 54) + '" font-size="8" font-family="monospace" fill="' + st[3] + '">0' + (i + 1) + '</text>';
      if (i < steps.length - 1) {
        s += '<path d="M' + (x + w + 3) + ' ' + (y + 36) + 'h9m-3.5-3.4 3.6 3.4-3.6 3.4" stroke="#c9c2b0" stroke-width="1.2" fill="none"/>';
      }
      x += w + gap;
    });
    // 人工边界
    s += '<line x1="6" y1="95" x2="' + (6 + w * 2 + gap) + '" y2="95" stroke="#2f7d6b" stroke-width="1.4"/>';
    s += '<text x="' + (6 + (w * 2 + gap) / 2) + '" y="106" text-anchor="middle" font-size="9" fill="#2f7d6b">算法：双路特征提取与融合</text>';
    s += '<line x1="' + (6 + w * 2 + gap + 12) + '" y1="95" x2="' + (6 + w * 4 + gap * 3) + '" y2="95" stroke="#b26a39" stroke-width="1.4"/>';
    s += '<text x="' + (6 + w * 3 + gap * 2 + 6) + '" y="106" text-anchor="middle" font-size="9" fill="#b26a39">人工：最终决策与复核</text>';
    s += '</svg>';
    return s;
  }

  Cases.register({

    id: 'c1-cement-quality',
    sceneId: 'c1',
    title: '固井质量智能评价：CBL/VDL 波形分段分类',
    status: 'ready',
    version: '1.0.0',
    updated: '2026-10-23',

    tabs: {

      background: {
        label: '专业背景',

        judge: [
          { label: '任务类型', value: '分段分类', desc: 'CBL 曲线 + VDL 图像的 4 级胶结评级', html: '<span style="color:var(--c-cv)">CV+TS</span>' },
          { label: '数据门槛', value: '30+ 口井', desc: '需逐段人工评级作标签（至少 4 个等级）' },
          { label: '收益', value: '1.5 h → 10 min', desc: '单井评级工时（仅复核）' },
          { label: '难度', value: '高', desc: '快速地层与微环隙需要专门样本', html: K.dtag('高') }
        ],

        lede: '固井是把套管和地层之间的环空用水泥封死的关键工序，封固质量直接决定层间是否窜通、后期能否压裂增产。CBL（水泥胶结测井）和 VDL（变密度测井）是评价固井质量的标准手段，前者给一个胶结指数曲线，后者给一幅展开的声波变密度图。传统靠解释员逐段目视评级，一条图数十米到上百米，评级结果与后续挤水泥决策直接相关。',

        sections: [
          {
            no: 1, en: 'PROBLEM', title: '当前做法与问题',
            html: '<p>固井质量评价的核心是看<b>水泥环是否完整胶结</b>。CBL 曲线记录套管波幅度——胶结好时套管波被水泥吸收、幅度低；胶结差时套管波沿套管高速传播、幅度高。VDL 则展示全井段的声波到时与能量分布，胶结层在图上表现为清晰的地层波条纹。</p>' +
              K.figure(figCBLConcept(), 2, '图 1 · 左：好胶结与差胶结的 CBL 曲线对比（绿低红高）；中：VDL 纹理；右：整井段按 4 级评级着色') +
              '<p>人工评级存在三个问题：<b>慢</b>——一口井 CBL/VDL 图数十幅，解释员逐段目视评级需 1—2 小时；<b>不一致</b>——评级标准本身有主观带，同一口井两位解释员的评级段边界可差数米；<b>漏判风险</b>——快速地层（灰岩、白云岩）套管波天然较弱，容易被误判为胶结好；微环隙（水泥干缩产生的微小间隙）在 CBL 上信号不明显，却会导致层间窜通。</p>'
          },
          {
            no: 2, en: 'INTERVENTION', title: 'AI 能做什么',
            html: '<p>把固井质量评价建模为<b>CBL 曲线 + VDL 图像上的分段分类</b>问题：</p>' +
              '<p>① 用 1D 分割网络在 CBL 曲线上检测胶结指数的变点，给出候选界面；</p>' +
              '<p>② 用 2D 语义分割网络在 VDL 图上逐像素预测胶结等级，再沿深度维度做聚合；</p>' +
              '<p>③ 两路结果融合，输出最终的分级曲线（好 / 中 / 差 / 缺水泥），置信度低的段交给人工复核。</p>' +
              K.figure(figDualPath(), 2, '图 2 · 双路融合架构：算法负责 CBL 曲线与 VDL 图像各自的特征提取，融合之后人工做最终决策') +
              '<p>AI 替掉的是<b>逐段目视评级</b>这一步，人仍然负责<b>特殊情况识别</b>（快速地层校正、微环隙判别）和最终决策——评级结果直接决定是否需要挤水泥返工，不能只靠模型。</p>'
          },
          {
            no: 3, en: 'DATA', title: '需要准备什么',
            html: '<p style="margin-bottom:14px">立项前先对着这张清单打勾：</p>' +
              K.checklist([
                ['CBL 连续曲线', '0.188 m 采样（16 采样/英尺）', '逐段评级（4 个等级，每类 ≥ 50 段）'],
                ['VDL 变密度展开图', '每幅覆盖 15—30 m', '与 CBL 同井段、同评级'],
                ['水泥浆与施工记录', '密度、返高、排量、失水量', '辅助判断异常段原因'],
                ['验窜 / 试压结果', '后续挤水泥或试压', '作为真值验证'],
                ['区域地层速度图', '覆盖目标区块', '快速地层校正用']
              ])
          },
          {
            no: 4, en: 'DIFFICULTY', title: '难度与参考方向',
            html: '<div style="display:flex;align-items:center;gap:14px;flex-wrap:wrap;margin-bottom:2px">' +
              K.dtag('高') + '<span class="small muted">标签质量和特殊地层迁移是两大难点，误判代价高。</span></div>' +
              K.meter('高') +
              '<p>难点集中在<b>标签质量</b>和<b>特殊地层迁移</b>：</p>' +
              '<p>① 评级标准存在主观带——同一层段不同解释员给出的胶结等级可能不同，需要先做标注一致性训练再收集数据；</p>' +
              '<p>② 快速地层的套管波幅天然偏低，模型容易把"快速地层 + 胶结差"误判为"胶结好"，需要引入地层速度作为协变量；</p>' +
              '<p>③ 微环隙在 CBL 上表现为局部小幅升高，容易淹没在噪声中，需要在 VDL 上专门训练。</p>' +
              '<p style="margin-top:18px"><span class="kicker plain" style="color:var(--ink-4)">改进路线</span></p>' +
              K.refs(['1D/2D U-Net 分割', '弱监督伪标签', '多模态融合', '地层速度校正'], '#/method/cv')
          }
        ]
      },

      workflow: {
        label: '案例流程',
        title: '案例：32 口开发井的固井质量自动评级',
        lead: [
          '某区块有 32 口开发井需要做固井质量复查，CBL/VDL 资料齐全，但之前靠 2 位解释员手动评级，每人每周只能完成 3—4 口。目标是把单井评级工时从 1.5 小时压到 10 分钟（仅复核），同时保持评级结果与人工基准的一致性不低于 85%。',
          '下面五步是这个案例的完整落地流程。注意第 2 步（标注一致性训练）和第 4 步（特殊地层校正）——它们不涉及任何模型架构，却决定了最终能不能用。'
        ],
        stats: [
          ['样本井', '32'], ['CBL 总井段', '18.6 km'],
          ['评级等级', '4'], ['目标一致性', '≥85%'],
          ['单井工时', '1.5 h → 10 min']
        ],
        steps: [
          {
            name: '数据解编与预处理', role: '数据',
            do: '把 32 口井的 CBL/VDL 资料解编为统一格式，深度对齐到 0.188 m（6 inch）采样，剔除套管鞋以下和井口干扰段。',
            effect: '得到可直接进模型的标准化数据集。',
            trap: '不同井的深度基准可能有几米偏移，必须用套管鞋位置做统一校正。'
          },
          {
            name: '标注一致性训练', role: '标注',
            do: '找 2 位资深解释员先对同一批 5 口井做标注，逐条对比差异、讨论并统一判读标准（尤其是快速地层和微环隙），再开始全量标注。',
            effect: '标注一致性从 72% 提升到 89%，标签噪声大幅降低。',
            trap: '跳过这一步直接标注，模型学成的是平均解释员的不一致。'
          },
          {
            name: '双路模型训练', role: '算法',
            do: '① 1D U-Net 在 CBL 曲线上做分段分类；② 2D U-Net 在 VDL 图上做语义分割；两路按深度维度拼接融合输出最终评级。',
            effect: '双路融合比单路 CBL 准确率提升 6—8 个百分点。',
            trap: 'VDL 标注成本远高于 CBL，可用弱标注降成本。'
          },
          {
            name: '特殊地层校正', role: '后处理',
            do: '引入区域地层速度图，对快速地层段的 CBL 基准线做自适应校正。',
            effect: '快速地层段的评级准确率从 61% 提升到 78%。',
            trap: '校正过度会把真正的胶结差段也"救回来"。'
          },
          {
            name: '人工复核与回流', role: '闭环',
            do: '只复核置信度最低的 15% 段和所有被规则修正过的段，修正结果自动回流训练集。',
            effect: '最终全井段评级与人工基准的一致性达 91%。',
            trap: '没有回流机制，模型三个月后就会过时。'
          }
        ],
        metrics: {
          title: '怎么算"评对了"',
          html: '<p>固井质量评级是<b>分段分类</b>问题。以人工基准评级为真值，统计每段（≥1 m）的分类准确率。由于"差"和"缺水泥"两类样本稀少，还需要单独统计这两类的召回率——漏掉一段缺水泥可能导致整段挤水泥返工。</p>' +
            '<p>另外，评级结果最终要用于决策：<b>挤水泥</b>（严重缺陷）、<b>观察</b>（中等缺陷）、<b>通过</b>（良好）。因此还需要统计"决策一致率"——模型给出的决策是否与人工决策一致，这比纯分类准确率更有实际意义。</p>' +
            K.dtable(['指标', '定义', '本例取值'], [
              ['整体一致率', '逐段分类准确率', '91%'],
              ['决策一致率', '挤/观/通三档决策一致', '94%'],
              ['差/缺水泥召回率', '严重缺陷段找回率', '87%'],
              ['人工复核比例', '仅复核低置信度段', '15%']
            ])
        },
        fails: [
          { name: '快速地层假阳性', why: '灰岩/白云岩中套管波天然衰减快，CBL 看起来像胶结好。引入地层速度协变量可缓解。' },
          { name: '微环隙漏判', why: '微环隙的 CBL 幅度变化只有正常差段的 1/3，容易淹没在噪声里。VDL 上的细条纹纹理是关键识别特征。' },
          { name: '分级边界抖动', why: '相邻层段的边界可能是渐变而非突变，1D 模型容易给出锯齿状分段。需要空间平滑约束。' }
        ]
      },

      demo: {
        label: '可运行示范',
        mount: function (root, ctx) {
          if (typeof window.C1CementQualityDemo === 'function') {
            window.C1CementQualityDemo(root);
          } else {
            root.innerHTML = '<div style="color:#b05a51">示范脚本未加载</div>';
          }
        },
        unmount: function () { if (window.C1CementQualityDemoCleanup) window.C1CementQualityDemoCleanup(); }
      }
    }
  });

})();
