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
