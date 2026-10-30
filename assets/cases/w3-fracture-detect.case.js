/* =========================================================
   案例 w3 · 成像测井裂缝识别（语义分割 + 正弦波拟合）
   ---------------------------------------------------------
   对应场景：w3 成像测井裂缝识别
   ========================================================= */
(function () {

  /* ---------- SVG 插图 ---------- */
  /* FMI 展开图上的裂缝形态 + 正弦几何解译 */
  function figFmiConcept() {
    var s = '<svg viewBox="0 0 620 210" xmlns="http://www.w3.org/2000/svg" role="img">';
    /* 左：FMI 展开图示意 */
    s += '<text x="20" y="16" font-size="10" font-family="monospace" fill="#79828a">FMI 展开图（0—360°）</text>';
    s += '<rect x="20" y="24" width="260" height="160" fill="#f2f1ee" stroke="#e9e4d8" rx="4"/>';
    /* 背景电阻率纹理 */
    var rnd = 7;
    function prand() { rnd = (rnd * 1103515245 + 12345) % 2147483648; return rnd / 2147483648; }
    for (var i = 0; i < 260; i += 13) {
      for (var j = 0; j < 160; j += 13) {
        var g = 236 + Math.floor(prand() * 14);
        s += '<rect x="' + (21 + i) + '" y="' + (25 + j) + '" width="12" height="12" fill="rgb(' + g + ',' + (g - 1) + ',' + (g - 3) + ')" opacity="' + (0.5 + prand() * 0.5).toFixed(2) + '"/>';
      }
    }
    /* 真裂缝 1：缓倾正弦 */
    s += '<path d="M24 70 C 60 40, 120 40, 156 70 S 250 100, 276 82" fill="none" stroke="#31393d" stroke-width="3.4" stroke-linecap="round"/>';
    /* 真裂缝 2：高倾角正弦 */
    s += '<path d="M24 148 C 70 96, 150 96, 200 148 S 268 176, 276 158" fill="none" stroke="#31393d" stroke-width="2.6" stroke-linecap="round"/>';
    /* 钻井诱导缝：180° 对称竖直条纹 */
    s += '<line x1="98" y1="26" x2="96" y2="76" stroke="#b05a51" stroke-width="3" opacity="0.75"/>';
    s += '<line x1="204" y1="26" x2="206" y2="76" stroke="#b05a51" stroke-width="3" opacity="0.75"/>';
    s += '<text x="30" y="38" font-size="9" fill="#b05a51" paint-order="stroke" stroke="#f2f1ee" stroke-width="3">诱导缝（180° 对称）</text>';
    s += '<text x="30" y="62" font-size="9" fill="#31393d" paint-order="stroke" stroke="#f2f1ee" stroke-width="3">真裂缝</text>';
    s += '<text x="150" y="204" font-size="9" font-family="monospace" fill="#9ba3a9" text-anchor="middle">0° → 360°（井壁展开）· 纵向为深度</text>';
    /* 右：正弦几何解译 */
    s += '<text x="350" y="16" font-size="10" font-family="monospace" fill="#79828a">正弦几何 → 裂缝要素</text>';
    s += '<rect x="350" y="24" width="250" height="130" fill="#fdfcf9" stroke="#e9e4d8" rx="4"/>';
    s += '<line x1="360" y1="89" x2="590" y2="89" stroke="#c9c2b0" stroke-dasharray="3 2"/>';
    s += '<path d="M365 89 C 400 44, 470 44, 505 89 S 575 134, 588 96" fill="none" stroke="#41699b" stroke-width="2.4"/>';
    s += '<line x1="436" y1="56" x2="436" y2="89" stroke="#b26a39" stroke-width="1.2"/>';
    s += '<text x="443" y="68" font-size="9" fill="#b26a39">幅度 A ↔ 倾角</text>';
    s += '<circle cx="365" cy="89" r="3" fill="#41699b"/><circle cx="505" cy="89" r="3" fill="#41699b"/>';
    s += '<text x="358" y="106" font-size="9" fill="#5d666d">低点方位 ↔ 走向</text>';
    s += '<text x="358" y="122" font-size="9" fill="#5d666d">曲线宽度 ↔ 视开度</text>';
    s += '<text x="358" y="144" font-size="9" fill="#9ba3a9" font-family="monospace">y = A·sin(x + φ) + b</text>';
    /* 右下：三类目标对比 */
    s += '<rect x="350" y="160" width="78" height="42" fill="#e6f1ec" rx="4"/><text x="389" y="184" font-size="9" fill="#2f7d6b" text-anchor="middle">真裂缝 · 正弦</text>';
    s += '<rect x="436" y="160" width="78" height="42" fill="#f9e9e5" rx="4"/><text x="475" y="184" font-size="9" fill="#b05a51" text-anchor="middle">诱导缝 · 对称</text>';
    s += '<rect x="522" y="160" width="78" height="42" fill="#f1f1dd" rx="4"/><text x="561" y="184" font-size="9" fill="#767a2e" text-anchor="middle">缝合线 · 锯齿</text>';
    s += '</svg>';
    return s;
  }

  /* AI 管线：分割 → 连通域 → 拟合 → 参数 */
  function figPipeline() {
    var steps = [
      ['FMI 展开图', '电阻率归一\n坏列剔除', '#eef0f4', '#41699b'],
      ['U-Net 分割', '裂缝像素\n概率图', '#e6f1ec', '#2f7d6b'],
      ['连通域 + 拟合', '最小二乘\n正弦参数化', '#f8ecdf', '#b26a39'],
      ['要素与密度', '倾角/走向/开度\nP10 密度曲线', '#f1f1dd', '#767a2e']
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
    s += '<line x1="6" y1="95" x2="' + (6 + w + gap) + '" y2="95" stroke="#41699b" stroke-width="1.4"/>';
    s += '<text x="' + (6 + (w + gap) / 2) + '" y="106" text-anchor="middle" font-size="9" fill="#41699b">数据准备（人工把关）</text>';
    s += '<line x1="' + (6 + w + gap + 12) + '" y1="95" x2="' + (6 + w * 4 + gap * 3) + '" y2="95" stroke="#2f7d6b" stroke-width="1.4"/>';
    s += '<text x="' + (6 + w * 2.5 + gap * 2 + 6) + '" y="106" text-anchor="middle" font-size="9" fill="#2f7d6b">算法自动完成 · 低置信度段交人工复核</text>';
    s += '</svg>';
    return s;
  }

  Cases.register({

    id: 'w3-fracture-detect',
    sceneId: 'w3',
    title: '成像测井裂缝识别：语义分割 + 正弦波拟合',
    status: 'ready',
    version: '1.0.0',
    updated: '2026-10-30',

    tabs: {

      background: {
        label: '专业背景',

        judge: [
          { label: '任务类型', value: '图像分割 + 参数拟合', desc: '裂缝像素级提取后正弦参数化', html: '<span style="color:var(--c-cv)">CV</span>' },
          { label: '数据门槛', value: '10+ 口井', desc: '需人工标注裂缝掩膜（≥2000 条）' },
          { label: '收益', value: '2 天 → 2 h', desc: '单井裂缝解释工时（仅复核）' },
          { label: '难度', value: '中', desc: '假裂缝干扰与标注一致性是卡点', html: K.dtag('中') }
        ],

        lede: '裂缝是致密储层里的渗流通道，直接决定压裂段位置选择和产能预测。FMI 等微电阻率成像测井把井壁「展开」成一幅 2D 图像，裂缝在其中表现为明暗相间的正弦曲线——倾角决定幅度、走向决定相位。传统解释靠解释员在屏幕上逐条描迹，一口井几千米深度、每英寸 0.1 英寸采样，人工一天只能解释几百米，且真假裂缝（钻井诱导缝、缝合线）极易混淆。',

        sections: [
          {
            no: 1, en: 'PROBLEM', title: '当前做法与问题',
            html: '<p>成像测井的原理是<b>极坐标展开</b>：多个极板贴井壁测量微电阻率，按方位角展开成 2D 图像，横向是 0—360° 方位、纵向是深度。一条平面裂缝切过圆柱井壁，展开后就是一条<b>正弦曲线</b>——曲线幅度对应倾角（倾角越大幅度越大），低点方位对应走向，曲线宽度对应视开度。</p>' +
              K.figure(figFmiConcept(), 2, '图 1 · 左：FMI 展开图上的真裂缝（正弦暗线）与钻井诱导缝（180° 对称竖条纹）；右：正弦几何与裂缝要素的对应关系') +
              '<p>人工解释存在三个问题：<b>慢</b>——解释员逐条描迹并量取幅度和方位，一口井 8 km 井段需要 2 天；<b>不一致</b>——裂缝与钻孔痕迹、缝合线的界线有主观带，两位解释员的计数可差 20%；<b>假裂缝混淆</b>——钻井诱导缝是钻进中应力释放产生的次生裂缝，不是储层固有渗流通道，把它算进裂缝密度会系统性高估储层。</p>'
          },
          {
            no: 2, en: 'INTERVENTION', title: 'AI 能做什么',
            html: '<p>把裂缝识别建模为<b>「像素级分割 + 几何参数化」两段式</b>问题：</p>' +
              '<p>① 用 2D U-Net 在归一化后的成像图上做语义分割，输出每个像素属于裂缝的概率；</p>' +
              '<p>② 对概率图做连通域分析，把属于同一条裂缝的像素聚成一组，剔除碎屑；</p>' +
              '<p>③ 对每组像素做<b>最小二乘正弦拟合</b> y = A·sin(x+φ)+b，得到倾角（由 A）、走向（由 φ）、视开度（由法向宽度）；</p>' +
              '<p>④ 按深度窗统计裂缝密度曲线（P10，条/m），并输出倾角/走向玫瑰花图；低置信度段交人工复核。</p>' +
              K.figure(figPipeline(), 2, '图 2 · 四步管线：数据准备由人工把关，分割、拟合、统计全自动，最终参数表供压裂设计直接引用') +
              '<p>AI 替掉的是<b>逐条描迹</b>这一步，人仍然负责<b>真假裂缝判别</b>（诱导缝、缝合线的规则过滤结果需要抽检）和压裂段的最终决策。</p>'
          },
          {
            no: 3, en: 'DATA', title: '需要准备什么',
            html: '<p style="margin-bottom:14px">立项前先对着这张清单打勾：</p>' +
              K.checklist([
                ['FMI 成像数据', '0.1 in 采样，动态增强图 + 原始电阻率', '训练与推理输入'],
                ['人工标注裂缝掩膜', '≥2000 条，两位解释员独立标注', '监督标签（像素级）'],
                ['地层倾角成果', '处理剖面给出的区域应力方位', '诱导缝规则过滤用'],
                ['岩心 / 露头标定', '取心段的裂缝开度实测', '开度标定与验证'],
                ['常规测井曲线', 'GR、RD/RS', '裂缝段岩性辅助判别']
              ])
          },
          {
            no: 4, en: 'DIFFICULTY', title: '难度与参考方向',
            html: '<div style="display:flex;align-items:center;gap:14px;flex-wrap:wrap;margin-bottom:2px">' +
              K.dtag('中') + '<span class="small muted">分割网络本身成熟，难点在标签一致性和假裂缝规则。</span></div>' +
              K.meter('中') +
              '<p>难点集中在三处：</p>' +
              '<p>① <b>标注一致性</b>——裂缝与缝合线的界线存在主观带，需要先做双人标注一致性训练（同 c1 的做法）再全量标注；</p>' +
              '<p>② <b>假裂缝过滤</b>——诱导缝与真裂缝在图像上形态相似，但有规律：沿最大水平应力方向、180° 方位对称、终止于井壁。可用几何规则 + 应力方位数据过滤；</p>' +
              '<p>③ <b>色标漂移</b>——动态增强图的色标各井不统一，跨井训练前必须做归一化，否则模型学到的是色标而不是裂缝。</p>' +
              '<p style="margin-top:18px"><span class="kicker plain" style="color:var(--ink-4)">可借鉴技术</span></p>' +
              K.refs(['U-Net 语义分割', '正弦最小二乘拟合', '连通域分析', '几何规则过滤'], '#/method/cv')
          }
        ]
      },

      workflow: {
        label: '案例流程',
        title: '案例：12 口致密灰岩井的裂缝自动解释',
        lead: [
          '某致密灰岩区块要为 12 口井的水平段压裂设计提供裂缝密度依据，FMI 资料齐全，但解释 backlog 已积压 3 个月。目标是把单井解释工时从 2 天压缩到 2 小时（仅复核），裂缝密度曲线与人工基准的相关系数不低于 0.85。',
          '下面五步是这个案例的完整落地流程。注意第 2 步（标注一致性）和第 4 步（假裂缝过滤）——过滤规则直接决定密度曲线是「储层裂缝」还是「应力副产品」的混合体。'
        ],
        stats: [
          ['样本井', '12'], ['FMI 总井段', '8.4 km'],
          ['标注裂缝', '2400+ 条'], ['目标相关系数', '≥0.85'],
          ['单井工时', '2 天 → 2 h']
        ],
        steps: [
          {
            name: '图像预处理与归一化', role: '数据',
            do: '把 12 口井的 FMI 数据重采样到统一网格，坏电极列插值修复，动态增强图做分位数归一化，使跨井色标一致。',
            effect: '跨井训练的色标漂移问题消除，分割 IoU 提升 5—7 个百分点。',
            trap: '跳过归一化，模型学到的会是各井的色标偏好而不是裂缝形态。'
          },
          {
            name: '标注与一致性训练', role: '标注',
            do: '两位解释员先独立标注同一批 3 口井，逐条对比差异，统一真裂缝 / 诱导缝 / 缝合线的判别口径，再分头全量标注。',
            effect: '标注一致性从 68% 提升到 88%，计数差异从 20% 降到 8%。',
            trap: '不统一口径就全量标注，模型学成的是「平均解释员」的模糊边界。'
          },
          {
            name: '分割与正弦拟合', role: '算法',
            do: 'U-Net 输出裂缝概率图 → 连通域聚类去碎屑 → 对每条裂缝的像素带做最小二乘正弦拟合，得到倾角、走向、视开度。',
            effect: '单井 8.4 km 井段自动检出 1400+ 条裂缝，逐条匹配率 92%。',
            trap: '高倾角裂缝在展开图边缘被截断，需要按方位卷绕拼接后再拟合。'
          },
          {
            name: '假裂缝规则过滤', role: '后处理',
            do: '用几何规则过滤：走向与最大水平应力方位一致且 180° 对称的降权为诱导缝，锯齿状高电阻率线剔除为缝合线。',
            effect: '裂缝密度的高估偏差从 31% 降到 6%，压裂段选择更准。',
            trap: '规则过严会把沿应力方向开启的天然缝也滤掉，阈值要结合岩心标定。'
          },
          {
            name: '参数输出与人工复核', role: '闭环',
            do: '输出逐条要素表、P10 密度曲线和玫瑰花图；只复核置信度最低的 12% 裂缝和全部被规则改判的裂缝，修正回流训练集。',
            effect: '密度曲线与人工基准相关系数 0.89，单井工时降至 2 小时。',
            trap: '没有回流机制，新井区色标变化后模型准确率会持续下滑。'
          }
        ],
        metrics: {
          title: '怎么算「分对了」',
          html: '<p>裂缝识别是<b>分割 + 参数化</b>双层问题，指标也分两层：像素层看分割 IoU；裂缝层看逐条匹配率——预测中心线与人工标注的裂缝中心线在 3 个采样点内匹配才算命中，再统计命中裂缝的倾角误差中位数。</p>' +
            '<p>但最终交付物是<b>裂缝密度曲线</b>和玫瑰花图，所以工程验收指标是密度曲线与人工基准的相关系数，以及压裂段候选集与人工决策的重合率——解释结果直接决定射孔压裂段位，错一个段就是一口井的产量。</p>' +
            K.dtable(['指标', '定义', '本例取值'], [
              ['像素 IoU', '裂缝像素分割交并比', '0.84'],
              ['逐条匹配率', '中心线 3 点内匹配', '92%'],
              ['倾角误差中位数', '命中裂缝的拟合倾角偏差', '3.2°'],
              ['密度曲线相关系数', '与人工基准逐窗对比', '0.89'],
              ['人工复核比例', '低置信度 + 改判裂缝', '12%']
            ])
        },
        fails: [
          { name: '诱导缝计入密度', why: '诱导缝形态与真裂缝几乎一致，不加规则过滤会系统性高估裂缝密度 30% 以上。特征：沿应力方位、180° 对称、垂向骤然终止。' },
          { name: '色标漂移漏检', why: '动态增强图的色标按单井自适应，跨井直接训练模型会把低对比度井的裂缝整体漏掉。必须做分位数归一化。' },
          { name: '高倾角截断', why: '近 80° 倾角的裂缝在展开图上周期不完整，按单周期拟合会得到离谱参数。需要方位卷绕拼接后重拟合。' }
        ]
      },

      demo: {
        label: '可运行示范',
        mount: function (root, ctx) {
          if (typeof window.W3FractureDetectDemo === 'function') {
            window.W3FractureDetectDemo(root);
          } else {
            root.innerHTML = '<div style="color:#b05a51">示范脚本未加载</div>';
          }
        },
        unmount: function () { if (window.W3FractureDetectDemoCleanup) window.W3FractureDetectDemoCleanup(); }
      }
    }
  });

})();
