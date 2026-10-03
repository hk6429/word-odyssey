# 迷你冒險插畫圖集 01–03

- 日期：2026-10-03
- 工具：內建 image_gen（未使用 CLI 或 API 金鑰）。
- 產出：3 張原創點陣圖集，每張九個場景，共 27 個地區場景。
- 網站使用：由 CSS 九宮格取景映射到微任務；本批不代表 740 張獨立插畫。
- 原始生成檔保留於 `~/.codex/generated_images/01a10132-c1ac-73e3-8f59-b91474bef463/`。
- Downloads 交付：`~/Downloads/word-odyssey-miniquest-art/`。

## 檔案驗證

| 資產 | 地區 | 尺寸 | 位元組 | SHA-256 |
|---|---|---|---:|---|
| assets/miniquests-01.png | Cotswolds | 1536 × 1024 | 4179204 | ff2cc2cbc6cc7a1949940a90a10822872508a9c4d1c9ea0b7555f11e56ed6cbd |
| assets/miniquests-02.png | Oxford | 1536 × 1024 | 3504191 | 33a9c85c32ba140eb1ba2826ce9d38a4bee27af318ba3f7e4c177cced717756f |
| assets/miniquests-03.png | London | 1536 × 1024 | 3669416 | 67214ac3be53a85383e4e3490e5249a2c603ec35930545168a001a5f0c336156 |

原始檔、專案資產與 Downloads 副本已逐位元組比對相同。PNG IHDR 讀回確認尺寸。

## 目視檢查

已逐張透過 view_image 檢查：三張均為 3 欄 × 3 列，九個可區別場景；無文字標題、外框或白色間隔；主角頭部未被格線截斷。英國故事書建築、鮮明水彩與墨線質感一致。

生成圖不是數學繪圖。01、02 的橫向分隔接近 1/3、2/3；03 的第二條橫向分隔約在 y=672，較理論 y=682.67 高約 11 px。使用精確九宮格 CSS 裁切時，03 中列底部可能帶入一小條下列圖像；建議顯示容器有約 3% 內縮／放大安全邊界，並於網站驗收確認。未宣稱已做瀏覽器驗收。

## 原始檔

- 01：exec-5afc0d81-7a78-43eb-bf90-368762b89b44.png
- 02：exec-e1e76cf8-2c5b-42e1-bca9-e56e4d884483.png
- 03：exec-0bda9635-0555-4ab3-a6ca-1fb4a7d498ea.png

## 最終 Prompt 01

```text
Use case: illustration-story. Asset type: production website illustration atlas, nine separate Cotswolds microadventure images to be sliced by CSS.
Create ONE landscape image with EXACTLY 3 columns and EXACTLY 3 rows of equal rectangular panels: 9 scenes total, full atlas aspect ratio 3:2 and each panel 3:2. Strict straight panel boundaries at one-third and two-thirds both directions. Panels meet edge-to-edge, absolutely NO gutters, borders, frames, captions, labels, letters, words, numbers, watermarks or typography anywhere. Do not create a continuous panorama.
Style: elegant British illustrated storybook, expressive fine ink linework with vivid translucent watercolour, rich colourful ink splashes, tactile ivory paper texture; verdigris forest greens, antique gold, russet red and indigo. Painterly architectural detail, cinematic light, warm sense of small adventure. Every panel is a fully developed separate scenic illustration with its key subject in the central safe zone, all heads and important objects fully inside its own panel.
Read left to right, top to bottom:
1. Morning breakfast beside a honey-stone cottage, tea, toast and jam on a little garden table, cottage doorway and roses.
2. A curious red fox meets a traveller carrying a red sealed letter on a cobbled village lane; letter entirely blank.
3. Traveller crossing a curved old stone bridge over a sparkling brook, willows and honey-stone roofs.
4. Traveller watering vivid flowers in a cottage garden, copper watering can and climbing roses.
5. Open wooden field gate into rolling green countryside, compass held in foreground and grazing sheep beyond.
6. Folded illustrated map spread beneath an apple tree, traveller studying it on a blanket; map has shapes only, no writing.
7. Small rural steam-train platform, traveller holding a plain unprinted ticket, vintage railway canopy and luggage.
8. Rain-speckled cottage window seen from inside, steaming teapot and teacup in foreground, blue-green wet village outside.
9. Golden lanterns guide a traveller along an evening village path, luminous windows and dusk indigo sky.
No text on any objects, signs, maps or tickets. Varied camera distances, subjects and lighting make all nine scenes unmistakably different.
```

