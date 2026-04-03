'use strict';

(function attachDomHelpers(globalScope) {
  class TidyDomSession {
    constructor() {
      this.originalTextByNode = new WeakMap();
      this.touchedNodes = new Set();
    }

    apply(mode) {
      const textNodes = this.collectEligibleTextNodes();
      const lang = globalScope.TidyTransform.detectDocumentLanguage();
      let transformedCount = 0;

      textNodes.forEach(node => {
        const originalText = this.originalTextByNode.has(node)
          ? this.originalTextByNode.get(node)
          : node.nodeValue;

        if (!this.originalTextByNode.has(node)) {
          this.originalTextByNode.set(node, originalText);
          this.touchedNodes.add(node);
        }

        const transformedText = globalScope.TidyTransform.tidyText(originalText, mode, lang);

        if (node.nodeValue !== transformedText) {
          node.nodeValue = transformedText;
        }

        transformedCount += 1;
      });

      return transformedCount;
    }

    restore() {
      let restoredCount = 0;

      this.touchedNodes.forEach(node => {
        if (!node || !node.parentNode || !this.originalTextByNode.has(node)) {
          return;
        }

        node.nodeValue = this.originalTextByNode.get(node);
        restoredCount += 1;
      });

      return restoredCount;
    }

    collectEligibleTextNodes() {
      const walker = document.createTreeWalker(
        document.body,
        NodeFilter.SHOW_TEXT,
        {
          acceptNode: node => this.isEligibleTextNode(node)
            ? NodeFilter.FILTER_ACCEPT
            : NodeFilter.FILTER_REJECT
        }
      );

      const nodes = [];
      let currentNode = walker.nextNode();

      while (currentNode) {
        nodes.push(currentNode);
        currentNode = walker.nextNode();
      }

      return nodes;
    }

    isEligibleTextNode(node) {
      if (!node || !node.nodeValue || !node.nodeValue.trim()) {
        return false;
      }

      const parentElement = node.parentElement;

      if (!parentElement) {
        return false;
      }

      if (this.shouldIgnoreElement(parentElement)) {
        return false;
      }

      return true;
    }

    shouldIgnoreElement(element) {
      if (!element) {
        return true;
      }

      const ignoredTags = new Set([
        'SCRIPT',
        'STYLE',
        'NOSCRIPT',
        'TEXTAREA',
        'INPUT',
        'SELECT',
        'OPTION',
        'CODE',
        'PRE'
      ]);

      if (ignoredTags.has(element.tagName)) {
        return true;
      }

      if (element.closest('script, style, noscript, textarea, input, select, option, code, pre')) {
        return true;
      }

      if (element.isContentEditable || element.closest('[contenteditable=""], [contenteditable="true"]')) {
        return true;
      }

      return false;
    }
  }

  globalScope.TidyDomSession = TidyDomSession;
})(window);
