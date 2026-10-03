#!/usr/bin/env python3
"""Build the local 7,000-target curriculum from pinned, checked-in source extracts.

Run: uvx --from opencc-python-reimplemented==0.1.7 python scripts/build-vocabulary.py
No network requests are made by this script. OpenCC is a build-time dependency only.
"""

from collections import Counter
from hashlib import sha256
from pathlib import Path
import json
import re
import subprocess

from opencc import OpenCC

ROOT = Path(__file__).resolve().parents[1]
CONVERTER = OpenCC("s2twp")
HAN = re.compile(r"[\u3400-\u9fff]")
POS_NAMES = {
    "n": "名詞", "a": "形容詞", "adj": "形容詞", "ad": "副詞", "adv": "副詞",
    "v": "動詞", "vi": "動詞", "vt": "動詞", "vb": "動詞", "vbl": "動詞",
    "pron": "代名詞", "prep": "介系詞", "conj": "連接詞", "art": "冠詞",
    "int": "感嘆詞", "interj": "感嘆詞", "num": "數詞", "aux": "助動詞",
    "abbr": "縮寫", "det": "限定詞", "modal": "助動詞",
}

# Explicitly reviewed exceptions: missing phrases, ambiguous casing, local usage,
# and definitions whose common classroom sense is obscured in the dictionary.
# Values are (Taiwan Traditional Chinese meaning, part of speech, optional display).
OVERRIDES = {
    "a": ("一個；一種", "冠詞"),
    "a few": ("幾個；一些", "限定詞"),
    "a little": ("一點；少量", "限定詞／副詞"),
    "a lot": ("很多；非常", "片語"),
    "a.m.": ("上午", "副詞"),
    "air conditioner": ("冷氣機", "名詞"),
    "america": ("美國；美洲", "專有名詞", "America"),
    "american": ("美國人；美國的", "名詞／形容詞", "American"),
    "april": ("四月", "名詞", "April"),
    "august": ("八月；莊嚴的", "名詞／形容詞", "August"),
    "baby sitter": ("臨時保母", "名詞"),
    "café": ("咖啡館", "名詞"),
    "celsius": ("攝氏的", "形容詞", "Celsius"),
    "china": ("中國；瓷器", "名詞", "China"),
    "chinese": ("中文；華人的", "名詞／形容詞", "Chinese"),
    "christmas": ("耶誕節", "名詞", "Christmas"),
    "contact lens": ("隱形眼鏡", "名詞"),
    "convenience store": ("便利商店", "名詞"),
    "credit card": ("信用卡", "名詞"),
    "december": ("十二月", "名詞", "December"),
    "department store": ("百貨公司", "名詞"),
    "dining room": ("飯廳", "名詞"),
    "dodge ball": ("躲避球", "名詞"),
    "easter": ("復活節", "名詞", "Easter"),
    "e-mail": ("電子郵件；寄電子郵件", "名詞／動詞"),
    "elementary school": ("國小", "名詞"),
    "english": ("英語；英國的", "名詞／形容詞", "English"),
    "fahrenheit": ("華氏的", "形容詞", "Fahrenheit"),
    "february": ("二月", "名詞", "February"),
    "fiancé": ("未婚夫", "名詞"),
    "flat tire": ("沒氣的輪胎；爆胎", "名詞"),
    "friday": ("星期五", "名詞", "Friday"),
    "good-bye": ("再見", "感嘆詞"),
    "hair dresser": ("美髮師", "名詞"),
    "halloween": ("萬聖節", "名詞", "Halloween"),
    "hard-working": ("勤奮的", "形容詞"),
    "hot dog": ("熱狗", "名詞"),
    "i": ("我", "代名詞", "I"),
    "ice cream": ("冰淇淋", "名詞"),
    "internet": ("網際網路", "名詞", "Internet"),
    "january": ("一月", "名詞", "January"),
    "july": ("七月", "名詞", "July"),
    "june": ("六月", "名詞", "June"),
    "junior high school": ("國中", "名詞"),
    "living room": ("客廳", "名詞"),
    "ma'am": ("女士；夫人", "名詞"),
    "march": ("三月；行軍", "名詞／動詞", "March"),
    "may": ("可能；五月", "助動詞／名詞"),
    "men's room": ("男廁", "名詞"),
    "miss": ("想念；錯過", "動詞"),
    "monday": ("星期一", "名詞", "Monday"),
    "mr.": ("先生", "名詞", "Mr."),
    "mrs.": ("太太；夫人", "名詞", "Mrs."),
    "mrt": ("捷運", "名詞", "MRT"),
    "ms.": ("女士", "名詞", "Ms."),
    "nice-looking": ("好看的", "形容詞"),
    "november": ("十一月", "名詞", "November"),
    "o'clock": ("……點鐘", "副詞"),
    "o’clock": ("……點鐘", "副詞"),
    "o.k.": ("好的；可以", "形容詞／感嘆詞", "O.K."),
    "ok": ("好的；可以", "形容詞／感嘆詞", "OK"),
    "october": ("十月", "名詞", "October"),
    "over-weight": ("過重的", "形容詞"),
    "p.m.": ("下午；晚上", "副詞"),
    "parking lot": ("停車場", "名詞"),
    "pe": ("體育", "名詞", "PE"),
    "pop music": ("流行音樂", "名詞"),
    "post office": ("郵局", "名詞"),
    "r.o.c.": ("中華民國", "專有名詞", "R.O.C."),
    "roller skate": ("輪式溜冰鞋", "名詞"),
    "saturday": ("星期六", "名詞", "Saturday"),
    "senior high school": ("高中", "名詞"),
    "september": ("九月", "名詞", "September"),
    "soft drink": ("汽水；不含酒精的飲料", "名詞"),
    "soy-sauce": ("醬油", "名詞"),
    "sunday": ("星期日", "名詞", "Sunday"),
    "t-shirt": ("T恤", "名詞", "T-shirt"),
    "table tennis": ("桌球", "名詞"),
    "taiwan": ("臺灣", "專有名詞", "Taiwan"),
    "thursday": ("星期四", "名詞", "Thursday"),
    "tuesday": ("星期二", "名詞", "Tuesday"),
    "u.s.a.": ("美國", "專有名詞", "U.S.A."),
    "wednesday": ("星期三", "名詞", "Wednesday"),
    "women's room": ("女廁", "名詞"),
    "am": ("是（與 I 搭配）", "動詞"),
    "are": ("是（與 you、we、they 搭配）", "動詞"),
    "be": ("是；存在", "動詞"),
    "is": ("是（第三人稱單數）", "動詞"),
    "it": ("它；這件事", "代名詞"),
    "will": ("將會；意志", "助動詞／名詞"),
    "would": ("將會；願意", "助動詞"),
    "should": ("應該", "助動詞"),
    "must": ("必須；一定", "助動詞"),
    "can": ("能夠；罐子", "助動詞／名詞"),
    "could": ("能夠；可能", "助動詞"),
    "might": ("可能；力量", "助動詞／名詞"),
    "shall": ("將會；要不要", "助動詞"),
    "had": ("有；吃（have 的過去式）", "動詞"),
    "does": ("做（do 的第三人稱單數）", "動詞"),
    "did": ("做（do 的過去式）", "動詞"),
    "been": ("是；曾經（be 的過去分詞）", "動詞"),
    "was": ("是（be 的過去式單數）", "動詞"),
    "were": ("是（be 的過去式）", "動詞"),
    "the": ("這個；那個", "冠詞"),
    "of": ("……的", "介系詞"),
    "to": ("到；向", "介系詞"),
    "for": ("為了；給", "介系詞"),
    "and": ("和；而且", "連接詞"),
    "or": ("或者；否則", "連接詞"),
    "but": ("但是；除了", "連接詞／介系詞"),
    "as": ("如同；當……時", "連接詞／介系詞"),
    "at": ("在；於", "介系詞"),
    "in": ("在……裡；在……期間", "介系詞"),
    "on": ("在……上；關於", "介系詞"),
    "by": ("藉由；在……旁邊", "介系詞"),
    "with": ("和；帶著", "介系詞"),
    "you": ("你；你們", "代名詞"),
    "he": ("他", "代名詞"),
    "she": ("她", "代名詞"),
    "they": ("他們；她們", "代名詞"),
    "we": ("我們", "代名詞"),
    "your": ("你的；你們的", "所有格"),
    "his": ("他的", "所有格"),
    "her": ("她；她的", "代名詞／所有格"),
    "their": ("他們的；她們的", "所有格"),
    "our": ("我們的", "所有格"),
    "my": ("我的", "所有格"),
    "its": ("它的", "所有格"),
    "me": ("我（受詞）", "代名詞"),
    "him": ("他（受詞）", "代名詞"),
    "them": ("他們；她們（受詞）", "代名詞"),
    "us": ("我們（受詞）", "代名詞"),
    "not": ("不；沒有", "副詞"),
    "no": ("不；沒有", "限定詞／副詞"),
    "yes": ("是；好", "副詞"),
    "there": ("那裡", "副詞"),
    "here": ("這裡", "副詞"),
    "who": ("誰", "代名詞"),
    "what": ("什麼", "代名詞"),
    "where": ("哪裡", "副詞"),
    "when": ("何時；當……時", "副詞／連接詞"),
    "why": ("為什麼", "副詞"),
    "how": ("如何；多麼", "副詞"),
    "which": ("哪一個", "代名詞"),
    "that": ("那個", "代名詞／連接詞"),
    "this": ("這個", "代名詞"),
    "these": ("這些", "代名詞"),
    "those": ("那些", "代名詞"),
    "amateur": ("業餘愛好者；業餘的", "名詞／形容詞"),
    "tissue": ("面紙；組織", "名詞"),
    "software": ("軟體", "名詞"),
    "hardware": ("硬體；五金", "名詞"),
    "video": ("影片；錄影", "名詞"),
    "network": ("網路；人際網絡", "名詞"),
    "information": ("資訊；消息", "名詞"),
    "quality": ("品質；特質", "名詞"),
    "subway": ("地下鐵", "名詞"),
    "taxi": ("計程車", "名詞"),
    "potato": ("馬鈴薯", "名詞"),
    "tomato": ("番茄", "名詞"),
    "bicycle": ("腳踏車", "名詞"),
    "bus": ("公車", "名詞"),
    "cellphone": ("手機", "名詞"),
    "kindergarten": ("幼兒園", "名詞"),
    "project": ("計畫；專案", "名詞"),
    "program": ("節目；程式", "名詞"),
    "application": ("申請；應用", "名詞"),
    "mouse": ("老鼠；滑鼠", "名詞"),
    "printer": ("印表機", "名詞"),
    "refrigerator": ("冰箱", "名詞"),
    "yogurt": ("優格", "名詞"),
    "socks": ("襪子", "名詞"),
    "trousers": ("長褲", "名詞"),
    "data": ("資料；數據", "名詞"),
    "riches": ("財富", "名詞"),
    "scissors": ("剪刀", "名詞"),
    "bacteria": ("細菌", "名詞"),
    "agenda": ("議程；待辦事項", "名詞"),
    "mango": ("芒果", "名詞"),
    "oxygen": ("氧", "名詞"),
    "hydrogen": ("氫", "名詞"),
    "calcium": ("鈣", "名詞"),
    "aluminum": ("鋁", "名詞"),
    "nitrogen": ("氮", "名詞"),
    "sodium": ("鈉", "名詞"),
    "investment": ("投資；投入", "名詞"),
    "management": ("管理；經營", "名詞"),
    "statement": ("陳述；聲明", "名詞"),
    "generally": ("通常；普遍地", "副詞"),
    "immediately": ("立刻；馬上", "副詞"),
    "mum": ("媽媽", "名詞"),
    "slightly": ("稍微；略微", "副詞"),
    "normally": ("通常；正常地", "副詞"),
    "apparently": ("似乎；顯然", "副詞"),
    "somebody": ("某人", "代名詞"),
    "previously": ("先前；以前", "副詞"),
    "surely": ("當然；一定", "副詞"),
    "module": ("模組；單元", "名詞"),
    "plane": ("飛機；平面", "名詞"),
    "illness": ("疾病；生病", "名詞"),
    "respectively": ("分別地；各自地", "副詞"),
    "turnover": ("營業額；人員流動率", "名詞"),
    "newly": ("新近；最近", "副詞"),
    "mummy": ("木乃伊；媽媽", "名詞"),
    "maker": ("製造者；創作者", "名詞"),
    "interface": ("介面；交界面", "名詞"),
    "processor": ("處理器；加工業者", "名詞"),
    "typically": ("通常；典型地", "副詞"),
    "allegation": ("指控；未經證實的說法", "名詞"),
    "whereby": ("藉此；憑藉……", "關係副詞"),
    "leaflet": ("傳單；小葉", "名詞"),
    "pensioner": ("領取退休金的人", "名詞"),
    "builder": ("建築商；建造者", "名詞"),
    "whisky": ("威士忌", "名詞"),
    "probability": ("機率；可能性", "名詞"),
    "sooner": ("更早；較快", "副詞"),
    "envisage": ("想像；設想", "動詞"),
    "coup": ("政變；出色之舉", "名詞"),
    "neighbourhood": ("鄰近地區；街坊", "名詞"),
    "cab": ("計程車；駕駛室", "名詞"),
    "alternatively": ("或者；作為另一種選擇", "副詞"),
    "parameter": ("參數", "名詞"),
    "matrix": ("矩陣；基體", "名詞"),
    "commence": ("開始", "動詞"),
    "empirical": ("根據經驗的；實證的", "形容詞"),
    "reportedly": ("據報導", "副詞"),
    "embarrassment": ("尷尬；難為情", "名詞"),
    "irrelevant": ("無關的；不相干的", "形容詞"),
    "protocol": ("協定；禮儀", "名詞"),
    "retailer": ("零售商", "名詞"),
    "inheritance": ("遺產；繼承", "名詞"),
    "headmaster": ("校長", "名詞"),
    "configuration": ("配置；組態", "名詞"),
    "ace": ("王牌；高手", "名詞"),
    "reactor": ("反應爐；反應器", "名詞"),
    "queue": ("排隊；佇列", "動詞／名詞"),
    "integral": ("不可或缺的；積分", "形容詞／名詞"),
    "documentation": ("說明文件；文件紀錄", "名詞"),
    "locomotive": ("火車頭", "名詞"),
    "referral": ("轉介；推薦", "名詞"),
    "enzyme": ("酵素", "名詞"),
    "incidentally": ("順帶一提；偶然地", "副詞"),
    "cassette": ("卡式錄音帶", "名詞"),
    "terminate": ("終止；結束", "動詞"),
    "bankruptcy": ("破產", "名詞"),
    "evolutionary": ("演化的；逐步發展的", "形容詞"),
    "nicely": ("妥善地；令人滿意地", "副詞"),
    "consistency": ("一致性；濃稠度", "名詞"),
    "treasurer": ("財務主管；司庫", "名詞"),
    "disco": ("迪斯可舞廳；迪斯可音樂", "名詞"),
    "mandatory": ("強制的；法定的", "形容詞"),
    "vegetation": ("植被；植物", "名詞"),
    "secular": ("世俗的；非宗教的", "形容詞"),
    "bourgeois": ("中產階級的；中產階級人士", "形容詞／名詞"),
    "substantive": ("實質的；重要的", "形容詞"),
    "whichever": ("無論哪一個", "代名詞"),
    "predictable": ("可預測的", "形容詞"),
    "cafe": ("咖啡館", "名詞"),
    "monastery": ("修道院", "名詞"),
    "advert": ("廣告", "名詞"),
    "compartment": ("隔間；車廂", "名詞"),
    "boiler": ("鍋爐", "名詞"),
    "patronage": ("贊助；光顧", "名詞"),
    "consultancy": ("顧問服務；顧問公司", "名詞"),
    "interactive": ("互動的", "形容詞"),
    "gig": ("現場演出；臨時工作", "名詞"),
    "obsession": ("著迷；執念", "名詞"),
    "supportive": ("支持的；給予鼓勵的", "形容詞"),
    "excursion": ("短途旅行；遠足", "名詞"),
    "cloak": ("斗篷；遮掩", "名詞／動詞"),
    "contraction": ("收縮；縮寫形式", "名詞"),
    "pragmatic": ("務實的", "形容詞"),
    "syllabus": ("課程綱要", "名詞"),
    "paddy": ("稻田；稻穀", "名詞"),
    "postgraduate": ("研究生；研究所階段的", "名詞／形容詞"),
    "aerospace": ("航太；航太的", "名詞／形容詞"),
    "header": ("頁首；標頭", "名詞"),
    "famine": ("饑荒", "名詞"),
    "fairness": ("公平；公正", "名詞"),
    "demise": ("死亡；終止", "名詞"),
    "starter": ("初學者；前菜", "名詞"),
    "tractor": ("曳引機；拖拉機", "名詞"),
    "irregular": ("不規則的；不定期的", "形容詞"),
    "lavatory": ("廁所；洗手間", "名詞"),
    "shy": ("害羞的；怕生的", "形容詞"),
    "sharp": ("尖銳的；敏銳的", "形容詞"),
    "nobody": ("沒有人", "代名詞"),
    "common": ("常見的；共同的", "形容詞"),
    "husband": ("丈夫", "名詞"),
    "item": ("項目；物品", "名詞"),
    "planet": ("行星", "名詞"),
    "bee": ("蜜蜂", "名詞"),
    "comb": ("梳子；梳理", "名詞／動詞"),
    "butter": ("奶油", "名詞"),
    "pass": ("經過；通過", "動詞"),
    "restroom": ("洗手間；廁所", "名詞"),
    "canteen": ("員工餐廳；水壺", "名詞"),
    "contingency": ("可能發生的事；意外狀況", "名詞"),
    "pm": ("下午；晚上", "副詞"),
    "mine": ("我的；礦坑", "代名詞／名詞"),
    "lot": ("許多；一批", "名詞"),
    "industry": ("工業；產業", "名詞"),
    "figure": ("數字；人像", "名詞"),
    "seem": ("似乎；好像", "動詞"),
    "stereo": ("立體聲；音響", "名詞"),
    "stereotype": ("刻板印象", "名詞"),
    "physicist": ("物理學家", "名詞"),
    "pasta": ("義大利麵", "名詞"),
    "alcoholic": ("含酒精的；酗酒者", "形容詞／名詞"),
    "mankind": ("人類", "名詞"),
    "bacon": ("培根", "名詞"),
    "lotion": ("乳液；洗劑", "名詞"),
    "syrup": ("糖漿", "名詞"),
    "psychiatry": ("精神醫學", "名詞"),
    "pharmacy": ("藥局；藥學", "名詞"),
    "landslide": ("山崩；土石滑動", "名詞"),
    "orphanage": ("育幼院；孤兒院", "名詞"),
    "boxer": ("拳擊手", "名詞"),
    "carefree": ("無憂無慮的", "形容詞"),
    "mow": ("割草", "動詞"),
    "telescope": ("望遠鏡", "名詞"),
    "gorilla": ("大猩猩", "名詞"),
    "settler": ("移居者；殖民者", "名詞"),
    "online": ("線上的", "形容詞"),
    "email": ("電子郵件", "名詞"),
    "sports": ("運動", "名詞"),
}

