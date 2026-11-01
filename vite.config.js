import babel from "@rolldown/plugin-babel";
import tailwindcss from "@tailwindcss/vite";
import react, { reactCompilerPreset } from "@vitejs/plugin-react";
import autoprefixer from "autoprefixer";
import { defineConfig, loadEnv } from "vite";

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "VITE_");
  const authProxy = {
    "/api": {
      target: env.VITE_BACKEND_URL || "http://localhost:8080",
      changeOrigin: true,
      rewrite: (path) => path.replace(/^\/api(?=\/)/, ""),
    },
    "/auth": {
      target: env.VITE_BACKEND_URL || "http://localhost:8080",
      changeOrigin: true,
      // Local HTTP development cannot rely on Secure-cookie exceptions.
      // This rewrite applies only to the local proxy, never production cookies.
      cookieDomainRewrite: "",
      configure(proxy) {
        proxy.on("proxyRes", (response, request) => {
          if (request.socket.encrypted || !response.headers["set-cookie"]) return;
          response.headers["set-cookie"] = response.headers["set-cookie"].map((cookie) =>
            cookie.replace(/;\s*Secure\b/gi, "").replace(/;\s*SameSite=None\b/gi, "; SameSite=Lax"));
        });
      },
    },
  };
  return {
    server: { proxy: authProxy },
    preview: { proxy: authProxy },
    plugins: [
      react(),
      tailwindcss(),
      babel({ presets: [reactCompilerPreset()] }),
    ],
    css: {
      postcss: {
        plugins: [autoprefixer()],
      },
    },
  };
});
