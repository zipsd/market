// ─────────────────────────────────────────────────────────────────────────────
// НАСТРОЙКИ МАГАЗИНА
// Используйте только ПУБЛИЧНЫЙ адрес. Никогда не добавляйте seed phrase или private key.
// ─────────────────────────────────────────────────────────────────────────────
const STORE_CONFIG = {
  PAYMENT_NETWORK: "YOUR_NETWORK",
  WALLET_ADDRESS: "YOUR_PUBLIC_WALLET_ADDRESS",
  CONTACT: "YOUR_CONTACT",
  CURRENCY_SYMBOL: "$"
};

// Изменяйте, добавляйте или удаляйте товары только в этом списке.
const PRODUCTS = [
  {
    id: "algebra-problem-pack",
    title: "Сборник задач по алгебре",
    description: "Уравнения, неравенства и практические задания с понятной структурой решения.",
    subject: "Алгебра",
    format: "PDF",
    price: 15
  },
  {
    id: "physics-formula-guide",
    title: "Справочник формул по физике",
    description: "Основные формулы, короткие объяснения и примеры задач для быстрого повторения.",
    subject: "Физика",
    format: "PDF",
    price: 15
  },
  {
    id: "geometry-workbook",
    title: "Рабочая тетрадь по геометрии",
    description: "Задания по геометрии с чертежами и местом для полного оформления решений.",
    subject: "Геометрия",
    format: "PDF",
    price: 15
  }
];

const grid = document.querySelector("#product-grid");
const productCount = document.querySelector("#product-count");
const subjectFilters = document.querySelector("#subject-filters");
const filterStatus = document.querySelector("#filter-status");
const modal = document.querySelector("#payment-modal");
const modalPanel = modal.querySelector(".modal-panel");
const modalTitle = document.querySelector("#modal-title");
const modalPrice = document.querySelector("#modal-price");
const modalNetwork = document.querySelector("#modal-network");
const warningNetwork = document.querySelector("#warning-network");
const walletAddress = document.querySelector("#wallet-address");
const contact = document.querySelector("#contact");
const copyButton = document.querySelector("#copy-address");
const copyStatus = document.querySelector("#copy-status");
let lastFocusedElement = null;
let activeSubject = "Все";

function formatPrice(value) {
  return `${STORE_CONFIG.CURRENCY_SYMBOL}${value}`;
}

function createProductCard(product, index) {
  const article = document.createElement("article");
  article.className = "product-card";
  article.innerHTML = `
    <span class="product-index">МАТЕРИАЛ_${String(index + 1).padStart(2, "0")}</span>
    <div class="product-icon" aria-hidden="true">${product.format}</div>
    <h3>${product.title}</h3>
    <p class="product-description">${product.description}</p>
    <div class="product-footer">
      <div class="file-meta"><span>${product.subject} / ${product.format}</span><span class="price">${formatPrice(product.price)}</span></div>
      <button class="buy-button" type="button" data-product-id="${product.id}">Купить за ${formatPrice(product.price)}</button>
    </div>`;
  return article;
}

function renderProducts() {
  const visibleProducts = activeSubject === "Все"
    ? PRODUCTS
    : PRODUCTS.filter((product) => product.subject === activeSubject);
  const fragment = document.createDocumentFragment();
  visibleProducts.forEach((product, index) => fragment.append(createProductCard(product, index)));
  grid.replaceChildren(fragment);
  productCount.textContent = `ДОСТУПНО: ${PRODUCTS.length}`;
  filterStatus.textContent = activeSubject === "Все"
    ? `Показаны все материалы: ${visibleProducts.length}`
    : `${activeSubject}: ${visibleProducts.length} ${visibleProducts.length === 1 ? "материал" : "материала"}`;
}

function renderSubjectFilters() {
  const subjects = ["Все", ...new Set(PRODUCTS.map((product) => product.subject))];
  const fragment = document.createDocumentFragment();
  subjects.forEach((subject) => {
    const button = document.createElement("button");
    button.className = "subject-filter";
    button.type = "button";
    button.textContent = subject;
    button.dataset.subject = subject;
    button.setAttribute("aria-pressed", String(subject === activeSubject));
    fragment.append(button);
  });
  subjectFilters.replaceChildren(fragment);
}

function openModal(product) {
  lastFocusedElement = document.activeElement;
  modalTitle.textContent = product.title;
  modalPrice.textContent = formatPrice(product.price);
  modalNetwork.textContent = STORE_CONFIG.PAYMENT_NETWORK;
  warningNetwork.textContent = STORE_CONFIG.PAYMENT_NETWORK;
  walletAddress.textContent = STORE_CONFIG.WALLET_ADDRESS;
  contact.textContent = STORE_CONFIG.CONTACT;
  copyStatus.textContent = "";
  copyButton.textContent = "Копировать адрес";
  modal.hidden = false;
  document.body.classList.add("modal-open");
  requestAnimationFrame(() => {
    modal.classList.add("is-open");
    modalPanel.focus();
  });
}

function closeModal() {
  modal.classList.remove("is-open");
  document.body.classList.remove("modal-open");
  window.setTimeout(() => {
    modal.hidden = true;
    lastFocusedElement?.focus();
  }, 200);
}

function getFocusableElements() {
  return [...modal.querySelectorAll('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])')]
    .filter((element) => !element.hasAttribute("disabled"));
}

async function copyAddress() {
  try {
    await navigator.clipboard.writeText(STORE_CONFIG.WALLET_ADDRESS);
    copyButton.textContent = "Скопировано";
    copyStatus.textContent = "Публичный адрес скопирован.";
  } catch {
    const range = document.createRange();
    range.selectNodeContents(walletAddress);
    const selection = window.getSelection();
    selection.removeAllRanges();
    selection.addRange(range);
    copyStatus.textContent = "Адрес выделен. Нажмите Ctrl+C или Command+C, чтобы скопировать.";
  }
}

grid.addEventListener("click", (event) => {
  const button = event.target.closest("[data-product-id]");
  if (!button) return;
  const product = PRODUCTS.find((item) => item.id === button.dataset.productId);
  if (product) openModal(product);
});

subjectFilters.addEventListener("click", (event) => {
  const button = event.target.closest("[data-subject]");
  if (!button) return;
  activeSubject = button.dataset.subject;
  subjectFilters.querySelectorAll("[data-subject]").forEach((item) => {
    item.setAttribute("aria-pressed", String(item.dataset.subject === activeSubject));
  });
  renderProducts();
});

modal.addEventListener("click", (event) => {
  if (event.target.closest("[data-close-modal]")) closeModal();
});

document.addEventListener("keydown", (event) => {
  if (modal.hidden) return;
  if (event.key === "Escape") closeModal();
  if (event.key === "Tab") {
    const focusable = getFocusableElements();
    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  }
});

copyButton.addEventListener("click", copyAddress);
renderSubjectFilters();
renderProducts();
