# 地圖區域 06–10 圖像來源與驗視

日期：2026-10-03

- 生成方式：內建 `image_gen`；未使用 API／CLI。
- 風格參考：已目視檢視 `assets/hero-journey.png`，以文字描述延續細緻英倫水彩、潑墨筆觸、飽和綠藍與赭金色調；未將參考圖當作編輯目標。
- 原始生成批次識別：`01a10103-7e15-7832-a18c-816077d0d562`。
- 最終檔為工具原始 PNG 的逐位元複本；無裁切、壓縮、改色或其他像素修改。
- 每張均為 1774 × 887，精確 2:1；均小於 5,000,000 bytes。複製後已逐位元比對原圖。
- 地景是英國區域啟發的奇幻旅程，並非地理精確地圖。
- 目視檢查：每張都是獨立完整地圖、單一連續俯視地形、無文字／數字／圓形 UI 圖釘／分格／浮水印，沒有大片留白。道路與地標座標是生成引導，並不保證逐像素對齊；互動元件仍需於瀏覽器整合驗證。
- 06、07 初稿出現重複地平線，已各針對單一問題重生一次。最終稿為下表所列來源。初稿保留於生成工具來源目錄，但未採用；初稿 ID 分別為 `exec-e2214160-d89a-4262-9d8b-3c88aa961844.png`、`exec-125ac81f-dacf-4bc0-854f-695180aecc62.png`。

| 圖檔 | 區域 | Bytes | SHA-256 |
| --- | --- | ---: | --- |
| `assets/map-region-06.png` | Lake District | 3663053 | `a12bec11e642a5f35a2e2dfd4bf44d650b245f1728e158aff4a5ae389eb89d19` |
| `assets/map-region-07.png` | Peak District | 3844712 | `fffae535e370b3352f71c7f635d97d8bd8f683a16a81627cfb8672f1c6850ed6` |
| `assets/map-region-08.png` | Edinburgh | 3767221 | `18279d91d935f58241afb94ac27ea0b1be570a4becfc7bb8e6cf9318c5da219c` |
| `assets/map-region-09.png` | Highlands | 3705917 | `1e014e6a0c271ce1346ad686d618bcda17aaf9baaab72b1f10118a85a4c52ef8` |
| `assets/map-region-10.png` | Homeward | 3859422 | `772d198ba530d88b1762371e0b87692ec1f3dd5c3c7196c71d7a76dd09275ad1` |

## 06 — Lake District

來源圖檔 ID：`exec-4dd8c946-476a-47dd-a77d-65c76abc7d74.png`

實際尺寸：1774 × 887。

目視結果：湛藍湖泊、木碼頭、石屋村、翠綠樹林與倒影山巒皆可辨識；俯視地景連續，S 型土路穿越三個高度區帶。

完整最終提示詞：

