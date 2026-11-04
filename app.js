"use strict";

document.documentElement.classList.add("js");

const models = [
  { number: "01", name: "Fox marrom", application: 170, maintenance: 115, image: "assets/IMG_1921.PNG" },
  { number: "02", name: "Sirena marrom", application: 150, maintenance: 105, image: "assets/IMG_5110.PNG" },
  { number: "03", name: "Fox preto", application: 170, maintenance: 115, image: "assets/IMG_5114.PNG" },
  { number: "04", name: "Volume russo", application: 185, maintenance: 115, image: "assets/IMG_4460.PNG" },
  { number: "05", name: "Volume brasileiro", application: 150, maintenance: 105, image: "assets/IMG_4458.PNG" }
];

// Preencha apenas quando Melissa fornecer os canais oficiais.
const contactConfig = {
  whatsappNumber: "",
  bookingUrl: ""
};

const formatBRL = (value) => new Intl.NumberFormat("pt-BR", {
  style: "currency",
  currency: "BRL",
  maximumFractionDigits: 0
}).format(value);

const grid = document.getElementById("modelsGrid");
const dialog = document.getElementById("modelDialog");
const dialogImage = document.getElementById("dialogImage");
const dialogTitle = document.getElementById("dialogTitle");
const dialogClose = document.getElementById("dialogClose");
const contactStatus = document.getElementById("contactStatus");
const contactActions = document.getElementById("contactActions");
let selectedCard = null;
let closeAfterDialog = null;
let isClosing = false;

function makeCard(model) {
  const button = document.createElement("button");
  button.className = "model-card reveal";
  button.type = "button";
  button.setAttribute("aria-haspopup", "dialog");
  button.setAttribute("aria-label", model.name + ". Aplicação " + formatBRL(model.application) + ", manutenção " + formatBRL(model.maintenance) + ". Ver detalhes.");
  button.dataset.model = model.number;

  const image = document.createElement("span");
  image.className = "card-image image-frame";
  const img = document.createElement("img");
  img.src = model.image;
  img.alt = "Registro do modelo " + model.name;
  img.loading = "lazy";
  img.decoding = "async";
  img.addEventListener("error", markImageMissing, { once: true });
  const fallback = document.createElement("span");
  fallback.className = "image-fallback";
  fallback.setAttribute("aria-hidden", "true");
  fallback.innerHTML = "<span>ML</span><small>Imagem indisponível</small>";
  const number = document.createElement("span");
  number.className = "card-number";
  number.setAttribute("aria-hidden", "true");
  number.textContent = model.number;
  const open = document.createElement("span");
  open.className = "card-open";
  open.setAttribute("aria-hidden", "true");
  open.textContent = "↗";
  image.append(img, fallback, number, open);

  const content = document.createElement("span");
  content.className = "card-content";
  const titleRow = document.createElement("span");
  titleRow.className = "card-title-row";
  const title = document.createElement("span");
  title.className = "card-title";
  title.textContent = model.name;
  const detail = document.createElement("span");
  detail.className = "card-detail";
  detail.textContent = "Ver detalhes";
  titleRow.append(title, detail);

  const prices = document.createElement("span");
  prices.className = "card-prices";
  prices.append(makePrice("Aplicação", model.application), makePrice("Manutenção", model.maintenance));
  content.append(titleRow, prices);
  button.append(image, content);
  button.addEventListener("click", () => openModel(model, button));
  return button;
}

function makePrice(label, value) {
  const wrapper = document.createElement("span");
  wrapper.className = "card-price";
  const small = document.createElement("small");
  small.textContent = label;
  const strong = document.createElement("strong");
  strong.textContent = formatBRL(value);
  wrapper.append(small, strong);
  return wrapper;
}

function markImageMissing(event) {
  const frame = event.currentTarget.closest(".image-frame");
  if (frame) frame.classList.add("image-missing");
}

document.querySelectorAll(".image-frame img").forEach((image) => {
  image.addEventListener("error", markImageMissing, { once: true });
  if (image.complete && image.naturalWidth === 0) {
    image.closest(".image-frame").classList.add("image-missing");
  }
});

grid.append(...models.map(makeCard));

function animateFromCard(card) {
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches || typeof dialog.animate !== "function") return;
  const start = card.getBoundingClientRect();
  const end = dialog.getBoundingClientRect();
  const scaleX = Math.max(0.1, start.width / end.width);
  const scaleY = Math.max(0.1, start.height / end.height);
  dialog.animate([
    { transform: "translate(" + (start.left - end.left) + "px, " + (start.top - end.top) + "px) scale(" + scaleX + ", " + scaleY + ")", opacity: 0.72 },
    { transform: "translate(0, 0) scale(1, 1)", opacity: 1 }
  ], { duration: 480, easing: "cubic-bezier(.2,.75,.25,1)" });
}

