import assert from "node:assert/strict";
import { afterEach, test } from "node:test";
import { apiRequest, setAccessToken, refreshSession, endSession } from "./api.js";
import sendMessage from "./sendMessage.js";

const originalFetch = globalThis.fetch;
const originalWindow = globalThis.window;
afterEach(() => {
  globalThis.fetch = originalFetch;
  globalThis.window = originalWindow;
  setAccessToken(null);
});

test("private requests carry the current user's bearer token", async () => {
  setAccessToken("alice-token");
  globalThis.fetch = async (url, options) => {
    assert.equal(options.headers.Authorization, "Bearer alice-token");
    assert.equal(options.credentials, "omit");
    return Response.json({ id: "alice" });
  };
  assert.equal((await apiRequest("/users/me")).id, "alice");
});

test("login does not send another account's bearer token", async () => {
  setAccessToken("previous-token");
  globalThis.fetch = async (url, options) => {
    assert.equal(options.headers.Authorization, undefined);
    assert.deepEqual(JSON.parse(options.body), { credential: "google-id-token" });
    return Response.json({ accessToken: "app-jwt" });
  };
  assert.equal((await apiRequest("/auth/google", {
    method: "POST", authenticated: false, body: { credential: "google-id-token" },
  })).accessToken, "app-jwt");
});

test("expired tokens clear authentication and notify the UI", async () => {
  setAccessToken("expired");
  let event;
  globalThis.window = { dispatchEvent: (value) => { event = value; } };
  globalThis.fetch = async () => Response.json({ detail: "Expired" }, { status: 401 });
  await assert.rejects(apiRequest("/matches"), { status: 401 });
  assert.equal(event.type, "auth-expired");
  await assert.rejects(apiRequest("/users/me"), { message: "Please sign in first." });
});

test("late responses from the previous account cannot affect the new session", async () => {
  setAccessToken("alice");
  let finish;
  globalThis.fetch = () => new Promise((resolve) => { finish = resolve; });
  const previous = apiRequest("/matches");
  setAccessToken("bob");
  finish(Response.json({ detail: "Expired" }, { status: 401 }));
  await assert.rejects(previous, { message: "Your session changed." });
  globalThis.fetch = async (url, options) => {
    assert.equal(options.headers.Authorization, "Bearer bob");
    return Response.json([]);
  };
  await apiRequest("/matches");
});

test("chat sends text without trusting a client-side author ID", async () => {
  setAccessToken("bob");
  globalThis.fetch = async (url, options) => {
    assert.equal(options.method, "POST");
    assert.deepEqual(JSON.parse(options.body), { messageText: "Hello" });
    return Response.json({ messages: [] });
  };
  await sendMessage("chat", "Hello");
});

test("signing out prevents further private requests", async () => {
  setAccessToken("alice");
  setAccessToken(null);
  globalThis.fetch = () => { throw new Error("Must not call backend"); };
  await assert.rejects(apiRequest("/matches"), { status: 401 });
});


test("reload restores an access token using only the HttpOnly cookie", async () => {
  setAccessToken(null);
  globalThis.fetch = async (url, options) => {
    if (url.endsWith("/auth/refresh")) {
      assert.equal(options.credentials, "include");
      assert.equal(options.headers.Authorization, undefined);
      return Response.json({ accessToken: "restored" });
    }
    assert.equal(options.headers.Authorization, "Bearer restored");
    return Response.json({ id: "alice" });
  };
  await refreshSession();
  assert.equal((await apiRequest("/users/me")).id, "alice");
});

test("concurrent expired requests share one refresh and retry once", async () => {
  setAccessToken("expired");
  let refreshes = 0;
  globalThis.fetch = async (url, options) => {
    if (url.endsWith("/auth/refresh")) {
      refreshes++;
      return Response.json({ accessToken: "renewed" });
    }
    return options.headers.Authorization === "Bearer renewed"
      ? Response.json([]) : new Response(null, { status: 401 });
  };
  await Promise.all([apiRequest("/matches"), apiRequest("/matches")]);
  assert.equal(refreshes, 1);
});

test("logout revokes the cookie session and prevents private requests", async () => {
  setAccessToken("alice");
  globalThis.fetch = async (url, options) => {
    assert.ok(url.endsWith("/auth/logout"));
    assert.equal(options.credentials, "include");
    return new Response(null, { status: 204 });
  };
  await endSession();
  await assert.rejects(apiRequest("/matches"), { status: 401 });
});


test("authentication uses the frontend origin to avoid third-party cookies", async () => {
  globalThis.fetch = async (url, options) => {
    assert.equal(url, "/auth/login");
    assert.equal(options.credentials, "include");
    return Response.json({ accessToken: "signed-in" });
  };
  await apiRequest("/auth/login", {
    method: "POST", authenticated: false, body: { email: "alice@example.com", password: "password" },
  });
});

test("production restores a session through same-origin API even with a localhost build setting", async () => {
  const { readFile } = await import("node:fs/promises");
  const source = await readFile(new URL("./api.js", import.meta.url), "utf8");
  const productionSource = source.replaceAll("import.meta.env", JSON.stringify({
    PROD: true, VITE_BACKEND_URL: "http://localhost:8080",
  }));
  const production = await import(`data:text/javascript;base64,${Buffer.from(productionSource).toString("base64")}`);
  const requests = [];
  globalThis.fetch = async (url, options) => {
    requests.push(url);
    if (url === "/auth/refresh") return Response.json({ accessToken: "restored-token" });
    assert.equal(url, "/api/users/me");
    assert.equal(options.headers.Authorization, "Bearer restored-token");
    return Response.json({ id: "restored-user" });
  };
  await production.refreshSession();
  assert.equal((await production.apiRequest("/users/me")).id, "restored-user");
  assert.deepEqual(requests, ["/auth/refresh", "/api/users/me"]);
  assert.equal(production.imageUrl("photo.png"), "/api/images/photo.png");
  const deployment = JSON.parse(await readFile(new URL("../vercel.json", import.meta.url), "utf8"));
  assert.equal(deployment.rewrites.find(rule => rule.source === "/api/:path*").destination,
    "https://tinderaibackend.onrender.com/:path*");
});
