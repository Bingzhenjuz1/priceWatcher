const baseUrl = process.env.PRICEWATCHER_BASE_URL ?? "http://127.0.0.1:3000";

const response = await fetch(`${baseUrl}/api/watches/refresh-due`, {
  method: "POST"
});

const body = await response.text();
if (!response.ok) {
  console.error(body);
  process.exit(1);
}

console.log(body);
