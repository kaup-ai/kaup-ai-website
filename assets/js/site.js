/* Kaup · 智御无疆 — 官网交互
   主题切换 · 移动导航 · 滚动入场 · 联系表单 · 年份
   主题的首次应用在 <head> 内联脚本中完成（避免闪烁）。 */
(function () {
  "use strict";

  var root = document.documentElement;
  var STORE_KEY = "kaup-theme";

  /* ---------- 主题切换 ---------- */
  function currentTheme() {
    return root.getAttribute("data-theme") === "dark" ? "dark" : "light";
  }

  function applyTheme(theme) {
    root.setAttribute("data-theme", theme);
    try { localStorage.setItem(STORE_KEY, theme); } catch (e) {}
    var meta = document.querySelector('meta[name="theme-color"]');
    if (meta) meta.setAttribute("content", theme === "dark" ? "#0A1A2F" : "#F7F9FC");
    document.querySelectorAll("[data-theme-toggle]").forEach(function (btn) {
      btn.setAttribute("aria-pressed", String(theme === "dark"));
      btn.setAttribute("aria-label", theme === "dark" ? "切换到浅色主题" : "切换到深色主题");
    });
  }

  document.querySelectorAll("[data-theme-toggle]").forEach(function (btn) {
    btn.addEventListener("click", function () {
      applyTheme(currentTheme() === "dark" ? "light" : "dark");
    });
  });

  window.matchMedia("(prefers-color-scheme: dark)").addEventListener("change", function (e) {
    var stored = null;
    try { stored = localStorage.getItem(STORE_KEY); } catch (err) {}
    if (!stored) applyTheme(e.matches ? "dark" : "light");
  });

  /* ---------- 移动导航 ---------- */
  var navToggle = document.querySelector("[data-nav-toggle]");
  var nav = document.getElementById("site-nav");
  var header = document.querySelector(".site-header");

  /* ---------- 顶栏遮罩 ----------
     顶端透明（首页 hero 从视口顶端铺起），滚过顶端就升起毛玻璃底，
     否则 hero 里的字会直接从导航上穿过去；移动菜单展开时同理。 */
  function syncHeader() {
    if (!header) return;
    var open = !!nav && nav.getAttribute("data-open") === "true";
    header.classList.toggle("is-scrolled", open || window.scrollY > 4);
  }

  function closeNav() {
    if (!nav || !navToggle) return;
    nav.setAttribute("data-open", "false");
    navToggle.setAttribute("aria-expanded", "false");
    syncHeader();
  }

  if (navToggle && nav) {
    navToggle.addEventListener("click", function () {
      var open = nav.getAttribute("data-open") === "true";
      nav.setAttribute("data-open", String(!open));
      navToggle.setAttribute("aria-expanded", String(!open));
      syncHeader();
    });
    nav.addEventListener("click", function (e) {
      if (e.target.closest("a")) closeNav();
    });
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape") closeNav();
    });
  }

  if (header) {
    syncHeader();
    window.addEventListener("scroll", syncHeader, { passive: true });
    window.addEventListener("resize", syncHeader);
  }

  /* ---------- 滚动入场 ---------- */
  var reveals = document.querySelectorAll(".reveal");
  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  if (!reveals.length) {
    /* no-op */
  } else if (reduce || !("IntersectionObserver" in window)) {
    reveals.forEach(function (el) { el.classList.add("is-visible"); });
  } else {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        entry.target.classList.add("is-visible");
        io.unobserve(entry.target);
      });
    }, { rootMargin: "0px 0px -8% 0px", threshold: 0.06 });
    reveals.forEach(function (el) { io.observe(el); });
  }

  /* ---------- 联系表单（contact.html） ----------
     提交到 /api/contact（Vercel serverless function），成功后页内反馈，不跳转。
     校验规则与 api/contact.js 保持一致：11 位手机号 或 区号-座机。 */
  var form = document.querySelector("[data-contact-form]");

  if (form) {
    var RE_MOBILE = /^1[3-9]\d{9}$/;
    var RE_LANDLINE = /^0\d{2,3}-?\d{7,8}$/;
    var submitBtn = form.querySelector("[data-submit]");
    var status = form.querySelector("[data-form-status]");

    function fieldOf(name) { return form.querySelector('[name="' + name + '"]').closest(".field"); }

    function setFieldError(name, message) {
      var field = fieldOf(name);
      var old = field.querySelector(".field-error");
      if (old) old.remove();
      field.classList.toggle("has-error", !!message);
      if (message) {
        var p = document.createElement("p");
        p.className = "field-error";
        p.textContent = message;
        field.appendChild(p);
      }
    }

    function setStatus(state, message) {
      status.setAttribute("data-state", state || "");
      status.textContent = message || "";
    }

    form.addEventListener("submit", function (e) {
      e.preventDefault();
      setStatus("", "");

      /* 用 namedItem 而不是 form.<name> 直取：form.name 依赖 HTMLFormElement
         的 [LegacyOverrideBuiltIns] 怪癖（命名控件遮蔽内置 name 属性），
         浏览器虽都支持，但显式写法不赌实现细节 */
      var company = form.elements.namedItem("company").value.trim();
      var name = form.elements.namedItem("name").value.trim();
      var phone = form.elements.namedItem("phone").value.replace(/\s+/g, "");

      var bad = false;
      setFieldError("company", company.length >= 2 ? "" : "请填写公司名称");
      if (company.length < 2) bad = true;
      setFieldError("name", name ? "" : "请填写联系人姓名");
      if (!name) bad = true;
      var phoneOk = RE_MOBILE.test(phone) || RE_LANDLINE.test(phone);
      setFieldError("phone", phoneOk ? "" : "请填写 11 位手机号，或带区号的座机号");
      if (!phoneOk) bad = true;
      if (bad) return;

      submitBtn.disabled = true;
      submitBtn.textContent = "提交中…";

      fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          company: company,
          name: name,
          phone: phone,
          website: form.elements.namedItem("website").value /* honeypot，正常人留空 */
        })
      })
        .then(function (res) { return res.json().then(function (data) { return { ok: res.ok, data: data }; }); })
        .then(function (r) {
          if (r.ok && r.data.ok) {
            form.reset();
            setStatus("ok", "已收到，我们会在一个工作日内按你留的电话回电。");
          } else {
            setStatus("error", (r.data && r.data.error) || "提交失败，请稍后重试，或直接发邮件至 sales@kaup.ai。");
          }
        })
        .catch(function () {
          setStatus("error", "网络异常，提交未成功。请稍后重试，或直接发邮件至 sales@kaup.ai。");
        })
        .then(function () {
          submitBtn.disabled = false;
          submitBtn.textContent = "提交，等待回电";
        });
    });
  }

  /* ---------- 年份 ---------- */
  document.querySelectorAll("[data-year]").forEach(function (el) {
    el.textContent = String(new Date().getFullYear());
  });
})();
