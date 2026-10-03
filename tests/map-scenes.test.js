import test from 'node:test';
import assert from 'node:assert/strict';
import { MAP_SCENES, MAP_POINTS } from '../map-scenes.js';

test('one distinct illustrated scene covers each ten-chapter region',()=>{
  assert.equal(MAP_SCENES.length,10);
  assert.equal(new Set(MAP_SCENES.map(scene=>scene.id)).size,10);
  assert.equal(new Set(MAP_SCENES.map(scene=>scene.src)).size,10);
  assert.deepEqual(MAP_SCENES.flatMap(scene=>Array.from({length:scene.last-scene.first+1},(_,i)=>scene.first+i)),Array.from({length:100},(_,i)=>i+1));
  for(const [index,scene] of MAP_SCENES.entries()){
    assert.equal(scene.src,`assets/map-region-${String(index+1).padStart(2,'0')}.png`);
    assert.ok(scene.zh&&scene.en);
  }
});

test('ten journey stops remain within the full landscape',()=>{
  assert.equal(MAP_POINTS.length,10);
  assert.equal(new Set(MAP_POINTS.map(point=>point.join(','))).size,10);
  for(const [x,y] of MAP_POINTS)assert.ok(x>=10&&x<=90&&y>=15&&y<=85);
});
