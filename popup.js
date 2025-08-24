// Load and display current setting
chrome.storage.sync.get(['mnemonicsEnabled'], function(result) {
  const enabled = result.mnemonicsEnabled || false;
  const toggle = document.getElementById('mnemonic-toggle');
  const feature = document.getElementById('mnemonic-feature');
  
  if (enabled) {
    toggle.classList.add('enabled');
    feature.style.display = 'block';
  }
});

// Handle toggle clicks
document.getElementById('mnemonic-toggle').addEventListener('click', function() {
  const toggle = this;
  const feature = document.getElementById('mnemonic-feature');
  const enabled = !toggle.classList.contains('enabled');
  
  if (enabled) {
    toggle.classList.add('enabled');
    feature.style.display = 'block';
  } else {
    toggle.classList.remove('enabled');
    feature.style.display = 'none';
  }
  
  chrome.storage.sync.set({ mnemonicsEnabled: enabled });
});

document.getElementById('toggle-label').addEventListener('click', function() {
  document.getElementById('mnemonic-toggle').click();
});