## 最終 Prompt 02

```text
Use case: illustration-story. Asset type: production website illustration atlas, nine separate Oxford microadventure images to be sliced by CSS.
Create ONE landscape image with EXACTLY 3 columns and EXACTLY 3 rows of equal rectangular panels: 9 scenes total, full atlas aspect ratio 3:2 and each panel 3:2. Strict straight panel boundaries at one-third and two-thirds both directions. Panels meet edge-to-edge, absolutely NO gutters, borders, frames, captions, labels, letters, words, numbers, watermarks or typography anywhere. Do not create a continuous panorama.
Style: elegant British illustrated storybook, expressive fine ink linework with vivid translucent watercolour, rich colourful ink splashes, tactile ivory paper texture; verdigris forest greens, antique gold, russet red and indigo. Painterly architectural detail, cinematic light, warm sense of small adventure. Every panel is a fully developed separate scenic illustration with its key subject in the central safe zone, all heads and important objects fully inside its own panel.
Read left to right, top to bottom:
1. Traveller climbs an elegant spiral staircase inside an old Oxford library, towering bookshelves and shafts of gold windowlight.
2. Stack of cloth-bound books at an oak writing desk, traveller thoughtfully examining a blank parchment, fountain pen, leaded window.
3. Two travellers carrying satchels meet beneath the archway of an Oxford college courtyard, ivy, pale stone and lush lawn.
4. Friends in a wooden punting boat glide past Oxford college gardens, graceful willow reflections.
5. A traveller reads beneath a willow on the riverbank, quiet sunlight, elegant stone buildings across the river; no visible writing on page.
6. Close-up of an antique brass key beside a glowing lantern at an old wooden library door, a traveller's hand reaching for the key.
7. Gothic Oxford clocktower at indigo dusk, young traveller in foreground gazing up, warm windows and swallows; clock face uses abstract tick marks, no numerals.
8. Two travellers shelter under a stone cloister in rain, wet courtyard reflecting lanterns.
9. Friends sharing a teapot and scones in a cosy Oxford tea room, burgundy cushions, books and rainlit leaded windows.
No text on any books, objects, signs, maps or papers. Varied camera distances, subjects and lighting make all nine scenes unmistakably different.
```

## 最終 Prompt 03

```text
Use case: illustration-story. Asset type: production website illustration atlas, nine separate London microadventure images to be sliced by CSS.
Create ONE landscape image with EXACTLY 3 columns and EXACTLY 3 rows of equal rectangular panels: 9 scenes total, full atlas aspect ratio 3:2 and each panel 3:2. Strict straight panel boundaries at one-third and two-thirds both directions. Panels meet edge-to-edge, absolutely NO gutters, borders, frames, captions, labels, letters, words, numbers, watermarks or typography anywhere. Do not create a continuous panorama.
Style: elegant British illustrated storybook, expressive fine ink linework with vivid translucent watercolour, rich colourful ink splashes, tactile ivory paper texture; verdigris forest greens, antique gold, russet red and indigo. Painterly architectural detail, cinematic light, warm sense of small adventure. Every panel is a fully developed separate scenic illustration with its key subject in the central safe zone, all heads and important objects fully inside its own panel.
Read left to right, top to bottom:
1. A red double-decker bus passes a traveller with an umbrella on a wet London street, russet and gold reflections, bus signage entirely blank.
2. Small passenger boat cruising on the Thames toward Tower Bridge, traveller in foreground at the railing, wind and sunlight.
3. Traveller discovers a book at a picturesque outdoor London bookstall with colourful old books, no titles or lettering.
4. A grand London railway platform under a curving glass roof, traveller carrying a vintage suitcase, locomotive steam and golden light; no signage.
5. Traveller sorting plain sealed envelopes at an old post-office counter, pigeonhole shelves, wax seal and brass weighing scale; no writing.
6. Westminster clocktower reflected in the Thames at golden dusk, traveller on the embankment watching the river; clock uses ticks with no numerals.
7. Lively covered London market with baskets of colourful apples, pears and vegetables, smiling vendor handing a basket to a traveller.
8. Traveller descending an old London underground stair entrance with wrought iron railings, classic circular red sign with blank blue bar and absolutely no letters.
9. Friends on a London rooftop under luminous indigo starlight, mugs of tea, chimneys, warm windows and distant moonlit skyline.
No text on any books, objects, signs, maps or papers. Varied camera distances, subjects and lighting make all nine scenes unmistakably different.
```

