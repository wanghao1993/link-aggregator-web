// Popup script for Link Saver Chrome extension
const API_BASE = 'https://link.wanghao1993.com/api';

let collections = [];

document.addEventListener('DOMContentLoaded', async () => {
  try {
    // Get current tab info
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    const url = tab.url;
    const title = tab.title;

    // Fetch user's collections
    const collectionsRes = await fetch(`${API_BASE}/users/me/collections`, {
      credentials: 'include'
    });

    if (!collectionsRes.ok) {
      renderLoginRequired();
      return;
    }

    const collectionsData = await collectionsRes.json();
    collections = collectionsData.collections || [];

    // Fetch link preview
    let preview = { title: '', description: '', favicon: '' };
    try {
      const previewRes = await fetch(`${API_BASE}/link-preview?url=${encodeURIComponent(url)}`);
      if (previewRes.ok) {
        preview = await previewRes.json();
      }
    } catch (e) {
      // Ignore preview errors
    }

    renderForm(url, title || preview.title, preview.description, preview.favicon);
  } catch (error) {
    console.error('Error:', error);
    renderError('Failed to load. Please sign in first.');
  }
});

function renderLoginRequired() {
  document.getElementById('content').innerHTML = `
    <p class="error">Please sign in to Link first.</p>
    <button onclick="chrome.tabs.create({ url: 'https://link.wanghao1993.com/auth/signin' })">
      Sign In
    </button>
  `;
}

function renderError(message) {
  document.getElementById('content').innerHTML = `
    <p class="error">${message}</p>
  `;
}

function renderForm(url, title, description, favicon) {
  const collectionsHtml = collections.map(c => 
    `<option value="${c.id}">${c.title}</option>`
  ).join('');

  document.getElementById('content').innerHTML = `
    <form class="form" id="saveForm">
      <div>
        <label>URL</label>
        <input type="url" id="url" value="${url}" required readonly style="background: #f5f5f5;">
      </div>
      <div>
        <label>Title</label>
        <input type="text" id="title" value="${title || ''}" placeholder="Enter title">
      </div>
      <div>
        <label>Description</label>
        <input type="text" id="description" value="${description || ''}" placeholder="Enter description">
      </div>
      <div>
        <label>Collection</label>
        <select id="collection" required>
          ${collectionsHtml || '<option value="">No collections found</option>'}
        </select>
      </div>
      <button type="submit" id="submitBtn" ${!collections.length ? 'disabled' : ''}>
        Save Link
      </button>
    </form>
    <div id="status"></div>
  `;

  document.getElementById('saveForm').addEventListener('submit', handleSubmit);
}

async function handleSubmit(e) {
  e.preventDefault();
  
  const submitBtn = document.getElementById('submitBtn');
  const status = document.getElementById('status');
  
  submitBtn.disabled = true;
  submitBtn.textContent = 'Saving...';
  status.innerHTML = '';

  const url = document.getElementById('url').value;
  const title = document.getElementById('title').value;
  const description = document.getElementById('description').value;
  const collectionId = document.getElementById('collection').value;

  try {
    const res = await fetch(`${API_BASE}/collections/${collectionId}/links`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ url, title, description })
    });

    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Failed to save');
    }

    status.innerHTML = '<p class="success">Link saved successfully!</p>';
    submitBtn.textContent = 'Saved!';
    
    setTimeout(() => window.close(), 1500);
  } catch (error) {
    status.innerHTML = `<p class="error">${error.message}</p>`;
    submitBtn.disabled = false;
    submitBtn.textContent = 'Save Link';
  }
}
