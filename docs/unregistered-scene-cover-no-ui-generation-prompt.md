# 《未登记现场》封面绘图短提示词：无 UI 版

用途：直接复制给绘图 AI。不要把完整 UI 需求文档一起喂给绘图 AI。

推荐参考图：

- `avatar_11.png`：男主角色画风和外形。
- `avatar_01.png`：小男孩助手角色画风和外形。
- `main-sample.png`：只作为色彩、纸张、线稿、印刷纹理参考。明确告诉绘图 AI 不要参考它的界面构图。

## 核心策略

不要在正向提示里写这些词：

- UI
- interface
- floor plan
- scene map
- grid
- board
- case file panel
- rule panel
- record log
- minesweeper
- anomaly marked cell

原因：这些词会让模型回到“大图纸 + 桌面 + 角色围着图纸”的固定构图。

## 正向提示词

```text
Horizontal 16:9 key visual cover art for a Japanese visual novel mystery puzzle game titled "未登记现场".
Create a real incident-site investigation scene, not a document layout.

Two characters are the main focus.
Left foreground: an adult male insurance loss adjuster for anomalous intrusion incidents, matching the provided male avatar exactly in face style, hair shape, simple navy ink linework, flat shading, dark coat, white shirt, tie, ID badge. He is standing inside a sealed motel corridor, holding a clipboard and flashlight, carefully inspecting a damaged door frame. His expression is tired, calm, professional, and alert.

Right midground: a quiet young boy assistant, matching the provided boy avatar exactly in face style, hair shape, simple navy ink linework, flat shading, dark uniform-like coat, white shirt, ID badge. He stands beside the investigator, eyes half closed, raising one hand toward the wall. Thin pale blue rule lines extend from his fingertips and connect real objects in the corridor, such as an emergency light, a security camera, a damaged terminal, and a half-open room door.

Setting: sealed old motel corridor at night, caution tape, numbered room doors, emergency light, security camera, damaged terminal, insurance survey clipboard, paper archive texture overlay, subtle red warning stamp on the wall or paper edge.

Mood: cold administrative paranormal investigation, restrained suspense, official insurance claim archive feeling.

Art style: must match the reference images exactly: aged ivory paper, dark navy ink linework, muted red accents, clean Japanese VN character art, flat shading, printed halftone texture, light paper scratches. Keep the characters simple and graphic, not realistic.

Reserve clean empty space near the top for the title. Do not include the title text unless requested.
```

## 带标题版追加句

只有需要 AI 直接写标题时才追加：

```text
Add the Chinese title "未登记现场" in the reserved top area, dark navy printed typography, clean and readable. Optional small English subtitle: "UNREGISTERED SCENE".
```

更推荐不让 AI 写字，后期排版。

## 负面提示词

```text
game UI, interface, gameplay screen, dashboard, floor plan, scene map, grid board, tabletop map, rule panel, record log, case file side panel, status bar, buttons, progress counters, small labels, many numbers, document poster layout, characters sitting at a table, characters playing with a map, characters pointing at a board, minesweeper board, large paper map in the center,
changed character design, realistic face, semi-realistic anime painting, 3D render, oil painting, photorealism, cyberpunk, neon, high saturation comic style, horror movie poster, black red gore palette,
monster, tentacles, blood, magic circle, wizard, gun, combat pose, religious symbol, existing organization logo, wrong Chinese text, cute mascot
```

## 中文短提示词

```text
横版 16:9 游戏封面主视觉，标题《未登记现场》，日式视觉小说悬疑解谜游戏。画真实异常事故现场，不要画资料界面，不要画图纸界面。

画面主体是两个角色。左侧前景是成年男性保险公司异常侵入事件定损员，外形和画风严格贴近男主 avatar：深海军蓝简洁线稿、扁平阴影、深色外套、白衬衫、领带、工牌。他站在被封锁的旧旅馆走廊里，拿着定损夹板和手电，正在检查损坏的门框，表情冷静疲惫、职业化、警觉。

右侧中景是小男孩助手，外形和画风严格贴近小男孩 avatar：黑发、深色制服感外套、白衬衫、工牌、冷淡平静。他站在男主旁边，半闭眼，一只手抬向墙面，指尖延伸出几条细淡蓝色定则线，连接走廊里的真实物件，例如应急灯、摄像头、损坏终端、半开的房门。

场景是夜晚封锁的旧旅馆走廊，有封锁线、房门编号、应急灯、摄像头、损坏终端、保险勘察夹板、淡淡纸张档案纹理、少量暗红警示印章。

气质是冷静行政化的异常调查，克制悬疑，不血腥。画风必须严格贴近参考图：米白纸张底色、深海军蓝线稿、暗红点缀、日式 VN 简洁角色、扁平阴影、印刷网点、轻微纸张划痕。上方预留标题空间，不要直接写字。
```

## 中文负面提示词

```text
不要游戏 UI，不要界面，不要仪表盘，不要平面图，不要现场图，不要网格棋盘，不要桌面地图，不要规则面板，不要记录日志，不要状态栏，不要按钮，不要进度数字，不要大量小字，不要资料海报布局，不要角色坐在桌边看地图，不要角色指着棋盘，不要扫雷棋盘，不要中央巨大纸质地图。
不要改变角色设计，不要写实脸，不要半写实厚涂，不要 3D，不要照片写实，不要赛博，不要霓虹，不要高饱和漫画风，不要恐怖电影海报黑红配色。
不要怪物，不要触手，不要血腥，不要魔法阵，不要魔法少年，不要枪，不要战斗姿态，不要宗教符号，不要既有组织标志，不要错误中文，不要可爱吉祥物。
```

