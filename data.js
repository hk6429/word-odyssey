import { vocabulary } from './vocabulary.js';
export const TARGET_WORDS = 7000;
export const MILESTONES = [
  { id: 'foundation', title: '啟程之境', english: 'The Awakening', from: 1, to: 20, target: 1200, description: '從熟悉的日常，帶著 1,200 字出發。' },
  { id: 'explorer', title: '試煉之境', english: 'The Crossing', from: 21, to: 40, target: 2000, description: '跨越舒適圈，累積至 2,000 字。' },
  { id: 'hero', title: '英雄之境', english: 'The Becoming', from: 41, to: 100, target: 7000, description: '走向更寬廣的世界，累積至 7,000 字。' },
];
const regions = [
 ['科茲窩','Cotswolds','蜂蜜色石屋之間，一封遠方來信正在等你。'],
 ['牛津','Oxford','古老書院的燈光，照亮下一段未知的路。'],
 ['倫敦','London','泰晤士河畔的人聲，正呼喚你開口與世界相遇。'],
 ['劍橋','Cambridge','沿著康河划行，每一次提問都帶來新的方向。'],
 ['約克','York','穿過石板街與城牆，你開始看見自己的改變。'],
 ['湖區','Lake District','湖面映著天空，旅程邀請你更細緻地表達。'],
 ['峰區','Peak District','越過起伏的山徑，帶著累積的知識勇敢前進。'],
 ['愛丁堡','Edinburgh','鐘聲越過古堡，新的故事等你親自讀懂。'],
 ['蘇格蘭高地','The Highlands','遼闊山野裡，你已能為自己的旅程找到語言。'],
 ['歸途','Homeward','帶著世界贈予的詞語，回到熟悉卻全新的自己。'],
];
const beats = [
 ['晨光的來信','A Letter at Dawn'],['口袋裡的羅盤','The Pocket Compass'],['老書店的導師','The Bookshop Mentor'],['越過石橋','Across the Stone Bridge'],['旅途中的盟友','Friends Along the Way'],['霧中的路標','A Sign in the Mist'],['暴雨前的準備','Before the Storm'],['高塔的試煉','The Tower Trial'],['帶回一束光','A Light to Carry'],['更勇敢的自己','A Braver You'],
];
const calls = [
 ['村裡的郵差遺失了一封重要的信，請你協助找出線索。','把找回的信交到收信人手中，讓第一個故事有了圓滿的結尾。'],
 ['一位迷路的旅人需要你的幫忙。整理線索，替他找到正確方向。','你和旅人一起抵達路口，羅盤也為你指向下一段冒險。'],
 ['老書店的導師留下一頁未完成的筆記，邀你讀懂其中的祕密。','你把新發現寫回筆記，導師為你的勇氣留下了一枚書籤。'],
 ['石橋的另一端有你未曾見過的風景。做好準備，跨出這一步。','你終於走過石橋，發現未知的世界也能成為熟悉的風景。'],
 ['市集裡的新朋友邀你合作完成任務。傾聽與表達，都是你的力量。','你們一起完成任務。旅途中的盟友，讓前進的路不再孤單。'],
 ['一陣霧遮住了路標。把熟悉的線索重新串起來，找回前進的路。','霧慢慢散去，你學會在不確定的時候，仍然相信自己的累積。'],
 ['遠處的雲層漸漸變厚。整理行囊，為接下來的挑戰做好準備。','雨停了，準備好的你帶著完整行囊，繼續走向下一站。'],
 ['高塔的大門緩緩打開。帶上一路學到的力量，接受守門人的試煉。','高塔的鐘為你響起。你通過試煉，也看見自己比想像中更有力量。'],
 ['一盞熄滅的路燈，正等著你把新的光帶回來。','燈火重新亮起，照亮了你，也照亮下一位踏上旅程的人。'],
 ['來到這段旅程的終點。回望走過的路，再完成最後一次挑戰。','你帶著新的詞語與勇氣歸來。熟悉的世界，因你的成長而變得更遼闊。'],
];
let cursor = 0;
export const stages = Array.from({length:100}, (_,i) => {
 const id=i+1, quota=id<=20?60:id<=40?40:id<=80?83:84;
 const region=regions[Math.floor(i/10)], beat=beats[i%10];
 const band=MILESTONES.find(b=>id>=b.from&&id<=b.to);
 const words=vocabulary.slice(cursor,cursor+quota); cursor+=quota;
 return {id,title:beat[0],english:beat[1],place:region[0],region:region[1],description:`${region[0]}，${calls[i%10][0]}`,band:band.id,quota,cumulative:cursor,words,
  invitation:`你抵達${region[0]}。${calls[i%10][0]} 這一關收集 ${quota} 個新單字，一次完成一小段。`,
  returnStory:`${region[0]}的旅人手札：${calls[i%10][1]}`};
});
