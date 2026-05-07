(function () {
  const FLOW_CONFIGS = {
    t1: {
      steps: [
        { id: "direction", label: "方向梳理", href: "step-direction.html", status: "已完成", summary: "查看：方向目标与边界", manual_note: "" },
        { id: "variables", label: "变量拆解", href: "step-variables.html", status: "已完成", summary: "查看：控制组/变化组结构", manual_note: "" },
        { id: "plan", label: "AB测试方案", href: "step-ab-plan.html", status: "已完成", summary: "查看：首轮方案与判读规则", manual_note: "" },
        { id: "assets", label: "资产检查", href: "step-asset-check.html", status: "已完成", summary: "查看：就绪资产与缺口", manual_note: "" },
        { id: "requirements", label: "测试图需求单", href: "step-requirements.html", status: "已完成", summary: "查看：A1~B2 执行要求", manual_note: "" },
        { id: "production", label: "出图", href: "step-production.html", status: "进行中", summary: "查看：出图追溯树", manual_note: "人工：查看出图追溯树" },
        { id: "review", label: "复盘迭代", href: "step-review.html", status: "待执行", summary: "查看：指标回填与下一步", manual_note: "人工：回填指标与下一步" }
      ]
    },
    t2: {
      steps: [
        { id: "index", label: "测试2索引", href: "t2-workflow-index.html", status: "已完成", summary: "查看：7步说明", manual_note: "" },
        { id: "direction", label: "方向梳理", href: "t2-step-direction.html", status: "已完成", summary: "仅做水感视觉变量测试", manual_note: "" },
        { id: "variables", label: "变量拆解", href: "t2-step-variables.html", status: "已完成", summary: "W01~W10 单变量定义", manual_note: "" },
        { id: "plan", label: "视觉对比方案", href: "t2-step-ab-plan.html", status: "已完成", summary: "不做功效AB，仅水感对比", manual_note: "" },
        { id: "assets", label: "资产检查", href: "t2-step-asset-check.html", status: "已完成", summary: "锁定正面原图为唯一主体", manual_note: "" },
        { id: "requirements", label: "测试图需求单", href: "t2-step-requirements.html", status: "已完成", summary: "10张需求单与主体锁定条款", manual_note: "" },
        { id: "production", label: "出图", href: "t2-step-production.html", status: "进行中", summary: "W01~W10 树状追溯", manual_note: "人工：查看 W01~W10 评审" },
        { id: "review", label: "复盘迭代", href: "t2-step-review.html", status: "待执行", summary: "仅填CTR/CTR(link click)/ROAS/CVR", manual_note: "人工：回填 CTR / ROAS / CVR" }
      ]
    },
    t4: {
      steps: [
        { id: "direction", label: "方向梳理", href: "t4-workflow-index.html#direction", status: "已完成", summary: "I: 半浸水 / H: 水击打扫过", manual_note: "" },
        { id: "variables", label: "变量拆解", href: "t4-workflow-index.html#variables", status: "已完成", summary: "60个水感变量分组", manual_note: "" },
        { id: "plan", label: "AB测试方案", href: "t4-workflow-index.html#plan", status: "已完成", summary: "I/H 两套方向并行对比", manual_note: "" },
        { id: "assets", label: "资产检查", href: "t4-workflow-index.html#assets", status: "已完成", summary: "锁定 Brightening Face Wash", manual_note: "" },
        { id: "requirements", label: "测试图需求单", href: "t4-docs.html#requirements", status: "已完成", summary: "60份需求单与prompt归档", manual_note: "" },
        { id: "production", label: "出图", href: "t4-step-production.html", status: "进行中", summary: "60图追溯与共享评审", manual_note: "人工：筛图、评论与候选勾选" },
        { id: "review", label: "复盘迭代", href: "t4-docs.html#results", status: "待执行", summary: "结果位暂收口到文档页", manual_note: "人工：回填结果与结论" }
      ]
    }
  };

  function isManualStatus(status) {
    return status === "进行中" || status === "待执行";
  }

  function normalizeHref(href) {
    return String(href || "").replace(/^\.?\//, "");
  }

  function toHomeHref(href) {
    const normalized = normalizeHref(href);
    if (!normalized) return normalized;
    if (
      normalized.startsWith("pages/") ||
      normalized.startsWith("docs/") ||
      normalized.startsWith("assets/") ||
      normalized.startsWith("../") ||
      normalized.startsWith("#") ||
      /^https?:\/\//i.test(normalized)
    ) {
      return normalized;
    }
    return `pages/${normalized}`;
  }

  function buildStepClasses(step, activeStepId) {
    const classes = [];
    if (step.status === "已完成") classes.push("done");
    else if (step.status === "进行中") classes.push("doing");
    else classes.push("todo");
    if (isManualStatus(step.status)) classes.push("manual-step");
    if (step.id === activeStepId) classes.push("active");
    return classes.join(" ");
  }

  function renderFlowNav(navEl, flowId, activeStepId) {
    const flow = FLOW_CONFIGS[flowId];
    if (!flow || !navEl) return;
    navEl.innerHTML = `
      <a href="../index.html">总览首页</a>
      ${flow.steps.map((step) => `
        <a href="${step.href}" class="${buildStepClasses(step, activeStepId)}" data-step-id="${step.id}">
          <span class="nav-label">${step.label}</span>
          ${isManualStatus(step.status) ? '<span class="nav-chip">需人工</span>' : ""}
          ${isManualStatus(step.status) && step.manual_note ? `<span class="nav-note">${step.manual_note}</span>` : ""}
        </a>
      `).join("")}
    `;
  }

  function buildHomepageConfigs(rawConfig) {
    const out = {};
    Object.entries(rawConfig).forEach(([key, cfg]) => {
      const flow = FLOW_CONFIGS[key];
      if (!flow) {
        out[key] = cfg;
        return;
      }
      out[key] = Object.assign({}, cfg, {
        steps: flow.steps
          .filter((step) => step.id !== "index")
          .map((step) => ({
            id: step.id,
            label: step.label,
            href: toHomeHref(step.href),
            status: step.status,
            summary: step.summary,
            manual_note: step.manual_note
          }))
      });
    });
    return out;
  }

  window.NPFlowManual = {
    configs: FLOW_CONFIGS,
    isManualStatus,
    normalizeHref,
    toHomeHref,
    renderFlowNav,
    buildHomepageConfigs
  };
})();
