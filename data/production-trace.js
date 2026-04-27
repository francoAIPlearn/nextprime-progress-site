window.PRODUCTION_TRACE_DATA = {
  "shared_references": [
    {
      "title": "Brand Introduction (合法表达来源)",
      "path": "../docs/references/brand/Next_Prime_Brand_Introduction_EN.pdf",
      "availability": "web_and_local",
      "source": "品牌说明书 p18-19"
    },
    {
      "title": "Brightening Face Wash 产品原图（正面基准）",
      "path": "../assets/reference/product/NP_Brightening_Face_Wash_Front.png",
      "availability": "web_and_local",
      "source": "产品原图基准"
    },
    {
      "title": "实拍水感参考库（整体风格母体）",
      "path": "../pages/reference-library.html#waterfeel",
      "availability": "web_and_local",
      "source": "ROI 参考素材池"
    },
    {
      "title": "测试总表（变量与指标规则）",
      "path": "../docs/测试总表.md",
      "availability": "web_and_local",
      "source": "首轮 4 图总表"
    }
  ],
  "items": [
    {
      "test_id": "A1",
      "role": "控制组",
      "version": "v2",
      "status": "primary",
      "output_file": "../assets/images/BFW-WATER-A1_v2_2026-04-26.png",
      "prompt_file": "../docs/prompts/BFW-WATER-A1_prompt.md",
      "prompt_excerpt": [
        "单产品主视觉，银色软管占画面 70%+",
        "透明横向水膜包裹中段，保持真实实拍水感",
        "主标题: 10s Brighter and Clearer Skin",
        "副信息: Niacinamide + BHA + Kaolin",
        "禁止明显变形、扭曲、改包装排版"
      ],
      "variant_references": [
        {
          "title": "水膜包裹 + 数字钩子",
          "source": "01_A1_需求单 / 画面结构 + 测试总表 A1"
        }
      ],
      "linked_docs": [
        {
          "label": "测试总表",
          "href": "../docs/测试总表.md"
        },
        {
          "label": "A1 需求单",
          "href": "../docs/requirements/01_A1_需求单.md"
        },
        {
          "label": "出图日志",
          "href": "../docs/run-log.md"
        }
      ],
      "round_conclusion": "控制组基准版本，当前主候选。",
      "next_step": "待回填 CTR/CTR(link click)/ROAS/CVR 后判断是否保持为母版。"
    },
    {
      "test_id": "A1",
      "role": "控制组",
      "version": "v1",
      "status": "history",
      "output_file": "../assets/images/BFW-WATER-A1_v1_2026-04-26.png",
      "prompt_file": "../docs/prompts/BFW-WATER-A1_prompt.md",
      "prompt_excerpt": [
        "与 v2 同变量结构，用于前后版本对照",
        "v2 进一步强化了几何锁定与禁变形约束"
      ],
      "variant_references": [
        {
          "title": "水膜包裹 + 数字钩子",
          "source": "01_A1_需求单 / 画面结构 + 测试总表 A1"
        }
      ],
      "linked_docs": [
        {
          "label": "A1 需求单",
          "href": "../docs/requirements/01_A1_需求单.md"
        },
        {
          "label": "出图日志",
          "href": "../docs/run-log.md"
        }
      ],
      "round_conclusion": "历史对照版。",
      "next_step": "仅用于与 v2 对比，不作为当前主投候选。"
    },
    {
      "test_id": "A2",
      "role": "变化组",
      "version": "v2",
      "status": "primary",
      "output_file": "../assets/images/BFW-WATER-A2_v2_2026-04-26.png",
      "prompt_file": "../docs/prompts/BFW-WATER-A2_prompt.md",
      "prompt_excerpt": [
        "这版不用横向水膜，改成真实冷凝玻璃/水珠前景",
        "保持产品清晰可读，避免水珠遮挡关键信息",
        "主标题: 10s Brighter and Clearer Skin",
        "副信息: Niacinamide + BHA + Kaolin",
        "保持包装结构与正面字样稳定"
      ],
      "variant_references": [
        {
          "title": "冷凝玻璃 + 数字钩子",
          "source": "02_A2_需求单 / 画面结构 + 测试总表 A2"
        }
      ],
      "linked_docs": [
        {
          "label": "测试总表",
          "href": "../docs/测试总表.md"
        },
        {
          "label": "A2 需求单",
          "href": "../docs/requirements/02_A2_需求单.md"
        },
        {
          "label": "出图日志",
          "href": "../docs/run-log.md"
        }
      ],
      "round_conclusion": "核心变量为冷凝前景替代水膜。",
      "next_step": "若赢，进入局部冷凝 vs 整面湿润玻璃二轮。"
    },
    {
      "test_id": "A2",
      "role": "变化组",
      "version": "v1",
      "status": "history",
      "output_file": "../assets/images/BFW-WATER-A2_v1_2026-04-26.png",
      "prompt_file": "../docs/prompts/BFW-WATER-A2_prompt.md",
      "prompt_excerpt": [
        "与 v2 同变量结构，用于前后版本对照",
        "v2 进一步强化了几何锁定与禁变形约束"
      ],
      "variant_references": [
        {
          "title": "冷凝玻璃 + 数字钩子",
          "source": "02_A2_需求单 / 画面结构 + 测试总表 A2"
        }
      ],
      "linked_docs": [
        {
          "label": "A2 需求单",
          "href": "../docs/requirements/02_A2_需求单.md"
        },
        {
          "label": "出图日志",
          "href": "../docs/run-log.md"
        }
      ],
      "round_conclusion": "历史对照版。",
      "next_step": "仅用于与 v2 对比，不作为当前主投候选。"
    },
    {
      "test_id": "B1",
      "role": "变化组",
      "version": "v2",
      "status": "primary",
      "output_file": "../assets/images/BFW-WATER-B1_v2_2026-04-26.png",
      "prompt_file": "../docs/prompts/BFW-WATER-B1_prompt.md",
      "prompt_excerpt": [
        "保留透明横向水膜，变量只改标题逻辑",
        "主标题: All-Rounder Brightening Cleanser",
        "副信息: Brighten. Anti-shine. Clear.",
        "文案偏功效钩子，不加额外未确认功效"
      ],
      "variant_references": [
        {
          "title": "水膜包裹 + 功效钩子",
          "source": "03_B1_需求单 / 文案 + 测试总表 B1"
        }
      ],
      "linked_docs": [
        {
          "label": "测试总表",
          "href": "../docs/测试总表.md"
        },
        {
          "label": "B1 需求单",
          "href": "../docs/requirements/03_B1_需求单.md"
        },
        {
          "label": "出图日志",
          "href": "../docs/run-log.md"
        }
      ],
      "round_conclusion": "功效钩子表达版本。",
      "next_step": "若赢，二轮细测功效短句组合。"
    },
    {
      "test_id": "B1",
      "role": "变化组",
      "version": "v1",
      "status": "history",
      "output_file": "../assets/images/BFW-WATER-B1_v1_2026-04-26.png",
      "prompt_file": "../docs/prompts/BFW-WATER-B1_prompt.md",
      "prompt_excerpt": [
        "与 v2 同变量结构，用于前后版本对照",
        "v2 进一步强化了几何锁定与禁变形约束"
      ],
      "variant_references": [
        {
          "title": "水膜包裹 + 功效钩子",
          "source": "03_B1_需求单 / 文案 + 测试总表 B1"
        }
      ],
      "linked_docs": [
        {
          "label": "B1 需求单",
          "href": "../docs/requirements/03_B1_需求单.md"
        },
        {
          "label": "出图日志",
          "href": "../docs/run-log.md"
        }
      ],
      "round_conclusion": "历史对照版。",
      "next_step": "仅用于与 v2 对比，不作为当前主投候选。"
    },
    {
      "test_id": "B2",
      "role": "变化组",
      "version": "v2",
      "status": "primary",
      "output_file": "../assets/images/BFW-WATER-B2_v2_2026-04-26.png",
      "prompt_file": "../docs/prompts/BFW-WATER-B2_prompt.md",
      "prompt_excerpt": [
        "保留透明横向水膜，变量只改标题逻辑",
        "主标题: Dense Pearl Foam with Power Cleanse",
        "副信息: Brighter. Smoother. Shine-free.",
        "文案偏质地钩子，不做奶油泡沫广告感"
      ],
      "variant_references": [
        {
          "title": "水膜包裹 + 质地钩子",
          "source": "04_B2_需求单 / 文案 + 测试总表 B2"
        }
      ],
      "linked_docs": [
        {
          "label": "测试总表",
          "href": "../docs/测试总表.md"
        },
        {
          "label": "B2 需求单",
          "href": "../docs/requirements/04_B2_需求单.md"
        },
        {
          "label": "出图日志",
          "href": "../docs/run-log.md"
        }
      ],
      "round_conclusion": "质地钩子表达版本。",
      "next_step": "若赢，二轮细测 Dense Pearl Foam vs Power Cleanse Foam。"
    },
    {
      "test_id": "B2",
      "role": "变化组",
      "version": "v1",
      "status": "history",
      "output_file": "../assets/images/BFW-WATER-B2_v1_2026-04-26.png",
      "prompt_file": "../docs/prompts/BFW-WATER-B2_prompt.md",
      "prompt_excerpt": [
        "与 v2 同变量结构，用于前后版本对照",
        "v2 进一步强化了几何锁定与禁变形约束"
      ],
      "variant_references": [
        {
          "title": "水膜包裹 + 质地钩子",
          "source": "04_B2_需求单 / 文案 + 测试总表 B2"
        }
      ],
      "linked_docs": [
        {
          "label": "B2 需求单",
          "href": "../docs/requirements/04_B2_需求单.md"
        },
        {
          "label": "出图日志",
          "href": "../docs/run-log.md"
        }
      ],
      "round_conclusion": "历史对照版。",
      "next_step": "仅用于与 v2 对比，不作为当前主投候选。"
    }
  ]
};
