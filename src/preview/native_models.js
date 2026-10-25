
/* G2 REAL: exact approved upstream GLB, not box/capsule stand-ins. */
import * as THREE from 'three';
import {GLTFLoader} from 'three/addons/loaders/GLTFLoader.js';
import {KTX2Loader} from 'three/addons/loaders/KTX2Loader.js';
import {MeshoptDecoder} from 'three/addons/libs/meshopt_decoder.module.js';
import {clone as skeletonClone} from 'three/addons/utils/SkeletonUtils.js';
const loader=new GLTFLoader();loader.setMeshoptDecoder(MeshoptDecoder);
const sources={
 hunter:['models/chars/players/knight.glb',2.35],
 npc:['models/chars/players/rogue.glb',2.35],
 wolf:['models/creatures/wolf_basic.glb',1.45],
 hut:['models/props/house_1.glb',5.8],
 tree:['models/foliage/pine_1.glb',7.8],
 oak:['models/foliage/oak_1.glb',7.8],
 bush:['models/foliage/bush.glb',1.5]
};
const cache=new Map(), actors=[];
export function configureModels(renderer){
 const transcoder=new KTX2Loader().setTranscoderPath(import.meta.env.BASE_URL+'basis/').detectSupport(renderer);
 loader.setKTX2Loader(transcoder);
}
function resource(type){
 const [file]=sources[type],url=import.meta.env.BASE_URL+file;
 if(!cache.has(file))cache.set(file,new Promise((resolve,reject)=>loader.load(url,resolve,undefined,reject)));
 return cache.get(file);
}
export async function replaceWithRealModel(group,type){
 if(!sources[type])return false;
 try{
  const gltf=await resource(type);if(!group.parent)return false;
  const item=skeletonClone(gltf.scene);
  item.updateMatrixWorld(true);
  const box=new THREE.Box3().setFromObject(item),size=box.getSize(new THREE.Vector3());
  if(!(size.y>.0001))throw Error('Escala inválida '+type);
  const factor=sources[type][1]/size.y;
  item.scale.setScalar(factor);
  item.position.set(-(box.min.x+box.max.x)/2*factor,-box.min.y*factor,-(box.min.z+box.max.z)/2*factor);
  item.traverse(obj=>{if(obj.isMesh){obj.castShadow=false;obj.frustumCulled=true}});
  for(const ch of [...group.children])group.remove(ch);
  group.add(item);
  if(gltf.animations?.length && (type==='hunter'||type==='npc'||type==='wolf')){
    const mixer=new THREE.AnimationMixer(item),clips=gltf.animations;
    const choose=(tokens)=>clips.find(c=>tokens.some(w=>c.name.toLowerCase().includes(w)));
    const idle=choose(['idle','stand','breath'])||clips[0];
    const walk=choose(['run','walk','sprint','move'])||idle;
    const atk=choose(['attack','bite','slash','hit'])||walk;
    const active=mixer.clipAction(idle);active.play();
    const actor={group,type,mixer,clips:{idle,walk,atk},current:active};
    actors.push(actor);group.userData.actor=actor;
  }
  group.userData.isNativeGLB=true;
  return true;
 }catch(e){console.warn('GLB CC0 no cargado:',type,e);return false;}
}
export function tickNativeModels(dt,walking=false,striking=false){
 for(let i=actors.length-1;i>=0;i--){
  const a=actors[i];if(!a.group.parent){a.mixer.stopAllAction();actors.splice(i,1);continue}
  const clip=a.type==='hunter'?(striking?a.clips.atk:walking?a.clips.walk:a.clips.idle):a.type==='wolf'?a.clips.walk:a.clips.idle;
  const target=a.mixer.clipAction(clip);
  if(target!==a.current){a.current.fadeOut(.15);target.reset().fadeIn(.15).play();a.current=target}
  a.mixer.update(dt);
 }
}
