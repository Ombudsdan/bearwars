/**
 * A centralised list of DOM selectors used throughout the editor and renderer UI.
 * Keeps selector usage consistent and avoids hard-coding strings in multiple places.
 */
const SELECTORS = {
  background_video: "#video-background",
  background_image: "#image-background",
  background_music: "#background-music",
  content: ".bear-wars-content",
  emoji_text: "#emoji-text",
  form: "#editorForm",
  theme_text: "#theme-text",
  main_logo_image: "#main-logo-image",
  monthly_text: "#monthly-text",
  month_message: ".section--body__content--month-message",
  hashtag_container: ".section--body__content--hashtags",
  submit_button: ".submit-btn",
  source: (selector) => `${selector} source`,
};

export default SELECTORS;
