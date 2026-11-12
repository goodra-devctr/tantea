/* Tantea · favoritos.js — productos guardados con su mejor precio actual */
(function () {
  "use strict";
  var T = window.Tantea;
  var cont = document.getElementById("contenido");
  var conteo = document.getElementById("conteo");
  var titulo = document.getElementById("titulo");

  function pintar() {
    var lista = T.favoritos.lista().map(T.producto).filter(Boolean);

    if (!lista.length) {
      conteo.textContent = "";
      cont.innerHTML =
        '<div class="empty">' +
          "<h2>Aún no tienes favoritos</h2>" +
          "<p>Toca el corazón de un producto para guardarlo aquí y ver su mejor precio cuando quieras.</p>" +
          '<a class="btn" href="productos.html">Ver productos</a>' +
        "</div>";
      return;
    }

    conteo.textContent = lista.length + (lista.length === 1 ? " producto guardado" : " productos guardados");
    cont.innerHTML = '<div class="grid">' + lista.map(T.tarjeta).join("") + "</div>";
  }

  // Al quitar un favorito se vuelve a dibujar la lista. Se lleva el foco al título
  // para que quien usa teclado no pierda su lugar.
  document.addEventListener("tantea:favoritos", function () {
    pintar();
    titulo.focus();
  });

  pintar();
})();
