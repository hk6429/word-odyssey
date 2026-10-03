# 故事插圖與敘事涵蓋範圍

- 生成方式：內建 imagegen（兩次獨立呼叫），未使用 CLI/API 回退。
- 原始圖保留於生成目錄，專案副本直接使用原圖，沒有進行像素重繪或縮放。
- 角色圖：`assets/characters.png`，1 個 PNG、3 個角色畫面，CSS `background-size: 300% 100%`。
- 場景圖：`assets/story-scenes.png`，1 個 PNG、6 個場景畫面，CSS `background-size: 300% 200%`。
- 逐章圖由另一個有界工作項目製作：`assets/chapters-01.png` 到 `chapters-10.png`，每張 5 × 2 格；完整提示與驗證見 `docs/chapter-art-prompts.md`。此文件不把未檢查的逐章圖列為完成。

## 角色圖提示
```text
Use case: illustration-story. Asset type: website adventure role-selection atlas.
Create a wide triptych image, exactly THREE EQUAL WIDTH vertical panels side by side, overall aspect ratio 3:2, each panel same height, no margins or gutters. Each panel contains one complete waist-up character portrait centered with clear recognisable face. A lyrical British storybook watercolor on warm ivory textured paper, fine ink details, restrained forest green, faded teal, ochre, terracotta red accents. Sophisticated editorial illustration for teenagers and adult readers.
LEFT: a young adult woman cartographer in moss green field coat, dark short wavy hair, holding a folded map and brass compass; rolling English country hills in background.
CENTER: a young adult East Asian male library scholar with round glasses, ochre waistcoat and cream shirt, holding a blue book; quiet old Oxford library shelves behind.
RIGHT: a young adult Black woman lantern scout with curly hair, red neck scarf and teal rain cape, holding a glowing brass lantern; misty railway and trees behind.
All characters friendly, quietly brave, distinct silhouettes. Keep head and hands well within each panel. No writing, no labels, no lettering, no typography, no logos, no borders, no watermark. Image designed for CSS cropping of the three exact equal panels.
```

原始檔：`generated_images/01a100e0-e212-7412-8fe9-d1c6555eb472/exec-5a7a3ce4-e5d1-4214-bdbb-78e489f7424a.png`

視覺檢查：三等寬角色區隔、人物臉部與道具完整；暖紙色、綠／赭黃／青色及紅色圍巾呈現一致風格，無文字與浮水印。

## 六場景圖提示
```text
Use case: illustration-story. Asset type: CSS-cropped story scene atlas for a reading adventure.
Create ONE wide illustration atlas containing exactly SIX equal rectangular scenes in a clean 3-column by 2-row grid. Overall aspect ratio 3:2. All six cells equal widths and heights, touching edge-to-edge, no gutters, no border, no text. Top left English countryside cottage with red postbox, a path and wildflowers; top middle a magical but believable Oxford library interior with oak desk, shelves and tall window; top right rainy London stone bridge over the Thames at twilight, warm lamps and umbrella. Bottom left a foggy old British railway platform with brass station clock and steam train; bottom middle a quiet Lake District lakeshore, small rowing boat, wooded hills and reflected sunrise; bottom right a mysterious Scottish castle on a hill with a softly glowing window, mist and moonlight. No foreground people.
Style: rich British storybook watercolor, delicate ink hatching, warm ivory paper grain, moss green and faded teal, soft ochre lights, restrained terracotta accents. Atmospheric, beautifully composed, inviting exploration; editorial art for teens and adults. Keep meaningful subjects within each exact grid cell so each is independently usable as a landscape illustration after CSS crop. No typography, words, numbers, logos, watermark or decorative frames.
```

原始檔：`generated_images/01a100e0-e212-7412-8fe9-d1c6555eb472/exec-6b0600fe-5183-422f-a5c6-fde017839eaf.png`

視覺檢查：上排鄉間石屋／牛津書院／倫敦雨橋，下排霧中火車站／湖岸／蘇格蘭城堡；可分格使用，沒有文字、水印、空白框線。事件卡使用此圖組，逐章閱讀則用 100 章圖組。

## 故事與閱讀契約

- 100 篇不重複的雙語故事正文、100 個不重複的章名、100 個各自取自正文的填空證據句。
- 第 1–20 關為 2–3 句短文；第 21–40 關為 4–6 句對話；第 41–100 關為 88–106 個英文單字的段落。
- 後 60 篇採「六大故事區域的共用開場＋各關獨立事件＋輪替反思與懸念」組合；不是宣稱 100 篇完全不共用句型的獨立長篇作品。
- 每篇情境字實際出現在該篇正文，後段閱讀填空取自各關獨立事件，不取重複開場。
- 此範圍是 100 篇閱讀與例句情境，並非替全部 7,000 字新增人工校訂例句，亦未宣稱教師／學生實測或達成特定 CEFR 分級。
- 選擇角色會改變事件的敘述角度；每次事件只能記錄一次選擇，之後換角色仍保留當時角色。
- 第一關第一段事件的三種選擇，在第三關有三種對應回音。
- 特質從有效選擇重建，不與字彙 XP、掌握狀態或關卡解鎖互通。
- 儲存 key 為 `word-odyssey-story-v1`；帶 `?test` 時使用 `-test` 副本。
- `setAdventure()` 驗證 snapshot；無效 snapshot 會拒絕且不變更既有狀態。所有閱讀資料 API 可在 Node 匯入，不需 DOM。

## 聚焦驗證

`node --test tests/story.test.js`：4 項測試通過，涵蓋 100 篇唯一性、長度、情境字、填空原句、英文模式不含中文字、答錯重試與揭示答案、選擇不可重複計分、第三關回音、角色快照、無效 snapshot 拒絕。

這些 DOM 字串／事件測試不等同實際瀏覽器視覺驗收。實際桌面／手機截圖與整合檢查由根代理執行。