# Only supplementary entries are filtered. All official headwords remain present.
SUPPLEMENT_EXCLUDED = set("""
fuck fucking shit bullshit bastard bitch cunt cock dick asshole arse arsehole
piss wank wanker shag slut whore prostitute prostitution pornography porn
pornographic sexual sexuality intercourse orgasm masturbation homosexual
homosexuality heterosexual lesbian gay vagina penis sperm semen ejaculation
erection genital genitalia anal anus condom contraception contraceptive
rapist rape incest erotic erotica nude nudity naked fetish blowjob
mr mrs ms sir madam ltd inc plc co corp etc eg ie aka cf vs am pm
ibid op cit viz re dis viz vol tel fax pp ps cc dna rna hiv aids
gonna wanna gotta ain dont doesnt isnt wasnt werent wouldnt shouldnt couldnt
damn jerk gypsy ref raf min pro rev peter harry mike bob norman ford
aye thou thy quid loch exchequer par gothic catholic bible
""".split())
DISALLOWED_DEFINITION = re.compile(
    r"粗俗|髒話|淫|性交|交媾|陰莖|陰道|精液|手淫|妓女|色情|肛交|屌|他媽|婊|睪丸|性愛"
)
LOCAL_REPLACEMENTS = {
    "出租車": "計程車", "自行車": "腳踏車", "公共汽車": "公車", "公交車": "公車",
    "土豆": "馬鈴薯", "西紅柿": "番茄", "花生米": "花生", "奶酪": "起司",
    "奶油乳酪": "奶油起司", "酸奶": "優格", "計算機": "電腦", "打印機": "印表機",
    "打印": "列印", "鼠標": "滑鼠", "視頻": "影片", "音頻": "音訊", "信息": "資訊",
    "互聯網": "網際網路", "因特網": "網際網路", "網絡": "網路", "數據": "資料",
    "數碼": "數位", "默認": "預設", "文件夾": "資料夾",
    "內存": "記憶體", "硬盤": "硬碟", "屏幕": "螢幕", "軟件": "軟體", "硬件": "硬體",
    "幼兒班": "幼兒園", "學期制": "學期制", "激光": "雷射", "航天": "太空",
    "導彈": "飛彈", "宇航員": "太空人", "質量": "品質", "集裝箱": "貨櫃",
    "餐館": "餐廳", "土著": "原住民", "數學家": "數學家", "夥計": "夥伴",
    "計劃": "計畫", "粘": "黏",
}


