/* Tantea · producto.js — detalle con comparación de tiendas
   Uso: producto.html?id=lg-tv */
(function () {
  "use strict";
  var T = window.Tantea;
  var cont = document.getElementById("contenido");
  var p = T.producto(T.param("id"));

  if (!p) {
    document.title = "Producto no encontrado | Tantea";
    cont.innerHTML =
      '<div class="empty">' +
        "<h1>No encontramos ese producto</h1>" +
        "<p>Puede que el enlace esté incompleto o que el producto ya no esté en el catálogo.</p>" +
        '<a class="btn" href="productos.html">Ver todos los productos</a>' +
      "</div>";
    return;
  }

  var r = T.resumen(p);
  document.title = p.nombre + " al mejor precio | Tantea";

  cont.innerHTML =
    '<nav class="crumbs" aria-label="Ruta"><ol>' +
      '<li><a href="../index.html">Inicio</a></li>' +
      '<li><a href="productos.html">Productos</a></li>' +
      '<li><span aria-current="page">' + T.esc(p.nombre) + "</span></li>" +
    "</ol></nav>" +

    '<div class="detail">' +
      '<figure class="gallery" style="margin:0">' +
        '<img src="../' + T.esc(p.imagen) + '" alt="' + T.esc(p.alt) + '" width="302" height="206">' +
        "<figcaption>Imagen de referencia del producto</figcaption>" +
      "</figure>" +

      "<div>" +
        "<h1>" + T.esc(p.nombre) + "</h1>" +
        '<p class="lead">' + T.esc(p.descripcion) + "</p>" +

        '<div class="best">' +
          '<p class="best-label">Mejor precio hoy' + T.info("Es el precio más bajo entre las tiendas que comparamos. No incluye el envío.") + "</p>" +
          '<p class="best-price num">' + T.fmt(r.mejor.precio) + "<small>COP</small></p>" +
          '<p class="best-where">' + T.tiendaDot(r.tienda) + "<span>en " + T.esc(r.tienda.nombre) + "</span>" +
            '<span class="saving num">' + r.porcentaje + "% menos que la tienda más cara</span>" +
            T.info("Es la diferencia entre el precio más alto y el más bajo, en porcentaje.") + "</p>" +
          '<div class="actions">' +
            '<button type="button" class="btn" data-add="' + T.esc(p.id) + '">' + T.iconoCarrito + "Agregar al carrito</button>" +
            '<button type="button" class="btn btn--ghost fav-btn" data-fav="' + T.esc(p.id) + '">' + T.iconoCorazon + '<span class="fav-label">Guardar en favoritos</span></button>' +
            '<a class="btn btn--ghost" href="' + T.esc(r.tienda.url) + '" target="_blank" rel="noopener noreferrer">Ir a ' + T.esc(r.tienda.nombre) +
              '<span aria-hidden="true">↗</span><span class="sr-only"> (se abre en una pestaña nueva)</span></a>' +
          "</div>" +
          '<p class="in-cart" id="en-carrito" aria-live="polite"></p>' +
        "</div>" +

        '<section class="compare" aria-labelledby="t-comparar">' +
          '<h2 id="t-comparar">Precio en cada tienda' + T.info("Cada barra compara el precio de la tienda con el de la más cara. El valor con “+” es lo que pagarías de más frente a la más barata.") + "</h2>" +
          "<p>De menor a mayor. Cada barra muestra el precio frente a la tienda más cara. Te ahorras " + T.fmt(r.ahorro) + " si compras en la más barata.</p>" +
          T.escalera(p) +
          // Heurística 10: ayuda justo donde se necesita, sin salir de la página.
          '<details class="help">' +
            "<summary>¿Cómo leer esta comparación?</summary>" +
            "<p>Las tiendas van de la más barata a la más cara. La barra muestra el precio de cada tienda frente al de la más cara. El valor con “+” debajo del precio es cuánto más pagarías que en la tienda más barata.</p>" +
            '<p>Los precios de este prototipo son de ejemplo. <a href="ayuda.html">Ver más preguntas</a></p>' +
          "</details>" +
        "</section>" +
      "</div>" +
    "</div>";

  T.sincronizarFavoritos();

  // Heurística 1: dice si el producto ya está en el carrito y se actualiza solo.
  var estado = document.getElementById("en-carrito");
  function pintarEstado() {
    var n = T.carrito.cantidadDe(p.id);
    estado.innerHTML = n
      ? "Ya tienes " + n + (n === 1 ? " unidad" : " unidades") + ' en tu carrito. <a href="carrito.html">Ver carrito</a>'
      : "";
  }
  document.addEventListener("tantea:carrito", pintarEstado);
  pintarEstado();
})();
