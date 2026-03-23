// Background service worker for Link Saver Chrome extension
chrome.contextMenus.create({
  id: "saveToLink",
  title: "Save to Link",
  contexts: ["page", "link"]
});

chrome.contextMenus.onClicked.addListener((info, tab) => {
  if (info.menuItemId === "saveToLink") {
    const url = info.linkUrl || info.pageUrl;
    const title = info.pageTitle || "";
    
    chrome.tabs.create({
      url: `https://link.wanghao1993.com/import?url=${encodeURIComponent(url)}&title=${encodeURIComponent(title)}`,
      active: true
    });
  }
});

chrome.action.onClicked.addListener((tab) => {
  chrome.tabs.create({
    url: "https://link.wanghao1993.com/import",
    active: true
  });
});
