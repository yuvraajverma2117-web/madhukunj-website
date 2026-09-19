/**
 * Dependency-free WebGL cake studio.
 * All mesh geometry is authored here: lathed sponge/icing, piped cream and berries.
 * No CDN, downloaded model, motion sensor permission or external asset is needed.
 */
const TAU=Math.PI*2;
const rgb=hex=>[1,3,5].map(i=>parseInt(hex.slice(i,i+2),16)/255);
const flavours={
  Chocolate:{body:'#71402e',top:'#51291e',cream:'#e9c7a4',fruit:'#bd3026'},
  Pineapple:{body:'#edce82',top:'#f5dd92',cream:'#fff1d8',fruit:'#e7ad32'},
  Strawberry:{body:'#dc8f94',top:'#f2b7b6',cream:'#fff0dd',fruit:'#d83b43'},
  Mango:{body:'#e7a041',top:'#f4bd4a',cream:'#fff1d5',fruit:'#ef8a22'},
  Butterscotch:{body:'#be814a',top:'#d99f58',cream:'#fff0d5',fruit:'#9c602f'},
};
export function lathe(profile,color,segments=64,offset=[0,0,0]) {
  const vertices=[];
  const point=(radius,y,angle)=>[offset[0]+radius*Math.cos(angle),offset[1]+y,offset[2]+radius*Math.sin(angle)];
  const push=(p,n)=>vertices.push(...p,...n,...color);
  for(let j=0;j<profile.length-1;j++){
    const [r0,y0]=profile[j],[r1,y1]=profile[j+1],dr=r1-r0,dy=y1-y0;
    const length=Math.hypot(dr,dy)||1;
    for(let i=0;i<segments;i++){
      const a=i/segments*TAU,b=(i+1)/segments*TAU;
      const na=[dy/length*Math.cos(a),-dr/length,dy/length*Math.sin(a)];
      const nb=[dy/length*Math.cos(b),-dr/length,dy/length*Math.sin(b)];
      const p0=point(r0,y0,a),p1=point(r0,y0,b),p2=point(r1,y1,b),p3=point(r1,y1,a);
      push(p0,na);push(p1,nb);push(p2,nb);push(p0,na);push(p2,nb);push(p3,na);
    }
  }
  return vertices;
}
function sphere(center,scale,color,segments=16,rings=10) {
  const vertices=[];
  const p=(a,b)=>{
    const n=[Math.sin(b)*Math.cos(a),Math.cos(b),Math.sin(b)*Math.sin(a)];
    return [...center.map((v,i)=>v+n[i]*scale[i]),...n,...color];
  };
  for(let j=0;j<rings;j++)for(let i=0;i<segments;i++){
    const a=i/segments*TAU,b=(i+1)/segments*TAU,c=j/rings*Math.PI,d=(j+1)/rings*Math.PI;
    vertices.push(...p(a,c),...p(b,c),...p(b,d),...p(a,c),...p(b,d),...p(a,d));
  }
  return vertices;
}
export function cakeGeometry(flavour='Chocolate') {
  const palette=flavours[flavour]||flavours.Chocolate;
  const cream=rgb(palette.cream),data=[];
  const append=arr=>{for(const n of arr)data.push(n);};
  append(lathe([[0,-.18],[1.68,-.18],[1.8,-.12],[1.86,-.04],[1.85,0],[1.69,.04],[0,.04]],rgb('#e5b76e')));
  append(lathe([[0,.04],[1.38,.04],[1.46,.1],[1.48,.22],[1.48,1.02],[1.44,1.13],[0,1.13]],rgb(palette.body)));
  // Two thin cream seams, between sponge layers.
  for(const y of [.36,.72])append(lathe([[1.482,y],[1.485,y+.045]],cream));
  append(lathe([[0,1.08],[1.47,1.08],[1.49,1.16],[1.46,1.23],[1.35,1.27],[0,1.27]],rgb(palette.top)));
  // Deliberately irregular ganache drips.
  for(let i=0;i<21;i++){
    const a=i/21*TAU,r=1.466;
    append(sphere([Math.cos(a)*r,1.08-(i%3)*.06,Math.sin(a)*r],[.06,.1+(i%3)*.07,.06],rgb(palette.top),8,6));
  }
  for(let i=0;i<12;i++){
    const a=i/12*TAU,r=1.13,x=Math.cos(a)*r,z=Math.sin(a)*r;
    append(lathe([[0,0],[.12,0],[.17,.06],[.14,.13],[.15,.18],[.11,.23],[.09,.29],[0,.35]],cream,20,[x,1.27,z]));
    if(i%2===0){
      append(sphere([x,1.64,z],[.095,.11,.095],rgb(palette.fruit),12,8));
      append(lathe([[.012,0],[.009,.09]],rgb('#5d733b'),6,[x,1.71,z]));
    }
  }
  // Crumb/sprinkle rosette; deterministic so screenshots and re-renders agree.
  for(let i=0;i<36;i++){
    const a=i*2.399963,r=.2+Math.sqrt(i/36)*.56;
    append(sphere([Math.cos(a)*r,1.285,Math.sin(a)*r],[.03,.017,.06],i%3?cream:rgb(palette.fruit),6,4));
  }
  // Small piped border around the base.
  for(let i=0;i<40;i++){
    const a=i/40*TAU;
    append(sphere([Math.cos(a)*1.46,.11,Math.sin(a)*1.46],[.09,.065,.09],cream,8,5));
  }
  return new Float32Array(data);
}
const vertexSource=`
attribute vec3 aPosition;
attribute vec3 aNormal;
attribute vec3 aColor;
uniform float uAngle;
uniform float uTilt;
uniform float uAspect;
uniform float uScale;
varying vec3 vNormal;
varying vec3 vColor;
varying vec3 vPosition;
vec3 rotate(vec3 p){
  float s=sin(uAngle),c=cos(uAngle);
  vec3 q=vec3(c*p.x+s*p.z,p.y,-s*p.x+c*p.z);
  s=sin(uTilt);c=cos(uTilt);
  return vec3(q.x,c*q.y-s*q.z,s*q.y+c*q.z);
}
void main(){
  vec3 p=rotate(aPosition-vec3(0.0,0.62,0.0));
  vPosition=p;
  vNormal=rotate(aNormal);
  vColor=aColor;
  gl_Position=vec4(p.x*uScale/uAspect,p.y*uScale,-p.z/12.0,1.0);
}`;
const fragmentSource=`
precision mediump float;
varying vec3 vNormal;
varying vec3 vColor;
varying vec3 vPosition;
void main(){
  vec3 normal=normalize(vNormal);
  vec3 light=normalize(vec3(-0.6,1.2,1.5));
  float diffuse=max(dot(normal,light),0.0);
  float fill=max(dot(normal,normalize(vec3(1.0,0.25,-0.5))),0.0)*0.16;
  float spec=pow(max(dot(reflect(-light,normal),vec3(0.0,0.0,1.0)),0.0),28.0)*0.17;
  vec3 colour=vColor*(0.46+diffuse*0.60+fill)+vec3(spec);
  gl_FragColor=vec4(colour,1.0);
}`;
export function createCakeScene(canvas,{paused=false}={}) {
  const gl=canvas.getContext('webgl',{antialias:true,alpha:true,powerPreference:'low-power'});
  if(!gl)throw new Error('WebGL unavailable');
  function compile(type,source){
    const shader=gl.createShader(type);gl.shaderSource(shader,source);gl.compileShader(shader);
    if(!gl.getShaderParameter(shader,gl.COMPILE_STATUS)){const info=gl.getShaderInfoLog(shader);gl.deleteShader(shader);throw new Error(info);}
    return shader;
  }
  const program=gl.createProgram();
  const vert=compile(gl.VERTEX_SHADER,vertexSource),frag=compile(gl.FRAGMENT_SHADER,fragmentSource);
  gl.attachShader(program,vert);gl.attachShader(program,frag);gl.linkProgram(program);
  if(!gl.getProgramParameter(program,gl.LINK_STATUS))throw new Error('Unable to initialise 3D');
  gl.deleteShader(vert);gl.deleteShader(frag);
  const buffer=gl.createBuffer();gl.useProgram(program);gl.bindBuffer(gl.ARRAY_BUFFER,buffer);
  ['aPosition','aNormal','aColor'].forEach((name,i)=>{
    const loc=gl.getAttribLocation(program,name);gl.enableVertexAttribArray(loc);gl.vertexAttribPointer(loc,3,gl.FLOAT,false,36,i*12);
  });
  const uniform=Object.fromEntries(['uAngle','uTilt','uAspect','uScale'].map(name=>[name,gl.getUniformLocation(program,name)]));
  let angle=-.45,tilt=.40,size=1,count=0,frame=0,visible=false,drag=null,last=0,destroyed=false;
  gl.enable(gl.DEPTH_TEST);gl.clearColor(0,0,0,0);
  function draw(){
    if(destroyed)return;
    gl.viewport(0,0,canvas.width,canvas.height);gl.clear(gl.COLOR_BUFFER_BIT|gl.DEPTH_BUFFER_BIT);
    gl.uniform1f(uniform.uAngle,angle);gl.uniform1f(uniform.uTilt,tilt);
    gl.uniform1f(uniform.uAspect,canvas.width/canvas.height);
    gl.uniform1f(uniform.uScale,.48*Math.min(1,canvas.width/canvas.height)*size);
    gl.drawArrays(gl.TRIANGLES,0,count);
    canvas.dataset.angle=angle.toFixed(3);
  }
  function tick(time){
    frame=0;
    if(destroyed||paused||!visible||document.hidden||drag){last=0;return;}
    if(last)angle+=Math.min(time-last,50)*.00012;
    last=time;draw();frame=requestAnimationFrame(tick);
  }
  function sync(){
    cancelAnimationFrame(frame);frame=0;last=0;
    if(!destroyed&&!paused&&visible&&!document.hidden&&!drag)frame=requestAnimationFrame(tick);
    draw();
  }
  function resize(){
    const ratio=Math.min(devicePixelRatio||1,1.7),rect=canvas.getBoundingClientRect();
    canvas.width=Math.max(1,Math.round(rect.width*ratio));canvas.height=Math.max(1,Math.round(rect.height*ratio));draw();
  }
  function setFlavour(flavour){
    const data=cakeGeometry(flavour);count=data.length/9;
    gl.bindBuffer(gl.ARRAY_BUFFER,buffer);gl.bufferData(gl.ARRAY_BUFFER,data,gl.STATIC_DRAW);
    canvas.dataset.flavour=flavour;draw();
  }
  const observer=new IntersectionObserver(entries=>{visible=entries[0].isIntersecting;sync();});
  observer.observe(canvas);
  const resizeObserver=new ResizeObserver(resize);resizeObserver.observe(canvas);
  document.addEventListener('visibilitychange',sync);
  canvas.addEventListener('pointerdown',event=>{
    drag={x:event.clientX,y:event.clientY,angle,tilt,id:event.pointerId};
    canvas.setPointerCapture(event.pointerId);sync();
  });
  canvas.addEventListener('pointermove',event=>{
    if(!drag)return;
    angle=drag.angle+(event.clientX-drag.x)*.013;
    tilt=Math.max(.15,Math.min(.85,drag.tilt+(event.clientY-drag.y)*.004));
    draw();
  });
  const stop=()=>{drag=null;sync();};
  canvas.addEventListener('pointerup',stop);canvas.addEventListener('pointercancel',stop);
  canvas.addEventListener('lostpointercapture',stop);
  canvas.addEventListener('keydown',event=>{
    if(!['ArrowLeft','ArrowRight','Home'].includes(event.key))return;
    event.preventDefault();angle=event.key==='Home'?-.45:angle+(event.key==='ArrowLeft'?-.2:.2);draw();
  });
  canvas.addEventListener('webglcontextlost',event=>{
    event.preventDefault();destroyed=true;cancelAnimationFrame(frame);
    observer.disconnect();resizeObserver.disconnect();document.removeEventListener('visibilitychange',sync);
    canvas.closest('.cake-stage').classList.add('no-webgl');
    document.querySelector('#cake-instructions').textContent='Illustrated preview · 3D unavailable';
    document.querySelectorAll('.scene-button').forEach(button=>button.disabled=true);
  });
  setFlavour('Chocolate');resize();sync();
  canvas.dataset.renderer='webgl';
  return {
    setFlavour,
    setSize(weight){size=.88+Math.min(2,Math.max(.5,weight))*.12;draw();},
    setPaused(value){paused=value;sync();},
    rotate(delta){angle+=delta;draw();},
    reset(){angle=-.45;tilt=.4;draw();},
  };
}
