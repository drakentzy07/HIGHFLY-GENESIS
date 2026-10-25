
import * as THREE from 'three';
import {WATER,SEED,loadWorld,saveWorld,loadHunter,saveHunter,freshHunter,heightAt,distRoad,clamp,blocked,validWorld} from './world.js';
import './style.css';
const el=id=>document.getElementById(id);
let world=loadWorld(),hunter=loadHunter(world),playing=false,editor=false,tool='select',roadDraft=null,undo=[];
let wolf=null,guide=null,wolfHP=45,wolfDown=0,wolfCD=0,atkCombo=0,lastATK=0,atkTime=0,dashTime=0,velY=0,elev=0,jumps=0,elapsed=0,saveTimer=0;
const canvas=el('three'),scene=new THREE.Scene();scene.background=new THREE.Color(0x9bc1ca);scene.fog=new THREE.Fog(0x9bc1ca,90,285);
const camera=new THREE.PerspectiveCamera(63,innerWidth/innerHeight,.1,420),renderer=new THREE.WebGLRenderer({canvas,antialias:true,powerPreference:'high-performance'});
renderer.setPixelRatio(Math.min(devicePixelRatio||1,1.5));renderer.setSize(innerWidth,innerHeight);renderer.outputColorSpace=THREE.SRGBColorSpace;
scene.add(new THREE.HemisphereLight(0xe2f6ff,0x4b6646,2.3));const sun=new THREE.DirectionalLight(0xffe7c1,2.3);sun.position.set(55,110,-75);scene.add(sun);
const mats={},material=c=>mats[c]||(mats[c]=new THREE.MeshStandardMaterial({color:c,roughness:.91}));
const mesh=(parent,geo,m,x,y,z)=>{const o=new THREE.Mesh(geo,m);o.position.set(x,y,z);parent.add(o);return o};
const cube=(parent,x,y,z,w,h,d,col)=>mesh(parent,new THREE.BoxGeometry(w,h,d),material(col),x,y,z);
const sphere=(parent,x,y,z,r,col)=>mesh(parent,new THREE.SphereGeometry(r,10,8),material(col),x,y,z);
const group=()=>new THREE.Group();
let yaw=.65,pitch=.48,distance=11,terrain,water,treeGroup=group(),roadGroup=group(),objectGroup=group();
scene.add(treeGroup,roadGroup,objectGroup);
function clear(g){for(const child of [...g.children]){g.remove(child);child.traverse(c=>{if(c.geometry)c.geometry.dispose();})}}
function hunterModel(){let g=group();const body=sphere(g,0,1.24,0,.55,'#294763');body.scale.set(.8,1.27,.68);sphere(g,0,2.04,0,.39,'#deaa8b');let left=cube(g,-.22,.44,0,.25,.88,.32,'#2e313b'),right=cube(g,.22,.44,0,.25,.88,.32,'#2e313b');let sword=cube(g,.65,1.2,.17,.12,1.3,.12,'#d9e2eb');sword.rotation.z=-.38;cube(g,0,2.36,0,.8,.16,.5,'#2d4350');scene.add(g);return {g,body,left,right,sword}}
const player=hunterModel();
function objMesh(o){let g=group();if(o.type==='hut'){cube(g,0,1.35,0,8,2.7,7,'#806040');let a=cube(g,-2.1,3.17,0,5.8,.43,8.2,'#964e34'),b=cube(g,2.1,3.17,0,5.8,.43,8.2,'#964e34');a.rotation.z=.57;b.rotation.z=-.57;cube(g,0,1.0,3.53,1.65,2,.18,'#483525');}
 if(o.type==='npc'){cube(g,0,1.0,0,.85,1.4,.6,'#71864e');sphere(g,0,2.04,0,.4,'#ca9977');cube(g,0,2.5,0,.9,.2,.6,'#615134')}
 if(o.type==='wolf'){cube(g,0,.76,0,1.1,.68,1.8,'#77777b');sphere(g,0,1.12,-.69,.44,'#93959a');cube(g,0,.85,-1,.48,.3,.55,'#52585d');for(const x of [-.37,.37])for(const z of [-.55,.55])cube(g,x,.34,z,.22,.6,.23,'#696a6e');for(const x of [-.26,.26])mesh(g,new THREE.ConeGeometry(.14,.38,4),material('#6d7275'),x,1.63,-.8)}
 if(o.type==='rock'){let a=mesh(g,new THREE.DodecahedronGeometry(1.05),material('#85868b'),0,.62,0);a.scale.set(1.2,.65,.9)}
 if(o.type==='tree'){mesh(g,new THREE.CylinderGeometry(.21,.3,2.1,7),material('#775039'),0,1,0);mesh(g,new THREE.ConeGeometry(1.9,3.9,7),material('#466a45'),0,3.35,0);mesh(g,new THREE.ConeGeometry(1.25,2.7,7),material('#628651'),0,4.9,0)}
 g.position.set(o.x,heightAt(o.x,o.z,world),o.z);objectGroup.add(g);return g}
