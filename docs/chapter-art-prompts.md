---
date: 2026-10-03
type: 其他
tags: [章節插圖, 圖集, imagegen]
---

# 100 章插圖製作紀錄

使用內建 `image_gen.imagegen`，未使用 API 或 CLI。交付 **10 張 PNG 圖集，共 100 個不同場景**，不是 100 個獨立圖片檔案。每張依章節順序排列為 5 欄 × 2 列，上排由左到右再接下排。所有圖集均已在生成結果中目視檢查，並複製至專案 assets。

章節事件依 `story.js` 的 `getReading(stageId)`；初版重複十情節的草案未採用。牛津與倫敦各做一次風格/分格修正，最終版本已移除白色格線。原始生成檔保留在 imagegen 的 generated_images 目錄，以下只記錄相對識別碼。

## 圖檔契約與檢查

- 實際尺寸：全部 **1983 × 793**；提示詞原請求 2560 × 1024，內建工具實際輸出如表。
- 每格理論尺寸：396.6 × 396.5，使用 CSS 百分比可精確等分，不必另行裁圖。
- CSS 背景大小：`500% 200%`；列內位置為 `0% / 25% / 50% / 75% / 100%`，上、下排為 `0% / 100%`。
- 單格長寬比：`(1983 * 2) / (793 * 5) = 1.0002522068`。
- PNG 檔頭、寬高、實際位元組與 SHA-256 已由 Node.js 讀檔檢查；十檔內容雜湊相異。
- 額外以 Node.js 解碼 PNG 像素後，依 5×2 讀取所有分格；100 格的像素 SHA-256 全部不同。這項檢查只讀取影像，未重新編碼或修改 PNG。
- 插圖為 AI 生成的場景詮釋；角色細部與道具可能略有差異。題目及情節以 `story.js` 的文字為準。

| 圖集 | 章節 | 地區 | 尺寸 | 位元組 | 最終生成ID |
|---|---:|---|---|---:|---|
| `assets/chapters-01.png` | 1–10 | Cotswolds | 1983×793 | 3347810 | `generated_images/01a100e7-f9e8-7173-b2af-f9aac1e7c8ad/exec-23009c53-dfce-4aae-8926-c52f1d5b846a.png` |
| `assets/chapters-02.png` | 11–20 | Oxford | 1983×793 | 3085806 | `generated_images/01a100e7-f9e8-7173-b2af-f9aac1e7c8ad/exec-24d6ad84-6f21-42b5-bd19-75a8115dacf5.png` |
| `assets/chapters-03.png` | 21–30 | London | 1983×793 | 3237057 | `generated_images/01a100e7-f9e8-7173-b2af-f9aac1e7c8ad/exec-6ac7bba4-937a-4f45-8c7a-702f2b444374.png` |
| `assets/chapters-04.png` | 31–40 | Cambridge | 1983×793 | 3180252 | `generated_images/01a100e7-f9e8-7173-b2af-f9aac1e7c8ad/exec-4a73e2c5-d2fd-46cc-a209-4f6c774752fd.png` |
| `assets/chapters-05.png` | 41–50 | York | 1983×793 | 3159760 | `generated_images/01a100e7-f9e8-7173-b2af-f9aac1e7c8ad/exec-c2c16053-a275-4491-8dda-d704385f1472.png` |
| `assets/chapters-06.png` | 51–60 | Lake District | 1983×793 | 3318074 | `generated_images/01a100e7-f9e8-7173-b2af-f9aac1e7c8ad/exec-63704f3e-bac3-43ff-848f-99ba2126d2c7.png` |
| `assets/chapters-07.png` | 61–70 | Peak District | 1983×793 | 3145147 | `generated_images/01a100e7-f9e8-7173-b2af-f9aac1e7c8ad/exec-c17ff34a-00ea-447e-a0de-873a960e2ccd.png` |
| `assets/chapters-08.png` | 71–80 | Edinburgh | 1983×793 | 3083533 | `generated_images/01a100e7-f9e8-7173-b2af-f9aac1e7c8ad/exec-170cd859-4c14-47fd-adac-e5fbd6df2493.png` |
| `assets/chapters-09.png` | 81–90 | Highlands | 1983×793 | 3266007 | `generated_images/01a100e7-f9e8-7173-b2af-f9aac1e7c8ad/exec-c79b4664-786e-4692-8381-b22b0a46f698.png` |
| `assets/chapters-10.png` | 91–100 | Homeward | 1983×793 | 3394731 | `generated_images/01a100e7-f9e8-7173-b2af-f9aac1e7c8ad/exec-96b5cd29-d854-4906-8030-603f60929904.png` |