def read_json(path):
    return json.loads((ROOT / path).read_text(encoding="utf-8"))


def localize(text):
    text = CONVERTER.convert(text)
    for old, new in LOCAL_REPLACEMENTS.items():
        text = text.replace(old, new)
    return text


def clean_meaning(raw):
    """Keep up to two short, meaningful dictionary senses without source markup."""
    raw = raw.replace("\\n", "\n")
    senses = []
    for line in raw.splitlines():
        # Domain labels and pronunciation notes are not learner-facing meanings.
        line = re.sub(r"\[[^\]]*\]|【[^】]*】|<[^>]*>", "", line)
        line = re.sub(r"^\s*(?:(?:[a-z]+)\.\s*[/,]?\s*)+", "", line)
        line = re.sub(r"\([^)]*\)|（[^）]*）", "", line)
        line = re.sub(r"^\s*[0-9①②③④⑤⑥]+[.、)]?\s*", "", line)
        for part in re.split(r"[,，;；\n]", line):
            part = localize(part).strip(" .。;；:：、=\t\"'")
            part = re.sub(r"\s+", " ", part)
            if not HAN.search(part) or len(part) > 42 or len(part) < 1:
                continue
            if re.search(r"參見|見下|同上|的複數|的過去|的變形|縮寫|abbr|pl\.", part, re.I):
                continue
            if part not in senses:
                senses.append(part)
            if len(senses) == 2:
                return "；".join(senses)
    return "；".join(senses)


