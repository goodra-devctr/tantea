/* Tantea · home.js — página de inicio */
(function () {
  "use strict";
  var T = window.Tantea;

  // Tarjeta del hero: muestra la escalera de precios de un producto de ejemplo.
  var ejemplo = T.producto("lg-tv");
  var hero = document.getElementById("hero-card");
  if (ejemplo && hero) {
    var r = T.resumen(ejemplo);
    hero.innerHTML =
      '<div class="hero-card-head">' +
        '<img src="' + T.root + T.esc(ejemplo.imagen) + '" alt="' + T.esc(ejemplo.alt) + '" width="96" height="66">' +
        "<div>" +
          '<h2><a href="' + T.pages + "producto.html?id=" + encodeURIComponent(ejemplo.id) + '">' + T.esc(ejemplo.nombre) + "</a></h2>" +
          '<p class="saving num">Hasta ' + T.fmt(r.ahorro) + " menos según la tienda</p>" +
        "</div>" +
      "</div>" +
      T.escalera(ejemplo);
  }

  // Productos destacados
  var destacados = document.getElementById("destacados");
  if (destacados) {
    destacados.innerHTML = T.data.productos.slice(0, 6).map(T.tarjeta).join("");
  }

  // Tiendas
  var tiendas = document.getElementById("tiendas");
  if (tiendas) {
    tiendas.innerHTML = Object.keys(T.data.tiendas).map(function (k) {
      var t = T.data.tiendas[k];
      return '<a class="store-pill" href="' + T.esc(t.url) + '" target="_blank" rel="noopener noreferrer">' +
        T.tiendaDot(t) + T.esc(t.nombre) + "</a>";
    }).join("");
  }
})();
