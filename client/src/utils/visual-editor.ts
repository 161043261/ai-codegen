/**
 * Visual Editor Utility Class
 * Manages visual editing functionality within iframe
 */
export interface ElementInfo {
  tagName: string;
  id: string;
  className: string;
  textContent: string;
  selector: string;
  pagePath: string;
  rect: {
    top: number;
    left: number;
    width: number;
    height: number;
  };
}

export interface VisualEditorOptions {
  onElementSelected?: (elementInfo: ElementInfo) => void;
  onElementHover?: (elementInfo: ElementInfo) => void;
}

export class VisualEditor {
  private iframe: HTMLIFrameElement | null = null;
  private isEditMode = false;
  private options: VisualEditorOptions;

  constructor(options: VisualEditorOptions = {}) {
    this.options = options;
  }

  /**
   * Initialize editor
   */
  init(iframe: HTMLIFrameElement) {
    this.iframe = iframe;
  }

  /**
   * Enable edit mode
   */
  enableEditMode() {
    if (!this.iframe) {
      return;
    }
    this.isEditMode = true;
    setTimeout(() => {
      this.injectEditScript();
    }, 300);
  }

  /**
   * Disable edit mode
   */
  disableEditMode() {
    this.isEditMode = false;
    this.sendMessageToIframe({
      type: "TOGGLE_EDIT_MODE",
      editMode: false,
    });
    this.sendMessageToIframe({
      type: "CLEAR_ALL_EFFECTS",
    });
  }

  /**
   * Toggle edit mode
   */
  toggleEditMode() {
    if (this.isEditMode) {
      this.disableEditMode();
    } else {
      this.enableEditMode();
    }
    return this.isEditMode;
  }

  /**
   * Sync state and cleanup
   */
  syncState() {
    if (!this.isEditMode) {
      this.sendMessageToIframe({
        type: "CLEAR_ALL_EFFECTS",
      });
    }
  }

  /**
   * Clear selected element
   */
  clearSelection() {
    this.sendMessageToIframe({
      type: "CLEAR_SELECTION",
    });
  }

  /**
   * Called when iframe loads
   */
  onIframeLoad() {
    if (this.isEditMode) {
      setTimeout(() => {
        this.injectEditScript();
      }, 500);
    } else {
      setTimeout(() => {
        this.syncState();
      }, 500);
    }
  }

  /**
   * Handle messages from iframe
   */
  handleIframeMessage(event: MessageEvent) {
    const { type, data } = event.data;
    switch (type) {
      case "ELEMENT_SELECTED":
        if (this.options.onElementSelected && data.elementInfo) {
          this.options.onElementSelected(data.elementInfo);
        }
        break;
      case "ELEMENT_HOVER":
        if (this.options.onElementHover && data.elementInfo) {
          this.options.onElementHover(data.elementInfo);
        }
        break;
    }
  }

  /**
   * Send message to iframe
   */
  private sendMessageToIframe(message: Record<string, unknown>) {
    if (this.iframe?.contentWindow) {
      this.iframe.contentWindow.postMessage(message, "*");
    }
  }

  /**
   * Inject edit script into iframe
   */
  private injectEditScript() {
    if (!this.iframe) return;

    const waitForIframeLoad = () => {
      try {
        const iframe = this.iframe;
        if (!iframe) return;

        if (iframe.contentWindow && iframe.contentDocument) {
          if (iframe.contentDocument.getElementById("visual-edit-script")) {
            this.sendMessageToIframe({
              type: "TOGGLE_EDIT_MODE",
              editMode: true,
            });
            return;
          }

          const script = this.generateEditScript();
          const scriptElement = iframe.contentDocument.createElement("script");
          scriptElement.id = "visual-edit-script";
          scriptElement.textContent = script;
          iframe.contentDocument.head.appendChild(scriptElement);
        } else {
          setTimeout(waitForIframeLoad, 100);
        }
      } catch {
        // Silent fail for injection errors
      }
    };

    waitForIframeLoad();
  }

