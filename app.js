"use strict";

document.documentElement.classList.add("js");

const categories = [
  {
    name: "Volume Sirena",
    options: [
      { id: "sirena-marrom", name: "Sirena Marrom", variation: "Marrom", application: 150, maintenance: 105, image: "assets/IMG_5110.PNG" },
      { id: "sirena-preto", name: "Sirena Preto", variation: "Preto", application: 150, maintenance: 105, image: "assets/IMG_2889.PNG" }
    ]
  },
  {
    name: "Fox",
    options: [
      { id: "fox-marrom", name: "Fox Marrom", variation: "Marrom", application: 170, maintenance: 115, image: "assets/IMG_1921.PNG" },
      { id: "fox-preto", name: "Fox Preto", variation: "Preto", application: 170, maintenance: 115, image: "assets/IMG_5114.PNG" }
    ]
  },
  {
    name: "Volume Russo",
    options: [
      { id: "volume-russo", name: "Volume Russo", application: 185, maintenance: 115, image: "assets/IMG_4460.PNG" }
    ]
  },
  {
    name: "Volume Brasileiro",
    options: [
      { id: "volume-brasileiro", name: "Volume Brasileiro", application: 150, maintenance: 105, image: "assets/IMG_4458.PNG" }
    ]
  },
  {
    name: "Brow Lamination",
    options: [
      { id: "brow-lamination", name: "Brow Lamination", application: 140, maintenance: null, image: "assets/IMG_2890.PNG" }
    ]
  }
];

// Preencha apenas quando Melissa fornecer os canais oficiais.
const contactConfig = {
  whatsappNumber: "",
  bookingUrl: ""
};

const formatBRL = (value) => new Intl.NumberFormat("pt-BR", {
  style: "currency",
  currency: "BRL",
  minimumFractionDigits: 2,
  maximumFractionDigits: 2
}).format(value);

const grid = document.getElementById("modelsGrid");
const dialog = document.getElementById("modelDialog");
const dialogImage = document.getElementById("dialogImage");
const dialogTitle = document.getElementById("dialogTitle");
const dialogOptions = document.getElementById("dialogOptions");
const dialogClose = document.getElementById("dialogClose");
const contactStatus = document.getElementById("contactStatus");
const contactActions = document.getElementById("contactActions");
let selectedCard = null;
let selectedGroup = null;
let closeAfterDialog = null;
let isClosing = false;

function makeImageFrame(service, className) {
  const frame = document.createElement("span");
  frame.className = className + " image-frame";
  const img = document.createElement("img");
  img.src = service.image;
  img.alt = "Registro do serviço " + service.name;
  img.loading = className === "hero-photo" ? "eager" : "lazy";
  img.decoding = "async";
  img.addEventListener("error", markImageMissing, { once: true });
  const fallback = document.createElement("span");
  fallback.className = "image-fallback";
  fallback.setAttribute("aria-hidden", "true");
  fallback.innerHTML = "<span>ML</span><small>Imagem indisponível</small>";
  frame.append(img, fallback);
  return frame;
}

function markImageMissing(event) {
  const frame = event.currentTarget.closest(".image-frame");
  if (frame) frame.classList.add("image-missing");
}

function makePrice(label, value) {
  const wrapper = document.createElement("span");
  wrapper.className = "card-price";
  const small = document.createElement("small");
  small.textContent = label;
  const strong = document.createElement("strong");
  strong.textContent = value === null ? "Sem manutenção" : formatBRL(value);
  wrapper.append(small, strong);
  return wrapper;
}

