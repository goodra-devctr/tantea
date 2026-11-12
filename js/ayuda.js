/* Tantea · ayuda.js — botón de ayuda flotante con ayuda según la página
   Se carga en todas las páginas, después de app.js. */
(function () {
  "use strict";
  var T = window.Tantea;
  if (!T || T.pagina === "ayuda") return;   // en la página de ayuda no hace falta

  // Cada página muestra solo las 3 dudas más probables en ese punto.
  var CONTENIDO = {
    inicio: {
      titulo: "Para empezar",
      items: [
        ["Buscar un producto", "Escribe en el buscador y elige una sugerencia. Pulsa / en cualquier página para ir a él."],
        ["Qué significa “Hasta $320.000 menos”", "Es la diferencia entre la tienda más cara y la más barata para ese producto."],
        ["Guardar para después", "Toca el corazón de un producto para verlo luego en Favoritos."]
      ]
    },
    productos: {
      titulo: "Buscar y filtrar",
      items: [
        ["Filtrar y ordenar", "Usa las categorías para acotar y “Ordenar por” para ver primero el menor precio o el mayor ahorro."],
        ["Agregar sin entrar al detalle", "Toca “Agregar al carrito” directamente en la tarjeta."],
        ["No encuentro lo que busco", "Prueba con una palabra más corta, como “TV” o “consola”."]
      ]
    },
    producto: {
      titulo: "Comparar tiendas",
      items: [
        ["Leer la comparación", "Las tiendas van de la más barata a la más cara. El valor con “+” es lo que pagarías de más."],
        ["Por qué no incluye el envío", "Cada tienda fija su propio envío. Revísalo en la tienda antes de pagar."],
        ["Guardar en favoritos", "Toca “Guardar en favoritos” para volver a este producto desde el menú."]
      ]
    },
    carrito: {
      titulo: "Tu carrito",
      items: [
        ["Quitar por error", "Toca “Deshacer” en el aviso que aparece abajo."],
        ["Dónde comprar", "Agrupamos tus productos por la tienda donde cada uno cuesta menos."],
        ["Mi método de pago", "Agrégalo en Pagos para ver qué tiendas lo aceptan. Tantea no cobra."]
      ]
    },
    favoritos: {
      titulo: "Tus favoritos",
      items: [
        ["Quitar un favorito", "Toca el corazón de la tarjeta. Si fue sin querer, usa “Deshacer”."],
        ["Precios actualizados", "Cada tarjeta muestra el mejor precio de hoy, no el de cuando lo guardaste."],
        ["Comprar", "Toca “Agregar al carrito” en la tarjeta o entra al detalle para ver todas las tiendas."]
      ]
    },
    pago: {
      titulo: "Métodos de pago",
      items: [
        ["Qué datos guardamos", "Solo la marca, los últimos 4 dígitos, el vencimiento y el nombre. Nunca el número completo ni el código de seguridad."],
        ["Por qué no me deja guardar la tarjeta", "Revisamos que el número sea válido y que la tarjeta no esté vencida. Cada campo te dice qué corregir."],
        ["Para qué sirve", "Para mostrarte qué tiendas aceptan tu forma de pago. Tantea no cobra."]
      ]
    }
  };

  var c = CONTENIDO[T.pagina] || CONTENIDO.inicio;
  var items = c.items.map(function (i) {
    return "<dt>" + T.esc(i[0]) + "</dt><dd>" + T.esc(i[1]) + "</dd>";
  }).join("");

  var wrap = document.createElement("div");
  wrap.className = "help-widget";
  wrap.innerHTML =
    '<button type="button" class="help-fab" aria-expanded="false" aria-controls="panel-ayuda">' +
      '<span class="help-fab-icon" aria-hidden="true">?</span>Ayuda</button>' +
    '<div class="help-panel" id="panel-ayuda" role="dialog" aria-labelledby="panel-ayuda-t" hidden>' +
      '<button type="button" class="help-close" aria-label="Cerrar ayuda">×</button>' +
      '<h2 id="panel-ayuda-t" tabindex="-1">' + T.esc(c.titulo) + "</h2>" +
      "<dl>" + items + "</dl>" +
      '<a class="help-more" href="' + T.pages + 'ayuda.html">Ver todas las preguntas</a>' +
      '<p class="help-keys">Atajo: pulsa <kbd class="kbd">/</kbd> para buscar.</p>' +
    "</div>";
  document.body.appendChild(wrap);

  var fab = wrap.querySelector(".help-fab");
  var panel = wrap.querySelector(".help-panel");
  var titulo = wrap.querySelector("h2");

  function abrir() {
    panel.hidden = false;
    fab.setAttribute("aria-expanded", "true");
    titulo.focus();
  }
  function cerrar(devolverFoco) {
    if (panel.hidden) return;
    panel.hidden = true;
    fab.setAttribute("aria-expanded", "false");
    if (devolverFoco) fab.focus();
  }

  fab.addEventListener("click", function () { if (panel.hidden) abrir(); else cerrar(true); });
  wrap.querySelector(".help-close").addEventListener("click", function () { cerrar(true); });
  document.addEventListener("keydown", function (e) { if (e.key === "Escape") cerrar(true); });
  document.addEventListener("click", function (e) { if (!wrap.contains(e.target)) cerrar(false); });
})();