## SHA-256

```text
b6a8956fc7ac468a7c235d2cb3d1b99333b7c7e1593cd5ad443a06aab6f8b35a  assets/chapters-01.png
48632d0d5eb369b4dd51320f189ba9ff41fdea89ad341e3c9cf4666fa8916b87  assets/chapters-02.png
b1951afa34b5cae00df75b902aa64f355be0d3b12b7fe4803fd157bee06ba1bc  assets/chapters-03.png
2ddf39f2e9d4b1e160d436858fce77be9892339d4554d189a441936757533b31  assets/chapters-04.png
af65b235d6f3bcda83dd09d4fb820e5c8ff78fa58282c0af1895b7372749ddb7  assets/chapters-05.png
0e778297bc2a422ba371b51ce2ec590ddf9e0f424f84009da67c87b6086df09b  assets/chapters-06.png
b758732a7d64381fda71bdc0e86e2411aa5063c075d8e18012dd42b9e99389b3  assets/chapters-07.png
e5979525f91802b8c834fe1e1db51ae696381b8f5116d919308e383c1ca7a641  assets/chapters-08.png
f483b014982cb8fde285a19f6d8e3c8cd2e15ca0dd5d6c3eed242845da6c1913  assets/chapters-09.png
fa09218bdc3a90b4cebdca7557f23a02cca5b4dd3e254d2b7ab6a8c4b2c1021e  assets/chapters-10.png
```

## 共用提示詞

每張完整提示詞由本節共用提示詞與下方各區域提示詞直接串接。

```text
Use case: illustration-story. Asset type: production chapter illustration sprite atlas for an immersive English-reading game. Create ONE ultra-wide raster image, requested size 2560 by 1024 pixels, aspect ratio 5:2. CRITICAL LAYOUT: exactly FIVE equal columns and TWO equal rows = exactly TEN separate scene panels in a precise regular grid. Each panel fills exactly 20 percent of canvas width and 50 percent of height. Hard straight invisible boundaries at x20,40,60,80 percent and y50 percent. ZERO gutters, ZERO borders, ZERO frames, ZERO padding, ZERO text, ZERO letters, ZERO captions, ZERO numbers. Full-bleed color right to every edge; every subject stays well inside its own cell. Each cell is a DIFFERENT story scene; no single continuous landscape across cells. British coloured-ink and watercolor picture-book illustration, detailed delightful fine pen linework on warm ivory paper, soft pigments, teal/moss/ochre palette with scarlet-red traveling coat accents, not photorealistic, consistent characters. Protagonist an adult traveler with scarlet coat, tawny wide brim hat, dark trousers, leather satchel; friend Mira adult dark-haired woman wearing teal coat and ochre scarf. Orange fox only where specified. All ten cells must be visually distinct in camera angle, lighting and focal objects while having the same art style. Books/maps/envelopes may carry pictorial marks but NO readable lettering. Describe scenes strictly row-major: top row cells1-5 left-to-right, bottom row cells6-10 left-to-right.
```

## 圖集 01 — Cotswolds

```text
REGION COTSWOLDS, honey-stone cottages, green hedges and apple gardens. TOP ROW: 1 Dawn lane, red sealed envelope lying on cobblestones, orange fox sits beside it, traveler discovers it. 2 Close view of Mira's hand-held brass compass pointing toward a vivid BLUE cottage door with roses. 3 Orange fox waits by garden gate, elderly white-haired man opens blue door to travelers. 4 Interior still life: a teacup on wooden table and mysteriously EMPTY chair by sunlit cottage window, no person occupying chair. 5 Mira shares a torn rustic bread loaf with traveler at table while fox bounds toward open garden door. BOTTOM ROW: 6 Traveler kneeling below apple tree opens buried wooden box containing a GREEN book missing one page. 7 Rainy cottage porch, Mira protects green book beneath coat, warm light appears across rainy lane. 8 Overhead table: green book beside folded map, matching small golden STAR symbols, Mira comparing them. 9 Small Cotswolds train station: elderly man hands BLUE key to traveler, orange fox staying next to old man's boots, steam train behind. 10 View from departing train window, traveler holding bag with blue key, village receding, distant figure waves from last carriage. NO fictional generic replacement scenes; render these ten exact beats.
```

## 圖集 02 — Oxford