```text
Use case: illustration-story. Asset type: one standalone full-canvas interactive story-world journey map background for a British literature game. Create ONE wide 2:1 landscape image, 1536 by 768 pixels if possible, one complete continuous landscape; never a sheet, never panels or a collage. Viewpoint: a high 75-degree bird's-eye MAP VIEW, like looking down onto one complete miniature world from directly above. There is absolutely NO sky, NO horizon, NO distant landscape cutaway, and NO skyline at any height. Maintain ONE consistent overhead camera and ONE continuous ground plane across the entire canvas. It must read as one coherent map, not three scenic illustrations. Terrain fills every part of the frame.
Style: exquisitely detailed hand-painted British watercolor with lively colorful ink splashes and fine pen detail on subtle parchment, lush saturated forest greens, indigo-blue waterways, ochre-gold roofs. Warm, inviting, magical but recognizable British countryside, weathered stone, hedgerows, small flowers. Rich visible contrast and saturation; do NOT fade the terrain out to white. Full-bleed dense scenic world without large blank margins or empty paper.
Critical composition: within the single unified overhead terrain, ONE continuous walkable pale ochre gravel trail follows a broad S-shaped curve, doubling back twice. The bends are parts of one single landscape, NOT separate stacked panoramas or visual bands. It begins at upper left around (11%,20%), moves right through (34%,18%), (59%,18%), (87%,24%), curves down the right edge, travels right-to-left through (78%,48%), (50%,48%), (18%,54%), turns down the left, then moves left-to-right through (16%,76%), (49%,85%), (86%,78%). Integrate ten distinct small scenic landmarks beside those approximate positions. The route must visibly thread through the landscape naturally, with bridges when crossing water. Keep paths readable. The scenery is a fantasy-inspired regional Britain, not accurate geography.
Constraints: NO text, NO letters, NO numbers, NO labels, NO signage lettering, NO compass text, NO UI, NO buttons, NO circular map pins, NO numbered stops, NO dashed game-board route, NO grid, NO frame, NO watermark. Paint ONLY landscape and architecture; there will be interactive UI separately. Do not make a poster with an empty headline area.
Scene: a radiant Lake District story world of clear deep-blue lakes, wooded islands, glinting reflections of blue-green mountains, emerald forests and valleys. Include small wooden jetties, slate-roofed stone cottage villages, lakeshore gardens, footbridges, mountain paths, tiny boats moored naturally at jetties. Ten route landmarks in order: a lakeside stone cottage, a wooded lookout, a slate hamlet, a high mountain pass, a stone bridge over a stream, a jetty beside a brilliant blue lake, a mossy woodland arch, a country inn, a waterfront garden, a sunlit mountain-reflection viewpoint. Small mountains seen from above should form clusters around the map without blocking the readable trail. Indigo lakes and green hills richly fill every region.
OVERRIDING SPATIAL CONSTRAINT: a true overhead illustrated regional MAP. All water, hills, houses and paths must share one continuous view from above. Zero sky, zero horizons, zero seams between scenes. The land extends beyond all four edges. Do not stack separate perspective landscapes.
```

## 07 — Peak District

來源圖檔 ID：`exec-e1096c4a-c836-4310-b60e-b9fa3f9bdf8c.png`

實際尺寸：1774 × 887。

目視結果：石灰岩地形、荒原、綿羊、石牆、溪谷、石橋與旅人小屋清楚可辨；已消除初稿下方重複遠景。

完整最終提示詞：

```text
Use case: illustration-story. Asset type: one standalone full-canvas interactive story-world journey map background for a British literature game. Create ONE wide 2:1 landscape image, 1536 by 768 pixels if possible, one complete continuous landscape; never a sheet, never panels or a collage. Viewpoint: a high 75-degree bird's-eye MAP VIEW, like looking down onto one complete miniature world from directly above. There is absolutely NO sky, NO horizon, NO distant landscape cutaway, and NO skyline at any height. Maintain ONE consistent overhead camera and ONE continuous ground plane across the entire canvas. It must read as one coherent map, not three scenic illustrations. Terrain fills every part of the frame.
Style: exquisitely detailed hand-painted British watercolor with lively colorful ink splashes and fine pen detail on subtle parchment, lush saturated forest greens, indigo-blue waterways, ochre-gold roofs. Warm, inviting, magical but recognizable British countryside, weathered stone, hedgerows, small flowers. Rich visible contrast and saturation; do NOT fade the terrain out to white. Full-bleed dense scenic world without large blank margins or empty paper.
Critical composition: within the single unified overhead terrain, ONE continuous walkable pale ochre gravel trail follows a broad S-shaped curve, doubling back twice. The bends are parts of one single landscape, NOT separate stacked panoramas or visual bands. It begins at upper left around (11%,20%), moves right through (34%,18%), (59%,18%), (87%,24%), curves down the right edge, travels right-to-left through (78%,48%), (50%,48%), (18%,54%), turns down the left, then moves left-to-right through (16%,76%), (49%,85%), (86%,78%). Integrate ten distinct small scenic landmarks beside those approximate positions. The route must visibly thread through the landscape naturally, with bridges when crossing water. Keep paths readable. The scenery is a fantasy-inspired regional Britain, not accurate geography.
Constraints: NO text, NO letters, NO numbers, NO labels, NO signage lettering, NO compass text, NO UI, NO buttons, NO circular map pins, NO numbered stops, NO dashed game-board route, NO grid, NO frame, NO watermark. Paint ONLY landscape and architecture; there will be interactive UI separately. Do not make a poster with an empty headline area.
Scene: a Peak District story world of dramatic limestone dales, pale craggy escarpments, deep green valleys, russet and purple moorland, grazing woolly sheep, dry stone walls, little stone bridges, meandering brook, mountain footpaths and a welcoming traveler's cottage. Ten route landmarks in order: a stone stile, a sheep meadow, a limestone tor, a high moor lookout, a rustic traveler cottage, a narrow stone bridge, a sheltered valley hamlet, a small woodland waterfall, a hilltop ruin, an inviting country inn. Give clear terrain height and abundant recognizable small details while preserving the continuous S-trail.
OVERRIDING SPATIAL CONSTRAINT: a true overhead illustrated regional MAP. All water, hills, houses and paths must share one continuous view from above. Zero sky, zero horizons, zero seams between scenes. The land extends beyond all four edges. Do not stack separate perspective landscapes.
```

