---
date: 2026-10-03
type: 製作紀錄
tags: [Word-Odyssey, 插畫, imagegen]
---

# 小任務插畫圖集：第 7～10 區

以內建 `image_gen` 生成，未使用 CLI、API 金鑰或程式繪圖。四張圖集包含 36 個區域情境，提供 CSS 九宮格裁切；完整系統預計以 90 個區域場景對應 740 個小任務，不能表述為 740 張不同插畫。

## 檔案與驗證

| 區域 | 專案檔 | 尺寸 | 位元組 |
|---|---|---:|---:|
| 07 | `assets/miniquests-07.png` | 1536 × 1024 | 4,016,237 |
| 08 | `assets/miniquests-08.png` | 1536 × 1024 | 3,412,310 |
| 09 | `assets/miniquests-09.png` | 1536 × 1024 | 3,887,707 |
| 10 | `assets/miniquests-10.png` | 1536 × 1024 | 4,189,646 |

- 每張完整尺寸為 3:2 橫式；3 欄 × 3 列、九個等比例橫式場景，無留白溝槽。
- 已使用 `view_image` 逐張目視檢查：場景順序、九宮格構圖、完整主體頭部、風格一致性。
- 第 8 區初稿的鐘面出現刻字，已使用內建工具精準修正；同時移除書脊標記與書店邊緣不完整人物。
- 以 PNG 標頭讀取尺寸，並逐位元組比對專案副本、Downloads 副本與生成原檔。
- 僅驗證圖檔本身，未執行瀏覽器、遊戲整合測試或部署。

## 原始檔、Downloads 與 SHA-256

### 07

- 專案：`~/projects/word-odyssey/assets/miniquests-07.png`
- 原始檔：`~/.codex/generated_images/01a10135-abd5-7ca0-aff1-e29880149104/exec-6d187969-5f8c-4eaf-be1d-4edd6a67dd48.png`
- Downloads：`~/Downloads/word-odyssey-miniquests-07.png`
- SHA-256：`62f4422fbbab5c1c9014b6337a866123b98164306627d75a7e7c5a9efa38cc0c`

### 08

- 專案：`~/projects/word-odyssey/assets/miniquests-08.png`
- 原始檔：`~/.codex/generated_images/01a10135-abd5-7ca0-aff1-e29880149104/exec-d2fdc930-3e0a-49ae-9fce-82ec186dae6e.png`
- Downloads：`~/Downloads/word-odyssey-miniquests-08.png`
- SHA-256：`15c9d0e14e5612708546d76a88b364315166e55ce3ade6b52420eda4d6fb0252`

### 09

- 專案：`~/projects/word-odyssey/assets/miniquests-09.png`
- 原始檔：`~/.codex/generated_images/01a10135-abd5-7ca0-aff1-e29880149104/exec-b0b5334e-80b7-4d54-9bf7-b7c083901fb8.png`
- Downloads：`~/Downloads/word-odyssey-miniquests-09.png`
- SHA-256：`91b3dde051bcccd9f36af6be3dd4f612e57f721e49f13e8c7b46699556433d8f`

### 10

- 專案：`~/projects/word-odyssey/assets/miniquests-10.png`
- 原始檔：`~/.codex/generated_images/01a10135-abd5-7ca0-aff1-e29880149104/exec-209e31c2-635f-463c-9d41-fb0c9b3aafba.png`
- Downloads：`~/Downloads/word-odyssey-miniquests-10.png`
- SHA-256：`599ddcb725450b582c9f5712b7fcd998887e7131ddc93e41cbb621d78bfcbc64`

## 完整生成提示詞

### 07

