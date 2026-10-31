import { useEffect, useRef, useState } from "react";

let sdkPromise;
function loadGoogleSdk() {
  if (window.google?.accounts?.id) return Promise.resolve(window.google);
  if (!sdkPromise) {
    sdkPromise = new Promise((resolve, reject) => {
      let script = document.querySelector('script[src="https://accounts.google.com/gsi/client"]');
      if (!script) {
        script = document.createElement("script");
        script.src = "https://accounts.google.com/gsi/client";
        script.async = true;
        document.head.appendChild(script);
      }
      script.addEventListener("load", () => resolve(window.google), { once: true });
      script.addEventListener("error", () => reject(new Error("Google sign-in could not load. Try again later.")), { once: true });
    });
  }
  return sdkPromise;
}

export default function GoogleSignIn({ onCredential, disabled = false }) {
  const container = useRef(null);
  const callback = useRef(onCredential);
  const disabledRef = useRef(disabled);
  const [error, setError] = useState("");
  const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID || "356044456946-ebi4v73c1dtoug43gddf4s0k7s3bcsn3.apps.googleusercontent.com";
  useEffect(() => { callback.current = onCredential; disabledRef.current = disabled; }, [onCredential, disabled]);
  useEffect(() => {
    if (!clientId) return;
    let active = true;
    const node = container.current;
    let observer;
    let removeThemeListener;
    let themeObserver;
    loadGoogleSdk().then((google) => {
      if (!active) return;
      google.accounts.id.initialize({
        client_id: clientId,
        auto_select: false,
        callback: (response) => {
          if (active && !disabledRef.current && response.credential) callback.current(response.credential);
        },
      });
      const theme = window.matchMedia("(prefers-color-scheme: dark)");
      let lastWidth;
      let lastTheme;
      const render = () => {
        const width = Math.min(400, Math.floor(node.getBoundingClientRect().width));
        if (!active || width < 1 || (width === lastWidth && (document.documentElement.dataset.theme === "dark") === lastTheme)) return;
        lastWidth = width; lastTheme = document.documentElement.dataset.theme === "dark";
        node.replaceChildren();
        google.accounts.id.renderButton(node, {
          theme: lastTheme ? "filled_black" : "outline", size: "large",
          width, shape: "rectangular", text: "continue_with", logo_alignment: "left",
        });
      };
      render();
      themeObserver = new MutationObserver(render);
      themeObserver.observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme"] });
      observer = new ResizeObserver(render);
      observer.observe(node);
      theme.addEventListener("change", render);
      removeThemeListener = () => theme.removeEventListener("change", render);
    }).catch((err) => { if (active) setError(err.message); });
    return () => { active = false; observer?.disconnect(); themeObserver?.disconnect(); removeThemeListener?.(); if (node) node.replaceChildren(); };
  }, [clientId]);

  if (!clientId) return <p className="text-sm text-gray-500">Google sign-in is not configured yet.</p>;
  return <div className="google-signin">
    <div ref={container} aria-disabled={disabled} className={`google-button-host${disabled ? " pointer-events-none opacity-50" : ""}`} />
    {error && <p role="alert" className="text-red-600 text-sm mt-2">{error}</p>}
  </div>;
}
