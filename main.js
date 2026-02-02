// ═══════════════════════════════════════════════════════
//  HERO CANVAS — floating particles + ambient geometry
// ═══════════════════════════════════════════════════════
(function heroScene(){
  const canvas = document.getElementById('hero-canvas');
  const scene   = new THREE.Scene();
  const camera  = new THREE.PerspectiveCamera(60, canvas.clientWidth/canvas.clientHeight, .1, 1000);
  camera.position.z = 28;

  const renderer = new THREE.WebGLRenderer({canvas, alpha:true, antialias:true});
  renderer.setPixelRatio(Math.min(window.devicePixelRatio,2));
  renderer.setSize(canvas.clientWidth, canvas.clientHeight);

  // --- Particles ---
  const pCount = 220;
  const pGeo = new THREE.BufferGeometry();
  const pPos = new Float32Array(pCount*3);
  const pVel = [];
  for(let i=0;i<pCount;i++){
    pPos[i*3]   = (Math.random()-0.5)*50;
    pPos[i*3+1] = (Math.random()-0.5)*40;
    pPos[i*3+2] = (Math.random()-0.5)*20 - 5;
    pVel.push({x:(Math.random()-.5)*.004, y:(Math.random()-.5)*.004, z:(Math.random()-.5)*.002});
  }
  pGeo.setAttribute('position', new THREE.BufferAttribute(pPos,3));
  const pMat = new THREE.PointsMaterial({color:0x4a5068, size:.12, transparent:true, opacity:.6});
  scene.add(new THREE.Points(pGeo, pMat));

  // --- Central abstract wireframe torus knot ---
  const kGeo = new THREE.TorusKnotGeometry(4.2, 1.1, 140, 18);
  const kMat = new THREE.MeshPhongMaterial({
    color:0x6366f1, wireframe:true, transparent:true, opacity:.18,
    emissive:0x4338ca, emissiveIntensity:.4
  });
  const knot = new THREE.Mesh(kGeo, kMat);
  scene.add(knot);

  // --- Ambient light + directional ---
  scene.add(new THREE.AmbientLight(0xffffff, .3));
  const dLight = new THREE.DirectionalLight(0x8b5cf6, .8);
  dLight.position.set(5,10,10);
  scene.add(dLight);

  // --- Mouse reactive ---
  let mx=0, my=0;
  window.addEventListener('mousemove', e=>{
    mx = (e.clientX/window.innerWidth - .5)*2;
    my = (e.clientY/window.innerHeight - .5)*2;
  });

  let t=0;
  function animate(){
    requestAnimationFrame(animate);
    t += .005;

    // Rotate knot
    knot.rotation.x += .003;
    knot.rotation.y += .006;
    knot.rotation.z += .002;
    // subtle mouse parallax on knot
    knot.position.x += (mx*1.5 - knot.position.x)*.02;
    knot.position.y += (-my*1.2 - knot.position.y)*.02;
    knot.scale.setScalar(1 + Math.sin(t)*0.04);

    // Move particles
    const pos = pGeo.attributes.position.array;
    for(let i=0;i<pCount;i++){
      pos[i*3]   += pVel[i].x;
      pos[i*3+1] += pVel[i].y;
      pos[i*3+2] += pVel[i].z;
      // wrap
      if(pos[i*3]> 25) pos[i*3]=-25;
      if(pos[i*3]<-25) pos[i*3]= 25;
      if(pos[i*3+1]> 20) pos[i*3+1]=-20;
      if(pos[i*3+1]<-20) pos[i*3+1]= 20;
    }
    pGeo.attributes.position.needsUpdate = true;

    renderer.render(scene, camera);
  }
  animate();

  // resize
  function onResize(){
    const w=canvas.clientWidth, h=canvas.clientHeight;
    camera.aspect=w/h; camera.updateProjectionMatrix();
    renderer.setSize(w,h);
  }
  window.addEventListener('resize', onResize);
})();


