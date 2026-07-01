# 《未登记现场》游戏封面 / 标题图绘制需求文档

用途：交给绘图 AI 或美术执行者，用于绘制游戏标题图、宣传封面、启动页主视觉。

本版重点修正：封面必须像正式游戏 key art。不要画成游戏 UI 截图，不要画成角色围着平面图玩游戏，不要篡改角色画风。

实际生成时优先使用短提示词：`docs/unregistered-scene-cover-no-ui-generation-prompt.md`。本长文档适合人类理解方向，不建议整份喂给绘图 AI，因为其中反复出现的 UI、平面图、棋盘等词会诱导模型回到错误构图。

参考素材目录：`D:\WebProjects\RoomAxioms\images\samples`

必须参考：

- `main-sample.png`：唯一主风格参考。用于米白纸张、深海军蓝线稿、暗红异常标记、印刷网点、纸质档案质感。
- `avatar_11.png` 或 `avatar_10.png`：成年男主参考。优先 `avatar_11.png`。
- `avatar_01.png` 或 `avatar_00.png`：小男孩助手参考。优先 `avatar_01.png`。

可选参考：

- `30083e07-bdf2-4a00-9168-320b18109a96 (1).png`：中文标题、按钮字重、局部 UI 质感参考。

不建议作为主参考：

- `93d91dda-c153-438e-8916-6c90653a26a7.png`：只可借少量档案灰和纸张磨损，不要继承它的写实暗灰风格。

## 1. 项目一句话

《未登记现场》是一款包装成 VN 的类扫雷逻辑解谜游戏。玩家扮演保险公司负责异常侵入现场定损的调查员，与能感知“定则”的小男孩助手一起，在真实异常现场中根据公开定则和已勘察事实，推理并标注不能直接勘察的异常区域。

关键词：

- 保险定损
- 异常侵入现场
- 真实现场勘察
- 定则感知
- 纸质档案
- 冷静行政化的怪异
- VN 双主角
- 类扫雷逻辑推理

整体可以有“制度化异常档案机构”的冷感，但不能出现任何既有外部组织名称、标志或直接致敬元素。

## 2. 这张封面必须解决的问题

最近生成结果不合格，原因如下：

1. 篡改了角色画风：角色变得更写实、更厚涂，脸型和线稿不再像 avatar 参考。
2. 把游戏中用于类比现场的平面图 UI 直接画了出来，导致画面像玩家在玩一张棋盘。
3. 男主和小男孩的动作变成“围着桌面平面图操作”，而不是在异常现场中调查和感知定则。
4. 背景仍然有大量 UI 面板、小字、数值栏、case file 栏，封面像界面截图。

本次重画的目标：

- 角色画风必须锁定参考图。
- 角色必须在真实异常现场里行动。
- 平面图、网格、红色异常格只能作为隐喻性视觉元素，不能成为主体棋盘。
- 背景不能出现完整 UI、规则面板、日志面板、顶部进度条。
- 画面第一眼必须像游戏封面，不是游戏界面。

## 3. 标题与文字

主标题：

```text
未登记现场
```

可选英文副标题：

```text
UNREGISTERED SCENE
```

可选机构副标题：

```text
异常侵入赔案调查部
Abnormal Claim Survey Division
```

强烈建议生成“无文字版”或“标题留白版”，最终标题由后期排版叠加。AI 如果必须画字，只允许画主标题《未登记现场》，必须清晰无错字。

## 4. 画风锁定要求

画风必须贴近 `main-sample.png` 和 avatar：

- 日式 VN 角色线稿。
- 扁平阴影。
- 深海军蓝为主要墨色。
- 米白纸张底色。
- 暗红只用于异常、印章、警示。
- 印刷网点、扫描纹理、纸张磨损。
- 角色脸部简洁、平面化、克制，不要画成写实厚涂脸。

角色 identity lock：

- 男主脸型、发型、眉眼、外套轮廓要接近 `avatar_10/11`。
- 小男孩脸型、发型、比例、冷淡表情要接近 `avatar_00/01`。
- 可以改变姿势和镜头，但不要改变角色年龄感、画风、五官结构、服装大方向。
- 不要把男主画成欧美硬汉、战斗特工、警察、侦探 noir 主角。
- 不要把小男孩画成魔法少年、灵媒巫师、可爱吉祥物。

