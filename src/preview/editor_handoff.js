/**
 * Consumes the true World of ClaudeCraft editor's existing offline playtest format.
 * Restricts imported placements to audited CC0 GLBs.
 */
const KEY='woc_editor_playtest';
const TYPES=new Map([
 ['models/chars/players/knight.glb','npc'],
 ['models/chars/players/rogue.glb','npc'],
 ['models/creatures/wolf_basic.glb','wolf'],
 ['models/props/house_1.glb','hut'],
 ['models/props/house_2.glb','hut'],
 ['models/props/house_3.glb','hut'],
 ['models/foliage/pine_1.glb','tree'],
 ['models/foliage/oak_1.glb','tree'],
 ['models/foliage/bush.glb','tree']
]);
export function takeOriginalEditorPlaytest(world,manifest){
 let raw=null;try{raw=sessionStorage.getItem(KEY);if(raw)sessionStorage.removeItem(KEY)}catch{return false}
 if(!raw)return false;
 try{
  const payload=JSON.parse(raw),w=payload.content;if(!w||!Array.isArray(w.zones)||!Array.isArray(w.roads)||!w.playerStart)throw Error('Documento inválido');
  if(w.zones.length<1||w.roads.length>600)throw Error('Mundo fuera de límites');
  if(w.roads.every(road=>Array.isArray(road)&&road.length<250))world.roads=w.roads;
  const builtins=new Set((manifest.terrainEdits||[]).map(x=>JSON.stringify(x)));
  if(Array.isArray(w.terrainEdits)){
   world.stamps=w.terrainEdits.filter(x=>!builtins.has(JSON.stringify(x)))
    .filter(x=>x&&Number.isFinite(x.x)&&Number.isFinite(x.z)&&Number.isFinite(x.delta)&&x.radius>0&&x.radius<=200)
    .slice(0,1000);
  }
  if(Number.isFinite(w.playerStart.x)&&Number.isFinite(w.playerStart.z)){
   world.spawn={x:w.playerStart.x,z:w.playerStart.z};
  }
  if(Array.isArray(w.placements)){
   const restored=[];
   for(const p of w.placements){
    const normalized=String(p.path||'').replace(/^\/+/,'');
    const type=TYPES.get(normalized);
    if(!type||!Number.isFinite(p.x)||!Number.isFinite(p.z))continue;
    restored.push({id:'donor-placement-'+restored.length,type,x:p.x,z:p.z});
    if(restored.length>=90)break;
   }
   world.objects=[...world.objects.filter(o=>!o.id.startsWith('donor-placement-')),...restored];
  }
  return true;
 }catch(e){console.warn('El editor produjo un mapa no compatible',e);return false}
}