```text
undefinedREGION OXFORD, honey-stone scholarly city, spires visible through library windows. Recurring Rowan is an older male librarian with short silver hair and brown tweed waistcoat. Ada is a young dark-haired school-age girl in mustard cardigan. TOP ROW: 1 Travelers unlock vivid BLUE arched library door with a BLUE key, Rowan awaits within. 2 Rowan opens huge GREEN atlas at library table, maps show towns but EMPTY SPACES without connecting roads. 3 Close-up open leaded window, a distinct small handprint in dusty sill, sunlight. 4 Ada quietly sits behind a tall bookcase, holding a single loose map page, travelers finding her. 5 Ada points to an EMPTY patch on map where her home belongs, her face earnest. BOTTOM ROW: 6 Mira lifts a translucent map page against golden window light, faint river-shaped pictorial mark emerging on margin, no lettering. 7 Cozy library tea scene, precisely three cups, Rowan and travelers listening closely to Ada. 8 Overhead view Mira draws a new road connecting a tiny house to a town, warm golden glow and second star on map. 9 Open atlas with a pictorial small river and bell, a faint luminous bell shape above book, Oxford spires in background. 10 Exterior library at dusk: traveler checks empty pocket, on doorstep a train ticket lies where blue key should be, departing toward station. Each cell different and framed independently; no fox away from the home village.
```

修正模式：圖像 1 為本圖集初稿，圖像 2 為已通過的 `chapters-04.png` 風格參考。修正指令如下，後接本圖集完整提示詞：

```text
EDIT image 1 (target) into a FINISHED PAINTED CHAPTER ATLAS. Image 2 is ONLY the style and layout reference: copy its hand-drawn coloured-ink/watercolor medium, adult traveler design and full-bleed five-column two-row grid. Correct image1's photographic appearance and white gutters; use painterly illustrated faces and warm ivory paper texture like image2. Keep the exact TEN target scene events in row-major order. Output ultra-wide aspect5:2, 2560x1024 requested, all ten cells square, strictly regular5columns×2rows. Erase ALL lettering, every sign label, book-spine label, ticket text; use pictograms or blank paper instead. Eliminate all white divider lines entirely so artwork directly touches at x20/40/60/80% andy50%. No borders, no gutters, no margins, no camera-realistic faces. Preserve exact scene narrative below.
```

## 圖集 03 — London

```text
undefinedREGION LONDON, Thames river stone bridge, brick embankments, distant clocktower skyline. New recurring Iona is adult curly-haired dark-skinned woman in indigo raincoat carrying a brass lantern, no fox. TOP ROW: 1 Rain lashes bridge, Iona raises lantern calling to scarlet traveler and teal-coated Mira. 2 Closeup Iona's open palm presents a single SILVER BUTTON under lantern glow, wet bridge behind. 3 Travelers peer over stone bridge parapet looking DOWN at small wooden boat below, upper church bell visible. 4 Kindly grey-bearded boatman steadies boat at stone steps while nervous Mira carefully boards. 5 Inside boat, Iona and boatman lean over unfolded map with new narrow road line spanning river. BOTTOM ROW: 6 Warm tiny tea stall sheltered UNDER huge bridge arch, woman shopkeeper welcomes soaked travelers to tea. 7 Single silver button on tea-stall table foreground; shopkeeper points across river toward EMPTY far bank. 8 Mira discovers rolled message INSIDE small brass bell, Iona lights it with lantern, boatman offers timetable without readable text. 9 Mira adds tiny tea-stall symbol to map beside shining river line as woman shopkeeper smiles. 10 Train interior at night, traveler Mira and Iona sit opposite mysterious woman in GREY coat by window, overhead lights dim, suspenseful but kind. Exactly ten visual scenes, no text.
```

修正模式：圖像 1 為本圖集初稿，圖像 2 為已通過的 `chapters-04.png` 風格參考。修正指令如下，後接本圖集完整提示詞：

```text
EDIT image 1 (target) into a FINISHED PAINTED CHAPTER ATLAS. Image 2 is ONLY the style and layout reference: copy its hand-drawn coloured-ink/watercolor medium, adult traveler design and full-bleed five-column two-row grid. Correct image1's photographic appearance and white gutters; use painterly illustrated faces and warm ivory paper texture like image2. Keep the exact TEN target scene events in row-major order. Output ultra-wide aspect5:2, 2560x1024 requested, all ten cells square, strictly regular5columns×2rows. Erase ALL lettering, every sign label, book-spine label, ticket text; use pictograms or blank paper instead. Eliminate all white divider lines entirely so artwork directly touches at x20/40/60/80% andy50%. No borders, no gutters, no margins, no camera-realistic faces. Preserve exact scene narrative below.
```

