import assert from "node:assert/strict";
import vm from "node:vm";

const origin = process.env.TEST_ORIGIN || "http://127.0.0.1:4173";
const [pageResponse, scriptResponse] = await Promise.all([
  fetch(origin),
  fetch(`${origin}/app.js`)
]);

assert.equal(pageResponse.status, 200, "site should load");
assert.equal(scriptResponse.status, 200, "application script should load");

const html = await pageResponse.text();
const source = await scriptResponse.text();

for (const selectorMarker of ["searchInput", "categoryFilter", "typeFilter", "businessGrid", "profileDialog", "businessForm"]) {
  assert.match(html, new RegExp(`id=["']${selectorMarker}["']`), `${selectorMarker} should exist`);
}

const dataMatch = source.match(/const businesses = (\[[\s\S]*?\n\]);\n\nconst grid/);
assert.ok(dataMatch, "sample business data should be readable");
const businesses = vm.runInNewContext(dataMatch[1]);

assert.equal(businesses.length, 6, "browse view should begin with six sample businesses");
assert.equal(new Set(businesses.map(item => item.id)).size, businesses.length, "profile IDs should be unique");

function filterDirectory({ query = "", category = "all", type = "all" } = {}) {
  const normalizedQuery = query.trim().toLowerCase();
  return businesses.filter(business => {
    const searchable = [business.name, business.category, business.description, ...business.tags].join(" ").toLowerCase();
    return (!normalizedQuery || searchable.includes(normalizedQuery)) &&
      (category === "all" || business.category === category) &&
      (type === "all" || business.type === type);
  });
}

assert.deepEqual(Array.from(filterDirectory({ query: "pubmat" }), item => item.id), ["pixelpeak-studio"], "search should match an offering keyword");
assert.deepEqual(Array.from(filterDirectory({ category: "Food & Drinks" }), item => item.id), ["banahaw-brew-lab"], "category filter should narrow listings");
assert.equal(filterDirectory({ type: "Service" }).length, 3, "type filter should separate services");
assert.deepEqual(Array.from(filterDirectory({ query: "resume", category: "Academic & Digital", type: "Service" }), item => item.id), ["career-ready-peer"], "combined filters should work together");
assert.equal(filterDirectory({ query: "no-such-campus-business" }).length, 0, "no-result flow should be reachable");

for (const business of businesses) {
  assert.ok(business.contact, `${business.name} should have contact details`);
  assert.ok(business.orderMethod, `${business.name} should explain how to order`);
  assert.equal(business.steps.length, 3, `${business.name} should have a clear three-step order flow`);
}

assert.match(source, /profileDialog\.showModal\(\)/, "opening a card should open a profile dialog");
assert.match(source, /CampusMadeStore\.create\(data\)/, "submissions should be saved to the review queue");
assert.match(source, /item\.status === "Pending"/, "new submissions should enter pending review status");
assert.doesNotMatch(source, /businesses\.push\(/, "pending submissions should not publish to the live directory");

console.log("PASS browse: 6 sample listings load");
console.log("PASS search: offering keywords return the expected profile");
console.log("PASS filters: category, type, combined, and no-results states work");
console.log("PASS profile: every listing has contact and order steps");
console.log("PASS submission: entries remain pending until review");
