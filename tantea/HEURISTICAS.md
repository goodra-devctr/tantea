# Las 10 heurísticas de Nielsen en Tantea

Dónde se aplica cada una. Las ubicaciones usan el nombre del archivo y del elemento, así que
se encuentran con una búsqueda de texto aunque el código cambie.

## 1. Visibilidad del estado del sistema
El usuario siempre sabe qué pasó y dónde está.
- **Contador del carrito** en el header: `.cart-count`, en `js/app.js` (`actualizarContador`).
- **El botón confirma la acción**: al agregar cambia a "Agregado ✓" en verde. `js/app.js` (clase `is-added`), `css/components.css` (`.btn.is-added`).
- **Aviso al agregar**, con enlace "Ver carrito": `aviso()` en `js/app.js`.
- **Estado del producto en el detalle**: "Ya tienes 2 unidades en tu carrito". `js/producto.js` (`#en-carrito`).
- **Página actual marcada** en el menú: `aria-current="page"` en `js/app.js`.
- **Conteo de resultados** ("1 producto") con `aria-live`: `js/productos.js`, `pages/productos.html`.
- **Filtro activo** visible: `aria-pressed` en `.chip`, `js/productos.js`.

## 2. Coincidencia entre el sistema y el mundo real
Lenguaje y formatos del usuario, no del sistema.
- Todo el texto en español y en el vocabulario de una tienda: "carrito", "mejor precio", "agregar".
- **Precios en pesos colombianos** con punto de miles y sin decimales: `fmt()` en `js/app.js`.
- **Ahorro en pesos y en porcentaje** ("Hasta $320.000 menos", "7% menos que la tienda más cara"): `resumen()` en `js/app.js`.
- Los productos se nombran como el usuario los busca ("LG TV UHD", "Nintendo Switch 2"): `js/data.js`.

## 3. Control y libertad del usuario
Salidas claras y formas de corregir.
- **Deshacer al quitar un producto** del carrito, en vez de pedir confirmación: `js/carrito.js` (`quitar` + aviso "Deshacer"), `js/app.js` (`reemplazar`).
- **Borrar búsqueda**: enlace en `js/productos.js` (`.clear-search`).
- **Categoría "Todos"** para quitar un filtro: `js/productos.js`.
- **Migas de pan** en el detalle: `js/producto.js` (`.crumbs`).
- El logo lleva siempre al inicio: `js/app.js`.

## 4. Consistencia y estándares
Lo mismo se ve y se llama igual en todas partes.
- **Una acción, un nombre**: "Agregar al carrito" en tarjetas y detalle, y "agregado al carrito" en el aviso. `js/app.js` (`tarjeta`), `js/producto.js`.
- **Los mismos componentes en todas las páginas**: header, footer, tarjeta y escalera de precios se generan con un solo código en `js/app.js`.
- **Un solo sistema de diseño** (colores, tipografía, radios) en `css/base.css`, bloque `:root`.
- **Convenciones web**: el logo va al inicio, el carrito arriba a la derecha, y los enlaces que salen a otra tienda llevan "↗" y abren en pestaña nueva (`js/producto.js`).

## 5. Prevención de errores
Evitar el error antes de que ocurra.
- **Cantidad entre 1 y 9**: los botones "−" y "+" se deshabilitan en los límites. `js/carrito.js` (`disabled`), `js/app.js` (`Math.min`, `Math.max`).
- **Quitar no destruye**: se puede deshacer (ver heurística 3).
- **Texto de búsqueda sin distinguir mayúsculas ni tildes**: `normalizar()` en `js/app.js`.
- **Enlaces externos seguros**: `rel="noopener noreferrer"` en `js/carrito.js`, `js/home.js`, `js/producto.js`.
- **Zonas táctiles de al menos 44 px**: `.icon-btn`, `.btn--small`, `.qty button` en `css/`.