## 圖集 04 — Cambridge

```text
MEDIUM EMPHASIS: visibly HAND-PAINTED WATERCOLOR on paper, transparent wash, ink contours, simplified drawn faces, never a photograph or 3D rendering. Grid edges are touching adjacent scenes with NO visible white separator lines. REGION CAMBRIDGE, willow-fringed River Cam, collegiate courts, punts. Iona adult dark-skinned woman curly hair indigo coat with brass lantern; Nell young adult red-haired student with russet jumper; no fox. TOP ROW: 1 Train carriage dawn: empty seat, blue KEY on floor under seat, travelers noticing. 2 Sunny river landing, Nell welcomes traveler and Mira beside wooden punt with colleges behind. 3 Nell points NORTH along winding river while traveler hesitates with map at fork of towpaths. 4 Two adult students on opposite sides of college courtyard offer conflicting stories; Mira and Iona listen thoughtfully between them. 5 Old timber boathouse: blue key unlocks door revealing shelves and heaps of letters from many towns. BOTTOM ROW: 6 Inside boathouse, traveler modestly selects small bundle of letters while Nell asks a question, Mira reassuring. 7 Macro view Iona holding OLD TORN ENVELOPE with a pictorial city seal, loose mail all around, no actual letters/text. 8 Mira sorts illustrated clue cards into TWO separate piles on table, one facts one questions represented by objects, blank cards, no text. 9 Close warm conversation with Nell at boathouse doorway; traveler packs correspondence carefully in leather satchel while listening. 10 Station platform farewell, Nell gives wooden PENCIL to scarlet traveler through departing train window, old letter tucked into satchel, golden northern horizon. Ten distinct compositions matching exact events.
```

## 圖集 05 — York

```text
MEDIUM EMPHASIS: clearly painted British WATERCOLOR picture-book art with fine coloured ink lines and soft pigment washes, no photography. NO white grid lines: scenes meet directly at invisible straight cell boundaries. REGION YORK, medieval warm sandstone streets, city wall, Gothic minster, quiet archive. Recurring Iona adult dark-skinned curly-haired woman indigo coat, Mira teal ochre, scarlet traveler. Archivist elderly woman round spectacles and moss cardigan. TOP ROW: 1 York archive at tall window, archivist opens household ledger whose pages have pale erased spaces and tiny house drawings. 2 Friendly apron-wearing baker recalls past while showing travelers house beside old city wall, basket of bread foreground. 3 Mira holds thin translucent sheet against leaded sunlit window, faint erased pictorial marks appearing beneath newer marks, no legible writing. 4 Archivist calmly rests hand on LOCKED private wooden drawer, traveler respectfully explains purpose with open palms. 5 With permission all sit reading a fragile flood account at archive table, old sketch of flooded houses lies beside it. BOTTOM ROW: 6 Traveler receives message at rain-streaked window, Mira gazes at suspiciously tidy blank map, thoughtful mood. 7 Teacher shows CHILD'S DRAWING of crooked footbridge to travelers and three older neighbours at school table. 8 Close overhead hands add DOTTED bridge line to river map, archivist watches, dotted path clearly focal. 9 Diverse York residents gather around revised page, one woman points to correction while another indicates blank private space, respectful meeting. 10 At dusk travelers discover BOAT REPAIR RECEIPT tucked INSIDE open ledger cover, small sketched rowboat visible, copper lamplight, hint of silver lake reflected in window. No words, no lettering.
```

## 圖集 06 — Lake District

