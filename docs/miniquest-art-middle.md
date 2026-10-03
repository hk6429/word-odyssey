# 小任務插畫：劍橋、約克、湖區

## 交付與使用範圍

- 生成方式：內建 `image_gen`，未使用 CLI、API 金鑰或替代 SVG。
- 三張 PNG 各含 3 欄 × 3 列、9 個情境，共 27 個不同場景。
- 整張尺寸：1536 × 1024；整張與各格皆為 3:2 比例。
- 用途：由程式以 3×3 圖集位置對應任務。這 27 格不是 27×任務數張唯一圖片，也不代表每個任務均有專屬生成圖。
- 保留全部生成原始檔；最終檔另複製至 Downloads，讀回比對原始位元組相同。
- 此工作只交付資產與文件；沒有修改頁面或執行瀏覽器驗收、部署。

## 檔案證據

| 專案檔案 | 大小（位元組） | SHA-256 |
|---|---:|---|
| `assets/miniquests-04.png` | 4035678 | `3591378153460c9cf94a16cfe820361d7d43a26979bb0b717d311eca41d37bf0` |
| `assets/miniquests-05.png` | 3765786 | `1fbf5f1fe2859ef365f2ebf73692b0ab186328bbe998bd14ba6f630a91bea672` |
| `assets/miniquests-06.png` | 3421222 | `79e52a631e97c4cc53300abe2c92a3eebdcc70f6a9e28a6afbcb37b0bc0a009b` |

最終 Downloads 副本：`~/Downloads/word-odyssey-miniquests/miniquests-04.png` 至 `miniquests-06.png`。

生成原始檔目錄：`~/.codex/generated_images/01a10133-0afb-78f2-a5ac-32b1421c8f4b/`。

| 圖集 | 最終原始檔 |
|---|---|
| 04 | `exec-394b6e20-1906-42b6-87f9-2aa46dccfd4c.png` |
| 05 | `exec-43043be3-4277-4719-a6bc-bef74a59dd30.png` |
| 06 | `exec-dc811bd2-4dcd-4f35-9665-6cfed6158033.png` |

湖區初稿 `exec-63274fb5-98e6-4857-acf8-9726d5e37cf5.png` 亦保留，因地圖與羅盤有微小字樣，以內建圖片編輯修正後採用最終原始檔。

## 格位順序

順序均為由左至右、由上至下；程式格號可使用 0–8。

| 格號 | 04 劍橋 | 05 約克 | 06 湖區 |
|---:|---|---|---|
| 0 | 古學院橋 | 中世紀城牆 | 湖畔划艇 |
| 1 | 河上划船 | 肉鋪街市集 | 綠色山徑 |
| 2 | 天文臺望遠鏡 | 教堂彩繪玻璃 | 石穀倉與羊群 |
| 3 | 圖書館邊註 | 老木門與鑰匙 | 雨天茶館 |
| 4 | 果園討論 | 石巷狐狸 | 瀑布步橋 |
| 5 | 燭光地圖 | 補鞋工坊 | 地形圖與羅盤 |
| 6 | 修鐘工坊 | 霧中河橋 | 湖邊營火 |
| 7 | 草地野餐與鳥 | 旅店爐邊晚餐 | 雨過天晴 |
| 8 | 夜間學院門 | 黎明屋頂鐘 | 山頂日出 |

## 視覺查核

使用 `view_image` 檢視三張初稿及湖區修正版，確認：每張 9 個情境、無外框與格間空隙、人物頭部未跨格、指定場景依序出現、彩色鋼筆水彩風格一致。湖區初稿發現微小地圖文字，完成一次針對中右格的生成式修正，再次檢視確認地圖邊緣留白、羅盤僅保留幾何圖形與刻度。這是圖片人工視覺檢查，不是網站端驗收。

檔案驗證：Python 標準函式庫讀取 PNG IHDR 尺寸、檔案大小與 SHA-256；複製後逐位元組比對專案檔、Downloads 副本與原始檔。Python 未編輯影像。

## 最終提示詞

### 04 劍橋

```text
Use case: illustration-story.
Asset type: a production sprite atlas for a British literary adventure game, not a poster.
Create ONE landscape 3:2 image containing EXACTLY NINE equal rectangular illustrations in a strict 3 columns by 3 rows regular grid. Overall canvas ratio 3:2, each of the nine cells also 3:2. Exact hard scene cuts at one-third and two-thirds of both image width and height. All cells fill their entire tile. Absolutely NO gutters, NO grid strokes, NO margins, NO frames, NO panel labels.
Style: elegant British illustrated storybook; vibrant colourful ink and watercolour, expressive fine pen work, visible ivory watercolour paper grain, subtle pigment splashes, verdigris and forest greens, antique gold, russet red and indigo. Beautiful cinematic lighting, rich local colour. Detailed appealing full scenes, not flat icons. Any people have complete heads inside their own tile and recognizable purposeful gestures.
Cambridge, nine distinct little adventures, in this exact reading order:
TOP LEFT: a curious traveller standing by an old Cambridge college stone bridge over the river, willow branches and golden towers.
TOP MIDDLE: two students rowing a narrow wooden rowing boat on a shining river with college lawns.
TOP RIGHT: a young astronomer at a brass telescope inside a domed university observatory, stars through the opening.
MIDDLE LEFT: a scholar discovering abstract marginal marks in an open old book in a rich timber college library, no legible writing.
MIDDLE MIDDLE: three friends deep in animated discussion beneath apple trees in a flowering orchard.
MIDDLE RIGHT: a traveller examining a richly drawn pictorial map by candlelight in an old room, no words.
BOTTOM LEFT: an artisan repairing a large intricate brass clockwork mechanism in a snug workshop.
BOTTOM MIDDLE: friends having a wicker-basket picnic on a college meadow as small songbirds approach.
BOTTOM RIGHT: a lone warmly dressed traveller approaching a magnificent college gate on a blue moonlit night, a golden lamp glowing.
No letters, no words, no captions, no numerals, no signatures, no logos, no watermark. Each scene is a separate complete illustration and no subjects cross the grid boundaries.
```

