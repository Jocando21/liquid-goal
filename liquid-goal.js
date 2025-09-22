export default class LiquidGoal {
  constructor(target, options = {}) {
    this.el = target instanceof HTMLCanvasElement ? target : null;
    this.container = this.el ? this.el.parentElement : target;
    if (!this.el) {
      this.el = document.createElement('canvas');
      this.container.appendChild(this.el);
      this.el.style.width = '100%';
      this.el.style.height = '100%';
      this.el.style.display = 'block';
    }
    this.ctx = this.el.getContext('2d');
    this.dpr = Math.max(1, window.devicePixelRatio || 1);
    this.P = new Uint8Array(512);
    const p0 = new Uint8Array(256);
    for (let i = 0; i < 256; i++) p0[i] = i;
    for (let i = 255; i > 0; i--) { const j = (Math.random() * (i + 1)) | 0; const t = p0[i]; p0[i] = p0[j]; p0[j] = t; }
    for (let i = 0; i < 512; i++) this.P[i] = p0[i & 255];

    const def = {
      goal: 100,
      value: 0,
      k: 12,
      c: 9,
      turbulence: 1.0,
      wave: 1.0,
      lumps: 0.6,
      xspeed: 30,
      parallax: 0.35,
      backLift: 10,
      gradientFrom: '#7a0a10',
      gradientTo: '#3a0003',
      gradientAngle: 90,
      radius: 20,
      norm100: 1.2,
      autoResize: true
    };
    this.opt = { ...def, ...options };
    this.state = {
      level: this.opt.value,
      vel: 0,
      t: 0,
      offBack: 0,
      offFront: 0,
      running: true
    };

    this._onResize = () => this.resize();
    if (this.opt.autoResize) window.addEventListener('resize', this._onResize);
    this.resize();
    this._last = performance.now();
    this._raf = requestAnimationFrame((ts) => this._loop(ts));
  }

  setOptions(patch = {}) { Object.assign(this.opt, patch); }
  setGoal(n) { this.opt.goal = Math.max(0, Number(n) || 0); }
  setProgress(v) { this.opt.value = Math.max(0, Number(v) || 0); }
  updateProgress(d) { this.setProgress((this.opt.value || 0) + (Number(d) || 0)); }
  getDisplayedPercent() { const capped = Math.min(this.state.level, this.opt.goal * this.opt.norm100); return Math.round((capped / (this.opt.goal * this.opt.norm100)) * 100);}
  play() { if (!this.state.running) { this.state.running = true; this._last = performance.now(); this._raf = requestAnimationFrame((ts) => this._loop(ts)); } }
  pause() { this.state.running = false; if (this._raf) cancelAnimationFrame(this._raf); }
  destroy() { this.pause(); window.removeEventListener('resize', this._onResize); }

  resize() {
    const r = this.el.getBoundingClientRect();
    this.el.width = Math.max(2, Math.floor(r.width * this.dpr));
    this.el.height = Math.max(2, Math.floor(r.height * this.dpr));
  }

  _fade(t){return t*t*t*(t*(t*6-15)+10)}
  _lerp(a,b,t){return a+(b-a)*t}
  _clamp(n,a,b){return Math.max(a,Math.min(b,n))}
  _grad(h,x,y){const u=h&1?x:-x,v=h&2?y:-y;return u+v}
  _n2(x,y){
    const P=this.P;
    const X=Math.floor(x)&255,Y=Math.floor(y)&255;
    const xf=x-Math.floor(x), yf=y-Math.floor(y);
    const tl=P[X+P[Y]], tr=P[X+1+P[Y]], bl=P[X+P[Y+1]], br=P[X+1+P[Y+1]];
    const u=this._fade(xf), v=this._fade(yf);
    const x1=this._lerp(this._grad(tl,xf,yf),this._grad(tr,xf-1,yf),u);
    const x2=this._lerp(this._grad(bl,xf,yf-1),this._grad(br,xf-1,yf-1),u);
    return this._lerp(x1,x2,v);
  }
  _fbm(x,y,o=4,l=0.5){let a=0,amp=1,f=1;for(let i=0;i<o;i++){a+=this._n2(x*f,y*f)*amp;f*=2;amp*=l}return a}

  _clipRoundedRect(x,y,w,h,r){
    const ctx=this.ctx, rr=Math.min(r,w/2,h/2);
    ctx.beginPath();
    ctx.moveTo(x+rr,y);
    ctx.arcTo(x+w,y,x+w,y+h,rr);
    ctx.arcTo(x+w,y+h,x,y+h,rr);
    ctx.arcTo(x,y+h,x,y,rr);
    ctx.arcTo(x,y,x+w,y,rr);
    ctx.closePath();
  }

  _makeLinearGradient(w,h,deg,c1,c2){
    const ctx=this.ctx, rad=(deg%360)*Math.PI/180;
    const vx=Math.cos(rad), vy=Math.sin(rad);
    const cx=w/2, cy=h/2, L=Math.abs(w*vx)+Math.abs(h*vy);
    const x0=cx-vx*L/2, y0=cy-vy*L/2, x1=cx+vx*L/2, y1=cy+vy*L/2;
    const g=ctx.createLinearGradient(x0,y0,x1,y1);
    g.addColorStop(0,c1); g.addColorStop(1,c2);
    return g;
  }

  _shade(hex, amt){
    const c = hex.replace('#',''); const n = parseInt(c,16);
    let r=(n>>16)&255, g=(n>>8)&255, b=n&255;
    const clamp = (v)=>Math.max(0,Math.min(255,v|0));
    r=clamp(r*(1+amt)); g=clamp(g*(1+amt)); b=clamp(b*(1+amt));
    return '#'+(((r<<16)|(g<<8)|b)>>>0).toString(16).padStart(6,'0');
  }

  _drawLayer(levelY, amp, grad, alpha, nxOffset){
    const ctx=this.ctx, w=this.el.width, h=this.el.height, dpr=this.dpr, s=this.state, o=this.opt;
    const freqScale=1+(o.turbulence-1)*0.8;
    const sx=0.006*dpr*freqScale, ty=0.7*o.turbulence;
    ctx.globalAlpha=alpha;
    ctx.fillStyle=grad;
    ctx.beginPath();
    ctx.moveTo(0,h);
    ctx.lineTo(0,levelY);
    const step=Math.max(1,(w/360)|0);
    for(let x=0;x<=w;x+=step){
      const nx=(x+nxOffset)*sx;
      const warp=this._fbm(nx*0.45+2.7, s.t*0.23+1.1, 3, 0.6)*o.lumps*0.7;
      const y= levelY
        + this._fbm(nx+warp, s.t*ty, 5, 0.55)*amp*0.70
        + this._fbm(nx*1.9+10.3+warp*0.8, s.t*ty*0.63+3.7, 3, 0.6)*amp*0.35
        + this._fbm(nx*3.3-5.1+warp*1.2, s.t*ty*0.41+1.1, 2, 0.6)*amp*0.15;
      ctx.lineTo(x,y);
    }
    ctx.lineTo(w,h);
    ctx.closePath();
    ctx.fill();
    ctx.globalAlpha=1;
  }

  _draw() {
    const ctx=this.ctx, w=this.el.width, h=this.el.height, dpr=this.dpr, s=this.state, o=this.opt;
    ctx.clearRect(0,0,w,h);
    this._clipRoundedRect(0,0,w,h,o.radius*dpr);
    ctx.save(); ctx.clip();

    const bg=this._makeLinearGradient(w,h,90,'#150b10','#0e0a0d');
    ctx.fillStyle=bg; ctx.fillRect(0,0,w,h);

    const pRaw = o.goal<=0 ? 0 : s.level/(o.goal*o.norm100);
    const p = Math.max(0, pRaw);
    const base = this._lerp(h*0.96, h*0.06, p);
    const vnorm = this._clamp(Math.abs(s.vel)/(o.goal||1),0,1);
    const amp = h*(0.02 + vnorm*0.12)*o.wave;

    const backGrad=this._makeLinearGradient(w,h,o.gradientAngle,this._shade(o.gradientFrom,-0.25),this._shade(o.gradientTo,-0.25));
    const frontGrad=this._makeLinearGradient(w,h,o.gradientAngle,o.gradientFrom,o.gradientTo);

    this._drawLayer(base - o.backLift*dpr, amp*0.88, backGrad, 0.95, s.offBack);
    this._drawLayer(base, amp, frontGrad, 1.00, s.offFront);

    ctx.restore();
  }

  _step(dt){
    const s=this.state, o=this.opt;
    const target=Math.max(0,o.value);
    const a=o.k*(target-s.level)-o.c*s.vel;
    s.vel+=a*dt;
    s.level+=s.vel*dt;
    s.t+=dt;
    s.offFront += o.xspeed * this.dpr * dt;
    s.offBack  += o.xspeed * this.dpr * dt * (1 - o.parallax);
  }

  _loop(now){
    if (!this.state.running) return;
    const dt=Math.min(0.05,(now-this._last)/1000); this._last=now;
    this._step(dt);
    this._draw();
    this._raf = requestAnimationFrame((ts)=>this._loop(ts));
  }
}
