// One illustrated region for each ten-chapter leg of the journey.
export const MAP_SCENES = [
  { id:'cotswolds', zh:'科茲窩的石屋、田野與蜿蜒小徑', en:'Stone cottages, fields and winding paths in the Cotswolds' },
  { id:'oxford', zh:'牛津的學院、花園與河畔小徑', en:'Colleges, gardens and riverside paths in Oxford' },
  { id:'london', zh:'倫敦的城市地標、河流與街道', en:'City landmarks, the river and streets of London' },
  { id:'cambridge', zh:'劍橋的學院、河岸與草地', en:'Colleges, riverbanks and meadows in Cambridge' },
  { id:'york', zh:'約克的城牆、古老街道與綠野', en:'City walls, historic streets and green fields in York' },
  { id:'lake-district', zh:'湖區的群山、湖泊與步道', en:'Mountains, lakes and footpaths in the Lake District' },
  { id:'peak-district', zh:'峰區的山丘、石牆與荒原步道', en:'Hills, stone walls and moorland paths in the Peak District' },
  { id:'edinburgh', zh:'愛丁堡的城堡、舊城與山丘', en:'The castle, Old Town and hills of Edinburgh' },
  { id:'highlands', zh:'蘇格蘭高地的山巒、湖水與山谷', en:'Mountains, lochs and valleys in the Scottish Highlands' },
  { id:'homeward', zh:'歸途上的村莊、田野與溫暖燈火', en:'Villages, fields and welcoming lights on the journey home' }
].map((scene,index)=>Object.freeze({
  ...scene,
  first:index*10+1,
  last:index*10+10,
  src:`assets/map-region-${String(index+1).padStart(2,'0')}.png`
}));

export const MAP_POINTS = Object.freeze([
  [11,20],[34,18],[59,18],[87,24],[78,48],
  [50,48],[18,54],[16,76],[49,80],[86,78]
]);
