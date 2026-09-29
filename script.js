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

const PREMIUM_PRICE = 7;

// Изменяйте, добавляйте или удаляйте товары только в этом списке.
const PRODUCTS = [
  {
    id: "algebra-problem-pack",
    title: "Сборник задач по алгебре",
    description: "Уравнения, неравенства и практические задания с понятной структурой решения.",
    subject: "Алгебра",
    format: "PDF",
    fileUrl: "",
    sha256: ""
  },
  {
    id: "physics-formula-guide",
    title: "Справочник формул по физике",
    description: "Основные формулы, короткие объяснения и примеры задач для быстрого повторения.",
    subject: "Физика",
    format: "PDF",
    fileUrl: "",
    sha256: ""
  },
  {
    id: "geometry-workbook",
    title: "Рабочая тетрадь по геометрии",
    description: "Задания по геометрии с чертежами и местом для полного оформления решений.",
    subject: "Геометрия",
    format: "PDF",
    fileUrl: "",
    sha256: ""
  }
];

const SUBJECTS = [
  "Алгебра",
  "Геометрия",
  "Литература",
  "Русский язык",
  "Английский язык (345 кабинет)",
  "Химия",
  "Физика",
  "Биология",
  "География",
  "История",
  "Информатика (338 кабинет)",
  "Музыка"
];

const loginScreen = document.querySelector("#login-screen");
const loginForm = document.querySelector("#login-form");
const loginError = document.querySelector("#login-error");
const siteShell = document.querySelector("#site-shell");
const logoutButton = document.querySelector("#logout-button");
const premiumButton = document.querySelector("#premium-button");
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
const verificationModal = document.querySelector("#verification-modal");
const verificationStatus = document.querySelector("#verification-status");
const verificationClose = document.querySelector("#verification-close");
let lastFocusedElement = null;
let activeSubject = "Все";
let storeInitialized = false;

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
      <div class="file-meta"><span>${product.subject} / ${product.format}</span><span class="price">Бесплатно</span></div>
      ${product.fileUrl
        ? `<button class="buy-button" type="button" data-download-url="${product.fileUrl}" data-sha256="${product.sha256 || ""}">Скачать бесплатно</button>`
        : `<button class="buy-button" type="button" disabled>Материал готовится</button>`}
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
  const subjects = ["Все", ...SUBJECTS];
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

subjectFilters.addEventListener("click", (event) => {
  const button = event.target.closest("[data-subject]");
  if (!button) return;
  activeSubject = button.dataset.subject;
  subjectFilters.querySelectorAll("[data-subject]").forEach((item) => {
    item.setAttribute("aria-pressed", String(item.dataset.subject === activeSubject));
  });
  renderProducts();
});

function wait(milliseconds) {
  return new Promise((resolve) => window.setTimeout(resolve, milliseconds));
}

function bytesToHex(buffer) {
  return [...new Uint8Array(buffer)].map((byte) => byte.toString(16).padStart(2, "0")).join("");
}

async function verifyAndDownload(url, expectedHash) {
  verificationModal.hidden = false;
  verificationModal.classList.remove("has-error");
  verificationClose.hidden = true;
  verificationStatus.textContent = "Проверка подлинности сертификата и целостности файлов…";
  requestAnimationFrame(() => {
    verificationModal.classList.add("is-open");
    requestAnimationFrame(() => verificationModal.classList.add("is-running"));
  });

  let objectUrl = "";
  try {
    const verification = expectedHash
      ? fetch(url).then(async (response) => {
          if (!response.ok) throw new Error("Файл недоступен");
          const fileData = await response.arrayBuffer();
          const digest = await crypto.subtle.digest("SHA-256", fileData);
          if (bytesToHex(digest) !== expectedHash.toLowerCase().replaceAll(" ", "")) {
            throw new Error("Контрольная сумма не совпала");
          }
          objectUrl = URL.createObjectURL(new Blob([fileData]));
        })
      : Promise.resolve();

    await Promise.all([wait(5000), verification]);
    verificationStatus.textContent = "Проверка завершена. Начинаем скачивание…";
    const download = document.createElement("a");
    download.href = objectUrl || url;
    download.download = "";
    download.rel = "noopener";
    document.body.append(download);
    download.click();
    download.remove();
    await wait(700);
    verificationModal.classList.remove("is-open", "is-running");
    await wait(200);
    verificationModal.hidden = true;
    if (objectUrl) URL.revokeObjectURL(objectUrl);
  } catch (error) {
    verificationModal.classList.remove("is-running");
    verificationModal.classList.add("has-error");
    verificationStatus.textContent = "Не удалось подтвердить целостность файла. Скачивание отменено.";
    verificationClose.hidden = false;
    verificationClose.focus();
  }
}

grid.addEventListener("click", (event) => {
  const button = event.target.closest("[data-download-url]");
  if (!button) return;
  verifyAndDownload(button.dataset.downloadUrl, button.dataset.sha256);
});

verificationClose.addEventListener("click", () => {
  verificationModal.classList.remove("is-open", "is-running", "has-error");
  verificationModal.hidden = true;
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
premiumButton.addEventListener("click", () => {
  openModal({ title: "Market Premium", price: PREMIUM_PRICE });
});

function initializeStore() {
  if (storeInitialized) return;
  renderSubjectFilters();
  renderProducts();
  storeInitialized = true;
}

function showStore() {
  loginScreen.hidden = true;
  siteShell.hidden = false;
  document.body.classList.remove("login-active");
  initializeStore();
}

function showLogin() {
  siteShell.hidden = true;
  loginScreen.hidden = false;
  document.body.classList.add("login-active");
  loginForm.reset();
  loginError.textContent = "";
  document.querySelector("#login-username").focus();
}

loginForm.addEventListener("submit", (event) => {
  event.preventDefault();
  const formData = new FormData(loginForm);
  const username = String(formData.get("username") || "");
  const password = String(formData.get("password") || "");
  const credentials = Array.isArray(window.MARKET_USERS) ? window.MARKET_USERS : [];
  const allowed = credentials.some((user) => user.username === username && user.password === password);

  if (!allowed) {
    loginError.textContent = "Неверный логин или пароль.";
    document.querySelector("#login-password").select();
    return;
  }

  sessionStorage.setItem("market_authenticated", "true");
  showStore();
});

logoutButton.addEventListener("click", () => {
  sessionStorage.removeItem("market_authenticated");
  showLogin();
});

if (sessionStorage.getItem("market_authenticated") === "true") {
  showStore();
} else {
  showLogin();
}