function buildWorld(){
 if(terrain){scene.remove(terrain);terrain.geometry.dispose();terrain.material.dispose()}clear(treeGroup);clear(roadGroup);clear(objectGroup);wolf=null;guide=null;
 const n=108,pos=[],colors=[],indices=[],size=360,c=new THREE.Color();
 for(let j=0;j<=n;j++)for(let i=0;i<=n;i++){let x=-180+size*i/n,z=-180+size*j/n,y=heightAt(x,z,world);pos.push(x,y,z);let road=distRoad(x,z,world.roads);c.set(y<WATER+.5?'#cfbc8e':road<4?'#bca376':y>4?'#778c6c':'#60935e');colors.push(c.r,c.g,c.b)}
 for(let j=0;j<n;j++)for(let i=0;i<n;i++){const a=j*(n+1)+i,b=a+1,d=a+n+1;indices.push(a,d,b,b,d,d+1)}
 const geo=new THREE.BufferGeometry();geo.setAttribute('position',new THREE.Float32BufferAttribute(pos,3));geo.setAttribute('color',new THREE.Float32BufferAttribute(colors,3));geo.setIndex(indices);geo.computeVertexNormals();
 terrain=new THREE.Mesh(geo,new THREE.MeshStandardMaterial({vertexColors:true,side:THREE.DoubleSide,roughness:1}));scene.add(terrain);
 if(!water){water=mesh(scene,new THREE.PlaneGeometry(400,400),new THREE.MeshPhongMaterial({color:'#2b8aaf',transparent:true,opacity:.65,depthWrite:false,side:THREE.DoubleSide}),0,WATER,0);water.rotation.x=-Math.PI/2}
 for(const road of world.roads){if(road.length<2)continue;const pts=road.map(p=>new THREE.Vector3(p.x,heightAt(p.x,p.z,world)+.18,p.z));const line=new THREE.Line(new THREE.BufferGeometry().setFromPoints(new THREE.CatmullRomCurve3(pts).getPoints(75)),new THREE.LineBasicMaterial({color:0xe0c98c}));roadGroup.add(line)}
 let seed=SEED;const rng=()=>{seed=(Math.imul(1664525,seed)+1013904223)>>>0;return seed/4294967296};
 for(let i=0;i<100;i++){let x=-158+316*rng(),z=-158+316*rng();if(Math.hypot(x-world.spawn.x,z-world.spawn.z)<30||Math.hypot(x+92,z-88)<40||distRoad(x,z,world.roads)<9||heightAt(x,z,world)<WATER+.3)continue;const m=objMesh({type:'tree',x,z});objectGroup.remove(m);treeGroup.add(m);m.scale.setScalar(.7+rng()*.6)}
 for(const o of world.objects){const m=objMesh(o);if(o.type==='wolf'&&!wolf)wolf={mesh:m,x:o.x,z:o.z,homeX:o.x,homeZ:o.z};if(o.type==='npc'&&!guide)guide=o;}
 const total=world.objects.length;el('builderNote').textContent=total+' objetos, '+world.stamps.length+' cambios de terreno, '+world.roads.length+' caminos. Assets: geometría HIGHFLY; GLB pendientes de licencia.';
 updateMinimap();
}
function updateMinimap(){const cv=el('minimap'),g=cv.getContext('2d');if(!g)return;g.fillStyle='#284b38';g.fillRect(0,0,190,190);const xy=p=>({x:(p.x+180)*190/360,y:(p.z+180)*190/360});let l=xy({x:-92,z:88});g.beginPath();g.arc(l.x,l.y,16,0,Math.PI*2);g.fillStyle='#318fbc';g.fill();for(const road of world.roads){g.strokeStyle='#e1bf83';g.lineWidth=2.4;g.beginPath();road.forEach((p,i)=>{const a=xy(p);if(!i)g.moveTo(a.x,a.y);else g.lineTo(a.x,a.y)});g.stroke()}for(const o of world.objects){const a=xy(o);g.fillStyle=o.type==='wolf'?'#ec8888':o.type==='npc'?'#fff3a5':'#dfcfbb';g.fillRect(a.x-2,a.y-2,4,4)}const h=xy(hunter);g.fillStyle='#3be0ff';g.beginPath();g.arc(h.x,h.y,4,0,Math.PI*2);g.fill()}
let timer;function notice(s){const e=el('notice');e.textContent=s;e.style.opacity='1';clearTimeout(timer);timer=setTimeout(()=>e.style.opacity='0',2800)}
function save(){try{saveHunter(hunter);saveWorld(world);notice('Guardado en este dispositivo')}catch(e){notice('Error de guardado: '+e.message)}}
function killWolf(){wolfDown=13;wolfHP=45;hunter.str++;hunter.wolfKills++;saveHunter(hunter);notice('¡Lobo derrotado! +1 STR; reaparece en 13 s')}
function attack(){if(editor||!playing)return;const now=performance.now();if(now-lastATK<240)return;atkCombo=now-lastATK>1100?1:atkCombo%4+1;lastATK=now;atkTime=.3;const d=wolf?Math.hypot(hunter.x-wolf.x,hunter.z-wolf.z):1e6;if(wolfDown<=0&&d<4.5){const dmg=atkCombo===4?18:7;wolfHP-=dmg;notice('ATK '+atkCombo+' · '+dmg+' daño');if(wolfHP<=0)killWolf()}else notice('ATK '+atkCombo+' · golpe al aire')}
function jump(){if(editor||jumps>=2||!playing)return;velY=jumps===0?8:9;jumps++;notice(jumps===2?'Doble salto · mortal en desarrollo':'Salto')}
function dash(){if(editor||hunter.energy<22||!playing)return;hunter.energy-=22;dashTime=.24}
function skill(){if(editor||hunter.mp<15||!playing)return;hunter.mp-=15;let d=wolf?Math.hypot(hunter.x-wolf.x,hunter.z-wolf.z):1e6;if(wolfDown<=0&&d<7){wolfHP-=18;notice('Onda astral · 18 daño');if(wolfHP<=0)killWolf()}else notice('Onda astral sin objetivo')}
function use(){if(editor||!playing)return;let d=guide?Math.hypot(hunter.x-guide.x,hunter.z-guide.z):1e6;notice(d<6?'Guía: Bienvenido al Primer Refugio. Seguí el camino hasta el lobo.':'No hay NPC cerca')}
for(const [id,fn] of [['attack',attack],['jump',jump],['dash',dash],['skill',skill],['use',use]])el(id).addEventListener('pointerdown',e=>{e.preventDefault();fn()});
const stick={x:0,y:0},joy=el('joy'),knob=el('knob');let joyId=null;
function adjust(e){const b=joy.getBoundingClientRect(),dx=e.clientX-b.left-b.width/2,dy=e.clientY-b.top-b.height/2,r=Math.min(40,Math.hypot(dx,dy)),a=Math.atan2(dy,dx);stick.x=Math.cos(a)*r/40;stick.y=Math.sin(a)*r/40;knob.style.transform='translate('+stick.x*40+'px,'+stick.y*40+'px)'}
joy.addEventListener('pointerdown',e=>{if(editor)return;joyId=e.pointerId;joy.setPointerCapture(joyId);adjust(e);e.preventDefault()});joy.addEventListener('pointermove',e=>{if(e.pointerId===joyId)adjust(e)});const release=e=>{if(e.pointerId===joyId){joyId=null;stick.x=stick.y=0;knob.style.transform=''}};joy.addEventListener('pointerup',release);joy.addEventListener('pointercancel',release);
let camId=null,px=0,py=0;canvas.addEventListener('pointerdown',e=>{camId=e.pointerId;px=e.clientX;py=e.clientY;canvas.setPointerCapture(camId);if(editor)editClick(e)});canvas.addEventListener('pointermove',e=>{if(e.pointerId!==camId||editor)return;yaw-=(e.clientX-px)*.006;pitch=Math.max(.15,Math.min(1.08,pitch+(e.clientY-py)*.005));px=e.clientX;py=e.clientY});canvas.addEventListener('pointerup',e=>{if(e.pointerId===camId)camId=null});canvas.addEventListener('pointercancel',()=>camId=null);
const keys=new Set();window.addEventListener('keydown',e=>{if(e.target?.tagName==='INPUT')return;keys.add(e.code);if(e.repeat)return;if(e.code==='Space')jump();if(e.code==='KeyF')attack();if(e.code==='KeyE')use();if(e.code==='KeyQ')skill();if(e.code==='ShiftLeft')dash()});window.addEventListener('keyup',e=>keys.delete(e.code));
let prev=performance.now();
function frame(now){requestAnimationFrame(frame);let dt=Math.min(.05,(now-prev)/1000);prev=now;elapsed+=dt;
 if(playing&&!editor){let x=stick.x,z=-stick.y;if(keys.has('KeyW'))z+=1;if(keys.has('KeyS'))z-=1;if(keys.has('KeyA'))x-=1;if(keys.has('KeyD'))x+=1;const len=Math.hypot(x,z);if(len>1){x/=len;z/=len}
 let vx=x*Math.cos(yaw)-z*Math.sin(yaw),vz=-x*Math.sin(yaw)-z*Math.cos(yaw);
 if(len>.03){const next=clamp(hunter.x+vx*dt*(dashTime>0?29:8.3),hunter.z+vz*dt*(dashTime>0?29:8.3));if(!blocked(next.x,next.z,world)){hunter.x=next.x;hunter.z=next.z;}player.g.rotation.y=Math.atan2(-vx,-vz)}
 dashTime=Math.max(0,dashTime-dt);
 if(jumps){velY-=20*dt;elev+=velY*dt;if(elev<=0){elev=0;jumps=0;velY=0}}
 hunter.energy=Math.min(100,hunter.energy+dt*10);hunter.mp=Math.min(70,hunter.mp+dt*.55);atkTime=Math.max(0,atkTime-dt);wolfCD=Math.max(0,wolfCD-dt);
 if(wolfDown>0){wolfDown-=dt;if(wolf)wolf.mesh.visible=false;if(wolfDown<=0&&wolf){wolfHP=45;wolf.x=wolf.homeX;wolf.z=wolf.homeZ;wolf.mesh.visible=true}}
 else if(wolf){const d=Math.hypot(hunter.x-wolf.x,hunter.z-wolf.z);if(d<23&&d>2){let nx=(hunter.x-wolf.x)/d,nz=(hunter.z-wolf.z)/d;wolf.x+=nx*dt*3;wolf.z+=nz*dt*3;wolf.mesh.rotation.y=Math.atan2(-nx,-nz)}
 if(d<2.35&&wolfCD<=0){wolfCD=1.6;hunter.hp-=9;notice('Lobo: -9 HP');if(hunter.hp<=0){hunter.hp=100;hunter.x=world.spawn.x;hunter.z=world.spawn.z;notice('Derrotado · reviviste en el refugio')}}wolf.mesh.position.set(wolf.x,heightAt(wolf.x,wolf.z,world),wolf.z)}
 player.left.rotation.x=Math.sin(elapsed*13)*(len>.03?.35:0);player.right.rotation.x=-player.left.rotation.x;
 player.sword.rotation.z=atkTime>0?-.95*Math.sin(atkTime*9):-.38;
 player.g.position.set(hunter.x,heightAt(hunter.x,hunter.z,world)+elev,hunter.z);
 saveTimer+=dt;if(saveTimer>4){saveTimer=0;saveHunter(hunter)}updateMinimap();
 }
 el('hpbar').style.width=Math.max(0,hunter.hp)+'%';el('mpbar').style.width=(hunter.mp/70*100)+'%';el('enbar').style.width=hunter.energy+'%';el('playername').textContent=hunter.name.toUpperCase()+' · NV '+hunter.level+' · STR '+hunter.str;
 const t=new THREE.Vector3(hunter.x,heightAt(hunter.x,hunter.z,world)+2,hunter.z);camera.position.set(t.x+Math.sin(yaw)*distance*Math.cos(pitch),t.y+distance*Math.sin(pitch),t.z+Math.cos(yaw)*distance*Math.cos(pitch));camera.lookAt(t);renderer.render(scene,camera)
}
window.addEventListener('resize',()=>{renderer.setSize(innerWidth,innerHeight);camera.aspect=innerWidth/innerHeight;camera.updateProjectionMatrix()});
const menu=v=>el('menupanel').hidden=!v;el('menu').onclick=()=>menu(el('menupanel').hidden);el('closeMenu').onclick=()=>menu(false);el('saveBtn').onclick=()=>{save();menu(false)};el('resetHunter').onclick=()=>{hunter=freshHunter(world);saveHunter(hunter);menu(false);notice('Hunter recuperado')};el('mapToggle').onclick=()=>el('minimap').classList.toggle('map-big');
function builder(v){editor=v;el('builder').hidden=!v;menu(false);if(v)notice('World Builder: elegí herramienta');else save()}el('editToggle').onclick=()=>builder(!editor);el('builderBtn').onclick=()=>builder(true);el('closeBuilder').onclick=()=>builder(false);el('exitBuilder').onclick=()=>builder(false);
document.querySelectorAll('[data-tool]').forEach(b=>b.onclick=()=>{tool=b.dataset.tool;roadDraft=null;document.querySelectorAll('[data-tool]').forEach(p=>p.classList.toggle('active',p===b));notice('Herramienta: '+tool)});
const ray=new THREE.Raycaster(),mouse=new THREE.Vector2();
function editClick(e){if(tool==='select')return;const rect=canvas.getBoundingClientRect();mouse.set((e.clientX-rect.left)/rect.width*2-1,-(e.clientY-rect.top)/rect.height*2+1);ray.setFromCamera(mouse,camera);const hit=ray.intersectObject(terrain);if(!hit.length)return;let x=Math.round(hit[0].point.x*2)/2,z=Math.round(hit[0].point.z*2)/2;undo.push(JSON.stringify(world));if(undo.length>25)undo.shift();
 if(tool==='raise'||tool==='lower')world.stamps.push({x,z,radius:12,delta:tool==='raise'?1.35:-1.35});
 else if(tool==='erase'){let best=-1,min=8;world.objects.forEach((o,i)=>{let d=Math.hypot(o.x-x,o.z-z);if(d<min){min=d;best=i}});if(best>=0)world.objects.splice(best,1);else world.stamps.pop()}
 else if(tool==='road'){if(!roadDraft){roadDraft=[];world.roads.push(roadDraft)}roadDraft.push({x,z})}
 else world.objects.push({id:'hf-'+Date.now()+'-'+world.objects.length,type:tool,x,z});
 try{saveWorld(world);buildWorld();notice('Mapa editado: '+tool)}catch(err){world=JSON.parse(undo.pop());notice('Error: '+err.message)}
}
el('undo').onclick=()=>{if(!undo.length)return;world=JSON.parse(undo.pop());saveWorld(world);buildWorld();notice('Deshecho')};
el('saveMap').onclick=save;el('exportMap').onclick=()=>{const b=new Blob([JSON.stringify(world,null,2)],{type:'application/json'}),a=document.createElement('a');a.href=URL.createObjectURL(b);a.download='highfly-genesis-world.json';a.click();setTimeout(()=>URL.revokeObjectURL(a.href),1000)};
el('importMap').onclick=()=>el('importFile').click();el('importFile').onchange=async e=>{try{let f=e.target.files?.[0];if(!f)return;let w=JSON.parse(await f.text());if(!validWorld(w))throw Error('Mapa no compatible');world=w;saveWorld(world);buildWorld();notice('Mapa importado')}catch(err){notice(err.message)}};
el('enter').onclick=()=>{el('startup').hidden=true;el('hud').hidden=false;playing=true;notice('¡Bienvenido al Primer Refugio!')};
buildWorld();requestAnimationFrame(frame);
