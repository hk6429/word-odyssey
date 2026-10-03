import { freshAdventure, validateAdventure } from './adventure-state.js';
export { validateAdventure } from './adventure-state.js';
import { speakWord, speakText, voiceLabel } from './voice.js';
/** Authored story beats, assembled into a ten-arc journey. Story choices never award vocabulary credit. */
const pair = (en, zh) => ({ en, zh });
const line = value => { const [en, zh] = value.split('|'); return pair(en.trim(), zh.trim()); };
const pick = value => typeof value === 'string' ? value : value[storyLocale];
let storyLocale = 'zh';
export const roles = [
 {id:'cartographer',name:pair('The Cartographer','地圖繪製者'),trait:pair('Notice paths others miss.','看見別人忽略的小路。'),voice:pair('You sketch the clue beside your compass.','你把線索畫在羅盤旁。'),stat:'curiosity'},
 {id:'scholar',name:pair('The Scholar','書院學者'),trait:pair('Read between the lines.','讀出字句之間的祕密。'),voice:pair('You compare the clue with your field notes.','你將線索和旅途筆記相互比對。'),stat:'curiosity'},
 {id:'scout',name:pair('The Lantern Scout','提燈探路者'),trait:pair('Bring light to uncertain places.','為未知的路帶來一點光。'),voice:pair('You lift your lantern so everyone can see.','你舉起提燈，讓每個人都看得清楚。'),stat:'courage'},
];
const arcNames = [
 'The Letter Nobody Sent|無人寄出的信','The Unfinished Atlas|未完成的地圖集','The Bell Beneath the Bridge|橋下的鐘聲','The River of Questions|提問之河','The Missing Names|消失的名字','The Other Shore|湖的另一邊','A Light Above the Clouds|雲上的光','The Keeper’s Account|守書人的證詞','The Longest Night|最漫長的夜','A Place for Every Voice|每個聲音的位置',
].map(line);
const sceneIndices=[0,1,2,4,3,4,4,5,5,0];
const early = [
 'A Red Letter|紅色信封|A red letter is on the path. A fox sits beside it. The letter has no name.|路上有一封紅色的信。一隻狐狸坐在旁邊。信上沒有名字。',
 'The Small Compass|小羅盤|Mira has a small compass. It points to a blue door. Who lives there?|米拉有一個小羅盤。它指向一扇藍色的門。誰住在裡面呢？',
 'A Friend at the Gate|門口的朋友|The fox waits at the gate. An old man opens the door. He knows about the letter.|狐狸在門口等著。一位老人打開門。他知道那封信的事。',
 'The Empty Chair|空椅子|A cup is on the table. The chair beside it is empty. Someone was here before us.|桌上放著一只杯子。旁邊的椅子空著。有人比我們更早來過。',
 'Bread for Two|兩個人的麵包|Mira shares her bread with me. We hear a bell outside. The fox runs to the garden.|米拉和我分享麵包。我們聽見外面的鐘聲。狐狸跑向花園。',
 'Under the Apple Tree|蘋果樹下|We find a box under the tree. Inside is a green book. One page is missing.|我們在樹下找到一個盒子。裡面有一本綠色的書。書少了一頁。',
 'Rain on the Roof|屋頂的雨聲|Rain falls on the roof. We keep the book dry. A light comes on across the road.|雨落在屋頂上。我們讓書保持乾燥。馬路對面亮起一盞燈。',
 'A Mark on the Map|地圖上的記號|Mira puts the book beside her map. Both have a little star. The star marks a library.|米拉把書放在地圖旁。兩者都有一顆小星星。星星標示出一座圖書館。',
 'The Morning Train|晨間列車|We buy a train ticket. The fox stays with the old man. He gives us a blue key.|我們買了一張火車票。狐狸和老人留在一起。他給我們一把藍色的鑰匙。',
 'Beyond the Village|村莊之外|Our train leaves the village. I keep the key in my bag. Someone waves from the last window.|我們的火車離開村莊。我把鑰匙放進袋子。有人從最後一扇窗向我們揮手。',
 'The Library Door|圖書館的門|The library has a blue door. Our key fits the lock. Rowan is waiting inside.|圖書館有一扇藍色的門。我們的鑰匙能開這把鎖。羅恩正在裡面等候。',
 'A Book Without Roads|沒有道路的書|Rowan opens a book of maps. There are towns but no roads. We must find the missing page.|羅恩打開一本地圖集。裡面有城鎮，卻沒有道路。我們必須找到失去的那一頁。',
 'Dust by the Window|窗邊的灰塵|The window is open. A small handprint is in the dust. It is not Rowan’s handprint.|窗戶開著。灰塵上有一個小手印。那不是羅恩的手印。',
 'The Quiet Student|安靜的學生|A girl sits behind the shelf. Her name is Ada. She has the missing page.|一個女孩坐在書架後面。她叫愛達。她拿著失去的那一頁。',
 'Ada’s Home|愛達的家|Ada points to a blank place on the map. Her home should be there. Why is it gone?|愛達指著地圖上一處空白。她的家應該就在那裡。它為什麼不見了？',
 'Words in the Margin|頁邊的字|We look at the page in the light. Small words appear at the side. They say, “Ask the river.”|我們迎著光看這張書頁。側邊浮現小小的字。上面寫著：「問河流。」',
 'Three Cups of Tea|三杯茶|Rowan makes tea for us. Ada tells us about her home. We listen before we draw.|羅恩替我們泡茶。愛達向我們說起她的家。我們先聽，再畫。',
 'The First New Road|第一條新道路|Mira draws a road to Ada’s home. The map becomes warm. A second star appears.|米拉畫出一條通往愛達家的路。地圖變暖了。第二顆星星浮現出來。',
 'A Sound from London|倫敦傳來的聲音|The star is beside a river. We hear a bell in the book. Rowan says we must go to London.|星星在河邊。我們聽見書裡傳來鐘聲。羅恩說，我們必須去倫敦。',
 'Someone Takes the Key|被拿走的鑰匙|We close the library door. Our blue key is gone. In its place is a train ticket.|我們關上圖書館的門。藍色鑰匙不見了。原來的位置留著一張火車票。',
 'A Voice in the Rain|雨中的聲音|“Is this the right bridge?” I ask. “Listen for the bell,” Mira says. Rain taps on our coats. A woman with a lantern calls to us. “You are early.”|「是這座橋嗎？」我問。「聽鐘聲，」米拉說。雨水敲著我們的外套。一位提燈的女子向我們喊話。「你們來早了。」',
 'Meet Iona|遇見艾歐娜|“I am Iona,” the woman says. “Did you take our key?” I ask. She shakes her head. “I found this instead.” She opens her hand and shows us a silver button.|「我叫艾歐娜，」女子說。「你拿走我們的鑰匙嗎？」我問。她搖搖頭。「我找到的是這個。」她張開手，讓我們看一顆銀色鈕扣。',
 'The Wrong Bell|不對的鐘聲|A bell rings above us. “Is that our signal?” Mira asks. “No,” Iona says. “The sound we need comes from below.” We look over the bridge and see a small boat.|上方傳來鐘聲。「那是我們的信號嗎？」米拉問。「不是，」艾歐娜說。「我們要找的聲音來自下面。」我們探頭望向橋下，看見一艘小船。',
 'The Boatman’s Price|船夫的代價|“How much is the trip?” I ask the boatman. “Tell me something true,” he replies. Mira says that she is afraid of deep water. He smiles and holds the boat steady. “Then we will go slowly.”|「搭船要多少錢？」我問船夫。「告訴我一件真實的事，」他回答。米拉說她害怕深水。他微笑著扶穩船。「那我們就慢慢走。」',
 'An Unusual Map|特別的地圖|“Your map has changed,” Iona says. A narrow road now crosses the river. “It was not there yesterday,” I reply. The boatman leans closer. “Perhaps you have finally heard who lives there.”|「你們的地圖變了，」艾歐娜說。一條窄路現在橫越河面。「昨天還沒有，」我回答。船夫靠近了些。「也許你們終於聽見住在那裡的人。」',
 'Tea Under the Bridge|橋下的茶|“Come in from the rain,” a shopkeeper says. Her tea stall stands under the bridge. “Why is your shop missing from the map?” Mira asks. “Nobody asked me where it was,” she replies. We write down her answer.|「進來躲雨吧，」一位店主說。她的茶攤就在橋下。「為什麼地圖上沒有你的店？」米拉問。「從來沒人問過它在哪裡，」她回答。我們記下她的答案。',
 'A Button and a Coat|鈕扣與外套|Iona puts the button on the table. “Do you know this?” she asks. The shopkeeper points across the river. “The keeper wears a coat with buttons like that.” I turn to look, but the far bank is empty.|艾歐娜把鈕扣放到桌上。「你認得這個嗎？」她問。店主指向河的對岸。「守書人的外套上有這樣的鈕扣。」我轉頭去看，但對岸空無一人。',
 'The Bell’s Message|鐘的訊息|“There is a note inside the bell,” Mira says. Iona holds the lantern while I read it. “Follow the water to a city of questions.” “Cambridge?” I ask. The boatman nods and hands us a timetable.|「鐘裡面有張紙條，」米拉說。我讀紙條時，艾歐娜舉著燈。「沿著水，前往提問之城。」「劍橋？」我問。船夫點頭，遞給我們一張時刻表。',
 'A Place on the Page|書頁上的位置|“May we add your tea stall?” I ask. The shopkeeper gives us its name. Mira marks the place on the map. “Now a stranger can find me,” the shopkeeper says. A new line shines beside the river.|「我們能把你的茶攤加上去嗎？」我問。店主告訴我們攤子的名字。米拉在地圖上標出位置。「現在陌生人也能找到我了，」店主說。河邊有一條新線亮了起來。',
 'The Passenger in Grey|灰衣乘客|“There is one seat left,” the driver says. Iona joins us on the train. A person in a grey coat sits near the window. “Is that the keeper?” I whisper. Before Mira can answer, the lights go out.|「還有一個座位，」司機說。艾歐娜和我們一起上了火車。一個穿灰色外套的人坐在窗邊。「那是守書人嗎？」我低聲問。米拉還沒回答，燈就熄了。',
 'An Empty Seat|空下來的座位|The lights return, but the seat is empty. “Look at the floor,” Iona says. Our blue key lies under the seat. “Was the keeper helping us?” I ask. Nobody answers yet.|燈亮了，座位上卻沒有人。「看地上，」艾歐娜說。我們的藍色鑰匙躺在座位下。「守書人是在幫我們嗎？」我問。暫時沒有人回答。',
 'The River Student|河邊的學生|“Do you need a boat?” a student asks. “We need an answer,” Mira says. The student laughs. “Then you are in the right city.” She tells us that her name is Nell.|「你們需要船嗎？」一位學生問。「我們需要答案，」米拉說。學生笑了。「那你們來對地方了。」她告訴我們，她叫奈兒。',
 'Which Way Is Home?|哪個方向是家？|“Where does this river go?” I ask. Nell points north. “But where do you want to go?” she asks. I look at the map and then at my friends. For the first time, I am not sure.|「這條河通往哪裡？」我問。奈兒指向北方。「但你想去哪裡？」她問。我看看地圖，又看看朋友。這是我第一次不確定答案。',
 'Two Different Stories|兩種故事|“The keeper stole the atlas,” one student says. “She saved it,” another replies. Mira asks what each student actually saw. Neither student was there. “We need a witness,” Iona says.|「守書人偷走了地圖集，」一位學生說。「她救了它，」另一位回答。米拉問他們各自親眼看見了什麼。兩人當時都不在場。「我們需要目擊者，」艾歐娜說。',
 'The Locked Boathouse|鎖上的船屋|Nell leads us to an old boathouse. “Try your key,” she says. The door opens easily. Inside, we find letters from many towns. “These people all asked to be included,” Mira whispers.|奈兒帶我們到一座舊船屋。「試試你們的鑰匙，」她說。門很容易就打開了。裡面有許多城鎮寄來的信。「這些人都要求被畫進地圖，」米拉輕聲說。',
 'A Difficult Promise|困難的承諾|“Can you add every town?” Nell asks. I begin to say yes, but stop. “We can start with the letters we have,” I reply. Mira nods. “A small promise that we keep is a useful beginning.”|「你們能加上每座城鎮嗎？」奈兒問。我正想說可以，卻停住了。「我們可以從手上的信開始，」我回答。米拉點點頭。「守住一個小承諾，就是有用的起點。」',
 'The Torn Envelope|撕裂的信封|“This letter is older than the others,” Iona says. Its envelope has been torn. We can still read one word: York. “Who sent it?” I ask. Nell finds a name on the back: Elspeth.|「這封信比其他信都舊，」艾歐娜說。信封已經撕裂。我們還能讀出一個字：約克。「誰寄的？」我問。奈兒在背面找到一個名字：艾絲佩絲。',
 'What We Know|我們知道的事|Mira makes two lists. “These are facts,” she says, pointing to the first. “And these are questions,” I add. We move the rumour about theft to the second list. The map becomes a little clearer.|米拉列出兩張清單。「這些是事實，」她指著第一張說。「這些是問題，」我補充。我們把偷竊的傳聞移到第二張。地圖變得清楚了一點。',
 'Nell’s Question|奈兒的問題|“What if the keeper does not want to be found?” Nell asks. “Then we will explain why we came,” Iona replies. I pack the letters carefully. “And listen before we judge,” I say.|「如果守書人不想被找到呢？」奈兒問。「那我們會解釋來意，」艾歐娜回答。我仔細收好信件。「也會先聽，再判斷，」我說。',
 'North with the Letters|帶著信往北走|“Take this pencil,” Nell says at the station. “There is still room for corrections.” Our train begins to move. On the oldest letter, a word slowly appears beneath York. It says: Remember.|「帶著這支鉛筆，」奈兒在車站說。「還有修改的空間。」我們的火車開始移動。在最老的那封信上，約克下方慢慢浮現一個字：記得。',
].map(row=>{const [en,zh,text,translation]=row.split('|');return {title:pair(en,zh),text,translation};});