## 08 — Edinburgh

來源圖檔 ID：`exec-505b57a6-4e4c-47c5-ab7d-7ae8768584ef.png`

實際尺寸：1774 × 887。

目視結果：城堡山、尖頂、石階、庭園、河橋與暖色窗光清楚；石造建築密度較其他區域高，保持道路可讀性。

完整最終提示詞：

```text
Use case: illustration-story. Asset type: one standalone full-canvas interactive story-world journey map background for a British literature game. Create ONE wide 2:1 landscape image, 1536 by 768 pixels if possible, one complete continuous landscape; never a sheet, never panels or a collage. Viewpoint: a high 75-degree bird's-eye MAP VIEW, like looking down onto one complete miniature world from directly above. There is absolutely NO sky, NO horizon, NO distant landscape cutaway, and NO skyline at any height. Maintain ONE consistent overhead camera and ONE continuous ground plane across the entire canvas. It must read as one coherent map, not three scenic illustrations. Terrain fills every part of the frame.
Style: exquisitely detailed hand-painted British watercolor with lively colorful ink splashes and fine pen detail on subtle parchment, lush saturated forest greens, indigo-blue waterways, ochre-gold roofs. Warm, inviting, magical but recognizable British countryside, weathered stone, hedgerows, small flowers. Rich visible contrast and saturation; do NOT fade the terrain out to white. Full-bleed dense scenic world without large blank margins or empty paper.
Critical composition: within the single unified overhead terrain, ONE continuous walkable pale ochre gravel trail follows a broad S-shaped curve, doubling back twice. The bends are parts of one single landscape, NOT separate stacked panoramas or visual bands. It begins at upper left around (11%,20%), moves right through (34%,18%), (59%,18%), (87%,24%), curves down the right edge, travels right-to-left through (78%,48%), (50%,48%), (18%,54%), turns down the left, then moves left-to-right through (16%,76%), (49%,85%), (86%,78%). Integrate ten distinct small scenic landmarks beside those approximate positions. The route must visibly thread through the landscape naturally, with bridges when crossing water. Keep paths readable. The scenery is a fantasy-inspired regional Britain, not accurate geography.
Constraints: NO text, NO letters, NO numbers, NO labels, NO signage lettering, NO compass text, NO UI, NO buttons, NO circular map pins, NO numbered stops, NO dashed game-board route, NO grid, NO frame, NO watermark. Paint ONLY landscape and architecture; there will be interactive UI separately. Do not make a poster with an empty headline area.
Scene: a story-world interpretation of Edinburgh with a dramatic castle atop a rocky green hill, historic warm-gray stone buildings and ochre rooftops, winding cobblestone lanes, elegant spires, old stone stairs, intimate courtyards, leafy gardens and small bridges, glowing amber lamps and windows at golden early evening. Ten route landmarks in order: a stone city gateway, a steep old stairway, a clustered spired square, a commanding rocky castle, a lamp-lit historic close, an ivy-covered old library, a garden terrace, a village-like old inn, a footbridge beside a park stream, a welcoming golden-windowed townhouse. A natural cobblestone-and-gravel S route visibly joins them. The castle is impressive but does not consume the whole image or hide the top route.
OVERRIDING SPATIAL CONSTRAINT: a true overhead illustrated regional MAP. All water, hills, houses and paths must share one continuous view from above. Zero sky, zero horizons, zero seams between scenes. The land extends beyond all four edges. Do not stack separate perspective landscapes.
```