```text
Use case: illustration-story. Asset type: landscape game illustration atlas for Word Odyssey.
Create ONE brand-new finished landscape image with a strict overall 3:2 aspect ratio, composed of EXACTLY THREE COLUMNS and THREE ROWS of nine equal rectangular panels. Every individual panel is also 3:2 landscape. The panel boundaries are precisely at one-third and two-thirds of image width and height. Hard straight aligned panel changes, edge-to-edge artwork, absolutely no gutters, no visible frames, no borders, no margins. This is a usable 3x3 sprite atlas, not a freeform collage.
Theme: Peak District. Nine genuinely different mini-adventures, row-major left to right then top to bottom:
1. limestone valley walking trail with a small backpacked traveller.
2. old stone footbridge over a tumbling stream.
3. unlettered folded map beside an old watermill.
4. sealed letter discovered in ruined ivy-covered abbey.
5. cosy country pub fireplace and warm table.
6. raven perched on a trail marker without text.
7. lantern glowing inside a twilight limestone cave.
8. three friends climbing a grassy ridge.
9. sunrise spreading across an open moor.
Style: elegant British illustrated storybook, colourful watercolour and expressive ink, fine pen details, controlled ink splashes, natural ivory paper texture, vivid cinematic environmental storytelling. Verdigris and forest green, antique gold, russet red, warm ivory and indigo. Painterly atmospheric landscapes, charming believable architecture, graceful small storybook characters. Each panel must be its own fully composed scenic wide shot filling the entire rectangle. Keep every person and every animal's complete head safely within its panel; main subjects remain fully legible when each panel is cropped independently.
Lighting: rich changing atmosphere appropriate to each scene, luminous highlights, tactile paper grain. The nine pictures use the same refined hand-painted style.
Absolute exclusions: no letters, no words, no captions, no numbers, no typography, no logos, no watermark, no printed map labels, no clock numerals, no panel labels, no speech bubbles. Do not merge neighbouring scenes. No extra panels.
```

### 08

```text
Use case: illustration-story. Asset type: landscape game illustration atlas for Word Odyssey.
Create ONE brand-new finished landscape image with a strict overall 3:2 aspect ratio, composed of EXACTLY THREE COLUMNS and THREE ROWS of nine equal rectangular panels. Every individual panel is also 3:2 landscape. The panel boundaries are precisely at one-third and two-thirds of image width and height. Hard straight aligned panel changes, edge-to-edge artwork, absolutely no gutters, no visible frames, no borders, no margins. This is a usable 3x3 sprite atlas, not a freeform collage.
Theme: Edinburgh. Nine genuinely different mini-adventures, row-major left to right then top to bottom:
1. Edinburgh castle seen from a cobbled street.
2. inviting old bookshop with an open unlabeled book.
3. narrow sandstone close and arched passageway.
4. bagpiper playing at a lively old market.
5. antique astronomical clock on a desk without numbers or letters.
6. Calton Hill observatory beneath a dramatic blue sky.
7. steaming coffee cup beside a candle in a cosy cafe.
8. storm clouds and rain swirling over Edinburgh castle.
9. moonlit Edinburgh rooftops and chimneys.
Style: elegant British illustrated storybook, colourful watercolour and expressive ink, fine pen details, controlled ink splashes, natural ivory paper texture, vivid cinematic environmental storytelling. Verdigris and forest green, antique gold, russet red, warm ivory and indigo. Painterly atmospheric landscapes, charming believable architecture, graceful small storybook characters. Each panel must be its own fully composed scenic wide shot filling the entire rectangle. Keep every person and every animal's complete head safely within its panel; main subjects remain fully legible when each panel is cropped independently.
Lighting: rich changing atmosphere appropriate to each scene, luminous highlights, tactile paper grain. The nine pictures use the same refined hand-painted style.
Absolute exclusions: no letters, no words, no captions, no numbers, no typography, no logos, no watermark, no printed map labels, no clock numerals, no panel labels, no speech bubbles. Do not merge neighbouring scenes. No extra panels.
```

### 09