def prefer_official_part_of_speech(row, official):
    """Put CEEC's first POS first, avoiding e.g. noun 'shy' before adjective shy."""
    if not official:
        return row
    primary = None
    for source in official["sourceEntries"]:
        token = re.match(r"([a-z]+)", source.get("pos", ""))
        if token:
            primary = POS_NAMES.get(token.group(1))
            break
    if primary is None:
        return row
    lines = row.get("translation", "").replace("\\n", "\n").splitlines()
    def priority(line):
        token = re.match(r"\s*([a-z]+)\.", line)
        return 0 if token and POS_NAMES.get(token.group(1)) == primary else 1
    return {**row, "translation": "\n".join(sorted(lines, key=priority))}


def part_of_speech(raw, official):
    # Use the actual definition prefix before a statistical ECDICT POS string.
    tokens = re.findall(r"(?:^|\\n|\n)\s*([a-z]+)\.", raw.get("translation", ""))
    if not tokens:
        tokens = re.findall(r"\b([a-z]+)\b", raw.get("pos", ""))
    if not tokens and official:
        for entry in official["sourceEntries"]:
            tokens.extend(re.findall(r"\b([a-z]+)\b", entry.get("pos", "")))
    names = list(dict.fromkeys(POS_NAMES[t] for t in tokens if t in POS_NAMES))
    return "／".join(names[:2]) or "詞語"


