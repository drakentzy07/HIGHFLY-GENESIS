import {originalHeight, originalBounds} from './original_world.js';

export const SEED = 20061, WATER=-4.3, STORAGE='highfly:genesis:g1g2:world:v2', HUNTER='highfly:genesis:g1g2:hunter:v2';
export const SOURCE='levy-street/world-of-claudecraft@9b57e49c9676d75962700f828cc00a50a9a988b5';
export const ZONE={id:'eastbrook_vale',zMin:-180,zMax:180,biome:'vale',hub:{x:-14,z:-100,radius:26},lakes:[{x:-92,z:88,radius:30}]};
export const ROADS=[
 [{x:-14,z:-100},{x:-12,z:-72},{x:-2,z:-34},{x:2,z:-4},{x:-8,z:30},{x:-15,z:55},{x:-2,z:78},{x:-16,z:104},{x:-26,z:124},{x:-32,z:140}],
 [{x:-14,z:-100},{x:-25,z:-105},{x:-54,z:-80}],
 [{x:-14,z:-100},{x:11,z:-113},{x:14,z:-108},{x:30,z:-30},{x:50,z:-50},{x:65,z:-65}]
];
const clone=o=>JSON.parse(JSON.stringify(o));
export const freshWorld=()=>({version:2,origin:'HIGHFLY',zone:clone(ZONE),roads:clone(ROADS),stamps:[],objects:[{id:'refuge',type:'hut',x:-23,z:-93},{id:'welcome',type:'npc',x:-8,z:-96},{id:'wolf',type:'wolf',x:22,z:-44}],spawn:{x:-14,z:-106}});
export function validWorld(w){return !!w&&w.version===2&&w.origin==='HIGHFLY'&&Array.isArray(w.roads)&&w.roads.length<600&&w.roads.every(p=>Array.isArray(p)&&p.length<250&&p.every(a=>Number.isFinite(a.x)&&Number.isFinite(a.z)))&&Array.isArray(w.stamps)&&w.stamps.length<1000&&w.stamps.every(s=>Number.isFinite(s.x)&&Number.isFinite(s.z)&&Number.isFinite(s.delta)&&s.radius>0&&s.radius<=200)&&Array.isArray(w.objects)&&w.objects.length<250&&w.objects.every(o=>['hut','npc','wolf','tree','rock'].includes(o.type)&&typeof o.id==='string'&&Number.isFinite(o.x)&&Number.isFinite(o.z))&&w.spawn&&Number.isFinite(w.spawn.x)&&Number.isFinite(w.spawn.z);}
export function loadWorld(){try{const w=JSON.parse(localStorage.getItem(STORAGE));if(validWorld(w))return w;}catch{}return freshWorld()}
export function saveWorld(w){if(!validWorld(w))throw Error('Mapa inválido');localStorage.setItem(STORAGE,JSON.stringify(w))}
export function freshHunter(w){return {name:'Hunter',level:1,x:w.spawn.x,z:w.spawn.z,hp:100,mp:70,energy:100,str:5,agi:5,vit:5,per:5,int:5,wolfKills:0}}
export function loadHunter(w){try{let a=JSON.parse(localStorage.getItem(HUNTER));if(a&&Number.isFinite(a.x)&&Number.isFinite(a.z)&&Number.isFinite(a.hp))return {...freshHunter(w),...a}}catch{}return freshHunter(w)}
export function saveHunter(h){localStorage.setItem(HUNTER,JSON.stringify(h))}
const smooth=(a,b,t)=>{t=Math.max(0,Math.min(1,(t-a)/(b-a)));return t*t*(3-2*t)};
export function distRoad(x,z,roads){let best=1e9;for(const r of roads)for(let i=1;i<r.length;i++){const a=r[i-1],b=r[i],dx=b.x-a.x,dz=b.z-a.z,t=Math.max(0,Math.min(1,((x-a.x)*dx+(z-a.z)*dz)/(dx*dx+dz*dz||1)));best=Math.min(best,Math.hypot(x-a.x-t*dx,z-a.z-t*dz));}return best}
export function heightAt(x,z,w){const sample=originalHeight(x,z);if(sample!==null){let h=sample;for(const s of w.stamps){const d=Math.hypot(x-s.x,z-s.z);if(d<s.radius){const weight=s.falloff==='flat'?(d<s.radius*.85?1:1-smooth(s.radius*.85,s.radius,d)):1-smooth(0,s.radius,d);h=s.mode==='level'?h+(s.delta-h)*weight:h+s.delta*weight;}}return h;}if(originalBounds())return -8;let h=-1.35+3.1*Math.sin(x*.018+SEED)*Math.cos(z*.026)+1.55*Math.sin(x*.061)*Math.sin(z*.043);const hub=Math.hypot(x-w.spawn.x,z-w.spawn.z);const flat=smooth(42,13,hub);h=h*(1-flat)-.7*flat;h-=9*smooth(43,26,Math.hypot(x+92,z-88));const road=1-smooth(2.5,9,distRoad(x,z,w.roads));h=h*(1-.65*road)-.7*.65*road;for(const s of w.stamps){const d=Math.hypot(x-s.x,z-s.z);if(d<s.radius)h+=s.delta*(1-smooth(0,s.radius,d));}return h;}
export const clamp=(x,z)=>{const b=originalBounds();return {x:Math.min((b?.x1??180)-4,Math.max((b?.x0??-180)+4,x)),z:Math.min((b?.z1??180)-4,Math.max((b?.z0??-180)+4,z))}};
export function blocked(x,z,w){return w.objects.some(o=>o.type!=='wolf'&&o.type!=='npc'&&Math.hypot(x-o.x,z-o.z)<(o.type==='hut'?5:1.2));}