禁止风格：

- 写实厚涂。
- 3D 渲染。
- 照片拼贴。
- 赛博霓虹。
- 高饱和欧美漫画。
- 恐怖电影黑红海报。
- 魔法特效风。

## 5. 角色设定与动作

### 男主

身份：保险公司异常侵入现场定损员。

气质：

- 成年男性。
- 冷静、疲惫、职业化。
- 长期处理异常现场，有压抑的经验感。
- 不是战斗人员，不是热血侦探，不是玩家化身。

外观：

- 深色外套或风衣。
- 白衬衫、领带或正式内搭。
- 胸前工牌。
- 可持有赔案档案、定损夹板、签字笔、现场测量工具、手电、封条。

封面动作推荐：

- 在真实现场门口半蹲或俯身，用笔记录门框、墙面、地面或设备损坏痕迹。
- 一手举着赔案报告，另一手拉开封锁胶带或按住现场封条。
- 站在异常房间门前，低头核对工单，眼神看向画面深处的异常光源。
- 用手电照向现场深处，另一手握住定损夹板。

不要画成：

- 坐在桌前玩平面图。
- 用笔在大棋盘上移动棋子。
- 只是半身像站在 UI 旁边。

### 小男孩助手

身份：男主的助手，能感知现场“定则”。

气质：

- 年龄明显小于男主。
- 安静、早熟、冷淡。
- 能看见普通人看不见的规则线、异常关系或现场约束。
- 不是魔法少年，不摆夸张施法姿势。

外观：

- 黑发少年。
- 深色制服感外套或外勤外套。
- 白衬衫。
- 可有简化工牌。

封面动作推荐：

- 站在异常门口或走廊中，闭眼抬手，指尖牵出几条细蓝线，蓝线连接真实现场物件。
- 手指轻触墙面、门牌、摄像头、应急灯或损坏终端，像正在感知规则。
- 侧身站在男主身后，视线不看图纸，而看向现场里某个普通人看不见的关系点。
- 身边出现少量半透明规则线、圆圈或坐标碎片，但这些是现场感知，不是游戏 UI。

不要画成：

- 坐在桌前操作一张平面图。
- 像玩家一样用手指点棋盘格。
- 使用魔法阵或夸张蓝色大法术。

## 6. 推荐封面构图：真实现场版

画幅建议：横版 16:9，`1920 x 1080` 或 `2560 x 1440`。

核心构图：

- 背景是真实异常现场：旅馆走廊、客房门口、封锁线、损坏终端、应急灯、摄像头、床铺或门牌。
- 男主在左前景，占画面高度 70%-90%，正在勘察现场或记录定损。
- 小男孩在右前景或右中景，占画面高度 55%-75%，正在感知现场定则。
- 画面中央或深处有一个普通但不安的异常焦点：一扇门、一盏灯、一台损坏终端、一段封锁线后的房间。
- 标题《未登记现场》预留在上方或左上方。

平面图/网格的处理：

- 只能作为轻量隐喻层，不能成为主画面。
- 可出现在男主手中夹板的一角，或背景中非常淡的半透明线稿。
- 可以有少量透明方格、坐标碎片、规则线叠加在真实现场上。
- 不要出现铺满桌面的完整地图。
- 不要出现像扫雷棋盘一样的大格子。
- 不要出现完整 UI 面板、规则栏、日志栏、按钮、进度条。

推荐画面效果：

```text
男主在封锁的旅馆走廊中进行异常侵入赔案定损，手持夹板和笔，正在记录门框和地面上的异常损坏。
小男孩助手站在一旁，闭眼抬手，几条细蓝色定则线从指尖延伸，连接应急灯、摄像头、损坏终端和一扇半开的门。
背景有米白档案纸纹理和淡淡的现场图纸线条，但没有完整游戏 UI。
暗红色异常印章和一处红色警示反光提示危险。
整张图像正式 VN 游戏封面，不像游戏界面截图。
```

