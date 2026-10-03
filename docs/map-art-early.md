# 區域地圖背景 01–05 生成紀錄

用途：字旅互動旅程地圖的獨立區域背景。五張皆為新製單張完整插畫，不是圖集。以英國各地為靈感，屬幻想敘事地圖，不宣稱地理精確。

工具：內建 image_gen；未使用 API 或 CLI fallback。已先檢視 assets/hero-journey.png 作風格參考，再以文字提示生成新圖。原圖保留；專案資產是原始 PNG 的逐位元組副本，未裁切、壓縮、調色或重繪。

共同契約：橫向 2:1、高角度俯視、單一連續地貌、三段 S 形步道、滿版細節、彩色水彩與墨線。不得出現文字、號碼、圓形 pin、UI、格線或水印。提示中的十站座標屬構圖目標，生成結果不是精準測繪；互動位置仍應以實際畫面驗收。

生成尺寸要求為 2048×1024；工具實際輸出全部為 1774×887，比例恰為 2:1，故保留原始像素。每張均小於 5,000,000 bytes。

檢視範圍：逐張目視內建工具回傳原圖，確認題材、濃彩滿版、連續俯視地貌與無文字介面；此紀錄不代表完成瀏覽器互動驗收。

| 區域 | 檔案 | 尺寸 | Bytes | SHA-256 |
|---|---|---|---:|---|
| 科茲窩 Cotswolds | assets/map-region-01.png | 1774×887 | 3791953 | 0c2469f443a28c3a75c07e6909c937f9f96d3c841d865689548fd0e85119bc97 |
| 牛津 Oxford | assets/map-region-02.png | 1774×887 | 3754022 | 6420e5ac20850df136c1c3a8985807c04cd4d39003b7904bb34a1b8929db958b |
| 倫敦 London | assets/map-region-03.png | 1774×887 | 3711109 | 33ef087dadeed727fed5153b14fe00f2aa5fc5d45d8cbf14e440110e42aeba4e |
| 劍橋 Cambridge | assets/map-region-04.png | 1774×887 | 3728570 | 05cfbe46d83e2abbf0cbfc13904ce1b60d6803dc00ea2e6246e28d72b0f4e47a |
| 約克 York | assets/map-region-05.png | 1774×887 | 3804446 | d2634e1a3e541eee730046cf1de5326fc1378522a793344079390ffd49a4f590 |

## 01 科茲窩 Cotswolds

來源 ID：exec-7b62e27b-d642-4525-b287-466146b2fa7e.png

目視結果：蜂蜜色石村、水車磨坊、果園、牧場與溪流皆清楚；步道以三段橫向蜿蜒連通，畫面滿版。 無大片留白，未見文字、編號、UI 或水印。

完整 prompt：

```text
Use case: illustration-story.
Asset type: immersive interactive journey game background, one seamless full landscape illustration, exact 2:1 panoramic aspect ratio, requested 2048x1024.
Primary request: Draw a dense, inviting, richly detailed, hand-painted bird's-eye / oblique overhead fantasy storybook regional map inspired by Britain. This is an atmospheric game world, not geographically exact.
Style: detailed traditional British watercolour and delicate ink drawing, visible paper grain, colourful ink splashes confined to narrow outer edges, strong saturated forest greens, indigo water, ochre-gold stone and roofs, flowers and varied botanical details. Professional illustrated travel book. Do NOT fade the whole scene. All regions filled with identifiable landscape and architecture. No large empty areas.
Composition: Top-down / high oblique viewing angle without a horizon or sky. The entire canvas is ONE continuous world, not a collection of separate vignettes. An obvious connected pale sand-and-gravel footpath snakes through THREE horizontal traverses: upper row from LEFT to RIGHT, middle row from RIGHT to LEFT, lower row LEFT to RIGHT. It must read as a continuous long S walking route. Ten distinct small landmark clusters sit BESIDE the path, roughly at canvas x/y percentage coordinates (11,20),(34,18),(59,18),(87,24),(78,48),(50,48),(18,54),(16,76),(49,85),(86,78). These coordinates are compositional guidance ONLY, never draw the coordinates. Keep the gravel trail continuous and unobstructed, put buildings alongside it. Small bridges may carry the trail over rivers. Richly fill the spaces between path traverses with wooded knolls, orchards, meadows, houses and waterways.
Constraints: no text, no words, no letters, no digits, no numbers, no signage text, no watermark, no title, no compass lettering, no UI, no buttons, no circular map pins, no numbered dots, no grid, no panels, no border frame, no labels. Never make a contact sheet or collage. One complete immersive region in one image.
Scene: a Cotswolds-inspired pastoral English countryside under warm morning light. Ten appealing landmarks include honey-coloured limestone cottage hamlets, a tiny stone-arched stream bridge, an old watermill, an apple orchard farmhouse, a village chapel, a rose-covered inn, sheep fields with dry-stone walls, a small market green, a manor garden and a hilltop stone cottage. Meandering indigo-blue brook connects the valleys; rich green patchwork fields, russet/gold roofs, apple blossom and flowering hedgerows.
```


