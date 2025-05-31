import SELECTORS from "./selectors.js";
import COLOUR_VARIANTS from "./constants/colour-variants.constants.js";
import BASE_HASHTAGS from "./constants/base-hashtags.constants.js";

/**
 * Handles logic for the currently active month: theme text, emojis,
 * hashtag, background/media paths and helper methods to load media elements.
 */
export default class CurrentMonth {
  /**
   * The theme text for the active month.
   * @type {string}
   */
  theme;
  /**
   * The emojis for the active month.
   * @type {string}
   */
  emojis;

  /**
   * Optional text colour variant for the active month.
   * Examples: "white", "yellow".
   * When unset/empty, the default CSS --font-colour is used.
   * @type {string}
   */
  textColour;
  /**
   * The type of background for the active month ("video" or "image").
   * @type {"video" | "image"}
   */
  backgroundType;
  /**
   * The path to the background media for the active month.
   * @type {string}
   */
  backgroundPath;
  /**
   * The path to the background music for the active month.
   * @type {string}
   */
  musicPath;
  /**
   * The currently active month in `YYYY-MM` format.
   * @type {string}
   */
  selectedConfig;

  /**
   * The path to the background image for the active month.
   * @type {string}
   */
  imagePath;

  /**
   * An array of hashtags for the active month.
   * @type {string[]}
   */
  hashtags;

  /**
   * The config object for the current month.
   * @type {Object}
   */
  _config;

  /**
   * Create a CurrentMonth instance from a runtime config object.
   * @param {{ selectedConfig: string, monthConfig: Object }} runtimeConfig
   */
  constructor(runtimeConfig = {}) {
    const { selectedConfig, monthConfig } = runtimeConfig;

    const safeMonthConfig =
      monthConfig && typeof monthConfig === "object" ? monthConfig : {};

    // Allow runtimeConfig.selectedConfig to be omitted; fall back to latest config key.
    const latestKey = Object.keys(safeMonthConfig).sort().reverse()[0];
    this.selectedConfig = selectedConfig || latestKey;

    if (!this.selectedConfig) {
      throw new Error(
        "selectedConfig is not defined and month-config has no entries"
      );
    }

    this._config = safeMonthConfig[this.selectedConfig] || {};

    this._setTheme();
    this._setTextColour();
    this._setLogoPath();
    this._setBackgroundType();
    this._setBackgroundPath();
    this._setMusicPath();
    this._setImagePath();
    this._setHashtags();
  }

  /**
   * CSS `url()` value for the background image (useful for inline styles).
   * @returns {string} A `url('...')` string that points to the backgroundPath.
   */
  get backgroundImageSource() {
    return `url('${this.backgroundPath}')`;
  }

  _setTheme() {
    this.theme = this._config.theme ?? "DEFAULT THEME";
  }

  _setEmojis() {
    this.emojis = this._config.emojis ?? "";
  }

  _setTextColour() {
    const rawTextColour = (this._config.textColour ?? "").toString().trim();
    this.textColour = Object.prototype.hasOwnProperty.call(
      COLOUR_VARIANTS,
      rawTextColour
    )
      ? COLOUR_VARIANTS[rawTextColour]
      : COLOUR_VARIANTS.YELLOW;
  }

  _setBackgroundType() {
    this.backgroundType = this._config.backgroundType ?? "image";
  }

  _setMusicPath() {
    this.musicPath = `./music/${this.selectedConfig}.mp3`;
  }

  _setImagePath() {
    this.imagePath = `./backgrounds/${this.selectedConfig}.jpg`;
  }

  _setHashtags() {
    const monthLower = (this._config.month || "").toLowerCase();

    this.hashtags = [
      ...BASE_HASHTAGS,
      `bearwars${monthLower}mission`,
      ...(this._config.extraHashtags || []),
    ];
  }

  _setLogoPath() {
    this.mainLogoPath = `./logos/bearwars-logo-${this.textColour}.png`;
  }

  _setBackgroundPath() {
    const extension = this.backgroundType === "video" ? "mp4" : "jpg";
    this.backgroundPath = `./backgrounds/${this.selectedConfig}.${extension}`;
  }

  /**
   * Load the background video element (if present).
   *
   * This calls `.load()` on the element matched by SELECTORS.background_video.
   * If the element is not found the call is a no-op.
   */
  loadBackgroundVideo() {
    document.querySelector(SELECTORS.background_video).load();
  }

  /**
   * Load the background music element.
   *
   * This calls `.load()` on the element matched by SELECTORS.background_music.
   * If the element is not found the call is a no-op.
   */
  loadBackgroundMusic() {
    document.querySelector(SELECTORS.background_music).load();
  }
}
