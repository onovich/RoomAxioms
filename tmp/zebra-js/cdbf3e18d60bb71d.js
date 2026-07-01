(globalThis.TURBOPACK||(globalThis.TURBOPACK=[])).push(["object"==typeof document?document.currentScript:void 0,47440,e=>{"use strict";var t=e.i(69287),n=e.i(71317);let r=!1,i=!1;function a(e){if("undefined"==typeof document)return;if(r||window.adsbygoogle){r=!0;return}if(i)return;i=!0;let t=document.createElement("script");t.async=!0,t.crossOrigin="anonymous",t.src=`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${encodeURIComponent(e)}`,t.onload=()=>{r=!0},t.onerror=()=>{i=!1},document.head.appendChild(t)}let o=(0,n.createContext)(null);function l({apiOrigin:e,testMode:r=!1,forceAdblock:i,removeAdsClassName:l,children:s}){let c=(0,n.useMemo)(()=>{let t=e.indexOf("#"),n=t>=0?e.slice(t+1):"";if(!n)throw Error("AthenasProvider: apiOrigin must include the site slug as a hash fragment, e.g. https://athenas.brainzil.com/#puzzleship");return{apiOrigin:(t>=0?e.slice(0,t):e).replace(/\/$/,""),site:n,testMode:r,forceAdblock:i,removeAdsClassName:l,loadAdSense:a}},[e,r,i,l]);return(0,t.jsx)(o.Provider,{value:c,children:s})}function s(){let e=(0,n.useContext)(o);if(!e)throw Error("useAthenas must be called inside <AthenasProvider>. Wrap your app in the provider at the root.");return e}e.s(["AthenasProvider",()=>l,"useAthenas",()=>s])},82786,(e,t,n)=>{t.exports=e.r(3747)},72200,e=>{"use strict";var t=e.i(77563),n=e.i(69287),r=e.i(71317);let i=["--athenas-background","--athenas-border"],a=["--athenas-background","--athenas-foreground","--athenas-primary","--athenas-primary-foreground","--athenas-border","--athenas-cta","--athenas-cta-foreground"];function o(e,n){(0,r.useEffect)(()=>{t.default},[e,n])}let l="athenas-img",s=`
.${l} {
  display: block;
  width: 100%;
  height: 100%;
  background: var(--athenas-background);
  border: 1px solid var(--athenas-border);
  box-sizing: border-box;
  overflow: hidden;
}
.${l}__link {
  display: flex;
  width: 100%;
  height: 100%;
  align-items: center;
  justify-content: center;
}
.${l}__img {
  display: block;
  max-width: 100%;
  max-height: 100%;
  width: auto;
  height: auto;
  object-fit: contain;
}
`;function c({source:e}){let t=(0,r.useRef)(null);return o(t,i),(0,n.jsxs)(n.Fragment,{children:[(0,n.jsx)("style",{href:l,precedence:"default",children:s}),(0,n.jsx)("div",{ref:t,className:l,children:(0,n.jsx)("a",{className:`${l}__link`,href:e.click_url,target:"_blank",rel:"noopener sponsored",children:(0,n.jsx)("img",{className:`${l}__img`,src:e.image_url,srcSet:e.srcset,alt:e.alt_text})})})]})}let u="athenas-imgtxt",d=`
.${u} {
  container-type: size;
  width: 100%;
  height: 100%;
  overflow: hidden;
  background: var(--athenas-background);
  color: var(--athenas-foreground);
  border: 1px solid var(--athenas-border);
  box-sizing: border-box;
  font-family: inherit;
}
.${u}__link {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  gap: clamp(4px, 2cqmin, 12px);
  padding: clamp(8px, 4cqmin, 20px);
  width: 100%;
  height: 100%;
  box-sizing: border-box;
  text-decoration: none;
  color: inherit;
  overflow: hidden;
}
.${u}__img {
  display: block;
  aspect-ratio: 1 / 1;
  height: auto;
  width: min(100%, 45cqh);
  object-fit: contain;
  flex-shrink: 0;
}
.${u}__text {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: clamp(2px, 1cqmin, 8px);
  min-width: 0;
  width: 100%;
  overflow: hidden;
}
.${u}__title {
  font-weight: 700;
  line-height: 1.2;
  color: var(--athenas-primary);
  font-size: clamp(14px, min(8cqw, 6cqh), 32px);
  display: -webkit-box;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 2;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 100%;
}
.${u}__line {
  margin: 0;
  line-height: 1.3;
  font-size: clamp(11px, min(5.5cqw, 4.2cqh), 18px);
  display: -webkit-box;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 2;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 100%;
}
/* Default cap: only first 2 description lines render. Lines 3-4 are
   revealed by container queries below when the slot is tall enough. */
.${u}__line:nth-of-type(n+3) {
  display: none;
}
.${u}__cta {
  display: inline-block;
  padding: clamp(6px, 2.2cqmin, 12px) clamp(12px, 5cqmin, 28px);
  background: var(--athenas-cta);
  color: var(--athenas-cta-foreground);
  font-weight: 700;
  font-size: clamp(12px, min(4.8cqw, 3.6cqh), 20px);
  border-radius: clamp(4px, 1.5cqmin, 10px);
  line-height: 1.2;
  white-space: nowrap;
  max-width: 100%;
  overflow: hidden;
  text-overflow: ellipsis;
}

/* --- Wide + SHORT slots (leaderboard 728\xd790, mobile banner 320\xd750): 3-col
       grid, image left, text middle, CTA right. Not enough vertical room for
       title + description stacked, so we hide description lines and let the
       title fill its column.

       Col 1 is sized at 100cqh (= slot height) so it forms a square cell
       regardless of image intrinsic width. Without this the auto track
       would expand to the image's intrinsic 300px, eating ~half the slot
       width even though the image renders much smaller. --- */
@container (min-aspect-ratio: 2.0) and (max-height: 150px) {
  .${u}__link {
    display: grid;
    grid-template-columns: 100cqh minmax(0, 1fr) auto;
    grid-template-rows: 1fr;
    align-items: center;
    column-gap: clamp(8px, 4cqh, 16px);
    /* No outer padding — the image cell is exactly slot-height square so
       it fills the slot edge-to-edge. Some browsers resolve height:100%
       on a replaced element to the parent's padding-box rather than the
       grid cell's content-box, which makes a padded outer link push the
       image past the slot bottom by exactly the padding amount. CTA gets
       breathing room via padding-right on the link. */
    padding: 0 clamp(10px, 8cqh, 20px) 0 0;
  }
  .${u}__img {
    grid-column: 1;
    /* Override default aspect-ratio:1/1 — with width/height:100% on a
       non-square cell, the forced ratio makes the image render larger
       than the cell. object-fit:contain handles fit within the cell. */
    aspect-ratio: auto;
    width: 100%;
    height: 100%;
    max-width: 100%;
    max-height: 100%;
    min-width: 0;
    min-height: 0;
    object-fit: contain;
    box-sizing: border-box;
  }
  .${u}__text {
    grid-column: 2;
    align-items: center;
    text-align: center;
    width: 100%;
    min-width: 0;
    gap: 0;
    padding: clamp(4px, 4cqh, 12px) 0;
  }
  /* Tight line-heights so a title + 2 description lines stack within the
     slot's content area. Default 1.2 leaves no room at 50–90px slot heights;
     1.05 packs them just enough that useFitText's 0.3 maxHeightFraction
     leaves room for both. */
  .${u}__title {
    -webkit-line-clamp: 1;
    line-height: 1.05;
  }
  .${u}__line {
    -webkit-line-clamp: 1;
    line-height: 1.1;
  }
  /* When the creative ships exactly one description line, let it flow to
     2 visual rows so a longer single sentence reads naturally instead of
     being ellipsized at a slot's right edge. Multi-line creatives keep
     clamp:1 so each paragraph stays on its own row. */
  .${u}__line:only-of-type {
    -webkit-line-clamp: 2;
  }
  .${u}__cta {
    grid-column: 3;
    margin-top: 0;
    flex-shrink: 0;
  }
}

/* --- Wide + TALL slots (e.g. 800\xd7300 sidebar-tall): 2-col grid, image fills
       the left column, right column stacks title + description + CTA. The
       4-row template (spacer / text / cta / spacer) vertically centers the
       text+CTA stack as a unit while the image still spans full slot height
       via grid-row: 1 / -1. --- */
@container (min-aspect-ratio: 2.0) and (min-height: 151px) {
  .${u}__link {
    display: grid;
    /* Col 1 = slot height (square image cell). See wide-short note above. */
    grid-template-columns: 100cqh minmax(0, 1fr);
    grid-template-rows: 1fr auto auto 1fr;
    column-gap: clamp(12px, 4cqh, 24px);
    row-gap: clamp(4px, 2cqh, 12px);
    /* No outer padding — image fills the slot's left edge edge-to-edge.
       Right-side padding gives the text/CTA column breathing room. */
    padding: 0 clamp(8px, 4cqh, 20px) 0 0;
  }
  .${u}__img {
    grid-column: 1;
    grid-row: 1 / -1;
    /* See wide-short comment for aspect-ratio override rationale. */
    aspect-ratio: auto;
    width: 100%;
    height: 100%;
    max-width: 100%;
    max-height: 100%;
    min-width: 0;
    min-height: 0;
    object-fit: contain;
    box-sizing: border-box;
    align-self: center;
  }
  .${u}__text {
    grid-column: 2;
    grid-row: 2;
    align-items: center;
    text-align: center;
    width: 100%;
    min-width: 0;
    gap: clamp(2px, 1cqh, 6px);
  }
  .${u}__title {
    -webkit-line-clamp: 1;
  }
  .${u}__line {
    -webkit-line-clamp: 1;
  }
  /* Single-desc creatives flow to 3 visual rows here — wide-tall has
     more vertical room than wide-short, so the cap is higher. */
  .${u}__line:only-of-type {
    -webkit-line-clamp: 3;
  }
  .${u}__cta {
    grid-column: 2;
    grid-row: 3;
    /* Extra breathing room between the text block and the CTA button.
       Scales with slot height so taller bands get proportionally more
       space — capped so it doesn't run away on huge slots. */
    margin-top: clamp(6px, 3cqh, 20px);
    flex-shrink: 0;
    justify-self: center;
  }
}

/* --- Tall narrow slots: progressively reveal description lines 3 and 4 as
       vertical room allows. Scoped to non-wide slots (max-aspect-ratio: 1.99)
       so the wide-short / wide-tall layouts keep their tighter caps. The
       320px / 480px thresholds map roughly to "medium-tall" (e.g. 160\xd7600
       skyscraper) and "very tall" (e.g. 300\xd7600 half-page). --- */
@container (min-height: 320px) and (max-aspect-ratio: 1.99) {
  .${u}__line:nth-of-type(3) {
    display: -webkit-box;
  }
}
@container (min-height: 480px) and (max-aspect-ratio: 1.99) {
  .${u}__line:nth-of-type(4) {
    display: -webkit-box;
  }
}

`;function f(e){return e.split("\n").map(e=>e.trim()).filter(e=>e.length>0)}function h({source:e}){let t=f(e.body),i=(0,r.useRef)(null),l=(0,r.useRef)(null);o(i,a);let s=function(e,t,n,i={}){let a=i.min??10,o=i.max??64,l=i.minContainerAR??0,s=i.maxHeightFraction??1,[c,u]=(0,r.useState)(null);return(0,r.useEffect)(()=>{let n=e.current,r=t.current;if(!n||!r||"undefined"==typeof ResizeObserver)return;let i=!1,c=0,d=()=>{if(c=0,l>0&&r.clientHeight>0&&r.clientWidth/r.clientHeight<l){n.style.fontSize="",u(e=>null===e?e:null);return}let e=n.style.whiteSpace,t=n.style.overflow,i=n.style.display,d=n.style.width;n.style.whiteSpace="nowrap",n.style.overflow="visible",n.style.display="block",n.style.width="100%";let f=r.clientHeight,h=s<1&&f>0?Math.max(a,Math.floor(f*s)):o,p=a,m=Math.min(o,h),g=a,x=0;for(;p<=m;){let e=p+m>>1;n.style.fontSize=`${e}px`,x=n.clientWidth,n.scrollWidth<=n.clientWidth+1?(g=e,p=e+1):m=e-1}n.style.fontSize=`${g}px`,n.style.whiteSpace=e,n.style.overflow=t,n.style.display=i,n.style.width=d,n.setAttribute("data-fit-parent-width",String(x)),n.setAttribute("data-fit-wrapper",`${r.clientWidth}x${r.clientHeight}`),u(e=>e===g?e:g)},f=()=>{i||c||(c=requestAnimationFrame(d))};f();let h=new ResizeObserver(f);return h.observe(r),"undefined"!=typeof document&&document.fonts?.ready&&document.fonts.ready.then(f).catch(()=>{}),()=>{i=!0,c&&cancelAnimationFrame(c),h.disconnect()}},[a,o,l,s,...n]),c}(l,i,[e.title,e.creative_id],{min:12,max:40,minContainerAR:2,maxHeightFraction:.25}),c=null==s?null:Math.max(11,Math.round(.6*s)),h=null==s?null:Math.max(12,Math.round(.65*s));return(0,n.jsxs)(n.Fragment,{children:[(0,n.jsx)("style",{href:u,precedence:"default",children:d}),(0,n.jsx)("div",{ref:i,className:u,children:(0,n.jsxs)("a",{className:`${u}__link`,href:e.click_url,target:"_blank",rel:"noopener sponsored",children:[(0,n.jsx)("img",{className:`${u}__img`,src:e.image_url,srcSet:e.srcset,alt:e.alt_text}),(0,n.jsxs)("div",{className:`${u}__text`,children:[(0,n.jsx)("strong",{ref:l,className:`${u}__title`,style:s?{fontSize:`${s}px`}:void 0,"data-fit-size":s??"unset",children:e.title}),t.map((e,t)=>(0,n.jsx)("p",{className:`${u}__line`,style:c?{fontSize:`${c}px`}:void 0,children:e},t))]}),(0,n.jsx)("span",{className:`${u}__cta`,style:h?{fontSize:`${h}px`}:void 0,children:e.cta_text})]})})]})}let p="athenas-imgtxt-poster",m=`
.${p} {
  display: flex;
  flex-direction: column;
  width: min(90vw, 420px);
  max-height: 85vh;
  background: #ffffff;
  color: #0a0a0a;
  border-radius: 16px;
  overflow: hidden;
  box-shadow: 0 20px 60px rgba(0,0,0,0.45);
  text-decoration: none;
  font-family: inherit;
}
.${p}__img {
  display: block;
  width: 100%;
  height: auto;
  max-height: 60vh;
  object-fit: contain;
  flex-shrink: 0;
  background: #f3f4f6;
}
.${p}__text {
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding: 18px 20px 20px;
  min-height: 0;
}
.${p}__title {
  font-size: clamp(18px, 4.5vw, 22px);
  font-weight: 700;
  line-height: 1.2;
  margin: 0;
}
.${p}__line {
  margin: 0;
  font-size: clamp(13px, 3.5vw, 15px);
  line-height: 1.4;
  color: rgba(10,10,10,0.7);
}
.${p}__cta {
  margin-top: 8px;
  align-self: flex-start;
  background: #0a0a0a;
  color: #ffffff;
  font-weight: 600;
  font-size: 15px;
  line-height: 1.2;
  padding: 11px 20px;
  border-radius: 8px;
}
`;function g({source:e,onClick:t}){let r=f(e.body);return(0,n.jsxs)(n.Fragment,{children:[(0,n.jsx)("style",{href:p,precedence:"default",children:m}),(0,n.jsxs)("a",{className:p,href:e.click_url,onClick:t,rel:"noopener sponsored",children:[(0,n.jsx)("img",{className:`${p}__img`,src:e.image_url,srcSet:e.srcset,alt:e.alt_text}),(0,n.jsxs)("div",{className:`${p}__text`,children:[(0,n.jsx)("strong",{className:`${p}__title`,children:e.title}),r.map((e,t)=>(0,n.jsx)("p",{className:`${p}__line`,children:e},t)),(0,n.jsx)("span",{className:`${p}__cta`,children:e.cta_text})]})]})]})}e.s(["HouseImage",()=>c,"HouseImageText",()=>h,"HouseImageTextPoster",()=>g],72200)},75888,47196,92960,91960,e=>{"use strict";let t=null;function n(){return"undefined"!=typeof document}async function r(){if(!n())return!1;let e=document.createElement("div");e.className="ad-banner ads adsbox",e.style.cssText="position:absolute;left:-9999px;top:-9999px;width:1px;height:1px;pointer-events:none;",e.setAttribute("aria-hidden","true"),document.body.appendChild(e);try{await new Promise(e=>setTimeout(e,100));let t=window.getComputedStyle(e);return 0===e.offsetHeight||null===e.offsetParent||"none"===t.display||"hidden"===t.visibility}finally{e.remove()}}async function i(e){if("function"!=typeof fetch)return!1;let t="undefined"!=typeof AbortController?new AbortController:null,n=setTimeout(()=>t?.abort(),e);try{return await fetch("https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js",{method:"HEAD",mode:"no-cors",signal:t?.signal}),!1}catch{return!0}finally{clearTimeout(n)}}function a(e={}){if(t)return t;if(!n())return Promise.resolve(!1);let o=e.testMode?250:1500;return t=(async()=>{let[e,t]=await Promise.all([r(),i(o)]);return e||t})()}function o(e){if("undefined"!=typeof navigator){if("function"==typeof navigator.sendBeacon)try{if(navigator.sendBeacon(e))return}catch{}"function"==typeof fetch&&fetch(e,{method:"POST",keepalive:!0}).catch(()=>void 0)}}e.s(["isAdblockActive",()=>a],75888),e.s(["beacon",()=>o],47196);var l=e.i(69287),s=e.i(71317);let c="athenas-removeads",u=`
.${c}__dialog {
  border: none;
  border-radius: 12px;
  padding: 0;
  max-width: 420px;
  width: calc(100% - 32px);
  box-shadow: 0 20px 60px light-dark(rgba(0, 0, 0, 0.25), rgba(0, 0, 0, 0.6));
  color: light-dark(#111, #f5f5f5);
  background: light-dark(#fff, #1a1a1a);
  font-family: inherit;
}
.${c}__dialog::backdrop {
  background: rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(2px);
}
.${c}__inner {
  padding: 20px 22px 18px;
  display: flex;
  flex-direction: column;
  gap: 10px;
}
.${c}__title {
  font-size: 18px;
  font-weight: 600;
  margin: 0;
}
.${c}__body {
  font-size: 14px;
  line-height: 1.45;
  margin: 0;
  color: light-dark(#333, #c8c8c8);
}
.${c}__actions {
  display: flex;
  gap: 8px;
  justify-content: flex-end;
  margin-top: 8px;
}
.${c}__btn {
  border-radius: 8px;
  border: 1px solid light-dark(#111, #f5f5f5);
  background: light-dark(#111, #f5f5f5);
  color: light-dark(#fff, #111);
  padding: 8px 14px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  text-decoration: none;
  display: inline-block;
  line-height: 1.2;
}
`;function d({subscribe:e,className:t,defaultStyle:n,onNavigate:r}){let i=(0,s.useRef)(null),a=t??`${c}__cta`,o=t?void 0:n;return e?e.dialog?(0,l.jsxs)(l.Fragment,{children:[(0,l.jsx)("a",{href:e.click_url,className:a,style:o,onClick:e=>{e.preventDefault(),i.current?.showModal()},children:e.label}),(0,l.jsx)(f,{ref:i,title:e.dialog.title,body:e.dialog.body,ctaText:e.dialog.cta_text,ctaHref:e.click_url,onNavigate:r})]}):(0,l.jsx)("a",{href:e.click_url,target:"_blank",rel:"noopener",onClick:r,className:a,style:o,children:e.label}):(0,l.jsx)("a",{className:a,style:o,children:" "})}let f=({ref:e,title:t,body:n,ctaText:r,ctaHref:i,onNavigate:a})=>((0,s.useEffect)(()=>{let t=e.current;if(!t)return;let n=e=>{e.target===t&&t.close()};return t.addEventListener("click",n),()=>t.removeEventListener("click",n)},[e]),(0,l.jsxs)("dialog",{ref:e,className:`${c}__dialog`,children:[(0,l.jsx)("style",{href:c,precedence:"default",children:u}),(0,l.jsxs)("div",{className:`${c}__inner`,children:[(0,l.jsx)("h2",{className:`${c}__title`,children:t}),(0,l.jsx)("p",{className:`${c}__body`,children:n}),(0,l.jsx)("div",{className:`${c}__actions`,children:(0,l.jsx)("a",{href:i,target:"_blank",rel:"noopener",className:`${c}__btn`,onClick:()=>{e.current?.close(),a?.()},children:r})})]})]}));e.s(["RemoveAdsCta",()=>d],92960);let h="athenas:seen",p="athenas:adsense_fills",m="athenas:sid",g=Promise.resolve(),x=new Set,y=0,b=!1,w=null;function _(){return"undefined"!=typeof sessionStorage}function v(){try{if("undefined"!=typeof crypto&&"function"==typeof crypto.randomUUID)return crypto.randomUUID()}catch{}return`${Date.now().toString(36)}-${Math.random().toString(36).slice(2,12)}`}function S(){if(!b&&_()){b=!0;try{let e=sessionStorage.getItem(h);if(e){let t=JSON.parse(e);if(Array.isArray(t)){let e=t.slice(-5);for(let t of e)"number"==typeof t&&Number.isInteger(t)&&x.add(t);e.length!==t.length&&sessionStorage.setItem(h,JSON.stringify([...x]))}}let t=sessionStorage.getItem(p);if(t){let e=Number(t);Number.isFinite(e)&&e>=0&&(y=Math.floor(e))}}catch{}}}function k(e){S();let t=g.then(()=>e());return g=t.catch(()=>void 0),t}function j(){return S(),[...x]}function $(e){for(S(),x.delete(e),x.add(e);x.size>5;){let e=x.values().next().value;if(void 0===e)break;x.delete(e)}if(_())try{sessionStorage.setItem(h,JSON.stringify([...x]))}catch{}}function A(){return S(),y}function C(){if(S(),y+=1,_())try{sessionStorage.setItem(p,String(y))}catch{}}function E(){let e=Date.now();if("undefined"==typeof localStorage)return w??=v();let t=null;try{let n=localStorage.getItem(m);if(n){let r=JSON.parse(n);"string"==typeof r?.id&&"number"==typeof r?.exp&&e<r.exp&&(t=r.id)}}catch{}t||(t=v());try{localStorage.setItem(m,JSON.stringify({id:t,exp:e+18e5}))}catch{}return t}e.s(["enqueue",()=>k,"getAdsenseFills",()=>A,"getSeen",()=>j,"getSessionId",()=>E,"incrementAdsenseFills",()=>C,"markSeen",()=>$],91960)},98373,e=>{"use strict";var t=e.i(69287),n=e.i(71317),r=e.i(82786),i=e.i(75888),a=e.i(47440);function o({source:e,height:r}){let{testMode:i,loadAdSense:o}=(0,a.useAthenas)(),l=(0,n.useRef)(null),s=(0,n.useRef)(!1);return(0,n.useEffect)(()=>{o(e.ad_client),s.current||(s.current=!0,(window.adsbygoogle=window.adsbygoogle||[]).push({}))},[e.ad_client,o]),(0,t.jsx)("ins",{ref:l,className:"adsbygoogle",style:{display:"block",width:"100%",height:r},"data-ad-client":e.ad_client,"data-ad-slot":e.ad_slot,"data-ad-format":"auto","data-full-width-responsive":"true",...i?{"data-adtest":"on"}:{}})}var l=e.i(47196),s=e.i(72200),c=e.i(92960),u=e.i(91960);let d="athenas-adslot",f=`
.${d} {
  position: relative;
  overflow: hidden;
  width: 100%;
  height: 100%;
}
.${d}__layer {
  position: absolute;
  inset: 0;
  display: block;
}
.${d}__enter {
  animation: ${d}-fade-in 360ms ease both;
}
.${d}__exit {
  animation: ${d}-fade-out 360ms ease both;
}
@keyframes ${d}-fade-in {
  from { opacity: 0; } to { opacity: 1; }
}
@keyframes ${d}-fade-out {
  from { opacity: 1; } to { opacity: 0; }
}
`;function h({slot:e,bands:o,className:s,style:h,site:m,refreshKey:g,tag:x}){let{apiOrigin:y,site:b,testMode:w,forceAdblock:_,removeAdsClassName:v}=(0,a.useAthenas)(),S=m??b,k=(0,r.usePathname)(),j=(0,n.useMemo)(()=>o.map(e=>({minWidth:e.minWidth??0,maxWidth:e.maxWidth,height:e.height})).sort((e,t)=>e.minWidth-t.minWidth),[o]),[$,A]=(0,n.useState)(0),[C,E]=(0,n.useState)(null),[N,M]=(0,n.useState)(null),[T,P]=(0,n.useState)(null),[R,I]=(0,n.useState)(null),[O,z]=(0,n.useState)(0),[q,L]=(0,n.useState)(!1),[W,D]=(0,n.useState)(!1);(0,n.useEffect)(()=>{D(!0)},[]);let F=(0,n.useRef)(null),U=(0,n.useRef)(!1),H=(0,n.useRef)(!1),B=(0,n.useRef)(null),K=(0,n.useRef)(null),J=(0,n.useRef)(null),Z=(0,n.useRef)(null),Q=(0,n.useRef)(!1);(0,n.useEffect)(()=>{let e=F.current;if(!e||"undefined"==typeof ResizeObserver)return;let t=null,n=new ResizeObserver(e=>{let n=e[0];if(!n)return;let r=Math.round(n.contentRect.width);t&&clearTimeout(t),t=setTimeout(()=>{A(r)},150)});n.observe(e);let r=Math.round(e.clientWidth);return r>0&&A(r),()=>{t&&clearTimeout(t),n.disconnect()}},[]);let X=(0,n.useMemo)(()=>{if(0===$)return j[0]??null;let e=j.find(e=>$>=e.minWidth&&$<=e.maxWidth);if(e)return e;let t=j[j.length-1];return t&&$>t.maxWidth?t:null},[$,j]);(0,n.useEffect)(()=>{if(0===$)return;if(!X){E(null),M(null),I(null),K.current=null,J.current=null,Q.current=!1;return}let t=`${S}|${e}|${k??""}|${g??""}|${x??""}|${y}`,n=Z.current!==t,r=!n&&O>0;if(n&&(Z.current=t,Q.current=!1,O>0&&z(0),E(null),M(null),I(null),K.current=null,J.current=null),!r&&Q.current&&C){let e=J.current;if(!(!e||X.minWidth!==e.minWidth||X.maxWidth!==e.maxWidth||X.height!==e.height)){if("adsense"===C.type||"image_text"===C.media_type)return;let e=K.current??$;if(Math.abs($-e)/Math.max(1,e)<.2)return}}if(!r&&!C&&Q.current&&$===(K.current??-1))return;if(!r){if(!q||!W)return;Q.current=!0}let a=Symbol();B.current=a;let o=Math.min(Math.max($,X.minWidth),X.maxWidth);return(0,u.enqueue)(async()=>{let t=_??await (0,i.isAdblockActive)({testMode:w}),n=new URLSearchParams({site:S,slot:e,format:"banner",available_width:String(o),band_height:String(X.height),adblock:t?"1":"0",adsense_fills:String((0,u.getAdsenseFills)()),sid:(0,u.getSessionId)()});x&&n.set("tag",x),window.location?.href&&n.set("current_url",window.location.href);let r=(0,u.getSeen)();r.length&&n.set("seen",r.join(","));let s=await fetch(`${y}/api/placements?${n.toString()}`);if(B.current!==a||!s.ok)return{src:null,refreshS:null,subscribe:null};let c=await s.json();if(B.current!==a)return{src:null,refreshS:null,subscribe:null};let d=c.source;return d&&("adsense"===d.type?(0,u.incrementAdsenseFills)():("image"===d.media_type||"image_text"===d.media_type)&&(0,u.markSeen)(d.creative_id),(0,l.beacon)(d.impression_url)),{src:d,refreshS:c.slot.refresh_interval_s,subscribe:c.subscribe??null}}).then(({src:e,refreshS:t,subscribe:n})=>{B.current===a&&(B.current=null,K.current=$,J.current=X,I(t),P(n??null),r&&C&&e?(M(C),E(e),window.setTimeout(()=>{M(null)},360)):(E(e),M(null)))}).catch(()=>{B.current===a&&(B.current=null,r||(E(null),Q.current=!1))}),()=>{B.current!==a||r||(Q.current=!1),B.current=null}},[S,e,y,k,g,_,w,O,x,q,$,W,X?.minWidth,X?.maxWidth,X?.height]),(0,n.useEffect)(()=>{let e=F.current;if(!e||"undefined"==typeof IntersectionObserver){U.current=!0,L(!0);return}let t=new IntersectionObserver(e=>{for(let t of e){let e=t.intersectionRatio>=.25;U.current=e,L(e)}},{threshold:[0,.25,1]});return t.observe(e),()=>t.disconnect()},[]),(0,n.useEffect)(()=>{if(!R||R<30||!C||"adsense"===C.type)return;let e=1e3*R,t=()=>{"undefined"!=typeof document&&document.hidden||!U.current||H.current||z(e=>e+1)},n=Math.random()*Math.min(e,5e3),r=null,i=window.setTimeout(()=>{t(),r=window.setInterval(t,e)},e+n);return()=>{window.clearTimeout(i),null!==r&&window.clearInterval(r)}},[R,C]);let V=X?{width:"100%",maxWidth:X.maxWidth||void 0,height:X.height,...h}:null,G=!!N;return(0,t.jsxs)("div",{className:s,onMouseEnter:()=>{H.current=!0},onMouseLeave:()=>{H.current=!1},style:{display:"flex",flexDirection:"column",gap:5,width:"100%"},children:[(0,t.jsx)("div",{ref:F,style:{width:"100%"},children:V?(0,t.jsxs)("div",{style:V,children:[(0,t.jsx)("style",{href:d,precedence:"default",children:f}),(0,t.jsxs)("div",{className:d,children:[N?(0,t.jsx)("div",{className:`${d}__layer ${d}__exit`,children:(0,t.jsx)(p,{source:N,height:X.height})},`exit-${"adsense"===N.type?"ad":N.creative_id}`):null,C?(0,t.jsx)("div",{className:G?`${d}__layer ${d}__enter`:`${d}__layer`,children:(0,t.jsx)(p,{source:C,height:X.height})},`enter-${"adsense"===C.type?"ad":C.creative_id}`):null]})]}):null}),V?(0,t.jsx)("div",{style:{display:"flex",justifyContent:"flex-end"},children:(0,t.jsx)(c.RemoveAdsCta,{subscribe:C?T:null,className:v,defaultStyle:{fontSize:11,lineHeight:1,color:"currentColor",opacity:.55,textDecoration:"underline",textTransform:"uppercase"}})}):null]})}function p({source:e,height:n}){return"adsense"===e.type?(0,t.jsx)(o,{source:e,height:n}):"image"===e.media_type?(0,t.jsx)(s.HouseImage,{source:e}):"image_text"===e.media_type?(0,t.jsx)(s.HouseImageText,{source:e}):null}e.s(["AdSlot",()=>h],98373)},63486,94127,e=>{"use strict";function t(e,t){return`${e}|${t??""}`}let n=(e,t)=>`athenas:interstitial:${e}:${t??""}:count`,r=(e,t)=>`athenas:interstitial:${e}:${t??""}:lastShownAt`,i=new Map;function a(){return"undefined"!=typeof sessionStorage}function o(e){if(!a())return 0;try{let t=sessionStorage.getItem(e);if(!t)return 0;let n=Number(t);return Number.isFinite(n)&&n>=0?Math.floor(n):0}catch{return 0}}function l(e,t){if(a())try{sessionStorage.setItem(e,String(t))}catch{}}let s=new Set;function c(e){return s.add(e),()=>{s.delete(e)}}function u(){for(let e of s)e()}function d(e,t){return{count:o(n(e,t)),lastShownAt:o(r(e,t))}}function f(e,t,i=Date.now()){let a=o(n(e,t))+1;l(n(e,t),a),l(r(e,t),i),u()}function h(e,n,r){i.set(t(e,n),r),u()}function p(e,n){return i.get(t(e,n))}function m(e){let{capSession:t,capMinutes:n,count:r,lastShownAt:i,now:a}=e;return(null==t||!(r>=t))&&(null==n||!(n>0)||!(i>0)||!(a-i<6e4*n))}e.s(["getCounters",()=>d,"getMeta",()=>p,"isAllowed",()=>m,"recordShow",()=>f,"rememberMeta",()=>h,"subscribe",()=>c],63486);let g=1,x=[],y=null,b=new Set;function w(){b.forEach(e=>e())}function _(e){return b.add(e),()=>{b.delete(e)}}function v(){return y}function S(e,t,n={}){return new Promise(r=>{let i={id:g++,format:e,slot:t,force:n.force,tag:n.tag};x.push({job:i,resolve:r}),k()})}function k(){if(y)return;let e=x.shift();e&&(y=e.job,j=e.resolve,w())}let j=null;function $(e){y&&j&&(j(e),y=null,j=null,w(),k())}e.s(["complete",()=>$,"enqueueShow",()=>S,"getActive",()=>v,"subscribe",()=>_],94127)},65583,e=>{"use strict";var t=e.i(69287),n=e.i(71317),r=e.i(45569),i=e.i(75888),a=e.i(47196),o=e.i(72200),l=e.i(92960),s=e.i(63486),c=e.i(94127),u=e.i(47440),d=e.i(91960);function f(){let e=(0,n.useSyncExternalStore)(c.subscribe,c.getActive,()=>null);return e?(0,t.jsx)(h,{job:e},e.id):null}function h({job:e}){let{apiOrigin:r,site:o,testMode:l,forceAdblock:f,removeAdsClassName:h}=(0,u.useAthenas)(),[m,g]=(0,n.useState)("fetching"),[x,y]=(0,n.useState)(null),[b,w]=(0,n.useState)(null),[_,v]=(0,n.useState)(!1),[S,k]=(0,n.useState)(null),[j,$]=(0,n.useState)(null),A=(0,n.useRef)(!1),C=(0,n.useCallback)(e=>{A.current||(A.current=!0,(0,c.complete)(e))},[]);return(0,n.useEffect)(()=>{if(e.force)return;let t=(0,s.getMeta)(e.slot,e.tag);if(t){let n=(0,s.getCounters)(e.slot,e.tag);(0,s.isAllowed)({capSession:t.capSession,capMinutes:t.capMinutes,count:n.count,lastShownAt:n.lastShownAt,now:Date.now()})||C({shown:!1,completed:!1,reason:"capped"})}},[e.slot,e.tag,e.force,C]),(0,n.useEffect)(()=>{if(A.current)return;let t=!1;return(0,d.enqueue)(async()=>{let t=f??await (0,i.isAdblockActive)({testMode:l}),n=new URLSearchParams({site:o,slot:e.slot,format:e.format,adblock:t?"1":"0",adsense_fills:String((0,d.getAdsenseFills)()),sid:(0,d.getSessionId)()});if(e.tag&&n.set("tag",e.tag),window.location?.href&&n.set("current_url",window.location.href),!e.force){let e=(0,d.getSeen)();e.length&&n.set("seen",e.join(","))}let a=await fetch(`${r}/api/placements?${n.toString()}`),c=await a.json();return(0,s.rememberMeta)(e.slot,e.tag,{capSession:c.slot.frequency_cap_session,capMinutes:c.slot.frequency_cap_minutes}),c.source&&"adsense"!==c.source.type&&"creative_id"in c.source&&(0,d.markSeen)(c.source.creative_id),c}).then(n=>{if(!t&&!A.current){if(!e.force){let t=(0,s.getCounters)(e.slot,e.tag);if(!(0,s.isAllowed)({capSession:n.slot.frequency_cap_session,capMinutes:n.slot.frequency_cap_minutes,count:t.count,lastShownAt:t.lastShownAt,now:Date.now()}))return void C({shown:!1,completed:!1,reason:"capped"})}if(!n.source||"adsense"===n.source.type)return void C({shown:!1,completed:!1,reason:"no_creative"});y(n.source),w(n.subscribe??null),k({minDurationMs:n.slot.min_duration_ms,capSession:n.slot.frequency_cap_session,capMinutes:n.slot.frequency_cap_minutes}),(0,a.beacon)(n.source.impression_url),(0,s.recordShow)(e.slot,e.tag),g("ready")}}).catch(e=>{t||A.current||($(e.message),C({shown:!1,completed:!1,reason:"error"}))}),()=>{t=!0}},[r,f,e.format,e.slot,e.tag,e.force,o,l,C]),(0,n.useEffect)(()=>{if(!x||"adsense"===x.type)return;if("video"===x.media_type)return void v(!0);let e=!1,t=new Image;t.src=x.image_url;let n=window.setTimeout(()=>{e||v(!0)},3e3);return t.decode().catch(()=>void 0).finally(()=>{e||(window.clearTimeout(n),v(!0))}),()=>{e=!0,window.clearTimeout(n)}},[x]),(0,n.useEffect)(()=>()=>{!A.current&&x&&(0,c.complete)({shown:!0,completed:"interstitial"===e.format})},[e.format,x]),(0,t.jsx)(p,{job:e,source:x,mediaReady:_,minDurationMs:S?.minDurationMs??0,subscribe:b,removeAdsClassName:h,onFinish:C,onPhaseSkippable:()=>g("skippable"),isSkippable:"skippable"===m,onPlaying:()=>g("playing"),error:j})}function p({job:e,source:i,mediaReady:a,minDurationMs:o,subscribe:s,removeAdsClassName:c,onFinish:u,onPhaseSkippable:d,isSkippable:f,onPlaying:h}){let[p,y]=(0,n.useState)(Math.max(0,Math.ceil(o/1e3))),b=(0,n.useRef)(null),[w,_]=(0,n.useState)(null);(0,n.useEffect)(()=>{"undefined"!=typeof document&&_(document.body)},[]),(0,n.useEffect)(()=>{if(!i||!a)return;if(o<=0){d(),y(0);return}let e=null,t=null,n=0,r=null,l=()=>{let t=null==r?0:Date.now()-r,i=Math.max(0,o-(n+t));y(Math.ceil(i/1e3)),i<=0&&(null!=e&&(window.clearInterval(e),e=null),d())},s=()=>{null==r&&(r=Date.now(),e=window.setInterval(l,250),l())},c=()=>{document.hidden?null!=r&&(n+=Date.now()-r,r=null,null!=e&&(window.clearInterval(e),e=null),b.current?.pause()):(()=>{if(null==r){if(n>=o)return d();r=Date.now(),e=window.setInterval(l,250),b.current?.play().catch(()=>void 0)}})()},u="adsense"!==i.type&&"media_type"in i&&"video"===i.media_type,f=null,h=b.current;return u?(t=window.setTimeout(s,5e3),f=()=>{null!=t&&(window.clearTimeout(t),t=null),s()},h?.addEventListener("loadeddata",f)):s(),document.addEventListener("visibilitychange",c),()=>{document.removeEventListener("visibilitychange",c),null!=e&&window.clearInterval(e),null!=t&&window.clearTimeout(t),f&&h&&h.removeEventListener("loadeddata",f)}},[a,o,i,d]);let v="rewarded"===e.format?()=>u({shown:!0,completed:!1,reason:"skipped"}):void 0;if(!w)return null;let S=(0,t.jsx)("div",{role:"dialog","aria-modal":"true","aria-busy":!i||!a,style:{position:"fixed",inset:0,zIndex:0x7fffffff,background:"rgba(0,0,0,0.92)",display:"grid",placeItems:"center",color:"white"},children:i&&a?(0,t.jsxs)("div",{style:{position:"relative",maxWidth:"min(90vw, 800px)",maxHeight:"85vh",display:"flex",flexDirection:"column",alignItems:"center",gap:12},children:[(0,t.jsx)(g,{source:i,videoRef:b,onClick:e=>{e.preventDefault(),i&&"click_url"in i&&window.open(i.click_url,"_blank","noopener")},onPlaying:h}),(0,t.jsx)(x,{isSkippable:f,remaining:p,onSkip:()=>{f&&u({shown:!0,completed:!0})},onEarlyDismiss:v}),s?(0,t.jsx)(l.RemoveAdsCta,{subscribe:s,className:c,defaultStyle:{background:"white",color:"black",padding:"10px 20px",borderRadius:8,fontWeight:600,textDecoration:"none",fontSize:15},onNavigate:()=>{u({shown:!0,completed:"interstitial"===e.format,reason:"subscribed"})}}):null]}):(0,t.jsx)(m,{})});return(0,r.createPortal)(S,w)}function m(){return(0,t.jsxs)("svg",{width:"64",height:"64",viewBox:"0 0 64 64",xmlns:"http://www.w3.org/2000/svg",role:"img","aria-label":"Loading",children:[(0,t.jsx)("circle",{cx:"32",cy:"32",r:"26",fill:"none",stroke:"rgba(255,255,255,0.15)",strokeWidth:"6"}),(0,t.jsx)("circle",{cx:"32",cy:"32",r:"26",fill:"none",stroke:"rgba(255,255,255,0.9)",strokeWidth:"6",strokeLinecap:"round",strokeDasharray:"40 200",children:(0,t.jsx)("animateTransform",{attributeName:"transform",type:"rotate",from:"0 32 32",to:"360 32 32",dur:"0.9s",repeatCount:"indefinite"})})]})}function g({source:e,videoRef:n,onClick:r,onPlaying:i}){return"adsense"===e.type?null:"video"===e.media_type?(0,t.jsx)("a",{href:e.click_url,onClick:r,rel:"noopener sponsored",style:{display:"block",width:"100%"},children:(0,t.jsx)("video",{ref:n,src:e.video_url,poster:e.poster_url,autoPlay:!0,muted:!0,playsInline:!0,onPlaying:i,style:{display:"block",width:"100%",height:"auto",maxHeight:"85vh",objectFit:"contain"}})}):"image_text"===e.media_type?(0,t.jsx)(o.HouseImageTextPoster,{source:e,onClick:r}):(0,t.jsx)("a",{href:e.click_url,onClick:r,rel:"noopener sponsored",style:{display:"block",width:"100%"},children:(0,t.jsx)("img",{src:e.image_url,alt:e.alt_text,style:{display:"block",maxWidth:"min(90vw, 800px)",maxHeight:"70vh",width:"auto",height:"auto",objectFit:"contain"}})})}function x({isSkippable:e,remaining:n,onSkip:r,onEarlyDismiss:i}){return(0,t.jsx)("div",{style:{position:"absolute",top:8,right:8,display:"flex",gap:8},children:e?(0,t.jsx)("button",{onClick:r,style:{background:"rgba(0,0,0,0.6)",color:"white",border:"1px solid rgba(255,255,255,0.4)",padding:"6px 12px",borderRadius:999,fontSize:13,cursor:"pointer"},children:"Skip ✕"}):(0,t.jsxs)(t.Fragment,{children:[(0,t.jsxs)("span",{style:{background:"rgba(0,0,0,0.6)",color:"white",padding:"6px 12px",borderRadius:999,fontSize:13},children:["Skip in ",n,"s"]}),i&&(0,t.jsx)("button",{onClick:i,"aria-label":"Dismiss without reward",title:"Dismiss (no reward)",style:{background:"rgba(0,0,0,0.4)",color:"white",border:"1px solid rgba(255,255,255,0.2)",padding:"6px 10px",borderRadius:999,fontSize:13,cursor:"pointer"},children:"✕"})]})})}e.s(["InterstitialHost",()=>f])},70325,e=>{"use strict";var t=e.i(71317),n=e.i(63486);function r(e,r){(0,t.useSyncExternalStore)(n.subscribe,()=>{let t,i;return t=(0,n.getMeta)(e,r),i=(0,n.getCounters)(e,r),`${t?.capSession??"?"}|${t?.capMinutes??"?"}|${i.count}|${i.lastShownAt}`},()=>"");let i=function(e,t,r){let i=(0,n.getMeta)(e,t);if(!i)return{available:!0};let a=(0,n.getCounters)(e,t);if(null!=i.capSession&&a.count>=i.capSession)return{available:!1,reason:"capped"};if(null!=i.capMinutes&&i.capMinutes>0&&a.lastShownAt>0){let e=r-a.lastShownAt,t=6e4*i.capMinutes;if(e<t)return{available:!1,reason:"cooldown",msUntilAvailable:t-e}}return(0,n.isAllowed)({capSession:i.capSession,capMinutes:i.capMinutes,count:a.count,lastShownAt:a.lastShownAt,now:r})?{available:!0}:{available:!1,reason:"capped"}}(e,r,Date.now()),[,a]=(0,t.useState)(0);return(0,t.useEffect)(()=>{if("cooldown"!==i.reason||null==i.msUntilAvailable)return;let e=window.setTimeout(()=>{a(e=>e+1)},i.msUntilAvailable+50);return()=>window.clearTimeout(e)},[i.reason,i.msUntilAvailable]),i}e.s(["useAvailability",()=>r])},81519,e=>{"use strict";var t=e.i(71317),n=e.i(94127),r=e.i(70325);function i({slot:e,tag:i}){let a=(0,r.useAvailability)(e,i),o=(0,t.useCallback)((t={})=>(0,n.enqueueShow)("interstitial",e,{force:t.force,tag:i}),[e,i]);return{...a,show:o}}e.s(["useInterstitial",()=>i])},13300,e=>{"use strict";var t=e.i(71317),n=e.i(94127),r=e.i(70325);function i({slot:e,tag:i}){let a=(0,r.useAvailability)(e,i),o=(0,t.useCallback)((t={})=>(0,n.enqueueShow)("rewarded",e,{force:t.force,tag:i}),[e,i]);return{...a,show:o}}e.s(["useRewarded",()=>i])},26865,e=>{"use strict";var t=e.i(71317),n=e.i(81519);function r({slot:e,enabled:r=!0}){let{show:i}=(0,n.useInterstitial)({slot:e});return(0,t.useEffect)(()=>{if(!r||"undefined"==typeof document||window.matchMedia?.("(pointer: coarse)").matches)return;let e=!1,t=t=>{e||t.clientY>=5||(e=!0,i())};return document.addEventListener("mouseleave",t),()=>{document.removeEventListener("mouseleave",t)}},[r,i]),null}e.s(["ExitIntent",()=>r])},191,e=>{"use strict";var t=e.i(71317);let n=e=>{let t=e.replace(/^([A-Z])|[\s-_]+(\w)/g,(e,t,n)=>n?n.toUpperCase():t.toLowerCase());return t.charAt(0).toUpperCase()+t.slice(1)},r=(...e)=>e.filter((e,t,n)=>!!e&&""!==e.trim()&&n.indexOf(e)===t).join(" ").trim();var i={xmlns:"http://www.w3.org/2000/svg",width:24,height:24,viewBox:"0 0 24 24",fill:"none",stroke:"currentColor",strokeWidth:2,strokeLinecap:"round",strokeLinejoin:"round"};let a=(0,t.forwardRef)(({color:e="currentColor",size:n=24,strokeWidth:a=2,absoluteStrokeWidth:o,className:l="",children:s,iconNode:c,...u},d)=>(0,t.createElement)("svg",{ref:d,...i,width:n,height:n,stroke:e,strokeWidth:o?24*Number(a)/Number(n):a,className:r("lucide",l),...!s&&!(e=>{for(let t in e)if(t.startsWith("aria-")||"role"===t||"title"===t)return!0})(u)&&{"aria-hidden":"true"},...u},[...c.map(([e,n])=>(0,t.createElement)(e,n)),...Array.isArray(s)?s:[s]])),o=(e,i)=>{let o=(0,t.forwardRef)(({className:o,...l},s)=>(0,t.createElement)(a,{ref:s,iconNode:i,className:r(`lucide-${n(e).replace(/([a-z0-9])([A-Z])/g,"$1-$2").toLowerCase()}`,`lucide-${e}`,o),...l}));return o.displayName=n(e),o};e.s(["default",()=>o],191)},60531,(e,t,n)=>{"use strict";Object.defineProperty(n,"__esModule",{value:!0});var r={assign:function(){return s},searchParamsToUrlQuery:function(){return a},urlQueryToSearchParams:function(){return l}};for(var i in r)Object.defineProperty(n,i,{enumerable:!0,get:r[i]});function a(e){let t={};for(let[n,r]of e.entries()){let e=t[n];void 0===e?t[n]=r:Array.isArray(e)?e.push(r):t[n]=[e,r]}return t}function o(e){return"string"==typeof e?e:("number"!=typeof e||isNaN(e))&&"boolean"!=typeof e?"":String(e)}function l(e){let t=new URLSearchParams;for(let[n,r]of Object.entries(e))if(Array.isArray(r))for(let e of r)t.append(n,o(e));else t.set(n,o(r));return t}function s(e,...t){for(let n of t){for(let t of n.keys())e.delete(t);for(let[t,r]of n.entries())e.append(t,r)}return e}},42301,(e,t,n)=>{"use strict";Object.defineProperty(n,"__esModule",{value:!0});var r={formatUrl:function(){return l},formatWithValidation:function(){return c},urlObjectKeys:function(){return s}};for(var i in r)Object.defineProperty(n,i,{enumerable:!0,get:r[i]});let a=e.r(44066)._(e.r(60531)),o=/https?|ftp|gopher|file/;function l(e){let{auth:t,hostname:n}=e,r=e.protocol||"",i=e.pathname||"",l=e.hash||"",s=e.query||"",c=!1;t=t?encodeURIComponent(t).replace(/%3A/i,":")+"@":"",e.host?c=t+e.host:n&&(c=t+(~n.indexOf(":")?`[${n}]`:n),e.port&&(c+=":"+e.port)),s&&"object"==typeof s&&(s=String(a.urlQueryToSearchParams(s)));let u=e.search||s&&`?${s}`||"";return r&&!r.endsWith(":")&&(r+=":"),e.slashes||(!r||o.test(r))&&!1!==c?(c="//"+(c||""),i&&"/"!==i[0]&&(i="/"+i)):c||(c=""),l&&"#"!==l[0]&&(l="#"+l),u&&"?"!==u[0]&&(u="?"+u),i=i.replace(/[?#]/g,encodeURIComponent),u=u.replace("#","%23"),`${r}${c}${i}${u}${l}`}let s=["auth","hash","host","hostname","href","path","pathname","port","protocol","query","search","slashes"];function c(e){return l(e)}},37915,(e,t,n)=>{"use strict";Object.defineProperty(n,"__esModule",{value:!0}),Object.defineProperty(n,"useMergedRef",{enumerable:!0,get:function(){return i}});let r=e.r(71317);function i(e,t){let n=(0,r.useRef)(null),i=(0,r.useRef)(null);return(0,r.useCallback)(r=>{if(null===r){let e=n.current;e&&(n.current=null,e());let t=i.current;t&&(i.current=null,t())}else e&&(n.current=a(e,r)),t&&(i.current=a(t,r))},[e,t])}function a(e,t){if("function"!=typeof e)return e.current=t,()=>{e.current=null};{let n=e(t);return"function"==typeof n?n:()=>e(null)}}("function"==typeof n.default||"object"==typeof n.default&&null!==n.default)&&void 0===n.default.__esModule&&(Object.defineProperty(n.default,"__esModule",{value:!0}),Object.assign(n.default,n),t.exports=n.default)},57191,(e,t,n)=>{"use strict";Object.defineProperty(n,"__esModule",{value:!0});var r={DecodeError:function(){return x},MiddlewareNotFoundError:function(){return _},MissingStaticPage:function(){return w},NormalizeError:function(){return y},PageNotFoundError:function(){return b},SP:function(){return m},ST:function(){return g},WEB_VITALS:function(){return a},execOnce:function(){return o},getDisplayName:function(){return d},getLocationOrigin:function(){return c},getURL:function(){return u},isAbsoluteUrl:function(){return s},isResSent:function(){return f},loadGetInitialProps:function(){return p},normalizeRepeatedSlashes:function(){return h},stringifyError:function(){return v}};for(var i in r)Object.defineProperty(n,i,{enumerable:!0,get:r[i]});let a=["CLS","FCP","FID","INP","LCP","TTFB"];function o(e){let t,n=!1;return(...r)=>(n||(n=!0,t=e(...r)),t)}let l=/^[a-zA-Z][a-zA-Z\d+\-.]*?:/,s=e=>l.test(e);function c(){let{protocol:e,hostname:t,port:n}=window.location;return`${e}//${t}${n?":"+n:""}`}function u(){let{href:e}=window.location,t=c();return e.substring(t.length)}function d(e){return"string"==typeof e?e:e.displayName||e.name||"Unknown"}function f(e){return e.finished||e.headersSent}function h(e){let t=e.split("?");return t[0].replace(/\\/g,"/").replace(/\/\/+/g,"/")+(t[1]?`?${t.slice(1).join("?")}`:"")}async function p(e,t){let n=t.res||t.ctx&&t.ctx.res;if(!e.getInitialProps)return t.ctx&&t.Component?{pageProps:await p(t.Component,t.ctx)}:{};let r=await e.getInitialProps(t);if(n&&f(n))return r;if(!r)throw Object.defineProperty(Error(`"${d(e)}.getInitialProps()" should resolve to an object. But found "${r}" instead.`),"__NEXT_ERROR_CODE",{value:"E394",enumerable:!1,configurable:!0});return r}let m="undefined"!=typeof performance,g=m&&["mark","measure","getEntriesByName"].every(e=>"function"==typeof performance[e]);class x extends Error{}class y extends Error{}class b extends Error{constructor(e){super(),this.code="ENOENT",this.name="PageNotFoundError",this.message=`Cannot find module for page: ${e}`}}class w extends Error{constructor(e,t){super(),this.message=`Failed to load static file for page: ${e} ${t}`}}class _ extends Error{constructor(){super(),this.code="ENOENT",this.message="Cannot find the middleware module"}}function v(e){return JSON.stringify({message:e.message,stack:e.stack})}},6618,(e,t,n)=>{"use strict";Object.defineProperty(n,"__esModule",{value:!0}),Object.defineProperty(n,"isLocalURL",{enumerable:!0,get:function(){return a}});let r=e.r(57191),i=e.r(84935);function a(e){if(!(0,r.isAbsoluteUrl)(e))return!0;try{let t=(0,r.getLocationOrigin)(),n=new URL(e,t);return n.origin===t&&(0,i.hasBasePath)(n.pathname)}catch(e){return!1}}},61132,(e,t,n)=>{"use strict";Object.defineProperty(n,"__esModule",{value:!0}),Object.defineProperty(n,"errorOnce",{enumerable:!0,get:function(){return r}});let r=e=>{}},77121,(e,t,n)=>{"use strict";Object.defineProperty(n,"__esModule",{value:!0});var r={default:function(){return x},useLinkStatus:function(){return b}};for(var i in r)Object.defineProperty(n,i,{enumerable:!0,get:r[i]});let a=e.r(44066),o=e.r(69287),l=a._(e.r(71317)),s=e.r(42301),c=e.r(11406),u=e.r(37915),d=e.r(57191),f=e.r(468);e.r(7217);let h=e.r(89317),p=e.r(6618),m=e.r(82022);function g(e){return"string"==typeof e?e:(0,s.formatUrl)(e)}function x(t){var n;let r,i,a,[s,x]=(0,l.useOptimistic)(h.IDLE_LINK_STATUS),b=(0,l.useRef)(null),{href:w,as:_,children:v,prefetch:S=null,passHref:k,replace:j,shallow:$,scroll:A,onClick:C,onMouseEnter:E,onTouchStart:N,legacyBehavior:M=!1,onNavigate:T,ref:P,unstable_dynamicOnHover:R,...I}=t;r=v,M&&("string"==typeof r||"number"==typeof r)&&(r=(0,o.jsx)("a",{children:r}));let O=l.default.useContext(c.AppRouterContext),z=!1!==S,q=!1!==S?null===(n=S)||"auto"===n?m.FetchStrategy.PPR:m.FetchStrategy.Full:m.FetchStrategy.PPR,{href:L,as:W}=l.default.useMemo(()=>{let e=g(w);return{href:e,as:_?g(_):e}},[w,_]);if(M){if(r?.$$typeof===Symbol.for("react.lazy"))throw Object.defineProperty(Error("`<Link legacyBehavior>` received a direct child that is either a Server Component, or JSX that was loaded with React.lazy(). This is not supported. Either remove legacyBehavior, or make the direct child a Client Component that renders the Link's `<a>` tag."),"__NEXT_ERROR_CODE",{value:"E863",enumerable:!1,configurable:!0});i=l.default.Children.only(r)}let D=M?i&&"object"==typeof i&&i.ref:P,F=l.default.useCallback(e=>(null!==O&&(b.current=(0,h.mountLinkInstance)(e,L,O,q,z,x)),()=>{b.current&&((0,h.unmountLinkForCurrentNavigation)(b.current),b.current=null),(0,h.unmountPrefetchableInstance)(e)}),[z,L,O,q,x]),U={ref:(0,u.useMergedRef)(F,D),onClick(t){M||"function"!=typeof C||C(t),M&&i.props&&"function"==typeof i.props.onClick&&i.props.onClick(t),!O||t.defaultPrevented||function(t,n,r,i,a,o,s){if("undefined"!=typeof window){let c,{nodeName:u}=t.currentTarget;if("A"===u.toUpperCase()&&((c=t.currentTarget.getAttribute("target"))&&"_self"!==c||t.metaKey||t.ctrlKey||t.shiftKey||t.altKey||t.nativeEvent&&2===t.nativeEvent.which)||t.currentTarget.hasAttribute("download"))return;if(!(0,p.isLocalURL)(n)){a&&(t.preventDefault(),location.replace(n));return}if(t.preventDefault(),s){let e=!1;if(s({preventDefault:()=>{e=!0}}),e)return}let{dispatchNavigateAction:d}=e.r(73804);l.default.startTransition(()=>{d(r||n,a?"replace":"push",o??!0,i.current)})}}(t,L,W,b,j,A,T)},onMouseEnter(e){M||"function"!=typeof E||E(e),M&&i.props&&"function"==typeof i.props.onMouseEnter&&i.props.onMouseEnter(e),O&&z&&(0,h.onNavigationIntent)(e.currentTarget,!0===R)},onTouchStart:function(e){M||"function"!=typeof N||N(e),M&&i.props&&"function"==typeof i.props.onTouchStart&&i.props.onTouchStart(e),O&&z&&(0,h.onNavigationIntent)(e.currentTarget,!0===R)}};return(0,d.isAbsoluteUrl)(W)?U.href=W:M&&!k&&("a"!==i.type||"href"in i.props)||(U.href=(0,f.addBasePath)(W)),a=M?l.default.cloneElement(i,U):(0,o.jsx)("a",{...I,...U,children:r}),(0,o.jsx)(y.Provider,{value:s,children:a})}e.r(61132);let y=(0,l.createContext)(h.IDLE_LINK_STATUS),b=()=>(0,l.useContext)(y);("function"==typeof n.default||"object"==typeof n.default&&null!==n.default)&&void 0===n.default.__esModule&&(Object.defineProperty(n.default,"__esModule",{value:!0}),Object.assign(n.default,n),t.exports=n.default)}]);