/* =========================================================
   Tantea · data.js
   Catálogo de ejemplo. Para agregar un producto, copia uno
   de los objetos de `productos`, cambia sus datos y pon su
   foto en assets/img/.
   Los precios son de ejemplo (COP), no son reales.
   ========================================================= */

window.TANTEA_DATA = {
  // `aceptan` = tipos de método de pago que acepta cada tienda (datos de ejemplo).
  tiendas: {
    ml:       { nombre: "Mercado Libre", sigla: "ML", url: "https://www.mercadolibre.com.co", fondo: "#ffe600", texto: "#1a1545", aceptan: ["tarjeta", "pse"] },
    alkosto:  { nombre: "Alkosto",       sigla: "Ak", url: "https://www.alkosto.com",         fondo: "#1a1545", texto: "#ffffff", aceptan: ["tarjeta", "pse", "nequi"] },
    exito:    { nombre: "Éxito",         sigla: "Éx", url: "https://www.exito.com",           fondo: "#ffc93c", texto: "#1a1545", aceptan: ["tarjeta", "pse", "nequi"] },
    falabella:{ nombre: "Falabella",     sigla: "Fa", url: "https://www.falabella.com.co",    fondo: "#b6e35c", texto: "#1a1545", aceptan: ["tarjeta", "pse"] },
    temu:     { nombre: "Temu",          sigla: "Te", url: "https://www.temu.com",            fondo: "#fb7701", texto: "#1a1545", aceptan: ["tarjeta"] }
  },

  // Bancos disponibles para PSE (lista de ejemplo).
  bancos: [
    "Bancolombia", "Davivienda", "Banco de Bogotá", "BBVA Colombia",
    "Banco de Occidente", "Banco Popular", "Scotiabank Colpatria", "Banco Caja Social", "AV Villas"
  ],

  productos: [
    {
      id: "lg-tv",
      nombre: "LG TV UHD",
      categoria: "Televisores",
      imagen: "assets/img/lg-tv.png",
      alt: "Televisor LG UHD con una imagen de árboles nevados",
      descripcion: "Televisor LG UHD. Compara su precio entre tiendas antes de comprarlo.",
      ofertas: [
        { tienda: "ml",        precio: 4090000 },
        { tienda: "alkosto",   precio: 4000000 },
        { tienda: "exito",     precio: 4199900 },
        { tienda: "falabella", precio: 4320000 }
      ]
    },
    {
      id: "nintendo-switch-2",
      nombre: "Nintendo Switch 2",
      categoria: "Videojuegos",
      imagen: "assets/img/nintendo-switch-2.png",
      alt: "Caja de la consola Nintendo Switch 2 con la consola y sus controles",
      descripcion: "Consola Nintendo Switch 2. Mira en qué tienda cuesta menos hoy.",
      ofertas: [
        { tienda: "ml",        precio: 2689000 },
        { tienda: "alkosto",   precio: 2620440 },
        { tienda: "exito",     precio: 2749900 },
        { tienda: "falabella", precio: 2899000 }
      ]
    },
    {
      id: "iphone-17-pro-naranja",
      nombre: "iPhone 17 Pro 256 GB",
      categoria: "Celulares",
      imagen: "assets/img/iphone-17-pro-naranja.jpg",
      alt: "iPhone naranja visto por detrás y por delante, con tres cámaras",
      descripcion: "Acabado naranja cósmico, triple cámara y financiación hasta en 48 cuotas. Revisa la tasa de interés antes de decidir.",
      ofertas: [
        { tienda: "ml",        precio: 6350000 },
        { tienda: "alkosto",   precio: 6299000 },
        { tienda: "exito",     precio: 6549000 },
        { tienda: "falabella", precio: 6499900 }
      ]
    },
    {
      id: "galaxy-s26-violeta",
      nombre: "Samsung Galaxy S26 256 GB",
      categoria: "Celulares",
      imagen: "assets/img/galaxy-s26-violeta.jpg",
      alt: "Samsung Galaxy violeta visto por detrás y por delante",
      descripcion: "Pantalla de 6,3 pulgadas en violeta. Hace las mismas fotos que el naranja, pero con menos cuotas.",
      ofertas: [
        { tienda: "alkosto",   precio: 4199000 },
        { tienda: "ml",        precio: 4279900 },
        { tienda: "exito",     precio: 4349000 },
        { tienda: "falabella", precio: 4499900 }
      ]
    },
    {
      id: "galaxy-note-7",
      nombre: "Samsung Galaxy Note 7",
      categoria: "Celulares",
      imagen: "assets/img/galaxy-note-7.jpg",
      alt: "Tres Samsung Galaxy Note 7 en plateado, dorado y azul, cada uno con su lápiz",
      descripcion: "Edición de colección con lápiz S Pen. Carga rápida, muy rápida. Envío solo por vía terrestre.",
      ofertas: [
        { tienda: "temu",      precio: 259000 },
        { tienda: "ml",        precio: 389900 }
      ]
    },
    {
      id: "canaima-educativo",
      nombre: "Canaima Educativo 2G",
      categoria: "Computadores",
      imagen: "assets/img/canaima-educativo.jpg",
      alt: "Mini portátil escolar gris y blanco con su bolso azul",
      descripcion: "Portátil escolar con bolso azul incluido. Resiste mochilas, recreos y varias generaciones de estudiantes.",
      ofertas: [
        { tienda: "temu",      precio: 168000 },
        { tienda: "ml",        precio: 215000 }
      ]
    },
    {
      id: "acer-swift-go-14",
      nombre: "Acer Swift Go 14",
      categoria: "Computadores",
      imagen: "assets/img/acer-swift-go-14.jpg",
      alt: "Portátil Acer azul claro con una pintura verde y azul en la pantalla",
      descripcion: "Portátil ligero de 14 pulgadas con 16 GB de RAM: alcanza para las 40 pestañas que ya tienes abiertas.",
      ofertas: [
        { tienda: "alkosto",   precio: 3199000 },
        { tienda: "ml",        precio: 3280000 },
        { tienda: "exito",     precio: 3349900 },
        { tienda: "falabella", precio: 3499000 }
      ]
    },
    {
      id: "nokia-2600-classic",
      nombre: "Nokia 2600 classic",
      categoria: "Celulares",
      imagen: "assets/img/nokia-2600-classic.jpg",
      alt: "Teléfono Nokia naranja con teclado numérico, visto de frente y por detrás",
      descripcion: "Teléfono de teclado en color naranja. Batería de varios días y cero actualizaciones pendientes. Modelo descontinuado.",
      ofertas: [
        { tienda: "temu",      precio: 79900 },
        { tienda: "ml",        precio: 129000 }
      ]
    },
    {
      id: "smartphone-perla",
      nombre: "Smartphone Perla 256 GB",
      categoria: "Celulares",
      imagen: "assets/img/smartphone-perla.jpg",
      alt: "Teléfono blanco perlado con cámara doble y pantalla azul turquesa",
      descripcion: "Color perla con degradado turquesa. Cámara de anillo doble y una sola funda compatible, que está agotada.",
      ofertas: [
        { tienda: "ml",        precio: 1349000 },
        { tienda: "alkosto",   precio: 1299000 },
        { tienda: "exito",     precio: 1399900 }
      ]
    }
  ]
};
