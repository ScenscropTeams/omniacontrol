/* Omnia Control - main.js
   Nota: Este sitio usa /partials/header.html y /partials/footer.html.
   En Cloudflare Pages funciona perfecto. Para previsualizar local, usa un servidor (por ejemplo: `python -m http.server`).
*/

async function loadPartial(selector, url){
  const el = document.querySelector(selector);
  if(!el) return;
  const res = await fetch(url, { cache: "no-store" });
  el.innerHTML = await res.text();
}


function wireHeader(){
  const menuBtn = document.getElementById('menuBtn');
  const menu = document.getElementById('menu');
  if(!menuBtn || !menu) return;

  menuBtn.addEventListener('click', ()=>{
    menu.classList.toggle('open');
    menuBtn.setAttribute('aria-expanded', menu.classList.contains('open') ? 'true' : 'false');
  });

  document.addEventListener('click', (e)=>{
    const isClickInside = menu.contains(e.target) || menuBtn.contains(e.target);
    if(!isClickInside) menu.classList.remove('open');
  });

  menu.querySelectorAll('a.nav-link, a[role="menuitem"], a.ig-chip').forEach(a=>{
    a.addEventListener('click', ()=>menu.classList.remove('open'));
  });

  const submenuWraps = Array.from(menu.querySelectorAll('[data-submenu]'));
  submenuWraps.forEach(wrap=>{
    const btn = wrap.querySelector('.submenu-btn');
    if(!btn) return;

    btn.addEventListener('click', ()=>{
      const isMobile = window.matchMedia('(max-width: 900px)').matches;
      if(!isMobile) return;

      submenuWraps.forEach(w=>{
        if(w !== wrap) {
          w.classList.remove('open');
          const b = w.querySelector('.submenu-btn');
          if(b) b.setAttribute('aria-expanded','false');
        }
      });

      wrap.classList.toggle('open');
      btn.setAttribute('aria-expanded', wrap.classList.contains('open') ? 'true' : 'false');
    });
  });

    // Desktop hover: mantener abierto 500ms al salir para dar chance de bajar el mouse
  const CLOSE_DELAY = 200;
  submenuWraps.forEach(wrap=>{
    let t = null;

    const open = ()=>{
      if(t) clearTimeout(t);
      wrap.classList.add('open');
    };

    const closeLater = ()=>{
      if(t) clearTimeout(t);
      t = setTimeout(()=>wrap.classList.remove('open'), CLOSE_DELAY);
    };

    // Solo desktop (mouse)
    wrap.addEventListener('pointerenter', ()=>{
      if(window.matchMedia('(min-width: 901px)').matches) open();
    });

    wrap.addEventListener('pointerleave', ()=>{
      if(window.matchMedia('(min-width: 901px)').matches) closeLater();
    });

    // Si el mouse entra al submenu, no cierres
    const submenu = wrap.querySelector('.submenu');
    if(submenu){
      submenu.addEventListener('pointerenter', ()=>{
        if(t) clearTimeout(t);
      });
      submenu.addEventListener('pointerleave', ()=>{
        if(window.matchMedia('(min-width: 901px)').matches) closeLater();
      });
    }
  });

}

function initSite(){
  // año en footer (si existe)
  const y = document.getElementById('y');
  if(y) y.textContent = new Date().getFullYear();

  // helpers formulario
  function buildMsg(d){
    return `Hola Omnia Control,%0AQuiero una cotización:%0A`+
      `Nombre: ${encodeURIComponent(d.nombre||'') }%0A`+
      `Tel/WhatsApp: ${encodeURIComponent(d.telefono||'') }%0A`+
      `Correo: ${encodeURIComponent(d.correo||'') }%0A`+
      `Servicio: ${encodeURIComponent(d.servicio||'') }%0A`+
      `Sector: ${encodeURIComponent(d.sector||'') }%0A`+
      `Mensaje: ${encodeURIComponent(d.mensaje||'') }%0A`;
  }

  const form = document.getElementById('formCotiza');
  if(form){
    form.addEventListener('submit', e=>{
      e.preventDefault();
      const d = Object.fromEntries(new FormData(form).entries());
      const pref = (d.preferencia||'whatsapp').toLowerCase();

      if(pref==='whatsapp' || pref==='ambos'){
        const wa = `https://wa.me/50765127653?text=${buildMsg(d)}`;
        window.open(wa,'_blank');
      }
      if(pref==='correo' || pref==='ambos'){
        const subject = encodeURIComponent('Solicitud de cotización — Omnia Control');
        const body = decodeURIComponent(buildMsg(d)).replaceAll('%0A','\n');
        window.location.href = `mailto:info@omniacontrol.com?subject=${subject}&body=${encodeURIComponent(body)}`;
      }
    });

    const btnLimpiar = document.getElementById('btnLimpiar');
    if(btnLimpiar) btnLimpiar.addEventListener('click', ()=>form.reset());
  }

  // Galería (lightbox)
  const viewer = document.getElementById('viewer');
  const viewerImg = document.getElementById('viewerImg');
  if(viewer && viewerImg){
    document.querySelectorAll('.gallery img').forEach(img=>{
      img.addEventListener('click', ()=>{
        viewerImg.src = img.src;
        viewer.showModal();
      });
    });
  }

  // Header interactions
  wireHeader();
}

document.addEventListener('DOMContentLoaded', async ()=>{
  // Inyectar header/footer en todas las páginas
  const headerMount = document.getElementById('site-header');
  const footerMount = document.getElementById('site-footer');

  if(headerMount) await loadPartial('#site-header','/partials/header.html');
  if(footerMount) await loadPartial('#site-footer','/partials/footer.html');

  initSite();
});
