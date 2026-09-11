const businesses = [
  {
    id: "banahaw-brew-lab",
    name: "Banahaw Brew Lab",
    category: "Food & Drinks",
    type: "Product",
    symbol: "☕",
    color: "#dce9dc",
    price: "From ₱55",
    description: "Small-batch cold brew and campus-ready coffee bottles for busy class days.",
    owner: "Student-led sample",
    tags: ["Cold brew", "Pre-order", "Bottle return"],
    fulfillment: "Pickup near the SLSU main gate",
    orderMethod: "Message to reserve, then choose a pickup window",
    contact: "@banahawbrew.demo",
    impact: "Offers a bottle-return discount to reduce single-use packaging.",
    steps: ["Send your drink and quantity", "Choose an available pickup time", "Pay on pickup or through the seller's listed method"]
  },
  {
    id: "thread-and-trinket",
    name: "Thread & Trinket",
    category: "Fashion & Accessories",
    type: "Product",
    symbol: "✿",
    color: "#f5e1eb",
    price: "From ₱85",
    description: "Made-to-order beaded bracelets, phone charms, and small custom gifts.",
    owner: "Student-led sample",
    tags: ["Customized", "Made to order", "Gift-ready"],
    fulfillment: "Campus meetup or local delivery",
    orderMethod: "Message your design request and preferred colors",
    contact: "threadandtrinket@example.com",
    impact: "Produces by order to avoid excess stock and material waste.",
    steps: ["Share your item, colors, and size", "Approve the quoted design and price", "Confirm pickup or delivery after production"]
  },
  {
    id: "pixelpeak-studio",
    name: "PixelPeak Studio",
    category: "Creative Services",
    type: "Service",
    symbol: "◈",
    color: "#dfe5fa",
    price: "From ₱150",
    description: "Clean pubmats, event identities, and social media kits for student organizations.",
    owner: "Student-led sample",
    tags: ["Pubmats", "Brand kits", "Digital delivery"],
    fulfillment: "Online briefing and file delivery",
    orderMethod: "Send a project brief for schedule and quotation",
    contact: "pixelpeak.demo@example.com",
    impact: "Digital-first delivery keeps revisions organized and paper-free.",
    steps: ["Send the event details and deadline", "Receive a scope, schedule, and price", "Approve the draft before final files are delivered"]
  },
  {
    id: "studysprint-prints",
    name: "StudySprint Prints",
    category: "Academic & Digital",
    type: "Service",
    symbol: "▤",
    color: "#fae8c7",
    price: "From ₱3/page",
    description: "Student-friendly printing, binding, and reviewer assembly with scheduled pickup.",
    owner: "Student-led sample",
    tags: ["Printing", "Binding", "Same-day slots"],
    fulfillment: "Scheduled campus pickup",
    orderMethod: "Send files and specifications before the cutoff",
    contact: "@studysprint.demo",
    impact: "Encourages duplex printing and exact-quantity orders to reduce paper waste.",
    steps: ["Send print-ready files", "Confirm paper, color, binding, and quantity", "Receive the total and selected pickup slot"]
  },
  {
    id: "greenroom-plant-co",
    name: "GreenRoom Plant Co.",
    category: "Eco & Home",
    type: "Product",
    symbol: "❋",
    color: "#d8eed6",
    price: "From ₱70",
    description: "Easy-care propagated plants and hand-painted pots for desks and dorm spaces.",
    owner: "Student-led sample",
    tags: ["Plants", "Upcycled pots", "Care guide"],
    fulfillment: "Friday campus pickup",
    orderMethod: "Reserve from the weekly available-plant list",
    contact: "greenroom.demo@example.com",
    impact: "Uses propagated plants and repurposed containers whenever suitable.",
    steps: ["Ask for this week's available plants", "Reserve a plant and pot combination", "Collect it with a simple care guide"]
  },
  {
    id: "career-ready-peer",
    name: "Career Ready Peer",
    category: "Academic & Digital",
    type: "Service",
    symbol: "↗",
    color: "#e6def3",
    price: "From ₱120",
    description: "Peer resume formatting, practice interviews, and presentation coaching for students.",
    owner: "Student-led sample",
    tags: ["Resume", "Mock interview", "Coaching"],
    fulfillment: "Online or CABHA-area meetup",
    orderMethod: "Book a 30- or 60-minute student session",
    contact: "@careerreadypeer.demo",
    impact: "A skills-based service with reusable digital resources and no physical inventory.",
    steps: ["Choose the support you need", "Send your preferred schedule and materials", "Confirm the session after availability is checked"]
  }
];