```text
Use case: illustration-story. Asset type: landscape game illustration atlas for Word Odyssey.
Create ONE brand-new finished landscape image with a strict overall 3:2 aspect ratio, composed of EXACTLY THREE COLUMNS and THREE ROWS of nine equal rectangular panels. Every individual panel is also 3:2 landscape. The panel boundaries are precisely at one-third and two-thirds of image width and height. Hard straight aligned panel changes, edge-to-edge artwork, absolutely no gutters, no visible frames, no borders, no margins. This is a usable 3x3 sprite atlas, not a freeform collage.
Theme: Scottish Highlands. Nine genuinely different mini-adventures, row-major left to right then top to bottom:
1. Scottish castle beside a tranquil loch.
2. backpacked traveller hiking a purple heather moor.
3. majestic stag standing in a pine forest.
4. stone cairn beside a beautiful brass compass with no labels.
5. two travellers crossing a ruined stone bridge.
6. warm campfire beside two small tents.
7. waterfall descending through misty Highland rocks.
8. lantern glowing near a snowy mountain path.
9. aurora borealis reflected over a Highland lake.
Style: elegant British illustrated storybook, colourful watercolour and expressive ink, fine pen details, controlled ink splashes, natural ivory paper texture, vivid cinematic environmental storytelling. Verdigris and forest green, antique gold, russet red, warm ivory and indigo. Painterly atmospheric landscapes, charming believable architecture, graceful small storybook characters. Each panel must be its own fully composed scenic wide shot filling the entire rectangle. Keep every person and every animal's complete head safely within its panel; main subjects remain fully legible when each panel is cropped independently.
Lighting: rich changing atmosphere appropriate to each scene, luminous highlights, tactile paper grain. The nine pictures use the same refined hand-painted style.
Absolute exclusions: no letters, no words, no captions, no numbers, no typography, no logos, no watermark, no printed map labels, no clock numerals, no panel labels, no speech bubbles. Do not merge neighbouring scenes. No extra panels.
```

### 10

```text
Use case: illustration-story. Asset type: landscape game illustration atlas for Word Odyssey.
Create ONE brand-new finished landscape image with a strict overall 3:2 aspect ratio, composed of EXACTLY THREE COLUMNS and THREE ROWS of nine equal rectangular panels. Every individual panel is also 3:2 landscape. The panel boundaries are precisely at one-third and two-thirds of image width and height. Hard straight aligned panel changes, edge-to-edge artwork, absolutely no gutters, no visible frames, no borders, no margins. This is a usable 3x3 sprite atlas, not a freeform collage.
Theme: Homecoming. Nine genuinely different mini-adventures, row-major left to right then top to bottom:
1. train arriving in the Cotswolds countryside.
2. welcoming blue cottage door surrounded by flowers.
3. young traveller handing a sealed letter to a smiling elder.
4. friends planting a community garden.
5. large antique atlas opened in a village library with unlabeled maps.
6. friends gathered around a round tea table.
7. cottage window glowing warmly at dusk.
8. children and an adult making unlabeled maps at a workshop table.
9. open countryside path beneath spring blossom.
Style: elegant British illustrated storybook, colourful watercolour and expressive ink, fine pen details, controlled ink splashes, natural ivory paper texture, vivid cinematic environmental storytelling. Verdigris and forest green, antique gold, russet red, warm ivory and indigo. Painterly atmospheric landscapes, charming believable architecture, graceful small storybook characters. Each panel must be its own fully composed scenic wide shot filling the entire rectangle. Keep every person and every animal's complete head safely within its panel; main subjects remain fully legible when each panel is cropped independently.
Lighting: rich changing atmosphere appropriate to each scene, luminous highlights, tactile paper grain. The nine pictures use the same refined hand-painted style.
Absolute exclusions: no letters, no words, no captions, no numbers, no typography, no logos, no watermark, no printed map labels, no clock numerals, no panel labels, no speech bubbles. Do not merge neighbouring scenes. No extra panels.
```

## 第 8 區精準修正提示詞

```text
Edit only this existing nine-panel Edinburgh illustration atlas. Preserve the complete 3 by 3 grid, all panel boundaries, every scene, colour, British ink-and-watercolour style and precise composition. In the centre panel (row 2 column 2), remove ALL letters and Roman numerals and numeral-like symbols from the astronomical clock rings. Replace those marks with plain unmarked polished antique brass rings, keeping the clock's mechanism and circles. In the top-middle bookshop panel, replace writing-like marks on the book spines with blank coloured spines. Remove the partially visible cut-off person at the far right edge of that bookshop panel, filling that tiny area with the existing bookshop shelves. No other change. No text, no typography, no numbers, no new decoration. Maintain overall 3:2 landscape output and the exact nine equal edge-to-edge panels.
```

第 8 區初稿亦保留於原始生成目錄：
`~/.codex/generated_images/01a10135-abd5-7ca0-aff1-e29880149104/exec-5a27beba-fc4c-4f0e-a759-cb0f06650b19.png`

