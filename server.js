const express = require("express");
const path = require("path");
const fs = require("fs");
const multer = require("multer");
const cors = require("cors");

const app = express();
const PORT = process.env.PORT || 8000;

app.use(cors());
app.use(express.json());

// Optional: relax Content-Security-Policy during local development when
// `DEV_CSP=1` is set in the environment. This helps avoid CSP console noise
// from DevTools or local tooling while debugging. This must NOT be enabled
// in production.
if (process.env.DEV_CSP === "1") {
  app.use((req, res, next) => {
    // Very permissive for local dev only
    res.setHeader(
      "Content-Security-Policy",
      "default-src * 'unsafe-inline' 'unsafe-eval' data: blob:; connect-sc *; img-src * data:blob:; media-src *;"
    );
    next();
  });
}

const DATA_DIR = path.join(__dirname, "data");
const BACKGROUNDS_DIR = path.join(__dirname, "backgrounds");
const MUSIC_DIR = path.join(__dirname, "music");
const LOGOS_DIR = path.join(__dirname, "logos");

// ensure directories exist
[DATA_DIR, BACKGROUNDS_DIR, MUSIC_DIR, LOGOS_DIR].forEach((d) => {
  if (!fs.existsSync(d)) fs.mkdirSync(d, { recursive: true });
});

// Serve static files (site)
app.use(express.static(__dirname));

// Serve main.html at root for convenience
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "main.html"));
});

// API: get config
app.get("/api/config", (_, res) => {
  const monthConfigFile = path.join(DATA_DIR, "month-config.json");
  if (!fs.existsSync(monthConfigFile))
    return res.status(404).json({ error: "config not found" });
  try {
    const rawMonthConfig = fs.readFileSync(monthConfigFile, "utf8");
    const parsedMonthConfig = JSON.parse(rawMonthConfig || "{}");
    res.json(parsedMonthConfig);
  } catch (e) {
    console.error("Failed to read/parse month-config", e);
    res.status(500).json({ error: "invalid config file" });
  }
});

// API: save config (overwrite)
app.post("/api/config", (req, res) => {
  const monthConfigFile = path.join(DATA_DIR, "month-config.json");
  try {
    const body = req.body;

    // If saving monthConfig entries, attempt to auto-detect backgroundType
    // from existing files in the `backgrounds/` folder when backgroundType
    // is not already provided. This lets users upload media first and then
    // save the config without a separate media-step.
    try {
      const imageExts = [".jpg", ".jpeg", ".png", ".gif", ".webp"];
      const videoExts = [".mp4"];
      const allExts = [...imageExts, ...videoExts];

      if (body && body.monthConfig && typeof body.monthConfig === "object") {
        for (const key of Object.keys(body)) {
          const entry = body[key] || {};

          if (!entry.backgroundType) {
            // search for a matching file on disk
            let foundExt = null;
            for (const ext of allExts) {
              const candidate = path.join(BACKGROUNDS_DIR, `${key}${ext}`);
              if (fs.existsSync(candidate)) {
                foundExt = ext;
                break;
              }
            }
            if (foundExt) {
              entry.backgroundType = videoExts.includes(foundExt)
                ? "video"
                : "image";
              body[key] = entry;
              console.log(
                `/api/config: detected background for ${key}${foundExt} -> backgroundType=${entry.backgroundType}`
              );
            }
          }
        }
      }
    } catch (e) {
      console.error(
        "Failed to auto-detect backgroundType during config save:",
        e
      );
    }

    fs.writeFileSync(monthConfigFile, JSON.stringify(body, null, 2), "utf8");
    res.json({ ok: true });
  } catch (e) {
    console.error("Failed to write config:", e);
    res.status(500).json({ error: String(e) });
  }
});

// Upload handling - multer
const upload = multer({ dest: path.join(__dirname, "tmp_uploads") });

// Helper: next month YYYY-MM
function nextMonthIdentifier() {
  const d = new Date();
  d.setMonth(d.getMonth() + 1);
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  return `${yyyy}-${mm}`;
}

// POST /api/upload -> fields: file (binary), type=(background|music|logo), variant (for logo), configKey (optional)
app.post("/api/upload", upload.single("file"), (req, res) => {
  try {
    const type = req.body.type || "background";
    const file = req.file;
    if (!file) return res.status(400).json({ error: "no file" });

    const ext = path.extname(file.originalname) || "";
    const configKey = req.body.configKey; // optional; used to name file and update config
    let destPath;

    if (type === "logo") {
      const variant = (req.body.variant || "default").replace(
        /[^a-z0-9_-]/gi,
        "-"
      );
      const filename = `bearwars-${variant}${ext}`;
      destPath = path.join(LOGOS_DIR, filename);
    } else if (type === "music") {
      // Determine id used for naming (honor provided configKey if present)
      const id = configKey || nextMonthIdentifier();
      if (configKey && !/^\d{4}-\d{2}$/.test(configKey)) {
        console.warn(
          "/api/upload: provided configKey has unexpected format:",
          configKey
        );
      }

      const filename = `${id}${ext || ".mp3"}`;
      destPath = path.join(MUSIC_DIR, filename);
    } else {
      // background
      const id = configKey || nextMonthIdentifier();
      if (configKey && !/^\d{4}-\d{2}$/.test(configKey)) {
        console.warn(
          "/api/upload: provided configKey has unexpected format:",
          configKey
        );
      }
      const filename = `${id}${ext || ".jpg"}`;
      destPath = path.join(BACKGROUNDS_DIR, filename);
    }

    // Move/replace
    fs.renameSync(file.path, destPath);

    // If provided and background upload, update monthConfig[configKey].backgroundType
    // BUT: do not create a new config entry during upload. Only update an existing
    // monthConfig entry. New configs should be created when the user explicitly
    // saves the config form.
    if (configKey && type === "background") {
      try {
        const monthConfigFile = path.join(DATA_DIR, "month-config.json");
        const rawMonthConfig = fs.readFileSync(monthConfigFile, "utf8");
        const parsedMonthConfig = JSON.parse(rawMonthConfig || "{}");

        // Only update if this key already exists.
        if (
          Object.prototype.hasOwnProperty.call(parsedMonthConfig, configKey)
        ) {
          const videoExts = [".mp4", ".webm", ".ogg"];
          const isVideo = videoExts.includes(ext.toLowerCase());
          parsedMonthConfig[configKey].backgroundType = isVideo
            ? "video"
            : "image";
          fs.writeFileSync(
            monthConfigFile,
            JSON.stringify(parsedMonthConfig, null, 2),
            "utf8"
          );
          console.log(
            `/api/upload: updated backgroundType for config ${configKey}`
          );
        } else {
          console.log(
            `/api/upload: configKey ${configKey} not present in month-config; skipping config update`
          );
        }
      } catch (e) {
        console.error("Failed to update config backgroundType:", e);
      }
    }

    // Return path relative to site root
    const rel = `/${path.relative(__dirname, destPath).replace(/\\/g, "/")}`;
    res.json({ ok: true, path: rel });
  } catch (e) {
    console.error("Upload error:", e);
    res.status(500).json({ error: String(e) });
  }
});

app.listen(PORT, () => {
  console.log(`Dev server running at http://localhost:${PORT}`);
});
