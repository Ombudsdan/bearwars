import SELECTORS from "./selectors.js";
import CurrentMonth from "./current-month.js";
import Utils from "./utils.js";

/**
 * Handles updating and displaying scrolling text,
 * backgrounds (image/video), and background music
 * for the current month's Bear Wars intro sequence.
 */
export default class ScrollingText {
  /**
   * Holds all configuration data for the current month (theme, media paths, text, etc.)
   *
   * @type {CurrentMonth}
   */
  config;

  /**
   * @param {Object} runtimeConfig - the object fetched from `/api/config`
   */
  constructor(runtimeConfig = {}) {
    this.config = new CurrentMonth(runtimeConfig);
  }

  /**
   * Initializes all content for the scrolling intro.
   * Applies text, background media, and music.
   * Wraps execution in a try/catch for safety.
   */
  init() {
    try {
      this.applyTextColour();
      this.applyContent();
      this.applyMainLogo();

      if (this.config.backgroundType === "video") this.applyBackgroundVideo();
      else if (this.config.backgroundType === "image")
        this.applyBackgroundImage();

      this.applyBackgroundMusic();
    } catch (error) {
      console.error("Error initializing Bear Wars Intro:", error);
    }
  }

  /**
   * Applies a text colour variant class to the main content container.
   * When config.textColour is unset, uses default CSS --font-colour.
   */
  applyTextColour() {
    const target = document.querySelector(SELECTORS.content);
    if (!target) return;

    // Remove any previous text colour variant classes
    for (const cls of Array.from(target.classList)) {
      if (cls.startsWith("text-colour--")) target.classList.remove(cls);
    }

    const variant = (this.config.textColour || "").trim().toLowerCase();
    if (!variant) return;

    // Basic sanitisation to avoid adding unexpected classes
    if (!/^[a-z0-9_-]+$/.test(variant)) return;

    target.classList.add(`text-colour--${variant}`);
  }

  /** Applies the main logo to the DOM element. */
  applyMainLogo() {
    this.setMainLogoSource();
    this.showMainLogo();
  }

  /**
   * Applies textual content (theme, emojis)
   * to the corresponding DOM elements.
   */
  applyContent() {
    Utils.setElemTextContent(SELECTORS.theme_text, this.config.theme);
    Utils.setElemTextContent(SELECTORS.emoji_text, this.config.emojis);
  }

  /**
   * Applies the background image by setting its source
   * and making the image element visible.
   */
  applyBackgroundImage() {
    this.setBackgroundImageSource();
    this.showBackgroundImage(true);
  }

  /**
   * Applies the background video by updating the video source,
   * triggering the config loader, and showing the video element.
   */
  applyBackgroundVideo() {
    this.setBackgroundVideoSource();
    this.config.loadBackgroundVideo();
    this.showBackgroundVideo(true);
  }

  setMainLogoSource() {
    const logoElem = document.querySelector(SELECTORS.main_logo_image);
    if (logoElem) logoElem.src = this.config.mainLogoPath;
    else
      console.warn(
        "Main logo image element not found:",
        SELECTORS.main_logo_image,
      );
  }

  showMainLogo() {
    Utils.setElemDisplayValue(SELECTORS.main_logo_image, "block");
  }

  /**
   * Sets the background image source URL on the related DOM element.
   * Logs a warning if the background image element cannot be found.
   */
  setBackgroundImageSource() {
    const imgElem = document.querySelector(SELECTORS.background_image);
    if (imgElem)
      imgElem.style.backgroundImage = this.config.backgroundImageSource;
    else
      console.warn(
        "Background image element not found:",
        SELECTORS.background_image,
      );
  }

  /**
   * Shows or hides the background image element.
   * Automatically hides the video element if showing the image.
   *
   * @param {boolean} shouldShow - Whether the background image should be displayed.
   */
  showBackgroundImage(shouldShow) {
    Utils.setElemDisplayValue(
      SELECTORS.background_image,
      shouldShow ? "block" : "none",
    );
    if (shouldShow) this.showBackgroundVideo(false);
  }

  /**
   * Sets the background video file path to the <source> element.
   * Logs a warning if missing configuration or if no DOM element found.
   */
  setBackgroundVideoSource() {
    if (!this.config.backgroundPath) {
      console.warn(
        "Background path is not defined for current month:",
        this.config,
      );
      return;
    }
    const selector = SELECTORS.source(SELECTORS.background_video);
    const elem = document.querySelector(selector);
    if (elem) elem.src = this.config.backgroundPath;
    else console.warn("Background video source element not found:", selector);
  }

  /**
   * Shows or hides the background video element.
   * Automatically hides the image element if showing the video.
   *
   * @param {boolean} shouldShow - Whether the background video should be displayed.
   */
  showBackgroundVideo(shouldShow) {
    Utils.setElemDisplayValue(
      SELECTORS.background_video,
      shouldShow ? "block" : "none",
    );
    if (shouldShow) this.showBackgroundImage(false);
  }

  /**
   * Applies the background music by setting the audio source
   * and triggering the config loader.
   */
  applyBackgroundMusic() {
    this.setBackgroundMusicSource();
    this.config.loadBackgroundMusic();
  }

  /**
   * Sets the background music filepath on the <source> element.
   * Logs a warning if missing configuration or DOM element.
   */
  setBackgroundMusicSource() {
    if (!this.config.musicPath) {
      console.warn("Music path is not defined for current month:", this.config);
      return;
    }
    const selector = SELECTORS.source(SELECTORS.background_music);
    const elem = document.querySelector(selector);
    if (elem) elem.src = this.config.musicPath;
    else console.warn("Background music source element not found:", selector);
  }
}
