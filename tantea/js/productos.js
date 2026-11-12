/* Tantea · productos.js — listado con búsqueda, categoría y orden */
(function () {
  "use strict";
  var T = window.Tantea;

  var consulta = T.param("q").trim();
  var categoria = "Todos";
  var orden = "precio";

  var categorias = ["Todos"].concat(
    T.data.productos.map(function (p) { return p.categoria; })
      .filter(function (c, i, a) { return a.indexOf(c) === i; })
  );

  var elFiltros = document.getElementById("filtros");
  var elOrden = document.getElementById("orden");
  var elResultados = document.getElementById("resultados");
  var elConteo = document.getElementById("conteo");
  var elTitulo = document.getElementById("titulo");

  // Pone el texto buscado en el campo del header, y como título.
  var campo = document.getElementById("buscar");
  if (campo) campo.value = consulta;
  if (consulta) {
    elTitulo.textContent = "Resultados para “" + consulta + "”";
    document.title = consulta + " | Tantea";
    // Heurística 3: salida clara de una búsqueda.
    var borrar = document.createElement("a");
    borrar.className = "clear-search";
    borrar.href = "productos.html";
    borrar.textContent = "Borrar búsqueda";
    elConteo.insertAdjacentElement("afterend", borrar);
  }

  function pintarFiltros() {
    elFiltros.innerHTML = categorias.map(function (c) {
      return '<button type="button" class="chip" data-cat="' + T.esc(c) + '" aria-pressed="' + (c === categoria) + '">' + T.esc(c) + "</button>";
    }).join("");
  }

  function filtrar() {
    var q = T.normalizar(consulta);
    var lista = T.data.productos.filter(function (p) {
      var coincideTexto = !q || T.normalizar(p.nombre + " " + p.categoria).indexOf(q) !== -1;
      var coincideCat = categoria === "Todos" || p.categoria === categoria;
      return coincideTexto && coincideCat;
    });

    lista.sort(function (a, b) {
      if (orden === "nombre") return a.nombre.localeCompare(b.nombre, "es");
      var ra = T.resumen(a), rb = T.resumen(b);
      return orden === "ahorro" ? rb.ahorro - ra.ahorro : ra.mejor.precio - rb.mejor.precio;
    });
    return lista;
  }

  function pintar() {
    var lista = filtrar();
    elConteo.textContent = lista.length === 1 ? "1 producto" : lista.length + " productos";

    if (!lista.length) {
      elResultados.innerHTML =
        '<div class="empty">' +
          "<h2>No encontramos ese producto</h2>" +
          "<p>Revisa cómo está escrito o prueba con una palabra más corta, como “TV” o “consola”. También puedes explorar por categoría.</p>" +
          '<div class="filters">' +
            categorias.slice(1).map(function (c) {
              return '<a class="chip" href="productos.html?q=' + encodeURIComponent(c) + '">' + T.esc(c) + "</a>";
            }).join("") +
          "</div>" +
          '<a class="btn" href="productos.html">Ver todos los productos</a>' +
        "</div>";
      return;
    }
    elResultados.innerHTML = '<div class="grid">' + lista.map(T.tarjeta).join("") + "</div>";
  }

  elFiltros.addEventListener("click", function (e) {
    var btn = e.target.closest("[data-cat]");
    if (!btn) return;
    categoria = btn.dataset.cat;
    pintarFiltros();
    pintar();
  });
  elOrden.addEventListener("change", function () { orden = elOrden.value; pintar(); });

  pintarFiltros();
  pintar();
})();