## 7. UI 与平面图使用限制

允许出现：

- 男主手中夹板或报告的一角。
- 淡淡的档案编号、印章、纸张边框。
- 少量半透明现场平面线条。
- 少量规则线、圆圈、异常印章。
- 一处红色异常提示或警示反光。

禁止出现：

- 完整游戏 UI。
- 大面积现场平面图桌面。
- 大面积方格棋盘。
- 规则栏。
- 记录日志栏。
- 顶部状态栏。
- case file 右侧信息面板。
- submit/reset/hint 等按钮。
- 大量小字、数值、列表。
- 角色围着图纸做“玩家操作”。
- 角色坐在桌前玩棋盘。

一句话规则：

```text
封面可以暗示“平面图推理”，但不能让角色看起来像正在玩游戏。
```

## 8. 异常表现

异常感来自“真实现场被不自然但严密的定则支配”，不是来自怪物。

可以使用：

- 现场门缝中微弱暗红光。
- 异常印章。
- 墙面或地面上淡淡错位的图纸线。
- 小男孩指尖延伸的细蓝定则线。
- 真实物件之间的关系线。
- 一个普通物件被红色标记圈出。
- 档案纸纹理与现实场景重叠。

不要使用：

- 怪物正脸。
- 血腥场面。
- 触手。
- 法阵。
- 宗教符号。
- 枪械战斗。
- 夸张灵异光效。

## 9. 给绘图 AI 的新版主提示词

优先使用无文字版：

```text
Horizontal 16:9 key visual cover art for a Japanese visual novel logic puzzle game.
It must look like a professional game cover, not a gameplay UI screenshot.
The scene is a real abnormal insurance claim investigation site, not a tabletop game board.

Style must exactly match the provided reference images: clean Japanese VN character line art, dark navy ink, aged ivory paper texture, muted red anomaly stamps, flat shading, printed halftone texture, restrained suspense. Do not change the character art style.

Left foreground: adult male insurance loss adjuster for anomalous intrusion scenes, matching the provided male avatar style and face design, dark coat, white shirt, tie, ID badge, tired calm professional expression. He is inspecting a real sealed motel room doorway or corridor, holding a claim survey clipboard and pen, recording damage on a door frame or floor. He is not playing with a map.

Right foreground or midground: quiet young boy assistant, matching the provided boy avatar style and face design, black hair, dark uniform-like coat, white shirt, ID badge, calm detached expression. He stands in the real scene with one hand raised toward the wall, door, emergency light, security camera, or damaged terminal. Thin pale blue rule lines extend from his fingertips and connect real scene objects, showing his ability to perceive scene rules.

Background: sealed motel corridor or abnormal incident room entrance, caution tape, emergency light, security camera, damaged terminal, a half-open door, paper archive texture overlay, subtle institutional anomaly investigation mood.

Use only subtle abstract investigation graphics: faint floor-plan lines, a few coordinate fragments, one muted red anomaly stamp, a few thin blue rule lines. No full floor plan, no large grid board, no game interface.

Reserve clean empty space near the top for the Chinese title.
```

如果必须生成带标题版：

```text
Same image, with the Chinese title "未登记现场" placed clearly in the reserved top area, dark navy printed title typography, optional small English subtitle "UNREGISTERED SCENE". Text must be correct and readable.
```

中文提示词：

