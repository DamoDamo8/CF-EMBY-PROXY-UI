function po(o) {
  const e = String(o || "").trim();
  if (!/^\d+$/.test(e)) return null;
  const r = Number(e);
  return Number.isFinite(r) ? r : null;
}
function go(o) {
  if (o == null) return "";
  try {
    return o instanceof ArrayBuffer ? new TextDecoder().decode(new Uint8Array(o)) : ArrayBuffer.isView(o) ? new TextDecoder().decode(o) : String(o || "");
  } catch {
    return "";
  }
}
async function js(o, e) {
  const r = Math.max(0, Math.floor(Number(e) || 0)), t = po(o?.headers?.get?.("Content-Length"));
  if (Number.isFinite(t) && t > r) {
    try {
      Promise.resolve(o?.body?.cancel?.()).catch(() => {
      });
    } catch {
    }
    return {
      bodyBytes: /* @__PURE__ */ new Uint8Array(0),
      bytes: t,
      exceeded: !0
    };
  }
  if (!o?.body) return {
    bodyBytes: /* @__PURE__ */ new Uint8Array(0),
    bytes: 0,
    exceeded: !1
  };
  const a = o.body.getReader(), n = [];
  let s = 0;
  try {
    for (; ; ) {
      const { done: l, value: d } = await a.read();
      if (l) break;
      const u = d instanceof Uint8Array ? d : new Uint8Array(d || 0);
      if (s + u.byteLength > r) {
        try {
          Promise.resolve(a.cancel()).catch(() => {
          });
        } catch {
        }
        return {
          bodyBytes: /* @__PURE__ */ new Uint8Array(0),
          bytes: s + u.byteLength,
          exceeded: !0
        };
      }
      n.push(u), s += u.byteLength;
    }
  } catch {
    return {
      bodyBytes: /* @__PURE__ */ new Uint8Array(0),
      bytes: s,
      exceeded: !0
    };
  } finally {
    try {
      a.releaseLock();
    } catch {
    }
  }
  const i = new Uint8Array(s);
  let c = 0;
  for (const l of n)
    i.set(l, c), c += l.byteLength;
  return {
    bodyBytes: i,
    bytes: s,
    exceeded: !1
  };
}
async function xe(o, e) {
  const r = await js(o, e);
  return {
    text: r.exceeded ? "" : new TextDecoder().decode(r.bodyBytes),
    bytes: r.bytes,
    exceeded: r.exceeded
  };
}
function ln(o) {
  let e = /* @__PURE__ */ new WeakMap(), r = o(), t = r;
  return {
    get(a = null) {
      if (!a || typeof a != "object" && typeof a != "function") return r;
      let n = e.get(a);
      return n || (n = o(), e.set(a, n)), t = n, n;
    },
    current() {
      return t;
    },
    reset() {
      e = /* @__PURE__ */ new WeakMap(), r = o(), t = r;
    }
  };
}
function sl(o, e = 8192) {
  const r = Math.max(2, Math.floor(Number(e) || 8192)), t = Math.max(1, Math.min(32, Math.floor(r / 256))), a = Math.max(16, Math.min(512, Math.floor(r / Math.max(4, t * 2)))), n = 4, s = Math.max(8, Math.min(256, Math.floor(r / 32))), i = /* @__PURE__ */ new WeakSet();
  let c = 0, l = !1;
  const d = (f, m = 0) => {
    if (f == null) return f;
    if (typeof f == "string")
      return f.length <= a ? f : (l = !0, `${f.slice(0, a)}...`);
    if (typeof f == "number" || typeof f == "boolean") return f;
    if (typeof f == "bigint" || typeof f != "object") return String(f);
    if (i.has(f)) return "[Circular]";
    if (m >= n || c >= s)
      return l = !0, "[Truncated]";
    c += 1, i.add(f);
    try {
      if (Array.isArray(f)) {
        const h = [];
        for (let y = 0; y < f.length && y < t; y += 1) h.push(d(f[y], m + 1));
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
        const y = h.length > a ? `${h.slice(0, a)}...` : h;
        p[y] = d(f[h], m + 1), g += 1;
      }
      return p;
    } finally {
      i.delete(f);
    }
  };
  try {
    const f = JSON.stringify(d(o));
    if (!l && f && f.length <= r) return f;
  } catch {
  }
  const u = JSON.stringify({ truncated: !0 });
  return u.length <= r ? u : "{}";
}
function ce(o = "") {
  const e = String(o || "");
  let r = 2166136261;
  for (let t = 0; t < e.length; t += 1)
    r ^= e.charCodeAt(t), r = Math.imul(r, 16777619);
  return (r >>> 0).toString(36);
}
function Yo(o = []) {
  const e = Array.isArray(o) ? o : [o];
  let r = 2166136261;
  const t = (a) => {
    for (let n = 0; n < 32; n += 8)
      r ^= a >>> n & 255, r = Math.imul(r, 16777619);
  };
  t(e.length);
  for (const a of e) {
    const n = String(a ?? "");
    t(n.length);
    for (let s = 0; s < n.length; s += 1)
      r ^= n.charCodeAt(s), r = Math.imul(r, 16777619);
  }
  return (r >>> 0).toString(36);
}
function Nn(o = "") {
  const e = new TextEncoder().encode(String(o || ""));
  let r = 14695981039346656037n;
  const t = 1099511628211n;
  for (const a of e)
    r ^= BigInt(a), r = BigInt.asUintN(64, r * t);
  return r.toString(16).padStart(16, "0");
}
async function $n(o = "") {
  const e = await globalThis.crypto.subtle.digest("SHA-256", new TextEncoder().encode(String(o || "")));
  return [...new Uint8Array(e)].map((r) => r.toString(16).padStart(2, "0")).join("");
}
function yt(o) {
  const e = Array.isArray(o) ? o : String(o || "").split(/[\\r\\n,，;；|]+/), r = /* @__PURE__ */ new Set(), t = [];
  for (const a of e) {
    const n = String(a || "").trim();
    if (!n) continue;
    const s = n.toLowerCase();
    r.has(s) || (r.add(s), t.push(n));
  }
  return t;
}
function ho(o) {
  const e = String(o || "").trim().toLowerCase();
  if (!e) return null;
  const r = e.includes("*"), t = e.replace(/^\*\./, "").replace(/^\*+/, "").replace(/\*+$/g, "").replace(/^\.+|\.+$/g, "");
  return t ? {
    hostname: t,
    wildcard: r
  } : null;
}
function te(o) {
  return ho(o)?.hostname || "";
}
function wt(o = []) {
  const e = Array.isArray(o) ? o : [o], r = [], t = /* @__PURE__ */ new Set();
  for (const a of e) {
    const n = String(a || "").trim();
    !n || t.has(n) || (t.add(n), r.push(n));
  }
  return r;
}
function U(o) {
  return !!o && typeof o == "object" && !Array.isArray(o);
}
function de(o, e, r, t) {
  let a;
  if (typeof o == "number") a = o;
  else if (typeof o == "string") {
    const n = o.trim();
    if (!/^-?\d+$/.test(n)) return e;
    a = Number(n);
  } else return e;
  return Number.isFinite(a) ? Math.min(t, Math.max(r, Math.floor(a))) : e;
}
function il(o, e, r, t) {
  const a = Number(o);
  return Number.isFinite(a) ? Math.min(t, Math.max(r, a)) : e;
}
function pa(o, e) {
  return !!o && typeof o == "object" && Object.prototype.hasOwnProperty.call(o, e);
}
function Fa(o) {
  return String(o || "").replace(/[\\%_]/g, "\\$&");
}
function cl(o) {
  const e = String(o || "").trim();
  return e ? /^(?:\d{1,3}\.){3}\d{1,3}$/.test(e) ? !0 : /^[0-9a-f:]+$/i.test(e) && e.includes(":") : !1;
}
function Jo(o) {
  const e = String(o || "").trim();
  return e ? /^[a-z]{3,4}$/i.test(e) : !1;
}
function ll() {
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
function dl() {
  const o = ln(() => ({ namespaces: /* @__PURE__ */ new Map() }));
  let e = "default";
  const r = (t, a = "default") => {
    const n = String(a || "default").trim() || "default";
    let s = t.namespaces.get(n);
    return s || (s = {
      ConfigCache: null,
      RuntimeConfigCacheGeneration: 0,
      SingleFlightTasks: /* @__PURE__ */ new Map()
    }, t.namespaces.set(n, s)), e = n, s;
  };
  return {
    get(t = null, a = "default") {
      return r(o.get(t), a);
    },
    current() {
      return r(o.current(), e);
    },
    reset() {
      o.reset(), e = "default";
    }
  };
}
function ul() {
  const o = ln(() => ({
    KvDataMutationChain: Promise.resolve(),
    KvTidyMutationChain: Promise.resolve()
  }));
  return {
    get(e = null) {
      return o.get(e);
    },
    current() {
      return o.current();
    },
    reset() {
      o.reset();
    }
  };
}
function dr(o = globalThis) {
  try {
    return o?.caches?.default ?? null;
  } catch {
    return null;
  }
}
function zn(o = globalThis) {
  return o.crypto.subtle;
}
function Qo(o) {
  return String(o || "").trim();
}
function fl(o = [], e = {}) {
  const r = /* @__PURE__ */ Object.create(null), t = /* @__PURE__ */ new Map();
  for (const s of o) {
    const i = Qo(s?.name) || "anonymous", c = s?.handlers && typeof s.handlers == "object" ? s.handlers : s;
    for (const [l, d] of Object.entries(c || {})) {
      if (typeof d != "function") throw new TypeError(`Admin action ${l} from ${i} is not a function`);
      if (r[l]) throw new Error(`Duplicate admin action ${l}: ${t.get(l)} and ${i}`);
      r[l] = d, t.set(l, i);
    }
  }
  const a = Object.freeze({ ...e.aliases || {} });
  for (const [s, i] of Object.entries(a)) if (!r[i]) throw new Error(`Admin action alias ${s} targets missing action ${i}`);
  for (const s of e.requiredActions || []) if (!r[s]) throw new Error(`Missing required admin action ${s}`);
  const n = Object.freeze({ ...r });
  return Object.freeze({
    handlers: n,
    names: Object.freeze(Object.keys(n).sort()),
    resolve(s) {
      const i = Qo(s);
      return n[a[i] || i] || null;
    }
  });
}
function ml(o) {
  function e(t, a = null) {
    if (typeof t != "function") {
      const i = t;
      return (c) => e(c, i);
    }
    const n = o.get(a), s = n.KvDataMutationChain.catch(() => null).then(() => t());
    return n.KvDataMutationChain = s.catch(() => null), s;
  }
  function r(t, a = null) {
    if (typeof t != "function") {
      const i = t;
      return (c) => r(c, i);
    }
    const n = o.get(a), s = n.KvTidyMutationChain.catch(() => null).then(() => e(t, a));
    return n.KvTidyMutationChain = s.catch(() => null), s;
  }
  return Object.freeze({
    runDataMutation: e,
    runTidyMutation: r
  });
}
function pl() {
  return ln(() => ({
    LogQueue: [],
    LogDedupe: /* @__PURE__ */ new Map(),
    LogFlushPending: !1,
    LogFlushTask: null,
    LogClearEpochMs: 0,
    LogLastFlushAt: 0,
    runtimeConfig: null
  }));
}
function ur(o = "") {
  return String(o || "").trim().toLowerCase().split(";", 1)[0].trim();
}
function Ga(o = "") {
  const e = ur(o);
  return e === "application/json" || e === "text/json" || /^application\/[a-z0-9!#$&^_.+-]+\+json$/i.test(e);
}
function qs(o = "") {
  const e = ur(o);
  return e === "text/html" || e === "application/xhtml+xml";
}
function gl(o = "", e = "text/html") {
  const r = ur(e);
  if (!qs(r)) return !1;
  const [t, a] = r.split("/", 2);
  let n = -1, s = 0;
  for (const i of String(o || "").split(",")) {
    const [c, ...l] = i.split(";"), [d, u] = ur(c).split("/", 2);
    let f = -1;
    if (d === t && u === a ? f = 2 : d === t && u === "*" ? f = 1 : d === "*" && u === "*" && (f = 0), f < n || f < 0) continue;
    let m = 1;
    for (const p of l) {
      const [g, h] = p.split("=", 2);
      if (String(g || "").trim().toLowerCase() !== "q") continue;
      const y = String(h || "").trim();
      m = /^(?:0(?:\.\d{0,3})?|1(?:\.0{0,3})?)$/.test(y) ? Number(y) : 0;
      break;
    }
    f > n && (n = f, s = m);
  }
  return s > 0;
}
function Wn(o, e, r = {}) {
  const t = e?.response, a = Math.max(400, Number(r.status) || 502), n = String(r.statusText || (a === 502 ? "Bad Gateway" : "Error")).trim(), s = new Headers(t?.headers || {});
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
  ].forEach((d) => s.delete(d)), s.set("Content-Type", "application/json; charset=utf-8"), s.set("Cache-Control", "no-store"), s.delete("X-Proxy-Mime-Guard"), s.delete("X-Proxy-Contract-Guard");
  const i = String(r.guardHeader || "").trim(), c = String(r.guardValue || "").trim();
  i && c && s.set(i, c);
  const l = {
    error: String(r.error || n || "Error"),
    code: a,
    message: String(r.message || "The API response did not satisfy the proxy contract."),
    ...r.details && typeof r.details == "object" && !Array.isArray(r.details) ? { details: r.details } : {}
  };
  try {
    Promise.resolve(t?.body?.cancel?.()).catch(() => {
    });
  } catch {
  }
  return o && typeof o == "object" && (o.proxyGuardState = c), {
    ...e,
    response: new Response(o?.requestMethod === "HEAD" ? null : JSON.stringify(l), {
      status: a,
      statusText: n,
      headers: s
    })
  };
}
function hl(o, e, r = {}) {
  const t = e?.response;
  if (!t || o?.requestTraits?.isApiRequest !== !0 || t.status === 101 || t.status === 204 || t.status === 205 || t.status === 304) return e;
  const a = typeof r.sanitizePath == "function" ? r.sanitizePath : (s) => String(s || "/"), n = t.headers.get("Content-Type");
  return (o?.requestMethod === "GET" || o?.requestMethod === "HEAD") && a(o?.proxyPath || "/") === "/" && gl(o?.request?.headers?.get("Accept"), n) || !qs(n) ? e : (typeof r.buildErrorState == "function" ? r.buildErrorState : Wn)(o, e, {
    message: "Upstream API returned an HTML document instead of API data.",
    guardHeader: "X-Proxy-Mime-Guard",
    guardValue: "html-document",
    details: {
      upstreamStatus: t.status,
      contentType: ur(n) || "missing"
    }
  });
}
var yl = "playback-info", Xs = /* @__PURE__ */ new WeakSet();
function yo(o) {
  if (!o || typeof o != "object" || Array.isArray(o)) return !1;
  const e = Object.getPrototypeOf(o);
  return e === Object.prototype || e === null;
}
function Va(o = "") {
  let e;
  try {
    e = JSON.parse(String(o || ""));
  } catch {
    return null;
  }
  return yo(e) ? e : null;
}
function So({ response: o, bodyText: e, bodyBytes: r, payload: t }) {
  if (!o || !yo(t)) return null;
  const a = Object.freeze({
    contract: yl,
    response: o,
    bodyText: String(e || ""),
    bodyBytes: Math.max(0, Number(r) || 0),
    payload: t
  });
  return Xs.add(a), a;
}
function er(o) {
  return Xs.has(o) && o?.contract === "playback-info" && !!o.response && typeof o.bodyText == "string" && Number.isFinite(o.bodyBytes) && o.bodyBytes >= 0 && yo(o.payload);
}
function In(o, e) {
  return Object.freeze({
    kind: "invalid",
    reason: e,
    details: Object.freeze({
      reason: e,
      upstreamStatus: Number(o?.status) || 0,
      contentType: ur(o?.headers?.get?.("Content-Type")) || "missing"
    })
  });
}
async function Sl(o, e = {}) {
  const r = String(e.requestMethod || "GET").toUpperCase();
  if (!o || !(o.status >= 200 && o.status < 300) || r === "HEAD" || o.status === 204 || o.status === 205 || !o.body) return Object.freeze({ kind: "skip" });
  if (!Ga(o.headers.get("Content-Type"))) return In(o, "unsupported_content_type");
  const t = await xe(o.clone(), e.maxBytes);
  if (t.exceeded) return In(o, "body_too_large");
  const a = Va(t.text);
  return a ? Object.freeze({
    kind: "valid",
    representation: So({
      response: o,
      bodyText: t.text,
      bodyBytes: t.bytes,
      payload: a
    })
  }) : In(o, "invalid_root_object");
}
function _o(o) {
  const e = o instanceof Headers ? new Headers(o) : new Headers(o || {});
  return [
    "Content-Encoding",
    "Content-Length",
    "Content-MD5",
    "Digest",
    "ETag",
    "Transfer-Encoding"
  ].forEach((r) => e.delete(r)), e.set("Content-Type", "application/json; charset=utf-8"), e;
}
function ja(o) {
  if (typeof o != "string") return o;
  const e = o.trim();
  if (!e || !e.startsWith("{") && !e.startsWith("[")) return o;
  try {
    return JSON.parse(e);
  } catch {
    return o;
  }
}
function bo(o) {
  const e = ja(o);
  if (!Array.isArray(e)) return {
    items: [],
    changed: !0
  };
  let r = e !== o;
  const t = [];
  for (const a of e) {
    const n = ja(a);
    if (!n || typeof n != "object" || Array.isArray(n)) {
      r = !0;
      continue;
    }
    n !== a && (r = !0), t.push(n);
  }
  return {
    items: t,
    changed: r
  };
}
function Ys(o) {
  let e = o, r = !1;
  const t = (a, n) => {
    e === o && (e = { ...o }), e[a] = n, r = !0;
  };
  for (const a of ["MediaStreams", "MediaAttachments"]) {
    if (!Object.prototype.hasOwnProperty.call(o, a)) continue;
    const n = bo(o[a]);
    n.changed && t(a, n.items);
  }
  if (Object.prototype.hasOwnProperty.call(o, "RequiredHttpHeaders")) {
    const a = ja(o.RequiredHttpHeaders);
    !a || typeof a != "object" || Array.isArray(a) ? t("RequiredHttpHeaders", {}) : a !== o.RequiredHttpHeaders && t("RequiredHttpHeaders", a);
  }
  return {
    mediaSource: e,
    changed: r
  };
}
function Eo(o) {
  if (!o || typeof o != "object" || Array.isArray(o) || !Object.prototype.hasOwnProperty.call(o, "MediaSources")) return {
    payload: o,
    rewriteState: "not_needed"
  };
  const e = bo(o.MediaSources);
  let r = e.changed;
  const t = e.items.map((a) => {
    const n = Ys(a);
    return n.changed && (r = !0), n.mediaSource;
  });
  return r ? {
    payload: {
      ...o,
      MediaSources: t
    },
    rewriteState: "applied"
  } : {
    payload: o,
    rewriteState: "not_needed"
  };
}
function Js(o, e = {}) {
  const r = Eo(o), t = r.payload;
  if (!t || typeof t != "object" || Array.isArray(t) || !Array.isArray(t.MediaSources)) return {
    payload: o,
    rewriteState: "not_needed"
  };
  const a = typeof e.buildProxyUrl == "function" ? e.buildProxyUrl : () => "";
  let n = r.rewriteState === "applied";
  const s = t.MediaSources.map((i) => {
    let c = i;
    const l = (p, g, h = {}) => {
      const y = Object.prototype.hasOwnProperty.call(c, p);
      h.onlyIfPresent === !0 && !y || c[p] === g && !(h.ensurePresent === !0 && !y) || (c === i && (c = { ...i }), c[p] = g, n = !0);
    }, d = String(i.DirectStreamUrl || "").trim(), u = String(i.Path || "").trim(), f = d || u, m = f ? a(f) : "";
    return m ? (l("DirectStreamUrl", m, { ensurePresent: !0 }), l("Path", m, { ensurePresent: !0 })) : l("Path", "", { ensurePresent: !0 }), l("IsRemote", !1, { ensurePresent: !0 }), l("Protocol", "Http", { ensurePresent: !0 }), l("SupportsTranscoding", !1, { ensurePresent: !0 }), l("TranscodingUrl", "", { ensurePresent: !0 }), l("TranscodingSubProtocol", "", { onlyIfPresent: !0 }), l("TranscodingContainer", "", { onlyIfPresent: !0 }), l("TranscodingType", "", { onlyIfPresent: !0 }), c;
  });
  return n ? {
    payload: {
      ...t,
      MediaSources: s
    },
    rewriteState: "applied"
  } : {
    payload: o,
    rewriteState: "not_needed"
  };
}
function _l(o, e = {}) {
  if (!er(o)) return {
    kind: "invalid",
    reason: "invalid_representation"
  };
  const r = e.rewriteEnabled === !0 ? Js(o.payload, { buildProxyUrl: e.buildProxyUrl }) : Eo(o.payload);
  if (r.rewriteState !== "applied") return {
    kind: "valid",
    representation: o,
    rewriteState: e.rewriteEnabled === !0 ? "not_needed" : "passthrough"
  };
  const t = JSON.stringify(r.payload), a = new TextEncoder().encode(t).byteLength, n = o.response;
  try {
    Promise.resolve(n.body?.cancel?.()).catch(() => {
    });
  } catch {
  }
  return {
    kind: "valid",
    representation: So({
      response: new Response(t, {
        status: n.status,
        statusText: n.statusText,
        headers: _o(n.headers)
      }),
      bodyText: t,
      bodyBytes: a,
      payload: r.payload
    }),
    rewriteState: "applied"
  };
}
function Ua(o) {
  return new TextEncoder().encode(String(o || "")).byteLength;
}
var bl = class {
  constructor(o = {}) {
    if (!(o.entries instanceof Map)) throw new TypeError("PlaybackInfoCacheStore requires a Map");
    this.entries = o.entries, this.now = typeof o.now == "function" ? o.now : Date.now, this.maxEntries = Math.max(1, Number(o.maxEntries) || 1), this.maxEntryBytes = Math.max(1, Number(o.maxEntryBytes) || 1), this.maxTotalBytes = Math.max(1, Number(o.maxTotalBytes) || 1);
  }
  #e(o) {
    const e = Number(o?.status);
    if (!(e >= 200 && e < 300) || e === 204 || e === 205) return null;
    let r;
    try {
      r = new Headers(Array.isArray(o.headers) ? o.headers : []);
    } catch {
      return null;
    }
    if (!Ga(r.get("Content-Type"))) return null;
    const t = String(o.bodyText || ""), a = Ua(t);
    if (a > this.maxEntryBytes) return null;
    const n = Va(t);
    return n ? {
      headers: r,
      bodyText: t,
      bodyBytes: a,
      payload: n
    } : null;
  }
  cleanup(o = this.now()) {
    for (const [r, t] of this.entries) {
      const a = Number(t?.expiresAt) || 0;
      (a > 0 && a <= o || !this.#e(t)) && this.entries.delete(r);
    }
    for (; this.entries.size > this.maxEntries; ) {
      const r = this.entries.keys().next().value;
      if (!r) break;
      this.entries.delete(r);
    }
    let e = 0;
    for (const r of this.entries.values()) e += Ua(r?.bodyText);
    for (; this.entries.size > 0 && e > this.maxTotalBytes; ) {
      const r = this.entries.keys().next().value;
      if (!r) break;
      const t = this.entries.get(r);
      e -= Ua(t?.bodyText), this.entries.delete(r);
    }
  }
  set(o, e, r = {}) {
    if (!o || !er(e)) return !1;
    const t = e.response;
    if (!(t.status >= 200 && t.status < 300) || t.status === 204 || t.status === 205 || !Ga(t.headers.get("Content-Type"))) return !1;
    const a = Ua(e.bodyText);
    if (a > this.maxEntryBytes || !Va(e.bodyText)) return !1;
    const n = Math.max(0, Number(r.ttlMs) || 0);
    if (n <= 0) return !1;
    const s = _o(t.headers);
    s.delete("Set-Cookie");
    const i = this.now();
    return this.entries.delete(o), this.entries.set(o, {
      nodeName: String(r.nodeName || "").trim().toLowerCase(),
      nodeRevision: String(r.nodeRevision || "").trim(),
      playbackInfoRewrite: String(r.playbackInfoRewrite || "").trim(),
      status: t.status,
      statusText: t.statusText,
      headers: [...s.entries()],
      bodyText: e.bodyText,
      bodyBytes: a,
      storedAt: i,
      expiresAt: i + n
    }), this.cleanup(i), !0;
  }
  get(o) {
    if (!o) return null;
    this.cleanup();
    const e = this.entries.get(o);
    if (!e) return null;
    const r = this.#e(e);
    if (!r)
      return this.entries.delete(o), null;
    let t;
    try {
      t = new Response(r.bodyText, {
        status: Number(e.status) || 200,
        statusText: String(e.statusText || ""),
        headers: r.headers
      });
    } catch {
      return this.entries.delete(o), null;
    }
    const a = So({
      response: t,
      bodyText: r.bodyText,
      bodyBytes: r.bodyBytes,
      payload: r.payload
    });
    return this.entries.delete(o), this.entries.set(o, {
      ...e,
      bodyBytes: r.bodyBytes
    }), {
      representation: a,
      metadata: e
    };
  }
};
function El() {
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
    CleanupState: ll()
  };
}
var _t = ln(El), _e = (o = null) => _t.get(o), tr = pl(), qa = dl(), Gn = ul(), { runDataMutation: Qt, runTidyMutation: Rl } = ml(Gn), oe = {
  ProxyFailoverStateCache: /* @__PURE__ */ new Map(),
  CryptoKeyCache: /* @__PURE__ */ new Map(),
  PlaybackInfoResponseCache: /* @__PURE__ */ new Map(),
  PlaybackProgressRelay: /* @__PURE__ */ new Map(),
  MetadataPrewarmTasks: /* @__PURE__ */ new Map(),
  DashboardMonthlyTrafficCache: /* @__PURE__ */ new Map(),
  SingleFlightTasks: /* @__PURE__ */ new Map(),
  AdminRemoteShellCacheMutationChains: /* @__PURE__ */ new Map(),
  LogsReadinessProbeCache: /* @__PURE__ */ new WeakMap(),
  ProxyAccessRuleProfileCache: /* @__PURE__ */ new WeakMap()
};
for (const o of [
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
]) Object.defineProperty(oe, o, {
  enumerable: !0,
  configurable: !1,
  get: () => _t.current()[o],
  set: (e) => {
    _t.current()[o] = e;
  }
});
for (const o of ["ConfigCache", "RuntimeConfigCacheGeneration"]) Object.defineProperty(oe, o, {
  enumerable: !0,
  configurable: !1,
  get: () => qa.current()[o],
  set: (e) => {
    qa.current()[o] = e;
  }
});
var Je = {
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
for (const o of ["CleanupState"]) Object.defineProperty(Je, o, {
  enumerable: !0,
  configurable: !1,
  get: () => _t.current()[o],
  set: (e) => {
    _t.current()[o] = e;
  }
});
for (const o of ["KvDataMutationChain", "KvTidyMutationChain"]) Object.defineProperty(Je, o, {
  enumerable: !0,
  configurable: !1,
  get: () => Gn.current()[o],
  set: (e) => {
    Gn.current()[o] = e;
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
function Tl(o) {
  const e = {}, r = {};
  for (const t of o) for (const a of Object.keys(t)) r[a] = {
    enumerable: !0,
    configurable: !1,
    get: () => t[a],
    set: (n) => {
      t[a] = n;
    }
  };
  return Object.defineProperties(e, r);
}
var Al = Tl([
  oe,
  Je,
  Z
]);
function ie(o, e = "unknown_error") {
  const r = String(o?.message || "").trim();
  return r || String(o || "").trim() || e;
}
function De(o, e = 500) {
  const r = Number(o);
  if (Number.isFinite(r) && r >= 400 && r <= 599) return Math.floor(r);
  const t = Number(e);
  return Number.isFinite(t) && t >= 400 && t <= 599 ? Math.floor(t) : 500;
}
function dn(o) {
  if (!o || typeof o != "object") return !1;
  const e = String(o?.code || "").trim(), r = Number(o?.status);
  return !!e || Number.isFinite(r) && r >= 400 && r <= 599;
}
function Cl(o, e = {}) {
  const r = De(e?.status, 500), t = String(e?.code || "INTERNAL_ERROR").trim().toUpperCase() || "INTERNAL_ERROR", a = String(e?.message || "Server Error").trim() || "Server Error", n = dn(o);
  return {
    status: n ? De(o?.status, r) : r,
    code: n && String(o?.code || t).trim().toUpperCase() || t,
    message: n && String(o?.message || a).trim() || a,
    details: n && o?.details !== void 0 ? o.details : e?.details !== void 0 ? e.details : null
  };
}
function Qs(o = "get", e = {}, r = "unknown_error") {
  const t = U(e) ? e : {}, a = {
    dependency: "KV",
    operation: String(o || "").trim().toLowerCase() === "list" ? "list" : "get",
    reason: String(r || "unknown_error").trim() || "unknown_error"
  }, n = String(t.key || "").trim(), s = String(t.prefix || "").trim();
  return n && (a.key = n), s && (a.prefix = s), we("KV_READ_FAILED", "KV 读取异常", 503, a);
}
function un(o) {
  return dn(o) && String(o?.code || "").trim().toUpperCase() === "KV_READ_FAILED" && String(o?.details?.dependency || "").trim().toUpperCase() === "KV";
}
function wl(o, e = "INTERNAL_ERROR", r = "Server Error", t = "admin.read.kv_read_failed") {
  if (!un(o)) return o;
  const a = we(e, r, 503, { ...U(o?.details) ? o.details : {} });
  return Ne(t, a, a.details), a;
}
function Lt(o, e, r, t = "admin.read") {
  if (!un(o)) return o;
  const a = String(o?.details?.operation || "").trim().toLowerCase() === "list" ? "list" : "get";
  return wl(o, e, r, `${String(t || "admin.read").trim() || "admin.read"}.kv_${a}_failed`);
}
function Zo(o = "CONFIG_SNAPSHOTS_CLEAR_FAILED", e = "设置快照清理失败：KV 写入异常", r = null) {
  return we(o, e, 503, r);
}
function Ne(o, e, r = null, t = "warn") {
  const a = t === "error" ? "error" : "warn", n = String(o || "runtime_failure").trim() || "runtime_failure", s = U(r) ? { ...r } : {}, i = String(e?.code || "").trim(), c = Number(e?.status);
  i && (s.errorCode = i), Number.isFinite(c) && (s.errorStatus = Math.floor(c)), Object.keys(s).length > 0 ? console[a](`[${n}] ${ie(e)}`, s) : console[a](`[${n}] ${ie(e)}`);
}
async function ye(o, e, r = null, t = null) {
  try {
    return await o;
  } catch (a) {
    return Ne(e, a, r), t;
  }
}
function we(o = "CONFIG_INVALID", e = "配置无效", r = 400, t = null) {
  const a = new Error(String(e || "配置无效"));
  return a.code = String(o || "CONFIG_INVALID"), a.status = De(r, 400), t != null && (a.details = t), a;
}
function rr(o) {
  return o ? o.name === "AbortError" ? !0 : String(o.message || "").toLowerCase().includes("abort") : !1;
}
var Zs = 4 * 1024 * 1024, fn = 64 * 1024, ei = Object.freeze({
  "Referrer-Policy": "origin-when-cross-origin",
  "Strict-Transport-Security": "max-age=15552000; preload",
  "X-Frame-Options": "SAMEORIGIN",
  "X-Content-Type-Options": "nosniff",
  "X-XSS-Protection": "1; mode=block"
}), da = Object.freeze({
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS, HEAD",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Emby-Authorization, X-Emby-Token, X-Emby-Client, X-Emby-Device-Id, X-Emby-Device-Name, X-Emby-Client-Version, X-MediaBrowser-Authorization, X-MediaBrowser-Token"
});
function Kr(o, e) {
  const r = o.get("Vary");
  if (!r) {
    o.set("Vary", e);
    return;
  }
  const t = r.split(",").map((a) => a.trim()).filter(Boolean);
  t.includes(e) || t.push(e), o.set("Vary", t.join(", "));
}
function Ce(o) {
  return Object.entries(ei).forEach(([e, r]) => o.set(e, r)), o;
}
function Q(o) {
  return Array.isArray(o) || U(o) ? JSON.stringify(o) : o === void 0 ? "" : JSON.stringify(o);
}
var k = () => Date.now(), ti = (o) => new Promise((e) => setTimeout(e, Math.max(0, Number(o) || 0)));
function Ll(o) {
  let e = !1, r = () => {
  };
  const t = setTimeout(() => {
    e || (e = !0, r(!0));
  }, Math.max(0, Number(o) || 0));
  return {
    promise: new Promise((a) => {
      r = a;
    }),
    cancel() {
      return e ? !1 : (e = !0, clearTimeout(t), r(!1), !0);
    }
  };
}
var Dl = Object.freeze({
  JwtExpiry: 3600 * 24 * 30,
  LoginLockDuration: 900,
  MaxLoginAttempts: 5
}), Pt = Object.freeze({
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
}), Nl = Object.freeze({
  EnableHostPrefixProxy: !1,
  MultiLinkCopyPanelEnabled: !1,
  DashboardShowD1WriteHotspot: !1,
  DashboardShowKvD1Status: !1,
  UiRadiusPx: 10,
  NodePanelPingAutoSort: !1
}), Il = Object.freeze({
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
}), Ml = Object.freeze({
  ScheduledLeaseMinMs: 30 * 1e3,
  ScheduledLeaseMs: 300 * 1e3,
  ScheduleUtcOffsetMinutes: 480,
  TgDailyReportSummaryEnabled: !1,
  TgDailyReportKvEnabled: !1,
  TgDailyReportD1Enabled: !1,
  TgDailyReportClockTimes: ["09:00"]
}), Ue = Object.freeze({
  PingTimeoutMs: 1e4,
  HedgeFailoverEnabled: !1,
  HedgeProbePreferGet: !0,
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
}), Pl = Object.freeze({
  ConfigSnapshotLimit: 5,
  DnsHistoryLimit: 5,
  DnsIpProbeCacheTtlSec: 600,
  DnsIpProbeTimeoutMs: 2500,
  DnsIpProbeConcurrency: 4,
  DnsIpWorkspaceSyncProbeLimit: 2,
  DnsIpSourceConcurrency: 4,
  DnsIpSourceFetchMaxBytes: 2 * 1024 * 1024,
  DnsIpSourceIpLimit: 5
}), xl = Object.freeze({
  CfQuotaPlanCacheMinutes: 60,
  CfQuotaPlanOverride: ""
}), Ol = Object.freeze({
  AssetHash: "v19.3",
  Version: "19.3"
}), vl = Object.freeze({
  ...Dl,
  ...Pt,
  ...Nl,
  ...Il,
  ...Ml,
  ...Ue,
  ...Pl,
  ...xl,
  ...Ol
}), v = Object.freeze({ Defaults: vl });
function Ke(o) {
  return de(o, v.Defaults.ScheduleUtcOffsetMinutes, -720, 840);
}
function ga(o = "", e = "00:00") {
  const r = String(e || "00:00").trim() || "00:00", t = String(o || "").trim().match(/^(\d{1,2}):(\d{1,2})$/);
  if (!t) return r;
  const a = Number(t[1]), n = Number(t[2]);
  return !Number.isInteger(a) || a < 0 || a > 23 || !Number.isInteger(n) || n < 0 || n > 59 ? r : `${String(a).padStart(2, "0")}:${String(n).padStart(2, "0")}`;
}
function Nt(o = [], e = []) {
  const r = Array.isArray(o) ? o : String(o || "").split(/[\r\n,]+/), t = [], a = /* @__PURE__ */ new Set();
  for (const n of r) {
    const s = ga(n, "");
    !s || a.has(s) || (a.add(s), t.push(s));
  }
  return t.sort((n, s) => Nr(n) - Nr(s)), t.length ? t : [...new Set((Array.isArray(e) ? e : [e]).map((n) => ga(n, "")).filter(Boolean))].sort((n, s) => Nr(n) - Nr(s));
}
function Nr(o = "") {
  const e = ga(o, "");
  if (!e) return -1;
  const [r, t] = e.split(":");
  return (Number(r) || 0) * 60 + (Number(t) || 0);
}
function Fl(o = "") {
  const e = String(o || "").trim().match(/^(\d{4}-\d{2}-\d{2})\s+(\d{2}:\d{2})$/);
  return e ? {
    dateKey: e[1],
    clockTime: ga(e[2], "")
  } : {
    dateKey: "",
    clockTime: ""
  };
}
function Ul(o, e = v.Defaults.ScheduleUtcOffsetMinutes) {
  const r = Ke(e), t = o.getUTCFullYear(), a = String(o.getUTCMonth() + 1).padStart(2, "0"), n = String(o.getUTCDate()).padStart(2, "0"), s = String(o.getUTCHours()).padStart(2, "0"), i = String(o.getUTCMinutes()).padStart(2, "0"), c = String(o.getUTCSeconds()).padStart(2, "0"), l = String(o.getUTCMilliseconds()).padStart(3, "0"), d = r >= 0 ? "+" : "-", u = Math.abs(r);
  return `${t}-${a}-${n}T${s}:${i}:${c}.${l}${d}${String(Math.floor(u / 60)).padStart(2, "0")}:${String(u % 60).padStart(2, "0")}`;
}
function La(o = /* @__PURE__ */ new Date(), e = v.Defaults.ScheduleUtcOffsetMinutes) {
  const r = Ke(e), t = r * 60 * 1e3, a = o instanceof Date ? new Date(o.getTime()) : new Date(o), n = a.getTime() + t, s = new Date(n), i = s.getUTCFullYear(), c = String(s.getUTCMonth() + 1).padStart(2, "0"), l = String(s.getUTCDate()).padStart(2, "0"), d = String(s.getUTCHours()).padStart(2, "0"), u = String(s.getUTCMinutes()).padStart(2, "0"), f = String(s.getUTCSeconds()).padStart(2, "0"), m = String(s.getUTCMilliseconds()).padStart(3, "0"), p = Number(d), g = Number(u);
  return {
    now: a,
    shiftedDate: s,
    utcOffsetMinutes: r,
    offsetLabel: Ro(r),
    dateKey: `${i}-${c}-${l}`,
    clockTime: `${d}:${u}`,
    hour: p,
    minute: g,
    second: Number(f),
    millisecond: Number(m),
    minuteOfDay: p * 60 + g,
    localIso: Ul(s, r)
  };
}
function es(o = /* @__PURE__ */ new Date(), e = v.Defaults.ScheduleUtcOffsetMinutes) {
  return La(o, e).localIso;
}
function xt(o = /* @__PURE__ */ new Date(), e = v.Defaults.ScheduleUtcOffsetMinutes) {
  return La(o, e);
}
function St(o = /* @__PURE__ */ new Date(), e = v.Defaults.ScheduleUtcOffsetMinutes, r = "") {
  const t = La(o, e), a = ga(r || t.clockTime, t.clockTime), n = Nr(a), s = Date.UTC(t.shiftedDate.getUTCFullYear(), t.shiftedDate.getUTCMonth(), t.shiftedDate.getUTCDate()) - t.utcOffsetMinutes * 60 * 1e3, i = s + 1440 * 60 * 1e3 - 1, c = s + Math.max(0, n) * 60 * 1e3;
  return {
    ...t,
    normalizedClockTime: a,
    plannedMinuteOfDay: n,
    plannedTs: c,
    plannedSlotKey: `${t.dateKey} ${a}`,
    startTs: s,
    endTs: i
  };
}
function Hl(o = /* @__PURE__ */ new Date(), e = v.Defaults.ScheduleUtcOffsetMinutes) {
  const r = xt(o, e);
  return {
    ...r,
    slotKey: `${r.dateKey} ${r.clockTime}`
  };
}
function Ro(o = v.Defaults.ScheduleUtcOffsetMinutes) {
  const e = Ke(o), r = e >= 0 ? "+" : "-", t = Math.abs(e);
  return `UTC${r}${String(Math.floor(t / 60)).padStart(2, "0")}:${String(t % 60).padStart(2, "0")}`;
}
function kl(o = {}, e = "") {
  const r = o?.fixedQueue && typeof o.fixedQueue == "object" ? o.fixedQueue : {};
  let t = String(r.localDateKey || "").trim(), a = Nt(r.executedSlots || [], []);
  if (!t) {
    const n = Fl(o?.lastPlannedSlot || "");
    n.dateKey && n.dateKey === e && (t = n.dateKey, a = Nt([...a, n.clockTime], []));
  }
  return !e || t !== e ? {
    localDateKey: e,
    executedSlots: []
  } : {
    localDateKey: t,
    executedSlots: a
  };
}
function Kl(o = {}, e = [], r = v.Defaults.ScheduleUtcOffsetMinutes, t = /* @__PURE__ */ new Date()) {
  const a = La(t, r), n = Nt(e, []), s = kl(o, a.dateKey);
  if (!n.length) return {
    due: !1,
    context: a,
    normalizedClockTimes: n,
    fixedQueue: s,
    dueSlots: [],
    reason: "no_clock_times_configured"
  };
  const i = new Set(Nt(s.executedSlots || [], [])), c = n.filter((d) => Nr(d) <= a.minuteOfDay), l = c.filter((d) => !i.has(d));
  return l.length ? {
    due: !0,
    context: a,
    normalizedClockTimes: n,
    fixedQueue: s,
    dueSlots: l,
    reason: "clock_slots_due"
  } : {
    due: !1,
    context: a,
    normalizedClockTimes: n,
    fixedQueue: s,
    dueSlots: [],
    reason: c.length ? "slot_already_processed" : "time_not_matched"
  };
}
function ar(o = "") {
  const e = String(o || "").trim().toLowerCase();
  return e === "inherit" ? "inherit" : e === "emby" ? "emby" : e === "jellyfin" ? "jellyfin" : e === "passthrough" ? "passthrough" : "auto";
}
function Mr(o = "") {
  const e = String(o || "").trim().toLowerCase();
  return e === "inherit" ? "inherit" : e === "forward" ? "forward" : e === "strip" ? "strip" : e === "disable" || e === "none" ? "disable" : "forward";
}
function Pr(o = "") {
  const e = String(o || "").trim().toLowerCase();
  return e === "inherit" ? "inherit" : e === "rewrite" ? "rewrite" : e === "passthrough" ? "passthrough" : "inherit";
}
function nr(o = "") {
  return String(o || "").trim().toLowerCase() === "host_prefix" ? "host_prefix" : "kv_route";
}
function Qe(o = "") {
  return nr(o) === "host_prefix";
}
function ri(o = "") {
  const e = String(o || "").trim().toLowerCase();
  return e === "emby" ? "emby" : e === "jellyfin" ? "jellyfin" : e === "passthrough" ? "passthrough" : "auto";
}
function Gt(o = "") {
  return String(o || "").trim().toLowerCase() === "rewrite" ? "rewrite" : v.Defaults.DefaultPlaybackInfoMode;
}
function To(o = "") {
  const e = String(o || "").trim().toLowerCase();
  return e === "strip" ? "strip" : e === "disable" || e === "none" ? "disable" : "forward";
}
function Br(o) {
  return de(o, v.Defaults.DnsIpSourceIpLimit, 1, 1e3);
}
function mn(o = "") {
  const e = String(o || "").trim().toLowerCase();
  return e === "direct" ? "direct" : e === "proxy" ? "proxy" : "inherit";
}
function $r(o = {}) {
  return mn(o?.mainVideoStreamMode ?? o?.wangpanDirectMode ?? o?.wangpanMode);
}
function zr(o = [], e = "") {
  const r = Array.isArray(o) ? o : String(o || "").split(/[,，\r\n]+/), t = [], a = /* @__PURE__ */ new Set();
  for (const n of [...r, e]) {
    const s = String(n || "").trim().slice(0, 24), i = s.toLowerCase();
    if (!(!s || a.has(i)) && (a.add(i), t.push(s), t.length >= 20))
      break;
  }
  return t;
}
var Vn = /\b(?:(?:(?:25[0-5]|2[0-4]\d|1?\d?\d)\.){3}(?:25[0-5]|2[0-4]\d|1?\d?\d)|[0-9a-f:]{2,})\b/gi, ai = {
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
}, ts = Object.freeze((() => {
  const o = {};
  for (const e of Object.values(ai)) {
    const r = String(e?.countryCode || "").trim().toUpperCase(), t = String(e?.countryName || "").trim();
    !r || !t || o[r] || (o[r] = t);
  }
  return o.CN = o.CN || "中国", o.HK = o.HK || "中国香港", o.MO = o.MO || "中国澳门", o.TW = o.TW || "中国台湾", o;
})()), na = null;
function Da(o = "") {
  const e = String(o || "").trim();
  if (!e || !/^(?:\d{1,3}\.){3}\d{1,3}$/.test(e)) return !1;
  const r = e.split(".");
  return r.length === 4 && r.every((t) => {
    const a = Number(t);
    return Number.isInteger(a) && a >= 0 && a <= 255;
  });
}
function Bl(o = "") {
  if (!Da(o)) return !1;
  const [e = 0, r = 0] = String(o || "").trim().split(".").map((t) => Number(t));
  return e === 10 || e === 127 || e === 169 && r === 254 || e === 172 && r >= 16 && r <= 31 ? !0 : e === 192 && r === 168;
}
function pn(o = "") {
  const e = String(o || "").trim();
  if (!e || !e.includes(":") || /\s/.test(e)) return !1;
  try {
    return new URL(`http://[${e}]/`), !0;
  } catch {
    return !1;
  }
}
function ni(o = "") {
  return String(o || "").trim().toUpperCase() === "IPV6" ? "IPv6" : "IPv4";
}
function et(o = "") {
  return pn(o) ? "IPv6" : Da(o) ? "IPv4" : "";
}
function Ao(o = "", e = {}) {
  const r = String(o || ""), t = /* @__PURE__ */ new Set(), a = [], n = Number(e?.limit), s = Number.isFinite(n) && n > 0 ? Math.max(1, Math.floor(n)) : Number.POSITIVE_INFINITY, i = (l) => {
    const d = String(l || "").trim();
    if (!d) return !1;
    const u = et(d);
    if (!u) return !1;
    const f = d.toLowerCase();
    return t.has(f) ? !1 : (t.add(f), a.push({
      ip: d,
      ipType: u
    }), a.length >= s);
  };
  Vn.lastIndex = 0;
  let c = null;
  for (; (c = Vn.exec(r)) !== null && !i(c[0]); ) ;
  return a;
}
function $l(o = null) {
  const e = Array.isArray(o?.Answer) ? o.Answer : [], r = /* @__PURE__ */ new Set(), t = [];
  for (const a of e) {
    const n = String(a?.data || "").trim(), s = et(n);
    if (!s) continue;
    const i = n.toLowerCase();
    r.has(i) || (r.add(i), t.push({
      ip: n,
      ipType: s
    }));
  }
  return t;
}
function Mn(o = "") {
  return String(o || "").replace(/&nbsp;/gi, " ").replace(/&amp;/gi, "&").replace(/&lt;/gi, "<").replace(/&gt;/gi, ">").replace(/&quot;/gi, '"').replace(/&#39;/gi, "'");
}
function zl(o = "") {
  const e = /* @__PURE__ */ new Map(), r = String(o || ""), t = r.match(/\[[0-9a-f:]{2,}\]/gi) || [];
  for (const n of t) {
    const s = String(n || "").replace(/^\[|\]$/g, "").trim();
    et(s) && e.set(s.toLowerCase(), s);
  }
  const a = r.match(Vn) || [];
  for (const n of a) {
    const s = String(n || "").trim();
    et(s) && e.set(s.toLowerCase(), s);
  }
  return [...e.values()];
}
function Wl(o = "") {
  const e = String(o || "").trim().toLowerCase();
  return e === "联通" ? "联通" : e === "电信" ? "电信" : e === "移动" ? "移动" : e === "多线" ? "多线" : e === "ipv6" ? "ipv6" : "";
}
function rs(o = "", e = "") {
  const r = Wl(e);
  return r ? String(o || "").trim().toLowerCase() === r.toLowerCase() : !0;
}
function Gl(o = "", e = "") {
  const r = /* @__PURE__ */ new Map(), t = (s, i = "") => {
    const c = String(s || "").trim(), l = et(c);
    if (!l || Bl(c)) return;
    const d = c.toLowerCase(), u = Wr(i), f = r.get(d);
    if (!f) {
      r.set(d, {
        ip: c,
        ipType: l,
        lineLabel: u
      });
      return;
    }
    !Wr(f?.lineLabel) && u && r.set(d, {
      ...f,
      lineLabel: u
    });
  }, a = String(o || ""), n = a.match(/<tr\b[^>]*>[\s\S]*?<\/tr>/gi) || [];
  for (const s of n) {
    const i = s.match(/<t[dh]\b[^>]*>[\s\S]*?<\/t[dh]>/gi) || [];
    if (i.length < 3) continue;
    const c = Mn(String(i[1] || "").replace(/<[^>]+>/g, " ")).replace(/\s+/g, " ").trim();
    if (!rs(c, e)) continue;
    const l = zl(Mn(String(i[2] || "").replace(/<[^>]+>/g, " "))).find((d) => et(d)) || "";
    l && t(l, c);
  }
  if (!r.size) {
    const s = Mn(a.replace(/<[^>]+>/g, `
`)), i = /(?:^|\n)\s*(?:\d+\s+)?(电信|联通|移动|多线|ipv6)\s+((?:(?:25[0-5]|2[0-4]\d|[01]?\d\d?)\.){3}(?:25[0-5]|2[0-4]\d|[01]?\d\d?)|(?:[a-f0-9]{1,4}:){2,}[a-f0-9:]{1,39})/gi;
    let c = null;
    for (; (c = i.exec(s)) !== null; )
      rs(c[1], e) && t(c[2], c[1]);
  }
  return [...r.values()];
}
function Vl(o = "", e = {}) {
  return Ao(o, e);
}
function jl(o = "") {
  const e = String(o || "").trim().toUpperCase(), r = ai[e];
  return e ? r ? {
    coloCode: e,
    cityName: String(r.cityName || e),
    countryCode: String(r.countryCode || "UNKNOWN"),
    countryName: String(r.countryName || "未知")
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
function ql(o = "") {
  const e = String(o || "").trim().toUpperCase();
  if (!e || e === "UNKNOWN") return "未知";
  if (ts[e]) return ts[e];
  try {
    if (na === null && (na = typeof Intl?.DisplayNames == "function" ? new Intl.DisplayNames(["zh-CN"], { type: "region" }) : !1), na && typeof na.of == "function") {
      const r = String(na.of(e) || "").trim();
      if (r) return r;
    }
  } catch {
  }
  return e;
}
function oi(o = "") {
  const e = String(o || "").trim();
  if (!e) return "";
  const r = e.match(/-([A-Za-z]{3,4})$/);
  return r ? String(r[1] || "").trim().toUpperCase() : "";
}
function Xl(o = "") {
  return `dns-ip-source-${ce(o || `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`)}`;
}
function Rt(o = "") {
  return String(o || "").trim().toLowerCase() === "domain" ? "domain" : "url";
}
var si = Object.freeze([Object.freeze({
  id: "all",
  label: "麒麟优选",
  sourceType: "url",
  url: "https://api.uouin.com/cloudflare.html"
}), Object.freeze({
  id: "preferred",
  label: "CF-SPEED-DNS优选",
  sourceType: "url",
  url: "https://raw.githubusercontent.com/ZhiXuanWang/cf-speed-dns/refs/heads/main/ipTop10.html"
})]), ii = Object.freeze([
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
]), Yl = Object.freeze([
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
]), Jl = Object.freeze([Object.freeze({
  label: "VPS789 优选IP",
  url: "https://vps789.com/cfip/"
}), Object.freeze({
  label: "Wetest IPv4 优选",
  url: "https://www.wetest.vip/page/cloudflare/address_v4.html"
})]);
function Ql(o = "") {
  const e = String(o || "").trim().toLowerCase();
  return e === "builtin" ? "builtin" : e === "preset" ? "preset" : "custom";
}
function ci(o = "") {
  const e = String(o || "").trim().toLowerCase();
  return e === "preferred" ? "preferred" : e === "all" ? "all" : "";
}
function Zl(o = "") {
  return String(o || "").trim().toLowerCase().replace(/[^a-z0-9_:-]+/g, "_");
}
function ed(o = "") {
  const e = ci(o);
  return si.find((r) => r.id === e) || null;
}
function td(o = "") {
  const e = Zl(o);
  return e && ii.find((r) => r.id === e) || null;
}
function Er() {
  return {
    builtInSourceOptions: si.map((o) => ({
      id: o.id,
      label: o.label,
      sourceType: o.sourceType,
      value: "domain" in o ? o.domain : o.url
    })),
    presetList: ii.map((o) => ({
      id: o.id,
      label: o.label,
      sourceType: o.sourceType,
      value: "domain" in o ? o.domain : o.url
    })),
    preferredDomainLinks: Yl.map((o) => ({ ...o })),
    preferredIpLinks: Jl.map((o) => ({ ...o }))
  };
}
function Wr(o = "") {
  const e = String(o || "").trim().toLowerCase();
  return e.includes("联通") ? "联通" : e.includes("电信") ? "电信" : e.includes("移动") ? "移动" : e.includes("多线") ? "多线" : e.includes("ipv6") ? "ipv6" : "";
}
function li(o = {}) {
  const e = Ql(o?.sourceKind || o?.source_kind || ""), r = e === "builtin" ? ed(o?.builtinId || o?.builtin_id || o?.presetId || o?.preset_id || o?.name) : null, t = e === "preset" ? td(o?.presetId || o?.preset_id || o?.builtinId || o?.builtin_id || o?.name) : null, a = r || t || null, n = Rt(a?.sourceType || o?.sourceType || o?.source_type || ""), s = a && "url" in a ? a.url : "", i = a && "domain" in a ? a.domain : "", c = String(s || o?.url || "").trim(), l = te(i || o?.domain || ""), d = String(o?.name || a?.label || "").trim();
  return {
    sourceKind: e,
    builtinId: r?.id || "",
    presetId: t?.id || "",
    name: d,
    sourceType: n,
    url: c,
    domain: l,
    resolvedLabel: String(a?.label || "").trim()
  };
}
function di(o = {}) {
  const e = li(o);
  return Rt(e.sourceType) === "domain" ? te(e.domain || "") : String(e.url || "").trim();
}
function or(o = {}) {
  return !!di(o);
}
function fr(o = {}, e = {}) {
  const r = String(o?.ip || o?.content || "").trim(), t = et(r);
  if (!r || !t) return null;
  const a = String(e.updatedAt || (/* @__PURE__ */ new Date()).toISOString()), n = String(o?.sourceKind || o?.source_kind || e.sourceKind || "manual").trim().toLowerCase() || "manual", s = String(o?.sourceLabel || o?.source_label || e.sourceLabel || "").trim(), i = Wr(o?.lineLabel || o?.line_label || e.lineLabel || ""), c = String(o?.remark || "").trim();
  return {
    id: String(o?.id || `dns-ip-${ce(r.toLowerCase())}`),
    ip: r,
    ipType: t,
    sourceKind: n,
    sourceLabel: s,
    lineLabel: i,
    remark: c,
    createdAt: String(o?.createdAt || o?.created_at || e.createdAt || a),
    updatedAt: a
  };
}
function It(o = {}, e = 0) {
  const r = (/* @__PURE__ */ new Date()).toISOString(), t = li(o), a = t.sourceKind, n = Rt(t.sourceType), s = String(t.builtinId || o?.builtinId || o?.builtin_id || "").trim(), i = String(t.presetId || o?.presetId || o?.preset_id || "").trim(), c = String(t.resolvedLabel || "").trim(), l = String(t.url || "").trim(), d = te(t.domain || ""), u = n === "domain" ? d : l, f = String(o?.name || c || "").trim(), m = o?.enabled, p = m == null ? !0 : !(m === !1 || m === 0 || String(m).trim() === "0");
  return {
    id: String(o?.id || Xl(`${a}|${s}|${i}|${n}|${u}|${e}`)),
    name: f || c || `抓取源 ${Number(e) + 1}`,
    url: l,
    domain: d,
    sourceType: n,
    sourceKind: a,
    presetId: i,
    builtinId: s,
    enabled: p,
    sortOrder: Math.max(0, Number.parseInt(String(o?.sortOrder ?? o?.sort_order ?? e), 10) || 0),
    ipLimit: Br(o?.ipLimit ?? o?.ip_limit),
    lastFetchAt: String(o?.lastFetchAt || o?.last_fetch_at || ""),
    lastFetchStatus: String(o?.lastFetchStatus || o?.last_fetch_status || ""),
    lastFetchCount: Math.max(0, Number(o?.lastFetchCount ?? o?.last_fetch_count) || 0),
    createdAt: String(o?.createdAt || o?.created_at || r),
    updatedAt: String(o?.updatedAt || o?.updated_at || r)
  };
}
function mr(o = []) {
  const e = [], r = /* @__PURE__ */ new Map();
  for (const t of Array.isArray(o) ? o : []) {
    const a = fr(t);
    if (!a) continue;
    const n = String(a.ip || "").trim().toLowerCase();
    if (!n) continue;
    const s = r.get(n);
    if (s === void 0) {
      r.set(n, e.length), e.push(a);
      continue;
    }
    const i = e[s];
    i && !Wr(i.lineLabel) && Wr(a.lineLabel) && (e[s] = {
      ...i,
      lineLabel: a.lineLabel
    });
  }
  return e;
}
function rd(o = {}) {
  const e = fr(o);
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
function Co(o = []) {
  return mr(o).map((e) => rd(e)).filter(Boolean);
}
function gn(o = "") {
  const e = String(o || "").trim().toLowerCase();
  return e === "success" ? "success" : e === "failed" ? "failed" : "empty";
}
function ui(o = {}, e = {}) {
  const r = It(e), t = mr(o?.items || []).slice(0, Br(r?.ipLimit)), a = gn(o?.status || (t.length ? "success" : "empty"));
  return {
    id: String(o?.id || r?.id || ""),
    name: String(o?.name || r?.name || ""),
    sourceType: Rt(o?.sourceType || r?.sourceType || ""),
    status: a,
    count: Math.max(0, Number(o?.count) || t.length),
    items: t,
    error: a === "failed" ? String(o?.error || "") : "",
    lastFetchAt: String(o?.lastFetchAt || (/* @__PURE__ */ new Date()).toISOString())
  };
}
function fi(o = []) {
  return (Array.isArray(o) ? o : []).map((e) => {
    const r = ui(e, e), t = Co(r?.items || []);
    return {
      id: String(r?.id || ""),
      name: String(r?.name || ""),
      sourceType: Rt(r?.sourceType || ""),
      status: gn(r?.status),
      count: Math.max(0, Number(r?.count) || t.length),
      items: t,
      error: String(r?.error || ""),
      lastFetchAt: String(r?.lastFetchAt || "")
    };
  });
}
function ad(o = []) {
  const e = Array.isArray(o) ? o : [];
  return e.length ? e.some((r) => gn(r?.status) !== "failed") : !0;
}
function Xa(o) {
  const e = Number(o) || 0;
  return !Number.isFinite(e) || e <= 0 ? "" : new Date(e).toISOString();
}
function Ba(o = [], e = v.Defaults.DnsIpSourceFetchMaxBytes) {
  return ce(Q({
    maxBytes: de(e, v.Defaults.DnsIpSourceFetchMaxBytes, 1024, 8 * 1024 * 1024),
    enabledSources: (Array.isArray(o) ? o : []).map((r, t) => It(r, t)).filter((r) => r.enabled === !0 && or(r)).map((r) => ({
      id: String(r.id || ""),
      name: String(r.name || ""),
      sourceType: Rt(r.sourceType),
      target: di(r),
      ipLimit: Br(r.ipLimit),
      enabled: r.enabled !== !1
    }))
  }));
}
function nd(o = "") {
  return String(o || "").trim().toLowerCase() === "shared_snapshot" ? "shared_snapshot" : "local_pool";
}
function mi(o = []) {
  const e = [], r = /* @__PURE__ */ new Set();
  for (const t of Array.isArray(o) ? o : []) {
    const a = String(t?.ip || t || "").trim();
    if (!et(a)) continue;
    const n = a.toLowerCase();
    r.has(n) || (r.add(n), e.push(a));
  }
  return {
    normalizedIps: e,
    deleteKeySet: r
  };
}
function as(o = [], e = /* @__PURE__ */ new Set()) {
  const r = [], t = [];
  for (const a of mr(o)) {
    const n = String(a?.ip || "").trim();
    if (n) {
      if (e.has(n.toLowerCase())) {
        t.push(a);
        continue;
      }
      r.push(a);
    }
  }
  return {
    keptItems: r,
    removedItems: t
  };
}
function od(o = {}, e = []) {
  const { deleteKeySet: r } = mi(e), t = mr(o?.items || []), a = Array.isArray(o?.sourceResults) ? o.sourceResults : [];
  if (!r.size) return {
    deletedCount: 0,
    deletedIps: [],
    items: t,
    sourceResults: a
  };
  const { keptItems: n, removedItems: s } = as(t, r), i = new Set(s.map((l) => String(l?.ip || "").trim().toLowerCase()).filter(Boolean)), c = a.map((l) => {
    const { keptItems: d } = as(l?.items || [], i), u = gn(l?.status) === "failed" ? "failed" : d.length ? "success" : "empty";
    return {
      id: String(l?.id || ""),
      name: String(l?.name || ""),
      sourceType: Rt(l?.sourceType || l?.source_type || ""),
      status: u,
      count: d.length,
      items: d,
      error: u === "failed" ? String(l?.error || "") : "",
      lastFetchAt: String(l?.lastFetchAt || (/* @__PURE__ */ new Date()).toISOString())
    };
  });
  return {
    deletedCount: s.length,
    deletedIps: s.map((l) => String(l?.ip || "").trim()).filter(Boolean),
    items: n,
    sourceResults: c
  };
}
function $a(o = "") {
  const e = String(o || "").trim().toLowerCase();
  return e === "ok" ? "ok" : e === "pending" ? "pending" : e === "cf_header_missing" ? "cf_header_missing" : e === "non_cloudflare" ? "non_cloudflare" : e === "timeout" ? "timeout" : "network_error";
}
function Pn(o = []) {
  const e = Array.isArray(o) ? o : [], r = /* @__PURE__ */ new Set(), t = /* @__PURE__ */ new Set();
  let a = 0, n = 0;
  for (const s of e) {
    ni(s?.ipType || s?.ip_type || s?.type || "") === "IPv6" ? n += 1 : a += 1;
    const i = String(s?.countryCode || s?.country_code || "").trim().toUpperCase(), c = String(s?.coloCode || s?.colo_code || "").trim().toUpperCase();
    i && r.add(i), c && t.add(c);
  }
  return {
    ipCount: e.length,
    ipv4Count: a,
    ipv6Count: n,
    countryCount: r.size,
    coloCount: t.size
  };
}
function sd(o = [], e = []) {
  const r = Array.isArray(o) ? o : [], t = Array.isArray(e) ? e : [];
  return {
    currentHost: Pn(r),
    sharedPool: Pn(t),
    combined: Pn([...r, ...t])
  };
}
function id(o = "") {
  const e = String(o || "").trim().toLowerCase();
  if (!e) return "";
  const r = e.endsWith(".") ? e.slice(0, -1) : e;
  return !r || r.length > 253 || r.endsWith(".") || /\s|[:\/@*?#\\]/.test(r) || Da(r) || pn(r) || r.split(".").some((t) => !Na(t)) ? "" : r;
}
function ze(o) {
  return id(o?.HOST);
}
function Gr(o) {
  return te(o?.LEGACY_HOST);
}
function cd(o) {
  const e = ze(o), r = Gr(o), t = wo(r, e);
  return t?.prefix ? {
    name: String(t.prefix || "").trim().toLowerCase(),
    reservedBy: r,
    reason: "legacy_host",
    legacyHost: r,
    host: e
  } : null;
}
function ha(o, e) {
  const r = te(o), t = te(e);
  return !r || !t ? !1 : r === t || r.endsWith(`.${t}`);
}
function Na(o = "") {
  const e = String(o || "").trim().toLowerCase();
  return !e || e.length > 63 ? !1 : /^[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?$/.test(e);
}
function Vt(o = "") {
  const e = String(o || "").trim().toLowerCase().replace(/\.+$/, "");
  return !e || e.length > 253 || /\s|[:/@*]/.test(e) || Da(e) || pn(e) || e.split(".").some((r) => !Na(r)) ? "" : e;
}
function pi(o = "") {
  const e = String(o || "").trim();
  return !e || Vt(e) ? "" : "CNAME 指向必须是合法主机名，不能包含协议、端口、路径、通配符、空格或 IP 地址";
}
function ld(o = "", e = "defaultHostPrefixCnameTarget") {
  const r = pi(o);
  if (r)
    throw we("HOST_PREFIX_CNAME_TARGET_INVALID", r, 400, {
      field: e,
      value: String(o || "").trim()
    });
}
function Ya(o = null, e = {}, r = "") {
  return Vt(o?.hostPrefixCnameTarget) || Vt(e?.defaultHostPrefixCnameTarget) || te(r);
}
function wo(o = "", e = "") {
  const r = te(o), t = te(e);
  if (!r || !t || r === t) return null;
  const a = `.${t}`;
  if (!r.endsWith(a)) return null;
  const n = r.slice(0, -a.length);
  return !n || n.includes(".") || !Na(n) ? null : {
    hostname: r,
    host: t,
    prefix: n
  };
}
function gi(o) {
  const e = String(o || "").trim();
  if (!e) return null;
  const r = e.indexOf("/"), t = r === -1 ? e : e.slice(0, r), a = r === -1 ? "" : e.slice(r), n = ho(t);
  return n ? {
    ...n,
    path: a,
    pattern: e
  } : null;
}
function Lo(o, e = {}) {
  const r = String(e.path || "");
  let t = 0;
  return e.wildcard || (t += 100), o.includes(".workers.dev") && (t -= 20), r === "/" || r === "/*" ? t += 20 : r.endsWith("*") ? t += 10 : r && (t += 4), t += o.split(".").length * 4, t -= Math.min(r.length, 30), t;
}
var dd = "https://admin-local-index.invalid", ud = "local-", fd = "sys:admin_index_upload:v1:", md = "sys:admin_index_active:v2";
function xr(o = "") {
  const e = String(o || "").trim();
  if (!e) return "";
  try {
    const r = new URL(e);
    return ["http:", "https:"].includes(r.protocol) ? r.toString() : "";
  } catch {
    return "";
  }
}
function pd(o = "") {
  const e = String(o || "").trim();
  return !(!e || /[\x00-\x20~^:?*[\\\]]/.test(e) || e.includes("..") || e.includes("@{") || e.includes("//") || e.startsWith("/") || e.endsWith("/") || e.endsWith(".") || e.endsWith(".lock"));
}
function pt(o = "") {
  const e = String(o || "").trim();
  return pd(e) ? e : "";
}
function Dt(o = "") {
  const e = String(o || "").trim().toLowerCase();
  return /^[a-f0-9]{64}$/.test(e) ? e : "";
}
function Vr(o = "") {
  const e = Dt(o);
  return e ? `${dd}/${e}/index.html` : "";
}
function Xe(o = "") {
  const e = xr(o);
  if (!e) return "";
  try {
    const r = new URL(e);
    return r.origin !== "https://admin-local-index.invalid" || r.search || r.hash ? "" : Dt(r.pathname.match(/^\/([a-f0-9]{64})\/index\.html$/i)?.[1] || "");
  } catch {
    return "";
  }
}
function Do(o = "") {
  const e = Dt(o);
  return e ? `${ud}${e}` : "";
}
function gd(o = "") {
  const e = String(o || "").trim().toLowerCase();
  return e.startsWith("local-") ? Dt(e.slice(6)) : "";
}
function gt(o = null, e = {}) {
  const r = xr((U(e) ? e : {}).indexUrl), t = Xe(r), a = !!t, n = a ? Vr(t) : "";
  return {
    effectiveRef: t,
    effectiveRefType: a ? "local_upload" : "",
    configIndexUrl: r,
    envIndexUrl: "",
    indexUrl: n,
    persistedIndexUrl: n,
    indexUrlSource: a ? "local_upload" : "unset",
    isLocalUpload: a,
    localUploadRevision: t,
    assetRevision: a ? Do(t) : "",
    hasGithubRelease: !1,
    hasLocalUpload: a,
    hasDerivedIndexUrl: !1,
    gateState: n ? "shell_ready" : "setup_required"
  };
}
function hd(o = {}) {
  const e = String(U(o) && o.indexUrl || "").trim();
  if (!(!e || Xe(e)))
    throw we("ADMIN_INDEX_SOURCE_UPLOAD_ONLY", "管理台 HTML 仅支持本地上传，请通过启动门或 Worker 和 HTML 更新面板提交 index.html", 400, { field: "indexUrl" });
}
function hi(o = {}, e = null) {
  const r = String(e?.HOST || "").trim(), t = ze(e), a = String(o?.cfZoneId || "").trim(), n = String(o?.cfApiToken || "").trim(), s = [], i = [];
  return r ? t || i.push("HOST") : s.push("HOST"), a || s.push("cfZoneId"), n || s.push("cfApiToken"), {
    host: t,
    cfZoneId: a,
    cfApiToken: n,
    missingFields: s,
    invalidFields: i
  };
}
function yi(o = {}) {
  if (!(!Array.isArray(o?.invalidFields) || !o.invalidFields.includes("HOST")))
    throw we("HOST_PREFIX_HOST_INVALID", "HOST 必须是合法 DNS 主机名，不能包含协议、用户信息、端口、路径、通配符、下划线、空标签或 IP 地址", 400, {
      field: "HOST",
      reason: "invalid_hostname"
    });
}
function yd(o = {}, e = null) {
  if (o?.enableHostPrefixProxy !== !0) return;
  const r = hi(o, e);
  if (yi(r), !(r.missingFields.length <= 0))
    throw we("HOST_PREFIX_PROXY_CONFIG_REQUIRED", "启用域名前缀代理前，必须先配置 HOST、Cloudflare Zone ID 和 API 令牌", 400, {
      missingFields: r.missingFields,
      host: r.host
    });
}
function ua(o = {}, e = null) {
  const r = hi(o, e);
  if (yi(r), r.missingFields.length <= 0) return r;
  throw we("HOST_PREFIX_DNS_CONFIG_REQUIRED", "保存域名前缀节点前，必须先配置 HOST、Cloudflare Zone ID 和 API 令牌", 400, {
    missingFields: r.missingFields,
    host: r.host
  });
}
function xn(o = [], e = {}, r = null) {
  return (Array.isArray(o) ? o : [o]).some((t) => Qe(t?.nextNode?.entryMode)) ? ua(e, r) : null;
}
var Sd = Ue.PingTimeoutMs, _d = Ue.UpstreamTimeoutMs, jn = Ue.UpstreamRetryAttempts, Si = Ue.HedgeProbePath, bd = "/emby/system/info/public", No = Ue.HedgeProbeTimeoutMs, _i = Ue.HedgeProbeParallelism, bi = Ue.HedgeWaitTimeoutMs, Ei = Ue.HedgeLockTtlMs, ia = Ue.HedgePreferredTtlSec, Ri = Ue.HedgeFailureCooldownSec, Ti = Ue.HedgeWakeJitterMs, Ed = Ue.BufferedRetryBodyMaxBytes, Rd = Ue.MetadataPrewarmTimeoutMs, Td = Ue.PrewarmCacheTtl;
Ue.DefaultPlaybackInfoMode;
var Ad = Pt.PlaybackInfoCacheTtlSec, Ai = Pt.PlaybackInfoCacheEntryMaxBytes, Cd = Pt.PlaybackInfoCacheTotalMaxBytes, Ci = Pt.VideoProgressForwardIntervalSec, wd = Pt.VideoProgressSnapshotMaxBytes, wi = Pt.CacheTtlImagesDays, Ld = Pt.PlaybackRouteHotCacheTtlMs, sr = Pt.PlaybackRouteHotCacheMax, Li = 12 * 1024 * 1024, Dd = Li - 64 * 1024, Di = 512 * 1024, Nd = 4, Io = 8 * 1024 * 1024, On = 256 * 1024, qn = 32, ns = 64, os = 64 * 1024, ss = 128, is = 8 * 1024, Rr = 4 * 1024, Id = Object.freeze([
  "displayName",
  "remark",
  "tag",
  "tagColor",
  "remarkColor",
  "secret",
  "hostPrefixCnameTarget",
  "hedgeProbePath"
]), cs = 500, Ha = 1e4, Or = 25e3, ka = 1e4, Md = 1e4, vn = 1e4, Pd = 600 * 1e3, xd = 120 * 1e3, rt = 1, Ka = 2;
function ls(o = "") {
  const e = String(o || "").trim().toUpperCase();
  return e.includes("INT") ? "INTEGER" : e.includes("CHAR") || e.includes("CLOB") || e.includes("TEXT") ? "TEXT" : e.includes("REAL") || e.includes("FLOA") || e.includes("DOUB") ? "REAL" : !e || e.includes("BLOB") ? "BLOB" : "NUMERIC";
}
var jr = /\.(?:jpg|jpeg|gif|png|svg|ico|webp)$/i, Od = /\.(?:js|css|woff2?|ttf|otf|map|webmanifest)$/i, pr = /\.(?:srt|ass|vtt|sub)$/i, qr = /(?:\/Images\/|\/Icons\/|\/Branding\/|\/emby\/covers\/)/i, bt = /\.(?:m3u8|mpd)$/i, Ni = /\.(?:ts|m4s)$/i, vd = /\.(?:mp4|m4v|m4a|ogv|webm|mkv|mov|avi|wmv|flv)$/i, Xn = /* @__PURE__ */ new Set([
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
]), Fd = /* @__PURE__ */ new Set([
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
]), Ud = /* @__PURE__ */ new Set([
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
]), Mo = "legacy_proxy_ctx", Hd = 86400, hn = [Mo, "emby_web_bypass"], kd = /* @__PURE__ */ new Set([
  "users",
  "items",
  "videos",
  "audio",
  "livetv",
  "sessions",
  "system"
]);
function Ia(o, e, r = null) {
  const t = e.headers.get("Origin"), a = e.headers.get("Access-Control-Request-Headers") || da["Access-Control-Allow-Headers"];
  return {
    "Access-Control-Allow-Origin": r || t || da["Access-Control-Allow-Origin"],
    "Access-Control-Allow-Methods": da["Access-Control-Allow-Methods"],
    "Access-Control-Allow-Headers": a,
    "Access-Control-Expose-Headers": "Content-Length, Content-Range",
    "Access-Control-Max-Age": "86400"
  };
}
function Mt(o = "") {
  if (!o) return "";
  try {
    return decodeURIComponent(o);
  } catch {
    return o;
  }
}
function ee(o) {
  let e = typeof o == "string" ? o : "/";
  return e ? (e.startsWith("/") || (e = "/" + e), e = e.replace(/^\/+/, "/"), e) : "/";
}
function ya(o = "") {
  let e = ee(o);
  for (; ; ) {
    const a = e.replace(/%([0-9a-f]{2})/gi, (n, s) => {
      const i = Number.parseInt(s, 16);
      return i <= 127 ? String.fromCharCode(i) : n;
    });
    if (a === e) break;
    e = a;
  }
  const r = [];
  for (const a of e.replace(/\\/g, "/").toLowerCase().split("/"))
    !a || a === "." || (a === ".." ? r.pop() : r.push(a));
  const t = `/${r.join("/")}`;
  return t === "/web" || t.startsWith("/web/");
}
function Sa(o = "") {
  const e = String(o || ""), r = new TextEncoder().encode(e);
  let t = "";
  for (const a of r) t += String.fromCharCode(a);
  return btoa(t).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "");
}
function Xr(o = "") {
  const e = String(o || "").trim().replace(/-/g, "+").replace(/_/g, "/");
  if (!e) return "";
  const r = e.length % 4, t = e + (r ? "=".repeat(4 - r) : ""), a = atob(t), n = Uint8Array.from(a, (s) => s.charCodeAt(0));
  return new TextDecoder().decode(n);
}
function Ii(o) {
  const e = "/admin", r = String(o || "").trim();
  if (!r) return e;
  let t = ee(r);
  return t = t.replace(/\/{2,}/g, "/"), t.length > 1 && (t = t.replace(/\/+$/, "")), !t || t === "/" || t.toLowerCase().startsWith("/api") ? e : t;
}
function Mi(o, e) {
  const r = ee(o || "/"), t = ee(e || "/");
  return r === t || r.startsWith(t + "/");
}
function Lr(o, e) {
  const r = ee(o || "/"), t = ee(e || "/");
  return !t || t === "/" ? r === t : r === t || r === `${t}/`;
}
function nt(o) {
  return Ii(o?.ADMIN_PATH);
}
function yn(o = "/admin") {
  const e = Ii(o);
  return e === "/" ? "/login" : `${e}/login`;
}
function Po(o) {
  return yn(nt(o));
}
function Kd(o) {
  const e = nt(o), r = ee(e).toLowerCase(), t = [], a = r.split("/").filter(Boolean).map((n) => Mt(n).toLowerCase());
  return a.length === 1 && a[0] && t.push({
    name: a[0],
    reservedBy: e,
    reason: "admin_path"
  }), r === "/admin" && t.push({
    name: "api",
    reservedBy: "/api/auth/login",
    reason: "legacy_admin_login"
  }), t;
}
function Bd(o, e) {
  const r = String(o || "").trim().toLowerCase();
  return r && Kd(e).find((t) => t.name === r) || null;
}
function Pi(o = {}) {
  return String(o?.name || "").trim() ? String(o?.target || "").trim() ? !0 : Array.isArray(o?.lines) && o.lines.length > 0 : !1;
}
function ds(o, e) {
  const r = Array.isArray(o) ? o : [o];
  for (const t of r) {
    if (!Pi(t) || Qe(t?.entryMode)) continue;
    const a = Bd(t?.name, e);
    if (a)
      return {
        ...a,
        name: String(t?.name || "").trim().toLowerCase()
      };
  }
  return null;
}
function $d(o = {}, e = null) {
  if (!Qe(o?.entryMode)) return null;
  const r = String(o?.name || "").trim().toLowerCase();
  if (!r) return {
    code: "HOST_PREFIX_REQUIRED",
    message: "域名前缀不能为空",
    name: r
  };
  if (!Na(r)) return {
    code: "HOST_PREFIX_INVALID",
    message: "域名前缀仅支持小写字母、数字、连字符，且不能以下划线、点或连字符结尾",
    name: r
  };
  const t = cd(e);
  if (t && t.name === r) return {
    code: "HOST_PREFIX_RESERVED_BY_LEGACY_HOST",
    message: "该域名前缀已被旧部署子域兼容入口保留，请更换后重试",
    name: r,
    reservedBy: t.reservedBy,
    reason: t.reason,
    legacyHost: t.legacyHost,
    host: t.host
  };
  const a = pi(o?.hostPrefixCnameTarget);
  return a ? {
    code: "HOST_PREFIX_CNAME_TARGET_INVALID",
    message: a,
    field: "hostPrefixCnameTarget",
    value: String(o?.hostPrefixCnameTarget || "").trim(),
    name: r
  } : null;
}
function us(o, e = null) {
  const r = Array.isArray(o) ? o : [o];
  for (const t of r) {
    if (!Pi(t)) continue;
    const a = $d(t, e);
    if (a) return a;
  }
  return null;
}
function zd(o) {
  const e = nt(o);
  return e === "/" ? "/" : e;
}
function Te(o) {
  return String(o ?? "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#39;");
}
function Yr(o) {
  return JSON.stringify(o).replace(/</g, "\\u003c").replace(/>/g, "\\u003e").replace(/&/g, "\\u0026").replace(/\u2028/g, "\\u2028").replace(/\u2029/g, "\\u2029");
}
function ke(o, e = null) {
  const r = [];
  o?.JWT_SECRET || r.push("JWT_SECRET"), o?.ADMIN_PASS || r.push("ADMIN_PASS");
  const t = typeof e?.adminPath == "string" ? e.adminPath : nt(o), a = typeof e?.loginPath == "string" ? e.loginPath : yn(t);
  return {
    ok: r.length === 0,
    missing: r,
    adminPath: t,
    loginPath: a,
    message: r.length ? `系统未初始化：缺少 ${r.join("、")}。` : "系统初始化检查通过。"
  };
}
function xi(o, e = null) {
  const r = ke(o, e);
  if (r.ok) return r;
  const t = r.missing.join("|") || "unknown";
  return Je.InitCheckWarnedFingerprints.has(t) || (Je.InitCheckWarnedFingerprints.size >= 32 && Je.InitCheckWarnedFingerprints.clear(), Je.InitCheckWarnedFingerprints.add(t), console.warn(`[Init Check] ${r.message} 管理入口: ${r.adminPath}`)), r;
}
function Yn(o) {
  if (!o || o.ok) return "";
  const e = Array.isArray(o.missing) && o.missing.length ? o.missing.map((r) => `<code class="rounded bg-amber-100/80 px-1.5 py-0.5 text-[11px] font-semibold text-amber-700">${Te(r)}</code>`).join(" ") : '<code class="rounded bg-amber-100/80 px-1.5 py-0.5 text-[11px] font-semibold text-amber-700">UNKNOWN</code>';
  return `<div id="init-health-banner" class="mx-4 mt-4 rounded-2xl border border-amber-200 bg-amber-50/95 px-4 py-3 text-sm text-amber-900 shadow-sm"><div class="flex flex-col gap-1 md:flex-row md:items-center md:justify-between"><div class="font-semibold">系统未初始化</div><div class="text-xs text-amber-700">管理入口：${Te(o.adminPath || "/admin")}</div></div><p class="mt-2 leading-6">检测到关键环境变量缺失：${e}</p><p class="mt-1 text-xs leading-5 text-amber-700">请先在 Cloudflare Worker 环境变量中补齐后再使用管理台登录与敏感操作。</p></div>`;
}
function ca(o) {
  return String(o?.cf?.colo || "").trim().toUpperCase() || "UNKNOWN";
}
function Ja(o) {
  return oi(String(o?.headers?.get?.("CF-RAY") || o?.headers?.get?.("cf-ray") || "").trim());
}
function Wd(o) {
  return String(o?.cf?.country || "").trim().toUpperCase() || "UNKNOWN";
}
function Gd(o) {
  const e = Wd(o);
  return {
    countryCode: e,
    countryName: ql(e)
  };
}
function Vd(o = {}, e = {}) {
  const { statusPort: r } = o, t = '<!DOCTYPE html><html lang="zh-CN"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0, viewport-fit=cover"><link rel="icon" href="/favicon.ico" sizes="any"><title>Emby Proxy Admin Shell</title><script id="admin-bootstrap" type="application/json">__ADMIN_BOOTSTRAP_JSON__<\/script><style>:root{color-scheme:dark}*{box-sizing:border-box}body{margin:0;min-height:100vh;background:radial-gradient(circle at top,#0f172a 0,#020617 44%,#020617 100%);color:#e2e8f0;font-family:Inter,ui-sans-serif,system-ui,-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif}a{color:inherit;text-decoration:none}.admin-fallback-shell{min-height:100vh;display:flex;align-items:center;justify-content:center;padding:32px 18px}.admin-fallback-card{width:min(100%,980px);border:1px solid rgba(51,65,85,.92);border-radius:30px;background:rgba(15,23,42,.94);box-shadow:0 32px 96px rgba(2,6,23,.52);padding:28px;backdrop-filter:blur(20px)}.admin-fallback-pill{display:inline-flex;align-items:center;gap:8px;border-radius:999px;padding:8px 14px;background:rgba(59,130,246,.12);border:1px solid rgba(96,165,250,.32);color:#bfdbfe;font-size:12px;font-weight:700;letter-spacing:.14em;text-transform:uppercase}.admin-fallback-title{margin:20px 0 0;font-size:clamp(1.9rem,4vw,3rem);line-height:1.08;color:#fff}.admin-fallback-copy{margin:14px 0 0;max-width:54rem;color:#cbd5e1;font-size:15px;line-height:1.8}.admin-fallback-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(220px,1fr));gap:14px;margin-top:24px}.admin-fallback-stat{border:1px solid rgba(51,65,85,.9);border-radius:22px;background:rgba(2,6,23,.48);padding:16px}.admin-fallback-k{font-size:12px;font-weight:700;letter-spacing:.14em;text-transform:uppercase;color:#64748b}.admin-fallback-v{margin-top:10px;font-size:15px;line-height:1.7;color:#f8fafc;word-break:break-word}.admin-fallback-actions{display:flex;flex-wrap:wrap;gap:12px;margin-top:24px}.admin-fallback-btn{display:inline-flex;align-items:center;justify-content:center;border-radius:16px;padding:12px 18px;font-size:14px;font-weight:700;transition:transform .18s ease,background-color .18s ease,border-color .18s ease}.admin-fallback-btn:hover{transform:translateY(-1px)}.admin-fallback-btn-primary{background:#2563eb;color:#fff;border:1px solid rgba(147,197,253,.7);box-shadow:0 12px 28px rgba(37,99,235,.24)}.admin-fallback-btn-primary:hover{background:#1d4ed8;border-color:#93c5fd}.admin-fallback-btn-secondary{background:rgba(15,23,42,.5);color:#e2e8f0;border:1px solid rgba(51,65,85,.95)}.admin-fallback-btn-secondary:hover{background:rgba(30,41,59,.85)}.admin-fallback-panel{margin-top:24px;border:1px solid rgba(51,65,85,.9);border-radius:24px;background:rgba(2,6,23,.4);padding:20px}.admin-fallback-panel h2{margin:0;font-size:15px;color:#fff}.admin-fallback-panel p{margin:10px 0 0;font-size:14px;line-height:1.7;color:#cbd5e1}.admin-fallback-panel details{margin-top:16px}.admin-fallback-panel summary{cursor:pointer;color:#93c5fd;font-weight:700}.admin-fallback-panel pre{overflow:auto;margin:12px 0 0;padding:14px;border-radius:18px;background:#020617;color:#cbd5e1;font-size:12px;line-height:1.6}.admin-fallback-note{margin-top:16px;color:#94a3b8;font-size:13px;line-height:1.7}@media (max-width:640px){.admin-fallback-shell{padding:18px 12px}.admin-fallback-card,.admin-fallback-stat,.admin-fallback-panel{border-radius:22px}.admin-fallback-card{padding:22px}.admin-fallback-actions{flex-direction:column}.admin-fallback-btn{width:100%}}</style></head><body><main class="admin-fallback-shell"><section class="admin-fallback-card"><div class="admin-fallback-pill">Admin Shell</div><h1 class="admin-fallback-title">管理台壳层正在处理中</h1><p class="admin-fallback-copy">Worker 继续负责管理台壳、登录与统一后台 API；页面主体会根据当前状态注入设置页、远端壳或错误态内容。</p>__INIT_HEALTH_BANNER____ADMIN_APP_ROOT__</section></main></body></html>';
  let a = -1;
  const n = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64">
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
  function i(B = "GET") {
    const V = new Headers({
      "Content-Type": "image/svg+xml;charset=UTF-8",
      "Cache-Control": "public, max-age=86400, s-maxage=604800, immutable"
    });
    return Ce(V), new Response(B === "HEAD" ? null : n, { headers: V });
  }
  const c = Object.freeze([
    "__ADMIN_BOOTSTRAP_JSON__",
    "__INIT_HEALTH_BANNER__",
    "__ADMIN_APP_ROOT__"
  ]), l = "embedded-fallback-v1", d = m(t), u = "minimal-split-parts", f = !0;
  function m(B = "") {
    const V = String(B || ""), q = [];
    let X = 0;
    for (const Y of c) {
      const ae = V.indexOf(Y, X);
      if (ae < 0) throw new Error(`missing admin html placeholder: ${Y}`);
      q.push(V.slice(X, ae)), X = ae + Y.length;
    }
    return q.push(V.slice(X)), q;
  }
  function p(B = [], V = {}) {
    let q = String(B[0] || "");
    for (let X = 0; X < c.length; X += 1) {
      const Y = c[X];
      q += String(V[Y] || ""), q += String(B[X + 1] || "");
    }
    return q;
  }
  const g = "__ADMIN_BOOTSTRAP_JSON__", h = "__INIT_HEALTH_BANNER__", y = "__ADMIN_APP_ROOT__", S = "", _ = "https://admin-shell-cache.invalid", A = "private, no-store, max-age=0", b = "public, max-age=31536000, immutable", E = 300 * 1e3, R = 2 * 1024 * 1024, L = "bootstrap-tailwind-assets-v3-active-index", T = "X-Admin-Shell-Cached-At", D = "X-Admin-Shell-Source-Etag", w = "X-Admin-Shell-Source-Last-Modified", M = "X-Admin-Shell-Source-Hash", x = "__release", C = "vendor", F = "__warm", W = "https://admin-release-vendor-cache.invalid", O = "https://admin-release-vendor-manifest.invalid", N = "public, max-age=31536000, immutable", I = "no-store, max-age=0", P = 8 * 1024 * 1024, H = 3, G = "X-Admin-Release-Vendor-Cached-At", $ = "X-Admin-Release-Vendor-Source-Hash", K = Object.freeze([
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
  ]), se = Object.freeze([
    "ui",
    "proxy",
    "security",
    "logs",
    "account"
  ]);
  function me() {
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
      primaryViews: [...K],
      settings: {
        visualSections: [...j],
        saveGroups: [...se]
      }
    };
  }
  function pe(B, V = ke(B), q = {}) {
    return {
      adminPath: nt(B),
      loginPath: Po(B),
      initHealth: V,
      hostDomain: ze(B),
      contract: me(),
      shell: st(B, V, q)
    };
  }
  function le() {
    if (a >= 0) return a;
    if (!Array.isArray(d) || d.length !== c.length + 1)
      return a = 0, 0;
    const B = new TextEncoder();
    let V = 0;
    for (let q = 0; q < d.length; q += 1)
      V += B.encode(String(d[q] || "")).length, q < c.length && (V += B.encode(c[q]).length);
    return a = V, a;
  }
  function ge(B = !1, V = "") {
    const q = String(V || "").trim().toLowerCase();
    return B ? "remote_ready" : q === "setup_required" ? "setup_required" : "embedded_only";
  }
  function Oe(B = !1, V = f) {
    return B ? V ? "embedded_fallback_retained" : "legacy_inline_shell_active" : "embedded_fallback_missing";
  }
  function We(B = "embedded", V = "") {
    return String(B || "").trim().toLowerCase() === "gate" || String(V || "").trim() === "setup_gate" ? "setup_gate" : String(B || "").trim().toLowerCase() === "remote" ? "remote_shell" : String(V || "").trim() === "embedded_fallback" ? "embedded_fallback" : "embedded_shell";
  }
  function vt(B = !1, V = "") {
    return B ? String(V || "").trim() === "embedded_fallback" ? "active" : "retained" : "missing";
  }
  function st(B, V = ke(B), q = {}) {
    const X = gt(B, q), Y = X.indexUrl, ae = le(), he = !!Y, ve = !!(B?.ASSETS && typeof B.ASSETS.fetch == "function"), $e = !he && ve ? "shell_ready" : X.gateState, Me = ae > 0;
    let Ve = "";
    if (Y) try {
      Ve = new URL(Y).origin;
    } catch {
      Ve = "";
    }
    return {
      mode: he ? "remote-preferred" : ve ? "embedded" : "setup_required",
      lifecycleState: ge(he, $e),
      embeddedFallbackState: Me ? "retained" : "missing",
      retirementState: Oe(Me),
      gateState: $e,
      indexUrl: X.indexUrl,
      indexUrlSource: X.indexUrlSource,
      effectiveRef: X.effectiveRef,
      remoteShellConfigured: he,
      remoteShellIndexUrl: Y,
      remoteShellOrigin: Ve,
      bundledShellAvailable: ve,
      bundledShellSource: ve ? "frontend/dist/index.html" : "",
      initHealthOk: V?.ok === !0,
      embeddedFallbackAvailable: Me,
      embeddedTemplateSource: u,
      embeddedTemplateMode: u,
      embeddedTemplateBytes: ae,
      finalUiHtmlRetired: f
    };
  }
  function Ft(B, V = {}) {
    return gt(B, V).indexUrl;
  }
  function Ut(B = {}) {
    const V = U(B.shellState) ? B.shellState : {}, q = U(B.initHealth) ? B.initHealth : {}, X = U(B.indexState) ? B.indexState : {}, Y = String(B.remoteShellIndexUrl || V.remoteShellIndexUrl || X.indexUrl || "").trim(), ae = String(B.mode || "").trim().toLowerCase(), he = ae === "remote" ? "remote" : ae === "gate" ? "gate" : "embedded", ve = V.remoteShellConfigured === !0 || !!Y, $e = V.embeddedFallbackAvailable === !0, Me = V.finalUiHtmlRetired !== !1, Ve = String(B.routeState || "").trim() || (he === "remote" ? "remote_active" : he === "gate" ? "setup_gate" : "embedded_active"), Ct = String(B.lifecycleState || V.lifecycleState || "").trim() || ge(ve, B.gateState || V.gateState || X.gateState || ""), dt = String(B.embeddedFallbackState || V.embeddedFallbackState || "").trim() || vt($e, Ve), br = String(B.retirementState || V.retirementState || "").trim() || Oe($e, Me), aa = String(B.gateState || V.gateState || X.gateState || (Y ? "shell_ready" : "setup_required")).trim() || "setup_required";
    return {
      ...V,
      mode: he,
      effectiveMode: We(he, Ve),
      gateState: aa,
      lifecycleState: Ct,
      embeddedFallbackState: dt,
      retirementState: br,
      sourceType: String(B.sourceType || "").trim().toLowerCase() || (he === "remote" ? "remote_fetch" : he === "gate" ? "setup_gate" : "embedded_local"),
      routeState: Ve,
      indexUrl: String(B.indexUrl || V.indexUrl || X.indexUrl || Y).trim(),
      indexUrlSource: String(B.indexUrlSource || V.indexUrlSource || X.indexUrlSource || "").trim(),
      effectiveRef: String(B.effectiveRef || V.effectiveRef || X.effectiveRef || "").trim(),
      effectiveRefType: String(B.effectiveRefType || V.effectiveRefType || X.effectiveRefType || "").trim(),
      remoteShellIndexUrl: Y,
      remoteShellOrigin: String(V.remoteShellOrigin || "").trim(),
      remoteCacheState: String(B.remoteCacheState || "").trim().toLowerCase(),
      revalidateDue: B.revalidateDue === !0,
      lastFetchStatus: String(B.lastFetchStatus || "").trim().toLowerCase(),
      reason: String(B.reason || "").trim(),
      requestPath: String(B.requestPath || "").trim(),
      initHealthOk: q.ok === !0,
      initHealthMissing: [...new Set((Array.isArray(q.missing) ? q.missing : []).map((va) => String(va || "").trim()).filter(Boolean))],
      fallbackRetained: $e,
      templateMode: String(V.embeddedTemplateMode || V.embeddedTemplateSource || "").trim() || u,
      finalUiHtmlRetired: Me,
      updatedAt: String(B.updatedAt || "").trim() || (/* @__PURE__ */ new Date()).toISOString()
    };
  }
  async function ea(B, V = {}, q = null) {
    const X = U(V.shellState) ? V.shellState : st(B, V.initHealth, V.config || {}), Y = Ut({
      ...V,
      shellState: X
    }), ae = r.resolveOpsStatusStores(B).db, { updatedAt: he, ...ve } = Y, $e = ce(Q(ve)), Me = ae ? Z.AdminShellStatusWriteState.get(ae) : null, Ve = Math.max(1e3, Number(v.Defaults.AdminShellStatusStableWriteIntervalMs) || 1e3);
    if (V.throttleStableWrites === !0 && Me?.fingerprint === $e) {
      if (Me.writePromise) return Me.writePromise;
      if (k() - (Number(Me.writtenAt) || 0) < Ve) return null;
    }
    const Ct = ye(Promise.resolve(r.patchOpsStatus(B, { adminShell: Y }, q)).then((dt) => ({
      ok: !0,
      result: dt
    })), "admin.shell_status_patch", {
      requestPath: Y.requestPath,
      mode: Y.mode,
      sourceType: Y.sourceType
    }, {
      ok: !1,
      result: null
    }).then((dt) => (!ae || Z.AdminShellStatusWriteState.get(ae)?.writePromise !== Ct || (dt?.ok === !0 ? Z.AdminShellStatusWriteState.set(ae, {
      fingerprint: $e,
      writtenAt: k(),
      writePromise: null
    }) : Me ? Z.AdminShellStatusWriteState.set(ae, Me) : Z.AdminShellStatusWriteState.delete(ae)), dt?.result ?? null));
    return ae && Z.AdminShellStatusWriteState.set(ae, {
      fingerprint: $e,
      writtenAt: 0,
      writePromise: Ct
    }), Ct;
  }
  function Ht(B = {}, V, q = {}, X = ke(V)) {
    const Y = U(B) ? B : {}, ae = gt(V, q), he = st(V, X, q);
    return {
      ...Y,
      adminShell: Ut({
        ...U(Y.adminShell) ? Y.adminShell : {},
        shellState: he,
        initHealth: X,
        indexState: ae,
        remoteShellIndexUrl: ae.indexUrl,
        gateState: ae.gateState,
        indexUrl: ae.indexUrl,
        indexUrlSource: ae.indexUrlSource,
        effectiveRef: ae.effectiveRef,
        effectiveRefType: ae.effectiveRefType,
        mode: U(Y.adminShell) && String(Y.adminShell.mode || "").trim() ? Y.adminShell.mode : ae.indexUrl ? "remote" : "gate",
        routeState: U(Y.adminShell) && String(Y.adminShell.routeState || "").trim() ? Y.adminShell.routeState : ae.indexUrl ? "remote_ready_idle" : "setup_gate",
        sourceType: U(Y.adminShell) && String(Y.adminShell.sourceType || "").trim() ? Y.adminShell.sourceType : ae.indexUrl ? "runtime_status" : "setup_gate"
      })
    };
  }
  function yr(B = "") {
    const V = String(B || "").trim();
    if (!V) return "已上传的管理台 HTML 暂时不可用，请重新上传。";
    if (V.startsWith("remote_shell_render_failed")) {
      const q = V.replace(/^remote_shell_render_failed:\s*/i, "").trim();
      return q ? `Worker 读取 index.html 失败：${q}` : "Worker 读取 index.html 失败。";
    }
    return V;
  }
  function kt(B = {}, V = {}, q = {}, X = {}) {
    const Y = String(B.adminPath || "/admin").trim() || "/admin", ae = String(X.remoteShellIndexUrl || V.remoteShellIndexUrl || "").trim(), he = yr(X.reason || ""), ve = `${Y}?setup=1`;
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
            <p class="admin-remote-error-desc">${Te(he)}</p>
          </div>
          <div class="admin-remote-error-body">
            <div class="admin-remote-error-grid">
              <article class="admin-remote-error-stat"><div class="admin-remote-error-k">错误原因</div><div class="admin-remote-error-v">${Te(he)}</div></article>
              <article class="admin-remote-error-stat"><div class="admin-remote-error-k">本地版本标识</div><div class="admin-remote-error-v">${Te(ae || "未找到本地 HTML 版本")}</div></article>
            </div>
            <div class="admin-remote-error-actions">
              <a href="${Te(Y)}" class="admin-remote-error-btn admin-remote-error-btn-primary">刷新 /admin</a>
              <a href="${Te(ve)}" class="admin-remote-error-btn admin-remote-error-btn-secondary">重新上传 index.html</a>
            </div>
            <p class="admin-remote-error-note">如果这里继续报错，请重新上传与当前 Worker 匹配的 index.html。</p>
          </div>
        </section>
      </div>`;
  }
  function it(B = {}, V = {}, q = {}, X = {}, Y = {}) {
    const ae = String(B.adminPath || "/admin").trim() || "/admin", he = Y?.isLocalUpload === !0, ve = Yr({ adminPath: ae });
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
        const ADMIN_INDEX_GATE_RUNTIME = ${ve};
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
  function ta(B = "{}", V = "", q = S) {
    return !Array.isArray(d) || d.length !== c.length + 1 ? "" : p(d, {
      [g]: String(B || "{}"),
      [h]: String(V || ""),
      [y]: String(q || S)
    });
  }
  function Sr(B = {}, V = null, q = S) {
    const X = U(B) ? B : {}, Y = U(V) ? V : U(X.initHealth) ? X.initHealth : {}, ae = {
      templateRevision: String(l).trim() || "admin-shell",
      adminPath: String(X.adminPath || "").trim(),
      loginPath: String(X.loginPath || "").trim(),
      hostDomain: te(X.hostDomain),
      contractHash: ce(Q(X.contract || me())),
      initHealthOk: Y.ok === !0,
      initHealthMissing: [...new Set((Array.isArray(Y.missing) ? Y.missing : []).map((he) => String(he || "").trim()).filter(Boolean))],
      appRootHash: ce(String(q || S))
    };
    return `${ae.templateRevision}-${ce(Q(ae))}`;
  }
  function ct(B = "") {
    return `"${String(B || "").trim()}"`;
  }
  function lt(B = "") {
    return String(B || "").trim().replace(/^W\//i, "").replace(/^"(.*)"$/, "$1");
  }
  function qt(B, V = "") {
    const q = String(B?.headers?.get?.("If-None-Match") || "").trim(), X = lt(V);
    return !q || !X ? !1 : q.split(",").some((Y) => {
      const ae = lt(Y);
      return ae === "*" || ae === X;
    });
  }
  function Tt(B, V = "") {
    const q = B instanceof Request ? new URL(B.url) : new URL(String(B || ""), _), X = new URL(q.pathname, _);
    return X.searchParams.set("remote", ce(String(V || "").trim())), new Request(X.toString(), { method: "GET" });
  }
  function At(B, V = "", q = {}) {
    const X = Tt(B, V), Y = new URL(X.url);
    return Y.searchParams.set("transform", L), Y.searchParams.set("bootstrap", ce(Q(U(q) ? q : {}))), new Request(Y.toString(), { method: "GET" });
  }
  function _r(B = "", V = "no-store, max-age=0") {
    const q = new Headers({
      "Content-Type": "text/html;charset=UTF-8",
      "Cache-Control": String(V || "no-store, max-age=0")
    });
    return Ce(q), B && q.set("ETag", ct(B)), q;
  }
  function Xt(B = "") {
    const V = String(B || "").trim();
    if (!V) return "";
    const q = Date.parse(V);
    return Number.isFinite(q) ? new Date(q).toUTCString() : "";
  }
  function Ie(B, V = "") {
    const q = String(B?.headers?.get?.("If-Modified-Since") || "").trim(), X = Xt(V);
    if (!q || !X) return !1;
    const Y = Date.parse(q), ae = Date.parse(X);
    return !Number.isFinite(Y) || !Number.isFinite(ae) ? !1 : Y >= ae;
  }
  function ra(B, V) {
    return String(B?.headers?.get?.("If-None-Match") || "").trim() ? qt(B, V?.headers?.get?.("ETag") || "") : Ie(B, V?.headers?.get?.("Last-Modified") || "");
  }
  function Ge(B, V = "no-store, max-age=0") {
    const q = new Headers({ "Cache-Control": String(V || "no-store, max-age=0") }), X = lt(B?.headers?.get?.("ETag") || ""), Y = Xt(B?.headers?.get?.("Last-Modified") || "");
    X && q.set("ETag", ct(X)), Y && q.set("Last-Modified", Y);
    const ae = String(B?.headers?.get?.("X-Admin-Shell-Revision") || "").trim();
    return ae && q.set("X-Admin-Shell-Revision", ae), Ce(q), new Response(null, {
      status: 304,
      headers: q
    });
  }
  return {
    ADMIN_FALLBACK_HTML_TEMPLATE: t,
    cachedAdminTemplateBytes: a,
    SITE_FAVICON_SVG: n,
    LANDING_PAGE_STYLE_HTML: s,
    renderFaviconResponse: i,
    ADMIN_HTML_DYNAMIC_PLACEHOLDERS: c,
    ADMIN_HTML_VARIANT_ETAG: l,
    ADMIN_HTML_PARTS_PLAIN: d,
    ADMIN_EMBEDDED_TEMPLATE_MODE: u,
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
    ADMIN_REMOTE_SHELL_REVALIDATE_MS: E,
    ADMIN_REMOTE_SHELL_MAX_BYTES: R,
    ADMIN_REMOTE_SHELL_TRANSFORM_REVISION: L,
    ADMIN_REMOTE_SHELL_CACHED_AT_HEADER: T,
    ADMIN_REMOTE_SHELL_SOURCE_ETAG_HEADER: D,
    ADMIN_REMOTE_SHELL_SOURCE_LAST_MODIFIED_HEADER: w,
    ADMIN_REMOTE_SHELL_SOURCE_HASH_HEADER: M,
    ADMIN_RELEASE_PROXY_PATH_SEGMENT: x,
    ADMIN_RELEASE_VENDOR_PATH_SEGMENT: C,
    ADMIN_WARM_PATH_SEGMENT: F,
    ADMIN_RELEASE_VENDOR_CACHE_KEY_ORIGIN: W,
    ADMIN_RELEASE_VENDOR_MANIFEST_CACHE_KEY_ORIGIN: O,
    ADMIN_RELEASE_VENDOR_CACHE_CONTROL: N,
    ADMIN_RELEASE_VENDOR_MUTABLE_CACHE_CONTROL: I,
    ADMIN_RELEASE_VENDOR_MAX_BYTES: P,
    ADMIN_WARM_VENDOR_CONCURRENCY: H,
    ADMIN_RELEASE_VENDOR_CACHED_AT_HEADER: G,
    ADMIN_RELEASE_VENDOR_SOURCE_HASH_HEADER: $,
    ADMIN_PRIMARY_VIEWS: K,
    ADMIN_SETTINGS_VISUAL_SECTIONS: j,
    ADMIN_SETTINGS_SAVE_GROUPS: se,
    buildAdminUiContract: me,
    buildAdminBootstrapPayload: pe,
    measureAdminShellTemplateBytes: le,
    buildAdminShellLifecycleState: ge,
    buildAdminShellRetirementState: Oe,
    buildAdminShellEffectiveMode: We,
    buildAdminEmbeddedFallbackRuntimeState: vt,
    buildAdminShellState: st,
    resolveAdminShellIndexUrl: Ft,
    normalizeAdminShellRuntimeStatus: Ut,
    patchAdminShellRuntimeStatus: ea,
    withAdminShellRuntimeStatus: Ht,
    describeAdminRemoteShellFailureReason: yr,
    buildAdminRemoteShellErrorContent: kt,
    buildAdminIndexSetupContent: it,
    renderAdminHtmlShell: ta,
    buildAdminHtmlVariantEtag: Sr,
    formatAdminHtmlEtag: ct,
    normalizeEtagToken: lt,
    requestHasMatchingEtag: qt,
    buildAdminRemoteShellLegacyCacheKeyRequest: Tt,
    buildAdminRemoteShellCacheKeyRequest: At,
    buildAdminHtmlResponseHeaders: _r,
    normalizeAdminHttpDateHeader: Xt,
    requestHasMatchingLastModified: Ie,
    requestMatchesAdminHtmlResponse: ra,
    buildConditionalNotModifiedResponseFromStoredResponse: Ge
  };
}
function jd(o = {}, e = {}) {
  function r(N = "{}") {
    return `${s(N)}${t}`;
  }
  const t = '<script id="admin-bootstrap-loader">try{window.__ADMIN_BOOTSTRAP__=JSON.parse(document.getElementById("admin-bootstrap")?.textContent||"{}")}catch(_){window.__ADMIN_BOOTSTRAP__=window.__ADMIN_BOOTSTRAP__||{},window.__ADMIN_UI_BOOT_ERROR__=window.__ADMIN_UI_BOOT_ERROR__||"admin bootstrap parse failed: "+(_?.message||String(_||"unknown_error"))}<\/script>', a = '<script id="admin-tailwind-prelude">window.tailwind=window.tailwind||{};<\/script>', n = /* @__PURE__ */ new Set([
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
  function c(N, I) {
    let P = "";
    for (let H = I; H < N.length; H += 1) {
      const G = N[H];
      if (P)
        G === P && (P = "");
      else if (G === '"' || G === "'") P = G;
      else if (G === ">") return H;
    }
    return -1;
  }
  function l(N, I) {
    let P = I + 1;
    if (!/[A-Za-z]/.test(N[P] || "")) return null;
    const H = c(N, P);
    if (H < 0) return null;
    const G = P;
    for (; P < H && !i(N[P]) && N[P] !== "/"; ) P += 1;
    const $ = N.slice(G, P).toLowerCase(), K = /* @__PURE__ */ new Map();
    for (; P < H; ) {
      for (; P < H && i(N[P]); ) P += 1;
      if (P >= H) break;
      if (N[P] === "/") {
        P += 1;
        continue;
      }
      const j = P;
      for (; P < H && !i(N[P]) && N[P] !== "=" && N[P] !== "/"; ) P += 1;
      if (P === j) {
        P += 1;
        continue;
      }
      const se = N.slice(j, P).toLowerCase();
      for (; P < H && i(N[P]); ) P += 1;
      let me = "", pe = !1, le = -1, ge = -1;
      if (N[P] === "=") {
        for (P += 1; P < H && i(N[P]); ) P += 1;
        const Oe = N[P];
        if (Oe === '"' || Oe === "'") {
          for (pe = !0, P += 1, le = P; P < H && N[P] !== Oe; ) P += 1;
          ge = P, me = N.slice(le, ge), P < H && (P += 1);
        } else {
          for (le = P; P < H && !i(N[P]); ) P += 1;
          ge = P, me = N.slice(le, ge);
        }
      }
      K.has(se) || K.set(se, {
        value: me,
        quoted: pe,
        valueStart: le,
        valueEnd: ge
      });
    }
    return {
      tagName: $,
      attributes: K,
      start: I,
      tagEnd: H
    };
  }
  function d(N, I, P, H) {
    const G = `</${P}`;
    let $ = H;
    for (; $ < N.length; ) {
      const K = I.indexOf(G, $);
      if (K < 0) return null;
      const j = N[K + G.length] || "";
      if (!j || i(j) || j === "/" || j === ">") {
        const se = c(N, K + G.length);
        return se >= 0 ? {
          start: K,
          tagEnd: se
        } : null;
      }
      $ = K + G.length;
    }
    return null;
  }
  function* u(N = "") {
    const I = String(N || ""), P = I.toLowerCase();
    let H = 0;
    for (; H < I.length; ) {
      const G = I.indexOf("<", H);
      if (G < 0) return;
      if (I.startsWith("<!--", G)) {
        const pe = I.indexOf("-->", G + 4);
        H = pe < 0 ? I.length : pe + 3;
        continue;
      }
      const $ = I[G + 1] || "";
      if ($ === "!" || $ === "?" || $ === "/") {
        const pe = c(I, G + 2);
        if (pe < 0) return;
        H = pe + 1;
        continue;
      }
      const K = l(I, G);
      if (!K) {
        if (/[A-Za-z]/.test($)) return;
        H = G + 1;
        continue;
      }
      const j = K.tagEnd + 1, se = n.has(K.tagName) ? d(I, P, K.tagName, j) : null, me = se ? se.start : j;
      if (H = se ? se.tagEnd + 1 : j, yield {
        ...K,
        contentStart: j,
        contentEnd: se || !n.has(K.tagName) ? me : I.length,
        contentTagEnd: se ? se.tagEnd : -1,
        contentClosed: !!se || !n.has(K.tagName)
      }, n.has(K.tagName) && !se) return;
    }
  }
  function f(N = "", I = "") {
    const P = String(N || ""), H = String(I || "");
    if (!P || !H) return P;
    let G = -1;
    for (const $ of u(P)) {
      if ($.tagName === "head") {
        const K = $.tagEnd + 1;
        return `${P.slice(0, K)}${H}${P.slice(K)}`;
      }
      $.tagName === "body" && G < 0 && (G = $.tagEnd + 1);
    }
    return G >= 0 ? `${P.slice(0, G)}${H}${P.slice(G)}` : `${H}${P}`;
  }
  function m(N = "") {
    const I = String(N || "");
    if (!I) return I;
    let P = -1;
    for (const H of u(I)) {
      if (H.tagName !== "script" || !H.contentClosed) continue;
      if (H.attributes.get("id")?.value === "admin-tailwind-prelude") return I;
      if (P >= 0 || H.attributes.has("src")) continue;
      const G = I.slice(H.contentStart, H.contentEnd);
      /\btailwind\s*\.\s*config\s*=/i.test(G) && (P = H.start);
    }
    return P < 0 ? I : `${I.slice(0, P)}${a}${I.slice(P)}`;
  }
  function p(N = "", I = "{}") {
    const P = m(String(N || ""));
    if (!P) return P;
    const H = s(I);
    let G = null, $ = null;
    for (const K of u(P)) {
      if (K.tagName !== "script" || !K.contentClosed) continue;
      const j = String(K.attributes.get("id")?.value || "").trim();
      j === "admin-bootstrap" && String(K.attributes.get("type")?.value || "").trim().toLowerCase() === "application/json" ? G = K : j === "admin-bootstrap-loader" && ($ = K);
    }
    if (G && G.contentTagEnd >= G.tagEnd) {
      const K = P.slice(0, G.start), j = P.slice(G.contentTagEnd + 1);
      return `${K}${H}${$ ? "" : t}${j}`;
    }
    return $ ? `${P.slice(0, $.start)}${H}${P.slice($.start)}` : f(P, r(I));
  }
  function g(N) {
    const I = String(N?.tagName || "").trim().toLowerCase();
    let P = "", H = "";
    if (I === "script" && N.attributes?.has("src"))
      P = "src", H = "script";
    else if (I === "link" && N.attributes?.has("href")) {
      const j = new Set(String(N.attributes.get("rel")?.value || "").trim().toLowerCase().split(/\s+/).filter(Boolean)), se = String(N.attributes.get("as")?.value || "").trim().toLowerCase();
      j.has("stylesheet") ? H = "css" : j.has("modulepreload") ? H = "script" : (j.has("preload") || j.has("prefetch")) && se === "style" ? H = "css" : (j.has("preload") || j.has("prefetch")) && se === "script" && (H = "script"), H && (P = "href");
    }
    if (!P || !H) return null;
    const G = N.attributes.get(P), $ = Number(G?.valueStart), K = Number(G?.valueEnd);
    return !Number.isInteger($) || !Number.isInteger(K) || $ < 0 || K < $ ? null : {
      rawValue: String(G?.value || ""),
      assetKind: H,
      valueStart: $,
      valueEnd: K
    };
  }
  function h(N = "") {
    const I = [];
    for (const P of u(N)) {
      const H = g(P);
      H && I.push(H);
    }
    return I;
  }
  function y(N = "") {
    for (const I of u(N))
      if (I.tagName === "script" && String(I.attributes.get("type")?.value || "").trim().toLowerCase() === "importmap")
        return !0;
    return !1;
  }
  function S(N = "", I = "") {
    const P = String(N || "");
    if (!P) return [];
    let H = null;
    try {
      H = new URL(String(I || "").trim());
    } catch {
      H = null;
    }
    const G = [];
    for (const $ of h(P)) {
      const K = String($.rawValue || "").trim();
      if (!(!K || /^data:/i.test(K) || /^javascript:/i.test(K)))
        try {
          const j = H ? new URL(K, H).toString() : new URL(K).toString();
          G.push({
            rawValue: K,
            normalizedUrl: j,
            assetKind: $.assetKind
          });
        } catch {
          continue;
        }
    }
    return G.filter(($, K, j) => j.findIndex((se) => se.normalizedUrl === $.normalizedUrl) === K);
  }
  function _(N = "", I = "") {
    return S(N, I).map((P) => P.normalizedUrl);
  }
  function A(N = "") {
    return String(N || "").replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  }
  function b(N = "", I = "") {
    const P = String(N || "").trim(), H = String(I || "").trim().toLowerCase() === "css" ? "css" : "js";
    return P ? `${ce(P)}.${H}` : "";
  }
  function E(N = "/admin", I = "", P = "") {
    const H = ee(N || "/admin").replace(/\/+$/, "") || "/admin", G = pt(I), $ = String(P || "").trim();
    return !G || !$ ? "" : `${H}/${e.ADMIN_RELEASE_PROXY_PATH_SEGMENT}/${encodeURIComponent(G)}/${e.ADMIN_RELEASE_VENDOR_PATH_SEGMENT}/${encodeURIComponent($)}`;
  }
  function R(N = "", I = {}) {
    const P = S(N, I.baseUrl || I.sourceUrl || "").map((H) => ({
      assetKey: b(H.normalizedUrl, H.assetKind),
      assetKind: H.assetKind,
      upstreamUrl: H.normalizedUrl
    })).filter((H) => H.assetKey && H.upstreamUrl).filter((H, G, $) => $.findIndex((K) => K.assetKey === H.assetKey) === G);
    return {
      version: 1,
      releaseTag: pt(I.releaseTag),
      sourceUrl: xr(I.sourceUrl || I.baseUrl || ""),
      entries: P
    };
  }
  function L(N = "", I = {}, P = {}) {
    const H = String(N || "");
    if (!H) return H;
    const G = String(P.adminPath || "/admin").trim() || "/admin", $ = pt(P.releaseTag), K = new Map((Array.isArray(I?.entries) ? I.entries : []).map((pe) => [String(pe?.upstreamUrl || "").trim(), String(pe?.assetKey || "").trim()]));
    if (!$ || K.size === 0) return H;
    let j = null;
    try {
      j = new URL(String(P.baseUrl || P.sourceUrl || "").trim());
    } catch {
      j = null;
    }
    const se = [];
    for (const pe of h(H)) {
      const le = String(pe.rawValue || "").trim();
      if (!(!le || /^data:/i.test(le) || /^javascript:/i.test(le)))
        try {
          const ge = j ? new URL(le, j).toString() : new URL(le).toString(), Oe = K.get(ge), We = E(G, $, Oe);
          if (!Oe || !We) continue;
          se.push({
            start: pe.valueStart,
            end: pe.valueEnd,
            value: We
          });
        } catch {
          continue;
        }
    }
    let me = H;
    for (const pe of se.sort((le, ge) => ge.start - le.start)) me = `${me.slice(0, pe.start)}${pe.value}${me.slice(pe.end)}`;
    return me;
  }
  function T(N = {}) {
    const I = U(N) ? N : {};
    return {
      version: Number(I.version) || 1,
      releaseTag: pt(I.releaseTag),
      sourceUrl: xr(I.sourceUrl),
      entries: (Array.isArray(I.entries) ? I.entries : []).map((P) => ({
        assetKey: String(P?.assetKey || "").trim(),
        assetKind: String(P?.assetKind || "").trim().toLowerCase() === "css" ? "css" : "script",
        upstreamUrl: xr(P?.upstreamUrl)
      })).filter((P) => P.assetKey && P.upstreamUrl)
    };
  }
  function D(N = "") {
    let I = null;
    try {
      I = new URL(String(N || "").trim());
    } catch {
      return !1;
    }
    const P = I.hostname.replace(/\.+$/, "");
    if (!/(^|\.)jsdelivr\.net$/i.test(P) || !/^\/gh\/[^/]+\/[^/]+\//i.test(I.pathname)) return !1;
    const H = I.pathname.match(/^\/gh\/[^/]+\/[^@/]+@([^/]+)\//i);
    if (!H) return !0;
    const G = decodeURIComponent(String(H[1] || "").trim());
    return G ? !(/^[0-9a-f]{7,40}$/i.test(G) || /^v?\d+\.\d+\.\d+(?:[-+][0-9A-Za-z.-]+)?$/i.test(G)) : !0;
  }
  function w(N = "") {
    const I = String(N || ""), P = [], H = ($ = "") => /[A-Za-z0-9_$]/.test($), G = ($) => {
      let K = $;
      for (; K < I.length; ) {
        if (/\s/.test(I[K])) {
          K += 1;
          continue;
        }
        if (I.startsWith("//", K)) {
          const j = I.indexOf(`
`, K + 2);
          K = j < 0 ? I.length : j + 1;
          continue;
        }
        if (I.startsWith("/*", K)) {
          const j = I.indexOf("*/", K + 2);
          K = j < 0 ? I.length : j + 2;
          continue;
        }
        break;
      }
      return K;
    };
    for (let $ = 0; $ < I.length; ) {
      if (I.startsWith("import", $) && !H(I[$ - 1]) && !H(I[$ + 6])) {
        let K = $ - 1;
        for (; K >= 0 && /\s/.test(I[K]); ) K -= 1;
        const j = G($ + 6);
        I[K] !== "." && I[j] === "(" && P.push({
          index: $,
          reference: I.slice($, j + 1)
        });
      }
      $ += 1;
    }
    return P;
  }
  function M(N = "") {
    const I = String(N || "");
    for (const P of u(I)) {
      if (P.tagName !== "script" || !P.contentClosed || P.attributes.get("src")?.value) continue;
      const H = String(P.attributes.get("type")?.value || "").trim().toLowerCase().split(";")[0];
      if (!(H && ![
        "module",
        "text/javascript",
        "application/javascript",
        "text/ecmascript",
        "application/ecmascript"
      ].includes(H)) && w(I.slice(P.contentStart, P.contentEnd)).length > 0)
        return !0;
    }
    return !1;
  }
  function x(N = "", I = "") {
    const P = S(N, I), H = [];
    y(N) && H.push("远端 index.html 不允许 importmap；所有运行时依赖必须通过显式 script/link 标签交付"), M(N) && H.push("index.html 不允许 inline 动态 import()；所有运行时依赖必须通过显式 script/link 标签交付");
    for (const G of P) {
      const $ = String(G?.rawValue || "").trim(), K = String(G?.normalizedUrl || "").trim();
      let j = "", se = "";
      try {
        const me = new URL(K);
        j = me.hostname.replace(/\.+$/, "").toLowerCase(), se = me.pathname;
      } catch {
      }
      if (!/^(?:https?:)?\/\//i.test($)) {
        H.push(`远端 index.html 不允许相对或本地 bundle 资源：${$}`);
        continue;
      }
      if (j === "esm.sh" || j.endsWith(".esm.sh")) {
        H.push(`esm.sh 资产不再允许：${K}`);
        continue;
      }
      if (j === "raw.githubusercontent.com") {
        H.push(`raw.githubusercontent.com 资产不再允许：${K}`);
        continue;
      }
      if (j === "github.com" && /^\/[^/]+\/[^/]+\/releases\/download\//i.test(se)) {
        H.push(`浏览器直连 GitHub Release 资产不再允许：${K}`);
        continue;
      }
    }
    return H;
  }
  function C(N = "") {
    for (const I of u(N)) {
      if (n.has(I.tagName)) continue;
      const P = I.attributes.get("id");
      if (P?.quoted && P.value === "app") return !0;
    }
    return !1;
  }
  function F(N = "") {
    const I = String(N || "").trim();
    return I ? /<!doctype\s+html\b/i.test(I) || /<html\b/i.test(I) : !1;
  }
  function W(N = "", I = !1) {
    const P = String(N || "").trim().toLowerCase();
    return !P || P.includes("text/html") || P.includes("application/xhtml+xml") ? !0 : I ? P.startsWith("text/plain") || P.startsWith("application/octet-stream") : !1;
  }
  function O(N = {}) {
    const I = U(N.bootstrap) ? N.bootstrap : {}, P = U(N.initHealth) ? N.initHealth : U(I.initHealth) ? I.initHealth : {};
    return `admin-remote-shell-${ce(Q({
      templateRevision: "admin-remote-shell",
      sourceHash: ce(String(N.sourceUrl || "").trim()),
      originEtag: e.normalizeEtagToken(N.originEtag || ""),
      originLastModified: e.normalizeAdminHttpDateHeader(N.originLastModified || ""),
      htmlHash: ce(String(N.html || "")),
      variantSeed: e.buildAdminHtmlVariantEtag(I, P, "remote-admin-shell")
    }))}`;
  }
  return {
    buildAdminRemoteBootstrapMarkup: r,
    ADMIN_REMOTE_BOOTSTRAP_LOADER_HTML: t,
    ADMIN_REMOTE_TAILWIND_PRELUDE_HTML: a,
    ADMIN_HTML_SKIPPED_CONTENT_TAGS: n,
    buildAdminRemoteBootstrapScriptMarkup: s,
    isAdminHtmlSpace: i,
    findAdminHtmlTagEnd: c,
    parseAdminHtmlOpeningTag: l,
    findAdminHtmlClosingTag: d,
    iterateAdminHtmlOpeningTags: u,
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
    buildAdminReleaseVendorProxyPath: E,
    buildAdminReleaseVendorManifest: R,
    rewriteAdminRemoteShellAssetUrlsToProxy: L,
    normalizeAdminReleaseVendorManifestRecord: T,
    isMutableJsdelivrGithubAssetUrl: D,
    collectAdminInlineDynamicImports: w,
    hasAdminRemoteShellInlineDynamicImport: M,
    getAdminRemoteShellAssetPolicyViolations: x,
    hasAdminRemoteShellAppRoot: C,
    hasAdminRemoteShellHtmlDocument: F,
    isAcceptedAdminHtmlDocumentContentType: W,
    buildAdminRemoteShellVariantEtag: O
  };
}
function Be(o, e) {
  return fetch(o, e);
}
function Oi(o = {}) {
  const e = {};
  if (!o || typeof o != "object" || Array.isArray(o)) return e;
  for (const [r, t] of Object.entries(o)) {
    const a = String(r || "").trim().toLowerCase();
    !a || e[a] !== void 0 || (e[a] = t);
  }
  return e;
}
function fs(o = {}, e = []) {
  const r = Oi(o);
  for (const t of Array.isArray(e) ? e : [e]) {
    const a = String(t || "").trim().toLowerCase();
    if (!a) continue;
    const n = r[a];
    if (!(n == null || n === ""))
      return n;
  }
  return "";
}
function ot(o = []) {
  return (Array.isArray(o) ? o : [o]).map((e) => String(e ?? "").trim()).filter(Boolean).join(":");
}
async function $t(o, e) {
  return await Sn(oe.SingleFlightTasks, o, e);
}
async function Sn(o, e, r) {
  const t = String(e || "").trim();
  if (!t) return await r();
  const a = o.get(t);
  if (a) return await a;
  const n = Promise.resolve().then(() => r()).finally(() => {
    o.get(t) === n && o.delete(t);
  });
  return o.set(t, n), await n;
}
function xo(o) {
  return String(o?.__CONFIG_CACHE_NAMESPACE || o?.__WORKER_CACHE_SCOPE || "default").trim() || "default";
}
function _n(o) {
  return qa.get(Pa(o), xo(o));
}
function ms(o) {
  return _n(o).ConfigCache?.data || null;
}
function Qa(o) {
  if (arguments.length === 0) {
    qa.reset();
    return;
  }
  const e = _n(o);
  e.RuntimeConfigCacheGeneration += 1, e.ConfigCache = null;
}
function qd(o, e) {
  const r = _n(o);
  r.RuntimeConfigCacheGeneration += 1, r.ConfigCache = {
    data: e,
    exp: Date.now() + v.Defaults.CacheTTL,
    namespace: xo(o)
  };
}
async function Jn(o, e) {
  const r = String(o), t = (oe.AdminRemoteShellCacheMutationChains.get(r) || Promise.resolve()).catch(() => null).then(() => e()).finally(() => {
    oe.AdminRemoteShellCacheMutationChains.get(r) === t && oe.AdminRemoteShellCacheMutationChains.delete(r);
  });
  return oe.AdminRemoteShellCacheMutationChains.set(r, t), await t;
}
function Xd(o = {}, e = {}) {
  function r(T = "", D = {}) {
    const w = e.buildAdminHtmlResponseHeaders(D.variantEtag || "", e.ADMIN_REMOTE_SHELL_EDGE_CACHE_CONTROL), M = Number.parseInt(String(D.cachedAt || ""), 10);
    w.set(e.ADMIN_REMOTE_SHELL_CACHED_AT_HEADER, String(Number.isFinite(M) && M > 0 ? M : k()));
    const x = e.normalizeEtagToken(D.originEtag || "");
    x && w.set(e.ADMIN_REMOTE_SHELL_SOURCE_ETAG_HEADER, x);
    const C = e.normalizeAdminHttpDateHeader(D.originLastModified || "");
    C && w.set(e.ADMIN_REMOTE_SHELL_SOURCE_LAST_MODIFIED_HEADER, C);
    const F = ce(String(D.sourceUrl || "").trim());
    F && w.set(e.ADMIN_REMOTE_SHELL_SOURCE_HASH_HEADER, F);
    const W = Dt(D.shellRevision || Xe(D.sourceUrl));
    return W && w.set("X-Admin-Shell-Revision", W), new Response(String(T || ""), {
      status: 200,
      headers: w
    });
  }
  async function t(T, D, w, M) {
    const x = await xe(T, e.ADMIN_REMOTE_SHELL_MAX_BYTES);
    if (x.exceeded) throw new Error("legacy remote admin shell too large");
    const C = x.text, F = e.applyAdminRemoteBootstrapMarkup(C, Yr(w)), W = T.headers.get(e.ADMIN_REMOTE_SHELL_SOURCE_ETAG_HEADER) || "", O = e.normalizeAdminHttpDateHeader(T.headers.get(e.ADMIN_REMOTE_SHELL_SOURCE_LAST_MODIFIED_HEADER) || ""), N = e.normalizeAdminHttpDateHeader(T.headers.get("Last-Modified") || "") || O;
    return r(F, {
      variantEtag: e.buildAdminRemoteShellVariantEtag({
        html: F,
        bootstrap: w,
        initHealth: M,
        sourceUrl: D,
        originEtag: W,
        originLastModified: O || N
      }),
      lastModified: N,
      originEtag: W,
      originLastModified: O || N,
      sourceUrl: D,
      cachedAt: y(T)
    });
  }
  function a(T, D = "GET") {
    if (!T) return new Response("Remote admin shell unavailable", { status: 502 });
    const w = new Headers(T.headers || {});
    return w.set("Content-Type", "text/html;charset=UTF-8"), w.set("Cache-Control", e.ADMIN_REMOTE_SHELL_BROWSER_CACHE_CONTROL), w.delete(e.ADMIN_REMOTE_SHELL_CACHED_AT_HEADER), w.delete(e.ADMIN_REMOTE_SHELL_SOURCE_ETAG_HEADER), w.delete(e.ADMIN_REMOTE_SHELL_SOURCE_LAST_MODIFIED_HEADER), w.delete(e.ADMIN_REMOTE_SHELL_SOURCE_HASH_HEADER), Ce(w), new Response(D === "HEAD" ? null : T.body, {
      status: T.status,
      statusText: T.statusText,
      headers: w
    });
  }
  function n(T = "", D = "") {
    const w = new URL(`/${encodeURIComponent(pt(T) || "release")}`, e.ADMIN_RELEASE_VENDOR_MANIFEST_CACHE_KEY_ORIGIN);
    return w.searchParams.set("source", ce(String(D || "").trim())), new Request(w.toString(), { method: "GET" });
  }
  function s(T = "", D = "", w = "") {
    const M = new URL(`/${encodeURIComponent(pt(T) || "release")}/${encodeURIComponent(String(D || "").trim())}`, e.ADMIN_RELEASE_VENDOR_CACHE_KEY_ORIGIN);
    return M.searchParams.set("source", ce(String(w || "").trim())), new Request(M.toString(), { method: "GET" });
  }
  function i(T = {}, D = "") {
    const w = new Headers({
      "Content-Type": "application/json;charset=UTF-8",
      "Cache-Control": e.ADMIN_REMOTE_SHELL_EDGE_CACHE_CONTROL
    }), M = String(D || T?.sourceUrl || "").trim();
    return w.set(e.ADMIN_RELEASE_VENDOR_CACHED_AT_HEADER, String(k())), M && w.set(e.ADMIN_RELEASE_VENDOR_SOURCE_HASH_HEADER, ce(M)), new Response(JSON.stringify(T), {
      status: 200,
      headers: w
    });
  }
  function c(T = "", D = "script") {
    const w = String(T || "").trim().toLowerCase(), M = String(D || "").trim().toLowerCase() === "css" ? "css" : "script";
    return w ? M === "css" ? w.includes("text/css") || w.includes("application/css") || w.startsWith("text/plain") : w.includes("javascript") || w.includes("ecmascript") || w.startsWith("text/plain") || w.startsWith("application/octet-stream") : !0;
  }
  function l(T, D = "GET") {
    const w = new Headers(T.headers);
    return w.set("Cache-Control", String(T.headers.get("Cache-Control") || e.ADMIN_RELEASE_VENDOR_CACHE_CONTROL).trim() || e.ADMIN_RELEASE_VENDOR_CACHE_CONTROL), w.delete(e.ADMIN_RELEASE_VENDOR_CACHED_AT_HEADER), w.delete(e.ADMIN_RELEASE_VENDOR_SOURCE_HASH_HEADER), Ce(w), new Response(D === "HEAD" ? null : T.body, {
      status: T.status,
      statusText: T.statusText,
      headers: w
    });
  }
  async function d(T, D = "", w = "") {
    if (!T || typeof T.match != "function") return null;
    const M = await T.match(n(D, w));
    if (!M) return null;
    try {
      const x = await xe(M, Di);
      return x.exceeded ? null : e.normalizeAdminReleaseVendorManifestRecord(JSON.parse(x.text));
    } catch {
      return null;
    }
  }
  async function u(T = "", D = "") {
    const w = pt(T), M = xr(D);
    if (!w || !M) return null;
    const x = await Be(M, { method: "GET" });
    if (!x.ok) throw new Error(`release index fetch failed: HTTP ${x.status}`);
    const C = String(x.headers.get("Content-Type") || "").trim().toLowerCase(), F = Number.parseInt(String(x.headers.get("Content-Length") || ""), 10);
    if (Number.isFinite(F) && F > e.ADMIN_REMOTE_SHELL_MAX_BYTES) throw new Error(`release index too large: ${F} bytes`);
    const W = await xe(x, e.ADMIN_REMOTE_SHELL_MAX_BYTES), O = W.text, N = W.bytes;
    if (W.exceeded || !O || N > e.ADMIN_REMOTE_SHELL_MAX_BYTES) throw new Error(`release index payload invalid: ${N} bytes`);
    const I = e.hasAdminRemoteShellHtmlDocument(O);
    if (!e.isAcceptedAdminHtmlDocumentContentType(C, I)) throw new Error(`release index content-type invalid: ${C}`);
    if (!I) throw new Error("release index payload invalid: html document expected");
    if (!e.hasAdminRemoteShellAppRoot(O)) throw new Error("release index missing #app root");
    const P = e.getAdminRemoteShellAssetPolicyViolations(O, M);
    if (P.length > 0) throw new Error(`release index asset policy invalid: ${P.slice(0, 3).join(" | ")}`);
    return e.normalizeAdminReleaseVendorManifestRecord(e.buildAdminReleaseVendorManifest(O, {
      releaseTag: w,
      sourceUrl: M
    }));
  }
  async function f(T, D = {}, w = null) {
    const M = e.normalizeAdminReleaseVendorManifestRecord(D);
    if (!T || typeof T.put != "function" || !M.releaseTag || !M.sourceUrl) return M;
    const x = ye(T.put(n(M.releaseTag, M.sourceUrl), i(M, M.sourceUrl)), "admin.release_vendor_manifest_cache_write", { releaseTag: M.releaseTag }, null);
    return w && typeof w.waitUntil == "function" ? w.waitUntil(x) : await x, M;
  }
  async function m(T, D = "", w = "", M = null) {
    const x = await d(T, D, w);
    if (x?.entries?.length) return x;
    const C = await u(D, w);
    return C ? (await f(T, C, M), C) : null;
  }
  function p(T = {}, D = "") {
    const w = String(D || "").trim();
    return w && (Array.isArray(T?.entries) ? T.entries : []).find((M) => String(M?.assetKey || "").trim() === w) || null;
  }
  function g(T = "", D = "/admin") {
    const w = ee(D || "/admin").replace(/\/+$/, "") || "/admin", M = ee(T || "/"), x = new RegExp(`^${e.escapeRegexForRoute(w)}/${e.ADMIN_RELEASE_PROXY_PATH_SEGMENT}/([^/]+)/${e.ADMIN_RELEASE_VENDOR_PATH_SEGMENT}/([^/]+)/*$`, "i"), C = M.match(x);
    if (!C) return null;
    try {
      return {
        releaseTag: pt(decodeURIComponent(String(C[1] || ""))),
        assetKey: String(decodeURIComponent(String(C[2] || "")) || "").trim()
      };
    } catch {
      return null;
    }
  }
  function h(T = "", D = "/admin") {
    const w = ee(D || "/admin").replace(/\/+$/, "") || "/admin";
    return (ee(T || "/").replace(/\/+$/, "") || "/").toLowerCase() === `${w}/${e.ADMIN_WARM_PATH_SEGMENT}`.toLowerCase();
  }
  function y(T) {
    const D = Number.parseInt(String(T?.headers?.get?.(e.ADMIN_REMOTE_SHELL_CACHED_AT_HEADER) || ""), 10);
    return Number.isFinite(D) && D > 0 ? D : 0;
  }
  function S(T) {
    const D = y(T);
    return D ? k() - D >= e.ADMIN_REMOTE_SHELL_REVALIDATE_MS : !0;
  }
  function _(T = "", D = "", w = {}) {
    const M = String(T || ""), x = String(w.sourceLabel || "admin shell").trim() || "admin shell", C = String(w.contentType || "").trim().toLowerCase(), F = new TextEncoder().encode(M).length;
    if (!M || F > e.ADMIN_REMOTE_SHELL_MAX_BYTES) throw new Error(`${x} payload invalid: ${F} bytes`);
    const W = e.hasAdminRemoteShellHtmlDocument(M);
    if (!e.isAcceptedAdminHtmlDocumentContentType(C, W)) throw new Error(`${x} content-type invalid: ${C}`);
    if (!W) throw new Error(`${x} payload invalid: html document expected`);
    if (!e.hasAdminRemoteShellAppRoot(M)) throw new Error(`${x} missing #app root`);
    const O = e.getAdminRemoteShellAssetPolicyViolations(M, D);
    if (O.length > 0) throw new Error(`${x} asset policy invalid: ${O.slice(0, 3).join(" | ")}`);
    return {
      html: M,
      bytes: F
    };
  }
  function A(T = "", D = {}, w = {}, M = "", x = {}) {
    const C = _(T, M, x), F = pt(x.assetRevision || x.releaseTag), W = F ? e.normalizeAdminReleaseVendorManifestRecord(e.buildAdminReleaseVendorManifest(C.html, {
      releaseTag: F,
      sourceUrl: M
    })) : null, O = W?.entries?.length ? e.rewriteAdminRemoteShellAssetUrlsToProxy(C.html, W, {
      adminPath: String(x.adminPath || D?.adminPath || "/admin").trim() || "/admin",
      releaseTag: F,
      sourceUrl: M
    }) : C.html, N = e.applyAdminRemoteBootstrapMarkup(O, Yr(D)), I = e.normalizeAdminHttpDateHeader(x.lastModified || "") || (/* @__PURE__ */ new Date()).toUTCString(), P = String(x.originEtag || "").trim();
    return {
      storedResponse: r(N, {
        variantEtag: e.buildAdminRemoteShellVariantEtag({
          html: N,
          bootstrap: D,
          initHealth: w,
          sourceUrl: M,
          originEtag: P,
          originLastModified: I
        }),
        lastModified: I,
        originEtag: P,
        originLastModified: I,
        sourceUrl: M,
        shellRevision: Xe(M)
      }),
      vendorManifest: W
    };
  }
  async function b(T = "", D = "index.html") {
    const w = String(T || ""), M = await $n(w), x = Vr(M);
    let C;
    try {
      C = _(w, x, {
        sourceLabel: "local admin index",
        contentType: "text/html"
      });
    } catch (O) {
      throw O && typeof O == "object" && (O.code = String(O.code || "ADMIN_INDEX_UPLOAD_INVALID"), O.status = De(O.status, 400)), O;
    }
    const F = Do(M), W = e.normalizeAdminReleaseVendorManifestRecord(e.buildAdminReleaseVendorManifest(C.html, {
      releaseTag: F,
      sourceUrl: x
    }));
    return {
      version: 1,
      revision: M,
      assetRevision: F,
      sourceUrl: x,
      fileName: (String(D || "index.html").trim().replace(/^.*[\\/]/, "") || "index.html").slice(0, 180),
      uploadedAt: (/* @__PURE__ */ new Date()).toISOString(),
      bytes: C.bytes,
      html: C.html,
      manifest: W
    };
  }
  async function E(T, D, w, M = null, x = {}) {
    if (Xe(T)) {
      const K = typeof x.loadLocalIndexRecord == "function" ? await x.loadLocalIndexRecord() : null;
      if (!K?.html) throw new Error("local admin index upload is missing");
      return A(K.html, D, w, T, {
        sourceLabel: "local admin index",
        contentType: "text/html",
        adminPath: x.adminPath,
        assetRevision: x.assetRevision || K.assetRevision,
        lastModified: K.uploadedAt
      });
    }
    const C = new Headers(), F = e.normalizeEtagToken(M?.headers?.get?.(e.ADMIN_REMOTE_SHELL_SOURCE_ETAG_HEADER) || ""), W = e.normalizeAdminHttpDateHeader(M?.headers?.get?.(e.ADMIN_REMOTE_SHELL_SOURCE_LAST_MODIFIED_HEADER) || "");
    F && C.set("If-None-Match", F), W && C.set("If-Modified-Since", W);
    const O = await Be(T, {
      method: "GET",
      headers: C
    });
    if (O.status === 304 && M) {
      const K = await xe(M, e.ADMIN_REMOTE_SHELL_MAX_BYTES);
      if (K.exceeded) throw new Error("cached remote admin shell too large");
      const j = K.text;
      return {
        storedResponse: r(j, {
          variantEtag: e.normalizeEtagToken(M.headers.get("ETag") || ""),
          lastModified: e.normalizeAdminHttpDateHeader(M.headers.get("Last-Modified") || ""),
          originEtag: F,
          originLastModified: W,
          sourceUrl: T
        }),
        vendorManifest: null
      };
    }
    if (!O.ok) throw new Error(`remote admin shell fetch failed: HTTP ${O.status}`);
    const N = String(O.headers.get("Content-Type") || "").trim().toLowerCase(), I = Number.parseInt(String(O.headers.get("Content-Length") || ""), 10);
    if (Number.isFinite(I) && I > e.ADMIN_REMOTE_SHELL_MAX_BYTES) throw new Error(`remote admin shell too large: ${I} bytes`);
    const P = await xe(O, e.ADMIN_REMOTE_SHELL_MAX_BYTES), H = P.text, G = P.bytes;
    if (P.exceeded || !H || G > e.ADMIN_REMOTE_SHELL_MAX_BYTES) throw new Error(`remote admin shell payload invalid: ${G} bytes`);
    const $ = e.normalizeAdminHttpDateHeader(O.headers.get("Last-Modified") || "") || (/* @__PURE__ */ new Date()).toUTCString();
    return A(H, D, w, T, {
      sourceLabel: "remote admin shell",
      contentType: N,
      adminPath: x.adminPath,
      assetRevision: x.assetRevision || x.releaseTag,
      lastModified: $,
      originEtag: O.headers.get("ETag") || ""
    });
  }
  async function R(T, D, w, M, x, C, F, W = {}, O = null) {
    if (!D || typeof D.put != "function") return null;
    const N = await E(M, x, C, F, W), I = N?.storedResponse || null;
    return I ? (await D.put(w, I.clone()), N?.vendorManifest?.entries?.length && await f(D, N.vendorManifest, O), I) : null;
  }
  async function L(T, D, w, M, x, C = {}) {
    return $t(ot(["admin_remote_shell_cold_load", D.url]), () => Jn(D.url, async () => {
      if (T && typeof T.match == "function") {
        const O = await T.match(D);
        if (O) return {
          storedResponse: O,
          vendorManifest: null,
          loadedFromCache: !0
        };
      }
      const F = await E(w, M, x, null, C), W = F?.storedResponse || null;
      return W ? (T && typeof T.put == "function" && (await T.put(D, W.clone()), F?.vendorManifest?.entries?.length && await f(T, F.vendorManifest, null)), {
        ...F,
        loadedFromCache: !1
      }) : F;
    }));
  }
  return {
    buildAdminRemoteShellStoredResponse: r,
    migrateLegacyAdminRemoteShellStoredResponse: t,
    buildAdminRemoteShellClientResponse: a,
    buildAdminReleaseVendorManifestCacheKeyRequest: n,
    buildAdminReleaseVendorAssetCacheKeyRequest: s,
    buildAdminReleaseVendorManifestResponse: i,
    isAcceptedAdminReleaseVendorContentType: c,
    buildAdminReleaseVendorClientResponse: l,
    readAdminReleaseVendorManifestFromCache: d,
    buildAdminReleaseVendorManifestFromSource: u,
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
    fetchAdminRemoteShellStoredResponse: E,
    revalidateAdminRemoteShellCache: R,
    loadAdminRemoteShellColdCache: L
  };
}
function Yd(o = {}, e = {}) {
  const { indexRepository: r } = o;
  async function t(d, u, f, m = ke(u), p = {}) {
    const g = u?.ASSETS;
    if (!g || typeof g.fetch != "function") return null;
    const h = new URL("/index.html", d.url), y = await g.fetch(new Request(h, {
      method: "GET",
      headers: { Accept: "text/html" }
    }));
    if (!y?.ok) throw new Error(`bundled admin shell fetch failed: HTTP ${Number(y?.status) || 0}`);
    const S = Number.parseInt(String(y.headers.get("Content-Length") || ""), 10);
    if (Number.isFinite(S) && S > e.ADMIN_REMOTE_SHELL_MAX_BYTES) throw new Error(`bundled admin shell too large: ${S} bytes`);
    const _ = await xe(y, e.ADMIN_REMOTE_SHELL_MAX_BYTES);
    if (_.exceeded || !_.text) throw new Error(`bundled admin shell payload invalid: ${_.bytes} bytes`);
    const A = e.buildAdminShellState(u, m, p), b = e.buildAdminBootstrapPayload(u, m, p), E = gt(u, p), R = h.toString(), L = e.buildAdminShellStoredPayloadFromHtml(_.text, b, m, R, {
      sourceLabel: "bundled admin shell",
      contentType: y.headers.get("Content-Type") || "text/html",
      adminPath: b.adminPath,
      lastModified: y.headers.get("Last-Modified") || "Thu, 01 Jan 1970 00:00:00 GMT",
      originEtag: y.headers.get("ETag") || ""
    })?.storedResponse || null;
    if (!L) throw new Error("bundled admin shell response is unavailable");
    return await e.patchAdminShellRuntimeStatus(u, {
      shellState: A,
      initHealth: m,
      indexState: E,
      mode: "embedded",
      sourceType: "static_assets",
      routeState: "embedded_active",
      gateState: "shell_ready",
      lifecycleState: "embedded_only",
      embeddedFallbackState: "active",
      remoteCacheState: "bypassed",
      lastFetchStatus: "loaded",
      reason: "served_bundled_admin_shell",
      requestPath: new URL(d.url).pathname,
      indexUrl: R,
      indexUrlSource: "worker_assets",
      effectiveRef: "frontend/dist/index.html",
      effectiveRefType: "static_assets"
    }, f), e.requestMatchesAdminHtmlResponse(d, L) ? e.buildConditionalNotModifiedResponseFromStoredResponse(L, e.ADMIN_REMOTE_SHELL_BROWSER_CACHE_CONTROL) : e.buildAdminRemoteShellClientResponse(L, d.method);
  }
  async function a(d, u, f, m = ke(u), p = {}, g = "index_url_not_configured") {
    const h = gt(u, p), y = e.buildAdminShellState(u, m, p), S = e.buildAdminBootstrapPayload(u, m, p), _ = Yr(S), A = Yn(m), b = new URL(d.url).pathname;
    await e.patchAdminShellRuntimeStatus(u, {
      shellState: y,
      initHealth: m,
      indexState: h,
      remoteShellIndexUrl: h.indexUrl,
      mode: "gate",
      sourceType: "setup_gate",
      routeState: "setup_gate",
      remoteCacheState: "bypassed",
      lastFetchStatus: "skipped",
      reason: g,
      requestPath: b
    }, f);
    const E = e.buildAdminIndexSetupContent(S, y, m, p, h), R = e.renderAdminHtmlShell(_, A, E);
    return new Response(d.method === "HEAD" ? null : R, { headers: e.buildAdminHtmlResponseHeaders("", "no-store, max-age=0") });
  }
  function n(d) {
    const u = String(new URL(d.url).searchParams.get("setup") || "").trim().toLowerCase();
    return u === "1" || u === "true";
  }
  async function s(d, u, f, m = ke(u), p = {}, g = {}) {
    const h = e.buildAdminShellState(u, m, g), y = e.buildAdminBootstrapPayload(u, m, g), S = gt(u, g), _ = Yr(y), A = Yn(m), b = new URL(d.url).pathname, E = {
      ...p,
      shellState: h,
      initHealth: m,
      indexState: S,
      remoteShellIndexUrl: p.remoteShellIndexUrl || h.remoteShellIndexUrl || S.indexUrl || "",
      mode: "remote_error",
      sourceType: p.sourceType || "remote_error",
      routeState: p.routeState || "remote_error",
      remoteCacheState: p.remoteCacheState || "bypassed",
      lastFetchStatus: p.lastFetchStatus || "failed",
      reason: p.reason || "remote_shell_render_failed",
      requestPath: b
    }, R = e.buildAdminRemoteShellErrorContent(y, h, m, E);
    await e.patchAdminShellRuntimeStatus(u, E, f);
    const L = e.renderAdminHtmlShell(_, A, R);
    return new Response(d.method === "HEAD" ? null : L, { headers: e.buildAdminHtmlResponseHeaders("", "no-store, max-age=0") });
  }
  async function i(d, u, f, m = ke(u), p = e.resolveAdminShellIndexUrl(u), g = {}) {
    const h = dr(), y = e.buildAdminShellState(u, m, g), S = e.buildAdminBootstrapPayload(u, m, g), _ = gt(u, g), A = {
      releaseTag: _.assetRevision || _.releaseTag,
      assetRevision: _.assetRevision || _.releaseTag,
      adminPath: S.adminPath,
      ..._.isLocalUpload ? { loadLocalIndexRecord: () => r.getAdminIndexUploadRecord(r.getKV(u), _.localUploadRevision) } : {}
    }, b = e.buildAdminRemoteShellCacheKeyRequest(d, p, S), E = e.buildAdminRemoteShellLegacyCacheKeyRequest(d, p), R = new URL(d.url).pathname;
    if (h && typeof h.match == "function") {
      const w = await $t(ot(["admin_remote_shell_cache_read", b.url]), async () => {
        const C = await h.match(b);
        if (C) return {
          storedResponse: C,
          legacyCacheMigrated: !1
        };
        const F = await h.match(E);
        if (!F) return null;
        const W = await ye(e.migrateLegacyAdminRemoteShellStoredResponse(F, p, S, m), "admin.remote_shell_legacy_cache_read", {
          path: R,
          remoteShellIndexUrl: p
        }, null);
        return W ? await Jn(b.url, async () => {
          const O = await h.match(b);
          return O ? {
            storedResponse: O,
            legacyCacheMigrated: !1
          } : (typeof h.put == "function" && await ye(h.put(b, W.clone()), "admin.remote_shell_legacy_cache_migrate", {
            path: R,
            remoteShellIndexUrl: p
          }, null), {
            storedResponse: W,
            legacyCacheMigrated: !0
          });
        }) : null;
      }), M = w === null ? null : w.storedResponse.clone(), x = w !== null && w.legacyCacheMigrated;
      if (M) {
        const C = e.shouldRevalidateAdminRemoteShell(M);
        let F = null;
        if (C) {
          const N = M.clone();
          F = $t(ot(["admin_remote_shell_revalidate", b.url]), async () => ye(Jn(b.url, () => e.revalidateAdminRemoteShellCache(d, h, b, p, S, m, N, A, f)), "admin.remote_shell_revalidate", {
            path: R,
            remoteShellIndexUrl: p
          }, null));
        }
        const W = e.patchAdminShellRuntimeStatus(u, {
          shellState: y,
          initHealth: m,
          indexState: _,
          remoteShellIndexUrl: p,
          mode: "remote",
          sourceType: x ? "remote_legacy_cache" : "remote_cache",
          routeState: "remote_active",
          remoteCacheState: x ? C ? "legacy_stale_hit" : "legacy_hit" : C ? "stale_hit" : "hit",
          revalidateDue: C,
          lastFetchStatus: "cached",
          reason: x ? C ? "migrated_legacy_remote_shell_and_scheduled_revalidate" : "migrated_legacy_remote_shell" : C ? "served_cached_remote_shell_and_scheduled_revalidate" : "served_cached_remote_shell",
          requestPath: R,
          throttleStableWrites: !0
        }, null), O = F ? Promise.all([F, W]) : W;
        return f && typeof f.waitUntil == "function" && f.waitUntil(O), e.requestMatchesAdminHtmlResponse(d, M) ? e.buildConditionalNotModifiedResponseFromStoredResponse(M, e.ADMIN_REMOTE_SHELL_BROWSER_CACHE_CONTROL) : e.buildAdminRemoteShellClientResponse(M, d.method);
      }
    }
    const L = await e.loadAdminRemoteShellColdCache(h, b, p, S, m, A), T = (L?.storedResponse ? {
      ...L,
      storedResponse: L.storedResponse.clone()
    } : L)?.storedResponse || null;
    if (!T) throw new Error("remote admin shell payload missing");
    const D = $t(ot(["admin_remote_shell_cold_status", b.url]), () => e.patchAdminShellRuntimeStatus(u, {
      shellState: y,
      initHealth: m,
      indexState: _,
      remoteShellIndexUrl: p,
      mode: "remote",
      sourceType: L?.loadedFromCache ? "remote_cache" : "remote_fetch",
      routeState: "remote_active",
      remoteCacheState: L?.loadedFromCache ? "filled_while_waiting" : "miss",
      lastFetchStatus: L?.loadedFromCache ? "cached" : "fetched",
      reason: L?.loadedFromCache ? "served_cache_filled_while_waiting" : "fetched_remote_shell_index",
      requestPath: R
    }, null));
    return f && typeof f.waitUntil == "function" ? f.waitUntil(D) : await D, e.requestMatchesAdminHtmlResponse(d, T) ? e.buildConditionalNotModifiedResponseFromStoredResponse(T, e.ADMIN_REMOTE_SHELL_BROWSER_CACHE_CONTROL) : e.buildAdminRemoteShellClientResponse(T, d.method);
  }
  function c(d = "Release vendor asset unavailable", u = 502) {
    const f = new Headers({
      "Content-Type": "text/plain;charset=UTF-8",
      "Cache-Control": "no-store, max-age=0"
    });
    return Ce(f), new Response(String(d || "Release vendor asset unavailable"), {
      status: u,
      headers: f
    });
  }
  async function l(d, u, f, m = null, p = {}) {
    const g = pt(m?.releaseTag), h = String(m?.assetKey || "").trim();
    if (!g || !h) return c("Release vendor asset not found", 404);
    const y = dr(), S = gd(g);
    if (!S) return c("Local index vendor asset not found", 404);
    const _ = S ? await r.getAdminIndexUploadRecord(r.getKV(u), S) : null;
    if (S && !_) return c("Local index vendor asset not found", 404);
    const A = _?.sourceUrl || "";
    if (!A) return c("Release vendor asset not found", 404);
    let b = null;
    _?.manifest ? (b = await e.readAdminReleaseVendorManifestFromCache(y, g, A), b || (b = await e.cacheAdminReleaseVendorManifest(y, _.manifest, f))) : b = await e.getOrCreateAdminReleaseVendorManifest(y, g, A, f);
    const E = e.resolveAdminReleaseVendorManifestEntry(b, h);
    if (!E?.upstreamUrl) return c("Release vendor asset not found", 404);
    const R = e.isMutableJsdelivrGithubAssetUrl(E.upstreamUrl), L = R ? e.ADMIN_RELEASE_VENDOR_MUTABLE_CACHE_CONTROL : e.ADMIN_RELEASE_VENDOR_CACHE_CONTROL, T = e.buildAdminReleaseVendorAssetCacheKeyRequest(g, h, E.upstreamUrl);
    if (!R && y && typeof y.match == "function") {
      const I = await y.match(T);
      if (I)
        return e.requestMatchesAdminHtmlResponse(d, I) ? e.buildConditionalNotModifiedResponseFromStoredResponse(I, L) : e.buildAdminReleaseVendorClientResponse(I, d.method);
    }
    let D = null;
    try {
      D = await Be(E.upstreamUrl, {
        method: "GET",
        headers: { Accept: E.assetKind === "css" ? "text/css, text/plain;q=0.9, */*;q=0.1" : "application/javascript, text/javascript, text/plain;q=0.9, */*;q=0.1" }
      });
    } catch (I) {
      return c(`Release vendor asset fetch failed: ${String(I?.message || I || "unknown_error").trim() || "unknown_error"}`, 502);
    }
    if (!D.ok) return c(D.status === 404 ? "Release vendor asset not found" : `Release vendor asset fetch failed (HTTP ${D.status})`, D.status === 404 ? 404 : 502);
    const w = String(D.headers.get("Content-Type") || "").trim();
    if (!e.isAcceptedAdminReleaseVendorContentType(w, E.assetKind)) return c(`Release vendor asset content-type invalid: ${w || "unknown"}`, 502);
    const M = Number.parseInt(String(D.headers.get("Content-Length") || ""), 10);
    if (Number.isFinite(M) && M > e.ADMIN_RELEASE_VENDOR_MAX_BYTES) return c(`Release vendor asset too large: ${M} bytes`, 502);
    const x = await js(D, e.ADMIN_RELEASE_VENDOR_MAX_BYTES), C = x.bytes;
    if (x.exceeded || !C || C > e.ADMIN_RELEASE_VENDOR_MAX_BYTES) return c(`Release vendor asset payload invalid: ${C} bytes`, 502);
    const F = new Headers({ "Cache-Control": L }), W = e.normalizeEtagToken(D.headers.get("ETag") || ""), O = e.normalizeAdminHttpDateHeader(D.headers.get("Last-Modified") || "");
    w && F.set("Content-Type", w), W && F.set("ETag", e.formatAdminHtmlEtag(W)), O && F.set("Last-Modified", O), F.set(e.ADMIN_RELEASE_VENDOR_CACHED_AT_HEADER, String(k())), F.set(e.ADMIN_RELEASE_VENDOR_SOURCE_HASH_HEADER, ce(E.upstreamUrl));
    const N = new Response(x.bodyBytes, {
      status: 200,
      headers: F
    });
    if (!R && y && typeof y.put == "function") {
      const I = ye(y.put(T, N.clone()), "admin.release_vendor_cache_write", {
        releaseTag: g,
        assetKey: h
      }, null);
      f && typeof f.waitUntil == "function" ? f.waitUntil(I) : await I;
    }
    return e.requestMatchesAdminHtmlResponse(d, N) ? e.buildConditionalNotModifiedResponseFromStoredResponse(N, L) : e.buildAdminReleaseVendorClientResponse(N, d.method);
  }
  return {
    renderBundledAdminPage: t,
    renderAdminIndexSetupPage: a,
    isAdminIndexSetupForced: n,
    renderAdminRemoteShellErrorPage: s,
    renderRemoteAdminPage: i,
    buildAdminReleaseVendorErrorResponse: c,
    renderAdminReleaseVendorAsset: l
  };
}
function Jd(o = {}) {
  return {
    ...ei,
    ...da,
    "Content-Type": "application/json; charset=utf-8",
    "Cache-Control": "no-store, max-age=0",
    ...o
  };
}
function J(o, e = 200, r = {}) {
  return new Response(JSON.stringify(o), {
    status: e,
    headers: Jd(r)
  });
}
function z(o, e, r = 400, t = null, a = {}) {
  const n = {
    ok: !1,
    error: {
      code: o,
      message: e
    }
  };
  return t != null && (n.error.details = t), J(n, r, a);
}
async function Qd(o) {
  const e = new Headers(o.headers || {});
  if (e.set("Content-Type", "application/json; charset=utf-8"), e.set("Cache-Control", "no-store, max-age=0"), Object.entries(da).forEach(([c, l]) => e.set(c, l)), Ce(e), o.ok) return new Response(o.body, {
    status: o.status,
    headers: e
  });
  const r = await xe(o, fn);
  let t = null;
  const a = r.text;
  try {
    t = JSON.parse(a);
  } catch {
  }
  const n = t?.error?.code || (typeof t?.error == "string" ? t.error.toUpperCase() : `HTTP_${o.status}`), s = t?.error?.message || t?.message || (typeof t?.error == "string" ? t.error : a || o.statusText || "request_failed"), i = t?.error?.details ?? t?.details ?? null;
  return z(n, s, o.status || 500, i);
}
function vr(o = "") {
  return String(o || "").trim().toLowerCase() === "simplified" ? "simplified" : "legacy";
}
function vi(o = "") {
  const e = String(o || "").trim().toLowerCase();
  return e === "balanced" ? "balanced" : e === "aggressive" ? "aggressive" : "compat";
}
function Oo(o = {}) {
  const e = o?.enableH2 === !0, r = o?.enableH3 === !0;
  return !e && !r ? "compat" : o?.peakDowngrade === !1 ? "aggressive" : "balanced";
}
var Fi = Object.freeze([
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
function Ui(o = "") {
  const e = String(o || "").trim().toLowerCase();
  return e === "summary" || e === "kv" || e === "d1" ? e : "";
}
function Zd(o = []) {
  const e = [], r = /* @__PURE__ */ new Set();
  for (const t of Array.isArray(o) ? o : [o]) {
    const a = Ui(t);
    !a || r.has(a) || (r.add(a), e.push(a));
  }
  return e;
}
function eu(o = {}) {
  return Fi.some(({ configKey: e }) => pa(o, e));
}
function Hi(o = {}, e = o) {
  const r = o && typeof o == "object" ? o : {}, t = e && typeof e == "object" ? e : {};
  return r.tgDailyReportEnabled === !0 && !eu(t);
}
function tu(o = {}, e = {}) {
  const r = o && typeof o == "object" ? o : {};
  return Hi(r, e && typeof e == "object" ? e : {}) ? (r.tgDailyReportSummaryEnabled = !0, r.tgDailyReportKvEnabled = !1, r.tgDailyReportD1Enabled = !1, r) : (r.tgDailyReportSummaryEnabled = r.tgDailyReportSummaryEnabled === !0, r.tgDailyReportKvEnabled = r.tgDailyReportKvEnabled === !0, r.tgDailyReportD1Enabled = r.tgDailyReportD1Enabled === !0, r);
}
function ki(o = {}, e = o, r = {}) {
  const t = o && typeof o == "object" ? o : {}, a = Zd(r?.reportKinds);
  if (a.length > 0) return a;
  const n = Fi.filter(({ configKey: s }) => t[s] === !0).map(({ kind: s }) => s);
  return n.length > 0 ? n : r?.fallbackAllWhenLegacy === !0 && Hi(t, e) ? ["summary"] : [];
}
function ru(o = {}) {
  return vr(o?.routingDecisionMode);
}
function Fr(o = "") {
  const e = String(o || "").trim().toLowerCase();
  return e === "legacy" || e === "simplified" ? e : "inherit";
}
function au(o = {}, e = {}) {
  const r = Fr(o?.routingDecisionMode);
  return r === "inherit" ? ru(e) : r;
}
function ir(o) {
  const e = String(o ?? "").trim();
  if (!e) return "";
  if (!/^\d{1,5}$/.test(e)) return null;
  const r = Number(e);
  return !Number.isInteger(r) || r < 1 || r > 65535 ? null : String(r);
}
function nu(o) {
  return o === "http:" ? "80" : o === "https:" ? "443" : "";
}
function ou(o) {
  const e = String(o?.username || ""), r = String(o?.password || "");
  return !e && !r ? "" : `${e}${r ? `:${r}` : ""}@`;
}
function su(o, e = "") {
  if (!(o instanceof URL)) return "";
  const r = String(o.protocol || "").trim().toLowerCase();
  if (!["http:", "https:"].includes(r)) return "";
  const t = ir(e);
  if (t === null) return "";
  const a = String(o.hostname || "").trim();
  if (!a) return "";
  const n = String(o.pathname || "/") || "/", s = String(o.search || ""), i = String(o.hash || "");
  return `${r}//${ou(o)}${a}${t ? `:${t}` : ""}${n}${s}${i}`.replace(/\/$/, "");
}
function ps(o, e = "", r = "") {
  const t = String(o || "").trim();
  if (!t) return null;
  try {
    const a = new URL(t);
    if (!["http:", "https:"].includes(a.protocol)) return null;
    const n = ir(a.port), s = ir(e), i = ir(r);
    return n === null || s === null || i === null ? null : su(a, n || s || i || nu(a.protocol)) || null;
  } catch {
    return null;
  }
}
function iu(o = "") {
  const e = String(o || "").trim();
  if (!e) return !1;
  try {
    const r = new URL(e);
    if (!["http:", "https:"].includes(r.protocol)) return !1;
    const t = e.match(/^[a-z][a-z0-9+.-]*:\/\/([^/?#]*)/i);
    if (!t) return !1;
    let a = String(t[1] || "");
    const n = a.lastIndexOf("@");
    if (n >= 0 && (a = a.slice(n + 1)), !a) return !1;
    if (a.startsWith("[")) {
      const s = a.indexOf("]");
      return s < 0 ? !1 : /^:\d+$/.test(a.slice(s + 1));
    }
    return /:\d+$/.test(a);
  } catch {
    return !1;
  }
}
function gs(o = "") {
  const e = String(o || "").trim();
  if (!e) return !1;
  try {
    const r = new URL(e);
    return ["http:", "https:"].includes(r.protocol) ? !iu(e) : !1;
  } catch {
    return !1;
  }
}
function be(o) {
  return JSON.stringify(String(o ?? ""));
}
function Ot(o = "/") {
  const e = ee(o || "/");
  return e === "/" ? "" : e.replace(/\/+$/, "");
}
function bn(o) {
  try {
    const e = o instanceof URL ? o : new URL(String(o || ""));
    if (!["http:", "https:"].includes(e.protocol)) return null;
    const r = String(e.origin || "").trim();
    if (!r) return null;
    const t = Ot(e.pathname);
    return {
      targetUrl: e,
      originText: r,
      normalizedBasePath: t,
      absoluteBasePrefix: `${r}${t}`
    };
  } catch {
    return null;
  }
}
function je(o) {
  return tt(o) ? String(o.absoluteBasePrefix || o.originText || "").trim() : "";
}
function cu(o = []) {
  return ce(Q((Array.isArray(o) ? o : []).map((e) => je(e)).filter(Boolean)));
}
function lu(o = []) {
  return new Set((Array.isArray(o) ? o : []).map((e) => je(e)).filter(Boolean)).size;
}
function Ma(o = "", e = v.Defaults.HedgeProbePath) {
  const r = String(o || e || "").trim() || String(e || "/emby/system/ping").trim() || "/emby/system/ping";
  try {
    return ee(new URL(r, "https://hedge-probe.invalid").pathname || "/");
  } catch {
    return ee(r);
  }
}
function fa(o = "") {
  const e = String(o || "").trim();
  return e ? Ma(e, v.Defaults.HedgeProbePath) : "";
}
function tt(o) {
  return !!o && typeof o == "object" && o.targetUrl instanceof URL && typeof o.originText == "string" && typeof o.normalizedBasePath == "string" && typeof o.absoluteBasePrefix == "string";
}
function hs(o = "") {
  const e = String(o || "");
  return e ? e.startsWith("?") ? e : `?${e}` : "";
}
function du(o = "GET", e = {}, r = {}) {
  const t = String(o || "GET").toUpperCase();
  return !(t !== "GET" && t !== "HEAD" || e?.isSegment !== !0 || e?.isWsUpgrade === !0 || r.playbackRelayTargetUrl instanceof URL || r.protocolFallbackRetry === !0 || r.isExternalRedirect === !0);
}
var En = ["proxyMode", "mode"], Rn = [
  "direct",
  "sourceDirect",
  "directSource",
  "direct2xx"
], Ki = [
  "wangpanMode",
  "videoThrottling",
  "interceptMs"
], Bi = "__playback-relay", $i = "__pb_target", Qn = "__pb_abs", Zn = Object.freeze({
  main: "",
  proxy_a: "__proxy-a",
  proxy_b: "__proxy-b"
});
[
  ...En,
  ...Rn,
  ...Ki
];
function uu(o = {}) {
  const e = o && typeof o == "object" && !Array.isArray(o) ? o : {}, r = [];
  let t = !1;
  const a = ir(e.port), n = Array.isArray(e.lines) ? e.lines.reduce((i, c) => i + (ir(c?.port) ? 1 : 0), 0) : 0, s = Array.isArray(e.lines) && e.lines.length ? e.lines.reduce((i, c) => ir(c?.port) || a ? i : i + (gs(c?.target) ? 1 : 0), 0) : a ? 0 : String(e.target || "").split(",").map((i) => i.trim()).filter(Boolean).reduce((i, c) => i + (gs(c) ? 1 : 0), 0);
  for (const i of En) {
    if (!Object.prototype.hasOwnProperty.call(e, i)) continue;
    r.push(i);
    const c = String(e[i] || "").trim().toLowerCase();
    [
      "direct",
      "source-direct",
      "origin-direct",
      "node-direct"
    ].includes(c) && (t = !0);
  }
  for (const i of Rn)
    Object.prototype.hasOwnProperty.call(e, i) && (r.push(i), e[i] === !0 && (t = !0));
  for (const i of Ki)
    Object.prototype.hasOwnProperty.call(e, i) && r.push(i);
  return {
    legacyKeysPresent: wt(r),
    shouldAddToSourceDirectNodes: t,
    topLevelPortPresent: a !== null && a !== "",
    linePortCount: n,
    defaultPortNodePresent: s > 0,
    defaultPortLineCount: s
  };
}
function fu(o, e = {}) {
  const r = $r(o);
  return {
    mode: r,
    forceVideoDirect: r === "direct",
    forceVideoProxy: r === "proxy"
  };
}
function mu(o = {}) {
  return ri(o?.defaultMediaAuthMode);
}
function Za(o = {}) {
  return pa(o, "defaultPlaybackInfoMode") ? Gt(o?.defaultPlaybackInfoMode) : Reflect.get(o, "playbackInfoAutoProxy") !== void 0 ? Reflect.get(o, "playbackInfoAutoProxy") !== !1 ? "rewrite" : "passthrough" : Reflect.get(o, "playbackInfoBlockWangpanProxy") !== void 0 ? "rewrite" : v.Defaults.DefaultPlaybackInfoMode;
}
function pu(o = {}) {
  return Gt(Za(o));
}
function gu(o = {}) {
  return To(o?.defaultRealClientIpMode);
}
function hu(o = {}, e = {}) {
  const r = o || {}, t = o && typeof o == "object" && Object.prototype.hasOwnProperty.call(o, "mediaAuthMode") ? ar(r.mediaAuthMode) : "auto";
  return t === "inherit" ? mu(e) : t;
}
function yu(o = {}, e = {}) {
  const r = o || {}, t = o && typeof o == "object" && Object.prototype.hasOwnProperty.call(o, "playbackInfoMode") ? Pr(r.playbackInfoMode) : "inherit";
  return t === "inherit" ? pu(e) : t;
}
function Su(o = {}, e = {}) {
  const r = o || {}, t = o && typeof o == "object" && Object.prototype.hasOwnProperty.call(o, "realClientIpMode") ? Mr(r.realClientIpMode) : "forward";
  return t === "inherit" ? gu(e) : t;
}
function _u(o = {}, e = {}) {
  const r = o || {};
  return (o && typeof o == "object" && Object.prototype.hasOwnProperty.call(o, "hedgeProbePath") ? fa(r.hedgeProbePath) : "") || Ma(e?.hedgeProbePath, v.Defaults.HedgeProbePath);
}
function bu(o) {
  const e = To(typeof o == "string" ? o : o?.realClientIpMode);
  return e === "forward" ? "full" : e === "strip" ? "real-ip-only" : e === "disable" ? "none" : "full";
}
function zi(o = "") {
  const e = String(o || "").trim().toLowerCase();
  return e === "proxy_a" || e === "__proxy-a" ? "proxy_a" : e === "proxy_b" || e === "__proxy-b" ? "proxy_b" : "main";
}
function Eu(o = "main") {
  return Zn[zi(o)] || "";
}
function Wi(o = "") {
  const e = String(o || "").trim().toLowerCase();
  return e ? e === Zn.proxy_a ? "proxy_a" : e === Zn.proxy_b ? "proxy_b" : "main" : "main";
}
function la(o = "") {
  const e = String(o || "");
  if (!e) return {
    linkVariant: "main",
    remaining: "",
    needsTrailingSlashRedirect: !1
  };
  const r = e.startsWith("/") ? e : "/" + e, t = r.split("/"), a = Wi(Mt(t[1] || ""));
  return a === "main" ? {
    linkVariant: a,
    remaining: ee(r),
    needsTrailingSlashRedirect: !1
  } : {
    linkVariant: a,
    remaining: ee("/" + t.slice(2).join("/")),
    needsTrailingSlashRedirect: t.length === 2 && !r.endsWith("/")
  };
}
function Pa(o = {}) {
  return o.ENI_KV || o.KV || o.EMBY_KV || o.EMBY_PROXY || null;
}
function Ru(o = {}) {
  return o.DB || o.D1 || o.PROXY_LOGS || null;
}
var Tu = 16 * 1024;
async function ht(o, e) {
  const r = new TextEncoder(), t = Date.now();
  let a = oe.CryptoKeyCache.get(o);
  for ((!a || a.exp <= t) && (a = {
    key: await zn().importKey("raw", r.encode(o), {
      name: "HMAC",
      hash: "SHA-256"
    }, !1, ["sign"]),
    exp: t + v.Defaults.CryptoKeyCacheTTL * 1e3
  }), oe.CryptoKeyCache.has(o) && oe.CryptoKeyCache.delete(o), oe.CryptoKeyCache.set(o, a); oe.CryptoKeyCache.size > v.Defaults.CryptoKeyCacheMax; ) {
    const s = oe.CryptoKeyCache.keys().next().value;
    if (s === void 0) break;
    oe.CryptoKeyCache.delete(s);
  }
  const n = await zn().sign("HMAC", a.key, r.encode(e));
  return btoa(String.fromCharCode(...new Uint8Array(n))).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}
var Au = class {
  constructor({ actionHandlers: o, bindingService: e, configReader: r, repository: t, requestModel: a, shellService: n }) {
    this.actionHandlers = Object.freeze({ ...o }), this.bindingService = e, this.configReader = r, this.repository = t, this.requestModel = a, this.shellService = n, this.actionAliases = Object.freeze({
      import: "saveOrImport",
      save: "saveOrImport"
    }), this.#e();
  }
  async handle(o, e, r) {
    const t = this.#d(o, e), { requestHost: a, configuredHost: n, configuredLegacyHost: s } = t, i = o.method, c = i === "GET" || i === "HEAD";
    if (c && t.pathnameLower === "/favicon.ico") return this.#_(i);
    const l = await this.configReader.getRuntimeConfig(e), d = !!(s && s !== n && a === s), u = l.enableHostPrefixProxy === !0 && !!n && !d, f = u ? wo(a, n) : null, m = !!(u && a !== n && a.endsWith(`.${n}`));
    if (f || m) return null;
    if (i === "GET" && t.normalizedPathname === "/") return this.#m(e, t.initHealth);
    const p = c ? this.#b(t.normalizedPathname, t.adminPath) : null;
    if (p)
      return await this.#r(o, e) ? this.#h(o, e, r, p, l) : this.#R("Unauthorized", 401);
    if (c && this.#E(t.normalizedPathname, t.adminPath))
      return await this.#r(o, e) ? this.#y(o, e, t.initHealth, l) : this.#S(o, t.adminLoginPath);
    if (c && Lr(t.pathnameLower, t.adminLoginPathLower))
      return await this.#r(o, e) ? this.#S(o, t.adminPath) : this.#p(o, e, t.initHealth);
    if (c && Lr(t.pathnameLower, t.adminPathLower))
      return await this.#r(o, e) ? this.#g(o, e, r, t.initHealth) : this.#S(o, t.adminLoginPath);
    if (i === "OPTIONS" && this.#s(t)) return this.#t(o, e, null);
    if (i === "POST" && (Lr(t.pathnameLower, t.adminLoginPathLower) || this.#n(t))) return this.#i(o, e);
    if (i !== "POST" || !Lr(t.pathnameLower, t.adminPathLower)) return null;
    if (!await this.#r(o, e)) return z("UNAUTHORIZED", "未授权", 401);
    try {
      return await Qd(await this.#o(o, e, r));
    } catch (g) {
      const h = Cl(g, {
        code: "INTERNAL_ERROR",
        message: "Server Error",
        status: 500
      });
      return Ne("admin_api.unhandled_error", g, {
        path: t.pathnameLower,
        method: i,
        responseCode: h.code,
        responseStatus: h.status
      }, "error"), z(h.code, h.message, h.status, h.details);
    }
  }
  #e() {
    for (const [o, e] of Object.entries(this.actionHandlers)) {
      if (!this.#a(o)) throw new TypeError("Admin action names cannot be empty");
      if (typeof e != "function") throw new TypeError(`Admin action ${o} is not a function`);
    }
    for (const [o, e] of Object.entries(this.actionAliases)) if (!this.actionHandlers[e]) throw new Error(`Admin action alias ${o} targets missing action ${e}`);
  }
  #a(o) {
    return String(o || "").trim();
  }
  #f(o) {
    const e = this.#a(o), r = this.actionAliases[e] || e;
    return this.actionHandlers[r] || null;
  }
  async #o(o, e, r) {
    const t = this.bindingService.getKV(e);
    if (!t) return z("KV_NOT_CONFIGURED", "请先绑定 ENI_KV / KV Namespace", 503);
    let a;
    try {
      const i = await xe(o, Li);
      if (i.exceeded) return z("REQUEST_TOO_LARGE", "请求体过大", 413);
      a = JSON.parse(i.text || "");
    } catch {
      return z("INVALID_JSON", "请求 JSON 无效", 400);
    }
    const n = this.requestModel.normalizeAdminActionRequest(a);
    if (!n) return z("INVALID_REQUEST", "请求体必须是 JSON 对象", 400);
    const s = this.#f(n.action);
    return s ? s(n.data, {
      action: n.action,
      meta: n.meta,
      request: o,
      env: e,
      ctx: r,
      kv: t,
      db: this.bindingService.getDB(e)
    }) : z("INVALID_ACTION", "未知的管理动作", 400, { action: n.action || null });
  }
  #n(o) {
    return o.adminPathLower === "/admin" && o.pathnameLower === "/api/auth/login" && o.root === "api" && o.segments[1] === "auth" && o.segments[2] === "login";
  }
  #s(o) {
    return Mi(o.pathnameLower, o.adminPathLower) || Lr(o.pathnameLower, o.adminLoginPathLower) || this.#n(o);
  }
  #t(o, e, r, t = 200) {
    return this.shellService.buildEdgeCorsResponse(Ia(e, o), r, t, { mergeOriginVary: !0 });
  }
  #d(o, e) {
    const r = new URL(o.url), t = te(r.hostname), a = ee(r.pathname), n = a.toLowerCase(), s = nt(e), i = s.toLowerCase(), c = yn(s), l = c.toLowerCase(), d = xi(e, {
      adminPath: s,
      loginPath: c
    }), u = a.split("/").filter(Boolean), f = u[0] || "", m = Mt(f).toLowerCase();
    return {
      initHealth: d,
      requestUrl: r,
      requestHost: t,
      configuredHost: ze(e),
      configuredLegacyHost: Gr(e),
      normalizedPathname: a,
      pathnameLower: n,
      adminPath: s,
      adminPathLower: i,
      adminLoginPath: c,
      adminLoginPathLower: l,
      segments: u,
      rootRaw: f,
      root: m
    };
  }
  async #i(o, e) {
    const r = o.headers.get("cf-connecting-ip") || "unknown", t = this.repository.getDB(e), a = zd(e), n = await this.configReader.getRuntimeConfig(e), s = Math.max(1, parseInt(n.jwtExpiryDays) || 30) * 86400;
    try {
      const i = await ye(this.repository.getAuthFailureEntry(t, r), "auth.login.read_auth_failure", { ip: r }, null), c = Math.max(0, Number(i?.failCount) || 0);
      if (c >= v.Defaults.MaxLoginAttempts) return z("TOO_MANY_ATTEMPTS", "账户已锁定，请稍后再试", 429);
      let l = "";
      if ((o.headers.get("content-type") || "").includes("application/json")) {
        const u = await xe(o, Tu);
        if (u.exceeded) return z("REQUEST_TOO_LARGE", "请求体过大", 413);
        const f = JSON.parse(u.text || "{}");
        l = typeof f.password == "string" ? f.password : "";
      }
      if (!e.JWT_SECRET) return z("SERVER_MISCONFIGURED", "JWT_SECRET 未配置", 503);
      if (!e.ADMIN_PASS) return z("SERVER_MISCONFIGURED", "ADMIN_PASS 未配置", 503);
      if (l && l === e.ADMIN_PASS) {
        i && await ye(this.repository.deleteAuthFailureEntry(t, r), "auth.login.clear_auth_failure", { ip: r }, !1);
        const u = await this.#u(e.JWT_SECRET, s);
        return J({
          ok: !0,
          expiresIn: s
        }, 200, { "Set-Cookie": `auth_token=${u}; Path=${a}; Max-Age=${s}; HttpOnly; Secure; SameSite=Strict` });
      }
      const d = c + 1;
      return await ye(this.repository.upsertAuthFailureEntry(t, r, {
        failCount: d,
        expiresAt: k() + v.Defaults.LoginLockDuration * 1e3
      }), "auth.login.write_auth_failure", {
        ip: r,
        nextFailCount: d
      }, null), J({
        ok: !1,
        error: {
          code: "INVALID_PASSWORD",
          message: "密码错误"
        },
        remain: Math.max(0, v.Defaults.MaxLoginAttempts - d)
      }, 401);
    } catch (i) {
      return z("INVALID_REQUEST", "请求无效", 400, { reason: i.message });
    }
  }
  async #r(o, e) {
    try {
      const r = e.JWT_SECRET;
      if (!r) return !1;
      const t = o.headers.get("Authorization") || "";
      let a = t.startsWith("Bearer ") ? t.slice(7) : null;
      if (!a) {
        const n = (o.headers.get("Cookie") || "").match(/(?:^|;\s*)auth_token=([^;]+)/);
        a = n ? n[1] : null;
      }
      return a ? await this.#l(a, r) : !1;
    } catch {
      return !1;
    }
  }
  async #u(o, e) {
    const r = btoa(JSON.stringify({
      alg: "HS256",
      typ: "JWT"
    })).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, ""), t = btoa(JSON.stringify({
      sub: "admin",
      exp: Math.floor(Date.now() / 1e3) + e
    })).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
    return `${r}.${t}.${await this.#c(o, `${r}.${t}`)}`;
  }
  async #l(o, e) {
    const r = o.split(".");
    if (r.length !== 3 || r[2] !== await this.#c(e, `${r[0]}.${r[1]}`)) return !1;
    try {
      return JSON.parse(atob(r[1].replace(/-/g, "+").replace(/_/g, "/"))).exp > Math.floor(Date.now() / 1e3);
    } catch {
      return !1;
    }
  }
  async #c(o, e) {
    return ht(o, e);
  }
  #m(o, e) {
    return this.shellService.renderLandingPage(o, e);
  }
  #p(o, e, r) {
    return this.shellService.renderAdminLoginPage(o, e, r);
  }
  #g(o, e, r, t) {
    return this.shellService.renderAdminPage(o, e, r, t);
  }
  #h(o, e, r, t, a) {
    return this.shellService.renderAdminReleaseVendorAsset(o, e, r, t, a);
  }
  #y(o, e, r, t) {
    return this.shellService.renderAdminWarmResponse(o, e, r, t);
  }
  #_(o) {
    return this.shellService.renderFaviconResponse(o);
  }
  #b(o, e) {
    return this.shellService.resolveAdminReleaseVendorRouteMatch(o, e);
  }
  #E(o, e) {
    return this.shellService.isAdminWarmRoute(o, e);
  }
  #S(o, e) {
    return this.shellService.buildRequestPathRedirectResponse(o, e);
  }
  #R(...o) {
    return this.shellService.buildAdminReleaseVendorErrorResponse(...o);
  }
};
function Gi(o = "", e = "") {
  const r = String(o || "").trim().toLowerCase(), t = String(e || "").trim().toLowerCase();
  return t === "image" || r.includes("/images/") || r.includes("/emby/covers/") || /\.(jpe?g|png|webp|gif)(?:$|[?#])/.test(r) ? "image_poster" : r.includes("/sessions/playing") || r.includes("/playbackinfo") ? "playback_info" : r.includes("/users/authenticate") ? "auth" : r.includes("/items/") || r.includes("/shows/") || r.includes("/movies/") || r.includes("/users/") ? "media_metadata" : t || "api";
}
function Cu(o = "", e = "") {
  return Gi(o, e) === "playback_info";
}
function wu(o = "", e = "") {
  const r = String(o || "").trim().toLowerCase(), t = String(e || "").trim().toLowerCase();
  return t === "stream" || t === "segment" || t === "manifest" ? !0 : /\/stream(?:$|[/?])/.test(r) || r.includes("/master.m3u8") || /\/videos\/[^/]+\/(?:original|download|file)(?:$|[/?])/.test(r) || /\/items\/[^/]+\/download(?:$|[/?])/.test(r) || r.includes("static=true") || r.includes("download=true");
}
function Vi(o) {
  return String(o || "").trim().toLowerCase().replace(/[\s-]+/g, "_") === "poster_manifest" ? "poster_manifest" : "poster";
}
function ji(o) {
  const e = String(o || "").trim().toLowerCase();
  return e === "fts" ? "fts" : e === "like" ? "like" : v.Defaults.LogSearchMode;
}
function qi(o) {
  return String(o || "").trim().toLowerCase() === "error" ? "error" : v.Defaults.LogWriteMode;
}
function Lu(o) {
  const e = String(o || "").trim().toLowerCase().replace(/[\s-]+/g, "_");
  return e === "playback" || e === "playback_info" ? "playback_info" : e === "image" ? "image" : e === "api" ? "api" : e === "auth" ? "auth" : "";
}
function Du(o) {
  const e = String(o || "").trim().toLowerCase().replace(/[\s-]+/g, "_");
  return e === "4xx" || e === "status_4xx" ? "4xx" : e === "5xx" || e === "status_5xx" ? "5xx" : "";
}
function ys(o) {
  const e = String(o || "").trim().toLowerCase().replace(/[\s-]+/g, "_");
  return e === "direct" ? "direct" : e === "proxy" || e === "proxied" ? "proxy" : "";
}
function Nu(o = "") {
  const e = String(o || "").trim().toLowerCase().replace(/[\s-]+/g, "_");
  return e === "connect_timeout" ? "connect_timeout" : e === "idle_timeout" ? "idle_timeout" : e === "tls_handshake_failed" ? "tls_handshake_failed" : e === "http_version_fallback" ? "http_version_fallback" : e === "redirect_loop" ? "redirect_loop" : e === "redirect_limit_exceeded" ? "redirect_limit_exceeded" : e === "range_unsatisfied" ? "range_unsatisfied" : e === "upstream_4xx" ? "upstream_4xx" : e === "upstream_5xx" ? "upstream_5xx" : e === "unknown_fetch_error" ? "unknown_fetch_error" : "";
}
var Iu = Object.freeze({
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
function Mu(o) {
  const e = Math.trunc(Number(o) || 0);
  if (!Number.isFinite(e) || e <= 0) return {
    code: null,
    text: null
  };
  const r = Iu[e];
  return r ? {
    code: r.code,
    text: r.text
  } : {
    code: null,
    text: null
  };
}
function Pu(o) {
  const e = String(o || "").trim();
  return e ? /\b(?:AND|OR|NOT|NEAR)\b/i.test(e) || /(?:^|\s)(?:node_name|request_path|user_agent|error_detail)\s*:/i.test(e) || /(?:^|\s)[^\s"]+\*/.test(e) ? !0 : /^"(?:[^"]|"")+"$/.test(e) : !1;
}
function Xi(o) {
  return `"${String(o || "").replace(/"/g, '""')}"`;
}
function xu(o) {
  return `${Xi(o)}*`;
}
function Ou(o) {
  return String(o || "").replace(/(^|\s)((?:node_name|request_path|user_agent|error_detail)\s*:\s*)([^"\s()]+)(?=\s|$)/gi, (e, r, t, a) => `${r}${t}${Xi(a)}`);
}
function vu(o) {
  const e = String(o || "").trim();
  return e ? Pu(e) ? Ou(e) : e.split(/\s+/).filter(Boolean).map((r) => xu(r)).join(" AND ") : "";
}
function Yi(o = null) {
  if (!o || typeof o != "object") return null;
  const e = Math.floor(Number(o.timestamp)), r = Math.floor(Number(o.id));
  return !Number.isFinite(e) || !Number.isFinite(r) || e < 0 || r < 0 ? null : {
    timestamp: e,
    id: r
  };
}
function Fu(o = null) {
  return Yi({
    timestamp: Number(o?.timestamp),
    id: Number(o?.id)
  });
}
function fe(o) {
  return `"${String(o || "").replace(/"/g, '""')}"`;
}
function za(o) {
  return String(o || "").toLowerCase().replace(/["`\[\]]/g, "").replace(/\s+/g, " ").trim();
}
function vo(o = "") {
  const e = String(o || "").trim().toLowerCase();
  return e === "paid" ? "paid" : e === "free" ? "free" : "";
}
function gr(o = "") {
  const e = String(o || "").trim().toUpperCase();
  return e === "A" || e === "AAAA" || e === "CNAME";
}
function Wa(o, e, r = {}) {
  const t = String(o || "").trim().toUpperCase(), a = String(e || "").trim(), n = r.allowCname !== !1;
  if (!gr(t)) return "Type 仅允许 A / AAAA / CNAME";
  if (!n && t === "CNAME") return "A 模式仅允许 A / AAAA";
  if (!a) return "Content 不能为空";
  if (t === "A" && !Da(a)) return "A 记录 Content 必须是合法 IPv4 地址";
  if (t === "AAAA" && !pn(a)) return "AAAA 记录 Content 必须是合法 IPv6 地址";
  if (t === "CNAME") {
    if (/\s/.test(a)) return "CNAME 记录 Content 不能包含空格";
    if (a.length > 255) return "CNAME 记录 Content 过长";
  }
  return "";
}
function Uu(o = "") {
  const e = String(o || "").trim();
  return e ? Wa("CNAME", e) ? "" : e : "";
}
var Hu = [
  "logIncludeClientIp",
  "logIncludeColo",
  "logIncludeUa"
], Ji = [
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
], Qi = ["directSourceNodes", "nodeDirectList"], Zi = ["sourceSameOriginProxy", "forceExternalProxy"], ec = [
  "enableH2",
  "enableH3",
  "peakDowngrade"
], Ss = [
  ...Hu,
  ...Ji,
  ...Qi,
  ...Zi,
  ...ec
], ku = {
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
}, Ku = /* @__PURE__ */ new Set([...Ji, ...Zi]), tc = {
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
    "hedgeProbePreferGet",
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
      fallback: v.Defaults.LogRetentionDays,
      min: 1,
      max: v.Defaults.LogRetentionDaysMax
    },
    logFlushCountThreshold: {
      fallback: v.Defaults.LogFlushCountThreshold,
      min: 1,
      max: 5e3
    },
    logBatchChunkSize: {
      fallback: v.Defaults.LogBatchChunkSize,
      min: 1,
      max: 100
    },
    logBatchRetryCount: {
      fallback: v.Defaults.LogBatchRetryCount,
      min: 0,
      max: 5
    },
    logBatchRetryBackoffMs: {
      fallback: v.Defaults.LogBatchRetryBackoffMs,
      min: 0,
      max: 5e3
    },
    scheduledLeaseMs: {
      fallback: v.Defaults.ScheduledLeaseMs,
      min: v.Defaults.ScheduledLeaseMinMs,
      max: 900 * 1e3
    },
    uiRadiusPx: {
      fallback: v.Defaults.UiRadiusPx,
      min: 0,
      max: 48
    },
    tgAlertDroppedBatchThreshold: {
      fallback: v.Defaults.TgAlertDroppedBatchThreshold,
      min: 0,
      max: 5e3
    },
    tgAlertFlushRetryThreshold: {
      fallback: v.Defaults.TgAlertFlushRetryThreshold,
      min: 0,
      max: 10
    },
    tgAlertKvUsageThresholdPercent: {
      fallback: v.Defaults.TgAlertKvUsageThresholdPercent,
      min: 1,
      max: 100
    },
    tgAlertD1UsageThresholdPercent: {
      fallback: v.Defaults.TgAlertD1UsageThresholdPercent,
      min: 1,
      max: 100
    },
    tgAlertCooldownMinutes: {
      fallback: v.Defaults.TgAlertCooldownMinutes,
      min: 1,
      max: 1440
    },
    cacheTtlImages: {
      fallback: v.Defaults.CacheTtlImagesDays,
      min: 0,
      max: 365
    },
    pingTimeout: {
      fallback: v.Defaults.PingTimeoutMs,
      min: 1e3,
      max: 18e4
    },
    pingCacheMinutes: {
      fallback: v.Defaults.PingCacheMinutes,
      min: 0,
      max: 1440
    },
    hedgeProbeTimeoutMs: {
      fallback: v.Defaults.HedgeProbeTimeoutMs,
      min: 250,
      max: 1e4
    },
    hedgeProbeParallelism: {
      fallback: v.Defaults.HedgeProbeParallelism,
      min: 1,
      max: 2
    },
    hedgeWaitTimeoutMs: {
      fallback: v.Defaults.HedgeWaitTimeoutMs,
      min: 250,
      max: 1e4
    },
    hedgeLockTtlMs: {
      fallback: v.Defaults.HedgeLockTtlMs,
      min: 1e3,
      max: 1e4
    },
    hedgePreferredTtlSec: {
      fallback: v.Defaults.HedgePreferredTtlSec,
      min: 30,
      max: 3600
    },
    hedgeFailureCooldownSec: {
      fallback: v.Defaults.HedgeFailureCooldownSec,
      min: 1,
      max: 300
    },
    hedgeWakeJitterMs: {
      fallback: v.Defaults.HedgeWakeJitterMs,
      min: 0,
      max: 1e3
    },
    cfQuotaPlanCacheMinutes: {
      fallback: v.Defaults.CfQuotaPlanCacheMinutes,
      min: 1,
      max: 1440
    },
    upstreamTimeoutMs: {
      fallback: v.Defaults.UpstreamTimeoutMs,
      min: 0,
      max: 18e4
    },
    upstreamRetryAttempts: {
      fallback: v.Defaults.UpstreamRetryAttempts,
      min: 0,
      max: 3
    },
    prewarmCacheTtl: {
      fallback: v.Defaults.PrewarmCacheTtl,
      min: 0,
      max: 3600
    },
    prewarmPrefetchBytes: {
      fallback: v.Defaults.PrewarmPrefetchBytes,
      min: 0,
      max: Io
    },
    playbackInfoCacheTtlSec: {
      fallback: v.Defaults.PlaybackInfoCacheTtlSec,
      min: 0,
      max: 60
    },
    videoProgressForwardIntervalSec: {
      fallback: v.Defaults.VideoProgressForwardIntervalSec,
      min: 0,
      max: 60
    },
    scheduleUtcOffsetMinutes: {
      fallback: v.Defaults.ScheduleUtcOffsetMinutes,
      min: -720,
      max: 840
    }
  },
  numberFields: { logWriteDelayMinutes: {
    fallback: v.Defaults.LogFlushDelayMinutes,
    min: 0,
    max: 1440
  } },
  booleanTrueFields: [
    "protocolFallback",
    "enablePrewarm",
    "playbackInfoCacheEnabled",
    "videoProgressForwardEnabled",
    "hedgeProbePreferGet",
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
function Bu(o = {}, e = {}) {
  for (const [r, t] of Object.entries(e.aliasFields || {}))
    if (!(o[r] !== void 0 && o[r] !== null) && Array.isArray(t)) {
      for (const a of t)
        if (!(o[a] === void 0 || o[a] === null)) {
          o[r] = o[a];
          break;
        }
    }
  return o;
}
function $u(o = {}, e = {}) {
  const r = Array.isArray(e.allowedFields) ? e.allowedFields : [];
  if (!r.length) return o;
  const t = {};
  for (const a of r)
    Object.prototype.hasOwnProperty.call(o, a) && (t[a] = o[a]);
  return t;
}
function zu(o = {}, e = tc, r = {}) {
  let t = o && typeof o == "object" && !Array.isArray(o) ? { ...o } : {};
  t = Bu(t, e);
  for (const a of e.trimFields || [])
    t[a] === void 0 || t[a] === null || (t[a] = String(t[a]).trim());
  for (const [a, n] of Object.entries(e.arrayNormalizers || {}))
    Array.isArray(t[a]) && n === "nodeNameList" && typeof r.normalizeNodeNameList == "function" && (t[a] = r.normalizeNodeNameList(t[a]));
  for (const [a, n] of Object.entries(e.integerFields || {})) t[a] = de(t[a], n.fallback, n.min, n.max);
  for (const [a, n] of Object.entries(e.numberFields || {})) t[a] = il(t[a], n.fallback, n.min, n.max);
  for (const a of e.booleanTrueFields || []) t[a] = t[a] !== !1;
  for (const a of e.booleanFalseFields || []) t[a] = t[a] === !0;
  return $u(t, e);
}
function rc(o = {}) {
  const e = o && typeof o == "object" && !Array.isArray(o) ? o : {}, r = { ...e };
  let t = !1;
  const a = [], n = [], s = {};
  for (const c of Ss)
    Object.prototype.hasOwnProperty.call(e, c) && a.push(c);
  const i = (c, l) => {
    const d = String(c || "").trim(), u = String(l || "").trim();
    !d || !u || (n.push(u), s[d] || (s[d] = []), s[d].push(u));
  };
  if (!Object.prototype.hasOwnProperty.call(r, "sourceDirectNodes")) {
    for (const c of Qi)
      if (Object.prototype.hasOwnProperty.call(e, c)) {
        r.sourceDirectNodes = yt(e[c]), t = !0, i(c, "sourceDirectNodes");
        break;
      }
  }
  if (!Object.prototype.hasOwnProperty.call(r, "logWriteClientIp") && Reflect.get(e, "logIncludeClientIp") !== void 0 && (r.logWriteClientIp = e.logIncludeClientIp !== !1, t = !0, i("logIncludeClientIp", "logWriteClientIp")), !Object.prototype.hasOwnProperty.call(r, "logDisplayClientIp") && Reflect.get(e, "logIncludeClientIp") !== void 0 && (r.logDisplayClientIp = e.logIncludeClientIp !== !1, t = !0, i("logIncludeClientIp", "logDisplayClientIp")), !Object.prototype.hasOwnProperty.call(r, "logWriteColo") && Reflect.get(e, "logIncludeColo") !== void 0 && (r.logWriteColo = e.logIncludeColo !== !1, t = !0, i("logIncludeColo", "logWriteColo")), !Object.prototype.hasOwnProperty.call(r, "logDisplayColo") && Reflect.get(e, "logIncludeColo") !== void 0 && (r.logDisplayColo = e.logIncludeColo !== !1, t = !0, i("logIncludeColo", "logDisplayColo")), !Object.prototype.hasOwnProperty.call(r, "logWriteUa") && Reflect.get(e, "logIncludeUa") !== void 0 && (r.logWriteUa = e.logIncludeUa !== !1, t = !0, i("logIncludeUa", "logWriteUa")), !Object.prototype.hasOwnProperty.call(r, "logDisplayUa") && Reflect.get(e, "logIncludeUa") !== void 0 && (r.logDisplayUa = e.logIncludeUa !== !1, t = !0, i("logIncludeUa", "logDisplayUa")), !Object.prototype.hasOwnProperty.call(r, "protocolStrategy")) {
    let c = !1;
    for (const l of ec)
      Object.prototype.hasOwnProperty.call(e, l) && (i(l, "protocolStrategy"), c = !0);
    c && (r.protocolStrategy = Oo(e), t = !0);
  }
  Object.prototype.hasOwnProperty.call(r, "defaultPlaybackInfoMode") || (Reflect.get(e, "playbackInfoAutoProxy") !== void 0 ? (r.defaultPlaybackInfoMode = Za(e), t = !0, i("playbackInfoAutoProxy", "defaultPlaybackInfoMode")) : Reflect.get(e, "playbackInfoBlockWangpanProxy") !== void 0 && (r.defaultPlaybackInfoMode = Za(e), t = !0, i("playbackInfoBlockWangpanProxy", "defaultPlaybackInfoMode"))), Object.prototype.hasOwnProperty.call(r, "tgDailyReportClockTimes") || (r.tgDailyReportClockTimes = Nt(Object.prototype.hasOwnProperty.call(e, "tgDailyReportTime") ? e.tgDailyReportTime : e.tgDailyReportClockTimes, v.Defaults.TgDailyReportClockTimes), Object.prototype.hasOwnProperty.call(e, "tgDailyReportTime") && (t = !0, i("tgDailyReportTime", "tgDailyReportClockTimes")));
  for (const c of Ss)
    Object.prototype.hasOwnProperty.call(r, c) && (delete r[c], t = !0);
  return {
    config: r,
    migrated: t,
    legacyKeysPresent: wt(a),
    deletedLegacyFieldCount: wt(a).length,
    migratedConfigKeys: wt(n),
    migratedKeyMap: Object.fromEntries(Object.entries(s).map(([c, l]) => [c, wt(l)]))
  };
}
function re(o = {}) {
  const { config: e } = rc(o && typeof o == "object" && !Array.isArray(o) ? o : {});
  return ac(e);
}
function ac(o = {}) {
  const e = zu({
    ...o,
    defaultPlaybackInfoMode: pa(o, "defaultPlaybackInfoMode") ? Reflect.get(o, "defaultPlaybackInfoMode") : Za(o),
    protocolStrategy: pa(o, "protocolStrategy") ? Reflect.get(o, "protocolStrategy") : Oo(o)
  }, tc, { normalizeNodeNameList: yt });
  e.prewarmDepth = Vi(e.prewarmDepth), e.hedgeProbePath = Ma(e.hedgeProbePath, v.Defaults.HedgeProbePath), e.dnsDefaultFallbackCname = Uu(e.dnsDefaultFallbackCname), e.defaultHostPrefixCnameTarget = Vt(e.defaultHostPrefixCnameTarget), e.settingsExperienceMode = String(e.settingsExperienceMode || "").trim().toLowerCase() === "expert" ? "expert" : "novice", e.cfQuotaPlanOverride = vo(e.cfQuotaPlanOverride), e.logSearchMode = ji(e.logSearchMode), e.logWriteMode = qi(e.logWriteMode), e.routingDecisionMode = vr(e.routingDecisionMode), e.protocolStrategy = vi(e.protocolStrategy), e.defaultPlaybackInfoMode = Gt(e.defaultPlaybackInfoMode), e.defaultRealClientIpMode = To(e.defaultRealClientIpMode), e.defaultMediaAuthMode = ri(e.defaultMediaAuthMode), e.scheduleUtcOffsetMinutes = Ke(e.scheduleUtcOffsetMinutes), e.tgDailyReportClockTimes = Nt(e.tgDailyReportClockTimes, v.Defaults.TgDailyReportClockTimes);
  const r = Xe(e.indexUrl);
  return e.indexUrl = r ? Vr(r) : "", tu(e, o), e;
}
var Fo = ["cfApiToken", "tgBotToken"];
function Jr(o = {}) {
  const e = re(o);
  for (const r of Fo) delete e[r];
  return e;
}
function ft(o = {}) {
  return re(o);
}
function Wu(o = {}, e = {}) {
  const r = re(o), t = re(e);
  for (const a of Fo) String(t[a] || "").length > 0 ? r[a] = t[a] : delete r[a];
  return r;
}
function nc(o = {}, e = {}) {
  const r = U(o) ? { ...o } : {}, t = re(e);
  for (const a of Fo)
    Object.prototype.hasOwnProperty.call(r, a) || String(t[a] || "").length > 0 && (r[a] = t[a]);
  return r;
}
function Fn(o = {}, e = {}) {
  const r = nc(o, e), t = Xe(re(e).indexUrl);
  return r.indexUrl = t ? Vr(t) : "", r;
}
function Gu(o = "", e = {}) {
  const r = String(o || "").trim();
  if (!r) return;
  const t = r.split(".").pop() || "", a = ce(Q(re(e)));
  if (t !== a)
    throw we("CONFIG_REVISION_CONFLICT", "配置版本已变化，请刷新设置后重新提交", 409, {
      expectedRevision: r,
      currentHash: a
    });
}
function _a(o = {}) {
  if (!U(o)) return o;
  const e = {
    ...o,
    config: Jr(o.config || {})
  };
  return U(o.rollbackPayload) && Array.isArray(o.rollbackPayload.kvEntries) && (e.rollbackPayload = {
    ...o.rollbackPayload,
    kvEntries: o.rollbackPayload.kvEntries.map((r) => {
      if (!U(r) || r.exists !== !0) return r;
      const t = String(r.key || "");
      if (t === "sys:config_snapshots:v1") try {
        const a = JSON.parse(String(r.value || "[]"));
        return {
          ...r,
          value: JSON.stringify(Array.isArray(a) ? a.map((n) => _a(n)) : [])
        };
      } catch {
        return {
          ...r,
          value: JSON.stringify([])
        };
      }
      if (t !== "sys:theme") return r;
      try {
        return {
          ...r,
          value: JSON.stringify(Jr(JSON.parse(String(r.value || "{}"))))
        };
      } catch {
        return {
          ...r,
          value: JSON.stringify({})
        };
      }
    })
  }), e;
}
function oc(o = {}) {
  const e = rc(o);
  return {
    cleanedConfig: ac(e.config),
    legacyKeysPresent: e.legacyKeysPresent,
    deletedLegacyFieldCount: e.deletedLegacyFieldCount,
    migratedConfigKeys: e.migratedConfigKeys,
    migratedKeyMap: e.migratedKeyMap
  };
}
function Vu(o = []) {
  const e = [], r = [], t = /* @__PURE__ */ new Set();
  for (const a of Array.isArray(o) ? o : []) {
    const n = String(a || "").trim();
    if (!n) continue;
    const s = ku[n];
    if (Array.isArray(s) && s.length) {
      r.push(n);
      for (const i of s)
        !i || t.has(i) || (t.add(i), e.push(i));
      continue;
    }
    if (Ku.has(n)) {
      r.push(n);
      continue;
    }
    t.has(n) || (t.add(n), e.push(n));
  }
  return {
    changedKeys: e,
    removedLegacyKeys: wt(r)
  };
}
function ju(o) {
  if (!o || typeof o != "object" || Array.isArray(o)) return {
    snapshot: o,
    rewritten: !1,
    deletedLegacyFieldCount: 0,
    migratedConfigKeys: []
  };
  const e = oc(o.config && typeof o.config == "object" && !Array.isArray(o.config) ? o.config : {}), r = Vu(o.changedKeys), t = {
    ...o,
    changedKeys: r.changedKeys,
    changeCount: r.changedKeys.length,
    config: e.cleanedConfig
  }, a = Array.isArray(o.changedKeys) ? o.changedKeys : [], n = Number(o.changeCount) || a.length || 0;
  return {
    snapshot: t,
    rewritten: Q(o.config || {}) !== Q(t.config) || Q(a) !== Q(t.changedKeys) || n !== t.changeCount,
    deletedLegacyFieldCount: e.deletedLegacyFieldCount + r.removedLegacyKeys.length,
    migratedConfigKeys: e.migratedConfigKeys
  };
}
function Bt(o = "", e = "") {
  const r = String(o || "").trim() || "empty";
  return `${String(e || "").trim() || (/* @__PURE__ */ new Date()).toISOString()}.${r}`;
}
function Ir(o, e = {}) {
  const r = ce(Q(o)), t = String(e.updatedAt || "").trim() || (/* @__PURE__ */ new Date()).toISOString();
  return {
    ...e,
    hash: r,
    updatedAt: t,
    revision: Bt(r, t)
  };
}
function eo(o = {}, e = {}) {
  const r = re(o), t = re(e), a = [.../* @__PURE__ */ new Set([...Object.keys(r), ...Object.keys(t)])].sort(), n = [];
  for (const s of a)
    Q(r[s]) !== Q(t[s]) && n.push({
      key: s,
      previousValue: r[s],
      nextValue: t[s]
    });
  return n;
}
function qu(o = [], e = 20) {
  const r = Math.max(1, Number(e) || 20);
  return [...new Set((Array.isArray(o) ? o : [o]).map((t) => String(t ?? "").trim()).filter(Boolean))].slice(0, r);
}
function mt(o = "", e = "", r = [], t = {}) {
  const a = qu(r, t.limit), n = Number(t.count), s = Number.isFinite(n) ? Math.max(0, Math.floor(n)) : a.length, i = String(t.note || "").trim();
  return {
    key: String(o || "").trim(),
    label: String(e || "").trim(),
    count: s,
    countIsLowerBound: t.countIsLowerBound === !0,
    samples: a,
    truncated: s > a.length,
    note: i
  };
}
function Ee(o, e, r = "", t = "", a = [], n = 0, s = "") {
  return e && o.push(mt(r, t, a, {
    count: n,
    note: s
  })), o;
}
function Xu(o = {}) {
  const e = [], r = wt(o.configFieldTargets || []);
  if (r.length > 0) {
    const i = [];
    o.sourceDirectNodesFromLegacyNodes === !0 && i.push("包含节点遗留直连标记折叠进 sourceDirectNodes"), Number(o.rewrittenSnapshotCount) > 0 && i.push(`会同步迁移 ${Math.max(0, Math.floor(Number(o.rewrittenSnapshotCount) || 0))} 份旧快照中的相关配置字段`), e.push(mt("config_current_fields", "全局设置当前字段", r, {
      count: r.length,
      note: i.join("；") || "会把旧版配置别名收敛到当前 schema。"
    }));
  }
  const t = Math.max(0, Math.floor(Number(o.migratedTopLevelPortNodeCount) || 0)), a = Math.max(0, Math.floor(Number(o.migratedLinePortCount) || 0)), n = Math.max(0, Math.floor(Number(o.migratedDefaultPortNodeCount) || 0)), s = Math.max(0, Math.floor(Number(o.migratedDefaultPortLineCount) || 0));
  if (t > 0 || a > 0 || n > 0 || s > 0) {
    const i = [];
    t > 0 && i.push(`旧版顶层 node.port 节点 ${t} 个`), a > 0 && i.push(`旧版 lines[].port 线路 ${a} 条`), n > 0 && i.push(`隐式默认端口节点 ${n} 个`), s > 0 && i.push(`按协议补齐默认端口线路 ${s} 条`), e.push(mt("node_current_fields", "节点当前字段", ["lines[].target"], {
      count: 1,
      note: `会把端口统一收敛到当前字段。${i.join("，")}。`
    }));
  }
  return e;
}
function Yu(o = []) {
  return (Array.isArray(o) ? o : []).map((e) => e?.name || e?.id);
}
async function Le(o, e, r = {}) {
  if (!o) return null;
  const t = String(e || "").trim(), a = U(r) ? r : {};
  try {
    return Object.prototype.hasOwnProperty.call(a, "type") ? await o.get(t, { type: a.type }) : await o.get(t);
  } catch (n) {
    throw Qs("get", { key: t }, ie(n));
  }
}
async function Ju(o, e = {}) {
  if (!o || typeof o.list != "function") return {
    keys: [],
    list_complete: !0,
    cursor: ""
  };
  const r = U(e) ? e : {}, t = String(r.prefix || "").trim(), a = String(r.cursor || "").trim();
  try {
    return a ? await o.list({
      prefix: t,
      cursor: a
    }) : await o.list({ prefix: t });
  } catch (n) {
    throw Qs("list", { prefix: t }, ie(n));
  }
}
var Qu = "sys:theme";
function sc(o, e = {}) {
  const r = String(o || "").trim(), t = r.toLowerCase(), a = String(e.zoneId || "").trim(), n = {
    status: "CF 查询失败",
    hint: "Cloudflare 查询失败，请检查 Zone ID、API 令牌与资源范围",
    detail: r || (a ? `当前查询的 Zone ID: ${a}` : "")
  };
  return r ? t.includes("unknown field") || t.includes("unknown enum") || t.includes("error parsing args") ? {
    status: "Schema 不兼容",
    hint: "当前账号可用的 GraphQL schema 与脚本查询字段不一致",
    detail: r
  } : t.includes("cf_graphql_http_429") || t.includes("rate limit") || t.includes("too many requests") ? {
    status: "请求过于频繁",
    hint: "Cloudflare GraphQL 已限流，请稍后再试",
    detail: r
  } : t.includes("invalid token") || t.includes("authentication") || t.includes("cf_graphql_http_401") ? {
    status: "令牌无效",
    hint: "Cloudflare API 令牌无效，或未启用 GraphQL Analytics 访问",
    detail: r
  } : t.includes("not authorized") || t.includes("permission") || t.includes("forbidden") || t.includes("unauthorized") || t.includes("cf_graphql_http_403") ? {
    status: "权限或范围不匹配",
    hint: "令牌权限不足，或 Account / Zone Resources 未覆盖当前查询",
    detail: r + (a ? ` | Zone ID: ${a}` : "")
  } : t.includes("zone") && (t.includes("not found") || t.includes("invalid") || t.includes("unknown")) ? {
    status: "Zone ID 无效",
    hint: "Zone ID 无效，或当前令牌无法访问这个 Zone",
    detail: r + (a ? ` | Zone ID: ${a}` : "")
  } : t.includes("cf_graphql_http_400") ? {
    status: "请求参数无效",
    hint: "GraphQL 请求参数无效，请检查 Zone ID 与筛选条件",
    detail: r + (a ? ` | Zone ID: ${a}` : "")
  } : n : n;
}
async function Ae(o) {
  const e = Pa(o);
  if (!e) return {};
  const r = xo(o), t = _n(o), a = t.ConfigCache;
  if (a?.exp > k() && a.data) return a.data;
  const n = t.RuntimeConfigCacheGeneration;
  return await Sn(t.SingleFlightTasks, ot([
    "runtime_config",
    r,
    n
  ]), async () => {
    const s = t.ConfigCache;
    if (s?.exp > k() && s.data) return s.data;
    const i = s?.data && typeof s.data == "object" ? s.data : a?.data && typeof a.data == "object" ? a.data : null;
    let c = i || {};
    try {
      c = re(await e.get("sys:theme", { type: "json" }) || {});
    } catch (l) {
      const d = i && typeof i == "object";
      Ne("runtime_config.load_failed", l, {
        cacheNamespace: r,
        configKey: Qu,
        usedCachedConfig: d === !0
      }), c = d ? i : re({});
    }
    return t.RuntimeConfigCacheGeneration === n && (t.ConfigCache = {
      data: c,
      exp: k() + v.Defaults.CacheTTL,
      namespace: r
    }), c;
  });
}
async function ue(o) {
  const e = Pa(o);
  return e ? re(await Le(e, "sys:theme", { type: "json" }) || {}) : {};
}
function Zu(o = {}, e = {}) {
  const { indexRepository: r } = o;
  async function t(f, m, p, g = ke(m), h = null) {
    const y = U(h) ? re(h) : re(await ue(m)), S = await r.getAdminActiveIndexRecord(r.getKV(m)), _ = S ? re({
      ...y,
      indexUrl: S.sourceUrl
    }) : y;
    if (e.isAdminIndexSetupForced(f)) return e.renderAdminIndexSetupPage(f, m, p, g, _, "manual_setup_requested");
    const A = gt(m, _);
    if (!A.indexUrl) {
      try {
        const E = await e.renderBundledAdminPage(f, m, p, g, _);
        if (E) return E;
      } catch (E) {
        return Ne("admin.bundled_shell_render", E, { path: new URL(f.url).pathname }), e.renderAdminIndexSetupPage(f, m, p, g, _, "bundled_shell_render_failed");
      }
      return e.renderAdminIndexSetupPage(f, m, p, g, _);
    }
    const b = A.indexUrl;
    if (b) try {
      const E = await e.renderRemoteAdminPage(f, m, p, g, b, _);
      if (E) return E;
    } catch (E) {
      return Ne("admin.remote_shell_render", E, {
        path: new URL(f.url).pathname,
        remoteShellIndexUrl: b
      }), e.renderAdminRemoteShellErrorPage(f, m, p, g, {
        indexState: A,
        remoteShellIndexUrl: b,
        sourceType: "remote_error",
        routeState: "remote_error",
        remoteCacheState: "bypassed",
        lastFetchStatus: "failed",
        reason: `remote_shell_render_failed: ${String(E?.message || E || "unknown_error").trim()}`
      }, _);
    }
    return e.renderAdminIndexSetupPage(f, m, p, g, _, "index_url_not_configured");
  }
  async function a(f = [], m) {
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
  function n(f) {
    return new Request(f, {
      method: "HEAD",
      headers: { Accept: "*/*" },
      cache: "no-store"
    });
  }
  function s(f) {
    return f?.ok === !0 || Number(f?.status) === 304;
  }
  async function i(f, m, p = ke(m), g = null) {
    const h = U(g) ? re(g) : re(await ue(m)), y = gt(m, h);
    if (!y.indexUrl) return z("ADMIN_INDEX_NOT_CONFIGURED", "管理台 index.html 尚未配置", 409);
    const S = [], _ = { waitUntil(O) {
      S.push(Promise.resolve(O));
    } }, A = nt(m), b = new URL(f.url);
    b.pathname = A, b.search = "";
    const E = await e.renderRemoteAdminPage(n(b), m, _, p, y.indexUrl, h);
    await Promise.all(S.splice(0));
    const R = dr(), L = y.assetRevision || y.releaseTag, T = y.isLocalUpload ? await r.getAdminIndexUploadRecord(r.getKV(m), y.localUploadRevision) : null;
    let D = null;
    T?.manifest ? (D = await e.readAdminReleaseVendorManifestFromCache(R, L, y.indexUrl), D || (D = await e.cacheAdminReleaseVendorManifest(R, T.manifest, _))) : D = await e.getOrCreateAdminReleaseVendorManifest(R, L, y.indexUrl, _);
    const w = (Array.isArray(D?.entries) ? D.entries : []).filter((O) => O?.assetKey && !e.isMutableJsdelivrGithubAssetUrl(O.upstreamUrl)), M = await a(w, async (O) => {
      const N = e.buildAdminReleaseVendorProxyPath(A, L, O.assetKey), I = new URL(f.url);
      return I.pathname = N, I.search = "", e.renderAdminReleaseVendorAsset(n(I), m, _, {
        releaseTag: L,
        assetKey: O.assetKey
      }, h);
    });
    await Promise.all(S.splice(0));
    const x = M.filter((O) => !s(O)).length, C = s(E), F = JSON.stringify({
      ok: C && x === 0,
      shellStatus: Number(E?.status) || 0,
      warmedAssetCount: w.length - x,
      failedAssetCount: x
    }), W = new Headers({
      "Content-Type": "application/json;charset=UTF-8",
      "Cache-Control": "no-store, max-age=0"
    });
    return Ce(W), new Response(f.method === "HEAD" ? null : F, {
      status: C && x === 0 ? 200 : 502,
      headers: W
    });
  }
  function c(f, m = ke(f)) {
    const p = nt(f), g = m.ok ? "" : `<div class="landing-banner"><div class="landing-banner-title">系统未初始化</div><div class="landing-banner-text">缺少关键环境变量：${m.missing.map((S) => Te(S)).join("、")}</div></div>`, h = `<!DOCTYPE html><html lang="zh-CN"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"><link rel="icon" href="/favicon.ico" sizes="any"><title>Emby Proxy V19.3</title>${e.LANDING_PAGE_STYLE_HTML}</head><body><main class="landing-shell"><section class="landing-card"><div class="landing-grid"><div class="landing-primary">${g}<div class="landing-pill">Headless Edge Relay</div><h1 class="landing-title">Emby Proxy V19.3</h1><p class="landing-text">为了极致优化视频代理性能，根路径默认只保留无头中继与说明壳；真正的管理台入口固定收口到 <span class="landing-highlight">${Te(p)}</span>，并由 Worker 读取随部署发布或已上传的 <code>index.html</code> 返回。</p><div class="landing-actions"><a href="${Te(p)}" class="landing-btn landing-btn-primary">访问 ${Te(p)}</a><a href="https://github.com/axuitomo/CF-EMBY-PROXY-UI" target="_blank" rel="noopener noreferrer" class="landing-btn landing-btn-secondary">查看项目说明</a></div></div><div class="landing-side"><div class="landing-notes"><div class="landing-notes-title">Routing Notes</div><ul class="landing-note-list"><li>根路径仅提供静态说明页，不承载实时配置数据。</li><li><code>${Te(p)}</code> 只负责返回管理台壳与 bootstrap，动态数据继续走 <code>POST ${Te(p)}</code> API。</li><li>正式真相源固定为 <code>frontend/</code>、<code>worker.js</code> 与 <code>worker.md</code>。</li><li>媒体代理、日志与 KV / D1 逻辑保持原 Worker 主链路不变。</li></ul></div></div></div></section></main></body></html>`, y = new Headers({
      "Content-Type": "text/html;charset=UTF-8",
      "Cache-Control": "public, max-age=3600, s-maxage=86400"
    });
    return Ce(y), y.set("X-Frame-Options", "DENY"), new Response(h, { headers: y });
  }
  function l(f, m = "/", p = 302) {
    const g = new URL(f.url);
    g.pathname = ee(m || "/"), g.search = "", g.hash = "";
    const h = new Headers({
      Location: g.toString(),
      "Cache-Control": "no-store, max-age=0"
    });
    return Ce(h), new Response(null, {
      status: p,
      headers: h
    });
  }
  async function d(f, m, p = ke(m)) {
    const g = nt(m), h = Po(m), y = Yn(p), S = Yr({
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
      </style></head><body><main class="login-shell"><section class="login-card"><div>${y}</div><div class="login-grid"><section class="login-hero"><div class="eyebrow">Worker Admin Access</div><h1 class="title">登录管理台壳层</h1><p class="subtitle">这个入口只负责建立 Worker 的同源登录态。登录成功后会直接返回主控制台，后续的节点治理、日志诊断、DNS/IP 池与发布操作继续复用同一份 Cookie。</p><div class="meta-grid"><article class="meta-card"><div class="meta-label">Admin Path</div><div class="meta-value">${Te(g)}</div></article><article class="meta-card"><div class="meta-label">Login Endpoint</div><div class="meta-value">POST ${Te(h)}</div></article><article class="meta-card"><div class="meta-label">Init Health</div><div class="meta-value">${p.ok ? "已通过" : `未通过：${Te((Array.isArray(p.missing) ? p.missing : []).join(" / ") || "请检查环境变量")}`}</div></article><article class="meta-card"><div class="meta-label">Current Mode</div><div class="meta-value">独立登录壳，不再复用 /admin 远端 shell</div></article></div><div class="actions"><a href="${Te(g)}" class="action-link secondary">返回管理台</a><a href="/" class="action-link primary">回到根路径说明页</a></div></section><section class="login-form"><form id="admin-login-form" class="form-panel" action="${Te(h)}" method="post" novalidate><div><p class="form-title">输入管理密码</p><p class="hint">页面会继续调用已有的 <code>POST ${Te(h)}</code> JSON 登录接口，不会新增第二套鉴权协议。</p></div><label class="field" for="admin-login-password"><span class="field-label">管理密码</span><input id="admin-login-password" name="password" type="password" class="field-input" autocomplete="current-password" placeholder="请输入 ADMIN_PASS" required /></label><button id="admin-login-submit" type="submit" class="submit-btn">登录并进入控制台</button><div id="admin-login-status" class="status" role="status" aria-live="polite">等待输入密码。登录成功后会跳转到 ${Te(g)}。</div></form><noscript><div class="noscript">当前登录壳需要浏览器启用 JavaScript，因为 Worker 现阶段继续复用原有 JSON 登录接口来写入 Cookie。</div></noscript></section></div></section></main><script>
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
  function u(f, m, p = 200, g = {}) {
    const h = new Headers(f);
    return Ce(h), g.mergeOriginVary === !0 && h.get("Access-Control-Allow-Origin") !== "*" && Kr(h, "Origin"), new Response(m, {
      status: p,
      headers: h
    });
  }
  return {
    renderAdminPage: t,
    warmAdminReleaseVendorEntries: a,
    buildAdminWarmSubrequest: n,
    isAdminWarmResponseSuccessful: s,
    renderAdminWarmResponse: i,
    renderLandingPage: c,
    buildRequestPathRedirectResponse: l,
    renderAdminLoginPage: d,
    buildEdgeCorsResponse: u
  };
}
function Uo(o = "") {
  return /(?:^|\/)smartstrm(?:$|[/?])/i.test(String(o || ""));
}
function ba(o = "") {
  return en(o) || /\/audio\/[^/]+(?:\/|$)/i.test(String(o || "")) || /\/livetv\/[^/]+(?:\/|$)/i.test(String(o || "")) || Uo(o);
}
function ef(o = "") {
  const e = String(o || "").trim();
  return /^[a-z][a-z0-9+.-]*:/i.test(e) || e.startsWith("//");
}
function ic(o = "") {
  return /\/playbackinfo(?:$|[/?])/i.test(String(o || ""));
}
function en(o = "") {
  const e = ee(o);
  return ic(e) || Uo(e) || bt.test(e) || Ni.test(e) ? !0 : /\/videos\/[^/]+\/(?:stream|original|download|file)\b/i.test(e) || /\/items\/[^/]+\/download\b/i.test(e);
}
function cc(o = "") {
  return /\/sessions\/playing\/progress(?:$|[/?])/i.test(String(o || ""));
}
function lc(o = "") {
  return /\/sessions\/playing\/stopped(?:$|[/?])/i.test(String(o || ""));
}
function tf(o = "") {
  return /\/sessions\/playing\/ping(?:$|[/?])/i.test(String(o || ""));
}
function rf(o = "") {
  const e = String(o || "");
  return cc(e) || lc(e) || tf(e) ? !1 : /\/sessions\/playing(?:\/started)?(?:$|[/?])/i.test(e);
}
function af(o = {}, e = {}) {
  function r(t, a) {
    let n = a;
    const s = Mt(t[n]);
    let i = Wi(s) === "main" ? "/" + s : "";
    for (n += 1; n < t.length; n += 1) i += "/" + Mt(t[n]);
    return en(i || "/");
  }
  return { isPlaybackCriticalSegments: r };
}
function nf(o = {}) {
  const e = {};
  for (const [r, t] of Object.entries(Vd(o, e))) e[r] = t;
  for (const [r, t] of Object.entries(jd(o, e))) e[r] = t;
  for (const [r, t] of Object.entries(Xd(o, e))) e[r] = t;
  for (const [r, t] of Object.entries(Yd(o, e))) e[r] = t;
  for (const [r, t] of Object.entries(Zu(o, e))) e[r] = t;
  for (const [r, t] of Object.entries(af(o, e))) e[r] = t;
  return e;
}
function tn(o) {
  if (!o || o === 0) return "0 B";
  const e = 1024, r = [
    "B",
    "KB",
    "MB",
    "GB",
    "TB"
  ], t = Math.floor(Math.log(o) / Math.log(e));
  return parseFloat((o / Math.pow(e, t)).toFixed(2)) + " " + r[t];
}
var dc = 1024 * 1024 * 1024, of = 500 * 1024 * 1024, sf = 10 * 1024 * 1024 * 1024, Ho = Object.freeze({
  planClass: "free",
  planLabel: "FREE",
  periodLabel: "今日",
  kv: {
    read: 1e5,
    write: 1e3,
    delete: 1e3,
    list: 1e3,
    storageBytes: dc
  },
  d1: {
    rowsRead: 5e6,
    rowsWritten: 1e5,
    storageBytes: of
  }
}), uc = Object.freeze({
  planClass: "paid",
  planLabel: "PAID",
  periodLabel: "本月",
  kv: {
    read: 1e7,
    write: 1e6,
    delete: 1e6,
    list: 1e6,
    storageBytes: dc
  },
  d1: {
    rowsRead: 25e9,
    rowsWritten: 5e7,
    storageBytes: sf
  }
}), cf = Object.freeze({
  free: Ho,
  paid: uc
});
function Se(o) {
  const e = Number(o);
  return Number.isFinite(e) ? Math.max(0, Math.round(e)).toLocaleString("en-US") : "0";
}
function Ea(o) {
  const e = Number(o);
  return !Number.isFinite(e) || e <= 0 ? 0 : e >= 100 ? 100 : Math.max(0, Math.round(e * 10) / 10);
}
function lf(o = 0) {
  const e = Number(o);
  return !Number.isFinite(e) || e <= 0 ? "slate" : e >= 90 ? "danger" : e >= 70 ? "warning" : "success";
}
function Ra(o = "") {
  return String(o || "").trim().toLowerCase() || "bundled";
}
function fc(o = "") {
  const e = Ra(o);
  return e === "standard" || e === "unbound" ? {
    ...uc,
    usageModel: e
  } : {
    ...Ho,
    usageModel: e
  };
}
function to(o = {}) {
  const e = vo(o?.override);
  return e ? {
    ...Ta(e),
    usageModel: Ra(o?.usageModel),
    override: e
  } : {
    ...fc(o?.usageModel),
    override: ""
  };
}
function Ta(o = "free") {
  return cf[String(o || "").trim().toLowerCase() === "paid" ? "paid" : "free"] || Ho;
}
async function df(o = {}) {
  const e = re(U(o) ? o : {}), r = vo(e.cfQuotaPlanOverride);
  if (r) return to({ override: r });
  const t = String(e.cfAccountId || "").trim(), a = String(e.cfApiToken || "").trim();
  if (!t || !a) return {
    ...Ta("free"),
    usageModel: Ra("bundled"),
    override: ""
  };
  try {
    return to({ usageModel: await yc(t, a) });
  } catch {
    return {
      ...Ta("free"),
      usageModel: Ra("bundled"),
      override: ""
    };
  }
}
function uf(o = {}) {
  const e = U(o) ? o : {}, r = Math.max(1, Math.floor(Number(e.writeLimit) || 0)), t = Math.max(0, Math.floor(Number(e.estimatedPutCount) || 0)), a = Math.max(0, Math.floor(Number(e.estimatedRollbackWriteCount) || 0)), n = Math.max(0, Math.floor(Number(e.estimatedWorstCaseWriteCount) || 0)), s = Math.max(0, n - r), i = String(e.planLabel || "").trim() || "FREE", c = String(e.periodLabel || "").trim() || "今日";
  return n <= r ? "" : `KV 整理已拦截：当前 ${i} 计划 · ${c} 写入上限为 ${Se(r)}，本次预计写入 ${Se(t)} 次，最坏回滚写回 ${Se(a)} 次，最坏共 ${Se(n)} 次，超出 ${Se(s)} 次。`;
}
function ff(o = {}) {
  const e = U(o) ? o : {}, r = String(e.planLabel || "").trim() || "FREE", t = String(e.periodLabel || "").trim() || "今日", a = Math.max(1, Math.floor(Number(e.writeLimit) || 0)), n = Math.max(0, Math.floor(Number(e.estimatedPutCount) || 0)), s = Math.max(0, Math.floor(Number(e.estimatedDeleteCount) || 0)), i = Math.max(0, Math.floor(Number(e.estimatedRollbackWriteCount) || 0)), c = Math.max(0, Math.floor(Number(e.estimatedWorstCaseWriteCount) || 0));
  return `KV 配额预算：${r} 计划 · ${t}，预计 put ${Se(n)} 次，delete ${Se(s)} 次，最坏回滚写回 ${Se(i)} 次，最坏写入 ${Se(c)} / ${Se(a)}。`;
}
function mf(o = "free", e = /* @__PURE__ */ new Date()) {
  const r = String(o || "").trim().toLowerCase() === "paid" ? "paid" : "free", t = e instanceof Date ? new Date(e.getTime()) : new Date(e || Date.now()), a = t.toISOString();
  if (r === "paid") {
    const i = new Date(Date.UTC(t.getUTCFullYear(), t.getUTCMonth(), 1, 0, 0, 0, 0)), c = new Date(Date.UTC(t.getUTCFullYear(), t.getUTCMonth() + 1, 1, 0, 0, 0, 0));
    return {
      planClass: r,
      periodLabel: "本月",
      startIso: i.toISOString(),
      endIso: a,
      resetAtIso: c.toISOString(),
      cacheBucketKey: `${t.getUTCFullYear()}-${String(t.getUTCMonth() + 1).padStart(2, "0")}`
    };
  }
  const n = new Date(Date.UTC(t.getUTCFullYear(), t.getUTCMonth(), t.getUTCDate(), 0, 0, 0, 0)), s = new Date(Date.UTC(t.getUTCFullYear(), t.getUTCMonth(), t.getUTCDate() + 1, 0, 0, 0, 0));
  return {
    planClass: r,
    periodLabel: "今日",
    startIso: n.toISOString(),
    endIso: a,
    resetAtIso: s.toISOString(),
    cacheBucketKey: n.toISOString().slice(0, 10)
  };
}
function Kt(o, e = "cloudflare_runtime_error") {
  return String(o?.message || o || e).trim().replace(/\s+/g, " ").slice(0, 240) || e;
}
function _s(o, e = "count") {
  return e === "bytes" ? tn(Math.max(0, Number(o) || 0)) : Se(o);
}
function bs(o = 0, e = k()) {
  const r = Math.max(0, Number(o) || 0), t = Math.max(r, Number(e) || k());
  if (r <= 0) return "";
  const a = Math.max(0, t - r);
  return a < 60 * 1e3 ? "缓存年龄：不到 1 分钟" : a < 3600 * 1e3 ? `缓存年龄：${Math.max(1, Math.round(a / (60 * 1e3)))} 分钟` : `缓存年龄：${Math.max(1, Math.round(a / (3600 * 1e3)))} 小时`;
}
function Tr({ key: o = "", label: e = "", used: r = 0, limit: t = 0, kind: a = "count" } = {}) {
  const n = Math.max(0, Number(r) || 0), s = Math.max(0, Number(t) || 0), i = s > 0 ? n / s * 100 : 0, c = Ea(i);
  return {
    key: String(o || "").trim(),
    label: String(e || "").trim(),
    usedValue: n,
    limitValue: s,
    usedText: _s(n, a),
    limitText: _s(s, a),
    percent: c,
    percentText: `${c % 1 === 0 ? Math.round(c) : c}%`,
    tone: lf(i),
    rawPercent: i
  };
}
function Es(o = []) {
  return (Array.isArray(o) ? o : []).filter((e) => Number(e?.rawPercent) > 100).map((e) => String(e?.label || "").trim()).filter(Boolean);
}
function rn(o = {}, e = {}) {
  const r = (Array.isArray(o.metrics) ? o.metrics : []).map((t) => ({
    key: String(t?.key || "").trim(),
    label: String(t?.label || "").trim(),
    usedText: String(t?.usedText || "").trim(),
    limitText: String(t?.limitText || "").trim(),
    percent: Ea(t?.percent),
    percentText: String(t?.percentText || `${Ea(t?.percent)}%`).trim(),
    tone: String(t?.tone || "slate").trim() || "slate"
  })).filter((t) => t.key && t.label);
  return {
    title: String(o.title || e.title || "Cloudflare").trim() || "Cloudflare",
    status: String(o.status || e.status || "idle").trim() || "idle",
    summary: String(o.summary || e.summary || "暂无运行记录").trim() || "暂无运行记录",
    detail: String(o.detail || e.detail || "").trim(),
    lines: (Array.isArray(o.lines) ? o.lines : Array.isArray(e.lines) ? e.lines : []).map((t) => String(t || "").trim()).filter(Boolean),
    planLabel: String(o.planLabel || e.planLabel || "").trim(),
    periodLabel: String(o.periodLabel || e.periodLabel || "").trim(),
    resourceLabel: String(o.resourceLabel || e.resourceLabel || "").trim(),
    metrics: r
  };
}
function Ar(o = "", e = "", r = "") {
  return rn({
    title: o,
    status: "skipped",
    summary: e,
    detail: r
  });
}
function Cr(o = "", e = "", r = "") {
  return rn({
    title: o,
    status: "failed",
    summary: e,
    detail: r
  });
}
function pf(o = "", e = {}, r = 0, t = []) {
  const a = Math.max(1, Math.min(100, Math.round(Number(r) || 0))), n = e && typeof e == "object" ? e : {}, s = (Array.isArray(t) ? t : []).map((p) => ({
    label: String(p?.label || "").trim(),
    percentText: String(p?.percentText || `${Ea(p?.percent)}%`).trim()
  })).filter((p) => p.label), i = String(n.resourceLabel || "").trim() || String(o || "").trim(), c = String(n.planLabel || "").trim(), l = String(n.periodLabel || "").trim(), d = [i], u = [c, l].filter(Boolean);
  u.length > 0 && d.push(`（${u.join(" / ")}）`);
  const f = s.map((p) => `${p.label} ${p.percentText}`).join("、"), m = String(n.status || "").trim().toLowerCase() === "partial_failure" ? "（使用缓存数据）" : "";
  return `${String(o || "Cloudflare").trim() || "Cloudflare"} 使用量达到阈值：${d.join("")}，${f}（阈值 ${a}%）${m}`;
}
function Un(o = [], e = []) {
  const r = new Set((Array.isArray(e) ? e : [e]).map((t) => String(t || "").trim()).filter(Boolean));
  for (const t of Array.isArray(o) ? o : []) {
    const a = String(t?.key || "").trim();
    if (!r.has(a)) continue;
    const n = String(t?.percentText || "").trim();
    if (n) return n;
    if (t?.percent !== void 0 && t?.percent !== null) return `${Ea(t.percent)}%`;
  }
  return "暂不可用";
}
function gf(o = {}, e = {}) {
  const r = o && typeof o == "object" ? o : {}, t = e && typeof e == "object" ? e : {}, a = String(r.requestCountDisplay || "").trim() || (r.todayRequests === null || r.todayRequests === void 0 ? "暂不可用" : String(Number(r.todayRequests) || 0)), n = String(r.todayTraffic || "").trim() || "暂不可用", s = String(r.monthlyTraffic || "").trim() || "暂不可用", i = Math.max(0, Number(r.playCount) || 0), c = Math.max(0, Number(r.infoCount) || 0);
  return [
    `📊 EMBY-PROXY每日报表${t.dateKey ? ` (${t.dateKey})` : ""}`,
    "",
    `请求数: ${a}`,
    `视频流量 (CF 总计): ${n}`,
    `本月流量 (CF 总计): ${s}`,
    `请求: 播放请求 ${Se(i)} 次 | 获取播放信息 ${Se(c)} 次`,
    "#Cloudflare #Emby #日报"
  ].map((l) => String(l || "").trim()).filter((l, d, u) => !(l === "" && (d === 0 || u[d - 1] === ""))).join(`
`);
}
function hf(o = "", e = {}, r = {}) {
  const t = Ui(o);
  if (t === "summary") return gf(e, r);
  const a = t === "d1" ? "d1" : "kv", n = e && typeof e == "object" ? e : {}, s = r && typeof r == "object" ? r : {}, i = a === "d1" ? "D1 数据库每日消耗报告" : "KV 数据库每日消耗报告", c = a === "d1" ? "#D1" : "#KV", l = Array.isArray(n.metrics) ? n.metrics : [], d = s.dateKey ? ` (${s.dateKey})` : "", u = String(n.planLabel || "").trim(), f = String(n.periodLabel || "").trim(), m = u || f ? `${u || "未知"} 计划 X ${f || "当前"}配额` : String(n.summary || "").trim() || "暂不可用", p = Un(l, a === "d1" ? ["rowsRead", "read"] : ["read", "rowsRead"]), g = Un(l, a === "d1" ? ["rowsWritten", "write"] : ["write", "rowsWritten"]), h = Un(l, ["storage"]);
  return [
    `📊 ${i}${d}`,
    `配额口径：${m}`,
    `读取使用率：${p}`,
    `写入使用率：${g}`,
    `存储使用率：${h}`,
    `#Cloudflare ${c} #日报`
  ].map((y) => String(y || "").trim()).filter((y, S, _) => !(y === "" && (S === 0 || _[S - 1] === ""))).join(`
`);
}
function Rs(o = null, e = "") {
  const r = (Array.isArray(o?.errors) ? o.errors : []).map((a) => {
    const n = String(a?.code || "").trim(), s = String(a?.message || "").trim();
    return n && s ? `${n}: ${s}` : s || n;
  }).filter(Boolean);
  if (r.length > 0) return r.join("; ");
  const t = String(e || "").trim();
  return t ? t.replace(/\s+/g, " ").slice(0, 300) : "";
}
async function Re(o, e, r = {}) {
  const t = r && typeof r == "object" ? r : {};
  let a = {};
  const n = t?.headers;
  n && (n instanceof Headers ? a = Object.fromEntries(n.entries()) : typeof n == "object" && (a = n));
  const s = typeof FormData < "u" && t?.body instanceof FormData, i = await Be(o, {
    ...t,
    headers: {
      Authorization: `Bearer ${e}`,
      ...s ? {} : { "Content-Type": "application/json" },
      ...a
    }
  }), c = await xe(i, Zs);
  if (c.exceeded) throw new Error("cf_api_response_too_large");
  const l = c.text;
  let d = null;
  if (l) try {
    d = JSON.parse(l);
  } catch {
  }
  if (!i.ok) {
    const u = Number(i.status) || 0, f = Rs(d, l), m = /* @__PURE__ */ new Error(f ? `cf_api_http_${u}: ${f}` : `cf_api_http_${u}`);
    throw m.status = u, m;
  }
  if (!d || typeof d != "object") return {};
  if (d?.success === !1) {
    const u = Rs(d, l);
    throw new Error(u || "cf_api_error");
  }
  return d;
}
async function mc(o, e, r) {
  const t = r && typeof r == "object" ? {
    query: e,
    variables: r
  } : { query: e }, a = await Be("https://api.cloudflare.com/client/v4/graphql", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${o}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify(t)
  });
  if (!a.ok) throw new Error(`cf_graphql_http_${a.status}`);
  const n = await xe(a, Zs);
  if (n.exceeded) throw new Error("cf_graphql_response_too_large");
  const s = JSON.parse(n.text);
  if (Array.isArray(s?.errors) && s.errors.length) throw new Error(s.errors.map((i) => i?.message).filter(Boolean).join("; ") || "cf_graphql_error");
  return s;
}
async function pc(o, e, r, t) {
  return (await mc(e, r, t))?.data?.viewer?.zones?.[0] || null;
}
async function Tn(o, e, r, t) {
  return (await mc(e, r, t))?.data?.viewer?.accounts?.[0] || null;
}
async function gc(o, e) {
  return !o || !e ? null : (await Re(`https://api.cloudflare.com/client/v4/zones/${encodeURIComponent(String(o).trim())}`, e))?.result || null;
}
async function hc(o, e, r = {}) {
  const t = String(o || "").trim();
  return await ye(gc(t, e), String(r?.scope || "cloudflare.zone_lookup"), {
    zoneId: t,
    ...U(r?.context) ? r.context : {}
  }, null);
}
async function ko(o, e, r = {}) {
  const t = await gc(o, e), a = String(t?.name || "").trim();
  if (t && a) return t;
  const n = /* @__PURE__ */ new Error("cf_zone_context_missing");
  throw n.code = "CF_ZONE_CONTEXT_MISSING", n.status = 400, n.details = {
    zoneId: String(o || "").trim(),
    scope: String(r?.scope || "").trim()
  }, n;
}
async function yc(o, e) {
  const r = String(o || "").trim(), t = String(e || "").trim();
  return !r || !t ? "" : Ra((await Re(`https://api.cloudflare.com/client/v4/accounts/${encodeURIComponent(r)}/workers/account-settings`, t))?.result?.default_usage_model);
}
async function yf(o, e, r) {
  const t = String(o || "").trim(), a = String(e || "").trim(), n = String(r || "").trim();
  return !t || !a || !n ? null : (await Re(`https://api.cloudflare.com/client/v4/accounts/${encodeURIComponent(t)}/storage/kv/namespaces/${encodeURIComponent(a)}`, n))?.result || null;
}
async function Ts(o, e, r) {
  const t = String(o || "").trim(), a = String(e || "").trim(), n = String(r || "").trim();
  return !t || !a || !n ? null : (await Re(`https://api.cloudflare.com/client/v4/accounts/${encodeURIComponent(t)}/d1/database/${encodeURIComponent(a)}`, n))?.result || null;
}
async function Sf({ accountId: o, apiToken: e, namespaceId: r, startIso: t, endIso: a }) {
  const n = String(o || "").trim(), s = String(e || "").trim(), i = String(r || "").trim();
  if (!n || !s || !i) return null;
  const c = await Tn(n, s, `
    query {
      viewer {
        accounts(filter: { accountTag: ${be(n)} }) {
          kvOperationsAdaptiveGroups(
            limit: 1000
            filter: {
              namespaceId: ${be(i)}
              datetime_geq: ${be(String(t || "").trim())}
              datetime_leq: ${be(String(a || "").trim())}
            }
          ) {
            dimensions { actionType }
            sum { requests }
          }
          kvStorageAdaptiveGroups(
            limit: 1000
            filter: {
              namespaceId: ${be(i)}
              datetime_geq: ${be(String(t || "").trim())}
              datetime_leq: ${be(String(a || "").trim())}
            }
          ) {
            max { byteCount }
          }
        }
      }
    }`);
  if (!c) throw new Error("cf_graphql_empty_account");
  const l = Array.isArray(c?.kvOperationsAdaptiveGroups) ? c.kvOperationsAdaptiveGroups : [], d = Array.isArray(c?.kvStorageAdaptiveGroups) ? c.kvStorageAdaptiveGroups : [], u = {
    readCount: 0,
    writeCount: 0,
    deleteCount: 0,
    listCount: 0,
    storageBytes: 0
  };
  for (const f of l) {
    const m = String(f?.dimensions?.actionType || "").trim().toLowerCase(), p = Math.max(0, Number(f?.sum?.requests) || 0);
    m === "read" ? u.readCount += p : m === "write" ? u.writeCount += p : m === "delete" ? u.deleteCount += p : m === "list" && (u.listCount += p);
  }
  for (const f of d) u.storageBytes = Math.max(u.storageBytes, Math.max(0, Number(f?.max?.byteCount) || 0));
  return u;
}
async function _f({ accountId: o, apiToken: e, databaseId: r, startIso: t, endIso: a }) {
  const n = String(o || "").trim(), s = String(e || "").trim(), i = String(r || "").trim();
  if (!n || !s || !i) return null;
  const c = await Tn(n, s, `
    query {
      viewer {
        accounts(filter: { accountTag: ${be(n)} }) {
          d1AnalyticsAdaptiveGroups(
            limit: 1000
            filter: {
              databaseId: ${be(i)}
              datetime_geq: ${be(String(t || "").trim())}
              datetime_leq: ${be(String(a || "").trim())}
            }
          ) {
            sum { rowsRead rowsWritten readQueries writeQueries }
          }
        }
      }
    }`);
  if (!c) throw new Error("cf_graphql_empty_account");
  return (Array.isArray(c?.d1AnalyticsAdaptiveGroups) ? c.d1AnalyticsAdaptiveGroups : []).reduce((l, d) => ({
    rowsRead: l.rowsRead + Math.max(0, Number(d?.sum?.rowsRead) || 0),
    rowsWritten: l.rowsWritten + Math.max(0, Number(d?.sum?.rowsWritten) || 0),
    readQueries: l.readQueries + Math.max(0, Number(d?.sum?.readQueries) || 0),
    writeQueries: l.writeQueries + Math.max(0, Number(d?.sum?.writeQueries) || 0)
  }), {
    rowsRead: 0,
    rowsWritten: 0,
    readQueries: 0,
    writeQueries: 0
  });
}
async function bf({ accountId: o, apiToken: e, databaseId: r, startIso: t, endIso: a, utcOffsetMinutes: n = v.Defaults.ScheduleUtcOffsetMinutes }) {
  const s = String(o || "").trim(), i = String(e || "").trim(), c = String(r || "").trim();
  if (!s || !i || !c) return [];
  const l = await Tn(s, i, `
    query {
      viewer {
        accounts(filter: { accountTag: ${be(s)} }) {
          d1AnalyticsAdaptiveGroups(
            limit: 10000
            filter: {
              databaseId: ${be(c)}
              datetime_geq: ${be(String(t || "").trim())}
              datetime_leq: ${be(String(a || "").trim())}
            }
          ) {
            dimensions { datetimeHour }
            sum { rowsWritten writeQueries }
          }
        }
      }
    }`);
  if (!l) throw new Error("cf_graphql_empty_account");
  const d = Array.isArray(l?.d1AnalyticsAdaptiveGroups) ? l.d1AnalyticsAdaptiveGroups : [], u = /* @__PURE__ */ new Map();
  for (const f of d) {
    const m = String(f?.dimensions?.datetimeHour || "").trim();
    if (!m) continue;
    const p = Date.parse(m);
    if (!Number.isFinite(p)) continue;
    const g = xt(new Date(p), n), h = `${g.dateKey}:${g.hour}`, y = u.get(h) || {
      dateKey: g.dateKey,
      hour: g.hour,
      rowsWritten: 0,
      writeQueries: 0
    };
    y.rowsWritten += Math.max(0, Number(f?.sum?.rowsWritten) || 0), y.writeQueries += Math.max(0, Number(f?.sum?.writeQueries) || 0), u.set(h, y);
  }
  return [...u.values()].sort((f, m) => f.dateKey !== m.dateKey ? String(f.dateKey).localeCompare(String(m.dateKey)) : Number(f.hour) - Number(m.hour));
}
async function Ef({ cfAccountId: o, cfZoneId: e, cfApiToken: r, startIso: t, endIso: a, utcOffsetMinutes: n = v.Defaults.ScheduleUtcOffsetMinutes }) {
  if (!o || !r) return null;
  const s = await Tn(o, r, `
  query {
    viewer {
      accounts(filter: { accountTag: ${be(o)} }) {
        workersInvocationsAdaptive(limit: 10000, filter: { datetime_geq: ${be(t)}, datetime_leq: ${be(a)} }) {
          dimensions { datetime scriptName status }
          sum { requests }
        }
      }
    }
  }`), i = Array.isArray(s?.workersInvocationsAdaptive) ? s.workersInvocationsAdaptive : [], c = Array.from({ length: 24 }, (d, u) => ({
    label: String(u).padStart(2, "0") + ":00",
    total: 0
  }));
  let l = 0;
  for (const d of i) {
    const u = Number(d?.sum?.requests) || 0;
    l += u;
    const f = d?.dimensions?.datetime;
    if (!f) continue;
    const m = new Date(f);
    if (Number.isNaN(m.getTime())) continue;
    const p = xt(m, n).hour;
    c[p] && (c[p].total += u);
  }
  return {
    totalRequests: l,
    hourlySeries: c
  };
}
async function Rf({ cfAccountId: o, cfZoneId: e, cfApiToken: r, zoneNameFallback: t = "" }) {
  const a = [], n = (s, i = {}) => {
    const c = ho(s);
    if (!c) return;
    const l = i.wildcard === !0 || c.wildcard === !0;
    a.push({
      hostname: c.hostname,
      path: String(i.path || ""),
      wildcard: l,
      score: Lo(c.hostname, {
        wildcard: l,
        path: i.path || ""
      })
    });
  };
  if (o && e) try {
    const s = await Re(`https://api.cloudflare.com/client/v4/accounts/${encodeURIComponent(String(o).trim())}/workers/domains?zone_id=${encodeURIComponent(String(e).trim())}`, r);
    for (const i of s?.result || []) n(i?.hostname);
  } catch (s) {
    console.log("CF Workers domains lookup failed, will try routes", s);
  }
  if (!a.length && e) try {
    let s = 1, i = 1;
    do {
      const c = await Re(`https://api.cloudflare.com/client/v4/zones/${encodeURIComponent(String(e).trim())}/workers/routes?page=${s}&per_page=100`, r);
      i = Number(c?.result_info?.total_pages || c?.result_info?.totalPages || 1);
      for (const l of c?.result || []) {
        const d = gi(l?.pattern);
        d && n(d.hostname, {
          wildcard: d.wildcard,
          path: d.path
        });
      }
      s += 1;
    } while (s <= i && s <= 5);
  } catch (s) {
    console.log("CF Workers routes lookup failed", s);
  }
  return a.length ? (a.sort((s, i) => i.score - s.score || s.hostname.length - i.hostname.length || s.hostname.localeCompare(i.hostname)), a[0].hostname) : t || "未知域名 (请配置 CF 联动)";
}
function jt(o = "") {
  const e = String(o || "").trim();
  return /^[a-z0-9_][a-z0-9-_]*$/i.test(e) ? e : "";
}
function An(o) {
  if (o !== void 0)
    try {
      return JSON.parse(JSON.stringify(o));
    } catch {
      return null;
    }
}
function He(o, e = [], r = {}) {
  if (typeof o == "string") return String(o).trim();
  if (!o || typeof o != "object") return "";
  const t = Array.isArray(e) ? e : [], a = [
    "id",
    "value",
    "name",
    "region",
    "provider",
    "providerId",
    "hostname",
    "host"
  ], n = t.length ? t : a, s = r?.allowFallback !== !1, i = [n];
  s && t.length && i.push(a);
  const c = /* @__PURE__ */ new Set();
  for (const l of i) for (const d of l) {
    if (c.has(d)) continue;
    c.add(d);
    const u = o?.[d];
    if (typeof u == "string" && u.trim()) return u.trim();
    if (!(!u || typeof u != "object"))
      for (const f of l) {
        const m = u?.[f];
        if (typeof m == "string" && m.trim()) return m.trim();
      }
  }
  return "";
}
function Tf(o = "") {
  const e = String(o || "").trim().toLowerCase();
  return e ? e === "aws" ? "AWS" : e === "gcp" || e === "google" ? "GCP" : e === "azure" ? "Azure" : e.toUpperCase() : "";
}
function Af(o = "", e = "") {
  const r = String(o || "").trim().toLowerCase().replace(/_/g, "-"), t = String(e || "").trim().toLowerCase(), a = `${t}:${r}`;
  if (!r && !t) return {
    key: "other",
    label: "其他",
    sortOrder: 9
  };
  const n = (s = []) => s.some((i) => a.includes(String(i || "").trim().toLowerCase()));
  return n([
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
  } : n([
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
  } : n([
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
  } : n([
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
function Cf(o) {
  return Array.isArray(o) ? o : o && typeof o == "object" ? [o] : typeof o == "string" && o.trim() ? [{ value: o }] : [];
}
function wf(o = []) {
  const e = [], r = /* @__PURE__ */ new Set();
  for (const t of Array.isArray(o) ? o : []) {
    const a = String(t?.id || t?.provider || t?.providerId || "").trim().toLowerCase();
    if (!a) continue;
    const n = Tf(a);
    for (const s of Array.isArray(t?.regions) ? t.regions : []) {
      const i = String(s?.id || s?.region || s?.value || "").trim();
      if (!i) continue;
      const c = `${a}:${i}`;
      if (r.has(c)) continue;
      r.add(c);
      const l = Af(i, a);
      e.push({
        provider: a,
        region: i,
        value: c,
        providerLabel: n,
        regionLabel: i,
        geoKey: l.key,
        geoLabel: l.label,
        geoSortOrder: l.sortOrder
      });
    }
  }
  return e.sort((t, a) => String(t.providerLabel || t.provider || "").localeCompare(String(a.providerLabel || a.provider || "")) || Number(t.geoSortOrder || 0) - Number(a.geoSortOrder || 0) || String(t.regionLabel || t.region || "").localeCompare(String(a.regionLabel || a.region || "")) || String(t.value || "").localeCompare(String(a.value || "")));
}
function Ur(o, e = "", r = []) {
  const t = He(o, [
    "region",
    "value",
    "id"
  ]);
  if (!t) return "";
  if (t.includes(":")) return t;
  const a = He(e, [
    "provider",
    "providerId",
    "id",
    "value"
  ]).toLowerCase();
  if (a) return `${a}:${t}`;
  const n = (Array.isArray(r) ? r : []).filter((s) => String(s?.region || "").trim() === t || String(s?.value || "").trim() === t);
  return n.length === 1 ? String(n[0]?.value || "").trim() : t;
}
function Aa(o = {}, e = []) {
  const r = o && typeof o == "object" ? o : {}, t = String(r?.mode || "").trim().toLowerCase(), a = Cf(r?.target), n = Ur(r?.region, r?.provider || r?.providerId || "", e), s = a.find((S) => !!Ur(He(S, [
    "region",
    "value",
    "id"
  ]), He(S, ["provider", "providerId"]), e)), i = s ? Ur(He(s, [
    "region",
    "value",
    "id"
  ]), He(s, ["provider", "providerId"]), e) : "", c = He(r?.hostname, ["hostname"], { allowFallback: !1 }) || He(r, ["hostname"], { allowFallback: !1 }), l = He(a.find((S) => He(S, ["hostname"], { allowFallback: !1 })), ["hostname"], { allowFallback: !1 }), d = He(r?.host, ["host"], { allowFallback: !1 }) || He(r, ["host"], { allowFallback: !1 }), u = He(a.find((S) => He(S, ["host"], { allowFallback: !1 })), ["host"], { allowFallback: !1 }), f = He(a[0], ["value", "id"]);
  let m = "default", p = "__default__", g = "", h = "default", y = "";
  return t === "smart" ? (m = "smart", p = "__smart__", h = "smart") : t === "targeted" ? c || l ? (m = "hostname", p = "", g = c || l, h = "") : d || u ? (m = "host", p = "", g = d || u, h = "") : (m = "targeted", p = i || n || "", g = p || f || "", h = "") : n ? (m = "region", p = n, h = "region", y = n) : c ? (m = "hostname", p = "", g = c, h = "") : d ? (m = "host", p = "", g = d, h = "") : (i || a.length > 0) && (m = "targeted", p = i || "", g = p || f || "", h = ""), {
    currentMode: m,
    currentValue: p,
    currentTarget: g,
    selectedMode: h,
    selectedRegion: y,
    isTargetedOverride: m === "hostname" || m === "host" || m === "targeted"
  };
}
function Sc(o = []) {
  return (Array.isArray(o) ? o : []).filter((e) => e && typeof e == "object").map((e) => {
    const r = String(e.scope || "").trim(), t = String(e.permission || "").trim(), a = String(e.alternative || "").trim(), n = String(e.note || "").trim(), s = [];
    return r && s.push(`${r}级`), t && s.push(`"${t}"`), a && s.push(`（若当前令牌仅授予写权限，可改用 "${a}"）`), n && s.push(`：${n}`), s.join("");
  }).filter(Boolean);
}
function _c(o = "", e = {}) {
  const r = String(o || "").trim().toLowerCase();
  if (r === "discovery") {
    const t = e?.includeRouteFallback !== !1, a = [{
      scope: "账号",
      permission: "Workers Scripts Read",
      alternative: "Workers Scripts Write",
      note: "用于读取 Workers Domains，按当前 host 自动识别脚本"
    }];
    return t && a.push({
      scope: "Zone",
      permission: "Workers Routes Read",
      alternative: "Workers Routes Write",
      note: "当 Domains 未命中时，允许继续从 Workers Routes 回退识别脚本"
    }), a;
  }
  return r === "settings_read" ? [{
    scope: "账号",
    permission: "Workers Scripts Read",
    alternative: "Workers Scripts Write",
    note: "用于读取 Worker Settings"
  }] : r === "regions_read" ? [{
    scope: "账号",
    permission: "Workers Scripts Read",
    alternative: "Workers Scripts Write",
    note: "用于读取 Placement 区域列表"
  }] : r === "settings_write" ? [{
    scope: "账号",
    permission: "Workers Scripts Write",
    alternative: "",
    note: "用于写入 Worker Settings / Placement"
  }] : [];
}
function Lf(o = "", e = "读取", r = {}) {
  const t = Sc(_c(o, r));
  return t.length <= 0 ? `Cloudflare Worker 放置${e}失败：API Token 权限不足` : `Cloudflare Worker 放置${e}失败：API Token 权限不足。至少需要：${t.join("；")}`;
}
function Cn(o = "WORKER_PLACEMENT_FORBIDDEN", e = "", r = "读取", t = {}) {
  return we(o, Lf(e, r, t), 403, {
    permissionKind: String(e || "").trim(),
    requiredPermissions: _c(e, t)
  });
}
function ro(o = {}) {
  const e = o && typeof o == "object" && !Array.isArray(o) ? o : {}, r = Object.prototype.hasOwnProperty.call(e, "currentValue"), t = Object.prototype.hasOwnProperty.call(e, "selectedMode");
  return {
    configured: e.configured === !0,
    scriptName: String(e.scriptName || "").trim(),
    requestHost: te(e.requestHost || ""),
    currentMode: String(e.currentMode || "default").trim().toLowerCase() || "default",
    currentValue: r ? String(e.currentValue ?? "").trim() : "__default__",
    currentTarget: String(e.currentTarget || "").trim(),
    selectedMode: t ? String(e.selectedMode ?? "").trim().toLowerCase() : "default",
    selectedRegion: String(e.selectedRegion || "").trim(),
    options: Array.isArray(e.options) ? e.options : [],
    warning: String(e.warning || "").trim(),
    error: String(e.error || "").trim()
  };
}
function Df(o = "", e = "", r = !1) {
  const t = te(o), a = te(e);
  return !t || !a ? !1 : r ? t === a || t.endsWith(`.${a}`) : t === a;
}
function Nf(o = "", e = "/") {
  const r = String(o || "").trim(), t = String(e || "/").trim() || "/";
  return !r || r === "/" || r === "/*" ? !0 : r.endsWith("*") ? t.startsWith(r.slice(0, -1)) : t === r;
}
function If(o = {}) {
  const e = te(o?.hostname || ""), r = jt(o?.service || o?.script || o?.name || "");
  return !e || !r ? null : {
    source: "domains",
    hostname: e,
    wildcard: !1,
    path: "/",
    scriptName: r,
    score: Lo(e, {
      wildcard: !1,
      path: "/"
    })
  };
}
function Mf(o = {}) {
  const e = gi(o?.pattern), r = jt(o?.script || o?.service || o?.name || "");
  return !e || !r ? null : {
    source: "routes",
    hostname: e.hostname,
    wildcard: e.wildcard === !0,
    path: e.path || "/",
    pattern: e.pattern,
    scriptName: r,
    score: Lo(e.hostname, {
      wildcard: e.wildcard === !0,
      path: e.path || "/"
    })
  };
}
function As(o = [], e = "", r = "/") {
  const t = te(e), a = String(r || "/").trim() || "/", n = [];
  for (const i of Array.isArray(o) ? o : [])
    !i?.scriptName || !i?.hostname || Df(t, i.hostname, i.wildcard === !0) && Nf(i.path || "/", a) && n.push({
      ...i,
      exactHostname: t === te(i.hostname),
      exactPath: String(i.path || "/") === a
    });
  if (n.length > 0)
    return n.sort((i, c) => Number(c.exactHostname) - Number(i.exactHostname) || Number(c.exactPath) - Number(i.exactPath) || Number(c.score || 0) - Number(i.score || 0) || String(i.hostname || "").length - String(c.hostname || "").length || String(i.scriptName || "").localeCompare(String(c.scriptName || ""))), n[0];
  const s = [...new Set((Array.isArray(o) ? o : []).map((i) => String(i?.scriptName || "").trim()).filter(Boolean))];
  return s.length === 1 && (Array.isArray(o) ? o : []).find((i) => String(i?.scriptName || "").trim() === s[0]) || null;
}
async function bc(o, e) {
  const r = String(o || "").trim(), t = String(e || "").trim();
  if (!r || !t) return [];
  let a = null;
  try {
    a = await Re(`https://api.cloudflare.com/client/v4/accounts/${encodeURIComponent(r)}/workers/placement/regions`, t);
  } catch (n) {
    throw Number(n?.status) === 403 ? Cn("WORKER_PLACEMENT_REGIONS_FORBIDDEN", "regions_read", "读取") : n;
  }
  return wf(a?.result?.providers);
}
async function Pf(o, e, r = {}) {
  const t = String(o || "").trim(), a = String(e || "").trim();
  if (!t || !a) return [];
  const n = new URL(`https://api.cloudflare.com/client/v4/accounts/${encodeURIComponent(t)}/workers/domains`), s = String(r?.zoneId || "").trim(), i = te(r?.hostname || ""), c = jt(r?.service || "");
  s && n.searchParams.set("zone_id", s), i && n.searchParams.set("hostname", i), c && n.searchParams.set("service", c);
  const l = await Re(n.toString(), a);
  return Array.isArray(l?.result) ? l.result : [];
}
async function xf(o, e) {
  const r = String(o || "").trim(), t = String(e || "").trim();
  if (!r || !t) return [];
  const a = [];
  let n = 1, s = 1;
  do {
    const i = await Re(`https://api.cloudflare.com/client/v4/zones/${encodeURIComponent(r)}/workers/routes?page=${n}&per_page=100`, t);
    Array.isArray(i?.result) && a.push(...i.result), s = Number(i?.result_info?.total_pages || i?.result_info?.totalPages || 1), n += 1;
  } while (n <= s && n <= 10);
  return a;
}
async function Ko({ cfAccountId: o, cfZoneId: e, cfApiToken: r, request: t }) {
  const a = new URL(t?.url || "https://invalid.local/"), n = te(a.hostname), s = String(a.pathname || "/").trim() || "/";
  if (!n) throw we("WORKER_PLACEMENT_HOST_INVALID", "当前请求 host 无效，无法识别 Worker 脚本", 400);
  const i = [], c = /* @__PURE__ */ new Set();
  let l = null, d = !1, u = !1;
  const f = [
    {
      zoneId: e,
      hostname: n
    },
    { hostname: n },
    { zoneId: e }
  ];
  for (const m of f) {
    const p = JSON.stringify({
      zoneId: String(m?.zoneId || "").trim(),
      hostname: te(m?.hostname || "")
    });
    if (!c.has(`query:${p}`)) {
      c.add(`query:${p}`);
      try {
        const g = await Pf(o, r, m);
        for (const y of g) {
          const S = If(y);
          if (!S) continue;
          const _ = `${S.source}|${S.scriptName}|${S.hostname}|${S.path}`;
          c.has(_) || (c.add(_), i.push(S));
        }
        const h = As(i, n, s);
        if (h?.scriptName) return {
          requestHost: n,
          requestPath: s,
          scriptName: h.scriptName,
          resolvedBy: h.source
        };
      } catch (g) {
        l = g, Number(g?.status) === 403 && (d = !0), console.warn("[worker_placement.resolve_script.domains_failed]", {
          requestHost: n,
          zoneId: String(m?.zoneId || "").trim(),
          hostname: te(m?.hostname || ""),
          reason: ie(g)
        });
      }
    }
  }
  try {
    const m = As(await xf(e, r).then((p) => p.map((g) => Mf(g)).filter(Boolean)), n, s);
    if (m?.scriptName) return {
      requestHost: n,
      requestPath: s,
      scriptName: m.scriptName,
      resolvedBy: m.source
    };
  } catch (m) {
    l = m, Number(m?.status) === 403 && (u = !0), console.warn("[worker_placement.resolve_script.routes_failed]", {
      requestHost: n,
      zoneId: String(e || "").trim(),
      reason: ie(m)
    });
  }
  throw d || u ? Cn("WORKER_PLACEMENT_SCRIPT_DISCOVERY_FORBIDDEN", "discovery", "读取", { includeRouteFallback: u }) : l || we("WORKER_PLACEMENT_SCRIPT_UNRESOLVED", "未能根据当前站点自动识别 Worker 脚本，请确认当前 host 已绑定到该 Zone 的 Workers Domain 或 Workers Route", 400, { requestHost: n });
}
async function an(o, e, r) {
  let t = null;
  try {
    t = await Re(`https://api.cloudflare.com/client/v4/accounts/${encodeURIComponent(String(o || "").trim())}/workers/scripts/${encodeURIComponent(String(e || "").trim())}/settings`, String(r || "").trim());
  } catch (a) {
    throw Number(a?.status) === 403 ? Cn("WORKER_PLACEMENT_SETTINGS_READ_FORBIDDEN", "settings_read", "读取") : a;
  }
  return U(t?.result) ? t.result : {};
}
async function Qr(o, e, r, t = {}) {
  const a = new FormData();
  a.append("settings", new Blob([JSON.stringify(t && typeof t == "object" ? t : {})], { type: "application/json" }), "settings.json");
  let n = null;
  try {
    n = await Re(`https://api.cloudflare.com/client/v4/accounts/${encodeURIComponent(String(o || "").trim())}/workers/scripts/${encodeURIComponent(String(e || "").trim())}/settings`, String(r || "").trim(), {
      method: "PATCH",
      body: a
    });
  } catch (s) {
    throw Number(s?.status) === 403 ? Cn("WORKER_PLACEMENT_SETTINGS_WRITE_FORBIDDEN", "settings_write", "保存") : s;
  }
  return U(n?.result) ? n.result : {};
}
function nn(o, e = "read") {
  const r = e === "write" ? "保存" : e === "default" ? "恢复默认" : "读取", t = String(o?.message || o || "").trim() || `Worker 放置${r}失败`, a = Number(o?.status) || Number(/cf_api_http_(\d+)/i.exec(t)?.[1] || 0), n = String(o?.code || "").trim().toUpperCase();
  return n.startsWith("WORKER_PLACEMENT_") && String(o?.message || "").trim() ? o.message : a === 401 ? `Cloudflare Worker 放置${r}失败：API Token 无效` : a === 403 ? `Cloudflare Worker 放置${r}失败：API Token 权限不足` : a === 404 && e !== "read" ? "Cloudflare Worker 放置保存失败：未找到目标 Worker 脚本" : a === 404 ? "Cloudflare Worker 放置读取失败：未找到目标 Worker 脚本" : n === "WORKER_PLACEMENT_SCRIPT_UNRESOLVED" || n === "WORKER_PLACEMENT_HOST_INVALID" || n === "WORKER_PLACEMENT_CONFIG_REQUIRED" ? o.message : t;
}
function Bo(o = {}) {
  const e = String(o?.cfAccountId || "").trim(), r = String(o?.cfZoneId || "").trim(), t = String(o?.cfApiToken || "").trim(), a = [];
  if (e || a.push("cfAccountId"), r || a.push("cfZoneId"), t || a.push("cfApiToken"), a.length <= 0) return {
    cfAccountId: e,
    cfZoneId: r,
    cfApiToken: t
  };
  throw we("WORKER_PLACEMENT_CONFIG_REQUIRED", "请先在账号设置中填写并保存 Cloudflare Account ID、Zone ID 与 API Token", 400, { missingFields: a });
}
function $o(o = "") {
  const e = jt(o);
  return e ? `sys:worker_placement_region:v1:${e}` : "";
}
function zt(o = "WORKER_PLACEMENT_KV_FAILED", e = "Worker 放置 KV 持久化失败", r = null) {
  return we(o, e, 503, r);
}
function Of(o) {
  return dn(o) && String(o?.code || "").trim().toUpperCase().startsWith("WORKER_PLACEMENT_") && String(o?.details?.dependency || "").trim().toUpperCase() === "KV";
}
function Ec(o = {}, e = "") {
  const r = jt(e);
  if (!r || !U(o)) return null;
  const t = Ur(o?.region, o?.provider || o?.providerId || "", []);
  return t ? {
    scriptName: r,
    region: t,
    updatedAt: String(o?.updatedAt || "").trim()
  } : null;
}
async function Rc(o, e = "") {
  if (!o) return null;
  const r = $o(e);
  return r ? Ec(await Le(o, r, { type: "json" }), e) : null;
}
async function Tc(o, e = "", r = "") {
  if (!o) throw zt("WORKER_PLACEMENT_REGION_OVERRIDE_WRITE_FAILED", "Worker 放置 Region 持久化失败：KV 未配置", {
    dependency: "KV",
    operation: "put",
    reason: "kv_not_configured"
  });
  const t = $o(e), a = jt(e), n = Ur(r, "", []);
  if (!t || !a || !n) throw zt("WORKER_PLACEMENT_REGION_OVERRIDE_WRITE_FAILED", "Worker 放置 Region 持久化失败：Region 数据无效", {
    dependency: "KV",
    operation: "put",
    key: t,
    scriptName: a,
    region: n,
    reason: "invalid_region_override"
  });
  const s = {
    scriptName: a,
    region: n,
    updatedAt: (/* @__PURE__ */ new Date()).toISOString()
  };
  try {
    await o.put(t, JSON.stringify(s));
  } catch (i) {
    throw zt("WORKER_PLACEMENT_REGION_OVERRIDE_WRITE_FAILED", "Worker 放置 Region 持久化失败：KV 写入异常", {
      dependency: "KV",
      operation: "put",
      key: t,
      scriptName: a,
      region: n,
      reason: ie(i)
    });
  }
  return s;
}
async function Cs(o, e = "") {
  if (!o) throw zt("WORKER_PLACEMENT_REGION_OVERRIDE_DELETE_FAILED", "Worker 放置 Region 清理失败：KV 未配置", {
    dependency: "KV",
    operation: "delete",
    reason: "kv_not_configured"
  });
  const r = $o(e), t = jt(e);
  if (!r || !t) return !1;
  try {
    await o.delete(r);
  } catch (a) {
    throw zt("WORKER_PLACEMENT_REGION_OVERRIDE_DELETE_FAILED", "Worker 放置 Region 清理失败：KV 删除异常", {
      dependency: "KV",
      operation: "delete",
      key: r,
      scriptName: t,
      reason: ie(a)
    });
  }
  return !0;
}
function vf(o = "") {
  const e = String(o || "").trim();
  return e ? `当前已保存的 Worker Placement Region（${e}）已不在 Cloudflare 可选区域列表中，请重新选择并保存` : "当前已保存的 Worker Placement Region 已不在 Cloudflare 可选区域列表中，请重新选择并保存";
}
function ws(o = "", e = "", r = "", t = [], a = {}) {
  const n = Ur(r, "", t), s = Array.isArray(t) ? t : [], i = s.find((d) => String(d?.value || "").trim() === n) || null, c = a?.regionError || null;
  let l = String(a?.error || "").trim();
  return !l && c ? l = nn(c, "read") : !l && n && s.length > 0 && !i && (l = vf(n)), ro({
    configured: a?.configured !== !1,
    scriptName: o,
    requestHost: e,
    currentMode: "region",
    currentValue: n,
    currentTarget: "",
    selectedMode: "region",
    selectedRegion: n,
    options: s,
    warning: "",
    error: l
  });
}
async function Hn(o, e, r, t = {}) {
  let a = !1, n = !1, s = "";
  try {
    const i = Ec(t?.previousOverride, e), c = t?.originalState && typeof t.originalState == "object" ? t.originalState : Aa(t?.originalPlacement, t?.regionOptions);
    if (i?.region)
      return a = !0, await Qr(o, e, r, { placement: { region: i.region } }), n = !0, {
        rollbackAttempted: a,
        rollbackSucceeded: n,
        rollbackError: s
      };
    a = !0, String(c?.currentMode || "").trim().toLowerCase() === "default" ? await Ac(o, e, r, t?.regionOptions) : await Qr(o, e, r, { placement: An(t?.originalPlacement) }), n = !0;
  } catch (i) {
    n = !1, s = ie(i);
  }
  return {
    rollbackAttempted: a,
    rollbackSucceeded: n,
    rollbackError: s
  };
}
async function Ls(o = {}, e, r = {}) {
  let t = "", a = "";
  try {
    const n = Bo(o), s = await Ko({
      ...n,
      request: e
    });
    t = s.scriptName, a = s.requestHost;
    const i = await Rc(r?.kv, s.scriptName);
    let c = [], l = null;
    try {
      c = await bc(n.cfAccountId, n.cfApiToken);
    } catch (u) {
      l = u;
    }
    if (i?.region) return ws(s.scriptName, s.requestHost, i.region, c, {
      configured: !l,
      regionError: l
    });
    const d = Aa(An((await an(n.cfAccountId, s.scriptName, n.cfApiToken))?.placement), c);
    return d.currentMode === "region" && d.currentValue ? (await Tc(r?.kv, s.scriptName, d.currentValue), ws(s.scriptName, s.requestHost, d.currentValue, c, {
      configured: !l,
      regionError: l
    })) : ro({
      configured: !l,
      scriptName: s.scriptName,
      requestHost: s.requestHost,
      currentMode: d.currentMode,
      currentValue: d.currentValue,
      currentTarget: d.currentTarget,
      selectedMode: d.selectedMode,
      selectedRegion: d.selectedRegion,
      options: c,
      warning: "",
      error: l ? nn(l, "read") : ""
    });
  } catch (n) {
    if (un(n) || Of(n) || r?.softFail !== !0) throw n;
    return ro({
      configured: !1,
      scriptName: t,
      requestHost: a,
      selectedMode: "",
      currentMode: "default",
      currentValue: "__default__",
      error: nn(n, "read")
    });
  }
}
async function Ac(o, e, r, t = []) {
  const a = await an(o, e, r), n = An(a?.placement), s = Aa(n, t);
  if (s.currentMode === "default") return {
    settings: a,
    placementState: s,
    clearedBy: "already_default"
  };
  for (const d of [{
    tag: "empty_object",
    patch: { placement: {} }
  }, {
    tag: "null",
    patch: { placement: null }
  }]) {
    await Qr(o, e, r, d.patch);
    const u = await an(o, e, r), f = Aa(u?.placement, t);
    if (f.currentMode === "default") return {
      settings: u,
      placementState: f,
      clearedBy: d.tag
    };
  }
  let i = !1, c = !1, l = "";
  if (n !== void 0) {
    i = !0;
    try {
      await Qr(o, e, r, { placement: n }), c = !0;
    } catch (d) {
      c = !1, l = ie(d);
    }
  }
  throw we("WORKER_PLACEMENT_DEFAULT_BLOCKED", "Cloudflare 当前接口未验证出可安全恢复 Default Placement；本次已停止，未使用近似映射", 409, {
    scriptName: e,
    rollbackAttempted: i,
    rollbackSucceeded: c,
    rollbackError: l
  });
}
function Ff(o = {}, e = {}) {
  const { kernel: r } = o, { CacheManager: t, buildAdminShellState: a, buildAdminUiContract: n, withAdminShellRuntimeStatus: s } = o;
  return {
    async getDashboardSnapshot(i, { env: c, ctx: l, kv: d, db: u }) {
      const f = await ue(c);
      return J(await r.getDashboardSnapshotPayload(c, {
        ctx: l,
        kv: d,
        db: u,
        config: f,
        forceRefresh: i?.forceRefresh === !0
      }));
    },
    async getDashboardStats(i, { env: c, ctx: l, kv: d, db: u }) {
      const f = await ue(c), m = await r.getDashboardSnapshotPayload(c, {
        ctx: l,
        kv: d,
        db: u,
        config: f,
        forceRefresh: i?.forceRefresh === !0
      });
      return J({
        ...m?.stats && typeof m.stats == "object" ? m.stats : {},
        cacheMeta: m?.cacheMeta && typeof m.cacheMeta == "object" ? m.cacheMeta : {}
      });
    },
    async getMonthlyTrafficStats(i, { env: c, ctx: l }) {
      const d = await ue(c);
      return J(await r.getDashboardMonthlyTrafficPayload(c, {
        ctx: l,
        config: d,
        forceRefresh: i?.forceRefresh === !0
      }));
    },
    async getRuntimeStatus(i, { env: c, db: l }) {
      const d = await ue(c), u = await r.getRuntimeStatusPayload(c, {
        db: l,
        config: d,
        forceRefresh: i?.forceRefresh === !0
      });
      return J({
        status: u?.status && typeof u.status == "object" ? u.status : {},
        cacheMeta: u?.cacheMeta && typeof u.cacheMeta == "object" ? u.cacheMeta : {}
      });
    },
    async getAdminBootstrap(i, { env: c, ctx: l, kv: d, db: u }) {
      try {
        const f = await ue(c), m = ke(c), [p, g, h, y] = await Promise.all([
          t.getNodesListStrict(c, l),
          r.getConfigSnapshotsForRead(d),
          r.readStoredConfigSnapshotsStrict(d),
          r.getRuntimeStatusPayload(c, {
            ctx: l,
            kv: d,
            db: u,
            config: f
          })
        ]), S = await r.getAdminRevisionsForRead({
          env: c,
          kv: d,
          db: u
        }, {
          ctx: l,
          config: f,
          nodes: p,
          snapshots: h
        });
        return J({
          adminPath: nt(c),
          loginPath: Po(c),
          initHealth: m,
          config: ft(f),
          hostDomain: ze(c),
          legacyHost: Gr(c),
          contract: n(),
          nodes: p,
          configSnapshots: g,
          shell: a(c, m, f),
          runtimeStatus: y?.status && typeof y.status == "object" ? y.status : s({}, c, f, m),
          revisions: S,
          generatedAt: (/* @__PURE__ */ new Date()).toISOString()
        });
      } catch (f) {
        throw Lt(f, "ADMIN_BOOTSTRAP_READ_FAILED", "管理台启动数据加载失败：KV 读取异常", "admin.read.bootstrap");
      }
    },
    async getSettingsBootstrap(i, { env: c, ctx: l, kv: d, db: u }) {
      let f;
      try {
        f = await ue(c);
      } catch (S) {
        throw Lt(S, "SETTINGS_BOOTSTRAP_READ_FAILED", "设置页加载失败：KV 读取异常", "admin.read.settings_bootstrap");
      }
      let m = [], p = [], g = [], h = {}, y = {};
      try {
        m = await t.getNodesListStrict(c, l);
      } catch (S) {
        console.warn("[settings_bootstrap.nodes_degraded]", ie(S));
      }
      try {
        [p, g] = await Promise.all([r.getConfigSnapshotsForRead(d), r.readStoredConfigSnapshotsStrict(d)]);
      } catch (S) {
        console.warn("[settings_bootstrap.snapshots_degraded]", ie(S));
      }
      try {
        const S = await r.getRuntimeStatusPayload(c, {
          ctx: l,
          kv: d,
          db: u,
          config: f
        });
        h = S?.status && typeof S.status == "object" ? S.status : {};
      } catch (S) {
        console.warn("[settings_bootstrap.runtime_status_degraded]", ie(S));
      }
      try {
        y = await r.getAdminRevisionsForRead({
          env: c,
          kv: d,
          db: u
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
        config: ft(f),
        hostDomain: ze(c),
        legacyHost: Gr(c),
        contract: n(),
        nodes: m,
        configSnapshots: p,
        runtimeStatus: s(h, c, f, ke(c)),
        revisions: y,
        generatedAt: (/* @__PURE__ */ new Date()).toISOString()
      });
    },
    async getWorkerPlacementStatus(i, { env: c, request: l, kv: d }) {
      try {
        return J(await Ls(await ue(c), l, {
          softFail: !0,
          kv: d
        }));
      } catch (u) {
        throw Lt(u, "WORKER_PLACEMENT_READ_FAILED", "Worker 放置状态读取失败：KV 读取异常", "admin.read.worker_placement");
      }
    },
    async saveWorkerPlacement(i, { env: c, request: l, kv: d }) {
      let u;
      try {
        u = await ue(c);
      } catch (m) {
        throw Lt(m, "WORKER_PLACEMENT_SAVE_FAILED", "Worker 放置保存失败：KV 读取异常", "admin.write.worker_placement");
      }
      const f = String(i?.mode || "").trim().toLowerCase();
      if (f !== "default" && f !== "smart" && f !== "region") return z("WORKER_PLACEMENT_MODE_INVALID", "请选择有效的 Worker 放置模式");
      try {
        const m = Bo(u), p = await Ko({
          ...m,
          request: l
        }), g = await Rc(d, p.scriptName), h = await bc(m.cfAccountId, m.cfApiToken), y = An((await an(m.cfAccountId, p.scriptName, m.cfApiToken))?.placement), S = Aa(y, h);
        if (f === "region") {
          const _ = String(i?.region || "").trim(), A = h.find((b) => String(b?.value || "").trim() === _);
          if (!A) return z("WORKER_PLACEMENT_REGION_INVALID", "所选 Placement 区域已失效，请刷新后重试");
          await Qr(m.cfAccountId, p.scriptName, m.cfApiToken, { placement: { region: A.value } });
          try {
            await Tc(d, p.scriptName, A.value);
          } catch (b) {
            const E = await Hn(m.cfAccountId, p.scriptName, m.cfApiToken, {
              previousOverride: g,
              originalPlacement: y,
              originalState: S,
              regionOptions: h
            });
            throw zt(b?.code || "WORKER_PLACEMENT_REGION_OVERRIDE_WRITE_FAILED", String(b?.message || "Worker 放置 Region 持久化失败：KV 写入异常"), {
              ...U(b?.details) ? b.details : {},
              requestedMode: f,
              dependency: "KV",
              region: A.value,
              rollbackAttempted: E.rollbackAttempted,
              rollbackSucceeded: E.rollbackSucceeded,
              rollbackError: E.rollbackError
            });
          }
        } else if (f === "smart") {
          if (await Qr(m.cfAccountId, p.scriptName, m.cfApiToken, { placement: { mode: "smart" } }), g) try {
            await Cs(d, p.scriptName);
          } catch (_) {
            const A = await Hn(m.cfAccountId, p.scriptName, m.cfApiToken, {
              previousOverride: g,
              originalPlacement: y,
              originalState: S,
              regionOptions: h
            });
            throw zt(_?.code || "WORKER_PLACEMENT_REGION_OVERRIDE_DELETE_FAILED", String(_?.message || "Worker 放置 Region 清理失败：KV 删除异常"), {
              ...U(_?.details) ? _.details : {},
              requestedMode: f,
              dependency: "KV",
              rollbackAttempted: A.rollbackAttempted,
              rollbackSucceeded: A.rollbackSucceeded,
              rollbackError: A.rollbackError
            });
          }
        } else if (await Ac(m.cfAccountId, p.scriptName, m.cfApiToken, h), g) try {
          await Cs(d, p.scriptName);
        } catch (_) {
          const A = await Hn(m.cfAccountId, p.scriptName, m.cfApiToken, {
            previousOverride: g,
            originalPlacement: y,
            originalState: S,
            regionOptions: h
          });
          throw zt(_?.code || "WORKER_PLACEMENT_REGION_OVERRIDE_DELETE_FAILED", String(_?.message || "Worker 放置 Region 清理失败：KV 删除异常"), {
            ...U(_?.details) ? _.details : {},
            requestedMode: f,
            dependency: "KV",
            rollbackAttempted: A.rollbackAttempted,
            rollbackSucceeded: A.rollbackSucceeded,
            rollbackError: A.rollbackError
          });
        }
        return J(await Ls(u, l, {
          softFail: !1,
          kv: d
        }));
      } catch (m) {
        return z("WORKER_PLACEMENT_SAVE_FAILED", nn(m, f === "default" ? "default" : "write"), De(m?.status, f === "default" ? 409 : 400), U(m?.details) ? m.details : null);
      }
    }
  };
}
var Cc = 600 * 1e3, Uf = Cc;
function at(o = "", e = "manual") {
  const r = String(e || "manual").trim().toLowerCase() === "scheduled" ? "scheduled" : "manual", t = String(o || "").trim().toLowerCase();
  return r !== "manual" ? "smart" : t === "full" ? "full" : "smart";
}
function Hf(o = "", e = "manual") {
  return at(o, e) === "full";
}
function zo(o = "worker.js") {
  const e = String(o || "").trim().split(/[\\/]+/).pop() || "";
  return e && /\.js$/i.test(e) ? e : "";
}
function wc(o = "") {
  const e = String(o || "");
  return e && (/(^|\n)\s*export\s+/m.test(e) || /(^|\n)\s*import\s+(?:[\w*{]|["'])/m.test(e)) ? "module" : "service-worker";
}
function kf(o = "", e = "worker.js") {
  const r = zo(e);
  if (r.toLowerCase() !== "worker.js") throw we("WORKER_UPLOAD_FILE_NAME_INVALID", "Worker 文件名必须是 worker.js", 400, { fileName: r || String(e || "").trim() });
  const t = String(o || ""), a = new TextEncoder().encode(t).length;
  if (!t.trim()) throw we("WORKER_UPLOAD_EMPTY", "worker.js 不能为空", 400);
  if (a > 3145728) throw we("WORKER_UPLOAD_TOO_LARGE", `worker.js 体积超过限制（${a} bytes）`, 400, {
    contentLength: a,
    maxBytes: Wf
  });
  return {
    fileName: r,
    scriptContent: t,
    contentLength: a,
    syntax: wc(t)
  };
}
function Kf(o = "", e = "module") {
  const r = zo(o) || "worker.js";
  return e === "module" ? { main_module: r } : { body_part: r };
}
function Bf(o = "module") {
  return o === "module" ? "application/javascript+module" : "application/javascript";
}
function Lc() {
  return [{
    scope: "账号",
    permission: "Workers Scripts Write",
    alternative: "",
    note: "这是账号级 Worker 脚本编辑权限，用于上传 .js 文件并仅更新脚本代码，不修改 bindings 或 settings"
  }];
}
function Dc(o = "更新") {
  const e = Sc(Lc());
  return e.length > 0 ? `Cloudflare Worker 脚本${o}失败：API Token 权限不足。至少需要：${e.join("；")}` : `Cloudflare Worker 脚本${o}失败：API Token 权限不足`;
}
function $f(o = "WORKER_SCRIPT_UPDATE_FORBIDDEN", e = "更新") {
  return we(o, Dc(e), 403, { requiredPermissions: Lc() });
}
async function zf(o, e, r, t, a = {}) {
  const n = String(o || "").trim(), s = jt(e), i = String(r || "").trim(), c = zo(a?.fileName) || "worker.js", l = String(t || ""), d = wc(l), u = new FormData();
  u.append("metadata", new Blob([JSON.stringify(Kf(c, d))], { type: "application/json" }), "metadata.json"), u.append("files", new Blob([l], { type: Bf(d) }), c);
  let f = null;
  try {
    f = await Re(`https://api.cloudflare.com/client/v4/accounts/${encodeURIComponent(n)}/workers/scripts/${encodeURIComponent(s)}/content`, i, {
      method: "PUT",
      body: u
    });
  } catch (m) {
    throw Number(m?.status) === 403 ? $f("WORKER_SCRIPT_UPDATE_FORBIDDEN", "更新") : m;
  }
  return {
    syntax: d,
    fileName: c,
    result: U(f?.result) ? f.result : {}
  };
}
function Ds(o) {
  const e = String(o?.message || o || "").trim() || "Worker 脚本更新失败", r = Number(o?.status) || Number(/cf_api_http_(\d+)/i.exec(e)?.[1] || 0), t = String(o?.code || "").trim().toUpperCase();
  return t === "WORKER_SCRIPT_UPDATE_FORBIDDEN" && String(o?.message || "").trim() ? o.message : t === "WORKER_PLACEMENT_SCRIPT_DISCOVERY_FORBIDDEN" ? String(o?.message || "").replace("Cloudflare Worker 放置读取失败", "Cloudflare Worker 脚本定位失败").trim() : t === "WORKER_PLACEMENT_SCRIPT_UNRESOLVED" || t === "WORKER_PLACEMENT_HOST_INVALID" || t === "WORKER_PLACEMENT_CONFIG_REQUIRED" ? e : r === 401 ? "Cloudflare Worker 和 HTML 更新失败：API Token 无效" : r === 403 ? Dc("更新") : r === 404 ? "Cloudflare Worker 和 HTML 更新失败：未找到目标 Worker 脚本" : e;
}
var Wf = 3 * 1024 * 1024;
function Gf(o = {}, e = {}) {
  const { kernel: r } = o, { buildAdminLocalIndexUploadRecord: t } = o;
  return {
    async loadConfig(a, { env: n, kv: s, db: i, ctx: c }) {
      try {
        const l = await ue(n), d = await r.getAdminRevisionsForRead({
          env: n,
          kv: s,
          db: i
        }, {
          ctx: c,
          config: l
        });
        return J({
          config: ft(l),
          revisions: d
        });
      } catch (l) {
        throw Lt(l, "CONFIG_READ_FAILED", "设置读取失败：KV 读取异常", "admin.read.config");
      }
    },
    async previewConfig(a, { env: n, kv: s, ctx: i }) {
      const c = a?.config && typeof a.config == "object" && !Array.isArray(a.config) ? a.config : {};
      if (!s) return z("KV_NOT_CONFIGURED", "请先绑定 ENI_KV / KV Namespace", 503);
      const l = await ue(n), d = await r.prepareRuntimeConfigPersistence(Fn(c, l), {
        env: n,
        kv: s,
        ctx: i
      });
      return J({
        config: ft(d.nextConfig),
        hostPrefixDnsSyncCount: d.dnsPlans.length
      });
    },
    async previewTidyData(a, { env: n, kv: s, db: i }) {
      const c = String(a?.scope || "kv").trim().toLowerCase() === "d1" ? "d1" : "kv";
      try {
        if (c === "d1") {
          if (!i) return z("D1_NOT_CONFIGURED", "请先绑定 D1 / PROXY_LOGS 数据库");
          const u = await r.buildD1TidyPlan(n, {
            db: i,
            kv: s,
            maintenanceMode: at(a?.maintenanceMode, "manual")
          }), f = u.schemaStatus?.schemaReady !== !0, m = f ? "" : await r.createD1TidyPlanToken(n, u);
          return J({
            success: !0,
            scope: "d1",
            planHash: f ? "" : u.planHash,
            planToken: m,
            planExpiresAt: m ? new Date(k() + Uf).toISOString() : "",
            requiresSchemaInitialization: f,
            summary: u.summary,
            ...u.preview
          });
        }
        if (!s) return z("KV_NOT_CONFIGURED", "请先绑定 ENI_KV / KV Namespace");
        const l = await r.buildKvTidyPlan(n, {
          kv: s,
          db: i
        }), d = await r.createKvTidyPlanToken(n, l);
        return J({
          success: !0,
          scope: "kv",
          planHash: l.planHash,
          planToken: d,
          planExpiresAt: new Date(k() + Cc).toISOString(),
          summary: l.summary,
          ...l.preview
        });
      } catch (l) {
        const d = l?.message || String(l);
        return z(String(l?.code || "TIDY_PREVIEW_FAILED"), d, De(l?.status, 500), {
          scope: c,
          ...U(l?.details) ? l.details : {}
        });
      }
    },
    async updateWorkerAndAdminIndex(a, { env: n, request: s, kv: i, ctx: c }) {
      if (!i) return z("KV_NOT_CONFIGURED", "请先绑定 ENI_KV / KV Namespace", 503);
      let l;
      try {
        l = await ue(n);
      } catch (_) {
        throw Lt(_, "WORKER_HTML_UPDATE_FAILED", "Worker 和 HTML 更新失败：KV 读取异常", "admin.write.worker_html");
      }
      const d = typeof a?.workerScriptContent == "string" ? a.workerScriptContent : "", u = typeof a?.indexHtml == "string" ? a.indexHtml : "";
      if (!d.trim() || !u.trim()) return z("WORKER_HTML_FILES_REQUIRED", "必须同时上传 worker.js 和 index.html，缺一不可", 400, {
        workerFileProvided: !!d.trim(),
        indexFileProvided: !!u.trim()
      });
      let f, m;
      try {
        f = kf(d, a?.workerFileName);
        const _ = String(a?.indexFileName || "").trim().split(/[\\/]+/).pop() || "";
        if (_.toLowerCase() !== "index.html") return z("ADMIN_INDEX_UPLOAD_FILE_NAME_INVALID", "HTML 文件名必须是 index.html", 400, { fileName: _ || String(a?.indexFileName || "").trim() });
        m = await t(u, _);
      } catch (_) {
        return z(String(_?.code || "WORKER_HTML_VALIDATION_FAILED"), ie(_, "Worker 或 HTML 文件校验失败"), De(_?.status, 400), U(_?.details) ? _.details : null);
      }
      let p, g;
      try {
        p = Bo(l), g = await Ko({
          ...p,
          request: s
        });
      } catch (_) {
        return z(String(_?.code || "WORKER_SCRIPT_CONTEXT_FAILED"), Ds(_), De(_?.status, 400), U(_?.details) ? _.details : null);
      }
      let h;
      try {
        h = await r.persistAdminIndexUpload(m, {
          env: n,
          kv: i,
          ctx: c
        });
      } catch (_) {
        return z(String(_?.code || "ADMIN_INDEX_UPLOAD_FAILED"), ie(_, "index.html 激活失败"), De(_?.status, 500), U(_?.details) ? _.details : null);
      }
      let y;
      try {
        y = await zf(p.cfAccountId, g.scriptName, p.cfApiToken, f.scriptContent, { fileName: f.fileName });
      } catch (_) {
        let A = !1, b = !1, E = "", R = "";
        try {
          const L = await r.rollbackAdminIndexUploadActivation(h.previousConfig, h.config, {
            env: n,
            kv: i,
            ctx: c
          });
          A = !0, b = L.skipped === !0, E = String(L.reason || "").trim();
        } catch (L) {
          R = ie(L, "rollback_failed");
        }
        return z(String(_?.code || "WORKER_HTML_UPDATE_FAILED"), Ds(_), De(_?.status, 400), {
          ...U(_?.details) ? _.details : {},
          htmlRollbackAttempted: !0,
          htmlRollbackSucceeded: A,
          htmlRollbackSkipped: b,
          htmlRollbackReason: E,
          htmlRollbackError: R
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
        config: ft(h.config),
        revisions: await r.getAdminRevisions(n, {
          ctx: c,
          config: h.config
        })
      });
    },
    async saveConfig(a, { env: n, ctx: s, kv: i, meta: c }) {
      if (!i) return z("KV_NOT_CONFIGURED", "请先绑定 ENI_KV / KV Namespace", 503);
      const l = await ue(n), d = a.config ? await r.persistRuntimeConfig(Fn(a.config, l), {
        env: n,
        kv: i,
        ctx: s,
        expectedConfigRevision: a?.expectedConfigRevision,
        snapshotMeta: {
          reason: "save_config",
          section: String(c?.section || "all"),
          source: String(c?.source || "ui"),
          actor: "admin"
        }
      }) : l;
      return J({
        success: !0,
        config: ft(d),
        revisions: await r.getAdminRevisions(n, {
          ctx: s,
          config: d
        })
      });
    },
    async uploadAdminIndex(a, { env: n, ctx: s, kv: i }) {
      if (!i) return z("KV_NOT_CONFIGURED", "请先绑定 ENI_KV / KV Namespace", 503);
      try {
        const c = String(a?.fileName || "").trim().split(/[\\/]+/).pop() || "";
        if (c.toLowerCase() !== "index.html") return z("ADMIN_INDEX_UPLOAD_FILE_NAME_INVALID", "HTML 文件名必须是 index.html", 400, { fileName: c || String(a?.fileName || "").trim() });
        const l = await t(a?.indexHtml, c), d = await r.persistAdminIndexUpload(l, {
          env: n,
          kv: i,
          ctx: s
        });
        return J({
          success: !0,
          source: "local_upload",
          revision: d.record.revision,
          assetRevision: d.record.assetRevision,
          sourceUrl: d.record.sourceUrl,
          fileName: d.record.fileName,
          bytes: d.record.bytes,
          uploadedAt: d.record.uploadedAt,
          config: ft(d.config),
          revisions: await r.getAdminRevisions(n, {
            ctx: s,
            config: d.config
          })
        });
      } catch (c) {
        return z(String(c?.code || "ADMIN_INDEX_UPLOAD_FAILED"), ie(c, "本地 index.html 上传失败"), De(c?.status, 500), U(c?.details) ? c.details : null);
      }
    },
    async exportConfig(a, { env: n, ctx: s, request: i }) {
      const c = r.getKV(n), l = a?.includeSecrets === !0;
      if (l && String(i.headers.get("X-Admin-Confirm") || "").trim() !== "exportConfig") return z("CONFIRMATION_REQUIRED", "Exporting secrets requires explicit confirmation", 428);
      const d = await ue(n), u = gt(n, d), f = c && u.localUploadRevision ? await r.getAdminIndexUploadRecord(c, u.localUploadRevision) : null, m = c ? (await r.loadAllNodeEntitiesFromKvStrict(c, { ctx: s })).filter(Boolean) : [], p = {
        version: v.Defaults.Version,
        exportTime: (/* @__PURE__ */ new Date()).toISOString(),
        nodes: m,
        config: l ? d : Jr(d),
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
      return g > 12517376 ? z("FULL_BACKUP_TOO_LARGE", "完整备份超过安全回导上限，请先分别导出节点与设置并精简超大节点字段", 413, {
        importRequestBytes: g,
        maxBytes: Dd,
        nodeCount: p.nodes.length,
        adminIndexBytes: Number(f?.bytes) || 0
      }) : J(p);
    },
    async exportSettings(a, { env: n, request: s }) {
      const i = a?.includeSecrets === !0;
      if (i && String(s.headers.get("X-Admin-Confirm") || "").trim() !== "exportSettings") return z("CONFIRMATION_REQUIRED", "导出完整密钥需要显式确认", 428);
      const c = await ue(n);
      return J({
        version: v.Defaults.Version,
        type: "settings-only",
        exportTime: (/* @__PURE__ */ new Date()).toISOString(),
        config: i ? c : Jr(c),
        secretsRedacted: i !== !0,
        containsSecrets: i === !0
      });
    },
    async importSettings(a, { env: n, ctx: s, kv: i, meta: c }) {
      if (!i) return z("KV_NOT_CONFIGURED", "请先绑定 ENI_KV / KV Namespace", 503);
      const l = a?.config && typeof a.config == "object" && !Array.isArray(a.config) ? a.config : a?.settings && typeof a.settings == "object" && !Array.isArray(a.settings) ? a.settings : null;
      if (!l) return z("INVALID_SETTINGS_BACKUP", "设置备份文件无效，缺少 config/settings 对象");
      const d = await ue(n), u = await r.persistRuntimeConfig(Fn(l, d), {
        env: n,
        kv: i,
        ctx: s,
        snapshotMeta: {
          reason: "import_settings",
          section: String(c?.section || "settings"),
          source: String(c?.source || "settings_backup"),
          actor: "admin"
        }
      }), [f, m] = await Promise.all([r.getConfigSnapshotsForRead(i), r.getAdminRevisions(n, {
        ctx: s,
        config: u
      })]);
      return J({
        success: !0,
        config: ft(u),
        configSnapshots: f,
        revisions: m,
        generatedAt: (/* @__PURE__ */ new Date()).toISOString()
      });
    },
    async getConfigSnapshots(a, { env: n, kv: s, db: i, ctx: c }) {
      const l = await r.getConfigSnapshotsForRead(s), d = await r.readStoredConfigSnapshotsStrict(s);
      return J({
        snapshots: l,
        revisions: await r.getAdminRevisionsForRead({
          env: n,
          kv: s,
          db: i
        }, {
          ctx: c,
          snapshots: d
        })
      });
    }
  };
}
function Vf(o = {}, e = {}) {
  const { kernel: r } = o, { CacheManager: t, Logger: a } = o;
  return {
    async clearConfigSnapshots(n, { kv: s }) {
      const i = r.CONFIG_SNAPSHOTS_KEY, c = r.CONFIG_SNAPSHOTS_META_KEY;
      try {
        await r.clearConfigSnapshots(s);
      } catch (l) {
        const d = Zo("CONFIG_SNAPSHOTS_CLEAR_FAILED", "设置快照清理失败：KV 写入异常", {
          dependency: "KV",
          phase: "clear",
          clearApplied: !1,
          snapshotsKey: i,
          snapshotsMetaKey: c,
          reason: ie(l)
        });
        throw Ne("admin.write.config_snapshots.clear_failed", d, d.details), d;
      }
      try {
        return J({
          success: !0,
          snapshots: [],
          revisions: await r.getAdminRevisions(s, { snapshots: [] })
        });
      } catch (l) {
        const d = Zo("CONFIG_SNAPSHOTS_REVISIONS_REFRESH_FAILED", "设置快照已清理，但版本信息刷新失败", {
          ...un(l) && U(l?.details) ? l.details : {},
          phase: "refresh_revisions",
          clearApplied: !0,
          reason: ie(l)
        });
        throw Ne("admin.write.config_snapshots.revisions_refresh_failed", d, d.details), d;
      }
    },
    async restoreConfigSnapshot(n, { env: s, ctx: i, kv: c }) {
      const l = String(n?.id || "").trim();
      if (!l) return z("SNAPSHOT_ID_REQUIRED", "请提供要恢复的快照 ID");
      const d = await r.getConfigSnapshotById(c, l);
      if (!d) return z("SNAPSHOT_NOT_FOUND", "指定的配置快照不存在", 404);
      const u = await ue(s), f = Wu(d.config || {}, u), m = Xe(f.indexUrl || ""), p = m ? await r.getAdminIndexUploadRecord(c, m) : null;
      if (m && !p) return z("SNAPSHOT_ADMIN_INDEX_MISSING", "配置快照引用的 index.html 已不存在", 409, { revision: m });
      const g = await c.get(r.ADMIN_ACTIVE_INDEX_KEY);
      p ? await c.put(r.ADMIN_ACTIVE_INDEX_KEY, JSON.stringify(p)) : await c.delete(r.ADMIN_ACTIVE_INDEX_KEY);
      let h;
      try {
        h = await r.persistRuntimeConfig(f, {
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
        throw g === null ? await c.delete(r.ADMIN_ACTIVE_INDEX_KEY) : await c.put(r.ADMIN_ACTIVE_INDEX_KEY, g), y;
      }
      return J({
        success: !0,
        config: ft(h),
        restoredSnapshotId: l,
        revisions: await r.getAdminRevisions(s, {
          ctx: i,
          config: h
        })
      });
    },
    async list(n, { env: s, ctx: i, kv: c, db: l }) {
      try {
        const d = await t.getNodesListStrict(s, i);
        return J({
          nodes: d,
          revisions: await r.getAdminRevisionsForRead({
            env: s,
            kv: c,
            db: l
          }, {
            ctx: i,
            nodes: d
          })
        });
      } catch (d) {
        throw Lt(d, "NODE_LIST_READ_FAILED", "节点列表读取失败：KV 读取异常", "admin.read.nodes");
      }
    },
    async getDashboardD1WriteHotspot(n, { env: s, ctx: i }) {
      const c = await ue(s);
      return J(await r.buildDashboardD1WriteHotspotPayload(s, {
        config: c,
        nowMs: k()
      }));
    },
    async getDashboardCoreStats(n, { env: s, ctx: i, kv: c, db: l }) {
      const d = await ue(s);
      return J(await r.buildDashboardStatsPayload(s, {
        ctx: i,
        kv: c,
        db: l,
        config: d,
        skipD1WriteHotspot: !0
      }));
    },
    async getDashboardCachedSnapshot(n, { env: s, db: i }) {
      const c = await ue(s);
      return J({ snapshot: await r.getDashboardCachedSnapshotPayload(s, {
        db: i,
        config: c
      }) });
    },
    async getNode(n, { env: s, ctx: i, kv: c, db: l }) {
      const d = String(n?.name || "").trim();
      if (!d) return z("NODE_NAME_REQUIRED", "请提供节点路径");
      const u = await r.getNodeForRead(d, s);
      if (!u) return z("NODE_NOT_FOUND", "节点不存在", 404);
      const f = {
        name: d.toLowerCase(),
        ...u
      }, m = Hm(d, u);
      return J({
        success: !0,
        node: f,
        warnings: m ? [m] : [],
        revisions: await r.getAdminRevisionsForRead({
          env: s,
          kv: c,
          db: l
        }, { ctx: i })
      });
    }
  };
}
function ao(o = [], e = {}) {
  const r = e.renameMap instanceof Map ? e.renameMap : new Map(Object.entries(e.renameMap && typeof e.renameMap == "object" ? e.renameMap : {})), t = /* @__PURE__ */ new Map();
  for (const [l, d] of r.entries()) {
    const u = String(l || "").trim().toLowerCase(), f = String(d || "").trim();
    !u || !f || t.set(u, f);
  }
  const a = new Set(yt(e.removedNames || []).map((l) => String(l || "").trim().toLowerCase()).filter(Boolean)), n = e.allowedNames === void 0 ? null : yt(e.allowedNames || []).map((l) => [String(l || "").trim().toLowerCase(), String(l || "").trim()]).filter(([l, d]) => l && d), s = n ? new Map(n) : null, i = [], c = /* @__PURE__ */ new Set();
  for (const l of yt(o)) {
    const d = String(l || "").trim().toLowerCase();
    if (!d || a.has(d)) continue;
    const u = t.get(d) || String(l || "").trim(), f = u.toLowerCase();
    !f || a.has(f) || s && !s.has(f) || c.has(f) || (c.add(f), i.push(s?.get(f) || u));
  }
  return i;
}
function jf(o, e = null, r = "") {
  const t = String(o?.proxyMode || o?.mode || "").trim().toLowerCase();
  if ([
    "direct",
    "source-direct",
    "origin-direct",
    "node-direct"
  ].includes(t) || o?.direct === !0 || o?.sourceDirect === !0 || o?.directSource === !0 || o?.direct2xx === !0) return !0;
  const a = `${zr(o?.tags, o?.tag).join(" ")} ${o?.remark || ""}`;
  return /(?:^|[\s\[(【])(?:直连|source-direct|origin-direct|node-direct)(?:$|[\s\])】])/i.test(a);
}
function qf(o, e = null, r = "") {
  const t = $r(o);
  return t === "direct" ? !0 : t === "proxy" ? !1 : jf(o, e, r);
}
function Ca(o, e) {
  if (!o) return null;
  try {
    return new URL(o, e instanceof URL ? e : String(e || ""));
  } catch {
    return null;
  }
}
function Xf(o, e = "GET") {
  const r = String(e || "GET").toUpperCase();
  return o === 303 && r !== "GET" && r !== "HEAD" || (o === 301 || o === 302) && r === "POST" ? "GET" : r;
}
function Yf(o = {}, e = {}) {
  const r = vi(pa(o, "protocolStrategy") ? o?.protocolStrategy : Oo(o)), t = Number.isFinite(Number(e.hourUtc8)) ? Number(e.hourUtc8) : ((/* @__PURE__ */ new Date()).getUTCHours() + 8) % 24, a = t >= 20 && t < 24;
  return r === "aggressive" ? {
    strategy: r,
    enableH2: !0,
    enableH3: !0,
    peakDowngrade: !1,
    forceH1: !1,
    isPeakHour: a
  } : r === "balanced" ? {
    strategy: r,
    enableH2: !0,
    enableH3: !0,
    peakDowngrade: !0,
    forceH1: a,
    isPeakHour: a
  } : {
    strategy: "compat",
    enableH2: !1,
    enableH3: !1,
    peakDowngrade: !0,
    forceH1: !0,
    isPeakHour: a
  };
}
function Jf(o = {}, e = {}) {
  const { kernel: r } = o, { CacheManager: t, buildAdminLocalIndexUploadRecord: a } = o;
  return {
    async saveOrImport(n, { action: s, ctx: i, kv: c, env: l }) {
      const d = s === "save" ? [n] : n.nodes, u = ds(d, l);
      if (u) return z("NODE_NAME_RESERVED", "节点路径与系统保留路由冲突，请更换后重试", 409, u);
      const f = us(d, l);
      return f ? z(f.code, f.message, 400, f) : await Qt(c)(async () => {
        const m = [], p = /* @__PURE__ */ new Map(), g = [], h = ze(l), y = await ue(l);
        for (const b of d) {
          if (!b.name || !b.target && !(Array.isArray(b.lines) && b.lines.length)) continue;
          const E = String(b.name).toLowerCase(), R = b.originalName ? String(b.originalName).toLowerCase() : null, L = !!(R && R !== E);
          if (s === "save" && (!R || R !== E) && await c.get(`${r.PREFIX}${E}`, { type: "json" }))
            return z("NODE_NAME_CONFLICT", "节点路径已存在，请更换后重试", 409, { name: E });
          let T = {};
          L ? T = await c.get(`${r.PREFIX}${R}`, { type: "json" }) || {} : T = await c.get(`${r.PREFIX}${E}`, { type: "json" }) || {};
          const D = r.buildPreparedNodeMutation(b, T, {
            previousName: R || E,
            nextName: E
          });
          if (!D) continue;
          const w = Ze(E, D.nextNode);
          if (w) return z("NODE_RESOURCE_LIMIT_EXCEEDED", "节点配置超过 Worker 资源限制", 400, w);
          D.dnsPlan = r.buildHostPrefixDnsSyncPlan(D.previousName, D.previousNode, D.nextName, D.nextNode, h, {
            config: y,
            forceUpsert: !0
          }), g.push(D), D.isRename && p.set(D.previousName, D.nextName), m.push(E);
        }
        if (s === "save" && m.length === 0) return z("INVALID_TARGET", "目标源站必须是有效的 http/https URL");
        xn(g, y, l);
        const S = m.length > 0 || p.size > 0;
        let _ = !1, A = null;
        try {
          await r.applyPreparedNodeMutations(g, {
            env: l,
            kv: c,
            ctx: i,
            requestHost: h
          }), _ = g.some((D) => D?.nodeChanged === !0);
          const b = S ? await r.rebuildNodeIndexesFromKv(c, {
            ctx: i,
            syncLegacyIndex: s === "import"
          }) : null, E = Array.isArray(b?.summaries) ? b.summaries : await t.getNodesList(l, i), R = new Map((Array.isArray(E) ? E : []).map((D) => [String(D?.name || "").toLowerCase().trim(), D])), L = m.map((D) => R.get(String(D || "").toLowerCase().trim()) || null).filter(Boolean), T = Array.isArray(b?.index) ? b.index : Array.isArray(E) ? E.map((D) => D?.name) : [];
          if ((p.size > 0 || s === "save" && L.length === 1) && (A = await r.captureRuntimeConfigRollbackState(l, c), p.size > 0 && await r.commitSourceDirectNodesConfigWithinMutation(l, c, i, {
            renameMap: p,
            allowedNames: T,
            source: s === "import" ? "node_import" : "node_save",
            note: [...p.entries()].map(([D, w]) => `${D}->${w}`).join(",")
          }), s === "save" && L.length === 1)) {
            const D = L[0];
            await r.commitSingleNodeMainVideoStreamShortcutShadowWithinMutation(l, c, i, {
              originalName: n.originalName,
              nodeName: D?.name,
              mode: D?.mainVideoStreamMode,
              source: "node_save",
              note: String(D?.name || "").trim()
            });
          }
          return J({
            success: !0,
            node: s === "save" ? L[0] : void 0,
            nodes: E,
            importedNodes: s === "import" ? L : void 0,
            revisions: await r.getAdminRevisions(l, {
              ctx: i,
              nodes: E
            })
          });
        } catch (b) {
          let E = "", R = "";
          if (A) try {
            await r.restoreCapturedRuntimeConfigState(A, {
              env: l,
              kv: c,
              ctx: i
            });
          } catch (L) {
            E = ie(L, "config_restore_failed");
          }
          if (_) try {
            await r.rollbackPreparedNodeMutations(g, {
              env: l,
              kv: c,
              ctx: i,
              requestHost: h,
              rebuildIndexes: !0
            });
          } catch (L) {
            R = ie(L, "rollback_failed");
          }
          throw b && typeof b == "object" && (String(b.code || "").trim() || (b.code = "NODE_MUTATION_FAILED"), b.status = De(b.status, 500), (A || _) && (b.details = {
            ...U(b.details) ? b.details : {},
            rollbackAttempted: !0,
            configRollbackError: E,
            nodeRollbackError: R
          })), b;
        }
      });
    },
    async saveMainVideoStreamPolicyShortcuts(n, { env: s, ctx: i, kv: c }) {
      return c ? await Qt(c)(async () => {
        const l = await r.loadAllNodeEntitiesFromKvStrict(c, { ctx: i }), d = Array.isArray(l) ? l.map((E) => E?.name) : [], u = ao(n?.selectedNodeNames || [], { allowedNames: d }), f = new Set(u.map((E) => String(E || "").trim().toLowerCase()).filter(Boolean));
        let m = 0;
        const p = ze(s), g = await ue(s), h = [];
        for (const E of Array.isArray(l) ? l : []) {
          if (!U(E)) continue;
          const R = String(E.name || "").trim().toLowerCase();
          if (!R) continue;
          const L = $r(E);
          let T = L;
          if (f.has(R) ? T = "direct" : L === "direct" && (T = "inherit"), T !== L) {
            const { name: D, ...w } = E, M = {
              name: R,
              ...w,
              mainVideoStreamMode: T
            }, x = r.buildPreparedNodeMutation(M, E, {
              previousName: R,
              nextName: R
            });
            if (!x) continue;
            x.nextNode = r.normalizeNode(R, x.nextNode || M, { dropLegacyDirectRouting: !0 }).data, x.dnsPlan = r.buildHostPrefixDnsSyncPlan(x.previousName, x.previousNode, x.nextName, x.nextNode, p, {
              config: g,
              forceUpsert: !0
            }), h.push(x), m += 1;
          }
        }
        xn(h, g, s);
        const y = Q(g.sourceDirectNodes || []) !== Q(u), S = m > 0 || y ? await r.captureRuntimeConfigRollbackState(s, c) : null;
        let _ = null, A = g;
        try {
          m > 0 && (await r.applyPreparedNodeMutations(h, {
            env: s,
            kv: c,
            ctx: i,
            requestHost: p
          }), _ = await r.rebuildNodeIndexesFromKv(c, { ctx: i })), y && (A = await r.commitRuntimeConfig({
            ...g,
            sourceDirectNodes: u
          }, {
            env: s,
            kv: c,
            ctx: i,
            snapshotMeta: {
              reason: "sync_main_video_stream_shortcuts",
              section: "proxy",
              source: "ui_shortcut",
              actor: "admin",
              note: u.join(",")
            }
          }));
        } catch (E) {
          let R = "", L = "";
          if (S) try {
            await r.restoreCapturedRuntimeConfigState(S, {
              env: s,
              kv: c,
              ctx: i
            });
          } catch (T) {
            R = ie(T, "config_restore_failed");
          }
          if (m > 0) try {
            await r.rollbackPreparedNodeMutations(h, {
              env: s,
              kv: c,
              ctx: i,
              requestHost: p,
              rebuildIndexes: !0
            });
          } catch (T) {
            L = ie(T, "rollback_failed");
          }
          throw E && typeof E == "object" && (String(E.code || "").trim() || (E.code = "NODE_MUTATION_FAILED"), E.status = De(E.status, 500), E.details = {
            ...U(E.details) ? E.details : {},
            rollbackAttempted: !0,
            configRollbackError: R,
            nodeRollbackError: L
          }), E;
        }
        const b = Array.isArray(_?.summaries) ? _.summaries : await t.getNodesList(s, i);
        return J({
          success: !0,
          selectedNodeNames: u,
          updatedNodeCount: m,
          config: ft(A),
          nodes: b,
          revisions: await r.getAdminRevisions(s, {
            ctx: i,
            config: A,
            nodes: b
          })
        });
      }) : z("KV_UNAVAILABLE", "KV 未绑定或不可用", 500);
    },
    async importFull(n, { env: s, ctx: i, kv: c }) {
      const l = ds(n?.nodes, s);
      if (l) return z("NODE_NAME_RESERVED", "节点路径与系统保留路由冲突，请更换后重试", 409, l);
      const d = us(n?.nodes, s);
      if (d) return z(d.code, d.message, 400, d);
      const u = Xe(n?.config?.indexUrl || "");
      let f = null;
      if (U(n?.adminIndexUpload)) {
        const m = String(n.adminIndexUpload.fileName || "").trim().split(/[\\/]+/).pop() || "";
        if (m.toLowerCase() !== "index.html") return z("ADMIN_INDEX_BACKUP_INVALID", "完整备份中的 HTML 文件名必须是 index.html", 400);
        try {
          f = await a(n.adminIndexUpload.html, m);
        } catch (p) {
          return z(String(p?.code || "ADMIN_INDEX_BACKUP_INVALID"), ie(p, "完整备份中的 index.html 无效"), De(p?.status, 400), U(p?.details) ? p.details : null);
        }
        if (u && f.revision !== u) return z("ADMIN_INDEX_BACKUP_REVISION_MISMATCH", "完整备份中的 index.html 与配置版本不一致", 400, {
          expectedRevision: u,
          actualRevision: f.revision
        });
      }
      return u && !f && !await r.getAdminIndexUploadRecord(c, u) ? z("ADMIN_INDEX_BACKUP_MISSING", "完整备份缺少当前配置引用的 index.html", 400, { revision: u }) : await Qt(c)(async () => {
        const m = await ue(s), p = n.config ? await r.captureRuntimeConfigRollbackState(s, c) : null, g = n.config ? nc(n.config, m) : null, h = g ? re(g) : m, y = ze(s), S = f ? r.buildAdminIndexUploadKey(f.revision) : "", _ = S ? await c.get(S) : null, A = n.config ? await c.get(r.ADMIN_ACTIVE_INDEX_KEY) : null, b = u ? f || await r.getAdminIndexUploadRecord(c, u) : null, E = [];
        if (Array.isArray(n.nodes)) for (const w of n.nodes) {
          if (!w.name || !w.target && !(Array.isArray(w.lines) && w.lines.length)) continue;
          const M = String(w.name).toLowerCase(), x = await c.get(`${r.PREFIX}${M}`, { type: "json" }) || {}, C = r.buildPreparedNodeMutation(w, x, {
            previousName: M,
            nextName: M
          });
          C && (C.dnsPlan = r.buildHostPrefixDnsSyncPlan(C.previousName, C.previousNode, C.nextName, C.nextNode, y, {
            previousConfig: m,
            nextConfig: h,
            forceUpsert: !0
          }), E.push(C));
        }
        xn(E, h, s);
        let R = null, L = !1;
        try {
          S && await c.put(S, JSON.stringify(f)), g && (b ? await c.put(r.ADMIN_ACTIVE_INDEX_KEY, JSON.stringify(b)) : await c.delete(r.ADMIN_ACTIVE_INDEX_KEY)), g && (R = await r.commitRuntimeConfig(g, {
            env: s,
            kv: c,
            ctx: i,
            snapshotMeta: {
              reason: "import_full",
              section: "all",
              source: "full_backup",
              actor: "admin"
            }
          })), E.length > 0 && (await r.applyPreparedNodeMutations(E, {
            env: s,
            kv: c,
            ctx: i,
            requestHost: y
          }), L = !0, await r.rebuildNodeIndexesFromKv(c, {
            ctx: i,
            syncLegacyIndex: !0
          }));
        } catch (w) {
          let M = "", x = "", C = "";
          if (L) try {
            await r.rollbackPreparedNodeMutations(E, {
              env: s,
              kv: c,
              ctx: i,
              requestHost: y,
              rebuildIndexes: !0
            });
          } catch (F) {
            x = ie(F, "rollback_failed");
          }
          if (p) try {
            await r.restoreCapturedRuntimeConfigAndDnsState(p, {
              env: s,
              kv: c,
              ctx: i
            });
          } catch (F) {
            M = ie(F, "config_restore_failed");
          }
          if (S) try {
            _ === null ? await c.delete(S) : await c.put(S, _);
          } catch (F) {
            C = ie(F, "admin_index_restore_failed");
          }
          if (n.config) try {
            A === null ? await c.delete(r.ADMIN_ACTIVE_INDEX_KEY) : await c.put(r.ADMIN_ACTIVE_INDEX_KEY, A);
          } catch (F) {
            C = [C, ie(F, "active_admin_index_restore_failed")].filter(Boolean).join("; ");
          }
          throw w && typeof w == "object" && (String(w.code || "").trim() || (w.code = "IMPORT_FULL_FAILED"), w.status = De(w.status, 500), w.details = {
            ...U(w.details) ? w.details : {},
            rollbackAttempted: !!p || L || !!S,
            configRollbackError: M,
            nodeRollbackError: x,
            adminIndexRollbackError: C
          }), w;
        }
        const T = R || await Ae(s), D = await t.getNodesList(s, i);
        return J({
          success: !0,
          config: T,
          nodes: D,
          adminIndexUpload: f ? {
            revision: f.revision,
            fileName: f.fileName,
            bytes: f.bytes
          } : null,
          revisions: await r.getAdminRevisions(s, {
            ctx: i,
            config: T,
            nodes: D
          })
        });
      });
    },
    async delete(n, { ctx: s, kv: i, env: c }) {
      return await Qt(i)(async () => {
        if (n.name) {
          const l = String(n.name).toLowerCase(), d = await ue(c), u = await i.get(`${r.PREFIX}${l}`, { type: "json" }) || null, f = u ? r.normalizeNode(l, u || {}).data : null, m = {
            previousName: l,
            previousNode: f,
            nextName: l,
            nextNode: null,
            isRename: !1,
            nodeChanged: !!f,
            isSemanticNoop: !f,
            dnsPlan: r.buildHostPrefixDnsSyncPlan(l, f, "", null, ze(c), { config: d })
          }, p = ze(c);
          let g = !1, h = null;
          try {
            await r.applyPreparedNodeMutations([m], {
              env: c,
              kv: i,
              ctx: s,
              requestHost: p
            }), g = m.nodeChanged === !0;
            const y = await r.rebuildNodeIndexesFromKv(i, { ctx: s });
            h = await r.captureRuntimeConfigRollbackState(c, i), await r.commitSourceDirectNodesConfigWithinMutation(c, i, s, {
              removedNames: [l],
              allowedNames: Array.isArray(y?.index) ? y.index : [],
              source: "node_delete",
              note: l
            });
          } catch (y) {
            let S = "", _ = "";
            if (h) try {
              await r.restoreCapturedRuntimeConfigState(h, {
                env: c,
                kv: i,
                ctx: s
              });
            } catch (A) {
              S = ie(A, "config_restore_failed");
            }
            if (g) try {
              await r.rollbackPreparedNodeMutations([m], {
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
              ...U(y.details) ? y.details : {},
              rollbackAttempted: !0,
              configRollbackError: S,
              nodeRollbackError: _
            })), y;
          }
        }
        return J({
          success: !0,
          revisions: await r.getAdminRevisions(c, { ctx: s })
        });
      });
    },
    async purgeCache(n, { kv: s, request: i }) {
      if (i.headers.get("X-Admin-Confirm") !== "purgeCache") return z("CONFIRMATION_REQUIRED", "敏感操作需要显式确认头", 428);
      const c = await s.get(r.CONFIG_KEY, { type: "json" }) || {};
      if (!c.cfZoneId || !c.cfApiToken) return z("CF_API_ERROR", "请在账号设置中完善 Zone ID 和 API 令牌");
      try {
        return (await Be(`https://api.cloudflare.com/client/v4/zones/${encodeURIComponent(String(c.cfZoneId).trim())}/purge_cache`, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${c.cfApiToken}`,
            "Content-Type": "application/json"
          },
          body: JSON.stringify({ purge_everything: !0 })
        })).ok ? J({ success: !0 }) : z("PURGE_FAILED", "清理失败，请检查密钥权限");
      } catch (l) {
        return z("PURGE_ERROR", l.message);
      }
    }
  };
}
function Qf(o = {}, e = {}) {
  const { kernel: r } = o;
  return {
    async tidyKvData(t, { env: a, ctx: n, kv: s, db: i }) {
      if (!s) return z("KV_NOT_CONFIGURED", "请先绑定 ENI_KV / KV Namespace");
      try {
        const c = await r.tidyKvData(a, {
          kv: s,
          db: i,
          ctx: n,
          planToken: String(t?.planToken || "").trim()
        }), l = (/* @__PURE__ */ new Date()).toISOString();
        return await ye(r.patchOpsStatus(a, { scheduled: { kvTidy: {
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
        return await ye(r.patchOpsStatus(a, { scheduled: { kvTidy: {
          status: "failed",
          lastErrorAt: (/* @__PURE__ */ new Date()).toISOString(),
          lastError: l,
          lastTriggeredBy: "manual"
        } } }), "manual.tidy_kv.patch_failed_status", { message: l }, null), z(String(c?.code || "KV_TIDY_FAILED"), l, De(c?.status, 500), U(c?.details) ? c.details : null);
      }
    },
    async tidyD1Data(t, { env: a, ctx: n, kv: s, db: i }) {
      if (!i) return z("D1_NOT_CONFIGURED", "请先绑定 D1 / PROXY_LOGS 数据库");
      try {
        const c = at(t?.maintenanceMode, "manual"), l = await r.tidyD1Data(a, {
          db: i,
          kv: s,
          ctx: n,
          maintenanceMode: c,
          planToken: String(t?.planToken || "").trim()
        }), d = (/* @__PURE__ */ new Date()).toISOString(), u = r.buildD1TidyStatusPayload(l.summary, {
          mode: "manual",
          maintenanceMode: c,
          triggeredBy: "manual",
          timestamp: d
        });
        return await ye(r.patchOpsStatus({
          kv: s,
          db: i
        }, { scheduled: { ...u } }), "manual.tidy_d1.patch_success_status", null, null), J({
          success: !0,
          ...l
        });
      } catch (c) {
        const l = c?.message || String(c), d = r.buildD1TidyStatusPayload({
          status: "failed",
          lastError: l,
          maintenanceMode: at(t?.maintenanceMode, "manual")
        }, {
          mode: "manual",
          maintenanceMode: at(t?.maintenanceMode, "manual"),
          triggeredBy: "manual",
          timestamp: (/* @__PURE__ */ new Date()).toISOString()
        });
        return await ye(r.patchOpsStatus({
          kv: s,
          db: i
        }, { scheduled: { ...d } }), "manual.tidy_d1.patch_failed_status", { message: l }, null), z("D1_TIDY_FAILED", l, 500);
      }
    }
  };
}
function Zf(o = "") {
  return String(o || "").trim().toLowerCase() === "a" ? "a" : "cname";
}
function Wt(o = {}) {
  return {
    id: String(o?.id || "").trim(),
    type: String(o?.type || "").trim().toUpperCase(),
    name: te(o?.name),
    content: String(o?.content || "").trim(),
    ttl: Number(o?.ttl) || 1,
    proxied: o?.proxied === !0,
    comment: typeof o?.comment == "string" ? o.comment : void 0,
    tags: Array.isArray(o?.tags) ? o.tags.map((e) => String(e)) : void 0
  };
}
async function Hr(o, e, r = {}) {
  const t = [];
  let a = 1, n = 1;
  const s = 100, i = te(r?.nameExact || "");
  do {
    const c = new URL(`https://api.cloudflare.com/client/v4/zones/${encodeURIComponent(o)}/dns_records`);
    c.searchParams.set("page", String(a)), c.searchParams.set("per_page", String(s)), i && c.searchParams.set("name.exact", i);
    const l = await Re(c.toString(), e);
    Array.isArray(l?.result) && t.push(...l.result.map((d) => Wt(d)).filter((d) => d.id && d.name)), n = Number(l?.result_info?.total_pages || l?.result_info?.totalPages || 1), a += 1;
  } while (a <= n && a <= 20);
  return t;
}
function ma(o = {}, e = {}) {
  const r = {
    type: String(e.type || o?.type || "A").trim().toUpperCase(),
    name: te(e.host || o?.name),
    content: String(e.content || "").trim(),
    ttl: Number(o?.ttl) || 1,
    proxied: o?.proxied === !0
  };
  return typeof o?.comment == "string" && (r.comment = o.comment), Array.isArray(o?.tags) && (r.tags = o.tags.map((t) => String(t))), r;
}
function em(o = "", e = "") {
  const r = String(o || "").trim().toUpperCase(), t = String(e || "").trim();
  return t ? r === "A" ? t : t.toLowerCase() : "";
}
function kr(o = "", e = "") {
  const r = String(o || "").trim().toUpperCase(), t = em(r, e);
  return !r || !t ? "" : `${r}|${t}`;
}
function tm(o = []) {
  const e = [], r = /* @__PURE__ */ new Set();
  let t = 0;
  for (const a of Array.isArray(o) ? o : []) {
    const n = String(a?.type || "").trim().toUpperCase(), s = String(a?.content || "").trim(), i = kr(n, s);
    if (i) {
      if (r.has(i)) {
        t += 1;
        continue;
      }
      r.add(i), e.push({
        type: n,
        content: s,
        ttl: Number(a?.ttl) || 1,
        proxied: a?.proxied === !0,
        comment: typeof a?.comment == "string" ? a.comment : void 0,
        tags: Array.isArray(a?.tags) ? a.tags.map((c) => String(c)) : void 0
      });
    }
  }
  return {
    records: e,
    duplicateCount: t
  };
}
function Ns(o = "", e = 0) {
  return {
    type: String(o || "").trim().toUpperCase(),
    desiredCount: Math.max(0, Number(e) || 0),
    identicalCount: 0,
    updatedCount: 0,
    createdCount: 0,
    deletedCount: 0
  };
}
function rm(o = "a", e = {}, r = {}) {
  const t = {};
  let a = 0, n = 0, s = 0, i = 0, c = 0;
  for (const d of [
    "A",
    "AAAA",
    "CNAME"
  ]) {
    const u = e?.[d];
    !u || typeof u != "object" || (t[d] = {
      type: d,
      desiredCount: Math.max(0, Number(u.desiredCount) || 0),
      identicalCount: Math.max(0, Number(u.identicalCount) || 0),
      updatedCount: Math.max(0, Number(u.updatedCount) || 0),
      createdCount: Math.max(0, Number(u.createdCount) || 0),
      deletedCount: Math.max(0, Number(u.deletedCount) || 0)
    }, a += t[d].desiredCount, n += t[d].identicalCount, s += t[d].updatedCount, i += t[d].createdCount, c += t[d].deletedCount);
  }
  const l = s + i + c;
  return {
    mode: String(o || "a").trim().toLowerCase(),
    desiredCount: a,
    identicalCount: n,
    updatedCount: s,
    createdCount: i,
    deletedCount: c,
    changedCount: l,
    dedupedDesiredCount: Math.max(0, Number(r?.dedupedDesiredCount) || 0),
    familySummaries: t,
    unchangedOnly: l === 0 && n > 0
  };
}
async function am(o = {}, e) {
  const r = String(o?.cfZoneId || "").trim(), t = String(o?.cfApiToken || "").trim();
  if (!r || !t) throw new Error("cf_api_missing");
  const a = te(new URL(e.url).hostname), n = await hc(r, t, {
    scope: "dns.resolve_admin_context.zone_lookup",
    context: { requestHost: a }
  }), s = await Hr(r, t), i = String(n?.name || "").trim() || "", c = i || te(s[0]?.name || "");
  let l = a;
  ha(l, c || i) || (l = te(await Rf({
    cfAccountId: o.cfAccountId,
    cfZoneId: r,
    cfApiToken: t,
    zoneNameFallback: c || i || a
  })));
  const d = s.filter((f) => gr(f.type)), u = l ? d.filter((f) => te(f.name) === l) : d;
  return {
    cfZoneId: r,
    cfApiToken: t,
    zone: n,
    zoneName: i,
    currentHost: l,
    requestHost: a,
    totalRecords: s.length,
    editableRecords: d,
    currentHostRecords: u
  };
}
function nm(o = {}) {
  const e = re(o), r = String(e.cfZoneId || "").trim(), t = String(e.cfApiToken || "").trim();
  if (!r || !t) {
    const a = /* @__PURE__ */ new Error("请在账号设置中完善 Zone ID 和 API 令牌");
    throw a.code = "CF_API_ERROR", a.status = 400, a;
  }
  return {
    cfZoneId: r,
    cfApiToken: t
  };
}
function om(o = []) {
  return {
    A: Ns("A", o.filter((e) => e.type === "A").length),
    AAAA: Ns("AAAA", o.filter((e) => e.type === "AAAA").length)
  };
}
function sm(o = "", e = [], r = []) {
  const t = /* @__PURE__ */ new Map(), a = [];
  let n = 0;
  for (const i of e) {
    const c = kr(o, i?.content);
    c && t.set(c, (t.get(c) || 0) + 1);
  }
  for (const i of r) {
    const c = kr(o, i?.content), l = t.get(c) || 0;
    if (l > 0) {
      n += 1, t.set(c, l - 1);
      continue;
    }
    a.push(i);
  }
  const s = [];
  for (const i of e) {
    const c = kr(o, i?.content), l = t.get(c) || 0;
    l <= 0 || (s.push(i), t.set(c, l - 1));
  }
  return {
    identicalCount: n,
    reusableCurrentRecords: a,
    pendingDesiredRecords: s
  };
}
function Nc(o = "", e = "", r = "", t = "", a = {}) {
  const n = async () => (await Hr(o, e, { nameExact: r })).filter((s) => te(s.name) === r && gr(s.type));
  return {
    async deleteRecord(s) {
      s?.id && await Re(`${t}/${encodeURIComponent(s.id)}`, e, { method: "DELETE" });
    },
    async updateRecord(s, i, c) {
      const l = ma(s, {
        host: r,
        type: i,
        content: c
      });
      return Wt((await Re(`${t}/${encodeURIComponent(s.id)}`, e, {
        method: "PUT",
        body: JSON.stringify(l)
      }))?.result || {
        id: s.id,
        ...l
      });
    },
    async createRecord(s, i, c = a) {
      const l = ma(c, {
        host: r,
        type: s,
        content: i
      });
      try {
        return {
          record: Wt((await Re(t, e, {
            method: "POST",
            body: JSON.stringify(l)
          }))?.result || l),
          reusedExisting: !1
        };
      } catch (d) {
        if (String(d?.message || d || "").includes("81058")) {
          const u = (await n()).find((f) => te(f?.name) === r && String(f?.type || "").toUpperCase() === String(s || "").trim().toUpperCase() && kr(f?.type, f?.content) === kr(s, i));
          if (u) return {
            record: Wt(u),
            reusedExisting: !0
          };
        }
        throw d;
      }
    },
    async listCurrentHostRecords() {
      return await n();
    }
  };
}
async function Is(o = "", e = [], r = [], t = {}, a = {}) {
  const n = sm(o, e, r);
  t.identicalCount += n.identicalCount;
  const { reusableCurrentRecords: s, pendingDesiredRecords: i } = n;
  for (let c = 0; c < i.length; c += 1) {
    const l = i[c], d = s[c];
    if (d) {
      await a.updateRecord(d, o, l.content), t.updatedCount += 1;
      continue;
    }
    (await a.createRecord(o, l.content, r[0]))?.reusedExisting === !0 ? t.identicalCount += 1 : t.createdCount += 1;
  }
  for (let c = i.length; c < s.length; c += 1)
    await a.deleteRecord(s[c]), t.deletedCount += 1;
}
async function im({ env: o, kv: e, dnsHistoryRepository: r, config: t, host: a, mode: n = "a", desiredRecords: s = [], requestHost: i = "", skipHistory: c = !1, includeAllRecords: l = !0, includeHistory: d = !0 }) {
  const { cfZoneId: u, cfApiToken: f } = nm(t || await Ae(o));
  let m = !1, p = !1, g = "";
  const h = tm(s), y = h.records, S = om(y);
  try {
    const _ = await ko(u, f, { scope: "dns.persist_records.zone_lookup" }), A = String(_?.name || "").trim() || "";
    if (A && !ha(a, A)) {
      const O = /* @__PURE__ */ new Error("当前站点不在该 Zone 下");
      throw O.code = "INVALID_HOST", O.status = 400, O;
    }
    const b = (await Hr(u, f, { nameExact: a })).filter((O) => te(O.name) === a && gr(O.type)), E = {
      baseRecord: b[0] || {
        name: a,
        ttl: 1,
        proxied: !1
      },
      zoneRecordsUrl: `https://api.cloudflare.com/client/v4/zones/${encodeURIComponent(u)}/dns_records`
    }, R = Nc(u, f, a, E.zoneRecordsUrl, E.baseRecord), L = b.map((O) => Wt(O));
    let T = !1;
    const D = {
      ...R,
      async deleteRecord(O) {
        return T = !0, await R.deleteRecord(O);
      },
      async updateRecord(O, N, I) {
        return T = !0, await R.updateRecord(O, N, I);
      },
      async createRecord(O, N, I) {
        return T = !0, await R.createRecord(O, N, I);
      }
    };
    let w = [], M = null;
    try {
      if (n === "cname") {
        const O = b.filter(($) => $.type === "CNAME"), N = b.filter(($) => $.type === "A" || $.type === "AAAA");
        for (const $ of N) await D.deleteRecord($);
        for (let $ = 1; $ < O.length; $ += 1) await D.deleteRecord(O[$]);
        const I = O[0] || null, P = y[0], H = Number(P?.ttl) || 1, G = P?.proxied === !0;
        if (I) {
          const $ = String(I.content || "").trim() !== P.content, K = Number(I.ttl) !== H, j = I.proxied === !0 !== G;
          ($ || K || j) && await D.updateRecord({
            ...I,
            ttl: H,
            proxied: G
          }, "CNAME", P.content);
        } else await D.createRecord("CNAME", P.content, {
          ...E.baseRecord,
          ttl: H,
          proxied: G
        });
        w = await Hr(u, f, { nameExact: a }), c || (M = await r.recordDnsHostHistory(e, u, a, {
          name: a,
          type: "CNAME",
          content: P.content,
          actor: "admin",
          source: "ui",
          requestHost: i,
          savedAt: (/* @__PURE__ */ new Date()).toISOString()
        }));
      } else {
        const O = b.filter((N) => N.type === "CNAME");
        for (const N of O) await D.deleteRecord(N);
        await Is("A", y.filter((N) => N.type === "A"), b.filter((N) => N.type === "A"), S.A, D), await Is("AAAA", y.filter((N) => N.type === "AAAA"), b.filter((N) => N.type === "AAAA"), S.AAAA, D), w = await Hr(u, f, { nameExact: a });
      }
    } catch (O) {
      if (T) {
        m = !0;
        try {
          const N = await R.listCurrentHostRecords();
          for (const I of N) await R.deleteRecord(I);
          for (const I of L) await R.createRecord(I.type, I.content, I);
          p = !0;
        } catch (N) {
          p = !1, g = String(N?.message || N || "unknown_rollback_error");
        }
      }
      throw O;
    }
    const x = w.filter((O) => gr(O.type)), C = x.filter((O) => te(O.name) === a), F = d === !0 ? M || await r.getDnsHostHistory(e, u, a) : [], W = n === "a" ? rm(n, S, { dedupedDesiredCount: h.duplicateCount }) : null;
    return {
      ok: !0,
      zoneId: u,
      zoneName: A,
      currentHost: a,
      totalRecords: w.length,
      editableRecordCount: x.length,
      filteredCount: C.length,
      records: C,
      ...l === !0 ? { allRecords: x } : {},
      allRecordsIncluded: l === !0,
      history: F,
      mode: n,
      syncSummary: W,
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
function cm(o = {}, e = {}) {
  const { kernel: r } = o, { persistCloudflareDnsRecordsForHost: t } = o;
  return {
    async listDnsRecords(a, { env: n, kv: s, request: i }) {
      const c = re(await Ae(n)), l = String(c.cfZoneId || "").trim(), d = String(c.cfApiToken || "").trim(), u = a?.includeAllRecords !== !1;
      if (!l || !d) return z("CF_API_ERROR", "请在账号设置中完善 Zone ID 和 API 令牌");
      try {
        const f = await am(c, i), m = f.currentHostRecords, p = f.currentHost ? await r.getDnsHostHistory(s, l, f.currentHost) : [];
        return J({
          ok: !0,
          zoneId: l,
          zoneName: f.zoneName,
          currentHost: f.currentHost,
          totalRecords: f.totalRecords,
          editableRecordCount: f.editableRecords.length,
          filteredCount: m.length,
          records: m,
          ...u === !0 ? { allRecords: f.editableRecords } : {},
          allRecordsIncluded: u === !0,
          history: p
        });
      } catch (f) {
        const m = String(f?.message || f || "unknown_error");
        return z("CF_DNS_LIST_FAILED", m.includes("cf_api_http_403") ? "Cloudflare DNS 读取失败：API 令牌权限不足（需要 Zone.DNS:Read）" : m.includes("cf_api_http_401") ? "Cloudflare DNS 读取失败：API 令牌无效" : "Cloudflare DNS 读取失败", 400, { reason: m });
      }
    },
    async setDnsHistoryFallback(a, { env: n, kv: s }) {
      const i = te(a?.host || ""), c = String(a?.entryId || "").trim(), l = a?.enabled !== !1;
      if (!i) return z("MISSING_PARAMS", "host 不能为空");
      if (l && !c) return z("MISSING_PARAMS", "entryId 不能为空");
      const d = re(await Ae(n)), u = String(d.cfZoneId || "").trim();
      if (!u) return z("CF_API_ERROR", "请先在账号设置中保存 Zone ID");
      try {
        return J({
          ok: !0,
          history: await r.setDnsHostHistoryPreferredFallback(s, u, i, c, l)
        });
      } catch (f) {
        const m = String(f?.message || f || "unknown_error");
        return m.includes("dns_history_entry_not_found") ? z("DNS_HISTORY_ENTRY_NOT_FOUND", "指定的 DNS 历史记录不存在", 404) : z("DNS_HISTORY_FALLBACK_UPDATE_FAILED", "设置 DNS 默认回退值失败", 400, { reason: m });
      }
    },
    async createDnsRecord(a, n) {
      return e.updateDnsRecord(a, n);
    },
    async updateDnsRecord(a, { env: n, kv: s, request: i }) {
      const c = String(i.headers.get("X-Admin-Confirm") || "").trim();
      if (c !== "updateDnsRecord" && c !== "createDnsRecord") return z("CONFIRMATION_REQUIRED", "敏感 DNS 操作需要显式确认头", 428);
      const l = String(a?.recordId || a?.id || "").trim(), d = te(a?.host || a?.name || ""), u = String(a?.type || "").trim().toUpperCase(), f = String(a?.content || "").trim(), m = a?.skipHistory === !0;
      if (!gr(u)) return z("INVALID_TYPE", "Type 仅允许 A / AAAA / CNAME");
      const p = Wa(u, f);
      if (p) return z("INVALID_CONTENT", p);
      if (!l && !d) return z("MISSING_PARAMS", "host 不能为空");
      const g = re(await Ae(n)), h = String(g.cfZoneId || "").trim(), y = String(g.cfApiToken || "").trim();
      if (!h || !y) return z("CF_API_ERROR", "请在账号设置中完善 Zone ID 和 API 令牌");
      let S = null, _ = !1, A = !1, b = "";
      try {
        const E = await ko(h, y, { scope: "dns.update_record.zone_lookup" }), R = String(E?.name || "").trim(), L = te(new URL(i.url).hostname);
        let T = null;
        if (l) {
          const w = `https://api.cloudflare.com/client/v4/zones/${encodeURIComponent(h)}/dns_records/${encodeURIComponent(l)}`, M = Wt((await Re(w, y))?.result || null);
          if (!M?.id) return z("NOT_FOUND", "DNS 记录不存在", 404);
          const x = String(M?.type || "").toUpperCase();
          if (!gr(x)) return z("UNSUPPORTED_RECORD_TYPE", "该 DNS 记录类型不支持编辑", 400, { currentType: x });
          const C = d || M.name;
          if (!C) return z("MISSING_PARAMS", "host 不能为空");
          if (R && !ha(C, R)) return z("INVALID_HOST", "记录名称必须位于当前 Zone 下");
          const F = ma(M, {
            host: C,
            type: u,
            content: f
          });
          T = Wt((await Re(w, y, {
            method: "PUT",
            body: JSON.stringify(F)
          }))?.result || {
            id: l,
            ...F
          }), S = async () => {
            const W = ma(M, {
              host: M.name,
              type: M.type,
              content: M.content
            });
            await Re(w, y, {
              method: "PUT",
              body: JSON.stringify(W)
            });
          };
        } else {
          if (R && !ha(d, R)) return z("INVALID_HOST", "记录名称必须位于当前 Zone 下");
          const w = `https://api.cloudflare.com/client/v4/zones/${encodeURIComponent(h)}/dns_records`, M = ma({
            name: d,
            ttl: 1,
            proxied: !1
          }, {
            host: d,
            type: u,
            content: f
          });
          T = Wt((await Re(w, y, {
            method: "POST",
            body: JSON.stringify(M)
          }))?.result || M), S = async () => {
            if (!T?.id) throw new Error("created_dns_record_id_missing");
            await Re(`${w}/${encodeURIComponent(T.id)}`, y, { method: "DELETE" });
          };
        }
        let D;
        try {
          D = T.type === "CNAME" && !m ? await r.recordDnsHostHistory(s, h, T.name, {
            name: T.name,
            type: T.type,
            content: T.content,
            actor: "admin",
            source: "ui",
            requestHost: L,
            savedAt: (/* @__PURE__ */ new Date()).toISOString()
          }) : await r.getDnsHostHistory(s, h, T.name);
        } catch (w) {
          if (_ = typeof S == "function", _) try {
            await S(), A = !0;
          } catch (M) {
            b = ie(M, "dns_rollback_failed");
          }
          throw w;
        }
        return J({
          ok: !0,
          record: T,
          history: D
        });
      } catch (E) {
        const R = String(E?.message || E || "unknown_error");
        return z("CF_DNS_UPDATE_FAILED", R.includes("cf_api_http_403") ? "Cloudflare DNS 更新失败：API 令牌权限不足（需要 Zone.DNS:Edit）" : R.includes("cf_api_http_401") ? "Cloudflare DNS 更新失败：API 令牌无效" : "Cloudflare DNS 更新失败", 400, {
          reason: R,
          rollbackAttempted: _,
          rollbackSucceeded: A,
          rollbackError: b
        });
      }
    },
    async saveDnsRecords(a, { env: n, kv: s, request: i }) {
      if (i.headers.get("X-Admin-Confirm") !== "saveDnsRecords") return z("CONFIRMATION_REQUIRED", "敏感 DNS 操作需要显式确认头", 428);
      const c = Zf(a?.mode), l = te(a?.host || ""), d = a?.includeAllRecords === !0, u = Array.isArray(a?.records) ? a.records : [];
      if (!l) return z("MISSING_PARAMS", "host 不能为空");
      const f = [];
      if (c === "cname") {
        const h = String(u[0]?.content || "").trim(), y = Wa("CNAME", h);
        if (y) return z("INVALID_CONTENT", y);
        f.push({
          type: "CNAME",
          content: h
        });
      } else {
        const h = u.map((y) => ({
          type: String(y?.type || "").trim().toUpperCase(),
          content: String(y?.content || "").trim()
        })).filter((y) => y.type || y.content);
        if (!h.length) return z("INVALID_CONTENT", "A 模式至少保留 1 条 A / AAAA 记录");
        for (const y of h) {
          if (!["A", "AAAA"].includes(y.type)) return z("INVALID_TYPE", "A 模式仅允许 A / AAAA");
          const S = Wa(y.type, y.content, { allowCname: !1 });
          if (S) return z("INVALID_CONTENT", S);
          f.push(y);
        }
      }
      const m = re(await Ae(n)), p = String(m.cfZoneId || "").trim(), g = String(m.cfApiToken || "").trim();
      if (!p || !g) return z("CF_API_ERROR", "请在账号设置中完善 Zone ID 和 API 令牌");
      try {
        const h = te(new URL(i.url).hostname);
        return J(await t({
          env: n,
          kv: s,
          config: m,
          host: l,
          mode: c,
          desiredRecords: f,
          requestHost: h,
          skipHistory: !1,
          includeAllRecords: d
        }));
      } catch (h) {
        const y = String(h?.message || h || "unknown_error");
        return z("CF_DNS_SAVE_FAILED", y.includes("cf_api_http_403") ? "Cloudflare DNS 保存失败：API 令牌权限不足（需要 Zone.DNS:Edit）" : y.includes("cf_api_http_401") ? "Cloudflare DNS 保存失败：API 令牌无效" : "Cloudflare DNS 保存失败", 400, {
          reason: y,
          rollbackAttempted: h?.details?.rollbackAttempted === !0,
          rollbackSucceeded: h?.details?.rollbackSucceeded === !0,
          rollbackError: String(h?.details?.rollbackError || "")
        });
      }
    }
  };
}
async function Zr(o, e, r) {
  const t = Array.isArray(o) ? o : [];
  if (t.length === 0) return [];
  if (typeof r != "function") throw new TypeError("worker must be a function");
  const a = Number(e), n = Number.isFinite(a) && a > 0 ? Math.min(t.length, Math.max(1, Math.floor(a))) : 1, s = new Array(t.length);
  let i = 0;
  const c = Array.from({ length: n }, async () => {
    for (; i < t.length; ) {
      const l = i;
      i += 1;
      const d = Promise.resolve().then(() => r(t[l]));
      s[l] = d, await d.catch(() => {
      });
    }
  });
  return await Promise.all(c), Promise.all(s);
}
var lm = Object.freeze([{
  id: "cloudflare",
  label: "Cloudflare",
  endpoint: "https://cloudflare-dns.com/dns-query"
}]), Ic = 30 * 1e3, dm = Ic, um = "emby-proxy-ui-dns-probe/1.0", fm = 2400 * 1e3, mm = 35 * 1e3, pm = "dns_ip_pool_fetch_lock:", gm = "sys:dns_ip_pool_fetch_lock:v1:";
function hm(o = {}, e = [], r = {}) {
  const t = /* @__PURE__ */ new Set(), a = [];
  for (const s of Array.isArray(e) ? e : []) {
    const i = fr(s);
    if (!i) continue;
    const c = String(i.ip || "").trim().toLowerCase();
    !c || t.has(c) || (t.add(c), a.push(i));
  }
  const n = a.slice(0, Br(o?.ipLimit));
  return {
    id: String(o?.id || ""),
    name: String(o?.name || ""),
    sourceType: Rt(o?.sourceType || o?.source_type || ""),
    status: n.length > 0 ? "success" : "empty",
    count: n.length,
    items: n,
    lastFetchAt: String(r.lastFetchAt || (/* @__PURE__ */ new Date()).toISOString())
  };
}
async function ym(o = {}, e = v.Defaults.DnsIpSourceFetchMaxBytes) {
  const r = String(o?.url || "").trim();
  if (!r) throw new Error("empty_source_url");
  const t = new AbortController(), a = setTimeout(() => t.abort(), Ic);
  try {
    const n = await Be(r, {
      redirect: "follow",
      signal: t.signal
    });
    if (!n.ok) throw new Error(`HTTP_${n.status}`);
    const s = await xe(n, e);
    if (s.exceeded) throw new Error("SOURCE_TOO_LARGE");
    const i = s.text, c = ci(o?.builtinId || o?.builtin_id || "");
    return (c === "all" ? Gl(i) : c === "preferred" ? Vl(i, { limit: Br(o?.ipLimit) }) : Ao(i, { limit: Br(o?.ipLimit) })).map((l) => ({
      ...l,
      sourceKind: "api",
      sourceLabel: o?.name || r
    }));
  } catch (n) {
    throw rr(n) ? new Error("FETCH_TIMEOUT") : n;
  } finally {
    clearTimeout(a);
  }
}
function Sm(o = {}, e = "", r = "A") {
  const t = new URL(String(o?.endpoint || ""));
  return t.searchParams.set("name", te(e)), t.searchParams.set("type", String(r || "A").toUpperCase()), t;
}
async function _m(o = {}, e = "", r = "A") {
  const t = new AbortController(), a = setTimeout(() => t.abort(), dm);
  try {
    const n = await Be(Sm(o, e, r).toString(), {
      headers: { accept: "application/dns-json" },
      redirect: "follow",
      signal: t.signal
    });
    if (!n.ok) throw new Error(`DOH_HTTP_${n.status}`);
    const s = await xe(n, fn);
    return $l(s.exceeded ? null : JSON.parse(s.text || "null")).map((i) => ({
      ...i,
      sourceKind: "domain",
      sourceLabel: String(e || "").trim()
    }));
  } catch (n) {
    throw rr(n) ? new Error("DOH_TIMEOUT") : n;
  } finally {
    clearTimeout(a);
  }
}
function bm(o = []) {
  const e = (Array.isArray(o) ? o : []).map((n) => Array.isArray(n) ? [...n] : []).filter((n) => n.length > 0), r = [], t = /* @__PURE__ */ new Set();
  let a = e.length > 0;
  for (; a; ) {
    a = !1;
    for (const n of e) {
      for (; n.length; ) {
        const s = n.shift(), i = String(s?.ip || "").trim().toLowerCase();
        if (!(!i || t.has(i))) {
          t.add(i), r.push(s);
          break;
        }
      }
      n.length && (a = !0);
    }
  }
  return r;
}
async function Em(o = {}) {
  const e = te(o?.domain || "");
  if (!e) throw new Error("empty_source_domain");
  const r = [], t = [], a = [];
  for (const i of ["A", "AAAA"]) for (const c of lm) a.push({
    resolver: c,
    recordType: i
  });
  const n = await Zr(a, Math.min(2, Math.max(1, a.length)), async ({ resolver: i, recordType: c }) => {
    try {
      return {
        resolver: i,
        recordType: c,
        items: await _m(i, e, c),
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
  for (const i of n) {
    const c = Array.isArray(i?.items) ? i.items : [];
    if (c.length) {
      r.push(c);
      continue;
    }
    String(i?.error || "").trim() && t.push(`${String(i?.resolver?.id || "resolver")}:${String(i?.recordType || "A")}=${String(i?.error || "unknown_doh_error")}`);
  }
  const s = bm(r);
  if (!s.length && n.length > 0 && t.length === n.length) {
    const i = t.every((c) => String(c || "").includes("DOH_TIMEOUT"));
    throw new Error(i ? "DOH_TIMEOUT" : t.join("; "));
  }
  return s.map((i) => ({
    ...i,
    sourceKind: "domain",
    sourceLabel: o?.name || e
  }));
}
async function Rm(o = {}, e = v.Defaults.DnsIpSourceFetchMaxBytes) {
  const r = (/* @__PURE__ */ new Date()).toISOString(), t = It(o);
  try {
    return hm(t, t.sourceType === "domain" ? await Em(t) : await ym(t, e), { lastFetchAt: r });
  } catch (a) {
    return {
      id: String(t?.id || ""),
      name: String(t?.name || ""),
      sourceType: Rt(t?.sourceType || t?.source_type || ""),
      status: "failed",
      count: 0,
      items: [],
      error: String(a?.message || a || "unknown_error"),
      lastFetchAt: r
    };
  }
}
async function Ms(o, e = "", r = "UNKNOWN", t = {}) {
  const { probeRepository: a } = t, n = String(e || "").trim(), s = et(n), i = String(r || "UNKNOWN").trim().toUpperCase() || "UNKNOWN";
  if (!n || !s) return {
    ip: n,
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
  if (o && t.forceRefresh !== !0 && t.skipCacheRead !== !0) {
    const m = await a.getDnsIpProbeCacheEntry(o, n, i);
    if (m) return m;
  }
  const c = new AbortController(), l = setTimeout(() => c.abort(), de(t.probeTimeoutMs ?? t.timeoutMs, v.Defaults.DnsIpProbeTimeoutMs, 250, 3e4)), d = k(), u = s === "IPv6" ? `http://[${n}]/` : `http://${n}/`, f = (/* @__PURE__ */ new Date()).toISOString();
  try {
    const m = await Be(u, {
      headers: { "user-agent": um },
      method: "HEAD",
      redirect: "manual",
      signal: c.signal
    }), p = Math.max(0, k() - d), g = String(m.headers.get("CF-RAY") || m.headers.get("cf-ray") || "").trim(), h = String(m.headers.get("Server") || m.headers.get("server") || "").trim(), y = oi(g), S = y ? "ok" : /cloudflare/i.test(h) ? "cf_header_missing" : "non_cloudflare", _ = jl(y), A = {
      ip: n,
      entryColo: i,
      probeStatus: S,
      latencyMs: p,
      cfRay: g,
      coloCode: _.coloCode,
      cityName: _.cityName,
      countryCode: _.countryCode,
      countryName: _.countryName,
      probedAt: f,
      expiresAt: k() + v.Defaults.DnsIpProbeCacheTtlSec * 1e3
    };
    return o && await a.upsertDnsIpProbeCacheEntry(o, A), A;
  } catch (m) {
    const p = {
      ip: n,
      entryColo: i,
      probeStatus: rr(m) ? "timeout" : "network_error",
      latencyMs: null,
      cfRay: "",
      coloCode: "",
      cityName: "",
      countryCode: "UNKNOWN",
      countryName: "未知",
      probedAt: f,
      expiresAt: k() + v.Defaults.DnsIpProbeCacheTtlSec * 1e3
    };
    return o && await a.upsertDnsIpProbeCacheEntry(o, p), p;
  } finally {
    clearTimeout(l);
  }
}
async function Mc(o = [], e, r = "UNKNOWN", t = {}) {
  const a = [], n = /* @__PURE__ */ new Map(), s = /* @__PURE__ */ new Set(), i = String(r || "UNKNOWN").trim().toUpperCase() || "UNKNOWN";
  for (const S of Array.isArray(o) ? o : []) {
    const _ = String(S?.ip || S?.content || "").trim(), A = et(_) || ni(S?.ipType || S?.ip_type || S?.type || "");
    if (!_ || !A) continue;
    const b = {
      id: String(S?.id || S?.recordId || `${t.scope || "dns"}-${ce(`${_}|${S?.sourceKind || S?.source_kind || ""}`)}`),
      ip: _,
      ipType: A,
      recordId: String(S?.recordId || S?.id || ""),
      host: String(S?.host || S?.name || t.host || ""),
      sourceKind: String(S?.sourceKind || S?.source_kind || t.scope || "shared_pool"),
      sourceLabel: String(S?.sourceLabel || S?.source_label || t.sourceLabel || ""),
      lineLabel: Wr(S?.lineLabel || S?.line_label || ""),
      remark: String(S?.remark || ""),
      createdAt: String(S?.createdAt || S?.created_at || ""),
      updatedAt: String(S?.updatedAt || S?.updated_at || ""),
      probeStatus: $a(S?.probeStatus || S?.probe_status || ""),
      latencyMs: Number.isFinite(Number(S?.latencyMs ?? S?.latency_ms)) ? Math.max(0, Math.round(Number(S?.latencyMs ?? S?.latency_ms))) : null,
      cfRay: String(S?.cfRay || S?.cf_ray || ""),
      coloCode: String(S?.coloCode || S?.colo_code || "").trim().toUpperCase(),
      cityName: String(S?.cityName || S?.city_name || ""),
      countryCode: String(S?.countryCode || S?.country_code || "").trim().toUpperCase() || "UNKNOWN",
      countryName: String(S?.countryName || S?.country_name || "") || "未知",
      probedAt: String(S?.probedAt || S?.probed_at || "")
    };
    a.push(b), n.set(_.toLowerCase(), _);
  }
  if (!a.length) return {
    items: [],
    probeEntryColo: i,
    probeDataSource: "cache"
  };
  const c = /* @__PURE__ */ new Map(), l = [], d = [...n.values()], u = e ? await t.probeRepository.getDnsIpProbeCacheEntries(e, d, i) : [];
  for (const S of Array.isArray(u) ? u : []) {
    const _ = String(S?.ip || "").trim().toLowerCase();
    _ && c.set(_, S);
  }
  for (const S of d)
    c.has(String(S || "").toLowerCase()) && t.forceRefresh !== !0 || l.push(S);
  const f = t.deferProbe === !0 && !!t.ctx?.waitUntil, m = de(t.syncProbeLimit, v.Defaults.DnsIpWorkspaceSyncProbeLimit, 0, 64), p = f && l.length > m ? l.slice(0, m) : l, g = f && l.length > m ? l.slice(m) : [], h = de(t.probeConcurrency, v.Defaults.DnsIpProbeConcurrency, 1, 4);
  let y = "cache";
  return p.length > 0 && (y = "live_sync"), g.length > 0 && (y = "live_deferred"), await Zr(p, h, async (S) => {
    const _ = await Ms(e, S, r, t);
    c.set(String(S || "").toLowerCase(), _);
  }), g.length && (g.forEach((S) => s.add(String(S || "").toLowerCase())), t.ctx.waitUntil(Zr(g, h, async (S) => {
    await Ms(e, S, r, t);
  }).catch((S) => {
    console.warn("[DNS IP Workspace] Deferred probe failed:", S?.message || S);
  }))), {
    items: a.map((S) => {
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
    probeDataSource: no(y)
  };
}
function Tm(o = {}) {
  const e = Co(o?.items || []);
  return {
    sourceResults: fi(o?.sourceResults || []),
    importedCount: Math.max(0, Number(o?.importedCount) || e.length),
    items: e,
    enabledSourceCount: Math.max(0, Number(o?.enabledSourceCount) || 0),
    cachedAt: Xa(o?.cachedAtMs),
    expiresAt: Xa(o?.expiresAtMs)
  };
}
async function Am(o = [], e, r = "UNKNOWN", t = null, a = {}) {
  const n = t && typeof t.waitUntil == "function" ? t : { waitUntil() {
  } }, s = await Mc(o, e, r, {
    probeRepository: a.probeRepository,
    forceRefresh: !1,
    scope: "shared_pool",
    ctx: n,
    deferProbe: !0,
    syncProbeLimit: de(a?.syncProbeLimit, 0, 0, 64),
    probeTimeoutMs: de(a?.probeTimeoutMs, 500, 250, 3e4)
  });
  return Array.isArray(s?.items) ? s.items : [];
}
function no(o = "") {
  const e = String(o || "").trim().toLowerCase();
  return e === "live_deferred" ? "live_deferred" : e === "live_sync" ? "live_sync" : "cache";
}
function Cm(o = "", e = "") {
  const r = no(o), t = no(e), a = {
    cache: 0,
    live_sync: 1,
    live_deferred: 2
  };
  return (a[t] || 0) > (a[r] || 0) ? t : r;
}
function wm(o = {}) {
  const e = [];
  Array.isArray(o?.localPoolItems) && e.push(...o.localPoolItems), Array.isArray(o?.poolItems) && e.push(...o.poolItems), Array.isArray(o?.sharedPoolItems) && e.push(...o.sharedPoolItems);
  const r = [], t = /* @__PURE__ */ new Set();
  for (const a of e) {
    const n = fr(a);
    if (!n) continue;
    const s = String(n.ip || "").trim().toLowerCase();
    !s || t.has(s) || (t.add(s), r.push({
      ...a,
      ...n
    }));
  }
  return r;
}
function Lm(o = [], e = []) {
  const r = /* @__PURE__ */ new Map(), t = (a) => {
    for (const n of Array.isArray(a) ? a : []) {
      const s = fr(n);
      s && r.set(String(s.ip || "").trim().toLowerCase(), {
        ...n,
        ...s
      });
    }
  };
  return t(o), t(e), [...r.values()];
}
function Dm(o = "") {
  return `${pm}${String(o || "").trim()}`;
}
async function Nm({ kv: o = null, db: e = null, leaseRepository: r = null } = {}, t = "") {
  const a = Dm(t);
  if (!a || a === "dns_ip_pool_fetch_lock:") return {
    acquired: !1,
    reason: "empty_signature"
  };
  const n = `${k()}-${Math.random().toString(36).slice(2, 10)}`;
  return e ? {
    ...await r.tryAcquireScheduledLeaseWithDb(e, {
      scope: a,
      token: n,
      owner: "dns_ip_pool_fetch",
      leaseMs: mm
    }),
    token: n,
    key: a
  } : {
    acquired: !1,
    reason: "db_unavailable",
    backend: "d1",
    token: n,
    key: a
  };
}
async function Im({ kv: o = null, db: e = null, leaseRepository: r = null } = {}, t = null) {
  if (!t?.token) return !1;
  const a = String(t?.key || "").trim();
  return e && a ? await r.releaseScheduledLeaseWithDb(e, t.token, { scope: a }) : !1;
}
async function Mm({ kv: o = null, db: e = null, ctx: r = null, sourceList: t = [], maxBytes: a = v.Defaults.DnsIpSourceFetchMaxBytes, poolRepository: n = null } = {}) {
  const s = (Array.isArray(t) ? t : []).map((_, A) => It(_, A)), i = s.filter((_) => _.enabled === !0 && or(_)), c = de(v.Defaults.DnsIpSourceConcurrency, v.Defaults.DnsIpSourceConcurrency, 1, 4), l = await Zr(i, i.some((_) => Rt(_?.sourceType) === "domain") ? Math.min(c, 2) : c, async (_) => Rm(_, a)), d = [], u = /* @__PURE__ */ new Map();
  for (const _ of l)
    u.set(String(_?.id || ""), _), Array.isArray(_?.items) && d.push(..._.items);
  const f = s.map((_, A) => {
    const b = u.get(String(_?.id || ""));
    return It(b ? {
      ..._,
      lastFetchAt: b.lastFetchAt,
      lastFetchStatus: b.status,
      lastFetchCount: b.count
    } : _, A);
  }), m = await ye(n.persistDnsIpPoolSources({
    kv: o,
    db: e
  }, f, null), "dns_ip_pool.refresh.persist_source_state", {
    sourceCount: f.length,
    enabledSourceCount: i.length
  }, f), p = mr(d), g = Co(p), h = fi(l);
  let y = "", S = "";
  if (e) {
    const _ = Ba(s, a);
    if (_ && ad(l)) {
      const A = k(), b = A + fm, E = await n.upsertDnsIpPoolFetchCacheEntry(e, {
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
      y = Xa(E?.cachedAtMs), S = Xa(E?.expiresAtMs);
    }
  }
  return i.length && await ye(n.bumpDnsIpPoolRevision({
    kv: o,
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
function Pm(o = {}, e = {}) {
  const { kernel: r } = o, { buildDnsIpPoolWorkspacePreviewItems: t, buildDnsIpWorkspaceItems: a, releaseDnsIpPoolFetchRefreshLock: n, runDnsIpPoolSourcesLiveRefresh: s, tryAcquireDnsIpPoolFetchRefreshLock: i } = o;
  return {
    async getDnsIpWorkspace(c, { env: l, kv: d, db: u, request: f, ctx: m }) {
      try {
        const p = c?.forceRefresh === !0;
        u && await r.ensureDnsIpWorkspaceSchema(u);
        const g = await ue(l), h = ca(f), y = Gd(f);
        let S = await r.getDnsIpPoolSourcesForRead({
          kv: d,
          db: u
        });
        const _ = wm(c), A = v.Defaults.DnsIpSourceFetchMaxBytes, b = S.filter((F) => F.enabled === !0 && or(F));
        let E = [], R = "empty", L = !1;
        if (p && b.length > 0) {
          const F = await s({
            kv: d,
            db: u,
            ctx: m,
            sourceList: S,
            maxBytes: A
          });
          S = Array.isArray(F?.sourceList) ? F.sourceList : S, E = Array.isArray(F?.items) ? F.items : [], R = "live_sync";
        } else {
          const F = Ba(S, A), W = u && F ? await r.getDnsIpPoolFetchCacheEntry(u, F) : null;
          if (W)
            E = Array.isArray(W?.items) ? W.items : [], R = "cache";
          else if (b.length > 0 && m?.waitUntil && F) {
            const O = await i({
              kv: d,
              db: u
            }, F);
            O?.acquired === !0 && (L = !0, R = "live_deferred", m.waitUntil((async () => {
              try {
                await s({
                  kv: d,
                  db: u,
                  sourceList: S,
                  maxBytes: A
                });
              } catch (N) {
                console.warn("[DNS IP Workspace] background source snapshot refresh failed:", N?.message || N);
              } finally {
                await n({
                  kv: d,
                  db: u
                }, O);
              }
            })()));
          }
        }
        const T = Lm(E, _), D = await a(T, u, h, {
          forceRefresh: p,
          scope: "shared_pool",
          ctx: m,
          deferProbe: !0,
          syncProbeLimit: 0,
          probeTimeoutMs: 500
        }), w = [], M = Array.isArray(D?.items) ? D.items : [], x = await r.getOpsStatusSection({
          kv: d,
          db: u
        }, "dnsIpPool"), C = /* @__PURE__ */ new Map();
        for (const F of M) {
          const W = String(F?.countryCode || "").trim().toUpperCase();
          if (!W) continue;
          const O = C.get(W) || {
            code: W,
            name: String(F?.countryName || "未知"),
            count: 0
          };
          O.count += 1, C.set(W, O);
        }
        return J({
          zoneId: String(g.cfZoneId || "").trim(),
          zoneName: "",
          host: "",
          requestColo: h,
          probeEntryColo: h,
          probeDataSource: Cm("cache", D?.probeDataSource),
          sourceSnapshotStatus: R,
          backgroundRefreshQueued: L,
          requestCountryCode: y.countryCode,
          requestCountryName: y.countryName,
          currentHostItems: w,
          sharedPoolItems: M,
          sourceList: S,
          availableCountries: [...C.values()].sort((F, W) => String(F.code || "").localeCompare(String(W.code || ""))),
          summary: sd(w, M),
          dnsIpPoolRevision: r.getDnsIpPoolRevisionFromStatus(x),
          generatedAt: (/* @__PURE__ */ new Date()).toISOString(),
          ...Er(),
          revisions: await r.getAdminRevisionsForRead({
            env: l,
            kv: d,
            db: u
          }, {
            ctx: m,
            config: g
          })
        });
      } catch (p) {
        throw Lt(p, "DNS_IP_WORKSPACE_READ_FAILED", "独立 IP 池工作区读取失败：KV 读取异常", "admin.read.dns_ip_workspace");
      }
    },
    async importDnsIpPoolItems(c, { env: l, kv: d, db: u, request: f }) {
      const m = String(c?.text || c?.content || "").trim();
      if (!m) return z("EMPTY_IMPORT_TEXT", "请先提供要导入的文本内容");
      const p = String(c?.sourceKind || "manual").trim().toLowerCase() || "manual", g = String(c?.sourceLabel || "").trim() || (p === "file" ? "文件导入" : "手动导入"), h = Ao(m).map((_) => ({
        ..._,
        sourceKind: p,
        sourceLabel: g
      })), y = await a(h, u, ca(f), {
        scope: "shared_pool",
        forceRefresh: !1
      }), S = Array.isArray(y?.items) ? y.items : [];
      return J({
        success: !0,
        importedCount: S.length,
        items: S,
        revisions: await r.getAdminRevisions({
          env: l,
          kv: d,
          db: u
        })
      });
    },
    async saveDnsIpPoolSources(c, { env: l, kv: d, db: u, ctx: f }) {
      if (!u) return z("D1_NOT_CONFIGURED", "请先绑定 D1 / PROXY_LOGS 数据库");
      const m = await r.persistDnsIpPoolSources({
        kv: d,
        db: u
      }, c?.sources || [], f);
      return await r.bumpDnsIpPoolRevision({
        kv: d,
        db: u
      }, {
        lastSourceConfigAt: (/* @__PURE__ */ new Date()).toISOString(),
        sourceCount: m.length
      }, f), J({
        success: !0,
        sourceList: m,
        dnsIpPoolRevision: await r.getOpsStatusSection({
          kv: d,
          db: u
        }, "dnsIpPool").then((p) => r.getDnsIpPoolRevisionFromStatus(p)).catch(() => ""),
        ...Er(),
        revisions: await r.getAdminRevisions({
          env: l,
          kv: d,
          db: u
        })
      });
    },
    async getDnsIpPoolSources(c, { env: l, kv: d, db: u }) {
      try {
        if (!u) return J({
          success: !0,
          sourceList: [],
          dnsIpPoolRevision: "",
          ...Er(),
          revisions: await r.getAdminRevisionsForRead({
            env: l,
            kv: d,
            db: u
          }, { config: await ue(l) })
        });
        u && await r.ensureDnsIpWorkspaceSchema(u);
        const [f, m, p] = await Promise.all([
          ue(l),
          r.getDnsIpPoolSourcesForRead({
            kv: d,
            db: u
          }),
          r.getOpsStatusSection({
            kv: d,
            db: u
          }, "dnsIpPool")
        ]);
        return J({
          success: !0,
          sourceList: m,
          dnsIpPoolRevision: r.getDnsIpPoolRevisionFromStatus(p),
          ...Er(),
          revisions: await r.getAdminRevisionsForRead({
            env: l,
            kv: d,
            db: u
          }, { config: f })
        });
      } catch (f) {
        throw Lt(f, "DNS_IP_POOL_SOURCES_READ_FAILED", "独立 IP 池抓取源读取失败：D1 读取异常", "admin.read.dns_ip_pool_sources");
      }
    },
    async refreshDnsIpPoolFromSources(c, { env: l, kv: d, db: u, ctx: f, request: m }) {
      try {
        if (!u) return z("D1_NOT_CONFIGURED", "请先绑定 D1 / PROXY_LOGS 数据库");
        u && await r.ensureDnsIpWorkspaceSchema(u);
        const p = de(c?.maxBytes, v.Defaults.DnsIpSourceFetchMaxBytes, 1024, 8 * 1024 * 1024), g = await r.getDnsIpPoolSources({
          kv: d,
          db: u
        }), h = Ba(g, p), y = u && h ? await r.getDnsIpPoolFetchCacheEntry(u, h) : null;
        if (y) {
          let A = !1;
          if (f?.waitUntil) {
            const R = await i({
              kv: d,
              db: u
            }, h);
            R?.acquired === !0 && (A = !0, f.waitUntil((async () => {
              try {
                await s({
                  kv: d,
                  db: u,
                  sourceList: g,
                  maxBytes: p
                });
              } catch (L) {
                console.warn("[DNS IP Pool] background refresh failed:", L?.message || L);
              } finally {
                await n({
                  kv: d,
                  db: u
                }, R);
              }
            })()));
          }
          const b = Tm(y), E = await t(b.items, u, ca(m), f, { syncProbeLimit: 0 });
          return J({
            success: !0,
            sourceResults: b.sourceResults,
            sourceList: g,
            importedCount: b.importedCount,
            items: E,
            cacheStatus: "d1",
            backgroundRefreshQueued: A,
            cachedAt: b.cachedAt,
            expiresAt: b.expiresAt,
            dnsIpPoolRevision: await r.getOpsStatusSection({
              kv: d,
              db: u
            }, "dnsIpPool").then((R) => r.getDnsIpPoolRevisionFromStatus(R)).catch(() => ""),
            ...Er(),
            revisions: await r.getAdminRevisions({
              env: l,
              kv: d,
              db: u
            })
          });
        }
        const S = await s({
          kv: d,
          db: u,
          ctx: f,
          sourceList: g,
          maxBytes: p
        }), _ = await t(S.items, u, ca(m), f, {
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
          dnsIpPoolRevision: await r.getOpsStatusSection({
            kv: d,
            db: u
          }, "dnsIpPool").then((A) => r.getDnsIpPoolRevisionFromStatus(A)).catch(() => ""),
          ...Er(),
          revisions: await r.getAdminRevisions({
            env: l,
            kv: d,
            db: u
          })
        });
      } catch (p) {
        if (dn(p)) throw p;
        const g = ie(p, "unknown_error"), h = /* @__PURE__ */ new Error(`更新服务端共享快照失败: ${g}`);
        throw h.code = "DNS_IP_POOL_REFRESH_FAILED", h.status = 500, h.details = { reason: g }, h;
      }
    },
    async deleteDnsIpPoolItems(c, { env: l, kv: d, db: u, ctx: f }) {
      u && await r.ensureDnsIpWorkspaceSchema(u);
      const m = nd(c?.target);
      if (m === "shared_snapshot") {
        if (!u) return z("D1_NOT_CONFIGURED", "请先绑定 D1 / PROXY_LOGS 数据库");
        const g = await r.getDnsIpPoolSourcesForRead({
          kv: d,
          db: u
        }), h = Ba(g, v.Defaults.DnsIpSourceFetchMaxBytes), y = h ? await r.getDnsIpPoolFetchCacheEntry(u, h) : null, S = od(y, c?.ips || []);
        if (y && h && S.deletedCount > 0) {
          const _ = (/* @__PURE__ */ new Date()).toISOString(), A = Math.max(0, Number(y?.cachedAtMs) || 0), b = Math.max(A, Number(y?.expiresAtMs) || A), E = Math.max(0, Number(y?.enabledSourceCount) || (Array.isArray(g) ? g.filter((R) => R?.enabled === !0 && or(R)).length : 0));
          await r.upsertDnsIpPoolFetchCacheEntry(u, {
            signature: h,
            items: S.items,
            sourceResults: S.sourceResults,
            importedCount: S.items.length,
            enabledSourceCount: E,
            cachedAtMs: A,
            expiresAtMs: b,
            createdAt: String(y?.createdAt || _),
            updatedAt: _
          }), await r.bumpDnsIpPoolRevision({
            kv: d,
            db: u
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
          revisions: await r.getAdminRevisions({
            env: l,
            kv: d,
            db: u
          })
        });
      }
      const p = mi(c?.ips || []).normalizedIps;
      return J({
        success: !0,
        target: m,
        deletedCount: u ? await r.deleteDnsIpPoolItems(u, p) : p.length,
        revisions: await r.getAdminRevisions({
          env: l,
          kv: d,
          db: u
        })
      });
    },
    async fillDnsDraftFromIpPool(c) {
      const l = [];
      for (const f of Array.isArray(c?.ips) ? c.ips : []) {
        const m = String(f?.ip || f || "").trim(), p = et(m);
        !m || !p || l.push({
          type: p === "IPv6" ? "AAAA" : "A",
          content: m
        });
      }
      if (!l.length) return z("EMPTY_IP_SELECTION", "请先选择至少一个可用 IP");
      const d = [], u = /* @__PURE__ */ new Set();
      for (const f of l) {
        const m = `${f.type}:${f.content.toLowerCase()}`;
        u.has(m) || (u.add(m), d.push(f));
      }
      return d.sort((f, m) => f.type !== m.type ? f.type.localeCompare(m.type) : f.content.localeCompare(m.content)), J({
        success: !0,
        mode: "a",
        records: d
      });
    }
  };
}
function xm(o = {}, e = {}) {
  const { kernel: r } = o;
  return {
    async testTelegram(t) {
      const { tgBotToken: a, tgChatId: n } = t;
      if (!a || !n) return z("MISSING_PARAMS", "请先填写 Bot Token 和 Chat ID");
      try {
        return await r.sendTelegramMessage({
          tgBotToken: a,
          tgChatId: n,
          text: `✅ Emby Proxy: Telegram 机器人测试通知成功！
如果您能看到这条消息，说明您的通知配置完全正确。`
        }), J({ success: !0 });
      } catch (s) {
        return z("NETWORK_ERROR", s.message);
      }
    },
    async sendDailyReport(t, { env: a }) {
      try {
        const n = await r.sendDailyTelegramReport(a);
        return J({
          success: !0,
          sentCount: Number(n?.sentCount) || 0,
          reportKinds: Array.isArray(n?.reportKinds) ? n.reportKinds : []
        });
      } catch (n) {
        return z("REPORT_FAILED", n.message);
      }
    },
    async sendPredictedAlert(t, { env: a }) {
      try {
        const n = await r.maybeSendRuntimeAlerts(a, null, {
          ignoreCooldown: !0,
          persistState: !1,
          triggeredBy: "manual_predict"
        });
        return J({
          success: !0,
          sent: n?.sent === !0,
          issueCount: Number(n?.issueCount) || 0,
          reason: String(n?.reason || "").trim()
        });
      } catch (n) {
        return z("ALERT_PREDICT_FAILED", n.message);
      }
    },
    async pingNode(t, { env: a, ctx: n }) {
      const s = await Ae(a), i = de(t.timeout, s.pingTimeout ?? Sd, 1e3, 18e4);
      if (t.target) {
        const S = r.normalizeSingleTarget(t.target);
        if (!S) return z("INVALID_TARGET", "目标源站必须是有效的 http/https URL");
        const _ = await r.pingTarget(S, i);
        return J({
          ..._.ok ? { ms: _.elapsedMs } : {},
          probe: _,
          target: S,
          usedCache: !1,
          scope: "target"
        });
      }
      const c = String(t.name || "").trim(), l = await r.getNode(c, a, n);
      if (!l || !Array.isArray(l.lines) || !l.lines.length) return z("NOT_FOUND", "节点不存在");
      const d = String(t.lineId || "").trim(), u = d ? l.lines.filter((S) => S.id === d) : l.lines.slice();
      if (d && !u.length) return z("LINE_NOT_FOUND", "线路不存在", 404);
      const f = await Promise.all(u.map(async (S) => {
        const _ = await r.pingTarget(S.target, i);
        return {
          id: String(S?.id || "").trim(),
          name: String(S?.name || "").trim(),
          target: String(S?.target || "").trim(),
          latencyMs: _.ok ? _.elapsedMs : null,
          probe: _,
          latencyUpdatedAt: (/* @__PURE__ */ new Date()).toISOString()
        };
      })), m = l.lines.map((S) => {
        const _ = f.find((A) => A.id === S.id);
        return _ ? {
          id: _.id,
          name: _.name,
          target: _.target,
          latencyMs: _.latencyMs,
          probe: _.probe,
          latencyUpdatedAt: _.latencyUpdatedAt
        } : {
          id: String(S?.id || "").trim(),
          name: String(S?.name || "").trim(),
          target: String(S?.target || "").trim()
        };
      }), p = r.resolveActiveLineId(l.activeLineId, m, m), g = r.getActiveNodeLine({
        ...l,
        lines: m,
        activeLineId: p
      }), h = d ? m.find((S) => S.id === d) : g, y = r.buildNodeSummary(c.toLowerCase(), l).summary || { name: c.toLowerCase() };
      return J({
        ...h?.probe?.ok ? { ms: h.probe.elapsedMs } : {},
        probe: h?.probe || null,
        usedCache: !1,
        sorted: !1,
        activeLineId: p,
        activeLineName: g?.name || "",
        line: h || null,
        node: {
          ...y,
          lines: m,
          activeLineId: p
        }
      });
    }
  };
}
function Om(o = {}, e = {}) {
  const { kernel: r } = o, { LogQueryPlanner: t } = o;
  return {
    async getLogs(a, { db: n, env: s }) {
      if (!n) return J({ error: "D1 not configured" }, 500);
      const i = t.normalizeRequest(a), { filters: c } = i, l = s ? await Ae(s) : {}, d = await r.resolveLogsReadiness({
        db: n,
        kv: r.getKV(s)
      }), u = t.resolveSearch(c, l, d);
      if (u.errorResponse) return u.errorResponse;
      const { effectiveSearchMode: f, searchFallbackReason: m } = u;
      if (l.logEnabled === !1) return t.buildDisabledResponse(i, d, f, m);
      if (d.schemaReady !== !0) return z("LOG_SCHEMA_NOT_READY", "日志表尚未初始化，请先点击“初始化日志表”", 400, {
        effectiveSearchMode: f,
        searchFallbackReason: m,
        revisions: { logsRevision: d.revision }
      });
      const p = t.buildSqlPlan(c, i, l, f);
      if (p.errorResponse) return p.errorResponse;
      const g = await t.executeSqlPlan(n, i, p);
      return g.errorResponse ? g.errorResponse : t.buildSuccessResponse(i, d, {
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
    async clearLogs(a, { db: n, env: s, ctx: i, request: c }) {
      if (c.headers.get("X-Admin-Confirm") !== "clearLogs") return z("CONFIRMATION_REQUIRED", "敏感操作需要显式确认头", 428);
      if (!n) return J({ error: "D1 not configured" }, 500);
      await r.ensureLogsBaseSchema(n), await r.ensureStatsHourlySchema(n);
      const l = k(), d = tr.get(n);
      d.LogClearEpochMs = Math.max(d.LogClearEpochMs || 0, l), await r.patchOpsStatus(s || n, { log: {
        clearEpochMs: l,
        clearEpochAt: new Date(l).toISOString()
      } }, i);
      const u = d.LogFlushTask;
      if (u) try {
        await u;
      } catch {
      }
      d.LogQueue.length = 0, d.LogDedupe.clear(), d.LogLastFlushAt = 0, await n.prepare(`DELETE FROM ${r.LOGS_TABLE}`).run(), await r.clearStatsHourly(n).catch(() => !1);
      let f = !1;
      try {
        f = await r.rebuildLogsFts(n);
      } catch (h) {
        console.warn("clearLogs FTS rebuild failed", h);
      }
      const m = await r.isLogsFtsReady(n), p = await r.hasStatsHourlyTable(n), g = await r.bumpLogsRevision(s || { db: n }, {
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
        revisions: { logsRevision: r.getLogsRevisionFromStatus(g?.log || g) }
      });
    },
    async getD1SchemaStatus(a, { db: n, env: s }) {
      if (!n) return z("D1_NOT_CONFIGURED", "请先绑定 D1 / PROXY_LOGS 数据库", 503);
      const i = await r.buildD1SchemaRepairPlan(n);
      let c = {
        token: "",
        expiresAt: 0
      };
      return i.phase === "destructive" && i.blockingIssues.length === 0 && (c = await r.createD1SchemaRepairToken(s, i)), J({
        success: !0,
        status: {
          ...i.status,
          repairableIssues: i.repairableIssues,
          highRiskIssues: i.highRiskIssues,
          blockingIssues: i.blockingIssues
        },
        repairPlan: {
          version: i.version,
          phase: i.phase,
          contractVersion: i.contractVersion,
          contractHash: i.contractHash,
          schemaCookie: i.schemaCookie,
          planHash: i.planHash,
          risk: i.risk,
          repairableIssues: i.repairableIssues,
          highRiskIssues: i.highRiskIssues,
          blockingIssues: i.blockingIssues,
          steps: i.steps,
          repairToken: c.token,
          expiresAt: c.expiresAt ? (/* @__PURE__ */ new Date(c.expiresAt * 1e3)).toISOString() : ""
        }
      });
    },
    async initLogsDb(a, { db: n, env: s, request: i }) {
      if (!n) return z("D1_NOT_CONFIGURED", "D1 database is not configured", 503);
      const c = await r.initializeD1Database(n, {
        includeFts: !0,
        env: s,
        repairMode: String(a?.repairMode || "safe").trim() || "safe",
        repairToken: String(a?.repairToken || "").trim(),
        confirmHighRisk: String(i?.headers?.get("X-Admin-Confirm") || "").trim() === "repairD1Schema"
      }), l = c.status, d = l.ftsReady === !0, u = l.tables?.[r.STATS_HOURLY_TABLE] === !0, f = l.schemaReady === !0 ? await r.bumpLogsRevision(n, {
        schemaReady: !0,
        ftsReady: d,
        statsReady: u,
        categoryEnabled: !0
      }) : null;
      return J({
        success: c.completed === !0 || c.pendingHighRisk === !0,
        schemaReady: l.schemaReady === !0,
        pendingHighRisk: c.pendingHighRisk === !0,
        categoryEnabled: !0,
        ftsReady: d,
        statsReady: u,
        initialization: c,
        steps: c.steps,
        status: l,
        revisions: f ? { logsRevision: r.getLogsRevisionFromStatus(f?.log || f) } : {}
      });
    }
  };
}
function vm(o = {}) {
  const { kernel: e } = o, r = {}, t = fl([
    {
      name: "dashboard",
      handlers: Ff({
        ...o,
        kernel: e
      }, r)
    },
    {
      name: "config",
      handlers: Gf({
        ...o,
        kernel: e
      }, r)
    },
    {
      name: "backup",
      handlers: Vf({
        ...o,
        kernel: e
      }, r)
    },
    {
      name: "nodes",
      handlers: Jf({
        ...o,
        kernel: e
      }, r)
    },
    {
      name: "maintenance",
      handlers: Qf({
        ...o,
        kernel: e
      }, r)
    },
    {
      name: "dns-records",
      handlers: cm({
        ...o,
        kernel: e
      }, r)
    },
    {
      name: "dns-pool",
      handlers: Pm({
        ...o,
        kernel: e
      }, r)
    },
    {
      name: "notifications",
      handlers: xm({
        ...o,
        kernel: e
      }, r)
    },
    {
      name: "database",
      handlers: Om({
        ...o,
        kernel: e
      }, r)
    }
  ], { aliases: {
    import: "saveOrImport",
    save: "saveOrImport"
  } });
  for (const [a, n] of Object.entries(t.handlers)) r[a] = n;
  return t;
}
function Fm(o = {}) {
  return { adminActionHandlers: vm(o).handlers };
}
function qe(o, e) {
  const r = U(o) ? o : {}, t = U(e) ? e : {}, a = { ...r };
  for (const [n, s] of Object.entries(t))
    s !== void 0 && (U(s) && U(r[n]) ? a[n] = qe(r[n], s) : U(s) ? a[n] = qe({}, s) : a[n] = s);
  return a;
}
function Fe(o, e, r, t) {
  o.has(e) && o.delete(e), o.set(e, r);
  const a = Math.floor(Number(t));
  if (!(!Number.isFinite(a) || a < 1))
    for (; o.size > a; ) {
      const n = o.keys().next().value;
      if (n === void 0) break;
      o.delete(n);
    }
}
function on(o, e) {
  if (!o.has(e)) return;
  const r = o.get(e);
  return o.delete(e), o.set(e, r), r;
}
function cr(o = void 0) {
  const e = o === void 0 ? _t.current() : _e(o);
  e.NodesRevisionCacheGeneration += 1, e.NodesRevisionCache = null;
}
function Ps(o, e = null) {
  const r = _e(e);
  r.NodesRevisionCacheGeneration += 1, r.NodesRevisionCache = {
    loaded: !0,
    revision: String(o || "").trim(),
    exp: Date.now() + v.Defaults.NodesRevisionCacheTtlMs
  };
}
function Pe(o, e = _t.current()) {
  const r = String(o || "").trim().toLowerCase(), t = r && Number(e.NodeCacheGenerations.get(r)) || 0, a = t ? `node:${t}` : `missing:${e.NodeCacheGenerationEvictionEpoch}`;
  return `${e.NodeCacheResetGeneration}:${a}`;
}
function Um(o = [], e = _t.current()) {
  for (const r of Array.isArray(o) ? o : [o]) {
    const t = String(r || "").trim().toLowerCase();
    if (!t) continue;
    !e.NodeCacheGenerations.has(t) && e.NodeCacheGenerations.size >= v.Defaults.NodeCacheMax && (e.NodeCacheGenerationEvictionEpoch += 1);
    const a = ++e.NodeCacheGenerationNonce;
    Fe(e.NodeCacheGenerations, t, a, v.Defaults.NodeCacheMax);
  }
}
function xs(o = _t.current()) {
  o.NodeCacheResetGeneration += 1, o.NodeCacheGenerations.clear();
}
function wr(o) {
  return new TextEncoder().encode(String(o ?? "")).byteLength;
}
function Ze(o, e = {}) {
  const r = String(o || "").trim().toLowerCase(), t = U(e) ? e : {}, a = Array.isArray(t.lines) ? t.lines : [];
  if (a.length > qn) return {
    nodeName: r,
    field: "lines",
    actual: a.length,
    limit: qn
  };
  const n = U(t.headers) ? t.headers : {}, s = Object.entries(n);
  if (s.length > ns) return {
    nodeName: r,
    field: "headers.count",
    actual: s.length,
    limit: ns
  };
  let i = 0;
  for (const [l, d] of s) {
    const u = wr(l), f = wr(d);
    if (u > ss) return {
      nodeName: r,
      field: `headers.${l}.keyBytes`,
      actual: u,
      limit: ss
    };
    if (f > is) return {
      nodeName: r,
      field: `headers.${l}.valueBytes`,
      actual: f,
      limit: is
    };
    i += u + f;
  }
  if (i > os) return {
    nodeName: r,
    field: "headers.bytes",
    actual: i,
    limit: os
  };
  for (const l of Id) {
    const d = wr(t[l]);
    if (d > Rr) return {
      nodeName: r,
      field: l,
      actual: d,
      limit: Rr
    };
  }
  for (let l = 0; l < (Array.isArray(t.tags) ? t.tags.length : 0); l += 1) {
    const d = wr(t.tags[l]);
    if (d > Rr) return {
      nodeName: r,
      field: `tags.${l}`,
      actual: d,
      limit: Rr
    };
  }
  for (let l = 0; l < a.length; l += 1) for (const d of [
    "id",
    "name",
    "target"
  ]) {
    const u = wr(a[l]?.[d]);
    if (u > Rr) return {
      nodeName: r,
      field: `lines.${l}.${d}`,
      actual: u,
      limit: Rr
    };
  }
  let c = 0;
  try {
    c = wr(JSON.stringify(t));
  } catch {
    return {
      nodeName: r,
      field: "record",
      actual: null,
      limit: On
    };
  }
  return c > On ? {
    nodeName: r,
    field: "record.bytes",
    actual: c,
    limit: On
  } : null;
}
function Hm(o, e = {}) {
  const r = Ze(o, e);
  return r ? {
    code: "NODE_RESOURCE_LIMIT_EXCEEDED",
    ...r
  } : null;
}
async function Dr(o, e = null) {
  const r = _e(e), t = r.NodeIndexMutationChain.catch(() => null).then(async () => {
    r.NodesListCache = null, r.NodesIndexCache = null, cr(e);
    try {
      return await o();
    } catch (a) {
      throw r.NodesListCache = null, r.NodesIndexCache = null, cr(e), a;
    }
  });
  return r.NodeIndexMutationChain = t.catch(() => null), await t;
}
var km = "cf_dashboard_cache:", Pc = "sys:cf_dash_cache", Km = 1800 * 1e3, Os = 1440 * 60 * 1e3;
function oo(o, e = "") {
  return `${km}${encodeURIComponent(String(o || "default").trim() || "default")}:${encodeURIComponent(String(e || "current").trim() || "current")}`;
}
function vs(o, e = "") {
  return `${Pc}:${encodeURIComponent(String(o || "default").trim() || "default")}:${encodeURIComponent(String(e || "current").trim() || "current")}`;
}
function Fs(o = /* @__PURE__ */ new Date(), e = v.Defaults.ScheduleUtcOffsetMinutes) {
  const r = La(o, e), t = r.shiftedDate.getUTCFullYear(), a = r.shiftedDate.getUTCMonth(), n = Date.UTC(t, a, 1) - r.utcOffsetMinutes * 60 * 1e3, s = Date.UTC(t, a + 1, 1) - r.utcOffsetMinutes * 60 * 1e3, i = r.now.getTime();
  return {
    ...r,
    monthKey: `${t}-${String(a + 1).padStart(2, "0")}`,
    periodLabel: `${t}年${a + 1}月`,
    startTs: n,
    endTs: Math.min(Math.max(n, i), s - 1),
    nextMonthTs: s
  };
}
function Bm(o = "", e = "", r = 0) {
  return [
    "dashboard_monthly_traffic",
    1,
    encodeURIComponent(String(o || "default").trim() || "default"),
    encodeURIComponent(String(e || "current").trim() || "current"),
    Ke(r)
  ].join(":");
}
function $m(o = "") {
  const e = String(o || "").trim();
  return e ? new Request(`https://dashboard-monthly-traffic-cache.invalid/${encodeURIComponent(e)}`) : null;
}
function Yt(o = {}) {
  const e = o && typeof o == "object" ? { ...o } : {};
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
function zm(o = "", e = "") {
  const r = String(o || "").trim();
  return r ? String(e || "").trim().toLowerCase() === "workers_usage" && r.includes("Cloudflare Workers Usage") ? "今日请求量口径：Cloudflare Workers Usage" : r : "";
}
function Wm(o = "") {
  const e = String(o || "").trim();
  return e ? e.includes("请求数已对齐 Workers Usage") ? "Cloudflare 统计正常" : e : "";
}
function Gm(o = "", e = "") {
  const r = String(o || "").trim();
  if (!r) return "";
  const t = String(e || "").trim().toLowerCase();
  return r.includes("已对齐脚本") || t === "workers_usage" && r.includes("脚本:") ? "" : r;
}
var Vm = [
  "周日",
  "周一",
  "周二",
  "周三",
  "周四",
  "周五",
  "周六"
];
function xc() {
  return Array.from({ length: 24 }, (o, e) => String(e).padStart(2, "0"));
}
function so(o = "") {
  const e = /^(\d{4})-(\d{2})-(\d{2})$/.exec(String(o || "").trim());
  if (!e) return String(o || "").trim() || "-";
  const r = Vm[new Date(Date.UTC(Number(e[1]), Number(e[2]) - 1, Number(e[3]))).getUTCDay()] || "";
  return `${e[2]}-${e[3]}${r ? ` ${r}` : ""}`;
}
function Oc(o = "", e = 0, r = 0, t = 0, a = 0) {
  const n = Math.max(0, Math.min(23, Number(e) || 0)), s = Math.max(0, Number(r) || 0), i = Math.max(0, Number(t) || 0), c = Math.max(0, Math.min(1, Number(a) || 0)), l = `${String(n).padStart(2, "0")}:00`, d = s > 0 ? Math.min(0.88, Number((0.12 + c * 0.68).toFixed(3))) : 0.04;
  return {
    key: `${o}:${n}`,
    hour: n,
    hourLabel: l,
    rowsWritten: s,
    writeQueries: i,
    intensity: c,
    className: s > 0 ? "d1-heat-cell is-active" : "d1-heat-cell is-empty",
    style: `--d1-heat-alpha:${d}`,
    title: `${o} ${l} · 写入 ${Se(s)} 行 · SQL 写 ${Se(i)} 次`
  };
}
function sn(o = {}) {
  const e = Ke(o.utcOffsetMinutes), r = Math.max(0, Number(o.nowMs) || k()), t = St(new Date(r), e).startTs - 8640 * 60 * 1e3, a = Array.from({ length: 7 }, (n, s) => {
    const i = xt(t + s * 24 * 60 * 60 * 1e3, e);
    return {
      key: i.dateKey,
      dateKey: i.dateKey,
      label: so(i.dateKey),
      cells: Array.from({ length: 24 }, (c, l) => Oc(i.dateKey, l))
    };
  });
  return {
    title: "D1 写入热点图",
    status: String(o.status || "idle").trim().toLowerCase() || "idle",
    source: String(o.source || "").trim(),
    summary: String(o.summary || "D1 写入热点尚未加载").trim() || "D1 写入热点尚未加载",
    detail: String(o.detail || "").trim(),
    periodLabel: String(o.periodLabel || `最近 7 天 · ${Ro(e)}`).trim(),
    hourLabels: xc(),
    rows: a,
    available: !1,
    totalRowsWritten: 0,
    totalWriteQueries: 0,
    peakLabel: "",
    legendMaxLabel: "0"
  };
}
function jm(o = {}) {
  const e = o && typeof o == "object" ? { ...o } : {}, r = sn({ status: "idle" });
  return {
    ...r,
    ...e,
    title: String(e.title || r.title).trim() || r.title,
    status: String(e.status || r.status).trim().toLowerCase() || r.status,
    source: String(e.source || r.source).trim(),
    summary: String(e.summary || r.summary).trim() || r.summary,
    detail: String(e.detail || r.detail).trim(),
    periodLabel: String(e.periodLabel || r.periodLabel).trim() || r.periodLabel,
    hourLabels: Array.isArray(e.hourLabels) && e.hourLabels.length ? e.hourLabels.map((t) => String(t || "").trim()).filter(Boolean) : r.hourLabels,
    rows: Array.isArray(e.rows) ? e.rows : r.rows,
    available: e.available === !0,
    totalRowsWritten: Math.max(0, Number(e.totalRowsWritten) || 0),
    totalWriteQueries: Math.max(0, Number(e.totalWriteQueries) || 0),
    peakLabel: String(e.peakLabel || "").trim(),
    legendMaxLabel: String(e.legendMaxLabel || "0").trim() || "0"
  };
}
function Wo(o = {}) {
  const e = o && typeof o == "object" ? { ...o } : {}, r = String(e.requestSource || "").trim().toLowerCase();
  return e.requestSourceText = zm(e.requestSourceText, r), e.cfAnalyticsStatus = Wm(e.cfAnalyticsStatus), e.cfAnalyticsDetail = Gm(e.cfAnalyticsDetail, r), e.d1WriteHotspot = jm(e.d1WriteHotspot), e;
}
function Go(o = "") {
  const e = String(o || "").trim().toLowerCase();
  return e === "cache" || e === "stale" || e === "live" ? e : "live";
}
function vc(o, e = "dashboard_snapshot_failed") {
  const r = Kt(o, e);
  return r.length <= 220 ? r : `${r.slice(0, 217)}...`;
}
function Vo(o = {}) {
  const e = Go(o.cacheStatus || o.status), r = Math.max(0, Number(o.cachedAt) || 0);
  return {
    cacheStatus: e,
    cachedAt: r,
    expiresAt: Math.max(r, Number(o.expiresAt) || r),
    updatedAt: Math.max(r, Number(o.updatedAt) || r),
    generatedAt: String(o.generatedAt || "").trim(),
    warning: String(o.warning || "").trim(),
    partial: o.partial === !0 || e === "stale"
  };
}
function io(o = {}) {
  const e = o && typeof o == "object" ? { ...o } : {}, r = Wo(!U(e.stats) && (Array.isArray(e.hourlySeries) || Object.prototype.hasOwnProperty.call(e, "todayRequests") || Object.prototype.hasOwnProperty.call(e, "todayTraffic")) ? e : U(e.stats) ? e.stats : {}), t = U(e.runtimeStatus) ? { ...e.runtimeStatus } : {}, a = U(e.cacheMeta) ? e.cacheMeta : {}, n = Vo({
    cacheStatus: a.cacheStatus || r.cacheStatus || "live",
    cachedAt: a.cachedAt,
    expiresAt: a.expiresAt,
    updatedAt: a.updatedAt,
    generatedAt: a.generatedAt || r.generatedAt || "",
    warning: a.warning,
    partial: a.partial === !0
  });
  return r.cacheStatus = Go(r.cacheStatus || n.cacheStatus), {
    stats: r,
    runtimeStatus: t,
    cacheMeta: n
  };
}
function oa(o = {}, e = "live", r = {}) {
  const t = io(o), a = Go(e || t.cacheMeta.cacheStatus);
  return {
    stats: Wo({
      ...t.stats,
      cacheStatus: a
    }),
    runtimeStatus: U(t.runtimeStatus) ? { ...t.runtimeStatus } : {},
    cacheMeta: Vo({
      ...t.cacheMeta,
      ...r,
      cacheStatus: a,
      generatedAt: String(r.generatedAt || t.cacheMeta.generatedAt || t.stats.generatedAt || "").trim()
    })
  };
}
function co(o) {
  if (!(!o || typeof o != "object")) {
    try {
      o.cancelScheduledDelay?.();
    } catch {
    }
    o.cancelScheduledDelay = null, o.pendingSnapshot = null, o.scheduledFlushAt = 0, o.scheduledPromise = null, o.waitUntilCtx = null;
  }
}
function Zt(o) {
  const e = oe.PlaybackProgressRelay;
  if (!(e instanceof Map)) return !1;
  const r = e.get(o);
  return r && co(r), e.delete(o);
}
function Us(o, e) {
  const r = oe.PlaybackProgressRelay;
  if (!(r instanceof Map)) return !1;
  const t = Math.max(1, Number(v.Defaults.VideoProgressForwardSessionMax) || 1);
  if (!r.has(o) && r.size >= t) {
    let a = "";
    for (const [n, s] of r) if (!s?.activeFlushPromise) {
      a = n;
      break;
    }
    if (!a) return !1;
    Zt(a);
  }
  return r.has(o) && r.delete(o), r.set(o, e), !0;
}
function hr(o, e = "/") {
  const r = tt(o) ? new URL(o.targetUrl.toString()) : o instanceof URL ? new URL(o.toString()) : new URL(String(o || "")), t = tt(o) ? o.normalizedBasePath : Ot(r.pathname), a = ee(e);
  return r.pathname = (a === "/" ? t ? `${t}/` : "/" : `${t}${a}`) || "/", r.search = "", r.hash = "", r;
}
var qm = /* @__PURE__ */ new Set(["emby", "mediabrowser"]);
function Hs(o = "/") {
  return ee(o).split("/").filter(Boolean);
}
function Xm(o = "/", e = "") {
  const r = ee(o), t = String(e || "").trim();
  if (!t || t === "/") return null;
  const a = r.toLowerCase(), n = t.toLowerCase();
  return a !== n && !a.startsWith(`${n}/`) ? null : ee(r.slice(t.length) || "/");
}
function Ym(o = "/", e = "") {
  const r = Hs(e), t = Hs(o);
  if (!r.length || !t.length) return null;
  const a = String(r[r.length - 1] || "").toLowerCase(), n = String(t[0] || "").toLowerCase();
  return !a || a !== n || !qm.has(a) ? null : ee(`/${t.slice(1).join("/")}` || "/");
}
function Fc(o, e = "/") {
  const r = tt(o) ? o : bn(o);
  if (!r) return null;
  const t = ee(e), a = r.normalizedBasePath;
  let n = t;
  if (a) {
    const s = Xm(t, a);
    if (s !== null) n = s;
    else {
      const i = Ym(t, a);
      i !== null && (n = i);
    }
  }
  return hr(r, n);
}
function Jm(o, e = "/", r = "") {
  if (!tt(o)) {
    const s = hr(o, e);
    return s.search = hs(r), s.toString();
  }
  const t = ee(e), a = hs(r), n = o.absoluteBasePrefix || o.originText;
  return `${(t === "/" ? `${n}/` : `${n}${t}`) || `${o.originText}/`}${a}`;
}
function xa(o, e) {
  try {
    const r = o instanceof URL ? new URL(o.toString()) : new URL(String(o || "")), t = e instanceof URL ? new URL(e.toString()) : new URL(String(e || ""));
    if (r.origin !== t.origin) return {
      resolvedUrl: r,
      proxyPath: null
    };
    const a = Ot(t.pathname);
    let n = r.pathname || "/";
    if (a) if (n === a || n === `${a}/`) n = "/";
    else if (n.startsWith(`${a}/`)) n = n.slice(a.length);
    else return {
      resolvedUrl: r,
      proxyPath: null
    };
    return {
      resolvedUrl: r,
      proxyPath: ee(n)
    };
  } catch {
    return {
      resolvedUrl: null,
      proxyPath: null
    };
  }
}
function ks(o, e, r, t, a = {}) {
  try {
    const { resolvedUrl: n, proxyPath: s } = xa(o, e);
    return n ? s ? `${Et(r, t, a)}${s === "/" ? "/" : s}${n.search}${n.hash}` : n.toString() : null;
  } catch {
    return null;
  }
}
function Uc(o = "") {
  const e = ee(o), r = e.toLowerCase();
  let t = -1;
  for (const a of [
    "/items/",
    "/videos/",
    "/audio/",
    "/livetv/"
  ]) {
    const n = r.indexOf(a);
    n > 0 && (t === -1 || n < t) && (t = n);
  }
  return t <= 0 ? "" : Ot(e.slice(0, t));
}
function jo(o = "", e = "") {
  const r = ee(o), t = Ot(e);
  if (!t) return r;
  const a = r.toLowerCase(), n = t.toLowerCase();
  return a === n ? "/" : a.startsWith(`${n}/`) ? ee(r.slice(t.length) || "/") : r;
}
function lo(o = "", e = "") {
  const r = Ot(e);
  if (!r) return ee(o);
  let t = ee(o);
  for (; ; ) {
    if (t === r || t === `${r}/`) return "/";
    if (!t.startsWith(`${r}/`)) return t;
    t = ee(t.slice(r.length) || "/");
  }
}
function Qm(o = "", e = null, r = "") {
  let t = ee(o);
  return t = lo(t, r), t = lo(t, e instanceof URL ? e.pathname : "/"), t;
}
function Zm(o = "", e = "", r = null, t = null, a = "") {
  const n = String(o || "").trim();
  if (!n) return null;
  let s = null;
  if (t) try {
    s = t instanceof URL ? new URL(t.toString()) : new URL(String(t || ""));
  } catch {
    s = null;
  }
  let i;
  try {
    if (ef(n)) {
      i = new URL(n, s || "https://playback-info.local/");
      const d = String(i.protocol || "").toLowerCase(), u = String(s?.origin || "").trim().toLowerCase();
      if (!["http:", "https:"].includes(d) || !u || i.origin.toLowerCase() !== u) return null;
    } else i = new URL(n, "https://playback-info.local/");
  } catch {
    return null;
  }
  const c = Qm(i.pathname || "/", r, a), l = jo(c, Uc(c));
  return ba(l) ? {
    proxyPath: ee(l),
    search: i.search || "",
    hash: i.hash || ""
  } : null;
}
function ep(o = "", e = "", r = null) {
  let t = ee(o);
  const a = Uc(e);
  if (a) {
    const d = lo(t, a);
    d !== t && ba(d) && (t = d);
  }
  const n = Ot(r instanceof URL ? r.pathname : "/");
  if (!a || !n) return t;
  const s = `${a}${n}`, i = t.toLowerCase(), c = s.toLowerCase();
  if (i !== c && !i.startsWith(`${c}/`)) return t;
  const l = ee(`${a}${t.slice(s.length) || "/"}`);
  return ba(l) ? l : t;
}
function tp(o = "") {
  return Gt(o) === "rewrite" ? "relative" : "";
}
function Hc(o) {
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
  ].forEach((e) => o.delete(e));
}
function rp(o = "/", e = null) {
  const r = ee(e instanceof URL ? e.pathname : o), t = new URLSearchParams(e instanceof URL ? e.search : String(e || ""));
  for (; t.has(Qn); ) t.delete(Qn);
  const a = t.toString();
  return `${r}${a ? `?${a}` : ""}`;
}
function Et(o, e, r = {}) {
  const t = Eu(r?.linkVariant), a = t ? "/" + encodeURIComponent(t) : "";
  if (Qe(r?.entryMode)) return a;
  const n = encodeURIComponent(String(o || "")), s = e ? "/" + encodeURIComponent(String(e)) : "";
  return "/" + n + s + a;
}
function kc(o, e, r, t = "/", a = {}) {
  const n = o instanceof URL ? new URL(o.toString()) : new URL(String(o || "")), s = ee(t), i = new URL(n.origin);
  return i.pathname = `${Et(e, r, {
    linkVariant: a.linkVariant,
    entryMode: a.entryMode
  })}${s === "/" ? "/" : s}`, i.search = String(a.search || ""), i.hash = String(a.hash || ""), i;
}
function ap(o, e, r, t, a = {}) {
  const n = t instanceof URL ? new URL(t.toString()) : new URL(String(t || "")), s = new URL(o instanceof URL ? o.origin : String(o || ""));
  return s.pathname = `${Et(e, r, {
    linkVariant: a.linkVariant,
    entryMode: a.entryMode
  })}/${Bi}${n.pathname || "/"}`, s.search = n.search || "", s.searchParams.append($i, Sa(n.toString())), s.hash = "", s;
}
function np(o = "", e = "", r = "", t = {}) {
  let a = ee(o);
  const n = String(e || "").trim();
  if (!n && !Qe(t?.entryMode)) return a;
  const s = [...new Set([
    "proxy_a",
    "proxy_b",
    "main"
  ].map((c) => Et(n, r, {
    linkVariant: c,
    entryMode: t.entryMode
  })).filter((c) => c && c !== "/"))].sort((c, l) => l.length - c.length);
  if (!s.length) return a;
  let i = !0;
  for (; i; ) {
    i = !1;
    for (const c of s) {
      const l = jo(a, c);
      if (l !== a) {
        a = l, i = !0;
        break;
      }
    }
  }
  return a;
}
function op(o = null) {
  const e = String(o?.routeContextDiagnostics?.routeKind || "").trim();
  return e !== "host_prefix_path_compat" && e !== "legacy_host_prefix_path_compat" ? "" : Et(o?.nodeName, o?.nodeKey, {
    linkVariant: o?.linkVariant,
    entryMode: "kv_route"
  });
}
function sp(o = "", e = "") {
  const r = ee(o), t = Ot(e);
  if (!t || t === "/") return r;
  const a = r.toLowerCase(), n = t.toLowerCase();
  return a === n || a.startsWith(`${n}/`) ? r : `${t}${r === "/" ? "/" : r}`;
}
function ip(o = "", e = null) {
  const r = ee(o), t = `/${Bi}`;
  if (!r.startsWith(t)) return null;
  const a = e instanceof URL && [...e.searchParams.getAll("__pb_target")].pop() || "";
  if (!a) return { error: "missing_target" };
  let n;
  try {
    n = new URL(Xr(a));
  } catch {
    return { error: "invalid_target" };
  }
  return ["http:", "https:"].includes(String(n.protocol || "").toLowerCase()) ? {
    targetUrl: n,
    visibleProxyPath: ee(r.slice(t.length) || "/")
  } : { error: "unsupported_target" };
}
function Ks(o = "", e = null, r = "") {
  const t = ee(o), a = t.search(/https?:\/\//i);
  if (a <= 0) return null;
  let n;
  try {
    n = e instanceof URL ? new URL(e.toString()) : new URL(String(e || ""));
  } catch {
    return null;
  }
  let s;
  try {
    s = new URL(t.slice(a));
  } catch {
    return null;
  }
  if (String(s.origin || "").toLowerCase() !== String(n.origin || "").toLowerCase()) return null;
  const i = Ot(r), c = ee(s.pathname || "/"), l = i ? jo(c, i) : c;
  if (i && l === c && c.toLowerCase() !== i.toLowerCase()) return null;
  const d = ee(t.slice(0, a) || "/"), u = [l];
  if (d !== "/") {
    const f = d.toLowerCase(), m = l.toLowerCase();
    m !== f && !m.startsWith(`${f}/`) && u.unshift(ee(`${d}${l === "/" ? "/" : l}`));
  }
  for (const f of u)
    if (ba(ee(la(f).remaining || f)))
      return {
        kind: "embedded_absolute",
        originalPath: t,
        normalizedPath: ee(f),
        embeddedUrl: s.toString()
      };
  return null;
}
function cn(o) {
  const e = /* @__PURE__ */ new Map();
  if (!o || typeof o != "string") return e;
  for (const r of o.split(";")) {
    const t = r.trim();
    if (!t) continue;
    const a = t.indexOf("="), n = (a === -1 ? t : t.slice(0, a)).trim(), s = a === -1 ? "" : t.slice(a + 1).trim();
    n && e.set(n, s);
  }
  return e;
}
function Kc(o) {
  const e = [];
  for (const [r, t] of o.entries()) e.push(t === "" ? r : `${r}=${t}`);
  return e.join("; ");
}
function qo(o, e = []) {
  const r = new Set((Array.isArray(e) ? e : [e]).map((a) => String(a || "").trim().toLowerCase()).filter(Boolean)), t = cn(o);
  if (r.size > 0)
    for (const a of [...t.keys()]) r.has(String(a).trim().toLowerCase()) && t.delete(a);
  return Kc(t) || null;
}
function cp(o, e, r = ["auth_token"]) {
  const t = new Set(r.map((s) => String(s || "").trim().toLowerCase()).filter(Boolean)), a = cn(o);
  for (const s of [...a.keys()]) t.has(String(s).trim().toLowerCase()) && a.delete(s);
  const n = cn(e);
  for (const [s, i] of n.entries())
    t.has(String(s).trim().toLowerCase()) || a.set(s, i);
  return Kc(a) || null;
}
function Bs(o = "") {
  const e = ee(o).split("/").filter(Boolean);
  if (e.length === 0) return !1;
  const r = Mt(e[0]).toLowerCase();
  return kd.has(r);
}
async function lp(o = "", e = "", r = null, t = {}) {
  const a = String(o || "").trim().toLowerCase(), n = te(e), s = String(r?.JWT_SECRET || "").trim();
  if (!a || !n || !s) return "";
  const i = Math.max(0, Math.floor(Number(t.nowMs ?? k()) / 1e3)), c = Math.max(1, Math.trunc(Number(t.maxAgeSec) || 86400)), l = Sa(JSON.stringify({
    v: 1,
    node: a,
    host: n,
    iat: i,
    exp: i + c
  }));
  if (!l) return "";
  const d = await ht(s, l);
  return d ? `${l}.${d}` : "";
}
async function dp(o = "", e = null, r = {}) {
  const t = String(o || "").trim(), a = String(e?.JWT_SECRET || "").trim();
  if (!t) return {
    ok: !1,
    reason: "missing_cookie"
  };
  if (!a) return {
    ok: !1,
    reason: "missing_secret"
  };
  const n = t.indexOf(".");
  if (n <= 0 || n === t.length - 1) return {
    ok: !1,
    reason: "malformed_cookie"
  };
  const s = t.slice(0, n), i = t.slice(n + 1), c = await ht(a, s);
  if (!c || i !== c) return {
    ok: !1,
    reason: "bad_signature"
  };
  let l = null;
  try {
    l = JSON.parse(Xr(s));
  } catch {
    return {
      ok: !1,
      reason: "malformed_payload"
    };
  }
  const d = {
    v: Number(l?.v) || 0,
    node: String(l?.node || "").trim().toLowerCase(),
    host: te(l?.host || ""),
    iat: Math.max(0, Math.floor(Number(l?.iat) || 0)),
    exp: Math.max(0, Math.floor(Number(l?.exp) || 0))
  };
  if (d.v !== 1 || !d.node || !d.host || !d.iat || !d.exp || d.exp <= d.iat) return {
    ok: !1,
    reason: "invalid_payload",
    payload: d
  };
  const u = te(r.requestHost || "");
  if (u && d.host !== u) return {
    ok: !1,
    reason: "host_mismatch",
    payload: d
  };
  const f = Math.max(0, Math.floor(Number(r.nowMs ?? k()) / 1e3));
  return d.exp <= f ? {
    ok: !1,
    reason: "expired",
    payload: d
  } : {
    ok: !0,
    payload: d
  };
}
function up(o = "") {
  const e = String(o || "").trim();
  return e ? `${Mo}=${e}; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=${Hd}` : Bc();
}
function Bc() {
  return `${Mo}=; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=0; Expires=Thu, 01 Jan 1970 00:00:00 GMT`;
}
function wn(o = "GET", e = null) {
  const r = e ? new Headers(e) : new Headers();
  return r.set("Content-Type", "text/plain; charset=utf-8"), r.set("Cache-Control", "no-store, max-age=0"), Ce(r), r.get("Access-Control-Allow-Origin") !== "*" && Kr(r, "Origin"), new Response(o === "HEAD" ? null : "Not Found", {
    status: 404,
    headers: r
  });
}
function Oa(o = "") {
  return String(o || "").trim().toLowerCase().replace(/[^a-z0-9]+/g, "");
}
var $c = /* @__PURE__ */ new Set([
  "authorization",
  "x-emby-authorization",
  "x-mediabrowser-authorization"
]), fp = /* @__PURE__ */ new Set(["x-emby-token", "x-mediabrowser-token"]), mp = /* @__PURE__ */ new Set(["x-emby-device-id", "x-mediabrowser-device-id"]), zc = /* @__PURE__ */ new Set([
  ...$c,
  ...fp,
  ...mp
]);
function Ln(o) {
  if (o instanceof Headers) return [...o.entries()];
  if (o && typeof o == "object" && typeof o.entries == "function") try {
    return [...o.entries()].filter((e) => Array.isArray(e) && e.length >= 2).map((e) => [String(e[0] || ""), String(e[1] ?? "")]);
  } catch {
  }
  if (o && typeof o == "object" && typeof o[Symbol.iterator] == "function") try {
    return [...o].filter((e) => Array.isArray(e) && e.length >= 2).map((e) => [String(e[0] || ""), String(e[1] ?? "")]);
  } catch {
  }
  return Array.isArray(o) ? o.filter((e) => Array.isArray(e) && e.length >= 2).map((e) => [String(e[0] || ""), String(e[1] ?? "")]) : o && typeof o == "object" ? Object.entries(o).map(([e, r]) => [String(e || ""), String(r ?? "")]) : [];
}
function Wc(o = "") {
  const e = String(o || "").trim().toLowerCase();
  return !e || zc.has(e) || e === "cookie" ? !1 : e.includes("authorization") || e.includes("api-key") || e.includes("apikey") || e.includes("access-key") || e.includes("accesskey") || e.includes("access-token") || e.includes("accesstoken") || e.includes("session") || e.includes("credential") || e.includes("signature") || e.includes("secret") || e.includes("auth") || e.includes("token");
}
var Gc = /* @__PURE__ */ new Set([
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
]), Vc = "identity-http-v2", pp = Object.freeze([
  "Range",
  "If-None-Match",
  "If-Modified-Since"
]), gp = [
  /^\/Videos\/[^/]+\/(?:main|master|stream)\.m3u8$/i,
  /^\/Videos\/[^/]+\/(?:manifest|main|master|stream)\.mpd$/i,
  /^\/Audio\/[^/]+\/(?:main|master|stream)\.m3u8$/i
], hp = /* @__PURE__ */ new Set([
  "mediasourceid",
  "static",
  "tag",
  "audiostreamindex",
  "subtitlestreamindex",
  "subtitlemethod",
  "starttimeticks"
]);
function jc(o = "") {
  return Gc.has(Oa(o));
}
function yp(o) {
  const e = o instanceof URL ? new URL(o.toString()) : new URL(String(o || ""));
  e.hash = "";
  const r = [];
  for (const [t, a] of e.searchParams.entries())
    jc(t) || r.push([t, a]);
  r.sort((t, a) => {
    const n = t[0].localeCompare(a[0]);
    return n !== 0 ? n : String(t[1]).localeCompare(String(a[1]));
  }), e.search = "";
  for (const [t, a] of r) e.searchParams.append(t, a);
  return e;
}
function qc(o) {
  const e = o instanceof Request ? new URL(o.url) : new URL(String(o || "")), r = [];
  for (const [s, i] of e.searchParams.entries()) {
    const c = Oa(s);
    Gc.has(c) && r.push([c, String(i)]);
  }
  r.sort((s, i) => {
    const c = s[0].localeCompare(i[0]);
    return c !== 0 ? c : s[1].localeCompare(i[1]);
  });
  const t = o instanceof Request ? o.headers : new Headers(), a = [];
  for (const [s, i] of t.entries()) {
    const c = String(s || "").trim().toLowerCase();
    !c || !zc.has(c) && !Wc(c) || a.push([c, String(i)]);
  }
  const n = qo(t.get("Cookie") || "", ["auth_token", ...hn]);
  return n && a.push(["cookie", n]), a.sort((s, i) => {
    const c = s[0].localeCompare(i[0]);
    return c !== 0 ? c : s[1].localeCompare(i[1]);
  }), {
    queryEntries: r,
    headerEntries: a
  };
}
function Sp(o) {
  const e = qc(o);
  return e.queryEntries.length > 0 || e.headerEntries.length > 0;
}
async function Xc(o) {
  const e = qc(o), r = await zn().digest("SHA-256", new TextEncoder().encode(Q(e)));
  return [...new Uint8Array(r)].map((t) => t.toString(16).padStart(2, "0")).join("");
}
async function _p(o, e) {
  return await Xc(new Request(e instanceof URL ? e.toString() : String(e || ""), { headers: o.headers }));
}
function Yc(o = "", e = {}) {
  const r = bt.test(String(o || ""));
  return ce(`${Vc}:${r ? "manifest" : "asset"}:${r ? Math.max(0, Number(e.prewarmCacheTtl) || 0) : Math.max(0, Number(e.imageCacheMaxAge) || 0)}`);
}
function bp(o, e) {
  if (!(o instanceof Request) || !(e instanceof Request) || e.headers.has("If-Range")) return null;
  const r = new Headers();
  for (const t of pp) {
    const a = e.headers.get(t);
    a && r.set(t, a);
  }
  return new Request(o.url, {
    method: "GET",
    headers: r
  });
}
function Ep(o = "") {
  const e = String(o || ""), r = /\/(?:Videos|Audio)\/.+$/i.exec(e);
  return r ? r[0] : e;
}
function Rp(o) {
  try {
    return new Request(yp(o).toString(), { method: "GET" });
  } catch {
    return null;
  }
}
function Tp(o = {}) {
  const e = Array.isArray(o?.lines) ? o.lines.slice() : [];
  if (e.length > 1) {
    const r = String(o?.activeLineId || "").trim();
    if (r) {
      const t = e.findIndex((a) => String(a?.id || "").trim() === r);
      if (t > 0) {
        const [a] = e.splice(t, 1);
        e.unshift(a);
      }
    }
  }
  return e.length > 0 ? e.map((r) => String(r?.target || "").trim()).filter(Boolean) : String(o?.target || "").split(",").map((r) => r.trim()).filter(Boolean);
}
function uo(o = "", e = {}) {
  const r = String(o || "").trim().toLowerCase(), t = nr(e?.entryMode), a = Ln(e?.headers).map(([n, s]) => [String(n || "").trim().toLowerCase(), String(s ?? "").trim()]).filter(([n]) => !!n).sort((n, s) => {
    const i = n[0].localeCompare(s[0]);
    return i !== 0 ? i : n[1].localeCompare(s[1]);
  });
  return ce(Q({
    nodeName: r,
    entryMode: t,
    secret: t === "host_prefix" ? "" : String(e?.secret || "").trim(),
    tags: zr(e?.tags, e?.tag),
    remark: String(e?.remark || "").trim(),
    activeLineId: String(e?.activeLineId || "").trim(),
    orderedTargets: Tp(e),
    headers: a,
    playbackInfoMode: String(e?.playbackInfoMode || "").trim().toLowerCase(),
    mediaAuthMode: String(e?.mediaAuthMode || "").trim().toLowerCase(),
    realClientIpMode: String(e?.realClientIpMode || "").trim().toLowerCase(),
    routingDecisionMode: String(e?.routingDecisionMode || "").trim().toLowerCase(),
    mainVideoStreamMode: String(e?.mainVideoStreamMode || e?.wangpanDirectMode || e?.wangpanMode || "").trim().toLowerCase()
  }));
}
function Jc(o = []) {
  const e = /* @__PURE__ */ new Set();
  for (const r of Array.isArray(o) ? o : [o]) {
    const t = String(r || "").trim().toLowerCase();
    t && e.add(t);
  }
  return e;
}
function Qc(o = []) {
  const e = Jc(o);
  if (!e.size) return;
  const r = oe.PlaybackInfoResponseCache;
  if (r instanceof Map) for (const [t, a] of r.entries()) {
    const n = String(a?.nodeName || "").trim().toLowerCase();
    e.has(n) && r.delete(t);
  }
}
function Zc(o = []) {
  const e = Jc(o);
  if (!e.size) return;
  const r = oe.PlaybackProgressRelay;
  if (!(!(r instanceof Map) || r.size <= 0))
    for (const [t, a] of r.entries()) {
      const n = String(a?.nodeName || a?.pendingSnapshot?.nodeName || "").trim().toLowerCase();
      !n || !e.has(n) || Zt(t);
    }
}
function el(o, e, r, t = "/", a = {}) {
  try {
    const n = String(a.identityPartition || "").trim(), s = String(a.cachePolicyRevision || "").trim();
    if (!n || !s) return null;
    const i = o instanceof URL ? new URL(o.toString()) : new URL(String(o || "")), c = ee(t), l = new URL(i.origin);
    l.pathname = `${Et(e, r, {
      linkVariant: "main",
      entryMode: a.entryMode
    })}${c === "/" ? "/" : c}`, l.search = String(a.search || "");
    const d = String(a.nodeCacheRevision || "").trim();
    return d && l.searchParams.set("__proxyrev", d), l.searchParams.set("__metadatarev", Vc), l.searchParams.set("__identity", n), l.searchParams.set("__policy", s), l.hash = "", Rp(l);
  } catch {
    return null;
  }
}
function Ap(o) {
  try {
    const e = o instanceof URL ? new URL(o.toString()) : new URL(String(o || ""));
    for (const [r, t] of e.searchParams.entries()) {
      const a = String(r || "").toLowerCase(), n = String(t || "").toLowerCase();
      if (a.includes("transcod") || n.includes("transcod")) return !0;
    }
    return !1;
  } catch {
    return !0;
  }
}
function Cp(o) {
  try {
    const e = o instanceof URL ? new URL(o.toString()) : new URL(String(o || "")), r = Ep(e.pathname || "");
    if (!bt.test(r) || Ap(e) || !gp.some((t) => t.test(r))) return !1;
    for (const [t] of e.searchParams.entries())
      if (!jc(t) && !hp.has(Oa(t)))
        return !1;
    return !0;
  } catch {
    return !1;
  }
}
function fo(o) {
  try {
    const e = o instanceof URL ? new URL(o.toString()) : new URL(String(o || "")), r = e.pathname || "";
    return qr.test(r) || jr.test(r) || pr.test(r) ? !0 : bt.test(r) ? Cp(e) : !1;
  } catch {
    return !1;
  }
}
function wp(o = "") {
  const e = String(o || "").toLowerCase();
  return e ? /\.(?:mp4|m4v|mkv|mov|avi|wmv|flv|ts|m4s)(?:$|[?#])/.test(e) ? !0 : bt.test(e) || pr.test(e) ? !1 : /\/videos\/[^/]+\/(?:stream|original|download|file)\b/.test(e) || /\/items\/[^/]+\/download\b/.test(e) : !1;
}
function mo(o, e = /* @__PURE__ */ new Set(), r = 0) {
  if (o == null || r > 5) return e;
  if (typeof o == "string") {
    const t = o.trim();
    if (t && /^(?:https?:\/\/|\/)/i.test(t)) {
      const a = t.toLowerCase(), n = a.split(/[?#]/, 1)[0] || a;
      (bt.test(n) || pr.test(n) || qr.test(a) || jr.test(n)) && e.add(t);
    }
    return e;
  }
  return Array.isArray(o) ? (o.slice(0, 24).forEach((t) => mo(t, e, r + 1)), e) : (typeof o == "object" && Object.values(o).slice(0, 32).forEach((t) => mo(t, e, r + 1)), e);
}
function Lp(o = "") {
  const e = /^\/Items\/([^/]+)(?:\/|$)/i.exec(String(o || ""));
  return e ? Mt(e[1]) : "";
}
function $s(o = "") {
  const e = String(o || "").toLowerCase();
  return qr.test(e) || jr.test(e) ? 0 : bt.test(e) ? 1 : pr.test(e) ? 2 : 3;
}
function Dp(o = {}, e = {}) {
  const { D1TidyExecutor: r, D1TidyPlanner: t, Logger: a, buildAdminReleaseVendorManifest: n, normalizeAdminReleaseVendorManifestRecord: s, validateAdminShellHtmlSource: i } = o;
  return {
    async createKvTidyPlanToken(c, l = {}, d = {}) {
      const u = String(c?.JWT_SECRET || "").trim();
      if (!u) {
        const g = /* @__PURE__ */ new Error("JWT_SECRET is required to sign the KV tidy plan");
        throw g.code = "SERVER_MISCONFIGURED", g.status = 503, g;
      }
      const f = Math.max(0, Math.floor(Number(d.nowMs ?? k()) / 1e3)), m = f + Math.max(60, Math.floor(Number(d.ttlMs) || 6e5) / 1e3), p = Sa(JSON.stringify({
        version: 1,
        scope: "kv",
        planHash: String(l?.planHash || e.buildKvTidyPlanHash(l)).trim(),
        issuedAt: f,
        expiresAt: m
      }));
      return `${p}.${await ht(u, p)}`;
    },
    async verifyKvTidyPlanToken(c, l = "", d = {}) {
      const u = String(c?.JWT_SECRET || "").trim(), f = String(l || "").trim();
      if (!u) {
        const y = /* @__PURE__ */ new Error("JWT_SECRET is required to verify the KV tidy plan");
        throw y.code = "SERVER_MISCONFIGURED", y.status = 503, y;
      }
      const m = f.indexOf(".");
      if (m <= 0 || m === f.length - 1) {
        const y = /* @__PURE__ */ new Error("KV tidy plan token is invalid");
        throw y.code = "TIDY_PLAN_INVALID", y.status = 409, y;
      }
      const p = f.slice(0, m);
      if (f.slice(m + 1) !== await ht(u, p)) {
        const y = /* @__PURE__ */ new Error("KV tidy plan token signature is invalid");
        throw y.code = "TIDY_PLAN_INVALID", y.status = 409, y;
      }
      let g = null;
      try {
        g = JSON.parse(Xr(p));
      } catch {
        g = null;
      }
      const h = Math.max(0, Math.floor(Number(d.nowMs ?? k()) / 1e3));
      if (!U(g) || g.version !== 1 || g.scope !== "kv" || !String(g.planHash || "").trim()) {
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
      const l = U(c?.schemaStatus) ? c.schemaStatus : {};
      return ce(Q({
        scope: "d1",
        mode: String(c?.mode || "manual"),
        maintenanceMode: String(c?.maintenanceMode || "smart"),
        nowMs: Number(c?.nowMs) || 0,
        retentionDays: Number(c?.retentionDays) || 0,
        retentionCutoffMs: Number(c?.retentionCutoffMs) || 0,
        utcOffsetMinutes: Number(c?.utcOffsetMinutes) || 0,
        scheduledNowMs: Number(c?.scheduledNowMs) || 0,
        dayWindow: U(c?.dayWindow) ? c.dayWindow : {},
        statsBucketDate: String(c?.statsBucketDate || ""),
        statsStartTs: Number(c?.statsStartTs) || 0,
        statsEndTs: Number(c?.statsEndTs) || 0,
        statsUtcOffsetMinutes: Number(c?.statsUtcOffsetMinutes) || 0,
        schemaStatus: {
          schemaReady: l.schemaReady === !0,
          tables: U(l.tables) ? l.tables : {},
          columns: U(l.columns) ? l.columns : {},
          indexes: U(l.indexes) ? l.indexes : {},
          constraints: U(l.constraints) ? l.constraints : {},
          ftsReady: l.ftsReady === !0,
          issues: Array.isArray(l.issues) ? l.issues : []
        },
        flags: U(c?.flags) ? c.flags : {},
        summary: U(c?.summary) ? c.summary : {},
        preview: U(c?.preview) ? c.preview : {},
        d1DnsIpPoolSources: Array.isArray(c?.d1DnsIpPoolSources) ? c.d1DnsIpPoolSources : []
      }));
    },
    async createD1TidyPlanToken(c, l = {}, d = {}) {
      const u = String(c?.JWT_SECRET || "").trim();
      if (!u) {
        const g = /* @__PURE__ */ new Error("JWT_SECRET is required to sign the D1 tidy plan");
        throw g.code = "SERVER_MISCONFIGURED", g.status = 503, g;
      }
      const f = Math.max(0, Math.floor(Number(d.issuedAtMs ?? k()) / 1e3)), m = f + Math.max(60, Math.floor(Number(d.ttlMs) || 6e5) / 1e3), p = Sa(JSON.stringify({
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
      return `${p}.${await ht(u, p)}`;
    },
    async verifyD1TidyPlanToken(c, l = "", d = {}) {
      const u = String(c?.JWT_SECRET || "").trim(), f = String(l || "").trim();
      if (!u) {
        const y = /* @__PURE__ */ new Error("JWT_SECRET is required to verify the D1 tidy plan");
        throw y.code = "SERVER_MISCONFIGURED", y.status = 503, y;
      }
      const m = f.indexOf(".");
      if (m <= 0 || m === f.length - 1) {
        const y = /* @__PURE__ */ new Error("D1 tidy plan token is invalid");
        throw y.code = "TIDY_PLAN_INVALID", y.status = 409, y;
      }
      const p = f.slice(0, m);
      if (f.slice(m + 1) !== await ht(u, p)) {
        const y = /* @__PURE__ */ new Error("D1 tidy plan token signature is invalid");
        throw y.code = "TIDY_PLAN_INVALID", y.status = 409, y;
      }
      let g = null;
      try {
        g = JSON.parse(Xr(p));
      } catch {
        g = null;
      }
      const h = Math.max(0, Math.floor(Number(d.nowMs ?? k()) / 1e3));
      if (!U(g) || g.version !== 1 || g.scope !== "d1" || !String(g.planHash || "").trim() || !(Number(g.planNowMs) > 0)) {
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
    async resolveKvTidyQuotaBudget(c, l = [], d = {}) {
      const u = d.kv || e.getKV(c), f = await df(re(d.config || {})), m = Math.max(1, Math.floor(Number(f?.kv?.write) || 0)), p = (Array.isArray(l) ? l : []).map((E) => ({
        type: String(E?.type || "put").trim().toLowerCase() === "delete" ? "delete" : "put",
        key: String(E?.key || "").trim()
      })).filter((E) => E.key), g = p.filter((E) => E.type === "put").length, h = p.filter((E) => E.type === "delete").length, y = u ? await e.captureRawKvEntries(u, p.map((E) => E.key)) : [], S = y.filter((E) => E?.exists === !0).length, _ = y.filter((E) => E?.exists !== !0).length, A = g + h + S + _, b = {
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
      return b.reason = b.blocked === !0 ? uf(b) : "", b;
    },
    async buildKvTidyPlan(c, l = {}) {
      const d = l.kv || e.getKV(c);
      if (!d) throw new Error("KV not configured");
      const u = (await e.listKvKeysStrict(d)).sort(), f = u.filter((ne) => ne.startsWith(e.ADMIN_INDEX_UPLOAD_PREFIX)), { rawStoredSummaryIndexText: m, storedSummaryIndexState: p, previousFullIndexBytes: g } = await e.readStoredNodesSummaryState(d), { nodeNames: h, removableKeys: y, untouchedOtherKeyCount: S, opsStatusKeyCount: _, dnsRecordHistoryKeyCount: A, dnsIpPoolSourceKeyCount: b, configMetaKeyCount: E, snapshotMetaKeyCount: R, nodeIndexMetaKeyCount: L, telegramAlertStateKeyCount: T, loginFailureKeyCount: D, dnsFetchLockKeyCount: w } = await e.classifyKvTidyKeys(d, u), M = await e.readRepairableRuntimeConfig(d), x = U(M.rawConfig) ? M.rawConfig : {}, C = oc(x);
      let F = C.cleanedConfig;
      const W = [...C.migratedConfigKeys], O = await e.captureRawKvEntries(d, [
        e.CONFIG_KEY,
        e.NODES_INDEX_KEY,
        e.NODES_SUMMARY_INDEX_KEY
      ]), N = String(O.find((ne) => ne?.key === e.NODES_INDEX_KEY)?.value || ""), { nextTidyConfig: I, rewrittenNodes: P, fullEntityNodes: H, rewrittenNodeCount: G, deletedLegacyNodeFieldCount: $, migratedTopLevelPortNodeCount: K, migratedLinePortCount: j, migratedDefaultPortNodeCount: se, migratedDefaultPortLineCount: me, rollbackKvEntries: pe } = await e.collectKvTidyNodeMutations(d, h, F, O), le = Q(F) !== Q(I);
      le && (F = I, W.push("sourceDirectNodes"));
      const ge = await e.readStoredConfigSnapshotsStrict(d), [Oe, We] = await Promise.all([e.readRevisionMetaForRead(d, e.CONFIG_META_KEY), e.readRevisionMetaForRead(d, e.CONFIG_SNAPSHOTS_META_KEY, { count: 0 })]), vt = {
        configRevision: String(Oe?.revision || ""),
        configContentHash: ce(Q(x)),
        snapshotsRevision: String(We?.revision || ""),
        snapshotsContentHash: ce(Q(ge))
      }, { rewrittenSnapshots: st, rewrittenSnapshotCount: Ft, deletedLegacySnapshotFieldCount: Ut, migratedConfigKeys: ea } = e.rewriteKvTidySnapshots(ge);
      W.push(...ea);
      const Ht = M.hadMalformedValue || Q(x) !== Q(F), yr = e.buildKvTidyNoteParts({
        legacyKeysPresent: C.legacyKeysPresent,
        rewrittenSnapshotCount: Ft,
        rewrittenNodeCount: G,
        migratedTopLevelPortNodeCount: K,
        migratedLinePortCount: j,
        migratedDefaultPortNodeCount: se,
        migratedDefaultPortLineCount: me
      }, {
        includeRepairSource: !0,
        repairLabel: "repair_source",
        repairedConfig: M
      }), kt = eo(M.config, F), it = [];
      kt.length > 0 && it.push(e.createSyntheticConfigSnapshot(M.config, {
        reason: "tidy_kv_data",
        section: "all",
        source: "kv_tidy",
        actor: "admin",
        note: yr.join("; ") || (M.hadMalformedValue ? "repair_malformed_sys_config" : "sanitize_runtime_config")
      }, {
        changedKeys: kt.map((ne) => ne.key),
        changeCount: kt.length
      })), st.length > 0 && it.push(...st);
      const ta = it.length > 0 ? it : ge, Sr = e.collectUnreferencedAdminIndexUploadKeys(F, ta, f);
      for (const ne of Sr) y.add(ne);
      const ct = e.normalizeNodeSummaryIndex(H).nodes, lt = e.normalizeNodeIndex(ct.map((ne) => ne?.name)), qt = JSON.stringify(lt), Tt = JSON.stringify(ct), At = new TextEncoder().encode(Tt).length, _r = g - At, Xt = e.buildLegacyConfigCacheKeys(M.config, F), Ie = [...y].sort(), ra = [.../* @__PURE__ */ new Set([...Xt, ...Ie])].filter(Boolean).sort(), Ge = [];
      it.length > 0 && Ge.push({
        type: "put",
        key: e.CONFIG_SNAPSHOTS_KEY,
        value: JSON.stringify(it)
      }), Ht && Ge.push({
        type: "put",
        key: e.CONFIG_KEY,
        value: JSON.stringify(F)
      });
      for (const ne of P) Ge.push({
        type: "put",
        key: `${e.PREFIX}${ne.name}`,
        value: JSON.stringify(ne.data)
      });
      N !== qt && Ge.push({
        type: "put",
        key: e.NODES_INDEX_KEY,
        value: qt
      }), m !== Tt && Ge.push({
        type: "put",
        key: e.NODES_SUMMARY_INDEX_KEY,
        value: Tt
      });
      for (const ne of ra) Ge.push({
        type: "delete",
        key: ne,
        value: ""
      });
      const B = await e.resolveKvTidyQuotaBudget(c, Ge, {
        kv: d,
        config: F
      }), V = {
        scannedKeyCount: u.length,
        preservedNodeKeyCount: h.length,
        rebuiltNodeCount: lt.length,
        rewrittenNodeCount: G,
        configWasMalformed: M.hadMalformedValue,
        configReadSource: M.source,
        configRewritten: Ht,
        migratedConfigKeys: wt(W),
        rewrittenSnapshotCount: Ft,
        deletedLegacyFieldCount: C.deletedLegacyFieldCount + Ut + $,
        deletedLegacyConfigFieldCount: C.deletedLegacyFieldCount,
        deletedLegacyNodeFieldCount: $,
        deletedLegacySnapshotFieldCount: Ut,
        migratedTopLevelPortNodeCount: K,
        migratedLinePortCount: j,
        migratedDefaultPortNodeCount: se,
        migratedDefaultPortLineCount: me,
        deletedKeyCount: Ie.length,
        deletedCacheKeyCount: Ie.filter((ne) => ne === "sys:cf_dash_cache" || ne.startsWith("sys:cf_dash_cache:")).length,
        deletedScheduledLockKeyCount: Ie.filter((ne) => ne === e.LEGACY_SCHEDULED_LOCK_KEY).length,
        deletedLoginFailureKeyCount: D,
        deletedDnsIpPoolSourceKeyCount: b,
        deletedOpsStatusKeyCount: _,
        deletedTelegramAlertStateKeyCount: T,
        deletedDnsFetchLockKeyCount: w,
        deletedAdminIndexUploadCount: Sr.length,
        untouchedOtherKeyCount: S,
        rawSnapshotCount: ge.length,
        previousFullIndexBytes: g,
        nextSummaryIndexBytes: At,
        savedBytes: _r
      }, q = Xu({
        configFieldTargets: V.migratedConfigKeys,
        rewrittenSnapshotCount: Ft,
        sourceDirectNodesFromLegacyNodes: le,
        migratedTopLevelPortNodeCount: K,
        migratedLinePortCount: j,
        migratedDefaultPortNodeCount: se,
        migratedDefaultPortLineCount: me
      }), X = [], Y = Ie.filter((ne) => ne === "sys:cf_dash_cache" || ne.startsWith("sys:cf_dash_cache:")), ae = Ie.filter((ne) => ne.startsWith("fail:")), he = Ie.filter((ne) => ne === e.LEGACY_DNS_IP_POOL_SOURCES_KEY), ve = Ie.filter((ne) => ne === e.LEGACY_OPS_STATUS_KEY || Object.values(e.LEGACY_OPS_STATUS_SECTION_KEYS).includes(ne)), $e = Ie.filter((ne) => ne === e.LEGACY_TELEGRAM_ALERT_STATE_KEY), Me = Ie.filter((ne) => ne === e.LEGACY_SCHEDULED_LOCK_KEY), Ve = Ie.filter((ne) => ne.startsWith(gm)), Ct = Ie.filter((ne) => ne.startsWith(e.ADMIN_INDEX_UPLOAD_PREFIX));
      st.map((ne) => ne?.id);
      const dt = P.map((ne) => ne.name);
      Ee(X, Y.length > 0, "cf_dash_cache", "Cloudflare 仪表盘缓存", Y, Y.length, "会删除遗留的 sys:cf_dash_cache 及其按日期 / Zone 生成的缓存键。"), Ee(X, ae.length > 0, "login_failures", "旧版登录失败计数", ae, ae.length, "会删除旧版 fail:* 登录失败计数键，后续仅保留 D1 auth_failures。"), Ee(X, he.length > 0, "dns_ip_pool_sources", "旧版 DNS IP 池源配置", he, he.length, "会删除旧版 sys:dns_ip_pool_sources:v1，后续只保留 D1 dns_ip_pool_sources。"), Ee(X, ve.length > 0, "ops_status", "旧版运维状态键", ve, ve.length, "会删除 sys:ops_status:v1 与 sys:ops_status:*，后续只保留 D1 sys_status。"), Ee(X, $e.length > 0, "telegram_alert_state", "旧版 Telegram 告警冷却状态", $e, $e.length, "会删除 sys:telegram_alert_state:v1，后续只保留 D1 sys_status scope。"), Ee(X, Me.length > 0, "scheduled_lock", "旧版定时租约键", Me, Me.length, "会删除 sys:scheduled_lock:v1，后续只保留 D1 sys_locks。"), Ee(X, Ve.length > 0, "dns_fetch_lock", "旧版 DNS 抓取锁键", Ve, Ve.length, "会删除 sys:dns_ip_pool_fetch_lock:v1:*，后续只保留 D1 sys_locks。"), Ee(X, Ct.length > 0, "admin_index_uploads", "未引用的本地 HTML 版本", Ct, Ct.length, "只删除当前配置和保留快照都不再引用的内容寻址 index.html。");
      const br = [];
      if (Ht && Ee(br, !0, "runtime_config", "全局设置 sys:theme", [...C.legacyKeysPresent, ...kt.map((ne) => ne.key)], 1, "会把旧版设置字段吸收到当前 schema，并以后端 sanitizeRuntimeConfig() 结果回写。"), G > 0) {
        const ne = [];
        K > 0 && ne.push(`旧版顶层 node.port 节点 ${K} 个`), j > 0 && ne.push(`旧版 lines[].port 线路 ${j} 条`), se > 0 && ne.push(`隐式默认端口节点 ${se} 个`), me > 0 && ne.push(`按协议补齐默认端口线路 ${me} 条`), Ee(br, !0, "node_entities", "节点实体 node:* 标准化重写", dt, G, ne.length ? `会把端口并入 lines[].target，并移除旧版节点字段。${ne.join("，")}。` : "会移除旧版节点字段，并统一回写当前节点 schema。");
      }
      Ee(br, !0, "node_indexes", "节点索引 / 节点摘要索引", [e.NODES_INDEX_KEY, e.NODES_SUMMARY_INDEX_KEY], 2, `会按当前 node:* 实体重新生成轻量 name 索引与节点摘要索引，并把旧镜像压缩收敛为摘要格式（${g} -> ${At} bytes，节省 ${_r} bytes）。`);
      const aa = [mt("node_entities_preserved", "node:* 节点实体", h, {
        count: h.length,
        note: "不会整批删除 node:*，只会按需重写必要节点。"
      })];
      A > 0 && Ee(aa, !0, "dns_record_history", "DNS 历史记录", u.filter((ne) => ne.startsWith(e.DNS_RECORD_HISTORY_PREFIX)), A, "不会删除 sys:dns_record_history:v1:*。");
      const va = E + R + L;
      va > 0 && Ee(aa, !0, "meta_keys", "配置 / 快照 / 索引元信息", [
        e.CONFIG_META_KEY,
        e.CONFIG_SNAPSHOTS_META_KEY,
        e.NODES_INDEX_META_KEY
      ], va, "不会删除这些 revision / meta 键。");
      const ut = [];
      M.hadMalformedValue && ut.push(`检测到异常 sys:theme（来源: ${M.source}），整理时会按当前 schema 修复。`), K > 0 && ut.push(`检测到 ${K} 个旧节点仍使用顶层 node.port；整理后会把端口并入 lines[].target。`), j > 0 && ut.push(`检测到 ${j} 条旧线路仍使用独立 lines[].port；整理后会把端口并入 lines[].target。`), (se > 0 || me > 0) && ut.push(`检测到 ${se} 个节点 / ${me} 条线路仍未显式写端口；整理后会按协议补齐为 :443 / :80。`), p?.legacyMirrorDetected === !0 && ut.push(`检测到旧版 sys:nodes_index_full:v2 仍保存完整节点镜像；本次会按 node:* 重建并收敛为摘要索引（${g} -> ${At} bytes）。`), S > 0 && ut.push(`发现 ${S} 个未列入整理白名单的 KV 键，本次不会自动删除。`), X.length === 0 && !Ht && Ft === 0 && G === 0 && ut.push("当前没有检测到需要执行的 KV 清理动作；本次更多是一轮一致性巡检。"), ut.push(ff(B)), B.blocked === !0 && B.reason && ut.push(B.reason);
      const Dn = {
        scope: "kv",
        scannedKeys: u,
        config: F,
        nodesIndex: lt,
        rebuiltNodeSummaries: ct,
        revisions: vt,
        summary: V,
        quotaBudget: B,
        mutationPlan: Ge,
        preview: {
          scope: "kv",
          quotaBudget: B,
          fieldGroups: q,
          deleteGroups: X,
          rewriteGroups: br,
          preserveGroups: aa,
          warnings: ut
        }
      };
      return Dn.planHash = e.buildKvTidyPlanHash(Dn), Dn;
    },
    async applyKvTidyPlan(c, l = {}) {
      const d = l.kv || e.getKV(l.env);
      if (!d) throw new Error("KV not configured");
      const u = _e(d), f = Array.isArray(c?.mutationPlan) ? c.mutationPlan : [];
      try {
        await e.applyKvMutationsWithRollback(d, f);
      } catch (m) {
        throw Qa(l.env), u.NodesListCache = null, u.NodesIndexCache = null, cr(d), xs(u), u.NodeCache.clear(), u.PlaybackRouteHotCache.clear(), m;
      }
      return Qa(l.env), xs(u), u.NodeCache.clear(), u.PlaybackRouteHotCache.clear(), Array.isArray(c?.nodesIndex) && c.nodesIndex.length > 0 && (Qc(c.nodesIndex), Zc(c.nodesIndex)), e.primeNodeSummaryCaches(Array.isArray(c?.rebuiltNodeSummaries) ? c.rebuiltNodeSummaries : [], d), u.NodesIndexCache = {
        data: Array.isArray(c?.nodesIndex) ? c.nodesIndex : [],
        exp: k() + 6e4
      }, e.buildTidyResult(c, { ...c?.summary || {} }, "kv", {
        config: c?.config || {},
        nodesIndex: Array.isArray(c?.nodesIndex) ? c.nodesIndex : []
      });
    },
    async tidyKvData(c, l = {}) {
      return await Rl(l.kv || e.getKV(c))(async () => {
        const d = await e.verifyKvTidyPlanToken(c, l.planToken), u = await e.buildKvTidyPlan(c, l);
        if (String(u.planHash || "") !== String(d.planHash || "")) {
          const f = /* @__PURE__ */ new Error("KV tidy data changed after preview");
          throw f.code = "TIDY_PLAN_STALE", f.status = 409, f.details = {
            reason: "plan_changed",
            previewPlanHash: String(d.planHash || ""),
            currentPlanHash: String(u.planHash || "")
          }, f;
        }
        if (u?.quotaBudget?.blocked === !0) {
          const f = String(u?.quotaBudget?.reason || "KV tidy write budget exceeded").trim() || "KV tidy write budget exceeded", m = new Error(f);
          throw m.code = "KV_TIDY_WRITE_LIMIT_EXCEEDED", m.status = 409, m.details = { quotaBudget: u.quotaBudget }, m;
        }
        return await e.applyKvTidyPlan(u, {
          ...l,
          env: c
        });
      });
    }
  };
}
function Np(o = {}, e = {}) {
  const { D1TidyExecutor: r, D1TidyPlanner: t, Logger: a, buildAdminReleaseVendorManifest: n, normalizeAdminReleaseVendorManifestRecord: s, validateAdminShellHtmlSource: i } = o;
  return {
    async readD1Count(c, l, d = []) {
      if (!c || !l) return 0;
      try {
        let u = c.prepare(l);
        Array.isArray(d) && d.length && (u = u.bind(...d));
        const f = await u.first();
        return Math.max(0, Math.floor(Number(f?.total ?? f?.count ?? f?.c ?? f?.value) || 0));
      } catch {
        return 0;
      }
    },
    getPreviousD1TidyState(c = {}, l = null) {
      const d = U(c) ? c : {}, u = U(d.d1Tidy) ? d.d1Tidy : {};
      return qe(U(l) ? l : U(d.cleanup) ? d.cleanup : {}, u);
    },
    buildD1TidyStatusPayload(c = {}, l = {}) {
      const d = String(l.mode || c.mode || "manual").trim().toLowerCase() === "scheduled" ? "scheduled" : "manual", u = at(l.maintenanceMode || c.maintenanceMode, d), f = String(l.triggeredBy || (d === "scheduled" ? "scheduled" : "manual")).trim() || (d === "scheduled" ? "scheduled" : "manual"), m = String(l.timestamp || c.finishedAt || (/* @__PURE__ */ new Date()).toISOString()).trim() || (/* @__PURE__ */ new Date()).toISOString(), p = String(l.status || c.status || "success").trim() || "success", g = String(l.lastError || c.lastError || "").trim(), h = p === "failed" || p === "partial_failure", y = p === "skipped" || p === "deferred", S = {
        status: p,
        lastSuccessAt: !h && !y ? m : "",
        lastSkippedAt: y ? m : "",
        lastErrorAt: h ? m : "",
        lastError: h ? g : "",
        lastTriggeredBy: f,
        mode: d,
        maintenanceMode: u
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
    buildTidyResult(c = {}, l = {}, d = "kv", u = {}) {
      const f = U(c?.preview) ? c.preview : e.createEmptyTidyPreview(d);
      return {
        ...u,
        summary: l,
        preview: f,
        quotaBudget: U(c?.quotaBudget) ? c.quotaBudget : U(f?.quotaBudget) ? f.quotaBudget : null,
        fieldGroups: Array.isArray(f?.fieldGroups) ? f.fieldGroups : [],
        deleteGroups: Array.isArray(f?.deleteGroups) ? f.deleteGroups : [],
        rewriteGroups: Array.isArray(f?.rewriteGroups) ? f.rewriteGroups : [],
        preserveGroups: Array.isArray(f?.preserveGroups) ? f.preserveGroups : [],
        warnings: Array.isArray(f?.warnings) ? f.warnings : []
      };
    },
    async buildD1TidyPlan(c, l = {}) {
      const d = l.db || e.getDB(c), u = l.kv || e.getKV(c) || null;
      if (!d) throw new Error("D1 not configured");
      const f = await e.getD1SchemaStatus(d);
      if (f.schemaReady !== !0) {
        const R = e.createEmptyTidyPreview("d1");
        return R.warnings.push("D1 结构尚未通过运行时兼容检查；本预览不授权删除，必须先完成统一“初始化 DB”并重新预览。"), {
          scope: "d1",
          mode: "manual",
          maintenanceMode: at(l.maintenanceMode, "manual"),
          schemaStatus: f,
          flags: {},
          summary: {
            status: "blocked",
            schemaReady: !1,
            requiresSchemaInitialization: !0,
            issues: f.issues
          },
          preview: R,
          planHash: ""
        };
      }
      const m = re(l.config || (c ? await Ae(c) : {})), p = t.buildContext(m, l), g = t.attachPreviousState(e, p, l.previousCleanupStatus);
      g.logQueuePendingCount = tr.get(d).LogQueue.length;
      const h = await t.readFacts(e, d, u, g), y = t.buildSourcePolicy(h.d1DnsIpPoolSources), S = t.buildFlags(e, g, h, y), _ = t.buildSummary(g, h, y, S), A = f.schemaReady === !0;
      _.schemaReady = A, _.requiresSchemaInitialization = !A;
      const b = t.buildPreview(g, h, y, S);
      A || b.warnings.unshift("D1 结构尚未通过运行时兼容检查；本预览不授权删除，必须先完成统一“初始化 DB”并重新预览。");
      const E = {
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
        statsRetentionBoundaryDate: h.statsRetentionBoundaryDate,
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
      return E.planHash = e.buildD1TidyPlanHash(E), E;
    },
    async applyD1TidyPlan(c, l = {}) {
      const d = l.env, u = l.db || e.getDB(d), f = l.kv || e.getKV(d) || null;
      if (!u) throw new Error("D1 not configured");
      const m = await e.getD1SchemaStatus(u);
      if (m.schemaReady !== !0) {
        const C = /* @__PURE__ */ new Error("D1 schema must pass runtime compatibility checks before tidy execution");
        throw C.code = "D1_SCHEMA_INCOMPATIBLE", C.status = 409, C.details = {
          issues: m.issues,
          autoRepairPolicy: m.autoRepairPolicy
        }, C;
      }
      const p = c || await e.buildD1TidyPlan(d, {
        ...l,
        db: u,
        kv: f
      }), g = String(p?.mode || l.mode || "manual").trim().toLowerCase() === "scheduled" ? "scheduled" : "manual", h = at(p?.maintenanceMode || l.maintenanceMode, g), y = U(p?.flags) ? p.flags : {}, S = typeof l.beforeEachStep == "function" ? l.beforeEachStep : async () => {
      }, _ = {
        kv: f,
        db: u
      }, A = g === "scheduled", b = r.createSummary(p, g, y);
      b.maintenanceMode = h;
      let E = !1;
      const R = (C, F, W, O) => {
        const N = W?.message || String(W);
        if (C && (b[C] = "failed"), F && (b[F] = N), b.lastError = N, b.status = b.status === "failed" ? "failed" : "partial_failure", console.error(`${O}: `, W), !A) throw W;
        return !1;
      };
      await S("bootstrapD1Schema"), await e.bootstrapD1Schema(u, "logs-core");
      const L = tr.get(u);
      L.LogFlushTask && await Promise.resolve(L.LogFlushTask).catch(() => {
      }), d && L.LogQueue.length > 0 && (await S("flushLogQueue"), await a.flush(d).catch(() => {
      }));
      const T = k(), D = r.buildDeleteScopes(e, p, y, u), w = await r.runBudgetedDeleteScopes(D, b, S, { startedAt: T });
      if (b.hasMore = w.hasMore, b.remainingScopes = w.remainingScopes, b.budget = w.budget, E = w.budget.processedRows > 0, y.rebuildStatsHourly === !0 && k() - T < Or) try {
        await S("resetStatsHourly"), await e.clearStatsHourly(u), b.alignedStatsWindow = !0, b.statsAlignStatus = "success", b.statsRebuildStatus = "reset_for_new_logs", E = !0;
      } catch (C) {
        R("statsRebuildStatus", "statsRebuildError", C, "D1 stats reset Error");
      }
      else
        b.statsAlignStatus = y.rebuildStatsHourly === !0 ? "deferred_budget" : "skipped", b.statsRebuildStatus = y.rebuildStatsHourly === !0 ? "deferred_budget" : "skipped";
      const M = () => k() - T < Or;
      if (y.rebuildLogsFtsDeferred === !0) b.ftsRebuildStatus = y.ftsRebuildDeferredReason || "deferred_size_guard";
      else if (y.rebuildLogsFts === !0 && (b.hasMore || !M())) b.ftsRebuildStatus = "deferred_budget";
      else if (y.rebuildLogsFts === !0) try {
        await S("rebuildLogsFts");
        let C = !1;
        await e.hasLogsFtsTable(u) ? C = await e.rebuildLogsFts(u) : C = (await e.ensureLogsFtsSchema(u)).rebuilt === !0, b.rebuiltLogsFts = C === !0, b.ftsRebuildStatus = C === !0 ? "success" : "skipped", b.lastFtsRebuildAt = (/* @__PURE__ */ new Date()).toISOString(), E = E || C === !0;
      } catch (C) {
        R("ftsRebuildStatus", "ftsRebuildError", C, "D1 logs FTS rebuild Error");
      }
      if (y.optimizeDb === !0 && !b.hasMore && M()) try {
        await S("optimizeLogsDb"), await e.optimizeLogsDb(u), b.optimizedDb = !0, b.optimizeStatus = "success", b.lastOptimizeAt = (/* @__PURE__ */ new Date()).toISOString(), E = !0;
      } catch (C) {
        R("optimizeStatus", "optimizeError", C, g === "scheduled" ? "Scheduled DB optimize Error" : "D1 optimize Error");
      }
      else y.optimizeDb === !0 && (b.optimizeStatus = "deferred_budget");
      b.budget.durationMs = Math.max(0, k() - T), b.budget.durationMs >= Or && !b.budget.exhaustedBy && (b.budget.exhaustedBy = "time_limit"), await S("patchLogStatus");
      const x = await r.patchLogStatus(e, u, _, p, b, y, l);
      if (b.status !== "partial_failure" && b.status !== "failed") if (b.hasMore)
        b.status = "success", b.reason = "maintenance_budget_exhausted";
      else if (g === "scheduled") {
        const C = y.rebuildLogsFtsDeferred === !0 || y.optimizeDbDeferred === !0;
        E ? b.status = "success" : (b.status = "skipped", b.reason = C ? "maintenance_deferred" : "no_expired_data");
      } else b.status = "success";
      return b.finishedAt = x, e.buildTidyResult(p, b, "d1");
    },
    async tidyD1Data(c, l = {}) {
      const d = String(l.mode || "manual").trim().toLowerCase() === "scheduled" ? "scheduled" : "manual", u = at(l.maintenanceMode, d), f = l.db || e.getDB(c);
      if (!f) throw new Error("D1 not configured");
      if (d === "manual") {
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
          mode: d,
          maintenanceMode: at(g.maintenanceMode, d),
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
            mode: d,
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
        mode: d,
        maintenanceMode: u
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
      const d = Number(l.nowMs) || k(), u = Math.max(0, Number(l.minIntervalMs) || v.Defaults.LogVacuumMinIntervalMs);
      if (l.force === !0) return !0;
      const f = typeof c == "string" ? new Date(c).getTime() : NaN;
      return Number.isFinite(f) ? d - f >= u : !0;
    },
    shouldRunLogsFtsRebuild(c, l = {}) {
      return e.shouldRunLogsOptimize(c, {
        ...l,
        minIntervalMs: Math.max(0, Number(l.minIntervalMs) || v.Defaults.LogFtsRebuildMinIntervalMs)
      });
    },
    async optimizeLogsDb(c) {
      return c ? (await c.prepare("PRAGMA optimize").run(), !0) : !1;
    }
  };
}
function Ip(o = {}, e = {}) {
  const { D1TidyExecutor: r, D1TidyPlanner: t, Logger: a, buildAdminReleaseVendorManifest: n, normalizeAdminReleaseVendorManifestRecord: s, validateAdminShellHtmlSource: i } = o;
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
      const l = await Le(c, e.CONFIG_SNAPSHOTS_KEY, { type: "json" });
      if (l == null) return [];
      if (Array.isArray(l)) return l;
      const d = /* @__PURE__ */ new Error("Stored config snapshots are invalid");
      throw d.code = "CONFIG_SNAPSHOTS_INVALID", d.status = 409, d;
    },
    async writeStoredConfigSnapshots(c, l = [], d = {}) {
      if (!c) return [];
      const u = Array.isArray(l) ? l.slice(0, v.Defaults.ConfigSnapshotLimit) : [];
      return await c.put(e.CONFIG_SNAPSHOTS_KEY, JSON.stringify(u)), await e.ensureConfigSnapshotsMeta(c, u, d), u;
    },
    createSyntheticConfigSnapshot(c, l = {}, d = {}) {
      const u = e.normalizeConfigSnapshotMeta(l), f = wt(d.changedKeys || []), m = U(d.extraFields) ? d.extraFields : {};
      return _a({
        id: `cfg-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
        createdAt: (/* @__PURE__ */ new Date()).toISOString(),
        reason: u.reason,
        section: u.section,
        actor: u.actor,
        source: u.source,
        note: u.note,
        changedKeys: f,
        changeCount: Number(d.changeCount) || f.length,
        config: Jr(c),
        ...m
      });
    },
    async getConfigSnapshots(c, l = {}) {
      if (!c) return [];
      const d = await e.readStoredConfigSnapshots(c);
      return e.normalizeConfigSnapshotsForResponse(d, l);
    },
    normalizeConfigSnapshotsForResponse(c = [], l = {}) {
      const d = l.withConfig === !0;
      return (Array.isArray(c) ? c : []).filter((u) => u && typeof u == "object" && Array.isArray(u.changedKeys) && u.createdAt).map((u) => d ? _a(u) : {
        id: u.id,
        createdAt: u.createdAt,
        reason: u.reason,
        section: u.section,
        actor: u.actor,
        source: u.source,
        note: u.note || "",
        changedKeys: [...u.changedKeys],
        changeCount: Number(u.changeCount) || u.changedKeys.length || 0
      });
    },
    async getConfigSnapshotsForRead(c, l = {}) {
      if (!c) return [];
      const d = await e.readStoredConfigSnapshotsStrict(c);
      return e.normalizeConfigSnapshotsForResponse(d, l);
    },
    async getConfigSnapshotById(c, l) {
      return (await e.getConfigSnapshotsForRead(c, { withConfig: !0 })).find((d) => d.id === l) || null;
    },
    buildAdminIndexUploadKey(c = "") {
      const l = Dt(c);
      return l ? `${e.ADMIN_INDEX_UPLOAD_PREFIX}${l}` : "";
    },
    normalizeAdminIndexUploadRecord(c = {}, l = "") {
      if (!U(c)) return null;
      const d = Dt(c.revision), u = Dt(l);
      if (!d || u && d !== u) return null;
      const f = Vr(d), m = Do(d), p = String(c.html || "");
      return p ? {
        version: Number(c.version) || 1,
        revision: d,
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
      const d = e.normalizeAdminIndexUploadRecord(c, l);
      if (!d || await $n(d.html) !== d.revision) return null;
      try {
        const u = i(d.html, d.sourceUrl, {
          sourceLabel: "local admin index",
          contentType: "text/html"
        });
        return {
          ...d,
          bytes: u.bytes,
          manifest: s(n(u.html, {
            releaseTag: d.assetRevision,
            sourceUrl: d.sourceUrl
          }))
        };
      } catch {
        return null;
      }
    },
    async getAdminActiveIndexRecord(c) {
      return c ? e.validateAdminIndexUploadRecord(await Le(c, e.ADMIN_ACTIVE_INDEX_KEY, { type: "json" })) : null;
    },
    async getAdminIndexUploadRecord(c, l = "") {
      const d = e.buildAdminIndexUploadKey(l);
      if (!c || !d) return null;
      const u = await e.validateAdminIndexUploadRecord(await Le(c, d, { type: "json" }), l);
      return u || e.validateAdminIndexUploadRecord(await Le(c, e.ADMIN_ACTIVE_INDEX_KEY, { type: "json" }), l);
    },
    collectReferencedAdminIndexUploadRevisions(c = {}, l = []) {
      const d = /* @__PURE__ */ new Set(), u = (f) => {
        const m = Xe(f?.indexUrl || "");
        m && d.add(m);
      };
      u(c);
      for (const f of Array.isArray(l) ? l : []) u(f?.config);
      return d;
    },
    collectUnreferencedAdminIndexUploadKeys(c = {}, l = [], d = []) {
      const u = e.collectReferencedAdminIndexUploadRevisions(c, l);
      return (Array.isArray(d) ? d : []).filter((f) => {
        const m = String(f || "").trim();
        if (!m.startsWith(e.ADMIN_INDEX_UPLOAD_PREFIX)) return !1;
        const p = Dt(m.slice(e.ADMIN_INDEX_UPLOAD_PREFIX.length));
        return p && !u.has(p);
      });
    },
    async persistAdminIndexUpload(c = {}, l = {}) {
      const { env: d, kv: u, ctx: f } = l;
      if (!u) {
        const p = /* @__PURE__ */ new Error("KV namespace is required to persist the local admin index");
        throw p.code = "KV_NOT_CONFIGURED", p.status = 503, p;
      }
      const m = e.normalizeAdminIndexUploadRecord(c, c?.revision);
      if (!m) {
        const p = /* @__PURE__ */ new Error("本地 index.html 上传记录无效");
        throw p.code = "ADMIN_INDEX_UPLOAD_INVALID", p.status = 400, p;
      }
      return await Qt(u)(async () => {
        const p = e.buildAdminIndexUploadKey(m.revision), g = await Le(u, p, { type: "json" }), h = await Le(u, e.ADMIN_ACTIVE_INDEX_KEY, { type: "json" });
        let y = e.normalizeAdminIndexUploadRecord(g, m.revision);
        y && await $n(y.html) !== m.revision && (y = null);
        const S = y || m;
        y || await u.put(p, JSON.stringify(m)), await u.put(e.ADMIN_ACTIVE_INDEX_KEY, JSON.stringify(S));
        try {
          const _ = d ? await ue(d) : re(await Le(u, e.CONFIG_KEY, { type: "json" }) || {});
          return {
            config: await e.commitRuntimeConfig({
              ..._,
              indexUrl: S.sourceUrl
            }, {
              env: d,
              kv: u,
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
          throw await ye(h ? u.put(e.ADMIN_ACTIVE_INDEX_KEY, JSON.stringify(h)) : u.delete(e.ADMIN_ACTIVE_INDEX_KEY), "admin.active_index_upload_rollback", { revision: m.revision }, null), y || await ye(g ? u.put(p, JSON.stringify(g)) : u.delete(p), "admin.local_index_upload_rollback", { revision: m.revision }, null), _;
        }
      });
    },
    async rollbackAdminIndexUploadActivation(c = {}, l = {}, d = {}) {
      const { env: u, kv: f, ctx: m } = d;
      if (!f) {
        const p = /* @__PURE__ */ new Error("KV namespace is required to roll back the local admin index");
        throw p.code = "KV_NOT_CONFIGURED", p.status = 503, p;
      }
      return await Qt(f)(async () => {
        const p = u ? await ue(u) : re(await Le(f, e.CONFIG_KEY, { type: "json" }) || {}), g = Xe(l?.indexUrl || ""), h = Xe(p?.indexUrl || "");
        if (!g || h !== g) return {
          config: p,
          skipped: !0,
          reason: h ? "superseded_by_newer_admin_index" : "admin_index_already_restored"
        };
        const y = Xe(c?.indexUrl || ""), S = await Le(f, e.ADMIN_ACTIVE_INDEX_KEY, { type: "json" }), _ = y ? await e.getAdminIndexUploadRecord(f, y) : null;
        _ ? await f.put(e.ADMIN_ACTIVE_INDEX_KEY, JSON.stringify(_)) : await f.delete(e.ADMIN_ACTIVE_INDEX_KEY);
        try {
          return {
            config: await e.commitRuntimeConfig({
              ...p,
              indexUrl: y ? Vr(y) : ""
            }, {
              env: u,
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
          throw await ye(S ? f.put(e.ADMIN_ACTIVE_INDEX_KEY, JSON.stringify(S)) : f.delete(e.ADMIN_ACTIVE_INDEX_KEY), "admin.active_index_rollback_restore", { revision: g }, null), A;
        }
      });
    },
    async clearConfigSnapshots(c) {
      c && await e.writeStoredConfigSnapshots(c, []);
    },
    async captureRuntimeConfigRollbackState(c, l) {
      if (!l) return {
        config: re(c ? await Ae(c) : {}),
        kvEntries: []
      };
      const d = c ? await ue(c) : re(await Le(l, e.CONFIG_KEY, { type: "json" }) || {}), u = [
        e.CONFIG_KEY,
        e.CONFIG_META_KEY,
        e.CONFIG_SNAPSHOTS_KEY,
        e.CONFIG_SNAPSHOTS_META_KEY,
        ...e.buildLegacyConfigCacheKeys(d)
      ];
      return {
        config: d,
        kvEntries: await e.captureRawKvEntries(l, u)
      };
    },
    async restoreCapturedRuntimeConfigState(c = {}, l = {}) {
      const d = l.kv, u = re(c?.config || {});
      if (!d) return u;
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
        await e.applyKvMutationsWithRollback(d, m);
      }
      return Qa(l.env), l.env ? await Ae(l.env) : u;
    },
    async restoreCapturedRuntimeConfigAndDnsState(c = {}, l = {}) {
      const d = re(c?.config || {});
      let u = null, f = null, m = d;
      try {
        await e.commitRuntimeConfig(d, {
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
        u = p;
      }
      try {
        m = await e.restoreCapturedRuntimeConfigState(c, l);
      } catch (p) {
        f = p;
      }
      if (u || f) {
        const p = new Error([u ? `dns:${ie(u, "restore_failed")}` : "", f ? `kv:${ie(f, "restore_failed")}` : ""].filter(Boolean).join("; "));
        throw p.code = "CONFIG_DNS_RESTORE_FAILED", p.status = 500, p.details = {
          dnsRestoreError: u ? ie(u, "restore_failed") : "",
          kvRestoreError: f ? ie(f, "restore_failed") : ""
        }, p;
      }
      return m;
    }
  };
}
function Mp(o = {}, e = {}) {
  const { D1TidyExecutor: r, D1TidyPlanner: t, Logger: a, buildAdminReleaseVendorManifest: n, normalizeAdminReleaseVendorManifestRecord: s, validateAdminShellHtmlSource: i } = o;
  return {
    async recordConfigSnapshot(c, l, d, u = {}) {
      if (!c) return null;
      const f = eo(l, d);
      if (!f.length) return null;
      const m = e.normalizeConfigSnapshotMeta(u), p = await e.getConfigSnapshots(c, { withConfig: !0 }), g = {
        id: `cfg-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
        createdAt: (/* @__PURE__ */ new Date()).toISOString(),
        reason: m.reason,
        section: m.section,
        actor: m.actor,
        source: m.source,
        note: m.note,
        changedKeys: f.map((y) => y.key),
        changeCount: f.length,
        config: Jr(l)
      }, h = [g, ...p].slice(0, v.Defaults.ConfigSnapshotLimit);
      return await e.writeStoredConfigSnapshots(c, h), g;
    },
    async persistRuntimeConfig(c, l = {}) {
      return await Qt(l.kv || Pa(l.env))(() => e.commitRuntimeConfig(c, l));
    },
    async prepareRuntimeConfigPersistence(c, l = {}) {
      const { env: d, kv: u, ctx: f, snapshotMeta: m } = l;
      if (!u) {
        const S = /* @__PURE__ */ new Error("KV namespace is required to persist runtime config");
        throw S.code = "KV_NOT_CONFIGURED", S.status = 503, S;
      }
      ld(c?.defaultHostPrefixCnameTarget);
      const p = d ? await ue(d) : re(await Le(u, e.CONFIG_KEY, { type: "json" }) || {}), g = re(c);
      hd(c), yd(g, d);
      const h = ze(d), y = Ya(null, p, h) !== Ya(null, g, h) ? (await e.loadAllNodeEntitiesFromKvStrict(u, { ctx: f })).filter((S) => Qe(S?.entryMode) && !Vt(S?.hostPrefixCnameTarget)) : [];
      return y.length > 0 && ua(g, d), {
        prevConfig: p,
        nextConfig: g,
        configuredHost: h,
        dnsPlans: y.map((S) => e.buildHostPrefixDnsSyncPlan(S.name, S, S.name, S, h, {
          previousConfig: p,
          nextConfig: g
        })).filter((S) => S.changed === !0),
        snapshotMeta: m,
        ctx: f,
        kv: u,
        env: d
      };
    },
    async buildRuntimeConfigMutationPlan(c, l, d, u = {}) {
      const f = eo(l, d), m = (await e.readStoredConfigSnapshotsStrict(c)).map((A) => _a(A)), p = f.length > 0 ? [e.createSyntheticConfigSnapshot(l, u, {
        changedKeys: f.map((A) => A.key),
        changeCount: f.length
      }), ...m].slice(0, v.Defaults.ConfigSnapshotLimit) : m.slice(0, v.Defaults.ConfigSnapshotLimit), g = e.normalizeRevisionMeta(Ir(d)), h = e.normalizeRevisionMeta({
        ...Ir(p),
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
          value: JSON.stringify(d)
        },
        {
          type: "put",
          key: e.CONFIG_META_KEY,
          value: JSON.stringify(g)
        }
      ];
      for (const A of e.buildLegacyConfigCacheKeys(l, d)) y.push({
        type: "delete",
        key: A,
        value: ""
      });
      const S = e.collectReferencedAdminIndexUploadRevisions(l, m), _ = e.collectReferencedAdminIndexUploadRevisions(d, p);
      for (const A of S)
        _.has(A) || y.push({
          type: "delete",
          key: e.buildAdminIndexUploadKey(A),
          value: ""
        });
      return y;
    },
    async commitRuntimeConfig(c, l = {}) {
      const { prevConfig: d, nextConfig: u, configuredHost: f, dnsPlans: m, snapshotMeta: p, ctx: g, kv: h, env: y } = await e.prepareRuntimeConfigPersistence(c, l);
      if (Gu(l.expectedConfigRevision, d), Q(d) === Q(u))
        return await e.ensureConfigMeta(h, u, { ctx: g }), u;
      const S = [];
      let _ = null, A = !1;
      try {
        for (const E of m)
          _ = E, await e.persistHostPrefixDnsSyncPlan(E, {
            env: y,
            kv: h,
            ctx: g,
            config: u,
            requestHost: f
          }), S.push(E), _ = null;
        A = !0;
        const b = await e.buildRuntimeConfigMutationPlan(h, d, u, p);
        return await e.applyKvMutationsWithRollback(h, b), y ? qd(y, u) : Qa(), await e.invalidateDashboardSnapshotCacheForConfigChange(y, {
          prevConfig: d,
          nextConfig: u
        }), u;
      } catch (b) {
        const E = [], R = _ ? [...S, _] : S;
        for (let L = R.length - 1; L >= 0; L -= 1) try {
          await e.persistHostPrefixDnsSyncPlan({ steps: R[L].rollbackSteps }, {
            env: y,
            kv: h,
            ctx: g,
            config: u,
            requestHost: f,
            skipHistory: !0
          });
        } catch (T) {
          E.push(ie(T, "dns_rollback_failed"));
        }
        if (b && typeof b == "object") {
          const L = Array.isArray(b?.details?.rollbackConflicts) ? b.details.rollbackConflicts : [], T = Array.isArray(b?.details?.rollbackFailures) ? b.details.rollbackFailures : [];
          b.details = {
            ...U(b.details) ? b.details : {},
            hostPrefixDnsSyncAttempted: m.length > 0,
            hostPrefixDnsSyncedCount: S.length,
            failedHostPrefixDnsHost: String(_?.nextDnsHost || _?.previousDnsHost || ""),
            rollbackAttempted: R.length > 0 || A,
            rollbackSucceeded: E.length === 0 && L.length === 0 && T.length === 0,
            rollbackError: [...E, ...T].join("; "),
            rollbackConflicts: L
          };
        }
        throw b;
      }
    },
    async commitSourceDirectNodesConfigWithinMutation(c, l, d, u = {}) {
      if (!l) return null;
      const f = c ? await ue(c) : re(await l.get(e.CONFIG_KEY, { type: "json" }) || {}), m = yt(f.sourceDirectNodes || []), p = ao(m, {
        renameMap: u.renameMap,
        removedNames: u.removedNames,
        allowedNames: u.allowedNames
      });
      return Q(m) === Q(p) ? f : e.commitRuntimeConfig({
        ...f,
        sourceDirectNodes: p
      }, {
        env: c,
        kv: l,
        ctx: d,
        snapshotMeta: {
          reason: "sync_node_shortcut_selections",
          section: "proxy",
          source: String(u.source || "node_mutation"),
          actor: "admin",
          note: String(u.note || "").trim()
        }
      });
    },
    async commitSingleNodeMainVideoStreamShortcutShadowWithinMutation(c, l, d, u = {}) {
      if (!l) return null;
      const f = c ? await ue(c) : re(await l.get(e.CONFIG_KEY, { type: "json" }) || {}), m = String(u.originalName || "").trim().toLowerCase(), p = String(u.nodeName || "").trim().toLowerCase(), g = mn(u.mode);
      let h = yt(f.sourceDirectNodes || []);
      return m && m !== p && (h = ao(h, { renameMap: { [m]: p } })), h = h.filter((y) => String(y || "").trim().toLowerCase() !== p), p && g === "direct" && h.push(p), h = yt(h), Q(f.sourceDirectNodes || []) === Q(h) ? f : e.commitRuntimeConfig({
        ...f,
        sourceDirectNodes: h
      }, {
        env: c,
        kv: l,
        ctx: d,
        snapshotMeta: {
          reason: "sync_main_video_stream_shortcuts",
          section: "proxy",
          source: String(u.source || "node_save"),
          actor: "admin",
          note: String(u.note || p || "").trim()
        }
      });
    }
  };
}
function Pp(o = {}, e = {}) {
  const { D1TidyExecutor: r, D1TidyPlanner: t, Logger: a, buildAdminReleaseVendorManifest: n, normalizeAdminReleaseVendorManifestRecord: s, validateAdminShellHtmlSource: i } = o;
  return {
    async sendTelegramMessage({ tgBotToken: c, tgChatId: l, text: d }) {
      const u = String(c || "").trim(), f = String(l || "").trim();
      if (!u || !f) throw new Error("请先完善 Telegram Bot Token 和 Chat ID 配置");
      const m = await xe(await Be(`https://api.telegram.org/bot${u}/sendMessage`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          chat_id: f,
          text: String(d || "")
        })
      }), fn);
      if (m.exceeded) throw new Error("Telegram API response too large");
      const p = JSON.parse(m.text);
      if (!p.ok) throw new Error(p.description || "Telegram API 返回错误");
      return p;
    },
    async buildDailyTelegramSummaryPayload(c, l = {}) {
      const d = re(l?.config || await ue(c)), u = l?.now instanceof Date ? new Date(l.now.getTime()) : new Date(l?.now || /* @__PURE__ */ new Date()), f = l?.dayWindow && typeof l.dayWindow == "object" ? l.dayWindow : St(u, d.scheduleUtcOffsetMinutes), [m, p] = await Promise.all([e.buildDashboardStatsPayload(c, {
        config: d,
        dayWindow: f,
        nowMs: u.getTime(),
        skipD1WriteHotspot: !0
      }), e.getDashboardMonthlyTrafficPayload(c, {
        config: d,
        ctx: l?.ctx || null,
        nowMs: u.getTime()
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
      const d = e.getDB(c), u = e.getKV(c);
      if (!d || !u) throw new Error("Database or KV not configured");
      const f = await u.get(e.CONFIG_KEY, { type: "json" }) || {}, m = re(f), p = String(m.tgBotToken || "").trim(), g = String(m.tgChatId || "").trim();
      if (!p || !g) throw new Error("请先完善 Telegram Bot Token 和 Chat ID 配置");
      const h = l?.now instanceof Date ? new Date(l.now.getTime()) : new Date(l?.now || /* @__PURE__ */ new Date()), y = St(h, m.scheduleUtcOffsetMinutes), S = ki(m, f, {
        reportKinds: l?.reportKinds,
        fallbackAllWhenLegacy: !0
      });
      if (!S.length) throw new Error("请先至少启用一个日报类型");
      const _ = S.includes("summary") ? await e.buildDailyTelegramSummaryPayload(c, {
        config: m,
        now: h,
        dayWindow: y
      }) : null, A = S.some((E) => E !== "summary") ? await e.getCloudflareRuntimeQuotaStatus(c, {
        config: m,
        db: d
      }) : null, b = [];
      for (const E of S) {
        const R = hf(E, E === "summary" ? _ : A?.[E], y);
        await e.sendTelegramMessage({
          tgBotToken: p,
          tgChatId: g,
          text: R
        }), b.push({
          kind: E,
          text: R
        });
      }
      return {
        success: b.length > 0,
        sentCount: b.length,
        reportKinds: S,
        messages: b
      };
    },
    async maybeSendRuntimeAlerts(c, l = null, d = {}) {
      const u = e.getDB(c);
      if (!u) return {
        sent: !1,
        reason: "db_unavailable"
      };
      if (!await e.ensureSysStatusTable(u)) return {
        sent: !1,
        reason: "db_init_failed"
      };
      const f = re(await Ae(c)), m = d && typeof d == "object" ? d : {}, p = String(f.tgBotToken || "").trim(), g = String(f.tgChatId || "").trim();
      if (!p || !g) return {
        sent: !1,
        reason: "telegram_not_configured"
      };
      const h = de(f.tgAlertDroppedBatchThreshold, v.Defaults.TgAlertDroppedBatchThreshold, 0, 5e3), y = de(f.tgAlertFlushRetryThreshold, v.Defaults.TgAlertFlushRetryThreshold, 0, 10), S = de(f.tgAlertCooldownMinutes, v.Defaults.TgAlertCooldownMinutes, 1, 1440), _ = f.tgAlertOnScheduledFailure === !0, A = f.tgAlertKvUsageEnabled === !0, b = f.tgAlertD1UsageEnabled === !0, E = de(f.tgAlertKvUsageThresholdPercent, v.Defaults.TgAlertKvUsageThresholdPercent, 1, 100), R = de(f.tgAlertD1UsageThresholdPercent, v.Defaults.TgAlertD1UsageThresholdPercent, 1, 100);
      if (h <= 0 && y <= 0 && !_ && !A && !b) return {
        sent: !1,
        reason: "thresholds_disabled"
      };
      const L = await e.getOpsStatus(c), T = L && typeof L.log == "object" ? L.log : {}, D = l && typeof l == "object" && Object.keys(l).length ? l : L && typeof L.scheduled == "object" ? L.scheduled : {}, w = [], M = Number(T.lastDroppedBatchSize) || 0;
      h > 0 && M >= h && w.push({
        code: "log_drop",
        message: `日志刷盘疑似丢弃批次：${M} 条（阈值 ${h}）`,
        eventAt: T.lastFlushErrorAt || T.lastOverflowAt || T.updatedAt || L.updatedAt || ""
      });
      const x = Number(T.lastFlushRetryCount) || 0;
      y > 0 && x >= y && w.push({
        code: "log_retry",
        message: `D1 写入重试次数偏高：${x} 次（阈值 ${y}）`,
        eventAt: T.lastFlushAt || T.lastFlushErrorAt || T.updatedAt || L.updatedAt || ""
      });
      const C = String(D.status || "").toLowerCase();
      if (_ && (C === "failed" || C === "partial_failure")) {
        const H = [];
        for (const [G, $] of Object.entries({
          cleanup: "日志清理",
          tgDailyReport: "每日报表",
          alerts: "异常告警"
        })) {
          const K = D?.[G];
          if (!K || typeof K != "object") continue;
          const j = String(K.status || "").trim(), se = String(K.lastError || "").trim();
          !se && j !== "failed" && j !== "partial_failure" || H.push(`${$}：${j || "failed"}${se ? `，错误：${se}` : ""}`);
        }
        w.push({
          code: "scheduled_failure",
          message: H.length ? `定时任务状态异常：${H.join("；")}` : `定时任务状态异常：${D.status}${D.lastError ? `，错误：${D.lastError}` : ""}`,
          eventAt: D.lastFinishedAt || D.lastErrorAt || D.updatedAt || L.updatedAt || ""
        });
      }
      if (A || b) {
        const H = await e.getCloudflareRuntimeQuotaStatus(c, {
          config: f,
          db: u
        }), G = [{
          enabled: A,
          threshold: E,
          code: "cf_kv_usage",
          title: "KV",
          card: H?.kv
        }, {
          enabled: b,
          threshold: R,
          code: "cf_d1_usage",
          title: "D1",
          card: H?.d1
        }];
        for (const $ of G) {
          if ($.enabled !== !0) continue;
          const K = $.card && typeof $.card == "object" ? $.card : {}, j = String(K.status || "").trim().toLowerCase();
          if (j !== "success" && j !== "partial_failure") continue;
          const se = (Array.isArray(K.metrics) ? K.metrics : []).filter((pe) => Number(pe?.percent) >= $.threshold);
          if (!se.length) continue;
          const me = se.map((pe) => `${String(pe?.key || "").trim()}:${String(pe?.percentText || "").trim()}`).filter(Boolean).join(",");
          w.push({
            code: $.code,
            message: pf($.title, K, $.threshold, se),
            eventAt: `${String(K.resourceLabel || $.title || "").trim()}|${String(K.planLabel || "").trim()}|${String(K.periodLabel || "").trim()}|${me}|${j}`
          });
        }
      }
      if (!w.length) return {
        sent: !1,
        reason: "no_alerts"
      };
      const F = JSON.stringify(w.map((H) => ({
        code: H.code,
        eventAt: H.eventAt,
        message: H.message
      }))), W = await e.getOpsStatusPayloadFromDb(u, e.TELEGRAM_ALERT_STATE_DB_SCOPE), O = Date.now(), N = S * 60 * 1e3;
      if (m.ignoreCooldown !== !0 && W && W.signature === F && Number(W.sentAtMs) > 0 && O - Number(W.sentAtMs) < N) return {
        sent: !1,
        reason: "cooldown_active"
      };
      const I = Hl(/* @__PURE__ */ new Date(), f.scheduleUtcOffsetMinutes), P = [
        "⚠️ Emby Proxy 运行时异常告警",
        "",
        ...w.map((H) => `- ${H.message}`),
        "",
        `时间：${I.dateKey} ${I.clockTime} (${I.offsetLabel})`,
        "#Emby #Alert"
      ];
      return await e.sendTelegramMessage({
        tgBotToken: p,
        tgChatId: g,
        text: P.join(`
`)
      }), m.persistState !== !1 && (await e.putOpsStatusPayloadToDb(u, e.TELEGRAM_ALERT_STATE_DB_SCOPE, {
        signature: F,
        sentAt: new Date(O).toISOString(),
        sentAtMs: O,
        issues: w
      }, O) || Ne("telegram_alert_state.write_failed", /* @__PURE__ */ new Error("telegram alert cooldown state not persisted"), { issueCount: w.length })), {
        sent: !0,
        issueCount: w.length,
        reason: "alert_sent"
      };
    }
  };
}
function xp(o = {}, e = {}) {
  return {
    ...Dp(o, e),
    ...Np(o, e),
    ...Ip(o, e),
    ...Mp(o, e),
    ...Pp(o, e)
  };
}
var Op = class {
  constructor({ logger: o, service: e }) {
    this.logger = o, this.service = e;
  }
  handle(o, e, r) {
    if (!r || typeof r.waitUntil != "function") throw new TypeError("ScheduledMaintenanceFacade.handle requires ctx.waitUntil");
    const t = this.#y(o, e, r);
    r.waitUntil(t);
  }
  #e(o = {}, ...e) {
    for (const r of e) {
      if (!r) continue;
      const t = o?.[r];
      if (U(t)) return t;
    }
    return {};
  }
  #a(o = "success") {
    return o === "success" ? "partial_failure" : o;
  }
  #f(o = []) {
    return String(o[0]?.dueAt || "");
  }
  #o(o = {}, e = "") {
    const r = String(e || o?.localDateKey || "");
    return r ? {
      ...o,
      localDateKey: r,
      executedSlots: Nt(o?.executedSlots || [], [])
    } : {
      ...o,
      executedSlots: Nt(o?.executedSlots || [], [])
    };
  }
  #n(o = {}, e = "", r = "") {
    return this.#o({
      ...o,
      executedSlots: [...o?.executedSlots || [], r]
    }, e);
  }
  #s(o = "", e = []) {
    const r = e[e.length - 1] || "";
    return {
      processedSlots: e,
      lastPlannedSlot: r ? `${o} ${r}` : "",
      reason: e.length > 1 ? "clock_slots_processed" : "clock_slot_processed"
    };
  }
  #t(o = {}, e = "", r = "", t = {}) {
    return {
      ...o,
      status: "skipped",
      lastSkippedAt: e,
      reason: r,
      ...t
    };
  }
  #d(o = {}, e = "", r = {}) {
    return {
      ...o,
      status: "pending",
      reason: e,
      ...r
    };
  }
  #i(o = {}, e = "", r = {}) {
    return {
      ...o,
      status: "success",
      lastSuccessAt: e,
      ...r
    };
  }
  #r(o = {}, e = "", r = "", t = {}) {
    return {
      ...o,
      status: "failed",
      lastErrorAt: e,
      lastError: r,
      ...t
    };
  }
  #u(o = {}, e = {}, r = {}) {
    const t = U(e) ? e : {}, a = U(r.extra) ? r.extra : {};
    return t.status === "success" ? this.#i(o, String(t.lastSuccessAt || r.at || "").trim(), {
      ...t,
      ...a
    }) : t.status === "failed" ? this.#r(o, String(t.lastErrorAt || r.at || "").trim(), String(t.lastError || r.error || "").trim(), {
      ...t,
      ...a
    }) : this.#t(o, String(t.lastSkippedAt || r.at || "").trim(), String(t.reason || r.defaultReason || "").trim(), {
      ...t,
      ...a
    });
  }
  #l(o = "") {
    return async (e, r, t = null, a = null) => {
      try {
        return await e;
      } catch (n) {
        return this.logger.error(`scheduled.${r}`, n, {
          leaseToken: o,
          ...U(t) ? t : {}
        }), a;
      }
    };
  }
  #c(o, e, r) {
    return { scheduled: {
      lastSkippedAt: o,
      lastSkipReason: r,
      lock: {
        status: "busy",
        reason: r,
        expiresAt: e.lock?.expiresAt || null,
        backend: String(e?.backend || e?.lock?.backend || "").trim() || "d1"
      }
    } };
  }
  #m(o, e, r = "d1") {
    const t = String(e || "scheduled_skipped").trim() || "scheduled_skipped";
    return { scheduled: {
      status: "skipped",
      lastSkippedAt: o,
      lastSkipReason: t,
      lastFinishedAt: o,
      lock: {
        status: "skipped",
        reason: t,
        backend: String(r || "").trim() || "d1"
      }
    } };
  }
  #p(o, e, r, t) {
    return { scheduled: {
      status: "running",
      lastStartedAt: o,
      lock: {
        status: "held",
        token: e,
        expiresAt: r.lock?.expiresAt || k() + t
      }
    } };
  }
  #g(o, e, r) {
    return o.lostReason ? {
      status: "lost",
      reason: o.lostReason,
      lastCheckedAt: e
    } : {
      status: r ? "released" : "release_skipped",
      releasedAt: e
    };
  }
  #h({ leaseStores: o, leaseToken: e, scheduledLeaseMs: r, leaseBackend: t = "", initialLock: a = null }) {
    const n = {
      active: !0,
      lostReason: null,
      lock: a
    }, s = async () => {
      if (!n.active) return null;
      const l = await this.service.renewScheduledLease(o, e, r, { backend: t });
      return l ? (n.lock = l, l) : (n.active = !1, n.lostReason = n.lostReason || "lease_lost", null);
    }, i = async () => {
      if (!n.active) throw new Error(n.lostReason || "scheduled_lease_lost");
      const l = await s();
      if (!l) throw new Error(n.lostReason || "scheduled_lease_lost");
      return l;
    }, c = Math.max(5e3, Math.min(Math.floor(r / 3), 6e4));
    return {
      leaseState: n,
      ensureActive: i,
      keepalivePromise: (async () => {
        for (; n.active; ) {
          let l = c;
          for (; n.active && l > 0; ) {
            const d = Math.min(l, 1e3);
            await ti(d), l -= d;
          }
          if (!n.active) break;
          await s();
        }
      })().catch((l) => {
        n.active = !1, n.lostReason = n.lostReason || "lease_renew_failed", this.logger.error("scheduled.lease_keepalive", l, {
          leaseToken: e,
          backend: t || "unknown",
          lostReason: n.lostReason
        });
      })
    };
  }
  async #y(o, e, r) {
    const t = this.service.getDB(e), a = this.service.getKV(e);
    if (!a && !t) return;
    const n = { db: t }, s = await Ae(e), i = Ke(s?.scheduleUtcOffsetMinutes), c = o?.scheduledTime !== void 0 ? new Date(o.scheduledTime) : /* @__PURE__ */ new Date(), l = es(c, i), d = (R = /* @__PURE__ */ new Date()) => es(R, i), u = de(s?.scheduledLeaseMs, v.Defaults.ScheduledLeaseMs, v.Defaults.ScheduledLeaseMinMs, 900 * 1e3), f = `${k()}-${Math.random().toString(36).slice(2, 10)}`, m = this.#l(f), p = async (R) => {
      const L = String(R || "db_unavailable").trim() || "db_unavailable";
      await m(this.service.patchOpsStatus(e, this.#m(l, L, "d1")), "patch_skipped_status", {
        reason: L,
        backend: "d1"
      }, null);
    };
    if (!t) {
      await p("db_not_configured");
      return;
    }
    const g = await this.service.tryAcquireScheduledLeaseWithDb(t, {
      token: f,
      leaseMs: u
    });
    if (!g.acquired) {
      const R = String(g.reason || "lease_not_acquired");
      if (R === "db_not_configured" || R === "db_unavailable" || R === "db_init_failed") {
        await p(R);
        return;
      }
      await m(this.service.patchOpsStatus(e, this.#c(l, g, R)), "patch_busy_status", { reason: R }, null);
      return;
    }
    const h = String(g.backend || g.lock?.backend || "").trim().toLowerCase(), { leaseState: y, ensureActive: S, keepalivePromise: _ } = this.#h({
      leaseStores: n,
      leaseToken: f,
      scheduledLeaseMs: u,
      leaseBackend: h,
      initialLock: g.lock || null
    }), A = l;
    await m(this.service.patchOpsStatus(e, this.#p(A, f, y, u)), "patch_running_status", { startedAt: A }, null);
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
    }, E = () => d(/* @__PURE__ */ new Date());
    try {
      const R = s || {}, L = await m(this.service.getOpsStatusSection(e, "scheduled"), "read_previous_status", null, {});
      if (t) try {
        await S();
        const O = St(c, R.scheduleUtcOffsetMinutes), N = O.dateKey, I = O.startTs, P = O.endTs, H = Ke(R.scheduleUtcOffsetMinutes), G = this.service.getPreviousD1TidyState(L), $ = await this.service.tidyD1Data(e, {
          db: t,
          kv: a,
          ctx: r,
          config: R,
          mode: "scheduled",
          maintenanceMode: "smart",
          previousScheduledState: L,
          previousCleanupStatus: G,
          scheduledNow: c,
          dayWindow: O,
          statsBucketDate: N,
          statsStartTs: I,
          statsEndTs: P,
          statsUtcOffsetMinutes: H,
          beforeEachStep: S
        }), K = E(), j = this.service.buildD1TidyStatusPayload($.summary, {
          mode: "scheduled",
          maintenanceMode: "smart",
          triggeredBy: "scheduled",
          timestamp: K
        });
        b.d1Tidy = j.d1Tidy, b.cleanup = j.cleanup, (b.d1Tidy.status === "partial_failure" || b.d1Tidy.status === "failed") && (b.status = "partial_failure"), await S();
      } catch (O) {
        b.status = "partial_failure";
        const N = this.service.buildD1TidyStatusPayload({
          status: "failed",
          lastError: O?.message || String(O),
          maintenanceMode: "smart"
        }, {
          mode: "scheduled",
          maintenanceMode: "smart",
          triggeredBy: "scheduled",
          timestamp: E()
        });
        b.d1Tidy = N.d1Tidy, b.cleanup = N.cleanup, this.logger.error("Scheduled DB Cleanup Error: ", O);
      }
      else {
        const O = this.service.buildD1TidyStatusPayload({
          status: "skipped",
          reason: "db_not_configured",
          maintenanceMode: "smart"
        }, {
          mode: "scheduled",
          maintenanceMode: "smart",
          triggeredBy: "scheduled",
          timestamp: E()
        });
        b.d1Tidy = O.d1Tidy, b.cleanup = O.cleanup;
      }
      b.kvTidy = {
        ...this.#e(L, "kvTidy"),
        mode: "manual_only",
        lastAutoSkipAt: E(),
        autoSkipReason: "manual_only"
      };
      const { tgBotToken: T, tgChatId: D } = R, w = this.#e(L, "tgDailyReport", "report"), M = this.#e(L, "alerts"), x = Nt(R.tgDailyReportClockTimes, v.Defaults.TgDailyReportClockTimes), C = Kl(w, x, i, c), F = ki(R, R), W = {
        ...w,
        clockTimes: x,
        reportKinds: F
      };
      if (R.tgDailyReportEnabled === !0) {
        let O = this.#o(C.fixedQueue);
        if (!F.length) b.tgDailyReport = this.#t(W, E(), "report_kinds_disabled", { fixedQueue: O });
        else if (!T || !D) b.tgDailyReport = this.#t(W, E(), "telegram_not_configured", { fixedQueue: O });
        else if (C.due !== !0) b.tgDailyReport = this.#t(W, E(), C.reason || "time_not_matched", { fixedQueue: O });
        else {
          let N = [], I = null, P = 0;
          for (const H of C.dueSlots) try {
            await S();
            const G = await this.service.sendDailyTelegramReport(e, {
              now: c,
              reportKinds: F
            });
            P += Number(G?.sentCount) || 0, N.push(H), O = this.#n(O, C.context.dateKey, H);
          } catch (G) {
            I = G, this.logger.error("Scheduled Daily Report Error: ", G);
            break;
          }
          I ? (b.status = this.#a(b.status), b.tgDailyReport = this.#r(W, E(), I?.message || String(I), {
            fixedQueue: O,
            processedSlots: N
          })) : b.tgDailyReport = this.#i(W, E(), {
            fixedQueue: O,
            sentCount: P,
            ...this.#s(C.context.dateKey, N)
          });
        }
      } else b.tgDailyReport = this.#t(W, E(), "disabled", { fixedQueue: C.fixedQueue });
      try {
        await S();
        const O = await this.service.maybeSendRuntimeAlerts(e, b);
        O.sent;
        const N = E();
        b.alerts = O.sent === !0 ? this.#i(M, N, {
          lastPolledAt: N,
          lastSkippedAt: M.lastSkippedAt || "",
          issueCount: Number(O.issueCount) || 0,
          reason: O.reason || "alert_sent"
        }) : this.#t(M, N, O.reason || "no_alerts", {
          lastPolledAt: N,
          lastSuccessAt: M.lastSuccessAt || "",
          issueCount: Number(O.issueCount) || 0
        });
      } catch (O) {
        b.status = this.#a(b.status);
        const N = E();
        b.alerts = this.#r(M, N, O?.message || String(O), { lastPolledAt: N }), this.logger.error("Scheduled Alert Error: ", O);
      }
    } catch (R) {
      b.status = "failed", b.lastErrorAt = E(), b.lastError = R?.message || String(R), this.logger.error("Scheduled Task Error: ", R);
    } finally {
      y.active = !1, await _;
      const R = E();
      b.lastFinishedAt = R, b.status === "success" && (b.lastSuccessAt = R);
      const L = y.lostReason ? !1 : await m(this.service.releaseScheduledLease(n, f, { backend: h }), "release_lease", { backend: h }, !1);
      b.lock = this.#g(y, R, L), await m(this.service.patchOpsStatus(e, { scheduled: b }), "patch_final_status", {
        finishedAt: R,
        finalStatus: b.status,
        leaseLostReason: y.lostReason || ""
      }, null);
    }
  }
};
function vp(o = {}, e = {}) {
  const { CacheManager: r, persistCloudflareDnsRecordsForHost: t } = o;
  return {
    sanitizeHeaders(a) {
      if (!a || typeof a != "object" || Array.isArray(a)) return {};
      const n = {};
      for (const [s, i] of Object.entries(a)) {
        const c = String(s || "").trim();
        c && (Xn.has(c.toLowerCase()) || (n[c] = String(i ?? "")));
      }
      return n;
    },
    normalizeTargets(a) {
      const n = String(a || "").split(",").map((i) => i.trim()).filter(Boolean);
      if (!n.length) return null;
      const s = [];
      for (const i of n) {
        const c = ps(i);
        if (!c) return null;
        s.push(c);
      }
      return s.length ? s.join(",") : null;
    },
    normalizeSingleTarget(a) {
      const n = e.normalizeTargets(a);
      if (!n) return null;
      const [s] = n.split(",").map((i) => i.trim()).filter(Boolean);
      return s || null;
    },
    normalizeTargetPort(a) {
      const n = String(a ?? "").trim();
      if (!n) return "";
      if (!/^\d{1,5}$/.test(n)) return null;
      const s = Number(n);
      return !Number.isInteger(s) || s < 1 || s > 65535 ? null : String(s);
    },
    buildTargetWithPort(a, n = "", s = "") {
      return ps(a, n, s);
    },
    buildDefaultLineName(a) {
      return `线路${Number(a) + 1}`;
    },
    normalizeLineId(a, n = 0) {
      return String(a || "").trim().toLowerCase().replace(/[^a-z0-9_-]+/g, "-").replace(/^-+|-+$/g, "") || `line-${Number(n) + 1}`;
    },
    parseLatencyMs(a) {
      if (a === "" || a === null || a === void 0) return null;
      const n = Number(a);
      return !Number.isFinite(n) || n < 0 ? null : Math.round(n);
    },
    normalizeIsoDatetime(a) {
      if (!a) return "";
      const n = new Date(a);
      return Number.isFinite(n.getTime()) ? n.toISOString() : "";
    },
    normalizeLines(a, n = "", s = "") {
      const i = String(e.normalizeTargets(n) || "").split(",").map((m) => m.trim()).filter(Boolean), c = e.normalizeTargetPort(s), l = c === null ? "" : c, d = Array.isArray(a) && a.length ? a : i.map((m, p) => ({
        id: `line-${p + 1}`,
        name: e.buildDefaultLineName(p),
        target: m
      }));
      if (!d.length) return [];
      const u = [], f = /* @__PURE__ */ new Set();
      return d.forEach((m, p) => {
        const g = m && typeof m == "object" && !Array.isArray(m) ? m : { target: m };
        let h = e.normalizeSingleTarget(e.buildTargetWithPort(g?.target, g?.port, l));
        if (!h && i[p] && (h = e.normalizeSingleTarget(e.buildTargetWithPort(i[p], g?.port, l))), !h) return;
        const y = e.normalizeLineId(g?.id, p);
        let S = y, _ = 2;
        for (; f.has(S); )
          S = `${y}-${_}`, _ += 1;
        f.add(S), u.push({
          id: S,
          name: String(g?.name || "").trim() || e.buildDefaultLineName(p),
          target: h
        });
      }), u;
    },
    resolveActiveLineId(a, n, s = [], i = "") {
      if (!Array.isArray(n) || !n.length) return "";
      const c = String(a || "").trim();
      if (c && n.some((l) => l.id === c)) return c;
      if (Array.isArray(s)) for (const l of s) {
        if (!l || typeof l != "object" || Array.isArray(l) || l.enabled !== !0) continue;
        const d = String(l.id || "").trim();
        if (d && n.some((m) => m.id === d)) return d;
        const u = e.normalizeSingleTarget(e.buildTargetWithPort(l.target, l.port, i));
        if (!u) continue;
        const f = n.find((m) => m.target === u);
        if (f) return f.id;
      }
      return n[0].id;
    },
    buildLegacyTargetFromLines(a = []) {
      return (Array.isArray(a) ? a : []).map((n) => String(n?.target || "").trim()).filter(Boolean).join(",");
    },
    getActiveNodeLine(a) {
      const n = Array.isArray(a?.lines) ? a.lines : [];
      if (!n.length) return null;
      const s = String(a?.activeLineId || "").trim();
      return n.find((i) => i.id === s) || n[0];
    },
    getOrderedNodeLines(a) {
      const n = Array.isArray(a?.lines) ? a.lines.slice() : [];
      if (n.length <= 1) return n;
      const s = e.getActiveNodeLine(a);
      return s ? [s, ...n.filter((i) => i.id !== s.id)] : n;
    },
    sortNodeLinesByLatency(a = []) {
      return (Array.isArray(a) ? a : []).map((n, s) => ({
        line: n,
        index: s
      })).sort((n, s) => {
        const i = Number.isFinite(n.line?.latencyMs) ? n.line.latencyMs : Number.POSITIVE_INFINITY, c = Number.isFinite(s.line?.latencyMs) ? s.line.latencyMs : Number.POSITIVE_INFINITY;
        return i !== c ? i - c : n.index - s.index;
      }).map((n) => n.line);
    },
    isPingCacheFresh(a, n) {
      const s = Number(a?.latencyMs), i = Date.parse(String(a?.latencyUpdatedAt || ""));
      if (!Number.isFinite(s) || !Number.isFinite(i)) return !1;
      const c = Math.max(0, Number(n) || 0) * 60 * 1e3;
      return c <= 0 ? !1 : k() - i < c;
    }
  };
}
function kn(o = "") {
  const e = String(o || "").trim().toLowerCase();
  return e.startsWith("emby ") ? "emby" : e.startsWith("mediabrowser ") ? "mediabrowser" : "";
}
function Fp(o = "", e = "") {
  const r = String(o || "").trim();
  if (!r) return "";
  const t = r.replace(/^[^\s]+\s+/i, "").trim();
  return t ? e === "emby" ? `Emby ${t}` : e === "mediabrowser" ? `MediaBrowser ${t}` : r : r;
}
function tl(o = "") {
  const e = String(o || "").trim();
  if (!e) return {};
  const r = e.replace(/^[^\s]+\s+/i, "").trim();
  if (!r || !r.includes("=")) return {};
  const t = {}, a = /([A-Za-z][A-Za-z0-9_-]*)\s*=\s*(?:"([^"]*)"|([^,]+))/g;
  let n;
  for (; (n = a.exec(r)) !== null; ) {
    const s = String(n[1] || "").trim().toLowerCase(), i = String(n[2] !== void 0 ? n[2] : n[3] || "").trim();
    !s || !i || Object.prototype.hasOwnProperty.call(t, s) || (t[s] = i);
  }
  return t;
}
var rl = /* @__PURE__ */ new Set([
  "apikey",
  "accesstoken",
  "token",
  "authorization",
  "xembytoken",
  "xembyauthorization",
  "xmediabrowsertoken",
  "xmediabrowserauthorization"
]), al = /* @__PURE__ */ new Set([
  "deviceid",
  "xembydeviceid",
  "xmediabrowserdeviceid"
]);
function zs(o, e) {
  const r = o instanceof URL ? o : null;
  if (!r || !(e instanceof Set)) return !1;
  for (const t of r.searchParams.keys()) if (e.has(Oa(t))) return !0;
  return !1;
}
function Ye(o, e = "") {
  if (o instanceof Headers) return o.get(e) || "";
  const r = String(e || "").trim().toLowerCase();
  for (const [t, a] of Ln(o))
    if (String(t || "").trim().toLowerCase() === r)
      return String(a ?? "");
  return "";
}
function Up(o = "") {
  const e = String(o ?? "").replace(/[\r\n]+/g, " ").trim();
  if (!e) return "";
  let r = "";
  for (const t of e) {
    const a = t.charCodeAt(0);
    if (a === 9 || a >= 32 && a <= 126 || a >= 160 && a <= 255) {
      r += t;
      continue;
    }
    r += encodeURIComponent(t);
  }
  return r;
}
function Hp(o) {
  const e = new Headers();
  for (const [r, t] of Ln(o)) {
    const a = String(r || "").trim();
    if (!a) continue;
    const n = String(t ?? "");
    try {
      e.set(a, n);
    } catch {
      const s = Up(n);
      if (!s) continue;
      try {
        e.set(a, s);
      } catch {
      }
    }
  }
  return e;
}
function Xo(o) {
  const e = {
    token: "",
    deviceId: ""
  };
  for (const r of ["X-Emby-Token", "X-MediaBrowser-Token"]) {
    const t = Ye(o, r).trim();
    if (t) {
      e.token = t;
      break;
    }
  }
  for (const r of [
    "Authorization",
    "X-Emby-Authorization",
    "X-MediaBrowser-Authorization"
  ]) {
    const t = Ye(o, r).trim();
    if (!t) continue;
    const a = tl(t);
    if (!e.token && a.token && (e.token = a.token), !e.deviceId && a.deviceid && (e.deviceId = a.deviceid), !e.token) {
      const n = /^Bearer\s+(.+)$/i.exec(t);
      n?.[1] && (e.token = n[1].trim());
    }
  }
  if (!e.deviceId) for (const r of ["X-Emby-Device-Id"]) {
    const t = Ye(o, r).trim();
    if (t) {
      e.deviceId = t;
      break;
    }
  }
  return e;
}
function kp(o = "") {
  const e = String(o || "").trim();
  if (!e || /^Bearer\s+.+$/i.test(e)) return !0;
  const r = tl(e);
  return !!String(r.token || "").trim();
}
function wa(o) {
  const e = Xo(o), r = [], t = [];
  qo(Ye(o, "Cookie"), hn) && t.push("cookie");
  for (const d of $c) {
    const u = Ye(o, d).trim();
    u && (kp(u) || r.push(d));
  }
  for (const [d, u] of Ln(o)) {
    const f = String(d || "").trim().toLowerCase(), m = String(u || "").trim();
    !f || !m || Wc(f) && r.push(f);
  }
  const a = [...new Set(r)], n = [...new Set(t)], s = !!String(e.token || "").trim() || !!String(e.deviceId || "").trim(), i = a.length > 0, c = n.length > 0, l = !i && !c;
  return {
    canDirect: l,
    reason: l ? "" : "direct_transport_incompatible",
    headerAuthHeaders: a,
    cookieAuthHeaders: n,
    hasQueryAuth: s,
    hasHeaderAuth: i,
    hasCookieAuth: c,
    auth: e
  };
}
function nl(o, e) {
  const r = o instanceof URL ? new URL(o.toString()) : new URL(String(o || "")), t = (e && typeof e == "object" && "auth" in e ? e : { auth: Xo(e) }).auth || {};
  return t.token && !zs(r, rl) && r.searchParams.set("api_key", t.token), t.deviceId && !zs(r, al) && r.searchParams.set("DeviceId", t.deviceId), r;
}
function Kp(o, e = "auto") {
  const r = ar(e);
  if (r === "passthrough") return o;
  const t = o.get("Authorization")?.trim() || "", a = o.get("X-Emby-Authorization")?.trim() || "", n = o.get("X-MediaBrowser-Authorization")?.trim() || "", s = kn(t), i = kn(n), c = kn(a);
  let l = s ? t : i ? n : c ? a : "";
  if (!l) return o;
  const d = r === "emby" ? "emby" : r === "jellyfin" ? "mediabrowser" : s || i || c || "";
  return l = Fp(l, d), o.set("Authorization", l), d === "mediabrowser" ? (o.set("X-MediaBrowser-Authorization", l), o.delete("X-Emby-Authorization"), o) : (d === "emby" && (o.set("X-Emby-Authorization", l), o.delete("X-MediaBrowser-Authorization")), o);
}
function Ws(o, e = {}) {
  if (!(o instanceof Headers)) return o;
  const r = e.dropTokenHeaders !== !1;
  return [
    "Authorization",
    "X-Emby-Authorization",
    "X-MediaBrowser-Authorization"
  ].forEach((t) => o.delete(t)), r && [
    "X-Emby-Token",
    "X-MediaBrowser-Token",
    "X-Emby-Auth-Token",
    "X-MediaBrowser-Auth-Token"
  ].forEach((t) => o.delete(t)), o;
}
function Bp() {
  const o = {};
  for (const e of ["direct", "proxy"]) {
    o[e] = {};
    for (const r of [
      "none",
      "query",
      "header",
      "cookie"
    ]) {
      o[e][r] = {};
      for (const t of [
        "none",
        "same_origin",
        "external"
      ]) o[e][r][t] = {
        deliveryMode: e,
        authCarrier: r,
        redirectScope: t,
        clientVisibleRedirect: e === "direct" && t !== "none",
        workerFollowRedirect: e === "proxy",
        reasonCode: e === "direct" ? t === "none" ? "entry_direct" : "client_redirect" : "worker_follow_redirect"
      };
    }
  }
  return Object.freeze(o);
}
var $p = Bp();
function Gs(o = {}) {
  const e = o && typeof o == "object" ? o : null, r = String(o?.corsOrigins || ""), t = String(o?.ipBlacklist || ""), a = String(o?.geoAllowlist || ""), n = String(o?.geoBlocklist || ""), s = e ? oe.ProxyAccessRuleProfileCache.get(e) : null;
  if (s && s.corsOriginsRaw === r && s.ipBlacklistRaw === t && s.geoAllowlistRaw === a && s.geoBlocklistRaw === n) return s;
  const i = (d, u = !1) => {
    const f = [], m = /* @__PURE__ */ new Set();
    for (const p of d.split(",")) {
      const g = p.trim(), h = u ? g.toUpperCase() : g;
      !h || m.has(h) || (m.add(h), f.push(h));
    }
    return {
      values: f,
      valueSet: m
    };
  }, c = i(r), l = {
    corsOriginsRaw: r,
    ipBlacklistRaw: t,
    geoAllowlistRaw: a,
    geoBlocklistRaw: n,
    corsOrigins: c.values,
    corsOriginSet: c.valueSet,
    ipBlacklist: i(t).valueSet,
    geoAllowlist: i(a, !0).valueSet,
    geoBlocklist: i(n, !0).valueSet
  };
  return e && oe.ProxyAccessRuleProfileCache.set(e, l), l;
}
function zp(o = {}, e = {}) {
  const { CacheManager: r, persistCloudflareDnsRecordsForHost: t } = o;
  return {
    normalizeNode(a, n, s = {}) {
      const i = { ...n };
      let c = !1;
      const l = e.normalizeTargetPort(i.port), d = e.normalizeLines(i.lines, i.target, l || ""), u = e.resolveActiveLineId(i.activeLineId, d, Array.isArray(i.lines) ? i.lines : [], l || ""), f = e.buildLegacyTargetFromLines(d);
      JSON.stringify(d) !== JSON.stringify(Array.isArray(i.lines) ? i.lines : []) && (c = !0), String(i.activeLineId || "") !== u && (c = !0), String(i.target || "") !== f && (c = !0), i.lines = d, i.activeLineId = u, i.target = f, Object.prototype.hasOwnProperty.call(i, "port") && (delete i.port, c = !0), i.secret === void 0 && (i.secret = "", c = !0);
      const m = zr(i.tags, i.tag), p = m[0] || "";
      JSON.stringify(m) !== JSON.stringify(Array.isArray(i.tags) ? i.tags : []) && (c = !0), String(i.tag || "") !== p && (c = !0), i.tags = m, i.tag = p;
      const g = [["server", "Record"].join(""), ["media", "Aggregation"].join("")];
      for (const T of Object.keys(i).filter((D) => g.some((w) => D.startsWith(w))))
        delete i[T], c = !0;
      i.remark === void 0 && (i.remark = "", c = !0), i.tagColor === void 0 && (i.tagColor = "", c = !0), i.remarkColor === void 0 && (i.remarkColor = "", c = !0), i.displayName === void 0 && (i.displayName = "", c = !0);
      const h = nr(i.entryMode);
      String(i.entryMode || "") !== h && (c = !0), i.entryMode = h, h === "host_prefix" && String(i.secret ?? "") !== "" && (i.secret = "", c = !0);
      const y = h === "host_prefix" ? Vt(i.hostPrefixCnameTarget) : "";
      String(i.hostPrefixCnameTarget || "") !== y && (c = !0), i.hostPrefixCnameTarget = y;
      const S = Pr(i.playbackInfoMode);
      String(i.playbackInfoMode || "") !== S && (c = !0), i.playbackInfoMode = S;
      const _ = ar(i.mediaAuthMode);
      String(i.mediaAuthMode || "") !== _ && (c = !0), i.mediaAuthMode = _;
      const A = Mr(i.realClientIpMode);
      String(i.realClientIpMode || "") !== A && (c = !0), i.realClientIpMode = A;
      const b = fa(i.hedgeProbePath);
      String(i.hedgeProbePath || "") !== b && (c = !0), i.hedgeProbePath = b;
      const E = $r(i);
      String(i.mainVideoStreamMode || "") !== E && (c = !0), i.mainVideoStreamMode = E;
      const R = Fr(i.routingDecisionMode);
      if (String(i.routingDecisionMode || "") !== R && (c = !0), i.routingDecisionMode = R, Object.prototype.hasOwnProperty.call(i, "wangpanDirectMode") && (delete i.wangpanDirectMode, c = !0), Object.prototype.hasOwnProperty.call(i, "wangpanMode") && (delete i.wangpanMode, c = !0), s && typeof s == "object" && "dropLegacyDirectRouting" in s && s.dropLegacyDirectRouting === !0) for (const T of [...En, ...Rn])
        Object.prototype.hasOwnProperty.call(i, T) && (delete i[T], c = !0);
      const L = e.sanitizeHeaders(i.headers);
      return JSON.stringify(L) !== JSON.stringify(i.headers || {}) && (c = !0), i.headers = L, delete i.videoThrottling, delete i.interceptMs, i.schemaVersion !== 6 && (i.schemaVersion = 6, c = !0), Object.prototype.hasOwnProperty.call(i, "createdAt") && (delete i.createdAt, c = !0), Object.prototype.hasOwnProperty.call(i, "updatedAt") && (delete i.updatedAt, c = !0), {
        data: i,
        changed: c
      };
    },
    buildComparableNodePayload(a = {}, n = {}) {
      if (!U(a)) return null;
      const s = { ...a };
      n.includeName !== !0 && delete s.name, delete s.createdAt, delete s.updatedAt;
      const i = (c) => {
        if (Array.isArray(c)) return c.map((l) => i(l));
        if (U(c)) {
          const l = {};
          for (const d of Object.keys(c).sort()) l[d] = i(c[d]);
          return l;
        }
        return c;
      };
      return i(s);
    },
    areNodePayloadsEquivalent(a = {}, n = {}, s = {}) {
      const i = e.buildComparableNodePayload(a, s), c = e.buildComparableNodePayload(n, s);
      return Q(i) === Q(c);
    },
    buildNodeRecord(a, n, s = {}) {
      let i = n?.headers !== void 0 ? n.headers : s.headers;
      if (typeof i == "string") try {
        i = JSON.parse(i);
      } catch {
        i = {};
      }
      const c = {};
      for (const h of ["proxyMode", "mode"]) {
        const y = n?.[h] !== void 0 ? n[h] : s[h];
        y !== void 0 && (c[h] = String(y || "").trim());
      }
      for (const h of [
        "direct",
        "sourceDirect",
        "directSource",
        "direct2xx"
      ]) n?.[h] !== void 0 ? c[h] = n[h] === !0 : s[h] !== void 0 && (c[h] = s[h] === !0);
      const l = Array.isArray(n?.lines) ? n.lines : n?.target !== void 0 ? [] : s.lines, d = n?.target !== void 0 ? n.target : s.target, u = n?.port !== void 0 ? n.port : s.port, f = e.normalizeLines(l, d, u);
      if (!f.length) return null;
      const m = e.resolveActiveLineId(n?.activeLineId !== void 0 ? n.activeLineId : s.activeLineId, f, Array.isArray(n?.lines) ? n.lines : s.lines, u), p = n?.mainVideoStreamMode !== void 0 ? n.mainVideoStreamMode : n?.wangpanDirectMode !== void 0 ? n.wangpanDirectMode : n?.wangpanMode, g = e.normalizeNode(a, {
        target: e.buildLegacyTargetFromLines(f),
        lines: f,
        activeLineId: m,
        ...c,
        entryMode: n?.entryMode !== void 0 ? nr(n.entryMode) : nr(s.entryMode),
        hostPrefixCnameTarget: n?.hostPrefixCnameTarget !== void 0 ? n.hostPrefixCnameTarget : s.hostPrefixCnameTarget,
        secret: n?.secret !== void 0 ? n.secret : s.secret || "",
        tag: n?.tag !== void 0 ? n.tag : s.tag || "",
        tags: n?.tags !== void 0 ? n.tags : n?.tag !== void 0 ? [n.tag, ...zr(s.tags, s.tag).filter((h) => h.toLowerCase() !== String(s.tag || "").trim().toLowerCase())] : s.tags,
        remark: n?.remark !== void 0 ? n.remark : s.remark || "",
        tagColor: n?.tagColor !== void 0 ? String(n.tagColor || "").trim() : s.tagColor || "",
        remarkColor: n?.remarkColor !== void 0 ? String(n.remarkColor || "").trim() : s.remarkColor || "",
        displayName: n?.displayName !== void 0 ? String(n.displayName || "").trim() : s.displayName || "",
        playbackInfoMode: n?.playbackInfoMode !== void 0 ? Pr(n.playbackInfoMode) : Pr(s.playbackInfoMode),
        mediaAuthMode: n?.mediaAuthMode !== void 0 ? ar(n.mediaAuthMode) : ar(s.mediaAuthMode),
        realClientIpMode: n?.realClientIpMode !== void 0 ? Mr(n.realClientIpMode) : Mr(s.realClientIpMode),
        hedgeProbePath: n?.hedgeProbePath !== void 0 ? fa(n.hedgeProbePath) : fa(s.hedgeProbePath),
        routingDecisionMode: n?.routingDecisionMode !== void 0 ? Fr(n.routingDecisionMode) : Fr(s.routingDecisionMode),
        mainVideoStreamMode: p !== void 0 ? mn(p) : $r(s),
        headers: e.sanitizeHeaders(i),
        schemaVersion: 6
      }).data;
      return e.normalizeNode(a, s || {}).data, g;
    },
    buildHostPrefixDnsRecordHost(a = "", n = "") {
      const s = String(a || "").trim().toLowerCase(), i = te(n);
      return !i || !Na(s) ? "" : `${s}.${i}`;
    },
    buildHostPrefixDnsSyncPlan(a = "", n = null, s = "", i = null, c = "", l = {}) {
      const d = te(c), u = n && Qe(n?.entryMode) ? e.buildHostPrefixDnsRecordHost(a, d) : "", f = i && Qe(i?.entryMode) ? e.buildHostPrefixDnsRecordHost(s, d) : "", m = u ? Ya(n, l.previousConfig || l.config || {}, d) : "", p = f ? Ya(i, l.nextConfig || l.config || {}, d) : "", g = [], h = [];
      return u && u !== f && g.push({
        type: "delete",
        host: u
      }), f && (l.forceUpsert === !0 || f !== u || p !== m) && g.push({
        type: "upsert",
        host: f,
        cnameTarget: p
      }), f && f !== u && h.push({
        type: "delete",
        host: f
      }), u && u !== f ? h.push({
        type: "upsert",
        host: u,
        cnameTarget: m
      }) : u && p !== m && h.push({
        type: "upsert",
        host: u,
        cnameTarget: m
      }), {
        hostRoot: d,
        previousDnsHost: u,
        nextDnsHost: f,
        previousCnameTarget: m,
        nextCnameTarget: p,
        steps: g,
        rollbackSteps: h,
        changed: g.length > 0
      };
    },
    buildPreparedNodeMutation(a = {}, n = {}, s = {}) {
      const i = String(s.nextName || a?.name || "").trim().toLowerCase();
      if (!i) return null;
      const c = String(s.previousName || a?.originalName || i).trim().toLowerCase() || i, l = e.buildNodeRecord(i, a, n);
      if (!l) return null;
      const d = U(n) && Object.keys(n).length ? e.normalizeNode(c, n || {}).data : null, u = c !== i, f = !u && !!d && e.areNodePayloadsEquivalent(d, l);
      return {
        previousName: c,
        previousNode: d,
        nextName: i,
        nextNode: l,
        isRename: u,
        nodeChanged: u || !f,
        isSemanticNoop: f,
        dnsPlan: null
      };
    },
    async upsertHostPrefixDnsRecord(a = "", n = {}) {
      const s = te(a);
      if (!s) return null;
      const i = n.config || await Ae(n.env), c = ua(i, n.env), l = Vt(n.cnameTarget) || te(c.host);
      return await t({
        env: n.env,
        kv: n.kv,
        config: i,
        host: s,
        mode: "cname",
        desiredRecords: [{
          type: "CNAME",
          content: l,
          ttl: 1,
          proxied: !1
        }],
        requestHost: te(n.requestHost || c.host),
        skipHistory: n.skipHistory === !0,
        includeAllRecords: !1
      });
    },
    async deleteHostPrefixDnsRecord(a = "", n = {}) {
      const s = te(a);
      if (!s) return null;
      const i = ua(n.config || await Ae(n.env), n.env), c = String(i.cfZoneId || "").trim(), l = String(i.cfApiToken || "").trim(), d = await ko(c, l, { scope: "node.host_prefix_dns_delete.zone_lookup" }), u = String(d?.name || "").trim();
      if (u && !ha(s, u)) throw we("INVALID_HOST", "当前子域不在 Cloudflare Zone 下", 400, {
        host: s,
        zoneName: u
      });
      const f = (await Hr(c, l, { nameExact: s })).filter((p) => te(p?.name) === s && String(p?.type || "").trim().toUpperCase() === "CNAME");
      if (!f.length) return {
        ok: !0,
        deletedCount: 0,
        host: s
      };
      const m = Nc(c, l, s, `https://api.cloudflare.com/client/v4/zones/${encodeURIComponent(c)}/dns_records`, f[0] || {
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
    async persistHostPrefixDnsSyncPlan(a = {}, n = {}) {
      const s = Array.isArray(a?.steps) ? a.steps : [];
      if (!s.length) return null;
      ua(n.config || await Ae(n.env), n.env);
      for (const i of s) {
        if (String(i?.type || "").trim().toLowerCase() === "delete") {
          await e.deleteHostPrefixDnsRecord(i.host, n);
          continue;
        }
        String(i?.type || "").trim().toLowerCase() === "upsert" && await e.upsertHostPrefixDnsRecord(i.host, {
          ...n,
          cnameTarget: i.cnameTarget
        });
      }
      return {
        changed: !0,
        stepCount: s.length
      };
    },
    async applyPreparedNodeMutation(a = {}, n = {}) {
      const s = n.kv;
      if (!s || a?.nodeChanged !== !0) return !1;
      const i = String(a?.previousName || "").trim().toLowerCase(), c = String(a?.nextName || "").trim().toLowerCase();
      return a?.nextNode ? await s.put(`${e.PREFIX}${c}`, JSON.stringify(a.nextNode)) : c && await s.delete(`${e.PREFIX}${c}`), i && c && i !== c && await s.delete(`${e.PREFIX}${i}`), e.invalidateNodeCaches([i, c], {
        invalidateList: !0,
        kv: s
      }), !0;
    },
    async rollbackPreparedNodeMutation(a = {}, n = {}) {
      const s = n.kv;
      if (!s || a?.nodeChanged !== !0) return !1;
      const i = String(a?.previousName || "").trim().toLowerCase(), c = String(a?.nextName || "").trim().toLowerCase();
      return i && (a?.previousNode ? await s.put(`${e.PREFIX}${i}`, JSON.stringify(a.previousNode)) : await s.delete(`${e.PREFIX}${i}`)), c && c !== i && await s.delete(`${e.PREFIX}${c}`), e.invalidateNodeCaches([i, c], {
        invalidateList: !0,
        kv: s
      }), !0;
    },
    async rollbackPreparedNodeMutations(a = [], n = {}) {
      const s = n.kv;
      if (!s) return { rolledBackNodeCount: 0 };
      const i = (Array.isArray(a) ? a : []).filter(Boolean);
      if (!i.length) return { rolledBackNodeCount: 0 };
      const c = i.some((u) => u?.dnsPlan?.changed === !0) ? n.config || await Ae(n.env) : null;
      let l = 0;
      const d = [];
      for (let u = i.length - 1; u >= 0; u -= 1) {
        const f = i[u];
        if (f?.dnsPlan?.changed === !0) try {
          await e.persistHostPrefixDnsSyncPlan({ steps: f?.dnsPlan?.rollbackSteps || [] }, {
            ...n,
            config: c,
            skipHistory: !0
          });
        } catch (m) {
          d.push(`dns:${ie(m, "rollback_failed")}`);
        }
        if (f?.nodeChanged === !0) try {
          await e.rollbackPreparedNodeMutation(f, n), l += 1;
        } catch (m) {
          d.push(`node:${ie(m, "rollback_failed")}`);
        }
      }
      if (n.rebuildIndexes === !0) try {
        await e.rebuildNodeIndexesFromKv(s, {
          ctx: n.ctx,
          syncLegacyIndex: !0
        });
      } catch (u) {
        d.push(`rebuild_indexes:${ie(u, "rollback_failed")}`);
      }
      if (d.length > 0) throw new Error(d.join("; "));
      return { rolledBackNodeCount: l };
    },
    async applyPreparedNodeMutations(a = [], n = {}) {
      if (!n.kv) return { mutatedNodeCount: 0 };
      const s = (Array.isArray(a) ? a : []).filter(Boolean);
      if (!s.length) return { mutatedNodeCount: 0 };
      const i = s.some((m) => m?.dnsPlan?.changed === !0) ? await Ae(n.env) : null;
      let c = 0;
      const l = [];
      let d = !1, u = !0, f = "";
      try {
        for (const m of s)
          l.push(m), m?.nodeChanged === !0 && (await e.applyPreparedNodeMutation(m, n), c += 1), m?.dnsPlan?.changed === !0 && await e.persistHostPrefixDnsSyncPlan(m.dnsPlan, {
            ...n,
            config: i
          });
        return { mutatedNodeCount: c };
      } catch (m) {
        d = l.length > 0;
        try {
          await e.rollbackPreparedNodeMutations(l, {
            ...n,
            config: i,
            rebuildIndexes: !1
          });
        } catch (p) {
          u = !1, f = ie(p, "rollback_failed");
        }
        throw m && typeof m == "object" && (String(m.code || "").trim() || (m.code = "NODE_MUTATION_FAILED"), m.status = De(m.status, 500), m.details = {
          ...U(m.details) ? m.details : {},
          rollbackAttempted: d,
          rollbackSucceeded: u,
          rollbackError: f
        }), m;
      }
    }
  };
}
function Wp(o = {}, e = {}) {
  const { CacheManager: r, persistCloudflareDnsRecordsForHost: t } = o;
  return {
    async pingTarget(a, n) {
      const s = k(), i = bd, c = (g = {}) => ({
        ok: g.ok === !0,
        reason: String(g.reason || "network_error"),
        statusCode: Number.isInteger(g.statusCode) ? g.statusCode : null,
        elapsedMs: Math.max(0, k() - s),
        methodUsed: g.methodUsed === "HEAD" || g.methodUsed === "GET" ? g.methodUsed : null,
        probePath: i
      }), l = bn(String(a || "").trim());
      if (!l) return c({ reason: "invalid_target" });
      const d = Fc(l, i);
      if (!d) return c({ reason: "invalid_target" });
      const u = new AbortController();
      let f = !1;
      const m = "GET", p = setTimeout(() => {
        f = !0, u.abort();
      }, n);
      try {
        const g = await Be(d.toString(), {
          method: "GET",
          signal: u.signal
        }), h = Number(g.status);
        try {
          g.body?.cancel?.();
        } catch {
        }
        return c({
          ok: g.ok,
          reason: g.ok ? "ok" : "http_error",
          statusCode: h,
          methodUsed: m
        });
      } catch (g) {
        const h = [
          g?.name,
          g?.message,
          g?.cause?.name,
          g?.cause?.message
        ].map((S) => String(S || "")).join(" "), y = /\b(?:tls|ssl|x509|certificate|handshake)\b/i.test(h);
        return c({
          reason: f ? "timeout" : y ? "tls_error" : "network_error",
          methodUsed: m
        });
      } finally {
        clearTimeout(p);
      }
    },
    async getNode(a, n, s) {
      a = String(a).toLowerCase();
      const i = e.getKV(n);
      if (!i) return null;
      const c = _e(i), l = Pe(a, c), d = c.NodeCache.get(a);
      if (d && d.exp > Date.now()) {
        const f = await e.getNodesRevision(i), m = String(d?.nodesRevision || "").trim();
        if (Pe(a, c) === l && (!m || !f || m === f))
          return on(c.NodeCache, a), d.data;
        Pe(a, c) === l && c.NodeCache.delete(a);
      }
      const u = Pe(a, c);
      return await Sn(c.SingleFlightTasks, ot([
        "proxy_node",
        a,
        u
      ]), async () => {
        try {
          const f = await i.get(`${e.PREFIX}${a}`, { type: "json" });
          if (Pe(a, c) !== u) return null;
          if (!f) {
            const y = await e.getNodesSummaryIndex(i, { ctx: s });
            if (Array.isArray(y)) if (y.some((S) => String(S?.name || "").toLowerCase().trim() === a)) {
              const S = e.rebuildNodeIndexesFromKv(i, { ctx: s });
              s ? s.waitUntil(S) : await S;
            } else {
              const S = await e.getNodesRevision(i);
              Pe(a, c) === u && Fe(c.NodeCache, a, {
                data: null,
                exp: Date.now() + v.Defaults.NodeMissCacheTtlMs,
                nodesRevision: S
              }, v.Defaults.NodeCacheMax);
            }
            return null;
          }
          const { data: m, changed: p } = e.normalizeNode(a, f);
          if (Ze(a, m))
            return c.NodeCache.delete(a), c.PlaybackRouteHotCache.delete(a), m;
          if (p) {
            const y = i.put(`${e.PREFIX}${a}`, JSON.stringify(m));
            s ? s.waitUntil(y) : await y;
          }
          const g = e.upsertNodeSummaryEntry(a, m, {
            kv: i,
            ctx: s
          });
          let h = await e.getNodesRevision(i);
          return h ? s ? s.waitUntil(g) : await g : (await g, h = await e.getNodesRevision(i)), Pe(a, c) !== u ? null : (Fe(c.NodeCache, a, {
            data: m,
            exp: Date.now() + v.Defaults.CacheTTL,
            nodesRevision: h
          }, v.Defaults.NodeCacheMax), m);
        } catch {
          return null;
        }
      });
    },
    async getNodeForRead(a, n) {
      a = String(a).toLowerCase();
      const s = e.getKV(n);
      if (!s) return null;
      const i = _e(s), c = Pe(a, i), l = i.NodeCache.get(a);
      if (l?.data === null) i.NodeCache.delete(a);
      else if (l && l.exp > Date.now()) {
        const u = await e.getNodesRevision(s), f = String(l?.nodesRevision || "").trim();
        if (Pe(a, i) === c && (!f || !u || f === u))
          return on(i.NodeCache, a), l.data;
        Pe(a, i) === c && i.NodeCache.delete(a);
      }
      const d = Pe(a, i);
      try {
        const u = await s.get(`${e.PREFIX}${a}`, { type: "json" });
        if (Pe(a, i) !== d || !u) return null;
        const f = e.normalizeNode(a, u).data;
        if (Ze(a, f))
          return i.NodeCache.delete(a), i.PlaybackRouteHotCache.delete(a), f;
        const m = await e.getNodesRevision(s);
        return Pe(a, i) !== d ? null : (Fe(i.NodeCache, a, {
          data: f,
          exp: Date.now() + v.Defaults.CacheTTL,
          nodesRevision: m
        }, v.Defaults.NodeCacheMax), f);
      } catch {
        return null;
      }
    },
    normalizeAdminActionRequest(a) {
      if (!a || typeof a != "object" || Array.isArray(a)) return null;
      const n = a.payload && typeof a.payload == "object" && !Array.isArray(a.payload) ? { ...a.payload } : null, s = String(a.action ?? n?.action ?? "").trim(), i = a.meta && typeof a.meta == "object" && !Array.isArray(a.meta) ? { ...a.meta } : {};
      return {
        action: s,
        data: n ? {
          ...n,
          action: s,
          meta: i
        } : {
          ...a,
          action: s,
          meta: i
        },
        meta: i
      };
    }
  };
}
function Gp(o = {}, e = {}) {
  return {
    ...vp(o, e),
    ...zp(o, e),
    ...Wp(o, e)
  };
}
var Kn = "proxy_logs_fts";
function Vp(o = {}) {
  const e = {
    buildResponse(r = {}) {
      return J(r);
    },
    buildRange(r, t) {
      return {
        startDate: new Date(r).toISOString(),
        endDate: new Date(t).toISOString()
      };
    },
    normalizeRequest(r = {}) {
      const { page: t = 1, pageSize: a = 50, filters: n = {} } = r, s = Math.max(1, parseInt(t, 10) || 1), i = Math.min(200, Math.max(1, parseInt(a, 10) || 50)), c = String(r?.paginationMode || "").trim().toLowerCase(), l = Yi(r?.pageCursor), d = c !== "offset" && (s === 1 || !!l), u = (s - 1) * i, f = Date.now(), m = v.Defaults.LogQueryDefaultDays * 24 * 60 * 60 * 1e3, p = (S) => {
        if (!S) return null;
        const _ = new Date(String(S)).getTime();
        return Number.isFinite(_) ? _ : null;
      }, g = (S) => {
        if (!S) return null;
        const _ = (/* @__PURE__ */ new Date(String(S) + "T23:59:59.999")).getTime();
        return Number.isFinite(_) ? _ : null;
      };
      let h = p(n.startDate), y = g(n.endDate);
      return Number.isFinite(y) || (y = f), Number.isFinite(h) || (h = Math.max(0, y - m)), h > y && ([h, y] = [Math.max(0, y - m), y]), {
        filters: n,
        safePage: s,
        safePageSize: i,
        requestedPageCursor: l,
        useSeekPagination: d,
        offset: u,
        startTs: h,
        endTs: y
      };
    },
    resolveSearch(r = {}, t = {}, a = {}) {
      const n = String(r.searchMode || "").trim().toLowerCase(), s = n === "fts" || n === "like";
      let i = ji(r.searchMode || t.logSearchMode), c = "";
      if (i === "fts" && a.ftsReady !== !0) {
        if (s) return { errorResponse: z("LOG_FTS_NOT_READY", "FTS5 虚拟表尚未初始化，请先点击“初始化 FTS5”", 400, {
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
    buildBasePayload(r = {}, t = {}, a = {}) {
      return {
        page: r.safePage,
        pageSize: r.safePageSize,
        paginationMode: r.useSeekPagination ? "seek" : "offset",
        pageCursor: r.requestedPageCursor,
        revisions: { logsRevision: t.revision },
        range: e.buildRange(r.startTs, r.endTs),
        ...a
      };
    },
    buildDisabledResponse(r = {}, t = {}, a = "", n = "") {
      return e.buildResponse(e.buildBasePayload(r, t, {
        logs: [],
        total: 0,
        totalPages: 1,
        searchMode: a,
        effectiveSearchMode: a,
        searchFallbackReason: n,
        totalExact: !0,
        hasPrevPage: !1,
        hasNextPage: !1,
        nextCursor: null,
        disabled: !0
      }));
    },
    buildSuccessResponse(r = {}, t = {}, a = {}) {
      return e.buildResponse(e.buildBasePayload(r, t, {
        logs: a.logs,
        total: a.total,
        totalPages: a.totalPages,
        searchMode: a.searchMode,
        effectiveSearchMode: a.effectiveSearchMode,
        searchFallbackReason: a.searchFallbackReason,
        totalExact: r.useSeekPagination !== !0,
        hasPrevPage: a.hasPrevPage,
        hasNextPage: a.hasNextPage,
        nextCursor: a.nextCursor
      }));
    },
    buildDisplayState(r = {}) {
      return {
        displayClientIp: r.logDisplayClientIp !== !1,
        displayColo: r.logDisplayColo !== !1,
        displayUa: r.logDisplayUa !== !1
      };
    },
    buildSqlPlan(r = {}, t = {}, a = {}, n = "") {
      const { startTs: s, endTs: i } = t, c = e.buildDisplayState(a), l = Lu(r.requestGroup), d = Du(r.statusGroup), u = ["proxy_logs.timestamp >= ?", "proxy_logs.timestamp <= ?"], f = [s, i], m = (b, ...E) => {
        u.push(b), E.length > 0 && f.push(...E);
      }, p = "LOWER(proxy_logs.request_path)", g = String(r.keyword || "").trim();
      let h = !1;
      if (g) {
        const b = v.Defaults.LogKeywordMaxWindowDays * 24 * 60 * 60 * 1e3;
        if (i - s > b) return { errorResponse: z("LOG_QUERY_RANGE_TOO_WIDE", `关键词搜索必须限制在 ${v.Defaults.LogKeywordMaxWindowDays} 天内`, 400, { maxWindowDays: v.Defaults.LogKeywordMaxWindowDays }) };
        if (/^\d{3}$/.test(g)) m("proxy_logs.status_code = ?", Number(g));
        else if (cl(g) || Jo(g)) {
          const E = [], R = [];
          if (c.displayClientIp && (E.push("proxy_logs.client_ip = ?"), R.push(g)), c.displayColo) {
            const L = Jo(g) ? g.toUpperCase() : g;
            E.push("COALESCE(proxy_logs.inbound_colo, proxy_logs.inbound_ip, '') = ?"), R.push(L), E.push("COALESCE(proxy_logs.outbound_colo, proxy_logs.outbound_ip, '') = ?"), R.push(L);
          }
          m(E.length ? `(${E.join(" OR ")})` : "1 = 0", ...R);
        } else if (n === "fts")
          m(`${Kn} MATCH ?`, vu(g)), h = !0;
        else {
          const E = `%${Fa(g)}%`, R = [
            "proxy_logs.node_name LIKE ? ESCAPE '\\'",
            "proxy_logs.request_path LIKE ? ESCAPE '\\'",
            "proxy_logs.detail_json LIKE ? ESCAPE '\\'"
          ];
          f.push(E, E, E), c.displayClientIp && (R.push("proxy_logs.client_ip LIKE ? ESCAPE '\\'"), f.push(E)), c.displayUa && (R.push("proxy_logs.user_agent LIKE ? ESCAPE '\\'"), f.push(E)), R.push("proxy_logs.error_detail LIKE ? ESCAPE '\\'"), f.push(E), m(`(${R.join(" OR ")})`);
        }
      }
      r.category && m("proxy_logs.category = ?", String(r.category)), l === "playback_info" ? (m("proxy_logs.category = ?", "api"), m(`(${p} LIKE ? ESCAPE '\\' OR ${p} LIKE ? ESCAPE '\\')`, "%/playbackinfo%", "%/sessions/playing%")) : l === "image" ? m("proxy_logs.category = ?", "image") : l === "api" ? (m("proxy_logs.category = ?", "api"), m(`${p} NOT LIKE ? ESCAPE '\\'`, "%/playbackinfo%"), m(`${p} NOT LIKE ? ESCAPE '\\'`, "%/sessions/playing%"), m(`${p} NOT LIKE ? ESCAPE '\\'`, "%/users/authenticate%")) : l === "auth" && (m("proxy_logs.category = ?", "api"), m(`${p} LIKE ? ESCAPE '\\'`, "%/users/authenticate%")), d === "4xx" ? m("proxy_logs.status_code >= ? AND proxy_logs.status_code < ?", 400, 500) : d === "5xx" && m("proxy_logs.status_code >= ? AND proxy_logs.status_code < ?", 500, 600);
      const y = ys(r.deliveryMode || "");
      if (y) {
        const b = "LOWER(COALESCE(CAST(json_extract(proxy_logs.detail_json, '$.deliveryMode') AS TEXT), ''))", E = y === "direct" ? ["Direct=entry_307", "Redirect=client_redirect"] : [
          "Redirect=proxied_follow",
          "Flow=managed",
          "Flow=passthrough"
        ];
        m(`(
          ${b} = ?
          OR (
            COALESCE(proxy_logs.detail_json, '') = ''
            AND (${E.map(() => "proxy_logs.error_detail LIKE ? ESCAPE '\\'").join(" OR ")})
          )
        )`, y, ...E.map((R) => `%${Fa(R)}%`));
      }
      const S = Nu(r.protocolFailureReason || "");
      if (S && m(`(
          LOWER(COALESCE(CAST(json_extract(proxy_logs.detail_json, '$.protocolFailureReason') AS TEXT), '')) = ?
          OR (
            COALESCE(proxy_logs.detail_json, '') = ''
            AND proxy_logs.error_detail LIKE ? ESCAPE '\\'
          )
        )`, S, `%${Fa(S)}%`), r.playbackMode) {
        const b = String(r.playbackMode || "").trim();
        ys(b) || m("proxy_logs.error_detail LIKE ? ESCAPE '\\'", `%${Fa(`Playback=${b}`)}%`);
      }
      const _ = h ? `FROM proxy_logs INNER JOIN ${Kn} ON ${Kn}.rowid = proxy_logs.id` : "FROM proxy_logs", A = `SELECT proxy_logs.*,
          ${c.displayClientIp ? "NULLIF(proxy_logs.client_ip, '') AS client_ip" : "NULL AS client_ip"},
          ${c.displayColo ? `COALESCE(proxy_logs.inbound_colo, proxy_logs.inbound_ip, proxy_logs.client_ip, '') AS inbound_colo,
        COALESCE(proxy_logs.outbound_colo, proxy_logs.outbound_ip, '') AS outbound_colo` : `'' AS inbound_colo,
        '' AS outbound_colo`},
          ${c.displayUa ? "proxy_logs.user_agent AS user_agent" : "NULL AS user_agent"},
          proxy_logs.detail_json AS detail_json`;
      return {
        searchMode: n,
        useFtsKeyword: h,
        whereClause: u,
        params: f,
        fromClause: _,
        selectClause: A,
        orderByClause: "ORDER BY proxy_logs.timestamp DESC, proxy_logs.id DESC"
      };
    },
    async executeSqlPlan(r, t = {}, a = {}) {
      const { safePage: n, safePageSize: s, requestedPageCursor: i, useSeekPagination: c, offset: l } = t, { whereClause: d = [], params: u = [], fromClause: f = "", selectClause: m = "", orderByClause: p = "", useFtsKeyword: g = !1, searchMode: h = "" } = a, y = "WHERE " + d.join(" AND ");
      let S = 0, _ = 1, A = n > 1, b = !1, E = null, R = [];
      try {
        if (c) {
          const L = d.slice(), T = u.slice();
          i && (L.push("(proxy_logs.timestamp < ? OR (proxy_logs.timestamp = ? AND proxy_logs.id < ?))"), T.push(i.timestamp, i.timestamp, i.id));
          const D = "WHERE " + L.join(" AND "), w = await r.prepare(`${m} ${f} ${D} ${p} LIMIT ?`).bind(...T, s + 1).all(), M = Array.isArray(w?.results) ? w.results : [];
          b = M.length > s, R = b ? M.slice(0, s) : M, E = b ? Fu(R[R.length - 1]) : null, S = null, _ = b ? n + 1 : n;
        } else {
          S = (await r.prepare(`SELECT COUNT(*) as total ${f} ${y}`).bind(...u).first())?.total || 0;
          const L = await r.prepare(`${m} ${f} ${y} ${p} LIMIT ? OFFSET ?`).bind(...u, s, l).all();
          R = Array.isArray(L?.results) ? L.results : [], _ = Math.ceil(S / s) || 1, A = n > 1, b = n < _;
        }
      } catch (L) {
        const T = String(L?.message || L || "");
        if (g && /no such table:\s*proxy_logs_fts/i.test(T)) return { errorResponse: z("LOG_FTS_NOT_READY", "FTS5 虚拟表尚未初始化，请先点击“初始化 FTS5”", 400, { searchMode: h }) };
        if (g && /fts5/i.test(T)) return { errorResponse: z("LOG_FTS_QUERY_INVALID", "FTS 查询语法无效，请检查引号、布尔表达式或前缀写法", 400, { detail: T }) };
        throw L;
      }
      return {
        logs: R,
        total: S,
        totalPages: _,
        hasPrevPage: A,
        hasNextPage: b,
        nextCursor: E,
        searchMode: h
      };
    }
  };
  return e;
}
var jp = "sys_status";
function qp(o = {}) {
  const { logRepository: e } = o, r = {
    error(t, a, n = null) {
      Ne(t, a, n, "error");
    },
    scheduleFlush(t, a) {
      const n = e.getDB(t), s = tr.get(n);
      if (!n || !a || s.LogFlushPending) return null;
      s.LogFlushPending = !0;
      const i = r.flush(t).finally(() => {
        s.LogFlushTask === i && (s.LogFlushTask = null), s.LogFlushPending = !1, s.LogLastFlushAt = k(), s.LogQueue.length > 0 && r.scheduleFlush(t, a);
      });
      return s.LogFlushTask = i, a.waitUntil(i), i;
    },
    record(t, a, n) {
      const s = e.getDB(t);
      if (!s || !a) return;
      const i = tr.get(s);
      if (n.requestMethod === "OPTIONS") return;
      const c = U(n.runtimeConfig) ? n.runtimeConfig : ms(t) || {};
      if (i.runtimeConfig = c, c.logEnabled === !1) {
        i.LogQueue.length > 0 && (i.LogQueue.length = 0), i.LogDedupe.clear();
        return;
      }
      const l = Number(n.statusCode) || 0, d = qi(c.logWriteMode);
      if (d === "error" && (l < 400 || l >= 600)) return;
      const u = Gi(n.requestPath, n.category);
      if (u === "image_poster" && c.logWriteImagePoster !== !0 || u === "media_metadata" && c.logWriteMediaMetadata !== !0) return;
      const f = c.logWriteClientIp !== !1, m = c.logWriteColo !== !1, p = c.logWriteUa !== !1, g = (x, C) => String(x || "").slice(0, C), h = g(n.inboundColo || n.inboundIp || n.clientIp || "unknown", 32), y = g(n.outboundColo || n.outboundIp || "", 32), S = f ? g(n.clientIp || "unknown", 128) : "", _ = g(n.nodeName || "unknown", 128) || "unknown", A = g(n.requestPath || "/", 2048) || "/", b = k(), E = Math.max(0, Number(i.LogClearEpochMs) || 0), R = b <= E ? E + 1 : b;
      let L = 0;
      if (n.requestMethod === "HEAD" ? L = 3e5 : (n.category === "segment" || n.category === "prewarm") && (L = 3e4), L > 0) {
        const x = [
          _,
          n.requestMethod || "GET",
          l,
          A,
          S,
          y
        ].join("|"), C = i.LogDedupe.get(x);
        if (C && b - C < L) return;
        if (i.LogDedupe.set(x, b), i.LogDedupe.size > v.Defaults.LogDedupeMax) {
          for (const [F, W] of i.LogDedupe)
            if (i.LogDedupe.has(F) && ((b - W > L || i.LogDedupe.size > v.Defaults.LogDedupeTrimTarget) && i.LogDedupe.delete(F), i.LogDedupe.size <= v.Defaults.LogDedupeTrimTarget))
              break;
        }
      }
      if (i.LogQueue.push({
        timestamp: R,
        nodeName: _,
        requestPath: A,
        requestMethod: n.requestMethod || "GET",
        statusCode: l,
        responseTime: Number(n.responseTime) || 0,
        clientIp: S,
        inboundColo: m ? h : null,
        outboundColo: m ? y : null,
        userAgent: p && g(n.userAgent, 512) || null,
        referer: g(n.referer, 1024) || null,
        category: n.category || "api",
        errorDetail: g(n.errorDetail, 2048) || null,
        detailJson: n.detailJson ? sl(n.detailJson) : null,
        createdAt: new Date(R).toISOString()
      }), i.LogQueue.length > v.Defaults.LogQueueMax) {
        const x = Math.min(v.Defaults.LogQueueOverflowDropCount, i.LogQueue.length);
        i.LogQueue.splice(0, x), e.patchOpsStatus(t, { log: {
          lastOverflowAt: (/* @__PURE__ */ new Date()).toISOString(),
          lastOverflowDropCount: x,
          queueLengthAfterDrop: i.LogQueue.length
        } }, a), console.error(`Log queue overflow, dropping ${x} logs to preserve isolate headroom.`);
      }
      i.LogLastFlushAt || (i.LogLastFlushAt = b);
      const T = Number(c.logWriteDelayMinutes), D = Number(c.logFlushCountThreshold), w = Math.max(0, Number.isFinite(T) ? T * 6e4 : v.Defaults.LogFlushDelayMinutes * 6e4), M = Math.max(1, Number.isFinite(D) ? Math.floor(D) : v.Defaults.LogFlushCountThreshold);
      (d === "error" || i.LogQueue.length >= M || w === 0 || b - i.LogLastFlushAt >= w) && r.scheduleFlush(t, a);
    },
    async flush(t) {
      const a = e.getDB(t), n = tr.get(a);
      if (!a || n.LogQueue.length === 0) return;
      const s = U(n.runtimeConfig) ? n.runtimeConfig : ms(t) || {}, i = Ke(s.scheduleUtcOffsetMinutes);
      if (s.logEnabled === !1) {
        n.LogQueue.length = 0, n.LogDedupe.clear();
        return;
      }
      await e.ensureSysStatusTable(a);
      const c = await e.resolveLogsReadiness({
        db: a,
        kv: e.getKV(t)
      });
      if (c.schemaReady !== !0) {
        const E = n.LogQueue.length;
        n.LogQueue.length = 0, n.LogDedupe.clear(), await e.patchOpsStatus(t, { log: {
          schemaReady: !1,
          ftsReady: c.ftsReady === !0,
          statsReady: c.statsReady === !0,
          lastFlushAt: (/* @__PURE__ */ new Date()).toISOString(),
          lastFlushStatus: "schema_not_ready",
          lastFlushError: "proxy_logs schema not initialized",
          lastFlushErrorAt: (/* @__PURE__ */ new Date()).toISOString(),
          lastFlushRetryCount: 0,
          lastDroppedBatchSize: E,
          lastFlushWrittenBeforeError: 0,
          queueLengthAfterFlush: 0
        } });
        return;
      }
      const l = Number(s.logBatchChunkSize), d = Number(s.logBatchRetryCount), u = Number(s.logBatchRetryBackoffMs), f = de(l, v.Defaults.LogBatchChunkSize, 1, 100), m = de(d, v.Defaults.LogBatchRetryCount, 0, 5), p = de(u, v.Defaults.LogBatchRetryBackoffMs, 0, 5e3), g = e.getOpsStatusDbScope("log");
      let h = 0, y = 0, S = 0, _ = 0;
      const A = /* @__PURE__ */ new Map(), b = (E = []) => {
        const R = e.summarizeStatsHourlyEntries(E, { utcOffsetMinutes: i });
        for (const L of R) {
          const T = `${L.bucketDate}:${L.bucketHour}`, D = A.get(T) || {
            bucketDate: L.bucketDate,
            bucketHour: L.bucketHour,
            requestCount: 0,
            playCount: 0,
            playbackInfoCount: 0
          };
          D.requestCount += Math.max(0, Number(L.requestCount) || 0), D.playCount += Math.max(0, Number(L.playCount) || 0), D.playbackInfoCount += Math.max(0, Number(L.playbackInfoCount) || 0), A.set(T, D);
        }
      };
      try {
        const E = Math.max(n.LogClearEpochMs || 0, await e.getLogClearEpochMs(t));
        for (; n.LogQueue.length > 0; ) {
          const L = n.LogQueue.splice(0, f).filter((w) => (Number(w?.timestamp) || 0) > E);
          if (!L.length) continue;
          S = L.length, _ = 0;
          const T = L.map((w) => a.prepare(`INSERT INTO proxy_logs (timestamp, node_name, request_path, request_method, status_code, response_time, client_ip, inbound_colo, outbound_colo, user_agent, referer, category, error_detail, detail_json, created_at)
            SELECT ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?
            WHERE ? > COALESCE((
              SELECT CAST(json_extract(payload, '$.clearEpochMs') AS INTEGER)
              FROM ${jp}
              WHERE scope = ?
              LIMIT 1
            ), 0)`).bind(w.timestamp, w.nodeName, w.requestPath, w.requestMethod, w.statusCode, w.responseTime, w.clientIp, w.inboundColo, w.outboundColo, w.userAgent, w.referer, w.category, w.errorDetail, w.detailJson, w.createdAt, w.timestamp, g));
          let D = 0;
          for (; ; ) try {
            await a.batch(T);
            break;
          } catch (w) {
            if (D >= m) throw w;
            D += 1, y += 1, p > 0 && await ti(p * D);
          }
          c.statsReady === !0 && b(L), h += L.length, _ += L.length;
        }
        if (c.statsReady === !0 && A.size > 0) try {
          await e.upsertStatsHourlyBuckets(a, [...A.values()], { useBatch: !0 });
        } catch (L) {
          console.warn("upsertStatsHourlyBuckets failed", L);
        }
        const R = {
          schemaReady: !0,
          ftsReady: c.ftsReady === !0,
          statsReady: c.statsReady === !0,
          statsUtcOffsetMinutes: i,
          lastFlushAt: (/* @__PURE__ */ new Date()).toISOString(),
          lastFlushCount: h,
          lastFlushStatus: "success",
          lastFlushRetryCount: y,
          queueLengthAfterFlush: n.LogQueue.length,
          lastFlushError: null,
          lastFlushErrorAt: null,
          lastDroppedBatchSize: 0,
          lastFlushWrittenBeforeError: 0
        };
        h > 0 ? await e.bumpLogsRevision(t, R) : await e.patchOpsStatus(t, { log: R });
      } catch (E) {
        await e.patchOpsStatus(t, { log: {
          schemaReady: c.schemaReady === !0,
          ftsReady: c.ftsReady === !0,
          statsReady: c.statsReady === !0,
          statsUtcOffsetMinutes: i,
          lastFlushErrorAt: (/* @__PURE__ */ new Date()).toISOString(),
          lastFlushStatus: "failed",
          lastFlushError: E?.message || String(E),
          lastFlushRetryCount: y,
          lastDroppedBatchSize: Math.max(0, S - _),
          lastFlushWrittenBeforeError: h,
          queueLengthAfterFlush: n.LogQueue.length
        } }), console.log("Log flush failed, dropping batch.", E);
      }
    }
  };
  return r;
}
var Bn = "sys_status", Jt = "sys_locks", sa = "scheduled", Vs = Object.freeze({
  log: "ops_status:log",
  scheduled: "ops_status:scheduled",
  dnsIpPool: "ops_status:dns_ip_pool"
});
function Xp(o = {}) {
  const { bindingPort: e, schemaReadinessPort: r, statusPersistence: t } = o, a = {
    async getOpsStatusPayloadFromDb(n, s) {
      if (!n || !s) return null;
      const i = t.getOpsStatusPayloadCache(n), c = i?.get(String(s));
      if (c && Number(c.expiresAt) > k()) return c.payload;
      if (c && i.delete(String(s)), !await t.ensureSysStatusTable(n)) return null;
      try {
        const l = await n.prepare(`SELECT payload FROM ${Bn} WHERE scope = ? LIMIT 1`).bind(s).first(), d = l?.payload ? typeof l.payload == "string" ? JSON.parse(l.payload) : l.payload : null;
        return t.cacheOpsStatusPayload(n, s, d), d;
      } catch {
        return i?.delete(String(s)), null;
      }
    },
    async getOpsStatusPayloadFromDbStrict(n, s) {
      if (!n || !s) throw new Error("D1 status scope is not configured");
      if (!await t.ensureSysStatusTable(n)) {
        const c = /* @__PURE__ */ new Error("D1 sys_status table is unavailable");
        throw c.code = "D1_COMPATIBILITY_REQUIRED", c.status = 409, c;
      }
      const i = await n.prepare(`SELECT payload FROM ${Bn} WHERE scope = ? LIMIT 1`).bind(s).first();
      return i?.payload ? typeof i.payload == "string" ? JSON.parse(i.payload) : i.payload : null;
    },
    async putOpsStatusPayloadToDb(n, s, i, c) {
      return !n || !s || !i || typeof i != "object" || !await t.ensureSysStatusTable(n) ? !1 : (await n.prepare(`INSERT INTO ${Bn} (scope, payload, updated_at) VALUES (?, ?, ?)
        ON CONFLICT(scope) DO UPDATE SET payload = excluded.payload, updated_at = excluded.updated_at`).bind(s, JSON.stringify(i), Number(c) || k()).run(), t.cacheOpsStatusPayload(n, s, i), !0);
    },
    getOpsStatusSectionEntries() {
      return Object.entries(Vs);
    },
    async getOpsStatusRootFromStores(n) {
      const s = n?.db || null;
      if (!s) return {};
      const i = await a.getOpsStatusPayloadFromDb(s, t.getOpsStatusDbScope()), c = i && typeof i == "object" ? i : {}, l = t.getOpsStatusShadowPatch(s);
      return qe(c, l && typeof l == "object" ? l : {});
    },
    async getOpsStatusRoot(n) {
      return a.getOpsStatusRootFromStores(t.resolveOpsStatusStores(n));
    },
    async getOpsStatusSectionFromStores(n, s) {
      const i = n?.db || null;
      if (!s) return {};
      if (!Vs[s]) return {};
      const c = async () => {
        if (!i) return null;
        const f = await a.getOpsStatusPayloadFromDb(i, t.getOpsStatusDbScope(s));
        return f && typeof f == "object" ? f : null;
      }, [l, d] = await Promise.all([a.getOpsStatusRootFromStores(n), c()]), u = l && typeof l[s] == "object" ? l[s] : {};
      return qe(d && typeof d == "object" ? d : {}, u);
    },
    async getOpsStatusSection(n, s) {
      return a.getOpsStatusSectionFromStores(t.resolveOpsStatusStores(n), s);
    },
    async getOpsStatusFromStores(n) {
      const s = n?.db || null;
      if (!s) return {};
      const i = await a.getOpsStatusRootFromStores(n), c = i && typeof i == "object" ? { ...i } : {};
      let l = typeof c.updatedAt == "string" ? c.updatedAt : "";
      const d = await Promise.all(a.getOpsStatusSectionEntries().map(async ([u]) => {
        const f = await a.getOpsStatusPayloadFromDb(s, t.getOpsStatusDbScope(u)), m = i && typeof i[u] == "object" ? i[u] : {};
        return [u, qe(f && typeof f == "object" ? f : {}, m)];
      }));
      for (const [u, f] of d)
        !f || typeof f != "object" || Object.keys(f).length && (c[u] = qe(c[u], f), typeof f.updatedAt == "string" && f.updatedAt > l && (l = f.updatedAt));
      return l && (c.updatedAt = l), c;
    },
    async getOpsStatus(n) {
      return a.getOpsStatusFromStores(t.resolveOpsStatusStores(n));
    },
    getLogClearEpochMsFromStatus(n) {
      const s = Number(n?.clearEpochMs);
      return Number.isFinite(s) && s > 0 ? Math.floor(s) : 0;
    },
    async getLogClearEpochMs(n) {
      const s = await a.getOpsStatusSection(n, "log"), i = a.getLogClearEpochMsFromStatus(s), c = tr.get(t.resolveOpsStatusStores(n).db);
      return i > c.LogClearEpochMs && (c.LogClearEpochMs = i), i;
    },
    async patchOpsStatus(n, s, i = null) {
      const c = t.resolveOpsStatusStores(n);
      if (!c.db) return {};
      const l = s && typeof s == "object" ? s : {}, d = Object.keys(l);
      if (!d.length) return await a.getOpsStatusFromStores(c);
      const u = t.buildOpsStatusRootPatch(l);
      if (!Object.keys(u).length) return await a.getOpsStatusFromStores(c);
      const f = t.getOpsStatusShadowState(c.db);
      f && (f.pendingPatch = qe(f.pendingPatch && typeof f.pendingPatch == "object" ? f.pendingPatch : {}, u));
      const m = async () => await t.flushOpsStatusShadow(c, { patchKeys: d }), p = Promise.resolve(Je.OpsStatusWriteChain).catch((g) => {
        Ne("ops_status.write_chain.previous_failure", g, { patchKeys: d });
      }).then(m);
      return Je.OpsStatusWriteChain = p.catch((g) => {
        Ne("ops_status.write_chain.current_failure", g, { patchKeys: d });
      }), i ? i.waitUntil(p) : await p, p;
    },
    resolveScheduledLeaseStores(n) {
      return n && typeof n == "object" && !Array.isArray(n) && ("db" in n || "kv" in n) ? {
        db: n.db || null,
        kv: n.kv || null
      } : n && typeof n.prepare == "function" ? {
        db: n,
        kv: null
      } : n && typeof n.get == "function" ? {
        db: null,
        kv: n
      } : {
        db: e.getDB(n),
        kv: e.getKV(n)
      };
    },
    async ensureScheduledLeaseTable(n) {
      if (!n || typeof n.prepare != "function") return !1;
      if (r.isD1SchemaReadyCached(n, "scheduledLeaseTable")) return !0;
      let s = Z.ScheduledLeaseDbReady.get(n);
      s || (s = (async () => {
        try {
          return await n.prepare(`CREATE TABLE IF NOT EXISTS ${Jt} (scope TEXT PRIMARY KEY, token TEXT NOT NULL, owner TEXT NOT NULL, acquired_at INTEGER NOT NULL, renewed_at INTEGER, expires_at INTEGER NOT NULL)`).run(), await n.prepare(`CREATE INDEX IF NOT EXISTS idx_sys_locks_expires_at ON ${Jt} (expires_at DESC)`).run(), r.markD1SchemaReady(n, "scheduledLeaseTable"), !0;
        } catch (i) {
          return console.warn("scheduled lease table init failed", i), !1;
        }
      })(), Z.ScheduledLeaseDbReady.set(n, s));
      try {
        return await s;
      } finally {
        Z.ScheduledLeaseDbReady.get(n) === s && Z.ScheduledLeaseDbReady.delete(n);
      }
    },
    normalizeScheduledLeaseLock(n, s = "") {
      if (!n || typeof n != "object") return null;
      const i = String(n.token || "").trim();
      if (!i) return null;
      const c = String(n.owner || "scheduled").trim() || "scheduled", l = Number(n.expiresAt ?? n.expires_at ?? 0), d = Number(n.acquiredAtMs ?? n.acquired_at), u = Number(n.renewedAtMs ?? n.renewed_at);
      return {
        token: i,
        owner: c,
        acquiredAt: typeof n.acquiredAt == "string" ? n.acquiredAt : Number.isFinite(d) && d > 0 ? new Date(d).toISOString() : "",
        renewedAt: typeof n.renewedAt == "string" ? n.renewedAt : Number.isFinite(u) && u > 0 ? new Date(u).toISOString() : "",
        expiresAt: Number.isFinite(l) ? l : 0,
        backend: s || String(n.backend || "").trim() || ""
      };
    },
    async getScheduledLeaseLockFromDb(n, s = sa) {
      if (!n || !await a.ensureScheduledLeaseTable(n)) return null;
      try {
        const i = await n.prepare(`SELECT token, owner, acquired_at, renewed_at, expires_at FROM ${Jt} WHERE scope = ? LIMIT 1`).bind(String(s || sa)).first();
        return a.normalizeScheduledLeaseLock(i, "d1");
      } catch {
        return null;
      }
    },
    async tryAcquireScheduledLeaseWithDb(n, s = {}) {
      if (!n) return {
        acquired: !1,
        reason: "db_unavailable",
        backend: "d1"
      };
      if (!await a.ensureScheduledLeaseTable(n)) return {
        acquired: !1,
        reason: "db_init_failed",
        backend: "d1"
      };
      const i = k(), c = Math.max(v.Defaults.ScheduledLeaseMinMs, Number(s.leaseMs) || v.Defaults.ScheduledLeaseMs), l = String(s.token || `${i}-${Math.random().toString(36).slice(2, 10)}`), d = String(s.owner || "scheduled"), u = String(s.scope || sa), f = i + c;
      try {
        await n.prepare(`INSERT INTO ${Jt} (scope, token, owner, acquired_at, renewed_at, expires_at)
          VALUES (?, ?, ?, ?, NULL, ?)
          ON CONFLICT(scope) DO UPDATE SET
            token = excluded.token,
            owner = excluded.owner,
            acquired_at = excluded.acquired_at,
            renewed_at = NULL,
            expires_at = excluded.expires_at
          WHERE ${Jt}.expires_at <= ?`).bind(u, l, d, i, f, i).run();
        const m = await a.getScheduledLeaseLockFromDb(n, u);
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
    async tryAcquireScheduledLease(n, s = {}) {
      const i = a.resolveScheduledLeaseStores(n);
      return i.db ? await a.tryAcquireScheduledLeaseWithDb(i.db, s) : {
        acquired: !1,
        reason: "db_not_configured",
        backend: "d1"
      };
    },
    async renewScheduledLeaseWithDb(n, s, i, c = {}) {
      if (!n || !s || !await a.ensureScheduledLeaseTable(n)) return null;
      const l = k(), d = Math.max(v.Defaults.ScheduledLeaseMinMs, Number(i) || v.Defaults.ScheduledLeaseMs), u = String(c.scope || sa);
      try {
        await n.prepare(`UPDATE ${Jt}
          SET owner = ?, renewed_at = ?, expires_at = ?
          WHERE scope = ? AND token = ?`).bind(String(c.owner || "scheduled"), l, l + d, u, String(s)).run();
        const f = await a.getScheduledLeaseLockFromDb(n, u);
        return f && f.token === String(s) ? f : null;
      } catch {
        return null;
      }
    },
    async renewScheduledLease(n, s, i, c = {}) {
      const l = a.resolveScheduledLeaseStores(n);
      return l.db ? await a.renewScheduledLeaseWithDb(l.db, s, i, c) : null;
    },
    async releaseScheduledLeaseWithDb(n, s, i = {}) {
      if (!n || !s || !await a.ensureScheduledLeaseTable(n)) return !1;
      const c = String(i.scope || sa);
      try {
        return await n.prepare(`DELETE FROM ${Jt} WHERE scope = ? AND token = ?`).bind(c, String(s)).run(), !0;
      } catch {
        return !1;
      }
    },
    async releaseScheduledLease(n, s, i = {}) {
      const c = a.resolveScheduledLeaseStores(n);
      return c.db ? await a.releaseScheduledLeaseWithDb(c.db, s, i) : !1;
    }
  };
  return a;
}
function lr(o, e = "") {
  const r = String(o || "request_aborted").trim() || "request_aborted", t = new Error(e ? `${r}_${e}` : r);
  return r === "client_aborted" ? t.code = "CLIENT_ABORTED" : r === "downstream_cancelled" ? t.code = "DOWNSTREAM_CANCELLED" : r === "stream_idle_timeout" ? t.code = "STREAM_IDLE_TIMEOUT" : t.code = "REQUEST_ABORTED", t;
}
function ol(o) {
  const e = new AbortController();
  let r = "", t = null, a = null, n = null;
  const s = /* @__PURE__ */ new Set(), i = (l) => {
    if (s.size)
      for (const d of [...s]) try {
        d(l);
      } catch {
      }
  }, c = (l = "request_aborted") => {
    const d = String(l || "request_aborted").trim() || "request_aborted";
    if (r || (r = d), a && !a.signal.aborted) try {
      a.abort(r);
    } catch {
    }
    if (!e.signal.aborted) try {
      e.abort(r);
    } catch {
    }
    i(r);
  };
  if (o && typeof o.addEventListener == "function") {
    const l = () => c("client_aborted");
    o.aborted ? l() : (o.addEventListener("abort", l, { once: !0 }), t = () => o.removeEventListener("abort", l));
  }
  return {
    signal: e.signal,
    abort: c,
    isAborted() {
      return e.signal.aborted === !0 || !!r;
    },
    getAbortReason() {
      return r;
    },
    onAbort(l) {
      if (typeof l != "function") return () => {
      };
      if (r || e.signal.aborted) {
        try {
          l(r || "request_aborted");
        } catch {
        }
        return () => {
        };
      }
      return s.add(l), () => s.delete(l);
    },
    setActiveFetchController(l) {
      if (n && (n(), n = null), a = l || null, !l) return () => {
      };
      const d = () => {
        try {
          l.abort(r || "request_aborted");
        } catch {
        }
      };
      return r || e.signal.aborted ? d() : e.signal.addEventListener("abort", d, { once: !0 }), n = () => {
        e.signal.removeEventListener("abort", d), a === l && (a = null);
      }, () => {
        if (!n) return;
        const u = n;
        n = null, u();
      };
    },
    dispose() {
      if (t && (t(), t = null), n) {
        const l = n;
        n = null, l();
      } else a = null;
      s.clear();
    }
  };
}
function Yp(o = []) {
  const e = new AbortController(), r = [], t = (a = "linked_abort") => {
    if (!e.signal.aborted)
      try {
        e.abort(a);
      } catch {
      }
  };
  for (const a of Array.isArray(o) ? o : [o]) {
    if (!a || typeof a.addEventListener != "function") continue;
    const n = () => t(a.reason || "linked_abort");
    if (a.aborted) {
      n();
      continue;
    }
    a.addEventListener("abort", n, { once: !0 }), r.push(() => a.removeEventListener("abort", n));
  }
  return {
    signal: e.signal,
    abort(a = "linked_abort") {
      t(a);
    },
    dispose() {
      for (const a of r.splice(0)) try {
        a();
      } catch {
      }
    }
  };
}
async function Jp(o, e, r = null) {
  return await new Promise((t, a) => {
    let n = !1, s = null, i = () => {
    };
    const c = (d) => {
      if (!n) {
        n = !0, s !== null && clearTimeout(s);
        try {
          i();
        } catch {
        }
        t(d);
      }
    }, l = (d) => {
      if (!n) {
        n = !0, s !== null && clearTimeout(s);
        try {
          i();
        } catch {
        }
        a(d);
      }
    };
    r?.onAbort && (i = r.onAbort((d) => l(lr(d)))), Number(e) > 0 && (s = setTimeout(() => c({
      timedOut: !0,
      value: null
    }), Math.max(0, Number(e) || 0))), Promise.resolve(o).then((d) => c({
      timedOut: !1,
      value: d
    }), l);
  });
}
async function Qp(o, e = null) {
  const r = Math.max(0, Number(o) || 0);
  if (!(r <= 0))
    return await new Promise((t, a) => {
      let n = !1, s = () => {
      };
      const i = setTimeout(() => {
        if (!n) {
          n = !0;
          try {
            s();
          } catch {
          }
          t();
        }
      }, r);
      e?.onAbort && (s = e.onAbort((c) => {
        n || (n = !0, clearTimeout(i), a(lr(c)));
      }));
    });
}
function Zp(o = {}, e = {}) {
  return {
    async tryServeMetadataCache(r) {
      if (!r.metadataCache || !r.metadataCacheKey) return null;
      try {
        const t = bp(r.metadataCacheKey, r.request);
        if (!t) return null;
        const a = await r.metadataCache.match(t);
        if (!a) return null;
        const n = e.buildProxyResponseHeaders(a, r.request, r.dynamicCors, r.finalOrigin, r.requestTraits, {
          enableH3: r.enableH3,
          forceH1: r.forceH1,
          imageCacheMaxAge: r.imageCacheMaxAge
        });
        return e.recordAccessLog(r, {
          statusCode: a.status,
          category: e.classifyProxyLogCategory(r.requestTraits),
          errorDetail: e.appendLogDiagnosticDetail(e.extractProxyErrorDetail(a), e.buildStreamDiagnosticDetail(r, a, {
            flow: "cache_hit",
            source: "worker_cache",
            cacheStatus: "WORKER_CACHE"
          })),
          detailJson: e.buildStructuredLogDetail(r, { statusCode: a.status }, {
            deliveryMode: "proxy",
            redirectMode: "worker_cache",
            decisionReason: "worker_cache_hit",
            protocolFailureReason: Number(a.status) >= 400 ? e.classifyProtocolFailureReason(e.extractProxyErrorDetail(a) || a.statusText || "", { upstreamStatus: a.status }) : null,
            upstreamStatus: a.status
          }),
          outboundColo: ""
        }), new Response(a.body, {
          status: a.status,
          statusText: a.statusText,
          headers: n
        });
      } catch {
        return null;
      }
    },
    async resolveEarlyResponse(r) {
      if (r.requestMethod === "OPTIONS") return e.buildOptionsResponse(r);
      const t = e.evaluateFirewall(r.currentConfig, r.clientIp, r.country, r.finalOrigin);
      if (t) return t;
      const a = e.applyRateLimit(r.currentConfig, r.clientIp, r.requestTraits, r.startTime, r.finalOrigin);
      return a || await e.tryServeMetadataCache(r);
    },
    shouldGuardClientDirectForRequest(r = {}, t = {}) {
      return String(t?.action || "").trim().toUpperCase() !== "DIRECT" || String(t?.reason || "").trim() === "stream_body_direct" ? !1 : r?.isBigStream === !0 || r?.isManifest === !0 || r?.isSegment === !0;
    },
    enforceStrictClientDirectAuthPolicy(r, t, a, n = {}) {
      if (!e.shouldGuardClientDirectForRequest(r?.requestTraits, t)) return t;
      const s = a?.clientRedirectAuthPolicy || wa(a?.newHeaders);
      return a && typeof a == "object" && (a.clientRedirectAuthPolicy = s), r.directRedirectAuthReason = s.reason || "", t;
    },
    createDirectTransportIncompatibleError(r, t = {}) {
      const a = /* @__PURE__ */ new Error("direct_transport_incompatible");
      return a.code = "DIRECT_TRANSPORT_INCOMPATIBLE", a.redirectTrace = t.redirectTrace || r?.redirectTrace || null, a;
    },
    async maybeProbeEntryDirectRangeRedirectResponse(r, t, a, n) {
      if (typeof a != "function") return null;
      const s = e.resolveEntryDirectTargetUrl(r, t);
      let i = null, c = () => {
      };
      const l = ol(r?.request?.signal);
      try {
        const h = await e.performFetchWithTimeout(s, a, {
          method: "HEAD",
          timeoutMs: r.upstreamTimeoutMs,
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
      const d = Ca(i.headers.get("Location"), s);
      if (!d) {
        try {
          i.body?.cancel?.();
        } catch {
        }
        return c(), l.dispose(), null;
      }
      const u = r.playbackRelayTargetUrl instanceof URL ? r.playbackRelayTargetUrl : t, f = xa(d, u).proxyPath || (d.origin === u?.origin ? d.pathname : null);
      if (f && ya(f)) {
        const h = e.createRedirectTrace(r.requestUrl);
        e.recordRedirectTraceHop(h, i.status, d, {
          isSameOriginRedirect: !0,
          traceAction: "blocked_web"
        }), e.finalizeRedirectTrace(h, {
          terminalMode: "web_proxy_disabled",
          finalStatus: 404,
          finalHost: d.hostname || ""
        }), r.redirectTrace = h, r.defaultOutboundColo = Ja(i) || "";
        try {
          i.body?.cancel?.();
        } catch {
        }
        return c(), l.dispose(), e.recordAccessLog(r, e.buildDirectAccessLogPayload(r, 404, r.defaultOutboundColo, {
          redirectTrace: h,
          decisionReason: "web_proxy_disabled"
        })), wn(r.requestMethod, r.dynamicCors);
      }
      const m = e.buildClientVisibleRedirectUrl(d, r.playbackRelayTargetUrl || t, r.nodeName, r.nodeKey, r.requestUrl, { entryMode: r.entryMode }) || d, p = e.createRedirectTrace(r.requestUrl);
      e.recordRedirectTraceHop(p, i.status, d, {
        isSameOriginRedirect: d.origin === s.origin,
        traceAction: "direct",
        dataPlaneMode: n?.dataPlaneMode
      }), e.finalizeRedirectTrace(p, {
        terminalMode: "client_redirect",
        finalStatus: i.status,
        finalHost: String(d.hostname || "").trim().toLowerCase()
      }), r.redirectTrace = p, r.defaultOutboundColo = Ja(i) || "";
      const g = e.buildProxyResponseHeaders(i, r.request, r.dynamicCors, r.finalOrigin, r.requestTraits, {
        enableH3: r.enableH3,
        forceH1: r.forceH1,
        imageCacheMaxAge: r.imageCacheMaxAge
      });
      return e.applyProxyRedirectHeaders(g, i, t, r.nodeName, r.nodeKey, m, s, {
        linkVariant: r.linkVariant,
        entryMode: r.entryMode
      }), e.recordAccessLog(r, e.buildDirectAccessLogPayload(r, i.status, r.defaultOutboundColo || "", {
        directRedirectUrl: m,
        redirectTrace: p,
        decisionReason: String(n?.reason || n?.traceLabel || "").trim()
      })), c(), l.dispose(), new Response(r.requestMethod === "HEAD" ? null : i.body, {
        status: i.status,
        statusText: i.statusText,
        headers: g
      });
    },
    async maybeBuildEntryDirectResponse(r, t, a = null, n = null) {
      if (r?.forceWorkerProxy === !0) return null;
      const s = e.enforceStrictClientDirectAuthPolicy(r, r.entryRoutingDecision, a, {
        redirectStatus: r.entryRoutingDecision?.redirectStatus || 307,
        redirectMethod: r.requestMethod
      });
      if (r.entryRoutingDecision = s, s?.phase !== "entry" || s?.action !== "DIRECT") return null;
      const i = (tt(t[0]) ? t[0] : null)?.targetUrl || null;
      if (!(i instanceof URL)) return null;
      const c = a?.clientRedirectAuthPolicy || wa(a?.newHeaders || r.request.headers);
      if (a && typeof a == "object" && (a.clientRedirectAuthPolicy = c), r?.requestTraits?.isBigStream === !0 && r?.requestTraits?.rangeHeader && c.hasQueryAuth !== !0 && c.hasHeaderAuth !== !0 && c.hasCookieAuth !== !0) {
        const f = await e.maybeProbeEntryDirectRangeRedirectResponse(r, i, n, s);
        if (f) return f;
      }
      if (c.canDirect !== !0)
        throw r.directRedirectAuthReason = c.reason || "direct_transport_incompatible", e.createDirectTransportIncompatibleError(r);
      const l = nl(e.resolveEntryDirectTargetUrl(r, i), c), d = new Response(null, {
        status: 307,
        statusText: "Temporary Redirect"
      }), u = e.buildProxyResponseHeaders(d, r.request, r.dynamicCors, r.finalOrigin, r.requestTraits, {
        enableH3: r.enableH3,
        forceH1: r.forceH1,
        imageCacheMaxAge: r.imageCacheMaxAge
      });
      return e.applyProxyRedirectHeaders(u, d, i, r.nodeName, r.nodeKey, l, l, {
        linkVariant: r.linkVariant,
        entryMode: r.entryMode
      }), e.recordAccessLog(r, e.buildDirectAccessLogPayload(r, 307, "")), new Response(null, {
        status: 307,
        statusText: "Temporary Redirect",
        headers: u
      });
    },
    createBuildFetchOptions(r, t) {
      const { request: a, requestMethod: n, requestTraits: s, protocolFallback: i } = r, { newHeaders: c, adminCustomHeaders: l, preparedBody: d, preparedBodyMode: u } = t, f = t?.transportTemplate || null, m = Array.isArray(f?.baseHeaderEntries) ? f.baseHeaderEntries : [...c.entries()], p = f ? f.adminCustomHasOrigin === !0 : l.has("origin"), g = f ? f.adminCustomHasReferer === !0 : l.has("referer"), h = f ? f.hasOriginHeader === !0 : c.has("Origin"), y = f ? f.hasRefererHeader === !0 : c.has("Referer"), S = String(f?.refererOrigin || "").trim(), _ = String(f?.refererPathAndSearch || "/") || "/", A = f ? f.isHotMediaRequest === !0 : s.isBigStream === !0 || s.isManifest === !0 || s.isSegment === !0;
      return async (b, E = {}) => {
        const R = new Headers(m), L = (b instanceof URL ? b : new URL(String(b))).origin, T = E.method || n, D = E.bodyMode || u, w = E.body !== void 0 ? E.body : d, M = E.isExternalRedirect === !0, x = E.protocolFallbackRetry === !0, C = E.stripAuthOnProtocolFallback === !0;
        if (h && !p && R.set("Origin", L), y && !g)
          if (f) S ? S !== L && R.set("Referer", `${L}${_}`) : R.set("Referer", L + "/");
          else try {
            const W = new URL(R.get("Referer") || "");
            if (W.origin !== L) {
              const O = new URL(`${W.pathname || "/"}${W.search || ""}`, L);
              R.set("Referer", O.toString());
            }
          } catch {
            R.set("Referer", L + "/");
          }
        M && (A || (Ws(R), R.delete("Cookie")), p || R.delete("Origin"), g || R.delete("Referer")), x && i && (C && Ws(R), R.set("Connection", "keep-alive")), (s.isBigStream || s.isSmartStrmMedia || s.isManifest || s.isSegment) && s.rangeHeader && !R.has("Range") && R.set("Range", s.rangeHeader), (s.isBigStream || s.isSmartStrmMedia || s.isManifest || s.isSegment) && s.ifRangeHeader && !R.has("If-Range") && R.set("If-Range", s.ifRangeHeader), (T === "GET" || T === "HEAD") && R.delete("Content-Length");
        const F = {
          method: T,
          headers: R,
          redirect: "manual"
        };
        return s.isMetadataCacheable && (F.cache = "no-store"), T !== "GET" && T !== "HEAD" && (D === "buffered" && w !== null && w !== void 0 ? F.body = w.slice(0) : D === "stream" && (F.body = w)), F;
      };
    }
  };
}
function eg(o = {}, e = {}) {
  return {
    async executeUpstreamFlow(r, t, a) {
      const n = /* @__PURE__ */ new Set([
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
      ]), s = r.requestTraits?.isSmartStrmMedia === !0 ? {
        mode: "proxy",
        forceVideoDirect: !1,
        forceVideoProxy: !1
      } : fu(r.node, r.currentConfig), i = e.createRedirectTrace(r.requestUrl), c = du(r.requestMethod, r.requestTraits, { playbackRelayTargetUrl: r.playbackRelayTargetUrl });
      r.redirectTrace = i;
      const l = r.playbackRelayTargetUrl ? await e.fetchAbsoluteWithRetryLoop({
        execution: r,
        absoluteUrl: r.playbackRelayTargetUrl,
        buildFetchOptions: a,
        fetchOptions: {
          method: r.requestMethod,
          bodyMode: t.preparedBodyMode,
          body: t.preparedBody,
          isExternalRedirect: !0
        },
        retryableStatuses: n,
        protocolFallback: r.protocolFallback,
        preparedBodyMode: t.preparedBodyMode,
        allowAutomaticRetry: t.allowAutomaticRetry,
        stripAuthOnProtocolFallback: r.requestTraits.canStripAuthOnProtocolFallback,
        upstreamTimeoutMs: r.upstreamTimeoutMs,
        maxExtraAttempts: t.allowAutomaticRetry ? r.upstreamRetryAttempts : 0,
        isRetry: !1,
        requestLifecycle: r.requestLifecycle
      }) : await e.fetchUpstreamWithRetryLoop({
        execution: r,
        retryTargetRecords: t.retryTargetRecords,
        proxyPath: r.proxyPath,
        requestUrl: r.requestUrl,
        buildFetchOptions: a,
        retryableStatuses: n,
        protocolFallback: r.protocolFallback,
        preparedBodyMode: t.preparedBodyMode,
        allowAutomaticRetry: t.allowAutomaticRetry,
        stripAuthOnProtocolFallback: r.requestTraits.canStripAuthOnProtocolFallback,
        upstreamTimeoutMs: r.upstreamTimeoutMs,
        maxExtraAttempts: t.allowAutomaticRetry ? r.upstreamRetryAttempts : 0,
        isRetry: !1,
        requestLifecycle: r.requestLifecycle,
        segmentFastPathEnabled: c
      });
      let d = l.response, u = l.targetRecord || null, f = u?.targetUrl || (r.playbackRelayTargetUrl instanceof URL ? new URL(r.playbackRelayTargetUrl.toString()) : null), m = l.finalUrl, p = l.releaseFetchController, g = l.protocolFallbackRetry === !0, h = !1, y = null, S = 0, _ = r.requestMethod, A = t.preparedBodyMode, b = t.preparedBody;
      for (r.defaultOutboundColo = Ja(d) || ""; d.status >= 300 && d.status < 400 && S < 8; ) {
        const E = Number(d.status) || 0, R = Ca(d.headers.get("Location"), m || f);
        if (!R) {
          e.finalizeRedirectTrace(i, {
            terminalMode: "invalid_redirect_target",
            finalStatus: E,
            finalHost: m?.hostname || f?.hostname || ""
          });
          break;
        }
        const L = xa(R, f).proxyPath || (R.origin === f?.origin ? R.pathname : null);
        if (L && ya(L)) {
          e.recordRedirectTraceHop(i, E, R, {
            isSameOriginRedirect: !0,
            traceAction: "blocked_web"
          }), e.finalizeRedirectTrace(i, {
            terminalMode: "web_proxy_disabled",
            finalStatus: 404,
            finalHost: R.hostname || ""
          });
          try {
            d.body?.cancel?.();
          } catch {
          }
          try {
            p?.();
          } catch {
          }
          d = wn(r.requestMethod, r.dynamicCors), m = R, p = null, S += 1;
          break;
        }
        const T = e.enforceStrictClientDirectAuthPolicy(r, e.getRoutingDecision({
          phase: "redirect",
          nextUrl: R,
          activeTargetBase: f,
          redirectMethod: _,
          redirectBodyMode: A,
          forceWorkerProxy: r.forceWorkerProxy === !0,
          forceWorkerProxyReason: r.forceWorkerProxyReason,
          currentStatus: d.status,
          policy: {
            forceVideoDirect: s.forceVideoDirect === !0,
            forceVideoProxy: s.forceVideoProxy === !0,
            currentStatus: d.status
          },
          routingDecisionMode: r.routingDecisionMode
        }), t, {
          redirectStatus: d.status,
          redirectMethod: _,
          redirectBodyMode: A
        });
        if (e.recordRedirectTraceHop(i, E, R, T), T.action === "DIRECT") {
          const C = t.clientRedirectAuthPolicy || wa(t.newHeaders);
          if (C.canDirect !== !0)
            throw r.directRedirectAuthReason = C.reason || "direct_transport_incompatible", e.finalizeRedirectTrace(i, {
              terminalMode: "direct_incompatible",
              finalStatus: 409,
              finalHost: R.hostname || ""
            }), e.createDirectTransportIncompatibleError(r, { redirectTrace: i });
          const F = e.buildClientVisibleRedirectUrl(R, f, r.nodeName, r.nodeKey, r.requestUrl, {
            preserveWorkerProxy: T.preserveWorkerProxy === !0,
            linkVariant: r.linkVariant,
            entryMode: r.entryMode
          }) || R;
          y = T.preserveWorkerProxy === !0 ? F : nl(F, t.clientRedirectAuthPolicy || t.newHeaders), e.finalizeRedirectTrace(i, {
            terminalMode: "client_redirect",
            finalStatus: E,
            finalHost: y.hostname || R.hostname || ""
          });
          break;
        }
        const D = T.nextMethod, w = T.nextBodyMode, M = w === "none" ? null : b;
        try {
          d.body?.cancel?.();
        } catch {
        }
        try {
          p?.();
        } catch {
        }
        let x;
        try {
          x = await e.fetchAbsoluteWithRetryLoop({
            absoluteUrl: R,
            buildFetchOptions: a,
            fetchOptions: {
              method: D,
              bodyMode: w,
              body: M,
              isExternalRedirect: !T.isSameOriginRedirect
            },
            retryableStatuses: n,
            protocolFallback: r.protocolFallback,
            preparedBodyMode: w,
            allowAutomaticRetry: t.allowAutomaticRetry,
            stripAuthOnProtocolFallback: r.requestTraits.canStripAuthOnProtocolFallback,
            upstreamTimeoutMs: r.upstreamTimeoutMs,
            maxExtraAttempts: t.allowAutomaticRetry ? r.upstreamRetryAttempts : 0,
            isRetry: !1,
            requestLifecycle: r.requestLifecycle
          });
        } catch (C) {
          throw e.finalizeRedirectTrace(i, {
            terminalMode: "proxy_error_after_redirect",
            finalStatus: E,
            finalHost: R.hostname || ""
          }), C && typeof C == "object" && (C.redirectTrace = i), C;
        }
        d = x.response, m = x.finalUrl, p = x.releaseFetchController, g = g || x.protocolFallbackRetry === !0, _ = D, A = w, b = M, r.defaultOutboundColo = Ja(d) || "", T.isSameOriginRedirect || (h = !0), S += 1;
      }
      if (!i.terminalMode && (i.hops.length > 0 || i.finalStatus > 0)) {
        const E = Number(d?.status) || 0;
        if (E >= 300 && E < 400) {
          const R = Ca(d.headers.get("Location"), m || f);
          e.finalizeRedirectTrace(i, {
            terminalMode: S >= 8 ? "redirect_limit" : "upstream_redirect_passthrough",
            finalStatus: E,
            finalHost: R?.hostname || m?.hostname || f?.hostname || ""
          });
        } else e.finalizeRedirectTrace(i, {
          terminalMode: i.hops.length > 0 ? "proxied_follow" : "no_redirect",
          finalStatus: E,
          finalHost: m?.hostname || f?.hostname || ""
        });
      }
      return {
        response: d,
        finalUrl: m,
        activeTargetRecord: u,
        activeTargetBase: f,
        releaseFetchController: p,
        proxiedExternalRedirect: h,
        directRedirectUrl: y,
        protocolFallbackRetry: g,
        redirectTrace: i
      };
    },
    async buildSuccessResponse(r, t, a, n = null) {
      let s = await e.guardApiResponseMime(r, a);
      r?.requestTraits?.isPlaybackInfoRequest === !0 && (s = await e.guardPlaybackInfoResponseContract(r, s), er(s.playbackInfoRepresentation) && (s = await e.maybeRewritePlaybackInfoResponse(r, s)));
      const i = String(s.redirectTrace?.terminalMode || r?.redirectTrace?.terminalMode || ""), c = r?.playbackAbsoluteFallbackEligible === !0 && !s.directRedirectUrl && i !== "web_proxy_disabled" && Number(s.response.status) === 404;
      c && (r.playbackFallback = "relative_307");
      const l = e.shouldLogDirectAccess(r, { directRedirectUrl: s.directRedirectUrl }), d = l ? "" : e.buildRedirectDiagnosticDetail(s.redirectTrace || r.redirectTrace), u = s.response.status, f = c ? 307 : s.directRedirectUrl && Number(s.redirectTrace?.finalStatus) || u, m = c ? "Temporary Redirect" : s.response.statusText;
      e.markFailoverBusinessSuccess(r, s.activeTargetRecord, { status: u });
      const p = e.buildProxyResponseHeaders(s.response, r.request, r.dynamicCors, r.finalOrigin, r.requestTraits, {
        enableH3: r.enableH3,
        forceH1: r.forceH1,
        proxiedExternalRedirect: s.proxiedExternalRedirect,
        imageCacheMaxAge: r.imageCacheMaxAge
      });
      e.applyProxyRedirectHeaders(p, s.response, s.activeTargetBase, r.nodeName, r.nodeKey, s.directRedirectUrl, s.finalUrl, {
        linkVariant: r.linkVariant,
        entryMode: r.entryMode
      }), c && (Hc(p), p.set("Location", r.playbackAbsoluteFallbackLocation || "/"), p.set("Cache-Control", "no-store"));
      const g = !c && e.shouldManageProxyResponseBody(r, s), h = r.defaultOutboundColo || "", y = e.buildRuntimeDiagnosticDetail(r), S = l ? e.buildDirectAccessDiagnosticDetail(r, {
        directRedirectUrl: s.directRedirectUrl,
        redirectTrace: s.redirectTrace || r.redirectTrace
      }) : e.appendLogDiagnosticDetail(e.appendLogDiagnosticDetail(e.extractProxyErrorDetail(s.response), e.buildStreamDiagnosticDetail(r, s.response, {
        flow: g ? "managed" : "passthrough",
        source: "upstream",
        upstreamHost: s.finalUrl?.hostname || s.activeTargetBase?.hostname || "",
        protocolFallbackRetry: s.protocolFallbackRetry === !0,
        idleTimeoutMs: g ? e.resolveResponseStreamIdleTimeoutMs(r.requestTraits, r.upstreamTimeoutMs) : 0
      })), e.appendLogDiagnosticDetail(y, d)), _ = l ? e.buildDirectAccessLogPayload(r, f, h, {
        directRedirectUrl: s.directRedirectUrl,
        redirectTrace: s.redirectTrace || r.redirectTrace
      }) : {
        statusCode: c ? f : u,
        category: e.classifyProxyLogCategory(r.requestTraits),
        errorDetail: S,
        detailJson: e.buildStructuredLogDetail(r, { statusCode: c ? f : u }, {
          transport: null,
          deliveryMode: "proxy",
          redirectTrace: s.redirectTrace || r.redirectTrace,
          redirectMode: c ? "playback_relative_fallback" : s.redirectTrace?.terminalMode || "proxied_follow",
          redirectUrl: s.finalUrl,
          decisionReason: c ? "playback_relative_fallback" : s.redirectTrace?.terminalMode || "proxied_follow",
          protocolFailureReason: s.protocolFallbackRetry === !0 ? e.classifyProtocolFailureReason("protocol_fallback", {
            upstreamStatus: u,
            protocolFallbackRetry: !0
          }) : Number(u) >= 400 ? e.classifyProtocolFailureReason(S || s.response.statusText || "", {
            upstreamStatus: u,
            protocolFallbackRetry: s.protocolFallbackRetry === !0
          }) : null,
          protocolFallbackRetry: s.protocolFallbackRetry === !0,
          playbackInfoCache: r.playbackInfoCacheState,
          playbackInfoCacheTtlSec: r.playbackInfoCacheTtlSec,
          progressRelayMode: r.progressForwardMode,
          progressIntervalSec: r.videoProgressForwardIntervalSec,
          upstreamHost: s.finalUrl?.hostname || s.activeTargetBase?.hostname || "",
          upstreamStatus: u
        }),
        outboundColo: h
      };
      if (g || e.recordAccessLog(r, _), r.metadataCacheKey && r.ctx && s.response.status === 200) {
        const E = s.response.clone();
        r.ctx.waitUntil(e.storeMetadataCache(r.metadataCacheKey, E, r.requestTraits, {
          sourceUrl: r.requestUrl,
          prewarmCacheTtl: r.requestTraits.prewarmCacheTtl,
          imageCacheMaxAge: r.imageCacheMaxAge,
          proxiedExternalRedirect: s.proxiedExternalRedirect === !0
        }));
      }
      r.requestTraits.isPlaybackInfoRequest === !0 && await e.storePlaybackInfoResponseCache(r, s.response, null, s.playbackInfoRepresentation), e.scheduleMetadataPrewarmResponse(r.request, s.response, r.requestTraits, s.activeTargetBase, t, r.nodeName, r.nodeKey, r.requestUrl, r.ctx, {
        proxyPath: r.proxyPath,
        prewarmCacheTtl: r.requestTraits.prewarmCacheTtl,
        imageCacheMaxAge: r.imageCacheMaxAge,
        nodeCacheRevision: r.nodeDerivedCacheRevision,
        entryMode: r.entryMode,
        identityPartition: r.metadataCacheIdentityPartition
      }), e.maybeScheduleBackgroundFailoverRefresh(r, s);
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
        return r.requestLifecycle?.dispose?.(), new Response(null, {
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
        r.requestLifecycle?.dispose?.();
        const E = {
          status: 101,
          statusText: s.response.statusText,
          headers: p,
          webSocket: A.webSocket
        };
        return new Response(null, E);
      }
      let b;
      return g ? b = e.buildManagedProxyResponseBody(r, s, _) : b = e.buildPassthroughProxyResponseBody(r, s), new Response(b, {
        status: f,
        statusText: m,
        headers: p
      });
    }
  };
}
function tg(o = {}, e = {}) {
  return {
    buildErrorResponse(r, t) {
      const a = t?.message || String(t || "网关或 CF Workers 内部崩溃"), n = String(t?.code || "").toUpperCase(), s = e.buildRedirectDiagnosticDetail(t?.redirectTrace || r.redirectTrace), i = e.buildRuntimeDiagnosticDetail(r);
      let c = 502, l = "Bad Gateway", d = {
        error: "Bad Gateway",
        code: 502,
        message: "All proxy attempts failed."
      };
      n === "UPSTREAM_TIMEOUT" || n === "STREAM_IDLE_TIMEOUT" ? (c = 504, l = "Gateway Timeout", d = {
        error: "Gateway Timeout",
        code: 504,
        message: "Upstream response timed out."
      }) : n === "DIRECT_TRANSPORT_INCOMPATIBLE" ? (c = 409, l = "Conflict", d = {
        error: "Conflict",
        code: 409,
        message: "DIRECT mode is strict and will not fall back to proxy when custom auth headers or cookies are required."
      }) : (n === "CLIENT_ABORTED" || n === "DOWNSTREAM_CANCELLED" || n === "REQUEST_ABORTED") && (c = 499, l = "Client Closed Request", d = {
        error: "Client Closed Request",
        code: 499,
        message: "Client closed request."
      });
      try {
        r.requestLifecycle?.abort?.(n ? n.toLowerCase() : "proxy_error");
      } catch {
      }
      r.requestLifecycle?.dispose?.(), n === "DIRECT_TRANSPORT_INCOMPATIBLE" ? e.recordAccessLog(r, e.buildDirectAccessLogPayload(r, c, r.defaultOutboundColo || "", { redirectTrace: t?.redirectTrace || r.redirectTrace })) : e.recordAccessLog(r, {
        statusCode: c,
        category: c === 499 ? e.classifyProxyLogCategory(r.requestTraits || {}) : "error",
        errorDetail: e.appendLogDiagnosticDetail(e.appendLogDiagnosticDetail(a, e.buildStreamDiagnosticDetail(r, null, {
          flow: "proxy_error",
          source: "upstream_pending",
          upstreamHost: t?.lastFinalUrl?.hostname || t?.lastTargetBase?.hostname || "",
          idleTimeoutMs: e.resolveResponseStreamIdleTimeoutMs(r.requestTraits || {}, r.upstreamTimeoutMs)
        })), e.appendLogDiagnosticDetail(i, s)),
        detailJson: e.buildStructuredLogDetail(r, { statusCode: c }, {
          deliveryMode: "proxy",
          redirectTrace: t?.redirectTrace || r.redirectTrace,
          redirectMode: "proxy_error",
          redirectUrl: t?.lastFinalUrl,
          decisionReason: n || "proxy_error",
          protocolFailureReason: e.classifyProtocolFailureReason(t, {
            errorCode: n,
            message: a,
            protocolFallbackRetry: !1,
            upstreamStatus: c
          }),
          playbackInfoCache: r.playbackInfoCacheState,
          playbackInfoCacheTtlSec: r.playbackInfoCacheTtlSec,
          progressRelayMode: r.progressForwardMode,
          progressIntervalSec: r.videoProgressForwardIntervalSec,
          upstreamHost: t?.lastFinalUrl?.hostname || t?.lastTargetBase?.hostname || "",
          upstreamStatus: c
        }),
        outboundColo: r.defaultOutboundColo || ""
      });
      const u = new Headers({
        "Content-Type": "application/json; charset=utf-8",
        "Access-Control-Allow-Origin": r.finalOrigin || "*",
        "Cache-Control": "no-store"
      });
      return r.finalOrigin !== "*" && Kr(u, "Origin"), Ce(u), new Response(JSON.stringify(d), {
        status: c,
        statusText: l,
        headers: u
      });
    },
    async handle(r, t, a, n, s, i, c, l = {}) {
      if (ya(a)) {
        const h = U(l.runtimeConfig) ? l.runtimeConfig : {}, y = Ia(i, r, e.resolveCorsOrigin(h, r));
        return wn(r.method, y);
      }
      let d = await e.prepareExecutionContext(r, t, a, n, s, i, c, l);
      if (d.invalidResponse) return d.invalidResponse;
      const u = await e.resolveEarlyResponse(d);
      if (u) return u;
      let { targetRecords: f, invalidResponse: m } = e.parseTargetRecords(d.node, d.finalOrigin, { cachedTargetRecords: d.playbackRouteHotTargetRecords });
      if (m) return m;
      let p = e.prepareFailoverOverlay(d, f);
      d.defaultOutboundColo = "";
      let g = null;
      try {
        g = await e.buildProxyRequestState(d.request, d.node, d.proxyPath, d.requestUrl, d.clientIp, d.requestTraits, d.forceH1, p, {
          effectiveRealClientIpMode: d.effectiveRealClientIpMode,
          effectiveMediaAuthMode: d.effectiveMediaAuthMode
        });
        const h = await e.tryServePlaybackInfoResponseCache(d, g);
        if (h) return h;
        const y = e.createBuildFetchOptions(d, g), S = await e.maybeBuildEntryDirectResponse(d, f, g, y);
        if (S) return S;
        const _ = await e.maybeHandlePlaybackProgressRelay(d, g, y, g.retryTargetRecords);
        if (_) return _;
        d.requestLifecycle = ol(d.request?.signal);
        const A = await e.executeUpstreamFlow(d, g, y);
        return await e.buildSuccessResponse(d, y, A, g);
      } catch (h) {
        return e.buildErrorResponse(d, h);
      }
    }
  };
}
function rg(o = {}, e = {}) {
  return {
    ...Zp(o, e),
    ...eg(o, e),
    ...tg(o, e)
  };
}
function ag(o = {}, e = {}) {
  const { Logger: r } = o;
  return {
    resolveEntryDirectTargetUrl(t, a) {
      if (t?.playbackRelayTargetUrl instanceof URL) return new URL(t.playbackRelayTargetUrl.toString());
      const n = hr(a, t?.proxyPath || "/");
      return n.search = String(t?.requestUrl?.search || ""), n;
    },
    classifyProxyLogCategory(t) {
      return t.isSegment ? "segment" : t.isManifest ? "manifest" : t.isBigStream || t.isSmartStrmMedia ? "stream" : t.isImage ? "image" : t.isSubtitle ? "subtitle" : t.isStaticFile ? "asset" : t.isWsUpgrade ? "websocket" : "api";
    },
    extractProxyErrorDetail(t) {
      if (t.status < 400) return null;
      const a = [], n = t.headers.get("Server");
      n && a.push(`Server: ${n}`);
      const s = t.headers.get("CF-Ray");
      s && a.push(`CF-Ray: ${s}`);
      const i = t.headers.get("X-Application-Error-Code") || t.headers.get("X-Emby-Error") || t.headers.get("X-MediaBrowser-Error");
      i && a.push(`Media-Server-Error: ${i}`);
      const c = t.headers.get("CF-Cache-Status");
      return c && a.push(`CF-Cache: ${c}`), a.length > 0 ? a.join(" | ") : t.statusText;
    },
    appendLogDiagnosticDetail(t, a) {
      const n = [], s = (c) => {
        const l = String(c || "").trim();
        l && (n.includes(l) || n.push(l));
      };
      if (s(t), s(a), !n.length) return null;
      const i = n.join(" | ");
      return i.length > 1200 ? i.slice(0, 1197) + "..." : i;
    },
    shouldLogDirectAccess(t, a = {}) {
      return !!(e.isEntryDirectDataPlaneMode(t?.entryRoutingDecision?.dataPlaneMode) || a.directRedirectUrl);
    },
    buildDirectAccessDiagnosticDetail(t, a = {}) {
      let n = "直连";
      n = e.appendLogDiagnosticDetail(n, `RoutingMode=${vr(t?.routingDecisionMode)}`), n = e.appendLogDiagnosticDetail(n, e.buildTargetHotCacheDiagnosticDetail(t));
      const s = t?.entryRoutingDecision;
      return e.isEntryDirectDataPlaneMode(s?.dataPlaneMode) && (n = e.appendLogDiagnosticDetail(n, `Direct=entry_307 | Reason=${String(s?.reason || s?.traceLabel || "entry_direct").trim() || "entry_direct"}`)), n = e.appendLogDiagnosticDetail(n, e.buildPlaybackUrlDiagnosticDetail(t)), n = e.appendLogDiagnosticDetail(n, t?.directRedirectAuthReason ? `DirectAuth=${t.directRedirectAuthReason}` : ""), n = e.appendLogDiagnosticDetail(n, e.buildRouteContextDiagnosticDetail(t)), n = e.appendLogDiagnosticDetail(n, e.buildStreamDiagnosticDetail(t, null, {
        force: !0,
        flow: a.directRedirectUrl ? "client_redirect" : "entry_direct",
        source: "client_visible_redirect"
      })), (a.directRedirectUrl || a.redirectTrace) && (n = e.appendLogDiagnosticDetail(n, e.buildRedirectDiagnosticDetail(a.redirectTrace || t?.redirectTrace))), n;
    },
    buildDirectAccessLogPayload(t, a, n = "", s = {}) {
      return {
        statusCode: a,
        category: e.classifyProxyLogCategory(t.requestTraits),
        errorDetail: e.buildDirectAccessDiagnosticDetail(t, s),
        detailJson: e.buildStructuredLogDetail(t, { statusCode: a }, {
          ...s,
          deliveryMode: "direct",
          redirectMode: s.directRedirectUrl ? "client_redirect" : "entry_307",
          decisionReason: String(s.decisionReason || t?.directRedirectAuthReason || t?.entryRoutingDecision?.reason || t?.entryRoutingDecision?.traceLabel || "").trim()
        }),
        outboundColo: n
      };
    },
    buildStreamDiagnosticDetail(t, a, n = {}) {
      const s = t?.requestTraits || {};
      if (!(n.force === !0 || s.isBigStream === !0 || s.isSmartStrmMedia === !0 || s.isSegment === !0 || s.isManifest === !0)) return "";
      const i = a?.headers, c = [], l = (d, u) => {
        const f = String(u || "").trim();
        f && c.push(`${d}=${f.length > 160 ? f.slice(0, 157) + "..." : f}`);
      };
      return l("Flow", n.flow || "passthrough"), l("Kind", e.classifyProxyLogCategory(s)), l("Source", n.source || "upstream"), l("Range", s.rangeHeader || t?.request?.headers?.get("Range")), l("Content-Range", i?.get("Content-Range")), l("Length", i?.get("Content-Length")), l("Accept-Ranges", i?.get("Accept-Ranges")), l("Cache", n.cacheStatus || i?.get("CF-Cache-Status")), l("Upstream", n.upstreamHost || n.upstreamUrlHost), l("RoutingMode", vr(t?.routingDecisionMode)), l("DirectAuth", t?.directRedirectAuthReason), n.protocolFallbackRetry === !0 && l("Retry", "protocol_fallback"), Number(n.idleTimeoutMs) > 0 && l("Idle", `${Number(n.idleTimeoutMs)}ms`), c.join(" | ");
    },
    buildPlaybackInfoCacheDiagnosticDetail(t) {
      if (t?.requestTraits?.isPlaybackInfoRequest !== !0) return "";
      const a = Gt(t?.effectivePlaybackInfoMode), n = String(t?.playbackInfoCacheState || "").trim(), s = String(t?.playbackInfoRewrite || "").trim(), i = [`PlaybackInfoMode=${a}`];
      return s && i.push(`PlaybackInfoRewrite=${s}`), n && i.push(`PlaybackInfoCache=${n}`), Number(t?.playbackInfoCacheTtlSec) > 0 && i.push(`PlaybackInfoCacheTtl=${Number(t.playbackInfoCacheTtlSec)}s`), i.join(" | ");
    },
    buildPlaybackUrlDiagnosticDetail(t) {
      const a = String(t?.playbackUrlMode || "").trim(), n = String(t?.playbackFallback || "").trim(), s = String(t?.playbackPathFix || "").trim(), i = String(t?.rewritePlaybackEntry || "").trim(), c = [];
      return a && c.push(`PlaybackUrlMode=${a}`), n && c.push(`PlaybackFallback=${n}`), s && c.push(`PlaybackPathFix=${s}`), i && c.push(`RewritePlaybackEntry=${i}`), c.join(" | ");
    },
    buildTargetHotCacheDiagnosticDetail(t) {
      const a = String(t?.nodeCacheState || t?.targetHotCacheState || "").trim();
      return a ? t?.nodeCacheState ? `NodeCacheState=${a}` : `TargetHotCache=${a}` : "";
    },
    buildRouteContextDiagnosticDetail(t) {
      const a = t?.routeContextDiagnostics && typeof t.routeContextDiagnostics == "object" ? t.routeContextDiagnostics : null;
      if (!a) return "";
      const n = [], s = (i, c) => {
        const l = String(c || "").trim();
        l && n.push(`${i}=${l}`);
      };
      return s("RouteKind", a.routeKind), s("RequestHost", a.requestHost), s("ConfiguredHost", a.configuredHost), s("ConfiguredLegacyHost", a.configuredLegacyHost), n.push(`LegacyHostRequest=${a.isLegacyHostRequest === !0 ? "true" : "false"}`), n.join(" | ");
    },
    buildRuntimeDiagnosticDetail(t) {
      return e.appendLogDiagnosticDetail(e.appendLogDiagnosticDetail(e.appendLogDiagnosticDetail(e.appendLogDiagnosticDetail(e.buildTargetHotCacheDiagnosticDetail(t), e.buildPlaybackInfoCacheDiagnosticDetail(t)), e.buildFailoverDiagnosticDetail(t)), e.buildPlaybackUrlDiagnosticDetail(t)), e.appendLogDiagnosticDetail(e.buildProgressRelayDiagnosticDetail(t), e.buildRouteContextDiagnosticDetail(t)));
    },
    buildProgressRelayDiagnosticDetail(t) {
      if (t?.requestTraits?.isPlaybackSessionControlRequest !== !0) return "";
      const a = String(t?.progressForwardMode || "").trim();
      if (!a) return "";
      const n = [`ProgressRelay=${a}`];
      Number(t?.videoProgressForwardIntervalSec) > 0 && n.push(`ProgressInterval=${Number(t.videoProgressForwardIntervalSec)}s`);
      const s = String(t?.progressForwardSessionKey || "").trim();
      return s && n.push(`ProgressSession=${ce(s)}`), n.join(" | ");
    },
    collectLogAuthKinds(t, a = null) {
      const n = /* @__PURE__ */ new Set(), s = t?.requestUrl instanceof URL ? t.requestUrl : null;
      if (s) for (const l of s.searchParams.keys()) {
        const d = Oa(l);
        if (rl.has(d) || al.has(d)) {
          n.add("query");
          break;
        }
      }
      const i = a?.newHeaders || t?.request?.headers || new Headers(), c = a?.clientRedirectAuthPolicy || wa(i);
      return c.hasQueryAuth && n.add("query"), c.hasHeaderAuth && n.add("header"), c.hasCookieAuth && n.add("cookie"), [...n];
    },
    pickPrimaryAuthCarrier(t = []) {
      return (t || []).includes("query") ? "query" : (t || []).includes("header") ? "header" : (t || []).includes("cookie") ? "cookie" : "none";
    },
    resolveRedirectScope(t, a) {
      if (!t) return "none";
      try {
        const n = t instanceof URL ? t : new URL(String(t || "")), s = a instanceof URL ? a : new URL(String(a || ""));
        return n.origin === s.origin ? "same_origin" : "external";
      } catch {
        return "external";
      }
    },
    resolveRoutingCapability(t = "proxy", a = [], n = "none") {
      const s = String(t || "").trim().toLowerCase() === "direct" ? "direct" : "proxy", i = e.pickPrimaryAuthCarrier(a), c = n === "same_origin" || n === "external" ? n : "none";
      return $p?.[s]?.[i]?.[c] || {
        deliveryMode: s,
        authCarrier: i,
        redirectScope: c,
        clientVisibleRedirect: s === "direct" && c !== "none",
        workerFollowRedirect: s !== "direct",
        reasonCode: s === "direct" ? "client_redirect" : "worker_follow_redirect"
      };
    },
    classifyProtocolFailureReason(t, a = {}) {
      const n = String(a.errorCode || t?.code || "").trim().toUpperCase(), s = String(a.message || t?.message || t || "").trim().toLowerCase(), i = Number(a.upstreamStatus) || 0;
      return String(a.abortReason || "").trim().toLowerCase() === "stream_idle_timeout" || n === "STREAM_IDLE_TIMEOUT" ? "idle_timeout" : n === "UPSTREAM_TIMEOUT" || s.includes("timed out") || s.includes("timeout") ? "connect_timeout" : s.includes("redirect loop") ? "redirect_loop" : s.includes("too many redirects") || s.includes("redirect limit") ? "redirect_limit_exceeded" : s.includes("tls") || s.includes("ssl") || s.includes("certificate") ? "tls_handshake_failed" : a.protocolFallbackRetry === !0 || s.includes("protocol_fallback") ? "http_version_fallback" : i === 416 || s.includes("range") && (s.includes("416") || s.includes("unsatisfied") || s.includes("satisfiable")) ? "range_unsatisfied" : i >= 400 && i < 500 ? "upstream_4xx" : i >= 500 ? "upstream_5xx" : "unknown_fetch_error";
    },
    buildStructuredLogDetail(t, a = {}, n = {}) {
      const s = String(n.deliveryMode || (e.shouldLogDirectAccess(t, { directRedirectUrl: n.directRedirectUrl }) ? "direct" : "proxy")).trim().toLowerCase() === "direct" ? "direct" : "proxy", i = e.collectLogAuthKinds(t, n.transport), c = n.redirectScope || e.resolveRedirectScope(n.directRedirectUrl || n.redirectUrl || n.finalUrl, t?.requestUrl), l = e.resolveRoutingCapability(s, i, c), d = Number(n.upstreamStatus || a.statusCode || 0) || 0, u = Mu(d), f = t?.routeContextDiagnostics && typeof t.routeContextDiagnostics == "object" ? t.routeContextDiagnostics : null, m = Array.isArray(n.authKindsForwarded) ? [...new Set(n.authKindsForwarded.map((g) => String(g || "").trim().toLowerCase()).filter(Boolean))] : s === "direct" ? i.filter((g) => g === "query") : i, p = e.ensureFailoverTelemetry(t);
      return {
        routingMode: vr(t?.routingDecisionMode),
        entryDecision: t?.entryRoutingDecision ? {
          dataPlaneMode: String(t.entryRoutingDecision.dataPlaneMode || "").trim(),
          reason: String(t.entryRoutingDecision.reason || t.entryRoutingDecision.traceLabel || "").trim()
        } : null,
        redirectDecision: n.redirectDecision && typeof n.redirectDecision == "object" ? n.redirectDecision : {
          mode: String(n.redirectMode || n.redirectTrace?.terminalMode || l.reasonCode || "").trim(),
          reason: String(n.decisionReason || t?.directRedirectAuthReason || l.reasonCode || "").trim()
        },
        deliveryMode: s,
        redirectScope: c,
        authKindsPresent: i,
        authKindsForwarded: m,
        decisionReason: String(n.decisionReason || t?.directRedirectAuthReason || l.reasonCode || "").trim(),
        routeKind: String(f?.routeKind || "").trim() || null,
        requestHost: String(f?.requestHost || "").trim() || null,
        configuredHost: String(f?.configuredHost || "").trim() || null,
        configuredLegacyHost: String(f?.configuredLegacyHost || "").trim() || null,
        isLegacyHostRequest: f?.isLegacyHostRequest === !0,
        statusReasonCode: u.code,
        statusReasonText: u.text,
        protocolFailureReason: String(n.protocolFailureReason || "").trim() || null,
        protocolFallbackRetry: n.protocolFallbackRetry === !0,
        failoverState: e.buildFailoverStateSummary(t),
        probeReason: String(n.probeReason || p.probeReason || "").trim() || null,
        probeWinner: String(n.probeWinner || p.probeWinner || "").trim() || null,
        probeElapsedMs: Math.max(0, Math.round(Number(n.probeElapsedMs ?? p.probeElapsedMs) || 0)) || null,
        waitJoinMs: Math.max(0, Math.round(Number(n.waitJoinMs ?? p.waitJoinMs) || 0)) || null,
        demotedTarget: String(n.demotedTarget || p.demotedTarget || "").trim() || null,
        preferredTarget: String(n.preferredTarget || p.preferredTarget || "").trim() || null,
        fastFailReason: String(n.fastFailReason || p.fastFailReason || "").trim() || null,
        targetHotCache: String(n.targetHotCache || t?.targetHotCacheState || "").trim() || null,
        nodeCacheState: String(n.nodeCacheState || t?.nodeCacheState || "").trim() || null,
        playbackInfoCache: String(n.playbackInfoCache || t?.playbackInfoCacheState || "").trim() || null,
        playbackInfoCacheTtlSec: Number.isFinite(Number(n.playbackInfoCacheTtlSec)) ? Math.max(0, Math.trunc(Number(n.playbackInfoCacheTtlSec))) : Math.max(0, Math.trunc(Number(t?.playbackInfoCacheTtlSec) || 0)),
        playbackInfoMode: t?.requestTraits?.isPlaybackInfoRequest === !0 ? Gt(n.playbackInfoMode || t?.effectivePlaybackInfoMode) : null,
        playbackInfoRewrite: t?.requestTraits?.isPlaybackInfoRequest === !0 && String(n.playbackInfoRewrite || t?.playbackInfoRewrite || "").trim() || null,
        playbackUrlMode: String(n.playbackUrlMode || t?.playbackUrlMode || "").trim() || null,
        playbackFallback: String(n.playbackFallback || t?.playbackFallback || "").trim() || null,
        playbackPathFix: String(n.playbackPathFix || t?.playbackPathFix || "").trim() || null,
        rewritePlaybackEntry: String(n.rewritePlaybackEntry || t?.rewritePlaybackEntry || "").trim() || null,
        progressRelayMode: String(n.progressRelayMode || t?.progressForwardMode || "").trim() || null,
        progressIntervalSec: Number.isFinite(Number(n.progressIntervalSec)) ? Math.max(0, Math.trunc(Number(n.progressIntervalSec))) : Math.max(0, Math.trunc(Number(t?.videoProgressForwardIntervalSec) || 0)),
        rangeRequest: !!String(t?.request?.headers?.get("Range") || "").trim(),
        upstreamHost: String(n.upstreamHost || n.upstreamUrlHost || n.finalUrl?.hostname || "").trim(),
        upstreamStatus: d
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
    recordRedirectTraceHop(t, a, n, s = {}) {
      !t || !n || t.hops.push({
        status: Number(a) || 0,
        kind: s.isSameOriginRedirect === !0 ? "same" : "external",
        action: String(s.traceAction || (e.isEntryDirectDataPlaneMode(s.dataPlaneMode) ? "direct" : "proxy")).trim() || "proxy",
        host: String(n.hostname || "").trim().toLowerCase()
      });
    },
    finalizeRedirectTrace(t, a = {}) {
      if (!t || typeof t != "object") return null;
      const n = String(a.terminalMode || t.terminalMode || "").trim();
      n && (t.terminalMode = n);
      const s = Number(a.finalStatus);
      Number.isFinite(s) && s > 0 && (t.finalStatus = s);
      const i = String(a.finalHost || "").trim().toLowerCase();
      return i && (t.finalHost = i), t;
    },
    buildRedirectDiagnosticDetail(t) {
      if (!t || typeof t != "object") return "";
      const a = Array.isArray(t.hops) ? t.hops : [], n = a.length, s = String(t.terminalMode || "").trim(), i = Number(t.finalStatus) || 0, c = String(t.finalHost || "").trim().toLowerCase();
      if (!n && !s && i <= 0 && !c) return "";
      const l = [];
      s && l.push(`Redirect=${s}`), l.push(`RedirectHops=${n}`);
      const d = a.map((u) => {
        const f = Number(u?.status) || 0, m = String(u?.kind || "").trim() || "unknown", p = String(u?.action || "").trim() || "proxy", g = String(u?.host || "").trim().toLowerCase();
        return [
          f || "0",
          m,
          p,
          g
        ].filter(Boolean).join(":");
      }).filter(Boolean).join(">");
      return d && l.push(`RedirectChain=${d.length > 240 ? d.slice(0, 237) + "..." : d}`), i > 0 && l.push(`RedirectFinal=${i}`), c && l.push(`RedirectFinalHost=${c}`), l.join(" | ");
    }
  };
}
function ng(o = {}, e = {}) {
  const { Logger: r } = o;
  return {
    buildProxyErrorState: Wn,
    async guardApiResponseMime(t, a) {
      return hl(t, a, {
        sanitizePath: ee,
        buildErrorState: Wn
      });
    },
    buildMetadataCacheStorageResponse(t, a, n = {}) {
      const s = new Headers(t.headers);
      return s.delete("Set-Cookie"), a.isImage || a.isSubtitle ? s.set("Cache-Control", `public, max-age=${Math.max(0, Number(n.imageCacheMaxAge) || 0)}`) : a.isManifest && s.set("Cache-Control", `public, max-age=${Math.max(0, Number(n.prewarmCacheTtl) || 0)}`), new Response(t.body, {
        status: t.status,
        statusText: t.statusText,
        headers: s
      });
    },
    async storeMetadataCache(t, a, n, s = {}) {
      const i = dr();
      if (!i || !t || !a || a.status !== 200 || s.proxiedExternalRedirect === !0 || n.isManifest && !fo(s.sourceUrl)) return !1;
      try {
        return await i.put(t, e.buildMetadataCacheStorageResponse(a, n, s)), !0;
      } catch {
        return !1;
      }
    },
    resolveMetadataTarget(t, a, n, s) {
      const i = String(t || "").trim();
      if (!i) return null;
      let c;
      try {
        if (/^https?:\/\//i.test(i)) c = new URL(i);
        else {
          const u = new URL(i, "https://metadata-prewarm.invalid");
          c = hr(a, u.pathname || "/"), c.search = u.search || "", c.hash = u.hash || "";
        }
      } catch {
        return null;
      }
      if (wp(c.pathname)) return null;
      const { proxyPath: l } = xa(c, a);
      if (!l) return null;
      const d = l || "/";
      return qr.test(d) || jr.test(d) || bt.test(d) || pr.test(d) ? {
        upstreamUrl: c,
        proxyPath: d,
        proxySearch: c.search || ""
      } : null;
    },
    buildMetadataPrewarmTargets(t, a, n, s, i, c) {
      const l = /* @__PURE__ */ new Map(), d = Lp(t);
      if (d) {
        const u = e.resolveMetadataTarget(`/Items/${encodeURIComponent(d)}/Images/Primary`, n, s, i);
        u && l.set(`${u.proxyPath}${u.proxySearch}`, u);
      }
      return c !== "poster" && mo(a).forEach((u) => {
        const f = e.resolveMetadataTarget(u, n, s, i);
        f && l.set(`${f.proxyPath}${f.proxySearch}`, f);
      }), [...l.values()].sort((u, f) => $s(u.proxyPath) - $s(f.proxyPath)).slice(0, 4);
    },
    buildBudgetedPrewarmResponse(t, a) {
      const n = Math.max(0, Math.floor(Number(a) || 0)), s = po(t?.headers?.get("Content-Length"));
      if (n <= 0 || Number.isFinite(s) && s > n) {
        try {
          Promise.resolve(t?.body?.cancel?.()).catch(() => {
          });
        } catch {
        }
        return null;
      }
      if (!t?.body) return {
        response: t,
        getBytes: () => 0
      };
      const i = t.body.getReader();
      let c = 0, l = !1;
      const d = () => {
        if (!l) {
          l = !0;
          try {
            i.releaseLock();
          } catch {
          }
        }
      }, u = new ReadableStream({
        async pull(f) {
          try {
            const { done: m, value: p } = await i.read();
            if (m) {
              d(), f.close();
              return;
            }
            const g = p instanceof Uint8Array ? p : new Uint8Array(p || 0);
            if (c + g.byteLength > n) {
              try {
                await i.cancel("metadata_prewarm_budget_exceeded");
              } catch {
              }
              d(), f.error(/* @__PURE__ */ new Error("metadata_prewarm_budget_exceeded"));
              return;
            }
            c += g.byteLength, f.enqueue(g);
          } catch (m) {
            d(), f.error(m);
          }
        },
        async cancel(f) {
          try {
            await i.cancel(f);
          } catch {
          }
          d();
        }
      });
      return {
        response: new Response(u, {
          status: t.status,
          statusText: t.statusText,
          headers: t.headers
        }),
        getBytes: () => c
      };
    },
    async runMetadataPrewarmSingleFlight(t, a) {
      const n = oe.MetadataPrewarmTasks, s = t instanceof Request ? t.url : String(t || "");
      if (!s) return {
        skipped: !0,
        result: null
      };
      const i = n.get(s);
      if (i) return {
        joined: !0,
        result: await i
      };
      if (n.size >= Nd) return {
        skipped: !0,
        result: null
      };
      const c = Promise.resolve().then(a).finally(() => {
        n.get(s) === c && n.delete(s);
      });
      return n.set(s, c), {
        joined: !1,
        result: await c
      };
    },
    scheduleMetadataPrewarmResponse(t, a, n, s, i, c, l, d, u, f = {}) {
      if (!u || t.method !== "GET" || n.enablePrewarm !== !0 || n.isPlaybackInfoRequest === !0 || n.isImage || n.isSubtitle || n.isManifest || n.isSegment || n.isBigStream || !(a.status >= 200 && a.status < 300) || !Ga(a.headers.get("Content-Type"))) return;
      let m;
      try {
        m = a.clone();
      } catch {
        return;
      }
      const p = (async () => {
        const g = await xe(m, Di);
        if (g.exceeded) return;
        let h;
        try {
          h = JSON.parse(g.text);
        } catch {
          return;
        }
        const y = e.buildMetadataPrewarmTargets(f.proxyPath, h, s, c, l, n.prewarmDepth);
        if (!y.length) return;
        const S = dr();
        if (!S) return;
        let _ = de(n.prewarmPrefetchBytes, v.Defaults.PrewarmPrefetchBytes, 0, Io);
        for (const A of y) {
          if (_ <= 0) break;
          if (!fo(A.upstreamUrl)) continue;
          const b = await _p(t, A.upstreamUrl), E = el(d, c, l, A.proxyPath, {
            search: A.proxySearch,
            nodeCacheRevision: f.nodeCacheRevision,
            entryMode: f.entryMode,
            identityPartition: b,
            cachePolicyRevision: Yc(A.proxyPath, f)
          });
          if (E) {
            if (S && E) try {
              if (await S.match(E)) continue;
            } catch {
            }
            try {
              const R = await e.runMetadataPrewarmSingleFlight(E, async () => {
                const L = await i(A.upstreamUrl, { method: "GET" });
                L.cache = "no-store";
                const T = new Headers(L.headers);
                T.delete("Range"), T.delete("If-Modified-Since"), T.delete("If-None-Match"), T.set("X-Metadata-Prewarm", "1"), L.headers = T;
                const D = new AbortController();
                L.signal = D.signal;
                const w = de(f.prewarmTimeoutMs, Rd, 250, 1e4), M = setTimeout(() => D.abort(), w);
                try {
                  const x = await Be(A.upstreamUrl.toString(), L);
                  if (x.status !== 200) {
                    try {
                      await x.body?.cancel?.();
                    } catch {
                    }
                    return {
                      cached: !1,
                      bytes: 0
                    };
                  }
                  const C = e.buildBudgetedPrewarmResponse(x, _);
                  if (!C) return {
                    cached: !1,
                    bytes: 0
                  };
                  const F = {
                    isImage: qr.test(A.proxyPath) || jr.test(A.proxyPath),
                    isSubtitle: pr.test(A.proxyPath),
                    isManifest: bt.test(A.proxyPath)
                  };
                  return {
                    cached: await e.storeMetadataCache(E, C.response, F, {
                      ...f,
                      sourceUrl: A.upstreamUrl
                    }),
                    bytes: C.getBytes()
                  };
                } finally {
                  clearTimeout(M), D.abort();
                }
              });
              !R.joined && R.result && (_ = Math.max(0, _ - (Number(R.result.bytes) || 0)));
            } catch {
            }
          }
        }
      })().catch(() => {
      });
      return u.waitUntil(p), p;
    },
    shouldRetryWithProtocolFallback(t, a = {}) {
      return !(t.status !== 403 || a.isRetry !== !1 || a.protocolFallback !== !0 || a.allowAutomaticRetry !== !0 || a.preparedBodyMode === "stream");
    },
    resolveResponseStreamIdleTimeoutMs(t) {
      return t?.isManifest === !0 ? v.Defaults.ProxyPlaylistIdleTimeoutMs : t?.isSegment === !0 ? v.Defaults.ProxyStreamIdleTimeoutMs : 0;
    },
    shouldManageProxyResponseBody(t, a) {
      return (t.requestTraits.isSegment === !0 || t.requestTraits.isManifest === !0) && t.requestMethod !== "HEAD" && a.response.status !== 101 && !!a.response.body;
    },
    buildPassthroughProxyResponseBody(t, a) {
      const n = t.requestMethod === "HEAD" ? null : a.response.body;
      try {
        a.releaseFetchController?.();
      } catch {
      }
      return t.requestLifecycle?.dispose?.(), n;
    },
    buildManagedProxyResponseBody(t, a, n) {
      const s = a.response.body, i = t.requestLifecycle, c = n && typeof n == "object" ? n : {
        statusCode: a.response.status,
        category: e.classifyProxyLogCategory(t.requestTraits),
        errorDetail: null,
        detailJson: e.buildStructuredLogDetail(t, { statusCode: a.response.status }, {
          deliveryMode: "proxy",
          redirectMode: "proxied_follow",
          decisionReason: "proxied_follow",
          upstreamHost: a.finalUrl?.hostname || a.activeTargetBase?.hostname || "",
          upstreamStatus: a.response.status
        })
      };
      if (!s || t.requestMethod === "HEAD" || !i) {
        try {
          a.releaseFetchController?.();
        } catch {
        }
        return i?.dispose?.(), t.requestMethod === "HEAD" ? null : s;
      }
      const l = s.getReader(), d = e.resolveResponseStreamIdleTimeoutMs(t.requestTraits, t.upstreamTimeoutMs), u = {
        ...c,
        detailJson: c?.detailJson || e.buildStructuredLogDetail(t, { statusCode: a.response.status }, {
          deliveryMode: "proxy",
          redirectMode: "proxied_follow",
          decisionReason: "proxied_follow",
          protocolFailureReason: a.protocolFallbackRetry === !0 ? e.classifyProtocolFailureReason("protocol_fallback", {
            protocolFallbackRetry: !0,
            upstreamStatus: a.response.status
          }) : Number(a.response.status) >= 400 ? e.classifyProtocolFailureReason(c?.errorDetail || a.response.statusText || "", { upstreamStatus: a.response.status }) : null,
          upstreamHost: a.finalUrl?.hostname || a.activeTargetBase?.hostname || "",
          upstreamStatus: a.response.status
        }),
        errorDetail: e.appendLogDiagnosticDetail(c.errorDetail, e.buildStreamDiagnosticDetail(t, a.response, {
          flow: "managed",
          source: "upstream",
          upstreamHost: a.finalUrl?.hostname || a.activeTargetBase?.hostname || "",
          idleTimeoutMs: d
        }))
      };
      let f = !1, m = null, p = null, g = () => {
      }, h = !1;
      const y = (b = {}) => {
        if (h) return;
        h = !0;
        const E = {
          ...u,
          ...U(b) ? b : {}
        };
        E.errorDetail = e.appendLogDiagnosticDetail(b.errorDetail, u.errorDetail), E.detailJson = {
          ...u.detailJson || {},
          ...b.detailJson && typeof b.detailJson == "object" ? b.detailJson : {},
          protocolFailureReason: b?.detailJson?.protocolFailureReason || (Number(E.statusCode) >= 400 ? e.classifyProtocolFailureReason(E.errorDetail, {
            upstreamStatus: E.statusCode,
            protocolFallbackRetry: u?.detailJson?.protocolFallbackRetry === !0
          }) : u?.detailJson?.protocolFailureReason || null),
          upstreamStatus: Number(E.statusCode) || 0
        }, e.recordAccessLog(t, E);
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
            a.releaseFetchController?.();
          } catch {
          }
          i.dispose();
        }
      }, A = () => {
        f || d <= 0 || (S(), p = setTimeout(() => i.abort("stream_idle_timeout"), d));
      };
      return g = i.onAbort((b) => {
        f || (S(), b === "stream_idle_timeout" ? y({
          statusCode: 504,
          category: "error",
          errorDetail: `stream_idle_timeout_${d}ms`
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
                const { done: E, value: R } = await l.read();
                if (S(), E) {
                  const L = i.getAbortReason();
                  if (_(), L === "stream_idle_timeout") {
                    try {
                      b.error(lr(L, `${d}ms`));
                    } catch {
                    }
                    return;
                  }
                  y(), b.close();
                  return;
                }
                b.enqueue(R), A();
              } catch (E) {
                S();
                const R = i.getAbortReason(), L = R === "stream_idle_timeout" ? lr(R, `${d}ms`) : R ? lr(R) : E;
                if (_(), R === "client_aborted" || R === "downstream_cancelled") {
                  y({
                    statusCode: 499,
                    category: e.classifyProxyLogCategory(t.requestTraits),
                    errorDetail: R
                  });
                  try {
                    b.close();
                  } catch {
                  }
                  return;
                }
                y(R === "stream_idle_timeout" ? {
                  statusCode: 504,
                  category: "error",
                  errorDetail: `stream_idle_timeout_${d}ms`
                } : {
                  statusCode: 502,
                  category: "error",
                  errorDetail: E?.message || String(E)
                });
                try {
                  b.error(L);
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
function og(o = {}, e = {}) {
  const { Logger: r } = o;
  return {
    async performFetchWithTimeout(t, a, n = {}) {
      const s = await a(t, n), i = Math.max(0, Number(n.timeoutMs) || 0), c = n.requestLifecycle || null;
      let l = null, d = null, u = !1, f = () => {
      };
      (i > 0 || c) && (d = new AbortController(), s.signal = d.signal, c && (f = c.setActiveFetchController(d)), i > 0 && (l = setTimeout(() => {
        u = !0, d.abort(`upstream_timeout_${i}ms`);
      }, i)));
      try {
        return {
          response: await Be(t.toString(), s),
          finalUrl: t,
          releaseFetchController: f
        };
      } catch (m) {
        if (f(), u) {
          const p = /* @__PURE__ */ new Error(`upstream_timeout_${i}ms`);
          throw p.code = "UPSTREAM_TIMEOUT", p;
        }
        if (c && rr(m)) {
          const p = c.getAbortReason();
          if (p) throw lr(p);
        }
        throw m;
      } finally {
        l !== null && clearTimeout(l);
      }
    },
    async performUpstreamFetch(t, a, n, s, i = {}) {
      const c = i.useFastSegmentBuilder === !0, l = c ? new URL(Jm(t, a, n?.search || "")) : hr(t, a);
      return c || (l.search = n.search), {
        ...await e.performFetchWithTimeout(l, s, i),
        targetRecord: t
      };
    },
    async fetchAbsoluteWithRetryLoop(t) {
      let a = null;
      const n = t.absoluteUrl instanceof URL ? new URL(t.absoluteUrl.toString()) : new URL(String(t.absoluteUrl || "")), s = Math.max(1, de(t.maxExtraAttempts, jn, 0, 3) + 1);
      for (let i = 0; i < s; i++) {
        const c = t.isRetry === !0 || i > 0;
        try {
          const l = await e.performFetchWithTimeout(n, t.buildFetchOptions, {
            ...t.fetchOptions,
            isRetry: c,
            protocolFallbackRetry: t.protocolFallbackRetry === !0,
            stripAuthOnProtocolFallback: t.stripAuthOnProtocolFallback === !0,
            timeoutMs: t.upstreamTimeoutMs,
            requestLifecycle: t.requestLifecycle
          }), d = l.response;
          if (d.status === 101) return {
            ...l,
            protocolFallbackRetry: t.protocolFallbackRetry === !0
          };
          if (e.shouldRetryWithProtocolFallback(d, {
            ...t,
            isRetry: c
          })) {
            try {
              d.body?.cancel?.();
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
          const u = i === s - 1;
          if (t.allowAutomaticRetry !== !0 || !t.retryableStatuses.has(d.status) || u) return {
            ...l,
            protocolFallbackRetry: t.protocolFallbackRetry === !0
          };
          try {
            d.body?.cancel?.();
          } catch {
          }
          try {
            l.releaseFetchController?.();
          } catch {
          }
        } catch (l) {
          a = l;
          const d = i === s - 1;
          if (t.allowAutomaticRetry !== !0 || d)
            throw l && typeof l == "object" && (l.lastFinalUrl = n), l;
        }
      }
      throw a && typeof a == "object" && (a.lastFinalUrl = n), a || /* @__PURE__ */ new Error("redirect_fetch_failed");
    },
    async fetchUpstreamWithRetryLoop(t) {
      let a = null, n = Array.isArray(t.retryTargetRecords) ? t.retryTargetRecords.slice() : [], s = n[0], i = hr(s, t.proxyPath);
      i.search = t.requestUrl.search;
      const c = Math.max(1, de(t.maxExtraAttempts, jn, 0, 3) + 1);
      for (let l = 0; l < c; l++) for (let d = 0; d < n.length; d++) {
        const u = n[d];
        s = u;
        const f = t.isRetry === !0 || l > 0;
        try {
          const m = await e.performUpstreamFetch(u, t.proxyPath, t.requestUrl, t.buildFetchOptions, {
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
          const g = d === n.length - 1, h = l === c - 1;
          if (t.allowAutomaticRetry !== !0 || !t.retryableStatuses.has(p.status) || g && h) return {
            ...m,
            protocolFallbackRetry: t.protocolFallbackRetry === !0
          };
          const y = await e.maybeRunForegroundFailoverWait(t, {
            targetRecord: u,
            responseStatus: p.status,
            reason: `upstream_status_${p.status}`
          });
          if (y?.upstream) {
            const S = y.upstream;
            s = S.targetRecord || u, i = S.finalUrl || i;
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
          } else y?.error && (a = y.error);
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
            n = e.reorderRetryTargetsForFailover(t.execution.failoverContext.originalTargetRecords, S);
          }
        } catch (m) {
          a = m;
          const p = String(m?.code || "").trim().toUpperCase();
          if (![
            "CLIENT_ABORTED",
            "DOWNSTREAM_CANCELLED",
            "REQUEST_ABORTED"
          ].includes(p)) {
            const y = await e.maybeRunForegroundFailoverWait(t, {
              targetRecord: u,
              reason: p || "network_error"
            });
            if (y?.upstream) {
              const S = y.upstream;
              s = S.targetRecord || u, i = S.finalUrl || i;
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
            } else y?.error && (a = y.error);
            if (t.execution?.failoverContext?.eligible) {
              const S = e.getFailoverStateSnapshot(t.execution.failoverContext.cacheKey, t.execution.failoverContext.preferredTtlMs);
              n = e.reorderRetryTargetsForFailover(t.execution.failoverContext.originalTargetRecords, S);
            }
          }
          const g = d === n.length - 1, h = l === c - 1;
          if (g && h)
            throw m && typeof m == "object" && (m.lastFinalUrl = i, m.lastTargetRecord = s, m.lastTargetBase = s?.targetUrl || null), m;
        }
      }
      throw a && typeof a == "object" && (a.lastFinalUrl = i, a.lastTargetRecord = s, a.lastTargetBase = s?.targetUrl || null), a || /* @__PURE__ */ new Error("upstream_fetch_failed");
    }
  };
}
function sg(o = {}, e = {}) {
  const { Logger: r } = o;
  return {
    recordAccessLog(t, a = {}) {
      const n = {
        nodeName: t.nodeName,
        requestPath: t.proxyPath,
        requestMethod: t.requestMethod,
        responseTime: Date.now() - t.startTime,
        clientIp: t.clientIp || "unknown",
        inboundColo: t.logInboundColo || "UNKNOWN",
        outboundColo: a.outboundColo || a.outboundIp || t.defaultOutboundColo || "",
        userAgent: t.request.headers.get("User-Agent"),
        referer: t.request.headers.get("Referer"),
        runtimeConfig: t.currentConfig,
        ...a
      };
      r.record(t.env, t.ctx, n);
    },
    buildOptionsResponse(t) {
      const a = new Headers(t.dynamicCors);
      return Ce(a), t.finalOrigin !== "*" && Kr(a, "Origin"), new Response(null, { headers: a });
    }
  };
}
function ig(o = {}, e = {}) {
  return {
    ...ag(o, e),
    ...ng(o, e),
    ...og(o, e),
    ...sg(o, e)
  };
}
function cg(o = {}, e = {}) {
  const { CacheManager: r } = o, t = new bl({
    entries: oe.PlaybackInfoResponseCache,
    now: k,
    maxEntries: v.Defaults.PlaybackInfoCacheMax,
    maxEntryBytes: Ai,
    maxTotalBytes: Cd
  });
  return {
    async prepareExecutionContext(a, n, s, i, c, l, d, u = {}) {
      const f = Date.now(), m = a.method;
      if (r.maybeCleanup(l), !n || !n.target) return { invalidResponse: new Response("Invalid Node", {
        status: 502,
        headers: Ce(new Headers())
      }) };
      const p = U(u.runtimeConfig) ? u.runtimeConfig : await Ae(l), g = u.requestUrl || new URL(a.url), h = u.runtimeRouteContext && typeof u.runtimeRouteContext == "object" ? u.runtimeRouteContext : null, y = typeof h?.requestHost == "string" ? h.requestHost : te(g.hostname), S = typeof h?.configuredHost == "string" ? h.configuredHost : ze(l), _ = typeof h?.configuredLegacyHost == "string" ? h.configuredLegacyHost : Gr(l), A = nr(u.entryMode || n?.entryMode), b = String(u.routeKindOverride || "").trim(), E = !!(_ && _ !== S && y && y === _), R = {
        requestHost: y,
        configuredHost: S,
        configuredLegacyHost: _,
        isLegacyHostRequest: E,
        routeKind: b || (E ? "legacy_host_kv_route" : A === "host_prefix" ? "host_prefix" : "kv_route")
      }, L = ee(s), T = String(u?.pathNormalizationState?.kind || "").trim(), D = a.headers.get("cf-connecting-ip") || "unknown", w = ca(a), M = D, x = a.cf?.country || "UNKNOWN", C = e.resolveCorsOrigin(p, a), F = Ia(l, a, C), W = zi(u.linkVariant), O = ip(L, g);
      if (O?.error) return { invalidResponse: new Response("Invalid Playback Relay", {
        status: 400,
        headers: Ce(new Headers(F))
      }) };
      const N = g.searchParams.has("__pb_abs") && (!!O || ba(L));
      let I = g;
      const P = O?.visibleProxyPath || L, H = O?.targetUrl instanceof URL ? O.targetUrl.pathname : "";
      if (ya(P) || H && ya(H)) return { invalidResponse: wn(m, F) };
      if ((O || N) && (I = new URL(g)), O) {
        I.searchParams.delete($i);
        const he = kc(g, i, c, P, {
          linkVariant: W,
          entryMode: u.entryMode
        });
        I.pathname = he.pathname;
      }
      N && I.searchParams.delete(Qn);
      const G = qf(n, p, i), $ = e.classifyRequest(a, P, I, p, {
        nodeDirectSource: G,
        directStaticAssets: p.directStaticAssets === !0,
        directHlsDash: p.directHlsDash === !0
      }), K = yu(n, p), j = tp(K), se = K === "rewrite" && O?.targetUrl instanceof URL ? "proxy" : "", me = W !== "main" ? "link_variant_force_proxy" : se ? "rewrite_playback_entry_proxy" : "", pe = !!me, le = pe ? {
        ...$,
        nodeDirectMedia: !1,
        directStaticAssets: !1,
        directHlsDash: !1,
        legacyEntryOffloadEnabled: !1,
        legacyEntryOffloadReason: "",
        direct307Mode: !1,
        enablePrewarm: p.enablePrewarm !== !1,
        isMetadataCacheable: m === "GET" && $.isWsUpgrade !== !0 && ($.isImage === !0 || $.isSubtitle === !0 || $.isManifest === !0)
      } : $, ge = Yf(p), Oe = p.protocolFallback !== !1, We = de(p.upstreamTimeoutMs, _d, 0, 18e4), vt = de(p.upstreamRetryAttempts, jn, 0, 3), st = p.hedgeFailoverEnabled === !0, Ft = p.hedgeProbePreferGet !== !1, Ut = _u(n, p), ea = de(p.hedgeProbeTimeoutMs, No, 250, 1e4), Ht = de(p.hedgeProbeParallelism, _i, 1, 2), yr = de(p.hedgeWaitTimeoutMs, bi, 250, 1e4), kt = de(p.hedgeLockTtlMs, Ei, 1e3, 1e4), it = de(p.hedgePreferredTtlSec, ia, 30, 3600), ta = de(p.hedgeFailureCooldownSec, Ri, 1, 300), Sr = de(p.hedgeWakeJitterMs, Ti, 0, 1e3), ct = de(p.cacheTtlImages, wi, 0, 365) * 86400, lt = ge.enableH3 === !0, qt = ge.forceH1 === !0, Tt = p.playbackInfoCacheEnabled !== !1, At = de(p.playbackInfoCacheTtlSec, Ad, 0, 60), _r = p.videoProgressForwardEnabled !== !1, Xt = de(p.videoProgressForwardIntervalSec, Ci, 0, 60), Ie = Su(n, p), ra = hu(n, p), Ge = String(u.nodeCacheRevision || "").trim() || uo(i, n), B = le.isMetadataCacheable ? await Xc(a) : "", V = le.isMetadataCacheable ? Yc(P, {
        imageCacheMaxAge: ct,
        prewarmCacheTtl: le.prewarmCacheTtl
      }) : "", q = le.isMetadataCacheable && fo(I) ? el(I, i, c, P, {
        search: I.search,
        nodeCacheRevision: Ge,
        entryMode: u.entryMode,
        identityPartition: B,
        cachePolicyRevision: V
      }) : null, X = q ? dr() : null, Y = au(n, p), ae = e.getRoutingDecision({
        phase: "entry",
        request: a,
        requestUrl: I,
        proxyPath: P,
        requestTraits: le,
        currentConfig: p,
        node: n,
        nodeName: i,
        nodeKey: c,
        linkVariant: W,
        forceWorkerProxy: pe,
        forceWorkerProxyReason: me,
        routingDecisionMode: Y
      });
      return {
        request: a,
        requestMethod: m,
        node: n,
        nodeName: i,
        nodeKey: c,
        entryMode: A,
        env: l,
        ctx: d,
        startTime: f,
        currentConfig: p,
        rawRequestUrl: g,
        requestUrl: I,
        requestOrigin: g.origin,
        rawProxyPath: L,
        proxyPath: P,
        linkVariant: W,
        forceWorkerProxy: pe,
        forceWorkerProxyReason: me,
        clientIp: M,
        inboundIp: D,
        logInboundColo: w,
        country: x,
        finalOrigin: C,
        dynamicCors: F,
        routeContextDiagnostics: R,
        requestTraits: le,
        protocolStrategy: ge.strategy,
        routingDecisionMode: Y,
        entryRoutingDecision: ae,
        enableH3: lt,
        forceH1: qt,
        protocolFallback: Oe,
        upstreamTimeoutMs: We,
        upstreamRetryAttempts: vt,
        hedgeFailoverEnabled: st,
        hedgeProbePreferGet: Ft,
        hedgeProbePath: Ut,
        hedgeProbeTimeoutMs: ea,
        hedgeProbeParallelism: Ht,
        hedgeWaitTimeoutMs: yr,
        hedgeLockTtlMs: kt,
        hedgePreferredTtlSec: it,
        hedgeFailureCooldownSec: ta,
        hedgeWakeJitterMs: Sr,
        playbackInfoCacheEnabled: Tt,
        playbackInfoCacheTtlSec: At,
        effectivePlaybackInfoMode: K,
        playbackInfoRewriteUrlMode: j,
        playbackInfoCacheState: le.isPlaybackInfoRequest === !0 ? Tt && At > 0 ? "miss" : "skip" : "",
        playbackInfoCacheKey: "",
        playbackInfoRewrite: le.isPlaybackInfoRequest === !0 && K === "passthrough" ? "passthrough" : "",
        playbackAbsoluteFallbackEligible: N,
        playbackAbsoluteFallbackLocation: N ? rp(L, g) : "",
        playbackUrlMode: N ? "absolute" : le.isPlaybackInfoRequest === !0 && K === "rewrite" ? String(j || "relative") : "",
        playbackFallback: N ? "none" : "",
        playbackPathFix: T,
        rewritePlaybackEntry: se,
        playbackRelayTargetUrl: O?.targetUrl instanceof URL ? O.targetUrl : null,
        targetHotCacheState: String(u.targetHotCacheState || "").trim() || (le.isPlaybackCriticalRequest === !0 ? "miss" : "skip"),
        nodeCacheState: String(u.nodeCacheState || "").trim(),
        playbackRouteHotTargetRecords: Array.isArray(u.cachedTargetRecords) ? u.cachedTargetRecords : null,
        videoProgressForwardEnabled: _r,
        videoProgressForwardIntervalSec: Xt,
        effectiveRealClientIpMode: Ie,
        effectiveMediaAuthMode: ra,
        nodeDerivedCacheRevision: Ge,
        failoverContext: null,
        failoverTelemetry: null,
        failoverForegroundWaitUsed: !1,
        progressForwardMode: "",
        progressForwardSessionKey: "",
        imageCacheMaxAge: ct,
        metadataCacheKey: q,
        metadataCache: X,
        metadataCacheIdentityPartition: B,
        metadataCachePolicyRevision: V,
        redirectTrace: null
      };
    },
    cleanupPlaybackInfoResponseCache(a = k()) {
      t.cleanup(a);
    },
    buildPlaybackInfoAuthSignature(a, n = null) {
      const s = a?.requestUrl instanceof URL ? a.requestUrl : null, i = n?.newHeaders || a?.request?.headers || null, c = Xo(i), l = qo(Ye(i, "Cookie"), hn);
      return Yo([
        s ? ce(s.searchParams.get("api_key") || s.searchParams.get("X-Emby-Token") || s.searchParams.get("X-MediaBrowser-Token") || "") : "",
        c?.token ? ce(c.token) : "",
        c?.deviceId ? ce(c.deviceId) : "",
        Ye(i, "Authorization") ? ce(Ye(i, "Authorization")) : "",
        Ye(i, "X-Emby-Authorization") ? ce(Ye(i, "X-Emby-Authorization")) : "",
        Ye(i, "X-MediaBrowser-Authorization") ? ce(Ye(i, "X-MediaBrowser-Authorization")) : "",
        l ? ce(l) : ""
      ]);
    },
    buildPlaybackInfoCacheKey(a, n = null) {
      if (a?.requestTraits?.isPlaybackInfoRequest !== !0) return "";
      if (a.playbackInfoCacheEnabled !== !0 || Number(a.playbackInfoCacheTtlSec) <= 0)
        return a.playbackInfoCacheState = "skip", a.playbackInfoCacheKey = "", "";
      const s = a.requestMethod;
      if (s !== "GET" && s !== "HEAD" && n?.preparedBodyMode !== "buffered")
        return a.playbackInfoCacheState = "skip", a.playbackInfoCacheKey = "", "";
      const i = n?.preparedBodyMode === "buffered" ? String(n?.preparedBodyText || go(n?.preparedBody)) : "", c = `playback-info:${Yo([
        String(a?.nodeName || "").trim(),
        String(a?.nodeDerivedCacheRevision || "").trim(),
        s,
        String(a?.proxyPath || "").trim(),
        String(a?.requestUrl?.search || "").trim(),
        i ? ce(i) : "",
        e.buildPlaybackInfoAuthSignature(a, n),
        Gt(a?.effectivePlaybackInfoMode),
        String(a?.playbackInfoRewriteUrlMode || "relative")
      ])}`;
      return a.playbackInfoCacheKey = c, c;
    },
    async storePlaybackInfoResponseCache(a, n, s = null, i = null) {
      if (a?.requestTraits?.isPlaybackInfoRequest !== !0) return !1;
      const c = a.playbackInfoCacheKey || e.buildPlaybackInfoCacheKey(a, s);
      return !c || !er(i) || i.response !== n ? !1 : t.set(c, i, {
        nodeName: String(a?.nodeName || "").trim().toLowerCase(),
        nodeRevision: String(a?.nodeDerivedCacheRevision || "").trim(),
        playbackInfoRewrite: String(a?.playbackInfoRewrite || "").trim(),
        ttlMs: Math.max(0, Number(a?.playbackInfoCacheTtlSec) || 0) * 1e3
      });
    },
    async tryServePlaybackInfoResponseCache(a, n = null) {
      if (a?.requestTraits?.isPlaybackInfoRequest !== !0) return null;
      const s = e.buildPlaybackInfoCacheKey(a, n);
      if (!s) return null;
      const i = t.get(s);
      if (!i)
        return a.playbackInfoCacheState = a.playbackInfoCacheState === "skip" ? "skip" : "miss", null;
      const c = i.metadata, l = i.representation, d = l.response, u = l.bodyText;
      a.playbackInfoCacheState = "hit", a.playbackInfoRewrite = String(c?.playbackInfoRewrite || a?.playbackInfoRewrite || "").trim();
      const f = e.buildProxyResponseHeaders(d, a.request, a.dynamicCors, a.finalOrigin, a.requestTraits, {
        enableH3: a.enableH3,
        forceH1: a.forceH1,
        imageCacheMaxAge: a.imageCacheMaxAge
      }), m = e.appendLogDiagnosticDetail(e.extractProxyErrorDetail(d), e.buildRuntimeDiagnosticDetail(a));
      return e.recordAccessLog(a, {
        statusCode: d.status,
        category: e.classifyProxyLogCategory(a.requestTraits),
        errorDetail: m,
        detailJson: e.buildStructuredLogDetail(a, { statusCode: d.status }, {
          deliveryMode: "proxy",
          redirectMode: "playback_info_cache",
          decisionReason: "playback_info_cache_hit",
          playbackInfoCache: a.playbackInfoCacheState,
          playbackInfoCacheTtlSec: a.playbackInfoCacheTtlSec,
          upstreamStatus: d.status
        }),
        outboundColo: ""
      }), new Response(a.requestMethod === "HEAD" ? null : u, {
        status: d.status,
        statusText: d.statusText,
        headers: f
      });
    }
  };
}
function lg(o = {}, e = {}) {
  return {
    parsePlaybackSessionControlPayload(r, t = null) {
      if (r?.playbackSessionControlPayload) return r.playbackSessionControlPayload;
      const a = r?.requestUrl instanceof URL ? r.requestUrl : null, n = {};
      if (a) for (const [d, u] of a.searchParams.entries()) {
        const f = String(d || "").trim().toLowerCase();
        !f || n[f] !== void 0 || (n[f] = u);
      }
      const s = {
        query: n,
        body: {},
        parseError: !1,
        parseMode: "query_only",
        parseErrorReason: ""
      }, i = r.requestMethod;
      if (i === "GET" || i === "HEAD")
        return r && (r.playbackSessionControlPayload = s), s;
      if (t?.preparedBodyMode === "stream")
        return s.parseError = !0, s.parseMode = "stream", s.parseErrorReason = "unbuffered_body", r && (r.playbackSessionControlPayload = s), s;
      const c = String(t?.preparedBodyText || go(t?.preparedBody));
      if (!c.trim())
        return r && (r.playbackSessionControlPayload = s), s;
      const l = String(t?.newHeaders?.get("Content-Type") || r?.request?.headers?.get("Content-Type") || "").toLowerCase().split(";", 1)[0].trim();
      try {
        if (l === "application/json" || l === "text/json" || l === "text/plain" || /^application\/[a-z0-9!#$&^_.+-]+\+json$/i.test(l)) {
          const d = JSON.parse(c);
          if (!U(d)) throw new TypeError("playback_control_body_not_object");
          s.body = Oi(d), s.parseMode = l === "text/plain" ? "text_plain_json" : "json";
        } else if (l === "application/x-www-form-urlencoded") {
          const d = {};
          for (const [u, f] of new URLSearchParams(c).entries()) {
            const m = String(u || "").trim().toLowerCase();
            !m || d[m] !== void 0 || (d[m] = f);
          }
          s.body = d, s.parseMode = "form";
        } else
          s.parseError = !0, s.parseMode = "unsupported", s.parseErrorReason = "unsupported_content_type";
      } catch {
        s.parseError = !0, s.parseMode = l === "text/plain" ? "text_plain_invalid" : "invalid", s.parseErrorReason = "invalid_body";
      }
      return r && (r.playbackSessionControlPayload = s), s;
    },
    resolvePlaybackProgressSessionKey(r, t = null) {
      const a = e.parsePlaybackSessionControlPayload(r, t), n = (g = []) => {
        const h = fs(a.query, g);
        if (String(h || "").trim()) return String(h).trim();
        const y = fs(a.body, g);
        return String(y || "").trim();
      }, s = n(["SessionId"]), i = n(["PlaySessionId"]), c = n(["DeviceId"]), l = n(["ItemId"]), d = String(r?.nodeName || "unknown").trim().toLowerCase() || "unknown";
      let u = "", f = "", m = "weak";
      if (s)
        u = `session:${s}`, f = `session:${s}`, m = "strong";
      else if (i)
        u = `play:${i}`, f = `play:${i}`, m = "strong";
      else if (c)
        u = `device-item:${c}:${l}`, f = `device:${c}`;
      else {
        const g = r?.request?.headers;
        u = `fallback:${Nn([
          g?.get?.("Authorization"),
          g?.get?.("X-Emby-Token"),
          g?.get?.("X-MediaBrowser-Token"),
          g?.get?.("X-Emby-Device-Id"),
          c,
          r?.clientIp,
          l
        ].map((h) => String(h || "").trim()).join("|"))}`, f = u;
      }
      const p = Nn(`${d}|${f}`);
      return {
        sessionKey: `${d}|${u}`,
        sessionIdentityFingerprint: p,
        sessionFingerprint: Nn(`${p}|${l}`),
        sessionStrength: m,
        itemId: l,
        parseError: a.parseError === !0
      };
    }
  };
}
function dg(o = {}, e = {}) {
  const { CacheManager: r } = o;
  return {
    buildPlaybackProgressRelayEntry(t = 0, a = null) {
      return {
        lastForwardAt: 0,
        lastTouchedAt: k(),
        intervalMs: Math.max(0, Number(t) || 0),
        waitUntilCtx: a || null,
        nodeName: "",
        nodeRevision: "",
        pendingSnapshot: null,
        scheduledFlushAt: 0,
        scheduledPromise: null,
        cancelScheduledDelay: null,
        activeFlushPromise: null,
        terminalState: "",
        terminalAt: 0,
        terminalTombstoneUntil: 0
      };
    },
    getPlaybackProgressRelayTerminalTtlMs(t = 0) {
      return Math.max(600 * 1e3, Math.max(1, Number(t) || 0) * 20);
    },
    isPlaybackProgressRelayTerminal(t, a = k()) {
      return !t || String(t.terminalState || "").trim().toLowerCase() !== "stopped" ? !1 : Number(t.terminalTombstoneUntil || 0) > a;
    },
    markPlaybackProgressRelayStopped(t, a) {
      const n = oe.PlaybackProgressRelay;
      if (!(n instanceof Map) || !t) return null;
      const s = Math.max(0, Number(a?.videoProgressForwardIntervalSec) || 0) * 1e3, i = n.get(t) || e.buildPlaybackProgressRelayEntry(s, a?.ctx || null), c = k();
      i.intervalMs = s > 0 ? s : Math.max(0, Number(i.intervalMs) || 0), i.waitUntilCtx = a?.ctx || i.waitUntilCtx || null, i.nodeName = String(a?.nodeName || i.nodeName || "").trim().toLowerCase(), i.nodeRevision = String(a?.nodeDerivedCacheRevision || i.nodeRevision || "").trim();
      try {
        i.cancelScheduledDelay?.();
      } catch {
      }
      return i.cancelScheduledDelay = null, i.scheduledPromise = null, i.pendingSnapshot = null, i.scheduledFlushAt = 0, i.terminalState = "stopped", i.terminalAt = c, i.terminalTombstoneUntil = c + e.getPlaybackProgressRelayTerminalTtlMs(i.intervalMs), i.lastTouchedAt = c, Us(t, i) ? i : (co(i), null);
    },
    cleanupPlaybackProgressRelay(t = k()) {
      const a = oe.PlaybackProgressRelay;
      if (!(a instanceof Map) || a.size <= 0) return;
      const n = Math.max(3e4, Math.max(1, Number(Ci) || 1) * 2e4);
      for (const [i, c] of a) {
        const l = Number(c?.lastTouchedAt || c?.lastForwardAt || 0) || 0, d = !!c?.pendingSnapshot || !!c?.activeFlushPromise, u = Number(c?.terminalTombstoneUntil || 0) || 0;
        if (u > 0) {
          !d && u <= t && Zt(i);
          continue;
        }
        !d && l > 0 && l + n <= t && Zt(i);
      }
      const s = Math.max(1, Number(v.Defaults.VideoProgressForwardSessionMax) || 1);
      for (; a.size > s; ) {
        let i = "";
        for (const [c, l] of a) if (!l?.activeFlushPromise) {
          i = c;
          break;
        }
        if (!i) break;
        Zt(i);
      }
    },
    buildPlaybackProgressSnapshot(t, a, n, s) {
      if (!t || !a || typeof n != "function" || !tt(s) || (a.preparedBodyMode === "buffered" && Number(a.preparedBody?.byteLength) || 0) > wd) return null;
      const i = a.preparedBodyMode === "buffered" && a.preparedBody ? a.preparedBody.slice(0) : a.preparedBody;
      return {
        ctx: t.ctx,
        nodeName: String(t.nodeName || "").trim().toLowerCase(),
        nodeRevision: String(t.nodeDerivedCacheRevision || "").trim(),
        targetRecord: s,
        proxyPath: String(t.proxyPath || "/"),
        requestUrl: new URL(t.requestUrl.toString()),
        buildFetchOptions: n,
        requestMethod: String(t.request?.method || "POST").toUpperCase(),
        preparedBodyMode: a.preparedBodyMode,
        preparedBody: i,
        upstreamTimeoutMs: t.upstreamTimeoutMs
      };
    },
    schedulePlaybackProgressRelayFlush(t, a) {
      if (!a?.pendingSnapshot || a?.scheduledFlushAt > 0 || e.isPlaybackProgressRelayTerminal(a)) return;
      const n = Math.max(0, Number(a.intervalMs) || 0);
      if (n <= 0) return;
      const s = Math.max(k(), Number(a.lastForwardAt) || 0) + n;
      a.scheduledFlushAt = s, a.lastTouchedAt = k();
      const i = Ll(Math.max(0, s - k())), c = (async () => {
        if (!await i.promise) return;
        const d = oe.PlaybackProgressRelay.get(t);
        !d || d !== a || Number(d.scheduledFlushAt) !== s || (d.scheduledFlushAt = 0, await e.flushPlaybackProgressRelayEntry(t, {
          background: !0,
          attachToCtx: !1
        }));
      })().finally(() => {
        a.scheduledPromise === c && (a.scheduledPromise = null, a.cancelScheduledDelay = null);
      });
      a.scheduledPromise = c, a.cancelScheduledDelay = i.cancel;
      const l = a.waitUntilCtx || a.pendingSnapshot?.ctx || null;
      l?.waitUntil && l.waitUntil(c);
    },
    async forwardPlaybackProgressSnapshot(t) {
      if (!t) return null;
      const a = await e.performUpstreamFetch(t.targetRecord, t.proxyPath, t.requestUrl, t.buildFetchOptions, {
        method: t.requestMethod,
        bodyMode: t.preparedBodyMode,
        body: t.preparedBody,
        timeoutMs: t.upstreamTimeoutMs
      });
      try {
        try {
          await a.response.body?.cancel?.();
        } catch {
        }
      } finally {
        try {
          a.releaseFetchController?.();
        } catch {
        }
      }
      return a.response;
    },
    async flushPlaybackProgressRelayEntry(t, a = {}) {
      const n = oe.PlaybackProgressRelay, s = n.get(t);
      if (!s || e.isPlaybackProgressRelayTerminal(s)) return !1;
      if (s.activeFlushPromise) {
        if (a.background === !0) return !1;
        try {
          await s.activeFlushPromise;
        } catch {
        }
      }
      if (!s.pendingSnapshot) return !1;
      const i = s.pendingSnapshot;
      s.pendingSnapshot = null;
      try {
        s.cancelScheduledDelay?.();
      } catch {
      }
      s.cancelScheduledDelay = null, s.scheduledPromise = null, s.scheduledFlushAt = 0, s.lastForwardAt = k(), s.lastTouchedAt = s.lastForwardAt;
      const c = (async () => {
        try {
          return await e.forwardPlaybackProgressSnapshot(i), !0;
        } catch {
          const l = n.get(t);
          return l && l === s && !l.pendingSnapshot && (l.pendingSnapshot = i, l.lastForwardAt = k(), l.lastTouchedAt = l.lastForwardAt), !1;
        } finally {
          const l = n.get(t);
          if (!l || l !== s) return;
          l.activeFlushPromise = null, l.lastTouchedAt = k(), l.pendingSnapshot && e.schedulePlaybackProgressRelayFlush(t, l);
        }
      })();
      return s.activeFlushPromise = c, a.attachToCtx === !0 && s.waitUntilCtx?.waitUntil && s.waitUntilCtx.waitUntil(c), await c === !0;
    },
    async flushPlaybackProgressBeforeStopped(t) {
      const a = String(t?.progressForwardSessionKey || "").trim();
      if (!a) return !1;
      const n = oe.PlaybackProgressRelay.get(a);
      if (!n) return !1;
      if (n.activeFlushPromise) try {
        await n.activeFlushPromise;
      } catch {
      }
      if (!n.pendingSnapshot) return !1;
      try {
        n.cancelScheduledDelay?.();
      } catch {
      }
      return n.cancelScheduledDelay = null, n.scheduledPromise = null, n.scheduledFlushAt = 0, await e.flushPlaybackProgressRelayEntry(a, {
        background: !1,
        attachToCtx: !1
      });
    },
    buildPlaybackProgressThrottleResponse(t) {
      const a = e.buildEdgeResponseHeaders(t.finalOrigin), n = e.buildProgressRelayDiagnosticDetail(t);
      return e.recordAccessLog(t, {
        statusCode: 204,
        category: e.classifyProxyLogCategory(t.requestTraits),
        errorDetail: n,
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
        headers: a
      });
    },
    async maybeHandlePlaybackProgressRelay(t, a, n, s = []) {
      if (t?.requestTraits?.isPlaybackSessionControlRequest !== !0) return null;
      const i = Math.max(0, Number(t?.videoProgressForwardIntervalSec) || 0);
      if (t?.videoProgressForwardEnabled !== !0 || i <= 0 || !t?.ctx?.waitUntil)
        return t.progressForwardMode = "pass_through", null;
      const c = e.resolvePlaybackProgressSessionKey(t, a);
      if (t.progressForwardSessionKey = String(c.sessionKey || "").trim(), c.parseError)
        return t.progressForwardMode = "parse_bypass", null;
      if (t.requestTraits.isPlaybackStartedRequest === !0)
        return t.progressForwardMode = "started_passthrough", t.progressForwardSessionKey && Zt(t.progressForwardSessionKey), null;
      if (t.requestTraits.isPlaybackStoppedRequest === !0)
        return t.progressForwardMode = await e.flushPlaybackProgressBeforeStopped(t) ? "flush_before_stopped" : "stopped_passthrough", t.progressForwardSessionKey && e.markPlaybackProgressRelayStopped(t.progressForwardSessionKey, t), null;
      if (t.requestTraits.isPlaybackProgressRequest !== !0) return null;
      const l = tt(s[0]) ? s[0] : null;
      if (!l)
        return t.progressForwardMode = "pass_through", null;
      if (t.requestMethod !== "GET" && t.requestMethod !== "HEAD" && a?.preparedBodyMode !== "buffered")
        return t.progressForwardMode = "unbuffered_bypass", null;
      const d = oe.PlaybackProgressRelay;
      e.cleanupPlaybackProgressRelay();
      const u = t.progressForwardSessionKey || `fallback:${t.clientIp}:${t.proxyPath}`;
      let f = d.get(u);
      f || (f = e.buildPlaybackProgressRelayEntry(i * 1e3, t.ctx)), f.intervalMs = i * 1e3, f.waitUntilCtx = t.ctx, f.nodeName = String(t.nodeName || "").trim().toLowerCase(), f.nodeRevision = String(t.nodeDerivedCacheRevision || "").trim();
      const m = k();
      if (f.lastTouchedAt = m, e.isPlaybackProgressRelayTerminal(f, m))
        return t.progressForwardMode = "late_progress_dropped_after_stopped", e.buildPlaybackProgressThrottleResponse(t);
      if (f.terminalState = "", f.terminalAt = 0, f.terminalTombstoneUntil = 0, !Us(u, f))
        return co(f), t.progressForwardMode = "capacity_bypass", null;
      if (!(f.lastForwardAt > 0 && m - f.lastForwardAt < f.intervalMs) && !f.activeFlushPromise && !f.pendingSnapshot)
        return f.pendingSnapshot = null, f.scheduledFlushAt = 0, f.lastForwardAt = m, t.progressForwardMode = "forward_now", null;
      const p = e.buildPlaybackProgressSnapshot(t, a, n, l);
      return p ? (f.pendingSnapshot = p, f.lastTouchedAt = m, t.progressForwardMode = "throttled_204", e.schedulePlaybackProgressRelayFlush(u, f), e.buildPlaybackProgressThrottleResponse(t)) : (t.progressForwardMode = "snapshot_bypass", null);
    }
  };
}
function ug(o = {}, e = {}) {
  return {
    ...cg(o, e),
    ...lg(o, e),
    ...dg(o, e)
  };
}
function fg(o = {}, e = {}) {
  const { nodeRepository: r } = o;
  return {
    resolveCorsOrigin(t, a) {
      const n = a.headers.get("Origin"), s = Gs(t);
      return s.corsOrigins.length > 0 ? n && s.corsOriginSet.has(n) ? n : s.corsOrigins[0] : n || "*";
    },
    buildEdgeResponseHeaders(t, a = {}) {
      const n = new Headers({
        "Access-Control-Allow-Origin": t,
        "Cache-Control": "no-store",
        ...a
      });
      return Ce(n), n;
    },
    classifyRequest(t, a, n, s, i = {}) {
      const c = t.method, l = t.headers.get("Range"), d = t.headers.get("If-Range"), u = qr.test(a) || jr.test(a), f = Od.test(a), m = pr.test(a), p = bt.test(a), g = Ni.test(a), h = Uo(a), y = t.headers.get("Upgrade")?.toLowerCase() === "websocket", S = ic(a), _ = cc(a), A = lc(a), b = rf(a), E = _ || A || b, R = vd.test(a) || /\/videos\/[^/]+\/(stream|original|download|file)/i.test(a) || /\/items\/[^/]+\/download/i.test(a) || n.searchParams.get("Static") === "true" || n.searchParams.get("Download") === "true", L = c === "GET" || c === "HEAD", T = R && !p && !g && !m && !u, D = S || h || T || p || g, w = !u && !f && !m && !p && !g && !h && !T && !y, M = i.nodeDirectSource === !0 && L && T, x = i.directStaticAssets === !0 && L && f, C = i.directHlsDash === !0 && L && (p || g), F = M ? "entry_direct_media" : x ? "entry_direct_static_asset" : C ? "entry_direct_hls_dash" : "", W = !!F, O = W;
      return {
        rangeHeader: l,
        ifRangeHeader: d,
        enablePrewarm: s.enablePrewarm !== !1 && !W,
        prewarmCacheTtl: de(s.prewarmCacheTtl, Td, 0, 3600),
        prewarmDepth: Vi(s.prewarmDepth),
        prewarmPrefetchBytes: s.disablePrewarmPrefetch === !0 ? 0 : de(s.prewarmPrefetchBytes, v.Defaults.PrewarmPrefetchBytes, 0, Io),
        isImage: u,
        isStaticFile: f,
        isSubtitle: m,
        isManifest: p,
        isSegment: g,
        isSmartStrmMedia: h,
        isWsUpgrade: y,
        looksLikeVideoRoute: R,
        isBigStream: T,
        isPlaybackCriticalRequest: D,
        isApiRequest: w,
        isPlaybackInfoRequest: S,
        isPlaybackProgressRequest: _,
        isPlaybackStoppedRequest: A,
        isPlaybackStartedRequest: b,
        isPlaybackSessionControlRequest: E,
        isMetadataCacheable: c === "GET" && !y && !W && (u || m || p),
        isCacheableAsset: c === "GET" && !y && (u || f || m || g || p),
        nodeDirectMedia: M,
        directStaticAssets: x,
        directHlsDash: C,
        legacyEntryOffloadEnabled: W,
        legacyEntryOffloadReason: F,
        canStripAuthOnProtocolFallback: L && !w && (h || T || p || g),
        direct307Mode: O
      };
    },
    isEntryDirectDataPlaneMode(t) {
      const a = String(t || "").trim();
      return a === "entry_direct" || a === "legacy_entry_offload";
    },
    buildRoutingDecision(t = {}) {
      const a = String(t.action || "PROXY").trim().toUpperCase() === "DIRECT" ? "DIRECT" : "PROXY", n = String(t.phase || "unknown").trim() || "unknown", s = String(t.reason || "").trim() || (a === "DIRECT" ? "direct" : "proxy"), i = String(t.traceAction || (a === "DIRECT" ? "direct" : "proxy")).trim() || (a === "DIRECT" ? "direct" : "proxy"), c = String(t.traceLabel || s).trim() || s, l = Number(t.redirectStatus);
      return {
        phase: n,
        action: a,
        dataPlaneMode: String(t.dataPlaneMode || "").trim() || (a === "DIRECT" ? "redirect_direct" : "worker_proxy"),
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
        const a = String(t.legacyEntryOffloadReason || "entry_direct").trim() || "entry_direct";
        return e.buildRoutingDecision({
          phase: "entry",
          action: "DIRECT",
          dataPlaneMode: "entry_direct",
          reason: a,
          traceAction: "direct",
          redirectStatus: 307,
          traceLabel: a
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
      const a = t.requestTraits || {}, n = a.nodeDirectMedia ? "entry_direct_media" : a.directStaticAssets ? "entry_direct_static_asset" : a.directHlsDash ? "entry_direct_hls_dash" : "";
      return n ? e.buildRoutingDecision({
        phase: "entry",
        action: "DIRECT",
        dataPlaneMode: "entry_direct",
        reason: n,
        traceAction: "direct",
        redirectStatus: 307,
        traceLabel: n
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
      const a = String(t.phase || "").trim().toLowerCase();
      return a === "entry" ? e.getEntryRoutingDecision(t) : a === "redirect" ? e.getRedirectRoutingDecision(t) : e.buildRoutingDecision({
        phase: a || "unknown",
        action: "PROXY",
        dataPlaneMode: "worker_proxy",
        reason: "unsupported_phase",
        traceAction: "proxy",
        traceLabel: "unsupported_phase"
      });
    },
    getEntryRoutingDecision(t = {}) {
      if (t.forceWorkerProxy === !0) {
        const a = String(t.forceWorkerProxyReason || "").trim() || "link_variant_force_proxy";
        return e.buildRoutingDecision({
          phase: "entry",
          action: "PROXY",
          dataPlaneMode: "worker_proxy",
          reason: a,
          traceAction: "proxy",
          traceLabel: a
        });
      }
      return vr(t.routingDecisionMode) === "legacy" ? e.buildLegacyEntryRoutingDecision(t.requestTraits) : e.buildSimplifiedEntryRoutingDecision(t);
    },
    buildSimplifiedRedirectRoutingDecision(t, a, n, s, i = {}, c = {}) {
      const l = t.origin === a.origin, d = i.forceVideoDirect === !0, u = i.forceVideoProxy === !0, f = Xf(i.currentStatus, n);
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
      return d ? e.buildRoutingDecision({
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
        traceLabel: u ? "node_video_proxy" : "proxy_follow"
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
    evaluateFirewall(t, a, n, s) {
      const i = Gs(t);
      return i.ipBlacklist.has(a) ? new Response("Forbidden by IP Firewall", {
        status: 403,
        headers: e.buildEdgeResponseHeaders(s)
      }) : i.geoAllowlist.size > 0 && !i.geoAllowlist.has(n) || i.geoBlocklist.size > 0 && i.geoBlocklist.has(n) ? new Response("Forbidden by Geo Firewall", {
        status: 403,
        headers: e.buildEdgeResponseHeaders(s)
      }) : null;
    },
    applyRateLimit(t, a, n, s, i) {
      const c = parseInt(t.rateLimitRpm) || 0;
      if (!(c > 0 && n.isPlaybackCriticalRequest !== !0)) return null;
      let l = Je.RateLimitCache.get(a);
      return (!l || s > l.resetAt) && (l = {
        count: 0,
        resetAt: s + 6e4
      }), l.count += 1, Fe(Je.RateLimitCache, a, l, v.Defaults.RateLimitCacheMax), l.count > c ? new Response("Rate Limit Exceeded", {
        status: 429,
        headers: e.buildEdgeResponseHeaders(i)
      }) : null;
    },
    parseTargetRecords(t, a, n = {}) {
      const s = Array.isArray(n.cachedTargetRecords) ? n.cachedTargetRecords : [];
      if (s.length > 0 && s.every(tt)) return {
        targetRecords: s,
        invalidResponse: null
      };
      const i = r.getOrderedNodeLines(t), c = (i.length ? i.map((l) => l.target) : String(t.target || "").split(",").map((l) => l.trim()).filter(Boolean)).map((l) => bn(l)).filter(tt);
      return c.length ? {
        targetRecords: c,
        invalidResponse: null
      } : {
        targetRecords: c,
        invalidResponse: new Response("Invalid Node Target", {
          status: 502,
          headers: e.buildEdgeResponseHeaders(a)
        })
      };
    }
  };
}
function mg(o = {}, e = {}) {
  const { nodeRepository: r } = o;
  return {
    ensureFailoverTelemetry(t) {
      const a = t?.failoverTelemetry && typeof t.failoverTelemetry == "object" ? t.failoverTelemetry : {};
      return a.overlay = String(a.overlay || "").trim(), a.probeReason = String(a.probeReason || "").trim(), a.probeWinner = String(a.probeWinner || "").trim(), a.probeElapsedMs = Math.max(0, Math.round(Number(a.probeElapsedMs) || 0)), a.waitJoinMs = Math.max(0, Math.round(Number(a.waitJoinMs) || 0)), a.demotedTarget = String(a.demotedTarget || "").trim(), a.preferredTarget = String(a.preferredTarget || "").trim(), a.fastFailReason = String(a.fastFailReason || "").trim(), t && typeof t == "object" && (t.failoverTelemetry = a), a;
    },
    isFailoverEligible(t, a = []) {
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
      } : lu(a) < 2 ? {
        eligible: !1,
        reason: "single_target"
      } : {
        eligible: !0,
        reason: "eligible"
      };
    },
    buildFailoverCacheKey(t, a, n) {
      return [
        String(t || "").toLowerCase().trim(),
        String(a || "").trim(),
        String(n || "").trim()
      ].filter(Boolean).join(":");
    },
    pruneFailoverStateEntry(t, a = ia * 1e3, n = k()) {
      if (!t || typeof t != "object") return null;
      t.failingTargets instanceof Map || (t.failingTargets = /* @__PURE__ */ new Map());
      for (const [u, f] of t.failingTargets) Number(f) <= n && t.failingTargets.delete(u);
      Number(t.preferredTargetExpiresAt) <= n && (t.preferredTargetKey = "", t.preferredTargetExpiresAt = 0);
      const s = Number(t.lastProbeResult?.completedAt) || 0;
      t.lastProbeResult && s > 0 && s + Math.max(1e3, Number(a) || 0) <= n && (t.lastProbeResult = null), t.inFlightProbe && Number(t.inFlightProbe.expiresAt) <= n && (t.inFlightProbe = null);
      const i = !!String(t.preferredTargetKey || "").trim(), c = t.failingTargets.size > 0, l = !!t.inFlightProbe, d = !!t.lastProbeResult;
      return i || c || l || d ? t : null;
    },
    getOrCreateFailoverStateEntry(t, a = ia * 1e3) {
      const n = String(t || "").trim();
      if (!n) return null;
      const s = oe.ProxyFailoverStateCache;
      let i = s.get(n);
      (!i || typeof i != "object") && (i = {
        preferredTargetKey: "",
        preferredTargetExpiresAt: 0,
        failingTargets: /* @__PURE__ */ new Map(),
        inFlightProbe: null,
        lastProbeResult: null
      });
      const c = e.pruneFailoverStateEntry(i, a, k()) || i;
      return Fe(s, n, c, sr), c;
    },
    getFailoverStateSnapshot(t, a = ia * 1e3) {
      const n = String(t || "").trim();
      if (!n) return null;
      const s = oe.ProxyFailoverStateCache, i = s.get(n);
      if (!i) return null;
      const c = e.pruneFailoverStateEntry(i, a, k());
      return c ? (on(s, n), {
        preferredTargetKey: String(c.preferredTargetKey || "").trim(),
        failingTargetKeys: [...c.failingTargets.keys()].map((l) => String(l || "").trim()).filter(Boolean),
        probeWinnerTargetKey: String(c.lastProbeResult?.status || "") === "ok" ? String(c.lastProbeResult?.winnerTargetKey || "").trim() : "",
        lastProbeResult: c.lastProbeResult && typeof c.lastProbeResult == "object" ? { ...c.lastProbeResult } : null,
        inFlightProbe: c.inFlightProbe ? {
          startedAt: Number(c.inFlightProbe.startedAt) || 0,
          reason: String(c.inFlightProbe.reason || "").trim()
        } : null
      }) : (s.delete(n), null);
    },
    buildFailoverStateSummary(t) {
      const a = t?.failoverContext && typeof t.failoverContext == "object" ? t.failoverContext : null, n = e.ensureFailoverTelemetry(t), s = a?.cacheKey ? e.getFailoverStateSnapshot(a.cacheKey, a.preferredTtlMs) : null;
      return {
        enabled: a?.enabled === !0,
        eligible: a?.eligible === !0,
        cacheKey: String(a?.cacheKey || "").trim() || null,
        reason: String(a?.eligibilityReason || "").trim() || null,
        overlay: String(n.overlay || "").trim() || null,
        preferredTarget: String(n.preferredTarget || s?.preferredTargetKey || "").trim() || null,
        probeWinner: String(n.probeWinner || s?.probeWinnerTargetKey || "").trim() || null,
        demotedTargets: Array.isArray(s?.failingTargetKeys) ? s.failingTargetKeys : [],
        inFlight: s?.inFlightProbe ? { reason: String(s.inFlightProbe.reason || "").trim() || null } : null
      };
    },
    buildFailoverDiagnosticDetail(t) {
      const a = t?.failoverContext && typeof t.failoverContext == "object" ? t.failoverContext : null;
      if (!a?.enabled) return "";
      const n = e.ensureFailoverTelemetry(t), s = e.buildFailoverStateSummary(t), i = [`Failover=${String(n.overlay || a.eligibilityReason || "ready").trim() || "ready"}`];
      return s.preferredTarget && i.push(`PreferredTarget=${s.preferredTarget}`), n.demotedTarget && i.push(`DemotedTarget=${n.demotedTarget}`), n.probeWinner && i.push(`ProbeWinner=${n.probeWinner}`), n.waitJoinMs > 0 && i.push(`WaitJoin=${n.waitJoinMs}ms`), n.fastFailReason && i.push(`FastFail=${n.fastFailReason}`), i.join(" | ");
    },
    reorderRetryTargetsForFailover(t, a = {}) {
      const n = Array.isArray(t) ? t.slice() : [];
      if (n.length <= 1) return n;
      const s = new Set((Array.isArray(a?.failingTargetKeys) ? a.failingTargetKeys : []).map((m) => String(m || "").trim()).filter(Boolean)), i = String(a?.preferredTargetKey || "").trim(), c = String(a?.probeWinnerTargetKey || "").trim(), l = i && !s.has(i) ? i : c && !s.has(c) ? c : "";
      if (!l && s.size <= 0) return n;
      const d = [], u = [], f = [];
      for (const m of n) {
        const p = je(m);
        if (l && p === l && d.length <= 0 && !s.has(p)) {
          d.push(m);
          continue;
        }
        if (s.has(p)) {
          f.push(m);
          continue;
        }
        u.push(m);
      }
      return [
        ...d,
        ...u,
        ...f
      ];
    },
    prepareFailoverOverlay(t, a = []) {
      const n = e.ensureFailoverTelemetry(t), s = cu(a), i = Math.max(1e3, (Number(t?.hedgePreferredTtlSec) || ia) * 1e3), c = e.isFailoverEligible(t, a), l = e.buildFailoverCacheKey(t?.nodeName, s, t?.nodeDerivedCacheRevision), d = c.eligible ? e.getFailoverStateSnapshot(l, i) : null, u = c.eligible ? e.reorderRetryTargetsForFailover(a, d) : Array.isArray(a) ? a.slice() : [];
      let f = "disabled";
      return t?.hedgeFailoverEnabled === !0 && (c.eligible ? d?.preferredTargetKey ? f = "preferred_reordered" : d?.probeWinnerTargetKey ? f = "probe_hint_reordered" : Array.isArray(d?.failingTargetKeys) && d.failingTargetKeys.length > 0 ? f = "failure_demoted" : f = "ready" : f = c.reason || "ineligible"), n.overlay = f, n.preferredTarget = String(d?.preferredTargetKey || "").trim(), t.failoverContext = {
        enabled: t?.hedgeFailoverEnabled === !0,
        eligible: c.eligible,
        eligibilityReason: c.reason,
        cacheKey: l,
        orderedTargetSignature: s,
        preferredTtlMs: i,
        probePath: Ma(t?.hedgeProbePath, Si),
        probePreferGet: t?.hedgeProbePreferGet !== !1,
        probeTimeoutMs: Math.max(250, Number(t?.hedgeProbeTimeoutMs) || No),
        probeParallelism: Math.max(1, Math.min(2, Number(t?.hedgeProbeParallelism) || _i)),
        waitTimeoutMs: Math.max(250, Number(t?.hedgeWaitTimeoutMs) || bi),
        lockTtlMs: Math.max(1e3, Number(t?.hedgeLockTtlMs) || Ei),
        failureCooldownMs: Math.max(1e3, (Number(t?.hedgeFailureCooldownSec) || Ri) * 1e3),
        wakeJitterMs: Math.max(0, Number(t?.hedgeWakeJitterMs) || Ti),
        originalTargetRecords: Array.isArray(a) ? a.slice() : [],
        retryTargetRecords: u.slice(),
        snapshot: d
      }, u;
    },
    maybeInvalidateHotSnapshotOnFailover(t, a) {
      if (String(t?.targetHotCacheState || "").trim() !== "hit") return;
      const n = je(a);
      n && (Array.isArray(t?.playbackRouteHotTargetRecords) ? t.playbackRouteHotTargetRecords : []).map((s) => je(s)).filter(Boolean).includes(n) && r.invalidatePlaybackRouteHotCache(t?.nodeName, t?.env);
    },
    markFailoverTargetFailure(t, a, n = "", s = {}) {
      const i = t?.failoverContext;
      if (!i?.eligible) return;
      const c = je(a);
      if (!c) return;
      const l = e.ensureFailoverTelemetry(t), d = e.getOrCreateFailoverStateEntry(i.cacheKey, i.preferredTtlMs);
      d && (d.failingTargets.set(c, k() + i.failureCooldownMs), String(d.preferredTargetKey || "").trim() === c && (d.preferredTargetKey = "", d.preferredTargetExpiresAt = 0), Fe(oe.ProxyFailoverStateCache, i.cacheKey, d, sr), l.overlay = String(s.overlay || "target_demoted").trim() || "target_demoted", l.demotedTarget = c, l.fastFailReason = String(n || s.fastFailReason || l.fastFailReason || "").trim(), e.maybeInvalidateHotSnapshotOnFailover(t, a));
    },
    markFailoverBusinessSuccess(t, a, n = {}) {
      const s = t?.failoverContext;
      if (!s?.eligible) return;
      const i = Number(n.status) || 0;
      if (!(i >= 200 && i < 300 || i === 206 || i >= 300 && i < 400)) return;
      const c = je(a);
      if (!c) return;
      const l = e.ensureFailoverTelemetry(t), d = e.getOrCreateFailoverStateEntry(s.cacheKey, s.preferredTtlMs);
      d && (d.failingTargets.delete(c), d.preferredTargetKey = c, d.preferredTargetExpiresAt = k() + s.preferredTtlMs, Fe(oe.ProxyFailoverStateCache, s.cacheKey, d, sr), l.overlay = String(n.overlay || "preferred_promoted").trim() || "preferred_promoted", l.preferredTarget = c);
    },
    getFailoverProbeCandidates(t, a = {}) {
      const n = t?.failoverContext;
      if (!n?.eligible) return [];
      const s = e.getFailoverStateSnapshot(n.cacheKey, n.preferredTtlMs), i = e.reorderRetryTargetsForFailover(n.originalTargetRecords, s), c = /* @__PURE__ */ new Set(), l = /* @__PURE__ */ new Set(), d = je(a.failedTargetRecord), u = je(a.activeTargetRecord), f = String(a.excludeTargetKey || "").trim();
      return d && c.add(d), u && c.add(u), f && c.add(f), i.filter((m) => {
        const p = je(m);
        return !p || c.has(p) || l.has(p) ? !1 : (l.add(p), !0);
      }).slice(0, n.probeParallelism);
    }
  };
}
function pg(o = {}, e = {}) {
  return {
    buildFailoverProbeHeaders() {
      return new Headers({
        Accept: "*/*",
        "Cache-Control": "no-store",
        Pragma: "no-cache"
      });
    },
    async performFailoverProbeRequest(r, t, a, n, s = null) {
      const i = Yp([
        r?.request?.signal,
        r?.requestLifecycle?.signal,
        s
      ]);
      let c = null, l = !1;
      try {
        return n > 0 && (c = setTimeout(() => {
          l = !0, i.abort(`probe_timeout_${n}ms`);
        }, n)), await Be(t.toString(), {
          method: a,
          headers: e.buildFailoverProbeHeaders(),
          redirect: "manual",
          signal: i.signal
        });
      } catch (d) {
        if (l) {
          const u = /* @__PURE__ */ new Error(`probe_timeout_${n}ms`);
          throw u.code = "UPSTREAM_TIMEOUT", u;
        }
        throw r?.requestLifecycle?.getAbortReason?.() && rr(d) ? lr(r.requestLifecycle.getAbortReason()) : d;
      } finally {
        c !== null && clearTimeout(c), i.dispose();
      }
    },
    async runFailoverProbeCandidate(r, t, a = {}) {
      const n = r?.failoverContext, s = n?.probePath || Ma(r?.hedgeProbePath, Si), i = Math.max(250, Number(n?.probeTimeoutMs) || No), c = je(t), l = Fc(t, s);
      if (!l) return {
        ok: !1,
        status: 0,
        targetRecord: t,
        targetKey: c,
        reason: "invalid_probe_target",
        elapsedMs: 0
      };
      const d = k();
      let u = null;
      const f = n?.probePreferGet !== !1;
      let m = f ? "GET" : "HEAD";
      try {
        if (u = await e.performFailoverProbeRequest(r, l, m, i, a.parentSignal || null), !f && (u.status === 405 || u.status === 501)) {
          try {
            u.body?.cancel?.();
          } catch {
          }
          m = "GET", u = await e.performFailoverProbeRequest(r, l, "GET", i, a.parentSignal || null);
        }
        const p = Math.max(0, k() - d);
        if (u.ok) {
          const g = u.status;
          try {
            u.body?.cancel?.();
          } catch {
          }
          return {
            ok: !0,
            status: g,
            targetRecord: t,
            targetKey: c,
            methodUsed: m,
            elapsedMs: p
          };
        }
        try {
          u.body?.cancel?.();
        } catch {
        }
        return {
          ok: !1,
          status: u.status,
          targetRecord: t,
          targetKey: c,
          reason: `probe_status_${Number(u.status) || 0}`,
          elapsedMs: p
        };
      } catch (p) {
        const g = Math.max(0, k() - d), h = String(p?.code || "").trim().toUpperCase(), y = String(r?.requestLifecycle?.getAbortReason?.() || "").trim();
        return y ? {
          ok: !1,
          targetRecord: t,
          targetKey: c,
          reason: y.toLowerCase(),
          elapsedMs: g,
          aborted: !0
        } : String(a.parentSignal?.reason || "").trim() === "probe_winner" && rr(p) ? {
          ok: !1,
          targetRecord: t,
          targetKey: c,
          reason: "probe_winner_aborted",
          elapsedMs: g,
          aborted: !0
        } : {
          ok: !1,
          targetRecord: t,
          targetKey: c,
          reason: h === "UPSTREAM_TIMEOUT" ? "probe_timeout" : "probe_network_error",
          elapsedMs: g,
          aborted: rr(p)
        };
      }
    },
    async runFailoverProbeTask(r, t, a = {}) {
      const n = r?.failoverContext;
      if (!n?.eligible) return {
        status: "skipped",
        reason: "ineligible",
        winnerTargetRecord: null,
        winnerTargetKey: "",
        elapsedMs: 0,
        attempts: []
      };
      const s = Array.isArray(t) ? t.slice(0, n.probeParallelism) : [];
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
      const d = k();
      await Promise.all(s.map(async (S) => {
        const _ = await e.runFailoverProbeCandidate(r, S, { parentSignal: i.signal });
        if (c.push(_), !l && _?.ok === !0) {
          l = _;
          try {
            i.abort("probe_winner");
          } catch {
          }
        }
      }));
      const u = Math.max(0, k() - d), f = e.getOrCreateFailoverStateEntry(n.cacheKey, n.preferredTtlMs), m = l ? "ok" : "miss", p = l ? String(a.reason || "probe_ok").trim() || "probe_ok" : String(c.find((S) => S?.aborted !== !0 && S?.reason)?.reason || "probe_no_winner").trim() || "probe_no_winner", g = l && typeof l == "object" ? l : null, h = String(g ? g.targetKey : "").trim(), y = g ? g.targetRecord : null;
      return f && (f.lastProbeResult = {
        status: m,
        reason: p,
        winnerTargetKey: h,
        completedAt: k(),
        elapsedMs: u
      }, Fe(oe.ProxyFailoverStateCache, n.cacheKey, f, sr)), {
        status: m,
        reason: p,
        winnerTargetRecord: y,
        winnerTargetKey: h,
        elapsedMs: u,
        attempts: c
      };
    },
    startOrJoinFailoverProbe(r, t = {}) {
      const a = r?.failoverContext, n = e.ensureFailoverTelemetry(r);
      if (!a?.eligible) return null;
      const s = e.getOrCreateFailoverStateEntry(a.cacheKey, a.preferredTtlMs), i = k();
      if (s?.inFlightProbe && Number(s.inFlightProbe.expiresAt) > i && s.inFlightProbe.promise)
        return n.overlay = (t.background === !0 ? "background_probe_joined" : "probe_joined").trim(), {
          joined: !0,
          startedAt: Number(s.inFlightProbe.startedAt) || i,
          promise: s.inFlightProbe.promise
        };
      const c = e.getFailoverProbeCandidates(r, t);
      if (!c.length)
        return n.fastFailReason = "no_probe_candidates", n.overlay = "no_probe_candidates", {
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
      const l = `${i}-${Math.random().toString(36).slice(2, 10)}`, d = e.runFailoverProbeTask(r, c, t).finally(() => {
        const u = e.getOrCreateFailoverStateEntry(a.cacheKey, a.preferredTtlMs);
        !u?.inFlightProbe || String(u.inFlightProbe.token || "").trim() !== l || (u.inFlightProbe = null, Fe(oe.ProxyFailoverStateCache, a.cacheKey, u, sr));
      });
      return s && (s.inFlightProbe = {
        token: l,
        startedAt: i,
        expiresAt: i + a.lockTtlMs,
        reason: String(t.reason || "").trim(),
        promise: d
      }, Fe(oe.ProxyFailoverStateCache, a.cacheKey, s, sr)), n.overlay = (t.background === !0 ? "background_probe_started" : "probe_started").trim(), {
        joined: !1,
        startedAt: i,
        promise: d
      };
    },
    async maybeRunForegroundFailoverWait(r, t = {}) {
      const a = r?.execution, n = a?.failoverContext, s = e.ensureFailoverTelemetry(a);
      if (!n?.eligible || a?.failoverForegroundWaitUsed === !0) return null;
      a.failoverForegroundWaitUsed = !0;
      const i = t.targetRecord, c = Number(t.responseStatus) || 0, l = String(t.reason || (c > 0 ? `upstream_status_${c}` : "retryable_failure")).trim() || "retryable_failure";
      e.markFailoverTargetFailure(a, i, l, { overlay: "failure_demoted" });
      const d = e.startOrJoinFailoverProbe(a, {
        reason: l,
        failedTargetRecord: i
      });
      if (!d?.promise) return null;
      const u = await Jp(d.promise, n.waitTimeoutMs, a?.requestLifecycle);
      if (s.waitJoinMs = u.timedOut === !0 ? n.waitTimeoutMs : Math.max(0, k() - Number(d.startedAt || k())), u.timedOut === !0)
        return s.overlay = "probe_wait_timeout", s.fastFailReason = "probe_wait_timeout", null;
      const f = u.value && typeof u.value == "object" ? u.value : null;
      if (s.probeReason = d.joined === !0 ? "join_existing_probe" : l, s.probeElapsedMs = Math.max(0, Number(f?.elapsedMs) || 0), s.probeWinner = String(f?.winnerTargetKey || "").trim(), !f || f.status !== "ok" || !tt(f.winnerTargetRecord))
        return s.overlay = "probe_miss", s.fastFailReason = String(f?.reason || "probe_no_winner").trim() || "probe_no_winner", null;
      const m = je(i), p = je(f.winnerTargetRecord);
      if (!p || p === m)
        return s.overlay = "probe_miss", s.fastFailReason = "probe_reused_failed_target", null;
      n.wakeJitterMs > 0 && await Qp(Math.floor(Math.random() * (n.wakeJitterMs + 1)), a?.requestLifecycle);
      try {
        const g = await e.performUpstreamFetch(f.winnerTargetRecord, r.proxyPath, r.requestUrl, r.buildFetchOptions, {
          isRetry: !0,
          protocolFallbackRetry: r.protocolFallbackRetry === !0,
          stripAuthOnProtocolFallback: r.stripAuthOnProtocolFallback === !0,
          timeoutMs: r.upstreamTimeoutMs,
          requestLifecycle: r.requestLifecycle,
          useFastSegmentBuilder: !1
        });
        if (s.overlay = "wake_retry", g.response.status === 101 || !r.retryableStatuses.has(g.response.status)) return { upstream: g };
        e.markFailoverTargetFailure(a, f.winnerTargetRecord, `upstream_status_${g.response.status}`, { overlay: "wake_retry_failed" }), s.fastFailReason = `wake_retry_status_${g.response.status}`;
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
        ].includes(h) || (e.markFailoverTargetFailure(a, f.winnerTargetRecord, h || "wake_retry_error", { overlay: "wake_retry_failed" }), s.fastFailReason = String(h || "wake_retry_error").trim().toLowerCase() || "wake_retry_error"), g && typeof g == "object") {
          const y = hr(f.winnerTargetRecord, r.proxyPath);
          y.search = String(r.requestUrl?.search || ""), g.lastFinalUrl = y, g.lastTargetRecord = f.winnerTargetRecord, g.lastTargetBase = f.winnerTargetRecord?.targetUrl || null;
        }
        if ([
          "CLIENT_ABORTED",
          "DOWNSTREAM_CANCELLED",
          "REQUEST_ABORTED"
        ].includes(h)) throw g;
        return { error: g };
      }
    },
    maybeScheduleBackgroundFailoverRefresh(r, t = {}) {
      const a = r?.failoverContext;
      if (!a?.eligible || !r?.ctx) return;
      const n = e.getFailoverStateSnapshot(a.cacheKey, a.preferredTtlMs);
      if ((Array.isArray(n?.failingTargetKeys) ? n.failingTargetKeys : []).length <= 0) return;
      const s = Number(n?.lastProbeResult?.completedAt) || 0;
      if (s > 0 && s + a.preferredTtlMs > k() || n?.inFlightProbe) return;
      const i = e.startOrJoinFailoverProbe(r, {
        reason: "stale_refresh",
        activeTargetRecord: t?.activeTargetRecord || null,
        background: !0
      });
      i?.promise && r.ctx.waitUntil(Promise.resolve(i.promise).catch(() => {
      }));
    }
  };
}
function gg(o = {}, e = {}) {
  return {
    ...fg(o, e),
    ...mg(o, e),
    ...pg(o, e)
  };
}
function hg(o = {}, e = {}) {
  const {} = o, r = {
    async buildProxyRequestState(t, a, n, s, i, c, l, d, u = {}) {
      const f = Hp(t.headers);
      Xn.forEach((x) => f.delete(x));
      const m = /* @__PURE__ */ new Set();
      let p = null;
      if (a.headers && typeof a.headers == "object") for (const [x, C] of Object.entries(a.headers)) {
        const F = String(x).toLowerCase();
        Xn.has(F) || (m.add(F), F === "cookie" ? p = String(C) : f.set(x, String(C)));
      }
      const g = cp(f.get("Cookie"), p, ["auth_token", ...hn]);
      g ? f.set("Cookie", g) : f.delete("Cookie"), Kp(f, u.effectiveMediaAuthMode || a.mediaAuthMode);
      const h = bu(u.effectiveRealClientIpMode || a.realClientIpMode);
      h === "none" && Fd.forEach((x) => f.delete(x)), (h === "full" || h === "real-ip-only") && f.set("X-Real-IP", i), h === "full" && f.set("X-Forwarded-For", i), f.set("X-Forwarded-Host", s.host), f.set("X-Forwarded-Proto", s.protocol.replace(":", "")), c.isWsUpgrade ? (f.set("Upgrade", "websocket"), f.set("Connection", "Upgrade")) : l && f.set("Connection", "keep-alive"), (c.isBigStream || c.isSmartStrmMedia || c.isSegment || c.isManifest) && !m.has("referer") && f.delete("Referer");
      const y = m.has("origin"), S = m.has("referer"), _ = f.has("Origin"), A = f.has("Referer");
      let b = "", E = "/";
      if (A && !S) try {
        const x = new URL(f.get("Referer") || "");
        b = String(x.origin || "").trim(), E = `${x.pathname || "/"}${x.search || ""}` || "/";
      } catch {
        b = "", E = "/";
      }
      const R = {
        baseHeaderEntries: [...f.entries()],
        hasOriginHeader: _,
        hasRefererHeader: A,
        adminCustomHasOrigin: y,
        adminCustomHasReferer: S,
        refererOrigin: b,
        refererPathAndSearch: E,
        isHotMediaRequest: c.isSmartStrmMedia === !0 || c.isBigStream === !0 || c.isManifest === !0 || c.isSegment === !0
      }, L = t.method !== "GET" && t.method !== "HEAD";
      let T = null, D = "none", w = "";
      if (L && t.body) {
        const x = po(t.headers.get("Content-Length"));
        if (Number.isFinite(x) && x >= 0 && x <= Ed) try {
          T = await t.clone().arrayBuffer(), D = "buffered", (c.isPlaybackInfoRequest === !0 || c.isPlaybackSessionControlRequest === !0) && (w = go(T));
        } catch {
          T = t.body, D = "stream";
        }
        else
          T = t.body, D = "stream";
      }
      const M = L ? d.slice(0, 1) : d;
      return {
        newHeaders: f,
        adminCustomHeaders: m,
        transportTemplate: R,
        preparedBody: T,
        preparedBodyMode: D,
        preparedBodyText: w,
        retryTargetRecords: M,
        allowAutomaticRetry: !L,
        clientRedirectAuthPolicy: wa(f)
      };
    },
    buildProxyResponseHeaders(t, a, n, s, i, c = {}) {
      const l = new Headers(t.headers);
      Ud.forEach((f) => l.delete(f)), l.set("Access-Control-Allow-Origin", s), n && n["Access-Control-Expose-Headers"] && l.set("Access-Control-Expose-Headers", n["Access-Control-Expose-Headers"]), n && n["Access-Control-Allow-Methods"] && l.set("Access-Control-Allow-Methods", n["Access-Control-Allow-Methods"]);
      const d = a.headers.get("Access-Control-Request-Headers");
      d ? (l.set("Access-Control-Allow-Headers", d), Kr(l, "Access-Control-Request-Headers")) : n && n["Access-Control-Allow-Headers"] && l.set("Access-Control-Allow-Headers", n["Access-Control-Allow-Headers"]), s !== "*" && Kr(l, "Origin"), (!c.enableH3 || c.forceH1) && l.delete("Alt-Svc");
      const u = de(c.imageCacheMaxAge, wi * 86400, 0, 365 * 86400);
      if (t.status >= 400 || i.isManifest || i.isBigStream || i.isSmartStrmMedia) l.set("Cache-Control", "no-store");
      else if (c.proxiedExternalRedirect) l.set("Cache-Control", "no-store");
      else if (i.isImage || i.isStaticFile || i.isSubtitle) {
        const f = Sp(a) ? "private" : "public";
        l.set("Cache-Control", `${f}, max-age=${u}`);
      }
      return Ce(l), l;
    },
    applyProxyRedirectHeaders(t, a, n, s, i, c, l, d = {}) {
      if (c) {
        Hc(t), t.set("Location", c.toString()), t.set("Cache-Control", "no-store");
        return;
      }
      if (!(a.status >= 300 && a.status < 400)) return;
      const u = t.get("Location");
      if (!u) return;
      const f = ks(Ca(u, l || n), n, s, i, {
        linkVariant: d.linkVariant,
        entryMode: d.entryMode
      });
      f && t.set("Location", f);
    },
    buildClientVisibleRedirectUrl(t, a, n, s, i, c = {}) {
      const l = t instanceof URL ? t : Ca(t, a);
      if (!l) return null;
      if (c.preserveWorkerProxy !== !0) return l;
      const d = ks(l, a, n, s, {
        linkVariant: c.linkVariant,
        entryMode: c.entryMode
      }), u = Et(n, s, {
        linkVariant: c.linkVariant,
        entryMode: c.entryMode
      });
      if (!d || !String(d).startsWith(u)) return l;
      try {
        const f = i instanceof URL ? i : new URL(String(i || ""));
        return new URL(d, f);
      } catch {
        return l;
      }
    },
    buildPlaybackInfoClientVisibleUrl(t, a = "/", n = {}) {
      const s = ee(a), i = String(n.search || ""), c = String(n.hash || "");
      return String(t?.playbackInfoRewriteUrlMode || "").trim() === "absolute" ? kc(t?.requestUrl || t?.rawRequestUrl || "https://playback-info.local/", t?.nodeName, t?.nodeKey, s, {
        linkVariant: t?.linkVariant,
        entryMode: t?.entryMode,
        search: i,
        hash: c
      }).toString() : `${sp(np(s, t?.nodeName, t?.nodeKey, { entryMode: t?.entryMode }), op(t))}${i}${c}`;
    },
    buildPlaybackInfoProxyUrl(t, a, n, s) {
      const i = String(a || "").trim();
      if (!i) return "";
      const c = Zm(i, t?.proxyPath || "/", n, t?.requestUrl || t?.rawRequestUrl || s, Et(t?.nodeName, t?.nodeKey, {
        linkVariant: t?.linkVariant,
        entryMode: t?.entryMode
      }));
      if (c) return r.buildPlaybackInfoClientVisibleUrl(t, c.proxyPath, {
        search: c.search,
        hash: c.hash
      });
      let l;
      try {
        const u = s instanceof URL ? s : new URL(String(s || ""));
        l = new URL(i, u);
      } catch {
        return i;
      }
      if (!["http:", "https:"].includes(String(l.protocol || "").toLowerCase())) return i;
      if (n) {
        const { resolvedUrl: u, proxyPath: f } = xa(l, n);
        if (u && f) {
          const m = ep(f, t?.proxyPath || "/", n);
          return r.buildPlaybackInfoClientVisibleUrl(t, m, {
            search: u.search,
            hash: u.hash
          });
        }
      }
      const d = ap(t?.requestUrl || t?.rawRequestUrl || "https://playback-info.local/", t?.nodeName, t?.nodeKey, l, {
        linkVariant: t?.linkVariant,
        entryMode: t?.entryMode
      });
      return String(t?.playbackInfoRewriteUrlMode || "").trim() === "absolute" ? d.toString() : r.buildPlaybackInfoClientVisibleUrl(t, d.pathname || "/", {
        search: d.search || "",
        hash: d.hash || ""
      });
    },
    sanitizePlaybackInfoSerializedResponseHeaders: _o,
    parsePlaybackInfoRootObject: Va,
    buildPlaybackInfoContractErrorState(t, a, n = "invalid_payload", s = null) {
      const i = a?.response;
      return t.playbackInfoRewrite = "rejected", e.buildProxyErrorState(t, a, {
        message: "Upstream PlaybackInfo response must be a JSON object.",
        guardHeader: "X-Proxy-Contract-Guard",
        guardValue: "playback-info",
        details: U(s) ? s : {
          reason: String(n || "invalid_payload"),
          upstreamStatus: Number(i?.status) || 0,
          contentType: ur(i?.headers?.get?.("Content-Type")) || "missing"
        }
      });
    },
    async guardPlaybackInfoResponseContract(t, a) {
      if (t?.requestTraits?.isPlaybackInfoRequest !== !0 || er(a?.playbackInfoRepresentation) && a.playbackInfoRepresentation.response === a?.response) return a;
      const n = await Sl(a?.response, {
        requestMethod: t.requestMethod,
        maxBytes: Ai
      });
      return n.kind === "skip" ? a : n.kind === "invalid" ? r.buildPlaybackInfoContractErrorState(t, a, n.reason, n.details) : {
        ...a,
        playbackInfoRepresentation: n.representation
      };
    },
    decodePlaybackInfoJsonValue: ja,
    normalizePlaybackInfoObjectArray: bo,
    sanitizePlaybackInfoMediaSource: Ys,
    sanitizePlaybackInfoMediaSourcesPayload: Eo,
    rewritePlaybackInfoPayload(t, a, n, s) {
      return Js(a, { buildProxyUrl: (i) => r.buildPlaybackInfoProxyUrl(t, i, n, s) });
    },
    async maybeRewritePlaybackInfoResponse(t, a) {
      if (t?.requestTraits?.isPlaybackInfoRequest !== !0) return a;
      const n = Gt(t?.effectivePlaybackInfoMode) === "rewrite", s = n ? "not_needed" : "passthrough", i = a?.response;
      if (!i || !(i.status >= 200 && i.status < 300) || t.requestMethod === "HEAD" || i.status === 204 || i.status === 205 || !i.body)
        return t.playbackInfoRewrite !== "rejected" && (t.playbackInfoRewrite = s), a;
      if ((!er(a?.playbackInfoRepresentation) || a.playbackInfoRepresentation.response !== i) && (a = await r.guardPlaybackInfoResponseContract(t, a), !er(a?.playbackInfoRepresentation)))
        return a;
      try {
        const c = _l(a.playbackInfoRepresentation, {
          rewriteEnabled: n,
          buildProxyUrl: (l) => r.buildPlaybackInfoProxyUrl(t, l, a?.activeTargetBase, a?.finalUrl || new URL(String(t?.requestUrl || t?.rawRequestUrl || "")))
        });
        return c.kind !== "valid" ? r.buildPlaybackInfoContractErrorState(t, a, c.reason || "normalization_failed") : (t.playbackInfoRewrite = c.rewriteState, {
          ...a,
          response: c.representation.response,
          playbackInfoRepresentation: c.representation
        });
      } catch {
        return r.buildPlaybackInfoContractErrorState(t, a, "normalization_failed");
      }
    }
  };
  return r;
}
function yg({ configReader: o, nodeRepository: e, logger: r, cachePort: t, fetchPort: a }) {
  const n = {}, s = {
    CacheManager: t,
    Logger: r,
    configReader: o,
    fetchPort: a,
    nodeRepository: e
  }, i = [
    rg(s, n),
    ig(s, n),
    ug(s, n),
    gg(s, n),
    hg(s, n)
  ];
  for (const c of i) for (const [l, d] of Object.entries(c)) n[l] = d;
  return n;
}
function Sg({ configReader: o, nodeRepository: e, logger: r, cachePort: t, fetchPort: a }) {
  const n = yg({
    configReader: o,
    nodeRepository: e,
    logger: r,
    cachePort: t,
    fetchPort: a
  });
  return Object.freeze({
    handle: (...s) => n.handle(...s),
    testingSupport: n
  });
}
function _g(o = {}, e = {}) {
  const { CacheManager: r, withAdminShellRuntimeStatus: t } = o;
  return {
    getStatsBucketParts(a, n = v.Defaults.ScheduleUtcOffsetMinutes) {
      const s = xt(Number(a) || 0, n);
      return {
        bucketDate: s.dateKey,
        bucketHour: s.hour
      };
    },
    summarizeStatsHourlyEntries(a = [], n = {}) {
      const s = Ke(n.utcOffsetMinutes), i = /* @__PURE__ */ new Map();
      for (const c of Array.isArray(a) ? a : []) {
        const l = Number(c?.timestamp) || 0;
        if (l <= 0) continue;
        const { bucketDate: d, bucketHour: u } = e.getStatsBucketParts(l, s), f = `${d}:${u}`, m = i.get(f) || {
          bucketDate: d,
          bucketHour: u,
          requestCount: 0,
          playCount: 0,
          playbackInfoCount: 0
        };
        m.requestCount += 1, wu(c?.requestPath, c?.category) && (m.playCount += 1), Cu(c?.requestPath, c?.category) && (m.playbackInfoCount += 1), i.set(f, m);
      }
      return [...i.values()].sort((c, l) => c.bucketDate !== l.bucketDate ? String(c.bucketDate).localeCompare(String(l.bucketDate)) : Number(c.bucketHour) - Number(l.bucketHour));
    },
    async incrementStatsHourly(a, n = [], s = {}) {
      if (!a || !await e.hasStatsHourlyTable(a)) return !1;
      const i = e.summarizeStatsHourlyEntries(n, s);
      return i.length ? await e.upsertStatsHourlyBuckets(a, i, s) : !0;
    },
    async upsertStatsHourlyBuckets(a, n = [], s = {}) {
      if (!a || !await e.hasStatsHourlyTable(a)) return !1;
      const i = (Array.isArray(n) ? n : []).map((d) => ({
        bucketDate: String(d?.bucketDate || "").trim(),
        bucketHour: Math.max(0, Number(d?.bucketHour) || 0),
        requestCount: Math.max(0, Number(d?.requestCount) || 0),
        playCount: Math.max(0, Number(d?.playCount) || 0),
        playbackInfoCount: Math.max(0, Number(d?.playbackInfoCount) || 0)
      })).filter((d) => d.bucketDate);
      if (!i.length) return !0;
      const c = (/* @__PURE__ */ new Date()).toISOString(), l = i.map((d) => a.prepare(`INSERT INTO ${e.STATS_HOURLY_TABLE} (
            bucket_date, bucket_hour, request_count, play_count, playback_info_count, updated_at
          ) VALUES (?, ?, ?, ?, ?, ?)
          ON CONFLICT(bucket_date, bucket_hour) DO UPDATE SET
            request_count = ${e.STATS_HOURLY_TABLE}.request_count + excluded.request_count,
            play_count = ${e.STATS_HOURLY_TABLE}.play_count + excluded.play_count,
            playback_info_count = ${e.STATS_HOURLY_TABLE}.playback_info_count + excluded.playback_info_count,
            updated_at = excluded.updated_at`).bind(d.bucketDate, d.bucketHour, d.requestCount, d.playCount, d.playbackInfoCount, c));
      if (s.useBatch === !1) for (const d of l) await d.run();
      else
        for (let u = 0; u < l.length; u += 50) await a.batch(l.slice(u, u + 50));
      return !0;
    },
    async clearStatsHourly(a) {
      return !a || !await e.hasStatsHourlyTable(a) ? !1 : (await a.prepare(`DELETE FROM ${e.STATS_HOURLY_TABLE}`).run(), !0);
    },
    getStatsUtcOffsetMinutesFromStatus(a = {}) {
      const n = Number(a?.statsUtcOffsetMinutes);
      return Number.isFinite(n) ? Ke(n) : null;
    },
    async getDailyStatsHourly(a, n) {
      if (!a || !n || !await e.hasStatsHourlyTable(a)) return [];
      try {
        const s = await a.prepare(`SELECT bucket_hour, request_count, play_count, playback_info_count
              FROM ${e.STATS_HOURLY_TABLE}
              WHERE bucket_date = ?
              ORDER BY bucket_hour ASC`).bind(String(n)).all();
        return Array.isArray(s?.results) ? s.results : [];
      } catch {
        return [];
      }
    },
    async rebuildStatsHourlyForDate(a, n = {}) {
      if (!a) return !1;
      const s = String(n.bucketDate || "").trim();
      return s ? (await e.ensureStatsHourlySchema(a), await a.prepare(`DELETE FROM ${e.STATS_HOURLY_TABLE} WHERE bucket_date = ?`).bind(s).run(), !0) : !1;
    },
    async rebuildStatsHourlyWindow(a, n = {}) {
      return a ? (await e.ensureStatsHourlySchema(a), await e.clearStatsHourly(a), !0) : !1;
    },
    async ensureStatsHourlyWindowAligned(a, n = {}) {
      const s = e.resolveOpsStatusStores(a), i = s?.db || null;
      if (!i || !await e.hasStatsHourlyTable(i)) return {
        rebuilt: !1,
        reason: "stats_unavailable"
      };
      const c = re(n.config || {}), l = Ke(c.scheduleUtcOffsetMinutes), d = await e.getOpsStatusSection(s, "log");
      if (e.getStatsUtcOffsetMinutesFromStatus(d) === l && n.force !== !0) return {
        rebuilt: !1,
        reason: "already_aligned",
        utcOffsetMinutes: l
      };
      const u = n.now instanceof Date ? n.now : /* @__PURE__ */ new Date(), f = de(c.logRetentionDays, v.Defaults.LogRetentionDays, 1, v.Defaults.LogRetentionDaysMax), m = Math.max(0, u.getTime() - f * 24 * 60 * 60 * 1e3), p = u.getTime();
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
    async dropLogsFtsSyncTriggers(a) {
      if (!a) return 0;
      let n = 0, s = [];
      try {
        s = (await a.prepare("SELECT name, sql FROM sqlite_master WHERE type = 'trigger' AND tbl_name = ?").bind(e.LOGS_TABLE).all())?.results || [];
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
      ].map((d) => String(d || "").toLowerCase()));
      for (const d of s) {
        const u = String(d?.name || "").trim();
        if (!u) continue;
        const f = u.toLowerCase(), m = za(d?.sql || "");
        (l.has(f) || m.includes(i)) && (await a.prepare(`DROP TRIGGER IF EXISTS ${fe(u)}`).run(), n += 1);
      }
      return n;
    },
    async rebuildLogsFts(a) {
      return !a || !await e.hasLogsFtsTable(a) ? !1 : (await a.prepare(`INSERT INTO ${e.LOGS_FTS_TABLE}(${e.LOGS_FTS_TABLE}) VALUES('rebuild')`).run(), !0);
    },
    async ensureLogsFtsSchema(a, n = {}) {
      if (!a) return {
        migratedRows: 0,
        droppedTriggers: 0,
        rebuilt: !1,
        recreated: !1
      };
      const s = n.forceRecreate === !0;
      await e.ensureLogsBaseSchema(a);
      const i = await e.getLogsFtsReadiness(a);
      if (i.ready && !s) return {
        migratedRows: 0,
        droppedTriggers: 0,
        rebuilt: !1,
        recreated: !1
      };
      if (i.tableReady && !s) {
        const u = /* @__PURE__ */ new Error("Existing FTS schema does not match the current contract");
        throw u.code = "D1_SCHEMA_INCOMPATIBLE", u.status = 409, u.details = { phase: "fts_preflight" }, u;
      }
      let c = !1, l = 0;
      s && (l = await e.dropLogsFtsSyncTriggers(a), await a.prepare(`DROP TABLE IF EXISTS ${e.LOGS_FTS_TABLE}`).run(), c = !0), await a.prepare(`CREATE VIRTUAL TABLE IF NOT EXISTS ${e.LOGS_FTS_TABLE} USING fts5(node_name, request_path, user_agent, error_detail, detail_json, content='${e.LOGS_TABLE}', content_rowid='id', tokenize='unicode61')`).run(), s && (l += await e.dropLogsFtsSyncTriggers(a)), await a.prepare(`CREATE TRIGGER IF NOT EXISTS ${e.LOGS_FTS_INSERT_TRIGGER} AFTER INSERT ON ${e.LOGS_TABLE} BEGIN
            INSERT INTO ${e.LOGS_FTS_TABLE}(rowid, node_name, request_path, user_agent, error_detail, detail_json)
            VALUES (new.id, new.node_name, new.request_path, COALESCE(new.user_agent, ''), COALESCE(new.error_detail, ''), COALESCE(new.detail_json, ''));
          END;`).run();
      const d = (await a.prepare(`SELECT COUNT(*) as total FROM ${e.LOGS_TABLE}`).first())?.total || 0;
      return await a.prepare(`INSERT INTO ${e.LOGS_FTS_TABLE}(${e.LOGS_FTS_TABLE}) VALUES('rebuild')`).run(), {
        migratedRows: d,
        droppedTriggers: l,
        rebuilt: !0,
        recreated: c
      };
    }
  };
}
function bg(o = {}, e = {}) {
  const { CacheManager: r, withAdminShellRuntimeStatus: t } = o;
  return {
    async ensureDnsIpWorkspaceSchema(a) {
      if (!a) return !1;
      if (e.isD1SchemaReadyCached(a, "dnsIpWorkspaceSchema")) return !0;
      let n = Z.DnsIpWorkspaceDbReady.get(a);
      n || (n = (async () => (await a.prepare(`CREATE TABLE IF NOT EXISTS ${e.DNS_IP_POOL_ITEMS_TABLE} (
                id TEXT PRIMARY KEY,
                ip TEXT NOT NULL UNIQUE,
                ip_type TEXT NOT NULL,
                source_kind TEXT NOT NULL,
                source_label TEXT,
                line_label TEXT NOT NULL DEFAULT '',
                remark TEXT,
                created_at TEXT NOT NULL,
                updated_at TEXT NOT NULL
              )`).run(), await a.prepare(`CREATE INDEX IF NOT EXISTS idx_dns_ip_pool_items_updated_ip ON ${e.DNS_IP_POOL_ITEMS_TABLE} (updated_at DESC, ip ASC)`).run(), await a.prepare(`CREATE TABLE IF NOT EXISTS ${e.DNS_IP_POOL_SOURCES_TABLE} (
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
              )`).run(), await a.prepare(`CREATE INDEX IF NOT EXISTS idx_dns_ip_pool_sources_sort ON ${e.DNS_IP_POOL_SOURCES_TABLE} (sort_order ASC, updated_at ASC)`).run(), await a.prepare(`CREATE TABLE IF NOT EXISTS ${e.DNS_IP_POOL_FETCH_CACHE_TABLE} (
                signature TEXT PRIMARY KEY,
                items_json TEXT NOT NULL,
                source_results_json TEXT NOT NULL,
                imported_count INTEGER NOT NULL DEFAULT 0,
                enabled_source_count INTEGER NOT NULL DEFAULT 0,
                cached_at INTEGER NOT NULL,
                expires_at INTEGER NOT NULL,
                created_at TEXT NOT NULL,
                updated_at TEXT NOT NULL
              )`).run(), await a.prepare(`CREATE INDEX IF NOT EXISTS idx_dns_ip_pool_fetch_cache_expires ON ${e.DNS_IP_POOL_FETCH_CACHE_TABLE} (expires_at)`).run(), await a.prepare(`CREATE TABLE IF NOT EXISTS ${e.DNS_IP_PROBE_CACHE_TABLE} (
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
              )`).run(), await a.prepare(`CREATE INDEX IF NOT EXISTS idx_dns_ip_probe_cache_expire ON ${e.DNS_IP_PROBE_CACHE_TABLE} (expires_at)`).run(), await a.prepare(`CREATE INDEX IF NOT EXISTS idx_dns_ip_probe_cache_colo_ip_expires ON ${e.DNS_IP_PROBE_CACHE_TABLE} (entry_colo, ip, expires_at)`).run(), e.markD1SchemaReady(a, "dnsIpWorkspaceSchema"), !0))().catch((s) => {
        throw Z.DnsIpWorkspaceDbReady.delete(a), s;
      }), Z.DnsIpWorkspaceDbReady.set(a, n));
      try {
        return await n;
      } finally {
        Z.DnsIpWorkspaceDbReady.get(a) === n && Z.DnsIpWorkspaceDbReady.delete(a);
      }
    },
    getDnsIpPoolRevisionFromStatus(a = {}) {
      const n = String(a?.revision || "").trim();
      return n || Bt("dns_ip_pool", String(a?.updatedAt || "").trim());
    },
    async bumpDnsIpPoolRevision(a, n = {}, s = null) {
      const i = await e.getOpsStatusSection(a, "dnsIpPool"), c = (/* @__PURE__ */ new Date()).toISOString(), l = ce(`${e.getDnsIpPoolRevisionFromStatus(i)}:${c}:${Q(n)}`);
      return await e.patchOpsStatus(a, { dnsIpPool: {
        ...n,
        revision: Bt(l, c),
        updatedAt: c
      } }, s);
    },
    async getDnsIpPoolItems(a) {
      if (!a) return [];
      await e.ensureDnsIpWorkspaceSchema(a);
      try {
        const n = await a.prepare(`SELECT id, ip, ip_type, source_kind, source_label, line_label, remark, created_at, updated_at
              FROM ${e.DNS_IP_POOL_ITEMS_TABLE}
              ORDER BY updated_at DESC, ip ASC`).all();
        return (Array.isArray(n?.results) ? n.results : []).map((s) => fr(s)).filter(Boolean);
      } catch {
        return [];
      }
    },
    async upsertDnsIpPoolItems(a, n = [], s = {}) {
      if (!a) return [];
      await e.ensureDnsIpWorkspaceSchema(a);
      const i = (/* @__PURE__ */ new Date()).toISOString(), c = /* @__PURE__ */ new Map();
      for (const u of Array.isArray(n) ? n : []) {
        const f = fr(u, {
          createdAt: i,
          updatedAt: i,
          sourceKind: s.sourceKind,
          sourceLabel: s.sourceLabel
        });
        f && c.set(f.ip.toLowerCase(), f);
      }
      const l = [...c.values()];
      if (!l.length) return [];
      const d = l.map((u) => a.prepare(`INSERT INTO ${e.DNS_IP_POOL_ITEMS_TABLE} (
            id, ip, ip_type, source_kind, source_label, line_label, remark, created_at, updated_at
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
          ON CONFLICT(ip) DO UPDATE SET
            ip_type = excluded.ip_type,
            source_kind = excluded.source_kind,
            source_label = excluded.source_label,
            line_label = CASE WHEN COALESCE(excluded.line_label, '') != '' THEN excluded.line_label ELSE ${e.DNS_IP_POOL_ITEMS_TABLE}.line_label END,
            remark = CASE WHEN COALESCE(excluded.remark, '') != '' THEN excluded.remark ELSE ${e.DNS_IP_POOL_ITEMS_TABLE}.remark END,
            updated_at = excluded.updated_at`).bind(u.id, u.ip, u.ipType, u.sourceKind, u.sourceLabel, u.lineLabel, u.remark, u.createdAt, u.updatedAt));
      return await a.batch(d), l;
    },
    async deleteDnsIpPoolItems(a, n = []) {
      if (!a) return 0;
      await e.ensureDnsIpWorkspaceSchema(a);
      const s = [...new Set((Array.isArray(n) ? n : []).map((l) => String(l || "").trim()).filter((l) => et(l)))];
      if (!s.length) return 0;
      const i = s.flatMap((l) => [a.prepare(`DELETE FROM ${e.DNS_IP_POOL_ITEMS_TABLE} WHERE ip = ?`).bind(l), a.prepare(`DELETE FROM ${e.DNS_IP_PROBE_CACHE_TABLE} WHERE ip = ?`).bind(l)]), c = 50;
      for (let l = 0; l < i.length; l += c) await a.batch(i.slice(l, l + c));
      return s.length;
    },
    async getDnsIpPoolSourcesFromDb(a) {
      if (!a) return [];
      await e.ensureDnsIpWorkspaceSchema(a);
      try {
        const n = await a.prepare(`SELECT id, name, url, source_type, domain, source_kind, preset_id, builtin_id, enabled, sort_order, ip_limit, last_fetch_at, last_fetch_status, last_fetch_count, created_at, updated_at
              FROM ${e.DNS_IP_POOL_SOURCES_TABLE}
              ORDER BY sort_order ASC, updated_at ASC`).all();
        return (Array.isArray(n?.results) ? n.results : []).map((s, i) => It(s, i)).filter((s) => or(s));
      } catch {
        return [];
      }
    },
    async getDnsIpPoolSourcesFromDbStrict(a) {
      if (!a) throw new Error("D1 not configured");
      await e.ensureDnsIpWorkspaceSchema(a);
      const n = await a.prepare(`SELECT id, name, url, source_type, domain, source_kind, preset_id, builtin_id, enabled, sort_order, ip_limit, last_fetch_at, last_fetch_status, last_fetch_count, created_at, updated_at
            FROM ${e.DNS_IP_POOL_SOURCES_TABLE}
            ORDER BY sort_order ASC, updated_at ASC`).all();
      return (Array.isArray(n?.results) ? n.results : []).map((s, i) => It(s, i)).filter((s) => or(s));
    },
    async getDnsIpPoolSources(a) {
      const n = e.resolveOpsStatusStores(a)?.db || null;
      return await e.getDnsIpPoolSourcesFromDb(n);
    },
    async getDnsIpPoolSourcesForRead(a) {
      const n = e.resolveOpsStatusStores(a)?.db || null;
      return await e.getDnsIpPoolSourcesFromDb(n);
    },
    async persistDnsIpPoolSources(a, n = [], s = null) {
      const i = (Array.isArray(n) ? n : []).map((d, u) => It(d, u)).filter((d) => or(d)), c = e.resolveOpsStatusStores(a)?.db || null;
      if (!c) throw new Error("D1 not configured");
      await e.ensureDnsIpWorkspaceSchema(c);
      const l = [c.prepare(`DELETE FROM ${e.DNS_IP_POOL_SOURCES_TABLE}`)];
      return l.push(...i.map((d) => c.prepare(`INSERT INTO ${e.DNS_IP_POOL_SOURCES_TABLE} (
            id, name, url, source_type, domain, source_kind, preset_id, builtin_id, enabled, sort_order, ip_limit, last_fetch_at, last_fetch_status, last_fetch_count, created_at, updated_at
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`).bind(d.id, d.name, d.url, d.sourceType, d.domain, d.sourceKind, d.presetId, d.builtinId, d.enabled ? 1 : 0, d.sortOrder, d.ipLimit, d.lastFetchAt, d.lastFetchStatus, d.lastFetchCount, d.createdAt, d.updatedAt))), await c.batch(l), i;
    },
    async updateDnsIpPoolSourceFetchState(a, n = "", s = {}) {
      if (!a || !n) return !1;
      await e.ensureDnsIpWorkspaceSchema(a);
      const i = (/* @__PURE__ */ new Date()).toISOString();
      return await a.prepare(`UPDATE ${e.DNS_IP_POOL_SOURCES_TABLE}
            SET last_fetch_at = ?, last_fetch_status = ?, last_fetch_count = ?, updated_at = ?
            WHERE id = ?`).bind(String(s.lastFetchAt || i), String(s.lastFetchStatus || ""), Math.max(0, Number(s.lastFetchCount) || 0), i, String(n)).run(), !0;
    },
    async getDnsIpPoolFetchCacheEntry(a, n = "") {
      if (!a || !n) return null;
      await e.ensureDnsIpWorkspaceSchema(a);
      try {
        const s = await a.prepare(`SELECT signature, items_json, source_results_json, imported_count, enabled_source_count, cached_at, expires_at, created_at, updated_at
              FROM ${e.DNS_IP_POOL_FETCH_CACHE_TABLE}
              WHERE signature = ? AND expires_at > ?
              LIMIT 1`).bind(String(n), k()).first();
        if (!s) return null;
        const i = JSON.parse(String(s.items_json || "[]")), c = JSON.parse(String(s.source_results_json || "[]")), l = mr(Array.isArray(i) ? i : []), d = Array.isArray(c) ? c : [];
        return {
          signature: String(s.signature || ""),
          items: l,
          sourceResults: d,
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
    async upsertDnsIpPoolFetchCacheEntry(a, n = {}) {
      if (!a) return null;
      await e.ensureDnsIpWorkspaceSchema(a);
      const s = String(n?.signature || "").trim();
      if (!s) return null;
      const i = mr(n?.items || []), c = (Array.isArray(n?.sourceResults) ? n.sourceResults : []).map((g) => ui(g, g)), l = Math.max(0, Number(n?.cachedAtMs ?? n?.cached_at ?? k()) || k()), d = Math.max(l, Number(n?.expiresAtMs ?? n?.expires_at ?? l + 24e5) || l + 24e5), u = String(n?.createdAt || n?.created_at || new Date(l).toISOString()), f = String(n?.updatedAt || n?.updated_at || new Date(l).toISOString()), m = Math.max(0, Number(n?.importedCount ?? n?.imported_count) || i.length), p = Math.max(0, Number(n?.enabledSourceCount ?? n?.enabled_source_count) || 0);
      return await a.prepare(`INSERT INTO ${e.DNS_IP_POOL_FETCH_CACHE_TABLE} (
            signature, items_json, source_results_json, imported_count, enabled_source_count, cached_at, expires_at, created_at, updated_at
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
          ON CONFLICT(signature) DO UPDATE SET
            items_json = excluded.items_json,
            source_results_json = excluded.source_results_json,
            imported_count = excluded.imported_count,
            enabled_source_count = excluded.enabled_source_count,
            cached_at = excluded.cached_at,
            expires_at = excluded.expires_at,
            updated_at = excluded.updated_at`).bind(s, JSON.stringify(i), JSON.stringify(c), m, p, l, d, u, f).run(), {
        signature: s,
        items: i,
        sourceResults: c,
        importedCount: m,
        enabledSourceCount: p,
        cachedAtMs: l,
        expiresAtMs: d,
        createdAt: u,
        updatedAt: f
      };
    },
    async getDnsIpProbeCacheEntry(a, n = "", s = "") {
      if (!a || !n || !s) return null;
      await e.ensureDnsIpWorkspaceSchema(a);
      try {
        const i = await a.prepare(`SELECT ip, entry_colo, probe_status, latency_ms, cf_ray, colo_code, city_name, country_code, country_name, probed_at, expires_at
              FROM ${e.DNS_IP_PROBE_CACHE_TABLE}
              WHERE ip = ? AND entry_colo = ? AND expires_at > ?
              LIMIT 1`).bind(String(n), String(s).toUpperCase(), k()).first();
        return i ? {
          ip: String(i.ip || ""),
          entryColo: String(i.entry_colo || "").toUpperCase(),
          probeStatus: $a(i.probe_status),
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
    async getDnsIpProbeCacheEntries(a, n = [], s = "") {
      if (!a || !s) return [];
      const i = [...new Set((Array.isArray(n) ? n : []).map((d) => String(d || "").trim()).filter(Boolean))];
      if (!i.length) return [];
      await e.ensureDnsIpWorkspaceSchema(a);
      const c = [], l = k();
      try {
        for (let d = 0; d < i.length; d += 98) {
          const u = i.slice(d, d + 98);
          if (!u.length) continue;
          const f = u.map(() => "?").join(", "), m = await a.prepare(`SELECT ip, entry_colo, probe_status, latency_ms, cf_ray, colo_code, city_name, country_code, country_name, probed_at, expires_at
                FROM ${e.DNS_IP_PROBE_CACHE_TABLE}
                WHERE entry_colo = ? AND expires_at > ? AND ip IN (${f})`).bind(String(s).toUpperCase(), l, ...u).all();
          c.push(...Array.isArray(m?.results) ? m.results : []);
        }
      } catch {
        return [];
      }
      return c.map((d) => ({
        ip: String(d?.ip || ""),
        entryColo: String(d?.entry_colo || "").toUpperCase(),
        probeStatus: $a(d?.probe_status),
        latencyMs: Number.isFinite(Number(d?.latency_ms)) ? Math.round(Number(d?.latency_ms)) : null,
        cfRay: String(d?.cf_ray || ""),
        coloCode: String(d?.colo_code || "").toUpperCase(),
        cityName: String(d?.city_name || ""),
        countryCode: String(d?.country_code || "").toUpperCase(),
        countryName: String(d?.country_name || ""),
        probedAt: String(d?.probed_at || ""),
        expiresAt: Math.max(0, Number(d?.expires_at) || 0)
      }));
    },
    async upsertDnsIpProbeCacheEntry(a, n = {}) {
      if (!a) return null;
      await e.ensureDnsIpWorkspaceSchema(a);
      const s = String(n?.ip || "").trim(), i = String(n?.entryColo || n?.entry_colo || "").trim().toUpperCase(), c = $a(n?.probeStatus || n?.probe_status || "");
      if (!s || !i) return null;
      const l = Math.max(k(), Number(n?.expiresAt ?? n?.expires_at) || 0), d = String(n?.probedAt || n?.probed_at || (/* @__PURE__ */ new Date()).toISOString());
      return await a.prepare(`INSERT INTO ${e.DNS_IP_PROBE_CACHE_TABLE} (
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
            expires_at = excluded.expires_at`).bind(s, i, c, Number.isFinite(Number(n?.latencyMs ?? n?.latency_ms)) ? Math.round(Number(n?.latencyMs ?? n?.latency_ms)) : null, String(n?.cfRay || n?.cf_ray || ""), String(n?.coloCode || n?.colo_code || "").toUpperCase(), String(n?.cityName || n?.city_name || ""), String(n?.countryCode || n?.country_code || "").toUpperCase(), String(n?.countryName || n?.country_name || ""), d, l).run(), {
        ip: s,
        entryColo: i,
        probeStatus: c,
        latencyMs: Number.isFinite(Number(n?.latencyMs ?? n?.latency_ms)) ? Math.round(Number(n?.latencyMs ?? n?.latency_ms)) : null,
        cfRay: String(n?.cfRay || n?.cf_ray || ""),
        coloCode: String(n?.coloCode || n?.colo_code || "").toUpperCase(),
        cityName: String(n?.cityName || n?.city_name || ""),
        countryCode: String(n?.countryCode || n?.country_code || "").toUpperCase(),
        countryName: String(n?.countryName || n?.country_name || ""),
        probedAt: d,
        expiresAt: l
      };
    }
  };
}
function Eg(o = {}, e = {}) {
  const { CacheManager: r, withAdminShellRuntimeStatus: t } = o;
  return {
    resolveOpsStatusStores(a) {
      return a && typeof a == "object" && !Array.isArray(a) && ("kv" in a || "db" in a) ? {
        kv: a.kv || null,
        db: a.db || null
      } : a && typeof a.prepare == "function" ? {
        kv: null,
        db: a
      } : a && typeof a.get == "function" ? {
        kv: a,
        db: null
      } : {
        kv: e.getKV(a),
        db: e.getDB(a)
      };
    },
    getOpsStatusDbScope(a = "") {
      return a ? e.OPS_STATUS_SECTION_SCOPES[a] || `ops_status:${a}` : e.OPS_STATUS_DB_SCOPE_ROOT;
    },
    getOpsStatusShadowState(a) {
      if (!a || typeof a.prepare != "function") return null;
      let n = Z.OpsStatusShadowCache.get(a);
      return n || (n = {
        pendingPatch: {},
        flushPromise: null,
        payloadCache: /* @__PURE__ */ new Map()
      }, Z.OpsStatusShadowCache.set(a, n)), n;
    },
    getOpsStatusShadowPatch(a) {
      const n = e.getOpsStatusShadowState(a);
      return U(n?.pendingPatch) ? n.pendingPatch : {};
    },
    getOpsStatusPayloadCache(a) {
      const n = e.getOpsStatusShadowState(a);
      return n ? (n.payloadCache instanceof Map || (n.payloadCache = /* @__PURE__ */ new Map()), n.payloadCache) : null;
    },
    cacheOpsStatusPayload(a, n, s) {
      const i = e.getOpsStatusPayloadCache(a);
      i && Fe(i, String(n || ""), {
        payload: s && typeof s == "object" ? s : null,
        expiresAt: k() + Math.max(1e3, Number(v.Defaults.OpsStatusReadCacheTtlMs) || 1e3)
      }, 8);
    },
    buildOpsStatusRootPatch(a = {}) {
      const n = a && typeof a == "object" ? a : {}, s = (/* @__PURE__ */ new Date()).toISOString(), i = {};
      for (const [c, l] of Object.entries(n)) {
        if (e.OPS_STATUS_SECTION_SCOPES[c]) {
          const d = qe(i[c], l);
          d.updatedAt = s, i[c] = d;
          continue;
        }
        i[c] = l;
      }
      return i;
    },
    async flushOpsStatusShadow(a, n = {}) {
      const s = a?.db || null;
      if (!s) return {};
      const i = Array.isArray(n.patchKeys) ? n.patchKeys : [], c = e.getOpsStatusShadowState(s);
      if (!c) return {};
      if (c.flushPromise) return c.flushPromise;
      const l = (async () => {
        const d = U(c.pendingPatch) ? c.pendingPatch : {};
        if (!Object.keys(d).length) return await e.getOpsStatusFromStores(a);
        c.pendingPatch = {};
        try {
          const u = k(), f = new Date(u).toISOString();
          if (!await e.ensureSysStatusTable(s))
            return Ne("ops_status.db_unavailable", /* @__PURE__ */ new Error("sys_status table unavailable"), { patchKeys: i }), c.pendingPatch = qe(d, c.pendingPatch), await e.getOpsStatusFromStores(a);
          const m = await e.getOpsStatusPayloadFromDb(s, e.getOpsStatusDbScope()), p = qe(m && typeof m == "object" ? m : {}, d);
          return p.updatedAt = f, await e.putOpsStatusPayloadToDb(s, e.getOpsStatusDbScope(), p, u), qe(p, e.getOpsStatusShadowPatch(s));
        } catch (u) {
          throw c.pendingPatch = qe(d, c.pendingPatch), u;
        }
      })().finally(() => {
        c.flushPromise === l && (c.flushPromise = null);
      });
      return c.flushPromise = l, l;
    },
    async ensureSysStatusTable(a) {
      if (!a || typeof a.prepare != "function") return !1;
      if (e.isD1SchemaReadyCached(a, "sysStatusTable")) return !0;
      let n = Z.OpsStatusDbReady.get(a);
      n || (n = (async () => {
        try {
          return await a.prepare(`CREATE TABLE IF NOT EXISTS ${e.SYS_STATUS_TABLE} (scope TEXT PRIMARY KEY, payload TEXT NOT NULL, updated_at INTEGER NOT NULL)`).run(), e.markD1SchemaReady(a, "sysStatusTable"), !0;
        } catch (s) {
          return console.warn("sys_status init failed", s), !1;
        }
      })(), Z.OpsStatusDbReady.set(a, n));
      try {
        return await n;
      } finally {
        Z.OpsStatusDbReady.get(a) === n && Z.OpsStatusDbReady.delete(a);
      }
    },
    async ensureAuthFailuresTable(a) {
      if (!a || typeof a.prepare != "function") return !1;
      if (e.isD1SchemaReadyCached(a, "authFailuresTable")) return !0;
      let n = Z.AuthFailuresDbReady.get(a);
      n || (n = (async () => {
        try {
          return await a.prepare(`CREATE TABLE IF NOT EXISTS ${e.AUTH_FAILURES_TABLE} (
                  ip TEXT PRIMARY KEY,
                  fail_count INTEGER NOT NULL,
                  expires_at INTEGER NOT NULL,
                  updated_at INTEGER NOT NULL
                )`).run(), await a.prepare(`CREATE INDEX IF NOT EXISTS idx_auth_failures_expires_at ON ${e.AUTH_FAILURES_TABLE} (expires_at)`).run(), e.markD1SchemaReady(a, "authFailuresTable"), !0;
        } catch (s) {
          return console.warn("auth_failures init failed", s), !1;
        }
      })(), Z.AuthFailuresDbReady.set(a, n));
      try {
        return await n;
      } finally {
        Z.AuthFailuresDbReady.get(a) === n && Z.AuthFailuresDbReady.delete(a);
      }
    },
    async getAuthFailureEntry(a, n = "") {
      const s = String(n || "").trim();
      if (!s || !a || !await e.ensureAuthFailuresTable(a)) return null;
      try {
        const i = await a.prepare(`SELECT ip, fail_count, expires_at, updated_at
              FROM ${e.AUTH_FAILURES_TABLE}
              WHERE ip = ?
              LIMIT 1`).bind(s).first();
        if (!i) return null;
        const c = Number(i?.expires_at ?? i?.expiresAt) || 0;
        return c > 0 && c <= k() ? (await e.deleteAuthFailureEntry(a, s).catch(() => !1), null) : {
          ip: s,
          failCount: Math.max(0, Number(i?.fail_count ?? i?.failCount) || 0),
          expiresAt: c,
          updatedAt: Number(i?.updated_at ?? i?.updatedAt) || 0
        };
      } catch (i) {
        return Ne("auth_failures.read_failed", i, { ip: s }), null;
      }
    },
    async upsertAuthFailureEntry(a, n = "", s = {}) {
      const i = String(n || "").trim();
      if (!i || !a || !await e.ensureAuthFailuresTable(a)) return null;
      const c = Math.max(0, Number(s?.failCount) || 0), l = Math.max(0, Number(s?.expiresAt) || 0), d = Math.max(0, Number(s?.updatedAt) || k());
      return await a.prepare(`INSERT INTO ${e.AUTH_FAILURES_TABLE} (ip, fail_count, expires_at, updated_at)
            VALUES (?, ?, ?, ?)
            ON CONFLICT(ip) DO UPDATE SET
              fail_count = excluded.fail_count,
              expires_at = excluded.expires_at,
              updated_at = excluded.updated_at`).bind(i, c, l, d).run(), {
        ip: i,
        failCount: c,
        expiresAt: l,
        updatedAt: d
      };
    },
    async deleteAuthFailureEntry(a, n = "") {
      const s = String(n || "").trim();
      return !s || !a || !await e.ensureAuthFailuresTable(a) ? !1 : (await a.prepare(`DELETE FROM ${e.AUTH_FAILURES_TABLE} WHERE ip = ?`).bind(s).run(), !0);
    }
  };
}
function Rg(o = {}, e = {}) {
  const { CacheManager: r, withAdminShellRuntimeStatus: t } = o;
  return {
    async ensureCfDashboardCacheTable(a) {
      if (!a || typeof a.prepare != "function") return !1;
      if (e.isD1SchemaReadyCached(a, "cfDashboardCacheTable")) return !0;
      let n = Z.CfDashboardCacheDbReady.get(a);
      n || (n = (async () => {
        try {
          return await a.prepare(`CREATE TABLE IF NOT EXISTS ${e.CF_DASH_CACHE_TABLE} (
                  cache_key TEXT PRIMARY KEY,
                  zone_id TEXT NOT NULL,
                  bucket_date TEXT NOT NULL,
                  payload TEXT NOT NULL,
                  version INTEGER NOT NULL,
                  cached_at INTEGER NOT NULL,
                  expires_at INTEGER NOT NULL,
                  updated_at INTEGER NOT NULL
                )`).run(), await a.prepare(`CREATE INDEX IF NOT EXISTS idx_cf_dashboard_cache_expires_at ON ${e.CF_DASH_CACHE_TABLE} (expires_at)`).run(), e.markD1SchemaReady(a, "cfDashboardCacheTable"), !0;
        } catch (s) {
          return console.warn("cf_dashboard_cache init failed", s), !1;
        }
      })(), Z.CfDashboardCacheDbReady.set(a, n));
      try {
        return await n;
      } finally {
        Z.CfDashboardCacheDbReady.get(a) === n && Z.CfDashboardCacheDbReady.delete(a);
      }
    },
    async getCfDashboardCacheEntry(a, n = "", s = {}) {
      const i = String(n || "").trim();
      if (!i || !a || !await e.ensureCfDashboardCacheTable(a)) return null;
      const c = Math.max(0, Number(s.nowMs) || k()), l = s.includeExpired === !0, d = l ? `SELECT cache_key, zone_id, bucket_date, payload, version, cached_at, expires_at, updated_at
                FROM ${e.CF_DASH_CACHE_TABLE}
                WHERE cache_key = ?
                LIMIT 1` : `SELECT cache_key, zone_id, bucket_date, payload, version, cached_at, expires_at, updated_at
                FROM ${e.CF_DASH_CACHE_TABLE}
                WHERE cache_key = ? AND expires_at > ?
                LIMIT 1`;
      try {
        let u = a.prepare(d).bind(i);
        l || (u = a.prepare(d).bind(i, c));
        const f = await u.first();
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
          payload: io(m),
          version: Number(f?.version) || 0,
          cachedAt: Number(f?.cached_at ?? f?.cachedAt) || 0,
          expiresAt: Number(f?.expires_at ?? f?.expiresAt) || 0,
          updatedAt: Number(f?.updated_at ?? f?.updatedAt) || 0
        };
      } catch (u) {
        return Ne("cf_dashboard_cache.read_failed", u, { cacheKey: i }), null;
      }
    },
    async putCfDashboardCacheEntry(a, n = {}) {
      if (!a || !await e.ensureCfDashboardCacheTable(a)) return null;
      const s = String(n?.cacheKey || "").trim();
      if (!s) return null;
      const i = String(n?.zoneId || "").trim() || "default", c = String(n?.bucketDate || "").trim() || "current", l = Math.max(0, Number(n?.version) || 0), d = Math.max(0, Number(n?.cachedAt) || k()), u = Math.max(d, Number(n?.expiresAt) || d), f = Math.max(d, Number(n?.updatedAt) || d), m = JSON.stringify(io(n?.payload || {}));
      return await a.prepare(`INSERT INTO ${e.CF_DASH_CACHE_TABLE} (
            cache_key, zone_id, bucket_date, payload, version, cached_at, expires_at, updated_at
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
          ON CONFLICT(cache_key) DO UPDATE SET
            zone_id = excluded.zone_id,
            bucket_date = excluded.bucket_date,
            payload = excluded.payload,
            version = excluded.version,
            cached_at = excluded.cached_at,
            expires_at = excluded.expires_at,
            updated_at = excluded.updated_at`).bind(s, i, c, m, l, d, u, f).run(), {
        cacheKey: s,
        zoneId: i,
        bucketDate: c,
        version: l,
        cachedAt: d,
        expiresAt: u,
        updatedAt: f
      };
    },
    async deleteCfDashboardCacheEntry(a, n = "") {
      const s = String(n || "").trim();
      if (!s || !a || !await e.ensureCfDashboardCacheTable(a)) return !1;
      try {
        return await a.prepare(`DELETE FROM ${e.CF_DASH_CACHE_TABLE} WHERE cache_key = ?`).bind(s).run(), !0;
      } catch (i) {
        return Ne("cf_dashboard_cache.delete_failed", i, { cacheKey: s }), !1;
      }
    },
    async invalidateDashboardSnapshotCacheForConfigChange(a, n = {}) {
      const s = n?.db || e.getDB(a);
      if (!s) return 0;
      const i = Math.max(0, Number(n.nowMs) || k()), c = /* @__PURE__ */ new Set();
      for (const l of [n?.prevConfig, n?.nextConfig]) {
        if (!l || typeof l != "object") continue;
        const d = re(l), u = St(new Date(i), d.scheduleUtcOffsetMinutes);
        c.add(oo(d.cfZoneId, u.dateKey));
      }
      return c.size ? (await ye(Promise.all([...c].map((l) => e.deleteCfDashboardCacheEntry(s, l))), "dashboard.cache_invalidate", { cacheKeys: [...c] }, null), c.size) : 0;
    },
    async ensureCfRuntimeCacheTable(a) {
      if (!a || typeof a.prepare != "function") return !1;
      if (e.isD1SchemaReadyCached(a, "cfRuntimeCacheTable")) return !0;
      let n = Z.CfRuntimeCacheDbReady.get(a);
      n || (n = (async () => {
        try {
          return await a.prepare(`CREATE TABLE IF NOT EXISTS ${e.CF_RUNTIME_CACHE_TABLE} (
                  cache_key TEXT PRIMARY KEY,
                  cache_group TEXT NOT NULL,
                  resource_id TEXT NOT NULL,
                  payload TEXT NOT NULL,
                  cached_at INTEGER NOT NULL,
                  expires_at INTEGER NOT NULL,
                  updated_at INTEGER NOT NULL
                )`).run(), await a.prepare(`CREATE INDEX IF NOT EXISTS idx_cf_runtime_cache_expires_at ON ${e.CF_RUNTIME_CACHE_TABLE} (expires_at)`).run(), e.markD1SchemaReady(a, "cfRuntimeCacheTable"), !0;
        } catch (s) {
          return console.warn("cf_runtime_cache init failed", s), !1;
        }
      })(), Z.CfRuntimeCacheDbReady.set(a, n));
      try {
        return await n;
      } finally {
        Z.CfRuntimeCacheDbReady.get(a) === n && Z.CfRuntimeCacheDbReady.delete(a);
      }
    },
    async getCfRuntimeCacheEntry(a, n = "", s = {}) {
      const i = String(n || "").trim();
      if (!i || !a || !await e.ensureCfRuntimeCacheTable(a)) return null;
      const c = Math.max(0, Number(s.nowMs) || k()), l = s.includeExpired === !0, d = l ? `SELECT cache_key, cache_group, resource_id, payload, cached_at, expires_at, updated_at
                FROM ${e.CF_RUNTIME_CACHE_TABLE}
                WHERE cache_key = ?
                LIMIT 1` : `SELECT cache_key, cache_group, resource_id, payload, cached_at, expires_at, updated_at
                FROM ${e.CF_RUNTIME_CACHE_TABLE}
                WHERE cache_key = ? AND expires_at > ?
                LIMIT 1`;
      try {
        let u = a.prepare(d).bind(i);
        l || (u = a.prepare(d).bind(i, c));
        const f = await u.first();
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
          payload: (U(m), m),
          cachedAt: Number(f?.cached_at ?? f?.cachedAt) || 0,
          expiresAt: Number(f?.expires_at ?? f?.expiresAt) || 0,
          updatedAt: Number(f?.updated_at ?? f?.updatedAt) || 0
        };
      } catch (u) {
        return Ne("cf_runtime_cache.read_failed", u, { cacheKey: i }), null;
      }
    },
    async putCfRuntimeCacheEntry(a, n = {}) {
      if (!a || !await e.ensureCfRuntimeCacheTable(a)) return null;
      const s = String(n?.cacheKey || "").trim();
      if (!s) return null;
      const i = String(n?.cacheGroup || "").trim() || "runtime", c = String(n?.resourceId || "").trim() || "default", l = Math.max(0, Number(n?.cachedAt) || k()), d = Math.max(l, Number(n?.expiresAt) || l), u = Math.max(l, Number(n?.updatedAt) || l), f = JSON.stringify(n?.payload ?? {});
      return await a.prepare(`INSERT INTO ${e.CF_RUNTIME_CACHE_TABLE} (
            cache_key, cache_group, resource_id, payload, cached_at, expires_at, updated_at
          ) VALUES (?, ?, ?, ?, ?, ?, ?)
          ON CONFLICT(cache_key) DO UPDATE SET
            cache_group = excluded.cache_group,
            resource_id = excluded.resource_id,
            payload = excluded.payload,
            cached_at = excluded.cached_at,
            expires_at = excluded.expires_at,
            updated_at = excluded.updated_at`).bind(s, i, c, f, l, d, u).run(), {
        cacheKey: s,
        cacheGroup: i,
        resourceId: c,
        cachedAt: l,
        expiresAt: d,
        updatedAt: u
      };
    },
    async loadCfRuntimeCachePayload(a, n = {}) {
      const s = String(n.cacheKey || "").trim(), i = String(n.cacheGroup || "").trim() || "runtime", c = String(n.resourceId || "").trim() || "default", l = Math.max(1e3, Number(n.ttlMs) || 3e5), d = Math.max(0, Number(n.nowMs) || k()), u = n.skipCacheRead === !0, f = typeof n.loader == "function" ? n.loader : null;
      if (!s || !f) throw new Error("cf_runtime_cache_loader_missing");
      const m = a ? await e.getCfRuntimeCacheEntry(a, s, {
        nowMs: d,
        includeExpired: !0
      }) : null, p = !u && m && m.expiresAt > d ? m : null;
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
          payload: await $t(ot([
            "cf_runtime",
            i,
            s
          ]), async () => {
            const h = await f();
            return a && await ye(e.putCfRuntimeCacheEntry(a, {
              cacheKey: s,
              cacheGroup: i,
              resourceId: c,
              payload: h,
              cachedAt: d,
              expiresAt: d + l,
              updatedAt: d
            }), "cf_runtime_cache.write", {
              cacheKey: s,
              cacheGroup: i,
              resourceId: c
            }, null), h;
          }),
          cachedAt: d,
          expiresAt: d + l,
          updatedAt: d,
          stale: !1,
          source: a ? "live_then_cached" : "live",
          error: null
        };
      } catch (h) {
        if (g?.payload !== void 0 && n.allowStale !== !1) return {
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
function Tg(o = {}, e = {}) {
  const { CacheManager: r, withAdminShellRuntimeStatus: t } = o;
  return {
    buildCloudflareKvQuotaCard({ planProfile: a = {}, planState: n = {}, usageState: s = {}, namespaceId: i = "", nowTimestamp: c = k() } = {}) {
      const l = Ta(a?.planClass), d = U(s?.payload) ? s.payload : {}, u = String(d.namespaceTitle || a?.resourceMeta?.kv?.namespaceTitle || i || "未命名 Namespace").trim(), f = [
        Tr({
          key: "read",
          label: "读",
          used: d.readCount,
          limit: l.kv.read,
          kind: "count"
        }),
        Tr({
          key: "write",
          label: "写",
          used: d.writeCount,
          limit: l.kv.write,
          kind: "count"
        }),
        Tr({
          key: "storage",
          label: "容量",
          used: d.storageBytes,
          limit: l.kv.storageBytes,
          kind: "bytes"
        })
      ], m = [];
      n?.stale === !0 && m.push("计划信息"), s?.stale === !0 && m.push("实时指标");
      const p = [];
      m.length > 0 && p.push(`${m.join("、")} 使用 stale cache`), p.push(`delete：${Se(d.deleteCount)} / ${Se(l.kv.delete)}`), p.push(`list：${Se(d.listCount)} / ${Se(l.kv.list)}`), p.push(`命名空间：${u}`);
      const g = bs(s?.cachedAt, c);
      g && p.push(g), p.push(l.planClass === "paid" ? "容量条按 1 GB included quota 展示，PAID 下这是 included quota，不是硬停止线" : "容量条按 1 GB included quota 展示");
      const h = Es(f);
      return h.length > 0 && p.push(`超额项目：${h.join("、")}（进度条按 100% 封顶）`), s?.error && p.push(`Cloudflare 详情：${Kt(s.error)}`), rn({
        title: "KV",
        status: m.length > 0 ? "partial_failure" : "success",
        summary: `${l.planLabel} 计划 · ${l.periodLabel}配额`,
        detail: p.join("；"),
        planLabel: l.planLabel,
        periodLabel: l.periodLabel,
        resourceLabel: u,
        metrics: f
      });
    },
    buildCloudflareD1QuotaCard({ planProfile: a = {}, planState: n = {}, usageState: s = {}, databaseId: i = "", nowTimestamp: c = k() } = {}) {
      const l = Ta(a?.planClass), d = U(s?.payload) ? s.payload : {}, u = String(d.databaseName || a?.resourceMeta?.d1?.databaseName || i || "未命名数据库").trim(), f = [
        Tr({
          key: "rowsRead",
          label: "读",
          used: d.rowsRead,
          limit: l.d1.rowsRead,
          kind: "count"
        }),
        Tr({
          key: "rowsWritten",
          label: "写",
          used: d.rowsWritten,
          limit: l.d1.rowsWritten,
          kind: "count"
        }),
        Tr({
          key: "storage",
          label: "容量",
          used: d.fileSizeBytes,
          limit: l.d1.storageBytes,
          kind: "bytes"
        })
      ], m = [];
      n?.stale === !0 && m.push("计划信息"), s?.stale === !0 && m.push("实时指标");
      const p = [];
      m.length > 0 && p.push(`${m.join("、")} 使用 stale cache`), p.push(`SQL 次数：读 ${Se(d.readQueries)} / 写 ${Se(d.writeQueries)}`), p.push(`数据库：${u}`);
      const g = bs(s?.cachedAt, c);
      g && p.push(g), p.push(`容量条按单库硬上限 ${tn(l.d1.storageBytes)} 展示`);
      const h = Es(f);
      return h.length > 0 && p.push(`超额项目：${h.join("、")}（进度条按 100% 封顶）`), s?.error && p.push(`Cloudflare 详情：${Kt(s.error)}`), rn({
        title: "D1",
        status: m.length > 0 ? "partial_failure" : "success",
        summary: `${l.planLabel} 计划 · ${l.periodLabel}配额`,
        detail: p.join("；"),
        planLabel: l.planLabel,
        periodLabel: l.periodLabel,
        resourceLabel: u,
        metrics: f
      });
    },
    async buildDashboardD1WriteHotspotPayload(a, n = {}) {
      const s = re(n?.config || await ue(a)), i = Math.max(0, Number(n?.nowMs) || k()), c = Ke(s.scheduleUtcOffsetMinutes), l = String(s.cfAccountId || "").trim(), d = String(s.cfApiToken || "").trim(), u = String(s.cfD1DatabaseId || "").trim(), f = {
        utcOffsetMinutes: c,
        nowMs: i,
        source: "cloudflare_d1_analytics"
      };
      if (!l || !d || !u) return sn({
        ...f,
        status: "unconfigured",
        summary: "D1 写入热点尚未启用",
        detail: "请先在账号设置中填写 Cloudflare 账号 ID、API 令牌与 D1 Database ID。"
      });
      const m = St(new Date(i), c).startTs - 8640 * 60 * 1e3, p = await bf({
        accountId: l,
        apiToken: d,
        databaseId: u,
        startIso: new Date(m).toISOString(),
        endIso: new Date(i).toISOString(),
        utcOffsetMinutes: c
      }), g = new Map(p.map((R) => [`${R.dateKey}:${R.hour}`, R])), h = xc(), y = [];
      let S = 0, _ = 0, A = 0, b = null;
      for (const R of p)
        S += Math.max(0, Number(R?.rowsWritten) || 0), _ += Math.max(0, Number(R?.writeQueries) || 0), (Number(R?.rowsWritten) || 0) > A && (A = Math.max(0, Number(R?.rowsWritten) || 0), b = R);
      for (let R = 0; R < 7; R += 1) {
        const L = xt(m + R * 24 * 60 * 60 * 1e3, c).dateKey;
        y.push({
          key: L,
          dateKey: L,
          label: so(L),
          cells: Array.from({ length: 24 }, (T, D) => {
            const w = g.get(`${L}:${D}`) || null, M = Math.max(0, Number(w?.rowsWritten) || 0), x = Math.max(0, Number(w?.writeQueries) || 0), C = A > 0 ? M / A : 0;
            return Oc(L, D, M, x, C);
          })
        });
      }
      const E = b ? `峰值：${so(b.dateKey)} ${String(b.hour).padStart(2, "0")}:00 写入 ${Se(b.rowsWritten)} 行 / SQL ${Se(b.writeQueries)} 次` : "";
      return {
        title: "D1 写入热点图",
        status: "success",
        source: "cloudflare_d1_analytics",
        summary: S > 0 ? `最近 7 天累计写入 ${Se(S)} 行` : "最近 7 天未检测到 D1 写入",
        detail: S > 0 ? "热点强度按 rowsWritten 计算；悬停单元格可查看对应小时的 SQL 写次数。" : "Cloudflare D1 Analytics 当前窗口内没有返回 rowsWritten 数据。",
        periodLabel: `最近 7 天 · ${Ro(c)}`,
        hourLabels: h,
        rows: y,
        available: S > 0,
        totalRowsWritten: S,
        totalWriteQueries: _,
        peakLabel: E,
        legendMaxLabel: Se(A)
      };
    },
    async buildDashboardMonthlyTrafficPayload(a, n = {}) {
      const s = re(n?.config || await ue(a)), i = Math.max(0, Number(n.nowMs) || k()), c = n?.monthWindow || Fs(new Date(i), s.scheduleUtcOffsetMinutes), l = String(s.cfZoneId || "").trim(), d = String(s.cfApiToken || "").trim(), u = {
        period: "month",
        periodKey: c.monthKey,
        periodLabel: c.periodLabel,
        generatedAt: new Date(i).toISOString(),
        cacheStatus: "live"
      };
      if (!l || !d) return Yt({
        ...u,
        traffic: "未配置",
        cfAnalyticsLoaded: !1,
        cfAnalyticsStatus: "未配置 Cloudflare",
        cfAnalyticsError: "请在账号设置中填写并保存 Cloudflare Zone ID 与 API 令牌",
        trafficSourceText: "本月视频流量：未配置 Cloudflare，无法获取 CF Zone 总流量"
      });
      const f = (S, _) => `
            query {
              viewer {
                zones(filter: { zoneTag: ${be(l)} }) {
                  series: httpRequestsAdaptiveGroups(limit: 10000, filter: { datetime_geq: ${be(new Date(S).toISOString())}, datetime_leq: ${be(new Date(_).toISOString())} }) {
                    sum { edgeResponseBytes }
                  }
                }
              }
            }`, m = async (S, _) => {
        const A = await pc(l, d, f(S, _));
        if (!A) throw new Error("cf_graphql_empty_zone");
        return (Array.isArray(A.series) ? A.series : []).reduce((b, E) => b + Math.max(0, Number(E?.sum?.edgeResponseBytes) || 0), 0);
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
      return Yt({
        ...u,
        traffic: tn(h),
        totalBytes: h,
        cfAnalyticsLoaded: !0,
        cfAnalyticsStatus: "Cloudflare 统计正常",
        cfAnalyticsError: "",
        cfAnalyticsDetail: "",
        trafficSourceText: `${c.periodLabel}视频流量：CF Zone 总流量（edgeResponseBytes）`
      });
    },
    async getDashboardMonthlyTrafficPayload(a, n = {}) {
      const s = re(n?.config || await ue(a)), i = n?.ctx || null, c = n?.forceRefresh === !0, l = Math.max(0, Number(n.nowMs) || k()), d = n?.monthWindow || Fs(new Date(l), s.scheduleUtcOffsetMinutes), u = String(s.cfZoneId || "").trim();
      if (!u || !String(s.cfApiToken || "").trim()) return await e.buildDashboardMonthlyTrafficPayload(a, {
        config: s,
        monthWindow: d,
        nowMs: l
      });
      const f = Bm(u, d.monthKey, s.scheduleUtcOffsetMinutes), m = $m(f), p = dr();
      let g = null;
      const h = oe.DashboardMonthlyTrafficCache.get(f);
      if (h?.staleUntil > l) {
        if (Fe(oe.DashboardMonthlyTrafficCache, f, h, 64), g = h, !c && h.expiresAt > l) return Yt({
          ...h.payload,
          cacheStatus: "cache"
        });
      } else h && oe.DashboardMonthlyTrafficCache.delete(f);
      if (p && m) try {
        const y = await p.match(m);
        if (y) {
          const S = await xe(y, fn), _ = S.exceeded ? null : JSON.parse(S.text || "null");
          if (Number(_?.version) === 1 && String(_?.cacheKey || "") === f && Number(_?.staleUntil) > l && (g = {
            payload: Yt(_.payload),
            cachedAt: Number(_.cachedAt) || 0,
            expiresAt: Number(_.expiresAt) || 0,
            staleUntil: Number(_.staleUntil) || 0
          }, Fe(oe.DashboardMonthlyTrafficCache, f, g, 64), !c && g.expiresAt > l))
            return Yt({
              ...g.payload,
              cacheStatus: "cache"
            });
        }
      } catch (y) {
        Ne("dashboard.monthly_traffic_cache_read_failed", y, { cacheKey: f });
      }
      try {
        return await $t(ot([
          "dashboard_monthly_traffic",
          f,
          c ? "force" : "default"
        ]), async () => {
          const y = await e.buildDashboardMonthlyTrafficPayload(a, {
            config: s,
            monthWindow: d,
            nowMs: l
          }), S = l, _ = S + Km, A = S + Os, b = {
            version: 1,
            cacheKey: f,
            cachedAt: S,
            expiresAt: _,
            staleUntil: A,
            payload: y
          };
          if (Fe(oe.DashboardMonthlyTrafficCache, f, {
            payload: y,
            cachedAt: S,
            expiresAt: _,
            staleUntil: A
          }, 64), p && m) {
            const E = p.put(m, new Response(JSON.stringify(b), { headers: {
              "Content-Type": "application/json; charset=utf-8",
              "Cache-Control": `public, max-age=${Math.floor(Os / 1e3)}`
            } }));
            i ? i.waitUntil(ye(E, "dashboard.monthly_traffic_cache_write", { cacheKey: f }, null)) : await ye(E, "dashboard.monthly_traffic_cache_write", { cacheKey: f }, null);
          }
          return y;
        });
      } catch (y) {
        if (g?.payload && g.staleUntil > l) return Yt({
          ...g.payload,
          cacheStatus: "stale",
          warning: vc(y, "monthly_traffic_refresh_failed")
        });
        const S = sc(y?.message || y, { zoneId: u });
        return Yt({
          periodKey: d.monthKey,
          periodLabel: d.periodLabel,
          traffic: "CF 查询失败",
          cfAnalyticsLoaded: !1,
          cfAnalyticsStatus: S.status,
          cfAnalyticsError: S.hint,
          cfAnalyticsDetail: S.detail,
          trafficSourceText: `${d.periodLabel}视频流量：CF Zone 总流量（edgeResponseBytes）`,
          generatedAt: new Date(l).toISOString(),
          cacheStatus: "live"
        });
      }
    }
  };
}
function Ag(o = {}, e = {}) {
  const { CacheManager: r, withAdminShellRuntimeStatus: t } = o;
  return {
    async buildDashboardStatsPayload(a, n = {}) {
      const s = n?.ctx || null, i = n?.kv || e.getKV(a), c = n?.db || e.getDB(a), l = re(n?.config || await ue(a)), d = Math.max(0, Number(n.nowMs) || k()), u = n?.dayWindow || St(new Date(d), l.scheduleUtcOffsetMinutes), f = n?.skipD1WriteHotspot !== !1, m = f ? null : e.buildDashboardD1WriteHotspotPayload(a, {
        config: l,
        nowMs: d
      });
      let p = null, g = "未配置", h = 0, y = !1, S = !1, _ = "", A = "", b = "", E = "pending", R = "等待数据加载", L = "视频流量口径：CF Zone 总流量", T = new Date(d).toISOString(), D = Array.from({ length: 24 }, (H, G) => ({
        label: String(G).padStart(2, "0") + ":00",
        total: 0
      })), w = 0, M = 0, x = "", C = sn({
        utcOffsetMinutes: l.scheduleUtcOffsetMinutes,
        nowMs: d
      });
      h = (await r.getNodesListStrict(a, s)).length || 0;
      const F = u.dateKey, W = u.startTs, O = u.endTs, N = String(l.cfZoneId || "").trim(), I = String(l.cfApiToken || "").trim();
      if (N && I) {
        const H = new Date(W).toISOString(), G = new Date(O).toISOString(), $ = `
                query {
                  viewer {
                    zones(filter: { zoneTag: ${be(N)} }) {
                      series: httpRequestsAdaptiveGroups(limit: 10000, filter: { datetime_geq: ${be(H)}, datetime_leq: ${be(G)} }) {
                        count
                        dimensions { datetimeHour }
                        sum { edgeResponseBytes }
                      }
                    }
                  }
                }`;
        try {
          const K = await hc(N, I, {
            scope: "dashboard.stats.zone_lookup",
            context: { feature: "dashboard_stats" }
          });
          x = String(K?.name || "").trim();
          const j = await pc(N, I, $);
          if (j) {
            let se = 0, me = 0, pe = Array.from({ length: 24 }, (le, ge) => ({
              label: String(ge).padStart(2, "0") + ":00",
              total: 0
            }));
            (Array.isArray(j.series) ? [...j.series].sort((le, ge) => String(le?.dimensions?.datetimeHour || "").localeCompare(String(ge?.dimensions?.datetimeHour || ""))) : []).forEach((le) => {
              const ge = Number(le.count) || 0, Oe = Number(le.sum?.edgeResponseBytes) || 0;
              se += ge, me += Oe;
              const We = le?.dimensions?.datetimeHour;
              if (We && !Number.isNaN(new Date(We).getTime())) {
                const vt = xt(new Date(We), l.scheduleUtcOffsetMinutes).hour;
                pe[vt].total += ge;
              }
            }), g = tn(me), y = !0, _ = "Cloudflare 统计正常", L = "视频流量当前对齐：CF Zone 总流量（edgeResponseBytes）";
            try {
              const le = await Ef({
                cfAccountId: String(l.cfAccountId || "").trim(),
                cfZoneId: N,
                cfApiToken: I,
                startIso: H,
                endIso: G,
                utcOffsetMinutes: l.scheduleUtcOffsetMinutes
              });
              le && Number.isFinite(le.totalRequests) && (p = le.totalRequests, D = le.hourlySeries, S = !0, E = "workers_usage", R = "今日请求量口径：Cloudflare Workers Usage", _ = "Cloudflare 统计正常");
            } catch (le) {
              console.log("CF workers usage fetch failed", le);
            }
            S || (p = se, D = pe, S = !0, E = "zone_analytics", R = "今日请求量当前对齐：Cloudflare Zone Analytics");
          } else
            _ = "Zone 未命中", A = "GraphQL 返回空；请检查 Zone ID 或权限", g = "CF 无统计数据";
        } catch (K) {
          const j = sc(K?.message || K, { zoneId: N });
          _ = j.status, A = j.hint, b = j.detail, g = "CF 查询失败";
        }
      } else
        _ = "未配置 Cloudflare", A = "请在账号设置中填写并保存 Cloudflare Zone ID 与 API 令牌", L = "视频流量当前对齐：未配置 Cloudflare，无法获取 CF Zone 总流量";
      if (c) try {
        await e.ensureStatsHourlyWindowAligned({
          db: c,
          kv: i
        }, {
          config: l,
          now: u.now
        });
        const H = await e.resolveLogsReadiness({
          db: c,
          kv: i
        }), G = H.statsReady === !0 ? await e.getDailyStatsHourly(c, F) : [];
        if (w = G.reduce(($, K) => $ + (Number(K?.play_count || K?.playCount) || 0), 0), M = G.reduce(($, K) => $ + (Number(K?.playback_info_count || K?.playbackInfoCount) || 0), 0), !S && H.statsReady === !0) {
          p = G.reduce(($, K) => $ + (Number(K?.request_count || K?.requestCount) || 0), 0), D = Array.from({ length: 24 }, ($, K) => ({
            label: String(K).padStart(2, "0") + ":00",
            total: 0
          }));
          for (const $ of G) {
            const K = Number.parseInt(String($?.bucket_hour ?? $?.bucketHour), 10);
            !Number.isNaN(K) && D[K] && (D[K].total += Number($?.request_count || $?.requestCount) || 0);
          }
          S = !0, E = "d1_hourly_stats", R = "今日请求量当前对齐：本地 D1 预聚合";
        }
      } catch (H) {
        console.log("DB aggregated stats read failed:", H);
      }
      if (S || (p = null, !N || !I ? (E = "unconfigured", R = c ? "今日请求量暂不可用：未配置 Cloudflare 联动，且本地 D1 日志未初始化或不可读" : "今日请求量未配置：未绑定 D1，且未配置 Cloudflare 联动") : (E = "pending", R = c ? "今日请求量暂不可用：Cloudflare 请求数查询失败，且本地 D1 日志未初始化或不可读" : "今日请求量暂不可用：Cloudflare 请求数查询失败，且未绑定 D1")), !f) try {
        C = await m;
      } catch (H) {
        console.log("D1 write hotspot read failed:", H), C = sn({
          utcOffsetMinutes: l.scheduleUtcOffsetMinutes,
          nowMs: d,
          status: "failed",
          source: "cloudflare_d1_analytics",
          summary: "D1 写入热点暂不可用",
          detail: Kt(H, "d1_write_hotspot_failed")
        });
      }
      const P = p == null ? E === "unconfigured" ? "未配置" : "暂不可用" : String(Number(p) || 0);
      return Wo({
        todayRequests: p,
        requestCountDisplay: P,
        todayTraffic: g,
        hourlySeries: D,
        requestSource: E,
        requestSourceText: R,
        trafficSourceText: L,
        generatedAt: T,
        zoneName: x,
        cfAnalyticsLoaded: y,
        cfAnalyticsStatus: _,
        cfAnalyticsError: A,
        cfAnalyticsDetail: b,
        playCount: w,
        infoCount: M,
        nodeCount: h,
        cacheStatus: "live",
        d1WriteHotspot: C
      });
    },
    async buildDashboardRuntimeStatusPayload(a, n = {}) {
      const s = n?.db || e.getDB(a), i = n?.kv || e.getKV(a), c = re(n?.config || await ue(a)), l = n?.forceRefresh === !0, d = await e.getOpsStatus({
        kv: i,
        db: s
      });
      let u = {
        kv: Ar("KV", "Cloudflare 配额尚未加载", "等待运行状态接口返回 Cloudflare 配额数据。"),
        d1: Ar("D1", "Cloudflare 配额尚未加载", "等待运行状态接口返回 Cloudflare 配额数据。")
      };
      try {
        u = await e.getCloudflareRuntimeQuotaStatus(a, {
          config: c,
          db: s,
          forceRefresh: l
        });
      } catch (f) {
        const m = Kt(f, "runtime_config_read_failed");
        u = {
          kv: Cr("KV", "Cloudflare 配额读取失败", m),
          d1: Cr("D1", "Cloudflare 配额读取失败", m)
        };
      }
      return {
        ...d && typeof d == "object" ? d : {},
        cloudflare: u
      };
    },
    async getRuntimeStatusPayload(a, n = {}) {
      const s = n?.db || e.getDB(a), i = n?.kv || e.getKV(a), c = re(n?.config || await ue(a)), l = ke(a), d = n?.forceRefresh === !0, u = Math.max(0, Number(n.nowMs) || k()), f = await $t(ot(["runtime_status", d ? "force" : "default"]), async () => e.buildDashboardRuntimeStatusPayload(a, {
        kv: i,
        db: s,
        config: c,
        forceRefresh: d
      }));
      return {
        status: t(f, a, c, l),
        cacheMeta: Vo({
          cacheStatus: "live",
          cachedAt: u,
          expiresAt: u,
          updatedAt: u,
          generatedAt: new Date(u).toISOString(),
          warning: "",
          partial: !1
        })
      };
    },
    async getDashboardSnapshotPayload(a, n = {}) {
      const s = n?.db || e.getDB(a), i = n?.kv || e.getKV(a), c = n?.ctx || null, l = re(n?.config || await ue(a)), d = n?.forceRefresh === !0, u = Math.max(0, Number(n.nowMs) || k()), f = n?.dayWindow || St(new Date(u), l.scheduleUtcOffsetMinutes), m = String(l.cfZoneId || "").trim(), p = oo(m, f.dateKey), g = s ? await e.getCfDashboardCacheEntry(s, p, {
        nowMs: u,
        includeExpired: !0
      }) : null;
      if (!d && s) {
        const y = g && g.expiresAt > u ? g : null;
        if (y && y.version === 8) return oa(y.payload, "cache", {
          cachedAt: y.cachedAt,
          expiresAt: y.expiresAt,
          updatedAt: y.updatedAt,
          generatedAt: y.payload?.cacheMeta?.generatedAt || y.payload?.stats?.generatedAt || new Date(y.cachedAt || u).toISOString(),
          warning: ""
        });
      }
      const h = g;
      try {
        const y = await $t(ot([
          "dashboard_snapshot",
          p,
          d ? "force" : "default"
        ]), async () => {
          const [S, _] = await Promise.all([e.buildDashboardStatsPayload(a, {
            ctx: c,
            kv: i,
            db: s,
            config: l,
            dayWindow: f,
            nowMs: u
          }), e.buildDashboardRuntimeStatusPayload(a, {
            kv: i,
            db: s,
            config: l,
            forceRefresh: d
          })]), A = oa({
            stats: S,
            runtimeStatus: _,
            cacheMeta: { generatedAt: S.generatedAt }
          }, "live", {
            cachedAt: u,
            expiresAt: u + 3600 * 1e3,
            updatedAt: u,
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
              cachedAt: u,
              expiresAt: u + 36e5,
              updatedAt: u
            });
            c ? c.waitUntil(ye(b, "dashboard.cache_write", { cacheKey: p }, null)) : await ye(b, "dashboard.cache_write", { cacheKey: p }, null);
          }
          return A;
        });
        return oa(y, "live", {
          cachedAt: u,
          expiresAt: u + 3600 * 1e3,
          updatedAt: u,
          generatedAt: y?.stats?.generatedAt || ""
        });
      } catch (y) {
        if (h && h.version === 8) return oa(h.payload, "stale", {
          cachedAt: h.cachedAt,
          expiresAt: h.expiresAt,
          updatedAt: h.updatedAt,
          generatedAt: h.payload?.cacheMeta?.generatedAt || h.payload?.stats?.generatedAt || new Date(h.cachedAt || u).toISOString(),
          warning: vc(y),
          partial: !0
        });
        throw y;
      }
    },
    async getDashboardCachedSnapshotPayload(a, n = {}) {
      const s = n?.db || e.getDB(a);
      if (!s) return null;
      const i = re(n?.config || await ue(a)), c = Math.max(0, Number(n.nowMs) || k()), l = St(new Date(c), i.scheduleUtcOffsetMinutes), d = oo(String(i.cfZoneId || "").trim(), l.dateKey), u = await e.getCfDashboardCacheEntry(s, d, {
        nowMs: c,
        includeExpired: !0
      });
      return !u || u.version !== 8 ? null : oa(u.payload, u.expiresAt > c ? "cache" : "stale", {
        cachedAt: u.cachedAt,
        expiresAt: u.expiresAt,
        updatedAt: u.updatedAt,
        generatedAt: u.payload?.cacheMeta?.generatedAt || u.payload?.stats?.generatedAt || "",
        warning: u.expiresAt > c ? "" : "dashboard_cache_expired",
        partial: u.expiresAt <= c
      });
    },
    async getCloudflareRuntimeQuotaStatus(a, n = {}) {
      const s = n?.db || e.getDB(a), i = re(n?.config || {}), c = n?.forceRefresh === !0, l = String(i.cfAccountId || "").trim(), d = String(i.cfApiToken || "").trim(), u = String(i.cfKvNamespaceId || "").trim(), f = String(i.cfD1DatabaseId || "").trim();
      if (!l || !d) return {
        kv: Ar("KV", "未配置 Cloudflare 账号联动", "请先在账号设置中填写 Cloudflare 账号 ID 与 API 令牌。"),
        d1: Ar("D1", "未配置 Cloudflare 账号联动", "请先在账号设置中填写 Cloudflare 账号 ID 与 API 令牌。")
      };
      const m = k(), p = de(i.cfQuotaPlanCacheMinutes, v.Defaults.CfQuotaPlanCacheMinutes, 1, 1440), g = p * 60 * 1e3;
      let h;
      try {
        h = await e.loadCfRuntimeCachePayload(s, {
          cacheKey: `plan_profile:${l}:${u || "-"}:${f || "-"}`,
          cacheGroup: "plan_profile",
          resourceId: l,
          ttlMs: p * 60 * 1e3,
          nowMs: m,
          skipCacheRead: c,
          loader: async () => {
            const E = fc(await yc(l, d)), [R, L] = await Promise.all([u ? ye(yf(l, u, d), "cf_runtime.plan_profile.kv_details", {
              accountId: l,
              namespaceId: u
            }, null) : null, f ? ye(Ts(l, f, d), "cf_runtime.plan_profile.d1_details", {
              accountId: l,
              databaseId: f
            }, null) : null]);
            return {
              planClass: E.planClass,
              planLabel: E.planLabel,
              periodLabel: E.periodLabel,
              usageModel: E.usageModel,
              resourceMeta: {
                kv: { namespaceTitle: String(R?.title || "").trim() },
                d1: { databaseName: String(L?.name || "").trim() }
              }
            };
          }
        });
      } catch (E) {
        const R = Kt(E);
        return {
          kv: Cr("KV", "Cloudflare 计划信息读取失败", R),
          d1: Cr("D1", "Cloudflare 计划信息读取失败", R)
        };
      }
      const y = U(h?.payload) ? h.payload : {}, S = {
        ...to({
          usageModel: y.usageModel || y.planClass,
          override: i.cfQuotaPlanOverride
        }),
        resourceMeta: {
          kv: { namespaceTitle: String(y?.resourceMeta?.kv?.namespaceTitle || "").trim() },
          d1: { databaseName: String(y?.resourceMeta?.d1?.databaseName || "").trim() }
        }
      }, _ = mf(S.planClass), [A, b] = await Promise.all([(async () => {
        if (!u) return Ar("KV", "未配置 KV Namespace", "请在账号设置中填写 Cloudflare KV Namespace ID。");
        try {
          const E = await e.loadCfRuntimeCachePayload(s, {
            cacheKey: `usage_metrics:kv:${l}:${u}:${_.cacheBucketKey}`,
            cacheGroup: "usage_metrics",
            resourceId: `kv:${u}`,
            ttlMs: g,
            nowMs: m,
            skipCacheRead: c,
            loader: async () => ({
              ...await Sf({
                accountId: l,
                apiToken: d,
                namespaceId: u,
                startIso: _.startIso,
                endIso: _.endIso
              }),
              namespaceTitle: String(S?.resourceMeta?.kv?.namespaceTitle || u).trim()
            })
          });
          return e.buildCloudflareKvQuotaCard({
            planProfile: S,
            planState: h,
            usageState: E,
            namespaceId: u,
            nowTimestamp: m
          });
        } catch (E) {
          return Cr("KV", "KV 指标读取失败", Kt(E));
        }
      })(), (async () => {
        if (!f) return Ar("D1", "未配置 D1 数据库", "请在账号设置中填写 Cloudflare D1 Database ID。");
        try {
          const E = await e.loadCfRuntimeCachePayload(s, {
            cacheKey: `usage_metrics:d1:${l}:${f}:${_.cacheBucketKey}`,
            cacheGroup: "usage_metrics",
            resourceId: `d1:${f}`,
            ttlMs: g,
            nowMs: m,
            skipCacheRead: c,
            loader: async () => {
              const [R, L] = await Promise.all([_f({
                accountId: l,
                apiToken: d,
                databaseId: f,
                startIso: _.startIso,
                endIso: _.endIso
              }), Ts(l, f, d)]);
              return {
                ...R,
                databaseName: String(L?.name || S?.resourceMeta?.d1?.databaseName || f).trim(),
                fileSizeBytes: Math.max(0, Number(L?.file_size ?? L?.fileSize) || 0)
              };
            }
          });
          return e.buildCloudflareD1QuotaCard({
            planProfile: S,
            planState: h,
            usageState: E,
            databaseId: f,
            nowTimestamp: m
          });
        } catch (E) {
          return Cr("D1", "D1 指标读取失败", Kt(E));
        }
      })()]);
      return {
        kv: A,
        d1: b
      };
    }
  };
}
function Cg(o = {}, e = {}) {
  return {
    ..._g(o, e),
    ...bg(o, e),
    ...Eg(o, e),
    ...Rg(o, e),
    ...Tg(o, e),
    ...Ag(o, e)
  };
}
function wg(o = {}, e = {}) {
  return {
    getKV(r) {
      return Pa(r);
    },
    getDB(r) {
      return Ru(r);
    },
    buildD1CreateTableSql(r, t = r, a = {}) {
      const n = fe(t), s = `CREATE TABLE${a.ifNotExists === !0 ? " IF NOT EXISTS" : ""}`, i = {
        [e.D1_SCHEMA_META_TABLE]: `${s} ${n} (scope TEXT PRIMARY KEY, contract_version INTEGER NOT NULL, contract_hash TEXT NOT NULL, schema_fingerprint TEXT NOT NULL, schema_cookie INTEGER NOT NULL, last_plan_hash TEXT NOT NULL, verified_at TEXT NOT NULL, attestation TEXT NOT NULL, migration_owner TEXT, lease_expires_at INTEGER)`,
        [e.SYS_STATUS_TABLE]: `${s} ${n} (scope TEXT PRIMARY KEY, payload TEXT NOT NULL, updated_at INTEGER NOT NULL)`,
        [e.SCHEDULED_LOCKS_TABLE]: `${s} ${n} (scope TEXT PRIMARY KEY, token TEXT NOT NULL, owner TEXT NOT NULL, acquired_at INTEGER NOT NULL, renewed_at INTEGER, expires_at INTEGER NOT NULL)`,
        [e.AUTH_FAILURES_TABLE]: `${s} ${n} (ip TEXT PRIMARY KEY, fail_count INTEGER NOT NULL, expires_at INTEGER NOT NULL, updated_at INTEGER NOT NULL)`,
        [e.CF_DASH_CACHE_TABLE]: `${s} ${n} (cache_key TEXT PRIMARY KEY, zone_id TEXT NOT NULL, bucket_date TEXT NOT NULL, payload TEXT NOT NULL, version INTEGER NOT NULL, cached_at INTEGER NOT NULL, expires_at INTEGER NOT NULL, updated_at INTEGER NOT NULL)`,
        [e.CF_RUNTIME_CACHE_TABLE]: `${s} ${n} (cache_key TEXT PRIMARY KEY, cache_group TEXT NOT NULL, resource_id TEXT NOT NULL, payload TEXT NOT NULL, cached_at INTEGER NOT NULL, expires_at INTEGER NOT NULL, updated_at INTEGER NOT NULL)`,
        [e.DNS_IP_POOL_ITEMS_TABLE]: `${s} ${n} (id TEXT PRIMARY KEY, ip TEXT NOT NULL UNIQUE, ip_type TEXT NOT NULL, source_kind TEXT NOT NULL, source_label TEXT, line_label TEXT NOT NULL DEFAULT '', remark TEXT, created_at TEXT NOT NULL, updated_at TEXT NOT NULL)`,
        [e.DNS_IP_POOL_SOURCES_TABLE]: `${s} ${n} (id TEXT PRIMARY KEY, name TEXT NOT NULL, url TEXT NOT NULL, source_type TEXT NOT NULL DEFAULT 'url', domain TEXT, source_kind TEXT NOT NULL DEFAULT 'custom', preset_id TEXT NOT NULL DEFAULT '', builtin_id TEXT NOT NULL DEFAULT '', enabled INTEGER NOT NULL DEFAULT 1, sort_order INTEGER NOT NULL DEFAULT 0, ip_limit INTEGER NOT NULL DEFAULT 5, last_fetch_at TEXT, last_fetch_status TEXT, last_fetch_count INTEGER NOT NULL DEFAULT 0, created_at TEXT NOT NULL, updated_at TEXT NOT NULL)`,
        [e.DNS_IP_POOL_FETCH_CACHE_TABLE]: `${s} ${n} (signature TEXT PRIMARY KEY, items_json TEXT NOT NULL, source_results_json TEXT NOT NULL, imported_count INTEGER NOT NULL DEFAULT 0, enabled_source_count INTEGER NOT NULL DEFAULT 0, cached_at INTEGER NOT NULL, expires_at INTEGER NOT NULL, created_at TEXT NOT NULL, updated_at TEXT NOT NULL)`,
        [e.DNS_IP_PROBE_CACHE_TABLE]: `${s} ${n} (ip TEXT NOT NULL, entry_colo TEXT NOT NULL, probe_status TEXT NOT NULL, latency_ms INTEGER, cf_ray TEXT, colo_code TEXT, city_name TEXT, country_code TEXT, country_name TEXT, probed_at TEXT NOT NULL, expires_at INTEGER NOT NULL, PRIMARY KEY (ip, entry_colo))`,
        [e.LOGS_TABLE]: `${s} ${n} (id INTEGER PRIMARY KEY AUTOINCREMENT, timestamp INTEGER NOT NULL, node_name TEXT NOT NULL, request_path TEXT NOT NULL, request_method TEXT NOT NULL, status_code INTEGER NOT NULL, response_time INTEGER NOT NULL, client_ip TEXT NOT NULL, inbound_colo TEXT, outbound_colo TEXT, user_agent TEXT, referer TEXT, category TEXT DEFAULT 'api', error_detail TEXT, detail_json TEXT, created_at TEXT NOT NULL, inbound_ip TEXT, outbound_ip TEXT)`,
        [e.STATS_HOURLY_TABLE]: `${s} ${n} (bucket_date TEXT NOT NULL, bucket_hour INTEGER NOT NULL, request_count INTEGER NOT NULL DEFAULT 0, play_count INTEGER NOT NULL DEFAULT 0, playback_info_count INTEGER NOT NULL DEFAULT 0, updated_at TEXT NOT NULL, PRIMARY KEY (bucket_date, bucket_hour))`
      }[r];
      if (!i) throw new Error(`Unknown D1 schema table: ${r}`);
      return i;
    },
    getD1LogsFtsContractSql() {
      return {
        createTable: `CREATE VIRTUAL TABLE ${e.LOGS_FTS_TABLE} USING fts5(node_name, request_path, user_agent, error_detail, detail_json, content='${e.LOGS_TABLE}', content_rowid='id', tokenize='unicode61')`,
        createTrigger: `CREATE TRIGGER ${e.LOGS_FTS_INSERT_TRIGGER} AFTER INSERT ON ${e.LOGS_TABLE} BEGIN
          INSERT INTO ${e.LOGS_FTS_TABLE}(rowid, node_name, request_path, user_agent, error_detail, detail_json)
          VALUES (new.id, new.node_name, new.request_path, COALESCE(new.user_agent, ''), COALESCE(new.error_detail, ''), COALESCE(new.detail_json, ''));
        END;`
      };
    },
    getD1ContractHash() {
      const r = e.getD1CurrentSchemaContract();
      return ce(Q({
        version: rt,
        createTables: Object.keys(r.columns).sort().map((t) => [t, e.buildD1CreateTableSql(t)]),
        columns: r.columns,
        columnAffinities: r.columnAffinities,
        primaryKeys: r.primaryKeys,
        indexes: r.indexes,
        uniqueIndexes: r.uniqueIndexes,
        fts: e.getD1LogsFtsContractSql(),
        safeColumnAdditions: e.getD1RuntimeColumnAdditions()
      }));
    },
    async getD1SchemaCookie(r) {
      const t = await r.prepare("PRAGMA schema_version").first();
      return Math.max(0, Number(t?.schema_version) || 0);
    },
    buildD1SchemaAttestationPayload(r = {}) {
      return Q({
        scope: "main",
        contractVersion: Math.max(0, Number(r.contractVersion ?? r.contract_version) || 0),
        contractHash: String((r.contractHash ?? r.contract_hash) || ""),
        schemaFingerprint: String((r.schemaFingerprint ?? r.schema_fingerprint) || ""),
        schemaCookie: Math.max(0, Number(r.schemaCookie ?? r.schema_cookie) || 0),
        lastPlanHash: String((r.lastPlanHash ?? r.last_plan_hash) || ""),
        verifiedAt: String((r.verifiedAt ?? r.verified_at) || "")
      });
    },
    async signD1SchemaAttestation(r, t = {}) {
      const a = String(r?.JWT_SECRET || "").trim();
      return a ? await ht(a, e.buildD1SchemaAttestationPayload(t)) : "";
    },
    async readD1SchemaMeta(r) {
      try {
        return await r.prepare(`SELECT scope, contract_version, contract_hash, schema_fingerprint, schema_cookie, last_plan_hash, verified_at, attestation, migration_owner, lease_expires_at FROM ${fe(e.D1_SCHEMA_META_TABLE)} WHERE scope = 'main' LIMIT 1`).first();
      } catch {
        return null;
      }
    },
    async verifyD1SchemaAttestation(r, t) {
      const a = await e.readD1SchemaMeta(r);
      if (!a) return {
        valid: !1,
        reason: "missing_meta"
      };
      const n = Math.max(0, Number(a.contract_version) || 0);
      if (n > rt) return {
        valid: !1,
        blocked: !0,
        reason: "schema_version_ahead",
        meta: a
      };
      if (n !== rt) return {
        valid: !1,
        reason: "version_mismatch",
        meta: a
      };
      if (String(a.contract_hash || "") !== e.getD1ContractHash()) return {
        valid: !1,
        reason: "contract_hash_mismatch",
        meta: a
      };
      const s = await e.getD1SchemaCookie(r);
      if (Math.max(0, Number(a.schema_cookie) || 0) !== s) return {
        valid: !1,
        reason: "schema_cookie_changed",
        meta: a,
        schemaCookie: s
      };
      const i = await e.signD1SchemaAttestation(t, a);
      return !i || i !== String(a.attestation || "") ? {
        valid: !1,
        reason: "invalid_attestation",
        meta: a,
        schemaCookie: s
      } : {
        valid: !0,
        meta: a,
        schemaCookie: s
      };
    },
    async writeVerifiedD1SchemaMeta(r, t, a = {}) {
      const n = e.getD1ContractHash(), s = await e.getD1SchemaFingerprint(r), i = await e.getD1SchemaCookie(r), c = (/* @__PURE__ */ new Date()).toISOString(), l = {
        contractVersion: rt,
        contractHash: n,
        schemaFingerprint: s,
        schemaCookie: i,
        lastPlanHash: String(a?.planHash || ""),
        verifiedAt: c
      }, d = await e.signD1SchemaAttestation(t, l);
      return d ? (await r.prepare(`INSERT INTO ${fe(e.D1_SCHEMA_META_TABLE)} (scope, contract_version, contract_hash, schema_fingerprint, schema_cookie, last_plan_hash, verified_at, attestation, migration_owner, lease_expires_at)
        VALUES ('main', ?, ?, ?, ?, ?, ?, ?, NULL, NULL)
        ON CONFLICT(scope) DO UPDATE SET contract_version = excluded.contract_version, contract_hash = excluded.contract_hash, schema_fingerprint = excluded.schema_fingerprint, schema_cookie = excluded.schema_cookie, last_plan_hash = excluded.last_plan_hash, verified_at = excluded.verified_at, attestation = excluded.attestation, migration_owner = NULL, lease_expires_at = NULL`).bind(rt, n, s, i, l.lastPlanHash, c, d).run(), {
        written: !0,
        attestation: d,
        ...l
      }) : {
        written: !1,
        reason: "missing_secret",
        ...l
      };
    },
    async acquireD1SchemaRepairLease(r, t, a = {}) {
      const n = Math.max(0, Number(a.nowMs ?? k()) || 0), s = n + xd, i = await r.prepare(`INSERT INTO ${fe(e.D1_SCHEMA_META_TABLE)} (scope, contract_version, contract_hash, schema_fingerprint, schema_cookie, last_plan_hash, verified_at, attestation, migration_owner, lease_expires_at)
        VALUES ('main', 0, '', '', 0, '', '', '', ?, ?)
        ON CONFLICT(scope) DO UPDATE SET migration_owner = excluded.migration_owner, lease_expires_at = excluded.lease_expires_at
        WHERE ${fe(e.D1_SCHEMA_META_TABLE)}.migration_owner IS NULL OR ${fe(e.D1_SCHEMA_META_TABLE)}.lease_expires_at IS NULL OR ${fe(e.D1_SCHEMA_META_TABLE)}.lease_expires_at < ? OR ${fe(e.D1_SCHEMA_META_TABLE)}.migration_owner = excluded.migration_owner`).bind(t, s, n).run();
      if (Math.max(0, Number(i?.meta?.changes ?? i?.changes) || 0) < 1) {
        const c = /* @__PURE__ */ new Error("D1 schema repair is already running");
        throw c.code = "D1_SCHEMA_REPAIR_IN_PROGRESS", c.status = 409, c.details = { leaseExpiresAt: s }, c;
      }
      return {
        owner: t,
        leaseExpiresAt: s
      };
    },
    async releaseD1SchemaRepairLease(r, t) {
      return t ? (await r.prepare(`UPDATE ${fe(e.D1_SCHEMA_META_TABLE)} SET migration_owner = NULL, lease_expires_at = NULL WHERE scope = 'main' AND migration_owner = ?`).bind(t).run(), !0) : !1;
    },
    getD1UniqueIndexContract() {
      return { ux_dns_ip_pool_items_ip: {
        table: e.DNS_IP_POOL_ITEMS_TABLE,
        columns: ["ip"],
        createSql: `CREATE UNIQUE INDEX ux_dns_ip_pool_items_ip ON ${e.DNS_IP_POOL_ITEMS_TABLE} (ip)`
      } };
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
        [e.D1_SCHEMA_META_TABLE]: {
          contract_version: "INTEGER NOT NULL DEFAULT 0",
          contract_hash: "TEXT NOT NULL DEFAULT ''",
          schema_fingerprint: "TEXT NOT NULL DEFAULT ''",
          schema_cookie: "INTEGER NOT NULL DEFAULT 0",
          last_plan_hash: "TEXT NOT NULL DEFAULT ''",
          verified_at: "TEXT NOT NULL DEFAULT ''",
          attestation: "TEXT NOT NULL DEFAULT ''",
          migration_owner: "TEXT",
          lease_expires_at: "INTEGER"
        },
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
        [e.D1_SCHEMA_META_TABLE]: ["scope"],
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
    getD1SchemaReadyState(r) {
      if (!r || typeof r.prepare != "function") return null;
      let t = Z.D1SchemaReadyState.get(r);
      return t instanceof Map || (t = /* @__PURE__ */ new Map(), Z.D1SchemaReadyState.set(r, t)), t;
    },
    isD1SchemaReadyCached(r, t) {
      const a = e.getD1SchemaReadyState(r);
      return !!a && (Number(a.get(String(t || ""))) || 0) > k();
    },
    markD1SchemaReady(r, t) {
      const a = e.getD1SchemaReadyState(r);
      a && a.set(String(t || ""), k() + Math.max(1e3, Number(v.Defaults.D1SchemaReadyTtlMs) || 1e3));
    },
    clearD1SchemaReady(r, t = []) {
      const a = Z.D1SchemaReadyState.get(r);
      if (!(a instanceof Map)) return;
      const n = (Array.isArray(t) ? t : [t]).map((s) => String(s || "").trim()).filter(Boolean);
      if (!n.length) {
        a.clear();
        return;
      }
      for (const s of n) a.delete(s);
    },
    normalizeRevisionMeta(r, t) {
      const a = U(r) ? r : {}, n = U(t) ? t : {}, s = String(a.updatedAt || n.updatedAt || "").trim(), i = String(a.hash || n.hash || "").trim();
      return {
        ...n,
        ...a,
        updatedAt: s,
        hash: i,
        revision: String(a.revision || n.revision || Bt(i, s)).trim()
      };
    },
    async readRevisionMeta(r, t, a) {
      if (!r || !t) return e.normalizeRevisionMeta({}, a);
      try {
        return e.normalizeRevisionMeta(await r.get(t, { type: "json" }), a);
      } catch {
        return e.normalizeRevisionMeta({}, a);
      }
    },
    async readRevisionMetaForRead(r, t, a) {
      if (!r || !t) return null;
      const n = await Le(r, t, { type: "json" });
      return U(n) ? e.normalizeRevisionMeta(n, a) : null;
    },
    async writeRevisionMeta(r, t, a, n = null) {
      if (!r || !t) return a;
      const s = r.put(t, JSON.stringify(a));
      return n && n.waitUntil(s), await s, a;
    },
    async ensureConfigMeta(r, t = null, a = {}) {
      const n = re(t ?? (await r?.get(e.CONFIG_KEY, { type: "json" }) || {})), s = e.normalizeRevisionMeta(Ir(n)), i = await e.readRevisionMeta(r, e.CONFIG_META_KEY);
      return i.hash === s.hash && i.revision ? i : await e.writeRevisionMeta(r, e.CONFIG_META_KEY, s, a.ctx);
    },
    async ensureConfigSnapshotsMeta(r, t = null, a = {}) {
      const n = Array.isArray(t) ? t : await e.readStoredConfigSnapshots(r), s = e.normalizeRevisionMeta({
        ...Ir(n),
        count: n.length
      }, { count: 0 }), i = await e.readRevisionMeta(r, e.CONFIG_SNAPSHOTS_META_KEY, { count: 0 });
      return i.hash === s.hash && Number(i.count) === Number(s.count) && i.revision ? i : await e.writeRevisionMeta(r, e.CONFIG_SNAPSHOTS_META_KEY, s, a.ctx);
    },
    buildNodesIndexMeta(r = [], t = [], a = {}) {
      const n = e.normalizeNodeIndex(r), s = e.normalizeNodeSummaryIndex(t).nodes, i = String(a.updatedAt || "").trim() || (/* @__PURE__ */ new Date()).toISOString(), c = ce(Q(n)), l = ce(Q(s)), d = ce(`${c}:${l}:${n.length}`);
      return {
        revision: Bt(d, i),
        updatedAt: i,
        hash: d,
        count: n.length,
        indexHash: c,
        fullIndexHash: l
      };
    },
    async ensureNodesIndexMeta(r, t = {}) {
      if (!r) return e.buildNodesIndexMeta([], []);
      let a = Array.isArray(t.nodes) ? e.normalizeNodeSummaryIndex(t.nodes).nodes : null;
      if (!a) {
        const c = await e.getNodesSummaryIndex(r, { ctx: t.ctx });
        a = Array.isArray(c) ? c : [];
      }
      const n = Array.isArray(t.index) ? e.normalizeNodeIndex(t.index) : e.normalizeNodeIndex(a.map((c) => c?.name)), s = e.buildNodesIndexMeta(n, a, t), i = await e.readRevisionMeta(r, e.NODES_INDEX_META_KEY, {
        count: 0,
        indexHash: "",
        fullIndexHash: ""
      });
      return i.indexHash === s.indexHash && i.fullIndexHash === s.fullIndexHash && Number(i.count) === Number(s.count) && i.revision ? i : await Dr(async () => {
        const c = await e.loadNodeSummariesForMutation(r, { ctx: t.ctx });
        return (await e.commitNodesSummaryIndexMutation(c, {
          kv: r,
          ctx: t.ctx
        })).meta;
      }, r);
    },
    async getNodesRevision(r, t = {}) {
      if (!r) return "";
      const a = _e(r), n = k();
      if (t.forceFresh !== !0 && a.NodesRevisionCache?.loaded === !0 && a.NodesRevisionCache.exp > n) return String(a.NodesRevisionCache.revision || "").trim();
      const s = a.NodesRevisionCacheGeneration;
      return await Sn(a.SingleFlightTasks, ot(["nodes_revision", s]), async () => {
        const i = a.NodesRevisionCache;
        if (t.forceFresh !== !0 && i?.loaded === !0 && i.exp > k()) return String(i.revision || "").trim();
        let c = null;
        try {
          c = await r.get(e.NODES_INDEX_META_KEY, { type: "json" });
        } catch {
          return "";
        }
        const l = U(c) ? String(c.revision || "").trim() : "";
        return a.NodesRevisionCacheGeneration === s && (a.NodesRevisionCache = {
          loaded: !0,
          revision: l,
          exp: k() + v.Defaults.NodesRevisionCacheTtlMs
        }), l;
      });
    },
    getLogsRevisionFromStatus(r = {}) {
      const t = String(r?.revision || "").trim();
      return t || Bt("logs", String(r?.updatedAt || "").trim());
    },
    async bumpLogsRevision(r, t = {}, a = null) {
      const n = await e.getOpsStatusSection(r, "log"), s = (/* @__PURE__ */ new Date()).toISOString(), i = ce(`${e.getLogsRevisionFromStatus(n)}:${s}:${Q(t)}`);
      return await e.patchOpsStatus(r, { log: {
        ...t,
        revision: Bt(i, s),
        updatedAt: s
      } }, a);
    },
    async getAdminRevisions(r, t = {}) {
      const a = e.resolveOpsStatusStores(r), n = a.kv, s = a.db, [i, c, l, d, u] = await Promise.all([
        e.ensureConfigMeta(n, t.config, { ctx: t.ctx }),
        e.ensureNodesIndexMeta(n, {
          ctx: t.ctx,
          index: t.nodes?.map?.((f) => f?.name),
          nodes: t.nodes
        }),
        e.ensureConfigSnapshotsMeta(n, t.snapshots, { ctx: t.ctx }),
        e.getOpsStatusSection({
          kv: n,
          db: s
        }, "log"),
        e.getOpsStatusSection({
          kv: n,
          db: s
        }, "dnsIpPool")
      ]);
      return {
        configRevision: String(i?.revision || ""),
        nodesRevision: String(c?.revision || ""),
        snapshotsRevision: String(l?.revision || ""),
        logsRevision: e.getLogsRevisionFromStatus(d),
        dnsIpPoolRevision: e.getDnsIpPoolRevisionFromStatus(u)
      };
    },
    async getAdminRevisionsForRead(r, t = {}) {
      const a = e.resolveOpsStatusStores(r), n = a.kv, s = a.db, [i, c, l, d, u] = await Promise.all([
        e.readRevisionMetaForRead(n, e.CONFIG_META_KEY),
        e.readRevisionMetaForRead(n, e.NODES_INDEX_META_KEY, {
          count: 0,
          indexHash: "",
          fullIndexHash: ""
        }),
        e.readRevisionMetaForRead(n, e.CONFIG_SNAPSHOTS_META_KEY, { count: 0 }),
        e.getOpsStatusSection({
          kv: n,
          db: s
        }, "log"),
        e.getOpsStatusSection({
          kv: n,
          db: s
        }, "dnsIpPool")
      ]), f = t.config !== void 0 ? t.config : await Le(n, e.CONFIG_KEY, { type: "json" }) || {}, m = e.normalizeRevisionMeta(Ir(re(f), { updatedAt: String(i?.updatedAt || "").trim() })), p = String(i?.revision || "").trim().split(".").pop() || "", g = i?.hash === m.hash && p === m.hash ? i : m;
      let h = c;
      if (!h) {
        const S = Array.isArray(t.nodes) ? t.nodes : await e.getNodesSummaryIndexStrict(n, { ctx: t.ctx });
        h = e.buildNodesIndexMeta((Array.isArray(S) ? S : []).map((_) => _?.name), Array.isArray(S) ? S : []);
      }
      let y = l;
      if (!y) {
        const S = Array.isArray(t.snapshots) ? t.snapshots : await e.readStoredConfigSnapshotsStrict(n);
        y = e.normalizeRevisionMeta({
          ...Ir(Array.isArray(S) ? S : []),
          count: Array.isArray(S) ? S.length : 0
        }, { count: 0 });
      }
      return {
        configRevision: String(g?.revision || ""),
        nodesRevision: String(h?.revision || ""),
        snapshotsRevision: String(y?.revision || ""),
        logsRevision: e.getLogsRevisionFromStatus(d),
        dnsIpPoolRevision: e.getDnsIpPoolRevisionFromStatus(u)
      };
    }
  };
}
function Lg(o = {}, e = {}) {
  return {
    async hasLogsFtsTable(r) {
      if (!r) return !1;
      try {
        const t = await r.prepare("SELECT name FROM sqlite_master WHERE type = 'table' AND name = ? LIMIT 1").bind(e.LOGS_FTS_TABLE).first();
        return String(t?.name || "") === e.LOGS_FTS_TABLE;
      } catch {
        return !1;
      }
    },
    async getLogsFtsReadiness(r) {
      if (!r || !await e.hasLogsFtsTable(r)) return {
        tableReady: !1,
        virtualTableReady: !1,
        columnsReady: !1,
        triggerReady: !1,
        ready: !1
      };
      const t = await e.getTableColumns(r, e.LOGS_FTS_TABLE), a = [
        "node_name",
        "request_path",
        "user_agent",
        "error_detail",
        "detail_json"
      ].every((p) => t.has(p)), [n, s] = await Promise.all([r.prepare("SELECT sql FROM sqlite_master WHERE type = 'table' AND name = ? LIMIT 1").bind(e.LOGS_FTS_TABLE).first(), r.prepare("SELECT name, tbl_name, sql FROM sqlite_master WHERE type = 'trigger' AND name = ? LIMIT 1").bind(e.LOGS_FTS_INSERT_TRIGGER).first()]), i = za(n?.sql || "").replace(/'/g, ""), c = /^create\s+virtual\s+table\b/.test(i) && /\busing\s+fts5\s*\(/.test(i) && new RegExp(`\\bcontent\\s*=\\s*${e.LOGS_TABLE}\\b`).test(i) && /\bcontent_rowid\s*=\s*id\b/.test(i), l = za(s?.sql || ""), d = l.replace(/\s+/g, ""), u = `insert into ${e.LOGS_FTS_TABLE} (
            rowid, node_name, request_path, user_agent, error_detail, detail_json
          ) values (
            new.id, new.node_name, new.request_path,
            coalesce(new.user_agent, ''), coalesce(new.error_detail, ''), coalesce(new.detail_json, '')
          )`.replace(/\s+/g, ""), f = d.includes(u), m = String(s?.name || "") === e.LOGS_FTS_INSERT_TRIGGER && String(s?.tbl_name || "") === e.LOGS_TABLE && new RegExp(`\\bafter\\s+insert\\s+on\\s+${e.LOGS_TABLE}\\b`).test(l) && new RegExp(`\\binsert\\s+into\\s+${e.LOGS_FTS_TABLE}\\s*\\(`).test(l) && f;
      return {
        tableReady: !0,
        virtualTableReady: c,
        columnsReady: a,
        triggerReady: m,
        ready: c && a && m
      };
    },
    async isLogsFtsReady(r) {
      return (await e.getLogsFtsReadiness(r)).ready === !0;
    },
    async hasLogsBaseTable(r) {
      if (!r) return !1;
      if (e.isD1SchemaReadyCached(r, "logsTableExists")) return !0;
      try {
        const t = await r.prepare("SELECT name FROM sqlite_master WHERE type = 'table' AND name = ? LIMIT 1").bind(e.LOGS_TABLE).first(), a = String(t?.name || "") === e.LOGS_TABLE;
        return a && e.markD1SchemaReady(r, "logsTableExists"), a;
      } catch {
        return !1;
      }
    },
    async hasStatsHourlyTable(r) {
      if (!r) return !1;
      if (e.isD1SchemaReadyCached(r, "statsTableExists")) return !0;
      try {
        const t = await r.prepare("SELECT name FROM sqlite_master WHERE type = 'table' AND name = ? LIMIT 1").bind(e.STATS_HOURLY_TABLE).first(), a = String(t?.name || "") === e.STATS_HOURLY_TABLE;
        return a && e.markD1SchemaReady(r, "statsTableExists"), a;
      } catch {
        return !1;
      }
    },
    async getTableColumnDefinitions(r, t) {
      if (!r || !t) return [];
      try {
        return ((await r.prepare(`PRAGMA table_xinfo(${fe(t)})`).all())?.results || []).map((a) => ({
          name: String(a?.name || "").toLowerCase(),
          type: String(a?.type || "").trim().toUpperCase(),
          affinity: ls(a?.type),
          primaryKeyOrder: Math.max(0, Number(a?.pk) || 0),
          notNull: Number(a?.notnull) === 1,
          defaultValue: a?.dflt_value ?? null,
          hidden: Math.max(0, Number(a?.hidden) || 0)
        })).filter((a) => a.name);
      } catch (a) {
        const n = /* @__PURE__ */ new Error(`D1 schema inspection failed for ${t}`);
        throw n.code = "D1_SCHEMA_INSPECTION_FAILED", n.status = 503, n.details = {
          tableName: String(t),
          cause: ie(a, "d1_pragma_failed")
        }, n;
      }
    },
    async getTableColumns(r, t) {
      const a = await e.getTableColumnDefinitions(r, t);
      return new Set(a.map((n) => n.name));
    },
    async getIndexKeyColumns(r, t) {
      if (!r || !t) return [];
      try {
        return ((await r.prepare(`PRAGMA index_xinfo(${fe(t)})`).all())?.results || []).map((a) => ({
          order: Math.max(0, Number(a?.seqno) || 0),
          name: String(a?.name || "").toLowerCase(),
          key: a?.key === void 0 || Number(a.key) === 1,
          expression: Number(a?.cid) === -2 || !String(a?.name || "").trim()
        })).filter((a) => a.key).sort((a, n) => a.order - n.order).map((a) => a.expression ? "<expression>" : a.name);
      } catch (a) {
        const n = /* @__PURE__ */ new Error(`D1 schema inspection failed for ${t}`);
        throw n.code = "D1_SCHEMA_INSPECTION_FAILED", n.status = 503, n.details = {
          indexName: String(t),
          cause: ie(a, "d1_pragma_failed")
        }, n;
      }
    },
    async getTableIndexDefinitions(r, t) {
      if (!r || !t) return [];
      try {
        return ((await r.prepare(`PRAGMA index_list(${fe(t)})`).all())?.results || []).map((a) => ({
          name: String(a?.name || ""),
          unique: Number(a?.unique) === 1,
          partial: Number(a?.partial) === 1
        })).filter((a) => a.name);
      } catch (a) {
        const n = /* @__PURE__ */ new Error(`D1 schema inspection failed for ${t}`);
        throw n.code = "D1_SCHEMA_INSPECTION_FAILED", n.status = 503, n.details = {
          tableName: String(t),
          cause: ie(a, "d1_pragma_failed")
        }, n;
      }
    },
    async getD1TableNameSet(r) {
      if (!r) return /* @__PURE__ */ new Set();
      const t = await r.prepare("SELECT name FROM sqlite_master WHERE type = 'table'").all();
      return new Set((t?.results || []).map((a) => String(a?.name || "")).filter(Boolean));
    },
    getD1CurrentSchemaContract() {
      const r = e.getD1RequiredPrimaryKeyContract(), t = {
        [e.D1_SCHEMA_META_TABLE]: { scope: "TEXT" },
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
      }, a = Object.fromEntries(Object.entries(e.getD1RuntimeColumnAdditions()).map(([n, s]) => {
        const i = Object.fromEntries(Object.entries(s).map(([c, l]) => [c, String(l || "").trim().split(/\s+/, 1)[0].toUpperCase()]));
        return [n, {
          ...t[n],
          ...i
        }];
      }));
      return {
        columns: Object.fromEntries(Object.entries(a).map(([n, s]) => [n, Object.keys(s)])),
        columnTypes: a,
        columnAffinities: Object.fromEntries(Object.entries(a).map(([n, s]) => [n, Object.fromEntries(Object.entries(s).map(([i, c]) => [i, ls(c)]))])),
        primaryKeys: r,
        indexes: e.getD1RuntimeIndexContract(),
        uniqueIndexes: e.getD1UniqueIndexContract()
      };
    },
    async getD1SchemaFingerprint(r) {
      if (!r) return "";
      const t = e.getD1CurrentSchemaContract(), a = (await r.prepare("SELECT type, name, tbl_name, sql FROM sqlite_master WHERE type IN ('table', 'index', 'trigger') ORDER BY type, name").all())?.results || [], n = {};
      for (const s of Object.keys(t.columns)) n[s] = (await e.getTableColumnDefinitions(r, s)).map((i) => ({
        name: i.name,
        type: i.type,
        primaryKeyOrder: i.primaryKeyOrder,
        hidden: i.hidden
      }));
      return ce(Q({
        schemaRows: a,
        columnState: n
      }));
    },
    async getD1SchemaStatus(r) {
      if (!r) return {
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
      const t = e.getD1CurrentSchemaContract(), [a, n] = await Promise.all([r.prepare("SELECT name FROM sqlite_master WHERE type = 'table'").all(), r.prepare("SELECT name, tbl_name FROM sqlite_master WHERE type = 'index'").all()]), s = new Set((a?.results || []).map((h) => String(h?.name || "")).filter(Boolean)), i = new Map((n?.results || []).map((h) => [String(h?.name || ""), String(h?.tbl_name || "")]).filter(([h]) => h)), c = Object.fromEntries(Object.keys(t.columns).map((h) => [h, s.has(h)])), l = {}, d = {}, u = [];
      for (const [h, y] of Object.entries(t.columns)) {
        if (!s.has(h)) {
          l[h] = Object.fromEntries(y.map((E) => [E, !1])), d[h] = !1, u.push(`missing_table:${h}`);
          continue;
        }
        const S = await e.getTableColumnDefinitions(r, h), _ = new Map(S.map((E) => [E.name, E]));
        l[h] = Object.fromEntries(y.map((E) => {
          const R = _.get(E), L = String(t.columnAffinities?.[h]?.[E] || "").toUpperCase(), T = h === e.LOGS_TABLE && E === "id";
          return [E, !!R && (!L || R.affinity === L) && (!T || R.type === "INTEGER")];
        }));
        for (const [E, R] of Object.entries(l[h])) if (!R) {
          const L = _.get(E);
          u.push(L ? `invalid_column_affinity:${h}.${E}` : `missing_column:${h}.${E}`);
        }
        const A = S.filter((E) => E.primaryKeyOrder > 0).sort((E, R) => E.primaryKeyOrder - R.primaryKeyOrder).map((E) => E.name), b = h === e.LOGS_TABLE ? S.find((E) => E.name === "id") : null;
        d[h] = Q(A) === Q(t.primaryKeys[h] || []) && (!b || b.type === "INTEGER"), d[h] || u.push(`invalid_primary_key:${h}`);
      }
      let f = !1;
      if (s.has(e.DNS_IP_POOL_ITEMS_TABLE)) {
        for (const h of (await e.getTableIndexDefinitions(r, e.DNS_IP_POOL_ITEMS_TABLE)).filter((y) => y.unique && !y.partial)) if (Q(await e.getIndexKeyColumns(r, h.name)) === Q(["ip"])) {
          f = !0;
          break;
        }
        f || u.push(`missing_unique_key:${e.DNS_IP_POOL_ITEMS_TABLE}.ip`);
      }
      const m = {};
      for (const [h, y] of Object.entries(t.indexes)) {
        const S = i.get(h);
        if (!S) {
          m[h] = !1, u.push(`missing_index:${h}`);
          continue;
        }
        const _ = (await e.getTableIndexDefinitions(r, y.table)).find((A) => A.name === h);
        m[h] = S === y.table && _?.unique === !1 && _?.partial === !1 && Q(await e.getIndexKeyColumns(r, h)) === Q(y.columns), m[h] || u.push(`invalid_index:${h}`);
      }
      const p = await e.getLogsFtsReadiness(r);
      p.ready || u.push(p.tableReady ? "fts_contract_invalid" : `missing_table:${e.LOGS_FTS_TABLE}`);
      const g = Object.values(c).every(Boolean) && Object.values(l).every((h) => Object.values(h).every(Boolean)) && Object.values(d).every(Boolean) && f && Object.values(m).every(Boolean) && p.ready;
      return {
        tables: c,
        columns: l,
        indexes: m,
        constraints: {
          primaryKeys: d,
          uniqueKeys: { [`${e.DNS_IP_POOL_ITEMS_TABLE}.ip`]: f }
        },
        ftsReady: p.ready,
        fts: p,
        schemaReady: g,
        issues: u
      };
    },
    async getD1SchemaReadiness(r, t = {}) {
      if (t.allowAttestedFastPath === !0 && t.env) {
        const a = await e.verifyD1SchemaAttestation(r, t.env);
        if (a.blocked) return {
          schemaReady: !1,
          fastPath: !1,
          issues: ["schema_version_ahead"],
          attested: a
        };
        if (a.valid) return {
          schemaReady: !0,
          fastPath: !0,
          contractVersion: rt,
          contractHash: e.getD1ContractHash(),
          schemaFingerprint: String(a.meta?.schema_fingerprint || ""),
          schemaCookie: a.schemaCookie,
          issues: []
        };
      }
      return {
        ...await e.getD1SchemaStatus(r),
        fastPath: !1
      };
    },
    async probeD1UniqueKeyRepair(r, t, a = []) {
      const n = fe(t), s = a.map((d) => fe(d)), i = s.map((d) => `${d} IS NULL OR (typeof(${d}) = 'text' AND trim(${d}) = '')`).join(" OR "), [c, l] = await Promise.all([r.prepare(`SELECT 1 AS present FROM ${n} WHERE ${i} LIMIT 1`).first(), r.prepare(`SELECT 1 AS present FROM ${n} GROUP BY ${s.join(", ")} HAVING COUNT(*) > 1 LIMIT 1`).first()]);
      return {
        empty: !!c,
        duplicate: !!l
      };
    },
    async probeD1PrimaryKeyRepair(r, t, a) {
      const n = await e.getTableColumnDefinitions(r, t), s = t === e.LOGS_TABLE, i = new Set(a.columns?.[t] || []), c = a.primaryKeys?.[t] || [], l = new Map(n.map((h) => [h.name, h])), d = [];
      for (const h of c) {
        const y = l.get(h), S = a.columnAffinities?.[t]?.[h];
        y ? (y.affinity !== S || t === e.LOGS_TABLE && h === "id" && y.type !== "INTEGER") && d.push(`invalid_column_affinity:${t}.${h}`) : s || d.push(`missing_key_column:${t}.${h}`);
      }
      const u = n.filter((h) => !i.has(h.name)).map((h) => h.name);
      !s && u.length && d.push(`unsupported_extra_columns:${t}:${u.join(",")}`), !s && n.some((h) => h.hidden > 0) && d.push(`unsupported_hidden_columns:${t}`), ((await r.prepare(`PRAGMA foreign_key_list(${fe(t)})`).all())?.results || []).length && d.push(`unsupported_foreign_keys:${t}`);
      const f = ((await r.prepare("SELECT name, sql FROM sqlite_master WHERE type = 'trigger' AND tbl_name = ?").bind(t).all())?.results || []).filter((h) => {
        if (t !== e.LOGS_TABLE) return !0;
        const y = String(h?.name || "").toLowerCase(), S = za(h?.sql || "");
        return !(y === String(e.LOGS_FTS_INSERT_TRIGGER).toLowerCase() || y === `${e.LOGS_TABLE}_ai` || y === `${e.LOGS_TABLE}_au` || y === `${e.LOGS_TABLE}_ad` || S.includes(String(e.LOGS_FTS_TABLE).toLowerCase()));
      });
      !s && f.length && d.push(`unsupported_triggers:${t}:${f.map((h) => String(h?.name || "")).join(",")}`);
      const m = [`__d1_repair_${t}_`, `__d1_backup_${t}_`], p = await r.prepare("SELECT name FROM sqlite_master WHERE type = 'table' AND (name GLOB ? OR name GLOB ?) LIMIT 1").bind(`${m[0]}*`, `${m[1]}*`).first();
      p?.name && d.push(`repair_artifact_present:${t}:${String(p.name)}`);
      let g = null;
      if (!s) {
        const h = fe(t), y = await r.prepare(`SELECT COUNT(*) AS total FROM (SELECT 1 FROM ${h} LIMIT ${vn + 1})`).first();
        g = Math.max(0, Number(y?.total) || 0);
      }
      if (!s && g > vn && d.push(`rebuild_row_limit_exceeded:${t}:${g}`), !s && !d.length) {
        const h = await e.probeD1UniqueKeyRepair(r, t, c);
        h.empty && d.push(`primary_key_empty:${t}`), h.duplicate && d.push(`primary_key_duplicate:${t}`);
      }
      return {
        repairable: d.length === 0,
        rowCount: g,
        estimatedRowsIsLowerBound: g !== null && g > vn,
        rowCountMeasured: g !== null,
        allowsDataLoss: s,
        blockers: d
      };
    },
    async buildD1SchemaRepairPlan(r) {
      const t = await e.getD1SchemaStatus(r), a = e.getD1CurrentSchemaContract(), n = await e.getD1SchemaFingerprint(r), s = await e.getD1SchemaCookie(r), i = e.getD1ContractHash(), c = await e.readD1SchemaMeta(r), l = [], d = [], u = [], f = [], m = (T, D, w = "low", M = 0, x = {}) => f.push({
        kind: T,
        target: D,
        risk: w,
        estimatedRows: M === null ? null : Math.max(0, Number(M) || 0),
        ...x
      });
      Math.max(0, Number(c?.contract_version) || 0) > rt && u.push(`schema_version_ahead:${Math.max(0, Number(c.contract_version) || 0)}`);
      for (const [T, D] of Object.entries(t.tables || {})) {
        if (!D) {
          const M = `missing_table:${T}`;
          l.push(M), m("create_table", T);
          continue;
        }
        const w = T === e.LOGS_TABLE && t.constraints?.primaryKeys?.[T] !== !0;
        for (const [M, x] of Object.entries(t.columns?.[T] || {})) {
          if (x) continue;
          const C = `${T}.${M}`, F = (t.issues || []).find((W) => String(W).endsWith(C)) || `missing_column:${C}`;
          w && String(F).startsWith("missing_column:") ? d.push(F) : String(F).startsWith("missing_column:") && e.getD1RuntimeColumnAdditions()?.[T]?.[M] ? (l.push(F), m("add_column", C)) : u.push(F);
        }
        if (t.constraints?.primaryKeys?.[T] !== !0) {
          const M = `invalid_primary_key:${T}`, x = await e.probeD1PrimaryKeyRepair(r, T, a);
          x.repairable ? (d.push(M), m(x.allowsDataLoss === !0 ? "recreate_log_table" : "rebuild_table", T, "high", x.rowCount, {
            allowsDataLoss: x.allowsDataLoss === !0,
            willDiscardData: x.allowsDataLoss === !0,
            dataMode: x.allowsDataLoss === !0 ? "discard" : "copy",
            estimatedRowsIsLowerBound: x.estimatedRowsIsLowerBound === !0,
            rowCountMeasured: x.rowCountMeasured === !0
          })) : u.push(M, ...x.blockers);
        }
      }
      const p = `${e.DNS_IP_POOL_ITEMS_TABLE}.ip`;
      if (t.tables?.[e.DNS_IP_POOL_ITEMS_TABLE] && t.constraints?.uniqueKeys?.[p] !== !0 && t.columns?.[e.DNS_IP_POOL_ITEMS_TABLE]?.ip === !0) {
        const T = await e.probeD1UniqueKeyRepair(r, e.DNS_IP_POOL_ITEMS_TABLE, ["ip"]);
        T.empty && u.push(`unique_key_empty:${p}`), T.duplicate && u.push(`unique_key_duplicate:${p}`), !T.empty && !T.duplicate && (l.push(`missing_unique_key:${p}`), m("create_unique_index", "ux_dns_ip_pool_items_ip"));
      }
      const g = f.some((T) => T.kind === "recreate_log_table" && T.target === e.LOGS_TABLE);
      for (const [T, D] of Object.entries(t.indexes || {})) if (!D) {
        const w = (t.issues || []).includes(`invalid_index:${T}`) ? `invalid_index:${T}` : `missing_index:${T}`;
        l.push(w), g && a.indexes?.[T]?.table === e.LOGS_TABLE || m(w.startsWith("invalid_") ? "repair_index" : "create_index", T);
      }
      if (t.ftsReady !== !0) {
        const T = t.fts?.tableReady ? "fts_contract_invalid" : `missing_table:${e.LOGS_FTS_TABLE}`;
        l.push(T), g || m(t.fts?.tableReady ? "recreate_fts" : "create_fts", e.LOGS_FTS_TABLE);
      }
      const h = (T) => [...new Set(T.map((D) => String(D || "").trim()).filter(Boolean))], y = [...new Map(f.map((T) => [`${T.kind}:${T.target}`, T])).values()].sort((T, D) => `${T.risk}:${T.kind}:${T.target}`.localeCompare(`${D.risk}:${D.kind}:${D.target}`)), S = h(l), _ = h(d), A = h(u), b = y.filter((T) => T.risk !== "high"), E = y.filter((T) => T.risk === "high"), R = A.length ? "blocked" : _.length ? "high" : S.length ? "low" : "none", L = A.length ? "blocked" : b.length ? "safe" : E.length ? "destructive" : "ready";
      return {
        version: Ka,
        phase: L,
        contractVersion: rt,
        contractHash: i,
        schemaCookie: s,
        planHash: ce(Q({
          version: Ka,
          contractVersion: rt,
          contractHash: i,
          schemaCookie: s,
          schemaFingerprint: n,
          phase: L,
          repairableIssues: S,
          highRiskIssues: _,
          blockingIssues: A,
          steps: y
        })),
        schemaFingerprint: n,
        risk: R,
        repairableIssues: S,
        highRiskIssues: _,
        blockingIssues: A,
        steps: y,
        status: t
      };
    },
    async createD1SchemaRepairToken(r, t, a = {}) {
      const n = String(r?.JWT_SECRET || "").trim();
      if (!n) {
        const l = /* @__PURE__ */ new Error("JWT_SECRET is required to sign the D1 schema repair plan");
        throw l.code = "SERVER_MISCONFIGURED", l.status = 503, l;
      }
      const s = Math.max(0, Math.floor(Number(a.nowMs ?? k()) / 1e3)), i = s + Math.floor(Pd / 1e3), c = Sa(JSON.stringify({
        version: Ka,
        scope: "d1_schema_repair",
        phase: String(t?.phase || ""),
        contractVersion: Math.max(0, Number(t?.contractVersion) || 0),
        contractHash: String(t?.contractHash || ""),
        schemaCookie: Math.max(0, Number(t?.schemaCookie) || 0),
        planHash: String(t?.planHash || ""),
        schemaFingerprint: String(t?.schemaFingerprint || ""),
        destructiveTargets: (t?.steps || []).filter((l) => l?.risk === "high").map((l) => String(l?.target || "")),
        issuedAt: s,
        expiresAt: i
      }));
      return {
        token: `${c}.${await ht(n, c)}`,
        expiresAt: i
      };
    },
    async verifyD1SchemaRepairToken(r, t, a, n = {}) {
      const s = String(r?.JWT_SECRET || "").trim(), i = String(t || "").trim(), c = (m, p = {}) => {
        const g = /* @__PURE__ */ new Error("D1 schema repair plan is stale");
        return g.code = "D1_SCHEMA_REPAIR_PLAN_STALE", g.status = 409, g.details = {
          reason: m,
          ...p
        }, g;
      };
      if (!s) {
        const m = /* @__PURE__ */ new Error("JWT_SECRET is required to verify the D1 schema repair plan");
        throw m.code = "SERVER_MISCONFIGURED", m.status = 503, m;
      }
      const l = i.indexOf(".");
      if (l <= 0 || l === i.length - 1) throw c("invalid_token");
      const d = i.slice(0, l);
      if (i.slice(l + 1) !== await ht(s, d)) throw c("invalid_signature");
      let u = null;
      try {
        u = JSON.parse(Xr(d));
      } catch {
      }
      if (!U(u) || u.version !== Ka || u.scope !== "d1_schema_repair" || u.phase !== "destructive") throw c("invalid_payload");
      const f = Math.max(0, Math.floor(Number(n.nowMs ?? k()) / 1e3));
      if (Number(u.expiresAt) <= f) throw c("expired", { expiresAt: Number(u.expiresAt) || 0 });
      if (String(u.planHash || "") !== String(a?.planHash || "") || String(u.schemaFingerprint || "") !== String(a?.schemaFingerprint || "") || Number(u.schemaCookie) !== Number(a?.schemaCookie) || String(u.contractHash || "") !== String(a?.contractHash || "") || Number(u.contractVersion) !== Number(a?.contractVersion)) throw c("schema_changed", {
        previewPlanHash: String(u.planHash || ""),
        currentPlanHash: String(a?.planHash || "")
      });
      return u;
    },
    getD1SchemaRepairTokenPlanHash(r) {
      const t = String(r || "").trim().split(".", 1)[0];
      if (!t) return "";
      try {
        const a = JSON.parse(Xr(t));
        return a?.scope === "d1_schema_repair" ? String(a?.planHash || "").trim() : "";
      } catch {
        return "";
      }
    },
    async getD1TimeTravelBookmark(r) {
      if (!r || typeof r.withSession != "function") {
        const t = /* @__PURE__ */ new Error("D1 Time Travel bookmark is unavailable on this binding");
        throw t.code = "D1_SCHEMA_REPAIR_RECOVERY_UNAVAILABLE", t.status = 409, t.details = { reason: "sessions_api_unavailable" }, t;
      }
      try {
        const t = r.withSession("first-primary");
        if (!t || typeof t.prepare != "function" || typeof t.getBookmark != "function") throw new Error("invalid_d1_session");
        await t.prepare("SELECT 1 AS bookmark_probe").run();
        const a = String(t.getBookmark() || "").trim();
        if (!a) throw new Error("empty_bookmark");
        return {
          bookmark: a,
          consistency: "first-primary",
          capturedAt: (/* @__PURE__ */ new Date()).toISOString()
        };
      } catch (t) {
        if (String(t?.code || "") === "D1_SCHEMA_REPAIR_RECOVERY_UNAVAILABLE") throw t;
        const a = /* @__PURE__ */ new Error("Unable to capture a D1 Time Travel bookmark");
        throw a.code = "D1_SCHEMA_REPAIR_RECOVERY_UNAVAILABLE", a.status = 409, a.details = {
          reason: "bookmark_failed",
          cause: ie(t, "bookmark_failed")
        }, a;
      }
    },
    async ensureD1KnownColumns(r, t = {}) {
      const a = await e.getD1TableNameSet(r), n = new Set(Array.isArray(t.skipTables) ? t.skipTables : []), s = [];
      for (const [i, c] of Object.entries(e.getD1RuntimeColumnAdditions())) {
        if (!a.has(i) || n.has(i)) continue;
        const l = await e.getTableColumns(r, i);
        for (const [d, u] of Object.entries(c))
          l.has(d) || (await r.prepare(`ALTER TABLE ${fe(i)} ADD COLUMN ${fe(d)} ${u}`).run(), l.add(d), s.push(`${i}.${d}`));
      }
      return s;
    },
    async repairD1RuntimeIndexes(r, t = {}) {
      const a = await e.getD1TableNameSet(r), n = new Set(Array.isArray(t.skipTables) ? t.skipTables : []), s = [], i = [];
      for (const [c, l] of Object.entries(e.getD1RuntimeIndexContract())) {
        if (!a.has(l.table) || n.has(l.table)) continue;
        const d = await r.prepare("SELECT tbl_name FROM sqlite_master WHERE type = 'index' AND name = ? LIMIT 1").bind(c).first();
        let u = !1;
        if (d) {
          const f = (await e.getTableIndexDefinitions(r, l.table)).find((m) => m.name === c);
          u = String(d?.tbl_name || "") === l.table && f?.unique === !1 && f?.partial === !1 && Q(await e.getIndexKeyColumns(r, c)) === Q(l.columns);
        }
        u || (d ? (await r.prepare(`DROP INDEX IF EXISTS ${fe(c)}`).run(), i.push(c)) : s.push(c), await r.prepare(l.createSql).run());
      }
      return {
        createdIndexes: s,
        repairedIndexes: i
      };
    },
    async ensureD1UniqueIndexes(r) {
      const t = [];
      for (const [a, n] of Object.entries(e.getD1UniqueIndexContract())) {
        if (!(await e.getD1TableNameSet(r)).has(n.table)) continue;
        let s = !1;
        for (const i of (await e.getTableIndexDefinitions(r, n.table)).filter((c) => c.unique && !c.partial)) if (Q(await e.getIndexKeyColumns(r, i.name)) === Q(n.columns)) {
          s = !0;
          break;
        }
        s || (await r.prepare("SELECT tbl_name FROM sqlite_master WHERE type = 'index' AND name = ? LIMIT 1").bind(a).first() && await r.prepare(`DROP INDEX IF EXISTS ${fe(a)}`).run(), await r.prepare(n.createSql).run(), t.push(a));
      }
      return t;
    },
    async rebuildD1TableWithShadow(r, t, a) {
      const n = e.getD1CurrentSchemaContract();
      if (!Object.prototype.hasOwnProperty.call(n.columns, t)) throw new Error(`Unknown D1 rebuild table: ${t}`);
      if (t === e.LOGS_TABLE) throw new Error("proxy_logs must use destructive atomic recreation");
      const s = String(a?.planHash || "repair").replace(/[^a-z0-9]/gi, "").slice(0, 12) || "repair", i = `__d1_repair_${t}_${s}`, c = `__d1_backup_${t}_${s}`, l = await e.getD1TableNameSet(r);
      if (l.has(i) || l.has(c)) {
        const m = /* @__PURE__ */ new Error("D1 schema repair temporary table already exists");
        throw m.code = "D1_SCHEMA_REPAIR_BLOCKED", m.status = 409, m.details = {
          phase: "preflight",
          blockingIssues: [`repair_artifact_present:${t}`]
        }, m;
      }
      const d = n.columns[t].map((m) => fe(m)).join(", "), u = (await r.prepare("SELECT name, sql FROM sqlite_master WHERE type = 'index' AND tbl_name = ? AND sql IS NOT NULL").bind(t).all())?.results || [];
      await r.prepare(e.buildD1CreateTableSql(t, i)).run();
      try {
        await r.batch([
          r.prepare(`INSERT INTO ${fe(i)} (${d}) SELECT ${d} FROM ${fe(t)}`),
          r.prepare(`ALTER TABLE ${fe(t)} RENAME TO ${fe(c)}`),
          r.prepare(`ALTER TABLE ${fe(i)} RENAME TO ${fe(t)}`),
          ...u.map((m) => r.prepare(`DROP INDEX ${fe(m.name)}`)),
          ...u.map((m) => r.prepare(String(m.sql)))
        ]);
      } catch (m) {
        throw await r.prepare(`DROP TABLE IF EXISTS ${fe(i)}`).run().catch(() => {
        }), m;
      }
      const f = await r.prepare(`SELECT COUNT(*) AS total FROM ${fe(t)}`).first();
      return {
        table: t,
        rowCount: Math.max(0, Number(f?.total) || 0),
        allowsDataLoss: !1,
        willDiscardData: !1,
        dataMode: "copy",
        backupTable: c,
        originalIndexes: u
      };
    },
    async recreateD1LogsDestructively(r, t) {
      const a = (t?.steps || []).find((i) => i?.kind === "recreate_log_table" && i?.target === e.LOGS_TABLE);
      if (!a || a.willDiscardData !== !0 || a.dataMode !== "discard") throw new Error("Missing destructive proxy_logs repair step");
      const n = e.getD1LogsFtsContractSql(), s = Object.values(e.getD1RuntimeIndexContract()).filter((i) => i.table === e.LOGS_TABLE);
      return await r.batch([
        r.prepare(`DROP TABLE IF EXISTS ${fe(e.LOGS_FTS_TABLE)}`),
        r.prepare(`DROP TABLE ${fe(e.LOGS_TABLE)}`),
        r.prepare(e.buildD1CreateTableSql(e.LOGS_TABLE)),
        ...s.map((i) => r.prepare(i.createSql)),
        r.prepare(n.createTable),
        r.prepare(n.createTrigger)
      ]), {
        table: e.LOGS_TABLE,
        rowCount: 0,
        rowCountMeasured: !1,
        discardedRows: null,
        discardedRowsIsLowerBound: !1,
        allowsDataLoss: !0,
        willDiscardData: !0,
        dataMode: "discard"
      };
    },
    async rollbackD1RebuiltTables(r, t = []) {
      for (const a of [...t].reverse()) {
        const n = String(a?.table || ""), s = String(a?.backupTable || "");
        if (!(!n || !s || !(await e.getD1TableNameSet(r)).has(s))) {
          n === e.LOGS_TABLE && (await e.dropLogsFtsSyncTriggers(r).catch(() => 0), await r.prepare(`DROP TABLE IF EXISTS ${fe(e.LOGS_FTS_TABLE)}`).run().catch(() => {
          }));
          for (const i of (await r.prepare("SELECT name FROM sqlite_master WHERE type = 'index' AND tbl_name = ? AND sql IS NOT NULL").bind(n).all())?.results || []) await r.prepare(`DROP INDEX IF EXISTS ${fe(i.name)}`).run().catch(() => {
          });
          await r.batch([r.prepare(`DROP TABLE IF EXISTS ${fe(n)}`), r.prepare(`ALTER TABLE ${fe(s)} RENAME TO ${fe(n)}`)]);
          for (const i of a.originalIndexes || []) {
            const c = String(i?.sql || "").replace(/^CREATE\s+(UNIQUE\s+)?INDEX\s+/i, (l, d) => `CREATE ${d || ""}INDEX IF NOT EXISTS `);
            c && await r.prepare(c).run().catch(() => {
            });
          }
          n === e.LOGS_TABLE && await e.ensureLogsFtsSchema(r, { forceRecreate: !0 }).catch(() => {
          });
        }
      }
    },
    async assertD1CurrentSchema(r) {
      const t = await e.buildD1SchemaRepairPlan(r);
      if (t.blockingIssues.length) {
        const a = /* @__PURE__ */ new Error("D1 schema repair is blocked by incompatible data or table shape");
        throw a.code = "D1_SCHEMA_REPAIR_BLOCKED", a.status = 409, a.details = {
          phase: "preflight",
          blockingIssues: t.blockingIssues,
          repairPlan: t
        }, a;
      }
      return t;
    },
    async initializeD1Database(r, t = {}) {
      if (!r) {
        const c = /* @__PURE__ */ new Error("D1 not configured");
        throw c.code = "D1_NOT_CONFIGURED", c.status = 503, c;
      }
      const a = t.includeFts === !1 ? "logs-core" : "logs-fts";
      let n = Z.D1DatabaseInitReady.get(r);
      (!n || !(n.inFlight instanceof Map)) && (n = {
        tail: Promise.resolve(),
        inFlight: /* @__PURE__ */ new Map()
      }, Z.D1DatabaseInitReady.set(r, n));
      const s = `${a}:${e.getD1SchemaRepairTokenPlanHash(t.repairToken) || "automatic"}`;
      let i = n.inFlight.get(s);
      i || (i = Promise.resolve(n.tail).catch(() => {
      }).then(() => e.runD1DatabaseInitialization(r, {
        ...t,
        profile: a
      })), n.tail = i.catch(() => {
      }), n.inFlight.set(s, i));
      try {
        return await i;
      } finally {
        n.inFlight.get(s) === i && n.inFlight.delete(s);
      }
    },
    async runD1DatabaseInitialization(r, t = {}) {
      const a = t.profile || (t.includeFts === !1 ? "logs-core" : "logs-fts"), n = String(t.repairMode || (String(t.repairToken || "").trim() ? "confirmed-destructive" : "safe"));
      e.invalidateD1SchemaReadiness(r, "all");
      const s = await e.getD1TableNameSet(r), i = await e.buildD1SchemaRepairPlan(r);
      if (i.blockingIssues.length) {
        const f = /* @__PURE__ */ new Error("D1 schema repair is blocked by incompatible data or table shape");
        throw f.code = "D1_SCHEMA_REPAIR_BLOCKED", f.status = 409, f.details = {
          phase: "preflight",
          blockingIssues: i.blockingIssues,
          repairPlan: i
        }, f;
      }
      let c = null;
      if (i.phase === "safe" && n === "confirmed-destructive") {
        const f = /* @__PURE__ */ new Error("D1 schema repair must complete safe preparation before destructive repair");
        throw f.code = "D1_SCHEMA_REPAIR_PREPARATION_REQUIRED", f.status = 409, f.details = { repairPlan: i }, f;
      }
      if (i.phase === "destructive") {
        if (t.confirmHighRisk !== !0 || !String(t.repairToken || "").trim()) {
          const f = t.env ? await e.createD1SchemaRepairToken(t.env, i) : {
            token: "",
            expiresAt: 0
          }, m = /* @__PURE__ */ new Error("D1 schema repair requires explicit confirmation");
          throw m.code = "D1_SCHEMA_REPAIR_CONFIRMATION_REQUIRED", m.status = 428, m.details = { repairPlan: {
            ...i,
            repairToken: f.token,
            expiresAt: f.expiresAt ? (/* @__PURE__ */ new Date(f.expiresAt * 1e3)).toISOString() : ""
          } }, m;
        }
        await e.verifyD1SchemaRepairToken(t.env, t.repairToken, i), c = await e.getD1TimeTravelBookmark(r);
      }
      const l = [], d = [];
      let u = "";
      try {
        if (i.steps.find((C) => C.kind === "create_table" && C.target === e.D1_SCHEMA_META_TABLE && C.risk !== "high") && (await r.prepare(e.buildD1CreateTableSql(e.D1_SCHEMA_META_TABLE, e.D1_SCHEMA_META_TABLE, { ifNotExists: !0 })).run(), d.push({
          kind: "create_table",
          target: e.D1_SCHEMA_META_TABLE
        })), (i.phase === "safe" || i.phase === "destructive") && (u = String(globalThis.crypto?.randomUUID?.() || `${k()}-${Math.random()}`), await e.acquireD1SchemaRepairLease(r, u)), i.phase === "destructive") {
          const C = await e.buildD1SchemaRepairPlan(r);
          await e.verifyD1SchemaRepairToken(t.env, t.repairToken, C);
        }
        const f = i.phase === "safe" ? i.steps.filter((C) => C.risk !== "high") : i.phase === "destructive" ? i.steps.filter((C) => C.risk === "high") : [], m = f.filter((C) => C.kind === "create_table" && C.target !== e.LOGS_FTS_TABLE && C.target !== e.D1_SCHEMA_META_TABLE).map((C) => C.target);
        for (const C of m)
          await r.prepare(e.buildD1CreateTableSql(C, C, { ifNotExists: !0 })).run(), d.push({
            kind: "create_table",
            target: C
          });
        const p = f.filter((C) => C.kind === "rebuild_table").map((C) => C.target), g = f.find((C) => C.kind === "recreate_log_table" && C.target === e.LOGS_TABLE), h = i.steps.filter((C) => C.risk === "high" && (C.kind === "rebuild_table" || C.kind === "recreate_log_table")).map((C) => C.target), y = [.../* @__PURE__ */ new Set([...p, ...h])], S = i.phase === "safe" ? await e.ensureD1KnownColumns(r, { skipTables: y }) : [];
        for (const C of S) d.push({
          kind: "add_column",
          target: C
        });
        for (const C of p)
          l.push(await e.rebuildD1TableWithShadow(r, C, i)), d.push({
            kind: "rebuild_table",
            target: C
          });
        g && (l.push(await e.recreateD1LogsDestructively(r, i)), d.push({
          kind: "recreate_log_table",
          target: e.LOGS_TABLE
        }));
        const _ = g ? Object.entries(e.getD1RuntimeIndexContract()).filter(([, C]) => C.table === e.LOGS_TABLE).map(([C]) => C) : [], A = i.phase === "safe" ? await e.repairD1RuntimeIndexes(r, { skipTables: y }) : {
          createdIndexes: [],
          repairedIndexes: []
        };
        for (const C of A.createdIndexes) d.push({
          kind: "create_index",
          target: C
        });
        for (const C of A.repairedIndexes) d.push({
          kind: "repair_index",
          target: C
        });
        const b = i.phase === "safe" ? await e.ensureD1UniqueIndexes(r) : [];
        for (const C of b) d.push({
          kind: "create_unique_index",
          target: C
        });
        let E = {
          rebuilt: !1,
          recreated: !1
        };
        const R = f.find((C) => C.target === e.LOGS_FTS_TABLE);
        R && t.includeFts !== !1 && !await e.isLogsFtsReady(r) && (E = await e.ensureLogsFtsSchema(r, { forceRecreate: !0 })), E?.rebuilt === !0 && d.push({
          kind: String(R?.kind || "create_fts"),
          target: e.LOGS_FTS_TABLE
        }), e.invalidateD1SchemaReadiness(r, "all");
        const L = await e.getD1SchemaStatus(r), T = (L.schemaReady ? null : await e.buildD1SchemaRepairPlan(r))?.phase === "destructive";
        if (!L.schemaReady && !T) {
          const C = /* @__PURE__ */ new Error("D1 schema repair did not produce the current contract");
          throw C.code = "D1_SCHEMA_REPAIR_FAILED", C.status = 503, C.details = {
            phase: "final_status",
            issues: L.issues
          }, C;
        }
        const D = l.filter((C) => C?.backupTable);
        D.length && await r.batch(D.map((C) => r.prepare(`DROP TABLE IF EXISTS ${fe(C.backupTable)}`)));
        let w = {
          written: !1,
          reason: "pending_high_risk"
        };
        L.schemaReady && (w = (await e.verifyD1SchemaAttestation(r, t.env)).valid ? {
          written: !1,
          reused: !0,
          contractVersion: rt,
          contractHash: i.contractHash
        } : await e.writeVerifiedD1SchemaMeta(r, t.env, i));
        const M = /* @__PURE__ */ new Set([...Object.keys(e.getD1CurrentSchemaContract().columns), e.LOGS_FTS_TABLE]), x = [...await e.getD1TableNameSet(r)].filter((C) => M.has(C) && !s.has(C));
        return {
          profile: a,
          phase: i.phase,
          completed: L.schemaReady,
          pendingHighRisk: T,
          schemaReady: L.schemaReady,
          contractVersion: rt,
          contractHash: i.contractHash,
          planHash: i.planHash,
          risk: i.risk,
          createdTables: x,
          addedColumns: S,
          createdIndexes: [...A.createdIndexes, ..._],
          repairedIndexes: A.repairedIndexes,
          uniqueIndexesCreated: b,
          rebuiltTables: l.map(({ table: C, rowCount: F, rowCountMeasured: W, discardedRows: O, discardedRowsIsLowerBound: N, willDiscardData: I, dataMode: P }) => I ? {
            table: C,
            rowCount: F,
            rowCountMeasured: W,
            discardedRows: O,
            discardedRowsIsLowerBound: N,
            allowsDataLoss: !0,
            willDiscardData: !0,
            dataMode: P
          } : {
            table: C,
            rowCount: F
          }),
          ftsRebuilt: E?.rebuilt === !0,
          ftsRecreated: g ? !0 : E?.recreated === !0 && i.status?.fts?.tableReady === !0,
          recoveryBookmark: String(c?.bookmark || ""),
          bookmarkCapturedAt: String(c?.capturedAt || ""),
          schemaMeta: w,
          steps: i.steps.map((C) => ({
            ...C,
            ready: d.some((F) => F.kind === C.kind && F.target === C.target) || L.schemaReady
          })),
          status: L
        };
      } catch (f) {
        l.length && await e.rollbackD1RebuiltTables(r, l).catch(() => {
        }), e.invalidateD1SchemaReadiness(r, "all");
        let m = [];
        try {
          m = (await e.getD1SchemaStatus(r))?.issues || [];
        } catch {
        }
        if (f && typeof f == "object" && (f.details = {
          ...U(f.details) ? f.details : {},
          executedSteps: d,
          remainingIssues: m,
          recoveryBookmark: String(c?.bookmark || ""),
          bookmarkCapturedAt: String(c?.capturedAt || "")
        }), String(f?.code || "").startsWith("D1_SCHEMA_REPAIR_")) throw f;
        const p = new Error(ie(f, "D1 schema repair failed"));
        throw p.code = "D1_SCHEMA_REPAIR_FAILED", p.status = 503, p.details = {
          ...U(f?.details) ? f.details : {},
          phase: "execution"
        }, p;
      } finally {
        u && await e.releaseD1SchemaRepairLease(r, u).catch(() => {
        });
      }
    },
    async probeLogsReadiness(r, t = {}) {
      if (!r) return {
        schemaReady: !1,
        ftsReady: !1,
        statsReady: !1,
        probedAt: (/* @__PURE__ */ new Date()).toISOString()
      };
      const a = oe.LogsReadinessProbeCache.get(r), n = Math.max(1e3, Number(t.maxAgeMs) || 15e3);
      if (t.force !== !0 && a && k() - a.ts < n) return a.data;
      const [s, i, c] = await Promise.all([
        e.hasLogsBaseTable(r),
        e.isLogsFtsReady(r),
        e.hasStatsHourlyTable(r)
      ]), l = {
        schemaReady: s,
        ftsReady: i,
        statsReady: c,
        probedAt: (/* @__PURE__ */ new Date()).toISOString()
      };
      return oe.LogsReadinessProbeCache.set(r, {
        ts: k(),
        data: l
      }), l;
    },
    async resolveLogsReadiness(r, t = {}) {
      const a = e.resolveOpsStatusStores(r), n = await e.getOpsStatusSection(a, "log"), s = n?.schemaReady === !0, i = n?.ftsReady === !0, c = n?.statsReady === !0;
      return s && c && (i || t.requireFts !== !0) || !a.db ? {
        schemaReady: s,
        ftsReady: i,
        statsReady: c,
        revision: e.getLogsRevisionFromStatus(n),
        source: "status",
        logStatus: n
      } : {
        ...await e.probeLogsReadiness(a.db, t),
        revision: e.getLogsRevisionFromStatus(n),
        source: "probe",
        logStatus: n
      };
    }
  };
}
function Dg(o = {}, e = {}) {
  return {
    async ensureLogsBaseSchema(r) {
      if (!r) return !1;
      if (e.isD1SchemaReadyCached(r, "logsBaseSchema")) return !0;
      let t = Z.LogsBaseDbReady.get(r);
      t || (t = (async () => (await r.prepare(`CREATE TABLE IF NOT EXISTS ${e.LOGS_TABLE} (id INTEGER PRIMARY KEY AUTOINCREMENT, timestamp INTEGER NOT NULL, node_name TEXT NOT NULL, request_path TEXT NOT NULL, request_method TEXT NOT NULL, status_code INTEGER NOT NULL, response_time INTEGER NOT NULL, client_ip TEXT NOT NULL, inbound_colo TEXT, outbound_colo TEXT, user_agent TEXT, referer TEXT, category TEXT DEFAULT 'api', error_detail TEXT, detail_json TEXT, created_at TEXT NOT NULL, inbound_ip TEXT, outbound_ip TEXT)`).run(), await r.prepare(`CREATE INDEX IF NOT EXISTS idx_proxy_logs_timestamp ON ${e.LOGS_TABLE} (timestamp)`).run(), await r.prepare(`CREATE INDEX IF NOT EXISTS idx_proxy_logs_client_time ON ${e.LOGS_TABLE} (client_ip, timestamp DESC)`).run(), await r.prepare(`CREATE INDEX IF NOT EXISTS idx_proxy_logs_status_time ON ${e.LOGS_TABLE} (status_code, timestamp)`).run(), await r.prepare(`CREATE INDEX IF NOT EXISTS idx_proxy_logs_category_time ON ${e.LOGS_TABLE} (category, timestamp)`).run(), e.markD1SchemaReady(r, "logsBaseSchema"), e.markD1SchemaReady(r, "logsTableExists"), oe.LogsReadinessProbeCache.delete(r), !0))().catch((a) => {
        throw Z.LogsBaseDbReady.delete(r), a;
      }), Z.LogsBaseDbReady.set(r, t));
      try {
        return await t;
      } finally {
        Z.LogsBaseDbReady.get(r) === t && Z.LogsBaseDbReady.delete(r);
      }
    },
    async ensureStatsHourlySchema(r) {
      if (!r) return !1;
      if (e.isD1SchemaReadyCached(r, "statsHourlySchema")) return !0;
      let t = Z.StatsHourlyDbReady.get(r);
      t || (t = r.prepare(`CREATE TABLE IF NOT EXISTS ${e.STATS_HOURLY_TABLE} (
              bucket_date TEXT NOT NULL,
              bucket_hour INTEGER NOT NULL,
              request_count INTEGER NOT NULL DEFAULT 0,
              play_count INTEGER NOT NULL DEFAULT 0,
              playback_info_count INTEGER NOT NULL DEFAULT 0,
              updated_at TEXT NOT NULL,
              PRIMARY KEY (bucket_date, bucket_hour)
            )`).run().then(() => (e.markD1SchemaReady(r, "statsHourlySchema"), e.markD1SchemaReady(r, "statsTableExists"), oe.LogsReadinessProbeCache.delete(r), !0)).catch((a) => {
        throw Z.StatsHourlyDbReady.delete(r), a;
      }), Z.StatsHourlyDbReady.set(r, t));
      try {
        return await t;
      } finally {
        Z.StatsHourlyDbReady.get(r) === t && Z.StatsHourlyDbReady.delete(r);
      }
    }
  };
}
function Ng(o = {}, e = {}) {
  return {
    normalizeD1SchemaProfile(r = "") {
      const t = String(r || "").trim().toLowerCase();
      return t === "runtime-core" || t === "logs-core" || t === "logs-fts" ? t : "logs-core";
    },
    invalidateD1SchemaReadiness(r, t = "all") {
      if (!r) return;
      const a = String(t || "all").trim().toLowerCase();
      if ((a === "all" || a === "logs") && (e.clearD1SchemaReady(r, [
        "logsBaseSchema",
        "logsTableExists",
        "statsHourlySchema",
        "statsTableExists"
      ]), Z.LogsBaseDbReady.delete(r), Z.StatsHourlyDbReady.delete(r), oe.LogsReadinessProbeCache.delete(r)), a === "all") {
        e.clearD1SchemaReady(r);
        const n = Z.OpsStatusShadowCache.get(r);
        n?.payloadCache instanceof Map && n.payloadCache.clear(), Z.AdminShellStatusWriteState.delete(r), Z.DnsIpWorkspaceDbReady.delete(r), Z.OpsStatusDbReady.delete(r), Z.ScheduledLeaseDbReady.delete(r), Z.AuthFailuresDbReady.delete(r), Z.CfDashboardCacheDbReady.delete(r), Z.CfRuntimeCacheDbReady.delete(r);
      }
    },
    async bootstrapD1Schema(r, t = "logs-core") {
      const a = e.normalizeD1SchemaProfile(t);
      if (!r) return {
        profile: a,
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
      const n = [
        {
          name: "ensureSysStatusTable",
          run: () => e.ensureSysStatusTable(r)
        },
        {
          name: "ensureScheduledLeaseTable",
          run: () => e.ensureScheduledLeaseTable(r)
        },
        {
          name: "ensureDnsIpWorkspaceSchema",
          run: () => e.ensureDnsIpWorkspaceSchema(r)
        },
        {
          name: "ensureAuthFailuresTable",
          run: () => e.ensureAuthFailuresTable(r)
        },
        {
          name: "ensureCfDashboardCacheTable",
          run: () => e.ensureCfDashboardCacheTable(r)
        },
        {
          name: "ensureCfRuntimeCacheTable",
          run: () => e.ensureCfRuntimeCacheTable(r)
        }
      ], s = [{
        name: "ensureLogsBaseSchema",
        run: () => e.ensureLogsBaseSchema(r)
      }, {
        name: "ensureStatsHourlySchema",
        run: () => e.ensureStatsHourlySchema(r)
      }], i = a === "runtime-core" ? n : a === "logs-fts" ? [
        ...n,
        ...s,
        {
          name: "ensureLogsFtsSchema",
          run: () => e.ensureLogsFtsSchema(r)
        }
      ] : [...n, ...s], c = [];
      let l = {
        migratedRows: 0,
        droppedTriggers: 0,
        rebuilt: !1,
        recreated: !1
      };
      for (const d of i) {
        const u = await d.run();
        d.name === "ensureLogsFtsSchema" && U(u) && (l = {
          migratedRows: Math.max(0, Number(u.migratedRows) || 0),
          droppedTriggers: Math.max(0, Number(u.droppedTriggers) || 0),
          rebuilt: u.rebuilt === !0,
          recreated: u.recreated === !0
        }), c.push({
          name: d.name,
          ready: d.name === "ensureLogsFtsSchema" ? await e.isLogsFtsReady(r) : u === !0
        });
      }
      return oe.LogsReadinessProbeCache.delete(r), {
        profile: a,
        runtimeTablesReady: n.every((d) => c.some((u) => u.name === d.name && u.ready === !0)),
        schemaReady: await e.hasLogsBaseTable(r),
        statsReady: await e.hasStatsHourlyTable(r),
        ftsReady: await e.isLogsFtsReady(r),
        ftsResult: l,
        steps: c
      };
    }
  };
}
function Ig(o = {}, e = {}) {
  return {
    ...wg(o, e),
    ...Lg(o, e),
    ...Dg(o, e),
    ...Ng(o, e)
  };
}
function Mg() {
  const o = {
    createSummary(e = {}, r = "manual", t = {}) {
      return {
        ...e.summary || {},
        mode: r,
        deletedExpiredLogCount: 0,
        deletedExpiredLockCount: 0,
        deletedExpiredFetchCacheCount: 0,
        deletedExpiredProbeCacheCount: 0,
        deletedExpiredAuthFailureCount: 0,
        deletedExpiredDashboardCacheCount: 0,
        deletedExpiredRuntimeCacheCount: 0,
        deletedExpiredStatsHourlyCount: 0,
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
        status: r === "scheduled" ? "skipped" : "success",
        reason: ""
      };
    },
    buildDeleteScopes(e, r = {}, t = {}, a) {
      return [
        [
          t.deleteExpiredLogs,
          "proxy_logs",
          "deletedExpiredLogCount",
          "deleteExpiredLogs",
          e.LOGS_TABLE,
          "timestamp < ?",
          [r.retentionCutoffMs]
        ],
        [
          t.deleteExpiredLocks,
          "sys_locks",
          "deletedExpiredLockCount",
          "deleteExpiredLocks",
          e.SCHEDULED_LOCKS_TABLE,
          "expires_at <= ?",
          [r.nowMs]
        ],
        [
          t.deleteExpiredFetchCache,
          "dns_ip_pool_fetch_cache",
          "deletedExpiredFetchCacheCount",
          "deleteExpiredFetchCache",
          e.DNS_IP_POOL_FETCH_CACHE_TABLE,
          "expires_at <= ?",
          [r.nowMs]
        ],
        [
          t.deleteExpiredProbeCache,
          "dns_ip_probe_cache",
          "deletedExpiredProbeCacheCount",
          "deleteExpiredProbeCache",
          e.DNS_IP_PROBE_CACHE_TABLE,
          "expires_at <= ?",
          [r.nowMs]
        ],
        [
          t.deleteExpiredAuthFailures,
          "auth_failures",
          "deletedExpiredAuthFailureCount",
          "deleteExpiredAuthFailures",
          e.AUTH_FAILURES_TABLE,
          "expires_at <= ?",
          [r.nowMs]
        ],
        [
          t.deleteExpiredDashboardCache,
          "cf_dashboard_cache",
          "deletedExpiredDashboardCacheCount",
          "deleteExpiredDashboardCache",
          e.CF_DASH_CACHE_TABLE,
          "expires_at <= ?",
          [r.nowMs]
        ],
        [
          t.deleteExpiredRuntimeCache,
          "cf_runtime_cache",
          "deletedExpiredRuntimeCacheCount",
          "deleteExpiredRuntimeCache",
          e.CF_RUNTIME_CACHE_TABLE,
          "expires_at <= ?",
          [r.nowMs]
        ],
        [
          t.deleteExpiredStatsHourly,
          "proxy_stats_hourly",
          "deletedExpiredStatsHourlyCount",
          "deleteExpiredStatsHourly",
          e.STATS_HOURLY_TABLE,
          "bucket_date < ?",
          [r.statsRetentionBoundaryDate]
        ]
      ].filter(([n]) => n === !0).map(([, n, s, i, c, l, d]) => ({
        key: n,
        summaryKey: s,
        stepName: i,
        tableName: c,
        whereClause: l,
        bindParams: d,
        db: a
      }));
    },
    readChanges(e) {
      const r = Number(e?.meta?.changes ?? e?.changes ?? 0);
      return Number.isFinite(r) ? Math.max(0, Math.floor(r)) : 0;
    },
    async hasScopeRows(e) {
      return !!await e.db.prepare(`SELECT 1 AS present FROM ${e.tableName} WHERE ${e.whereClause} LIMIT 1`).bind(...e.bindParams).first();
    },
    async runBudgetedDeleteScopes(e = [], r = {}, t = async (n) => {
    }, a = {}) {
      const n = Number(a.startedAt) || k();
      let s = 0, i = "", c = [...e];
      for (; c.length > 0 && !i; ) {
        const u = [];
        for (const f of c) {
          if (s >= Ha) {
            i = "row_limit";
            break;
          }
          if (k() - n >= Or) {
            i = "time_limit";
            break;
          }
          await t(f.stepName);
          const m = Math.min(cs, Ha - s), p = await f.db.prepare(`DELETE FROM ${f.tableName} WHERE rowid IN (SELECT rowid FROM ${f.tableName} WHERE ${f.whereClause} ORDER BY rowid LIMIT ?)`).bind(...f.bindParams, m).run(), g = o.readChanges(p);
          s += g, r[f.summaryKey] = Math.max(0, Number(r[f.summaryKey]) || 0) + g, g >= m && u.push(f);
        }
        c = u;
      }
      const l = [];
      for (const u of e) await o.hasScopeRows(u) && l.push(u.key);
      const d = Math.max(0, k() - n);
      return !i && l.length > 0 && (i = d >= Or ? "time_limit" : s >= Ha ? "row_limit" : ""), {
        hasMore: l.length > 0,
        remainingScopes: l,
        budget: {
          batchSize: cs,
          rowLimit: Ha,
          timeLimitMs: Or,
          processedRows: s,
          durationMs: d,
          exhaustedBy: i || null
        }
      };
    },
    async patchLogStatus(e, r, t, a, n, s, i = {}) {
      const c = (/* @__PURE__ */ new Date()).toISOString(), l = String(a?.mode || i.mode || "manual").trim().toLowerCase() === "scheduled" ? "scheduled" : "manual", d = await e.isLogsFtsReady(r), u = await e.hasStatsHourlyTable(r);
      await e.getD1SchemaStatus(r);
      const f = {
        schemaReady: !0,
        ftsReady: d,
        statsReady: u,
        categoryEnabled: !0
      };
      return (s.rebuildStatsHourly !== !0 || n.alignedStatsWindow === !0) && (f.statsUtcOffsetMinutes = a.statsUtcOffsetMinutes ?? a.utcOffsetMinutes), (n.rebuiltStatsHourly === !0 || n.alignedStatsWindow === !0) && (f.statsAlignedAt = c, f.statsAlignedWindowStartAt = new Date((l === "scheduled" ? a.statsStartTs : a.retentionCutoffMs) || a.retentionCutoffMs).toISOString(), f.statsAlignedWindowEndAt = new Date((l === "scheduled" ? a.statsEndTs : a.nowMs) || a.nowMs).toISOString()), l === "scheduled" && s.deleteExpiredLogs === !0 && Number(n.deletedExpiredLogCount) > 0 ? await e.bumpLogsRevision(t, f, i.ctx).catch(() => {
      }) : await ye(e.patchOpsStatus(t, { log: f }, i.ctx), "d1_tidy.patch_log_status", { mode: l }, null), c;
    }
  };
  return o;
}
function Pg() {
  return {
    async readBoundedCount(o, e, r = "", t = []) {
      const a = String(r || "").trim(), n = `SELECT COUNT(*) AS total FROM (SELECT 1 FROM ${e}${a ? ` WHERE ${a}` : ""} LIMIT ${ka + 1})`, s = await o.prepare(n).bind(...t).first(), i = Math.max(0, Number(s?.total ?? s?.count) || 0);
      return {
        count: Math.min(ka, i),
        countIsLowerBound: i >= ka,
        exceedsLimit: i > ka
      };
    },
    buildContext(o = {}, e = {}) {
      const r = String(e.mode || "manual").trim().toLowerCase() === "scheduled" ? "scheduled" : "manual", t = at(e.maintenanceMode, r), a = e.scheduledNow instanceof Date ? new Date(e.scheduledNow.getTime()) : new Date(e.scheduledNow || k()), n = Number(e.nowMs) || (r === "scheduled" ? a.getTime() : k()), s = de(o.logRetentionDays, v.Defaults.LogRetentionDays, 1, v.Defaults.LogRetentionDaysMax), i = Math.max(0, n - s * 24 * 60 * 60 * 1e3), c = Ke(o.scheduleUtcOffsetMinutes), l = U(e.dayWindow) ? e.dayWindow : St(a, o.scheduleUtcOffsetMinutes);
      return {
        mode: r,
        maintenanceMode: t,
        runtimeConfig: o,
        scheduledNow: a,
        nowTimestamp: n,
        retentionDays: s,
        retentionCutoffMs: i,
        utcOffsetMinutes: c,
        dayWindow: l,
        statsBucketDate: String(e.statsBucketDate || l?.dateKey || "").trim(),
        statsStartTs: Number(e.statsStartTs ?? l?.startTs) || 0,
        statsEndTs: Number(e.statsEndTs ?? l?.endTs) || 0,
        statsUtcOffsetMinutes: Ke(e.statsUtcOffsetMinutes ?? l?.utcOffsetMinutes ?? o.scheduleUtcOffsetMinutes),
        previousScheduledState: U(e.previousScheduledState) ? e.previousScheduledState : {},
        previousD1State: null,
        lastFtsRebuildAt: "",
        lastOptimizeAt: ""
      };
    },
    attachPreviousState(o, e, r = null) {
      const t = o.getPreviousD1TidyState(e.previousScheduledState, r), a = typeof t.lastFtsRebuildAt == "string" ? t.lastFtsRebuildAt : "", n = typeof t.lastOptimizeAt == "string" ? t.lastOptimizeAt : "";
      return {
        ...e,
        previousD1State: t,
        lastFtsRebuildAt: a,
        lastOptimizeAt: n || (typeof t.lastVacuumAt == "string" ? t.lastVacuumAt : "")
      };
    },
    async readFacts(o, e, r, t) {
      const a = await this.readBoundedCount(e, o.LOGS_TABLE, "timestamp < ?", [t.retentionCutoffMs]), n = await this.readBoundedCount(e, o.LOGS_TABLE, "timestamp >= ?", [t.retentionCutoffMs]), s = await this.readBoundedCount(e, o.SCHEDULED_LOCKS_TABLE, "expires_at <= ?", [t.nowTimestamp]), i = await this.readBoundedCount(e, o.DNS_IP_POOL_FETCH_CACHE_TABLE, "expires_at <= ?", [t.nowTimestamp]), c = await this.readBoundedCount(e, o.DNS_IP_PROBE_CACHE_TABLE, "expires_at <= ?", [t.nowTimestamp]), l = await this.readBoundedCount(e, o.AUTH_FAILURES_TABLE, "expires_at <= ?", [t.nowTimestamp]), d = await this.readBoundedCount(e, o.CF_DASH_CACHE_TABLE, "expires_at <= ?", [t.nowTimestamp]), u = await this.readBoundedCount(e, o.CF_RUNTIME_CACHE_TABLE, "expires_at <= ?", [t.nowTimestamp]), f = await this.readBoundedCount(e, o.STATS_HOURLY_TABLE), m = xt(t.retentionCutoffMs, t.utcOffsetMinutes).dateKey, p = await this.readBoundedCount(e, o.STATS_HOURLY_TABLE, "bucket_date < ?", [m]), g = await this.readBoundedCount(e, o.DNS_IP_POOL_ITEMS_TABLE), h = await this.readBoundedCount(e, o.DNS_IP_POOL_SOURCES_TABLE), y = await this.readBoundedCount(e, o.SYS_STATUS_TABLE), S = await o.getOpsStatusSection({
        db: e,
        kv: r
      }, "log");
      return {
        deletedExpiredLogCount: a.count,
        preservedLogCount: n.count,
        preservedLogCountExceedsLimit: n.exceedsLimit,
        deletedExpiredLockCount: s.count,
        deletedExpiredFetchCacheCount: i.count,
        deletedExpiredProbeCacheCount: c.count,
        deletedExpiredAuthFailureCount: l.count,
        deletedExpiredDashboardCacheCount: d.count,
        deletedExpiredRuntimeCacheCount: u.count,
        deletedExpiredStatsHourlyCount: p.count,
        statsRetentionBoundaryDate: m,
        statsHourlyRowCount: f.count,
        dnsIpPoolItemCount: g.count,
        dnsIpPoolSourceCount: h.count,
        sysStatusCount: y.count,
        statsUtcOffsetMinutes: o.getStatsUtcOffsetMinutesFromStatus(S),
        countLowerBounds: {
          proxy_logs: a.countIsLowerBound,
          proxy_logs_retained: n.countIsLowerBound,
          proxy_logs_fts: n.countIsLowerBound,
          sys_locks: s.countIsLowerBound,
          dns_ip_pool_fetch_cache: i.countIsLowerBound,
          dns_ip_probe_cache: c.countIsLowerBound,
          auth_failures: l.countIsLowerBound,
          cf_dashboard_cache: d.countIsLowerBound,
          cf_runtime_cache: u.countIsLowerBound,
          proxy_stats_hourly: f.countIsLowerBound || p.countIsLowerBound,
          dns_ip_pool_items: g.countIsLowerBound,
          sys_status: y.countIsLowerBound
        },
        ftsReady: await o.isLogsFtsReady(e),
        d1DnsIpPoolSources: await o.getDnsIpPoolSourcesFromDb(e),
        kvDnsIpPoolSources: []
      };
    },
    buildSourcePolicy(o = []) {
      return {
        dnsIpPoolSourceAction: Array.isArray(o) && o.length > 0 ? "preserve_d1_primary" : "noop",
        skipDnsIpPoolSourceCleanup: !0
      };
    },
    buildFlags(o, e, r, t) {
      const a = r.deletedExpiredLogCount > 0, n = Hf(e.maintenanceMode, e.mode), s = o.shouldRunLogsFtsRebuild(e.lastFtsRebuildAt, { nowMs: e.nowTimestamp }), i = (!r.ftsReady || n || a) && s, c = r.preservedLogCount > Md || r.preservedLogCountExceedsLimit === !0, l = i && !c, d = n ? !0 : a && o.shouldRunLogsOptimize(e.lastOptimizeAt, { nowMs: e.nowTimestamp }), u = n || r.statsUtcOffsetMinutes !== e.utcOffsetMinutes;
      return {
        deleteExpiredLogs: a,
        deleteExpiredLocks: r.deletedExpiredLockCount > 0,
        deleteExpiredFetchCache: r.deletedExpiredFetchCacheCount > 0,
        deleteExpiredProbeCache: r.deletedExpiredProbeCacheCount > 0,
        deleteExpiredAuthFailures: r.deletedExpiredAuthFailureCount > 0,
        deleteExpiredDashboardCache: r.deletedExpiredDashboardCacheCount > 0,
        deleteExpiredRuntimeCache: r.deletedExpiredRuntimeCacheCount > 0,
        deleteExpiredStatsHourly: r.deletedExpiredStatsHourlyCount > 0,
        rebuildStatsHourly: u,
        rebuildLogsFts: l,
        rebuildLogsFtsDeferred: i && !l,
        ftsRebuildDeferredReason: c ? "deferred_size_guard" : "",
        rebuildLogsFtsForceRecreate: !1,
        optimizeDb: d,
        optimizeDbDeferred: e.mode === "scheduled" && a && d !== !0,
        alignStatsWindow: u,
        rebuildDailyStats: !1,
        processDnsIpPoolSources: !1
      };
    },
    buildPreview(o, e, r, t) {
      const a = [], n = Yu(e.d1DnsIpPoolSources);
      Ee(a, e.deletedExpiredLogCount > 0, "proxy_logs", "超保留期 proxy_logs 日志", [], e.deletedExpiredLogCount, `只会删除早于 ${new Date(o.retentionCutoffMs).toISOString()} 的日志。`), Ee(a, e.deletedExpiredLockCount > 0, "sys_locks", "过期 sys_locks 定时租约", [], e.deletedExpiredLockCount, "只会删除 expires_at 已过期的租约记录。"), Ee(a, e.deletedExpiredFetchCacheCount > 0, "dns_ip_pool_fetch_cache", "过期 dns_ip_pool_fetch_cache 聚合缓存", [], e.deletedExpiredFetchCacheCount, "只会删除 expires_at 已过期的 API 抓取聚合缓存。"), Ee(a, e.deletedExpiredProbeCacheCount > 0, "dns_ip_probe_cache", "过期 dns_ip_probe_cache 探测缓存", [], e.deletedExpiredProbeCacheCount, "只会删除 expires_at 已过期的探测缓存。"), Ee(a, e.deletedExpiredAuthFailureCount > 0, "auth_failures", "过期 auth_failures 登录失败计数", [], e.deletedExpiredAuthFailureCount, "只会删除 expires_at 已过期的登录失败计数。"), Ee(a, e.deletedExpiredDashboardCacheCount > 0, "cf_dashboard_cache", "过期 cf_dashboard_cache 仪表盘缓存", [], e.deletedExpiredDashboardCacheCount, "只会删除 expires_at 已过期的仪表盘缓存。"), Ee(a, e.deletedExpiredRuntimeCacheCount > 0, "cf_runtime_cache", "过期 cf_runtime_cache 运行缓存", [], e.deletedExpiredRuntimeCacheCount, "只会删除 expires_at 已过期的运行缓存。"), Ee(a, e.deletedExpiredStatsHourlyCount > 0, "proxy_stats_hourly_expired", "过期 proxy_stats_hourly 日期桶", [], e.deletedExpiredStatsHourlyCount, `只删除早于边界日 ${e.statsRetentionBoundaryDate} 的统计桶。`);
      const s = [
        mt("proxy_stats_hourly", "proxy_stats_hourly 统计表", [], {
          count: Math.max(1, e.statsHourlyRowCount),
          note: t.rebuildStatsHourly ? `会清空当前统计（当前行数 ${e.statsHourlyRowCount}），并从后续新日志重新累计，不扫描历史日志。` : `保留当前统计，仅分页删除保留期边界前的日期桶（当前行数 ${e.statsHourlyRowCount}）。`
        }),
        mt("proxy_logs_fts", "proxy_logs_fts 全文索引", [], {
          count: Math.max(1, e.preservedLogCount),
          note: t.ftsRebuildDeferredReason === "deferred_size_guard" ? "基础日志超过 10000 行，本轮不会自动 rebuild。" : e.ftsReady ? "仅在无清理积压、预算有余量且满足最小间隔时重建。" : "当前未检测到 FTS 表，整理时会按资源预算决定是否补建。"
        }),
        mt("scheduled_d1_tidy", "scheduled.d1Tidy 运行状态", ["scheduled.d1Tidy"], {
          count: 1,
          note: "整理完成后会写入一份新的运行状态摘要。"
        })
      ], i = [
        mt("proxy_logs_retained", "保留期内 proxy_logs 日志", [], {
          count: e.preservedLogCount,
          note: `会保留最近 ${o.retentionDays} 天的日志。`
        }),
        mt("dns_ip_pool_items", "dns_ip_pool_items 共享 IP 池", [], {
          count: e.dnsIpPoolItemCount,
          note: "不会删除 dns_ip_pool_items。"
        }),
        mt("sys_status", "sys_status 运行状态", [], {
          count: e.sysStatusCount,
          note: "不会删除 sys_status 中的有效运行状态。"
        })
      ];
      Ee(i, e.d1DnsIpPoolSources.length > 0, "dns_ip_pool_sources_d1_primary", "dns_ip_pool_sources 主数据", n, e.d1DnsIpPoolSources.length, "dns_ip_pool_sources 现在是正式主数据，本次不会迁回 KV，也不会清空该表。");
      const c = { proxy_stats_hourly_expired: "proxy_stats_hourly" };
      for (const u of [
        ...a,
        ...s,
        ...i
      ]) {
        const f = c[u.key] || u.key;
        e.countLowerBounds?.[f] === !0 && (u.countIsLowerBound = !0);
      }
      const l = [], d = Math.max(0, Number(o.logQueuePendingCount) || 0);
      return d > 0 && l.push(`执行前会先尝试 flush ${d} 条内存日志，再开始清理 D1。`), l.push(o.maintenanceMode === "full" ? "当前为 full 维护模式；统计会清空后重新累计，FTS 与 optimize 仍受大小、积压、间隔和时间预算约束。" : "当前为 smart 维护模式，只在检测到必要条件且预算允许时执行较重的统计、FTS 与 optimize。"), a.length === 0 && l.push(o.mode === "scheduled" ? "当前定时 D1 维护没有检测到需要删除的旧数据，本轮会按计划检查统计与索引维护。" : "当前没有检测到需要删除的 D1 旧数据；本次主要会执行统计表与 FTS 维护。"), {
        scope: "d1",
        fieldGroups: [],
        deleteGroups: a,
        rewriteGroups: s,
        preserveGroups: i,
        warnings: l
      };
    },
    buildSummary(o, e, r, t = {}) {
      return {
        mode: o.mode,
        maintenanceMode: o.maintenanceMode,
        logRetentionDays: o.retentionDays,
        retentionCutoffAt: new Date(o.retentionCutoffMs).toISOString(),
        deletedExpiredLogCount: e.deletedExpiredLogCount,
        preservedLogCount: e.preservedLogCount,
        deletedExpiredLockCount: e.deletedExpiredLockCount,
        deletedExpiredFetchCacheCount: e.deletedExpiredFetchCacheCount,
        deletedExpiredProbeCacheCount: e.deletedExpiredProbeCacheCount,
        deletedExpiredAuthFailureCount: e.deletedExpiredAuthFailureCount,
        deletedExpiredDashboardCacheCount: e.deletedExpiredDashboardCacheCount,
        deletedExpiredRuntimeCacheCount: e.deletedExpiredRuntimeCacheCount,
        deletedExpiredStatsHourlyCount: e.deletedExpiredStatsHourlyCount,
        rebuiltStatsHourly: t.rebuildStatsHourly === !0,
        rebuiltLogsFts: t.rebuildLogsFts === !0,
        alignedStatsWindow: t.alignStatsWindow === !0,
        migratedDnsIpPoolSourcesToKvCount: 0,
        clearedLegacyDnsIpPoolSourcesCount: 0,
        preservedDnsIpPoolItemCount: e.dnsIpPoolItemCount,
        preservedDnsIpPoolSourceCount: e.dnsIpPoolSourceCount,
        preservedSysStatusCount: e.sysStatusCount,
        logQueuePendingCount: Math.max(0, Number(o.logQueuePendingCount) || 0),
        dnsIpPoolSourceAction: r.dnsIpPoolSourceAction,
        lastFtsRebuildAt: o.lastFtsRebuildAt,
        lastOptimizeAt: o.lastOptimizeAt
      };
    }
  };
}
var xg = Object.freeze({
  PREFIX: "node:",
  CONFIG_KEY: "sys:theme",
  NODES_INDEX_KEY: "sys:nodes_index:v1",
  NODES_SUMMARY_INDEX_KEY: "sys:nodes_index_full:v2",
  ADMIN_INDEX_UPLOAD_PREFIX: fd,
  ADMIN_ACTIVE_INDEX_KEY: md,
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
  D1_SCHEMA_META_TABLE: "d1_schema_meta",
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
function Og(o = {}) {
  const { nodeRepository: e } = o;
  return {
    async getNodesList(r, t) {
      const a = e.getKV(r);
      if (!a) return [];
      const n = _e(a);
      if (n.NodesListCache && n.NodesListCache.exp > k()) return n.NodesListCache.data;
      const s = await e.getNodesSummaryIndex(a, { ctx: t });
      if (Array.isArray(s)) return s;
      const i = await e.rebuildNodeIndexesFromKv(a, { ctx: t });
      return Array.isArray(i?.summaries) ? i.summaries : [];
    },
    async getNodesListStrict(r, t) {
      const a = e.getKV(r);
      if (!a) return [];
      const n = _e(a);
      if (n.NodesListCache && n.NodesListCache.exp > k()) return n.NodesListCache.data;
      const s = await e.getNodesSummaryIndexStrict(a, { ctx: t });
      if (Array.isArray(s)) return s;
      const i = await e.rebuildNodeIndexesFromKvStrict(a, { ctx: t });
      return Array.isArray(i?.summaries) ? i.summaries : [];
    },
    async invalidateList(r, t = null) {
      const a = e.getKV(t), n = _e(a);
      n.NodesListCache = null, n.NodesIndexCache = null, cr(a);
    },
    maybeCleanup(r = null) {
      const t = r ? _e(e.getKV(r)) : _t.current(), a = k(), n = t.CleanupState;
      if (a - (n.lastRunAt || 0) < v.Defaults.CleanupMinIntervalMs) return;
      n.lastRunAt = a;
      const s = v.Defaults.CleanupBudgetMs, i = v.Defaults.CleanupChunkSize, c = n.iterators || (n.iterators = {
        node: null,
        playbackRoute: null,
        crypto: null,
        rate: null,
        log: null,
        playbackInfo: null,
        failover: null,
        progress: null,
        monthlyTraffic: null
      }), l = a, d = (u, f, m, p = c, g = (h) => u.delete(h)) => {
        let h = p[m];
        h || (h = u.entries(), p[m] = h);
        let y = 0;
        for (; y < i && (y === 0 || k() - l < s); ) {
          const S = h.next();
          if (S.done) {
            p[m] = null;
            break;
          }
          y += 1;
          const [_, A] = S.value;
          u.has(_) && f(A, a) && g(_);
        }
      };
      if (n.phase === 0)
        d(t.NodeCache, (u) => u?.exp && u.exp < a, "node", t.CleanupIterators), n.phase = 1;
      else if (n.phase === 1)
        d(t.PlaybackRouteHotCache, (u) => !u || Number(u.expiresAt) <= a, "playbackRoute", t.CleanupIterators), n.phase = 2;
      else if (n.phase === 2)
        d(oe.CryptoKeyCache, (u) => u?.exp && u.exp < a, "crypto"), n.phase = 3;
      else if (n.phase === 3)
        d(Je.RateLimitCache, (u) => !u || u.resetAt < a, "rate"), n.phase = 4;
      else if (n.phase === 4) n.phase = 5;
      else if (n.phase === 5)
        d(oe.PlaybackInfoResponseCache, (u) => !u || (Number(u.expiresAt) || 0) <= a, "playbackInfo"), n.phase = 6;
      else if (n.phase === 6)
        d(oe.ProxyFailoverStateCache, (u) => {
          if (!u || typeof u != "object") return !0;
          if (u.failingTargets instanceof Map)
            for (const [y, S] of u.failingTargets) Number(S) <= a && u.failingTargets.delete(y);
          const f = Number(u.preferredTargetExpiresAt) > a, m = u.failingTargets instanceof Map && u.failingTargets.size > 0, p = !!u.inFlightProbe && Number(u.inFlightProbe.expiresAt) > a, g = Number(u.lastProbeResult?.completedAt) || 0, h = !!u.lastProbeResult && g + v.Defaults.HedgePreferredTtlSec * 1e3 > a;
          return !f && !m && !p && !h;
        }, "failover"), n.phase = 7;
      else if (n.phase === 7) {
        const u = Math.max(3e4, Math.max(1, Number(v.Defaults.VideoProgressForwardIntervalSec) || 1) * 2e4);
        d(oe.PlaybackProgressRelay, (f) => {
          if (!f || f.pendingSnapshot || f.activeFlushPromise) return !f;
          const m = Number(f.terminalTombstoneUntil) || 0;
          if (m > 0) return m < a;
          const p = Number(f.lastTouchedAt || f.lastForwardAt) || 0;
          return p > 0 && p + u <= a;
        }, "progress", c, Zt), n.phase = 8;
      } else
        d(oe.DashboardMonthlyTrafficCache, (u) => !u || (Number(u.staleUntil) || 0) <= a, "monthlyTraffic"), n.phase = 0;
    }
  };
}
function vg(o = {}, e = {}) {
  const {} = o;
  return {
    normalizeNodeIndex(r = []) {
      return [...new Set((Array.isArray(r) ? r : []).map((t) => String(t || "").toLowerCase().trim()).filter(Boolean))];
    },
    normalizeNodeSummaryPayload(r, t = {}) {
      if (!U(t)) return null;
      const a = String(r || t.name || "").toLowerCase().trim();
      if (!a) return null;
      const n = e.normalizeLines(t.lines, t.target, t.port).slice(0, qn);
      if (!n.length) return null;
      const s = e.resolveActiveLineId(t.activeLineId, n, Array.isArray(t.lines) ? t.lines : [], t.port), i = nr(t.entryMode);
      return {
        name: a,
        cacheRevision: uo(a, t),
        displayName: String(t.displayName ?? ""),
        entryMode: i,
        hostPrefixCnameTarget: i === "host_prefix" ? Vt(t.hostPrefixCnameTarget) : "",
        secret: i === "host_prefix" ? "" : String(t.secret ?? ""),
        tag: zr(t.tags, t.tag)[0] || "",
        tags: zr(t.tags, t.tag),
        tagColor: String(t.tagColor ?? ""),
        remark: String(t.remark ?? ""),
        lines: n.map((c) => ({
          id: String(c.id || "").trim(),
          name: String(c.name || "").trim(),
          target: String(c.target || "").trim()
        })),
        activeLineId: s,
        playbackInfoMode: Pr(t.playbackInfoMode),
        mediaAuthMode: ar(t.mediaAuthMode),
        realClientIpMode: Mr(t.realClientIpMode),
        hedgeProbePath: fa(t.hedgeProbePath),
        routingDecisionMode: Fr(t.routingDecisionMode),
        mainVideoStreamMode: mn(t.mainVideoStreamMode ?? t.wangpanDirectMode ?? t.wangpanMode)
      };
    },
    buildComparableNodeSummary(r = {}) {
      return e.normalizeNodeSummaryPayload(r?.name, r);
    },
    areNodeSummariesEquivalent(r = {}, t = {}) {
      return Q(e.buildComparableNodeSummary(r)) === Q(e.buildComparableNodeSummary(t));
    },
    hasLegacyNodeMirrorFields(r = {}) {
      return U(r) ? Object.prototype.hasOwnProperty.call(r, "headers") || Object.prototype.hasOwnProperty.call(r, "target") || Object.prototype.hasOwnProperty.call(r, "port") || Object.prototype.hasOwnProperty.call(r, "schemaVersion") || Object.prototype.hasOwnProperty.call(r, "createdAt") || Object.prototype.hasOwnProperty.call(r, "updatedAt") || Object.prototype.hasOwnProperty.call(r, "remarkColor") || Object.prototype.hasOwnProperty.call(r, "wangpanDirectMode") || Object.prototype.hasOwnProperty.call(r, "wangpanMode") || [...En, ...Rn].some((t) => Object.prototype.hasOwnProperty.call(r, t)) ? !0 : (Array.isArray(r.lines) ? r.lines : []).some((t) => U(t) ? Object.prototype.hasOwnProperty.call(t, "port") || Object.prototype.hasOwnProperty.call(t, "latencyMs") || Object.prototype.hasOwnProperty.call(t, "latencyUpdatedAt") : !1) : !1;
    },
    summaryEntryRequiresNodeEntityRebuild(r = {}) {
      if (!U(r) || e.hasLegacyNodeMirrorFields(r)) return !0;
      const t = Array.isArray(r.lines) ? r.lines : [], a = e.normalizeLines(t, r.target, r.port);
      if (!a.length || t.length !== a.length) return !0;
      for (let n = 0; n < a.length; n += 1) {
        const s = t[n], i = a[n];
        if (!U(s) || !U(i) || String(s.target || "").trim() !== String(i.target || "").trim()) return !0;
      }
      return String(r.activeLineId || "").trim() !== e.resolveActiveLineId(r.activeLineId, a, t, r.port);
    },
    buildNodeSummary(r, t = {}, a = {}) {
      const n = String(r || t.name || "").toLowerCase().trim();
      if (!n || !U(t)) return {
        summary: null,
        changed: !1,
        legacyMirrorDetected: !1
      };
      const s = e.normalizeNode(n, t, a), i = e.normalizeNodeSummaryPayload(n, s.data);
      if (!i) return {
        summary: null,
        changed: !0,
        legacyMirrorDetected: e.hasLegacyNodeMirrorFields(t)
      };
      const c = e.normalizeNodeSummaryPayload(n, t), l = e.hasLegacyNodeMirrorFields(t);
      return {
        summary: i,
        changed: l || !e.areNodeSummariesEquivalent(c, i),
        legacyMirrorDetected: l
      };
    },
    normalizeNodeSummaryIndex(r = []) {
      const t = [], a = /* @__PURE__ */ new Set();
      let n = !1, s = !1, i = !1;
      for (const c of Array.isArray(r) ? r : []) {
        if (!U(c)) {
          n = !0, i = !0;
          continue;
        }
        const l = String(c.name || "").trim(), d = l.toLowerCase();
        if (!d || a.has(d)) {
          n = !0, i = !0;
          continue;
        }
        const { name: u, ...f } = c, m = e.buildNodeSummary(d, f);
        if (!m.summary) {
          n = !0, i = !0;
          continue;
        }
        (m.changed || l !== d) && (n = !0), m.legacyMirrorDetected && (s = !0), e.summaryEntryRequiresNodeEntityRebuild(f) && (i = !0), t.push(m.summary), a.add(d);
      }
      return {
        nodes: t,
        changed: n,
        legacyMirrorDetected: s,
        requiresRebuild: i
      };
    },
    primeNodeSummaryCaches(r = [], t = null) {
      const a = _e(t), n = Array.isArray(r) ? r.filter((i) => U(i) && i.name) : [], s = e.normalizeNodeIndex(n.map((i) => i.name));
      return a.NodesListCache = {
        data: n.map((i) => ({ ...i })),
        exp: k() + 6e4
      }, a.NodesIndexCache = {
        data: s,
        exp: k() + 6e4
      }, n;
    },
    async getNodesSummaryIndex(r, t = {}) {
      if (!r) return null;
      const a = _e(r);
      if (t.useCache !== !1 && a.NodesListCache?.exp > k() && Array.isArray(a.NodesListCache.data)) return a.NodesListCache.data;
      const n = a.NodesRevisionCacheGeneration;
      let s = null;
      try {
        s = await r.get(e.NODES_SUMMARY_INDEX_KEY, { type: "json" });
      } catch {
        return null;
      }
      if (a.NodesRevisionCacheGeneration !== n) return Array.isArray(s) ? e.normalizeNodeSummaryIndex(s).nodes : null;
      if (!Array.isArray(s)) return null;
      const i = e.normalizeNodeSummaryIndex(s);
      if (i.requiresRebuild === !0) {
        const c = await e.rebuildNodeIndexesFromKv(r, { ctx: t.ctx });
        return Array.isArray(c?.summaries) ? c.summaries : [];
      }
      return a.NodesRevisionCacheGeneration === n ? e.primeNodeSummaryCaches(i.nodes, r) : i.nodes;
    },
    async getNodesSummaryIndexStrict(r, t = {}) {
      if (!r) return null;
      const a = _e(r);
      if (t.useCache !== !1 && a.NodesListCache?.exp > k() && Array.isArray(a.NodesListCache.data)) return a.NodesListCache.data;
      const n = a.NodesRevisionCacheGeneration, s = await Le(r, e.NODES_SUMMARY_INDEX_KEY, { type: "json" });
      if (a.NodesRevisionCacheGeneration !== n) return Array.isArray(s) ? e.normalizeNodeSummaryIndex(s).nodes : [];
      if (!Array.isArray(s)) {
        const c = await e.rebuildNodeIndexesFromKvStrict(r, { ctx: t.ctx });
        return Array.isArray(c?.summaries) ? c.summaries : [];
      }
      const i = e.normalizeNodeSummaryIndex(s);
      if (i.requiresRebuild === !0) {
        const c = await e.rebuildNodeIndexesFromKvStrict(r, { ctx: t.ctx });
        return Array.isArray(c?.summaries) ? c.summaries : [];
      }
      return a.NodesRevisionCacheGeneration === n ? e.primeNodeSummaryCaches(i.nodes, r) : i.nodes;
    },
    async loadNodeSummariesForMutation(r, t = {}) {
      const a = await r.get(e.NODES_SUMMARY_INDEX_KEY, { type: "json" });
      if (Array.isArray(a)) {
        const n = e.normalizeNodeSummaryIndex(a);
        if (n.requiresRebuild !== !0) return n.nodes;
      }
      return (await e.loadAllNodeEntitiesFromKvStrict(r, { ctx: t.ctx })).map((n) => e.buildNodeSummary(n?.name, n).summary).filter(Boolean);
    },
    async commitNodesSummaryIndexMutation(r, t = {}) {
      const { kv: a, ctx: n, syncLegacyIndex: s = !1 } = t, i = e.normalizeNodeSummaryIndex(r).nodes, c = e.normalizeNodeIndex(i.map((g) => g.name)), l = e.buildNodesIndexMeta(c, i), d = await e.readRevisionMeta(a, e.NODES_INDEX_META_KEY, {
        count: 0,
        indexHash: "",
        fullIndexHash: ""
      }), u = [];
      (d.fullIndexHash !== l.fullIndexHash || !d.revision) && u.push(a.put(e.NODES_SUMMARY_INDEX_KEY, JSON.stringify(i))), s !== !1 && (d.indexHash !== l.indexHash || !d.revision) && u.push(a.put(e.NODES_INDEX_KEY, JSON.stringify(c)));
      const f = d.indexHash !== l.indexHash || d.fullIndexHash !== l.fullIndexHash || Number(d.count) !== Number(l.count) || !d.revision;
      if (u.length > 0) {
        const g = Promise.all(u);
        n && n.waitUntil(g), await g;
      }
      if (f) {
        const g = a.put(e.NODES_INDEX_META_KEY, JSON.stringify(l));
        n && n.waitUntil(g), await g;
      }
      const m = e.primeNodeSummaryCaches(i, a), p = f ? l : d;
      return Ps(p.revision, a), {
        summaries: m,
        meta: p
      };
    },
    async persistNodesSummaryIndex(r, t = {}) {
      const { kv: a, ctx: n, syncLegacyIndex: s = !1 } = t, i = e.normalizeNodeSummaryIndex(r).nodes;
      if (!a) {
        const c = e.primeNodeSummaryCaches(i, a);
        return cr(a), c;
      }
      return await Dr(async () => (await e.commitNodesSummaryIndexMutation(i, {
        kv: a,
        ctx: n,
        syncLegacyIndex: s
      })).summaries, a);
    },
    async listNodeEntityKeys(r) {
      return (await e.listKvKeys(r, { prefix: e.PREFIX })).map((t) => String(t || "").replace(e.PREFIX, "").toLowerCase().trim()).filter(Boolean);
    },
    async listNodeEntityKeysStrict(r) {
      return (await e.listKvKeysStrict(r, { prefix: e.PREFIX })).map((t) => String(t || "").replace(e.PREFIX, "").toLowerCase().trim()).filter(Boolean);
    },
    async loadAllNodeEntitiesFromKv(r, t = {}) {
      const { ctx: a } = t;
      return r ? (await Zr(await e.listNodeEntityKeys(r), v.Defaults.NodesReadConcurrency, async (n) => {
        try {
          const s = await r.get(`${e.PREFIX}${n}`, { type: "json" });
          if (!s) return null;
          const i = e.normalizeNode(n, s);
          if (i.changed && !Ze(n, i.data)) {
            const c = r.put(`${e.PREFIX}${n}`, JSON.stringify(i.data));
            a ? a.waitUntil(c) : await c;
          }
          return {
            name: n,
            ...i.data
          };
        } catch {
          return null;
        }
      })).filter(Boolean) : [];
    },
    async loadAllNodeEntitiesFromKvStrict(r, t = {}) {
      return r ? (await Zr(await e.listNodeEntityKeysStrict(r), v.Defaults.NodesReadConcurrency, async (a) => {
        const n = await Le(r, `${e.PREFIX}${a}`, { type: "json" });
        return n ? {
          name: a,
          ...e.normalizeNode(a, n).data
        } : null;
      })).filter(Boolean) : [];
    },
    async rebuildNodeIndexesFromKv(r, t = {}) {
      const { ctx: a, syncLegacyIndex: n = !1 } = t;
      return r ? await Dr(async () => {
        const s = await e.loadAllNodeEntitiesFromKvStrict(r, { ctx: a }), i = s.map((l) => e.buildNodeSummary(l?.name, l).summary).filter(Boolean), c = await e.commitNodesSummaryIndexMutation(i, {
          kv: r,
          ctx: a,
          syncLegacyIndex: n
        });
        return {
          index: e.normalizeNodeIndex(c.summaries.map((l) => l?.name)),
          summaries: c.summaries,
          nodes: s
        };
      }, r) : {
        index: [],
        summaries: [],
        nodes: []
      };
    },
    async rebuildNodeIndexesFromKvStrict(r, t = {}) {
      if (!r) return {
        index: [],
        summaries: [],
        nodes: []
      };
      const a = _e(r), n = a.NodesRevisionCacheGeneration, s = await e.loadAllNodeEntitiesFromKvStrict(r, t), i = s.map((l) => e.buildNodeSummary(l?.name, l).summary).filter(Boolean), c = a.NodesRevisionCacheGeneration === n ? e.primeNodeSummaryCaches(i, r) : i;
      return {
        index: e.normalizeNodeIndex(c.map((l) => l?.name)),
        summaries: c,
        nodes: s
      };
    },
    async upsertNodeSummaryEntry(r, t, a = {}) {
      const { kv: n, ctx: s } = a;
      if (!n) return null;
      const i = String(r || "").toLowerCase().trim();
      if (!i || Ze(i, t)) return null;
      const c = e.buildNodeSummary(i, t).summary;
      if (!c) return null;
      const l = _e(n), d = l.NodesListCache?.exp > k() && Array.isArray(l.NodesListCache.data) ? l.NodesListCache.data.find((u) => String(u?.name || "").toLowerCase().trim() === i) : null;
      return d && e.areNodeSummariesEquivalent(d, c) ? d : await Dr(async () => {
        const u = await e.loadNodeSummariesForMutation(n, { ctx: s });
        let f = !1;
        const m = u.map((p) => String(p?.name || "").toLowerCase().trim() !== i ? p : (f = !0, e.areNodeSummariesEquivalent(p, c) ? p : c));
        return f || m.push(c), (await e.commitNodesSummaryIndexMutation(m, {
          kv: n,
          ctx: s
        })).summaries.find((p) => String(p?.name || "").toLowerCase().trim() === i) || c;
      }, n);
    },
    async removeNodeSummaryEntry(r, t = {}) {
      const { kv: a, ctx: n } = t;
      if (!a) return [];
      const s = String(r || "").toLowerCase().trim();
      return await Dr(async () => {
        const i = (await e.loadNodeSummariesForMutation(a, { ctx: n })).filter((c) => String(c?.name || "").toLowerCase().trim() !== s);
        return (await e.commitNodesSummaryIndexMutation(i, {
          kv: a,
          ctx: n
        })).summaries;
      }, a);
    },
    async getNodesIndex(r) {
      if (!r) return [];
      const t = _e(r);
      if (t.NodesIndexCache?.exp > k() && Array.isArray(t.NodesIndexCache.data)) return [...t.NodesIndexCache.data];
      if (t.NodesListCache?.exp > k() && Array.isArray(t.NodesListCache.data)) {
        const s = e.normalizeNodeIndex(t.NodesListCache.data.map((i) => i?.name));
        return t.NodesIndexCache = {
          data: s,
          exp: k() + 6e4
        }, [...s];
      }
      const a = t.NodesRevisionCacheGeneration, n = e.normalizeNodeIndex(await r.get(e.NODES_INDEX_KEY, { type: "json" }) || []);
      if (t.NodesRevisionCacheGeneration !== a) return [...n];
      if (!n.length) {
        const s = await e.rebuildNodeIndexesFromKv(r);
        return [...e.normalizeNodeIndex(s.index)];
      }
      return t.NodesRevisionCacheGeneration === a && (t.NodesIndexCache = {
        data: n,
        exp: k() + 6e4
      }), [...n];
    },
    buildPlaybackRouteHotSignature(r, t = {}) {
      const a = String(r || "").toLowerCase().trim(), n = ce(Q(e.getOrderedNodeLines(t).map((s) => String(s?.target || "").trim()).filter(Boolean)));
      return {
        cacheKey: `${a}:${String(t?.activeLineId || "").trim()}:${n}`,
        orderedTargetSignature: n
      };
    },
    buildPlaybackRouteHotSnapshot(r, t = {}, a = {}) {
      const n = String(r || "").toLowerCase().trim();
      if (!n || !U(t) || Ze(n, t)) return null;
      const s = e.getOrderedNodeLines(t), i = (s.length ? s.map((m) => m?.target) : String(t.target || "").split(",").map((m) => m.trim()).filter(Boolean)).map((m) => bn(m)).filter(tt);
      if (!i.length) return null;
      const c = Array.isArray(t.lines) ? t.lines.map((m) => U(m) ? { ...m } : m) : [], l = U(t.headers) ? { ...t.headers } : {}, d = {
        ...t,
        lines: c,
        headers: l
      }, { cacheKey: u, orderedTargetSignature: f } = e.buildPlaybackRouteHotSignature(n, d);
      return {
        nodeName: n,
        cacheKey: u,
        expiresAt: k() + Ld,
        nodesRevision: String(a.nodesRevision || "").trim(),
        nodeCacheRevision: uo(n, d),
        orderedTargetSignature: f,
        secret: String(d.secret || "").trim(),
        headers: l,
        lines: c,
        activeLineId: String(d.activeLineId || "").trim(),
        mainVideoStreamMode: $r(d),
        playbackInfoMode: Pr(d.playbackInfoMode),
        mediaAuthMode: ar(d.mediaAuthMode),
        realClientIpMode: Mr(d.realClientIpMode),
        routingDecisionMode: Fr(d.routingDecisionMode),
        targetRecords: i,
        nodeData: d
      };
    },
    getPlaybackRouteHotSnapshot(r, t = null) {
      const a = String(r || "").toLowerCase().trim();
      if (!a) return null;
      const n = _e(t ? e.getKV(t) : null).PlaybackRouteHotCache, s = n.get(a);
      return s ? Number(s.expiresAt) <= k() ? (n.delete(a), null) : (on(n, a), s) : null;
    },
    async getVerifiedPlaybackRouteHotSnapshot(r, t) {
      const a = e.getKV(t), n = _e(a), s = Pe(r, n), i = e.getPlaybackRouteHotSnapshot(r, t);
      if (!i) return null;
      if (!a) return i;
      const c = await e.getNodesRevision(a);
      return Pe(r, n) !== s ? null : !i.nodesRevision || !c || i.nodesRevision === c ? i : (e.invalidatePlaybackRouteHotCache(r, t), null);
    },
    setPlaybackRouteHotSnapshot(r, t = {}, a = {}, n = null) {
      const s = e.buildPlaybackRouteHotSnapshot(r, t, a);
      return s ? (Fe(_e(n ? e.getKV(n) : null).PlaybackRouteHotCache, s.nodeName, s, sr), s) : null;
    },
    async primePlaybackRouteHotSnapshot(r, t = {}, a) {
      const n = e.getKV(a), s = _e(n), i = Pe(r, s), c = n ? await e.getNodesRevision(n) : "";
      return Pe(r, s) !== i ? null : e.setPlaybackRouteHotSnapshot(r, t, { nodesRevision: c }, a);
    },
    invalidatePlaybackRouteHotCache(r = [], t = null) {
      const a = _e(t ? e.getKV(t) : null).PlaybackRouteHotCache;
      for (const n of Array.isArray(r) ? r : [r]) {
        const s = String(n || "").toLowerCase().trim();
        s && a.delete(s);
      }
    },
    invalidateNodeCaches(r = [], t = {}) {
      const a = t.kv || (t.env ? e.getKV(t.env) : null), n = _e(a), s = [];
      for (const i of Array.isArray(r) ? r : [r]) {
        const c = String(i || "").toLowerCase().trim();
        c && (s.push(c), n.NodeCache.delete(c), n.PlaybackRouteHotCache.delete(c));
      }
      s.length > 0 && (Um(s, n), Qc(s), Zc(s)), t.invalidateList && (n.NodesListCache = null, n.NodesIndexCache = null, cr(a));
    },
    async persistNodesIndex(r, t = {}) {
      const { kv: a, ctx: n, invalidateList: s = !1 } = t, i = _e(a), c = e.normalizeNodeIndex(r);
      return s && (i.NodesListCache = null), a ? await Dr(async () => {
        const l = await e.readRevisionMeta(a, e.NODES_INDEX_META_KEY, {
          count: 0,
          indexHash: "",
          fullIndexHash: ""
        }), d = ce(Q(c)), u = l.indexHash === d && l.revision ? l.updatedAt : (/* @__PURE__ */ new Date()).toISOString(), f = {
          ...l,
          updatedAt: u,
          revision: l.indexHash === d && l.revision ? l.revision : Bt(ce(`${d}:${l.fullIndexHash || ""}:${c.length}`), u),
          hash: l.hash || "",
          count: c.length,
          indexHash: d,
          fullIndexHash: String(l.fullIndexHash || "")
        }, m = [];
        (l.indexHash !== d || !l.revision) && m.push(a.put(e.NODES_INDEX_KEY, JSON.stringify(c)));
        const p = l.indexHash !== d || Number(l.count) !== c.length || !l.revision;
        if (m.length > 0) {
          const g = Promise.all(m);
          n && n.waitUntil(g), await g;
        }
        if (p) {
          const g = a.put(e.NODES_INDEX_META_KEY, JSON.stringify(f));
          n && n.waitUntil(g), await g;
        }
        return i.NodesIndexCache = {
          data: c,
          exp: k() + 6e4
        }, Ps(f.revision, a), c;
      }, a) : (i.NodesIndexCache = {
        data: c,
        exp: k() + 6e4
      }, cr(a), c);
    }
  };
}
function Fg(o = {}, e = {}) {
  const {} = o;
  return {
    getDnsRecordHistoryKey(r, t) {
      const a = encodeURIComponent(String(r || "").trim() || "default"), n = encodeURIComponent(String(t || "").trim() || "unknown");
      return `${e.DNS_RECORD_HISTORY_PREFIX}${a}:${n}`;
    },
    getDnsHostHistoryRecordId(r) {
      return `host:${te(r) || "unknown"}`;
    },
    normalizeDnsHistoryValueKey(r, t) {
      return `${String(r || "").trim().toUpperCase()}::${String(t || "").trim().toLowerCase()}`;
    },
    normalizeDnsRecordHistoryEntry(r = {}) {
      const t = r && typeof r == "object" ? r : {}, a = String(t.type || "").trim().toUpperCase(), n = String(t.content || "").trim(), s = String(t.savedAt || t.updatedAt || t.createdAt || "").trim(), i = s ? new Date(s) : null, c = i && !Number.isNaN(i.getTime()) ? i.toISOString() : "", l = String(t.name || "").trim(), d = String(t.actor || "admin").trim() || "admin", u = String(t.source || "ui").trim() || "ui", f = te(t.requestHost), m = [
        a,
        n.toLowerCase(),
        l.toLowerCase(),
        f,
        c || s,
        u.toLowerCase()
      ].join("|");
      return {
        id: String(t.id || `dns-hist-${ce(m || "empty")}`),
        name: l,
        type: a,
        content: n,
        savedAt: c,
        actor: d,
        source: u,
        requestHost: f,
        preferredFallback: t.preferredFallback === !0
      };
    },
    normalizeDnsRecordHistory(r = []) {
      const t = [], a = /* @__PURE__ */ new Map();
      for (const s of Array.isArray(r) ? r : []) {
        const i = e.normalizeDnsRecordHistoryEntry(s);
        if (i.type !== "CNAME" || !i.content) continue;
        const c = e.normalizeDnsHistoryValueKey(i.type, i.content), l = a.get(c);
        if (Number.isInteger(l) && l >= 0) {
          i.preferredFallback === !0 && t[l] && (t[l].preferredFallback = !0);
          continue;
        }
        if (a.set(c, t.length), t.push(i), t.length >= v.Defaults.DnsHistoryLimit) break;
      }
      let n = !1;
      for (const s of t)
        if (s.preferredFallback === !0) {
          if (n) {
            s.preferredFallback = !1;
            continue;
          }
          n = !0;
        }
      return t;
    },
    async getDnsRecordHistory(r, t, a) {
      if (!r || !t || !a) return [];
      try {
        const n = await r.get(e.getDnsRecordHistoryKey(t, a), { type: "json" });
        return e.normalizeDnsRecordHistory(n);
      } catch {
        return [];
      }
    },
    async getDnsRecordHistoryForMutation(r, t, a) {
      if (!r || !t || !a) return [];
      const n = await r.get(e.getDnsRecordHistoryKey(t, a), { type: "json" });
      return e.normalizeDnsRecordHistory(n);
    },
    async persistDnsRecordHistory(r, t, a, n) {
      if (!r || !t || !a) return [];
      const s = e.normalizeDnsRecordHistory(n);
      return await r.put(e.getDnsRecordHistoryKey(t, a), JSON.stringify(s)), s;
    },
    async recordDnsRecordHistory(r, t, a, n = {}) {
      if (!r || !t || !a) return [];
      const s = await e.getDnsRecordHistoryForMutation(r, t, a), i = e.normalizeDnsRecordHistoryEntry(n);
      if (i.type !== "CNAME" || !i.content) return s;
      s.find((d) => e.normalizeDnsHistoryValueKey(d?.type, d?.content) === e.normalizeDnsHistoryValueKey(i.type, i.content))?.preferredFallback === !0 && (i.preferredFallback = !0);
      const c = e.normalizeDnsHistoryValueKey(i.type, i.content), l = s[0] ? e.normalizeDnsHistoryValueKey(s[0].type, s[0].content) : "";
      return l && l === c ? s : e.persistDnsRecordHistory(r, t, a, [i, ...s]);
    },
    async getDnsHostHistory(r, t, a) {
      return e.getDnsRecordHistory(r, t, e.getDnsHostHistoryRecordId(a));
    },
    async persistDnsHostHistory(r, t, a, n) {
      return e.persistDnsRecordHistory(r, t, e.getDnsHostHistoryRecordId(a), n);
    },
    async recordDnsHostHistory(r, t, a, n = {}) {
      return e.recordDnsRecordHistory(r, t, e.getDnsHostHistoryRecordId(a), n);
    },
    async setDnsHostHistoryPreferredFallback(r, t, a, n = "", s = !0) {
      if (!r || !t || !a) return [];
      const i = await e.getDnsHostHistory(r, t, a), c = String(n || "").trim();
      let l = !1;
      const d = i.map((u) => {
        const f = c && String(u?.id || "").trim() === c;
        return f && (l = !0), {
          ...u,
          preferredFallback: s === !0 ? f : !1
        };
      });
      if (s === !0 && c && !l) throw new Error("dns_history_entry_not_found");
      return e.persistDnsHostHistory(r, t, a, d);
    },
    getCurrentDateKey(r = /* @__PURE__ */ new Date(), t = v.Defaults.ScheduleUtcOffsetMinutes) {
      return xt(r, t).dateKey;
    }
  };
}
function Ug(o = {}, e = {}) {
  const {} = o;
  return {
    buildLegacyConfigCacheKeys(...r) {
      const t = /* @__PURE__ */ new Set([Pc]);
      for (const a of r) {
        const n = e.getCurrentDateKey(/* @__PURE__ */ new Date(), a?.scheduleUtcOffsetMinutes);
        t.add(vs(a?.cfZoneId)), t.add(vs(a?.cfZoneId, n));
      }
      return [...t].filter(Boolean);
    },
    async listKvKeys(r, t = {}) {
      if (!r || typeof r.list != "function") return [];
      const a = String(t.prefix || ""), n = [];
      let s = "", i = 0, c = !1;
      const l = /* @__PURE__ */ new Set();
      for (; i < 1e3; ) {
        i += 1;
        const d = s ? await r.list({
          prefix: a,
          cursor: s
        }) : await r.list({ prefix: a });
        for (const f of d?.keys || []) {
          const m = String(f?.name || "").trim();
          m && n.push(m);
        }
        const u = typeof d?.cursor == "string" ? d.cursor : "";
        if (d?.list_complete === !0) {
          c = !0;
          break;
        }
        if (!u || u === s || l.has(u)) {
          const f = /* @__PURE__ */ new Error("KV key scan did not complete");
          throw f.code = "KV_SCAN_INCOMPLETE", f.status = 409, f.details = {
            prefix: a,
            pageCount: i,
            cursor: u,
            reason: u ? "repeated_cursor" : "missing_cursor"
          }, f;
        }
        l.add(u), s = u;
      }
      if (!c) {
        const d = /* @__PURE__ */ new Error("KV key scan exceeded the page safety limit");
        throw d.code = "KV_SCAN_INCOMPLETE", d.status = 409, d.details = {
          prefix: a,
          pageCount: i,
          cursor: s,
          reason: "page_limit"
        }, d;
      }
      return [...new Set(n)];
    },
    async listKvKeysStrict(r, t = {}) {
      if (!r || typeof r.list != "function") return [];
      const a = String(t.prefix || ""), n = [];
      let s = "", i = 0, c = !1;
      const l = /* @__PURE__ */ new Set();
      for (; i < 1e3; ) {
        i += 1;
        const d = await Ju(r, s ? {
          prefix: a,
          cursor: s
        } : { prefix: a });
        for (const f of d?.keys || []) {
          const m = String(f?.name || "").trim();
          m && n.push(m);
        }
        const u = typeof d?.cursor == "string" ? d.cursor : "";
        if (d?.list_complete === !0) {
          c = !0;
          break;
        }
        if (!u || u === s || l.has(u)) {
          const f = /* @__PURE__ */ new Error("KV key scan did not complete");
          throw f.code = "KV_SCAN_INCOMPLETE", f.status = 409, f.details = {
            prefix: a,
            pageCount: i,
            cursor: u,
            reason: u ? "repeated_cursor" : "missing_cursor"
          }, f;
        }
        l.add(u), s = u;
      }
      if (!c) {
        const d = /* @__PURE__ */ new Error("KV key scan exceeded the page safety limit");
        throw d.code = "KV_SCAN_INCOMPLETE", d.status = 409, d.details = {
          prefix: a,
          pageCount: i,
          cursor: s,
          reason: "page_limit"
        }, d;
      }
      return [...new Set(n)];
    },
    async readRepairableRuntimeConfig(r) {
      if (!r) return {
        config: {},
        rawConfig: {},
        hadMalformedValue: !1,
        source: "missing",
        rawText: null
      };
      let t = null;
      try {
        t = await r.get(e.CONFIG_KEY);
      } catch (a) {
        const n = /* @__PURE__ */ new Error("KV tidy could not read the runtime config");
        throw n.code = "KV_TIDY_CONFIG_READ_FAILED", n.status = 503, n.details = {
          key: e.CONFIG_KEY,
          cause: ie(a, "kv_read_failed")
        }, n;
      }
      if (t == null || t === "") return {
        config: {},
        rawConfig: {},
        hadMalformedValue: !1,
        source: "missing",
        rawText: null
      };
      try {
        const a = JSON.parse(String(t));
        return {
          config: re(U(a) ? a : {}),
          rawConfig: U(a) ? a : {},
          hadMalformedValue: !U(a),
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
    async readRawKvEntry(r, t) {
      if (!r) return {
        exists: !1,
        value: null
      };
      const a = await r.get(t);
      return a == null ? {
        exists: !1,
        value: null
      } : {
        exists: !0,
        value: String(a)
      };
    },
    async captureRawKvEntries(r, t = []) {
      const a = [], n = /* @__PURE__ */ new Set();
      for (const s of Array.isArray(t) ? t : []) {
        const i = String(s || "").trim();
        !i || n.has(i) || (n.add(i), a.push({
          key: i,
          ...await e.readRawKvEntry(r, i)
        }));
      }
      return a;
    },
    async applyKvMutationsWithRollback(r, t = []) {
      if (!r) return [];
      const a = [], n = /* @__PURE__ */ new Map(), s = /* @__PURE__ */ new Set();
      for (const l of Array.isArray(t) ? t : []) {
        const d = String(l?.key || "").trim();
        if (!d) continue;
        const u = String(l?.type || "put").trim().toLowerCase() === "delete" ? "delete" : "put";
        a.push({
          type: u,
          key: d,
          value: String(l?.value ?? "")
        }), !s.has(d) && (s.add(d), n.set(d, {
          key: d,
          ...await e.readRawKvEntry(r, d)
        }));
      }
      const i = [], c = /* @__PURE__ */ new Map();
      try {
        for (const l of a)
          l.type === "delete" ? await r.delete(l.key) : await r.put(l.key, l.value), c.has(l.key) || i.push(l.key), c.set(l.key, l.type === "delete" ? {
            exists: !1,
            value: null
          } : {
            exists: !0,
            value: l.value
          });
        return a;
      } catch (l) {
        const d = [], u = [];
        for (let f = i.length - 1; f >= 0; f -= 1) {
          const m = i[f], p = n.get(m), g = c.get(m);
          if (!(!p || !g))
            try {
              const h = await e.readRawKvEntry(r, m);
              if (!(h.exists === g.exists && (g.exists !== !0 || h.value === g.value))) {
                u.push(m);
                continue;
              }
              p.exists ? await r.put(p.key, p.value) : await r.delete(p.key);
            } catch (h) {
              d.push(`${p.key}:${h?.message || String(h)}`);
            }
        }
        if (d.length > 0 || u.length > 0) {
          const f = /* @__PURE__ */ new Error(`${l?.message || String(l)}; rollback_incomplete`);
          throw f.code = "KV_MUTATION_ROLLBACK_CONFLICT", f.status = 409, f.details = {
            rollbackConflicts: u,
            rollbackFailures: d,
            originalError: ie(l, "kv_mutation_failed")
          }, f;
        }
        throw l;
      }
    }
  };
}
function Hg(o = {}, e = {}) {
  const {} = o;
  return {
    createEmptyTidyPreview(r = "kv") {
      return {
        scope: String(r || "kv").trim() || "kv",
        fieldGroups: [],
        deleteGroups: [],
        rewriteGroups: [],
        preserveGroups: [],
        warnings: []
      };
    },
    async readStoredNodesSummaryState(r) {
      const t = String(await r.get(e.NODES_SUMMARY_INDEX_KEY) || "");
      let a = null;
      try {
        a = t ? JSON.parse(t) : null;
      } catch {
        a = null;
      }
      return {
        rawStoredSummaryIndexText: t,
        storedSummaryIndexState: Array.isArray(a) ? e.normalizeNodeSummaryIndex(a) : null,
        previousFullIndexBytes: t ? new TextEncoder().encode(t).length : 0
      };
    },
    async classifyKvTidyKeys(r, t = []) {
      const a = [], n = /* @__PURE__ */ new Set(), s = new Set(Object.values(e.LEGACY_OPS_STATUS_SECTION_KEYS));
      let i = 0, c = 0, l = 0, d = 0, u = 0, f = 0, m = 0, p = 0, g = 0, h = 0;
      for (const y of t)
        if (y) {
          if (y.startsWith(e.PREFIX)) {
            a.push(y.slice(e.PREFIX.length));
            continue;
          }
          if (y.startsWith("fail:")) {
            n.add(y), g += 1;
            continue;
          }
          if (y === "sys:cf_dash_cache" || y.startsWith("sys:cf_dash_cache:")) {
            n.add(y);
            continue;
          }
          if (y === e.LEGACY_SCHEDULED_LOCK_KEY) {
            n.add(y);
            continue;
          }
          if (y.startsWith("sys:dns_ip_pool_fetch_lock:v1:")) {
            n.add(y), h += 1;
            continue;
          }
          if (y === e.CONFIG_META_KEY) {
            u += 1;
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
        nodeNames: a,
        removableKeys: n,
        untouchedOtherKeyCount: i,
        opsStatusKeyCount: c,
        dnsRecordHistoryKeyCount: l,
        dnsIpPoolSourceKeyCount: d,
        configMetaKeyCount: u,
        snapshotMetaKeyCount: f,
        nodeIndexMetaKeyCount: m,
        telegramAlertStateKeyCount: p,
        loginFailureKeyCount: g,
        dnsFetchLockKeyCount: h
      };
    },
    async collectKvTidyNodeMutations(r, t = [], a = {}, n = []) {
      const s = [], i = [];
      let c = 0, l = 0, d = 0, u = 0, f = 0, m = 0, p = yt(a.sourceDirectNodes || []);
      const g = [];
      for (const y of t) {
        const S = `${e.PREFIX}${y}`;
        let _ = null;
        try {
          _ = await Le(r, S, { type: "json" });
        } catch (R) {
          const L = /* @__PURE__ */ new Error(`KV tidy could not read node ${y}`);
          throw L.code = "KV_TIDY_NODE_READ_FAILED", L.status = 503, L.details = {
            key: S,
            nodeName: y,
            cause: ie(R, "kv_read_failed")
          }, L;
        }
        if (!U(_)) {
          const R = /* @__PURE__ */ new Error(`KV tidy found an invalid node entity: ${y}`);
          throw R.code = "KV_TIDY_NODE_INVALID", R.status = 409, R.details = {
            key: S,
            nodeName: y
          }, R;
        }
        const A = uu(_);
        A.shouldAddToSourceDirectNodes && (p = yt([...p, y])), A.topLevelPortPresent && (d += 1), u += Number(A.linePortCount) || 0, A.defaultPortNodePresent && (f += 1), m += Number(A.defaultPortLineCount) || 0, l += A.legacyKeysPresent.length;
        const { data: b, changed: E } = e.normalizeNode(y, _, { dropLegacyDirectRouting: !0 });
        i.push({
          name: y,
          ...b
        }), !Ze(y, b) && E && (g.push({
          key: S,
          ...await e.readRawKvEntry(r, S)
        }), c += 1, s.push({
          name: y,
          data: b
        }));
      }
      let h = a;
      return Q(h.sourceDirectNodes || []) !== Q(p) && (h = re({
        ...h,
        sourceDirectNodes: p
      })), {
        nextTidyConfig: h,
        rewrittenNodes: s,
        fullEntityNodes: i,
        rewrittenNodeCount: c,
        deletedLegacyNodeFieldCount: l,
        migratedTopLevelPortNodeCount: d,
        migratedLinePortCount: u,
        migratedDefaultPortNodeCount: f,
        migratedDefaultPortLineCount: m,
        rollbackKvEntries: [...n, ...g]
      };
    },
    rewriteKvTidySnapshots(r = []) {
      const t = [];
      let a = 0, n = 0;
      const s = [];
      for (const i of r) {
        const c = ju(i);
        t.push(_a(c.snapshot)), c.rewritten && (a += 1), n += Number(c.deletedLegacyFieldCount) || 0, s.push(...c.migratedConfigKeys || []);
      }
      return {
        rewrittenSnapshots: t,
        rewrittenSnapshotCount: a,
        deletedLegacySnapshotFieldCount: n,
        migratedConfigKeys: s
      };
    },
    buildKvTidyNoteParts(r = {}, t = {}) {
      const a = [];
      return Array.isArray(r.legacyKeysPresent) && r.legacyKeysPresent.length && a.push(`legacy_keys=${r.legacyKeysPresent.join(",")}`), Number(r.rewrittenSnapshotCount) > 0 && a.push(`rewritten_snapshots=${r.rewrittenSnapshotCount}`), Number(r.rewrittenNodeCount) > 0 && a.push(`rewritten_nodes=${r.rewrittenNodeCount}`), Number(r.migratedTopLevelPortNodeCount) > 0 && a.push(`top_level_port_nodes=${r.migratedTopLevelPortNodeCount}`), Number(r.migratedLinePortCount) > 0 && a.push(`line_ports=${r.migratedLinePortCount}`), Number(r.migratedDefaultPortNodeCount) > 0 && a.push(`default_port_nodes=${r.migratedDefaultPortNodeCount}`), Number(r.migratedDefaultPortLineCount) > 0 && a.push(`default_port_lines=${r.migratedDefaultPortLineCount}`), t.includeRepairSource === !0 && t.repairedConfig?.hadMalformedValue && a.push(`${t.repairLabel || "config_source"}=${t.repairedConfig.source}`), a;
    },
    normalizeKvTidyMutationValueForHash(r = {}) {
      const t = String(r?.key || "").trim(), a = String(r?.value ?? "");
      if (t !== e.CONFIG_SNAPSHOTS_KEY || !a) return a;
      try {
        const n = JSON.parse(a);
        return Array.isArray(n) ? JSON.stringify(n.map((s) => {
          if (!U(s)) return s;
          const i = { ...s };
          return delete i.id, delete i.createdAt, i;
        })) : a;
      } catch {
        return a;
      }
    },
    buildKvTidyPlanHash(r = {}) {
      const t = (Array.isArray(r?.mutationPlan) ? r.mutationPlan : []).map((a) => ({
        type: String(a?.type || "put").trim().toLowerCase() === "delete" ? "delete" : "put",
        key: String(a?.key || "").trim(),
        value: e.normalizeKvTidyMutationValueForHash(a)
      }));
      return ce(Q({
        scope: "kv",
        scannedKeys: [...new Set(Array.isArray(r?.scannedKeys) ? r.scannedKeys : [])].sort(),
        revisions: U(r?.revisions) ? r.revisions : {},
        mutationPlan: t,
        rebuiltNodeSummaries: Array.isArray(r?.rebuiltNodeSummaries) ? r.rebuiltNodeSummaries : []
      }));
    }
  };
}
function kg(o = {}, e = {}) {
  return {
    ...vg(o, e),
    ...Fg(o, e),
    ...Ug(o, e),
    ...Hg(o, e)
  };
}
var Kg = class {
  constructor({ configReader: o, httpService: e, nodeRouteReader: r, proxyApi: t }) {
    this.configReader = o, this.httpService = e, this.nodeRouteReader = r, this.proxyApi = t;
  }
  #e(o, e, r, t = 200) {
    return this.httpService.buildCorsResponse(Ia(e, o), r, t, { mergeOriginVary: !0 });
  }
  #a(o, e) {
    const r = new URL(o.url);
    r.pathname = e + "/";
    const t = new Headers({
      Location: r.toString(),
      "Cache-Control": "no-store"
    });
    Ce(t);
    const a = o.method === "GET" || o.method === "HEAD" ? 301 : 307;
    return new Response(null, {
      status: a,
      headers: t
    });
  }
  #f(o, e) {
    const r = te(e);
    if (!r) return null;
    const t = new URL(o.url);
    t.hostname = r;
    const a = new Headers({
      Location: t.toString(),
      "Cache-Control": "no-store"
    });
    return Ce(a), new Response(null, {
      status: 301,
      headers: a
    });
  }
  #o(o, e = "") {
    const r = String(e || "").trim();
    if (!o || !r || o.status === 101) return o;
    const t = new Headers(o.headers || {});
    return t.append("Set-Cookie", r), new Response(o.body, {
      status: o.status,
      statusText: o.statusText,
      headers: t
    });
  }
  #n(o, e) {
    const r = this.#e(o, e, "Not Found", 404);
    return this.#o(r, Bc());
  }
  async #s(o, e, r, t) {
    if (!o || o.status === 101) return o;
    const a = await lp(r, e, t);
    return a ? this.#o(o, up(a)) : o;
  }
  #t(o) {
    const e = o.segments;
    return e.length <= 1 ? !1 : this.httpService.isPlaybackCriticalSegments(e, 1) ? !0 : e.length <= 2 ? !1 : this.httpService.isPlaybackCriticalSegments(e, 2);
  }
  async #d(o, e, r, t) {
    if (!o.root) return null;
    const a = this.#t(o);
    let n = a ? await this.nodeRouteReader.getVerifiedPlaybackRouteHotSnapshot(o.root, e) : null, s = a ? n ? "hit" : "miss" : "skip";
    const i = n?.nodeData || await this.nodeRouteReader.getNode(o.root, e, r);
    if (!i) return null;
    const c = Ze(o.root, i) ? "oversized_bypass" : "";
    if (c && (s = c), Qe(i?.entryMode)) return null;
    const l = i.secret, d = Et(o.root, l), u = 1 + o.rootRaw.length, f = o.normalizedPathname.substring(u), m = Ks(f, o.requestUrl, d), p = m?.normalizedPath || f, g = `/${o.rootRaw}${p === "/" ? "/" : p}`, h = m ? g.split("/").filter(Boolean) : o.segments;
    let y = u;
    if (l) {
      const E = h[1] || "";
      if (Mt(E) !== l) return null;
      y += 1 + E.length;
    }
    const S = g.substring(y), _ = m ? (() => {
      const E = new URL(o.requestUrl.toString());
      return E.pathname = g, E;
    })() : o.requestUrl, A = la(S);
    let b = A.remaining;
    return S === "" && !_.pathname.endsWith("/") || A.needsTrailingSlashRedirect === !0 ? { response: this.#a(t, g) } : (b === "" && (b = "/"), a && !n && (n = await this.nodeRouteReader.primePlaybackRouteHotSnapshot(o.root, i, e)), {
      nodeData: i,
      secret: l,
      remaining: ee(b),
      linkVariant: A.linkVariant,
      requestUrl: _,
      pathNormalizationState: m,
      playbackRouteHotSnapshot: n,
      targetHotCacheState: s,
      nodeCacheState: c,
      entryMode: "kv_route"
    });
  }
  #i(o) {
    return o ? en(la(o.normalizedPathname)?.remaining || "/") : !1;
  }
  async #r(o, e, r, t) {
    const a = o?.hostPrefixMatch;
    if (!a?.prefix) return null;
    const n = a.prefix, s = this.#i(o);
    let i = s ? await this.nodeRouteReader.getVerifiedPlaybackRouteHotSnapshot(n, e) : null, c = s ? i ? "hit" : "miss" : "skip";
    const l = i?.nodeData || await this.nodeRouteReader.getNode(n, e, r);
    if (!l || !Qe(l?.entryMode)) return null;
    const d = Ze(n, l) ? "oversized_bypass" : "";
    d && (c = d);
    const u = la(o.normalizedPathname);
    let f = u.remaining;
    return u.needsTrailingSlashRedirect === !0 ? { response: this.#a(t, o.normalizedPathname) } : (f === "" && (f = "/"), s && !i && (i = await this.nodeRouteReader.primePlaybackRouteHotSnapshot(n, l, e)), {
      nodeData: l,
      secret: "",
      remaining: ee(f),
      linkVariant: u.linkVariant,
      requestUrl: o.requestUrl,
      playbackRouteHotSnapshot: i,
      targetHotCacheState: c,
      nodeCacheState: d,
      entryMode: "host_prefix"
    });
  }
  #u(o) {
    const e = o?.requestHost || "", r = o?.configuredHost || "", t = o?.configuredLegacyHost || "";
    return e ? r && e === r ? !0 : !!(t && t !== r && e === t) : !1;
  }
  async #l(o, e, r, t, a = {}) {
    if (!this.#u(o) || !o?.root) return null;
    const n = o.root, s = this.#t(o);
    let i = s ? await this.nodeRouteReader.getVerifiedPlaybackRouteHotSnapshot(n, e) : null, c = s ? i ? "hit" : "miss" : "skip";
    const l = i?.nodeData || await this.nodeRouteReader.getNode(n, e, r);
    if (!l || !Qe(l?.entryMode)) return null;
    const d = Ze(n, l) ? "oversized_bypass" : "";
    d && (c = d);
    const u = Et(n, "", { entryMode: "kv_route" }), f = 1 + o.rootRaw.length, m = o.normalizedPathname.substring(f), p = Ks(m, o.requestUrl, u), g = p?.normalizedPath || m, h = `/${o.rootRaw}${g === "/" ? "/" : g}`, y = h.substring(f), S = p ? (() => {
      const b = new URL(o.requestUrl.toString());
      return b.pathname = h, b;
    })() : o.requestUrl, _ = la(y);
    let A = _.remaining;
    return y === "" && !S.pathname.endsWith("/") || _.needsTrailingSlashRedirect === !0 ? { response: this.#a(t, h) } : (A === "" && (A = "/"), s && !i && (i = await this.nodeRouteReader.primePlaybackRouteHotSnapshot(n, l, e)), {
      nodeData: l,
      nodeName: n,
      secret: "",
      remaining: ee(A),
      linkVariant: _.linkVariant,
      requestUrl: S,
      pathNormalizationState: p,
      playbackRouteHotSnapshot: i,
      targetHotCacheState: c,
      nodeCacheState: d,
      entryMode: "kv_route",
      routeKindOverride: a.isLegacyHostRequest === !0 ? "legacy_host_prefix_path_compat" : "host_prefix_path_compat",
      attachLegacyProxyContext: a.isLegacyHostRequest === !0
    });
  }
  async #c(o, e, r, t) {
    if (!Bs(o?.normalizedPathname)) return null;
    const a = t.headers.get("Cookie") || "", n = String(cn(a).get("legacy_proxy_ctx") || "").trim();
    if (!n) return null;
    const s = await dp(n, e, { requestHost: o.requestHost });
    if (s?.ok !== !0) return { response: this.#n(t, e) };
    const i = String(s.payload?.node || "").trim().toLowerCase();
    if (!i) return { response: this.#n(t, e) };
    const c = en(o.normalizedPathname);
    let l = c ? await this.nodeRouteReader.getVerifiedPlaybackRouteHotSnapshot(i, e) : null, d = c ? l ? "hit" : "miss" : "skip";
    const u = l?.nodeData || await this.nodeRouteReader.getNode(i, e, r);
    if (!u) return { response: this.#n(t, e) };
    const f = Ze(i, u) ? "oversized_bypass" : "";
    f && (d = f);
    const m = Qe(u?.entryMode);
    return c && !l && (l = await this.nodeRouteReader.primePlaybackRouteHotSnapshot(i, u, e)), {
      nodeData: u,
      nodeName: i,
      secret: m ? "" : u.secret,
      remaining: o.normalizedPathname,
      linkVariant: "main",
      requestUrl: o.requestUrl,
      playbackRouteHotSnapshot: l,
      targetHotCacheState: d,
      nodeCacheState: f,
      entryMode: "kv_route",
      routeKindOverride: m ? "legacy_host_context_cookie_host_prefix_compat" : "legacy_host_context_cookie"
    };
  }
  async handle(o, e, r, t) {
    if (!t) throw new TypeError("NodeProxyFacade.handle requires routeContext");
    const { requestHost: a, configuredHost: n, configuredLegacyHost: s } = t, i = await this.configReader.getRuntimeConfig(e), c = !!(s && s !== n && a === s), l = i.enableHostPrefixProxy === !0 && !!n && !c;
    t.hostPrefixMatch = l ? wo(a, n) : null;
    const d = !!(l && a !== n && a.endsWith(`.${n}`));
    if (t.hostPrefixMatch) {
      const m = await this.#r(t, e, r, o);
      return m?.response ? m.response : m?.nodeData ? this.proxyApi.handle(o, m.nodeData, m.remaining, t.hostPrefixMatch.prefix, m.secret, e, r, {
        requestUrl: m.requestUrl || t.requestUrl,
        linkVariant: m.linkVariant,
        targetHotCacheState: m.targetHotCacheState,
        nodeCacheState: m.nodeCacheState,
        cachedTargetRecords: Array.isArray(m.playbackRouteHotSnapshot?.targetRecords) ? m.playbackRouteHotSnapshot.targetRecords : null,
        nodeCacheRevision: m.playbackRouteHotSnapshot?.nodeCacheRevision || "",
        runtimeConfig: i,
        runtimeRouteContext: t,
        entryMode: m.entryMode
      }) : this.#e(o, e, "Not Found", 404);
    }
    if (d) return this.#e(o, e, "Not Found", 404);
    const u = await this.#l(t, e, r, o, { isLegacyHostRequest: c });
    if (u?.response) return u.response;
    if (u?.nodeData) {
      const m = await this.proxyApi.handle(o, u.nodeData, u.remaining, u.nodeName, u.secret, e, r, {
        requestUrl: u.requestUrl || t.requestUrl,
        linkVariant: u.linkVariant,
        pathNormalizationState: u.pathNormalizationState,
        targetHotCacheState: u.targetHotCacheState,
        nodeCacheState: u.nodeCacheState,
        cachedTargetRecords: Array.isArray(u.playbackRouteHotSnapshot?.targetRecords) ? u.playbackRouteHotSnapshot.targetRecords : null,
        nodeCacheRevision: u.playbackRouteHotSnapshot?.nodeCacheRevision || "",
        runtimeConfig: i,
        runtimeRouteContext: t,
        entryMode: u.entryMode,
        routeKindOverride: u.routeKindOverride
      });
      return u.attachLegacyProxyContext === !0 ? await this.#s(m, a, u.nodeName, e) : m;
    }
    const f = await this.#d(t, e, r, o);
    if (f?.response) return f.response;
    if (f?.nodeData) {
      const m = await this.proxyApi.handle(o, f.nodeData, f.remaining, t.root, f.secret, e, r, {
        requestUrl: f.requestUrl || t.requestUrl,
        linkVariant: f.linkVariant,
        pathNormalizationState: f.pathNormalizationState,
        targetHotCacheState: f.targetHotCacheState,
        nodeCacheState: f.nodeCacheState,
        cachedTargetRecords: Array.isArray(f.playbackRouteHotSnapshot?.targetRecords) ? f.playbackRouteHotSnapshot.targetRecords : null,
        nodeCacheRevision: f.playbackRouteHotSnapshot?.nodeCacheRevision || "",
        runtimeConfig: i,
        runtimeRouteContext: t,
        entryMode: f.entryMode
      });
      return c ? await this.#s(m, a, t.root, e) : m;
    }
    if (c && Bs(t.normalizedPathname)) {
      const m = await this.#c(t, e, r, o);
      if (m?.response) return m.response;
      if (m?.nodeData) {
        const p = await this.proxyApi.handle(o, m.nodeData, m.remaining, m.nodeName, m.secret, e, r, {
          requestUrl: m.requestUrl || t.requestUrl,
          linkVariant: m.linkVariant,
          targetHotCacheState: m.targetHotCacheState,
          nodeCacheState: m.nodeCacheState,
          cachedTargetRecords: Array.isArray(m.playbackRouteHotSnapshot?.targetRecords) ? m.playbackRouteHotSnapshot.targetRecords : null,
          nodeCacheRevision: m.playbackRouteHotSnapshot?.nodeCacheRevision || "",
          runtimeConfig: i,
          runtimeRouteContext: t,
          entryMode: m.entryMode,
          routeKindOverride: m.routeKindOverride
        });
        return this.#s(p, a, m.nodeName, e);
      }
    }
    return this.#e(o, e, "Not Found", 404);
  }
};
function Bg(o) {
  return Object.freeze({
    persistCloudflareDnsRecordsForHost(e) {
      return im({
        ...e,
        dnsHistoryRepository: o
      });
    },
    buildDnsIpWorkspaceItems(e, r, t, a = {}) {
      return Mc(e, r, t, {
        ...a,
        probeRepository: o
      });
    },
    buildDnsIpPoolWorkspacePreviewItems(e, r, t, a, n = {}) {
      return Am(e, r, t, a, {
        ...n,
        probeRepository: o
      });
    },
    tryAcquireDnsIpPoolFetchRefreshLock(e, r) {
      return Nm({
        ...e,
        leaseRepository: o
      }, r);
    },
    releaseDnsIpPoolFetchRefreshLock(e, r) {
      return Im({
        ...e,
        leaseRepository: o
      }, r);
    },
    runDnsIpPoolSourcesLiveRefresh(e) {
      return Mm({
        ...e,
        poolRepository: o
      });
    }
  });
}
function $g(o, e) {
  const r = e.shellService, t = [
    Fm({
      kernel: o,
      bindingPort: o,
      CacheManager: e.cacheManager,
      LogQueryPlanner: e.logQueryPlanner,
      Logger: e.logger,
      requestModel: o,
      buildAdminLocalIndexUploadRecord: r.buildAdminLocalIndexUploadRecord,
      buildAdminShellState: r.buildAdminShellState,
      buildAdminUiContract: r.buildAdminUiContract,
      buildDnsIpPoolWorkspacePreviewItems: e.dns.buildDnsIpPoolWorkspacePreviewItems,
      buildDnsIpWorkspaceItems: e.dns.buildDnsIpWorkspaceItems,
      persistCloudflareDnsRecordsForHost: e.dns.persistCloudflareDnsRecordsForHost,
      releaseDnsIpPoolFetchRefreshLock: e.dns.releaseDnsIpPoolFetchRefreshLock,
      runDnsIpPoolSourcesLiveRefresh: e.dns.runDnsIpPoolSourcesLiveRefresh,
      tryAcquireDnsIpPoolFetchRefreshLock: e.dns.tryAcquireDnsIpPoolFetchRefreshLock,
      withAdminShellRuntimeStatus: r.withAdminShellRuntimeStatus
    }),
    xp({
      D1TidyExecutor: e.d1TidyExecutor,
      D1TidyPlanner: e.d1TidyPlanner,
      Logger: e.logger,
      buildAdminReleaseVendorManifest: r.buildAdminReleaseVendorManifest,
      normalizeAdminReleaseVendorManifestRecord: r.normalizeAdminReleaseVendorManifestRecord,
      validateAdminShellHtmlSource: r.validateAdminShellHtmlSource
    }, o),
    Gp({
      CacheManager: e.cacheManager,
      persistCloudflareDnsRecordsForHost: e.dns.persistCloudflareDnsRecordsForHost
    }, o),
    Xp({
      bindingPort: o,
      schemaReadinessPort: o,
      statusPersistence: o
    }),
    Cg({
      CacheManager: e.cacheManager,
      withAdminShellRuntimeStatus: r.withAdminShellRuntimeStatus
    }, o),
    Ig({}, o),
    kg({}, o)
  ];
  for (const a of t) for (const [n, s] of Object.entries(a)) o[n] = s;
  return o;
}
function zg({ includeTestingSupport: o = !1 } = {}) {
  const e = { ...xg }, r = Object.freeze({ getRuntimeConfig: Ae }), t = Og({ nodeRepository: e }), a = qp({ logRepository: e }), n = nf({
    indexRepository: e,
    statusPort: e
  });
  $g(e, {
    cacheManager: t,
    d1TidyExecutor: Mg(),
    d1TidyPlanner: Pg(),
    dns: Bg(e),
    logger: a,
    logQueryPlanner: Vp(),
    shellService: n
  });
  const s = Sg({
    cachePort: t,
    configReader: r,
    fetchPort: { fetchRequest: Be },
    logger: a,
    nodeRepository: e
  }), i = new Au({
    actionHandlers: e.adminActionHandlers,
    bindingService: e,
    configReader: r,
    repository: e,
    requestModel: e,
    shellService: n
  }), c = new Kg({
    configReader: r,
    httpService: Object.freeze({
      buildCorsResponse: n.buildEdgeCorsResponse,
      isPlaybackCriticalSegments: n.isPlaybackCriticalSegments
    }),
    nodeRouteReader: e,
    proxyApi: s
  }), l = new Op({
    logger: a,
    service: e
  }), d = (m, p) => {
    const g = new URL(m.url), h = te(g.hostname), y = ee(g.pathname), S = y.toLowerCase(), _ = nt(p), A = _.toLowerCase(), b = yn(_), E = b.toLowerCase(), R = xi(p, {
      adminPath: _,
      loginPath: b
    }), L = y.split("/").filter(Boolean), T = L[0] || "", D = Mt(T).toLowerCase();
    return {
      initHealth: R,
      requestUrl: g,
      requestHost: h,
      configuredHost: ze(p),
      configuredLegacyHost: Gr(p),
      normalizedPathname: y,
      pathnameLower: S,
      adminPath: _,
      adminPathLower: A,
      adminLoginPath: b,
      adminLoginPathLower: E,
      segments: L,
      rootRaw: T,
      root: D
    };
  }, u = (m, p) => (p === "GET" || p === "HEAD") && m.pathnameLower === "/favicon.ico" || p === "GET" && m.normalizedPathname === "/" || Mi(m.pathnameLower, m.adminPathLower) || Lr(m.pathnameLower, m.adminLoginPathLower) ? !0 : m.adminPathLower === "/admin" && m.pathnameLower === "/api/auth/login" && m.root === "api" && m.segments[1] === "auth" && m.segments[2] === "login", f = {
    adminConsole: i,
    nodeProxy: c,
    scheduledMaintenance: l,
    workerHandler: Object.freeze({
      async fetch(m, p, g) {
        const h = d(m, p), y = m.method;
        if (!((y === "GET" || y === "HEAD") && h.pathnameLower === "/favicon.ico")) {
          const S = await r.getRuntimeConfig(p), _ = !!(h.configuredLegacyHost && h.configuredLegacyHost !== h.configuredHost && h.requestHost === h.configuredLegacyHost);
          if (S.enableHostPrefixProxy === !0 && h.configuredHost && !_ && h.requestHost !== h.configuredHost && h.requestHost.endsWith(`.${h.configuredHost}`)) return c.handle(m, p, g, h);
        }
        if (u(h, y)) {
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
  return o === !0 && (f.testingSupport = Object.freeze({
    cacheManager: t,
    kernel: e,
    logger: a,
    shellService: n,
    buildNodeRouteContext: d,
    buildRouteCorsResponse(m, p, g, h = 200) {
      return n.buildEdgeCorsResponse(Ia(p, m), g, h, { mergeOriginVary: !0 });
    },
    isPlaybackCriticalRouteContext(m) {
      const p = Array.isArray(m?.segments) ? m.segments : [];
      return p.length <= 1 ? !1 : n.isPlaybackCriticalSegments(p, 1) ? !0 : p.length > 2 && n.isPlaybackCriticalSegments(p, 2);
    },
    isolateState: Al,
    proxyService: s.testingSupport
  })), Object.freeze(f);
}
var { workerHandler: Wg } = zg();
export {
  Wg as default
};
