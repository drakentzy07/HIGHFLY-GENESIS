import fs from 'node:fs';
import path from 'node:path';
import {createHash} from 'node:crypto';
const PIN='9b57e49c9676d75962700f828cc00a50a9a988b5';
const source=path.join(process.cwd(),'_donor/public');
const target=path.join(process.cwd(),'public');
// Real CC0 packs listed in World of ClaudeCraft CREDITS.md, lines 95-105.
const assets={
 'models/chars/players/knight.glb':'KayKit Character Pack Adventures — CC0 1.0',
 'models/chars/players/rogue.glb':'KayKit Character Pack Adventures — CC0 1.0',
 'models/creatures/wolf_basic.glb':'Quaternius animated creatures — CC0 1.0',
 'models/props/house_1.glb':'Quaternius Medieval Village — CC0 1.0',
 'models/props/house_2.glb':'Quaternius Medieval Village — CC0 1.0',
 'models/props/house_3.glb':'Quaternius Medieval Village — CC0 1.0',
 'models/foliage/bush.glb':'Quaternius Stylized Nature MegaKit — CC0 1.0',
 'models/foliage/pine_1.glb':'Quaternius Stylized Nature MegaKit — CC0 1.0',
 'models/foliage/oak_1.glb':'Quaternius Stylized Nature MegaKit — CC0 1.0',
 'textures/terrain/Grass001_Color.jpg':'ambientCG Grass001 — CC0 1.0'
};
let copied=[];
for(const [p,license] of Object.entries(assets)){
 const from=path.join(source,p),to=path.join(target,p);
 if(!fs.existsSync(from))throw Error('Approved asset missing '+p);
 fs.mkdirSync(path.dirname(to),{recursive:true});fs.copyFileSync(from,to);
 copied.push({path:p,license,sha256:createHash('sha256').update(fs.readFileSync(to)).digest('hex')});
}
fs.mkdirSync(path.join(target,'genesis'),{recursive:true});
for(const name of ['basis_transcoder.js','basis_transcoder.wasm']){
 const p=path.join(process.cwd(),'node_modules/three/examples/jsm/libs/basis',name);
 const dst=path.join(target,'basis',name);fs.mkdirSync(path.dirname(dst),{recursive:true});fs.copyFileSync(p,dst);
}
fs.writeFileSync(path.join(target,'genesis/asset-manifest.json'),JSON.stringify({origin:'World of ClaudeCraft',commit:PIN,assets:copied},null,2));
console.log('CC0 MODELS',copied.map(x=>x.path));
