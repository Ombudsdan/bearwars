import CurrentMonth from "./current-month.js";
import Utils from "./utils.js";
import SELECTORS from "./selectors.js";

/**
 * Controls the intro form workflow:
 * - Reads monthly configuration (theme, media, hashtags)
 * - Validates form content
 * - Hides the editor form and shows the themed content
 * - Builds paragraph groups from user-entered monthly text
 * - Triggers background music and page animations
 */
export default class IntroForm {
  /**
   * Instance of CurrentMonth containing config for the active month.
   * @type {CurrentMonth}
   */
  config;

  /**
   * @param {Object} runtimeConfig - the object fetched from `/api/config`
   */
  constructor(runtimeConfig = {}) {
    this.config = new CurrentMonth(runtimeConfig);
  }

  /** Initialise the intro sequence */
  init() {
    this.validateFields();
    this.hideForm();
    this.showContent();
    this.setMainSection();
    this.setHashtags();

    // Fallback to ensure video plays if autoplay doesn't trigger
    if (this.config.backgroundType === "video")
      this.config.loadBackgroundVideo();

    this.triggerBackgroundMusic();
    this.triggerAnimationStart();
  }

  /** Text entered into the "monthly_text" field. */
  get monthlyText() {
    return Utils.getElemValue(SELECTORS.monthly_text);
  }

  /** Groups of paragraphs, split on blank lines. */
  get paragraphGroups() {
    return this.monthlyText.split(/\n\s*\n/);
  }

  /** Validate that required fields are filled in. */
  validateFields() {
    if (!this.monthlyText) {
      alert("Please fill in all required fields");
      return;
    }
  }

  /** Hide the form element. */
  hideForm() {
    Utils.setElemDisplayValue(SELECTORS.form, "none");
  }

  /** Show all content elements. */
  showContent() {
    Utils.setAllElemDisplayValues(SELECTORS.content, "block");
  }

  /** Build and insert the themed monthly message into the DOM. */
  setMainSection() {
    const container = document.querySelector(SELECTORS.month_message);
    const divs = this.generateMainSection();
    // Clear any previous content before inserting
    container.innerHTML = "";
    if (divs && divs.length > 0) {
      divs.forEach((div) => container.appendChild(div));
    } else {
      console.warn("No valid paragraph divs generated for month message.");
    }
  }

  /**
   * Convert paragraph groups into actual <div><p>…</p></div> DOM nodes.
   *
   * @returns {HTMLDivElement[]} List of generated <div> elements.
   */
  generateMainSection() {
    return this.paragraphGroups
      .reduce((acc, group) => {
        const groupDiv = document.createElement("div");

        const lines = this.getIndividualLinesFromGroup(group);

        lines.forEach((line) => {
          const p = document.createElement("p");
          p.textContent = line.trim();
          groupDiv.appendChild(p);
        });
        acc.push(groupDiv);
        return acc;
      }, [])
      .filter((d) => d instanceof Node);
  }

  /**
   * Split a paragraph group into individual non-empty lines.
   *
   * @param {string} group - The paragraph text block.
   * @returns {string[]} Individual trimmed lines.
   */
  getIndividualLinesFromGroup(group) {
    return group.split("\n").filter((line) => line.trim());
  }

  /**
   * Updates the hashtag container in the DOM with the currently generated hashtags.
   * If no hashtags are generated, clears the container and logs a warning.
   *
   * @returns {void}
   */
  setHashtags() {
    const container = document.querySelector(SELECTORS.hashtag_container);
    const hashtags = this.generateHashtags();
    // Always clear the container first to avoid duplicates or stale content
    if (container) container.innerHTML = "";
    if (hashtags && hashtags.length > 0) {
      hashtags.forEach((hashtag) => container.appendChild(hashtag));
    } else {
      console.warn("No valid hashtags generated for hashtag container.");
    }
  }

  /**
   * Generates an array of <p> elements containing hashtags.
   *
   * Each hashtag from `this.config.hashtags` is prefixed with `#` and wrapped
   * in a paragraph element. Filters out any non-DOM nodes before returning.
   *
   * @returns {HTMLParagraphElement[]} Array of <p> elements representing hashtags.
   */
  generateHashtags() {
    return this.config.hashtags
      .reduce((acc, hashtag) => {
        const elem = document.createElement("p");
        elem.textContent = `#${hashtag}`;
        acc.push(elem);
        return acc;
      }, [])
      .filter((s) => s instanceof Node);
  }

  /**
   * Play background music after a delay.
   *
   * @param {number} [afterDelay=5000] - Milliseconds to wait before playback.
   * @returns {void}
   */
  triggerBackgroundMusic(afterDelay = 5000) {
    setTimeout(() => {
      document
        .querySelector(SELECTORS.background_music)
        .play()
        .catch((e) => console.error("Audio play failed:", e));
    }, afterDelay);
  }

  /**
   * Start page animations by adding a CSS class after a delay.
   *
   * @param {number} [afterDelay=100] - Milliseconds before animations begin.
   * @returns {void}
   */
  triggerAnimationStart(afterDelay = 100) {
    setTimeout(
      () => document.body.classList.add("animation-started"),
      afterDelay,
    );
  }
}
