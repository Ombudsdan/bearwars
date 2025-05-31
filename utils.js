/**
 * Utility class for DOM element operations, including value retrieval,
 * display manipulation, and text content updates.
 */
export default class Utils {
  /**
   * Get the `value` of an input/textarea element by selector.
   *
   * @param {string} selector - CSS selector of the element.
   * @returns {string} The element's value, or empty string if element not found.
   */
  static getElemValue(selector) {
    const elem = document.querySelector(selector);
    if (!elem) {
      console.warn("Element not found for selector:", selector);
      return "";
    }
    return elem.value;
  }

  /**
   * Set the `display` style for all elements matching a selector.
   *
   * @param {string} selector - CSS selector for the target elements.
   * @param {string} displayValue - The display value to apply (e.g., "block", "none").
   */
  static setAllElemDisplayValues(selector, displayValue) {
    const elems = document.querySelectorAll(selector);
    if (!elems || elems.length === 0) {
      console.warn("No elements found for selector:", selector);
      return;
    }
    elems.forEach((element) => (element.style.display = displayValue));
  }

  /**
   * Set the `textContent` of a DOM element.
   *
   * @param {string} selector - CSS selector of the element.
   * @param {string} content - Text content to set.
   */
  static setElemTextContent(selector, content) {
    const elem = document.querySelector(selector);
    if (!elem) {
      console.warn("Element not found for selector:", selector);
      return;
    }
    elem.textContent = content;
  }

  /**
   * Set the `display` style of a single element.
   *
   * @param {string} selector - CSS selector of the element.
   * @param {string} displayValue - The display value to apply (e.g., "block", "none").
   */
  static setElemDisplayValue(selector, displayValue) {
    const elem = document.querySelector(selector);
    if (!elem) {
      console.warn("Element not found for selector:", selector);
      return;
    }
    elem.style.display = displayValue;
  }
}