// Later chapters combine an arc setting, an individual narrative beat, and a rotating reflection.
const longArcs = [
 {intro:line('In York, we carry the old letter through streets built from warm stone. Mira checks the map while Iona watches the gathering clouds.|在約克，我們帶著那封舊信，走過暖色石材鋪成的街道。米拉查看地圖，艾歐娜留意聚攏的雲。'),focus:['letter','map','stone'],beats:[
 'The Archive Window|檔案室的窗|An archivist lets us examine a ledger that lists the town’s households. Several names have been carefully erased, although their houses still appear in a drawing beside the list.|一位檔案管理員讓我們查看記錄住戶的名冊。幾個名字被仔細擦除，但名單旁的圖畫仍留著他們的房屋。',
 'The Baker’s Memory|麵包師的記憶|The baker remembers a family who lived beside the wall. They moved after a flood, he explains, but they never stopped calling this town their home.|麵包師記得一戶住在城牆邊的人家。他解釋，他們在洪水後搬走，卻始終把這座城當作自己的家。',
 'A Name Beneath a Name|名字底下的名字|Mira holds a thin sheet against the window. Under a recent entry, we discover the faint outline of another name. The earlier writing belongs to Elspeth, the missing keeper.|米拉把薄紙舉向窗戶。在一筆較新的紀錄下，我們發現另一個名字的淡淡輪廓。那是失蹤的守書人艾絲佩絲的舊筆跡。',
 'The Locked Drawer|鎖上的抽屜|The archivist refuses to open a private drawer. Instead of taking it by force, we explain our purpose and offer to leave out any details that could identify living residents.|管理員不願打開私人抽屜。我們沒有強行拿取，而是說明目的，並答應省略任何可能辨識現居住戶的細節。',
 'Permission to Read|閱讀的許可|With permission, we read a short account of the flood. Elspeth had asked the council to keep displaced families on the map, but her request received no reply.|取得許可後，我們讀到洪水的一段簡短紀錄。艾絲佩絲曾請議會把被迫遷居的家庭留在地圖上，她的請求卻沒有得到回覆。',
 'An Uncomfortable Detail|令人不安的細節|Rowan sends a message admitting that the library once removed uncertain information to make its atlas look tidy. He now wonders how many ordinary lives disappeared with those corrections.|羅恩傳來訊息，承認圖書館曾為了讓地圖集整齊而刪除不確定的資料。他如今想知道，有多少普通人的生活跟著那些修改一同消失。',
 'The Children’s Drawing|孩子的畫|A teacher brings a drawing made before the flood. Its crooked lines show a footbridge absent from the official record, and three former neighbours independently remember using that same crossing.|一位老師帶來洪水前的兒童畫。歪斜線條描出官方紀錄未收錄的便橋，三位以前的鄰居也分別記得曾走過那裡。',
 'Room for Uncertainty|容納不確定|We mark the lost footbridge with a dotted line and a note explaining the evidence. The archivist seems surprised that a useful map can admit what it does not know.|我們以虛線標出消失的便橋，附上證據說明。管理員似乎很驚訝：一張有用的地圖也能承認自己不知道的事。',
 'The Names Return|名字回來了|Residents gather to check the revised page. One woman corrects a spelling; another asks us to remove her address. We respect both requests before making a copy for the archive.|居民聚在一起檢查修訂後的書頁。有人更正拼字，也有人要求刪去自己的地址。我們尊重兩項要求，再替檔案室製作副本。',
 'An Address by the Lake|湖邊的地址|Inside the ledger’s cover, we find a receipt for a boat repair in the Lake District. Elspeth paid for it shortly after leaving York, and the date is surprisingly recent.|名冊封面內藏著湖區的一張修船收據。艾絲佩絲離開約克不久後付了錢，日期近得令人吃驚。',
 ]},
 {intro:line('The lake lies silver beneath a changing sky. We arrive with the repair receipt, hoping to learn why Elspeth needed a boat and where she went.|多變的天空下，湖水閃著銀光。我們帶著修船收據抵達，希望知道艾絲佩絲為何需要船，以及她去了哪裡。'),focus:['lake','boat','sky'],beats:[
 'The Silent Jetty|安靜的碼頭|A ferry operator studies our receipt and points towards a silent jetty. Service stopped months ago, she explains, yet someone has been leaving fresh flowers beside its empty ticket window.|渡船員研究收據後，指向一處安靜的碼頭。她說航線幾個月前便停了，售票窗旁卻一直有人放上新鮮的花。',
 'A Crossing on Paper|紙上的渡口|Our atlas still labels the ferry as a reliable crossing. A traveller has walked a long distance because of that promise, only to discover that no boat will come.|地圖集仍把渡船標為可靠的交通路線。一位旅人信了這項承諾，走了很遠的路，才發現根本不會有船來。',
 'The Repair Shed|修船棚|The repairer recognises Elspeth’s name. She had restored a small rowing boat for an elderly neighbour, he says, rather than preparing a dramatic escape across the water.|修船師傅認得艾絲佩絲的名字。他說她替年長鄰居修復一艘小划船，並不是為了橫渡湖面、展開戲劇性的逃亡。',
 'Waiting for Better Weather|等待好天氣|Strong wind interrupts our plans to cross. Iona puts away the lantern and suggests visiting people on this shore first; reaching an answer quickly is less useful than returning safely.|強風打亂了渡湖計畫。艾歐娜收起提燈，建議先拜訪這一岸的人；急著得到答案，不如平安回來更有用。',
 'The Neighbour’s Garden|鄰居的花園|In a sheltered garden, the neighbour tells us that Elspeth stayed for several weeks. She listened to people who had lost their usual routes when the ferry service ended.|在避風的花園裡，鄰居告訴我們艾絲佩絲住了好幾週。渡船停航後，有些人失去習慣走的路，她就一一聽他們訴說。',
 'More Than a Line|不只是一條線|Mira begins adding travel times and accessibility notes beside the alternative path. A road drawn on paper cannot explain a steep hill, she says, unless somebody describes the journey.|米拉開始在替代路線旁加上時間與無障礙資訊。她說，紙上畫出的道路不會解釋陡坡，除非有人描述走過去的經驗。',
 'The Letter in the Boat|船裡的信|When the wind settles, we find a sealed message inside the repaired boat. Elspeth asks whoever finds it to finish helping the neighbour before continuing the search for her.|風停後，我們在修好的船裡找到密封信件。艾絲佩絲請找到信的人先幫完鄰居的忙，再繼續找她。',
 'A Shared Crossing|一起渡湖|With the operator’s guidance, we arrange a community crossing on a calm morning. Each passenger checks the plan, and nobody is expected to row beyond their strength or experience.|在渡船員指導下，我們安排平靜早晨的社區渡湖行程。每位乘客都確認計畫，沒有人被要求超出體力或經驗去划船。',
 'The Other Shore|另一邊的岸|Across the water, a path leads to a closed schoolhouse. Its noticeboard carries messages from travellers, including one from Elspeth asking about an old observatory in the Peak District.|湖對面的小路通向關閉的校舍。布告欄上留著旅人的訊息，其中有艾絲佩絲詢問峰區舊天文臺的留言。',
 'A Star in Daylight|白日裡的星星|As we update the ferry information, a tiny star appears over the distant hills on our atlas. It remains visible even when Mira closes the book, shining through the cover.|更新渡船資料時，地圖集的遠山上浮現小星星。即使米拉闔上書，它仍透過封面發光，清楚可見。',
 ]},
 {intro:line('Our path climbs into the Peak District, where an old observatory stands above the villages. We follow the star while carrying the stories gathered beside the lake.|我們沿路爬上峰區，一座舊天文臺立在村莊上方。我們循著星星前進，也帶著在湖邊收集的故事。'),focus:['path','star','villages'],beats:[
 'The Closed Observatory|關閉的天文臺|At the entrance, we discover that the building has been closed because its roof is unsafe. A handwritten sign directs visitors to a temporary workshop in the village below.|入口處的公告說屋頂不安全，建築因此關閉。一張手寫告示引導訪客前往山下村莊的臨時工作室。',
 'A Different Kind of Guide|另一種嚮導|The astronomer welcomes us into a room full of lenses and notebooks. She knew Elspeth, but says the keeper was interested in people’s night journeys rather than distant planets.|天文學家在放滿鏡片與筆記的房間迎接我們。她認識艾絲佩絲，卻說守書人關心的是人們夜裡的行程，而非遙遠行星。',
 'Clouded Instruments|被雲遮住的儀器|A damaged lens makes a lamp seem to divide into two separate lights. Iona realises that several reports of mysterious signals may have come from this ordinary optical problem.|受損鏡片讓一盞燈看起來分成兩道光。艾歐娜察覺，幾起神祕信號的報告，可能都來自這個普通的光學問題。',
 'The Unmarked Shelter|未標示的避難處|A walking group describes a shelter missing from every printed guide they own. We visit during daylight, confirm its condition with the caretaker, and add the contact details they approve.|健行隊說有處避難所不在他們任何一本指南裡。我們白天去看，向管理員確認狀態，並加上經同意的聯絡資訊。',
 'An Argument About Speed|關於速度的爭論|Mira wants to continue towards Edinburgh before the weather changes. Iona argues that our incomplete notes could mislead the next traveller. We agree on the checks needed before leaving.|米拉想趁天氣變化前往愛丁堡。艾歐娜認為不完整的筆記可能誤導下一位旅人。我們共同決定出發前需要做的查核。',
 'The Keeper’s Diagram|守書人的圖解|The astronomer finds a diagram Elspeth left behind. Its lights form a network between distant communities, but several links are crossed out where nobody has agreed to maintain them.|天文學家找到艾絲佩絲留下的圖解。圖上的燈連起遠方社區，但有幾條線被劃掉，因為尚未有人答應維護。',
 'A Practice Signal|練習信號|We test a short message with the next village while it is still light. The first attempt fails because both groups use different signals; a shared written guide solves the problem.|天還亮時，我們和鄰村測試短訊息。第一次失敗了，因為雙方使用不同信號；共同書面指南解決了問題。',
 'The Missing Reply|缺少的回覆|One village does not answer our second test. Rather than assuming danger, the astronomer calls its caretaker and learns that the agreed meeting time was written incorrectly on our sheet.|第二次測試時有個村莊沒回應。天文學家沒有直接認定遇險，而是聯絡管理員，發現我們的紙上把約定時間寫錯了。',
 'A Reliable Light|可靠的光|After correcting the time, every group receives the message and repeats it back. The star on our map grows steady, as though it values a checked connection more than a brilliant flash.|更正時間後，每組都收到訊息並回覆確認。地圖上的星星變得穩定，彷彿比起耀眼閃光，它更珍惜確認過的聯繫。',
 'The Edinburgh Envelope|愛丁堡的信封|Before we leave, the astronomer gives us an envelope addressed to an Edinburgh bookbinder. On the back, Elspeth has written that the atlas cannot be repaired by one person alone.|離開前，天文學家交給我們一封寄給愛丁堡裝訂師的信。背面是艾絲佩絲的字：地圖集無法只靠一個人修好。',
 ]},
 {intro:line('In Edinburgh, the castle rises above narrow streets and crowded bookshops. The envelope leads us to a quiet workshop, where someone has been expecting our arrival.|在愛丁堡，城堡高踞窄巷與熱鬧書店之上。信封引領我們到一間安靜的工作室，有人一直等著我們到來。'),focus:['castle','envelope','workshop'],beats:[
 'The Bookbinder’s Table|裝訂師的桌子|The bookbinder examines our atlas without opening it. Its damaged spine reveals years of hurried changes, she says, and several pages have been attached with the wrong kind of thread.|裝訂師還沒打開地圖集就先查看。她說，受損書脊顯示多年來匆促修改的痕跡，有些頁面還用了不合適的線縫接。',
 'An Unexpected Guest|意外的訪客|A woman in a grey coat enters carrying a tray of tea. One silver button is missing. We finally recognise Elspeth, who looks more tired than frightening as she sets down the cups.|穿灰外套的女子端茶進來，衣服上少了一顆銀色鈕扣。我們終於認出艾絲佩絲。她放下杯子時，看起來疲憊多於可怕。',
 'Before the Accusation|指責之前|Iona places the recovered button on the table instead of demanding an explanation. Elspeth thanks her, then asks us which parts of the story we witnessed and which parts we only heard.|艾歐娜把找回的鈕扣放上桌，沒有立即要求解釋。艾絲佩絲道謝後，問我們哪些事親眼見過，哪些只是聽說。',
 'Why She Left|離開的原因|Elspeth explains that she carried the atlas away after its editors refused to include uncertain places. She hoped to repair it alone, then discovered how little she understood about each community.|艾絲佩絲說，編輯拒絕收錄不確定的地點後，她帶走了地圖集。她原以為可以獨自修好，後來才發現自己多不了解各個社區。',
 'The Cost of Silence|沉默的代價|Rowan arrives with copies of the letters from the library. Elspeth admits that leaving without an explanation hurt her colleagues and allowed rumours to grow. Her good intention did not remove that harm.|羅恩帶著圖書館的信件副本來了。艾絲佩絲承認，不告而別傷害同事，也讓傳聞滋長。良好用意並未抹去造成的傷害。',
 'Two Apologies|兩次道歉|Rowan apologises for ignoring the missing communities, and Elspeth apologises for taking the shared atlas. Neither asks the other to forget what happened; they discuss what each can now repair.|羅恩為忽略消失的社區道歉，艾絲佩絲也為拿走共有地圖集道歉。他們不要求彼此忘記，而是討論各自現在能修補什麼。',
 'The Page That Would Not Stay|留不住的書頁|The bookbinder returns one page that keeps coming loose. It shows a Highland settlement surrounded by blank space, and its margin contains an urgent request for help restoring a communication route.|裝訂師拿回一張一直脫落的書頁。頁上是被空白包圍的高地聚落，旁註急切請求人們協助恢復聯絡路線。',
 'Sharing the Work|分擔工作|We divide the remaining tasks according to experience. Rowan stays to organise records, the bookbinder repairs the spine, and Elspeth offers to guide us north after checking conditions with local residents.|我們按經驗分工。羅恩留下整理紀錄，裝訂師修補書脊；艾絲佩絲向當地居民確認狀況後，答應帶我們北上。',
 'A Map with Many Hands|許多雙手的地圖|Visitors help review the revised pages, leaving their names only when they choose. For the first time, the atlas credits more than its official editors; the blank spaces begin to look less permanent.|訪客協助審閱修訂頁面，只有自願者留下名字。地圖集首次列出正式編輯以外的貢獻者，那些空白似乎不再永遠不變。',
 'News from the North|北方消息|A message arrives warning that a storm may interrupt the Highland connection. We arrange accommodation and a local guide before travelling, while the unsettled page lifts softly as if caught by distant wind.|消息警告，暴風雨可能中斷高地聯繫。我們先安排住宿與當地嚮導才動身；那張不安定的書頁輕輕揚起，像被遠方風吹動。',
 ]},
 {intro:line('We reach the Highlands before the storm, following the advice of a local guide. Beyond the village, the mountains are beautiful, but our immediate task is communication.|依照當地嚮導的建議，我們在風暴前抵達高地。村外山景很美，但我們眼前的任務是維持聯絡。'),focus:['storm','village','guide'],beats:[
 'The Last Clear Morning|最後的晴朗早晨|The village coordinator shows us the existing emergency plan. Our proposed light signals can support it, she explains, but must never replace the established communication methods or trained local teams.|村莊聯絡人給我們看現行緊急應變計畫。她說我們提出的燈光信號可以輔助，卻不能取代既有聯絡方式或受訓團隊。',
 'Checking the Route|確認路線|We inspect the equipment from a safe indoor location while experienced residents check the nearby route. One damaged connection is identified early, giving the repair team time to arrange a replacement.|我們在安全室內檢查設備，熟悉地形的居民則確認附近路線。有人提早發現一處受損連接，讓維修隊有時間安排替換。',
 'A Message from Home|家鄉的訊息|Mira receives a letter from the old man in our first village. The fox still visits his garden, he writes, and Ada has sent a drawing of the new road to her home.|米拉收到第一座村莊老人寄來的信。他說狐狸仍會來花園，愛達也寄了一幅通往自己家門的新道路圖畫。',
 'When the Wind Rises|起風的時候|As conditions worsen, we stay inside and follow the coordinator’s instructions. Iona helps record incoming messages, discovering that patient listening can require as much courage as walking into the unknown.|天氣變差時，我們留在室內並遵照聯絡人指示。艾歐娜協助記錄訊息，發現耐心傾聽有時和走向未知一樣需要勇氣。',
 'The Incomplete Message|不完整的訊息|A broken transmission sounds alarming, but its final words are missing. Elspeth stops us from filling the gap with a guess and asks the trained operator to request a clear repeat.|一段斷續傳訊聽起來令人不安，最後幾個字卻沒收到。艾絲佩絲阻止我們用猜測補空白，請受訓操作員要求對方清楚重傳。',
 'The Meaning of the Signal|信號的意思|The repeated message confirms that the neighbouring group is safe and needs additional supplies later. We update the record and pass the exact request to the coordinator, keeping speculation out of it.|重傳訊息確認鄰組平安，稍後需要補給。我們更新紀錄，把確切要求轉交聯絡人，不混入推測。',
 'A Light in the Window|窗裡的燈|During a planned equipment test, the approved light signal appears across the valley. Iona records the successful connection, while the operator confirms receipt through the regular channel as well.|依計畫測試設備時，山谷對面出現核定的燈光信號。艾歐娜記下連接成功，操作員也透過正常管道確認收到。',
 'The Long Night’s Work|長夜裡的工作|Nobody performs a single dramatic rescue. Instead, neighbours share food, check agreed lists, and give tired workers a chance to rest. Watching them, I begin to understand the atlas differently.|沒有人獨自上演戲劇性的救援。鄰居分享食物、核對約定清單，讓疲倦工作者休息。看著他們，我開始以不同方式理解地圖集。',
 'After the Storm|風暴過後|When the coordinator announces that conditions are safe, residents inspect the area and report what needs repair. We help update the community’s own copy of the map using their verified information.|聯絡人宣布狀況安全後，居民巡視並回報維修需求。我們使用他們確認過的資料，協助更新社區自己的地圖副本。',
 'The Final Blank Space|最後一處空白|The Highland page settles firmly into the atlas at last. Then another blank space appears on its final sheet: the village where our journey began, waiting for us to look again.|高地那一頁終於牢牢留在地圖集裡。接著，最後一頁出現另一處空白：我們出發的村莊，正等著我們重新看一遍。',
 ]},
 {intro:line('On the journey home, the atlas feels heavier with stories rather than paper. We return to the village carrying a map that is useful, unfinished, and no longer ours alone.|歸途上，地圖集因故事而非紙張顯得更沉。我們帶回一張有用、未完成，也不再只屬於我們的地圖。'),focus:['village','map','home'],beats:[
 'A Familiar Road|熟悉的路|The old lane looks smaller than I remember, yet it contains details I never noticed before. Beside the postbox, a narrow step makes the entrance difficult for a neighbour using a walking aid.|舊巷比記憶裡小，卻有以前從未注意的細節。郵筒旁一級窄階，使使用助行器的鄰居難以進門。',
 'The Person We Overlooked|曾忽略的人|We ask the neighbour how she usually collects her letters. Her answer reveals a weekly arrangement kept running by three friends, a quiet network missing from every version of our map.|我們問鄰居平常怎麼收信。她的答案讓我們看見三位朋友每週維持的安排，那張安靜的互助網從未出現在任何地圖版本。',
 'Returning the Letter|歸還那封信|The old man recognises the red envelope from our first morning. He explains that Elspeth left it as an invitation for anyone willing to notice a story outside their usual route.|老人認出第一天早晨的紅色信封。他說那是艾絲佩絲留下的邀請，送給願意留意慣常路線以外故事的人。',
 'An Invitation Rewritten|重寫的邀請|We decide that a mysterious invitation is not enough for the next traveller. Ada helps us write a clear introduction explaining the project, its limits, and how a person can choose to participate.|我們認為下一位旅人需要的不只是神祕邀請。愛達協助撰寫清楚介紹，說明計畫、限制，以及每個人如何自行選擇參與。',
 'The Village Review|村莊的審閱|At a small gathering, residents read our account of their community. Some passages make them smile, while others need correction. We revise the text in front of them and keep a record of changes.|小型聚會上，居民閱讀我們寫的社區紀錄。有些段落讓人微笑，有些需要更正。我們當場修改，並留下修訂紀錄。',
 'Copies for the Road|帶上路的副本|Rowan sends carefully bound copies from the library, each with a date and a place for updates. We distribute them to the communities that contributed, asking each group how it wants to maintain its pages.|羅恩從圖書館寄來裝訂好的副本，每本都註明日期並留有更新欄位。我們送給參與社區，詢問各組想如何維護自己的頁面。',
 'What the Atlas Cannot Do|地圖集做不到的事|Mira writes a note reminding readers that conditions change and a map cannot make every decision. Iona adds contact details approved by the communities, so travellers can ask when they are uncertain.|米拉提醒讀者：狀況會變，地圖無法替人做所有決定。艾歐娜補上各社區同意的聯絡資訊，讓旅人在不確定時能詢問。',
 'A Place for the Fox|狐狸的位置|The fox returns while Ada paints a small illustration for the final page. We leave its exact hiding place unmarked, agreeing that including a story does not require exposing every private detail.|愛達替最後一頁作畫時，狐狸回來了。我們不標出牠確切藏身處，因為收錄故事不表示必須揭露每個私密細節。',
 'The Journey We Keep|留下來的旅程|We gather the compass, the repaired book, and Iona’s lantern on the old table. Each object recalls a moment when somebody changed our direction by asking a better question or offering unexpected help.|我們把羅盤、修好的書和艾歐娜的提燈放到舊桌上。每件物品都喚起某個人提出更好的問題或給予意外幫助、改變方向的時刻。',
 'A Door Left Open|留一扇開著的門|On the final page, I write an invitation to add a story with care, evidence, and permission. Then someone knocks at the blue door. This time, we open it together and begin by listening.|最後一頁，我邀請人們帶著細心、證據與許可增添故事。此時，藍色門外響起敲門聲。這一次，我們一起開門，從傾聽開始。',
 ]},
];
const reflections = [
 'I write down what we have learned, leaving space for a correction. Mira reminds me that the next person may notice something we missed.|我記下所學，也留下更正空間。米拉提醒，下一個人也許會發現我們漏看的事。',
 'For a moment, I want the answer to be simple. Iona waits beside me until I am ready to ask a more careful question.|有一瞬間，我希望答案能很簡單。艾歐娜在旁邊等著，直到我準備好問出更仔細的問題。',
 'We compare this new detail with the notes already in our bag. A connection begins to emerge, but we decide to check it before drawing conclusions.|我們將新細節和袋裡的筆記比對。關聯慢慢浮現，但我們決定先確認，再下結論。',
 'The work takes longer than we expected. Even so, a small discovery feels worth recording, especially when it changes the way we understand another person.|工作比預期更久。即便如此，小發現也值得記下，尤其當它改變我們理解別人的方式。',
 'I look again at the page that brought us here. Its meaning has shifted, although the words remain the same, and I wonder what we will notice next.|我重新看著帶我們來這裡的書頁。字句沒變，意義卻不同了；我想知道接著還會注意到什麼。',
].map(line);
const suspense = [
 'Before we leave, Mira notices a detail that none of us can yet explain.|離開前，米拉注意到一個誰也還無法解釋的細節。',
 'Somewhere beyond this place, another part of the story is waiting to be heard.|在這地方以外，故事的另一部分正等著被聽見。',
 'We turn the page carefully, unsure whose voice will meet us on the other side.|我們小心翻頁，不確定另一邊會遇見誰的聲音。',
].map(line);