## 6. Reconocer en lugar de recordar
Las opciones se ven, no hay que acordarse de ellas.
- **Sugerencias al escribir** con los nombres de los productos: `<datalist id="sugerencias">` en `js/app.js`.
- **Sugerencias en el inicio** ("Prueba con LG TV…"): `index.html` (`.hero-hints`).
- **Categorías visibles** como botones, sin menús ocultos: `js/productos.js`.
- **Tienda con nombre y sigla de color** en cada fila, sin depender del logo: `tiendaDot()` en `js/app.js`.
- **El carrito dice dónde comprar cada producto**: `js/carrito.js` (`.summary-stores`).

## 7. Flexibilidad y eficiencia de uso
Atajos para quien ya conoce la app.
- **Tecla "/"** lleva al buscador desde cualquier página. Se ve una pista en escritorio: `js/app.js` (`keydown`), `css/components.css` (`.kbd-hint`).
- **Agregar al carrito desde la tarjeta**, sin entrar al detalle: `js/app.js` (`[data-add]`).
- **"Ver carrito" dentro del aviso**: `js/app.js`.
- **Orden y filtro combinables**: `js/productos.js`.
- **Direcciones que se pueden compartir** (`producto.html?id=…`, `productos.html?q=…`): `js/producto.js`, `js/productos.js`.
- **Favoritos** para volver rápido a un producto: `js/favoritos.js`, `pages/favoritos.html`.
- *Limitado*: no hay historial de búsquedas.

## 8. Diseño estético y minimalista
Solo lo que ayuda a decidir.
- **Una sola acción principal por pantalla**, en coral. El resto es neutro: `css/base.css`.
- **El precio es lo más grande** de cada tarjeta y del detalle: `.card-price`, `.best-price` en `css/`.
- **Se quitó el relleno** del diseño original: banners vacíos, "Loremp ipsum" y texto sobre las fotos.
- **La escalera de precios** reemplaza la cuadrícula de tarjetas repetidas: `escalera()` en `js/app.js`.
- **Ayuda plegada** en `<details>`: solo se abre si se necesita.

## 9. Ayudar a reconocer, diagnosticar y recuperarse de errores
Mensajes claros, sin códigos, con una salida.
- **Búsqueda sin resultados**: dice qué pasó, da dos consejos y ofrece categorías: `js/productos.js`.
- **Producto que no existe**: explica la causa y lleva al catálogo: `js/producto.js`.
- **Carrito vacío**: dice qué hacer y pone un botón "Ver productos": `js/carrito.js`.
- **Si el navegador no deja guardar el carrito**, lo avisa una vez y explica la consecuencia: `js/app.js` (`sinAlmacenamiento`).

## 10. Ayuda y documentación
Corta, buscable y en el momento justo.
- **Página de ayuda** con 7 preguntas en tres grupos (comparar, carrito, atajos): `pages/ayuda.html`. Está en el menú y en el pie de página.
- **Ayuda en contexto** bajo la comparación: "¿Cómo leer esta comparación?": `js/producto.js` (`details.help`).
- **Aclaraciones donde surgen**: "Cada barra muestra el precio frente a la tienda más cara" (`js/producto.js`) y el aviso de precios de ejemplo en el pie (`js/app.js`).

---

---

## Novedades: favoritos, métodos de pago, tooltips y botón de ayuda

### Favoritos
- **H1** Contador en el header (`.fav-count`, `js/app.js`). El corazón cambia de estado y el aviso dice "Ver favoritos". En el detalle, el botón pasa de "Guardar en favoritos" a "Guardado en favoritos".
- **H3** Quitar un favorito ofrece "Deshacer" (`js/app.js`). En la página de Favoritos, el foco pasa al título al quitar uno, para no perder el lugar con teclado (`js/favoritos.js`).
- **H4** El mismo corazón en tarjetas y detalle, con el mismo comportamiento: `corazon()` y `sincronizarFavoritos()` en `js/app.js`.
- **H6** Favoritos está en el header y en el pie, siempre a la vista. Cada tarjeta muestra el mejor precio de hoy.
- **H9** Sin favoritos, la página explica cómo guardar uno y lleva a Productos (`js/favoritos.js`).

