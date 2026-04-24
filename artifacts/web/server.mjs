import express from "express";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const PORT = Number(process.env.PORT);
if (!PORT || Number.isNaN(PORT)) {
  console.error("PORT environment variable is required");
  process.exit(1);
}

const publicDir = path.join(__dirname, "dist", "public");
const indexHtmlPath = path.join(publicDir, "index.html");

const app = express();

app.disable("x-powered-by");

app.get("/healthz", (_req, res) => {
  res.type("text/plain").send("ok");
});

app.use(
  "/assets",
  express.static(path.join(publicDir, "assets"), {
    immutable: true,
    maxAge: "1y",
    etag: false,
    lastModified: false,
    setHeaders(res) {
      res.setHeader("Cache-Control", "public, max-age=31536000, immutable");
    },
  }),
);

app.use(
  express.static(publicDir, {
    index: false,
    etag: true,
    lastModified: true,
    setHeaders(res, filePath) {
      if (filePath.endsWith(".html")) {
        res.setHeader("Cache-Control", "no-cache, must-revalidate");
      } else {
        res.setHeader("Cache-Control", "public, max-age=3600, must-revalidate");
      }
    },
  }),
);

app.use((req, res, next) => {
  if (req.method !== "GET" && req.method !== "HEAD") {
    return next();
  }
  res.setHeader("Cache-Control", "no-cache, must-revalidate");
  res.sendFile(indexHtmlPath);
});

app.listen(PORT, "0.0.0.0", () => {
  console.log(`[web] Static server listening on port ${PORT}`);
});
