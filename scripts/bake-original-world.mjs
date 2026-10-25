/**
 * HIGHFLY G1 REAL: snapshots the unmodified upstream engine's terrainHeight,
 * world zones, roads and authorized static layout into our independent format.
 * Run only after checkout of the pinned MIT donor into _donor.
 */
import fs from 'node:fs';
import path from 'node:path';
import {pathToFileURL} from 'node:url';
import {createHash} from 'node:crypto';
const ROOT=process.cwd(),UP=path.join(ROOT,'_donor'),OUT=path.join(ROOT,'public/genesis');
const entry=(p)=>import(pathToFileURL(path.join(UP,p)).href);
const [{terrainHeight,WATER_LEVEL},{WORLD_MIN_X,WORLD_MAX_X,WORLD_MIN_Z,WORLD_MAX_Z,BUILTIN_WORLD},{WORLD_SEED}]=await Promise.all([
 entry('src/sim/world.ts'),entry('src/sim/data.ts'),entry('src/sim/world_seed.ts')
]);
fs.mkdirSync(OUT,{recursive:true});
const STEP=4;
const x0=Math.floor(WORLD_MIN_X/STEP)*STEP,z0=Math.floor(WORLD_MIN_Z/STEP)*STEP;
const x1=Math.ceil(WORLD_MAX_X/STEP)*STEP,z1=Math.ceil(WORLD_MAX_Z/STEP)*STEP;
const width=Math.round((x1-x0)/STEP)+1,depth=Math.round((z1-z0)/STEP)+1;
if(width*depth>1_200_000||width<2||depth<2)throw Error('Unexpected original-world extent');
const h=new Float32Array(width*depth);
for(let j=0;j<depth;j++){
 for(let i=0;i<width;i++){const n=terrainHeight(x0+i*STEP,z0+j*STEP,WORLD_SEED);
 if(!Number.isFinite(n))throw Error('Nonfinite original height at '+i+','+j);
 h[j*width+i]=n;}
 if(j%90===0)process.stdout.write('Original terrain '+j+'/'+depth+'\n');
}
const b=Buffer.from(h.buffer);
fs.writeFileSync(path.join(OUT,'terrain.f32'),b);
const {zones,roads,props,terrainEdits,playerStart}=BUILTIN_WORLD;
const manifest={
 version:1,source:'levy-street/world-of-claudecraft',commit:'9b57e49c9676d75962700f828cc00a50a9a988b5',
 seed:WORLD_SEED,waterLevel:WATER_LEVEL,
 bounds:{x0,z0,x1,z1,width,depth,step:STEP},
 heightFile:'terrain.f32',heightSHA256:createHash('sha256').update(b).digest('hex'),
 zones,roads,terrainEdits,playerStart,
 // Preserve original prop coordinate metadata, but NEVER ship a media object unless independently allowlisted.
 propCoordinates:props
};
fs.writeFileSync(path.join(OUT,'world.json'),JSON.stringify(manifest));
console.log('WORLD_REAL_SOURCE',JSON.stringify({width,depth,zoneCount:zones.length,roads:roads.length,size:b.length,seed:WORLD_SEED}));