```text
MEDIUM EMPHASIS: authentic painted watercolor storybook art, coloured ink outlines, subtle paper grain, simplified illustrated facial features, absolutely NOT photography or 3D. Full bleed art cells touching, no visible white grid dividers. REGION LAKE DISTRICT, silver lakes and wooded fells, slate cottages, old jetties. Recurring Iona adult dark-skinned curly-haired woman in indigo raincoat with brass lantern. TOP ROW: 1 Quiet deserted ferry jetty, fresh flowers beside empty ticket window, woman ferry operator points out clue to travelers. 2 Tired adult traveler with walking backpack sits by unused jetty holding map of promised ferry, no boat present, protagonist empathetic beside him. 3 In timber repair shed, craftsman planes restored little ROWBOAT, shows it to Mira and scarlet traveler. 4 Strong wind whips grey lake into waves, travelers stay safely UNDER stone cottage porch, Iona puts lantern into bag, leaves blown sideways. 5 Sheltered flower garden overlooking lake, elderly neighbour shares tea and memories with friends. BOTTOM ROW: 6 Mira sketching map beside visible STEEP hillside footpath with stone steps, map uses route and clock pictograms not lettering. 7 Close view inside restored boat: sealed envelope tucked below wooden seat, traveler's hand discovers it in calm sunlight. 8 Calm golden morning, ferry operator supervises community group safely boarding sturdy ferry at jetty, everyone wearing appropriate lifejackets, no overcrowding. 9 Other shore, travelers inspect noticeboard outside CLOSED slate schoolhouse, pasted drawings of observatory and hills, no readable writing. 10 Twilight lake vista, traveler holds closed green atlas and a small golden STAR shines THROUGH its cover, distant fells silver. Ten unique scenes.
```

## 圖集 07 — Peak District

```text
MEDIUM EMPHASIS: painted British WATERCOLOR picture-book art, hand-drawn ink lines, paper texture, stylized illustrated human faces, no photography. No white lines, all cell edges directly touch. REGION PEAK DISTRICT, rolling moors, limestone villages, dry-stone walls and hilltop observatory. Iona adult dark-skinned curly-haired woman indigo coat lantern. Astronomer elderly adult woman with short silver hair, round glasses and burgundy knit sweater. TOP ROW: 1 Wide exterior CLOSED old observatory dome with damaged roof fenced off; travelers remain safely outside at gate with plain pictorial direction arrow toward village below. 2 Astronomer welcomes travelers into cozy temporary village workshop FULL of lenses and notebooks. 3 Extreme close-up damaged glass lens splitting a glowing lamp into TWO light images, Iona studies it thoughtfully. 4 Daylight stone WALKERS' SHELTER on moor, caretaker shows safe dry interior to travelers and hikers. 5 At workshop table, Mira and Iona discuss travel plans with serious respectful expressions; map and check sheets between them, moor window. BOTTOM ROW: 6 Astronomer unfolds keeper's DIAGRAM of lights connected across communities, some links visibly crossed out, symbols only. 7 Daylight signaling practice, scarlet traveler holds hooded signal lamp at workshop window aimed toward distant village; Mira compares small pictogram guide. 8 Astronomer makes TELEPHONE call at desk while looking at clock and incorrect timetable represented with simple clock faces, not words. 9 Dusk, several distant village lights shine steadily across moors while friends compare map with ONE steady golden star. 10 Departure morning, astronomer hands SEALED ENVELOPE to scarlet traveler outside cottage, Edinburgh castle sketched on envelope instead of writing, satchels ready. No inaccessible dangerous adventure inside damaged observatory.
```

## 圖集 08 — Edinburgh

```text
MEDIUM: distinctly painted watercolor picture-book art with fine ink outlines and soft paper texture, NOT photograph/3D. Exactly regular full-bleed5x2 grid with no white separator lines. REGION EDINBURGH, castle above Old Town closes and bookshops; most scenes in intimate bookbinding workshop with castle visible through window. Traveler male adult brown short hair/stubble SCARLET coat TAN wide-brim hat. Iona curly-haired dark-skinned adult woman indigo coat lantern; Rowan older silver-haired librarian brown tweed waistcoat; Elspeth mature woman with silver-streaked dark bob GREY coat with silver buttons. Female bookbinder braided auburn hair green apron. No fox anywhere. TOP ROW: 1 Bookbinder examines worn green atlas damaged SPINE at broad worktable, loose thread and binding tools. 2 Grey-coated Elspeth enters with TRAY OF TEA, one silver button missing from her coat, friends recognize her with surprise. 3 Close view Iona sets recovered SILVER BUTTON on table between herself and grey-coated Elspeth, calm faces. 4 Elspeth explains journey while holding opened atlas with blank areas, others listen in warm window light. 5 Rowan enters workshop carrying thick bundle of COPIED LETTERS, Elspeth looks regretful. BOTTOM ROW: 6 Rowan and Elspeth sit face-to-face offering sincere mutual apology, open hands and compassionate expressions, atlas between. 7 Bookbinder lifts ONE LOOSE PAGE showing Highland settlement surrounded by empty area, loose threads apparent. 8 Wide workshop: Rowan sorts records at left, bookbinder carefully SEWS spine at centre, Elspeth plans northward journey with travelers at right; all INSIDE single cell. 9 Overhead map on table surrounded by MANY DIFFERENT HANDS reviewing it together, diverse sleeves, pencils. 10 Storm clouds beyond Edinburgh castle window; travelers receive warning envelope, map Highland page lifts gently in unseen wind, preparation mood. No legible lettering.
```