## 02 牛津 Oxford

來源 ID：exec-11e795bf-2e84-4e90-8da6-3e8512f693d8.png

目視結果：圓頂書庫、哥德學院、花園與柳樹河道可辨；全圖是連續俯視學院地貌，無地平線。 無大片留白，未見文字、編號、UI 或水印。

完整 prompt：

```text
Use case: illustration-story.
Asset type: immersive interactive journey game background, one seamless full landscape illustration, exact 2:1 panoramic aspect ratio, requested 2048x1024.
Primary request: Draw a dense, inviting, richly detailed, hand-painted bird's-eye / oblique overhead fantasy storybook regional map inspired by Britain. This is an atmospheric game world, not geographically exact.
Style: detailed traditional British watercolour and delicate ink drawing, visible paper grain, colourful ink splashes confined to narrow outer edges, strong saturated forest greens, indigo water, ochre-gold stone and roofs, flowers and varied botanical details. Professional illustrated travel book. Do NOT fade the whole scene. All regions filled with identifiable landscape and architecture. No large empty areas.
Composition: Top-down / high oblique viewing angle without a horizon or sky. The entire canvas is ONE continuous world, not a collection of separate vignettes. An obvious connected pale sand-and-gravel footpath snakes through THREE horizontal traverses: upper row from LEFT to RIGHT, middle row from RIGHT to LEFT, lower row LEFT to RIGHT. It must read as a continuous long S walking route. Ten distinct small landmark clusters sit BESIDE the path, roughly at canvas x/y percentage coordinates (11,20),(34,18),(59,18),(87,24),(78,48),(50,48),(18,54),(16,76),(49,85),(86,78). These coordinates are compositional guidance ONLY, never draw the coordinates. Keep the gravel trail continuous and unobstructed, put buildings alongside it. Small bridges may carry the trail over rivers. Richly fill the spaces between path traverses with wooded knolls, orchards, meadows, houses and waterways.
Constraints: no text, no words, no letters, no digits, no numbers, no signage text, no watermark, no title, no compass lettering, no UI, no buttons, no circular map pins, no numbered dots, no grid, no panels, no border frame, no labels. Never make a contact sheet or collage. One complete immersive region in one image.
Scene: an Oxford-inspired English university story world under warm golden afternoon light. Ten landmark clusters include Gothic college gatehouses, a domed old library, ancient book-library courts, spired collegiate chapels, cloister gardens, a riverside willow walk, old scholarly stone townhouses, a stone arched footbridge, formal lawns and a grand college hall. An indigo river winds through the scene amid richly green grass courts and tall willows. Honey-gold limestone, copper and slate roofs, ivy, flower beds and stone boundary walls. Dense academic town mixed with generous lush garden details, all shown from above.
```


## 03 倫敦 London

來源 ID：exec-4f6cbd5b-640a-4f30-9878-d5c7ecc96624.png

目視結果：鐘塔、圓頂教堂、城堡、維多利亞街屋及泰晤士河風格河道可辨；雨後暖色燈光明顯。 無大片留白，未見文字、編號、UI 或水印。

完整 prompt：