const grid = document.querySelector("#businessGrid");
const searchInput = document.querySelector("#searchInput");
const categoryFilter = document.querySelector("#categoryFilter");
const typeFilter = document.querySelector("#typeFilter");
const categoryChips = document.querySelector("#categoryChips");
const resultsCount = document.querySelector("#resultsCount");
const resetFilters = document.querySelector("#resetFilters");
const emptyState = document.querySelector("#emptyState");
const profileDialog = document.querySelector("#profileDialog");
const profileContent = document.querySelector("#profileContent");
const submitDialog = document.querySelector("#submitDialog");
const businessForm = document.querySelector("#businessForm");
const formPreview = document.querySelector("#formPreview");
const submissionFormView = document.querySelector("#submissionFormView");
const submissionSuccess = document.querySelector("#submissionSuccess");
const submissionStatus = document.querySelector("#submissionStatus");
const pendingCount = document.querySelector("#pendingCount");
const toast = document.querySelector("#toast");

let activeCategory = "all";
let toastTimer;

const escapeHTML = (value = "") => String(value).replace(/[&<>'"]/g, character => ({
  "&": "&amp;", "<": "&lt;", ">": "&gt;", "'": "&#39;", '"': "&quot;"
})[character]);

function cardTemplate(business) {
  return `
    <article class="business-card" tabindex="0" role="button" aria-label="Open ${escapeHTML(business.name)} profile" data-business-id="${business.id}" style="--card-bg:${business.color}">
      <div class="card-cover">
        <span class="card-symbol" aria-hidden="true">${business.symbol}</span>
        <span class="type-pill">${business.type}</span>
      </div>
      <div class="card-meta">
        <span class="category-label">${business.category}</span>
        <span class="price">${business.price}</span>
      </div>
      <h3>${business.name}</h3>
      <p>${business.description}</p>
      <div class="card-footer">
        <span>${business.fulfillment}</span>
        <strong>View →</strong>
      </div>
    </article>`;
}

function renderBusinesses() {
  const directoryBusinesses = [...businesses, ...window.CampusMadeStore.getApprovedDirectoryItems()];
  const query = searchInput.value.trim().toLowerCase();
  const type = typeFilter.value;
  const filtered = directoryBusinesses.filter(business => {
    const searchable = [business.name, business.category, business.description, ...business.tags].join(" ").toLowerCase();
    return (!query || searchable.includes(query)) &&
      (activeCategory === "all" || business.category === activeCategory) &&
      (type === "all" || business.type === type);
  });

  grid.innerHTML = filtered.map(cardTemplate).join("");
  grid.hidden = filtered.length === 0;
  emptyState.hidden = filtered.length !== 0;
  resultsCount.textContent = `${filtered.length} ${filtered.length === 1 ? "business" : "businesses"} found`;
  document.querySelector("#heroBusinessCount").textContent = directoryBusinesses.length;
  resetFilters.hidden = !query && activeCategory === "all" && type === "all";
  document.querySelectorAll(".chip").forEach(chip => chip.classList.toggle("active", chip.dataset.category === activeCategory));
}

function setupCategories() {
  const categories = [...new Set(businesses.map(item => item.category))];
  categoryFilter.innerHTML += categories.map(category => `<option>${category}</option>`).join("");
  categoryChips.innerHTML = ["all", ...categories].map(category => `
    <button class="chip ${category === "all" ? "active" : ""}" type="button" data-category="${category}">
      ${category === "all" ? "All" : category}
    </button>`).join("");
}

function syncCategory(category) {
  activeCategory = category;
  categoryFilter.value = category;
  renderBusinesses();
}

function clearFilters() {
  searchInput.value = "";
  typeFilter.value = "all";
  syncCategory("all");
  searchInput.focus();
}