// ═══════════════════════════════════════════════════════
//  DASHBOARD CHART — canvas 2D line chart
// ═══════════════════════════════════════════════════════
(function drawChart(){
  const canvas = document.getElementById('main-chart');
  const ctx    = canvas.getContext('2d');
  // wait for layout
  requestAnimationFrame(()=>{
    const rect = canvas.parentElement.getBoundingClientRect();
    canvas.width  = rect.width - 40;
    canvas.height = 130;
    canvas.style.width  = canvas.width+'px';
    canvas.style.height = canvas.height+'px';

    const W = canvas.width, H = canvas.height;
    const pad = {t:10,r:10,b:24,l:36};
    const cw = W - pad.l - pad.r;
    const ch = H - pad.t - pad.b;

    // data sets
    const labels = ['1','5','10','15','20','25','30'];
    const data1  = [12,18,15,22,28,25,32]; // purple
    const data2  = [8,10,14,16,20,22,24];  // teal
    const data3  = [5,7,9,11,14,16,19];    // pink

    const xScale = i => pad.l + (i/(labels.length-1))*cw;
    const yScale = v => pad.t + ch - ((v-0)/(36-0))*ch;

    // clear
    ctx.clearRect(0,0,W,H);

    // grid lines
    ctx.strokeStyle='rgba(255,255,255,.04)';
    ctx.lineWidth=.8;
    for(let i=0;i<=4;i++){
      const y = pad.t + (ch/4)*i;
      ctx.beginPath(); ctx.moveTo(pad.l,y); ctx.lineTo(W-pad.r,y); ctx.stroke();
    }

    // x labels
    ctx.fillStyle='#3a3f52'; ctx.font='9px sans-serif'; ctx.textAlign='center';
    labels.forEach((l,i)=>{ ctx.fillText(l, xScale(i), H-pad.b+14); });

    function drawLine(data, color, fill){
      // gradient fill
      if(fill){
        const grad = ctx.createLinearGradient(0, pad.t, 0, H-pad.b);
        grad.addColorStop(0, fill);
        grad.addColorStop(1, 'rgba(0,0,0,0)');
        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.moveTo(xScale(0), yScale(data[0]));
        data.forEach((v,i)=>ctx.lineTo(xScale(i), yScale(v)));
        ctx.lineTo(xScale(data.length-1), H-pad.b);
        ctx.lineTo(xScale(0), H-pad.b);
        ctx.closePath();
        ctx.fill();
      }
      // line
      ctx.strokeStyle = color;
      ctx.lineWidth = 1.8;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      ctx.beginPath();
      data.forEach((v,i)=>{ i===0?ctx.moveTo(xScale(i),yScale(v)):ctx.lineTo(xScale(i),yScale(v)); });
      ctx.stroke();
    }

    drawLine(data1, '#6366f1', 'rgba(99,102,241,.12)');
    drawLine(data2, '#14b8a6', 'rgba(20,184,166,.08)');
    drawLine(data3, '#ec4899', 'rgba(236,72,153,.08)');
  });
})();


// ═══════════════════════════════════════════════════════
//  SIGNATURE SECTION — 3D icosahedron with mouse interaction
// ═══════════════════════════════════════════════════════
(function sigScene(){
  const wrap  = document.getElementById('sig-3d-wrap');
  const scene = new THREE.Scene();
  const camera= new THREE.PerspectiveCamera(50, 1, .1, 100);
  camera.position.z = 9;

  const renderer = new THREE.WebGLRenderer({alpha:true, antialias:true});
  renderer.setPixelRatio(Math.min(window.devicePixelRatio,4));
  renderer.setSize(320,320);
  wrap.appendChild(renderer.domElement);

  // Icosahedron wireframe
  const geo = new THREE.IcosahedronGeometry(3, 1);
  const edges = new THREE.EdgesGeometry(geo);
  const mat = new THREE.LineBasicMaterial({
    color:0x6366f1, transparent:true, opacity:.55
  });
  const wireframe = new THREE.LineSegments(edges, mat);
  scene.add(wireframe);

  // Solid subtle inner
  const solidMat = new THREE.MeshPhongMaterial({
    color:0x1a1d2e, transparent:true, opacity:.6,
    shininess:80, specular:0x444466
  });
  const solid = new THREE.Mesh(geo, solidMat);
  scene.add(solid);

  // Vertex glow points
  const pts = new THREE.BufferGeometry();
  const positions = geo.attributes.position.array;
  pts.setAttribute('position', new THREE.BufferAttribute(positions.slice(),3));
  const ptMat = new THREE.PointsMaterial({color:0x818cf8, size:.2, transparent:true, opacity:.7});
  scene.add(new THREE.Points(pts, ptMat));

  // Lighting
  scene.add(new THREE.AmbientLight(0xffffff,.4));
  const dl = new THREE.DirectionalLight(0x8b5cf6, .9);
  dl.position.set(5,8,6);
  scene.add(dl);
  const dl2 = new THREE.DirectionalLight(0x6366f1, .5);
  dl2.position.set(-4,-3,2);
  scene.add(dl2);

  // Mouse / scroll reactive
  let mx=0, my=0, scrollY=0;
  const section = document.getElementById('signature');
  window.addEventListener('mousemove', e=>{
    const r = section.getBoundingClientRect();
    if(r.top < window.innerHeight && r.bottom > 0){
      mx = ((e.clientX - r.left)/r.width - .5)*2;
      my = ((e.clientY - r.top)/r.height - .5)*2;
    }
  });
  window.addEventListener('scroll', ()=>{ scrollY = window.scrollY; });

  let t=0;
  function animate(){
    requestAnimationFrame(animate);
    t+=.008;

    // Rotate base
    wireframe.rotation.x = t*0.4 + my*.3;
    wireframe.rotation.y = t*0.6 + mx*.4;
    solid.rotation.copy(wireframe.rotation);

    // Pulse scale
    const s = 1 + Math.sin(t*2)*.03;
    wireframe.scale.setScalar(s);
    solid.scale.setScalar(s);

    // Morph: slightly displace vertices on scroll
    const sectionTop = section.getBoundingClientRect().top;
    const progress = Math.max(0, Math.min(1, 1 - sectionTop/window.innerHeight));
    const basePos = geo.attributes.position.array;
    const curPos  = pts.attributes.position.array;
    for(let i=0;i<curPos.length;i+=3){
      const ox=basePos[i], oy=basePos[i+1], oz=basePos[i+2];
      const noise = Math.sin(t*3+i)*0.08*progress;
      curPos[i]   = ox + noise;
      curPos[i+1] = oy + Math.cos(t*2+i)*.08*progress;
      curPos[i+2] = oz + Math.sin(t*1.5+i)*.06*progress;
    }
    pts.attributes.position.needsUpdate=true;

    // Wireframe opacity pulse
    mat.opacity = .45 + Math.sin(t*1.5)*.1;

    renderer.render(scene, camera);
  }
  animate();
})();