function validStage(stageId) { if (!Number.isInteger(stageId) || stageId<1 || stageId>100) throw new RangeError('Stage must be an integer from 1 to 100'); return stageId; }
export function getReading(stageId) {
 validStage(stageId);
 const index=stageId-1, arcIndex=Math.floor(index/10), arc=longArcs[arcIndex-4];
 let entry;
 if(stageId<=40) entry={...early[index]};
 else {
  const [en,zh,text,translation]=arc.beats[index%10].split('|');
  const reflection=reflections[index%reflections.length],hook=suspense[index%suspense.length];
  entry={title:pair(en,zh),quizSource:text,text:[arc.intro.en,text,reflection.en,stageId===100?'The journey has given us a beginning, and there is room for another voice.':hook.en].join(' '),translation:[arc.intro.zh,translation,reflection.zh,stageId===100?'旅程給了我們一個開始，還留著容納另一個聲音的位置。':hook.zh].join('')};
 }
 const words=entry.text.match(/[A-Za-z]+(?:[’'][a-z]+)?/g)||[];
 const source=entry.quizSource||entry.text;
 const common=new Set(['their','there','these','those','which','while','where','after','before','about','because','although','rather','would','could','should','every','someone','something','elspeth','rowan','iona','mira','begins','begin','several','along','towards','finally','though','instead']);
 const candidates=stageId>40?[...new Set((source.match(/[A-Za-z]+/g)||[]).map(word=>word.toLowerCase()).filter(word=>word.length>=5&&!common.has(word)))]:['letter','fox','compass','door','key','map','book','river','boat','light','train','window','page','name','bell','home','friend','rain','hand','tea'];
 const focusWords=candidates.filter(word=>new RegExp(`\\b${word}\\b`,'i').test(entry.text)).slice(0,3);
 if(!focusWords.length) focusWords.push(words.find(word=>word.length>=4).toLowerCase());
 const answer=focusWords[0];
 const sentence=source.split(/(?<=[.!?])\s+/).find(s=>new RegExp(`\\b${answer}\\b`,'i').test(s));
 const options=[answer,...['chair','bread','garden','clock','pencil'].filter(word=>word!==answer).slice(index%3,index%3+2)];
 // Rotate the correct position without relying on render-time randomness.
 const offset=index%3; options.push(...options.splice(0,offset));
 return {...entry,id:stageId,arc:arcNames[arcIndex],sceneClass:`story-chapter story-chapter-${arcIndex+1} story-cell-${index%10}`,regionSceneClass:`story-scene-${sceneIndices[arcIndex]}`,focusWords,wordCount:words.length,format:stageId<=20?'short':stageId<=40?'dialogue':'passage',quiz:{prompt:sentence.replace(new RegExp(`\\b${answer}\\b`,'i'),'_____'),answer,options,evidence:sentence}};
}

const STORAGE_KEY='word-odyssey-story-v1'+(typeof location!=='undefined'&&new URLSearchParams(location.search).has('test')?'-test':'');

let adventure;
try { const saved=typeof window==='undefined'?null:window.localStorage.getItem(STORAGE_KEY); adventure=saved?validateAdventure(JSON.parse(saved)):freshAdventure(); } catch { adventure=freshAdventure(); }
export function getAdventure(){return structuredClone(adventure);}
let storageFailed=false;
function persist(){try{if(typeof window!=='undefined')window.localStorage.setItem(STORAGE_KEY,JSON.stringify(adventure));storageFailed=false;}catch{storageFailed=true;}}
persist();
export function setAdventure(value){const clean=validateAdventure(value);adventure=clean;persist();return getAdventure();}
export function setStoryLocale(locale){storyLocale=locale==='en'?'en':'zh';}
export function getStoryStats(value=adventure){const scores={curiosity:0,courage:0,kindness:0};for(const choice of Object.values(validateAdventure(value).choices))scores[choice.action]++;return scores;}
const labels={curiosity:pair('Curiosity','好奇'),courage:pair('Courage','勇氣'),kindness:pair('Kindness','善意')};
const esc=value=>String(value).replace(/[&<>"']/g,char=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char]));
const roleIndex=id=>Math.max(0,roles.findIndex(role=>role.id===id));
export function getStoryOpening(stageId){const r=getReading(stageId);const text=storyLocale==='en'?(r.quizSource||r.text).split(/(?<=[.!?])\s+/).slice(0,2).join(' '):r.translation.split('。').slice(stageId>40?2:0,stageId>40?4:2).join('。')+'。';return {title:pick(r.title),text,sceneClass:r.sceneClass};}
export function mountAdventure(container,onChange=()=>{}) {
 if(!container)return;
 const stats=getStoryStats();
 container.innerHTML=`<section class="adventure-cast"><div class="story-section-heading"><div><span class="story-eyebrow">THE LIVING ATLAS</span><h2>${pick(pair('Choose who you become','選擇你的冒險角色'))}</h2></div><p>${pick(pair('One mysterious letter. Three ways to meet the world.','一封神祕來信，三種與世界相遇的方式。'))}</p></div><div class="story-role-grid">${roles.map((role,index)=>`<button class="story-role ${adventure.role===role.id?'selected':''}" data-role="${role.id}" aria-pressed="${adventure.role===role.id}"><span class="story-portrait story-person-${index}" role="img" aria-label="${esc(pick(role.name))}"></span><span class="story-role-copy"><strong>${esc(pick(role.name))}</strong><small>${esc(pick(role.trait))}</small><span class="story-role-choose">${pick(adventure.role===role.id?pair('Your role ✓','你的角色 ✓'):pair('Choose this role →','選擇角色 →'))}</span></span></button>`).join('')}</div><div class="story-traits">${Object.entries(stats).map(([stat,score])=>`<span>${pick(labels[stat])}<b>${score}</b></span>`).join('')}<small>${pick(pair('Traits reflect story decisions; vocabulary progress is earned separately.','特質記錄劇情選擇；單字進度仍須完成學習與測驗。'))}</small></div>${storageFailed?`<p role="status">${pick(pair('Story progress could not be saved on this device.','此裝置暫時無法儲存故事進度。'))}</p>`:''}</section>`;
 container.querySelectorAll('[data-role]').forEach(button=>button.addEventListener('click',()=>{adventure.role=button.dataset.role;persist();mountAdventure(container,onChange);onChange(getAdventure());}));
}
const events=[
 {npc:'Mira',person:0,title:pair('A path no one has drawn','沒有人畫過的小路'),text:pair('Mira finds a narrow path beside the route. A fresh footprint leads towards it. How will you investigate?','米拉在路線旁找到一條小徑。一個新腳印朝那裡延伸。你想如何調查？')},
 {npc:'Rowan',person:1,title:pair('A note between the pages','書頁之間的字條'),text:pair('A note from Rowan describes a missing detail. It could change the next page of the atlas. Where will you begin?','羅恩的字條描述一個被遺漏的細節，可能改變地圖集的下一頁。你想從哪裡開始？')},
 {npc:'Iona',person:2,title:pair('A light beyond the window','窗外的燈光'),text:pair('Iona spots a light where the map shows an empty space. Someone may have a story to tell. What will you do?','艾歐娜在地圖空白處看見燈光。那裡或許有人想說故事。你會怎麼做？')},
];
const actions={
 curiosity:{label:pair('Examine the clue','仔細觀察線索'),result:pair('You compare the details and mark a question for your next conversation. A small pattern begins to emerge.','你比對細節，記下下次對話要問的問題。一個小小的規律開始浮現。')},
 courage:{label:pair('Ask the difficult question','勇敢提出問題'),result:pair('You admit what you do not know and ask directly. The reply changes one assumption you carried into this place.','你坦白承認不知道的事，直接提問。對方的回答改變了你來到這裡前的一項假設。')},
 kindness:{label:pair('Listen to someone’s story','先聽對方的故事'),result:pair('You make room for an overlooked voice. Your companion adds their account to the notes, with permission.','你為被忽略的聲音留出空間。同伴取得對方同意後，把他的故事記進筆記。')},
};
export function getEncounter(stageId,quest=1,value=adventure){
 validStage(stageId);if(!Number.isInteger(quest)||quest<1||quest>9)throw new RangeError('Quest must be between 1 and 9');
 const state=validateAdventure(value),key=`${stageId}:${quest}`,index=((state.seed>>>0)+stageId*17+quest*7)%events.length;
 let event=events[index];
 if(stageId===1&&quest===1)event={npc:'Mira',person:0,title:pair('The letter on the path','路上的那封信'),text:pair('A fox guards a red letter with no name. Mira kneels beside it. Your first choice will be remembered when you reach the old man’s gate.','一隻狐狸守著沒有名字的紅色信封。米拉蹲在旁邊。到了老人的門口，這次選擇會有回應。')};
 let echo=null;
 const first=state.choices['1:1'];
 if(stageId===3&&first)echo={curiosity:pair('The mark you studied on the letter matches the old man’s gate. He recognises your careful sketch and opens his notebook.','你仔細看過的信封記號，和老人門上的記號相同。他認出你用心描下的圖，打開了筆記。'),courage:pair('The old man remembers the question you called out on the path. He has been waiting to answer it: the letter is an invitation.','老人記得你在路上勇敢喊出的問題。他一直等著回答：那封信是一份邀請。'),kindness:pair('The fox remembers your patience and leads you to the old man. He thanks you for giving a frightened creature room to approach.','狐狸記得你的耐心，帶你來到老人身邊。他謝謝你願意等，讓害怕的動物慢慢靠近。')}[first.action];
 return {key,...event,echo,choice:state.choices[key]||null,sceneClass:getReading(stageId).regionSceneClass};
}
export function chooseEncounter(stageId,quest,action){
 if(!Object.hasOwn(actions,action))throw new TypeError('Unknown story action');
 if(!adventure.role)throw new Error('Choose a role first');
 const event=getEncounter(stageId,quest);if(event.choice)return false;
 adventure.choices[event.key]={action,role:adventure.role};persist();return true;
}
export function mountEncounter(container,{stageId,quest=1,isStageComplete=false,onChange=()=>{}}={}){
 if(!container)return;
 const event=getEncounter(stageId,quest);const choice=event.choice,role=roles.find(r=>r.id===(choice?.role||adventure.role));
 const first=stageId===1&&quest===1;
 const firstLabels={curiosity:pair('Study the mark on the letter','看看信封上的記號'),courage:pair('Call out: “Who is this for?”','大聲問：「這封信要給誰？」'),kindness:pair('Give the fox time to approach','耐心等狐狸靠近')};
 const firstResults={curiosity:pair('You sketch the tiny oak leaf on the seal. Mira thinks she has seen that shape on a village gate.','你畫下封口的小橡樹葉。米拉覺得自己曾在村莊的一扇門上看過這形狀。'),courage:pair('Your question carries down the lane. Somewhere beyond the trees, an old man answers: “Bring your questions with you.”','你的問題沿著小巷傳去。樹林另一邊，一位老人回答：「把你的問題一起帶來。」'),kindness:pair('You wait quietly. The fox steps closer, then turns towards a blue door as though inviting you to follow.','你安靜等待。狐狸走近，再轉向一扇藍色的門，像在邀請你跟上。')};
 container.innerHTML=`<section class="story-encounter"><div class="story-encounter-image story-scene ${event.sceneClass}" role="img" aria-label="${esc(pick(getReading(stageId).arc))}"><span class="story-npc story-portrait story-person-${event.person}" aria-hidden="true"></span></div><div class="story-encounter-copy"><span class="story-eyebrow">${pick(isStageComplete?pair('CHAPTER EPILOGUE','章節後記'):pair('A MOMENT ON THE ROAD','旅途中的相遇'))} · ${event.npc}</span><h3>${esc(pick(event.title))}</h3><p>${esc(pick(event.text))}</p>${event.echo?`<p class="story-echo">${esc(pick(event.echo))}</p>`:''}${choice?`<div class="story-outcome" role="status"><strong>${pick(pair('Your choice stays in the story','你的選擇已留在故事裡'))} · ${pick(labels[choice.action])} +1</strong><p>${esc(pick(first?firstResults[choice.action]:actions[choice.action].result))} ${esc(pick(role.voice))}</p></div>`:role?`<div class="story-choice-buttons">${Object.entries(actions).map(([action,entry])=>`<button class="story-button" data-story-choice="${action}">${esc(pick(first?firstLabels[action]:entry.label))}</button>`).join('')}</div>`:`<p class="story-role-needed">${pick(pair('Choose your role to make this decision.','先選擇角色，就能作出這次決定。'))}</p><div class="story-choice-buttons">${roles.map(r=>`<button class="story-button" data-encounter-role="${r.id}">${esc(pick(r.name))}</button>`).join('')}</div>`}<small class="story-aside">${pick(pair('Story choices shape this journey. They do not replace word practice.','劇情選擇塑造旅程，單字仍需透過練習累積。'))}</small>${storageFailed?`<p role="status">${pick(pair('This choice could not be saved on this device.','這次選擇暫時無法儲存在此裝置。'))}</p>`:''}</div></section>`;
 container.querySelectorAll('[data-story-choice]').forEach(button=>button.addEventListener('click',()=>{chooseEncounter(stageId,quest,button.dataset.storyChoice);mountEncounter(container,{stageId,quest,isStageComplete,onChange});onChange(getAdventure());}));
 container.querySelectorAll('[data-encounter-role]').forEach(button=>button.addEventListener('click',()=>{adventure.role=button.dataset.encounterRole;persist();mountEncounter(container,{stageId,quest,isStageComplete,onChange});onChange(getAdventure());}));
}
export function mountReading(container,{stageId}={}){
 if(!container)return;
 const reading=getReading(stageId);
 let text=esc(reading.text);
 for(const word of reading.focusWords)text=text.replace(new RegExp(`\\b${word}\\b`,'gi'),match=>`<mark>${match}</mark>`);
 container.innerHTML=`<section class="story-reading"><div class="story-reading-image story-scene ${reading.sceneClass}" role="img" aria-label="${esc(pick(reading.arc))}"><span>${esc(pick(reading.arc))}</span></div><div class="story-reading-body"><div class="story-reading-meta"><span>CHAPTER ${String(stageId).padStart(2,'0')}</span><span>${reading.wordCount} ${pick(pair('words','字'))} · ${pick(reading.format==='short'?pair('Short reading','短句閱讀'):reading.format==='dialogue'?pair('Dialogue','對話閱讀'):pair('Story passage','故事閱讀'))}</span></div><h3>${esc(pick(reading.title))}</h3><button class="voice-read" type="button" data-read-passage>${voiceLabel('passage',storyLocale)}</button><p class="story-passage" lang="en">${text}</p><div class="story-focus"><span>${pick(pair('Words in this passage','本篇情境字'))}</span>${reading.focusWords.map(word=>`<button class="voice-read" type="button" data-read-word="${esc(word)}" aria-label="${esc(pick(pair('Read word','朗讀單字')))} ${esc(word)}">${esc(word)}</button>`).join('')}</div>${storyLocale==='zh'?`<details class="story-translation"><summary>展開中文對照</summary><p>${esc(reading.translation)}</p></details>`:''}<details class="story-comprehension"><summary>${pick(pair('Try a quick reading check','試試閱讀小挑戰'))}</summary><p class="story-quiz-label">${pick(pair('Choose the word used in the passage.','選出原文使用的單字。'))}</p><p class="story-cloze" lang="en">${esc(reading.quiz.prompt)}</p><div class="story-quiz-options">${reading.quiz.options.map(option=>`<button class="story-button" data-reading-answer="${option}">${option}</button>`).join('')}</div><p class="story-reading-feedback" aria-live="polite"></p><button class="story-reveal" type="button">${pick(pair('Show answer and evidence','查看答案與原句'))}</button></details><small class="story-aside">${pick(pair('An original, levelled story. Highlighted words come from this passage; reading does not unlock vocabulary stages.','原創分級故事。標示字均出現在本文；閱讀不會直接解鎖單字關卡。'))}</small></div></section>`;
 container.querySelector('[data-read-passage]').addEventListener('click',()=>speakText(reading.text));
 container.querySelectorAll('[data-read-word]').forEach(button=>button.addEventListener('click',()=>speakWord(button.dataset.readWord)));
 const feedback=container.querySelector('.story-reading-feedback');
 container.querySelectorAll('[data-reading-answer]').forEach(button=>button.addEventListener('click',()=>{
  const correct=button.dataset.readingAnswer===reading.quiz.answer;button.classList.toggle('is-correct',correct);button.classList.toggle('is-wrong',!correct);
  feedback.textContent=correct?`${pick(pair('Correct. Read the sentence again:','答對了。再讀一次原句：'))} ${reading.quiz.evidence}`:pick(pair('Not the word in the passage. Read the highlighted sentence and try again.','這不是原文使用的字。找找標示字所在的句子，再試一次。'));
 }));
 container.querySelector('.story-reveal').addEventListener('click',()=>{feedback.textContent=`${pick(pair('Answer','答案'))}: ${reading.quiz.answer}. ${reading.quiz.evidence}`;});
}
