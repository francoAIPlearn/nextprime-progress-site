# nextprime-progress-site

NEXTPRIME 图文制作进度说明页（HTML 单页版）。

## Release

- Current: `v1.0.0` (2026-05-07)
- Type: 正式上线版本
- Scope: Test1~Test4 流程统一导航、Test4 出图评审与 Contact Sheet、审图数据流说明页

## Local Preview

直接打开：

- `index.html`

或本地起一个静态服务：

- `python3 -m http.server 8080`

然后访问 `http://localhost:8080/`

## Publish To GitHub

在该目录执行：

1. `git init`
2. `git add .`
3. `git commit -m "init nextprime progress site"`
4. `gh auth login`
5. `gh repo create nextprime-progress-site --public --source . --push`

## Source Data

页面内容来自：

- `NEXTPRIME_pic_editor` 下现有承接文档、测试总表、需求单、复盘表
- `output/Brightening_Face_Wash_实拍水感_首轮/exports` 的 v2 图稿
- `output/Brightening_Face_Wash_水感_test3` 的 10 张 BFW-WATER3 图稿、prompt、QA、run log
- `output/Brightening_Face_Wash_水感_test4` 的 60 张 BFW-WATER4 图稿、prompt、需求单、QA、contact sheets

## Review Notes

出图页支持共享评审：评论、候选勾选、1~5评分会同步到 review API，附件会优先上传共享存储，上传失败时退回浏览器本地缓存。浏览器的 `localStorage` 仍作为本地缓存和离线兜底使用。
