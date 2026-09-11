(function () {
  const STORAGE_KEY = "campusmadeSubmissions";
  const LEGACY_KEY = "campusmadePending";

  const starterSubmissions = [
    {
      id: "demo-knot-note",
      businessName: "Knot & Note",
      category: "Fashion & Accessories",
      type: "Product",
      description: "Handmade crochet bookmarks and small desk companions created in limited batches.",
      price: "From ₱75",
      orderMethod: "Pre-order",
      contact: "@knotandnote.demo",
      fulfillment: "Campus meetup",
      impact: "Uses made-to-order production and recyclable paper packaging.",
      status: "Pending",
      submittedAt: "2026-09-10T08:30:00.000Z",
      isDemo: true
    },
    {
      id: "demo-slidecraft",
      businessName: "SlideCraft Student",
      category: "Creative Services",
      type: "Service",
      description: "Presentation cleanup and visual storytelling support for class reports and pitches.",
      price: "From ₱180",
      orderMethod: "Booking request",
      contact: "slidecraft.demo@example.com",
      fulfillment: "Online file delivery",
      impact: "Provides reusable slide systems that students can update for future reports.",
      status: "Pending",
      submittedAt: "2026-09-09T13:15:00.000Z",
      isDemo: true
    }
  ];

  function readStored() {
    const current = localStorage.getItem(STORAGE_KEY);
    if (current !== null) {
      try { return JSON.parse(current); } catch { return []; }
    }

    let legacy = [];
    try { legacy = JSON.parse(localStorage.getItem(LEGACY_KEY) || "[]"); } catch { legacy = []; }
    const migrated = legacy.map((item, index) => ({
      ...item,
      id: item.id || `legacy-${Date.now()}-${index}`,
      status: item.status === "Under review" ? "Pending" : (item.status || "Pending")
    }));
    const initialized = [...starterSubmissions, ...migrated];
    localStorage.setItem(STORAGE_KEY, JSON.stringify(initialized));
    return initialized;
  }

  function saveAll(items) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    return items;
  }

  function getAll() { return readStored(); }

  function create(data) {
    const item = {
      ...data,
      id: `submission-${Date.now()}-${Math.random().toString(16).slice(2)}`,
      status: "Pending",
      submittedAt: new Date().toISOString(),
      isDemo: false
    };
    saveAll([item, ...getAll()]);
    return item;
  }

  function update(id, changes) {
    let updated;
    const items = getAll().map(item => {
      if (item.id !== id) return item;
      updated = { ...item, ...changes, updatedAt: new Date().toISOString() };
      return updated;
    });
    saveAll(items);
    return updated;
  }

  function remove(id) {
    const items = getAll().filter(item => item.id !== id);
    saveAll(items);
    return items;
  }

  function toDirectoryBusiness(item) {
    const symbolMap = {
      "Food & Drinks": "☕",
      "Fashion & Accessories": "✿",
      "Creative Services": "◈",
      "Academic & Digital": "▤",
      "Eco & Home": "❋",
      "Personal Care": "◇"
    };
    const colorMap = {
      "Food & Drinks": "#dce9dc",
      "Fashion & Accessories": "#f5e1eb",
      "Creative Services": "#dfe5fa",
      "Academic & Digital": "#fae8c7",
      "Eco & Home": "#d8eed6",
      "Personal Care": "#eee1d8"
    };
    return {
      id: item.id,
      name: item.businessName,
      category: item.category,
      type: item.type,
      symbol: symbolMap[item.category] || "✦",
      color: colorMap[item.category] || "#dff4e7",
      price: item.price,
      description: item.description,
      owner: "Approved student profile",
      tags: [item.type, item.orderMethod, "Student-owned"],
      fulfillment: item.fulfillment || "Contact seller for fulfillment",
      orderMethod: item.orderMethod,
      contact: item.contact,
      impact: item.impact || "This profile has not added a sustainability note yet.",
      steps: [
        `Contact the seller through ${item.contact}`,
        `Confirm the request using ${item.orderMethod.toLowerCase()}`,
        "Finalize payment and fulfillment directly with the seller"
      ]
    };
  }

  function getApprovedDirectoryItems() {
    return getAll().filter(item => item.status === "Approved").map(toDirectoryBusiness);
  }

  window.CampusMadeStore = { getAll, create, update, remove, getApprovedDirectoryItems };
})();