## 圖集 09 — Highlands

```text
MEDIUM: true painted watercolor and coloured-ink storybook, paper grain, drawn outlined simplified faces, NOT photograph/3D. Exact full-bleed5x2 layout no grid lines. REGION SCOTTISH HIGHLANDS, heather valleys, stone village hall under dramatic mountain skies. Male adult traveler SCARLET coat TAN wide-brim hat, Mira black-haired adult woman teal coat ochre scarf, Iona curly-haired dark-skinned adult woman indigo coat, Elspeth mature woman grey coat silver-streaked dark bob. Local coordinator middle-aged woman red knit sweater, radio operator adult man with headphones. NO fox except drawn on paper in cell3. TOP ROW: 1 Clear mountain morning visible through hall window, local coordinator shows emergency PLAN on table with radio and checklists, visitors listen. 2 Safe indoor closeup checking communication equipment wires, technician points to damaged CONNECTOR, mountain paths visible outside. 3 Mira reads letter from home beside hearth, enclosed CHILD'S DRAWING of orange fox and cottage placed prominently on table, fox exists ONLY AS DRAWING. 4 Dark wind and driving rain OUTSIDE glass, everyone remains sheltered INSIDE hall, Iona carefully records radio messages beside lantern. 5 Elspeth calmly gestures for pause beside radio while operator requests repeat, incomplete note and pencil foreground. BOTTOM ROW: 6 Operator smiles after clear reply, Mira passes confirmed supply list to coordinator beside neatly packed blankets and food crates. 7 View from INSIDE warm hall window across dark valley, distant approved SIGNAL LIGHT visible, Iona records test while radio operator confirms nearby. 8 Long night communal meal: neighbours share soup, check pictorial lists, tired workers rest safely on bench with blankets, gentle kindness. 9 Bright dawn AFTER storm, residents safely inspect minor damaged fence outside; travelers update community map in foreground with verified notes. 10 Close-up repaired atlas: Highland page now firmly bound, next page has EMPTY outline of original village, blue door visible as small pictogram; traveler wonders thoughtfully. Never depict a risky lone rescue or walking outdoors in active storm.
```

## 圖集 10 — Homeward

```text
MEDIUM: British watercolor picture book with coloured-ink contours, paper texture, soft natural pigment, no photograph/3D. Exact touching full-bleed5columns2rows, no separators. REGION HOMEWARD RETURN TO COTSWOLDS, familiar honey-stone cottages, BLUE door, roses and gardens. Traveler male adult brown stubble SCARLET coat TAN wide-brim hat; Mira adult dark-haired woman teal coat ochre scarf; Iona dark-skinned curly-haired woman indigo coat lantern; Ada young girl mustard cardigan; old white-haired man brown waistcoat. TOP ROW: 1 Familiar lane and RED postbox, older neighbour with WALKING AID faces one narrow difficult stone step; returning traveler notices barrier respectfully. 2 Three village friends share collected letters with older neighbour by her doorstep, travelers listen to her explanation of weekly help. 3 Old man recognizes and receives RED ENVELOPE from scarlet traveler beside BLUE cottage door, orange fox reappears in garden. 4 Ada helps adults create a clear invitation at kitchen table, paper uses friendly pictograms instead of text, pencils and green atlas. 5 Village gathering under garden canopy, diverse residents review map and offer corrections while traveler revises carefully. BOTTOM ROW: 6 Hands distribute neatly BOUND GREEN ATLAS COPIES from open parcel to representatives of communities in cottage hall. 7 Mira and Iona add practical pictorial information to atlas, telephone and compass nearby, open window suggests changing weather. 8 Ada PAINTS small fox illustration for final atlas page while actual orange fox watches quietly near garden bushes, no mark revealing hidden den. 9 Still life on familiar old table: BRASS COMPASS, repaired GREEN BOOK, and Iona's BRASS LANTERN together, warm evening light, friends softly in background. 10 Finale: BLUE DOOR opens wide, traveler Mira and Iona welcome a new adult visitor, sunset and orange fox beside doorway, repaired atlas in hand, hopeful open ending. Exactly ten distinct visual moments, no lettering.
```