```text
Use case: illustration-story.
Asset type: immersive interactive journey game background, one seamless full landscape illustration, exact 2:1 panoramic aspect ratio, requested 2048x1024.
Primary request: Draw a dense, inviting, richly detailed, hand-painted bird's-eye / oblique overhead fantasy storybook regional map inspired by Britain. This is an atmospheric game world, not geographically exact.
Style: detailed traditional British watercolour and delicate ink drawing, visible paper grain, colourful ink splashes confined to narrow outer edges, strong saturated forest greens, indigo water, ochre-gold stone and roofs, flowers and varied botanical details. Professional illustrated travel book. Do NOT fade the whole scene. All regions filled with identifiable landscape and architecture. No large empty areas.
Composition: Top-down / high oblique viewing angle without a horizon or sky. The entire canvas is ONE continuous world, not a collection of separate vignettes. An obvious connected pale sand-and-gravel footpath snakes through THREE horizontal traverses: upper row from LEFT to RIGHT, middle row from RIGHT to LEFT, lower row LEFT to RIGHT. It must read as a continuous long S walking route. Ten distinct small landmark clusters sit BESIDE the path, roughly at canvas x/y percentage coordinates (11,20),(34,18),(59,18),(87,24),(78,48),(50,48),(18,54),(16,76),(49,85),(86,78). These coordinates are compositional guidance ONLY, never draw the coordinates. Keep the gravel trail continuous and unobstructed, put buildings alongside it. Small bridges may carry the trail over rivers. Richly fill the spaces between path traverses with wooded knolls, orchards, meadows, houses and waterways.
Constraints: no text, no words, no letters, no digits, no numbers, no signage text, no watermark, no title, no compass lettering, no UI, no buttons, no circular map pins, no numbered dots, no grid, no panels, no border frame, no labels. Never make a contact sheet or collage. One complete immersive region in one image.
Scene: a London-inspired Victorian English urban story world just after rain, with warm glowing windows reflecting onto damp cobbles. Ten landmark clusters include a recognizable Gothic great clock tower, Victorian terraced streets, riverside townhouses, a grand domed church, a multi-arched bridge, a historic stone fortress gate, a leafy city garden square, a covered market hall without sign text, a red-brick railway-style viaduct and a grand old riverside building. The deep indigo Thames curves through the city and the gravel/cobbled walking route crosses elegant bridges. Victorian architecture with ochre roofs and slate, lush green park trees, lamplight and rain-washed colours. This remains an overhead richly coloured story-map, not a skyline or street-level perspective.
```


## 04 劍橋 Cambridge

來源 ID：exec-995397b1-733d-4e49-b537-91f7e3001e4b.png

目視結果：數學橋風格木橋、撐篙船、學院草坪與哥德教堂可辨；河道連續、俯視構圖滿版。 無大片留白，未見文字、編號、UI 或水印。

完整 prompt：

```text
Use case: illustration-story.
Asset type: immersive interactive journey game background, one seamless full landscape illustration, exact 2:1 panoramic aspect ratio, requested 2048x1024.
Primary request: Draw a dense, inviting, richly detailed, hand-painted bird's-eye / oblique overhead fantasy storybook regional map inspired by Britain. This is an atmospheric game world, not geographically exact.
Style: detailed traditional British watercolour and delicate ink drawing, visible paper grain, colourful ink splashes confined to narrow outer edges, strong saturated forest greens, indigo water, ochre-gold stone and roofs, flowers and varied botanical details. Professional illustrated travel book. Do NOT fade the whole scene. All regions filled with identifiable landscape and architecture. No large empty areas.
Composition: Top-down / high oblique viewing angle without a horizon or sky. The entire canvas is ONE continuous world, not a collection of separate vignettes. An obvious connected pale sand-and-gravel footpath snakes through THREE horizontal traverses: upper row from LEFT to RIGHT, middle row from RIGHT to LEFT, lower row LEFT to RIGHT. It must read as a continuous long S walking route. Ten distinct small landmark clusters sit BESIDE the path, roughly at canvas x/y percentage coordinates (11,20),(34,18),(59,18),(87,24),(78,48),(50,48),(18,54),(16,76),(49,85),(86,78). These coordinates are compositional guidance ONLY, never draw the coordinates. Keep the gravel trail continuous and unobstructed, put buildings alongside it. Small bridges may carry the trail over rivers. Richly fill the spaces between path traverses with wooded knolls, orchards, meadows, houses and waterways.
Constraints: no text, no words, no letters, no digits, no numbers, no signage text, no watermark, no title, no compass lettering, no UI, no buttons, no circular map pins, no numbered dots, no grid, no panels, no border frame, no labels. Never make a contact sheet or collage. One complete immersive region in one image.
Scene: a Cambridge-inspired English university garden story world in clear warm afternoon light. Ten landmark clusters include an immense late-Gothic college chapel, a narrow wooden Mathematical Bridge, a willow-shaded punt landing, ancient college courtyards, honey-coloured Gothic gatehouses, a scholarly library hall, a formal walled garden, a stone college bridge, a flower-filled riverside cottage and a grand college lawn. The indigo River Cam curves through lush green lawns and willow groves; little traditional punting boats glide in the river. Ochre-gold college masonry, grey and copper roofs, old stone walls, roses and green playing lawns. Distinct from Oxford: emphasize broad college lawns, more boats, the delicate crossed-timber Mathematical Bridge and riverside gardens.
```


