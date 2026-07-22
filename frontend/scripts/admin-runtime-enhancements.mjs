const ADMIN_RUNTIME_ENHANCEMENT_STYLE = `<style data-admin-runtime-enhancements="1">
:root{--ui-control-radius-px:var(--ui-radius-px,10px);--admin-toolbar-hover-bg:rgba(148,163,184,.14);--admin-toolbar-hover-bg-dark:rgba(51,65,85,.68)}
#app-shell .rounded-control,
#app-shell [role="tab"]{border-radius:max(16px,calc(var(--ui-control-radius-px) + 2px)) !important}
#app-shell [role="tab"]{position:relative;isolation:isolate}
#app-shell [data-admin-toolbar-group="title"]{min-width:0;flex:1 1 auto}
#app-shell [data-admin-page-title="1"]{min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
#app-shell [data-admin-toolbar-group="actions"]{display:flex;align-items:center;justify-content:flex-end;gap:.25rem;flex-shrink:0;position:relative;z-index:2;white-space:nowrap}
#app-shell [data-admin-toolbar-group="actions"]>*{margin-left:0 !important;margin-right:0 !important}
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
#node-modal [data-admin-node-advanced="1"]{overflow:hidden;border:1px solid #e2e8f0;border-radius:max(16px,calc(var(--ui-control-radius-px) + 6px));background:rgba(248,250,252,.72)}
.dark #node-modal [data-admin-node-advanced="1"]{border-color:#334155;background:rgba(2,6,23,.34)}
#node-modal [data-admin-node-advanced="1"]>summary{display:flex;align-items:center;justify-content:space-between;gap:.75rem;padding:1rem;cursor:pointer;list-style:none;color:#334155;font-size:.875rem;font-weight:600;user-select:none}
.dark #node-modal [data-admin-node-advanced="1"]>summary{color:#e2e8f0}
#node-modal [data-admin-node-advanced="1"]>summary::-webkit-details-marker{display:none}
#node-modal [data-admin-node-advanced="1"]>summary svg{width:1rem;height:1rem;transition:transform .18s ease}
#node-modal [data-admin-node-advanced="1"][open]>summary svg{transform:rotate(180deg)}
#node-modal [data-admin-node-advanced-content="1"]{display:grid;gap:1rem;padding:0 1rem 1rem;border-top:1px solid #e2e8f0}
.dark #node-modal [data-admin-node-advanced-content="1"]{border-color:#334155}
#node-modal [data-admin-node-advanced-fields="1"]{padding-top:1rem}
#node-modal [data-admin-node-advanced-headers="1"]{margin:0;background:#fff}
.dark #node-modal [data-admin-node-advanced-headers="1"]{background:rgba(15,23,42,.72)}
#node-modal>div[data-ui-dialog-surface="1"]{padding:1rem !important}
#node-modal #node-modal-title{margin-bottom:.75rem !important;font-size:1.125rem;line-height:1.5rem}
#node-modal form{max-height:calc(86vh - env(safe-area-inset-bottom) - env(safe-area-inset-top)) !important}
#node-modal form>*+*{margin-top:.75rem !important}
#node-modal form>[class*="grid"]{gap:.75rem !important}
#node-modal form label{margin-bottom:.2rem}
#node-modal form p[class*="text-xs"]{margin-top:.2rem;line-height:1.15rem}
#node-modal form input:not([type="checkbox"]):not([type="radio"]),
#node-modal form select{min-height:2.25rem;padding-top:.4rem !important;padding-bottom:.4rem !important}
#node-modal form .rounded-2xl.border{padding:.875rem !important}
#node-modal #node-lines-container{gap:.5rem}
#node-modal #node-lines-container>[data-node-line-row="1"]{padding:.625rem !important}
#node-modal [data-admin-node-lines-panel="1"]>div:first-child>div:first-child{min-width:0;flex:1 1 auto}
#node-modal [data-admin-node-lines-panel="1"]>div:first-child>div:last-child{flex:0 0 auto;white-space:nowrap}
#node-modal [data-admin-node-lines-panel="1"]>div:first-child>div:last-child button{flex-shrink:0;white-space:nowrap}
#node-modal [data-admin-node-advanced="1"]>summary{padding:.75rem .875rem}
#node-modal [data-admin-node-advanced-content="1"]{gap:.75rem;padding:0 .875rem .875rem}
#node-modal [data-admin-node-advanced-fields="1"]{padding-top:.875rem}
#node-modal form>div:last-child{margin-top:1rem !important;padding-top:.625rem !important;padding-bottom:.25rem !important}
#node-modal [data-admin-node-basic-grid="1"]{grid-template-columns:minmax(0,.85fr) repeat(3,minmax(0,1fr)) !important}
#node-modal [data-admin-node-meta-grid="1"]{grid-template-columns:minmax(0,1.35fr) minmax(0,1fr) minmax(15rem,1fr) !important}
#node-modal [data-admin-node-entry-field="1"] p{margin-bottom:0}
#node-modal [data-admin-node-stream-field="1"]{min-width:0}
@media (max-width:767px){#node-modal [data-admin-node-basic-grid="1"],#node-modal [data-admin-node-meta-grid="1"]{grid-template-columns:minmax(0,1fr) !important}}
@media (min-width:768px){#node-modal{max-width:72rem}}
#view-nodes [data-admin-node-toolbar="1"]{display:grid;grid-template-columns:minmax(0,1fr);gap:1rem;align-items:start}
#view-nodes [data-admin-node-toolbar-main="1"]{width:100%;max-width:none;min-width:0}
#view-nodes [data-admin-node-toolbar-row="1"]{display:grid;grid-template-columns:max-content max-content minmax(15rem,1fr);align-items:center;gap:.5rem;width:100%}
#view-nodes [data-admin-node-toolbar-actions="1"]{display:grid;grid-template-columns:repeat(3,max-content);align-items:center;justify-content:start;gap:.5rem;width:auto}
#view-nodes [data-admin-node-toolbar-actions="1"]>*{width:auto;min-height:2.5rem;margin:0}
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
#view-settings .settings-worker-html-update-card [data-admin-worker-html-grid="1"]{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:1rem}
#view-settings .settings-worker-html-update-card [data-admin-worker-html-file="1"]{display:grid;gap:.5rem;min-width:0;padding:1rem;border:1px solid var(--settings-border);border-radius:max(14px,var(--ui-control-radius-px));background:var(--settings-soft)}
#view-settings .settings-worker-html-update-card [data-admin-worker-html-file="1"] input{width:100%;min-width:0}
#view-settings .settings-worker-html-update-card [data-admin-worker-html-file-meta="1"],
#view-settings .settings-worker-html-update-card [data-admin-worker-html-status="1"]{overflow-wrap:anywhere}
#view-settings .settings-worker-html-update-card [data-admin-worker-html-actions="1"]{display:flex;align-items:center;justify-content:flex-end;gap:.5rem;padding-top:.25rem}
#view-settings .settings-worker-html-update-card [data-admin-worker-html-actions="1"] button{min-height:2.5rem}
#view-settings [data-media-aggregation-panel="1"]{margin-top:1.25rem;padding-top:1.25rem;border-top:1px solid var(--settings-border)}
#view-settings [data-media-aggregation-credentials="1"]{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:.75rem}
#view-settings [data-media-aggregation-list="1"]{max-height:16rem;overflow-y:auto;display:grid;gap:.5rem;padding:.5rem;border:1px solid var(--settings-border);border-radius:max(14px,var(--ui-control-radius-px));background:var(--settings-soft)}
#view-settings [data-media-aggregation-item="1"]{display:flex;align-items:flex-start;gap:.75rem;padding:.625rem .75rem;border:1px solid var(--settings-border);border-radius:max(12px,var(--ui-control-radius-px));background:var(--settings-surface);cursor:pointer}
#view-settings [data-media-aggregation-item="1"] input{width:1rem;height:1rem;margin-top:.15rem;flex:0 0 auto}
#view-settings [data-media-aggregation-item="1"][data-media-aggregation-available="0"]{opacity:.58;cursor:not-allowed}
#view-settings [data-media-aggregation-credential-state="missing"]{color:#b45309}
#node-modal [data-admin-node-media-credentials="1"]{display:grid;gap:.75rem;padding:1rem;border:1px solid #e2e8f0;border-radius:max(14px,var(--ui-control-radius-px));background:#fff}
.dark #node-modal [data-admin-node-media-credentials="1"]{border-color:#334155;background:rgba(15,23,42,.72)}
#node-modal [data-admin-node-media-credentials-grid="1"]{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:.75rem}
@media (max-width:767px){#node-modal [data-admin-node-media-credentials-grid="1"]{grid-template-columns:minmax(0,1fr)}}
#view-settings [data-media-aggregation-actions="1"]{display:flex;align-items:center;justify-content:space-between;gap:.75rem;margin-top:.75rem}
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
@media (max-width:767px){#view-nodes [data-admin-node-toolbar-row="1"],#view-nodes [data-admin-node-toolbar-actions="1"]{grid-template-columns:minmax(0,1fr)}#view-nodes [data-admin-node-toolbar-row="1"]>*{width:100%}#view-settings .settings-view-layout{display:flex;flex-direction:column}#view-settings .settings-worker-html-update-card [data-admin-worker-html-grid="1"],#view-settings [data-media-aggregation-credentials="1"]{grid-template-columns:minmax(0,1fr)}#view-settings .settings-worker-html-update-card [data-admin-worker-html-actions="1"],#view-settings [data-media-aggregation-actions="1"]{align-items:stretch;flex-direction:column}#view-settings .settings-worker-html-update-card [data-admin-worker-html-actions="1"] button,#view-settings [data-media-aggregation-actions="1"] button{width:100%}}
@media (min-width:768px) and (max-width:1535px){#view-nodes [data-admin-node-toolbar-actions="1"]{grid-template-columns:repeat(3,minmax(0,1fr));width:100%}#view-nodes [data-admin-node-toolbar-actions="1"]>*{width:100%}}
@media (min-width:1536px){#view-nodes [data-admin-node-toolbar="1"]{grid-template-columns:minmax(0,1fr) max-content}#view-nodes [data-admin-node-toolbar-actions="1"]{justify-content:end}}
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
#view-dashboard [data-dashboard-traffic-card="1"]{position:relative !important}
#view-dashboard [data-dashboard-traffic-label="1"]{width:calc(100% - 2.75rem);padding-right:0;overflow:visible;text-overflow:clip;white-space:normal !important}
#view-dashboard [data-dashboard-traffic-toggle="1"]{position:absolute;top:1rem;right:1rem;display:inline-flex;align-items:center;justify-content:center;width:2.25rem;height:2.25rem;padding:0;border:1px solid #dbe3ee;background:rgba(255,255,255,.9);color:#475569;border-radius:max(12px,var(--ui-control-radius-px));box-shadow:none;transition:background-color .18s ease,border-color .18s ease,color .18s ease,opacity .18s ease}
#view-dashboard [data-dashboard-traffic-toggle="1"]:hover{background:#f8fafc;border-color:#94a3b8;color:#047857}
#view-dashboard [data-dashboard-traffic-toggle="1"]:focus-visible{outline:none;box-shadow:0 0 0 2px rgba(16,185,129,.22)}
#view-dashboard [data-dashboard-traffic-toggle="1"]:disabled{cursor:wait;opacity:.6}
#view-dashboard [data-dashboard-traffic-toggle="1"] i,#view-dashboard [data-dashboard-traffic-toggle="1"] svg{width:1rem;height:1rem}
.dark #view-dashboard [data-dashboard-traffic-toggle="1"]{border-color:#334155;background:rgba(15,23,42,.92);color:#cbd5e1}
.dark #view-dashboard [data-dashboard-traffic-toggle="1"]:hover{border-color:#64748b;background:#111827;color:#34d399}
#view-server-records{--record-border:#e2e8f0;--record-soft:#f8fafc;--record-surface:#fff;--record-text:#0f172a;--record-muted:#64748b}
.dark #view-server-records{--record-border:#1e293b;--record-soft:#0f172a;--record-surface:#020617;--record-text:#f8fafc;--record-muted:#94a3b8}
#view-server-records .server-record-toolbar{display:flex;align-items:center;justify-content:space-between;gap:1rem;margin-bottom:1.5rem}
#view-server-records .server-record-toolbar-copy{min-width:0}
#view-server-records .server-record-toolbar-actions{display:flex;align-items:center;gap:.5rem}
#view-server-records .server-record-kicker{margin:0 0 .25rem;font-size:.75rem;line-height:1rem;font-weight:600;color:#94a3b8}
#view-server-records .server-record-heading{margin:0;font-size:1.25rem;line-height:1.75rem;font-weight:650;color:var(--record-text)}
#view-server-records .server-record-summary{margin-top:.35rem;font-size:.8125rem;line-height:1.25rem;color:var(--record-muted)}
#view-server-records .server-record-add,#view-server-records .server-record-primary{display:inline-flex;align-items:center;justify-content:center;gap:.5rem;min-height:2.5rem;border:1px solid transparent;border-radius:var(--ui-control-radius-px);background:#2563eb;padding:.625rem .875rem;color:#fff;font-size:.8125rem;font-weight:600;transition:background-color .18s ease,transform .18s ease,box-shadow .18s ease}
#view-server-records .server-record-add:hover,#view-server-records .server-record-primary:hover{background:#1d4ed8;transform:translateY(-1px);box-shadow:0 10px 22px rgba(37,99,235,.16)}
#view-server-records .server-record-search{position:relative;margin-bottom:1.25rem;max-width:28rem}
#view-server-records .server-record-search>svg,#view-server-records .server-record-search>i{position:absolute;left:.8rem;top:50%;width:1rem;height:1rem;transform:translateY(-50%);color:#94a3b8;pointer-events:none}
#view-server-records .server-record-search input{width:100%;height:2.5rem;border:1px solid var(--record-border);background:var(--record-surface);padding:.5rem .8rem .5rem 2.4rem;color:var(--record-text);font-size:.8125rem;outline:none}
#view-server-records .server-record-search input:focus{border-color:#60a5fa;box-shadow:0 0 0 3px rgba(59,130,246,.12)}
#view-server-records .server-record-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(min(100%,20rem),1fr));gap:1rem}
#view-server-records .server-record-card{position:relative;display:flex;min-height:20rem;flex-direction:column;overflow:hidden;border:1px solid var(--record-border);border-radius:var(--ui-radius-px);background:var(--record-surface);padding:1.25rem;box-shadow:0 8px 24px rgba(15,23,42,.04);transition:border-color .2s ease,box-shadow .2s ease,transform .2s ease}
#view-server-records .server-record-card:hover{transform:translateY(-2px);border-color:#cbd5e1;box-shadow:0 16px 32px rgba(15,23,42,.07)}
.dark #view-server-records .server-record-card:hover{border-color:#475569;box-shadow:0 16px 32px rgba(2,6,23,.32)}
#view-server-records .server-record-card.is-expiring,#view-server-records .server-record-card.is-expired{border-color:#fecdd3}
.dark #view-server-records .server-record-card.is-expiring,.dark #view-server-records .server-record-card.is-expired{border-color:rgba(244,63,94,.42)}
#view-server-records .server-record-card.is-expiring:before,#view-server-records .server-record-card.is-expired:before{position:absolute;inset:0 0 auto;height:3px;background:#f43f5e;content:""}
#view-server-records .server-record-card-head{display:flex;align-items:flex-start;justify-content:space-between;gap:1rem}
#view-server-records .server-record-title{margin:0;font-size:1.125rem;line-height:1.5rem;font-weight:700;color:var(--record-text);overflow-wrap:anywhere}
#view-server-records .server-record-badges{display:flex;flex-wrap:wrap;gap:.4rem;margin-top:.65rem}
#view-server-records .server-record-badge{display:inline-flex;align-items:center;gap:.35rem;border-radius:9999px;padding:.25rem .55rem;font-size:.6875rem;line-height:1rem;font-weight:600}
#view-server-records .server-record-badge.tag{background:#f1f5f9;color:#475569}.dark #view-server-records .server-record-badge.tag{background:#1e293b;color:#cbd5e1}
#view-server-records .server-record-badge.online{background:#ecfdf5;color:#047857}.dark #view-server-records .server-record-badge.online{background:rgba(16,185,129,.12);color:#6ee7b7}
#view-server-records .server-record-badge.expiring,#view-server-records .server-record-badge.expired{background:#fff1f2;color:#e11d48}.dark #view-server-records .server-record-badge.expiring,.dark #view-server-records .server-record-badge.expired{background:rgba(244,63,94,.12);color:#fda4af}
#view-server-records .server-record-badge.valid,#view-server-records .server-record-badge.unset,#view-server-records .server-record-badge.not_checked{background:#f8fafc;color:#64748b}.dark #view-server-records .server-record-badge.valid,.dark #view-server-records .server-record-badge.unset,.dark #view-server-records .server-record-badge.not_checked{background:#111827;color:#94a3b8}
#view-server-records .server-record-badge.maintenance{background:#fffbeb;color:#b45309}.dark #view-server-records .server-record-badge.maintenance{background:rgba(245,158,11,.12);color:#fcd34d}
#view-server-records .server-record-badge.offline{background:#f1f5f9;color:#64748b}.dark #view-server-records .server-record-badge.offline{background:#1e293b;color:#94a3b8}
#view-server-records .server-record-dot{width:.4rem;height:.4rem;border-radius:9999px;background:currentColor}
#view-server-records .server-record-icon{display:flex;width:2.5rem;height:2.5rem;flex:0 0 2.5rem;align-items:center;justify-content:center;border-radius:9999px;background:var(--record-soft);color:#94a3b8}
#view-server-records .server-record-icon svg{width:1.125rem;height:1.125rem}
#view-server-records .server-record-icon.online{background:#ecfdf5;color:#059669}.dark #view-server-records .server-record-icon.online{background:rgba(16,185,129,.12);color:#6ee7b7}
#view-server-records .server-record-icon.offline{background:#fef2f2;color:#dc2626}.dark #view-server-records .server-record-icon.offline{background:rgba(239,68,68,.12);color:#fca5a5}
#view-server-records .server-record-metrics{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));margin-top:1.25rem;border-top:1px solid var(--record-border);border-bottom:1px solid var(--record-border);padding:1rem 0}
#view-server-records .server-record-metric{min-width:0;padding:0 .75rem;border-right:1px solid var(--record-border)}
#view-server-records .server-record-metric:first-child{padding-left:0}#view-server-records .server-record-metric:last-child{padding-right:0;border-right:0}
#view-server-records .server-record-metric-label{display:block;font-size:.6875rem;color:var(--record-muted)}
#view-server-records .server-record-metric-value{display:block;margin-top:.2rem;font-size:1rem;font-weight:650;color:var(--record-text);overflow:hidden;text-overflow:ellipsis}
#view-server-records .server-record-details{display:grid;gap:.75rem;margin-top:1rem}
#view-server-records .server-record-detail{display:flex;align-items:flex-start;justify-content:space-between;gap:1rem;font-size:.8125rem}
#view-server-records .server-record-detail-label{color:var(--record-muted)}#view-server-records .server-record-detail-value{max-width:65%;color:var(--record-text);font-weight:550;text-align:right;overflow-wrap:anywhere}
#view-server-records .server-record-detail-value.is-warning{color:#e11d48}
#view-server-records .server-record-expiry{display:grid;gap:.6rem;border:1px solid var(--record-border);border-radius:var(--ui-control-radius-px);background:var(--record-soft);padding:.8rem .9rem}
#view-server-records .server-record-expiry.is-warning{border-color:#fecdd3;background:#fff1f2}.dark #view-server-records .server-record-expiry.is-warning{border-color:rgba(244,63,94,.35);background:rgba(244,63,94,.08)}
#view-server-records .server-record-expiry-head,#view-server-records .server-record-expiry-body{display:flex;align-items:center;justify-content:space-between;gap:.75rem}
#view-server-records .server-record-expiry-label{font-size:.75rem;color:var(--record-muted)}
#view-server-records .server-record-expiry-mode{font-size:.6875rem;font-weight:650;color:var(--record-muted)}
#view-server-records .server-record-expiry-date{min-width:0;color:var(--record-text);font-size:.9375rem;line-height:1.25rem;overflow-wrap:anywhere}
#view-server-records .server-record-expiry-remaining{flex:0 0 auto;color:var(--record-text);font-size:.8125rem;font-weight:650}.server-record-expiry.is-warning .server-record-expiry-remaining{color:#e11d48}
#view-server-records .server-record-card-actions{display:grid;grid-template-columns:minmax(0,1fr) repeat(3,2.5rem);gap:.5rem;margin-top:auto;padding-top:1.25rem}
#view-server-records .server-record-card-actions.single{grid-template-columns:minmax(0,1fr)}
#view-server-records .server-record-icon-button{display:inline-flex;width:2.5rem;height:2.5rem;align-items:center;justify-content:center;border:1px solid var(--record-border);border-radius:var(--ui-control-radius-px);background:var(--record-surface);color:var(--record-muted)}
#view-server-records .server-record-icon-button:hover{border-color:#94a3b8;color:var(--record-text)}#view-server-records .server-record-icon-button.danger:hover{border-color:#fecaca;color:#dc2626;background:#fef2f2}
.dark #view-server-records .server-record-icon-button.danger:hover{border-color:rgba(239,68,68,.45);background:rgba(127,29,29,.18);color:#fca5a5}
#view-server-records button:disabled{cursor:not-allowed;opacity:.55;transform:none;box-shadow:none}
#view-server-records .server-record-empty{grid-column:1/-1;border:1px dashed var(--record-border);border-radius:var(--ui-radius-px);padding:3.5rem 1.5rem;text-align:center;color:var(--record-muted)}
#view-server-records .server-record-empty-icon{display:flex;width:3rem;height:3rem;margin:0 auto 1rem;align-items:center;justify-content:center;border-radius:9999px;background:var(--record-soft);color:#94a3b8}
#server-record-dialog{width:min(42rem,calc(100vw - 2rem));max-height:calc(100dvh - 2rem);overflow:auto;border:1px solid #e2e8f0;border-radius:var(--ui-radius-px,10px);background:#fff;padding:0;color:#0f172a;box-shadow:0 24px 64px rgba(15,23,42,.24)}
#server-record-dialog::backdrop{background:rgba(2,6,23,.64);backdrop-filter:blur(3px)}
.dark #server-record-dialog,#server-record-dialog.dark{border-color:#334155;background:#0f172a;color:#f8fafc}
#server-record-dialog .server-record-dialog-body{padding:1.25rem}
#server-record-dialog .server-record-dialog-head{display:flex;align-items:center;justify-content:space-between;gap:1rem;margin-bottom:1.25rem}
#server-record-dialog .server-record-dialog-title{font-size:1.125rem;font-weight:650}
#server-record-dialog .server-record-dialog-close{display:inline-flex;width:2.25rem;height:2.25rem;align-items:center;justify-content:center;border-radius:var(--ui-control-radius-px,10px);color:#64748b}
#server-record-dialog .server-record-dialog-close:hover{background:#f1f5f9;color:#0f172a}.dark #server-record-dialog .server-record-dialog-close:hover,#server-record-dialog.dark .server-record-dialog-close:hover{background:#1e293b;color:#fff}
#server-record-dialog .server-record-form-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:1rem}
#server-record-dialog .server-record-form-field{min-width:0}#server-record-dialog .server-record-form-field.span-2{grid-column:1/-1}
#server-record-dialog .server-record-expiry-toggle{display:flex;min-height:2.5rem;align-items:center;gap:.65rem;margin:0;padding:.65rem .75rem;border:1px solid #cbd5e1;border-radius:var(--ui-control-radius-px,10px);background:#f8fafc}.dark #server-record-dialog .server-record-expiry-toggle,#server-record-dialog.dark .server-record-expiry-toggle{border-color:#475569;background:#020617}
#server-record-dialog .server-record-expiry-toggle input{width:1rem;min-height:1rem;height:1rem;margin:0;accent-color:#2563eb}#server-record-dialog .server-record-expiry-toggle span{font-size:.8125rem;font-weight:650;color:#334155}.dark #server-record-dialog .server-record-expiry-toggle span,#server-record-dialog.dark .server-record-expiry-toggle span{color:#e2e8f0}
#server-record-dialog .server-record-expiry-settings{display:grid;gap:1rem;margin-top:.75rem}#server-record-dialog .server-record-expiry-settings[hidden]{display:none}
#server-record-dialog .server-record-expiry-modes{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:.25rem;border:1px solid #cbd5e1;border-radius:var(--ui-control-radius-px,10px);background:#f8fafc;padding:.25rem}.dark #server-record-dialog .server-record-expiry-modes,#server-record-dialog.dark .server-record-expiry-modes{border-color:#475569;background:#020617}
#server-record-dialog .server-record-expiry-mode{min-height:2.35rem;border-radius:max(7px,calc(var(--ui-control-radius-px,10px) - 3px));color:#64748b;font-size:.8125rem;font-weight:650}
#server-record-dialog .server-record-expiry-mode[aria-pressed="true"]{background:#fff;color:#1d4ed8;box-shadow:0 1px 3px rgba(15,23,42,.12)}.dark #server-record-dialog .server-record-expiry-mode[aria-pressed="true"],#server-record-dialog.dark .server-record-expiry-mode[aria-pressed="true"]{background:#1e293b;color:#93c5fd}
#server-record-dialog .server-record-expiry-pane[hidden]{display:none}
#server-record-dialog .server-record-days-input{position:relative}#server-record-dialog .server-record-days-input input{padding-right:3rem}#server-record-dialog .server-record-days-unit{position:absolute;right:.8rem;top:50%;transform:translateY(-50%);color:#64748b;font-size:.75rem;pointer-events:none}
#server-record-dialog label{display:block;margin-bottom:.35rem;font-size:.75rem;font-weight:600;color:#475569}.dark #server-record-dialog label,#server-record-dialog.dark label{color:#cbd5e1}
#server-record-dialog input,#server-record-dialog select{width:100%;min-height:2.5rem;border:1px solid #cbd5e1;border-radius:var(--ui-control-radius-px,10px);background:#fff;padding:.55rem .7rem;color:#0f172a;font-size:.8125rem;outline:none}.dark #server-record-dialog input,.dark #server-record-dialog select,#server-record-dialog.dark input,#server-record-dialog.dark select{border-color:#475569;background:#020617;color:#f8fafc}
#server-record-dialog select:disabled{cursor:not-allowed;opacity:.7}
#server-record-dialog input:focus,#server-record-dialog select:focus{border-color:#60a5fa;box-shadow:0 0 0 3px rgba(59,130,246,.12)}
#server-record-dialog .server-record-tag-picker{border:1px solid #cbd5e1;border-radius:var(--ui-control-radius-px,10px);background:#fff;padding:.55rem}.dark #server-record-dialog .server-record-tag-picker,#server-record-dialog.dark .server-record-tag-picker{border-color:#475569;background:#020617}
#server-record-dialog .server-record-tag-values{display:flex;min-height:1.75rem;flex-wrap:wrap;align-items:center;gap:.4rem;margin-bottom:.45rem}
#server-record-dialog .server-record-tag-placeholder{font-size:.75rem;color:#94a3b8}
#server-record-dialog .server-record-tag-chip{display:inline-flex;align-items:center;gap:.3rem;border-radius:9999px;background:#eff6ff;padding:.25rem .5rem;color:#1d4ed8;font-size:.75rem;font-weight:600}.dark #server-record-dialog .server-record-tag-chip,#server-record-dialog.dark .server-record-tag-chip{background:rgba(37,99,235,.16);color:#93c5fd}
#server-record-dialog .server-record-tag-chip svg{width:.75rem;height:.75rem}
#server-record-dialog [data-server-record-tag-input]{border:0;border-radius:0;padding:.35rem 0;box-shadow:none!important}
#server-record-dialog .server-record-tag-options{display:flex;flex-wrap:wrap;gap:.4rem;margin-top:.45rem;padding-top:.5rem;border-top:1px solid #e2e8f0}.dark #server-record-dialog .server-record-tag-options,#server-record-dialog.dark .server-record-tag-options{border-color:#334155}
#server-record-dialog .server-record-tag-option{display:inline-flex;align-items:center;gap:.35rem;border:1px solid #e2e8f0;border-radius:var(--ui-control-radius-px,10px);padding:.35rem .55rem;color:#64748b;font-size:.75rem}.dark #server-record-dialog .server-record-tag-option,#server-record-dialog.dark .server-record-tag-option{border-color:#334155;color:#94a3b8}
#server-record-dialog .server-record-tag-option.is-selected{border-color:#93c5fd;background:#eff6ff;color:#1d4ed8}.dark #server-record-dialog .server-record-tag-option.is-selected,#server-record-dialog.dark .server-record-tag-option.is-selected{border-color:#1d4ed8;background:rgba(37,99,235,.14);color:#93c5fd}
#server-record-dialog .server-record-tag-option svg{width:.875rem;height:.875rem}
#server-record-dialog .server-record-dialog-actions{display:flex;justify-content:flex-end;gap:.75rem;margin-top:1.25rem;padding-top:1rem;border-top:1px solid #e2e8f0}.dark #server-record-dialog .server-record-dialog-actions,#server-record-dialog.dark .server-record-dialog-actions{border-color:#334155}
#server-record-dialog .server-record-dialog-secondary,#server-record-dialog .server-record-dialog-submit{min-height:2.5rem;border-radius:var(--ui-control-radius-px,10px);padding:.6rem 1rem;font-size:.8125rem;font-weight:600}
#server-record-dialog .server-record-dialog-secondary{border:1px solid #cbd5e1;color:#475569}.dark #server-record-dialog .server-record-dialog-secondary,#server-record-dialog.dark .server-record-dialog-secondary{border-color:#475569;color:#cbd5e1}
#server-record-dialog .server-record-dialog-submit{background:#2563eb;color:#fff}#server-record-dialog .server-record-dialog-submit:hover{background:#1d4ed8}
@media(max-width:639px){#view-server-records .server-record-toolbar{align-items:stretch;flex-direction:column}#view-server-records .server-record-toolbar-actions{display:grid;grid-template-columns:2.5rem minmax(0,1fr)}#view-server-records .server-record-add{width:100%}#view-server-records .server-record-expiry-body{align-items:flex-start;flex-direction:column;gap:.35rem}#server-record-dialog .server-record-form-grid{grid-template-columns:minmax(0,1fr)}#server-record-dialog .server-record-form-field.span-2{grid-column:auto}}
</style>`;
const ADMIN_RUNTIME_ENHANCEMENT_SCRIPT = `<script data-admin-runtime-enhancements="1">
(() => {
  if (window.__ADMIN_RUNTIME_ENHANCEMENTS_READY__) return;
  window.__ADMIN_RUNTIME_ENHANCEMENTS_READY__ = true;

  const enqueue = typeof window.requestAnimationFrame === 'function'
    ? window.requestAnimationFrame.bind(window)
    : (callback) => window.setTimeout(callback, 16);
  const brandIconSvg = '<svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M7.25 5.75h9.5" stroke="currentColor" stroke-width="2.15" stroke-linecap="round"/><path d="M7.25 12h6.75" stroke="currentColor" stroke-width="2.15" stroke-linecap="round"/><path d="M7.25 18.25h9.5" stroke="currentColor" stroke-width="2.15" stroke-linecap="round"/><path d="M7.25 5.75v12.5" stroke="currentColor" stroke-width="2.15" stroke-linecap="round"/></svg>';
  const wikiTutorialUrl = 'https://wiki.8081666.xyz/新手教程';
  const serverRecordsHash = '#server-records';
  const serverRecordsStorageKey = 'cf-emby-proxy-ui:server-records:v1';
  const shellHookSelector = '[data-admin-toolbar-group="title"],[data-admin-toolbar-group="actions"],[data-admin-page-title="1"],[data-admin-brand-shell="1"],[data-admin-brand-title="1"],[data-admin-brand-mark="1"],#view-dashboard,#view-nodes,#view-server-records,#view-logs,#view-settings,#node-modal';
  let iconFrameId = 0;
  let shellFrameId = 0;
  let nodeModalWasOpen = false;
  let patchedSafetyContractApp = null;
  let patchedMediaAggregationNodeApp = null;
  let patchedServerRecordsApp = null;
  const dashboardTrafficState = {
    period: 'day',
    daily: null,
    monthly: null,
    pending: false
  };
  const dashboardLayerState = {
    loadSeq: 0,
    statsLoaded: false,
    runtimeLoaded: false,
    hotspotLoaded: false,
    statsLoading: false,
    runtimeLoading: false,
    hotspotLoading: false
  };
  const workerHtmlUpdateState = {
    root: null,
    workerFile: null,
    indexFile: null,
    submitting: false,
    status: '必须同时选择 worker.js 和 index.html。',
    tone: ''
  };
  const mediaAggregationState = {
    root: null,
    selected: new Set(),
    username: '',
    password: '',
    hasPassword: false,
    bidirectionalProgressEnabled: false,
    search: '',
    hydrated: false,
    loading: false,
    dirty: false,
    renderSignature: ''
  };
  const serverRecordsUiState = {
    records: [],
    availableNodes: [],
    legacyRecords: null,
    query: '',
    editingNodeName: '',
    legacyEditingId: '',
    draftTags: [],
    tagQuery: '',
    loaded: false,
    attempted: false,
    loading: false,
    refreshingAll: false,
    refreshingNodes: [],
    saving: false,
    error: ''
  };

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
      applyLayoutEnhancements();
      applySafetyContractEnhancements();
      syncServerRecordsShell(window.App);
      syncDashboardTrafficToggle(window.App);
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

  function ensureWikiToolbarLink(actionGroup, themeButton) {
    if (!actionGroup) return null;
    let wikiLink = actionGroup.querySelector('[data-admin-toolbar-action="wiki"]');
    if (!wikiLink) {
      wikiLink = document.createElement('a');
      wikiLink.setAttribute('data-admin-toolbar-action', 'wiki');
      wikiLink.setAttribute('href', wikiTutorialUrl);
      wikiLink.setAttribute('target', '_blank');
      wikiLink.setAttribute('rel', 'noopener noreferrer');
      wikiLink.innerHTML = '<i data-lucide="book-open" aria-hidden="true"></i>';
      actionGroup.insertBefore(wikiLink, themeButton || null);
    }
    wikiLink.setAttribute('title', '打开 WIKI 新手教程');
    wikiLink.setAttribute('aria-label', '打开 WIKI 新手教程');
    return wikiLink;
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
    ensureWikiToolbarLink(actionGroup, themeButton);
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

  function applyNodeToolbarLayout() {
    const search = document.querySelector('#node-search');
    const toolbarRow = search?.parentElement;
    const toolbarMain = toolbarRow?.parentElement;
    const toolbar = toolbarMain?.parentElement;
    if (!toolbarRow || !toolbarMain || !toolbar) return;
    toolbar.setAttribute('data-admin-node-toolbar', '1');
    toolbarMain.setAttribute('data-admin-node-toolbar-main', '1');
    toolbarRow.setAttribute('data-admin-node-toolbar-row', '1');
    const actionGroup = [...toolbar.children].find((child) => child !== toolbarMain) || null;
    actionGroup?.setAttribute('data-admin-node-toolbar-actions', '1');
  }

  function formatWorkerHtmlUploadBytes(bytes) {
    const value = Math.max(0, Number(bytes) || 0);
    return value >= 1024 * 1024
      ? (value / (1024 * 1024)).toFixed(2) + ' MiB'
      : Math.round(value / 1024) + ' KiB';
  }

  function validateWorkerHtmlUploadFiles(workerFile, indexFile) {
    if (!workerFile || !indexFile) return '必须同时选择 worker.js 和 index.html。';
    if (String(workerFile.name || '').trim().toLowerCase() !== 'worker.js') return 'Worker 文件名必须是 worker.js。';
    if (String(indexFile.name || '').trim().toLowerCase() !== 'index.html') return 'HTML 文件名必须是 index.html。';
    if (workerFile.size > 3 * 1024 * 1024) return 'worker.js 超过 3 MiB 上限。';
    if (indexFile.size > 2 * 1024 * 1024) return 'index.html 超过 2 MiB 上限。';
    return '';
  }

  function renderWorkerHtmlUpdateState() {
    const state = workerHtmlUpdateState;
    const root = state.root;
    if (!root) return;
    const workerMeta = root.querySelector('[data-admin-worker-file-meta="1"]');
    const indexMeta = root.querySelector('[data-admin-index-file-meta="1"]');
    const status = root.querySelector('[data-admin-worker-html-status="1"]');
    const submitButton = root.querySelector('[data-admin-worker-html-submit="1"]');
    const refreshButton = root.querySelector('[data-admin-worker-html-refresh="1"]');
    const workerInput = root.querySelector('[data-admin-worker-file-input="1"]');
    const indexInput = root.querySelector('[data-admin-index-file-input="1"]');
    const validationError = validateWorkerHtmlUploadFiles(state.workerFile, state.indexFile);
    if (workerMeta) workerMeta.textContent = state.workerFile ? state.workerFile.name + ' · ' + formatWorkerHtmlUploadBytes(state.workerFile.size) : '未选择';
    if (indexMeta) indexMeta.textContent = state.indexFile ? state.indexFile.name + ' · ' + formatWorkerHtmlUploadBytes(state.indexFile.size) : '未选择';
    if (status) {
      status.textContent = state.status || validationError || '两个文件已就绪。';
      status.classList.remove('border-rose-200', 'text-rose-700', 'border-emerald-200', 'text-emerald-700');
      if (state.tone === 'error') status.classList.add('border-rose-200', 'text-rose-700');
      if (state.tone === 'success') status.classList.add('border-emerald-200', 'text-emerald-700');
    }
    if (submitButton) {
      submitButton.disabled = state.submitting || Boolean(validationError);
      const label = submitButton.querySelector('span');
      if (label) label.textContent = state.submitting ? '更新中...' : '同时更新 Worker 和 HTML';
    }
    if (refreshButton) refreshButton.disabled = state.submitting;
    if (workerInput) workerInput.disabled = state.submitting;
    if (indexInput) indexInput.disabled = state.submitting;
    root.setAttribute('aria-busy', state.submitting ? 'true' : 'false');
  }

  async function submitWorkerHtmlUpdate(app) {
    const state = workerHtmlUpdateState;
    const validationError = validateWorkerHtmlUploadFiles(state.workerFile, state.indexFile);
    if (validationError || state.submitting) {
      state.status = validationError || '更新正在执行中。';
      state.tone = 'error';
      renderWorkerHtmlUpdateState();
      return;
    }
    const accepted = typeof app?.askConfirm === 'function'
      ? await app.askConfirm('将同时更新当前 Worker 脚本和管理台 HTML。两个文件必须来自同一版本。', {
          title: '确认 Worker 和 HTML 更新',
          tone: 'warning',
          confirmText: '开始更新'
        })
      : true;
    if (!accepted) return;

    state.submitting = true;
    state.status = '正在读取并校验两个文件...';
    state.tone = '';
    renderWorkerHtmlUpdateState();
    try {
      const fileContents = await Promise.all([state.workerFile.text(), state.indexFile.text()]);
      state.status = '正在更新 HTML 与 Worker...';
      renderWorkerHtmlUpdateState();
      const result = await app.apiCall('updateWorkerAndAdminIndex', {
        workerFileName: state.workerFile.name,
        workerScriptContent: fileContents[0],
        indexFileName: state.indexFile.name,
        indexHtml: fileContents[1]
      });
      if (result?.revisions && typeof app.applyAdminRevisions === 'function') app.applyAdminRevisions(result.revisions);
      state.workerFile = null;
      state.indexFile = null;
      const workerInput = state.root?.querySelector('[data-admin-worker-file-input="1"]');
      const indexInput = state.root?.querySelector('[data-admin-index-file-input="1"]');
      if (workerInput) workerInput.value = '';
      if (indexInput) indexInput.value = '';
      state.status = 'Worker 和 index.html 已同时更新。';
      state.tone = 'success';
      app.showMessage?.('Worker 和 HTML 已更新。', { tone: 'success' });
    } catch (error) {
      state.status = '更新失败：' + (error?.message || '未知错误');
      state.tone = 'error';
      app.showMessage?.(state.status, { tone: 'error', modal: true });
    } finally {
      state.submitting = false;
      renderWorkerHtmlUpdateState();
    }
  }

  function syncWorkerHtmlUpdatePanel(app = window.App) {
    const root = document.querySelector('#admin-worker-html-update-root');
    if (!root || !app) return;
    if (workerHtmlUpdateState.root !== root) {
      workerHtmlUpdateState.root = root;
      workerHtmlUpdateState.workerFile = null;
      workerHtmlUpdateState.indexFile = null;
      workerHtmlUpdateState.status = '必须同时选择 worker.js 和 index.html。';
      workerHtmlUpdateState.tone = '';
    }
    if (!root.dataset.adminWorkerHtmlReady) {
      root.dataset.adminWorkerHtmlReady = '1';
      root.innerHTML = '<div class="ui-block-head"><div><div class="ui-section-kicker">Runtime Update</div><div class="ui-section-title">Worker 和 HTML 更新</div></div><span class="ui-chip-muted">双文件</span></div>'
        + '<div data-admin-worker-html-grid="1">'
        + '<label data-admin-worker-html-file="1"><span class="ui-field-label">worker.js</span><input data-admin-worker-file-input="1" type="file" accept=".js,text/javascript,application/javascript"><span data-admin-worker-file-meta="1" class="text-xs text-slate-500">未选择</span></label>'
        + '<label data-admin-worker-html-file="1"><span class="ui-field-label">index.html</span><input data-admin-index-file-input="1" type="file" accept=".html,text/html"><span data-admin-index-file-meta="1" class="text-xs text-slate-500">未选择</span></label>'
        + '</div>'
        + '<div data-admin-worker-html-status="1" role="status" aria-live="polite" class="mt-4 rounded-control border border-slate-200 px-4 py-3 text-xs text-slate-600 dark:border-slate-700 dark:text-slate-300"></div>'
        + '<div data-admin-worker-html-actions="1" class="mt-4"><button data-admin-worker-html-refresh="1" type="button" class="settings-secondary-btn h-10 w-10" title="刷新当前页面" aria-label="刷新当前页面"><i data-lucide="refresh-cw" class="w-4 h-4" aria-hidden="true"></i></button><button data-admin-worker-html-submit="1" type="button" class="inline-flex items-center justify-center gap-2 px-4 py-2 bg-brand-600 hover:bg-brand-700 text-white rounded-xl text-sm transition disabled:opacity-50 disabled:pointer-events-none"><i data-lucide="upload-cloud" class="w-4 h-4" aria-hidden="true"></i><span>同时更新 Worker 和 HTML</span></button></div>';
      root.querySelector('[data-admin-worker-file-input="1"]')?.addEventListener('change', (event) => {
        workerHtmlUpdateState.workerFile = event.currentTarget.files?.[0] || null;
        workerHtmlUpdateState.status = validateWorkerHtmlUploadFiles(workerHtmlUpdateState.workerFile, workerHtmlUpdateState.indexFile) || '两个文件已就绪。';
        workerHtmlUpdateState.tone = validateWorkerHtmlUploadFiles(workerHtmlUpdateState.workerFile, workerHtmlUpdateState.indexFile) ? '' : 'success';
        renderWorkerHtmlUpdateState();
      });
      root.querySelector('[data-admin-index-file-input="1"]')?.addEventListener('change', (event) => {
        workerHtmlUpdateState.indexFile = event.currentTarget.files?.[0] || null;
        workerHtmlUpdateState.status = validateWorkerHtmlUploadFiles(workerHtmlUpdateState.workerFile, workerHtmlUpdateState.indexFile) || '两个文件已就绪。';
        workerHtmlUpdateState.tone = validateWorkerHtmlUploadFiles(workerHtmlUpdateState.workerFile, workerHtmlUpdateState.indexFile) ? '' : 'success';
        renderWorkerHtmlUpdateState();
      });
      root.querySelector('[data-admin-worker-html-refresh="1"]')?.addEventListener('click', () => window.location.reload());
      root.querySelector('[data-admin-worker-html-submit="1"]')?.addEventListener('click', () => submitWorkerHtmlUpdate(app));
      scheduleIconRefresh(root);
    }
    renderWorkerHtmlUpdateState();
  }

  function applySettingsLayout() {
    syncWorkerHtmlUpdatePanel(window.App);
  }

  function applyNodeAdvancedSettingsLayout() {
    const nodeModal = document.querySelector('#node-modal');
    const linesContainer = document.querySelector('#node-lines-container');
    const linesPanel = linesContainer?.closest('.rounded-2xl.border');
    const playbackInfoField = document.querySelector('#form-playback-info-mode');
    const advancedFields = playbackInfoField?.closest('.grid');
    const headersContainer = document.querySelector('#headers-container');
    const headersPanel = headersContainer?.parentElement;
    if (!linesPanel || !advancedFields || !headersPanel) return;
    linesPanel.setAttribute('data-admin-node-lines-panel', '1');

    let advancedSection = document.querySelector('[data-admin-node-advanced="1"]');
    if (!advancedSection) {
      advancedSection = document.createElement('details');
      advancedSection.setAttribute('data-admin-node-advanced', '1');
      advancedSection.open = true;
      advancedSection.innerHTML = '<summary><span>高级设置</span><i data-lucide="chevron-down" aria-hidden="true"></i></summary><div data-admin-node-advanced-content="1"></div>';
      linesPanel.insertAdjacentElement('afterend', advancedSection);
    }
    const content = advancedSection.querySelector('[data-admin-node-advanced-content="1"]');
    if (!content) return;
    const nodeModalIsOpen = !!nodeModal?.open;
    if (nodeModalIsOpen && !nodeModalWasOpen) advancedSection.open = true;
    nodeModalWasOpen = nodeModalIsOpen;
    advancedFields.setAttribute('data-admin-node-advanced-fields', '1');
    headersPanel.setAttribute('data-admin-node-advanced-headers', '1');
    if (advancedFields.parentElement !== content) content.appendChild(advancedFields);
    syncNodeMediaAggregationCredentialFields(window.App);
    if (headersPanel.parentElement !== content) content.appendChild(headersPanel);
  }

  function applyNodePrimaryFieldsLayout() {
    const entryMode = document.querySelector('#form-entry-mode');
    const displayName = document.querySelector('#form-display-name');
    const tag = document.querySelector('#form-tag');
    const remark = document.querySelector('#form-remark');
    const streamMode = document.querySelector('#form-main-video-stream-mode');
    const entryField = entryMode?.parentElement;
    const basicGrid = displayName?.parentElement?.parentElement;
    const metaGrid = tag?.closest('.grid.grid-cols-1');
    const streamField = streamMode?.parentElement;
    const streamPanel = streamField?.closest('.rounded-2xl.border');
    if (entryField && basicGrid) {
      entryField.setAttribute('data-admin-node-entry-field', '1');
      basicGrid.setAttribute('data-admin-node-basic-grid', '1');
      if (basicGrid.firstElementChild !== entryField) basicGrid.insertBefore(entryField, basicGrid.firstElementChild);
    }
    if (metaGrid && remark && streamField) {
      metaGrid.setAttribute('data-admin-node-meta-grid', '1');
      streamField.setAttribute('data-admin-node-stream-field', '1');
      const remarkField = remark.parentElement;
      if (streamField.parentElement !== metaGrid || remarkField?.nextElementSibling !== streamField) {
        remarkField?.insertAdjacentElement('afterend', streamField);
      }
    }
    streamPanel?.remove();
  }

  function applyLayoutEnhancements() {
    applyNodeToolbarLayout();
    applySettingsLayout();
    applyNodePrimaryFieldsLayout();
    applyNodeAdvancedSettingsLayout();
  }

  function normalizeAdminActionError(responsePayload, status) {
    const error = new Error(responsePayload?.error?.message || 'HTTP ' + status);
    error.code = responsePayload?.error?.code || null;
    error.status = status;
    return error;
  }

  async function callConfirmedAdminAction(app, action, payload, confirmAction) {
    const requestInit = {
      method: 'POST',
      credentials: 'same-origin',
      headers: {
        'Content-Type': 'application/json',
        'X-Admin-Confirm': confirmAction
      },
      body: JSON.stringify({ action, ...payload })
    };
    const adminPath = String(window.location?.pathname || '/admin');
    let response = await window.fetch(adminPath, requestInit);
    if (response.status === 401 && typeof app?.promptLogin === 'function') {
      await app.promptLogin();
      response = await window.fetch(adminPath, requestInit);
    }
    const responsePayload = await response.json().catch(() => ({}));
    if (!response.ok) throw normalizeAdminActionError(responsePayload, response.status);
    return responsePayload;
  }

  function getTidyResultGroups(result, key) {
    if (Array.isArray(result?.[key])) return result[key];
    return Array.isArray(result?.preview?.[key]) ? result.preview[key] : [];
  }

  function buildTidyExecutionResultMessage(app, result, summaryMessage, refreshIncomplete) {
    const groupDefinitions = [
      ['实际迁移字段', 'fieldGroups', true],
      ['实际删除', 'deleteGroups', false],
      ['实际重写', 'rewriteGroups', false],
      ['实际保留', 'preserveGroups', false]
    ];
    const lines = [summaryMessage];
    for (const [title, key, isFieldGroup] of groupDefinitions) {
      const groups = getTidyResultGroups(result, key);
      lines.push('', title + '：');
      if (!groups.length) {
        lines.push('• 无');
        continue;
      }
      for (const group of groups) {
        const formatter = isFieldGroup ? app.formatTidyFieldGroupText : app.formatTidyPreviewGroupText;
        lines.push(typeof formatter === 'function' ? formatter.call(app, group) : '• ' + String(group?.label || '未命名分组'));
      }
    }
    if (refreshIncomplete) {
      lines.push('', '设置或列表只完成了部分刷新，请手动刷新页面确认最新状态。');
    }
    return lines.join('\\n');
  }

  function collectD1ReadinessLines(status) {
    const readiness = status?.readiness && typeof status.readiness === 'object' ? status.readiness : {};
    const candidates = {
      ...(status?.tables && typeof status.tables === 'object' ? status.tables : {}),
      ...(status?.indexes && typeof status.indexes === 'object' ? status.indexes : {}),
      ...readiness
    };
    const lines = [];
    for (const [key, value] of Object.entries(candidates)) {
      if (typeof value === 'boolean') lines.push('• ' + key + '：' + (value ? '就绪' : '未就绪'));
      if (value && typeof value === 'object' && typeof value.ready === 'boolean') {
        lines.push('• ' + key + '：' + (value.ready ? '就绪' : '未就绪'));
      }
    }
    if (typeof status?.ftsReady === 'boolean' && !Object.prototype.hasOwnProperty.call(candidates, 'fts')) {
      lines.push('• FTS：' + (status.ftsReady ? '就绪' : '未就绪'));
    }
    return [...new Set(lines)];
  }

  function formatD1SchemaStatus(status = {}) {
    const appliedMigrations = Array.isArray(status?.appliedMigrations)
      ? status.appliedMigrations.map((item) => String(item?.name || item?.id || item || '').trim()).filter(Boolean)
      : [];
    const missingMigrations = Array.isArray(status?.missingMigrations)
      ? status.missingMigrations.map((item) => String(item?.name || item?.id || item || '').trim()).filter(Boolean)
      : [];
    const issues = Array.isArray(status?.issues)
      ? status.issues.map((item) => String(item || '').trim()).filter(Boolean)
      : [];
    const runtimeVersion = status?.runtimeCompatibilityVersion ?? '未知';
    const requiredMigration = String(status?.latestRequiredMigration || '未知');
    const lines = [
      '正式迁移：' + (status?.migrationReady === true ? '已就绪' : '未就绪'),
      '运行时兼容：' + (status?.runtimeCompatibilityReady === true ? '已就绪' : '未确认'),
      '运行时兼容版本：' + runtimeVersion,
      '最新要求迁移：' + requiredMigration,
      '已应用迁移：' + (appliedMigrations.length ? appliedMigrations.join('、') : '无或后端未返回'),
      '缺失迁移：' + (missingMigrations.length ? missingMigrations.join('、') : '无')
    ];
    const readinessLines = collectD1ReadinessLines(status);
    if (readinessLines.length) lines.push('', '结构就绪状态：', ...readinessLines);
    const columns = status?.columns && typeof status.columns === 'object' ? status.columns : {};
    const columnLines = [];
    for (const [tableName, tableColumns] of Object.entries(columns)) {
      if (!tableColumns || typeof tableColumns !== 'object') continue;
      for (const [columnName, ready] of Object.entries(tableColumns)) {
        if (typeof ready === 'boolean') columnLines.push('• ' + tableName + '.' + columnName + '：' + (ready ? '就绪' : '缺失'));
      }
    }
    if (columnLines.length) lines.push('', '列就绪状态：', ...columnLines);
    if (issues.length) lines.push('', '结构问题：', ...issues.map((issue) => '• ' + issue));
    return lines.join('\\n');
  }

  function getDashboardTrafficNodes() {
    const count = document.querySelector('#dash-traffic-count');
    const card = count?.closest?.('.glass-card') || null;
    if (!card) return {};
    return {
      card,
      label: card.querySelector('p'),
      count,
      hint: card.querySelector('#dash-traffic-hint'),
      badges: card.querySelector('#dash-traffic-meta'),
      detail: card.querySelector('#dash-traffic-detail'),
      toggle: card.querySelector('[data-dashboard-traffic-toggle="1"]')
    };
  }

  function snapshotDashboardTrafficCard(nodes = getDashboardTrafficNodes()) {
    if (!nodes.card || !nodes.count) return null;
    return {
      count: String(nodes.count.textContent || ''),
      hint: String(nodes.hint?.textContent || ''),
      title: String(nodes.count.getAttribute('title') || ''),
      detail: String(nodes.detail?.textContent || ''),
      badgeHtml: String(nodes.badges?.innerHTML || '')
    };
  }

  function renderDashboardTrafficBadges(nodes, badges = [], app = window.App) {
    if (!nodes.badges) return;
    nodes.badges.replaceChildren();
    const normalizedBadges = Array.isArray(badges) ? badges : [];
    for (const badge of normalizedBadges) {
      if (!badge?.label) continue;
      const span = document.createElement('span');
      span.className = 'px-2.5 py-1 rounded-full text-[11px] font-medium ' + (app?.getDashboardBadgeClass?.(badge.tone) || 'bg-slate-100 text-slate-600');
      span.textContent = String(badge.label);
      nodes.badges.appendChild(span);
    }
  }

  function renderDashboardTrafficCard(view = {}, period = 'day', app = window.App) {
    const nodes = getDashboardTrafficNodes();
    if (!nodes.card || !nodes.count) return false;
    nodes.label.textContent = period === 'month'
      ? '本月视频流量 (CF Zone 总流量)'
      : '今日视频流量 (CF Zone 总流量)';
    nodes.count.textContent = String(view.count || '0 B');
    nodes.count.setAttribute('title', String(view.title || ''));
    if (nodes.hint) {
      nodes.hint.textContent = String(view.hint || '\u00a0');
      nodes.hint.setAttribute('title', String(view.title || ''));
    }
    if (nodes.detail) nodes.detail.textContent = String(view.detail || ' ');
    if (view.badgeHtml !== undefined && nodes.badges) nodes.badges.innerHTML = String(view.badgeHtml || '');
    else renderDashboardTrafficBadges(nodes, view.badges, app);
    return true;
  }

  function buildMonthlyTrafficCardView(payload = {}, app = window.App) {
    const title = [
      payload.trafficSourceText,
      payload.cfAnalyticsStatus,
      payload.cfAnalyticsError,
      payload.cfAnalyticsDetail,
      payload.warning
    ].filter(Boolean).join(' | ');
    const statusBadge = app?.getTrafficStatusBadge?.(payload) || {
      label: payload.cfAnalyticsLoaded ? '流量状态: Cloudflare 正常' : '流量状态: 查询失败',
      tone: payload.cfAnalyticsLoaded ? 'emerald' : 'red'
    };
    const freshnessBadge = app?.getStatsFreshnessBadge?.(payload) || {
      label: payload.cacheStatus === 'cache' ? '月统计: 缓存命中' : '月统计: 实时汇总',
      tone: payload.cacheStatus === 'cache' ? 'blue' : 'emerald'
    };
    return {
      count: payload.traffic || '0 B',
      hint: payload.trafficSourceText || payload.cfAnalyticsStatus || payload.cfAnalyticsError || '\u00a0',
      title,
      detail: [payload.cfAnalyticsStatus, payload.cfAnalyticsError, payload.cfAnalyticsDetail, payload.warning].filter(Boolean).join('\\n') || ' ',
      badges: [statusBadge, freshnessBadge]
    };
  }

  function updateDashboardTrafficToggleButton(nodes = getDashboardTrafficNodes()) {
    const button = nodes.toggle;
    if (!button) return;
    const showingMonth = dashboardTrafficState.period === 'month';
    const nextLabel = showingMonth ? '切换为今日流量' : '切换为本月流量';
    button.title = nextLabel;
    button.setAttribute('aria-label', nextLabel);
    button.setAttribute('aria-pressed', showingMonth ? 'true' : 'false');
    button.setAttribute('aria-busy', dashboardTrafficState.pending ? 'true' : 'false');
    button.disabled = dashboardTrafficState.pending;
    const icon = button.querySelector('i,svg');
    if (icon) icon.classList.toggle('animate-spin', dashboardTrafficState.pending);
  }

  async function toggleDashboardTrafficPeriod(app = window.App) {
    if (!app || dashboardTrafficState.pending) return;
    if (dashboardTrafficState.period === 'month') {
      dashboardTrafficState.period = 'day';
      if (dashboardTrafficState.daily) renderDashboardTrafficCard(dashboardTrafficState.daily, 'day', app);
      updateDashboardTrafficToggleButton();
      return;
    }

    dashboardTrafficState.daily = snapshotDashboardTrafficCard() || dashboardTrafficState.daily;
    dashboardTrafficState.period = 'month';
    if (dashboardTrafficState.monthly) {
      renderDashboardTrafficCard(dashboardTrafficState.monthly, 'month', app);
      updateDashboardTrafficToggleButton();
      return;
    }

    dashboardTrafficState.pending = true;
    renderDashboardTrafficCard({
      count: '加载中...',
      hint: '正在汇总本月 CF Zone 流量',
      title: '本月流量按需加载',
      detail: ' ',
      badges: [{ label: '月统计: 加载中', tone: 'slate' }]
    }, 'month', app);
    updateDashboardTrafficToggleButton();
    try {
      const payload = await app.apiCall('getMonthlyTrafficStats');
      dashboardTrafficState.monthly = buildMonthlyTrafficCardView(payload, app);
      if (dashboardTrafficState.period === 'month') {
        renderDashboardTrafficCard(dashboardTrafficState.monthly, 'month', app);
      }
    } catch (error) {
      dashboardTrafficState.monthly = {
        count: '加载失败',
        hint: '本月流量查询失败',
        title: String(error?.message || '未知错误'),
        detail: String(error?.message || '未知错误'),
        badges: [{ label: '月统计: 查询失败', tone: 'red' }]
      };
      if (dashboardTrafficState.period === 'month') {
        renderDashboardTrafficCard(dashboardTrafficState.monthly, 'month', app);
      }
      app.showMessage?.('本月流量查询失败: ' + (error?.message || '未知错误'), { tone: 'error' });
    } finally {
      dashboardTrafficState.pending = false;
      updateDashboardTrafficToggleButton();
      scheduleIconRefresh(getDashboardTrafficNodes().card || document.body);
    }
  }

  function syncDashboardTrafficToggle(app = window.App) {
    const nodes = getDashboardTrafficNodes();
    if (!app || !nodes.card || !nodes.count) return;
    nodes.card.setAttribute('data-dashboard-traffic-card', '1');
    nodes.label?.setAttribute('data-dashboard-traffic-label', '1');
    if (!nodes.toggle) {
      const button = document.createElement('button');
      button.type = 'button';
      button.setAttribute('data-dashboard-traffic-toggle', '1');
      button.innerHTML = '<i data-lucide="repeat-2" aria-hidden="true"></i>';
      button.addEventListener('click', () => toggleDashboardTrafficPeriod(app));
      nodes.card.appendChild(button);
      nodes.toggle = button;
      scheduleIconRefresh(nodes.card);
    }
    if (dashboardTrafficState.period === 'day' && !dashboardTrafficState.pending) {
      dashboardTrafficState.daily = snapshotDashboardTrafficCard(nodes) || dashboardTrafficState.daily;
      if (String(nodes.label?.textContent || '') !== '今日视频流量 (CF Zone 总流量)') {
        nodes.label.textContent = '今日视频流量 (CF Zone 总流量)';
      }
    } else if (dashboardTrafficState.period === 'month' && dashboardTrafficState.monthly) {
      const monthlyCount = String(dashboardTrafficState.monthly.count || '0 B');
      if (
        String(nodes.count.textContent || '') !== monthlyCount
        || String(nodes.label?.textContent || '') !== '本月视频流量 (CF Zone 总流量)'
      ) {
        renderDashboardTrafficCard(dashboardTrafficState.monthly, 'month', app);
      }
    }
    updateDashboardTrafficToggleButton(nodes);
  }

  function escapeServerRecordHtml(value = '') {
    return String(value ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#39;');
  }

  function normalizeServerRecordTags(values = []) {
    const source = Array.isArray(values) ? values : String(values || '').split(/[,，\\r\\n]+/);
    const tags = [];
    const seen = new Set();
    for (const value of source) {
      const tag = String(value || '').trim().slice(0, 24);
      const key = tag.toLowerCase();
      if (!tag || seen.has(key)) continue;
      seen.add(key);
      tags.push(tag);
      if (tags.length >= 20) break;
    }
    return tags;
  }

  function normalizeServerRecord(rawRecord = {}) {
    const source = rawRecord && typeof rawRecord === 'object' && !Array.isArray(rawRecord) ? rawRecord : {};
    const runtime = source.runtime && typeof source.runtime === 'object' ? source.runtime : {};
    const counts = source.counts && typeof source.counts === 'object' ? source.counts : {};
    const watch = source.watch && typeof source.watch === 'object' ? source.watch : {};
    const hasExplicitExpiryEnabled = typeof source.expiryEnabled === 'boolean' || typeof source.expiry?.enabled === 'boolean';
    const expiryEnabled = hasExplicitExpiryEnabled
      ? source.expiryEnabled === true || source.expiry?.enabled === true
      : Boolean(String(source.expiresAt || '').trim());
    return {
      nodeName: String(source.nodeName || source.name || '').trim().toLowerCase(),
      displayName: String(source.displayName || source.name || source.nodeName || '').trim().slice(0, 80),
      accessUrl: String(source.accessUrl || source.url || '').trim().slice(0, 2048),
      tags: normalizeServerRecordTags(source.tags || source.tag),
      expiryEnabled,
      expiryMode: String(source.expiryMode || source.expiry?.mode || (source.expiresAt ? 'fixed' : 'rolling')).trim().toLowerCase() === 'fixed' ? 'fixed' : 'rolling',
      expiresAt: String(source.expiresAt || '').trim().slice(0, 10),
      expiryDays: Number.isInteger(Number(source.expiryDays ?? source.expiry?.expiryDays))
        ? Math.max(1, Math.min(3650, Number(source.expiryDays ?? source.expiry?.expiryDays)))
        : 30,
      runtime: {
        state: String(runtime.state || source.state || 'offline').trim().toLowerCase(),
        latencyMs: Number.isFinite(Number(runtime.latencyMs)) ? Math.max(0, Math.round(Number(runtime.latencyMs))) : null,
        version: String(runtime.version || '').trim(),
        checkedAt: String(runtime.checkedAt || '').trim(),
        errorCode: String(runtime.errorCode || '').trim()
      },
      counts: {
        movies: Number.isFinite(Number(counts.movies ?? source.movies)) ? Math.max(0, Math.round(Number(counts.movies ?? source.movies))) : null,
        series: Number.isFinite(Number(counts.series ?? source.series)) ? Math.max(0, Math.round(Number(counts.series ?? source.series))) : null,
        episodes: Number.isFinite(Number(counts.episodes ?? source.episodes)) ? Math.max(0, Math.round(Number(counts.episodes ?? source.episodes))) : null,
        state: String(counts.state || 'unavailable').trim(),
        errors: counts.errors && typeof counts.errors === 'object' ? counts.errors : {}
      },
      watch: {
        lastWatchedAt: String(watch.lastWatchedAt || source.lastWatched || '').trim(),
        state: String(watch.state || 'unavailable').trim()
      },
      expiry: {
        enabled: expiryEnabled,
        state: String(source.expiry?.state || '').trim().toLowerCase(),
        daysRemaining: source.expiry?.daysRemaining !== null
          && source.expiry?.daysRemaining !== undefined
          && source.expiry?.daysRemaining !== ''
          && Number.isInteger(Number(source.expiry.daysRemaining))
          ? Number(source.expiry.daysRemaining)
          : null,
        expiresAt: String(source.expiry?.expiresAt || '').trim(),
        source: String(source.expiry?.source || '').trim(),
        mode: String(source.expiry?.mode || source.expiryMode || '').trim().toLowerCase(),
        expiryDays: source.expiry?.expiryDays !== null
          && source.expiry?.expiryDays !== undefined
          && Number.isInteger(Number(source.expiry.expiryDays))
          ? Number(source.expiry.expiryDays)
          : null
      }
    };
  }

  function normalizeLegacyServerRecord(rawRecord = {}) {
    const source = rawRecord && typeof rawRecord === 'object' && !Array.isArray(rawRecord) ? rawRecord : {};
    return {
      id: String(source.id || '').trim() || 'legacy-' + Math.random().toString(36).slice(2, 10),
      name: String(source.name || '').trim().slice(0, 80),
      url: String(source.url || '').trim().slice(0, 2048),
      tags: normalizeServerRecordTags(source.tags || source.tag),
      expiresAt: String(source.expiresAt || '').trim().slice(0, 10)
    };
  }

  function getServerRecordSelectableNodes(availableNodes = [], source = null, legacyRecord = null) {
    const nodes = Array.isArray(availableNodes) ? availableNodes : [];
    if (legacyRecord) return nodes;
    return nodes.filter((node) => !node.enabled || node.nodeName === source?.nodeName);
  }

  function buildServerRecordDialogDraft(availableNodes = [], source = null, legacyRecord = null, nodeName = '') {
    if (source) {
      return {
        tags: normalizeServerRecordTags(source.tags),
        expiryEnabled: source.expiryEnabled === true,
        expiryMode: source.expiryMode === 'fixed' ? 'fixed' : 'rolling',
        expiresAt: String(source.expiresAt || '').trim(),
        expiryDays: Math.max(1, Math.min(3650, Number(source.expiryDays) || 30))
      };
    }
    const normalizedNodeName = String(nodeName || '').trim().toLowerCase();
    const selectedNode = (Array.isArray(availableNodes) ? availableNodes : [])
      .find((node) => node.nodeName === normalizedNodeName) || null;
    return {
      tags: normalizeServerRecordTags([...(selectedNode?.tags || []), ...(legacyRecord?.tags || [])]),
      expiryEnabled: selectedNode?.expiryEnabled === true || Boolean(legacyRecord?.expiresAt),
      expiryMode: String(selectedNode?.expiryMode || (selectedNode?.expiresAt || legacyRecord?.expiresAt ? 'fixed' : 'rolling')) === 'fixed' ? 'fixed' : 'rolling',
      expiresAt: String(selectedNode?.expiresAt || legacyRecord?.expiresAt || '').trim(),
      expiryDays: Math.max(1, Math.min(3650, Number(selectedNode?.expiryDays) || 30))
    };
  }

  function readLegacyServerRecords() {
    if (Array.isArray(serverRecordsUiState.legacyRecords)) return serverRecordsUiState.legacyRecords;
    try {
      const parsed = JSON.parse(window.localStorage?.getItem(serverRecordsStorageKey) || '[]');
      serverRecordsUiState.legacyRecords = (Array.isArray(parsed) ? parsed : [])
        .map((record) => normalizeLegacyServerRecord(record))
        .filter((record) => record.name);
    } catch (error) {
      console.warn('read legacy server records failed', error);
      serverRecordsUiState.legacyRecords = [];
    }
    return serverRecordsUiState.legacyRecords;
  }

  function persistLegacyServerRecords(app) {
    try {
      const records = readLegacyServerRecords();
      if (records.length) window.localStorage?.setItem(serverRecordsStorageKey, JSON.stringify(records));
      else window.localStorage?.removeItem(serverRecordsStorageKey);
      return true;
    } catch (error) {
      console.error('persist legacy server records failed', error);
      app?.showMessage?.('旧服务器记录迁移状态无法保存。', { tone: 'warning' });
      return false;
    }
  }

  function serverRecordUrlKey(value = '') {
    try {
      const url = new URL(String(value || '').trim());
      url.hash = '';
      return url.toString().replace(/\\/+$/, '').toLowerCase();
    } catch {
      return '';
    }
  }

  async function migrateLegacyServerRecords(app) {
    if (serverRecordsUiState.migrationRunning) return false;
    const legacyRecords = readLegacyServerRecords();
    if (!legacyRecords.length || !serverRecordsUiState.availableNodes.length) return false;
    serverRecordsUiState.migrationRunning = true;
    const migratedIds = new Set();
    try {
      for (const legacy of legacyRecords) {
        const legacyName = legacy.name.toLowerCase();
        const legacyUrl = serverRecordUrlKey(legacy.url);
        const matches = serverRecordsUiState.availableNodes.filter((node) => {
          const nameMatch = legacyName && [node.nodeName, node.displayName.toLowerCase()].includes(legacyName);
          const urlMatch = legacyUrl && serverRecordUrlKey(node.accessUrl) === legacyUrl;
          return nameMatch || urlMatch;
        });
        if (matches.length !== 1) continue;
        const node = matches[0];
        await app.apiCall('saveServerRecordSettings', {
          nodeName: node.nodeName,
          enabled: true,
          tags: normalizeServerRecordTags([...(node.tags || []), ...legacy.tags]),
          expiryEnabled: node.expiryEnabled === true || Boolean(node.expiresAt || legacy.expiresAt),
          expiryMode: node.expiryMode || (node.expiresAt || legacy.expiresAt ? 'fixed' : 'rolling'),
          expiresAt: node.expiresAt || legacy.expiresAt || '',
          expiryDays: Number(node.expiryDays) || 30
        });
        migratedIds.add(legacy.id);
      }
    } catch (error) {
      console.warn('legacy server record migration paused', error);
    } finally {
      serverRecordsUiState.migrationRunning = false;
    }
    if (!migratedIds.size) return false;
    serverRecordsUiState.legacyRecords = legacyRecords.filter((record) => !migratedIds.has(record.id));
    persistLegacyServerRecords(app);
    return true;
  }

  function normalizeAvailableServerRecordNode(node = {}) {
    return {
      nodeName: String(node?.nodeName || '').trim().toLowerCase(),
      displayName: String(node?.displayName || node?.nodeName || '').trim(),
      accessUrl: String(node?.accessUrl || '').trim(),
      tags: normalizeServerRecordTags(node?.tags),
      enabled: node?.enabled === true,
      expiryEnabled: node?.expiryEnabled === true,
      expiryMode: String(node?.expiryMode || (node?.expiresAt ? 'fixed' : 'rolling')).trim().toLowerCase() === 'fixed' ? 'fixed' : 'rolling',
      expiresAt: String(node?.expiresAt || '').trim(),
      expiryDays: Math.max(1, Math.min(3650, Number(node?.expiryDays) || 30))
    };
  }

  async function loadServerRecords(app, options = {}) {
    if (!app || serverRecordsUiState.loading) return;
    const forceRefresh = options.forceRefresh === true;
    serverRecordsUiState.attempted = true;
    serverRecordsUiState.loading = true;
    serverRecordsUiState.refreshingAll = forceRefresh;
    serverRecordsUiState.error = '';
    renderServerRecordsView(app);
    const refreshButton = document.querySelector('[data-server-record-refresh]');
    refreshButton?.setAttribute('aria-busy', 'true');
    if (refreshButton) refreshButton.disabled = true;
    try {
      const result = await app.apiCall('getServerRecordsSnapshot', { forceRefresh });
      const previousRecords = new Map(serverRecordsUiState.records.map((record) => [record.nodeName, record]));
      serverRecordsUiState.records = (Array.isArray(result?.records) ? result.records : []).map(normalizeServerRecord).filter((record) => record.nodeName).map((record) => {
        const previous = previousRecords.get(record.nodeName);
        if (forceRefresh || record.runtime.state !== 'not_checked' || !previous || previous.runtime.state === 'not_checked') return record;
        return { ...record, runtime: previous.runtime, counts: previous.counts };
      });
      serverRecordsUiState.availableNodes = (Array.isArray(result?.availableNodes) ? result.availableNodes : []).map(normalizeAvailableServerRecordNode).filter((node) => node.nodeName);
      serverRecordsUiState.loaded = true;
      if (options.skipMigration !== true && await migrateLegacyServerRecords(app)) {
        serverRecordsUiState.loading = false;
        return await loadServerRecords(app, { skipMigration: true });
      }
    } catch (error) {
      console.error('load server records failed', error);
      serverRecordsUiState.error = error?.message || '服务器记录加载失败';
    } finally {
      serverRecordsUiState.loading = false;
      serverRecordsUiState.refreshingAll = false;
      refreshButton?.removeAttribute('aria-busy');
      if (refreshButton) refreshButton.disabled = false;
      renderServerRecordsView(app);
    }
  }

  async function refreshSingleServerRecord(app, nodeName = '') {
    const normalizedNodeName = String(nodeName || '').trim().toLowerCase();
    if (!app || !normalizedNodeName || serverRecordsUiState.loading || serverRecordsUiState.refreshingAll || serverRecordsUiState.refreshingNodes.includes(normalizedNodeName)) return;
    serverRecordsUiState.refreshingNodes = [...serverRecordsUiState.refreshingNodes, normalizedNodeName];
    renderServerRecordsView(app);
    try {
      const result = await app.apiCall('getServerRecordsSnapshot', { forceRefresh: true, nodeName: normalizedNodeName });
      const refreshed = (Array.isArray(result?.records) ? result.records : [])
        .map(normalizeServerRecord)
        .find((record) => record.nodeName === normalizedNodeName);
      if (refreshed) {
        serverRecordsUiState.records = serverRecordsUiState.records.map((record) => record.nodeName === normalizedNodeName ? refreshed : record);
      }
      if (Array.isArray(result?.availableNodes)) {
        serverRecordsUiState.availableNodes = result.availableNodes.map(normalizeAvailableServerRecordNode).filter((node) => node.nodeName);
      }
    } catch (error) {
      console.error('refresh server record failed', error);
      app?.showMessage?.('资源统计刷新失败：' + (error?.message || '未知错误'), { tone: 'error' });
    } finally {
      serverRecordsUiState.refreshingNodes = serverRecordsUiState.refreshingNodes.filter((name) => name !== normalizedNodeName);
      renderServerRecordsView(app);
    }
  }

  function getServerRecordExpiryStatus(record = {}) {
    if (record.expiryEnabled !== true || record.expiry?.enabled === false || record.expiry?.state === 'disabled') {
      return { key: 'disabled', label: '未启用', days: null, expiresAt: '', mode: record.expiryMode || 'rolling', expiryDays: record.expiryDays || 30 };
    }
    if (record.expiry && record.expiry.state) {
      return {
        key: ['expired', 'expiring', 'valid', 'unset'].includes(record.expiry.state) ? record.expiry.state : 'unset',
        label: record.expiry.state === 'expired' ? '已到期' : (record.expiry.state === 'expiring' ? '即将到期' : (record.expiry.state === 'valid' ? '有效' : '未设置到期')),
        days: Number.isInteger(record.expiry.daysRemaining) ? record.expiry.daysRemaining : null,
        expiresAt: record.expiry.expiresAt || record.expiresAt || '',
        mode: record.expiry.mode || record.expiryMode || 'rolling',
        expiryDays: Number.isInteger(record.expiry.expiryDays) ? record.expiry.expiryDays : record.expiryDays
      };
    }
    if (record.expiresAt) {
      const expiry = new Date(record.expiresAt + 'T00:00:00');
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      if (!Number.isNaN(expiry.getTime())) {
        const days = Math.ceil((expiry.getTime() - today.getTime()) / 86400000);
        if (days < 0) return { key: 'expired', label: '已到期', days, expiresAt: record.expiresAt, mode: 'fixed', expiryDays: null };
        if (days <= 7) return { key: 'expiring', label: '即将到期', days, expiresAt: record.expiresAt, mode: 'fixed', expiryDays: null };
        return { key: 'valid', label: '有效', days, expiresAt: record.expiresAt, mode: 'fixed', expiryDays: null };
      }
    }
    return { key: 'unset', label: '未设置到期', days: null, expiresAt: '', mode: record.expiryMode || 'rolling', expiryDays: record.expiryDays || 30 };
  }

  function getServerRecordRuntimeStatus(record = {}) {
    const states = {
      online: ['online', '在线'],
      maintenance: ['maintenance', '维护中'],
      shutting_down: ['maintenance', '正在关机'],
      unauthorized: ['offline', '认证失败'],
      timeout: ['offline', '连接超时'],
      not_checked: ['not_checked', '未检测'],
      offline: ['offline', '离线']
    };
    const state = states[String(record?.runtime?.state || '').trim()] || states.offline;
    return { key: state[0], label: state[1] };
  }

  function formatServerRecordNumber(value) {
    return value === null || value === undefined ? '--' : new Intl.NumberFormat('zh-CN').format(Number(value) || 0);
  }

  function formatServerRecordDateTime(value = '') {
    if (!value) return '未记录';
    const date = new Date(value);
    return Number.isNaN(date.getTime()) ? String(value) : date.toLocaleString('zh-CN', { hour12: false, year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' });
  }

  function formatServerRecordExpiry(record, status) {
    const expiryDate = String(status?.expiresAt || record?.expiresAt || '').trim();
    if (!expiryDate) return '未设置';
    if (!Number.isFinite(status.days)) return expiryDate;
    if (status.days < 0) return '已过期 ' + Math.abs(status.days) + ' 天';
    if (status.days === 0) return '今天到期';
    return status.days + ' 天过期';
  }

  function formatServerRecordExpiryMode(status = {}) {
    return status.mode === 'fixed'
      ? '固定日期'
      : '滚动 ' + (Number(status.expiryDays) || 30) + ' 天';
  }

  function isSafeServerRecordUrl(value = '') {
    try {
      const url = new URL(String(value || '').trim());
      return url.protocol === 'http:' || url.protocol === 'https:';
    } catch {
      return false;
    }
  }

  function buildServerRecordCard(record) {
    const expiry = getServerRecordExpiryStatus(record);
    const runtime = getServerRecordRuntimeStatus(record);
    const expiryEnabled = record.expiryEnabled === true && expiry.key !== 'disabled';
    const refreshing = serverRecordsUiState.refreshingAll || serverRecordsUiState.refreshingNodes.includes(record.nodeName);
    const canOpen = isSafeServerRecordUrl(record.accessUrl);
    const tags = record.tags.map((tag) => '<span class="server-record-badge tag">' + escapeServerRecordHtml(tag) + '</span>').join('');
    const expiryBadge = expiryEnabled ? '<span class="server-record-badge ' + escapeServerRecordHtml(expiry.key) + '">' + escapeServerRecordHtml(expiry.label) + '</span>' : '';
    const warningClass = expiryEnabled && (expiry.key === 'expired' || expiry.key === 'expiring') ? ' is-warning' : '';
    const countTitle = record.counts.state === 'partial' ? '部分媒体统计读取失败' : record.counts.state === 'unavailable' ? '尚未手动刷新或媒体统计不可用' : '';
    const lastWatchedText = record.watch.state === 'ok' ? formatServerRecordDateTime(record.watch.lastWatchedAt) : '数据不可用';
    const expiryDateText = expiry.expiresAt || '等待播放记录';
    const expirySection = expiryEnabled ? '<div class="server-record-expiry' + warningClass + '"><div class="server-record-expiry-head"><span class="server-record-expiry-label">预计过期</span><span class="server-record-expiry-mode">' + escapeServerRecordHtml(formatServerRecordExpiryMode(expiry)) + '</span></div><div class="server-record-expiry-body"><strong class="server-record-expiry-date">' + escapeServerRecordHtml(expiryDateText) + '</strong><span class="server-record-expiry-remaining">' + escapeServerRecordHtml(formatServerRecordExpiry(record, expiry)) + '</span></div></div>' : '';
    return '<article class="server-record-card' + (expiryEnabled ? ' is-' + expiry.key : '') + '" data-server-record-card="' + escapeServerRecordHtml(record.nodeName) + '">'
      + '<div class="server-record-card-head"><div><h3 class="server-record-title">' + escapeServerRecordHtml(record.displayName) + '</h3><div class="server-record-badges">' + tags + '<span class="server-record-badge ' + runtime.key + '"><span class="server-record-dot" aria-hidden="true"></span>' + escapeServerRecordHtml(runtime.label) + '</span>' + expiryBadge + '</div></div><span class="server-record-icon ' + runtime.key + '" title="服务器状态：' + escapeServerRecordHtml(runtime.label) + '" aria-label="服务器状态：' + escapeServerRecordHtml(runtime.label) + '"><i data-lucide="server-cog" aria-hidden="true"></i></span></div>'
      + '<div class="server-record-metrics" aria-label="媒体库统计" title="' + escapeServerRecordHtml(countTitle) + '"><div class="server-record-metric"><span class="server-record-metric-label">电影</span><span class="server-record-metric-value">' + formatServerRecordNumber(record.counts.movies) + '</span></div><div class="server-record-metric"><span class="server-record-metric-label">剧集</span><span class="server-record-metric-value">' + formatServerRecordNumber(record.counts.series) + '</span></div><div class="server-record-metric"><span class="server-record-metric-label">单集</span><span class="server-record-metric-value">' + formatServerRecordNumber(record.counts.episodes) + '</span></div></div>'
      + '<div class="server-record-details"><div class="server-record-detail"><span class="server-record-detail-label">上次观看</span><span class="server-record-detail-value">' + escapeServerRecordHtml(lastWatchedText) + '</span></div>' + expirySection + '</div>'
      + '<div class="server-record-card-actions"><button type="button" class="server-record-primary" data-server-record-open="' + escapeServerRecordHtml(record.nodeName) + '"' + (canOpen ? '' : ' disabled') + '><i data-lucide="play" class="w-4 h-4" aria-hidden="true"></i>打开服务器</button><button type="button" class="server-record-icon-button" data-server-record-refresh-one="' + escapeServerRecordHtml(record.nodeName) + '" title="刷新此服务器的资源统计和预计过期" aria-label="刷新 ' + escapeServerRecordHtml(record.displayName) + ' 的资源统计和预计过期"' + (refreshing ? ' disabled aria-busy="true"' : '') + '><i data-lucide="' + (refreshing ? 'loader-circle' : 'refresh-cw') + '" class="w-4 h-4' + (refreshing ? ' animate-spin' : '') + '" aria-hidden="true"></i></button><button type="button" class="server-record-icon-button" data-server-record-edit="' + escapeServerRecordHtml(record.nodeName) + '" title="编辑记录" aria-label="编辑 ' + escapeServerRecordHtml(record.displayName) + '"><i data-lucide="pencil" class="w-4 h-4" aria-hidden="true"></i></button><button type="button" class="server-record-icon-button danger" data-server-record-delete="' + escapeServerRecordHtml(record.nodeName) + '" title="移除记录" aria-label="移除 ' + escapeServerRecordHtml(record.displayName) + '"><i data-lucide="trash-2" class="w-4 h-4" aria-hidden="true"></i></button></div></article>';
  }

  function buildLegacyServerRecordCard(record) {
    return '<article class="server-record-card is-legacy" data-server-record-legacy-card="' + escapeServerRecordHtml(record.id) + '"><div class="server-record-card-head"><div><h3 class="server-record-title">' + escapeServerRecordHtml(record.name) + '</h3><div class="server-record-badges"><span class="server-record-badge maintenance">待关联</span>' + record.tags.map((tag) => '<span class="server-record-badge tag">' + escapeServerRecordHtml(tag) + '</span>').join('') + '</div></div><span class="server-record-icon"><i data-lucide="unplug" aria-hidden="true"></i></span></div><div class="server-record-details"><div class="server-record-detail"><span class="server-record-detail-label">旧访问地址</span><span class="server-record-detail-value">' + escapeServerRecordHtml(record.url || '未设置') + '</span></div><div class="server-record-detail"><span class="server-record-detail-label">预计过期</span><span class="server-record-detail-value">' + escapeServerRecordHtml(record.expiresAt || '未设置') + '</span></div></div><div class="server-record-card-actions single"><button type="button" class="server-record-primary" data-server-record-legacy="' + escapeServerRecordHtml(record.id) + '"><i data-lucide="link" class="w-4 h-4" aria-hidden="true"></i>关联节点</button></div></article>';
  }

  function ensureServerRecordsView(app) {
    let view = document.getElementById('view-server-records');
    if (view) return view;
    const contentArea = document.getElementById('content-area');
    if (!contentArea) return null;
    view = document.createElement('section');
    view.id = 'view-server-records';
    view.className = 'view-section w-full mx-auto';
    view.innerHTML = '<div class="server-record-toolbar"><div class="server-record-toolbar-copy"><p class="server-record-kicker">SERVER OVERVIEW</p><h2 class="server-record-heading">服务器概览</h2><p class="server-record-summary" data-server-record-summary></p></div><div class="server-record-toolbar-actions"><button type="button" class="server-record-icon-button" data-server-record-refresh title="刷新全部资源统计和预计过期" aria-label="刷新全部资源统计和预计过期"><i data-lucide="refresh-cw" class="w-4 h-4" aria-hidden="true"></i></button><button type="button" class="server-record-add" data-server-record-add><i data-lucide="plus" class="w-4 h-4" aria-hidden="true"></i>新增记录</button></div></div><label class="server-record-search"><i data-lucide="search" aria-hidden="true"></i><span class="sr-only">搜索服务器记录</span><input type="search" data-server-record-search placeholder="搜索服务器名称或标签" autocomplete="off"></label><div class="server-record-grid" data-server-record-grid></div>';
    contentArea.insertBefore(view, document.getElementById('view-logs') || null);
    view.querySelector('[data-server-record-add]')?.addEventListener('click', () => openServerRecordDialog(app));
    view.querySelector('[data-server-record-refresh]')?.addEventListener('click', () => loadServerRecords(app, { forceRefresh: true }));
    const searchInput = view.querySelector('[data-server-record-search]');
    if (searchInput) searchInput.value = serverRecordsUiState.query;
    searchInput?.addEventListener('input', (event) => {
      serverRecordsUiState.query = String(event.target?.value || '').trim().toLowerCase();
      renderServerRecordsView(app);
    });
    view.addEventListener('click', (event) => handleServerRecordViewClick(event, app));
    return view;
  }

  function renderServerRecordsView(app) {
    const view = ensureServerRecordsView(app);
    if (!view) return;
    const records = serverRecordsUiState.records;
    const legacyRecords = readLegacyServerRecords();
    const query = serverRecordsUiState.query;
    const renderSignature = JSON.stringify([query, records, legacyRecords, serverRecordsUiState.loading, serverRecordsUiState.refreshingAll, serverRecordsUiState.refreshingNodes, serverRecordsUiState.error]);
    if (view.dataset.serverRecordRenderSignature === renderSignature) return;
    view.dataset.serverRecordRenderSignature = renderSignature;
    const visible = query ? records.filter((record) => (record.displayName + ' ' + record.nodeName + ' ' + record.tags.join(' ')).toLowerCase().includes(query)) : records;
    const visibleLegacy = query ? legacyRecords.filter((record) => (record.name + ' ' + record.tags.join(' ')).toLowerCase().includes(query)) : legacyRecords;
    const expiringCount = records.filter((record) => ['expiring', 'expired'].includes(getServerRecordExpiryStatus(record).key)).length;
    const summary = view.querySelector('[data-server-record-summary]');
    if (summary) summary.textContent = serverRecordsUiState.refreshingAll ? '正在手动刷新全部资源统计…' : (serverRecordsUiState.loading ? '正在读取服务器记录…' : '共 ' + records.length + ' 条记录' + (expiringCount ? '，' + expiringCount + ' 条即将或已经到期' : '') + (legacyRecords.length ? '，' + legacyRecords.length + ' 条待关联' : ''));
    const grid = view.querySelector('[data-server-record-grid]');
    if (!grid) return;
    const cards = [...visible.map((record) => buildServerRecordCard(record)), ...visibleLegacy.map((record) => buildLegacyServerRecordCard(record))];
    const emptyText = serverRecordsUiState.error ? escapeServerRecordHtml(serverRecordsUiState.error) : (serverRecordsUiState.loading ? '正在加载服务器记录' : (records.length || legacyRecords.length ? '没有匹配的服务器记录' : '暂无服务器记录'));
    grid.innerHTML = cards.length ? cards.join('') : '<div class="server-record-empty"><span class="server-record-empty-icon"><i data-lucide="server" class="w-5 h-5" aria-hidden="true"></i></span><p class="font-medium text-slate-700 dark:text-slate-200">' + emptyText + '</p></div>';
    scheduleIconRefresh(view);
  }

  function syncServerRecordExpiryMode(dialog, rawMode = 'fixed') {
    const mode = String(rawMode || '').trim().toLowerCase() === 'rolling' ? 'rolling' : 'fixed';
    const form = dialog?.querySelector?.('[data-server-record-form]');
    if (!form) return mode;
    const enabled = form.elements.expiryEnabled?.checked === true;
    if (form.elements.expiryMode) form.elements.expiryMode.value = mode;
    const settings = dialog.querySelector('[data-server-record-expiry-settings]');
    if (settings) settings.hidden = !enabled;
    dialog.querySelectorAll('[data-server-record-expiry-mode]').forEach((button) => {
      button.setAttribute('aria-pressed', button.getAttribute('data-server-record-expiry-mode') === mode ? 'true' : 'false');
    });
    dialog.querySelectorAll('[data-server-record-expiry-pane]').forEach((pane) => {
      pane.hidden = !enabled || pane.getAttribute('data-server-record-expiry-pane') !== mode;
    });
    if (form.elements.expiresAt) {
      form.elements.expiresAt.disabled = !enabled || mode !== 'fixed';
      form.elements.expiresAt.required = enabled && mode === 'fixed';
    }
    if (form.elements.expiryDays) {
      form.elements.expiryDays.disabled = !enabled || mode !== 'rolling';
      form.elements.expiryDays.required = enabled && mode === 'rolling';
    }
    return mode;
  }

  function ensureServerRecordDialog(app) {
    let dialog = document.getElementById('server-record-dialog');
    if (dialog) {
      dialog.classList.toggle('dark', app?.isDarkTheme === true);
      return dialog;
    }
    dialog = document.createElement('dialog');
    dialog.id = 'server-record-dialog';
    dialog.innerHTML = '<form class="server-record-dialog-body" data-server-record-form><div class="server-record-dialog-head"><h2 class="server-record-dialog-title" data-server-record-dialog-title>新增服务器记录</h2><button type="button" class="server-record-dialog-close" data-server-record-close title="关闭" aria-label="关闭"><i data-lucide="x" class="w-5 h-5" aria-hidden="true"></i></button></div><div class="server-record-form-grid"><div class="server-record-form-field span-2"><label for="server-record-node">服务器节点</label><select id="server-record-node" name="nodeName" required></select></div><div class="server-record-form-field span-2"><label for="server-record-tag-input">标签</label><div class="server-record-tag-picker" data-server-record-tag-picker><div class="server-record-tag-values" data-server-record-tag-values></div><input id="server-record-tag-input" data-server-record-tag-input maxlength="24" placeholder="搜索或输入标签，按 Enter 添加" autocomplete="off"><div class="server-record-tag-options" data-server-record-tag-options></div></div></div><div class="server-record-form-field span-2"><label class="server-record-expiry-toggle"><input name="expiryEnabled" type="checkbox"><span>启用预计过期</span></label><div class="server-record-expiry-settings" data-server-record-expiry-settings hidden><div class="server-record-expiry-modes" role="group" aria-label="预计过期模式"><button type="button" class="server-record-expiry-mode" data-server-record-expiry-mode="fixed" aria-pressed="true">固定日期</button><button type="button" class="server-record-expiry-mode" data-server-record-expiry-mode="rolling" aria-pressed="false">滚动天数</button></div><input name="expiryMode" type="hidden" value="fixed"><div class="server-record-expiry-pane" data-server-record-expiry-pane="fixed"><label for="server-record-expires">固定到期日期</label><input id="server-record-expires" name="expiresAt" type="date"></div><div class="server-record-expiry-pane" data-server-record-expiry-pane="rolling" hidden><label for="server-record-expiry-days">过期天数</label><div class="server-record-days-input"><input id="server-record-expiry-days" name="expiryDays" type="number" min="1" max="3650" step="1" value="30"><span class="server-record-days-unit">天</span></div></div></div></div></div><div class="server-record-dialog-actions"><button type="button" class="server-record-dialog-secondary" data-server-record-close>取消</button><button type="submit" class="server-record-dialog-submit" data-server-record-submit>保存记录</button></div></form>';
    document.body.appendChild(dialog);
    dialog.classList.toggle('dark', app?.isDarkTheme === true);
    dialog.querySelectorAll('[data-server-record-close]').forEach((button) => button.addEventListener('click', () => dialog.close()));
    dialog.querySelectorAll('[data-server-record-expiry-mode]').forEach((button) => button.addEventListener('click', () => {
      syncServerRecordExpiryMode(dialog, button.getAttribute('data-server-record-expiry-mode'));
    }));
    dialog.querySelector('[name="expiryEnabled"]')?.addEventListener('change', () => {
      syncServerRecordExpiryMode(dialog, dialog.querySelector('[name="expiryMode"]')?.value || 'rolling');
    });
    dialog.querySelector('[data-server-record-form]')?.addEventListener('submit', (event) => saveServerRecordFromDialog(event, app));
    dialog.querySelector('[name="nodeName"]')?.addEventListener('change', (event) => {
      const legacyRecord = readLegacyServerRecords().find((record) => record.id === serverRecordsUiState.legacyEditingId) || null;
      const draft = buildServerRecordDialogDraft(
        serverRecordsUiState.availableNodes,
        null,
        legacyRecord,
        event.currentTarget?.value
      );
      serverRecordsUiState.draftTags = draft.tags;
      const form = event.currentTarget?.form;
      if (form?.elements?.expiryEnabled) form.elements.expiryEnabled.checked = draft.expiryEnabled === true;
      if (form?.elements?.expiresAt) form.elements.expiresAt.value = draft.expiresAt;
      if (form?.elements?.expiryDays) form.elements.expiryDays.value = String(draft.expiryDays);
      syncServerRecordExpiryMode(dialog, draft.expiryMode);
      renderServerRecordTagPicker(dialog);
    });
    dialog.querySelector('[data-server-record-tag-input]')?.addEventListener('keydown', (event) => {
      if (event.key !== 'Enter') return;
      event.preventDefault();
      serverRecordsUiState.tagQuery = '';
      addServerRecordDraftTag(event.currentTarget.value, dialog);
      event.currentTarget.value = '';
    });
    dialog.querySelector('[data-server-record-tag-input]')?.addEventListener('input', (event) => {
      serverRecordsUiState.tagQuery = String(event.currentTarget?.value || '').trim().toLowerCase();
      renderServerRecordTagPicker(dialog);
    });
    dialog.querySelector('[data-server-record-tag-picker]')?.addEventListener('click', (event) => {
      const option = event.target?.closest?.('[data-server-record-tag-option]');
      const remove = event.target?.closest?.('[data-server-record-tag-remove]');
      if (option) toggleServerRecordDraftTag(option.getAttribute('data-server-record-tag-option'), dialog);
      if (remove) toggleServerRecordDraftTag(remove.getAttribute('data-server-record-tag-remove'), dialog);
    });
    dialog.addEventListener('close', () => {
      serverRecordsUiState.editingNodeName = '';
      serverRecordsUiState.legacyEditingId = '';
      serverRecordsUiState.draftTags = [];
      serverRecordsUiState.tagQuery = '';
    });
    scheduleIconRefresh(dialog);
    return dialog;
  }

  function getServerRecordTagSuggestions() {
    const tags = normalizeServerRecordTags(['高码服', '低码服', ...serverRecordsUiState.availableNodes.flatMap((node) => node.tags || [])]);
    return serverRecordsUiState.tagQuery ? tags.filter((tag) => tag.toLowerCase().includes(serverRecordsUiState.tagQuery)) : tags;
  }

  function renderServerRecordTagPicker(dialog) {
    const values = dialog?.querySelector('[data-server-record-tag-values]');
    const options = dialog?.querySelector('[data-server-record-tag-options]');
    if (values) values.innerHTML = serverRecordsUiState.draftTags.length
      ? serverRecordsUiState.draftTags.map((tag) => '<button type="button" class="server-record-tag-chip" data-server-record-tag-remove="' + escapeServerRecordHtml(tag) + '">' + escapeServerRecordHtml(tag) + '<i data-lucide="x" aria-hidden="true"></i></button>').join('')
      : '<span class="server-record-tag-placeholder">未选择标签</span>';
    if (options) options.innerHTML = getServerRecordTagSuggestions().map((tag) => {
      const selected = serverRecordsUiState.draftTags.some((value) => value.toLowerCase() === tag.toLowerCase());
      return '<button type="button" class="server-record-tag-option' + (selected ? ' is-selected' : '') + '" data-server-record-tag-option="' + escapeServerRecordHtml(tag) + '"><i data-lucide="' + (selected ? 'check-square' : 'square') + '" aria-hidden="true"></i>' + escapeServerRecordHtml(tag) + '</button>';
    }).join('');
    scheduleIconRefresh(dialog);
  }

  function addServerRecordDraftTag(value, dialog) {
    serverRecordsUiState.draftTags = normalizeServerRecordTags([...serverRecordsUiState.draftTags, value]);
    renderServerRecordTagPicker(dialog);
  }

  function toggleServerRecordDraftTag(value, dialog) {
    const key = String(value || '').trim().toLowerCase();
    const exists = serverRecordsUiState.draftTags.some((tag) => tag.toLowerCase() === key);
    serverRecordsUiState.draftTags = exists
      ? serverRecordsUiState.draftTags.filter((tag) => tag.toLowerCase() !== key)
      : normalizeServerRecordTags([...serverRecordsUiState.draftTags, value]);
    renderServerRecordTagPicker(dialog);
  }

  function openServerRecordDialog(app, record = null, legacyRecord = null) {
    const dialog = ensureServerRecordDialog(app);
    const form = dialog?.querySelector('[data-server-record-form]');
    if (!dialog || !form) return;
    const source = record ? normalizeServerRecord(record) : null;
    serverRecordsUiState.editingNodeName = source?.nodeName || '';
    serverRecordsUiState.legacyEditingId = legacyRecord?.id || '';
    const initialDraft = buildServerRecordDialogDraft(
      serverRecordsUiState.availableNodes,
      source,
      legacyRecord,
      source?.nodeName || ''
    );
    serverRecordsUiState.draftTags = initialDraft.tags;
    serverRecordsUiState.tagQuery = '';
    const tagInput = dialog.querySelector('[data-server-record-tag-input]');
    if (tagInput) tagInput.value = '';
    dialog.querySelector('[data-server-record-dialog-title]').textContent = source ? '编辑服务器记录' : (legacyRecord ? '关联旧服务器记录' : '新增服务器记录');
    const selectableNodes = getServerRecordSelectableNodes(serverRecordsUiState.availableNodes, source, legacyRecord);
    if (!source && selectableNodes.length === 0) {
      app?.showMessage?.('没有可添加的节点。请先创建节点，或移除已有服务器记录。', { tone: 'warning' });
      return;
    }
    form.elements.nodeName.innerHTML = '<option value="">请选择节点</option>' + selectableNodes.map((node) => '<option value="' + escapeServerRecordHtml(node.nodeName) + '">' + escapeServerRecordHtml(node.displayName) + ' · ' + escapeServerRecordHtml(node.nodeName) + '</option>').join('');
    form.elements.nodeName.value = source?.nodeName || '';
    form.elements.nodeName.disabled = !!source;
    form.elements.expiryEnabled.checked = initialDraft.expiryEnabled === true;
    form.elements.expiresAt.value = initialDraft.expiresAt;
    form.elements.expiryDays.value = String(initialDraft.expiryDays);
    syncServerRecordExpiryMode(dialog, initialDraft.expiryMode);
    renderServerRecordTagPicker(dialog);
    dialog.showModal();
    enqueue(() => {
      if (!source) return form.elements.nodeName?.focus();
      return (initialDraft.expiryEnabled ? (initialDraft.expiryMode === 'fixed' ? form.elements.expiresAt : form.elements.expiryDays) : form.elements.expiryEnabled)?.focus();
    });
  }

  async function saveServerRecordFromDialog(event, app) {
    event.preventDefault();
    const form = event.currentTarget;
    const nodeName = serverRecordsUiState.editingNodeName || String(form.elements.nodeName?.value || '').trim();
    if (!nodeName || serverRecordsUiState.saving) return;
    const wasEditing = !!serverRecordsUiState.editingNodeName;
    serverRecordsUiState.saving = true;
    const submit = form.querySelector('[data-server-record-submit]');
    if (submit) { submit.disabled = true; submit.textContent = '保存中…'; }
    try {
      const result = await app.apiCall('saveServerRecordSettings', {
        nodeName,
        enabled: true,
        tags: serverRecordsUiState.draftTags,
        expiryEnabled: form.elements.expiryEnabled?.checked === true,
        expiryMode: String(form.elements.expiryMode?.value || 'fixed'),
        expiresAt: String(form.elements.expiresAt?.value || ''),
        expiryDays: Number(form.elements.expiryDays?.value) || 30
      });
      if (result?.revisions) app?.applyAdminRevisions?.(result.revisions);
      if (result?.node && Array.isArray(app?.nodes)) {
        const index = app.nodes.findIndex((node) => String(node?.name || '').toLowerCase() === nodeName);
        if (index >= 0) app.nodes.splice(index, 1, { ...app.nodes[index], ...result.node });
      }
      if (serverRecordsUiState.legacyEditingId) {
        serverRecordsUiState.legacyRecords = readLegacyServerRecords().filter((record) => record.id !== serverRecordsUiState.legacyEditingId);
        persistLegacyServerRecords(app);
      }
      form.closest('dialog')?.close();
      await loadServerRecords(app, { skipMigration: true });
      app?.showMessage?.(wasEditing ? '服务器记录已更新' : '服务器记录已新增', { tone: 'success' });
    } catch (error) {
      app?.showMessage?.('服务器记录保存失败：' + (error?.message || '未知错误'), { tone: 'error', modal: true });
    } finally {
      serverRecordsUiState.saving = false;
      if (submit) { submit.disabled = false; submit.textContent = '保存记录'; }
    }
  }

  async function deleteServerRecord(app, record) {
    const accepted = typeof app?.askConfirm === 'function' ? await app.askConfirm('确定从服务器记录中移除“' + record.displayName + '”？节点本身和已有上次观看时间不会删除。', { title: '移除服务器记录', tone: 'danger', confirmText: '移除' }) : window.confirm('确定移除“' + record.displayName + '”的服务器记录？');
    if (!accepted) return;
    try {
      const result = await app.apiCall('saveServerRecordSettings', {
        nodeName: record.nodeName,
        enabled: false,
        tags: record.tags,
        expiryEnabled: record.expiryEnabled === true,
        expiryMode: record.expiryMode || 'rolling',
        expiresAt: record.expiresAt || '',
        expiryDays: Number(record.expiryDays) || 30
      });
      if (result?.revisions) app?.applyAdminRevisions?.(result.revisions);
      await loadServerRecords(app, { skipMigration: true });
      app?.showMessage?.('服务器记录已移除', { tone: 'success' });
    } catch (error) {
      app?.showMessage?.('移除服务器记录失败：' + (error?.message || '未知错误'), { tone: 'error', modal: true });
    }
  }

  function handleServerRecordViewClick(event, app) {
    const target = event.target?.closest?.('[data-server-record-open],[data-server-record-refresh-one],[data-server-record-edit],[data-server-record-delete],[data-server-record-legacy]');
    if (!target) return;
    const legacyId = target.getAttribute('data-server-record-legacy');
    if (legacyId) {
      const legacyRecord = readLegacyServerRecords().find((item) => item.id === legacyId);
      if (legacyRecord) openServerRecordDialog(app, null, legacyRecord);
      return;
    }
    const id = target.getAttribute('data-server-record-open') || target.getAttribute('data-server-record-refresh-one') || target.getAttribute('data-server-record-edit') || target.getAttribute('data-server-record-delete');
    const record = serverRecordsUiState.records.find((item) => item.nodeName === id);
    if (!record) return;
    if (target.hasAttribute('data-server-record-refresh-one')) return void refreshSingleServerRecord(app, record.nodeName);
    if (target.hasAttribute('data-server-record-edit')) return openServerRecordDialog(app, record);
    if (target.hasAttribute('data-server-record-delete')) return void deleteServerRecord(app, record);
    if (isSafeServerRecordUrl(record.accessUrl)) window.open(record.accessUrl, '_blank', 'noopener,noreferrer');
  }

  function syncServerRecordsNavigation(app) {
    const nav = document.querySelector('#sidebar nav');
    const logsLink = nav?.querySelector('a[href="#logs"]');
    if (!nav || !logsLink) return;
    let link = nav.querySelector('[data-server-records-nav="1"]');
    if (!link) {
      link = logsLink.cloneNode(true);
      link.setAttribute('data-server-records-nav', '1');
      link.href = serverRecordsHash;
      link.addEventListener('click', (event) => { event.preventDefault(); app.navigate(serverRecordsHash); });
      const previousIcon = link.querySelector('i,svg');
      const iconPlaceholder = document.createElement('i');
      iconPlaceholder.setAttribute('data-lucide', 'server-cog');
      iconPlaceholder.className = 'w-5 h-5 mr-3';
      previousIcon?.replaceWith(iconPlaceholder);
      const label = link.querySelector('span');
      if (label) label.textContent = '服务器记录';
      logsLink.parentElement?.insertBefore(link, logsLink);
    }
    const collapsed = app?.isDesktopSidebarCollapsed?.() === true;
    const active = String(app?.currentHash || '') === serverRecordsHash;
    link.className = 'nav-item flex items-center px-3 py-2.5 rounded-xl text-sm font-medium transition-colors text-slate-600 dark:text-slate-400 hover:text-slate-900 hover:bg-slate-100 dark:hover:text-white dark:hover:bg-slate-800/50' + (collapsed ? ' md:justify-center md:px-2' : '') + (active ? ' bg-brand-50 text-brand-600 dark:bg-brand-500/10 dark:text-brand-400' : '');
    link.title = collapsed ? '服务器记录' : '';
    link.setAttribute('aria-current', active ? 'page' : 'false');
    const icon = link.querySelector('i,svg');
    if (icon) icon.className = collapsed ? 'w-5 h-5 md:mr-0' : 'w-5 h-5 mr-3';
    const label = link.querySelector('span');
    if (label) label.className = collapsed ? 'md:hidden' : '';
  }

  function setServerRecordsViewActive(active) {
    document.getElementById('view-server-records')?.classList.toggle('active', active === true);
  }

  function activateServerRecordsRoute(app, syncHash = true) {
    serverRecordsUiState.attempted = false;
    app.currentHash = serverRecordsHash;
    app.pageTitle = '服务器记录';
    app.sidebarOpen = false;
    if (syncHash && window.location?.hash !== serverRecordsHash) window.history?.pushState?.(null, '', serverRecordsHash);
    enqueue(() => {
      const view = ensureServerRecordsView(app);
      view?.classList.add('active');
      renderServerRecordsView(app);
      if (!serverRecordsUiState.attempted) void loadServerRecords(app);
      syncServerRecordsNavigation(app);
      document.getElementById('content-area')?.scrollTo?.({ top: 0, behavior: 'auto' });
    });
    return Promise.resolve(true);
  }

  function patchServerRecordsMethods(app) {
    if (!app || patchedServerRecordsApp === app) return;
    patchedServerRecordsApp = app;
    const navigate = typeof app.navigate === 'function' ? app.navigate.bind(app) : null;
    const handleExternalHashNavigation = typeof app.handleExternalHashNavigation === 'function' ? app.handleExternalHashNavigation.bind(app) : null;
    app.navigate = function navigateWithServerRecords(rawHash) {
      if (String(rawHash || '').trim() === serverRecordsHash) return activateServerRecordsRoute(this, true);
      setServerRecordsViewActive(false);
      return navigate ? navigate(rawHash) : Promise.resolve(false);
    };
    app.handleExternalHashNavigation = function handleExternalServerRecordsHash(rawHash) {
      if (String(rawHash || '').trim() === serverRecordsHash) return activateServerRecordsRoute(this, false);
      setServerRecordsViewActive(false);
      return handleExternalHashNavigation ? handleExternalHashNavigation(rawHash) : Promise.resolve(false);
    };
    if (window.location?.hash === serverRecordsHash) activateServerRecordsRoute(app, false);
  }

  function syncServerRecordsShell(app) {
    if (!app) return;
    patchServerRecordsMethods(app);
    syncServerRecordsNavigation(app);
    if (String(app.currentHash || '') === serverRecordsHash) {
      const view = ensureServerRecordsView(app);
      view?.classList.add('active');
      renderServerRecordsView(app);
      if (!serverRecordsUiState.attempted) void loadServerRecords(app);
    }
    document.getElementById('server-record-dialog')?.classList.toggle('dark', app.isDarkTheme === true);
  }

  function syncServerExpiryMilestoneControls(root, app = null) {
    const valueInput = root?.querySelector?.('#cfg-server-expiry-days-list');
    if (!valueInput) return;
    const configuredDays = Array.isArray(app?.settingsForm?.tgServerExpiryWarningDays)
      ? app.settingsForm.tgServerExpiryWarningDays
      : String(valueInput.value || '').split(/[\s,，;；|]+/);
    const selected = new Set(configuredDays.map(Number).filter((value) => [7, 3, 1, 0].includes(value)));
    valueInput.value = [...selected].sort((left, right) => right - left).join(',');
    root.querySelectorAll('[data-server-expiry-milestone]').forEach((checkbox) => {
      checkbox.checked = selected.has(Number(checkbox.getAttribute('data-server-expiry-milestone')));
    });
  }

  function syncServerExpirySettingsControls(app) {
    const panel = document.getElementById('server-expiry-settings-panel');
    if (!panel || !app) return;
    const expiryDays = Number.parseInt(String(app.settingsForm?.serverRecordExpiryDays ?? 30), 10);
    const expiryDaysInput = panel.querySelector('#cfg-server-record-expiry-days');
    const warningEnabledInput = panel.querySelector('#cfg-tg-server-expiry-enabled');
    if (expiryDaysInput) expiryDaysInput.value = String(Number.isFinite(expiryDays) ? expiryDays : 30);
    if (warningEnabledInput) warningEnabledInput.checked = app.settingsForm?.tgServerExpiryWarningEnabled === true;
    syncServerExpiryMilestoneControls(panel, app);
  }

  function ensureServerExpirySettings(app) {
    const settingsRoot = document.getElementById('set-monitoring');
    if (!settingsRoot || document.getElementById('server-expiry-settings-panel')) return;
    const panel = document.createElement('div');
    panel.id = 'server-expiry-settings-panel';
    panel.className = 'ui-settings-panel settings-block h-full';
    panel.innerHTML = '<div class="ui-block-head"><div><div class="ui-section-kicker">SERVER EXPIRY</div><div class="ui-section-title">服务器过期计算与预警</div></div><span class="ui-chip-muted">每日刷新</span></div>'
      + '<div class="grid gap-4 md:grid-cols-2"><div><label class="ui-field-label" for="cfg-server-record-expiry-days">新记录默认滚动天数</label><input type="number" min="1" max="3650" step="1" id="cfg-server-record-expiry-days" class="w-full p-2 rounded-control border border-border-soft bg-surface-panel outline-none dark:border-border-dark dark:bg-surface-dark dark:text-white" value="30"></div>'
      + '<div class="flex items-end"><label class="flex items-center text-sm font-medium cursor-pointer text-slate-900 dark:text-white"><input type="checkbox" id="cfg-tg-server-expiry-enabled" class="mr-2 w-4 h-4 rounded">启用 Telegram 服务器过期预警</label></div></div>'
      + '<div class="mt-4"><span class="ui-field-label">预警里程碑</span><input type="hidden" id="cfg-server-expiry-days-list" value="7,3,1,0"><div class="flex flex-wrap gap-2">'
      + [7, 3, 1, 0].map((day) => '<label class="inline-flex items-center gap-2 rounded-control border border-slate-200 dark:border-slate-700 px-3 py-2 text-sm text-slate-700 dark:text-slate-200"><input type="checkbox" data-server-expiry-milestone="' + day + '" class="w-4 h-4 rounded">' + (day === 0 ? '到期当天' : day + ' 天') + '</label>').join('')
      + '</div></div>';
    const actionRow = settingsRoot.lastElementChild;
    settingsRoot.insertBefore(panel, actionRow || null);
    panel.querySelectorAll('[data-server-expiry-milestone]').forEach((checkbox) => {
      checkbox.addEventListener('change', () => {
        const selected = [...panel.querySelectorAll('[data-server-expiry-milestone]:checked')]
          .map((item) => Number(item.getAttribute('data-server-expiry-milestone')))
          .filter((value) => [7, 3, 1, 0].includes(value))
          .sort((left, right) => right - left);
        const valueInput = panel.querySelector('#cfg-server-expiry-days-list');
        if (valueInput) valueInput.value = selected.join(',');
        app.settingsForm = { ...app.settingsForm, tgServerExpiryWarningDays: selected };
      });
    });
    panel.querySelector('#cfg-server-record-expiry-days')?.addEventListener('input', (event) => {
      app.settingsForm = { ...app.settingsForm, serverRecordExpiryDays: event.currentTarget?.value || '30' };
    });
    panel.querySelector('#cfg-tg-server-expiry-enabled')?.addEventListener('change', (event) => {
      app.settingsForm = { ...app.settingsForm, tgServerExpiryWarningEnabled: event.currentTarget?.checked === true };
    });
    if (typeof app?.syncSettingsFormFromRuntimeConfig === 'function') {
      app.syncSettingsFormFromRuntimeConfig(app.runtimeConfig || {});
    }
    syncServerExpirySettingsControls(app);
  }

  function patchSafetyContractMethods(app) {
    if (!app || patchedSafetyContractApp === app) return;
    patchedSafetyContractApp = app;

    // Older shells call this helper while hydrating settings, but did not expose it.
    // Keep the preview field populated from either the current or legacy repository key.
    if (typeof app.syncReleaseSourcePreviewInSettingsForm !== 'function') {
      app.syncReleaseSourcePreviewInSettingsForm = function syncReleaseSourcePreviewInSettingsForm() {
        const form = this.settingsForm && typeof this.settingsForm === 'object' ? this.settingsForm : {};
        const source = String(form.githubRepo || form.releaseRepo || form.repo || '').trim();
        if (source && form.githubRepo !== source) form.githubRepo = source;
        return source;
      };
    }

    if (typeof app.syncSettingsFormFromRuntimeConfig === 'function') {
      const syncSettingsFormFromRuntimeConfig = app.syncSettingsFormFromRuntimeConfig.bind(app);
      app.syncSettingsFormFromRuntimeConfig = function syncSettingsFormWithServerExpiry(...args) {
        const result = syncSettingsFormFromRuntimeConfig(...args);
        enqueue(() => syncServerExpirySettingsControls(app));
        return result;
      };
    }

    if (typeof app.applyDashboardStatsState === 'function') {
      const applyDashboardStatsState = app.applyDashboardStatsState.bind(app);
      app.applyDashboardStatsState = function applyDashboardStatsStateWithTrafficPeriod(...args) {
        const result = applyDashboardStatsState(...args);
        enqueue(() => {
          const nodes = getDashboardTrafficNodes();
          if (dashboardTrafficState.period === 'day') {
            dashboardTrafficState.daily = snapshotDashboardTrafficCard(nodes) || dashboardTrafficState.daily;
          } else if (dashboardTrafficState.monthly) {
            renderDashboardTrafficCard(dashboardTrafficState.monthly, 'month', app);
          }
          syncDashboardTrafficToggle(app);
        });
        return result;
      };
    }
    app.toggleDashboardTrafficPeriodFromUi = () => toggleDashboardTrafficPeriod(app);

    if (typeof app.loadDashboard === 'function') {
      app.loadDashboard = async function loadDashboardInLayers(routeToken = null, options = {}) {
        const forceRefresh = options?.forceRefresh === true;
        if (forceRefresh && this.dashboardRefreshPending) return null;
        const loadSeq = ++dashboardLayerState.loadSeq;
        const routeIsCurrent = () => loadSeq === dashboardLayerState.loadSeq && this.isRouteLoadCurrent(routeToken);
        const previousHotspot = this.dashboardD1WriteHotspot;
        const previousStatsAvailable = dashboardLayerState.statsLoaded || String(this.dashboardView?.nodes?.meta || '').includes('统计时间');
        const previousRuntimeText = String(this.dashboardRuntimeView?.updatedText || '').trim();
        const previousRuntimeAvailable = dashboardLayerState.runtimeLoaded || (!!previousRuntimeText && !previousRuntimeText.includes('未加载'));
        let liveStatsApplied = false;
        let liveRuntimeApplied = false;
        if (forceRefresh) this.dashboardRefreshPending = true;
        dashboardLayerState.statsLoading = true;
        dashboardLayerState.runtimeLoading = true;

        if (!forceRefresh) {
          void this.apiCall('getDashboardCachedSnapshot').then((payload) => {
            if (!routeIsCurrent()) return;
            const snapshot = payload?.snapshot && typeof payload.snapshot === 'object' ? payload.snapshot : null;
            if (!snapshot) return;
            const cacheMeta = snapshot.cacheMeta && typeof snapshot.cacheMeta === 'object' ? snapshot.cacheMeta : {};
            if (!liveStatsApplied && snapshot.stats && typeof snapshot.stats === 'object') {
              this.applyDashboardStatsState({ ...snapshot.stats, cacheStatus: cacheMeta.cacheStatus || 'cache' });
              if (previousHotspot && typeof previousHotspot === 'object') this.dashboardD1WriteHotspot = previousHotspot;
              dashboardLayerState.statsLoaded = true;
            }
            if (!liveRuntimeApplied && snapshot.runtimeStatus && typeof snapshot.runtimeStatus === 'object') {
              this.applyRuntimeStatusState(snapshot.runtimeStatus);
              dashboardLayerState.runtimeLoaded = true;
            }
            this.dashboardCacheMeta = cacheMeta;
          }).catch((error) => {
            console.warn('dashboard cached snapshot unavailable', error);
          });
        }

        const statsTask = this.apiCall('getDashboardCoreStats', { forceRefresh }).then((stats) => {
          if (!routeIsCurrent()) return stats;
          liveStatsApplied = true;
          this.applyDashboardStatsState(stats && typeof stats === 'object' ? stats : {});
          if (previousHotspot && typeof previousHotspot === 'object') this.dashboardD1WriteHotspot = previousHotspot;
          dashboardLayerState.statsLoaded = true;
          return stats;
        }).catch((error) => {
          if (routeIsCurrent() && !previousStatsAvailable) this.applyDashboardErrorState(error?.message || '仪表盘统计加载失败');
          throw error;
        }).finally(() => {
          if (loadSeq === dashboardLayerState.loadSeq) dashboardLayerState.statsLoading = false;
        });

        const runtimeTask = this.apiCall('getRuntimeStatus', { forceRefresh }).then((payload) => {
          if (!routeIsCurrent()) return payload;
          liveRuntimeApplied = true;
          const runtimeStatus = payload?.status && typeof payload.status === 'object' ? payload.status : {};
          this.applyRuntimeStatusState(runtimeStatus);
          this.patchAdminBootstrapCache({ runtimeStatus: this.runtimeStatus });
          dashboardLayerState.runtimeLoaded = true;
          return payload;
        }).catch((error) => {
          if (routeIsCurrent() && !previousRuntimeAvailable) this.applyRuntimeStatusErrorState(error?.message || '运行状态加载失败');
          throw error;
        }).finally(() => {
          if (loadSeq === dashboardLayerState.loadSeq) dashboardLayerState.runtimeLoading = false;
        });

        const showHotspot = this.runtimeConfig?.dashboardShowD1WriteHotspot === true;
        if (showHotspot) {
          dashboardLayerState.hotspotLoading = true;
          if (!dashboardLayerState.hotspotLoaded) {
            this.dashboardD1WriteHotspot = {
              ...(previousHotspot && typeof previousHotspot === 'object' ? previousHotspot : {}),
              status: 'loading',
              summary: 'D1 写入热点加载中',
              detail: '',
              available: false
            };
          }
          void this.apiCall('getDashboardD1WriteHotspot', { forceRefresh }).then((hotspot) => {
            if (!routeIsCurrent()) return;
            this.dashboardD1WriteHotspot = hotspot && typeof hotspot === 'object' ? hotspot : {};
            dashboardLayerState.hotspotLoaded = true;
          }).catch((error) => {
            if (!routeIsCurrent() || dashboardLayerState.hotspotLoaded) return;
            this.dashboardD1WriteHotspot = {
              ...(this.dashboardD1WriteHotspot || {}),
              status: 'failed',
              summary: 'D1 写入热点加载失败',
              detail: error?.message || '未知错误',
              available: false
            };
          }).finally(() => {
            if (loadSeq === dashboardLayerState.loadSeq) dashboardLayerState.hotspotLoading = false;
          });
        }

        const results = await Promise.allSettled([statsTask, runtimeTask]);
        if (forceRefresh && routeIsCurrent()) {
          const failures = results.filter((item) => item.status === 'rejected');
          if (failures.length) {
            this.showMessage('仪表盘部分刷新失败，已保留其余可用状态。', { tone: 'warning', modal: true });
          }
        }
        if (forceRefresh && loadSeq === dashboardLayerState.loadSeq) this.dashboardRefreshPending = false;
        return results;
      };
    }

    app.runPreviewedTidy = async function runPreviewedTidyWithPlanToken(rawScope = 'kv') {
      const scope = String(rawScope || 'kv').trim().toLowerCase() === 'd1' ? 'd1' : 'kv';
      const title = scope === 'd1' ? '整理 D1 数据' : '整理 KV 数据';
      const action = scope === 'd1' ? 'tidyD1Data' : 'tidyKvData';
      const confirmText = scope === 'd1' ? '开始整理 D1' : '开始整理 KV';
      try {
        const preview = await this.apiCall('previewTidyData', { scope });
        const dialog = this.buildTidyPreviewConfirmDialog(preview, scope);
        const message = this.buildTidyPreviewConfirmText(preview, scope);
        const quotaBlocked = preview?.quotaBudget?.blocked === true;
        const accepted = await this.askConfirm(message, {
          title,
          tone: 'warning',
          confirmText: quotaBlocked ? '关闭' : confirmText,
          summary: dialog.summary,
          sections: dialog.sections,
          warnings: dialog.warnings
        });
        if (!accepted || quotaBlocked) return;
        const planToken = String(preview?.planToken || '');
        const executionPayload = scope === 'kv' ? { planToken } : {};
        const result = await this.apiCall(action, executionPayload);
        const refreshTasks = [this.loadSettings()];
        if (scope === 'kv') {
          refreshTasks.push(this.loadNodes());
        } else {
          if (String(this.currentHash || '') === '#logs') refreshTasks.push(this.loadLogs(1));
          if (String(this.currentHash || '') === '#dashboard') refreshTasks.push(this.loadDashboard(null, { forceRefresh: true }));
        }
        const refreshIncomplete = (await Promise.allSettled(refreshTasks)).some((item) => item.status === 'rejected');
        const summaryMessage = scope === 'd1'
          ? this.buildD1TidySuccessMessage(result?.summary || {})
          : this.buildKvTidySuccessMessage(result);
        const resultMessage = buildTidyExecutionResultMessage(this, result, summaryMessage, refreshIncomplete);
        await this.showMessage(resultMessage, {
          title: scope === 'd1' ? 'D1 整理结果' : 'KV 整理结果',
          tone: refreshIncomplete ? 'warning' : 'success',
          modal: true
        });
      } catch (error) {
        console.error('runPreviewedTidy failed', error);
        const errorCode = String(error?.code || '');
        const planRecoveryMessage = scope === 'kv' && errorCode === 'TIDY_PLAN_STALE'
          ? 'KV 整理计划已过期或数据已变化，请重新预览并确认后再执行。'
          : scope === 'kv' && errorCode === 'TIDY_PLAN_INVALID'
            ? 'KV 整理计划凭证无效，请重新预览并确认后再执行。'
            : '';
        this.showMessage(planRecoveryMessage || title + '失败: ' + (error?.message || '未知错误'), { tone: 'error', modal: true });
      }
    };

    app.exportSettingsWithSecretsFromUi = async function exportSettingsWithSecretsFromUi() {
      const accepted = await this.askConfirm(
        '完整设置备份会包含 Cloudflare API Token、Telegram Bot Token 等敏感密钥。请仅保存到可信位置，使用后及时删除。',
        { title: '导出含密钥设置', tone: 'danger', confirmText: '确认导出' }
      );
      if (!accepted) return;
      try {
        const result = await callConfirmedAdminAction(this, 'exportSettings', { includeSecrets: true }, 'exportSettings');
        if (result) this.downloadJson(result, 'emby_proxy_settings_with_secrets_' + Date.now() + '.json');
      } catch (error) {
        console.error('exportSettingsWithSecretsFromUi failed', error);
        this.showMessage('完整设置导出失败: ' + (error?.message || '未知错误'), { tone: 'error', modal: true });
      }
    };

    app.getD1SchemaStatusFromUi = async function getD1SchemaStatusFromUi() {
      try {
        const result = await this.apiCall('getD1SchemaStatus');
        const status = result?.status && typeof result.status === 'object' ? result.status : result;
        await this.showMessage(formatD1SchemaStatus(status), { title: 'D1 Schema 状态', tone: status?.migrationReady === true ? 'success' : 'warning', modal: true });
        return status;
      } catch (error) {
        console.error('getD1SchemaStatusFromUi failed', error);
        this.showMessage('读取 D1 Schema 状态失败: ' + (error?.message || '未知错误'), { tone: 'error', modal: true });
        return null;
      }
    };

    app.initD1SchemaFromUi = async function initD1SchemaFromUi() {
      const accepted = await this.askConfirm(
        '该操作会检查 D1 当前结构并补齐运行时兼容列。正式版本仍以 Wrangler migrations 记录为准。',
        { title: '初始化 D1 Schema', tone: 'warning', confirmText: '开始检查并补齐' }
      );
      if (!accepted) return;
      try {
        const result = await this.apiCall('initD1Schema');
        if (result?.revisions) this.applyAdminRevisions(result.revisions);
        const statusResult = await this.apiCall('getD1SchemaStatus');
        const status = statusResult?.status && typeof statusResult.status === 'object' ? statusResult.status : statusResult;
        await this.showMessage(formatD1SchemaStatus(status), {
          title: 'D1 Schema 初始化结果',
          tone: status?.runtimeCompatibilityReady === true ? 'success' : 'warning',
          modal: true
        });
      } catch (error) {
        console.error('initD1SchemaFromUi failed', error);
        this.showMessage('D1 Schema 初始化失败: ' + (error?.message || '未知错误'), { tone: 'error', modal: true });
      }
    };
  }

  function createRuntimeActionButton(referenceButton, actionName, label, iconName, onClick) {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = referenceButton?.className || 'px-4 py-2 rounded-xl border border-slate-200 text-sm font-medium';
    button.setAttribute('data-admin-runtime-action', actionName);
    button.innerHTML = '<i data-lucide="' + iconName + '" class="w-4 h-4 mr-1" aria-hidden="true"></i>' + label;
    button.addEventListener('click', onClick);
    return button;
  }

  function syncD1SchemaActionButtons(app) {
    const logsView = document.querySelector('#view-logs');
    const initLogsButton = logsView
      ? [...logsView.querySelectorAll('button')].find((button) => String(button.textContent || '').trim() === '初始化 DB')
      : null;
    const actionGroup = initLogsButton?.parentElement;
    const existingButtons = actionGroup ? [...actionGroup.querySelectorAll('[data-admin-runtime-action^="d1-schema-"]')] : [];
    if (!actionGroup || app?.isSettingsExpertMode?.() !== true) {
      for (const button of existingButtons) button.remove();
      return;
    }
    let statusButton = actionGroup.querySelector('[data-admin-runtime-action="d1-schema-status"]');
    if (!statusButton) {
      statusButton = createRuntimeActionButton(initLogsButton, 'd1-schema-status', 'Schema 状态', 'list-checks', () => app.getD1SchemaStatusFromUi());
      initLogsButton.insertAdjacentElement('afterend', statusButton);
    }
    if (!actionGroup.querySelector('[data-admin-runtime-action="d1-schema-init"]')) {
      const initSchemaButton = createRuntimeActionButton(initLogsButton, 'd1-schema-init', '初始化 Schema', 'database-zap', () => app.initD1SchemaFromUi());
      statusButton.insertAdjacentElement('afterend', initSchemaButton);
    }
  }

  function syncSecretExportButton(app) {
    const settingsView = document.querySelector('#view-settings');
    const defaultExportButton = settingsView
      ? [...settingsView.querySelectorAll('button')].find((button) => String(button.textContent || '').trim() === '导出全局设置')
      : null;
    defaultExportButton?.setAttribute('title', '默认导出已脱敏，不包含 API Token 等密钥');
    const actionGroup = defaultExportButton?.parentElement;
    const existingButton = actionGroup?.querySelector('[data-admin-runtime-action="export-settings-secrets"]') || null;
    if (!actionGroup || app?.isSettingsExpertMode?.() !== true) {
      existingButton?.remove();
      return;
    }
    if (existingButton) return;
    const button = createRuntimeActionButton(
      defaultExportButton,
      'export-settings-secrets',
      '导出含密钥设置',
      'key-round',
      () => app.exportSettingsWithSecretsFromUi()
    );
    button.className = 'px-4 py-2 border border-amber-300 text-amber-700 rounded-xl text-sm transition hover:bg-amber-100 dark:border-amber-900/40 dark:text-amber-300 dark:hover:bg-amber-900/20';
    defaultExportButton.insertAdjacentElement('afterend', button);
  }

  function syncPlaybackInfoModeCopy() {
    const select = document.querySelector('#form-playback-info-mode');
    if (!select) return;
    const passthrough = select.querySelector('option[value="passthrough"]');
    const rewrite = select.querySelector('option[value="rewrite"]');
    if (passthrough) passthrough.textContent = '透传';
    if (rewrite) rewrite.textContent = '改写模式';
  }

  function normalizeMediaAggregationNodeCredentialState(value = {}) {
    const username = String(value?.mediaAggregationEmbyUsername || '').trim();
    const passwordConfigured = value?.mediaAggregationEmbyPasswordConfigured === true
      || value?.mediaAggregationEmbyCredentialsConfigured === true
      || String(value?.mediaAggregationEmbyPassword || '').length > 0;
    return {
      username,
      passwordConfigured,
      configured: Boolean(username && passwordConfigured)
    };
  }

  function syncNodeMediaAggregationCredentialFields(app) {
    const nodeModal = document.querySelector('#node-modal');
    const advancedContent = nodeModal?.querySelector('[data-admin-node-advanced-content="1"]');
    const playbackInfoField = nodeModal?.querySelector('#form-playback-info-mode');
    if (!nodeModal || !advancedContent || !playbackInfoField) return;
    let panel = nodeModal.querySelector('[data-admin-node-media-credentials="1"]');
    if (!panel) {
      panel = document.createElement('section');
      panel.setAttribute('data-admin-node-media-credentials', '1');
      panel.innerHTML = '<div class="flex items-start justify-between gap-3"><div><div class="text-sm font-semibold text-slate-900 dark:text-white">节点聚合账号</div><p class="mt-1 text-xs leading-5 text-slate-500">节点固定账号优先于全局账号；关闭后使用全局聚合账号。</p></div><i data-lucide="key-round" class="mt-0.5 h-4 w-4 text-sky-600" aria-hidden="true"></i></div><label class="mt-1 flex items-start gap-2 text-sm text-slate-700 dark:text-slate-300"><input data-admin-node-media-credentials-enabled="1" type="checkbox" class="mt-0.5 h-4 w-4 rounded" /><span><strong class="font-medium">使用节点固定 Emby 账号</strong><span data-admin-node-media-credentials-status="1" class="mt-0.5 block text-xs text-slate-500"></span></span></label><div data-admin-node-media-credentials-grid="1"><label class="block text-xs text-slate-500">节点 Emby 账号<input data-admin-node-media-username="1" type="text" autocomplete="username" class="mt-1 w-full border border-slate-200 bg-white p-2 text-sm outline-none dark:border-slate-700 dark:bg-slate-900 dark:text-white" /></label><label class="block text-xs text-slate-500">节点 Emby 密码<input data-admin-node-media-password="1" type="password" autocomplete="new-password" class="mt-1 w-full border border-slate-200 bg-white p-2 text-sm outline-none dark:border-slate-700 dark:bg-slate-900 dark:text-white" /></label></div>';
      advancedContent.insertAdjacentElement('afterbegin', panel);
      panel.querySelector('[data-admin-node-media-credentials-enabled="1"]')?.addEventListener('change', (event) => {
        const form = app.nodeModalForm && typeof app.nodeModalForm === 'object' ? app.nodeModalForm : {};
        app.nodeModalForm = {
          ...form,
          mediaAggregationEmbyUseNodeCredentials: event.currentTarget?.checked === true
        };
        syncNodeMediaAggregationCredentialFields(app);
      });
      panel.querySelector('[data-admin-node-media-username="1"]')?.addEventListener('input', (event) => {
        const form = app.nodeModalForm && typeof app.nodeModalForm === 'object' ? app.nodeModalForm : {};
        app.nodeModalForm = {
          ...form,
          mediaAggregationEmbyUsername: String(event.currentTarget?.value || '')
        };
      });
      panel.querySelector('[data-admin-node-media-password="1"]')?.addEventListener('input', (event) => {
        const form = app.nodeModalForm && typeof app.nodeModalForm === 'object' ? app.nodeModalForm : {};
        app.nodeModalForm = {
          ...form,
          mediaAggregationEmbyPassword: String(event.currentTarget?.value || '')
        };
      });
      scheduleIconRefresh(panel);
    }
    const form = app?.nodeModalForm && typeof app.nodeModalForm === 'object' ? app.nodeModalForm : {};
    const credentialState = normalizeMediaAggregationNodeCredentialState(form);
    const useNodeCredentials = Object.prototype.hasOwnProperty.call(form, 'mediaAggregationEmbyUseNodeCredentials')
      ? form.mediaAggregationEmbyUseNodeCredentials === true
      : credentialState.configured;
    const enabledInput = panel.querySelector('[data-admin-node-media-credentials-enabled="1"]');
    const usernameInput = panel.querySelector('[data-admin-node-media-username="1"]');
    const passwordInput = panel.querySelector('[data-admin-node-media-password="1"]');
    const status = panel.querySelector('[data-admin-node-media-credentials-status="1"]');
    if (enabledInput) enabledInput.checked = useNodeCredentials;
    if (usernameInput && usernameInput.value !== String(form.mediaAggregationEmbyUsername || '')) {
      usernameInput.value = String(form.mediaAggregationEmbyUsername || '');
    }
    if (passwordInput) {
      passwordInput.disabled = !useNodeCredentials;
      passwordInput.placeholder = credentialState.passwordConfigured ? '已配置，留空保持不变' : '输入节点固定 Emby 密码';
    }
    if (usernameInput) usernameInput.disabled = !useNodeCredentials;
    if (status) {
      status.textContent = useNodeCredentials
        ? (credentialState.passwordConfigured ? '已配置节点账号密码；留空密码将保持原密码。' : '请同时填写节点账号和密码。')
        : '当前使用全局聚合账号。';
    }
  }

  function patchMediaAggregationNodeCredentials(app) {
    if (!app || patchedMediaAggregationNodeApp === app) return;
    patchedMediaAggregationNodeApp = app;
    if (typeof app.buildNodeModalFormState === 'function') {
      const buildNodeModalFormState = app.buildNodeModalFormState.bind(app);
      app.buildNodeModalFormState = function buildNodeModalFormStateWithMediaCredentials(...args) {
        const result = buildNodeModalFormState(...args);
        const rawNode = args[0] && typeof args[0] === 'object' ? args[0] : {};
        const credentialState = normalizeMediaAggregationNodeCredentialState(rawNode);
        if (result?.form && typeof result.form === 'object') {
          result.form.mediaAggregationEmbyUsername = credentialState.username;
          result.form.mediaAggregationEmbyPassword = '';
          result.form.mediaAggregationEmbyPasswordConfigured = credentialState.passwordConfigured;
          result.form.mediaAggregationEmbyUseNodeCredentials = rawNode.mediaAggregationEmbyCredentialsConfigured === true
            || credentialState.configured;
        }
        return result;
      };
    }
    if (typeof app.saveNode === 'function') {
      const saveNode = app.saveNode.bind(app);
      app.saveNode = async function saveNodeWithMediaCredentials(...args) {
        const form = this.nodeModalForm && typeof this.nodeModalForm === 'object' ? this.nodeModalForm : {};
        const useNodeCredentials = form.mediaAggregationEmbyUseNodeCredentials === true;
        const username = String(form.mediaAggregationEmbyUsername || '').trim();
        const password = String(form.mediaAggregationEmbyPassword || '');
        const passwordConfigured = form.mediaAggregationEmbyPasswordConfigured === true;
        if (useNodeCredentials && (!username || (!password && !passwordConfigured))) {
          this.setNodeModalFeedback?.('节点固定 Emby 账号和密码必须同时填写。', 'warning');
          this.setNodeModalFieldError?.('mediaAggregationCredentials', '请同时填写节点账号和密码');
          return null;
        }
        this.__mediaAggregationNodeCredentialPayload = {
          mediaAggregationEmbyUsername: useNodeCredentials ? username : '',
          ...(useNodeCredentials && password ? { mediaAggregationEmbyPassword: password } : {}),
          ...(!useNodeCredentials ? { mediaAggregationEmbyPassword: '' } : {})
        };
        try {
          return await saveNode(...args);
        } finally {
          delete this.__mediaAggregationNodeCredentialPayload;
        }
      };
    }
    if (typeof app.apiCall === 'function') {
      const apiCall = app.apiCall.bind(app);
      app.apiCall = function apiCallWithMediaCredentials(action, payload, ...args) {
        if (action === 'save' && this.__mediaAggregationNodeCredentialPayload && payload && typeof payload === 'object') {
          payload = { ...payload, ...this.__mediaAggregationNodeCredentialPayload };
        }
        return apiCall(action, payload, ...args);
      };
    }
  }

  function getMediaAggregationNodes(app) {
    return (Array.isArray(app?.nodes) ? app.nodes : [])
      .filter((node) => node && String(node.name || '').trim())
      .sort((left, right) => String(left.name || '').localeCompare(String(right.name || ''), 'zh-Hans-CN'));
  }

  function hasMediaAggregationGlobalCredentials() {
    return Boolean(
      String(mediaAggregationState.username || '').trim()
      && (String(mediaAggregationState.password || '').length > 0 || mediaAggregationState.hasPassword)
    );
  }

  function hasMediaAggregationNodeCredentials(node) {
    return node?.mediaAggregationEmbyCredentialsConfigured === true;
  }

  function canSelectMediaAggregationNode(node) {
    return hasMediaAggregationNodeCredentials(node) || hasMediaAggregationGlobalCredentials();
  }

  function updateMediaAggregationSummary() {
    const root = mediaAggregationState.root;
    const summary = root?.querySelector('[data-media-aggregation-summary="1"]');
    if (!summary) return;
    const count = mediaAggregationState.selected.size;
    summary.textContent = count >= 2
      ? '已选择 ' + count + ' 个节点，池内任一节点均会聚合其他节点版本。'
      : count === 1
        ? '还需至少选择 1 个节点才能形成聚合池。'
        : '未启用影视资源版本聚合。';
  }

  function renderMediaAggregationNodeList(app) {
    const root = mediaAggregationState.root;
    const list = root?.querySelector('[data-media-aggregation-list="1"]');
    if (!list) return;
    const keyword = String(mediaAggregationState.search || '').trim().toLowerCase();
    const nodes = getMediaAggregationNodes(app).filter((node) => !keyword || (
      String(node.displayName || '') + ' ' + String(node.name || '') + ' '
      + String(node.tag || '') + ' ' + String(node.remark || '')
    ).toLowerCase().includes(keyword));
    const globalCredentialsAvailable = hasMediaAggregationGlobalCredentials();
    const signature = JSON.stringify(nodes.map((node) => [
      node.name,
      node.displayName,
      node.tag,
      node.remark,
      node.mediaAggregationEmbyCredentialsConfigured === true,
      globalCredentialsAvailable,
      mediaAggregationState.selected.has(String(node.name).toLowerCase())
    ]));
    if (signature === mediaAggregationState.renderSignature && list.childElementCount) {
      updateMediaAggregationSummary();
      return;
    }
    mediaAggregationState.renderSignature = signature;
    list.replaceChildren();
    for (const node of getMediaAggregationNodes(app)) {
      const key = String(node.name || '').trim().toLowerCase();
      if (mediaAggregationState.selected.has(key) && !canSelectMediaAggregationNode(node)) {
        mediaAggregationState.selected.delete(key);
        mediaAggregationState.dirty = true;
      }
    }
    if (!nodes.length) {
      const empty = document.createElement('div');
      empty.className = 'px-3 py-2 text-sm text-slate-500';
      empty.textContent = keyword ? '没有匹配的节点' : '暂无可选节点';
      list.appendChild(empty);
    }
    for (const node of nodes) {
      const name = String(node.name || '').trim();
      const key = name.toLowerCase();
      const available = canSelectMediaAggregationNode(node);
      const label = document.createElement('label');
      label.setAttribute('data-media-aggregation-item', '1');
      label.setAttribute('data-media-aggregation-available', available ? '1' : '0');
      label.title = available
        ? '可使用节点固定账号或全局聚合账号'
        : '请先为节点配置完整账号密码，或填写全局聚合账号密码';
      const checkbox = document.createElement('input');
      checkbox.type = 'checkbox';
      checkbox.disabled = !available;
      checkbox.checked = mediaAggregationState.selected.has(key);
      checkbox.addEventListener('change', () => {
        if (checkbox.checked) mediaAggregationState.selected.add(key);
        else mediaAggregationState.selected.delete(key);
        mediaAggregationState.dirty = true;
        mediaAggregationState.renderSignature = '';
        updateMediaAggregationSummary();
      });
      const content = document.createElement('div');
      content.className = 'min-w-0 flex-1';
      const title = document.createElement('div');
      title.className = 'truncate text-sm font-medium text-slate-900 dark:text-white';
      title.textContent = String(node.displayName || name);
      const meta = document.createElement('div');
      meta.className = 'mt-1 break-all text-xs text-slate-500';
      const credentialText = hasMediaAggregationNodeCredentials(node)
        ? '节点账号已配置'
        : (globalCredentialsAvailable ? '使用全局账号' : '缺少账号密码');
      if (!available) meta.setAttribute('data-media-aggregation-credential-state', 'missing');
      meta.textContent = [name, credentialText, node.tag ? '标签: ' + node.tag : '', node.remark ? '备注: ' + node.remark : ''].filter(Boolean).join(' · ');
      content.append(title, meta);
      label.append(checkbox, content);
      list.appendChild(label);
    }
    updateMediaAggregationSummary();
  }

  async function hydrateMediaAggregationState(app, force = false) {
    if (!app || mediaAggregationState.loading || (mediaAggregationState.hydrated && !force)) return;
    mediaAggregationState.loading = true;
    try {
      const payload = await app.apiCall('getSettingsBootstrap');
      const config = payload?.config && typeof payload.config === 'object' ? payload.config : {};
      mediaAggregationState.selected = new Set((Array.isArray(config.mediaAggregationNodes) ? config.mediaAggregationNodes : [])
        .map((name) => String(name || '').trim().toLowerCase()).filter(Boolean));
      mediaAggregationState.username = String(config.mediaAggregationEmbyUsername || '').trim();
      mediaAggregationState.password = '';
      mediaAggregationState.hasPassword = String(config.mediaAggregationEmbyPassword || '').length > 0;
      mediaAggregationState.bidirectionalProgressEnabled = config.mediaAggregationBidirectionalProgressEnabled === true;
      mediaAggregationState.hydrated = true;
      mediaAggregationState.dirty = false;
      mediaAggregationState.renderSignature = '';
      const usernameInput = mediaAggregationState.root?.querySelector('[data-media-aggregation-username="1"]');
      const passwordInput = mediaAggregationState.root?.querySelector('[data-media-aggregation-password="1"]');
      if (usernameInput) usernameInput.value = mediaAggregationState.username;
      if (passwordInput) {
        passwordInput.value = '';
        passwordInput.placeholder = mediaAggregationState.hasPassword ? '已配置，留空保持不变' : '输入全局默认 Emby 密码';
      }
      const progressInput = mediaAggregationState.root?.querySelector('[data-media-aggregation-progress="1"]');
      if (progressInput) progressInput.checked = mediaAggregationState.bidirectionalProgressEnabled;
      renderMediaAggregationNodeList(app);
    } catch (error) {
      console.error('hydrateMediaAggregationState failed', error);
    } finally {
      mediaAggregationState.loading = false;
    }
  }

  async function saveMediaAggregationState(app) {
    if (!app || mediaAggregationState.loading) return;
    const selectedNodeNames = [...mediaAggregationState.selected];
    const username = String(mediaAggregationState.username || '').trim();
    const password = String(mediaAggregationState.password || '');
    if (selectedNodeNames.length === 1) {
      app.showMessage?.('影视资源版本聚合至少需要两个节点。', { tone: 'warning', modal: true });
      return;
    }
    const nodesByName = new Map(getMediaAggregationNodes(app)
      .map((node) => [String(node.name || '').trim().toLowerCase(), node]));
    const invalidCredentialNames = selectedNodeNames.filter((name) => {
      const node = nodesByName.get(String(name || '').trim().toLowerCase());
      return !node || !canSelectMediaAggregationNode(node);
    });
    if (invalidCredentialNames.length > 0) {
      app.showMessage?.('以下节点缺少可用账号密码，无法勾选: ' + invalidCredentialNames.join(', '), { tone: 'warning', modal: true });
      return;
    }
    const accepted = await app.askConfirm?.(
      selectedNodeNames.length
        ? '将保存聚合池，并把已勾选节点的 PlaybackInfo 模式自动设为“改写模式”。'
        : '将关闭影视资源版本聚合，并把此前由快捷勾选设为改写的节点恢复为继承全局。',
      { title: '保存影视资源版本聚合', tone: 'warning', confirmText: '保存' }
    );
    if (accepted === false) return;
    mediaAggregationState.loading = true;
    const button = mediaAggregationState.root?.querySelector('[data-media-aggregation-save="1"]');
    if (button) button.disabled = true;
    try {
      const requestPayload = {
        selectedNodeNames,
        username,
        bidirectionalProgressEnabled: mediaAggregationState.bidirectionalProgressEnabled
      };
      if (password) requestPayload.password = password;
      const result = await app.apiCall('saveMediaAggregationPolicyShortcuts', requestPayload);
      if (result?.revisions) app.applyAdminRevisions?.(result.revisions);
      mediaAggregationState.hasPassword = Boolean(password || mediaAggregationState.hasPassword);
      mediaAggregationState.password = '';
      mediaAggregationState.dirty = false;
      await Promise.allSettled([app.loadNodes?.(), app.loadSettings?.()]);
      await hydrateMediaAggregationState(app, true);
      app.showMessage?.('影视资源版本聚合设置已保存。', { tone: 'success' });
    } catch (error) {
      console.error('saveMediaAggregationState failed', error);
      app.showMessage?.('影视资源版本聚合保存失败: ' + (error?.message || '未知错误'), { tone: 'error', modal: true });
    } finally {
      mediaAggregationState.loading = false;
      if (button) button.disabled = false;
    }
  }

  function syncMediaAggregationPanel(app) {
    const sourceList = document.querySelector('#cfg-source-direct-nodes-list');
    if (!sourceList || !app) return;
    let root = document.querySelector('[data-media-aggregation-panel="1"]');
    if (!root) {
      root = document.createElement('section');
      root.setAttribute('data-media-aggregation-panel', '1');
      root.innerHTML = '<div class="flex items-start justify-between gap-3"><div><div class="text-sm font-semibold text-slate-900 dark:text-white">影视资源版本聚合</div><p class="mt-1 text-xs leading-5 text-slate-500">按 TMDB / IMDB 匹配池内同一影视；节点固定账号优先，全局账号作为默认兜底。</p></div><i data-lucide="layers-3" class="mt-0.5 h-4 w-4 text-sky-600" aria-hidden="true"></i></div><div class="mt-3" data-media-aggregation-credentials="1"><label class="block text-xs text-slate-500">全局默认 Emby 账号<input data-media-aggregation-username="1" type="text" autocomplete="username" class="mt-1 w-full border border-slate-200 bg-white p-2 text-sm outline-none dark:border-slate-700 dark:bg-slate-900 dark:text-white" /></label><label class="block text-xs text-slate-500">全局默认 Emby 密码<input data-media-aggregation-password="1" type="password" autocomplete="new-password" class="mt-1 w-full border border-slate-200 bg-white p-2 text-sm outline-none dark:border-slate-700 dark:bg-slate-900 dark:text-white" /></label></div><input data-media-aggregation-search="1" type="search" class="mt-3 w-full border border-slate-200 bg-white p-2 text-sm outline-none dark:border-slate-700 dark:bg-slate-900 dark:text-white" placeholder="搜索聚合节点..." /><div class="mt-2 text-xs text-slate-500" data-media-aggregation-summary="1"></div><div class="mt-2" data-media-aggregation-list="1"></div><div data-media-aggregation-actions="1"><p class="text-xs leading-5 text-slate-500">只有具备节点账号或全局账号的节点可以勾选；勾选后会同步把 PlaybackInfo 模式设为改写模式。</p><button data-media-aggregation-save="1" type="button" class="inline-flex min-h-10 items-center justify-center border border-sky-300 px-4 py-2 text-sm font-medium text-sky-700 transition hover:bg-sky-50 dark:border-sky-800 dark:text-sky-300 dark:hover:bg-sky-950/40"><i data-lucide="save" class="mr-2 h-4 w-4" aria-hidden="true"></i>保存聚合设置</button></div>';
      const progressLabel = document.createElement('label');
      progressLabel.className = 'mt-3 flex items-start gap-2 text-sm text-slate-700 dark:text-slate-300';
      progressLabel.innerHTML = '<input data-media-aggregation-progress="1" type="checkbox" class="mt-0.5 h-4 w-4 rounded" /><span><strong class="font-medium">双向同步播放进度</strong><span class="mt-0.5 block text-xs text-slate-500">默认关闭时仅由主服记录；开启后携带聚合 MediaSourceId 的播放事件会静默并发上报备服。</span></span>';
      root.querySelector('[data-media-aggregation-credentials="1"]')?.insertAdjacentElement('afterend', progressLabel);
      sourceList.insertAdjacentElement('afterend', root);
      root.querySelector('[data-media-aggregation-username="1"]')?.addEventListener('input', (event) => {
        mediaAggregationState.username = String(event.target?.value || '');
        mediaAggregationState.dirty = true;
        mediaAggregationState.renderSignature = '';
        renderMediaAggregationNodeList(app);
      });
      root.querySelector('[data-media-aggregation-password="1"]')?.addEventListener('input', (event) => {
        mediaAggregationState.password = String(event.target?.value || '');
        mediaAggregationState.dirty = true;
        mediaAggregationState.renderSignature = '';
        renderMediaAggregationNodeList(app);
      });
      root.querySelector('[data-media-aggregation-progress="1"]')?.addEventListener('change', (event) => {
        mediaAggregationState.bidirectionalProgressEnabled = event.target?.checked === true;
        mediaAggregationState.dirty = true;
      });
      root.querySelector('[data-media-aggregation-search="1"]')?.addEventListener('input', (event) => {
        mediaAggregationState.search = String(event.target?.value || '');
        mediaAggregationState.renderSignature = '';
        renderMediaAggregationNodeList(app);
      });
      root.querySelector('[data-media-aggregation-save="1"]')?.addEventListener('click', () => saveMediaAggregationState(app));
      scheduleIconRefresh(root);
    }
    mediaAggregationState.root = root;
    if (!mediaAggregationState.hydrated) hydrateMediaAggregationState(app);
    else renderMediaAggregationNodeList(app);
  }

  function applySafetyContractEnhancements() {
    const app = window.App;
    if (!app) return;
    patchSafetyContractMethods(app);
    patchMediaAggregationNodeCredentials(app);
    syncNodeMediaAggregationCredentialFields(app);
    ensureServerExpirySettings(app);
    syncD1SchemaActionButtons(app);
    syncSecretExportButton(app);
    syncPlaybackInfoModeCopy();
    syncMediaAggregationPanel(app);
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
          attributeFilter: ['class', 'open']
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