```text
横版 16:9 游戏封面主视觉，日式视觉小说风格的类扫雷逻辑解谜游戏《未登记现场》。必须像正式游戏封面，不要画成游戏 UI 截图，不要画成角色围着平面图玩游戏。

画风必须严格贴近参考图：米白纸张底色、深海军蓝线稿、暗红异常印章、扫描纸纹、印刷网点、扁平阴影、清晰日式 VN 角色线稿。角色脸型、发型、比例和线稿必须贴近给定 avatar，不要改成写实厚涂或其他画风。

左侧前景是成年男性保险公司异常侵入现场定损员，外观贴近男主 avatar，深色外套或风衣，白衬衫，领带，胸前工牌，手持赔案定损夹板和签字笔，正在真实封锁现场的门框、地面或损坏设备旁进行勘察记录，表情冷静疲惫、职业化、警觉。他不是在操作地图，也不是在玩棋盘。

右侧前景或中景是小男孩助手，外观贴近小男孩 avatar，黑发，深色制服感外套，白衬衫，胸前工牌，安静早熟，表情平静疏离。他站在真实现场中，闭眼或半睁眼，一只手抬向墙面、门牌、应急灯、摄像头或损坏终端，指尖延伸出几条细淡蓝色定则线，连接真实现场物件，表现他能感知定则。

背景是真实异常现场：封锁的旅馆走廊、客房门口、半开的门、应急灯、摄像头、损坏终端、封锁线。画面叠加少量米白档案纸纹理、淡淡现场图纸线条、暗红异常印章和少量规则线。平面图和网格只能是非常淡的背景符号，不能铺满桌面，不能成为主画面。

上方预留《未登记现场》标题空间。不要完整 UI 面板，不要规则栏，不要记录日志栏，不要顶部状态栏，不要按钮，不要大段小字，不要让角色像玩家一样围着平面图操作。
```

## 10. 负面提示词

```text
gameplay UI screenshot, full game interface, user interface poster, characters playing a board game, characters operating a floor plan like players, tabletop map as main subject, huge floor plan, huge grid board, minesweeper board, rule sidebar, record log panel, top status bar, case file info panel, submit button, reset button, partner review button, cluttered HUD, tiny UI text, many numbers, many labels,
changed character style, realistic anime painting, semi-realistic face, photorealistic, 3D render, thick oil painting, cyberpunk neon, high saturation comic style, horror movie poster palette,
wrong title, 未确定现场, undetermined scene,
gore, blood, monster face, tentacles, magic circle, wizard, magic boy, gunfight, action pose, religious symbols, existing organization logo, copyrighted emblem, wrong Chinese characters, cute comedy tone
```

中文负面提示：

```text
不要游戏 UI 截图，不要完整游戏界面，不要 UI 海报，不要角色像玩家一样玩棋盘，不要角色围着桌面平面图操作，不要巨大平面图，不要巨大方格棋盘，不要扫雷棋盘，不要规则栏，不要记录日志栏，不要顶部状态栏，不要 case file 信息面板，不要提交按钮，不要重置按钮，不要搭档复核按钮，不要杂乱 HUD，不要大量小字，不要大量数字和标签。
不要篡改角色画风，不要写实动漫厚涂脸，不要照片写实，不要 3D，不要厚涂，不要赛博霓虹，不要高饱和欧美漫画，不要恐怖电影黑红配色。
不要写成《未确定现场》。
不要血腥，不要怪物正脸，不要触手，不要魔法阵，不要魔法少年，不要枪战，不要战斗姿态，不要宗教符号，不要既有异常组织标志，不要错误中文，不要可爱搞笑风。
```

## 11. 推荐交付

优先：

- 横版无文字版：`1920x1080` 或 `2560x1440`。
- 横版标题留白版。
- 如果生成器支持，输出角色、背景、标题空间分层。

可选：

- 带《未登记现场》标题版。
- 仅真实异常现场背景版。
- 仅角色透明底版。

安全区：

- 标题区域必须干净。
- 角色脸部不能贴边。
- 真实现场焦点不能被 UI 小字淹没。
- 红色异常点要明显，但不能抢过角色脸和动作。

## 12. 合格标准

合格封面应当：

- 第一眼像游戏封面 key art，不像游戏界面。
- 角色是主体，且画风贴近 avatar。
- 男主正在真实现场做定损/勘察动作。
- 小男孩正在真实现场感知定则。
- 平面图/网格只是隐喻符号，不是大棋盘。
- 画面没有完整 UI 面板。
- 标题能正确排成《未登记现场》。

不合格表现：

- 角色围着桌面图纸像在玩游戏。
- 背景是大量 UI 面板。
- 角色画风被改成写实厚涂或其他风格。
- 平面图比角色和现场更重要。
- 看起来像普通 UI 宣传图、网页 banner 或游戏截图。
- 文字错误，尤其写成《未确定现场》。