function openProfile(business) {
  profileContent.innerHTML = `
    <div class="profile-cover" style="--profile-bg:${business.color}">
      <span class="profile-symbol" aria-hidden="true">${business.symbol}</span>
      <span class="type-pill">${business.type} · Sample listing</span>
    </div>
    <div class="profile-body">
      <div class="profile-heading">
        <div>
          <span class="category-label">${business.category}</span>
          <h2 id="profileName">${business.name}</h2>
          <p>${business.description}</p>
        </div>
        <span class="profile-price">${business.price}</span>
      </div>
      <div class="profile-tags">${business.tags.map(tag => `<span>${tag}</span>`).join("")}</div>
      <div class="profile-details">
        <div class="detail-box"><span>How to order</span><strong>${business.orderMethod}</strong></div>
        <div class="detail-box"><span>Fulfillment</span><strong>${business.fulfillment}</strong></div>
        <div class="detail-box"><span>Contact</span><strong>${business.contact}</strong></div>
        <div class="detail-box"><span>Profile</span><strong>${business.owner}</strong></div>
      </div>
      <div class="impact-box"><span aria-hidden="true">♻</span><div><strong>Practical sustainability</strong>${business.impact}</div></div>
      <div class="profile-actions">
        <button class="button button-accent" type="button" data-copy-contact="${escapeHTML(business.contact)}">Copy order contact</button>
        <button class="button button-ghost" type="button" data-toggle-order>View order steps</button>
      </div>
      <div class="order-guide" id="orderGuide" hidden>
        <span class="category-label">Simple order flow</span>
        <ol>${business.steps.map(step => `<li>${step}</li>`).join("")}</ol>
      </div>
    </div>`;
  profileDialog.showModal();
}

function showToast(message) {
  clearTimeout(toastTimer);
  toast.textContent = message;
  toast.classList.add("show");
  toastTimer = setTimeout(() => toast.classList.remove("show"), 2300);
}

function updatePreview() {
  const data = Object.fromEntries(new FormData(businessForm));
  const iconMap = { "Food & Drinks": "☕", "Fashion & Accessories": "✿", "Creative Services": "◈", "Academic & Digital": "▤", "Eco & Home": "❋", "Personal Care": "◇" };
  document.querySelector("#descriptionCount").textContent = (data.description || "").length;
  formPreview.innerHTML = `
    <div class="preview-card">
      <div class="preview-cover"><span aria-hidden="true">${iconMap[data.category] || "✦"}</span></div>
      <div class="preview-body">
        <span class="category-label">${escapeHTML(data.category || "Your category")}</span>
        <h3>${escapeHTML(data.businessName || "Your business name")}</h3>
        <p>${escapeHTML(data.description || "A short, specific description will help students understand what you offer.")}</p>
        <div class="preview-bottom"><strong>${escapeHTML(data.price || "Starting price")}</strong><span>${escapeHTML(data.type || "Product or service")}</span></div>
      </div>
    </div>
    <p class="review-note"><span aria-hidden="true">◷</span> This preview will be checked before it can appear in the directory.</p>`;
}

function resetSubmissionView() {
  submissionSuccess.hidden = true;
  submissionFormView.hidden = false;
  document.querySelector(".submit-heading").hidden = false;
  businessForm.reset();
  clearFormErrors();
  updatePreview();
}

function openSubmission() {
  resetSubmissionView();
  submitDialog.showModal();
}

function clearFormErrors() {
  businessForm.querySelectorAll(".field.invalid").forEach(field => field.classList.remove("invalid"));
  businessForm.querySelectorAll(".error-message").forEach(message => message.textContent = "");
}

function validateForm() {
  clearFormErrors();
  let valid = true;
  businessForm.querySelectorAll("[required]").forEach(input => {
    if (input.type === "checkbox" ? !input.checked : !input.value.trim()) {
      valid = false;
      if (input.type === "checkbox") {
        document.querySelector(".consent-error").textContent = "Please confirm before submitting.";
      } else {
        const field = input.closest(".field");
        field.classList.add("invalid");
        field.querySelector(".error-message").textContent = "This field is required.";
      }
    }
  });
  return valid;
}

function getPendingSubmissions() {
  return window.CampusMadeStore.getAll().filter(item => item.status === "Pending");
}

