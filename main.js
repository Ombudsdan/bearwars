import SELECTORS from "./selectors.js";
import IntroForm from "./intro-form.js";
import ScrollingText from "./scrolling-text.js";
import MONTHS from "./constants/months.constants.js";

async function loadMonthConfig() {
  // Prefer runtime API (server-backed). Fall back to static file for static deploys.
  const url = "/data/month-config.json";
  try {
    const res = await fetch(url, { cache: "no-store" });
    if (!res.ok) return {};
    const json = await res.json();
    return json;
  } catch (e) {
    // Try next candidate
    console.warn("Failed to load config from", url, e);
  }
  console.warn("No month config found; using empty defaults.");
  return {};
}

/**
 * Application entrypoint for page-load behaviour.
 *
 * Responsibilities:
 * - Initialise scrolling text animation on DOM ready
 * - Attach submit button listener that triggers the intro form workflow
 *
 * This module does not export anything; it simply sets up event listeners
 * required for the interactive intro sequence.
 */

/** Initialise scrolling text when the DOM is fully loaded. */
document.addEventListener("DOMContentLoaded", async function () {
  const monthConfig = await loadMonthConfig();

  // Populate config select so user can choose which month config to run
  try {
    const sel = document.getElementById("select-config");
    const alertEl = document.getElementById("config-alert");

    if (sel) {
      sel.innerHTML = "";
      const keys = Object.keys(monthConfig).sort().reverse();

      const placeholder = document.createElement("option");
      placeholder.value = "";
      placeholder.textContent = "Select a config";
      sel.appendChild(placeholder);

      for (const key of keys) {
        const config = monthConfig[key] || {};
        const [year, month] = key.split("-");
        const label = `${MONTHS[parseInt(month, 10) - 1]} ${year}`.trim();
        const opt = document.createElement("option");

        opt.value = key;
        opt.textContent = `${label} - ${config.theme ?? "No Theme"}`;
        sel.appendChild(opt);
      }

      if (keys.length > 0) {
        if (alertEl) alertEl.style.display = "none";
      } else {
        // no configs at all
        if (alertEl) {
          alertEl.style.display = "block";
          alertEl.textContent = `No configs available. Click the ⚙ cog to create one.`;
        }
      }
    }
  } catch (e) {
    console.warn("Failed to populate config select", e);
  }

  // Attach submit handler (use selected config key to set selectedConfig)
  const btn = document.querySelector(SELECTORS.submit_button);
  if (btn) {
    btn.addEventListener("click", function () {
      const sel = document.getElementById("select-config");
      if (!sel || !sel.value) {
        alert("Please select a config");
        return;
      }

      const runtimeConfig = {
        selectedConfig: sel.value,
        monthConfig,
      };

      // Initialise the visual renderer (logo/background/music/theme)
      const scroller = new ScrollingText(runtimeConfig);
      scroller.init();

      const form = new IntroForm(runtimeConfig);
      form.init();
    });
  }
});

/**
 * Attach click handler to the submit button defined in SELECTORS.
 * When clicked, it initialises the intro form process.
 */
// (submit handler moved into DOMContentLoaded after fetching runtime config)
