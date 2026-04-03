'use strict';

(function attachDomHelpers(globalScope) {
  class TidyDomSession {
    constructor() {
      this.originalTextByNode = new WeakMap();
      this.touchedNodes = new Set();
      this.currentMode = 'asc';
      this.isTransformed = false;
      this.observer = null;
      this.isApplyingMutations = false;
      this.pendingNodes = new Set();
      this.flushScheduled = false;
    }

    apply(mode) {
      const textNodes = this.collectEligibleTextNodes();
      const transformedCount = this.transformNodes(textNodes, mode);

      this.currentMode = mode;
      this.isTransformed = transformedCount > 0;
      this.startObserving();

      return transformedCount;
    }

    restore() {
      this.stopObserving();
      let restoredCount = 0;

      this.touchedNodes.forEach(node => {
        if (!node || !node.parentNode || !this.originalTextByNode.has(node)) {
          return;
        }

        node.nodeValue = this.originalTextByNode.get(node);
        restoredCount += 1;
      });

      this.isTransformed = false;

      return restoredCount;
    }

    getState() {
      return {
        currentMode: this.currentMode,
        isTransformed: this.isTransformed
      };
    }

    transformNodes(nodes, mode) {
      const lang = globalScope.TidyTransform.detectDocumentLanguage();
      let transformedCount = 0;

      this.withObserverPaused(() => {
        nodes.forEach(node => {
          if (!this.isEligibleTextNode(node)) {
            return;
          }

          const originalText = node.nodeValue;
          const transformedText = globalScope.TidyTransform.tidyText(originalText, mode, lang);

          this.originalTextByNode.set(node, originalText);
          this.touchedNodes.add(node);

          if (node.nodeValue !== transformedText) {
            node.nodeValue = transformedText;
          }

          transformedCount += 1;
        });
      });

      return transformedCount;
    }

    startObserving() {
      if (this.observer || !document.body) {
        return;
      }

      this.observer = new MutationObserver(mutations => {
        if (!this.isTransformed || this.isApplyingMutations) {
          return;
        }

        mutations.forEach(mutation => {
          if (mutation.type === 'characterData') {
            this.queueNodeForTransform(mutation.target);
            return;
          }

          mutation.addedNodes.forEach(node => {
            this.collectTextNodesFromNode(node).forEach(textNode => {
              this.queueNodeForTransform(textNode);
            });
          });
        });
      });

      this.observer.observe(document.body, {
        childList: true,
        characterData: true,
        subtree: true
      });
    }

    stopObserving() {
      if (this.observer) {
        this.observer.disconnect();
        this.observer = null;
      }

      this.pendingNodes.clear();
      this.flushScheduled = false;
    }

    queueNodeForTransform(node) {
      if (!node || node.nodeType !== Node.TEXT_NODE) {
        return;
      }

      if (!this.isEligibleTextNode(node)) {
        return;
      }

      this.pendingNodes.add(node);

      if (!this.flushScheduled) {
        this.flushScheduled = true;
        window.setTimeout(() => this.flushPendingNodes(), 60);
      }
    }

    flushPendingNodes() {
      this.flushScheduled = false;

      if (!this.isTransformed || this.pendingNodes.size === 0) {
        this.pendingNodes.clear();
        return;
      }

      const nodes = Array.from(this.pendingNodes);
      this.pendingNodes.clear();
      this.transformNodes(nodes, this.currentMode);
    }

    withObserverPaused(callback) {
      this.isApplyingMutations = true;

      try {
        callback();
      } finally {
        this.isApplyingMutations = false;
      }
    }

    collectTextNodesFromNode(node) {
      if (!node) {
        return [];
      }

      if (node.nodeType === Node.TEXT_NODE) {
        return [node];
      }

      if (node.nodeType !== Node.ELEMENT_NODE || this.shouldIgnoreElement(node)) {
        return [];
      }

      const walker = document.createTreeWalker(
        node,
        NodeFilter.SHOW_TEXT,
        {
          acceptNode: candidate => this.isEligibleTextNode(candidate)
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

    collectEligibleTextNodes() {
      if (!document.body) {
        return [];
      }

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
        'BUTTON',
        'CODE',
        'PRE',
        'SVG',
        'MATH'
      ]);

      if (ignoredTags.has(element.tagName)) {
        return true;
      }

      if (element.closest('script, style, noscript, textarea, input, select, option, button, code, pre, svg, math')) {
        return true;
      }

      if (element.isContentEditable || element.closest('[contenteditable=""], [contenteditable="true"]')) {
        return true;
      }

      if (element.closest('[role="textbox"], [role="searchbox"], [role="combobox"], [role="spinbutton"]')) {
        return true;
      }

      if (element.closest('.CodeMirror, .cm-editor, .monaco-editor, .ace_editor, .ql-editor, .ProseMirror')) {
        return true;
      }

      if (element.closest('[data-gramm], [data-lexical-editor], [data-slate-editor], [data-testid="editor"]')) {
        return true;
      }

      return false;
    }
  }

  globalScope.TidyDomSession = TidyDomSession;
})(window);