## 09 — Highlands

來源圖檔 ID：`exec-a93df080-cc97-467a-9722-fdff3f201b59.png`

實際尺寸：1774 × 887。

目視結果：深色古堡、靛藍湖泊、紫石楠、木橋與松林清楚；以地表亮光呈現雲隙光，避免天空破壞俯視構圖。

完整最終提示詞：

```text
Use case: illustration-story. Asset type: one standalone full-canvas interactive story-world journey map background for a British literature game. Create ONE wide 2:1 landscape image, 1536 by 768 pixels if possible, one complete continuous landscape; never a sheet, never panels or a collage. Viewpoint: a high 75-degree bird's-eye MAP VIEW, like looking down onto one complete miniature world from directly above. There is absolutely NO sky, NO horizon, NO distant landscape cutaway, and NO skyline at any height. Maintain ONE consistent overhead camera and ONE continuous ground plane across the entire canvas. It must read as one coherent map, not three scenic illustrations. Terrain fills every part of the frame.
Style: exquisitely detailed hand-painted British watercolor with lively colorful ink splashes and fine pen detail on subtle parchment, lush saturated forest greens, indigo-blue waterways, ochre-gold roofs. Warm, inviting, magical but recognizable British countryside, weathered stone, hedgerows, small flowers. Rich visible contrast and saturation; do NOT fade the terrain out to white. Full-bleed dense scenic world without large blank margins or empty paper.
Critical composition: within the single unified overhead terrain, ONE continuous walkable pale ochre gravel trail follows a broad S-shaped curve, doubling back twice. The bends are parts of one single landscape, NOT separate stacked panoramas or visual bands. It begins at upper left around (11%,20%), moves right through (34%,18%), (59%,18%), (87%,24%), curves down the right edge, travels right-to-left through (78%,48%), (50%,48%), (18%,54%), turns down the left, then moves left-to-right through (16%,76%), (49%,85%), (86%,78%). Integrate ten distinct small scenic landmarks beside those approximate positions. The route must visibly thread through the landscape naturally, with bridges when crossing water. Keep paths readable. The scenery is a fantasy-inspired regional Britain, not accurate geography.
Constraints: NO text, NO letters, NO numbers, NO labels, NO signage lettering, NO compass text, NO UI, NO buttons, NO circular map pins, NO numbered stops, NO dashed game-board route, NO grid, NO frame, NO watermark. Paint ONLY landscape and architecture; there will be interactive UI separately. Do not make a poster with an empty headline area.
Scene: an atmospheric Scottish Highlands story world with a dark romantic stone castle, long indigo lochs and sea inlets, purple heather across rolling rugged slopes, pine forests, cliffs, scattered stone cottages, wooden footbridges, brilliant shafts of sunshine breaking through mountain clouds. Ten route landmarks in order: a heather gate, a pine lodge, an ancient standing stone, a dark hillside castle, a waterfall bridge, a loch-side stone cottage, a wooden forest bridge, a purple-heather viewpoint, a small island causeway, a sunlit glen lodge. Abundant deep greens, blues and violet accents; No clouds or sky: suggest shafts of sunshine through light falling on the landscape. Readable terrain and S-shaped gravel walking path must fill the image rather than sky.
OVERRIDING SPATIAL CONSTRAINT: a true overhead illustrated regional MAP. All water, hills, houses and paths must share one continuous view from above. Zero sky, zero horizons, zero seams between scenes. The land extends beyond all four edges. Do not stack separate perspective landscapes.
```

