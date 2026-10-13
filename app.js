/* Acme Mutual Supplier Portal - client-side session handling (static demo site) */
(function () {
  var KEY = "acmeSupplierSession";
  var ORG = "Northbeam Digital";
  function read() {
    try { return JSON.parse(sessionStorage.getItem(KEY) || localStorage.getItem(KEY) || "null"); }
    catch (e) { return null; }
  }
  function write(s) {
    var v = JSON.stringify(s);
    sessionStorage.setItem(KEY, v);
    try { localStorage.setItem(KEY, v); } catch (e) {}
  }
  function clear() { sessionStorage.removeItem(KEY); try { localStorage.removeItem(KEY); } catch (e) {} }
  function safeNext(n) { return (n && /^[\w-]+\.html(#[\w-]+)?$/.test(n)) ? n : "dashboard.html"; }
  function page() { return (location.pathname.split("/").pop() || "index.html") + (location.hash || ""); }

  var body = document.body;
  var session = read();

  if (body.getAttribute("data-auth") === "required" && !session) {
    location.replace("index.html?next=" + encodeURIComponent(page()));
    return;
  }

  // Sign-in form
  var form = document.getElementById("signin");
  if (form) {
    if (session) { location.replace(safeNext(new URLSearchParams(location.search).get("next"))); return; }
    form.addEventListener("submit", function (ev) {
      ev.preventDefault();
      var u = document.getElementById("username").value.trim();
      var p = document.getElementById("password").value;
      var err = document.getElementById("error");
      if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(u) || !p) {
        err.textContent = "Enter your registered email address and password.";
        err.style.display = "block";
        return;
      }
      write({ user: u, org: ORG, signedInAt: new Date().toISOString() });
      location.href = safeNext(new URLSearchParams(location.search).get("next"));
    });
  }

  // Populate user details
  if (!session) {
    document.querySelectorAll(".userbox").forEach(function (el) { el.innerHTML = '<a href="index.html">Supplier sign in</a>'; });
  }
  if (session) {
    document.querySelectorAll("[data-user]").forEach(function (el) { el.textContent = session.user; });
    document.querySelectorAll("[data-org]").forEach(function (el) { el.textContent = session.org || ORG; });
  }
  document.querySelectorAll("[data-signout]").forEach(function (el) {
    el.addEventListener("click", function (ev) { ev.preventDefault(); clear(); location.href = "index.html"; });
  });

  // Addendum acknowledgment (stored locally)
  var ack = document.getElementById("ack-btn");
  if (ack) {
    var AK = "acme2026117Ack";
    function show(ts) {
      ack.textContent = "Acknowledged " + new Date(ts).toLocaleString();
      ack.disabled = true; ack.className = "btn small secondary";
    }
    var prev = localStorage.getItem(AK);
    if (prev) show(prev);
    ack.addEventListener("click", function () { var ts = new Date().toISOString(); localStorage.setItem(AK, ts); show(ts); });
  }
})();
