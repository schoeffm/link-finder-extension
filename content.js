class TypeAheadFind {
  constructor() {
    this.isActive = false;
    this.searchString = '';
    this.matchedLinks = [];
    this.selectedIndex = 0;
    this.searchContainer = null;
    this.originalActiveElement = null;
    this.mnemonicElements = [];
    this.mnemonicMap = new Map();
    this.mnemonicsEnabled = false;
    
    this.init();
  }

  init() {
    document.addEventListener('keydown', this.handleKeyDown.bind(this));
    document.addEventListener('keyup', this.handleKeyUp.bind(this));
    this.loadSettings();
    this.createSearchUI();
  }

  loadSettings() {
    chrome.storage.sync.get(['mnemonicsEnabled'], (result) => {
      this.mnemonicsEnabled = result.mnemonicsEnabled || false;
      this.updateHelpText();
    });
  }

  createSearchUI() {
    this.searchContainer = document.createElement('div');
    this.searchContainer.id = 'typeahead-search-container';
    this.searchContainer.style.display = 'none';
    
    const searchBox = document.createElement('div');
    searchBox.id = 'typeahead-search-box';
    searchBox.innerHTML = '<span id="typeahead-prompt">/</span><span id="typeahead-query"></span><span id="typeahead-counter"></span>';
    
    const helpText = document.createElement('div');
    helpText.id = 'typeahead-help';
    helpText.innerHTML = 'Type to search • ESC to exit';
    
    this.searchContainer.appendChild(searchBox);
    this.searchContainer.appendChild(helpText);
    document.body.appendChild(this.searchContainer);
  }

  updateHelpText() {
    const helpText = document.getElementById('typeahead-help');
    if (helpText) {
      if (this.mnemonicsEnabled) {
        const modifierKey = this.isMac() ? 'CMD' : 'Ctrl';
        helpText.innerHTML = `Type to search • ${modifierKey}+letter for mnemonics • ESC to exit`;
      } else {
        helpText.innerHTML = 'Type to search • ESC to exit';
      }
    }
  }

  isMac() {
    return navigator.platform.toUpperCase().indexOf('MAC') >= 0;
  }

  handleKeyDown(event) {
    if (!this.isActive) {
      if (event.key === '/' && !this.isInputFocused()) {
        event.preventDefault();
        this.startSearch();
        return;
      }
      return;
    }

    event.preventDefault();
    
    switch (event.key) {
      case 'Escape':
        this.endSearch();
        break;
      case 'Enter':
        this.followSelectedLink();
        break;
      case 'Backspace':
        this.removeLastChar();
        break;
      case 'ArrowDown':
        this.selectNext();
        break;
      case 'ArrowUp':
        this.selectPrevious();
        break;
      case 'Tab':
        if (event.shiftKey) {
          this.selectPrevious();
        } else {
          this.selectNext();
        }
        break;
      default:
        if (this.mnemonicsEnabled && event.key.length === 1 && (event.metaKey || event.ctrlKey) && !event.altKey) {
          const mnemonic = event.key.toLowerCase();
          if (this.mnemonicMap.has(mnemonic)) {
            this.followLinkByMnemonic(mnemonic);
          }
        } else if (event.key.length === 1 && !event.ctrlKey && !event.metaKey && !event.altKey) {
          this.addChar(event.key);
        }
        break;
    }
  }

  handleKeyUp(event) {
    // Prevent default browser search on slash
    if (event.key === '/' && !this.isInputFocused()) {
      event.preventDefault();
    }
  }

  isInputFocused() {
    const activeElement = document.activeElement;
    return activeElement && (
      activeElement.tagName === 'INPUT' ||
      activeElement.tagName === 'TEXTAREA' ||
      activeElement.contentEditable === 'true'
    );
  }

  startSearch() {
    this.isActive = true;
    this.searchString = '';
    this.originalActiveElement = document.activeElement;
    
    this.searchContainer.style.display = 'block';
    this.updateSearchDisplay();
    this.findLinks();
    if (this.mnemonicsEnabled) {
      this.showMnemonics();
    }
  }

  endSearch() {
    this.isActive = false;
    this.searchString = '';
    this.selectedIndex = 0;
    
    this.searchContainer.style.display = 'none';
    this.clearHighlights();
    this.clearMnemonics();
    
    if (this.originalActiveElement) {
      this.originalActiveElement.focus();
    }
  }

  addChar(char) {
    this.searchString += char;
    this.updateSearchDisplay();
    this.findLinks();
  }

  removeLastChar() {
    if (this.searchString.length > 0) {
      this.searchString = this.searchString.slice(0, -1);
      this.updateSearchDisplay();
      this.findLinks();
    } else {
      this.endSearch();
    }
  }

  updateSearchDisplay() {
    const queryElement = document.getElementById('typeahead-query');
    const counterElement = document.getElementById('typeahead-counter');
    
    if (queryElement) {
      queryElement.textContent = this.searchString;
    }
    
    if (counterElement) {
      if (this.matchedLinks.length > 0) {
        counterElement.textContent = ` (${this.selectedIndex + 1}/${this.matchedLinks.length})`;
        counterElement.style.color = '#90ee90';
      } else if (this.searchString.length > 0) {
        counterElement.textContent = ' (0 matches)';
        counterElement.style.color = '#ff6b6b';
      } else {
        counterElement.textContent = '';
      }
    }
  }

  findLinks() {
    this.clearHighlights();
    this.matchedLinks = [];
    this.selectedIndex = 0;

    if (this.searchString.length === 0) {
      return;
    }

    const links = document.querySelectorAll('a[href]');
    const searchLower = this.searchString.toLowerCase();

    links.forEach(link => {
      const linkText = link.textContent.toLowerCase();
      const href = link.href.toLowerCase();
      
      if (linkText.includes(searchLower) || href.includes(searchLower)) {
        this.matchedLinks.push(link);
        link.classList.add('typeahead-match');
      }
    });

    if (this.matchedLinks.length > 0) {
      this.selectLink(0);
    }
    
    this.updateSearchDisplay();
  }

  selectLink(index) {
    if (this.matchedLinks.length === 0) return;
    
    // Remove previous selection
    this.matchedLinks.forEach(link => {
      link.classList.remove('typeahead-selected');
    });

    // Add selection to new link
    this.selectedIndex = Math.max(0, Math.min(index, this.matchedLinks.length - 1));
    const selectedLink = this.matchedLinks[this.selectedIndex];
    
    if (selectedLink) {
      selectedLink.classList.add('typeahead-selected');
      selectedLink.scrollIntoView({ behavior: 'smooth', block: 'center' });
      selectedLink.focus({ preventScroll: true });
      this.updateSearchDisplay();
    }
  }

  selectNext() {
    if (this.matchedLinks.length > 0) {
      this.selectLink(this.selectedIndex + 1);
    }
  }

  selectPrevious() {
    if (this.matchedLinks.length > 0) {
      this.selectLink(this.selectedIndex - 1);
    }
  }

  followSelectedLink() {
    if (this.matchedLinks.length > 0 && this.matchedLinks[this.selectedIndex]) {
      const selectedLink = this.matchedLinks[this.selectedIndex];
      this.endSearch();
      selectedLink.click();
    }
  }

  clearHighlights() {
    const highlightedLinks = document.querySelectorAll('.typeahead-match, .typeahead-selected');
    highlightedLinks.forEach(link => {
      link.classList.remove('typeahead-match', 'typeahead-selected');
    });
  }

  showMnemonics() {
    this.clearMnemonics();
    
    const allLinks = document.querySelectorAll('a[href]');
    let mnemonicIndex = 0;
    
    allLinks.forEach(link => {
      if (mnemonicIndex >= 26) return;
      
      const mnemonic = String.fromCharCode(97 + mnemonicIndex);
      this.mnemonicMap.set(mnemonic, link);
      
      const mnemonicElement = document.createElement('div');
      mnemonicElement.className = 'typeahead-mnemonic';
      mnemonicElement.textContent = mnemonic;
      
      // Position relative to the link's parent to follow scrolling
      mnemonicElement.style.position = 'absolute';
      mnemonicElement.style.zIndex = '1000000';
      
      // Insert the mnemonic as a positioned element relative to the link
      const linkParent = link.offsetParent || document.body;
      const linkOffset = this.getElementOffset(link);
      
      mnemonicElement.style.left = (linkOffset.left - linkParent.offsetLeft) + 'px';
      mnemonicElement.style.top = (linkOffset.top - linkParent.offsetTop - 20) + 'px';
      
      linkParent.appendChild(mnemonicElement);
      this.mnemonicElements.push(mnemonicElement);
      
      mnemonicIndex++;
    });
  }

  getElementOffset(element) {
    let top = 0;
    let left = 0;
    
    while (element) {
      top += element.offsetTop;
      left += element.offsetLeft;
      element = element.offsetParent;
    }
    
    return { top, left };
  }

  clearMnemonics() {
    this.mnemonicElements.forEach(element => {
      if (element.parentNode) {
        element.parentNode.removeChild(element);
      }
    });
    this.mnemonicElements = [];
    this.mnemonicMap.clear();
  }

  followLinkByMnemonic(mnemonic) {
    const link = this.mnemonicMap.get(mnemonic);
    if (link) {
      this.endSearch();
      link.click();
    }
  }
}

// Initialize the extension when the page loads
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    new TypeAheadFind();
  });
} else {
  new TypeAheadFind();
}