def rank(raw):
    bnc = int(raw.get("bnc", "0") or 0)
    frq = int(raw.get("frq", "0") or 0)
    return (bnc if bnc > 0 else 1000000, frq if frq > 0 else 1000000)


# Verified alternative spellings represent one target, not extra vocabulary.
# am/a.m. and pm/p.m. are both explicitly time adverbs in the CEEC source.
ALIASES = {
    "o.k.": "ok", "o’clock": "o'clock", "e-mail": "email",
    "good-bye": "goodbye", "hair dresser": "hairdresser",
    "am": "a.m.", "pm": "p.m.", "cafe": "café",
}


def english_definition(raw, pos):
    """Select one gloss matching the learner-facing primary POS when available."""
    primary = pos.split("／")[0]
    pos_codes = {"名詞": {"n"}, "專有名詞": {"n"}, "動詞": {"v"},
                 "形容詞": {"a", "s"}, "副詞": {"r"}}
    choices = []
    for line in raw.replace("\\n", "\n").splitlines():
        match = re.match(r"^\s*([nvasrk])\.?\s+(.+)", line)
        code, gloss = (match.group(1), match.group(2)) if match else ("", line.strip())
        # Parenthetical domain labels are dictionary metadata, not the definition.
        gloss = re.sub(r"^\([^)]*\)\s*", "", gloss)
        gloss = re.sub(r"\s+", " ", gloss).strip()
        if not gloss or HAN.search(gloss):
            continue
        # Keep a complete leading clause rather than cutting words mid-sentence.
        if len(gloss) > 320:
            short = re.split(r";|\s+-\s+", gloss)[0].strip()
            if len(short) <= 320:
                gloss = short
        choices.append((0 if code in pos_codes.get(primary, set()) else 1, gloss))
    if not choices:
        return ""
    matched = [gloss for priority, gloss in choices if priority == 0]
    selected = matched or [gloss for _, gloss in choices]
    return next((gloss for gloss in selected if len(gloss) <= 420), selected[0])


