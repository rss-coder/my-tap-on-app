const store = window.CampusMadeStore;
const queue = document.querySelector("#reviewQueue");
const search = document.querySelector("#adminSearch");
const tabs = document.querySelector("#reviewTabs");
const empty = document.querySelector("#adminEmpty");
const dialog = document.querySelector("#reviewDialog");
const form = document.querySelector("#reviewForm");
const toast = document.querySelector("#adminToast");

let activeStatus = "Pending";
let activeId = null;
let toastTimer;

const escapeHTML = (value = "") => String(value).replace(/[&<>'"]/g, character => ({
  "&": "&amp;", "<": "&lt;", ">": "&gt;", "'": "&#39;", '"': "&quot;"
})[character]);

function formatDate(value) {
  return new Intl.DateTimeFormat("en-PH", { month: "short", day: "numeric", year: "numeric" }).format(new Date(value));
}

function statusClass(status) {
  return status === "Approved" ? "approved" : status.toLowerCase();
}

function updateCounts(items) {
  const counts = {
    Pending: items.filter(item => item.status === "Pending").length,
    Approved: items.filter(item => item.status === "Approved").length,
    Rejected: items.filter(item => item.status === "Rejected").length
  };
  document.querySelector("#pendingStat").textContent = counts.Pending;
  document.querySelector("#approvedStat").textContent = counts.Approved;
  document.querySelector("#rejectedStat").textContent = counts.Rejected;
  document.querySelector("#pendingTabCount").textContent = counts.Pending;
  document.querySelector("#approvedTabCount").textContent = counts.Approved;
  document.querySelector("#rejectedTabCount").textContent = counts.Rejected;
  document.querySelector("#allTabCount").textContent = items.length;
}

function renderQueue() {
  const allItems = store.getAll();
  const query = search.value.trim().toLowerCase();
  const items = allItems
    .filter(item => activeStatus === "All" || item.status === activeStatus)
    .filter(item => [item.businessName, item.category, item.type, item.description].join(" ").toLowerCase().includes(query))
    .sort((a, b) => new Date(b.submittedAt) - new Date(a.submittedAt));

  updateCounts(allItems);
  queue.innerHTML = items.map(item => `
    <article class="review-row">
      <div class="review-business">
        <span class="review-avatar" aria-hidden="true">${escapeHTML(item.businessName.slice(0, 2).toUpperCase())}</span>
        <div><strong>${escapeHTML(item.businessName)}</strong><small>${item.isDemo ? "Sample submission" : "Student submission"}</small></div>
      </div>
      <div><strong>${escapeHTML(item.type)}</strong><small>${escapeHTML(item.category)}</small></div>
      <time datetime="${escapeHTML(item.submittedAt)}">${formatDate(item.submittedAt)}</time>
      <span class="status-pill ${statusClass(item.status)}">${item.status === "Approved" ? "Published" : item.status}</span>
      <button class="button button-ghost button-small" type="button" data-review-id="${escapeHTML(item.id)}">Review</button>
    </article>`).join("");
  queue.hidden = items.length === 0;
  empty.hidden = items.length !== 0;
}

function showToast(message) {
  clearTimeout(toastTimer);
  toast.textContent = message;
  toast.classList.add("show");
  toastTimer = setTimeout(() => toast.classList.remove("show"), 2400);
}

function openReview(id) {
  const item = store.getAll().find(entry => entry.id === id);
  if (!item) return;
  activeId = id;
  for (const [key, value] of Object.entries(item)) {
    if (form.elements[key]) form.elements[key].value = value || "";
  }
  const editorStatus = document.querySelector("#editorStatus");
  editorStatus.className = `status-pill ${statusClass(item.status)}`;
  editorStatus.textContent = item.status === "Approved" ? "Published" : item.status;
  document.querySelector("#reviewBusinessName").textContent = item.businessName;
  document.querySelector("#reviewMetadata").textContent = `${item.category} · Submitted ${formatDate(item.submittedAt)}`;
  document.querySelector("#approveSubmission").textContent = item.status === "Approved" ? "Update published profile" : "Approve & publish";
  document.querySelector("#rejectSubmission").disabled = item.status === "Rejected";
  dialog.showModal();
}

function formValues() {
  return Object.fromEntries(new FormData(form));
}

function saveChanges(event) {
  event.preventDefault();
  if (!form.reportValidity()) return;
  store.update(activeId, formValues());
  dialog.close();
  renderQueue();
  showToast("Profile changes saved");
}

function setDecision(status) {
  if (!form.reportValidity()) return;
  store.update(activeId, { ...formValues(), status, reviewedAt: new Date().toISOString() });
  dialog.close();
  renderQueue();
  showToast(status === "Approved" ? "Profile published to the directory" : "Submission rejected");
}

tabs.addEventListener("click", event => {
  const tab = event.target.closest("[data-status]");
  if (!tab) return;
  activeStatus = tab.dataset.status;
  document.querySelectorAll(".review-tab").forEach(button => button.classList.toggle("active", button === tab));
  renderQueue();
});

search.addEventListener("input", renderQueue);
queue.addEventListener("click", event => {
  const button = event.target.closest("[data-review-id]");
  if (button) openReview(button.dataset.reviewId);
});
document.querySelector("#closeReview").addEventListener("click", () => dialog.close());
form.addEventListener("submit", saveChanges);
document.querySelector("#approveSubmission").addEventListener("click", () => setDecision("Approved"));
document.querySelector("#rejectSubmission").addEventListener("click", () => setDecision("Rejected"));
document.querySelector("#deleteSubmission").addEventListener("click", () => {
  const item = store.getAll().find(entry => entry.id === activeId);
  if (!item || !window.confirm(`Delete ${item.businessName}? This cannot be undone in this demo.`)) return;
  store.remove(activeId);
  dialog.close();
  renderQueue();
  showToast("Listing deleted");
});

renderQueue();