### Métodos de pago (`pages/pago.html`, `js/pago.js`)
**Prevención de errores (H5)**
- Solo se pueden escribir dígitos en número, vencimiento, CVV y celular, y solo letras en el nombre.
- El formato se da mientras se escribe: espacios en el número (4-4-4-4, o 4-6-5 en American Express) y barra en la fecha.
- Los límites cambian según la marca: 15 dígitos y CVV de 4 en American Express. La marca se reconoce sola.
- En la fecha, un "4" se vuelve "04" y un mes mayor a 12 no se puede escribir.
- El número se valida con el algoritmo de Luhn. Se avisa si la tarjeta está vencida o si ya fue guardada.
- No se regaña mientras se escribe: la revisión llega al salir del campo, y se corrige sola al arreglarlo.
- **Privacidad:** solo se guardan marca, últimos 4 dígitos, vencimiento y titular. El número completo y el CVV nunca se guardan y el formulario se limpia al guardar.
- **Antes de salir a la tienda** el carrito avisa si no acepta tu método ("✕ No acepta Nequi"): `js/carrito.js`, datos en `js/data.js` (`aceptan`).

**Recuperación de errores (H9)**
- Cada mensaje dice qué falta: "Faltan 8 dígitos.", "El mes debe estar entre 01 y 12.", "Esta tarjeta está vencida. Usa otra."
- Aparece junto al campo, con "!" además del color rojo, y se marca con `aria-invalid`.
- Al enviar con errores sale un resumen que recibe el foco, con enlaces a cada campo.

**Otras heurísticas**
- **H1** Vista previa de la tarjeta que se llena al escribir; etiqueta de marca; "Aceptado en 5 de 5 tiendas" en cada método.
- **H2** Nequi y PSE, que son los métodos que se usan en Colombia.
- **H3** Quitar un método ofrece "Deshacer". El primero que agregas queda como predeterminado.
- **H6** El método elegido se ve en el carrito ("Pagas con Visa •••• 4242") sin tener que recordarlo.

### Tooltips contextuales
- **H10 y H6.** Sistema único en `js/app.js` (sección "Tooltips"): cualquier elemento con `data-tip="texto"`. Aparece con el cursor o el teclado, se fija al tocar un "?" y se cierra con Escape. Es accesible: `role="tooltip"` y `aria-describedby`.
- **Dónde hay:**
  - Detalle: "Mejor precio hoy", porcentaje de ahorro y "Precio en cada tienda" (`js/producto.js`).
  - Carrito: "Total al mejor precio" (`js/carrito.js`).
  - Pagos: vencimiento, código de seguridad, Nequi, PSE y "predeterminado" (`pages/pago.html`).
  - Iconos del header (Favoritos, Carrito) y todos los corazones.
- En móvil la burbuja se queda dentro de la pantalla (probado en 390 px).

### Botón de ayuda flotante (`js/ayuda.js`)
- **H10.** Abajo a la derecha en todas las páginas, menos en la de Ayuda. Muestra las 3 dudas más probables de la pantalla en la que estás, con enlace a todas las preguntas.
- **H7.** Se abre y cierra con teclado: el foco entra al panel, Escape lo cierra y devuelve el foco al botón. También cierra al hacer clic fuera.
- **H8.** Va cerrado por defecto, para no recargar la pantalla.
- La página de Ayuda suma preguntas de favoritos, métodos de pago, tooltips y el botón de ayuda (`pages/ayuda.html`).

### Qué no cubre esto
Es una revisión de diseño y una prueba automática de los flujos (agregar, quitar, deshacer,
buscar, búsqueda vacía, atajo, ayuda). No reemplaza una prueba con personas: las heurísticas
se validan de verdad mirando a alguien usar la app.
