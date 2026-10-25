
import test from 'node:test';
import assert from 'node:assert/strict';
import {SOURCE, SEED,ZONE,freshWorld,validWorld,heightAt,blocked,distRoad,freshHunter} from '../src/preview/world.js';
test('donor geography source pinned',()=>{assert.match(SOURCE,/9b57e49c9676d75962700f828cc00a50a9a988b5/);assert.equal(SEED,20061);assert.equal(ZONE.biome,'vale')});
test('isolated Hunter NPC wolf refuge',()=>{const w=freshWorld();assert.equal(validWorld(w),true);assert.deepEqual(w.objects.map(o=>o.type),['hut','npc','wolf']);assert.equal(w.npcs,undefined);assert.equal(w.camps,undefined);assert.equal(freshHunter(w).mp,70)});
test('terrain and roads deterministic',()=>{const w=freshWorld();assert.equal(heightAt(2,3,w),heightAt(2,3,w));const h=heightAt(2,3,w);w.stamps.push({x:2,z:3,radius:10,delta:2});assert.ok(heightAt(2,3,w)>h+1.9);assert.equal(distRoad(2,-4,w.roads),0)});
test('collision and map validation',()=>{let w=freshWorld();assert.equal(blocked(-23,-93,w),true);assert.equal(blocked(150,150,w),false);assert.equal(validWorld({...w,objects:[{type:'restricted',id:'r',x:0,z:0}]}),false)});