  /**
   * Generate edit script content
   */
  private generateEditScript() {
    return `
      (function() {
        let isEditMode = true;
        let currentHoverElement = null;
        let currentSelectedElement = null;

        function injectStyles() {
          if (document.getElementById('edit-mode-styles')) return;
          const style = document.createElement('style');
          style.id = 'edit-mode-styles';
          style.textContent = \`
            .edit-hover {
              outline: 2px dashed #1890ff !important;
              outline-offset: 2px !important;
              cursor: crosshair !important;
              transition: outline 0.2s ease !important;
              position: relative !important;
            }
            .edit-selected {
              outline: 3px solid #52c41a !important;
              outline-offset: 2px !important;
              cursor: default !important;
              position: relative !important;
            }
          \`;
          document.head.appendChild(style);
        }

        function generateSelector(element) {
          const path = [];
          let current = element;
          while (current && current !== document.body) {
            let selector = current.tagName.toLowerCase();
            if (current.id) {
              selector += '#' + current.id;
              path.unshift(selector);
              break;
            }
            if (current.className) {
              const classes = current.className.split(' ').filter(c => c && !c.startsWith('edit-'));
              if (classes.length > 0) {
                selector += '.' + classes.join('.');
              }
            }
            const siblings = Array.from(current.parentElement?.children || []);
            const index = siblings.indexOf(current) + 1;
            selector += ':nth-child(' + index + ')';
            path.unshift(selector);
            current = current.parentElement;
          }
          return path.join(' > ');
        }

        function getElementInfo(element) {
          const rect = element.getBoundingClientRect();
          let pagePath = window.location.search + window.location.hash;
          if (!pagePath) pagePath = '';

          return {
            tagName: element.tagName,
            id: element.id,
            className: element.className,
            textContent: element.textContent?.trim().substring(0, 100) || '',
            selector: generateSelector(element),
            pagePath: pagePath,
            rect: {
              top: rect.top,
              left: rect.left,
              width: rect.width,
              height: rect.height
            }
          };
        }

        function clearHoverEffect() {
          if (currentHoverElement) {
            currentHoverElement.classList.remove('edit-hover');
            currentHoverElement = null;
          }
        }

        function clearSelectedEffect() {
          const selected = document.querySelectorAll('.edit-selected');
          selected.forEach(el => el.classList.remove('edit-selected'));
          currentSelectedElement = null;
        }

        let eventListenersAdded = false;

        function addEventListeners() {
          if (eventListenersAdded) return;

          document.body.addEventListener('mouseover', (event) => {
            if (!isEditMode) return;
            const target = event.target;
            if (target === currentHoverElement || target === currentSelectedElement) return;
            if (target === document.body || target === document.documentElement) return;
            if (target.tagName === 'SCRIPT' || target.tagName === 'STYLE') return;
            clearHoverEffect();
            target.classList.add('edit-hover');
            currentHoverElement = target;
          }, true);

          document.body.addEventListener('mouseout', (event) => {
            if (!isEditMode) return;
            const target = event.target;
            if (!event.relatedTarget || !target.contains(event.relatedTarget)) {
              clearHoverEffect();
            }
          }, true);

          document.body.addEventListener('click', (event) => {
            if (!isEditMode) return;
            event.preventDefault();
            event.stopPropagation();
            const target = event.target;
            if (target === document.body || target === document.documentElement) return;
            if (target.tagName === 'SCRIPT' || target.tagName === 'STYLE') return;
            clearSelectedEffect();
            clearHoverEffect();
            target.classList.add('edit-selected');
            currentSelectedElement = target;
            const elementInfo = getElementInfo(target);
            try {
              window.parent.postMessage({
                type: 'ELEMENT_SELECTED',
                data: { elementInfo }
              }, '*');
            } catch {}
          }, true);

          eventListenersAdded = true;
        }

        function showEditTip() {
          if (document.getElementById('edit-tip')) return;
          const tip = document.createElement('div');
          tip.id = 'edit-tip';
          tip.innerHTML = '🎯 Edit Mode Enabled<br/>Hover to view, click to select';
          tip.style.cssText = 'position: fixed; top: 20px; right: 20px; background: #1890ff; color: white; padding: 12px 16px; border-radius: 6px; font-size: 14px; z-index: 9999; box-shadow: 0 4px 12px rgba(0,0,0,0.15);';
          document.body.appendChild(tip);
          setTimeout(() => tip.remove(), 3000);
        }

        window.addEventListener('message', (event) => {
          const { type, editMode } = event.data;
          switch (type) {
            case 'TOGGLE_EDIT_MODE':
              isEditMode = editMode;
              if (isEditMode) {
                injectStyles();
                addEventListeners();
                showEditTip();
              } else {
                clearHoverEffect();
                clearSelectedEffect();
              }
              break;
            case 'CLEAR_SELECTION':
              clearSelectedEffect();
              break;
            case 'CLEAR_ALL_EFFECTS':
              isEditMode = false;
              clearHoverEffect();
              clearSelectedEffect();
              const tip = document.getElementById('edit-tip');
              if (tip) tip.remove();
              break;
          }
        });

        injectStyles();
        addEventListeners();
        showEditTip();
      })();
    `;
  }
}
