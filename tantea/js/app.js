/* =========================================================
   Tantea · app.js
   Código compartido: formato de precios, carrito, header,
   footer y los componentes que usan varias páginas.
   Se carga después de data.js y antes del script de cada página.
   ========================================================= */

(function () {
  "use strict";

  var DATA = window.TANTEA_DATA;
  var ROOT = document.body.dataset.root || "";   // "" en index.html, "../" en pages/
  var PAGES = ROOT + "pages/";

  /* ---------- Utilidades ---------- */

  function esc(text) {
    return String(text).replace(/[&<>"']/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
    });
  }

  // 4000000 -> "$4.000.000"
  function fmt(n) {
    return "$" + Math.round(n).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
  }

  function param(name) {
    return new URLSearchParams(window.location.search).get(name) || "";
  }

  function normalizar(text) {
    return String(text).toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "");
  }

  /* ---------- Productos ---------- */

  function producto(id) {
    return DATA.productos.filter(function (p) { return p.id === id; })[0] || null;
  }

  // Ofertas ordenadas de menor a mayor, más resumen de ahorro.
  function resumen(p) {
    var ofertas = p.ofertas.slice().sort(function (a, b) { return a.precio - b.precio; });
    var mejor = ofertas[0];
    var peor = ofertas[ofertas.length - 1];
    var ahorro = peor.precio - mejor.precio;
    return {
      ofertas: ofertas,
      mejor: mejor,
      peor: peor,
      ahorro: ahorro,
      porcentaje: Math.round((ahorro / peor.precio) * 100),
      tienda: DATA.tiendas[mejor.tienda]
    };
  }

  /* ---------- Carrito (localStorage, con respaldo en memoria) ---------- */

  var MSG_SIN_ALMACENAMIENTO = "Tu navegador no deja guardar tus datos. Se perderán al cambiar de página o cerrarla.";
  var KEY = "tantea.carrito";
  var memoria = [];
  var sinAlmacenamiento = false;   // true cuando el navegador no deja guardar

  function leerCarrito() {
    if (sinAlmacenamiento) return memoria;
    try {
      var guardado = JSON.parse(localStorage.getItem(KEY) || "[]");
      return Array.isArray(guardado) ? guardado : [];
    } catch (e) {
      return memoria;
    }
  }

  function guardarCarrito(items) {
    memoria = items;
    try {
      localStorage.setItem(KEY, JSON.stringify(items));
    } catch (e) {
      // Heurística 9: decir qué pasó y qué significa, una sola vez.
      if (!sinAlmacenamiento) {
        sinAlmacenamiento = true;
        aviso(MSG_SIN_ALMACENAMIENTO);
      }
    }
    actualizarContador();
    document.dispatchEvent(new CustomEvent("tantea:carrito"));
  }

  var carrito = {
    items: leerCarrito,
    cantidadTotal: function () {
      return leerCarrito().reduce(function (s, i) { return s + i.cantidad; }, 0);
    },
    agregar: function (id) {
      var items = leerCarrito();
      var existente = items.filter(function (i) { return i.id === id; })[0];
      if (existente) { existente.cantidad = Math.min(existente.cantidad + 1, 9); }
      else { items.push({ id: id, cantidad: 1 }); }
      guardarCarrito(items);
    },
    cambiar: function (id, cantidad) {
      var items = leerCarrito().map(function (i) {
        return i.id === id ? { id: id, cantidad: Math.max(1, Math.min(cantidad, 9)) } : i;
      });
      guardarCarrito(items);
    },
    quitar: function (id) {
      guardarCarrito(leerCarrito().filter(function (i) { return i.id !== id; }));
    },
    // Restaura una lista completa (se usa para "Deshacer").
    reemplazar: function (items) {
      guardarCarrito(items);
    },
    cantidadDe: function (id) {
      var i = leerCarrito().filter(function (x) { return x.id === id; })[0];
      return i ? i.cantidad : 0;
    }
  };

  /* ---------- Almacén genérico (favoritos y métodos de pago) ---------- */

  var memGen = {};
  var sinAlmGen = false;

  function leerLS(key, def) {
    if (sinAlmGen && key in memGen) return memGen[key];
    try {
      var v = JSON.parse(localStorage.getItem(key));
      return v === null || v === undefined ? def : v;
    } catch (e) {
      return key in memGen ? memGen[key] : def;
    }
  }

  function guardarLS(key, val) {
    memGen[key] = val;
    try {
      localStorage.setItem(key, JSON.stringify(val));
    } catch (e) {
      if (!sinAlmGen) { sinAlmGen = true; aviso(MSG_SIN_ALMACENAMIENTO); }
    }
  }

  /* ---------- Favoritos ---------- */

  function leerFavoritos() {
    var lista = leerLS("tantea.favoritos", []);
    return Array.isArray(lista) ? lista.filter(function (id) { return !!producto(id); }) : [];
  }

  function guardarFavoritos(lista) {
    guardarLS("tantea.favoritos", lista);
    actualizarContador();
    document.dispatchEvent(new CustomEvent("tantea:favoritos"));
  }

  var favoritos = {
    lista: leerFavoritos,
    tiene: function (id) { return leerFavoritos().indexOf(id) !== -1; },
    // Devuelve true si el producto quedó guardado, false si se quitó.
    alternar: function (id) {
      var lista = leerFavoritos();
      var i = lista.indexOf(id);
      if (i === -1) lista.push(id); else lista.splice(i, 1);
      guardarFavoritos(lista);
      return i === -1;
    },
    reemplazar: guardarFavoritos
  };

  // Deja todos los corazones de la página con el estado correcto.
  function sincronizarFavoritos() {
    var lista = leerFavoritos();
    document.querySelectorAll("[data-fav]").forEach(function (b) {
      var on = lista.indexOf(b.dataset.fav) !== -1;
      var p = producto(b.dataset.fav);
      var etiqueta = b.querySelector(".fav-label");
      b.classList.toggle("is-on", on);
      b.dataset.tip = on ? "Quitar de favoritos" : "Guardar en favoritos";
      if (etiqueta) {
        // Botón con texto: el texto dice el estado.
        etiqueta.textContent = on ? "Guardado en favoritos" : "Guardar en favoritos";
        b.removeAttribute("aria-pressed");
      } else {
        // Botón de solo icono: nombre fijo y estado en aria-pressed.
        b.setAttribute("aria-pressed", on);
        b.setAttribute("aria-label", "Guardar " + (p ? p.nombre : "producto") + " en favoritos");
      }
    });
  }

  /* ---------- Métodos de pago ----------
     Solo se guardan datos no sensibles: marca, últimos 4 dígitos, vencimiento
     y titular. El número completo y el código de seguridad nunca se guardan. */

  var TIPOS_PAGO = { tarjeta: "Tarjeta", nequi: "Nequi", pse: "PSE" };

  function leerPagos() {
    var e = leerLS("tantea.pagos", null);
    if (!e || !Array.isArray(e.metodos)) return { metodos: [], predeterminado: null };
    return e;
  }

  function guardarPagos(estado) {
    guardarLS("tantea.pagos", estado);
    document.dispatchEvent(new CustomEvent("tantea:pagos"));
  }

  function etiquetaPago(m) {
    if (m.tipo === "tarjeta") return m.marca + " •••• " + m.ultimos4;
    if (m.tipo === "nequi") return "Nequi ••• ••• " + m.ultimos4;
    return "PSE, " + m.banco;
  }

  var pagos = {
    tipos: TIPOS_PAGO,
    estado: leerPagos,
    metodos: function () { return leerPagos().metodos; },
    predeterminado: function () {
      var e = leerPagos();
      return e.metodos.filter(function (m) { return m.id === e.predeterminado; })[0] || null;
    },
    agregar: function (metodo, comoPredeterminado) {
      var e = leerPagos();
      metodo.id = "m" + Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
      e.metodos.push(metodo);
      if (comoPredeterminado || !e.predeterminado) e.predeterminado = metodo.id;
      guardarPagos(e);
      return metodo;
    },
    quitar: function (id) {
      var e = leerPagos();
      e.metodos = e.metodos.filter(function (m) { return m.id !== id; });
      if (e.predeterminado === id) e.predeterminado = e.metodos.length ? e.metodos[0].id : null;
      guardarPagos(e);
    },
    fijarPredeterminado: function (id) {
      var e = leerPagos();
      e.predeterminado = id;
      guardarPagos(e);
    },
    reemplazar: guardarPagos,
    etiqueta: etiquetaPago,
    // ¿La tienda acepta este método?
    acepta: function (tiendaKey, metodo) {
      var t = DATA.tiendas[tiendaKey];
      return !!t && t.aceptan.indexOf(metodo.tipo) !== -1;
    }
  };

  function actualizarContador() {
    var total = carrito.cantidadTotal();
    document.querySelectorAll(".cart-count").forEach(function (el) {
      el.textContent = total;
      el.hidden = total === 0;
    });
    var enlace = document.querySelector(".cart-link");
    if (enlace) {
      enlace.setAttribute("aria-label", total ? "Carrito, " + total + " producto" + (total === 1 ? "" : "s") : "Carrito vacío");
    }

    var nf = leerFavoritos().length;
    document.querySelectorAll(".fav-count").forEach(function (el) {
      el.textContent = nf;
      el.hidden = nf === 0;
    });
    var enlaceFav = document.querySelector(".fav-link");
    if (enlaceFav) {
      enlaceFav.setAttribute("aria-label", nf ? "Favoritos, " + nf + " producto" + (nf === 1 ? "" : "s") : "Favoritos");
    }
  }

  /* ---------- Aviso breve ---------- */

  // aviso("texto")                              solo informa
  // aviso("texto", { texto: "Deshacer", fn })   agrega un botón con una acción
  // aviso("texto", { texto: "Ver carrito", href })   agrega un enlace
  var toastEl, toastTimer;
  function aviso(mensaje, accion) {
    if (!toastEl) {
      toastEl = document.createElement("div");
      toastEl.className = "toast";
      toastEl.setAttribute("role", "status");
      document.body.appendChild(toastEl);
    }
    toastEl.textContent = "";
    var span = document.createElement("span");
    span.textContent = mensaje;
    toastEl.appendChild(span);

    if (accion) {
      var el = document.createElement(accion.href ? "a" : "button");
      el.className = "toast-action";
      el.textContent = accion.texto;
      if (accion.href) { el.href = accion.href; }
      else {
        el.type = "button";
        el.addEventListener("click", function () {
          accion.fn();
          toastEl.classList.remove("is-on");
        });
      }
      toastEl.appendChild(el);
    }

    toastEl.classList.add("is-on");
    clearTimeout(toastTimer);
    // Con acción, más tiempo para que dé tiempo de usarla.
    toastTimer = setTimeout(function () { toastEl.classList.remove("is-on"); }, accion ? 6000 : 2400);
  }

  /* ---------- Componentes ---------- */

  var ICONO_CARRITO =
    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' +
    '<path d="M3 4h2l2.4 10.2a2 2 0 0 0 2 1.6h7.4a2 2 0 0 0 2-1.5L20 8H6.2"/><circle cx="10" cy="20" r="1.4"/><circle cx="17" cy="20" r="1.4"/></svg>';

  var ICONO_CORAZON =
    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' +
    '<path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>';

  var MARCA =
    '<svg viewBox="0 0 28 28" aria-hidden="true">' +
    '<rect x="2" y="4" width="24" height="5.5" rx="2.75" fill="currentColor"/>' +
    '<rect x="2" y="11.25" width="17" height="5.5" rx="2.75" fill="currentColor"/>' +
    '<rect x="2" y="18.5" width="10" height="5.5" rx="2.75" fill="#ff6b5b"/></svg>';

  function tiendaDot(t) {
    return '<span class="store-dot" style="background:' + t.fondo + ";color:" + t.texto + '" aria-hidden="true">' + esc(t.sigla) + "</span>";
  }

  function escalera(p) {
    var r = resumen(p);
    var filas = r.ofertas.map(function (o, i) {
      var t = DATA.tiendas[o.tienda];
      var mejor = i === 0;
      var delta = mejor ? "" : "+" + fmt(o.precio - r.mejor.precio);
      return (
        '<li class="ladder-row' + (mejor ? " is-best" : "") + '">' +
          '<span class="ladder-store">' + tiendaDot(t) + esc(t.nombre) +
            (mejor ? '<span class="best-tag">Mejor precio</span>' : "") +
          "</span>" +
          '<span class="ladder-amount"><span class="ladder-price num">' + fmt(o.precio) + "</span>" +
            '<span class="ladder-delta num">' + delta + "</span></span>" +
          '<span class="ladder-bar" aria-hidden="true"><i style="--w:' + ((o.precio / r.peor.precio) * 100).toFixed(1) + "%;--i:" + i + '"></i></span>' +
        "</li>"
      );
    });
    return '<ol class="ladder" aria-label="Precio de ' + esc(p.nombre) + ' en cada tienda">' + filas.join("") + "</ol>";
  }

  // Botón de corazón de solo icono (se dibuja encima de la foto de la tarjeta).
  function corazon(p) {
    var on = favoritos.tiene(p.id);
    return '<button type="button" class="fav' + (on ? " is-on" : "") + '" data-fav="' + esc(p.id) + '" aria-pressed="' + on +
      '" aria-label="Guardar ' + esc(p.nombre) + ' en favoritos" data-tip="' + (on ? "Quitar de favoritos" : "Guardar en favoritos") + '">' +
      ICONO_CORAZON + "</button>";
  }

  // Botón "?" que muestra una explicación breve al pasar el cursor, enfocarlo o tocarlo.
  function info(texto) {
    return '<button type="button" class="tip-btn" data-tip="' + esc(texto) + '" aria-label="Más información">?</button>';
  }

  function tarjeta(p) {
    var r = resumen(p);
    return (
      '<article class="card">' +
        corazon(p) +
        '<div class="card-media"><img src="' + ROOT + esc(p.imagen) + '" alt="' + esc(p.alt) + '" width="302" height="206" loading="lazy"></div>' +
        '<div class="card-body">' +
          '<h3 class="card-name"><a href="' + PAGES + "producto.html?id=" + encodeURIComponent(p.id) + '">' + esc(p.nombre) + "</a></h3>" +
          '<p class="card-from">Desde en ' + esc(r.tienda.nombre) + "</p>" +
          '<p class="card-price num">' + fmt(r.mejor.precio) + "</p>" +
          '<div class="card-foot">' +
            '<span class="saving num">Hasta ' + fmt(r.ahorro) + " menos</span>" +
            '<button type="button" class="btn btn--small btn--ghost card-add" data-add="' + esc(p.id) + '">Agregar al carrito</button>' +
          "</div>" +
        "</div>" +
      "</article>"
    );
  }

  // Un solo manejador para todos los botones "Agregar al carrito".
  document.addEventListener("click", function (e) {
    var btn = e.target.closest("[data-add]");
    if (!btn) return;
    var p = producto(btn.dataset.add);
    carrito.agregar(btn.dataset.add);

    // Heurística 1: el propio botón confirma lo que pasó, además del aviso.
    if (!btn.dataset.original) btn.dataset.original = btn.innerHTML;
    btn.classList.add("is-added");
    btn.textContent = "Agregado ✓";
    clearTimeout(btn._t);
    btn._t = setTimeout(function () {
      btn.innerHTML = btn.dataset.original;
      btn.classList.remove("is-added");
      delete btn.dataset.original;
    }, 1600);

    aviso((p ? p.nombre : "Producto") + " agregado al carrito", { texto: "Ver carrito", href: PAGES + "carrito.html" });
  });

  // Heurística 7: atajo de teclado. "/" lleva el cursor al buscador.
  document.addEventListener("keydown", function (e) {
    if (e.key !== "/" || e.ctrlKey || e.metaKey || e.altKey) return;
    var t = e.target, tag = t && t.tagName;
    if (tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT" || (t && t.isContentEditable)) return;
    var campo = document.getElementById("buscar");
    if (campo) { e.preventDefault(); campo.focus(); campo.select(); }
  });

  // Un solo manejador para todos los corazones.
  document.addEventListener("click", function (e) {
    var btn = e.target.closest("[data-fav]");
    if (!btn) return;
    var id = btn.dataset.fav;
    var p = producto(id);
    var nombre = p ? p.nombre : "Producto";
    var antes = favoritos.lista();
    var guardado = favoritos.alternar(id);
    if (guardado) {
      aviso(nombre + " guardado en favoritos", { texto: "Ver favoritos", href: PAGES + "favoritos.html" });
    } else {
      aviso(nombre + " quitado de favoritos", { texto: "Deshacer", fn: function () { favoritos.reemplazar(antes); } });
    }
  });
  document.addEventListener("tantea:favoritos", sincronizarFavoritos);

  /* ---------- Tooltips ----------
     Cualquier elemento con data-tip="texto" muestra una burbuja al pasar el
     cursor o enfocarlo con el teclado. Los botones "?" también la fijan al
     tocarlos (móvil). Escape la cierra. Una sola burbuja para toda la página. */

  var tipEl = null, tipObjetivo = null, tipFijo = false;

  function tipMostrar(el) {
    if (!tipEl) {
      tipEl = document.createElement("div");
      tipEl.id = "tooltip-global";
      tipEl.className = "tooltip";
      tipEl.setAttribute("role", "tooltip");
      tipEl.hidden = true;
      document.body.appendChild(tipEl);
    }
    if (tipObjetivo && tipObjetivo !== el) tipObjetivo.removeAttribute("aria-describedby");
    tipObjetivo = el;
    tipEl.textContent = el.dataset.tip;
    tipEl.hidden = false;
    el.setAttribute("aria-describedby", "tooltip-global");

    var r = el.getBoundingClientRect();
    var w = tipEl.offsetWidth, h = tipEl.offsetHeight;
    var left = Math.max(8, Math.min(r.left + r.width / 2 - w / 2, window.innerWidth - w - 8));
    var top = r.top - h - 10;
    if (top < 8) top = r.bottom + 10;
    tipEl.style.left = left + "px";
    tipEl.style.top = top + "px";
  }

  function tipOcultar() {
    if (!tipEl || tipEl.hidden) return;
    tipEl.hidden = true;
    tipFijo = false;
    if (tipObjetivo) tipObjetivo.removeAttribute("aria-describedby");
    tipObjetivo = null;
  }

  document.addEventListener("mouseover", function (e) {
    var t = e.target.closest("[data-tip]");
    if (t) tipMostrar(t);
  });
  document.addEventListener("mouseout", function (e) {
    var t = e.target.closest("[data-tip]");
    if (t && !tipFijo && !t.contains(e.relatedTarget)) tipOcultar();
  });
  document.addEventListener("focusin", function (e) {
    var t = e.target.closest("[data-tip]");
    if (t) tipMostrar(t);
  });
  document.addEventListener("focusout", function (e) {
    if (e.target.closest("[data-tip]") && !tipFijo) tipOcultar();
  });
  document.addEventListener("click", function (e) {
    var t = e.target.closest("[data-tip]");
    if (t && t.classList.contains("tip-btn")) {
      if (tipFijo && tipObjetivo === t) { tipOcultar(); }
      else { tipMostrar(t); tipFijo = true; }
    } else {
      tipOcultar();
    }
  });
  document.addEventListener("keydown", function (e) { if (e.key === "Escape") tipOcultar(); });
  window.addEventListener("scroll", tipOcultar, true);
  window.addEventListener("resize", tipOcultar);

  /* ---------- Header y footer ---------- */

  function pintarLayout() {
    var pagina = document.body.dataset.page || "";
    var header = document.getElementById("site-header");
    var footer = document.getElementById("site-footer");

    if (header) {
      header.className = "site-header";
      header.innerHTML =
        '<div class="wrap header-row">' +
          '<button type="button" class="icon-btn menu-btn" aria-label="Abrir menú" aria-expanded="false" aria-controls="nav-principal">' +
            '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" aria-hidden="true"><path d="M4 7h16M4 12h16M4 17h16"/></svg></button>' +
          '<a class="brand" href="' + ROOT + 'index.html" aria-label="Tantea, ir al inicio">' + MARCA + "Tantea</a>" +
          '<nav class="nav" id="nav-principal" aria-label="Principal">' +
            '<a href="' + ROOT + 'index.html"' + (pagina === "inicio" ? ' aria-current="page"' : "") + ">Inicio</a>" +
            '<a href="' + PAGES + 'productos.html"' + (pagina === "productos" ? ' aria-current="page"' : "") + ">Productos</a>" +
            '<a href="' + PAGES + 'pago.html"' + (pagina === "pago" ? ' aria-current="page"' : "") + ">Pagos</a>" +
            '<a href="' + PAGES + 'ayuda.html"' + (pagina === "ayuda" ? ' aria-current="page"' : "") + ">Ayuda</a>" +
          "</nav>" +
          '<form class="search" role="search" action="' + PAGES + 'productos.html" method="get">' +
            '<label class="sr-only" for="buscar">Buscar productos</label>' +
            '<input id="buscar" name="q" type="search" placeholder="Busca un producto" autocomplete="off" list="sugerencias" aria-keyshortcuts="/">' +
            '<kbd class="kbd-hint" aria-hidden="true" title="Pulsa / para buscar">/</kbd>' +
            '<datalist id="sugerencias">' + DATA.productos.map(function (p) { return '<option value="' + esc(p.nombre) + '"></option>'; }).join("") + "</datalist>" +
            '<button type="submit" aria-label="Buscar"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" aria-hidden="true"><circle cx="11" cy="11" r="7"/><path d="M20 20l-4-4"/></svg></button>' +
          "</form>" +
          '<a class="icon-btn fav-link" href="' + PAGES + 'favoritos.html" aria-label="Favoritos" data-tip="Favoritos">' + ICONO_CORAZON + '<span class="fav-count" hidden>0</span></a>' +
          '<a class="icon-btn cart-link" href="' + PAGES + 'carrito.html" aria-label="Carrito" data-tip="Carrito">' + ICONO_CARRITO + '<span class="cart-count" hidden>0</span></a>' +
        "</div>";

      var menu = header.querySelector(".menu-btn");
      menu.addEventListener("click", function () {
        var abierto = header.classList.toggle("is-open");
        menu.setAttribute("aria-expanded", abierto);
        menu.setAttribute("aria-label", abierto ? "Cerrar menú" : "Abrir menú");
      });
    }

    if (footer) {
      footer.className = "site-footer";
      footer.innerHTML =
        '<div class="wrap footer-row">' +
          '<a class="brand" href="' + ROOT + 'index.html">' + MARCA + "Tantea</a>" +
          '<p class="footer-note">Prototipo de diseño. Los precios y las tiendas son de ejemplo y no son ofertas reales.</p>' +
          '<nav aria-label="Pie de página"><a href="' + ROOT + 'index.html">Inicio</a><a href="' + PAGES + 'productos.html">Productos</a><a href="' + PAGES + 'favoritos.html">Favoritos</a><a href="' + PAGES + 'carrito.html">Carrito</a><a href="' + PAGES + 'pago.html">Pagos</a><a href="' + PAGES + 'ayuda.html">Ayuda</a></nav>' +
        "</div>";
    }

    actualizarContador();
  }

  window.addEventListener("storage", function () { actualizarContador(); sincronizarFavoritos(); });

  window.Tantea = {
    data: DATA, root: ROOT, pages: PAGES, pagina: document.body.dataset.page || "",
    esc: esc, fmt: fmt, param: param, normalizar: normalizar,
    producto: producto, resumen: resumen,
    carrito: carrito, favoritos: favoritos, pagos: pagos, aviso: aviso,
    sincronizarFavoritos: sincronizarFavoritos,
    escalera: escalera, tarjeta: tarjeta, tiendaDot: tiendaDot, info: info,
    iconoCarrito: ICONO_CARRITO, iconoCorazon: ICONO_CORAZON
  };

  pintarLayout();
})();
