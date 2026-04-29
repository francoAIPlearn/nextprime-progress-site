# nextprime-progress-site

NEXTPRIME 图文制作进度说明页（HTML 单页版）。

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

出图页支持浏览器本地评审：评论、候选勾选、1~5评分和附件选择。评审数据保存在当前浏览器的 `localStorage`，小附件会以 data URL 持久化，大附件只记录文件名和大小。
