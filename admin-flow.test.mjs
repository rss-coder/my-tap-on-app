import assert from "node:assert/strict";
import vm from "node:vm";

const origin = process.env.TEST_ORIGIN || "http://127.0.0.1:4173";
const [adminResponse, storeResponse] = await Promise.all([
  fetch(`${origin}/admin.html`),
  fetch(`${origin}/store.js`)
]);

assert.equal(adminResponse.status, 200, "admin page should load");
assert.equal(storeResponse.status, 200, "shared review store should load");

const adminHTML = await adminResponse.text();
const storeSource = await storeResponse.text();

for (const marker of ["reviewQueue", "reviewTabs", "reviewDialog", "reviewForm", "approveSubmission", "rejectSubmission", "deleteSubmission"]) {
  assert.match(adminHTML, new RegExp(`id=["']${marker}["']`), `${marker} should exist`);
}
assert.match(adminHTML, /https:\/\/github\.com\/rss-coder\/studentsbiz/, "admin should link to the requested repository");

const memory = new Map();
const localStorage = {
  getItem: key => memory.has(key) ? memory.get(key) : null,
  setItem: (key, value) => memory.set(key, String(value)),
  removeItem: key => memory.delete(key)
};
const context = { window: {}, localStorage, Date, Math, JSON };
vm.runInNewContext(storeSource, context);
const store = context.window.CampusMadeStore;

assert.equal(store.getAll().length, 2, "admin should begin with two sample submissions");
assert.equal(store.getAll().filter(item => item.status === "Pending").length, 2, "sample submissions should be pending");

const created = store.create({
  businessName: "Flow Test Studio",
  category: "Creative Services",
  type: "Service",
  description: "A test submission for the admin workflow.",
  price: "From ₱100",
  orderMethod: "Booking request",
  contact: "flow@example.com",
  fulfillment: "Online",
  impact: "Digital delivery"
});
assert.equal(store.getAll().length, 3, "new directory submissions should enter the admin queue");
assert.equal(created.status, "Pending", "new submissions should require review");

store.update(created.id, { businessName: "Flow Test Creative", status: "Approved" });
const published = store.getApprovedDirectoryItems();
assert.equal(published.length, 1, "approving should publish one directory profile");
assert.equal(published[0].name, "Flow Test Creative", "admin edits should appear in the published profile");
assert.equal(published[0].contact, "flow@example.com", "published profiles should preserve contact details");

store.update("demo-knot-note", { status: "Rejected" });
assert.equal(store.getAll().find(item => item.id === "demo-knot-note").status, "Rejected", "admin should be able to reject a submission");

store.remove("demo-slidecraft");
assert.equal(store.getAll().some(item => item.id === "demo-slidecraft"), false, "admin should be able to delete a listing");

console.log("PASS admin: private dashboard and review controls load");
console.log("PASS admin: submissions can be edited, approved, rejected, and deleted");
console.log("PASS publish: approved profiles are converted into directory listings");
console.log("PASS repository: requested GitHub link appears in the admin interface");