## 05 約克 York

來源 ID：exec-8485d656-8162-45f4-9dd7-2d5c238fa55c.png

目視結果：城牆城門、約克大教堂風格雙塔、斜屋木構街屋及花草市集可辨；飽和綠地與靛藍河道連續。 無大片留白，未見文字、編號、UI 或水印。

完整 prompt：

```text
Use case: illustration-story.
Asset type: immersive interactive journey game background, one seamless full landscape illustration, exact 2:1 panoramic aspect ratio, requested 2048x1024.
Primary request: Draw a dense, inviting, richly detailed, hand-painted bird's-eye / oblique overhead fantasy storybook regional map inspired by Britain. This is an atmospheric game world, not geographically exact.
Style: detailed traditional British watercolour and delicate ink drawing, visible paper grain, colourful ink splashes confined to narrow outer edges, strong saturated forest greens, indigo water, ochre-gold stone and roofs, flowers and varied botanical details. Professional illustrated travel book. Do NOT fade the whole scene. All regions filled with identifiable landscape and architecture. No large empty areas.
Composition: Top-down / high oblique viewing angle without a horizon or sky. The entire canvas is ONE continuous world, not a collection of separate vignettes. An obvious connected pale sand-and-gravel footpath snakes through THREE horizontal traverses: upper row from LEFT to RIGHT, middle row from RIGHT to LEFT, lower row LEFT to RIGHT. It must read as a continuous long S walking route. Ten distinct small landmark clusters sit BESIDE the path, roughly at canvas x/y percentage coordinates (11,20),(34,18),(59,18),(87,24),(78,48),(50,48),(18,54),(16,76),(49,85),(86,78). These coordinates are compositional guidance ONLY, never draw the coordinates. Keep the gravel trail continuous and unobstructed, put buildings alongside it. Small bridges may carry the trail over rivers. Richly fill the spaces between path traverses with wooded knolls, orchards, meadows, houses and waterways.
Constraints: no text, no words, no letters, no digits, no numbers, no signage text, no watermark, no title, no compass lettering, no UI, no buttons, no circular map pins, no numbered dots, no grid, no panels, no border frame, no labels. Never make a contact sheet or collage. One complete immersive region in one image.
Scene: a York-inspired medieval English walled city story world in warm late-afternoon light. Ten landmark clusters include a magnificent pale limestone Gothic York Minster with twin towers, crenellated medieval city-wall gateways, crooked half-timbered Shambles-style old shop lanes, a vivid flower-and-herb market without signs, a stone arched river bridge, a round grassy castle mound and stone keep, a walled abbey garden, a timber guildhall, a Tudor inn covered in roses and an old watermill. The indigo Ouse-like river winds across the walled city. Honey-stone walls, ochre-red and slate roofs, dark timber-framed houses with cream plaster, hanging flower baskets, lush trees and herb gardens fill the terrain. All shown from high overhead, no horizon. S-shaped walking trail must stay clear and visually connect the entire immersive town.
```