## 10 — Homeward

來源圖檔 ID：`exec-8ac1b51e-8ab3-42cf-9a98-0743c6f80d4b.png`

實際尺寸：1774 × 887。

目視結果：繁花村落、河橋、果園、圖書館、廣場及暖窗家屋構成明亮歸途；金黃色道路清楚且連續。

完整最終提示詞：

```text
Use case: illustration-story. Asset type: one standalone full-canvas interactive story-world journey map background for a British literature game. Create ONE wide 2:1 landscape image, 1536 by 768 pixels if possible, one complete continuous landscape; never a sheet, never panels or a collage. Viewpoint: a high 75-degree bird's-eye MAP VIEW, like looking down onto one complete miniature world from directly above. There is absolutely NO sky, NO horizon, NO distant landscape cutaway, and NO skyline at any height. Maintain ONE consistent overhead camera and ONE continuous ground plane across the entire canvas. It must read as one coherent map, not three scenic illustrations. Terrain fills every part of the frame.
Style: exquisitely detailed hand-painted British watercolor with lively colorful ink splashes and fine pen detail on subtle parchment, lush saturated forest greens, indigo-blue waterways, ochre-gold roofs. Warm, inviting, magical but recognizable British countryside, weathered stone, hedgerows, small flowers. Rich visible contrast and saturation; do NOT fade the terrain out to white. Full-bleed dense scenic world without large blank margins or empty paper.
Critical composition: within the single unified overhead terrain, ONE continuous walkable pale ochre gravel trail follows a broad S-shaped curve, doubling back twice. The bends are parts of one single landscape, NOT separate stacked panoramas or visual bands. It begins at upper left around (11%,20%), moves right through (34%,18%), (59%,18%), (87%,24%), curves down the right edge, travels right-to-left through (78%,48%), (50%,48%), (18%,54%), turns down the left, then moves left-to-right through (16%,76%), (49%,85%), (86%,78%). Integrate ten distinct small scenic landmarks beside those approximate positions. The route must visibly thread through the landscape naturally, with bridges when crossing water. Keep paths readable. The scenery is a fantasy-inspired regional Britain, not accurate geography.
Constraints: NO text, NO letters, NO numbers, NO labels, NO signage lettering, NO compass text, NO UI, NO buttons, NO circular map pins, NO numbered stops, NO dashed game-board route, NO grid, NO frame, NO watermark. Paint ONLY landscape and architecture; there will be interactive UI separately. Do not make a poster with an empty headline area.
Scene: a joyful homeward journey returning to a flower-filled British village, a meandering rich blue river with welcoming stone bridges, cozy stone cottages with warm evening windows, profuse cottage gardens, flowering trees, a handsome small village library, country lanes and a glowing golden destination. Ten route landmarks in order: a meadow gate, a flower-lined stone bridge, a cottage garden, a village windmill, a welcoming timber-and-stone inn, a small old library, a riverside orchard, an ivy-covered schoolhouse, a blooming village square, a final cozy home with an ochre roof and bright amber windows. Warm low evening light, rose and yellow flowers, saturated forest-green canopies. Celebrate arrival through landscape detail with NO wording, no banners, no people portraits. The S-shaped golden gravel route is bright, welcoming and readable from first to last stop.
OVERRIDING SPATIAL CONSTRAINT: a true overhead illustrated regional MAP. All water, hills, houses and paths must share one continuous view from above. Zero sky, zero horizons, zero seams between scenes. The land extends beyond all four edges. Do not stack separate perspective landscapes.
```
