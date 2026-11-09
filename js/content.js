// Fills the editable parts of the page from the files in content/,
// which the client changes through Pages CMS. If a file can't be loaded,
// the text already in the page stays as it is.
(function () {
  function load(name) {
    return fetch("content/" + name + ".json", { cache: "no-store" }).then(function (res) {
      if (!res.ok) throw new Error("content/" + name + ".json: " + res.status);
      return res.json();
    });
  }

  function el(tag, className, text) {
    var node = document.createElement(tag);
    if (className) node.className = className;
    if (text != null) node.textContent = text;
    return node;
  }

  // Puts text into a node, turning each new line into a line break
  function setLines(node, text) {
    node.textContent = "";
    String(text).split("\n").forEach(function (line, i) {
      if (i) node.appendChild(document.createElement("br"));
      node.appendChild(document.createTextNode(line));
    });
  }

  load("banner").then(function (banner) {
    var bar = document.getElementById("site-banner");
    if (banner.show && banner.message) {
      bar.textContent = banner.message;
      bar.hidden = false;
    } else {
      bar.hidden = true;
    }
  }).catch(console.error);

  load("text").then(function (text) {
    document.querySelectorAll("[data-content]").forEach(function (node) {
      var value = text[node.getAttribute("data-content")];
      if (value) setLines(node, value);
    });
    if (text.heroPhoto) document.getElementById("hero-photo").src = text.heroPhoto;
  }).catch(console.error);

  load("menu").then(function (items) {
    var grid = document.getElementById("menu-items");
    grid.textContent = "";
    items.forEach(function (item) {
      var row = el("div", "menu-item");
      row.appendChild(el("h3", null, item.name || ""));
      var price = String(item.price || "").replace(/^£/, "");
      row.appendChild(el("span", "price", price ? "£" + price : ""));
      if (item.description) row.appendChild(el("p", null, item.description));
      grid.appendChild(row);
    });
  }).catch(console.error);

  load("details").then(function (details) {
    if (details.address) setLines(document.getElementById("address"), details.address);
    if (details.hours && details.hours.length) {
      var list = document.getElementById("hours");
      list.textContent = "";
      details.hours.forEach(function (row) {
        list.appendChild(el("dt", null, row.days || ""));
        list.appendChild(el("dd", null, row.times || ""));
      });
    }
    var contact = [details.email, details.phone].filter(Boolean).join("\n");
    if (contact) setLines(document.getElementById("contact"), contact);
  }).catch(console.error);
})();
