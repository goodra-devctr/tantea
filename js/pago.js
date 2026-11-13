/* Tantea · pago.js — métodos de pago con prevención de errores

   Cómo se evitan los errores (heurística 5):
     1. El campo no deja escribir lo que no corresponde: solo dígitos, solo letras.
     2. Se da formato mientras se escribe: espacios en el número, barra en la fecha.
     3. Los límites cambian según la tarjeta: 15 dígitos y CVV de 4 en American Express.
     4. El mes no puede pasar de 12, y un "4" inicial se vuelve "04".
     5. El número se valida con el algoritmo de Luhn, que detecta casi todos los errores de tecleo.
     6. Se avisa si la tarjeta está vencida o ya fue guardada.

   Cómo se explican (heurística 9): cada mensaje dice qué falta o qué corregir,
   aparece junto al campo y también en un resumen que recibe el foco al enviar.

   Privacidad: solo se guardan marca, últimos 4 dígitos, vencimiento y titular.
   El número completo y el código de seguridad nunca se guardan. */
(function () {
  "use strict";
  var T = window.Tantea;

  var form = document.getElementById("form-pago");
  var resumen = document.getElementById("resumen-errores");
  var lista = document.getElementById("lista-pagos");
  var pred = document.getElementById("pred");

  var campos = {};
  ["num", "nom", "exp", "cvv", "cel", "banco"].forEach(function (id) { campos[id] = document.getElementById(id); });

  var vp = {
    marca: document.getElementById("vp-marca"),
    num: document.getElementById("vp-num"),
    nom: document.getElementById("vp-nom"),
    exp: document.getElementById("vp-exp")
  };
  var marcaTag = document.getElementById("marca-tag");

  var CAMPOS_POR_TIPO = { tarjeta: ["num", "nom", "exp", "cvv"], nequi: ["cel"], pse: ["banco"] };
  var ETIQUETAS = {
    num: "Número de la tarjeta", nom: "Nombre en la tarjeta", exp: "Vencimiento",
    cvv: "Código de seguridad", cel: "Celular", banco: "Banco"
  };
  var AYUDA_NUM = "Solo números. Los espacios se agregan solos.";

  var tocado = {};       // campos que la persona ya visitó
  var enviando = false;

  /* ---------- Utilidades ---------- */

  function digitos(s) { return String(s).replace(/\D/g, ""); }

  // Marca según los primeros dígitos. Devuelve null si no se reconoce.
  function marcaDe(d) {
    if (/^4/.test(d)) return "Visa";
    if (/^(5[1-5]|222[1-9]|22[3-9]\d|2[3-6]\d\d|27[01]\d|2720)/.test(d)) return "Mastercard";
    if (/^3[47]/.test(d)) return "American Express";
    if (/^3(0[0-5]|[68])/.test(d)) return "Diners Club";
    return null;
  }
  var LARGO = { "Visa": 16, "Mastercard": 16, "American Express": 15, "Diners Club": 14 };
  function largoDe(marca) { return marca ? LARGO[marca] : 16; }
  function cvvDe(marca) { return marca === "American Express" ? 4 : 3; }

  function gruposDe(marca) {
    if (marca === "American Express") return [4, 6, 5];
    if (marca === "Diners Club") return [4, 6, 4];
    return [4, 4, 4, 4];
  }
  function agrupar(d, marca) {
    var g = gruposDe(marca), out = [], i = 0;
    for (var k = 0; k < g.length && i < d.length; k++) { out.push(d.slice(i, i + g[k])); i += g[k]; }
    return out.join(" ");
  }

  // Algoritmo de Luhn: detecta dígitos cambiados, faltantes o repetidos por error.
  function luhn(d) {
    var suma = 0, alterna = false;
    for (var i = d.length - 1; i >= 0; i--) {
      var n = +d[i];
      if (alterna) { n *= 2; if (n > 9) n -= 9; }
      suma += n;
      alterna = !alterna;
    }
    return suma % 10 === 0;
  }

  // "MM/AA" -> ¿ya venció? Una tarjeta vale hasta el último día del mes indicado.
  function vencida(vence) {
    var d = digitos(vence);
    if (d.length < 4) return false;
    var mm = +d.slice(0, 2), aa = 2000 + +d.slice(2, 4);
    return new Date(aa, mm, 1) <= new Date();
  }

  // Aplica un formato al campo sin que el cursor salte al final.
  function formatear(input, fn) {
    var enfocado = document.activeElement === input;
    var antes = input.value.slice(0, input.selectionStart || 0);
    var digitosAntes = digitos(antes).length;
    var nuevo = fn(input.value);
    input.value = nuevo;
    if (!enfocado) return;
    var cuenta = 0, pos = nuevo.length;
    if (digitosAntes === 0) { pos = 0; }
    else {
      for (var i = 0; i < nuevo.length; i++) {
        if (/\d/.test(nuevo[i])) cuenta++;
        if (cuenta === digitosAntes) { pos = i + 1; break; }
      }
    }
    input.setSelectionRange(pos, pos);
  }

  /* ---------- Reglas de cada campo (devuelven "" si está bien) ---------- */

  var VALIDAR = {
    num: function () {
      var d = digitos(campos.num.value);
      if (!d) return "Escribe el número de tu tarjeta.";
      var m = marcaDe(d);
      if (d.length >= 4 && !m) return "Solo aceptamos Visa, Mastercard, American Express y Diners Club.";
      var largo = largoDe(m);
      if (d.length < largo) { var f = largo - d.length; return "Faltan " + f + (f === 1 ? " dígito." : " dígitos."); }
      if (!luhn(d)) return "El número no es válido. Revisa que no falte ni sobre ningún dígito.";
      var ya = T.pagos.metodos().some(function (x) { return x.tipo === "tarjeta" && x.marca === m && x.ultimos4 === d.slice(-4); });
      if (ya) return "Ya guardaste una " + m + " que termina en " + d.slice(-4) + ".";
      return "";
    },
    nom: function () {
      var v = campos.nom.value.trim();
      if (!v) return "Escribe el nombre como aparece en la tarjeta.";
      if (v.replace(/[^\p{L}]/gu, "").length < 3) return "El nombre es muy corto. Escríbelo completo.";
      return "";
    },
    exp: function () {
      var d = digitos(campos.exp.value);
      if (d.length < 4) return "Escribe mes y año, por ejemplo 08/29.";
      var mm = +d.slice(0, 2), aa = 2000 + +d.slice(2, 4);
      if (mm < 1 || mm > 12) return "El mes debe estar entre 01 y 12.";
      if (vencida(campos.exp.value)) return "Esta tarjeta está vencida. Usa otra.";
      if (aa > new Date().getFullYear() + 20) return "Revisa el año de vencimiento.";
      return "";
    },
    cvv: function () {
      var req = cvvDe(marcaDe(digitos(campos.num.value)));
      if (digitos(campos.cvv.value).length < req) {
        return "Escribe los " + req + " dígitos " + (req === 4 ? "del frente" : "del reverso") + " de la tarjeta.";
      }
      return "";
    },
    cel: function () {
      var d = digitos(campos.cel.value);
      if (!d) return "Escribe tu número de celular.";
      if (d[0] !== "3") return "Los celulares en Colombia empiezan por 3.";
      if (d.length < 10) { var f = 10 - d.length; return "Faltan " + f + (f === 1 ? " dígito." : " dígitos."); }
      var ya = T.pagos.metodos().some(function (x) { return x.tipo === "nequi" && x.ultimos4 === d.slice(-4); });
      if (ya) return "Ya guardaste un Nequi que termina en " + d.slice(-4) + ".";
      return "";
    },
    banco: function () {
      var v = campos.banco.value;
      if (!v || T.data.bancos.indexOf(v) === -1) return "Elige tu banco.";
      var ya = T.pagos.metodos().some(function (x) { return x.tipo === "pse" && x.banco === v; });
      if (ya) return "Ya guardaste PSE con " + v + ".";
      return "";
    }
  };

  /* ---------- Mostrar errores junto al campo ---------- */

  function pintarCampo(id, msg) {
    var f = form.querySelector('[data-field="' + id + '"]');
    var err = document.getElementById(id + "-error");
    var inp = campos[id];
    if (msg) {
      err.textContent = msg;
      err.hidden = false;
      f.classList.add("has-error");
      f.classList.remove("is-valid");
      inp.setAttribute("aria-invalid", "true");
    } else {
      err.hidden = true;
      err.textContent = "";
      f.classList.remove("has-error");
      inp.removeAttribute("aria-invalid");
      f.classList.toggle("is-valid", !!inp.value && !!tocado[id]);
    }
  }

  function validar(id) {
    var msg = VALIDAR[id]();
    pintarCampo(id, msg);
    return msg;
  }

  /* ---------- Vista previa, marca y ayudas que cambian al escribir ---------- */

  function actualizarVista() {
    var d = digitos(campos.num.value);
    var m = marcaDe(d);
    var g = gruposDe(m), i = 0, partes = [];
    g.forEach(function (n) {
      var s = "";
      for (var k = 0; k < n; k++, i++) s += d[i] !== undefined ? d[i] : "•";
      partes.push(s);
    });
    vp.num.textContent = partes.join(" ");
    vp.marca.textContent = m || "Tarjeta";
    vp.nom.textContent = campos.nom.value.trim().toUpperCase() || "NOMBRE APELLIDO";
    vp.exp.textContent = campos.exp.value || "MM/AA";
    marcaTag.textContent = m || "";
  }

  // Mientras se escribe el número, la ayuda cuenta cuántos dígitos faltan.
  function ayudaNumero() {
    var el = document.getElementById("num-ayuda");
    var d = digitos(campos.num.value);
    var m = marcaDe(d);
    var falta = largoDe(m) - d.length;
    el.textContent = (!tocado.num && d.length && m && falta > 0)
      ? "Faltan " + falta + (falta === 1 ? " dígito." : " dígitos.")
      : AYUDA_NUM;
  }

  // American Express usa 4 dígitos de seguridad; el resto, 3.
  function ajustarCVV() {
    var req = cvvDe(marcaDe(digitos(campos.num.value)));
    campos.cvv.maxLength = req;
    campos.cvv.placeholder = req === 4 ? "••••" : "•••";
    document.getElementById("cvv-ayuda").textContent = req === 4 ? "4 dígitos del frente." : "3 dígitos del reverso.";
    if (campos.cvv.value.length > req) campos.cvv.value = campos.cvv.value.slice(0, req);
  }

  /* ---------- Escribir: solo lo permitido, con formato ---------- */

  function alEscribir(id) { if (tocado[id]) validar(id); }

  campos.num.addEventListener("input", function () {
    formatear(campos.num, function (v) {
      var d = digitos(v);
      var m = marcaDe(d);
      return agrupar(d.slice(0, largoDe(m)), m);
    });
    ajustarCVV();
    actualizarVista();
    ayudaNumero();
    alEscribir("num");
    if (tocado.cvv) validar("cvv");
  });

  campos.nom.addEventListener("input", function () {
    var limpio = campos.nom.value.replace(/[^\p{L}' \-]/gu, "").replace(/\s{2,}/g, " ");
    if (limpio !== campos.nom.value) {
      var pos = Math.max(0, (campos.nom.selectionStart || 0) - (campos.nom.value.length - limpio.length));
      campos.nom.value = limpio;
      campos.nom.setSelectionRange(pos, pos);
    }
    actualizarVista();
    alEscribir("nom");
  });

  campos.exp.addEventListener("input", function () {
    formatear(campos.exp, function (v) {
      var d = digitos(v).slice(0, 4);
      if (d.length && +d[0] > 1) d = "0" + d;          // "4" -> "04"
      d = d.slice(0, 4);
      if (d.length >= 2) {
        var mm = +d.slice(0, 2);
        if (mm > 12) d = "12" + d.slice(2);            // no se puede escribir un mes > 12
        else if (mm === 0) d = "01" + d.slice(2);
      }
      return d.length > 2 ? d.slice(0, 2) + "/" + d.slice(2) : d;
    });
    actualizarVista();
    alEscribir("exp");
  });

  campos.cvv.addEventListener("input", function () {
    campos.cvv.value = digitos(campos.cvv.value).slice(0, cvvDe(marcaDe(digitos(campos.num.value))));
    alEscribir("cvv");
  });

  campos.cel.addEventListener("input", function () {
    formatear(campos.cel, function (v) {
      var d = digitos(v).slice(0, 10);
      return [d.slice(0, 3), d.slice(3, 6), d.slice(6)].filter(Boolean).join(" ");
    });
    alEscribir("cel");
  });

  campos.banco.addEventListener("change", function () { tocado.banco = true; validar("banco"); });

  // Al salir de un campo se revisa (no antes: no se regaña a quien aún está escribiendo).
  ["num", "nom", "exp", "cvv", "cel"].forEach(function (id) {
    campos[id].addEventListener("blur", function () {
      if (!campos[id].value && !tocado[id]) return;   // pasar de largo por un campo vacío todavía no es un error
      tocado[id] = true;
      validar(id);
      if (id === "num") ayudaNumero();
    });
  });

  /* ---------- Tipo de método ---------- */

  function tipoActual() { return form.querySelector('input[name="tipo"]:checked').value; }

  function mostrarPanel() {
    var tipo = tipoActual();
    form.querySelectorAll("[data-panel]").forEach(function (p) { p.hidden = p.dataset.panel !== tipo; });
    Object.keys(CAMPOS_POR_TIPO).forEach(function (t) {
      if (t !== tipo) CAMPOS_POR_TIPO[t].forEach(function (id) { pintarCampo(id, ""); });
    });
    resumen.hidden = true;
  }
  form.querySelectorAll('input[name="tipo"]').forEach(function (r) { r.addEventListener("change", mostrarPanel); });

  /* ---------- Enviar ---------- */

  function mostrarResumen(errores) {
    resumen.innerHTML =
      "<p><strong>Revisa " + errores.length + (errores.length === 1 ? " campo" : " campos") + " para guardar el método.</strong></p><ul>" +
      errores.map(function (e) {
        return '<li><a href="#' + e.id + '" data-ir="' + e.id + '">' + T.esc(ETIQUETAS[e.id]) + ":</a> " + T.esc(e.msg) + "</li>";
      }).join("") + "</ul>";
    resumen.hidden = false;
    resumen.focus();
  }

  resumen.addEventListener("click", function (e) {
    var a = e.target.closest("[data-ir]");
    if (!a) return;
    e.preventDefault();
    campos[a.dataset.ir].focus();
  });

  function limpiarFormulario() {
    form.reset();
    tocado = {};
    Object.keys(campos).forEach(function (id) { pintarCampo(id, ""); });
    form.querySelectorAll(".is-valid").forEach(function (f) { f.classList.remove("is-valid"); });
    resumen.hidden = true;
    ajustarCVV();
    actualizarVista();
    ayudaNumero();
    mostrarPanel();
  }

  form.addEventListener("submit", function (e) {
    e.preventDefault();
    if (enviando) return;   // evita guardar dos veces por un doble clic

    var tipo = tipoActual();
    var errores = [];
    CAMPOS_POR_TIPO[tipo].forEach(function (id) {
      tocado[id] = true;
      var msg = validar(id);
      if (msg) errores.push({ id: id, msg: msg });
    });
    if (errores.length) { mostrarResumen(errores); return; }

    enviando = true;
    setTimeout(function () { enviando = false; }, 300);

    var metodo;
    if (tipo === "tarjeta") {
      var d = digitos(campos.num.value);
      // Solo datos no sensibles. El número completo y el CVV no salen de este formulario.
      metodo = { tipo: "tarjeta", marca: marcaDe(d), ultimos4: d.slice(-4), vence: campos.exp.value, titular: campos.nom.value.trim().toUpperCase() };
    } else if (tipo === "nequi") {
      metodo = { tipo: "nequi", ultimos4: digitos(campos.cel.value).slice(-4) };
    } else {
      metodo = { tipo: "pse", banco: campos.banco.value };
    }

    var guardado = T.pagos.agregar(metodo, pred.checked);
    limpiarFormulario();
    T.aviso("Método guardado: " + T.pagos.etiqueta(guardado));
  });

  /* ---------- Lista de métodos guardados ---------- */

  function sigla(m) {
    if (m.tipo === "nequi") return "Nq";
    if (m.tipo === "pse") return "PSE";
    return { "Visa": "VI", "Mastercard": "MC", "American Express": "AX", "Diners Club": "DC" }[m.marca] || "TC";
  }

  function detalle(m) {
    var tiendas = Object.keys(T.data.tiendas);
    var acepta = tiendas.filter(function (k) { return T.pagos.acepta(k, m); }).length;
    var linea;
    if (m.tipo === "tarjeta") linea = "Vence " + m.vence + ", titular " + m.titular;
    else if (m.tipo === "nequi") linea = "Celular que termina en " + m.ultimos4;
    else linea = "Pagas desde la página de tu banco";
    var extra = m.tipo === "tarjeta" && vencida(m.vence)
      ? '<span class="accept is-warn">✕ Vencida. Quítala y agrega una nueva.</span>'
      : '<span class="accept">Aceptado en ' + acepta + " de " + tiendas.length + " tiendas</span>";
    return "<span>" + T.esc(linea) + "</span>" + extra;
  }

  function pintarLista() {
    var e = T.pagos.estado();
    if (!e.metodos.length) {
      lista.innerHTML = '<li class="pay-empty">Aún no tienes métodos guardados. Agrega uno con el formulario.</li>';
      return;
    }
    lista.innerHTML = e.metodos.map(function (m) {
      var id = T.esc(m.id);
      var esPred = m.id === e.predeterminado;
      return (
        '<li class="pay-item' + (esPred ? " is-default" : "") + '">' +
          '<span class="pay-icon" aria-hidden="true">' + T.esc(sigla(m)) + "</span>" +
          '<div class="pay-info"><strong>' + T.esc(T.pagos.etiqueta(m)) + "</strong>" + detalle(m) + "</div>" +
          '<div class="pay-actions">' +
            (esPred
              ? '<span class="best-tag">Predeterminado</span>'
              : '<button type="button" class="btn btn--small btn--ghost" data-pred="' + id + '">Usar como predeterminado</button>') +
            '<button type="button" class="cart-remove" data-quitar="' + id + '">Quitar</button>' +
          "</div>" +
        "</li>"
      );
    }).join("");
  }

  lista.addEventListener("click", function (e) {
    var b = e.target.closest("button");
    if (!b) return;
    if (b.dataset.pred) {
      T.pagos.fijarPredeterminado(b.dataset.pred);
      var m = T.pagos.predeterminado();
      T.aviso((m ? T.pagos.etiqueta(m) : "Método") + " es ahora tu método predeterminado");
    } else if (b.dataset.quitar) {
      // Heurística 3: se quita y se puede deshacer, sin pedir confirmación.
      var antes = JSON.parse(JSON.stringify(T.pagos.estado()));
      var quitado = antes.metodos.filter(function (x) { return x.id === b.dataset.quitar; })[0];
      T.pagos.quitar(b.dataset.quitar);
      T.aviso((quitado ? T.pagos.etiqueta(quitado) : "Método") + " quitado", {
        texto: "Deshacer",
        fn: function () { T.pagos.reemplazar(antes); }
      });
    }
  });

  document.addEventListener("tantea:pagos", pintarLista);

  /* ---------- Inicio ---------- */

  T.data.bancos.forEach(function (b) {
    var o = document.createElement("option");
    o.value = b;
    o.textContent = b;
    campos.banco.appendChild(o);
  });

  mostrarPanel();
  ajustarCVV();
  actualizarVista();
  pintarLista();
})();
