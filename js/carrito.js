/* Tantea · carrito.js — productos al mejor precio, agrupados por tienda */
(function () {
  "use strict";
  var T = window.Tantea;
  var cont = document.getElementById("contenido");
  var conteo = document.getElementById("conteo");

  function lineas() {
    return T.carrito.items()
      .map(function (i) {
        var p = T.producto(i.id);
        return p ? { p: p, r: T.resumen(p), cantidad: i.cantidad } : null;
      })
      .filter(Boolean);
  }

  function vacio() {
    conteo.textContent = "";
    cont.innerHTML =
      '<div class="empty">' +
        "<h2>Tu carrito está vacío</h2>" +
        "<p>Agrega productos para ver cuánto pagarías en total y en qué tienda conviene comprar cada uno.</p>" +
        '<a class="btn" href="productos.html">Ver productos</a>' +
      "</div>";
  }

  function pintar() {
    var items = lineas();
    if (!items.length) return vacio();

    var unidades = items.reduce(function (s, l) { return s + l.cantidad; }, 0);
    conteo.textContent = unidades + (unidades === 1 ? " producto" : " productos");

    var total = 0, totalCaro = 0, porTienda = {};
    items.forEach(function (l) {
      total += l.r.mejor.precio * l.cantidad;
      totalCaro += l.r.peor.precio * l.cantidad;
      var k = l.r.mejor.tienda;
      (porTienda[k] = porTienda[k] || []).push(l);
    });

    var filas = items.map(function (l) {
      var id = T.esc(l.p.id);
      return (
        '<li class="cart-item">' +
          '<img src="../' + T.esc(l.p.imagen) + '" alt="' + T.esc(l.p.alt) + '" width="302" height="206">' +
          '<div class="cart-info">' +
            '<h2><a href="producto.html?id=' + encodeURIComponent(l.p.id) + '">' + T.esc(l.p.nombre) + "</a></h2>" +
            "<p>Mejor precio en " + T.esc(l.r.tienda.nombre) + "</p>" +
            '<button type="button" class="cart-remove" data-quitar="' + id + '">Quitar</button>' +
          "</div>" +
          '<div class="qty" role="group" aria-label="Cantidad de ' + T.esc(l.p.nombre) + '">' +
            '<button type="button" data-menos="' + id + '" aria-label="Quitar una unidad"' + (l.cantidad <= 1 ? " disabled" : "") + ">−</button>" +
            "<output>" + l.cantidad + "</output>" +
            '<button type="button" data-mas="' + id + '" aria-label="Agregar una unidad"' + (l.cantidad >= 9 ? " disabled" : "") + ">+</button>" +
          "</div>" +
          '<p class="cart-price num">' + T.fmt(l.r.mejor.precio * l.cantidad) + "</p>" +
        "</li>"
      );
    }).join("");

    // Método de pago elegido: se avisa ANTES de salir a la tienda si no lo acepta (heurística 5).
    var pred = T.pagos.predeterminado();

    var tiendas = Object.keys(porTienda).map(function (k) {
      var t = T.data.tiendas[k];
      var n = porTienda[k].reduce(function (s, l) { return s + l.cantidad; }, 0);
      var nota = "";
      if (pred) {
        nota = T.pagos.acepta(k, pred)
          ? '<span class="accept is-ok">✓ Acepta ' + T.esc(T.pagos.tipos[pred.tipo]) + "</span>"
          : '<span class="accept is-warn">✕ No acepta ' + T.esc(T.pagos.tipos[pred.tipo]) + ". Elige otro método en Pagos.</span>";
      }
      return '<div class="store-buy"><a class="btn btn--ghost" href="' + T.esc(t.url) + '" target="_blank" rel="noopener noreferrer">' +
        "<span>Comprar en " + T.esc(t.nombre) + "</span><span>" + n + (n === 1 ? " producto" : " productos") + "</span></a>" + nota + "</div>";
    }).join("");

    var lineaPago = pred
      ? '<p class="summary-line"><span>Pagas con</span><span><strong>' + T.esc(T.pagos.etiqueta(pred)) + '</strong> <a href="pago.html">Cambiar</a></span></p>'
      : '<p class="summary-line"><span>Método de pago</span><a href="pago.html">Agregar uno</a></p>';

    cont.innerHTML =
      '<div class="cart-layout">' +
        '<ul class="cart-items">' + filas + "</ul>" +
        '<aside class="summary" aria-labelledby="t-resumen">' +
          '<h2 id="t-resumen">Resumen</h2>' +
          lineaPago +
          '<p class="summary-line"><span>Si compras en la tienda más cara</span><span class="num">' + T.fmt(totalCaro) + "</span></p>" +
          '<p class="summary-total"><span>Total al mejor precio' + T.info("Suma el precio más bajo de cada producto. No incluye el envío.") + '</span><strong class="num">' + T.fmt(total) + "</strong></p>" +
          '<p class="saving num">Ahorras ' + T.fmt(totalCaro - total) + "</p>" +
          '<div class="summary-stores"><h3>Dónde comprar</h3>' + tiendas + "</div>" +
        "</aside>" +
      "</div>";
  }

  cont.addEventListener("click", function (e) {
    var b = e.target.closest("button");
    if (!b) return;
    var items = T.carrito.items();
    function actual(id) { var i = items.filter(function (x) { return x.id === id; })[0]; return i ? i.cantidad : 1; }

    if (b.dataset.quitar) {
      // Heurística 3: en vez de pedir confirmación, se quita y se ofrece deshacer.
      var antes = items.slice();
      var quitado = T.producto(b.dataset.quitar);
      T.carrito.quitar(b.dataset.quitar);
      T.aviso((quitado ? quitado.nombre : "Producto") + " quitado del carrito", {
        texto: "Deshacer",
        fn: function () { T.carrito.reemplazar(antes); }
      });
    }
    else if (b.dataset.mas) T.carrito.cambiar(b.dataset.mas, actual(b.dataset.mas) + 1);
    else if (b.dataset.menos) T.carrito.cambiar(b.dataset.menos, actual(b.dataset.menos) - 1);
  });

  document.addEventListener("tantea:carrito", pintar);
  pintar();
})();
