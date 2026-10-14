import assert from "node:assert/strict";
import { afterEach, test } from "node:test";
import { apiRequest, setAccessToken } from "./api.js";
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