function openModel(model, card) {
  selectedCard = card;
  closeAfterDialog = null;
  isClosing = false;
  dialogTitle.textContent = model.name;
  dialogImage.src = model.image;
  dialogImage.alt = "Registro do modelo " + model.name;
  dialogImage.closest(".image-frame").classList.remove("image-missing");
  document.getElementById("dialogNumber").textContent = model.number;
  document.getElementById("dialogApplication").textContent = formatBRL(model.application);
  document.getElementById("dialogMaintenance").textContent = formatBRL(model.maintenance);
  dialog.showModal();
  animateFromCard(card);
  dialogClose.focus({ preventScroll: true });
}

function closeModel() {
  if (!dialog.open || isClosing) return;
  isClosing = true;
  if (!window.matchMedia("(prefers-reduced-motion: reduce)").matches && typeof dialog.animate === "function" && selectedCard) {
    const start = dialog.getBoundingClientRect();
    const end = selectedCard.getBoundingClientRect();
    const scaleX = Math.max(0.1, end.width / start.width);
    const scaleY = Math.max(0.1, end.height / start.height);
    const animation = dialog.animate([
      { transform: "translate(0, 0) scale(1, 1)", opacity: 1 },
      { transform: "translate(" + (end.left - start.left) + "px, " + (end.top - start.top) + "px) scale(" + scaleX + ", " + scaleY + ")", opacity: 0.72 }
    ], { duration: 360, easing: "cubic-bezier(.55,0,.8,.3)" });
    animation.onfinish = () => {
      isClosing = false;
      dialog.close();
    };
  } else {
    isClosing = false;
    dialog.close();
  }
}

dialogClose.addEventListener("click", closeModel);
dialog.addEventListener("cancel", (event) => {
  event.preventDefault();
  closeModel();
});
dialog.addEventListener("click", (event) => {
  if (event.target === dialog) closeModel();
});
dialog.addEventListener("close", () => {
  isClosing = false;
  if (selectedCard && selectedCard.isConnected) selectedCard.focus({ preventScroll: true });
  if (closeAfterDialog === "contact") {
    const contact = document.getElementById("contato");
    contact.scrollIntoView({ behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth", block: "start" });
    contact.focus({ preventScroll: true });
    closeAfterDialog = null;
  }
});
document.getElementById("dialogContact").addEventListener("click", (event) => {
  event.preventDefault();
  closeAfterDialog = "contact";
  closeModel();
});

function configureContact() {
  const actions = [];
  const number = contactConfig.whatsappNumber.replace(/\D/g, "");
  if (number) {
    const link = document.createElement("a");
    link.href = "https://wa.me/" + number + "?text=" + encodeURIComponent("Olá, Melissa! Gostaria de consultar a disponibilidade para extensão de cílios.");
    link.target = "_blank";
    link.rel = "noopener noreferrer";
    link.textContent = "Falar pelo WhatsApp ↗";
    actions.push(link);
  }
  if (contactConfig.bookingUrl.trim()) {
    const link = document.createElement("a");
    link.href = contactConfig.bookingUrl.trim();
    link.target = "_blank";
    link.rel = "noopener noreferrer";
    link.textContent = "Abrir agendamento ↗";
    actions.push(link);
  }
  if (actions.length) {
    contactActions.replaceChildren(...actions);
    contactActions.hidden = false;
    contactStatus.textContent = "Consulte a disponibilidade diretamente com Melissa.";
  }
}
configureContact();

const menuToggle = document.querySelector(".menu-toggle");
const siteNav = document.getElementById("site-nav");
menuToggle.addEventListener("click", () => {
  const isOpen = menuToggle.getAttribute("aria-expanded") === "true";
  menuToggle.setAttribute("aria-expanded", String(!isOpen));
  menuToggle.setAttribute("aria-label", isOpen ? "Abrir menu" : "Fechar menu");
  siteNav.classList.toggle("is-open", !isOpen);
});
siteNav.querySelectorAll("a").forEach((link) => {
  link.addEventListener("click", () => {
    menuToggle.setAttribute("aria-expanded", "false");
    menuToggle.setAttribute("aria-label", "Abrir menu");
    siteNav.classList.remove("is-open");
  });
});

if ("IntersectionObserver" in window && !window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
  const observer = new IntersectionObserver((entries, currentObserver) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("is-visible");
        currentObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12 });
  document.querySelectorAll(".reveal").forEach((element) => observer.observe(element));
} else {
  document.querySelectorAll(".reveal").forEach((element) => element.classList.add("is-visible"));
}