function makeCategoryCard(group, index) {
  const representative = group.options[0];
  const card = document.createElement("article");
  card.className = "model-card reveal";

  const image = makeImageFrame(representative, "card-image");
  const number = document.createElement("span");
  number.className = "card-number";
  number.setAttribute("aria-hidden", "true");
  number.textContent = String(index + 1).padStart(2, "0");
  image.append(number);

  const content = document.createElement("div");
  content.className = "card-content";
  const titleRow = document.createElement("div");
  titleRow.className = "card-title-row";
  const title = document.createElement("span");
  title.className = "card-title";
  title.textContent = group.name;
  const detail = document.createElement("span");
  detail.className = "card-detail";
  detail.textContent = group.options.length > 1 ? "Escolha a cor" : "Serviço";
  titleRow.append(title, detail);
  content.append(titleRow);

  if (group.options.length > 1) {
    const picker = document.createElement("div");
    picker.className = "variation-picker";
    picker.setAttribute("aria-label", "Variações de " + group.name);
    group.options.forEach((service) => {
      const button = document.createElement("button");
      button.type = "button";
      button.className = "variation-button";
      button.setAttribute("aria-label", service.name + ". Aplicação " + formatBRL(service.application) + ", manutenção " + formatBRL(service.maintenance) + ". Ver detalhes.");
      const name = document.createElement("span");
      name.textContent = service.variation;
      const price = document.createElement("span");
      price.className = "variation-price";
      const application = document.createElement("strong");
      application.textContent = "Aplicação " + formatBRL(service.application);
      const maintenance = document.createElement("span");
      maintenance.textContent = "Manutenção " + formatBRL(service.maintenance);
      price.append(application, maintenance);
      button.append(name, price);
      button.addEventListener("click", () => openService(service, group, button));
      picker.append(button);
    });
    content.append(picker);
  } else {
    const service = group.options[0];
    const prices = document.createElement("div");
    prices.className = "card-prices";
    prices.append(makePrice("Aplicação", service.application));
    if (service.maintenance !== null) prices.append(makePrice("Manutenção", service.maintenance));
    else prices.append(makePrice("Manutenção", null));
    const button = document.createElement("button");
    button.type = "button";
    button.className = "service-select";
    button.textContent = "Ver detalhes  ↗";
    button.setAttribute("aria-label", "Ver detalhes de " + service.name);
    button.addEventListener("click", () => openService(service, group, button));
    content.append(prices, button);
  }

  card.append(image, content);
  return card;
}

grid.append(...categories.map(makeCategoryCard));

function renderDialog(service, group, preserveOptionFocus = false) {
  dialogTitle.textContent = service.name;
  dialogImage.src = service.image;
  dialogImage.alt = "Registro do serviço " + service.name;
  dialogImage.closest(".image-frame").classList.remove("image-missing");
  document.getElementById("dialogCategory").textContent = group.options.length > 1 ? group.name + " · Escolha de cor" : "Serviço";
  document.getElementById("dialogApplication").textContent = formatBRL(service.application);
  document.getElementById("dialogMaintenance").textContent = service.maintenance === null ? "Sem manutenção" : formatBRL(service.maintenance);

  const rule = document.getElementById("maintenanceRule");
  if (service.maintenance === null) {
    rule.textContent = "Brow Lamination não possui manutenção.";
  } else {
    rule.textContent = "A manutenção é cobrada e pode ser feita em até 21 dias, se menos de 40% dos cílios tiverem caído. A avaliação é feita pela profissional. Com 40% ou mais de queda, ou após 21 dias, é cobrado o valor de uma nova aplicação.";
  }

  dialogOptions.replaceChildren();
  if (group.options.length > 1) {
    dialogOptions.hidden = false;
    group.options.forEach((option) => {
      const button = document.createElement("button");
      button.type = "button";
      button.className = "dialog-option";
      button.textContent = option.variation;
      button.setAttribute("aria-pressed", String(option.id === service.id));
      button.setAttribute("aria-label", "Selecionar " + option.name);
      button.addEventListener("click", () => renderDialog(option, group, true));
      dialogOptions.append(button);
    });
    if (preserveOptionFocus) {
      const activeOption = dialogOptions.querySelector('[aria-pressed="true"]');
      if (activeOption) activeOption.focus({ preventScroll: true });
    }
  } else {
    dialogOptions.hidden = true;
  }
}

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

function openService(service, group, origin) {
  selectedCard = origin;
  selectedGroup = group;
  closeAfterDialog = null;
  isClosing = false;
  renderDialog(service, group);
  dialog.showModal();
  animateFromCard(origin);
  dialogClose.focus({ preventScroll: true });
}

function closeService() {
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

dialogClose.addEventListener("click", closeService);
dialog.addEventListener("cancel", (event) => {
  event.preventDefault();
  closeService();
});
dialog.addEventListener("click", (event) => {
  if (event.target === dialog) closeService();
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
  closeService();
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
