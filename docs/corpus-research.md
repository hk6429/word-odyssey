# 字彙來源查核與資料交接

查核日：2026-10-03。此文件只處理來源、抽取、計數與後續組裝契約，不表示完成 7,000 字教材品管。

## 結論

採用「臺灣課綱基礎＋大考中心高中詞表＋延伸字彙」作為自編課程。網站的 1,200、2,000、7,000 是累計學習目標；官方來源標籤另外保留。不可稱「官方精確 7,000 字」或把每個官方表名當成實際唯一主詞數。

## 官方來源與下載

1. [教育部英語文課綱，國家教育研究院愛學網官方 PDF](https://stv.naer.edu.tw/data/course_outline/pta_18518_3555074_59836.pdf)：2018 年 4 月公布，PDF 共 73 頁。附錄五位於實體 PDF 第 56–69 頁，印刷頁碼 54–67；本次抽取表一及表二（PDF 第 56–61 頁），不重複匯入後面的主題分類表三。[課綱官方下載入口](https://stv.naer.edu.tw/teaching/course_outline.jsp) 也提供 ODT 連結。保存為 `sources/moe-108-english.pdf`。
2. [大考中心《高中英文參考詞彙表》，111 學年度起適用](https://www.ceec.edu.tw/files/file_pool/1/0k213571061045122620/高中英文參考詞彙表(111學年度起適用).pdf)：2020 年 7 月出版，共 116 頁。使用字母排序部分（PDF 第 65–115 頁）抽取詞條與官方級別，另以級別排序部分（PDF 第 13–63 頁）逐條驗證。未把附錄的月份、國家等再算作六級詞條。保存為 `sources/ceec-111.pdf`。

高中表前言說明約 6,000 詞條、六級，每級約 1,000；含詞類合併、斜線異體及括號形式，因此並非 7,000 個唯一單詞。

## 實測計數與計數規則

| 集合 | 原始條目數 | 小寫主詞唯一數 |
| --- | ---: | ---: |
| 課綱「基本 1,200 字」表一 | 1,211 | 1,209 |
| 課綱「其他常用 800 字」表二 | 794 | 794 |
| 課綱表一＋表二 | 2,005 | 2,003 |
| 大考中心六級 | 6,012（每級各 1,002） | 6,003 |
| 兩份來源聯集 | — | 6,162 |

**小寫主詞**的明確規則：去除括號及其中內容，斜線只取第一個形式，去前後空白，轉成小寫。片語保持完整，算一個學習目標。這只是可重現的字串計數，不是完整詞形還原或同義詞合併。

- 大考中心的 `backward`、`capital`、`content`、`downward`、`forward`、`measure`、`medium`、`outward`、`upward` 會有主詞碰撞；每個主詞保留全部來源紀錄。
- 教育部表中 `may (might)` 與 `May`、`miss` 與 `Miss` 在小寫主詞規則下碰撞。月份、稱謂或專有名詞的中文義必須另外處理，不能只依小寫查字典後直接套入。
- 原詞表有 `airplane (plane)`、`a/an`、`a few`、`shoe (s)` 等不同形式。以 6,162 為起點若再合併 `am/a.m.` 等異體，總數會改變，必須重算延伸數量。
- 前 1,200 若由 MOE 基本表按頻率選取，是本網站的編排；剩餘基本詞需在後續課程補回，不可聲稱第 1,200 字時已全數涵蓋官方基本表。

## 已產出 JSON 與重跑方式

根目錄執行：`python3 sources/extract_official.py`。依賴本機已有的 PyMuPDF，不需 API。

| 檔案 | 欄位 / 契約 |
| --- | --- |
| `sources/ceec-111-entries.json` | 6,012 筆；`entry` 原詞條、`pos` 原詞性、`ceecLevel` 1–6、`page` 實體 PDF 頁碼（1 起算） |
| `sources/moe-108-entries.json` | 2,005 筆；`entry` 原詞條、`section` 為 `moe1200` 或 `moe800`、`letter` 字母群組 |
| `sources/official-primary-headwords.json` | 6,162 筆，`word` 唯一小寫主詞、`officialTags` 官方來源標籤陣列、`sourceEntries` 全部原始資料（含 `source`） |
| `sources/official-counts.json` | 數量、規則、PDF SHA-256、補至 7,000 所需數量 838 |

官方標籤是「來源中有收錄」；`moe1200`、`moe800` 不是本網站已通過 1,200／2,000 里程碑的證明。

抽取腳本內的聚焦驗證：6,012 條各級數量斷言、原條目不重複、無詞性錯黏到主詞、獨立抽取級別版與字母版後 Counter 完全一致、MOE 兩分表數量與字母群組一致。已檢視 PDF 首頁詞表圖片 `sources/ceec-sample.png`、`sources/moe-sample.png`；不是逐字中文詞義校訂。

## 建議 7,000 字組裝方式

1. 全部保留 6,162 個官方聯集主詞，避免重複詞條灌水。
2. 前 1,200 從 `moe1200` 的 1,209 個主詞依可用詞頻選出；中文義及英文顯示形式另行校訂。
3. 合併剩餘 MOE 基本與其他常用字，安排至累計 2,000；尚未出場的 MOE 詞後續補回。
4. 其餘 CEEC 詞依官方級別排序，同級再用詞頻安排；來源級別與網站關卡序號分開。
5. 加入 838 個互不重複、與官方聯集不重疊的延伸詞。候選只能由有來源的開放字典／詞頻資料選出，不用生成編號或重複屈折形湊數。
6. 最後斷言 `new Set(words.map(w => w.id)).size === 7000`，並以相同計數正規化確認 `word` 唯一。複習與重測不增加已學唯一字詞數。

## ECDICT 詞義與延伸候選

[ECDICT 上游專案](https://github.com/skywind3000/ECDICT) 提供 UTF-8 CSV，欄位含 `word`、`phonetic`、`definition`（英文釋義）、`translation`（中文釋義）、`pos`、`bnc`、`frq`、`exchange`；適合建立離線詞典初稿。[上游 LICENSE](https://raw.githubusercontent.com/skywind3000/ECDICT/master/LICENSE) 目前為 MIT，Copyright (c) 2025 Linwei；已保存 `sources/ECDICT-LICENSE.txt`。使用其資料須連同著作權聲明與授權文字保存。下載來源為 `https://raw.githubusercontent.com/skywind3000/ECDICT/master/ecdict.csv`。

本里程碑的候選擷取規則：完整掃描 CSV；保留官方聯集命中資料；額外候選限全小寫 3 字母以上的單字、有中文義、有正值 BNC 詞頻及 Collins 星級，且 `exchange` 沒有 `0:` 原形標記，再依 BNC 排名。這是初篩，不代表教學適切性或詞義已通過審查；不能把 BNC 排名當作官方難度級別。

候選交接檔（已完成完整下載並落盤）：

- `sources/ecdict-official-matches.json`：官方主詞查到的 ECDICT 原始紀錄。
- `sources/ecdict-supplement-candidates.json`：最多 2,000 個延伸候選，供下一個資料里程碑選取 838 個。
- 兩檔每筆包含 `word`、`phonetic`、`definition`、`translation`、`pos`、`bnc`、`frq`、`exchange`、`collins`。保留原資料，不直接在 UI 顯示。

完整 CSV 實測為 770,611 筆、65,933,428 位元組；SHA-256 為 `1a6947e04785db63613a92e14903cdae7954f7e84860b10e68e5c7cbb3f9c3cf`。官方主詞命中 6,153 筆；另選出 2,000 個延伸候選（初篩可用 5,810 個）。缺漏 9 項是 `café`、`dodge ball`、`fiancé`、`hair dresser`、`over-weight`、`o’clock`、`r.o.c.`、`soy-sauce`、`women's room`，需做拼寫對照或自訂詞義。明細存於 `sources/ecdict-extraction-metadata.json`；取得腳本為 `sources/fetch_ecdict.py`。已驗證兩份子集各自唯一，且 2,000 個候選與官方主詞交集為零。

新增全英文教材需求後，已把完整來源保存為 `sources/ecdict-full.csv`，並於 `sources/.gitignore` 忽略完整 CSV 與下載中的 `.part`。取得腳本先讀本機完整快取；無快取才下載至 `.part`，成功驗證 CSV 欄位後更名。已用禁止網路呼叫的測試重建三份 JSON，內容與磁碟完全一致，完整 CSV 雜湊也與首次取得的版本一致。

原始英文釋義涵蓋情形：6,153 個官方命中詞中 6,125 個有 `definition`、28 個為空；2,000 個延伸候選中 1,993 個有值、7 個為空。缺漏詞目分別存於 metadata 的 `matchedMissingDefinitions`、`candidateMissingDefinitions`。這是來源欄位涵蓋率，最終 7,000 詞教材的涵蓋率須由教材建置腳本另外計算；本來源里程碑未自行生成缺漏定義。

ECDICT 中文義為簡體中文原始資料，需先轉台灣繁體並校訂用語、錯誤字義及專有名詞大小寫；不能只宣稱「繁化完成」即等於中文教材驗收。詞性可能為頻率分布而非單一詞性。此來源不提供可直接視為完成的 7,000 個教學例句。

## 使用條件與邊界

- CEEC 封面明載僅供非營利目的使用，轉載需註明來源；營利用途需先取得該基金會書面同意。**不能把官方 PDF 或其整套編排資料一概標為 MIT**。程式碼授權與資料使用條件分開記錄。
- [NAER 愛學網授權說明](https://stv.naer.edu.tw/about/copyright.jsp) 區分依法不得為著作權標的之法規命令，以及其他受保護內容，並要求引用適當註明來源。本次從官方課綱抽取詞彙，保存來源與頁碼；不概括宣稱愛學網全站內容為開放授權。
- ECDICT repository 宣告 MIT，但詞義內容來自多種來源；它的上游授權宣告不等於逐條詞義正確性或完整權利鏈驗證。本案可做個人離線學習初稿，任何未來營利用途應重新核對整體資料條件。

## 本里程碑未做事項

未定稿 7,000 詞、未完成中文義全量校訂、未創作教學例句、未劃分 100 關、未修改 UI／引擎、未提交 Git。下一個資料代理依本文件及 JSON 完成選詞與內容驗證。
