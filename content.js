class TypeAheadFind {
  constructor() {
    this.isActive = false;
    this.searchString = '';
    this.matchedLinks = [];
    this.selectedIndex = 0;
    this.searchContainer = null;
    this.originalActiveElement = null;
    
    this.init();
  }

  init() {
    document.addEventListener('keydown', this.handleKeyDown.bind(this));
    document.addEventListener('keyup', this.handleKeyUp.bind(this));
    this.createSearchUI();
  }

  createSearchUI() {
    this.searchContainer = document.createElement('div');
    this.searchContainer.id = 'typeahead-search-container';
    this.searchContainer.style.display = 'none';
    
    const searchBox = document.createElement('div');
    searchBox.id = 'typeahead-search-box';
    searchBox.innerHTML = '<span id="typeahead-prompt">/</span><span id="typeahead-query"></span>';
    
    this.searchContainer.appendChild(searchBox);
    document.body.appendChild(this.searchContainer);
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
      default:
        if (event.key.length === 1 && !event.ctrlKey && !event.metaKey && !event.altKey) {
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
  }

  endSearch() {
    this.isActive = false;
    this.searchString = '';
    this.selectedIndex = 0;
    
    this.searchContainer.style.display = 'none';
    this.clearHighlights();
    
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
    if (queryElement) {
      queryElement.textContent = this.searchString;
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
}

// Initialize the extension when the page loads
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    new TypeAheadFind();
  });
} else {
  new TypeAheadFind();
}