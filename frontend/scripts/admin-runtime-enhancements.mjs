const ADMIN_RUNTIME_ENHANCEMENT_STYLE = `<style data-admin-runtime-enhancements="1">
:root{--ui-control-radius-px:var(--ui-radius-px,10px);--admin-toolbar-hover-bg:rgba(148,163,184,.14);--admin-toolbar-hover-bg-dark:rgba(51,65,85,.68)}
#app-shell .rounded-control,
#app-shell [role="tab"]{border-radius:max(16px,calc(var(--ui-control-radius-px) + 2px)) !important}
#app-shell [role="tab"]{position:relative;isolation:isolate}
#app-shell [data-admin-toolbar-group="title"]{min-width:0;flex:1 1 auto}
#app-shell [data-admin-page-title="1"]{min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
#app-shell [data-admin-toolbar-group="actions"]{display:flex;align-items:center;justify-content:flex-end;gap:.75rem;flex-shrink:0;position:relative;z-index:2;white-space:nowrap}
#app-shell [data-admin-brand-mark="1"]{position:relative;overflow:hidden}
#app-shell [data-admin-brand-mark="1"] svg{display:block;width:1.1rem;height:1.1rem;color:currentColor;filter:drop-shadow(0 1px 2px rgba(15,23,42,.16))}
#app-shell [data-admin-toolbar-action]{display:inline-flex;align-items:center;justify-content:center;flex-shrink:0;width:2.5rem;height:2.5rem;padding:0;border:0 !important;background:transparent !important;color:#475569;box-shadow:none !important;border-radius:max(14px,var(--ui-control-radius-px));transition:background-color .18s ease,color .18s ease,transform .18s ease,opacity .18s ease}
.dark #app-shell [data-admin-toolbar-action]{color:#cbd5e1}
#app-shell [data-admin-toolbar-action]:hover{transform:translateY(-1px);background:var(--admin-toolbar-hover-bg) !important;color:#ea580c}
.dark #app-shell [data-admin-toolbar-action]:hover{background:var(--admin-toolbar-hover-bg-dark) !important;color:#fb923c}
#app-shell [data-admin-toolbar-action]:focus-visible{outline:none;background:var(--admin-toolbar-hover-bg) !important;box-shadow:0 0 0 2px rgba(249,115,22,.2) !important}
.dark #app-shell [data-admin-toolbar-action]:focus-visible{background:var(--admin-toolbar-hover-bg-dark) !important;box-shadow:0 0 0 2px rgba(251,146,60,.24) !important}
#app-shell [data-admin-toolbar-action] i[data-lucide],
#app-shell [data-admin-toolbar-action] svg{width:1.1rem;height:1.1rem}
#app-shell [data-admin-toolbar-action="theme"][data-theme-state="dark"]{color:#ea580c}
.dark #app-shell [data-admin-toolbar-action="theme"][data-theme-state="dark"]{color:#fb923c}
#app-shell [data-admin-toolbar-action="theme"][data-theme-state="light"]{color:#0369a1}
.dark #app-shell [data-admin-toolbar-action="theme"][data-theme-state="light"]{color:#7dd3fc}
body.bg-slate-50,body.antialiased{background:#f8fafc !important;color:#0f172a !important}
.dark body,.dark body.antialiased{background:#020617 !important;color:#e2e8f0 !important}
#app-shell{min-width:0;background:#f8fafc;color:#0f172a}
.dark #app-shell{background:#020617;color:#e2e8f0}
#view-nodes .node-toolbar-primary-btn,
#view-nodes .node-tag-filter-trigger,
#view-nodes .node-toolbar-search,
#view-nodes .node-tag-filter-chip,
#view-nodes .node-action-btn,
#node-modal .node-modal-primary-btn,
#node-modal .node-modal-secondary-btn,
#view-settings .set-tab{position:relative;z-index:1}
#view-nodes .node-toolbar-primary-btn,
#view-nodes .node-tag-filter-trigger,
#view-nodes .node-toolbar-search,
#view-nodes .node-tag-filter-chip,
#view-nodes .node-action-btn,
#view-nodes .rounded-control,
#node-modal .node-modal-primary-btn,
#node-modal .node-modal-secondary-btn,
#view-logs .rounded-control,
#view-dns .rounded-control,
#view-settings .set-tab{border-radius:max(16px,calc(var(--ui-control-radius-px) + 4px)) !important}
#view-nodes .node-toolbar-primary-btn,
#view-nodes .node-tag-filter-trigger,
#view-nodes .node-toolbar-search,
#view-nodes .node-action-btn,
#node-modal .node-modal-primary-btn,
#node-modal .node-modal-secondary-btn{display:inline-flex;align-items:center;justify-content:center;isolation:isolate}
#view-nodes .node-tag-filter-panel-shell{position:relative;z-index:4}
.dark #view-nodes .node-toolbar-primary-btn,
.dark #node-modal .node-modal-primary-btn{background:#2563eb !important;color:#fff !important;box-shadow:0 10px 24px rgba(37,99,235,.22) !important}
.dark #view-nodes .node-toolbar-primary-btn:hover,
.dark #node-modal .node-modal-primary-btn:hover{background:#1d4ed8 !important}
.dark #view-nodes .node-tag-filter-trigger,
.dark #view-nodes .node-toolbar-search,
.dark #view-nodes .node-tag-filter-chip,
.dark #view-nodes .node-action-btn,
.dark #node-modal .node-modal-secondary-btn{background:rgba(15,23,42,.88) !important;color:#e2e8f0 !important;border-color:rgba(71,85,105,.82) !important;box-shadow:none !important}
.dark #view-nodes .node-card-shell,
.dark #view-nodes .node-tag-filter-panel-shell,
.dark #node-modal>div{background:#0f172a !important;border-color:#1e293b !important}
#view-settings{--settings-surface:#ffffff;--settings-soft:#f8fafc;--settings-border:#dbe3ee;--settings-border-strong:#cbd5e1;overflow-x:hidden}
.dark #view-settings{--settings-surface:#0f172a;--settings-soft:#111827;--settings-border:#334155;--settings-border-strong:#475569}
#view-settings,#view-settings .settings-view-layout,#view-settings #settings-forms,#settings-forms>[id^="set-"]{min-width:0;min-height:0}
#view-settings .settings-view-layout{align-items:flex-start;overflow-x:hidden}
#view-settings #settings-forms{flex:1 1 auto;min-width:0}
#settings-forms>[id^="set-"]>.settings-block.h-full{height:auto;min-height:0}
#view-settings .ui-settings-panel,
#view-settings .settings-nav-shell,
#view-settings .settings-block,
#view-settings .settings-list-shell{background:var(--settings-surface) !important;border-color:var(--settings-border) !important;background-image:none !important;box-shadow:none !important}
#view-settings .settings-summary-tile{border:1px solid var(--settings-border) !important;border-radius:max(16px,calc(var(--ui-control-radius-px) + 4px)) !important;background:var(--settings-soft) !important;padding:.875rem 1rem;box-shadow:none !important}
#view-settings .ui-block-head,
#view-settings .settings-nav-shell .border-b,
#view-settings #settings-forms>div>.ui-settings-panel+.ui-settings-panel{border-color:var(--settings-border) !important}
#view-settings .settings-secondary-btn,
#view-settings .settings-secondary-label,
#view-settings button[class*="border-slate-200"],
#view-settings button[class*="border-slate-300"],
#view-settings label[class*="border-slate-200"],
#view-settings label[class*="bg-slate-200"]{display:inline-flex;align-items:center;justify-content:center;border-radius:max(14px,var(--ui-control-radius-px)) !important;background:var(--settings-soft) !important;border:1px solid var(--settings-border) !important;color:#334155 !important;box-shadow:none !important;background-image:none !important}
.dark #view-settings .settings-secondary-btn,
.dark #view-settings .settings-secondary-label,
.dark #view-settings button[class*="border-slate-200"],
.dark #view-settings button[class*="border-slate-300"],
.dark #view-settings label[class*="border-slate-200"],
.dark #view-settings label[class*="bg-slate-200"]{background:var(--settings-soft) !important;border-color:var(--settings-border) !important;color:#e2e8f0 !important}
#view-settings .settings-secondary-btn:hover,
#view-settings .settings-secondary-label:hover,
#view-settings button[class*="border-slate-200"]:hover,
#view-settings button[class*="border-slate-300"]:hover,
#view-settings label[class*="border-slate-200"]:hover,
#view-settings label[class*="bg-slate-200"]:hover{background:var(--settings-surface) !important;border-color:var(--settings-border-strong) !important;color:#0f172a !important}
.dark #view-settings .settings-secondary-btn:hover,
.dark #view-settings .settings-secondary-label:hover,
.dark #view-settings button[class*="border-slate-200"]:hover,
.dark #view-settings button[class*="border-slate-300"]:hover,
.dark #view-settings label[class*="border-slate-200"]:hover,
.dark #view-settings label[class*="bg-slate-200"]:hover{background:#162033 !important;border-color:var(--settings-border-strong) !important;color:#f8fafc !important}
#view-settings .set-tab{background:var(--settings-surface) !important;border-color:var(--settings-border) !important;color:#475569 !important;box-shadow:none !important}
#view-settings .set-tab:hover{background:var(--settings-surface) !important;border-color:var(--settings-border-strong) !important;color:#0f172a !important}
.dark #view-settings .set-tab{background:var(--settings-surface) !important;color:#cbd5e1 !important}
.dark #view-settings .set-tab:hover{background:#162033 !important;color:#fff !important}
#view-settings .set-tab[aria-selected="true"]{background:var(--settings-surface) !important;border-color:#bfdbfe !important;color:#1d4ed8 !important;box-shadow:inset 0 0 0 1px rgba(191,219,254,.75) !important}
.dark #view-settings .set-tab[aria-selected="true"]{background:var(--settings-surface) !important;border-color:#3b82f6 !important;color:#bfdbfe !important;box-shadow:inset 0 0 0 1px rgba(59,130,246,.3) !important}
#view-settings button:disabled,
#view-settings .settings-secondary-btn:disabled,
#view-settings .set-tab:disabled{opacity:.65 !important;pointer-events:none}
@media (max-width:767px){#view-settings .settings-view-layout{display:flex;flex-direction:column}}
@media (min-width:768px){#app-shell.settings-split-layout #content-area{overflow:hidden}#app-shell.settings-split-layout #view-settings{height:100%;min-height:0;overflow:hidden}#app-shell.settings-split-layout #view-settings .settings-view-layout{height:100%;min-height:0}#app-shell.settings-split-layout #view-settings .settings-nav-shell{position:sticky;top:0;max-height:100%;overflow-y:auto;flex:0 0 auto}#app-shell.settings-split-layout #view-settings #settings-forms{height:100%;min-height:0;overflow-y:auto;padding-right:.25rem;scrollbar-gutter:stable}}
#app-shell.render-lite.settings-split-layout #view-settings .settings-nav-shell{position:static;top:auto;max-height:none;overflow:visible}
#app-shell input:not([type="checkbox"]):not([type="radio"]):not([type="range"]):not([type="color"]),
#app-shell select,
#app-shell textarea,
#app-shell label:has(> input:not([type="checkbox"]):not([type="radio"]):not([type="range"]):not([type="color"])),
#app-shell label:has(> select),
#app-shell label:has(> textarea){border-radius:var(--ui-control-radius-px) !important}
#app-shell i[data-lucide]{display:inline-flex;align-items:center;justify-content:center;vertical-align:middle}
#app-shell svg.lucide{display:block;flex-shrink:0;stroke:currentColor}
</style>`;
const ADMIN_RUNTIME_ENHANCEMENT_SCRIPT = `<script data-admin-runtime-enhancements="1">
(() => {
  if (window.__ADMIN_RUNTIME_ENHANCEMENTS_READY__) return;
  window.__ADMIN_RUNTIME_ENHANCEMENTS_READY__ = true;

  const enqueue = typeof window.requestAnimationFrame === 'function'
    ? window.requestAnimationFrame.bind(window)
    : (callback) => window.setTimeout(callback, 16);
  const brandIconSvg = '<svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M7.25 5.75h9.5" stroke="currentColor" stroke-width="2.15" stroke-linecap="round"/><path d="M7.25 12h6.75" stroke="currentColor" stroke-width="2.15" stroke-linecap="round"/><path d="M7.25 18.25h9.5" stroke="currentColor" stroke-width="2.15" stroke-linecap="round"/><path d="M7.25 5.75v12.5" stroke="currentColor" stroke-width="2.15" stroke-linecap="round"/></svg>';
  const shellHookSelector = '[data-admin-toolbar-group="title"],[data-admin-toolbar-group="actions"],[data-admin-page-title="1"],[data-admin-brand-shell="1"],[data-admin-brand-title="1"],[data-admin-brand-mark="1"]';
  let iconFrameId = 0;
  let shellFrameId = 0;

  function canRenderIcons() {
    return !!window.lucide && typeof window.lucide.createIcons === 'function';
  }

  function renderIcons(root = document.body) {
    if (!canRenderIcons()) return false;
    try {
      if (root && root.nodeType === Node.ELEMENT_NODE) {
        window.lucide.createIcons({ root });
      } else {
        window.lucide.createIcons({});
      }
      return true;
    } catch (error) {
      console.error('admin runtime lucide refresh failed', error);
      return false;
    }
  }

  function scheduleIconRefresh(root = document.body) {
    if (iconFrameId) return;
    iconFrameId = enqueue(() => {
      iconFrameId = 0;
      renderIcons(root);
    });
  }

  function scheduleShellRefresh() {
    if (shellFrameId) return;
    shellFrameId = enqueue(() => {
      shellFrameId = 0;
      applyBrandEnhancements();
      applyToolbarEnhancements();
    });
  }

  function containsLucidePlaceholder(node) {
    if (!node) return false;
    if (node.matches?.('i[data-lucide]')) return true;
    return !!node.querySelector?.('i[data-lucide]');
  }

  function touchesShellHooks(node) {
    if (!node || node.nodeType !== Node.ELEMENT_NODE) return false;
    if (node.matches?.(shellHookSelector)) return true;
    if (node.closest?.(shellHookSelector)) return true;
    return !!node.querySelector?.(shellHookSelector);
  }

  function getToolbarNodes() {
    const titleGroup = document.querySelector('[data-admin-toolbar-group="title"]');
    const actionGroup = document.querySelector('[data-admin-toolbar-group="actions"]');
    const titleNode = document.querySelector('[data-admin-page-title="1"]');
    const githubLink = actionGroup?.querySelector('a[href*="github.com/axuitomo/CF-EMBY-PROXY-UI"]') || null;
    const themeButton = actionGroup
      ? [...actionGroup.querySelectorAll('button')].find((button) => button.querySelector('[data-lucide="moon"],[data-lucide="sun"]')) || null
      : null;
    return { titleGroup, actionGroup, titleNode, githubLink, themeButton };
  }

  function getBrandNodes() {
    const brandShell = document.querySelector('[data-admin-brand-shell="1"]');
    if (!brandShell) return {};
    const brandTitle = brandShell.querySelector('[data-admin-brand-title="1"]');
    const brandMark = brandShell.querySelector('[data-admin-brand-mark="1"]');
    return { brandShell, brandTitle, brandMark };
  }

  function applyBrandEnhancements() {
    const { brandTitle, brandMark } = getBrandNodes();
    if (brandTitle) {
      brandTitle.setAttribute('title', String(brandTitle.textContent || '').trim());
    }
    if (!brandMark) return;
    brandMark.setAttribute('data-admin-brand-mark', '1');
    brandMark.setAttribute('aria-hidden', 'true');
    if (brandMark.dataset.adminBrandSvgApplied === '1') return;
    brandMark.dataset.adminBrandSvgApplied = '1';
    brandMark.textContent = '';
    brandMark.innerHTML = brandIconSvg;
  }

  function applyToolbarEnhancements() {
    const { titleGroup, actionGroup, titleNode, githubLink, themeButton } = getToolbarNodes();
    if (titleNode) {
      const titleText = String(titleNode.textContent || '').trim();
      titleNode.setAttribute('title', titleText);
    }
    if (githubLink) {
      githubLink.setAttribute('data-admin-toolbar-action', 'github');
      githubLink.setAttribute('aria-label', githubLink.getAttribute('aria-label') || '打开 GitHub 项目主页');
    }
    if (themeButton) {
      themeButton.setAttribute('data-admin-toolbar-action', 'theme');
      themeButton.setAttribute('type', 'button');
      const isDark = document.documentElement.classList.contains('dark') || document.body?.classList.contains('dark');
      const nextThemeLabel = isDark ? '切换到亮色模式' : '切换到暗色模式';
      themeButton.setAttribute('data-theme-state', isDark ? 'dark' : 'light');
      themeButton.setAttribute('title', nextThemeLabel);
      themeButton.setAttribute('aria-label', nextThemeLabel);
      if (!themeButton.dataset.adminThemeRefreshBound) {
        themeButton.dataset.adminThemeRefreshBound = '1';
        themeButton.addEventListener('click', () => scheduleShellRefresh());
      }
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      scheduleIconRefresh(document.body);
      scheduleShellRefresh();
    }, { once: true });
  } else {
    scheduleIconRefresh(document.body);
    scheduleShellRefresh();
  }

  window.addEventListener('load', () => {
    scheduleIconRefresh(document.body);
    scheduleShellRefresh();
  }, { once: true });

  if (typeof MutationObserver === 'function') {
    const observer = new MutationObserver((records) => {
      let shouldRefreshIcons = false;
      let shouldRefreshShell = false;
      for (const record of records) {
        if (record.type === 'attributes') {
          if (containsLucidePlaceholder(record.target)) shouldRefreshIcons = true;
          if (record.target === document.documentElement || record.target === document.body || touchesShellHooks(record.target)) {
            shouldRefreshShell = true;
          }
          continue;
        }
        for (const node of record.addedNodes) {
          if (!node || node.nodeType !== Node.ELEMENT_NODE) continue;
          if (containsLucidePlaceholder(node)) shouldRefreshIcons = true;
          if (touchesShellHooks(node)) shouldRefreshShell = true;
        }
      }
      if (shouldRefreshIcons) scheduleIconRefresh(document.body);
      if (shouldRefreshShell) scheduleShellRefresh();
    });

    const observe = () => {
      if (document.documentElement) {
        observer.observe(document.documentElement, {
          childList: true,
          subtree: true,
          attributes: true,
          attributeFilter: ['class']
        });
      }
    };

    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', observe, { once: true });
    } else {
      observe();
    }
  }
})();
</script>`;

export {
  ADMIN_RUNTIME_ENHANCEMENT_STYLE,
  ADMIN_RUNTIME_ENHANCEMENT_SCRIPT
};