### 05 約克

```text
Use case: illustration-story.
Asset type: production sprite atlas for a British literary adventure game, not a poster.
Create ONE landscape 3:2 image containing EXACTLY NINE equal rectangular illustrations in a strict 3 columns by 3 rows regular grid. Overall canvas ratio 3:2, each cell also 3:2. Exact hard scene cuts at one-third and two-thirds of the width and height. All nine cells fill their entire tile. NO gutters, NO borders, NO grid strokes, NO margins, NO frames, NO labels.
Style: elegant British illustrated storybook, colourful ink and watercolour, expressive fine pen line, ivory watercolour paper grain, subtle pigment splashes, verdigris and forest greens, antique gold, russet red and indigo; vivid cinematic lighting, rich local colour. Detailed appealing full scenes rather than icons. All human heads entirely inside their own cell; no subjects overlap cell boundaries.
York, nine distinct small adventures, exact reading order:
TOP LEFT: a traveller walking on an ancient medieval city wall above warm red rooftops, green meadows outside.
TOP MIDDLE: a busy picturesque Shambles market, leaning timber-framed buildings, a woman selecting apples at a stall.
TOP RIGHT: a visitor in a vast Gothic cathedral gazing at jewel-like stained-glass windows and colourful sunbeams.
MIDDLE LEFT: a cloaked traveller holding an antique brass key beside a mysterious old oak door with iron hinges.
MIDDLE MIDDLE: a bright russet fox pausing in a winding cobbled stone alley, a traveller quietly observing behind.
MIDDLE RIGHT: a friendly cobbler repairing a worn leather boot in a cozy workshop full of tools.
BOTTOM LEFT: a person crossing a handsome old stone bridge over a foggy river, soft lantern glow.
BOTTOM MIDDLE: friends sharing a warming supper at an inn table beside a crackling fireplace.
BOTTOM RIGHT: a bell-ringer beside an ancient bell beneath a rooftop belfry at golden dawn, medieval city stretching below.
No letters, words, captions, numerals, signatures, logos, watermark, readable signage. Nine separate complete illustrations.
```

### 06 湖區初稿

```text
Use case: illustration-story.
Asset type: production sprite atlas for a British literary adventure game, not a poster.
Create ONE landscape 3:2 image containing EXACTLY NINE equal rectangular illustrations in a strict 3 columns by 3 rows regular grid. Overall canvas ratio 3:2 and each cell also 3:2. Exact hard scene cuts at one-third and two-thirds of width and height. All nine cells fill their entire tile. NO gutters, NO grid strokes, NO margins, NO frames, NO panel labels.
Style: elegant British illustrated storybook, vivid colourful ink and watercolour; expressive fine pen work, ivory watercolour paper texture and subtle pigment splashes. Verdigris and forest greens, antique gold, russet red and indigo. Rich natural colour and cinematic lighting. Full scenes with charming travellers and enchanting landscapes, not icons. All people have complete heads inside their own tiles; no subjects overlap cell boundaries.
English Lake District: nine distinct small adventures, exactly in reading order:
TOP LEFT: a young traveller seated in a wooden rowboat at a still lakeside jetty, green fells mirrored in the water.
TOP MIDDLE: two hikers walking up a winding green fell trail, bracken and dry-stone walls beside them.
TOP RIGHT: a shepherd and several woolly sheep beside a rustic stone barn among rolling hills.
MIDDLE LEFT: a traveller warming hands around a tea cup inside a cozy rural tea shop, rain streaking the windows.
MIDDLE MIDDLE: a hiker crossing a little wooden footbridge above a tumbling woodland waterfall.
MIDDLE RIGHT: close view of an antique brass compass resting on a pictorial topographic map on a rock, hiking boots at the edge, NO words or legible symbols.
BOTTOM LEFT: friends beside a small campfire on the lake shore at blue twilight, warm reflections in the water.
BOTTOM MIDDLE: a traveller standing on a ridge as dark stormclouds part, golden sunbeams illuminate a green valley and lake.
BOTTOM RIGHT: two travellers at a high rocky lookout above layered fells at a luminous sunrise.
No letters, words, captions, numerals, signatures, logos or watermark. Nine separate complete illustrations.
```

### 06 湖區修正

```text
Use case: precise-object-edit. Edit the attached Lake District nine-panel atlas. Make ONE targeted correction inside the MIDDLE RIGHT tile ONLY: remove every letter, every word, every numeral, all tiny map lettering and all compass letters or numerals. The map should keep its beautiful green, cream, and blue purely pictorial hills/contour lines/water shapes but have completely blank cream margins without any typography. The compass face should contain only a geometric eight-point star, its needle, and simple tick marks, absolutely no alphabetic glyphs or numbers. Preserve the overall 3:2 image ratio, exact strict 3×3 equal frameless tile grid, and all other eight scenes untouched. Preserve colours, watercolour-ink textures, characters, objects, and composition. No labels, no added marks, no frames.
```

