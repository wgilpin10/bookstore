const BASE = process.env.API_BASE || "http://127.0.0.1:3001/api";

async function request(method, path, body) {
  const options = { method, headers: {} };
  if (body) {
    options.headers["Content-Type"] = "application/json";
    options.body = JSON.stringify(body);
  }

  const res = await fetch(`${BASE}${path}`, options);
  const data = await res.json();
  return { status: res.status, data };
}

function logResult(name, result) {
  const ok = result.data.success !== false;
  const icon = ok ? "PASS" : "FAIL";
  console.log(`\n[${icon}] ${name}`);
  console.log(`  Status: ${result.status}`);
  console.log(`  Response: ${JSON.stringify(result.data, null, 2).split("\n").join("\n  ")}`);
}

async function runTests() {
  console.log(`Testing API at ${BASE}`);
  console.log("=".repeat(50));

  // 1. Health check
  logResult("GET /health", await request("GET", "/health"));

  // 2. List all books
  const list = await request("GET", "/books");
  logResult("GET /books", list);

  const existingId = list.data?.data?.[0]?.id;
  if (!existingId) {
    console.log("\nNo books in database to test GET by id.");
    return;
  }

  // 3. Get book by id
  logResult(`GET /books/${existingId}`, await request("GET", `/books/${existingId}`));

  // 4. Not found
  logResult("GET /books/99999 (not found)", await request("GET", "/books/99999"));

  // 5. Create book
  const create = await request("POST", "/books", {
    title: "Secrets of Destiny",
    author: "Sarah Anderson",
    price: 32.21,
    quantity: 100,
  });
  logResult("POST /books", create);

  const newId = create.data?.data?.id;
  if (!newId) {
    console.log("\nCreate failed — skipping update/delete tests.");
    return;
  }

  // 6. Update book
  logResult(`PUT /books/${newId}`, await request("PUT", `/books/${newId}`, {
    title: "Secrets of Destiny (Updated)",
    author: "Sarah Anderson",
    price: 29.99,
    quantity: 85,
  }));

  // 7. Verify update
  logResult(`GET /books/${newId} (after update)`, await request("GET", `/books/${newId}`));

  // 8. Bad request validation
  logResult("POST /books (missing fields)", await request("POST", "/books", {
    title: "Incomplete Book",
  }));

  // 9. Delete book
  logResult(`DELETE /books/${newId}`, await request("DELETE", `/books/${newId}`));

  // 10. Confirm deleted
  logResult(`GET /books/${newId} (after delete)`, await request("GET", `/books/${newId}`));

  console.log("\n" + "=".repeat(50));
  console.log("All endpoint tests completed.");
}

runTests().catch((err) => {
  console.error("Test run failed:", err.message);
  process.exit(1);
});
