
/* Real, immutable World of ClaudeCraft height samples; no independent noise algorithm. */
let source=null,values=null;
export async function loadOriginalWorld(){
 const base=import.meta.env.BASE_URL;
 const [info,heights]=await Promise.all([
   fetch(base+'genesis/world.json',{cache:'no-cache'}),
   fetch(base+'genesis/terrain.f32',{cache:'no-cache'})
 ]);
 if(!info.ok||!heights.ok)throw Error('No se pudo descargar el mundo original');
 const manifest=await info.json(),array=new Float32Array(await heights.arrayBuffer());
 if(manifest.version!==1||array.length!==manifest.bounds.width*manifest.bounds.depth)throw Error('Datos de relieve originales incompletos');
 source=manifest;values=array;
 return manifest;
}
export function originalBounds(){return source?.bounds??null}
export function originalHeight(x,z){
 if(!values||!source)return null;
 const {x0,z0,step,width,depth}=source.bounds;
 const px=(x-x0)/step,pz=(z-z0)/step;
 if(px<0||pz<0||px>width-1||pz>depth-1)return null;
 const i=Math.min(width-2,Math.floor(px)),j=Math.min(depth-2,Math.floor(pz)),u=px-i,v=pz-j;
 const a=values[j*width+i],b=values[j*width+i+1],c=values[(j+1)*width+i],d=values[(j+1)*width+i+1];
 return (a*(1-u)+b*u)*(1-v)+(c*(1-u)+d*u)*v;
}
