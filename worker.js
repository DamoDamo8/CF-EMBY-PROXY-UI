function Ds(n) {
  const e = String(n || "").trim();
  if (!/^\d+$/.test(e)) return null;
  const a = Number(e);
  return Number.isFinite(a) ? a : null;
}
function Zn(n) {
  if (n == null) return "";
  try {
    return n instanceof ArrayBuffer ? new TextDecoder().decode(new Uint8Array(n)) : ArrayBuffer.isView(n) ? new TextDecoder().decode(n) : String(n || "");
  } catch {
    return "";
  }
}
async function Ns(n, e) {
  const a = Math.max(0, Math.floor(Number(e) || 0)), t = Ds(n?.headers?.get?.("Content-Length"));
  if (Number.isFinite(t) && t > a) {
    try {
      Promise.resolve(n?.body?.cancel?.()).catch(() => {
      });
    } catch {
    }
    return {
      bodyBytes: /* @__PURE__ */ new Uint8Array(0),
      bytes: t,
      exceeded: !0
    };
  }
  if (!n?.body) return {
    bodyBytes: /* @__PURE__ */ new Uint8Array(0),
    bytes: 0,
    exceeded: !1
  };
  const r = n.body.getReader(), o = [];
  let s = 0;
  try {
    for (; ; ) {
      const { done: l, value: u } = await r.read();
      if (l) break;
      const d = u instanceof Uint8Array ? u : new Uint8Array(u || 0);
      if (s + d.byteLength > a) {
        try {
          Promise.resolve(r.cancel()).catch(() => {
          });
        } catch {
        }
        return {
          bodyBytes: /* @__PURE__ */ new Uint8Array(0),
          bytes: s + d.byteLength,
          exceeded: !0
        };
      }
      o.push(d), s += d.byteLength;
    }
  } catch {
    return {
      bodyBytes: /* @__PURE__ */ new Uint8Array(0),
      bytes: s,
      exceeded: !0
    };
  } finally {
    try {
      r.releaseLock();
    } catch {
    }
  }
  const i = new Uint8Array(s);
  let c = 0;
  for (const l of o)
    i.set(l, c), c += l.byteLength;
  return {
    bodyBytes: i,
    bytes: s,
    exceeded: !1
  };
}
async function xe(n, e) {
  const a = await Ns(n, e);
  return {
    text: a.exceeded ? "" : new TextDecoder().decode(a.bodyBytes),
    bytes: a.bytes,
    exceeded: a.exceeded
  };
}
function Ja(n) {
  let e = /* @__PURE__ */ new WeakMap(), a = n(), t = a;
  return {
    get(r = null) {
      if (!r || typeof r != "object" && typeof r != "function") return a;
      let o = e.get(r);
      return o || (o = n(), e.set(r, o)), t = o, o;
    },
    current() {
      return t;
    },
    reset() {
      e = /* @__PURE__ */ new WeakMap(), a = n(), t = a;
    }
  };
}
function kc(n, e = 8192) {
  const a = Math.max(2, Math.floor(Number(e) || 8192)), t = Math.max(1, Math.min(32, Math.floor(a / 256))), r = Math.max(16, Math.min(512, Math.floor(a / Math.max(4, t * 2)))), o = 4, s = Math.max(8, Math.min(256, Math.floor(a / 32))), i = /* @__PURE__ */ new WeakSet();
  let c = 0, l = !1;
  const u = (f, m = 0) => {
    if (f == null) return f;
    if (typeof f == "string")
      return f.length <= r ? f : (l = !0, `${f.slice(0, r)}...`);
    if (typeof f == "number" || typeof f == "boolean") return f;
    if (typeof f == "bigint" || typeof f != "object") return String(f);
    if (i.has(f)) return "[Circular]";
    if (m >= o || c >= s)
      return l = !0, "[Truncated]";
    c += 1, i.add(f);
    try {
      if (Array.isArray(f)) {
        const h = [];
        for (let y = 0; y < f.length && y < t; y += 1) h.push(u(f[y], m + 1));
        return f.length > t && (l = !0, h.push("[Truncated]")), h;
      }
      const p = {};
      let g = 0;
      for (const h in f) {
        if (!Object.prototype.hasOwnProperty.call(f, h)) continue;
        if (g >= t) {
          l = !0, p._truncated = !0;
          break;
        }
        const y = h.length > r ? `${h.slice(0, r)}...` : h;
        p[y] = u(f[h], m + 1), g += 1;
      }
      return p;
    } finally {
      i.delete(f);
    }
  };
  try {
    const f = JSON.stringify(u(n));
    if (!l && f && f.length <= a) return f;
  } catch {
  }
  const d = JSON.stringify({ truncated: !0 });
  return d.length <= a ? d : "{}";
}
function ce(n = "") {
  const e = String(n || "");
  let a = 2166136261;
  for (let t = 0; t < e.length; t += 1)
    a ^= e.charCodeAt(t), a = Math.imul(a, 16777619);
  return (a >>> 0).toString(36);
}
function Fo(n = []) {
  const e = Array.isArray(n) ? n : [n];
  let a = 2166136261;
  const t = (r) => {
    for (let o = 0; o < 32; o += 8)
      a ^= r >>> o & 255, a = Math.imul(a, 16777619);
  };
  t(e.length);
  for (const r of e) {
    const o = String(r ?? "");
    t(o.length);
    for (let s = 0; s < o.length; s += 1)
      a ^= o.charCodeAt(s), a = Math.imul(a, 16777619);
  }
  return (a >>> 0).toString(36);
}
function _n(n = "") {
  const e = new TextEncoder().encode(String(n || ""));
  let a = 14695981039346656037n;
  const t = 1099511628211n;
  for (const r of e)
    a ^= BigInt(r), a = BigInt.asUintN(64, a * t);
  return a.toString(16).padStart(16, "0");
}
async function Ln(n = "") {
  const e = await globalThis.crypto.subtle.digest("SHA-256", new TextEncoder().encode(String(n || "")));
  return [...new Uint8Array(e)].map((a) => a.toString(16).padStart(2, "0")).join("");
}
function ut(n) {
  const e = Array.isArray(n) ? n : String(n || "").split(/[\\r\\n,，;；|]+/), a = /* @__PURE__ */ new Set(), t = [];
  for (const r of e) {
    const o = String(r || "").trim();
    if (!o) continue;
    const s = o.toLowerCase();
    a.has(s) || (a.add(s), t.push(o));
  }
  return t;
}
function eo(n) {
  const e = String(n || "").trim().toLowerCase();
  if (!e) return null;
  const a = e.includes("*"), t = e.replace(/^\*\./, "").replace(/^\*+/, "").replace(/\*+$/g, "").replace(/^\.+|\.+$/g, "");
  return t ? {
    hostname: t,
    wildcard: a
  } : null;
}
function ee(n) {
  return eo(n)?.hostname || "";
}
function bt(n = []) {
  const e = Array.isArray(n) ? n : [n], a = [], t = /* @__PURE__ */ new Set();
  for (const r of e) {
    const o = String(r || "").trim();
    !o || t.has(o) || (t.add(o), a.push(o));
  }
  return a;
}
function F(n) {
  return !!n && typeof n == "object" && !Array.isArray(n);
}
function de(n, e, a, t) {
  let r;
  if (typeof n == "number") r = n;
  else if (typeof n == "string") {
    const o = n.trim();
    if (!/^-?\d+$/.test(o)) return e;
    r = Number(o);
  } else return e;
  return Number.isFinite(r) ? Math.min(t, Math.max(a, Math.floor(r))) : e;
}
function Kc(n, e, a, t) {
  const r = Number(n);
  return Number.isFinite(r) ? Math.min(t, Math.max(a, r)) : e;
}
function sa(n, e) {
  return !!n && typeof n == "object" && Object.prototype.hasOwnProperty.call(n, e);
}
function Ta(n) {
  return String(n || "").replace(/[\\%_]/g, "\\$&");
}
function zc(n) {
  const e = String(n || "").trim();
  return e ? /^(?:\d{1,3}\.){3}\d{1,3}$/.test(e) ? !0 : /^[0-9a-f:]+$/i.test(e) && e.includes(":") : !1;
}
function Uo(n) {
  const e = String(n || "").trim();
  return e ? /^[a-z]{3,4}$/i.test(e) : !1;
}
function $c() {
  return {
    phase: 0,
    lastRunAt: 0,
    iterators: {
      node: null,
      playbackRoute: null,
      crypto: null,
      rate: null,
      log: null,
      playbackInfo: null,
      failover: null,
      progress: null,
      monthlyTraffic: null
    }
  };
}
function Bc() {
  const n = Ja(() => ({ namespaces: /* @__PURE__ */ new Map() }));
  let e = "default";
  const a = (t, r = "default") => {
    const o = String(r || "default").trim() || "default";
    let s = t.namespaces.get(o);
    return s || (s = {
      ConfigCache: null,
      RuntimeConfigCacheGeneration: 0,
      SingleFlightTasks: /* @__PURE__ */ new Map()
    }, t.namespaces.set(o, s)), e = o, s;
  };
  return {
    get(t = null, r = "default") {
      return a(n.get(t), r);
    },
    current() {
      return a(n.current(), e);
    },
    reset() {
      n.reset(), e = "default";
    }
  };
}
function Wc() {
  const n = Ja(() => ({
    KvDataMutationChain: Promise.resolve(),
    KvTidyMutationChain: Promise.resolve()
  }));
  return {
    get(e = null) {
      return n.get(e);
    },
    current() {
      return n.current();
    },
    reset() {
      n.reset();
    }
  };
}
function ir(n = globalThis) {
  try {
    return n?.caches?.default ?? null;
  } catch {
    return null;
  }
}
function Mn(n = globalThis) {
  return n.crypto.subtle;
}
function Ho(n) {
  return String(n || "").trim();
}
function Vc(n = [], e = {}) {
  const a = /* @__PURE__ */ Object.create(null), t = /* @__PURE__ */ new Map();
  for (const s of n) {
    const i = Ho(s?.name) || "anonymous", c = s?.handlers && typeof s.handlers == "object" ? s.handlers : s;
    for (const [l, u] of Object.entries(c || {})) {
      if (typeof u != "function") throw new TypeError(`Admin action ${l} from ${i} is not a function`);
      if (a[l]) throw new Error(`Duplicate admin action ${l}: ${t.get(l)} and ${i}`);
      a[l] = u, t.set(l, i);
    }
  }
  const r = Object.freeze({ ...e.aliases || {} });
  for (const [s, i] of Object.entries(r)) if (!a[i]) throw new Error(`Admin action alias ${s} targets missing action ${i}`);
  for (const s of e.requiredActions || []) if (!a[s]) throw new Error(`Missing required admin action ${s}`);
  const o = Object.freeze({ ...a });
  return Object.freeze({
    handlers: o,
    names: Object.freeze(Object.keys(o).sort()),
    resolve(s) {
      const i = Ho(s);
      return o[r[i] || i] || null;
    }
  });
}
function Gc(n) {
  function e(t, r = null) {
    if (typeof t != "function") {
      const i = t;
      return (c) => e(c, i);
    }
    const o = n.get(r), s = o.KvDataMutationChain.catch(() => null).then(() => t());
    return o.KvDataMutationChain = s.catch(() => null), s;
  }
  function a(t, r = null) {
    if (typeof t != "function") {
      const i = t;
      return (c) => a(c, i);
    }
    const o = n.get(r), s = o.KvTidyMutationChain.catch(() => null).then(() => e(t, r));
    return o.KvTidyMutationChain = s.catch(() => null), s;
  }
  return Object.freeze({
    runDataMutation: e,
    runTidyMutation: a
  });
}
function jc() {
  return Ja(() => ({
    LogQueue: [],
    LogDedupe: /* @__PURE__ */ new Map(),
    LogFlushPending: !1,
    LogFlushTask: null,
    LogClearEpochMs: 0,
    LogLastFlushAt: 0,
    runtimeConfig: null
  }));
}
function cr(n = "") {
  return String(n || "").trim().toLowerCase().split(";", 1)[0].trim();
}
function Pa(n = "") {
  const e = cr(n);
  return e === "application/json" || e === "text/json" || /^application\/[a-z0-9!#$&^_.+-]+\+json$/i.test(e);
}
function Ls(n = "") {
  const e = cr(n);
  return e === "text/html" || e === "application/xhtml+xml";
}
function qc(n = "", e = "text/html") {
  const a = cr(e);
  if (!Ls(a)) return !1;
  const [t, r] = a.split("/", 2);
  let o = -1, s = 0;
  for (const i of String(n || "").split(",")) {
    const [c, ...l] = i.split(";"), [u, d] = cr(c).split("/", 2);
    let f = -1;
    if (u === t && d === r ? f = 2 : u === t && d === "*" ? f = 1 : u === "*" && d === "*" && (f = 0), f < o || f < 0) continue;
    let m = 1;
    for (const p of l) {
      const [g, h] = p.split("=", 2);
      if (String(g || "").trim().toLowerCase() !== "q") continue;
      const y = String(h || "").trim();
      m = /^(?:0(?:\.\d{0,3})?|1(?:\.0{0,3})?)$/.test(y) ? Number(y) : 0;
      break;
    }
    f > o && (o = f, s = m);
  }
  return s > 0;
}
function In(n, e, a = {}) {
  const t = e?.response, r = Math.max(400, Number(a.status) || 502), o = String(a.statusText || (r === 502 ? "Bad Gateway" : "Error")).trim(), s = new Headers(t?.headers || {});
  [
    "Accept-Ranges",
    "Content-Disposition",
    "Content-Encoding",
    "Content-Length",
    "Content-MD5",
    "Content-Range",
    "Digest",
    "ETag",
    "Last-Modified",
    "Location",
    "Refresh",
    "Set-Cookie",
    "Transfer-Encoding"
  ].forEach((u) => s.delete(u)), s.set("Content-Type", "application/json; charset=utf-8"), s.set("Cache-Control", "no-store"), s.delete("X-Proxy-Mime-Guard"), s.delete("X-Proxy-Contract-Guard");
  const i = String(a.guardHeader || "").trim(), c = String(a.guardValue || "").trim();
  i && c && s.set(i, c);
  const l = {
    error: String(a.error || o || "Error"),
    code: r,
    message: String(a.message || "The API response did not satisfy the proxy contract."),
    ...a.details && typeof a.details == "object" && !Array.isArray(a.details) ? { details: a.details } : {}
  };
  try {
    Promise.resolve(t?.body?.cancel?.()).catch(() => {
    });
  } catch {
  }
  return n && typeof n == "object" && (n.proxyGuardState = c), {
    ...e,
    response: new Response(n?.requestMethod === "HEAD" ? null : JSON.stringify(l), {
      status: r,
      statusText: o,
      headers: s
    })
  };
}
function Xc(n, e, a = {}) {
  const t = e?.response;
  if (!t || n?.requestTraits?.isApiRequest !== !0 || t.status === 101 || t.status === 204 || t.status === 205 || t.status === 304) return e;
  const r = typeof a.sanitizePath == "function" ? a.sanitizePath : (s) => String(s || "/"), o = t.headers.get("Content-Type");
  return (n?.requestMethod === "GET" || n?.requestMethod === "HEAD") && r(n?.proxyPath || "/") === "/" && qc(n?.request?.headers?.get("Accept"), o) || !Ls(o) ? e : (typeof a.buildErrorState == "function" ? a.buildErrorState : In)(n, e, {
    message: "Upstream API returned an HTML document instead of API data.",
    guardHeader: "X-Proxy-Mime-Guard",
    guardValue: "html-document",
    details: {
      upstreamStatus: t.status,
      contentType: cr(o) || "missing"
    }
  });
}
var Yc = "playback-info", Ms = /* @__PURE__ */ new WeakSet();
function to(n) {
  if (!n || typeof n != "object" || Array.isArray(n)) return !1;
  const e = Object.getPrototypeOf(n);
  return e === Object.prototype || e === null;
}
function xa(n = "") {
  let e;
  try {
    e = JSON.parse(String(n || ""));
  } catch {
    return null;
  }
  return to(e) ? e : null;
}
function ro({ response: n, bodyText: e, bodyBytes: a, payload: t }) {
  if (!n || !to(t)) return null;
  const r = Object.freeze({
    contract: Yc,
    response: n,
    bodyText: String(e || ""),
    bodyBytes: Math.max(0, Number(a) || 0),
    payload: t
  });
  return Ms.add(r), r;
}
function Qt(n) {
  return Ms.has(n) && n?.contract === "playback-info" && !!n.response && typeof n.bodyText == "string" && Number.isFinite(n.bodyBytes) && n.bodyBytes >= 0 && to(n.payload);
}
function bn(n, e) {
  return Object.freeze({
    kind: "invalid",
    reason: e,
    details: Object.freeze({
      reason: e,
      upstreamStatus: Number(n?.status) || 0,
      contentType: cr(n?.headers?.get?.("Content-Type")) || "missing"
    })
  });
}
async function Jc(n, e = {}) {
  const a = String(e.requestMethod || "GET").toUpperCase();
  if (!n || !(n.status >= 200 && n.status < 300) || a === "HEAD" || n.status === 204 || n.status === 205 || !n.body) return Object.freeze({ kind: "skip" });
  if (!Pa(n.headers.get("Content-Type"))) return bn(n, "unsupported_content_type");
  const t = await xe(n.clone(), e.maxBytes);
  if (t.exceeded) return bn(n, "body_too_large");
  const r = xa(t.text);
  return r ? Object.freeze({
    kind: "valid",
    representation: ro({
      response: n,
      bodyText: t.text,
      bodyBytes: t.bytes,
      payload: r
    })
  }) : bn(n, "invalid_root_object");
}
function ao(n) {
  const e = n instanceof Headers ? new Headers(n) : new Headers(n || {});
  return [
    "Content-Encoding",
    "Content-Length",
    "Content-MD5",
    "Digest",
    "ETag",
    "Transfer-Encoding"
  ].forEach((a) => e.delete(a)), e.set("Content-Type", "application/json; charset=utf-8"), e;
}
function Oa(n) {
  if (typeof n != "string") return n;
  const e = n.trim();
  if (!e || !e.startsWith("{") && !e.startsWith("[")) return n;
  try {
    return JSON.parse(e);
  } catch {
    return n;
  }
}
function no(n) {
  const e = Oa(n);
  if (!Array.isArray(e)) return {
    items: [],
    changed: !0
  };
  let a = e !== n;
  const t = [];
  for (const r of e) {
    const o = Oa(r);
    if (!o || typeof o != "object" || Array.isArray(o)) {
      a = !0;
      continue;
    }
    o !== r && (a = !0), t.push(o);
  }
  return {
    items: t,
    changed: a
  };
}
function Is(n) {
  let e = n, a = !1;
  const t = (r, o) => {
    e === n && (e = { ...n }), e[r] = o, a = !0;
  };
  for (const r of ["MediaStreams", "MediaAttachments"]) {
    if (!Object.prototype.hasOwnProperty.call(n, r)) continue;
    const o = no(n[r]);
    o.changed && t(r, o.items);
  }
  if (Object.prototype.hasOwnProperty.call(n, "RequiredHttpHeaders")) {
    const r = Oa(n.RequiredHttpHeaders);
    !r || typeof r != "object" || Array.isArray(r) ? t("RequiredHttpHeaders", {}) : r !== n.RequiredHttpHeaders && t("RequiredHttpHeaders", r);
  }
  return {
    mediaSource: e,
    changed: a
  };
}
function oo(n) {
  if (!n || typeof n != "object" || Array.isArray(n) || !Object.prototype.hasOwnProperty.call(n, "MediaSources")) return {
    payload: n,
    rewriteState: "not_needed"
  };
  const e = no(n.MediaSources);
  let a = e.changed;
  const t = e.items.map((r) => {
    const o = Is(r);
    return o.changed && (a = !0), o.mediaSource;
  });
  return a ? {
    payload: {
      ...n,
      MediaSources: t
    },
    rewriteState: "applied"
  } : {
    payload: n,
    rewriteState: "not_needed"
  };
}
function Ps(n, e = {}) {
  const a = oo(n), t = a.payload;
  if (!t || typeof t != "object" || Array.isArray(t) || !Array.isArray(t.MediaSources)) return {
    payload: n,
    rewriteState: "not_needed"
  };
  const r = typeof e.buildProxyUrl == "function" ? e.buildProxyUrl : () => "";
  let o = a.rewriteState === "applied";
  const s = t.MediaSources.map((i) => {
    let c = i;
    const l = (p, g, h = {}) => {
      const y = Object.prototype.hasOwnProperty.call(c, p);
      h.onlyIfPresent === !0 && !y || c[p] === g && !(h.ensurePresent === !0 && !y) || (c === i && (c = { ...i }), c[p] = g, o = !0);
    }, u = String(i.DirectStreamUrl || "").trim(), d = String(i.Path || "").trim(), f = u || d, m = f ? r(f) : "";
    return m ? (l("DirectStreamUrl", m, { ensurePresent: !0 }), l("Path", m, { ensurePresent: !0 })) : l("Path", "", { ensurePresent: !0 }), l("IsRemote", !1, { ensurePresent: !0 }), l("Protocol", "Http", { ensurePresent: !0 }), l("SupportsTranscoding", !1, { ensurePresent: !0 }), l("TranscodingUrl", "", { ensurePresent: !0 }), l("TranscodingSubProtocol", "", { onlyIfPresent: !0 }), l("TranscodingContainer", "", { onlyIfPresent: !0 }), l("TranscodingType", "", { onlyIfPresent: !0 }), c;
  });
  return o ? {
    payload: {
      ...t,
      MediaSources: s
    },
    rewriteState: "applied"
  } : {
    payload: n,
    rewriteState: "not_needed"
  };
}
function Qc(n, e = {}) {
  if (!Qt(n)) return {
    kind: "invalid",
    reason: "invalid_representation"
  };
  const a = e.rewriteEnabled === !0 ? Ps(n.payload, { buildProxyUrl: e.buildProxyUrl }) : oo(n.payload);
  if (a.rewriteState !== "applied") return {
    kind: "valid",
    representation: n,
    rewriteState: e.rewriteEnabled === !0 ? "not_needed" : "passthrough"
  };
  const t = JSON.stringify(a.payload), r = new TextEncoder().encode(t).byteLength, o = n.response;
  try {
    Promise.resolve(o.body?.cancel?.()).catch(() => {
    });
  } catch {
  }
  return {
    kind: "valid",
    representation: ro({
      response: new Response(t, {
        status: o.status,
        statusText: o.statusText,
        headers: ao(o.headers)
      }),
      bodyText: t,
      bodyBytes: r,
      payload: a.payload
    }),
    rewriteState: "applied"
  };
}
function wa(n) {
  return new TextEncoder().encode(String(n || "")).byteLength;
}
var Zc = class {
  constructor(n = {}) {
    if (!(n.entries instanceof Map)) throw new TypeError("PlaybackInfoCacheStore requires a Map");
    this.entries = n.entries, this.now = typeof n.now == "function" ? n.now : Date.now, this.maxEntries = Math.max(1, Number(n.maxEntries) || 1), this.maxEntryBytes = Math.max(1, Number(n.maxEntryBytes) || 1), this.maxTotalBytes = Math.max(1, Number(n.maxTotalBytes) || 1);
  }
  #e(n) {
    const e = Number(n?.status);
    if (!(e >= 200 && e < 300) || e === 204 || e === 205) return null;
    let a;
    try {
      a = new Headers(Array.isArray(n.headers) ? n.headers : []);
    } catch {
      return null;
    }
    if (!Pa(a.get("Content-Type"))) return null;
    const t = String(n.bodyText || ""), r = wa(t);
    if (r > this.maxEntryBytes) return null;
    const o = xa(t);
    return o ? {
      headers: a,
      bodyText: t,
      bodyBytes: r,
      payload: o
    } : null;
  }
  cleanup(n = this.now()) {
    for (const [a, t] of this.entries) {
      const r = Number(t?.expiresAt) || 0;
      (r > 0 && r <= n || !this.#e(t)) && this.entries.delete(a);
    }
    for (; this.entries.size > this.maxEntries; ) {
      const a = this.entries.keys().next().value;
      if (!a) break;
      this.entries.delete(a);
    }
    let e = 0;
    for (const a of this.entries.values()) e += wa(a?.bodyText);
    for (; this.entries.size > 0 && e > this.maxTotalBytes; ) {
      const a = this.entries.keys().next().value;
      if (!a) break;
      const t = this.entries.get(a);
      e -= wa(t?.bodyText), this.entries.delete(a);
    }
  }
  set(n, e, a = {}) {
    if (!n || !Qt(e)) return !1;
    const t = e.response;
    if (!(t.status >= 200 && t.status < 300) || t.status === 204 || t.status === 205 || !Pa(t.headers.get("Content-Type"))) return !1;
    const r = wa(e.bodyText);
    if (r > this.maxEntryBytes || !xa(e.bodyText)) return !1;
    const o = Math.max(0, Number(a.ttlMs) || 0);
    if (o <= 0) return !1;
    const s = ao(t.headers);
    s.delete("Set-Cookie");
    const i = this.now();
    return this.entries.delete(n), this.entries.set(n, {
      nodeName: String(a.nodeName || "").trim().toLowerCase(),
      nodeRevision: String(a.nodeRevision || "").trim(),
      playbackInfoRewrite: String(a.playbackInfoRewrite || "").trim(),
      status: t.status,
      statusText: t.statusText,
      headers: [...s.entries()],
      bodyText: e.bodyText,
      bodyBytes: r,
      storedAt: i,
      expiresAt: i + o
    }), this.cleanup(i), !0;
  }
  get(n) {
    if (!n) return null;
    this.cleanup();
    const e = this.entries.get(n);
    if (!e) return null;
    const a = this.#e(e);
    if (!a)
      return this.entries.delete(n), null;
    let t;
    try {
      t = new Response(a.bodyText, {
        status: Number(e.status) || 200,
        statusText: String(e.statusText || ""),
        headers: a.headers
      });
    } catch {
      return this.entries.delete(n), null;
    }
    const r = ro({
      response: t,
      bodyText: a.bodyText,
      bodyBytes: a.bodyBytes,
      payload: a.payload
    });
    return this.entries.delete(n), this.entries.set(n, {
      ...e,
      bodyBytes: a.bodyBytes
    }), {
      representation: r,
      metadata: e
    };
  }
};
function el() {
  return {
    NodeCache: /* @__PURE__ */ new Map(),
    PlaybackRouteHotCache: /* @__PURE__ */ new Map(),
    NodesListCache: null,
    NodesRevisionCache: null,
    NodesIndexCache: null,
    NodesRevisionCacheGeneration: 0,
    NodeCacheResetGeneration: 0,
    NodeCacheGenerationNonce: 0,
    NodeCacheGenerationEvictionEpoch: 0,
    NodeCacheGenerations: /* @__PURE__ */ new Map(),
    SingleFlightTasks: /* @__PURE__ */ new Map(),
    NodeIndexMutationChain: Promise.resolve(),
    CleanupIterators: {
      node: null,
      playbackRoute: null
    },
    CleanupState: $c()
  };
}
var ft = Ja(el), Se = (n = null) => ft.get(n), Ht = jc(), va = Bc(), Pn = Wc(), { runDataMutation: Yt, runTidyMutation: tl } = Gc(Pn), oe = {
  ProxyFailoverStateCache: /* @__PURE__ */ new Map(),
  CryptoKeyCache: /* @__PURE__ */ new Map(),
  PlaybackInfoResponseCache: /* @__PURE__ */ new Map(),
  PlaybackProgressRelay: /* @__PURE__ */ new Map(),
  DashboardMonthlyTrafficCache: /* @__PURE__ */ new Map(),
  SingleFlightTasks: /* @__PURE__ */ new Map(),
  AdminRemoteShellCacheMutationChains: /* @__PURE__ */ new Map(),
  LogsReadinessProbeCache: /* @__PURE__ */ new WeakMap(),
  ProxyAccessRuleProfileCache: /* @__PURE__ */ new WeakMap()
};
for (const n of [
  "NodeCache",
  "PlaybackRouteHotCache",
  "NodesListCache",
  "NodesRevisionCache",
  "NodesIndexCache",
  "NodesRevisionCacheGeneration",
  "NodeCacheResetGeneration",
  "NodeCacheGenerationNonce",
  "NodeCacheGenerationEvictionEpoch",
  "NodeCacheGenerations"
]) Object.defineProperty(oe, n, {
  enumerable: !0,
  configurable: !1,
  get: () => ft.current()[n],
  set: (e) => {
    ft.current()[n] = e;
  }
});
for (const n of ["ConfigCache", "RuntimeConfigCacheGeneration"]) Object.defineProperty(oe, n, {
  enumerable: !0,
  configurable: !1,
  get: () => va.current()[n],
  set: (e) => {
    va.current()[n] = e;
  }
});
var Xe = {
  LogQueue: [],
  LogDedupe: /* @__PURE__ */ new Map(),
  RateLimitCache: /* @__PURE__ */ new Map(),
  LogFlushPending: !1,
  LogFlushTask: null,
  LogClearEpochMs: 0,
  LogLastFlushAt: 0,
  OpsStatusWriteChain: Promise.resolve(),
  NodeIndexMutationChain: Promise.resolve(),
  InitCheckWarnedFingerprints: /* @__PURE__ */ new Set()
};
for (const n of ["CleanupState"]) Object.defineProperty(Xe, n, {
  enumerable: !0,
  configurable: !1,
  get: () => ft.current()[n],
  set: (e) => {
    ft.current()[n] = e;
  }
});
for (const n of ["KvDataMutationChain", "KvTidyMutationChain"]) Object.defineProperty(Xe, n, {
  enumerable: !0,
  configurable: !1,
  get: () => Pn.current()[n],
  set: (e) => {
    Pn.current()[n] = e;
  }
});
var Z = {
  D1SchemaReadyState: /* @__PURE__ */ new WeakMap(),
  D1DatabaseInitReady: /* @__PURE__ */ new WeakMap(),
  LogsBaseDbReady: /* @__PURE__ */ new WeakMap(),
  StatsHourlyDbReady: /* @__PURE__ */ new WeakMap(),
  DnsIpWorkspaceDbReady: /* @__PURE__ */ new WeakMap(),
  OpsStatusDbReady: /* @__PURE__ */ new WeakMap(),
  OpsStatusShadowCache: /* @__PURE__ */ new WeakMap(),
  AdminShellStatusWriteState: /* @__PURE__ */ new WeakMap(),
  ScheduledLeaseDbReady: /* @__PURE__ */ new WeakMap(),
  AuthFailuresDbReady: /* @__PURE__ */ new WeakMap(),
  CfDashboardCacheDbReady: /* @__PURE__ */ new WeakMap(),
  CfRuntimeCacheDbReady: /* @__PURE__ */ new WeakMap()
};
function rl(n) {
  const e = {}, a = {};
  for (const t of n) for (const r of Object.keys(t)) a[r] = {
    enumerable: !0,
    configurable: !1,
    get: () => t[r],
    set: (o) => {
      t[r] = o;
    }
  };
  return Object.defineProperties(e, a);
}
var al = rl([
  oe,
  Xe,
  Z
]);
function ie(n, e = "unknown_error") {
  const a = String(n?.message || "").trim();
  return a || String(n || "").trim() || e;
}
function De(n, e = 500) {
  const a = Number(n);
  if (Number.isFinite(a) && a >= 400 && a <= 599) return Math.floor(a);
  const t = Number(e);
  return Number.isFinite(t) && t >= 400 && t <= 599 ? Math.floor(t) : 500;
}
function Qa(n) {
  if (!n || typeof n != "object") return !1;
  const e = String(n?.code || "").trim(), a = Number(n?.status);
  return !!e || Number.isFinite(a) && a >= 400 && a <= 599;
}
function nl(n, e = {}) {
  const a = De(e?.status, 500), t = String(e?.code || "INTERNAL_ERROR").trim().toUpperCase() || "INTERNAL_ERROR", r = String(e?.message || "Server Error").trim() || "Server Error", o = Qa(n);
  return {
    status: o ? De(n?.status, a) : a,
    code: o && String(n?.code || t).trim().toUpperCase() || t,
    message: o && String(n?.message || r).trim() || r,
    details: o && n?.details !== void 0 ? n.details : e?.details !== void 0 ? e.details : null
  };
}
function xs(n = "get", e = {}, a = "unknown_error") {
  const t = F(e) ? e : {}, r = {
    dependency: "KV",
    operation: String(n || "").trim().toLowerCase() === "list" ? "list" : "get",
    reason: String(a || "unknown_error").trim() || "unknown_error"
  }, o = String(t.key || "").trim(), s = String(t.prefix || "").trim();
  return o && (r.key = o), s && (r.prefix = s), Te("KV_READ_FAILED", "KV 读取异常", 503, r);
}
function Za(n) {
  return Qa(n) && String(n?.code || "").trim().toUpperCase() === "KV_READ_FAILED" && String(n?.details?.dependency || "").trim().toUpperCase() === "KV";
}
function ol(n, e = "INTERNAL_ERROR", a = "Server Error", t = "admin.read.kv_read_failed") {
  if (!Za(n)) return n;
  const r = Te(e, a, 503, { ...F(n?.details) ? n.details : {} });
  return Me(t, r, r.details), r;
}
function Rt(n, e, a, t = "admin.read") {
  if (!Za(n)) return n;
  const r = String(n?.details?.operation || "").trim().toLowerCase() === "list" ? "list" : "get";
  return ol(n, e, a, `${String(t || "admin.read").trim() || "admin.read"}.kv_${r}_failed`);
}
function ko(n = "CONFIG_SNAPSHOTS_CLEAR_FAILED", e = "设置快照清理失败：KV 写入异常", a = null) {
  return Te(n, e, 503, a);
}
function Me(n, e, a = null, t = "warn") {
  const r = t === "error" ? "error" : "warn", o = String(n || "runtime_failure").trim() || "runtime_failure", s = F(a) ? { ...a } : {}, i = String(e?.code || "").trim(), c = Number(e?.status);
  i && (s.errorCode = i), Number.isFinite(c) && (s.errorStatus = Math.floor(c)), Object.keys(s).length > 0 ? console[r](`[${o}] ${ie(e)}`, s) : console[r](`[${o}] ${ie(e)}`);
}
async function ge(n, e, a = null, t = null) {
  try {
    return await n;
  } catch (r) {
    return Me(e, r, a), t;
  }
}
function Te(n = "CONFIG_INVALID", e = "配置无效", a = 400, t = null) {
  const r = new Error(String(e || "配置无效"));
  return r.code = String(n || "CONFIG_INVALID"), r.status = De(a, 400), t != null && (r.details = t), r;
}
function Zt(n) {
  return n ? n.name === "AbortError" ? !0 : String(n.message || "").toLowerCase().includes("abort") : !1;
}
var Os = 4 * 1024 * 1024, en = 64 * 1024, vs = Object.freeze({
  "Referrer-Policy": "origin-when-cross-origin",
  "Strict-Transport-Security": "max-age=15552000; preload",
  "X-Frame-Options": "SAMEORIGIN",
  "X-Content-Type-Options": "nosniff",
  "X-XSS-Protection": "1; mode=block"
}), aa = Object.freeze({
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS, HEAD",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Emby-Authorization, X-Emby-Token, X-Emby-Client, X-Emby-Device-Id, X-Emby-Device-Name, X-Emby-Client-Version, X-MediaBrowser-Authorization, X-MediaBrowser-Token"
});
function Or(n, e) {
  const a = n.get("Vary");
  if (!a) {
    n.set("Vary", e);
    return;
  }
  const t = a.split(",").map((r) => r.trim()).filter(Boolean);
  t.includes(e) || t.push(e), n.set("Vary", t.join(", "));
}
function Ce(n) {
  return Object.entries(vs).forEach(([e, a]) => n.set(e, a)), n;
}
function se(n) {
  return Array.isArray(n) || F(n) ? JSON.stringify(n) : n === void 0 ? "" : JSON.stringify(n);
}
var k = () => Date.now(), so = (n) => new Promise((e) => setTimeout(e, Math.max(0, Number(n) || 0))), sl = Object.freeze({
  JwtExpiry: 3600 * 24 * 30,
  LoginLockDuration: 900,
  MaxLoginAttempts: 5
}), Dt = Object.freeze({
  CacheTTL: 6e4,
  NodeMissCacheTtlMs: 1e3,
  CryptoKeyCacheTTL: 86400,
  CryptoKeyCacheMax: 100,
  NodeCacheMax: 512,
  PlaybackRouteHotCacheTtlMs: 86400 * 1e3,
  PlaybackRouteHotCacheMax: 256,
  NodesRevisionCacheTtlMs: 1e3,
  NodesReadConcurrency: 12,
  CacheTtlImagesDays: 30,
  PingCacheMinutes: 10,
  PlaybackInfoCacheTtlSec: 60,
  PlaybackInfoCacheMax: 64,
  PlaybackInfoCacheEntryMaxBytes: 256 * 1024,
  PlaybackInfoCacheTotalMaxBytes: 4 * 1024 * 1024,
  VideoProgressForwardIntervalSec: 3,
  VideoProgressForwardSessionMax: 128,
  VideoProgressSnapshotMaxBytes: 32 * 1024,
  RateLimitCacheMax: 4096,
  D1SchemaReadyTtlMs: 600 * 1e3,
  OpsStatusReadCacheTtlMs: 15 * 1e3,
  AdminShellStatusStableWriteIntervalMs: 300 * 1e3,
  CleanupBudgetMs: 1,
  CleanupChunkSize: 64,
  CleanupMinIntervalMs: 1e3
}), il = Object.freeze({
  EnableHostPrefixProxy: !1,
  MultiLinkCopyPanelEnabled: !1,
  DashboardShowD1WriteHotspot: !1,
  DashboardShowKvD1Status: !1,
  UiRadiusPx: 10,
  NodePanelPingAutoSort: !1
}), cl = Object.freeze({
  LogRetentionDays: 7,
  LogRetentionDaysMax: 365,
  LogFlushDelayMinutes: 20,
  LogFlushCountThreshold: 100,
  LogBatchChunkSize: 50,
  LogBatchRetryCount: 2,
  LogBatchRetryBackoffMs: 75,
  LogQueryDefaultDays: 1,
  LogKeywordMaxWindowDays: 3,
  LogSearchMode: "fts",
  LogWriteMode: "info",
  LogVacuumMinIntervalMs: 10080 * 60 * 1e3,
  LogFtsRebuildMinIntervalMs: 10080 * 60 * 1e3,
  KvTidyIntervalMs: 3600 * 1e3,
  TgAlertDroppedBatchThreshold: 0,
  TgAlertFlushRetryThreshold: 0,
  TgAlertCooldownMinutes: 30,
  TgAlertOnScheduledFailure: !1,
  TgAlertKvUsageEnabled: !1,
  TgAlertKvUsageThresholdPercent: 80,
  TgAlertD1UsageEnabled: !1,
  TgAlertD1UsageThresholdPercent: 80,
  LogQueueMax: 512,
  LogQueueOverflowDropCount: 256,
  LogDedupeMax: 2048,
  LogDedupeTrimTarget: 1024
}), ll = Object.freeze({
  ScheduledLeaseMinMs: 30 * 1e3,
  ScheduledLeaseMs: 300 * 1e3,
  ScheduleUtcOffsetMinutes: 480,
  TgDailyReportSummaryEnabled: !1,
  TgDailyReportKvEnabled: !1,
  TgDailyReportD1Enabled: !1,
  TgDailyReportClockTimes: ["09:00"]
}), ve = Object.freeze({
  PingTimeoutMs: 5e3,
  HedgeFailoverEnabled: !1,
  HedgeProbePath: "/emby/system/ping",
  HedgeProbeTimeoutMs: 2500,
  HedgeProbeParallelism: 2,
  HedgeWaitTimeoutMs: 3e3,
  HedgeLockTtlMs: 5e3,
  HedgePreferredTtlSec: 300,
  HedgeFailureCooldownSec: 30,
  HedgeWakeJitterMs: 200,
  UpstreamTimeoutMs: 8e3,
  UpstreamRetryAttempts: 0,
  ProxyStreamIdleTimeoutMs: 15e3,
  ProxyPlaylistIdleTimeoutMs: 12e3,
  BufferedRetryBodyMaxBytes: 256 * 1024,
  PrewarmCacheTtl: 120,
  MetadataPrewarmTimeoutMs: 3e3,
  PrewarmPrefetchBytes: 4 * 1024 * 1024,
  DefaultPlaybackInfoMode: "passthrough",
  DefaultRealClientIpMode: "forward",
  DefaultMediaAuthMode: "auto"
}), ul = Object.freeze({
  ConfigSnapshotLimit: 5,
  DnsHistoryLimit: 5,
  DnsIpProbeCacheTtlSec: 600,
  DnsIpProbeTimeoutMs: 2500,
  DnsIpProbeConcurrency: 4,
  DnsIpWorkspaceSyncProbeLimit: 2,
  DnsIpSourceConcurrency: 4,
  DnsIpSourceFetchMaxBytes: 2 * 1024 * 1024,
  DnsIpSourceIpLimit: 5
}), dl = Object.freeze({
  CfQuotaPlanCacheMinutes: 60,
  CfQuotaPlanOverride: ""
}), fl = Object.freeze({
  AssetHash: "v19.3",
  Version: "19.3"
}), ml = Object.freeze({
  ...sl,
  ...Dt,
  ...il,
  ...cl,
  ...ll,
  ...ve,
  ...ul,
  ...dl,
  ...fl
}), O = Object.freeze({ Defaults: ml });
function ke(n) {
  return de(n, O.Defaults.ScheduleUtcOffsetMinutes, -720, 840);
}
function ia(n = "", e = "00:00") {
  const a = String(e || "00:00").trim() || "00:00", t = String(n || "").trim().match(/^(\d{1,2}):(\d{1,2})$/);
  if (!t) return a;
  const r = Number(t[1]), o = Number(t[2]);
  return !Number.isInteger(r) || r < 0 || r > 23 || !Number.isInteger(o) || o < 0 || o > 59 ? a : `${String(r).padStart(2, "0")}:${String(o).padStart(2, "0")}`;
}
function At(n = [], e = []) {
  const a = Array.isArray(n) ? n : String(n || "").split(/[\r\n,]+/), t = [], r = /* @__PURE__ */ new Set();
  for (const o of a) {
    const s = ia(o, "");
    !s || r.has(s) || (r.add(s), t.push(s));
  }
  return t.sort((o, s) => Cr(o) - Cr(s)), t.length ? t : [...new Set((Array.isArray(e) ? e : [e]).map((o) => ia(o, "")).filter(Boolean))].sort((o, s) => Cr(o) - Cr(s));
}
function Cr(n = "") {
  const e = ia(n, "");
  if (!e) return -1;
  const [a, t] = e.split(":");
  return (Number(a) || 0) * 60 + (Number(t) || 0);
}
function pl(n = "") {
  const e = String(n || "").trim().match(/^(\d{4}-\d{2}-\d{2})\s+(\d{2}:\d{2})$/);
  return e ? {
    dateKey: e[1],
    clockTime: ia(e[2], "")
  } : {
    dateKey: "",
    clockTime: ""
  };
}
function gl(n, e = O.Defaults.ScheduleUtcOffsetMinutes) {
  const a = ke(e), t = n.getUTCFullYear(), r = String(n.getUTCMonth() + 1).padStart(2, "0"), o = String(n.getUTCDate()).padStart(2, "0"), s = String(n.getUTCHours()).padStart(2, "0"), i = String(n.getUTCMinutes()).padStart(2, "0"), c = String(n.getUTCSeconds()).padStart(2, "0"), l = String(n.getUTCMilliseconds()).padStart(3, "0"), u = a >= 0 ? "+" : "-", d = Math.abs(a);
  return `${t}-${r}-${o}T${s}:${i}:${c}.${l}${u}${String(Math.floor(d / 60)).padStart(2, "0")}:${String(d % 60).padStart(2, "0")}`;
}
function Sa(n = /* @__PURE__ */ new Date(), e = O.Defaults.ScheduleUtcOffsetMinutes) {
  const a = ke(e), t = a * 60 * 1e3, r = n instanceof Date ? new Date(n.getTime()) : new Date(n), o = r.getTime() + t, s = new Date(o), i = s.getUTCFullYear(), c = String(s.getUTCMonth() + 1).padStart(2, "0"), l = String(s.getUTCDate()).padStart(2, "0"), u = String(s.getUTCHours()).padStart(2, "0"), d = String(s.getUTCMinutes()).padStart(2, "0"), f = String(s.getUTCSeconds()).padStart(2, "0"), m = String(s.getUTCMilliseconds()).padStart(3, "0"), p = Number(u), g = Number(d);
  return {
    now: r,
    shiftedDate: s,
    utcOffsetMinutes: a,
    offsetLabel: io(a),
    dateKey: `${i}-${c}-${l}`,
    clockTime: `${u}:${d}`,
    hour: p,
    minute: g,
    second: Number(f),
    millisecond: Number(m),
    minuteOfDay: p * 60 + g,
    localIso: gl(s, a)
  };
}
function Ko(n = /* @__PURE__ */ new Date(), e = O.Defaults.ScheduleUtcOffsetMinutes) {
  return Sa(n, e).localIso;
}
function Wt(n = /* @__PURE__ */ new Date(), e = O.Defaults.ScheduleUtcOffsetMinutes) {
  return Sa(n, e);
}
function dt(n = /* @__PURE__ */ new Date(), e = O.Defaults.ScheduleUtcOffsetMinutes, a = "") {
  const t = Sa(n, e), r = ia(a || t.clockTime, t.clockTime), o = Cr(r), s = Date.UTC(t.shiftedDate.getUTCFullYear(), t.shiftedDate.getUTCMonth(), t.shiftedDate.getUTCDate()) - t.utcOffsetMinutes * 60 * 1e3, i = s + 1440 * 60 * 1e3 - 1, c = s + Math.max(0, o) * 60 * 1e3;
  return {
    ...t,
    normalizedClockTime: r,
    plannedMinuteOfDay: o,
    plannedTs: c,
    plannedSlotKey: `${t.dateKey} ${r}`,
    startTs: s,
    endTs: i
  };
}
function hl(n = /* @__PURE__ */ new Date(), e = O.Defaults.ScheduleUtcOffsetMinutes) {
  const a = Wt(n, e);
  return {
    ...a,
    slotKey: `${a.dateKey} ${a.clockTime}`
  };
}
function io(n = O.Defaults.ScheduleUtcOffsetMinutes) {
  const e = ke(n), a = e >= 0 ? "+" : "-", t = Math.abs(e);
  return `UTC${a}${String(Math.floor(t / 60)).padStart(2, "0")}:${String(t % 60).padStart(2, "0")}`;
}
function yl(n = {}, e = "") {
  const a = n?.fixedQueue && typeof n.fixedQueue == "object" ? n.fixedQueue : {};
  let t = String(a.localDateKey || "").trim(), r = At(a.executedSlots || [], []);
  if (!t) {
    const o = pl(n?.lastPlannedSlot || "");
    o.dateKey && o.dateKey === e && (t = o.dateKey, r = At([...r, o.clockTime], []));
  }
  return !e || t !== e ? {
    localDateKey: e,
    executedSlots: []
  } : {
    localDateKey: t,
    executedSlots: r
  };
}
function Sl(n = {}, e = [], a = O.Defaults.ScheduleUtcOffsetMinutes, t = /* @__PURE__ */ new Date()) {
  const r = Sa(t, a), o = At(e, []), s = yl(n, r.dateKey);
  if (!o.length) return {
    due: !1,
    context: r,
    normalizedClockTimes: o,
    fixedQueue: s,
    dueSlots: [],
    reason: "no_clock_times_configured"
  };
  const i = new Set(At(s.executedSlots || [], [])), c = o.filter((u) => Cr(u) <= r.minuteOfDay), l = c.filter((u) => !i.has(u));
  return l.length ? {
    due: !0,
    context: r,
    normalizedClockTimes: o,
    fixedQueue: s,
    dueSlots: l,
    reason: "clock_slots_due"
  } : {
    due: !1,
    context: r,
    normalizedClockTimes: o,
    fixedQueue: s,
    dueSlots: [],
    reason: c.length ? "slot_already_processed" : "time_not_matched"
  };
}
function er(n = "") {
  const e = String(n || "").trim().toLowerCase();
  return e === "inherit" ? "inherit" : e === "emby" ? "emby" : e === "jellyfin" ? "jellyfin" : e === "passthrough" ? "passthrough" : "auto";
}
function wr(n = "") {
  const e = String(n || "").trim().toLowerCase();
  return e === "inherit" ? "inherit" : e === "forward" ? "forward" : e === "strip" ? "strip" : e === "disable" || e === "none" ? "disable" : "forward";
}
function Dr(n = "") {
  const e = String(n || "").trim().toLowerCase();
  return e === "inherit" ? "inherit" : e === "rewrite" ? "rewrite" : e === "passthrough" ? "passthrough" : "inherit";
}
function tr(n = "") {
  return String(n || "").trim().toLowerCase() === "host_prefix" ? "host_prefix" : "kv_route";
}
function Qe(n = "") {
  return tr(n) === "host_prefix";
}
function Fs(n = "") {
  const e = String(n || "").trim().toLowerCase();
  return e === "emby" ? "emby" : e === "jellyfin" ? "jellyfin" : e === "passthrough" ? "passthrough" : "auto";
}
function $t(n = "") {
  return String(n || "").trim().toLowerCase() === "rewrite" ? "rewrite" : O.Defaults.DefaultPlaybackInfoMode;
}
function co(n = "") {
  const e = String(n || "").trim().toLowerCase();
  return e === "strip" ? "strip" : e === "disable" || e === "none" ? "disable" : "forward";
}
function vr(n) {
  return de(n, O.Defaults.DnsIpSourceIpLimit, 1, 1e3);
}
function tn(n = "") {
  const e = String(n || "").trim().toLowerCase();
  return e === "direct" ? "direct" : e === "proxy" ? "proxy" : "inherit";
}
function Fr(n = {}) {
  return tn(n?.mainVideoStreamMode ?? n?.wangpanDirectMode ?? n?.wangpanMode);
}
function Ur(n = [], e = "") {
  const a = Array.isArray(n) ? n : String(n || "").split(/[,，\r\n]+/), t = [], r = /* @__PURE__ */ new Set();
  for (const o of [...a, e]) {
    const s = String(o || "").trim().slice(0, 24), i = s.toLowerCase();
    if (!(!s || r.has(i)) && (r.add(i), t.push(s), t.length >= 20))
      break;
  }
  return t;
}
var xn = /\b(?:(?:(?:25[0-5]|2[0-4]\d|1?\d?\d)\.){3}(?:25[0-5]|2[0-4]\d|1?\d?\d)|[0-9a-f:]{2,})\b/gi, Us = {
  AKL: {
    cityName: "Auckland",
    countryCode: "NZ",
    countryName: "新西兰"
  },
  AMS: {
    cityName: "Amsterdam",
    countryCode: "NL",
    countryName: "荷兰"
  },
  ARN: {
    cityName: "Stockholm",
    countryCode: "SE",
    countryName: "瑞典"
  },
  ATL: {
    cityName: "Atlanta",
    countryCode: "US",
    countryName: "美国"
  },
  BKK: {
    cityName: "Bangkok",
    countryCode: "TH",
    countryName: "泰国"
  },
  BOM: {
    cityName: "Mumbai",
    countryCode: "IN",
    countryName: "印度"
  },
  CDG: {
    cityName: "Paris",
    countryCode: "FR",
    countryName: "法国"
  },
  CGK: {
    cityName: "Jakarta",
    countryCode: "ID",
    countryName: "印度尼西亚"
  },
  CPH: {
    cityName: "Copenhagen",
    countryCode: "DK",
    countryName: "丹麦"
  },
  DEL: {
    cityName: "Delhi",
    countryCode: "IN",
    countryName: "印度"
  },
  DFW: {
    cityName: "Dallas",
    countryCode: "US",
    countryName: "美国"
  },
  DOH: {
    cityName: "Doha",
    countryCode: "QA",
    countryName: "卡塔尔"
  },
  DXB: {
    cityName: "Dubai",
    countryCode: "AE",
    countryName: "阿联酋"
  },
  EWR: {
    cityName: "Newark",
    countryCode: "US",
    countryName: "美国"
  },
  FRA: {
    cityName: "Frankfurt",
    countryCode: "DE",
    countryName: "德国"
  },
  GRU: {
    cityName: "Sao Paulo",
    countryCode: "BR",
    countryName: "巴西"
  },
  HKG: {
    cityName: "Hong Kong",
    countryCode: "HK",
    countryName: "中国香港"
  },
  HND: {
    cityName: "Tokyo",
    countryCode: "JP",
    countryName: "日本"
  },
  IAD: {
    cityName: "Ashburn",
    countryCode: "US",
    countryName: "美国"
  },
  ICN: {
    cityName: "Seoul",
    countryCode: "KR",
    countryName: "韩国"
  },
  JNB: {
    cityName: "Johannesburg",
    countryCode: "ZA",
    countryName: "南非"
  },
  KIX: {
    cityName: "Osaka",
    countryCode: "JP",
    countryName: "日本"
  },
  KUL: {
    cityName: "Kuala Lumpur",
    countryCode: "MY",
    countryName: "马来西亚"
  },
  LAX: {
    cityName: "Los Angeles",
    countryCode: "US",
    countryName: "美国"
  },
  LHR: {
    cityName: "London",
    countryCode: "GB",
    countryName: "英国"
  },
  MAD: {
    cityName: "Madrid",
    countryCode: "ES",
    countryName: "西班牙"
  },
  MEL: {
    cityName: "Melbourne",
    countryCode: "AU",
    countryName: "澳大利亚"
  },
  MIA: {
    cityName: "Miami",
    countryCode: "US",
    countryName: "美国"
  },
  MNL: {
    cityName: "Manila",
    countryCode: "PH",
    countryName: "菲律宾"
  },
  MXP: {
    cityName: "Milan",
    countryCode: "IT",
    countryName: "意大利"
  },
  NRT: {
    cityName: "Tokyo",
    countryCode: "JP",
    countryName: "日本"
  },
  ORD: {
    cityName: "Chicago",
    countryCode: "US",
    countryName: "美国"
  },
  OSL: {
    cityName: "Oslo",
    countryCode: "NO",
    countryName: "挪威"
  },
  PHX: {
    cityName: "Phoenix",
    countryCode: "US",
    countryName: "美国"
  },
  PRG: {
    cityName: "Prague",
    countryCode: "CZ",
    countryName: "捷克"
  },
  SAN: {
    cityName: "San Diego",
    countryCode: "US",
    countryName: "美国"
  },
  SCL: {
    cityName: "Santiago",
    countryCode: "CL",
    countryName: "智利"
  },
  SEA: {
    cityName: "Seattle",
    countryCode: "US",
    countryName: "美国"
  },
  SFO: {
    cityName: "San Francisco",
    countryCode: "US",
    countryName: "美国"
  },
  SIN: {
    cityName: "Singapore",
    countryCode: "SG",
    countryName: "新加坡"
  },
  SJC: {
    cityName: "San Jose",
    countryCode: "US",
    countryName: "美国"
  },
  SYD: {
    cityName: "Sydney",
    countryCode: "AU",
    countryName: "澳大利亚"
  },
  TPE: {
    cityName: "Taipei",
    countryCode: "TW",
    countryName: "中国台湾"
  },
  VIE: {
    cityName: "Vienna",
    countryCode: "AT",
    countryName: "奥地利"
  },
  WAW: {
    cityName: "Warsaw",
    countryCode: "PL",
    countryName: "波兰"
  },
  YUL: {
    cityName: "Montreal",
    countryCode: "CA",
    countryName: "加拿大"
  },
  YVR: {
    cityName: "Vancouver",
    countryCode: "CA",
    countryName: "加拿大"
  },
  YYZ: {
    cityName: "Toronto",
    countryCode: "CA",
    countryName: "加拿大"
  }
}, zo = Object.freeze((() => {
  const n = {};
  for (const e of Object.values(Us)) {
    const a = String(e?.countryCode || "").trim().toUpperCase(), t = String(e?.countryName || "").trim();
    !a || !t || n[a] || (n[a] = t);
  }
  return n.CN = n.CN || "中国", n.HK = n.HK || "中国香港", n.MO = n.MO || "中国澳门", n.TW = n.TW || "中国台湾", n;
})()), Yr = null;
function rn(n = "") {
  const e = String(n || "").trim();
  if (!e || !/^(?:\d{1,3}\.){3}\d{1,3}$/.test(e)) return !1;
  const a = e.split(".");
  return a.length === 4 && a.every((t) => {
    const r = Number(t);
    return Number.isInteger(r) && r >= 0 && r <= 255;
  });
}
function _l(n = "") {
  if (!rn(n)) return !1;
  const [e = 0, a = 0] = String(n || "").trim().split(".").map((t) => Number(t));
  return e === 10 || e === 127 || e === 169 && a === 254 || e === 172 && a >= 16 && a <= 31 ? !0 : e === 192 && a === 168;
}
function lo(n = "") {
  const e = String(n || "").trim();
  if (!e || !e.includes(":") || /\s/.test(e)) return !1;
  try {
    return new URL(`http://[${e}]/`), !0;
  } catch {
    return !1;
  }
}
function Hs(n = "") {
  return String(n || "").trim().toUpperCase() === "IPV6" ? "IPv6" : "IPv4";
}
function Ye(n = "") {
  return lo(n) ? "IPv6" : rn(n) ? "IPv4" : "";
}
function uo(n = "", e = {}) {
  const a = String(n || ""), t = /* @__PURE__ */ new Set(), r = [], o = Number(e?.limit), s = Number.isFinite(o) && o > 0 ? Math.max(1, Math.floor(o)) : Number.POSITIVE_INFINITY, i = (l) => {
    const u = String(l || "").trim();
    if (!u) return !1;
    const d = Ye(u);
    if (!d) return !1;
    const f = u.toLowerCase();
    return t.has(f) ? !1 : (t.add(f), r.push({
      ip: u,
      ipType: d
    }), r.length >= s);
  };
  xn.lastIndex = 0;
  let c = null;
  for (; (c = xn.exec(a)) !== null && !i(c[0]); ) ;
  return r;
}
function bl(n = null) {
  const e = Array.isArray(n?.Answer) ? n.Answer : [], a = /* @__PURE__ */ new Set(), t = [];
  for (const r of e) {
    const o = String(r?.data || "").trim(), s = Ye(o);
    if (!s) continue;
    const i = o.toLowerCase();
    a.has(i) || (a.add(i), t.push({
      ip: o,
      ipType: s
    }));
  }
  return t;
}
function Rn(n = "") {
  return String(n || "").replace(/&nbsp;/gi, " ").replace(/&amp;/gi, "&").replace(/&lt;/gi, "<").replace(/&gt;/gi, ">").replace(/&quot;/gi, '"').replace(/&#39;/gi, "'");
}
function Rl(n = "") {
  const e = /* @__PURE__ */ new Map(), a = String(n || ""), t = a.match(/\[[0-9a-f:]{2,}\]/gi) || [];
  for (const o of t) {
    const s = String(o || "").replace(/^\[|\]$/g, "").trim();
    Ye(s) && e.set(s.toLowerCase(), s);
  }
  const r = a.match(xn) || [];
  for (const o of r) {
    const s = String(o || "").trim();
    Ye(s) && e.set(s.toLowerCase(), s);
  }
  return [...e.values()];
}
function El(n = "") {
  const e = String(n || "").trim().toLowerCase();
  return e === "联通" ? "联通" : e === "电信" ? "电信" : e === "移动" ? "移动" : e === "多线" ? "多线" : e === "ipv6" ? "ipv6" : "";
}
function $o(n = "", e = "") {
  const a = El(e);
  return a ? String(n || "").trim().toLowerCase() === a.toLowerCase() : !0;
}
function Al(n = "", e = "") {
  const a = /* @__PURE__ */ new Map(), t = (s, i = "") => {
    const c = String(s || "").trim(), l = Ye(c);
    if (!l || _l(c)) return;
    const u = c.toLowerCase(), d = Hr(i), f = a.get(u);
    if (!f) {
      a.set(u, {
        ip: c,
        ipType: l,
        lineLabel: d
      });
      return;
    }
    !Hr(f?.lineLabel) && d && a.set(u, {
      ...f,
      lineLabel: d
    });
  }, r = String(n || ""), o = r.match(/<tr\b[^>]*>[\s\S]*?<\/tr>/gi) || [];
  for (const s of o) {
    const i = s.match(/<t[dh]\b[^>]*>[\s\S]*?<\/t[dh]>/gi) || [];
    if (i.length < 3) continue;
    const c = Rn(String(i[1] || "").replace(/<[^>]+>/g, " ")).replace(/\s+/g, " ").trim();
    if (!$o(c, e)) continue;
    const l = Rl(Rn(String(i[2] || "").replace(/<[^>]+>/g, " "))).find((u) => Ye(u)) || "";
    l && t(l, c);
  }
  if (!a.size) {
    const s = Rn(r.replace(/<[^>]+>/g, `
`)), i = /(?:^|\n)\s*(?:\d+\s+)?(电信|联通|移动|多线|ipv6)\s+((?:(?:25[0-5]|2[0-4]\d|[01]?\d\d?)\.){3}(?:25[0-5]|2[0-4]\d|[01]?\d\d?)|(?:[a-f0-9]{1,4}:){2,}[a-f0-9:]{1,39})/gi;
    let c = null;
    for (; (c = i.exec(s)) !== null; )
      $o(c[1], e) && t(c[2], c[1]);
  }
  return [...a.values()];
}
function Cl(n = "", e = {}) {
  return uo(n, e);
}
function Tl(n = "") {
  const e = String(n || "").trim().toUpperCase(), a = Us[e];
  return e ? a ? {
    coloCode: e,
    cityName: String(a.cityName || e),
    countryCode: String(a.countryCode || "UNKNOWN"),
    countryName: String(a.countryName || "未知")
  } : {
    coloCode: e,
    cityName: e,
    countryCode: "UNKNOWN",
    countryName: "未知"
  } : {
    coloCode: "",
    cityName: "",
    countryCode: "UNKNOWN",
    countryName: "未知"
  };
}
function wl(n = "") {
  const e = String(n || "").trim().toUpperCase();
  if (!e || e === "UNKNOWN") return "未知";
  if (zo[e]) return zo[e];
  try {
    if (Yr === null && (Yr = typeof Intl?.DisplayNames == "function" ? new Intl.DisplayNames(["zh-CN"], { type: "region" }) : !1), Yr && typeof Yr.of == "function") {
      const a = String(Yr.of(e) || "").trim();
      if (a) return a;
    }
  } catch {
  }
  return e;
}
function ks(n = "") {
  const e = String(n || "").trim();
  if (!e) return "";
  const a = e.match(/-([A-Za-z]{3,4})$/);
  return a ? String(a[1] || "").trim().toUpperCase() : "";
}
function Dl(n = "") {
  return `dns-ip-source-${ce(n || `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`)}`;
}
function gt(n = "") {
  return String(n || "").trim().toLowerCase() === "domain" ? "domain" : "url";
}
var Ks = Object.freeze([Object.freeze({
  id: "all",
  label: "麒麟优选",
  sourceType: "url",
  url: "https://api.uouin.com/cloudflare.html"
}), Object.freeze({
  id: "preferred",
  label: "CF-SPEED-DNS优选",
  sourceType: "url",
  url: "https://raw.githubusercontent.com/ZhiXuanWang/cf-speed-dns/refs/heads/main/ipTop10.html"
})]), zs = Object.freeze([
  Object.freeze({
    id: "wetest_ipv4",
    label: "Wetest IPv4 API",
    sourceType: "url",
    url: "https://www.wetest.vip/api/cf2dns/get_cloudflare_ip?key=o1zrmHAF&type=v4"
  }),
  Object.freeze({
    id: "wetest_ipv6",
    label: "Wetest IPv6 API",
    sourceType: "url",
    url: "https://www.wetest.vip/api/cf2dns/get_cloudflare_ip?key=o1zrmHAF&type=v6"
  }),
  Object.freeze({
    id: "vps789_ip_api",
    label: "VPS789 优选IP API",
    sourceType: "url",
    url: "https://hhhhh.eu.org/vps789.txt"
  }),
  Object.freeze({
    id: "164746_source",
    label: "164746源",
    sourceType: "url",
    url: "https://ip.164746.xyz/"
  }),
  Object.freeze({
    id: "haogege_source",
    label: "haogege源",
    sourceType: "url",
    url: "https://hhhhh.eu.org/haogege.txt"
  }),
  Object.freeze({
    id: "bestcf_source",
    label: "bestcf源",
    sourceType: "url",
    url: "https://raw.githubusercontent.com/hubbylei/bestcf/main/bestcf.txt"
  })
]), Nl = Object.freeze([
  Object.freeze({
    label: "CM优选域名集合",
    url: "https://cf.090227.xyz/"
  }),
  Object.freeze({
    label: "NB优选",
    url: "https://www.byoip.top/"
  }),
  Object.freeze({
    label: "VPS789 域名优选",
    url: "https://vps789.com/cfip/?remarks=domain"
  })
]), Ll = Object.freeze([Object.freeze({
  label: "VPS789 优选IP",
  url: "https://vps789.com/cfip/"
}), Object.freeze({
  label: "Wetest IPv4 优选",
  url: "https://www.wetest.vip/page/cloudflare/address_v4.html"
})]);
function Ml(n = "") {
  const e = String(n || "").trim().toLowerCase();
  return e === "builtin" ? "builtin" : e === "preset" ? "preset" : "custom";
}
function $s(n = "") {
  const e = String(n || "").trim().toLowerCase();
  return e === "preferred" ? "preferred" : e === "all" ? "all" : "";
}
function Il(n = "") {
  return String(n || "").trim().toLowerCase().replace(/[^a-z0-9_:-]+/g, "_");
}
function Pl(n = "") {
  const e = $s(n);
  return Ks.find((a) => a.id === e) || null;
}
function xl(n = "") {
  const e = Il(n);
  return e && zs.find((a) => a.id === e) || null;
}
function Sr() {
  return {
    builtInSourceOptions: Ks.map((n) => ({
      id: n.id,
      label: n.label,
      sourceType: n.sourceType,
      value: "domain" in n ? n.domain : n.url
    })),
    presetList: zs.map((n) => ({
      id: n.id,
      label: n.label,
      sourceType: n.sourceType,
      value: "domain" in n ? n.domain : n.url
    })),
    preferredDomainLinks: Nl.map((n) => ({ ...n })),
    preferredIpLinks: Ll.map((n) => ({ ...n }))
  };
}
function Hr(n = "") {
  const e = String(n || "").trim().toLowerCase();
  return e.includes("联通") ? "联通" : e.includes("电信") ? "电信" : e.includes("移动") ? "移动" : e.includes("多线") ? "多线" : e.includes("ipv6") ? "ipv6" : "";
}
function Bs(n = {}) {
  const e = Ml(n?.sourceKind || n?.source_kind || ""), a = e === "builtin" ? Pl(n?.builtinId || n?.builtin_id || n?.presetId || n?.preset_id || n?.name) : null, t = e === "preset" ? xl(n?.presetId || n?.preset_id || n?.builtinId || n?.builtin_id || n?.name) : null, r = a || t || null, o = gt(r?.sourceType || n?.sourceType || n?.source_type || ""), s = r && "url" in r ? r.url : "", i = r && "domain" in r ? r.domain : "", c = String(s || n?.url || "").trim(), l = ee(i || n?.domain || ""), u = String(n?.name || r?.label || "").trim();
  return {
    sourceKind: e,
    builtinId: a?.id || "",
    presetId: t?.id || "",
    name: u,
    sourceType: o,
    url: c,
    domain: l,
    resolvedLabel: String(r?.label || "").trim()
  };
}
function Ws(n = {}) {
  const e = Bs(n);
  return gt(e.sourceType) === "domain" ? ee(e.domain || "") : String(e.url || "").trim();
}
function rr(n = {}) {
  return !!Ws(n);
}
function lr(n = {}, e = {}) {
  const a = String(n?.ip || n?.content || "").trim(), t = Ye(a);
  if (!a || !t) return null;
  const r = String(e.updatedAt || (/* @__PURE__ */ new Date()).toISOString()), o = String(n?.sourceKind || n?.source_kind || e.sourceKind || "manual").trim().toLowerCase() || "manual", s = String(n?.sourceLabel || n?.source_label || e.sourceLabel || "").trim(), i = Hr(n?.lineLabel || n?.line_label || e.lineLabel || ""), c = String(n?.remark || "").trim();
  return {
    id: String(n?.id || `dns-ip-${ce(a.toLowerCase())}`),
    ip: a,
    ipType: t,
    sourceKind: o,
    sourceLabel: s,
    lineLabel: i,
    remark: c,
    createdAt: String(n?.createdAt || n?.created_at || e.createdAt || r),
    updatedAt: r
  };
}
function Ct(n = {}, e = 0) {
  const a = (/* @__PURE__ */ new Date()).toISOString(), t = Bs(n), r = t.sourceKind, o = gt(t.sourceType), s = String(t.builtinId || n?.builtinId || n?.builtin_id || "").trim(), i = String(t.presetId || n?.presetId || n?.preset_id || "").trim(), c = String(t.resolvedLabel || "").trim(), l = String(t.url || "").trim(), u = ee(t.domain || ""), d = o === "domain" ? u : l, f = String(n?.name || c || "").trim(), m = n?.enabled, p = m == null ? !0 : !(m === !1 || m === 0 || String(m).trim() === "0");
  return {
    id: String(n?.id || Dl(`${r}|${s}|${i}|${o}|${d}|${e}`)),
    name: f || c || `抓取源 ${Number(e) + 1}`,
    url: l,
    domain: u,
    sourceType: o,
    sourceKind: r,
    presetId: i,
    builtinId: s,
    enabled: p,
    sortOrder: Math.max(0, Number.parseInt(String(n?.sortOrder ?? n?.sort_order ?? e), 10) || 0),
    ipLimit: vr(n?.ipLimit ?? n?.ip_limit),
    lastFetchAt: String(n?.lastFetchAt || n?.last_fetch_at || ""),
    lastFetchStatus: String(n?.lastFetchStatus || n?.last_fetch_status || ""),
    lastFetchCount: Math.max(0, Number(n?.lastFetchCount ?? n?.last_fetch_count) || 0),
    createdAt: String(n?.createdAt || n?.created_at || a),
    updatedAt: String(n?.updatedAt || n?.updated_at || a)
  };
}
function ur(n = []) {
  const e = [], a = /* @__PURE__ */ new Map();
  for (const t of Array.isArray(n) ? n : []) {
    const r = lr(t);
    if (!r) continue;
    const o = String(r.ip || "").trim().toLowerCase();
    if (!o) continue;
    const s = a.get(o);
    if (s === void 0) {
      a.set(o, e.length), e.push(r);
      continue;
    }
    const i = e[s];
    i && !Hr(i.lineLabel) && Hr(r.lineLabel) && (e[s] = {
      ...i,
      lineLabel: r.lineLabel
    });
  }
  return e;
}
function Ol(n = {}) {
  const e = lr(n);
  return e ? {
    ...e,
    probeStatus: "pending",
    latencyMs: null,
    cfRay: "",
    coloCode: "",
    cityName: "",
    countryCode: "UNKNOWN",
    countryName: "未知",
    probedAt: ""
  } : null;
}
function fo(n = []) {
  return ur(n).map((e) => Ol(e)).filter(Boolean);
}
function an(n = "") {
  const e = String(n || "").trim().toLowerCase();
  return e === "success" ? "success" : e === "failed" ? "failed" : "empty";
}
function Vs(n = {}, e = {}) {
  const a = Ct(e), t = ur(n?.items || []).slice(0, vr(a?.ipLimit)), r = an(n?.status || (t.length ? "success" : "empty"));
  return {
    id: String(n?.id || a?.id || ""),
    name: String(n?.name || a?.name || ""),
    sourceType: gt(n?.sourceType || a?.sourceType || ""),
    status: r,
    count: Math.max(0, Number(n?.count) || t.length),
    items: t,
    error: r === "failed" ? String(n?.error || "") : "",
    lastFetchAt: String(n?.lastFetchAt || (/* @__PURE__ */ new Date()).toISOString())
  };
}
function Gs(n = []) {
  return (Array.isArray(n) ? n : []).map((e) => {
    const a = Vs(e, e), t = fo(a?.items || []);
    return {
      id: String(a?.id || ""),
      name: String(a?.name || ""),
      sourceType: gt(a?.sourceType || ""),
      status: an(a?.status),
      count: Math.max(0, Number(a?.count) || t.length),
      items: t,
      error: String(a?.error || ""),
      lastFetchAt: String(a?.lastFetchAt || "")
    };
  });
}
function vl(n = []) {
  const e = Array.isArray(n) ? n : [];
  return e.length ? e.some((a) => an(a?.status) !== "failed") : !0;
}
function Fa(n) {
  const e = Number(n) || 0;
  return !Number.isFinite(e) || e <= 0 ? "" : new Date(e).toISOString();
}
function Da(n = [], e = O.Defaults.DnsIpSourceFetchMaxBytes) {
  return ce(se({
    maxBytes: de(e, O.Defaults.DnsIpSourceFetchMaxBytes, 1024, 8 * 1024 * 1024),
    enabledSources: (Array.isArray(n) ? n : []).map((a, t) => Ct(a, t)).filter((a) => a.enabled === !0 && rr(a)).map((a) => ({
      id: String(a.id || ""),
      name: String(a.name || ""),
      sourceType: gt(a.sourceType),
      target: Ws(a),
      ipLimit: vr(a.ipLimit),
      enabled: a.enabled !== !1
    }))
  }));
}
function Fl(n = "") {
  return String(n || "").trim().toLowerCase() === "shared_snapshot" ? "shared_snapshot" : "local_pool";
}
function js(n = []) {
  const e = [], a = /* @__PURE__ */ new Set();
  for (const t of Array.isArray(n) ? n : []) {
    const r = String(t?.ip || t || "").trim();
    if (!Ye(r)) continue;
    const o = r.toLowerCase();
    a.has(o) || (a.add(o), e.push(r));
  }
  return {
    normalizedIps: e,
    deleteKeySet: a
  };
}
function Bo(n = [], e = /* @__PURE__ */ new Set()) {
  const a = [], t = [];
  for (const r of ur(n)) {
    const o = String(r?.ip || "").trim();
    if (o) {
      if (e.has(o.toLowerCase())) {
        t.push(r);
        continue;
      }
      a.push(r);
    }
  }
  return {
    keptItems: a,
    removedItems: t
  };
}
function Ul(n = {}, e = []) {
  const { deleteKeySet: a } = js(e), t = ur(n?.items || []), r = Array.isArray(n?.sourceResults) ? n.sourceResults : [];
  if (!a.size) return {
    deletedCount: 0,
    deletedIps: [],
    items: t,
    sourceResults: r
  };
  const { keptItems: o, removedItems: s } = Bo(t, a), i = new Set(s.map((l) => String(l?.ip || "").trim().toLowerCase()).filter(Boolean)), c = r.map((l) => {
    const { keptItems: u } = Bo(l?.items || [], i), d = an(l?.status) === "failed" ? "failed" : u.length ? "success" : "empty";
    return {
      id: String(l?.id || ""),
      name: String(l?.name || ""),
      sourceType: gt(l?.sourceType || l?.source_type || ""),
      status: d,
      count: u.length,
      items: u,
      error: d === "failed" ? String(l?.error || "") : "",
      lastFetchAt: String(l?.lastFetchAt || (/* @__PURE__ */ new Date()).toISOString())
    };
  });
  return {
    deletedCount: s.length,
    deletedIps: s.map((l) => String(l?.ip || "").trim()).filter(Boolean),
    items: o,
    sourceResults: c
  };
}
function Na(n = "") {
  const e = String(n || "").trim().toLowerCase();
  return e === "ok" ? "ok" : e === "pending" ? "pending" : e === "cf_header_missing" ? "cf_header_missing" : e === "non_cloudflare" ? "non_cloudflare" : e === "timeout" ? "timeout" : "network_error";
}
function En(n = []) {
  const e = Array.isArray(n) ? n : [], a = /* @__PURE__ */ new Set(), t = /* @__PURE__ */ new Set();
  let r = 0, o = 0;
  for (const s of e) {
    Hs(s?.ipType || s?.ip_type || s?.type || "") === "IPv6" ? o += 1 : r += 1;
    const i = String(s?.countryCode || s?.country_code || "").trim().toUpperCase(), c = String(s?.coloCode || s?.colo_code || "").trim().toUpperCase();
    i && a.add(i), c && t.add(c);
  }
  return {
    ipCount: e.length,
    ipv4Count: r,
    ipv6Count: o,
    countryCount: a.size,
    coloCount: t.size
  };
}
function Hl(n = [], e = []) {
  const a = Array.isArray(n) ? n : [], t = Array.isArray(e) ? e : [];
  return {
    currentHost: En(a),
    sharedPool: En(t),
    combined: En([...a, ...t])
  };
}
function Ke(n) {
  return ee(n?.HOST);
}
function kr(n) {
  return ee(n?.LEGACY_HOST);
}
function kl(n) {
  const e = Ke(n), a = kr(n), t = mo(a, e);
  return t?.prefix ? {
    name: String(t.prefix || "").trim().toLowerCase(),
    reservedBy: a,
    reason: "legacy_host",
    legacyHost: a,
    host: e
  } : null;
}
function ca(n, e) {
  const a = ee(n), t = ee(e);
  return !a || !t ? !1 : a === t || a.endsWith(`.${t}`);
}
function nn(n = "") {
  const e = String(n || "").trim().toLowerCase();
  return !e || e.length > 63 ? !1 : /^[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?$/.test(e);
}
function Bt(n = "") {
  const e = String(n || "").trim().toLowerCase().replace(/\.+$/, "");
  return !e || e.length > 253 || /\s|[:/@*]/.test(e) || rn(e) || lo(e) || e.split(".").some((a) => !nn(a)) ? "" : e;
}
function qs(n = "") {
  const e = String(n || "").trim();
  return !e || Bt(e) ? "" : "CNAME 指向必须是合法主机名，不能包含协议、端口、路径、通配符、空格或 IP 地址";
}
function Kl(n = "", e = "defaultHostPrefixCnameTarget") {
  const a = qs(n);
  if (a)
    throw Te("HOST_PREFIX_CNAME_TARGET_INVALID", a, 400, {
      field: e,
      value: String(n || "").trim()
    });
}
function Ua(n = null, e = {}, a = "") {
  return Bt(n?.hostPrefixCnameTarget) || Bt(e?.defaultHostPrefixCnameTarget) || ee(a);
}
function mo(n = "", e = "") {
  const a = ee(n), t = ee(e);
  if (!a || !t || a === t) return null;
  const r = `.${t}`;
  if (!a.endsWith(r)) return null;
  const o = a.slice(0, -r.length);
  return !o || o.includes(".") || !nn(o) ? null : {
    hostname: a,
    host: t,
    prefix: o
  };
}
function Xs(n) {
  const e = String(n || "").trim();
  if (!e) return null;
  const a = e.indexOf("/"), t = a === -1 ? e : e.slice(0, a), r = a === -1 ? "" : e.slice(a), o = eo(t);
  return o ? {
    ...o,
    path: r,
    pattern: e
  } : null;
}
function po(n, e = {}) {
  const a = String(e.path || "");
  let t = 0;
  return e.wildcard || (t += 100), n.includes(".workers.dev") && (t -= 20), a === "/" || a === "/*" ? t += 20 : a.endsWith("*") ? t += 10 : a && (t += 4), t += n.split(".").length * 4, t -= Math.min(a.length, 30), t;
}
var zl = "https://admin-local-index.invalid", $l = "local-", Bl = "sys:admin_index_upload:v1:", Wl = "sys:admin_index_active:v2";
function Nr(n = "") {
  const e = String(n || "").trim();
  if (!e) return "";
  try {
    const a = new URL(e);
    return ["http:", "https:"].includes(a.protocol) ? a.toString() : "";
  } catch {
    return "";
  }
}
function Vl(n = "") {
  const e = String(n || "").trim();
  return !(!e || /[\x00-\x20~^:?*[\\\]]/.test(e) || e.includes("..") || e.includes("@{") || e.includes("//") || e.startsWith("/") || e.endsWith("/") || e.endsWith(".") || e.endsWith(".lock"));
}
function ct(n = "") {
  const e = String(n || "").trim();
  return Vl(e) ? e : "";
}
function Et(n = "") {
  const e = String(n || "").trim().toLowerCase();
  return /^[a-f0-9]{64}$/.test(e) ? e : "";
}
function Kr(n = "") {
  const e = Et(n);
  return e ? `${zl}/${e}/index.html` : "";
}
function je(n = "") {
  const e = Nr(n);
  if (!e) return "";
  try {
    const a = new URL(e);
    return a.origin !== "https://admin-local-index.invalid" || a.search || a.hash ? "" : Et(a.pathname.match(/^\/([a-f0-9]{64})\/index\.html$/i)?.[1] || "");
  } catch {
    return "";
  }
}
function go(n = "") {
  const e = Et(n);
  return e ? `${$l}${e}` : "";
}
function Gl(n = "") {
  const e = String(n || "").trim().toLowerCase();
  return e.startsWith("local-") ? Et(e.slice(6)) : "";
}
function Tt(n = null, e = {}) {
  const a = Nr((F(e) ? e : {}).indexUrl), t = je(a), r = !!t, o = r ? Kr(t) : "";
  return {
    effectiveRef: t,
    effectiveRefType: r ? "local_upload" : "",
    configIndexUrl: a,
    envIndexUrl: "",
    indexUrl: o,
    persistedIndexUrl: o,
    indexUrlSource: r ? "local_upload" : "unset",
    isLocalUpload: r,
    localUploadRevision: t,
    assetRevision: r ? go(t) : "",
    hasGithubRelease: !1,
    hasLocalUpload: r,
    hasDerivedIndexUrl: !1,
    gateState: o ? "shell_ready" : "setup_required"
  };
}
function jl(n = {}) {
  const e = String(F(n) && n.indexUrl || "").trim();
  if (!(!e || je(e)))
    throw Te("ADMIN_INDEX_SOURCE_UPLOAD_ONLY", "管理台 HTML 仅支持本地上传，请通过启动门或 Worker 和 HTML 更新面板提交 index.html", 400, { field: "indexUrl" });
}
function Ys(n = {}, e = null) {
  const a = Ke(e), t = String(n?.cfZoneId || "").trim(), r = String(n?.cfApiToken || "").trim(), o = [];
  return a || o.push("HOST"), t || o.push("cfZoneId"), r || o.push("cfApiToken"), {
    host: a,
    cfZoneId: t,
    cfApiToken: r,
    missingFields: o
  };
}
function ql(n = {}, e = null) {
  if (n?.enableHostPrefixProxy !== !0) return;
  const a = Ys(n, e);
  if (!(a.missingFields.length <= 0))
    throw Te("HOST_PREFIX_PROXY_CONFIG_REQUIRED", "启用域名前缀代理前，必须先配置 HOST、Cloudflare Zone ID 和 API 令牌", 400, {
      missingFields: a.missingFields,
      host: a.host
    });
}
function La(n = {}, e = null) {
  const a = Ys(n, e);
  if (a.missingFields.length <= 0) return a;
  throw Te("HOST_PREFIX_DNS_CONFIG_REQUIRED", "保存域名前缀节点前，必须先配置 HOST、Cloudflare Zone ID 和 API 令牌", 400, {
    missingFields: a.missingFields,
    host: a.host
  });
}
var Xl = ve.PingTimeoutMs, Yl = ve.UpstreamTimeoutMs, On = ve.UpstreamRetryAttempts, Js = ve.HedgeProbePath, Jl = "/emby/system/info/public", ho = ve.HedgeProbeTimeoutMs, Qs = ve.HedgeProbeParallelism, Zs = ve.HedgeWaitTimeoutMs, ei = ve.HedgeLockTtlMs, Zr = ve.HedgePreferredTtlSec, ti = ve.HedgeFailureCooldownSec, ri = ve.HedgeWakeJitterMs, Ql = ve.BufferedRetryBodyMaxBytes, Zl = ve.MetadataPrewarmTimeoutMs, eu = ve.PrewarmCacheTtl;
ve.DefaultPlaybackInfoMode;
var tu = Dt.PlaybackInfoCacheTtlSec, ai = Dt.PlaybackInfoCacheEntryMaxBytes, ru = Dt.PlaybackInfoCacheTotalMaxBytes, ni = Dt.VideoProgressForwardIntervalSec, au = Dt.VideoProgressSnapshotMaxBytes, oi = Dt.CacheTtlImagesDays, nu = Dt.PlaybackRouteHotCacheTtlMs, ar = Dt.PlaybackRouteHotCacheMax, si = 12 * 1024 * 1024, ou = si - 64 * 1024, ii = 512 * 1024, zr = /\.(?:jpg|jpeg|gif|png|svg|ico|webp)$/i, su = /\.(?:js|css|woff2?|ttf|otf|map|webmanifest)$/i, dr = /\.(?:srt|ass|vtt|sub)$/i, $r = /(?:\/Images\/|\/Icons\/|\/Branding\/|\/emby\/covers\/)/i, mt = /\.(?:m3u8|mpd)$/i, ci = /\.(?:ts|m4s)$/i, iu = /\.(?:mp4|m4v|m4a|ogv|webm|mkv|mov|avi|wmv|flv)$/i, vn = /* @__PURE__ */ new Set([
  "host",
  "x-real-ip",
  "x-forwarded-for",
  "x-forwarded-host",
  "x-forwarded-proto",
  "forwarded",
  "connection",
  "upgrade",
  "transfer-encoding",
  "te",
  "keep-alive",
  "proxy-authorization",
  "proxy-authenticate",
  "trailer",
  "expect"
]), cu = /* @__PURE__ */ new Set([
  "cf-connecting-ip",
  "cf-connecting-ipv6",
  "cf-ipcountry",
  "cf-region",
  "cf-region-code",
  "cf-city",
  "cf-latitude",
  "cf-longitude",
  "cf-postal-code",
  "cf-subdivision",
  "cf-metro-code",
  "cf-timezone",
  "true-client-ip",
  "x-client-ip",
  "x-original-forwarded-for",
  "x-forwarded",
  "cdn-loop",
  "cf-visitor",
  "cf-ray",
  "cf-pseudo-ipv4"
]), lu = /* @__PURE__ */ new Set([
  "access-control-allow-origin",
  "access-control-allow-methods",
  "access-control-allow-headers",
  "access-control-allow-credentials",
  "x-frame-options",
  "strict-transport-security",
  "x-content-type-options",
  "x-xss-protection",
  "referrer-policy",
  "x-powered-by",
  "server"
]), yo = "legacy_proxy_ctx", uu = 86400, on = [yo, "emby_web_bypass"], du = /* @__PURE__ */ new Set([
  "users",
  "items",
  "videos",
  "audio",
  "livetv",
  "sessions",
  "system"
]);
function _a(n, e, a = null) {
  const t = e.headers.get("Origin"), r = e.headers.get("Access-Control-Request-Headers") || aa["Access-Control-Allow-Headers"];
  return {
    "Access-Control-Allow-Origin": a || t || aa["Access-Control-Allow-Origin"],
    "Access-Control-Allow-Methods": aa["Access-Control-Allow-Methods"],
    "Access-Control-Allow-Headers": r,
    "Access-Control-Expose-Headers": "Content-Length, Content-Range",
    "Access-Control-Max-Age": "86400"
  };
}
function wt(n = "") {
  if (!n) return "";
  try {
    return decodeURIComponent(n);
  } catch {
    return n;
  }
}
function Q(n) {
  let e = typeof n == "string" ? n : "/";
  return e ? (e.startsWith("/") || (e = "/" + e), e = e.replace(/^\/+/, "/"), e) : "/";
}
function la(n = "") {
  let e = Q(n);
  for (; ; ) {
    const r = e.replace(/%([0-9a-f]{2})/gi, (o, s) => {
      const i = Number.parseInt(s, 16);
      return i <= 127 ? String.fromCharCode(i) : o;
    });
    if (r === e) break;
    e = r;
  }
  const a = [];
  for (const r of e.replace(/\\/g, "/").toLowerCase().split("/"))
    !r || r === "." || (r === ".." ? a.pop() : a.push(r));
  const t = `/${a.join("/")}`;
  return t === "/web" || t.startsWith("/web/");
}
function Ha(n = "") {
  const e = String(n || ""), a = new TextEncoder().encode(e);
  let t = "";
  for (const r of a) t += String.fromCharCode(r);
  return btoa(t).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "");
}
function ka(n = "") {
  const e = String(n || "").trim().replace(/-/g, "+").replace(/_/g, "/");
  if (!e) return "";
  const a = e.length % 4, t = e + (a ? "=".repeat(4 - a) : ""), r = atob(t), o = Uint8Array.from(r, (s) => s.charCodeAt(0));
  return new TextDecoder().decode(o);
}
function li(n) {
  const e = "/admin", a = String(n || "").trim();
  if (!a) return e;
  let t = Q(a);
  return t = t.replace(/\/{2,}/g, "/"), t.length > 1 && (t = t.replace(/\/+$/, "")), !t || t === "/" || t.toLowerCase().startsWith("/api") ? e : t;
}
function ui(n, e) {
  const a = Q(n || "/"), t = Q(e || "/");
  return a === t || a.startsWith(t + "/");
}
function Er(n, e) {
  const a = Q(n || "/"), t = Q(e || "/");
  return !t || t === "/" ? a === t : a === t || a === `${t}/`;
}
function Ze(n) {
  return li(n?.ADMIN_PATH);
}
function sn(n = "/admin") {
  const e = li(n);
  return e === "/" ? "/login" : `${e}/login`;
}
function So(n) {
  return sn(Ze(n));
}
function fu(n) {
  const e = Ze(n), a = Q(e).toLowerCase(), t = [], r = a.split("/").filter(Boolean).map((o) => wt(o).toLowerCase());
  return r.length === 1 && r[0] && t.push({
    name: r[0],
    reservedBy: e,
    reason: "admin_path"
  }), a === "/admin" && t.push({
    name: "api",
    reservedBy: "/api/auth/login",
    reason: "legacy_admin_login"
  }), t;
}
function mu(n, e) {
  const a = String(n || "").trim().toLowerCase();
  return a && fu(e).find((t) => t.name === a) || null;
}
function di(n = {}) {
  return String(n?.name || "").trim() ? String(n?.target || "").trim() ? !0 : Array.isArray(n?.lines) && n.lines.length > 0 : !1;
}
function Wo(n, e) {
  const a = Array.isArray(n) ? n : [n];
  for (const t of a) {
    if (!di(t) || Qe(t?.entryMode)) continue;
    const r = mu(t?.name, e);
    if (r)
      return {
        ...r,
        name: String(t?.name || "").trim().toLowerCase()
      };
  }
  return null;
}
function pu(n = {}, e = null) {
  if (!Qe(n?.entryMode)) return null;
  const a = String(n?.name || "").trim().toLowerCase();
  if (!a) return {
    code: "HOST_PREFIX_REQUIRED",
    message: "域名前缀不能为空",
    name: a
  };
  if (!nn(a)) return {
    code: "HOST_PREFIX_INVALID",
    message: "域名前缀仅支持小写字母、数字、连字符，且不能以下划线、点或连字符结尾",
    name: a
  };
  const t = kl(e);
  if (t && t.name === a) return {
    code: "HOST_PREFIX_RESERVED_BY_LEGACY_HOST",
    message: "该域名前缀已被旧部署子域兼容入口保留，请更换后重试",
    name: a,
    reservedBy: t.reservedBy,
    reason: t.reason,
    legacyHost: t.legacyHost,
    host: t.host
  };
  const r = qs(n?.hostPrefixCnameTarget);
  return r ? {
    code: "HOST_PREFIX_CNAME_TARGET_INVALID",
    message: r,
    field: "hostPrefixCnameTarget",
    value: String(n?.hostPrefixCnameTarget || "").trim(),
    name: a
  } : null;
}
function Vo(n, e = null) {
  const a = Array.isArray(n) ? n : [n];
  for (const t of a) {
    if (!di(t)) continue;
    const r = pu(t, e);
    if (r) return r;
  }
  return null;
}
function gu(n) {
  const e = Ze(n);
  return e === "/" ? "/" : e;
}
function Re(n) {
  return String(n ?? "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#39;");
}
function Br(n) {
  return JSON.stringify(n).replace(/</g, "\\u003c").replace(/>/g, "\\u003e").replace(/&/g, "\\u0026").replace(/\u2028/g, "\\u2028").replace(/\u2029/g, "\\u2029");
}
function ze(n, e = null) {
  const a = [];
  n?.JWT_SECRET || a.push("JWT_SECRET"), n?.ADMIN_PASS || a.push("ADMIN_PASS");
  const t = typeof e?.adminPath == "string" ? e.adminPath : Ze(n), r = typeof e?.loginPath == "string" ? e.loginPath : sn(t);
  return {
    ok: a.length === 0,
    missing: a,
    adminPath: t,
    loginPath: r,
    message: a.length ? `系统未初始化：缺少 ${a.join("、")}。` : "系统初始化检查通过。"
  };
}
function fi(n, e = null) {
  const a = ze(n, e);
  if (a.ok) return a;
  const t = a.missing.join("|") || "unknown";
  return Xe.InitCheckWarnedFingerprints.has(t) || (Xe.InitCheckWarnedFingerprints.size >= 32 && Xe.InitCheckWarnedFingerprints.clear(), Xe.InitCheckWarnedFingerprints.add(t), console.warn(`[Init Check] ${a.message} 管理入口: ${a.adminPath}`)), a;
}
function Fn(n) {
  if (!n || n.ok) return "";
  const e = Array.isArray(n.missing) && n.missing.length ? n.missing.map((a) => `<code class="rounded bg-amber-100/80 px-1.5 py-0.5 text-[11px] font-semibold text-amber-700">${Re(a)}</code>`).join(" ") : '<code class="rounded bg-amber-100/80 px-1.5 py-0.5 text-[11px] font-semibold text-amber-700">UNKNOWN</code>';
  return `<div id="init-health-banner" class="mx-4 mt-4 rounded-2xl border border-amber-200 bg-amber-50/95 px-4 py-3 text-sm text-amber-900 shadow-sm"><div class="flex flex-col gap-1 md:flex-row md:items-center md:justify-between"><div class="font-semibold">系统未初始化</div><div class="text-xs text-amber-700">管理入口：${Re(n.adminPath || "/admin")}</div></div><p class="mt-2 leading-6">检测到关键环境变量缺失：${e}</p><p class="mt-1 text-xs leading-5 text-amber-700">请先在 Cloudflare Worker 环境变量中补齐后再使用管理台登录与敏感操作。</p></div>`;
}
function ea(n) {
  return String(n?.cf?.colo || "").trim().toUpperCase() || "UNKNOWN";
}
function Ka(n) {
  return ks(String(n?.headers?.get?.("CF-RAY") || n?.headers?.get?.("cf-ray") || "").trim());
}
function hu(n) {
  return String(n?.cf?.country || "").trim().toUpperCase() || "UNKNOWN";
}
function yu(n) {
  const e = hu(n);
  return {
    countryCode: e,
    countryName: wl(e)
  };
}
function Su(n = {}, e = {}) {
  const { statusPort: a } = n, t = '<!DOCTYPE html><html lang="zh-CN"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0, viewport-fit=cover"><link rel="icon" href="/favicon.ico" sizes="any"><title>Emby Proxy Admin Shell</title><script id="admin-bootstrap" type="application/json">__ADMIN_BOOTSTRAP_JSON__<\/script><style>:root{color-scheme:dark}*{box-sizing:border-box}body{margin:0;min-height:100vh;background:radial-gradient(circle at top,#0f172a 0,#020617 44%,#020617 100%);color:#e2e8f0;font-family:Inter,ui-sans-serif,system-ui,-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif}a{color:inherit;text-decoration:none}.admin-fallback-shell{min-height:100vh;display:flex;align-items:center;justify-content:center;padding:32px 18px}.admin-fallback-card{width:min(100%,980px);border:1px solid rgba(51,65,85,.92);border-radius:30px;background:rgba(15,23,42,.94);box-shadow:0 32px 96px rgba(2,6,23,.52);padding:28px;backdrop-filter:blur(20px)}.admin-fallback-pill{display:inline-flex;align-items:center;gap:8px;border-radius:999px;padding:8px 14px;background:rgba(59,130,246,.12);border:1px solid rgba(96,165,250,.32);color:#bfdbfe;font-size:12px;font-weight:700;letter-spacing:.14em;text-transform:uppercase}.admin-fallback-title{margin:20px 0 0;font-size:clamp(1.9rem,4vw,3rem);line-height:1.08;color:#fff}.admin-fallback-copy{margin:14px 0 0;max-width:54rem;color:#cbd5e1;font-size:15px;line-height:1.8}.admin-fallback-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(220px,1fr));gap:14px;margin-top:24px}.admin-fallback-stat{border:1px solid rgba(51,65,85,.9);border-radius:22px;background:rgba(2,6,23,.48);padding:16px}.admin-fallback-k{font-size:12px;font-weight:700;letter-spacing:.14em;text-transform:uppercase;color:#64748b}.admin-fallback-v{margin-top:10px;font-size:15px;line-height:1.7;color:#f8fafc;word-break:break-word}.admin-fallback-actions{display:flex;flex-wrap:wrap;gap:12px;margin-top:24px}.admin-fallback-btn{display:inline-flex;align-items:center;justify-content:center;border-radius:16px;padding:12px 18px;font-size:14px;font-weight:700;transition:transform .18s ease,background-color .18s ease,border-color .18s ease}.admin-fallback-btn:hover{transform:translateY(-1px)}.admin-fallback-btn-primary{background:#2563eb;color:#fff;border:1px solid rgba(147,197,253,.7);box-shadow:0 12px 28px rgba(37,99,235,.24)}.admin-fallback-btn-primary:hover{background:#1d4ed8;border-color:#93c5fd}.admin-fallback-btn-secondary{background:rgba(15,23,42,.5);color:#e2e8f0;border:1px solid rgba(51,65,85,.95)}.admin-fallback-btn-secondary:hover{background:rgba(30,41,59,.85)}.admin-fallback-panel{margin-top:24px;border:1px solid rgba(51,65,85,.9);border-radius:24px;background:rgba(2,6,23,.4);padding:20px}.admin-fallback-panel h2{margin:0;font-size:15px;color:#fff}.admin-fallback-panel p{margin:10px 0 0;font-size:14px;line-height:1.7;color:#cbd5e1}.admin-fallback-panel details{margin-top:16px}.admin-fallback-panel summary{cursor:pointer;color:#93c5fd;font-weight:700}.admin-fallback-panel pre{overflow:auto;margin:12px 0 0;padding:14px;border-radius:18px;background:#020617;color:#cbd5e1;font-size:12px;line-height:1.6}.admin-fallback-note{margin-top:16px;color:#94a3b8;font-size:13px;line-height:1.7}@media (max-width:640px){.admin-fallback-shell{padding:18px 12px}.admin-fallback-card,.admin-fallback-stat,.admin-fallback-panel{border-radius:22px}.admin-fallback-card{padding:22px}.admin-fallback-actions{flex-direction:column}.admin-fallback-btn{width:100%}}</style></head><body><main class="admin-fallback-shell"><section class="admin-fallback-card"><div class="admin-fallback-pill">Admin Shell</div><h1 class="admin-fallback-title">管理台壳层正在处理中</h1><p class="admin-fallback-copy">Worker 继续负责管理台壳、登录与统一后台 API；页面主体会根据当前状态注入设置页、远端壳或错误态内容。</p>__INIT_HEALTH_BANNER____ADMIN_APP_ROOT__</section></main></body></html>';
  let r = -1;
  const o = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64">
      <defs>
        <linearGradient id="media-favicon-bg" x1="18%" y1="12%" x2="84%" y2="88%">
          <stop offset="0%" stop-color="#3b82f6"/>
          <stop offset="100%" stop-color="#4f46e5"/>
        </linearGradient>
        <radialGradient id="media-favicon-highlight" cx="28%" cy="20%" r="72%">
          <stop offset="0%" stop-color="#ffffff" stop-opacity="0.34"/>
          <stop offset="55%" stop-color="#ffffff" stop-opacity="0.08"/>
          <stop offset="100%" stop-color="#ffffff" stop-opacity="0"/>
        </radialGradient>
      </defs>
      <rect x="4" y="4" width="56" height="56" rx="15" fill="url(#media-favicon-bg)"/>
      <rect x="4" y="4" width="56" height="56" rx="15" fill="url(#media-favicon-highlight)"/>
      <rect x="4.75" y="4.75" width="54.5" height="54.5" rx="14.25" fill="none" stroke="#ffffff" stroke-opacity="0.12" stroke-width="1.5"/>
      <path d="M24 18h8v28h-8zM24 18h18v6H24zM24 29h14v6H24zM24 40h18v6H24z" fill="#ffffff"/>
    </svg>`, s = '<style>:root{color-scheme:dark}*{box-sizing:border-box}body{margin:0;min-height:100vh;background:radial-gradient(circle at top,#0f172a 0,#020617 48%,#020617 100%);color:#e2e8f0;font-family:Inter,system-ui,-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif}a{color:inherit;text-decoration:none}.landing-shell{min-height:100vh;display:flex;align-items:center;justify-content:center;padding:48px 24px}.landing-card{width:min(100%,1100px);border:1px solid rgba(51,65,85,.9);border-radius:32px;background:rgba(15,23,42,.94);box-shadow:0 28px 90px rgba(2,6,23,.48);overflow:hidden}.landing-grid{display:grid;gap:0}.landing-primary,.landing-side{padding:32px}.landing-primary{text-align:left}.landing-side{border-top:1px solid rgba(51,65,85,.9);background:rgba(2,6,23,.55)}.landing-pill{display:inline-flex;align-items:center;border:1px solid rgba(59,130,246,.3);border-radius:999px;background:rgba(59,130,246,.1);padding:6px 12px;color:#93c5fd;font-size:12px;font-weight:700;letter-spacing:.16em;text-transform:uppercase}.landing-title{margin:20px 0 0;font-size:clamp(2rem,4vw,3.25rem);line-height:1.1;color:#fff}.landing-text{margin:16px 0 0;font-size:15px;line-height:1.8;color:#cbd5e1}.landing-text-muted{color:#94a3b8}.landing-highlight{font-weight:700;color:#fff}.landing-actions{display:flex;flex-direction:column;gap:12px;margin-top:32px}.landing-btn{display:inline-flex;align-items:center;justify-content:center;border-radius:18px;padding:14px 20px;font-size:14px;font-weight:700;transition:background-color .18s ease,border-color .18s ease,transform .18s ease}.landing-btn:hover{transform:translateY(-1px)}.landing-btn-primary{border:1px solid rgba(147,197,253,.7);background:#2563eb;color:#fff;box-shadow:0 12px 28px rgba(37,99,235,.25)}.landing-btn-primary:hover{border-color:#93c5fd;background:#1d4ed8}.landing-btn-secondary{border:1px solid rgba(51,65,85,.95);background:rgba(15,23,42,.45);color:#e2e8f0}.landing-btn-secondary:hover{background:rgba(30,41,59,.8)}.landing-notes{border:1px solid rgba(51,65,85,.9);border-radius:24px;background:rgba(15,23,42,.72);padding:24px}.landing-notes-title{font-size:12px;font-weight:700;letter-spacing:.16em;text-transform:uppercase;color:#64748b}.landing-note-list{margin:16px 0 0;padding-left:18px;color:#cbd5e1;font-size:14px;line-height:1.75}.landing-note-list li+li{margin-top:12px}.landing-banner{margin-bottom:16px;border:1px solid rgba(252,211,77,.32);border-radius:18px;background:rgba(245,158,11,.12);padding:14px 16px;color:#fef3c7}.landing-banner-title{font-size:14px;font-weight:700;color:#fef3c7}.landing-banner-text{margin-top:6px;font-size:12px;line-height:1.6;color:rgba(254,243,199,.92)}@media (min-width:900px){.landing-grid{grid-template-columns:minmax(0,1.1fr) minmax(320px,.9fr)}.landing-primary,.landing-side{padding:40px}.landing-side{border-top:0;border-left:1px solid rgba(51,65,85,.9)}}@media (min-width:640px){.landing-actions{flex-direction:row}}@media (max-width:639px){.landing-shell{padding:24px 16px}.landing-card,.landing-notes{border-radius:24px}.landing-primary,.landing-side{padding:24px}.landing-btn{width:100%}}</style>';
  function i($ = "GET") {
    const V = new Headers({
      "Content-Type": "image/svg+xml;charset=UTF-8",
      "Cache-Control": "public, max-age=86400, s-maxage=604800, immutable"
    });
    return Ce(V), new Response($ === "HEAD" ? null : o, { headers: V });
  }
  const c = Object.freeze([
    "__ADMIN_BOOTSTRAP_JSON__",
    "__INIT_HEALTH_BANNER__",
    "__ADMIN_APP_ROOT__"
  ]), l = "embedded-fallback-v1", u = m(t), d = "minimal-split-parts", f = !0;
  function m($ = "") {
    const V = String($ || ""), X = [];
    let q = 0;
    for (const Y of c) {
      const re = V.indexOf(Y, q);
      if (re < 0) throw new Error(`missing admin html placeholder: ${Y}`);
      X.push(V.slice(q, re)), q = re + Y.length;
    }
    return X.push(V.slice(q)), X;
  }
  function p($ = [], V = {}) {
    let X = String($[0] || "");
    for (let q = 0; q < c.length; q += 1) {
      const Y = c[q];
      X += String(V[Y] || ""), X += String($[q + 1] || "");
    }
    return X;
  }
  const g = "__ADMIN_BOOTSTRAP_JSON__", h = "__INIT_HEALTH_BANNER__", y = "__ADMIN_APP_ROOT__", S = "", _ = "https://admin-shell-cache.invalid", A = "private, no-store, max-age=0", b = "public, max-age=31536000, immutable", R = 300 * 1e3, E = 2 * 1024 * 1024, D = "bootstrap-tailwind-assets-v3-active-index", w = "X-Admin-Shell-Cached-At", C = "X-Admin-Shell-Source-Etag", T = "X-Admin-Shell-Source-Last-Modified", I = "X-Admin-Shell-Source-Hash", P = "__release", U = "vendor", K = "__warm", G = "https://admin-release-vendor-cache.invalid", x = "https://admin-release-vendor-manifest.invalid", N = "public, max-age=31536000, immutable", M = "no-store, max-age=0", L = 8 * 1024 * 1024, v = 3, W = "X-Admin-Release-Vendor-Cached-At", z = "X-Admin-Release-Vendor-Source-Hash", H = Object.freeze([
    "dashboard",
    "nodes",
    "logs",
    "dns",
    "settings"
  ]), j = Object.freeze([
    "系统 UI",
    "代理与网络",
    "静态资源策略",
    "安全防护",
    "日志设置",
    "监控告警",
    "账号设置",
    "备份与恢复"
  ]), ne = Object.freeze([
    "ui",
    "proxy",
    "security",
    "logs",
    "account"
  ]);
  function fe() {
    return {
      truthSources: {
        primaryUi: "frontend/",
        templateHtml: "frontend/index.html",
        contractDoc: "worker.md"
      },
      bootstrapActions: {
        default: "getAdminBootstrap",
        settings: "getSettingsBootstrap"
      },
      primaryViews: [...H],
      settings: {
        visualSections: [...j],
        saveGroups: [...ne]
      }
    };
  }
  function me($, V = ze($), X = {}) {
    return {
      adminPath: Ze($),
      loginPath: So($),
      initHealth: V,
      hostDomain: Ke($),
      contract: fe(),
      shell: tt($, V, X)
    };
  }
  function le() {
    if (r >= 0) return r;
    if (!Array.isArray(u) || u.length !== c.length + 1)
      return r = 0, 0;
    const $ = new TextEncoder();
    let V = 0;
    for (let X = 0; X < u.length; X += 1)
      V += $.encode(String(u[X] || "")).length, X < c.length && (V += $.encode(c[X]).length);
    return r = V, r;
  }
  function pe($ = !1, V = "") {
    const X = String(V || "").trim().toLowerCase();
    return $ ? "remote_ready" : X === "setup_required" ? "setup_required" : "embedded_only";
  }
  function Pe($ = !1, V = f) {
    return $ ? V ? "embedded_fallback_retained" : "legacy_inline_shell_active" : "embedded_fallback_missing";
  }
  function $e($ = "embedded", V = "") {
    return String($ || "").trim().toLowerCase() === "gate" || String(V || "").trim() === "setup_gate" ? "setup_gate" : String($ || "").trim().toLowerCase() === "remote" ? "remote_shell" : String(V || "").trim() === "embedded_fallback" ? "embedded_fallback" : "embedded_shell";
  }
  function Lt($ = !1, V = "") {
    return $ ? String(V || "").trim() === "embedded_fallback" ? "active" : "retained" : "missing";
  }
  function tt($, V = ze($), X = {}) {
    const q = Tt($, X), Y = q.indexUrl, re = le(), he = !!Y, Fe = re > 0;
    let Ue = "";
    if (Y) try {
      Ue = new URL(Y).origin;
    } catch {
      Ue = "";
    }
    return {
      mode: he ? "remote-preferred" : "setup_required",
      lifecycleState: pe(he, q.gateState),
      embeddedFallbackState: Fe ? "retained" : "missing",
      retirementState: Pe(Fe),
      gateState: q.gateState,
      indexUrl: q.indexUrl,
      indexUrlSource: q.indexUrlSource,
      effectiveRef: q.effectiveRef,
      remoteShellConfigured: he,
      remoteShellIndexUrl: Y,
      remoteShellOrigin: Ue,
      initHealthOk: V?.ok === !0,
      embeddedFallbackAvailable: Fe,
      embeddedTemplateSource: d,
      embeddedTemplateMode: d,
      embeddedTemplateBytes: re,
      finalUiHtmlRetired: f
    };
  }
  function Mt($, V = {}) {
    return Tt($, V).indexUrl;
  }
  function It($ = {}) {
    const V = F($.shellState) ? $.shellState : {}, X = F($.initHealth) ? $.initHealth : {}, q = F($.indexState) ? $.indexState : {}, Y = String($.remoteShellIndexUrl || V.remoteShellIndexUrl || q.indexUrl || "").trim(), re = String($.mode || "").trim().toLowerCase(), he = re === "remote" ? "remote" : re === "gate" ? "gate" : "embedded", Fe = V.remoteShellConfigured === !0 || !!Y, Ue = V.embeddedFallbackAvailable === !0, We = V.finalUiHtmlRetired !== !1, St = String($.routeState || "").trim() || (he === "remote" ? "remote_active" : he === "gate" ? "setup_gate" : "embedded_active"), _t = String($.lifecycleState || V.lifecycleState || "").trim() || pe(Fe, $.gateState || V.gateState || q.gateState || ""), nt = String($.embeddedFallbackState || V.embeddedFallbackState || "").trim() || Lt(Ue, St), yr = String($.retirementState || V.retirementState || "").trim() || Pe(Ue, We), Xr = String($.gateState || V.gateState || q.gateState || (Y ? "shell_ready" : "setup_required")).trim() || "setup_required";
    return {
      ...V,
      mode: he,
      effectiveMode: $e(he, St),
      gateState: Xr,
      lifecycleState: _t,
      embeddedFallbackState: nt,
      retirementState: yr,
      sourceType: String($.sourceType || "").trim().toLowerCase() || (he === "remote" ? "remote_fetch" : he === "gate" ? "setup_gate" : "embedded_local"),
      routeState: St,
      indexUrl: String($.indexUrl || V.indexUrl || q.indexUrl || Y).trim(),
      indexUrlSource: String($.indexUrlSource || V.indexUrlSource || q.indexUrlSource || "").trim(),
      effectiveRef: String($.effectiveRef || V.effectiveRef || q.effectiveRef || "").trim(),
      effectiveRefType: String($.effectiveRefType || V.effectiveRefType || q.effectiveRefType || "").trim(),
      remoteShellIndexUrl: Y,
      remoteShellOrigin: String(V.remoteShellOrigin || "").trim(),
      remoteCacheState: String($.remoteCacheState || "").trim().toLowerCase(),
      revalidateDue: $.revalidateDue === !0,
      lastFetchStatus: String($.lastFetchStatus || "").trim().toLowerCase(),
      reason: String($.reason || "").trim(),
      requestPath: String($.requestPath || "").trim(),
      initHealthOk: X.ok === !0,
      initHealthMissing: [...new Set((Array.isArray(X.missing) ? X.missing : []).map((Ca) => String(Ca || "").trim()).filter(Boolean))],
      fallbackRetained: Ue,
      templateMode: String(V.embeddedTemplateMode || V.embeddedTemplateSource || "").trim() || d,
      finalUiHtmlRetired: We,
      updatedAt: String($.updatedAt || "").trim() || (/* @__PURE__ */ new Date()).toISOString()
    };
  }
  async function jr($, V = {}, X = null) {
    const q = F(V.shellState) ? V.shellState : tt($, V.initHealth, V.config || {}), Y = It({
      ...V,
      shellState: q
    }), re = a.resolveOpsStatusStores($).db, { updatedAt: he, ...Fe } = Y, Ue = ce(se(Fe)), We = re ? Z.AdminShellStatusWriteState.get(re) : null, St = Math.max(1e3, Number(O.Defaults.AdminShellStatusStableWriteIntervalMs) || 1e3);
    if (V.throttleStableWrites === !0 && We?.fingerprint === Ue) {
      if (We.writePromise) return We.writePromise;
      if (k() - (Number(We.writtenAt) || 0) < St) return null;
    }
    const _t = ge(Promise.resolve(a.patchOpsStatus($, { adminShell: Y }, X)).then((nt) => ({
      ok: !0,
      result: nt
    })), "admin.shell_status_patch", {
      requestPath: Y.requestPath,
      mode: Y.mode,
      sourceType: Y.sourceType
    }, {
      ok: !1,
      result: null
    }).then((nt) => (!re || Z.AdminShellStatusWriteState.get(re)?.writePromise !== _t || (nt?.ok === !0 ? Z.AdminShellStatusWriteState.set(re, {
      fingerprint: Ue,
      writtenAt: k(),
      writePromise: null
    }) : We ? Z.AdminShellStatusWriteState.set(re, We) : Z.AdminShellStatusWriteState.delete(re)), nt?.result ?? null));
    return re && Z.AdminShellStatusWriteState.set(re, {
      fingerprint: Ue,
      writtenAt: 0,
      writePromise: _t
    }), _t;
  }
  function Pt($ = {}, V, X = {}, q = ze(V)) {
    const Y = F($) ? $ : {}, re = Tt(V, X), he = tt(V, q, X);
    return {
      ...Y,
      adminShell: It({
        ...F(Y.adminShell) ? Y.adminShell : {},
        shellState: he,
        initHealth: q,
        indexState: re,
        remoteShellIndexUrl: re.indexUrl,
        gateState: re.gateState,
        indexUrl: re.indexUrl,
        indexUrlSource: re.indexUrlSource,
        effectiveRef: re.effectiveRef,
        effectiveRefType: re.effectiveRefType,
        mode: F(Y.adminShell) && String(Y.adminShell.mode || "").trim() ? Y.adminShell.mode : re.indexUrl ? "remote" : "gate",
        routeState: F(Y.adminShell) && String(Y.adminShell.routeState || "").trim() ? Y.adminShell.routeState : re.indexUrl ? "remote_ready_idle" : "setup_gate",
        sourceType: F(Y.adminShell) && String(Y.adminShell.sourceType || "").trim() ? Y.adminShell.sourceType : re.indexUrl ? "runtime_status" : "setup_gate"
      })
    };
  }
  function pr($ = "") {
    const V = String($ || "").trim();
    if (!V) return "已上传的管理台 HTML 暂时不可用，请重新上传。";
    if (V.startsWith("remote_shell_render_failed")) {
      const X = V.replace(/^remote_shell_render_failed:\s*/i, "").trim();
      return X ? `Worker 读取 index.html 失败：${X}` : "Worker 读取 index.html 失败。";
    }
    return V;
  }
  function xt($ = {}, V = {}, X = {}, q = {}) {
    const Y = String($.adminPath || "/admin").trim() || "/admin", re = String(q.remoteShellIndexUrl || V.remoteShellIndexUrl || "").trim(), he = pr(q.reason || ""), Fe = `${Y}?setup=1`;
    return `<style>
        .admin-remote-error-shell{max-width:920px;margin:0 auto;padding:44px 20px 56px;color:#0f172a}
        .admin-remote-error-card{background:rgba(255,255,255,.96);border:1px solid rgba(248,113,113,.22);border-radius:28px;box-shadow:0 24px 80px rgba(15,23,42,.12);overflow:hidden}
        .dark .admin-remote-error-card{background:rgba(15,23,42,.94);border-color:rgba(248,113,113,.32);color:#e2e8f0}
        .admin-remote-error-head{padding:30px 30px 22px;border-bottom:1px solid rgba(248,113,113,.14)}
        .admin-remote-error-kicker{display:inline-flex;align-items:center;padding:7px 12px;border-radius:999px;background:rgba(239,68,68,.1);color:#b91c1c;font-size:12px;font-weight:700;letter-spacing:.08em;text-transform:uppercase}
        .dark .admin-remote-error-kicker{background:rgba(248,113,113,.16);color:#fecaca}
        .admin-remote-error-title{margin:16px 0 10px;font-size:clamp(28px,4.8vw,40px);line-height:1.05}
        .admin-remote-error-desc{margin:0;color:#475569;line-height:1.8}
        .dark .admin-remote-error-desc{color:#cbd5e1}
        .admin-remote-error-body{padding:26px 30px 30px}
        .admin-remote-error-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:14px;margin-bottom:22px}
        .admin-remote-error-stat{padding:15px 16px;border-radius:18px;background:#f8fafc;border:1px solid rgba(148,163,184,.16)}
        .dark .admin-remote-error-stat{background:#111827;border-color:rgba(71,85,105,.5)}
        .admin-remote-error-k{font-size:11px;font-weight:700;letter-spacing:.08em;text-transform:uppercase;color:#64748b}
        .admin-remote-error-v{margin-top:8px;font-size:14px;line-height:1.7;color:#0f172a;word-break:break-word}
        .dark .admin-remote-error-v{color:#f8fafc}
        .admin-remote-error-actions{display:flex;flex-wrap:wrap;gap:12px;margin:22px 0 20px}
        .admin-remote-error-btn{display:inline-flex;align-items:center;justify-content:center;padding:12px 18px;border-radius:14px;font-weight:700;text-decoration:none}
        .admin-remote-error-btn-primary{background:#0f172a;color:#fff}
        .dark .admin-remote-error-btn-primary{background:#e2e8f0;color:#0f172a}
        .admin-remote-error-btn-secondary{background:#fff;border:1px solid rgba(148,163,184,.22);color:#334155}
        .dark .admin-remote-error-btn-secondary{background:#0f172a;border-color:rgba(71,85,105,.6);color:#e2e8f0}
        .admin-remote-error-note{margin:0;color:#64748b;line-height:1.8}
        .dark .admin-remote-error-note{color:#94a3b8}
        .admin-remote-error-debug{margin-top:18px}
        .admin-remote-error-debug pre{margin:12px 0 0;padding:16px;border-radius:18px;background:#0f172a;color:#e2e8f0;overflow:auto;font-size:12px;line-height:1.6}
        @media (max-width: 820px){
          .admin-remote-error-grid{grid-template-columns:1fr}
          .admin-remote-error-head,.admin-remote-error-body{padding:22px}
        }
      </style>
      <div class="admin-remote-error-shell">
        <section class="admin-remote-error-card">
          <div class="admin-remote-error-head">
            <div class="admin-remote-error-kicker">HTML Error</div>
            <h1 class="admin-remote-error-title">管理台 HTML 暂时不可用</h1>
            <p class="admin-remote-error-desc">${Re(he)}</p>
          </div>
          <div class="admin-remote-error-body">
            <div class="admin-remote-error-grid">
              <article class="admin-remote-error-stat"><div class="admin-remote-error-k">错误原因</div><div class="admin-remote-error-v">${Re(he)}</div></article>
              <article class="admin-remote-error-stat"><div class="admin-remote-error-k">本地版本标识</div><div class="admin-remote-error-v">${Re(re || "未找到本地 HTML 版本")}</div></article>
            </div>
            <div class="admin-remote-error-actions">
              <a href="${Re(Y)}" class="admin-remote-error-btn admin-remote-error-btn-primary">刷新 /admin</a>
              <a href="${Re(Fe)}" class="admin-remote-error-btn admin-remote-error-btn-secondary">重新上传 index.html</a>
            </div>
            <p class="admin-remote-error-note">如果这里继续报错，请重新上传与当前 Worker 匹配的 index.html。</p>
          </div>
        </section>
      </div>`;
  }
  function rt($ = {}, V = {}, X = {}, q = {}, Y = {}) {
    const re = String($.adminPath || "/admin").trim() || "/admin", he = Y?.isLocalUpload === !0, Fe = Br({ adminPath: re });
    return `<style>
        .admin-gate-shell{max-width:720px;margin:0 auto;padding:48px 20px 64px;color:#0f172a}
        .admin-gate-card{background:#fff;border:1px solid #dbe3ee;border-radius:8px;box-shadow:0 18px 50px rgba(15,23,42,.1);overflow:hidden}
        .dark .admin-gate-card{background:#0f172a;border-color:#334155;color:#e2e8f0}
        .admin-gate-head{padding:24px 24px 18px;border-bottom:1px solid #e2e8f0}
        .dark .admin-gate-head{border-color:#334155}
        .admin-gate-kicker{margin:0 0 8px;color:#0369a1;font-size:12px;font-weight:700;text-transform:uppercase}
        .dark .admin-gate-kicker{color:#7dd3fc}
        .admin-gate-title{margin:0;font-size:24px;line-height:1.3}
        .admin-gate-body{padding:24px;display:grid;gap:18px}
        .admin-gate-field{display:grid;gap:8px;min-width:0}
        .admin-gate-label{font-size:13px;font-weight:700;color:#475569}
        .dark .admin-gate-label{color:#cbd5e1}
        .admin-gate-input{width:100%;min-width:0;padding:12px;border-radius:6px;border:1px solid #cbd5e1;background:#fff;color:#0f172a;font-size:14px;outline:none}
        .dark .admin-gate-input{background:#020617;color:#e2e8f0;border-color:#475569}
        .admin-gate-input:focus{border-color:#0284c7;box-shadow:0 0 0 3px rgba(2,132,199,.14)}
        .admin-gate-hint{font-size:12px;line-height:1.6;color:#64748b;overflow-wrap:anywhere}
        .dark .admin-gate-hint{color:#94a3b8}
        .admin-gate-status{min-height:44px;padding:11px 12px;border-radius:6px;background:#f8fafc;border:1px solid #e2e8f0;color:#475569;line-height:1.6;overflow-wrap:anywhere}
        .dark .admin-gate-status{background:#111827;border-color:#334155;color:#cbd5e1}
        .admin-gate-status.is-error{background:#fff1f2;border-color:#fecdd3;color:#be123c}
        .dark .admin-gate-status.is-error{background:#4c0519;border-color:#881337;color:#fecdd3}
        .admin-gate-status.is-success{background:#ecfdf5;border-color:#a7f3d0;color:#166534}
        .dark .admin-gate-status.is-success{background:#052e16;border-color:#166534;color:#bbf7d0}
        .admin-gate-actions{display:flex;justify-content:flex-end}
        .admin-gate-btn{min-height:42px;padding:10px 16px;border:0;border-radius:6px;background:#0369a1;color:#fff;font-size:14px;font-weight:700;cursor:pointer}
        .admin-gate-btn:hover{background:#075985}
        .admin-gate-btn:disabled{cursor:wait;opacity:.65}
        @media (max-width:640px){.admin-gate-shell{padding:24px 12px 40px}.admin-gate-head,.admin-gate-body{padding:18px}.admin-gate-actions,.admin-gate-btn{width:100%}}
      </style>
      <div class="admin-gate-shell">
        <section class="admin-gate-card">
          <header class="admin-gate-head">
            <p class="admin-gate-kicker">Index Source</p>
            <h1 class="admin-gate-title">上传 index.html</h1>
          </header>
          <form id="admin-index-gate-form" class="admin-gate-body" novalidate>
            <label class="admin-gate-field">
              <span class="admin-gate-label">index.html</span>
              <input id="admin-gate-local-file" class="admin-gate-input" type="file" accept=".html,text/html" required />
              <span id="admin-gate-local-hint" class="admin-gate-hint">文件上限 2 MiB</span>
            </label>
            <div id="admin-gate-status" class="admin-gate-status${he ? " is-success" : ""}" role="status" aria-live="polite">${he ? "当前已有 HTML 版本，可上传新文件替换。" : "请选择 index.html。"}</div>
            <div class="admin-gate-actions">
              <button id="admin-gate-submit" type="submit" class="admin-gate-btn">上传并进入管理台</button>
            </div>
          </form>
        </section>
      </div>
      <script>
        const ADMIN_INDEX_GATE_RUNTIME = ${Fe};
        const gateForm = document.getElementById("admin-index-gate-form");
        const localFileInput = document.getElementById("admin-gate-local-file");
        const localFileHint = document.getElementById("admin-gate-local-hint");
        const submitButton = document.getElementById("admin-gate-submit");
        const gateStatus = document.getElementById("admin-gate-status");
        function setGateStatus(message, tone) {
          if (!gateStatus) return;
          gateStatus.textContent = message || "";
          gateStatus.classList.remove("is-error", "is-success");
          if (tone === "error") gateStatus.classList.add("is-error");
          if (tone === "success") gateStatus.classList.add("is-success");
        }
        function formatFileSize(bytes) {
          const value = Number(bytes) || 0;
          return value >= 1024 * 1024
            ? (value / (1024 * 1024)).toFixed(2) + " MiB"
            : Math.max(0, Math.round(value / 1024)) + " KiB";
        }
        function validateFile(file) {
          if (!file) return "请选择 index.html。";
          if (String(file.name || "").trim().toLowerCase() !== "index.html") return "文件名必须是 index.html。";
          if (file.size > 2 * 1024 * 1024) return "文件超过 2 MiB 上限。";
          return "";
        }
        localFileInput?.addEventListener("change", () => {
          const file = localFileInput.files?.[0];
          const error = validateFile(file);
          if (localFileHint) localFileHint.textContent = file ? file.name + " · " + formatFileSize(file.size) : "文件上限 2 MiB";
          setGateStatus(error || ("已选择 " + file.name + "。"), error ? "error" : "success");
        });
        gateForm?.addEventListener("submit", async (event) => {
          event.preventDefault();
          const file = localFileInput?.files?.[0];
          const validationError = validateFile(file);
          if (validationError) {
            setGateStatus(validationError, "error");
            localFileInput?.focus();
            return;
          }
          if (submitButton) submitButton.disabled = true;
          if (localFileInput) localFileInput.disabled = true;
          setGateStatus("正在上传并校验 index.html...", "");
          let redirecting = false;
          try {
            const response = await fetch(ADMIN_INDEX_GATE_RUNTIME.adminPath || "/admin", {
              method: "POST",
              credentials: "same-origin",
              headers: { "Content-Type": "application/json", "Accept": "application/json" },
              body: JSON.stringify({
                action: "uploadAdminIndex",
                fileName: file.name,
                indexHtml: await file.text()
              })
            });
            const payload = await response.json().catch(() => ({}));
            if (!response.ok) {
              const message = payload?.message || payload?.error?.message || payload?.error || ("上传失败（HTTP " + response.status + "）");
              throw new Error(String(message || "上传失败"));
            }
            redirecting = true;
            setGateStatus("index.html 已更新，正在进入管理台...", "success");
            window.location.assign(ADMIN_INDEX_GATE_RUNTIME.adminPath || "/admin");
          } catch (error) {
            setGateStatus(error?.message ? "上传失败：" + error.message : "上传失败，请稍后重试。", "error");
          } finally {
            if (!redirecting) {
              if (submitButton) submitButton.disabled = false;
              if (localFileInput) localFileInput.disabled = false;
            }
          }
        });
      <\/script>`;
  }
  function qr($ = "{}", V = "", X = S) {
    return !Array.isArray(u) || u.length !== c.length + 1 ? "" : p(u, {
      [g]: String($ || "{}"),
      [h]: String(V || ""),
      [y]: String(X || S)
    });
  }
  function Gt($ = {}, V = null, X = S) {
    const q = F($) ? $ : {}, Y = F(V) ? V : F(q.initHealth) ? q.initHealth : {}, re = {
      templateRevision: String(l).trim() || "admin-shell",
      adminPath: String(q.adminPath || "").trim(),
      loginPath: String(q.loginPath || "").trim(),
      hostDomain: ee(q.hostDomain),
      contractHash: ce(se(q.contract || fe())),
      initHealthOk: Y.ok === !0,
      initHealthMissing: [...new Set((Array.isArray(Y.missing) ? Y.missing : []).map((he) => String(he || "").trim()).filter(Boolean))],
      appRootHash: ce(String(X || S))
    };
    return `${re.templateRevision}-${ce(se(re))}`;
  }
  function ht($ = "") {
    return `"${String($ || "").trim()}"`;
  }
  function at($ = "") {
    return String($ || "").trim().replace(/^W\//i, "").replace(/^"(.*)"$/, "$1");
  }
  function Ot($, V = "") {
    const X = String($?.headers?.get?.("If-None-Match") || "").trim(), q = at(V);
    return !X || !q ? !1 : X.split(",").some((Y) => {
      const re = at(Y);
      return re === "*" || re === q;
    });
  }
  function yt($, V = "") {
    const X = $ instanceof Request ? new URL($.url) : new URL(String($ || ""), _), q = new URL(X.pathname, _);
    return q.searchParams.set("remote", ce(String(V || "").trim())), new Request(q.toString(), { method: "GET" });
  }
  function vt($, V = "", X = {}) {
    const q = yt($, V), Y = new URL(q.url);
    return Y.searchParams.set("transform", D), Y.searchParams.set("bootstrap", ce(se(F(X) ? X : {}))), new Request(Y.toString(), { method: "GET" });
  }
  function gr($ = "", V = "no-store, max-age=0") {
    const X = new Headers({
      "Content-Type": "text/html;charset=UTF-8",
      "Cache-Control": String(V || "no-store, max-age=0")
    });
    return Ce(X), $ && X.set("ETag", ht($)), X;
  }
  function jt($ = "") {
    const V = String($ || "").trim();
    if (!V) return "";
    const X = Date.parse(V);
    return Number.isFinite(X) ? new Date(X).toUTCString() : "";
  }
  function Ne($, V = "") {
    const X = String($?.headers?.get?.("If-Modified-Since") || "").trim(), q = jt(V);
    if (!X || !q) return !1;
    const Y = Date.parse(X), re = Date.parse(q);
    return !Number.isFinite(Y) || !Number.isFinite(re) ? !1 : Y >= re;
  }
  function hr($, V) {
    return String($?.headers?.get?.("If-None-Match") || "").trim() ? Ot($, V?.headers?.get?.("ETag") || "") : Ne($, V?.headers?.get?.("Last-Modified") || "");
  }
  function Be($, V = "no-store, max-age=0") {
    const X = new Headers({ "Cache-Control": String(V || "no-store, max-age=0") }), q = at($?.headers?.get?.("ETag") || ""), Y = jt($?.headers?.get?.("Last-Modified") || "");
    q && X.set("ETag", ht(q)), Y && X.set("Last-Modified", Y);
    const re = String($?.headers?.get?.("X-Admin-Shell-Revision") || "").trim();
    return re && X.set("X-Admin-Shell-Revision", re), Ce(X), new Response(null, {
      status: 304,
      headers: X
    });
  }
  return {
    ADMIN_FALLBACK_HTML_TEMPLATE: t,
    cachedAdminTemplateBytes: r,
    SITE_FAVICON_SVG: o,
    LANDING_PAGE_STYLE_HTML: s,
    renderFaviconResponse: i,
    ADMIN_HTML_DYNAMIC_PLACEHOLDERS: c,
    ADMIN_HTML_VARIANT_ETAG: l,
    ADMIN_HTML_PARTS_PLAIN: u,
    ADMIN_EMBEDDED_TEMPLATE_MODE: d,
    ADMIN_FINAL_UI_HTML_RETIRED: f,
    splitAdminHtmlTemplate: m,
    renderAdminHtmlTemplate: p,
    ADMIN_BOOTSTRAP_PLACEHOLDER: g,
    ADMIN_INIT_HEALTH_BANNER_PLACEHOLDER: h,
    ADMIN_APP_ROOT_PLACEHOLDER: y,
    ADMIN_APP_ROOT_HTML: S,
    ADMIN_HTML_CACHE_KEY_ORIGIN: _,
    ADMIN_REMOTE_SHELL_BROWSER_CACHE_CONTROL: A,
    ADMIN_REMOTE_SHELL_EDGE_CACHE_CONTROL: b,
    ADMIN_REMOTE_SHELL_REVALIDATE_MS: R,
    ADMIN_REMOTE_SHELL_MAX_BYTES: E,
    ADMIN_REMOTE_SHELL_TRANSFORM_REVISION: D,
    ADMIN_REMOTE_SHELL_CACHED_AT_HEADER: w,
    ADMIN_REMOTE_SHELL_SOURCE_ETAG_HEADER: C,
    ADMIN_REMOTE_SHELL_SOURCE_LAST_MODIFIED_HEADER: T,
    ADMIN_REMOTE_SHELL_SOURCE_HASH_HEADER: I,
    ADMIN_RELEASE_PROXY_PATH_SEGMENT: P,
    ADMIN_RELEASE_VENDOR_PATH_SEGMENT: U,
    ADMIN_WARM_PATH_SEGMENT: K,
    ADMIN_RELEASE_VENDOR_CACHE_KEY_ORIGIN: G,
    ADMIN_RELEASE_VENDOR_MANIFEST_CACHE_KEY_ORIGIN: x,
    ADMIN_RELEASE_VENDOR_CACHE_CONTROL: N,
    ADMIN_RELEASE_VENDOR_MUTABLE_CACHE_CONTROL: M,
    ADMIN_RELEASE_VENDOR_MAX_BYTES: L,
    ADMIN_WARM_VENDOR_CONCURRENCY: v,
    ADMIN_RELEASE_VENDOR_CACHED_AT_HEADER: W,
    ADMIN_RELEASE_VENDOR_SOURCE_HASH_HEADER: z,
    ADMIN_PRIMARY_VIEWS: H,
    ADMIN_SETTINGS_VISUAL_SECTIONS: j,
    ADMIN_SETTINGS_SAVE_GROUPS: ne,
    buildAdminUiContract: fe,
    buildAdminBootstrapPayload: me,
    measureAdminShellTemplateBytes: le,
    buildAdminShellLifecycleState: pe,
    buildAdminShellRetirementState: Pe,
    buildAdminShellEffectiveMode: $e,
    buildAdminEmbeddedFallbackRuntimeState: Lt,
    buildAdminShellState: tt,
    resolveAdminShellIndexUrl: Mt,
    normalizeAdminShellRuntimeStatus: It,
    patchAdminShellRuntimeStatus: jr,
    withAdminShellRuntimeStatus: Pt,
    describeAdminRemoteShellFailureReason: pr,
    buildAdminRemoteShellErrorContent: xt,
    buildAdminIndexSetupContent: rt,
    renderAdminHtmlShell: qr,
    buildAdminHtmlVariantEtag: Gt,
    formatAdminHtmlEtag: ht,
    normalizeEtagToken: at,
    requestHasMatchingEtag: Ot,
    buildAdminRemoteShellLegacyCacheKeyRequest: yt,
    buildAdminRemoteShellCacheKeyRequest: vt,
    buildAdminHtmlResponseHeaders: gr,
    normalizeAdminHttpDateHeader: jt,
    requestHasMatchingLastModified: Ne,
    requestMatchesAdminHtmlResponse: hr,
    buildConditionalNotModifiedResponseFromStoredResponse: Be
  };
}
function _u(n = {}, e = {}) {
  function a(N = "{}") {
    return `${s(N)}${t}`;
  }
  const t = '<script id="admin-bootstrap-loader">try{window.__ADMIN_BOOTSTRAP__=JSON.parse(document.getElementById("admin-bootstrap")?.textContent||"{}")}catch(_){window.__ADMIN_BOOTSTRAP__=window.__ADMIN_BOOTSTRAP__||{},window.__ADMIN_UI_BOOT_ERROR__=window.__ADMIN_UI_BOOT_ERROR__||"admin bootstrap parse failed: "+(_?.message||String(_||"unknown_error"))}<\/script>', r = '<script id="admin-tailwind-prelude">window.tailwind=window.tailwind||{};<\/script>', o = /* @__PURE__ */ new Set([
    "script",
    "style",
    "template",
    "textarea",
    "title",
    "noscript"
  ]);
  function s(N = "{}") {
    return `<script id="admin-bootstrap" type="application/json">${String(N || "{}")}<\/script>`;
  }
  function i(N = "") {
    return N === " " || N === "	" || N === `
` || N === "\f" || N === "\r";
  }
  function c(N, M) {
    let L = "";
    for (let v = M; v < N.length; v += 1) {
      const W = N[v];
      if (L)
        W === L && (L = "");
      else if (W === '"' || W === "'") L = W;
      else if (W === ">") return v;
    }
    return -1;
  }
  function l(N, M) {
    let L = M + 1;
    if (!/[A-Za-z]/.test(N[L] || "")) return null;
    const v = c(N, L);
    if (v < 0) return null;
    const W = L;
    for (; L < v && !i(N[L]) && N[L] !== "/"; ) L += 1;
    const z = N.slice(W, L).toLowerCase(), H = /* @__PURE__ */ new Map();
    for (; L < v; ) {
      for (; L < v && i(N[L]); ) L += 1;
      if (L >= v) break;
      if (N[L] === "/") {
        L += 1;
        continue;
      }
      const j = L;
      for (; L < v && !i(N[L]) && N[L] !== "=" && N[L] !== "/"; ) L += 1;
      if (L === j) {
        L += 1;
        continue;
      }
      const ne = N.slice(j, L).toLowerCase();
      for (; L < v && i(N[L]); ) L += 1;
      let fe = "", me = !1, le = -1, pe = -1;
      if (N[L] === "=") {
        for (L += 1; L < v && i(N[L]); ) L += 1;
        const Pe = N[L];
        if (Pe === '"' || Pe === "'") {
          for (me = !0, L += 1, le = L; L < v && N[L] !== Pe; ) L += 1;
          pe = L, fe = N.slice(le, pe), L < v && (L += 1);
        } else {
          for (le = L; L < v && !i(N[L]); ) L += 1;
          pe = L, fe = N.slice(le, pe);
        }
      }
      H.has(ne) || H.set(ne, {
        value: fe,
        quoted: me,
        valueStart: le,
        valueEnd: pe
      });
    }
    return {
      tagName: z,
      attributes: H,
      start: M,
      tagEnd: v
    };
  }
  function u(N, M, L, v) {
    const W = `</${L}`;
    let z = v;
    for (; z < N.length; ) {
      const H = M.indexOf(W, z);
      if (H < 0) return null;
      const j = N[H + W.length] || "";
      if (!j || i(j) || j === "/" || j === ">") {
        const ne = c(N, H + W.length);
        return ne >= 0 ? {
          start: H,
          tagEnd: ne
        } : null;
      }
      z = H + W.length;
    }
    return null;
  }
  function* d(N = "") {
    const M = String(N || ""), L = M.toLowerCase();
    let v = 0;
    for (; v < M.length; ) {
      const W = M.indexOf("<", v);
      if (W < 0) return;
      if (M.startsWith("<!--", W)) {
        const me = M.indexOf("-->", W + 4);
        v = me < 0 ? M.length : me + 3;
        continue;
      }
      const z = M[W + 1] || "";
      if (z === "!" || z === "?" || z === "/") {
        const me = c(M, W + 2);
        if (me < 0) return;
        v = me + 1;
        continue;
      }
      const H = l(M, W);
      if (!H) {
        if (/[A-Za-z]/.test(z)) return;
        v = W + 1;
        continue;
      }
      const j = H.tagEnd + 1, ne = o.has(H.tagName) ? u(M, L, H.tagName, j) : null, fe = ne ? ne.start : j;
      if (v = ne ? ne.tagEnd + 1 : j, yield {
        ...H,
        contentStart: j,
        contentEnd: ne || !o.has(H.tagName) ? fe : M.length,
        contentTagEnd: ne ? ne.tagEnd : -1,
        contentClosed: !!ne || !o.has(H.tagName)
      }, o.has(H.tagName) && !ne) return;
    }
  }
  function f(N = "", M = "") {
    const L = String(N || ""), v = String(M || "");
    if (!L || !v) return L;
    let W = -1;
    for (const z of d(L)) {
      if (z.tagName === "head") {
        const H = z.tagEnd + 1;
        return `${L.slice(0, H)}${v}${L.slice(H)}`;
      }
      z.tagName === "body" && W < 0 && (W = z.tagEnd + 1);
    }
    return W >= 0 ? `${L.slice(0, W)}${v}${L.slice(W)}` : `${v}${L}`;
  }
  function m(N = "") {
    const M = String(N || "");
    if (!M) return M;
    let L = -1;
    for (const v of d(M)) {
      if (v.tagName !== "script" || !v.contentClosed) continue;
      if (v.attributes.get("id")?.value === "admin-tailwind-prelude") return M;
      if (L >= 0 || v.attributes.has("src")) continue;
      const W = M.slice(v.contentStart, v.contentEnd);
      /\btailwind\s*\.\s*config\s*=/i.test(W) && (L = v.start);
    }
    return L < 0 ? M : `${M.slice(0, L)}${r}${M.slice(L)}`;
  }
  function p(N = "", M = "{}") {
    const L = m(String(N || ""));
    if (!L) return L;
    const v = s(M);
    let W = null, z = null;
    for (const H of d(L)) {
      if (H.tagName !== "script" || !H.contentClosed) continue;
      const j = String(H.attributes.get("id")?.value || "").trim();
      j === "admin-bootstrap" && String(H.attributes.get("type")?.value || "").trim().toLowerCase() === "application/json" ? W = H : j === "admin-bootstrap-loader" && (z = H);
    }
    if (W && W.contentTagEnd >= W.tagEnd) {
      const H = L.slice(0, W.start), j = L.slice(W.contentTagEnd + 1);
      return `${H}${v}${z ? "" : t}${j}`;
    }
    return z ? `${L.slice(0, z.start)}${v}${L.slice(z.start)}` : f(L, a(M));
  }
  function g(N) {
    const M = String(N?.tagName || "").trim().toLowerCase();
    let L = "", v = "";
    if (M === "script" && N.attributes?.has("src"))
      L = "src", v = "script";
    else if (M === "link" && N.attributes?.has("href")) {
      const j = new Set(String(N.attributes.get("rel")?.value || "").trim().toLowerCase().split(/\s+/).filter(Boolean)), ne = String(N.attributes.get("as")?.value || "").trim().toLowerCase();
      j.has("stylesheet") ? v = "css" : j.has("modulepreload") ? v = "script" : (j.has("preload") || j.has("prefetch")) && ne === "style" ? v = "css" : (j.has("preload") || j.has("prefetch")) && ne === "script" && (v = "script"), v && (L = "href");
    }
    if (!L || !v) return null;
    const W = N.attributes.get(L), z = Number(W?.valueStart), H = Number(W?.valueEnd);
    return !Number.isInteger(z) || !Number.isInteger(H) || z < 0 || H < z ? null : {
      rawValue: String(W?.value || ""),
      assetKind: v,
      valueStart: z,
      valueEnd: H
    };
  }
  function h(N = "") {
    const M = [];
    for (const L of d(N)) {
      const v = g(L);
      v && M.push(v);
    }
    return M;
  }
  function y(N = "") {
    for (const M of d(N))
      if (M.tagName === "script" && String(M.attributes.get("type")?.value || "").trim().toLowerCase() === "importmap")
        return !0;
    return !1;
  }
  function S(N = "", M = "") {
    const L = String(N || "");
    if (!L) return [];
    let v = null;
    try {
      v = new URL(String(M || "").trim());
    } catch {
      v = null;
    }
    const W = [];
    for (const z of h(L)) {
      const H = String(z.rawValue || "").trim();
      if (!(!H || /^data:/i.test(H) || /^javascript:/i.test(H)))
        try {
          const j = v ? new URL(H, v).toString() : new URL(H).toString();
          W.push({
            rawValue: H,
            normalizedUrl: j,
            assetKind: z.assetKind
          });
        } catch {
          continue;
        }
    }
    return W.filter((z, H, j) => j.findIndex((ne) => ne.normalizedUrl === z.normalizedUrl) === H);
  }
  function _(N = "", M = "") {
    return S(N, M).map((L) => L.normalizedUrl);
  }
  function A(N = "") {
    return String(N || "").replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  }
  function b(N = "", M = "") {
    const L = String(N || "").trim(), v = String(M || "").trim().toLowerCase() === "css" ? "css" : "js";
    return L ? `${ce(L)}.${v}` : "";
  }
  function R(N = "/admin", M = "", L = "") {
    const v = Q(N || "/admin").replace(/\/+$/, "") || "/admin", W = ct(M), z = String(L || "").trim();
    return !W || !z ? "" : `${v}/${e.ADMIN_RELEASE_PROXY_PATH_SEGMENT}/${encodeURIComponent(W)}/${e.ADMIN_RELEASE_VENDOR_PATH_SEGMENT}/${encodeURIComponent(z)}`;
  }
  function E(N = "", M = {}) {
    const L = S(N, M.baseUrl || M.sourceUrl || "").map((v) => ({
      assetKey: b(v.normalizedUrl, v.assetKind),
      assetKind: v.assetKind,
      upstreamUrl: v.normalizedUrl
    })).filter((v) => v.assetKey && v.upstreamUrl).filter((v, W, z) => z.findIndex((H) => H.assetKey === v.assetKey) === W);
    return {
      version: 1,
      releaseTag: ct(M.releaseTag),
      sourceUrl: Nr(M.sourceUrl || M.baseUrl || ""),
      entries: L
    };
  }
  function D(N = "", M = {}, L = {}) {
    const v = String(N || "");
    if (!v) return v;
    const W = String(L.adminPath || "/admin").trim() || "/admin", z = ct(L.releaseTag), H = new Map((Array.isArray(M?.entries) ? M.entries : []).map((me) => [String(me?.upstreamUrl || "").trim(), String(me?.assetKey || "").trim()]));
    if (!z || H.size === 0) return v;
    let j = null;
    try {
      j = new URL(String(L.baseUrl || L.sourceUrl || "").trim());
    } catch {
      j = null;
    }
    const ne = [];
    for (const me of h(v)) {
      const le = String(me.rawValue || "").trim();
      if (!(!le || /^data:/i.test(le) || /^javascript:/i.test(le)))
        try {
          const pe = j ? new URL(le, j).toString() : new URL(le).toString(), Pe = H.get(pe), $e = R(W, z, Pe);
          if (!Pe || !$e) continue;
          ne.push({
            start: me.valueStart,
            end: me.valueEnd,
            value: $e
          });
        } catch {
          continue;
        }
    }
    let fe = v;
    for (const me of ne.sort((le, pe) => pe.start - le.start)) fe = `${fe.slice(0, me.start)}${me.value}${fe.slice(me.end)}`;
    return fe;
  }
  function w(N = {}) {
    const M = F(N) ? N : {};
    return {
      version: Number(M.version) || 1,
      releaseTag: ct(M.releaseTag),
      sourceUrl: Nr(M.sourceUrl),
      entries: (Array.isArray(M.entries) ? M.entries : []).map((L) => ({
        assetKey: String(L?.assetKey || "").trim(),
        assetKind: String(L?.assetKind || "").trim().toLowerCase() === "css" ? "css" : "script",
        upstreamUrl: Nr(L?.upstreamUrl)
      })).filter((L) => L.assetKey && L.upstreamUrl)
    };
  }
  function C(N = "") {
    let M = null;
    try {
      M = new URL(String(N || "").trim());
    } catch {
      return !1;
    }
    const L = M.hostname.replace(/\.+$/, "");
    if (!/(^|\.)jsdelivr\.net$/i.test(L) || !/^\/gh\/[^/]+\/[^/]+\//i.test(M.pathname)) return !1;
    const v = M.pathname.match(/^\/gh\/[^/]+\/[^@/]+@([^/]+)\//i);
    if (!v) return !0;
    const W = decodeURIComponent(String(v[1] || "").trim());
    return W ? !(/^[0-9a-f]{7,40}$/i.test(W) || /^v?\d+\.\d+\.\d+(?:[-+][0-9A-Za-z.-]+)?$/i.test(W)) : !0;
  }
  function T(N = "") {
    const M = String(N || ""), L = [], v = (z = "") => /[A-Za-z0-9_$]/.test(z), W = (z) => {
      let H = z;
      for (; H < M.length; ) {
        if (/\s/.test(M[H])) {
          H += 1;
          continue;
        }
        if (M.startsWith("//", H)) {
          const j = M.indexOf(`
`, H + 2);
          H = j < 0 ? M.length : j + 1;
          continue;
        }
        if (M.startsWith("/*", H)) {
          const j = M.indexOf("*/", H + 2);
          H = j < 0 ? M.length : j + 2;
          continue;
        }
        break;
      }
      return H;
    };
    for (let z = 0; z < M.length; ) {
      if (M.startsWith("import", z) && !v(M[z - 1]) && !v(M[z + 6])) {
        let H = z - 1;
        for (; H >= 0 && /\s/.test(M[H]); ) H -= 1;
        const j = W(z + 6);
        M[H] !== "." && M[j] === "(" && L.push({
          index: z,
          reference: M.slice(z, j + 1)
        });
      }
      z += 1;
    }
    return L;
  }
  function I(N = "") {
    const M = String(N || "");
    for (const L of d(M)) {
      if (L.tagName !== "script" || !L.contentClosed || L.attributes.get("src")?.value) continue;
      const v = String(L.attributes.get("type")?.value || "").trim().toLowerCase().split(";")[0];
      if (!(v && ![
        "module",
        "text/javascript",
        "application/javascript",
        "text/ecmascript",
        "application/ecmascript"
      ].includes(v)) && T(M.slice(L.contentStart, L.contentEnd)).length > 0)
        return !0;
    }
    return !1;
  }
  function P(N = "", M = "") {
    const L = S(N, M), v = [];
    y(N) && v.push("远端 index.html 不允许 importmap；所有运行时依赖必须通过显式 script/link 标签交付"), I(N) && v.push("index.html 不允许 inline 动态 import()；所有运行时依赖必须通过显式 script/link 标签交付");
    for (const W of L) {
      const z = String(W?.rawValue || "").trim(), H = String(W?.normalizedUrl || "").trim();
      let j = "", ne = "";
      try {
        const fe = new URL(H);
        j = fe.hostname.replace(/\.+$/, "").toLowerCase(), ne = fe.pathname;
      } catch {
      }
      if (!/^(?:https?:)?\/\//i.test(z)) {
        v.push(`远端 index.html 不允许相对或本地 bundle 资源：${z}`);
        continue;
      }
      if (j === "esm.sh" || j.endsWith(".esm.sh")) {
        v.push(`esm.sh 资产不再允许：${H}`);
        continue;
      }
      if (j === "raw.githubusercontent.com") {
        v.push(`raw.githubusercontent.com 资产不再允许：${H}`);
        continue;
      }
      if (j === "github.com" && /^\/[^/]+\/[^/]+\/releases\/download\//i.test(ne)) {
        v.push(`浏览器直连 GitHub Release 资产不再允许：${H}`);
        continue;
      }
    }
    return v;
  }
  function U(N = "") {
    for (const M of d(N)) {
      if (o.has(M.tagName)) continue;
      const L = M.attributes.get("id");
      if (L?.quoted && L.value === "app") return !0;
    }
    return !1;
  }
  function K(N = "") {
    const M = String(N || "").trim();
    return M ? /<!doctype\s+html\b/i.test(M) || /<html\b/i.test(M) : !1;
  }
  function G(N = "", M = !1) {
    const L = String(N || "").trim().toLowerCase();
    return !L || L.includes("text/html") || L.includes("application/xhtml+xml") ? !0 : M ? L.startsWith("text/plain") || L.startsWith("application/octet-stream") : !1;
  }
  function x(N = {}) {
    const M = F(N.bootstrap) ? N.bootstrap : {}, L = F(N.initHealth) ? N.initHealth : F(M.initHealth) ? M.initHealth : {};
    return `admin-remote-shell-${ce(se({
      templateRevision: "admin-remote-shell",
      sourceHash: ce(String(N.sourceUrl || "").trim()),
      originEtag: e.normalizeEtagToken(N.originEtag || ""),
      originLastModified: e.normalizeAdminHttpDateHeader(N.originLastModified || ""),
      htmlHash: ce(String(N.html || "")),
      variantSeed: e.buildAdminHtmlVariantEtag(M, L, "remote-admin-shell")
    }))}`;
  }
  return {
    buildAdminRemoteBootstrapMarkup: a,
    ADMIN_REMOTE_BOOTSTRAP_LOADER_HTML: t,
    ADMIN_REMOTE_TAILWIND_PRELUDE_HTML: r,
    ADMIN_HTML_SKIPPED_CONTENT_TAGS: o,
    buildAdminRemoteBootstrapScriptMarkup: s,
    isAdminHtmlSpace: i,
    findAdminHtmlTagEnd: c,
    parseAdminHtmlOpeningTag: l,
    findAdminHtmlClosingTag: u,
    iterateAdminHtmlOpeningTags: d,
    injectMarkupIntoHtmlDocument: f,
    ensureAdminRemoteTailwindConfigGlobal: m,
    applyAdminRemoteBootstrapMarkup: p,
    getAdminRemoteShellAssetReference: g,
    collectAdminRemoteShellAssetReferences: h,
    hasAdminRemoteShellImportMap: y,
    extractAdminRemoteShellAssetDescriptors: S,
    extractAdminRemoteShellAssetUrls: _,
    escapeRegexForRoute: A,
    buildAdminReleaseVendorAssetKey: b,
    buildAdminReleaseVendorProxyPath: R,
    buildAdminReleaseVendorManifest: E,
    rewriteAdminRemoteShellAssetUrlsToProxy: D,
    normalizeAdminReleaseVendorManifestRecord: w,
    isMutableJsdelivrGithubAssetUrl: C,
    collectAdminInlineDynamicImports: T,
    hasAdminRemoteShellInlineDynamicImport: I,
    getAdminRemoteShellAssetPolicyViolations: P,
    hasAdminRemoteShellAppRoot: U,
    hasAdminRemoteShellHtmlDocument: K,
    isAcceptedAdminHtmlDocumentContentType: G,
    buildAdminRemoteShellVariantEtag: x
  };
}
function Oe(n, e) {
  return fetch(n, e);
}
function mi(n = {}) {
  const e = {};
  if (!n || typeof n != "object" || Array.isArray(n)) return e;
  for (const [a, t] of Object.entries(n)) {
    const r = String(a || "").trim().toLowerCase();
    !r || e[r] !== void 0 || (e[r] = t);
  }
  return e;
}
function Go(n = {}, e = []) {
  const a = mi(n);
  for (const t of Array.isArray(e) ? e : [e]) {
    const r = String(t || "").trim().toLowerCase();
    if (!r) continue;
    const o = a[r];
    if (!(o == null || o === ""))
      return o;
  }
  return "";
}
function et(n = []) {
  return (Array.isArray(n) ? n : [n]).map((e) => String(e ?? "").trim()).filter(Boolean).join(":");
}
async function kt(n, e) {
  return await cn(oe.SingleFlightTasks, n, e);
}
async function cn(n, e, a) {
  const t = String(e || "").trim();
  if (!t) return await a();
  const r = n.get(t);
  if (r) return await r;
  const o = Promise.resolve().then(() => a()).finally(() => {
    n.get(t) === o && n.delete(t);
  });
  return n.set(t, o), await o;
}
function _o(n) {
  return String(n?.__CONFIG_CACHE_NAMESPACE || n?.__WORKER_CACHE_SCOPE || "default").trim() || "default";
}
function ln(n) {
  return va.get(Ra(n), _o(n));
}
function jo(n) {
  return ln(n).ConfigCache?.data || null;
}
function za(n) {
  if (arguments.length === 0) {
    va.reset();
    return;
  }
  const e = ln(n);
  e.RuntimeConfigCacheGeneration += 1, e.ConfigCache = null;
}
function bu(n, e) {
  const a = ln(n);
  a.RuntimeConfigCacheGeneration += 1, a.ConfigCache = {
    data: e,
    exp: Date.now() + O.Defaults.CacheTTL,
    namespace: _o(n)
  };
}
async function Un(n, e) {
  const a = String(n), t = (oe.AdminRemoteShellCacheMutationChains.get(a) || Promise.resolve()).catch(() => null).then(() => e()).finally(() => {
    oe.AdminRemoteShellCacheMutationChains.get(a) === t && oe.AdminRemoteShellCacheMutationChains.delete(a);
  });
  return oe.AdminRemoteShellCacheMutationChains.set(a, t), await t;
}
function Ru(n = {}, e = {}) {
  function a(w = "", C = {}) {
    const T = e.buildAdminHtmlResponseHeaders(C.variantEtag || "", e.ADMIN_REMOTE_SHELL_EDGE_CACHE_CONTROL), I = Number.parseInt(String(C.cachedAt || ""), 10);
    T.set(e.ADMIN_REMOTE_SHELL_CACHED_AT_HEADER, String(Number.isFinite(I) && I > 0 ? I : k()));
    const P = e.normalizeEtagToken(C.originEtag || "");
    P && T.set(e.ADMIN_REMOTE_SHELL_SOURCE_ETAG_HEADER, P);
    const U = e.normalizeAdminHttpDateHeader(C.originLastModified || "");
    U && T.set(e.ADMIN_REMOTE_SHELL_SOURCE_LAST_MODIFIED_HEADER, U);
    const K = ce(String(C.sourceUrl || "").trim());
    K && T.set(e.ADMIN_REMOTE_SHELL_SOURCE_HASH_HEADER, K);
    const G = Et(C.shellRevision || je(C.sourceUrl));
    return G && T.set("X-Admin-Shell-Revision", G), new Response(String(w || ""), {
      status: 200,
      headers: T
    });
  }
  async function t(w, C, T, I) {
    const P = await xe(w, e.ADMIN_REMOTE_SHELL_MAX_BYTES);
    if (P.exceeded) throw new Error("legacy remote admin shell too large");
    const U = P.text, K = e.applyAdminRemoteBootstrapMarkup(U, Br(T)), G = w.headers.get(e.ADMIN_REMOTE_SHELL_SOURCE_ETAG_HEADER) || "", x = e.normalizeAdminHttpDateHeader(w.headers.get(e.ADMIN_REMOTE_SHELL_SOURCE_LAST_MODIFIED_HEADER) || ""), N = e.normalizeAdminHttpDateHeader(w.headers.get("Last-Modified") || "") || x;
    return a(K, {
      variantEtag: e.buildAdminRemoteShellVariantEtag({
        html: K,
        bootstrap: T,
        initHealth: I,
        sourceUrl: C,
        originEtag: G,
        originLastModified: x || N
      }),
      lastModified: N,
      originEtag: G,
      originLastModified: x || N,
      sourceUrl: C,
      cachedAt: y(w)
    });
  }
  function r(w, C = "GET") {
    if (!w) return new Response("Remote admin shell unavailable", { status: 502 });
    const T = new Headers(w.headers || {});
    return T.set("Content-Type", "text/html;charset=UTF-8"), T.set("Cache-Control", e.ADMIN_REMOTE_SHELL_BROWSER_CACHE_CONTROL), T.delete(e.ADMIN_REMOTE_SHELL_CACHED_AT_HEADER), T.delete(e.ADMIN_REMOTE_SHELL_SOURCE_ETAG_HEADER), T.delete(e.ADMIN_REMOTE_SHELL_SOURCE_LAST_MODIFIED_HEADER), T.delete(e.ADMIN_REMOTE_SHELL_SOURCE_HASH_HEADER), Ce(T), new Response(C === "HEAD" ? null : w.body, {
      status: w.status,
      statusText: w.statusText,
      headers: T
    });
  }
  function o(w = "", C = "") {
    const T = new URL(`/${encodeURIComponent(ct(w) || "release")}`, e.ADMIN_RELEASE_VENDOR_MANIFEST_CACHE_KEY_ORIGIN);
    return T.searchParams.set("source", ce(String(C || "").trim())), new Request(T.toString(), { method: "GET" });
  }
  function s(w = "", C = "", T = "") {
    const I = new URL(`/${encodeURIComponent(ct(w) || "release")}/${encodeURIComponent(String(C || "").trim())}`, e.ADMIN_RELEASE_VENDOR_CACHE_KEY_ORIGIN);
    return I.searchParams.set("source", ce(String(T || "").trim())), new Request(I.toString(), { method: "GET" });
  }
  function i(w = {}, C = "") {
    const T = new Headers({
      "Content-Type": "application/json;charset=UTF-8",
      "Cache-Control": e.ADMIN_REMOTE_SHELL_EDGE_CACHE_CONTROL
    }), I = String(C || w?.sourceUrl || "").trim();
    return T.set(e.ADMIN_RELEASE_VENDOR_CACHED_AT_HEADER, String(k())), I && T.set(e.ADMIN_RELEASE_VENDOR_SOURCE_HASH_HEADER, ce(I)), new Response(JSON.stringify(w), {
      status: 200,
      headers: T
    });
  }
  function c(w = "", C = "script") {
    const T = String(w || "").trim().toLowerCase(), I = String(C || "").trim().toLowerCase() === "css" ? "css" : "script";
    return T ? I === "css" ? T.includes("text/css") || T.includes("application/css") || T.startsWith("text/plain") : T.includes("javascript") || T.includes("ecmascript") || T.startsWith("text/plain") || T.startsWith("application/octet-stream") : !0;
  }
  function l(w, C = "GET") {
    const T = new Headers(w.headers);
    return T.set("Cache-Control", String(w.headers.get("Cache-Control") || e.ADMIN_RELEASE_VENDOR_CACHE_CONTROL).trim() || e.ADMIN_RELEASE_VENDOR_CACHE_CONTROL), T.delete(e.ADMIN_RELEASE_VENDOR_CACHED_AT_HEADER), T.delete(e.ADMIN_RELEASE_VENDOR_SOURCE_HASH_HEADER), Ce(T), new Response(C === "HEAD" ? null : w.body, {
      status: w.status,
      statusText: w.statusText,
      headers: T
    });
  }
  async function u(w, C = "", T = "") {
    if (!w || typeof w.match != "function") return null;
    const I = await w.match(o(C, T));
    if (!I) return null;
    try {
      const P = await xe(I, ii);
      return P.exceeded ? null : e.normalizeAdminReleaseVendorManifestRecord(JSON.parse(P.text));
    } catch {
      return null;
    }
  }
  async function d(w = "", C = "") {
    const T = ct(w), I = Nr(C);
    if (!T || !I) return null;
    const P = await Oe(I, { method: "GET" });
    if (!P.ok) throw new Error(`release index fetch failed: HTTP ${P.status}`);
    const U = String(P.headers.get("Content-Type") || "").trim().toLowerCase(), K = Number.parseInt(String(P.headers.get("Content-Length") || ""), 10);
    if (Number.isFinite(K) && K > e.ADMIN_REMOTE_SHELL_MAX_BYTES) throw new Error(`release index too large: ${K} bytes`);
    const G = await xe(P, e.ADMIN_REMOTE_SHELL_MAX_BYTES), x = G.text, N = G.bytes;
    if (G.exceeded || !x || N > e.ADMIN_REMOTE_SHELL_MAX_BYTES) throw new Error(`release index payload invalid: ${N} bytes`);
    const M = e.hasAdminRemoteShellHtmlDocument(x);
    if (!e.isAcceptedAdminHtmlDocumentContentType(U, M)) throw new Error(`release index content-type invalid: ${U}`);
    if (!M) throw new Error("release index payload invalid: html document expected");
    if (!e.hasAdminRemoteShellAppRoot(x)) throw new Error("release index missing #app root");
    const L = e.getAdminRemoteShellAssetPolicyViolations(x, I);
    if (L.length > 0) throw new Error(`release index asset policy invalid: ${L.slice(0, 3).join(" | ")}`);
    return e.normalizeAdminReleaseVendorManifestRecord(e.buildAdminReleaseVendorManifest(x, {
      releaseTag: T,
      sourceUrl: I
    }));
  }
  async function f(w, C = {}, T = null) {
    const I = e.normalizeAdminReleaseVendorManifestRecord(C);
    if (!w || typeof w.put != "function" || !I.releaseTag || !I.sourceUrl) return I;
    const P = ge(w.put(o(I.releaseTag, I.sourceUrl), i(I, I.sourceUrl)), "admin.release_vendor_manifest_cache_write", { releaseTag: I.releaseTag }, null);
    return T && typeof T.waitUntil == "function" ? T.waitUntil(P) : await P, I;
  }
  async function m(w, C = "", T = "", I = null) {
    const P = await u(w, C, T);
    if (P?.entries?.length) return P;
    const U = await d(C, T);
    return U ? (await f(w, U, I), U) : null;
  }
  function p(w = {}, C = "") {
    const T = String(C || "").trim();
    return T && (Array.isArray(w?.entries) ? w.entries : []).find((I) => String(I?.assetKey || "").trim() === T) || null;
  }
  function g(w = "", C = "/admin") {
    const T = Q(C || "/admin").replace(/\/+$/, "") || "/admin", I = Q(w || "/"), P = new RegExp(`^${e.escapeRegexForRoute(T)}/${e.ADMIN_RELEASE_PROXY_PATH_SEGMENT}/([^/]+)/${e.ADMIN_RELEASE_VENDOR_PATH_SEGMENT}/([^/]+)/*$`, "i"), U = I.match(P);
    if (!U) return null;
    try {
      return {
        releaseTag: ct(decodeURIComponent(String(U[1] || ""))),
        assetKey: String(decodeURIComponent(String(U[2] || "")) || "").trim()
      };
    } catch {
      return null;
    }
  }
  function h(w = "", C = "/admin") {
    const T = Q(C || "/admin").replace(/\/+$/, "") || "/admin";
    return (Q(w || "/").replace(/\/+$/, "") || "/").toLowerCase() === `${T}/${e.ADMIN_WARM_PATH_SEGMENT}`.toLowerCase();
  }
  function y(w) {
    const C = Number.parseInt(String(w?.headers?.get?.(e.ADMIN_REMOTE_SHELL_CACHED_AT_HEADER) || ""), 10);
    return Number.isFinite(C) && C > 0 ? C : 0;
  }
  function S(w) {
    const C = y(w);
    return C ? k() - C >= e.ADMIN_REMOTE_SHELL_REVALIDATE_MS : !0;
  }
  function _(w = "", C = "", T = {}) {
    const I = String(w || ""), P = String(T.sourceLabel || "admin shell").trim() || "admin shell", U = String(T.contentType || "").trim().toLowerCase(), K = new TextEncoder().encode(I).length;
    if (!I || K > e.ADMIN_REMOTE_SHELL_MAX_BYTES) throw new Error(`${P} payload invalid: ${K} bytes`);
    const G = e.hasAdminRemoteShellHtmlDocument(I);
    if (!e.isAcceptedAdminHtmlDocumentContentType(U, G)) throw new Error(`${P} content-type invalid: ${U}`);
    if (!G) throw new Error(`${P} payload invalid: html document expected`);
    if (!e.hasAdminRemoteShellAppRoot(I)) throw new Error(`${P} missing #app root`);
    const x = e.getAdminRemoteShellAssetPolicyViolations(I, C);
    if (x.length > 0) throw new Error(`${P} asset policy invalid: ${x.slice(0, 3).join(" | ")}`);
    return {
      html: I,
      bytes: K
    };
  }
  function A(w = "", C = {}, T = {}, I = "", P = {}) {
    const U = _(w, I, P), K = ct(P.assetRevision || P.releaseTag), G = K ? e.normalizeAdminReleaseVendorManifestRecord(e.buildAdminReleaseVendorManifest(U.html, {
      releaseTag: K,
      sourceUrl: I
    })) : null, x = G?.entries?.length ? e.rewriteAdminRemoteShellAssetUrlsToProxy(U.html, G, {
      adminPath: String(P.adminPath || C?.adminPath || "/admin").trim() || "/admin",
      releaseTag: K,
      sourceUrl: I
    }) : U.html, N = e.applyAdminRemoteBootstrapMarkup(x, Br(C)), M = e.normalizeAdminHttpDateHeader(P.lastModified || "") || (/* @__PURE__ */ new Date()).toUTCString(), L = String(P.originEtag || "").trim();
    return {
      storedResponse: a(N, {
        variantEtag: e.buildAdminRemoteShellVariantEtag({
          html: N,
          bootstrap: C,
          initHealth: T,
          sourceUrl: I,
          originEtag: L,
          originLastModified: M
        }),
        lastModified: M,
        originEtag: L,
        originLastModified: M,
        sourceUrl: I,
        shellRevision: je(I)
      }),
      vendorManifest: G
    };
  }
  async function b(w = "", C = "index.html") {
    const T = String(w || ""), I = await Ln(T), P = Kr(I);
    let U;
    try {
      U = _(T, P, {
        sourceLabel: "local admin index",
        contentType: "text/html"
      });
    } catch (x) {
      throw x && typeof x == "object" && (x.code = String(x.code || "ADMIN_INDEX_UPLOAD_INVALID"), x.status = De(x.status, 400)), x;
    }
    const K = go(I), G = e.normalizeAdminReleaseVendorManifestRecord(e.buildAdminReleaseVendorManifest(U.html, {
      releaseTag: K,
      sourceUrl: P
    }));
    return {
      version: 1,
      revision: I,
      assetRevision: K,
      sourceUrl: P,
      fileName: (String(C || "index.html").trim().replace(/^.*[\\/]/, "") || "index.html").slice(0, 180),
      uploadedAt: (/* @__PURE__ */ new Date()).toISOString(),
      bytes: U.bytes,
      html: U.html,
      manifest: G
    };
  }
  async function R(w, C, T, I = null, P = {}) {
    if (je(w)) {
      const H = typeof P.loadLocalIndexRecord == "function" ? await P.loadLocalIndexRecord() : null;
      if (!H?.html) throw new Error("local admin index upload is missing");
      return A(H.html, C, T, w, {
        sourceLabel: "local admin index",
        contentType: "text/html",
        adminPath: P.adminPath,
        assetRevision: P.assetRevision || H.assetRevision,
        lastModified: H.uploadedAt
      });
    }
    const U = new Headers(), K = e.normalizeEtagToken(I?.headers?.get?.(e.ADMIN_REMOTE_SHELL_SOURCE_ETAG_HEADER) || ""), G = e.normalizeAdminHttpDateHeader(I?.headers?.get?.(e.ADMIN_REMOTE_SHELL_SOURCE_LAST_MODIFIED_HEADER) || "");
    K && U.set("If-None-Match", K), G && U.set("If-Modified-Since", G);
    const x = await Oe(w, {
      method: "GET",
      headers: U
    });
    if (x.status === 304 && I) {
      const H = await xe(I, e.ADMIN_REMOTE_SHELL_MAX_BYTES);
      if (H.exceeded) throw new Error("cached remote admin shell too large");
      const j = H.text;
      return {
        storedResponse: a(j, {
          variantEtag: e.normalizeEtagToken(I.headers.get("ETag") || ""),
          lastModified: e.normalizeAdminHttpDateHeader(I.headers.get("Last-Modified") || ""),
          originEtag: K,
          originLastModified: G,
          sourceUrl: w
        }),
        vendorManifest: null
      };
    }
    if (!x.ok) throw new Error(`remote admin shell fetch failed: HTTP ${x.status}`);
    const N = String(x.headers.get("Content-Type") || "").trim().toLowerCase(), M = Number.parseInt(String(x.headers.get("Content-Length") || ""), 10);
    if (Number.isFinite(M) && M > e.ADMIN_REMOTE_SHELL_MAX_BYTES) throw new Error(`remote admin shell too large: ${M} bytes`);
    const L = await xe(x, e.ADMIN_REMOTE_SHELL_MAX_BYTES), v = L.text, W = L.bytes;
    if (L.exceeded || !v || W > e.ADMIN_REMOTE_SHELL_MAX_BYTES) throw new Error(`remote admin shell payload invalid: ${W} bytes`);
    const z = e.normalizeAdminHttpDateHeader(x.headers.get("Last-Modified") || "") || (/* @__PURE__ */ new Date()).toUTCString();
    return A(v, C, T, w, {
      sourceLabel: "remote admin shell",
      contentType: N,
      adminPath: P.adminPath,
      assetRevision: P.assetRevision || P.releaseTag,
      lastModified: z,
      originEtag: x.headers.get("ETag") || ""
    });
  }
  async function E(w, C, T, I, P, U, K, G = {}, x = null) {
    if (!C || typeof C.put != "function") return null;
    const N = await R(I, P, U, K, G), M = N?.storedResponse || null;
    return M ? (await C.put(T, M.clone()), N?.vendorManifest?.entries?.length && await f(C, N.vendorManifest, x), M) : null;
  }
  async function D(w, C, T, I, P, U = {}) {
    return kt(et(["admin_remote_shell_cold_load", C.url]), () => Un(C.url, async () => {
      if (w && typeof w.match == "function") {
        const x = await w.match(C);
        if (x) return {
          storedResponse: x,
          vendorManifest: null,
          loadedFromCache: !0
        };
      }
      const K = await R(T, I, P, null, U), G = K?.storedResponse || null;
      return G ? (w && typeof w.put == "function" && (await w.put(C, G.clone()), K?.vendorManifest?.entries?.length && await f(w, K.vendorManifest, null)), {
        ...K,
        loadedFromCache: !1
      }) : K;
    }));
  }
  return {
    buildAdminRemoteShellStoredResponse: a,
    migrateLegacyAdminRemoteShellStoredResponse: t,
    buildAdminRemoteShellClientResponse: r,
    buildAdminReleaseVendorManifestCacheKeyRequest: o,
    buildAdminReleaseVendorAssetCacheKeyRequest: s,
    buildAdminReleaseVendorManifestResponse: i,
    isAcceptedAdminReleaseVendorContentType: c,
    buildAdminReleaseVendorClientResponse: l,
    readAdminReleaseVendorManifestFromCache: u,
    buildAdminReleaseVendorManifestFromSource: d,
    cacheAdminReleaseVendorManifest: f,
    getOrCreateAdminReleaseVendorManifest: m,
    resolveAdminReleaseVendorManifestEntry: p,
    resolveAdminReleaseVendorRouteMatch: g,
    isAdminWarmRoute: h,
    getAdminRemoteShellCachedAt: y,
    shouldRevalidateAdminRemoteShell: S,
    validateAdminShellHtmlSource: _,
    buildAdminShellStoredPayloadFromHtml: A,
    buildAdminLocalIndexUploadRecord: b,
    fetchAdminRemoteShellStoredResponse: R,
    revalidateAdminRemoteShellCache: E,
    loadAdminRemoteShellColdCache: D
  };
}
function Eu(n = {}, e = {}) {
  const { indexRepository: a } = n;
  async function t(l, u, d, f = ze(u), m = {}, p = "index_url_not_configured") {
    const g = Tt(u, m), h = e.buildAdminShellState(u, f, m), y = e.buildAdminBootstrapPayload(u, f, m), S = Br(y), _ = Fn(f), A = new URL(l.url).pathname;
    await e.patchAdminShellRuntimeStatus(u, {
      shellState: h,
      initHealth: f,
      indexState: g,
      remoteShellIndexUrl: g.indexUrl,
      mode: "gate",
      sourceType: "setup_gate",
      routeState: "setup_gate",
      remoteCacheState: "bypassed",
      lastFetchStatus: "skipped",
      reason: p,
      requestPath: A
    }, d);
    const b = e.buildAdminIndexSetupContent(y, h, f, m, g), R = e.renderAdminHtmlShell(S, _, b);
    return new Response(l.method === "HEAD" ? null : R, { headers: e.buildAdminHtmlResponseHeaders("", "no-store, max-age=0") });
  }
  function r(l) {
    const u = String(new URL(l.url).searchParams.get("setup") || "").trim().toLowerCase();
    return u === "1" || u === "true";
  }
  async function o(l, u, d, f = ze(u), m = {}, p = {}) {
    const g = e.buildAdminShellState(u, f, p), h = e.buildAdminBootstrapPayload(u, f, p), y = Tt(u, p), S = Br(h), _ = Fn(f), A = new URL(l.url).pathname, b = {
      ...m,
      shellState: g,
      initHealth: f,
      indexState: y,
      remoteShellIndexUrl: m.remoteShellIndexUrl || g.remoteShellIndexUrl || y.indexUrl || "",
      mode: "remote_error",
      sourceType: m.sourceType || "remote_error",
      routeState: m.routeState || "remote_error",
      remoteCacheState: m.remoteCacheState || "bypassed",
      lastFetchStatus: m.lastFetchStatus || "failed",
      reason: m.reason || "remote_shell_render_failed",
      requestPath: A
    }, R = e.buildAdminRemoteShellErrorContent(h, g, f, b);
    await e.patchAdminShellRuntimeStatus(u, b, d);
    const E = e.renderAdminHtmlShell(S, _, R);
    return new Response(l.method === "HEAD" ? null : E, { headers: e.buildAdminHtmlResponseHeaders("", "no-store, max-age=0") });
  }
  async function s(l, u, d, f = ze(u), m = e.resolveAdminShellIndexUrl(u), p = {}) {
    const g = ir(), h = e.buildAdminShellState(u, f, p), y = e.buildAdminBootstrapPayload(u, f, p), S = Tt(u, p), _ = {
      releaseTag: S.assetRevision || S.releaseTag,
      assetRevision: S.assetRevision || S.releaseTag,
      adminPath: y.adminPath,
      ...S.isLocalUpload ? { loadLocalIndexRecord: () => a.getAdminIndexUploadRecord(a.getKV(u), S.localUploadRevision) } : {}
    }, A = e.buildAdminRemoteShellCacheKeyRequest(l, m, y), b = e.buildAdminRemoteShellLegacyCacheKeyRequest(l, m), R = new URL(l.url).pathname;
    if (g && typeof g.match == "function") {
      const C = await kt(et(["admin_remote_shell_cache_read", A.url]), async () => {
        const P = await g.match(A);
        if (P) return {
          storedResponse: P,
          legacyCacheMigrated: !1
        };
        const U = await g.match(b);
        if (!U) return null;
        const K = await ge(e.migrateLegacyAdminRemoteShellStoredResponse(U, m, y, f), "admin.remote_shell_legacy_cache_read", {
          path: R,
          remoteShellIndexUrl: m
        }, null);
        return K ? await Un(A.url, async () => {
          const G = await g.match(A);
          return G ? {
            storedResponse: G,
            legacyCacheMigrated: !1
          } : (typeof g.put == "function" && await ge(g.put(A, K.clone()), "admin.remote_shell_legacy_cache_migrate", {
            path: R,
            remoteShellIndexUrl: m
          }, null), {
            storedResponse: K,
            legacyCacheMigrated: !0
          });
        }) : null;
      }), T = C === null ? null : C.storedResponse.clone(), I = C !== null && C.legacyCacheMigrated;
      if (T) {
        const P = e.shouldRevalidateAdminRemoteShell(T);
        let U = null;
        if (P) {
          const x = T.clone();
          U = kt(et(["admin_remote_shell_revalidate", A.url]), async () => ge(Un(A.url, () => e.revalidateAdminRemoteShellCache(l, g, A, m, y, f, x, _, d)), "admin.remote_shell_revalidate", {
            path: R,
            remoteShellIndexUrl: m
          }, null));
        }
        const K = e.patchAdminShellRuntimeStatus(u, {
          shellState: h,
          initHealth: f,
          indexState: S,
          remoteShellIndexUrl: m,
          mode: "remote",
          sourceType: I ? "remote_legacy_cache" : "remote_cache",
          routeState: "remote_active",
          remoteCacheState: I ? P ? "legacy_stale_hit" : "legacy_hit" : P ? "stale_hit" : "hit",
          revalidateDue: P,
          lastFetchStatus: "cached",
          reason: I ? P ? "migrated_legacy_remote_shell_and_scheduled_revalidate" : "migrated_legacy_remote_shell" : P ? "served_cached_remote_shell_and_scheduled_revalidate" : "served_cached_remote_shell",
          requestPath: R,
          throttleStableWrites: !0
        }, null), G = U ? Promise.all([U, K]) : K;
        return d && typeof d.waitUntil == "function" && d.waitUntil(G), e.requestMatchesAdminHtmlResponse(l, T) ? e.buildConditionalNotModifiedResponseFromStoredResponse(T, e.ADMIN_REMOTE_SHELL_BROWSER_CACHE_CONTROL) : e.buildAdminRemoteShellClientResponse(T, l.method);
      }
    }
    const E = await e.loadAdminRemoteShellColdCache(g, A, m, y, f, _), D = (E?.storedResponse ? {
      ...E,
      storedResponse: E.storedResponse.clone()
    } : E)?.storedResponse || null;
    if (!D) throw new Error("remote admin shell payload missing");
    const w = kt(et(["admin_remote_shell_cold_status", A.url]), () => e.patchAdminShellRuntimeStatus(u, {
      shellState: h,
      initHealth: f,
      indexState: S,
      remoteShellIndexUrl: m,
      mode: "remote",
      sourceType: E?.loadedFromCache ? "remote_cache" : "remote_fetch",
      routeState: "remote_active",
      remoteCacheState: E?.loadedFromCache ? "filled_while_waiting" : "miss",
      lastFetchStatus: E?.loadedFromCache ? "cached" : "fetched",
      reason: E?.loadedFromCache ? "served_cache_filled_while_waiting" : "fetched_remote_shell_index",
      requestPath: R
    }, null));
    return d && typeof d.waitUntil == "function" ? d.waitUntil(w) : await w, e.requestMatchesAdminHtmlResponse(l, D) ? e.buildConditionalNotModifiedResponseFromStoredResponse(D, e.ADMIN_REMOTE_SHELL_BROWSER_CACHE_CONTROL) : e.buildAdminRemoteShellClientResponse(D, l.method);
  }
  function i(l = "Release vendor asset unavailable", u = 502) {
    const d = new Headers({
      "Content-Type": "text/plain;charset=UTF-8",
      "Cache-Control": "no-store, max-age=0"
    });
    return Ce(d), new Response(String(l || "Release vendor asset unavailable"), {
      status: u,
      headers: d
    });
  }
  async function c(l, u, d, f = null, m = {}) {
    const p = ct(f?.releaseTag), g = String(f?.assetKey || "").trim();
    if (!p || !g) return i("Release vendor asset not found", 404);
    const h = ir(), y = Gl(p);
    if (!y) return i("Local index vendor asset not found", 404);
    const S = y ? await a.getAdminIndexUploadRecord(a.getKV(u), y) : null;
    if (y && !S) return i("Local index vendor asset not found", 404);
    const _ = S?.sourceUrl || "";
    if (!_) return i("Release vendor asset not found", 404);
    let A = null;
    S?.manifest ? (A = await e.readAdminReleaseVendorManifestFromCache(h, p, _), A || (A = await e.cacheAdminReleaseVendorManifest(h, S.manifest, d))) : A = await e.getOrCreateAdminReleaseVendorManifest(h, p, _, d);
    const b = e.resolveAdminReleaseVendorManifestEntry(A, g);
    if (!b?.upstreamUrl) return i("Release vendor asset not found", 404);
    const R = e.isMutableJsdelivrGithubAssetUrl(b.upstreamUrl), E = R ? e.ADMIN_RELEASE_VENDOR_MUTABLE_CACHE_CONTROL : e.ADMIN_RELEASE_VENDOR_CACHE_CONTROL, D = e.buildAdminReleaseVendorAssetCacheKeyRequest(p, g, b.upstreamUrl);
    if (!R && h && typeof h.match == "function") {
      const N = await h.match(D);
      if (N)
        return e.requestMatchesAdminHtmlResponse(l, N) ? e.buildConditionalNotModifiedResponseFromStoredResponse(N, E) : e.buildAdminReleaseVendorClientResponse(N, l.method);
    }
    let w = null;
    try {
      w = await Oe(b.upstreamUrl, {
        method: "GET",
        headers: { Accept: b.assetKind === "css" ? "text/css, text/plain;q=0.9, */*;q=0.1" : "application/javascript, text/javascript, text/plain;q=0.9, */*;q=0.1" }
      });
    } catch (N) {
      return i(`Release vendor asset fetch failed: ${String(N?.message || N || "unknown_error").trim() || "unknown_error"}`, 502);
    }
    if (!w.ok) return i(w.status === 404 ? "Release vendor asset not found" : `Release vendor asset fetch failed (HTTP ${w.status})`, w.status === 404 ? 404 : 502);
    const C = String(w.headers.get("Content-Type") || "").trim();
    if (!e.isAcceptedAdminReleaseVendorContentType(C, b.assetKind)) return i(`Release vendor asset content-type invalid: ${C || "unknown"}`, 502);
    const T = Number.parseInt(String(w.headers.get("Content-Length") || ""), 10);
    if (Number.isFinite(T) && T > e.ADMIN_RELEASE_VENDOR_MAX_BYTES) return i(`Release vendor asset too large: ${T} bytes`, 502);
    const I = await Ns(w, e.ADMIN_RELEASE_VENDOR_MAX_BYTES), P = I.bytes;
    if (I.exceeded || !P || P > e.ADMIN_RELEASE_VENDOR_MAX_BYTES) return i(`Release vendor asset payload invalid: ${P} bytes`, 502);
    const U = new Headers({ "Cache-Control": E }), K = e.normalizeEtagToken(w.headers.get("ETag") || ""), G = e.normalizeAdminHttpDateHeader(w.headers.get("Last-Modified") || "");
    C && U.set("Content-Type", C), K && U.set("ETag", e.formatAdminHtmlEtag(K)), G && U.set("Last-Modified", G), U.set(e.ADMIN_RELEASE_VENDOR_CACHED_AT_HEADER, String(k())), U.set(e.ADMIN_RELEASE_VENDOR_SOURCE_HASH_HEADER, ce(b.upstreamUrl));
    const x = new Response(I.bodyBytes, {
      status: 200,
      headers: U
    });
    if (!R && h && typeof h.put == "function") {
      const N = ge(h.put(D, x.clone()), "admin.release_vendor_cache_write", {
        releaseTag: p,
        assetKey: g
      }, null);
      d && typeof d.waitUntil == "function" ? d.waitUntil(N) : await N;
    }
    return e.requestMatchesAdminHtmlResponse(l, x) ? e.buildConditionalNotModifiedResponseFromStoredResponse(x, E) : e.buildAdminReleaseVendorClientResponse(x, l.method);
  }
  return {
    renderAdminIndexSetupPage: t,
    isAdminIndexSetupForced: r,
    renderAdminRemoteShellErrorPage: o,
    renderRemoteAdminPage: s,
    buildAdminReleaseVendorErrorResponse: i,
    renderAdminReleaseVendorAsset: c
  };
}
function Au(n = {}) {
  return {
    ...vs,
    ...aa,
    "Content-Type": "application/json; charset=utf-8",
    "Cache-Control": "no-store, max-age=0",
    ...n
  };
}
function J(n, e = 200, a = {}) {
  return new Response(JSON.stringify(n), {
    status: e,
    headers: Au(a)
  });
}
function B(n, e, a = 400, t = null, r = {}) {
  const o = {
    ok: !1,
    error: {
      code: n,
      message: e
    }
  };
  return t != null && (o.error.details = t), J(o, a, r);
}
async function Cu(n) {
  const e = new Headers(n.headers || {});
  if (e.set("Content-Type", "application/json; charset=utf-8"), e.set("Cache-Control", "no-store, max-age=0"), Object.entries(aa).forEach(([c, l]) => e.set(c, l)), Ce(e), n.ok) return new Response(n.body, {
    status: n.status,
    headers: e
  });
  const a = await xe(n, en);
  let t = null;
  const r = a.text;
  try {
    t = JSON.parse(r);
  } catch {
  }
  const o = t?.error?.code || (typeof t?.error == "string" ? t.error.toUpperCase() : `HTTP_${n.status}`), s = t?.error?.message || t?.message || (typeof t?.error == "string" ? t.error : r || n.statusText || "request_failed"), i = t?.error?.details ?? t?.details ?? null;
  return B(o, s, n.status || 500, i);
}
function Lr(n = "") {
  return String(n || "").trim().toLowerCase() === "simplified" ? "simplified" : "legacy";
}
function pi(n = "") {
  const e = String(n || "").trim().toLowerCase();
  return e === "balanced" ? "balanced" : e === "aggressive" ? "aggressive" : "compat";
}
function bo(n = {}) {
  const e = n?.enableH2 === !0, a = n?.enableH3 === !0;
  return !e && !a ? "compat" : n?.peakDowngrade === !1 ? "aggressive" : "balanced";
}
var gi = Object.freeze([
  {
    kind: "summary",
    configKey: "tgDailyReportSummaryEnabled"
  },
  {
    kind: "kv",
    configKey: "tgDailyReportKvEnabled"
  },
  {
    kind: "d1",
    configKey: "tgDailyReportD1Enabled"
  }
]);
function hi(n = "") {
  const e = String(n || "").trim().toLowerCase();
  return e === "summary" || e === "kv" || e === "d1" ? e : "";
}
function Tu(n = []) {
  const e = [], a = /* @__PURE__ */ new Set();
  for (const t of Array.isArray(n) ? n : [n]) {
    const r = hi(t);
    !r || a.has(r) || (a.add(r), e.push(r));
  }
  return e;
}
function wu(n = {}) {
  return gi.some(({ configKey: e }) => sa(n, e));
}
function yi(n = {}, e = n) {
  const a = n && typeof n == "object" ? n : {}, t = e && typeof e == "object" ? e : {};
  return a.tgDailyReportEnabled === !0 && !wu(t);
}
function Du(n = {}, e = {}) {
  const a = n && typeof n == "object" ? n : {};
  return yi(a, e && typeof e == "object" ? e : {}) ? (a.tgDailyReportSummaryEnabled = !0, a.tgDailyReportKvEnabled = !1, a.tgDailyReportD1Enabled = !1, a) : (a.tgDailyReportSummaryEnabled = a.tgDailyReportSummaryEnabled === !0, a.tgDailyReportKvEnabled = a.tgDailyReportKvEnabled === !0, a.tgDailyReportD1Enabled = a.tgDailyReportD1Enabled === !0, a);
}
function Si(n = {}, e = n, a = {}) {
  const t = n && typeof n == "object" ? n : {}, r = Tu(a?.reportKinds);
  if (r.length > 0) return r;
  const o = gi.filter(({ configKey: s }) => t[s] === !0).map(({ kind: s }) => s);
  return o.length > 0 ? o : a?.fallbackAllWhenLegacy === !0 && yi(t, e) ? ["summary"] : [];
}
function Nu(n = {}) {
  return Lr(n?.routingDecisionMode);
}
function Mr(n = "") {
  const e = String(n || "").trim().toLowerCase();
  return e === "legacy" || e === "simplified" ? e : "inherit";
}
function Lu(n = {}, e = {}) {
  const a = Mr(n?.routingDecisionMode);
  return a === "inherit" ? Nu(e) : a;
}
function nr(n) {
  const e = String(n ?? "").trim();
  if (!e) return "";
  if (!/^\d{1,5}$/.test(e)) return null;
  const a = Number(e);
  return !Number.isInteger(a) || a < 1 || a > 65535 ? null : String(a);
}
function Mu(n) {
  return n === "http:" ? "80" : n === "https:" ? "443" : "";
}
function Iu(n) {
  const e = String(n?.username || ""), a = String(n?.password || "");
  return !e && !a ? "" : `${e}${a ? `:${a}` : ""}@`;
}
function Pu(n, e = "") {
  if (!(n instanceof URL)) return "";
  const a = String(n.protocol || "").trim().toLowerCase();
  if (!["http:", "https:"].includes(a)) return "";
  const t = nr(e);
  if (t === null) return "";
  const r = String(n.hostname || "").trim();
  if (!r) return "";
  const o = String(n.pathname || "/") || "/", s = String(n.search || ""), i = String(n.hash || "");
  return `${a}//${Iu(n)}${r}${t ? `:${t}` : ""}${o}${s}${i}`.replace(/\/$/, "");
}
function qo(n, e = "", a = "") {
  const t = String(n || "").trim();
  if (!t) return null;
  try {
    const r = new URL(t);
    if (!["http:", "https:"].includes(r.protocol)) return null;
    const o = nr(r.port), s = nr(e), i = nr(a);
    return o === null || s === null || i === null ? null : Pu(r, o || s || i || Mu(r.protocol)) || null;
  } catch {
    return null;
  }
}
function xu(n = "") {
  const e = String(n || "").trim();
  if (!e) return !1;
  try {
    const a = new URL(e);
    if (!["http:", "https:"].includes(a.protocol)) return !1;
    const t = e.match(/^[a-z][a-z0-9+.-]*:\/\/([^/?#]*)/i);
    if (!t) return !1;
    let r = String(t[1] || "");
    const o = r.lastIndexOf("@");
    if (o >= 0 && (r = r.slice(o + 1)), !r) return !1;
    if (r.startsWith("[")) {
      const s = r.indexOf("]");
      return s < 0 ? !1 : /^:\d+$/.test(r.slice(s + 1));
    }
    return /:\d+$/.test(r);
  } catch {
    return !1;
  }
}
function Xo(n = "") {
  const e = String(n || "").trim();
  if (!e) return !1;
  try {
    const a = new URL(e);
    return ["http:", "https:"].includes(a.protocol) ? !xu(e) : !1;
  } catch {
    return !1;
  }
}
function _e(n) {
  return JSON.stringify(String(n ?? ""));
}
var Ou = "/emby/system/info/public";
function Nt(n = "/") {
  const e = Q(n || "/");
  return e === "/" ? "" : e.replace(/\/+$/, "");
}
function un(n) {
  try {
    const e = n instanceof URL ? n : new URL(String(n || ""));
    if (!["http:", "https:"].includes(e.protocol)) return null;
    const a = String(e.origin || "").trim();
    if (!a) return null;
    const t = Nt(e.pathname);
    return {
      targetUrl: e,
      originText: a,
      normalizedBasePath: t,
      absoluteBasePrefix: `${a}${t}`
    };
  } catch {
    return null;
  }
}
function Ve(n) {
  return Je(n) ? String(n.absoluteBasePrefix || n.originText || "").trim() : "";
}
function vu(n = []) {
  return ce(se((Array.isArray(n) ? n : []).map((e) => Ve(e)).filter(Boolean)));
}
function Fu(n = []) {
  return new Set((Array.isArray(n) ? n : []).map((e) => Ve(e)).filter(Boolean)).size;
}
function ba(n = "", e = O.Defaults.HedgeProbePath) {
  const a = String(n || e || "").trim() || String(e || "/emby/system/ping").trim() || "/emby/system/ping";
  try {
    return Q(new URL(a, "https://hedge-probe.invalid").pathname || "/");
  } catch {
    return Q(a);
  }
}
function na(n = "") {
  const e = String(n || "").trim();
  return e ? ba(e, O.Defaults.HedgeProbePath) : "";
}
function Uu(n = "", e = Ou) {
  const a = String(n || e || "").trim() || String(e || "/emby/system/info/public").trim() || "/emby/system/info/public";
  try {
    return Q(new URL(a, "https://node-head-probe.invalid").pathname || "/");
  } catch {
    return Q(a);
  }
}
function Je(n) {
  return !!n && typeof n == "object" && n.targetUrl instanceof URL && typeof n.originText == "string" && typeof n.normalizedBasePath == "string" && typeof n.absoluteBasePrefix == "string";
}
function Yo(n = "") {
  const e = String(n || "");
  return e ? e.startsWith("?") ? e : `?${e}` : "";
}
function Hu(n = "GET", e = {}, a = {}) {
  const t = String(n || "GET").toUpperCase();
  return !(t !== "GET" && t !== "HEAD" || e?.isSegment !== !0 || e?.isWsUpgrade === !0 || a.playbackRelayTargetUrl instanceof URL || a.protocolFallbackRetry === !0 || a.isExternalRedirect === !0);
}
var dn = ["proxyMode", "mode"], fn = [
  "direct",
  "sourceDirect",
  "directSource",
  "direct2xx"
], _i = [
  "wangpanMode",
  "videoThrottling",
  "interceptMs"
], bi = "__playback-relay", Ri = "__pb_target", Hn = "__pb_abs", kn = Object.freeze({
  main: "",
  proxy_a: "__proxy-a",
  proxy_b: "__proxy-b"
});
[
  ...dn,
  ...fn,
  ..._i
];
function ku(n = {}) {
  const e = n && typeof n == "object" && !Array.isArray(n) ? n : {}, a = [];
  let t = !1;
  const r = nr(e.port), o = Array.isArray(e.lines) ? e.lines.reduce((i, c) => i + (nr(c?.port) ? 1 : 0), 0) : 0, s = Array.isArray(e.lines) && e.lines.length ? e.lines.reduce((i, c) => nr(c?.port) || r ? i : i + (Xo(c?.target) ? 1 : 0), 0) : r ? 0 : String(e.target || "").split(",").map((i) => i.trim()).filter(Boolean).reduce((i, c) => i + (Xo(c) ? 1 : 0), 0);
  for (const i of dn) {
    if (!Object.prototype.hasOwnProperty.call(e, i)) continue;
    a.push(i);
    const c = String(e[i] || "").trim().toLowerCase();
    [
      "direct",
      "source-direct",
      "origin-direct",
      "node-direct"
    ].includes(c) && (t = !0);
  }
  for (const i of fn)
    Object.prototype.hasOwnProperty.call(e, i) && (a.push(i), e[i] === !0 && (t = !0));
  for (const i of _i)
    Object.prototype.hasOwnProperty.call(e, i) && a.push(i);
  return {
    legacyKeysPresent: bt(a),
    shouldAddToSourceDirectNodes: t,
    topLevelPortPresent: r !== null && r !== "",
    linePortCount: o,
    defaultPortNodePresent: s > 0,
    defaultPortLineCount: s
  };
}
function Ku(n, e = {}) {
  const a = Fr(n);
  return {
    mode: a,
    forceVideoDirect: a === "direct",
    forceVideoProxy: a === "proxy"
  };
}
function zu(n = {}) {
  return Fs(n?.defaultMediaAuthMode);
}
function $a(n = {}) {
  return sa(n, "defaultPlaybackInfoMode") ? $t(n?.defaultPlaybackInfoMode) : Reflect.get(n, "playbackInfoAutoProxy") !== void 0 ? Reflect.get(n, "playbackInfoAutoProxy") !== !1 ? "rewrite" : "passthrough" : Reflect.get(n, "playbackInfoBlockWangpanProxy") !== void 0 ? "rewrite" : O.Defaults.DefaultPlaybackInfoMode;
}
function $u(n = {}) {
  return $t($a(n));
}
function Bu(n = {}) {
  return co(n?.defaultRealClientIpMode);
}
function Wu(n = {}, e = {}) {
  const a = n || {}, t = n && typeof n == "object" && Object.prototype.hasOwnProperty.call(n, "mediaAuthMode") ? er(a.mediaAuthMode) : "auto";
  return t === "inherit" ? zu(e) : t;
}
function Vu(n = {}, e = {}) {
  const a = n || {}, t = n && typeof n == "object" && Object.prototype.hasOwnProperty.call(n, "playbackInfoMode") ? Dr(a.playbackInfoMode) : "inherit";
  return t === "inherit" ? $u(e) : t;
}
function Gu(n = {}, e = {}) {
  const a = n || {}, t = n && typeof n == "object" && Object.prototype.hasOwnProperty.call(n, "realClientIpMode") ? wr(a.realClientIpMode) : "forward";
  return t === "inherit" ? Bu(e) : t;
}
function ju(n = {}, e = {}) {
  const a = n || {};
  return (n && typeof n == "object" && Object.prototype.hasOwnProperty.call(n, "hedgeProbePath") ? na(a.hedgeProbePath) : "") || ba(e?.hedgeProbePath, O.Defaults.HedgeProbePath);
}
function qu(n) {
  const e = co(typeof n == "string" ? n : n?.realClientIpMode);
  return e === "forward" ? "full" : e === "strip" ? "real-ip-only" : e === "disable" ? "none" : "full";
}
function Ei(n = "") {
  const e = String(n || "").trim().toLowerCase();
  return e === "proxy_a" || e === "__proxy-a" ? "proxy_a" : e === "proxy_b" || e === "__proxy-b" ? "proxy_b" : "main";
}
function Xu(n = "main") {
  return kn[Ei(n)] || "";
}
function Ai(n = "") {
  const e = String(n || "").trim().toLowerCase();
  return e ? e === kn.proxy_a ? "proxy_a" : e === kn.proxy_b ? "proxy_b" : "main" : "main";
}
function ta(n = "") {
  const e = String(n || "");
  if (!e) return {
    linkVariant: "main",
    remaining: "",
    needsTrailingSlashRedirect: !1
  };
  const a = e.startsWith("/") ? e : "/" + e, t = a.split("/"), r = Ai(wt(t[1] || ""));
  return r === "main" ? {
    linkVariant: r,
    remaining: Q(a),
    needsTrailingSlashRedirect: !1
  } : {
    linkVariant: r,
    remaining: Q("/" + t.slice(2).join("/")),
    needsTrailingSlashRedirect: t.length === 2 && !a.endsWith("/")
  };
}
function Ra(n = {}) {
  return n.ENI_KV || n.KV || n.EMBY_KV || n.EMBY_PROXY || null;
}
function Yu(n = {}) {
  return n.DB || n.D1 || n.PROXY_LOGS || null;
}
var Ju = 16 * 1024;
async function Jt(n, e) {
  const a = new TextEncoder(), t = Date.now();
  let r = oe.CryptoKeyCache.get(n);
  for ((!r || r.exp <= t) && (r = {
    key: await Mn().importKey("raw", a.encode(n), {
      name: "HMAC",
      hash: "SHA-256"
    }, !1, ["sign"]),
    exp: t + O.Defaults.CryptoKeyCacheTTL * 1e3
  }), oe.CryptoKeyCache.has(n) && oe.CryptoKeyCache.delete(n), oe.CryptoKeyCache.set(n, r); oe.CryptoKeyCache.size > O.Defaults.CryptoKeyCacheMax; ) {
    const s = oe.CryptoKeyCache.keys().next().value;
    if (s === void 0) break;
    oe.CryptoKeyCache.delete(s);
  }
  const o = await Mn().sign("HMAC", r.key, a.encode(e));
  return btoa(String.fromCharCode(...new Uint8Array(o))).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}
var Qu = class {
  constructor({ actionHandlers: n, bindingService: e, configReader: a, repository: t, requestModel: r, shellService: o }) {
    this.actionHandlers = Object.freeze({ ...n }), this.bindingService = e, this.configReader = a, this.repository = t, this.requestModel = r, this.shellService = o, this.actionAliases = Object.freeze({
      import: "saveOrImport",
      save: "saveOrImport"
    }), this.#e();
  }
  async handle(n, e, a) {
    const t = this.#u(n, e), { requestHost: r, configuredHost: o, configuredLegacyHost: s } = t, i = n.method, c = i === "GET" || i === "HEAD";
    if (c && t.pathnameLower === "/favicon.ico") return this.#_(i);
    const l = await this.configReader.getRuntimeConfig(e), u = !!(s && s !== o && r === s), d = l.enableHostPrefixProxy === !0 && !!o && !u, f = d ? mo(r, o) : null, m = !!(d && r !== o && r.endsWith(`.${o}`));
    if (f || m) return null;
    if (i === "GET" && t.normalizedPathname === "/") return this.#m(e, t.initHealth);
    const p = c ? this.#b(t.normalizedPathname, t.adminPath) : null;
    if (p)
      return await this.#r(n, e) ? this.#h(n, e, a, p, l) : this.#E("Unauthorized", 401);
    if (c && this.#R(t.normalizedPathname, t.adminPath))
      return await this.#r(n, e) ? this.#y(n, e, t.initHealth, l) : this.#S(n, t.adminLoginPath);
    if (c && Er(t.pathnameLower, t.adminLoginPathLower))
      return await this.#r(n, e) ? this.#S(n, t.adminPath) : this.#p(n, e, t.initHealth);
    if (c && Er(t.pathnameLower, t.adminPathLower))
      return await this.#r(n, e) ? this.#g(n, e, a, t.initHealth) : this.#S(n, t.adminLoginPath);
    if (i === "OPTIONS" && this.#s(t)) return this.#t(n, e, null);
    if (i === "POST" && (Er(t.pathnameLower, t.adminLoginPathLower) || this.#n(t))) return this.#i(n, e);
    if (i !== "POST" || !Er(t.pathnameLower, t.adminPathLower)) return null;
    if (!await this.#r(n, e)) return B("UNAUTHORIZED", "未授权", 401);
    try {
      return await Cu(await this.#o(n, e, a));
    } catch (g) {
      const h = nl(g, {
        code: "INTERNAL_ERROR",
        message: "Server Error",
        status: 500
      });
      return Me("admin_api.unhandled_error", g, {
        path: t.pathnameLower,
        method: i,
        responseCode: h.code,
        responseStatus: h.status
      }, "error"), B(h.code, h.message, h.status, h.details);
    }
  }
  #e() {
    for (const [n, e] of Object.entries(this.actionHandlers)) {
      if (!this.#a(n)) throw new TypeError("Admin action names cannot be empty");
      if (typeof e != "function") throw new TypeError(`Admin action ${n} is not a function`);
    }
    for (const [n, e] of Object.entries(this.actionAliases)) if (!this.actionHandlers[e]) throw new Error(`Admin action alias ${n} targets missing action ${e}`);
  }
  #a(n) {
    return String(n || "").trim();
  }
  #f(n) {
    const e = this.#a(n), a = this.actionAliases[e] || e;
    return this.actionHandlers[a] || null;
  }
  async #o(n, e, a) {
    const t = this.bindingService.getKV(e);
    if (!t) return B("KV_NOT_CONFIGURED", "请先绑定 ENI_KV / KV Namespace", 503);
    let r;
    try {
      const i = await xe(n, si);
      if (i.exceeded) return B("REQUEST_TOO_LARGE", "请求体过大", 413);
      r = JSON.parse(i.text || "");
    } catch {
      return B("INVALID_JSON", "请求 JSON 无效", 400);
    }
    const o = this.requestModel.normalizeAdminActionRequest(r);
    if (!o) return B("INVALID_REQUEST", "请求体必须是 JSON 对象", 400);
    const s = this.#f(o.action);
    return s ? s(o.data, {
      action: o.action,
      meta: o.meta,
      request: n,
      env: e,
      ctx: a,
      kv: t,
      db: this.bindingService.getDB(e)
    }) : B("INVALID_ACTION", "未知的管理动作", 400, { action: o.action || null });
  }
  #n(n) {
    return n.adminPathLower === "/admin" && n.pathnameLower === "/api/auth/login" && n.root === "api" && n.segments[1] === "auth" && n.segments[2] === "login";
  }
  #s(n) {
    return ui(n.pathnameLower, n.adminPathLower) || Er(n.pathnameLower, n.adminLoginPathLower) || this.#n(n);
  }
  #t(n, e, a, t = 200) {
    return this.shellService.buildEdgeCorsResponse(_a(e, n), a, t, { mergeOriginVary: !0 });
  }
  #u(n, e) {
    const a = new URL(n.url), t = ee(a.hostname), r = Q(a.pathname), o = r.toLowerCase(), s = Ze(e), i = s.toLowerCase(), c = sn(s), l = c.toLowerCase(), u = fi(e, {
      adminPath: s,
      loginPath: c
    }), d = r.split("/").filter(Boolean), f = d[0] || "", m = wt(f).toLowerCase();
    return {
      initHealth: u,
      requestUrl: a,
      requestHost: t,
      configuredHost: Ke(e),
      configuredLegacyHost: kr(e),
      normalizedPathname: r,
      pathnameLower: o,
      adminPath: s,
      adminPathLower: i,
      adminLoginPath: c,
      adminLoginPathLower: l,
      segments: d,
      rootRaw: f,
      root: m
    };
  }
  async #i(n, e) {
    const a = n.headers.get("cf-connecting-ip") || "unknown", t = this.repository.getDB(e), r = gu(e), o = await this.configReader.getRuntimeConfig(e), s = Math.max(1, parseInt(o.jwtExpiryDays) || 30) * 86400;
    try {
      const i = await ge(this.repository.getAuthFailureEntry(t, a), "auth.login.read_auth_failure", { ip: a }, null), c = Math.max(0, Number(i?.failCount) || 0);
      if (c >= O.Defaults.MaxLoginAttempts) return B("TOO_MANY_ATTEMPTS", "账户已锁定，请稍后再试", 429);
      let l = "";
      if ((n.headers.get("content-type") || "").includes("application/json")) {
        const d = await xe(n, Ju);
        if (d.exceeded) return B("REQUEST_TOO_LARGE", "请求体过大", 413);
        const f = JSON.parse(d.text || "{}");
        l = typeof f.password == "string" ? f.password : "";
      }
      if (!e.JWT_SECRET) return B("SERVER_MISCONFIGURED", "JWT_SECRET 未配置", 503);
      if (!e.ADMIN_PASS) return B("SERVER_MISCONFIGURED", "ADMIN_PASS 未配置", 503);
      if (l && l === e.ADMIN_PASS) {
        i && await ge(this.repository.deleteAuthFailureEntry(t, a), "auth.login.clear_auth_failure", { ip: a }, !1);
        const d = await this.#d(e.JWT_SECRET, s);
        return J({
          ok: !0,
          expiresIn: s
        }, 200, { "Set-Cookie": `auth_token=${d}; Path=${r}; Max-Age=${s}; HttpOnly; Secure; SameSite=Strict` });
      }
      const u = c + 1;
      return await ge(this.repository.upsertAuthFailureEntry(t, a, {
        failCount: u,
        expiresAt: k() + O.Defaults.LoginLockDuration * 1e3
      }), "auth.login.write_auth_failure", {
        ip: a,
        nextFailCount: u
      }, null), J({
        ok: !1,
        error: {
          code: "INVALID_PASSWORD",
          message: "密码错误"
        },
        remain: Math.max(0, O.Defaults.MaxLoginAttempts - u)
      }, 401);
    } catch (i) {
      return B("INVALID_REQUEST", "请求无效", 400, { reason: i.message });
    }
  }
  async #r(n, e) {
    try {
      const a = e.JWT_SECRET;
      if (!a) return !1;
      const t = n.headers.get("Authorization") || "";
      let r = t.startsWith("Bearer ") ? t.slice(7) : null;
      if (!r) {
        const o = (n.headers.get("Cookie") || "").match(/(?:^|;\s*)auth_token=([^;]+)/);
        r = o ? o[1] : null;
      }
      return r ? await this.#l(r, a) : !1;
    } catch {
      return !1;
    }
  }
  async #d(n, e) {
    const a = btoa(JSON.stringify({
      alg: "HS256",
      typ: "JWT"
    })).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, ""), t = btoa(JSON.stringify({
      sub: "admin",
      exp: Math.floor(Date.now() / 1e3) + e
    })).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
    return `${a}.${t}.${await this.#c(n, `${a}.${t}`)}`;
  }
  async #l(n, e) {
    const a = n.split(".");
    if (a.length !== 3 || a[2] !== await this.#c(e, `${a[0]}.${a[1]}`)) return !1;
    try {
      return JSON.parse(atob(a[1].replace(/-/g, "+").replace(/_/g, "/"))).exp > Math.floor(Date.now() / 1e3);
    } catch {
      return !1;
    }
  }
  async #c(n, e) {
    return Jt(n, e);
  }
  #m(n, e) {
    return this.shellService.renderLandingPage(n, e);
  }
  #p(n, e, a) {
    return this.shellService.renderAdminLoginPage(n, e, a);
  }
  #g(n, e, a, t) {
    return this.shellService.renderAdminPage(n, e, a, t);
  }
  #h(n, e, a, t, r) {
    return this.shellService.renderAdminReleaseVendorAsset(n, e, a, t, r);
  }
  #y(n, e, a, t) {
    return this.shellService.renderAdminWarmResponse(n, e, a, t);
  }
  #_(n) {
    return this.shellService.renderFaviconResponse(n);
  }
  #b(n, e) {
    return this.shellService.resolveAdminReleaseVendorRouteMatch(n, e);
  }
  #R(n, e) {
    return this.shellService.isAdminWarmRoute(n, e);
  }
  #S(n, e) {
    return this.shellService.buildRequestPathRedirectResponse(n, e);
  }
  #E(...n) {
    return this.shellService.buildAdminReleaseVendorErrorResponse(...n);
  }
};
function Ci(n = "", e = "") {
  const a = String(n || "").trim().toLowerCase(), t = String(e || "").trim().toLowerCase();
  return t === "image" || a.includes("/images/") || a.includes("/emby/covers/") || /\.(jpe?g|png|webp|gif)(?:$|[?#])/.test(a) ? "image_poster" : a.includes("/sessions/playing") || a.includes("/playbackinfo") ? "playback_info" : a.includes("/users/authenticate") ? "auth" : a.includes("/items/") || a.includes("/shows/") || a.includes("/movies/") || a.includes("/users/") ? "media_metadata" : t || "api";
}
function Zu(n = "", e = "") {
  return Ci(n, e) === "playback_info";
}
function ed(n = "", e = "") {
  const a = String(n || "").trim().toLowerCase(), t = String(e || "").trim().toLowerCase();
  return t === "stream" || t === "segment" || t === "manifest" ? !0 : /\/stream(?:$|[/?])/.test(a) || a.includes("/master.m3u8") || /\/videos\/[^/]+\/(?:original|download|file)(?:$|[/?])/.test(a) || /\/items\/[^/]+\/download(?:$|[/?])/.test(a) || a.includes("static=true") || a.includes("download=true");
}
function Ti(n) {
  return String(n || "").trim().toLowerCase().replace(/[\s-]+/g, "_") === "poster_manifest" ? "poster_manifest" : "poster";
}
function wi(n) {
  const e = String(n || "").trim().toLowerCase();
  return e === "fts" ? "fts" : e === "like" ? "like" : O.Defaults.LogSearchMode;
}
function Di(n) {
  return String(n || "").trim().toLowerCase() === "error" ? "error" : O.Defaults.LogWriteMode;
}
function td(n) {
  const e = String(n || "").trim().toLowerCase().replace(/[\s-]+/g, "_");
  return e === "playback" || e === "playback_info" ? "playback_info" : e === "image" ? "image" : e === "api" ? "api" : e === "auth" ? "auth" : "";
}
function rd(n) {
  const e = String(n || "").trim().toLowerCase().replace(/[\s-]+/g, "_");
  return e === "4xx" || e === "status_4xx" ? "4xx" : e === "5xx" || e === "status_5xx" ? "5xx" : "";
}
function Jo(n) {
  const e = String(n || "").trim().toLowerCase().replace(/[\s-]+/g, "_");
  return e === "direct" ? "direct" : e === "proxy" || e === "proxied" ? "proxy" : "";
}
function ad(n = "") {
  const e = String(n || "").trim().toLowerCase().replace(/[\s-]+/g, "_");
  return e === "connect_timeout" ? "connect_timeout" : e === "idle_timeout" ? "idle_timeout" : e === "tls_handshake_failed" ? "tls_handshake_failed" : e === "http_version_fallback" ? "http_version_fallback" : e === "redirect_loop" ? "redirect_loop" : e === "redirect_limit_exceeded" ? "redirect_limit_exceeded" : e === "range_unsatisfied" ? "range_unsatisfied" : e === "upstream_4xx" ? "upstream_4xx" : e === "upstream_5xx" ? "upstream_5xx" : e === "unknown_fetch_error" ? "unknown_fetch_error" : "";
}
var nd = Object.freeze({
  400: Object.freeze({
    code: "bad_request",
    text: "请求格式无效或参数不符合上游要求"
  }),
  401: Object.freeze({
    code: "unauthorized",
    text: "请求缺少有效身份凭证，或当前登录态已失效"
  }),
  403: Object.freeze({
    code: "forbidden",
    text: "请求已被识别，但当前账号、策略或源站规则拒绝访问"
  }),
  404: Object.freeze({
    code: "not_found",
    text: "请求路径或目标资源不存在"
  }),
  405: Object.freeze({
    code: "method_not_allowed",
    text: "当前请求方法不被目标接口允许"
  }),
  429: Object.freeze({
    code: "too_many_requests",
    text: "请求频率超过当前限流阈值，服务暂时拒绝继续处理"
  }),
  500: Object.freeze({
    code: "internal_server_error",
    text: "源站或代理在处理请求时发生内部错误"
  }),
  501: Object.freeze({
    code: "not_implemented",
    text: "源站或上游链路尚未实现当前请求所需能力"
  }),
  502: Object.freeze({
    code: "bad_gateway",
    text: "网关无法从上游获得有效响应，或源站当前不可达"
  }),
  503: Object.freeze({
    code: "service_unavailable",
    text: "源站暂时不可用，可能处于维护、重启或过载状态"
  }),
  504: Object.freeze({
    code: "gateway_timeout",
    text: "网关等待上游响应超时"
  }),
  505: Object.freeze({
    code: "http_version_not_supported",
    text: "目标链路不支持当前请求所使用的 HTTP 版本"
  }),
  520: Object.freeze({
    code: "cf_unknown_origin_error",
    text: "Cloudflare 已到达源站，但源站返回了无法归类的异常响应"
  }),
  521: Object.freeze({
    code: "cf_web_server_down",
    text: "Cloudflare 已到达源站网络，但源站拒绝连接或未监听目标端口"
  }),
  522: Object.freeze({
    code: "cf_connection_timed_out",
    text: "Cloudflare 与源站建立连接超时"
  }),
  523: Object.freeze({
    code: "cf_origin_unreachable",
    text: "Cloudflare 无法路由到源站网络，或源站 DNS/网络不可达"
  }),
  524: Object.freeze({
    code: "cf_origin_timeout",
    text: "Cloudflare 已与源站建立连接，但源站在超时窗口内未返回完整响应"
  }),
  525: Object.freeze({
    code: "cf_ssl_handshake_failed",
    text: "Cloudflare 与源站的 TLS 握手失败"
  }),
  526: Object.freeze({
    code: "cf_invalid_ssl_certificate",
    text: "Cloudflare 校验源站证书时判定该证书无效"
  }),
  530: Object.freeze({
    code: "cf_origin_dns_error",
    text: "源站 DNS 解析或 Cloudflare 到源站的访问链路存在致命错误"
  })
});
function od(n) {
  const e = Math.trunc(Number(n) || 0);
  if (!Number.isFinite(e) || e <= 0) return {
    code: null,
    text: null
  };
  const a = nd[e];
  return a ? {
    code: a.code,
    text: a.text
  } : {
    code: null,
    text: null
  };
}
function sd(n) {
  const e = String(n || "").trim();
  return e ? /\b(?:AND|OR|NOT|NEAR)\b/i.test(e) || /(?:^|\s)(?:node_name|request_path|user_agent|error_detail)\s*:/i.test(e) || /(?:^|\s)[^\s"]+\*/.test(e) ? !0 : /^"(?:[^"]|"")+"$/.test(e) : !1;
}
function Ni(n) {
  return `"${String(n || "").replace(/"/g, '""')}"`;
}
function id(n) {
  return `${Ni(n)}*`;
}
function cd(n) {
  return String(n || "").replace(/(^|\s)((?:node_name|request_path|user_agent|error_detail)\s*:\s*)([^"\s()]+)(?=\s|$)/gi, (e, a, t, r) => `${a}${t}${Ni(r)}`);
}
function ld(n) {
  const e = String(n || "").trim();
  return e ? sd(e) ? cd(e) : e.split(/\s+/).filter(Boolean).map((a) => id(a)).join(" AND ") : "";
}
function Li(n = null) {
  if (!n || typeof n != "object") return null;
  const e = Math.floor(Number(n.timestamp)), a = Math.floor(Number(n.id));
  return !Number.isFinite(e) || !Number.isFinite(a) || e < 0 || a < 0 ? null : {
    timestamp: e,
    id: a
  };
}
function ud(n = null) {
  return Li({
    timestamp: Number(n?.timestamp),
    id: Number(n?.id)
  });
}
function Ma(n) {
  return `"${String(n || "").replace(/"/g, '""')}"`;
}
function Kn(n) {
  return String(n || "").toLowerCase().replace(/["`\[\]]/g, "").replace(/\s+/g, " ").trim();
}
function Ro(n = "") {
  const e = String(n || "").trim().toLowerCase();
  return e === "paid" ? "paid" : e === "free" ? "free" : "";
}
function fr(n = "") {
  const e = String(n || "").trim().toUpperCase();
  return e === "A" || e === "AAAA" || e === "CNAME";
}
function Ia(n, e, a = {}) {
  const t = String(n || "").trim().toUpperCase(), r = String(e || "").trim(), o = a.allowCname !== !1;
  if (!fr(t)) return "Type 仅允许 A / AAAA / CNAME";
  if (!o && t === "CNAME") return "A 模式仅允许 A / AAAA";
  if (!r) return "Content 不能为空";
  if (t === "A" && !rn(r)) return "A 记录 Content 必须是合法 IPv4 地址";
  if (t === "AAAA" && !lo(r)) return "AAAA 记录 Content 必须是合法 IPv6 地址";
  if (t === "CNAME") {
    if (/\s/.test(r)) return "CNAME 记录 Content 不能包含空格";
    if (r.length > 255) return "CNAME 记录 Content 过长";
  }
  return "";
}
function dd(n = "") {
  const e = String(n || "").trim();
  return e ? Ia("CNAME", e) ? "" : e : "";
}
var fd = [
  "logIncludeClientIp",
  "logIncludeColo",
  "logIncludeUa"
], Mi = [
  "playbackInfoAutoProxy",
  "playbackInfoBlockWangpanProxy",
  "sameOriginRedirectProxy",
  "externalRedirectProxy",
  "clientVisibleSameOriginRedirects",
  "clientVisibleExternalRedirects",
  "clientVisibleRedirects",
  "enableWangpanDirect",
  "wangpandirect",
  "tgDailyReportTime"
], Ii = ["directSourceNodes", "nodeDirectList"], Pi = ["sourceSameOriginProxy", "forceExternalProxy"], xi = [
  "enableH2",
  "enableH3",
  "peakDowngrade"
], Qo = [
  ...fd,
  ...Mi,
  ...Ii,
  ...Pi,
  ...xi
], md = {
  directSourceNodes: ["sourceDirectNodes"],
  nodeDirectList: ["sourceDirectNodes"],
  logIncludeClientIp: ["logWriteClientIp", "logDisplayClientIp"],
  logIncludeColo: ["logWriteColo", "logDisplayColo"],
  logIncludeUa: ["logWriteUa", "logDisplayUa"],
  playbackInfoAutoProxy: ["defaultPlaybackInfoMode"],
  playbackInfoBlockWangpanProxy: ["defaultPlaybackInfoMode"],
  enableH2: ["protocolStrategy"],
  enableH3: ["protocolStrategy"],
  peakDowngrade: ["protocolStrategy"],
  tgDailyReportTime: ["tgDailyReportClockTimes"]
}, pd = /* @__PURE__ */ new Set([...Mi, ...Pi]), Oi = {
  allowedFields: [
    "uiRadiusPx",
    "settingsExperienceMode",
    "indexUrl",
    "cfQuotaPlanOverride",
    "protocolStrategy",
    "protocolFallback",
    "enableHostPrefixProxy",
    "enablePrewarm",
    "prewarmDepth",
    "prewarmCacheTtl",
    "prewarmPrefetchBytes",
    "disablePrewarmPrefetch",
    "routingDecisionMode",
    "playbackInfoCacheEnabled",
    "playbackInfoCacheTtlSec",
    "videoProgressForwardEnabled",
    "videoProgressForwardIntervalSec",
    "defaultPlaybackInfoMode",
    "defaultRealClientIpMode",
    "defaultMediaAuthMode",
    "directStaticAssets",
    "directHlsDash",
    "multiLinkCopyPanelEnabled",
    "dashboardShowD1WriteHotspot",
    "dashboardShowKvD1Status",
    "sourceDirectNodes",
    "dnsDefaultFallbackCname",
    "defaultHostPrefixCnameTarget",
    "pingTimeout",
    "pingCacheMinutes",
    "hedgeFailoverEnabled",
    "hedgeProbePath",
    "hedgeProbeTimeoutMs",
    "hedgeProbeParallelism",
    "hedgeWaitTimeoutMs",
    "hedgeLockTtlMs",
    "hedgePreferredTtlSec",
    "hedgeFailureCooldownSec",
    "hedgeWakeJitterMs",
    "upstreamTimeoutMs",
    "upstreamRetryAttempts",
    "geoAllowlist",
    "geoBlocklist",
    "ipBlacklist",
    "rateLimitRpm",
    "cacheTtlImages",
    "corsOrigins",
    "logEnabled",
    "logSearchMode",
    "logWriteMode",
    "logWriteClientIp",
    "logWriteColo",
    "logWriteUa",
    "logDisplayClientIp",
    "logDisplayColo",
    "logDisplayUa",
    "logWriteImagePoster",
    "logWriteMediaMetadata",
    "logRetentionDays",
    "logWriteDelayMinutes",
    "logFlushCountThreshold",
    "logBatchChunkSize",
    "logBatchRetryCount",
    "logBatchRetryBackoffMs",
    "scheduledLeaseMs",
    "scheduleUtcOffsetMinutes",
    "tgDailyReportEnabled",
    "tgDailyReportSummaryEnabled",
    "tgDailyReportKvEnabled",
    "tgDailyReportD1Enabled",
    "tgDailyReportClockTimes",
    "tgBotToken",
    "tgChatId",
    "tgAlertDroppedBatchThreshold",
    "tgAlertFlushRetryThreshold",
    "tgAlertOnScheduledFailure",
    "tgAlertKvUsageEnabled",
    "tgAlertKvUsageThresholdPercent",
    "tgAlertD1UsageEnabled",
    "tgAlertD1UsageThresholdPercent",
    "tgAlertCooldownMinutes",
    "jwtExpiryDays",
    "cfAccountId",
    "cfZoneId",
    "cfApiToken",
    "cfKvNamespaceId",
    "cfD1DatabaseId",
    "cfQuotaPlanCacheMinutes"
  ],
  aliasFields: {},
  trimFields: [
    "tgBotToken",
    "tgChatId",
    "cfAccountId",
    "cfZoneId",
    "cfApiToken",
    "cfKvNamespaceId",
    "cfD1DatabaseId",
    "indexUrl",
    "cfQuotaPlanOverride",
    "corsOrigins",
    "geoAllowlist",
    "geoBlocklist",
    "ipBlacklist",
    "dnsDefaultFallbackCname",
    "defaultHostPrefixCnameTarget",
    "prewarmDepth",
    "hedgeProbePath",
    "logSearchMode",
    "logWriteMode",
    "routingDecisionMode",
    "protocolStrategy",
    "defaultPlaybackInfoMode",
    "defaultRealClientIpMode",
    "defaultMediaAuthMode"
  ],
  arrayNormalizers: { sourceDirectNodes: "nodeNameList" },
  integerFields: {
    logRetentionDays: {
      fallback: O.Defaults.LogRetentionDays,
      min: 1,
      max: O.Defaults.LogRetentionDaysMax
    },
    logFlushCountThreshold: {
      fallback: O.Defaults.LogFlushCountThreshold,
      min: 1,
      max: 5e3
    },
    logBatchChunkSize: {
      fallback: O.Defaults.LogBatchChunkSize,
      min: 1,
      max: 100
    },
    logBatchRetryCount: {
      fallback: O.Defaults.LogBatchRetryCount,
      min: 0,
      max: 5
    },
    logBatchRetryBackoffMs: {
      fallback: O.Defaults.LogBatchRetryBackoffMs,
      min: 0,
      max: 5e3
    },
    scheduledLeaseMs: {
      fallback: O.Defaults.ScheduledLeaseMs,
      min: O.Defaults.ScheduledLeaseMinMs,
      max: 900 * 1e3
    },
    uiRadiusPx: {
      fallback: O.Defaults.UiRadiusPx,
      min: 0,
      max: 48
    },
    tgAlertDroppedBatchThreshold: {
      fallback: O.Defaults.TgAlertDroppedBatchThreshold,
      min: 0,
      max: 5e3
    },
    tgAlertFlushRetryThreshold: {
      fallback: O.Defaults.TgAlertFlushRetryThreshold,
      min: 0,
      max: 10
    },
    tgAlertKvUsageThresholdPercent: {
      fallback: O.Defaults.TgAlertKvUsageThresholdPercent,
      min: 1,
      max: 100
    },
    tgAlertD1UsageThresholdPercent: {
      fallback: O.Defaults.TgAlertD1UsageThresholdPercent,
      min: 1,
      max: 100
    },
    tgAlertCooldownMinutes: {
      fallback: O.Defaults.TgAlertCooldownMinutes,
      min: 1,
      max: 1440
    },
    cacheTtlImages: {
      fallback: O.Defaults.CacheTtlImagesDays,
      min: 0,
      max: 365
    },
    pingTimeout: {
      fallback: O.Defaults.PingTimeoutMs,
      min: 1e3,
      max: 18e4
    },
    pingCacheMinutes: {
      fallback: O.Defaults.PingCacheMinutes,
      min: 0,
      max: 1440
    },
    hedgeProbeTimeoutMs: {
      fallback: O.Defaults.HedgeProbeTimeoutMs,
      min: 250,
      max: 1e4
    },
    hedgeProbeParallelism: {
      fallback: O.Defaults.HedgeProbeParallelism,
      min: 1,
      max: 2
    },
    hedgeWaitTimeoutMs: {
      fallback: O.Defaults.HedgeWaitTimeoutMs,
      min: 250,
      max: 1e4
    },
    hedgeLockTtlMs: {
      fallback: O.Defaults.HedgeLockTtlMs,
      min: 1e3,
      max: 1e4
    },
    hedgePreferredTtlSec: {
      fallback: O.Defaults.HedgePreferredTtlSec,
      min: 30,
      max: 3600
    },
    hedgeFailureCooldownSec: {
      fallback: O.Defaults.HedgeFailureCooldownSec,
      min: 1,
      max: 300
    },
    hedgeWakeJitterMs: {
      fallback: O.Defaults.HedgeWakeJitterMs,
      min: 0,
      max: 1e3
    },
    cfQuotaPlanCacheMinutes: {
      fallback: O.Defaults.CfQuotaPlanCacheMinutes,
      min: 1,
      max: 1440
    },
    upstreamTimeoutMs: {
      fallback: O.Defaults.UpstreamTimeoutMs,
      min: 0,
      max: 18e4
    },
    upstreamRetryAttempts: {
      fallback: O.Defaults.UpstreamRetryAttempts,
      min: 0,
      max: 3
    },
    prewarmCacheTtl: {
      fallback: O.Defaults.PrewarmCacheTtl,
      min: 0,
      max: 3600
    },
    prewarmPrefetchBytes: {
      fallback: O.Defaults.PrewarmPrefetchBytes,
      min: 0,
      max: 64 * 1024 * 1024
    },
    playbackInfoCacheTtlSec: {
      fallback: O.Defaults.PlaybackInfoCacheTtlSec,
      min: 0,
      max: 60
    },
    videoProgressForwardIntervalSec: {
      fallback: O.Defaults.VideoProgressForwardIntervalSec,
      min: 0,
      max: 60
    },
    scheduleUtcOffsetMinutes: {
      fallback: O.Defaults.ScheduleUtcOffsetMinutes,
      min: -720,
      max: 840
    }
  },
  numberFields: { logWriteDelayMinutes: {
    fallback: O.Defaults.LogFlushDelayMinutes,
    min: 0,
    max: 1440
  } },
  booleanTrueFields: [
    "protocolFallback",
    "enablePrewarm",
    "playbackInfoCacheEnabled",
    "videoProgressForwardEnabled",
    "logEnabled",
    "logWriteClientIp",
    "logWriteColo",
    "logWriteUa",
    "logDisplayClientIp",
    "logDisplayColo",
    "logDisplayUa"
  ],
  booleanFalseFields: [
    "tgAlertOnScheduledFailure",
    "tgAlertKvUsageEnabled",
    "tgAlertD1UsageEnabled",
    "tgDailyReportEnabled",
    "tgDailyReportSummaryEnabled",
    "tgDailyReportKvEnabled",
    "tgDailyReportD1Enabled",
    "directStaticAssets",
    "directHlsDash",
    "multiLinkCopyPanelEnabled",
    "dashboardShowD1WriteHotspot",
    "dashboardShowKvD1Status",
    "enableHostPrefixProxy",
    "hedgeFailoverEnabled",
    "disablePrewarmPrefetch",
    "logWriteImagePoster",
    "logWriteMediaMetadata"
  ]
};
function gd(n = {}, e = {}) {
  for (const [a, t] of Object.entries(e.aliasFields || {}))
    if (!(n[a] !== void 0 && n[a] !== null) && Array.isArray(t)) {
      for (const r of t)
        if (!(n[r] === void 0 || n[r] === null)) {
          n[a] = n[r];
          break;
        }
    }
  return n;
}
function hd(n = {}, e = {}) {
  const a = Array.isArray(e.allowedFields) ? e.allowedFields : [];
  if (!a.length) return n;
  const t = {};
  for (const r of a)
    Object.prototype.hasOwnProperty.call(n, r) && (t[r] = n[r]);
  return t;
}
function yd(n = {}, e = Oi, a = {}) {
  let t = n && typeof n == "object" && !Array.isArray(n) ? { ...n } : {};
  t = gd(t, e);
  for (const r of e.trimFields || [])
    t[r] === void 0 || t[r] === null || (t[r] = String(t[r]).trim());
  for (const [r, o] of Object.entries(e.arrayNormalizers || {}))
    Array.isArray(t[r]) && o === "nodeNameList" && typeof a.normalizeNodeNameList == "function" && (t[r] = a.normalizeNodeNameList(t[r]));
  for (const [r, o] of Object.entries(e.integerFields || {})) t[r] = de(t[r], o.fallback, o.min, o.max);
  for (const [r, o] of Object.entries(e.numberFields || {})) t[r] = Kc(t[r], o.fallback, o.min, o.max);
  for (const r of e.booleanTrueFields || []) t[r] = t[r] !== !1;
  for (const r of e.booleanFalseFields || []) t[r] = t[r] === !0;
  return hd(t, e);
}
function vi(n = {}) {
  const e = n && typeof n == "object" && !Array.isArray(n) ? n : {}, a = { ...e };
  let t = !1;
  const r = [], o = [], s = {};
  for (const c of Qo)
    Object.prototype.hasOwnProperty.call(e, c) && r.push(c);
  const i = (c, l) => {
    const u = String(c || "").trim(), d = String(l || "").trim();
    !u || !d || (o.push(d), s[u] || (s[u] = []), s[u].push(d));
  };
  if (!Object.prototype.hasOwnProperty.call(a, "sourceDirectNodes")) {
    for (const c of Ii)
      if (Object.prototype.hasOwnProperty.call(e, c)) {
        a.sourceDirectNodes = ut(e[c]), t = !0, i(c, "sourceDirectNodes");
        break;
      }
  }
  if (!Object.prototype.hasOwnProperty.call(a, "logWriteClientIp") && Reflect.get(e, "logIncludeClientIp") !== void 0 && (a.logWriteClientIp = e.logIncludeClientIp !== !1, t = !0, i("logIncludeClientIp", "logWriteClientIp")), !Object.prototype.hasOwnProperty.call(a, "logDisplayClientIp") && Reflect.get(e, "logIncludeClientIp") !== void 0 && (a.logDisplayClientIp = e.logIncludeClientIp !== !1, t = !0, i("logIncludeClientIp", "logDisplayClientIp")), !Object.prototype.hasOwnProperty.call(a, "logWriteColo") && Reflect.get(e, "logIncludeColo") !== void 0 && (a.logWriteColo = e.logIncludeColo !== !1, t = !0, i("logIncludeColo", "logWriteColo")), !Object.prototype.hasOwnProperty.call(a, "logDisplayColo") && Reflect.get(e, "logIncludeColo") !== void 0 && (a.logDisplayColo = e.logIncludeColo !== !1, t = !0, i("logIncludeColo", "logDisplayColo")), !Object.prototype.hasOwnProperty.call(a, "logWriteUa") && Reflect.get(e, "logIncludeUa") !== void 0 && (a.logWriteUa = e.logIncludeUa !== !1, t = !0, i("logIncludeUa", "logWriteUa")), !Object.prototype.hasOwnProperty.call(a, "logDisplayUa") && Reflect.get(e, "logIncludeUa") !== void 0 && (a.logDisplayUa = e.logIncludeUa !== !1, t = !0, i("logIncludeUa", "logDisplayUa")), !Object.prototype.hasOwnProperty.call(a, "protocolStrategy")) {
    let c = !1;
    for (const l of xi)
      Object.prototype.hasOwnProperty.call(e, l) && (i(l, "protocolStrategy"), c = !0);
    c && (a.protocolStrategy = bo(e), t = !0);
  }
  Object.prototype.hasOwnProperty.call(a, "defaultPlaybackInfoMode") || (Reflect.get(e, "playbackInfoAutoProxy") !== void 0 ? (a.defaultPlaybackInfoMode = $a(e), t = !0, i("playbackInfoAutoProxy", "defaultPlaybackInfoMode")) : Reflect.get(e, "playbackInfoBlockWangpanProxy") !== void 0 && (a.defaultPlaybackInfoMode = $a(e), t = !0, i("playbackInfoBlockWangpanProxy", "defaultPlaybackInfoMode"))), Object.prototype.hasOwnProperty.call(a, "tgDailyReportClockTimes") || (a.tgDailyReportClockTimes = At(Object.prototype.hasOwnProperty.call(e, "tgDailyReportTime") ? e.tgDailyReportTime : e.tgDailyReportClockTimes, O.Defaults.TgDailyReportClockTimes), Object.prototype.hasOwnProperty.call(e, "tgDailyReportTime") && (t = !0, i("tgDailyReportTime", "tgDailyReportClockTimes")));
  for (const c of Qo)
    Object.prototype.hasOwnProperty.call(a, c) && (delete a[c], t = !0);
  return {
    config: a,
    migrated: t,
    legacyKeysPresent: bt(r),
    deletedLegacyFieldCount: bt(r).length,
    migratedConfigKeys: bt(o),
    migratedKeyMap: Object.fromEntries(Object.entries(s).map(([c, l]) => [c, bt(l)]))
  };
}
function te(n = {}) {
  const { config: e } = vi(n && typeof n == "object" && !Array.isArray(n) ? n : {});
  return Fi(e);
}
function Fi(n = {}) {
  const e = yd({
    ...n,
    defaultPlaybackInfoMode: sa(n, "defaultPlaybackInfoMode") ? Reflect.get(n, "defaultPlaybackInfoMode") : $a(n),
    protocolStrategy: sa(n, "protocolStrategy") ? Reflect.get(n, "protocolStrategy") : bo(n)
  }, Oi, { normalizeNodeNameList: ut });
  e.prewarmDepth = Ti(e.prewarmDepth), e.hedgeProbePath = ba(e.hedgeProbePath, O.Defaults.HedgeProbePath), e.dnsDefaultFallbackCname = dd(e.dnsDefaultFallbackCname), e.defaultHostPrefixCnameTarget = Bt(e.defaultHostPrefixCnameTarget), e.settingsExperienceMode = String(e.settingsExperienceMode || "").trim().toLowerCase() === "expert" ? "expert" : "novice", e.cfQuotaPlanOverride = Ro(e.cfQuotaPlanOverride), e.logSearchMode = wi(e.logSearchMode), e.logWriteMode = Di(e.logWriteMode), e.routingDecisionMode = Lr(e.routingDecisionMode), e.protocolStrategy = pi(e.protocolStrategy), e.defaultPlaybackInfoMode = $t(e.defaultPlaybackInfoMode), e.defaultRealClientIpMode = co(e.defaultRealClientIpMode), e.defaultMediaAuthMode = Fs(e.defaultMediaAuthMode), e.scheduleUtcOffsetMinutes = ke(e.scheduleUtcOffsetMinutes), e.tgDailyReportClockTimes = At(e.tgDailyReportClockTimes, O.Defaults.TgDailyReportClockTimes);
  const a = je(e.indexUrl);
  return e.indexUrl = a ? Kr(a) : "", Du(e, n), e;
}
var Eo = ["cfApiToken", "tgBotToken"];
function Wr(n = {}) {
  const e = te(n);
  for (const a of Eo) delete e[a];
  return e;
}
function st(n = {}) {
  return te(n);
}
function Sd(n = {}, e = {}) {
  const a = te(n), t = te(e);
  for (const r of Eo) String(t[r] || "").length > 0 ? a[r] = t[r] : delete a[r];
  return a;
}
function Ui(n = {}, e = {}) {
  const a = F(n) ? { ...n } : {}, t = te(e);
  for (const r of Eo)
    Object.prototype.hasOwnProperty.call(a, r) || String(t[r] || "").length > 0 && (a[r] = t[r]);
  return a;
}
function An(n = {}, e = {}) {
  const a = Ui(n, e), t = je(te(e).indexUrl);
  return a.indexUrl = t ? Kr(t) : "", a;
}
function _d(n = "", e = {}) {
  const a = String(n || "").trim();
  if (!a) return;
  const t = a.split(".").pop() || "", r = ce(se(te(e)));
  if (t !== r)
    throw Te("CONFIG_REVISION_CONFLICT", "配置已被其他设备更新，请刷新设置后重新提交", 409, {
      expectedRevision: a,
      currentHash: r
    });
}
function ua(n = {}) {
  if (!F(n)) return n;
  const e = {
    ...n,
    config: Wr(n.config || {})
  };
  return F(n.rollbackPayload) && Array.isArray(n.rollbackPayload.kvEntries) && (e.rollbackPayload = {
    ...n.rollbackPayload,
    kvEntries: n.rollbackPayload.kvEntries.map((a) => {
      if (!F(a) || a.exists !== !0) return a;
      const t = String(a.key || "");
      if (t === "sys:config_snapshots:v1") try {
        const r = JSON.parse(String(a.value || "[]"));
        return {
          ...a,
          value: JSON.stringify(Array.isArray(r) ? r.map((o) => ua(o)) : [])
        };
      } catch {
        return {
          ...a,
          value: JSON.stringify([])
        };
      }
      if (t !== "sys:theme") return a;
      try {
        return {
          ...a,
          value: JSON.stringify(Wr(JSON.parse(String(a.value || "{}"))))
        };
      } catch {
        return {
          ...a,
          value: JSON.stringify({})
        };
      }
    })
  }), e;
}
function Hi(n = {}) {
  const e = vi(n);
  return {
    cleanedConfig: Fi(e.config),
    legacyKeysPresent: e.legacyKeysPresent,
    deletedLegacyFieldCount: e.deletedLegacyFieldCount,
    migratedConfigKeys: e.migratedConfigKeys,
    migratedKeyMap: e.migratedKeyMap
  };
}
function bd(n = []) {
  const e = [], a = [], t = /* @__PURE__ */ new Set();
  for (const r of Array.isArray(n) ? n : []) {
    const o = String(r || "").trim();
    if (!o) continue;
    const s = md[o];
    if (Array.isArray(s) && s.length) {
      a.push(o);
      for (const i of s)
        !i || t.has(i) || (t.add(i), e.push(i));
      continue;
    }
    if (pd.has(o)) {
      a.push(o);
      continue;
    }
    t.has(o) || (t.add(o), e.push(o));
  }
  return {
    changedKeys: e,
    removedLegacyKeys: bt(a)
  };
}
function Rd(n) {
  if (!n || typeof n != "object" || Array.isArray(n)) return {
    snapshot: n,
    rewritten: !1,
    deletedLegacyFieldCount: 0,
    migratedConfigKeys: []
  };
  const e = Hi(n.config && typeof n.config == "object" && !Array.isArray(n.config) ? n.config : {}), a = bd(n.changedKeys), t = {
    ...n,
    changedKeys: a.changedKeys,
    changeCount: a.changedKeys.length,
    config: e.cleanedConfig
  }, r = Array.isArray(n.changedKeys) ? n.changedKeys : [], o = Number(n.changeCount) || r.length || 0;
  return {
    snapshot: t,
    rewritten: se(n.config || {}) !== se(t.config) || se(r) !== se(t.changedKeys) || o !== t.changeCount,
    deletedLegacyFieldCount: e.deletedLegacyFieldCount + a.removedLegacyKeys.length,
    migratedConfigKeys: e.migratedConfigKeys
  };
}
function Ut(n = "", e = "") {
  const a = String(n || "").trim() || "empty";
  return `${String(e || "").trim() || (/* @__PURE__ */ new Date()).toISOString()}.${a}`;
}
function Tr(n, e = {}) {
  const a = ce(se(n)), t = String(e.updatedAt || "").trim() || (/* @__PURE__ */ new Date()).toISOString();
  return {
    ...e,
    hash: a,
    updatedAt: t,
    revision: Ut(a, t)
  };
}
function zn(n = {}, e = {}) {
  const a = te(n), t = te(e), r = [.../* @__PURE__ */ new Set([...Object.keys(a), ...Object.keys(t)])].sort(), o = [];
  for (const s of r)
    se(a[s]) !== se(t[s]) && o.push({
      key: s,
      previousValue: a[s],
      nextValue: t[s]
    });
  return o;
}
function Ed(n = [], e = 20) {
  const a = Math.max(1, Number(e) || 20);
  return [...new Set((Array.isArray(n) ? n : [n]).map((t) => String(t ?? "").trim()).filter(Boolean))].slice(0, a);
}
function it(n = "", e = "", a = [], t = {}) {
  const r = Ed(a, t.limit), o = Number(t.count), s = Number.isFinite(o) ? Math.max(0, Math.floor(o)) : r.length, i = String(t.note || "").trim();
  return {
    key: String(n || "").trim(),
    label: String(e || "").trim(),
    count: s,
    samples: r,
    truncated: s > r.length,
    note: i
  };
}
function Ee(n, e, a = "", t = "", r = [], o = 0, s = "") {
  return e && n.push(it(a, t, r, {
    count: o,
    note: s
  })), n;
}
function Ad(n = {}) {
  const e = [], a = bt(n.configFieldTargets || []);
  if (a.length > 0) {
    const i = [];
    n.sourceDirectNodesFromLegacyNodes === !0 && i.push("包含节点遗留直连标记折叠进 sourceDirectNodes"), Number(n.rewrittenSnapshotCount) > 0 && i.push(`会同步迁移 ${Math.max(0, Math.floor(Number(n.rewrittenSnapshotCount) || 0))} 份旧快照中的相关配置字段`), e.push(it("config_current_fields", "全局设置当前字段", a, {
      count: a.length,
      note: i.join("；") || "会把旧版配置别名收敛到当前 schema。"
    }));
  }
  const t = Math.max(0, Math.floor(Number(n.migratedTopLevelPortNodeCount) || 0)), r = Math.max(0, Math.floor(Number(n.migratedLinePortCount) || 0)), o = Math.max(0, Math.floor(Number(n.migratedDefaultPortNodeCount) || 0)), s = Math.max(0, Math.floor(Number(n.migratedDefaultPortLineCount) || 0));
  if (t > 0 || r > 0 || o > 0 || s > 0) {
    const i = [];
    t > 0 && i.push(`旧版顶层 node.port 节点 ${t} 个`), r > 0 && i.push(`旧版 lines[].port 线路 ${r} 条`), o > 0 && i.push(`隐式默认端口节点 ${o} 个`), s > 0 && i.push(`按协议补齐默认端口线路 ${s} 条`), e.push(it("node_current_fields", "节点当前字段", ["lines[].target"], {
      count: 1,
      note: `会把端口统一收敛到当前字段。${i.join("，")}。`
    }));
  }
  return e;
}
function Cd(n = []) {
  return (Array.isArray(n) ? n : []).map((e) => e?.name || e?.id);
}
async function we(n, e, a = {}) {
  if (!n) return null;
  const t = String(e || "").trim(), r = F(a) ? a : {};
  try {
    return Object.prototype.hasOwnProperty.call(r, "type") ? await n.get(t, { type: r.type }) : await n.get(t);
  } catch (o) {
    throw xs("get", { key: t }, ie(o));
  }
}
async function Td(n, e = {}) {
  if (!n || typeof n.list != "function") return {
    keys: [],
    list_complete: !0,
    cursor: ""
  };
  const a = F(e) ? e : {}, t = String(a.prefix || "").trim(), r = String(a.cursor || "").trim();
  try {
    return r ? await n.list({
      prefix: t,
      cursor: r
    }) : await n.list({ prefix: t });
  } catch (o) {
    throw xs("list", { prefix: t }, ie(o));
  }
}
var wd = "sys:theme";
function ki(n, e = {}) {
  const a = String(n || "").trim(), t = a.toLowerCase(), r = String(e.zoneId || "").trim(), o = {
    status: "CF 查询失败",
    hint: "Cloudflare 查询失败，请检查 Zone ID、API 令牌与资源范围",
    detail: a || (r ? `当前查询的 Zone ID: ${r}` : "")
  };
  return a ? t.includes("unknown field") || t.includes("unknown enum") || t.includes("error parsing args") ? {
    status: "Schema 不兼容",
    hint: "当前账号可用的 GraphQL schema 与脚本查询字段不一致",
    detail: a
  } : t.includes("cf_graphql_http_429") || t.includes("rate limit") || t.includes("too many requests") ? {
    status: "请求过于频繁",
    hint: "Cloudflare GraphQL 已限流，请稍后再试",
    detail: a
  } : t.includes("invalid token") || t.includes("authentication") || t.includes("cf_graphql_http_401") ? {
    status: "令牌无效",
    hint: "Cloudflare API 令牌无效，或未启用 GraphQL Analytics 访问",
    detail: a
  } : t.includes("not authorized") || t.includes("permission") || t.includes("forbidden") || t.includes("unauthorized") || t.includes("cf_graphql_http_403") ? {
    status: "权限或范围不匹配",
    hint: "令牌权限不足，或 Account / Zone Resources 未覆盖当前查询",
    detail: a + (r ? ` | Zone ID: ${r}` : "")
  } : t.includes("zone") && (t.includes("not found") || t.includes("invalid") || t.includes("unknown")) ? {
    status: "Zone ID 无效",
    hint: "Zone ID 无效，或当前令牌无法访问这个 Zone",
    detail: a + (r ? ` | Zone ID: ${r}` : "")
  } : t.includes("cf_graphql_http_400") ? {
    status: "请求参数无效",
    hint: "GraphQL 请求参数无效，请检查 Zone ID 与筛选条件",
    detail: a + (r ? ` | Zone ID: ${r}` : "")
  } : o : o;
}
async function Ae(n) {
  const e = Ra(n);
  if (!e) return {};
  const a = _o(n), t = ln(n), r = t.ConfigCache;
  if (r?.exp > k() && r.data) return r.data;
  const o = t.RuntimeConfigCacheGeneration;
  return await cn(t.SingleFlightTasks, et([
    "runtime_config",
    a,
    o
  ]), async () => {
    const s = t.ConfigCache;
    if (s?.exp > k() && s.data) return s.data;
    const i = s?.data && typeof s.data == "object" ? s.data : r?.data && typeof r.data == "object" ? r.data : null;
    let c = i || {};
    try {
      c = te(await e.get("sys:theme", { type: "json" }) || {});
    } catch (l) {
      const u = i && typeof i == "object";
      Me("runtime_config.load_failed", l, {
        cacheNamespace: a,
        configKey: wd,
        usedCachedConfig: u === !0
      }), c = u ? i : te({});
    }
    return t.RuntimeConfigCacheGeneration === o && (t.ConfigCache = {
      data: c,
      exp: k() + O.Defaults.CacheTTL,
      namespace: a
    }), c;
  });
}
async function ue(n) {
  const e = Ra(n);
  return e ? te(await we(e, "sys:theme", { type: "json" }) || {}) : {};
}
function Dd(n = {}, e = {}) {
  const { indexRepository: a } = n;
  async function t(f, m, p, g = ze(m), h = null) {
    const y = F(h) ? te(h) : te(await ue(m)), S = await a.getAdminActiveIndexRecord(a.getKV(m)), _ = S ? te({
      ...y,
      indexUrl: S.sourceUrl
    }) : y;
    if (e.isAdminIndexSetupForced(f)) return e.renderAdminIndexSetupPage(f, m, p, g, _, "manual_setup_requested");
    const A = Tt(m, _);
    if (!A.indexUrl) return e.renderAdminIndexSetupPage(f, m, p, g, _);
    const b = A.indexUrl;
    if (b) try {
      const R = await e.renderRemoteAdminPage(f, m, p, g, b, _);
      if (R) return R;
    } catch (R) {
      return Me("admin.remote_shell_render", R, {
        path: new URL(f.url).pathname,
        remoteShellIndexUrl: b
      }), e.renderAdminRemoteShellErrorPage(f, m, p, g, {
        indexState: A,
        remoteShellIndexUrl: b,
        sourceType: "remote_error",
        routeState: "remote_error",
        remoteCacheState: "bypassed",
        lastFetchStatus: "failed",
        reason: `remote_shell_render_failed: ${String(R?.message || R || "unknown_error").trim()}`
      }, _);
    }
    return e.renderAdminIndexSetupPage(f, m, p, g, _, "index_url_not_configured");
  }
  async function r(f = [], m) {
    const p = Array.isArray(f) ? f : [];
    if (typeof m != "function" || p.length === 0) return [];
    const g = new Array(p.length);
    let h = 0;
    const y = async () => {
      for (; h < p.length; ) {
        const S = h;
        h += 1, g[S] = await m(p[S], S);
      }
    };
    return await Promise.all(Array.from({ length: Math.min(e.ADMIN_WARM_VENDOR_CONCURRENCY, p.length) }, () => y())), g;
  }
  function o(f) {
    return new Request(f, {
      method: "HEAD",
      headers: { Accept: "*/*" },
      cache: "no-store"
    });
  }
  function s(f) {
    return f?.ok === !0 || Number(f?.status) === 304;
  }
  async function i(f, m, p = ze(m), g = null) {
    const h = F(g) ? te(g) : te(await ue(m)), y = Tt(m, h);
    if (!y.indexUrl) return B("ADMIN_INDEX_NOT_CONFIGURED", "管理台 index.html 尚未配置", 409);
    const S = [], _ = { waitUntil(x) {
      S.push(Promise.resolve(x));
    } }, A = Ze(m), b = new URL(f.url);
    b.pathname = A, b.search = "";
    const R = await e.renderRemoteAdminPage(o(b), m, _, p, y.indexUrl, h);
    await Promise.all(S.splice(0));
    const E = ir(), D = y.assetRevision || y.releaseTag, w = y.isLocalUpload ? await a.getAdminIndexUploadRecord(a.getKV(m), y.localUploadRevision) : null;
    let C = null;
    w?.manifest ? (C = await e.readAdminReleaseVendorManifestFromCache(E, D, y.indexUrl), C || (C = await e.cacheAdminReleaseVendorManifest(E, w.manifest, _))) : C = await e.getOrCreateAdminReleaseVendorManifest(E, D, y.indexUrl, _);
    const T = (Array.isArray(C?.entries) ? C.entries : []).filter((x) => x?.assetKey && !e.isMutableJsdelivrGithubAssetUrl(x.upstreamUrl)), I = await r(T, async (x) => {
      const N = e.buildAdminReleaseVendorProxyPath(A, D, x.assetKey), M = new URL(f.url);
      return M.pathname = N, M.search = "", e.renderAdminReleaseVendorAsset(o(M), m, _, {
        releaseTag: D,
        assetKey: x.assetKey
      }, h);
    });
    await Promise.all(S.splice(0));
    const P = I.filter((x) => !s(x)).length, U = s(R), K = JSON.stringify({
      ok: U && P === 0,
      shellStatus: Number(R?.status) || 0,
      warmedAssetCount: T.length - P,
      failedAssetCount: P
    }), G = new Headers({
      "Content-Type": "application/json;charset=UTF-8",
      "Cache-Control": "no-store, max-age=0"
    });
    return Ce(G), new Response(f.method === "HEAD" ? null : K, {
      status: U && P === 0 ? 200 : 502,
      headers: G
    });
  }
  function c(f, m = ze(f)) {
    const p = Ze(f), g = m.ok ? "" : `<div class="landing-banner"><div class="landing-banner-title">系统未初始化</div><div class="landing-banner-text">缺少关键环境变量：${m.missing.map((S) => Re(S)).join("、")}</div></div>`, h = `<!DOCTYPE html><html lang="zh-CN"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"><link rel="icon" href="/favicon.ico" sizes="any"><title>Emby Proxy V19.3</title>${e.LANDING_PAGE_STYLE_HTML}</head><body><main class="landing-shell"><section class="landing-card"><div class="landing-grid"><div class="landing-primary">${g}<div class="landing-pill">Headless Edge Relay</div><h1 class="landing-title">Emby Proxy V19.3</h1><p class="landing-text">为了极致优化视频代理性能，根路径默认只保留无头中继与说明壳；真正的管理台入口固定收口到 <span class="landing-highlight">${Re(p)}</span>，并由 Worker 读取已上传的 <code>index.html</code> 返回。</p><div class="landing-actions"><a href="${Re(p)}" class="landing-btn landing-btn-primary">访问 ${Re(p)}</a><a href="https://github.com/axuitomo/CF-EMBY-PROXY-UI" target="_blank" rel="noopener noreferrer" class="landing-btn landing-btn-secondary">查看项目说明</a></div></div><div class="landing-side"><div class="landing-notes"><div class="landing-notes-title">Routing Notes</div><ul class="landing-note-list"><li>根路径仅提供静态说明页，不承载实时配置数据。</li><li><code>${Re(p)}</code> 只负责返回管理台壳与 bootstrap，动态数据继续走 <code>POST ${Re(p)}</code> API。</li><li>正式真相源固定为 <code>frontend/</code>、<code>worker.js</code> 与 <code>worker.md</code>。</li><li>媒体代理、日志与 KV / D1 逻辑保持原 Worker 主链路不变。</li></ul></div></div></div></section></main></body></html>`, y = new Headers({
      "Content-Type": "text/html;charset=UTF-8",
      "Cache-Control": "public, max-age=3600, s-maxage=86400"
    });
    return Ce(y), y.set("X-Frame-Options", "DENY"), new Response(h, { headers: y });
  }
  function l(f, m = "/", p = 302) {
    const g = new URL(f.url);
    g.pathname = Q(m || "/"), g.search = "", g.hash = "";
    const h = new Headers({
      Location: g.toString(),
      "Cache-Control": "no-store, max-age=0"
    });
    return Ce(h), new Response(null, {
      status: p,
      headers: h
    });
  }
  async function u(f, m, p = ze(m)) {
    const g = Ze(m), h = So(m), y = Fn(p), S = Br({
      adminPath: g,
      loginPath: h,
      initHealth: p,
      contract: e.buildAdminUiContract()
    }), _ = `<!DOCTYPE html><html lang="zh-CN"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"><link rel="icon" href="/favicon.ico" sizes="any"><title>Worker 管理台登录</title><style>
        :root {
          color-scheme: light;
          font-family: "Segoe UI", "PingFang SC", "Microsoft YaHei", sans-serif;
          --bg-a: #091428;
          --bg-b: #123055;
          --panel: rgba(8, 20, 38, 0.88);
          --panel-border: rgba(148, 163, 184, 0.24);
          --text-main: #e5eefc;
          --text-muted: rgba(226, 232, 240, 0.8);
          --accent: #6ee7f9;
          --accent-strong: #2dd4bf;
          --danger-bg: rgba(248, 113, 113, 0.14);
          --danger-border: rgba(248, 113, 113, 0.3);
          --danger-text: #fecaca;
          --success-bg: rgba(74, 222, 128, 0.12);
          --success-border: rgba(74, 222, 128, 0.28);
          --success-text: #bbf7d0;
        }
        * { box-sizing: border-box; }
        body {
          margin: 0;
          min-height: 100vh;
          color: var(--text-main);
          background:
            radial-gradient(circle at top left, rgba(96, 165, 250, 0.32), transparent 38%),
            radial-gradient(circle at 85% 15%, rgba(45, 212, 191, 0.2), transparent 22%),
            linear-gradient(135deg, var(--bg-a), var(--bg-b));
        }
        a { color: inherit; }
        .login-shell {
          min-height: 100vh;
          display: grid;
          place-items: center;
          padding: 32px 20px;
        }
        .login-card {
          width: min(100%, 960px);
          border-radius: 28px;
          overflow: hidden;
          border: 1px solid var(--panel-border);
          background: var(--panel);
          box-shadow: 0 28px 120px rgba(15, 23, 42, 0.45);
          backdrop-filter: blur(22px);
        }
        .login-grid {
          display: grid;
          grid-template-columns: minmax(0, 1.12fr) minmax(320px, 420px);
        }
        .login-hero {
          padding: 42px 42px 36px;
          border-right: 1px solid rgba(148, 163, 184, 0.18);
        }
        .login-form {
          padding: 42px 32px 36px;
          background: rgba(2, 6, 23, 0.18);
        }
        .eyebrow {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          padding: 8px 14px;
          border-radius: 999px;
          font-size: 12px;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          color: rgba(229, 238, 252, 0.78);
          background: rgba(15, 23, 42, 0.36);
          border: 1px solid rgba(148, 163, 184, 0.18);
        }
        .title {
          margin: 18px 0 12px;
          font-size: clamp(32px, 5vw, 52px);
          line-height: 1.05;
        }
        .subtitle, .hint, .meta-item, .status {
          color: var(--text-muted);
          line-height: 1.7;
        }
        .meta-grid {
          margin-top: 26px;
          display: grid;
          gap: 14px;
          grid-template-columns: repeat(2, minmax(0, 1fr));
        }
        .meta-card {
          padding: 16px 18px;
          border-radius: 20px;
          background: rgba(15, 23, 42, 0.32);
          border: 1px solid rgba(148, 163, 184, 0.14);
        }
        .meta-label {
          font-size: 12px;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          color: rgba(148, 163, 184, 0.88);
        }
        .meta-value {
          margin-top: 8px;
          font-size: 15px;
          color: var(--text-main);
          word-break: break-all;
        }
        .actions {
          margin-top: 26px;
          display: flex;
          flex-wrap: wrap;
          gap: 12px;
        }
        .action-link, .submit-btn {
          border-radius: 999px;
          border: 1px solid rgba(148, 163, 184, 0.22);
          text-decoration: none;
          padding: 12px 18px;
          font-size: 14px;
          font-weight: 600;
          transition: transform 120ms ease, background 120ms ease, border-color 120ms ease;
        }
        .action-link:hover, .submit-btn:hover { transform: translateY(-1px); }
        .action-link.primary, .submit-btn {
          background: linear-gradient(135deg, var(--accent-strong), var(--accent));
          color: #082032;
          border-color: transparent;
        }
        .action-link.secondary {
          background: rgba(15, 23, 42, 0.38);
          color: var(--text-main);
        }
        .form-panel {
          display: grid;
          gap: 18px;
        }
        .form-title {
          margin: 0;
          font-size: 24px;
          line-height: 1.2;
        }
        .field {
          display: grid;
          gap: 10px;
        }
        .field-label {
          font-size: 13px;
          color: rgba(226, 232, 240, 0.82);
        }
        .field-input {
          width: 100%;
          padding: 14px 16px;
          border-radius: 16px;
          border: 1px solid rgba(148, 163, 184, 0.2);
          background: rgba(15, 23, 42, 0.58);
          color: var(--text-main);
          font-size: 15px;
          outline: none;
        }
        .field-input:focus {
          border-color: rgba(110, 231, 249, 0.72);
          box-shadow: 0 0 0 4px rgba(110, 231, 249, 0.14);
        }
        .submit-btn {
          width: 100%;
          cursor: pointer;
        }
        .submit-btn[disabled] {
          cursor: wait;
          opacity: 0.72;
          transform: none;
        }
        .status {
          min-height: 48px;
          padding: 12px 14px;
          border-radius: 16px;
          border: 1px solid rgba(148, 163, 184, 0.14);
          background: rgba(15, 23, 42, 0.36);
          font-size: 14px;
        }
        .status.is-error {
          color: var(--danger-text);
          background: var(--danger-bg);
          border-color: var(--danger-border);
        }
        .status.is-success {
          color: var(--success-text);
          background: var(--success-bg);
          border-color: var(--success-border);
        }
        .hint {
          font-size: 13px;
          margin: 0;
        }
        .noscript {
          margin-top: 18px;
          padding: 14px 16px;
          border-radius: 16px;
          border: 1px solid var(--danger-border);
          background: var(--danger-bg);
          color: var(--danger-text);
          font-size: 13px;
          line-height: 1.7;
        }
        @media (max-width: 860px) {
          .login-grid { grid-template-columns: 1fr; }
          .login-hero { border-right: none; border-bottom: 1px solid rgba(148, 163, 184, 0.18); padding: 34px 24px 24px; }
          .login-form { padding: 28px 24px 30px; }
          .meta-grid { grid-template-columns: 1fr; }
        }
      </style></head><body><main class="login-shell"><section class="login-card"><div>${y}</div><div class="login-grid"><section class="login-hero"><div class="eyebrow">Worker Admin Access</div><h1 class="title">登录管理台壳层</h1><p class="subtitle">这个入口只负责建立 Worker 的同源登录态。登录成功后会直接返回主控制台，后续的节点治理、日志诊断、DNS/IP 池与发布操作继续复用同一份 Cookie。</p><div class="meta-grid"><article class="meta-card"><div class="meta-label">Admin Path</div><div class="meta-value">${Re(g)}</div></article><article class="meta-card"><div class="meta-label">Login Endpoint</div><div class="meta-value">POST ${Re(h)}</div></article><article class="meta-card"><div class="meta-label">Init Health</div><div class="meta-value">${p.ok ? "已通过" : `未通过：${Re((Array.isArray(p.missing) ? p.missing : []).join(" / ") || "请检查环境变量")}`}</div></article><article class="meta-card"><div class="meta-label">Current Mode</div><div class="meta-value">独立登录壳，不再复用 /admin 远端 shell</div></article></div><div class="actions"><a href="${Re(g)}" class="action-link secondary">返回管理台</a><a href="/" class="action-link primary">回到根路径说明页</a></div></section><section class="login-form"><form id="admin-login-form" class="form-panel" action="${Re(h)}" method="post" novalidate><div><p class="form-title">输入管理密码</p><p class="hint">页面会继续调用已有的 <code>POST ${Re(h)}</code> JSON 登录接口，不会新增第二套鉴权协议。</p></div><label class="field" for="admin-login-password"><span class="field-label">管理密码</span><input id="admin-login-password" name="password" type="password" class="field-input" autocomplete="current-password" placeholder="请输入 ADMIN_PASS" required /></label><button id="admin-login-submit" type="submit" class="submit-btn">登录并进入控制台</button><div id="admin-login-status" class="status" role="status" aria-live="polite">等待输入密码。登录成功后会跳转到 ${Re(g)}。</div></form><noscript><div class="noscript">当前登录壳需要浏览器启用 JavaScript，因为 Worker 现阶段继续复用原有 JSON 登录接口来写入 Cookie。</div></noscript></section></div></section></main><script>
        const ADMIN_LOGIN_RUNTIME = ${S};
        const form = document.getElementById("admin-login-form");
        const passwordInput = document.getElementById("admin-login-password");
        const submitButton = document.getElementById("admin-login-submit");
        const statusNode = document.getElementById("admin-login-status");

        function updateStatus(message, tone) {
          if (!statusNode) return;
          statusNode.textContent = message || "";
          statusNode.classList.remove("is-error", "is-success");
          if (tone === "error") statusNode.classList.add("is-error");
          if (tone === "success") statusNode.classList.add("is-success");
        }

        form?.addEventListener("submit", async (event) => {
          event.preventDefault();
          const password = String(passwordInput?.value || "");
          if (!password) {
            updateStatus("请输入管理密码。", "error");
            passwordInput?.focus();
            return;
          }
          if (submitButton) submitButton.disabled = true;
          updateStatus("正在验证密码并建立 Cookie 会话...", "");
          try {
            const response = await fetch(ADMIN_LOGIN_RUNTIME.loginPath, {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                "Accept": "application/json"
              },
              credentials: "same-origin",
              body: JSON.stringify({ password })
            });
            const payload = await response.json().catch(() => ({}));
            if (response.ok && payload && payload.ok === true) {
              updateStatus("登录成功，正在进入控制台...", "success");
              void fetch((ADMIN_LOGIN_RUNTIME.adminPath || "/admin").replace(/\\/+$/, "") + "/__warm", {
                method: "HEAD",
                credentials: "same-origin",
                cache: "no-store",
                keepalive: true
              }).catch(() => null);
              window.location.assign(ADMIN_LOGIN_RUNTIME.adminPath || "/admin");
              return;
            }
            const baseErrorMessage = payload?.error?.message || payload?.message || (response.status ? ("登录失败（HTTP " + response.status + "）") : "登录失败");
            const remainingAttempts = Number.isFinite(Number(payload?.remain))
              ? Math.max(0, Number(payload.remain))
              : null;
            const errorMessage = remainingAttempts === null
              ? baseErrorMessage
              : remainingAttempts > 0
                ? baseErrorMessage + "，还可尝试 " + remainingAttempts + " 次。"
                : baseErrorMessage + "，已达到失败次数上限，请稍后重试。";
            updateStatus(errorMessage, "error");
          } catch (error) {
            updateStatus(error?.message ? ("登录请求失败：" + error.message) : "登录请求失败，请稍后重试。", "error");
          } finally {
            if (submitButton) submitButton.disabled = false;
          }
        });

        passwordInput?.focus();
      <\/script></body></html>`;
    return new Response(f?.method === "HEAD" ? null : _, { headers: e.buildAdminHtmlResponseHeaders("", "no-store, max-age=0") });
  }
  function d(f, m, p = 200, g = {}) {
    const h = new Headers(f);
    return Ce(h), g.mergeOriginVary === !0 && h.get("Access-Control-Allow-Origin") !== "*" && Or(h, "Origin"), new Response(m, {
      status: p,
      headers: h
    });
  }
  return {
    renderAdminPage: t,
    warmAdminReleaseVendorEntries: r,
    buildAdminWarmSubrequest: o,
    isAdminWarmResponseSuccessful: s,
    renderAdminWarmResponse: i,
    renderLandingPage: c,
    buildRequestPathRedirectResponse: l,
    renderAdminLoginPage: u,
    buildEdgeCorsResponse: d
  };
}
function Ao(n = "") {
  return /(?:^|\/)smartstrm(?:$|[/?])/i.test(String(n || ""));
}
function da(n = "") {
  return Ba(n) || /\/audio\/[^/]+(?:\/|$)/i.test(String(n || "")) || /\/livetv\/[^/]+(?:\/|$)/i.test(String(n || "")) || Ao(n);
}
function Nd(n = "") {
  const e = String(n || "").trim();
  return /^[a-z][a-z0-9+.-]*:/i.test(e) || e.startsWith("//");
}
function Ki(n = "") {
  return /\/playbackinfo(?:$|[/?])/i.test(String(n || ""));
}
function Ba(n = "") {
  const e = Q(n);
  return Ki(e) || Ao(e) || mt.test(e) || ci.test(e) ? !0 : /\/videos\/[^/]+\/(?:stream|original|download|file)\b/i.test(e) || /\/items\/[^/]+\/download\b/i.test(e);
}
function zi(n = "") {
  return /\/sessions\/playing\/progress(?:$|[/?])/i.test(String(n || ""));
}
function $i(n = "") {
  return /\/sessions\/playing\/stopped(?:$|[/?])/i.test(String(n || ""));
}
function Ld(n = "") {
  return /\/sessions\/playing\/ping(?:$|[/?])/i.test(String(n || ""));
}
function Md(n = "") {
  const e = String(n || "");
  return zi(e) || $i(e) || Ld(e) ? !1 : /\/sessions\/playing(?:\/started)?(?:$|[/?])/i.test(e);
}
function Id(n = {}, e = {}) {
  function a(t, r) {
    let o = r;
    const s = wt(t[o]);
    let i = Ai(s) === "main" ? "/" + s : "";
    for (o += 1; o < t.length; o += 1) i += "/" + wt(t[o]);
    return Ba(i || "/");
  }
  return { isPlaybackCriticalSegments: a };
}
function Pd(n = {}) {
  const e = {};
  for (const [a, t] of Object.entries(Su(n, e))) e[a] = t;
  for (const [a, t] of Object.entries(_u(n, e))) e[a] = t;
  for (const [a, t] of Object.entries(Ru(n, e))) e[a] = t;
  for (const [a, t] of Object.entries(Eu(n, e))) e[a] = t;
  for (const [a, t] of Object.entries(Dd(n, e))) e[a] = t;
  for (const [a, t] of Object.entries(Id(n, e))) e[a] = t;
  return e;
}
function Wa(n) {
  if (!n || n === 0) return "0 B";
  const e = 1024, a = [
    "B",
    "KB",
    "MB",
    "GB",
    "TB"
  ], t = Math.floor(Math.log(n) / Math.log(e));
  return parseFloat((n / Math.pow(e, t)).toFixed(2)) + " " + a[t];
}
var Bi = 1024 * 1024 * 1024, xd = 500 * 1024 * 1024, Od = 10 * 1024 * 1024 * 1024, Co = Object.freeze({
  planClass: "free",
  planLabel: "FREE",
  periodLabel: "今日",
  kv: {
    read: 1e5,
    write: 1e3,
    delete: 1e3,
    list: 1e3,
    storageBytes: Bi
  },
  d1: {
    rowsRead: 5e6,
    rowsWritten: 1e5,
    storageBytes: xd
  }
}), Wi = Object.freeze({
  planClass: "paid",
  planLabel: "PAID",
  periodLabel: "本月",
  kv: {
    read: 1e7,
    write: 1e6,
    delete: 1e6,
    list: 1e6,
    storageBytes: Bi
  },
  d1: {
    rowsRead: 25e9,
    rowsWritten: 5e7,
    storageBytes: Od
  }
}), vd = Object.freeze({
  free: Co,
  paid: Wi
});
function ye(n) {
  const e = Number(n);
  return Number.isFinite(e) ? Math.max(0, Math.round(e)).toLocaleString("en-US") : "0";
}
function fa(n) {
  const e = Number(n);
  return !Number.isFinite(e) || e <= 0 ? 0 : e >= 100 ? 100 : Math.max(0, Math.round(e * 10) / 10);
}
function Fd(n = 0) {
  const e = Number(n);
  return !Number.isFinite(e) || e <= 0 ? "slate" : e >= 90 ? "danger" : e >= 70 ? "warning" : "success";
}
function ma(n = "") {
  return String(n || "").trim().toLowerCase() || "bundled";
}
function Vi(n = "") {
  const e = ma(n);
  return e === "standard" || e === "unbound" ? {
    ...Wi,
    usageModel: e
  } : {
    ...Co,
    usageModel: e
  };
}
function $n(n = {}) {
  const e = Ro(n?.override);
  return e ? {
    ...pa(e),
    usageModel: ma(n?.usageModel),
    override: e
  } : {
    ...Vi(n?.usageModel),
    override: ""
  };
}
function pa(n = "free") {
  return vd[String(n || "").trim().toLowerCase() === "paid" ? "paid" : "free"] || Co;
}
async function Ud(n = {}) {
  const e = te(F(n) ? n : {}), a = Ro(e.cfQuotaPlanOverride);
  if (a) return $n({ override: a });
  const t = String(e.cfAccountId || "").trim(), r = String(e.cfApiToken || "").trim();
  if (!t || !r) return {
    ...pa("free"),
    usageModel: ma("bundled"),
    override: ""
  };
  try {
    return $n({ usageModel: await Yi(t, r) });
  } catch {
    return {
      ...pa("free"),
      usageModel: ma("bundled"),
      override: ""
    };
  }
}
function Hd(n = {}) {
  const e = F(n) ? n : {}, a = Math.max(1, Math.floor(Number(e.writeLimit) || 0)), t = Math.max(0, Math.floor(Number(e.estimatedPutCount) || 0)), r = Math.max(0, Math.floor(Number(e.estimatedRollbackWriteCount) || 0)), o = Math.max(0, Math.floor(Number(e.estimatedWorstCaseWriteCount) || 0)), s = Math.max(0, o - a), i = String(e.planLabel || "").trim() || "FREE", c = String(e.periodLabel || "").trim() || "今日";
  return o <= a ? "" : `KV 整理已拦截：当前 ${i} 计划 · ${c} 写入上限为 ${ye(a)}，本次预计写入 ${ye(t)} 次，最坏回滚写回 ${ye(r)} 次，最坏共 ${ye(o)} 次，超出 ${ye(s)} 次。`;
}
function kd(n = {}) {
  const e = F(n) ? n : {}, a = String(e.planLabel || "").trim() || "FREE", t = String(e.periodLabel || "").trim() || "今日", r = Math.max(1, Math.floor(Number(e.writeLimit) || 0)), o = Math.max(0, Math.floor(Number(e.estimatedPutCount) || 0)), s = Math.max(0, Math.floor(Number(e.estimatedDeleteCount) || 0)), i = Math.max(0, Math.floor(Number(e.estimatedRollbackWriteCount) || 0)), c = Math.max(0, Math.floor(Number(e.estimatedWorstCaseWriteCount) || 0));
  return `KV 配额预算：${a} 计划 · ${t}，预计 put ${ye(o)} 次，delete ${ye(s)} 次，最坏回滚写回 ${ye(i)} 次，最坏写入 ${ye(c)} / ${ye(r)}。`;
}
function Kd(n = "free", e = /* @__PURE__ */ new Date()) {
  const a = String(n || "").trim().toLowerCase() === "paid" ? "paid" : "free", t = e instanceof Date ? new Date(e.getTime()) : new Date(e || Date.now()), r = t.toISOString();
  if (a === "paid") {
    const i = new Date(Date.UTC(t.getUTCFullYear(), t.getUTCMonth(), 1, 0, 0, 0, 0)), c = new Date(Date.UTC(t.getUTCFullYear(), t.getUTCMonth() + 1, 1, 0, 0, 0, 0));
    return {
      planClass: a,
      periodLabel: "本月",
      startIso: i.toISOString(),
      endIso: r,
      resetAtIso: c.toISOString(),
      cacheBucketKey: `${t.getUTCFullYear()}-${String(t.getUTCMonth() + 1).padStart(2, "0")}`
    };
  }
  const o = new Date(Date.UTC(t.getUTCFullYear(), t.getUTCMonth(), t.getUTCDate(), 0, 0, 0, 0)), s = new Date(Date.UTC(t.getUTCFullYear(), t.getUTCMonth(), t.getUTCDate() + 1, 0, 0, 0, 0));
  return {
    planClass: a,
    periodLabel: "今日",
    startIso: o.toISOString(),
    endIso: r,
    resetAtIso: s.toISOString(),
    cacheBucketKey: o.toISOString().slice(0, 10)
  };
}
function Ft(n, e = "cloudflare_runtime_error") {
  return String(n?.message || n || e).trim().replace(/\s+/g, " ").slice(0, 240) || e;
}
function Zo(n, e = "count") {
  return e === "bytes" ? Wa(Math.max(0, Number(n) || 0)) : ye(n);
}
function es(n = 0, e = k()) {
  const a = Math.max(0, Number(n) || 0), t = Math.max(a, Number(e) || k());
  if (a <= 0) return "";
  const r = Math.max(0, t - a);
  return r < 60 * 1e3 ? "缓存年龄：不到 1 分钟" : r < 3600 * 1e3 ? `缓存年龄：${Math.max(1, Math.round(r / (60 * 1e3)))} 分钟` : `缓存年龄：${Math.max(1, Math.round(r / (3600 * 1e3)))} 小时`;
}
function _r({ key: n = "", label: e = "", used: a = 0, limit: t = 0, kind: r = "count" } = {}) {
  const o = Math.max(0, Number(a) || 0), s = Math.max(0, Number(t) || 0), i = s > 0 ? o / s * 100 : 0, c = fa(i);
  return {
    key: String(n || "").trim(),
    label: String(e || "").trim(),
    usedValue: o,
    limitValue: s,
    usedText: Zo(o, r),
    limitText: Zo(s, r),
    percent: c,
    percentText: `${c % 1 === 0 ? Math.round(c) : c}%`,
    tone: Fd(i),
    rawPercent: i
  };
}
function ts(n = []) {
  return (Array.isArray(n) ? n : []).filter((e) => Number(e?.rawPercent) > 100).map((e) => String(e?.label || "").trim()).filter(Boolean);
}
function Va(n = {}, e = {}) {
  const a = (Array.isArray(n.metrics) ? n.metrics : []).map((t) => ({
    key: String(t?.key || "").trim(),
    label: String(t?.label || "").trim(),
    usedText: String(t?.usedText || "").trim(),
    limitText: String(t?.limitText || "").trim(),
    percent: fa(t?.percent),
    percentText: String(t?.percentText || `${fa(t?.percent)}%`).trim(),
    tone: String(t?.tone || "slate").trim() || "slate"
  })).filter((t) => t.key && t.label);
  return {
    title: String(n.title || e.title || "Cloudflare").trim() || "Cloudflare",
    status: String(n.status || e.status || "idle").trim() || "idle",
    summary: String(n.summary || e.summary || "暂无运行记录").trim() || "暂无运行记录",
    detail: String(n.detail || e.detail || "").trim(),
    lines: (Array.isArray(n.lines) ? n.lines : Array.isArray(e.lines) ? e.lines : []).map((t) => String(t || "").trim()).filter(Boolean),
    planLabel: String(n.planLabel || e.planLabel || "").trim(),
    periodLabel: String(n.periodLabel || e.periodLabel || "").trim(),
    resourceLabel: String(n.resourceLabel || e.resourceLabel || "").trim(),
    metrics: a
  };
}
function br(n = "", e = "", a = "") {
  return Va({
    title: n,
    status: "skipped",
    summary: e,
    detail: a
  });
}
function Rr(n = "", e = "", a = "") {
  return Va({
    title: n,
    status: "failed",
    summary: e,
    detail: a
  });
}
function zd(n = "", e = {}, a = 0, t = []) {
  const r = Math.max(1, Math.min(100, Math.round(Number(a) || 0))), o = e && typeof e == "object" ? e : {}, s = (Array.isArray(t) ? t : []).map((p) => ({
    label: String(p?.label || "").trim(),
    percentText: String(p?.percentText || `${fa(p?.percent)}%`).trim()
  })).filter((p) => p.label), i = String(o.resourceLabel || "").trim() || String(n || "").trim(), c = String(o.planLabel || "").trim(), l = String(o.periodLabel || "").trim(), u = [i], d = [c, l].filter(Boolean);
  d.length > 0 && u.push(`（${d.join(" / ")}）`);
  const f = s.map((p) => `${p.label} ${p.percentText}`).join("、"), m = String(o.status || "").trim().toLowerCase() === "partial_failure" ? "（使用缓存数据）" : "";
  return `${String(n || "Cloudflare").trim() || "Cloudflare"} 使用量达到阈值：${u.join("")}，${f}（阈值 ${r}%）${m}`;
}
function Cn(n = [], e = []) {
  const a = new Set((Array.isArray(e) ? e : [e]).map((t) => String(t || "").trim()).filter(Boolean));
  for (const t of Array.isArray(n) ? n : []) {
    const r = String(t?.key || "").trim();
    if (!a.has(r)) continue;
    const o = String(t?.percentText || "").trim();
    if (o) return o;
    if (t?.percent !== void 0 && t?.percent !== null) return `${fa(t.percent)}%`;
  }
  return "暂不可用";
}
function $d(n = {}, e = {}) {
  const a = n && typeof n == "object" ? n : {}, t = e && typeof e == "object" ? e : {}, r = String(a.requestCountDisplay || "").trim() || (a.todayRequests === null || a.todayRequests === void 0 ? "暂不可用" : String(Number(a.todayRequests) || 0)), o = String(a.todayTraffic || "").trim() || "暂不可用", s = String(a.monthlyTraffic || "").trim() || "暂不可用", i = Math.max(0, Number(a.playCount) || 0), c = Math.max(0, Number(a.infoCount) || 0);
  return [
    `📊 EMBY-PROXY每日报表${t.dateKey ? ` (${t.dateKey})` : ""}`,
    "",
    `请求数: ${r}`,
    `视频流量 (CF 总计): ${o}`,
    `本月流量 (CF 总计): ${s}`,
    `请求: 播放请求 ${ye(i)} 次 | 获取播放信息 ${ye(c)} 次`,
    "#Cloudflare #Emby #日报"
  ].map((l) => String(l || "").trim()).filter((l, u, d) => !(l === "" && (u === 0 || d[u - 1] === ""))).join(`
`);
}
function Bd(n = "", e = {}, a = {}) {
  const t = hi(n);
  if (t === "summary") return $d(e, a);
  const r = t === "d1" ? "d1" : "kv", o = e && typeof e == "object" ? e : {}, s = a && typeof a == "object" ? a : {}, i = r === "d1" ? "D1 数据库每日消耗报告" : "KV 数据库每日消耗报告", c = r === "d1" ? "#D1" : "#KV", l = Array.isArray(o.metrics) ? o.metrics : [], u = s.dateKey ? ` (${s.dateKey})` : "", d = String(o.planLabel || "").trim(), f = String(o.periodLabel || "").trim(), m = d || f ? `${d || "未知"} 计划 X ${f || "当前"}配额` : String(o.summary || "").trim() || "暂不可用", p = Cn(l, r === "d1" ? ["rowsRead", "read"] : ["read", "rowsRead"]), g = Cn(l, r === "d1" ? ["rowsWritten", "write"] : ["write", "rowsWritten"]), h = Cn(l, ["storage"]);
  return [
    `📊 ${i}${u}`,
    `配额口径：${m}`,
    `读取使用率：${p}`,
    `写入使用率：${g}`,
    `存储使用率：${h}`,
    `#Cloudflare ${c} #日报`
  ].map((y) => String(y || "").trim()).filter((y, S, _) => !(y === "" && (S === 0 || _[S - 1] === ""))).join(`
`);
}
function rs(n = null, e = "") {
  const a = (Array.isArray(n?.errors) ? n.errors : []).map((r) => {
    const o = String(r?.code || "").trim(), s = String(r?.message || "").trim();
    return o && s ? `${o}: ${s}` : s || o;
  }).filter(Boolean);
  if (a.length > 0) return a.join("; ");
  const t = String(e || "").trim();
  return t ? t.replace(/\s+/g, " ").slice(0, 300) : "";
}
async function be(n, e, a = {}) {
  const t = a && typeof a == "object" ? a : {};
  let r = {};
  const o = t?.headers;
  o && (o instanceof Headers ? r = Object.fromEntries(o.entries()) : typeof o == "object" && (r = o));
  const s = typeof FormData < "u" && t?.body instanceof FormData, i = await Oe(n, {
    ...t,
    headers: {
      Authorization: `Bearer ${e}`,
      ...s ? {} : { "Content-Type": "application/json" },
      ...r
    }
  }), c = await xe(i, Os);
  if (c.exceeded) throw new Error("cf_api_response_too_large");
  const l = c.text;
  let u = null;
  if (l) try {
    u = JSON.parse(l);
  } catch {
  }
  if (!i.ok) {
    const d = Number(i.status) || 0, f = rs(u, l), m = /* @__PURE__ */ new Error(f ? `cf_api_http_${d}: ${f}` : `cf_api_http_${d}`);
    throw m.status = d, m;
  }
  if (!u || typeof u != "object") return {};
  if (u?.success === !1) {
    const d = rs(u, l);
    throw new Error(d || "cf_api_error");
  }
  return u;
}
async function Gi(n, e, a) {
  const t = a && typeof a == "object" ? {
    query: e,
    variables: a
  } : { query: e }, r = await Oe("https://api.cloudflare.com/client/v4/graphql", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${n}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify(t)
  });
  if (!r.ok) throw new Error(`cf_graphql_http_${r.status}`);
  const o = await xe(r, Os);
  if (o.exceeded) throw new Error("cf_graphql_response_too_large");
  const s = JSON.parse(o.text);
  if (Array.isArray(s?.errors) && s.errors.length) throw new Error(s.errors.map((i) => i?.message).filter(Boolean).join("; ") || "cf_graphql_error");
  return s;
}
async function ji(n, e, a, t) {
  return (await Gi(e, a, t))?.data?.viewer?.zones?.[0] || null;
}
async function mn(n, e, a, t) {
  return (await Gi(e, a, t))?.data?.viewer?.accounts?.[0] || null;
}
async function qi(n, e) {
  return !n || !e ? null : (await be(`https://api.cloudflare.com/client/v4/zones/${encodeURIComponent(String(n).trim())}`, e))?.result || null;
}
async function Xi(n, e, a = {}) {
  const t = String(n || "").trim();
  return await ge(qi(t, e), String(a?.scope || "cloudflare.zone_lookup"), {
    zoneId: t,
    ...F(a?.context) ? a.context : {}
  }, null);
}
async function To(n, e, a = {}) {
  const t = await qi(n, e), r = String(t?.name || "").trim();
  if (t && r) return t;
  const o = /* @__PURE__ */ new Error("cf_zone_context_missing");
  throw o.code = "CF_ZONE_CONTEXT_MISSING", o.status = 400, o.details = {
    zoneId: String(n || "").trim(),
    scope: String(a?.scope || "").trim()
  }, o;
}
async function Yi(n, e) {
  const a = String(n || "").trim(), t = String(e || "").trim();
  return !a || !t ? "" : ma((await be(`https://api.cloudflare.com/client/v4/accounts/${encodeURIComponent(a)}/workers/account-settings`, t))?.result?.default_usage_model);
}
async function Wd(n, e, a) {
  const t = String(n || "").trim(), r = String(e || "").trim(), o = String(a || "").trim();
  return !t || !r || !o ? null : (await be(`https://api.cloudflare.com/client/v4/accounts/${encodeURIComponent(t)}/storage/kv/namespaces/${encodeURIComponent(r)}`, o))?.result || null;
}
async function as(n, e, a) {
  const t = String(n || "").trim(), r = String(e || "").trim(), o = String(a || "").trim();
  return !t || !r || !o ? null : (await be(`https://api.cloudflare.com/client/v4/accounts/${encodeURIComponent(t)}/d1/database/${encodeURIComponent(r)}`, o))?.result || null;
}
async function Vd({ accountId: n, apiToken: e, namespaceId: a, startIso: t, endIso: r }) {
  const o = String(n || "").trim(), s = String(e || "").trim(), i = String(a || "").trim();
  if (!o || !s || !i) return null;
  const c = await mn(o, s, `
    query {
      viewer {
        accounts(filter: { accountTag: ${_e(o)} }) {
          kvOperationsAdaptiveGroups(
            limit: 1000
            filter: {
              namespaceId: ${_e(i)}
              datetime_geq: ${_e(String(t || "").trim())}
              datetime_leq: ${_e(String(r || "").trim())}
            }
          ) {
            dimensions { actionType }
            sum { requests }
          }
          kvStorageAdaptiveGroups(
            limit: 1000
            filter: {
              namespaceId: ${_e(i)}
              datetime_geq: ${_e(String(t || "").trim())}
              datetime_leq: ${_e(String(r || "").trim())}
            }
          ) {
            max { byteCount }
          }
        }
      }
    }`);
  if (!c) throw new Error("cf_graphql_empty_account");
  const l = Array.isArray(c?.kvOperationsAdaptiveGroups) ? c.kvOperationsAdaptiveGroups : [], u = Array.isArray(c?.kvStorageAdaptiveGroups) ? c.kvStorageAdaptiveGroups : [], d = {
    readCount: 0,
    writeCount: 0,
    deleteCount: 0,
    listCount: 0,
    storageBytes: 0
  };
  for (const f of l) {
    const m = String(f?.dimensions?.actionType || "").trim().toLowerCase(), p = Math.max(0, Number(f?.sum?.requests) || 0);
    m === "read" ? d.readCount += p : m === "write" ? d.writeCount += p : m === "delete" ? d.deleteCount += p : m === "list" && (d.listCount += p);
  }
  for (const f of u) d.storageBytes = Math.max(d.storageBytes, Math.max(0, Number(f?.max?.byteCount) || 0));
  return d;
}
async function Gd({ accountId: n, apiToken: e, databaseId: a, startIso: t, endIso: r }) {
  const o = String(n || "").trim(), s = String(e || "").trim(), i = String(a || "").trim();
  if (!o || !s || !i) return null;
  const c = await mn(o, s, `
    query {
      viewer {
        accounts(filter: { accountTag: ${_e(o)} }) {
          d1AnalyticsAdaptiveGroups(
            limit: 1000
            filter: {
              databaseId: ${_e(i)}
              datetime_geq: ${_e(String(t || "").trim())}
              datetime_leq: ${_e(String(r || "").trim())}
            }
          ) {
            sum { rowsRead rowsWritten readQueries writeQueries }
          }
        }
      }
    }`);
  if (!c) throw new Error("cf_graphql_empty_account");
  return (Array.isArray(c?.d1AnalyticsAdaptiveGroups) ? c.d1AnalyticsAdaptiveGroups : []).reduce((l, u) => ({
    rowsRead: l.rowsRead + Math.max(0, Number(u?.sum?.rowsRead) || 0),
    rowsWritten: l.rowsWritten + Math.max(0, Number(u?.sum?.rowsWritten) || 0),
    readQueries: l.readQueries + Math.max(0, Number(u?.sum?.readQueries) || 0),
    writeQueries: l.writeQueries + Math.max(0, Number(u?.sum?.writeQueries) || 0)
  }), {
    rowsRead: 0,
    rowsWritten: 0,
    readQueries: 0,
    writeQueries: 0
  });
}
async function jd({ accountId: n, apiToken: e, databaseId: a, startIso: t, endIso: r, utcOffsetMinutes: o = O.Defaults.ScheduleUtcOffsetMinutes }) {
  const s = String(n || "").trim(), i = String(e || "").trim(), c = String(a || "").trim();
  if (!s || !i || !c) return [];
  const l = await mn(s, i, `
    query {
      viewer {
        accounts(filter: { accountTag: ${_e(s)} }) {
          d1AnalyticsAdaptiveGroups(
            limit: 10000
            filter: {
              databaseId: ${_e(c)}
              datetime_geq: ${_e(String(t || "").trim())}
              datetime_leq: ${_e(String(r || "").trim())}
            }
          ) {
            dimensions { datetimeHour }
            sum { rowsWritten writeQueries }
          }
        }
      }
    }`);
  if (!l) throw new Error("cf_graphql_empty_account");
  const u = Array.isArray(l?.d1AnalyticsAdaptiveGroups) ? l.d1AnalyticsAdaptiveGroups : [], d = /* @__PURE__ */ new Map();
  for (const f of u) {
    const m = String(f?.dimensions?.datetimeHour || "").trim();
    if (!m) continue;
    const p = Date.parse(m);
    if (!Number.isFinite(p)) continue;
    const g = Wt(new Date(p), o), h = `${g.dateKey}:${g.hour}`, y = d.get(h) || {
      dateKey: g.dateKey,
      hour: g.hour,
      rowsWritten: 0,
      writeQueries: 0
    };
    y.rowsWritten += Math.max(0, Number(f?.sum?.rowsWritten) || 0), y.writeQueries += Math.max(0, Number(f?.sum?.writeQueries) || 0), d.set(h, y);
  }
  return [...d.values()].sort((f, m) => f.dateKey !== m.dateKey ? String(f.dateKey).localeCompare(String(m.dateKey)) : Number(f.hour) - Number(m.hour));
}
async function qd({ cfAccountId: n, cfZoneId: e, cfApiToken: a, startIso: t, endIso: r, utcOffsetMinutes: o = O.Defaults.ScheduleUtcOffsetMinutes }) {
  if (!n || !a) return null;
  const s = await mn(n, a, `
  query {
    viewer {
      accounts(filter: { accountTag: ${_e(n)} }) {
        workersInvocationsAdaptive(limit: 10000, filter: { datetime_geq: ${_e(t)}, datetime_leq: ${_e(r)} }) {
          dimensions { datetime scriptName status }
          sum { requests }
        }
      }
    }
  }`), i = Array.isArray(s?.workersInvocationsAdaptive) ? s.workersInvocationsAdaptive : [], c = Array.from({ length: 24 }, (u, d) => ({
    label: String(d).padStart(2, "0") + ":00",
    total: 0
  }));
  let l = 0;
  for (const u of i) {
    const d = Number(u?.sum?.requests) || 0;
    l += d;
    const f = u?.dimensions?.datetime;
    if (!f) continue;
    const m = new Date(f);
    if (Number.isNaN(m.getTime())) continue;
    const p = Wt(m, o).hour;
    c[p] && (c[p].total += d);
  }
  return {
    totalRequests: l,
    hourlySeries: c
  };
}
async function Xd({ cfAccountId: n, cfZoneId: e, cfApiToken: a, zoneNameFallback: t = "" }) {
  const r = [], o = (s, i = {}) => {
    const c = eo(s);
    if (!c) return;
    const l = i.wildcard === !0 || c.wildcard === !0;
    r.push({
      hostname: c.hostname,
      path: String(i.path || ""),
      wildcard: l,
      score: po(c.hostname, {
        wildcard: l,
        path: i.path || ""
      })
    });
  };
  if (n && e) try {
    const s = await be(`https://api.cloudflare.com/client/v4/accounts/${encodeURIComponent(String(n).trim())}/workers/domains?zone_id=${encodeURIComponent(String(e).trim())}`, a);
    for (const i of s?.result || []) o(i?.hostname);
  } catch (s) {
    console.log("CF Workers domains lookup failed, will try routes", s);
  }
  if (!r.length && e) try {
    let s = 1, i = 1;
    do {
      const c = await be(`https://api.cloudflare.com/client/v4/zones/${encodeURIComponent(String(e).trim())}/workers/routes?page=${s}&per_page=100`, a);
      i = Number(c?.result_info?.total_pages || c?.result_info?.totalPages || 1);
      for (const l of c?.result || []) {
        const u = Xs(l?.pattern);
        u && o(u.hostname, {
          wildcard: u.wildcard,
          path: u.path
        });
      }
      s += 1;
    } while (s <= i && s <= 5);
  } catch (s) {
    console.log("CF Workers routes lookup failed", s);
  }
  return r.length ? (r.sort((s, i) => i.score - s.score || s.hostname.length - i.hostname.length || s.hostname.localeCompare(i.hostname)), r[0].hostname) : t || "未知域名 (请配置 CF 联动)";
}
function Vt(n = "") {
  const e = String(n || "").trim();
  return /^[a-z0-9_][a-z0-9-_]*$/i.test(e) ? e : "";
}
function pn(n) {
  if (n !== void 0)
    try {
      return JSON.parse(JSON.stringify(n));
    } catch {
      return null;
    }
}
function He(n, e = [], a = {}) {
  if (typeof n == "string") return String(n).trim();
  if (!n || typeof n != "object") return "";
  const t = Array.isArray(e) ? e : [], r = [
    "id",
    "value",
    "name",
    "region",
    "provider",
    "providerId",
    "hostname",
    "host"
  ], o = t.length ? t : r, s = a?.allowFallback !== !1, i = [o];
  s && t.length && i.push(r);
  const c = /* @__PURE__ */ new Set();
  for (const l of i) for (const u of l) {
    if (c.has(u)) continue;
    c.add(u);
    const d = n?.[u];
    if (typeof d == "string" && d.trim()) return d.trim();
    if (!(!d || typeof d != "object"))
      for (const f of l) {
        const m = d?.[f];
        if (typeof m == "string" && m.trim()) return m.trim();
      }
  }
  return "";
}
function Yd(n = "") {
  const e = String(n || "").trim().toLowerCase();
  return e ? e === "aws" ? "AWS" : e === "gcp" || e === "google" ? "GCP" : e === "azure" ? "Azure" : e.toUpperCase() : "";
}
function Jd(n = "", e = "") {
  const a = String(n || "").trim().toLowerCase().replace(/_/g, "-"), t = String(e || "").trim().toLowerCase(), r = `${t}:${a}`;
  if (!a && !t) return {
    key: "other",
    label: "其他",
    sortOrder: 9
  };
  const o = (s = []) => s.some((i) => r.includes(String(i || "").trim().toLowerCase()));
  return o([
    "wnam",
    "enam",
    "americas",
    "latam",
    "northamerica",
    "southamerica",
    "canada",
    "brazil",
    "mexico",
    "chile",
    "argentina",
    "eastus",
    "westus",
    "centralus",
    "northcentralus",
    "southcentralus",
    "us-east",
    "us-west",
    "us-central",
    "us-south",
    "ca-central",
    "ca-east",
    "sa-east",
    "na-",
    "sa-",
    "us-",
    "ca-"
  ]) ? {
    key: "americas",
    label: "美洲",
    sortOrder: 0
  } : o([
    "apac",
    "asia",
    "ap-",
    "australia",
    "japan",
    "korea",
    "singapore",
    "taiwan",
    "hongkong",
    "india",
    "jakarta",
    "sydney",
    "melbourne",
    "tokyo",
    "osaka",
    "seoul",
    "mumbai",
    "delhi",
    "perth",
    "newzealand"
  ]) ? {
    key: "asia-pacific",
    label: "亚太",
    sortOrder: 1
  } : o([
    "weur",
    "eeur",
    "europe",
    "eu-",
    "france",
    "germany",
    "italy",
    "spain",
    "poland",
    "sweden",
    "norway",
    "switzerland",
    "netherlands",
    "belgium",
    "ireland",
    "westeurope",
    "northeurope",
    "finland",
    "uk",
    "london"
  ]) ? {
    key: "europe",
    label: "欧洲",
    sortOrder: 2
  } : o([
    "mea",
    "middleeast",
    "me-",
    "af-",
    "africa",
    "uae",
    "qatar",
    "saudi",
    "israel",
    "bahrain",
    "kuwait",
    "southafrica",
    "johannesburg",
    "capetown",
    "doha",
    "telaviv"
  ]) ? {
    key: "middle-east-africa",
    label: "中东与非洲",
    sortOrder: 3
  } : {
    key: "other",
    label: "其他",
    sortOrder: 9
  };
}
function Qd(n) {
  return Array.isArray(n) ? n : n && typeof n == "object" ? [n] : typeof n == "string" && n.trim() ? [{ value: n }] : [];
}
function Zd(n = []) {
  const e = [], a = /* @__PURE__ */ new Set();
  for (const t of Array.isArray(n) ? n : []) {
    const r = String(t?.id || t?.provider || t?.providerId || "").trim().toLowerCase();
    if (!r) continue;
    const o = Yd(r);
    for (const s of Array.isArray(t?.regions) ? t.regions : []) {
      const i = String(s?.id || s?.region || s?.value || "").trim();
      if (!i) continue;
      const c = `${r}:${i}`;
      if (a.has(c)) continue;
      a.add(c);
      const l = Jd(i, r);
      e.push({
        provider: r,
        region: i,
        value: c,
        providerLabel: o,
        regionLabel: i,
        geoKey: l.key,
        geoLabel: l.label,
        geoSortOrder: l.sortOrder
      });
    }
  }
  return e.sort((t, r) => String(t.providerLabel || t.provider || "").localeCompare(String(r.providerLabel || r.provider || "")) || Number(t.geoSortOrder || 0) - Number(r.geoSortOrder || 0) || String(t.regionLabel || t.region || "").localeCompare(String(r.regionLabel || r.region || "")) || String(t.value || "").localeCompare(String(r.value || "")));
}
function Ir(n, e = "", a = []) {
  const t = He(n, [
    "region",
    "value",
    "id"
  ]);
  if (!t) return "";
  if (t.includes(":")) return t;
  const r = He(e, [
    "provider",
    "providerId",
    "id",
    "value"
  ]).toLowerCase();
  if (r) return `${r}:${t}`;
  const o = (Array.isArray(a) ? a : []).filter((s) => String(s?.region || "").trim() === t || String(s?.value || "").trim() === t);
  return o.length === 1 ? String(o[0]?.value || "").trim() : t;
}
function ga(n = {}, e = []) {
  const a = n && typeof n == "object" ? n : {}, t = String(a?.mode || "").trim().toLowerCase(), r = Qd(a?.target), o = Ir(a?.region, a?.provider || a?.providerId || "", e), s = r.find((S) => !!Ir(He(S, [
    "region",
    "value",
    "id"
  ]), He(S, ["provider", "providerId"]), e)), i = s ? Ir(He(s, [
    "region",
    "value",
    "id"
  ]), He(s, ["provider", "providerId"]), e) : "", c = He(a?.hostname, ["hostname"], { allowFallback: !1 }) || He(a, ["hostname"], { allowFallback: !1 }), l = He(r.find((S) => He(S, ["hostname"], { allowFallback: !1 })), ["hostname"], { allowFallback: !1 }), u = He(a?.host, ["host"], { allowFallback: !1 }) || He(a, ["host"], { allowFallback: !1 }), d = He(r.find((S) => He(S, ["host"], { allowFallback: !1 })), ["host"], { allowFallback: !1 }), f = He(r[0], ["value", "id"]);
  let m = "default", p = "__default__", g = "", h = "default", y = "";
  return t === "smart" ? (m = "smart", p = "__smart__", h = "smart") : t === "targeted" ? c || l ? (m = "hostname", p = "", g = c || l, h = "") : u || d ? (m = "host", p = "", g = u || d, h = "") : (m = "targeted", p = i || o || "", g = p || f || "", h = "") : o ? (m = "region", p = o, h = "region", y = o) : c ? (m = "hostname", p = "", g = c, h = "") : u ? (m = "host", p = "", g = u, h = "") : (i || r.length > 0) && (m = "targeted", p = i || "", g = p || f || "", h = ""), {
    currentMode: m,
    currentValue: p,
    currentTarget: g,
    selectedMode: h,
    selectedRegion: y,
    isTargetedOverride: m === "hostname" || m === "host" || m === "targeted"
  };
}
function Ji(n = []) {
  return (Array.isArray(n) ? n : []).filter((e) => e && typeof e == "object").map((e) => {
    const a = String(e.scope || "").trim(), t = String(e.permission || "").trim(), r = String(e.alternative || "").trim(), o = String(e.note || "").trim(), s = [];
    return a && s.push(`${a}级`), t && s.push(`"${t}"`), r && s.push(`（若当前令牌仅授予写权限，可改用 "${r}"）`), o && s.push(`：${o}`), s.join("");
  }).filter(Boolean);
}
function Qi(n = "", e = {}) {
  const a = String(n || "").trim().toLowerCase();
  if (a === "discovery") {
    const t = e?.includeRouteFallback !== !1, r = [{
      scope: "账号",
      permission: "Workers Scripts Read",
      alternative: "Workers Scripts Write",
      note: "用于读取 Workers Domains，按当前 host 自动识别脚本"
    }];
    return t && r.push({
      scope: "Zone",
      permission: "Workers Routes Read",
      alternative: "Workers Routes Write",
      note: "当 Domains 未命中时，允许继续从 Workers Routes 回退识别脚本"
    }), r;
  }
  return a === "settings_read" ? [{
    scope: "账号",
    permission: "Workers Scripts Read",
    alternative: "Workers Scripts Write",
    note: "用于读取 Worker Settings"
  }] : a === "regions_read" ? [{
    scope: "账号",
    permission: "Workers Scripts Read",
    alternative: "Workers Scripts Write",
    note: "用于读取 Placement 区域列表"
  }] : a === "settings_write" ? [{
    scope: "账号",
    permission: "Workers Scripts Write",
    alternative: "",
    note: "用于写入 Worker Settings / Placement"
  }] : [];
}
function ef(n = "", e = "读取", a = {}) {
  const t = Ji(Qi(n, a));
  return t.length <= 0 ? `Cloudflare Worker 放置${e}失败：API Token 权限不足` : `Cloudflare Worker 放置${e}失败：API Token 权限不足。至少需要：${t.join("；")}`;
}
function gn(n = "WORKER_PLACEMENT_FORBIDDEN", e = "", a = "读取", t = {}) {
  return Te(n, ef(e, a, t), 403, {
    permissionKind: String(e || "").trim(),
    requiredPermissions: Qi(e, t)
  });
}
function Bn(n = {}) {
  const e = n && typeof n == "object" && !Array.isArray(n) ? n : {}, a = Object.prototype.hasOwnProperty.call(e, "currentValue"), t = Object.prototype.hasOwnProperty.call(e, "selectedMode");
  return {
    configured: e.configured === !0,
    scriptName: String(e.scriptName || "").trim(),
    requestHost: ee(e.requestHost || ""),
    currentMode: String(e.currentMode || "default").trim().toLowerCase() || "default",
    currentValue: a ? String(e.currentValue ?? "").trim() : "__default__",
    currentTarget: String(e.currentTarget || "").trim(),
    selectedMode: t ? String(e.selectedMode ?? "").trim().toLowerCase() : "default",
    selectedRegion: String(e.selectedRegion || "").trim(),
    options: Array.isArray(e.options) ? e.options : [],
    warning: String(e.warning || "").trim(),
    error: String(e.error || "").trim()
  };
}
function tf(n = "", e = "", a = !1) {
  const t = ee(n), r = ee(e);
  return !t || !r ? !1 : a ? t === r || t.endsWith(`.${r}`) : t === r;
}
function rf(n = "", e = "/") {
  const a = String(n || "").trim(), t = String(e || "/").trim() || "/";
  return !a || a === "/" || a === "/*" ? !0 : a.endsWith("*") ? t.startsWith(a.slice(0, -1)) : t === a;
}
function af(n = {}) {
  const e = ee(n?.hostname || ""), a = Vt(n?.service || n?.script || n?.name || "");
  return !e || !a ? null : {
    source: "domains",
    hostname: e,
    wildcard: !1,
    path: "/",
    scriptName: a,
    score: po(e, {
      wildcard: !1,
      path: "/"
    })
  };
}
function nf(n = {}) {
  const e = Xs(n?.pattern), a = Vt(n?.script || n?.service || n?.name || "");
  return !e || !a ? null : {
    source: "routes",
    hostname: e.hostname,
    wildcard: e.wildcard === !0,
    path: e.path || "/",
    pattern: e.pattern,
    scriptName: a,
    score: po(e.hostname, {
      wildcard: e.wildcard === !0,
      path: e.path || "/"
    })
  };
}
function ns(n = [], e = "", a = "/") {
  const t = ee(e), r = String(a || "/").trim() || "/", o = [];
  for (const i of Array.isArray(n) ? n : [])
    !i?.scriptName || !i?.hostname || tf(t, i.hostname, i.wildcard === !0) && rf(i.path || "/", r) && o.push({
      ...i,
      exactHostname: t === ee(i.hostname),
      exactPath: String(i.path || "/") === r
    });
  if (o.length > 0)
    return o.sort((i, c) => Number(c.exactHostname) - Number(i.exactHostname) || Number(c.exactPath) - Number(i.exactPath) || Number(c.score || 0) - Number(i.score || 0) || String(i.hostname || "").length - String(c.hostname || "").length || String(i.scriptName || "").localeCompare(String(c.scriptName || ""))), o[0];
  const s = [...new Set((Array.isArray(n) ? n : []).map((i) => String(i?.scriptName || "").trim()).filter(Boolean))];
  return s.length === 1 && (Array.isArray(n) ? n : []).find((i) => String(i?.scriptName || "").trim() === s[0]) || null;
}
async function Zi(n, e) {
  const a = String(n || "").trim(), t = String(e || "").trim();
  if (!a || !t) return [];
  let r = null;
  try {
    r = await be(`https://api.cloudflare.com/client/v4/accounts/${encodeURIComponent(a)}/workers/placement/regions`, t);
  } catch (o) {
    throw Number(o?.status) === 403 ? gn("WORKER_PLACEMENT_REGIONS_FORBIDDEN", "regions_read", "读取") : o;
  }
  return Zd(r?.result?.providers);
}
async function of(n, e, a = {}) {
  const t = String(n || "").trim(), r = String(e || "").trim();
  if (!t || !r) return [];
  const o = new URL(`https://api.cloudflare.com/client/v4/accounts/${encodeURIComponent(t)}/workers/domains`), s = String(a?.zoneId || "").trim(), i = ee(a?.hostname || ""), c = Vt(a?.service || "");
  s && o.searchParams.set("zone_id", s), i && o.searchParams.set("hostname", i), c && o.searchParams.set("service", c);
  const l = await be(o.toString(), r);
  return Array.isArray(l?.result) ? l.result : [];
}
async function sf(n, e) {
  const a = String(n || "").trim(), t = String(e || "").trim();
  if (!a || !t) return [];
  const r = [];
  let o = 1, s = 1;
  do {
    const i = await be(`https://api.cloudflare.com/client/v4/zones/${encodeURIComponent(a)}/workers/routes?page=${o}&per_page=100`, t);
    Array.isArray(i?.result) && r.push(...i.result), s = Number(i?.result_info?.total_pages || i?.result_info?.totalPages || 1), o += 1;
  } while (o <= s && o <= 10);
  return r;
}
async function wo({ cfAccountId: n, cfZoneId: e, cfApiToken: a, request: t }) {
  const r = new URL(t?.url || "https://invalid.local/"), o = ee(r.hostname), s = String(r.pathname || "/").trim() || "/";
  if (!o) throw Te("WORKER_PLACEMENT_HOST_INVALID", "当前请求 host 无效，无法识别 Worker 脚本", 400);
  const i = [], c = /* @__PURE__ */ new Set();
  let l = null, u = !1, d = !1;
  const f = [
    {
      zoneId: e,
      hostname: o
    },
    { hostname: o },
    { zoneId: e }
  ];
  for (const m of f) {
    const p = JSON.stringify({
      zoneId: String(m?.zoneId || "").trim(),
      hostname: ee(m?.hostname || "")
    });
    if (!c.has(`query:${p}`)) {
      c.add(`query:${p}`);
      try {
        const g = await of(n, a, m);
        for (const y of g) {
          const S = af(y);
          if (!S) continue;
          const _ = `${S.source}|${S.scriptName}|${S.hostname}|${S.path}`;
          c.has(_) || (c.add(_), i.push(S));
        }
        const h = ns(i, o, s);
        if (h?.scriptName) return {
          requestHost: o,
          requestPath: s,
          scriptName: h.scriptName,
          resolvedBy: h.source
        };
      } catch (g) {
        l = g, Number(g?.status) === 403 && (u = !0), console.warn("[worker_placement.resolve_script.domains_failed]", {
          requestHost: o,
          zoneId: String(m?.zoneId || "").trim(),
          hostname: ee(m?.hostname || ""),
          reason: ie(g)
        });
      }
    }
  }
  try {
    const m = ns(await sf(e, a).then((p) => p.map((g) => nf(g)).filter(Boolean)), o, s);
    if (m?.scriptName) return {
      requestHost: o,
      requestPath: s,
      scriptName: m.scriptName,
      resolvedBy: m.source
    };
  } catch (m) {
    l = m, Number(m?.status) === 403 && (d = !0), console.warn("[worker_placement.resolve_script.routes_failed]", {
      requestHost: o,
      zoneId: String(e || "").trim(),
      reason: ie(m)
    });
  }
  throw u || d ? gn("WORKER_PLACEMENT_SCRIPT_DISCOVERY_FORBIDDEN", "discovery", "读取", { includeRouteFallback: d }) : l || Te("WORKER_PLACEMENT_SCRIPT_UNRESOLVED", "未能根据当前站点自动识别 Worker 脚本，请确认当前 host 已绑定到该 Zone 的 Workers Domain 或 Workers Route", 400, { requestHost: o });
}
async function Ga(n, e, a) {
  let t = null;
  try {
    t = await be(`https://api.cloudflare.com/client/v4/accounts/${encodeURIComponent(String(n || "").trim())}/workers/scripts/${encodeURIComponent(String(e || "").trim())}/settings`, String(a || "").trim());
  } catch (r) {
    throw Number(r?.status) === 403 ? gn("WORKER_PLACEMENT_SETTINGS_READ_FORBIDDEN", "settings_read", "读取") : r;
  }
  return F(t?.result) ? t.result : {};
}
async function Vr(n, e, a, t = {}) {
  const r = new FormData();
  r.append("settings", new Blob([JSON.stringify(t && typeof t == "object" ? t : {})], { type: "application/json" }), "settings.json");
  let o = null;
  try {
    o = await be(`https://api.cloudflare.com/client/v4/accounts/${encodeURIComponent(String(n || "").trim())}/workers/scripts/${encodeURIComponent(String(e || "").trim())}/settings`, String(a || "").trim(), {
      method: "PATCH",
      body: r
    });
  } catch (s) {
    throw Number(s?.status) === 403 ? gn("WORKER_PLACEMENT_SETTINGS_WRITE_FORBIDDEN", "settings_write", "保存") : s;
  }
  return F(o?.result) ? o.result : {};
}
function ja(n, e = "read") {
  const a = e === "write" ? "保存" : e === "default" ? "恢复默认" : "读取", t = String(n?.message || n || "").trim() || `Worker 放置${a}失败`, r = Number(n?.status) || Number(/cf_api_http_(\d+)/i.exec(t)?.[1] || 0), o = String(n?.code || "").trim().toUpperCase();
  return o.startsWith("WORKER_PLACEMENT_") && String(n?.message || "").trim() ? n.message : r === 401 ? `Cloudflare Worker 放置${a}失败：API Token 无效` : r === 403 ? `Cloudflare Worker 放置${a}失败：API Token 权限不足` : r === 404 && e !== "read" ? "Cloudflare Worker 放置保存失败：未找到目标 Worker 脚本" : r === 404 ? "Cloudflare Worker 放置读取失败：未找到目标 Worker 脚本" : o === "WORKER_PLACEMENT_SCRIPT_UNRESOLVED" || o === "WORKER_PLACEMENT_HOST_INVALID" || o === "WORKER_PLACEMENT_CONFIG_REQUIRED" ? n.message : t;
}
function Do(n = {}) {
  const e = String(n?.cfAccountId || "").trim(), a = String(n?.cfZoneId || "").trim(), t = String(n?.cfApiToken || "").trim(), r = [];
  if (e || r.push("cfAccountId"), a || r.push("cfZoneId"), t || r.push("cfApiToken"), r.length <= 0) return {
    cfAccountId: e,
    cfZoneId: a,
    cfApiToken: t
  };
  throw Te("WORKER_PLACEMENT_CONFIG_REQUIRED", "请先在账号设置中填写并保存 Cloudflare Account ID、Zone ID 与 API Token", 400, { missingFields: r });
}
function No(n = "") {
  const e = Vt(n);
  return e ? `sys:worker_placement_region:v1:${e}` : "";
}
function Kt(n = "WORKER_PLACEMENT_KV_FAILED", e = "Worker 放置 KV 持久化失败", a = null) {
  return Te(n, e, 503, a);
}
function cf(n) {
  return Qa(n) && String(n?.code || "").trim().toUpperCase().startsWith("WORKER_PLACEMENT_") && String(n?.details?.dependency || "").trim().toUpperCase() === "KV";
}
function ec(n = {}, e = "") {
  const a = Vt(e);
  if (!a || !F(n)) return null;
  const t = Ir(n?.region, n?.provider || n?.providerId || "", []);
  return t ? {
    scriptName: a,
    region: t,
    updatedAt: String(n?.updatedAt || "").trim()
  } : null;
}
async function tc(n, e = "") {
  if (!n) return null;
  const a = No(e);
  return a ? ec(await we(n, a, { type: "json" }), e) : null;
}
async function rc(n, e = "", a = "") {
  if (!n) throw Kt("WORKER_PLACEMENT_REGION_OVERRIDE_WRITE_FAILED", "Worker 放置 Region 持久化失败：KV 未配置", {
    dependency: "KV",
    operation: "put",
    reason: "kv_not_configured"
  });
  const t = No(e), r = Vt(e), o = Ir(a, "", []);
  if (!t || !r || !o) throw Kt("WORKER_PLACEMENT_REGION_OVERRIDE_WRITE_FAILED", "Worker 放置 Region 持久化失败：Region 数据无效", {
    dependency: "KV",
    operation: "put",
    key: t,
    scriptName: r,
    region: o,
    reason: "invalid_region_override"
  });
  const s = {
    scriptName: r,
    region: o,
    updatedAt: (/* @__PURE__ */ new Date()).toISOString()
  };
  try {
    await n.put(t, JSON.stringify(s));
  } catch (i) {
    throw Kt("WORKER_PLACEMENT_REGION_OVERRIDE_WRITE_FAILED", "Worker 放置 Region 持久化失败：KV 写入异常", {
      dependency: "KV",
      operation: "put",
      key: t,
      scriptName: r,
      region: o,
      reason: ie(i)
    });
  }
  return s;
}
async function os(n, e = "") {
  if (!n) throw Kt("WORKER_PLACEMENT_REGION_OVERRIDE_DELETE_FAILED", "Worker 放置 Region 清理失败：KV 未配置", {
    dependency: "KV",
    operation: "delete",
    reason: "kv_not_configured"
  });
  const a = No(e), t = Vt(e);
  if (!a || !t) return !1;
  try {
    await n.delete(a);
  } catch (r) {
    throw Kt("WORKER_PLACEMENT_REGION_OVERRIDE_DELETE_FAILED", "Worker 放置 Region 清理失败：KV 删除异常", {
      dependency: "KV",
      operation: "delete",
      key: a,
      scriptName: t,
      reason: ie(r)
    });
  }
  return !0;
}
function lf(n = "") {
  const e = String(n || "").trim();
  return e ? `当前已保存的 Worker Placement Region（${e}）已不在 Cloudflare 可选区域列表中，请重新选择并保存` : "当前已保存的 Worker Placement Region 已不在 Cloudflare 可选区域列表中，请重新选择并保存";
}
function ss(n = "", e = "", a = "", t = [], r = {}) {
  const o = Ir(a, "", t), s = Array.isArray(t) ? t : [], i = s.find((u) => String(u?.value || "").trim() === o) || null, c = r?.regionError || null;
  let l = String(r?.error || "").trim();
  return !l && c ? l = ja(c, "read") : !l && o && s.length > 0 && !i && (l = lf(o)), Bn({
    configured: r?.configured !== !1,
    scriptName: n,
    requestHost: e,
    currentMode: "region",
    currentValue: o,
    currentTarget: "",
    selectedMode: "region",
    selectedRegion: o,
    options: s,
    warning: "",
    error: l
  });
}
async function Tn(n, e, a, t = {}) {
  let r = !1, o = !1, s = "";
  try {
    const i = ec(t?.previousOverride, e), c = t?.originalState && typeof t.originalState == "object" ? t.originalState : ga(t?.originalPlacement, t?.regionOptions);
    if (i?.region)
      return r = !0, await Vr(n, e, a, { placement: { region: i.region } }), o = !0, {
        rollbackAttempted: r,
        rollbackSucceeded: o,
        rollbackError: s
      };
    r = !0, String(c?.currentMode || "").trim().toLowerCase() === "default" ? await ac(n, e, a, t?.regionOptions) : await Vr(n, e, a, { placement: pn(t?.originalPlacement) }), o = !0;
  } catch (i) {
    o = !1, s = ie(i);
  }
  return {
    rollbackAttempted: r,
    rollbackSucceeded: o,
    rollbackError: s
  };
}
async function is(n = {}, e, a = {}) {
  let t = "", r = "";
  try {
    const o = Do(n), s = await wo({
      ...o,
      request: e
    });
    t = s.scriptName, r = s.requestHost;
    const i = await tc(a?.kv, s.scriptName);
    let c = [], l = null;
    try {
      c = await Zi(o.cfAccountId, o.cfApiToken);
    } catch (d) {
      l = d;
    }
    if (i?.region) return ss(s.scriptName, s.requestHost, i.region, c, {
      configured: !l,
      regionError: l
    });
    const u = ga(pn((await Ga(o.cfAccountId, s.scriptName, o.cfApiToken))?.placement), c);
    return u.currentMode === "region" && u.currentValue ? (await rc(a?.kv, s.scriptName, u.currentValue), ss(s.scriptName, s.requestHost, u.currentValue, c, {
      configured: !l,
      regionError: l
    })) : Bn({
      configured: !l,
      scriptName: s.scriptName,
      requestHost: s.requestHost,
      currentMode: u.currentMode,
      currentValue: u.currentValue,
      currentTarget: u.currentTarget,
      selectedMode: u.selectedMode,
      selectedRegion: u.selectedRegion,
      options: c,
      warning: "",
      error: l ? ja(l, "read") : ""
    });
  } catch (o) {
    if (Za(o) || cf(o) || a?.softFail !== !0) throw o;
    return Bn({
      configured: !1,
      scriptName: t,
      requestHost: r,
      selectedMode: "",
      currentMode: "default",
      currentValue: "__default__",
      error: ja(o, "read")
    });
  }
}
async function ac(n, e, a, t = []) {
  const r = await Ga(n, e, a), o = pn(r?.placement), s = ga(o, t);
  if (s.currentMode === "default") return {
    settings: r,
    placementState: s,
    clearedBy: "already_default"
  };
  for (const u of [{
    tag: "empty_object",
    patch: { placement: {} }
  }, {
    tag: "null",
    patch: { placement: null }
  }]) {
    await Vr(n, e, a, u.patch);
    const d = await Ga(n, e, a), f = ga(d?.placement, t);
    if (f.currentMode === "default") return {
      settings: d,
      placementState: f,
      clearedBy: u.tag
    };
  }
  let i = !1, c = !1, l = "";
  if (o !== void 0) {
    i = !0;
    try {
      await Vr(n, e, a, { placement: o }), c = !0;
    } catch (u) {
      c = !1, l = ie(u);
    }
  }
  throw Te("WORKER_PLACEMENT_DEFAULT_BLOCKED", "Cloudflare 当前接口未验证出可安全恢复 Default Placement；本次已停止，未使用近似映射", 409, {
    scriptName: e,
    rollbackAttempted: i,
    rollbackSucceeded: c,
    rollbackError: l
  });
}
function uf(n = {}, e = {}) {
  const { kernel: a } = n, { CacheManager: t, buildAdminShellState: r, buildAdminUiContract: o, withAdminShellRuntimeStatus: s } = n;
  return {
    async getDashboardSnapshot(i, { env: c, ctx: l, kv: u, db: d }) {
      const f = await ue(c);
      return J(await a.getDashboardSnapshotPayload(c, {
        ctx: l,
        kv: u,
        db: d,
        config: f,
        forceRefresh: i?.forceRefresh === !0
      }));
    },
    async getDashboardStats(i, { env: c, ctx: l, kv: u, db: d }) {
      const f = await ue(c), m = await a.getDashboardSnapshotPayload(c, {
        ctx: l,
        kv: u,
        db: d,
        config: f,
        forceRefresh: i?.forceRefresh === !0
      });
      return J({
        ...m?.stats && typeof m.stats == "object" ? m.stats : {},
        cacheMeta: m?.cacheMeta && typeof m.cacheMeta == "object" ? m.cacheMeta : {}
      });
    },
    async getMonthlyTrafficStats(i, { env: c, ctx: l }) {
      const u = await ue(c);
      return J(await a.getDashboardMonthlyTrafficPayload(c, {
        ctx: l,
        config: u,
        forceRefresh: i?.forceRefresh === !0
      }));
    },
    async getRuntimeStatus(i, { env: c, db: l }) {
      const u = await ue(c), d = await a.getRuntimeStatusPayload(c, {
        db: l,
        config: u,
        forceRefresh: i?.forceRefresh === !0
      });
      return J({
        status: d?.status && typeof d.status == "object" ? d.status : {},
        cacheMeta: d?.cacheMeta && typeof d.cacheMeta == "object" ? d.cacheMeta : {}
      });
    },
    async getAdminBootstrap(i, { env: c, ctx: l, kv: u, db: d }) {
      try {
        const f = await ue(c), m = ze(c), [p, g, h, y] = await Promise.all([
          t.getNodesListStrict(c, l),
          a.getConfigSnapshotsForRead(u),
          a.readStoredConfigSnapshotsStrict(u),
          a.getRuntimeStatusPayload(c, {
            ctx: l,
            kv: u,
            db: d,
            config: f
          })
        ]), S = await a.getAdminRevisionsForRead({
          env: c,
          kv: u,
          db: d
        }, {
          ctx: l,
          config: f,
          nodes: p,
          snapshots: h
        });
        return J({
          adminPath: Ze(c),
          loginPath: So(c),
          initHealth: m,
          config: st(f),
          hostDomain: Ke(c),
          legacyHost: kr(c),
          contract: o(),
          nodes: p,
          configSnapshots: g,
          shell: r(c, m, f),
          runtimeStatus: y?.status && typeof y.status == "object" ? y.status : s({}, c, f, m),
          revisions: S,
          generatedAt: (/* @__PURE__ */ new Date()).toISOString()
        });
      } catch (f) {
        throw Rt(f, "ADMIN_BOOTSTRAP_READ_FAILED", "管理台启动数据加载失败：KV 读取异常", "admin.read.bootstrap");
      }
    },
    async getSettingsBootstrap(i, { env: c, ctx: l, kv: u, db: d }) {
      let f;
      try {
        f = await ue(c);
      } catch (S) {
        throw Rt(S, "SETTINGS_BOOTSTRAP_READ_FAILED", "设置页加载失败：KV 读取异常", "admin.read.settings_bootstrap");
      }
      let m = [], p = [], g = [], h = {}, y = {};
      try {
        m = await t.getNodesListStrict(c, l);
      } catch (S) {
        console.warn("[settings_bootstrap.nodes_degraded]", ie(S));
      }
      try {
        [p, g] = await Promise.all([a.getConfigSnapshotsForRead(u), a.readStoredConfigSnapshotsStrict(u)]);
      } catch (S) {
        console.warn("[settings_bootstrap.snapshots_degraded]", ie(S));
      }
      try {
        const S = await a.getRuntimeStatusPayload(c, {
          ctx: l,
          kv: u,
          db: d,
          config: f
        });
        h = S?.status && typeof S.status == "object" ? S.status : {};
      } catch (S) {
        console.warn("[settings_bootstrap.runtime_status_degraded]", ie(S));
      }
      try {
        y = await a.getAdminRevisionsForRead({
          env: c,
          kv: u,
          db: d
        }, {
          ctx: l,
          config: f,
          nodes: m,
          snapshots: g
        });
      } catch (S) {
        console.warn("[settings_bootstrap.revisions_degraded]", ie(S));
      }
      return J({
        config: st(f),
        hostDomain: Ke(c),
        legacyHost: kr(c),
        contract: o(),
        nodes: m,
        configSnapshots: p,
        runtimeStatus: s(h, c, f, ze(c)),
        revisions: y,
        generatedAt: (/* @__PURE__ */ new Date()).toISOString()
      });
    },
    async getWorkerPlacementStatus(i, { env: c, request: l, kv: u }) {
      try {
        return J(await is(await ue(c), l, {
          softFail: !0,
          kv: u
        }));
      } catch (d) {
        throw Rt(d, "WORKER_PLACEMENT_READ_FAILED", "Worker 放置状态读取失败：KV 读取异常", "admin.read.worker_placement");
      }
    },
    async saveWorkerPlacement(i, { env: c, request: l, kv: u }) {
      let d;
      try {
        d = await ue(c);
      } catch (m) {
        throw Rt(m, "WORKER_PLACEMENT_SAVE_FAILED", "Worker 放置保存失败：KV 读取异常", "admin.write.worker_placement");
      }
      const f = String(i?.mode || "").trim().toLowerCase();
      if (f !== "default" && f !== "smart" && f !== "region") return B("WORKER_PLACEMENT_MODE_INVALID", "请选择有效的 Worker 放置模式");
      try {
        const m = Do(d), p = await wo({
          ...m,
          request: l
        }), g = await tc(u, p.scriptName), h = await Zi(m.cfAccountId, m.cfApiToken), y = pn((await Ga(m.cfAccountId, p.scriptName, m.cfApiToken))?.placement), S = ga(y, h);
        if (f === "region") {
          const _ = String(i?.region || "").trim(), A = h.find((b) => String(b?.value || "").trim() === _);
          if (!A) return B("WORKER_PLACEMENT_REGION_INVALID", "所选 Placement 区域已失效，请刷新后重试");
          await Vr(m.cfAccountId, p.scriptName, m.cfApiToken, { placement: { region: A.value } });
          try {
            await rc(u, p.scriptName, A.value);
          } catch (b) {
            const R = await Tn(m.cfAccountId, p.scriptName, m.cfApiToken, {
              previousOverride: g,
              originalPlacement: y,
              originalState: S,
              regionOptions: h
            });
            throw Kt(b?.code || "WORKER_PLACEMENT_REGION_OVERRIDE_WRITE_FAILED", String(b?.message || "Worker 放置 Region 持久化失败：KV 写入异常"), {
              ...F(b?.details) ? b.details : {},
              requestedMode: f,
              dependency: "KV",
              region: A.value,
              rollbackAttempted: R.rollbackAttempted,
              rollbackSucceeded: R.rollbackSucceeded,
              rollbackError: R.rollbackError
            });
          }
        } else if (f === "smart") {
          if (await Vr(m.cfAccountId, p.scriptName, m.cfApiToken, { placement: { mode: "smart" } }), g) try {
            await os(u, p.scriptName);
          } catch (_) {
            const A = await Tn(m.cfAccountId, p.scriptName, m.cfApiToken, {
              previousOverride: g,
              originalPlacement: y,
              originalState: S,
              regionOptions: h
            });
            throw Kt(_?.code || "WORKER_PLACEMENT_REGION_OVERRIDE_DELETE_FAILED", String(_?.message || "Worker 放置 Region 清理失败：KV 删除异常"), {
              ...F(_?.details) ? _.details : {},
              requestedMode: f,
              dependency: "KV",
              rollbackAttempted: A.rollbackAttempted,
              rollbackSucceeded: A.rollbackSucceeded,
              rollbackError: A.rollbackError
            });
          }
        } else if (await ac(m.cfAccountId, p.scriptName, m.cfApiToken, h), g) try {
          await os(u, p.scriptName);
        } catch (_) {
          const A = await Tn(m.cfAccountId, p.scriptName, m.cfApiToken, {
            previousOverride: g,
            originalPlacement: y,
            originalState: S,
            regionOptions: h
          });
          throw Kt(_?.code || "WORKER_PLACEMENT_REGION_OVERRIDE_DELETE_FAILED", String(_?.message || "Worker 放置 Region 清理失败：KV 删除异常"), {
            ...F(_?.details) ? _.details : {},
            requestedMode: f,
            dependency: "KV",
            rollbackAttempted: A.rollbackAttempted,
            rollbackSucceeded: A.rollbackSucceeded,
            rollbackError: A.rollbackError
          });
        }
        return J(await is(d, l, {
          softFail: !1,
          kv: u
        }));
      } catch (m) {
        return B("WORKER_PLACEMENT_SAVE_FAILED", ja(m, f === "default" ? "default" : "write"), De(m?.status, f === "default" ? 409 : 400), F(m?.details) ? m.details : null);
      }
    }
  };
}
var nc = 600 * 1e3, df = nc;
function lt(n = "", e = "manual") {
  const a = String(e || "manual").trim().toLowerCase() === "scheduled" ? "scheduled" : "manual", t = String(n || "").trim().toLowerCase();
  return a !== "manual" ? "smart" : t === "full" ? "full" : "smart";
}
function ff(n = "", e = "manual") {
  return lt(n, e) === "full";
}
function Lo(n = "worker.js") {
  const e = String(n || "").trim().split(/[\\/]+/).pop() || "";
  return e && /\.js$/i.test(e) ? e : "";
}
function oc(n = "") {
  const e = String(n || "");
  return e && (/(^|\n)\s*export\s+/m.test(e) || /(^|\n)\s*import\s+(?:[\w*{]|["'])/m.test(e)) ? "module" : "service-worker";
}
function mf(n = "", e = "worker.js") {
  const a = Lo(e);
  if (a.toLowerCase() !== "worker.js") throw Te("WORKER_UPLOAD_FILE_NAME_INVALID", "Worker 文件名必须是 worker.js", 400, { fileName: a || String(e || "").trim() });
  const t = String(n || ""), r = new TextEncoder().encode(t).length;
  if (!t.trim()) throw Te("WORKER_UPLOAD_EMPTY", "worker.js 不能为空", 400);
  if (r > 3145728) throw Te("WORKER_UPLOAD_TOO_LARGE", `worker.js 体积超过限制（${r} bytes）`, 400, {
    contentLength: r,
    maxBytes: Sf
  });
  return {
    fileName: a,
    scriptContent: t,
    contentLength: r,
    syntax: oc(t)
  };
}
function pf(n = "", e = "module") {
  const a = Lo(n) || "worker.js";
  return e === "module" ? { main_module: a } : { body_part: a };
}
function gf(n = "module") {
  return n === "module" ? "application/javascript+module" : "application/javascript";
}
function sc() {
  return [{
    scope: "账号",
    permission: "Workers Scripts Write",
    alternative: "",
    note: "这是账号级 Worker 脚本编辑权限，用于上传 .js 文件并仅更新脚本代码，不修改 bindings 或 settings"
  }];
}
function ic(n = "更新") {
  const e = Ji(sc());
  return e.length > 0 ? `Cloudflare Worker 脚本${n}失败：API Token 权限不足。至少需要：${e.join("；")}` : `Cloudflare Worker 脚本${n}失败：API Token 权限不足`;
}
function hf(n = "WORKER_SCRIPT_UPDATE_FORBIDDEN", e = "更新") {
  return Te(n, ic(e), 403, { requiredPermissions: sc() });
}
async function yf(n, e, a, t, r = {}) {
  const o = String(n || "").trim(), s = Vt(e), i = String(a || "").trim(), c = Lo(r?.fileName) || "worker.js", l = String(t || ""), u = oc(l), d = new FormData();
  d.append("metadata", new Blob([JSON.stringify(pf(c, u))], { type: "application/json" }), "metadata.json"), d.append("files", new Blob([l], { type: gf(u) }), c);
  let f = null;
  try {
    f = await be(`https://api.cloudflare.com/client/v4/accounts/${encodeURIComponent(o)}/workers/scripts/${encodeURIComponent(s)}/content`, i, {
      method: "PUT",
      body: d
    });
  } catch (m) {
    throw Number(m?.status) === 403 ? hf("WORKER_SCRIPT_UPDATE_FORBIDDEN", "更新") : m;
  }
  return {
    syntax: u,
    fileName: c,
    result: F(f?.result) ? f.result : {}
  };
}
function cs(n) {
  const e = String(n?.message || n || "").trim() || "Worker 脚本更新失败", a = Number(n?.status) || Number(/cf_api_http_(\d+)/i.exec(e)?.[1] || 0), t = String(n?.code || "").trim().toUpperCase();
  return t === "WORKER_SCRIPT_UPDATE_FORBIDDEN" && String(n?.message || "").trim() ? n.message : t === "WORKER_PLACEMENT_SCRIPT_DISCOVERY_FORBIDDEN" ? String(n?.message || "").replace("Cloudflare Worker 放置读取失败", "Cloudflare Worker 脚本定位失败").trim() : t === "WORKER_PLACEMENT_SCRIPT_UNRESOLVED" || t === "WORKER_PLACEMENT_HOST_INVALID" || t === "WORKER_PLACEMENT_CONFIG_REQUIRED" ? e : a === 401 ? "Cloudflare Worker 和 HTML 更新失败：API Token 无效" : a === 403 ? ic("更新") : a === 404 ? "Cloudflare Worker 和 HTML 更新失败：未找到目标 Worker 脚本" : e;
}
var Sf = 3 * 1024 * 1024;
function _f(n = {}, e = {}) {
  const { kernel: a } = n, { buildAdminLocalIndexUploadRecord: t } = n;
  return {
    async loadConfig(r, { env: o, kv: s, db: i, ctx: c }) {
      try {
        const l = await ue(o), u = await a.getAdminRevisionsForRead({
          env: o,
          kv: s,
          db: i
        }, {
          ctx: c,
          config: l
        });
        return J({
          config: st(l),
          revisions: u
        });
      } catch (l) {
        throw Rt(l, "CONFIG_READ_FAILED", "设置读取失败：KV 读取异常", "admin.read.config");
      }
    },
    async previewConfig(r, { env: o, kv: s, ctx: i }) {
      const c = r?.config && typeof r.config == "object" && !Array.isArray(r.config) ? r.config : {};
      if (!s) return B("KV_NOT_CONFIGURED", "请先绑定 ENI_KV / KV Namespace", 503);
      const l = await ue(o), u = await a.prepareRuntimeConfigPersistence(An(c, l), {
        env: o,
        kv: s,
        ctx: i
      });
      return J({
        config: st(u.nextConfig),
        hostPrefixDnsSyncCount: u.dnsPlans.length
      });
    },
    async previewTidyData(r, { env: o, kv: s, db: i }) {
      const c = String(r?.scope || "kv").trim().toLowerCase() === "d1" ? "d1" : "kv";
      try {
        if (c === "d1") {
          if (!i) return B("D1_NOT_CONFIGURED", "请先绑定 D1 / PROXY_LOGS 数据库");
          const d = await a.buildD1TidyPlan(o, {
            db: i,
            kv: s,
            maintenanceMode: lt(r?.maintenanceMode, "manual")
          }), f = d.schemaStatus?.schemaReady !== !0, m = f ? "" : await a.createD1TidyPlanToken(o, d);
          return J({
            success: !0,
            scope: "d1",
            planHash: f ? "" : d.planHash,
            planToken: m,
            planExpiresAt: m ? new Date(k() + df).toISOString() : "",
            requiresSchemaInitialization: f,
            summary: d.summary,
            ...d.preview
          });
        }
        if (!s) return B("KV_NOT_CONFIGURED", "请先绑定 ENI_KV / KV Namespace");
        const l = await a.buildKvTidyPlan(o, {
          kv: s,
          db: i
        }), u = await a.createKvTidyPlanToken(o, l);
        return J({
          success: !0,
          scope: "kv",
          planHash: l.planHash,
          planToken: u,
          planExpiresAt: new Date(k() + nc).toISOString(),
          summary: l.summary,
          ...l.preview
        });
      } catch (l) {
        const u = l?.message || String(l);
        return B(String(l?.code || "TIDY_PREVIEW_FAILED"), u, De(l?.status, 500), {
          scope: c,
          ...F(l?.details) ? l.details : {}
        });
      }
    },
    async updateWorkerAndAdminIndex(r, { env: o, request: s, kv: i, ctx: c }) {
      if (!i) return B("KV_NOT_CONFIGURED", "请先绑定 ENI_KV / KV Namespace", 503);
      let l;
      try {
        l = await ue(o);
      } catch (_) {
        throw Rt(_, "WORKER_HTML_UPDATE_FAILED", "Worker 和 HTML 更新失败：KV 读取异常", "admin.write.worker_html");
      }
      const u = typeof r?.workerScriptContent == "string" ? r.workerScriptContent : "", d = typeof r?.indexHtml == "string" ? r.indexHtml : "";
      if (!u.trim() || !d.trim()) return B("WORKER_HTML_FILES_REQUIRED", "必须同时上传 worker.js 和 index.html，缺一不可", 400, {
        workerFileProvided: !!u.trim(),
        indexFileProvided: !!d.trim()
      });
      let f, m;
      try {
        f = mf(u, r?.workerFileName);
        const _ = String(r?.indexFileName || "").trim().split(/[\\/]+/).pop() || "";
        if (_.toLowerCase() !== "index.html") return B("ADMIN_INDEX_UPLOAD_FILE_NAME_INVALID", "HTML 文件名必须是 index.html", 400, { fileName: _ || String(r?.indexFileName || "").trim() });
        m = await t(d, _);
      } catch (_) {
        return B(String(_?.code || "WORKER_HTML_VALIDATION_FAILED"), ie(_, "Worker 或 HTML 文件校验失败"), De(_?.status, 400), F(_?.details) ? _.details : null);
      }
      let p, g;
      try {
        p = Do(l), g = await wo({
          ...p,
          request: s
        });
      } catch (_) {
        return B(String(_?.code || "WORKER_SCRIPT_CONTEXT_FAILED"), cs(_), De(_?.status, 400), F(_?.details) ? _.details : null);
      }
      let h;
      try {
        h = await a.persistAdminIndexUpload(m, {
          env: o,
          kv: i,
          ctx: c
        });
      } catch (_) {
        return B(String(_?.code || "ADMIN_INDEX_UPLOAD_FAILED"), ie(_, "index.html 激活失败"), De(_?.status, 500), F(_?.details) ? _.details : null);
      }
      let y;
      try {
        y = await yf(p.cfAccountId, g.scriptName, p.cfApiToken, f.scriptContent, { fileName: f.fileName });
      } catch (_) {
        let A = !1, b = !1, R = "", E = "";
        try {
          const D = await a.rollbackAdminIndexUploadActivation(h.previousConfig, h.config, {
            env: o,
            kv: i,
            ctx: c
          });
          A = !0, b = D.skipped === !0, R = String(D.reason || "").trim();
        } catch (D) {
          E = ie(D, "rollback_failed");
        }
        return B(String(_?.code || "WORKER_HTML_UPDATE_FAILED"), cs(_), De(_?.status, 400), {
          ...F(_?.details) ? _.details : {},
          htmlRollbackAttempted: !0,
          htmlRollbackSucceeded: A,
          htmlRollbackSkipped: b,
          htmlRollbackReason: R,
          htmlRollbackError: E
        });
      }
      const S = y.result;
      return J({
        success: !0,
        scriptName: g.scriptName,
        requestHost: g.requestHost,
        worker: {
          fileName: y.fileName,
          bytes: f.contentLength,
          syntax: y.syntax,
          modifiedOn: String(S?.modified_on || S?.modifiedOn || "").trim(),
          etag: String(S?.etag || "").trim(),
          handlers: Array.isArray(S?.handlers) ? S.handlers : [],
          hasModules: S?.has_modules === !0 || S?.hasModules === !0
        },
        html: {
          fileName: h.record.fileName,
          bytes: h.record.bytes,
          revision: h.record.revision,
          uploadedAt: h.record.uploadedAt
        },
        config: st(h.config),
        revisions: await a.getAdminRevisions(o, {
          ctx: c,
          config: h.config
        })
      });
    },
    async saveConfig(r, { env: o, ctx: s, kv: i, meta: c }) {
      if (!i) return B("KV_NOT_CONFIGURED", "请先绑定 ENI_KV / KV Namespace", 503);
      const l = await ue(o);
      _d(r?.expectedConfigRevision, l);
      const u = r.config ? await a.persistRuntimeConfig(An(r.config, l), {
        env: o,
        kv: i,
        ctx: s,
        snapshotMeta: {
          reason: "save_config",
          section: String(c?.section || "all"),
          source: String(c?.source || "ui"),
          actor: "admin"
        }
      }) : l;
      return J({
        success: !0,
        config: st(u),
        revisions: await a.getAdminRevisions(o, {
          ctx: s,
          config: u
        })
      });
    },
    async uploadAdminIndex(r, { env: o, ctx: s, kv: i }) {
      if (!i) return B("KV_NOT_CONFIGURED", "请先绑定 ENI_KV / KV Namespace", 503);
      try {
        const c = String(r?.fileName || "").trim().split(/[\\/]+/).pop() || "";
        if (c.toLowerCase() !== "index.html") return B("ADMIN_INDEX_UPLOAD_FILE_NAME_INVALID", "HTML 文件名必须是 index.html", 400, { fileName: c || String(r?.fileName || "").trim() });
        const l = await t(r?.indexHtml, c), u = await a.persistAdminIndexUpload(l, {
          env: o,
          kv: i,
          ctx: s
        });
        return J({
          success: !0,
          source: "local_upload",
          revision: u.record.revision,
          assetRevision: u.record.assetRevision,
          sourceUrl: u.record.sourceUrl,
          fileName: u.record.fileName,
          bytes: u.record.bytes,
          uploadedAt: u.record.uploadedAt,
          config: st(u.config),
          revisions: await a.getAdminRevisions(o, {
            ctx: s,
            config: u.config
          })
        });
      } catch (c) {
        return B(String(c?.code || "ADMIN_INDEX_UPLOAD_FAILED"), ie(c, "本地 index.html 上传失败"), De(c?.status, 500), F(c?.details) ? c.details : null);
      }
    },
    async exportConfig(r, { env: o, ctx: s, request: i }) {
      const c = a.getKV(o), l = r?.includeSecrets === !0;
      if (l && String(i.headers.get("X-Admin-Confirm") || "").trim() !== "exportConfig") return B("CONFIRMATION_REQUIRED", "Exporting secrets requires explicit confirmation", 428);
      const u = await ue(o), d = Tt(o, u), f = c && d.localUploadRevision ? await a.getAdminIndexUploadRecord(c, d.localUploadRevision) : null, m = c ? (await a.loadAllNodeEntitiesFromKvStrict(c, { ctx: s })).filter(Boolean) : [], p = {
        version: O.Defaults.Version,
        exportTime: (/* @__PURE__ */ new Date()).toISOString(),
        nodes: m,
        config: l ? u : Wr(u),
        adminIndexUpload: f ? {
          version: f.version,
          revision: f.revision,
          fileName: f.fileName,
          uploadedAt: f.uploadedAt,
          bytes: f.bytes,
          html: f.html
        } : null,
        secretsRedacted: l !== !0,
        containsSecrets: l === !0
      }, g = new TextEncoder().encode(JSON.stringify({
        action: "importFull",
        ...p
      })).length;
      return g > 12517376 ? B("FULL_BACKUP_TOO_LARGE", "完整备份超过安全回导上限，请先分别导出节点与设置并精简超大节点字段", 413, {
        importRequestBytes: g,
        maxBytes: ou,
        nodeCount: p.nodes.length,
        adminIndexBytes: Number(f?.bytes) || 0
      }) : J(p);
    },
    async exportSettings(r, { env: o, request: s }) {
      const i = r?.includeSecrets === !0;
      if (i && String(s.headers.get("X-Admin-Confirm") || "").trim() !== "exportSettings") return B("CONFIRMATION_REQUIRED", "导出完整密钥需要显式确认", 428);
      const c = await ue(o);
      return J({
        version: O.Defaults.Version,
        type: "settings-only",
        exportTime: (/* @__PURE__ */ new Date()).toISOString(),
        config: i ? c : Wr(c),
        secretsRedacted: i !== !0,
        containsSecrets: i === !0
      });
    },
    async importSettings(r, { env: o, ctx: s, kv: i, meta: c }) {
      if (!i) return B("KV_NOT_CONFIGURED", "请先绑定 ENI_KV / KV Namespace", 503);
      const l = r?.config && typeof r.config == "object" && !Array.isArray(r.config) ? r.config : r?.settings && typeof r.settings == "object" && !Array.isArray(r.settings) ? r.settings : null;
      if (!l) return B("INVALID_SETTINGS_BACKUP", "设置备份文件无效，缺少 config/settings 对象");
      const u = await ue(o), d = await a.persistRuntimeConfig(An(l, u), {
        env: o,
        kv: i,
        ctx: s,
        snapshotMeta: {
          reason: "import_settings",
          section: String(c?.section || "settings"),
          source: String(c?.source || "settings_backup"),
          actor: "admin"
        }
      }), [f, m] = await Promise.all([a.getConfigSnapshotsForRead(i), a.getAdminRevisions(o, {
        ctx: s,
        config: d
      })]);
      return J({
        success: !0,
        config: st(d),
        configSnapshots: f,
        revisions: m,
        generatedAt: (/* @__PURE__ */ new Date()).toISOString()
      });
    },
    async getConfigSnapshots(r, { env: o, kv: s, db: i, ctx: c }) {
      const l = await a.getConfigSnapshotsForRead(s), u = await a.readStoredConfigSnapshotsStrict(s);
      return J({
        snapshots: l,
        revisions: await a.getAdminRevisionsForRead({
          env: o,
          kv: s,
          db: i
        }, {
          ctx: c,
          snapshots: u
        })
      });
    }
  };
}
function bf(n = {}, e = {}) {
  const { kernel: a } = n, { CacheManager: t, Logger: r } = n;
  return {
    async clearConfigSnapshots(o, { kv: s }) {
      const i = a.CONFIG_SNAPSHOTS_KEY, c = a.CONFIG_SNAPSHOTS_META_KEY;
      try {
        await a.clearConfigSnapshots(s);
      } catch (l) {
        const u = ko("CONFIG_SNAPSHOTS_CLEAR_FAILED", "设置快照清理失败：KV 写入异常", {
          dependency: "KV",
          phase: "clear",
          clearApplied: !1,
          snapshotsKey: i,
          snapshotsMetaKey: c,
          reason: ie(l)
        });
        throw Me("admin.write.config_snapshots.clear_failed", u, u.details), u;
      }
      try {
        return J({
          success: !0,
          snapshots: [],
          revisions: await a.getAdminRevisions(s, { snapshots: [] })
        });
      } catch (l) {
        const u = ko("CONFIG_SNAPSHOTS_REVISIONS_REFRESH_FAILED", "设置快照已清理，但版本信息刷新失败", {
          ...Za(l) && F(l?.details) ? l.details : {},
          phase: "refresh_revisions",
          clearApplied: !0,
          reason: ie(l)
        });
        throw Me("admin.write.config_snapshots.revisions_refresh_failed", u, u.details), u;
      }
    },
    async restoreConfigSnapshot(o, { env: s, ctx: i, kv: c }) {
      const l = String(o?.id || "").trim();
      if (!l) return B("SNAPSHOT_ID_REQUIRED", "请提供要恢复的快照 ID");
      const u = await a.getConfigSnapshotById(c, l);
      if (!u) return B("SNAPSHOT_NOT_FOUND", "指定的配置快照不存在", 404);
      const d = await ue(s), f = Sd(u.config || {}, d), m = je(f.indexUrl || ""), p = m ? await a.getAdminIndexUploadRecord(c, m) : null;
      if (m && !p) return B("SNAPSHOT_ADMIN_INDEX_MISSING", "配置快照引用的 index.html 已不存在", 409, { revision: m });
      const g = await c.get(a.ADMIN_ACTIVE_INDEX_KEY);
      p ? await c.put(a.ADMIN_ACTIVE_INDEX_KEY, JSON.stringify(p)) : await c.delete(a.ADMIN_ACTIVE_INDEX_KEY);
      let h;
      try {
        h = await a.persistRuntimeConfig(f, {
          env: s,
          kv: c,
          ctx: i,
          snapshotMeta: {
            reason: "restore_snapshot",
            section: "all",
            source: "snapshot",
            actor: "admin",
            note: l
          }
        });
      } catch (y) {
        throw g === null ? await c.delete(a.ADMIN_ACTIVE_INDEX_KEY) : await c.put(a.ADMIN_ACTIVE_INDEX_KEY, g), y;
      }
      return J({
        success: !0,
        config: st(h),
        restoredSnapshotId: l,
        revisions: await a.getAdminRevisions(s, {
          ctx: i,
          config: h
        })
      });
    },
    async list(o, { env: s, ctx: i, kv: c, db: l }) {
      try {
        const u = await t.getNodesListStrict(s, i);
        return J({
          nodes: u,
          revisions: await a.getAdminRevisionsForRead({
            env: s,
            kv: c,
            db: l
          }, {
            ctx: i,
            nodes: u
          })
        });
      } catch (u) {
        throw Rt(u, "NODE_LIST_READ_FAILED", "节点列表读取失败：KV 读取异常", "admin.read.nodes");
      }
    },
    async getDashboardD1WriteHotspot(o, { env: s, ctx: i }) {
      const c = await ue(s);
      return J(await a.buildDashboardD1WriteHotspotPayload(s, {
        config: c,
        nowMs: k()
      }));
    },
    async getDashboardCoreStats(o, { env: s, ctx: i, kv: c, db: l }) {
      const u = await ue(s);
      return J(await a.buildDashboardStatsPayload(s, {
        ctx: i,
        kv: c,
        db: l,
        config: u,
        skipD1WriteHotspot: !0
      }));
    },
    async getDashboardCachedSnapshot(o, { env: s, db: i }) {
      const c = await ue(s);
      return J({ snapshot: await a.getDashboardCachedSnapshotPayload(s, {
        db: i,
        config: c
      }) });
    },
    async getNode(o, { env: s, ctx: i, kv: c, db: l }) {
      const u = String(o?.name || "").trim();
      if (!u) return B("NODE_NAME_REQUIRED", "请提供节点路径");
      const d = await a.getNodeForRead(u, s);
      return d ? J({
        success: !0,
        node: {
          name: u.toLowerCase(),
          ...d
        },
        revisions: await a.getAdminRevisionsForRead({
          env: s,
          kv: c,
          db: l
        }, { ctx: i })
      }) : B("NODE_NOT_FOUND", "节点不存在", 404);
    }
  };
}
function Wn(n = [], e = {}) {
  const a = e.renameMap instanceof Map ? e.renameMap : new Map(Object.entries(e.renameMap && typeof e.renameMap == "object" ? e.renameMap : {})), t = /* @__PURE__ */ new Map();
  for (const [l, u] of a.entries()) {
    const d = String(l || "").trim().toLowerCase(), f = String(u || "").trim();
    !d || !f || t.set(d, f);
  }
  const r = new Set(ut(e.removedNames || []).map((l) => String(l || "").trim().toLowerCase()).filter(Boolean)), o = e.allowedNames === void 0 ? null : ut(e.allowedNames || []).map((l) => [String(l || "").trim().toLowerCase(), String(l || "").trim()]).filter(([l, u]) => l && u), s = o ? new Map(o) : null, i = [], c = /* @__PURE__ */ new Set();
  for (const l of ut(n)) {
    const u = String(l || "").trim().toLowerCase();
    if (!u || r.has(u)) continue;
    const d = t.get(u) || String(l || "").trim(), f = d.toLowerCase();
    !f || r.has(f) || s && !s.has(f) || c.has(f) || (c.add(f), i.push(s?.get(f) || d));
  }
  return i;
}
function Rf(n, e = null, a = "") {
  const t = String(n?.proxyMode || n?.mode || "").trim().toLowerCase();
  if ([
    "direct",
    "source-direct",
    "origin-direct",
    "node-direct"
  ].includes(t) || n?.direct === !0 || n?.sourceDirect === !0 || n?.directSource === !0 || n?.direct2xx === !0) return !0;
  const r = `${Ur(n?.tags, n?.tag).join(" ")} ${n?.remark || ""}`;
  return /(?:^|[\s\[(【])(?:直连|source-direct|origin-direct|node-direct)(?:$|[\s\])】])/i.test(r);
}
function Ef(n, e = null, a = "") {
  const t = Fr(n);
  return t === "direct" ? !0 : t === "proxy" ? !1 : Rf(n, e, a);
}
function ha(n, e) {
  if (!n) return null;
  try {
    return new URL(n, e instanceof URL ? e : String(e || ""));
  } catch {
    return null;
  }
}
function Af(n, e = "GET") {
  const a = String(e || "GET").toUpperCase();
  return n === 303 && a !== "GET" && a !== "HEAD" || (n === 301 || n === 302) && a === "POST" ? "GET" : a;
}
function Cf(n = {}, e = {}) {
  const a = pi(sa(n, "protocolStrategy") ? n?.protocolStrategy : bo(n)), t = Number.isFinite(Number(e.hourUtc8)) ? Number(e.hourUtc8) : ((/* @__PURE__ */ new Date()).getUTCHours() + 8) % 24, r = t >= 20 && t < 24;
  return a === "aggressive" ? {
    strategy: a,
    enableH2: !0,
    enableH3: !0,
    peakDowngrade: !1,
    forceH1: !1,
    isPeakHour: r
  } : a === "balanced" ? {
    strategy: a,
    enableH2: !0,
    enableH3: !0,
    peakDowngrade: !0,
    forceH1: r,
    isPeakHour: r
  } : {
    strategy: "compat",
    enableH2: !1,
    enableH3: !1,
    peakDowngrade: !0,
    forceH1: !0,
    isPeakHour: r
  };
}
function Tf(n = {}, e = {}) {
  const { kernel: a } = n, { CacheManager: t, buildAdminLocalIndexUploadRecord: r } = n;
  return {
    async saveOrImport(o, { action: s, ctx: i, kv: c, env: l }) {
      const u = s === "save" ? [o] : o.nodes, d = Wo(u, l);
      if (d) return B("NODE_NAME_RESERVED", "节点路径与系统保留路由冲突，请更换后重试", 409, d);
      const f = Vo(u, l);
      return f ? B(f.code, f.message, 400, f) : await Yt(c)(async () => {
        const m = [], p = /* @__PURE__ */ new Map(), g = [], h = Ke(l), y = await ue(l);
        for (const b of u) {
          if (!b.name || !b.target && !(Array.isArray(b.lines) && b.lines.length)) continue;
          const R = String(b.name).toLowerCase(), E = b.originalName ? String(b.originalName).toLowerCase() : null, D = !!(E && E !== R);
          if (s === "save" && (!E || E !== R) && await c.get(`${a.PREFIX}${R}`, { type: "json" }))
            return B("NODE_NAME_CONFLICT", "节点路径已存在，请更换后重试", 409, { name: R });
          let w = {};
          D ? w = await c.get(`${a.PREFIX}${E}`, { type: "json" }) || {} : w = await c.get(`${a.PREFIX}${R}`, { type: "json" }) || {};
          const C = a.buildPreparedNodeMutation(b, w, {
            previousName: E || R,
            nextName: R
          });
          C && (C.dnsPlan = a.buildHostPrefixDnsSyncPlan(C.previousName, C.previousNode, C.nextName, C.nextNode, h, {
            config: y,
            forceUpsert: !0
          }), g.push(C), C.isRename && p.set(C.previousName, C.nextName), m.push(R));
        }
        if (s === "save" && m.length === 0) return B("INVALID_TARGET", "目标源站必须是有效的 http/https URL");
        const S = m.length > 0 || p.size > 0;
        let _ = !1, A = null;
        try {
          await a.applyPreparedNodeMutations(g, {
            env: l,
            kv: c,
            ctx: i,
            requestHost: h
          }), _ = g.some((C) => C?.nodeChanged === !0);
          const b = S ? await a.rebuildNodeIndexesFromKv(c, {
            ctx: i,
            syncLegacyIndex: s === "import"
          }) : null, R = Array.isArray(b?.summaries) ? b.summaries : await t.getNodesList(l, i), E = new Map((Array.isArray(R) ? R : []).map((C) => [String(C?.name || "").toLowerCase().trim(), C])), D = m.map((C) => E.get(String(C || "").toLowerCase().trim()) || null).filter(Boolean), w = Array.isArray(b?.index) ? b.index : Array.isArray(R) ? R.map((C) => C?.name) : [];
          if ((p.size > 0 || s === "save" && D.length === 1) && (A = await a.captureRuntimeConfigRollbackState(l, c), p.size > 0 && await a.commitSourceDirectNodesConfigWithinMutation(l, c, i, {
            renameMap: p,
            allowedNames: w,
            source: s === "import" ? "node_import" : "node_save",
            note: [...p.entries()].map(([C, T]) => `${C}->${T}`).join(",")
          }), s === "save" && D.length === 1)) {
            const C = D[0];
            await a.commitSingleNodeMainVideoStreamShortcutShadowWithinMutation(l, c, i, {
              originalName: o.originalName,
              nodeName: C?.name,
              mode: C?.mainVideoStreamMode,
              source: "node_save",
              note: String(C?.name || "").trim()
            });
          }
          return J({
            success: !0,
            node: s === "save" ? D[0] : void 0,
            nodes: R,
            importedNodes: s === "import" ? D : void 0,
            revisions: await a.getAdminRevisions(l, {
              ctx: i,
              nodes: R
            })
          });
        } catch (b) {
          let R = "", E = "";
          if (A) try {
            await a.restoreCapturedRuntimeConfigState(A, {
              env: l,
              kv: c,
              ctx: i
            });
          } catch (D) {
            R = ie(D, "config_restore_failed");
          }
          if (_) try {
            await a.rollbackPreparedNodeMutations(g, {
              env: l,
              kv: c,
              ctx: i,
              requestHost: h,
              rebuildIndexes: !0
            });
          } catch (D) {
            E = ie(D, "rollback_failed");
          }
          throw b && typeof b == "object" && (String(b.code || "").trim() || (b.code = "NODE_MUTATION_FAILED"), b.status = De(b.status, 500), (A || _) && (b.details = {
            ...F(b.details) ? b.details : {},
            rollbackAttempted: !0,
            configRollbackError: R,
            nodeRollbackError: E
          })), b;
        }
      });
    },
    async saveMainVideoStreamPolicyShortcuts(o, { env: s, ctx: i, kv: c }) {
      return c ? await Yt(c)(async () => {
        const l = await a.loadAllNodeEntitiesFromKv(c, { ctx: i }), u = Array.isArray(l) ? l.map((R) => R?.name) : [], d = Wn(o?.selectedNodeNames || [], { allowedNames: u }), f = new Set(d.map((R) => String(R || "").trim().toLowerCase()).filter(Boolean));
        let m = 0;
        const p = Ke(s), g = await ue(s), h = [];
        for (const R of Array.isArray(l) ? l : []) {
          if (!F(R)) continue;
          const E = String(R.name || "").trim().toLowerCase();
          if (!E) continue;
          const D = Fr(R);
          let w = D;
          if (f.has(E) ? w = "direct" : D === "direct" && (w = "inherit"), w !== D) {
            const { name: C, ...T } = R, I = {
              name: E,
              ...T,
              mainVideoStreamMode: w
            }, P = a.buildPreparedNodeMutation(I, R, {
              previousName: E,
              nextName: E
            });
            if (!P) continue;
            P.nextNode = a.normalizeNode(E, P.nextNode || I, { dropLegacyDirectRouting: !0 }).data, P.dnsPlan = a.buildHostPrefixDnsSyncPlan(P.previousName, P.previousNode, P.nextName, P.nextNode, p, {
              config: g,
              forceUpsert: !0
            }), h.push(P), m += 1;
          }
        }
        const y = se(g.sourceDirectNodes || []) !== se(d), S = m > 0 || y ? await a.captureRuntimeConfigRollbackState(s, c) : null;
        let _ = null, A = g;
        try {
          m > 0 && (await a.applyPreparedNodeMutations(h, {
            env: s,
            kv: c,
            ctx: i,
            requestHost: p
          }), _ = await a.rebuildNodeIndexesFromKv(c, { ctx: i })), y && (A = await a.commitRuntimeConfig({
            ...g,
            sourceDirectNodes: d
          }, {
            env: s,
            kv: c,
            ctx: i,
            snapshotMeta: {
              reason: "sync_main_video_stream_shortcuts",
              section: "proxy",
              source: "ui_shortcut",
              actor: "admin",
              note: d.join(",")
            }
          }));
        } catch (R) {
          let E = "", D = "";
          if (S) try {
            await a.restoreCapturedRuntimeConfigState(S, {
              env: s,
              kv: c,
              ctx: i
            });
          } catch (w) {
            E = ie(w, "config_restore_failed");
          }
          if (m > 0) try {
            await a.rollbackPreparedNodeMutations(h, {
              env: s,
              kv: c,
              ctx: i,
              requestHost: p,
              rebuildIndexes: !0
            });
          } catch (w) {
            D = ie(w, "rollback_failed");
          }
          throw R && typeof R == "object" && (String(R.code || "").trim() || (R.code = "NODE_MUTATION_FAILED"), R.status = De(R.status, 500), R.details = {
            ...F(R.details) ? R.details : {},
            rollbackAttempted: !0,
            configRollbackError: E,
            nodeRollbackError: D
          }), R;
        }
        const b = Array.isArray(_?.summaries) ? _.summaries : await t.getNodesList(s, i);
        return J({
          success: !0,
          selectedNodeNames: d,
          updatedNodeCount: m,
          config: st(A),
          nodes: b,
          revisions: await a.getAdminRevisions(s, {
            ctx: i,
            config: A,
            nodes: b
          })
        });
      }) : B("KV_UNAVAILABLE", "KV 未绑定或不可用", 500);
    },
    async importFull(o, { env: s, ctx: i, kv: c }) {
      const l = Wo(o?.nodes, s);
      if (l) return B("NODE_NAME_RESERVED", "节点路径与系统保留路由冲突，请更换后重试", 409, l);
      const u = Vo(o?.nodes, s);
      if (u) return B(u.code, u.message, 400, u);
      const d = je(o?.config?.indexUrl || "");
      let f = null;
      if (F(o?.adminIndexUpload)) {
        const m = String(o.adminIndexUpload.fileName || "").trim().split(/[\\/]+/).pop() || "";
        if (m.toLowerCase() !== "index.html") return B("ADMIN_INDEX_BACKUP_INVALID", "完整备份中的 HTML 文件名必须是 index.html", 400);
        try {
          f = await r(o.adminIndexUpload.html, m);
        } catch (p) {
          return B(String(p?.code || "ADMIN_INDEX_BACKUP_INVALID"), ie(p, "完整备份中的 index.html 无效"), De(p?.status, 400), F(p?.details) ? p.details : null);
        }
        if (d && f.revision !== d) return B("ADMIN_INDEX_BACKUP_REVISION_MISMATCH", "完整备份中的 index.html 与配置版本不一致", 400, {
          expectedRevision: d,
          actualRevision: f.revision
        });
      }
      return d && !f && !await a.getAdminIndexUploadRecord(c, d) ? B("ADMIN_INDEX_BACKUP_MISSING", "完整备份缺少当前配置引用的 index.html", 400, { revision: d }) : await Yt(c)(async () => {
        const m = await ue(s), p = o.config ? await a.captureRuntimeConfigRollbackState(s, c) : null, g = o.config ? Ui(o.config, m) : null, h = g ? te(g) : m, y = Ke(s), S = f ? a.buildAdminIndexUploadKey(f.revision) : "", _ = S ? await c.get(S) : null, A = o.config ? await c.get(a.ADMIN_ACTIVE_INDEX_KEY) : null, b = d ? f || await a.getAdminIndexUploadRecord(c, d) : null, R = [];
        if (Array.isArray(o.nodes)) for (const T of o.nodes) {
          if (!T.name || !T.target && !(Array.isArray(T.lines) && T.lines.length)) continue;
          const I = String(T.name).toLowerCase(), P = await c.get(`${a.PREFIX}${I}`, { type: "json" }) || {}, U = a.buildPreparedNodeMutation(T, P, {
            previousName: I,
            nextName: I
          });
          U && (U.dnsPlan = a.buildHostPrefixDnsSyncPlan(U.previousName, U.previousNode, U.nextName, U.nextNode, y, {
            previousConfig: m,
            nextConfig: h,
            forceUpsert: !0
          }), R.push(U));
        }
        let E = null, D = !1;
        try {
          S && await c.put(S, JSON.stringify(f)), g && (b ? await c.put(a.ADMIN_ACTIVE_INDEX_KEY, JSON.stringify(b)) : await c.delete(a.ADMIN_ACTIVE_INDEX_KEY)), g && (E = await a.commitRuntimeConfig(g, {
            env: s,
            kv: c,
            ctx: i,
            snapshotMeta: {
              reason: "import_full",
              section: "all",
              source: "full_backup",
              actor: "admin"
            }
          })), R.length > 0 && (await a.applyPreparedNodeMutations(R, {
            env: s,
            kv: c,
            ctx: i,
            requestHost: y
          }), D = !0, await a.rebuildNodeIndexesFromKv(c, {
            ctx: i,
            syncLegacyIndex: !0
          }));
        } catch (T) {
          let I = "", P = "", U = "";
          if (D) try {
            await a.rollbackPreparedNodeMutations(R, {
              env: s,
              kv: c,
              ctx: i,
              requestHost: y,
              rebuildIndexes: !0
            });
          } catch (K) {
            P = ie(K, "rollback_failed");
          }
          if (p) try {
            await a.restoreCapturedRuntimeConfigAndDnsState(p, {
              env: s,
              kv: c,
              ctx: i
            });
          } catch (K) {
            I = ie(K, "config_restore_failed");
          }
          if (S) try {
            _ === null ? await c.delete(S) : await c.put(S, _);
          } catch (K) {
            U = ie(K, "admin_index_restore_failed");
          }
          if (o.config) try {
            A === null ? await c.delete(a.ADMIN_ACTIVE_INDEX_KEY) : await c.put(a.ADMIN_ACTIVE_INDEX_KEY, A);
          } catch (K) {
            U = [U, ie(K, "active_admin_index_restore_failed")].filter(Boolean).join("; ");
          }
          throw T && typeof T == "object" && (String(T.code || "").trim() || (T.code = "IMPORT_FULL_FAILED"), T.status = De(T.status, 500), T.details = {
            ...F(T.details) ? T.details : {},
            rollbackAttempted: !!p || D || !!S,
            configRollbackError: I,
            nodeRollbackError: P,
            adminIndexRollbackError: U
          }), T;
        }
        const w = E || await Ae(s), C = await t.getNodesList(s, i);
        return J({
          success: !0,
          config: w,
          nodes: C,
          adminIndexUpload: f ? {
            revision: f.revision,
            fileName: f.fileName,
            bytes: f.bytes
          } : null,
          revisions: await a.getAdminRevisions(s, {
            ctx: i,
            config: w,
            nodes: C
          })
        });
      });
    },
    async delete(o, { ctx: s, kv: i, env: c }) {
      return await Yt(i)(async () => {
        if (o.name) {
          const l = String(o.name).toLowerCase(), u = await ue(c), d = await i.get(`${a.PREFIX}${l}`, { type: "json" }) || null, f = d ? a.normalizeNode(l, d || {}).data : null, m = {
            previousName: l,
            previousNode: f,
            nextName: l,
            nextNode: null,
            isRename: !1,
            nodeChanged: !!f,
            isSemanticNoop: !f,
            dnsPlan: a.buildHostPrefixDnsSyncPlan(l, f, "", null, Ke(c), { config: u })
          }, p = Ke(c);
          let g = !1, h = null;
          try {
            await a.applyPreparedNodeMutations([m], {
              env: c,
              kv: i,
              ctx: s,
              requestHost: p
            }), g = m.nodeChanged === !0;
            const y = await a.rebuildNodeIndexesFromKv(i, { ctx: s });
            h = await a.captureRuntimeConfigRollbackState(c, i), await a.commitSourceDirectNodesConfigWithinMutation(c, i, s, {
              removedNames: [l],
              allowedNames: Array.isArray(y?.index) ? y.index : [],
              source: "node_delete",
              note: l
            });
          } catch (y) {
            let S = "", _ = "";
            if (h) try {
              await a.restoreCapturedRuntimeConfigState(h, {
                env: c,
                kv: i,
                ctx: s
              });
            } catch (A) {
              S = ie(A, "config_restore_failed");
            }
            if (g) try {
              await a.rollbackPreparedNodeMutations([m], {
                env: c,
                kv: i,
                ctx: s,
                requestHost: p,
                rebuildIndexes: !0
              });
            } catch (A) {
              _ = ie(A, "rollback_failed");
            }
            throw y && typeof y == "object" && (String(y.code || "").trim() || (y.code = "NODE_DELETE_FAILED"), y.status = De(y.status, 500), (h || g) && (y.details = {
              ...F(y.details) ? y.details : {},
              rollbackAttempted: !0,
              configRollbackError: S,
              nodeRollbackError: _
            })), y;
          }
        }
        return J({
          success: !0,
          revisions: await a.getAdminRevisions(c, { ctx: s })
        });
      });
    },
    async purgeCache(o, { kv: s, request: i }) {
      if (i.headers.get("X-Admin-Confirm") !== "purgeCache") return B("CONFIRMATION_REQUIRED", "敏感操作需要显式确认头", 428);
      const c = await s.get(a.CONFIG_KEY, { type: "json" }) || {};
      if (!c.cfZoneId || !c.cfApiToken) return B("CF_API_ERROR", "请在账号设置中完善 Zone ID 和 API 令牌");
      try {
        return (await Oe(`https://api.cloudflare.com/client/v4/zones/${encodeURIComponent(String(c.cfZoneId).trim())}/purge_cache`, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${c.cfApiToken}`,
            "Content-Type": "application/json"
          },
          body: JSON.stringify({ purge_everything: !0 })
        })).ok ? J({ success: !0 }) : B("PURGE_FAILED", "清理失败，请检查密钥权限");
      } catch (l) {
        return B("PURGE_ERROR", l.message);
      }
    }
  };
}
function wf(n = {}, e = {}) {
  const { kernel: a } = n;
  return {
    async tidyKvData(t, { env: r, ctx: o, kv: s, db: i }) {
      if (!s) return B("KV_NOT_CONFIGURED", "请先绑定 ENI_KV / KV Namespace");
      try {
        const c = await a.tidyKvData(r, {
          kv: s,
          db: i,
          ctx: o,
          planToken: String(t?.planToken || "").trim()
        }), l = (/* @__PURE__ */ new Date()).toISOString();
        return await ge(a.patchOpsStatus(r, { scheduled: { kvTidy: {
          status: "success",
          lastSuccessAt: l,
          lastTriggeredBy: "manual",
          summary: c.summary
        } } }), "manual.tidy_kv.patch_success_status", null, null), J({
          success: !0,
          ...c
        });
      } catch (c) {
        const l = c?.message || String(c);
        return await ge(a.patchOpsStatus(r, { scheduled: { kvTidy: {
          status: "failed",
          lastErrorAt: (/* @__PURE__ */ new Date()).toISOString(),
          lastError: l,
          lastTriggeredBy: "manual"
        } } }), "manual.tidy_kv.patch_failed_status", { message: l }, null), B(String(c?.code || "KV_TIDY_FAILED"), l, De(c?.status, 500), F(c?.details) ? c.details : null);
      }
    },
    async tidyD1Data(t, { env: r, ctx: o, kv: s, db: i }) {
      if (!i) return B("D1_NOT_CONFIGURED", "请先绑定 D1 / PROXY_LOGS 数据库");
      try {
        const c = lt(t?.maintenanceMode, "manual"), l = await a.tidyD1Data(r, {
          db: i,
          kv: s,
          ctx: o,
          maintenanceMode: c,
          planToken: String(t?.planToken || "").trim()
        }), u = (/* @__PURE__ */ new Date()).toISOString(), d = a.buildD1TidyStatusPayload(l.summary, {
          mode: "manual",
          maintenanceMode: c,
          triggeredBy: "manual",
          timestamp: u
        });
        return await ge(a.patchOpsStatus({
          kv: s,
          db: i
        }, { scheduled: { ...d } }), "manual.tidy_d1.patch_success_status", null, null), J({
          success: !0,
          ...l
        });
      } catch (c) {
        const l = c?.message || String(c), u = a.buildD1TidyStatusPayload({
          status: "failed",
          lastError: l,
          maintenanceMode: lt(t?.maintenanceMode, "manual")
        }, {
          mode: "manual",
          maintenanceMode: lt(t?.maintenanceMode, "manual"),
          triggeredBy: "manual",
          timestamp: (/* @__PURE__ */ new Date()).toISOString()
        });
        return await ge(a.patchOpsStatus({
          kv: s,
          db: i
        }, { scheduled: { ...u } }), "manual.tidy_d1.patch_failed_status", { message: l }, null), B("D1_TIDY_FAILED", l, 500);
      }
    }
  };
}
function Df(n = "") {
  return String(n || "").trim().toLowerCase() === "a" ? "a" : "cname";
}
function zt(n = {}) {
  return {
    id: String(n?.id || "").trim(),
    type: String(n?.type || "").trim().toUpperCase(),
    name: ee(n?.name),
    content: String(n?.content || "").trim(),
    ttl: Number(n?.ttl) || 1,
    proxied: n?.proxied === !0,
    comment: typeof n?.comment == "string" ? n.comment : void 0,
    tags: Array.isArray(n?.tags) ? n.tags.map((e) => String(e)) : void 0
  };
}
async function Pr(n, e, a = {}) {
  const t = [];
  let r = 1, o = 1;
  const s = 100, i = ee(a?.nameExact || "");
  do {
    const c = new URL(`https://api.cloudflare.com/client/v4/zones/${encodeURIComponent(n)}/dns_records`);
    c.searchParams.set("page", String(r)), c.searchParams.set("per_page", String(s)), i && c.searchParams.set("name.exact", i);
    const l = await be(c.toString(), e);
    Array.isArray(l?.result) && t.push(...l.result.map((u) => zt(u)).filter((u) => u.id && u.name)), o = Number(l?.result_info?.total_pages || l?.result_info?.totalPages || 1), r += 1;
  } while (r <= o && r <= 20);
  return t;
}
function oa(n = {}, e = {}) {
  const a = {
    type: String(e.type || n?.type || "A").trim().toUpperCase(),
    name: ee(e.host || n?.name),
    content: String(e.content || "").trim(),
    ttl: Number(n?.ttl) || 1,
    proxied: n?.proxied === !0
  };
  return typeof n?.comment == "string" && (a.comment = n.comment), Array.isArray(n?.tags) && (a.tags = n.tags.map((t) => String(t))), a;
}
function Nf(n = "", e = "") {
  const a = String(n || "").trim().toUpperCase(), t = String(e || "").trim();
  return t ? a === "A" ? t : t.toLowerCase() : "";
}
function xr(n = "", e = "") {
  const a = String(n || "").trim().toUpperCase(), t = Nf(a, e);
  return !a || !t ? "" : `${a}|${t}`;
}
function Lf(n = []) {
  const e = [], a = /* @__PURE__ */ new Set();
  let t = 0;
  for (const r of Array.isArray(n) ? n : []) {
    const o = String(r?.type || "").trim().toUpperCase(), s = String(r?.content || "").trim(), i = xr(o, s);
    if (i) {
      if (a.has(i)) {
        t += 1;
        continue;
      }
      a.add(i), e.push({
        type: o,
        content: s,
        ttl: Number(r?.ttl) || 1,
        proxied: r?.proxied === !0,
        comment: typeof r?.comment == "string" ? r.comment : void 0,
        tags: Array.isArray(r?.tags) ? r.tags.map((c) => String(c)) : void 0
      });
    }
  }
  return {
    records: e,
    duplicateCount: t
  };
}
function ls(n = "", e = 0) {
  return {
    type: String(n || "").trim().toUpperCase(),
    desiredCount: Math.max(0, Number(e) || 0),
    identicalCount: 0,
    updatedCount: 0,
    createdCount: 0,
    deletedCount: 0
  };
}
function Mf(n = "a", e = {}, a = {}) {
  const t = {};
  let r = 0, o = 0, s = 0, i = 0, c = 0;
  for (const u of [
    "A",
    "AAAA",
    "CNAME"
  ]) {
    const d = e?.[u];
    !d || typeof d != "object" || (t[u] = {
      type: u,
      desiredCount: Math.max(0, Number(d.desiredCount) || 0),
      identicalCount: Math.max(0, Number(d.identicalCount) || 0),
      updatedCount: Math.max(0, Number(d.updatedCount) || 0),
      createdCount: Math.max(0, Number(d.createdCount) || 0),
      deletedCount: Math.max(0, Number(d.deletedCount) || 0)
    }, r += t[u].desiredCount, o += t[u].identicalCount, s += t[u].updatedCount, i += t[u].createdCount, c += t[u].deletedCount);
  }
  const l = s + i + c;
  return {
    mode: String(n || "a").trim().toLowerCase(),
    desiredCount: r,
    identicalCount: o,
    updatedCount: s,
    createdCount: i,
    deletedCount: c,
    changedCount: l,
    dedupedDesiredCount: Math.max(0, Number(a?.dedupedDesiredCount) || 0),
    familySummaries: t,
    unchangedOnly: l === 0 && o > 0
  };
}
async function If(n = {}, e) {
  const a = String(n?.cfZoneId || "").trim(), t = String(n?.cfApiToken || "").trim();
  if (!a || !t) throw new Error("cf_api_missing");
  const r = ee(new URL(e.url).hostname), o = await Xi(a, t, {
    scope: "dns.resolve_admin_context.zone_lookup",
    context: { requestHost: r }
  }), s = await Pr(a, t), i = String(o?.name || "").trim() || "", c = i || ee(s[0]?.name || "");
  let l = r;
  ca(l, c || i) || (l = ee(await Xd({
    cfAccountId: n.cfAccountId,
    cfZoneId: a,
    cfApiToken: t,
    zoneNameFallback: c || i || r
  })));
  const u = s.filter((f) => fr(f.type)), d = l ? u.filter((f) => ee(f.name) === l) : u;
  return {
    cfZoneId: a,
    cfApiToken: t,
    zone: o,
    zoneName: i,
    currentHost: l,
    requestHost: r,
    totalRecords: s.length,
    editableRecords: u,
    currentHostRecords: d
  };
}
function Pf(n = {}) {
  const e = te(n), a = String(e.cfZoneId || "").trim(), t = String(e.cfApiToken || "").trim();
  if (!a || !t) {
    const r = /* @__PURE__ */ new Error("请在账号设置中完善 Zone ID 和 API 令牌");
    throw r.code = "CF_API_ERROR", r.status = 400, r;
  }
  return {
    cfZoneId: a,
    cfApiToken: t
  };
}
function xf(n = []) {
  return {
    A: ls("A", n.filter((e) => e.type === "A").length),
    AAAA: ls("AAAA", n.filter((e) => e.type === "AAAA").length)
  };
}
function Of(n = "", e = [], a = []) {
  const t = /* @__PURE__ */ new Map(), r = [];
  let o = 0;
  for (const i of e) {
    const c = xr(n, i?.content);
    c && t.set(c, (t.get(c) || 0) + 1);
  }
  for (const i of a) {
    const c = xr(n, i?.content), l = t.get(c) || 0;
    if (l > 0) {
      o += 1, t.set(c, l - 1);
      continue;
    }
    r.push(i);
  }
  const s = [];
  for (const i of e) {
    const c = xr(n, i?.content), l = t.get(c) || 0;
    l <= 0 || (s.push(i), t.set(c, l - 1));
  }
  return {
    identicalCount: o,
    reusableCurrentRecords: r,
    pendingDesiredRecords: s
  };
}
function cc(n = "", e = "", a = "", t = "", r = {}) {
  const o = async () => (await Pr(n, e, { nameExact: a })).filter((s) => ee(s.name) === a && fr(s.type));
  return {
    async deleteRecord(s) {
      s?.id && await be(`${t}/${encodeURIComponent(s.id)}`, e, { method: "DELETE" });
    },
    async updateRecord(s, i, c) {
      const l = oa(s, {
        host: a,
        type: i,
        content: c
      });
      return zt((await be(`${t}/${encodeURIComponent(s.id)}`, e, {
        method: "PUT",
        body: JSON.stringify(l)
      }))?.result || {
        id: s.id,
        ...l
      });
    },
    async createRecord(s, i, c = r) {
      const l = oa(c, {
        host: a,
        type: s,
        content: i
      });
      try {
        return {
          record: zt((await be(t, e, {
            method: "POST",
            body: JSON.stringify(l)
          }))?.result || l),
          reusedExisting: !1
        };
      } catch (u) {
        if (String(u?.message || u || "").includes("81058")) {
          const d = (await o()).find((f) => ee(f?.name) === a && String(f?.type || "").toUpperCase() === String(s || "").trim().toUpperCase() && xr(f?.type, f?.content) === xr(s, i));
          if (d) return {
            record: zt(d),
            reusedExisting: !0
          };
        }
        throw u;
      }
    },
    async listCurrentHostRecords() {
      return await o();
    }
  };
}
async function us(n = "", e = [], a = [], t = {}, r = {}) {
  const o = Of(n, e, a);
  t.identicalCount += o.identicalCount;
  const { reusableCurrentRecords: s, pendingDesiredRecords: i } = o;
  for (let c = 0; c < i.length; c += 1) {
    const l = i[c], u = s[c];
    if (u) {
      await r.updateRecord(u, n, l.content), t.updatedCount += 1;
      continue;
    }
    (await r.createRecord(n, l.content, a[0]))?.reusedExisting === !0 ? t.identicalCount += 1 : t.createdCount += 1;
  }
  for (let c = i.length; c < s.length; c += 1)
    await r.deleteRecord(s[c]), t.deletedCount += 1;
}
async function vf({ env: n, kv: e, dnsHistoryRepository: a, config: t, host: r, mode: o = "a", desiredRecords: s = [], requestHost: i = "", skipHistory: c = !1, includeAllRecords: l = !0, includeHistory: u = !0 }) {
  const { cfZoneId: d, cfApiToken: f } = Pf(t || await Ae(n));
  let m = !1, p = !1, g = "";
  const h = Lf(s), y = h.records, S = xf(y);
  try {
    const _ = await To(d, f, { scope: "dns.persist_records.zone_lookup" }), A = String(_?.name || "").trim() || "";
    if (A && !ca(r, A)) {
      const x = /* @__PURE__ */ new Error("当前站点不在该 Zone 下");
      throw x.code = "INVALID_HOST", x.status = 400, x;
    }
    const b = (await Pr(d, f, { nameExact: r })).filter((x) => ee(x.name) === r && fr(x.type)), R = {
      baseRecord: b[0] || {
        name: r,
        ttl: 1,
        proxied: !1
      },
      zoneRecordsUrl: `https://api.cloudflare.com/client/v4/zones/${encodeURIComponent(d)}/dns_records`
    }, E = cc(d, f, r, R.zoneRecordsUrl, R.baseRecord), D = b.map((x) => zt(x));
    let w = !1;
    const C = {
      ...E,
      async deleteRecord(x) {
        return w = !0, await E.deleteRecord(x);
      },
      async updateRecord(x, N, M) {
        return w = !0, await E.updateRecord(x, N, M);
      },
      async createRecord(x, N, M) {
        return w = !0, await E.createRecord(x, N, M);
      }
    };
    let T = [], I = null;
    try {
      if (o === "cname") {
        const x = b.filter((z) => z.type === "CNAME"), N = b.filter((z) => z.type === "A" || z.type === "AAAA");
        for (const z of N) await C.deleteRecord(z);
        for (let z = 1; z < x.length; z += 1) await C.deleteRecord(x[z]);
        const M = x[0] || null, L = y[0], v = Number(L?.ttl) || 1, W = L?.proxied === !0;
        if (M) {
          const z = String(M.content || "").trim() !== L.content, H = Number(M.ttl) !== v, j = M.proxied === !0 !== W;
          (z || H || j) && await C.updateRecord({
            ...M,
            ttl: v,
            proxied: W
          }, "CNAME", L.content);
        } else await C.createRecord("CNAME", L.content, {
          ...R.baseRecord,
          ttl: v,
          proxied: W
        });
        T = await Pr(d, f, { nameExact: r }), c || (I = await a.recordDnsHostHistory(e, d, r, {
          name: r,
          type: "CNAME",
          content: L.content,
          actor: "admin",
          source: "ui",
          requestHost: i,
          savedAt: (/* @__PURE__ */ new Date()).toISOString()
        }));
      } else {
        const x = b.filter((N) => N.type === "CNAME");
        for (const N of x) await C.deleteRecord(N);
        await us("A", y.filter((N) => N.type === "A"), b.filter((N) => N.type === "A"), S.A, C), await us("AAAA", y.filter((N) => N.type === "AAAA"), b.filter((N) => N.type === "AAAA"), S.AAAA, C), T = await Pr(d, f, { nameExact: r });
      }
    } catch (x) {
      if (w) {
        m = !0;
        try {
          const N = await E.listCurrentHostRecords();
          for (const M of N) await E.deleteRecord(M);
          for (const M of D) await E.createRecord(M.type, M.content, M);
          p = !0;
        } catch (N) {
          p = !1, g = String(N?.message || N || "unknown_rollback_error");
        }
      }
      throw x;
    }
    const P = T.filter((x) => fr(x.type)), U = P.filter((x) => ee(x.name) === r), K = u === !0 ? I || await a.getDnsHostHistory(e, d, r) : [], G = o === "a" ? Mf(o, S, { dedupedDesiredCount: h.duplicateCount }) : null;
    return {
      ok: !0,
      zoneId: d,
      zoneName: A,
      currentHost: r,
      totalRecords: T.length,
      editableRecordCount: P.length,
      filteredCount: U.length,
      records: U,
      ...l === !0 ? { allRecords: P } : {},
      allRecordsIncluded: l === !0,
      history: K,
      mode: o,
      syncSummary: G,
      rollbackAttempted: m,
      rollbackSucceeded: p,
      rollbackError: g
    };
  } catch (_) {
    throw _.details = {
      ..._?.details && typeof _.details == "object" ? _.details : {},
      rollbackAttempted: m,
      rollbackSucceeded: p,
      rollbackError: g
    }, _;
  }
}
function Ff(n = {}, e = {}) {
  const { kernel: a } = n, { persistCloudflareDnsRecordsForHost: t } = n;
  return {
    async listDnsRecords(r, { env: o, kv: s, request: i }) {
      const c = te(await Ae(o)), l = String(c.cfZoneId || "").trim(), u = String(c.cfApiToken || "").trim(), d = r?.includeAllRecords !== !1;
      if (!l || !u) return B("CF_API_ERROR", "请在账号设置中完善 Zone ID 和 API 令牌");
      try {
        const f = await If(c, i), m = f.currentHostRecords, p = f.currentHost ? await a.getDnsHostHistory(s, l, f.currentHost) : [];
        return J({
          ok: !0,
          zoneId: l,
          zoneName: f.zoneName,
          currentHost: f.currentHost,
          totalRecords: f.totalRecords,
          editableRecordCount: f.editableRecords.length,
          filteredCount: m.length,
          records: m,
          ...d === !0 ? { allRecords: f.editableRecords } : {},
          allRecordsIncluded: d === !0,
          history: p
        });
      } catch (f) {
        const m = String(f?.message || f || "unknown_error");
        return B("CF_DNS_LIST_FAILED", m.includes("cf_api_http_403") ? "Cloudflare DNS 读取失败：API 令牌权限不足（需要 Zone.DNS:Read）" : m.includes("cf_api_http_401") ? "Cloudflare DNS 读取失败：API 令牌无效" : "Cloudflare DNS 读取失败", 400, { reason: m });
      }
    },
    async setDnsHistoryFallback(r, { env: o, kv: s }) {
      const i = ee(r?.host || ""), c = String(r?.entryId || "").trim(), l = r?.enabled !== !1;
      if (!i) return B("MISSING_PARAMS", "host 不能为空");
      if (l && !c) return B("MISSING_PARAMS", "entryId 不能为空");
      const u = te(await Ae(o)), d = String(u.cfZoneId || "").trim();
      if (!d) return B("CF_API_ERROR", "请先在账号设置中保存 Zone ID");
      try {
        return J({
          ok: !0,
          history: await a.setDnsHostHistoryPreferredFallback(s, d, i, c, l)
        });
      } catch (f) {
        const m = String(f?.message || f || "unknown_error");
        return m.includes("dns_history_entry_not_found") ? B("DNS_HISTORY_ENTRY_NOT_FOUND", "指定的 DNS 历史记录不存在", 404) : B("DNS_HISTORY_FALLBACK_UPDATE_FAILED", "设置 DNS 默认回退值失败", 400, { reason: m });
      }
    },
    async createDnsRecord(r, o) {
      return e.updateDnsRecord(r, o);
    },
    async updateDnsRecord(r, { env: o, kv: s, request: i }) {
      const c = String(i.headers.get("X-Admin-Confirm") || "").trim();
      if (c !== "updateDnsRecord" && c !== "createDnsRecord") return B("CONFIRMATION_REQUIRED", "敏感 DNS 操作需要显式确认头", 428);
      const l = String(r?.recordId || r?.id || "").trim(), u = ee(r?.host || r?.name || ""), d = String(r?.type || "").trim().toUpperCase(), f = String(r?.content || "").trim(), m = r?.skipHistory === !0;
      if (!fr(d)) return B("INVALID_TYPE", "Type 仅允许 A / AAAA / CNAME");
      const p = Ia(d, f);
      if (p) return B("INVALID_CONTENT", p);
      if (!l && !u) return B("MISSING_PARAMS", "host 不能为空");
      const g = te(await Ae(o)), h = String(g.cfZoneId || "").trim(), y = String(g.cfApiToken || "").trim();
      if (!h || !y) return B("CF_API_ERROR", "请在账号设置中完善 Zone ID 和 API 令牌");
      let S = null, _ = !1, A = !1, b = "";
      try {
        const R = await To(h, y, { scope: "dns.update_record.zone_lookup" }), E = String(R?.name || "").trim(), D = ee(new URL(i.url).hostname);
        let w = null;
        if (l) {
          const T = `https://api.cloudflare.com/client/v4/zones/${encodeURIComponent(h)}/dns_records/${encodeURIComponent(l)}`, I = zt((await be(T, y))?.result || null);
          if (!I?.id) return B("NOT_FOUND", "DNS 记录不存在", 404);
          const P = String(I?.type || "").toUpperCase();
          if (!fr(P)) return B("UNSUPPORTED_RECORD_TYPE", "该 DNS 记录类型不支持编辑", 400, { currentType: P });
          const U = u || I.name;
          if (!U) return B("MISSING_PARAMS", "host 不能为空");
          if (E && !ca(U, E)) return B("INVALID_HOST", "记录名称必须位于当前 Zone 下");
          const K = oa(I, {
            host: U,
            type: d,
            content: f
          });
          w = zt((await be(T, y, {
            method: "PUT",
            body: JSON.stringify(K)
          }))?.result || {
            id: l,
            ...K
          }), S = async () => {
            const G = oa(I, {
              host: I.name,
              type: I.type,
              content: I.content
            });
            await be(T, y, {
              method: "PUT",
              body: JSON.stringify(G)
            });
          };
        } else {
          if (E && !ca(u, E)) return B("INVALID_HOST", "记录名称必须位于当前 Zone 下");
          const T = `https://api.cloudflare.com/client/v4/zones/${encodeURIComponent(h)}/dns_records`, I = oa({
            name: u,
            ttl: 1,
            proxied: !1
          }, {
            host: u,
            type: d,
            content: f
          });
          w = zt((await be(T, y, {
            method: "POST",
            body: JSON.stringify(I)
          }))?.result || I), S = async () => {
            if (!w?.id) throw new Error("created_dns_record_id_missing");
            await be(`${T}/${encodeURIComponent(w.id)}`, y, { method: "DELETE" });
          };
        }
        let C;
        try {
          C = w.type === "CNAME" && !m ? await a.recordDnsHostHistory(s, h, w.name, {
            name: w.name,
            type: w.type,
            content: w.content,
            actor: "admin",
            source: "ui",
            requestHost: D,
            savedAt: (/* @__PURE__ */ new Date()).toISOString()
          }) : await a.getDnsHostHistory(s, h, w.name);
        } catch (T) {
          if (_ = typeof S == "function", _) try {
            await S(), A = !0;
          } catch (I) {
            b = ie(I, "dns_rollback_failed");
          }
          throw T;
        }
        return J({
          ok: !0,
          record: w,
          history: C
        });
      } catch (R) {
        const E = String(R?.message || R || "unknown_error");
        return B("CF_DNS_UPDATE_FAILED", E.includes("cf_api_http_403") ? "Cloudflare DNS 更新失败：API 令牌权限不足（需要 Zone.DNS:Edit）" : E.includes("cf_api_http_401") ? "Cloudflare DNS 更新失败：API 令牌无效" : "Cloudflare DNS 更新失败", 400, {
          reason: E,
          rollbackAttempted: _,
          rollbackSucceeded: A,
          rollbackError: b
        });
      }
    },
    async saveDnsRecords(r, { env: o, kv: s, request: i }) {
      if (i.headers.get("X-Admin-Confirm") !== "saveDnsRecords") return B("CONFIRMATION_REQUIRED", "敏感 DNS 操作需要显式确认头", 428);
      const c = Df(r?.mode), l = ee(r?.host || ""), u = r?.includeAllRecords === !0, d = Array.isArray(r?.records) ? r.records : [];
      if (!l) return B("MISSING_PARAMS", "host 不能为空");
      const f = [];
      if (c === "cname") {
        const h = String(d[0]?.content || "").trim(), y = Ia("CNAME", h);
        if (y) return B("INVALID_CONTENT", y);
        f.push({
          type: "CNAME",
          content: h
        });
      } else {
        const h = d.map((y) => ({
          type: String(y?.type || "").trim().toUpperCase(),
          content: String(y?.content || "").trim()
        })).filter((y) => y.type || y.content);
        if (!h.length) return B("INVALID_CONTENT", "A 模式至少保留 1 条 A / AAAA 记录");
        for (const y of h) {
          if (!["A", "AAAA"].includes(y.type)) return B("INVALID_TYPE", "A 模式仅允许 A / AAAA");
          const S = Ia(y.type, y.content, { allowCname: !1 });
          if (S) return B("INVALID_CONTENT", S);
          f.push(y);
        }
      }
      const m = te(await Ae(o)), p = String(m.cfZoneId || "").trim(), g = String(m.cfApiToken || "").trim();
      if (!p || !g) return B("CF_API_ERROR", "请在账号设置中完善 Zone ID 和 API 令牌");
      try {
        const h = ee(new URL(i.url).hostname);
        return J(await t({
          env: o,
          kv: s,
          config: m,
          host: l,
          mode: c,
          desiredRecords: f,
          requestHost: h,
          skipHistory: !1,
          includeAllRecords: u
        }));
      } catch (h) {
        const y = String(h?.message || h || "unknown_error");
        return B("CF_DNS_SAVE_FAILED", y.includes("cf_api_http_403") ? "Cloudflare DNS 保存失败：API 令牌权限不足（需要 Zone.DNS:Edit）" : y.includes("cf_api_http_401") ? "Cloudflare DNS 保存失败：API 令牌无效" : "Cloudflare DNS 保存失败", 400, {
          reason: y,
          rollbackAttempted: h?.details?.rollbackAttempted === !0,
          rollbackSucceeded: h?.details?.rollbackSucceeded === !0,
          rollbackError: String(h?.details?.rollbackError || "")
        });
      }
    }
  };
}
async function Gr(n, e, a) {
  const t = Array.isArray(n) ? n : [];
  if (t.length === 0) return [];
  if (typeof a != "function") throw new TypeError("worker must be a function");
  const r = Number(e), o = Number.isFinite(r) && r > 0 ? Math.min(t.length, Math.max(1, Math.floor(r))) : 1, s = new Array(t.length);
  let i = 0;
  const c = Array.from({ length: o }, async () => {
    for (; i < t.length; ) {
      const l = i;
      i += 1;
      const u = Promise.resolve().then(() => a(t[l]));
      s[l] = u, await u.catch(() => {
      });
    }
  });
  return await Promise.all(c), Promise.all(s);
}
var Uf = Object.freeze([{
  id: "cloudflare",
  label: "Cloudflare",
  endpoint: "https://cloudflare-dns.com/dns-query"
}]), lc = 30 * 1e3, Hf = lc, kf = "emby-proxy-ui-dns-probe/1.0", Kf = 2400 * 1e3, zf = 35 * 1e3, $f = "dns_ip_pool_fetch_lock:", Bf = "sys:dns_ip_pool_fetch_lock:v1:";
function Wf(n = {}, e = [], a = {}) {
  const t = /* @__PURE__ */ new Set(), r = [];
  for (const s of Array.isArray(e) ? e : []) {
    const i = lr(s);
    if (!i) continue;
    const c = String(i.ip || "").trim().toLowerCase();
    !c || t.has(c) || (t.add(c), r.push(i));
  }
  const o = r.slice(0, vr(n?.ipLimit));
  return {
    id: String(n?.id || ""),
    name: String(n?.name || ""),
    sourceType: gt(n?.sourceType || n?.source_type || ""),
    status: o.length > 0 ? "success" : "empty",
    count: o.length,
    items: o,
    lastFetchAt: String(a.lastFetchAt || (/* @__PURE__ */ new Date()).toISOString())
  };
}
async function Vf(n = {}, e = O.Defaults.DnsIpSourceFetchMaxBytes) {
  const a = String(n?.url || "").trim();
  if (!a) throw new Error("empty_source_url");
  const t = new AbortController(), r = setTimeout(() => t.abort(), lc);
  try {
    const o = await Oe(a, {
      redirect: "follow",
      signal: t.signal
    });
    if (!o.ok) throw new Error(`HTTP_${o.status}`);
    const s = await xe(o, e);
    if (s.exceeded) throw new Error("SOURCE_TOO_LARGE");
    const i = s.text, c = $s(n?.builtinId || n?.builtin_id || "");
    return (c === "all" ? Al(i) : c === "preferred" ? Cl(i, { limit: vr(n?.ipLimit) }) : uo(i, { limit: vr(n?.ipLimit) })).map((l) => ({
      ...l,
      sourceKind: "api",
      sourceLabel: n?.name || a
    }));
  } catch (o) {
    throw Zt(o) ? new Error("FETCH_TIMEOUT") : o;
  } finally {
    clearTimeout(r);
  }
}
function Gf(n = {}, e = "", a = "A") {
  const t = new URL(String(n?.endpoint || ""));
  return t.searchParams.set("name", ee(e)), t.searchParams.set("type", String(a || "A").toUpperCase()), t;
}
async function jf(n = {}, e = "", a = "A") {
  const t = new AbortController(), r = setTimeout(() => t.abort(), Hf);
  try {
    const o = await Oe(Gf(n, e, a).toString(), {
      headers: { accept: "application/dns-json" },
      redirect: "follow",
      signal: t.signal
    });
    if (!o.ok) throw new Error(`DOH_HTTP_${o.status}`);
    const s = await xe(o, en);
    return bl(s.exceeded ? null : JSON.parse(s.text || "null")).map((i) => ({
      ...i,
      sourceKind: "domain",
      sourceLabel: String(e || "").trim()
    }));
  } catch (o) {
    throw Zt(o) ? new Error("DOH_TIMEOUT") : o;
  } finally {
    clearTimeout(r);
  }
}
function qf(n = []) {
  const e = (Array.isArray(n) ? n : []).map((o) => Array.isArray(o) ? [...o] : []).filter((o) => o.length > 0), a = [], t = /* @__PURE__ */ new Set();
  let r = e.length > 0;
  for (; r; ) {
    r = !1;
    for (const o of e) {
      for (; o.length; ) {
        const s = o.shift(), i = String(s?.ip || "").trim().toLowerCase();
        if (!(!i || t.has(i))) {
          t.add(i), a.push(s);
          break;
        }
      }
      o.length && (r = !0);
    }
  }
  return a;
}
async function Xf(n = {}) {
  const e = ee(n?.domain || "");
  if (!e) throw new Error("empty_source_domain");
  const a = [], t = [], r = [];
  for (const i of ["A", "AAAA"]) for (const c of Uf) r.push({
    resolver: c,
    recordType: i
  });
  const o = await Gr(r, Math.min(2, Math.max(1, r.length)), async ({ resolver: i, recordType: c }) => {
    try {
      return {
        resolver: i,
        recordType: c,
        items: await jf(i, e, c),
        error: ""
      };
    } catch (l) {
      return {
        resolver: i,
        recordType: c,
        items: [],
        error: String(l?.message || l || "unknown_doh_error")
      };
    }
  });
  for (const i of o) {
    const c = Array.isArray(i?.items) ? i.items : [];
    if (c.length) {
      a.push(c);
      continue;
    }
    String(i?.error || "").trim() && t.push(`${String(i?.resolver?.id || "resolver")}:${String(i?.recordType || "A")}=${String(i?.error || "unknown_doh_error")}`);
  }
  const s = qf(a);
  if (!s.length && o.length > 0 && t.length === o.length) {
    const i = t.every((c) => String(c || "").includes("DOH_TIMEOUT"));
    throw new Error(i ? "DOH_TIMEOUT" : t.join("; "));
  }
  return s.map((i) => ({
    ...i,
    sourceKind: "domain",
    sourceLabel: n?.name || e
  }));
}
async function Yf(n = {}, e = O.Defaults.DnsIpSourceFetchMaxBytes) {
  const a = (/* @__PURE__ */ new Date()).toISOString(), t = Ct(n);
  try {
    return Wf(t, t.sourceType === "domain" ? await Xf(t) : await Vf(t, e), { lastFetchAt: a });
  } catch (r) {
    return {
      id: String(t?.id || ""),
      name: String(t?.name || ""),
      sourceType: gt(t?.sourceType || t?.source_type || ""),
      status: "failed",
      count: 0,
      items: [],
      error: String(r?.message || r || "unknown_error"),
      lastFetchAt: a
    };
  }
}
async function ds(n, e = "", a = "UNKNOWN", t = {}) {
  const { probeRepository: r } = t, o = String(e || "").trim(), s = Ye(o), i = String(a || "UNKNOWN").trim().toUpperCase() || "UNKNOWN";
  if (!o || !s) return {
    ip: o,
    entryColo: i,
    probeStatus: "network_error",
    latencyMs: null,
    cfRay: "",
    coloCode: "",
    cityName: "",
    countryCode: "UNKNOWN",
    countryName: "未知",
    probedAt: (/* @__PURE__ */ new Date()).toISOString(),
    expiresAt: k()
  };
  if (n && t.forceRefresh !== !0 && t.skipCacheRead !== !0) {
    const m = await r.getDnsIpProbeCacheEntry(n, o, i);
    if (m) return m;
  }
  const c = new AbortController(), l = setTimeout(() => c.abort(), de(t.probeTimeoutMs ?? t.timeoutMs, O.Defaults.DnsIpProbeTimeoutMs, 250, 3e4)), u = k(), d = s === "IPv6" ? `http://[${o}]/` : `http://${o}/`, f = (/* @__PURE__ */ new Date()).toISOString();
  try {
    const m = await Oe(d, {
      headers: { "user-agent": kf },
      method: "HEAD",
      redirect: "manual",
      signal: c.signal
    }), p = Math.max(0, k() - u), g = String(m.headers.get("CF-RAY") || m.headers.get("cf-ray") || "").trim(), h = String(m.headers.get("Server") || m.headers.get("server") || "").trim(), y = ks(g), S = y ? "ok" : /cloudflare/i.test(h) ? "cf_header_missing" : "non_cloudflare", _ = Tl(y), A = {
      ip: o,
      entryColo: i,
      probeStatus: S,
      latencyMs: p,
      cfRay: g,
      coloCode: _.coloCode,
      cityName: _.cityName,
      countryCode: _.countryCode,
      countryName: _.countryName,
      probedAt: f,
      expiresAt: k() + O.Defaults.DnsIpProbeCacheTtlSec * 1e3
    };
    return n && await r.upsertDnsIpProbeCacheEntry(n, A), A;
  } catch (m) {
    const p = {
      ip: o,
      entryColo: i,
      probeStatus: Zt(m) ? "timeout" : "network_error",
      latencyMs: null,
      cfRay: "",
      coloCode: "",
      cityName: "",
      countryCode: "UNKNOWN",
      countryName: "未知",
      probedAt: f,
      expiresAt: k() + O.Defaults.DnsIpProbeCacheTtlSec * 1e3
    };
    return n && await r.upsertDnsIpProbeCacheEntry(n, p), p;
  } finally {
    clearTimeout(l);
  }
}
async function uc(n = [], e, a = "UNKNOWN", t = {}) {
  const r = [], o = /* @__PURE__ */ new Map(), s = /* @__PURE__ */ new Set(), i = String(a || "UNKNOWN").trim().toUpperCase() || "UNKNOWN";
  for (const S of Array.isArray(n) ? n : []) {
    const _ = String(S?.ip || S?.content || "").trim(), A = Ye(_) || Hs(S?.ipType || S?.ip_type || S?.type || "");
    if (!_ || !A) continue;
    const b = {
      id: String(S?.id || S?.recordId || `${t.scope || "dns"}-${ce(`${_}|${S?.sourceKind || S?.source_kind || ""}`)}`),
      ip: _,
      ipType: A,
      recordId: String(S?.recordId || S?.id || ""),
      host: String(S?.host || S?.name || t.host || ""),
      sourceKind: String(S?.sourceKind || S?.source_kind || t.scope || "shared_pool"),
      sourceLabel: String(S?.sourceLabel || S?.source_label || t.sourceLabel || ""),
      lineLabel: Hr(S?.lineLabel || S?.line_label || ""),
      remark: String(S?.remark || ""),
      createdAt: String(S?.createdAt || S?.created_at || ""),
      updatedAt: String(S?.updatedAt || S?.updated_at || ""),
      probeStatus: Na(S?.probeStatus || S?.probe_status || ""),
      latencyMs: Number.isFinite(Number(S?.latencyMs ?? S?.latency_ms)) ? Math.max(0, Math.round(Number(S?.latencyMs ?? S?.latency_ms))) : null,
      cfRay: String(S?.cfRay || S?.cf_ray || ""),
      coloCode: String(S?.coloCode || S?.colo_code || "").trim().toUpperCase(),
      cityName: String(S?.cityName || S?.city_name || ""),
      countryCode: String(S?.countryCode || S?.country_code || "").trim().toUpperCase() || "UNKNOWN",
      countryName: String(S?.countryName || S?.country_name || "") || "未知",
      probedAt: String(S?.probedAt || S?.probed_at || "")
    };
    r.push(b), o.set(_.toLowerCase(), _);
  }
  if (!r.length) return {
    items: [],
    probeEntryColo: i,
    probeDataSource: "cache"
  };
  const c = /* @__PURE__ */ new Map(), l = [], u = [...o.values()], d = e ? await t.probeRepository.getDnsIpProbeCacheEntries(e, u, i) : [];
  for (const S of Array.isArray(d) ? d : []) {
    const _ = String(S?.ip || "").trim().toLowerCase();
    _ && c.set(_, S);
  }
  for (const S of u)
    c.has(String(S || "").toLowerCase()) && t.forceRefresh !== !0 || l.push(S);
  const f = t.deferProbe === !0 && !!t.ctx?.waitUntil, m = de(t.syncProbeLimit, O.Defaults.DnsIpWorkspaceSyncProbeLimit, 0, 64), p = f && l.length > m ? l.slice(0, m) : l, g = f && l.length > m ? l.slice(m) : [], h = de(t.probeConcurrency, O.Defaults.DnsIpProbeConcurrency, 1, 4);
  let y = "cache";
  return p.length > 0 && (y = "live_sync"), g.length > 0 && (y = "live_deferred"), await Gr(p, h, async (S) => {
    const _ = await ds(e, S, a, t);
    c.set(String(S || "").toLowerCase(), _);
  }), g.length && (g.forEach((S) => s.add(String(S || "").toLowerCase())), t.ctx.waitUntil(Gr(g, h, async (S) => {
    await ds(e, S, a, t);
  }).catch((S) => {
    console.warn("[DNS IP Workspace] Deferred probe failed:", S?.message || S);
  }))), {
    items: r.map((S) => {
      const _ = c.get(S.ip.toLowerCase());
      return _ ? {
        ...S,
        probeStatus: _.probeStatus,
        latencyMs: _.latencyMs,
        cfRay: _.cfRay,
        coloCode: _.coloCode,
        cityName: _.cityName,
        countryCode: _.countryCode,
        countryName: _.countryName,
        probedAt: _.probedAt
      } : S;
    }).map((S) => !s.has(String(S.ip || "").toLowerCase()) || String(S.probedAt || "").trim() ? S : {
      ...S,
      probeStatus: "pending"
    }),
    probeEntryColo: i,
    probeDataSource: Vn(y)
  };
}
function Jf(n = {}) {
  const e = fo(n?.items || []);
  return {
    sourceResults: Gs(n?.sourceResults || []),
    importedCount: Math.max(0, Number(n?.importedCount) || e.length),
    items: e,
    enabledSourceCount: Math.max(0, Number(n?.enabledSourceCount) || 0),
    cachedAt: Fa(n?.cachedAtMs),
    expiresAt: Fa(n?.expiresAtMs)
  };
}
async function Qf(n = [], e, a = "UNKNOWN", t = null, r = {}) {
  const o = t && typeof t.waitUntil == "function" ? t : { waitUntil() {
  } }, s = await uc(n, e, a, {
    probeRepository: r.probeRepository,
    forceRefresh: !1,
    scope: "shared_pool",
    ctx: o,
    deferProbe: !0,
    syncProbeLimit: de(r?.syncProbeLimit, 0, 0, 64),
    probeTimeoutMs: de(r?.probeTimeoutMs, 500, 250, 3e4)
  });
  return Array.isArray(s?.items) ? s.items : [];
}
function Vn(n = "") {
  const e = String(n || "").trim().toLowerCase();
  return e === "live_deferred" ? "live_deferred" : e === "live_sync" ? "live_sync" : "cache";
}
function Zf(n = "", e = "") {
  const a = Vn(n), t = Vn(e), r = {
    cache: 0,
    live_sync: 1,
    live_deferred: 2
  };
  return (r[t] || 0) > (r[a] || 0) ? t : a;
}
function em(n = {}) {
  const e = [];
  Array.isArray(n?.localPoolItems) && e.push(...n.localPoolItems), Array.isArray(n?.poolItems) && e.push(...n.poolItems), Array.isArray(n?.sharedPoolItems) && e.push(...n.sharedPoolItems);
  const a = [], t = /* @__PURE__ */ new Set();
  for (const r of e) {
    const o = lr(r);
    if (!o) continue;
    const s = String(o.ip || "").trim().toLowerCase();
    !s || t.has(s) || (t.add(s), a.push({
      ...r,
      ...o
    }));
  }
  return a;
}
function tm(n = [], e = []) {
  const a = /* @__PURE__ */ new Map(), t = (r) => {
    for (const o of Array.isArray(r) ? r : []) {
      const s = lr(o);
      s && a.set(String(s.ip || "").trim().toLowerCase(), {
        ...o,
        ...s
      });
    }
  };
  return t(n), t(e), [...a.values()];
}
function rm(n = "") {
  return `${$f}${String(n || "").trim()}`;
}
async function am({ kv: n = null, db: e = null, leaseRepository: a = null } = {}, t = "") {
  const r = rm(t);
  if (!r || r === "dns_ip_pool_fetch_lock:") return {
    acquired: !1,
    reason: "empty_signature"
  };
  const o = `${k()}-${Math.random().toString(36).slice(2, 10)}`;
  return e ? {
    ...await a.tryAcquireScheduledLeaseWithDb(e, {
      scope: r,
      token: o,
      owner: "dns_ip_pool_fetch",
      leaseMs: zf
    }),
    token: o,
    key: r
  } : {
    acquired: !1,
    reason: "db_unavailable",
    backend: "d1",
    token: o,
    key: r
  };
}
async function nm({ kv: n = null, db: e = null, leaseRepository: a = null } = {}, t = null) {
  if (!t?.token) return !1;
  const r = String(t?.key || "").trim();
  return e && r ? await a.releaseScheduledLeaseWithDb(e, t.token, { scope: r }) : !1;
}
async function om({ kv: n = null, db: e = null, ctx: a = null, sourceList: t = [], maxBytes: r = O.Defaults.DnsIpSourceFetchMaxBytes, poolRepository: o = null } = {}) {
  const s = (Array.isArray(t) ? t : []).map((_, A) => Ct(_, A)), i = s.filter((_) => _.enabled === !0 && rr(_)), c = de(O.Defaults.DnsIpSourceConcurrency, O.Defaults.DnsIpSourceConcurrency, 1, 4), l = await Gr(i, i.some((_) => gt(_?.sourceType) === "domain") ? Math.min(c, 2) : c, async (_) => Yf(_, r)), u = [], d = /* @__PURE__ */ new Map();
  for (const _ of l)
    d.set(String(_?.id || ""), _), Array.isArray(_?.items) && u.push(..._.items);
  const f = s.map((_, A) => {
    const b = d.get(String(_?.id || ""));
    return Ct(b ? {
      ..._,
      lastFetchAt: b.lastFetchAt,
      lastFetchStatus: b.status,
      lastFetchCount: b.count
    } : _, A);
  }), m = await ge(o.persistDnsIpPoolSources({
    kv: n,
    db: e
  }, f, null), "dns_ip_pool.refresh.persist_source_state", {
    sourceCount: f.length,
    enabledSourceCount: i.length
  }, f), p = ur(u), g = fo(p), h = Gs(l);
  let y = "", S = "";
  if (e) {
    const _ = Da(s, r);
    if (_ && vl(l)) {
      const A = k(), b = A + Kf, R = await o.upsertDnsIpPoolFetchCacheEntry(e, {
        signature: _,
        items: p,
        sourceResults: l,
        importedCount: g.length,
        enabledSourceCount: i.length,
        cachedAtMs: A,
        expiresAtMs: b,
        createdAt: new Date(A).toISOString(),
        updatedAt: new Date(A).toISOString()
      });
      y = Fa(R?.cachedAtMs), S = Fa(R?.expiresAtMs);
    }
  }
  return i.length && await ge(o.bumpDnsIpPoolRevision({
    kv: n,
    db: e
  }, {
    lastFetchAt: (/* @__PURE__ */ new Date()).toISOString(),
    lastFetchSourceCount: i.length,
    lastFetchImportedCount: g.length
  }, null), "dns_ip_pool.refresh.bump_revision", {
    enabledSourceCount: i.length,
    importedCount: g.length
  }, null), {
    sourceList: m,
    sourceResults: h,
    importedCount: g.length,
    items: g,
    enabledSourceCount: i.length,
    cachedAt: y,
    expiresAt: S
  };
}
function sm(n = {}, e = {}) {
  const { kernel: a } = n, { buildDnsIpPoolWorkspacePreviewItems: t, buildDnsIpWorkspaceItems: r, releaseDnsIpPoolFetchRefreshLock: o, runDnsIpPoolSourcesLiveRefresh: s, tryAcquireDnsIpPoolFetchRefreshLock: i } = n;
  return {
    async getDnsIpWorkspace(c, { env: l, kv: u, db: d, request: f, ctx: m }) {
      try {
        const p = c?.forceRefresh === !0;
        d && await a.ensureDnsIpWorkspaceSchema(d);
        const g = await ue(l), h = ea(f), y = yu(f);
        let S = await a.getDnsIpPoolSourcesForRead({
          kv: u,
          db: d
        });
        const _ = em(c), A = O.Defaults.DnsIpSourceFetchMaxBytes, b = S.filter((K) => K.enabled === !0 && rr(K));
        let R = [], E = "empty", D = !1;
        if (p && b.length > 0) {
          const K = await s({
            kv: u,
            db: d,
            ctx: m,
            sourceList: S,
            maxBytes: A
          });
          S = Array.isArray(K?.sourceList) ? K.sourceList : S, R = Array.isArray(K?.items) ? K.items : [], E = "live_sync";
        } else {
          const K = Da(S, A), G = d && K ? await a.getDnsIpPoolFetchCacheEntry(d, K) : null;
          if (G)
            R = Array.isArray(G?.items) ? G.items : [], E = "cache";
          else if (b.length > 0 && m?.waitUntil && K) {
            const x = await i({
              kv: u,
              db: d
            }, K);
            x?.acquired === !0 && (D = !0, E = "live_deferred", m.waitUntil((async () => {
              try {
                await s({
                  kv: u,
                  db: d,
                  sourceList: S,
                  maxBytes: A
                });
              } catch (N) {
                console.warn("[DNS IP Workspace] background source snapshot refresh failed:", N?.message || N);
              } finally {
                await o({
                  kv: u,
                  db: d
                }, x);
              }
            })()));
          }
        }
        const w = tm(R, _), C = await r(w, d, h, {
          forceRefresh: p,
          scope: "shared_pool",
          ctx: m,
          deferProbe: !0,
          syncProbeLimit: 0,
          probeTimeoutMs: 500
        }), T = [], I = Array.isArray(C?.items) ? C.items : [], P = await a.getOpsStatusSection({
          kv: u,
          db: d
        }, "dnsIpPool"), U = /* @__PURE__ */ new Map();
        for (const K of I) {
          const G = String(K?.countryCode || "").trim().toUpperCase();
          if (!G) continue;
          const x = U.get(G) || {
            code: G,
            name: String(K?.countryName || "未知"),
            count: 0
          };
          x.count += 1, U.set(G, x);
        }
        return J({
          zoneId: String(g.cfZoneId || "").trim(),
          zoneName: "",
          host: "",
          requestColo: h,
          probeEntryColo: h,
          probeDataSource: Zf("cache", C?.probeDataSource),
          sourceSnapshotStatus: E,
          backgroundRefreshQueued: D,
          requestCountryCode: y.countryCode,
          requestCountryName: y.countryName,
          currentHostItems: T,
          sharedPoolItems: I,
          sourceList: S,
          availableCountries: [...U.values()].sort((K, G) => String(K.code || "").localeCompare(String(G.code || ""))),
          summary: Hl(T, I),
          dnsIpPoolRevision: a.getDnsIpPoolRevisionFromStatus(P),
          generatedAt: (/* @__PURE__ */ new Date()).toISOString(),
          ...Sr(),
          revisions: await a.getAdminRevisionsForRead({
            env: l,
            kv: u,
            db: d
          }, {
            ctx: m,
            config: g
          })
        });
      } catch (p) {
        throw Rt(p, "DNS_IP_WORKSPACE_READ_FAILED", "独立 IP 池工作区读取失败：KV 读取异常", "admin.read.dns_ip_workspace");
      }
    },
    async importDnsIpPoolItems(c, { env: l, kv: u, db: d, request: f }) {
      const m = String(c?.text || c?.content || "").trim();
      if (!m) return B("EMPTY_IMPORT_TEXT", "请先提供要导入的文本内容");
      const p = String(c?.sourceKind || "manual").trim().toLowerCase() || "manual", g = String(c?.sourceLabel || "").trim() || (p === "file" ? "文件导入" : "手动导入"), h = uo(m).map((_) => ({
        ..._,
        sourceKind: p,
        sourceLabel: g
      })), y = await r(h, d, ea(f), {
        scope: "shared_pool",
        forceRefresh: !1
      }), S = Array.isArray(y?.items) ? y.items : [];
      return J({
        success: !0,
        importedCount: S.length,
        items: S,
        revisions: await a.getAdminRevisions({
          env: l,
          kv: u,
          db: d
        })
      });
    },
    async saveDnsIpPoolSources(c, { env: l, kv: u, db: d, ctx: f }) {
      if (!d) return B("D1_NOT_CONFIGURED", "请先绑定 D1 / PROXY_LOGS 数据库");
      const m = await a.persistDnsIpPoolSources({
        kv: u,
        db: d
      }, c?.sources || [], f);
      return await a.bumpDnsIpPoolRevision({
        kv: u,
        db: d
      }, {
        lastSourceConfigAt: (/* @__PURE__ */ new Date()).toISOString(),
        sourceCount: m.length
      }, f), J({
        success: !0,
        sourceList: m,
        dnsIpPoolRevision: await a.getOpsStatusSection({
          kv: u,
          db: d
        }, "dnsIpPool").then((p) => a.getDnsIpPoolRevisionFromStatus(p)).catch(() => ""),
        ...Sr(),
        revisions: await a.getAdminRevisions({
          env: l,
          kv: u,
          db: d
        })
      });
    },
    async getDnsIpPoolSources(c, { env: l, kv: u, db: d }) {
      try {
        if (!d) return J({
          success: !0,
          sourceList: [],
          dnsIpPoolRevision: "",
          ...Sr(),
          revisions: await a.getAdminRevisionsForRead({
            env: l,
            kv: u,
            db: d
          }, { config: await ue(l) })
        });
        d && await a.ensureDnsIpWorkspaceSchema(d);
        const [f, m, p] = await Promise.all([
          ue(l),
          a.getDnsIpPoolSourcesForRead({
            kv: u,
            db: d
          }),
          a.getOpsStatusSection({
            kv: u,
            db: d
          }, "dnsIpPool")
        ]);
        return J({
          success: !0,
          sourceList: m,
          dnsIpPoolRevision: a.getDnsIpPoolRevisionFromStatus(p),
          ...Sr(),
          revisions: await a.getAdminRevisionsForRead({
            env: l,
            kv: u,
            db: d
          }, { config: f })
        });
      } catch (f) {
        throw Rt(f, "DNS_IP_POOL_SOURCES_READ_FAILED", "独立 IP 池抓取源读取失败：D1 读取异常", "admin.read.dns_ip_pool_sources");
      }
    },
    async refreshDnsIpPoolFromSources(c, { env: l, kv: u, db: d, ctx: f, request: m }) {
      try {
        if (!d) return B("D1_NOT_CONFIGURED", "请先绑定 D1 / PROXY_LOGS 数据库");
        d && await a.ensureDnsIpWorkspaceSchema(d);
        const p = de(c?.maxBytes, O.Defaults.DnsIpSourceFetchMaxBytes, 1024, 8 * 1024 * 1024), g = await a.getDnsIpPoolSources({
          kv: u,
          db: d
        }), h = Da(g, p), y = d && h ? await a.getDnsIpPoolFetchCacheEntry(d, h) : null;
        if (y) {
          let A = !1;
          if (f?.waitUntil) {
            const E = await i({
              kv: u,
              db: d
            }, h);
            E?.acquired === !0 && (A = !0, f.waitUntil((async () => {
              try {
                await s({
                  kv: u,
                  db: d,
                  sourceList: g,
                  maxBytes: p
                });
              } catch (D) {
                console.warn("[DNS IP Pool] background refresh failed:", D?.message || D);
              } finally {
                await o({
                  kv: u,
                  db: d
                }, E);
              }
            })()));
          }
          const b = Jf(y), R = await t(b.items, d, ea(m), f, { syncProbeLimit: 0 });
          return J({
            success: !0,
            sourceResults: b.sourceResults,
            sourceList: g,
            importedCount: b.importedCount,
            items: R,
            cacheStatus: "d1",
            backgroundRefreshQueued: A,
            cachedAt: b.cachedAt,
            expiresAt: b.expiresAt,
            dnsIpPoolRevision: await a.getOpsStatusSection({
              kv: u,
              db: d
            }, "dnsIpPool").then((E) => a.getDnsIpPoolRevisionFromStatus(E)).catch(() => ""),
            ...Sr(),
            revisions: await a.getAdminRevisions({
              env: l,
              kv: u,
              db: d
            })
          });
        }
        const S = await s({
          kv: u,
          db: d,
          ctx: f,
          sourceList: g,
          maxBytes: p
        }), _ = await t(S.items, d, ea(m), f, {
          syncProbeLimit: 0,
          probeTimeoutMs: 500
        });
        return J({
          success: !0,
          sourceResults: S.sourceResults,
          sourceList: S.sourceList,
          importedCount: S.importedCount,
          items: _,
          cacheStatus: "live",
          backgroundRefreshQueued: !1,
          cachedAt: S.cachedAt,
          expiresAt: S.expiresAt,
          dnsIpPoolRevision: await a.getOpsStatusSection({
            kv: u,
            db: d
          }, "dnsIpPool").then((A) => a.getDnsIpPoolRevisionFromStatus(A)).catch(() => ""),
          ...Sr(),
          revisions: await a.getAdminRevisions({
            env: l,
            kv: u,
            db: d
          })
        });
      } catch (p) {
        if (Qa(p)) throw p;
        const g = ie(p, "unknown_error"), h = /* @__PURE__ */ new Error(`更新服务端共享快照失败: ${g}`);
        throw h.code = "DNS_IP_POOL_REFRESH_FAILED", h.status = 500, h.details = { reason: g }, h;
      }
    },
    async deleteDnsIpPoolItems(c, { env: l, kv: u, db: d, ctx: f }) {
      d && await a.ensureDnsIpWorkspaceSchema(d);
      const m = Fl(c?.target);
      if (m === "shared_snapshot") {
        if (!d) return B("D1_NOT_CONFIGURED", "请先绑定 D1 / PROXY_LOGS 数据库");
        const g = await a.getDnsIpPoolSourcesForRead({
          kv: u,
          db: d
        }), h = Da(g, O.Defaults.DnsIpSourceFetchMaxBytes), y = h ? await a.getDnsIpPoolFetchCacheEntry(d, h) : null, S = Ul(y, c?.ips || []);
        if (y && h && S.deletedCount > 0) {
          const _ = (/* @__PURE__ */ new Date()).toISOString(), A = Math.max(0, Number(y?.cachedAtMs) || 0), b = Math.max(A, Number(y?.expiresAtMs) || A), R = Math.max(0, Number(y?.enabledSourceCount) || (Array.isArray(g) ? g.filter((E) => E?.enabled === !0 && rr(E)).length : 0));
          await a.upsertDnsIpPoolFetchCacheEntry(d, {
            signature: h,
            items: S.items,
            sourceResults: S.sourceResults,
            importedCount: S.items.length,
            enabledSourceCount: R,
            cachedAtMs: A,
            expiresAtMs: b,
            createdAt: String(y?.createdAt || _),
            updatedAt: _
          }), await a.bumpDnsIpPoolRevision({
            kv: u,
            db: d
          }, {
            lastSnapshotDeleteAt: _,
            lastSnapshotDeleteCount: S.deletedCount
          }, f);
        }
        return J({
          success: !0,
          target: m,
          deletedCount: S.deletedCount,
          deletedIps: S.deletedIps,
          revisions: await a.getAdminRevisions({
            env: l,
            kv: u,
            db: d
          })
        });
      }
      const p = js(c?.ips || []).normalizedIps;
      return J({
        success: !0,
        target: m,
        deletedCount: d ? await a.deleteDnsIpPoolItems(d, p) : p.length,
        revisions: await a.getAdminRevisions({
          env: l,
          kv: u,
          db: d
        })
      });
    },
    async fillDnsDraftFromIpPool(c) {
      const l = [];
      for (const f of Array.isArray(c?.ips) ? c.ips : []) {
        const m = String(f?.ip || f || "").trim(), p = Ye(m);
        !m || !p || l.push({
          type: p === "IPv6" ? "AAAA" : "A",
          content: m
        });
      }
      if (!l.length) return B("EMPTY_IP_SELECTION", "请先选择至少一个可用 IP");
      const u = [], d = /* @__PURE__ */ new Set();
      for (const f of l) {
        const m = `${f.type}:${f.content.toLowerCase()}`;
        d.has(m) || (d.add(m), u.push(f));
      }
      return u.sort((f, m) => f.type !== m.type ? f.type.localeCompare(m.type) : f.content.localeCompare(m.content)), J({
        success: !0,
        mode: "a",
        records: u
      });
    }
  };
}
function im(n = {}, e = {}) {
  const { kernel: a } = n;
  return {
    async testTelegram(t) {
      const { tgBotToken: r, tgChatId: o } = t;
      if (!r || !o) return B("MISSING_PARAMS", "请先填写 Bot Token 和 Chat ID");
      try {
        return await a.sendTelegramMessage({
          tgBotToken: r,
          tgChatId: o,
          text: `✅ Emby Proxy: Telegram 机器人测试通知成功！
如果您能看到这条消息，说明您的通知配置完全正确。`
        }), J({ success: !0 });
      } catch (s) {
        return B("NETWORK_ERROR", s.message);
      }
    },
    async sendDailyReport(t, { env: r }) {
      try {
        const o = await a.sendDailyTelegramReport(r);
        return J({
          success: !0,
          sentCount: Number(o?.sentCount) || 0,
          reportKinds: Array.isArray(o?.reportKinds) ? o.reportKinds : []
        });
      } catch (o) {
        return B("REPORT_FAILED", o.message);
      }
    },
    async sendPredictedAlert(t, { env: r }) {
      try {
        const o = await a.maybeSendRuntimeAlerts(r, null, {
          ignoreCooldown: !0,
          persistState: !1,
          triggeredBy: "manual_predict"
        });
        return J({
          success: !0,
          sent: o?.sent === !0,
          issueCount: Number(o?.issueCount) || 0,
          reason: String(o?.reason || "").trim()
        });
      } catch (o) {
        return B("ALERT_PREDICT_FAILED", o.message);
      }
    },
    async pingNode(t, { env: r, ctx: o }) {
      const s = await Ae(r), i = de(t.timeout, s.pingTimeout ?? Xl, 1e3, 18e4), c = String(t.probePath || "").trim();
      if (t.target) {
        const _ = a.normalizeSingleTarget(t.target);
        return _ ? J({
          ms: await a.pingTarget(_, i, { probePath: c }),
          target: _,
          usedCache: !1,
          scope: "target"
        }) : B("INVALID_TARGET", "目标源站必须是有效的 http/https URL");
      }
      const l = String(t.name || "").trim(), u = await a.getNode(l, r, o);
      if (!u || !Array.isArray(u.lines) || !u.lines.length) return B("NOT_FOUND", "节点不存在");
      const d = String(t.lineId || "").trim(), f = d ? u.lines.filter((_) => _.id === d) : u.lines.slice();
      if (d && !f.length) return B("LINE_NOT_FOUND", "线路不存在", 404);
      const m = await Promise.all(f.map(async (_) => {
        const A = await a.pingTarget(_.target, i, { probePath: c });
        return {
          id: String(_?.id || "").trim(),
          name: String(_?.name || "").trim(),
          target: String(_?.target || "").trim(),
          latencyMs: A,
          latencyUpdatedAt: (/* @__PURE__ */ new Date()).toISOString()
        };
      })), p = u.lines.map((_) => {
        const A = m.find((b) => b.id === _.id);
        return A ? {
          id: A.id,
          name: A.name,
          target: A.target,
          latencyMs: A.latencyMs,
          latencyUpdatedAt: A.latencyUpdatedAt
        } : {
          id: String(_?.id || "").trim(),
          name: String(_?.name || "").trim(),
          target: String(_?.target || "").trim()
        };
      }), g = a.resolveActiveLineId(u.activeLineId, p, p), h = a.getActiveNodeLine({
        ...u,
        lines: p,
        activeLineId: g
      }), y = d ? p.find((_) => _.id === d) : h, S = a.buildNodeSummary(l.toLowerCase(), u).summary || { name: l.toLowerCase() };
      return J({
        ms: Number(y?.latencyMs ?? h?.latencyMs ?? 9999),
        usedCache: !1,
        sorted: !1,
        activeLineId: g,
        activeLineName: h?.name || "",
        line: y || null,
        node: {
          ...S,
          lines: p,
          activeLineId: g
        }
      });
    }
  };
}
function cm(n = {}, e = {}) {
  const { kernel: a } = n, { LogQueryPlanner: t } = n;
  return {
    async getLogs(r, { db: o, env: s }) {
      if (!o) return J({ error: "D1 not configured" }, 500);
      const i = t.normalizeRequest(r), { filters: c } = i, l = s ? await Ae(s) : {}, u = await a.resolveLogsReadiness({
        db: o,
        kv: a.getKV(s)
      }), d = t.resolveSearch(c, l, u);
      if (d.errorResponse) return d.errorResponse;
      const { effectiveSearchMode: f, searchFallbackReason: m } = d;
      if (l.logEnabled === !1) return t.buildDisabledResponse(i, u, f, m);
      if (u.schemaReady !== !0) return B("LOG_SCHEMA_NOT_READY", "日志表尚未初始化，请先点击“初始化日志表”", 400, {
        effectiveSearchMode: f,
        searchFallbackReason: m,
        revisions: { logsRevision: u.revision }
      });
      const p = t.buildSqlPlan(c, i, l, f);
      if (p.errorResponse) return p.errorResponse;
      const g = await t.executeSqlPlan(o, i, p);
      return g.errorResponse ? g.errorResponse : t.buildSuccessResponse(i, u, {
        logs: g.logs,
        total: g.total,
        totalPages: g.totalPages,
        searchMode: g.searchMode,
        effectiveSearchMode: f,
        searchFallbackReason: m,
        hasPrevPage: g.hasPrevPage,
        hasNextPage: g.hasNextPage,
        nextCursor: g.nextCursor
      });
    },
    async clearLogs(r, { db: o, env: s, ctx: i, request: c }) {
      if (c.headers.get("X-Admin-Confirm") !== "clearLogs") return B("CONFIRMATION_REQUIRED", "敏感操作需要显式确认头", 428);
      if (!o) return J({ error: "D1 not configured" }, 500);
      await a.ensureLogsBaseSchema(o), await a.ensureStatsHourlySchema(o);
      const l = k(), u = Ht.get(o);
      u.LogClearEpochMs = Math.max(u.LogClearEpochMs || 0, l), await a.patchOpsStatus(s || o, { log: {
        clearEpochMs: l,
        clearEpochAt: new Date(l).toISOString()
      } }, i);
      const d = u.LogFlushTask;
      if (d) try {
        await d;
      } catch {
      }
      u.LogQueue.length = 0, u.LogDedupe.clear(), u.LogLastFlushAt = 0, await o.prepare(`DELETE FROM ${a.LOGS_TABLE}`).run(), await a.clearStatsHourly(o).catch(() => !1);
      let f = !1;
      try {
        f = await a.rebuildLogsFts(o);
      } catch (h) {
        console.warn("clearLogs FTS rebuild failed", h);
      }
      const m = await a.isLogsFtsReady(o), p = await a.hasStatsHourlyTable(o), g = await a.bumpLogsRevision(s || { db: o }, {
        schemaReady: !0,
        ftsReady: m,
        statsReady: p,
        clearEpochMs: l,
        clearEpochAt: new Date(l).toISOString(),
        lastClearAt: (/* @__PURE__ */ new Date()).toISOString()
      }, i);
      return J({
        success: !0,
        ftsRebuilt: f,
        revisions: { logsRevision: a.getLogsRevisionFromStatus(g?.log || g) }
      });
    },
    async getD1SchemaStatus(r, { db: o }) {
      return o ? J({
        success: !0,
        status: await a.getD1SchemaStatus(o)
      }) : B("D1_NOT_CONFIGURED", "请先绑定 D1 / PROXY_LOGS 数据库", 503);
    },
    async initLogsDb(r, { db: o }) {
      if (!o) return B("D1_NOT_CONFIGURED", "D1 database is not configured", 503);
      const s = await a.initializeD1Database(o, { includeFts: !0 }), i = s.status, c = i.ftsReady === !0, l = i.tables?.[a.STATS_HOURLY_TABLE] === !0, u = await a.bumpLogsRevision(o, {
        schemaReady: i.schemaReady === !0,
        ftsReady: c,
        statsReady: l,
        categoryEnabled: !0
      });
      return J({
        success: i.schemaReady === !0,
        schemaReady: i.schemaReady === !0,
        categoryEnabled: !0,
        ftsReady: c,
        statsReady: l,
        initialization: s,
        steps: s.steps,
        status: i,
        revisions: { logsRevision: a.getLogsRevisionFromStatus(u?.log || u) }
      });
    }
  };
}
function lm(n = {}) {
  const { kernel: e } = n, a = {}, t = Vc([
    {
      name: "dashboard",
      handlers: uf({
        ...n,
        kernel: e
      }, a)
    },
    {
      name: "config",
      handlers: _f({
        ...n,
        kernel: e
      }, a)
    },
    {
      name: "backup",
      handlers: bf({
        ...n,
        kernel: e
      }, a)
    },
    {
      name: "nodes",
      handlers: Tf({
        ...n,
        kernel: e
      }, a)
    },
    {
      name: "maintenance",
      handlers: wf({
        ...n,
        kernel: e
      }, a)
    },
    {
      name: "dns-records",
      handlers: Ff({
        ...n,
        kernel: e
      }, a)
    },
    {
      name: "dns-pool",
      handlers: sm({
        ...n,
        kernel: e
      }, a)
    },
    {
      name: "notifications",
      handlers: im({
        ...n,
        kernel: e
      }, a)
    },
    {
      name: "database",
      handlers: cm({
        ...n,
        kernel: e
      }, a)
    }
  ], { aliases: {
    import: "saveOrImport",
    save: "saveOrImport"
  } });
  for (const [r, o] of Object.entries(t.handlers)) a[r] = o;
  return t;
}
function um(n = {}) {
  return { adminActionHandlers: lm(n).handlers };
}
function Ge(n, e) {
  const a = F(n) ? n : {}, t = F(e) ? e : {}, r = { ...a };
  for (const [o, s] of Object.entries(t))
    s !== void 0 && (F(s) && F(a[o]) ? r[o] = Ge(a[o], s) : F(s) ? r[o] = Ge({}, s) : r[o] = s);
  return r;
}
function Ie(n, e, a, t) {
  n.has(e) && n.delete(e), n.set(e, a);
  const r = Math.floor(Number(t));
  if (!(!Number.isFinite(r) || r < 1))
    for (; n.size > r; ) {
      const o = n.keys().next().value;
      if (o === void 0) break;
      n.delete(o);
    }
}
function qa(n, e) {
  if (!n.has(e)) return;
  const a = n.get(e);
  return n.delete(e), n.set(e, a), a;
}
function or(n = void 0) {
  const e = n === void 0 ? ft.current() : Se(n);
  e.NodesRevisionCacheGeneration += 1, e.NodesRevisionCache = null;
}
function fs(n, e = null) {
  const a = Se(e);
  a.NodesRevisionCacheGeneration += 1, a.NodesRevisionCache = {
    loaded: !0,
    revision: String(n || "").trim(),
    exp: Date.now() + O.Defaults.NodesRevisionCacheTtlMs
  };
}
function Le(n, e = ft.current()) {
  const a = String(n || "").trim().toLowerCase(), t = a && Number(e.NodeCacheGenerations.get(a)) || 0, r = t ? `node:${t}` : `missing:${e.NodeCacheGenerationEvictionEpoch}`;
  return `${e.NodeCacheResetGeneration}:${r}`;
}
function dm(n = [], e = ft.current()) {
  for (const a of Array.isArray(n) ? n : [n]) {
    const t = String(a || "").trim().toLowerCase();
    if (!t) continue;
    !e.NodeCacheGenerations.has(t) && e.NodeCacheGenerations.size >= O.Defaults.NodeCacheMax && (e.NodeCacheGenerationEvictionEpoch += 1);
    const r = ++e.NodeCacheGenerationNonce;
    Ie(e.NodeCacheGenerations, t, r, O.Defaults.NodeCacheMax);
  }
}
function ms(n = ft.current()) {
  n.NodeCacheResetGeneration += 1, n.NodeCacheGenerations.clear();
}
async function Ar(n, e = null) {
  const a = Se(e), t = a.NodeIndexMutationChain.catch(() => null).then(async () => {
    a.NodesListCache = null, a.NodesIndexCache = null, or(e);
    try {
      return await n();
    } catch (r) {
      throw a.NodesListCache = null, a.NodesIndexCache = null, or(e), r;
    }
  });
  return a.NodeIndexMutationChain = t.catch(() => null), await t;
}
var fm = "cf_dashboard_cache:", dc = "sys:cf_dash_cache", mm = 1800 * 1e3, ps = 1440 * 60 * 1e3;
function Gn(n, e = "") {
  return `${fm}${encodeURIComponent(String(n || "default").trim() || "default")}:${encodeURIComponent(String(e || "current").trim() || "current")}`;
}
function gs(n, e = "") {
  return `${dc}:${encodeURIComponent(String(n || "default").trim() || "default")}:${encodeURIComponent(String(e || "current").trim() || "current")}`;
}
function hs(n = /* @__PURE__ */ new Date(), e = O.Defaults.ScheduleUtcOffsetMinutes) {
  const a = Sa(n, e), t = a.shiftedDate.getUTCFullYear(), r = a.shiftedDate.getUTCMonth(), o = Date.UTC(t, r, 1) - a.utcOffsetMinutes * 60 * 1e3, s = Date.UTC(t, r + 1, 1) - a.utcOffsetMinutes * 60 * 1e3, i = a.now.getTime();
  return {
    ...a,
    monthKey: `${t}-${String(r + 1).padStart(2, "0")}`,
    periodLabel: `${t}年${r + 1}月`,
    startTs: o,
    endTs: Math.min(Math.max(o, i), s - 1),
    nextMonthTs: s
  };
}
function pm(n = "", e = "", a = 0) {
  return [
    "dashboard_monthly_traffic",
    1,
    encodeURIComponent(String(n || "default").trim() || "default"),
    encodeURIComponent(String(e || "current").trim() || "current"),
    ke(a)
  ].join(":");
}
function gm(n = "") {
  const e = String(n || "").trim();
  return e ? new Request(`https://dashboard-monthly-traffic-cache.invalid/${encodeURIComponent(e)}`) : null;
}
function qt(n = {}) {
  const e = n && typeof n == "object" ? { ...n } : {};
  return {
    period: "month",
    periodKey: String(e.periodKey || "").trim(),
    periodLabel: String(e.periodLabel || "本月").trim() || "本月",
    traffic: String(e.traffic || "0 B").trim() || "0 B",
    totalBytes: Math.max(0, Number(e.totalBytes) || 0),
    cfAnalyticsLoaded: e.cfAnalyticsLoaded === !0,
    cfAnalyticsStatus: String(e.cfAnalyticsStatus || "").trim(),
    cfAnalyticsError: String(e.cfAnalyticsError || "").trim(),
    cfAnalyticsDetail: String(e.cfAnalyticsDetail || "").trim(),
    trafficSourceText: String(e.trafficSourceText || "本月视频流量口径：CF Zone 总流量（edgeResponseBytes）").trim(),
    generatedAt: String(e.generatedAt || "").trim(),
    cacheStatus: String(e.cacheStatus || "live").trim().toLowerCase() || "live",
    warning: String(e.warning || "").trim()
  };
}
function hm(n = "", e = "") {
  const a = String(n || "").trim();
  return a ? String(e || "").trim().toLowerCase() === "workers_usage" && a.includes("Cloudflare Workers Usage") ? "今日请求量口径：Cloudflare Workers Usage" : a : "";
}
function ym(n = "") {
  const e = String(n || "").trim();
  return e ? e.includes("请求数已对齐 Workers Usage") ? "Cloudflare 统计正常" : e : "";
}
function Sm(n = "", e = "") {
  const a = String(n || "").trim();
  if (!a) return "";
  const t = String(e || "").trim().toLowerCase();
  return a.includes("已对齐脚本") || t === "workers_usage" && a.includes("脚本:") ? "" : a;
}
var _m = [
  "周日",
  "周一",
  "周二",
  "周三",
  "周四",
  "周五",
  "周六"
];
function fc() {
  return Array.from({ length: 24 }, (n, e) => String(e).padStart(2, "0"));
}
function jn(n = "") {
  const e = /^(\d{4})-(\d{2})-(\d{2})$/.exec(String(n || "").trim());
  if (!e) return String(n || "").trim() || "-";
  const a = _m[new Date(Date.UTC(Number(e[1]), Number(e[2]) - 1, Number(e[3]))).getUTCDay()] || "";
  return `${e[2]}-${e[3]}${a ? ` ${a}` : ""}`;
}
function mc(n = "", e = 0, a = 0, t = 0, r = 0) {
  const o = Math.max(0, Math.min(23, Number(e) || 0)), s = Math.max(0, Number(a) || 0), i = Math.max(0, Number(t) || 0), c = Math.max(0, Math.min(1, Number(r) || 0)), l = `${String(o).padStart(2, "0")}:00`, u = s > 0 ? Math.min(0.88, Number((0.12 + c * 0.68).toFixed(3))) : 0.04;
  return {
    key: `${n}:${o}`,
    hour: o,
    hourLabel: l,
    rowsWritten: s,
    writeQueries: i,
    intensity: c,
    className: s > 0 ? "d1-heat-cell is-active" : "d1-heat-cell is-empty",
    style: `--d1-heat-alpha:${u}`,
    title: `${n} ${l} · 写入 ${ye(s)} 行 · SQL 写 ${ye(i)} 次`
  };
}
function Xa(n = {}) {
  const e = ke(n.utcOffsetMinutes), a = Math.max(0, Number(n.nowMs) || k()), t = dt(new Date(a), e).startTs - 8640 * 60 * 1e3, r = Array.from({ length: 7 }, (o, s) => {
    const i = Wt(t + s * 24 * 60 * 60 * 1e3, e);
    return {
      key: i.dateKey,
      dateKey: i.dateKey,
      label: jn(i.dateKey),
      cells: Array.from({ length: 24 }, (c, l) => mc(i.dateKey, l))
    };
  });
  return {
    title: "D1 写入热点图",
    status: String(n.status || "idle").trim().toLowerCase() || "idle",
    source: String(n.source || "").trim(),
    summary: String(n.summary || "D1 写入热点尚未加载").trim() || "D1 写入热点尚未加载",
    detail: String(n.detail || "").trim(),
    periodLabel: String(n.periodLabel || `最近 7 天 · ${io(e)}`).trim(),
    hourLabels: fc(),
    rows: r,
    available: !1,
    totalRowsWritten: 0,
    totalWriteQueries: 0,
    peakLabel: "",
    legendMaxLabel: "0"
  };
}
function bm(n = {}) {
  const e = n && typeof n == "object" ? { ...n } : {}, a = Xa({ status: "idle" });
  return {
    ...a,
    ...e,
    title: String(e.title || a.title).trim() || a.title,
    status: String(e.status || a.status).trim().toLowerCase() || a.status,
    source: String(e.source || a.source).trim(),
    summary: String(e.summary || a.summary).trim() || a.summary,
    detail: String(e.detail || a.detail).trim(),
    periodLabel: String(e.periodLabel || a.periodLabel).trim() || a.periodLabel,
    hourLabels: Array.isArray(e.hourLabels) && e.hourLabels.length ? e.hourLabels.map((t) => String(t || "").trim()).filter(Boolean) : a.hourLabels,
    rows: Array.isArray(e.rows) ? e.rows : a.rows,
    available: e.available === !0,
    totalRowsWritten: Math.max(0, Number(e.totalRowsWritten) || 0),
    totalWriteQueries: Math.max(0, Number(e.totalWriteQueries) || 0),
    peakLabel: String(e.peakLabel || "").trim(),
    legendMaxLabel: String(e.legendMaxLabel || "0").trim() || "0"
  };
}
function Mo(n = {}) {
  const e = n && typeof n == "object" ? { ...n } : {}, a = String(e.requestSource || "").trim().toLowerCase();
  return e.requestSourceText = hm(e.requestSourceText, a), e.cfAnalyticsStatus = ym(e.cfAnalyticsStatus), e.cfAnalyticsDetail = Sm(e.cfAnalyticsDetail, a), e.d1WriteHotspot = bm(e.d1WriteHotspot), e;
}
function Io(n = "") {
  const e = String(n || "").trim().toLowerCase();
  return e === "cache" || e === "stale" || e === "live" ? e : "live";
}
function pc(n, e = "dashboard_snapshot_failed") {
  const a = Ft(n, e);
  return a.length <= 220 ? a : `${a.slice(0, 217)}...`;
}
function Po(n = {}) {
  const e = Io(n.cacheStatus || n.status), a = Math.max(0, Number(n.cachedAt) || 0);
  return {
    cacheStatus: e,
    cachedAt: a,
    expiresAt: Math.max(a, Number(n.expiresAt) || a),
    updatedAt: Math.max(a, Number(n.updatedAt) || a),
    generatedAt: String(n.generatedAt || "").trim(),
    warning: String(n.warning || "").trim(),
    partial: n.partial === !0 || e === "stale"
  };
}
function qn(n = {}) {
  const e = n && typeof n == "object" ? { ...n } : {}, a = Mo(!F(e.stats) && (Array.isArray(e.hourlySeries) || Object.prototype.hasOwnProperty.call(e, "todayRequests") || Object.prototype.hasOwnProperty.call(e, "todayTraffic")) ? e : F(e.stats) ? e.stats : {}), t = F(e.runtimeStatus) ? { ...e.runtimeStatus } : {}, r = F(e.cacheMeta) ? e.cacheMeta : {}, o = Po({
    cacheStatus: r.cacheStatus || a.cacheStatus || "live",
    cachedAt: r.cachedAt,
    expiresAt: r.expiresAt,
    updatedAt: r.updatedAt,
    generatedAt: r.generatedAt || a.generatedAt || "",
    warning: r.warning,
    partial: r.partial === !0
  });
  return a.cacheStatus = Io(a.cacheStatus || o.cacheStatus), {
    stats: a,
    runtimeStatus: t,
    cacheMeta: o
  };
}
function Jr(n = {}, e = "live", a = {}) {
  const t = qn(n), r = Io(e || t.cacheMeta.cacheStatus);
  return {
    stats: Mo({
      ...t.stats,
      cacheStatus: r
    }),
    runtimeStatus: F(t.runtimeStatus) ? { ...t.runtimeStatus } : {},
    cacheMeta: Po({
      ...t.cacheMeta,
      ...a,
      cacheStatus: r,
      generatedAt: String(a.generatedAt || t.cacheMeta.generatedAt || t.stats.generatedAt || "").trim()
    })
  };
}
function Rm(n) {
  !n || typeof n != "object" || (n.pendingSnapshot = null, n.scheduledFlushAt = 0, n.waitUntilCtx = null);
}
function ra(n) {
  const e = oe.PlaybackProgressRelay;
  if (!(e instanceof Map)) return !1;
  const a = e.get(n);
  return a && Rm(a), e.delete(n);
}
function ys(n, e) {
  const a = oe.PlaybackProgressRelay;
  return a instanceof Map && Ie(a, n, e, Math.max(1, Number(O.Defaults.VideoProgressForwardSessionMax) || 1)), e;
}
function mr(n, e = "/") {
  const a = Je(n) ? new URL(n.targetUrl.toString()) : n instanceof URL ? new URL(n.toString()) : new URL(String(n || "")), t = Je(n) ? n.normalizedBasePath : Nt(a.pathname), r = Q(e);
  return a.pathname = (r === "/" ? t ? `${t}/` : "/" : `${t}${r}`) || "/", a.search = "", a.hash = "", a;
}
var Em = /* @__PURE__ */ new Set(["emby", "mediabrowser"]);
function Ss(n = "/") {
  return Q(n).split("/").filter(Boolean);
}
function Am(n = "/", e = "") {
  const a = Q(n), t = String(e || "").trim();
  if (!t || t === "/") return null;
  const r = a.toLowerCase(), o = t.toLowerCase();
  return r !== o && !r.startsWith(`${o}/`) ? null : Q(a.slice(t.length) || "/");
}
function Cm(n = "/", e = "") {
  const a = Ss(e), t = Ss(n);
  if (!a.length || !t.length) return null;
  const r = String(a[a.length - 1] || "").toLowerCase(), o = String(t[0] || "").toLowerCase();
  return !r || r !== o || !Em.has(r) ? null : Q(`/${t.slice(1).join("/")}` || "/");
}
function gc(n, e = "/") {
  const a = Je(n) ? n : un(n);
  if (!a) return null;
  const t = Q(e), r = a.normalizedBasePath;
  let o = t;
  if (r) {
    const s = Am(t, r);
    if (s !== null) o = s;
    else {
      const i = Cm(t, r);
      i !== null && (o = i);
    }
  }
  return mr(a, o);
}
function Tm(n, e = "/", a = "") {
  if (!Je(n)) {
    const s = mr(n, e);
    return s.search = Yo(a), s.toString();
  }
  const t = Q(e), r = Yo(a), o = n.absoluteBasePrefix || n.originText;
  return `${(t === "/" ? `${o}/` : `${o}${t}`) || `${n.originText}/`}${r}`;
}
function Ea(n, e) {
  try {
    const a = n instanceof URL ? new URL(n.toString()) : new URL(String(n || "")), t = e instanceof URL ? new URL(e.toString()) : new URL(String(e || ""));
    if (a.origin !== t.origin) return {
      resolvedUrl: a,
      proxyPath: null
    };
    const r = Nt(t.pathname);
    let o = a.pathname || "/";
    if (r) if (o === r || o === `${r}/`) o = "/";
    else if (o.startsWith(`${r}/`)) o = o.slice(r.length);
    else return {
      resolvedUrl: a,
      proxyPath: null
    };
    return {
      resolvedUrl: a,
      proxyPath: Q(o)
    };
  } catch {
    return {
      resolvedUrl: null,
      proxyPath: null
    };
  }
}
function _s(n, e, a, t, r = {}) {
  try {
    const { resolvedUrl: o, proxyPath: s } = Ea(n, e);
    return o ? s ? `${pt(a, t, r)}${s === "/" ? "/" : s}${o.search}${o.hash}` : o.toString() : null;
  } catch {
    return null;
  }
}
function hc(n = "") {
  const e = Q(n), a = e.toLowerCase();
  let t = -1;
  for (const r of [
    "/items/",
    "/videos/",
    "/audio/",
    "/livetv/"
  ]) {
    const o = a.indexOf(r);
    o > 0 && (t === -1 || o < t) && (t = o);
  }
  return t <= 0 ? "" : Nt(e.slice(0, t));
}
function xo(n = "", e = "") {
  const a = Q(n), t = Nt(e);
  if (!t) return a;
  const r = a.toLowerCase(), o = t.toLowerCase();
  return r === o ? "/" : r.startsWith(`${o}/`) ? Q(a.slice(t.length) || "/") : a;
}
function Xn(n = "", e = "") {
  const a = Nt(e);
  if (!a) return Q(n);
  let t = Q(n);
  for (; ; ) {
    if (t === a || t === `${a}/`) return "/";
    if (!t.startsWith(`${a}/`)) return t;
    t = Q(t.slice(a.length) || "/");
  }
}
function wm(n = "", e = null, a = "") {
  let t = Q(n);
  return t = Xn(t, a), t = Xn(t, e instanceof URL ? e.pathname : "/"), t;
}
function Dm(n = "", e = "", a = null, t = null, r = "") {
  const o = String(n || "").trim();
  if (!o) return null;
  let s = null;
  if (t) try {
    s = t instanceof URL ? new URL(t.toString()) : new URL(String(t || ""));
  } catch {
    s = null;
  }
  let i;
  try {
    if (Nd(o)) {
      i = new URL(o, s || "https://playback-info.local/");
      const u = String(i.protocol || "").toLowerCase(), d = String(s?.origin || "").trim().toLowerCase();
      if (!["http:", "https:"].includes(u) || !d || i.origin.toLowerCase() !== d) return null;
    } else i = new URL(o, "https://playback-info.local/");
  } catch {
    return null;
  }
  const c = wm(i.pathname || "/", a, r), l = xo(c, hc(c));
  return da(l) ? {
    proxyPath: Q(l),
    search: i.search || "",
    hash: i.hash || ""
  } : null;
}
function Nm(n = "", e = "", a = null) {
  let t = Q(n);
  const r = hc(e);
  if (r) {
    const u = Xn(t, r);
    u !== t && da(u) && (t = u);
  }
  const o = Nt(a instanceof URL ? a.pathname : "/");
  if (!r || !o) return t;
  const s = `${r}${o}`, i = t.toLowerCase(), c = s.toLowerCase();
  if (i !== c && !i.startsWith(`${c}/`)) return t;
  const l = Q(`${r}${t.slice(s.length) || "/"}`);
  return da(l) ? l : t;
}
function Lm(n = "") {
  return $t(n) === "rewrite" ? "relative" : "";
}
function yc(n) {
  [
    "Age",
    "Accept-Ranges",
    "Content-Disposition",
    "Content-Encoding",
    "Content-Language",
    "Content-Length",
    "Content-Location",
    "Content-Range",
    "Content-Type",
    "ETag",
    "Expires",
    "Last-Modified",
    "Set-Cookie",
    "Transfer-Encoding"
  ].forEach((e) => n.delete(e));
}
function Mm(n = "/", e = null) {
  const a = Q(e instanceof URL ? e.pathname : n), t = new URLSearchParams(e instanceof URL ? e.search : String(e || ""));
  for (; t.has(Hn); ) t.delete(Hn);
  const r = t.toString();
  return `${a}${r ? `?${r}` : ""}`;
}
function pt(n, e, a = {}) {
  const t = Xu(a?.linkVariant), r = t ? "/" + encodeURIComponent(t) : "";
  if (Qe(a?.entryMode)) return r;
  const o = encodeURIComponent(String(n || "")), s = e ? "/" + encodeURIComponent(String(e)) : "";
  return "/" + o + s + r;
}
function Sc(n, e, a, t = "/", r = {}) {
  const o = n instanceof URL ? new URL(n.toString()) : new URL(String(n || "")), s = Q(t), i = new URL(o.origin);
  return i.pathname = `${pt(e, a, {
    linkVariant: r.linkVariant,
    entryMode: r.entryMode
  })}${s === "/" ? "/" : s}`, i.search = String(r.search || ""), i.hash = String(r.hash || ""), i;
}
function Im(n, e, a, t, r = {}) {
  const o = t instanceof URL ? new URL(t.toString()) : new URL(String(t || "")), s = new URL(n instanceof URL ? n.origin : String(n || ""));
  return s.pathname = `${pt(e, a, {
    linkVariant: r.linkVariant,
    entryMode: r.entryMode
  })}/${bi}${o.pathname || "/"}`, s.search = o.search || "", s.searchParams.append(Ri, Ha(o.toString())), s.hash = "", s;
}
function Pm(n = "", e = "", a = "", t = {}) {
  let r = Q(n);
  const o = String(e || "").trim();
  if (!o && !Qe(t?.entryMode)) return r;
  const s = [...new Set([
    "proxy_a",
    "proxy_b",
    "main"
  ].map((c) => pt(o, a, {
    linkVariant: c,
    entryMode: t.entryMode
  })).filter((c) => c && c !== "/"))].sort((c, l) => l.length - c.length);
  if (!s.length) return r;
  let i = !0;
  for (; i; ) {
    i = !1;
    for (const c of s) {
      const l = xo(r, c);
      if (l !== r) {
        r = l, i = !0;
        break;
      }
    }
  }
  return r;
}
function xm(n = null) {
  const e = String(n?.routeContextDiagnostics?.routeKind || "").trim();
  return e !== "host_prefix_path_compat" && e !== "legacy_host_prefix_path_compat" ? "" : pt(n?.nodeName, n?.nodeKey, {
    linkVariant: n?.linkVariant,
    entryMode: "kv_route"
  });
}
function Om(n = "", e = "") {
  const a = Q(n), t = Nt(e);
  if (!t || t === "/") return a;
  const r = a.toLowerCase(), o = t.toLowerCase();
  return r === o || r.startsWith(`${o}/`) ? a : `${t}${a === "/" ? "/" : a}`;
}
function vm(n = "", e = null) {
  const a = Q(n), t = `/${bi}`;
  if (!a.startsWith(t)) return null;
  const r = e instanceof URL && [...e.searchParams.getAll("__pb_target")].pop() || "";
  if (!r) return { error: "missing_target" };
  let o;
  try {
    o = new URL(ka(r));
  } catch {
    return { error: "invalid_target" };
  }
  return ["http:", "https:"].includes(String(o.protocol || "").toLowerCase()) ? {
    targetUrl: o,
    visibleProxyPath: Q(a.slice(t.length) || "/")
  } : { error: "unsupported_target" };
}
function bs(n = "", e = null, a = "") {
  const t = Q(n), r = t.search(/https?:\/\//i);
  if (r <= 0) return null;
  let o;
  try {
    o = e instanceof URL ? new URL(e.toString()) : new URL(String(e || ""));
  } catch {
    return null;
  }
  let s;
  try {
    s = new URL(t.slice(r));
  } catch {
    return null;
  }
  if (String(s.origin || "").toLowerCase() !== String(o.origin || "").toLowerCase()) return null;
  const i = Nt(a), c = Q(s.pathname || "/"), l = i ? xo(c, i) : c;
  if (i && l === c && c.toLowerCase() !== i.toLowerCase()) return null;
  const u = Q(t.slice(0, r) || "/"), d = [l];
  if (u !== "/") {
    const f = u.toLowerCase(), m = l.toLowerCase();
    m !== f && !m.startsWith(`${f}/`) && d.unshift(Q(`${u}${l === "/" ? "/" : l}`));
  }
  for (const f of d)
    if (da(Q(ta(f).remaining || f)))
      return {
        kind: "embedded_absolute",
        originalPath: t,
        normalizedPath: Q(f),
        embeddedUrl: s.toString()
      };
  return null;
}
function Ya(n) {
  const e = /* @__PURE__ */ new Map();
  if (!n || typeof n != "string") return e;
  for (const a of n.split(";")) {
    const t = a.trim();
    if (!t) continue;
    const r = t.indexOf("="), o = (r === -1 ? t : t.slice(0, r)).trim(), s = r === -1 ? "" : t.slice(r + 1).trim();
    o && e.set(o, s);
  }
  return e;
}
function _c(n) {
  const e = [];
  for (const [a, t] of n.entries()) e.push(t === "" ? a : `${a}=${t}`);
  return e.join("; ");
}
function Oo(n, e = []) {
  const a = new Set((Array.isArray(e) ? e : [e]).map((r) => String(r || "").trim().toLowerCase()).filter(Boolean)), t = Ya(n);
  if (a.size > 0)
    for (const r of [...t.keys()]) a.has(String(r).trim().toLowerCase()) && t.delete(r);
  return _c(t) || null;
}
function Fm(n, e, a = ["auth_token"]) {
  const t = new Set(a.map((s) => String(s || "").trim().toLowerCase()).filter(Boolean)), r = Ya(n);
  for (const s of [...r.keys()]) t.has(String(s).trim().toLowerCase()) && r.delete(s);
  const o = Ya(e);
  for (const [s, i] of o.entries())
    t.has(String(s).trim().toLowerCase()) || r.set(s, i);
  return _c(r) || null;
}
function Rs(n = "") {
  const e = Q(n).split("/").filter(Boolean);
  if (e.length === 0) return !1;
  const a = wt(e[0]).toLowerCase();
  return du.has(a);
}
async function Um(n = "", e = "", a = null, t = {}) {
  const r = String(n || "").trim().toLowerCase(), o = ee(e), s = String(a?.JWT_SECRET || "").trim();
  if (!r || !o || !s) return "";
  const i = Math.max(0, Math.floor(Number(t.nowMs ?? k()) / 1e3)), c = Math.max(1, Math.trunc(Number(t.maxAgeSec) || 86400)), l = Ha(JSON.stringify({
    v: 1,
    node: r,
    host: o,
    iat: i,
    exp: i + c
  }));
  if (!l) return "";
  const u = await Jt(s, l);
  return u ? `${l}.${u}` : "";
}
async function Hm(n = "", e = null, a = {}) {
  const t = String(n || "").trim(), r = String(e?.JWT_SECRET || "").trim();
  if (!t) return {
    ok: !1,
    reason: "missing_cookie"
  };
  if (!r) return {
    ok: !1,
    reason: "missing_secret"
  };
  const o = t.indexOf(".");
  if (o <= 0 || o === t.length - 1) return {
    ok: !1,
    reason: "malformed_cookie"
  };
  const s = t.slice(0, o), i = t.slice(o + 1), c = await Jt(r, s);
  if (!c || i !== c) return {
    ok: !1,
    reason: "bad_signature"
  };
  let l = null;
  try {
    l = JSON.parse(ka(s));
  } catch {
    return {
      ok: !1,
      reason: "malformed_payload"
    };
  }
  const u = {
    v: Number(l?.v) || 0,
    node: String(l?.node || "").trim().toLowerCase(),
    host: ee(l?.host || ""),
    iat: Math.max(0, Math.floor(Number(l?.iat) || 0)),
    exp: Math.max(0, Math.floor(Number(l?.exp) || 0))
  };
  if (u.v !== 1 || !u.node || !u.host || !u.iat || !u.exp || u.exp <= u.iat) return {
    ok: !1,
    reason: "invalid_payload",
    payload: u
  };
  const d = ee(a.requestHost || "");
  if (d && u.host !== d) return {
    ok: !1,
    reason: "host_mismatch",
    payload: u
  };
  const f = Math.max(0, Math.floor(Number(a.nowMs ?? k()) / 1e3));
  return u.exp <= f ? {
    ok: !1,
    reason: "expired",
    payload: u
  } : {
    ok: !0,
    payload: u
  };
}
function km(n = "") {
  const e = String(n || "").trim();
  return e ? `${yo}=${e}; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=${uu}` : bc();
}
function bc() {
  return `${yo}=; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=0; Expires=Thu, 01 Jan 1970 00:00:00 GMT`;
}
function hn(n = "GET", e = null) {
  const a = e ? new Headers(e) : new Headers();
  return a.set("Content-Type", "text/plain; charset=utf-8"), a.set("Cache-Control", "no-store, max-age=0"), Ce(a), a.get("Access-Control-Allow-Origin") !== "*" && Or(a, "Origin"), new Response(n === "HEAD" ? null : "Not Found", {
    status: 404,
    headers: a
  });
}
function Aa(n = "") {
  return String(n || "").trim().toLowerCase().replace(/[^a-z0-9]+/g, "");
}
var Rc = /* @__PURE__ */ new Set([
  "authorization",
  "x-emby-authorization",
  "x-mediabrowser-authorization"
]), Km = /* @__PURE__ */ new Set(["x-emby-token", "x-mediabrowser-token"]), zm = /* @__PURE__ */ new Set(["x-emby-device-id", "x-mediabrowser-device-id"]), Ec = /* @__PURE__ */ new Set([
  ...Rc,
  ...Km,
  ...zm
]);
function yn(n) {
  if (n instanceof Headers) return [...n.entries()];
  if (n && typeof n == "object" && typeof n.entries == "function") try {
    return [...n.entries()].filter((e) => Array.isArray(e) && e.length >= 2).map((e) => [String(e[0] || ""), String(e[1] ?? "")]);
  } catch {
  }
  if (n && typeof n == "object" && typeof n[Symbol.iterator] == "function") try {
    return [...n].filter((e) => Array.isArray(e) && e.length >= 2).map((e) => [String(e[0] || ""), String(e[1] ?? "")]);
  } catch {
  }
  return Array.isArray(n) ? n.filter((e) => Array.isArray(e) && e.length >= 2).map((e) => [String(e[0] || ""), String(e[1] ?? "")]) : n && typeof n == "object" ? Object.entries(n).map(([e, a]) => [String(e || ""), String(a ?? "")]) : [];
}
function Ac(n = "") {
  const e = String(n || "").trim().toLowerCase();
  return !e || Ec.has(e) || e === "cookie" ? !1 : e.includes("authorization") || e.includes("api-key") || e.includes("apikey") || e.includes("access-key") || e.includes("accesskey") || e.includes("access-token") || e.includes("accesstoken") || e.includes("session") || e.includes("credential") || e.includes("signature") || e.includes("secret") || e.includes("auth") || e.includes("token");
}
var Cc = /* @__PURE__ */ new Set([
  "apikey",
  "accesstoken",
  "token",
  "authorization",
  "xembytoken",
  "xembyauthorization",
  "xmediabrowsertoken",
  "xmediabrowserauthorization",
  "deviceid",
  "xembydeviceid",
  "xembydevicename",
  "xembyclient",
  "xembyclientversion",
  "xmediabrowserdeviceid",
  "xmediabrowserdevicename",
  "xmediabrowserclient",
  "xmediabrowserclientversion",
  "client",
  "clientid",
  "devicename",
  "userid",
  "playsessionid",
  "sessionid"
]), Tc = "identity-http-v2", $m = Object.freeze([
  "Range",
  "If-None-Match",
  "If-Modified-Since"
]), Bm = [
  /^\/Videos\/[^/]+\/(?:main|master|stream)\.m3u8$/i,
  /^\/Videos\/[^/]+\/(?:manifest|main|master|stream)\.mpd$/i,
  /^\/Audio\/[^/]+\/(?:main|master|stream)\.m3u8$/i
], Wm = /* @__PURE__ */ new Set([
  "mediasourceid",
  "static",
  "tag",
  "audiostreamindex",
  "subtitlestreamindex",
  "subtitlemethod",
  "starttimeticks"
]);
function wc(n = "") {
  return Cc.has(Aa(n));
}
function Vm(n) {
  const e = n instanceof URL ? new URL(n.toString()) : new URL(String(n || ""));
  e.hash = "";
  const a = [];
  for (const [t, r] of e.searchParams.entries())
    wc(t) || a.push([t, r]);
  a.sort((t, r) => {
    const o = t[0].localeCompare(r[0]);
    return o !== 0 ? o : String(t[1]).localeCompare(String(r[1]));
  }), e.search = "";
  for (const [t, r] of a) e.searchParams.append(t, r);
  return e;
}
function Dc(n) {
  const e = n instanceof Request ? new URL(n.url) : new URL(String(n || "")), a = [];
  for (const [s, i] of e.searchParams.entries()) {
    const c = Aa(s);
    Cc.has(c) && a.push([c, String(i)]);
  }
  a.sort((s, i) => {
    const c = s[0].localeCompare(i[0]);
    return c !== 0 ? c : s[1].localeCompare(i[1]);
  });
  const t = n instanceof Request ? n.headers : new Headers(), r = [];
  for (const [s, i] of t.entries()) {
    const c = String(s || "").trim().toLowerCase();
    !c || !Ec.has(c) && !Ac(c) || r.push([c, String(i)]);
  }
  const o = Oo(t.get("Cookie") || "", ["auth_token", ...on]);
  return o && r.push(["cookie", o]), r.sort((s, i) => {
    const c = s[0].localeCompare(i[0]);
    return c !== 0 ? c : s[1].localeCompare(i[1]);
  }), {
    queryEntries: a,
    headerEntries: r
  };
}
function Gm(n) {
  const e = Dc(n);
  return e.queryEntries.length > 0 || e.headerEntries.length > 0;
}
async function Nc(n) {
  const e = Dc(n), a = await Mn().digest("SHA-256", new TextEncoder().encode(se(e)));
  return [...new Uint8Array(a)].map((t) => t.toString(16).padStart(2, "0")).join("");
}
async function jm(n, e) {
  return await Nc(new Request(e instanceof URL ? e.toString() : String(e || ""), { headers: n.headers }));
}
function Lc(n = "", e = {}) {
  const a = mt.test(String(n || ""));
  return ce(`${Tc}:${a ? "manifest" : "asset"}:${a ? Math.max(0, Number(e.prewarmCacheTtl) || 0) : Math.max(0, Number(e.imageCacheMaxAge) || 0)}`);
}
function qm(n, e) {
  if (!(n instanceof Request) || !(e instanceof Request) || e.headers.has("If-Range")) return null;
  const a = new Headers();
  for (const t of $m) {
    const r = e.headers.get(t);
    r && a.set(t, r);
  }
  return new Request(n.url, {
    method: "GET",
    headers: a
  });
}
function Xm(n = "") {
  const e = String(n || ""), a = /\/(?:Videos|Audio)\/.+$/i.exec(e);
  return a ? a[0] : e;
}
function Ym(n) {
  try {
    return new Request(Vm(n).toString(), { method: "GET" });
  } catch {
    return null;
  }
}
function Jm(n = {}) {
  const e = Array.isArray(n?.lines) ? n.lines.slice() : [];
  if (e.length > 1) {
    const a = String(n?.activeLineId || "").trim();
    if (a) {
      const t = e.findIndex((r) => String(r?.id || "").trim() === a);
      if (t > 0) {
        const [r] = e.splice(t, 1);
        e.unshift(r);
      }
    }
  }
  return e.length > 0 ? e.map((a) => String(a?.target || "").trim()).filter(Boolean) : String(n?.target || "").split(",").map((a) => a.trim()).filter(Boolean);
}
function Yn(n = "", e = {}) {
  const a = String(n || "").trim().toLowerCase(), t = tr(e?.entryMode), r = yn(e?.headers).map(([o, s]) => [String(o || "").trim().toLowerCase(), String(s ?? "").trim()]).filter(([o]) => !!o).sort((o, s) => {
    const i = o[0].localeCompare(s[0]);
    return i !== 0 ? i : o[1].localeCompare(s[1]);
  });
  return ce(se({
    nodeName: a,
    entryMode: t,
    secret: t === "host_prefix" ? "" : String(e?.secret || "").trim(),
    tags: Ur(e?.tags, e?.tag),
    remark: String(e?.remark || "").trim(),
    activeLineId: String(e?.activeLineId || "").trim(),
    orderedTargets: Jm(e),
    headers: r,
    playbackInfoMode: String(e?.playbackInfoMode || "").trim().toLowerCase(),
    mediaAuthMode: String(e?.mediaAuthMode || "").trim().toLowerCase(),
    realClientIpMode: String(e?.realClientIpMode || "").trim().toLowerCase(),
    routingDecisionMode: String(e?.routingDecisionMode || "").trim().toLowerCase(),
    mainVideoStreamMode: String(e?.mainVideoStreamMode || e?.wangpanDirectMode || e?.wangpanMode || "").trim().toLowerCase()
  }));
}
function Mc(n = []) {
  const e = /* @__PURE__ */ new Set();
  for (const a of Array.isArray(n) ? n : [n]) {
    const t = String(a || "").trim().toLowerCase();
    t && e.add(t);
  }
  return e;
}
function Ic(n = []) {
  const e = Mc(n);
  if (!e.size) return;
  const a = oe.PlaybackInfoResponseCache;
  if (a instanceof Map) for (const [t, r] of a.entries()) {
    const o = String(r?.nodeName || "").trim().toLowerCase();
    e.has(o) && a.delete(t);
  }
}
function Pc(n = []) {
  const e = Mc(n);
  if (!e.size) return;
  const a = oe.PlaybackProgressRelay;
  if (!(!(a instanceof Map) || a.size <= 0))
    for (const [t, r] of a.entries()) {
      const o = String(r?.nodeName || r?.pendingSnapshot?.nodeName || "").trim().toLowerCase();
      !o || !e.has(o) || ra(t);
    }
}
function xc(n, e, a, t = "/", r = {}) {
  try {
    const o = String(r.identityPartition || "").trim(), s = String(r.cachePolicyRevision || "").trim();
    if (!o || !s) return null;
    const i = n instanceof URL ? new URL(n.toString()) : new URL(String(n || "")), c = Q(t), l = new URL(i.origin);
    l.pathname = `${pt(e, a, {
      linkVariant: "main",
      entryMode: r.entryMode
    })}${c === "/" ? "/" : c}`, l.search = String(r.search || "");
    const u = String(r.nodeCacheRevision || "").trim();
    return u && l.searchParams.set("__proxyrev", u), l.searchParams.set("__metadatarev", Tc), l.searchParams.set("__identity", o), l.searchParams.set("__policy", s), l.hash = "", Ym(l);
  } catch {
    return null;
  }
}
function Qm(n) {
  try {
    const e = n instanceof URL ? new URL(n.toString()) : new URL(String(n || ""));
    for (const [a, t] of e.searchParams.entries()) {
      const r = String(a || "").toLowerCase(), o = String(t || "").toLowerCase();
      if (r.includes("transcod") || o.includes("transcod")) return !0;
    }
    return !1;
  } catch {
    return !0;
  }
}
function Zm(n) {
  try {
    const e = n instanceof URL ? new URL(n.toString()) : new URL(String(n || "")), a = Xm(e.pathname || "");
    if (!mt.test(a) || Qm(e) || !Bm.some((t) => t.test(a))) return !1;
    for (const [t] of e.searchParams.entries())
      if (!wc(t) && !Wm.has(Aa(t)))
        return !1;
    return !0;
  } catch {
    return !1;
  }
}
function Jn(n) {
  try {
    const e = n instanceof URL ? new URL(n.toString()) : new URL(String(n || "")), a = e.pathname || "";
    return $r.test(a) || zr.test(a) || dr.test(a) ? !0 : mt.test(a) ? Zm(e) : !1;
  } catch {
    return !1;
  }
}
function ep(n = "") {
  const e = String(n || "").toLowerCase();
  return e ? /\.(?:mp4|m4v|mkv|mov|avi|wmv|flv|ts|m4s)(?:$|[?#])/.test(e) ? !0 : mt.test(e) || dr.test(e) ? !1 : /\/videos\/[^/]+\/(?:stream|original|download|file)\b/.test(e) || /\/items\/[^/]+\/download\b/.test(e) : !1;
}
function Qn(n, e = /* @__PURE__ */ new Set(), a = 0) {
  if (n == null || a > 5) return e;
  if (typeof n == "string") {
    const t = n.trim();
    if (t && /^(?:https?:\/\/|\/)/i.test(t)) {
      const r = t.toLowerCase(), o = r.split(/[?#]/, 1)[0] || r;
      (mt.test(o) || dr.test(o) || $r.test(r) || zr.test(o)) && e.add(t);
    }
    return e;
  }
  return Array.isArray(n) ? (n.slice(0, 24).forEach((t) => Qn(t, e, a + 1)), e) : (typeof n == "object" && Object.values(n).slice(0, 32).forEach((t) => Qn(t, e, a + 1)), e);
}
function tp(n = "") {
  const e = /^\/Items\/([^/]+)(?:\/|$)/i.exec(String(n || ""));
  return e ? wt(e[1]) : "";
}
function Es(n = "") {
  const e = String(n || "").toLowerCase();
  return $r.test(e) || zr.test(e) ? 0 : mt.test(e) ? 1 : dr.test(e) ? 2 : 3;
}
function rp(n = {}, e = {}) {
  const { D1TidyExecutor: a, D1TidyPlanner: t, Logger: r, buildAdminReleaseVendorManifest: o, normalizeAdminReleaseVendorManifestRecord: s, validateAdminShellHtmlSource: i } = n;
  return {
    async createKvTidyPlanToken(c, l = {}, u = {}) {
      const d = String(c?.JWT_SECRET || "").trim();
      if (!d) {
        const g = /* @__PURE__ */ new Error("JWT_SECRET is required to sign the KV tidy plan");
        throw g.code = "SERVER_MISCONFIGURED", g.status = 503, g;
      }
      const f = Math.max(0, Math.floor(Number(u.nowMs ?? k()) / 1e3)), m = f + Math.max(60, Math.floor(Number(u.ttlMs) || 6e5) / 1e3), p = Ha(JSON.stringify({
        version: 1,
        scope: "kv",
        planHash: String(l?.planHash || e.buildKvTidyPlanHash(l)).trim(),
        issuedAt: f,
        expiresAt: m
      }));
      return `${p}.${await Jt(d, p)}`;
    },
    async verifyKvTidyPlanToken(c, l = "", u = {}) {
      const d = String(c?.JWT_SECRET || "").trim(), f = String(l || "").trim();
      if (!d) {
        const y = /* @__PURE__ */ new Error("JWT_SECRET is required to verify the KV tidy plan");
        throw y.code = "SERVER_MISCONFIGURED", y.status = 503, y;
      }
      const m = f.indexOf(".");
      if (m <= 0 || m === f.length - 1) {
        const y = /* @__PURE__ */ new Error("KV tidy plan token is invalid");
        throw y.code = "TIDY_PLAN_INVALID", y.status = 409, y;
      }
      const p = f.slice(0, m);
      if (f.slice(m + 1) !== await Jt(d, p)) {
        const y = /* @__PURE__ */ new Error("KV tidy plan token signature is invalid");
        throw y.code = "TIDY_PLAN_INVALID", y.status = 409, y;
      }
      let g = null;
      try {
        g = JSON.parse(ka(p));
      } catch {
        g = null;
      }
      const h = Math.max(0, Math.floor(Number(u.nowMs ?? k()) / 1e3));
      if (!F(g) || g.version !== 1 || g.scope !== "kv" || !String(g.planHash || "").trim()) {
        const y = /* @__PURE__ */ new Error("KV tidy plan token payload is invalid");
        throw y.code = "TIDY_PLAN_INVALID", y.status = 409, y;
      }
      if (Number(g.expiresAt) <= h) {
        const y = /* @__PURE__ */ new Error("KV tidy plan has expired");
        throw y.code = "TIDY_PLAN_STALE", y.status = 409, y.details = {
          reason: "expired",
          expiresAt: Number(g.expiresAt) || 0
        }, y;
      }
      return g;
    },
    buildD1TidyPlanHash(c = {}) {
      const l = F(c?.schemaStatus) ? c.schemaStatus : {};
      return ce(se({
        scope: "d1",
        mode: String(c?.mode || "manual"),
        maintenanceMode: String(c?.maintenanceMode || "smart"),
        nowMs: Number(c?.nowMs) || 0,
        retentionDays: Number(c?.retentionDays) || 0,
        retentionCutoffMs: Number(c?.retentionCutoffMs) || 0,
        utcOffsetMinutes: Number(c?.utcOffsetMinutes) || 0,
        scheduledNowMs: Number(c?.scheduledNowMs) || 0,
        dayWindow: F(c?.dayWindow) ? c.dayWindow : {},
        statsBucketDate: String(c?.statsBucketDate || ""),
        statsStartTs: Number(c?.statsStartTs) || 0,
        statsEndTs: Number(c?.statsEndTs) || 0,
        statsUtcOffsetMinutes: Number(c?.statsUtcOffsetMinutes) || 0,
        schemaStatus: {
          schemaReady: l.schemaReady === !0,
          tables: F(l.tables) ? l.tables : {},
          columns: F(l.columns) ? l.columns : {},
          indexes: F(l.indexes) ? l.indexes : {},
          constraints: F(l.constraints) ? l.constraints : {},
          ftsReady: l.ftsReady === !0,
          issues: Array.isArray(l.issues) ? l.issues : []
        },
        flags: F(c?.flags) ? c.flags : {},
        summary: F(c?.summary) ? c.summary : {},
        preview: F(c?.preview) ? c.preview : {},
        d1DnsIpPoolSources: Array.isArray(c?.d1DnsIpPoolSources) ? c.d1DnsIpPoolSources : []
      }));
    },
    async createD1TidyPlanToken(c, l = {}, u = {}) {
      const d = String(c?.JWT_SECRET || "").trim();
      if (!d) {
        const g = /* @__PURE__ */ new Error("JWT_SECRET is required to sign the D1 tidy plan");
        throw g.code = "SERVER_MISCONFIGURED", g.status = 503, g;
      }
      const f = Math.max(0, Math.floor(Number(u.issuedAtMs ?? k()) / 1e3)), m = f + Math.max(60, Math.floor(Number(u.ttlMs) || 6e5) / 1e3), p = Ha(JSON.stringify({
        version: 1,
        scope: "d1",
        planHash: String(l?.planHash || e.buildD1TidyPlanHash(l)).trim(),
        planNowMs: Number(l?.nowMs) || 0,
        scheduledNowMs: Number(l?.scheduledNowMs) || Number(l?.nowMs) || 0,
        maintenanceMode: String(l?.maintenanceMode || "smart"),
        statsBucketDate: String(l?.statsBucketDate || ""),
        statsStartTs: Number(l?.statsStartTs) || 0,
        statsEndTs: Number(l?.statsEndTs) || 0,
        statsUtcOffsetMinutes: Number(l?.statsUtcOffsetMinutes) || 0,
        issuedAt: f,
        expiresAt: m
      }));
      return `${p}.${await Jt(d, p)}`;
    },
    async verifyD1TidyPlanToken(c, l = "", u = {}) {
      const d = String(c?.JWT_SECRET || "").trim(), f = String(l || "").trim();
      if (!d) {
        const y = /* @__PURE__ */ new Error("JWT_SECRET is required to verify the D1 tidy plan");
        throw y.code = "SERVER_MISCONFIGURED", y.status = 503, y;
      }
      const m = f.indexOf(".");
      if (m <= 0 || m === f.length - 1) {
        const y = /* @__PURE__ */ new Error("D1 tidy plan token is invalid");
        throw y.code = "TIDY_PLAN_INVALID", y.status = 409, y;
      }
      const p = f.slice(0, m);
      if (f.slice(m + 1) !== await Jt(d, p)) {
        const y = /* @__PURE__ */ new Error("D1 tidy plan token signature is invalid");
        throw y.code = "TIDY_PLAN_INVALID", y.status = 409, y;
      }
      let g = null;
      try {
        g = JSON.parse(ka(p));
      } catch {
        g = null;
      }
      const h = Math.max(0, Math.floor(Number(u.nowMs ?? k()) / 1e3));
      if (!F(g) || g.version !== 1 || g.scope !== "d1" || !String(g.planHash || "").trim() || !(Number(g.planNowMs) > 0)) {
        const y = /* @__PURE__ */ new Error("D1 tidy plan token payload is invalid");
        throw y.code = "TIDY_PLAN_INVALID", y.status = 409, y;
      }
      if (Number(g.expiresAt) <= h) {
        const y = /* @__PURE__ */ new Error("D1 tidy plan has expired");
        throw y.code = "TIDY_PLAN_STALE", y.status = 409, y.details = {
          reason: "expired",
          expiresAt: Number(g.expiresAt) || 0
        }, y;
      }
      return g;
    },
    async resolveKvTidyQuotaBudget(c, l = [], u = {}) {
      const d = u.kv || e.getKV(c), f = await Ud(te(u.config || {})), m = Math.max(1, Math.floor(Number(f?.kv?.write) || 0)), p = (Array.isArray(l) ? l : []).map((R) => ({
        type: String(R?.type || "put").trim().toLowerCase() === "delete" ? "delete" : "put",
        key: String(R?.key || "").trim()
      })).filter((R) => R.key), g = p.filter((R) => R.type === "put").length, h = p.filter((R) => R.type === "delete").length, y = d ? await e.captureRawKvEntries(d, p.map((R) => R.key)) : [], S = y.filter((R) => R?.exists === !0).length, _ = y.filter((R) => R?.exists !== !0).length, A = g + h + S + _, b = {
        planClass: String(f?.planClass || "free").trim().toLowerCase() === "paid" ? "paid" : "free",
        planLabel: String(f?.planLabel || "").trim() || "FREE",
        periodLabel: String(f?.periodLabel || "").trim() || "今日",
        writeLimit: m,
        estimatedPutCount: g,
        estimatedDeleteCount: h,
        estimatedRollbackWriteCount: S,
        estimatedRollbackDeleteCount: _,
        estimatedWorstCaseWriteCount: A,
        blocked: A > m,
        reason: ""
      };
      return b.reason = b.blocked === !0 ? Hd(b) : "", b;
    },
    async buildKvTidyPlan(c, l = {}) {
      const u = l.kv || e.getKV(c);
      if (!u) throw new Error("KV not configured");
      const d = (await e.listKvKeysStrict(u)).sort(), f = d.filter((ae) => ae.startsWith(e.ADMIN_INDEX_UPLOAD_PREFIX)), { rawStoredSummaryIndexText: m, storedSummaryIndexState: p, previousFullIndexBytes: g } = await e.readStoredNodesSummaryState(u), { nodeNames: h, removableKeys: y, untouchedOtherKeyCount: S, opsStatusKeyCount: _, dnsRecordHistoryKeyCount: A, dnsIpPoolSourceKeyCount: b, configMetaKeyCount: R, snapshotMetaKeyCount: E, nodeIndexMetaKeyCount: D, telegramAlertStateKeyCount: w, loginFailureKeyCount: C, dnsFetchLockKeyCount: T } = await e.classifyKvTidyKeys(u, d), I = await e.readRepairableRuntimeConfig(u), P = F(I.rawConfig) ? I.rawConfig : {}, U = Hi(P);
      let K = U.cleanedConfig;
      const G = [...U.migratedConfigKeys], x = await e.captureRawKvEntries(u, [
        e.CONFIG_KEY,
        e.NODES_INDEX_KEY,
        e.NODES_SUMMARY_INDEX_KEY
      ]), N = String(x.find((ae) => ae?.key === e.NODES_INDEX_KEY)?.value || ""), { nextTidyConfig: M, rewrittenNodes: L, fullEntityNodes: v, rewrittenNodeCount: W, deletedLegacyNodeFieldCount: z, migratedTopLevelPortNodeCount: H, migratedLinePortCount: j, migratedDefaultPortNodeCount: ne, migratedDefaultPortLineCount: fe, rollbackKvEntries: me } = await e.collectKvTidyNodeMutations(u, h, K, x), le = se(K) !== se(M);
      le && (K = M, G.push("sourceDirectNodes"));
      const pe = await e.readStoredConfigSnapshotsStrict(u), [Pe, $e] = await Promise.all([e.readRevisionMetaForRead(u, e.CONFIG_META_KEY), e.readRevisionMetaForRead(u, e.CONFIG_SNAPSHOTS_META_KEY, { count: 0 })]), Lt = {
        configRevision: String(Pe?.revision || ""),
        configContentHash: ce(se(P)),
        snapshotsRevision: String($e?.revision || ""),
        snapshotsContentHash: ce(se(pe))
      }, { rewrittenSnapshots: tt, rewrittenSnapshotCount: Mt, deletedLegacySnapshotFieldCount: It, migratedConfigKeys: jr } = e.rewriteKvTidySnapshots(pe);
      G.push(...jr);
      const Pt = I.hadMalformedValue || se(P) !== se(K), pr = e.buildKvTidyNoteParts({
        legacyKeysPresent: U.legacyKeysPresent,
        rewrittenSnapshotCount: Mt,
        rewrittenNodeCount: W,
        migratedTopLevelPortNodeCount: H,
        migratedLinePortCount: j,
        migratedDefaultPortNodeCount: ne,
        migratedDefaultPortLineCount: fe
      }, {
        includeRepairSource: !0,
        repairLabel: "repair_source",
        repairedConfig: I
      }), xt = zn(I.config, K), rt = [];
      xt.length > 0 && rt.push(e.createSyntheticConfigSnapshot(I.config, {
        reason: "tidy_kv_data",
        section: "all",
        source: "kv_tidy",
        actor: "admin",
        note: pr.join("; ") || (I.hadMalformedValue ? "repair_malformed_sys_config" : "sanitize_runtime_config")
      }, {
        changedKeys: xt.map((ae) => ae.key),
        changeCount: xt.length
      })), tt.length > 0 && rt.push(...tt);
      const qr = rt.length > 0 ? rt : pe, Gt = e.collectUnreferencedAdminIndexUploadKeys(K, qr, f);
      for (const ae of Gt) y.add(ae);
      const ht = e.normalizeNodeSummaryIndex(v).nodes, at = e.normalizeNodeIndex(ht.map((ae) => ae?.name)), Ot = JSON.stringify(at), yt = JSON.stringify(ht), vt = new TextEncoder().encode(yt).length, gr = g - vt, jt = e.buildLegacyConfigCacheKeys(I.config, K), Ne = [...y].sort(), hr = [.../* @__PURE__ */ new Set([...jt, ...Ne])].filter(Boolean).sort(), Be = [];
      rt.length > 0 && Be.push({
        type: "put",
        key: e.CONFIG_SNAPSHOTS_KEY,
        value: JSON.stringify(rt)
      }), Pt && Be.push({
        type: "put",
        key: e.CONFIG_KEY,
        value: JSON.stringify(K)
      });
      for (const ae of L) Be.push({
        type: "put",
        key: `${e.PREFIX}${ae.name}`,
        value: JSON.stringify(ae.data)
      });
      N !== Ot && Be.push({
        type: "put",
        key: e.NODES_INDEX_KEY,
        value: Ot
      }), m !== yt && Be.push({
        type: "put",
        key: e.NODES_SUMMARY_INDEX_KEY,
        value: yt
      });
      for (const ae of hr) Be.push({
        type: "delete",
        key: ae,
        value: ""
      });
      const $ = await e.resolveKvTidyQuotaBudget(c, Be, {
        kv: u,
        config: K
      }), V = {
        scannedKeyCount: d.length,
        preservedNodeKeyCount: h.length,
        rebuiltNodeCount: at.length,
        rewrittenNodeCount: W,
        configWasMalformed: I.hadMalformedValue,
        configReadSource: I.source,
        configRewritten: Pt,
        migratedConfigKeys: bt(G),
        rewrittenSnapshotCount: Mt,
        deletedLegacyFieldCount: U.deletedLegacyFieldCount + It + z,
        deletedLegacyConfigFieldCount: U.deletedLegacyFieldCount,
        deletedLegacyNodeFieldCount: z,
        deletedLegacySnapshotFieldCount: It,
        migratedTopLevelPortNodeCount: H,
        migratedLinePortCount: j,
        migratedDefaultPortNodeCount: ne,
        migratedDefaultPortLineCount: fe,
        deletedKeyCount: Ne.length,
        deletedCacheKeyCount: Ne.filter((ae) => ae === "sys:cf_dash_cache" || ae.startsWith("sys:cf_dash_cache:")).length,
        deletedScheduledLockKeyCount: Ne.filter((ae) => ae === e.LEGACY_SCHEDULED_LOCK_KEY).length,
        deletedLoginFailureKeyCount: C,
        deletedDnsIpPoolSourceKeyCount: b,
        deletedOpsStatusKeyCount: _,
        deletedTelegramAlertStateKeyCount: w,
        deletedDnsFetchLockKeyCount: T,
        deletedAdminIndexUploadCount: Gt.length,
        untouchedOtherKeyCount: S,
        rawSnapshotCount: pe.length,
        previousFullIndexBytes: g,
        nextSummaryIndexBytes: vt,
        savedBytes: gr
      }, X = Ad({
        configFieldTargets: V.migratedConfigKeys,
        rewrittenSnapshotCount: Mt,
        sourceDirectNodesFromLegacyNodes: le,
        migratedTopLevelPortNodeCount: H,
        migratedLinePortCount: j,
        migratedDefaultPortNodeCount: ne,
        migratedDefaultPortLineCount: fe
      }), q = [], Y = Ne.filter((ae) => ae === "sys:cf_dash_cache" || ae.startsWith("sys:cf_dash_cache:")), re = Ne.filter((ae) => ae.startsWith("fail:")), he = Ne.filter((ae) => ae === e.LEGACY_DNS_IP_POOL_SOURCES_KEY), Fe = Ne.filter((ae) => ae === e.LEGACY_OPS_STATUS_KEY || Object.values(e.LEGACY_OPS_STATUS_SECTION_KEYS).includes(ae)), Ue = Ne.filter((ae) => ae === e.LEGACY_TELEGRAM_ALERT_STATE_KEY), We = Ne.filter((ae) => ae === e.LEGACY_SCHEDULED_LOCK_KEY), St = Ne.filter((ae) => ae.startsWith(Bf)), _t = Ne.filter((ae) => ae.startsWith(e.ADMIN_INDEX_UPLOAD_PREFIX));
      tt.map((ae) => ae?.id);
      const nt = L.map((ae) => ae.name);
      Ee(q, Y.length > 0, "cf_dash_cache", "Cloudflare 仪表盘缓存", Y, Y.length, "会删除遗留的 sys:cf_dash_cache 及其按日期 / Zone 生成的缓存键。"), Ee(q, re.length > 0, "login_failures", "旧版登录失败计数", re, re.length, "会删除旧版 fail:* 登录失败计数键，后续仅保留 D1 auth_failures。"), Ee(q, he.length > 0, "dns_ip_pool_sources", "旧版 DNS IP 池源配置", he, he.length, "会删除旧版 sys:dns_ip_pool_sources:v1，后续只保留 D1 dns_ip_pool_sources。"), Ee(q, Fe.length > 0, "ops_status", "旧版运维状态键", Fe, Fe.length, "会删除 sys:ops_status:v1 与 sys:ops_status:*，后续只保留 D1 sys_status。"), Ee(q, Ue.length > 0, "telegram_alert_state", "旧版 Telegram 告警冷却状态", Ue, Ue.length, "会删除 sys:telegram_alert_state:v1，后续只保留 D1 sys_status scope。"), Ee(q, We.length > 0, "scheduled_lock", "旧版定时租约键", We, We.length, "会删除 sys:scheduled_lock:v1，后续只保留 D1 sys_locks。"), Ee(q, St.length > 0, "dns_fetch_lock", "旧版 DNS 抓取锁键", St, St.length, "会删除 sys:dns_ip_pool_fetch_lock:v1:*，后续只保留 D1 sys_locks。"), Ee(q, _t.length > 0, "admin_index_uploads", "未引用的本地 HTML 版本", _t, _t.length, "只删除当前配置和保留快照都不再引用的内容寻址 index.html。");
      const yr = [];
      if (Pt && Ee(yr, !0, "runtime_config", "全局设置 sys:theme", [...U.legacyKeysPresent, ...xt.map((ae) => ae.key)], 1, "会把旧版设置字段吸收到当前 schema，并以后端 sanitizeRuntimeConfig() 结果回写。"), W > 0) {
        const ae = [];
        H > 0 && ae.push(`旧版顶层 node.port 节点 ${H} 个`), j > 0 && ae.push(`旧版 lines[].port 线路 ${j} 条`), ne > 0 && ae.push(`隐式默认端口节点 ${ne} 个`), fe > 0 && ae.push(`按协议补齐默认端口线路 ${fe} 条`), Ee(yr, !0, "node_entities", "节点实体 node:* 标准化重写", nt, W, ae.length ? `会把端口并入 lines[].target，并移除旧版节点字段。${ae.join("，")}。` : "会移除旧版节点字段，并统一回写当前节点 schema。");
      }
      Ee(yr, !0, "node_indexes", "节点索引 / 节点摘要索引", [e.NODES_INDEX_KEY, e.NODES_SUMMARY_INDEX_KEY], 2, `会按当前 node:* 实体重新生成轻量 name 索引与节点摘要索引，并把旧镜像压缩收敛为摘要格式（${g} -> ${vt} bytes，节省 ${gr} bytes）。`);
      const Xr = [it("node_entities_preserved", "node:* 节点实体", h, {
        count: h.length,
        note: "不会整批删除 node:*，只会按需重写必要节点。"
      })];
      A > 0 && Ee(Xr, !0, "dns_record_history", "DNS 历史记录", d.filter((ae) => ae.startsWith(e.DNS_RECORD_HISTORY_PREFIX)), A, "不会删除 sys:dns_record_history:v1:*。");
      const Ca = R + E + D;
      Ca > 0 && Ee(Xr, !0, "meta_keys", "配置 / 快照 / 索引元信息", [
        e.CONFIG_META_KEY,
        e.CONFIG_SNAPSHOTS_META_KEY,
        e.NODES_INDEX_META_KEY
      ], Ca, "不会删除这些 revision / meta 键。");
      const ot = [];
      I.hadMalformedValue && ot.push(`检测到异常 sys:theme（来源: ${I.source}），整理时会按当前 schema 修复。`), H > 0 && ot.push(`检测到 ${H} 个旧节点仍使用顶层 node.port；整理后会把端口并入 lines[].target。`), j > 0 && ot.push(`检测到 ${j} 条旧线路仍使用独立 lines[].port；整理后会把端口并入 lines[].target。`), (ne > 0 || fe > 0) && ot.push(`检测到 ${ne} 个节点 / ${fe} 条线路仍未显式写端口；整理后会按协议补齐为 :443 / :80。`), p?.legacyMirrorDetected === !0 && ot.push(`检测到旧版 sys:nodes_index_full:v2 仍保存完整节点镜像；本次会按 node:* 重建并收敛为摘要索引（${g} -> ${vt} bytes）。`), S > 0 && ot.push(`发现 ${S} 个未列入整理白名单的 KV 键，本次不会自动删除。`), q.length === 0 && !Pt && Mt === 0 && W === 0 && ot.push("当前没有检测到需要执行的 KV 清理动作；本次更多是一轮一致性巡检。"), ot.push(kd($)), $.blocked === !0 && $.reason && ot.push($.reason);
      const Sn = {
        scope: "kv",
        scannedKeys: d,
        config: K,
        nodesIndex: at,
        rebuiltNodeSummaries: ht,
        revisions: Lt,
        summary: V,
        quotaBudget: $,
        mutationPlan: Be,
        preview: {
          scope: "kv",
          quotaBudget: $,
          fieldGroups: X,
          deleteGroups: q,
          rewriteGroups: yr,
          preserveGroups: Xr,
          warnings: ot
        }
      };
      return Sn.planHash = e.buildKvTidyPlanHash(Sn), Sn;
    },
    async applyKvTidyPlan(c, l = {}) {
      const u = l.kv || e.getKV(l.env);
      if (!u) throw new Error("KV not configured");
      const d = Se(u), f = Array.isArray(c?.mutationPlan) ? c.mutationPlan : [];
      try {
        await e.applyKvMutationsWithRollback(u, f);
      } catch (m) {
        throw za(l.env), d.NodesListCache = null, d.NodesIndexCache = null, or(u), ms(d), d.NodeCache.clear(), d.PlaybackRouteHotCache.clear(), m;
      }
      return za(l.env), ms(d), d.NodeCache.clear(), d.PlaybackRouteHotCache.clear(), Array.isArray(c?.nodesIndex) && c.nodesIndex.length > 0 && (Ic(c.nodesIndex), Pc(c.nodesIndex)), e.primeNodeSummaryCaches(Array.isArray(c?.rebuiltNodeSummaries) ? c.rebuiltNodeSummaries : [], u), d.NodesIndexCache = {
        data: Array.isArray(c?.nodesIndex) ? c.nodesIndex : [],
        exp: k() + 6e4
      }, e.buildTidyResult(c, { ...c?.summary || {} }, "kv", {
        config: c?.config || {},
        nodesIndex: Array.isArray(c?.nodesIndex) ? c.nodesIndex : []
      });
    },
    async tidyKvData(c, l = {}) {
      return await tl(l.kv || e.getKV(c))(async () => {
        const u = await e.verifyKvTidyPlanToken(c, l.planToken), d = await e.buildKvTidyPlan(c, l);
        if (String(d.planHash || "") !== String(u.planHash || "")) {
          const f = /* @__PURE__ */ new Error("KV tidy data changed after preview");
          throw f.code = "TIDY_PLAN_STALE", f.status = 409, f.details = {
            reason: "plan_changed",
            previewPlanHash: String(u.planHash || ""),
            currentPlanHash: String(d.planHash || "")
          }, f;
        }
        if (d?.quotaBudget?.blocked === !0) {
          const f = String(d?.quotaBudget?.reason || "KV tidy write budget exceeded").trim() || "KV tidy write budget exceeded", m = new Error(f);
          throw m.code = "KV_TIDY_WRITE_LIMIT_EXCEEDED", m.status = 409, m.details = { quotaBudget: d.quotaBudget }, m;
        }
        return await e.applyKvTidyPlan(d, {
          ...l,
          env: c
        });
      });
    }
  };
}
function ap(n = {}, e = {}) {
  const { D1TidyExecutor: a, D1TidyPlanner: t, Logger: r, buildAdminReleaseVendorManifest: o, normalizeAdminReleaseVendorManifestRecord: s, validateAdminShellHtmlSource: i } = n;
  return {
    async readD1Count(c, l, u = []) {
      if (!c || !l) return 0;
      try {
        let d = c.prepare(l);
        Array.isArray(u) && u.length && (d = d.bind(...u));
        const f = await d.first();
        return Math.max(0, Math.floor(Number(f?.total ?? f?.count ?? f?.c ?? f?.value) || 0));
      } catch {
        return 0;
      }
    },
    getPreviousD1TidyState(c = {}, l = null) {
      const u = F(c) ? c : {}, d = F(u.d1Tidy) ? u.d1Tidy : {};
      return Ge(F(l) ? l : F(u.cleanup) ? u.cleanup : {}, d);
    },
    buildD1TidyStatusPayload(c = {}, l = {}) {
      const u = String(l.mode || c.mode || "manual").trim().toLowerCase() === "scheduled" ? "scheduled" : "manual", d = lt(l.maintenanceMode || c.maintenanceMode, u), f = String(l.triggeredBy || (u === "scheduled" ? "scheduled" : "manual")).trim() || (u === "scheduled" ? "scheduled" : "manual"), m = String(l.timestamp || c.finishedAt || (/* @__PURE__ */ new Date()).toISOString()).trim() || (/* @__PURE__ */ new Date()).toISOString(), p = String(l.status || c.status || "success").trim() || "success", g = String(l.lastError || c.lastError || "").trim(), h = p === "failed" || p === "partial_failure", y = p === "skipped" || p === "deferred", S = {
        status: p,
        lastSuccessAt: !h && !y ? m : "",
        lastSkippedAt: y ? m : "",
        lastErrorAt: h ? m : "",
        lastError: h ? g : "",
        lastTriggeredBy: f,
        mode: u,
        maintenanceMode: d
      }, _ = Math.max(0, Number(c.logRetentionDays ?? c.retentionDays) || 0);
      return {
        d1Tidy: {
          ...S,
          retentionDays: _,
          deletedExpiredLogCount: Math.max(0, Number(c.deletedExpiredLogCount) || 0),
          deletedExpiredLockCount: Math.max(0, Number(c.deletedExpiredLockCount) || 0),
          deletedExpiredFetchCacheCount: Math.max(0, Number(c.deletedExpiredFetchCacheCount) || 0),
          deletedExpiredProbeCacheCount: Math.max(0, Number(c.deletedExpiredProbeCacheCount) || 0),
          deletedExpiredAuthFailureCount: Math.max(0, Number(c.deletedExpiredAuthFailureCount) || 0),
          deletedExpiredDashboardCacheCount: Math.max(0, Number(c.deletedExpiredDashboardCacheCount) || 0),
          preservedLogCount: Math.max(0, Number(c.preservedLogCount) || 0),
          rebuiltStatsHourly: c.rebuiltStatsHourly === !0,
          rebuiltLogsFts: c.rebuiltLogsFts === !0,
          alignedStatsWindow: c.alignedStatsWindow === !0,
          dnsIpPoolSourceAction: String(c.dnsIpPoolSourceAction || "").trim(),
          ftsRebuildStatus: String(c.ftsRebuildStatus || "").trim(),
          optimizeStatus: String(c.optimizeStatus || "").trim(),
          statsRebuildStatus: String(c.statsRebuildStatus || "").trim(),
          reason: String(c.reason || "").trim(),
          summary: c
        },
        cleanup: {
          ...S,
          retentionDays: _,
          ftsRebuildStatus: String(c.ftsRebuildStatus || (c.rebuiltLogsFts === !0 ? "success" : "")).trim(),
          ftsRebuildRecovered: c.ftsRebuildRecovered === !0,
          lastFtsRebuildAt: String(c.lastFtsRebuildAt || "").trim(),
          ftsRebuildError: String(c.ftsRebuildError || "").trim(),
          optimizeStatus: String(c.optimizeStatus || (c.optimizedDb === !0 ? "success" : "")).trim(),
          lastOptimizeAt: String(c.lastOptimizeAt || "").trim(),
          optimizeError: String(c.optimizeError || "").trim(),
          statsAlignStatus: String(c.statsAlignStatus || "").trim(),
          statsAlignError: String(c.statsAlignError || "").trim(),
          statsRebuildStatus: String(c.statsRebuildStatus || (c.rebuiltStatsHourly === !0 ? "success" : "")).trim(),
          statsRebuildError: String(c.statsRebuildError || "").trim(),
          reason: String(c.reason || "").trim()
        }
      };
    },
    buildTidyResult(c = {}, l = {}, u = "kv", d = {}) {
      const f = F(c?.preview) ? c.preview : e.createEmptyTidyPreview(u);
      return {
        ...d,
        summary: l,
        preview: f,
        quotaBudget: F(c?.quotaBudget) ? c.quotaBudget : F(f?.quotaBudget) ? f.quotaBudget : null,
        fieldGroups: Array.isArray(f?.fieldGroups) ? f.fieldGroups : [],
        deleteGroups: Array.isArray(f?.deleteGroups) ? f.deleteGroups : [],
        rewriteGroups: Array.isArray(f?.rewriteGroups) ? f.rewriteGroups : [],
        preserveGroups: Array.isArray(f?.preserveGroups) ? f.preserveGroups : [],
        warnings: Array.isArray(f?.warnings) ? f.warnings : []
      };
    },
    async buildD1TidyPlan(c, l = {}) {
      const u = l.db || e.getDB(c), d = l.kv || e.getKV(c) || null;
      if (!u) throw new Error("D1 not configured");
      const f = await e.getD1SchemaStatus(u), m = te(l.config || (c ? await Ae(c) : {})), p = t.buildContext(m, l), g = t.attachPreviousState(e, p, l.previousCleanupStatus);
      g.logQueuePendingCount = Ht.get(u).LogQueue.length;
      const h = await t.readFacts(e, u, d, g), y = t.buildSourcePolicy(h.d1DnsIpPoolSources), S = t.buildFlags(e, g, h, y), _ = t.buildSummary(g, h, y, S), A = f.schemaReady === !0;
      _.schemaReady = A, _.requiresSchemaInitialization = !A;
      const b = t.buildPreview(g, h, y, S);
      A || b.warnings.unshift("D1 结构尚未通过运行时兼容检查；本预览不授权删除，必须先完成统一“初始化 DB”并重新预览。");
      const R = {
        scope: "d1",
        mode: g.mode,
        maintenanceMode: g.maintenanceMode,
        config: m,
        nowMs: g.nowTimestamp,
        retentionDays: g.retentionDays,
        retentionCutoffMs: g.retentionCutoffMs,
        utcOffsetMinutes: g.utcOffsetMinutes,
        scheduledNowMs: g.scheduledNow.getTime(),
        dayWindow: g.dayWindow,
        statsBucketDate: g.statsBucketDate,
        statsStartTs: g.statsStartTs,
        statsEndTs: g.statsEndTs,
        statsUtcOffsetMinutes: g.statsUtcOffsetMinutes,
        d1DnsIpPoolSources: h.d1DnsIpPoolSources,
        kvDnsIpPoolSources: h.kvDnsIpPoolSources,
        dnsIpPoolSourceAction: y.dnsIpPoolSourceAction,
        skipDnsIpPoolSourceCleanup: y.skipDnsIpPoolSourceCleanup,
        previousD1State: g.previousD1State,
        schemaStatus: f,
        flags: S,
        summary: _,
        preview: b
      };
      return R.planHash = e.buildD1TidyPlanHash(R), R;
    },
    async applyD1TidyPlan(c, l = {}) {
      const u = l.env, d = l.db || e.getDB(u), f = l.kv || e.getKV(u) || null;
      if (!d) throw new Error("D1 not configured");
      const m = await e.getD1SchemaStatus(d);
      if (m.schemaReady !== !0) {
        const C = /* @__PURE__ */ new Error("D1 schema must pass runtime compatibility checks before tidy execution");
        throw C.code = "D1_SCHEMA_INCOMPATIBLE", C.status = 409, C.details = {
          issues: m.issues,
          autoRepairPolicy: m.autoRepairPolicy
        }, C;
      }
      const p = c || await e.buildD1TidyPlan(u, {
        ...l,
        db: d,
        kv: f
      }), g = String(p?.mode || l.mode || "manual").trim().toLowerCase() === "scheduled" ? "scheduled" : "manual", h = lt(p?.maintenanceMode || l.maintenanceMode, g), y = F(p?.flags) ? p.flags : {}, S = typeof l.beforeEachStep == "function" ? l.beforeEachStep : async () => {
      }, _ = {
        kv: f,
        db: d
      }, A = g === "scheduled", b = a.createSummary(p, g, y);
      b.maintenanceMode = h;
      let R = !1;
      const E = (C, T, I, P) => {
        const U = I?.message || String(I);
        if (C && (b[C] = "failed"), T && (b[T] = U), b.lastError = U, b.status = b.status === "failed" ? "failed" : "partial_failure", console.error(`${P}: `, I), !A) throw I;
        return !1;
      };
      await S("bootstrapD1Schema"), await e.bootstrapD1Schema(d, "logs-core");
      const D = Ht.get(d);
      if (D.LogFlushTask && await Promise.resolve(D.LogFlushTask).catch(() => {
      }), u && D.LogQueue.length > 0 && (await S("flushLogQueue"), await r.flush(u).catch(() => {
      })), R = await a.runDeleteSteps(a.buildDeleteSteps(e, p, b, y, d), S) || R, g === "manual")
        y.rebuildStatsHourly === !0 ? (await S("rebuildStatsHourlyWindow"), await e.rebuildStatsHourlyWindow(d, {
          startTs: p.retentionCutoffMs,
          endTs: p.nowMs,
          utcOffsetMinutes: p.utcOffsetMinutes
        }), b.rebuiltStatsHourly = !0, b.statsRebuildStatus = "success", R = !0) : b.statsRebuildStatus = "skipped", b.statsAlignStatus = "skipped";
      else {
        if (y.alignStatsWindow === !0) try {
          await S("alignStatsHourlyWindow");
          const C = await e.ensureStatsHourlyWindowAligned(_, {
            config: p.config,
            now: p.dayWindow?.now instanceof Date ? p.dayWindow.now : new Date(p.scheduledNowMs || p.nowMs)
          });
          b.alignedStatsWindow = C?.rebuilt === !0, b.statsAlignStatus = C?.rebuilt === !0 ? "success" : "skipped";
        } catch (C) {
          E("statsAlignStatus", "statsAlignError", C, "Scheduled stats alignment Error");
        }
        if (y.rebuildDailyStats === !0 || y.rebuildStatsHourly === !0) try {
          await S("rebuildDailyStatsHourly"), await e.rebuildStatsHourlyForDate(d, {
            bucketDate: p.statsBucketDate,
            startTs: p.statsStartTs,
            endTs: p.statsEndTs,
            utcOffsetMinutes: p.statsUtcOffsetMinutes
          }), b.rebuiltStatsHourly = !0, b.statsRebuildStatus = "success";
        } catch (C) {
          E("statsRebuildStatus", "statsRebuildError", C, "Scheduled stats rebuild Error");
        }
      }
      if (y.rebuildLogsFts === !0) try {
        await S("rebuildLogsFts");
        let C = !1;
        await e.hasLogsFtsTable(d) ? C = await e.rebuildLogsFts(d) : C = (await e.ensureLogsFtsSchema(d)).rebuilt === !0, b.rebuiltLogsFts = C === !0, b.ftsRebuildStatus = C === !0 ? "success" : "skipped", b.lastFtsRebuildAt = (/* @__PURE__ */ new Date()).toISOString(), R = R || C === !0;
      } catch (C) {
        if (g === "scheduled") try {
          await S("rebuildLogsFtsForceRecreate");
          const T = await e.ensureLogsFtsSchema(d, { forceRecreate: !0 });
          b.rebuiltLogsFts = T.rebuilt === !0, b.ftsRebuildStatus = T.rebuilt === !0 ? "success" : "skipped", b.ftsRebuildRecovered = T.recreated === !0, b.ftsRebuildError = "", b.lastFtsRebuildAt = (/* @__PURE__ */ new Date()).toISOString(), R = R || T.rebuilt === !0, console.warn("Scheduled FTS rebuild recovered by recreating schema.");
        } catch (T) {
          E("ftsRebuildStatus", "ftsRebuildError", T, "Scheduled FTS rebuild Error");
        }
        else E("ftsRebuildStatus", "ftsRebuildError", C, "D1 logs FTS rebuild Error");
      }
      if (y.optimizeDb === !0) try {
        await S("optimizeLogsDb"), await e.optimizeLogsDb(d), b.optimizedDb = !0, b.optimizeStatus = "success", b.lastOptimizeAt = (/* @__PURE__ */ new Date()).toISOString(), R = !0;
      } catch (C) {
        E("optimizeStatus", "optimizeError", C, g === "scheduled" ? "Scheduled DB optimize Error" : "D1 optimize Error");
      }
      await S("patchLogStatus");
      const w = await a.patchLogStatus(e, d, _, p, b, y, l);
      if (b.status !== "partial_failure" && b.status !== "failed") if (g === "scheduled") {
        const C = y.rebuildLogsFtsDeferred === !0 || y.optimizeDbDeferred === !0;
        R ? b.status = "success" : (b.status = "skipped", b.reason = C ? "maintenance_deferred" : "no_expired_data");
      } else b.status = "success";
      return b.finishedAt = w, e.buildTidyResult(p, b, "d1");
    },
    async tidyD1Data(c, l = {}) {
      const u = String(l.mode || "manual").trim().toLowerCase() === "scheduled" ? "scheduled" : "manual", d = lt(l.maintenanceMode, u), f = l.db || e.getDB(c);
      if (!f) throw new Error("D1 not configured");
      if (u === "manual") {
        const g = await e.verifyD1TidyPlanToken(c, l.planToken), h = await e.getD1SchemaStatus(f);
        if (h.schemaReady !== !0) {
          const S = /* @__PURE__ */ new Error("D1 schema changed after preview; initialize and preview again");
          throw S.code = "TIDY_PLAN_STALE", S.status = 409, S.details = {
            reason: "schema_changed",
            issues: h.issues
          }, S;
        }
        const y = await e.buildD1TidyPlan(c, {
          ...l,
          db: f,
          mode: u,
          maintenanceMode: lt(g.maintenanceMode, u),
          nowMs: Number(g.planNowMs),
          scheduledNow: new Date(Number(g.scheduledNowMs) || Number(g.planNowMs)),
          statsBucketDate: String(g.statsBucketDate || ""),
          statsStartTs: Number(g.statsStartTs) || 0,
          statsEndTs: Number(g.statsEndTs) || 0,
          statsUtcOffsetMinutes: Number(g.statsUtcOffsetMinutes) || 0
        });
        if (String(y.planHash || "") !== String(g.planHash || "")) {
          const S = /* @__PURE__ */ new Error("D1 tidy data changed after preview");
          throw S.code = "TIDY_PLAN_STALE", S.status = 409, S.details = {
            reason: "plan_changed",
            previewPlanHash: String(g.planHash || ""),
            currentPlanHash: String(y.planHash || "")
          }, S;
        }
        return {
          ...await e.applyD1TidyPlan(y, {
            ...l,
            db: f,
            env: c,
            mode: u,
            maintenanceMode: y.maintenanceMode
          }),
          schema: h
        };
      }
      const m = await e.getD1SchemaStatus(f);
      if (m.schemaReady !== !0) {
        const g = /* @__PURE__ */ new Error("D1 schema is not initialized");
        throw g.code = "D1_SCHEMA_NOT_READY", g.status = 409, g.details = { issues: m.issues }, g;
      }
      const p = l.plan || await e.buildD1TidyPlan(c, {
        ...l,
        db: f,
        mode: u,
        maintenanceMode: d
      });
      return {
        ...await e.applyD1TidyPlan(p, {
          ...l,
          db: f,
          env: c
        }),
        schema: m
      };
    },
    shouldRunLogsOptimize(c, l = {}) {
      const u = Number(l.nowMs) || k(), d = Math.max(0, Number(l.minIntervalMs) || O.Defaults.LogVacuumMinIntervalMs);
      if (l.force === !0) return !0;
      const f = typeof c == "string" ? new Date(c).getTime() : NaN;
      return Number.isFinite(f) ? u - f >= d : !0;
    },
    shouldRunLogsFtsRebuild(c, l = {}) {
      return e.shouldRunLogsOptimize(c, {
        ...l,
        minIntervalMs: Math.max(0, Number(l.minIntervalMs) || O.Defaults.LogFtsRebuildMinIntervalMs)
      });
    },
    async optimizeLogsDb(c) {
      return c ? (await c.prepare("PRAGMA optimize").run(), !0) : !1;
    }
  };
}
function np(n = {}, e = {}) {
  const { D1TidyExecutor: a, D1TidyPlanner: t, Logger: r, buildAdminReleaseVendorManifest: o, normalizeAdminReleaseVendorManifestRecord: s, validateAdminShellHtmlSource: i } = n;
  return {
    normalizeConfigSnapshotMeta(c = {}) {
      const l = c && typeof c == "object" ? c : {};
      return {
        reason: String(l.reason || "save_config").trim() || "save_config",
        section: String(l.section || "all").trim() || "all",
        actor: String(l.actor || "admin").trim() || "admin",
        source: String(l.source || "ui").trim() || "ui",
        note: String(l.note || "").trim()
      };
    },
    async readStoredConfigSnapshots(c) {
      if (!c) return [];
      try {
        const l = await c.get(e.CONFIG_SNAPSHOTS_KEY, { type: "json" });
        return Array.isArray(l) ? l : [];
      } catch {
        return [];
      }
    },
    async readStoredConfigSnapshotsStrict(c) {
      if (!c) return [];
      const l = await we(c, e.CONFIG_SNAPSHOTS_KEY, { type: "json" });
      if (l == null) return [];
      if (Array.isArray(l)) return l;
      const u = /* @__PURE__ */ new Error("Stored config snapshots are invalid");
      throw u.code = "CONFIG_SNAPSHOTS_INVALID", u.status = 409, u;
    },
    async writeStoredConfigSnapshots(c, l = [], u = {}) {
      if (!c) return [];
      const d = Array.isArray(l) ? l.slice(0, O.Defaults.ConfigSnapshotLimit) : [];
      return await c.put(e.CONFIG_SNAPSHOTS_KEY, JSON.stringify(d)), await e.ensureConfigSnapshotsMeta(c, d, u), d;
    },
    createSyntheticConfigSnapshot(c, l = {}, u = {}) {
      const d = e.normalizeConfigSnapshotMeta(l), f = bt(u.changedKeys || []), m = F(u.extraFields) ? u.extraFields : {};
      return ua({
        id: `cfg-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
        createdAt: (/* @__PURE__ */ new Date()).toISOString(),
        reason: d.reason,
        section: d.section,
        actor: d.actor,
        source: d.source,
        note: d.note,
        changedKeys: f,
        changeCount: Number(u.changeCount) || f.length,
        config: Wr(c),
        ...m
      });
    },
    async getConfigSnapshots(c, l = {}) {
      if (!c) return [];
      const u = await e.readStoredConfigSnapshots(c);
      return e.normalizeConfigSnapshotsForResponse(u, l);
    },
    normalizeConfigSnapshotsForResponse(c = [], l = {}) {
      const u = l.withConfig === !0;
      return (Array.isArray(c) ? c : []).filter((d) => d && typeof d == "object" && Array.isArray(d.changedKeys) && d.createdAt).map((d) => u ? ua(d) : {
        id: d.id,
        createdAt: d.createdAt,
        reason: d.reason,
        section: d.section,
        actor: d.actor,
        source: d.source,
        note: d.note || "",
        changedKeys: [...d.changedKeys],
        changeCount: Number(d.changeCount) || d.changedKeys.length || 0
      });
    },
    async getConfigSnapshotsForRead(c, l = {}) {
      if (!c) return [];
      const u = await e.readStoredConfigSnapshotsStrict(c);
      return e.normalizeConfigSnapshotsForResponse(u, l);
    },
    async getConfigSnapshotById(c, l) {
      return (await e.getConfigSnapshotsForRead(c, { withConfig: !0 })).find((u) => u.id === l) || null;
    },
    buildAdminIndexUploadKey(c = "") {
      const l = Et(c);
      return l ? `${e.ADMIN_INDEX_UPLOAD_PREFIX}${l}` : "";
    },
    normalizeAdminIndexUploadRecord(c = {}, l = "") {
      if (!F(c)) return null;
      const u = Et(c.revision), d = Et(l);
      if (!u || d && u !== d) return null;
      const f = Kr(u), m = go(u), p = String(c.html || "");
      return p ? {
        version: Number(c.version) || 1,
        revision: u,
        assetRevision: m,
        sourceUrl: f,
        fileName: String(c.fileName || "index.html").trim() || "index.html",
        uploadedAt: String(c.uploadedAt || "").trim(),
        bytes: Number(c.bytes) || new TextEncoder().encode(p).length,
        html: p,
        manifest: s(c.manifest || {})
      } : null;
    },
    async validateAdminIndexUploadRecord(c = {}, l = "") {
      const u = e.normalizeAdminIndexUploadRecord(c, l);
      if (!u || await Ln(u.html) !== u.revision) return null;
      try {
        const d = i(u.html, u.sourceUrl, {
          sourceLabel: "local admin index",
          contentType: "text/html"
        });
        return {
          ...u,
          bytes: d.bytes,
          manifest: s(o(d.html, {
            releaseTag: u.assetRevision,
            sourceUrl: u.sourceUrl
          }))
        };
      } catch {
        return null;
      }
    },
    async getAdminActiveIndexRecord(c) {
      return c ? e.validateAdminIndexUploadRecord(await we(c, e.ADMIN_ACTIVE_INDEX_KEY, { type: "json" })) : null;
    },
    async getAdminIndexUploadRecord(c, l = "") {
      const u = e.buildAdminIndexUploadKey(l);
      if (!c || !u) return null;
      const d = await e.validateAdminIndexUploadRecord(await we(c, u, { type: "json" }), l);
      return d || e.validateAdminIndexUploadRecord(await we(c, e.ADMIN_ACTIVE_INDEX_KEY, { type: "json" }), l);
    },
    collectReferencedAdminIndexUploadRevisions(c = {}, l = []) {
      const u = /* @__PURE__ */ new Set(), d = (f) => {
        const m = je(f?.indexUrl || "");
        m && u.add(m);
      };
      d(c);
      for (const f of Array.isArray(l) ? l : []) d(f?.config);
      return u;
    },
    collectUnreferencedAdminIndexUploadKeys(c = {}, l = [], u = []) {
      const d = e.collectReferencedAdminIndexUploadRevisions(c, l);
      return (Array.isArray(u) ? u : []).filter((f) => {
        const m = String(f || "").trim();
        if (!m.startsWith(e.ADMIN_INDEX_UPLOAD_PREFIX)) return !1;
        const p = Et(m.slice(e.ADMIN_INDEX_UPLOAD_PREFIX.length));
        return p && !d.has(p);
      });
    },
    async persistAdminIndexUpload(c = {}, l = {}) {
      const { env: u, kv: d, ctx: f } = l;
      if (!d) {
        const p = /* @__PURE__ */ new Error("KV namespace is required to persist the local admin index");
        throw p.code = "KV_NOT_CONFIGURED", p.status = 503, p;
      }
      const m = e.normalizeAdminIndexUploadRecord(c, c?.revision);
      if (!m) {
        const p = /* @__PURE__ */ new Error("本地 index.html 上传记录无效");
        throw p.code = "ADMIN_INDEX_UPLOAD_INVALID", p.status = 400, p;
      }
      return await Yt(d)(async () => {
        const p = e.buildAdminIndexUploadKey(m.revision), g = await we(d, p, { type: "json" }), h = await we(d, e.ADMIN_ACTIVE_INDEX_KEY, { type: "json" });
        let y = e.normalizeAdminIndexUploadRecord(g, m.revision);
        y && await Ln(y.html) !== m.revision && (y = null);
        const S = y || m;
        y || await d.put(p, JSON.stringify(m)), await d.put(e.ADMIN_ACTIVE_INDEX_KEY, JSON.stringify(S));
        try {
          const _ = u ? await ue(u) : te(await we(d, e.CONFIG_KEY, { type: "json" }) || {});
          return {
            config: await e.commitRuntimeConfig({
              ..._,
              indexUrl: S.sourceUrl
            }, {
              env: u,
              kv: d,
              ctx: f,
              snapshotMeta: {
                reason: "upload_admin_index",
                section: "static_assets_policy",
                source: "admin_gate_local_upload",
                actor: "admin",
                note: S.fileName
              }
            }),
            previousConfig: _,
            record: S
          };
        } catch (_) {
          throw await ge(h ? d.put(e.ADMIN_ACTIVE_INDEX_KEY, JSON.stringify(h)) : d.delete(e.ADMIN_ACTIVE_INDEX_KEY), "admin.active_index_upload_rollback", { revision: m.revision }, null), y || await ge(g ? d.put(p, JSON.stringify(g)) : d.delete(p), "admin.local_index_upload_rollback", { revision: m.revision }, null), _;
        }
      });
    },
    async rollbackAdminIndexUploadActivation(c = {}, l = {}, u = {}) {
      const { env: d, kv: f, ctx: m } = u;
      if (!f) {
        const p = /* @__PURE__ */ new Error("KV namespace is required to roll back the local admin index");
        throw p.code = "KV_NOT_CONFIGURED", p.status = 503, p;
      }
      return await Yt(f)(async () => {
        const p = d ? await ue(d) : te(await we(f, e.CONFIG_KEY, { type: "json" }) || {}), g = je(l?.indexUrl || ""), h = je(p?.indexUrl || "");
        if (!g || h !== g) return {
          config: p,
          skipped: !0,
          reason: h ? "superseded_by_newer_admin_index" : "admin_index_already_restored"
        };
        const y = je(c?.indexUrl || ""), S = await we(f, e.ADMIN_ACTIVE_INDEX_KEY, { type: "json" }), _ = y ? await e.getAdminIndexUploadRecord(f, y) : null;
        _ ? await f.put(e.ADMIN_ACTIVE_INDEX_KEY, JSON.stringify(_)) : await f.delete(e.ADMIN_ACTIVE_INDEX_KEY);
        try {
          return {
            config: await e.commitRuntimeConfig({
              ...p,
              indexUrl: y ? Kr(y) : ""
            }, {
              env: d,
              kv: f,
              ctx: m,
              snapshotMeta: {
                reason: "rollback_worker_html_update",
                section: "static_assets_policy",
                source: "worker_html_upload",
                actor: "system"
              }
            }),
            skipped: !1,
            reason: ""
          };
        } catch (A) {
          throw await ge(S ? f.put(e.ADMIN_ACTIVE_INDEX_KEY, JSON.stringify(S)) : f.delete(e.ADMIN_ACTIVE_INDEX_KEY), "admin.active_index_rollback_restore", { revision: g }, null), A;
        }
      });
    },
    async clearConfigSnapshots(c) {
      c && await e.writeStoredConfigSnapshots(c, []);
    },
    async captureRuntimeConfigRollbackState(c, l) {
      if (!l) return {
        config: te(c ? await Ae(c) : {}),
        kvEntries: []
      };
      const u = c ? await ue(c) : te(await we(l, e.CONFIG_KEY, { type: "json" }) || {}), d = [
        e.CONFIG_KEY,
        e.CONFIG_META_KEY,
        e.CONFIG_SNAPSHOTS_KEY,
        e.CONFIG_SNAPSHOTS_META_KEY,
        ...e.buildLegacyConfigCacheKeys(u)
      ];
      return {
        config: u,
        kvEntries: await e.captureRawKvEntries(l, d)
      };
    },
    async restoreCapturedRuntimeConfigState(c = {}, l = {}) {
      const u = l.kv, d = te(c?.config || {});
      if (!u) return d;
      const f = Array.isArray(c?.kvEntries) ? c.kvEntries : [];
      if (f.length > 0) {
        const m = f.map((p) => p?.exists === !0 ? {
          type: "put",
          key: String(p?.key || "").trim(),
          value: String(p?.value ?? "")
        } : {
          type: "delete",
          key: String(p?.key || "").trim(),
          value: ""
        });
        await e.applyKvMutationsWithRollback(u, m);
      }
      return za(l.env), l.env ? await Ae(l.env) : d;
    },
    async restoreCapturedRuntimeConfigAndDnsState(c = {}, l = {}) {
      const u = te(c?.config || {});
      let d = null, f = null, m = u;
      try {
        await e.commitRuntimeConfig(u, {
          env: l.env,
          kv: l.kv,
          ctx: l.ctx,
          snapshotMeta: {
            reason: "rollback_config_dns",
            section: "all",
            source: "rollback",
            actor: "system"
          }
        });
      } catch (p) {
        d = p;
      }
      try {
        m = await e.restoreCapturedRuntimeConfigState(c, l);
      } catch (p) {
        f = p;
      }
      if (d || f) {
        const p = new Error([d ? `dns:${ie(d, "restore_failed")}` : "", f ? `kv:${ie(f, "restore_failed")}` : ""].filter(Boolean).join("; "));
        throw p.code = "CONFIG_DNS_RESTORE_FAILED", p.status = 500, p.details = {
          dnsRestoreError: d ? ie(d, "restore_failed") : "",
          kvRestoreError: f ? ie(f, "restore_failed") : ""
        }, p;
      }
      return m;
    }
  };
}
function op(n = {}, e = {}) {
  const { D1TidyExecutor: a, D1TidyPlanner: t, Logger: r, buildAdminReleaseVendorManifest: o, normalizeAdminReleaseVendorManifestRecord: s, validateAdminShellHtmlSource: i } = n;
  return {
    async recordConfigSnapshot(c, l, u, d = {}) {
      if (!c) return null;
      const f = zn(l, u);
      if (!f.length) return null;
      const m = e.normalizeConfigSnapshotMeta(d), p = await e.getConfigSnapshots(c, { withConfig: !0 }), g = {
        id: `cfg-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
        createdAt: (/* @__PURE__ */ new Date()).toISOString(),
        reason: m.reason,
        section: m.section,
        actor: m.actor,
        source: m.source,
        note: m.note,
        changedKeys: f.map((y) => y.key),
        changeCount: f.length,
        config: Wr(l)
      }, h = [g, ...p].slice(0, O.Defaults.ConfigSnapshotLimit);
      return await e.writeStoredConfigSnapshots(c, h), g;
    },
    async persistRuntimeConfig(c, l = {}) {
      return await Yt(l.kv || Ra(l.env))(() => e.commitRuntimeConfig(c, l));
    },
    async prepareRuntimeConfigPersistence(c, l = {}) {
      const { env: u, kv: d, ctx: f, snapshotMeta: m } = l;
      if (!d) {
        const S = /* @__PURE__ */ new Error("KV namespace is required to persist runtime config");
        throw S.code = "KV_NOT_CONFIGURED", S.status = 503, S;
      }
      Kl(c?.defaultHostPrefixCnameTarget);
      const p = u ? await ue(u) : te(await we(d, e.CONFIG_KEY, { type: "json" }) || {}), g = te(c);
      jl(c), ql(g, u);
      const h = Ke(u), y = Ua(null, p, h) !== Ua(null, g, h) ? (await e.loadAllNodeEntitiesFromKvStrict(d, { ctx: f })).filter((S) => Qe(S?.entryMode) && !Bt(S?.hostPrefixCnameTarget)) : [];
      return y.length > 0 && La(g, u), {
        prevConfig: p,
        nextConfig: g,
        configuredHost: h,
        dnsPlans: y.map((S) => e.buildHostPrefixDnsSyncPlan(S.name, S, S.name, S, h, {
          previousConfig: p,
          nextConfig: g
        })).filter((S) => S.changed === !0),
        snapshotMeta: m,
        ctx: f,
        kv: d,
        env: u
      };
    },
    async buildRuntimeConfigMutationPlan(c, l, u, d = {}) {
      const f = zn(l, u), m = (await e.readStoredConfigSnapshotsStrict(c)).map((A) => ua(A)), p = f.length > 0 ? [e.createSyntheticConfigSnapshot(l, d, {
        changedKeys: f.map((A) => A.key),
        changeCount: f.length
      }), ...m].slice(0, O.Defaults.ConfigSnapshotLimit) : m.slice(0, O.Defaults.ConfigSnapshotLimit), g = e.normalizeRevisionMeta(Tr(u)), h = e.normalizeRevisionMeta({
        ...Tr(p),
        count: p.length
      }, { count: 0 }), y = [
        {
          type: "put",
          key: e.CONFIG_SNAPSHOTS_KEY,
          value: JSON.stringify(p)
        },
        {
          type: "put",
          key: e.CONFIG_SNAPSHOTS_META_KEY,
          value: JSON.stringify(h)
        },
        {
          type: "put",
          key: e.CONFIG_KEY,
          value: JSON.stringify(u)
        },
        {
          type: "put",
          key: e.CONFIG_META_KEY,
          value: JSON.stringify(g)
        }
      ];
      for (const A of e.buildLegacyConfigCacheKeys(l, u)) y.push({
        type: "delete",
        key: A,
        value: ""
      });
      const S = e.collectReferencedAdminIndexUploadRevisions(l, m), _ = e.collectReferencedAdminIndexUploadRevisions(u, p);
      for (const A of S)
        _.has(A) || y.push({
          type: "delete",
          key: e.buildAdminIndexUploadKey(A),
          value: ""
        });
      return y;
    },
    async commitRuntimeConfig(c, l = {}) {
      const { prevConfig: u, nextConfig: d, configuredHost: f, dnsPlans: m, snapshotMeta: p, ctx: g, kv: h, env: y } = await e.prepareRuntimeConfigPersistence(c, l);
      if (se(u) === se(d))
        return await e.ensureConfigMeta(h, d, { ctx: g }), d;
      const S = [];
      let _ = null, A = !1;
      try {
        for (const R of m)
          _ = R, await e.persistHostPrefixDnsSyncPlan(R, {
            env: y,
            kv: h,
            ctx: g,
            config: d,
            requestHost: f
          }), S.push(R), _ = null;
        A = !0;
        const b = await e.buildRuntimeConfigMutationPlan(h, u, d, p);
        return await e.applyKvMutationsWithRollback(h, b), y ? bu(y, d) : za(), await e.invalidateDashboardSnapshotCacheForConfigChange(y, {
          prevConfig: u,
          nextConfig: d
        }), d;
      } catch (b) {
        const R = [], E = _ ? [...S, _] : S;
        for (let D = E.length - 1; D >= 0; D -= 1) try {
          await e.persistHostPrefixDnsSyncPlan({ steps: E[D].rollbackSteps }, {
            env: y,
            kv: h,
            ctx: g,
            config: d,
            requestHost: f,
            skipHistory: !0
          });
        } catch (w) {
          R.push(ie(w, "dns_rollback_failed"));
        }
        if (b && typeof b == "object") {
          const D = Array.isArray(b?.details?.rollbackConflicts) ? b.details.rollbackConflicts : [], w = Array.isArray(b?.details?.rollbackFailures) ? b.details.rollbackFailures : [];
          b.details = {
            ...F(b.details) ? b.details : {},
            hostPrefixDnsSyncAttempted: m.length > 0,
            hostPrefixDnsSyncedCount: S.length,
            failedHostPrefixDnsHost: String(_?.nextDnsHost || _?.previousDnsHost || ""),
            rollbackAttempted: E.length > 0 || A,
            rollbackSucceeded: R.length === 0 && D.length === 0 && w.length === 0,
            rollbackError: [...R, ...w].join("; "),
            rollbackConflicts: D
          };
        }
        throw b;
      }
    },
    async commitSourceDirectNodesConfigWithinMutation(c, l, u, d = {}) {
      if (!l) return null;
      const f = c ? await ue(c) : te(await l.get(e.CONFIG_KEY, { type: "json" }) || {}), m = ut(f.sourceDirectNodes || []), p = Wn(m, {
        renameMap: d.renameMap,
        removedNames: d.removedNames,
        allowedNames: d.allowedNames
      });
      return se(m) === se(p) ? f : e.commitRuntimeConfig({
        ...f,
        sourceDirectNodes: p
      }, {
        env: c,
        kv: l,
        ctx: u,
        snapshotMeta: {
          reason: "sync_node_shortcut_selections",
          section: "proxy",
          source: String(d.source || "node_mutation"),
          actor: "admin",
          note: String(d.note || "").trim()
        }
      });
    },
    async commitSingleNodeMainVideoStreamShortcutShadowWithinMutation(c, l, u, d = {}) {
      if (!l) return null;
      const f = c ? await ue(c) : te(await l.get(e.CONFIG_KEY, { type: "json" }) || {}), m = String(d.originalName || "").trim().toLowerCase(), p = String(d.nodeName || "").trim().toLowerCase(), g = tn(d.mode);
      let h = ut(f.sourceDirectNodes || []);
      return m && m !== p && (h = Wn(h, { renameMap: { [m]: p } })), h = h.filter((y) => String(y || "").trim().toLowerCase() !== p), p && g === "direct" && h.push(p), h = ut(h), se(f.sourceDirectNodes || []) === se(h) ? f : e.commitRuntimeConfig({
        ...f,
        sourceDirectNodes: h
      }, {
        env: c,
        kv: l,
        ctx: u,
        snapshotMeta: {
          reason: "sync_main_video_stream_shortcuts",
          section: "proxy",
          source: String(d.source || "node_save"),
          actor: "admin",
          note: String(d.note || p || "").trim()
        }
      });
    }
  };
}
function sp(n = {}, e = {}) {
  const { D1TidyExecutor: a, D1TidyPlanner: t, Logger: r, buildAdminReleaseVendorManifest: o, normalizeAdminReleaseVendorManifestRecord: s, validateAdminShellHtmlSource: i } = n;
  return {
    async sendTelegramMessage({ tgBotToken: c, tgChatId: l, text: u }) {
      const d = String(c || "").trim(), f = String(l || "").trim();
      if (!d || !f) throw new Error("请先完善 Telegram Bot Token 和 Chat ID 配置");
      const m = await xe(await Oe(`https://api.telegram.org/bot${d}/sendMessage`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          chat_id: f,
          text: String(u || "")
        })
      }), en);
      if (m.exceeded) throw new Error("Telegram API response too large");
      const p = JSON.parse(m.text);
      if (!p.ok) throw new Error(p.description || "Telegram API 返回错误");
      return p;
    },
    async buildDailyTelegramSummaryPayload(c, l = {}) {
      const u = te(l?.config || await ue(c)), d = l?.now instanceof Date ? new Date(l.now.getTime()) : new Date(l?.now || /* @__PURE__ */ new Date()), f = l?.dayWindow && typeof l.dayWindow == "object" ? l.dayWindow : dt(d, u.scheduleUtcOffsetMinutes), [m, p] = await Promise.all([e.buildDashboardStatsPayload(c, {
        config: u,
        dayWindow: f,
        nowMs: d.getTime(),
        skipD1WriteHotspot: !0
      }), e.getDashboardMonthlyTrafficPayload(c, {
        config: u,
        ctx: l?.ctx || null,
        nowMs: d.getTime()
      })]);
      return {
        zoneName: String(m?.zoneName || "").trim(),
        requestCountDisplay: String(m?.requestCountDisplay || "").trim() || (m?.todayRequests === null || m?.todayRequests === void 0 ? "暂不可用" : String(Number(m?.todayRequests) || 0)),
        requestSourceText: String(m?.requestSourceText || "").trim(),
        todayTraffic: String(m?.todayTraffic || "").trim() || "暂不可用",
        monthlyTraffic: String(p?.traffic || "").trim() || "暂不可用",
        trafficSourceText: String(m?.trafficSourceText || "").trim(),
        playCount: Math.max(0, Number(m?.playCount) || 0),
        infoCount: Math.max(0, Number(m?.infoCount) || 0),
        nodeCount: Math.max(0, Number(m?.nodeCount) || 0),
        todayRequests: m?.todayRequests ?? null
      };
    },
    async sendDailyTelegramReport(c, l = {}) {
      const u = e.getDB(c), d = e.getKV(c);
      if (!u || !d) throw new Error("Database or KV not configured");
      const f = await d.get(e.CONFIG_KEY, { type: "json" }) || {}, m = te(f), p = String(m.tgBotToken || "").trim(), g = String(m.tgChatId || "").trim();
      if (!p || !g) throw new Error("请先完善 Telegram Bot Token 和 Chat ID 配置");
      const h = l?.now instanceof Date ? new Date(l.now.getTime()) : new Date(l?.now || /* @__PURE__ */ new Date()), y = dt(h, m.scheduleUtcOffsetMinutes), S = Si(m, f, {
        reportKinds: l?.reportKinds,
        fallbackAllWhenLegacy: !0
      });
      if (!S.length) throw new Error("请先至少启用一个日报类型");
      const _ = S.includes("summary") ? await e.buildDailyTelegramSummaryPayload(c, {
        config: m,
        now: h,
        dayWindow: y
      }) : null, A = S.some((R) => R !== "summary") ? await e.getCloudflareRuntimeQuotaStatus(c, {
        config: m,
        db: u
      }) : null, b = [];
      for (const R of S) {
        const E = Bd(R, R === "summary" ? _ : A?.[R], y);
        await e.sendTelegramMessage({
          tgBotToken: p,
          tgChatId: g,
          text: E
        }), b.push({
          kind: R,
          text: E
        });
      }
      return {
        success: b.length > 0,
        sentCount: b.length,
        reportKinds: S,
        messages: b
      };
    },
    async maybeSendRuntimeAlerts(c, l = null, u = {}) {
      const d = e.getDB(c);
      if (!d) return {
        sent: !1,
        reason: "db_unavailable"
      };
      if (!await e.ensureSysStatusTable(d)) return {
        sent: !1,
        reason: "db_init_failed"
      };
      const f = te(await Ae(c)), m = u && typeof u == "object" ? u : {}, p = String(f.tgBotToken || "").trim(), g = String(f.tgChatId || "").trim();
      if (!p || !g) return {
        sent: !1,
        reason: "telegram_not_configured"
      };
      const h = de(f.tgAlertDroppedBatchThreshold, O.Defaults.TgAlertDroppedBatchThreshold, 0, 5e3), y = de(f.tgAlertFlushRetryThreshold, O.Defaults.TgAlertFlushRetryThreshold, 0, 10), S = de(f.tgAlertCooldownMinutes, O.Defaults.TgAlertCooldownMinutes, 1, 1440), _ = f.tgAlertOnScheduledFailure === !0, A = f.tgAlertKvUsageEnabled === !0, b = f.tgAlertD1UsageEnabled === !0, R = de(f.tgAlertKvUsageThresholdPercent, O.Defaults.TgAlertKvUsageThresholdPercent, 1, 100), E = de(f.tgAlertD1UsageThresholdPercent, O.Defaults.TgAlertD1UsageThresholdPercent, 1, 100);
      if (h <= 0 && y <= 0 && !_ && !A && !b) return {
        sent: !1,
        reason: "thresholds_disabled"
      };
      const D = await e.getOpsStatus(c), w = D && typeof D.log == "object" ? D.log : {}, C = l && typeof l == "object" && Object.keys(l).length ? l : D && typeof D.scheduled == "object" ? D.scheduled : {}, T = [], I = Number(w.lastDroppedBatchSize) || 0;
      h > 0 && I >= h && T.push({
        code: "log_drop",
        message: `日志刷盘疑似丢弃批次：${I} 条（阈值 ${h}）`,
        eventAt: w.lastFlushErrorAt || w.lastOverflowAt || w.updatedAt || D.updatedAt || ""
      });
      const P = Number(w.lastFlushRetryCount) || 0;
      y > 0 && P >= y && T.push({
        code: "log_retry",
        message: `D1 写入重试次数偏高：${P} 次（阈值 ${y}）`,
        eventAt: w.lastFlushAt || w.lastFlushErrorAt || w.updatedAt || D.updatedAt || ""
      });
      const U = String(C.status || "").toLowerCase();
      if (_ && (U === "failed" || U === "partial_failure")) {
        const v = [];
        for (const [W, z] of Object.entries({
          cleanup: "日志清理",
          tgDailyReport: "每日报表",
          alerts: "异常告警"
        })) {
          const H = C?.[W];
          if (!H || typeof H != "object") continue;
          const j = String(H.status || "").trim(), ne = String(H.lastError || "").trim();
          !ne && j !== "failed" && j !== "partial_failure" || v.push(`${z}：${j || "failed"}${ne ? `，错误：${ne}` : ""}`);
        }
        T.push({
          code: "scheduled_failure",
          message: v.length ? `定时任务状态异常：${v.join("；")}` : `定时任务状态异常：${C.status}${C.lastError ? `，错误：${C.lastError}` : ""}`,
          eventAt: C.lastFinishedAt || C.lastErrorAt || C.updatedAt || D.updatedAt || ""
        });
      }
      if (A || b) {
        const v = await e.getCloudflareRuntimeQuotaStatus(c, {
          config: f,
          db: d
        }), W = [{
          enabled: A,
          threshold: R,
          code: "cf_kv_usage",
          title: "KV",
          card: v?.kv
        }, {
          enabled: b,
          threshold: E,
          code: "cf_d1_usage",
          title: "D1",
          card: v?.d1
        }];
        for (const z of W) {
          if (z.enabled !== !0) continue;
          const H = z.card && typeof z.card == "object" ? z.card : {}, j = String(H.status || "").trim().toLowerCase();
          if (j !== "success" && j !== "partial_failure") continue;
          const ne = (Array.isArray(H.metrics) ? H.metrics : []).filter((me) => Number(me?.percent) >= z.threshold);
          if (!ne.length) continue;
          const fe = ne.map((me) => `${String(me?.key || "").trim()}:${String(me?.percentText || "").trim()}`).filter(Boolean).join(",");
          T.push({
            code: z.code,
            message: zd(z.title, H, z.threshold, ne),
            eventAt: `${String(H.resourceLabel || z.title || "").trim()}|${String(H.planLabel || "").trim()}|${String(H.periodLabel || "").trim()}|${fe}|${j}`
          });
        }
      }
      if (!T.length) return {
        sent: !1,
        reason: "no_alerts"
      };
      const K = JSON.stringify(T.map((v) => ({
        code: v.code,
        eventAt: v.eventAt,
        message: v.message
      }))), G = await e.getOpsStatusPayloadFromDb(d, e.TELEGRAM_ALERT_STATE_DB_SCOPE), x = Date.now(), N = S * 60 * 1e3;
      if (m.ignoreCooldown !== !0 && G && G.signature === K && Number(G.sentAtMs) > 0 && x - Number(G.sentAtMs) < N) return {
        sent: !1,
        reason: "cooldown_active"
      };
      const M = hl(/* @__PURE__ */ new Date(), f.scheduleUtcOffsetMinutes), L = [
        "⚠️ Emby Proxy 运行时异常告警",
        "",
        ...T.map((v) => `- ${v.message}`),
        "",
        `时间：${M.dateKey} ${M.clockTime} (${M.offsetLabel})`,
        "#Emby #Alert"
      ];
      return await e.sendTelegramMessage({
        tgBotToken: p,
        tgChatId: g,
        text: L.join(`
`)
      }), m.persistState !== !1 && (await e.putOpsStatusPayloadToDb(d, e.TELEGRAM_ALERT_STATE_DB_SCOPE, {
        signature: K,
        sentAt: new Date(x).toISOString(),
        sentAtMs: x,
        issues: T
      }, x) || Me("telegram_alert_state.write_failed", /* @__PURE__ */ new Error("telegram alert cooldown state not persisted"), { issueCount: T.length })), {
        sent: !0,
        issueCount: T.length,
        reason: "alert_sent"
      };
    }
  };
}
function ip(n = {}, e = {}) {
  return {
    ...rp(n, e),
    ...ap(n, e),
    ...np(n, e),
    ...op(n, e),
    ...sp(n, e)
  };
}
var cp = class {
  constructor({ logger: n, service: e }) {
    this.logger = n, this.service = e;
  }
  handle(n, e, a) {
    if (!a || typeof a.waitUntil != "function") throw new TypeError("ScheduledMaintenanceFacade.handle requires ctx.waitUntil");
    const t = this.#y(n, e, a);
    a.waitUntil(t);
  }
  #e(n = {}, ...e) {
    for (const a of e) {
      if (!a) continue;
      const t = n?.[a];
      if (F(t)) return t;
    }
    return {};
  }
  #a(n = "success") {
    return n === "success" ? "partial_failure" : n;
  }
  #f(n = []) {
    return String(n[0]?.dueAt || "");
  }
  #o(n = {}, e = "") {
    const a = String(e || n?.localDateKey || "");
    return a ? {
      ...n,
      localDateKey: a,
      executedSlots: At(n?.executedSlots || [], [])
    } : {
      ...n,
      executedSlots: At(n?.executedSlots || [], [])
    };
  }
  #n(n = {}, e = "", a = "") {
    return this.#o({
      ...n,
      executedSlots: [...n?.executedSlots || [], a]
    }, e);
  }
  #s(n = "", e = []) {
    const a = e[e.length - 1] || "";
    return {
      processedSlots: e,
      lastPlannedSlot: a ? `${n} ${a}` : "",
      reason: e.length > 1 ? "clock_slots_processed" : "clock_slot_processed"
    };
  }
  #t(n = {}, e = "", a = "", t = {}) {
    return {
      ...n,
      status: "skipped",
      lastSkippedAt: e,
      reason: a,
      ...t
    };
  }
  #u(n = {}, e = "", a = {}) {
    return {
      ...n,
      status: "pending",
      reason: e,
      ...a
    };
  }
  #i(n = {}, e = "", a = {}) {
    return {
      ...n,
      status: "success",
      lastSuccessAt: e,
      ...a
    };
  }
  #r(n = {}, e = "", a = "", t = {}) {
    return {
      ...n,
      status: "failed",
      lastErrorAt: e,
      lastError: a,
      ...t
    };
  }
  #d(n = {}, e = {}, a = {}) {
    const t = F(e) ? e : {}, r = F(a.extra) ? a.extra : {};
    return t.status === "success" ? this.#i(n, String(t.lastSuccessAt || a.at || "").trim(), {
      ...t,
      ...r
    }) : t.status === "failed" ? this.#r(n, String(t.lastErrorAt || a.at || "").trim(), String(t.lastError || a.error || "").trim(), {
      ...t,
      ...r
    }) : this.#t(n, String(t.lastSkippedAt || a.at || "").trim(), String(t.reason || a.defaultReason || "").trim(), {
      ...t,
      ...r
    });
  }
  #l(n = "") {
    return async (e, a, t = null, r = null) => {
      try {
        return await e;
      } catch (o) {
        return this.logger.error(`scheduled.${a}`, o, {
          leaseToken: n,
          ...F(t) ? t : {}
        }), r;
      }
    };
  }
  #c(n, e, a) {
    return { scheduled: {
      lastSkippedAt: n,
      lastSkipReason: a,
      lock: {
        status: "busy",
        reason: a,
        expiresAt: e.lock?.expiresAt || null,
        backend: String(e?.backend || e?.lock?.backend || "").trim() || "d1"
      }
    } };
  }
  #m(n, e, a = "d1") {
    const t = String(e || "scheduled_skipped").trim() || "scheduled_skipped";
    return { scheduled: {
      status: "skipped",
      lastSkippedAt: n,
      lastSkipReason: t,
      lastFinishedAt: n,
      lock: {
        status: "skipped",
        reason: t,
        backend: String(a || "").trim() || "d1"
      }
    } };
  }
  #p(n, e, a, t) {
    return { scheduled: {
      status: "running",
      lastStartedAt: n,
      lock: {
        status: "held",
        token: e,
        expiresAt: a.lock?.expiresAt || k() + t
      }
    } };
  }
  #g(n, e, a) {
    return n.lostReason ? {
      status: "lost",
      reason: n.lostReason,
      lastCheckedAt: e
    } : {
      status: a ? "released" : "release_skipped",
      releasedAt: e
    };
  }
  #h({ leaseStores: n, leaseToken: e, scheduledLeaseMs: a, leaseBackend: t = "", initialLock: r = null }) {
    const o = {
      active: !0,
      lostReason: null,
      lock: r
    }, s = async () => {
      if (!o.active) return null;
      const l = await this.service.renewScheduledLease(n, e, a, { backend: t });
      return l ? (o.lock = l, l) : (o.active = !1, o.lostReason = o.lostReason || "lease_lost", null);
    }, i = async () => {
      if (!o.active) throw new Error(o.lostReason || "scheduled_lease_lost");
      const l = await s();
      if (!l) throw new Error(o.lostReason || "scheduled_lease_lost");
      return l;
    }, c = Math.max(5e3, Math.min(Math.floor(a / 3), 6e4));
    return {
      leaseState: o,
      ensureActive: i,
      keepalivePromise: (async () => {
        for (; o.active; ) {
          let l = c;
          for (; o.active && l > 0; ) {
            const u = Math.min(l, 1e3);
            await so(u), l -= u;
          }
          if (!o.active) break;
          await s();
        }
      })().catch((l) => {
        o.active = !1, o.lostReason = o.lostReason || "lease_renew_failed", this.logger.error("scheduled.lease_keepalive", l, {
          leaseToken: e,
          backend: t || "unknown",
          lostReason: o.lostReason
        });
      })
    };
  }
  async #y(n, e, a) {
    const t = this.service.getDB(e), r = this.service.getKV(e);
    if (!r && !t) return;
    const o = { db: t }, s = await Ae(e), i = ke(s?.scheduleUtcOffsetMinutes), c = n?.scheduledTime !== void 0 ? new Date(n.scheduledTime) : /* @__PURE__ */ new Date(), l = Ko(c, i), u = (E = /* @__PURE__ */ new Date()) => Ko(E, i), d = de(s?.scheduledLeaseMs, O.Defaults.ScheduledLeaseMs, O.Defaults.ScheduledLeaseMinMs, 900 * 1e3), f = `${k()}-${Math.random().toString(36).slice(2, 10)}`, m = this.#l(f), p = async (E) => {
      const D = String(E || "db_unavailable").trim() || "db_unavailable";
      await m(this.service.patchOpsStatus(e, this.#m(l, D, "d1")), "patch_skipped_status", {
        reason: D,
        backend: "d1"
      }, null);
    };
    if (!t) {
      await p("db_not_configured");
      return;
    }
    const g = await this.service.tryAcquireScheduledLeaseWithDb(t, {
      token: f,
      leaseMs: d
    });
    if (!g.acquired) {
      const E = String(g.reason || "lease_not_acquired");
      if (E === "db_not_configured" || E === "db_unavailable" || E === "db_init_failed") {
        await p(E);
        return;
      }
      await m(this.service.patchOpsStatus(e, this.#c(l, g, E)), "patch_busy_status", { reason: E }, null);
      return;
    }
    const h = String(g.backend || g.lock?.backend || "").trim().toLowerCase(), { leaseState: y, ensureActive: S, keepalivePromise: _ } = this.#h({
      leaseStores: o,
      leaseToken: f,
      scheduledLeaseMs: d,
      leaseBackend: h,
      initialLock: g.lock || null
    }), A = l;
    await m(this.service.patchOpsStatus(e, this.#p(A, f, y, d)), "patch_running_status", { startedAt: A }, null);
    const b = {
      status: "success",
      lastStartedAt: A,
      lastFinishedAt: null,
      lastSuccessAt: null,
      lastErrorAt: null,
      lastError: null,
      d1Tidy: {},
      cleanup: {},
      kvTidy: {},
      tgDailyReport: {},
      alerts: {}
    }, R = () => u(/* @__PURE__ */ new Date());
    try {
      const E = s || {}, D = await m(this.service.getOpsStatusSection(e, "scheduled"), "read_previous_status", null, {});
      if (t) try {
        await S();
        const x = dt(c, E.scheduleUtcOffsetMinutes), N = x.dateKey, M = x.startTs, L = x.endTs, v = ke(E.scheduleUtcOffsetMinutes), W = this.service.getPreviousD1TidyState(D), z = await this.service.tidyD1Data(e, {
          db: t,
          kv: r,
          ctx: a,
          config: E,
          mode: "scheduled",
          maintenanceMode: "smart",
          previousScheduledState: D,
          previousCleanupStatus: W,
          scheduledNow: c,
          dayWindow: x,
          statsBucketDate: N,
          statsStartTs: M,
          statsEndTs: L,
          statsUtcOffsetMinutes: v,
          beforeEachStep: S
        }), H = R(), j = this.service.buildD1TidyStatusPayload(z.summary, {
          mode: "scheduled",
          maintenanceMode: "smart",
          triggeredBy: "scheduled",
          timestamp: H
        });
        b.d1Tidy = j.d1Tidy, b.cleanup = j.cleanup, (b.d1Tidy.status === "partial_failure" || b.d1Tidy.status === "failed") && (b.status = "partial_failure"), await S();
      } catch (x) {
        b.status = "partial_failure";
        const N = this.service.buildD1TidyStatusPayload({
          status: "failed",
          lastError: x?.message || String(x),
          maintenanceMode: "smart"
        }, {
          mode: "scheduled",
          maintenanceMode: "smart",
          triggeredBy: "scheduled",
          timestamp: R()
        });
        b.d1Tidy = N.d1Tidy, b.cleanup = N.cleanup, this.logger.error("Scheduled DB Cleanup Error: ", x);
      }
      else {
        const x = this.service.buildD1TidyStatusPayload({
          status: "skipped",
          reason: "db_not_configured",
          maintenanceMode: "smart"
        }, {
          mode: "scheduled",
          maintenanceMode: "smart",
          triggeredBy: "scheduled",
          timestamp: R()
        });
        b.d1Tidy = x.d1Tidy, b.cleanup = x.cleanup;
      }
      b.kvTidy = {
        ...this.#e(D, "kvTidy"),
        mode: "manual_only",
        lastAutoSkipAt: R(),
        autoSkipReason: "manual_only"
      };
      const { tgBotToken: w, tgChatId: C } = E, T = this.#e(D, "tgDailyReport", "report"), I = this.#e(D, "alerts"), P = At(E.tgDailyReportClockTimes, O.Defaults.TgDailyReportClockTimes), U = Sl(T, P, i, c), K = Si(E, E), G = {
        ...T,
        clockTimes: P,
        reportKinds: K
      };
      if (E.tgDailyReportEnabled === !0) {
        let x = this.#o(U.fixedQueue);
        if (!K.length) b.tgDailyReport = this.#t(G, R(), "report_kinds_disabled", { fixedQueue: x });
        else if (!w || !C) b.tgDailyReport = this.#t(G, R(), "telegram_not_configured", { fixedQueue: x });
        else if (U.due !== !0) b.tgDailyReport = this.#t(G, R(), U.reason || "time_not_matched", { fixedQueue: x });
        else {
          let N = [], M = null, L = 0;
          for (const v of U.dueSlots) try {
            await S();
            const W = await this.service.sendDailyTelegramReport(e, {
              now: c,
              reportKinds: K
            });
            L += Number(W?.sentCount) || 0, N.push(v), x = this.#n(x, U.context.dateKey, v);
          } catch (W) {
            M = W, this.logger.error("Scheduled Daily Report Error: ", W);
            break;
          }
          M ? (b.status = this.#a(b.status), b.tgDailyReport = this.#r(G, R(), M?.message || String(M), {
            fixedQueue: x,
            processedSlots: N
          })) : b.tgDailyReport = this.#i(G, R(), {
            fixedQueue: x,
            sentCount: L,
            ...this.#s(U.context.dateKey, N)
          });
        }
      } else b.tgDailyReport = this.#t(G, R(), "disabled", { fixedQueue: U.fixedQueue });
      try {
        await S();
        const x = await this.service.maybeSendRuntimeAlerts(e, b);
        x.sent;
        const N = R();
        b.alerts = x.sent === !0 ? this.#i(I, N, {
          lastPolledAt: N,
          lastSkippedAt: I.lastSkippedAt || "",
          issueCount: Number(x.issueCount) || 0,
          reason: x.reason || "alert_sent"
        }) : this.#t(I, N, x.reason || "no_alerts", {
          lastPolledAt: N,
          lastSuccessAt: I.lastSuccessAt || "",
          issueCount: Number(x.issueCount) || 0
        });
      } catch (x) {
        b.status = this.#a(b.status);
        const N = R();
        b.alerts = this.#r(I, N, x?.message || String(x), { lastPolledAt: N }), this.logger.error("Scheduled Alert Error: ", x);
      }
    } catch (E) {
      b.status = "failed", b.lastErrorAt = R(), b.lastError = E?.message || String(E), this.logger.error("Scheduled Task Error: ", E);
    } finally {
      y.active = !1, await _;
      const E = R();
      b.lastFinishedAt = E, b.status === "success" && (b.lastSuccessAt = E);
      const D = y.lostReason ? !1 : await m(this.service.releaseScheduledLease(o, f, { backend: h }), "release_lease", { backend: h }, !1);
      b.lock = this.#g(y, E, D), await m(this.service.patchOpsStatus(e, { scheduled: b }), "patch_final_status", {
        finishedAt: E,
        finalStatus: b.status,
        leaseLostReason: y.lostReason || ""
      }, null);
    }
  }
};
function lp(n = {}, e = {}) {
  const { CacheManager: a, persistCloudflareDnsRecordsForHost: t } = n;
  return {
    sanitizeHeaders(r) {
      if (!r || typeof r != "object" || Array.isArray(r)) return {};
      const o = {};
      for (const [s, i] of Object.entries(r)) {
        const c = String(s || "").trim();
        c && (vn.has(c.toLowerCase()) || (o[c] = String(i ?? "")));
      }
      return o;
    },
    normalizeTargets(r) {
      const o = String(r || "").split(",").map((i) => i.trim()).filter(Boolean);
      if (!o.length) return null;
      const s = [];
      for (const i of o) {
        const c = qo(i);
        if (!c) return null;
        s.push(c);
      }
      return s.length ? s.join(",") : null;
    },
    normalizeSingleTarget(r) {
      const o = e.normalizeTargets(r);
      if (!o) return null;
      const [s] = o.split(",").map((i) => i.trim()).filter(Boolean);
      return s || null;
    },
    normalizeTargetPort(r) {
      const o = String(r ?? "").trim();
      if (!o) return "";
      if (!/^\d{1,5}$/.test(o)) return null;
      const s = Number(o);
      return !Number.isInteger(s) || s < 1 || s > 65535 ? null : String(s);
    },
    buildTargetWithPort(r, o = "", s = "") {
      return qo(r, o, s);
    },
    buildDefaultLineName(r) {
      return `线路${Number(r) + 1}`;
    },
    normalizeLineId(r, o = 0) {
      return String(r || "").trim().toLowerCase().replace(/[^a-z0-9_-]+/g, "-").replace(/^-+|-+$/g, "") || `line-${Number(o) + 1}`;
    },
    parseLatencyMs(r) {
      if (r === "" || r === null || r === void 0) return null;
      const o = Number(r);
      return !Number.isFinite(o) || o < 0 ? null : Math.round(o);
    },
    normalizeIsoDatetime(r) {
      if (!r) return "";
      const o = new Date(r);
      return Number.isFinite(o.getTime()) ? o.toISOString() : "";
    },
    normalizeLines(r, o = "", s = "") {
      const i = String(e.normalizeTargets(o) || "").split(",").map((m) => m.trim()).filter(Boolean), c = e.normalizeTargetPort(s), l = c === null ? "" : c, u = Array.isArray(r) && r.length ? r : i.map((m, p) => ({
        id: `line-${p + 1}`,
        name: e.buildDefaultLineName(p),
        target: m
      }));
      if (!u.length) return [];
      const d = [], f = /* @__PURE__ */ new Set();
      return u.forEach((m, p) => {
        const g = m && typeof m == "object" && !Array.isArray(m) ? m : { target: m };
        let h = e.normalizeSingleTarget(e.buildTargetWithPort(g?.target, g?.port, l));
        if (!h && i[p] && (h = e.normalizeSingleTarget(e.buildTargetWithPort(i[p], g?.port, l))), !h) return;
        const y = e.normalizeLineId(g?.id, p);
        let S = y, _ = 2;
        for (; f.has(S); )
          S = `${y}-${_}`, _ += 1;
        f.add(S), d.push({
          id: S,
          name: String(g?.name || "").trim() || e.buildDefaultLineName(p),
          target: h
        });
      }), d;
    },
    resolveActiveLineId(r, o, s = [], i = "") {
      if (!Array.isArray(o) || !o.length) return "";
      const c = String(r || "").trim();
      if (c && o.some((l) => l.id === c)) return c;
      if (Array.isArray(s)) for (const l of s) {
        if (!l || typeof l != "object" || Array.isArray(l) || l.enabled !== !0) continue;
        const u = String(l.id || "").trim();
        if (u && o.some((m) => m.id === u)) return u;
        const d = e.normalizeSingleTarget(e.buildTargetWithPort(l.target, l.port, i));
        if (!d) continue;
        const f = o.find((m) => m.target === d);
        if (f) return f.id;
      }
      return o[0].id;
    },
    buildLegacyTargetFromLines(r = []) {
      return (Array.isArray(r) ? r : []).map((o) => String(o?.target || "").trim()).filter(Boolean).join(",");
    },
    getActiveNodeLine(r) {
      const o = Array.isArray(r?.lines) ? r.lines : [];
      if (!o.length) return null;
      const s = String(r?.activeLineId || "").trim();
      return o.find((i) => i.id === s) || o[0];
    },
    getOrderedNodeLines(r) {
      const o = Array.isArray(r?.lines) ? r.lines.slice() : [];
      if (o.length <= 1) return o;
      const s = e.getActiveNodeLine(r);
      return s ? [s, ...o.filter((i) => i.id !== s.id)] : o;
    },
    sortNodeLinesByLatency(r = []) {
      return (Array.isArray(r) ? r : []).map((o, s) => ({
        line: o,
        index: s
      })).sort((o, s) => {
        const i = Number.isFinite(o.line?.latencyMs) ? o.line.latencyMs : Number.POSITIVE_INFINITY, c = Number.isFinite(s.line?.latencyMs) ? s.line.latencyMs : Number.POSITIVE_INFINITY;
        return i !== c ? i - c : o.index - s.index;
      }).map((o) => o.line);
    },
    isPingCacheFresh(r, o) {
      const s = Number(r?.latencyMs), i = Date.parse(String(r?.latencyUpdatedAt || ""));
      if (!Number.isFinite(s) || !Number.isFinite(i)) return !1;
      const c = Math.max(0, Number(o) || 0) * 60 * 1e3;
      return c <= 0 ? !1 : k() - i < c;
    }
  };
}
function wn(n = "") {
  const e = String(n || "").trim().toLowerCase();
  return e.startsWith("emby ") ? "emby" : e.startsWith("mediabrowser ") ? "mediabrowser" : "";
}
function up(n = "", e = "") {
  const a = String(n || "").trim();
  if (!a) return "";
  const t = a.replace(/^[^\s]+\s+/i, "").trim();
  return t ? e === "emby" ? `Emby ${t}` : e === "mediabrowser" ? `MediaBrowser ${t}` : a : a;
}
function Oc(n = "") {
  const e = String(n || "").trim();
  if (!e) return {};
  const a = e.replace(/^[^\s]+\s+/i, "").trim();
  if (!a || !a.includes("=")) return {};
  const t = {}, r = /([A-Za-z][A-Za-z0-9_-]*)\s*=\s*(?:"([^"]*)"|([^,]+))/g;
  let o;
  for (; (o = r.exec(a)) !== null; ) {
    const s = String(o[1] || "").trim().toLowerCase(), i = String(o[2] !== void 0 ? o[2] : o[3] || "").trim();
    !s || !i || Object.prototype.hasOwnProperty.call(t, s) || (t[s] = i);
  }
  return t;
}
var vc = /* @__PURE__ */ new Set([
  "apikey",
  "accesstoken",
  "token",
  "authorization",
  "xembytoken",
  "xembyauthorization",
  "xmediabrowsertoken",
  "xmediabrowserauthorization"
]), Fc = /* @__PURE__ */ new Set([
  "deviceid",
  "xembydeviceid",
  "xmediabrowserdeviceid"
]);
function As(n, e) {
  const a = n instanceof URL ? n : null;
  if (!a || !(e instanceof Set)) return !1;
  for (const t of a.searchParams.keys()) if (e.has(Aa(t))) return !0;
  return !1;
}
function qe(n, e = "") {
  if (n instanceof Headers) return n.get(e) || "";
  const a = String(e || "").trim().toLowerCase();
  for (const [t, r] of yn(n))
    if (String(t || "").trim().toLowerCase() === a)
      return String(r ?? "");
  return "";
}
function dp(n = "") {
  const e = String(n ?? "").replace(/[\r\n]+/g, " ").trim();
  if (!e) return "";
  let a = "";
  for (const t of e) {
    const r = t.charCodeAt(0);
    if (r === 9 || r >= 32 && r <= 126 || r >= 160 && r <= 255) {
      a += t;
      continue;
    }
    a += encodeURIComponent(t);
  }
  return a;
}
function fp(n) {
  const e = new Headers();
  for (const [a, t] of yn(n)) {
    const r = String(a || "").trim();
    if (!r) continue;
    const o = String(t ?? "");
    try {
      e.set(r, o);
    } catch {
      const s = dp(o);
      if (!s) continue;
      try {
        e.set(r, s);
      } catch {
      }
    }
  }
  return e;
}
function vo(n) {
  const e = {
    token: "",
    deviceId: ""
  };
  for (const a of ["X-Emby-Token", "X-MediaBrowser-Token"]) {
    const t = qe(n, a).trim();
    if (t) {
      e.token = t;
      break;
    }
  }
  for (const a of [
    "Authorization",
    "X-Emby-Authorization",
    "X-MediaBrowser-Authorization"
  ]) {
    const t = qe(n, a).trim();
    if (!t) continue;
    const r = Oc(t);
    if (!e.token && r.token && (e.token = r.token), !e.deviceId && r.deviceid && (e.deviceId = r.deviceid), !e.token) {
      const o = /^Bearer\s+(.+)$/i.exec(t);
      o?.[1] && (e.token = o[1].trim());
    }
  }
  if (!e.deviceId) for (const a of ["X-Emby-Device-Id"]) {
    const t = qe(n, a).trim();
    if (t) {
      e.deviceId = t;
      break;
    }
  }
  return e;
}
function mp(n = "") {
  const e = String(n || "").trim();
  if (!e || /^Bearer\s+.+$/i.test(e)) return !0;
  const a = Oc(e);
  return !!String(a.token || "").trim();
}
function ya(n) {
  const e = vo(n), a = [], t = [];
  Oo(qe(n, "Cookie"), on) && t.push("cookie");
  for (const u of Rc) {
    const d = qe(n, u).trim();
    d && (mp(d) || a.push(u));
  }
  for (const [u, d] of yn(n)) {
    const f = String(u || "").trim().toLowerCase(), m = String(d || "").trim();
    !f || !m || Ac(f) && a.push(f);
  }
  const r = [...new Set(a)], o = [...new Set(t)], s = !!String(e.token || "").trim() || !!String(e.deviceId || "").trim(), i = r.length > 0, c = o.length > 0, l = !i && !c;
  return {
    canDirect: l,
    reason: l ? "" : "direct_transport_incompatible",
    headerAuthHeaders: r,
    cookieAuthHeaders: o,
    hasQueryAuth: s,
    hasHeaderAuth: i,
    hasCookieAuth: c,
    auth: e
  };
}
function Uc(n, e) {
  const a = n instanceof URL ? new URL(n.toString()) : new URL(String(n || "")), t = (e && typeof e == "object" && "auth" in e ? e : { auth: vo(e) }).auth || {};
  return t.token && !As(a, vc) && a.searchParams.set("api_key", t.token), t.deviceId && !As(a, Fc) && a.searchParams.set("DeviceId", t.deviceId), a;
}
function pp(n, e = "auto") {
  const a = er(e);
  if (a === "passthrough") return n;
  const t = n.get("Authorization")?.trim() || "", r = n.get("X-Emby-Authorization")?.trim() || "", o = n.get("X-MediaBrowser-Authorization")?.trim() || "", s = wn(t), i = wn(o), c = wn(r);
  let l = s ? t : i ? o : c ? r : "";
  if (!l) return n;
  const u = a === "emby" ? "emby" : a === "jellyfin" ? "mediabrowser" : s || i || c || "";
  return l = up(l, u), n.set("Authorization", l), u === "mediabrowser" ? (n.set("X-MediaBrowser-Authorization", l), n.delete("X-Emby-Authorization"), n) : (u === "emby" && (n.set("X-Emby-Authorization", l), n.delete("X-MediaBrowser-Authorization")), n);
}
function Cs(n, e = {}) {
  if (!(n instanceof Headers)) return n;
  const a = e.dropTokenHeaders !== !1;
  return [
    "Authorization",
    "X-Emby-Authorization",
    "X-MediaBrowser-Authorization"
  ].forEach((t) => n.delete(t)), a && [
    "X-Emby-Token",
    "X-MediaBrowser-Token",
    "X-Emby-Auth-Token",
    "X-MediaBrowser-Auth-Token"
  ].forEach((t) => n.delete(t)), n;
}
function gp() {
  const n = {};
  for (const e of ["direct", "proxy"]) {
    n[e] = {};
    for (const a of [
      "none",
      "query",
      "header",
      "cookie"
    ]) {
      n[e][a] = {};
      for (const t of [
        "none",
        "same_origin",
        "external"
      ]) n[e][a][t] = {
        deliveryMode: e,
        authCarrier: a,
        redirectScope: t,
        clientVisibleRedirect: e === "direct" && t !== "none",
        workerFollowRedirect: e === "proxy",
        reasonCode: e === "direct" ? t === "none" ? "entry_direct" : "client_redirect" : "worker_follow_redirect"
      };
    }
  }
  return Object.freeze(n);
}
var hp = gp();
function Ts(n = {}) {
  const e = n && typeof n == "object" ? n : null, a = String(n?.corsOrigins || ""), t = String(n?.ipBlacklist || ""), r = String(n?.geoAllowlist || ""), o = String(n?.geoBlocklist || ""), s = e ? oe.ProxyAccessRuleProfileCache.get(e) : null;
  if (s && s.corsOriginsRaw === a && s.ipBlacklistRaw === t && s.geoAllowlistRaw === r && s.geoBlocklistRaw === o) return s;
  const i = (u, d = !1) => {
    const f = [], m = /* @__PURE__ */ new Set();
    for (const p of u.split(",")) {
      const g = p.trim(), h = d ? g.toUpperCase() : g;
      !h || m.has(h) || (m.add(h), f.push(h));
    }
    return {
      values: f,
      valueSet: m
    };
  }, c = i(a), l = {
    corsOriginsRaw: a,
    ipBlacklistRaw: t,
    geoAllowlistRaw: r,
    geoBlocklistRaw: o,
    corsOrigins: c.values,
    corsOriginSet: c.valueSet,
    ipBlacklist: i(t).valueSet,
    geoAllowlist: i(r, !0).valueSet,
    geoBlocklist: i(o, !0).valueSet
  };
  return e && oe.ProxyAccessRuleProfileCache.set(e, l), l;
}
function yp(n = {}, e = {}) {
  const { CacheManager: a, persistCloudflareDnsRecordsForHost: t } = n;
  return {
    normalizeNode(r, o, s = {}) {
      const i = { ...o };
      let c = !1;
      const l = e.normalizeTargetPort(i.port), u = e.normalizeLines(i.lines, i.target, l || ""), d = e.resolveActiveLineId(i.activeLineId, u, Array.isArray(i.lines) ? i.lines : [], l || ""), f = e.buildLegacyTargetFromLines(u);
      JSON.stringify(u) !== JSON.stringify(Array.isArray(i.lines) ? i.lines : []) && (c = !0), String(i.activeLineId || "") !== d && (c = !0), String(i.target || "") !== f && (c = !0), i.lines = u, i.activeLineId = d, i.target = f, Object.prototype.hasOwnProperty.call(i, "port") && (delete i.port, c = !0), i.secret === void 0 && (i.secret = "", c = !0);
      const m = Ur(i.tags, i.tag), p = m[0] || "";
      JSON.stringify(m) !== JSON.stringify(Array.isArray(i.tags) ? i.tags : []) && (c = !0), String(i.tag || "") !== p && (c = !0), i.tags = m, i.tag = p;
      const g = [["server", "Record"].join(""), ["media", "Aggregation"].join("")];
      for (const w of Object.keys(i).filter((C) => g.some((T) => C.startsWith(T))))
        delete i[w], c = !0;
      i.remark === void 0 && (i.remark = "", c = !0), i.tagColor === void 0 && (i.tagColor = "", c = !0), i.remarkColor === void 0 && (i.remarkColor = "", c = !0), i.displayName === void 0 && (i.displayName = "", c = !0);
      const h = tr(i.entryMode);
      String(i.entryMode || "") !== h && (c = !0), i.entryMode = h, h === "host_prefix" && String(i.secret ?? "") !== "" && (i.secret = "", c = !0);
      const y = h === "host_prefix" ? Bt(i.hostPrefixCnameTarget) : "";
      String(i.hostPrefixCnameTarget || "") !== y && (c = !0), i.hostPrefixCnameTarget = y;
      const S = Dr(i.playbackInfoMode);
      String(i.playbackInfoMode || "") !== S && (c = !0), i.playbackInfoMode = S;
      const _ = er(i.mediaAuthMode);
      String(i.mediaAuthMode || "") !== _ && (c = !0), i.mediaAuthMode = _;
      const A = wr(i.realClientIpMode);
      String(i.realClientIpMode || "") !== A && (c = !0), i.realClientIpMode = A;
      const b = na(i.hedgeProbePath);
      String(i.hedgeProbePath || "") !== b && (c = !0), i.hedgeProbePath = b;
      const R = Fr(i);
      String(i.mainVideoStreamMode || "") !== R && (c = !0), i.mainVideoStreamMode = R;
      const E = Mr(i.routingDecisionMode);
      if (String(i.routingDecisionMode || "") !== E && (c = !0), i.routingDecisionMode = E, Object.prototype.hasOwnProperty.call(i, "wangpanDirectMode") && (delete i.wangpanDirectMode, c = !0), Object.prototype.hasOwnProperty.call(i, "wangpanMode") && (delete i.wangpanMode, c = !0), s && typeof s == "object" && "dropLegacyDirectRouting" in s && s.dropLegacyDirectRouting === !0) for (const w of [...dn, ...fn])
        Object.prototype.hasOwnProperty.call(i, w) && (delete i[w], c = !0);
      const D = e.sanitizeHeaders(i.headers);
      return JSON.stringify(D) !== JSON.stringify(i.headers || {}) && (c = !0), i.headers = D, delete i.videoThrottling, delete i.interceptMs, i.schemaVersion !== 6 && (i.schemaVersion = 6, c = !0), Object.prototype.hasOwnProperty.call(i, "createdAt") && (delete i.createdAt, c = !0), Object.prototype.hasOwnProperty.call(i, "updatedAt") && (delete i.updatedAt, c = !0), {
        data: i,
        changed: c
      };
    },
    buildComparableNodePayload(r = {}, o = {}) {
      if (!F(r)) return null;
      const s = { ...r };
      o.includeName !== !0 && delete s.name, delete s.createdAt, delete s.updatedAt;
      const i = (c) => {
        if (Array.isArray(c)) return c.map((l) => i(l));
        if (F(c)) {
          const l = {};
          for (const u of Object.keys(c).sort()) l[u] = i(c[u]);
          return l;
        }
        return c;
      };
      return i(s);
    },
    areNodePayloadsEquivalent(r = {}, o = {}, s = {}) {
      const i = e.buildComparableNodePayload(r, s), c = e.buildComparableNodePayload(o, s);
      return se(i) === se(c);
    },
    buildNodeRecord(r, o, s = {}) {
      let i = o?.headers !== void 0 ? o.headers : s.headers;
      if (typeof i == "string") try {
        i = JSON.parse(i);
      } catch {
        i = {};
      }
      const c = {};
      for (const h of ["proxyMode", "mode"]) {
        const y = o?.[h] !== void 0 ? o[h] : s[h];
        y !== void 0 && (c[h] = String(y || "").trim());
      }
      for (const h of [
        "direct",
        "sourceDirect",
        "directSource",
        "direct2xx"
      ]) o?.[h] !== void 0 ? c[h] = o[h] === !0 : s[h] !== void 0 && (c[h] = s[h] === !0);
      const l = Array.isArray(o?.lines) ? o.lines : o?.target !== void 0 ? [] : s.lines, u = o?.target !== void 0 ? o.target : s.target, d = o?.port !== void 0 ? o.port : s.port, f = e.normalizeLines(l, u, d);
      if (!f.length) return null;
      const m = e.resolveActiveLineId(o?.activeLineId !== void 0 ? o.activeLineId : s.activeLineId, f, Array.isArray(o?.lines) ? o.lines : s.lines, d), p = o?.mainVideoStreamMode !== void 0 ? o.mainVideoStreamMode : o?.wangpanDirectMode !== void 0 ? o.wangpanDirectMode : o?.wangpanMode, g = e.normalizeNode(r, {
        target: e.buildLegacyTargetFromLines(f),
        lines: f,
        activeLineId: m,
        ...c,
        entryMode: o?.entryMode !== void 0 ? tr(o.entryMode) : tr(s.entryMode),
        hostPrefixCnameTarget: o?.hostPrefixCnameTarget !== void 0 ? o.hostPrefixCnameTarget : s.hostPrefixCnameTarget,
        secret: o?.secret !== void 0 ? o.secret : s.secret || "",
        tag: o?.tag !== void 0 ? o.tag : s.tag || "",
        tags: o?.tags !== void 0 ? o.tags : o?.tag !== void 0 ? [o.tag, ...Ur(s.tags, s.tag).filter((h) => h.toLowerCase() !== String(s.tag || "").trim().toLowerCase())] : s.tags,
        remark: o?.remark !== void 0 ? o.remark : s.remark || "",
        tagColor: o?.tagColor !== void 0 ? String(o.tagColor || "").trim() : s.tagColor || "",
        remarkColor: o?.remarkColor !== void 0 ? String(o.remarkColor || "").trim() : s.remarkColor || "",
        displayName: o?.displayName !== void 0 ? String(o.displayName || "").trim() : s.displayName || "",
        playbackInfoMode: o?.playbackInfoMode !== void 0 ? Dr(o.playbackInfoMode) : Dr(s.playbackInfoMode),
        mediaAuthMode: o?.mediaAuthMode !== void 0 ? er(o.mediaAuthMode) : er(s.mediaAuthMode),
        realClientIpMode: o?.realClientIpMode !== void 0 ? wr(o.realClientIpMode) : wr(s.realClientIpMode),
        hedgeProbePath: o?.hedgeProbePath !== void 0 ? na(o.hedgeProbePath) : na(s.hedgeProbePath),
        routingDecisionMode: o?.routingDecisionMode !== void 0 ? Mr(o.routingDecisionMode) : Mr(s.routingDecisionMode),
        mainVideoStreamMode: p !== void 0 ? tn(p) : Fr(s),
        headers: e.sanitizeHeaders(i),
        schemaVersion: 6
      }).data;
      return e.normalizeNode(r, s || {}).data, g;
    },
    buildHostPrefixDnsRecordHost(r = "", o = "") {
      const s = String(r || "").trim().toLowerCase(), i = ee(o);
      return !i || !nn(s) ? "" : `${s}.${i}`;
    },
    buildHostPrefixDnsSyncPlan(r = "", o = null, s = "", i = null, c = "", l = {}) {
      const u = ee(c), d = o && Qe(o?.entryMode) ? e.buildHostPrefixDnsRecordHost(r, u) : "", f = i && Qe(i?.entryMode) ? e.buildHostPrefixDnsRecordHost(s, u) : "", m = d ? Ua(o, l.previousConfig || l.config || {}, u) : "", p = f ? Ua(i, l.nextConfig || l.config || {}, u) : "", g = [], h = [];
      return d && d !== f && g.push({
        type: "delete",
        host: d
      }), f && (l.forceUpsert === !0 || f !== d || p !== m) && g.push({
        type: "upsert",
        host: f,
        cnameTarget: p
      }), f && f !== d && h.push({
        type: "delete",
        host: f
      }), d && d !== f ? h.push({
        type: "upsert",
        host: d,
        cnameTarget: m
      }) : d && p !== m && h.push({
        type: "upsert",
        host: d,
        cnameTarget: m
      }), {
        hostRoot: u,
        previousDnsHost: d,
        nextDnsHost: f,
        previousCnameTarget: m,
        nextCnameTarget: p,
        steps: g,
        rollbackSteps: h,
        changed: g.length > 0
      };
    },
    buildPreparedNodeMutation(r = {}, o = {}, s = {}) {
      const i = String(s.nextName || r?.name || "").trim().toLowerCase();
      if (!i) return null;
      const c = String(s.previousName || r?.originalName || i).trim().toLowerCase() || i, l = e.buildNodeRecord(i, r, o);
      if (!l) return null;
      const u = F(o) && Object.keys(o).length ? e.normalizeNode(c, o || {}).data : null, d = c !== i, f = !d && !!u && e.areNodePayloadsEquivalent(u, l);
      return {
        previousName: c,
        previousNode: u,
        nextName: i,
        nextNode: l,
        isRename: d,
        nodeChanged: d || !f,
        isSemanticNoop: f,
        dnsPlan: null
      };
    },
    async upsertHostPrefixDnsRecord(r = "", o = {}) {
      const s = ee(r);
      if (!s) return null;
      const i = o.config || await Ae(o.env), c = La(i, o.env), l = Bt(o.cnameTarget) || ee(c.host);
      return await t({
        env: o.env,
        kv: o.kv,
        config: i,
        host: s,
        mode: "cname",
        desiredRecords: [{
          type: "CNAME",
          content: l,
          ttl: 1,
          proxied: !1
        }],
        requestHost: ee(o.requestHost || c.host),
        skipHistory: o.skipHistory === !0,
        includeAllRecords: !1
      });
    },
    async deleteHostPrefixDnsRecord(r = "", o = {}) {
      const s = ee(r);
      if (!s) return null;
      const i = La(o.config || await Ae(o.env), o.env), c = String(i.cfZoneId || "").trim(), l = String(i.cfApiToken || "").trim(), u = await To(c, l, { scope: "node.host_prefix_dns_delete.zone_lookup" }), d = String(u?.name || "").trim();
      if (d && !ca(s, d)) throw Te("INVALID_HOST", "当前子域不在 Cloudflare Zone 下", 400, {
        host: s,
        zoneName: d
      });
      const f = (await Pr(c, l, { nameExact: s })).filter((p) => ee(p?.name) === s && String(p?.type || "").trim().toUpperCase() === "CNAME");
      if (!f.length) return {
        ok: !0,
        deletedCount: 0,
        host: s
      };
      const m = cc(c, l, s, `https://api.cloudflare.com/client/v4/zones/${encodeURIComponent(c)}/dns_records`, f[0] || {
        name: s,
        ttl: 1,
        proxied: !1
      });
      for (const p of f) await m.deleteRecord(p);
      return {
        ok: !0,
        deletedCount: f.length,
        host: s
      };
    },
    async persistHostPrefixDnsSyncPlan(r = {}, o = {}) {
      const s = Array.isArray(r?.steps) ? r.steps : [];
      if (!s.length) return null;
      La(o.config || await Ae(o.env), o.env);
      for (const i of s) {
        if (String(i?.type || "").trim().toLowerCase() === "delete") {
          await e.deleteHostPrefixDnsRecord(i.host, o);
          continue;
        }
        String(i?.type || "").trim().toLowerCase() === "upsert" && await e.upsertHostPrefixDnsRecord(i.host, {
          ...o,
          cnameTarget: i.cnameTarget
        });
      }
      return {
        changed: !0,
        stepCount: s.length
      };
    },
    async applyPreparedNodeMutation(r = {}, o = {}) {
      const s = o.kv;
      if (!s || r?.nodeChanged !== !0) return !1;
      const i = String(r?.previousName || "").trim().toLowerCase(), c = String(r?.nextName || "").trim().toLowerCase();
      return r?.nextNode ? await s.put(`${e.PREFIX}${c}`, JSON.stringify(r.nextNode)) : c && await s.delete(`${e.PREFIX}${c}`), i && c && i !== c && await s.delete(`${e.PREFIX}${i}`), e.invalidateNodeCaches([i, c], {
        invalidateList: !0,
        kv: s
      }), !0;
    },
    async rollbackPreparedNodeMutation(r = {}, o = {}) {
      const s = o.kv;
      if (!s || r?.nodeChanged !== !0) return !1;
      const i = String(r?.previousName || "").trim().toLowerCase(), c = String(r?.nextName || "").trim().toLowerCase();
      return i && (r?.previousNode ? await s.put(`${e.PREFIX}${i}`, JSON.stringify(r.previousNode)) : await s.delete(`${e.PREFIX}${i}`)), c && c !== i && await s.delete(`${e.PREFIX}${c}`), e.invalidateNodeCaches([i, c], {
        invalidateList: !0,
        kv: s
      }), !0;
    },
    async rollbackPreparedNodeMutations(r = [], o = {}) {
      const s = o.kv;
      if (!s) return { rolledBackNodeCount: 0 };
      const i = (Array.isArray(r) ? r : []).filter(Boolean);
      if (!i.length) return { rolledBackNodeCount: 0 };
      const c = i.some((d) => d?.dnsPlan?.changed === !0) ? o.config || await Ae(o.env) : null;
      let l = 0;
      const u = [];
      for (let d = i.length - 1; d >= 0; d -= 1) {
        const f = i[d];
        if (f?.dnsPlan?.changed === !0) try {
          await e.persistHostPrefixDnsSyncPlan({ steps: f?.dnsPlan?.rollbackSteps || [] }, {
            ...o,
            config: c,
            skipHistory: !0
          });
        } catch (m) {
          u.push(`dns:${ie(m, "rollback_failed")}`);
        }
        if (f?.nodeChanged === !0) try {
          await e.rollbackPreparedNodeMutation(f, o), l += 1;
        } catch (m) {
          u.push(`node:${ie(m, "rollback_failed")}`);
        }
      }
      if (o.rebuildIndexes === !0) try {
        await e.rebuildNodeIndexesFromKv(s, {
          ctx: o.ctx,
          syncLegacyIndex: !0
        });
      } catch (d) {
        u.push(`rebuild_indexes:${ie(d, "rollback_failed")}`);
      }
      if (u.length > 0) throw new Error(u.join("; "));
      return { rolledBackNodeCount: l };
    },
    async applyPreparedNodeMutations(r = [], o = {}) {
      if (!o.kv) return { mutatedNodeCount: 0 };
      const s = (Array.isArray(r) ? r : []).filter(Boolean);
      if (!s.length) return { mutatedNodeCount: 0 };
      const i = s.some((m) => m?.dnsPlan?.changed === !0) ? await Ae(o.env) : null;
      let c = 0;
      const l = [];
      let u = !1, d = !0, f = "";
      try {
        for (const m of s)
          l.push(m), m?.nodeChanged === !0 && (await e.applyPreparedNodeMutation(m, o), c += 1), m?.dnsPlan?.changed === !0 && await e.persistHostPrefixDnsSyncPlan(m.dnsPlan, {
            ...o,
            config: i
          });
        return { mutatedNodeCount: c };
      } catch (m) {
        u = l.length > 0;
        try {
          await e.rollbackPreparedNodeMutations(l, {
            ...o,
            config: i,
            rebuildIndexes: !1
          });
        } catch (p) {
          d = !1, f = ie(p, "rollback_failed");
        }
        throw m && typeof m == "object" && (String(m.code || "").trim() || (m.code = "NODE_MUTATION_FAILED"), m.status = De(m.status, 500), m.details = {
          ...F(m.details) ? m.details : {},
          rollbackAttempted: u,
          rollbackSucceeded: d,
          rollbackError: f
        }), m;
      }
    }
  };
}
function Sp(n = {}, e = {}) {
  const { CacheManager: a, persistCloudflareDnsRecordsForHost: t } = n;
  return {
    async pingTarget(r, o, s = {}) {
      const i = new AbortController(), c = k(), l = setTimeout(() => i.abort(), o);
      try {
        const u = un(String(r || "").trim());
        if (!u) return 9999;
        const d = gc(u, Uu(s?.probePath, Jl));
        if (!d) return 9999;
        let f = await Oe(d.toString(), {
          method: "HEAD",
          signal: i.signal
        });
        if (f.status === 405 || f.status === 501) {
          try {
            f.body?.cancel?.();
          } catch {
          }
          f = await Oe(d.toString(), {
            method: "GET",
            signal: i.signal
          });
        }
        const m = f.ok;
        try {
          f.body?.cancel?.();
        } catch {
        }
        return m ? k() - c : 9999;
      } catch {
        return 9999;
      } finally {
        clearTimeout(l);
      }
    },
    async getNode(r, o, s) {
      r = String(r).toLowerCase();
      const i = e.getKV(o);
      if (!i) return null;
      const c = Se(i), l = Le(r, c), u = c.NodeCache.get(r);
      if (u && u.exp > Date.now()) {
        const f = await e.getNodesRevision(i), m = String(u?.nodesRevision || "").trim();
        if (Le(r, c) === l && (!m || !f || m === f))
          return qa(c.NodeCache, r), u.data;
        Le(r, c) === l && c.NodeCache.delete(r);
      }
      const d = Le(r, c);
      return await cn(c.SingleFlightTasks, et([
        "proxy_node",
        r,
        d
      ]), async () => {
        try {
          const f = await i.get(`${e.PREFIX}${r}`, { type: "json" });
          if (Le(r, c) !== d) return null;
          if (!f) {
            const y = await e.getNodesSummaryIndex(i, { ctx: s });
            if (Array.isArray(y)) if (y.some((S) => String(S?.name || "").toLowerCase().trim() === r)) {
              const S = e.rebuildNodeIndexesFromKv(i, { ctx: s });
              s ? s.waitUntil(S) : await S;
            } else {
              const S = await e.getNodesRevision(i);
              Le(r, c) === d && Ie(c.NodeCache, r, {
                data: null,
                exp: Date.now() + O.Defaults.NodeMissCacheTtlMs,
                nodesRevision: S
              }, O.Defaults.NodeCacheMax);
            }
            return null;
          }
          const { data: m, changed: p } = e.normalizeNode(r, f);
          if (p) {
            const y = i.put(`${e.PREFIX}${r}`, JSON.stringify(m));
            s ? s.waitUntil(y) : await y;
          }
          const g = e.upsertNodeSummaryEntry(r, m, {
            kv: i,
            ctx: s
          });
          let h = await e.getNodesRevision(i);
          return h ? s ? s.waitUntil(g) : await g : (await g, h = await e.getNodesRevision(i)), Le(r, c) !== d ? null : (Ie(c.NodeCache, r, {
            data: m,
            exp: Date.now() + O.Defaults.CacheTTL,
            nodesRevision: h
          }, O.Defaults.NodeCacheMax), m);
        } catch {
          return null;
        }
      });
    },
    async getNodeForRead(r, o) {
      r = String(r).toLowerCase();
      const s = e.getKV(o);
      if (!s) return null;
      const i = Se(s), c = Le(r, i), l = i.NodeCache.get(r);
      if (l?.data === null) i.NodeCache.delete(r);
      else if (l && l.exp > Date.now()) {
        const d = await e.getNodesRevision(s), f = String(l?.nodesRevision || "").trim();
        if (Le(r, i) === c && (!f || !d || f === d))
          return qa(i.NodeCache, r), l.data;
        Le(r, i) === c && i.NodeCache.delete(r);
      }
      const u = Le(r, i);
      try {
        const d = await s.get(`${e.PREFIX}${r}`, { type: "json" });
        if (Le(r, i) !== u || !d) return null;
        const f = e.normalizeNode(r, d).data, m = await e.getNodesRevision(s);
        return Le(r, i) !== u ? null : (Ie(i.NodeCache, r, {
          data: f,
          exp: Date.now() + O.Defaults.CacheTTL,
          nodesRevision: m
        }, O.Defaults.NodeCacheMax), f);
      } catch {
        return null;
      }
    },
    normalizeAdminActionRequest(r) {
      if (!r || typeof r != "object" || Array.isArray(r)) return null;
      const o = r.payload && typeof r.payload == "object" && !Array.isArray(r.payload) ? { ...r.payload } : null, s = String(r.action ?? o?.action ?? "").trim(), i = r.meta && typeof r.meta == "object" && !Array.isArray(r.meta) ? { ...r.meta } : {};
      return {
        action: s,
        data: o ? {
          ...o,
          action: s,
          meta: i
        } : {
          ...r,
          action: s,
          meta: i
        },
        meta: i
      };
    }
  };
}
function _p(n = {}, e = {}) {
  return {
    ...lp(n, e),
    ...yp(n, e),
    ...Sp(n, e)
  };
}
var Dn = "proxy_logs_fts";
function bp(n = {}) {
  const e = {
    buildResponse(a = {}) {
      return J(a);
    },
    buildRange(a, t) {
      return {
        startDate: new Date(a).toISOString(),
        endDate: new Date(t).toISOString()
      };
    },
    normalizeRequest(a = {}) {
      const { page: t = 1, pageSize: r = 50, filters: o = {} } = a, s = Math.max(1, parseInt(t, 10) || 1), i = Math.min(200, Math.max(1, parseInt(r, 10) || 50)), c = String(a?.paginationMode || "").trim().toLowerCase(), l = Li(a?.pageCursor), u = c !== "offset" && (s === 1 || !!l), d = (s - 1) * i, f = Date.now(), m = O.Defaults.LogQueryDefaultDays * 24 * 60 * 60 * 1e3, p = (S) => {
        if (!S) return null;
        const _ = new Date(String(S)).getTime();
        return Number.isFinite(_) ? _ : null;
      }, g = (S) => {
        if (!S) return null;
        const _ = (/* @__PURE__ */ new Date(String(S) + "T23:59:59.999")).getTime();
        return Number.isFinite(_) ? _ : null;
      };
      let h = p(o.startDate), y = g(o.endDate);
      return Number.isFinite(y) || (y = f), Number.isFinite(h) || (h = Math.max(0, y - m)), h > y && ([h, y] = [Math.max(0, y - m), y]), {
        filters: o,
        safePage: s,
        safePageSize: i,
        requestedPageCursor: l,
        useSeekPagination: u,
        offset: d,
        startTs: h,
        endTs: y
      };
    },
    resolveSearch(a = {}, t = {}, r = {}) {
      const o = String(a.searchMode || "").trim().toLowerCase(), s = o === "fts" || o === "like";
      let i = wi(a.searchMode || t.logSearchMode), c = "";
      if (i === "fts" && r.ftsReady !== !0) {
        if (s) return { errorResponse: B("LOG_FTS_NOT_READY", "FTS5 虚拟表尚未初始化，请先点击“初始化 FTS5”", 400, {
          searchMode: "fts",
          effectiveSearchMode: "fts",
          searchFallbackReason: ""
        }) };
        i = "like", c = "fts_not_ready";
      }
      return {
        effectiveSearchMode: i,
        searchFallbackReason: c
      };
    },
    buildBasePayload(a = {}, t = {}, r = {}) {
      return {
        page: a.safePage,
        pageSize: a.safePageSize,
        paginationMode: a.useSeekPagination ? "seek" : "offset",
        pageCursor: a.requestedPageCursor,
        revisions: { logsRevision: t.revision },
        range: e.buildRange(a.startTs, a.endTs),
        ...r
      };
    },
    buildDisabledResponse(a = {}, t = {}, r = "", o = "") {
      return e.buildResponse(e.buildBasePayload(a, t, {
        logs: [],
        total: 0,
        totalPages: 1,
        searchMode: r,
        effectiveSearchMode: r,
        searchFallbackReason: o,
        totalExact: !0,
        hasPrevPage: !1,
        hasNextPage: !1,
        nextCursor: null,
        disabled: !0
      }));
    },
    buildSuccessResponse(a = {}, t = {}, r = {}) {
      return e.buildResponse(e.buildBasePayload(a, t, {
        logs: r.logs,
        total: r.total,
        totalPages: r.totalPages,
        searchMode: r.searchMode,
        effectiveSearchMode: r.effectiveSearchMode,
        searchFallbackReason: r.searchFallbackReason,
        totalExact: a.useSeekPagination !== !0,
        hasPrevPage: r.hasPrevPage,
        hasNextPage: r.hasNextPage,
        nextCursor: r.nextCursor
      }));
    },
    buildDisplayState(a = {}) {
      return {
        displayClientIp: a.logDisplayClientIp !== !1,
        displayColo: a.logDisplayColo !== !1,
        displayUa: a.logDisplayUa !== !1
      };
    },
    buildSqlPlan(a = {}, t = {}, r = {}, o = "") {
      const { startTs: s, endTs: i } = t, c = e.buildDisplayState(r), l = td(a.requestGroup), u = rd(a.statusGroup), d = ["proxy_logs.timestamp >= ?", "proxy_logs.timestamp <= ?"], f = [s, i], m = (b, ...R) => {
        d.push(b), R.length > 0 && f.push(...R);
      }, p = "LOWER(proxy_logs.request_path)", g = String(a.keyword || "").trim();
      let h = !1;
      if (g) {
        const b = O.Defaults.LogKeywordMaxWindowDays * 24 * 60 * 60 * 1e3;
        if (i - s > b) return { errorResponse: B("LOG_QUERY_RANGE_TOO_WIDE", `关键词搜索必须限制在 ${O.Defaults.LogKeywordMaxWindowDays} 天内`, 400, { maxWindowDays: O.Defaults.LogKeywordMaxWindowDays }) };
        if (/^\d{3}$/.test(g)) m("proxy_logs.status_code = ?", Number(g));
        else if (zc(g) || Uo(g)) {
          const R = [], E = [];
          if (c.displayClientIp && (R.push("proxy_logs.client_ip = ?"), E.push(g)), c.displayColo) {
            const D = Uo(g) ? g.toUpperCase() : g;
            R.push("COALESCE(proxy_logs.inbound_colo, proxy_logs.inbound_ip, '') = ?"), E.push(D), R.push("COALESCE(proxy_logs.outbound_colo, proxy_logs.outbound_ip, '') = ?"), E.push(D);
          }
          m(R.length ? `(${R.join(" OR ")})` : "1 = 0", ...E);
        } else if (o === "fts")
          m(`${Dn} MATCH ?`, ld(g)), h = !0;
        else {
          const R = `%${Ta(g)}%`, E = [
            "proxy_logs.node_name LIKE ? ESCAPE '\\'",
            "proxy_logs.request_path LIKE ? ESCAPE '\\'",
            "proxy_logs.detail_json LIKE ? ESCAPE '\\'"
          ];
          f.push(R, R, R), c.displayClientIp && (E.push("proxy_logs.client_ip LIKE ? ESCAPE '\\'"), f.push(R)), c.displayUa && (E.push("proxy_logs.user_agent LIKE ? ESCAPE '\\'"), f.push(R)), E.push("proxy_logs.error_detail LIKE ? ESCAPE '\\'"), f.push(R), m(`(${E.join(" OR ")})`);
        }
      }
      a.category && m("proxy_logs.category = ?", String(a.category)), l === "playback_info" ? (m("proxy_logs.category = ?", "api"), m(`(${p} LIKE ? ESCAPE '\\' OR ${p} LIKE ? ESCAPE '\\')`, "%/playbackinfo%", "%/sessions/playing%")) : l === "image" ? m("proxy_logs.category = ?", "image") : l === "api" ? (m("proxy_logs.category = ?", "api"), m(`${p} NOT LIKE ? ESCAPE '\\'`, "%/playbackinfo%"), m(`${p} NOT LIKE ? ESCAPE '\\'`, "%/sessions/playing%"), m(`${p} NOT LIKE ? ESCAPE '\\'`, "%/users/authenticate%")) : l === "auth" && (m("proxy_logs.category = ?", "api"), m(`${p} LIKE ? ESCAPE '\\'`, "%/users/authenticate%")), u === "4xx" ? m("proxy_logs.status_code >= ? AND proxy_logs.status_code < ?", 400, 500) : u === "5xx" && m("proxy_logs.status_code >= ? AND proxy_logs.status_code < ?", 500, 600);
      const y = Jo(a.deliveryMode || "");
      if (y) {
        const b = "LOWER(COALESCE(CAST(json_extract(proxy_logs.detail_json, '$.deliveryMode') AS TEXT), ''))", R = y === "direct" ? ["Direct=entry_307", "Redirect=client_redirect"] : [
          "Redirect=proxied_follow",
          "Flow=managed",
          "Flow=passthrough"
        ];
        m(`(
          ${b} = ?
          OR (
            COALESCE(proxy_logs.detail_json, '') = ''
            AND (${R.map(() => "proxy_logs.error_detail LIKE ? ESCAPE '\\'").join(" OR ")})
          )
        )`, y, ...R.map((E) => `%${Ta(E)}%`));
      }
      const S = ad(a.protocolFailureReason || "");
      if (S && m(`(
          LOWER(COALESCE(CAST(json_extract(proxy_logs.detail_json, '$.protocolFailureReason') AS TEXT), '')) = ?
          OR (
            COALESCE(proxy_logs.detail_json, '') = ''
            AND proxy_logs.error_detail LIKE ? ESCAPE '\\'
          )
        )`, S, `%${Ta(S)}%`), a.playbackMode) {
        const b = String(a.playbackMode || "").trim();
        Jo(b) || m("proxy_logs.error_detail LIKE ? ESCAPE '\\'", `%${Ta(`Playback=${b}`)}%`);
      }
      const _ = h ? `FROM proxy_logs INNER JOIN ${Dn} ON ${Dn}.rowid = proxy_logs.id` : "FROM proxy_logs", A = `SELECT proxy_logs.*,
          ${c.displayClientIp ? "NULLIF(proxy_logs.client_ip, '') AS client_ip" : "NULL AS client_ip"},
          ${c.displayColo ? `COALESCE(proxy_logs.inbound_colo, proxy_logs.inbound_ip, proxy_logs.client_ip, '') AS inbound_colo,
        COALESCE(proxy_logs.outbound_colo, proxy_logs.outbound_ip, '') AS outbound_colo` : `'' AS inbound_colo,
        '' AS outbound_colo`},
          ${c.displayUa ? "proxy_logs.user_agent AS user_agent" : "NULL AS user_agent"},
          proxy_logs.detail_json AS detail_json`;
      return {
        searchMode: o,
        useFtsKeyword: h,
        whereClause: d,
        params: f,
        fromClause: _,
        selectClause: A,
        orderByClause: "ORDER BY proxy_logs.timestamp DESC, proxy_logs.id DESC"
      };
    },
    async executeSqlPlan(a, t = {}, r = {}) {
      const { safePage: o, safePageSize: s, requestedPageCursor: i, useSeekPagination: c, offset: l } = t, { whereClause: u = [], params: d = [], fromClause: f = "", selectClause: m = "", orderByClause: p = "", useFtsKeyword: g = !1, searchMode: h = "" } = r, y = "WHERE " + u.join(" AND ");
      let S = 0, _ = 1, A = o > 1, b = !1, R = null, E = [];
      try {
        if (c) {
          const D = u.slice(), w = d.slice();
          i && (D.push("(proxy_logs.timestamp < ? OR (proxy_logs.timestamp = ? AND proxy_logs.id < ?))"), w.push(i.timestamp, i.timestamp, i.id));
          const C = "WHERE " + D.join(" AND "), T = await a.prepare(`${m} ${f} ${C} ${p} LIMIT ?`).bind(...w, s + 1).all(), I = Array.isArray(T?.results) ? T.results : [];
          b = I.length > s, E = b ? I.slice(0, s) : I, R = b ? ud(E[E.length - 1]) : null, S = null, _ = b ? o + 1 : o;
        } else {
          S = (await a.prepare(`SELECT COUNT(*) as total ${f} ${y}`).bind(...d).first())?.total || 0;
          const D = await a.prepare(`${m} ${f} ${y} ${p} LIMIT ? OFFSET ?`).bind(...d, s, l).all();
          E = Array.isArray(D?.results) ? D.results : [], _ = Math.ceil(S / s) || 1, A = o > 1, b = o < _;
        }
      } catch (D) {
        const w = String(D?.message || D || "");
        if (g && /no such table:\s*proxy_logs_fts/i.test(w)) return { errorResponse: B("LOG_FTS_NOT_READY", "FTS5 虚拟表尚未初始化，请先点击“初始化 FTS5”", 400, { searchMode: h }) };
        if (g && /fts5/i.test(w)) return { errorResponse: B("LOG_FTS_QUERY_INVALID", "FTS 查询语法无效，请检查引号、布尔表达式或前缀写法", 400, { detail: w }) };
        throw D;
      }
      return {
        logs: E,
        total: S,
        totalPages: _,
        hasPrevPage: A,
        hasNextPage: b,
        nextCursor: R,
        searchMode: h
      };
    }
  };
  return e;
}
var Rp = "sys_status";
function Ep(n = {}) {
  const { logRepository: e } = n, a = {
    error(t, r, o = null) {
      Me(t, r, o, "error");
    },
    scheduleFlush(t, r) {
      const o = e.getDB(t), s = Ht.get(o);
      if (!o || !r || s.LogFlushPending) return null;
      s.LogFlushPending = !0;
      const i = a.flush(t).finally(() => {
        s.LogFlushTask === i && (s.LogFlushTask = null), s.LogFlushPending = !1, s.LogLastFlushAt = k(), s.LogQueue.length > 0 && a.scheduleFlush(t, r);
      });
      return s.LogFlushTask = i, r.waitUntil(i), i;
    },
    record(t, r, o) {
      const s = e.getDB(t);
      if (!s || !r) return;
      const i = Ht.get(s);
      if (o.requestMethod === "OPTIONS") return;
      const c = F(o.runtimeConfig) ? o.runtimeConfig : jo(t) || {};
      if (i.runtimeConfig = c, c.logEnabled === !1) {
        i.LogQueue.length > 0 && (i.LogQueue.length = 0), i.LogDedupe.clear();
        return;
      }
      const l = Number(o.statusCode) || 0, u = Di(c.logWriteMode);
      if (u === "error" && (l < 400 || l >= 600)) return;
      const d = Ci(o.requestPath, o.category);
      if (d === "image_poster" && c.logWriteImagePoster !== !0 || d === "media_metadata" && c.logWriteMediaMetadata !== !0) return;
      const f = c.logWriteClientIp !== !1, m = c.logWriteColo !== !1, p = c.logWriteUa !== !1, g = (P, U) => String(P || "").slice(0, U), h = g(o.inboundColo || o.inboundIp || o.clientIp || "unknown", 32), y = g(o.outboundColo || o.outboundIp || "", 32), S = f ? g(o.clientIp || "unknown", 128) : "", _ = g(o.nodeName || "unknown", 128) || "unknown", A = g(o.requestPath || "/", 2048) || "/", b = k(), R = Math.max(0, Number(i.LogClearEpochMs) || 0), E = b <= R ? R + 1 : b;
      let D = 0;
      if (o.requestMethod === "HEAD" ? D = 3e5 : (o.category === "segment" || o.category === "prewarm") && (D = 3e4), D > 0) {
        const P = [
          _,
          o.requestMethod || "GET",
          l,
          A,
          S,
          y
        ].join("|"), U = i.LogDedupe.get(P);
        if (U && b - U < D) return;
        if (i.LogDedupe.set(P, b), i.LogDedupe.size > O.Defaults.LogDedupeMax) {
          for (const [K, G] of i.LogDedupe)
            if (i.LogDedupe.has(K) && ((b - G > D || i.LogDedupe.size > O.Defaults.LogDedupeTrimTarget) && i.LogDedupe.delete(K), i.LogDedupe.size <= O.Defaults.LogDedupeTrimTarget))
              break;
        }
      }
      if (i.LogQueue.push({
        timestamp: E,
        nodeName: _,
        requestPath: A,
        requestMethod: o.requestMethod || "GET",
        statusCode: l,
        responseTime: Number(o.responseTime) || 0,
        clientIp: S,
        inboundColo: m ? h : null,
        outboundColo: m ? y : null,
        userAgent: p && g(o.userAgent, 512) || null,
        referer: g(o.referer, 1024) || null,
        category: o.category || "api",
        errorDetail: g(o.errorDetail, 2048) || null,
        detailJson: o.detailJson ? kc(o.detailJson) : null,
        createdAt: new Date(E).toISOString()
      }), i.LogQueue.length > O.Defaults.LogQueueMax) {
        const P = Math.min(O.Defaults.LogQueueOverflowDropCount, i.LogQueue.length);
        i.LogQueue.splice(0, P), e.patchOpsStatus(t, { log: {
          lastOverflowAt: (/* @__PURE__ */ new Date()).toISOString(),
          lastOverflowDropCount: P,
          queueLengthAfterDrop: i.LogQueue.length
        } }, r), console.error(`Log queue overflow, dropping ${P} logs to preserve isolate headroom.`);
      }
      i.LogLastFlushAt || (i.LogLastFlushAt = b);
      const w = Number(c.logWriteDelayMinutes), C = Number(c.logFlushCountThreshold), T = Math.max(0, Number.isFinite(w) ? w * 6e4 : O.Defaults.LogFlushDelayMinutes * 6e4), I = Math.max(1, Number.isFinite(C) ? Math.floor(C) : O.Defaults.LogFlushCountThreshold);
      (u === "error" || i.LogQueue.length >= I || T === 0 || b - i.LogLastFlushAt >= T) && a.scheduleFlush(t, r);
    },
    async flush(t) {
      const r = e.getDB(t), o = Ht.get(r);
      if (!r || o.LogQueue.length === 0) return;
      const s = F(o.runtimeConfig) ? o.runtimeConfig : jo(t) || {}, i = ke(s.scheduleUtcOffsetMinutes);
      if (s.logEnabled === !1) {
        o.LogQueue.length = 0, o.LogDedupe.clear();
        return;
      }
      await e.ensureSysStatusTable(r);
      const c = await e.resolveLogsReadiness({
        db: r,
        kv: e.getKV(t)
      });
      if (c.schemaReady !== !0) {
        const R = o.LogQueue.length;
        o.LogQueue.length = 0, o.LogDedupe.clear(), await e.patchOpsStatus(t, { log: {
          schemaReady: !1,
          ftsReady: c.ftsReady === !0,
          statsReady: c.statsReady === !0,
          lastFlushAt: (/* @__PURE__ */ new Date()).toISOString(),
          lastFlushStatus: "schema_not_ready",
          lastFlushError: "proxy_logs schema not initialized",
          lastFlushErrorAt: (/* @__PURE__ */ new Date()).toISOString(),
          lastFlushRetryCount: 0,
          lastDroppedBatchSize: R,
          lastFlushWrittenBeforeError: 0,
          queueLengthAfterFlush: 0
        } });
        return;
      }
      const l = Number(s.logBatchChunkSize), u = Number(s.logBatchRetryCount), d = Number(s.logBatchRetryBackoffMs), f = de(l, O.Defaults.LogBatchChunkSize, 1, 100), m = de(u, O.Defaults.LogBatchRetryCount, 0, 5), p = de(d, O.Defaults.LogBatchRetryBackoffMs, 0, 5e3), g = e.getOpsStatusDbScope("log");
      let h = 0, y = 0, S = 0, _ = 0;
      const A = /* @__PURE__ */ new Map(), b = (R = []) => {
        const E = e.summarizeStatsHourlyEntries(R, { utcOffsetMinutes: i });
        for (const D of E) {
          const w = `${D.bucketDate}:${D.bucketHour}`, C = A.get(w) || {
            bucketDate: D.bucketDate,
            bucketHour: D.bucketHour,
            requestCount: 0,
            playCount: 0,
            playbackInfoCount: 0
          };
          C.requestCount += Math.max(0, Number(D.requestCount) || 0), C.playCount += Math.max(0, Number(D.playCount) || 0), C.playbackInfoCount += Math.max(0, Number(D.playbackInfoCount) || 0), A.set(w, C);
        }
      };
      try {
        const R = Math.max(o.LogClearEpochMs || 0, await e.getLogClearEpochMs(t));
        for (; o.LogQueue.length > 0; ) {
          const D = o.LogQueue.splice(0, f).filter((T) => (Number(T?.timestamp) || 0) > R);
          if (!D.length) continue;
          S = D.length, _ = 0;
          const w = D.map((T) => r.prepare(`INSERT INTO proxy_logs (timestamp, node_name, request_path, request_method, status_code, response_time, client_ip, inbound_colo, outbound_colo, user_agent, referer, category, error_detail, detail_json, created_at)
            SELECT ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?
            WHERE ? > COALESCE((
              SELECT CAST(json_extract(payload, '$.clearEpochMs') AS INTEGER)
              FROM ${Rp}
              WHERE scope = ?
              LIMIT 1
            ), 0)`).bind(T.timestamp, T.nodeName, T.requestPath, T.requestMethod, T.statusCode, T.responseTime, T.clientIp, T.inboundColo, T.outboundColo, T.userAgent, T.referer, T.category, T.errorDetail, T.detailJson, T.createdAt, T.timestamp, g));
          let C = 0;
          for (; ; ) try {
            await r.batch(w);
            break;
          } catch (T) {
            if (C >= m) throw T;
            C += 1, y += 1, p > 0 && await so(p * C);
          }
          c.statsReady === !0 && b(D), h += D.length, _ += D.length;
        }
        if (c.statsReady === !0 && A.size > 0) try {
          await e.upsertStatsHourlyBuckets(r, [...A.values()], { useBatch: !0 });
        } catch (D) {
          console.warn("upsertStatsHourlyBuckets failed", D);
        }
        const E = {
          schemaReady: !0,
          ftsReady: c.ftsReady === !0,
          statsReady: c.statsReady === !0,
          statsUtcOffsetMinutes: i,
          lastFlushAt: (/* @__PURE__ */ new Date()).toISOString(),
          lastFlushCount: h,
          lastFlushStatus: "success",
          lastFlushRetryCount: y,
          queueLengthAfterFlush: o.LogQueue.length,
          lastFlushError: null,
          lastFlushErrorAt: null,
          lastDroppedBatchSize: 0,
          lastFlushWrittenBeforeError: 0
        };
        h > 0 ? await e.bumpLogsRevision(t, E) : await e.patchOpsStatus(t, { log: E });
      } catch (R) {
        await e.patchOpsStatus(t, { log: {
          schemaReady: c.schemaReady === !0,
          ftsReady: c.ftsReady === !0,
          statsReady: c.statsReady === !0,
          statsUtcOffsetMinutes: i,
          lastFlushErrorAt: (/* @__PURE__ */ new Date()).toISOString(),
          lastFlushStatus: "failed",
          lastFlushError: R?.message || String(R),
          lastFlushRetryCount: y,
          lastDroppedBatchSize: Math.max(0, S - _),
          lastFlushWrittenBeforeError: h,
          queueLengthAfterFlush: o.LogQueue.length
        } }), console.log("Log flush failed, dropping batch.", R);
      }
    }
  };
  return a;
}
var Nn = "sys_status", Xt = "sys_locks", Qr = "scheduled", ws = Object.freeze({
  log: "ops_status:log",
  scheduled: "ops_status:scheduled",
  dnsIpPool: "ops_status:dns_ip_pool"
});
function Ap(n = {}) {
  const { bindingPort: e, schemaReadinessPort: a, statusPersistence: t } = n, r = {
    async getOpsStatusPayloadFromDb(o, s) {
      if (!o || !s) return null;
      const i = t.getOpsStatusPayloadCache(o), c = i?.get(String(s));
      if (c && Number(c.expiresAt) > k()) return c.payload;
      if (c && i.delete(String(s)), !await t.ensureSysStatusTable(o)) return null;
      try {
        const l = await o.prepare(`SELECT payload FROM ${Nn} WHERE scope = ? LIMIT 1`).bind(s).first(), u = l?.payload ? typeof l.payload == "string" ? JSON.parse(l.payload) : l.payload : null;
        return t.cacheOpsStatusPayload(o, s, u), u;
      } catch {
        return i?.delete(String(s)), null;
      }
    },
    async getOpsStatusPayloadFromDbStrict(o, s) {
      if (!o || !s) throw new Error("D1 status scope is not configured");
      if (!await t.ensureSysStatusTable(o)) {
        const c = /* @__PURE__ */ new Error("D1 sys_status table is unavailable");
        throw c.code = "D1_COMPATIBILITY_REQUIRED", c.status = 409, c;
      }
      const i = await o.prepare(`SELECT payload FROM ${Nn} WHERE scope = ? LIMIT 1`).bind(s).first();
      return i?.payload ? typeof i.payload == "string" ? JSON.parse(i.payload) : i.payload : null;
    },
    async putOpsStatusPayloadToDb(o, s, i, c) {
      return !o || !s || !i || typeof i != "object" || !await t.ensureSysStatusTable(o) ? !1 : (await o.prepare(`INSERT INTO ${Nn} (scope, payload, updated_at) VALUES (?, ?, ?)
        ON CONFLICT(scope) DO UPDATE SET payload = excluded.payload, updated_at = excluded.updated_at`).bind(s, JSON.stringify(i), Number(c) || k()).run(), t.cacheOpsStatusPayload(o, s, i), !0);
    },
    getOpsStatusSectionEntries() {
      return Object.entries(ws);
    },
    async getOpsStatusRootFromStores(o) {
      const s = o?.db || null;
      if (!s) return {};
      const i = await r.getOpsStatusPayloadFromDb(s, t.getOpsStatusDbScope()), c = i && typeof i == "object" ? i : {}, l = t.getOpsStatusShadowPatch(s);
      return Ge(c, l && typeof l == "object" ? l : {});
    },
    async getOpsStatusRoot(o) {
      return r.getOpsStatusRootFromStores(t.resolveOpsStatusStores(o));
    },
    async getOpsStatusSectionFromStores(o, s) {
      const i = o?.db || null;
      if (!s) return {};
      if (!ws[s]) return {};
      const c = async () => {
        if (!i) return null;
        const f = await r.getOpsStatusPayloadFromDb(i, t.getOpsStatusDbScope(s));
        return f && typeof f == "object" ? f : null;
      }, [l, u] = await Promise.all([r.getOpsStatusRootFromStores(o), c()]), d = l && typeof l[s] == "object" ? l[s] : {};
      return Ge(u && typeof u == "object" ? u : {}, d);
    },
    async getOpsStatusSection(o, s) {
      return r.getOpsStatusSectionFromStores(t.resolveOpsStatusStores(o), s);
    },
    async getOpsStatusFromStores(o) {
      const s = o?.db || null;
      if (!s) return {};
      const i = await r.getOpsStatusRootFromStores(o), c = i && typeof i == "object" ? { ...i } : {};
      let l = typeof c.updatedAt == "string" ? c.updatedAt : "";
      const u = await Promise.all(r.getOpsStatusSectionEntries().map(async ([d]) => {
        const f = await r.getOpsStatusPayloadFromDb(s, t.getOpsStatusDbScope(d)), m = i && typeof i[d] == "object" ? i[d] : {};
        return [d, Ge(f && typeof f == "object" ? f : {}, m)];
      }));
      for (const [d, f] of u)
        !f || typeof f != "object" || Object.keys(f).length && (c[d] = Ge(c[d], f), typeof f.updatedAt == "string" && f.updatedAt > l && (l = f.updatedAt));
      return l && (c.updatedAt = l), c;
    },
    async getOpsStatus(o) {
      return r.getOpsStatusFromStores(t.resolveOpsStatusStores(o));
    },
    getLogClearEpochMsFromStatus(o) {
      const s = Number(o?.clearEpochMs);
      return Number.isFinite(s) && s > 0 ? Math.floor(s) : 0;
    },
    async getLogClearEpochMs(o) {
      const s = await r.getOpsStatusSection(o, "log"), i = r.getLogClearEpochMsFromStatus(s), c = Ht.get(t.resolveOpsStatusStores(o).db);
      return i > c.LogClearEpochMs && (c.LogClearEpochMs = i), i;
    },
    async patchOpsStatus(o, s, i = null) {
      const c = t.resolveOpsStatusStores(o);
      if (!c.db) return {};
      const l = s && typeof s == "object" ? s : {}, u = Object.keys(l);
      if (!u.length) return await r.getOpsStatusFromStores(c);
      const d = t.buildOpsStatusRootPatch(l);
      if (!Object.keys(d).length) return await r.getOpsStatusFromStores(c);
      const f = t.getOpsStatusShadowState(c.db);
      f && (f.pendingPatch = Ge(f.pendingPatch && typeof f.pendingPatch == "object" ? f.pendingPatch : {}, d));
      const m = async () => await t.flushOpsStatusShadow(c, { patchKeys: u }), p = Promise.resolve(Xe.OpsStatusWriteChain).catch((g) => {
        Me("ops_status.write_chain.previous_failure", g, { patchKeys: u });
      }).then(m);
      return Xe.OpsStatusWriteChain = p.catch((g) => {
        Me("ops_status.write_chain.current_failure", g, { patchKeys: u });
      }), i ? i.waitUntil(p) : await p, p;
    },
    resolveScheduledLeaseStores(o) {
      return o && typeof o == "object" && !Array.isArray(o) && ("db" in o || "kv" in o) ? {
        db: o.db || null,
        kv: o.kv || null
      } : o && typeof o.prepare == "function" ? {
        db: o,
        kv: null
      } : o && typeof o.get == "function" ? {
        db: null,
        kv: o
      } : {
        db: e.getDB(o),
        kv: e.getKV(o)
      };
    },
    async ensureScheduledLeaseTable(o) {
      if (!o || typeof o.prepare != "function") return !1;
      if (a.isD1SchemaReadyCached(o, "scheduledLeaseTable")) return !0;
      let s = Z.ScheduledLeaseDbReady.get(o);
      s || (s = (async () => {
        try {
          return await o.prepare(`CREATE TABLE IF NOT EXISTS ${Xt} (scope TEXT PRIMARY KEY, token TEXT NOT NULL, owner TEXT NOT NULL, acquired_at INTEGER NOT NULL, renewed_at INTEGER, expires_at INTEGER NOT NULL)`).run(), await o.prepare(`CREATE INDEX IF NOT EXISTS idx_sys_locks_expires_at ON ${Xt} (expires_at DESC)`).run(), a.markD1SchemaReady(o, "scheduledLeaseTable"), !0;
        } catch (i) {
          return console.warn("scheduled lease table init failed", i), !1;
        }
      })(), Z.ScheduledLeaseDbReady.set(o, s));
      try {
        return await s;
      } finally {
        Z.ScheduledLeaseDbReady.get(o) === s && Z.ScheduledLeaseDbReady.delete(o);
      }
    },
    normalizeScheduledLeaseLock(o, s = "") {
      if (!o || typeof o != "object") return null;
      const i = String(o.token || "").trim();
      if (!i) return null;
      const c = String(o.owner || "scheduled").trim() || "scheduled", l = Number(o.expiresAt ?? o.expires_at ?? 0), u = Number(o.acquiredAtMs ?? o.acquired_at), d = Number(o.renewedAtMs ?? o.renewed_at);
      return {
        token: i,
        owner: c,
        acquiredAt: typeof o.acquiredAt == "string" ? o.acquiredAt : Number.isFinite(u) && u > 0 ? new Date(u).toISOString() : "",
        renewedAt: typeof o.renewedAt == "string" ? o.renewedAt : Number.isFinite(d) && d > 0 ? new Date(d).toISOString() : "",
        expiresAt: Number.isFinite(l) ? l : 0,
        backend: s || String(o.backend || "").trim() || ""
      };
    },
    async getScheduledLeaseLockFromDb(o, s = Qr) {
      if (!o || !await r.ensureScheduledLeaseTable(o)) return null;
      try {
        const i = await o.prepare(`SELECT token, owner, acquired_at, renewed_at, expires_at FROM ${Xt} WHERE scope = ? LIMIT 1`).bind(String(s || Qr)).first();
        return r.normalizeScheduledLeaseLock(i, "d1");
      } catch {
        return null;
      }
    },
    async tryAcquireScheduledLeaseWithDb(o, s = {}) {
      if (!o) return {
        acquired: !1,
        reason: "db_unavailable",
        backend: "d1"
      };
      if (!await r.ensureScheduledLeaseTable(o)) return {
        acquired: !1,
        reason: "db_init_failed",
        backend: "d1"
      };
      const i = k(), c = Math.max(O.Defaults.ScheduledLeaseMinMs, Number(s.leaseMs) || O.Defaults.ScheduledLeaseMs), l = String(s.token || `${i}-${Math.random().toString(36).slice(2, 10)}`), u = String(s.owner || "scheduled"), d = String(s.scope || Qr), f = i + c;
      try {
        await o.prepare(`INSERT INTO ${Xt} (scope, token, owner, acquired_at, renewed_at, expires_at)
          VALUES (?, ?, ?, ?, NULL, ?)
          ON CONFLICT(scope) DO UPDATE SET
            token = excluded.token,
            owner = excluded.owner,
            acquired_at = excluded.acquired_at,
            renewed_at = NULL,
            expires_at = excluded.expires_at
          WHERE ${Xt}.expires_at <= ?`).bind(d, l, u, i, f, i).run();
        const m = await r.getScheduledLeaseLockFromDb(o, d);
        return m && m.token === l ? {
          acquired: !0,
          leaseMs: c,
          backend: "d1",
          lock: m
        } : m && Number(m.expiresAt) > i ? {
          acquired: !1,
          reason: "lease_held",
          backend: "d1",
          lock: m
        } : {
          acquired: !1,
          reason: "lease_contended",
          backend: "d1",
          lock: m
        };
      } catch (m) {
        return console.warn("scheduled lease acquire failed", m), {
          acquired: !1,
          reason: "db_unavailable",
          backend: "d1"
        };
      }
    },
    async tryAcquireScheduledLease(o, s = {}) {
      const i = r.resolveScheduledLeaseStores(o);
      return i.db ? await r.tryAcquireScheduledLeaseWithDb(i.db, s) : {
        acquired: !1,
        reason: "db_not_configured",
        backend: "d1"
      };
    },
    async renewScheduledLeaseWithDb(o, s, i, c = {}) {
      if (!o || !s || !await r.ensureScheduledLeaseTable(o)) return null;
      const l = k(), u = Math.max(O.Defaults.ScheduledLeaseMinMs, Number(i) || O.Defaults.ScheduledLeaseMs), d = String(c.scope || Qr);
      try {
        await o.prepare(`UPDATE ${Xt}
          SET owner = ?, renewed_at = ?, expires_at = ?
          WHERE scope = ? AND token = ?`).bind(String(c.owner || "scheduled"), l, l + u, d, String(s)).run();
        const f = await r.getScheduledLeaseLockFromDb(o, d);
        return f && f.token === String(s) ? f : null;
      } catch {
        return null;
      }
    },
    async renewScheduledLease(o, s, i, c = {}) {
      const l = r.resolveScheduledLeaseStores(o);
      return l.db ? await r.renewScheduledLeaseWithDb(l.db, s, i, c) : null;
    },
    async releaseScheduledLeaseWithDb(o, s, i = {}) {
      if (!o || !s || !await r.ensureScheduledLeaseTable(o)) return !1;
      const c = String(i.scope || Qr);
      try {
        return await o.prepare(`DELETE FROM ${Xt} WHERE scope = ? AND token = ?`).bind(c, String(s)).run(), !0;
      } catch {
        return !1;
      }
    },
    async releaseScheduledLease(o, s, i = {}) {
      const c = r.resolveScheduledLeaseStores(o);
      return c.db ? await r.releaseScheduledLeaseWithDb(c.db, s, i) : !1;
    }
  };
  return r;
}
function sr(n, e = "") {
  const a = String(n || "request_aborted").trim() || "request_aborted", t = new Error(e ? `${a}_${e}` : a);
  return a === "client_aborted" ? t.code = "CLIENT_ABORTED" : a === "downstream_cancelled" ? t.code = "DOWNSTREAM_CANCELLED" : a === "stream_idle_timeout" ? t.code = "STREAM_IDLE_TIMEOUT" : t.code = "REQUEST_ABORTED", t;
}
function Hc(n) {
  const e = new AbortController();
  let a = "", t = null, r = null, o = null;
  const s = /* @__PURE__ */ new Set(), i = (l) => {
    if (s.size)
      for (const u of [...s]) try {
        u(l);
      } catch {
      }
  }, c = (l = "request_aborted") => {
    const u = String(l || "request_aborted").trim() || "request_aborted";
    if (a || (a = u), r && !r.signal.aborted) try {
      r.abort(a);
    } catch {
    }
    if (!e.signal.aborted) try {
      e.abort(a);
    } catch {
    }
    i(a);
  };
  if (n && typeof n.addEventListener == "function") {
    const l = () => c("client_aborted");
    n.aborted ? l() : (n.addEventListener("abort", l, { once: !0 }), t = () => n.removeEventListener("abort", l));
  }
  return {
    signal: e.signal,
    abort: c,
    isAborted() {
      return e.signal.aborted === !0 || !!a;
    },
    getAbortReason() {
      return a;
    },
    onAbort(l) {
      if (typeof l != "function") return () => {
      };
      if (a || e.signal.aborted) {
        try {
          l(a || "request_aborted");
        } catch {
        }
        return () => {
        };
      }
      return s.add(l), () => s.delete(l);
    },
    setActiveFetchController(l) {
      if (o && (o(), o = null), r = l || null, !l) return () => {
      };
      const u = () => {
        try {
          l.abort(a || "request_aborted");
        } catch {
        }
      };
      return a || e.signal.aborted ? u() : e.signal.addEventListener("abort", u, { once: !0 }), o = () => {
        e.signal.removeEventListener("abort", u), r === l && (r = null);
      }, () => {
        if (!o) return;
        const d = o;
        o = null, d();
      };
    },
    dispose() {
      if (t && (t(), t = null), o) {
        const l = o;
        o = null, l();
      } else r = null;
      s.clear();
    }
  };
}
function Cp(n = []) {
  const e = new AbortController(), a = [], t = (r = "linked_abort") => {
    if (!e.signal.aborted)
      try {
        e.abort(r);
      } catch {
      }
  };
  for (const r of Array.isArray(n) ? n : [n]) {
    if (!r || typeof r.addEventListener != "function") continue;
    const o = () => t(r.reason || "linked_abort");
    if (r.aborted) {
      o();
      continue;
    }
    r.addEventListener("abort", o, { once: !0 }), a.push(() => r.removeEventListener("abort", o));
  }
  return {
    signal: e.signal,
    abort(r = "linked_abort") {
      t(r);
    },
    dispose() {
      for (const r of a.splice(0)) try {
        r();
      } catch {
      }
    }
  };
}
async function Tp(n, e, a = null) {
  return await new Promise((t, r) => {
    let o = !1, s = null, i = () => {
    };
    const c = (u) => {
      if (!o) {
        o = !0, s !== null && clearTimeout(s);
        try {
          i();
        } catch {
        }
        t(u);
      }
    }, l = (u) => {
      if (!o) {
        o = !0, s !== null && clearTimeout(s);
        try {
          i();
        } catch {
        }
        r(u);
      }
    };
    a?.onAbort && (i = a.onAbort((u) => l(sr(u)))), Number(e) > 0 && (s = setTimeout(() => c({
      timedOut: !0,
      value: null
    }), Math.max(0, Number(e) || 0))), Promise.resolve(n).then((u) => c({
      timedOut: !1,
      value: u
    }), l);
  });
}
async function wp(n, e = null) {
  const a = Math.max(0, Number(n) || 0);
  if (!(a <= 0))
    return await new Promise((t, r) => {
      let o = !1, s = () => {
      };
      const i = setTimeout(() => {
        if (!o) {
          o = !0;
          try {
            s();
          } catch {
          }
          t();
        }
      }, a);
      e?.onAbort && (s = e.onAbort((c) => {
        o || (o = !0, clearTimeout(i), r(sr(c)));
      }));
    });
}
function Dp(n = {}, e = {}) {
  return {
    async tryServeMetadataCache(a) {
      if (!a.metadataCache || !a.metadataCacheKey) return null;
      try {
        const t = qm(a.metadataCacheKey, a.request);
        if (!t) return null;
        const r = await a.metadataCache.match(t);
        if (!r) return null;
        const o = e.buildProxyResponseHeaders(r, a.request, a.dynamicCors, a.finalOrigin, a.requestTraits, {
          enableH3: a.enableH3,
          forceH1: a.forceH1,
          imageCacheMaxAge: a.imageCacheMaxAge
        });
        return e.recordAccessLog(a, {
          statusCode: r.status,
          category: e.classifyProxyLogCategory(a.requestTraits),
          errorDetail: e.appendLogDiagnosticDetail(e.extractProxyErrorDetail(r), e.buildStreamDiagnosticDetail(a, r, {
            flow: "cache_hit",
            source: "worker_cache",
            cacheStatus: "WORKER_CACHE"
          })),
          detailJson: e.buildStructuredLogDetail(a, { statusCode: r.status }, {
            deliveryMode: "proxy",
            redirectMode: "worker_cache",
            decisionReason: "worker_cache_hit",
            protocolFailureReason: Number(r.status) >= 400 ? e.classifyProtocolFailureReason(e.extractProxyErrorDetail(r) || r.statusText || "", { upstreamStatus: r.status }) : null,
            upstreamStatus: r.status
          }),
          outboundColo: ""
        }), new Response(r.body, {
          status: r.status,
          statusText: r.statusText,
          headers: o
        });
      } catch {
        return null;
      }
    },
    async resolveEarlyResponse(a) {
      if (a.requestMethod === "OPTIONS") return e.buildOptionsResponse(a);
      const t = e.evaluateFirewall(a.currentConfig, a.clientIp, a.country, a.finalOrigin);
      if (t) return t;
      const r = e.applyRateLimit(a.currentConfig, a.clientIp, a.requestTraits, a.startTime, a.finalOrigin);
      return r || await e.tryServeMetadataCache(a);
    },
    shouldGuardClientDirectForRequest(a = {}, t = {}) {
      return String(t?.action || "").trim().toUpperCase() !== "DIRECT" || String(t?.reason || "").trim() === "stream_body_direct" ? !1 : a?.isBigStream === !0 || a?.isManifest === !0 || a?.isSegment === !0;
    },
    enforceStrictClientDirectAuthPolicy(a, t, r, o = {}) {
      if (!e.shouldGuardClientDirectForRequest(a?.requestTraits, t)) return t;
      const s = r?.clientRedirectAuthPolicy || ya(r?.newHeaders);
      return r && typeof r == "object" && (r.clientRedirectAuthPolicy = s), a.directRedirectAuthReason = s.reason || "", t;
    },
    createDirectTransportIncompatibleError(a, t = {}) {
      const r = /* @__PURE__ */ new Error("direct_transport_incompatible");
      return r.code = "DIRECT_TRANSPORT_INCOMPATIBLE", r.redirectTrace = t.redirectTrace || a?.redirectTrace || null, r;
    },
    async maybeProbeEntryDirectRangeRedirectResponse(a, t, r, o) {
      if (typeof r != "function") return null;
      const s = e.resolveEntryDirectTargetUrl(a, t);
      let i = null, c = () => {
      };
      const l = Hc(a?.request?.signal);
      try {
        const h = await e.performFetchWithTimeout(s, r, {
          method: "HEAD",
          timeoutMs: a.upstreamTimeoutMs,
          requestLifecycle: l
        });
        i = h.response, c = typeof h.releaseFetchController == "function" ? h.releaseFetchController : (() => {
        });
      } catch {
        return c(), l.dispose(), null;
      }
      if (!(i.status >= 300 && i.status < 400)) {
        try {
          i.body?.cancel?.();
        } catch {
        }
        return c(), l.dispose(), null;
      }
      const u = ha(i.headers.get("Location"), s);
      if (!u) {
        try {
          i.body?.cancel?.();
        } catch {
        }
        return c(), l.dispose(), null;
      }
      const d = a.playbackRelayTargetUrl instanceof URL ? a.playbackRelayTargetUrl : t, f = Ea(u, d).proxyPath || (u.origin === d?.origin ? u.pathname : null);
      if (f && la(f)) {
        const h = e.createRedirectTrace(a.requestUrl);
        e.recordRedirectTraceHop(h, i.status, u, {
          isSameOriginRedirect: !0,
          traceAction: "blocked_web"
        }), e.finalizeRedirectTrace(h, {
          terminalMode: "web_proxy_disabled",
          finalStatus: 404,
          finalHost: u.hostname || ""
        }), a.redirectTrace = h, a.defaultOutboundColo = Ka(i) || "";
        try {
          i.body?.cancel?.();
        } catch {
        }
        return c(), l.dispose(), e.recordAccessLog(a, e.buildDirectAccessLogPayload(a, 404, a.defaultOutboundColo, {
          redirectTrace: h,
          decisionReason: "web_proxy_disabled"
        })), hn(a.requestMethod, a.dynamicCors);
      }
      const m = e.buildClientVisibleRedirectUrl(u, a.playbackRelayTargetUrl || t, a.nodeName, a.nodeKey, a.requestUrl, { entryMode: a.entryMode }) || u, p = e.createRedirectTrace(a.requestUrl);
      e.recordRedirectTraceHop(p, i.status, u, {
        isSameOriginRedirect: u.origin === s.origin,
        traceAction: "direct",
        dataPlaneMode: o?.dataPlaneMode
      }), e.finalizeRedirectTrace(p, {
        terminalMode: "client_redirect",
        finalStatus: i.status,
        finalHost: String(u.hostname || "").trim().toLowerCase()
      }), a.redirectTrace = p, a.defaultOutboundColo = Ka(i) || "";
      const g = e.buildProxyResponseHeaders(i, a.request, a.dynamicCors, a.finalOrigin, a.requestTraits, {
        enableH3: a.enableH3,
        forceH1: a.forceH1,
        imageCacheMaxAge: a.imageCacheMaxAge
      });
      return e.applyProxyRedirectHeaders(g, i, t, a.nodeName, a.nodeKey, m, s, {
        linkVariant: a.linkVariant,
        entryMode: a.entryMode
      }), e.recordAccessLog(a, e.buildDirectAccessLogPayload(a, i.status, a.defaultOutboundColo || "", {
        directRedirectUrl: m,
        redirectTrace: p,
        decisionReason: String(o?.reason || o?.traceLabel || "").trim()
      })), c(), l.dispose(), new Response(a.requestMethod === "HEAD" ? null : i.body, {
        status: i.status,
        statusText: i.statusText,
        headers: g
      });
    },
    async maybeBuildEntryDirectResponse(a, t, r = null, o = null) {
      if (a?.forceWorkerProxy === !0) return null;
      const s = e.enforceStrictClientDirectAuthPolicy(a, a.entryRoutingDecision, r, {
        redirectStatus: a.entryRoutingDecision?.redirectStatus || 307,
        redirectMethod: a.requestMethod
      });
      if (a.entryRoutingDecision = s, s?.phase !== "entry" || s?.action !== "DIRECT") return null;
      const i = (Je(t[0]) ? t[0] : null)?.targetUrl || null;
      if (!(i instanceof URL)) return null;
      const c = r?.clientRedirectAuthPolicy || ya(r?.newHeaders || a.request.headers);
      if (r && typeof r == "object" && (r.clientRedirectAuthPolicy = c), a?.requestTraits?.isBigStream === !0 && a?.requestTraits?.rangeHeader && c.hasQueryAuth !== !0 && c.hasHeaderAuth !== !0 && c.hasCookieAuth !== !0) {
        const f = await e.maybeProbeEntryDirectRangeRedirectResponse(a, i, o, s);
        if (f) return f;
      }
      if (c.canDirect !== !0)
        throw a.directRedirectAuthReason = c.reason || "direct_transport_incompatible", e.createDirectTransportIncompatibleError(a);
      const l = Uc(e.resolveEntryDirectTargetUrl(a, i), c), u = new Response(null, {
        status: 307,
        statusText: "Temporary Redirect"
      }), d = e.buildProxyResponseHeaders(u, a.request, a.dynamicCors, a.finalOrigin, a.requestTraits, {
        enableH3: a.enableH3,
        forceH1: a.forceH1,
        imageCacheMaxAge: a.imageCacheMaxAge
      });
      return e.applyProxyRedirectHeaders(d, u, i, a.nodeName, a.nodeKey, l, l, {
        linkVariant: a.linkVariant,
        entryMode: a.entryMode
      }), e.recordAccessLog(a, e.buildDirectAccessLogPayload(a, 307, "")), new Response(null, {
        status: 307,
        statusText: "Temporary Redirect",
        headers: d
      });
    },
    createBuildFetchOptions(a, t) {
      const { request: r, requestMethod: o, requestTraits: s, protocolFallback: i } = a, { newHeaders: c, adminCustomHeaders: l, preparedBody: u, preparedBodyMode: d } = t, f = t?.transportTemplate || null, m = Array.isArray(f?.baseHeaderEntries) ? f.baseHeaderEntries : [...c.entries()], p = f ? f.adminCustomHasOrigin === !0 : l.has("origin"), g = f ? f.adminCustomHasReferer === !0 : l.has("referer"), h = f ? f.hasOriginHeader === !0 : c.has("Origin"), y = f ? f.hasRefererHeader === !0 : c.has("Referer"), S = String(f?.refererOrigin || "").trim(), _ = String(f?.refererPathAndSearch || "/") || "/", A = f ? f.isHotMediaRequest === !0 : s.isBigStream === !0 || s.isManifest === !0 || s.isSegment === !0;
      return async (b, R = {}) => {
        const E = new Headers(m), D = (b instanceof URL ? b : new URL(String(b))).origin, w = R.method || o, C = R.bodyMode || d, T = R.body !== void 0 ? R.body : u, I = R.isExternalRedirect === !0, P = R.protocolFallbackRetry === !0, U = R.stripAuthOnProtocolFallback === !0;
        if (h && !p && E.set("Origin", D), y && !g)
          if (f) S ? S !== D && E.set("Referer", `${D}${_}`) : E.set("Referer", D + "/");
          else try {
            const G = new URL(E.get("Referer") || "");
            if (G.origin !== D) {
              const x = new URL(`${G.pathname || "/"}${G.search || ""}`, D);
              E.set("Referer", x.toString());
            }
          } catch {
            E.set("Referer", D + "/");
          }
        I && (A || (Cs(E), E.delete("Cookie")), p || E.delete("Origin"), g || E.delete("Referer")), P && i && (U && Cs(E), E.set("Connection", "keep-alive")), (s.isBigStream || s.isSmartStrmMedia || s.isManifest || s.isSegment) && s.rangeHeader && !E.has("Range") && E.set("Range", s.rangeHeader), (s.isBigStream || s.isSmartStrmMedia || s.isManifest || s.isSegment) && s.ifRangeHeader && !E.has("If-Range") && E.set("If-Range", s.ifRangeHeader), (w === "GET" || w === "HEAD") && E.delete("Content-Length");
        const K = {
          method: w,
          headers: E,
          redirect: "manual"
        };
        return s.isMetadataCacheable && (K.cache = "no-store"), w !== "GET" && w !== "HEAD" && (C === "buffered" && T !== null && T !== void 0 ? K.body = T.slice(0) : C === "stream" && (K.body = T)), K;
      };
    }
  };
}
function Np(n = {}, e = {}) {
  return {
    async executeUpstreamFlow(a, t, r) {
      const o = /* @__PURE__ */ new Set([
        500,
        502,
        503,
        504,
        522,
        523,
        524,
        525,
        526,
        530
      ]), s = a.requestTraits?.isSmartStrmMedia === !0 ? {
        mode: "proxy",
        forceVideoDirect: !1,
        forceVideoProxy: !1
      } : Ku(a.node, a.currentConfig), i = e.createRedirectTrace(a.requestUrl), c = Hu(a.requestMethod, a.requestTraits, { playbackRelayTargetUrl: a.playbackRelayTargetUrl });
      a.redirectTrace = i;
      const l = a.playbackRelayTargetUrl ? await e.fetchAbsoluteWithRetryLoop({
        execution: a,
        absoluteUrl: a.playbackRelayTargetUrl,
        buildFetchOptions: r,
        fetchOptions: {
          method: a.requestMethod,
          bodyMode: t.preparedBodyMode,
          body: t.preparedBody,
          isExternalRedirect: !0
        },
        retryableStatuses: o,
        protocolFallback: a.protocolFallback,
        preparedBodyMode: t.preparedBodyMode,
        allowAutomaticRetry: t.allowAutomaticRetry,
        stripAuthOnProtocolFallback: a.requestTraits.canStripAuthOnProtocolFallback,
        upstreamTimeoutMs: a.upstreamTimeoutMs,
        maxExtraAttempts: t.allowAutomaticRetry ? a.upstreamRetryAttempts : 0,
        isRetry: !1,
        requestLifecycle: a.requestLifecycle
      }) : await e.fetchUpstreamWithRetryLoop({
        execution: a,
        retryTargetRecords: t.retryTargetRecords,
        proxyPath: a.proxyPath,
        requestUrl: a.requestUrl,
        buildFetchOptions: r,
        retryableStatuses: o,
        protocolFallback: a.protocolFallback,
        preparedBodyMode: t.preparedBodyMode,
        allowAutomaticRetry: t.allowAutomaticRetry,
        stripAuthOnProtocolFallback: a.requestTraits.canStripAuthOnProtocolFallback,
        upstreamTimeoutMs: a.upstreamTimeoutMs,
        maxExtraAttempts: t.allowAutomaticRetry ? a.upstreamRetryAttempts : 0,
        isRetry: !1,
        requestLifecycle: a.requestLifecycle,
        segmentFastPathEnabled: c
      });
      let u = l.response, d = l.targetRecord || null, f = d?.targetUrl || (a.playbackRelayTargetUrl instanceof URL ? new URL(a.playbackRelayTargetUrl.toString()) : null), m = l.finalUrl, p = l.releaseFetchController, g = l.protocolFallbackRetry === !0, h = !1, y = null, S = 0, _ = a.requestMethod, A = t.preparedBodyMode, b = t.preparedBody;
      for (a.defaultOutboundColo = Ka(u) || ""; u.status >= 300 && u.status < 400 && S < 8; ) {
        const R = Number(u.status) || 0, E = ha(u.headers.get("Location"), m || f);
        if (!E) {
          e.finalizeRedirectTrace(i, {
            terminalMode: "invalid_redirect_target",
            finalStatus: R,
            finalHost: m?.hostname || f?.hostname || ""
          });
          break;
        }
        const D = Ea(E, f).proxyPath || (E.origin === f?.origin ? E.pathname : null);
        if (D && la(D)) {
          e.recordRedirectTraceHop(i, R, E, {
            isSameOriginRedirect: !0,
            traceAction: "blocked_web"
          }), e.finalizeRedirectTrace(i, {
            terminalMode: "web_proxy_disabled",
            finalStatus: 404,
            finalHost: E.hostname || ""
          });
          try {
            u.body?.cancel?.();
          } catch {
          }
          try {
            p?.();
          } catch {
          }
          u = hn(a.requestMethod, a.dynamicCors), m = E, p = null, S += 1;
          break;
        }
        const w = e.enforceStrictClientDirectAuthPolicy(a, e.getRoutingDecision({
          phase: "redirect",
          nextUrl: E,
          activeTargetBase: f,
          redirectMethod: _,
          redirectBodyMode: A,
          forceWorkerProxy: a.forceWorkerProxy === !0,
          forceWorkerProxyReason: a.forceWorkerProxyReason,
          currentStatus: u.status,
          policy: {
            forceVideoDirect: s.forceVideoDirect === !0,
            forceVideoProxy: s.forceVideoProxy === !0,
            currentStatus: u.status
          },
          routingDecisionMode: a.routingDecisionMode
        }), t, {
          redirectStatus: u.status,
          redirectMethod: _,
          redirectBodyMode: A
        });
        if (e.recordRedirectTraceHop(i, R, E, w), w.action === "DIRECT") {
          const U = t.clientRedirectAuthPolicy || ya(t.newHeaders);
          if (U.canDirect !== !0)
            throw a.directRedirectAuthReason = U.reason || "direct_transport_incompatible", e.finalizeRedirectTrace(i, {
              terminalMode: "direct_incompatible",
              finalStatus: 409,
              finalHost: E.hostname || ""
            }), e.createDirectTransportIncompatibleError(a, { redirectTrace: i });
          const K = e.buildClientVisibleRedirectUrl(E, f, a.nodeName, a.nodeKey, a.requestUrl, {
            preserveWorkerProxy: w.preserveWorkerProxy === !0,
            linkVariant: a.linkVariant,
            entryMode: a.entryMode
          }) || E;
          y = w.preserveWorkerProxy === !0 ? K : Uc(K, t.clientRedirectAuthPolicy || t.newHeaders), e.finalizeRedirectTrace(i, {
            terminalMode: "client_redirect",
            finalStatus: R,
            finalHost: y.hostname || E.hostname || ""
          });
          break;
        }
        const C = w.nextMethod, T = w.nextBodyMode, I = T === "none" ? null : b;
        try {
          u.body?.cancel?.();
        } catch {
        }
        try {
          p?.();
        } catch {
        }
        let P;
        try {
          P = await e.fetchAbsoluteWithRetryLoop({
            absoluteUrl: E,
            buildFetchOptions: r,
            fetchOptions: {
              method: C,
              bodyMode: T,
              body: I,
              isExternalRedirect: !w.isSameOriginRedirect
            },
            retryableStatuses: o,
            protocolFallback: a.protocolFallback,
            preparedBodyMode: T,
            allowAutomaticRetry: t.allowAutomaticRetry,
            stripAuthOnProtocolFallback: a.requestTraits.canStripAuthOnProtocolFallback,
            upstreamTimeoutMs: a.upstreamTimeoutMs,
            maxExtraAttempts: t.allowAutomaticRetry ? a.upstreamRetryAttempts : 0,
            isRetry: !1,
            requestLifecycle: a.requestLifecycle
          });
        } catch (U) {
          throw e.finalizeRedirectTrace(i, {
            terminalMode: "proxy_error_after_redirect",
            finalStatus: R,
            finalHost: E.hostname || ""
          }), U && typeof U == "object" && (U.redirectTrace = i), U;
        }
        u = P.response, m = P.finalUrl, p = P.releaseFetchController, g = g || P.protocolFallbackRetry === !0, _ = C, A = T, b = I, a.defaultOutboundColo = Ka(u) || "", w.isSameOriginRedirect || (h = !0), S += 1;
      }
      if (!i.terminalMode && (i.hops.length > 0 || i.finalStatus > 0)) {
        const R = Number(u?.status) || 0;
        if (R >= 300 && R < 400) {
          const E = ha(u.headers.get("Location"), m || f);
          e.finalizeRedirectTrace(i, {
            terminalMode: S >= 8 ? "redirect_limit" : "upstream_redirect_passthrough",
            finalStatus: R,
            finalHost: E?.hostname || m?.hostname || f?.hostname || ""
          });
        } else e.finalizeRedirectTrace(i, {
          terminalMode: i.hops.length > 0 ? "proxied_follow" : "no_redirect",
          finalStatus: R,
          finalHost: m?.hostname || f?.hostname || ""
        });
      }
      return {
        response: u,
        finalUrl: m,
        activeTargetRecord: d,
        activeTargetBase: f,
        releaseFetchController: p,
        proxiedExternalRedirect: h,
        directRedirectUrl: y,
        protocolFallbackRetry: g,
        redirectTrace: i
      };
    },
    async buildSuccessResponse(a, t, r, o = null) {
      let s = await e.guardApiResponseMime(a, r);
      a?.requestTraits?.isPlaybackInfoRequest === !0 && (s = await e.guardPlaybackInfoResponseContract(a, s), Qt(s.playbackInfoRepresentation) && (s = await e.maybeRewritePlaybackInfoResponse(a, s)));
      const i = String(s.redirectTrace?.terminalMode || a?.redirectTrace?.terminalMode || ""), c = a?.playbackAbsoluteFallbackEligible === !0 && !s.directRedirectUrl && i !== "web_proxy_disabled" && Number(s.response.status) === 404;
      c && (a.playbackFallback = "relative_307");
      const l = e.shouldLogDirectAccess(a, { directRedirectUrl: s.directRedirectUrl }), u = l ? "" : e.buildRedirectDiagnosticDetail(s.redirectTrace || a.redirectTrace), d = s.response.status, f = c ? 307 : s.directRedirectUrl && Number(s.redirectTrace?.finalStatus) || d, m = c ? "Temporary Redirect" : s.response.statusText;
      e.markFailoverBusinessSuccess(a, s.activeTargetRecord, { status: d });
      const p = e.buildProxyResponseHeaders(s.response, a.request, a.dynamicCors, a.finalOrigin, a.requestTraits, {
        enableH3: a.enableH3,
        forceH1: a.forceH1,
        proxiedExternalRedirect: s.proxiedExternalRedirect,
        imageCacheMaxAge: a.imageCacheMaxAge
      });
      e.applyProxyRedirectHeaders(p, s.response, s.activeTargetBase, a.nodeName, a.nodeKey, s.directRedirectUrl, s.finalUrl, {
        linkVariant: a.linkVariant,
        entryMode: a.entryMode
      }), c && (yc(p), p.set("Location", a.playbackAbsoluteFallbackLocation || "/"), p.set("Cache-Control", "no-store"));
      const g = !c && e.shouldManageProxyResponseBody(a, s), h = a.defaultOutboundColo || "", y = e.buildRuntimeDiagnosticDetail(a), S = l ? e.buildDirectAccessDiagnosticDetail(a, {
        directRedirectUrl: s.directRedirectUrl,
        redirectTrace: s.redirectTrace || a.redirectTrace
      }) : e.appendLogDiagnosticDetail(e.appendLogDiagnosticDetail(e.extractProxyErrorDetail(s.response), e.buildStreamDiagnosticDetail(a, s.response, {
        flow: g ? "managed" : "passthrough",
        source: "upstream",
        upstreamHost: s.finalUrl?.hostname || s.activeTargetBase?.hostname || "",
        protocolFallbackRetry: s.protocolFallbackRetry === !0,
        idleTimeoutMs: g ? e.resolveResponseStreamIdleTimeoutMs(a.requestTraits, a.upstreamTimeoutMs) : 0
      })), e.appendLogDiagnosticDetail(y, u)), _ = l ? e.buildDirectAccessLogPayload(a, f, h, {
        directRedirectUrl: s.directRedirectUrl,
        redirectTrace: s.redirectTrace || a.redirectTrace
      }) : {
        statusCode: c ? f : d,
        category: e.classifyProxyLogCategory(a.requestTraits),
        errorDetail: S,
        detailJson: e.buildStructuredLogDetail(a, { statusCode: c ? f : d }, {
          transport: null,
          deliveryMode: "proxy",
          redirectTrace: s.redirectTrace || a.redirectTrace,
          redirectMode: c ? "playback_relative_fallback" : s.redirectTrace?.terminalMode || "proxied_follow",
          redirectUrl: s.finalUrl,
          decisionReason: c ? "playback_relative_fallback" : s.redirectTrace?.terminalMode || "proxied_follow",
          protocolFailureReason: s.protocolFallbackRetry === !0 ? e.classifyProtocolFailureReason("protocol_fallback", {
            upstreamStatus: d,
            protocolFallbackRetry: !0
          }) : Number(d) >= 400 ? e.classifyProtocolFailureReason(S || s.response.statusText || "", {
            upstreamStatus: d,
            protocolFallbackRetry: s.protocolFallbackRetry === !0
          }) : null,
          protocolFallbackRetry: s.protocolFallbackRetry === !0,
          playbackInfoCache: a.playbackInfoCacheState,
          playbackInfoCacheTtlSec: a.playbackInfoCacheTtlSec,
          progressRelayMode: a.progressForwardMode,
          progressIntervalSec: a.videoProgressForwardIntervalSec,
          upstreamHost: s.finalUrl?.hostname || s.activeTargetBase?.hostname || "",
          upstreamStatus: d
        }),
        outboundColo: h
      };
      if (g || (e.recordAccessLog(a, _), await e.flushCriticalLogsIfNeeded(a)), a.metadataCacheKey && a.ctx && s.response.status === 200) {
        const R = s.response.clone();
        a.ctx.waitUntil(e.storeMetadataCache(a.metadataCacheKey, R, a.requestTraits, {
          sourceUrl: a.requestUrl,
          prewarmCacheTtl: a.requestTraits.prewarmCacheTtl,
          imageCacheMaxAge: a.imageCacheMaxAge,
          proxiedExternalRedirect: s.proxiedExternalRedirect === !0
        }));
      }
      a.requestTraits.isPlaybackInfoRequest === !0 && await e.storePlaybackInfoResponseCache(a, s.response, null, s.playbackInfoRepresentation), await e.maybePrewarmMetadataResponse(a.request, s.response, a.requestTraits, s.activeTargetBase, t, a.nodeName, a.nodeKey, a.requestUrl, a.ctx, {
        proxyPath: a.proxyPath,
        prewarmCacheTtl: a.requestTraits.prewarmCacheTtl,
        imageCacheMaxAge: a.imageCacheMaxAge,
        nodeCacheRevision: a.nodeDerivedCacheRevision,
        entryMode: a.entryMode,
        identityPartition: a.metadataCacheIdentityPartition
      }), e.maybeScheduleBackgroundFailoverRefresh(a, s);
      const A = s.response;
      if (c) {
        try {
          s.response.body?.cancel?.();
        } catch {
        }
        try {
          s.releaseFetchController?.();
        } catch {
        }
        return a.requestLifecycle?.dispose?.(), new Response(null, {
          status: f,
          statusText: m,
          headers: p
        });
      }
      if (s.response.status === 101 && A.webSocket) {
        try {
          s.releaseFetchController?.();
        } catch {
        }
        a.requestLifecycle?.dispose?.();
        const R = {
          status: 101,
          statusText: s.response.statusText,
          headers: p,
          webSocket: A.webSocket
        };
        return new Response(null, R);
      }
      let b;
      return g ? b = e.buildManagedProxyResponseBody(a, s, _) : b = e.buildPassthroughProxyResponseBody(a, s), new Response(b, {
        status: f,
        statusText: m,
        headers: p
      });
    }
  };
}
function Lp(n = {}, e = {}) {
  return {
    buildErrorResponse(a, t) {
      const r = t?.message || String(t || "网关或 CF Workers 内部崩溃"), o = String(t?.code || "").toUpperCase(), s = e.buildRedirectDiagnosticDetail(t?.redirectTrace || a.redirectTrace), i = e.buildRuntimeDiagnosticDetail(a);
      let c = 502, l = "Bad Gateway", u = {
        error: "Bad Gateway",
        code: 502,
        message: "All proxy attempts failed."
      };
      o === "UPSTREAM_TIMEOUT" || o === "STREAM_IDLE_TIMEOUT" ? (c = 504, l = "Gateway Timeout", u = {
        error: "Gateway Timeout",
        code: 504,
        message: "Upstream response timed out."
      }) : o === "DIRECT_TRANSPORT_INCOMPATIBLE" ? (c = 409, l = "Conflict", u = {
        error: "Conflict",
        code: 409,
        message: "DIRECT mode is strict and will not fall back to proxy when custom auth headers or cookies are required."
      }) : (o === "CLIENT_ABORTED" || o === "DOWNSTREAM_CANCELLED" || o === "REQUEST_ABORTED") && (c = 499, l = "Client Closed Request", u = {
        error: "Client Closed Request",
        code: 499,
        message: "Client closed request."
      });
      try {
        a.requestLifecycle?.abort?.(o ? o.toLowerCase() : "proxy_error");
      } catch {
      }
      a.requestLifecycle?.dispose?.(), o === "DIRECT_TRANSPORT_INCOMPATIBLE" ? e.recordAccessLog(a, e.buildDirectAccessLogPayload(a, c, a.defaultOutboundColo || "", { redirectTrace: t?.redirectTrace || a.redirectTrace })) : e.recordAccessLog(a, {
        statusCode: c,
        category: c === 499 ? e.classifyProxyLogCategory(a.requestTraits || {}) : "error",
        errorDetail: e.appendLogDiagnosticDetail(e.appendLogDiagnosticDetail(r, e.buildStreamDiagnosticDetail(a, null, {
          flow: "proxy_error",
          source: "upstream_pending",
          upstreamHost: t?.lastFinalUrl?.hostname || t?.lastTargetBase?.hostname || "",
          idleTimeoutMs: e.resolveResponseStreamIdleTimeoutMs(a.requestTraits || {}, a.upstreamTimeoutMs)
        })), e.appendLogDiagnosticDetail(i, s)),
        detailJson: e.buildStructuredLogDetail(a, { statusCode: c }, {
          deliveryMode: "proxy",
          redirectTrace: t?.redirectTrace || a.redirectTrace,
          redirectMode: "proxy_error",
          redirectUrl: t?.lastFinalUrl,
          decisionReason: o || "proxy_error",
          protocolFailureReason: e.classifyProtocolFailureReason(t, {
            errorCode: o,
            message: r,
            protocolFallbackRetry: !1,
            upstreamStatus: c
          }),
          playbackInfoCache: a.playbackInfoCacheState,
          playbackInfoCacheTtlSec: a.playbackInfoCacheTtlSec,
          progressRelayMode: a.progressForwardMode,
          progressIntervalSec: a.videoProgressForwardIntervalSec,
          upstreamHost: t?.lastFinalUrl?.hostname || t?.lastTargetBase?.hostname || "",
          upstreamStatus: c
        }),
        outboundColo: a.defaultOutboundColo || ""
      });
      const d = new Headers({
        "Content-Type": "application/json; charset=utf-8",
        "Access-Control-Allow-Origin": a.finalOrigin || "*",
        "Cache-Control": "no-store"
      });
      return a.finalOrigin !== "*" && Or(d, "Origin"), Ce(d), new Response(JSON.stringify(u), {
        status: c,
        statusText: l,
        headers: d
      });
    },
    async handle(a, t, r, o, s, i, c, l = {}) {
      if (la(r)) {
        const h = F(l.runtimeConfig) ? l.runtimeConfig : {}, y = _a(i, a, e.resolveCorsOrigin(h, a));
        return hn(a.method, y);
      }
      let u = await e.prepareExecutionContext(a, t, r, o, s, i, c, l);
      if (u.invalidResponse) return u.invalidResponse;
      const d = await e.resolveEarlyResponse(u);
      if (d) return d;
      let { targetRecords: f, invalidResponse: m } = e.parseTargetRecords(u.node, u.finalOrigin, { cachedTargetRecords: u.playbackRouteHotTargetRecords });
      if (m) return m;
      let p = e.prepareFailoverOverlay(u, f);
      u.defaultOutboundColo = "";
      let g = null;
      try {
        g = await e.buildProxyRequestState(u.request, u.node, u.proxyPath, u.requestUrl, u.clientIp, u.requestTraits, u.forceH1, p, {
          effectiveRealClientIpMode: u.effectiveRealClientIpMode,
          effectiveMediaAuthMode: u.effectiveMediaAuthMode
        });
        const h = await e.tryServePlaybackInfoResponseCache(u, g);
        if (h) return h;
        const y = e.createBuildFetchOptions(u, g), S = await e.maybeBuildEntryDirectResponse(u, f, g, y);
        if (S) return S;
        const _ = await e.maybeHandlePlaybackProgressRelay(u, g, y, g.retryTargetRecords);
        if (_) return _;
        u.requestLifecycle = Hc(u.request?.signal);
        const A = await e.executeUpstreamFlow(u, g, y);
        return await e.buildSuccessResponse(u, y, A, g);
      } catch (h) {
        return e.buildErrorResponse(u, h);
      }
    }
  };
}
function Mp(n = {}, e = {}) {
  return {
    ...Dp(n, e),
    ...Np(n, e),
    ...Lp(n, e)
  };
}
function Ip(n = {}, e = {}) {
  const { Logger: a } = n;
  return {
    resolveEntryDirectTargetUrl(t, r) {
      if (t?.playbackRelayTargetUrl instanceof URL) return new URL(t.playbackRelayTargetUrl.toString());
      const o = mr(r, t?.proxyPath || "/");
      return o.search = String(t?.requestUrl?.search || ""), o;
    },
    classifyProxyLogCategory(t) {
      return t.isSegment ? "segment" : t.isManifest ? "manifest" : t.isBigStream || t.isSmartStrmMedia ? "stream" : t.isImage ? "image" : t.isSubtitle ? "subtitle" : t.isStaticFile ? "asset" : t.isWsUpgrade ? "websocket" : "api";
    },
    extractProxyErrorDetail(t) {
      if (t.status < 400) return null;
      const r = [], o = t.headers.get("Server");
      o && r.push(`Server: ${o}`);
      const s = t.headers.get("CF-Ray");
      s && r.push(`CF-Ray: ${s}`);
      const i = t.headers.get("X-Application-Error-Code") || t.headers.get("X-Emby-Error") || t.headers.get("X-MediaBrowser-Error");
      i && r.push(`Media-Server-Error: ${i}`);
      const c = t.headers.get("CF-Cache-Status");
      return c && r.push(`CF-Cache: ${c}`), r.length > 0 ? r.join(" | ") : t.statusText;
    },
    appendLogDiagnosticDetail(t, r) {
      const o = [], s = (c) => {
        const l = String(c || "").trim();
        l && (o.includes(l) || o.push(l));
      };
      if (s(t), s(r), !o.length) return null;
      const i = o.join(" | ");
      return i.length > 1200 ? i.slice(0, 1197) + "..." : i;
    },
    shouldLogDirectAccess(t, r = {}) {
      return !!(e.isEntryDirectDataPlaneMode(t?.entryRoutingDecision?.dataPlaneMode) || r.directRedirectUrl);
    },
    buildDirectAccessDiagnosticDetail(t, r = {}) {
      let o = "直连";
      o = e.appendLogDiagnosticDetail(o, `RoutingMode=${Lr(t?.routingDecisionMode)}`), o = e.appendLogDiagnosticDetail(o, e.buildTargetHotCacheDiagnosticDetail(t));
      const s = t?.entryRoutingDecision;
      return e.isEntryDirectDataPlaneMode(s?.dataPlaneMode) && (o = e.appendLogDiagnosticDetail(o, `Direct=entry_307 | Reason=${String(s?.reason || s?.traceLabel || "entry_direct").trim() || "entry_direct"}`)), o = e.appendLogDiagnosticDetail(o, e.buildPlaybackUrlDiagnosticDetail(t)), o = e.appendLogDiagnosticDetail(o, t?.directRedirectAuthReason ? `DirectAuth=${t.directRedirectAuthReason}` : ""), o = e.appendLogDiagnosticDetail(o, e.buildRouteContextDiagnosticDetail(t)), o = e.appendLogDiagnosticDetail(o, e.buildStreamDiagnosticDetail(t, null, {
        force: !0,
        flow: r.directRedirectUrl ? "client_redirect" : "entry_direct",
        source: "client_visible_redirect"
      })), (r.directRedirectUrl || r.redirectTrace) && (o = e.appendLogDiagnosticDetail(o, e.buildRedirectDiagnosticDetail(r.redirectTrace || t?.redirectTrace))), o;
    },
    buildDirectAccessLogPayload(t, r, o = "", s = {}) {
      return {
        statusCode: r,
        category: e.classifyProxyLogCategory(t.requestTraits),
        errorDetail: e.buildDirectAccessDiagnosticDetail(t, s),
        detailJson: e.buildStructuredLogDetail(t, { statusCode: r }, {
          ...s,
          deliveryMode: "direct",
          redirectMode: s.directRedirectUrl ? "client_redirect" : "entry_307",
          decisionReason: String(s.decisionReason || t?.directRedirectAuthReason || t?.entryRoutingDecision?.reason || t?.entryRoutingDecision?.traceLabel || "").trim()
        }),
        outboundColo: o
      };
    },
    buildStreamDiagnosticDetail(t, r, o = {}) {
      const s = t?.requestTraits || {};
      if (!(o.force === !0 || s.isBigStream === !0 || s.isSmartStrmMedia === !0 || s.isSegment === !0 || s.isManifest === !0)) return "";
      const i = r?.headers, c = [], l = (u, d) => {
        const f = String(d || "").trim();
        f && c.push(`${u}=${f.length > 160 ? f.slice(0, 157) + "..." : f}`);
      };
      return l("Flow", o.flow || "passthrough"), l("Kind", e.classifyProxyLogCategory(s)), l("Source", o.source || "upstream"), l("Range", s.rangeHeader || t?.request?.headers?.get("Range")), l("Content-Range", i?.get("Content-Range")), l("Length", i?.get("Content-Length")), l("Accept-Ranges", i?.get("Accept-Ranges")), l("Cache", o.cacheStatus || i?.get("CF-Cache-Status")), l("Upstream", o.upstreamHost || o.upstreamUrlHost), l("RoutingMode", Lr(t?.routingDecisionMode)), l("DirectAuth", t?.directRedirectAuthReason), o.protocolFallbackRetry === !0 && l("Retry", "protocol_fallback"), Number(o.idleTimeoutMs) > 0 && l("Idle", `${Number(o.idleTimeoutMs)}ms`), c.join(" | ");
    },
    buildPlaybackInfoCacheDiagnosticDetail(t) {
      if (t?.requestTraits?.isPlaybackInfoRequest !== !0) return "";
      const r = $t(t?.effectivePlaybackInfoMode), o = String(t?.playbackInfoCacheState || "").trim(), s = String(t?.playbackInfoRewrite || "").trim(), i = [`PlaybackInfoMode=${r}`];
      return s && i.push(`PlaybackInfoRewrite=${s}`), o && i.push(`PlaybackInfoCache=${o}`), Number(t?.playbackInfoCacheTtlSec) > 0 && i.push(`PlaybackInfoCacheTtl=${Number(t.playbackInfoCacheTtlSec)}s`), i.join(" | ");
    },
    buildPlaybackUrlDiagnosticDetail(t) {
      const r = String(t?.playbackUrlMode || "").trim(), o = String(t?.playbackFallback || "").trim(), s = String(t?.playbackPathFix || "").trim(), i = String(t?.rewritePlaybackEntry || "").trim(), c = [];
      return r && c.push(`PlaybackUrlMode=${r}`), o && c.push(`PlaybackFallback=${o}`), s && c.push(`PlaybackPathFix=${s}`), i && c.push(`RewritePlaybackEntry=${i}`), c.join(" | ");
    },
    buildTargetHotCacheDiagnosticDetail(t) {
      const r = String(t?.targetHotCacheState || "").trim();
      return r ? `TargetHotCache=${r}` : "";
    },
    buildRouteContextDiagnosticDetail(t) {
      const r = t?.routeContextDiagnostics && typeof t.routeContextDiagnostics == "object" ? t.routeContextDiagnostics : null;
      if (!r) return "";
      const o = [], s = (i, c) => {
        const l = String(c || "").trim();
        l && o.push(`${i}=${l}`);
      };
      return s("RouteKind", r.routeKind), s("RequestHost", r.requestHost), s("ConfiguredHost", r.configuredHost), s("ConfiguredLegacyHost", r.configuredLegacyHost), o.push(`LegacyHostRequest=${r.isLegacyHostRequest === !0 ? "true" : "false"}`), o.join(" | ");
    },
    buildRuntimeDiagnosticDetail(t) {
      return e.appendLogDiagnosticDetail(e.appendLogDiagnosticDetail(e.appendLogDiagnosticDetail(e.appendLogDiagnosticDetail(e.buildTargetHotCacheDiagnosticDetail(t), e.buildPlaybackInfoCacheDiagnosticDetail(t)), e.buildFailoverDiagnosticDetail(t)), e.buildPlaybackUrlDiagnosticDetail(t)), e.appendLogDiagnosticDetail(e.buildProgressRelayDiagnosticDetail(t), e.buildRouteContextDiagnosticDetail(t)));
    },
    buildProgressRelayDiagnosticDetail(t) {
      if (t?.requestTraits?.isPlaybackSessionControlRequest !== !0) return "";
      const r = String(t?.progressForwardMode || "").trim();
      if (!r) return "";
      const o = [`ProgressRelay=${r}`];
      Number(t?.videoProgressForwardIntervalSec) > 0 && o.push(`ProgressInterval=${Number(t.videoProgressForwardIntervalSec)}s`);
      const s = String(t?.progressForwardSessionKey || "").trim();
      return s && o.push(`ProgressSession=${ce(s)}`), o.join(" | ");
    },
    collectLogAuthKinds(t, r = null) {
      const o = /* @__PURE__ */ new Set(), s = t?.requestUrl instanceof URL ? t.requestUrl : null;
      if (s) for (const l of s.searchParams.keys()) {
        const u = Aa(l);
        if (vc.has(u) || Fc.has(u)) {
          o.add("query");
          break;
        }
      }
      const i = r?.newHeaders || t?.request?.headers || new Headers(), c = r?.clientRedirectAuthPolicy || ya(i);
      return c.hasQueryAuth && o.add("query"), c.hasHeaderAuth && o.add("header"), c.hasCookieAuth && o.add("cookie"), [...o];
    },
    pickPrimaryAuthCarrier(t = []) {
      return (t || []).includes("query") ? "query" : (t || []).includes("header") ? "header" : (t || []).includes("cookie") ? "cookie" : "none";
    },
    resolveRedirectScope(t, r) {
      if (!t) return "none";
      try {
        const o = t instanceof URL ? t : new URL(String(t || "")), s = r instanceof URL ? r : new URL(String(r || ""));
        return o.origin === s.origin ? "same_origin" : "external";
      } catch {
        return "external";
      }
    },
    resolveRoutingCapability(t = "proxy", r = [], o = "none") {
      const s = String(t || "").trim().toLowerCase() === "direct" ? "direct" : "proxy", i = e.pickPrimaryAuthCarrier(r), c = o === "same_origin" || o === "external" ? o : "none";
      return hp?.[s]?.[i]?.[c] || {
        deliveryMode: s,
        authCarrier: i,
        redirectScope: c,
        clientVisibleRedirect: s === "direct" && c !== "none",
        workerFollowRedirect: s !== "direct",
        reasonCode: s === "direct" ? "client_redirect" : "worker_follow_redirect"
      };
    },
    classifyProtocolFailureReason(t, r = {}) {
      const o = String(r.errorCode || t?.code || "").trim().toUpperCase(), s = String(r.message || t?.message || t || "").trim().toLowerCase(), i = Number(r.upstreamStatus) || 0;
      return String(r.abortReason || "").trim().toLowerCase() === "stream_idle_timeout" || o === "STREAM_IDLE_TIMEOUT" ? "idle_timeout" : o === "UPSTREAM_TIMEOUT" || s.includes("timed out") || s.includes("timeout") ? "connect_timeout" : s.includes("redirect loop") ? "redirect_loop" : s.includes("too many redirects") || s.includes("redirect limit") ? "redirect_limit_exceeded" : s.includes("tls") || s.includes("ssl") || s.includes("certificate") ? "tls_handshake_failed" : r.protocolFallbackRetry === !0 || s.includes("protocol_fallback") ? "http_version_fallback" : i === 416 || s.includes("range") && (s.includes("416") || s.includes("unsatisfied") || s.includes("satisfiable")) ? "range_unsatisfied" : i >= 400 && i < 500 ? "upstream_4xx" : i >= 500 ? "upstream_5xx" : "unknown_fetch_error";
    },
    buildStructuredLogDetail(t, r = {}, o = {}) {
      const s = String(o.deliveryMode || (e.shouldLogDirectAccess(t, { directRedirectUrl: o.directRedirectUrl }) ? "direct" : "proxy")).trim().toLowerCase() === "direct" ? "direct" : "proxy", i = e.collectLogAuthKinds(t, o.transport), c = o.redirectScope || e.resolveRedirectScope(o.directRedirectUrl || o.redirectUrl || o.finalUrl, t?.requestUrl), l = e.resolveRoutingCapability(s, i, c), u = Number(o.upstreamStatus || r.statusCode || 0) || 0, d = od(u), f = t?.routeContextDiagnostics && typeof t.routeContextDiagnostics == "object" ? t.routeContextDiagnostics : null, m = Array.isArray(o.authKindsForwarded) ? [...new Set(o.authKindsForwarded.map((g) => String(g || "").trim().toLowerCase()).filter(Boolean))] : s === "direct" ? i.filter((g) => g === "query") : i, p = e.ensureFailoverTelemetry(t);
      return {
        routingMode: Lr(t?.routingDecisionMode),
        entryDecision: t?.entryRoutingDecision ? {
          dataPlaneMode: String(t.entryRoutingDecision.dataPlaneMode || "").trim(),
          reason: String(t.entryRoutingDecision.reason || t.entryRoutingDecision.traceLabel || "").trim()
        } : null,
        redirectDecision: o.redirectDecision && typeof o.redirectDecision == "object" ? o.redirectDecision : {
          mode: String(o.redirectMode || o.redirectTrace?.terminalMode || l.reasonCode || "").trim(),
          reason: String(o.decisionReason || t?.directRedirectAuthReason || l.reasonCode || "").trim()
        },
        deliveryMode: s,
        redirectScope: c,
        authKindsPresent: i,
        authKindsForwarded: m,
        decisionReason: String(o.decisionReason || t?.directRedirectAuthReason || l.reasonCode || "").trim(),
        routeKind: String(f?.routeKind || "").trim() || null,
        requestHost: String(f?.requestHost || "").trim() || null,
        configuredHost: String(f?.configuredHost || "").trim() || null,
        configuredLegacyHost: String(f?.configuredLegacyHost || "").trim() || null,
        isLegacyHostRequest: f?.isLegacyHostRequest === !0,
        statusReasonCode: d.code,
        statusReasonText: d.text,
        protocolFailureReason: String(o.protocolFailureReason || "").trim() || null,
        protocolFallbackRetry: o.protocolFallbackRetry === !0,
        failoverState: e.buildFailoverStateSummary(t),
        probeReason: String(o.probeReason || p.probeReason || "").trim() || null,
        probeWinner: String(o.probeWinner || p.probeWinner || "").trim() || null,
        probeElapsedMs: Math.max(0, Math.round(Number(o.probeElapsedMs ?? p.probeElapsedMs) || 0)) || null,
        waitJoinMs: Math.max(0, Math.round(Number(o.waitJoinMs ?? p.waitJoinMs) || 0)) || null,
        demotedTarget: String(o.demotedTarget || p.demotedTarget || "").trim() || null,
        preferredTarget: String(o.preferredTarget || p.preferredTarget || "").trim() || null,
        fastFailReason: String(o.fastFailReason || p.fastFailReason || "").trim() || null,
        targetHotCache: String(o.targetHotCache || t?.targetHotCacheState || "").trim() || null,
        playbackInfoCache: String(o.playbackInfoCache || t?.playbackInfoCacheState || "").trim() || null,
        playbackInfoCacheTtlSec: Number.isFinite(Number(o.playbackInfoCacheTtlSec)) ? Math.max(0, Math.trunc(Number(o.playbackInfoCacheTtlSec))) : Math.max(0, Math.trunc(Number(t?.playbackInfoCacheTtlSec) || 0)),
        playbackInfoMode: t?.requestTraits?.isPlaybackInfoRequest === !0 ? $t(o.playbackInfoMode || t?.effectivePlaybackInfoMode) : null,
        playbackInfoRewrite: t?.requestTraits?.isPlaybackInfoRequest === !0 && String(o.playbackInfoRewrite || t?.playbackInfoRewrite || "").trim() || null,
        playbackUrlMode: String(o.playbackUrlMode || t?.playbackUrlMode || "").trim() || null,
        playbackFallback: String(o.playbackFallback || t?.playbackFallback || "").trim() || null,
        playbackPathFix: String(o.playbackPathFix || t?.playbackPathFix || "").trim() || null,
        rewritePlaybackEntry: String(o.rewritePlaybackEntry || t?.rewritePlaybackEntry || "").trim() || null,
        progressRelayMode: String(o.progressRelayMode || t?.progressForwardMode || "").trim() || null,
        progressIntervalSec: Number.isFinite(Number(o.progressIntervalSec)) ? Math.max(0, Math.trunc(Number(o.progressIntervalSec))) : Math.max(0, Math.trunc(Number(t?.videoProgressForwardIntervalSec) || 0)),
        rangeRequest: !!String(t?.request?.headers?.get("Range") || "").trim(),
        upstreamHost: String(o.upstreamHost || o.upstreamUrlHost || o.finalUrl?.hostname || "").trim(),
        upstreamStatus: u
      };
    },
    createRedirectTrace(t) {
      return {
        initialUrl: t ? String(t) : "",
        hops: [],
        terminalMode: "",
        finalStatus: 0,
        finalHost: ""
      };
    },
    recordRedirectTraceHop(t, r, o, s = {}) {
      !t || !o || t.hops.push({
        status: Number(r) || 0,
        kind: s.isSameOriginRedirect === !0 ? "same" : "external",
        action: String(s.traceAction || (e.isEntryDirectDataPlaneMode(s.dataPlaneMode) ? "direct" : "proxy")).trim() || "proxy",
        host: String(o.hostname || "").trim().toLowerCase()
      });
    },
    finalizeRedirectTrace(t, r = {}) {
      if (!t || typeof t != "object") return null;
      const o = String(r.terminalMode || t.terminalMode || "").trim();
      o && (t.terminalMode = o);
      const s = Number(r.finalStatus);
      Number.isFinite(s) && s > 0 && (t.finalStatus = s);
      const i = String(r.finalHost || "").trim().toLowerCase();
      return i && (t.finalHost = i), t;
    },
    buildRedirectDiagnosticDetail(t) {
      if (!t || typeof t != "object") return "";
      const r = Array.isArray(t.hops) ? t.hops : [], o = r.length, s = String(t.terminalMode || "").trim(), i = Number(t.finalStatus) || 0, c = String(t.finalHost || "").trim().toLowerCase();
      if (!o && !s && i <= 0 && !c) return "";
      const l = [];
      s && l.push(`Redirect=${s}`), l.push(`RedirectHops=${o}`);
      const u = r.map((d) => {
        const f = Number(d?.status) || 0, m = String(d?.kind || "").trim() || "unknown", p = String(d?.action || "").trim() || "proxy", g = String(d?.host || "").trim().toLowerCase();
        return [
          f || "0",
          m,
          p,
          g
        ].filter(Boolean).join(":");
      }).filter(Boolean).join(">");
      return u && l.push(`RedirectChain=${u.length > 240 ? u.slice(0, 237) + "..." : u}`), i > 0 && l.push(`RedirectFinal=${i}`), c && l.push(`RedirectFinalHost=${c}`), l.join(" | ");
    }
  };
}
function Pp(n = {}, e = {}) {
  const { Logger: a } = n;
  return {
    buildProxyErrorState: In,
    async guardApiResponseMime(t, r) {
      return Xc(t, r, {
        sanitizePath: Q,
        buildErrorState: In
      });
    },
    buildMetadataCacheStorageResponse(t, r, o = {}) {
      const s = new Headers(t.headers);
      return s.delete("Set-Cookie"), r.isImage || r.isSubtitle ? s.set("Cache-Control", `public, max-age=${Math.max(0, Number(o.imageCacheMaxAge) || 0)}`) : r.isManifest && s.set("Cache-Control", `public, max-age=${Math.max(0, Number(o.prewarmCacheTtl) || 0)}`), new Response(t.body, {
        status: t.status,
        statusText: t.statusText,
        headers: s
      });
    },
    async storeMetadataCache(t, r, o, s = {}) {
      const i = ir();
      if (!i || !t || !r || r.status !== 200 || s.proxiedExternalRedirect === !0 || o.isManifest && !Jn(s.sourceUrl)) return !1;
      try {
        return await i.put(t, e.buildMetadataCacheStorageResponse(r, o, s)), !0;
      } catch {
        return !1;
      }
    },
    resolveMetadataTarget(t, r, o, s) {
      const i = String(t || "").trim();
      if (!i) return null;
      let c;
      try {
        if (/^https?:\/\//i.test(i)) c = new URL(i);
        else {
          const d = new URL(i, "https://metadata-prewarm.invalid");
          c = mr(r, d.pathname || "/"), c.search = d.search || "", c.hash = d.hash || "";
        }
      } catch {
        return null;
      }
      if (ep(c.pathname)) return null;
      const { proxyPath: l } = Ea(c, r);
      if (!l) return null;
      const u = l || "/";
      return $r.test(u) || zr.test(u) || mt.test(u) || dr.test(u) ? {
        upstreamUrl: c,
        proxyPath: u,
        proxySearch: c.search || ""
      } : null;
    },
    buildMetadataPrewarmTargets(t, r, o, s, i, c) {
      const l = /* @__PURE__ */ new Map(), u = tp(t);
      if (u) {
        const d = e.resolveMetadataTarget(`/Items/${encodeURIComponent(u)}/Images/Primary`, o, s, i);
        d && l.set(`${d.proxyPath}${d.proxySearch}`, d);
      }
      return c !== "poster" && Qn(r).forEach((d) => {
        const f = e.resolveMetadataTarget(d, o, s, i);
        f && l.set(`${f.proxyPath}${f.proxySearch}`, f);
      }), [...l.values()].sort((d, f) => Es(d.proxyPath) - Es(f.proxyPath)).slice(0, 4);
    },
    async maybePrewarmMetadataResponse(t, r, o, s, i, c, l, u, d, f = {}) {
      if (!d || t.method !== "GET" || o.enablePrewarm !== !0 || o.isPlaybackInfoRequest === !0 || o.isImage || o.isSubtitle || o.isManifest || o.isSegment || o.isBigStream || !(r.status >= 200 && r.status < 300) || !Pa(r.headers.get("Content-Type"))) return;
      const m = await xe(r.clone(), ii);
      if (m.exceeded) return;
      let p;
      try {
        p = JSON.parse(m.text);
      } catch {
        return;
      }
      const g = e.buildMetadataPrewarmTargets(f.proxyPath, p, s, c, l, o.prewarmDepth);
      g.length && d.waitUntil((async () => {
        const h = ir();
        for (const y of g) {
          if (!Jn(y.upstreamUrl)) continue;
          const S = await jm(t, y.upstreamUrl), _ = xc(u, c, l, y.proxyPath, {
            search: y.proxySearch,
            nodeCacheRevision: f.nodeCacheRevision,
            entryMode: f.entryMode,
            identityPartition: S,
            cachePolicyRevision: Lc(y.proxyPath, f)
          });
          if (h && _) try {
            if (await h.match(_)) continue;
          } catch {
          }
          try {
            const A = await i(y.upstreamUrl, { method: "GET" });
            A.cache = "no-store";
            const b = new Headers(A.headers);
            b.delete("Range"), b.delete("If-Modified-Since"), b.delete("If-None-Match"), b.set("X-Metadata-Prewarm", "1"), A.headers = b;
            const R = de(f.prewarmTimeoutMs, Zl, 250, 1e4);
            let E = null;
            try {
              if (R > 0) {
                const C = new AbortController();
                A.signal = C.signal, E = setTimeout(() => C.abort(), R);
              }
              const D = await Oe(y.upstreamUrl.toString(), A), w = {
                isImage: $r.test(y.proxyPath) || zr.test(y.proxyPath),
                isSubtitle: dr.test(y.proxyPath),
                isManifest: mt.test(y.proxyPath)
              };
              await e.storeMetadataCache(_, D, w, {
                ...f,
                sourceUrl: y.upstreamUrl
              });
            } finally {
              E !== null && clearTimeout(E);
            }
          } catch {
          }
        }
      })());
    },
    shouldRetryWithProtocolFallback(t, r = {}) {
      return !(t.status !== 403 || r.isRetry !== !1 || r.protocolFallback !== !0 || r.allowAutomaticRetry !== !0 || r.preparedBodyMode === "stream");
    },
    resolveResponseStreamIdleTimeoutMs(t, r) {
      return 0;
    },
    shouldManageProxyResponseBody(t, r) {
      return t.requestTraits.isSegment === !0 && t.requestMethod !== "HEAD" && r.response.status !== 101 && !!r.response.body;
    },
    buildPassthroughProxyResponseBody(t, r) {
      const o = t.requestMethod === "HEAD" ? null : r.response.body;
      try {
        r.releaseFetchController?.();
      } catch {
      }
      return t.requestLifecycle?.dispose?.(), o;
    },
    buildManagedProxyResponseBody(t, r, o) {
      const s = r.response.body, i = t.requestLifecycle, c = o && typeof o == "object" ? o : {
        statusCode: r.response.status,
        category: e.classifyProxyLogCategory(t.requestTraits),
        errorDetail: null,
        detailJson: e.buildStructuredLogDetail(t, { statusCode: r.response.status }, {
          deliveryMode: "proxy",
          redirectMode: "proxied_follow",
          decisionReason: "proxied_follow",
          upstreamHost: r.finalUrl?.hostname || r.activeTargetBase?.hostname || "",
          upstreamStatus: r.response.status
        })
      };
      if (!s || t.requestMethod === "HEAD" || !i) {
        try {
          r.releaseFetchController?.();
        } catch {
        }
        return i?.dispose?.(), t.requestMethod === "HEAD" ? null : s;
      }
      const l = s.getReader(), u = e.resolveResponseStreamIdleTimeoutMs(t.requestTraits, t.upstreamTimeoutMs), d = {
        ...c,
        detailJson: c?.detailJson || e.buildStructuredLogDetail(t, { statusCode: r.response.status }, {
          deliveryMode: "proxy",
          redirectMode: "proxied_follow",
          decisionReason: "proxied_follow",
          protocolFailureReason: r.protocolFallbackRetry === !0 ? e.classifyProtocolFailureReason("protocol_fallback", {
            protocolFallbackRetry: !0,
            upstreamStatus: r.response.status
          }) : Number(r.response.status) >= 400 ? e.classifyProtocolFailureReason(c?.errorDetail || r.response.statusText || "", { upstreamStatus: r.response.status }) : null,
          upstreamHost: r.finalUrl?.hostname || r.activeTargetBase?.hostname || "",
          upstreamStatus: r.response.status
        }),
        errorDetail: e.appendLogDiagnosticDetail(c.errorDetail, e.buildStreamDiagnosticDetail(t, r.response, {
          flow: "managed",
          source: "upstream",
          upstreamHost: r.finalUrl?.hostname || r.activeTargetBase?.hostname || "",
          idleTimeoutMs: u
        }))
      };
      let f = !1, m = null, p = null, g = () => {
      }, h = !1;
      const y = (b = {}) => {
        if (h) return;
        h = !0;
        const R = {
          ...d,
          ...F(b) ? b : {}
        };
        R.errorDetail = e.appendLogDiagnosticDetail(b.errorDetail, d.errorDetail), R.detailJson = {
          ...d.detailJson || {},
          ...b.detailJson && typeof b.detailJson == "object" ? b.detailJson : {},
          protocolFailureReason: b?.detailJson?.protocolFailureReason || (Number(R.statusCode) >= 400 ? e.classifyProtocolFailureReason(R.errorDetail, {
            upstreamStatus: R.statusCode,
            protocolFallbackRetry: d?.detailJson?.protocolFallbackRetry === !0
          }) : d?.detailJson?.protocolFailureReason || null),
          upstreamStatus: Number(R.statusCode) || 0
        }, e.recordAccessLog(t, R);
      }, S = () => {
        p !== null && (clearTimeout(p), p = null);
      }, _ = () => {
        if (!f) {
          f = !0, S();
          try {
            g();
          } catch {
          }
          g = () => {
          };
          try {
            l.releaseLock();
          } catch {
          }
          try {
            r.releaseFetchController?.();
          } catch {
          }
          i.dispose();
        }
      }, A = () => {
        f || u <= 0 || (S(), p = setTimeout(() => i.abort("stream_idle_timeout"), u));
      };
      return g = i.onAbort((b) => {
        f || (S(), b === "stream_idle_timeout" ? y({
          statusCode: 504,
          category: "error",
          errorDetail: `stream_idle_timeout_${u}ms`
        }) : b === "client_aborted" || b === "downstream_cancelled" ? y({
          statusCode: 499,
          category: e.classifyProxyLogCategory(t.requestTraits),
          errorDetail: b
        }) : b && y({
          statusCode: 502,
          category: "error",
          errorDetail: String(b)
        }), Promise.resolve(l.cancel(b)).catch(() => {
        }).finally(() => {
          f || _();
        }));
      }), new ReadableStream({
        pull: async (b) => {
          if (!f)
            return m || (A(), m = (async () => {
              try {
                const { done: R, value: E } = await l.read();
                if (S(), R) {
                  const D = i.getAbortReason();
                  if (_(), D === "stream_idle_timeout") {
                    try {
                      b.error(sr(D, `${u}ms`));
                    } catch {
                    }
                    return;
                  }
                  y(), b.close();
                  return;
                }
                b.enqueue(E);
              } catch (R) {
                S();
                const E = i.getAbortReason(), D = E === "stream_idle_timeout" ? sr(E, `${u}ms`) : E ? sr(E) : R;
                if (_(), E === "client_aborted" || E === "downstream_cancelled") {
                  y({
                    statusCode: 499,
                    category: e.classifyProxyLogCategory(t.requestTraits),
                    errorDetail: E
                  });
                  try {
                    b.close();
                  } catch {
                  }
                  return;
                }
                y(E === "stream_idle_timeout" ? {
                  statusCode: 504,
                  category: "error",
                  errorDetail: `stream_idle_timeout_${u}ms`
                } : {
                  statusCode: 502,
                  category: "error",
                  errorDetail: R?.message || String(R)
                });
                try {
                  b.error(D);
                } catch {
                }
              } finally {
                m = null;
              }
            })(), m);
        },
        cancel: async (b) => {
          if (!f) {
            i.abort("downstream_cancelled"), S();
            try {
              await l.cancel(b);
            } catch {
            }
            y({
              statusCode: 499,
              category: e.classifyProxyLogCategory(t.requestTraits),
              errorDetail: "downstream_cancelled"
            }), _();
          }
        }
      });
    }
  };
}
function xp(n = {}, e = {}) {
  const { Logger: a } = n;
  return {
    async performFetchWithTimeout(t, r, o = {}) {
      const s = await r(t, o), i = Math.max(0, Number(o.timeoutMs) || 0), c = o.requestLifecycle || null;
      let l = null, u = null, d = !1, f = () => {
      };
      (i > 0 || c) && (u = new AbortController(), s.signal = u.signal, c && (f = c.setActiveFetchController(u)), i > 0 && (l = setTimeout(() => {
        d = !0, u.abort(`upstream_timeout_${i}ms`);
      }, i)));
      try {
        return {
          response: await Oe(t.toString(), s),
          finalUrl: t,
          releaseFetchController: f
        };
      } catch (m) {
        if (f(), d) {
          const p = /* @__PURE__ */ new Error(`upstream_timeout_${i}ms`);
          throw p.code = "UPSTREAM_TIMEOUT", p;
        }
        if (c && Zt(m)) {
          const p = c.getAbortReason();
          if (p) throw sr(p);
        }
        throw m;
      } finally {
        l !== null && clearTimeout(l);
      }
    },
    async performUpstreamFetch(t, r, o, s, i = {}) {
      const c = i.useFastSegmentBuilder === !0, l = c ? new URL(Tm(t, r, o?.search || "")) : mr(t, r);
      return c || (l.search = o.search), {
        ...await e.performFetchWithTimeout(l, s, i),
        targetRecord: t
      };
    },
    async fetchAbsoluteWithRetryLoop(t) {
      let r = null;
      const o = t.absoluteUrl instanceof URL ? new URL(t.absoluteUrl.toString()) : new URL(String(t.absoluteUrl || "")), s = Math.max(1, de(t.maxExtraAttempts, On, 0, 3) + 1);
      for (let i = 0; i < s; i++) {
        const c = t.isRetry === !0 || i > 0;
        try {
          const l = await e.performFetchWithTimeout(o, t.buildFetchOptions, {
            ...t.fetchOptions,
            isRetry: c,
            protocolFallbackRetry: t.protocolFallbackRetry === !0,
            stripAuthOnProtocolFallback: t.stripAuthOnProtocolFallback === !0,
            timeoutMs: t.upstreamTimeoutMs,
            requestLifecycle: t.requestLifecycle
          }), u = l.response;
          if (u.status === 101) return {
            ...l,
            protocolFallbackRetry: t.protocolFallbackRetry === !0
          };
          if (e.shouldRetryWithProtocolFallback(u, {
            ...t,
            isRetry: c
          })) {
            try {
              u.body?.cancel?.();
            } catch {
            }
            try {
              l.releaseFetchController?.();
            } catch {
            }
            return await e.fetchAbsoluteWithRetryLoop({
              ...t,
              isRetry: !0,
              protocolFallbackRetry: !0
            });
          }
          const d = i === s - 1;
          if (t.allowAutomaticRetry !== !0 || !t.retryableStatuses.has(u.status) || d) return {
            ...l,
            protocolFallbackRetry: t.protocolFallbackRetry === !0
          };
          try {
            u.body?.cancel?.();
          } catch {
          }
          try {
            l.releaseFetchController?.();
          } catch {
          }
        } catch (l) {
          r = l;
          const u = i === s - 1;
          if (t.allowAutomaticRetry !== !0 || u)
            throw l && typeof l == "object" && (l.lastFinalUrl = o), l;
        }
      }
      throw r && typeof r == "object" && (r.lastFinalUrl = o), r || /* @__PURE__ */ new Error("redirect_fetch_failed");
    },
    async fetchUpstreamWithRetryLoop(t) {
      let r = null, o = Array.isArray(t.retryTargetRecords) ? t.retryTargetRecords.slice() : [], s = o[0], i = mr(s, t.proxyPath);
      i.search = t.requestUrl.search;
      const c = Math.max(1, de(t.maxExtraAttempts, On, 0, 3) + 1);
      for (let l = 0; l < c; l++) for (let u = 0; u < o.length; u++) {
        const d = o[u];
        s = d;
        const f = t.isRetry === !0 || l > 0;
        try {
          const m = await e.performUpstreamFetch(d, t.proxyPath, t.requestUrl, t.buildFetchOptions, {
            isRetry: f,
            protocolFallbackRetry: t.protocolFallbackRetry === !0,
            stripAuthOnProtocolFallback: t.stripAuthOnProtocolFallback === !0,
            timeoutMs: t.upstreamTimeoutMs,
            requestLifecycle: t.requestLifecycle,
            useFastSegmentBuilder: t.segmentFastPathEnabled === !0 && f !== !0 && t.protocolFallbackRetry !== !0
          });
          i = m.finalUrl;
          const p = m.response;
          if (p.status === 101) return {
            ...m,
            protocolFallbackRetry: t.protocolFallbackRetry === !0
          };
          if (e.shouldRetryWithProtocolFallback(p, {
            ...t,
            isRetry: f
          })) {
            try {
              p.body?.cancel?.();
            } catch {
            }
            try {
              m.releaseFetchController?.();
            } catch {
            }
            return await e.fetchUpstreamWithRetryLoop({
              ...t,
              isRetry: !0,
              protocolFallbackRetry: !0
            });
          }
          const g = u === o.length - 1, h = l === c - 1;
          if (t.allowAutomaticRetry !== !0 || !t.retryableStatuses.has(p.status) || g && h) return {
            ...m,
            protocolFallbackRetry: t.protocolFallbackRetry === !0
          };
          const y = await e.maybeRunForegroundFailoverWait(t, {
            targetRecord: d,
            responseStatus: p.status,
            reason: `upstream_status_${p.status}`
          });
          if (y?.upstream) {
            const S = y.upstream;
            s = S.targetRecord || d, i = S.finalUrl || i;
            const _ = S.response;
            if (_.status === 101) return {
              ...S,
              protocolFallbackRetry: t.protocolFallbackRetry === !0
            };
            if (e.shouldRetryWithProtocolFallback(_, {
              ...t,
              isRetry: !0
            })) {
              try {
                _.body?.cancel?.();
              } catch {
              }
              try {
                S.releaseFetchController?.();
              } catch {
              }
              return await e.fetchUpstreamWithRetryLoop({
                ...t,
                isRetry: !0,
                protocolFallbackRetry: !0
              });
            }
            if (!t.retryableStatuses.has(_.status)) return {
              ...S,
              protocolFallbackRetry: t.protocolFallbackRetry === !0
            };
          } else y?.error && (r = y.error);
          try {
            p.body?.cancel?.();
          } catch {
          }
          try {
            m.releaseFetchController?.();
          } catch {
          }
          if (t.execution?.failoverContext?.eligible) {
            const S = e.getFailoverStateSnapshot(t.execution.failoverContext.cacheKey, t.execution.failoverContext.preferredTtlMs);
            o = e.reorderRetryTargetsForFailover(t.execution.failoverContext.originalTargetRecords, S);
          }
        } catch (m) {
          r = m;
          const p = String(m?.code || "").trim().toUpperCase();
          if (![
            "CLIENT_ABORTED",
            "DOWNSTREAM_CANCELLED",
            "REQUEST_ABORTED"
          ].includes(p)) {
            const y = await e.maybeRunForegroundFailoverWait(t, {
              targetRecord: d,
              reason: p || "network_error"
            });
            if (y?.upstream) {
              const S = y.upstream;
              s = S.targetRecord || d, i = S.finalUrl || i;
              const _ = S.response;
              if (_.status === 101) return {
                ...S,
                protocolFallbackRetry: t.protocolFallbackRetry === !0
              };
              if (e.shouldRetryWithProtocolFallback(_, {
                ...t,
                isRetry: !0
              })) {
                try {
                  _.body?.cancel?.();
                } catch {
                }
                try {
                  S.releaseFetchController?.();
                } catch {
                }
                return await e.fetchUpstreamWithRetryLoop({
                  ...t,
                  isRetry: !0,
                  protocolFallbackRetry: !0
                });
              }
              if (!t.retryableStatuses.has(_.status)) return {
                ...S,
                protocolFallbackRetry: t.protocolFallbackRetry === !0
              };
            } else y?.error && (r = y.error);
            if (t.execution?.failoverContext?.eligible) {
              const S = e.getFailoverStateSnapshot(t.execution.failoverContext.cacheKey, t.execution.failoverContext.preferredTtlMs);
              o = e.reorderRetryTargetsForFailover(t.execution.failoverContext.originalTargetRecords, S);
            }
          }
          const g = u === o.length - 1, h = l === c - 1;
          if (g && h)
            throw m && typeof m == "object" && (m.lastFinalUrl = i, m.lastTargetRecord = s, m.lastTargetBase = s?.targetUrl || null), m;
        }
      }
      throw r && typeof r == "object" && (r.lastFinalUrl = i, r.lastTargetRecord = s, r.lastTargetBase = s?.targetUrl || null), r || /* @__PURE__ */ new Error("upstream_fetch_failed");
    }
  };
}
function Op(n = {}, e = {}) {
  const { Logger: a } = n;
  return {
    recordAccessLog(t, r = {}) {
      const o = {
        nodeName: t.nodeName,
        requestPath: t.proxyPath,
        requestMethod: t.requestMethod,
        responseTime: Date.now() - t.startTime,
        clientIp: t.clientIp || "unknown",
        inboundColo: t.logInboundColo || "UNKNOWN",
        outboundColo: r.outboundColo || r.outboundIp || t.defaultOutboundColo || "",
        userAgent: t.request.headers.get("User-Agent"),
        referer: t.request.headers.get("Referer"),
        runtimeConfig: t.currentConfig,
        ...r
      };
      a.record(t.env, t.ctx, o);
    },
    async flushCriticalLogsIfNeeded(t) {
      const r = t?.requestTraits || {};
      if (!(r.isPlaybackInfoRequest === !0 || r.isPlaybackSessionControlRequest === !0)) return;
      const o = t?.currentConfig || {};
      if (o.logEnabled === !1) return;
      const s = Number(o.logWriteDelayMinutes);
      if (Math.max(0, Number.isFinite(s) ? s * 6e4 : O.Defaults.LogFlushDelayMinutes * 6e4) !== 0) return;
      const i = Ht.get(t?.env ? e.getDB(t.env) : null);
      if (i.LogFlushTask) try {
        await i.LogFlushTask;
      } catch {
      }
      if (i.LogQueue.length > 0) try {
        await a.flush(t.env);
      } catch {
      }
    },
    buildOptionsResponse(t) {
      const r = new Headers(t.dynamicCors);
      return Ce(r), t.finalOrigin !== "*" && Or(r, "Origin"), new Response(null, { headers: r });
    }
  };
}
function vp(n = {}, e = {}) {
  return {
    ...Ip(n, e),
    ...Pp(n, e),
    ...xp(n, e),
    ...Op(n, e)
  };
}
function Fp(n = {}, e = {}) {
  const { CacheManager: a } = n, t = new Zc({
    entries: oe.PlaybackInfoResponseCache,
    now: k,
    maxEntries: O.Defaults.PlaybackInfoCacheMax,
    maxEntryBytes: ai,
    maxTotalBytes: ru
  });
  return {
    async prepareExecutionContext(r, o, s, i, c, l, u, d = {}) {
      const f = Date.now(), m = r.method;
      if (a.maybeCleanup(l), !o || !o.target) return { invalidResponse: new Response("Invalid Node", {
        status: 502,
        headers: Ce(new Headers())
      }) };
      const p = F(d.runtimeConfig) ? d.runtimeConfig : await Ae(l), g = d.requestUrl || new URL(r.url), h = d.runtimeRouteContext && typeof d.runtimeRouteContext == "object" ? d.runtimeRouteContext : null, y = typeof h?.requestHost == "string" ? h.requestHost : ee(g.hostname), S = typeof h?.configuredHost == "string" ? h.configuredHost : Ke(l), _ = typeof h?.configuredLegacyHost == "string" ? h.configuredLegacyHost : kr(l), A = tr(d.entryMode || o?.entryMode), b = String(d.routeKindOverride || "").trim(), R = !!(_ && _ !== S && y && y === _), E = {
        requestHost: y,
        configuredHost: S,
        configuredLegacyHost: _,
        isLegacyHostRequest: R,
        routeKind: b || (R ? "legacy_host_kv_route" : A === "host_prefix" ? "host_prefix" : "kv_route")
      }, D = Q(s), w = String(d?.pathNormalizationState?.kind || "").trim(), C = r.headers.get("cf-connecting-ip") || "unknown", T = ea(r), I = C, P = r.cf?.country || "UNKNOWN", U = e.resolveCorsOrigin(p, r), K = _a(l, r, U), G = Ei(d.linkVariant), x = vm(D, g);
      if (x?.error) return { invalidResponse: new Response("Invalid Playback Relay", {
        status: 400,
        headers: Ce(new Headers(K))
      }) };
      const N = g.searchParams.has("__pb_abs") && (!!x || da(D));
      let M = g;
      const L = x?.visibleProxyPath || D, v = x?.targetUrl instanceof URL ? x.targetUrl.pathname : "";
      if (la(L) || v && la(v)) return { invalidResponse: hn(m, K) };
      if ((x || N) && (M = new URL(g)), x) {
        M.searchParams.delete(Ri);
        const re = Sc(g, i, c, L, {
          linkVariant: G,
          entryMode: d.entryMode
        });
        M.pathname = re.pathname;
      }
      N && M.searchParams.delete(Hn);
      const W = Ef(o, p, i), z = e.classifyRequest(r, L, M, p, {
        nodeDirectSource: W,
        directStaticAssets: p.directStaticAssets === !0,
        directHlsDash: p.directHlsDash === !0
      }), H = Vu(o, p), j = Lm(H), ne = H === "rewrite" && x?.targetUrl instanceof URL ? "proxy" : "", fe = G !== "main" ? "link_variant_force_proxy" : ne ? "rewrite_playback_entry_proxy" : "", me = !!fe, le = me ? {
        ...z,
        nodeDirectMedia: !1,
        directStaticAssets: !1,
        directHlsDash: !1,
        legacyEntryOffloadEnabled: !1,
        legacyEntryOffloadReason: "",
        direct307Mode: !1,
        enablePrewarm: p.enablePrewarm !== !1,
        isMetadataCacheable: m === "GET" && z.isWsUpgrade !== !0 && (z.isImage === !0 || z.isSubtitle === !0 || z.isManifest === !0)
      } : z, pe = Cf(p), Pe = p.protocolFallback !== !1, $e = de(p.upstreamTimeoutMs, Yl, 0, 18e4), Lt = de(p.upstreamRetryAttempts, On, 0, 3), tt = p.hedgeFailoverEnabled === !0, Mt = ju(o, p), It = de(p.hedgeProbeTimeoutMs, ho, 250, 1e4), jr = de(p.hedgeProbeParallelism, Qs, 1, 2), Pt = de(p.hedgeWaitTimeoutMs, Zs, 250, 1e4), pr = de(p.hedgeLockTtlMs, ei, 1e3, 1e4), xt = de(p.hedgePreferredTtlSec, Zr, 30, 3600), rt = de(p.hedgeFailureCooldownSec, ti, 1, 300), qr = de(p.hedgeWakeJitterMs, ri, 0, 1e3), Gt = de(p.cacheTtlImages, oi, 0, 365) * 86400, ht = pe.enableH3 === !0, at = pe.forceH1 === !0, Ot = p.playbackInfoCacheEnabled !== !1, yt = de(p.playbackInfoCacheTtlSec, tu, 0, 60), vt = p.videoProgressForwardEnabled !== !1, gr = de(p.videoProgressForwardIntervalSec, ni, 0, 60), jt = Gu(o, p), Ne = Wu(o, p), hr = String(d.nodeCacheRevision || "").trim() || Yn(i, o), Be = le.isMetadataCacheable ? await Nc(r) : "", $ = le.isMetadataCacheable ? Lc(L, {
        imageCacheMaxAge: Gt,
        prewarmCacheTtl: le.prewarmCacheTtl
      }) : "", V = le.isMetadataCacheable && Jn(M) ? xc(M, i, c, L, {
        search: M.search,
        nodeCacheRevision: hr,
        entryMode: d.entryMode,
        identityPartition: Be,
        cachePolicyRevision: $
      }) : null, X = V ? ir() : null, q = Lu(o, p), Y = e.getRoutingDecision({
        phase: "entry",
        request: r,
        requestUrl: M,
        proxyPath: L,
        requestTraits: le,
        currentConfig: p,
        node: o,
        nodeName: i,
        nodeKey: c,
        linkVariant: G,
        forceWorkerProxy: me,
        forceWorkerProxyReason: fe,
        routingDecisionMode: q
      });
      return {
        request: r,
        requestMethod: m,
        node: o,
        nodeName: i,
        nodeKey: c,
        entryMode: A,
        env: l,
        ctx: u,
        startTime: f,
        currentConfig: p,
        rawRequestUrl: g,
        requestUrl: M,
        requestOrigin: g.origin,
        rawProxyPath: D,
        proxyPath: L,
        linkVariant: G,
        forceWorkerProxy: me,
        forceWorkerProxyReason: fe,
        clientIp: I,
        inboundIp: C,
        logInboundColo: T,
        country: P,
        finalOrigin: U,
        dynamicCors: K,
        routeContextDiagnostics: E,
        requestTraits: le,
        protocolStrategy: pe.strategy,
        routingDecisionMode: q,
        entryRoutingDecision: Y,
        enableH3: ht,
        forceH1: at,
        protocolFallback: Pe,
        upstreamTimeoutMs: $e,
        upstreamRetryAttempts: Lt,
        hedgeFailoverEnabled: tt,
        hedgeProbePath: Mt,
        hedgeProbeTimeoutMs: It,
        hedgeProbeParallelism: jr,
        hedgeWaitTimeoutMs: Pt,
        hedgeLockTtlMs: pr,
        hedgePreferredTtlSec: xt,
        hedgeFailureCooldownSec: rt,
        hedgeWakeJitterMs: qr,
        playbackInfoCacheEnabled: Ot,
        playbackInfoCacheTtlSec: yt,
        effectivePlaybackInfoMode: H,
        playbackInfoRewriteUrlMode: j,
        playbackInfoCacheState: le.isPlaybackInfoRequest === !0 ? Ot && yt > 0 ? "miss" : "skip" : "",
        playbackInfoCacheKey: "",
        playbackInfoRewrite: le.isPlaybackInfoRequest === !0 && H === "passthrough" ? "passthrough" : "",
        playbackAbsoluteFallbackEligible: N,
        playbackAbsoluteFallbackLocation: N ? Mm(D, g) : "",
        playbackUrlMode: N ? "absolute" : le.isPlaybackInfoRequest === !0 && H === "rewrite" ? String(j || "relative") : "",
        playbackFallback: N ? "none" : "",
        playbackPathFix: w,
        rewritePlaybackEntry: ne,
        playbackRelayTargetUrl: x?.targetUrl instanceof URL ? x.targetUrl : null,
        targetHotCacheState: String(d.targetHotCacheState || "").trim() || (le.isPlaybackCriticalRequest === !0 ? "miss" : "skip"),
        playbackRouteHotTargetRecords: Array.isArray(d.cachedTargetRecords) ? d.cachedTargetRecords : null,
        videoProgressForwardEnabled: vt,
        videoProgressForwardIntervalSec: gr,
        effectiveRealClientIpMode: jt,
        effectiveMediaAuthMode: Ne,
        nodeDerivedCacheRevision: hr,
        failoverContext: null,
        failoverTelemetry: null,
        failoverForegroundWaitUsed: !1,
        progressForwardMode: "",
        progressForwardSessionKey: "",
        imageCacheMaxAge: Gt,
        metadataCacheKey: V,
        metadataCache: X,
        metadataCacheIdentityPartition: Be,
        metadataCachePolicyRevision: $,
        redirectTrace: null
      };
    },
    cleanupPlaybackInfoResponseCache(r = k()) {
      t.cleanup(r);
    },
    buildPlaybackInfoAuthSignature(r, o = null) {
      const s = r?.requestUrl instanceof URL ? r.requestUrl : null, i = o?.newHeaders || r?.request?.headers || null, c = vo(i), l = Oo(qe(i, "Cookie"), on);
      return Fo([
        s ? ce(s.searchParams.get("api_key") || s.searchParams.get("X-Emby-Token") || s.searchParams.get("X-MediaBrowser-Token") || "") : "",
        c?.token ? ce(c.token) : "",
        c?.deviceId ? ce(c.deviceId) : "",
        qe(i, "Authorization") ? ce(qe(i, "Authorization")) : "",
        qe(i, "X-Emby-Authorization") ? ce(qe(i, "X-Emby-Authorization")) : "",
        qe(i, "X-MediaBrowser-Authorization") ? ce(qe(i, "X-MediaBrowser-Authorization")) : "",
        l ? ce(l) : ""
      ]);
    },
    buildPlaybackInfoCacheKey(r, o = null) {
      if (r?.requestTraits?.isPlaybackInfoRequest !== !0) return "";
      if (r.playbackInfoCacheEnabled !== !0 || Number(r.playbackInfoCacheTtlSec) <= 0)
        return r.playbackInfoCacheState = "skip", r.playbackInfoCacheKey = "", "";
      const s = r.requestMethod;
      if (s !== "GET" && s !== "HEAD" && o?.preparedBodyMode !== "buffered")
        return r.playbackInfoCacheState = "skip", r.playbackInfoCacheKey = "", "";
      const i = o?.preparedBodyMode === "buffered" ? String(o?.preparedBodyText || Zn(o?.preparedBody)) : "", c = `playback-info:${Fo([
        String(r?.nodeName || "").trim(),
        String(r?.nodeDerivedCacheRevision || "").trim(),
        s,
        String(r?.proxyPath || "").trim(),
        String(r?.requestUrl?.search || "").trim(),
        i ? ce(i) : "",
        e.buildPlaybackInfoAuthSignature(r, o),
        $t(r?.effectivePlaybackInfoMode),
        String(r?.playbackInfoRewriteUrlMode || "relative")
      ])}`;
      return r.playbackInfoCacheKey = c, c;
    },
    async storePlaybackInfoResponseCache(r, o, s = null, i = null) {
      if (r?.requestTraits?.isPlaybackInfoRequest !== !0) return !1;
      const c = r.playbackInfoCacheKey || e.buildPlaybackInfoCacheKey(r, s);
      return !c || !Qt(i) || i.response !== o ? !1 : t.set(c, i, {
        nodeName: String(r?.nodeName || "").trim().toLowerCase(),
        nodeRevision: String(r?.nodeDerivedCacheRevision || "").trim(),
        playbackInfoRewrite: String(r?.playbackInfoRewrite || "").trim(),
        ttlMs: Math.max(0, Number(r?.playbackInfoCacheTtlSec) || 0) * 1e3
      });
    },
    async tryServePlaybackInfoResponseCache(r, o = null) {
      if (r?.requestTraits?.isPlaybackInfoRequest !== !0) return null;
      const s = e.buildPlaybackInfoCacheKey(r, o);
      if (!s) return null;
      const i = t.get(s);
      if (!i)
        return r.playbackInfoCacheState = r.playbackInfoCacheState === "skip" ? "skip" : "miss", null;
      const c = i.metadata, l = i.representation, u = l.response, d = l.bodyText;
      r.playbackInfoCacheState = "hit", r.playbackInfoRewrite = String(c?.playbackInfoRewrite || r?.playbackInfoRewrite || "").trim();
      const f = e.buildProxyResponseHeaders(u, r.request, r.dynamicCors, r.finalOrigin, r.requestTraits, {
        enableH3: r.enableH3,
        forceH1: r.forceH1,
        imageCacheMaxAge: r.imageCacheMaxAge
      }), m = e.appendLogDiagnosticDetail(e.extractProxyErrorDetail(u), e.buildRuntimeDiagnosticDetail(r));
      return e.recordAccessLog(r, {
        statusCode: u.status,
        category: e.classifyProxyLogCategory(r.requestTraits),
        errorDetail: m,
        detailJson: e.buildStructuredLogDetail(r, { statusCode: u.status }, {
          deliveryMode: "proxy",
          redirectMode: "playback_info_cache",
          decisionReason: "playback_info_cache_hit",
          playbackInfoCache: r.playbackInfoCacheState,
          playbackInfoCacheTtlSec: r.playbackInfoCacheTtlSec,
          upstreamStatus: u.status
        }),
        outboundColo: ""
      }), new Response(r.requestMethod === "HEAD" ? null : d, {
        status: u.status,
        statusText: u.statusText,
        headers: f
      });
    }
  };
}
function Up(n = {}, e = {}) {
  return {
    parsePlaybackSessionControlPayload(a, t = null) {
      if (a?.playbackSessionControlPayload) return a.playbackSessionControlPayload;
      const r = a?.requestUrl instanceof URL ? a.requestUrl : null, o = {};
      if (r) for (const [u, d] of r.searchParams.entries()) {
        const f = String(u || "").trim().toLowerCase();
        !f || o[f] !== void 0 || (o[f] = d);
      }
      const s = {
        query: o,
        body: {},
        parseError: !1,
        parseMode: "query_only",
        parseErrorReason: ""
      }, i = a.requestMethod;
      if (i === "GET" || i === "HEAD")
        return a && (a.playbackSessionControlPayload = s), s;
      if (t?.preparedBodyMode === "stream")
        return s.parseError = !0, s.parseMode = "stream", s.parseErrorReason = "unbuffered_body", a && (a.playbackSessionControlPayload = s), s;
      const c = String(t?.preparedBodyText || Zn(t?.preparedBody));
      if (!c.trim())
        return a && (a.playbackSessionControlPayload = s), s;
      const l = String(t?.newHeaders?.get("Content-Type") || a?.request?.headers?.get("Content-Type") || "").toLowerCase().split(";", 1)[0].trim();
      try {
        if (l === "application/json" || l === "text/json" || l === "text/plain" || /^application\/[a-z0-9!#$&^_.+-]+\+json$/i.test(l)) {
          const u = JSON.parse(c);
          if (!F(u)) throw new TypeError("playback_control_body_not_object");
          s.body = mi(u), s.parseMode = l === "text/plain" ? "text_plain_json" : "json";
        } else if (l === "application/x-www-form-urlencoded") {
          const u = {};
          for (const [d, f] of new URLSearchParams(c).entries()) {
            const m = String(d || "").trim().toLowerCase();
            !m || u[m] !== void 0 || (u[m] = f);
          }
          s.body = u, s.parseMode = "form";
        } else
          s.parseError = !0, s.parseMode = "unsupported", s.parseErrorReason = "unsupported_content_type";
      } catch {
        s.parseError = !0, s.parseMode = l === "text/plain" ? "text_plain_invalid" : "invalid", s.parseErrorReason = "invalid_body";
      }
      return a && (a.playbackSessionControlPayload = s), s;
    },
    resolvePlaybackProgressSessionKey(a, t = null) {
      const r = e.parsePlaybackSessionControlPayload(a, t), o = (g = []) => {
        const h = Go(r.query, g);
        if (String(h || "").trim()) return String(h).trim();
        const y = Go(r.body, g);
        return String(y || "").trim();
      }, s = o(["SessionId"]), i = o(["PlaySessionId"]), c = o(["DeviceId"]), l = o(["ItemId"]), u = String(a?.nodeName || "unknown").trim().toLowerCase() || "unknown";
      let d = "", f = "", m = "weak";
      if (s)
        d = `session:${s}`, f = `session:${s}`, m = "strong";
      else if (i)
        d = `play:${i}`, f = `play:${i}`, m = "strong";
      else if (c)
        d = `device-item:${c}:${l}`, f = `device:${c}`;
      else {
        const g = a?.request?.headers;
        d = `fallback:${_n([
          g?.get?.("Authorization"),
          g?.get?.("X-Emby-Token"),
          g?.get?.("X-MediaBrowser-Token"),
          g?.get?.("X-Emby-Device-Id"),
          c,
          a?.clientIp,
          l
        ].map((h) => String(h || "").trim()).join("|"))}`, f = d;
      }
      const p = _n(`${u}|${f}`);
      return {
        sessionKey: `${u}|${d}`,
        sessionIdentityFingerprint: p,
        sessionFingerprint: _n(`${p}|${l}`),
        sessionStrength: m,
        itemId: l,
        parseError: r.parseError === !0
      };
    }
  };
}
function Hp(n = {}, e = {}) {
  const { CacheManager: a } = n;
  return {
    buildPlaybackProgressRelayEntry(t = 0, r = null) {
      return {
        lastForwardAt: 0,
        lastTouchedAt: k(),
        intervalMs: Math.max(0, Number(t) || 0),
        waitUntilCtx: r || null,
        nodeName: "",
        nodeRevision: "",
        pendingSnapshot: null,
        scheduledFlushAt: 0,
        scheduledPromise: null,
        activeFlushPromise: null,
        terminalState: "",
        terminalAt: 0,
        terminalTombstoneUntil: 0
      };
    },
    getPlaybackProgressRelayTerminalTtlMs(t = 0) {
      return Math.max(600 * 1e3, Math.max(1, Number(t) || 0) * 20);
    },
    isPlaybackProgressRelayTerminal(t, r = k()) {
      return !t || String(t.terminalState || "").trim().toLowerCase() !== "stopped" ? !1 : Number(t.terminalTombstoneUntil || 0) > r;
    },
    markPlaybackProgressRelayStopped(t, r) {
      const o = oe.PlaybackProgressRelay;
      if (!(o instanceof Map) || !t) return null;
      const s = Math.max(0, Number(r?.videoProgressForwardIntervalSec) || 0) * 1e3, i = o.get(t) || e.buildPlaybackProgressRelayEntry(s, r?.ctx || null), c = k();
      return i.intervalMs = s > 0 ? s : Math.max(0, Number(i.intervalMs) || 0), i.waitUntilCtx = r?.ctx || i.waitUntilCtx || null, i.nodeName = String(r?.nodeName || i.nodeName || "").trim().toLowerCase(), i.nodeRevision = String(r?.nodeDerivedCacheRevision || i.nodeRevision || "").trim(), i.pendingSnapshot = null, i.scheduledFlushAt = 0, i.terminalState = "stopped", i.terminalAt = c, i.terminalTombstoneUntil = c + e.getPlaybackProgressRelayTerminalTtlMs(i.intervalMs), i.lastTouchedAt = c, ys(t, i), i;
    },
    cleanupPlaybackProgressRelay(t = k()) {
      const r = oe.PlaybackProgressRelay;
      if (!(r instanceof Map) || r.size <= 0) return;
      const o = Math.max(3e4, Math.max(1, Number(ni) || 1) * 2e4);
      for (const [i, c] of r) {
        const l = Number(c?.lastTouchedAt || c?.lastForwardAt || 0) || 0, u = !!c?.pendingSnapshot || !!c?.activeFlushPromise, d = Number(c?.terminalTombstoneUntil || 0) || 0;
        if (d > 0) {
          !u && d <= t && ra(i);
          continue;
        }
        !u && l > 0 && l + o <= t && ra(i);
      }
      const s = Math.max(1, Number(O.Defaults.VideoProgressForwardSessionMax) || 1);
      for (; r.size > s; ) {
        const i = r.keys().next().value;
        if (!i) break;
        ra(i);
      }
    },
    buildPlaybackProgressSnapshot(t, r, o, s) {
      if (!t || !r || typeof o != "function" || !Je(s) || (r.preparedBodyMode === "buffered" && Number(r.preparedBody?.byteLength) || 0) > au) return null;
      const i = r.preparedBodyMode === "buffered" && r.preparedBody ? r.preparedBody.slice(0) : r.preparedBody;
      return {
        ctx: t.ctx,
        nodeName: String(t.nodeName || "").trim().toLowerCase(),
        nodeRevision: String(t.nodeDerivedCacheRevision || "").trim(),
        targetRecord: s,
        proxyPath: String(t.proxyPath || "/"),
        requestUrl: new URL(t.requestUrl.toString()),
        buildFetchOptions: o,
        requestMethod: String(t.request?.method || "POST").toUpperCase(),
        preparedBodyMode: r.preparedBodyMode,
        preparedBody: i,
        upstreamTimeoutMs: t.upstreamTimeoutMs
      };
    },
    schedulePlaybackProgressRelayFlush(t, r) {
      if (!r?.pendingSnapshot || r?.scheduledFlushAt > 0 || e.isPlaybackProgressRelayTerminal(r)) return;
      const o = Math.max(0, Number(r.intervalMs) || 0);
      if (o <= 0) return;
      const s = Math.max(k(), Number(r.lastForwardAt) || 0) + o;
      r.scheduledFlushAt = s, r.lastTouchedAt = k();
      const i = (async () => {
        await so(Math.max(0, s - k()));
        const l = oe.PlaybackProgressRelay.get(t);
        !l || l !== r || Number(l.scheduledFlushAt) !== s || (l.scheduledFlushAt = 0, await e.flushPlaybackProgressRelayEntry(t, {
          background: !0,
          attachToCtx: !1
        }));
      })();
      r.scheduledPromise = i;
      const c = r.waitUntilCtx || r.pendingSnapshot?.ctx || null;
      c?.waitUntil && c.waitUntil(i);
    },
    async forwardPlaybackProgressSnapshot(t) {
      if (!t) return null;
      const r = await e.performUpstreamFetch(t.targetRecord, t.proxyPath, t.requestUrl, t.buildFetchOptions, {
        method: t.requestMethod,
        bodyMode: t.preparedBodyMode,
        body: t.preparedBody,
        timeoutMs: t.upstreamTimeoutMs
      });
      try {
        try {
          await r.response.body?.cancel?.();
        } catch {
        }
      } finally {
        try {
          r.releaseFetchController?.();
        } catch {
        }
      }
      return r.response;
    },
    async flushPlaybackProgressRelayEntry(t, r = {}) {
      const o = oe.PlaybackProgressRelay, s = o.get(t);
      if (!s || e.isPlaybackProgressRelayTerminal(s)) return !1;
      if (s.activeFlushPromise) {
        if (r.background === !0) return !1;
        try {
          await s.activeFlushPromise;
        } catch {
        }
      }
      if (!s.pendingSnapshot) return !1;
      const i = s.pendingSnapshot;
      s.pendingSnapshot = null, s.scheduledFlushAt = 0, s.lastForwardAt = k(), s.lastTouchedAt = s.lastForwardAt;
      const c = (async () => {
        try {
          return await e.forwardPlaybackProgressSnapshot(i), !0;
        } catch {
          const l = o.get(t);
          return l && l === s && !l.pendingSnapshot && (l.pendingSnapshot = i, l.lastForwardAt = k(), l.lastTouchedAt = l.lastForwardAt), !1;
        } finally {
          const l = o.get(t);
          if (!l || l !== s) return;
          l.activeFlushPromise = null, l.lastTouchedAt = k(), l.pendingSnapshot && e.schedulePlaybackProgressRelayFlush(t, l);
        }
      })();
      return s.activeFlushPromise = c, r.attachToCtx === !0 && s.waitUntilCtx?.waitUntil && s.waitUntilCtx.waitUntil(c), await c === !0;
    },
    async flushPlaybackProgressBeforeStopped(t) {
      const r = String(t?.progressForwardSessionKey || "").trim();
      if (!r) return !1;
      const o = oe.PlaybackProgressRelay.get(r);
      if (!o) return !1;
      if (o.activeFlushPromise) try {
        await o.activeFlushPromise;
      } catch {
      }
      return o.pendingSnapshot ? (o.scheduledFlushAt = 0, await e.flushPlaybackProgressRelayEntry(r, {
        background: !1,
        attachToCtx: !1
      })) : !1;
    },
    buildPlaybackProgressThrottleResponse(t) {
      const r = e.buildEdgeResponseHeaders(t.finalOrigin), o = e.buildProgressRelayDiagnosticDetail(t);
      return e.recordAccessLog(t, {
        statusCode: 204,
        category: e.classifyProxyLogCategory(t.requestTraits),
        errorDetail: o,
        detailJson: e.buildStructuredLogDetail(t, { statusCode: 204 }, {
          deliveryMode: "proxy",
          redirectMode: "progress_relay",
          decisionReason: t.progressForwardMode || "progress_relay_throttled",
          progressRelayMode: t.progressForwardMode,
          progressIntervalSec: t.videoProgressForwardIntervalSec,
          upstreamStatus: 204
        }),
        outboundColo: t.defaultOutboundColo || ""
      }), new Response(null, {
        status: 204,
        statusText: "No Content",
        headers: r
      });
    },
    async maybeHandlePlaybackProgressRelay(t, r, o, s = []) {
      if (t?.requestTraits?.isPlaybackSessionControlRequest !== !0) return null;
      const i = Math.max(0, Number(t?.videoProgressForwardIntervalSec) || 0);
      if (t?.videoProgressForwardEnabled !== !0 || i <= 0 || !t?.ctx?.waitUntil)
        return t.progressForwardMode = "pass_through", null;
      const c = e.resolvePlaybackProgressSessionKey(t, r);
      if (t.progressForwardSessionKey = String(c.sessionKey || "").trim(), c.parseError)
        return t.progressForwardMode = "parse_bypass", null;
      if (t.requestTraits.isPlaybackStartedRequest === !0)
        return t.progressForwardMode = "started_passthrough", t.progressForwardSessionKey && ra(t.progressForwardSessionKey), null;
      if (t.requestTraits.isPlaybackStoppedRequest === !0)
        return t.progressForwardMode = await e.flushPlaybackProgressBeforeStopped(t) ? "flush_before_stopped" : "stopped_passthrough", t.progressForwardSessionKey && e.markPlaybackProgressRelayStopped(t.progressForwardSessionKey, t), null;
      if (t.requestTraits.isPlaybackProgressRequest !== !0) return null;
      const l = Je(s[0]) ? s[0] : null;
      if (!l)
        return t.progressForwardMode = "pass_through", null;
      if (t.requestMethod !== "GET" && t.requestMethod !== "HEAD" && r?.preparedBodyMode !== "buffered")
        return t.progressForwardMode = "unbuffered_bypass", null;
      const u = oe.PlaybackProgressRelay;
      e.cleanupPlaybackProgressRelay();
      const d = t.progressForwardSessionKey || `fallback:${t.clientIp}:${t.proxyPath}`;
      let f = u.get(d);
      f || (f = e.buildPlaybackProgressRelayEntry(i * 1e3, t.ctx)), f.intervalMs = i * 1e3, f.waitUntilCtx = t.ctx, f.nodeName = String(t.nodeName || "").trim().toLowerCase(), f.nodeRevision = String(t.nodeDerivedCacheRevision || "").trim();
      const m = k();
      if (f.lastTouchedAt = m, e.isPlaybackProgressRelayTerminal(f, m))
        return t.progressForwardMode = "late_progress_dropped_after_stopped", e.buildPlaybackProgressThrottleResponse(t);
      if (f.terminalState = "", f.terminalAt = 0, f.terminalTombstoneUntil = 0, ys(d, f), !(f.lastForwardAt > 0 && m - f.lastForwardAt < f.intervalMs) && !f.activeFlushPromise && !f.pendingSnapshot)
        return f.pendingSnapshot = null, f.scheduledFlushAt = 0, f.lastForwardAt = m, t.progressForwardMode = "forward_now", null;
      const p = e.buildPlaybackProgressSnapshot(t, r, o, l);
      return p ? (f.pendingSnapshot = p, f.lastTouchedAt = m, t.progressForwardMode = "throttled_204", e.schedulePlaybackProgressRelayFlush(d, f), e.buildPlaybackProgressThrottleResponse(t)) : (t.progressForwardMode = "snapshot_bypass", null);
    }
  };
}
function kp(n = {}, e = {}) {
  return {
    ...Fp(n, e),
    ...Up(n, e),
    ...Hp(n, e)
  };
}
function Kp(n = {}, e = {}) {
  const { nodeRepository: a } = n;
  return {
    resolveCorsOrigin(t, r) {
      const o = r.headers.get("Origin"), s = Ts(t);
      return s.corsOrigins.length > 0 ? o && s.corsOriginSet.has(o) ? o : s.corsOrigins[0] : o || "*";
    },
    buildEdgeResponseHeaders(t, r = {}) {
      const o = new Headers({
        "Access-Control-Allow-Origin": t,
        "Cache-Control": "no-store",
        ...r
      });
      return Ce(o), o;
    },
    classifyRequest(t, r, o, s, i = {}) {
      const c = t.method, l = t.headers.get("Range"), u = t.headers.get("If-Range"), d = $r.test(r) || zr.test(r), f = su.test(r), m = dr.test(r), p = mt.test(r), g = ci.test(r), h = Ao(r), y = t.headers.get("Upgrade")?.toLowerCase() === "websocket", S = Ki(r), _ = zi(r), A = $i(r), b = Md(r), R = _ || A || b, E = iu.test(r) || /\/videos\/[^/]+\/(stream|original|download|file)/i.test(r) || /\/items\/[^/]+\/download/i.test(r) || o.searchParams.get("Static") === "true" || o.searchParams.get("Download") === "true", D = c === "GET" || c === "HEAD", w = E && !p && !g && !m && !d, C = S || h || w || p || g, T = !d && !f && !m && !p && !g && !h && !w && !y, I = i.nodeDirectSource === !0 && D && w, P = i.directStaticAssets === !0 && D && f, U = i.directHlsDash === !0 && D && (p || g), K = I ? "entry_direct_media" : P ? "entry_direct_static_asset" : U ? "entry_direct_hls_dash" : "", G = !!K, x = G;
      return {
        rangeHeader: l,
        ifRangeHeader: u,
        enablePrewarm: s.enablePrewarm !== !1 && !G,
        prewarmCacheTtl: de(s.prewarmCacheTtl, eu, 0, 3600),
        prewarmDepth: Ti(s.prewarmDepth),
        isImage: d,
        isStaticFile: f,
        isSubtitle: m,
        isManifest: p,
        isSegment: g,
        isSmartStrmMedia: h,
        isWsUpgrade: y,
        looksLikeVideoRoute: E,
        isBigStream: w,
        isPlaybackCriticalRequest: C,
        isApiRequest: T,
        isPlaybackInfoRequest: S,
        isPlaybackProgressRequest: _,
        isPlaybackStoppedRequest: A,
        isPlaybackStartedRequest: b,
        isPlaybackSessionControlRequest: R,
        isMetadataCacheable: c === "GET" && !y && !G && (d || m || p),
        isCacheableAsset: c === "GET" && !y && (d || f || m || g || p),
        nodeDirectMedia: I,
        directStaticAssets: P,
        directHlsDash: U,
        legacyEntryOffloadEnabled: G,
        legacyEntryOffloadReason: K,
        canStripAuthOnProtocolFallback: D && !T && (h || w || p || g),
        direct307Mode: x
      };
    },
    isEntryDirectDataPlaneMode(t) {
      const r = String(t || "").trim();
      return r === "entry_direct" || r === "legacy_entry_offload";
    },
    buildRoutingDecision(t = {}) {
      const r = String(t.action || "PROXY").trim().toUpperCase() === "DIRECT" ? "DIRECT" : "PROXY", o = String(t.phase || "unknown").trim() || "unknown", s = String(t.reason || "").trim() || (r === "DIRECT" ? "direct" : "proxy"), i = String(t.traceAction || (r === "DIRECT" ? "direct" : "proxy")).trim() || (r === "DIRECT" ? "direct" : "proxy"), c = String(t.traceLabel || s).trim() || s, l = Number(t.redirectStatus);
      return {
        phase: o,
        action: r,
        dataPlaneMode: String(t.dataPlaneMode || "").trim() || (r === "DIRECT" ? "redirect_direct" : "worker_proxy"),
        nextMethod: t.nextMethod || null,
        nextBodyMode: t.nextBodyMode || "none",
        isSameOriginRedirect: t.isSameOriginRedirect === !0,
        preserveWorkerProxy: t.preserveWorkerProxy === !0,
        reason: s,
        traceAction: i,
        redirectStatus: Number.isFinite(l) && l > 0 ? Math.floor(l) : 0,
        traceLabel: c
      };
    },
    buildLegacyEntryRoutingDecision(t = {}) {
      if (t.legacyEntryOffloadEnabled === !0) {
        const r = String(t.legacyEntryOffloadReason || "entry_direct").trim() || "entry_direct";
        return e.buildRoutingDecision({
          phase: "entry",
          action: "DIRECT",
          dataPlaneMode: "entry_direct",
          reason: r,
          traceAction: "direct",
          redirectStatus: 307,
          traceLabel: r
        });
      }
      return e.buildRoutingDecision({
        phase: "entry",
        action: "PROXY",
        dataPlaneMode: "worker_proxy",
        reason: "worker_proxy",
        traceAction: "proxy",
        traceLabel: "worker_proxy"
      });
    },
    buildSimplifiedEntryRoutingDecision(t = {}) {
      const r = t.requestTraits || {}, o = r.nodeDirectMedia ? "entry_direct_media" : r.directStaticAssets ? "entry_direct_static_asset" : r.directHlsDash ? "entry_direct_hls_dash" : "";
      return o ? e.buildRoutingDecision({
        phase: "entry",
        action: "DIRECT",
        dataPlaneMode: "entry_direct",
        reason: o,
        traceAction: "direct",
        redirectStatus: 307,
        traceLabel: o
      }) : e.buildRoutingDecision({
        phase: "entry",
        action: "PROXY",
        dataPlaneMode: "worker_proxy",
        reason: "worker_proxy",
        traceAction: "proxy",
        traceLabel: "worker_proxy"
      });
    },
    getRoutingDecision(t = {}) {
      const r = String(t.phase || "").trim().toLowerCase();
      return r === "entry" ? e.getEntryRoutingDecision(t) : r === "redirect" ? e.getRedirectRoutingDecision(t) : e.buildRoutingDecision({
        phase: r || "unknown",
        action: "PROXY",
        dataPlaneMode: "worker_proxy",
        reason: "unsupported_phase",
        traceAction: "proxy",
        traceLabel: "unsupported_phase"
      });
    },
    getEntryRoutingDecision(t = {}) {
      if (t.forceWorkerProxy === !0) {
        const r = String(t.forceWorkerProxyReason || "").trim() || "link_variant_force_proxy";
        return e.buildRoutingDecision({
          phase: "entry",
          action: "PROXY",
          dataPlaneMode: "worker_proxy",
          reason: r,
          traceAction: "proxy",
          traceLabel: r
        });
      }
      return Lr(t.routingDecisionMode) === "legacy" ? e.buildLegacyEntryRoutingDecision(t.requestTraits) : e.buildSimplifiedEntryRoutingDecision(t);
    },
    buildSimplifiedRedirectRoutingDecision(t, r, o, s, i = {}, c = {}) {
      const l = t.origin === r.origin, u = i.forceVideoDirect === !0, d = i.forceVideoProxy === !0, f = Af(i.currentStatus, o);
      let m = s;
      if ((f === "GET" || f === "HEAD") && (m = "none"), c.forceWorkerProxy === !0) {
        const p = String(c.forceWorkerProxyReason || "").trim() || "link_variant_force_proxy";
        return e.buildRoutingDecision({
          phase: c.phase || "redirect",
          action: "PROXY",
          dataPlaneMode: "worker_proxy_follow",
          nextMethod: f,
          nextBodyMode: m,
          isSameOriginRedirect: l,
          preserveWorkerProxy: !1,
          reason: p,
          traceAction: "proxy",
          redirectStatus: c.redirectStatus || i.currentStatus,
          traceLabel: p
        });
      }
      return u ? e.buildRoutingDecision({
        phase: c.phase || "redirect",
        action: "DIRECT",
        dataPlaneMode: "redirect_direct",
        nextBodyMode: s,
        isSameOriginRedirect: l,
        preserveWorkerProxy: !1,
        reason: "node_video_direct",
        traceAction: "direct",
        redirectStatus: c.redirectStatus || i.currentStatus,
        traceLabel: "node_video_direct"
      }) : s === "stream" ? e.buildRoutingDecision({
        phase: c.phase || "redirect",
        action: "DIRECT",
        dataPlaneMode: "redirect_direct",
        nextBodyMode: s,
        isSameOriginRedirect: l,
        preserveWorkerProxy: !1,
        reason: "stream_body_direct",
        traceAction: "direct",
        redirectStatus: c.redirectStatus || i.currentStatus,
        traceLabel: "stream_body_direct"
      }) : e.buildRoutingDecision({
        phase: c.phase || "redirect",
        action: "PROXY",
        dataPlaneMode: "worker_proxy_follow",
        nextMethod: f,
        nextBodyMode: m,
        isSameOriginRedirect: l,
        preserveWorkerProxy: !1,
        reason: "proxy_follow",
        traceAction: "proxy",
        redirectStatus: c.redirectStatus || i.currentStatus,
        traceLabel: d ? "node_video_proxy" : "proxy_follow"
      });
    },
    getRedirectRoutingDecision(t = {}) {
      return e.buildSimplifiedRedirectRoutingDecision(t.nextUrl, t.activeTargetBase, t.redirectMethod, t.redirectBodyMode, t.policy, {
        phase: "redirect",
        forceWorkerProxy: t.forceWorkerProxy === !0,
        forceWorkerProxyReason: t.forceWorkerProxyReason,
        redirectStatus: t.currentStatus || t.policy?.currentStatus
      });
    },
    evaluateFirewall(t, r, o, s) {
      const i = Ts(t);
      return i.ipBlacklist.has(r) ? new Response("Forbidden by IP Firewall", {
        status: 403,
        headers: e.buildEdgeResponseHeaders(s)
      }) : i.geoAllowlist.size > 0 && !i.geoAllowlist.has(o) || i.geoBlocklist.size > 0 && i.geoBlocklist.has(o) ? new Response("Forbidden by Geo Firewall", {
        status: 403,
        headers: e.buildEdgeResponseHeaders(s)
      }) : null;
    },
    applyRateLimit(t, r, o, s, i) {
      const c = parseInt(t.rateLimitRpm) || 0;
      if (!(c > 0 && o.isPlaybackCriticalRequest !== !0)) return null;
      let l = Xe.RateLimitCache.get(r);
      return (!l || s > l.resetAt) && (l = {
        count: 0,
        resetAt: s + 6e4
      }), l.count += 1, Ie(Xe.RateLimitCache, r, l, O.Defaults.RateLimitCacheMax), l.count > c ? new Response("Rate Limit Exceeded", {
        status: 429,
        headers: e.buildEdgeResponseHeaders(i)
      }) : null;
    },
    parseTargetRecords(t, r, o = {}) {
      const s = Array.isArray(o.cachedTargetRecords) ? o.cachedTargetRecords : [];
      if (s.length > 0 && s.every(Je)) return {
        targetRecords: s,
        invalidResponse: null
      };
      const i = a.getOrderedNodeLines(t), c = (i.length ? i.map((l) => l.target) : String(t.target || "").split(",").map((l) => l.trim()).filter(Boolean)).map((l) => un(l)).filter(Je);
      return c.length ? {
        targetRecords: c,
        invalidResponse: null
      } : {
        targetRecords: c,
        invalidResponse: new Response("Invalid Node Target", {
          status: 502,
          headers: e.buildEdgeResponseHeaders(r)
        })
      };
    }
  };
}
function zp(n = {}, e = {}) {
  const { nodeRepository: a } = n;
  return {
    ensureFailoverTelemetry(t) {
      const r = t?.failoverTelemetry && typeof t.failoverTelemetry == "object" ? t.failoverTelemetry : {};
      return r.overlay = String(r.overlay || "").trim(), r.probeReason = String(r.probeReason || "").trim(), r.probeWinner = String(r.probeWinner || "").trim(), r.probeElapsedMs = Math.max(0, Math.round(Number(r.probeElapsedMs) || 0)), r.waitJoinMs = Math.max(0, Math.round(Number(r.waitJoinMs) || 0)), r.demotedTarget = String(r.demotedTarget || "").trim(), r.preferredTarget = String(r.preferredTarget || "").trim(), r.fastFailReason = String(r.fastFailReason || "").trim(), t && typeof t == "object" && (t.failoverTelemetry = r), r;
    },
    isFailoverEligible(t, r = []) {
      return t?.hedgeFailoverEnabled !== !0 ? {
        eligible: !1,
        reason: "disabled"
      } : t.requestMethod !== "GET" && t.requestMethod !== "HEAD" ? {
        eligible: !1,
        reason: "non_idempotent"
      } : t?.requestTraits?.isWsUpgrade === !0 ? {
        eligible: !1,
        reason: "websocket"
      } : t?.playbackRelayTargetUrl instanceof URL ? {
        eligible: !1,
        reason: "absolute_target"
      } : Fu(r) < 2 ? {
        eligible: !1,
        reason: "single_target"
      } : {
        eligible: !0,
        reason: "eligible"
      };
    },
    buildFailoverCacheKey(t, r, o) {
      return [
        String(t || "").toLowerCase().trim(),
        String(r || "").trim(),
        String(o || "").trim()
      ].filter(Boolean).join(":");
    },
    pruneFailoverStateEntry(t, r = Zr * 1e3, o = k()) {
      if (!t || typeof t != "object") return null;
      t.failingTargets instanceof Map || (t.failingTargets = /* @__PURE__ */ new Map());
      for (const [d, f] of t.failingTargets) Number(f) <= o && t.failingTargets.delete(d);
      Number(t.preferredTargetExpiresAt) <= o && (t.preferredTargetKey = "", t.preferredTargetExpiresAt = 0);
      const s = Number(t.lastProbeResult?.completedAt) || 0;
      t.lastProbeResult && s > 0 && s + Math.max(1e3, Number(r) || 0) <= o && (t.lastProbeResult = null), t.inFlightProbe && Number(t.inFlightProbe.expiresAt) <= o && (t.inFlightProbe = null);
      const i = !!String(t.preferredTargetKey || "").trim(), c = t.failingTargets.size > 0, l = !!t.inFlightProbe, u = !!t.lastProbeResult;
      return i || c || l || u ? t : null;
    },
    getOrCreateFailoverStateEntry(t, r = Zr * 1e3) {
      const o = String(t || "").trim();
      if (!o) return null;
      const s = oe.ProxyFailoverStateCache;
      let i = s.get(o);
      (!i || typeof i != "object") && (i = {
        preferredTargetKey: "",
        preferredTargetExpiresAt: 0,
        failingTargets: /* @__PURE__ */ new Map(),
        inFlightProbe: null,
        lastProbeResult: null
      });
      const c = e.pruneFailoverStateEntry(i, r, k()) || i;
      return Ie(s, o, c, ar), c;
    },
    getFailoverStateSnapshot(t, r = Zr * 1e3) {
      const o = String(t || "").trim();
      if (!o) return null;
      const s = oe.ProxyFailoverStateCache, i = s.get(o);
      if (!i) return null;
      const c = e.pruneFailoverStateEntry(i, r, k());
      return c ? (qa(s, o), {
        preferredTargetKey: String(c.preferredTargetKey || "").trim(),
        failingTargetKeys: [...c.failingTargets.keys()].map((l) => String(l || "").trim()).filter(Boolean),
        probeWinnerTargetKey: String(c.lastProbeResult?.status || "") === "ok" ? String(c.lastProbeResult?.winnerTargetKey || "").trim() : "",
        lastProbeResult: c.lastProbeResult && typeof c.lastProbeResult == "object" ? { ...c.lastProbeResult } : null,
        inFlightProbe: c.inFlightProbe ? {
          startedAt: Number(c.inFlightProbe.startedAt) || 0,
          reason: String(c.inFlightProbe.reason || "").trim()
        } : null
      }) : (s.delete(o), null);
    },
    buildFailoverStateSummary(t) {
      const r = t?.failoverContext && typeof t.failoverContext == "object" ? t.failoverContext : null, o = e.ensureFailoverTelemetry(t), s = r?.cacheKey ? e.getFailoverStateSnapshot(r.cacheKey, r.preferredTtlMs) : null;
      return {
        enabled: r?.enabled === !0,
        eligible: r?.eligible === !0,
        cacheKey: String(r?.cacheKey || "").trim() || null,
        reason: String(r?.eligibilityReason || "").trim() || null,
        overlay: String(o.overlay || "").trim() || null,
        preferredTarget: String(o.preferredTarget || s?.preferredTargetKey || "").trim() || null,
        probeWinner: String(o.probeWinner || s?.probeWinnerTargetKey || "").trim() || null,
        demotedTargets: Array.isArray(s?.failingTargetKeys) ? s.failingTargetKeys : [],
        inFlight: s?.inFlightProbe ? { reason: String(s.inFlightProbe.reason || "").trim() || null } : null
      };
    },
    buildFailoverDiagnosticDetail(t) {
      const r = t?.failoverContext && typeof t.failoverContext == "object" ? t.failoverContext : null;
      if (!r?.enabled) return "";
      const o = e.ensureFailoverTelemetry(t), s = e.buildFailoverStateSummary(t), i = [`Failover=${String(o.overlay || r.eligibilityReason || "ready").trim() || "ready"}`];
      return s.preferredTarget && i.push(`PreferredTarget=${s.preferredTarget}`), o.demotedTarget && i.push(`DemotedTarget=${o.demotedTarget}`), o.probeWinner && i.push(`ProbeWinner=${o.probeWinner}`), o.waitJoinMs > 0 && i.push(`WaitJoin=${o.waitJoinMs}ms`), o.fastFailReason && i.push(`FastFail=${o.fastFailReason}`), i.join(" | ");
    },
    reorderRetryTargetsForFailover(t, r = {}) {
      const o = Array.isArray(t) ? t.slice() : [];
      if (o.length <= 1) return o;
      const s = new Set((Array.isArray(r?.failingTargetKeys) ? r.failingTargetKeys : []).map((m) => String(m || "").trim()).filter(Boolean)), i = String(r?.preferredTargetKey || "").trim(), c = String(r?.probeWinnerTargetKey || "").trim(), l = i && !s.has(i) ? i : c && !s.has(c) ? c : "";
      if (!l && s.size <= 0) return o;
      const u = [], d = [], f = [];
      for (const m of o) {
        const p = Ve(m);
        if (l && p === l && u.length <= 0 && !s.has(p)) {
          u.push(m);
          continue;
        }
        if (s.has(p)) {
          f.push(m);
          continue;
        }
        d.push(m);
      }
      return [
        ...u,
        ...d,
        ...f
      ];
    },
    prepareFailoverOverlay(t, r = []) {
      const o = e.ensureFailoverTelemetry(t), s = vu(r), i = Math.max(1e3, (Number(t?.hedgePreferredTtlSec) || Zr) * 1e3), c = e.isFailoverEligible(t, r), l = e.buildFailoverCacheKey(t?.nodeName, s, t?.nodeDerivedCacheRevision), u = c.eligible ? e.getFailoverStateSnapshot(l, i) : null, d = c.eligible ? e.reorderRetryTargetsForFailover(r, u) : Array.isArray(r) ? r.slice() : [];
      let f = "disabled";
      return t?.hedgeFailoverEnabled === !0 && (c.eligible ? u?.preferredTargetKey ? f = "preferred_reordered" : u?.probeWinnerTargetKey ? f = "probe_hint_reordered" : Array.isArray(u?.failingTargetKeys) && u.failingTargetKeys.length > 0 ? f = "failure_demoted" : f = "ready" : f = c.reason || "ineligible"), o.overlay = f, o.preferredTarget = String(u?.preferredTargetKey || "").trim(), t.failoverContext = {
        enabled: t?.hedgeFailoverEnabled === !0,
        eligible: c.eligible,
        eligibilityReason: c.reason,
        cacheKey: l,
        orderedTargetSignature: s,
        preferredTtlMs: i,
        probePath: ba(t?.hedgeProbePath, Js),
        probeTimeoutMs: Math.max(250, Number(t?.hedgeProbeTimeoutMs) || ho),
        probeParallelism: Math.max(1, Math.min(2, Number(t?.hedgeProbeParallelism) || Qs)),
        waitTimeoutMs: Math.max(250, Number(t?.hedgeWaitTimeoutMs) || Zs),
        lockTtlMs: Math.max(1e3, Number(t?.hedgeLockTtlMs) || ei),
        failureCooldownMs: Math.max(1e3, (Number(t?.hedgeFailureCooldownSec) || ti) * 1e3),
        wakeJitterMs: Math.max(0, Number(t?.hedgeWakeJitterMs) || ri),
        originalTargetRecords: Array.isArray(r) ? r.slice() : [],
        retryTargetRecords: d.slice(),
        snapshot: u
      }, d;
    },
    maybeInvalidateHotSnapshotOnFailover(t, r) {
      if (String(t?.targetHotCacheState || "").trim() !== "hit") return;
      const o = Ve(r);
      o && (Array.isArray(t?.playbackRouteHotTargetRecords) ? t.playbackRouteHotTargetRecords : []).map((s) => Ve(s)).filter(Boolean).includes(o) && a.invalidatePlaybackRouteHotCache(t?.nodeName, t?.env);
    },
    markFailoverTargetFailure(t, r, o = "", s = {}) {
      const i = t?.failoverContext;
      if (!i?.eligible) return;
      const c = Ve(r);
      if (!c) return;
      const l = e.ensureFailoverTelemetry(t), u = e.getOrCreateFailoverStateEntry(i.cacheKey, i.preferredTtlMs);
      u && (u.failingTargets.set(c, k() + i.failureCooldownMs), String(u.preferredTargetKey || "").trim() === c && (u.preferredTargetKey = "", u.preferredTargetExpiresAt = 0), Ie(oe.ProxyFailoverStateCache, i.cacheKey, u, ar), l.overlay = String(s.overlay || "target_demoted").trim() || "target_demoted", l.demotedTarget = c, l.fastFailReason = String(o || s.fastFailReason || l.fastFailReason || "").trim(), e.maybeInvalidateHotSnapshotOnFailover(t, r));
    },
    markFailoverBusinessSuccess(t, r, o = {}) {
      const s = t?.failoverContext;
      if (!s?.eligible) return;
      const i = Number(o.status) || 0;
      if (!(i >= 200 && i < 300 || i === 206 || i >= 300 && i < 400)) return;
      const c = Ve(r);
      if (!c) return;
      const l = e.ensureFailoverTelemetry(t), u = e.getOrCreateFailoverStateEntry(s.cacheKey, s.preferredTtlMs);
      u && (u.failingTargets.delete(c), u.preferredTargetKey = c, u.preferredTargetExpiresAt = k() + s.preferredTtlMs, Ie(oe.ProxyFailoverStateCache, s.cacheKey, u, ar), l.overlay = String(o.overlay || "preferred_promoted").trim() || "preferred_promoted", l.preferredTarget = c);
    },
    getFailoverProbeCandidates(t, r = {}) {
      const o = t?.failoverContext;
      if (!o?.eligible) return [];
      const s = e.getFailoverStateSnapshot(o.cacheKey, o.preferredTtlMs), i = e.reorderRetryTargetsForFailover(o.originalTargetRecords, s), c = /* @__PURE__ */ new Set(), l = /* @__PURE__ */ new Set(), u = Ve(r.failedTargetRecord), d = Ve(r.activeTargetRecord), f = String(r.excludeTargetKey || "").trim();
      return u && c.add(u), d && c.add(d), f && c.add(f), i.filter((m) => {
        const p = Ve(m);
        return !p || c.has(p) || l.has(p) ? !1 : (l.add(p), !0);
      }).slice(0, o.probeParallelism);
    }
  };
}
function $p(n = {}, e = {}) {
  return {
    buildFailoverProbeHeaders() {
      return new Headers({
        Accept: "*/*",
        "Cache-Control": "no-store",
        Pragma: "no-cache"
      });
    },
    async performFailoverProbeRequest(a, t, r, o, s = null) {
      const i = Cp([
        a?.request?.signal,
        a?.requestLifecycle?.signal,
        s
      ]);
      let c = null, l = !1;
      try {
        return o > 0 && (c = setTimeout(() => {
          l = !0, i.abort(`probe_timeout_${o}ms`);
        }, o)), await Oe(t.toString(), {
          method: r,
          headers: e.buildFailoverProbeHeaders(),
          redirect: "manual",
          signal: i.signal
        });
      } catch (u) {
        if (l) {
          const d = /* @__PURE__ */ new Error(`probe_timeout_${o}ms`);
          throw d.code = "UPSTREAM_TIMEOUT", d;
        }
        throw a?.requestLifecycle?.getAbortReason?.() && Zt(u) ? sr(a.requestLifecycle.getAbortReason()) : u;
      } finally {
        c !== null && clearTimeout(c), i.dispose();
      }
    },
    async runFailoverProbeCandidate(a, t, r = {}) {
      const o = a?.failoverContext, s = o?.probePath || ba(a?.hedgeProbePath, Js), i = Math.max(250, Number(o?.probeTimeoutMs) || ho), c = Ve(t), l = gc(t, s);
      if (!l) return {
        ok: !1,
        status: 0,
        targetRecord: t,
        targetKey: c,
        reason: "invalid_probe_target",
        elapsedMs: 0
      };
      const u = k();
      let d = null, f = "HEAD";
      try {
        if (d = await e.performFailoverProbeRequest(a, l, "HEAD", i, r.parentSignal || null), d.status === 405 || d.status === 501) {
          try {
            d.body?.cancel?.();
          } catch {
          }
          f = "GET", d = await e.performFailoverProbeRequest(a, l, "GET", i, r.parentSignal || null);
        }
        const m = Math.max(0, k() - u);
        if (d.ok) {
          const p = d.status;
          try {
            d.body?.cancel?.();
          } catch {
          }
          return {
            ok: !0,
            status: p,
            targetRecord: t,
            targetKey: c,
            methodUsed: f,
            elapsedMs: m
          };
        }
        try {
          d.body?.cancel?.();
        } catch {
        }
        return {
          ok: !1,
          status: d.status,
          targetRecord: t,
          targetKey: c,
          reason: `probe_status_${Number(d.status) || 0}`,
          elapsedMs: m
        };
      } catch (m) {
        const p = Math.max(0, k() - u), g = String(m?.code || "").trim().toUpperCase(), h = String(a?.requestLifecycle?.getAbortReason?.() || "").trim();
        return h ? {
          ok: !1,
          targetRecord: t,
          targetKey: c,
          reason: h.toLowerCase(),
          elapsedMs: p,
          aborted: !0
        } : String(r.parentSignal?.reason || "").trim() === "probe_winner" && Zt(m) ? {
          ok: !1,
          targetRecord: t,
          targetKey: c,
          reason: "probe_winner_aborted",
          elapsedMs: p,
          aborted: !0
        } : {
          ok: !1,
          targetRecord: t,
          targetKey: c,
          reason: g === "UPSTREAM_TIMEOUT" ? "probe_timeout" : "probe_network_error",
          elapsedMs: p,
          aborted: Zt(m)
        };
      }
    },
    async runFailoverProbeTask(a, t, r = {}) {
      const o = a?.failoverContext;
      if (!o?.eligible) return {
        status: "skipped",
        reason: "ineligible",
        winnerTargetRecord: null,
        winnerTargetKey: "",
        elapsedMs: 0,
        attempts: []
      };
      const s = Array.isArray(t) ? t.slice(0, o.probeParallelism) : [];
      if (!s.length) return {
        status: "skipped",
        reason: "no_candidates",
        winnerTargetRecord: null,
        winnerTargetKey: "",
        elapsedMs: 0,
        attempts: []
      };
      const i = new AbortController(), c = [];
      let l = null;
      const u = k();
      await Promise.all(s.map(async (S) => {
        const _ = await e.runFailoverProbeCandidate(a, S, { parentSignal: i.signal });
        if (c.push(_), !l && _?.ok === !0) {
          l = _;
          try {
            i.abort("probe_winner");
          } catch {
          }
        }
      }));
      const d = Math.max(0, k() - u), f = e.getOrCreateFailoverStateEntry(o.cacheKey, o.preferredTtlMs), m = l ? "ok" : "miss", p = l ? String(r.reason || "probe_ok").trim() || "probe_ok" : String(c.find((S) => S?.aborted !== !0 && S?.reason)?.reason || "probe_no_winner").trim() || "probe_no_winner", g = l && typeof l == "object" ? l : null, h = String(g ? g.targetKey : "").trim(), y = g ? g.targetRecord : null;
      return f && (f.lastProbeResult = {
        status: m,
        reason: p,
        winnerTargetKey: h,
        completedAt: k(),
        elapsedMs: d
      }, Ie(oe.ProxyFailoverStateCache, o.cacheKey, f, ar)), {
        status: m,
        reason: p,
        winnerTargetRecord: y,
        winnerTargetKey: h,
        elapsedMs: d,
        attempts: c
      };
    },
    startOrJoinFailoverProbe(a, t = {}) {
      const r = a?.failoverContext, o = e.ensureFailoverTelemetry(a);
      if (!r?.eligible) return null;
      const s = e.getOrCreateFailoverStateEntry(r.cacheKey, r.preferredTtlMs), i = k();
      if (s?.inFlightProbe && Number(s.inFlightProbe.expiresAt) > i && s.inFlightProbe.promise)
        return o.overlay = (t.background === !0 ? "background_probe_joined" : "probe_joined").trim(), {
          joined: !0,
          startedAt: Number(s.inFlightProbe.startedAt) || i,
          promise: s.inFlightProbe.promise
        };
      const c = e.getFailoverProbeCandidates(a, t);
      if (!c.length)
        return o.fastFailReason = "no_probe_candidates", o.overlay = "no_probe_candidates", {
          joined: !1,
          startedAt: i,
          promise: Promise.resolve({
            status: "skipped",
            reason: "no_candidates",
            winnerTargetRecord: null,
            winnerTargetKey: "",
            elapsedMs: 0,
            attempts: []
          })
        };
      const l = `${i}-${Math.random().toString(36).slice(2, 10)}`, u = e.runFailoverProbeTask(a, c, t).finally(() => {
        const d = e.getOrCreateFailoverStateEntry(r.cacheKey, r.preferredTtlMs);
        !d?.inFlightProbe || String(d.inFlightProbe.token || "").trim() !== l || (d.inFlightProbe = null, Ie(oe.ProxyFailoverStateCache, r.cacheKey, d, ar));
      });
      return s && (s.inFlightProbe = {
        token: l,
        startedAt: i,
        expiresAt: i + r.lockTtlMs,
        reason: String(t.reason || "").trim(),
        promise: u
      }, Ie(oe.ProxyFailoverStateCache, r.cacheKey, s, ar)), o.overlay = (t.background === !0 ? "background_probe_started" : "probe_started").trim(), {
        joined: !1,
        startedAt: i,
        promise: u
      };
    },
    async maybeRunForegroundFailoverWait(a, t = {}) {
      const r = a?.execution, o = r?.failoverContext, s = e.ensureFailoverTelemetry(r);
      if (!o?.eligible || r?.failoverForegroundWaitUsed === !0) return null;
      r.failoverForegroundWaitUsed = !0;
      const i = t.targetRecord, c = Number(t.responseStatus) || 0, l = String(t.reason || (c > 0 ? `upstream_status_${c}` : "retryable_failure")).trim() || "retryable_failure";
      e.markFailoverTargetFailure(r, i, l, { overlay: "failure_demoted" });
      const u = e.startOrJoinFailoverProbe(r, {
        reason: l,
        failedTargetRecord: i
      });
      if (!u?.promise) return null;
      const d = await Tp(u.promise, o.waitTimeoutMs, r?.requestLifecycle);
      if (s.waitJoinMs = d.timedOut === !0 ? o.waitTimeoutMs : Math.max(0, k() - Number(u.startedAt || k())), d.timedOut === !0)
        return s.overlay = "probe_wait_timeout", s.fastFailReason = "probe_wait_timeout", null;
      const f = d.value && typeof d.value == "object" ? d.value : null;
      if (s.probeReason = u.joined === !0 ? "join_existing_probe" : l, s.probeElapsedMs = Math.max(0, Number(f?.elapsedMs) || 0), s.probeWinner = String(f?.winnerTargetKey || "").trim(), !f || f.status !== "ok" || !Je(f.winnerTargetRecord))
        return s.overlay = "probe_miss", s.fastFailReason = String(f?.reason || "probe_no_winner").trim() || "probe_no_winner", null;
      const m = Ve(i), p = Ve(f.winnerTargetRecord);
      if (!p || p === m)
        return s.overlay = "probe_miss", s.fastFailReason = "probe_reused_failed_target", null;
      o.wakeJitterMs > 0 && await wp(Math.floor(Math.random() * (o.wakeJitterMs + 1)), r?.requestLifecycle);
      try {
        const g = await e.performUpstreamFetch(f.winnerTargetRecord, a.proxyPath, a.requestUrl, a.buildFetchOptions, {
          isRetry: !0,
          protocolFallbackRetry: a.protocolFallbackRetry === !0,
          stripAuthOnProtocolFallback: a.stripAuthOnProtocolFallback === !0,
          timeoutMs: a.upstreamTimeoutMs,
          requestLifecycle: a.requestLifecycle,
          useFastSegmentBuilder: !1
        });
        if (s.overlay = "wake_retry", g.response.status === 101 || !a.retryableStatuses.has(g.response.status)) return { upstream: g };
        e.markFailoverTargetFailure(r, f.winnerTargetRecord, `upstream_status_${g.response.status}`, { overlay: "wake_retry_failed" }), s.fastFailReason = `wake_retry_status_${g.response.status}`;
        try {
          g.response.body?.cancel?.();
        } catch {
        }
        try {
          g.releaseFetchController?.();
        } catch {
        }
        return null;
      } catch (g) {
        const h = String(g?.code || "").trim().toUpperCase();
        if ([
          "CLIENT_ABORTED",
          "DOWNSTREAM_CANCELLED",
          "REQUEST_ABORTED"
        ].includes(h) || (e.markFailoverTargetFailure(r, f.winnerTargetRecord, h || "wake_retry_error", { overlay: "wake_retry_failed" }), s.fastFailReason = String(h || "wake_retry_error").trim().toLowerCase() || "wake_retry_error"), g && typeof g == "object") {
          const y = mr(f.winnerTargetRecord, a.proxyPath);
          y.search = String(a.requestUrl?.search || ""), g.lastFinalUrl = y, g.lastTargetRecord = f.winnerTargetRecord, g.lastTargetBase = f.winnerTargetRecord?.targetUrl || null;
        }
        if ([
          "CLIENT_ABORTED",
          "DOWNSTREAM_CANCELLED",
          "REQUEST_ABORTED"
        ].includes(h)) throw g;
        return { error: g };
      }
    },
    maybeScheduleBackgroundFailoverRefresh(a, t = {}) {
      const r = a?.failoverContext;
      if (!r?.eligible || !a?.ctx) return;
      const o = e.getFailoverStateSnapshot(r.cacheKey, r.preferredTtlMs);
      if ((Array.isArray(o?.failingTargetKeys) ? o.failingTargetKeys : []).length <= 0) return;
      const s = Number(o?.lastProbeResult?.completedAt) || 0;
      if (s > 0 && s + r.preferredTtlMs > k() || o?.inFlightProbe) return;
      const i = e.startOrJoinFailoverProbe(a, {
        reason: "stale_refresh",
        activeTargetRecord: t?.activeTargetRecord || null,
        background: !0
      });
      i?.promise && a.ctx.waitUntil(Promise.resolve(i.promise).catch(() => {
      }));
    }
  };
}
function Bp(n = {}, e = {}) {
  return {
    ...Kp(n, e),
    ...zp(n, e),
    ...$p(n, e)
  };
}
function Wp(n = {}, e = {}) {
  const {} = n, a = {
    async buildProxyRequestState(t, r, o, s, i, c, l, u, d = {}) {
      const f = fp(t.headers);
      vn.forEach((P) => f.delete(P));
      const m = /* @__PURE__ */ new Set();
      let p = null;
      if (r.headers && typeof r.headers == "object") for (const [P, U] of Object.entries(r.headers)) {
        const K = String(P).toLowerCase();
        vn.has(K) || (m.add(K), K === "cookie" ? p = String(U) : f.set(P, String(U)));
      }
      const g = Fm(f.get("Cookie"), p, ["auth_token", ...on]);
      g ? f.set("Cookie", g) : f.delete("Cookie"), pp(f, d.effectiveMediaAuthMode || r.mediaAuthMode);
      const h = qu(d.effectiveRealClientIpMode || r.realClientIpMode);
      h === "none" && cu.forEach((P) => f.delete(P)), (h === "full" || h === "real-ip-only") && f.set("X-Real-IP", i), h === "full" && f.set("X-Forwarded-For", i), f.set("X-Forwarded-Host", s.host), f.set("X-Forwarded-Proto", s.protocol.replace(":", "")), c.isWsUpgrade ? (f.set("Upgrade", "websocket"), f.set("Connection", "Upgrade")) : l && f.set("Connection", "keep-alive"), (c.isBigStream || c.isSmartStrmMedia || c.isSegment || c.isManifest) && !m.has("referer") && f.delete("Referer");
      const y = m.has("origin"), S = m.has("referer"), _ = f.has("Origin"), A = f.has("Referer");
      let b = "", R = "/";
      if (A && !S) try {
        const P = new URL(f.get("Referer") || "");
        b = String(P.origin || "").trim(), R = `${P.pathname || "/"}${P.search || ""}` || "/";
      } catch {
        b = "", R = "/";
      }
      const E = {
        baseHeaderEntries: [...f.entries()],
        hasOriginHeader: _,
        hasRefererHeader: A,
        adminCustomHasOrigin: y,
        adminCustomHasReferer: S,
        refererOrigin: b,
        refererPathAndSearch: R,
        isHotMediaRequest: c.isSmartStrmMedia === !0 || c.isBigStream === !0 || c.isManifest === !0 || c.isSegment === !0
      }, D = t.method !== "GET" && t.method !== "HEAD";
      let w = null, C = "none", T = "";
      if (D && t.body) {
        const P = Ds(t.headers.get("Content-Length"));
        if (Number.isFinite(P) && P >= 0 && P <= Ql) try {
          w = await t.clone().arrayBuffer(), C = "buffered", (c.isPlaybackInfoRequest === !0 || c.isPlaybackSessionControlRequest === !0) && (T = Zn(w));
        } catch {
          w = t.body, C = "stream";
        }
        else
          w = t.body, C = "stream";
      }
      const I = D ? u.slice(0, 1) : u;
      return {
        newHeaders: f,
        adminCustomHeaders: m,
        transportTemplate: E,
        preparedBody: w,
        preparedBodyMode: C,
        preparedBodyText: T,
        retryTargetRecords: I,
        allowAutomaticRetry: !D,
        clientRedirectAuthPolicy: ya(f)
      };
    },
    buildProxyResponseHeaders(t, r, o, s, i, c = {}) {
      const l = new Headers(t.headers);
      lu.forEach((f) => l.delete(f)), l.set("Access-Control-Allow-Origin", s), o && o["Access-Control-Expose-Headers"] && l.set("Access-Control-Expose-Headers", o["Access-Control-Expose-Headers"]), o && o["Access-Control-Allow-Methods"] && l.set("Access-Control-Allow-Methods", o["Access-Control-Allow-Methods"]);
      const u = r.headers.get("Access-Control-Request-Headers");
      u ? (l.set("Access-Control-Allow-Headers", u), Or(l, "Access-Control-Request-Headers")) : o && o["Access-Control-Allow-Headers"] && l.set("Access-Control-Allow-Headers", o["Access-Control-Allow-Headers"]), s !== "*" && Or(l, "Origin"), (!c.enableH3 || c.forceH1) && l.delete("Alt-Svc");
      const d = de(c.imageCacheMaxAge, oi * 86400, 0, 365 * 86400);
      if (t.status >= 400 || i.isManifest || i.isBigStream || i.isSmartStrmMedia) l.set("Cache-Control", "no-store");
      else if (c.proxiedExternalRedirect) l.set("Cache-Control", "no-store");
      else if (i.isImage || i.isStaticFile || i.isSubtitle) {
        const f = Gm(r) ? "private" : "public";
        l.set("Cache-Control", `${f}, max-age=${d}`);
      }
      return Ce(l), l;
    },
    applyProxyRedirectHeaders(t, r, o, s, i, c, l, u = {}) {
      if (c) {
        yc(t), t.set("Location", c.toString()), t.set("Cache-Control", "no-store");
        return;
      }
      if (!(r.status >= 300 && r.status < 400)) return;
      const d = t.get("Location");
      if (!d) return;
      const f = _s(ha(d, l || o), o, s, i, {
        linkVariant: u.linkVariant,
        entryMode: u.entryMode
      });
      f && t.set("Location", f);
    },
    buildClientVisibleRedirectUrl(t, r, o, s, i, c = {}) {
      const l = t instanceof URL ? t : ha(t, r);
      if (!l) return null;
      if (c.preserveWorkerProxy !== !0) return l;
      const u = _s(l, r, o, s, {
        linkVariant: c.linkVariant,
        entryMode: c.entryMode
      }), d = pt(o, s, {
        linkVariant: c.linkVariant,
        entryMode: c.entryMode
      });
      if (!u || !String(u).startsWith(d)) return l;
      try {
        const f = i instanceof URL ? i : new URL(String(i || ""));
        return new URL(u, f);
      } catch {
        return l;
      }
    },
    buildPlaybackInfoClientVisibleUrl(t, r = "/", o = {}) {
      const s = Q(r), i = String(o.search || ""), c = String(o.hash || "");
      return String(t?.playbackInfoRewriteUrlMode || "").trim() === "absolute" ? Sc(t?.requestUrl || t?.rawRequestUrl || "https://playback-info.local/", t?.nodeName, t?.nodeKey, s, {
        linkVariant: t?.linkVariant,
        entryMode: t?.entryMode,
        search: i,
        hash: c
      }).toString() : `${Om(Pm(s, t?.nodeName, t?.nodeKey, { entryMode: t?.entryMode }), xm(t))}${i}${c}`;
    },
    buildPlaybackInfoProxyUrl(t, r, o, s) {
      const i = String(r || "").trim();
      if (!i) return "";
      const c = Dm(i, t?.proxyPath || "/", o, t?.requestUrl || t?.rawRequestUrl || s, pt(t?.nodeName, t?.nodeKey, {
        linkVariant: t?.linkVariant,
        entryMode: t?.entryMode
      }));
      if (c) return a.buildPlaybackInfoClientVisibleUrl(t, c.proxyPath, {
        search: c.search,
        hash: c.hash
      });
      let l;
      try {
        const d = s instanceof URL ? s : new URL(String(s || ""));
        l = new URL(i, d);
      } catch {
        return i;
      }
      if (!["http:", "https:"].includes(String(l.protocol || "").toLowerCase())) return i;
      if (o) {
        const { resolvedUrl: d, proxyPath: f } = Ea(l, o);
        if (d && f) {
          const m = Nm(f, t?.proxyPath || "/", o);
          return a.buildPlaybackInfoClientVisibleUrl(t, m, {
            search: d.search,
            hash: d.hash
          });
        }
      }
      const u = Im(t?.requestUrl || t?.rawRequestUrl || "https://playback-info.local/", t?.nodeName, t?.nodeKey, l, {
        linkVariant: t?.linkVariant,
        entryMode: t?.entryMode
      });
      return String(t?.playbackInfoRewriteUrlMode || "").trim() === "absolute" ? u.toString() : a.buildPlaybackInfoClientVisibleUrl(t, u.pathname || "/", {
        search: u.search || "",
        hash: u.hash || ""
      });
    },
    sanitizePlaybackInfoSerializedResponseHeaders: ao,
    parsePlaybackInfoRootObject: xa,
    buildPlaybackInfoContractErrorState(t, r, o = "invalid_payload", s = null) {
      const i = r?.response;
      return t.playbackInfoRewrite = "rejected", e.buildProxyErrorState(t, r, {
        message: "Upstream PlaybackInfo response must be a JSON object.",
        guardHeader: "X-Proxy-Contract-Guard",
        guardValue: "playback-info",
        details: F(s) ? s : {
          reason: String(o || "invalid_payload"),
          upstreamStatus: Number(i?.status) || 0,
          contentType: cr(i?.headers?.get?.("Content-Type")) || "missing"
        }
      });
    },
    async guardPlaybackInfoResponseContract(t, r) {
      if (t?.requestTraits?.isPlaybackInfoRequest !== !0 || Qt(r?.playbackInfoRepresentation) && r.playbackInfoRepresentation.response === r?.response) return r;
      const o = await Jc(r?.response, {
        requestMethod: t.requestMethod,
        maxBytes: ai
      });
      return o.kind === "skip" ? r : o.kind === "invalid" ? a.buildPlaybackInfoContractErrorState(t, r, o.reason, o.details) : {
        ...r,
        playbackInfoRepresentation: o.representation
      };
    },
    decodePlaybackInfoJsonValue: Oa,
    normalizePlaybackInfoObjectArray: no,
    sanitizePlaybackInfoMediaSource: Is,
    sanitizePlaybackInfoMediaSourcesPayload: oo,
    rewritePlaybackInfoPayload(t, r, o, s) {
      return Ps(r, { buildProxyUrl: (i) => a.buildPlaybackInfoProxyUrl(t, i, o, s) });
    },
    async maybeRewritePlaybackInfoResponse(t, r) {
      if (t?.requestTraits?.isPlaybackInfoRequest !== !0) return r;
      const o = $t(t?.effectivePlaybackInfoMode) === "rewrite", s = o ? "not_needed" : "passthrough", i = r?.response;
      if (!i || !(i.status >= 200 && i.status < 300) || t.requestMethod === "HEAD" || i.status === 204 || i.status === 205 || !i.body)
        return t.playbackInfoRewrite !== "rejected" && (t.playbackInfoRewrite = s), r;
      if ((!Qt(r?.playbackInfoRepresentation) || r.playbackInfoRepresentation.response !== i) && (r = await a.guardPlaybackInfoResponseContract(t, r), !Qt(r?.playbackInfoRepresentation)))
        return r;
      try {
        const c = Qc(r.playbackInfoRepresentation, {
          rewriteEnabled: o,
          buildProxyUrl: (l) => a.buildPlaybackInfoProxyUrl(t, l, r?.activeTargetBase, r?.finalUrl || new URL(String(t?.requestUrl || t?.rawRequestUrl || "")))
        });
        return c.kind !== "valid" ? a.buildPlaybackInfoContractErrorState(t, r, c.reason || "normalization_failed") : (t.playbackInfoRewrite = c.rewriteState, {
          ...r,
          response: c.representation.response,
          playbackInfoRepresentation: c.representation
        });
      } catch {
        return a.buildPlaybackInfoContractErrorState(t, r, "normalization_failed");
      }
    }
  };
  return a;
}
function Vp({ configReader: n, nodeRepository: e, logger: a, cachePort: t, fetchPort: r }) {
  const o = {}, s = {
    CacheManager: t,
    Logger: a,
    configReader: n,
    fetchPort: r,
    nodeRepository: e
  }, i = [
    Mp(s, o),
    vp(s, o),
    kp(s, o),
    Bp(s, o),
    Wp(s, o)
  ];
  for (const c of i) for (const [l, u] of Object.entries(c)) o[l] = u;
  return o;
}
function Gp({ configReader: n, nodeRepository: e, logger: a, cachePort: t, fetchPort: r }) {
  const o = Vp({
    configReader: n,
    nodeRepository: e,
    logger: a,
    cachePort: t,
    fetchPort: r
  });
  return Object.freeze({
    handle: (...s) => o.handle(...s),
    testingSupport: o
  });
}
function jp(n = {}, e = {}) {
  const { CacheManager: a, withAdminShellRuntimeStatus: t } = n;
  return {
    getStatsBucketParts(r, o = O.Defaults.ScheduleUtcOffsetMinutes) {
      const s = Wt(Number(r) || 0, o);
      return {
        bucketDate: s.dateKey,
        bucketHour: s.hour
      };
    },
    summarizeStatsHourlyEntries(r = [], o = {}) {
      const s = ke(o.utcOffsetMinutes), i = /* @__PURE__ */ new Map();
      for (const c of Array.isArray(r) ? r : []) {
        const l = Number(c?.timestamp) || 0;
        if (l <= 0) continue;
        const { bucketDate: u, bucketHour: d } = e.getStatsBucketParts(l, s), f = `${u}:${d}`, m = i.get(f) || {
          bucketDate: u,
          bucketHour: d,
          requestCount: 0,
          playCount: 0,
          playbackInfoCount: 0
        };
        m.requestCount += 1, ed(c?.requestPath, c?.category) && (m.playCount += 1), Zu(c?.requestPath, c?.category) && (m.playbackInfoCount += 1), i.set(f, m);
      }
      return [...i.values()].sort((c, l) => c.bucketDate !== l.bucketDate ? String(c.bucketDate).localeCompare(String(l.bucketDate)) : Number(c.bucketHour) - Number(l.bucketHour));
    },
    async incrementStatsHourly(r, o = [], s = {}) {
      if (!r || !await e.hasStatsHourlyTable(r)) return !1;
      const i = e.summarizeStatsHourlyEntries(o, s);
      return i.length ? await e.upsertStatsHourlyBuckets(r, i, s) : !0;
    },
    async upsertStatsHourlyBuckets(r, o = [], s = {}) {
      if (!r || !await e.hasStatsHourlyTable(r)) return !1;
      const i = (Array.isArray(o) ? o : []).map((u) => ({
        bucketDate: String(u?.bucketDate || "").trim(),
        bucketHour: Math.max(0, Number(u?.bucketHour) || 0),
        requestCount: Math.max(0, Number(u?.requestCount) || 0),
        playCount: Math.max(0, Number(u?.playCount) || 0),
        playbackInfoCount: Math.max(0, Number(u?.playbackInfoCount) || 0)
      })).filter((u) => u.bucketDate);
      if (!i.length) return !0;
      const c = (/* @__PURE__ */ new Date()).toISOString(), l = i.map((u) => r.prepare(`INSERT INTO ${e.STATS_HOURLY_TABLE} (
            bucket_date, bucket_hour, request_count, play_count, playback_info_count, updated_at
          ) VALUES (?, ?, ?, ?, ?, ?)
          ON CONFLICT(bucket_date, bucket_hour) DO UPDATE SET
            request_count = ${e.STATS_HOURLY_TABLE}.request_count + excluded.request_count,
            play_count = ${e.STATS_HOURLY_TABLE}.play_count + excluded.play_count,
            playback_info_count = ${e.STATS_HOURLY_TABLE}.playback_info_count + excluded.playback_info_count,
            updated_at = excluded.updated_at`).bind(u.bucketDate, u.bucketHour, u.requestCount, u.playCount, u.playbackInfoCount, c));
      if (s.useBatch === !1) for (const u of l) await u.run();
      else
        for (let d = 0; d < l.length; d += 50) await r.batch(l.slice(d, d + 50));
      return !0;
    },
    async clearStatsHourly(r) {
      return !r || !await e.hasStatsHourlyTable(r) ? !1 : (await r.prepare(`DELETE FROM ${e.STATS_HOURLY_TABLE}`).run(), !0);
    },
    getStatsUtcOffsetMinutesFromStatus(r = {}) {
      const o = Number(r?.statsUtcOffsetMinutes);
      return Number.isFinite(o) ? ke(o) : null;
    },
    async getDailyStatsHourly(r, o) {
      if (!r || !o || !await e.hasStatsHourlyTable(r)) return [];
      try {
        const s = await r.prepare(`SELECT bucket_hour, request_count, play_count, playback_info_count
              FROM ${e.STATS_HOURLY_TABLE}
              WHERE bucket_date = ?
              ORDER BY bucket_hour ASC`).bind(String(o)).all();
        return Array.isArray(s?.results) ? s.results : [];
      } catch {
        return [];
      }
    },
    async rebuildStatsHourlyForDate(r, o = {}) {
      if (!r) return !1;
      const s = String(o.bucketDate || "").trim(), i = Number(o.startTs) || 0, c = Number(o.endTs) || 0;
      if (!s || i <= 0 || c <= 0 || c < i) return !1;
      await e.ensureStatsHourlySchema(r), await r.prepare(`DELETE FROM ${e.STATS_HOURLY_TABLE} WHERE bucket_date = ?`).bind(s).run();
      const l = await r.prepare(`SELECT timestamp, request_path, category
            FROM ${e.LOGS_TABLE}
            WHERE timestamp >= ? AND timestamp <= ?
            ORDER BY timestamp ASC`).bind(i, c).all(), u = (Array.isArray(l?.results) ? l.results : []).map((d) => ({
        timestamp: Number(d?.timestamp) || 0,
        requestPath: d?.request_path || d?.requestPath || "",
        category: d?.category || ""
      }));
      return await e.incrementStatsHourly(r, u, {
        utcOffsetMinutes: o.utcOffsetMinutes,
        useBatch: !0
      });
    },
    async rebuildStatsHourlyWindow(r, o = {}) {
      if (!r) return !1;
      const s = Number(o.startTs) || 0, i = Number(o.endTs) || 0;
      if (s < 0 || i <= 0 || i < s) return !1;
      await e.ensureStatsHourlySchema(r), await e.clearStatsHourly(r);
      const c = await r.prepare(`SELECT timestamp, request_path, category
            FROM ${e.LOGS_TABLE}
            WHERE timestamp >= ? AND timestamp <= ?
            ORDER BY timestamp ASC`).bind(s, i).all(), l = (Array.isArray(c?.results) ? c.results : []).map((u) => ({
        timestamp: Number(u?.timestamp) || 0,
        requestPath: u?.request_path || u?.requestPath || "",
        category: u?.category || ""
      }));
      return await e.incrementStatsHourly(r, l, {
        utcOffsetMinutes: o.utcOffsetMinutes,
        useBatch: !0
      });
    },
    async ensureStatsHourlyWindowAligned(r, o = {}) {
      const s = e.resolveOpsStatusStores(r), i = s?.db || null;
      if (!i || !await e.hasStatsHourlyTable(i)) return {
        rebuilt: !1,
        reason: "stats_unavailable"
      };
      const c = te(o.config || {}), l = ke(c.scheduleUtcOffsetMinutes), u = await e.getOpsStatusSection(s, "log");
      if (e.getStatsUtcOffsetMinutesFromStatus(u) === l && o.force !== !0) return {
        rebuilt: !1,
        reason: "already_aligned",
        utcOffsetMinutes: l
      };
      const d = o.now instanceof Date ? o.now : /* @__PURE__ */ new Date(), f = de(c.logRetentionDays, O.Defaults.LogRetentionDays, 1, O.Defaults.LogRetentionDaysMax), m = Math.max(0, d.getTime() - f * 24 * 60 * 60 * 1e3), p = d.getTime();
      return await e.rebuildStatsHourlyWindow(i, {
        startTs: m,
        endTs: p,
        utcOffsetMinutes: l
      }), await e.patchOpsStatus(s, { log: {
        schemaReady: !0,
        statsReady: !0,
        statsUtcOffsetMinutes: l,
        statsAlignedAt: (/* @__PURE__ */ new Date()).toISOString(),
        statsAlignedWindowStartAt: new Date(m).toISOString(),
        statsAlignedWindowEndAt: new Date(p).toISOString()
      } }), {
        rebuilt: !0,
        utcOffsetMinutes: l,
        startTs: m,
        endTs: p
      };
    },
    async dropLogsFtsSyncTriggers(r) {
      if (!r) return 0;
      let o = 0, s = [];
      try {
        s = (await r.prepare("SELECT name, sql FROM sqlite_master WHERE type = 'trigger' AND tbl_name = ?").bind(e.LOGS_TABLE).all())?.results || [];
      } catch {
      }
      const i = e.LOGS_FTS_TABLE.toLowerCase(), c = e.LOGS_FTS_INSERT_TRIGGER.toLowerCase(), l = new Set([
        c,
        `${e.LOGS_TABLE}_ai`,
        `${e.LOGS_TABLE}_au`,
        `${e.LOGS_TABLE}_ad`,
        `${e.LOGS_FTS_TABLE}_ai`,
        `${e.LOGS_FTS_TABLE}_au`,
        `${e.LOGS_FTS_TABLE}_ad`
      ].map((u) => String(u || "").toLowerCase()));
      for (const u of s) {
        const d = String(u?.name || "").trim();
        if (!d) continue;
        const f = d.toLowerCase(), m = Kn(u?.sql || "");
        (l.has(f) || m.includes(i)) && (await r.prepare(`DROP TRIGGER IF EXISTS ${Ma(d)}`).run(), o += 1);
      }
      return o;
    },
    async rebuildLogsFts(r) {
      return !r || !await e.hasLogsFtsTable(r) ? !1 : (await r.prepare(`INSERT INTO ${e.LOGS_FTS_TABLE}(${e.LOGS_FTS_TABLE}) VALUES('rebuild')`).run(), !0);
    },
    async ensureLogsFtsSchema(r, o = {}) {
      if (!r) return {
        migratedRows: 0,
        droppedTriggers: 0,
        rebuilt: !1,
        recreated: !1
      };
      const s = o.forceRecreate === !0;
      await e.ensureLogsBaseSchema(r);
      const i = await e.getLogsFtsReadiness(r);
      if (i.ready && !s) return {
        migratedRows: 0,
        droppedTriggers: 0,
        rebuilt: !1,
        recreated: !1
      };
      if (i.tableReady && !s) {
        const d = /* @__PURE__ */ new Error("Existing FTS schema does not match the current contract");
        throw d.code = "D1_SCHEMA_INCOMPATIBLE", d.status = 409, d.details = { phase: "fts_preflight" }, d;
      }
      let c = !1, l = 0;
      s && (l = await e.dropLogsFtsSyncTriggers(r), await r.prepare(`DROP TABLE IF EXISTS ${e.LOGS_FTS_TABLE}`).run(), c = !0), await r.prepare(`CREATE VIRTUAL TABLE IF NOT EXISTS ${e.LOGS_FTS_TABLE} USING fts5(node_name, request_path, user_agent, error_detail, detail_json, content='${e.LOGS_TABLE}', content_rowid='id', tokenize='unicode61')`).run(), s && (l += await e.dropLogsFtsSyncTriggers(r)), await r.prepare(`CREATE TRIGGER IF NOT EXISTS ${e.LOGS_FTS_INSERT_TRIGGER} AFTER INSERT ON ${e.LOGS_TABLE} BEGIN
            INSERT INTO ${e.LOGS_FTS_TABLE}(rowid, node_name, request_path, user_agent, error_detail, detail_json)
            VALUES (new.id, new.node_name, new.request_path, COALESCE(new.user_agent, ''), COALESCE(new.error_detail, ''), COALESCE(new.detail_json, ''));
          END;`).run();
      const u = (await r.prepare(`SELECT COUNT(*) as total FROM ${e.LOGS_TABLE}`).first())?.total || 0;
      return await r.prepare(`INSERT INTO ${e.LOGS_FTS_TABLE}(${e.LOGS_FTS_TABLE}) VALUES('rebuild')`).run(), {
        migratedRows: u,
        droppedTriggers: l,
        rebuilt: !0,
        recreated: c
      };
    }
  };
}
function qp(n = {}, e = {}) {
  const { CacheManager: a, withAdminShellRuntimeStatus: t } = n;
  return {
    async ensureDnsIpWorkspaceSchema(r) {
      if (!r) return !1;
      if (e.isD1SchemaReadyCached(r, "dnsIpWorkspaceSchema")) return !0;
      let o = Z.DnsIpWorkspaceDbReady.get(r);
      o || (o = (async () => (await r.prepare(`CREATE TABLE IF NOT EXISTS ${e.DNS_IP_POOL_ITEMS_TABLE} (
                id TEXT PRIMARY KEY,
                ip TEXT NOT NULL UNIQUE,
                ip_type TEXT NOT NULL,
                source_kind TEXT NOT NULL,
                source_label TEXT,
                line_label TEXT NOT NULL DEFAULT '',
                remark TEXT,
                created_at TEXT NOT NULL,
                updated_at TEXT NOT NULL
              )`).run(), await r.prepare(`CREATE INDEX IF NOT EXISTS idx_dns_ip_pool_items_updated_ip ON ${e.DNS_IP_POOL_ITEMS_TABLE} (updated_at DESC, ip ASC)`).run(), await r.prepare(`CREATE TABLE IF NOT EXISTS ${e.DNS_IP_POOL_SOURCES_TABLE} (
                id TEXT PRIMARY KEY,
                name TEXT NOT NULL,
                url TEXT NOT NULL,
                source_type TEXT NOT NULL DEFAULT 'url',
                domain TEXT,
                source_kind TEXT NOT NULL DEFAULT 'custom',
                preset_id TEXT NOT NULL DEFAULT '',
                builtin_id TEXT NOT NULL DEFAULT '',
                enabled INTEGER NOT NULL DEFAULT 1,
                sort_order INTEGER NOT NULL DEFAULT 0,
                ip_limit INTEGER NOT NULL DEFAULT 5,
                last_fetch_at TEXT,
                last_fetch_status TEXT,
                last_fetch_count INTEGER NOT NULL DEFAULT 0,
                created_at TEXT NOT NULL,
                updated_at TEXT NOT NULL
              )`).run(), await r.prepare(`CREATE INDEX IF NOT EXISTS idx_dns_ip_pool_sources_sort ON ${e.DNS_IP_POOL_SOURCES_TABLE} (sort_order ASC, updated_at ASC)`).run(), await r.prepare(`CREATE TABLE IF NOT EXISTS ${e.DNS_IP_POOL_FETCH_CACHE_TABLE} (
                signature TEXT PRIMARY KEY,
                items_json TEXT NOT NULL,
                source_results_json TEXT NOT NULL,
                imported_count INTEGER NOT NULL DEFAULT 0,
                enabled_source_count INTEGER NOT NULL DEFAULT 0,
                cached_at INTEGER NOT NULL,
                expires_at INTEGER NOT NULL,
                created_at TEXT NOT NULL,
                updated_at TEXT NOT NULL
              )`).run(), await r.prepare(`CREATE INDEX IF NOT EXISTS idx_dns_ip_pool_fetch_cache_expires ON ${e.DNS_IP_POOL_FETCH_CACHE_TABLE} (expires_at)`).run(), await r.prepare(`CREATE TABLE IF NOT EXISTS ${e.DNS_IP_PROBE_CACHE_TABLE} (
                ip TEXT NOT NULL,
                entry_colo TEXT NOT NULL,
                probe_status TEXT NOT NULL,
                latency_ms INTEGER,
                cf_ray TEXT,
                colo_code TEXT,
                city_name TEXT,
                country_code TEXT,
                country_name TEXT,
                probed_at TEXT NOT NULL,
                expires_at INTEGER NOT NULL,
                PRIMARY KEY (ip, entry_colo)
              )`).run(), await r.prepare(`CREATE INDEX IF NOT EXISTS idx_dns_ip_probe_cache_expire ON ${e.DNS_IP_PROBE_CACHE_TABLE} (expires_at)`).run(), await r.prepare(`CREATE INDEX IF NOT EXISTS idx_dns_ip_probe_cache_colo_ip_expires ON ${e.DNS_IP_PROBE_CACHE_TABLE} (entry_colo, ip, expires_at)`).run(), e.markD1SchemaReady(r, "dnsIpWorkspaceSchema"), !0))().catch((s) => {
        throw Z.DnsIpWorkspaceDbReady.delete(r), s;
      }), Z.DnsIpWorkspaceDbReady.set(r, o));
      try {
        return await o;
      } finally {
        Z.DnsIpWorkspaceDbReady.get(r) === o && Z.DnsIpWorkspaceDbReady.delete(r);
      }
    },
    getDnsIpPoolRevisionFromStatus(r = {}) {
      const o = String(r?.revision || "").trim();
      return o || Ut("dns_ip_pool", String(r?.updatedAt || "").trim());
    },
    async bumpDnsIpPoolRevision(r, o = {}, s = null) {
      const i = await e.getOpsStatusSection(r, "dnsIpPool"), c = (/* @__PURE__ */ new Date()).toISOString(), l = ce(`${e.getDnsIpPoolRevisionFromStatus(i)}:${c}:${se(o)}`);
      return await e.patchOpsStatus(r, { dnsIpPool: {
        ...o,
        revision: Ut(l, c),
        updatedAt: c
      } }, s);
    },
    async getDnsIpPoolItems(r) {
      if (!r) return [];
      await e.ensureDnsIpWorkspaceSchema(r);
      try {
        const o = await r.prepare(`SELECT id, ip, ip_type, source_kind, source_label, line_label, remark, created_at, updated_at
              FROM ${e.DNS_IP_POOL_ITEMS_TABLE}
              ORDER BY updated_at DESC, ip ASC`).all();
        return (Array.isArray(o?.results) ? o.results : []).map((s) => lr(s)).filter(Boolean);
      } catch {
        return [];
      }
    },
    async upsertDnsIpPoolItems(r, o = [], s = {}) {
      if (!r) return [];
      await e.ensureDnsIpWorkspaceSchema(r);
      const i = (/* @__PURE__ */ new Date()).toISOString(), c = /* @__PURE__ */ new Map();
      for (const d of Array.isArray(o) ? o : []) {
        const f = lr(d, {
          createdAt: i,
          updatedAt: i,
          sourceKind: s.sourceKind,
          sourceLabel: s.sourceLabel
        });
        f && c.set(f.ip.toLowerCase(), f);
      }
      const l = [...c.values()];
      if (!l.length) return [];
      const u = l.map((d) => r.prepare(`INSERT INTO ${e.DNS_IP_POOL_ITEMS_TABLE} (
            id, ip, ip_type, source_kind, source_label, line_label, remark, created_at, updated_at
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
          ON CONFLICT(ip) DO UPDATE SET
            ip_type = excluded.ip_type,
            source_kind = excluded.source_kind,
            source_label = excluded.source_label,
            line_label = CASE WHEN COALESCE(excluded.line_label, '') != '' THEN excluded.line_label ELSE ${e.DNS_IP_POOL_ITEMS_TABLE}.line_label END,
            remark = CASE WHEN COALESCE(excluded.remark, '') != '' THEN excluded.remark ELSE ${e.DNS_IP_POOL_ITEMS_TABLE}.remark END,
            updated_at = excluded.updated_at`).bind(d.id, d.ip, d.ipType, d.sourceKind, d.sourceLabel, d.lineLabel, d.remark, d.createdAt, d.updatedAt));
      return await r.batch(u), l;
    },
    async deleteDnsIpPoolItems(r, o = []) {
      if (!r) return 0;
      await e.ensureDnsIpWorkspaceSchema(r);
      const s = [...new Set((Array.isArray(o) ? o : []).map((l) => String(l || "").trim()).filter((l) => Ye(l)))];
      if (!s.length) return 0;
      const i = s.flatMap((l) => [r.prepare(`DELETE FROM ${e.DNS_IP_POOL_ITEMS_TABLE} WHERE ip = ?`).bind(l), r.prepare(`DELETE FROM ${e.DNS_IP_PROBE_CACHE_TABLE} WHERE ip = ?`).bind(l)]), c = 50;
      for (let l = 0; l < i.length; l += c) await r.batch(i.slice(l, l + c));
      return s.length;
    },
    async getDnsIpPoolSourcesFromDb(r) {
      if (!r) return [];
      await e.ensureDnsIpWorkspaceSchema(r);
      try {
        const o = await r.prepare(`SELECT id, name, url, source_type, domain, source_kind, preset_id, builtin_id, enabled, sort_order, ip_limit, last_fetch_at, last_fetch_status, last_fetch_count, created_at, updated_at
              FROM ${e.DNS_IP_POOL_SOURCES_TABLE}
              ORDER BY sort_order ASC, updated_at ASC`).all();
        return (Array.isArray(o?.results) ? o.results : []).map((s, i) => Ct(s, i)).filter((s) => rr(s));
      } catch {
        return [];
      }
    },
    async getDnsIpPoolSourcesFromDbStrict(r) {
      if (!r) throw new Error("D1 not configured");
      await e.ensureDnsIpWorkspaceSchema(r);
      const o = await r.prepare(`SELECT id, name, url, source_type, domain, source_kind, preset_id, builtin_id, enabled, sort_order, ip_limit, last_fetch_at, last_fetch_status, last_fetch_count, created_at, updated_at
            FROM ${e.DNS_IP_POOL_SOURCES_TABLE}
            ORDER BY sort_order ASC, updated_at ASC`).all();
      return (Array.isArray(o?.results) ? o.results : []).map((s, i) => Ct(s, i)).filter((s) => rr(s));
    },
    async getDnsIpPoolSources(r) {
      const o = e.resolveOpsStatusStores(r)?.db || null;
      return await e.getDnsIpPoolSourcesFromDb(o);
    },
    async getDnsIpPoolSourcesForRead(r) {
      const o = e.resolveOpsStatusStores(r)?.db || null;
      return await e.getDnsIpPoolSourcesFromDb(o);
    },
    async persistDnsIpPoolSources(r, o = [], s = null) {
      const i = (Array.isArray(o) ? o : []).map((u, d) => Ct(u, d)).filter((u) => rr(u)), c = e.resolveOpsStatusStores(r)?.db || null;
      if (!c) throw new Error("D1 not configured");
      await e.ensureDnsIpWorkspaceSchema(c);
      const l = [c.prepare(`DELETE FROM ${e.DNS_IP_POOL_SOURCES_TABLE}`)];
      return l.push(...i.map((u) => c.prepare(`INSERT INTO ${e.DNS_IP_POOL_SOURCES_TABLE} (
            id, name, url, source_type, domain, source_kind, preset_id, builtin_id, enabled, sort_order, ip_limit, last_fetch_at, last_fetch_status, last_fetch_count, created_at, updated_at
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`).bind(u.id, u.name, u.url, u.sourceType, u.domain, u.sourceKind, u.presetId, u.builtinId, u.enabled ? 1 : 0, u.sortOrder, u.ipLimit, u.lastFetchAt, u.lastFetchStatus, u.lastFetchCount, u.createdAt, u.updatedAt))), await c.batch(l), i;
    },
    async updateDnsIpPoolSourceFetchState(r, o = "", s = {}) {
      if (!r || !o) return !1;
      await e.ensureDnsIpWorkspaceSchema(r);
      const i = (/* @__PURE__ */ new Date()).toISOString();
      return await r.prepare(`UPDATE ${e.DNS_IP_POOL_SOURCES_TABLE}
            SET last_fetch_at = ?, last_fetch_status = ?, last_fetch_count = ?, updated_at = ?
            WHERE id = ?`).bind(String(s.lastFetchAt || i), String(s.lastFetchStatus || ""), Math.max(0, Number(s.lastFetchCount) || 0), i, String(o)).run(), !0;
    },
    async getDnsIpPoolFetchCacheEntry(r, o = "") {
      if (!r || !o) return null;
      await e.ensureDnsIpWorkspaceSchema(r);
      try {
        const s = await r.prepare(`SELECT signature, items_json, source_results_json, imported_count, enabled_source_count, cached_at, expires_at, created_at, updated_at
              FROM ${e.DNS_IP_POOL_FETCH_CACHE_TABLE}
              WHERE signature = ? AND expires_at > ?
              LIMIT 1`).bind(String(o), k()).first();
        if (!s) return null;
        const i = JSON.parse(String(s.items_json || "[]")), c = JSON.parse(String(s.source_results_json || "[]")), l = ur(Array.isArray(i) ? i : []), u = Array.isArray(c) ? c : [];
        return {
          signature: String(s.signature || ""),
          items: l,
          sourceResults: u,
          importedCount: Math.max(0, Number(s.imported_count) || l.length),
          enabledSourceCount: Math.max(0, Number(s.enabled_source_count) || 0),
          cachedAtMs: Math.max(0, Number(s.cached_at) || 0),
          expiresAtMs: Math.max(0, Number(s.expires_at) || 0),
          createdAt: String(s.created_at || ""),
          updatedAt: String(s.updated_at || "")
        };
      } catch {
        return null;
      }
    },
    async upsertDnsIpPoolFetchCacheEntry(r, o = {}) {
      if (!r) return null;
      await e.ensureDnsIpWorkspaceSchema(r);
      const s = String(o?.signature || "").trim();
      if (!s) return null;
      const i = ur(o?.items || []), c = (Array.isArray(o?.sourceResults) ? o.sourceResults : []).map((g) => Vs(g, g)), l = Math.max(0, Number(o?.cachedAtMs ?? o?.cached_at ?? k()) || k()), u = Math.max(l, Number(o?.expiresAtMs ?? o?.expires_at ?? l + 24e5) || l + 24e5), d = String(o?.createdAt || o?.created_at || new Date(l).toISOString()), f = String(o?.updatedAt || o?.updated_at || new Date(l).toISOString()), m = Math.max(0, Number(o?.importedCount ?? o?.imported_count) || i.length), p = Math.max(0, Number(o?.enabledSourceCount ?? o?.enabled_source_count) || 0);
      return await r.prepare(`INSERT INTO ${e.DNS_IP_POOL_FETCH_CACHE_TABLE} (
            signature, items_json, source_results_json, imported_count, enabled_source_count, cached_at, expires_at, created_at, updated_at
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
          ON CONFLICT(signature) DO UPDATE SET
            items_json = excluded.items_json,
            source_results_json = excluded.source_results_json,
            imported_count = excluded.imported_count,
            enabled_source_count = excluded.enabled_source_count,
            cached_at = excluded.cached_at,
            expires_at = excluded.expires_at,
            updated_at = excluded.updated_at`).bind(s, JSON.stringify(i), JSON.stringify(c), m, p, l, u, d, f).run(), {
        signature: s,
        items: i,
        sourceResults: c,
        importedCount: m,
        enabledSourceCount: p,
        cachedAtMs: l,
        expiresAtMs: u,
        createdAt: d,
        updatedAt: f
      };
    },
    async getDnsIpProbeCacheEntry(r, o = "", s = "") {
      if (!r || !o || !s) return null;
      await e.ensureDnsIpWorkspaceSchema(r);
      try {
        const i = await r.prepare(`SELECT ip, entry_colo, probe_status, latency_ms, cf_ray, colo_code, city_name, country_code, country_name, probed_at, expires_at
              FROM ${e.DNS_IP_PROBE_CACHE_TABLE}
              WHERE ip = ? AND entry_colo = ? AND expires_at > ?
              LIMIT 1`).bind(String(o), String(s).toUpperCase(), k()).first();
        return i ? {
          ip: String(i.ip || ""),
          entryColo: String(i.entry_colo || "").toUpperCase(),
          probeStatus: Na(i.probe_status),
          latencyMs: Number.isFinite(Number(i.latency_ms)) ? Math.round(Number(i.latency_ms)) : null,
          cfRay: String(i.cf_ray || ""),
          coloCode: String(i.colo_code || "").toUpperCase(),
          cityName: String(i.city_name || ""),
          countryCode: String(i.country_code || "").toUpperCase(),
          countryName: String(i.country_name || ""),
          probedAt: String(i.probed_at || ""),
          expiresAt: Math.max(0, Number(i.expires_at) || 0)
        } : null;
      } catch {
        return null;
      }
    },
    async getDnsIpProbeCacheEntries(r, o = [], s = "") {
      if (!r || !s) return [];
      const i = [...new Set((Array.isArray(o) ? o : []).map((u) => String(u || "").trim()).filter(Boolean))];
      if (!i.length) return [];
      await e.ensureDnsIpWorkspaceSchema(r);
      const c = [], l = k();
      try {
        for (let u = 0; u < i.length; u += 98) {
          const d = i.slice(u, u + 98);
          if (!d.length) continue;
          const f = d.map(() => "?").join(", "), m = await r.prepare(`SELECT ip, entry_colo, probe_status, latency_ms, cf_ray, colo_code, city_name, country_code, country_name, probed_at, expires_at
                FROM ${e.DNS_IP_PROBE_CACHE_TABLE}
                WHERE entry_colo = ? AND expires_at > ? AND ip IN (${f})`).bind(String(s).toUpperCase(), l, ...d).all();
          c.push(...Array.isArray(m?.results) ? m.results : []);
        }
      } catch {
        return [];
      }
      return c.map((u) => ({
        ip: String(u?.ip || ""),
        entryColo: String(u?.entry_colo || "").toUpperCase(),
        probeStatus: Na(u?.probe_status),
        latencyMs: Number.isFinite(Number(u?.latency_ms)) ? Math.round(Number(u?.latency_ms)) : null,
        cfRay: String(u?.cf_ray || ""),
        coloCode: String(u?.colo_code || "").toUpperCase(),
        cityName: String(u?.city_name || ""),
        countryCode: String(u?.country_code || "").toUpperCase(),
        countryName: String(u?.country_name || ""),
        probedAt: String(u?.probed_at || ""),
        expiresAt: Math.max(0, Number(u?.expires_at) || 0)
      }));
    },
    async upsertDnsIpProbeCacheEntry(r, o = {}) {
      if (!r) return null;
      await e.ensureDnsIpWorkspaceSchema(r);
      const s = String(o?.ip || "").trim(), i = String(o?.entryColo || o?.entry_colo || "").trim().toUpperCase(), c = Na(o?.probeStatus || o?.probe_status || "");
      if (!s || !i) return null;
      const l = Math.max(k(), Number(o?.expiresAt ?? o?.expires_at) || 0), u = String(o?.probedAt || o?.probed_at || (/* @__PURE__ */ new Date()).toISOString());
      return await r.prepare(`INSERT INTO ${e.DNS_IP_PROBE_CACHE_TABLE} (
            ip, entry_colo, probe_status, latency_ms, cf_ray, colo_code, city_name, country_code, country_name, probed_at, expires_at
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
          ON CONFLICT(ip, entry_colo) DO UPDATE SET
            probe_status = excluded.probe_status,
            latency_ms = excluded.latency_ms,
            cf_ray = excluded.cf_ray,
            colo_code = excluded.colo_code,
            city_name = excluded.city_name,
            country_code = excluded.country_code,
            country_name = excluded.country_name,
            probed_at = excluded.probed_at,
            expires_at = excluded.expires_at`).bind(s, i, c, Number.isFinite(Number(o?.latencyMs ?? o?.latency_ms)) ? Math.round(Number(o?.latencyMs ?? o?.latency_ms)) : null, String(o?.cfRay || o?.cf_ray || ""), String(o?.coloCode || o?.colo_code || "").toUpperCase(), String(o?.cityName || o?.city_name || ""), String(o?.countryCode || o?.country_code || "").toUpperCase(), String(o?.countryName || o?.country_name || ""), u, l).run(), {
        ip: s,
        entryColo: i,
        probeStatus: c,
        latencyMs: Number.isFinite(Number(o?.latencyMs ?? o?.latency_ms)) ? Math.round(Number(o?.latencyMs ?? o?.latency_ms)) : null,
        cfRay: String(o?.cfRay || o?.cf_ray || ""),
        coloCode: String(o?.coloCode || o?.colo_code || "").toUpperCase(),
        cityName: String(o?.cityName || o?.city_name || ""),
        countryCode: String(o?.countryCode || o?.country_code || "").toUpperCase(),
        countryName: String(o?.countryName || o?.country_name || ""),
        probedAt: u,
        expiresAt: l
      };
    }
  };
}
function Xp(n = {}, e = {}) {
  const { CacheManager: a, withAdminShellRuntimeStatus: t } = n;
  return {
    resolveOpsStatusStores(r) {
      return r && typeof r == "object" && !Array.isArray(r) && ("kv" in r || "db" in r) ? {
        kv: r.kv || null,
        db: r.db || null
      } : r && typeof r.prepare == "function" ? {
        kv: null,
        db: r
      } : r && typeof r.get == "function" ? {
        kv: r,
        db: null
      } : {
        kv: e.getKV(r),
        db: e.getDB(r)
      };
    },
    getOpsStatusDbScope(r = "") {
      return r ? e.OPS_STATUS_SECTION_SCOPES[r] || `ops_status:${r}` : e.OPS_STATUS_DB_SCOPE_ROOT;
    },
    getOpsStatusShadowState(r) {
      if (!r || typeof r.prepare != "function") return null;
      let o = Z.OpsStatusShadowCache.get(r);
      return o || (o = {
        pendingPatch: {},
        flushPromise: null,
        payloadCache: /* @__PURE__ */ new Map()
      }, Z.OpsStatusShadowCache.set(r, o)), o;
    },
    getOpsStatusShadowPatch(r) {
      const o = e.getOpsStatusShadowState(r);
      return F(o?.pendingPatch) ? o.pendingPatch : {};
    },
    getOpsStatusPayloadCache(r) {
      const o = e.getOpsStatusShadowState(r);
      return o ? (o.payloadCache instanceof Map || (o.payloadCache = /* @__PURE__ */ new Map()), o.payloadCache) : null;
    },
    cacheOpsStatusPayload(r, o, s) {
      const i = e.getOpsStatusPayloadCache(r);
      i && Ie(i, String(o || ""), {
        payload: s && typeof s == "object" ? s : null,
        expiresAt: k() + Math.max(1e3, Number(O.Defaults.OpsStatusReadCacheTtlMs) || 1e3)
      }, 8);
    },
    buildOpsStatusRootPatch(r = {}) {
      const o = r && typeof r == "object" ? r : {}, s = (/* @__PURE__ */ new Date()).toISOString(), i = {};
      for (const [c, l] of Object.entries(o)) {
        if (e.OPS_STATUS_SECTION_SCOPES[c]) {
          const u = Ge(i[c], l);
          u.updatedAt = s, i[c] = u;
          continue;
        }
        i[c] = l;
      }
      return i;
    },
    async flushOpsStatusShadow(r, o = {}) {
      const s = r?.db || null;
      if (!s) return {};
      const i = Array.isArray(o.patchKeys) ? o.patchKeys : [], c = e.getOpsStatusShadowState(s);
      if (!c) return {};
      if (c.flushPromise) return c.flushPromise;
      const l = (async () => {
        const u = F(c.pendingPatch) ? c.pendingPatch : {};
        if (!Object.keys(u).length) return await e.getOpsStatusFromStores(r);
        c.pendingPatch = {};
        try {
          const d = k(), f = new Date(d).toISOString();
          if (!await e.ensureSysStatusTable(s))
            return Me("ops_status.db_unavailable", /* @__PURE__ */ new Error("sys_status table unavailable"), { patchKeys: i }), c.pendingPatch = Ge(u, c.pendingPatch), await e.getOpsStatusFromStores(r);
          const m = await e.getOpsStatusPayloadFromDb(s, e.getOpsStatusDbScope()), p = Ge(m && typeof m == "object" ? m : {}, u);
          return p.updatedAt = f, await e.putOpsStatusPayloadToDb(s, e.getOpsStatusDbScope(), p, d), Ge(p, e.getOpsStatusShadowPatch(s));
        } catch (d) {
          throw c.pendingPatch = Ge(u, c.pendingPatch), d;
        }
      })().finally(() => {
        c.flushPromise === l && (c.flushPromise = null);
      });
      return c.flushPromise = l, l;
    },
    async ensureSysStatusTable(r) {
      if (!r || typeof r.prepare != "function") return !1;
      if (e.isD1SchemaReadyCached(r, "sysStatusTable")) return !0;
      let o = Z.OpsStatusDbReady.get(r);
      o || (o = (async () => {
        try {
          return await r.prepare(`CREATE TABLE IF NOT EXISTS ${e.SYS_STATUS_TABLE} (scope TEXT PRIMARY KEY, payload TEXT NOT NULL, updated_at INTEGER NOT NULL)`).run(), e.markD1SchemaReady(r, "sysStatusTable"), !0;
        } catch (s) {
          return console.warn("sys_status init failed", s), !1;
        }
      })(), Z.OpsStatusDbReady.set(r, o));
      try {
        return await o;
      } finally {
        Z.OpsStatusDbReady.get(r) === o && Z.OpsStatusDbReady.delete(r);
      }
    },
    async ensureAuthFailuresTable(r) {
      if (!r || typeof r.prepare != "function") return !1;
      if (e.isD1SchemaReadyCached(r, "authFailuresTable")) return !0;
      let o = Z.AuthFailuresDbReady.get(r);
      o || (o = (async () => {
        try {
          return await r.prepare(`CREATE TABLE IF NOT EXISTS ${e.AUTH_FAILURES_TABLE} (
                  ip TEXT PRIMARY KEY,
                  fail_count INTEGER NOT NULL,
                  expires_at INTEGER NOT NULL,
                  updated_at INTEGER NOT NULL
                )`).run(), await r.prepare(`CREATE INDEX IF NOT EXISTS idx_auth_failures_expires_at ON ${e.AUTH_FAILURES_TABLE} (expires_at)`).run(), e.markD1SchemaReady(r, "authFailuresTable"), !0;
        } catch (s) {
          return console.warn("auth_failures init failed", s), !1;
        }
      })(), Z.AuthFailuresDbReady.set(r, o));
      try {
        return await o;
      } finally {
        Z.AuthFailuresDbReady.get(r) === o && Z.AuthFailuresDbReady.delete(r);
      }
    },
    async getAuthFailureEntry(r, o = "") {
      const s = String(o || "").trim();
      if (!s || !r || !await e.ensureAuthFailuresTable(r)) return null;
      try {
        const i = await r.prepare(`SELECT ip, fail_count, expires_at, updated_at
              FROM ${e.AUTH_FAILURES_TABLE}
              WHERE ip = ?
              LIMIT 1`).bind(s).first();
        if (!i) return null;
        const c = Number(i?.expires_at ?? i?.expiresAt) || 0;
        return c > 0 && c <= k() ? (await e.deleteAuthFailureEntry(r, s).catch(() => !1), null) : {
          ip: s,
          failCount: Math.max(0, Number(i?.fail_count ?? i?.failCount) || 0),
          expiresAt: c,
          updatedAt: Number(i?.updated_at ?? i?.updatedAt) || 0
        };
      } catch (i) {
        return Me("auth_failures.read_failed", i, { ip: s }), null;
      }
    },
    async upsertAuthFailureEntry(r, o = "", s = {}) {
      const i = String(o || "").trim();
      if (!i || !r || !await e.ensureAuthFailuresTable(r)) return null;
      const c = Math.max(0, Number(s?.failCount) || 0), l = Math.max(0, Number(s?.expiresAt) || 0), u = Math.max(0, Number(s?.updatedAt) || k());
      return await r.prepare(`INSERT INTO ${e.AUTH_FAILURES_TABLE} (ip, fail_count, expires_at, updated_at)
            VALUES (?, ?, ?, ?)
            ON CONFLICT(ip) DO UPDATE SET
              fail_count = excluded.fail_count,
              expires_at = excluded.expires_at,
              updated_at = excluded.updated_at`).bind(i, c, l, u).run(), {
        ip: i,
        failCount: c,
        expiresAt: l,
        updatedAt: u
      };
    },
    async deleteAuthFailureEntry(r, o = "") {
      const s = String(o || "").trim();
      return !s || !r || !await e.ensureAuthFailuresTable(r) ? !1 : (await r.prepare(`DELETE FROM ${e.AUTH_FAILURES_TABLE} WHERE ip = ?`).bind(s).run(), !0);
    }
  };
}
function Yp(n = {}, e = {}) {
  const { CacheManager: a, withAdminShellRuntimeStatus: t } = n;
  return {
    async ensureCfDashboardCacheTable(r) {
      if (!r || typeof r.prepare != "function") return !1;
      if (e.isD1SchemaReadyCached(r, "cfDashboardCacheTable")) return !0;
      let o = Z.CfDashboardCacheDbReady.get(r);
      o || (o = (async () => {
        try {
          return await r.prepare(`CREATE TABLE IF NOT EXISTS ${e.CF_DASH_CACHE_TABLE} (
                  cache_key TEXT PRIMARY KEY,
                  zone_id TEXT NOT NULL,
                  bucket_date TEXT NOT NULL,
                  payload TEXT NOT NULL,
                  version INTEGER NOT NULL,
                  cached_at INTEGER NOT NULL,
                  expires_at INTEGER NOT NULL,
                  updated_at INTEGER NOT NULL
                )`).run(), await r.prepare(`CREATE INDEX IF NOT EXISTS idx_cf_dashboard_cache_expires_at ON ${e.CF_DASH_CACHE_TABLE} (expires_at)`).run(), e.markD1SchemaReady(r, "cfDashboardCacheTable"), !0;
        } catch (s) {
          return console.warn("cf_dashboard_cache init failed", s), !1;
        }
      })(), Z.CfDashboardCacheDbReady.set(r, o));
      try {
        return await o;
      } finally {
        Z.CfDashboardCacheDbReady.get(r) === o && Z.CfDashboardCacheDbReady.delete(r);
      }
    },
    async getCfDashboardCacheEntry(r, o = "", s = {}) {
      const i = String(o || "").trim();
      if (!i || !r || !await e.ensureCfDashboardCacheTable(r)) return null;
      const c = Math.max(0, Number(s.nowMs) || k()), l = s.includeExpired === !0, u = l ? `SELECT cache_key, zone_id, bucket_date, payload, version, cached_at, expires_at, updated_at
                FROM ${e.CF_DASH_CACHE_TABLE}
                WHERE cache_key = ?
                LIMIT 1` : `SELECT cache_key, zone_id, bucket_date, payload, version, cached_at, expires_at, updated_at
                FROM ${e.CF_DASH_CACHE_TABLE}
                WHERE cache_key = ? AND expires_at > ?
                LIMIT 1`;
      try {
        let d = r.prepare(u).bind(i);
        l || (d = r.prepare(u).bind(i, c));
        const f = await d.first();
        if (!f?.payload) return null;
        let m = null;
        try {
          m = JSON.parse(String(f.payload || "{}"));
        } catch {
          return null;
        }
        return {
          cacheKey: i,
          zoneId: String(f?.zone_id || f?.zoneId || ""),
          bucketDate: String(f?.bucket_date || f?.bucketDate || ""),
          payload: qn(m),
          version: Number(f?.version) || 0,
          cachedAt: Number(f?.cached_at ?? f?.cachedAt) || 0,
          expiresAt: Number(f?.expires_at ?? f?.expiresAt) || 0,
          updatedAt: Number(f?.updated_at ?? f?.updatedAt) || 0
        };
      } catch (d) {
        return Me("cf_dashboard_cache.read_failed", d, { cacheKey: i }), null;
      }
    },
    async putCfDashboardCacheEntry(r, o = {}) {
      if (!r || !await e.ensureCfDashboardCacheTable(r)) return null;
      const s = String(o?.cacheKey || "").trim();
      if (!s) return null;
      const i = String(o?.zoneId || "").trim() || "default", c = String(o?.bucketDate || "").trim() || "current", l = Math.max(0, Number(o?.version) || 0), u = Math.max(0, Number(o?.cachedAt) || k()), d = Math.max(u, Number(o?.expiresAt) || u), f = Math.max(u, Number(o?.updatedAt) || u), m = JSON.stringify(qn(o?.payload || {}));
      return await r.prepare(`INSERT INTO ${e.CF_DASH_CACHE_TABLE} (
            cache_key, zone_id, bucket_date, payload, version, cached_at, expires_at, updated_at
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
          ON CONFLICT(cache_key) DO UPDATE SET
            zone_id = excluded.zone_id,
            bucket_date = excluded.bucket_date,
            payload = excluded.payload,
            version = excluded.version,
            cached_at = excluded.cached_at,
            expires_at = excluded.expires_at,
            updated_at = excluded.updated_at`).bind(s, i, c, m, l, u, d, f).run(), {
        cacheKey: s,
        zoneId: i,
        bucketDate: c,
        version: l,
        cachedAt: u,
        expiresAt: d,
        updatedAt: f
      };
    },
    async deleteCfDashboardCacheEntry(r, o = "") {
      const s = String(o || "").trim();
      if (!s || !r || !await e.ensureCfDashboardCacheTable(r)) return !1;
      try {
        return await r.prepare(`DELETE FROM ${e.CF_DASH_CACHE_TABLE} WHERE cache_key = ?`).bind(s).run(), !0;
      } catch (i) {
        return Me("cf_dashboard_cache.delete_failed", i, { cacheKey: s }), !1;
      }
    },
    async invalidateDashboardSnapshotCacheForConfigChange(r, o = {}) {
      const s = o?.db || e.getDB(r);
      if (!s) return 0;
      const i = Math.max(0, Number(o.nowMs) || k()), c = /* @__PURE__ */ new Set();
      for (const l of [o?.prevConfig, o?.nextConfig]) {
        if (!l || typeof l != "object") continue;
        const u = te(l), d = dt(new Date(i), u.scheduleUtcOffsetMinutes);
        c.add(Gn(u.cfZoneId, d.dateKey));
      }
      return c.size ? (await ge(Promise.all([...c].map((l) => e.deleteCfDashboardCacheEntry(s, l))), "dashboard.cache_invalidate", { cacheKeys: [...c] }, null), c.size) : 0;
    },
    async ensureCfRuntimeCacheTable(r) {
      if (!r || typeof r.prepare != "function") return !1;
      if (e.isD1SchemaReadyCached(r, "cfRuntimeCacheTable")) return !0;
      let o = Z.CfRuntimeCacheDbReady.get(r);
      o || (o = (async () => {
        try {
          return await r.prepare(`CREATE TABLE IF NOT EXISTS ${e.CF_RUNTIME_CACHE_TABLE} (
                  cache_key TEXT PRIMARY KEY,
                  cache_group TEXT NOT NULL,
                  resource_id TEXT NOT NULL,
                  payload TEXT NOT NULL,
                  cached_at INTEGER NOT NULL,
                  expires_at INTEGER NOT NULL,
                  updated_at INTEGER NOT NULL
                )`).run(), await r.prepare(`CREATE INDEX IF NOT EXISTS idx_cf_runtime_cache_expires_at ON ${e.CF_RUNTIME_CACHE_TABLE} (expires_at)`).run(), e.markD1SchemaReady(r, "cfRuntimeCacheTable"), !0;
        } catch (s) {
          return console.warn("cf_runtime_cache init failed", s), !1;
        }
      })(), Z.CfRuntimeCacheDbReady.set(r, o));
      try {
        return await o;
      } finally {
        Z.CfRuntimeCacheDbReady.get(r) === o && Z.CfRuntimeCacheDbReady.delete(r);
      }
    },
    async getCfRuntimeCacheEntry(r, o = "", s = {}) {
      const i = String(o || "").trim();
      if (!i || !r || !await e.ensureCfRuntimeCacheTable(r)) return null;
      const c = Math.max(0, Number(s.nowMs) || k()), l = s.includeExpired === !0, u = l ? `SELECT cache_key, cache_group, resource_id, payload, cached_at, expires_at, updated_at
                FROM ${e.CF_RUNTIME_CACHE_TABLE}
                WHERE cache_key = ?
                LIMIT 1` : `SELECT cache_key, cache_group, resource_id, payload, cached_at, expires_at, updated_at
                FROM ${e.CF_RUNTIME_CACHE_TABLE}
                WHERE cache_key = ? AND expires_at > ?
                LIMIT 1`;
      try {
        let d = r.prepare(u).bind(i);
        l || (d = r.prepare(u).bind(i, c));
        const f = await d.first();
        if (!f?.payload) return null;
        let m = null;
        try {
          m = JSON.parse(String(f.payload || "{}"));
        } catch {
          return null;
        }
        return {
          cacheKey: i,
          cacheGroup: String(f?.cache_group || f?.cacheGroup || ""),
          resourceId: String(f?.resource_id || f?.resourceId || ""),
          payload: (F(m), m),
          cachedAt: Number(f?.cached_at ?? f?.cachedAt) || 0,
          expiresAt: Number(f?.expires_at ?? f?.expiresAt) || 0,
          updatedAt: Number(f?.updated_at ?? f?.updatedAt) || 0
        };
      } catch (d) {
        return Me("cf_runtime_cache.read_failed", d, { cacheKey: i }), null;
      }
    },
    async putCfRuntimeCacheEntry(r, o = {}) {
      if (!r || !await e.ensureCfRuntimeCacheTable(r)) return null;
      const s = String(o?.cacheKey || "").trim();
      if (!s) return null;
      const i = String(o?.cacheGroup || "").trim() || "runtime", c = String(o?.resourceId || "").trim() || "default", l = Math.max(0, Number(o?.cachedAt) || k()), u = Math.max(l, Number(o?.expiresAt) || l), d = Math.max(l, Number(o?.updatedAt) || l), f = JSON.stringify(o?.payload ?? {});
      return await r.prepare(`INSERT INTO ${e.CF_RUNTIME_CACHE_TABLE} (
            cache_key, cache_group, resource_id, payload, cached_at, expires_at, updated_at
          ) VALUES (?, ?, ?, ?, ?, ?, ?)
          ON CONFLICT(cache_key) DO UPDATE SET
            cache_group = excluded.cache_group,
            resource_id = excluded.resource_id,
            payload = excluded.payload,
            cached_at = excluded.cached_at,
            expires_at = excluded.expires_at,
            updated_at = excluded.updated_at`).bind(s, i, c, f, l, u, d).run(), {
        cacheKey: s,
        cacheGroup: i,
        resourceId: c,
        cachedAt: l,
        expiresAt: u,
        updatedAt: d
      };
    },
    async loadCfRuntimeCachePayload(r, o = {}) {
      const s = String(o.cacheKey || "").trim(), i = String(o.cacheGroup || "").trim() || "runtime", c = String(o.resourceId || "").trim() || "default", l = Math.max(1e3, Number(o.ttlMs) || 3e5), u = Math.max(0, Number(o.nowMs) || k()), d = o.skipCacheRead === !0, f = typeof o.loader == "function" ? o.loader : null;
      if (!s || !f) throw new Error("cf_runtime_cache_loader_missing");
      const m = r ? await e.getCfRuntimeCacheEntry(r, s, {
        nowMs: u,
        includeExpired: !0
      }) : null, p = !d && m && m.expiresAt > u ? m : null;
      if (p?.payload !== void 0) return {
        payload: p.payload,
        cachedAt: p.cachedAt,
        expiresAt: p.expiresAt,
        updatedAt: p.updatedAt,
        stale: !1,
        source: "d1_cache",
        error: null
      };
      const g = m;
      try {
        return {
          payload: await kt(et([
            "cf_runtime",
            i,
            s
          ]), async () => {
            const h = await f();
            return r && await ge(e.putCfRuntimeCacheEntry(r, {
              cacheKey: s,
              cacheGroup: i,
              resourceId: c,
              payload: h,
              cachedAt: u,
              expiresAt: u + l,
              updatedAt: u
            }), "cf_runtime_cache.write", {
              cacheKey: s,
              cacheGroup: i,
              resourceId: c
            }, null), h;
          }),
          cachedAt: u,
          expiresAt: u + l,
          updatedAt: u,
          stale: !1,
          source: r ? "live_then_cached" : "live",
          error: null
        };
      } catch (h) {
        if (g?.payload !== void 0 && o.allowStale !== !1) return {
          payload: g.payload,
          cachedAt: g.cachedAt,
          expiresAt: g.expiresAt,
          updatedAt: g.updatedAt,
          stale: !0,
          source: "stale_cache",
          error: h
        };
        throw h;
      }
    }
  };
}
function Jp(n = {}, e = {}) {
  const { CacheManager: a, withAdminShellRuntimeStatus: t } = n;
  return {
    buildCloudflareKvQuotaCard({ planProfile: r = {}, planState: o = {}, usageState: s = {}, namespaceId: i = "", nowTimestamp: c = k() } = {}) {
      const l = pa(r?.planClass), u = F(s?.payload) ? s.payload : {}, d = String(u.namespaceTitle || r?.resourceMeta?.kv?.namespaceTitle || i || "未命名 Namespace").trim(), f = [
        _r({
          key: "read",
          label: "读",
          used: u.readCount,
          limit: l.kv.read,
          kind: "count"
        }),
        _r({
          key: "write",
          label: "写",
          used: u.writeCount,
          limit: l.kv.write,
          kind: "count"
        }),
        _r({
          key: "storage",
          label: "容量",
          used: u.storageBytes,
          limit: l.kv.storageBytes,
          kind: "bytes"
        })
      ], m = [];
      o?.stale === !0 && m.push("计划信息"), s?.stale === !0 && m.push("实时指标");
      const p = [];
      m.length > 0 && p.push(`${m.join("、")} 使用 stale cache`), p.push(`delete：${ye(u.deleteCount)} / ${ye(l.kv.delete)}`), p.push(`list：${ye(u.listCount)} / ${ye(l.kv.list)}`), p.push(`命名空间：${d}`);
      const g = es(s?.cachedAt, c);
      g && p.push(g), p.push(l.planClass === "paid" ? "容量条按 1 GB included quota 展示，PAID 下这是 included quota，不是硬停止线" : "容量条按 1 GB included quota 展示");
      const h = ts(f);
      return h.length > 0 && p.push(`超额项目：${h.join("、")}（进度条按 100% 封顶）`), s?.error && p.push(`Cloudflare 详情：${Ft(s.error)}`), Va({
        title: "KV",
        status: m.length > 0 ? "partial_failure" : "success",
        summary: `${l.planLabel} 计划 · ${l.periodLabel}配额`,
        detail: p.join("；"),
        planLabel: l.planLabel,
        periodLabel: l.periodLabel,
        resourceLabel: d,
        metrics: f
      });
    },
    buildCloudflareD1QuotaCard({ planProfile: r = {}, planState: o = {}, usageState: s = {}, databaseId: i = "", nowTimestamp: c = k() } = {}) {
      const l = pa(r?.planClass), u = F(s?.payload) ? s.payload : {}, d = String(u.databaseName || r?.resourceMeta?.d1?.databaseName || i || "未命名数据库").trim(), f = [
        _r({
          key: "rowsRead",
          label: "读",
          used: u.rowsRead,
          limit: l.d1.rowsRead,
          kind: "count"
        }),
        _r({
          key: "rowsWritten",
          label: "写",
          used: u.rowsWritten,
          limit: l.d1.rowsWritten,
          kind: "count"
        }),
        _r({
          key: "storage",
          label: "容量",
          used: u.fileSizeBytes,
          limit: l.d1.storageBytes,
          kind: "bytes"
        })
      ], m = [];
      o?.stale === !0 && m.push("计划信息"), s?.stale === !0 && m.push("实时指标");
      const p = [];
      m.length > 0 && p.push(`${m.join("、")} 使用 stale cache`), p.push(`SQL 次数：读 ${ye(u.readQueries)} / 写 ${ye(u.writeQueries)}`), p.push(`数据库：${d}`);
      const g = es(s?.cachedAt, c);
      g && p.push(g), p.push(`容量条按单库硬上限 ${Wa(l.d1.storageBytes)} 展示`);
      const h = ts(f);
      return h.length > 0 && p.push(`超额项目：${h.join("、")}（进度条按 100% 封顶）`), s?.error && p.push(`Cloudflare 详情：${Ft(s.error)}`), Va({
        title: "D1",
        status: m.length > 0 ? "partial_failure" : "success",
        summary: `${l.planLabel} 计划 · ${l.periodLabel}配额`,
        detail: p.join("；"),
        planLabel: l.planLabel,
        periodLabel: l.periodLabel,
        resourceLabel: d,
        metrics: f
      });
    },
    async buildDashboardD1WriteHotspotPayload(r, o = {}) {
      const s = te(o?.config || await ue(r)), i = Math.max(0, Number(o?.nowMs) || k()), c = ke(s.scheduleUtcOffsetMinutes), l = String(s.cfAccountId || "").trim(), u = String(s.cfApiToken || "").trim(), d = String(s.cfD1DatabaseId || "").trim(), f = {
        utcOffsetMinutes: c,
        nowMs: i,
        source: "cloudflare_d1_analytics"
      };
      if (!l || !u || !d) return Xa({
        ...f,
        status: "unconfigured",
        summary: "D1 写入热点尚未启用",
        detail: "请先在账号设置中填写 Cloudflare 账号 ID、API 令牌与 D1 Database ID。"
      });
      const m = dt(new Date(i), c).startTs - 8640 * 60 * 1e3, p = await jd({
        accountId: l,
        apiToken: u,
        databaseId: d,
        startIso: new Date(m).toISOString(),
        endIso: new Date(i).toISOString(),
        utcOffsetMinutes: c
      }), g = new Map(p.map((E) => [`${E.dateKey}:${E.hour}`, E])), h = fc(), y = [];
      let S = 0, _ = 0, A = 0, b = null;
      for (const E of p)
        S += Math.max(0, Number(E?.rowsWritten) || 0), _ += Math.max(0, Number(E?.writeQueries) || 0), (Number(E?.rowsWritten) || 0) > A && (A = Math.max(0, Number(E?.rowsWritten) || 0), b = E);
      for (let E = 0; E < 7; E += 1) {
        const D = Wt(m + E * 24 * 60 * 60 * 1e3, c).dateKey;
        y.push({
          key: D,
          dateKey: D,
          label: jn(D),
          cells: Array.from({ length: 24 }, (w, C) => {
            const T = g.get(`${D}:${C}`) || null, I = Math.max(0, Number(T?.rowsWritten) || 0), P = Math.max(0, Number(T?.writeQueries) || 0), U = A > 0 ? I / A : 0;
            return mc(D, C, I, P, U);
          })
        });
      }
      const R = b ? `峰值：${jn(b.dateKey)} ${String(b.hour).padStart(2, "0")}:00 写入 ${ye(b.rowsWritten)} 行 / SQL ${ye(b.writeQueries)} 次` : "";
      return {
        title: "D1 写入热点图",
        status: "success",
        source: "cloudflare_d1_analytics",
        summary: S > 0 ? `最近 7 天累计写入 ${ye(S)} 行` : "最近 7 天未检测到 D1 写入",
        detail: S > 0 ? "热点强度按 rowsWritten 计算；悬停单元格可查看对应小时的 SQL 写次数。" : "Cloudflare D1 Analytics 当前窗口内没有返回 rowsWritten 数据。",
        periodLabel: `最近 7 天 · ${io(c)}`,
        hourLabels: h,
        rows: y,
        available: S > 0,
        totalRowsWritten: S,
        totalWriteQueries: _,
        peakLabel: R,
        legendMaxLabel: ye(A)
      };
    },
    async buildDashboardMonthlyTrafficPayload(r, o = {}) {
      const s = te(o?.config || await ue(r)), i = Math.max(0, Number(o.nowMs) || k()), c = o?.monthWindow || hs(new Date(i), s.scheduleUtcOffsetMinutes), l = String(s.cfZoneId || "").trim(), u = String(s.cfApiToken || "").trim(), d = {
        period: "month",
        periodKey: c.monthKey,
        periodLabel: c.periodLabel,
        generatedAt: new Date(i).toISOString(),
        cacheStatus: "live"
      };
      if (!l || !u) return qt({
        ...d,
        traffic: "未配置",
        cfAnalyticsLoaded: !1,
        cfAnalyticsStatus: "未配置 Cloudflare",
        cfAnalyticsError: "请在账号设置中填写并保存 Cloudflare Zone ID 与 API 令牌",
        trafficSourceText: "本月视频流量：未配置 Cloudflare，无法获取 CF Zone 总流量"
      });
      const f = (S, _) => `
            query {
              viewer {
                zones(filter: { zoneTag: ${_e(l)} }) {
                  series: httpRequestsAdaptiveGroups(limit: 10000, filter: { datetime_geq: ${_e(new Date(S).toISOString())}, datetime_leq: ${_e(new Date(_).toISOString())} }) {
                    sum { edgeResponseBytes }
                  }
                }
              }
            }`, m = async (S, _) => {
        const A = await ji(l, u, f(S, _));
        if (!A) throw new Error("cf_graphql_empty_zone");
        return (Array.isArray(A.series) ? A.series : []).reduce((b, R) => b + Math.max(0, Number(R?.sum?.edgeResponseBytes) || 0), 0);
      }, p = 1440 * 60 * 1e3, g = [];
      for (let S = c.startTs; S <= c.endTs; S += p) g.push({
        startTs: S,
        endTs: Math.min(c.endTs, S + p - 1)
      });
      let h = 0;
      const y = 4;
      for (let S = 0; S < g.length; S += y) {
        const _ = await Promise.all(g.slice(S, S + y).map(({ startTs: A, endTs: b }) => m(A, b)));
        h += _.reduce((A, b) => A + b, 0);
      }
      return qt({
        ...d,
        traffic: Wa(h),
        totalBytes: h,
        cfAnalyticsLoaded: !0,
        cfAnalyticsStatus: "Cloudflare 统计正常",
        cfAnalyticsError: "",
        cfAnalyticsDetail: "",
        trafficSourceText: `${c.periodLabel}视频流量：CF Zone 总流量（edgeResponseBytes）`
      });
    },
    async getDashboardMonthlyTrafficPayload(r, o = {}) {
      const s = te(o?.config || await ue(r)), i = o?.ctx || null, c = o?.forceRefresh === !0, l = Math.max(0, Number(o.nowMs) || k()), u = o?.monthWindow || hs(new Date(l), s.scheduleUtcOffsetMinutes), d = String(s.cfZoneId || "").trim();
      if (!d || !String(s.cfApiToken || "").trim()) return await e.buildDashboardMonthlyTrafficPayload(r, {
        config: s,
        monthWindow: u,
        nowMs: l
      });
      const f = pm(d, u.monthKey, s.scheduleUtcOffsetMinutes), m = gm(f), p = ir();
      let g = null;
      const h = oe.DashboardMonthlyTrafficCache.get(f);
      if (h?.staleUntil > l) {
        if (Ie(oe.DashboardMonthlyTrafficCache, f, h, 64), g = h, !c && h.expiresAt > l) return qt({
          ...h.payload,
          cacheStatus: "cache"
        });
      } else h && oe.DashboardMonthlyTrafficCache.delete(f);
      if (p && m) try {
        const y = await p.match(m);
        if (y) {
          const S = await xe(y, en), _ = S.exceeded ? null : JSON.parse(S.text || "null");
          if (Number(_?.version) === 1 && String(_?.cacheKey || "") === f && Number(_?.staleUntil) > l && (g = {
            payload: qt(_.payload),
            cachedAt: Number(_.cachedAt) || 0,
            expiresAt: Number(_.expiresAt) || 0,
            staleUntil: Number(_.staleUntil) || 0
          }, Ie(oe.DashboardMonthlyTrafficCache, f, g, 64), !c && g.expiresAt > l))
            return qt({
              ...g.payload,
              cacheStatus: "cache"
            });
        }
      } catch (y) {
        Me("dashboard.monthly_traffic_cache_read_failed", y, { cacheKey: f });
      }
      try {
        return await kt(et([
          "dashboard_monthly_traffic",
          f,
          c ? "force" : "default"
        ]), async () => {
          const y = await e.buildDashboardMonthlyTrafficPayload(r, {
            config: s,
            monthWindow: u,
            nowMs: l
          }), S = l, _ = S + mm, A = S + ps, b = {
            version: 1,
            cacheKey: f,
            cachedAt: S,
            expiresAt: _,
            staleUntil: A,
            payload: y
          };
          if (Ie(oe.DashboardMonthlyTrafficCache, f, {
            payload: y,
            cachedAt: S,
            expiresAt: _,
            staleUntil: A
          }, 64), p && m) {
            const R = p.put(m, new Response(JSON.stringify(b), { headers: {
              "Content-Type": "application/json; charset=utf-8",
              "Cache-Control": `public, max-age=${Math.floor(ps / 1e3)}`
            } }));
            i ? i.waitUntil(ge(R, "dashboard.monthly_traffic_cache_write", { cacheKey: f }, null)) : await ge(R, "dashboard.monthly_traffic_cache_write", { cacheKey: f }, null);
          }
          return y;
        });
      } catch (y) {
        if (g?.payload && g.staleUntil > l) return qt({
          ...g.payload,
          cacheStatus: "stale",
          warning: pc(y, "monthly_traffic_refresh_failed")
        });
        const S = ki(y?.message || y, { zoneId: d });
        return qt({
          periodKey: u.monthKey,
          periodLabel: u.periodLabel,
          traffic: "CF 查询失败",
          cfAnalyticsLoaded: !1,
          cfAnalyticsStatus: S.status,
          cfAnalyticsError: S.hint,
          cfAnalyticsDetail: S.detail,
          trafficSourceText: `${u.periodLabel}视频流量：CF Zone 总流量（edgeResponseBytes）`,
          generatedAt: new Date(l).toISOString(),
          cacheStatus: "live"
        });
      }
    }
  };
}
function Qp(n = {}, e = {}) {
  const { CacheManager: a, withAdminShellRuntimeStatus: t } = n;
  return {
    async buildDashboardStatsPayload(r, o = {}) {
      const s = o?.ctx || null, i = o?.kv || e.getKV(r), c = o?.db || e.getDB(r), l = te(o?.config || await ue(r)), u = Math.max(0, Number(o.nowMs) || k()), d = o?.dayWindow || dt(new Date(u), l.scheduleUtcOffsetMinutes), f = o?.skipD1WriteHotspot !== !1, m = f ? null : e.buildDashboardD1WriteHotspotPayload(r, {
        config: l,
        nowMs: u
      });
      let p = null, g = "未配置", h = 0, y = !1, S = !1, _ = "", A = "", b = "", R = "pending", E = "等待数据加载", D = "视频流量口径：CF Zone 总流量", w = new Date(u).toISOString(), C = Array.from({ length: 24 }, (v, W) => ({
        label: String(W).padStart(2, "0") + ":00",
        total: 0
      })), T = 0, I = 0, P = "", U = Xa({
        utcOffsetMinutes: l.scheduleUtcOffsetMinutes,
        nowMs: u
      });
      h = (await a.getNodesListStrict(r, s)).length || 0;
      const K = d.dateKey, G = d.startTs, x = d.endTs, N = String(l.cfZoneId || "").trim(), M = String(l.cfApiToken || "").trim();
      if (N && M) {
        const v = new Date(G).toISOString(), W = new Date(x).toISOString(), z = `
                query {
                  viewer {
                    zones(filter: { zoneTag: ${_e(N)} }) {
                      series: httpRequestsAdaptiveGroups(limit: 10000, filter: { datetime_geq: ${_e(v)}, datetime_leq: ${_e(W)} }) {
                        count
                        dimensions { datetimeHour }
                        sum { edgeResponseBytes }
                      }
                    }
                  }
                }`;
        try {
          const H = await Xi(N, M, {
            scope: "dashboard.stats.zone_lookup",
            context: { feature: "dashboard_stats" }
          });
          P = String(H?.name || "").trim();
          const j = await ji(N, M, z);
          if (j) {
            let ne = 0, fe = 0, me = Array.from({ length: 24 }, (le, pe) => ({
              label: String(pe).padStart(2, "0") + ":00",
              total: 0
            }));
            (Array.isArray(j.series) ? [...j.series].sort((le, pe) => String(le?.dimensions?.datetimeHour || "").localeCompare(String(pe?.dimensions?.datetimeHour || ""))) : []).forEach((le) => {
              const pe = Number(le.count) || 0, Pe = Number(le.sum?.edgeResponseBytes) || 0;
              ne += pe, fe += Pe;
              const $e = le?.dimensions?.datetimeHour;
              if ($e && !Number.isNaN(new Date($e).getTime())) {
                const Lt = Wt(new Date($e), l.scheduleUtcOffsetMinutes).hour;
                me[Lt].total += pe;
              }
            }), g = Wa(fe), y = !0, _ = "Cloudflare 统计正常", D = "视频流量当前对齐：CF Zone 总流量（edgeResponseBytes）";
            try {
              const le = await qd({
                cfAccountId: String(l.cfAccountId || "").trim(),
                cfZoneId: N,
                cfApiToken: M,
                startIso: v,
                endIso: W,
                utcOffsetMinutes: l.scheduleUtcOffsetMinutes
              });
              le && Number.isFinite(le.totalRequests) && (p = le.totalRequests, C = le.hourlySeries, S = !0, R = "workers_usage", E = "今日请求量口径：Cloudflare Workers Usage", _ = "Cloudflare 统计正常");
            } catch (le) {
              console.log("CF workers usage fetch failed", le);
            }
            S || (p = ne, C = me, S = !0, R = "zone_analytics", E = "今日请求量当前对齐：Cloudflare Zone Analytics");
          } else
            _ = "Zone 未命中", A = "GraphQL 返回空；请检查 Zone ID 或权限", g = "CF 无统计数据";
        } catch (H) {
          const j = ki(H?.message || H, { zoneId: N });
          _ = j.status, A = j.hint, b = j.detail, g = "CF 查询失败";
        }
      } else
        _ = "未配置 Cloudflare", A = "请在账号设置中填写并保存 Cloudflare Zone ID 与 API 令牌", D = "视频流量当前对齐：未配置 Cloudflare，无法获取 CF Zone 总流量";
      if (c) try {
        await e.ensureStatsHourlyWindowAligned({
          db: c,
          kv: i
        }, {
          config: l,
          now: d.now
        });
        const v = await e.resolveLogsReadiness({
          db: c,
          kv: i
        }), W = v.statsReady === !0 ? await e.getDailyStatsHourly(c, K) : [];
        if (T = W.reduce((z, H) => z + (Number(H?.play_count || H?.playCount) || 0), 0), I = W.reduce((z, H) => z + (Number(H?.playback_info_count || H?.playbackInfoCount) || 0), 0), !S && v.statsReady === !0) {
          p = W.reduce((z, H) => z + (Number(H?.request_count || H?.requestCount) || 0), 0), C = Array.from({ length: 24 }, (z, H) => ({
            label: String(H).padStart(2, "0") + ":00",
            total: 0
          }));
          for (const z of W) {
            const H = Number.parseInt(String(z?.bucket_hour ?? z?.bucketHour), 10);
            !Number.isNaN(H) && C[H] && (C[H].total += Number(z?.request_count || z?.requestCount) || 0);
          }
          S = !0, R = "d1_hourly_stats", E = "今日请求量当前对齐：本地 D1 预聚合";
        }
      } catch (v) {
        console.log("DB aggregated stats read failed:", v);
      }
      if (S || (p = null, !N || !M ? (R = "unconfigured", E = c ? "今日请求量暂不可用：未配置 Cloudflare 联动，且本地 D1 日志未初始化或不可读" : "今日请求量未配置：未绑定 D1，且未配置 Cloudflare 联动") : (R = "pending", E = c ? "今日请求量暂不可用：Cloudflare 请求数查询失败，且本地 D1 日志未初始化或不可读" : "今日请求量暂不可用：Cloudflare 请求数查询失败，且未绑定 D1")), !f) try {
        U = await m;
      } catch (v) {
        console.log("D1 write hotspot read failed:", v), U = Xa({
          utcOffsetMinutes: l.scheduleUtcOffsetMinutes,
          nowMs: u,
          status: "failed",
          source: "cloudflare_d1_analytics",
          summary: "D1 写入热点暂不可用",
          detail: Ft(v, "d1_write_hotspot_failed")
        });
      }
      const L = p == null ? R === "unconfigured" ? "未配置" : "暂不可用" : String(Number(p) || 0);
      return Mo({
        todayRequests: p,
        requestCountDisplay: L,
        todayTraffic: g,
        hourlySeries: C,
        requestSource: R,
        requestSourceText: E,
        trafficSourceText: D,
        generatedAt: w,
        zoneName: P,
        cfAnalyticsLoaded: y,
        cfAnalyticsStatus: _,
        cfAnalyticsError: A,
        cfAnalyticsDetail: b,
        playCount: T,
        infoCount: I,
        nodeCount: h,
        cacheStatus: "live",
        d1WriteHotspot: U
      });
    },
    async buildDashboardRuntimeStatusPayload(r, o = {}) {
      const s = o?.db || e.getDB(r), i = o?.kv || e.getKV(r), c = te(o?.config || await ue(r)), l = o?.forceRefresh === !0, u = await e.getOpsStatus({
        kv: i,
        db: s
      });
      let d = {
        kv: br("KV", "Cloudflare 配额尚未加载", "等待运行状态接口返回 Cloudflare 配额数据。"),
        d1: br("D1", "Cloudflare 配额尚未加载", "等待运行状态接口返回 Cloudflare 配额数据。")
      };
      try {
        d = await e.getCloudflareRuntimeQuotaStatus(r, {
          config: c,
          db: s,
          forceRefresh: l
        });
      } catch (f) {
        const m = Ft(f, "runtime_config_read_failed");
        d = {
          kv: Rr("KV", "Cloudflare 配额读取失败", m),
          d1: Rr("D1", "Cloudflare 配额读取失败", m)
        };
      }
      return {
        ...u && typeof u == "object" ? u : {},
        cloudflare: d
      };
    },
    async getRuntimeStatusPayload(r, o = {}) {
      const s = o?.db || e.getDB(r), i = o?.kv || e.getKV(r), c = te(o?.config || await ue(r)), l = ze(r), u = o?.forceRefresh === !0, d = Math.max(0, Number(o.nowMs) || k()), f = await kt(et(["runtime_status", u ? "force" : "default"]), async () => e.buildDashboardRuntimeStatusPayload(r, {
        kv: i,
        db: s,
        config: c,
        forceRefresh: u
      }));
      return {
        status: t(f, r, c, l),
        cacheMeta: Po({
          cacheStatus: "live",
          cachedAt: d,
          expiresAt: d,
          updatedAt: d,
          generatedAt: new Date(d).toISOString(),
          warning: "",
          partial: !1
        })
      };
    },
    async getDashboardSnapshotPayload(r, o = {}) {
      const s = o?.db || e.getDB(r), i = o?.kv || e.getKV(r), c = o?.ctx || null, l = te(o?.config || await ue(r)), u = o?.forceRefresh === !0, d = Math.max(0, Number(o.nowMs) || k()), f = o?.dayWindow || dt(new Date(d), l.scheduleUtcOffsetMinutes), m = String(l.cfZoneId || "").trim(), p = Gn(m, f.dateKey), g = s ? await e.getCfDashboardCacheEntry(s, p, {
        nowMs: d,
        includeExpired: !0
      }) : null;
      if (!u && s) {
        const y = g && g.expiresAt > d ? g : null;
        if (y && y.version === 8) return Jr(y.payload, "cache", {
          cachedAt: y.cachedAt,
          expiresAt: y.expiresAt,
          updatedAt: y.updatedAt,
          generatedAt: y.payload?.cacheMeta?.generatedAt || y.payload?.stats?.generatedAt || new Date(y.cachedAt || d).toISOString(),
          warning: ""
        });
      }
      const h = g;
      try {
        const y = await kt(et([
          "dashboard_snapshot",
          p,
          u ? "force" : "default"
        ]), async () => {
          const [S, _] = await Promise.all([e.buildDashboardStatsPayload(r, {
            ctx: c,
            kv: i,
            db: s,
            config: l,
            dayWindow: f,
            nowMs: d
          }), e.buildDashboardRuntimeStatusPayload(r, {
            kv: i,
            db: s,
            config: l,
            forceRefresh: u
          })]), A = Jr({
            stats: S,
            runtimeStatus: _,
            cacheMeta: { generatedAt: S.generatedAt }
          }, "live", {
            cachedAt: d,
            expiresAt: d + 3600 * 1e3,
            updatedAt: d,
            generatedAt: S.generatedAt,
            warning: ""
          });
          if (s) {
            const b = e.putCfDashboardCacheEntry(s, {
              cacheKey: p,
              zoneId: m || "default",
              bucketDate: f.dateKey,
              payload: A,
              version: 8,
              cachedAt: d,
              expiresAt: d + 36e5,
              updatedAt: d
            });
            c ? c.waitUntil(ge(b, "dashboard.cache_write", { cacheKey: p }, null)) : await ge(b, "dashboard.cache_write", { cacheKey: p }, null);
          }
          return A;
        });
        return Jr(y, "live", {
          cachedAt: d,
          expiresAt: d + 3600 * 1e3,
          updatedAt: d,
          generatedAt: y?.stats?.generatedAt || ""
        });
      } catch (y) {
        if (h && h.version === 8) return Jr(h.payload, "stale", {
          cachedAt: h.cachedAt,
          expiresAt: h.expiresAt,
          updatedAt: h.updatedAt,
          generatedAt: h.payload?.cacheMeta?.generatedAt || h.payload?.stats?.generatedAt || new Date(h.cachedAt || d).toISOString(),
          warning: pc(y),
          partial: !0
        });
        throw y;
      }
    },
    async getDashboardCachedSnapshotPayload(r, o = {}) {
      const s = o?.db || e.getDB(r);
      if (!s) return null;
      const i = te(o?.config || await ue(r)), c = Math.max(0, Number(o.nowMs) || k()), l = dt(new Date(c), i.scheduleUtcOffsetMinutes), u = Gn(String(i.cfZoneId || "").trim(), l.dateKey), d = await e.getCfDashboardCacheEntry(s, u, {
        nowMs: c,
        includeExpired: !0
      });
      return !d || d.version !== 8 ? null : Jr(d.payload, d.expiresAt > c ? "cache" : "stale", {
        cachedAt: d.cachedAt,
        expiresAt: d.expiresAt,
        updatedAt: d.updatedAt,
        generatedAt: d.payload?.cacheMeta?.generatedAt || d.payload?.stats?.generatedAt || "",
        warning: d.expiresAt > c ? "" : "dashboard_cache_expired",
        partial: d.expiresAt <= c
      });
    },
    async getCloudflareRuntimeQuotaStatus(r, o = {}) {
      const s = o?.db || e.getDB(r), i = te(o?.config || {}), c = o?.forceRefresh === !0, l = String(i.cfAccountId || "").trim(), u = String(i.cfApiToken || "").trim(), d = String(i.cfKvNamespaceId || "").trim(), f = String(i.cfD1DatabaseId || "").trim();
      if (!l || !u) return {
        kv: br("KV", "未配置 Cloudflare 账号联动", "请先在账号设置中填写 Cloudflare 账号 ID 与 API 令牌。"),
        d1: br("D1", "未配置 Cloudflare 账号联动", "请先在账号设置中填写 Cloudflare 账号 ID 与 API 令牌。")
      };
      const m = k(), p = de(i.cfQuotaPlanCacheMinutes, O.Defaults.CfQuotaPlanCacheMinutes, 1, 1440), g = p * 60 * 1e3;
      let h;
      try {
        h = await e.loadCfRuntimeCachePayload(s, {
          cacheKey: `plan_profile:${l}:${d || "-"}:${f || "-"}`,
          cacheGroup: "plan_profile",
          resourceId: l,
          ttlMs: p * 60 * 1e3,
          nowMs: m,
          skipCacheRead: c,
          loader: async () => {
            const R = Vi(await Yi(l, u)), [E, D] = await Promise.all([d ? ge(Wd(l, d, u), "cf_runtime.plan_profile.kv_details", {
              accountId: l,
              namespaceId: d
            }, null) : null, f ? ge(as(l, f, u), "cf_runtime.plan_profile.d1_details", {
              accountId: l,
              databaseId: f
            }, null) : null]);
            return {
              planClass: R.planClass,
              planLabel: R.planLabel,
              periodLabel: R.periodLabel,
              usageModel: R.usageModel,
              resourceMeta: {
                kv: { namespaceTitle: String(E?.title || "").trim() },
                d1: { databaseName: String(D?.name || "").trim() }
              }
            };
          }
        });
      } catch (R) {
        const E = Ft(R);
        return {
          kv: Rr("KV", "Cloudflare 计划信息读取失败", E),
          d1: Rr("D1", "Cloudflare 计划信息读取失败", E)
        };
      }
      const y = F(h?.payload) ? h.payload : {}, S = {
        ...$n({
          usageModel: y.usageModel || y.planClass,
          override: i.cfQuotaPlanOverride
        }),
        resourceMeta: {
          kv: { namespaceTitle: String(y?.resourceMeta?.kv?.namespaceTitle || "").trim() },
          d1: { databaseName: String(y?.resourceMeta?.d1?.databaseName || "").trim() }
        }
      }, _ = Kd(S.planClass), [A, b] = await Promise.all([(async () => {
        if (!d) return br("KV", "未配置 KV Namespace", "请在账号设置中填写 Cloudflare KV Namespace ID。");
        try {
          const R = await e.loadCfRuntimeCachePayload(s, {
            cacheKey: `usage_metrics:kv:${l}:${d}:${_.cacheBucketKey}`,
            cacheGroup: "usage_metrics",
            resourceId: `kv:${d}`,
            ttlMs: g,
            nowMs: m,
            skipCacheRead: c,
            loader: async () => ({
              ...await Vd({
                accountId: l,
                apiToken: u,
                namespaceId: d,
                startIso: _.startIso,
                endIso: _.endIso
              }),
              namespaceTitle: String(S?.resourceMeta?.kv?.namespaceTitle || d).trim()
            })
          });
          return e.buildCloudflareKvQuotaCard({
            planProfile: S,
            planState: h,
            usageState: R,
            namespaceId: d,
            nowTimestamp: m
          });
        } catch (R) {
          return Rr("KV", "KV 指标读取失败", Ft(R));
        }
      })(), (async () => {
        if (!f) return br("D1", "未配置 D1 数据库", "请在账号设置中填写 Cloudflare D1 Database ID。");
        try {
          const R = await e.loadCfRuntimeCachePayload(s, {
            cacheKey: `usage_metrics:d1:${l}:${f}:${_.cacheBucketKey}`,
            cacheGroup: "usage_metrics",
            resourceId: `d1:${f}`,
            ttlMs: g,
            nowMs: m,
            skipCacheRead: c,
            loader: async () => {
              const [E, D] = await Promise.all([Gd({
                accountId: l,
                apiToken: u,
                databaseId: f,
                startIso: _.startIso,
                endIso: _.endIso
              }), as(l, f, u)]);
              return {
                ...E,
                databaseName: String(D?.name || S?.resourceMeta?.d1?.databaseName || f).trim(),
                fileSizeBytes: Math.max(0, Number(D?.file_size ?? D?.fileSize) || 0)
              };
            }
          });
          return e.buildCloudflareD1QuotaCard({
            planProfile: S,
            planState: h,
            usageState: R,
            databaseId: f,
            nowTimestamp: m
          });
        } catch (R) {
          return Rr("D1", "D1 指标读取失败", Ft(R));
        }
      })()]);
      return {
        kv: A,
        d1: b
      };
    }
  };
}
function Zp(n = {}, e = {}) {
  return {
    ...jp(n, e),
    ...qp(n, e),
    ...Xp(n, e),
    ...Yp(n, e),
    ...Jp(n, e),
    ...Qp(n, e)
  };
}
function eg(n = {}, e = {}) {
  return {
    getKV(a) {
      return Ra(a);
    },
    getDB(a) {
      return Yu(a);
    },
    getD1RuntimeIndexContract() {
      return {
        idx_sys_locks_expires_at: {
          table: e.SCHEDULED_LOCKS_TABLE,
          columns: ["expires_at"],
          createSql: `CREATE INDEX idx_sys_locks_expires_at ON ${e.SCHEDULED_LOCKS_TABLE} (expires_at DESC)`
        },
        idx_auth_failures_expires_at: {
          table: e.AUTH_FAILURES_TABLE,
          columns: ["expires_at"],
          createSql: `CREATE INDEX idx_auth_failures_expires_at ON ${e.AUTH_FAILURES_TABLE} (expires_at)`
        },
        idx_cf_dashboard_cache_expires_at: {
          table: e.CF_DASH_CACHE_TABLE,
          columns: ["expires_at"],
          createSql: `CREATE INDEX idx_cf_dashboard_cache_expires_at ON ${e.CF_DASH_CACHE_TABLE} (expires_at)`
        },
        idx_cf_runtime_cache_expires_at: {
          table: e.CF_RUNTIME_CACHE_TABLE,
          columns: ["expires_at"],
          createSql: `CREATE INDEX idx_cf_runtime_cache_expires_at ON ${e.CF_RUNTIME_CACHE_TABLE} (expires_at)`
        },
        idx_dns_ip_pool_items_updated_ip: {
          table: e.DNS_IP_POOL_ITEMS_TABLE,
          columns: ["updated_at", "ip"],
          createSql: `CREATE INDEX idx_dns_ip_pool_items_updated_ip ON ${e.DNS_IP_POOL_ITEMS_TABLE} (updated_at DESC, ip ASC)`
        },
        idx_dns_ip_pool_sources_sort: {
          table: e.DNS_IP_POOL_SOURCES_TABLE,
          columns: ["sort_order", "updated_at"],
          createSql: `CREATE INDEX idx_dns_ip_pool_sources_sort ON ${e.DNS_IP_POOL_SOURCES_TABLE} (sort_order ASC, updated_at ASC)`
        },
        idx_dns_ip_pool_fetch_cache_expires: {
          table: e.DNS_IP_POOL_FETCH_CACHE_TABLE,
          columns: ["expires_at"],
          createSql: `CREATE INDEX idx_dns_ip_pool_fetch_cache_expires ON ${e.DNS_IP_POOL_FETCH_CACHE_TABLE} (expires_at)`
        },
        idx_dns_ip_probe_cache_expire: {
          table: e.DNS_IP_PROBE_CACHE_TABLE,
          columns: ["expires_at"],
          createSql: `CREATE INDEX idx_dns_ip_probe_cache_expire ON ${e.DNS_IP_PROBE_CACHE_TABLE} (expires_at)`
        },
        idx_dns_ip_probe_cache_colo_ip_expires: {
          table: e.DNS_IP_PROBE_CACHE_TABLE,
          columns: [
            "entry_colo",
            "ip",
            "expires_at"
          ],
          createSql: `CREATE INDEX idx_dns_ip_probe_cache_colo_ip_expires ON ${e.DNS_IP_PROBE_CACHE_TABLE} (entry_colo, ip, expires_at)`
        },
        idx_proxy_logs_timestamp: {
          table: e.LOGS_TABLE,
          columns: ["timestamp"],
          createSql: `CREATE INDEX idx_proxy_logs_timestamp ON ${e.LOGS_TABLE} (timestamp)`
        },
        idx_proxy_logs_client_time: {
          table: e.LOGS_TABLE,
          columns: ["client_ip", "timestamp"],
          createSql: `CREATE INDEX idx_proxy_logs_client_time ON ${e.LOGS_TABLE} (client_ip, timestamp DESC)`
        },
        idx_proxy_logs_status_time: {
          table: e.LOGS_TABLE,
          columns: ["status_code", "timestamp"],
          createSql: `CREATE INDEX idx_proxy_logs_status_time ON ${e.LOGS_TABLE} (status_code, timestamp)`
        },
        idx_proxy_logs_category_time: {
          table: e.LOGS_TABLE,
          columns: ["category", "timestamp"],
          createSql: `CREATE INDEX idx_proxy_logs_category_time ON ${e.LOGS_TABLE} (category, timestamp)`
        }
      };
    },
    getD1RuntimeColumnAdditions() {
      return {
        [e.SYS_STATUS_TABLE]: {
          payload: "TEXT NOT NULL DEFAULT '{}'",
          updated_at: "INTEGER NOT NULL DEFAULT 0"
        },
        [e.SCHEDULED_LOCKS_TABLE]: {
          token: "TEXT NOT NULL DEFAULT ''",
          owner: "TEXT NOT NULL DEFAULT ''",
          acquired_at: "INTEGER NOT NULL DEFAULT 0",
          renewed_at: "INTEGER",
          expires_at: "INTEGER NOT NULL DEFAULT 0"
        },
        [e.AUTH_FAILURES_TABLE]: {
          fail_count: "INTEGER NOT NULL DEFAULT 0",
          expires_at: "INTEGER NOT NULL DEFAULT 0",
          updated_at: "INTEGER NOT NULL DEFAULT 0"
        },
        [e.CF_DASH_CACHE_TABLE]: {
          zone_id: "TEXT NOT NULL DEFAULT ''",
          bucket_date: "TEXT NOT NULL DEFAULT ''",
          payload: "TEXT NOT NULL DEFAULT '{}'",
          version: "INTEGER NOT NULL DEFAULT 0",
          cached_at: "INTEGER NOT NULL DEFAULT 0",
          expires_at: "INTEGER NOT NULL DEFAULT 0",
          updated_at: "INTEGER NOT NULL DEFAULT 0"
        },
        [e.CF_RUNTIME_CACHE_TABLE]: {
          cache_group: "TEXT NOT NULL DEFAULT ''",
          resource_id: "TEXT NOT NULL DEFAULT ''",
          payload: "TEXT NOT NULL DEFAULT '{}'",
          cached_at: "INTEGER NOT NULL DEFAULT 0",
          expires_at: "INTEGER NOT NULL DEFAULT 0",
          updated_at: "INTEGER NOT NULL DEFAULT 0"
        },
        [e.DNS_IP_POOL_ITEMS_TABLE]: {
          ip_type: "TEXT NOT NULL DEFAULT ''",
          source_kind: "TEXT NOT NULL DEFAULT ''",
          source_label: "TEXT",
          line_label: "TEXT NOT NULL DEFAULT ''",
          remark: "TEXT",
          created_at: "TEXT NOT NULL DEFAULT ''",
          updated_at: "TEXT NOT NULL DEFAULT ''"
        },
        [e.DNS_IP_POOL_SOURCES_TABLE]: {
          name: "TEXT NOT NULL DEFAULT ''",
          url: "TEXT NOT NULL DEFAULT ''",
          source_type: "TEXT NOT NULL DEFAULT 'url'",
          domain: "TEXT",
          source_kind: "TEXT NOT NULL DEFAULT 'custom'",
          preset_id: "TEXT NOT NULL DEFAULT ''",
          builtin_id: "TEXT NOT NULL DEFAULT ''",
          enabled: "INTEGER NOT NULL DEFAULT 1",
          sort_order: "INTEGER NOT NULL DEFAULT 0",
          ip_limit: "INTEGER NOT NULL DEFAULT 5",
          last_fetch_at: "TEXT",
          last_fetch_status: "TEXT",
          last_fetch_count: "INTEGER NOT NULL DEFAULT 0",
          created_at: "TEXT NOT NULL DEFAULT ''",
          updated_at: "TEXT NOT NULL DEFAULT ''"
        },
        [e.DNS_IP_POOL_FETCH_CACHE_TABLE]: {
          items_json: "TEXT NOT NULL DEFAULT '[]'",
          source_results_json: "TEXT NOT NULL DEFAULT '[]'",
          imported_count: "INTEGER NOT NULL DEFAULT 0",
          enabled_source_count: "INTEGER NOT NULL DEFAULT 0",
          cached_at: "INTEGER NOT NULL DEFAULT 0",
          expires_at: "INTEGER NOT NULL DEFAULT 0",
          created_at: "TEXT NOT NULL DEFAULT ''",
          updated_at: "TEXT NOT NULL DEFAULT ''"
        },
        [e.DNS_IP_PROBE_CACHE_TABLE]: {
          probe_status: "TEXT NOT NULL DEFAULT ''",
          latency_ms: "INTEGER",
          cf_ray: "TEXT",
          colo_code: "TEXT",
          city_name: "TEXT",
          country_code: "TEXT",
          country_name: "TEXT",
          probed_at: "TEXT NOT NULL DEFAULT ''",
          expires_at: "INTEGER NOT NULL DEFAULT 0"
        },
        [e.LOGS_TABLE]: {
          timestamp: "INTEGER NOT NULL DEFAULT 0",
          node_name: "TEXT NOT NULL DEFAULT ''",
          request_path: "TEXT NOT NULL DEFAULT ''",
          request_method: "TEXT NOT NULL DEFAULT ''",
          status_code: "INTEGER NOT NULL DEFAULT 0",
          response_time: "INTEGER NOT NULL DEFAULT 0",
          client_ip: "TEXT NOT NULL DEFAULT ''",
          inbound_colo: "TEXT",
          outbound_colo: "TEXT",
          user_agent: "TEXT",
          referer: "TEXT",
          category: "TEXT DEFAULT 'api'",
          error_detail: "TEXT",
          detail_json: "TEXT",
          created_at: "TEXT NOT NULL DEFAULT ''",
          inbound_ip: "TEXT",
          outbound_ip: "TEXT"
        },
        [e.STATS_HOURLY_TABLE]: {
          request_count: "INTEGER NOT NULL DEFAULT 0",
          play_count: "INTEGER NOT NULL DEFAULT 0",
          playback_info_count: "INTEGER NOT NULL DEFAULT 0",
          updated_at: "TEXT NOT NULL DEFAULT ''"
        }
      };
    },
    getD1RequiredPrimaryKeyContract() {
      return {
        [e.SYS_STATUS_TABLE]: ["scope"],
        [e.SCHEDULED_LOCKS_TABLE]: ["scope"],
        [e.AUTH_FAILURES_TABLE]: ["ip"],
        [e.CF_DASH_CACHE_TABLE]: ["cache_key"],
        [e.CF_RUNTIME_CACHE_TABLE]: ["cache_key"],
        [e.DNS_IP_POOL_ITEMS_TABLE]: ["id"],
        [e.DNS_IP_POOL_SOURCES_TABLE]: ["id"],
        [e.DNS_IP_POOL_FETCH_CACHE_TABLE]: ["signature"],
        [e.DNS_IP_PROBE_CACHE_TABLE]: ["ip", "entry_colo"],
        [e.LOGS_TABLE]: ["id"],
        [e.STATS_HOURLY_TABLE]: ["bucket_date", "bucket_hour"]
      };
    },
    getD1SchemaReadyState(a) {
      if (!a || typeof a.prepare != "function") return null;
      let t = Z.D1SchemaReadyState.get(a);
      return t instanceof Map || (t = /* @__PURE__ */ new Map(), Z.D1SchemaReadyState.set(a, t)), t;
    },
    isD1SchemaReadyCached(a, t) {
      const r = e.getD1SchemaReadyState(a);
      return !!r && (Number(r.get(String(t || ""))) || 0) > k();
    },
    markD1SchemaReady(a, t) {
      const r = e.getD1SchemaReadyState(a);
      r && r.set(String(t || ""), k() + Math.max(1e3, Number(O.Defaults.D1SchemaReadyTtlMs) || 1e3));
    },
    clearD1SchemaReady(a, t = []) {
      const r = Z.D1SchemaReadyState.get(a);
      if (!(r instanceof Map)) return;
      const o = (Array.isArray(t) ? t : [t]).map((s) => String(s || "").trim()).filter(Boolean);
      if (!o.length) {
        r.clear();
        return;
      }
      for (const s of o) r.delete(s);
    },
    normalizeRevisionMeta(a, t) {
      const r = F(a) ? a : {}, o = F(t) ? t : {}, s = String(r.updatedAt || o.updatedAt || "").trim(), i = String(r.hash || o.hash || "").trim();
      return {
        ...o,
        ...r,
        updatedAt: s,
        hash: i,
        revision: String(r.revision || o.revision || Ut(i, s)).trim()
      };
    },
    async readRevisionMeta(a, t, r) {
      if (!a || !t) return e.normalizeRevisionMeta({}, r);
      try {
        return e.normalizeRevisionMeta(await a.get(t, { type: "json" }), r);
      } catch {
        return e.normalizeRevisionMeta({}, r);
      }
    },
    async readRevisionMetaForRead(a, t, r) {
      if (!a || !t) return null;
      const o = await we(a, t, { type: "json" });
      return F(o) ? e.normalizeRevisionMeta(o, r) : null;
    },
    async writeRevisionMeta(a, t, r, o = null) {
      if (!a || !t) return r;
      const s = a.put(t, JSON.stringify(r));
      return o && o.waitUntil(s), await s, r;
    },
    async ensureConfigMeta(a, t = null, r = {}) {
      const o = te(t ?? (await a?.get(e.CONFIG_KEY, { type: "json" }) || {})), s = e.normalizeRevisionMeta(Tr(o)), i = await e.readRevisionMeta(a, e.CONFIG_META_KEY);
      return i.hash === s.hash && i.revision ? i : await e.writeRevisionMeta(a, e.CONFIG_META_KEY, s, r.ctx);
    },
    async ensureConfigSnapshotsMeta(a, t = null, r = {}) {
      const o = Array.isArray(t) ? t : await e.readStoredConfigSnapshots(a), s = e.normalizeRevisionMeta({
        ...Tr(o),
        count: o.length
      }, { count: 0 }), i = await e.readRevisionMeta(a, e.CONFIG_SNAPSHOTS_META_KEY, { count: 0 });
      return i.hash === s.hash && Number(i.count) === Number(s.count) && i.revision ? i : await e.writeRevisionMeta(a, e.CONFIG_SNAPSHOTS_META_KEY, s, r.ctx);
    },
    buildNodesIndexMeta(a = [], t = [], r = {}) {
      const o = e.normalizeNodeIndex(a), s = e.normalizeNodeSummaryIndex(t).nodes, i = String(r.updatedAt || "").trim() || (/* @__PURE__ */ new Date()).toISOString(), c = ce(se(o)), l = ce(se(s)), u = ce(`${c}:${l}:${o.length}`);
      return {
        revision: Ut(u, i),
        updatedAt: i,
        hash: u,
        count: o.length,
        indexHash: c,
        fullIndexHash: l
      };
    },
    async ensureNodesIndexMeta(a, t = {}) {
      if (!a) return e.buildNodesIndexMeta([], []);
      let r = Array.isArray(t.nodes) ? e.normalizeNodeSummaryIndex(t.nodes).nodes : null;
      if (!r) {
        const c = await e.getNodesSummaryIndex(a, { ctx: t.ctx });
        r = Array.isArray(c) ? c : [];
      }
      const o = Array.isArray(t.index) ? e.normalizeNodeIndex(t.index) : e.normalizeNodeIndex(r.map((c) => c?.name)), s = e.buildNodesIndexMeta(o, r, t), i = await e.readRevisionMeta(a, e.NODES_INDEX_META_KEY, {
        count: 0,
        indexHash: "",
        fullIndexHash: ""
      });
      return i.indexHash === s.indexHash && i.fullIndexHash === s.fullIndexHash && Number(i.count) === Number(s.count) && i.revision ? i : await Ar(async () => {
        const c = await e.loadNodeSummariesForMutation(a, { ctx: t.ctx });
        return (await e.commitNodesSummaryIndexMutation(c, {
          kv: a,
          ctx: t.ctx
        })).meta;
      }, a);
    },
    async getNodesRevision(a, t = {}) {
      if (!a) return "";
      const r = Se(a), o = k();
      if (t.forceFresh !== !0 && r.NodesRevisionCache?.loaded === !0 && r.NodesRevisionCache.exp > o) return String(r.NodesRevisionCache.revision || "").trim();
      const s = r.NodesRevisionCacheGeneration;
      return await cn(r.SingleFlightTasks, et(["nodes_revision", s]), async () => {
        const i = r.NodesRevisionCache;
        if (t.forceFresh !== !0 && i?.loaded === !0 && i.exp > k()) return String(i.revision || "").trim();
        let c = null;
        try {
          c = await a.get(e.NODES_INDEX_META_KEY, { type: "json" });
        } catch {
          return "";
        }
        const l = F(c) ? String(c.revision || "").trim() : "";
        return r.NodesRevisionCacheGeneration === s && (r.NodesRevisionCache = {
          loaded: !0,
          revision: l,
          exp: k() + O.Defaults.NodesRevisionCacheTtlMs
        }), l;
      });
    },
    getLogsRevisionFromStatus(a = {}) {
      const t = String(a?.revision || "").trim();
      return t || Ut("logs", String(a?.updatedAt || "").trim());
    },
    async bumpLogsRevision(a, t = {}, r = null) {
      const o = await e.getOpsStatusSection(a, "log"), s = (/* @__PURE__ */ new Date()).toISOString(), i = ce(`${e.getLogsRevisionFromStatus(o)}:${s}:${se(t)}`);
      return await e.patchOpsStatus(a, { log: {
        ...t,
        revision: Ut(i, s),
        updatedAt: s
      } }, r);
    },
    async getAdminRevisions(a, t = {}) {
      const r = e.resolveOpsStatusStores(a), o = r.kv, s = r.db, [i, c, l, u, d] = await Promise.all([
        e.ensureConfigMeta(o, t.config, { ctx: t.ctx }),
        e.ensureNodesIndexMeta(o, {
          ctx: t.ctx,
          index: t.nodes?.map?.((f) => f?.name),
          nodes: t.nodes
        }),
        e.ensureConfigSnapshotsMeta(o, t.snapshots, { ctx: t.ctx }),
        e.getOpsStatusSection({
          kv: o,
          db: s
        }, "log"),
        e.getOpsStatusSection({
          kv: o,
          db: s
        }, "dnsIpPool")
      ]);
      return {
        configRevision: String(i?.revision || ""),
        nodesRevision: String(c?.revision || ""),
        snapshotsRevision: String(l?.revision || ""),
        logsRevision: e.getLogsRevisionFromStatus(u),
        dnsIpPoolRevision: e.getDnsIpPoolRevisionFromStatus(d)
      };
    },
    async getAdminRevisionsForRead(a, t = {}) {
      const r = e.resolveOpsStatusStores(a), o = r.kv, s = r.db, [i, c, l, u, d] = await Promise.all([
        e.readRevisionMetaForRead(o, e.CONFIG_META_KEY),
        e.readRevisionMetaForRead(o, e.NODES_INDEX_META_KEY, {
          count: 0,
          indexHash: "",
          fullIndexHash: ""
        }),
        e.readRevisionMetaForRead(o, e.CONFIG_SNAPSHOTS_META_KEY, { count: 0 }),
        e.getOpsStatusSection({
          kv: o,
          db: s
        }, "log"),
        e.getOpsStatusSection({
          kv: o,
          db: s
        }, "dnsIpPool")
      ]);
      let f = i;
      if (!f) {
        const g = t.config !== void 0 ? t.config : await we(o, e.CONFIG_KEY, { type: "json" }) || {};
        f = e.normalizeRevisionMeta(Tr(te(g)));
      }
      let m = c;
      if (!m) {
        const g = Array.isArray(t.nodes) ? t.nodes : await e.getNodesSummaryIndexStrict(o, { ctx: t.ctx });
        m = e.buildNodesIndexMeta((Array.isArray(g) ? g : []).map((h) => h?.name), Array.isArray(g) ? g : []);
      }
      let p = l;
      if (!p) {
        const g = Array.isArray(t.snapshots) ? t.snapshots : await e.readStoredConfigSnapshotsStrict(o);
        p = e.normalizeRevisionMeta({
          ...Tr(Array.isArray(g) ? g : []),
          count: Array.isArray(g) ? g.length : 0
        }, { count: 0 });
      }
      return {
        configRevision: String(f?.revision || ""),
        nodesRevision: String(m?.revision || ""),
        snapshotsRevision: String(p?.revision || ""),
        logsRevision: e.getLogsRevisionFromStatus(u),
        dnsIpPoolRevision: e.getDnsIpPoolRevisionFromStatus(d)
      };
    }
  };
}
function tg(n = {}, e = {}) {
  return {
    async hasLogsFtsTable(a) {
      if (!a) return !1;
      try {
        const t = await a.prepare("SELECT name FROM sqlite_master WHERE type = 'table' AND name = ? LIMIT 1").bind(e.LOGS_FTS_TABLE).first();
        return String(t?.name || "") === e.LOGS_FTS_TABLE;
      } catch {
        return !1;
      }
    },
    async getLogsFtsReadiness(a) {
      if (!a || !await e.hasLogsFtsTable(a)) return {
        tableReady: !1,
        virtualTableReady: !1,
        columnsReady: !1,
        triggerReady: !1,
        ready: !1
      };
      const t = await e.getTableColumns(a, e.LOGS_FTS_TABLE), r = [
        "node_name",
        "request_path",
        "user_agent",
        "error_detail",
        "detail_json"
      ].every((p) => t.has(p)), [o, s] = await Promise.all([a.prepare("SELECT sql FROM sqlite_master WHERE type = 'table' AND name = ? LIMIT 1").bind(e.LOGS_FTS_TABLE).first(), a.prepare("SELECT name, tbl_name, sql FROM sqlite_master WHERE type = 'trigger' AND name = ? LIMIT 1").bind(e.LOGS_FTS_INSERT_TRIGGER).first()]), i = Kn(o?.sql || "").replace(/'/g, ""), c = /^create\s+virtual\s+table\b/.test(i) && /\busing\s+fts5\s*\(/.test(i) && new RegExp(`\\bcontent\\s*=\\s*${e.LOGS_TABLE}\\b`).test(i) && /\bcontent_rowid\s*=\s*id\b/.test(i), l = Kn(s?.sql || ""), u = l.replace(/\s+/g, ""), d = `insert into ${e.LOGS_FTS_TABLE} (
            rowid, node_name, request_path, user_agent, error_detail, detail_json
          ) values (
            new.id, new.node_name, new.request_path,
            coalesce(new.user_agent, ''), coalesce(new.error_detail, ''), coalesce(new.detail_json, '')
          )`.replace(/\s+/g, ""), f = u.includes(d), m = String(s?.name || "") === e.LOGS_FTS_INSERT_TRIGGER && String(s?.tbl_name || "") === e.LOGS_TABLE && new RegExp(`\\bafter\\s+insert\\s+on\\s+${e.LOGS_TABLE}\\b`).test(l) && new RegExp(`\\binsert\\s+into\\s+${e.LOGS_FTS_TABLE}\\s*\\(`).test(l) && f;
      return {
        tableReady: !0,
        virtualTableReady: c,
        columnsReady: r,
        triggerReady: m,
        ready: c && r && m
      };
    },
    async isLogsFtsReady(a) {
      return (await e.getLogsFtsReadiness(a)).ready === !0;
    },
    async hasLogsBaseTable(a) {
      if (!a) return !1;
      if (e.isD1SchemaReadyCached(a, "logsTableExists")) return !0;
      try {
        const t = await a.prepare("SELECT name FROM sqlite_master WHERE type = 'table' AND name = ? LIMIT 1").bind(e.LOGS_TABLE).first(), r = String(t?.name || "") === e.LOGS_TABLE;
        return r && e.markD1SchemaReady(a, "logsTableExists"), r;
      } catch {
        return !1;
      }
    },
    async hasStatsHourlyTable(a) {
      if (!a) return !1;
      if (e.isD1SchemaReadyCached(a, "statsTableExists")) return !0;
      try {
        const t = await a.prepare("SELECT name FROM sqlite_master WHERE type = 'table' AND name = ? LIMIT 1").bind(e.STATS_HOURLY_TABLE).first(), r = String(t?.name || "") === e.STATS_HOURLY_TABLE;
        return r && e.markD1SchemaReady(a, "statsTableExists"), r;
      } catch {
        return !1;
      }
    },
    async getTableColumnDefinitions(a, t) {
      if (!a || !t) return [];
      try {
        return ((await a.prepare(`PRAGMA table_info(${Ma(t)})`).all())?.results || []).map((r) => ({
          name: String(r?.name || "").toLowerCase(),
          type: String(r?.type || "").trim().toUpperCase(),
          primaryKeyOrder: Math.max(0, Number(r?.pk) || 0)
        })).filter((r) => r.name);
      } catch (r) {
        const o = /* @__PURE__ */ new Error(`D1 schema inspection failed for ${t}`);
        throw o.code = "D1_SCHEMA_INSPECTION_FAILED", o.status = 503, o.details = {
          tableName: String(t),
          cause: ie(r, "d1_pragma_failed")
        }, o;
      }
    },
    async getTableColumns(a, t) {
      const r = await e.getTableColumnDefinitions(a, t);
      return new Set(r.map((o) => o.name));
    },
    async getIndexKeyColumns(a, t) {
      if (!a || !t) return [];
      try {
        return ((await a.prepare(`PRAGMA index_xinfo(${Ma(t)})`).all())?.results || []).map((r) => ({
          order: Math.max(0, Number(r?.seqno) || 0),
          name: String(r?.name || "").toLowerCase(),
          key: r?.key === void 0 || Number(r.key) === 1,
          expression: Number(r?.cid) === -2 || !String(r?.name || "").trim()
        })).filter((r) => r.key).sort((r, o) => r.order - o.order).map((r) => r.expression ? "<expression>" : r.name);
      } catch (r) {
        const o = /* @__PURE__ */ new Error(`D1 schema inspection failed for ${t}`);
        throw o.code = "D1_SCHEMA_INSPECTION_FAILED", o.status = 503, o.details = {
          indexName: String(t),
          cause: ie(r, "d1_pragma_failed")
        }, o;
      }
    },
    async getTableIndexDefinitions(a, t) {
      if (!a || !t) return [];
      try {
        return ((await a.prepare(`PRAGMA index_list(${Ma(t)})`).all())?.results || []).map((r) => ({
          name: String(r?.name || ""),
          unique: Number(r?.unique) === 1,
          partial: Number(r?.partial) === 1
        })).filter((r) => r.name);
      } catch (r) {
        const o = /* @__PURE__ */ new Error(`D1 schema inspection failed for ${t}`);
        throw o.code = "D1_SCHEMA_INSPECTION_FAILED", o.status = 503, o.details = {
          tableName: String(t),
          cause: ie(r, "d1_pragma_failed")
        }, o;
      }
    },
    async getD1TableNameSet(a) {
      if (!a) return /* @__PURE__ */ new Set();
      const t = await a.prepare("SELECT name FROM sqlite_master WHERE type = 'table'").all();
      return new Set((t?.results || []).map((r) => String(r?.name || "")).filter(Boolean));
    },
    getD1CurrentSchemaContract() {
      const a = e.getD1RequiredPrimaryKeyContract(), t = {
        [e.SYS_STATUS_TABLE]: { scope: "TEXT" },
        [e.SCHEDULED_LOCKS_TABLE]: { scope: "TEXT" },
        [e.AUTH_FAILURES_TABLE]: { ip: "TEXT" },
        [e.CF_DASH_CACHE_TABLE]: { cache_key: "TEXT" },
        [e.CF_RUNTIME_CACHE_TABLE]: { cache_key: "TEXT" },
        [e.DNS_IP_POOL_ITEMS_TABLE]: {
          id: "TEXT",
          ip: "TEXT"
        },
        [e.DNS_IP_POOL_SOURCES_TABLE]: { id: "TEXT" },
        [e.DNS_IP_POOL_FETCH_CACHE_TABLE]: { signature: "TEXT" },
        [e.DNS_IP_PROBE_CACHE_TABLE]: {
          ip: "TEXT",
          entry_colo: "TEXT"
        },
        [e.LOGS_TABLE]: { id: "INTEGER" },
        [e.STATS_HOURLY_TABLE]: {
          bucket_date: "TEXT",
          bucket_hour: "INTEGER"
        }
      }, r = Object.fromEntries(Object.entries(e.getD1RuntimeColumnAdditions()).map(([o, s]) => {
        const i = Object.fromEntries(Object.entries(s).map(([c, l]) => [c, String(l || "").trim().split(/\s+/, 1)[0].toUpperCase()]));
        return [o, {
          ...t[o],
          ...i
        }];
      }));
      return {
        columns: Object.fromEntries(Object.entries(r).map(([o, s]) => [o, Object.keys(s)])),
        columnTypes: r,
        primaryKeys: a,
        indexes: e.getD1RuntimeIndexContract()
      };
    },
    async getD1SchemaStatus(a) {
      if (!a) return {
        tables: {},
        columns: {},
        indexes: {},
        constraints: {
          primaryKeys: {},
          uniqueKeys: {}
        },
        ftsReady: !1,
        fts: {},
        schemaReady: !1,
        issues: ["db_not_configured"]
      };
      const t = e.getD1CurrentSchemaContract(), [r, o] = await Promise.all([a.prepare("SELECT name FROM sqlite_master WHERE type = 'table'").all(), a.prepare("SELECT name, tbl_name FROM sqlite_master WHERE type = 'index'").all()]), s = new Set((r?.results || []).map((h) => String(h?.name || "")).filter(Boolean)), i = new Map((o?.results || []).map((h) => [String(h?.name || ""), String(h?.tbl_name || "")]).filter(([h]) => h)), c = Object.fromEntries(Object.keys(t.columns).map((h) => [h, s.has(h)])), l = {}, u = {}, d = [];
      for (const [h, y] of Object.entries(t.columns)) {
        if (!s.has(h)) {
          l[h] = Object.fromEntries(y.map((R) => [R, !1])), u[h] = !1, d.push(`missing_table:${h}`);
          continue;
        }
        const S = await e.getTableColumnDefinitions(a, h), _ = new Map(S.map((R) => [R.name, R]));
        l[h] = Object.fromEntries(y.map((R) => {
          const E = _.get(R), D = String(t.columnTypes?.[h]?.[R] || "").toUpperCase();
          return [R, !!E && (!D || E.type === D)];
        }));
        for (const [R, E] of Object.entries(l[h])) if (!E) {
          const D = _.get(R);
          d.push(D ? `invalid_column_type:${h}.${R}` : `missing_column:${h}.${R}`);
        }
        const A = S.filter((R) => R.primaryKeyOrder > 0).sort((R, E) => R.primaryKeyOrder - E.primaryKeyOrder).map((R) => R.name), b = h === e.LOGS_TABLE ? S.find((R) => R.name === "id") : null;
        u[h] = se(A) === se(t.primaryKeys[h] || []) && (!b || b.type === "INTEGER"), u[h] || d.push(`invalid_primary_key:${h}`);
      }
      let f = !1;
      if (s.has(e.DNS_IP_POOL_ITEMS_TABLE)) {
        for (const h of (await e.getTableIndexDefinitions(a, e.DNS_IP_POOL_ITEMS_TABLE)).filter((y) => y.unique && !y.partial)) if (se(await e.getIndexKeyColumns(a, h.name)) === se(["ip"])) {
          f = !0;
          break;
        }
        f || d.push(`missing_unique_key:${e.DNS_IP_POOL_ITEMS_TABLE}.ip`);
      }
      const m = {};
      for (const [h, y] of Object.entries(t.indexes)) {
        const S = i.get(h);
        if (!S) {
          m[h] = !1, d.push(`missing_index:${h}`);
          continue;
        }
        const _ = (await e.getTableIndexDefinitions(a, y.table)).find((A) => A.name === h);
        m[h] = S === y.table && _?.unique === !1 && _?.partial === !1 && se(await e.getIndexKeyColumns(a, h)) === se(y.columns), m[h] || d.push(`invalid_index:${h}`);
      }
      const p = await e.getLogsFtsReadiness(a);
      p.ready || d.push(p.tableReady ? "fts_contract_invalid" : `missing_table:${e.LOGS_FTS_TABLE}`);
      const g = Object.values(c).every(Boolean) && Object.values(l).every((h) => Object.values(h).every(Boolean)) && Object.values(u).every(Boolean) && f && Object.values(m).every(Boolean) && p.ready;
      return {
        tables: c,
        columns: l,
        indexes: m,
        constraints: {
          primaryKeys: u,
          uniqueKeys: { [`${e.DNS_IP_POOL_ITEMS_TABLE}.ip`]: f }
        },
        ftsReady: p.ready,
        fts: p,
        schemaReady: g,
        issues: d
      };
    },
    async assertD1CurrentSchema(a, t = null) {
      const r = t || await e.getD1SchemaStatus(a);
      e.getD1CurrentSchemaContract();
      const o = [];
      for (const [s, i] of Object.entries(r.tables || {}))
        if (i) {
          for (const [c, l] of Object.entries(r.columns?.[s] || {})) if (!l) {
            const u = `${s}.${c}`;
            o.push((r.issues || []).find((d) => String(d).endsWith(u)) || `missing_column:${u}`);
          }
          r.constraints?.primaryKeys?.[s] !== !0 && o.push(`invalid_primary_key:${s}`);
        }
      r.tables?.[e.DNS_IP_POOL_ITEMS_TABLE] && r.constraints?.uniqueKeys?.[`${e.DNS_IP_POOL_ITEMS_TABLE}.ip`] !== !0 && o.push(`missing_unique_key:${e.DNS_IP_POOL_ITEMS_TABLE}.ip`);
      for (const [s, i] of Object.entries(r.indexes || {})) i || await a.prepare("SELECT tbl_name FROM sqlite_master WHERE type = 'index' AND name = ? LIMIT 1").bind(s).first() && o.push(`invalid_index:${s}`);
      if (r.fts?.tableReady && r.ftsReady !== !0 && o.push("fts_contract_invalid"), o.length) {
        const s = /* @__PURE__ */ new Error("Existing D1 schema does not match the current contract");
        throw s.code = "D1_SCHEMA_INCOMPATIBLE", s.status = 409, s.details = {
          phase: "preflight",
          issues: [...new Set(o)]
        }, s;
      }
      return !0;
    },
    async initializeD1Database(a, t = {}) {
      if (!a) {
        const i = /* @__PURE__ */ new Error("D1 not configured");
        throw i.code = "D1_NOT_CONFIGURED", i.status = 503, i;
      }
      const r = t.includeFts === !1 ? "logs-core" : "logs-fts";
      let o = Z.D1DatabaseInitReady.get(a);
      (!o || !(o.inFlight instanceof Map)) && (o = {
        tail: Promise.resolve(),
        inFlight: /* @__PURE__ */ new Map()
      }, Z.D1DatabaseInitReady.set(a, o));
      let s = o.inFlight.get(r);
      s || (s = Promise.resolve(o.tail).catch(() => {
      }).then(() => e.runD1DatabaseInitialization(a, {
        ...t,
        profile: r
      })), o.tail = s.catch(() => {
      }), o.inFlight.set(r, s));
      try {
        return await s;
      } finally {
        o.inFlight.get(r) === s && o.inFlight.delete(r);
      }
    },
    async runD1DatabaseInitialization(a, t = {}) {
      const r = t.profile || (t.includeFts === !1 ? "logs-core" : "logs-fts");
      e.invalidateD1SchemaReadiness(a, "all");
      const o = await e.getD1TableNameSet(a), s = await e.getD1SchemaStatus(a);
      await e.assertD1CurrentSchema(a, s);
      try {
        const i = await e.bootstrapD1Schema(a, r);
        e.invalidateD1SchemaReadiness(a, "all");
        const c = await e.getD1SchemaStatus(a);
        if (!c.schemaReady) {
          const l = /* @__PURE__ */ new Error("D1 schema initialization did not produce the current contract");
          throw l.code = "D1_SCHEMA_INCOMPATIBLE", l.status = 409, l.details = {
            phase: "final_status",
            issues: c.issues
          }, l;
        }
        return {
          profile: r,
          schemaReady: !0,
          createdTables: [...await e.getD1TableNameSet(a)].filter((l) => !o.has(l)),
          ftsRebuilt: i.ftsResult?.rebuilt === !0,
          ftsRecreated: i.ftsResult?.recreated === !0,
          steps: i.steps,
          status: c
        };
      } catch (i) {
        throw i;
      }
    },
    async probeLogsReadiness(a, t = {}) {
      if (!a) return {
        schemaReady: !1,
        ftsReady: !1,
        statsReady: !1,
        probedAt: (/* @__PURE__ */ new Date()).toISOString()
      };
      const r = oe.LogsReadinessProbeCache.get(a), o = Math.max(1e3, Number(t.maxAgeMs) || 15e3);
      if (t.force !== !0 && r && k() - r.ts < o) return r.data;
      const [s, i, c] = await Promise.all([
        e.hasLogsBaseTable(a),
        e.isLogsFtsReady(a),
        e.hasStatsHourlyTable(a)
      ]), l = {
        schemaReady: s,
        ftsReady: i,
        statsReady: c,
        probedAt: (/* @__PURE__ */ new Date()).toISOString()
      };
      return oe.LogsReadinessProbeCache.set(a, {
        ts: k(),
        data: l
      }), l;
    },
    async resolveLogsReadiness(a, t = {}) {
      const r = e.resolveOpsStatusStores(a), o = await e.getOpsStatusSection(r, "log"), s = o?.schemaReady === !0, i = o?.ftsReady === !0, c = o?.statsReady === !0;
      return s && c && (i || t.requireFts !== !0) || !r.db ? {
        schemaReady: s,
        ftsReady: i,
        statsReady: c,
        revision: e.getLogsRevisionFromStatus(o),
        source: "status",
        logStatus: o
      } : {
        ...await e.probeLogsReadiness(r.db, t),
        revision: e.getLogsRevisionFromStatus(o),
        source: "probe",
        logStatus: o
      };
    }
  };
}
function rg(n = {}, e = {}) {
  return {
    async ensureLogsBaseSchema(a) {
      if (!a) return !1;
      if (e.isD1SchemaReadyCached(a, "logsBaseSchema")) return !0;
      let t = Z.LogsBaseDbReady.get(a);
      t || (t = (async () => (await a.prepare(`CREATE TABLE IF NOT EXISTS ${e.LOGS_TABLE} (id INTEGER PRIMARY KEY AUTOINCREMENT, timestamp INTEGER NOT NULL, node_name TEXT NOT NULL, request_path TEXT NOT NULL, request_method TEXT NOT NULL, status_code INTEGER NOT NULL, response_time INTEGER NOT NULL, client_ip TEXT NOT NULL, inbound_colo TEXT, outbound_colo TEXT, user_agent TEXT, referer TEXT, category TEXT DEFAULT 'api', error_detail TEXT, detail_json TEXT, created_at TEXT NOT NULL, inbound_ip TEXT, outbound_ip TEXT)`).run(), await a.prepare(`CREATE INDEX IF NOT EXISTS idx_proxy_logs_timestamp ON ${e.LOGS_TABLE} (timestamp)`).run(), await a.prepare(`CREATE INDEX IF NOT EXISTS idx_proxy_logs_client_time ON ${e.LOGS_TABLE} (client_ip, timestamp DESC)`).run(), await a.prepare(`CREATE INDEX IF NOT EXISTS idx_proxy_logs_status_time ON ${e.LOGS_TABLE} (status_code, timestamp)`).run(), await a.prepare(`CREATE INDEX IF NOT EXISTS idx_proxy_logs_category_time ON ${e.LOGS_TABLE} (category, timestamp)`).run(), e.markD1SchemaReady(a, "logsBaseSchema"), e.markD1SchemaReady(a, "logsTableExists"), oe.LogsReadinessProbeCache.delete(a), !0))().catch((r) => {
        throw Z.LogsBaseDbReady.delete(a), r;
      }), Z.LogsBaseDbReady.set(a, t));
      try {
        return await t;
      } finally {
        Z.LogsBaseDbReady.get(a) === t && Z.LogsBaseDbReady.delete(a);
      }
    },
    async ensureStatsHourlySchema(a) {
      if (!a) return !1;
      if (e.isD1SchemaReadyCached(a, "statsHourlySchema")) return !0;
      let t = Z.StatsHourlyDbReady.get(a);
      t || (t = a.prepare(`CREATE TABLE IF NOT EXISTS ${e.STATS_HOURLY_TABLE} (
              bucket_date TEXT NOT NULL,
              bucket_hour INTEGER NOT NULL,
              request_count INTEGER NOT NULL DEFAULT 0,
              play_count INTEGER NOT NULL DEFAULT 0,
              playback_info_count INTEGER NOT NULL DEFAULT 0,
              updated_at TEXT NOT NULL,
              PRIMARY KEY (bucket_date, bucket_hour)
            )`).run().then(() => (e.markD1SchemaReady(a, "statsHourlySchema"), e.markD1SchemaReady(a, "statsTableExists"), oe.LogsReadinessProbeCache.delete(a), !0)).catch((r) => {
        throw Z.StatsHourlyDbReady.delete(a), r;
      }), Z.StatsHourlyDbReady.set(a, t));
      try {
        return await t;
      } finally {
        Z.StatsHourlyDbReady.get(a) === t && Z.StatsHourlyDbReady.delete(a);
      }
    }
  };
}
function ag(n = {}, e = {}) {
  return {
    normalizeD1SchemaProfile(a = "") {
      const t = String(a || "").trim().toLowerCase();
      return t === "runtime-core" || t === "logs-core" || t === "logs-fts" ? t : "logs-core";
    },
    invalidateD1SchemaReadiness(a, t = "all") {
      if (!a) return;
      const r = String(t || "all").trim().toLowerCase();
      if ((r === "all" || r === "logs") && (e.clearD1SchemaReady(a, [
        "logsBaseSchema",
        "logsTableExists",
        "statsHourlySchema",
        "statsTableExists"
      ]), Z.LogsBaseDbReady.delete(a), Z.StatsHourlyDbReady.delete(a), oe.LogsReadinessProbeCache.delete(a)), r === "all") {
        e.clearD1SchemaReady(a);
        const o = Z.OpsStatusShadowCache.get(a);
        o?.payloadCache instanceof Map && o.payloadCache.clear(), Z.AdminShellStatusWriteState.delete(a), Z.DnsIpWorkspaceDbReady.delete(a), Z.OpsStatusDbReady.delete(a), Z.ScheduledLeaseDbReady.delete(a), Z.AuthFailuresDbReady.delete(a), Z.CfDashboardCacheDbReady.delete(a), Z.CfRuntimeCacheDbReady.delete(a);
      }
    },
    async bootstrapD1Schema(a, t = "logs-core") {
      const r = e.normalizeD1SchemaProfile(t);
      if (!a) return {
        profile: r,
        runtimeTablesReady: !1,
        schemaReady: !1,
        statsReady: !1,
        ftsReady: !1,
        ftsResult: {
          migratedRows: 0,
          droppedTriggers: 0,
          rebuilt: !1,
          recreated: !1
        },
        steps: []
      };
      const o = [
        {
          name: "ensureSysStatusTable",
          run: () => e.ensureSysStatusTable(a)
        },
        {
          name: "ensureScheduledLeaseTable",
          run: () => e.ensureScheduledLeaseTable(a)
        },
        {
          name: "ensureDnsIpWorkspaceSchema",
          run: () => e.ensureDnsIpWorkspaceSchema(a)
        },
        {
          name: "ensureAuthFailuresTable",
          run: () => e.ensureAuthFailuresTable(a)
        },
        {
          name: "ensureCfDashboardCacheTable",
          run: () => e.ensureCfDashboardCacheTable(a)
        },
        {
          name: "ensureCfRuntimeCacheTable",
          run: () => e.ensureCfRuntimeCacheTable(a)
        }
      ], s = [{
        name: "ensureLogsBaseSchema",
        run: () => e.ensureLogsBaseSchema(a)
      }, {
        name: "ensureStatsHourlySchema",
        run: () => e.ensureStatsHourlySchema(a)
      }], i = r === "runtime-core" ? o : r === "logs-fts" ? [
        ...o,
        ...s,
        {
          name: "ensureLogsFtsSchema",
          run: () => e.ensureLogsFtsSchema(a)
        }
      ] : [...o, ...s], c = [];
      let l = {
        migratedRows: 0,
        droppedTriggers: 0,
        rebuilt: !1,
        recreated: !1
      };
      for (const u of i) {
        const d = await u.run();
        u.name === "ensureLogsFtsSchema" && F(d) && (l = {
          migratedRows: Math.max(0, Number(d.migratedRows) || 0),
          droppedTriggers: Math.max(0, Number(d.droppedTriggers) || 0),
          rebuilt: d.rebuilt === !0,
          recreated: d.recreated === !0
        }), c.push({
          name: u.name,
          ready: u.name === "ensureLogsFtsSchema" ? await e.isLogsFtsReady(a) : d === !0
        });
      }
      return oe.LogsReadinessProbeCache.delete(a), {
        profile: r,
        runtimeTablesReady: o.every((u) => c.some((d) => d.name === u.name && d.ready === !0)),
        schemaReady: await e.hasLogsBaseTable(a),
        statsReady: await e.hasStatsHourlyTable(a),
        ftsReady: await e.isLogsFtsReady(a),
        ftsResult: l,
        steps: c
      };
    }
  };
}
function ng(n = {}, e = {}) {
  return {
    ...eg(n, e),
    ...tg(n, e),
    ...rg(n, e),
    ...ag(n, e)
  };
}
function og() {
  const n = {
    createSummary(e = {}, a = "manual", t = {}) {
      return {
        ...e.summary || {},
        mode: a,
        rebuiltStatsHourly: !1,
        rebuiltLogsFts: !1,
        alignedStatsWindow: !1,
        optimizedDb: !1,
        migratedDnsIpPoolSourcesToKvCount: 0,
        clearedLegacyDnsIpPoolSourcesCount: 0,
        statsAlignStatus: t.alignStatsWindow ? "pending" : "skipped",
        statsAlignError: "",
        statsRebuildStatus: t.rebuildStatsHourly ? "pending" : "skipped",
        statsRebuildError: "",
        ftsRebuildStatus: t.rebuildLogsFts ? "pending" : t.rebuildLogsFtsDeferred ? "deferred" : "skipped",
        ftsRebuildRecovered: !1,
        ftsRebuildError: "",
        optimizeStatus: t.optimizeDb ? "pending" : t.optimizeDbDeferred ? "deferred" : "skipped",
        optimizeError: "",
        status: a === "scheduled" ? "skipped" : "success",
        reason: ""
      };
    },
    buildDeleteSteps(e, a = {}, t = {}, r = {}, o) {
      return [
        [
          r.deleteExpiredLogs,
          t.deletedExpiredLogCount,
          "deleteExpiredLogs",
          e.LOGS_TABLE,
          "timestamp < ?",
          a.retentionCutoffMs
        ],
        [
          r.deleteExpiredLocks,
          t.deletedExpiredLockCount,
          "deleteExpiredLocks",
          e.SCHEDULED_LOCKS_TABLE,
          "expires_at <= ?",
          a.nowMs
        ],
        [
          r.deleteExpiredFetchCache,
          t.deletedExpiredFetchCacheCount,
          "deleteExpiredFetchCache",
          e.DNS_IP_POOL_FETCH_CACHE_TABLE,
          "expires_at <= ?",
          a.nowMs
        ],
        [
          r.deleteExpiredProbeCache,
          t.deletedExpiredProbeCacheCount,
          "deleteExpiredProbeCache",
          e.DNS_IP_PROBE_CACHE_TABLE,
          "expires_at <= ?",
          a.nowMs
        ],
        [
          r.deleteExpiredAuthFailures,
          t.deletedExpiredAuthFailureCount,
          "deleteExpiredAuthFailures",
          e.AUTH_FAILURES_TABLE,
          "expires_at <= ?",
          a.nowMs
        ],
        [
          r.deleteExpiredDashboardCache,
          t.deletedExpiredDashboardCacheCount,
          "deleteExpiredDashboardCache",
          e.CF_DASH_CACHE_TABLE,
          "expires_at <= ?",
          a.nowMs
        ],
        [
          r.deleteExpiredRuntimeCache,
          t.deletedExpiredRuntimeCacheCount,
          "deleteExpiredRuntimeCache",
          e.CF_RUNTIME_CACHE_TABLE,
          "expires_at <= ?",
          a.nowMs
        ]
      ].map(([s, i, c, l, u, d]) => ({
        enabled: s,
        count: i,
        stepName: c,
        db: o,
        sql: `DELETE FROM ${l} WHERE ${u}`,
        bindParams: [d]
      }));
    },
    async runDeleteStep({ enabled: e = !1, count: a = 0, beforeStep: t = async (c) => {
    }, stepName: r = "", db: o, sql: s = "", bindParams: i = [] }) {
      return e !== !0 || Number(a) <= 0 ? !1 : (await t(r), await o.prepare(s).bind(...i).run(), !0);
    },
    async runDeleteSteps(e = [], a = async (t) => {
    }) {
      let t = !1;
      for (const r of Array.isArray(e) ? e : []) t = await n.runDeleteStep({
        beforeStep: a,
        ...F(r) ? r : {}
      }) || t;
      return t;
    },
    async patchLogStatus(e, a, t, r, o, s, i = {}) {
      const c = (/* @__PURE__ */ new Date()).toISOString(), l = String(r?.mode || i.mode || "manual").trim().toLowerCase() === "scheduled" ? "scheduled" : "manual", u = await e.isLogsFtsReady(a), d = await e.hasStatsHourlyTable(a);
      await e.getD1SchemaStatus(a);
      const f = {
        schemaReady: !0,
        ftsReady: u,
        statsReady: d,
        categoryEnabled: !0,
        statsUtcOffsetMinutes: r.statsUtcOffsetMinutes || r.utcOffsetMinutes
      };
      return (o.rebuiltStatsHourly === !0 || o.alignedStatsWindow === !0) && (f.statsAlignedAt = c, f.statsAlignedWindowStartAt = new Date((l === "scheduled" ? r.statsStartTs : r.retentionCutoffMs) || r.retentionCutoffMs).toISOString(), f.statsAlignedWindowEndAt = new Date((l === "scheduled" ? r.statsEndTs : r.nowMs) || r.nowMs).toISOString()), l === "scheduled" && s.deleteExpiredLogs === !0 && Number(o.deletedExpiredLogCount) > 0 ? await e.bumpLogsRevision(t, f, i.ctx).catch(() => {
      }) : await ge(e.patchOpsStatus(t, { log: f }, i.ctx), "d1_tidy.patch_log_status", { mode: l }, null), c;
    }
  };
  return n;
}
function sg() {
  return {
    buildContext(n = {}, e = {}) {
      const a = String(e.mode || "manual").trim().toLowerCase() === "scheduled" ? "scheduled" : "manual", t = lt(e.maintenanceMode, a), r = e.scheduledNow instanceof Date ? new Date(e.scheduledNow.getTime()) : new Date(e.scheduledNow || k()), o = Number(e.nowMs) || (a === "scheduled" ? r.getTime() : k()), s = de(n.logRetentionDays, O.Defaults.LogRetentionDays, 1, O.Defaults.LogRetentionDaysMax), i = Math.max(0, o - s * 24 * 60 * 60 * 1e3), c = ke(n.scheduleUtcOffsetMinutes), l = F(e.dayWindow) ? e.dayWindow : dt(r, n.scheduleUtcOffsetMinutes);
      return {
        mode: a,
        maintenanceMode: t,
        runtimeConfig: n,
        scheduledNow: r,
        nowTimestamp: o,
        retentionDays: s,
        retentionCutoffMs: i,
        utcOffsetMinutes: c,
        dayWindow: l,
        statsBucketDate: String(e.statsBucketDate || l?.dateKey || "").trim(),
        statsStartTs: Number(e.statsStartTs ?? l?.startTs) || 0,
        statsEndTs: Number(e.statsEndTs ?? l?.endTs) || 0,
        statsUtcOffsetMinutes: ke(e.statsUtcOffsetMinutes ?? l?.utcOffsetMinutes ?? n.scheduleUtcOffsetMinutes),
        previousScheduledState: F(e.previousScheduledState) ? e.previousScheduledState : {},
        previousD1State: null,
        lastFtsRebuildAt: "",
        lastOptimizeAt: ""
      };
    },
    attachPreviousState(n, e, a = null) {
      const t = n.getPreviousD1TidyState(e.previousScheduledState, a), r = typeof t.lastFtsRebuildAt == "string" ? t.lastFtsRebuildAt : "", o = typeof t.lastOptimizeAt == "string" ? t.lastOptimizeAt : "";
      return {
        ...e,
        previousD1State: t,
        lastFtsRebuildAt: r,
        lastOptimizeAt: o || (typeof t.lastVacuumAt == "string" ? t.lastVacuumAt : "")
      };
    },
    async readFacts(n, e, a, t) {
      return {
        deletedExpiredLogCount: await n.readD1Count(e, `SELECT COUNT(*) as total FROM ${n.LOGS_TABLE} WHERE timestamp < ?`, [t.retentionCutoffMs]),
        preservedLogCount: await n.readD1Count(e, `SELECT COUNT(*) as total FROM ${n.LOGS_TABLE} WHERE timestamp >= ?`, [t.retentionCutoffMs]),
        deletedExpiredLockCount: await n.readD1Count(e, `SELECT COUNT(*) as total FROM ${n.SCHEDULED_LOCKS_TABLE} WHERE expires_at <= ?`, [t.nowTimestamp]),
        deletedExpiredFetchCacheCount: await n.readD1Count(e, `SELECT COUNT(*) as total FROM ${n.DNS_IP_POOL_FETCH_CACHE_TABLE} WHERE expires_at <= ?`, [t.nowTimestamp]),
        deletedExpiredProbeCacheCount: await n.readD1Count(e, `SELECT COUNT(*) as total FROM ${n.DNS_IP_PROBE_CACHE_TABLE} WHERE expires_at <= ?`, [t.nowTimestamp]),
        deletedExpiredAuthFailureCount: await n.readD1Count(e, `SELECT COUNT(*) as total FROM ${n.AUTH_FAILURES_TABLE} WHERE expires_at <= ?`, [t.nowTimestamp]),
        deletedExpiredDashboardCacheCount: await n.readD1Count(e, `SELECT COUNT(*) as total FROM ${n.CF_DASH_CACHE_TABLE} WHERE expires_at <= ?`, [t.nowTimestamp]),
        deletedExpiredRuntimeCacheCount: await n.readD1Count(e, `SELECT COUNT(*) as total FROM ${n.CF_RUNTIME_CACHE_TABLE} WHERE expires_at <= ?`, [t.nowTimestamp]),
        statsHourlyRowCount: await n.readD1Count(e, `SELECT COUNT(*) as total FROM ${n.STATS_HOURLY_TABLE}`),
        dnsIpPoolItemCount: await n.readD1Count(e, `SELECT COUNT(*) as total FROM ${n.DNS_IP_POOL_ITEMS_TABLE}`),
        dnsIpPoolSourceCount: await n.readD1Count(e, `SELECT COUNT(*) as total FROM ${n.DNS_IP_POOL_SOURCES_TABLE}`),
        sysStatusCount: await n.readD1Count(e, `SELECT COUNT(*) as total FROM ${n.SYS_STATUS_TABLE}`),
        ftsReady: await n.isLogsFtsReady(e),
        d1DnsIpPoolSources: await n.getDnsIpPoolSourcesFromDb(e),
        kvDnsIpPoolSources: []
      };
    },
    buildSourcePolicy(n = []) {
      return {
        dnsIpPoolSourceAction: Array.isArray(n) && n.length > 0 ? "preserve_d1_primary" : "noop",
        skipDnsIpPoolSourceCleanup: !0
      };
    },
    buildFlags(n, e, a, t) {
      const r = a.deletedExpiredLogCount > 0, o = ff(e.maintenanceMode, e.mode), s = o || !a.ftsReady || r && n.shouldRunLogsFtsRebuild(e.lastFtsRebuildAt, { nowMs: e.nowTimestamp }), i = o ? !0 : r && n.shouldRunLogsOptimize(e.lastOptimizeAt, { nowMs: e.nowTimestamp }), c = e.mode === "scheduled" && r, l = o || r;
      return {
        deleteExpiredLogs: r,
        deleteExpiredLocks: a.deletedExpiredLockCount > 0,
        deleteExpiredFetchCache: a.deletedExpiredFetchCacheCount > 0,
        deleteExpiredProbeCache: a.deletedExpiredProbeCacheCount > 0,
        deleteExpiredAuthFailures: a.deletedExpiredAuthFailureCount > 0,
        deleteExpiredDashboardCache: a.deletedExpiredDashboardCacheCount > 0,
        deleteExpiredRuntimeCache: a.deletedExpiredRuntimeCacheCount > 0,
        rebuildStatsHourly: l,
        rebuildLogsFts: s,
        rebuildLogsFtsDeferred: e.mode === "scheduled" && r && a.ftsReady && s !== !0,
        rebuildLogsFtsForceRecreate: !1,
        optimizeDb: i,
        optimizeDbDeferred: e.mode === "scheduled" && r && i !== !0,
        alignStatsWindow: c,
        rebuildDailyStats: c,
        processDnsIpPoolSources: !1
      };
    },
    buildPreview(n, e, a, t) {
      const r = [], o = Cd(e.d1DnsIpPoolSources);
      Ee(r, e.deletedExpiredLogCount > 0, "proxy_logs", "超保留期 proxy_logs 日志", [], e.deletedExpiredLogCount, `只会删除早于 ${new Date(n.retentionCutoffMs).toISOString()} 的日志。`), Ee(r, e.deletedExpiredLockCount > 0, "sys_locks", "过期 sys_locks 定时租约", [], e.deletedExpiredLockCount, "只会删除 expires_at 已过期的租约记录。"), Ee(r, e.deletedExpiredFetchCacheCount > 0, "dns_ip_pool_fetch_cache", "过期 dns_ip_pool_fetch_cache 聚合缓存", [], e.deletedExpiredFetchCacheCount, "只会删除 expires_at 已过期的 API 抓取聚合缓存。"), Ee(r, e.deletedExpiredProbeCacheCount > 0, "dns_ip_probe_cache", "过期 dns_ip_probe_cache 探测缓存", [], e.deletedExpiredProbeCacheCount, "只会删除 expires_at 已过期的探测缓存。"), Ee(r, e.deletedExpiredAuthFailureCount > 0, "auth_failures", "过期 auth_failures 登录失败计数", [], e.deletedExpiredAuthFailureCount, "只会删除 expires_at 已过期的登录失败计数。"), Ee(r, e.deletedExpiredDashboardCacheCount > 0, "cf_dashboard_cache", "过期 cf_dashboard_cache 仪表盘缓存", [], e.deletedExpiredDashboardCacheCount, "只会删除 expires_at 已过期的仪表盘缓存。");
      const s = [
        it("proxy_stats_hourly", "proxy_stats_hourly 统计表", [], {
          count: Math.max(1, e.statsHourlyRowCount),
          note: n.maintenanceMode === "full" ? `会按保留期内日志全量重建小时统计（当前行数 ${e.statsHourlyRowCount}）。` : `会在必要时对齐小时统计（当前行数 ${e.statsHourlyRowCount}）。`
        }),
        it("proxy_logs_fts", "proxy_logs_fts 全文索引", [], {
          count: Math.max(1, e.preservedLogCount),
          note: e.ftsReady ? n.maintenanceMode === "full" ? "会基于当前保留日志重建全文索引。" : "会在必要时重建全文索引。" : "当前未检测到 FTS 表，整理时会按策略补建并重建全文索引。"
        }),
        it("scheduled_d1_tidy", "scheduled.d1Tidy 运行状态", ["scheduled.d1Tidy"], {
          count: 1,
          note: "整理完成后会写入一份新的运行状态摘要。"
        })
      ], i = [
        it("proxy_logs_retained", "保留期内 proxy_logs 日志", [], {
          count: e.preservedLogCount,
          note: `会保留最近 ${n.retentionDays} 天的日志。`
        }),
        it("dns_ip_pool_items", "dns_ip_pool_items 共享 IP 池", [], {
          count: e.dnsIpPoolItemCount,
          note: "不会删除 dns_ip_pool_items。"
        }),
        it("sys_status", "sys_status 运行状态", [], {
          count: e.sysStatusCount,
          note: "不会删除 sys_status 中的有效运行状态。"
        })
      ];
      Ee(i, e.d1DnsIpPoolSources.length > 0, "dns_ip_pool_sources_d1_primary", "dns_ip_pool_sources 主数据", o, e.d1DnsIpPoolSources.length, "dns_ip_pool_sources 现在是正式主数据，本次不会迁回 KV，也不会清空该表。");
      const c = [], l = Math.max(0, Number(n.logQueuePendingCount) || 0);
      return l > 0 && c.push(`执行前会先尝试 flush ${l} 条内存日志，再开始清理 D1。`), c.push(n.maintenanceMode === "full" ? "当前为 full 维护模式，会强制执行统计、FTS 与 optimize。" : "当前为 smart 维护模式，只在检测到必要条件时执行较重的统计、FTS 与 optimize。"), r.length === 0 && c.push(n.mode === "scheduled" ? "当前定时 D1 维护没有检测到需要删除的旧数据，本轮会按计划检查统计与索引维护。" : "当前没有检测到需要删除的 D1 旧数据；本次主要会执行统计表与 FTS 维护。"), {
        scope: "d1",
        fieldGroups: [],
        deleteGroups: r,
        rewriteGroups: s,
        preserveGroups: i,
        warnings: c
      };
    },
    buildSummary(n, e, a, t = {}) {
      return {
        mode: n.mode,
        maintenanceMode: n.maintenanceMode,
        logRetentionDays: n.retentionDays,
        retentionCutoffAt: new Date(n.retentionCutoffMs).toISOString(),
        deletedExpiredLogCount: e.deletedExpiredLogCount,
        preservedLogCount: e.preservedLogCount,
        deletedExpiredLockCount: e.deletedExpiredLockCount,
        deletedExpiredFetchCacheCount: e.deletedExpiredFetchCacheCount,
        deletedExpiredProbeCacheCount: e.deletedExpiredProbeCacheCount,
        deletedExpiredAuthFailureCount: e.deletedExpiredAuthFailureCount,
        deletedExpiredDashboardCacheCount: e.deletedExpiredDashboardCacheCount,
        deletedExpiredRuntimeCacheCount: e.deletedExpiredRuntimeCacheCount,
        rebuiltStatsHourly: t.rebuildStatsHourly === !0,
        rebuiltLogsFts: t.rebuildLogsFts === !0,
        alignedStatsWindow: t.alignStatsWindow === !0,
        migratedDnsIpPoolSourcesToKvCount: 0,
        clearedLegacyDnsIpPoolSourcesCount: 0,
        preservedDnsIpPoolItemCount: e.dnsIpPoolItemCount,
        preservedDnsIpPoolSourceCount: e.dnsIpPoolSourceCount,
        preservedSysStatusCount: e.sysStatusCount,
        logQueuePendingCount: Math.max(0, Number(n.logQueuePendingCount) || 0),
        dnsIpPoolSourceAction: a.dnsIpPoolSourceAction,
        lastFtsRebuildAt: n.lastFtsRebuildAt,
        lastOptimizeAt: n.lastOptimizeAt
      };
    }
  };
}
var ig = Object.freeze({
  PREFIX: "node:",
  CONFIG_KEY: "sys:theme",
  NODES_INDEX_KEY: "sys:nodes_index:v1",
  NODES_SUMMARY_INDEX_KEY: "sys:nodes_index_full:v2",
  ADMIN_INDEX_UPLOAD_PREFIX: Bl,
  ADMIN_ACTIVE_INDEX_KEY: Wl,
  LEGACY_OPS_STATUS_KEY: "sys:ops_status:v1",
  LEGACY_SCHEDULED_LOCK_KEY: "sys:scheduled_lock:v1",
  WORKER_PLACEMENT_REGION_OVERRIDE_PREFIX: "sys:worker_placement_region:v1:",
  CONFIG_SNAPSHOTS_KEY: "sys:config_snapshots:v1",
  CONFIG_META_KEY: "sys:config_meta:v1",
  CONFIG_SNAPSHOTS_META_KEY: "sys:config_snapshots_meta:v1",
  NODES_INDEX_META_KEY: "sys:nodes_index_meta:v1",
  LEGACY_DNS_IP_POOL_SOURCES_KEY: "sys:dns_ip_pool_sources:v1",
  DNS_RECORD_HISTORY_PREFIX: "sys:dns_record_history:v1:",
  LEGACY_TELEGRAM_ALERT_STATE_KEY: "sys:telegram_alert_state:v1",
  SYS_STATUS_TABLE: "sys_status",
  SCHEDULED_LOCKS_TABLE: "sys_locks",
  SCHEDULED_LOCK_SCOPE: "scheduled",
  LOGS_TABLE: "proxy_logs",
  LOGS_FTS_TABLE: "proxy_logs_fts",
  LOGS_FTS_INSERT_TRIGGER: "proxy_logs_fts_ai",
  STATS_HOURLY_TABLE: "proxy_stats_hourly",
  AUTH_FAILURES_TABLE: "auth_failures",
  CF_DASH_CACHE_TABLE: "cf_dashboard_cache",
  CF_RUNTIME_CACHE_TABLE: "cf_runtime_cache",
  DNS_IP_POOL_ITEMS_TABLE: "dns_ip_pool_items",
  DNS_IP_POOL_SOURCES_TABLE: "dns_ip_pool_sources",
  DNS_IP_POOL_FETCH_CACHE_TABLE: "dns_ip_pool_fetch_cache",
  DNS_IP_PROBE_CACHE_TABLE: "dns_ip_probe_cache",
  OPS_STATUS_DB_SCOPE_ROOT: "ops_status:root",
  TELEGRAM_ALERT_STATE_DB_SCOPE: "telegram_alert_state",
  OPS_STATUS_SECTION_SCOPES: Object.freeze({
    log: "ops_status:log",
    scheduled: "ops_status:scheduled",
    dnsIpPool: "ops_status:dns_ip_pool"
  }),
  LEGACY_OPS_STATUS_SECTION_KEYS: Object.freeze({
    log: "sys:ops_status:log:v1",
    scheduled: "sys:ops_status:scheduled:v1",
    dnsIpPool: "sys:ops_status:dns_ip_pool:v1"
  })
});
function cg(n = {}) {
  const { nodeRepository: e } = n;
  return {
    async getNodesList(a, t) {
      const r = e.getKV(a);
      if (!r) return [];
      const o = Se(r);
      if (o.NodesListCache && o.NodesListCache.exp > k()) return o.NodesListCache.data;
      const s = await e.getNodesSummaryIndex(r, { ctx: t });
      if (Array.isArray(s)) return s;
      const i = await e.rebuildNodeIndexesFromKv(r, { ctx: t });
      return Array.isArray(i?.summaries) ? i.summaries : [];
    },
    async getNodesListStrict(a, t) {
      const r = e.getKV(a);
      if (!r) return [];
      const o = Se(r);
      if (o.NodesListCache && o.NodesListCache.exp > k()) return o.NodesListCache.data;
      const s = await e.getNodesSummaryIndexStrict(r, { ctx: t });
      if (Array.isArray(s)) return s;
      const i = await e.rebuildNodeIndexesFromKvStrict(r, { ctx: t });
      return Array.isArray(i?.summaries) ? i.summaries : [];
    },
    async invalidateList(a, t = null) {
      const r = e.getKV(t), o = Se(r);
      o.NodesListCache = null, o.NodesIndexCache = null, or(r);
    },
    maybeCleanup(a = null) {
      const t = a ? Se(e.getKV(a)) : ft.current(), r = k(), o = t.CleanupState;
      if (r - (o.lastRunAt || 0) < O.Defaults.CleanupMinIntervalMs) return;
      o.lastRunAt = r;
      const s = O.Defaults.CleanupBudgetMs, i = O.Defaults.CleanupChunkSize, c = o.iterators || (o.iterators = {
        node: null,
        playbackRoute: null,
        crypto: null,
        rate: null,
        log: null,
        playbackInfo: null,
        failover: null,
        progress: null,
        monthlyTraffic: null
      }), l = r, u = (d, f, m, p = c) => {
        let g = p[m];
        g || (g = d.entries(), p[m] = g);
        let h = 0;
        for (; h < i && (h === 0 || k() - l < s); ) {
          const y = g.next();
          if (y.done) {
            p[m] = null;
            break;
          }
          h += 1;
          const [S, _] = y.value;
          d.has(S) && f(_, r) && d.delete(S);
        }
      };
      if (o.phase === 0)
        u(t.NodeCache, (d) => d?.exp && d.exp < r, "node", t.CleanupIterators), o.phase = 1;
      else if (o.phase === 1)
        u(t.PlaybackRouteHotCache, (d) => !d || Number(d.expiresAt) <= r, "playbackRoute", t.CleanupIterators), o.phase = 2;
      else if (o.phase === 2)
        u(oe.CryptoKeyCache, (d) => d?.exp && d.exp < r, "crypto"), o.phase = 3;
      else if (o.phase === 3)
        u(Xe.RateLimitCache, (d) => !d || d.resetAt < r, "rate"), o.phase = 4;
      else if (o.phase === 4) o.phase = 5;
      else if (o.phase === 5)
        u(oe.PlaybackInfoResponseCache, (d) => !d || (Number(d.expiresAt) || 0) <= r, "playbackInfo"), o.phase = 6;
      else if (o.phase === 6)
        u(oe.ProxyFailoverStateCache, (d) => {
          if (!d || typeof d != "object") return !0;
          if (d.failingTargets instanceof Map)
            for (const [y, S] of d.failingTargets) Number(S) <= r && d.failingTargets.delete(y);
          const f = Number(d.preferredTargetExpiresAt) > r, m = d.failingTargets instanceof Map && d.failingTargets.size > 0, p = !!d.inFlightProbe && Number(d.inFlightProbe.expiresAt) > r, g = Number(d.lastProbeResult?.completedAt) || 0, h = !!d.lastProbeResult && g + O.Defaults.HedgePreferredTtlSec * 1e3 > r;
          return !f && !m && !p && !h;
        }, "failover"), o.phase = 7;
      else if (o.phase === 7) {
        const d = Math.max(3e4, Math.max(1, Number(O.Defaults.VideoProgressForwardIntervalSec) || 1) * 2e4);
        u(oe.PlaybackProgressRelay, (f) => {
          if (!f || f.pendingSnapshot || f.activeFlushPromise) return !f;
          const m = Number(f.terminalTombstoneUntil) || 0;
          if (m > 0) return m < r;
          const p = Number(f.lastTouchedAt || f.lastForwardAt) || 0;
          return p > 0 && p + d <= r;
        }, "progress"), o.phase = 8;
      } else
        u(oe.DashboardMonthlyTrafficCache, (d) => !d || (Number(d.staleUntil) || 0) <= r, "monthlyTraffic"), o.phase = 0;
    }
  };
}
function lg(n = {}, e = {}) {
  const {} = n;
  return {
    normalizeNodeIndex(a = []) {
      return [...new Set((Array.isArray(a) ? a : []).map((t) => String(t || "").toLowerCase().trim()).filter(Boolean))];
    },
    normalizeNodeSummaryPayload(a, t = {}) {
      if (!F(t)) return null;
      const r = String(a || t.name || "").toLowerCase().trim();
      if (!r) return null;
      const o = e.normalizeLines(t.lines, t.target, t.port);
      if (!o.length) return null;
      const s = e.resolveActiveLineId(t.activeLineId, o, Array.isArray(t.lines) ? t.lines : [], t.port), i = tr(t.entryMode);
      return {
        name: r,
        cacheRevision: Yn(r, t),
        displayName: String(t.displayName ?? ""),
        entryMode: i,
        hostPrefixCnameTarget: i === "host_prefix" ? Bt(t.hostPrefixCnameTarget) : "",
        secret: i === "host_prefix" ? "" : String(t.secret ?? ""),
        tag: Ur(t.tags, t.tag)[0] || "",
        tags: Ur(t.tags, t.tag),
        tagColor: String(t.tagColor ?? ""),
        remark: String(t.remark ?? ""),
        lines: o.map((c) => ({
          id: String(c.id || "").trim(),
          name: String(c.name || "").trim(),
          target: String(c.target || "").trim()
        })),
        activeLineId: s,
        playbackInfoMode: Dr(t.playbackInfoMode),
        mediaAuthMode: er(t.mediaAuthMode),
        realClientIpMode: wr(t.realClientIpMode),
        hedgeProbePath: na(t.hedgeProbePath),
        routingDecisionMode: Mr(t.routingDecisionMode),
        mainVideoStreamMode: tn(t.mainVideoStreamMode ?? t.wangpanDirectMode ?? t.wangpanMode)
      };
    },
    buildComparableNodeSummary(a = {}) {
      return e.normalizeNodeSummaryPayload(a?.name, a);
    },
    areNodeSummariesEquivalent(a = {}, t = {}) {
      return se(e.buildComparableNodeSummary(a)) === se(e.buildComparableNodeSummary(t));
    },
    hasLegacyNodeMirrorFields(a = {}) {
      return F(a) ? Object.prototype.hasOwnProperty.call(a, "headers") || Object.prototype.hasOwnProperty.call(a, "target") || Object.prototype.hasOwnProperty.call(a, "port") || Object.prototype.hasOwnProperty.call(a, "schemaVersion") || Object.prototype.hasOwnProperty.call(a, "createdAt") || Object.prototype.hasOwnProperty.call(a, "updatedAt") || Object.prototype.hasOwnProperty.call(a, "remarkColor") || Object.prototype.hasOwnProperty.call(a, "wangpanDirectMode") || Object.prototype.hasOwnProperty.call(a, "wangpanMode") || [...dn, ...fn].some((t) => Object.prototype.hasOwnProperty.call(a, t)) ? !0 : (Array.isArray(a.lines) ? a.lines : []).some((t) => F(t) ? Object.prototype.hasOwnProperty.call(t, "port") || Object.prototype.hasOwnProperty.call(t, "latencyMs") || Object.prototype.hasOwnProperty.call(t, "latencyUpdatedAt") : !1) : !1;
    },
    summaryEntryRequiresNodeEntityRebuild(a = {}) {
      if (!F(a) || e.hasLegacyNodeMirrorFields(a)) return !0;
      const t = Array.isArray(a.lines) ? a.lines : [], r = e.normalizeLines(t, a.target, a.port);
      if (!r.length || t.length !== r.length) return !0;
      for (let o = 0; o < r.length; o += 1) {
        const s = t[o], i = r[o];
        if (!F(s) || !F(i) || String(s.target || "").trim() !== String(i.target || "").trim()) return !0;
      }
      return String(a.activeLineId || "").trim() !== e.resolveActiveLineId(a.activeLineId, r, t, a.port);
    },
    buildNodeSummary(a, t = {}, r = {}) {
      const o = String(a || t.name || "").toLowerCase().trim();
      if (!o || !F(t)) return {
        summary: null,
        changed: !1,
        legacyMirrorDetected: !1
      };
      const s = e.normalizeNode(o, t, r), i = e.normalizeNodeSummaryPayload(o, s.data);
      if (!i) return {
        summary: null,
        changed: !0,
        legacyMirrorDetected: e.hasLegacyNodeMirrorFields(t)
      };
      const c = e.normalizeNodeSummaryPayload(o, t), l = e.hasLegacyNodeMirrorFields(t);
      return {
        summary: i,
        changed: l || !e.areNodeSummariesEquivalent(c, i),
        legacyMirrorDetected: l
      };
    },
    normalizeNodeSummaryIndex(a = []) {
      const t = [], r = /* @__PURE__ */ new Set();
      let o = !1, s = !1, i = !1;
      for (const c of Array.isArray(a) ? a : []) {
        if (!F(c)) {
          o = !0, i = !0;
          continue;
        }
        const l = String(c.name || "").trim(), u = l.toLowerCase();
        if (!u || r.has(u)) {
          o = !0, i = !0;
          continue;
        }
        const { name: d, ...f } = c, m = e.buildNodeSummary(u, f);
        if (!m.summary) {
          o = !0, i = !0;
          continue;
        }
        (m.changed || l !== u) && (o = !0), m.legacyMirrorDetected && (s = !0), e.summaryEntryRequiresNodeEntityRebuild(f) && (i = !0), t.push(m.summary), r.add(u);
      }
      return {
        nodes: t,
        changed: o,
        legacyMirrorDetected: s,
        requiresRebuild: i
      };
    },
    primeNodeSummaryCaches(a = [], t = null) {
      const r = Se(t), o = Array.isArray(a) ? a.filter((i) => F(i) && i.name) : [], s = e.normalizeNodeIndex(o.map((i) => i.name));
      return r.NodesListCache = {
        data: o.map((i) => ({ ...i })),
        exp: k() + 6e4
      }, r.NodesIndexCache = {
        data: s,
        exp: k() + 6e4
      }, o;
    },
    async getNodesSummaryIndex(a, t = {}) {
      if (!a) return null;
      const r = Se(a);
      if (t.useCache !== !1 && r.NodesListCache?.exp > k() && Array.isArray(r.NodesListCache.data)) return r.NodesListCache.data;
      const o = r.NodesRevisionCacheGeneration;
      let s = null;
      try {
        s = await a.get(e.NODES_SUMMARY_INDEX_KEY, { type: "json" });
      } catch {
        return null;
      }
      if (r.NodesRevisionCacheGeneration !== o) return Array.isArray(s) ? e.normalizeNodeSummaryIndex(s).nodes : null;
      if (!Array.isArray(s)) return null;
      const i = e.normalizeNodeSummaryIndex(s);
      if (i.requiresRebuild === !0) {
        const c = await e.rebuildNodeIndexesFromKv(a, { ctx: t.ctx });
        return Array.isArray(c?.summaries) ? c.summaries : [];
      }
      return r.NodesRevisionCacheGeneration === o ? e.primeNodeSummaryCaches(i.nodes, a) : i.nodes;
    },
    async getNodesSummaryIndexStrict(a, t = {}) {
      if (!a) return null;
      const r = Se(a);
      if (t.useCache !== !1 && r.NodesListCache?.exp > k() && Array.isArray(r.NodesListCache.data)) return r.NodesListCache.data;
      const o = r.NodesRevisionCacheGeneration, s = await we(a, e.NODES_SUMMARY_INDEX_KEY, { type: "json" });
      if (r.NodesRevisionCacheGeneration !== o) return Array.isArray(s) ? e.normalizeNodeSummaryIndex(s).nodes : [];
      if (!Array.isArray(s)) {
        const c = await e.rebuildNodeIndexesFromKvStrict(a, { ctx: t.ctx });
        return Array.isArray(c?.summaries) ? c.summaries : [];
      }
      const i = e.normalizeNodeSummaryIndex(s);
      if (i.requiresRebuild === !0) {
        const c = await e.rebuildNodeIndexesFromKvStrict(a, { ctx: t.ctx });
        return Array.isArray(c?.summaries) ? c.summaries : [];
      }
      return r.NodesRevisionCacheGeneration === o ? e.primeNodeSummaryCaches(i.nodes, a) : i.nodes;
    },
    async loadNodeSummariesForMutation(a, t = {}) {
      const r = await a.get(e.NODES_SUMMARY_INDEX_KEY, { type: "json" });
      if (Array.isArray(r)) {
        const o = e.normalizeNodeSummaryIndex(r);
        if (o.requiresRebuild !== !0) return o.nodes;
      }
      return (await e.loadAllNodeEntitiesFromKvStrict(a, { ctx: t.ctx })).map((o) => e.buildNodeSummary(o?.name, o).summary).filter(Boolean);
    },
    async commitNodesSummaryIndexMutation(a, t = {}) {
      const { kv: r, ctx: o, syncLegacyIndex: s = !1 } = t, i = e.normalizeNodeSummaryIndex(a).nodes, c = e.normalizeNodeIndex(i.map((g) => g.name)), l = e.buildNodesIndexMeta(c, i), u = await e.readRevisionMeta(r, e.NODES_INDEX_META_KEY, {
        count: 0,
        indexHash: "",
        fullIndexHash: ""
      }), d = [];
      (u.fullIndexHash !== l.fullIndexHash || !u.revision) && d.push(r.put(e.NODES_SUMMARY_INDEX_KEY, JSON.stringify(i))), s !== !1 && (u.indexHash !== l.indexHash || !u.revision) && d.push(r.put(e.NODES_INDEX_KEY, JSON.stringify(c)));
      const f = u.indexHash !== l.indexHash || u.fullIndexHash !== l.fullIndexHash || Number(u.count) !== Number(l.count) || !u.revision;
      if (d.length > 0) {
        const g = Promise.all(d);
        o && o.waitUntil(g), await g;
      }
      if (f) {
        const g = r.put(e.NODES_INDEX_META_KEY, JSON.stringify(l));
        o && o.waitUntil(g), await g;
      }
      const m = e.primeNodeSummaryCaches(i, r), p = f ? l : u;
      return fs(p.revision, r), {
        summaries: m,
        meta: p
      };
    },
    async persistNodesSummaryIndex(a, t = {}) {
      const { kv: r, ctx: o, syncLegacyIndex: s = !1 } = t, i = e.normalizeNodeSummaryIndex(a).nodes;
      if (!r) {
        const c = e.primeNodeSummaryCaches(i, r);
        return or(r), c;
      }
      return await Ar(async () => (await e.commitNodesSummaryIndexMutation(i, {
        kv: r,
        ctx: o,
        syncLegacyIndex: s
      })).summaries, r);
    },
    async listNodeEntityKeys(a) {
      return (await e.listKvKeys(a, { prefix: e.PREFIX })).map((t) => String(t || "").replace(e.PREFIX, "").toLowerCase().trim()).filter(Boolean);
    },
    async listNodeEntityKeysStrict(a) {
      return (await e.listKvKeysStrict(a, { prefix: e.PREFIX })).map((t) => String(t || "").replace(e.PREFIX, "").toLowerCase().trim()).filter(Boolean);
    },
    async loadAllNodeEntitiesFromKv(a, t = {}) {
      const { ctx: r } = t;
      return a ? (await Gr(await e.listNodeEntityKeys(a), O.Defaults.NodesReadConcurrency, async (o) => {
        try {
          const s = await a.get(`${e.PREFIX}${o}`, { type: "json" });
          if (!s) return null;
          const i = e.normalizeNode(o, s);
          if (i.changed) {
            const c = a.put(`${e.PREFIX}${o}`, JSON.stringify(i.data));
            r ? r.waitUntil(c) : await c;
          }
          return {
            name: o,
            ...i.data
          };
        } catch {
          return null;
        }
      })).filter(Boolean) : [];
    },
    async loadAllNodeEntitiesFromKvStrict(a, t = {}) {
      return a ? (await Gr(await e.listNodeEntityKeysStrict(a), O.Defaults.NodesReadConcurrency, async (r) => {
        const o = await we(a, `${e.PREFIX}${r}`, { type: "json" });
        return o ? {
          name: r,
          ...e.normalizeNode(r, o).data
        } : null;
      })).filter(Boolean) : [];
    },
    async rebuildNodeIndexesFromKv(a, t = {}) {
      const { ctx: r, syncLegacyIndex: o = !1 } = t;
      return a ? await Ar(async () => {
        const s = await e.loadAllNodeEntitiesFromKvStrict(a, { ctx: r }), i = s.map((l) => e.buildNodeSummary(l?.name, l).summary).filter(Boolean), c = await e.commitNodesSummaryIndexMutation(i, {
          kv: a,
          ctx: r,
          syncLegacyIndex: o
        });
        return {
          index: e.normalizeNodeIndex(c.summaries.map((l) => l?.name)),
          summaries: c.summaries,
          nodes: s
        };
      }, a) : {
        index: [],
        summaries: [],
        nodes: []
      };
    },
    async rebuildNodeIndexesFromKvStrict(a, t = {}) {
      if (!a) return {
        index: [],
        summaries: [],
        nodes: []
      };
      const r = Se(a), o = r.NodesRevisionCacheGeneration, s = await e.loadAllNodeEntitiesFromKvStrict(a, t), i = s.map((l) => e.buildNodeSummary(l?.name, l).summary).filter(Boolean), c = r.NodesRevisionCacheGeneration === o ? e.primeNodeSummaryCaches(i, a) : i;
      return {
        index: e.normalizeNodeIndex(c.map((l) => l?.name)),
        summaries: c,
        nodes: s
      };
    },
    async upsertNodeSummaryEntry(a, t, r = {}) {
      const { kv: o, ctx: s } = r;
      if (!o) return null;
      const i = String(a || "").toLowerCase().trim();
      if (!i) return null;
      const c = e.buildNodeSummary(i, t).summary;
      if (!c) return null;
      const l = Se(o), u = l.NodesListCache?.exp > k() && Array.isArray(l.NodesListCache.data) ? l.NodesListCache.data.find((d) => String(d?.name || "").toLowerCase().trim() === i) : null;
      return u && e.areNodeSummariesEquivalent(u, c) ? u : await Ar(async () => {
        const d = await e.loadNodeSummariesForMutation(o, { ctx: s });
        let f = !1;
        const m = d.map((p) => String(p?.name || "").toLowerCase().trim() !== i ? p : (f = !0, e.areNodeSummariesEquivalent(p, c) ? p : c));
        return f || m.push(c), (await e.commitNodesSummaryIndexMutation(m, {
          kv: o,
          ctx: s
        })).summaries.find((p) => String(p?.name || "").toLowerCase().trim() === i) || c;
      }, o);
    },
    async removeNodeSummaryEntry(a, t = {}) {
      const { kv: r, ctx: o } = t;
      if (!r) return [];
      const s = String(a || "").toLowerCase().trim();
      return await Ar(async () => {
        const i = (await e.loadNodeSummariesForMutation(r, { ctx: o })).filter((c) => String(c?.name || "").toLowerCase().trim() !== s);
        return (await e.commitNodesSummaryIndexMutation(i, {
          kv: r,
          ctx: o
        })).summaries;
      }, r);
    },
    async getNodesIndex(a) {
      if (!a) return [];
      const t = Se(a);
      if (t.NodesIndexCache?.exp > k() && Array.isArray(t.NodesIndexCache.data)) return [...t.NodesIndexCache.data];
      if (t.NodesListCache?.exp > k() && Array.isArray(t.NodesListCache.data)) {
        const s = e.normalizeNodeIndex(t.NodesListCache.data.map((i) => i?.name));
        return t.NodesIndexCache = {
          data: s,
          exp: k() + 6e4
        }, [...s];
      }
      const r = t.NodesRevisionCacheGeneration, o = e.normalizeNodeIndex(await a.get(e.NODES_INDEX_KEY, { type: "json" }) || []);
      if (t.NodesRevisionCacheGeneration !== r) return [...o];
      if (!o.length) {
        const s = await e.rebuildNodeIndexesFromKv(a);
        return [...e.normalizeNodeIndex(s.index)];
      }
      return t.NodesRevisionCacheGeneration === r && (t.NodesIndexCache = {
        data: o,
        exp: k() + 6e4
      }), [...o];
    },
    buildPlaybackRouteHotSignature(a, t = {}) {
      const r = String(a || "").toLowerCase().trim(), o = ce(se(e.getOrderedNodeLines(t).map((s) => String(s?.target || "").trim()).filter(Boolean)));
      return {
        cacheKey: `${r}:${String(t?.activeLineId || "").trim()}:${o}`,
        orderedTargetSignature: o
      };
    },
    buildPlaybackRouteHotSnapshot(a, t = {}, r = {}) {
      const o = String(a || "").toLowerCase().trim();
      if (!o || !F(t)) return null;
      const s = e.getOrderedNodeLines(t), i = (s.length ? s.map((m) => m?.target) : String(t.target || "").split(",").map((m) => m.trim()).filter(Boolean)).map((m) => un(m)).filter(Je);
      if (!i.length) return null;
      const c = Array.isArray(t.lines) ? t.lines.map((m) => F(m) ? { ...m } : m) : [], l = F(t.headers) ? { ...t.headers } : {}, u = {
        ...t,
        lines: c,
        headers: l
      }, { cacheKey: d, orderedTargetSignature: f } = e.buildPlaybackRouteHotSignature(o, u);
      return {
        nodeName: o,
        cacheKey: d,
        expiresAt: k() + nu,
        nodesRevision: String(r.nodesRevision || "").trim(),
        nodeCacheRevision: Yn(o, u),
        orderedTargetSignature: f,
        secret: String(u.secret || "").trim(),
        headers: l,
        lines: c,
        activeLineId: String(u.activeLineId || "").trim(),
        mainVideoStreamMode: Fr(u),
        playbackInfoMode: Dr(u.playbackInfoMode),
        mediaAuthMode: er(u.mediaAuthMode),
        realClientIpMode: wr(u.realClientIpMode),
        routingDecisionMode: Mr(u.routingDecisionMode),
        targetRecords: i,
        nodeData: u
      };
    },
    getPlaybackRouteHotSnapshot(a, t = null) {
      const r = String(a || "").toLowerCase().trim();
      if (!r) return null;
      const o = Se(t ? e.getKV(t) : null).PlaybackRouteHotCache, s = o.get(r);
      return s ? Number(s.expiresAt) <= k() ? (o.delete(r), null) : (qa(o, r), s) : null;
    },
    async getVerifiedPlaybackRouteHotSnapshot(a, t) {
      const r = e.getKV(t), o = Se(r), s = Le(a, o), i = e.getPlaybackRouteHotSnapshot(a, t);
      if (!i) return null;
      if (!r) return i;
      const c = await e.getNodesRevision(r);
      return Le(a, o) !== s ? null : !i.nodesRevision || !c || i.nodesRevision === c ? i : (e.invalidatePlaybackRouteHotCache(a, t), null);
    },
    setPlaybackRouteHotSnapshot(a, t = {}, r = {}, o = null) {
      const s = e.buildPlaybackRouteHotSnapshot(a, t, r);
      return s ? (Ie(Se(o ? e.getKV(o) : null).PlaybackRouteHotCache, s.nodeName, s, ar), s) : null;
    },
    async primePlaybackRouteHotSnapshot(a, t = {}, r) {
      const o = e.getKV(r), s = Se(o), i = Le(a, s), c = o ? await e.getNodesRevision(o) : "";
      return Le(a, s) !== i ? null : e.setPlaybackRouteHotSnapshot(a, t, { nodesRevision: c }, r);
    },
    invalidatePlaybackRouteHotCache(a = [], t = null) {
      const r = Se(t ? e.getKV(t) : null).PlaybackRouteHotCache;
      for (const o of Array.isArray(a) ? a : [a]) {
        const s = String(o || "").toLowerCase().trim();
        s && r.delete(s);
      }
    },
    invalidateNodeCaches(a = [], t = {}) {
      const r = t.kv || (t.env ? e.getKV(t.env) : null), o = Se(r), s = [];
      for (const i of Array.isArray(a) ? a : [a]) {
        const c = String(i || "").toLowerCase().trim();
        c && (s.push(c), o.NodeCache.delete(c), o.PlaybackRouteHotCache.delete(c));
      }
      s.length > 0 && (dm(s, o), Ic(s), Pc(s)), t.invalidateList && (o.NodesListCache = null, o.NodesIndexCache = null, or(r));
    },
    async persistNodesIndex(a, t = {}) {
      const { kv: r, ctx: o, invalidateList: s = !1 } = t, i = Se(r), c = e.normalizeNodeIndex(a);
      return s && (i.NodesListCache = null), r ? await Ar(async () => {
        const l = await e.readRevisionMeta(r, e.NODES_INDEX_META_KEY, {
          count: 0,
          indexHash: "",
          fullIndexHash: ""
        }), u = ce(se(c)), d = l.indexHash === u && l.revision ? l.updatedAt : (/* @__PURE__ */ new Date()).toISOString(), f = {
          ...l,
          updatedAt: d,
          revision: l.indexHash === u && l.revision ? l.revision : Ut(ce(`${u}:${l.fullIndexHash || ""}:${c.length}`), d),
          hash: l.hash || "",
          count: c.length,
          indexHash: u,
          fullIndexHash: String(l.fullIndexHash || "")
        }, m = [];
        (l.indexHash !== u || !l.revision) && m.push(r.put(e.NODES_INDEX_KEY, JSON.stringify(c)));
        const p = l.indexHash !== u || Number(l.count) !== c.length || !l.revision;
        if (m.length > 0) {
          const g = Promise.all(m);
          o && o.waitUntil(g), await g;
        }
        if (p) {
          const g = r.put(e.NODES_INDEX_META_KEY, JSON.stringify(f));
          o && o.waitUntil(g), await g;
        }
        return i.NodesIndexCache = {
          data: c,
          exp: k() + 6e4
        }, fs(f.revision, r), c;
      }, r) : (i.NodesIndexCache = {
        data: c,
        exp: k() + 6e4
      }, or(r), c);
    }
  };
}
function ug(n = {}, e = {}) {
  const {} = n;
  return {
    getDnsRecordHistoryKey(a, t) {
      const r = encodeURIComponent(String(a || "").trim() || "default"), o = encodeURIComponent(String(t || "").trim() || "unknown");
      return `${e.DNS_RECORD_HISTORY_PREFIX}${r}:${o}`;
    },
    getDnsHostHistoryRecordId(a) {
      return `host:${ee(a) || "unknown"}`;
    },
    normalizeDnsHistoryValueKey(a, t) {
      return `${String(a || "").trim().toUpperCase()}::${String(t || "").trim().toLowerCase()}`;
    },
    normalizeDnsRecordHistoryEntry(a = {}) {
      const t = a && typeof a == "object" ? a : {}, r = String(t.type || "").trim().toUpperCase(), o = String(t.content || "").trim(), s = String(t.savedAt || t.updatedAt || t.createdAt || "").trim(), i = s ? new Date(s) : null, c = i && !Number.isNaN(i.getTime()) ? i.toISOString() : "", l = String(t.name || "").trim(), u = String(t.actor || "admin").trim() || "admin", d = String(t.source || "ui").trim() || "ui", f = ee(t.requestHost), m = [
        r,
        o.toLowerCase(),
        l.toLowerCase(),
        f,
        c || s,
        d.toLowerCase()
      ].join("|");
      return {
        id: String(t.id || `dns-hist-${ce(m || "empty")}`),
        name: l,
        type: r,
        content: o,
        savedAt: c,
        actor: u,
        source: d,
        requestHost: f,
        preferredFallback: t.preferredFallback === !0
      };
    },
    normalizeDnsRecordHistory(a = []) {
      const t = [], r = /* @__PURE__ */ new Map();
      for (const s of Array.isArray(a) ? a : []) {
        const i = e.normalizeDnsRecordHistoryEntry(s);
        if (i.type !== "CNAME" || !i.content) continue;
        const c = e.normalizeDnsHistoryValueKey(i.type, i.content), l = r.get(c);
        if (Number.isInteger(l) && l >= 0) {
          i.preferredFallback === !0 && t[l] && (t[l].preferredFallback = !0);
          continue;
        }
        if (r.set(c, t.length), t.push(i), t.length >= O.Defaults.DnsHistoryLimit) break;
      }
      let o = !1;
      for (const s of t)
        if (s.preferredFallback === !0) {
          if (o) {
            s.preferredFallback = !1;
            continue;
          }
          o = !0;
        }
      return t;
    },
    async getDnsRecordHistory(a, t, r) {
      if (!a || !t || !r) return [];
      try {
        const o = await a.get(e.getDnsRecordHistoryKey(t, r), { type: "json" });
        return e.normalizeDnsRecordHistory(o);
      } catch {
        return [];
      }
    },
    async getDnsRecordHistoryForMutation(a, t, r) {
      if (!a || !t || !r) return [];
      const o = await a.get(e.getDnsRecordHistoryKey(t, r), { type: "json" });
      return e.normalizeDnsRecordHistory(o);
    },
    async persistDnsRecordHistory(a, t, r, o) {
      if (!a || !t || !r) return [];
      const s = e.normalizeDnsRecordHistory(o);
      return await a.put(e.getDnsRecordHistoryKey(t, r), JSON.stringify(s)), s;
    },
    async recordDnsRecordHistory(a, t, r, o = {}) {
      if (!a || !t || !r) return [];
      const s = await e.getDnsRecordHistoryForMutation(a, t, r), i = e.normalizeDnsRecordHistoryEntry(o);
      if (i.type !== "CNAME" || !i.content) return s;
      s.find((u) => e.normalizeDnsHistoryValueKey(u?.type, u?.content) === e.normalizeDnsHistoryValueKey(i.type, i.content))?.preferredFallback === !0 && (i.preferredFallback = !0);
      const c = e.normalizeDnsHistoryValueKey(i.type, i.content), l = s[0] ? e.normalizeDnsHistoryValueKey(s[0].type, s[0].content) : "";
      return l && l === c ? s : e.persistDnsRecordHistory(a, t, r, [i, ...s]);
    },
    async getDnsHostHistory(a, t, r) {
      return e.getDnsRecordHistory(a, t, e.getDnsHostHistoryRecordId(r));
    },
    async persistDnsHostHistory(a, t, r, o) {
      return e.persistDnsRecordHistory(a, t, e.getDnsHostHistoryRecordId(r), o);
    },
    async recordDnsHostHistory(a, t, r, o = {}) {
      return e.recordDnsRecordHistory(a, t, e.getDnsHostHistoryRecordId(r), o);
    },
    async setDnsHostHistoryPreferredFallback(a, t, r, o = "", s = !0) {
      if (!a || !t || !r) return [];
      const i = await e.getDnsHostHistory(a, t, r), c = String(o || "").trim();
      let l = !1;
      const u = i.map((d) => {
        const f = c && String(d?.id || "").trim() === c;
        return f && (l = !0), {
          ...d,
          preferredFallback: s === !0 ? f : !1
        };
      });
      if (s === !0 && c && !l) throw new Error("dns_history_entry_not_found");
      return e.persistDnsHostHistory(a, t, r, u);
    },
    getCurrentDateKey(a = /* @__PURE__ */ new Date(), t = O.Defaults.ScheduleUtcOffsetMinutes) {
      return Wt(a, t).dateKey;
    }
  };
}
function dg(n = {}, e = {}) {
  const {} = n;
  return {
    buildLegacyConfigCacheKeys(...a) {
      const t = /* @__PURE__ */ new Set([dc]);
      for (const r of a) {
        const o = e.getCurrentDateKey(/* @__PURE__ */ new Date(), r?.scheduleUtcOffsetMinutes);
        t.add(gs(r?.cfZoneId)), t.add(gs(r?.cfZoneId, o));
      }
      return [...t].filter(Boolean);
    },
    async listKvKeys(a, t = {}) {
      if (!a || typeof a.list != "function") return [];
      const r = String(t.prefix || ""), o = [];
      let s = "", i = 0, c = !1;
      const l = /* @__PURE__ */ new Set();
      for (; i < 1e3; ) {
        i += 1;
        const u = s ? await a.list({
          prefix: r,
          cursor: s
        }) : await a.list({ prefix: r });
        for (const f of u?.keys || []) {
          const m = String(f?.name || "").trim();
          m && o.push(m);
        }
        const d = typeof u?.cursor == "string" ? u.cursor : "";
        if (u?.list_complete === !0) {
          c = !0;
          break;
        }
        if (!d || d === s || l.has(d)) {
          const f = /* @__PURE__ */ new Error("KV key scan did not complete");
          throw f.code = "KV_SCAN_INCOMPLETE", f.status = 409, f.details = {
            prefix: r,
            pageCount: i,
            cursor: d,
            reason: d ? "repeated_cursor" : "missing_cursor"
          }, f;
        }
        l.add(d), s = d;
      }
      if (!c) {
        const u = /* @__PURE__ */ new Error("KV key scan exceeded the page safety limit");
        throw u.code = "KV_SCAN_INCOMPLETE", u.status = 409, u.details = {
          prefix: r,
          pageCount: i,
          cursor: s,
          reason: "page_limit"
        }, u;
      }
      return [...new Set(o)];
    },
    async listKvKeysStrict(a, t = {}) {
      if (!a || typeof a.list != "function") return [];
      const r = String(t.prefix || ""), o = [];
      let s = "", i = 0, c = !1;
      const l = /* @__PURE__ */ new Set();
      for (; i < 1e3; ) {
        i += 1;
        const u = await Td(a, s ? {
          prefix: r,
          cursor: s
        } : { prefix: r });
        for (const f of u?.keys || []) {
          const m = String(f?.name || "").trim();
          m && o.push(m);
        }
        const d = typeof u?.cursor == "string" ? u.cursor : "";
        if (u?.list_complete === !0) {
          c = !0;
          break;
        }
        if (!d || d === s || l.has(d)) {
          const f = /* @__PURE__ */ new Error("KV key scan did not complete");
          throw f.code = "KV_SCAN_INCOMPLETE", f.status = 409, f.details = {
            prefix: r,
            pageCount: i,
            cursor: d,
            reason: d ? "repeated_cursor" : "missing_cursor"
          }, f;
        }
        l.add(d), s = d;
      }
      if (!c) {
        const u = /* @__PURE__ */ new Error("KV key scan exceeded the page safety limit");
        throw u.code = "KV_SCAN_INCOMPLETE", u.status = 409, u.details = {
          prefix: r,
          pageCount: i,
          cursor: s,
          reason: "page_limit"
        }, u;
      }
      return [...new Set(o)];
    },
    async readRepairableRuntimeConfig(a) {
      if (!a) return {
        config: {},
        rawConfig: {},
        hadMalformedValue: !1,
        source: "missing",
        rawText: null
      };
      let t = null;
      try {
        t = await a.get(e.CONFIG_KEY);
      } catch (r) {
        const o = /* @__PURE__ */ new Error("KV tidy could not read the runtime config");
        throw o.code = "KV_TIDY_CONFIG_READ_FAILED", o.status = 503, o.details = {
          key: e.CONFIG_KEY,
          cause: ie(r, "kv_read_failed")
        }, o;
      }
      if (t == null || t === "") return {
        config: {},
        rawConfig: {},
        hadMalformedValue: !1,
        source: "missing",
        rawText: null
      };
      try {
        const r = JSON.parse(String(t));
        return {
          config: te(F(r) ? r : {}),
          rawConfig: F(r) ? r : {},
          hadMalformedValue: !F(r),
          source: "text_json",
          rawText: String(t)
        };
      } catch {
        return {
          config: {},
          rawConfig: {},
          hadMalformedValue: !0,
          source: "text_invalid_json",
          rawText: String(t)
        };
      }
    },
    async readRawKvEntry(a, t) {
      if (!a) return {
        exists: !1,
        value: null
      };
      const r = await a.get(t);
      return r == null ? {
        exists: !1,
        value: null
      } : {
        exists: !0,
        value: String(r)
      };
    },
    async captureRawKvEntries(a, t = []) {
      const r = [], o = /* @__PURE__ */ new Set();
      for (const s of Array.isArray(t) ? t : []) {
        const i = String(s || "").trim();
        !i || o.has(i) || (o.add(i), r.push({
          key: i,
          ...await e.readRawKvEntry(a, i)
        }));
      }
      return r;
    },
    async applyKvMutationsWithRollback(a, t = []) {
      if (!a) return [];
      const r = [], o = /* @__PURE__ */ new Map(), s = /* @__PURE__ */ new Set();
      for (const l of Array.isArray(t) ? t : []) {
        const u = String(l?.key || "").trim();
        if (!u) continue;
        const d = String(l?.type || "put").trim().toLowerCase() === "delete" ? "delete" : "put";
        r.push({
          type: d,
          key: u,
          value: String(l?.value ?? "")
        }), !s.has(u) && (s.add(u), o.set(u, {
          key: u,
          ...await e.readRawKvEntry(a, u)
        }));
      }
      const i = [], c = /* @__PURE__ */ new Map();
      try {
        for (const l of r)
          l.type === "delete" ? await a.delete(l.key) : await a.put(l.key, l.value), c.has(l.key) || i.push(l.key), c.set(l.key, l.type === "delete" ? {
            exists: !1,
            value: null
          } : {
            exists: !0,
            value: l.value
          });
        return r;
      } catch (l) {
        const u = [], d = [];
        for (let f = i.length - 1; f >= 0; f -= 1) {
          const m = i[f], p = o.get(m), g = c.get(m);
          if (!(!p || !g))
            try {
              const h = await e.readRawKvEntry(a, m);
              if (!(h.exists === g.exists && (g.exists !== !0 || h.value === g.value))) {
                d.push(m);
                continue;
              }
              p.exists ? await a.put(p.key, p.value) : await a.delete(p.key);
            } catch (h) {
              u.push(`${p.key}:${h?.message || String(h)}`);
            }
        }
        if (u.length > 0 || d.length > 0) {
          const f = /* @__PURE__ */ new Error(`${l?.message || String(l)}; rollback_incomplete`);
          throw f.code = "KV_MUTATION_ROLLBACK_CONFLICT", f.status = 409, f.details = {
            rollbackConflicts: d,
            rollbackFailures: u,
            originalError: ie(l, "kv_mutation_failed")
          }, f;
        }
        throw l;
      }
    }
  };
}
function fg(n = {}, e = {}) {
  const {} = n;
  return {
    createEmptyTidyPreview(a = "kv") {
      return {
        scope: String(a || "kv").trim() || "kv",
        fieldGroups: [],
        deleteGroups: [],
        rewriteGroups: [],
        preserveGroups: [],
        warnings: []
      };
    },
    async readStoredNodesSummaryState(a) {
      const t = String(await a.get(e.NODES_SUMMARY_INDEX_KEY) || "");
      let r = null;
      try {
        r = t ? JSON.parse(t) : null;
      } catch {
        r = null;
      }
      return {
        rawStoredSummaryIndexText: t,
        storedSummaryIndexState: Array.isArray(r) ? e.normalizeNodeSummaryIndex(r) : null,
        previousFullIndexBytes: t ? new TextEncoder().encode(t).length : 0
      };
    },
    async classifyKvTidyKeys(a, t = []) {
      const r = [], o = /* @__PURE__ */ new Set(), s = new Set(Object.values(e.LEGACY_OPS_STATUS_SECTION_KEYS));
      let i = 0, c = 0, l = 0, u = 0, d = 0, f = 0, m = 0, p = 0, g = 0, h = 0;
      for (const y of t)
        if (y) {
          if (y.startsWith(e.PREFIX)) {
            r.push(y.slice(e.PREFIX.length));
            continue;
          }
          if (y.startsWith("fail:")) {
            o.add(y), g += 1;
            continue;
          }
          if (y === "sys:cf_dash_cache" || y.startsWith("sys:cf_dash_cache:")) {
            o.add(y);
            continue;
          }
          if (y === e.LEGACY_SCHEDULED_LOCK_KEY) {
            o.add(y);
            continue;
          }
          if (y.startsWith("sys:dns_ip_pool_fetch_lock:v1:")) {
            o.add(y), h += 1;
            continue;
          }
          if (y === e.CONFIG_META_KEY) {
            d += 1;
            continue;
          }
          if (y === e.CONFIG_SNAPSHOTS_META_KEY) {
            f += 1;
            continue;
          }
          if (y === e.NODES_INDEX_META_KEY) {
            m += 1;
            continue;
          }
          if (y === e.LEGACY_DNS_IP_POOL_SOURCES_KEY) {
            i += 1;
            continue;
          }
          if (y === e.LEGACY_TELEGRAM_ALERT_STATE_KEY) {
            i += 1;
            continue;
          }
          if (s.has(y) || y === e.LEGACY_OPS_STATUS_KEY) {
            i += 1;
            continue;
          }
          if (y.startsWith(e.DNS_RECORD_HISTORY_PREFIX)) {
            l += 1;
            continue;
          }
          y.startsWith(e.ADMIN_INDEX_UPLOAD_PREFIX) || y === e.CONFIG_KEY || y === e.NODES_INDEX_KEY || y === e.NODES_SUMMARY_INDEX_KEY || y === e.CONFIG_SNAPSHOTS_KEY || (i += 1);
        }
      return {
        nodeNames: r,
        removableKeys: o,
        untouchedOtherKeyCount: i,
        opsStatusKeyCount: c,
        dnsRecordHistoryKeyCount: l,
        dnsIpPoolSourceKeyCount: u,
        configMetaKeyCount: d,
        snapshotMetaKeyCount: f,
        nodeIndexMetaKeyCount: m,
        telegramAlertStateKeyCount: p,
        loginFailureKeyCount: g,
        dnsFetchLockKeyCount: h
      };
    },
    async collectKvTidyNodeMutations(a, t = [], r = {}, o = []) {
      const s = [], i = [];
      let c = 0, l = 0, u = 0, d = 0, f = 0, m = 0, p = ut(r.sourceDirectNodes || []);
      const g = [];
      for (const y of t) {
        const S = `${e.PREFIX}${y}`;
        let _ = null;
        try {
          _ = await we(a, S, { type: "json" });
        } catch (E) {
          const D = /* @__PURE__ */ new Error(`KV tidy could not read node ${y}`);
          throw D.code = "KV_TIDY_NODE_READ_FAILED", D.status = 503, D.details = {
            key: S,
            nodeName: y,
            cause: ie(E, "kv_read_failed")
          }, D;
        }
        if (!F(_)) {
          const E = /* @__PURE__ */ new Error(`KV tidy found an invalid node entity: ${y}`);
          throw E.code = "KV_TIDY_NODE_INVALID", E.status = 409, E.details = {
            key: S,
            nodeName: y
          }, E;
        }
        const A = ku(_);
        A.shouldAddToSourceDirectNodes && (p = ut([...p, y])), A.topLevelPortPresent && (u += 1), d += Number(A.linePortCount) || 0, A.defaultPortNodePresent && (f += 1), m += Number(A.defaultPortLineCount) || 0, l += A.legacyKeysPresent.length;
        const { data: b, changed: R } = e.normalizeNode(y, _, { dropLegacyDirectRouting: !0 });
        i.push({
          name: y,
          ...b
        }), R && (g.push({
          key: S,
          ...await e.readRawKvEntry(a, S)
        }), c += 1, s.push({
          name: y,
          data: b
        }));
      }
      let h = r;
      return se(h.sourceDirectNodes || []) !== se(p) && (h = te({
        ...h,
        sourceDirectNodes: p
      })), {
        nextTidyConfig: h,
        rewrittenNodes: s,
        fullEntityNodes: i,
        rewrittenNodeCount: c,
        deletedLegacyNodeFieldCount: l,
        migratedTopLevelPortNodeCount: u,
        migratedLinePortCount: d,
        migratedDefaultPortNodeCount: f,
        migratedDefaultPortLineCount: m,
        rollbackKvEntries: [...o, ...g]
      };
    },
    rewriteKvTidySnapshots(a = []) {
      const t = [];
      let r = 0, o = 0;
      const s = [];
      for (const i of a) {
        const c = Rd(i);
        t.push(ua(c.snapshot)), c.rewritten && (r += 1), o += Number(c.deletedLegacyFieldCount) || 0, s.push(...c.migratedConfigKeys || []);
      }
      return {
        rewrittenSnapshots: t,
        rewrittenSnapshotCount: r,
        deletedLegacySnapshotFieldCount: o,
        migratedConfigKeys: s
      };
    },
    buildKvTidyNoteParts(a = {}, t = {}) {
      const r = [];
      return Array.isArray(a.legacyKeysPresent) && a.legacyKeysPresent.length && r.push(`legacy_keys=${a.legacyKeysPresent.join(",")}`), Number(a.rewrittenSnapshotCount) > 0 && r.push(`rewritten_snapshots=${a.rewrittenSnapshotCount}`), Number(a.rewrittenNodeCount) > 0 && r.push(`rewritten_nodes=${a.rewrittenNodeCount}`), Number(a.migratedTopLevelPortNodeCount) > 0 && r.push(`top_level_port_nodes=${a.migratedTopLevelPortNodeCount}`), Number(a.migratedLinePortCount) > 0 && r.push(`line_ports=${a.migratedLinePortCount}`), Number(a.migratedDefaultPortNodeCount) > 0 && r.push(`default_port_nodes=${a.migratedDefaultPortNodeCount}`), Number(a.migratedDefaultPortLineCount) > 0 && r.push(`default_port_lines=${a.migratedDefaultPortLineCount}`), t.includeRepairSource === !0 && t.repairedConfig?.hadMalformedValue && r.push(`${t.repairLabel || "config_source"}=${t.repairedConfig.source}`), r;
    },
    normalizeKvTidyMutationValueForHash(a = {}) {
      const t = String(a?.key || "").trim(), r = String(a?.value ?? "");
      if (t !== e.CONFIG_SNAPSHOTS_KEY || !r) return r;
      try {
        const o = JSON.parse(r);
        return Array.isArray(o) ? JSON.stringify(o.map((s) => {
          if (!F(s)) return s;
          const i = { ...s };
          return delete i.id, delete i.createdAt, i;
        })) : r;
      } catch {
        return r;
      }
    },
    buildKvTidyPlanHash(a = {}) {
      const t = (Array.isArray(a?.mutationPlan) ? a.mutationPlan : []).map((r) => ({
        type: String(r?.type || "put").trim().toLowerCase() === "delete" ? "delete" : "put",
        key: String(r?.key || "").trim(),
        value: e.normalizeKvTidyMutationValueForHash(r)
      }));
      return ce(se({
        scope: "kv",
        scannedKeys: [...new Set(Array.isArray(a?.scannedKeys) ? a.scannedKeys : [])].sort(),
        revisions: F(a?.revisions) ? a.revisions : {},
        mutationPlan: t,
        rebuiltNodeSummaries: Array.isArray(a?.rebuiltNodeSummaries) ? a.rebuiltNodeSummaries : []
      }));
    }
  };
}
function mg(n = {}, e = {}) {
  return {
    ...lg(n, e),
    ...ug(n, e),
    ...dg(n, e),
    ...fg(n, e)
  };
}
var pg = class {
  constructor({ configReader: n, httpService: e, nodeRouteReader: a, proxyApi: t }) {
    this.configReader = n, this.httpService = e, this.nodeRouteReader = a, this.proxyApi = t;
  }
  #e(n, e, a, t = 200) {
    return this.httpService.buildCorsResponse(_a(e, n), a, t, { mergeOriginVary: !0 });
  }
  #a(n, e) {
    const a = new URL(n.url);
    a.pathname = e + "/";
    const t = new Headers({
      Location: a.toString(),
      "Cache-Control": "no-store"
    });
    Ce(t);
    const r = n.method === "GET" || n.method === "HEAD" ? 301 : 307;
    return new Response(null, {
      status: r,
      headers: t
    });
  }
  #f(n, e) {
    const a = ee(e);
    if (!a) return null;
    const t = new URL(n.url);
    t.hostname = a;
    const r = new Headers({
      Location: t.toString(),
      "Cache-Control": "no-store"
    });
    return Ce(r), new Response(null, {
      status: 301,
      headers: r
    });
  }
  #o(n, e = "") {
    const a = String(e || "").trim();
    if (!n || !a || n.status === 101) return n;
    const t = new Headers(n.headers || {});
    return t.append("Set-Cookie", a), new Response(n.body, {
      status: n.status,
      statusText: n.statusText,
      headers: t
    });
  }
  #n(n, e) {
    const a = this.#e(n, e, "Not Found", 404);
    return this.#o(a, bc());
  }
  async #s(n, e, a, t) {
    if (!n || n.status === 101) return n;
    const r = await Um(a, e, t);
    return r ? this.#o(n, km(r)) : n;
  }
  #t(n) {
    const e = n.segments;
    return e.length <= 1 ? !1 : this.httpService.isPlaybackCriticalSegments(e, 1) ? !0 : e.length <= 2 ? !1 : this.httpService.isPlaybackCriticalSegments(e, 2);
  }
  async #u(n, e, a, t) {
    if (!n.root) return null;
    const r = this.#t(n);
    let o = r ? await this.nodeRouteReader.getVerifiedPlaybackRouteHotSnapshot(n.root, e) : null;
    const s = r ? o ? "hit" : "miss" : "skip", i = o?.nodeData || await this.nodeRouteReader.getNode(n.root, e, a);
    if (!i || Qe(i?.entryMode)) return null;
    const c = i.secret, l = pt(n.root, c), u = 1 + n.rootRaw.length, d = n.normalizedPathname.substring(u), f = bs(d, n.requestUrl, l), m = f?.normalizedPath || d, p = `/${n.rootRaw}${m === "/" ? "/" : m}`, g = f ? p.split("/").filter(Boolean) : n.segments;
    let h = u;
    if (c) {
      const b = g[1] || "";
      if (wt(b) !== c) return null;
      h += 1 + b.length;
    }
    const y = p.substring(h), S = f ? (() => {
      const b = new URL(n.requestUrl.toString());
      return b.pathname = p, b;
    })() : n.requestUrl, _ = ta(y);
    let A = _.remaining;
    return y === "" && !S.pathname.endsWith("/") || _.needsTrailingSlashRedirect === !0 ? { response: this.#a(t, p) } : (A === "" && (A = "/"), r && !o && (o = await this.nodeRouteReader.primePlaybackRouteHotSnapshot(n.root, i, e)), {
      nodeData: i,
      secret: c,
      remaining: Q(A),
      linkVariant: _.linkVariant,
      requestUrl: S,
      pathNormalizationState: f,
      playbackRouteHotSnapshot: o,
      targetHotCacheState: s,
      entryMode: "kv_route"
    });
  }
  #i(n) {
    return n ? Ba(ta(n.normalizedPathname)?.remaining || "/") : !1;
  }
  async #r(n, e, a, t) {
    const r = n?.hostPrefixMatch;
    if (!r?.prefix) return null;
    const o = r.prefix, s = this.#i(n);
    let i = s ? await this.nodeRouteReader.getVerifiedPlaybackRouteHotSnapshot(o, e) : null;
    const c = s ? i ? "hit" : "miss" : "skip", l = i?.nodeData || await this.nodeRouteReader.getNode(o, e, a);
    if (!l || !Qe(l?.entryMode)) return null;
    const u = ta(n.normalizedPathname);
    let d = u.remaining;
    return u.needsTrailingSlashRedirect === !0 ? { response: this.#a(t, n.normalizedPathname) } : (d === "" && (d = "/"), s && !i && (i = await this.nodeRouteReader.primePlaybackRouteHotSnapshot(o, l, e)), {
      nodeData: l,
      secret: "",
      remaining: Q(d),
      linkVariant: u.linkVariant,
      requestUrl: n.requestUrl,
      playbackRouteHotSnapshot: i,
      targetHotCacheState: c,
      entryMode: "host_prefix"
    });
  }
  #d(n) {
    const e = n?.requestHost || "", a = n?.configuredHost || "", t = n?.configuredLegacyHost || "";
    return e ? a && e === a ? !0 : !!(t && t !== a && e === t) : !1;
  }
  async #l(n, e, a, t, r = {}) {
    if (!this.#d(n) || !n?.root) return null;
    const o = n.root, s = this.#t(n);
    let i = s ? await this.nodeRouteReader.getVerifiedPlaybackRouteHotSnapshot(o, e) : null;
    const c = s ? i ? "hit" : "miss" : "skip", l = i?.nodeData || await this.nodeRouteReader.getNode(o, e, a);
    if (!l || !Qe(l?.entryMode)) return null;
    const u = pt(o, "", { entryMode: "kv_route" }), d = 1 + n.rootRaw.length, f = n.normalizedPathname.substring(d), m = bs(f, n.requestUrl, u), p = m?.normalizedPath || f, g = `/${n.rootRaw}${p === "/" ? "/" : p}`, h = g.substring(d), y = m ? (() => {
      const A = new URL(n.requestUrl.toString());
      return A.pathname = g, A;
    })() : n.requestUrl, S = ta(h);
    let _ = S.remaining;
    return h === "" && !y.pathname.endsWith("/") || S.needsTrailingSlashRedirect === !0 ? { response: this.#a(t, g) } : (_ === "" && (_ = "/"), s && !i && (i = await this.nodeRouteReader.primePlaybackRouteHotSnapshot(o, l, e)), {
      nodeData: l,
      nodeName: o,
      secret: "",
      remaining: Q(_),
      linkVariant: S.linkVariant,
      requestUrl: y,
      pathNormalizationState: m,
      playbackRouteHotSnapshot: i,
      targetHotCacheState: c,
      entryMode: "kv_route",
      routeKindOverride: r.isLegacyHostRequest === !0 ? "legacy_host_prefix_path_compat" : "host_prefix_path_compat",
      attachLegacyProxyContext: r.isLegacyHostRequest === !0
    });
  }
  async #c(n, e, a, t) {
    if (!Rs(n?.normalizedPathname)) return null;
    const r = t.headers.get("Cookie") || "", o = String(Ya(r).get("legacy_proxy_ctx") || "").trim();
    if (!o) return null;
    const s = await Hm(o, e, { requestHost: n.requestHost });
    if (s?.ok !== !0) return { response: this.#n(t, e) };
    const i = String(s.payload?.node || "").trim().toLowerCase();
    if (!i) return { response: this.#n(t, e) };
    const c = Ba(n.normalizedPathname);
    let l = c ? await this.nodeRouteReader.getVerifiedPlaybackRouteHotSnapshot(i, e) : null;
    const u = c ? l ? "hit" : "miss" : "skip", d = l?.nodeData || await this.nodeRouteReader.getNode(i, e, a);
    if (!d) return { response: this.#n(t, e) };
    const f = Qe(d?.entryMode);
    return c && !l && (l = await this.nodeRouteReader.primePlaybackRouteHotSnapshot(i, d, e)), {
      nodeData: d,
      nodeName: i,
      secret: f ? "" : d.secret,
      remaining: n.normalizedPathname,
      linkVariant: "main",
      requestUrl: n.requestUrl,
      playbackRouteHotSnapshot: l,
      targetHotCacheState: u,
      entryMode: "kv_route",
      routeKindOverride: f ? "legacy_host_context_cookie_host_prefix_compat" : "legacy_host_context_cookie"
    };
  }
  async handle(n, e, a, t) {
    if (!t) throw new TypeError("NodeProxyFacade.handle requires routeContext");
    const { requestHost: r, configuredHost: o, configuredLegacyHost: s } = t, i = await this.configReader.getRuntimeConfig(e), c = !!(s && s !== o && r === s), l = i.enableHostPrefixProxy === !0 && !!o && !c;
    t.hostPrefixMatch = l ? mo(r, o) : null;
    const u = !!(l && r !== o && r.endsWith(`.${o}`));
    if (t.hostPrefixMatch) {
      const m = await this.#r(t, e, a, n);
      return m?.response ? m.response : m?.nodeData ? this.proxyApi.handle(n, m.nodeData, m.remaining, t.hostPrefixMatch.prefix, m.secret, e, a, {
        requestUrl: m.requestUrl || t.requestUrl,
        linkVariant: m.linkVariant,
        targetHotCacheState: m.targetHotCacheState,
        cachedTargetRecords: Array.isArray(m.playbackRouteHotSnapshot?.targetRecords) ? m.playbackRouteHotSnapshot.targetRecords : null,
        nodeCacheRevision: m.playbackRouteHotSnapshot?.nodeCacheRevision || "",
        runtimeConfig: i,
        runtimeRouteContext: t,
        entryMode: m.entryMode
      }) : this.#e(n, e, "Not Found", 404);
    }
    if (u) return this.#e(n, e, "Not Found", 404);
    const d = await this.#l(t, e, a, n, { isLegacyHostRequest: c });
    if (d?.response) return d.response;
    if (d?.nodeData) {
      const m = await this.proxyApi.handle(n, d.nodeData, d.remaining, d.nodeName, d.secret, e, a, {
        requestUrl: d.requestUrl || t.requestUrl,
        linkVariant: d.linkVariant,
        pathNormalizationState: d.pathNormalizationState,
        targetHotCacheState: d.targetHotCacheState,
        cachedTargetRecords: Array.isArray(d.playbackRouteHotSnapshot?.targetRecords) ? d.playbackRouteHotSnapshot.targetRecords : null,
        nodeCacheRevision: d.playbackRouteHotSnapshot?.nodeCacheRevision || "",
        runtimeConfig: i,
        runtimeRouteContext: t,
        entryMode: d.entryMode,
        routeKindOverride: d.routeKindOverride
      });
      return d.attachLegacyProxyContext === !0 ? await this.#s(m, r, d.nodeName, e) : m;
    }
    const f = await this.#u(t, e, a, n);
    if (f?.response) return f.response;
    if (f?.nodeData) {
      const m = await this.proxyApi.handle(n, f.nodeData, f.remaining, t.root, f.secret, e, a, {
        requestUrl: f.requestUrl || t.requestUrl,
        linkVariant: f.linkVariant,
        pathNormalizationState: f.pathNormalizationState,
        targetHotCacheState: f.targetHotCacheState,
        cachedTargetRecords: Array.isArray(f.playbackRouteHotSnapshot?.targetRecords) ? f.playbackRouteHotSnapshot.targetRecords : null,
        nodeCacheRevision: f.playbackRouteHotSnapshot?.nodeCacheRevision || "",
        runtimeConfig: i,
        runtimeRouteContext: t,
        entryMode: f.entryMode
      });
      return c ? await this.#s(m, r, t.root, e) : m;
    }
    if (c && Rs(t.normalizedPathname)) {
      const m = await this.#c(t, e, a, n);
      if (m?.response) return m.response;
      if (m?.nodeData) {
        const p = await this.proxyApi.handle(n, m.nodeData, m.remaining, m.nodeName, m.secret, e, a, {
          requestUrl: m.requestUrl || t.requestUrl,
          linkVariant: m.linkVariant,
          targetHotCacheState: m.targetHotCacheState,
          cachedTargetRecords: Array.isArray(m.playbackRouteHotSnapshot?.targetRecords) ? m.playbackRouteHotSnapshot.targetRecords : null,
          nodeCacheRevision: m.playbackRouteHotSnapshot?.nodeCacheRevision || "",
          runtimeConfig: i,
          runtimeRouteContext: t,
          entryMode: m.entryMode,
          routeKindOverride: m.routeKindOverride
        });
        return this.#s(p, r, m.nodeName, e);
      }
    }
    return this.#e(n, e, "Not Found", 404);
  }
};
function gg(n) {
  return Object.freeze({
    persistCloudflareDnsRecordsForHost(e) {
      return vf({
        ...e,
        dnsHistoryRepository: n
      });
    },
    buildDnsIpWorkspaceItems(e, a, t, r = {}) {
      return uc(e, a, t, {
        ...r,
        probeRepository: n
      });
    },
    buildDnsIpPoolWorkspacePreviewItems(e, a, t, r, o = {}) {
      return Qf(e, a, t, r, {
        ...o,
        probeRepository: n
      });
    },
    tryAcquireDnsIpPoolFetchRefreshLock(e, a) {
      return am({
        ...e,
        leaseRepository: n
      }, a);
    },
    releaseDnsIpPoolFetchRefreshLock(e, a) {
      return nm({
        ...e,
        leaseRepository: n
      }, a);
    },
    runDnsIpPoolSourcesLiveRefresh(e) {
      return om({
        ...e,
        poolRepository: n
      });
    }
  });
}
function hg(n, e) {
  const a = e.shellService, t = [
    um({
      kernel: n,
      bindingPort: n,
      CacheManager: e.cacheManager,
      LogQueryPlanner: e.logQueryPlanner,
      Logger: e.logger,
      requestModel: n,
      buildAdminLocalIndexUploadRecord: a.buildAdminLocalIndexUploadRecord,
      buildAdminShellState: a.buildAdminShellState,
      buildAdminUiContract: a.buildAdminUiContract,
      buildDnsIpPoolWorkspacePreviewItems: e.dns.buildDnsIpPoolWorkspacePreviewItems,
      buildDnsIpWorkspaceItems: e.dns.buildDnsIpWorkspaceItems,
      persistCloudflareDnsRecordsForHost: e.dns.persistCloudflareDnsRecordsForHost,
      releaseDnsIpPoolFetchRefreshLock: e.dns.releaseDnsIpPoolFetchRefreshLock,
      runDnsIpPoolSourcesLiveRefresh: e.dns.runDnsIpPoolSourcesLiveRefresh,
      tryAcquireDnsIpPoolFetchRefreshLock: e.dns.tryAcquireDnsIpPoolFetchRefreshLock,
      withAdminShellRuntimeStatus: a.withAdminShellRuntimeStatus
    }),
    ip({
      D1TidyExecutor: e.d1TidyExecutor,
      D1TidyPlanner: e.d1TidyPlanner,
      Logger: e.logger,
      buildAdminReleaseVendorManifest: a.buildAdminReleaseVendorManifest,
      normalizeAdminReleaseVendorManifestRecord: a.normalizeAdminReleaseVendorManifestRecord,
      validateAdminShellHtmlSource: a.validateAdminShellHtmlSource
    }, n),
    _p({
      CacheManager: e.cacheManager,
      persistCloudflareDnsRecordsForHost: e.dns.persistCloudflareDnsRecordsForHost
    }, n),
    Ap({
      bindingPort: n,
      schemaReadinessPort: n,
      statusPersistence: n
    }),
    Zp({
      CacheManager: e.cacheManager,
      withAdminShellRuntimeStatus: a.withAdminShellRuntimeStatus
    }, n),
    ng({}, n),
    mg({}, n)
  ];
  for (const r of t) for (const [o, s] of Object.entries(r)) n[o] = s;
  return n;
}
function yg({ includeTestingSupport: n = !1 } = {}) {
  const e = { ...ig }, a = Object.freeze({ getRuntimeConfig: Ae }), t = cg({ nodeRepository: e }), r = Ep({ logRepository: e }), o = Pd({
    indexRepository: e,
    statusPort: e
  });
  hg(e, {
    cacheManager: t,
    d1TidyExecutor: og(),
    d1TidyPlanner: sg(),
    dns: gg(e),
    logger: r,
    logQueryPlanner: bp(),
    shellService: o
  });
  const s = Gp({
    cachePort: t,
    configReader: a,
    fetchPort: { fetchRequest: Oe },
    logger: r,
    nodeRepository: e
  }), i = new Qu({
    actionHandlers: e.adminActionHandlers,
    bindingService: e,
    configReader: a,
    repository: e,
    requestModel: e,
    shellService: o
  }), c = new pg({
    configReader: a,
    httpService: Object.freeze({
      buildCorsResponse: o.buildEdgeCorsResponse,
      isPlaybackCriticalSegments: o.isPlaybackCriticalSegments
    }),
    nodeRouteReader: e,
    proxyApi: s
  }), l = new cp({
    logger: r,
    service: e
  }), u = (m, p) => {
    const g = new URL(m.url), h = ee(g.hostname), y = Q(g.pathname), S = y.toLowerCase(), _ = Ze(p), A = _.toLowerCase(), b = sn(_), R = b.toLowerCase(), E = fi(p, {
      adminPath: _,
      loginPath: b
    }), D = y.split("/").filter(Boolean), w = D[0] || "", C = wt(w).toLowerCase();
    return {
      initHealth: E,
      requestUrl: g,
      requestHost: h,
      configuredHost: Ke(p),
      configuredLegacyHost: kr(p),
      normalizedPathname: y,
      pathnameLower: S,
      adminPath: _,
      adminPathLower: A,
      adminLoginPath: b,
      adminLoginPathLower: R,
      segments: D,
      rootRaw: w,
      root: C
    };
  }, d = (m, p) => (p === "GET" || p === "HEAD") && m.pathnameLower === "/favicon.ico" || p === "GET" && m.normalizedPathname === "/" || ui(m.pathnameLower, m.adminPathLower) || Er(m.pathnameLower, m.adminLoginPathLower) ? !0 : m.adminPathLower === "/admin" && m.pathnameLower === "/api/auth/login" && m.root === "api" && m.segments[1] === "auth" && m.segments[2] === "login", f = {
    adminConsole: i,
    nodeProxy: c,
    scheduledMaintenance: l,
    workerHandler: Object.freeze({
      async fetch(m, p, g) {
        const h = u(m, p), y = m.method;
        if (!((y === "GET" || y === "HEAD") && h.pathnameLower === "/favicon.ico")) {
          const S = await a.getRuntimeConfig(p), _ = !!(h.configuredLegacyHost && h.configuredLegacyHost !== h.configuredHost && h.requestHost === h.configuredLegacyHost);
          if (S.enableHostPrefixProxy === !0 && h.configuredHost && !_ && h.requestHost !== h.configuredHost && h.requestHost.endsWith(`.${h.configuredHost}`)) return c.handle(m, p, g, h);
        }
        if (d(h, y)) {
          const S = await i.handle(m, p, g);
          if (S) return S;
        }
        return c.handle(m, p, g, h);
      },
      scheduled(m, p, g) {
        return l.handle(m, p, g);
      }
    })
  };
  return n === !0 && (f.testingSupport = Object.freeze({
    cacheManager: t,
    kernel: e,
    logger: r,
    shellService: o,
    buildNodeRouteContext: u,
    buildRouteCorsResponse(m, p, g, h = 200) {
      return o.buildEdgeCorsResponse(_a(p, m), g, h, { mergeOriginVary: !0 });
    },
    isPlaybackCriticalRouteContext(m) {
      const p = Array.isArray(m?.segments) ? m.segments : [];
      return p.length <= 1 ? !1 : o.isPlaybackCriticalSegments(p, 1) ? !0 : p.length > 2 && o.isPlaybackCriticalSegments(p, 2);
    },
    isolateState: al,
    proxyService: s.testingSupport
  })), Object.freeze(f);
}
var { workerHandler: Sg } = yg();
export {
  Sg as default
};