// ═══════════════════════════════════════════════════════
//  CTA SECTION — starfield / nebula canvas
// ═══════════════════════════════════════════════════════
(function ctaStars(){
  const canvas = document.getElementById('cta-canvas');
  const section = document.getElementById('cta-section');
  const scene  = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(60,1,0.1,400);
  camera.position.z = 30;

  const renderer = new THREE.WebGLRenderer({canvas, alpha:true, antialias:true});
  renderer.setPixelRatio(Math.min(window.devicePixelRatio,2));

  function resize(){
    const w=section.clientWidth, h=section.clientHeight;
    camera.aspect=w/h; camera.updateProjectionMatrix();
    renderer.setSize(w,h);
  }
  resize();

  // Stars
  const starCount = 300;
  const starGeo = new THREE.BufferGeometry();
  const starPos = new Float32Array(starCount*3);
  for(let i=0;i<starCount;i++){
    starPos[i*3]   = (Math.random()-0.5)*60;
    starPos[i*3+1] = (Math.random()-0.5)*40;
    starPos[i*3+2] = (Math.random()-0.5)*30 - 10;
  }
  starGeo.setAttribute('position', new THREE.BufferAttribute(starPos,3));
  const starMat = new THREE.PointsMaterial({color:0xffffff, size:.08, transparent:true, opacity:.4});
  scene.add(new THREE.Points(starGeo, starMat));

  // Nebula glow — large transparent spheres
  const nebMat = new THREE.MeshBasicMaterial({color:0x6366f1, transparent:true, opacity:.015});
  const neb1 = new THREE.Mesh(new THREE.SphereGeometry(12,16,16), nebMat);
  neb1.position.set(-5, -3, -5);
  scene.add(neb1);
  const nebMat2 = new THREE.MeshBasicMaterial({color:0x8b5cf6, transparent:true, opacity:.01});
  const neb2 = new THREE.Mesh(new THREE.SphereGeometry(10,16,16), nebMat2);
  neb2.position.set(6, 2, -8);
  scene.add(neb2);

  let t=0;
  function animate(){
    requestAnimationFrame(animate);
    t+=.003;
    // gentle drift
    neb1.rotation.y += .002;
    neb2.rotation.y -= .0015;
    // star twinkle via opacity
    starMat.opacity = .3 + Math.sin(t*2)*.1;
    renderer.render(scene, camera);
  }
  animate();
  window.addEventListener('resize', resize);
})();


// ═══════════════════════════════════════════════════════
//  NAV scroll effect — tint bg on scroll
// ═══════════════════════════════════════════════════════
window.addEventListener('scroll', ()=>{
  const nav = document.querySelector('nav');
  if(window.scrollY > 40){
    nav.style.background = 'rgba(10,12,20,.92)';
  } else {
    nav.style.background = 'rgba(10,12,20,.7)';
  }
});

// ═══════════════════════════════════════════════════════
//  DASHBOARD NAV TABS — click switching
// ═══════════════════════════════════════════════════════
document.querySelectorAll('.dash-nav-item').forEach(item=>{
  item.addEventListener('click', ()=>{
    document.querySelectorAll('.dash-nav-item').forEach(i=>i.classList.remove('active'));
    item.classList.add('active');
  });
});