def main():
    raw_official = read_json("sources/official-primary-headwords.json")
    official = {}
    for item in raw_official:
        word = ALIASES.get(item["word"], item["word"])
        merged = official.setdefault(word, {"word": word, "sourceEntries": [], "officialTags": [], "aliases": []})
        merged["sourceEntries"].extend(item["sourceEntries"])
        merged["officialTags"] = sorted(set(merged["officialTags"]) | set(item["officialTags"]))
        if item["word"] != word:
            merged["aliases"].append(item["word"])
    english_overrides = read_json("scripts/english-overrides.json")
    matches_data = read_json("sources/ecdict-official-matches.json")
    matches = matches_data if isinstance(matches_data, dict) else {item["word"].lower(): item for item in matches_data}
    candidates = read_json("sources/ecdict-supplement-candidates.json")
    seed_text = (ROOT / "seed-words.js").read_text(encoding="utf-8")
    seed_list = json.loads(seed_text.split("=", 1)[1].strip().removesuffix(";"))
    seeds = {item["id"].lower(): item for item in seed_list}
    seed_order = {item["id"].lower(): index for index, item in enumerate(seed_list)}
    prepared = {}
    missing = []
    origin_counts = Counter()

    def prepare(word, row, source):
        row = prefer_official_part_of_speech(row, official.get(word))
        meaning = clean_meaning(row.get("translation", ""))
        pos = part_of_speech(row, official.get(word))
        display = word
        meaning_source = "ECDICT"
        if word in OVERRIDES:
            override = OVERRIDES[word]
            meaning, pos = override[:2]
            display = override[2] if len(override) > 2 else word
            meaning_source = "editorial"
        # A canonical spelling inherits editorial text from its merged variant.
        if word not in OVERRIDES:
            variant = next((alias for alias, canonical in ALIASES.items()
                            if canonical == word and alias in OVERRIDES), None)
            if variant:
                meaning, pos = OVERRIDES[variant][:2]
                meaning_source = "editorial"
        if word in seeds:
            meaning, pos = seeds[word]["meaning"], seeds[word]["pos"]
            meaning_source = "seed"
        if not meaning or not HAN.search(meaning):
            return None
        entry = {"id": word, "word": display, "meaning": meaning, "pos": pos,
                 "sourceTags": source, "meaningSource": meaning_source}
        aliases = sorted(alias for alias, canonical in ALIASES.items() if canonical == word)
        if aliases:
            entry["aliases"] = aliases
        definition = english_overrides.get(word) or english_definition(row.get("definition", ""), pos)
        if definition and definition.casefold().strip(" .") != word.casefold() and not HAN.search(definition):
            entry["definition"] = definition
            entry["definitionSource"] = "editorial" if word in english_overrides else "ECDICT"
        if word in seeds:
            for field in ("example", "translation"):
                if seeds[word].get(field):
                    entry[field] = seeds[word][field]
        if row.get("phonetic"):
            entry["phonetic"] = row["phonetic"]
        if word == "miss":
            entry["usageNote"] = "大寫 Miss 表示「小姐」；本詞條一併保留原詞表的大小寫來源。"
        if word in {"march", "may", "august", "china"}:
            entry["usageNote"] = "專有名詞須大寫；小寫形式另有本詞條列出的字義。"
        return entry

    for word, entry in official.items():
        prepared[word] = prepare(word, matches.get(word, {}), entry["officialTags"])
        if prepared[word] is None:
            missing.append(word)
    if missing:
        raise SystemExit("Missing usable official definitions: " + json.dumps(missing, ensure_ascii=False))

    basic = [word for word, item in official.items() if "moe1200" in item["officialTags"]]
    basic.sort(key=lambda word: (0, seed_order[word]) if word in seed_order else (1, *rank(matches.get(word, {})), word))
    first_1200 = basic[:1200]
    remaining_moe = [word for word, item in official.items()
                     if word not in set(first_1200) and any(tag.startswith("moe") for tag in item["officialTags"])]
    remaining_moe.sort(key=lambda word: (0 if "moe1200" in official[word]["officialTags"] else 1,
                                        *rank(matches.get(word, {})), word))
    second_800 = remaining_moe[:800]
    first_2000 = set(first_1200 + second_800)

    def advanced_order(word):
        tags = official[word]["officialTags"]
        levels = [int(tag.split("-")[1]) for tag in tags if tag.startswith("ceec-")]
        return (0 if any(tag.startswith("moe") for tag in tags) else 1,
                min(levels) if levels else 0, *rank(matches.get(word, {})), word)

    advanced = sorted((word for word in official if word not in first_2000), key=advanced_order)
    supplements = []
    rejected = []
    for row in sorted(candidates, key=lambda item: (*rank(item), item["word"])):
        word = row["word"].lower()
        if word in official or word in prepared or word in ALIASES:
            continue
        if word in SUPPLEMENT_EXCLUDED or not re.fullmatch(r"[a-z]{3,}", word):
            rejected.append({"word": word, "reason": "supplement exclusion list or non-lemma form"})
            continue
        item = prepare(word, row, ["supplement-ecdict"])
        if item is None or DISALLOWED_DEFINITION.search(item["meaning"]):
            rejected.append({"word": word, "reason": "no usable definition or unsuitable supplementary sense"})
            continue
        prepared[word] = item
        supplements.append(word)
        if len(supplements) == 7000 - len(official):
            break
    assert len(supplements) == 7000 - len(official), len(supplements)
    assert len(first_1200) == 1200 and len(second_800) == 800
    order = first_1200 + second_800 + advanced + supplements
    # Preserve the first chapter while teaching basic pronouns before later journeys.
    foundation = "i you he she it we they me him her us them his its our your their mine yours hers ours".split()
    head = order[:60]
    front = [word for word in foundation if word in prepared and word not in head]
    front_set = set(head + front)
    order = head + front + [word for word in order if word not in front_set]
    vocabulary = [prepared[word] for word in order]
    assert len(vocabulary) == 7000
    assert len({item["id"].casefold() for item in vocabulary}) == 7000
    assert len({item["word"].casefold() for item in vocabulary}) == 7000
    assert set(official) <= {item["id"] for item in vocabulary}
    covered = {form for item in vocabulary for form in [item["id"], *item.get("aliases", [])]}
    assert {item["word"] for item in raw_official} <= covered
    assert all(item.get("definition") and not HAN.search(item["definition"])
               and item["definition"].casefold().strip(" .") != item["id"].casefold()
               for item in vocabulary), [item["id"] for item in vocabulary if not item.get("definition")]
    assert all(0 < len(item["meaning"]) <= 100 and HAN.search(item["meaning"]) for item in vocabulary)
    assert all("\\n" not in item["meaning"] and "\n" not in item["meaning"] for item in vocabulary)
    assert all(item["sourceTags"] for item in vocabulary)
    for item in vocabulary:
        origin_counts[item["meaningSource"]] += 1
    output = "// Generated by scripts/build-vocabulary.py; source details in docs/vocabulary-notes.md.\nexport const vocabulary = " + json.dumps(vocabulary, ensure_ascii=False, indent=2) + ";\n"
    (ROOT / "vocabulary.js").write_text(output, encoding="utf-8")
    inputs = ["sources/official-primary-headwords.json", "sources/ecdict-official-matches.json",
              "sources/ecdict-supplement-candidates.json", "seed-words.js", "scripts/build-vocabulary.py", "scripts/english-overrides.json"]
    audit = {
        "schemaVersion": 1, "total": 7000, "uniqueCasefoldIds": 7000, "uniqueCasefoldWords": 7000,
        "officialUnion": len(official), "rawOfficialUnion": len(raw_official),
        "officialPrimaryHeadwordsCovered": len({item["word"] for item in raw_official} & covered),
        "canonicalAliases": ALIASES, "supplementCount": len(supplements),
        "englishDefinitionSources": dict(Counter(item["definitionSource"] for item in vocabulary)),
        "maxEnglishDefinitionLength": max(len(item["definition"]) for item in vocabulary),
        "meaningSources": dict(origin_counts),
        "exampleCount": sum(bool(item.get("example")) for item in vocabulary),
        "englishDefinitionCount": sum(bool(item.get("definition")) for item in vocabulary),
        "missingEnglishDefinitions": [item["id"] for item in vocabulary if not item.get("definition")],
        "missingDefinitions": [], "maxMeaningLength": max(len(item["meaning"]) for item in vocabulary),
        "genericPosWords": [item["id"] for item in vocabulary if item["pos"] == "詞語"],
        "milestones": {"20": 1200, "40": 2000, "100": 7000},
        "levelSizes": {"1-20": 60, "21-40": 40, "41-80": 83, "81-100": 84},
        "officialBasicCount": len(basic), "basicDeferredAfter1200": basic[1200:],
        "officialMoeTotal": len(first_1200) + len(remaining_moe),
        "moeDeferredAfter2000": remaining_moe[800:],
        "supplementWords": supplements, "supplementRejected": rejected,
        "vocabularySha256": sha256(output.encode()).hexdigest(),
        "inputSha256": {path: sha256((ROOT / path).read_bytes()).hexdigest() for path in inputs},
        "limitations": [
            "7,000 is a site-authored cumulative curriculum, not an official 7,000-word list.",
            "Verified punctuation and spelling variants are aliases of one target; raw official source headwords remain covered.",
            "The first 1,200 and 2,000 targets are curated from canonical MOE entries, not exact reproductions of the printed lists.",
            "Dictionary meanings were converted with OpenCC s2twp and selectively edited, not exhaustively teacher-reviewed.",
            "English dictionary glosses use one preferred-POS sense; POS matching does not prove full semantic alignment.",
            "Only seed entries have authored examples; missing examples are intentionally omitted.",
        ],
    }
    (ROOT / "docs/vocabulary-audit.json").write_text(json.dumps(audit, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    print(json.dumps({key: audit[key] for key in ["total", "uniqueCasefoldIds", "officialUnion", "supplementCount", "meaningSources", "exampleCount", "englishDefinitionCount", "maxMeaningLength", "genericPosWords", "basicDeferredAfter1200", "moeDeferredAfter2000"]}, ensure_ascii=False))


if __name__ == "__main__":
    main()
    subprocess.run(["node", "scripts/enrich-vocabulary.mjs"], cwd=ROOT, check=True)
    subprocess.run(["node", "scripts/build-missions.mjs"], cwd=ROOT, check=True)
