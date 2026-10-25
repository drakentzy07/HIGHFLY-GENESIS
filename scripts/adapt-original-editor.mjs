/* Minimal isolation patches of the upstream MIT editor. Applied ONLY to the ephemeral CI checkout. */
import fs from 'node:fs';
const root='_donor/src/editor/';
function edit(f,replace){const p=root+f;let c=fs.readFileSync(p,'utf8');for(const [needle,value] of replace){if(!c.includes(needle))throw new Error('Original editor API changed: '+f+' missing '+needle);c=c.replace(needle,value)}fs.writeFileSync(p,c)}
// Real original EditorApp & 2D canvas. Heavy renderer still optional from the 3D switch.
edit('app.ts',[
 ["private viewMode: '3d' | '2d' = '3d';","private viewMode: '3d' | '2d' = '2d';"],
 ["    this.applyViewMode();\n    this.boot3d();","    this.applyViewMode();\n    // HIGHFLY: 3D renderer is lazy; 2D builder is the safe first paint."]
]);
edit('main.ts',[
 ["camps: clone(CAMPS),","camps: [],"],
 ["npcs: clone(NPCS),","npcs: {},"],
 ["objects: clone(GROUND_OBJECTS),","objects: [],"],
 ["document.title = t('editor.docTitle');","document.title = 'HIGHFLY WORLD BUILDER · Editor original';"]
]);
edit('persist.ts',[
 ["const LEGACY_STORE_KEY = 'woc_editor_maps';","const LEGACY_STORE_KEY = 'highfly_genesis_editor_maps';"],
 ["const MAP_KEY_PREFIX = 'woc_editor_map:';","const MAP_KEY_PREFIX = 'highfly_genesis_editor_map:';"],
 ["const INDEX_KEY = 'woc_editor_maps_index';","const INDEX_KEY = 'highfly_genesis_editor_maps_index';"]
]);
const entries=[
['models/chars/players/knight.glb','Hunter','chars'],
['models/chars/players/rogue.glb','Guía','chars'],
['models/creatures/wolf_basic.glb','Lobo','creatures'],
['models/props/house_1.glb','Casa medieval 1','props'],
['models/props/house_2.glb','Casa medieval 2','props'],
['models/props/house_3.glb','Casa medieval 3','props'],
['models/foliage/pine_1.glb','Pino','foliage'],
['models/foliage/oak_1.glb','Roble','foliage'],
['models/foliage/bush.glb','Arbusto','foliage']
].map(([p,label,category])=>({id:p.replace('models/','').replace('.glb',''),category,label,path:'./'+p}));
const header="// Highfly allowlisted art only; preserves the original ClaudeCraft browser interface.\n";
const cat=header+'export interface AssetEntry {id:string;category:string;label:string;path:string}\n'+
'export const ASSET_CATALOG:readonly AssetEntry[]='+JSON.stringify(entries)+';\n'+
'export const ASSET_CATEGORIES:readonly string[]='+JSON.stringify([...new Set(entries.map(x=>x.category))])+';\n'+
'const BY_ID=new Map(ASSET_CATALOG.map(a=>[a.id,a]));\n'+
'export function assetById(id:string):AssetEntry|undefined{return BY_ID.get(id)}\n';
fs.writeFileSync(root+'asset_catalog.generated.ts',cat);
// Keep the editor offline and inside the GH Pages subdirectory.
edit('playtest.ts',[["window.location.href = '/index.html';","window.location.href = new URL('./index.html', window.location.href).href;"]]);
// Disable original sign-in even if stale WOC session exists in shared browser origin.
const np='_donor/src/editor/net.ts',net=fs.readFileSync(np,'utf8');
if(net.includes('export function signedIn()'))fs.writeFileSync(np,net.replace(/export function signedIn\(\)[\s\S]*?\n\}/,'export function signedIn(){return false}'));
console.log('Original editor retained, 2D default, 9 CC0 assets, zero carried NPC/camps.');