function updatePendingStatus() {
  const pending = getPendingSubmissions();
  pendingCount.textContent = pending.length;
  submissionStatus.hidden = pending.length === 0;
}

function handleSubmit(event) {
  event.preventDefault();
  if (!validateForm()) {
    businessForm.querySelector(".invalid input, .invalid select, .invalid textarea")?.focus();
    return;
  }
  const data = Object.fromEntries(new FormData(businessForm));
  window.CampusMadeStore.create(data);
  updatePendingStatus();

  document.querySelector("#reviewCard").innerHTML = `
    <div><h3>${escapeHTML(data.businessName)}</h3><p>${escapeHTML(data.category)} · ${escapeHTML(data.type)}</p></div>
    <span class="status-pill pending">Under review</span>`;
  submissionFormView.hidden = true;
  document.querySelector(".submit-heading").hidden = true;
  submissionSuccess.hidden = false;
}

setupCategories();
renderBusinesses();
updatePreview();
updatePendingStatus();

searchInput.addEventListener("input", renderBusinesses);
typeFilter.addEventListener("change", renderBusinesses);
categoryFilter.addEventListener("change", event => syncCategory(event.target.value));
categoryChips.addEventListener("click", event => {
  const chip = event.target.closest("[data-category]");
  if (chip) syncCategory(chip.dataset.category);
});
resetFilters.addEventListener("click", clearFilters);
document.querySelector("#emptyReset").addEventListener("click", clearFilters);

grid.addEventListener("click", event => {
  const card = event.target.closest("[data-business-id]");
  const directoryBusinesses = [...businesses, ...window.CampusMadeStore.getApprovedDirectoryItems()];
  if (card) openProfile(directoryBusinesses.find(business => business.id === card.dataset.businessId));
});
grid.addEventListener("keydown", event => {
  if ((event.key === "Enter" || event.key === " ") && event.target.matches("[data-business-id]")) {
    event.preventDefault();
    const directoryBusinesses = [...businesses, ...window.CampusMadeStore.getApprovedDirectoryItems()];
    openProfile(directoryBusinesses.find(business => business.id === event.target.dataset.businessId));
  }
});

document.addEventListener("keydown", event => {
  if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k" && !submitDialog.open && !profileDialog.open) {
    event.preventDefault();
    searchInput.focus();
  }
});
document.querySelectorAll("[data-open-submit]").forEach(button => button.addEventListener("click", openSubmission));
document.querySelectorAll("[data-close-submit]").forEach(button => button.addEventListener("click", () => submitDialog.close()));
document.querySelector("[data-close-profile]").addEventListener("click", () => profileDialog.close());
submissionStatus.addEventListener("click", () => { window.location.href = "admin.html"; });
businessForm.addEventListener("input", updatePreview);
businessForm.addEventListener("change", updatePreview);
businessForm.addEventListener("submit", handleSubmit);
submissionStatus.addEventListener("click", () => {
  const pending = getPendingSubmissions();
  if (!pending.length) return;
  const latest = pending[pending.length - 1];
  document.querySelector("#reviewCard").innerHTML = `<div><h3>${escapeHTML(latest.businessName)}</h3><p>${escapeHTML(latest.category)} · ${escapeHTML(latest.type)}</p></div><span class="status-pill pending">Under review</span>`;
  submissionFormView.hidden = true;
  document.querySelector(".submit-heading").hidden = true;
  submissionSuccess.hidden = false;
  submitDialog.showModal();
});

profileContent.addEventListener("click", async event => {
  const copyButton = event.target.closest("[data-copy-contact]");
  if (copyButton) {
    try {
      await navigator.clipboard.writeText(copyButton.dataset.copyContact);
      showToast("Sample contact copied");
    } catch {
      showToast(`Contact: ${copyButton.dataset.copyContact}`);
    }
  }
  const orderButton = event.target.closest("[data-toggle-order]");
  if (orderButton) {
    const guide = document.querySelector("#orderGuide");
    guide.hidden = !guide.hidden;
    orderButton.textContent = guide.hidden ? "View order steps" : "Hide order steps";
  }
});

[profileDialog, submitDialog].forEach(dialog => dialog.addEventListener("click", event => {
  if (event.target === dialog) dialog.close();
}));
