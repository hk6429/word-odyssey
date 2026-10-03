// Regional vignettes, shared by the small quests within each story region.
const rows = [
 ['Cottage Breakfast|小屋早餐','The Fox’s Letter|狐狸的來信','Across the Bridge|走過石橋','A Growing Garden|花園裡的生機','The Field Gate|田野的門','Under the Apple Tree|蘋果樹下','A Ticket to Leave|出發的車票','Rain and Tea|雨聲與茶香','The Evening Path|暮色小徑'],
 ['Library Stairs|書庫階梯','Notes in the Margin|書頁間的筆記','Through the Arch|穿過拱門','A Quiet Punt|撐船時光','Beneath the Willow|柳樹下的書','A Lantern and a Key|提燈與鑰匙','The Clock at Dusk|黃昏鐘聲','Rain in the Cloister|迴廊聽雨','Tea with a Friend|與朋友喝茶'],
 ['The Red Bus|紅色巴士','Across the Thames|橫越泰晤士河','A Bookstall Discovery|書攤的新發現','Platform Meeting|月臺相逢','The Post Office|郵局的一封信','River and Clock|河畔的鐘','Market Baskets|市集的籃子','Below the City|走入地底','Above the Rooftops|屋頂上的星光'],
 ['The College Bridge|學院之橋','A River Journey|河上的旅程','Looking at Stars|仰望星空','A Reader’s Note|讀者的筆記','Orchard Conversation|果園裡的談話','A Candlelit Map|燭光下的地圖','Mending the Clock|修好一座鐘','A Picnic Visitor|野餐的小訪客','The Night Gate|夜色中的門'],
 ['Along the City Wall|沿著城牆走','The Narrow Market|巷弄市集','Colours in the Glass|玻璃裡的色彩','The Old Door|那扇舊門','A Fox in the Alley|小巷裡的狐狸','A Pair of Boots|一雙走遠路的鞋','The Misty Bridge|霧中的橋','Supper by the Fire|爐火邊的晚餐','The Morning Bell|清晨的鐘聲'],
 ['A Boat on the Lake|湖上的小船','The Green Trail|綠色山徑','Sheep by the Barn|穀倉旁的羊','A Shelter from Rain|躲一場雨','Beside the Waterfall|瀑布旁的橋','Reading the Contours|讀懂等高線','Firelight by the Lake|湖畔營火','After the Storm|風雨過後','The First Sunlight|第一道晨光'],
 ['The Limestone Valley|石灰岩山谷','A Footbridge Crossing|越過小石橋','The Old Mill Map|磨坊裡的地圖','A Letter in the Ruins|遺跡裡的信','The Country Inn|鄉間旅店','A Raven’s Sign|渡鴉的路標','Light in the Cave|洞穴裡的光','Reaching the Ridge|走上稜線','Sunrise on the Moor|荒原日出'],
 ['The Castle Street|城堡下的街道','A Bookshop Secret|舊書店的祕密','The Stone Archway|石造拱廊','Music in the Market|市集裡的樂聲','The Star Clock|星辰之鐘','The Observatory|山丘上的天文臺','Coffee by Candlelight|燭光咖啡','A Storm over the Castle|城堡上的風暴','Moonlit Rooftops|月下的屋頂'],
 ['The Castle by the Loch|湖畔古堡','Across the Heather|走過石楠花地','A Stag in the Forest|林間的鹿','The Stone Cairn|石堆路標','Across the Ruined Bridge|跨越斷橋','Campfire Companions|營火夥伴','The Waterfall Mist|瀑布的霧','A Light in the Snow|雪地裡的提燈','Lights above the Lake|湖上的極光'],
 ['The Train Home|歸鄉列車','The Blue Door|重見藍色的門','A Letter Delivered|終於送達的信','The Shared Garden|大家的花園','An Atlas Opens|翻開地圖集','Around the Tea Table|圍坐茶桌','A Light in the Window|窗裡的燈','Maps for Tomorrow|畫給明天的地圖','An Open Path|一條開放的小徑'],
];
export const microquestScenes=rows.map(region=>region.map(label=>{const[en,zh]=label.split('|');return{en,zh};}));
