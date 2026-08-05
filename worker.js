function so(n) {
  const e = String(n || "").trim();
  if (!/^\d+$/.test(e)) return null;
  const r = Number(e);
  return Number.isFinite(r) ? r : null;
}
function io(n) {
  if (n == null) return "";
  try {
    return n instanceof ArrayBuffer ? new TextDecoder().decode(new Uint8Array(n)) : ArrayBuffer.isView(n) ? new TextDecoder().decode(n) : String(n || "");
  } catch {
    return "";
  }
}
async function $s(n, e) {
  const r = Math.max(0, Math.floor(Number(e) || 0)), t = so(n?.headers?.get?.("Content-Length"));
  if (Number.isFinite(t) && t > r) {
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
  const a = n.body.getReader(), o = [];
  let s = 0;
  try {
    for (; ; ) {
      const { done: l, value: u } = await a.read();
      if (l) break;
      const d = u instanceof Uint8Array ? u : new Uint8Array(u || 0);
      if (s + d.byteLength > r) {
        try {
          Promise.resolve(a.cancel()).catch(() => {
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
      a.releaseLock();
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
async function Pe(n, e) {
  const r = await $s(n, e);
  return {
    text: r.exceeded ? "" : new TextDecoder().decode(r.bodyBytes),
    bytes: r.bytes,
    exceeded: r.exceeded
  };
}
function rn(n) {
  let e = /* @__PURE__ */ new WeakMap(), r = n(), t = r;
  return {
    get(a = null) {
      if (!a || typeof a != "object" && typeof a != "function") return r;
      let o = e.get(a);
      return o || (o = n(), e.set(a, o)), t = o, o;
    },
    current() {
      return t;
    },
    reset() {
      e = /* @__PURE__ */ new WeakMap(), r = n(), t = r;
    }
  };
}
function rl(n, e = 8192) {
  const r = Math.max(2, Math.floor(Number(e) || 8192)), t = Math.max(1, Math.min(32, Math.floor(r / 256))), a = Math.max(16, Math.min(512, Math.floor(r / Math.max(4, t * 2)))), o = 4, s = Math.max(8, Math.min(256, Math.floor(r / 32))), i = /* @__PURE__ */ new WeakSet();
  let c = 0, l = !1;
  const u = (f, m = 0) => {
    if (f == null) return f;
    if (typeof f == "string")
      return f.length <= a ? f : (l = !0, `${f.slice(0, a)}...`);
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
        const y = h.length > a ? `${h.slice(0, a)}...` : h;
        p[y] = u(f[h], m + 1), g += 1;
      }
      return p;
    } finally {
      i.delete(f);
    }
  };
  try {
    const f = JSON.stringify(u(n));
    if (!l && f && f.length <= r) return f;
  } catch {
  }
  const d = JSON.stringify({ truncated: !0 });
  return d.length <= r ? d : "{}";
}
function ie(n = "") {
  const e = String(n || "");
  let r = 2166136261;
  for (let t = 0; t < e.length; t += 1)
    r ^= e.charCodeAt(t), r = Math.imul(r, 16777619);
  return (r >>> 0).toString(36);
}
function zo(n = []) {
  const e = Array.isArray(n) ? n : [n];
  let r = 2166136261;
  const t = (a) => {
    for (let o = 0; o < 32; o += 8)
      r ^= a >>> o & 255, r = Math.imul(r, 16777619);
  };
  t(e.length);
  for (const a of e) {
    const o = String(a ?? "");
    t(o.length);
    for (let s = 0; s < o.length; s += 1)
      r ^= o.charCodeAt(s), r = Math.imul(r, 16777619);
  }
  return (r >>> 0).toString(36);
}
function En(n = "") {
  const e = new TextEncoder().encode(String(n || ""));
  let r = 14695981039346656037n;
  const t = 1099511628211n;
  for (const a of e)
    r ^= BigInt(a), r = BigInt.asUintN(64, r * t);
  return r.toString(16).padStart(16, "0");
}
async function vn(n = "") {
  const e = await globalThis.crypto.subtle.digest("SHA-256", new TextEncoder().encode(String(n || "")));
  return [...new Uint8Array(e)].map((r) => r.toString(16).padStart(2, "0")).join("");
}
function mt(n) {
  const e = Array.isArray(n) ? n : String(n || "").split(/[\\r\\n,，;；|]+/), r = /* @__PURE__ */ new Set(), t = [];
  for (const a of e) {
    const o = String(a || "").trim();
    if (!o) continue;
    const s = o.toLowerCase();
    r.has(s) || (r.add(s), t.push(o));
  }
  return t;
}
function co(n) {
  const e = String(n || "").trim().toLowerCase();
  if (!e) return null;
  const r = e.includes("*"), t = e.replace(/^\*\./, "").replace(/^\*+/, "").replace(/\*+$/g, "").replace(/^\.+|\.+$/g, "");
  return t ? {
    hostname: t,
    wildcard: r
  } : null;
}
function re(n) {
  return co(n)?.hostname || "";
}
function Jt(n = []) {
  const e = Array.isArray(n) ? n : [n], r = [], t = /* @__PURE__ */ new Set();
  for (const a of e) {
    const o = String(a || "").trim();
    !o || t.has(o) || (t.add(o), r.push(o));
  }
  return r;
}
function k(n) {
  return !!n && typeof n == "object" && !Array.isArray(n);
}
function ue(n, e, r, t) {
  let a;
  if (typeof n == "number") a = n;
  else if (typeof n == "string") {
    const o = n.trim();
    if (!/^-?\d+$/.test(o)) return e;
    a = Number(o);
  } else return e;
  return Number.isFinite(a) ? Math.min(t, Math.max(r, Math.floor(a))) : e;
}
function al(n, e, r, t) {
  const a = Number(n);
  return Number.isFinite(a) ? Math.min(t, Math.max(r, a)) : e;
}
function ua(n, e) {
  return !!n && typeof n == "object" && Object.prototype.hasOwnProperty.call(n, e);
}
function Ia(n) {
  return String(n || "").replace(/[\\%_]/g, "\\$&");
}
function nl(n) {
  const e = String(n || "").trim();
  return e ? /^(?:\d{1,3}\.){3}\d{1,3}$/.test(e) ? !0 : /^[0-9a-f:]+$/i.test(e) && e.includes(":") : !1;
}
function Wo(n) {
  const e = String(n || "").trim();
  return e ? /^[a-z]{3,4}$/i.test(e) : !1;
}
function ol() {
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
function sl() {
  const n = rn(() => ({ namespaces: /* @__PURE__ */ new Map() }));
  let e = "default";
  const r = (t, a = "default") => {
    const o = String(a || "default").trim() || "default";
    let s = t.namespaces.get(o);
    return s || (s = {
      ConfigCache: null,
      RuntimeConfigCacheGeneration: 0,
      SingleFlightTasks: /* @__PURE__ */ new Map()
    }, t.namespaces.set(o, s)), e = o, s;
  };
  return {
    get(t = null, a = "default") {
      return r(n.get(t), a);
    },
    current() {
      return r(n.current(), e);
    },
    reset() {
      n.reset(), e = "default";
    }
  };
}
function il() {
  const n = rn(() => ({
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
function ur(n = globalThis) {
  try {
    return n?.caches?.default ?? null;
  } catch {
    return null;
  }
}
function Fn(n = globalThis) {
  return n.crypto.subtle;
}
function Go(n) {
  return String(n || "").trim();
}
function cl(n = [], e = {}) {
  const r = /* @__PURE__ */ Object.create(null), t = /* @__PURE__ */ new Map();
  for (const s of n) {
    const i = Go(s?.name) || "anonymous", c = s?.handlers && typeof s.handlers == "object" ? s.handlers : s;
    for (const [l, u] of Object.entries(c || {})) {
      if (typeof u != "function") throw new TypeError(`Admin action ${l} from ${i} is not a function`);
      if (r[l]) throw new Error(`Duplicate admin action ${l}: ${t.get(l)} and ${i}`);
      r[l] = u, t.set(l, i);
    }
  }
  const a = Object.freeze({ ...e.aliases || {} });
  for (const [s, i] of Object.entries(a)) if (!r[i]) throw new Error(`Admin action alias ${s} targets missing action ${i}`);
  for (const s of e.requiredActions || []) if (!r[s]) throw new Error(`Missing required admin action ${s}`);
  const o = Object.freeze({ ...r });
  return Object.freeze({
    handlers: o,
    names: Object.freeze(Object.keys(o).sort()),
    resolve(s) {
      const i = Go(s);
      return o[a[i] || i] || null;
    }
  });
}
function ll(n) {
  function e(t, a = null) {
    if (typeof t != "function") {
      const i = t;
      return (c) => e(c, i);
    }
    const o = n.get(a), s = o.KvDataMutationChain.catch(() => null).then(() => t());
    return o.KvDataMutationChain = s.catch(() => null), s;
  }
  function r(t, a = null) {
    if (typeof t != "function") {
      const i = t;
      return (c) => r(c, i);
    }
    const o = n.get(a), s = o.KvTidyMutationChain.catch(() => null).then(() => e(t, a));
    return o.KvTidyMutationChain = s.catch(() => null), s;
  }
  return Object.freeze({
    runDataMutation: e,
    runTidyMutation: r
  });
}
function ul() {
  return rn(() => ({
    LogQueue: [],
    LogDedupe: /* @__PURE__ */ new Map(),
    LogFlushPending: !1,
    LogFlushTask: null,
    LogClearEpochMs: 0,
    LogLastFlushAt: 0,
    runtimeConfig: null
  }));
}
function dr(n = "") {
  return String(n || "").trim().toLowerCase().split(";", 1)[0].trim();
}
function Ha(n = "") {
  const e = dr(n);
  return e === "application/json" || e === "text/json" || /^application\/[a-z0-9!#$&^_.+-]+\+json$/i.test(e);
}
function Bs(n = "") {
  const e = dr(n);
  return e === "text/html" || e === "application/xhtml+xml";
}
function dl(n = "", e = "text/html") {
  const r = dr(e);
  if (!Bs(r)) return !1;
  const [t, a] = r.split("/", 2);
  let o = -1, s = 0;
  for (const i of String(n || "").split(",")) {
    const [c, ...l] = i.split(";"), [u, d] = dr(c).split("/", 2);
    let f = -1;
    if (u === t && d === a ? f = 2 : u === t && d === "*" ? f = 1 : u === "*" && d === "*" && (f = 0), f < o || f < 0) continue;
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
function Un(n, e, r = {}) {
  const t = e?.response, a = Math.max(400, Number(r.status) || 502), o = String(r.statusText || (a === 502 ? "Bad Gateway" : "Error")).trim(), s = new Headers(t?.headers || {});
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
  const i = String(r.guardHeader || "").trim(), c = String(r.guardValue || "").trim();
  i && c && s.set(i, c);
  const l = {
    error: String(r.error || o || "Error"),
    code: a,
    message: String(r.message || "The API response did not satisfy the proxy contract."),
    ...r.details && typeof r.details == "object" && !Array.isArray(r.details) ? { details: r.details } : {}
  };
  try {
    Promise.resolve(t?.body?.cancel?.()).catch(() => {
    });
  } catch {
  }
  return n && typeof n == "object" && (n.proxyGuardState = c), {
    ...e,
    response: new Response(n?.requestMethod === "HEAD" ? null : JSON.stringify(l), {
      status: a,
      statusText: o,
      headers: s
    })
  };
}
function fl(n, e, r = {}) {
  const t = e?.response;
  if (!t || n?.requestTraits?.isApiRequest !== !0 || t.status === 101 || t.status === 204 || t.status === 205 || t.status === 304) return e;
  const a = typeof r.sanitizePath == "function" ? r.sanitizePath : (s) => String(s || "/"), o = t.headers.get("Content-Type");
  return (n?.requestMethod === "GET" || n?.requestMethod === "HEAD") && a(n?.proxyPath || "/") === "/" && dl(n?.request?.headers?.get("Accept"), o) || !Bs(o) ? e : (typeof r.buildErrorState == "function" ? r.buildErrorState : Un)(n, e, {
    message: "Upstream API returned an HTML document instead of API data.",
    guardHeader: "X-Proxy-Mime-Guard",
    guardValue: "html-document",
    details: {
      upstreamStatus: t.status,
      contentType: dr(o) || "missing"
    }
  });
}
var ml = "playback-info", Ks = /* @__PURE__ */ new WeakSet();
function lo(n) {
  if (!n || typeof n != "object" || Array.isArray(n)) return !1;
  const e = Object.getPrototypeOf(n);
  return e === Object.prototype || e === null;
}
function $a(n = "") {
  let e;
  try {
    e = JSON.parse(String(n || ""));
  } catch {
    return null;
  }
  return lo(e) ? e : null;
}
function uo({ response: n, bodyText: e, bodyBytes: r, payload: t }) {
  if (!n || !lo(t)) return null;
  const a = Object.freeze({
    contract: ml,
    response: n,
    bodyText: String(e || ""),
    bodyBytes: Math.max(0, Number(r) || 0),
    payload: t
  });
  return Ks.add(a), a;
}
function er(n) {
  return Ks.has(n) && n?.contract === "playback-info" && !!n.response && typeof n.bodyText == "string" && Number.isFinite(n.bodyBytes) && n.bodyBytes >= 0 && lo(n.payload);
}
function Rn(n, e) {
  return Object.freeze({
    kind: "invalid",
    reason: e,
    details: Object.freeze({
      reason: e,
      upstreamStatus: Number(n?.status) || 0,
      contentType: dr(n?.headers?.get?.("Content-Type")) || "missing"
    })
  });
}
async function pl(n, e = {}) {
  const r = String(e.requestMethod || "GET").toUpperCase();
  if (!n || !(n.status >= 200 && n.status < 300) || r === "HEAD" || n.status === 204 || n.status === 205 || !n.body) return Object.freeze({ kind: "skip" });
  if (!Ha(n.headers.get("Content-Type"))) return Rn(n, "unsupported_content_type");
  const t = await Pe(n.clone(), e.maxBytes);
  if (t.exceeded) return Rn(n, "body_too_large");
  const a = $a(t.text);
  return a ? Object.freeze({
    kind: "valid",
    representation: uo({
      response: n,
      bodyText: t.text,
      bodyBytes: t.bytes,
      payload: a
    })
  }) : Rn(n, "invalid_root_object");
}
function fo(n) {
  const e = n instanceof Headers ? new Headers(n) : new Headers(n || {});
  return [
    "Content-Encoding",
    "Content-Length",
    "Content-MD5",
    "Digest",
    "ETag",
    "Transfer-Encoding"
  ].forEach((r) => e.delete(r)), e.set("Content-Type", "application/json; charset=utf-8"), e;
}
function Ba(n) {
  if (typeof n != "string") return n;
  const e = n.trim();
  if (!e || !e.startsWith("{") && !e.startsWith("[")) return n;
  try {
    return JSON.parse(e);
  } catch {
    return n;
  }
}
function mo(n) {
  const e = Ba(n);
  if (!Array.isArray(e)) return {
    items: [],
    changed: !0
  };
  let r = e !== n;
  const t = [];
  for (const a of e) {
    const o = Ba(a);
    if (!o || typeof o != "object" || Array.isArray(o)) {
      r = !0;
      continue;
    }
    o !== a && (r = !0), t.push(o);
  }
  return {
    items: t,
    changed: r
  };
}
function zs(n) {
  let e = n, r = !1;
  const t = (a, o) => {
    e === n && (e = { ...n }), e[a] = o, r = !0;
  };
  for (const a of ["MediaStreams", "MediaAttachments"]) {
    if (!Object.prototype.hasOwnProperty.call(n, a)) continue;
    const o = mo(n[a]);
    o.changed && t(a, o.items);
  }
  if (Object.prototype.hasOwnProperty.call(n, "RequiredHttpHeaders")) {
    const a = Ba(n.RequiredHttpHeaders);
    !a || typeof a != "object" || Array.isArray(a) ? t("RequiredHttpHeaders", {}) : a !== n.RequiredHttpHeaders && t("RequiredHttpHeaders", a);
  }
  return {
    mediaSource: e,
    changed: r
  };
}
function po(n) {
  if (!n || typeof n != "object" || Array.isArray(n) || !Object.prototype.hasOwnProperty.call(n, "MediaSources")) return {
    payload: n,
    rewriteState: "not_needed"
  };
  const e = mo(n.MediaSources);
  let r = e.changed;
  const t = e.items.map((a) => {
    const o = zs(a);
    return o.changed && (r = !0), o.mediaSource;
  });
  return r ? {
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
function Ws(n, e = {}) {
  const r = po(n), t = r.payload;
  if (!t || typeof t != "object" || Array.isArray(t) || !Array.isArray(t.MediaSources)) return {
    payload: n,
    rewriteState: "not_needed"
  };
  const a = typeof e.buildProxyUrl == "function" ? e.buildProxyUrl : () => "";
  let o = r.rewriteState === "applied";
  const s = t.MediaSources.map((i) => {
    let c = i;
    const l = (p, g, h = {}) => {
      const y = Object.prototype.hasOwnProperty.call(c, p);
      h.onlyIfPresent === !0 && !y || c[p] === g && !(h.ensurePresent === !0 && !y) || (c === i && (c = { ...i }), c[p] = g, o = !0);
    }, u = String(i.DirectStreamUrl || "").trim(), d = String(i.Path || "").trim(), f = u || d, m = f ? a(f) : "";
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
function gl(n, e = {}) {
  if (!er(n)) return {
    kind: "invalid",
    reason: "invalid_representation"
  };
  const r = e.rewriteEnabled === !0 ? Ws(n.payload, { buildProxyUrl: e.buildProxyUrl }) : po(n.payload);
  if (r.rewriteState !== "applied") return {
    kind: "valid",
    representation: n,
    rewriteState: e.rewriteEnabled === !0 ? "not_needed" : "passthrough"
  };
  const t = JSON.stringify(r.payload), a = new TextEncoder().encode(t).byteLength, o = n.response;
  try {
    Promise.resolve(o.body?.cancel?.()).catch(() => {
    });
  } catch {
  }
  return {
    kind: "valid",
    representation: uo({
      response: new Response(t, {
        status: o.status,
        statusText: o.statusText,
        headers: fo(o.headers)
      }),
      bodyText: t,
      bodyBytes: a,
      payload: r.payload
    }),
    rewriteState: "applied"
  };
}
function Ma(n) {
  return new TextEncoder().encode(String(n || "")).byteLength;
}
var hl = class {
  constructor(n = {}) {
    if (!(n.entries instanceof Map)) throw new TypeError("PlaybackInfoCacheStore requires a Map");
    this.entries = n.entries, this.now = typeof n.now == "function" ? n.now : Date.now, this.maxEntries = Math.max(1, Number(n.maxEntries) || 1), this.maxEntryBytes = Math.max(1, Number(n.maxEntryBytes) || 1), this.maxTotalBytes = Math.max(1, Number(n.maxTotalBytes) || 1);
  }
  #e(n) {
    const e = Number(n?.status);
    if (!(e >= 200 && e < 300) || e === 204 || e === 205) return null;
    let r;
    try {
      r = new Headers(Array.isArray(n.headers) ? n.headers : []);
    } catch {
      return null;
    }
    if (!Ha(r.get("Content-Type"))) return null;
    const t = String(n.bodyText || ""), a = Ma(t);
    if (a > this.maxEntryBytes) return null;
    const o = $a(t);
    return o ? {
      headers: r,
      bodyText: t,
      bodyBytes: a,
      payload: o
    } : null;
  }
  cleanup(n = this.now()) {
    for (const [r, t] of this.entries) {
      const a = Number(t?.expiresAt) || 0;
      (a > 0 && a <= n || !this.#e(t)) && this.entries.delete(r);
    }
    for (; this.entries.size > this.maxEntries; ) {
      const r = this.entries.keys().next().value;
      if (!r) break;
      this.entries.delete(r);
    }
    let e = 0;
    for (const r of this.entries.values()) e += Ma(r?.bodyText);
    for (; this.entries.size > 0 && e > this.maxTotalBytes; ) {
      const r = this.entries.keys().next().value;
      if (!r) break;
      const t = this.entries.get(r);
      e -= Ma(t?.bodyText), this.entries.delete(r);
    }
  }
  set(n, e, r = {}) {
    if (!n || !er(e)) return !1;
    const t = e.response;
    if (!(t.status >= 200 && t.status < 300) || t.status === 204 || t.status === 205 || !Ha(t.headers.get("Content-Type"))) return !1;
    const a = Ma(e.bodyText);
    if (a > this.maxEntryBytes || !$a(e.bodyText)) return !1;
    const o = Math.max(0, Number(r.ttlMs) || 0);
    if (o <= 0) return !1;
    const s = fo(t.headers);
    s.delete("Set-Cookie");
    const i = this.now();
    return this.entries.delete(n), this.entries.set(n, {
      nodeName: String(r.nodeName || "").trim().toLowerCase(),
      nodeRevision: String(r.nodeRevision || "").trim(),
      playbackInfoRewrite: String(r.playbackInfoRewrite || "").trim(),
      status: t.status,
      statusText: t.statusText,
      headers: [...s.entries()],
      bodyText: e.bodyText,
      bodyBytes: a,
      storedAt: i,
      expiresAt: i + o
    }), this.cleanup(i), !0;
  }
  get(n) {
    if (!n) return null;
    this.cleanup();
    const e = this.entries.get(n);
    if (!e) return null;
    const r = this.#e(e);
    if (!r)
      return this.entries.delete(n), null;
    let t;
    try {
      t = new Response(r.bodyText, {
        status: Number(e.status) || 200,
        statusText: String(e.statusText || ""),
        headers: r.headers
      });
    } catch {
      return this.entries.delete(n), null;
    }
    const a = uo({
      response: t,
      bodyText: r.bodyText,
      bodyBytes: r.bodyBytes,
      payload: r.payload
    });
    return this.entries.delete(n), this.entries.set(n, {
      ...e,
      bodyBytes: r.bodyBytes
    }), {
      representation: a,
      metadata: e
    };
  }
};
function yl() {
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
    CleanupState: ol()
  };
}
var gt = rn(yl), _e = (n = null) => gt.get(n), tr = ul(), Ka = sl(), kn = il(), { runDataMutation: Qt, runTidyMutation: Sl } = ll(kn), ne = {
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
]) Object.defineProperty(ne, n, {
  enumerable: !0,
  configurable: !1,
  get: () => gt.current()[n],
  set: (e) => {
    gt.current()[n] = e;
  }
});
for (const n of ["ConfigCache", "RuntimeConfigCacheGeneration"]) Object.defineProperty(ne, n, {
  enumerable: !0,
  configurable: !1,
  get: () => Ka.current()[n],
  set: (e) => {
    Ka.current()[n] = e;
  }
});
var Qe = {
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
for (const n of ["CleanupState"]) Object.defineProperty(Qe, n, {
  enumerable: !0,
  configurable: !1,
  get: () => gt.current()[n],
  set: (e) => {
    gt.current()[n] = e;
  }
});
for (const n of ["KvDataMutationChain", "KvTidyMutationChain"]) Object.defineProperty(Qe, n, {
  enumerable: !0,
  configurable: !1,
  get: () => kn.current()[n],
  set: (e) => {
    kn.current()[n] = e;
  }
});
var J = {
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
function _l(n) {
  const e = {}, r = {};
  for (const t of n) for (const a of Object.keys(t)) r[a] = {
    enumerable: !0,
    configurable: !1,
    get: () => t[a],
    set: (o) => {
      t[a] = o;
    }
  };
  return Object.defineProperties(e, r);
}
var bl = _l([
  ne,
  Qe,
  J
]);
function ce(n, e = "unknown_error") {
  const r = String(n?.message || "").trim();
  return r || String(n || "").trim() || e;
}
function De(n, e = 500) {
  const r = Number(n);
  if (Number.isFinite(r) && r >= 400 && r <= 599) return Math.floor(r);
  const t = Number(e);
  return Number.isFinite(t) && t >= 400 && t <= 599 ? Math.floor(t) : 500;
}
function an(n) {
  if (!n || typeof n != "object") return !1;
  const e = String(n?.code || "").trim(), r = Number(n?.status);
  return !!e || Number.isFinite(r) && r >= 400 && r <= 599;
}
function El(n, e = {}) {
  const r = De(e?.status, 500), t = String(e?.code || "INTERNAL_ERROR").trim().toUpperCase() || "INTERNAL_ERROR", a = String(e?.message || "Server Error").trim() || "Server Error", o = an(n);
  return {
    status: o ? De(n?.status, r) : r,
    code: o && String(n?.code || t).trim().toUpperCase() || t,
    message: o && String(n?.message || a).trim() || a,
    details: o && n?.details !== void 0 ? n.details : e?.details !== void 0 ? e.details : null
  };
}
function Gs(n = "get", e = {}, r = "unknown_error") {
  const t = k(e) ? e : {}, a = {
    dependency: "KV",
    operation: String(n || "").trim().toLowerCase() === "list" ? "list" : "get",
    reason: String(r || "unknown_error").trim() || "unknown_error"
  }, o = String(t.key || "").trim(), s = String(t.prefix || "").trim();
  return o && (a.key = o), s && (a.prefix = s), Le("KV_READ_FAILED", "KV 读取异常", 503, a);
}
function go(n) {
  return an(n) && String(n?.code || "").trim().toUpperCase() === "KV_READ_FAILED" && String(n?.details?.dependency || "").trim().toUpperCase() === "KV";
}
function Rl(n, e = "INTERNAL_ERROR", r = "Server Error", t = "admin.read.kv_read_failed") {
  if (!go(n)) return n;
  const a = Le(e, r, 503, { ...k(n?.details) ? n.details : {} });
  return Fe(t, a, a.details), a;
}
function Rt(n, e, r, t = "admin.read") {
  if (!go(n)) return n;
  const a = String(n?.details?.operation || "").trim().toLowerCase() === "list" ? "list" : "get";
  return Rl(n, e, r, `${String(t || "admin.read").trim() || "admin.read"}.kv_${a}_failed`);
}
function Fe(n, e, r = null, t = "warn") {
  const a = t === "error" ? "error" : "warn", o = String(n || "runtime_failure").trim() || "runtime_failure", s = k(r) ? { ...r } : {}, i = String(e?.code || "").trim(), c = Number(e?.status);
  i && (s.errorCode = i), Number.isFinite(c) && (s.errorStatus = Math.floor(c)), Object.keys(s).length > 0 ? console[a](`[${o}] ${ce(e)}`, s) : console[a](`[${o}] ${ce(e)}`);
}
async function he(n, e, r = null, t = null) {
  try {
    return await n;
  } catch (a) {
    return Fe(e, a, r), t;
  }
}
function Le(n = "CONFIG_INVALID", e = "配置无效", r = 400, t = null) {
  const a = new Error(String(e || "配置无效"));
  return a.code = String(n || "CONFIG_INVALID"), a.status = De(r, 400), t != null && (a.details = t), a;
}
function rr(n) {
  return n ? n.name === "AbortError" ? !0 : String(n.message || "").toLowerCase().includes("abort") : !1;
}
var js = 4 * 1024 * 1024, nn = 64 * 1024, Vs = Object.freeze({
  "Referrer-Policy": "origin-when-cross-origin",
  "Strict-Transport-Security": "max-age=15552000; preload",
  "X-Frame-Options": "SAMEORIGIN",
  "X-Content-Type-Options": "nosniff",
  "X-XSS-Protection": "1; mode=block"
}), sa = Object.freeze({
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS, HEAD",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Emby-Authorization, X-Emby-Token, X-Emby-Client, X-Emby-Device-Id, X-Emby-Device-Name, X-Emby-Client-Version, X-MediaBrowser-Authorization, X-MediaBrowser-Token"
});
function Hr(n, e) {
  const r = n.get("Vary");
  if (!r) {
    n.set("Vary", e);
    return;
  }
  const t = r.split(",").map((a) => a.trim()).filter(Boolean);
  t.includes(e) || t.push(e), n.set("Vary", t.join(", "));
}
function we(n) {
  return Object.entries(Vs).forEach(([e, r]) => n.set(e, r)), n;
}
function ee(n) {
  return Array.isArray(n) || k(n) ? JSON.stringify(n) : n === void 0 ? "" : JSON.stringify(n);
}
var H = () => Date.now(), qs = (n) => new Promise((e) => setTimeout(e, Math.max(0, Number(n) || 0)));
function Tl(n) {
  let e = !1, r = () => {
  };
  const t = setTimeout(() => {
    e || (e = !0, r(!0));
  }, Math.max(0, Number(n) || 0));
  return {
    promise: new Promise((a) => {
      r = a;
    }),
    cancel() {
      return e ? !1 : (e = !0, clearTimeout(t), r(!1), !0);
    }
  };
}
var Al = Object.freeze({
  JwtExpiry: 3600 * 24 * 30,
  LoginLockDuration: 900,
  MaxLoginAttempts: 5
}), Lt = Object.freeze({
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
}), Cl = Object.freeze({
  EnableHostPrefixProxy: !1,
  MultiLinkCopyPanelEnabled: !1,
  DashboardShowD1WriteHotspot: !1,
  DashboardShowKvD1Status: !1,
  UiRadiusPx: 10,
  NodePanelPingAutoSort: !1
}), wl = Object.freeze({
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
}), Ll = Object.freeze({
  ScheduledLeaseMinMs: 30 * 1e3,
  ScheduledLeaseMs: 300 * 1e3,
  ScheduleUtcOffsetMinutes: 480,
  TgDailyReportSummaryEnabled: !1,
  TgDailyReportKvEnabled: !1,
  TgDailyReportD1Enabled: !1,
  TgDailyReportClockTimes: ["09:00"]
}), ke = Object.freeze({
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
}), Dl = Object.freeze({
  DnsHistoryLimit: 5,
  DnsIpProbeCacheTtlSec: 600,
  DnsIpProbeTimeoutMs: 2500,
  DnsIpProbeConcurrency: 4,
  DnsIpWorkspaceSyncProbeLimit: 2,
  DnsIpSourceConcurrency: 4,
  DnsIpSourceFetchMaxBytes: 2 * 1024 * 1024,
  DnsIpSourceIpLimit: 5
}), Nl = Object.freeze({
  CfQuotaPlanCacheMinutes: 60,
  CfQuotaPlanOverride: ""
}), Il = Object.freeze({
  AssetHash: "v19.4",
  Version: "19.4"
}), Ml = Object.freeze({
  ...Al,
  ...Lt,
  ...Cl,
  ...wl,
  ...Ll,
  ...ke,
  ...Dl,
  ...Nl,
  ...Il
}), F = Object.freeze({ Defaults: Ml });
function ze(n) {
  return ue(n, F.Defaults.ScheduleUtcOffsetMinutes, -720, 840);
}
function da(n = "", e = "00:00") {
  const r = String(e || "00:00").trim() || "00:00", t = String(n || "").trim().match(/^(\d{1,2}):(\d{1,2})$/);
  if (!t) return r;
  const a = Number(t[1]), o = Number(t[2]);
  return !Number.isInteger(a) || a < 0 || a > 23 || !Number.isInteger(o) || o < 0 || o > 59 ? r : `${String(a).padStart(2, "0")}:${String(o).padStart(2, "0")}`;
}
function At(n = [], e = []) {
  const r = Array.isArray(n) ? n : String(n || "").split(/[\r\n,]+/), t = [], a = /* @__PURE__ */ new Set();
  for (const o of r) {
    const s = da(o, "");
    !s || a.has(s) || (a.add(s), t.push(s));
  }
  return t.sort((o, s) => Nr(o) - Nr(s)), t.length ? t : [...new Set((Array.isArray(e) ? e : [e]).map((o) => da(o, "")).filter(Boolean))].sort((o, s) => Nr(o) - Nr(s));
}
function Nr(n = "") {
  const e = da(n, "");
  if (!e) return -1;
  const [r, t] = e.split(":");
  return (Number(r) || 0) * 60 + (Number(t) || 0);
}
function Pl(n = "") {
  const e = String(n || "").trim().match(/^(\d{4}-\d{2}-\d{2})\s+(\d{2}:\d{2})$/);
  return e ? {
    dateKey: e[1],
    clockTime: da(e[2], "")
  } : {
    dateKey: "",
    clockTime: ""
  };
}
function xl(n, e = F.Defaults.ScheduleUtcOffsetMinutes) {
  const r = ze(e), t = n.getUTCFullYear(), a = String(n.getUTCMonth() + 1).padStart(2, "0"), o = String(n.getUTCDate()).padStart(2, "0"), s = String(n.getUTCHours()).padStart(2, "0"), i = String(n.getUTCMinutes()).padStart(2, "0"), c = String(n.getUTCSeconds()).padStart(2, "0"), l = String(n.getUTCMilliseconds()).padStart(3, "0"), u = r >= 0 ? "+" : "-", d = Math.abs(r);
  return `${t}-${a}-${o}T${s}:${i}:${c}.${l}${u}${String(Math.floor(d / 60)).padStart(2, "0")}:${String(d % 60).padStart(2, "0")}`;
}
function Ra(n = /* @__PURE__ */ new Date(), e = F.Defaults.ScheduleUtcOffsetMinutes) {
  const r = ze(e), t = r * 60 * 1e3, a = n instanceof Date ? new Date(n.getTime()) : new Date(n), o = a.getTime() + t, s = new Date(o), i = s.getUTCFullYear(), c = String(s.getUTCMonth() + 1).padStart(2, "0"), l = String(s.getUTCDate()).padStart(2, "0"), u = String(s.getUTCHours()).padStart(2, "0"), d = String(s.getUTCMinutes()).padStart(2, "0"), f = String(s.getUTCSeconds()).padStart(2, "0"), m = String(s.getUTCMilliseconds()).padStart(3, "0"), p = Number(u), g = Number(d);
  return {
    now: a,
    shiftedDate: s,
    utcOffsetMinutes: r,
    offsetLabel: ho(r),
    dateKey: `${i}-${c}-${l}`,
    clockTime: `${u}:${d}`,
    hour: p,
    minute: g,
    second: Number(f),
    millisecond: Number(m),
    minuteOfDay: p * 60 + g,
    localIso: xl(s, r)
  };
}
function jo(n = /* @__PURE__ */ new Date(), e = F.Defaults.ScheduleUtcOffsetMinutes) {
  return Ra(n, e).localIso;
}
function Dt(n = /* @__PURE__ */ new Date(), e = F.Defaults.ScheduleUtcOffsetMinutes) {
  return Ra(n, e);
}
function pt(n = /* @__PURE__ */ new Date(), e = F.Defaults.ScheduleUtcOffsetMinutes, r = "") {
  const t = Ra(n, e), a = da(r || t.clockTime, t.clockTime), o = Nr(a), s = Date.UTC(t.shiftedDate.getUTCFullYear(), t.shiftedDate.getUTCMonth(), t.shiftedDate.getUTCDate()) - t.utcOffsetMinutes * 60 * 1e3, i = s + 1440 * 60 * 1e3 - 1, c = s + Math.max(0, o) * 60 * 1e3;
  return {
    ...t,
    normalizedClockTime: a,
    plannedMinuteOfDay: o,
    plannedTs: c,
    plannedSlotKey: `${t.dateKey} ${a}`,
    startTs: s,
    endTs: i
  };
}
function Ol(n = /* @__PURE__ */ new Date(), e = F.Defaults.ScheduleUtcOffsetMinutes) {
  const r = Dt(n, e);
  return {
    ...r,
    slotKey: `${r.dateKey} ${r.clockTime}`
  };
}
function ho(n = F.Defaults.ScheduleUtcOffsetMinutes) {
  const e = ze(n), r = e >= 0 ? "+" : "-", t = Math.abs(e);
  return `UTC${r}${String(Math.floor(t / 60)).padStart(2, "0")}:${String(t % 60).padStart(2, "0")}`;
}
function vl(n = {}, e = "") {
  const r = n?.fixedQueue && typeof n.fixedQueue == "object" ? n.fixedQueue : {};
  let t = String(r.localDateKey || "").trim(), a = At(r.executedSlots || [], []);
  if (!t) {
    const o = Pl(n?.lastPlannedSlot || "");
    o.dateKey && o.dateKey === e && (t = o.dateKey, a = At([...a, o.clockTime], []));
  }
  return !e || t !== e ? {
    localDateKey: e,
    executedSlots: []
  } : {
    localDateKey: t,
    executedSlots: a
  };
}
function Fl(n = {}, e = [], r = F.Defaults.ScheduleUtcOffsetMinutes, t = /* @__PURE__ */ new Date()) {
  const a = Ra(t, r), o = At(e, []), s = vl(n, a.dateKey);
  if (!o.length) return {
    due: !1,
    context: a,
    normalizedClockTimes: o,
    fixedQueue: s,
    dueSlots: [],
    reason: "no_clock_times_configured"
  };
  const i = new Set(At(s.executedSlots || [], [])), c = o.filter((u) => Nr(u) <= a.minuteOfDay), l = c.filter((u) => !i.has(u));
  return l.length ? {
    due: !0,
    context: a,
    normalizedClockTimes: o,
    fixedQueue: s,
    dueSlots: l,
    reason: "clock_slots_due"
  } : {
    due: !1,
    context: a,
    normalizedClockTimes: o,
    fixedQueue: s,
    dueSlots: [],
    reason: c.length ? "slot_already_processed" : "time_not_matched"
  };
}
function ar(n = "") {
  const e = String(n || "").trim().toLowerCase();
  return e === "inherit" ? "inherit" : e === "emby" ? "emby" : e === "jellyfin" ? "jellyfin" : e === "passthrough" ? "passthrough" : "auto";
}
function Ir(n = "") {
  const e = String(n || "").trim().toLowerCase();
  return e === "inherit" ? "inherit" : e === "forward" ? "forward" : e === "strip" ? "strip" : e === "disable" || e === "none" ? "disable" : "forward";
}
function Mr(n = "") {
  const e = String(n || "").trim().toLowerCase();
  return e === "inherit" ? "inherit" : e === "rewrite" ? "rewrite" : e === "passthrough" ? "passthrough" : "inherit";
}
function nr(n = "") {
  return String(n || "").trim().toLowerCase() === "host_prefix" ? "host_prefix" : "kv_route";
}
function Ze(n = "") {
  return nr(n) === "host_prefix";
}
function Xs(n = "") {
  const e = String(n || "").trim().toLowerCase();
  return e === "emby" ? "emby" : e === "jellyfin" ? "jellyfin" : e === "passthrough" ? "passthrough" : "auto";
}
function zt(n = "") {
  return String(n || "").trim().toLowerCase() === "rewrite" ? "rewrite" : F.Defaults.DefaultPlaybackInfoMode;
}
function yo(n = "") {
  const e = String(n || "").trim().toLowerCase();
  return e === "strip" ? "strip" : e === "disable" || e === "none" ? "disable" : "forward";
}
function $r(n) {
  return ue(n, F.Defaults.DnsIpSourceIpLimit, 1, 1e3);
}
function on(n = "") {
  const e = String(n || "").trim().toLowerCase();
  return e === "direct" ? "direct" : e === "proxy" ? "proxy" : "inherit";
}
function Br(n = {}) {
  return on(n?.mainVideoStreamMode ?? n?.wangpanDirectMode ?? n?.wangpanMode);
}
function Kr(n = [], e = "") {
  const r = Array.isArray(n) ? n : String(n || "").split(/[,，\r\n]+/), t = [], a = /* @__PURE__ */ new Set();
  for (const o of [...r, e]) {
    const s = String(o || "").trim().slice(0, 24), i = s.toLowerCase();
    if (!(!s || a.has(i)) && (a.add(i), t.push(s), t.length >= 20))
      break;
  }
  return t;
}
var Hn = /\b(?:(?:(?:25[0-5]|2[0-4]\d|1?\d?\d)\.){3}(?:25[0-5]|2[0-4]\d|1?\d?\d)|[0-9a-f:]{2,})\b/gi, Ys = {
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
}, Vo = Object.freeze((() => {
  const n = {};
  for (const e of Object.values(Ys)) {
    const r = String(e?.countryCode || "").trim().toUpperCase(), t = String(e?.countryName || "").trim();
    !r || !t || n[r] || (n[r] = t);
  }
  return n.CN = n.CN || "中国", n.HK = n.HK || "中国香港", n.MO = n.MO || "中国澳门", n.TW = n.TW || "中国台湾", n;
})()), ea = null;
function Ta(n = "") {
  const e = String(n || "").trim();
  if (!e || !/^(?:\d{1,3}\.){3}\d{1,3}$/.test(e)) return !1;
  const r = e.split(".");
  return r.length === 4 && r.every((t) => {
    const a = Number(t);
    return Number.isInteger(a) && a >= 0 && a <= 255;
  });
}
function Ul(n = "") {
  if (!Ta(n)) return !1;
  const [e = 0, r = 0] = String(n || "").trim().split(".").map((t) => Number(t));
  return e === 10 || e === 127 || e === 169 && r === 254 || e === 172 && r >= 16 && r <= 31 ? !0 : e === 192 && r === 168;
}
function sn(n = "") {
  const e = String(n || "").trim();
  if (!e || !e.includes(":") || /\s/.test(e)) return !1;
  try {
    return new URL(`http://[${e}]/`), !0;
  } catch {
    return !1;
  }
}
function Js(n = "") {
  return String(n || "").trim().toUpperCase() === "IPV6" ? "IPv6" : "IPv4";
}
function Ye(n = "") {
  return sn(n) ? "IPv6" : Ta(n) ? "IPv4" : "";
}
function So(n = "", e = {}) {
  const r = String(n || ""), t = /* @__PURE__ */ new Set(), a = [], o = Number(e?.limit), s = Number.isFinite(o) && o > 0 ? Math.max(1, Math.floor(o)) : Number.POSITIVE_INFINITY, i = (l) => {
    const u = String(l || "").trim();
    if (!u) return !1;
    const d = Ye(u);
    if (!d) return !1;
    const f = u.toLowerCase();
    return t.has(f) ? !1 : (t.add(f), a.push({
      ip: u,
      ipType: d
    }), a.length >= s);
  };
  Hn.lastIndex = 0;
  let c = null;
  for (; (c = Hn.exec(r)) !== null && !i(c[0]); ) ;
  return a;
}
function kl(n = null) {
  const e = Array.isArray(n?.Answer) ? n.Answer : [], r = /* @__PURE__ */ new Set(), t = [];
  for (const a of e) {
    const o = String(a?.data || "").trim(), s = Ye(o);
    if (!s) continue;
    const i = o.toLowerCase();
    r.has(i) || (r.add(i), t.push({
      ip: o,
      ipType: s
    }));
  }
  return t;
}
function Tn(n = "") {
  return String(n || "").replace(/&nbsp;/gi, " ").replace(/&amp;/gi, "&").replace(/&lt;/gi, "<").replace(/&gt;/gi, ">").replace(/&quot;/gi, '"').replace(/&#39;/gi, "'");
}
function Hl(n = "") {
  const e = /* @__PURE__ */ new Map(), r = String(n || ""), t = r.match(/\[[0-9a-f:]{2,}\]/gi) || [];
  for (const o of t) {
    const s = String(o || "").replace(/^\[|\]$/g, "").trim();
    Ye(s) && e.set(s.toLowerCase(), s);
  }
  const a = r.match(Hn) || [];
  for (const o of a) {
    const s = String(o || "").trim();
    Ye(s) && e.set(s.toLowerCase(), s);
  }
  return [...e.values()];
}
function $l(n = "") {
  const e = String(n || "").trim().toLowerCase();
  return e === "联通" ? "联通" : e === "电信" ? "电信" : e === "移动" ? "移动" : e === "多线" ? "多线" : e === "ipv6" ? "ipv6" : "";
}
function qo(n = "", e = "") {
  const r = $l(e);
  return r ? String(n || "").trim().toLowerCase() === r.toLowerCase() : !0;
}
function Bl(n = "", e = "") {
  const r = /* @__PURE__ */ new Map(), t = (s, i = "") => {
    const c = String(s || "").trim(), l = Ye(c);
    if (!l || Ul(c)) return;
    const u = c.toLowerCase(), d = zr(i), f = r.get(u);
    if (!f) {
      r.set(u, {
        ip: c,
        ipType: l,
        lineLabel: d
      });
      return;
    }
    !zr(f?.lineLabel) && d && r.set(u, {
      ...f,
      lineLabel: d
    });
  }, a = String(n || ""), o = a.match(/<tr\b[^>]*>[\s\S]*?<\/tr>/gi) || [];
  for (const s of o) {
    const i = s.match(/<t[dh]\b[^>]*>[\s\S]*?<\/t[dh]>/gi) || [];
    if (i.length < 3) continue;
    const c = Tn(String(i[1] || "").replace(/<[^>]+>/g, " ")).replace(/\s+/g, " ").trim();
    if (!qo(c, e)) continue;
    const l = Hl(Tn(String(i[2] || "").replace(/<[^>]+>/g, " "))).find((u) => Ye(u)) || "";
    l && t(l, c);
  }
  if (!r.size) {
    const s = Tn(a.replace(/<[^>]+>/g, `
`)), i = /(?:^|\n)\s*(?:\d+\s+)?(电信|联通|移动|多线|ipv6)\s+((?:(?:25[0-5]|2[0-4]\d|[01]?\d\d?)\.){3}(?:25[0-5]|2[0-4]\d|[01]?\d\d?)|(?:[a-f0-9]{1,4}:){2,}[a-f0-9:]{1,39})/gi;
    let c = null;
    for (; (c = i.exec(s)) !== null; )
      qo(c[1], e) && t(c[2], c[1]);
  }
  return [...r.values()];
}
function Kl(n = "", e = {}) {
  return So(n, e);
}
function zl(n = "") {
  const e = String(n || "").trim().toUpperCase(), r = Ys[e];
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
function Wl(n = "") {
  const e = String(n || "").trim().toUpperCase();
  if (!e || e === "UNKNOWN") return "未知";
  if (Vo[e]) return Vo[e];
  try {
    if (ea === null && (ea = typeof Intl?.DisplayNames == "function" ? new Intl.DisplayNames(["zh-CN"], { type: "region" }) : !1), ea && typeof ea.of == "function") {
      const r = String(ea.of(e) || "").trim();
      if (r) return r;
    }
  } catch {
  }
  return e;
}
function Qs(n = "") {
  const e = String(n || "").trim();
  if (!e) return "";
  const r = e.match(/-([A-Za-z]{3,4})$/);
  return r ? String(r[1] || "").trim().toUpperCase() : "";
}
function Gl(n = "") {
  return `dns-ip-source-${ie(n || `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`)}`;
}
function St(n = "") {
  return String(n || "").trim().toLowerCase() === "domain" ? "domain" : "url";
}
var Zs = Object.freeze([Object.freeze({
  id: "all",
  label: "麒麟优选",
  sourceType: "url",
  url: "https://api.uouin.com/cloudflare.html"
}), Object.freeze({
  id: "preferred",
  label: "CF-SPEED-DNS优选",
  sourceType: "url",
  url: "https://raw.githubusercontent.com/ZhiXuanWang/cf-speed-dns/refs/heads/main/ipTop10.html"
})]), ei = Object.freeze([
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
]), jl = Object.freeze([
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
]), Vl = Object.freeze([Object.freeze({
  label: "VPS789 优选IP",
  url: "https://vps789.com/cfip/"
}), Object.freeze({
  label: "Wetest IPv4 优选",
  url: "https://www.wetest.vip/page/cloudflare/address_v4.html"
})]);
function ql(n = "") {
  const e = String(n || "").trim().toLowerCase();
  return e === "builtin" ? "builtin" : e === "preset" ? "preset" : "custom";
}
function ti(n = "") {
  const e = String(n || "").trim().toLowerCase();
  return e === "preferred" ? "preferred" : e === "all" ? "all" : "";
}
function Xl(n = "") {
  return String(n || "").trim().toLowerCase().replace(/[^a-z0-9_:-]+/g, "_");
}
function Yl(n = "") {
  const e = ti(n);
  return Zs.find((r) => r.id === e) || null;
}
function Jl(n = "") {
  const e = Xl(n);
  return e && ei.find((r) => r.id === e) || null;
}
function Er() {
  return {
    builtInSourceOptions: Zs.map((n) => ({
      id: n.id,
      label: n.label,
      sourceType: n.sourceType,
      value: "domain" in n ? n.domain : n.url
    })),
    presetList: ei.map((n) => ({
      id: n.id,
      label: n.label,
      sourceType: n.sourceType,
      value: "domain" in n ? n.domain : n.url
    })),
    preferredDomainLinks: jl.map((n) => ({ ...n })),
    preferredIpLinks: Vl.map((n) => ({ ...n }))
  };
}
function zr(n = "") {
  const e = String(n || "").trim().toLowerCase();
  return e.includes("联通") ? "联通" : e.includes("电信") ? "电信" : e.includes("移动") ? "移动" : e.includes("多线") ? "多线" : e.includes("ipv6") ? "ipv6" : "";
}
function ri(n = {}) {
  const e = ql(n?.sourceKind || n?.source_kind || ""), r = e === "builtin" ? Yl(n?.builtinId || n?.builtin_id || n?.presetId || n?.preset_id || n?.name) : null, t = e === "preset" ? Jl(n?.presetId || n?.preset_id || n?.builtinId || n?.builtin_id || n?.name) : null, a = r || t || null, o = St(a?.sourceType || n?.sourceType || n?.source_type || ""), s = a && "url" in a ? a.url : "", i = a && "domain" in a ? a.domain : "", c = String(s || n?.url || "").trim(), l = re(i || n?.domain || ""), u = String(n?.name || a?.label || "").trim();
  return {
    sourceKind: e,
    builtinId: r?.id || "",
    presetId: t?.id || "",
    name: u,
    sourceType: o,
    url: c,
    domain: l,
    resolvedLabel: String(a?.label || "").trim()
  };
}
function ai(n = {}) {
  const e = ri(n);
  return St(e.sourceType) === "domain" ? re(e.domain || "") : String(e.url || "").trim();
}
function or(n = {}) {
  return !!ai(n);
}
function fr(n = {}, e = {}) {
  const r = String(n?.ip || n?.content || "").trim(), t = Ye(r);
  if (!r || !t) return null;
  const a = String(e.updatedAt || (/* @__PURE__ */ new Date()).toISOString()), o = String(n?.sourceKind || n?.source_kind || e.sourceKind || "manual").trim().toLowerCase() || "manual", s = String(n?.sourceLabel || n?.source_label || e.sourceLabel || "").trim(), i = zr(n?.lineLabel || n?.line_label || e.lineLabel || ""), c = String(n?.remark || "").trim();
  return {
    id: String(n?.id || `dns-ip-${ie(r.toLowerCase())}`),
    ip: r,
    ipType: t,
    sourceKind: o,
    sourceLabel: s,
    lineLabel: i,
    remark: c,
    createdAt: String(n?.createdAt || n?.created_at || e.createdAt || a),
    updatedAt: a
  };
}
function Ct(n = {}, e = 0) {
  const r = (/* @__PURE__ */ new Date()).toISOString(), t = ri(n), a = t.sourceKind, o = St(t.sourceType), s = String(t.builtinId || n?.builtinId || n?.builtin_id || "").trim(), i = String(t.presetId || n?.presetId || n?.preset_id || "").trim(), c = String(t.resolvedLabel || "").trim(), l = String(t.url || "").trim(), u = re(t.domain || ""), d = o === "domain" ? u : l, f = String(n?.name || c || "").trim(), m = n?.enabled, p = m == null ? !0 : !(m === !1 || m === 0 || String(m).trim() === "0");
  return {
    id: String(n?.id || Gl(`${a}|${s}|${i}|${o}|${d}|${e}`)),
    name: f || c || `抓取源 ${Number(e) + 1}`,
    url: l,
    domain: u,
    sourceType: o,
    sourceKind: a,
    presetId: i,
    builtinId: s,
    enabled: p,
    sortOrder: Math.max(0, Number.parseInt(String(n?.sortOrder ?? n?.sort_order ?? e), 10) || 0),
    ipLimit: $r(n?.ipLimit ?? n?.ip_limit),
    lastFetchAt: String(n?.lastFetchAt || n?.last_fetch_at || ""),
    lastFetchStatus: String(n?.lastFetchStatus || n?.last_fetch_status || ""),
    lastFetchCount: Math.max(0, Number(n?.lastFetchCount ?? n?.last_fetch_count) || 0),
    createdAt: String(n?.createdAt || n?.created_at || r),
    updatedAt: String(n?.updatedAt || n?.updated_at || r)
  };
}
function mr(n = []) {
  const e = [], r = /* @__PURE__ */ new Map();
  for (const t of Array.isArray(n) ? n : []) {
    const a = fr(t);
    if (!a) continue;
    const o = String(a.ip || "").trim().toLowerCase();
    if (!o) continue;
    const s = r.get(o);
    if (s === void 0) {
      r.set(o, e.length), e.push(a);
      continue;
    }
    const i = e[s];
    i && !zr(i.lineLabel) && zr(a.lineLabel) && (e[s] = {
      ...i,
      lineLabel: a.lineLabel
    });
  }
  return e;
}
function Ql(n = {}) {
  const e = fr(n);
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
function _o(n = []) {
  return mr(n).map((e) => Ql(e)).filter(Boolean);
}
function cn(n = "") {
  const e = String(n || "").trim().toLowerCase();
  return e === "success" ? "success" : e === "failed" ? "failed" : "empty";
}
function ni(n = {}, e = {}) {
  const r = Ct(e), t = mr(n?.items || []).slice(0, $r(r?.ipLimit)), a = cn(n?.status || (t.length ? "success" : "empty"));
  return {
    id: String(n?.id || r?.id || ""),
    name: String(n?.name || r?.name || ""),
    sourceType: St(n?.sourceType || r?.sourceType || ""),
    status: a,
    count: Math.max(0, Number(n?.count) || t.length),
    items: t,
    error: a === "failed" ? String(n?.error || "") : "",
    lastFetchAt: String(n?.lastFetchAt || (/* @__PURE__ */ new Date()).toISOString())
  };
}
function oi(n = []) {
  return (Array.isArray(n) ? n : []).map((e) => {
    const r = ni(e, e), t = _o(r?.items || []);
    return {
      id: String(r?.id || ""),
      name: String(r?.name || ""),
      sourceType: St(r?.sourceType || ""),
      status: cn(r?.status),
      count: Math.max(0, Number(r?.count) || t.length),
      items: t,
      error: String(r?.error || ""),
      lastFetchAt: String(r?.lastFetchAt || "")
    };
  });
}
function Zl(n = []) {
  const e = Array.isArray(n) ? n : [];
  return e.length ? e.some((r) => cn(r?.status) !== "failed") : !0;
}
function za(n) {
  const e = Number(n) || 0;
  return !Number.isFinite(e) || e <= 0 ? "" : new Date(e).toISOString();
}
function va(n = [], e = F.Defaults.DnsIpSourceFetchMaxBytes) {
  return ie(ee({
    maxBytes: ue(e, F.Defaults.DnsIpSourceFetchMaxBytes, 1024, 8 * 1024 * 1024),
    enabledSources: (Array.isArray(n) ? n : []).map((r, t) => Ct(r, t)).filter((r) => r.enabled === !0 && or(r)).map((r) => ({
      id: String(r.id || ""),
      name: String(r.name || ""),
      sourceType: St(r.sourceType),
      target: ai(r),
      ipLimit: $r(r.ipLimit),
      enabled: r.enabled !== !1
    }))
  }));
}
function eu(n = "") {
  return String(n || "").trim().toLowerCase() === "shared_snapshot" ? "shared_snapshot" : "local_pool";
}
function si(n = []) {
  const e = [], r = /* @__PURE__ */ new Set();
  for (const t of Array.isArray(n) ? n : []) {
    const a = String(t?.ip || t || "").trim();
    if (!Ye(a)) continue;
    const o = a.toLowerCase();
    r.has(o) || (r.add(o), e.push(a));
  }
  return {
    normalizedIps: e,
    deleteKeySet: r
  };
}
function Xo(n = [], e = /* @__PURE__ */ new Set()) {
  const r = [], t = [];
  for (const a of mr(n)) {
    const o = String(a?.ip || "").trim();
    if (o) {
      if (e.has(o.toLowerCase())) {
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
function tu(n = {}, e = []) {
  const { deleteKeySet: r } = si(e), t = mr(n?.items || []), a = Array.isArray(n?.sourceResults) ? n.sourceResults : [];
  if (!r.size) return {
    deletedCount: 0,
    deletedIps: [],
    items: t,
    sourceResults: a
  };
  const { keptItems: o, removedItems: s } = Xo(t, r), i = new Set(s.map((l) => String(l?.ip || "").trim().toLowerCase()).filter(Boolean)), c = a.map((l) => {
    const { keptItems: u } = Xo(l?.items || [], i), d = cn(l?.status) === "failed" ? "failed" : u.length ? "success" : "empty";
    return {
      id: String(l?.id || ""),
      name: String(l?.name || ""),
      sourceType: St(l?.sourceType || l?.source_type || ""),
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
function Fa(n = "") {
  const e = String(n || "").trim().toLowerCase();
  return e === "ok" ? "ok" : e === "pending" ? "pending" : e === "cf_header_missing" ? "cf_header_missing" : e === "non_cloudflare" ? "non_cloudflare" : e === "timeout" ? "timeout" : "network_error";
}
function An(n = []) {
  const e = Array.isArray(n) ? n : [], r = /* @__PURE__ */ new Set(), t = /* @__PURE__ */ new Set();
  let a = 0, o = 0;
  for (const s of e) {
    Js(s?.ipType || s?.ip_type || s?.type || "") === "IPv6" ? o += 1 : a += 1;
    const i = String(s?.countryCode || s?.country_code || "").trim().toUpperCase(), c = String(s?.coloCode || s?.colo_code || "").trim().toUpperCase();
    i && r.add(i), c && t.add(c);
  }
  return {
    ipCount: e.length,
    ipv4Count: a,
    ipv6Count: o,
    countryCount: r.size,
    coloCount: t.size
  };
}
function ru(n = [], e = []) {
  const r = Array.isArray(n) ? n : [], t = Array.isArray(e) ? e : [];
  return {
    currentHost: An(r),
    sharedPool: An(t),
    combined: An([...r, ...t])
  };
}
function au(n = "") {
  const e = String(n || "").trim().toLowerCase();
  if (!e) return "";
  const r = e.endsWith(".") ? e.slice(0, -1) : e;
  return !r || r.length > 253 || r.endsWith(".") || /\s|[:\/@*?#\\]/.test(r) || Ta(r) || sn(r) || r.split(".").some((t) => !Aa(t)) ? "" : r;
}
function Ve(n) {
  return au(n?.HOST);
}
function Wr(n) {
  return re(n?.LEGACY_HOST);
}
function nu(n) {
  const e = Ve(n), r = Wr(n), t = bo(r, e);
  return t?.prefix ? {
    name: String(t.prefix || "").trim().toLowerCase(),
    reservedBy: r,
    reason: "legacy_host",
    legacyHost: r,
    host: e
  } : null;
}
function fa(n, e) {
  const r = re(n), t = re(e);
  return !r || !t ? !1 : r === t || r.endsWith(`.${t}`);
}
function Aa(n = "") {
  const e = String(n || "").trim().toLowerCase();
  return !e || e.length > 63 ? !1 : /^[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?$/.test(e);
}
function Wt(n = "") {
  const e = String(n || "").trim().toLowerCase().replace(/\.+$/, "");
  return !e || e.length > 253 || /\s|[:/@*]/.test(e) || Ta(e) || sn(e) || e.split(".").some((r) => !Aa(r)) ? "" : e;
}
function ii(n = "") {
  const e = String(n || "").trim();
  return !e || Wt(e) ? "" : "CNAME 指向必须是合法主机名，不能包含协议、端口、路径、通配符、空格或 IP 地址";
}
function ou(n = "", e = "defaultHostPrefixCnameTarget") {
  const r = ii(n);
  if (r)
    throw Le("HOST_PREFIX_CNAME_TARGET_INVALID", r, 400, {
      field: e,
      value: String(n || "").trim()
    });
}
function Wa(n = null, e = {}, r = "") {
  return Wt(n?.hostPrefixCnameTarget) || Wt(e?.defaultHostPrefixCnameTarget) || re(r);
}
function bo(n = "", e = "") {
  const r = re(n), t = re(e);
  if (!r || !t || r === t) return null;
  const a = `.${t}`;
  if (!r.endsWith(a)) return null;
  const o = r.slice(0, -a.length);
  return !o || o.includes(".") || !Aa(o) ? null : {
    hostname: r,
    host: t,
    prefix: o
  };
}
function ci(n) {
  const e = String(n || "").trim();
  if (!e) return null;
  const r = e.indexOf("/"), t = r === -1 ? e : e.slice(0, r), a = r === -1 ? "" : e.slice(r), o = co(t);
  return o ? {
    ...o,
    path: a,
    pattern: e
  } : null;
}
function Eo(n, e = {}) {
  const r = String(e.path || "");
  let t = 0;
  return e.wildcard || (t += 100), n.includes(".workers.dev") && (t -= 20), r === "/" || r === "/*" ? t += 20 : r.endsWith("*") ? t += 10 : r && (t += 4), t += n.split(".").length * 4, t -= Math.min(r.length, 30), t;
}
var su = "https://admin-local-index.invalid", iu = "local-", cu = "sys:admin_index_upload:v1:", lu = "sys:admin_index_active:v2";
function Pr(n = "") {
  const e = String(n || "").trim();
  if (!e) return "";
  try {
    const r = new URL(e);
    return ["http:", "https:"].includes(r.protocol) ? r.toString() : "";
  } catch {
    return "";
  }
}
function uu(n = "") {
  const e = String(n || "").trim();
  return !(!e || /[\x00-\x20~^:?*[\\\]]/.test(e) || e.includes("..") || e.includes("@{") || e.includes("//") || e.startsWith("/") || e.endsWith("/") || e.endsWith(".") || e.endsWith(".lock"));
}
function ut(n = "") {
  const e = String(n || "").trim();
  return uu(e) ? e : "";
}
function Tt(n = "") {
  const e = String(n || "").trim().toLowerCase();
  return /^[a-f0-9]{64}$/.test(e) ? e : "";
}
function Gr(n = "") {
  const e = Tt(n);
  return e ? `${su}/${e}/index.html` : "";
}
function et(n = "") {
  const e = Pr(n);
  if (!e) return "";
  try {
    const r = new URL(e);
    return r.origin !== "https://admin-local-index.invalid" || r.search || r.hash ? "" : Tt(r.pathname.match(/^\/([a-f0-9]{64})\/index\.html$/i)?.[1] || "");
  } catch {
    return "";
  }
}
function Ro(n = "") {
  const e = Tt(n);
  return e ? `${iu}${e}` : "";
}
function du(n = "") {
  const e = String(n || "").trim().toLowerCase();
  return e.startsWith("local-") ? Tt(e.slice(6)) : "";
}
function dt(n = null, e = {}) {
  const r = Pr((k(e) ? e : {}).indexUrl), t = et(r), a = !!t, o = a ? Gr(t) : "";
  return {
    effectiveRef: t,
    effectiveRefType: a ? "local_upload" : "",
    configIndexUrl: r,
    envIndexUrl: "",
    indexUrl: o,
    persistedIndexUrl: o,
    indexUrlSource: a ? "local_upload" : "unset",
    isLocalUpload: a,
    localUploadRevision: t,
    assetRevision: a ? Ro(t) : "",
    hasGithubRelease: !1,
    hasLocalUpload: a,
    hasDerivedIndexUrl: !1,
    gateState: o ? "shell_ready" : "setup_required"
  };
}
function fu(n = {}) {
  const e = String(k(n) && n.indexUrl || "").trim();
  if (!(!e || et(e)))
    throw Le("ADMIN_INDEX_SOURCE_UPLOAD_ONLY", "管理台 HTML 仅支持本地上传，请通过启动门或 Worker 和 HTML 更新面板提交 index.html", 400, { field: "indexUrl" });
}
function li(n = {}, e = null) {
  const r = String(e?.HOST || "").trim(), t = Ve(e), a = String(n?.cfZoneId || "").trim(), o = String(n?.cfApiToken || "").trim(), s = [], i = [];
  return r ? t || i.push("HOST") : s.push("HOST"), a || s.push("cfZoneId"), o || s.push("cfApiToken"), {
    host: t,
    cfZoneId: a,
    cfApiToken: o,
    missingFields: s,
    invalidFields: i
  };
}
function ui(n = {}) {
  if (!(!Array.isArray(n?.invalidFields) || !n.invalidFields.includes("HOST")))
    throw Le("HOST_PREFIX_HOST_INVALID", "HOST 必须是合法 DNS 主机名，不能包含协议、用户信息、端口、路径、通配符、下划线、空标签或 IP 地址", 400, {
      field: "HOST",
      reason: "invalid_hostname"
    });
}
function mu(n = {}, e = null) {
  if (n?.enableHostPrefixProxy !== !0) return;
  const r = li(n, e);
  if (ui(r), !(r.missingFields.length <= 0))
    throw Le("HOST_PREFIX_PROXY_CONFIG_REQUIRED", "启用域名前缀代理前，必须先配置 HOST、Cloudflare Zone ID 和 API 令牌", 400, {
      missingFields: r.missingFields,
      host: r.host
    });
}
function ia(n = {}, e = null) {
  const r = li(n, e);
  if (ui(r), r.missingFields.length <= 0) return r;
  throw Le("HOST_PREFIX_DNS_CONFIG_REQUIRED", "保存域名前缀节点前，必须先配置 HOST、Cloudflare Zone ID 和 API 令牌", 400, {
    missingFields: r.missingFields,
    host: r.host
  });
}
function Cn(n = [], e = {}, r = null) {
  return (Array.isArray(n) ? n : [n]).some((t) => Ze(t?.nextNode?.entryMode)) ? ia(e, r) : null;
}
var pu = ke.PingTimeoutMs, gu = ke.UpstreamTimeoutMs, $n = ke.UpstreamRetryAttempts, di = ke.HedgeProbePath, hu = "/emby/system/info/public", To = ke.HedgeProbeTimeoutMs, fi = ke.HedgeProbeParallelism, mi = ke.HedgeWaitTimeoutMs, pi = ke.HedgeLockTtlMs, aa = ke.HedgePreferredTtlSec, gi = ke.HedgeFailureCooldownSec, hi = ke.HedgeWakeJitterMs, yu = ke.BufferedRetryBodyMaxBytes, Su = ke.MetadataPrewarmTimeoutMs, _u = ke.PrewarmCacheTtl;
ke.DefaultPlaybackInfoMode;
var bu = Lt.PlaybackInfoCacheTtlSec, yi = Lt.PlaybackInfoCacheEntryMaxBytes, Eu = Lt.PlaybackInfoCacheTotalMaxBytes, Si = Lt.VideoProgressForwardIntervalSec, Ru = Lt.VideoProgressSnapshotMaxBytes, _i = Lt.CacheTtlImagesDays, Tu = Lt.PlaybackRouteHotCacheTtlMs, sr = Lt.PlaybackRouteHotCacheMax, bi = 12 * 1024 * 1024, Au = bi - 64 * 1024, Cu = 2e6, Gt = 19e5, Yo = 50, Ei = 512 * 1024, wu = 4, Ao = 8 * 1024 * 1024, wn = 256 * 1024, Bn = 32, Jo = 64, Qo = 64 * 1024, Zo = 128, es = 8 * 1024, Rr = 4 * 1024, Lu = Object.freeze([
  "displayName",
  "remark",
  "tag",
  "tagColor",
  "remarkColor",
  "secret",
  "hostPrefixCnameTarget",
  "hedgeProbePath"
]), ts = 500, Pa = 1e4, xr = 25e3, xa = 1e4, Du = 1e4, Ln = 1e4, Nu = 600 * 1e3, Iu = 120 * 1e3, ot = 2, Oa = 2;
function Dn(n = "") {
  const e = String(n || "").trim().toUpperCase();
  return e.includes("INT") ? "INTEGER" : e.includes("CHAR") || e.includes("CLOB") || e.includes("TEXT") ? "TEXT" : e.includes("REAL") || e.includes("FLOA") || e.includes("DOUB") ? "REAL" : !e || e.includes("BLOB") ? "BLOB" : "NUMERIC";
}
var jr = /\.(?:jpg|jpeg|gif|png|svg|ico|webp)$/i, Mu = /\.(?:js|css|woff2?|ttf|otf|map|webmanifest)$/i, pr = /\.(?:srt|ass|vtt|sub)$/i, Vr = /(?:\/Images\/|\/Icons\/|\/Branding\/|\/emby\/covers\/)/i, ht = /\.(?:m3u8|mpd)$/i, Ri = /\.(?:ts|m4s)$/i, Pu = /\.(?:mp4|m4v|m4a|ogv|webm|mkv|mov|avi|wmv|flv)$/i, Kn = /* @__PURE__ */ new Set([
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
]), xu = /* @__PURE__ */ new Set([
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
]), Ou = /* @__PURE__ */ new Set([
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
]), Co = "legacy_proxy_ctx", vu = 86400, ln = [Co, "emby_web_bypass"], Fu = /* @__PURE__ */ new Set([
  "users",
  "items",
  "videos",
  "audio",
  "livetv",
  "sessions",
  "system"
]);
function Ca(n, e, r = null) {
  const t = e.headers.get("Origin"), a = e.headers.get("Access-Control-Request-Headers") || sa["Access-Control-Allow-Headers"];
  return {
    "Access-Control-Allow-Origin": r || t || sa["Access-Control-Allow-Origin"],
    "Access-Control-Allow-Methods": sa["Access-Control-Allow-Methods"],
    "Access-Control-Allow-Headers": a,
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
function ma(n = "") {
  let e = Q(n);
  for (; ; ) {
    const a = e.replace(/%([0-9a-f]{2})/gi, (o, s) => {
      const i = Number.parseInt(s, 16);
      return i <= 127 ? String.fromCharCode(i) : o;
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
function pa(n = "") {
  const e = String(n || ""), r = new TextEncoder().encode(e);
  let t = "";
  for (const a of r) t += String.fromCharCode(a);
  return btoa(t).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "");
}
function qr(n = "") {
  const e = String(n || "").trim().replace(/-/g, "+").replace(/_/g, "/");
  if (!e) return "";
  const r = e.length % 4, t = e + (r ? "=".repeat(4 - r) : ""), a = atob(t), o = Uint8Array.from(a, (s) => s.charCodeAt(0));
  return new TextDecoder().decode(o);
}
function Ti(n) {
  const e = "/admin", r = String(n || "").trim();
  if (!r) return e;
  let t = Q(r);
  return t = t.replace(/\/{2,}/g, "/"), t.length > 1 && (t = t.replace(/\/+$/, "")), !t || t === "/" || t.toLowerCase().startsWith("/api") ? e : t;
}
function Ai(n, e) {
  const r = Q(n || "/"), t = Q(e || "/");
  return r === t || r.startsWith(t + "/");
}
function wr(n, e) {
  const r = Q(n || "/"), t = Q(e || "/");
  return !t || t === "/" ? r === t : r === t || r === `${t}/`;
}
function it(n) {
  return Ti(n?.ADMIN_PATH);
}
function un(n = "/admin") {
  const e = Ti(n);
  return e === "/" ? "/login" : `${e}/login`;
}
function wo(n) {
  return un(it(n));
}
function Uu(n) {
  const e = it(n), r = Q(e).toLowerCase(), t = [], a = r.split("/").filter(Boolean).map((o) => wt(o).toLowerCase());
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
function ku(n, e) {
  const r = String(n || "").trim().toLowerCase();
  return r && Uu(e).find((t) => t.name === r) || null;
}
function Ci(n = {}) {
  return String(n?.name || "").trim() ? String(n?.target || "").trim() ? !0 : Array.isArray(n?.lines) && n.lines.length > 0 : !1;
}
function rs(n, e) {
  const r = Array.isArray(n) ? n : [n];
  for (const t of r) {
    if (!Ci(t) || Ze(t?.entryMode)) continue;
    const a = ku(t?.name, e);
    if (a)
      return {
        ...a,
        name: String(t?.name || "").trim().toLowerCase()
      };
  }
  return null;
}
function Hu(n = {}, e = null) {
  if (!Ze(n?.entryMode)) return null;
  const r = String(n?.name || "").trim().toLowerCase();
  if (!r) return {
    code: "HOST_PREFIX_REQUIRED",
    message: "域名前缀不能为空",
    name: r
  };
  if (!Aa(r)) return {
    code: "HOST_PREFIX_INVALID",
    message: "域名前缀仅支持小写字母、数字、连字符，且不能以下划线、点或连字符结尾",
    name: r
  };
  const t = nu(e);
  if (t && t.name === r) return {
    code: "HOST_PREFIX_RESERVED_BY_LEGACY_HOST",
    message: "该域名前缀已被旧部署子域兼容入口保留，请更换后重试",
    name: r,
    reservedBy: t.reservedBy,
    reason: t.reason,
    legacyHost: t.legacyHost,
    host: t.host
  };
  const a = ii(n?.hostPrefixCnameTarget);
  return a ? {
    code: "HOST_PREFIX_CNAME_TARGET_INVALID",
    message: a,
    field: "hostPrefixCnameTarget",
    value: String(n?.hostPrefixCnameTarget || "").trim(),
    name: r
  } : null;
}
function as(n, e = null) {
  const r = Array.isArray(n) ? n : [n];
  for (const t of r) {
    if (!Ci(t)) continue;
    const a = Hu(t, e);
    if (a) return a;
  }
  return null;
}
function $u(n) {
  const e = it(n);
  return e === "/" ? "/" : e;
}
function Ae(n) {
  return String(n ?? "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#39;");
}
function Xr(n) {
  return JSON.stringify(n).replace(/</g, "\\u003c").replace(/>/g, "\\u003e").replace(/&/g, "\\u0026").replace(/\u2028/g, "\\u2028").replace(/\u2029/g, "\\u2029");
}
function Ke(n, e = null) {
  const r = [];
  n?.JWT_SECRET || r.push("JWT_SECRET"), n?.ADMIN_PASS || r.push("ADMIN_PASS");
  const t = typeof e?.adminPath == "string" ? e.adminPath : it(n), a = typeof e?.loginPath == "string" ? e.loginPath : un(t);
  return {
    ok: r.length === 0,
    missing: r,
    adminPath: t,
    loginPath: a,
    message: r.length ? `系统未初始化：缺少 ${r.join("、")}。` : "系统初始化检查通过。"
  };
}
function wi(n, e = null) {
  const r = Ke(n, e);
  if (r.ok) return r;
  const t = r.missing.join("|") || "unknown";
  return Qe.InitCheckWarnedFingerprints.has(t) || (Qe.InitCheckWarnedFingerprints.size >= 32 && Qe.InitCheckWarnedFingerprints.clear(), Qe.InitCheckWarnedFingerprints.add(t), console.warn(`[Init Check] ${r.message} 管理入口: ${r.adminPath}`)), r;
}
function zn(n) {
  if (!n || n.ok) return "";
  const e = Array.isArray(n.missing) && n.missing.length ? n.missing.map((r) => `<code class="rounded bg-amber-100/80 px-1.5 py-0.5 text-[11px] font-semibold text-amber-700">${Ae(r)}</code>`).join(" ") : '<code class="rounded bg-amber-100/80 px-1.5 py-0.5 text-[11px] font-semibold text-amber-700">UNKNOWN</code>';
  return `<div id="init-health-banner" class="mx-4 mt-4 rounded-2xl border border-amber-200 bg-amber-50/95 px-4 py-3 text-sm text-amber-900 shadow-sm"><div class="flex flex-col gap-1 md:flex-row md:items-center md:justify-between"><div class="font-semibold">系统未初始化</div><div class="text-xs text-amber-700">管理入口：${Ae(n.adminPath || "/admin")}</div></div><p class="mt-2 leading-6">检测到关键环境变量缺失：${e}</p><p class="mt-1 text-xs leading-5 text-amber-700">请先在 Cloudflare Worker 环境变量中补齐后再使用管理台登录与敏感操作。</p></div>`;
}
function na(n) {
  return String(n?.cf?.colo || "").trim().toUpperCase() || "UNKNOWN";
}
function Ga(n) {
  return Qs(String(n?.headers?.get?.("CF-RAY") || n?.headers?.get?.("cf-ray") || "").trim());
}
function Bu(n) {
  return String(n?.cf?.country || "").trim().toUpperCase() || "UNKNOWN";
}
function Ku(n) {
  const e = Bu(n);
  return {
    countryCode: e,
    countryName: Wl(e)
  };
}
function zu(n = {}, e = {}) {
  const { statusPort: r } = n, t = '<!DOCTYPE html><html lang="zh-CN"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0, viewport-fit=cover"><link rel="icon" href="/favicon.ico" sizes="any"><title>Emby Proxy Admin Shell</title><script id="admin-bootstrap" type="application/json">__ADMIN_BOOTSTRAP_JSON__<\/script><style>:root{color-scheme:dark}*{box-sizing:border-box}body{margin:0;min-height:100vh;background:radial-gradient(circle at top,#0f172a 0,#020617 44%,#020617 100%);color:#e2e8f0;font-family:Inter,ui-sans-serif,system-ui,-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif}a{color:inherit;text-decoration:none}.admin-fallback-shell{min-height:100vh;display:flex;align-items:center;justify-content:center;padding:32px 18px}.admin-fallback-card{width:min(100%,980px);border:1px solid rgba(51,65,85,.92);border-radius:30px;background:rgba(15,23,42,.94);box-shadow:0 32px 96px rgba(2,6,23,.52);padding:28px;backdrop-filter:blur(20px)}.admin-fallback-pill{display:inline-flex;align-items:center;gap:8px;border-radius:999px;padding:8px 14px;background:rgba(59,130,246,.12);border:1px solid rgba(96,165,250,.32);color:#bfdbfe;font-size:12px;font-weight:700;letter-spacing:.14em;text-transform:uppercase}.admin-fallback-title{margin:20px 0 0;font-size:clamp(1.9rem,4vw,3rem);line-height:1.08;color:#fff}.admin-fallback-copy{margin:14px 0 0;max-width:54rem;color:#cbd5e1;font-size:15px;line-height:1.8}.admin-fallback-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(220px,1fr));gap:14px;margin-top:24px}.admin-fallback-stat{border:1px solid rgba(51,65,85,.9);border-radius:22px;background:rgba(2,6,23,.48);padding:16px}.admin-fallback-k{font-size:12px;font-weight:700;letter-spacing:.14em;text-transform:uppercase;color:#64748b}.admin-fallback-v{margin-top:10px;font-size:15px;line-height:1.7;color:#f8fafc;word-break:break-word}.admin-fallback-actions{display:flex;flex-wrap:wrap;gap:12px;margin-top:24px}.admin-fallback-btn{display:inline-flex;align-items:center;justify-content:center;border-radius:16px;padding:12px 18px;font-size:14px;font-weight:700;transition:transform .18s ease,background-color .18s ease,border-color .18s ease}.admin-fallback-btn:hover{transform:translateY(-1px)}.admin-fallback-btn-primary{background:#2563eb;color:#fff;border:1px solid rgba(147,197,253,.7);box-shadow:0 12px 28px rgba(37,99,235,.24)}.admin-fallback-btn-primary:hover{background:#1d4ed8;border-color:#93c5fd}.admin-fallback-btn-secondary{background:rgba(15,23,42,.5);color:#e2e8f0;border:1px solid rgba(51,65,85,.95)}.admin-fallback-btn-secondary:hover{background:rgba(30,41,59,.85)}.admin-fallback-panel{margin-top:24px;border:1px solid rgba(51,65,85,.9);border-radius:24px;background:rgba(2,6,23,.4);padding:20px}.admin-fallback-panel h2{margin:0;font-size:15px;color:#fff}.admin-fallback-panel p{margin:10px 0 0;font-size:14px;line-height:1.7;color:#cbd5e1}.admin-fallback-panel details{margin-top:16px}.admin-fallback-panel summary{cursor:pointer;color:#93c5fd;font-weight:700}.admin-fallback-panel pre{overflow:auto;margin:12px 0 0;padding:14px;border-radius:18px;background:#020617;color:#cbd5e1;font-size:12px;line-height:1.6}.admin-fallback-note{margin-top:16px;color:#94a3b8;font-size:13px;line-height:1.7}@media (max-width:640px){.admin-fallback-shell{padding:18px 12px}.admin-fallback-card,.admin-fallback-stat,.admin-fallback-panel{border-radius:22px}.admin-fallback-card{padding:22px}.admin-fallback-actions{flex-direction:column}.admin-fallback-btn{width:100%}}</style></head><body><main class="admin-fallback-shell"><section class="admin-fallback-card"><div class="admin-fallback-pill">Admin Shell</div><h1 class="admin-fallback-title">管理台壳层正在处理中</h1><p class="admin-fallback-copy">Worker 继续负责管理台壳、登录与统一后台 API；页面主体会根据当前状态注入设置页、远端壳或错误态内容。</p>__INIT_HEALTH_BANNER____ADMIN_APP_ROOT__</section></main></body></html>';
  let a = -1;
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
  function i(z = "GET") {
    const j = new Headers({
      "Content-Type": "image/svg+xml;charset=UTF-8",
      "Cache-Control": "public, max-age=86400, s-maxage=604800, immutable"
    });
    return we(j), new Response(z === "HEAD" ? null : o, { headers: j });
  }
  const c = Object.freeze([
    "__ADMIN_BOOTSTRAP_JSON__",
    "__INIT_HEALTH_BANNER__",
    "__ADMIN_APP_ROOT__"
  ]), l = "embedded-fallback-v1", u = m(t), d = "minimal-split-parts", f = !0;
  function m(z = "") {
    const j = String(z || ""), q = [];
    let Y = 0;
    for (const X of c) {
      const ae = j.indexOf(X, Y);
      if (ae < 0) throw new Error(`missing admin html placeholder: ${X}`);
      q.push(j.slice(Y, ae)), Y = ae + X.length;
    }
    return q.push(j.slice(Y)), q;
  }
  function p(z = [], j = {}) {
    let q = String(z[0] || "");
    for (let Y = 0; Y < c.length; Y += 1) {
      const X = c[Y];
      q += String(j[X] || ""), q += String(z[Y + 1] || "");
    }
    return q;
  }
  const g = "__ADMIN_BOOTSTRAP_JSON__", h = "__INIT_HEALTH_BANNER__", y = "__ADMIN_APP_ROOT__", _ = "", S = "https://admin-shell-cache.invalid", A = "private, no-store, max-age=0", b = "public, max-age=31536000, immutable", R = 300 * 1e3, T = 2 * 1024 * 1024, L = "bootstrap-tailwind-assets-v3-active-index", D = "X-Admin-Shell-Cached-At", E = "X-Admin-Shell-Source-Etag", w = "X-Admin-Shell-Source-Last-Modified", N = "X-Admin-Shell-Source-Hash", O = "__release", C = "vendor", v = "__warm", B = "https://admin-release-vendor-cache.invalid", P = "https://admin-release-vendor-manifest.invalid", I = "public, max-age=31536000, immutable", M = "no-store, max-age=0", x = 8 * 1024 * 1024, U = 3, G = "X-Admin-Release-Vendor-Cached-At", K = "X-Admin-Release-Vendor-Source-Hash", $ = Object.freeze([
    "dashboard",
    "nodes",
    "logs",
    "dns",
    "settings"
  ]), V = Object.freeze([
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
  function pe() {
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
      primaryViews: [...$],
      settings: {
        visualSections: [...V],
        saveGroups: [...se]
      }
    };
  }
  function me(z, j = Ke(z), q = {}) {
    return {
      adminPath: it(z),
      loginPath: wo(z),
      initHealth: j,
      hostDomain: Ve(z),
      contract: pe(),
      shell: It(z, j, q)
    };
  }
  function le() {
    if (a >= 0) return a;
    if (!Array.isArray(u) || u.length !== c.length + 1)
      return a = 0, 0;
    const z = new TextEncoder();
    let j = 0;
    for (let q = 0; q < u.length; q += 1)
      j += z.encode(String(u[q] || "")).length, q < c.length && (j += z.encode(c[q]).length);
    return a = j, a;
  }
  function ye(z = !1, j = "") {
    const q = String(j || "").trim().toLowerCase();
    return z ? "remote_ready" : q === "setup_required" ? "setup_required" : "embedded_only";
  }
  function xe(z = !1, j = f) {
    return z ? j ? "embedded_fallback_retained" : "legacy_inline_shell_active" : "embedded_fallback_missing";
  }
  function Ge(z = "embedded", j = "") {
    return String(z || "").trim().toLowerCase() === "gate" || String(j || "").trim() === "setup_gate" ? "setup_gate" : String(z || "").trim().toLowerCase() === "remote" ? "remote_shell" : String(j || "").trim() === "embedded_fallback" ? "embedded_fallback" : "embedded_shell";
  }
  function at(z = !1, j = "") {
    return z ? String(j || "").trim() === "embedded_fallback" ? "active" : "retained" : "missing";
  }
  function It(z, j = Ke(z), q = {}) {
    const Y = dt(z, q), X = Y.indexUrl, ae = le(), ge = !!X, $e = !!(z?.ASSETS && typeof z.ASSETS.fetch == "function"), Re = !ge && $e ? "shell_ready" : Y.gateState, Ne = ae > 0;
    let Z = "";
    if (X) try {
      Z = new URL(X).origin;
    } catch {
      Z = "";
    }
    return {
      mode: ge ? "remote-preferred" : $e ? "embedded" : "setup_required",
      lifecycleState: ye(ge, Re),
      embeddedFallbackState: Ne ? "retained" : "missing",
      retirementState: xe(Ne),
      gateState: Re,
      indexUrl: Y.indexUrl,
      indexUrlSource: Y.indexUrlSource,
      effectiveRef: Y.effectiveRef,
      remoteShellConfigured: ge,
      remoteShellIndexUrl: X,
      remoteShellOrigin: Z,
      bundledShellAvailable: $e,
      bundledShellSource: $e ? "frontend/dist/index.html" : "",
      initHealthOk: j?.ok === !0,
      embeddedFallbackAvailable: Ne,
      embeddedTemplateSource: d,
      embeddedTemplateMode: d,
      embeddedTemplateBytes: ae,
      finalUiHtmlRetired: f
    };
  }
  function yr(z, j = {}) {
    return dt(z, j).indexUrl;
  }
  function _t(z = {}) {
    const j = k(z.shellState) ? z.shellState : {}, q = k(z.initHealth) ? z.initHealth : {}, Y = k(z.indexState) ? z.indexState : {}, X = String(z.remoteShellIndexUrl || j.remoteShellIndexUrl || Y.indexUrl || "").trim(), ae = String(z.mode || "").trim().toLowerCase(), ge = ae === "remote" ? "remote" : ae === "gate" ? "gate" : "embedded", $e = j.remoteShellConfigured === !0 || !!X, Re = j.embeddedFallbackAvailable === !0, Ne = j.finalUiHtmlRetired !== !1, Z = String(z.routeState || "").trim() || (ge === "remote" ? "remote_active" : ge === "gate" ? "setup_gate" : "embedded_active"), Zr = String(z.lifecycleState || j.lifecycleState || "").trim() || ye($e, z.gateState || j.gateState || Y.gateState || ""), Ut = String(z.embeddedFallbackState || j.embeddedFallbackState || "").trim() || at(Re, Z), Zc = String(z.retirementState || j.retirementState || "").trim() || xe(Re, Ne), el = String(z.gateState || j.gateState || Y.gateState || (X ? "shell_ready" : "setup_required")).trim() || "setup_required";
    return {
      ...j,
      mode: ge,
      effectiveMode: Ge(ge, Z),
      gateState: el,
      lifecycleState: Zr,
      embeddedFallbackState: Ut,
      retirementState: Zc,
      sourceType: String(z.sourceType || "").trim().toLowerCase() || (ge === "remote" ? "remote_fetch" : ge === "gate" ? "setup_gate" : "embedded_local"),
      routeState: Z,
      indexUrl: String(z.indexUrl || j.indexUrl || Y.indexUrl || X).trim(),
      indexUrlSource: String(z.indexUrlSource || j.indexUrlSource || Y.indexUrlSource || "").trim(),
      effectiveRef: String(z.effectiveRef || j.effectiveRef || Y.effectiveRef || "").trim(),
      effectiveRefType: String(z.effectiveRefType || j.effectiveRefType || Y.effectiveRefType || "").trim(),
      remoteShellIndexUrl: X,
      remoteShellOrigin: String(j.remoteShellOrigin || "").trim(),
      remoteCacheState: String(z.remoteCacheState || "").trim().toLowerCase(),
      revalidateDue: z.revalidateDue === !0,
      lastFetchStatus: String(z.lastFetchStatus || "").trim().toLowerCase(),
      reason: String(z.reason || "").trim(),
      requestPath: String(z.requestPath || "").trim(),
      initHealthOk: q.ok === !0,
      initHealthMissing: [...new Set((Array.isArray(q.missing) ? q.missing : []).map((tl) => String(tl || "").trim()).filter(Boolean))],
      fallbackRetained: Re,
      templateMode: String(j.embeddedTemplateMode || j.embeddedTemplateSource || "").trim() || d,
      finalUiHtmlRetired: Ne,
      updatedAt: String(z.updatedAt || "").trim() || (/* @__PURE__ */ new Date()).toISOString()
    };
  }
  async function Vt(z, j = {}, q = null) {
    const Y = k(j.shellState) ? j.shellState : It(z, j.initHealth, j.config || {}), X = _t({
      ...j,
      shellState: Y
    }), ae = r.resolveOpsStatusStores(z).db, { updatedAt: ge, ...$e } = X, Re = ie(ee($e)), Ne = ae ? J.AdminShellStatusWriteState.get(ae) : null, Z = Math.max(1e3, Number(F.Defaults.AdminShellStatusStableWriteIntervalMs) || 1e3);
    if (j.throttleStableWrites === !0 && Ne?.fingerprint === Re) {
      if (Ne.writePromise) return Ne.writePromise;
      if (H() - (Number(Ne.writtenAt) || 0) < Z) return null;
    }
    const Zr = he(Promise.resolve(r.patchOpsStatus(z, { adminShell: X }, q)).then((Ut) => ({
      ok: !0,
      result: Ut
    })), "admin.shell_status_patch", {
      requestPath: X.requestPath,
      mode: X.mode,
      sourceType: X.sourceType
    }, {
      ok: !1,
      result: null
    }).then((Ut) => (!ae || J.AdminShellStatusWriteState.get(ae)?.writePromise !== Zr || (Ut?.ok === !0 ? J.AdminShellStatusWriteState.set(ae, {
      fingerprint: Re,
      writtenAt: H(),
      writePromise: null
    }) : Ne ? J.AdminShellStatusWriteState.set(ae, Ne) : J.AdminShellStatusWriteState.delete(ae)), Ut?.result ?? null));
    return ae && J.AdminShellStatusWriteState.set(ae, {
      fingerprint: Re,
      writtenAt: 0,
      writePromise: Zr
    }), Zr;
  }
  function Sr(z = {}, j, q = {}, Y = Ke(j)) {
    const X = k(z) ? z : {}, ae = dt(j, q), ge = It(j, Y, q);
    return {
      ...X,
      adminShell: _t({
        ...k(X.adminShell) ? X.adminShell : {},
        shellState: ge,
        initHealth: Y,
        indexState: ae,
        remoteShellIndexUrl: ae.indexUrl,
        gateState: ae.gateState,
        indexUrl: ae.indexUrl,
        indexUrlSource: ae.indexUrlSource,
        effectiveRef: ae.effectiveRef,
        effectiveRefType: ae.effectiveRefType,
        mode: k(X.adminShell) && String(X.adminShell.mode || "").trim() ? X.adminShell.mode : ae.indexUrl ? "remote" : "gate",
        routeState: k(X.adminShell) && String(X.adminShell.routeState || "").trim() ? X.adminShell.routeState : ae.indexUrl ? "remote_ready_idle" : "setup_gate",
        sourceType: k(X.adminShell) && String(X.adminShell.sourceType || "").trim() ? X.adminShell.sourceType : ae.indexUrl ? "runtime_status" : "setup_gate"
      })
    };
  }
  function Mt(z = "") {
    const j = String(z || "").trim();
    if (!j) return "已上传的管理台 HTML 暂时不可用，请重新上传。";
    if (j.startsWith("remote_shell_render_failed")) {
      const q = j.replace(/^remote_shell_render_failed:\s*/i, "").trim();
      return q ? `Worker 读取 index.html 失败：${q}` : "Worker 读取 index.html 失败。";
    }
    return j;
  }
  function Pt(z = {}, j = {}, q = {}, Y = {}) {
    const X = String(z.adminPath || "/admin").trim() || "/admin", ae = String(Y.remoteShellIndexUrl || j.remoteShellIndexUrl || "").trim(), ge = Mt(Y.reason || ""), $e = `${X}?setup=1`;
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
            <p class="admin-remote-error-desc">${Ae(ge)}</p>
          </div>
          <div class="admin-remote-error-body">
            <div class="admin-remote-error-grid">
              <article class="admin-remote-error-stat"><div class="admin-remote-error-k">错误原因</div><div class="admin-remote-error-v">${Ae(ge)}</div></article>
              <article class="admin-remote-error-stat"><div class="admin-remote-error-k">本地版本标识</div><div class="admin-remote-error-v">${Ae(ae || "未找到本地 HTML 版本")}</div></article>
            </div>
            <div class="admin-remote-error-actions">
              <a href="${Ae(X)}" class="admin-remote-error-btn admin-remote-error-btn-primary">刷新 /admin</a>
              <a href="${Ae($e)}" class="admin-remote-error-btn admin-remote-error-btn-secondary">重新上传 index.html</a>
            </div>
            <p class="admin-remote-error-note">如果这里继续报错，请重新上传与当前 Worker 匹配的 index.html。</p>
          </div>
        </section>
      </div>`;
  }
  function _r(z = {}, j = {}, q = {}, Y = {}, X = {}) {
    const ae = String(z.adminPath || "/admin").trim() || "/admin", ge = X?.isLocalUpload === !0, $e = Xr({ adminPath: ae });
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
            <div id="admin-gate-status" class="admin-gate-status${ge ? " is-success" : ""}" role="status" aria-live="polite">${ge ? "当前已有 HTML 版本，可上传新文件替换。" : "请选择 index.html。"}</div>
            <div class="admin-gate-actions">
              <button id="admin-gate-submit" type="submit" class="admin-gate-btn">上传并进入管理台</button>
            </div>
          </form>
        </section>
      </div>
      <script>
        const ADMIN_INDEX_GATE_RUNTIME = ${$e};
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
  function Qr(z = "{}", j = "", q = _) {
    return !Array.isArray(u) || u.length !== c.length + 1 ? "" : p(u, {
      [g]: String(z || "{}"),
      [h]: String(j || ""),
      [y]: String(q || _)
    });
  }
  function Oe(z = {}, j = null, q = _) {
    const Y = k(z) ? z : {}, X = k(j) ? j : k(Y.initHealth) ? Y.initHealth : {}, ae = {
      templateRevision: String(l).trim() || "admin-shell",
      adminPath: String(Y.adminPath || "").trim(),
      loginPath: String(Y.loginPath || "").trim(),
      hostDomain: re(Y.hostDomain),
      contractHash: ie(ee(Y.contract || pe())),
      initHealthOk: X.ok === !0,
      initHealthMissing: [...new Set((Array.isArray(X.missing) ? X.missing : []).map((ge) => String(ge || "").trim()).filter(Boolean))],
      appRootHash: ie(String(q || _))
    };
    return `${ae.templateRevision}-${ie(ee(ae))}`;
  }
  function xt(z = "") {
    return `"${String(z || "").trim()}"`;
  }
  function je(z = "") {
    return String(z || "").trim().replace(/^W\//i, "").replace(/^"(.*)"$/, "$1");
  }
  function nt(z, j = "") {
    const q = String(z?.headers?.get?.("If-None-Match") || "").trim(), Y = je(j);
    return !q || !Y ? !1 : q.split(",").some((X) => {
      const ae = je(X);
      return ae === "*" || ae === Y;
    });
  }
  function Ot(z, j = "") {
    const q = z instanceof Request ? new URL(z.url) : new URL(String(z || ""), S), Y = new URL(q.pathname, S);
    return Y.searchParams.set("remote", ie(String(j || "").trim())), new Request(Y.toString(), { method: "GET" });
  }
  function br(z, j = "", q = {}) {
    const Y = Ot(z, j), X = new URL(Y.url);
    return X.searchParams.set("transform", L), X.searchParams.set("bootstrap", ie(ee(k(q) ? q : {}))), new Request(X.toString(), { method: "GET" });
  }
  function He(z = "", j = "no-store, max-age=0") {
    const q = new Headers({
      "Content-Type": "text/html;charset=UTF-8",
      "Cache-Control": String(j || "no-store, max-age=0")
    });
    return we(q), z && q.set("ETag", xt(z)), q;
  }
  function bt(z = "") {
    const j = String(z || "").trim();
    if (!j) return "";
    const q = Date.parse(j);
    return Number.isFinite(q) ? new Date(q).toUTCString() : "";
  }
  function vt(z, j = "") {
    const q = String(z?.headers?.get?.("If-Modified-Since") || "").trim(), Y = bt(j);
    if (!q || !Y) return !1;
    const X = Date.parse(q), ae = Date.parse(Y);
    return !Number.isFinite(X) || !Number.isFinite(ae) ? !1 : X >= ae;
  }
  function qt(z, j) {
    return String(z?.headers?.get?.("If-None-Match") || "").trim() ? nt(z, j?.headers?.get?.("ETag") || "") : vt(z, j?.headers?.get?.("Last-Modified") || "");
  }
  function Ft(z, j = "no-store, max-age=0") {
    const q = new Headers({ "Cache-Control": String(j || "no-store, max-age=0") }), Y = je(z?.headers?.get?.("ETag") || ""), X = bt(z?.headers?.get?.("Last-Modified") || "");
    Y && q.set("ETag", xt(Y)), X && q.set("Last-Modified", X);
    const ae = String(z?.headers?.get?.("X-Admin-Shell-Revision") || "").trim();
    return ae && q.set("X-Admin-Shell-Revision", ae), we(q), new Response(null, {
      status: 304,
      headers: q
    });
  }
  return {
    ADMIN_FALLBACK_HTML_TEMPLATE: t,
    cachedAdminTemplateBytes: a,
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
    ADMIN_APP_ROOT_HTML: _,
    ADMIN_HTML_CACHE_KEY_ORIGIN: S,
    ADMIN_REMOTE_SHELL_BROWSER_CACHE_CONTROL: A,
    ADMIN_REMOTE_SHELL_EDGE_CACHE_CONTROL: b,
    ADMIN_REMOTE_SHELL_REVALIDATE_MS: R,
    ADMIN_REMOTE_SHELL_MAX_BYTES: T,
    ADMIN_REMOTE_SHELL_TRANSFORM_REVISION: L,
    ADMIN_REMOTE_SHELL_CACHED_AT_HEADER: D,
    ADMIN_REMOTE_SHELL_SOURCE_ETAG_HEADER: E,
    ADMIN_REMOTE_SHELL_SOURCE_LAST_MODIFIED_HEADER: w,
    ADMIN_REMOTE_SHELL_SOURCE_HASH_HEADER: N,
    ADMIN_RELEASE_PROXY_PATH_SEGMENT: O,
    ADMIN_RELEASE_VENDOR_PATH_SEGMENT: C,
    ADMIN_WARM_PATH_SEGMENT: v,
    ADMIN_RELEASE_VENDOR_CACHE_KEY_ORIGIN: B,
    ADMIN_RELEASE_VENDOR_MANIFEST_CACHE_KEY_ORIGIN: P,
    ADMIN_RELEASE_VENDOR_CACHE_CONTROL: I,
    ADMIN_RELEASE_VENDOR_MUTABLE_CACHE_CONTROL: M,
    ADMIN_RELEASE_VENDOR_MAX_BYTES: x,
    ADMIN_WARM_VENDOR_CONCURRENCY: U,
    ADMIN_RELEASE_VENDOR_CACHED_AT_HEADER: G,
    ADMIN_RELEASE_VENDOR_SOURCE_HASH_HEADER: K,
    ADMIN_PRIMARY_VIEWS: $,
    ADMIN_SETTINGS_VISUAL_SECTIONS: V,
    ADMIN_SETTINGS_SAVE_GROUPS: se,
    buildAdminUiContract: pe,
    buildAdminBootstrapPayload: me,
    measureAdminShellTemplateBytes: le,
    buildAdminShellLifecycleState: ye,
    buildAdminShellRetirementState: xe,
    buildAdminShellEffectiveMode: Ge,
    buildAdminEmbeddedFallbackRuntimeState: at,
    buildAdminShellState: It,
    resolveAdminShellIndexUrl: yr,
    normalizeAdminShellRuntimeStatus: _t,
    patchAdminShellRuntimeStatus: Vt,
    withAdminShellRuntimeStatus: Sr,
    describeAdminRemoteShellFailureReason: Mt,
    buildAdminRemoteShellErrorContent: Pt,
    buildAdminIndexSetupContent: _r,
    renderAdminHtmlShell: Qr,
    buildAdminHtmlVariantEtag: Oe,
    formatAdminHtmlEtag: xt,
    normalizeEtagToken: je,
    requestHasMatchingEtag: nt,
    buildAdminRemoteShellLegacyCacheKeyRequest: Ot,
    buildAdminRemoteShellCacheKeyRequest: br,
    buildAdminHtmlResponseHeaders: He,
    normalizeAdminHttpDateHeader: bt,
    requestHasMatchingLastModified: vt,
    requestMatchesAdminHtmlResponse: qt,
    buildConditionalNotModifiedResponseFromStoredResponse: Ft
  };
}
function Wu(n = {}, e = {}) {
  function r(I = "{}") {
    return `${s(I)}${t}`;
  }
  const t = '<script id="admin-bootstrap-loader">try{window.__ADMIN_BOOTSTRAP__=JSON.parse(document.getElementById("admin-bootstrap")?.textContent||"{}")}catch(_){window.__ADMIN_BOOTSTRAP__=window.__ADMIN_BOOTSTRAP__||{},window.__ADMIN_UI_BOOT_ERROR__=window.__ADMIN_UI_BOOT_ERROR__||"admin bootstrap parse failed: "+(_?.message||String(_||"unknown_error"))}<\/script>', a = '<script id="admin-tailwind-prelude">window.tailwind=window.tailwind||{};<\/script>', o = /* @__PURE__ */ new Set([
    "script",
    "style",
    "template",
    "textarea",
    "title",
    "noscript"
  ]);
  function s(I = "{}") {
    return `<script id="admin-bootstrap" type="application/json">${String(I || "{}")}<\/script>`;
  }
  function i(I = "") {
    return I === " " || I === "	" || I === `
` || I === "\f" || I === "\r";
  }
  function c(I, M) {
    let x = "";
    for (let U = M; U < I.length; U += 1) {
      const G = I[U];
      if (x)
        G === x && (x = "");
      else if (G === '"' || G === "'") x = G;
      else if (G === ">") return U;
    }
    return -1;
  }
  function l(I, M) {
    let x = M + 1;
    if (!/[A-Za-z]/.test(I[x] || "")) return null;
    const U = c(I, x);
    if (U < 0) return null;
    const G = x;
    for (; x < U && !i(I[x]) && I[x] !== "/"; ) x += 1;
    const K = I.slice(G, x).toLowerCase(), $ = /* @__PURE__ */ new Map();
    for (; x < U; ) {
      for (; x < U && i(I[x]); ) x += 1;
      if (x >= U) break;
      if (I[x] === "/") {
        x += 1;
        continue;
      }
      const V = x;
      for (; x < U && !i(I[x]) && I[x] !== "=" && I[x] !== "/"; ) x += 1;
      if (x === V) {
        x += 1;
        continue;
      }
      const se = I.slice(V, x).toLowerCase();
      for (; x < U && i(I[x]); ) x += 1;
      let pe = "", me = !1, le = -1, ye = -1;
      if (I[x] === "=") {
        for (x += 1; x < U && i(I[x]); ) x += 1;
        const xe = I[x];
        if (xe === '"' || xe === "'") {
          for (me = !0, x += 1, le = x; x < U && I[x] !== xe; ) x += 1;
          ye = x, pe = I.slice(le, ye), x < U && (x += 1);
        } else {
          for (le = x; x < U && !i(I[x]); ) x += 1;
          ye = x, pe = I.slice(le, ye);
        }
      }
      $.has(se) || $.set(se, {
        value: pe,
        quoted: me,
        valueStart: le,
        valueEnd: ye
      });
    }
    return {
      tagName: K,
      attributes: $,
      start: M,
      tagEnd: U
    };
  }
  function u(I, M, x, U) {
    const G = `</${x}`;
    let K = U;
    for (; K < I.length; ) {
      const $ = M.indexOf(G, K);
      if ($ < 0) return null;
      const V = I[$ + G.length] || "";
      if (!V || i(V) || V === "/" || V === ">") {
        const se = c(I, $ + G.length);
        return se >= 0 ? {
          start: $,
          tagEnd: se
        } : null;
      }
      K = $ + G.length;
    }
    return null;
  }
  function* d(I = "") {
    const M = String(I || ""), x = M.toLowerCase();
    let U = 0;
    for (; U < M.length; ) {
      const G = M.indexOf("<", U);
      if (G < 0) return;
      if (M.startsWith("<!--", G)) {
        const me = M.indexOf("-->", G + 4);
        U = me < 0 ? M.length : me + 3;
        continue;
      }
      const K = M[G + 1] || "";
      if (K === "!" || K === "?" || K === "/") {
        const me = c(M, G + 2);
        if (me < 0) return;
        U = me + 1;
        continue;
      }
      const $ = l(M, G);
      if (!$) {
        if (/[A-Za-z]/.test(K)) return;
        U = G + 1;
        continue;
      }
      const V = $.tagEnd + 1, se = o.has($.tagName) ? u(M, x, $.tagName, V) : null, pe = se ? se.start : V;
      if (U = se ? se.tagEnd + 1 : V, yield {
        ...$,
        contentStart: V,
        contentEnd: se || !o.has($.tagName) ? pe : M.length,
        contentTagEnd: se ? se.tagEnd : -1,
        contentClosed: !!se || !o.has($.tagName)
      }, o.has($.tagName) && !se) return;
    }
  }
  function f(I = "", M = "") {
    const x = String(I || ""), U = String(M || "");
    if (!x || !U) return x;
    let G = -1;
    for (const K of d(x)) {
      if (K.tagName === "head") {
        const $ = K.tagEnd + 1;
        return `${x.slice(0, $)}${U}${x.slice($)}`;
      }
      K.tagName === "body" && G < 0 && (G = K.tagEnd + 1);
    }
    return G >= 0 ? `${x.slice(0, G)}${U}${x.slice(G)}` : `${U}${x}`;
  }
  function m(I = "") {
    const M = String(I || "");
    if (!M) return M;
    let x = -1;
    for (const U of d(M)) {
      if (U.tagName !== "script" || !U.contentClosed) continue;
      if (U.attributes.get("id")?.value === "admin-tailwind-prelude") return M;
      if (x >= 0 || U.attributes.has("src")) continue;
      const G = M.slice(U.contentStart, U.contentEnd);
      /\btailwind\s*\.\s*config\s*=/i.test(G) && (x = U.start);
    }
    return x < 0 ? M : `${M.slice(0, x)}${a}${M.slice(x)}`;
  }
  function p(I = "", M = "{}") {
    const x = m(String(I || ""));
    if (!x) return x;
    const U = s(M);
    let G = null, K = null;
    for (const $ of d(x)) {
      if ($.tagName !== "script" || !$.contentClosed) continue;
      const V = String($.attributes.get("id")?.value || "").trim();
      V === "admin-bootstrap" && String($.attributes.get("type")?.value || "").trim().toLowerCase() === "application/json" ? G = $ : V === "admin-bootstrap-loader" && (K = $);
    }
    if (G && G.contentTagEnd >= G.tagEnd) {
      const $ = x.slice(0, G.start), V = x.slice(G.contentTagEnd + 1);
      return `${$}${U}${K ? "" : t}${V}`;
    }
    return K ? `${x.slice(0, K.start)}${U}${x.slice(K.start)}` : f(x, r(M));
  }
  function g(I) {
    const M = String(I?.tagName || "").trim().toLowerCase();
    let x = "", U = "";
    if (M === "script" && I.attributes?.has("src"))
      x = "src", U = "script";
    else if (M === "link" && I.attributes?.has("href")) {
      const V = new Set(String(I.attributes.get("rel")?.value || "").trim().toLowerCase().split(/\s+/).filter(Boolean)), se = String(I.attributes.get("as")?.value || "").trim().toLowerCase();
      V.has("stylesheet") ? U = "css" : V.has("modulepreload") ? U = "script" : (V.has("preload") || V.has("prefetch")) && se === "style" ? U = "css" : (V.has("preload") || V.has("prefetch")) && se === "script" && (U = "script"), U && (x = "href");
    }
    if (!x || !U) return null;
    const G = I.attributes.get(x), K = Number(G?.valueStart), $ = Number(G?.valueEnd);
    return !Number.isInteger(K) || !Number.isInteger($) || K < 0 || $ < K ? null : {
      rawValue: String(G?.value || ""),
      assetKind: U,
      valueStart: K,
      valueEnd: $
    };
  }
  function h(I = "") {
    const M = [];
    for (const x of d(I)) {
      const U = g(x);
      U && M.push(U);
    }
    return M;
  }
  function y(I = "") {
    for (const M of d(I))
      if (M.tagName === "script" && String(M.attributes.get("type")?.value || "").trim().toLowerCase() === "importmap")
        return !0;
    return !1;
  }
  function _(I = "", M = "") {
    const x = String(I || "");
    if (!x) return [];
    let U = null;
    try {
      U = new URL(String(M || "").trim());
    } catch {
      U = null;
    }
    const G = [];
    for (const K of h(x)) {
      const $ = String(K.rawValue || "").trim();
      if (!(!$ || /^data:/i.test($) || /^javascript:/i.test($)))
        try {
          const V = U ? new URL($, U).toString() : new URL($).toString();
          G.push({
            rawValue: $,
            normalizedUrl: V,
            assetKind: K.assetKind
          });
        } catch {
          continue;
        }
    }
    return G.filter((K, $, V) => V.findIndex((se) => se.normalizedUrl === K.normalizedUrl) === $);
  }
  function S(I = "", M = "") {
    return _(I, M).map((x) => x.normalizedUrl);
  }
  function A(I = "") {
    return String(I || "").replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  }
  function b(I = "", M = "") {
    const x = String(I || "").trim(), U = String(M || "").trim().toLowerCase() === "css" ? "css" : "js";
    return x ? `${ie(x)}.${U}` : "";
  }
  function R(I = "/admin", M = "", x = "") {
    const U = Q(I || "/admin").replace(/\/+$/, "") || "/admin", G = ut(M), K = String(x || "").trim();
    return !G || !K ? "" : `${U}/${e.ADMIN_RELEASE_PROXY_PATH_SEGMENT}/${encodeURIComponent(G)}/${e.ADMIN_RELEASE_VENDOR_PATH_SEGMENT}/${encodeURIComponent(K)}`;
  }
  function T(I = "", M = {}) {
    const x = _(I, M.baseUrl || M.sourceUrl || "").map((U) => ({
      assetKey: b(U.normalizedUrl, U.assetKind),
      assetKind: U.assetKind,
      upstreamUrl: U.normalizedUrl
    })).filter((U) => U.assetKey && U.upstreamUrl).filter((U, G, K) => K.findIndex(($) => $.assetKey === U.assetKey) === G);
    return {
      version: 1,
      releaseTag: ut(M.releaseTag),
      sourceUrl: Pr(M.sourceUrl || M.baseUrl || ""),
      entries: x
    };
  }
  function L(I = "", M = {}, x = {}) {
    const U = String(I || "");
    if (!U) return U;
    const G = String(x.adminPath || "/admin").trim() || "/admin", K = ut(x.releaseTag), $ = new Map((Array.isArray(M?.entries) ? M.entries : []).map((me) => [String(me?.upstreamUrl || "").trim(), String(me?.assetKey || "").trim()]));
    if (!K || $.size === 0) return U;
    let V = null;
    try {
      V = new URL(String(x.baseUrl || x.sourceUrl || "").trim());
    } catch {
      V = null;
    }
    const se = [];
    for (const me of h(U)) {
      const le = String(me.rawValue || "").trim();
      if (!(!le || /^data:/i.test(le) || /^javascript:/i.test(le)))
        try {
          const ye = V ? new URL(le, V).toString() : new URL(le).toString(), xe = $.get(ye), Ge = R(G, K, xe);
          if (!xe || !Ge) continue;
          se.push({
            start: me.valueStart,
            end: me.valueEnd,
            value: Ge
          });
        } catch {
          continue;
        }
    }
    let pe = U;
    for (const me of se.sort((le, ye) => ye.start - le.start)) pe = `${pe.slice(0, me.start)}${me.value}${pe.slice(me.end)}`;
    return pe;
  }
  function D(I = {}) {
    const M = k(I) ? I : {};
    return {
      version: Number(M.version) || 1,
      releaseTag: ut(M.releaseTag),
      sourceUrl: Pr(M.sourceUrl),
      entries: (Array.isArray(M.entries) ? M.entries : []).map((x) => ({
        assetKey: String(x?.assetKey || "").trim(),
        assetKind: String(x?.assetKind || "").trim().toLowerCase() === "css" ? "css" : "script",
        upstreamUrl: Pr(x?.upstreamUrl)
      })).filter((x) => x.assetKey && x.upstreamUrl)
    };
  }
  function E(I = "") {
    let M = null;
    try {
      M = new URL(String(I || "").trim());
    } catch {
      return !1;
    }
    const x = M.hostname.replace(/\.+$/, "");
    if (!/(^|\.)jsdelivr\.net$/i.test(x) || !/^\/gh\/[^/]+\/[^/]+\//i.test(M.pathname)) return !1;
    const U = M.pathname.match(/^\/gh\/[^/]+\/[^@/]+@([^/]+)\//i);
    if (!U) return !0;
    const G = decodeURIComponent(String(U[1] || "").trim());
    return G ? !(/^[0-9a-f]{7,40}$/i.test(G) || /^v?\d+\.\d+\.\d+(?:[-+][0-9A-Za-z.-]+)?$/i.test(G)) : !0;
  }
  function w(I = "") {
    const M = String(I || ""), x = [], U = (K = "") => /[A-Za-z0-9_$]/.test(K), G = (K) => {
      let $ = K;
      for (; $ < M.length; ) {
        if (/\s/.test(M[$])) {
          $ += 1;
          continue;
        }
        if (M.startsWith("//", $)) {
          const V = M.indexOf(`
`, $ + 2);
          $ = V < 0 ? M.length : V + 1;
          continue;
        }
        if (M.startsWith("/*", $)) {
          const V = M.indexOf("*/", $ + 2);
          $ = V < 0 ? M.length : V + 2;
          continue;
        }
        break;
      }
      return $;
    };
    for (let K = 0; K < M.length; ) {
      if (M.startsWith("import", K) && !U(M[K - 1]) && !U(M[K + 6])) {
        let $ = K - 1;
        for (; $ >= 0 && /\s/.test(M[$]); ) $ -= 1;
        const V = G(K + 6);
        M[$] !== "." && M[V] === "(" && x.push({
          index: K,
          reference: M.slice(K, V + 1)
        });
      }
      K += 1;
    }
    return x;
  }
  function N(I = "") {
    const M = String(I || "");
    for (const x of d(M)) {
      if (x.tagName !== "script" || !x.contentClosed || x.attributes.get("src")?.value) continue;
      const U = String(x.attributes.get("type")?.value || "").trim().toLowerCase().split(";")[0];
      if (!(U && ![
        "module",
        "text/javascript",
        "application/javascript",
        "text/ecmascript",
        "application/ecmascript"
      ].includes(U)) && w(M.slice(x.contentStart, x.contentEnd)).length > 0)
        return !0;
    }
    return !1;
  }
  function O(I = "", M = "") {
    const x = _(I, M), U = [];
    y(I) && U.push("远端 index.html 不允许 importmap；所有运行时依赖必须通过显式 script/link 标签交付"), N(I) && U.push("index.html 不允许 inline 动态 import()；所有运行时依赖必须通过显式 script/link 标签交付");
    for (const G of x) {
      const K = String(G?.rawValue || "").trim(), $ = String(G?.normalizedUrl || "").trim();
      let V = "", se = "";
      try {
        const pe = new URL($);
        V = pe.hostname.replace(/\.+$/, "").toLowerCase(), se = pe.pathname;
      } catch {
      }
      if (!/^(?:https?:)?\/\//i.test(K)) {
        U.push(`远端 index.html 不允许相对或本地 bundle 资源：${K}`);
        continue;
      }
      if (V === "esm.sh" || V.endsWith(".esm.sh")) {
        U.push(`esm.sh 资产不再允许：${$}`);
        continue;
      }
      if (V === "raw.githubusercontent.com") {
        U.push(`raw.githubusercontent.com 资产不再允许：${$}`);
        continue;
      }
      if (V === "github.com" && /^\/[^/]+\/[^/]+\/releases\/download\//i.test(se)) {
        U.push(`浏览器直连 GitHub Release 资产不再允许：${$}`);
        continue;
      }
    }
    return U;
  }
  function C(I = "") {
    for (const M of d(I)) {
      if (o.has(M.tagName)) continue;
      const x = M.attributes.get("id");
      if (x?.quoted && x.value === "app") return !0;
    }
    return !1;
  }
  function v(I = "") {
    const M = String(I || "").trim();
    return M ? /<!doctype\s+html\b/i.test(M) || /<html\b/i.test(M) : !1;
  }
  function B(I = "", M = !1) {
    const x = String(I || "").trim().toLowerCase();
    return !x || x.includes("text/html") || x.includes("application/xhtml+xml") ? !0 : M ? x.startsWith("text/plain") || x.startsWith("application/octet-stream") : !1;
  }
  function P(I = {}) {
    const M = k(I.bootstrap) ? I.bootstrap : {}, x = k(I.initHealth) ? I.initHealth : k(M.initHealth) ? M.initHealth : {};
    return `admin-remote-shell-${ie(ee({
      templateRevision: "admin-remote-shell",
      sourceHash: ie(String(I.sourceUrl || "").trim()),
      originEtag: e.normalizeEtagToken(I.originEtag || ""),
      originLastModified: e.normalizeAdminHttpDateHeader(I.originLastModified || ""),
      htmlHash: ie(String(I.html || "")),
      variantSeed: e.buildAdminHtmlVariantEtag(M, x, "remote-admin-shell")
    }))}`;
  }
  return {
    buildAdminRemoteBootstrapMarkup: r,
    ADMIN_REMOTE_BOOTSTRAP_LOADER_HTML: t,
    ADMIN_REMOTE_TAILWIND_PRELUDE_HTML: a,
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
    extractAdminRemoteShellAssetDescriptors: _,
    extractAdminRemoteShellAssetUrls: S,
    escapeRegexForRoute: A,
    buildAdminReleaseVendorAssetKey: b,
    buildAdminReleaseVendorProxyPath: R,
    buildAdminReleaseVendorManifest: T,
    rewriteAdminRemoteShellAssetUrlsToProxy: L,
    normalizeAdminReleaseVendorManifestRecord: D,
    isMutableJsdelivrGithubAssetUrl: E,
    collectAdminInlineDynamicImports: w,
    hasAdminRemoteShellInlineDynamicImport: N,
    getAdminRemoteShellAssetPolicyViolations: O,
    hasAdminRemoteShellAppRoot: C,
    hasAdminRemoteShellHtmlDocument: v,
    isAcceptedAdminHtmlDocumentContentType: B,
    buildAdminRemoteShellVariantEtag: P
  };
}
function We(n, e) {
  return fetch(n, e);
}
function Li(n = {}) {
  const e = {};
  if (!n || typeof n != "object" || Array.isArray(n)) return e;
  for (const [r, t] of Object.entries(n)) {
    const a = String(r || "").trim().toLowerCase();
    !a || e[a] !== void 0 || (e[a] = t);
  }
  return e;
}
function ns(n = {}, e = []) {
  const r = Li(n);
  for (const t of Array.isArray(e) ? e : [e]) {
    const a = String(t || "").trim().toLowerCase();
    if (!a) continue;
    const o = r[a];
    if (!(o == null || o === ""))
      return o;
  }
  return "";
}
function ct(n = []) {
  return (Array.isArray(n) ? n : [n]).map((e) => String(e ?? "").trim()).filter(Boolean).join(":");
}
async function $t(n, e) {
  return await dn(ne.SingleFlightTasks, n, e);
}
async function dn(n, e, r) {
  const t = String(e || "").trim();
  if (!t) return await r();
  const a = n.get(t);
  if (a) return await a;
  const o = Promise.resolve().then(() => r()).finally(() => {
    n.get(t) === o && n.delete(t);
  });
  return n.set(t, o), await o;
}
function Lo(n) {
  return String(n?.__CONFIG_CACHE_NAMESPACE || n?.__WORKER_CACHE_SCOPE || "default").trim() || "default";
}
function fn(n) {
  return Ka.get(La(n), Lo(n));
}
function os(n) {
  return fn(n).ConfigCache?.data || null;
}
function ja(n) {
  if (arguments.length === 0) {
    Ka.reset();
    return;
  }
  const e = fn(n);
  e.RuntimeConfigCacheGeneration += 1, e.ConfigCache = null;
}
function Gu(n, e) {
  const r = fn(n);
  r.RuntimeConfigCacheGeneration += 1, r.ConfigCache = {
    data: e,
    exp: Date.now() + F.Defaults.CacheTTL,
    namespace: Lo(n)
  };
}
async function Wn(n, e) {
  const r = String(n), t = (ne.AdminRemoteShellCacheMutationChains.get(r) || Promise.resolve()).catch(() => null).then(() => e()).finally(() => {
    ne.AdminRemoteShellCacheMutationChains.get(r) === t && ne.AdminRemoteShellCacheMutationChains.delete(r);
  });
  return ne.AdminRemoteShellCacheMutationChains.set(r, t), await t;
}
function ju(n = {}, e = {}) {
  function r(D = "", E = {}) {
    const w = e.buildAdminHtmlResponseHeaders(E.variantEtag || "", e.ADMIN_REMOTE_SHELL_EDGE_CACHE_CONTROL), N = Number.parseInt(String(E.cachedAt || ""), 10);
    w.set(e.ADMIN_REMOTE_SHELL_CACHED_AT_HEADER, String(Number.isFinite(N) && N > 0 ? N : H()));
    const O = e.normalizeEtagToken(E.originEtag || "");
    O && w.set(e.ADMIN_REMOTE_SHELL_SOURCE_ETAG_HEADER, O);
    const C = e.normalizeAdminHttpDateHeader(E.originLastModified || "");
    C && w.set(e.ADMIN_REMOTE_SHELL_SOURCE_LAST_MODIFIED_HEADER, C);
    const v = ie(String(E.sourceUrl || "").trim());
    v && w.set(e.ADMIN_REMOTE_SHELL_SOURCE_HASH_HEADER, v);
    const B = Tt(E.shellRevision || et(E.sourceUrl));
    return B && w.set("X-Admin-Shell-Revision", B), new Response(String(D || ""), {
      status: 200,
      headers: w
    });
  }
  async function t(D, E, w, N) {
    const O = await Pe(D, e.ADMIN_REMOTE_SHELL_MAX_BYTES);
    if (O.exceeded) throw new Error("legacy remote admin shell too large");
    const C = O.text, v = e.applyAdminRemoteBootstrapMarkup(C, Xr(w)), B = D.headers.get(e.ADMIN_REMOTE_SHELL_SOURCE_ETAG_HEADER) || "", P = e.normalizeAdminHttpDateHeader(D.headers.get(e.ADMIN_REMOTE_SHELL_SOURCE_LAST_MODIFIED_HEADER) || ""), I = e.normalizeAdminHttpDateHeader(D.headers.get("Last-Modified") || "") || P;
    return r(v, {
      variantEtag: e.buildAdminRemoteShellVariantEtag({
        html: v,
        bootstrap: w,
        initHealth: N,
        sourceUrl: E,
        originEtag: B,
        originLastModified: P || I
      }),
      lastModified: I,
      originEtag: B,
      originLastModified: P || I,
      sourceUrl: E,
      cachedAt: y(D)
    });
  }
  function a(D, E = "GET") {
    if (!D) return new Response("Remote admin shell unavailable", { status: 502 });
    const w = new Headers(D.headers || {});
    return w.set("Content-Type", "text/html;charset=UTF-8"), w.set("Cache-Control", e.ADMIN_REMOTE_SHELL_BROWSER_CACHE_CONTROL), w.delete(e.ADMIN_REMOTE_SHELL_CACHED_AT_HEADER), w.delete(e.ADMIN_REMOTE_SHELL_SOURCE_ETAG_HEADER), w.delete(e.ADMIN_REMOTE_SHELL_SOURCE_LAST_MODIFIED_HEADER), w.delete(e.ADMIN_REMOTE_SHELL_SOURCE_HASH_HEADER), we(w), new Response(E === "HEAD" ? null : D.body, {
      status: D.status,
      statusText: D.statusText,
      headers: w
    });
  }
  function o(D = "", E = "") {
    const w = new URL(`/${encodeURIComponent(ut(D) || "release")}`, e.ADMIN_RELEASE_VENDOR_MANIFEST_CACHE_KEY_ORIGIN);
    return w.searchParams.set("source", ie(String(E || "").trim())), new Request(w.toString(), { method: "GET" });
  }
  function s(D = "", E = "", w = "") {
    const N = new URL(`/${encodeURIComponent(ut(D) || "release")}/${encodeURIComponent(String(E || "").trim())}`, e.ADMIN_RELEASE_VENDOR_CACHE_KEY_ORIGIN);
    return N.searchParams.set("source", ie(String(w || "").trim())), new Request(N.toString(), { method: "GET" });
  }
  function i(D = {}, E = "") {
    const w = new Headers({
      "Content-Type": "application/json;charset=UTF-8",
      "Cache-Control": e.ADMIN_REMOTE_SHELL_EDGE_CACHE_CONTROL
    }), N = String(E || D?.sourceUrl || "").trim();
    return w.set(e.ADMIN_RELEASE_VENDOR_CACHED_AT_HEADER, String(H())), N && w.set(e.ADMIN_RELEASE_VENDOR_SOURCE_HASH_HEADER, ie(N)), new Response(JSON.stringify(D), {
      status: 200,
      headers: w
    });
  }
  function c(D = "", E = "script") {
    const w = String(D || "").trim().toLowerCase(), N = String(E || "").trim().toLowerCase() === "css" ? "css" : "script";
    return w ? N === "css" ? w.includes("text/css") || w.includes("application/css") || w.startsWith("text/plain") : w.includes("javascript") || w.includes("ecmascript") || w.startsWith("text/plain") || w.startsWith("application/octet-stream") : !0;
  }
  function l(D, E = "GET") {
    const w = new Headers(D.headers);
    return w.set("Cache-Control", String(D.headers.get("Cache-Control") || e.ADMIN_RELEASE_VENDOR_CACHE_CONTROL).trim() || e.ADMIN_RELEASE_VENDOR_CACHE_CONTROL), w.delete(e.ADMIN_RELEASE_VENDOR_CACHED_AT_HEADER), w.delete(e.ADMIN_RELEASE_VENDOR_SOURCE_HASH_HEADER), we(w), new Response(E === "HEAD" ? null : D.body, {
      status: D.status,
      statusText: D.statusText,
      headers: w
    });
  }
  async function u(D, E = "", w = "") {
    if (!D || typeof D.match != "function") return null;
    const N = await D.match(o(E, w));
    if (!N) return null;
    try {
      const O = await Pe(N, Ei);
      return O.exceeded ? null : e.normalizeAdminReleaseVendorManifestRecord(JSON.parse(O.text));
    } catch {
      return null;
    }
  }
  async function d(D = "", E = "") {
    const w = ut(D), N = Pr(E);
    if (!w || !N) return null;
    const O = await We(N, { method: "GET" });
    if (!O.ok) throw new Error(`release index fetch failed: HTTP ${O.status}`);
    const C = String(O.headers.get("Content-Type") || "").trim().toLowerCase(), v = Number.parseInt(String(O.headers.get("Content-Length") || ""), 10);
    if (Number.isFinite(v) && v > e.ADMIN_REMOTE_SHELL_MAX_BYTES) throw new Error(`release index too large: ${v} bytes`);
    const B = await Pe(O, e.ADMIN_REMOTE_SHELL_MAX_BYTES), P = B.text, I = B.bytes;
    if (B.exceeded || !P || I > e.ADMIN_REMOTE_SHELL_MAX_BYTES) throw new Error(`release index payload invalid: ${I} bytes`);
    const M = e.hasAdminRemoteShellHtmlDocument(P);
    if (!e.isAcceptedAdminHtmlDocumentContentType(C, M)) throw new Error(`release index content-type invalid: ${C}`);
    if (!M) throw new Error("release index payload invalid: html document expected");
    if (!e.hasAdminRemoteShellAppRoot(P)) throw new Error("release index missing #app root");
    const x = e.getAdminRemoteShellAssetPolicyViolations(P, N);
    if (x.length > 0) throw new Error(`release index asset policy invalid: ${x.slice(0, 3).join(" | ")}`);
    return e.normalizeAdminReleaseVendorManifestRecord(e.buildAdminReleaseVendorManifest(P, {
      releaseTag: w,
      sourceUrl: N
    }));
  }
  async function f(D, E = {}, w = null) {
    const N = e.normalizeAdminReleaseVendorManifestRecord(E);
    if (!D || typeof D.put != "function" || !N.releaseTag || !N.sourceUrl) return N;
    const O = he(D.put(o(N.releaseTag, N.sourceUrl), i(N, N.sourceUrl)), "admin.release_vendor_manifest_cache_write", { releaseTag: N.releaseTag }, null);
    return w && typeof w.waitUntil == "function" ? w.waitUntil(O) : await O, N;
  }
  async function m(D, E = "", w = "", N = null) {
    const O = await u(D, E, w);
    if (O?.entries?.length) return O;
    const C = await d(E, w);
    return C ? (await f(D, C, N), C) : null;
  }
  function p(D = {}, E = "") {
    const w = String(E || "").trim();
    return w && (Array.isArray(D?.entries) ? D.entries : []).find((N) => String(N?.assetKey || "").trim() === w) || null;
  }
  function g(D = "", E = "/admin") {
    const w = Q(E || "/admin").replace(/\/+$/, "") || "/admin", N = Q(D || "/"), O = new RegExp(`^${e.escapeRegexForRoute(w)}/${e.ADMIN_RELEASE_PROXY_PATH_SEGMENT}/([^/]+)/${e.ADMIN_RELEASE_VENDOR_PATH_SEGMENT}/([^/]+)/*$`, "i"), C = N.match(O);
    if (!C) return null;
    try {
      return {
        releaseTag: ut(decodeURIComponent(String(C[1] || ""))),
        assetKey: String(decodeURIComponent(String(C[2] || "")) || "").trim()
      };
    } catch {
      return null;
    }
  }
  function h(D = "", E = "/admin") {
    const w = Q(E || "/admin").replace(/\/+$/, "") || "/admin";
    return (Q(D || "/").replace(/\/+$/, "") || "/").toLowerCase() === `${w}/${e.ADMIN_WARM_PATH_SEGMENT}`.toLowerCase();
  }
  function y(D) {
    const E = Number.parseInt(String(D?.headers?.get?.(e.ADMIN_REMOTE_SHELL_CACHED_AT_HEADER) || ""), 10);
    return Number.isFinite(E) && E > 0 ? E : 0;
  }
  function _(D) {
    const E = y(D);
    return E ? H() - E >= e.ADMIN_REMOTE_SHELL_REVALIDATE_MS : !0;
  }
  function S(D = "", E = "", w = {}) {
    const N = String(D || ""), O = String(w.sourceLabel || "admin shell").trim() || "admin shell", C = String(w.contentType || "").trim().toLowerCase(), v = new TextEncoder().encode(N).length;
    if (!N || v > e.ADMIN_REMOTE_SHELL_MAX_BYTES) throw new Error(`${O} payload invalid: ${v} bytes`);
    const B = e.hasAdminRemoteShellHtmlDocument(N);
    if (!e.isAcceptedAdminHtmlDocumentContentType(C, B)) throw new Error(`${O} content-type invalid: ${C}`);
    if (!B) throw new Error(`${O} payload invalid: html document expected`);
    if (!e.hasAdminRemoteShellAppRoot(N)) throw new Error(`${O} missing #app root`);
    const P = e.getAdminRemoteShellAssetPolicyViolations(N, E);
    if (P.length > 0) throw new Error(`${O} asset policy invalid: ${P.slice(0, 3).join(" | ")}`);
    return {
      html: N,
      bytes: v
    };
  }
  function A(D = "", E = {}, w = {}, N = "", O = {}) {
    const C = S(D, N, O), v = ut(O.assetRevision || O.releaseTag), B = v ? e.normalizeAdminReleaseVendorManifestRecord(e.buildAdminReleaseVendorManifest(C.html, {
      releaseTag: v,
      sourceUrl: N
    })) : null, P = B?.entries?.length ? e.rewriteAdminRemoteShellAssetUrlsToProxy(C.html, B, {
      adminPath: String(O.adminPath || E?.adminPath || "/admin").trim() || "/admin",
      releaseTag: v,
      sourceUrl: N
    }) : C.html, I = e.applyAdminRemoteBootstrapMarkup(P, Xr(E)), M = e.normalizeAdminHttpDateHeader(O.lastModified || "") || (/* @__PURE__ */ new Date()).toUTCString(), x = String(O.originEtag || "").trim();
    return {
      storedResponse: r(I, {
        variantEtag: e.buildAdminRemoteShellVariantEtag({
          html: I,
          bootstrap: E,
          initHealth: w,
          sourceUrl: N,
          originEtag: x,
          originLastModified: M
        }),
        lastModified: M,
        originEtag: x,
        originLastModified: M,
        sourceUrl: N,
        shellRevision: et(N)
      }),
      vendorManifest: B
    };
  }
  async function b(D = "", E = "index.html") {
    const w = String(D || ""), N = await vn(w), O = Gr(N);
    let C;
    try {
      C = S(w, O, {
        sourceLabel: "local admin index",
        contentType: "text/html"
      });
    } catch (P) {
      throw P && typeof P == "object" && (P.code = String(P.code || "ADMIN_INDEX_UPLOAD_INVALID"), P.status = De(P.status, 400)), P;
    }
    const v = Ro(N), B = e.normalizeAdminReleaseVendorManifestRecord(e.buildAdminReleaseVendorManifest(C.html, {
      releaseTag: v,
      sourceUrl: O
    }));
    return {
      version: 1,
      revision: N,
      assetRevision: v,
      sourceUrl: O,
      fileName: (String(E || "index.html").trim().replace(/^.*[\\/]/, "") || "index.html").slice(0, 180),
      uploadedAt: (/* @__PURE__ */ new Date()).toISOString(),
      bytes: C.bytes,
      html: C.html,
      manifest: B
    };
  }
  async function R(D, E, w, N = null, O = {}) {
    if (et(D)) {
      const $ = typeof O.loadLocalIndexRecord == "function" ? await O.loadLocalIndexRecord() : null;
      if (!$?.html) throw new Error("local admin index upload is missing");
      return A($.html, E, w, D, {
        sourceLabel: "local admin index",
        contentType: "text/html",
        adminPath: O.adminPath,
        assetRevision: O.assetRevision || $.assetRevision,
        lastModified: $.uploadedAt
      });
    }
    const C = new Headers(), v = e.normalizeEtagToken(N?.headers?.get?.(e.ADMIN_REMOTE_SHELL_SOURCE_ETAG_HEADER) || ""), B = e.normalizeAdminHttpDateHeader(N?.headers?.get?.(e.ADMIN_REMOTE_SHELL_SOURCE_LAST_MODIFIED_HEADER) || "");
    v && C.set("If-None-Match", v), B && C.set("If-Modified-Since", B);
    const P = await We(D, {
      method: "GET",
      headers: C
    });
    if (P.status === 304 && N) {
      const $ = await Pe(N, e.ADMIN_REMOTE_SHELL_MAX_BYTES);
      if ($.exceeded) throw new Error("cached remote admin shell too large");
      const V = $.text;
      return {
        storedResponse: r(V, {
          variantEtag: e.normalizeEtagToken(N.headers.get("ETag") || ""),
          lastModified: e.normalizeAdminHttpDateHeader(N.headers.get("Last-Modified") || ""),
          originEtag: v,
          originLastModified: B,
          sourceUrl: D
        }),
        vendorManifest: null
      };
    }
    if (!P.ok) throw new Error(`remote admin shell fetch failed: HTTP ${P.status}`);
    const I = String(P.headers.get("Content-Type") || "").trim().toLowerCase(), M = Number.parseInt(String(P.headers.get("Content-Length") || ""), 10);
    if (Number.isFinite(M) && M > e.ADMIN_REMOTE_SHELL_MAX_BYTES) throw new Error(`remote admin shell too large: ${M} bytes`);
    const x = await Pe(P, e.ADMIN_REMOTE_SHELL_MAX_BYTES), U = x.text, G = x.bytes;
    if (x.exceeded || !U || G > e.ADMIN_REMOTE_SHELL_MAX_BYTES) throw new Error(`remote admin shell payload invalid: ${G} bytes`);
    const K = e.normalizeAdminHttpDateHeader(P.headers.get("Last-Modified") || "") || (/* @__PURE__ */ new Date()).toUTCString();
    return A(U, E, w, D, {
      sourceLabel: "remote admin shell",
      contentType: I,
      adminPath: O.adminPath,
      assetRevision: O.assetRevision || O.releaseTag,
      lastModified: K,
      originEtag: P.headers.get("ETag") || ""
    });
  }
  async function T(D, E, w, N, O, C, v, B = {}, P = null) {
    if (!E || typeof E.put != "function") return null;
    const I = await R(N, O, C, v, B), M = I?.storedResponse || null;
    return M ? (await E.put(w, M.clone()), I?.vendorManifest?.entries?.length && await f(E, I.vendorManifest, P), M) : null;
  }
  async function L(D, E, w, N, O, C = {}) {
    return $t(ct(["admin_remote_shell_cold_load", E.url]), () => Wn(E.url, async () => {
      if (D && typeof D.match == "function") {
        const P = await D.match(E);
        if (P) return {
          storedResponse: P,
          vendorManifest: null,
          loadedFromCache: !0
        };
      }
      const v = await R(w, N, O, null, C), B = v?.storedResponse || null;
      return B ? (D && typeof D.put == "function" && (await D.put(E, B.clone()), v?.vendorManifest?.entries?.length && await f(D, v.vendorManifest, null)), {
        ...v,
        loadedFromCache: !1
      }) : v;
    }));
  }
  return {
    buildAdminRemoteShellStoredResponse: r,
    migrateLegacyAdminRemoteShellStoredResponse: t,
    buildAdminRemoteShellClientResponse: a,
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
    shouldRevalidateAdminRemoteShell: _,
    validateAdminShellHtmlSource: S,
    buildAdminShellStoredPayloadFromHtml: A,
    buildAdminLocalIndexUploadRecord: b,
    fetchAdminRemoteShellStoredResponse: R,
    revalidateAdminRemoteShellCache: T,
    loadAdminRemoteShellColdCache: L
  };
}
function Vu(n = {}, e = {}) {
  const { indexRepository: r } = n;
  async function t(u, d, f, m = Ke(d), p = {}) {
    const g = d?.ASSETS;
    if (!g || typeof g.fetch != "function") return null;
    const h = new URL("/index.html", u.url), y = await g.fetch(new Request(h, {
      method: "GET",
      headers: { Accept: "text/html" }
    }));
    if (!y?.ok) throw new Error(`bundled admin shell fetch failed: HTTP ${Number(y?.status) || 0}`);
    const _ = Number.parseInt(String(y.headers.get("Content-Length") || ""), 10);
    if (Number.isFinite(_) && _ > e.ADMIN_REMOTE_SHELL_MAX_BYTES) throw new Error(`bundled admin shell too large: ${_} bytes`);
    const S = await Pe(y, e.ADMIN_REMOTE_SHELL_MAX_BYTES);
    if (S.exceeded || !S.text) throw new Error(`bundled admin shell payload invalid: ${S.bytes} bytes`);
    const A = e.buildAdminShellState(d, m, p), b = e.buildAdminBootstrapPayload(d, m, p), R = dt(d, p), T = h.toString(), L = e.buildAdminShellStoredPayloadFromHtml(S.text, b, m, T, {
      sourceLabel: "bundled admin shell",
      contentType: y.headers.get("Content-Type") || "text/html",
      adminPath: b.adminPath,
      lastModified: y.headers.get("Last-Modified") || "Thu, 01 Jan 1970 00:00:00 GMT",
      originEtag: y.headers.get("ETag") || ""
    })?.storedResponse || null;
    if (!L) throw new Error("bundled admin shell response is unavailable");
    return await e.patchAdminShellRuntimeStatus(d, {
      shellState: A,
      initHealth: m,
      indexState: R,
      mode: "embedded",
      sourceType: "static_assets",
      routeState: "embedded_active",
      gateState: "shell_ready",
      lifecycleState: "embedded_only",
      embeddedFallbackState: "active",
      remoteCacheState: "bypassed",
      lastFetchStatus: "loaded",
      reason: "served_bundled_admin_shell",
      requestPath: new URL(u.url).pathname,
      indexUrl: T,
      indexUrlSource: "worker_assets",
      effectiveRef: "frontend/dist/index.html",
      effectiveRefType: "static_assets"
    }, f), e.requestMatchesAdminHtmlResponse(u, L) ? e.buildConditionalNotModifiedResponseFromStoredResponse(L, e.ADMIN_REMOTE_SHELL_BROWSER_CACHE_CONTROL) : e.buildAdminRemoteShellClientResponse(L, u.method);
  }
  async function a(u, d, f, m = Ke(d), p = {}, g = "index_url_not_configured") {
    const h = dt(d, p), y = e.buildAdminShellState(d, m, p), _ = e.buildAdminBootstrapPayload(d, m, p), S = Xr(_), A = zn(m), b = new URL(u.url).pathname;
    await e.patchAdminShellRuntimeStatus(d, {
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
    const R = e.buildAdminIndexSetupContent(_, y, m, p, h), T = e.renderAdminHtmlShell(S, A, R);
    return new Response(u.method === "HEAD" ? null : T, { headers: e.buildAdminHtmlResponseHeaders("", "no-store, max-age=0") });
  }
  function o(u) {
    const d = String(new URL(u.url).searchParams.get("setup") || "").trim().toLowerCase();
    return d === "1" || d === "true";
  }
  async function s(u, d, f, m = Ke(d), p = {}, g = {}) {
    const h = e.buildAdminShellState(d, m, g), y = e.buildAdminBootstrapPayload(d, m, g), _ = dt(d, g), S = Xr(y), A = zn(m), b = new URL(u.url).pathname, R = {
      ...p,
      shellState: h,
      initHealth: m,
      indexState: _,
      remoteShellIndexUrl: p.remoteShellIndexUrl || h.remoteShellIndexUrl || _.indexUrl || "",
      mode: "remote_error",
      sourceType: p.sourceType || "remote_error",
      routeState: p.routeState || "remote_error",
      remoteCacheState: p.remoteCacheState || "bypassed",
      lastFetchStatus: p.lastFetchStatus || "failed",
      reason: p.reason || "remote_shell_render_failed",
      requestPath: b
    }, T = e.buildAdminRemoteShellErrorContent(y, h, m, R);
    await e.patchAdminShellRuntimeStatus(d, R, f);
    const L = e.renderAdminHtmlShell(S, A, T);
    return new Response(u.method === "HEAD" ? null : L, { headers: e.buildAdminHtmlResponseHeaders("", "no-store, max-age=0") });
  }
  async function i(u, d, f, m = Ke(d), p = e.resolveAdminShellIndexUrl(d), g = {}) {
    const h = ur(), y = e.buildAdminShellState(d, m, g), _ = e.buildAdminBootstrapPayload(d, m, g), S = dt(d, g), A = {
      releaseTag: S.assetRevision || S.releaseTag,
      assetRevision: S.assetRevision || S.releaseTag,
      adminPath: _.adminPath,
      ...S.isLocalUpload ? { loadLocalIndexRecord: () => r.getAdminIndexUploadRecord(r.getKV(d), S.localUploadRevision) } : {}
    }, b = e.buildAdminRemoteShellCacheKeyRequest(u, p, _), R = e.buildAdminRemoteShellLegacyCacheKeyRequest(u, p), T = new URL(u.url).pathname;
    if (h && typeof h.match == "function") {
      const w = await $t(ct(["admin_remote_shell_cache_read", b.url]), async () => {
        const C = await h.match(b);
        if (C) return {
          storedResponse: C,
          legacyCacheMigrated: !1
        };
        const v = await h.match(R);
        if (!v) return null;
        const B = await he(e.migrateLegacyAdminRemoteShellStoredResponse(v, p, _, m), "admin.remote_shell_legacy_cache_read", {
          path: T,
          remoteShellIndexUrl: p
        }, null);
        return B ? await Wn(b.url, async () => {
          const P = await h.match(b);
          return P ? {
            storedResponse: P,
            legacyCacheMigrated: !1
          } : (typeof h.put == "function" && await he(h.put(b, B.clone()), "admin.remote_shell_legacy_cache_migrate", {
            path: T,
            remoteShellIndexUrl: p
          }, null), {
            storedResponse: B,
            legacyCacheMigrated: !0
          });
        }) : null;
      }), N = w === null ? null : w.storedResponse.clone(), O = w !== null && w.legacyCacheMigrated;
      if (N) {
        const C = e.shouldRevalidateAdminRemoteShell(N);
        let v = null;
        if (C) {
          const I = N.clone();
          v = $t(ct(["admin_remote_shell_revalidate", b.url]), async () => he(Wn(b.url, () => e.revalidateAdminRemoteShellCache(u, h, b, p, _, m, I, A, f)), "admin.remote_shell_revalidate", {
            path: T,
            remoteShellIndexUrl: p
          }, null));
        }
        const B = e.patchAdminShellRuntimeStatus(d, {
          shellState: y,
          initHealth: m,
          indexState: S,
          remoteShellIndexUrl: p,
          mode: "remote",
          sourceType: O ? "remote_legacy_cache" : "remote_cache",
          routeState: "remote_active",
          remoteCacheState: O ? C ? "legacy_stale_hit" : "legacy_hit" : C ? "stale_hit" : "hit",
          revalidateDue: C,
          lastFetchStatus: "cached",
          reason: O ? C ? "migrated_legacy_remote_shell_and_scheduled_revalidate" : "migrated_legacy_remote_shell" : C ? "served_cached_remote_shell_and_scheduled_revalidate" : "served_cached_remote_shell",
          requestPath: T,
          throttleStableWrites: !0
        }, null), P = v ? Promise.all([v, B]) : B;
        return f && typeof f.waitUntil == "function" && f.waitUntil(P), e.requestMatchesAdminHtmlResponse(u, N) ? e.buildConditionalNotModifiedResponseFromStoredResponse(N, e.ADMIN_REMOTE_SHELL_BROWSER_CACHE_CONTROL) : e.buildAdminRemoteShellClientResponse(N, u.method);
      }
    }
    const L = await e.loadAdminRemoteShellColdCache(h, b, p, _, m, A), D = (L?.storedResponse ? {
      ...L,
      storedResponse: L.storedResponse.clone()
    } : L)?.storedResponse || null;
    if (!D) throw new Error("remote admin shell payload missing");
    const E = $t(ct(["admin_remote_shell_cold_status", b.url]), () => e.patchAdminShellRuntimeStatus(d, {
      shellState: y,
      initHealth: m,
      indexState: S,
      remoteShellIndexUrl: p,
      mode: "remote",
      sourceType: L?.loadedFromCache ? "remote_cache" : "remote_fetch",
      routeState: "remote_active",
      remoteCacheState: L?.loadedFromCache ? "filled_while_waiting" : "miss",
      lastFetchStatus: L?.loadedFromCache ? "cached" : "fetched",
      reason: L?.loadedFromCache ? "served_cache_filled_while_waiting" : "fetched_remote_shell_index",
      requestPath: T
    }, null));
    return f && typeof f.waitUntil == "function" ? f.waitUntil(E) : await E, e.requestMatchesAdminHtmlResponse(u, D) ? e.buildConditionalNotModifiedResponseFromStoredResponse(D, e.ADMIN_REMOTE_SHELL_BROWSER_CACHE_CONTROL) : e.buildAdminRemoteShellClientResponse(D, u.method);
  }
  function c(u = "Release vendor asset unavailable", d = 502) {
    const f = new Headers({
      "Content-Type": "text/plain;charset=UTF-8",
      "Cache-Control": "no-store, max-age=0"
    });
    return we(f), new Response(String(u || "Release vendor asset unavailable"), {
      status: d,
      headers: f
    });
  }
  async function l(u, d, f, m = null, p = {}) {
    const g = ut(m?.releaseTag), h = String(m?.assetKey || "").trim();
    if (!g || !h) return c("Release vendor asset not found", 404);
    const y = ur(), _ = du(g);
    if (!_) return c("Local index vendor asset not found", 404);
    const S = _ ? await r.getAdminIndexUploadRecord(r.getKV(d), _) : null;
    if (_ && !S) return c("Local index vendor asset not found", 404);
    const A = S?.sourceUrl || "";
    if (!A) return c("Release vendor asset not found", 404);
    let b = null;
    S?.manifest ? (b = await e.readAdminReleaseVendorManifestFromCache(y, g, A), b || (b = await e.cacheAdminReleaseVendorManifest(y, S.manifest, f))) : b = await e.getOrCreateAdminReleaseVendorManifest(y, g, A, f);
    const R = e.resolveAdminReleaseVendorManifestEntry(b, h);
    if (!R?.upstreamUrl) return c("Release vendor asset not found", 404);
    const T = e.isMutableJsdelivrGithubAssetUrl(R.upstreamUrl), L = T ? e.ADMIN_RELEASE_VENDOR_MUTABLE_CACHE_CONTROL : e.ADMIN_RELEASE_VENDOR_CACHE_CONTROL, D = e.buildAdminReleaseVendorAssetCacheKeyRequest(g, h, R.upstreamUrl);
    if (!T && y && typeof y.match == "function") {
      const M = await y.match(D);
      if (M)
        return e.requestMatchesAdminHtmlResponse(u, M) ? e.buildConditionalNotModifiedResponseFromStoredResponse(M, L) : e.buildAdminReleaseVendorClientResponse(M, u.method);
    }
    let E = null;
    try {
      E = await We(R.upstreamUrl, {
        method: "GET",
        headers: { Accept: R.assetKind === "css" ? "text/css, text/plain;q=0.9, */*;q=0.1" : "application/javascript, text/javascript, text/plain;q=0.9, */*;q=0.1" }
      });
    } catch (M) {
      return c(`Release vendor asset fetch failed: ${String(M?.message || M || "unknown_error").trim() || "unknown_error"}`, 502);
    }
    if (!E.ok) return c(E.status === 404 ? "Release vendor asset not found" : `Release vendor asset fetch failed (HTTP ${E.status})`, E.status === 404 ? 404 : 502);
    const w = String(E.headers.get("Content-Type") || "").trim();
    if (!e.isAcceptedAdminReleaseVendorContentType(w, R.assetKind)) return c(`Release vendor asset content-type invalid: ${w || "unknown"}`, 502);
    const N = Number.parseInt(String(E.headers.get("Content-Length") || ""), 10);
    if (Number.isFinite(N) && N > e.ADMIN_RELEASE_VENDOR_MAX_BYTES) return c(`Release vendor asset too large: ${N} bytes`, 502);
    const O = await $s(E, e.ADMIN_RELEASE_VENDOR_MAX_BYTES), C = O.bytes;
    if (O.exceeded || !C || C > e.ADMIN_RELEASE_VENDOR_MAX_BYTES) return c(`Release vendor asset payload invalid: ${C} bytes`, 502);
    const v = new Headers({ "Cache-Control": L }), B = e.normalizeEtagToken(E.headers.get("ETag") || ""), P = e.normalizeAdminHttpDateHeader(E.headers.get("Last-Modified") || "");
    w && v.set("Content-Type", w), B && v.set("ETag", e.formatAdminHtmlEtag(B)), P && v.set("Last-Modified", P), v.set(e.ADMIN_RELEASE_VENDOR_CACHED_AT_HEADER, String(H())), v.set(e.ADMIN_RELEASE_VENDOR_SOURCE_HASH_HEADER, ie(R.upstreamUrl));
    const I = new Response(O.bodyBytes, {
      status: 200,
      headers: v
    });
    if (!T && y && typeof y.put == "function") {
      const M = he(y.put(D, I.clone()), "admin.release_vendor_cache_write", {
        releaseTag: g,
        assetKey: h
      }, null);
      f && typeof f.waitUntil == "function" ? f.waitUntil(M) : await M;
    }
    return e.requestMatchesAdminHtmlResponse(u, I) ? e.buildConditionalNotModifiedResponseFromStoredResponse(I, L) : e.buildAdminReleaseVendorClientResponse(I, u.method);
  }
  return {
    renderBundledAdminPage: t,
    renderAdminIndexSetupPage: a,
    isAdminIndexSetupForced: o,
    renderAdminRemoteShellErrorPage: s,
    renderRemoteAdminPage: i,
    buildAdminReleaseVendorErrorResponse: c,
    renderAdminReleaseVendorAsset: l
  };
}
function qu(n = {}) {
  return {
    ...Vs,
    ...sa,
    "Content-Type": "application/json; charset=utf-8",
    "Cache-Control": "no-store, max-age=0",
    ...n
  };
}
function te(n, e = 200, r = {}) {
  return new Response(JSON.stringify(n), {
    status: e,
    headers: qu(r)
  });
}
function W(n, e, r = 400, t = null, a = {}) {
  const o = {
    ok: !1,
    error: {
      code: n,
      message: e
    }
  };
  return t != null && (o.error.details = t), te(o, r, a);
}
async function Xu(n) {
  const e = new Headers(n.headers || {});
  if (e.set("Content-Type", "application/json; charset=utf-8"), e.set("Cache-Control", "no-store, max-age=0"), Object.entries(sa).forEach(([c, l]) => e.set(c, l)), we(e), n.ok) return new Response(n.body, {
    status: n.status,
    headers: e
  });
  const r = await Pe(n, nn);
  let t = null;
  const a = r.text;
  try {
    t = JSON.parse(a);
  } catch {
  }
  const o = t?.error?.code || (typeof t?.error == "string" ? t.error.toUpperCase() : `HTTP_${n.status}`), s = t?.error?.message || t?.message || (typeof t?.error == "string" ? t.error : a || n.statusText || "request_failed"), i = t?.error?.details ?? t?.details ?? null;
  return W(o, s, n.status || 500, i);
}
function Or(n = "") {
  return String(n || "").trim().toLowerCase() === "simplified" ? "simplified" : "legacy";
}
function Di(n = "") {
  const e = String(n || "").trim().toLowerCase();
  return e === "balanced" ? "balanced" : e === "aggressive" ? "aggressive" : "compat";
}
function Do(n = {}) {
  const e = n?.enableH2 === !0, r = n?.enableH3 === !0;
  return !e && !r ? "compat" : n?.peakDowngrade === !1 ? "aggressive" : "balanced";
}
var Ni = Object.freeze([
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
function Ii(n = "") {
  const e = String(n || "").trim().toLowerCase();
  return e === "summary" || e === "kv" || e === "d1" ? e : "";
}
function Yu(n = []) {
  const e = [], r = /* @__PURE__ */ new Set();
  for (const t of Array.isArray(n) ? n : [n]) {
    const a = Ii(t);
    !a || r.has(a) || (r.add(a), e.push(a));
  }
  return e;
}
function Ju(n = {}) {
  return Ni.some(({ configKey: e }) => ua(n, e));
}
function Mi(n = {}, e = n) {
  const r = n && typeof n == "object" ? n : {}, t = e && typeof e == "object" ? e : {};
  return r.tgDailyReportEnabled === !0 && !Ju(t);
}
function Qu(n = {}, e = {}) {
  const r = n && typeof n == "object" ? n : {};
  return Mi(r, e && typeof e == "object" ? e : {}) ? (r.tgDailyReportSummaryEnabled = !0, r.tgDailyReportKvEnabled = !1, r.tgDailyReportD1Enabled = !1, r) : (r.tgDailyReportSummaryEnabled = r.tgDailyReportSummaryEnabled === !0, r.tgDailyReportKvEnabled = r.tgDailyReportKvEnabled === !0, r.tgDailyReportD1Enabled = r.tgDailyReportD1Enabled === !0, r);
}
function Pi(n = {}, e = n, r = {}) {
  const t = n && typeof n == "object" ? n : {}, a = Yu(r?.reportKinds);
  if (a.length > 0) return a;
  const o = Ni.filter(({ configKey: s }) => t[s] === !0).map(({ kind: s }) => s);
  return o.length > 0 ? o : r?.fallbackAllWhenLegacy === !0 && Mi(t, e) ? ["summary"] : [];
}
function Zu(n = {}) {
  return Or(n?.routingDecisionMode);
}
function vr(n = "") {
  const e = String(n || "").trim().toLowerCase();
  return e === "legacy" || e === "simplified" ? e : "inherit";
}
function ed(n = {}, e = {}) {
  const r = vr(n?.routingDecisionMode);
  return r === "inherit" ? Zu(e) : r;
}
function ir(n) {
  const e = String(n ?? "").trim();
  if (!e) return "";
  if (!/^\d{1,5}$/.test(e)) return null;
  const r = Number(e);
  return !Number.isInteger(r) || r < 1 || r > 65535 ? null : String(r);
}
function td(n) {
  return n === "http:" ? "80" : n === "https:" ? "443" : "";
}
function rd(n) {
  const e = String(n?.username || ""), r = String(n?.password || "");
  return !e && !r ? "" : `${e}${r ? `:${r}` : ""}@`;
}
function ad(n, e = "") {
  if (!(n instanceof URL)) return "";
  const r = String(n.protocol || "").trim().toLowerCase();
  if (!["http:", "https:"].includes(r)) return "";
  const t = ir(e);
  if (t === null) return "";
  const a = String(n.hostname || "").trim();
  if (!a) return "";
  const o = String(n.pathname || "/") || "/", s = String(n.search || ""), i = String(n.hash || "");
  return `${r}//${rd(n)}${a}${t ? `:${t}` : ""}${o}${s}${i}`.replace(/\/$/, "");
}
function ss(n, e = "", r = "") {
  const t = String(n || "").trim();
  if (!t) return null;
  try {
    const a = new URL(t);
    if (!["http:", "https:"].includes(a.protocol)) return null;
    const o = ir(a.port), s = ir(e), i = ir(r);
    return o === null || s === null || i === null ? null : ad(a, o || s || i || td(a.protocol)) || null;
  } catch {
    return null;
  }
}
function nd(n = "") {
  const e = String(n || "").trim();
  if (!e) return !1;
  try {
    const r = new URL(e);
    if (!["http:", "https:"].includes(r.protocol)) return !1;
    const t = e.match(/^[a-z][a-z0-9+.-]*:\/\/([^/?#]*)/i);
    if (!t) return !1;
    let a = String(t[1] || "");
    const o = a.lastIndexOf("@");
    if (o >= 0 && (a = a.slice(o + 1)), !a) return !1;
    if (a.startsWith("[")) {
      const s = a.indexOf("]");
      return s < 0 ? !1 : /^:\d+$/.test(a.slice(s + 1));
    }
    return /:\d+$/.test(a);
  } catch {
    return !1;
  }
}
function is(n = "") {
  const e = String(n || "").trim();
  if (!e) return !1;
  try {
    const r = new URL(e);
    return ["http:", "https:"].includes(r.protocol) ? !nd(e) : !1;
  } catch {
    return !1;
  }
}
function be(n) {
  return JSON.stringify(String(n ?? ""));
}
function Nt(n = "/") {
  const e = Q(n || "/");
  return e === "/" ? "" : e.replace(/\/+$/, "");
}
function mn(n) {
  try {
    const e = n instanceof URL ? n : new URL(String(n || ""));
    if (!["http:", "https:"].includes(e.protocol)) return null;
    const r = String(e.origin || "").trim();
    if (!r) return null;
    const t = Nt(e.pathname);
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
function qe(n) {
  return rt(n) ? String(n.absoluteBasePrefix || n.originText || "").trim() : "";
}
function od(n = []) {
  return ie(ee((Array.isArray(n) ? n : []).map((e) => qe(e)).filter(Boolean)));
}
function sd(n = []) {
  return new Set((Array.isArray(n) ? n : []).map((e) => qe(e)).filter(Boolean)).size;
}
function wa(n = "", e = F.Defaults.HedgeProbePath) {
  const r = String(n || e || "").trim() || String(e || "/emby/system/ping").trim() || "/emby/system/ping";
  try {
    return Q(new URL(r, "https://hedge-probe.invalid").pathname || "/");
  } catch {
    return Q(r);
  }
}
function ca(n = "") {
  const e = String(n || "").trim();
  return e ? wa(e, F.Defaults.HedgeProbePath) : "";
}
function rt(n) {
  return !!n && typeof n == "object" && n.targetUrl instanceof URL && typeof n.originText == "string" && typeof n.normalizedBasePath == "string" && typeof n.absoluteBasePrefix == "string";
}
function cs(n = "") {
  const e = String(n || "");
  return e ? e.startsWith("?") ? e : `?${e}` : "";
}
function id(n = "GET", e = {}, r = {}) {
  const t = String(n || "GET").toUpperCase();
  return !(t !== "GET" && t !== "HEAD" || e?.isSegment !== !0 || e?.isWsUpgrade === !0 || r.playbackRelayTargetUrl instanceof URL || r.protocolFallbackRetry === !0 || r.isExternalRedirect === !0);
}
var pn = ["proxyMode", "mode"], gn = [
  "direct",
  "sourceDirect",
  "directSource",
  "direct2xx"
], xi = [
  "wangpanMode",
  "videoThrottling",
  "interceptMs"
], Oi = "__playback-relay", vi = "__pb_target", Gn = "__pb_abs", jn = Object.freeze({
  main: "",
  proxy_a: "__proxy-a",
  proxy_b: "__proxy-b"
});
[
  ...pn,
  ...gn,
  ...xi
];
function cd(n = {}) {
  const e = n && typeof n == "object" && !Array.isArray(n) ? n : {}, r = [];
  let t = !1;
  const a = ir(e.port), o = Array.isArray(e.lines) ? e.lines.reduce((i, c) => i + (ir(c?.port) ? 1 : 0), 0) : 0, s = Array.isArray(e.lines) && e.lines.length ? e.lines.reduce((i, c) => ir(c?.port) || a ? i : i + (is(c?.target) ? 1 : 0), 0) : a ? 0 : String(e.target || "").split(",").map((i) => i.trim()).filter(Boolean).reduce((i, c) => i + (is(c) ? 1 : 0), 0);
  for (const i of pn) {
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
  for (const i of gn)
    Object.prototype.hasOwnProperty.call(e, i) && (r.push(i), e[i] === !0 && (t = !0));
  for (const i of xi)
    Object.prototype.hasOwnProperty.call(e, i) && r.push(i);
  return {
    legacyKeysPresent: Jt(r),
    shouldAddToSourceDirectNodes: t,
    topLevelPortPresent: a !== null && a !== "",
    linePortCount: o,
    defaultPortNodePresent: s > 0,
    defaultPortLineCount: s
  };
}
function ld(n, e = {}) {
  const r = Br(n);
  return {
    mode: r,
    forceVideoDirect: r === "direct",
    forceVideoProxy: r === "proxy"
  };
}
function ud(n = {}) {
  return Xs(n?.defaultMediaAuthMode);
}
function Va(n = {}) {
  return ua(n, "defaultPlaybackInfoMode") ? zt(n?.defaultPlaybackInfoMode) : Reflect.get(n, "playbackInfoAutoProxy") !== void 0 ? Reflect.get(n, "playbackInfoAutoProxy") !== !1 ? "rewrite" : "passthrough" : Reflect.get(n, "playbackInfoBlockWangpanProxy") !== void 0 ? "rewrite" : F.Defaults.DefaultPlaybackInfoMode;
}
function dd(n = {}) {
  return zt(Va(n));
}
function fd(n = {}) {
  return yo(n?.defaultRealClientIpMode);
}
function md(n = {}, e = {}) {
  const r = n || {}, t = n && typeof n == "object" && Object.prototype.hasOwnProperty.call(n, "mediaAuthMode") ? ar(r.mediaAuthMode) : "auto";
  return t === "inherit" ? ud(e) : t;
}
function pd(n = {}, e = {}) {
  const r = n || {}, t = n && typeof n == "object" && Object.prototype.hasOwnProperty.call(n, "playbackInfoMode") ? Mr(r.playbackInfoMode) : "inherit";
  return t === "inherit" ? dd(e) : t;
}
function gd(n = {}, e = {}) {
  const r = n || {}, t = n && typeof n == "object" && Object.prototype.hasOwnProperty.call(n, "realClientIpMode") ? Ir(r.realClientIpMode) : "forward";
  return t === "inherit" ? fd(e) : t;
}
function hd(n = {}, e = {}) {
  const r = n || {};
  return (n && typeof n == "object" && Object.prototype.hasOwnProperty.call(n, "hedgeProbePath") ? ca(r.hedgeProbePath) : "") || wa(e?.hedgeProbePath, F.Defaults.HedgeProbePath);
}
function yd(n) {
  const e = yo(typeof n == "string" ? n : n?.realClientIpMode);
  return e === "forward" ? "full" : e === "strip" ? "real-ip-only" : e === "disable" ? "none" : "full";
}
function Fi(n = "") {
  const e = String(n || "").trim().toLowerCase();
  return e === "proxy_a" || e === "__proxy-a" ? "proxy_a" : e === "proxy_b" || e === "__proxy-b" ? "proxy_b" : "main";
}
function Sd(n = "main") {
  return jn[Fi(n)] || "";
}
function Ui(n = "") {
  const e = String(n || "").trim().toLowerCase();
  return e ? e === jn.proxy_a ? "proxy_a" : e === jn.proxy_b ? "proxy_b" : "main" : "main";
}
function oa(n = "") {
  const e = String(n || "");
  if (!e) return {
    linkVariant: "main",
    remaining: "",
    needsTrailingSlashRedirect: !1
  };
  const r = e.startsWith("/") ? e : "/" + e, t = r.split("/"), a = Ui(wt(t[1] || ""));
  return a === "main" ? {
    linkVariant: a,
    remaining: Q(r),
    needsTrailingSlashRedirect: !1
  } : {
    linkVariant: a,
    remaining: Q("/" + t.slice(2).join("/")),
    needsTrailingSlashRedirect: t.length === 2 && !r.endsWith("/")
  };
}
function La(n = {}) {
  return n.ENI_KV || n.KV || n.EMBY_KV || n.EMBY_PROXY || null;
}
function _d(n = {}) {
  return n.DB || n.D1 || n.PROXY_LOGS || null;
}
var bd = 16 * 1024;
async function ft(n, e) {
  const r = new TextEncoder(), t = Date.now();
  let a = ne.CryptoKeyCache.get(n);
  for ((!a || a.exp <= t) && (a = {
    key: await Fn().importKey("raw", r.encode(n), {
      name: "HMAC",
      hash: "SHA-256"
    }, !1, ["sign"]),
    exp: t + F.Defaults.CryptoKeyCacheTTL * 1e3
  }), ne.CryptoKeyCache.has(n) && ne.CryptoKeyCache.delete(n), ne.CryptoKeyCache.set(n, a); ne.CryptoKeyCache.size > F.Defaults.CryptoKeyCacheMax; ) {
    const s = ne.CryptoKeyCache.keys().next().value;
    if (s === void 0) break;
    ne.CryptoKeyCache.delete(s);
  }
  const o = await Fn().sign("HMAC", a.key, r.encode(e));
  return btoa(String.fromCharCode(...new Uint8Array(o))).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}
var Ed = class {
  constructor({ actionHandlers: n, bindingService: e, configReader: r, repository: t, requestModel: a, shellService: o }) {
    this.actionHandlers = Object.freeze({ ...n }), this.bindingService = e, this.configReader = r, this.repository = t, this.requestModel = a, this.shellService = o, this.actionAliases = Object.freeze({
      import: "saveOrImport",
      save: "saveOrImport"
    }), this.#e();
  }
  async handle(n, e, r) {
    const t = this.#u(n, e), { requestHost: a, configuredHost: o, configuredLegacyHost: s } = t, i = n.method, c = i === "GET" || i === "HEAD";
    if (c && t.pathnameLower === "/favicon.ico") return this.#_(i);
    const l = await this.configReader.getRuntimeConfig(e), u = !!(s && s !== o && a === s), d = l.enableHostPrefixProxy === !0 && !!o && !u, f = d ? bo(a, o) : null, m = !!(d && a !== o && a.endsWith(`.${o}`));
    if (f || m) return null;
    if (i === "GET" && t.normalizedPathname === "/") return this.#m(e, t.initHealth);
    const p = c ? this.#b(t.normalizedPathname, t.adminPath) : null;
    if (p)
      return await this.#r(n, e) ? this.#h(n, e, r, p, l) : this.#R("Unauthorized", 401);
    if (c && this.#E(t.normalizedPathname, t.adminPath))
      return await this.#r(n, e) ? this.#y(n, e, t.initHealth, l) : this.#S(n, t.adminLoginPath);
    if (c && wr(t.pathnameLower, t.adminLoginPathLower))
      return await this.#r(n, e) ? this.#S(n, t.adminPath) : this.#p(n, e, t.initHealth);
    if (c && wr(t.pathnameLower, t.adminPathLower))
      return await this.#r(n, e) ? this.#g(n, e, r, t.initHealth) : this.#S(n, t.adminLoginPath);
    if (i === "OPTIONS" && this.#s(t)) return this.#t(n, e, null);
    if (i === "POST" && (wr(t.pathnameLower, t.adminLoginPathLower) || this.#n(t))) return this.#i(n, e);
    if (i !== "POST" || !wr(t.pathnameLower, t.adminPathLower)) return null;
    if (!await this.#r(n, e)) return W("UNAUTHORIZED", "未授权", 401);
    try {
      return await Xu(await this.#o(n, e, r));
    } catch (g) {
      const h = El(g, {
        code: "INTERNAL_ERROR",
        message: "Server Error",
        status: 500
      });
      return Fe("admin_api.unhandled_error", g, {
        path: t.pathnameLower,
        method: i,
        responseCode: h.code,
        responseStatus: h.status
      }, "error"), W(h.code, h.message, h.status, h.details);
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
    const e = this.#a(n), r = this.actionAliases[e] || e;
    return this.actionHandlers[r] || null;
  }
  async #o(n, e, r) {
    const t = this.bindingService.getKV(e);
    if (!t) return W("KV_NOT_CONFIGURED", "请先绑定 ENI_KV / KV Namespace", 503);
    let a;
    try {
      const i = await Pe(n, bi);
      if (i.exceeded) return W("REQUEST_TOO_LARGE", "请求体过大", 413);
      a = JSON.parse(i.text || "");
    } catch {
      return W("INVALID_JSON", "请求 JSON 无效", 400);
    }
    const o = this.requestModel.normalizeAdminActionRequest(a);
    if (!o) return W("INVALID_REQUEST", "请求体必须是 JSON 对象", 400);
    const s = this.#f(o.action);
    return s ? s(o.data, {
      action: o.action,
      meta: o.meta,
      request: n,
      env: e,
      ctx: r,
      kv: t,
      db: this.bindingService.getDB(e)
    }) : W("INVALID_ACTION", "未知的管理动作", 400, { action: o.action || null });
  }
  #n(n) {
    return n.adminPathLower === "/admin" && n.pathnameLower === "/api/auth/login" && n.root === "api" && n.segments[1] === "auth" && n.segments[2] === "login";
  }
  #s(n) {
    return Ai(n.pathnameLower, n.adminPathLower) || wr(n.pathnameLower, n.adminLoginPathLower) || this.#n(n);
  }
  #t(n, e, r, t = 200) {
    return this.shellService.buildEdgeCorsResponse(Ca(e, n), r, t, { mergeOriginVary: !0 });
  }
  #u(n, e) {
    const r = new URL(n.url), t = re(r.hostname), a = Q(r.pathname), o = a.toLowerCase(), s = it(e), i = s.toLowerCase(), c = un(s), l = c.toLowerCase(), u = wi(e, {
      adminPath: s,
      loginPath: c
    }), d = a.split("/").filter(Boolean), f = d[0] || "", m = wt(f).toLowerCase();
    return {
      initHealth: u,
      requestUrl: r,
      requestHost: t,
      configuredHost: Ve(e),
      configuredLegacyHost: Wr(e),
      normalizedPathname: a,
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
    const r = n.headers.get("cf-connecting-ip") || "unknown", t = this.repository.getDB(e), a = $u(e), o = await this.configReader.getRuntimeConfig(e), s = Math.max(1, parseInt(o.jwtExpiryDays) || 30) * 86400;
    try {
      const i = await he(this.repository.getAuthFailureEntry(t, r), "auth.login.read_auth_failure", { ip: r }, null), c = Math.max(0, Number(i?.failCount) || 0);
      if (c >= F.Defaults.MaxLoginAttempts) return W("TOO_MANY_ATTEMPTS", "账户已锁定，请稍后再试", 429);
      let l = "";
      if ((n.headers.get("content-type") || "").includes("application/json")) {
        const d = await Pe(n, bd);
        if (d.exceeded) return W("REQUEST_TOO_LARGE", "请求体过大", 413);
        const f = JSON.parse(d.text || "{}");
        l = typeof f.password == "string" ? f.password : "";
      }
      if (!e.JWT_SECRET) return W("SERVER_MISCONFIGURED", "JWT_SECRET 未配置", 503);
      if (!e.ADMIN_PASS) return W("SERVER_MISCONFIGURED", "ADMIN_PASS 未配置", 503);
      if (l && l === e.ADMIN_PASS) {
        i && await he(this.repository.deleteAuthFailureEntry(t, r), "auth.login.clear_auth_failure", { ip: r }, !1);
        const d = await this.#d(e.JWT_SECRET, s);
        return te({
          ok: !0,
          expiresIn: s
        }, 200, { "Set-Cookie": `auth_token=${d}; Path=${a}; Max-Age=${s}; HttpOnly; Secure; SameSite=Strict` });
      }
      const u = c + 1;
      return await he(this.repository.upsertAuthFailureEntry(t, r, {
        failCount: u,
        expiresAt: H() + F.Defaults.LoginLockDuration * 1e3
      }), "auth.login.write_auth_failure", {
        ip: r,
        nextFailCount: u
      }, null), te({
        ok: !1,
        error: {
          code: "INVALID_PASSWORD",
          message: "密码错误"
        },
        remain: Math.max(0, F.Defaults.MaxLoginAttempts - u)
      }, 401);
    } catch (i) {
      return W("INVALID_REQUEST", "请求无效", 400, { reason: i.message });
    }
  }
  async #r(n, e) {
    try {
      const r = e.JWT_SECRET;
      if (!r) return !1;
      const t = n.headers.get("Authorization") || "";
      let a = t.startsWith("Bearer ") ? t.slice(7) : null;
      if (!a) {
        const o = (n.headers.get("Cookie") || "").match(/(?:^|;\s*)auth_token=([^;]+)/);
        a = o ? o[1] : null;
      }
      return a ? await this.#l(a, r) : !1;
    } catch {
      return !1;
    }
  }
  async #d(n, e) {
    const r = btoa(JSON.stringify({
      alg: "HS256",
      typ: "JWT"
    })).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, ""), t = btoa(JSON.stringify({
      sub: "admin",
      exp: Math.floor(Date.now() / 1e3) + e
    })).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
    return `${r}.${t}.${await this.#c(n, `${r}.${t}`)}`;
  }
  async #l(n, e) {
    const r = n.split(".");
    if (r.length !== 3 || r[2] !== await this.#c(e, `${r[0]}.${r[1]}`)) return !1;
    try {
      return JSON.parse(atob(r[1].replace(/-/g, "+").replace(/_/g, "/"))).exp > Math.floor(Date.now() / 1e3);
    } catch {
      return !1;
    }
  }
  async #c(n, e) {
    return ft(n, e);
  }
  #m(n, e) {
    return this.shellService.renderLandingPage(n, e);
  }
  #p(n, e, r) {
    return this.shellService.renderAdminLoginPage(n, e, r);
  }
  #g(n, e, r, t) {
    return this.shellService.renderAdminPage(n, e, r, t);
  }
  #h(n, e, r, t, a) {
    return this.shellService.renderAdminReleaseVendorAsset(n, e, r, t, a);
  }
  #y(n, e, r, t) {
    return this.shellService.renderAdminWarmResponse(n, e, r, t);
  }
  #_(n) {
    return this.shellService.renderFaviconResponse(n);
  }
  #b(n, e) {
    return this.shellService.resolveAdminReleaseVendorRouteMatch(n, e);
  }
  #E(n, e) {
    return this.shellService.isAdminWarmRoute(n, e);
  }
  #S(n, e) {
    return this.shellService.buildRequestPathRedirectResponse(n, e);
  }
  #R(...n) {
    return this.shellService.buildAdminReleaseVendorErrorResponse(...n);
  }
};
function ki(n = "", e = "") {
  const r = String(n || "").trim().toLowerCase(), t = String(e || "").trim().toLowerCase();
  return t === "image" || r.includes("/images/") || r.includes("/emby/covers/") || /\.(jpe?g|png|webp|gif)(?:$|[?#])/.test(r) ? "image_poster" : r.includes("/sessions/playing") || r.includes("/playbackinfo") ? "playback_info" : r.includes("/users/authenticate") ? "auth" : r.includes("/items/") || r.includes("/shows/") || r.includes("/movies/") || r.includes("/users/") ? "media_metadata" : t || "api";
}
function Rd(n = "", e = "") {
  return ki(n, e) === "playback_info";
}
function Td(n = "", e = "") {
  const r = String(n || "").trim().toLowerCase(), t = String(e || "").trim().toLowerCase();
  return t === "stream" || t === "segment" || t === "manifest" ? !0 : /\/stream(?:$|[/?])/.test(r) || r.includes("/master.m3u8") || /\/videos\/[^/]+\/(?:original|download|file)(?:$|[/?])/.test(r) || /\/items\/[^/]+\/download(?:$|[/?])/.test(r) || r.includes("static=true") || r.includes("download=true");
}
function Hi(n) {
  return String(n || "").trim().toLowerCase().replace(/[\s-]+/g, "_") === "poster_manifest" ? "poster_manifest" : "poster";
}
function $i(n) {
  const e = String(n || "").trim().toLowerCase();
  return e === "fts" ? "fts" : e === "like" ? "like" : F.Defaults.LogSearchMode;
}
function Bi(n) {
  return String(n || "").trim().toLowerCase() === "error" ? "error" : F.Defaults.LogWriteMode;
}
function Ad(n) {
  const e = String(n || "").trim().toLowerCase().replace(/[\s-]+/g, "_");
  return e === "playback" || e === "playback_info" ? "playback_info" : e === "image" ? "image" : e === "api" ? "api" : e === "auth" ? "auth" : "";
}
function Cd(n) {
  const e = String(n || "").trim().toLowerCase().replace(/[\s-]+/g, "_");
  return e === "4xx" || e === "status_4xx" ? "4xx" : e === "5xx" || e === "status_5xx" ? "5xx" : "";
}
function ls(n) {
  const e = String(n || "").trim().toLowerCase().replace(/[\s-]+/g, "_");
  return e === "direct" ? "direct" : e === "proxy" || e === "proxied" ? "proxy" : "";
}
function wd(n = "") {
  const e = String(n || "").trim().toLowerCase().replace(/[\s-]+/g, "_");
  return e === "connect_timeout" ? "connect_timeout" : e === "idle_timeout" ? "idle_timeout" : e === "tls_handshake_failed" ? "tls_handshake_failed" : e === "http_version_fallback" ? "http_version_fallback" : e === "redirect_loop" ? "redirect_loop" : e === "redirect_limit_exceeded" ? "redirect_limit_exceeded" : e === "range_unsatisfied" ? "range_unsatisfied" : e === "upstream_4xx" ? "upstream_4xx" : e === "upstream_5xx" ? "upstream_5xx" : e === "unknown_fetch_error" ? "unknown_fetch_error" : "";
}
var Ld = Object.freeze({
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
function Dd(n) {
  const e = Math.trunc(Number(n) || 0);
  if (!Number.isFinite(e) || e <= 0) return {
    code: null,
    text: null
  };
  const r = Ld[e];
  return r ? {
    code: r.code,
    text: r.text
  } : {
    code: null,
    text: null
  };
}
function Nd(n) {
  const e = String(n || "").trim();
  return e ? /\b(?:AND|OR|NOT|NEAR)\b/i.test(e) || /(?:^|\s)(?:node_name|request_path|user_agent|error_detail)\s*:/i.test(e) || /(?:^|\s)[^\s"]+\*/.test(e) ? !0 : /^"(?:[^"]|"")+"$/.test(e) : !1;
}
function Ki(n) {
  return `"${String(n || "").replace(/"/g, '""')}"`;
}
function Id(n) {
  return `${Ki(n)}*`;
}
function Md(n) {
  return String(n || "").replace(/(^|\s)((?:node_name|request_path|user_agent|error_detail)\s*:\s*)([^"\s()]+)(?=\s|$)/gi, (e, r, t, a) => `${r}${t}${Ki(a)}`);
}
function Pd(n) {
  const e = String(n || "").trim();
  return e ? Nd(e) ? Md(e) : e.split(/\s+/).filter(Boolean).map((r) => Id(r)).join(" AND ") : "";
}
function zi(n = null) {
  if (!n || typeof n != "object") return null;
  const e = Math.floor(Number(n.timestamp)), r = Math.floor(Number(n.id));
  return !Number.isFinite(e) || !Number.isFinite(r) || e < 0 || r < 0 ? null : {
    timestamp: e,
    id: r
  };
}
function xd(n = null) {
  return zi({
    timestamp: Number(n?.timestamp),
    id: Number(n?.id)
  });
}
function de(n) {
  return `"${String(n || "").replace(/"/g, '""')}"`;
}
function Lr(n) {
  return String(n || "").toLowerCase().replace(/["`\[\]]/g, "").replace(/\s+/g, " ").trim();
}
function No(n = "") {
  const e = String(n || "").trim().toLowerCase();
  return e === "paid" ? "paid" : e === "free" ? "free" : "";
}
function gr(n = "") {
  const e = String(n || "").trim().toUpperCase();
  return e === "A" || e === "AAAA" || e === "CNAME";
}
function Ua(n, e, r = {}) {
  const t = String(n || "").trim().toUpperCase(), a = String(e || "").trim(), o = r.allowCname !== !1;
  if (!gr(t)) return "Type 仅允许 A / AAAA / CNAME";
  if (!o && t === "CNAME") return "A 模式仅允许 A / AAAA";
  if (!a) return "Content 不能为空";
  if (t === "A" && !Ta(a)) return "A 记录 Content 必须是合法 IPv4 地址";
  if (t === "AAAA" && !sn(a)) return "AAAA 记录 Content 必须是合法 IPv6 地址";
  if (t === "CNAME") {
    if (/\s/.test(a)) return "CNAME 记录 Content 不能包含空格";
    if (a.length > 255) return "CNAME 记录 Content 过长";
  }
  return "";
}
function Od(n = "") {
  const e = String(n || "").trim();
  return e ? Ua("CNAME", e) ? "" : e : "";
}
var vd = [
  "logIncludeClientIp",
  "logIncludeColo",
  "logIncludeUa"
], Fd = [
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
], Wi = ["directSourceNodes", "nodeDirectList"], Ud = ["sourceSameOriginProxy", "forceExternalProxy"], Gi = [
  "enableH2",
  "enableH3",
  "peakDowngrade"
], us = [
  ...vd,
  ...Fd,
  ...Wi,
  ...Ud,
  ...Gi
], ji = {
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
      fallback: F.Defaults.LogRetentionDays,
      min: 1,
      max: F.Defaults.LogRetentionDaysMax
    },
    logFlushCountThreshold: {
      fallback: F.Defaults.LogFlushCountThreshold,
      min: 1,
      max: 5e3
    },
    logBatchChunkSize: {
      fallback: F.Defaults.LogBatchChunkSize,
      min: 1,
      max: 100
    },
    logBatchRetryCount: {
      fallback: F.Defaults.LogBatchRetryCount,
      min: 0,
      max: 5
    },
    logBatchRetryBackoffMs: {
      fallback: F.Defaults.LogBatchRetryBackoffMs,
      min: 0,
      max: 5e3
    },
    scheduledLeaseMs: {
      fallback: F.Defaults.ScheduledLeaseMs,
      min: F.Defaults.ScheduledLeaseMinMs,
      max: 900 * 1e3
    },
    uiRadiusPx: {
      fallback: F.Defaults.UiRadiusPx,
      min: 0,
      max: 48
    },
    tgAlertDroppedBatchThreshold: {
      fallback: F.Defaults.TgAlertDroppedBatchThreshold,
      min: 0,
      max: 5e3
    },
    tgAlertFlushRetryThreshold: {
      fallback: F.Defaults.TgAlertFlushRetryThreshold,
      min: 0,
      max: 10
    },
    tgAlertKvUsageThresholdPercent: {
      fallback: F.Defaults.TgAlertKvUsageThresholdPercent,
      min: 1,
      max: 100
    },
    tgAlertD1UsageThresholdPercent: {
      fallback: F.Defaults.TgAlertD1UsageThresholdPercent,
      min: 1,
      max: 100
    },
    tgAlertCooldownMinutes: {
      fallback: F.Defaults.TgAlertCooldownMinutes,
      min: 1,
      max: 1440
    },
    cacheTtlImages: {
      fallback: F.Defaults.CacheTtlImagesDays,
      min: 0,
      max: 365
    },
    pingTimeout: {
      fallback: F.Defaults.PingTimeoutMs,
      min: 1e3,
      max: 18e4
    },
    pingCacheMinutes: {
      fallback: F.Defaults.PingCacheMinutes,
      min: 0,
      max: 1440
    },
    hedgeProbeTimeoutMs: {
      fallback: F.Defaults.HedgeProbeTimeoutMs,
      min: 250,
      max: 1e4
    },
    hedgeProbeParallelism: {
      fallback: F.Defaults.HedgeProbeParallelism,
      min: 1,
      max: 2
    },
    hedgeWaitTimeoutMs: {
      fallback: F.Defaults.HedgeWaitTimeoutMs,
      min: 250,
      max: 1e4
    },
    hedgeLockTtlMs: {
      fallback: F.Defaults.HedgeLockTtlMs,
      min: 1e3,
      max: 1e4
    },
    hedgePreferredTtlSec: {
      fallback: F.Defaults.HedgePreferredTtlSec,
      min: 30,
      max: 3600
    },
    hedgeFailureCooldownSec: {
      fallback: F.Defaults.HedgeFailureCooldownSec,
      min: 1,
      max: 300
    },
    hedgeWakeJitterMs: {
      fallback: F.Defaults.HedgeWakeJitterMs,
      min: 0,
      max: 1e3
    },
    cfQuotaPlanCacheMinutes: {
      fallback: F.Defaults.CfQuotaPlanCacheMinutes,
      min: 1,
      max: 1440
    },
    upstreamTimeoutMs: {
      fallback: F.Defaults.UpstreamTimeoutMs,
      min: 0,
      max: 18e4
    },
    upstreamRetryAttempts: {
      fallback: F.Defaults.UpstreamRetryAttempts,
      min: 0,
      max: 3
    },
    prewarmCacheTtl: {
      fallback: F.Defaults.PrewarmCacheTtl,
      min: 0,
      max: 3600
    },
    prewarmPrefetchBytes: {
      fallback: F.Defaults.PrewarmPrefetchBytes,
      min: 0,
      max: Ao
    },
    playbackInfoCacheTtlSec: {
      fallback: F.Defaults.PlaybackInfoCacheTtlSec,
      min: 0,
      max: 60
    },
    videoProgressForwardIntervalSec: {
      fallback: F.Defaults.VideoProgressForwardIntervalSec,
      min: 0,
      max: 60
    },
    scheduleUtcOffsetMinutes: {
      fallback: F.Defaults.ScheduleUtcOffsetMinutes,
      min: -720,
      max: 840
    }
  },
  numberFields: { logWriteDelayMinutes: {
    fallback: F.Defaults.LogFlushDelayMinutes,
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
function kd(n = {}, e = {}) {
  for (const [r, t] of Object.entries(e.aliasFields || {}))
    if (!(n[r] !== void 0 && n[r] !== null) && Array.isArray(t)) {
      for (const a of t)
        if (!(n[a] === void 0 || n[a] === null)) {
          n[r] = n[a];
          break;
        }
    }
  return n;
}
function Hd(n = {}, e = {}) {
  const r = Array.isArray(e.allowedFields) ? e.allowedFields : [];
  if (!r.length) return n;
  const t = {};
  for (const a of r)
    Object.prototype.hasOwnProperty.call(n, a) && (t[a] = n[a]);
  return t;
}
function $d(n = {}, e = ji, r = {}) {
  let t = n && typeof n == "object" && !Array.isArray(n) ? { ...n } : {};
  t = kd(t, e);
  for (const a of e.trimFields || [])
    t[a] === void 0 || t[a] === null || (t[a] = String(t[a]).trim());
  for (const [a, o] of Object.entries(e.arrayNormalizers || {}))
    Array.isArray(t[a]) && o === "nodeNameList" && typeof r.normalizeNodeNameList == "function" && (t[a] = r.normalizeNodeNameList(t[a]));
  for (const [a, o] of Object.entries(e.integerFields || {})) t[a] = ue(t[a], o.fallback, o.min, o.max);
  for (const [a, o] of Object.entries(e.numberFields || {})) t[a] = al(t[a], o.fallback, o.min, o.max);
  for (const a of e.booleanTrueFields || []) t[a] = t[a] !== !1;
  for (const a of e.booleanFalseFields || []) t[a] = t[a] === !0;
  return Hd(t, e);
}
function Vi(n = {}) {
  const e = n && typeof n == "object" && !Array.isArray(n) ? n : {}, r = { ...e };
  let t = !1;
  const a = [], o = [], s = {};
  for (const c of us)
    Object.prototype.hasOwnProperty.call(e, c) && a.push(c);
  const i = (c, l) => {
    const u = String(c || "").trim(), d = String(l || "").trim();
    !u || !d || (o.push(d), s[u] || (s[u] = []), s[u].push(d));
  };
  if (!Object.prototype.hasOwnProperty.call(r, "sourceDirectNodes")) {
    for (const c of Wi)
      if (Object.prototype.hasOwnProperty.call(e, c)) {
        r.sourceDirectNodes = mt(e[c]), t = !0, i(c, "sourceDirectNodes");
        break;
      }
  }
  if (!Object.prototype.hasOwnProperty.call(r, "logWriteClientIp") && Reflect.get(e, "logIncludeClientIp") !== void 0 && (r.logWriteClientIp = e.logIncludeClientIp !== !1, t = !0, i("logIncludeClientIp", "logWriteClientIp")), !Object.prototype.hasOwnProperty.call(r, "logDisplayClientIp") && Reflect.get(e, "logIncludeClientIp") !== void 0 && (r.logDisplayClientIp = e.logIncludeClientIp !== !1, t = !0, i("logIncludeClientIp", "logDisplayClientIp")), !Object.prototype.hasOwnProperty.call(r, "logWriteColo") && Reflect.get(e, "logIncludeColo") !== void 0 && (r.logWriteColo = e.logIncludeColo !== !1, t = !0, i("logIncludeColo", "logWriteColo")), !Object.prototype.hasOwnProperty.call(r, "logDisplayColo") && Reflect.get(e, "logIncludeColo") !== void 0 && (r.logDisplayColo = e.logIncludeColo !== !1, t = !0, i("logIncludeColo", "logDisplayColo")), !Object.prototype.hasOwnProperty.call(r, "logWriteUa") && Reflect.get(e, "logIncludeUa") !== void 0 && (r.logWriteUa = e.logIncludeUa !== !1, t = !0, i("logIncludeUa", "logWriteUa")), !Object.prototype.hasOwnProperty.call(r, "logDisplayUa") && Reflect.get(e, "logIncludeUa") !== void 0 && (r.logDisplayUa = e.logIncludeUa !== !1, t = !0, i("logIncludeUa", "logDisplayUa")), !Object.prototype.hasOwnProperty.call(r, "protocolStrategy")) {
    let c = !1;
    for (const l of Gi)
      Object.prototype.hasOwnProperty.call(e, l) && (i(l, "protocolStrategy"), c = !0);
    c && (r.protocolStrategy = Do(e), t = !0);
  }
  Object.prototype.hasOwnProperty.call(r, "defaultPlaybackInfoMode") || (Reflect.get(e, "playbackInfoAutoProxy") !== void 0 ? (r.defaultPlaybackInfoMode = Va(e), t = !0, i("playbackInfoAutoProxy", "defaultPlaybackInfoMode")) : Reflect.get(e, "playbackInfoBlockWangpanProxy") !== void 0 && (r.defaultPlaybackInfoMode = Va(e), t = !0, i("playbackInfoBlockWangpanProxy", "defaultPlaybackInfoMode"))), Object.prototype.hasOwnProperty.call(r, "tgDailyReportClockTimes") || (r.tgDailyReportClockTimes = At(Object.prototype.hasOwnProperty.call(e, "tgDailyReportTime") ? e.tgDailyReportTime : e.tgDailyReportClockTimes, F.Defaults.TgDailyReportClockTimes), Object.prototype.hasOwnProperty.call(e, "tgDailyReportTime") && (t = !0, i("tgDailyReportTime", "tgDailyReportClockTimes")));
  for (const c of us)
    Object.prototype.hasOwnProperty.call(r, c) && (delete r[c], t = !0);
  return {
    config: r,
    migrated: t,
    legacyKeysPresent: Jt(a),
    deletedLegacyFieldCount: Jt(a).length,
    migratedConfigKeys: Jt(o),
    migratedKeyMap: Object.fromEntries(Object.entries(s).map(([c, l]) => [c, Jt(l)]))
  };
}
function oe(n = {}) {
  const { config: e } = Vi(n && typeof n == "object" && !Array.isArray(n) ? n : {});
  return qi(e);
}
function qi(n = {}) {
  const e = $d({
    ...n,
    defaultPlaybackInfoMode: ua(n, "defaultPlaybackInfoMode") ? Reflect.get(n, "defaultPlaybackInfoMode") : Va(n),
    protocolStrategy: ua(n, "protocolStrategy") ? Reflect.get(n, "protocolStrategy") : Do(n)
  }, ji, { normalizeNodeNameList: mt });
  e.prewarmDepth = Hi(e.prewarmDepth), e.hedgeProbePath = wa(e.hedgeProbePath, F.Defaults.HedgeProbePath), e.dnsDefaultFallbackCname = Od(e.dnsDefaultFallbackCname), e.defaultHostPrefixCnameTarget = Wt(e.defaultHostPrefixCnameTarget), e.settingsExperienceMode = String(e.settingsExperienceMode || "").trim().toLowerCase() === "expert" ? "expert" : "novice", e.cfQuotaPlanOverride = No(e.cfQuotaPlanOverride), e.logSearchMode = $i(e.logSearchMode), e.logWriteMode = Bi(e.logWriteMode), e.routingDecisionMode = Or(e.routingDecisionMode), e.protocolStrategy = Di(e.protocolStrategy), e.defaultPlaybackInfoMode = zt(e.defaultPlaybackInfoMode), e.defaultRealClientIpMode = yo(e.defaultRealClientIpMode), e.defaultMediaAuthMode = Xs(e.defaultMediaAuthMode), e.scheduleUtcOffsetMinutes = ze(e.scheduleUtcOffsetMinutes), e.tgDailyReportClockTimes = At(e.tgDailyReportClockTimes, F.Defaults.TgDailyReportClockTimes);
  const r = et(e.indexUrl);
  return e.indexUrl = r ? Gr(r) : "", Qu(e, n), e;
}
var Xi = ["cfApiToken", "tgBotToken"];
function ds(n = {}) {
  const e = oe(n);
  for (const r of Xi) delete e[r];
  return e;
}
function Et(n = {}) {
  return oe(n);
}
function Yi(n = {}, e = {}) {
  const r = k(n) ? { ...n } : {}, t = oe(e);
  for (const a of Xi)
    Object.prototype.hasOwnProperty.call(r, a) || String(t[a] || "").length > 0 && (r[a] = t[a]);
  return r;
}
function Nn(n = {}, e = {}) {
  const r = Yi(n, e), t = et(oe(e).indexUrl);
  return r.indexUrl = t ? Gr(t) : "", r;
}
function Bd(n = "", e = {}) {
  const r = String(n || "").trim();
  if (!r) return;
  const t = r.split(".").pop() || "", a = ie(ee(oe(e)));
  if (t !== a)
    throw Le("CONFIG_REVISION_CONFLICT", "配置版本已变化，请刷新设置后重新提交", 409, {
      expectedRevision: r,
      currentHash: a
    });
}
function Kd(n = {}) {
  const e = Vi(n);
  return {
    cleanedConfig: qi(e.config),
    legacyKeysPresent: e.legacyKeysPresent,
    deletedLegacyFieldCount: e.deletedLegacyFieldCount,
    migratedConfigKeys: e.migratedConfigKeys,
    migratedKeyMap: e.migratedKeyMap
  };
}
function Ht(n = "", e = "") {
  const r = String(n || "").trim() || "empty";
  return `${String(e || "").trim() || (/* @__PURE__ */ new Date()).toISOString()}.${r}`;
}
function Vn(n, e = {}) {
  const r = ie(ee(n)), t = String(e.updatedAt || "").trim() || (/* @__PURE__ */ new Date()).toISOString();
  return {
    ...e,
    hash: r,
    updatedAt: t,
    revision: Ht(r, t)
  };
}
function zd(n = {}, e = {}) {
  const r = oe(n), t = oe(e), a = [.../* @__PURE__ */ new Set([...Object.keys(r), ...Object.keys(t)])].sort(), o = [];
  for (const s of a)
    ee(r[s]) !== ee(t[s]) && o.push({
      key: s,
      previousValue: r[s],
      nextValue: t[s]
    });
  return o;
}
function Wd(n = [], e = 20) {
  const r = Math.max(1, Number(e) || 20);
  return [...new Set((Array.isArray(n) ? n : [n]).map((t) => String(t ?? "").trim()).filter(Boolean))].slice(0, r);
}
function lt(n = "", e = "", r = [], t = {}) {
  const a = Wd(r, t.limit), o = Number(t.count), s = Number.isFinite(o) ? Math.max(0, Math.floor(o)) : a.length, i = String(t.note || "").trim();
  return {
    key: String(n || "").trim(),
    label: String(e || "").trim(),
    count: s,
    countIsLowerBound: t.countIsLowerBound === !0,
    samples: a,
    truncated: s > a.length,
    note: i
  };
}
function Ee(n, e, r = "", t = "", a = [], o = 0, s = "") {
  return e && n.push(lt(r, t, a, {
    count: o,
    note: s
  })), n;
}
function Gd(n = {}) {
  const e = [], r = Jt(n.configFieldTargets || []);
  if (r.length > 0) {
    const i = [];
    n.sourceDirectNodesFromLegacyNodes === !0 && i.push("包含节点遗留直连标记折叠进 sourceDirectNodes"), e.push(lt("config_current_fields", "全局设置当前字段", r, {
      count: r.length,
      note: i.join("；") || "会把旧版配置别名收敛到当前 schema。"
    }));
  }
  const t = Math.max(0, Math.floor(Number(n.migratedTopLevelPortNodeCount) || 0)), a = Math.max(0, Math.floor(Number(n.migratedLinePortCount) || 0)), o = Math.max(0, Math.floor(Number(n.migratedDefaultPortNodeCount) || 0)), s = Math.max(0, Math.floor(Number(n.migratedDefaultPortLineCount) || 0));
  if (t > 0 || a > 0 || o > 0 || s > 0) {
    const i = [];
    t > 0 && i.push(`旧版顶层 node.port 节点 ${t} 个`), a > 0 && i.push(`旧版 lines[].port 线路 ${a} 条`), o > 0 && i.push(`隐式默认端口节点 ${o} 个`), s > 0 && i.push(`按协议补齐默认端口线路 ${s} 条`), e.push(lt("node_current_fields", "节点当前字段", ["lines[].target"], {
      count: 1,
      note: `会把端口统一收敛到当前字段。${i.join("，")}。`
    }));
  }
  return e;
}
function jd(n = []) {
  return (Array.isArray(n) ? n : []).map((e) => e?.name || e?.id);
}
async function Me(n, e, r = {}) {
  if (!n) return null;
  const t = String(e || "").trim(), a = k(r) ? r : {};
  try {
    return Object.prototype.hasOwnProperty.call(a, "type") ? await n.get(t, { type: a.type }) : await n.get(t);
  } catch (o) {
    throw Gs("get", { key: t }, ce(o));
  }
}
async function Vd(n, e = {}) {
  if (!n || typeof n.list != "function") return {
    keys: [],
    list_complete: !0,
    cursor: ""
  };
  const r = k(e) ? e : {}, t = String(r.prefix || "").trim(), a = String(r.cursor || "").trim();
  try {
    return a ? await n.list({
      prefix: t,
      cursor: a
    }) : await n.list({ prefix: t });
  } catch (o) {
    throw Gs("list", { prefix: t }, ce(o));
  }
}
var qd = "sys:theme";
function Ji(n, e = {}) {
  const r = String(n || "").trim(), t = r.toLowerCase(), a = String(e.zoneId || "").trim(), o = {
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
  } : o : o;
}
async function Qi(n) {
  return oe(await n.get("sys:theme", { type: "json" }) || {});
}
async function Ce(n) {
  const e = La(n);
  if (!e) return {};
  const r = Lo(n), t = fn(n), a = t.ConfigCache;
  if (a?.exp > H() && a.data) return a.data;
  const o = t.RuntimeConfigCacheGeneration;
  return await dn(t.SingleFlightTasks, ct([
    "runtime_config",
    r,
    o
  ]), async () => {
    const s = t.ConfigCache;
    if (s?.exp > H() && s.data) return s.data;
    const i = s?.data && typeof s.data == "object" ? s.data : a?.data && typeof a.data == "object" ? a.data : null;
    let c = i || {};
    try {
      c = await Qi(e);
    } catch (l) {
      const u = i && typeof i == "object";
      Fe("runtime_config.load_failed", l, {
        cacheNamespace: r,
        configKey: qd,
        usedCachedConfig: u === !0
      }), c = u ? i : oe({});
    }
    return t.RuntimeConfigCacheGeneration === o && (t.ConfigCache = {
      data: c,
      exp: H() + F.Defaults.CacheTTL,
      namespace: r
    }), c;
  });
}
async function fe(n) {
  const e = La(n);
  return e ? await Qi(e) : {};
}
function Xd(n = {}, e = {}) {
  const { indexRepository: r } = n;
  async function t(f, m, p, g = Ke(m), h = null) {
    const y = k(h) ? oe(h) : oe(await fe(m)), _ = await r.getAdminActiveIndexRecord(r.getKV(m)), S = _ ? oe({
      ...y,
      indexUrl: _.sourceUrl
    }) : y;
    if (e.isAdminIndexSetupForced(f)) return e.renderAdminIndexSetupPage(f, m, p, g, S, "manual_setup_requested");
    const A = dt(m, S);
    if (!A.indexUrl) {
      try {
        const R = await e.renderBundledAdminPage(f, m, p, g, S);
        if (R) return R;
      } catch (R) {
        return Fe("admin.bundled_shell_render", R, { path: new URL(f.url).pathname }), e.renderAdminIndexSetupPage(f, m, p, g, S, "bundled_shell_render_failed");
      }
      return e.renderAdminIndexSetupPage(f, m, p, g, S);
    }
    const b = A.indexUrl;
    if (b) try {
      const R = await e.renderRemoteAdminPage(f, m, p, g, b, S);
      if (R) return R;
    } catch (R) {
      return Fe("admin.remote_shell_render", R, {
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
      }, S);
    }
    return e.renderAdminIndexSetupPage(f, m, p, g, S, "index_url_not_configured");
  }
  async function a(f = [], m) {
    const p = Array.isArray(f) ? f : [];
    if (typeof m != "function" || p.length === 0) return [];
    const g = new Array(p.length);
    let h = 0;
    const y = async () => {
      for (; h < p.length; ) {
        const _ = h;
        h += 1, g[_] = await m(p[_], _);
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
  async function i(f, m, p = Ke(m), g = null) {
    const h = k(g) ? oe(g) : oe(await fe(m)), y = dt(m, h);
    if (!y.indexUrl) return W("ADMIN_INDEX_NOT_CONFIGURED", "管理台 index.html 尚未配置", 409);
    const _ = [], S = { waitUntil(P) {
      _.push(Promise.resolve(P));
    } }, A = it(m), b = new URL(f.url);
    b.pathname = A, b.search = "";
    const R = await e.renderRemoteAdminPage(o(b), m, S, p, y.indexUrl, h);
    await Promise.all(_.splice(0));
    const T = ur(), L = y.assetRevision || y.releaseTag, D = y.isLocalUpload ? await r.getAdminIndexUploadRecord(r.getKV(m), y.localUploadRevision) : null;
    let E = null;
    D?.manifest ? (E = await e.readAdminReleaseVendorManifestFromCache(T, L, y.indexUrl), E || (E = await e.cacheAdminReleaseVendorManifest(T, D.manifest, S))) : E = await e.getOrCreateAdminReleaseVendorManifest(T, L, y.indexUrl, S);
    const w = (Array.isArray(E?.entries) ? E.entries : []).filter((P) => P?.assetKey && !e.isMutableJsdelivrGithubAssetUrl(P.upstreamUrl)), N = await a(w, async (P) => {
      const I = e.buildAdminReleaseVendorProxyPath(A, L, P.assetKey), M = new URL(f.url);
      return M.pathname = I, M.search = "", e.renderAdminReleaseVendorAsset(o(M), m, S, {
        releaseTag: L,
        assetKey: P.assetKey
      }, h);
    });
    await Promise.all(_.splice(0));
    const O = N.filter((P) => !s(P)).length, C = s(R), v = JSON.stringify({
      ok: C && O === 0,
      shellStatus: Number(R?.status) || 0,
      warmedAssetCount: w.length - O,
      failedAssetCount: O
    }), B = new Headers({
      "Content-Type": "application/json;charset=UTF-8",
      "Cache-Control": "no-store, max-age=0"
    });
    return we(B), new Response(f.method === "HEAD" ? null : v, {
      status: C && O === 0 ? 200 : 502,
      headers: B
    });
  }
  function c(f, m = Ke(f)) {
    const p = it(f), g = m.ok ? "" : `<div class="landing-banner"><div class="landing-banner-title">系统未初始化</div><div class="landing-banner-text">缺少关键环境变量：${m.missing.map((_) => Ae(_)).join("、")}</div></div>`, h = `<!DOCTYPE html><html lang="zh-CN"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"><link rel="icon" href="/favicon.ico" sizes="any"><title>Emby Proxy V19.4</title>${e.LANDING_PAGE_STYLE_HTML}</head><body><main class="landing-shell"><section class="landing-card"><div class="landing-grid"><div class="landing-primary">${g}<div class="landing-pill">Headless Edge Relay</div><h1 class="landing-title">Emby Proxy V19.4</h1><p class="landing-text">为了极致优化视频代理性能，根路径默认只保留无头中继与说明壳；真正的管理台入口固定收口到 <span class="landing-highlight">${Ae(p)}</span>，并由 Worker 读取随部署发布或已上传的 <code>index.html</code> 返回。</p><div class="landing-actions"><a href="${Ae(p)}" class="landing-btn landing-btn-primary">访问 ${Ae(p)}</a><a href="https://github.com/axuitomo/CF-EMBY-PROXY-UI" target="_blank" rel="noopener noreferrer" class="landing-btn landing-btn-secondary">查看项目说明</a></div></div><div class="landing-side"><div class="landing-notes"><div class="landing-notes-title">Routing Notes</div><ul class="landing-note-list"><li>根路径仅提供静态说明页，不承载实时配置数据。</li><li><code>${Ae(p)}</code> 只负责返回管理台壳与 bootstrap，动态数据继续走 <code>POST ${Ae(p)}</code> API。</li><li>正式真相源固定为 <code>frontend/</code>、<code>worker.js</code> 与 <code>worker.md</code>。</li><li>媒体代理、日志与 KV / D1 逻辑保持原 Worker 主链路不变。</li></ul></div></div></div></section></main></body></html>`, y = new Headers({
      "Content-Type": "text/html;charset=UTF-8",
      "Cache-Control": "public, max-age=3600, s-maxage=86400"
    });
    return we(y), y.set("X-Frame-Options", "DENY"), new Response(h, { headers: y });
  }
  function l(f, m = "/", p = 302) {
    const g = new URL(f.url);
    g.pathname = Q(m || "/"), g.search = "", g.hash = "";
    const h = new Headers({
      Location: g.toString(),
      "Cache-Control": "no-store, max-age=0"
    });
    return we(h), new Response(null, {
      status: p,
      headers: h
    });
  }
  async function u(f, m, p = Ke(m)) {
    const g = it(m), h = wo(m), y = zn(p), _ = Xr({
      adminPath: g,
      loginPath: h,
      initHealth: p,
      contract: e.buildAdminUiContract()
    }), S = `<!DOCTYPE html><html lang="zh-CN"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"><link rel="icon" href="/favicon.ico" sizes="any"><title>Worker 管理台登录</title><style>
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
      </style></head><body><main class="login-shell"><section class="login-card"><div>${y}</div><div class="login-grid"><section class="login-hero"><div class="eyebrow">Worker Admin Access</div><h1 class="title">登录管理台壳层</h1><p class="subtitle">这个入口只负责建立 Worker 的同源登录态。登录成功后会直接返回主控制台，后续的节点治理、日志诊断、DNS/IP 池与发布操作继续复用同一份 Cookie。</p><div class="meta-grid"><article class="meta-card"><div class="meta-label">Admin Path</div><div class="meta-value">${Ae(g)}</div></article><article class="meta-card"><div class="meta-label">Login Endpoint</div><div class="meta-value">POST ${Ae(h)}</div></article><article class="meta-card"><div class="meta-label">Init Health</div><div class="meta-value">${p.ok ? "已通过" : `未通过：${Ae((Array.isArray(p.missing) ? p.missing : []).join(" / ") || "请检查环境变量")}`}</div></article><article class="meta-card"><div class="meta-label">Current Mode</div><div class="meta-value">独立登录壳，不再复用 /admin 远端 shell</div></article></div><div class="actions"><a href="${Ae(g)}" class="action-link secondary">返回管理台</a><a href="/" class="action-link primary">回到根路径说明页</a></div></section><section class="login-form"><form id="admin-login-form" class="form-panel" action="${Ae(h)}" method="post" novalidate><div><p class="form-title">输入管理密码</p><p class="hint">页面会继续调用已有的 <code>POST ${Ae(h)}</code> JSON 登录接口，不会新增第二套鉴权协议。</p></div><label class="field" for="admin-login-password"><span class="field-label">管理密码</span><input id="admin-login-password" name="password" type="password" class="field-input" autocomplete="current-password" placeholder="请输入 ADMIN_PASS" required /></label><button id="admin-login-submit" type="submit" class="submit-btn">登录并进入控制台</button><div id="admin-login-status" class="status" role="status" aria-live="polite">等待输入密码。登录成功后会跳转到 ${Ae(g)}。</div></form><noscript><div class="noscript">当前登录壳需要浏览器启用 JavaScript，因为 Worker 现阶段继续复用原有 JSON 登录接口来写入 Cookie。</div></noscript></section></div></section></main><script>
        const ADMIN_LOGIN_RUNTIME = ${_};
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
    return new Response(f?.method === "HEAD" ? null : S, { headers: e.buildAdminHtmlResponseHeaders("", "no-store, max-age=0") });
  }
  function d(f, m, p = 200, g = {}) {
    const h = new Headers(f);
    return we(h), g.mergeOriginVary === !0 && h.get("Access-Control-Allow-Origin") !== "*" && Hr(h, "Origin"), new Response(m, {
      status: p,
      headers: h
    });
  }
  return {
    renderAdminPage: t,
    warmAdminReleaseVendorEntries: a,
    buildAdminWarmSubrequest: o,
    isAdminWarmResponseSuccessful: s,
    renderAdminWarmResponse: i,
    renderLandingPage: c,
    buildRequestPathRedirectResponse: l,
    renderAdminLoginPage: u,
    buildEdgeCorsResponse: d
  };
}
function Io(n = "") {
  return /(?:^|\/)smartstrm(?:$|[/?])/i.test(String(n || ""));
}
function ga(n = "") {
  return qa(n) || /\/audio\/[^/]+(?:\/|$)/i.test(String(n || "")) || /\/livetv\/[^/]+(?:\/|$)/i.test(String(n || "")) || Io(n);
}
function Yd(n = "") {
  const e = String(n || "").trim();
  return /^[a-z][a-z0-9+.-]*:/i.test(e) || e.startsWith("//");
}
function Zi(n = "") {
  return /\/playbackinfo(?:$|[/?])/i.test(String(n || ""));
}
function qa(n = "") {
  const e = Q(n);
  return Zi(e) || Io(e) || ht.test(e) || Ri.test(e) ? !0 : /\/videos\/[^/]+\/(?:stream|original|download|file)\b/i.test(e) || /\/items\/[^/]+\/download\b/i.test(e);
}
function ec(n = "") {
  return /\/sessions\/playing\/progress(?:$|[/?])/i.test(String(n || ""));
}
function tc(n = "") {
  return /\/sessions\/playing\/stopped(?:$|[/?])/i.test(String(n || ""));
}
function Jd(n = "") {
  return /\/sessions\/playing\/ping(?:$|[/?])/i.test(String(n || ""));
}
function Qd(n = "") {
  const e = String(n || "");
  return ec(e) || tc(e) || Jd(e) ? !1 : /\/sessions\/playing(?:\/started)?(?:$|[/?])/i.test(e);
}
function Zd(n = {}, e = {}) {
  function r(t, a) {
    let o = a;
    const s = wt(t[o]);
    let i = Ui(s) === "main" ? "/" + s : "";
    for (o += 1; o < t.length; o += 1) i += "/" + wt(t[o]);
    return qa(i || "/");
  }
  return { isPlaybackCriticalSegments: r };
}
function ef(n = {}) {
  const e = {};
  for (const [r, t] of Object.entries(zu(n, e))) e[r] = t;
  for (const [r, t] of Object.entries(Wu(n, e))) e[r] = t;
  for (const [r, t] of Object.entries(ju(n, e))) e[r] = t;
  for (const [r, t] of Object.entries(Vu(n, e))) e[r] = t;
  for (const [r, t] of Object.entries(Xd(n, e))) e[r] = t;
  for (const [r, t] of Object.entries(Zd(n, e))) e[r] = t;
  return e;
}
function Xa(n) {
  if (!n || n === 0) return "0 B";
  const e = 1024, r = [
    "B",
    "KB",
    "MB",
    "GB",
    "TB"
  ], t = Math.floor(Math.log(n) / Math.log(e));
  return parseFloat((n / Math.pow(e, t)).toFixed(2)) + " " + r[t];
}
var rc = 1024 * 1024 * 1024, tf = 500 * 1024 * 1024, rf = 10 * 1024 * 1024 * 1024, Mo = Object.freeze({
  planClass: "free",
  planLabel: "FREE",
  periodLabel: "今日",
  kv: {
    read: 1e5,
    write: 1e3,
    delete: 1e3,
    list: 1e3,
    storageBytes: rc
  },
  d1: {
    rowsRead: 5e6,
    rowsWritten: 1e5,
    storageBytes: tf
  }
}), ac = Object.freeze({
  planClass: "paid",
  planLabel: "PAID",
  periodLabel: "本月",
  kv: {
    read: 1e7,
    write: 1e6,
    delete: 1e6,
    list: 1e6,
    storageBytes: rc
  },
  d1: {
    rowsRead: 25e9,
    rowsWritten: 5e7,
    storageBytes: rf
  }
}), af = Object.freeze({
  free: Mo,
  paid: ac
});
function Se(n) {
  const e = Number(n);
  return Number.isFinite(e) ? Math.max(0, Math.round(e)).toLocaleString("en-US") : "0";
}
function ha(n) {
  const e = Number(n);
  return !Number.isFinite(e) || e <= 0 ? 0 : e >= 100 ? 100 : Math.max(0, Math.round(e * 10) / 10);
}
function nf(n = 0) {
  const e = Number(n);
  return !Number.isFinite(e) || e <= 0 ? "slate" : e >= 90 ? "danger" : e >= 70 ? "warning" : "success";
}
function ya(n = "") {
  return String(n || "").trim().toLowerCase() || "bundled";
}
function nc(n = "") {
  const e = ya(n);
  return e === "standard" || e === "unbound" ? {
    ...ac,
    usageModel: e
  } : {
    ...Mo,
    usageModel: e
  };
}
function qn(n = {}) {
  const e = No(n?.override);
  return e ? {
    ...Sa(e),
    usageModel: ya(n?.usageModel),
    override: e
  } : {
    ...nc(n?.usageModel),
    override: ""
  };
}
function Sa(n = "free") {
  return af[String(n || "").trim().toLowerCase() === "paid" ? "paid" : "free"] || Mo;
}
async function of(n = {}) {
  const e = oe(k(n) ? n : {}), r = No(e.cfQuotaPlanOverride);
  if (r) return qn({ override: r });
  const t = String(e.cfAccountId || "").trim(), a = String(e.cfApiToken || "").trim();
  if (!t || !a) return {
    ...Sa("free"),
    usageModel: ya("bundled"),
    override: ""
  };
  try {
    return qn({ usageModel: await lc(t, a) });
  } catch {
    return {
      ...Sa("free"),
      usageModel: ya("bundled"),
      override: ""
    };
  }
}
function sf(n = {}) {
  const e = k(n) ? n : {}, r = Math.max(1, Math.floor(Number(e.writeLimit) || 0)), t = Math.max(0, Math.floor(Number(e.estimatedPutCount) || 0)), a = Math.max(0, Math.floor(Number(e.estimatedRollbackWriteCount) || 0)), o = Math.max(0, Math.floor(Number(e.estimatedWorstCaseWriteCount) || 0)), s = Math.max(0, o - r), i = String(e.planLabel || "").trim() || "FREE", c = String(e.periodLabel || "").trim() || "今日";
  return o <= r ? "" : `KV 整理已拦截：当前 ${i} 计划 · ${c} 写入上限为 ${Se(r)}，本次预计写入 ${Se(t)} 次，最坏回滚写回 ${Se(a)} 次，最坏共 ${Se(o)} 次，超出 ${Se(s)} 次。`;
}
function cf(n = {}) {
  const e = k(n) ? n : {}, r = String(e.planLabel || "").trim() || "FREE", t = String(e.periodLabel || "").trim() || "今日", a = Math.max(1, Math.floor(Number(e.writeLimit) || 0)), o = Math.max(0, Math.floor(Number(e.estimatedPutCount) || 0)), s = Math.max(0, Math.floor(Number(e.estimatedDeleteCount) || 0)), i = Math.max(0, Math.floor(Number(e.estimatedRollbackWriteCount) || 0)), c = Math.max(0, Math.floor(Number(e.estimatedWorstCaseWriteCount) || 0));
  return `KV 配额预算：${r} 计划 · ${t}，预计 put ${Se(o)} 次，delete ${Se(s)} 次，最坏回滚写回 ${Se(i)} 次，最坏写入 ${Se(c)} / ${Se(a)}。`;
}
function lf(n = "free", e = /* @__PURE__ */ new Date()) {
  const r = String(n || "").trim().toLowerCase() === "paid" ? "paid" : "free", t = e instanceof Date ? new Date(e.getTime()) : new Date(e || Date.now()), a = t.toISOString();
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
  const o = new Date(Date.UTC(t.getUTCFullYear(), t.getUTCMonth(), t.getUTCDate(), 0, 0, 0, 0)), s = new Date(Date.UTC(t.getUTCFullYear(), t.getUTCMonth(), t.getUTCDate() + 1, 0, 0, 0, 0));
  return {
    planClass: r,
    periodLabel: "今日",
    startIso: o.toISOString(),
    endIso: a,
    resetAtIso: s.toISOString(),
    cacheBucketKey: o.toISOString().slice(0, 10)
  };
}
function kt(n, e = "cloudflare_runtime_error") {
  return String(n?.message || n || e).trim().replace(/\s+/g, " ").slice(0, 240) || e;
}
function fs(n, e = "count") {
  return e === "bytes" ? Xa(Math.max(0, Number(n) || 0)) : Se(n);
}
function ms(n = 0, e = H()) {
  const r = Math.max(0, Number(n) || 0), t = Math.max(r, Number(e) || H());
  if (r <= 0) return "";
  const a = Math.max(0, t - r);
  return a < 60 * 1e3 ? "缓存年龄：不到 1 分钟" : a < 3600 * 1e3 ? `缓存年龄：${Math.max(1, Math.round(a / (60 * 1e3)))} 分钟` : `缓存年龄：${Math.max(1, Math.round(a / (3600 * 1e3)))} 小时`;
}
function Tr({ key: n = "", label: e = "", used: r = 0, limit: t = 0, kind: a = "count" } = {}) {
  const o = Math.max(0, Number(r) || 0), s = Math.max(0, Number(t) || 0), i = s > 0 ? o / s * 100 : 0, c = ha(i);
  return {
    key: String(n || "").trim(),
    label: String(e || "").trim(),
    usedValue: o,
    limitValue: s,
    usedText: fs(o, a),
    limitText: fs(s, a),
    percent: c,
    percentText: `${c % 1 === 0 ? Math.round(c) : c}%`,
    tone: nf(i),
    rawPercent: i
  };
}
function ps(n = []) {
  return (Array.isArray(n) ? n : []).filter((e) => Number(e?.rawPercent) > 100).map((e) => String(e?.label || "").trim()).filter(Boolean);
}
function Ya(n = {}, e = {}) {
  const r = (Array.isArray(n.metrics) ? n.metrics : []).map((t) => ({
    key: String(t?.key || "").trim(),
    label: String(t?.label || "").trim(),
    usedText: String(t?.usedText || "").trim(),
    limitText: String(t?.limitText || "").trim(),
    percent: ha(t?.percent),
    percentText: String(t?.percentText || `${ha(t?.percent)}%`).trim(),
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
    metrics: r
  };
}
function Ar(n = "", e = "", r = "") {
  return Ya({
    title: n,
    status: "skipped",
    summary: e,
    detail: r
  });
}
function Cr(n = "", e = "", r = "") {
  return Ya({
    title: n,
    status: "failed",
    summary: e,
    detail: r
  });
}
function uf(n = "", e = {}, r = 0, t = []) {
  const a = Math.max(1, Math.min(100, Math.round(Number(r) || 0))), o = e && typeof e == "object" ? e : {}, s = (Array.isArray(t) ? t : []).map((p) => ({
    label: String(p?.label || "").trim(),
    percentText: String(p?.percentText || `${ha(p?.percent)}%`).trim()
  })).filter((p) => p.label), i = String(o.resourceLabel || "").trim() || String(n || "").trim(), c = String(o.planLabel || "").trim(), l = String(o.periodLabel || "").trim(), u = [i], d = [c, l].filter(Boolean);
  d.length > 0 && u.push(`（${d.join(" / ")}）`);
  const f = s.map((p) => `${p.label} ${p.percentText}`).join("、"), m = String(o.status || "").trim().toLowerCase() === "partial_failure" ? "（使用缓存数据）" : "";
  return `${String(n || "Cloudflare").trim() || "Cloudflare"} 使用量达到阈值：${u.join("")}，${f}（阈值 ${a}%）${m}`;
}
function In(n = [], e = []) {
  const r = new Set((Array.isArray(e) ? e : [e]).map((t) => String(t || "").trim()).filter(Boolean));
  for (const t of Array.isArray(n) ? n : []) {
    const a = String(t?.key || "").trim();
    if (!r.has(a)) continue;
    const o = String(t?.percentText || "").trim();
    if (o) return o;
    if (t?.percent !== void 0 && t?.percent !== null) return `${ha(t.percent)}%`;
  }
  return "暂不可用";
}
function df(n = {}, e = {}) {
  const r = n && typeof n == "object" ? n : {}, t = e && typeof e == "object" ? e : {}, a = String(r.requestCountDisplay || "").trim() || (r.todayRequests === null || r.todayRequests === void 0 ? "暂不可用" : String(Number(r.todayRequests) || 0)), o = String(r.todayTraffic || "").trim() || "暂不可用", s = String(r.monthlyTraffic || "").trim() || "暂不可用", i = Math.max(0, Number(r.playCount) || 0), c = Math.max(0, Number(r.infoCount) || 0);
  return [
    `📊 EMBY-PROXY每日报表${t.dateKey ? ` (${t.dateKey})` : ""}`,
    "",
    `请求数: ${a}`,
    `视频流量 (CF 总计): ${o}`,
    `本月流量 (CF 总计): ${s}`,
    `请求: 播放请求 ${Se(i)} 次 | 获取播放信息 ${Se(c)} 次`,
    "#Cloudflare #Emby #日报"
  ].map((l) => String(l || "").trim()).filter((l, u, d) => !(l === "" && (u === 0 || d[u - 1] === ""))).join(`
`);
}
function ff(n = "", e = {}, r = {}) {
  const t = Ii(n);
  if (t === "summary") return df(e, r);
  const a = t === "d1" ? "d1" : "kv", o = e && typeof e == "object" ? e : {}, s = r && typeof r == "object" ? r : {}, i = a === "d1" ? "D1 数据库每日消耗报告" : "KV 数据库每日消耗报告", c = a === "d1" ? "#D1" : "#KV", l = Array.isArray(o.metrics) ? o.metrics : [], u = s.dateKey ? ` (${s.dateKey})` : "", d = String(o.planLabel || "").trim(), f = String(o.periodLabel || "").trim(), m = d || f ? `${d || "未知"} 计划 X ${f || "当前"}配额` : String(o.summary || "").trim() || "暂不可用", p = In(l, a === "d1" ? ["rowsRead", "read"] : ["read", "rowsRead"]), g = In(l, a === "d1" ? ["rowsWritten", "write"] : ["write", "rowsWritten"]), h = In(l, ["storage"]);
  return [
    `📊 ${i}${u}`,
    `配额口径：${m}`,
    `读取使用率：${p}`,
    `写入使用率：${g}`,
    `存储使用率：${h}`,
    `#Cloudflare ${c} #日报`
  ].map((y) => String(y || "").trim()).filter((y, _, S) => !(y === "" && (_ === 0 || S[_ - 1] === ""))).join(`
`);
}
function gs(n = null, e = "") {
  const r = (Array.isArray(n?.errors) ? n.errors : []).map((a) => {
    const o = String(a?.code || "").trim(), s = String(a?.message || "").trim();
    return o && s ? `${o}: ${s}` : s || o;
  }).filter(Boolean);
  if (r.length > 0) return r.join("; ");
  const t = String(e || "").trim();
  return t ? t.replace(/\s+/g, " ").slice(0, 300) : "";
}
async function Te(n, e, r = {}) {
  const t = r && typeof r == "object" ? r : {};
  let a = {};
  const o = t?.headers;
  o && (o instanceof Headers ? a = Object.fromEntries(o.entries()) : typeof o == "object" && (a = o));
  const s = typeof FormData < "u" && t?.body instanceof FormData, i = await We(n, {
    ...t,
    headers: {
      Authorization: `Bearer ${e}`,
      ...s ? {} : { "Content-Type": "application/json" },
      ...a
    }
  }), c = await Pe(i, js);
  if (c.exceeded) throw new Error("cf_api_response_too_large");
  const l = c.text;
  let u = null;
  if (l) try {
    u = JSON.parse(l);
  } catch {
  }
  if (!i.ok) {
    const d = Number(i.status) || 0, f = gs(u, l), m = /* @__PURE__ */ new Error(f ? `cf_api_http_${d}: ${f}` : `cf_api_http_${d}`);
    throw m.status = d, m;
  }
  if (!u || typeof u != "object") return {};
  if (u?.success === !1) {
    const d = gs(u, l);
    throw new Error(d || "cf_api_error");
  }
  return u;
}
async function oc(n, e, r) {
  const t = r && typeof r == "object" ? {
    query: e,
    variables: r
  } : { query: e }, a = await We("https://api.cloudflare.com/client/v4/graphql", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${n}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify(t)
  });
  if (!a.ok) throw new Error(`cf_graphql_http_${a.status}`);
  const o = await Pe(a, js);
  if (o.exceeded) throw new Error("cf_graphql_response_too_large");
  const s = JSON.parse(o.text);
  if (Array.isArray(s?.errors) && s.errors.length) throw new Error(s.errors.map((i) => i?.message).filter(Boolean).join("; ") || "cf_graphql_error");
  return s;
}
async function sc(n, e, r, t) {
  return (await oc(e, r, t))?.data?.viewer?.zones?.[0] || null;
}
async function hn(n, e, r, t) {
  return (await oc(e, r, t))?.data?.viewer?.accounts?.[0] || null;
}
async function ic(n, e) {
  return !n || !e ? null : (await Te(`https://api.cloudflare.com/client/v4/zones/${encodeURIComponent(String(n).trim())}`, e))?.result || null;
}
async function cc(n, e, r = {}) {
  const t = String(n || "").trim();
  return await he(ic(t, e), String(r?.scope || "cloudflare.zone_lookup"), {
    zoneId: t,
    ...k(r?.context) ? r.context : {}
  }, null);
}
async function Po(n, e, r = {}) {
  const t = await ic(n, e), a = String(t?.name || "").trim();
  if (t && a) return t;
  const o = /* @__PURE__ */ new Error("cf_zone_context_missing");
  throw o.code = "CF_ZONE_CONTEXT_MISSING", o.status = 400, o.details = {
    zoneId: String(n || "").trim(),
    scope: String(r?.scope || "").trim()
  }, o;
}
async function lc(n, e) {
  const r = String(n || "").trim(), t = String(e || "").trim();
  return !r || !t ? "" : ya((await Te(`https://api.cloudflare.com/client/v4/accounts/${encodeURIComponent(r)}/workers/account-settings`, t))?.result?.default_usage_model);
}
async function mf(n, e, r) {
  const t = String(n || "").trim(), a = String(e || "").trim(), o = String(r || "").trim();
  return !t || !a || !o ? null : (await Te(`https://api.cloudflare.com/client/v4/accounts/${encodeURIComponent(t)}/storage/kv/namespaces/${encodeURIComponent(a)}`, o))?.result || null;
}
async function hs(n, e, r) {
  const t = String(n || "").trim(), a = String(e || "").trim(), o = String(r || "").trim();
  return !t || !a || !o ? null : (await Te(`https://api.cloudflare.com/client/v4/accounts/${encodeURIComponent(t)}/d1/database/${encodeURIComponent(a)}`, o))?.result || null;
}
async function pf({ accountId: n, apiToken: e, namespaceId: r, startIso: t, endIso: a }) {
  const o = String(n || "").trim(), s = String(e || "").trim(), i = String(r || "").trim();
  if (!o || !s || !i) return null;
  const c = await hn(o, s, `
    query {
      viewer {
        accounts(filter: { accountTag: ${be(o)} }) {
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
async function gf({ accountId: n, apiToken: e, databaseId: r, startIso: t, endIso: a }) {
  const o = String(n || "").trim(), s = String(e || "").trim(), i = String(r || "").trim();
  if (!o || !s || !i) return null;
  const c = await hn(o, s, `
    query {
      viewer {
        accounts(filter: { accountTag: ${be(o)} }) {
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
async function hf({ accountId: n, apiToken: e, databaseId: r, startIso: t, endIso: a, utcOffsetMinutes: o = F.Defaults.ScheduleUtcOffsetMinutes }) {
  const s = String(n || "").trim(), i = String(e || "").trim(), c = String(r || "").trim();
  if (!s || !i || !c) return [];
  const l = await hn(s, i, `
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
  const u = Array.isArray(l?.d1AnalyticsAdaptiveGroups) ? l.d1AnalyticsAdaptiveGroups : [], d = /* @__PURE__ */ new Map();
  for (const f of u) {
    const m = String(f?.dimensions?.datetimeHour || "").trim();
    if (!m) continue;
    const p = Date.parse(m);
    if (!Number.isFinite(p)) continue;
    const g = Dt(new Date(p), o), h = `${g.dateKey}:${g.hour}`, y = d.get(h) || {
      dateKey: g.dateKey,
      hour: g.hour,
      rowsWritten: 0,
      writeQueries: 0
    };
    y.rowsWritten += Math.max(0, Number(f?.sum?.rowsWritten) || 0), y.writeQueries += Math.max(0, Number(f?.sum?.writeQueries) || 0), d.set(h, y);
  }
  return [...d.values()].sort((f, m) => f.dateKey !== m.dateKey ? String(f.dateKey).localeCompare(String(m.dateKey)) : Number(f.hour) - Number(m.hour));
}
async function yf({ cfAccountId: n, cfZoneId: e, cfApiToken: r, startIso: t, endIso: a, utcOffsetMinutes: o = F.Defaults.ScheduleUtcOffsetMinutes }) {
  if (!n || !r) return null;
  const s = await hn(n, r, `
  query {
    viewer {
      accounts(filter: { accountTag: ${be(n)} }) {
        workersInvocationsAdaptive(limit: 10000, filter: { datetime_geq: ${be(t)}, datetime_leq: ${be(a)} }) {
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
    const p = Dt(m, o).hour;
    c[p] && (c[p].total += d);
  }
  return {
    totalRequests: l,
    hourlySeries: c
  };
}
async function Sf({ cfAccountId: n, cfZoneId: e, cfApiToken: r, zoneNameFallback: t = "" }) {
  const a = [], o = (s, i = {}) => {
    const c = co(s);
    if (!c) return;
    const l = i.wildcard === !0 || c.wildcard === !0;
    a.push({
      hostname: c.hostname,
      path: String(i.path || ""),
      wildcard: l,
      score: Eo(c.hostname, {
        wildcard: l,
        path: i.path || ""
      })
    });
  };
  if (n && e) try {
    const s = await Te(`https://api.cloudflare.com/client/v4/accounts/${encodeURIComponent(String(n).trim())}/workers/domains?zone_id=${encodeURIComponent(String(e).trim())}`, r);
    for (const i of s?.result || []) o(i?.hostname);
  } catch (s) {
    console.log("CF Workers domains lookup failed, will try routes", s);
  }
  if (!a.length && e) try {
    let s = 1, i = 1;
    do {
      const c = await Te(`https://api.cloudflare.com/client/v4/zones/${encodeURIComponent(String(e).trim())}/workers/routes?page=${s}&per_page=100`, r);
      i = Number(c?.result_info?.total_pages || c?.result_info?.totalPages || 1);
      for (const l of c?.result || []) {
        const u = ci(l?.pattern);
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
  return a.length ? (a.sort((s, i) => i.score - s.score || s.hostname.length - i.hostname.length || s.hostname.localeCompare(i.hostname)), a[0].hostname) : t || "未知域名 (请配置 CF 联动)";
}
function jt(n = "") {
  const e = String(n || "").trim();
  return /^[a-z0-9_][a-z0-9-_]*$/i.test(e) ? e : "";
}
function yn(n) {
  if (n !== void 0)
    try {
      return JSON.parse(JSON.stringify(n));
    } catch {
      return null;
    }
}
function Be(n, e = [], r = {}) {
  if (typeof n == "string") return String(n).trim();
  if (!n || typeof n != "object") return "";
  const t = Array.isArray(e) ? e : [], a = [
    "id",
    "value",
    "name",
    "region",
    "provider",
    "providerId",
    "hostname",
    "host"
  ], o = t.length ? t : a, s = r?.allowFallback !== !1, i = [o];
  s && t.length && i.push(a);
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
function _f(n = "") {
  const e = String(n || "").trim().toLowerCase();
  return e ? e === "aws" ? "AWS" : e === "gcp" || e === "google" ? "GCP" : e === "azure" ? "Azure" : e.toUpperCase() : "";
}
function bf(n = "", e = "") {
  const r = String(n || "").trim().toLowerCase().replace(/_/g, "-"), t = String(e || "").trim().toLowerCase(), a = `${t}:${r}`;
  if (!r && !t) return {
    key: "other",
    label: "其他",
    sortOrder: 9
  };
  const o = (s = []) => s.some((i) => a.includes(String(i || "").trim().toLowerCase()));
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
function Ef(n) {
  return Array.isArray(n) ? n : n && typeof n == "object" ? [n] : typeof n == "string" && n.trim() ? [{ value: n }] : [];
}
function Rf(n = []) {
  const e = [], r = /* @__PURE__ */ new Set();
  for (const t of Array.isArray(n) ? n : []) {
    const a = String(t?.id || t?.provider || t?.providerId || "").trim().toLowerCase();
    if (!a) continue;
    const o = _f(a);
    for (const s of Array.isArray(t?.regions) ? t.regions : []) {
      const i = String(s?.id || s?.region || s?.value || "").trim();
      if (!i) continue;
      const c = `${a}:${i}`;
      if (r.has(c)) continue;
      r.add(c);
      const l = bf(i, a);
      e.push({
        provider: a,
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
  return e.sort((t, a) => String(t.providerLabel || t.provider || "").localeCompare(String(a.providerLabel || a.provider || "")) || Number(t.geoSortOrder || 0) - Number(a.geoSortOrder || 0) || String(t.regionLabel || t.region || "").localeCompare(String(a.regionLabel || a.region || "")) || String(t.value || "").localeCompare(String(a.value || "")));
}
function Fr(n, e = "", r = []) {
  const t = Be(n, [
    "region",
    "value",
    "id"
  ]);
  if (!t) return "";
  if (t.includes(":")) return t;
  const a = Be(e, [
    "provider",
    "providerId",
    "id",
    "value"
  ]).toLowerCase();
  if (a) return `${a}:${t}`;
  const o = (Array.isArray(r) ? r : []).filter((s) => String(s?.region || "").trim() === t || String(s?.value || "").trim() === t);
  return o.length === 1 ? String(o[0]?.value || "").trim() : t;
}
function _a(n = {}, e = []) {
  const r = n && typeof n == "object" ? n : {}, t = String(r?.mode || "").trim().toLowerCase(), a = Ef(r?.target), o = Fr(r?.region, r?.provider || r?.providerId || "", e), s = a.find((_) => !!Fr(Be(_, [
    "region",
    "value",
    "id"
  ]), Be(_, ["provider", "providerId"]), e)), i = s ? Fr(Be(s, [
    "region",
    "value",
    "id"
  ]), Be(s, ["provider", "providerId"]), e) : "", c = Be(r?.hostname, ["hostname"], { allowFallback: !1 }) || Be(r, ["hostname"], { allowFallback: !1 }), l = Be(a.find((_) => Be(_, ["hostname"], { allowFallback: !1 })), ["hostname"], { allowFallback: !1 }), u = Be(r?.host, ["host"], { allowFallback: !1 }) || Be(r, ["host"], { allowFallback: !1 }), d = Be(a.find((_) => Be(_, ["host"], { allowFallback: !1 })), ["host"], { allowFallback: !1 }), f = Be(a[0], ["value", "id"]);
  let m = "default", p = "__default__", g = "", h = "default", y = "";
  return t === "smart" ? (m = "smart", p = "__smart__", h = "smart") : t === "targeted" ? c || l ? (m = "hostname", p = "", g = c || l, h = "") : u || d ? (m = "host", p = "", g = u || d, h = "") : (m = "targeted", p = i || o || "", g = p || f || "", h = "") : o ? (m = "region", p = o, h = "region", y = o) : c ? (m = "hostname", p = "", g = c, h = "") : u ? (m = "host", p = "", g = u, h = "") : (i || a.length > 0) && (m = "targeted", p = i || "", g = p || f || "", h = ""), {
    currentMode: m,
    currentValue: p,
    currentTarget: g,
    selectedMode: h,
    selectedRegion: y,
    isTargetedOverride: m === "hostname" || m === "host" || m === "targeted"
  };
}
function uc(n = []) {
  return (Array.isArray(n) ? n : []).filter((e) => e && typeof e == "object").map((e) => {
    const r = String(e.scope || "").trim(), t = String(e.permission || "").trim(), a = String(e.alternative || "").trim(), o = String(e.note || "").trim(), s = [];
    return r && s.push(`${r}级`), t && s.push(`"${t}"`), a && s.push(`（若当前令牌仅授予写权限，可改用 "${a}"）`), o && s.push(`：${o}`), s.join("");
  }).filter(Boolean);
}
function dc(n = "", e = {}) {
  const r = String(n || "").trim().toLowerCase();
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
function Tf(n = "", e = "读取", r = {}) {
  const t = uc(dc(n, r));
  return t.length <= 0 ? `Cloudflare Worker 放置${e}失败：API Token 权限不足` : `Cloudflare Worker 放置${e}失败：API Token 权限不足。至少需要：${t.join("；")}`;
}
function Sn(n = "WORKER_PLACEMENT_FORBIDDEN", e = "", r = "读取", t = {}) {
  return Le(n, Tf(e, r, t), 403, {
    permissionKind: String(e || "").trim(),
    requiredPermissions: dc(e, t)
  });
}
function Xn(n = {}) {
  const e = n && typeof n == "object" && !Array.isArray(n) ? n : {}, r = Object.prototype.hasOwnProperty.call(e, "currentValue"), t = Object.prototype.hasOwnProperty.call(e, "selectedMode");
  return {
    configured: e.configured === !0,
    scriptName: String(e.scriptName || "").trim(),
    requestHost: re(e.requestHost || ""),
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
function Af(n = "", e = "", r = !1) {
  const t = re(n), a = re(e);
  return !t || !a ? !1 : r ? t === a || t.endsWith(`.${a}`) : t === a;
}
function Cf(n = "", e = "/") {
  const r = String(n || "").trim(), t = String(e || "/").trim() || "/";
  return !r || r === "/" || r === "/*" ? !0 : r.endsWith("*") ? t.startsWith(r.slice(0, -1)) : t === r;
}
function wf(n = {}) {
  const e = re(n?.hostname || ""), r = jt(n?.service || n?.script || n?.name || "");
  return !e || !r ? null : {
    source: "domains",
    hostname: e,
    wildcard: !1,
    path: "/",
    scriptName: r,
    score: Eo(e, {
      wildcard: !1,
      path: "/"
    })
  };
}
function Lf(n = {}) {
  const e = ci(n?.pattern), r = jt(n?.script || n?.service || n?.name || "");
  return !e || !r ? null : {
    source: "routes",
    hostname: e.hostname,
    wildcard: e.wildcard === !0,
    path: e.path || "/",
    pattern: e.pattern,
    scriptName: r,
    score: Eo(e.hostname, {
      wildcard: e.wildcard === !0,
      path: e.path || "/"
    })
  };
}
function ys(n = [], e = "", r = "/") {
  const t = re(e), a = String(r || "/").trim() || "/", o = [];
  for (const s of Array.isArray(n) ? n : [])
    !s?.scriptName || !s?.hostname || Af(t, s.hostname, s.wildcard === !0) && Cf(s.path || "/", a) && o.push({
      ...s,
      exactHostname: t === re(s.hostname),
      exactPath: String(s.path || "/") === a
    });
  return o.length > 0 ? (o.sort((s, i) => Number(i.exactHostname) - Number(s.exactHostname) || Number(i.exactPath) - Number(s.exactPath) || Number(i.score || 0) - Number(s.score || 0) || String(s.hostname || "").length - String(i.hostname || "").length || String(s.scriptName || "").localeCompare(String(i.scriptName || ""))), o[0]) : null;
}
async function fc(n, e) {
  const r = String(n || "").trim(), t = String(e || "").trim();
  if (!r || !t) return [];
  let a = null;
  try {
    a = await Te(`https://api.cloudflare.com/client/v4/accounts/${encodeURIComponent(r)}/workers/placement/regions`, t);
  } catch (o) {
    throw Number(o?.status) === 403 ? Sn("WORKER_PLACEMENT_REGIONS_FORBIDDEN", "regions_read", "读取") : o;
  }
  return Rf(a?.result?.providers);
}
async function Df(n, e, r = {}) {
  const t = String(n || "").trim(), a = String(e || "").trim();
  if (!t || !a) return [];
  const o = new URL(`https://api.cloudflare.com/client/v4/accounts/${encodeURIComponent(t)}/workers/domains`), s = String(r?.zoneId || "").trim(), i = re(r?.hostname || ""), c = jt(r?.service || "");
  s && o.searchParams.set("zone_id", s), i && o.searchParams.set("hostname", i), c && o.searchParams.set("service", c);
  const l = await Te(o.toString(), a);
  return Array.isArray(l?.result) ? l.result : [];
}
async function Nf(n, e) {
  const r = String(n || "").trim(), t = String(e || "").trim();
  if (!r || !t) return [];
  const a = [];
  let o = 1, s = 1;
  do {
    const i = await Te(`https://api.cloudflare.com/client/v4/zones/${encodeURIComponent(r)}/workers/routes?page=${o}&per_page=100`, t);
    Array.isArray(i?.result) && a.push(...i.result), s = Number(i?.result_info?.total_pages || i?.result_info?.totalPages || 1), o += 1;
  } while (o <= s && o <= 10);
  return a;
}
async function xo({ cfAccountId: n, cfZoneId: e, cfApiToken: r, request: t }) {
  const a = new URL(t?.url || "https://invalid.local/"), o = re(a.hostname), s = String(a.pathname || "/").trim() || "/";
  if (!o) throw Le("WORKER_PLACEMENT_HOST_INVALID", "当前请求 host 无效，无法识别 Worker 脚本", 400);
  const i = [], c = /* @__PURE__ */ new Set();
  let l = null, u = !1, d = !1;
  const f = [{
    zoneId: e,
    hostname: o
  }, { hostname: o }];
  for (const m of f) {
    const p = JSON.stringify({
      zoneId: String(m?.zoneId || "").trim(),
      hostname: re(m?.hostname || "")
    });
    if (!c.has(`query:${p}`)) {
      c.add(`query:${p}`);
      try {
        const g = await Df(n, r, m);
        for (const y of g) {
          const _ = wf(y);
          if (!_) continue;
          const S = `${_.source}|${_.scriptName}|${_.hostname}|${_.path}`;
          c.has(S) || (c.add(S), i.push(_));
        }
        const h = ys(i, o, s);
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
          hostname: re(m?.hostname || ""),
          reason: ce(g)
        });
      }
    }
  }
  try {
    const m = ys(await Nf(e, r).then((p) => p.map((g) => Lf(g)).filter(Boolean)), o, s);
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
      reason: ce(m)
    });
  }
  throw u || d ? Sn("WORKER_PLACEMENT_SCRIPT_DISCOVERY_FORBIDDEN", "discovery", "读取", { includeRouteFallback: d }) : l || Le("WORKER_PLACEMENT_SCRIPT_UNRESOLVED", "未能根据当前站点自动识别 Worker 脚本，请确认当前 host 已绑定到该 Zone 的 Workers Domain 或 Workers Route", 400, { requestHost: o });
}
async function Ja(n, e, r) {
  let t = null;
  try {
    t = await Te(`https://api.cloudflare.com/client/v4/accounts/${encodeURIComponent(String(n || "").trim())}/workers/scripts/${encodeURIComponent(String(e || "").trim())}/settings`, String(r || "").trim());
  } catch (a) {
    throw Number(a?.status) === 403 ? Sn("WORKER_PLACEMENT_SETTINGS_READ_FORBIDDEN", "settings_read", "读取") : a;
  }
  return k(t?.result) ? t.result : {};
}
async function Yr(n, e, r, t = {}) {
  const a = new FormData();
  a.append("settings", new Blob([JSON.stringify(t && typeof t == "object" ? t : {})], { type: "application/json" }), "settings.json");
  let o = null;
  try {
    o = await Te(`https://api.cloudflare.com/client/v4/accounts/${encodeURIComponent(String(n || "").trim())}/workers/scripts/${encodeURIComponent(String(e || "").trim())}/settings`, String(r || "").trim(), {
      method: "PATCH",
      body: a
    });
  } catch (s) {
    throw Number(s?.status) === 403 ? Sn("WORKER_PLACEMENT_SETTINGS_WRITE_FORBIDDEN", "settings_write", "保存") : s;
  }
  return k(o?.result) ? o.result : {};
}
function Qa(n, e = "read") {
  const r = e === "write" ? "保存" : e === "default" ? "恢复默认" : "读取", t = String(n?.message || n || "").trim() || `Worker 放置${r}失败`, a = Number(n?.status) || Number(/cf_api_http_(\d+)/i.exec(t)?.[1] || 0), o = String(n?.code || "").trim().toUpperCase();
  return o.startsWith("WORKER_PLACEMENT_") && String(n?.message || "").trim() ? n.message : a === 401 ? `Cloudflare Worker 放置${r}失败：API Token 无效` : a === 403 ? `Cloudflare Worker 放置${r}失败：API Token 权限不足` : a === 404 && e !== "read" ? "Cloudflare Worker 放置保存失败：未找到目标 Worker 脚本" : a === 404 ? "Cloudflare Worker 放置读取失败：未找到目标 Worker 脚本" : o === "WORKER_PLACEMENT_SCRIPT_UNRESOLVED" || o === "WORKER_PLACEMENT_HOST_INVALID" || o === "WORKER_PLACEMENT_CONFIG_REQUIRED" ? n.message : t;
}
function Oo(n = {}) {
  const e = String(n?.cfAccountId || "").trim(), r = String(n?.cfZoneId || "").trim(), t = String(n?.cfApiToken || "").trim(), a = [];
  if (e || a.push("cfAccountId"), r || a.push("cfZoneId"), t || a.push("cfApiToken"), a.length <= 0) return {
    cfAccountId: e,
    cfZoneId: r,
    cfApiToken: t
  };
  throw Le("WORKER_PLACEMENT_CONFIG_REQUIRED", "请先在账号设置中填写并保存 Cloudflare Account ID、Zone ID 与 API Token", 400, { missingFields: a });
}
function vo(n = "") {
  const e = jt(n);
  return e ? `sys:worker_placement_region:v1:${e}` : "";
}
function Bt(n = "WORKER_PLACEMENT_KV_FAILED", e = "Worker 放置 KV 持久化失败", r = null) {
  return Le(n, e, 503, r);
}
function If(n) {
  return an(n) && String(n?.code || "").trim().toUpperCase().startsWith("WORKER_PLACEMENT_") && String(n?.details?.dependency || "").trim().toUpperCase() === "KV";
}
function mc(n = {}, e = "") {
  const r = jt(e);
  if (!r || !k(n)) return null;
  const t = Fr(n?.region, n?.provider || n?.providerId || "", []);
  return t ? {
    scriptName: r,
    region: t,
    updatedAt: String(n?.updatedAt || "").trim()
  } : null;
}
async function pc(n, e = "") {
  if (!n) return null;
  const r = vo(e);
  return r ? mc(await Me(n, r, { type: "json" }), e) : null;
}
async function gc(n, e = "", r = "") {
  if (!n) throw Bt("WORKER_PLACEMENT_REGION_OVERRIDE_WRITE_FAILED", "Worker 放置 Region 持久化失败：KV 未配置", {
    dependency: "KV",
    operation: "put",
    reason: "kv_not_configured"
  });
  const t = vo(e), a = jt(e), o = Fr(r, "", []);
  if (!t || !a || !o) throw Bt("WORKER_PLACEMENT_REGION_OVERRIDE_WRITE_FAILED", "Worker 放置 Region 持久化失败：Region 数据无效", {
    dependency: "KV",
    operation: "put",
    key: t,
    scriptName: a,
    region: o,
    reason: "invalid_region_override"
  });
  const s = {
    scriptName: a,
    region: o,
    updatedAt: (/* @__PURE__ */ new Date()).toISOString()
  };
  try {
    await n.put(t, JSON.stringify(s));
  } catch (i) {
    throw Bt("WORKER_PLACEMENT_REGION_OVERRIDE_WRITE_FAILED", "Worker 放置 Region 持久化失败：KV 写入异常", {
      dependency: "KV",
      operation: "put",
      key: t,
      scriptName: a,
      region: o,
      reason: ce(i)
    });
  }
  return s;
}
async function Ss(n, e = "") {
  if (!n) throw Bt("WORKER_PLACEMENT_REGION_OVERRIDE_DELETE_FAILED", "Worker 放置 Region 清理失败：KV 未配置", {
    dependency: "KV",
    operation: "delete",
    reason: "kv_not_configured"
  });
  const r = vo(e), t = jt(e);
  if (!r || !t) return !1;
  try {
    await n.delete(r);
  } catch (a) {
    throw Bt("WORKER_PLACEMENT_REGION_OVERRIDE_DELETE_FAILED", "Worker 放置 Region 清理失败：KV 删除异常", {
      dependency: "KV",
      operation: "delete",
      key: r,
      scriptName: t,
      reason: ce(a)
    });
  }
  return !0;
}
function Mf(n = "") {
  const e = String(n || "").trim();
  return e ? `当前已保存的 Worker Placement Region（${e}）已不在 Cloudflare 可选区域列表中，请重新选择并保存` : "当前已保存的 Worker Placement Region 已不在 Cloudflare 可选区域列表中，请重新选择并保存";
}
function _s(n = "", e = "", r = "", t = [], a = {}) {
  const o = Fr(r, "", t), s = Array.isArray(t) ? t : [], i = s.find((u) => String(u?.value || "").trim() === o) || null, c = a?.regionError || null;
  let l = String(a?.error || "").trim();
  return !l && c ? l = Qa(c, "read") : !l && o && s.length > 0 && !i && (l = Mf(o)), Xn({
    configured: a?.configured !== !1,
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
async function Mn(n, e, r, t = {}) {
  let a = !1, o = !1, s = "";
  try {
    const i = mc(t?.previousOverride, e), c = t?.originalState && typeof t.originalState == "object" ? t.originalState : _a(t?.originalPlacement, t?.regionOptions);
    if (i?.region)
      return a = !0, await Yr(n, e, r, { placement: { region: i.region } }), o = !0, {
        rollbackAttempted: a,
        rollbackSucceeded: o,
        rollbackError: s
      };
    a = !0, String(c?.currentMode || "").trim().toLowerCase() === "default" ? await hc(n, e, r, t?.regionOptions) : await Yr(n, e, r, { placement: yn(t?.originalPlacement) }), o = !0;
  } catch (i) {
    o = !1, s = ce(i);
  }
  return {
    rollbackAttempted: a,
    rollbackSucceeded: o,
    rollbackError: s
  };
}
async function bs(n = {}, e, r = {}) {
  let t = "", a = "";
  try {
    const o = Oo(n), s = await xo({
      ...o,
      request: e
    });
    t = s.scriptName, a = s.requestHost;
    const i = await pc(r?.kv, s.scriptName);
    let c = [], l = null;
    try {
      c = await fc(o.cfAccountId, o.cfApiToken);
    } catch (d) {
      l = d;
    }
    if (i?.region) return _s(s.scriptName, s.requestHost, i.region, c, {
      configured: !l,
      regionError: l
    });
    const u = _a(yn((await Ja(o.cfAccountId, s.scriptName, o.cfApiToken))?.placement), c);
    return u.currentMode === "region" && u.currentValue ? (await gc(r?.kv, s.scriptName, u.currentValue), _s(s.scriptName, s.requestHost, u.currentValue, c, {
      configured: !l,
      regionError: l
    })) : Xn({
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
      error: l ? Qa(l, "read") : ""
    });
  } catch (o) {
    if (go(o) || If(o) || r?.softFail !== !0) throw o;
    return Xn({
      configured: !1,
      scriptName: t,
      requestHost: a,
      selectedMode: "",
      currentMode: "default",
      currentValue: "__default__",
      error: Qa(o, "read")
    });
  }
}
async function hc(n, e, r, t = []) {
  const a = await Ja(n, e, r), o = yn(a?.placement), s = _a(o, t);
  if (s.currentMode === "default") return {
    settings: a,
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
    await Yr(n, e, r, u.patch);
    const d = await Ja(n, e, r), f = _a(d?.placement, t);
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
      await Yr(n, e, r, { placement: o }), c = !0;
    } catch (u) {
      c = !1, l = ce(u);
    }
  }
  throw Le("WORKER_PLACEMENT_DEFAULT_BLOCKED", "Cloudflare 当前接口未验证出可安全恢复 Default Placement；本次已停止，未使用近似映射", 409, {
    scriptName: e,
    rollbackAttempted: i,
    rollbackSucceeded: c,
    rollbackError: l
  });
}
function Pf(n = {}, e = {}) {
  const { kernel: r } = n, { CacheManager: t, buildAdminShellState: a, buildAdminUiContract: o, withAdminShellRuntimeStatus: s } = n;
  return {
    async getDashboardSnapshot(i, { env: c, ctx: l, kv: u, db: d }) {
      const f = await fe(c);
      return te(await r.getDashboardSnapshotPayload(c, {
        ctx: l,
        kv: u,
        db: d,
        config: f,
        forceRefresh: i?.forceRefresh === !0
      }));
    },
    async getDashboardStats(i, { env: c, ctx: l, kv: u, db: d }) {
      const f = await fe(c), m = await r.getDashboardSnapshotPayload(c, {
        ctx: l,
        kv: u,
        db: d,
        config: f,
        forceRefresh: i?.forceRefresh === !0
      });
      return te({
        ...m?.stats && typeof m.stats == "object" ? m.stats : {},
        cacheMeta: m?.cacheMeta && typeof m.cacheMeta == "object" ? m.cacheMeta : {}
      });
    },
    async getMonthlyTrafficStats(i, { env: c, ctx: l }) {
      const u = await fe(c);
      return te(await r.getDashboardMonthlyTrafficPayload(c, {
        ctx: l,
        config: u,
        forceRefresh: i?.forceRefresh === !0
      }));
    },
    async getRuntimeStatus(i, { env: c, db: l }) {
      const u = await fe(c), d = await r.getRuntimeStatusPayload(c, {
        db: l,
        config: u,
        forceRefresh: i?.forceRefresh === !0
      });
      return te({
        status: d?.status && typeof d.status == "object" ? d.status : {},
        cacheMeta: d?.cacheMeta && typeof d.cacheMeta == "object" ? d.cacheMeta : {}
      });
    },
    async getAdminBootstrap(i, { env: c, ctx: l, kv: u, db: d }) {
      try {
        const f = await fe(c), m = Ke(c), [p, g] = await Promise.all([t.getNodesListStrict(c, l), r.getRuntimeStatusPayload(c, {
          ctx: l,
          kv: u,
          db: d,
          config: f
        })]), h = await r.getAdminRevisionsForRead({
          env: c,
          kv: u,
          db: d
        }, {
          ctx: l,
          config: f,
          nodes: p
        });
        return te({
          adminPath: it(c),
          loginPath: wo(c),
          initHealth: m,
          config: Et(f),
          hostDomain: Ve(c),
          legacyHost: Wr(c),
          contract: o(),
          nodes: p,
          shell: a(c, m, f),
          runtimeStatus: g?.status && typeof g.status == "object" ? g.status : s({}, c, f, m),
          revisions: h,
          generatedAt: (/* @__PURE__ */ new Date()).toISOString()
        });
      } catch (f) {
        throw Rt(f, "ADMIN_BOOTSTRAP_READ_FAILED", "管理台启动数据加载失败：KV 读取异常", "admin.read.bootstrap");
      }
    },
    async getSettingsBootstrap(i, { env: c, ctx: l, kv: u, db: d }) {
      let f;
      try {
        f = await fe(c);
      } catch (h) {
        throw Rt(h, "SETTINGS_BOOTSTRAP_READ_FAILED", "设置页加载失败：KV 读取异常", "admin.read.settings_bootstrap");
      }
      let m = [], p = {}, g = {};
      try {
        m = await t.getNodesListStrict(c, l);
      } catch (h) {
        console.warn("[settings_bootstrap.nodes_degraded]", ce(h));
      }
      try {
        const h = await r.getRuntimeStatusPayload(c, {
          ctx: l,
          kv: u,
          db: d,
          config: f
        });
        p = h?.status && typeof h.status == "object" ? h.status : {};
      } catch (h) {
        console.warn("[settings_bootstrap.runtime_status_degraded]", ce(h));
      }
      try {
        g = await r.getAdminRevisionsForRead({
          env: c,
          kv: u,
          db: d
        }, {
          ctx: l,
          config: f,
          nodes: m
        });
      } catch (h) {
        console.warn("[settings_bootstrap.revisions_degraded]", ce(h));
      }
      return te({
        config: Et(f),
        hostDomain: Ve(c),
        legacyHost: Wr(c),
        contract: o(),
        nodes: m,
        runtimeStatus: s(p, c, f, Ke(c)),
        revisions: g,
        generatedAt: (/* @__PURE__ */ new Date()).toISOString()
      });
    },
    async getWorkerPlacementStatus(i, { env: c, request: l, kv: u }) {
      try {
        return te(await bs(await fe(c), l, {
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
        d = await fe(c);
      } catch (m) {
        throw Rt(m, "WORKER_PLACEMENT_SAVE_FAILED", "Worker 放置保存失败：KV 读取异常", "admin.write.worker_placement");
      }
      const f = String(i?.mode || "").trim().toLowerCase();
      if (f !== "default" && f !== "smart" && f !== "region") return W("WORKER_PLACEMENT_MODE_INVALID", "请选择有效的 Worker 放置模式");
      try {
        const m = Oo(d), p = await xo({
          ...m,
          request: l
        }), g = await pc(u, p.scriptName), h = await fc(m.cfAccountId, m.cfApiToken), y = yn((await Ja(m.cfAccountId, p.scriptName, m.cfApiToken))?.placement), _ = _a(y, h);
        if (f === "region") {
          const S = String(i?.region || "").trim(), A = h.find((b) => String(b?.value || "").trim() === S);
          if (!A) return W("WORKER_PLACEMENT_REGION_INVALID", "所选 Placement 区域已失效，请刷新后重试");
          await Yr(m.cfAccountId, p.scriptName, m.cfApiToken, { placement: { region: A.value } });
          try {
            await gc(u, p.scriptName, A.value);
          } catch (b) {
            const R = await Mn(m.cfAccountId, p.scriptName, m.cfApiToken, {
              previousOverride: g,
              originalPlacement: y,
              originalState: _,
              regionOptions: h
            });
            throw Bt(b?.code || "WORKER_PLACEMENT_REGION_OVERRIDE_WRITE_FAILED", String(b?.message || "Worker 放置 Region 持久化失败：KV 写入异常"), {
              ...k(b?.details) ? b.details : {},
              requestedMode: f,
              dependency: "KV",
              region: A.value,
              rollbackAttempted: R.rollbackAttempted,
              rollbackSucceeded: R.rollbackSucceeded,
              rollbackError: R.rollbackError
            });
          }
        } else if (f === "smart") {
          if (await Yr(m.cfAccountId, p.scriptName, m.cfApiToken, { placement: { mode: "smart" } }), g) try {
            await Ss(u, p.scriptName);
          } catch (S) {
            const A = await Mn(m.cfAccountId, p.scriptName, m.cfApiToken, {
              previousOverride: g,
              originalPlacement: y,
              originalState: _,
              regionOptions: h
            });
            throw Bt(S?.code || "WORKER_PLACEMENT_REGION_OVERRIDE_DELETE_FAILED", String(S?.message || "Worker 放置 Region 清理失败：KV 删除异常"), {
              ...k(S?.details) ? S.details : {},
              requestedMode: f,
              dependency: "KV",
              rollbackAttempted: A.rollbackAttempted,
              rollbackSucceeded: A.rollbackSucceeded,
              rollbackError: A.rollbackError
            });
          }
        } else if (await hc(m.cfAccountId, p.scriptName, m.cfApiToken, h), g) try {
          await Ss(u, p.scriptName);
        } catch (S) {
          const A = await Mn(m.cfAccountId, p.scriptName, m.cfApiToken, {
            previousOverride: g,
            originalPlacement: y,
            originalState: _,
            regionOptions: h
          });
          throw Bt(S?.code || "WORKER_PLACEMENT_REGION_OVERRIDE_DELETE_FAILED", String(S?.message || "Worker 放置 Region 清理失败：KV 删除异常"), {
            ...k(S?.details) ? S.details : {},
            requestedMode: f,
            dependency: "KV",
            rollbackAttempted: A.rollbackAttempted,
            rollbackSucceeded: A.rollbackSucceeded,
            rollbackError: A.rollbackError
          });
        }
        return te(await bs(d, l, {
          softFail: !1,
          kv: u
        }));
      } catch (m) {
        return W("WORKER_PLACEMENT_SAVE_FAILED", Qa(m, f === "default" ? "default" : "write"), De(m?.status, f === "default" ? 409 : 400), k(m?.details) ? m.details : null);
      }
    }
  };
}
var yc = 600 * 1e3, xf = yc;
function st(n = "", e = "manual") {
  const r = String(e || "manual").trim().toLowerCase() === "scheduled" ? "scheduled" : "manual", t = String(n || "").trim().toLowerCase();
  return r !== "manual" ? "smart" : t === "full" ? "full" : "smart";
}
function Of(n = "", e = "manual") {
  return st(n, e) === "full";
}
function Fo(n = "worker.js") {
  const e = String(n || "").trim().split(/[\\/]+/).pop() || "";
  return e && /\.js$/i.test(e) ? e : "";
}
function Sc(n = "") {
  const e = String(n || "");
  return e && (/(^|\n)\s*export\s+/m.test(e) || /(^|\n)\s*import\s+(?:[\w*{]|["'])/m.test(e)) ? "module" : "service-worker";
}
function vf(n = "", e = "worker.js") {
  const r = Fo(e);
  if (r.toLowerCase() !== "worker.js") throw Le("WORKER_UPLOAD_FILE_NAME_INVALID", "Worker 文件名必须是 worker.js", 400, { fileName: r || String(e || "").trim() });
  const t = String(n || ""), a = new TextEncoder().encode(t).length;
  if (!t.trim()) throw Le("WORKER_UPLOAD_EMPTY", "worker.js 不能为空", 400);
  if (a > 3145728) throw Le("WORKER_UPLOAD_TOO_LARGE", `worker.js 体积超过限制（${a} bytes）`, 400, {
    contentLength: a,
    maxBytes: $f
  });
  return {
    fileName: r,
    scriptContent: t,
    contentLength: a,
    syntax: Sc(t)
  };
}
function Ff(n = "", e = "module") {
  const r = Fo(n) || "worker.js";
  return e === "module" ? { main_module: r } : { body_part: r };
}
function Uf(n = "module") {
  return n === "module" ? "application/javascript+module" : "application/javascript";
}
function _c() {
  return [{
    scope: "账号",
    permission: "Workers Scripts Write",
    alternative: "",
    note: "这是账号级 Worker 脚本编辑权限，用于上传 .js 文件并仅更新脚本代码，不修改 bindings 或 settings"
  }];
}
function bc(n = "更新") {
  const e = uc(_c());
  return e.length > 0 ? `Cloudflare Worker 脚本${n}失败：API Token 权限不足。至少需要：${e.join("；")}` : `Cloudflare Worker 脚本${n}失败：API Token 权限不足`;
}
function kf(n = "WORKER_SCRIPT_UPDATE_FORBIDDEN", e = "更新") {
  return Le(n, bc(e), 403, { requiredPermissions: _c() });
}
async function Hf(n, e, r, t, a = {}) {
  const o = String(n || "").trim(), s = jt(e), i = String(r || "").trim(), c = Fo(a?.fileName) || "worker.js", l = String(t || ""), u = Sc(l), d = new FormData();
  d.append("metadata", new Blob([JSON.stringify(Ff(c, u))], { type: "application/json" }), "metadata.json"), d.append("files", new Blob([l], { type: Uf(u) }), c);
  let f = null;
  try {
    f = await Te(`https://api.cloudflare.com/client/v4/accounts/${encodeURIComponent(o)}/workers/scripts/${encodeURIComponent(s)}/content`, i, {
      method: "PUT",
      body: d
    });
  } catch (m) {
    throw Number(m?.status) === 403 ? kf("WORKER_SCRIPT_UPDATE_FORBIDDEN", "更新") : m;
  }
  return {
    syntax: u,
    fileName: c,
    result: k(f?.result) ? f.result : {}
  };
}
function Es(n) {
  const e = String(n?.message || n || "").trim() || "Worker 脚本更新失败", r = Number(n?.status) || Number(/cf_api_http_(\d+)/i.exec(e)?.[1] || 0), t = String(n?.code || "").trim().toUpperCase();
  return t === "WORKER_SCRIPT_UPDATE_FORBIDDEN" && String(n?.message || "").trim() ? n.message : t === "WORKER_PLACEMENT_SCRIPT_DISCOVERY_FORBIDDEN" ? String(n?.message || "").replace("Cloudflare Worker 放置读取失败", "Cloudflare Worker 脚本定位失败").trim() : t === "WORKER_PLACEMENT_SCRIPT_UNRESOLVED" || t === "WORKER_PLACEMENT_HOST_INVALID" || t === "WORKER_PLACEMENT_CONFIG_REQUIRED" ? e : r === 401 ? "Cloudflare Worker 和 HTML 更新失败：API Token 无效" : r === 403 ? bc("更新") : r === 404 ? "Cloudflare Worker 和 HTML 更新失败：未找到目标 Worker 脚本" : e;
}
var $f = 3 * 1024 * 1024;
function Bf(n = {}, e = {}) {
  const { kernel: r } = n, { buildAdminLocalIndexUploadRecord: t } = n;
  return {
    async loadConfig(a, { env: o, kv: s, db: i, ctx: c }) {
      try {
        const l = await fe(o), u = await r.getAdminRevisionsForRead({
          env: o,
          kv: s,
          db: i
        }, {
          ctx: c,
          config: l
        });
        return te({
          config: Et(l),
          revisions: u
        });
      } catch (l) {
        throw Rt(l, "CONFIG_READ_FAILED", "设置读取失败：KV 读取异常", "admin.read.config");
      }
    },
    async previewConfig(a, { env: o, kv: s, ctx: i }) {
      const c = a?.config && typeof a.config == "object" && !Array.isArray(a.config) ? a.config : {};
      if (!s) return W("KV_NOT_CONFIGURED", "请先绑定 ENI_KV / KV Namespace", 503);
      const l = await fe(o), u = await r.prepareRuntimeConfigPersistence(Nn(c, l), {
        env: o,
        kv: s,
        ctx: i
      });
      return te({
        config: Et(u.nextConfig),
        hostPrefixDnsSyncCount: u.dnsPlans.length
      });
    },
    async previewTidyData(a, { env: o, kv: s, db: i }) {
      const c = String(a?.scope || "kv").trim().toLowerCase() === "d1" ? "d1" : "kv";
      try {
        if (c === "d1") {
          if (!i) return W("D1_NOT_CONFIGURED", "请先绑定 D1 / PROXY_LOGS 数据库");
          const d = await r.buildD1TidyPlan(o, {
            db: i,
            kv: s,
            maintenanceMode: st(a?.maintenanceMode, "manual")
          }), f = d.schemaStatus?.schemaReady !== !0, m = f ? "" : await r.createD1TidyPlanToken(o, d);
          return te({
            success: !0,
            scope: "d1",
            planHash: f ? "" : d.planHash,
            planToken: m,
            planExpiresAt: m ? new Date(H() + xf).toISOString() : "",
            requiresSchemaInitialization: f,
            summary: d.summary,
            ...d.preview
          });
        }
        if (!s) return W("KV_NOT_CONFIGURED", "请先绑定 ENI_KV / KV Namespace");
        const l = await r.buildKvTidyPlan(o, {
          kv: s,
          db: i
        }), u = await r.createKvTidyPlanToken(o, l);
        return te({
          success: !0,
          scope: "kv",
          planHash: l.planHash,
          planToken: u,
          planExpiresAt: new Date(H() + yc).toISOString(),
          summary: l.summary,
          ...l.preview
        });
      } catch (l) {
        const u = l?.message || String(l);
        return W(String(l?.code || "TIDY_PREVIEW_FAILED"), u, De(l?.status, 500), {
          scope: c,
          ...k(l?.details) ? l.details : {}
        });
      }
    },
    async updateWorkerAndAdminIndex(a, { env: o, request: s, kv: i, ctx: c }) {
      if (!i) return W("KV_NOT_CONFIGURED", "请先绑定 ENI_KV / KV Namespace", 503);
      let l;
      try {
        l = await fe(o);
      } catch (S) {
        throw Rt(S, "WORKER_HTML_UPDATE_FAILED", "Worker 和 HTML 更新失败：KV 读取异常", "admin.write.worker_html");
      }
      const u = typeof a?.workerScriptContent == "string" ? a.workerScriptContent : "", d = typeof a?.indexHtml == "string" ? a.indexHtml : "";
      if (!u.trim() || !d.trim()) return W("WORKER_HTML_FILES_REQUIRED", "必须同时上传 worker.js 和 index.html，缺一不可", 400, {
        workerFileProvided: !!u.trim(),
        indexFileProvided: !!d.trim()
      });
      let f, m;
      try {
        f = vf(u, a?.workerFileName);
        const S = String(a?.indexFileName || "").trim().split(/[\\/]+/).pop() || "";
        if (S.toLowerCase() !== "index.html") return W("ADMIN_INDEX_UPLOAD_FILE_NAME_INVALID", "HTML 文件名必须是 index.html", 400, { fileName: S || String(a?.indexFileName || "").trim() });
        m = await t(d, S);
      } catch (S) {
        return W(String(S?.code || "WORKER_HTML_VALIDATION_FAILED"), ce(S, "Worker 或 HTML 文件校验失败"), De(S?.status, 400), k(S?.details) ? S.details : null);
      }
      let p, g;
      try {
        p = Oo(l), g = await xo({
          ...p,
          request: s
        });
      } catch (S) {
        return W(String(S?.code || "WORKER_SCRIPT_CONTEXT_FAILED"), Es(S), De(S?.status, 400), k(S?.details) ? S.details : null);
      }
      let h;
      try {
        h = await r.persistAdminIndexUpload(m, {
          env: o,
          kv: i,
          ctx: c
        });
      } catch (S) {
        return W(String(S?.code || "ADMIN_INDEX_UPLOAD_FAILED"), ce(S, "index.html 激活失败"), De(S?.status, 500), k(S?.details) ? S.details : null);
      }
      let y;
      try {
        y = await Hf(p.cfAccountId, g.scriptName, p.cfApiToken, f.scriptContent, { fileName: f.fileName });
      } catch (S) {
        let A = !1, b = !1, R = "", T = "";
        try {
          const L = await r.rollbackAdminIndexUploadActivation(h.previousConfig, h.config, {
            env: o,
            kv: i,
            ctx: c
          });
          A = !0, b = L.skipped === !0, R = String(L.reason || "").trim();
        } catch (L) {
          T = ce(L, "rollback_failed");
        }
        return W(String(S?.code || "WORKER_HTML_UPDATE_FAILED"), Es(S), De(S?.status, 400), {
          ...k(S?.details) ? S.details : {},
          htmlRollbackAttempted: !0,
          htmlRollbackSucceeded: A,
          htmlRollbackSkipped: b,
          htmlRollbackReason: R,
          htmlRollbackError: T
        });
      }
      const _ = y.result;
      return te({
        success: !0,
        scriptName: g.scriptName,
        requestHost: g.requestHost,
        worker: {
          fileName: y.fileName,
          bytes: f.contentLength,
          syntax: y.syntax,
          modifiedOn: String(_?.modified_on || _?.modifiedOn || "").trim(),
          etag: String(_?.etag || "").trim(),
          handlers: Array.isArray(_?.handlers) ? _.handlers : [],
          hasModules: _?.has_modules === !0 || _?.hasModules === !0
        },
        html: {
          fileName: h.record.fileName,
          bytes: h.record.bytes,
          revision: h.record.revision,
          uploadedAt: h.record.uploadedAt
        },
        config: Et(h.config),
        revisions: await r.getAdminRevisions(o, {
          ctx: c,
          config: h.config
        })
      });
    },
    async saveConfig(a, { env: o, ctx: s, kv: i }) {
      if (!i) return W("KV_NOT_CONFIGURED", "请先绑定 ENI_KV / KV Namespace", 503);
      const c = await fe(o), l = a.config ? await r.persistRuntimeConfig(Nn(a.config, c), {
        env: o,
        kv: i,
        ctx: s,
        expectedConfigRevision: a?.expectedConfigRevision,
        mutationId: a?.mutationId,
        forceKvCommit: !0
      }) : c, u = await r.getAdminRevisions(o, {
        ctx: s,
        config: l
      });
      return te({
        success: !0,
        committed: !0,
        config: Et(l),
        revision: String(u.configRevision || ""),
        revisions: u
      });
    },
    async uploadAdminIndex(a, { env: o, ctx: s, kv: i }) {
      if (!i) return W("KV_NOT_CONFIGURED", "请先绑定 ENI_KV / KV Namespace", 503);
      try {
        const c = String(a?.fileName || "").trim().split(/[\\/]+/).pop() || "";
        if (c.toLowerCase() !== "index.html") return W("ADMIN_INDEX_UPLOAD_FILE_NAME_INVALID", "HTML 文件名必须是 index.html", 400, { fileName: c || String(a?.fileName || "").trim() });
        const l = await t(a?.indexHtml, c), u = await r.persistAdminIndexUpload(l, {
          env: o,
          kv: i,
          ctx: s
        });
        return te({
          success: !0,
          source: "local_upload",
          revision: u.record.revision,
          assetRevision: u.record.assetRevision,
          sourceUrl: u.record.sourceUrl,
          fileName: u.record.fileName,
          bytes: u.record.bytes,
          uploadedAt: u.record.uploadedAt,
          config: Et(u.config),
          revisions: await r.getAdminRevisions(o, {
            ctx: s,
            config: u.config
          })
        });
      } catch (c) {
        return W(String(c?.code || "ADMIN_INDEX_UPLOAD_FAILED"), ce(c, "本地 index.html 上传失败"), De(c?.status, 500), k(c?.details) ? c.details : null);
      }
    },
    async exportConfig(a, { env: o, ctx: s, request: i }) {
      const c = r.getKV(o), l = a?.includeSecrets === !0;
      if (l && String(i.headers.get("X-Admin-Confirm") || "").trim() !== "exportConfig") return W("CONFIRMATION_REQUIRED", "Exporting secrets requires explicit confirmation", 428);
      const u = await fe(o), d = dt(o, u), f = c && d.localUploadRevision ? await r.getAdminIndexUploadRecord(c, d.localUploadRevision) : null, m = c ? (await r.loadAllNodeEntitiesFromKvStrict(c, { ctx: s })).filter(Boolean) : [], p = {
        version: F.Defaults.Version,
        exportTime: (/* @__PURE__ */ new Date()).toISOString(),
        nodes: m,
        config: l ? u : ds(u),
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
      return g > 12517376 ? W("FULL_BACKUP_TOO_LARGE", "完整备份超过安全回导上限，请先分别导出节点与设置并精简超大节点字段", 413, {
        importRequestBytes: g,
        maxBytes: Au,
        nodeCount: p.nodes.length,
        adminIndexBytes: Number(f?.bytes) || 0
      }) : te(p);
    },
    async exportSettings(a, { env: o, request: s }) {
      const i = a?.includeSecrets === !0;
      if (i && String(s.headers.get("X-Admin-Confirm") || "").trim() !== "exportSettings") return W("CONFIRMATION_REQUIRED", "导出完整密钥需要显式确认", 428);
      const c = await fe(o);
      return te({
        version: F.Defaults.Version,
        type: "settings-only",
        exportTime: (/* @__PURE__ */ new Date()).toISOString(),
        config: i ? c : ds(c),
        secretsRedacted: i !== !0,
        containsSecrets: i === !0
      });
    },
    async importSettings(a, { env: o, ctx: s, kv: i }) {
      if (!i) return W("KV_NOT_CONFIGURED", "请先绑定 ENI_KV / KV Namespace", 503);
      const c = a?.config && typeof a.config == "object" && !Array.isArray(a.config) ? a.config : a?.settings && typeof a.settings == "object" && !Array.isArray(a.settings) ? a.settings : null;
      if (!c) return W("INVALID_SETTINGS_BACKUP", "设置备份文件无效，缺少 config/settings 对象");
      const l = await fe(o), u = await r.persistRuntimeConfig(Nn(c, l), {
        env: o,
        kv: i,
        ctx: s,
        forceKvCommit: !0
      }), d = await r.getAdminRevisions(o, {
        ctx: s,
        config: u
      });
      return te({
        success: !0,
        config: Et(u),
        revisions: d,
        generatedAt: (/* @__PURE__ */ new Date()).toISOString()
      });
    }
  };
}
function Kf(n = {}, e = {}) {
  const { kernel: r } = n, { CacheManager: t, Logger: a } = n;
  return {
    async list(o, { env: s, ctx: i, kv: c, db: l }) {
      try {
        const u = await t.getNodesListStrict(s, i);
        return te({
          nodes: u,
          revisions: await r.getAdminRevisionsForRead({
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
      const c = await fe(s);
      return te(await r.buildDashboardD1WriteHotspotPayload(s, {
        config: c,
        nowMs: H()
      }));
    },
    async getDashboardCoreStats(o, { env: s, ctx: i, kv: c, db: l }) {
      const u = await fe(s);
      return te(await r.buildDashboardStatsPayload(s, {
        ctx: i,
        kv: c,
        db: l,
        config: u,
        skipD1WriteHotspot: !0
      }));
    },
    async getDashboardCachedSnapshot(o, { env: s, db: i }) {
      const c = await fe(s);
      return te({ snapshot: await r.getDashboardCachedSnapshotPayload(s, {
        db: i,
        config: c
      }) });
    },
    async getNode(o, { env: s, ctx: i, kv: c, db: l }) {
      const u = String(o?.name || "").trim();
      if (!u) return W("NODE_NAME_REQUIRED", "请提供节点路径");
      const d = await r.getNodeForRead(u, s);
      if (!d) return W("NODE_NOT_FOUND", "节点不存在", 404);
      const f = {
        name: u.toLowerCase(),
        ...d
      }, m = Om(u, d);
      return te({
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
function Yn(n = [], e = {}) {
  const r = e.renameMap instanceof Map ? e.renameMap : new Map(Object.entries(e.renameMap && typeof e.renameMap == "object" ? e.renameMap : {})), t = /* @__PURE__ */ new Map();
  for (const [l, u] of r.entries()) {
    const d = String(l || "").trim().toLowerCase(), f = String(u || "").trim();
    !d || !f || t.set(d, f);
  }
  const a = new Set(mt(e.removedNames || []).map((l) => String(l || "").trim().toLowerCase()).filter(Boolean)), o = e.allowedNames === void 0 ? null : mt(e.allowedNames || []).map((l) => [String(l || "").trim().toLowerCase(), String(l || "").trim()]).filter(([l, u]) => l && u), s = o ? new Map(o) : null, i = [], c = /* @__PURE__ */ new Set();
  for (const l of mt(n)) {
    const u = String(l || "").trim().toLowerCase();
    if (!u || a.has(u)) continue;
    const d = t.get(u) || String(l || "").trim(), f = d.toLowerCase();
    !f || a.has(f) || s && !s.has(f) || c.has(f) || (c.add(f), i.push(s?.get(f) || d));
  }
  return i;
}
function zf(n, e = null, r = "") {
  const t = String(n?.proxyMode || n?.mode || "").trim().toLowerCase();
  if ([
    "direct",
    "source-direct",
    "origin-direct",
    "node-direct"
  ].includes(t) || n?.direct === !0 || n?.sourceDirect === !0 || n?.directSource === !0 || n?.direct2xx === !0) return !0;
  const a = `${Kr(n?.tags, n?.tag).join(" ")} ${n?.remark || ""}`;
  return /(?:^|[\s\[(【])(?:直连|source-direct|origin-direct|node-direct)(?:$|[\s\])】])/i.test(a);
}
function Wf(n, e = null, r = "") {
  const t = Br(n);
  return t === "direct" ? !0 : t === "proxy" ? !1 : zf(n, e, r);
}
function ba(n, e) {
  if (!n) return null;
  try {
    return new URL(n, e instanceof URL ? e : String(e || ""));
  } catch {
    return null;
  }
}
function Gf(n, e = "GET") {
  const r = String(e || "GET").toUpperCase();
  return n === 303 && r !== "GET" && r !== "HEAD" || (n === 301 || n === 302) && r === "POST" ? "GET" : r;
}
function jf(n = {}, e = {}) {
  const r = Di(ua(n, "protocolStrategy") ? n?.protocolStrategy : Do(n)), t = Number.isFinite(Number(e.hourUtc8)) ? Number(e.hourUtc8) : ((/* @__PURE__ */ new Date()).getUTCHours() + 8) % 24, a = t >= 20 && t < 24;
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
function Vf(n = {}, e = {}) {
  const { kernel: r } = n, { CacheManager: t, buildAdminLocalIndexUploadRecord: a } = n;
  return {
    async saveOrImport(o, { action: s, ctx: i, kv: c, env: l }) {
      const u = s === "save" ? [o] : o.nodes, d = rs(u, l);
      if (d) return W("NODE_NAME_RESERVED", "节点路径与系统保留路由冲突，请更换后重试", 409, d);
      const f = as(u, l);
      return f ? W(f.code, f.message, 400, f) : await Qt(c)(async () => {
        const m = [], p = /* @__PURE__ */ new Map(), g = [], h = Ve(l), y = await fe(l);
        for (const b of u) {
          if (!b.name || !b.target && !(Array.isArray(b.lines) && b.lines.length)) continue;
          const R = String(b.name).toLowerCase(), T = b.originalName ? String(b.originalName).toLowerCase() : null, L = !!(T && T !== R);
          if (s === "save" && (!T || T !== R) && await c.get(`${r.PREFIX}${R}`, { type: "json" }))
            return W("NODE_NAME_CONFLICT", "节点路径已存在，请更换后重试", 409, { name: R });
          let D = {};
          L ? D = await c.get(`${r.PREFIX}${T}`, { type: "json" }) || {} : D = await c.get(`${r.PREFIX}${R}`, { type: "json" }) || {};
          const E = r.buildPreparedNodeMutation(b, D, {
            previousName: T || R,
            nextName: R
          });
          if (!E) continue;
          const w = tt(R, E.nextNode);
          if (w) return W("NODE_RESOURCE_LIMIT_EXCEEDED", "节点配置超过 Worker 资源限制", 400, w);
          E.dnsPlan = r.buildHostPrefixDnsSyncPlan(E.previousName, E.previousNode, E.nextName, E.nextNode, h, {
            config: y,
            forceUpsert: !0
          }), g.push(E), E.isRename && p.set(E.previousName, E.nextName), m.push(R);
        }
        if (s === "save" && m.length === 0) return W("INVALID_TARGET", "目标源站必须是有效的 http/https URL");
        Cn(g, y, l);
        const _ = m.length > 0 || p.size > 0;
        let S = !1, A = null;
        try {
          await r.applyPreparedNodeMutations(g, {
            env: l,
            kv: c,
            ctx: i,
            requestHost: h
          }), S = g.some((E) => E?.nodeChanged === !0);
          const b = _ ? await r.rebuildNodeIndexesFromKv(c, {
            ctx: i,
            syncLegacyIndex: s === "import"
          }) : null, R = Array.isArray(b?.summaries) ? b.summaries : await t.getNodesList(l, i), T = new Map((Array.isArray(R) ? R : []).map((E) => [String(E?.name || "").toLowerCase().trim(), E])), L = m.map((E) => T.get(String(E || "").toLowerCase().trim()) || null).filter(Boolean), D = Array.isArray(b?.index) ? b.index : Array.isArray(R) ? R.map((E) => E?.name) : [];
          if ((p.size > 0 || s === "save" && L.length === 1) && (A = await r.captureRuntimeConfigRollbackState(l, c), p.size > 0 && await r.commitSourceDirectNodesConfigWithinMutation(l, c, i, {
            renameMap: p,
            allowedNames: D,
            source: s === "import" ? "node_import" : "node_save",
            note: [...p.entries()].map(([E, w]) => `${E}->${w}`).join(",")
          }), s === "save" && L.length === 1)) {
            const E = L[0];
            await r.commitSingleNodeMainVideoStreamShortcutShadowWithinMutation(l, c, i, {
              originalName: o.originalName,
              nodeName: E?.name,
              mode: E?.mainVideoStreamMode,
              source: "node_save",
              note: String(E?.name || "").trim()
            });
          }
          return te({
            success: !0,
            node: s === "save" ? L[0] : void 0,
            nodes: R,
            importedNodes: s === "import" ? L : void 0,
            revisions: await r.getAdminRevisions(l, {
              ctx: i,
              nodes: R
            })
          });
        } catch (b) {
          let R = "", T = "";
          if (A) try {
            await r.restoreCapturedRuntimeConfigState(A, {
              env: l,
              kv: c,
              ctx: i
            });
          } catch (L) {
            R = ce(L, "config_restore_failed");
          }
          if (S) try {
            await r.rollbackPreparedNodeMutations(g, {
              env: l,
              kv: c,
              ctx: i,
              requestHost: h,
              rebuildIndexes: !0
            });
          } catch (L) {
            T = ce(L, "rollback_failed");
          }
          throw b && typeof b == "object" && (String(b.code || "").trim() || (b.code = "NODE_MUTATION_FAILED"), b.status = De(b.status, 500), (A || S) && (b.details = {
            ...k(b.details) ? b.details : {},
            rollbackAttempted: !0,
            configRollbackError: R,
            nodeRollbackError: T
          })), b;
        }
      });
    },
    async saveMainVideoStreamPolicyShortcuts(o, { env: s, ctx: i, kv: c }) {
      return c ? await Qt(c)(async () => {
        const l = await r.loadAllNodeEntitiesFromKvStrict(c, { ctx: i }), u = Array.isArray(l) ? l.map((R) => R?.name) : [], d = Yn(o?.selectedNodeNames || [], { allowedNames: u }), f = new Set(d.map((R) => String(R || "").trim().toLowerCase()).filter(Boolean));
        let m = 0;
        const p = Ve(s), g = await fe(s), h = [];
        for (const R of Array.isArray(l) ? l : []) {
          if (!k(R)) continue;
          const T = String(R.name || "").trim().toLowerCase();
          if (!T) continue;
          const L = Br(R);
          let D = L;
          if (f.has(T) ? D = "direct" : L === "direct" && (D = "inherit"), D !== L) {
            const { name: E, ...w } = R, N = {
              name: T,
              ...w,
              mainVideoStreamMode: D
            }, O = r.buildPreparedNodeMutation(N, R, {
              previousName: T,
              nextName: T
            });
            if (!O) continue;
            O.nextNode = r.normalizeNode(T, O.nextNode || N, { dropLegacyDirectRouting: !0 }).data, O.dnsPlan = r.buildHostPrefixDnsSyncPlan(O.previousName, O.previousNode, O.nextName, O.nextNode, p, {
              config: g,
              forceUpsert: !0
            }), h.push(O), m += 1;
          }
        }
        Cn(h, g, s);
        const y = ee(g.sourceDirectNodes || []) !== ee(d), _ = m > 0 || y ? await r.captureRuntimeConfigRollbackState(s, c) : null;
        let S = null, A = g;
        try {
          m > 0 && (await r.applyPreparedNodeMutations(h, {
            env: s,
            kv: c,
            ctx: i,
            requestHost: p
          }), S = await r.rebuildNodeIndexesFromKv(c, { ctx: i })), y && (A = await r.commitRuntimeConfig({
            ...g,
            sourceDirectNodes: d
          }, {
            env: s,
            kv: c,
            ctx: i
          }));
        } catch (R) {
          let T = "", L = "";
          if (_) try {
            await r.restoreCapturedRuntimeConfigState(_, {
              env: s,
              kv: c,
              ctx: i
            });
          } catch (D) {
            T = ce(D, "config_restore_failed");
          }
          if (m > 0) try {
            await r.rollbackPreparedNodeMutations(h, {
              env: s,
              kv: c,
              ctx: i,
              requestHost: p,
              rebuildIndexes: !0
            });
          } catch (D) {
            L = ce(D, "rollback_failed");
          }
          throw R && typeof R == "object" && (String(R.code || "").trim() || (R.code = "NODE_MUTATION_FAILED"), R.status = De(R.status, 500), R.details = {
            ...k(R.details) ? R.details : {},
            rollbackAttempted: !0,
            configRollbackError: T,
            nodeRollbackError: L
          }), R;
        }
        const b = Array.isArray(S?.summaries) ? S.summaries : await t.getNodesList(s, i);
        return te({
          success: !0,
          selectedNodeNames: d,
          updatedNodeCount: m,
          config: Et(A),
          nodes: b,
          revisions: await r.getAdminRevisions(s, {
            ctx: i,
            config: A,
            nodes: b
          })
        });
      }) : W("KV_UNAVAILABLE", "KV 未绑定或不可用", 500);
    },
    async importFull(o, { env: s, ctx: i, kv: c }) {
      const l = rs(o?.nodes, s);
      if (l) return W("NODE_NAME_RESERVED", "节点路径与系统保留路由冲突，请更换后重试", 409, l);
      const u = as(o?.nodes, s);
      if (u) return W(u.code, u.message, 400, u);
      const d = et(o?.config?.indexUrl || "");
      let f = null;
      if (k(o?.adminIndexUpload)) {
        const m = String(o.adminIndexUpload.fileName || "").trim().split(/[\\/]+/).pop() || "";
        if (m.toLowerCase() !== "index.html") return W("ADMIN_INDEX_BACKUP_INVALID", "完整备份中的 HTML 文件名必须是 index.html", 400);
        try {
          f = await a(o.adminIndexUpload.html, m);
        } catch (p) {
          return W(String(p?.code || "ADMIN_INDEX_BACKUP_INVALID"), ce(p, "完整备份中的 index.html 无效"), De(p?.status, 400), k(p?.details) ? p.details : null);
        }
        if (d && f.revision !== d) return W("ADMIN_INDEX_BACKUP_REVISION_MISMATCH", "完整备份中的 index.html 与配置版本不一致", 400, {
          expectedRevision: d,
          actualRevision: f.revision
        });
      }
      return d && !f && !await r.getAdminIndexUploadRecord(c, d) ? W("ADMIN_INDEX_BACKUP_MISSING", "完整备份缺少当前配置引用的 index.html", 400, { revision: d }) : await Qt(c)(async () => {
        const m = await fe(s), p = o.config ? await r.captureRuntimeConfigRollbackState(s, c) : null, g = o.config ? Yi(o.config, m) : null, h = g ? oe(g) : m, y = Ve(s), _ = f ? r.buildAdminIndexUploadKey(f.revision) : "", S = _ ? await c.get(_) : null, A = o.config ? await c.get(r.ADMIN_ACTIVE_INDEX_KEY) : null, b = d ? f || await r.getAdminIndexUploadRecord(c, d) : null, R = [];
        if (Array.isArray(o.nodes)) for (const w of o.nodes) {
          if (!w.name || !w.target && !(Array.isArray(w.lines) && w.lines.length)) continue;
          const N = String(w.name).toLowerCase(), O = await c.get(`${r.PREFIX}${N}`, { type: "json" }) || {}, C = r.buildPreparedNodeMutation(w, O, {
            previousName: N,
            nextName: N
          });
          C && (C.dnsPlan = r.buildHostPrefixDnsSyncPlan(C.previousName, C.previousNode, C.nextName, C.nextNode, y, {
            previousConfig: m,
            nextConfig: h,
            forceUpsert: !0
          }), R.push(C));
        }
        Cn(R, h, s);
        let T = null, L = !1;
        try {
          _ && await c.put(_, JSON.stringify(f)), g && (b ? await c.put(r.ADMIN_ACTIVE_INDEX_KEY, JSON.stringify(b)) : await c.delete(r.ADMIN_ACTIVE_INDEX_KEY)), g && (T = await r.commitRuntimeConfig(g, {
            env: s,
            kv: c,
            ctx: i
          })), R.length > 0 && (await r.applyPreparedNodeMutations(R, {
            env: s,
            kv: c,
            ctx: i,
            requestHost: y
          }), L = !0, await r.rebuildNodeIndexesFromKv(c, {
            ctx: i,
            syncLegacyIndex: !0
          }));
        } catch (w) {
          let N = "", O = "", C = "";
          if (L) try {
            await r.rollbackPreparedNodeMutations(R, {
              env: s,
              kv: c,
              ctx: i,
              requestHost: y,
              rebuildIndexes: !0
            });
          } catch (v) {
            O = ce(v, "rollback_failed");
          }
          if (p) try {
            await r.restoreCapturedRuntimeConfigAndDnsState(p, {
              env: s,
              kv: c,
              ctx: i
            });
          } catch (v) {
            N = ce(v, "config_restore_failed");
          }
          if (_) try {
            S === null ? await c.delete(_) : await c.put(_, S);
          } catch (v) {
            C = ce(v, "admin_index_restore_failed");
          }
          if (o.config) try {
            A === null ? await c.delete(r.ADMIN_ACTIVE_INDEX_KEY) : await c.put(r.ADMIN_ACTIVE_INDEX_KEY, A);
          } catch (v) {
            C = [C, ce(v, "active_admin_index_restore_failed")].filter(Boolean).join("; ");
          }
          throw w && typeof w == "object" && (String(w.code || "").trim() || (w.code = "IMPORT_FULL_FAILED"), w.status = De(w.status, 500), w.details = {
            ...k(w.details) ? w.details : {},
            rollbackAttempted: !!p || L || !!_,
            configRollbackError: N,
            nodeRollbackError: O,
            adminIndexRollbackError: C
          }), w;
        }
        const D = T || await Ce(s), E = await t.getNodesList(s, i);
        return te({
          success: !0,
          config: D,
          nodes: E,
          adminIndexUpload: f ? {
            revision: f.revision,
            fileName: f.fileName,
            bytes: f.bytes
          } : null,
          revisions: await r.getAdminRevisions(s, {
            ctx: i,
            config: D,
            nodes: E
          })
        });
      });
    },
    async delete(o, { ctx: s, kv: i, env: c }) {
      return await Qt(i)(async () => {
        if (o.name) {
          const l = String(o.name).toLowerCase(), u = await fe(c), d = await i.get(`${r.PREFIX}${l}`, { type: "json" }) || null, f = d ? r.normalizeNode(l, d || {}).data : null, m = {
            previousName: l,
            previousNode: f,
            nextName: l,
            nextNode: null,
            isRename: !1,
            nodeChanged: !!f,
            isSemanticNoop: !f,
            dnsPlan: r.buildHostPrefixDnsSyncPlan(l, f, "", null, Ve(c), { config: u })
          }, p = Ve(c);
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
            let _ = "", S = "";
            if (h) try {
              await r.restoreCapturedRuntimeConfigState(h, {
                env: c,
                kv: i,
                ctx: s
              });
            } catch (A) {
              _ = ce(A, "config_restore_failed");
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
              S = ce(A, "rollback_failed");
            }
            throw y && typeof y == "object" && (String(y.code || "").trim() || (y.code = "NODE_DELETE_FAILED"), y.status = De(y.status, 500), (h || g) && (y.details = {
              ...k(y.details) ? y.details : {},
              rollbackAttempted: !0,
              configRollbackError: _,
              nodeRollbackError: S
            })), y;
          }
        }
        return te({
          success: !0,
          revisions: await r.getAdminRevisions(c, { ctx: s })
        });
      });
    },
    async purgeCache(o, { kv: s, request: i }) {
      if (i.headers.get("X-Admin-Confirm") !== "purgeCache") return W("CONFIRMATION_REQUIRED", "敏感操作需要显式确认头", 428);
      const c = await s.get(r.CONFIG_KEY, { type: "json" }) || {};
      if (!c.cfZoneId || !c.cfApiToken) return W("CF_API_ERROR", "请在账号设置中完善 Zone ID 和 API 令牌");
      try {
        return (await We(`https://api.cloudflare.com/client/v4/zones/${encodeURIComponent(String(c.cfZoneId).trim())}/purge_cache`, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${c.cfApiToken}`,
            "Content-Type": "application/json"
          },
          body: JSON.stringify({ purge_everything: !0 })
        })).ok ? te({ success: !0 }) : W("PURGE_FAILED", "清理失败，请检查密钥权限");
      } catch (l) {
        return W("PURGE_ERROR", l.message);
      }
    }
  };
}
function qf(n = {}, e = {}) {
  const { kernel: r } = n;
  return {
    async tidyKvData(t, { env: a, ctx: o, kv: s, db: i }) {
      if (!s) return W("KV_NOT_CONFIGURED", "请先绑定 ENI_KV / KV Namespace");
      try {
        const c = await r.tidyKvData(a, {
          kv: s,
          db: i,
          ctx: o,
          planToken: String(t?.planToken || "").trim()
        }), l = (/* @__PURE__ */ new Date()).toISOString();
        return await he(r.patchOpsStatus(a, { scheduled: { kvTidy: {
          status: "success",
          lastSuccessAt: l,
          lastTriggeredBy: "manual",
          summary: c.summary
        } } }), "manual.tidy_kv.patch_success_status", null, null), te({
          success: !0,
          ...c
        });
      } catch (c) {
        const l = c?.message || String(c);
        return await he(r.patchOpsStatus(a, { scheduled: { kvTidy: {
          status: "failed",
          lastErrorAt: (/* @__PURE__ */ new Date()).toISOString(),
          lastError: l,
          lastTriggeredBy: "manual"
        } } }), "manual.tidy_kv.patch_failed_status", { message: l }, null), W(String(c?.code || "KV_TIDY_FAILED"), l, De(c?.status, 500), k(c?.details) ? c.details : null);
      }
    },
    async tidyD1Data(t, { env: a, ctx: o, kv: s, db: i }) {
      if (!i) return W("D1_NOT_CONFIGURED", "请先绑定 D1 / PROXY_LOGS 数据库");
      try {
        const c = st(t?.maintenanceMode, "manual"), l = await r.tidyD1Data(a, {
          db: i,
          kv: s,
          ctx: o,
          maintenanceMode: c,
          planToken: String(t?.planToken || "").trim()
        }), u = (/* @__PURE__ */ new Date()).toISOString(), d = r.buildD1TidyStatusPayload(l.summary, {
          mode: "manual",
          maintenanceMode: c,
          triggeredBy: "manual",
          timestamp: u
        });
        return await he(r.patchOpsStatus({
          kv: s,
          db: i
        }, { scheduled: { ...d } }), "manual.tidy_d1.patch_success_status", null, null), te({
          success: !0,
          ...l
        });
      } catch (c) {
        const l = c?.message || String(c), u = r.buildD1TidyStatusPayload({
          status: "failed",
          lastError: l,
          maintenanceMode: st(t?.maintenanceMode, "manual")
        }, {
          mode: "manual",
          maintenanceMode: st(t?.maintenanceMode, "manual"),
          triggeredBy: "manual",
          timestamp: (/* @__PURE__ */ new Date()).toISOString()
        });
        return await he(r.patchOpsStatus({
          kv: s,
          db: i
        }, { scheduled: { ...u } }), "manual.tidy_d1.patch_failed_status", { message: l }, null), W("D1_TIDY_FAILED", l, 500);
      }
    }
  };
}
function Xf(n = "") {
  return String(n || "").trim().toLowerCase() === "a" ? "a" : "cname";
}
function Kt(n = {}) {
  return {
    id: String(n?.id || "").trim(),
    type: String(n?.type || "").trim().toUpperCase(),
    name: re(n?.name),
    content: String(n?.content || "").trim(),
    ttl: Number(n?.ttl) || 1,
    proxied: n?.proxied === !0,
    comment: typeof n?.comment == "string" ? n.comment : void 0,
    tags: Array.isArray(n?.tags) ? n.tags.map((e) => String(e)) : void 0
  };
}
async function Ur(n, e, r = {}) {
  const t = [];
  let a = 1, o = 1;
  const s = 100, i = re(r?.nameExact || "");
  do {
    const c = new URL(`https://api.cloudflare.com/client/v4/zones/${encodeURIComponent(n)}/dns_records`);
    c.searchParams.set("page", String(a)), c.searchParams.set("per_page", String(s)), i && c.searchParams.set("name.exact", i);
    const l = await Te(c.toString(), e);
    Array.isArray(l?.result) && t.push(...l.result.map((u) => Kt(u)).filter((u) => u.id && u.name)), o = Number(l?.result_info?.total_pages || l?.result_info?.totalPages || 1), a += 1;
  } while (a <= o && a <= 20);
  return t;
}
function la(n = {}, e = {}) {
  const r = {
    type: String(e.type || n?.type || "A").trim().toUpperCase(),
    name: re(e.host || n?.name),
    content: String(e.content || "").trim(),
    ttl: Number(n?.ttl) || 1,
    proxied: n?.proxied === !0
  };
  return typeof n?.comment == "string" && (r.comment = n.comment), Array.isArray(n?.tags) && (r.tags = n.tags.map((t) => String(t))), r;
}
function Yf(n = "", e = "") {
  const r = String(n || "").trim().toUpperCase(), t = String(e || "").trim();
  return t ? r === "A" ? t : t.toLowerCase() : "";
}
function kr(n = "", e = "") {
  const r = String(n || "").trim().toUpperCase(), t = Yf(r, e);
  return !r || !t ? "" : `${r}|${t}`;
}
function Jf(n = []) {
  const e = [], r = /* @__PURE__ */ new Set();
  let t = 0;
  for (const a of Array.isArray(n) ? n : []) {
    const o = String(a?.type || "").trim().toUpperCase(), s = String(a?.content || "").trim(), i = kr(o, s);
    if (i) {
      if (r.has(i)) {
        t += 1;
        continue;
      }
      r.add(i), e.push({
        type: o,
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
function Rs(n = "", e = 0) {
  return {
    type: String(n || "").trim().toUpperCase(),
    desiredCount: Math.max(0, Number(e) || 0),
    identicalCount: 0,
    updatedCount: 0,
    createdCount: 0,
    deletedCount: 0
  };
}
function Qf(n = "a", e = {}, r = {}) {
  const t = {};
  let a = 0, o = 0, s = 0, i = 0, c = 0;
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
    }, a += t[u].desiredCount, o += t[u].identicalCount, s += t[u].updatedCount, i += t[u].createdCount, c += t[u].deletedCount);
  }
  const l = s + i + c;
  return {
    mode: String(n || "a").trim().toLowerCase(),
    desiredCount: a,
    identicalCount: o,
    updatedCount: s,
    createdCount: i,
    deletedCount: c,
    changedCount: l,
    dedupedDesiredCount: Math.max(0, Number(r?.dedupedDesiredCount) || 0),
    familySummaries: t,
    unchangedOnly: l === 0 && o > 0
  };
}
async function Zf(n = {}, e) {
  const r = String(n?.cfZoneId || "").trim(), t = String(n?.cfApiToken || "").trim();
  if (!r || !t) throw new Error("cf_api_missing");
  const a = re(new URL(e.url).hostname), o = await cc(r, t, {
    scope: "dns.resolve_admin_context.zone_lookup",
    context: { requestHost: a }
  }), s = await Ur(r, t), i = String(o?.name || "").trim() || "", c = i || re(s[0]?.name || "");
  let l = a;
  fa(l, c || i) || (l = re(await Sf({
    cfAccountId: n.cfAccountId,
    cfZoneId: r,
    cfApiToken: t,
    zoneNameFallback: c || i || a
  })));
  const u = s.filter((f) => gr(f.type)), d = l ? u.filter((f) => re(f.name) === l) : u;
  return {
    cfZoneId: r,
    cfApiToken: t,
    zone: o,
    zoneName: i,
    currentHost: l,
    requestHost: a,
    totalRecords: s.length,
    editableRecords: u,
    currentHostRecords: d
  };
}
function em(n = {}) {
  const e = oe(n), r = String(e.cfZoneId || "").trim(), t = String(e.cfApiToken || "").trim();
  if (!r || !t) {
    const a = /* @__PURE__ */ new Error("请在账号设置中完善 Zone ID 和 API 令牌");
    throw a.code = "CF_API_ERROR", a.status = 400, a;
  }
  return {
    cfZoneId: r,
    cfApiToken: t
  };
}
function tm(n = []) {
  return {
    A: Rs("A", n.filter((e) => e.type === "A").length),
    AAAA: Rs("AAAA", n.filter((e) => e.type === "AAAA").length)
  };
}
function rm(n = "", e = [], r = []) {
  const t = /* @__PURE__ */ new Map(), a = [];
  let o = 0;
  for (const i of e) {
    const c = kr(n, i?.content);
    c && t.set(c, (t.get(c) || 0) + 1);
  }
  for (const i of r) {
    const c = kr(n, i?.content), l = t.get(c) || 0;
    if (l > 0) {
      o += 1, t.set(c, l - 1);
      continue;
    }
    a.push(i);
  }
  const s = [];
  for (const i of e) {
    const c = kr(n, i?.content), l = t.get(c) || 0;
    l <= 0 || (s.push(i), t.set(c, l - 1));
  }
  return {
    identicalCount: o,
    reusableCurrentRecords: a,
    pendingDesiredRecords: s
  };
}
function Ec(n = "", e = "", r = "", t = "", a = {}) {
  const o = async () => (await Ur(n, e, { nameExact: r })).filter((s) => re(s.name) === r && gr(s.type));
  return {
    async deleteRecord(s) {
      s?.id && await Te(`${t}/${encodeURIComponent(s.id)}`, e, { method: "DELETE" });
    },
    async updateRecord(s, i, c) {
      const l = la(s, {
        host: r,
        type: i,
        content: c
      });
      return Kt((await Te(`${t}/${encodeURIComponent(s.id)}`, e, {
        method: "PUT",
        body: JSON.stringify(l)
      }))?.result || {
        id: s.id,
        ...l
      });
    },
    async createRecord(s, i, c = a) {
      const l = la(c, {
        host: r,
        type: s,
        content: i
      });
      try {
        return {
          record: Kt((await Te(t, e, {
            method: "POST",
            body: JSON.stringify(l)
          }))?.result || l),
          reusedExisting: !1
        };
      } catch (u) {
        if (String(u?.message || u || "").includes("81058")) {
          const d = (await o()).find((f) => re(f?.name) === r && String(f?.type || "").toUpperCase() === String(s || "").trim().toUpperCase() && kr(f?.type, f?.content) === kr(s, i));
          if (d) return {
            record: Kt(d),
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
async function Ts(n = "", e = [], r = [], t = {}, a = {}) {
  const o = rm(n, e, r);
  t.identicalCount += o.identicalCount;
  const { reusableCurrentRecords: s, pendingDesiredRecords: i } = o;
  for (let c = 0; c < i.length; c += 1) {
    const l = i[c], u = s[c];
    if (u) {
      await a.updateRecord(u, n, l.content), t.updatedCount += 1;
      continue;
    }
    (await a.createRecord(n, l.content, r[0]))?.reusedExisting === !0 ? t.identicalCount += 1 : t.createdCount += 1;
  }
  for (let c = i.length; c < s.length; c += 1)
    await a.deleteRecord(s[c]), t.deletedCount += 1;
}
async function am({ env: n, kv: e, dnsHistoryRepository: r, config: t, host: a, mode: o = "a", desiredRecords: s = [], requestHost: i = "", skipHistory: c = !1, includeAllRecords: l = !0, includeHistory: u = !0 }) {
  const { cfZoneId: d, cfApiToken: f } = em(t || await Ce(n));
  let m = !1, p = !1, g = "";
  const h = Jf(s), y = h.records, _ = tm(y);
  try {
    const S = await Po(d, f, { scope: "dns.persist_records.zone_lookup" }), A = String(S?.name || "").trim() || "";
    if (A && !fa(a, A)) {
      const P = /* @__PURE__ */ new Error("当前站点不在该 Zone 下");
      throw P.code = "INVALID_HOST", P.status = 400, P;
    }
    const b = (await Ur(d, f, { nameExact: a })).filter((P) => re(P.name) === a && gr(P.type)), R = {
      baseRecord: b[0] || {
        name: a,
        ttl: 1,
        proxied: !1
      },
      zoneRecordsUrl: `https://api.cloudflare.com/client/v4/zones/${encodeURIComponent(d)}/dns_records`
    }, T = Ec(d, f, a, R.zoneRecordsUrl, R.baseRecord), L = b.map((P) => Kt(P));
    let D = !1;
    const E = {
      ...T,
      async deleteRecord(P) {
        return D = !0, await T.deleteRecord(P);
      },
      async updateRecord(P, I, M) {
        return D = !0, await T.updateRecord(P, I, M);
      },
      async createRecord(P, I, M) {
        return D = !0, await T.createRecord(P, I, M);
      }
    };
    let w = [], N = null;
    try {
      if (o === "cname") {
        const P = b.filter((K) => K.type === "CNAME"), I = b.filter((K) => K.type === "A" || K.type === "AAAA");
        for (const K of I) await E.deleteRecord(K);
        for (let K = 1; K < P.length; K += 1) await E.deleteRecord(P[K]);
        const M = P[0] || null, x = y[0], U = Number(x?.ttl) || 1, G = x?.proxied === !0;
        if (M) {
          const K = String(M.content || "").trim() !== x.content, $ = Number(M.ttl) !== U, V = M.proxied === !0 !== G;
          (K || $ || V) && await E.updateRecord({
            ...M,
            ttl: U,
            proxied: G
          }, "CNAME", x.content);
        } else await E.createRecord("CNAME", x.content, {
          ...R.baseRecord,
          ttl: U,
          proxied: G
        });
        w = await Ur(d, f, { nameExact: a }), c || (N = await r.recordDnsHostHistory(e, d, a, {
          name: a,
          type: "CNAME",
          content: x.content,
          actor: "admin",
          source: "ui",
          requestHost: i,
          savedAt: (/* @__PURE__ */ new Date()).toISOString()
        }));
      } else {
        const P = b.filter((I) => I.type === "CNAME");
        for (const I of P) await E.deleteRecord(I);
        await Ts("A", y.filter((I) => I.type === "A"), b.filter((I) => I.type === "A"), _.A, E), await Ts("AAAA", y.filter((I) => I.type === "AAAA"), b.filter((I) => I.type === "AAAA"), _.AAAA, E), w = await Ur(d, f, { nameExact: a });
      }
    } catch (P) {
      if (D) {
        m = !0;
        try {
          const I = await T.listCurrentHostRecords();
          for (const M of I) await T.deleteRecord(M);
          for (const M of L) await T.createRecord(M.type, M.content, M);
          p = !0;
        } catch (I) {
          p = !1, g = String(I?.message || I || "unknown_rollback_error");
        }
      }
      throw P;
    }
    const O = w.filter((P) => gr(P.type)), C = O.filter((P) => re(P.name) === a), v = u === !0 ? N || await r.getDnsHostHistory(e, d, a) : [], B = o === "a" ? Qf(o, _, { dedupedDesiredCount: h.duplicateCount }) : null;
    return {
      ok: !0,
      zoneId: d,
      zoneName: A,
      currentHost: a,
      totalRecords: w.length,
      editableRecordCount: O.length,
      filteredCount: C.length,
      records: C,
      ...l === !0 ? { allRecords: O } : {},
      allRecordsIncluded: l === !0,
      history: v,
      mode: o,
      syncSummary: B,
      rollbackAttempted: m,
      rollbackSucceeded: p,
      rollbackError: g
    };
  } catch (S) {
    throw S.details = {
      ...S?.details && typeof S.details == "object" ? S.details : {},
      rollbackAttempted: m,
      rollbackSucceeded: p,
      rollbackError: g
    }, S;
  }
}
function nm(n = {}, e = {}) {
  const { kernel: r } = n, { persistCloudflareDnsRecordsForHost: t } = n;
  return {
    async listDnsRecords(a, { env: o, kv: s, request: i }) {
      const c = oe(await Ce(o)), l = String(c.cfZoneId || "").trim(), u = String(c.cfApiToken || "").trim(), d = a?.includeAllRecords !== !1;
      if (!l || !u) return W("CF_API_ERROR", "请在账号设置中完善 Zone ID 和 API 令牌");
      try {
        const f = await Zf(c, i), m = f.currentHostRecords, p = f.currentHost ? await r.getDnsHostHistory(s, l, f.currentHost) : [];
        return te({
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
        return W("CF_DNS_LIST_FAILED", m.includes("cf_api_http_403") ? "Cloudflare DNS 读取失败：API 令牌权限不足（需要 Zone.DNS:Read）" : m.includes("cf_api_http_401") ? "Cloudflare DNS 读取失败：API 令牌无效" : "Cloudflare DNS 读取失败", 400, { reason: m });
      }
    },
    async setDnsHistoryFallback(a, { env: o, kv: s }) {
      const i = re(a?.host || ""), c = String(a?.entryId || "").trim(), l = a?.enabled !== !1;
      if (!i) return W("MISSING_PARAMS", "host 不能为空");
      if (l && !c) return W("MISSING_PARAMS", "entryId 不能为空");
      const u = oe(await Ce(o)), d = String(u.cfZoneId || "").trim();
      if (!d) return W("CF_API_ERROR", "请先在账号设置中保存 Zone ID");
      try {
        return te({
          ok: !0,
          history: await r.setDnsHostHistoryPreferredFallback(s, d, i, c, l)
        });
      } catch (f) {
        const m = String(f?.message || f || "unknown_error");
        return m.includes("dns_history_entry_not_found") ? W("DNS_HISTORY_ENTRY_NOT_FOUND", "指定的 DNS 历史记录不存在", 404) : W("DNS_HISTORY_FALLBACK_UPDATE_FAILED", "设置 DNS 默认回退值失败", 400, { reason: m });
      }
    },
    async createDnsRecord(a, o) {
      return e.updateDnsRecord(a, o);
    },
    async updateDnsRecord(a, { env: o, kv: s, request: i }) {
      const c = String(i.headers.get("X-Admin-Confirm") || "").trim();
      if (c !== "updateDnsRecord" && c !== "createDnsRecord") return W("CONFIRMATION_REQUIRED", "敏感 DNS 操作需要显式确认头", 428);
      const l = String(a?.recordId || a?.id || "").trim(), u = re(a?.host || a?.name || ""), d = String(a?.type || "").trim().toUpperCase(), f = String(a?.content || "").trim(), m = a?.skipHistory === !0;
      if (!gr(d)) return W("INVALID_TYPE", "Type 仅允许 A / AAAA / CNAME");
      const p = Ua(d, f);
      if (p) return W("INVALID_CONTENT", p);
      if (!l && !u) return W("MISSING_PARAMS", "host 不能为空");
      const g = oe(await Ce(o)), h = String(g.cfZoneId || "").trim(), y = String(g.cfApiToken || "").trim();
      if (!h || !y) return W("CF_API_ERROR", "请在账号设置中完善 Zone ID 和 API 令牌");
      let _ = null, S = !1, A = !1, b = "";
      try {
        const R = await Po(h, y, { scope: "dns.update_record.zone_lookup" }), T = String(R?.name || "").trim(), L = re(new URL(i.url).hostname);
        let D = null;
        if (l) {
          const w = `https://api.cloudflare.com/client/v4/zones/${encodeURIComponent(h)}/dns_records/${encodeURIComponent(l)}`, N = Kt((await Te(w, y))?.result || null);
          if (!N?.id) return W("NOT_FOUND", "DNS 记录不存在", 404);
          const O = String(N?.type || "").toUpperCase();
          if (!gr(O)) return W("UNSUPPORTED_RECORD_TYPE", "该 DNS 记录类型不支持编辑", 400, { currentType: O });
          const C = u || N.name;
          if (!C) return W("MISSING_PARAMS", "host 不能为空");
          if (T && !fa(C, T)) return W("INVALID_HOST", "记录名称必须位于当前 Zone 下");
          const v = la(N, {
            host: C,
            type: d,
            content: f
          });
          D = Kt((await Te(w, y, {
            method: "PUT",
            body: JSON.stringify(v)
          }))?.result || {
            id: l,
            ...v
          }), _ = async () => {
            const B = la(N, {
              host: N.name,
              type: N.type,
              content: N.content
            });
            await Te(w, y, {
              method: "PUT",
              body: JSON.stringify(B)
            });
          };
        } else {
          if (T && !fa(u, T)) return W("INVALID_HOST", "记录名称必须位于当前 Zone 下");
          const w = `https://api.cloudflare.com/client/v4/zones/${encodeURIComponent(h)}/dns_records`, N = la({
            name: u,
            ttl: 1,
            proxied: !1
          }, {
            host: u,
            type: d,
            content: f
          });
          D = Kt((await Te(w, y, {
            method: "POST",
            body: JSON.stringify(N)
          }))?.result || N), _ = async () => {
            if (!D?.id) throw new Error("created_dns_record_id_missing");
            await Te(`${w}/${encodeURIComponent(D.id)}`, y, { method: "DELETE" });
          };
        }
        let E;
        try {
          E = D.type === "CNAME" && !m ? await r.recordDnsHostHistory(s, h, D.name, {
            name: D.name,
            type: D.type,
            content: D.content,
            actor: "admin",
            source: "ui",
            requestHost: L,
            savedAt: (/* @__PURE__ */ new Date()).toISOString()
          }) : await r.getDnsHostHistory(s, h, D.name);
        } catch (w) {
          if (S = typeof _ == "function", S) try {
            await _(), A = !0;
          } catch (N) {
            b = ce(N, "dns_rollback_failed");
          }
          throw w;
        }
        return te({
          ok: !0,
          record: D,
          history: E
        });
      } catch (R) {
        const T = String(R?.message || R || "unknown_error");
        return W("CF_DNS_UPDATE_FAILED", T.includes("cf_api_http_403") ? "Cloudflare DNS 更新失败：API 令牌权限不足（需要 Zone.DNS:Edit）" : T.includes("cf_api_http_401") ? "Cloudflare DNS 更新失败：API 令牌无效" : "Cloudflare DNS 更新失败", 400, {
          reason: T,
          rollbackAttempted: S,
          rollbackSucceeded: A,
          rollbackError: b
        });
      }
    },
    async saveDnsRecords(a, { env: o, kv: s, request: i }) {
      if (i.headers.get("X-Admin-Confirm") !== "saveDnsRecords") return W("CONFIRMATION_REQUIRED", "敏感 DNS 操作需要显式确认头", 428);
      const c = Xf(a?.mode), l = re(a?.host || ""), u = a?.includeAllRecords === !0, d = Array.isArray(a?.records) ? a.records : [];
      if (!l) return W("MISSING_PARAMS", "host 不能为空");
      const f = [];
      if (c === "cname") {
        const h = String(d[0]?.content || "").trim(), y = Ua("CNAME", h);
        if (y) return W("INVALID_CONTENT", y);
        f.push({
          type: "CNAME",
          content: h
        });
      } else {
        const h = d.map((y) => ({
          type: String(y?.type || "").trim().toUpperCase(),
          content: String(y?.content || "").trim()
        })).filter((y) => y.type || y.content);
        if (!h.length) return W("INVALID_CONTENT", "A 模式至少保留 1 条 A / AAAA 记录");
        for (const y of h) {
          if (!["A", "AAAA"].includes(y.type)) return W("INVALID_TYPE", "A 模式仅允许 A / AAAA");
          const _ = Ua(y.type, y.content, { allowCname: !1 });
          if (_) return W("INVALID_CONTENT", _);
          f.push(y);
        }
      }
      const m = oe(await Ce(o)), p = String(m.cfZoneId || "").trim(), g = String(m.cfApiToken || "").trim();
      if (!p || !g) return W("CF_API_ERROR", "请在账号设置中完善 Zone ID 和 API 令牌");
      try {
        const h = re(new URL(i.url).hostname);
        return te(await t({
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
        return W("CF_DNS_SAVE_FAILED", y.includes("cf_api_http_403") ? "Cloudflare DNS 保存失败：API 令牌权限不足（需要 Zone.DNS:Edit）" : y.includes("cf_api_http_401") ? "Cloudflare DNS 保存失败：API 令牌无效" : "Cloudflare DNS 保存失败", 400, {
          reason: y,
          rollbackAttempted: h?.details?.rollbackAttempted === !0,
          rollbackSucceeded: h?.details?.rollbackSucceeded === !0,
          rollbackError: String(h?.details?.rollbackError || "")
        });
      }
    }
  };
}
async function Jr(n, e, r) {
  const t = Array.isArray(n) ? n : [];
  if (t.length === 0) return [];
  if (typeof r != "function") throw new TypeError("worker must be a function");
  const a = Number(e), o = Number.isFinite(a) && a > 0 ? Math.min(t.length, Math.max(1, Math.floor(a))) : 1, s = new Array(t.length);
  let i = 0;
  const c = Array.from({ length: o }, async () => {
    for (; i < t.length; ) {
      const l = i;
      i += 1;
      const u = Promise.resolve().then(() => r(t[l]));
      s[l] = u, await u.catch(() => {
      });
    }
  });
  return await Promise.all(c), Promise.all(s);
}
var om = Object.freeze([{
  id: "cloudflare",
  label: "Cloudflare",
  endpoint: "https://cloudflare-dns.com/dns-query"
}]), Rc = 30 * 1e3, sm = Rc, im = "emby-proxy-ui-dns-probe/1.0", cm = 2400 * 1e3, lm = 35 * 1e3, um = "dns_ip_pool_fetch_lock:", dm = "sys:dns_ip_pool_fetch_lock:v1:";
function fm(n = {}, e = [], r = {}) {
  const t = /* @__PURE__ */ new Set(), a = [];
  for (const s of Array.isArray(e) ? e : []) {
    const i = fr(s);
    if (!i) continue;
    const c = String(i.ip || "").trim().toLowerCase();
    !c || t.has(c) || (t.add(c), a.push(i));
  }
  const o = a.slice(0, $r(n?.ipLimit));
  return {
    id: String(n?.id || ""),
    name: String(n?.name || ""),
    sourceType: St(n?.sourceType || n?.source_type || ""),
    status: o.length > 0 ? "success" : "empty",
    count: o.length,
    items: o,
    lastFetchAt: String(r.lastFetchAt || (/* @__PURE__ */ new Date()).toISOString())
  };
}
async function mm(n = {}, e = F.Defaults.DnsIpSourceFetchMaxBytes) {
  const r = String(n?.url || "").trim();
  if (!r) throw new Error("empty_source_url");
  const t = new AbortController(), a = setTimeout(() => t.abort(), Rc);
  try {
    const o = await We(r, {
      redirect: "follow",
      signal: t.signal
    });
    if (!o.ok) throw new Error(`HTTP_${o.status}`);
    const s = await Pe(o, e);
    if (s.exceeded) throw new Error("SOURCE_TOO_LARGE");
    const i = s.text, c = ti(n?.builtinId || n?.builtin_id || "");
    return (c === "all" ? Bl(i) : c === "preferred" ? Kl(i, { limit: $r(n?.ipLimit) }) : So(i, { limit: $r(n?.ipLimit) })).map((l) => ({
      ...l,
      sourceKind: "api",
      sourceLabel: n?.name || r
    }));
  } catch (o) {
    throw rr(o) ? new Error("FETCH_TIMEOUT") : o;
  } finally {
    clearTimeout(a);
  }
}
function pm(n = {}, e = "", r = "A") {
  const t = new URL(String(n?.endpoint || ""));
  return t.searchParams.set("name", re(e)), t.searchParams.set("type", String(r || "A").toUpperCase()), t;
}
async function gm(n = {}, e = "", r = "A") {
  const t = new AbortController(), a = setTimeout(() => t.abort(), sm);
  try {
    const o = await We(pm(n, e, r).toString(), {
      headers: { accept: "application/dns-json" },
      redirect: "follow",
      signal: t.signal
    });
    if (!o.ok) throw new Error(`DOH_HTTP_${o.status}`);
    const s = await Pe(o, nn);
    return kl(s.exceeded ? null : JSON.parse(s.text || "null")).map((i) => ({
      ...i,
      sourceKind: "domain",
      sourceLabel: String(e || "").trim()
    }));
  } catch (o) {
    throw rr(o) ? new Error("DOH_TIMEOUT") : o;
  } finally {
    clearTimeout(a);
  }
}
function hm(n = []) {
  const e = (Array.isArray(n) ? n : []).map((o) => Array.isArray(o) ? [...o] : []).filter((o) => o.length > 0), r = [], t = /* @__PURE__ */ new Set();
  let a = e.length > 0;
  for (; a; ) {
    a = !1;
    for (const o of e) {
      for (; o.length; ) {
        const s = o.shift(), i = String(s?.ip || "").trim().toLowerCase();
        if (!(!i || t.has(i))) {
          t.add(i), r.push(s);
          break;
        }
      }
      o.length && (a = !0);
    }
  }
  return r;
}
async function ym(n = {}) {
  const e = re(n?.domain || "");
  if (!e) throw new Error("empty_source_domain");
  const r = [], t = [], a = [];
  for (const i of ["A", "AAAA"]) for (const c of om) a.push({
    resolver: c,
    recordType: i
  });
  const o = await Jr(a, Math.min(2, Math.max(1, a.length)), async ({ resolver: i, recordType: c }) => {
    try {
      return {
        resolver: i,
        recordType: c,
        items: await gm(i, e, c),
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
      r.push(c);
      continue;
    }
    String(i?.error || "").trim() && t.push(`${String(i?.resolver?.id || "resolver")}:${String(i?.recordType || "A")}=${String(i?.error || "unknown_doh_error")}`);
  }
  const s = hm(r);
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
async function Sm(n = {}, e = F.Defaults.DnsIpSourceFetchMaxBytes) {
  const r = (/* @__PURE__ */ new Date()).toISOString(), t = Ct(n);
  try {
    return fm(t, t.sourceType === "domain" ? await ym(t) : await mm(t, e), { lastFetchAt: r });
  } catch (a) {
    return {
      id: String(t?.id || ""),
      name: String(t?.name || ""),
      sourceType: St(t?.sourceType || t?.source_type || ""),
      status: "failed",
      count: 0,
      items: [],
      error: String(a?.message || a || "unknown_error"),
      lastFetchAt: r
    };
  }
}
async function As(n, e = "", r = "UNKNOWN", t = {}) {
  const { probeRepository: a } = t, o = String(e || "").trim(), s = Ye(o), i = String(r || "UNKNOWN").trim().toUpperCase() || "UNKNOWN";
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
    expiresAt: H()
  };
  if (n && t.forceRefresh !== !0 && t.skipCacheRead !== !0) {
    const m = await a.getDnsIpProbeCacheEntry(n, o, i);
    if (m) return m;
  }
  const c = new AbortController(), l = setTimeout(() => c.abort(), ue(t.probeTimeoutMs ?? t.timeoutMs, F.Defaults.DnsIpProbeTimeoutMs, 250, 3e4)), u = H(), d = s === "IPv6" ? `http://[${o}]/` : `http://${o}/`, f = (/* @__PURE__ */ new Date()).toISOString();
  try {
    const m = await We(d, {
      headers: { "user-agent": im },
      method: "HEAD",
      redirect: "manual",
      signal: c.signal
    }), p = Math.max(0, H() - u), g = String(m.headers.get("CF-RAY") || m.headers.get("cf-ray") || "").trim(), h = String(m.headers.get("Server") || m.headers.get("server") || "").trim(), y = Qs(g), _ = y ? "ok" : /cloudflare/i.test(h) ? "cf_header_missing" : "non_cloudflare", S = zl(y), A = {
      ip: o,
      entryColo: i,
      probeStatus: _,
      latencyMs: p,
      cfRay: g,
      coloCode: S.coloCode,
      cityName: S.cityName,
      countryCode: S.countryCode,
      countryName: S.countryName,
      probedAt: f,
      expiresAt: H() + F.Defaults.DnsIpProbeCacheTtlSec * 1e3
    };
    return n && t.skipCacheWrite !== !0 && await a.upsertDnsIpProbeCacheEntry(n, A), A;
  } catch (m) {
    const p = {
      ip: o,
      entryColo: i,
      probeStatus: rr(m) ? "timeout" : "network_error",
      latencyMs: null,
      cfRay: "",
      coloCode: "",
      cityName: "",
      countryCode: "UNKNOWN",
      countryName: "未知",
      probedAt: f,
      expiresAt: H() + F.Defaults.DnsIpProbeCacheTtlSec * 1e3
    };
    return n && t.skipCacheWrite !== !0 && await a.upsertDnsIpProbeCacheEntry(n, p), p;
  } finally {
    clearTimeout(l);
  }
}
async function Tc(n = [], e, r = "UNKNOWN", t = {}) {
  const a = [], o = /* @__PURE__ */ new Map(), s = /* @__PURE__ */ new Set(), i = String(r || "UNKNOWN").trim().toUpperCase() || "UNKNOWN";
  for (const S of Array.isArray(n) ? n : []) {
    const A = String(S?.ip || S?.content || "").trim(), b = Ye(A) || Js(S?.ipType || S?.ip_type || S?.type || "");
    if (!A || !b) continue;
    const R = {
      id: String(S?.id || S?.recordId || `${t.scope || "dns"}-${ie(`${A}|${S?.sourceKind || S?.source_kind || ""}`)}`),
      ip: A,
      ipType: b,
      recordId: String(S?.recordId || S?.id || ""),
      host: String(S?.host || S?.name || t.host || ""),
      sourceKind: String(S?.sourceKind || S?.source_kind || t.scope || "shared_pool"),
      sourceLabel: String(S?.sourceLabel || S?.source_label || t.sourceLabel || ""),
      lineLabel: zr(S?.lineLabel || S?.line_label || ""),
      remark: String(S?.remark || ""),
      createdAt: String(S?.createdAt || S?.created_at || ""),
      updatedAt: String(S?.updatedAt || S?.updated_at || ""),
      probeStatus: Fa(S?.probeStatus || S?.probe_status || ""),
      latencyMs: Number.isFinite(Number(S?.latencyMs ?? S?.latency_ms)) ? Math.max(0, Math.round(Number(S?.latencyMs ?? S?.latency_ms))) : null,
      cfRay: String(S?.cfRay || S?.cf_ray || ""),
      coloCode: String(S?.coloCode || S?.colo_code || "").trim().toUpperCase(),
      cityName: String(S?.cityName || S?.city_name || ""),
      countryCode: String(S?.countryCode || S?.country_code || "").trim().toUpperCase() || "UNKNOWN",
      countryName: String(S?.countryName || S?.country_name || "") || "未知",
      probedAt: String(S?.probedAt || S?.probed_at || "")
    };
    a.push(R), o.set(A.toLowerCase(), A);
  }
  if (!a.length) return {
    items: [],
    probeEntryColo: i,
    probeDataSource: "cache"
  };
  const c = /* @__PURE__ */ new Map(), l = [], u = [...o.values()], d = e ? await t.probeRepository.getDnsIpProbeCacheEntries(e, u, i) : [];
  for (const S of Array.isArray(d) ? d : []) {
    const A = String(S?.ip || "").trim().toLowerCase();
    A && c.set(A, S);
  }
  for (const S of u)
    c.has(String(S || "").toLowerCase()) && t.forceRefresh !== !0 || l.push(S);
  const f = t.deferProbe === !0 && !!t.ctx?.waitUntil, m = ue(t.syncProbeLimit, F.Defaults.DnsIpWorkspaceSyncProbeLimit, 0, 64), p = f && l.length > m ? l.slice(0, m) : l, g = f && l.length > m ? l.slice(m) : [], h = ue(t.probeConcurrency, F.Defaults.DnsIpProbeConcurrency, 1, 4);
  let y = "cache";
  p.length > 0 && (y = "live_sync"), g.length > 0 && (y = "live_deferred");
  const _ = await Jr(p, h, async (S) => {
    const A = await As(e, S, r, {
      ...t,
      skipCacheRead: !0,
      skipCacheWrite: !0
    });
    return c.set(String(S || "").toLowerCase(), A), A;
  });
  return e && _.length && await t.probeRepository.upsertDnsIpProbeCacheEntries(e, _), g.length && (g.forEach((S) => s.add(String(S || "").toLowerCase())), t.ctx.waitUntil((async () => {
    const S = await Jr(g, h, (A) => As(e, A, r, {
      ...t,
      skipCacheRead: !0,
      skipCacheWrite: !0
    }));
    e && S.length && await t.probeRepository.upsertDnsIpProbeCacheEntries(e, S);
  })().catch((S) => {
    console.warn("[DNS IP Workspace] Deferred probe failed:", S?.message || S);
  }))), {
    items: a.map((S) => {
      const A = c.get(S.ip.toLowerCase());
      return A ? {
        ...S,
        probeStatus: A.probeStatus,
        latencyMs: A.latencyMs,
        cfRay: A.cfRay,
        coloCode: A.coloCode,
        cityName: A.cityName,
        countryCode: A.countryCode,
        countryName: A.countryName,
        probedAt: A.probedAt
      } : S;
    }).map((S) => !s.has(String(S.ip || "").toLowerCase()) || String(S.probedAt || "").trim() ? S : {
      ...S,
      probeStatus: "pending"
    }),
    probeEntryColo: i,
    probeDataSource: Jn(y)
  };
}
function _m(n = {}) {
  const e = _o(n?.items || []);
  return {
    sourceResults: oi(n?.sourceResults || []),
    importedCount: Math.max(0, Number(n?.importedCount) || e.length),
    items: e,
    enabledSourceCount: Math.max(0, Number(n?.enabledSourceCount) || 0),
    cachedAt: za(n?.cachedAtMs),
    expiresAt: za(n?.expiresAtMs)
  };
}
async function bm(n = [], e, r = "UNKNOWN", t = null, a = {}) {
  const o = t && typeof t.waitUntil == "function" ? t : { waitUntil() {
  } }, s = await Tc(n, e, r, {
    probeRepository: a.probeRepository,
    forceRefresh: !1,
    scope: "shared_pool",
    ctx: o,
    deferProbe: !0,
    syncProbeLimit: ue(a?.syncProbeLimit, 0, 0, 64),
    probeTimeoutMs: ue(a?.probeTimeoutMs, 500, 250, 3e4)
  });
  return Array.isArray(s?.items) ? s.items : [];
}
function Jn(n = "") {
  const e = String(n || "").trim().toLowerCase();
  return e === "live_deferred" ? "live_deferred" : e === "live_sync" ? "live_sync" : "cache";
}
function Em(n = "", e = "") {
  const r = Jn(n), t = Jn(e), a = {
    cache: 0,
    live_sync: 1,
    live_deferred: 2
  };
  return (a[t] || 0) > (a[r] || 0) ? t : r;
}
function Rm(n = {}) {
  const e = [];
  Array.isArray(n?.localPoolItems) && e.push(...n.localPoolItems), Array.isArray(n?.poolItems) && e.push(...n.poolItems), Array.isArray(n?.sharedPoolItems) && e.push(...n.sharedPoolItems);
  const r = [], t = /* @__PURE__ */ new Set();
  for (const a of e) {
    const o = fr(a);
    if (!o) continue;
    const s = String(o.ip || "").trim().toLowerCase();
    !s || t.has(s) || (t.add(s), r.push({
      ...a,
      ...o
    }));
  }
  return r;
}
function Tm(n = [], e = []) {
  const r = /* @__PURE__ */ new Map(), t = (a) => {
    for (const o of Array.isArray(a) ? a : []) {
      const s = fr(o);
      s && r.set(String(s.ip || "").trim().toLowerCase(), {
        ...o,
        ...s
      });
    }
  };
  return t(n), t(e), [...r.values()];
}
function Am(n = "") {
  return `${um}${String(n || "").trim()}`;
}
async function Cm({ kv: n = null, db: e = null, leaseRepository: r = null } = {}, t = "") {
  const a = Am(t);
  if (!a || a === "dns_ip_pool_fetch_lock:") return {
    acquired: !1,
    reason: "empty_signature"
  };
  const o = `${H()}-${Math.random().toString(36).slice(2, 10)}`;
  return e ? {
    ...await r.tryAcquireScheduledLeaseWithDb(e, {
      scope: a,
      token: o,
      owner: "dns_ip_pool_fetch",
      leaseMs: lm
    }),
    token: o,
    key: a
  } : {
    acquired: !1,
    reason: "db_unavailable",
    backend: "d1",
    token: o,
    key: a
  };
}
async function wm({ kv: n = null, db: e = null, leaseRepository: r = null } = {}, t = null) {
  if (!t?.token) return !1;
  const a = String(t?.key || "").trim();
  return e && a ? await r.releaseScheduledLeaseWithDb(e, t.token, { scope: a }) : !1;
}
async function Lm({ kv: n = null, db: e = null, ctx: r = null, sourceList: t = [], maxBytes: a = F.Defaults.DnsIpSourceFetchMaxBytes, poolRepository: o = null } = {}) {
  const s = (Array.isArray(t) ? t : []).map((S, A) => Ct(S, A)), i = s.filter((S) => S.enabled === !0 && or(S)), c = ue(F.Defaults.DnsIpSourceConcurrency, F.Defaults.DnsIpSourceConcurrency, 1, 4), l = await Jr(i, i.some((S) => St(S?.sourceType) === "domain") ? Math.min(c, 2) : c, async (S) => Sm(S, a)), u = [], d = /* @__PURE__ */ new Map();
  for (const S of l)
    d.set(String(S?.id || ""), S), Array.isArray(S?.items) && u.push(...S.items);
  const f = s.map((S, A) => {
    const b = d.get(String(S?.id || ""));
    return Ct(b ? {
      ...S,
      lastFetchAt: b.lastFetchAt,
      lastFetchStatus: b.status,
      lastFetchCount: b.count
    } : S, A);
  }), m = await he(o.persistDnsIpPoolSources({
    kv: n,
    db: e
  }, f, null), "dns_ip_pool.refresh.persist_source_state", {
    sourceCount: f.length,
    enabledSourceCount: i.length
  }, f), p = mr(u), g = _o(p), h = oi(l);
  let y = "", _ = "";
  if (e) {
    const S = va(s, a);
    if (S && Zl(l)) {
      const A = H(), b = A + cm, R = await o.upsertDnsIpPoolFetchCacheEntry(e, {
        signature: S,
        items: p,
        sourceResults: l,
        importedCount: g.length,
        enabledSourceCount: i.length,
        cachedAtMs: A,
        expiresAtMs: b,
        createdAt: new Date(A).toISOString(),
        updatedAt: new Date(A).toISOString()
      });
      y = za(R?.cachedAtMs), _ = za(R?.expiresAtMs);
    }
  }
  return i.length && await he(o.bumpDnsIpPoolRevision({
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
    expiresAt: _
  };
}
function Dm(n = {}, e = {}) {
  const { kernel: r } = n, { buildDnsIpPoolWorkspacePreviewItems: t, buildDnsIpWorkspaceItems: a, releaseDnsIpPoolFetchRefreshLock: o, runDnsIpPoolSourcesLiveRefresh: s, tryAcquireDnsIpPoolFetchRefreshLock: i } = n;
  return {
    async getDnsIpWorkspace(c, { env: l, kv: u, db: d, request: f, ctx: m }) {
      try {
        const p = c?.forceRefresh === !0;
        d && await r.ensureDnsIpWorkspaceSchema(d);
        const g = await fe(l), h = na(f), y = Ku(f);
        let _ = await r.getDnsIpPoolSourcesForRead({
          kv: u,
          db: d
        });
        const S = Rm(c), A = F.Defaults.DnsIpSourceFetchMaxBytes, b = _.filter((v) => v.enabled === !0 && or(v));
        let R = [], T = "empty", L = !1;
        if (p && b.length > 0) {
          const v = await s({
            kv: u,
            db: d,
            ctx: m,
            sourceList: _,
            maxBytes: A
          });
          _ = Array.isArray(v?.sourceList) ? v.sourceList : _, R = Array.isArray(v?.items) ? v.items : [], T = "live_sync";
        } else {
          const v = va(_, A), B = d && v ? await r.getDnsIpPoolFetchCacheEntry(d, v) : null;
          if (B)
            R = Array.isArray(B?.items) ? B.items : [], T = "cache";
          else if (b.length > 0 && m?.waitUntil && v) {
            const P = await i({
              kv: u,
              db: d
            }, v);
            P?.acquired === !0 && (L = !0, T = "live_deferred", m.waitUntil((async () => {
              try {
                await s({
                  kv: u,
                  db: d,
                  sourceList: _,
                  maxBytes: A
                });
              } catch (I) {
                console.warn("[DNS IP Workspace] background source snapshot refresh failed:", I?.message || I);
              } finally {
                await o({
                  kv: u,
                  db: d
                }, P);
              }
            })()));
          }
        }
        const D = Tm(R, S), E = await a(D, d, h, {
          forceRefresh: p,
          scope: "shared_pool",
          ctx: m,
          deferProbe: !0,
          syncProbeLimit: 0,
          probeTimeoutMs: 500
        }), w = [], N = Array.isArray(E?.items) ? E.items : [], O = await r.getOpsStatusSection({
          kv: u,
          db: d
        }, "dnsIpPool"), C = /* @__PURE__ */ new Map();
        for (const v of N) {
          const B = String(v?.countryCode || "").trim().toUpperCase();
          if (!B) continue;
          const P = C.get(B) || {
            code: B,
            name: String(v?.countryName || "未知"),
            count: 0
          };
          P.count += 1, C.set(B, P);
        }
        return te({
          zoneId: String(g.cfZoneId || "").trim(),
          zoneName: "",
          host: "",
          requestColo: h,
          probeEntryColo: h,
          probeDataSource: Em("cache", E?.probeDataSource),
          sourceSnapshotStatus: T,
          backgroundRefreshQueued: L,
          requestCountryCode: y.countryCode,
          requestCountryName: y.countryName,
          currentHostItems: w,
          sharedPoolItems: N,
          sourceList: _,
          availableCountries: [...C.values()].sort((v, B) => String(v.code || "").localeCompare(String(B.code || ""))),
          summary: ru(w, N),
          dnsIpPoolRevision: r.getDnsIpPoolRevisionFromStatus(O),
          generatedAt: (/* @__PURE__ */ new Date()).toISOString(),
          ...Er(),
          revisions: await r.getAdminRevisionsForRead({
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
      if (!m) return W("EMPTY_IMPORT_TEXT", "请先提供要导入的文本内容");
      const p = String(c?.sourceKind || "manual").trim().toLowerCase() || "manual", g = String(c?.sourceLabel || "").trim() || (p === "file" ? "文件导入" : "手动导入"), h = So(m).map((S) => ({
        ...S,
        sourceKind: p,
        sourceLabel: g
      })), y = await a(h, d, na(f), {
        scope: "shared_pool",
        forceRefresh: !1
      }), _ = Array.isArray(y?.items) ? y.items : [];
      return te({
        success: !0,
        importedCount: _.length,
        items: _,
        revisions: await r.getAdminRevisions({
          env: l,
          kv: u,
          db: d
        })
      });
    },
    async saveDnsIpPoolSources(c, { env: l, kv: u, db: d, ctx: f }) {
      if (!d) return W("D1_NOT_CONFIGURED", "请先绑定 D1 / PROXY_LOGS 数据库");
      const m = await r.persistDnsIpPoolSources({
        kv: u,
        db: d
      }, c?.sources || [], f);
      return await r.bumpDnsIpPoolRevision({
        kv: u,
        db: d
      }, {
        lastSourceConfigAt: (/* @__PURE__ */ new Date()).toISOString(),
        sourceCount: m.length
      }, f), te({
        success: !0,
        sourceList: m,
        dnsIpPoolRevision: await r.getOpsStatusSection({
          kv: u,
          db: d
        }, "dnsIpPool").then((p) => r.getDnsIpPoolRevisionFromStatus(p)).catch(() => ""),
        ...Er(),
        revisions: await r.getAdminRevisions({
          env: l,
          kv: u,
          db: d
        })
      });
    },
    async getDnsIpPoolSources(c, { env: l, kv: u, db: d }) {
      try {
        if (!d) return te({
          success: !0,
          sourceList: [],
          dnsIpPoolRevision: "",
          ...Er(),
          revisions: await r.getAdminRevisionsForRead({
            env: l,
            kv: u,
            db: d
          }, { config: await fe(l) })
        });
        d && await r.ensureDnsIpWorkspaceSchema(d);
        const [f, m, p] = await Promise.all([
          fe(l),
          r.getDnsIpPoolSourcesForRead({
            kv: u,
            db: d
          }),
          r.getOpsStatusSection({
            kv: u,
            db: d
          }, "dnsIpPool")
        ]);
        return te({
          success: !0,
          sourceList: m,
          dnsIpPoolRevision: r.getDnsIpPoolRevisionFromStatus(p),
          ...Er(),
          revisions: await r.getAdminRevisionsForRead({
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
        if (!d) return W("D1_NOT_CONFIGURED", "请先绑定 D1 / PROXY_LOGS 数据库");
        d && await r.ensureDnsIpWorkspaceSchema(d);
        const p = ue(c?.maxBytes, F.Defaults.DnsIpSourceFetchMaxBytes, 1024, 8 * 1024 * 1024), g = await r.getDnsIpPoolSources({
          kv: u,
          db: d
        }), h = va(g, p), y = d && h ? await r.getDnsIpPoolFetchCacheEntry(d, h) : null;
        if (y) {
          let A = !1;
          if (f?.waitUntil) {
            const T = await i({
              kv: u,
              db: d
            }, h);
            T?.acquired === !0 && (A = !0, f.waitUntil((async () => {
              try {
                await s({
                  kv: u,
                  db: d,
                  sourceList: g,
                  maxBytes: p
                });
              } catch (L) {
                console.warn("[DNS IP Pool] background refresh failed:", L?.message || L);
              } finally {
                await o({
                  kv: u,
                  db: d
                }, T);
              }
            })()));
          }
          const b = _m(y), R = await t(b.items, d, na(m), f, { syncProbeLimit: 0 });
          return te({
            success: !0,
            sourceResults: b.sourceResults,
            sourceList: g,
            importedCount: b.importedCount,
            items: R,
            cacheStatus: "d1",
            backgroundRefreshQueued: A,
            cachedAt: b.cachedAt,
            expiresAt: b.expiresAt,
            dnsIpPoolRevision: await r.getOpsStatusSection({
              kv: u,
              db: d
            }, "dnsIpPool").then((T) => r.getDnsIpPoolRevisionFromStatus(T)).catch(() => ""),
            ...Er(),
            revisions: await r.getAdminRevisions({
              env: l,
              kv: u,
              db: d
            })
          });
        }
        const _ = await s({
          kv: u,
          db: d,
          ctx: f,
          sourceList: g,
          maxBytes: p
        }), S = await t(_.items, d, na(m), f, {
          syncProbeLimit: 0,
          probeTimeoutMs: 500
        });
        return te({
          success: !0,
          sourceResults: _.sourceResults,
          sourceList: _.sourceList,
          importedCount: _.importedCount,
          items: S,
          cacheStatus: "live",
          backgroundRefreshQueued: !1,
          cachedAt: _.cachedAt,
          expiresAt: _.expiresAt,
          dnsIpPoolRevision: await r.getOpsStatusSection({
            kv: u,
            db: d
          }, "dnsIpPool").then((A) => r.getDnsIpPoolRevisionFromStatus(A)).catch(() => ""),
          ...Er(),
          revisions: await r.getAdminRevisions({
            env: l,
            kv: u,
            db: d
          })
        });
      } catch (p) {
        if (an(p)) throw p;
        const g = ce(p, "unknown_error"), h = /* @__PURE__ */ new Error(`更新服务端共享快照失败: ${g}`);
        throw h.code = "DNS_IP_POOL_REFRESH_FAILED", h.status = 500, h.details = { reason: g }, h;
      }
    },
    async deleteDnsIpPoolItems(c, { env: l, kv: u, db: d, ctx: f }) {
      d && await r.ensureDnsIpWorkspaceSchema(d);
      const m = eu(c?.target);
      if (m === "shared_snapshot") {
        if (!d) return W("D1_NOT_CONFIGURED", "请先绑定 D1 / PROXY_LOGS 数据库");
        const g = await r.getDnsIpPoolSourcesForRead({
          kv: u,
          db: d
        }), h = va(g, F.Defaults.DnsIpSourceFetchMaxBytes), y = h ? await r.getDnsIpPoolFetchCacheEntry(d, h) : null, _ = tu(y, c?.ips || []);
        if (y && h && _.deletedCount > 0) {
          const S = (/* @__PURE__ */ new Date()).toISOString(), A = Math.max(0, Number(y?.cachedAtMs) || 0), b = Math.max(A, Number(y?.expiresAtMs) || A), R = Math.max(0, Number(y?.enabledSourceCount) || (Array.isArray(g) ? g.filter((T) => T?.enabled === !0 && or(T)).length : 0));
          await r.upsertDnsIpPoolFetchCacheEntry(d, {
            signature: h,
            items: _.items,
            sourceResults: _.sourceResults,
            importedCount: _.items.length,
            enabledSourceCount: R,
            cachedAtMs: A,
            expiresAtMs: b,
            createdAt: String(y?.createdAt || S),
            updatedAt: S
          }), await r.bumpDnsIpPoolRevision({
            kv: u,
            db: d
          }, {
            lastSnapshotDeleteAt: S,
            lastSnapshotDeleteCount: _.deletedCount
          }, f);
        }
        return te({
          success: !0,
          target: m,
          deletedCount: _.deletedCount,
          deletedIps: _.deletedIps,
          revisions: await r.getAdminRevisions({
            env: l,
            kv: u,
            db: d
          })
        });
      }
      const p = si(c?.ips || []).normalizedIps;
      return te({
        success: !0,
        target: m,
        deletedCount: d ? await r.deleteDnsIpPoolItems(d, p) : p.length,
        revisions: await r.getAdminRevisions({
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
      if (!l.length) return W("EMPTY_IP_SELECTION", "请先选择至少一个可用 IP");
      const u = [], d = /* @__PURE__ */ new Set();
      for (const f of l) {
        const m = `${f.type}:${f.content.toLowerCase()}`;
        d.has(m) || (d.add(m), u.push(f));
      }
      return u.sort((f, m) => f.type !== m.type ? f.type.localeCompare(m.type) : f.content.localeCompare(m.content)), te({
        success: !0,
        mode: "a",
        records: u
      });
    }
  };
}
function Nm(n = {}, e = {}) {
  const { kernel: r } = n;
  return {
    async testTelegram(t) {
      const { tgBotToken: a, tgChatId: o } = t;
      if (!a || !o) return W("MISSING_PARAMS", "请先填写 Bot Token 和 Chat ID");
      try {
        return await r.sendTelegramMessage({
          tgBotToken: a,
          tgChatId: o,
          text: `✅ Emby Proxy: Telegram 机器人测试通知成功！
如果您能看到这条消息，说明您的通知配置完全正确。`
        }), te({ success: !0 });
      } catch (s) {
        return W("NETWORK_ERROR", s.message);
      }
    },
    async sendDailyReport(t, { env: a }) {
      try {
        const o = await r.sendDailyTelegramReport(a);
        return te({
          success: !0,
          sentCount: Number(o?.sentCount) || 0,
          reportKinds: Array.isArray(o?.reportKinds) ? o.reportKinds : []
        });
      } catch (o) {
        return W("REPORT_FAILED", o.message);
      }
    },
    async sendPredictedAlert(t, { env: a }) {
      try {
        const o = await r.maybeSendRuntimeAlerts(a, null, {
          ignoreCooldown: !0,
          persistState: !1,
          triggeredBy: "manual_predict"
        });
        return te({
          success: !0,
          sent: o?.sent === !0,
          issueCount: Number(o?.issueCount) || 0,
          reason: String(o?.reason || "").trim()
        });
      } catch (o) {
        return W("ALERT_PREDICT_FAILED", o.message);
      }
    },
    async pingNode(t, { env: a, ctx: o }) {
      const s = await Ce(a), i = ue(t.timeout, s.pingTimeout ?? pu, 1e3, 18e4);
      if (t.target) {
        const _ = r.normalizeSingleTarget(t.target);
        if (!_) return W("INVALID_TARGET", "目标源站必须是有效的 http/https URL");
        const S = await r.pingTarget(_, i);
        return te({
          ...S.ok ? { ms: S.elapsedMs } : {},
          probe: S,
          target: _,
          usedCache: !1,
          scope: "target"
        });
      }
      const c = String(t.name || "").trim(), l = await r.getNode(c, a, o);
      if (!l || !Array.isArray(l.lines) || !l.lines.length) return W("NOT_FOUND", "节点不存在");
      const u = String(t.lineId || "").trim(), d = u ? l.lines.filter((_) => _.id === u) : l.lines.slice();
      if (u && !d.length) return W("LINE_NOT_FOUND", "线路不存在", 404);
      const f = await Promise.all(d.map(async (_) => {
        const S = await r.pingTarget(_.target, i);
        return {
          id: String(_?.id || "").trim(),
          name: String(_?.name || "").trim(),
          target: String(_?.target || "").trim(),
          latencyMs: S.ok ? S.elapsedMs : null,
          probe: S,
          latencyUpdatedAt: (/* @__PURE__ */ new Date()).toISOString()
        };
      })), m = l.lines.map((_) => {
        const S = f.find((A) => A.id === _.id);
        return S ? {
          id: S.id,
          name: S.name,
          target: S.target,
          latencyMs: S.latencyMs,
          probe: S.probe,
          latencyUpdatedAt: S.latencyUpdatedAt
        } : {
          id: String(_?.id || "").trim(),
          name: String(_?.name || "").trim(),
          target: String(_?.target || "").trim()
        };
      }), p = r.resolveActiveLineId(l.activeLineId, m, m), g = r.getActiveNodeLine({
        ...l,
        lines: m,
        activeLineId: p
      }), h = u ? m.find((_) => _.id === u) : g, y = r.buildNodeSummary(c.toLowerCase(), l).summary || { name: c.toLowerCase() };
      return te({
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
function Im(n = {}, e = {}) {
  const { kernel: r } = n, { LogQueryPlanner: t } = n;
  return {
    async getLogs(a, { db: o, env: s }) {
      if (!o) return te({ error: "D1 not configured" }, 500);
      const i = t.normalizeRequest(a), { filters: c } = i, l = s ? await Ce(s) : {}, u = await r.resolveLogsReadiness({
        db: o,
        kv: r.getKV(s)
      }), d = t.resolveSearch(c, l, u);
      if (d.errorResponse) return d.errorResponse;
      const { effectiveSearchMode: f, searchFallbackReason: m } = d;
      if (l.logEnabled === !1) return t.buildDisabledResponse(i, u, f, m);
      if (u.schemaReady !== !0) return W("LOG_SCHEMA_NOT_READY", "日志表尚未初始化，请先点击“初始化日志表”", 400, {
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
    async clearLogs(a, { db: o, env: s, ctx: i, request: c }) {
      if (c.headers.get("X-Admin-Confirm") !== "clearLogs") return W("CONFIRMATION_REQUIRED", "敏感操作需要显式确认头", 428);
      if (!o) return te({ error: "D1 not configured" }, 500);
      await r.ensureLogsBaseSchema(o), await r.ensureStatsHourlySchema(o);
      const l = H(), u = tr.get(o);
      u.LogClearEpochMs = Math.max(u.LogClearEpochMs || 0, l), await r.patchOpsStatus(s || o, { log: {
        clearEpochMs: l,
        clearEpochAt: new Date(l).toISOString()
      } }, i);
      const d = u.LogFlushTask;
      if (d) try {
        await d;
      } catch {
      }
      u.LogQueue.length = 0, u.LogDedupe.clear(), u.LogLastFlushAt = 0, await o.prepare(`DELETE FROM ${r.LOGS_TABLE}`).run(), await r.clearStatsHourly(o).catch(() => !1);
      let f = !1;
      try {
        f = await r.rebuildLogsFts(o);
      } catch (h) {
        console.warn("clearLogs FTS rebuild failed", h);
      }
      const m = await r.isLogsFtsReady(o), p = await r.hasStatsHourlyTable(o), g = await r.bumpLogsRevision(s || { db: o }, {
        schemaReady: !0,
        ftsReady: m,
        statsReady: p,
        clearEpochMs: l,
        clearEpochAt: new Date(l).toISOString(),
        lastClearAt: (/* @__PURE__ */ new Date()).toISOString()
      }, i);
      return te({
        success: !0,
        ftsRebuilt: f,
        revisions: { logsRevision: r.getLogsRevisionFromStatus(g?.log || g) }
      });
    },
    async getD1SchemaStatus(a, { db: o, env: s }) {
      if (!o) return W("D1_NOT_CONFIGURED", "请先绑定 D1 / PROXY_LOGS 数据库", 503);
      const i = await r.buildD1SchemaRepairPlan(o);
      let c = {
        token: "",
        expiresAt: 0
      };
      return i.phase === "destructive" && i.blockingIssues.length === 0 && (c = await r.createD1SchemaRepairToken(s, i)), te({
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
    async initLogsDb(a, { db: o, env: s, request: i }) {
      if (!o) return W("D1_NOT_CONFIGURED", "D1 database is not configured", 503);
      const c = await r.initializeD1Database(o, {
        includeFts: !0,
        env: s,
        repairMode: String(a?.repairMode || "safe").trim() || "safe",
        repairToken: String(a?.repairToken || "").trim(),
        confirmHighRisk: String(i?.headers?.get("X-Admin-Confirm") || "").trim() === "repairD1Schema"
      }), l = c.status, u = l.ftsReady === !0, d = l.tables?.[r.STATS_HOURLY_TABLE] === !0, f = l.schemaReady === !0 ? await r.bumpLogsRevision(o, {
        schemaReady: !0,
        ftsReady: u,
        statsReady: d,
        categoryEnabled: !0
      }) : null;
      return te({
        success: c.completed === !0 || c.pendingHighRisk === !0,
        schemaReady: l.schemaReady === !0,
        pendingHighRisk: c.pendingHighRisk === !0,
        categoryEnabled: !0,
        ftsReady: u,
        statsReady: d,
        initialization: c,
        steps: c.steps,
        status: l,
        revisions: f ? { logsRevision: r.getLogsRevisionFromStatus(f?.log || f) } : {}
      });
    }
  };
}
function Mm(n = {}) {
  const { kernel: e } = n, r = {}, t = cl([
    {
      name: "dashboard",
      handlers: Pf({
        ...n,
        kernel: e
      }, r)
    },
    {
      name: "config",
      handlers: Bf({
        ...n,
        kernel: e
      }, r)
    },
    {
      name: "backup",
      handlers: Kf({
        ...n,
        kernel: e
      }, r)
    },
    {
      name: "nodes",
      handlers: Vf({
        ...n,
        kernel: e
      }, r)
    },
    {
      name: "maintenance",
      handlers: qf({
        ...n,
        kernel: e
      }, r)
    },
    {
      name: "dns-records",
      handlers: nm({
        ...n,
        kernel: e
      }, r)
    },
    {
      name: "dns-pool",
      handlers: Dm({
        ...n,
        kernel: e
      }, r)
    },
    {
      name: "notifications",
      handlers: Nm({
        ...n,
        kernel: e
      }, r)
    },
    {
      name: "database",
      handlers: Im({
        ...n,
        kernel: e
      }, r)
    }
  ], { aliases: {
    import: "saveOrImport",
    save: "saveOrImport"
  } });
  for (const [a, o] of Object.entries(t.handlers)) r[a] = o;
  return t;
}
function Pm(n = {}) {
  return { adminActionHandlers: Mm(n).handlers };
}
function Xe(n, e) {
  const r = k(n) ? n : {}, t = k(e) ? e : {}, a = { ...r };
  for (const [o, s] of Object.entries(t))
    s !== void 0 && (k(s) && k(r[o]) ? a[o] = Xe(r[o], s) : k(s) ? a[o] = Xe({}, s) : a[o] = s);
  return a;
}
function Ue(n, e, r, t) {
  n.has(e) && n.delete(e), n.set(e, r);
  const a = Math.floor(Number(t));
  if (!(!Number.isFinite(a) || a < 1))
    for (; n.size > a; ) {
      const o = n.keys().next().value;
      if (o === void 0) break;
      n.delete(o);
    }
}
function Za(n, e) {
  if (!n.has(e)) return;
  const r = n.get(e);
  return n.delete(e), n.set(e, r), r;
}
function cr(n = void 0) {
  const e = n === void 0 ? gt.current() : _e(n);
  e.NodesRevisionCacheGeneration += 1, e.NodesRevisionCache = null;
}
function Cs(n, e = null) {
  const r = _e(e);
  r.NodesRevisionCacheGeneration += 1, r.NodesRevisionCache = {
    loaded: !0,
    revision: String(n || "").trim(),
    exp: Date.now() + F.Defaults.NodesRevisionCacheTtlMs
  };
}
function Ie(n, e = gt.current()) {
  const r = String(n || "").trim().toLowerCase(), t = r && Number(e.NodeCacheGenerations.get(r)) || 0, a = t ? `node:${t}` : `missing:${e.NodeCacheGenerationEvictionEpoch}`;
  return `${e.NodeCacheResetGeneration}:${a}`;
}
function xm(n = [], e = gt.current()) {
  for (const r of Array.isArray(n) ? n : [n]) {
    const t = String(r || "").trim().toLowerCase();
    if (!t) continue;
    !e.NodeCacheGenerations.has(t) && e.NodeCacheGenerations.size >= F.Defaults.NodeCacheMax && (e.NodeCacheGenerationEvictionEpoch += 1);
    const a = ++e.NodeCacheGenerationNonce;
    Ue(e.NodeCacheGenerations, t, a, F.Defaults.NodeCacheMax);
  }
}
function ws(n = gt.current()) {
  n.NodeCacheResetGeneration += 1, n.NodeCacheGenerations.clear();
}
function ve(n) {
  return new TextEncoder().encode(String(n ?? "")).byteLength;
}
function Ac(n, e, r = {}) {
  const t = ve(e), a = Math.max(1, Number(r.limitBytes) || Gt), o = /* @__PURE__ */ new Error(`D1 value exceeds the ${a}-byte compatibility budget`);
  return o.code = "D1_VALUE_TOO_LARGE", o.status = 400, o.details = {
    field: String(n || "value"),
    actualBytes: t,
    limitBytes: a,
    platformLimitBytes: Cu
  }, o;
}
function ka(n, e, r = {}) {
  if (ve(e) > Math.max(1, Number(r.limitBytes) || Gt)) throw Ac(n, e, r);
  return e;
}
function tt(n, e = {}) {
  const r = String(n || "").trim().toLowerCase(), t = k(e) ? e : {}, a = Array.isArray(t.lines) ? t.lines : [];
  if (a.length > Bn) return {
    nodeName: r,
    field: "lines",
    actual: a.length,
    limit: Bn
  };
  const o = k(t.headers) ? t.headers : {}, s = Object.entries(o);
  if (s.length > Jo) return {
    nodeName: r,
    field: "headers.count",
    actual: s.length,
    limit: Jo
  };
  let i = 0;
  for (const [l, u] of s) {
    const d = ve(l), f = ve(u);
    if (d > Zo) return {
      nodeName: r,
      field: `headers.${l}.keyBytes`,
      actual: d,
      limit: Zo
    };
    if (f > es) return {
      nodeName: r,
      field: `headers.${l}.valueBytes`,
      actual: f,
      limit: es
    };
    i += d + f;
  }
  if (i > Qo) return {
    nodeName: r,
    field: "headers.bytes",
    actual: i,
    limit: Qo
  };
  for (const l of Lu) {
    const u = ve(t[l]);
    if (u > Rr) return {
      nodeName: r,
      field: l,
      actual: u,
      limit: Rr
    };
  }
  for (let l = 0; l < (Array.isArray(t.tags) ? t.tags.length : 0); l += 1) {
    const u = ve(t.tags[l]);
    if (u > Rr) return {
      nodeName: r,
      field: `tags.${l}`,
      actual: u,
      limit: Rr
    };
  }
  for (let l = 0; l < a.length; l += 1) for (const u of [
    "id",
    "name",
    "target"
  ]) {
    const d = ve(a[l]?.[u]);
    if (d > Rr) return {
      nodeName: r,
      field: `lines.${l}.${u}`,
      actual: d,
      limit: Rr
    };
  }
  let c = 0;
  try {
    c = ve(JSON.stringify(t));
  } catch {
    return {
      nodeName: r,
      field: "record",
      actual: null,
      limit: wn
    };
  }
  return c > wn ? {
    nodeName: r,
    field: "record.bytes",
    actual: c,
    limit: wn
  } : null;
}
function Om(n, e = {}) {
  const r = tt(n, e);
  return r ? {
    code: "NODE_RESOURCE_LIMIT_EXCEEDED",
    ...r
  } : null;
}
async function Dr(n, e = null) {
  const r = _e(e), t = r.NodeIndexMutationChain.catch(() => null).then(async () => {
    r.NodesListCache = null, r.NodesIndexCache = null, cr(e);
    try {
      return await n();
    } catch (a) {
      throw r.NodesListCache = null, r.NodesIndexCache = null, cr(e), a;
    }
  });
  return r.NodeIndexMutationChain = t.catch(() => null), await t;
}
var vm = "cf_dashboard_cache:", Cc = "sys:cf_dash_cache", Fm = 1800 * 1e3, Ls = 1440 * 60 * 1e3;
function Qn(n, e = "") {
  return `${vm}${encodeURIComponent(String(n || "default").trim() || "default")}:${encodeURIComponent(String(e || "current").trim() || "current")}`;
}
function Ds(n, e = "") {
  return `${Cc}:${encodeURIComponent(String(n || "default").trim() || "default")}:${encodeURIComponent(String(e || "current").trim() || "current")}`;
}
function Ns(n = /* @__PURE__ */ new Date(), e = F.Defaults.ScheduleUtcOffsetMinutes) {
  const r = Ra(n, e), t = r.shiftedDate.getUTCFullYear(), a = r.shiftedDate.getUTCMonth(), o = Date.UTC(t, a, 1) - r.utcOffsetMinutes * 60 * 1e3, s = Date.UTC(t, a + 1, 1) - r.utcOffsetMinutes * 60 * 1e3, i = r.now.getTime();
  return {
    ...r,
    monthKey: `${t}-${String(a + 1).padStart(2, "0")}`,
    periodLabel: `${t}年${a + 1}月`,
    startTs: o,
    endTs: Math.min(Math.max(o, i), s - 1),
    nextMonthTs: s
  };
}
function Um(n = "", e = "", r = 0) {
  return [
    "dashboard_monthly_traffic",
    1,
    encodeURIComponent(String(n || "default").trim() || "default"),
    encodeURIComponent(String(e || "current").trim() || "current"),
    ze(r)
  ].join(":");
}
function km(n = "") {
  const e = String(n || "").trim();
  return e ? new Request(`https://dashboard-monthly-traffic-cache.invalid/${encodeURIComponent(e)}`) : null;
}
function Xt(n = {}) {
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
function Hm(n = "", e = "") {
  const r = String(n || "").trim();
  return r ? String(e || "").trim().toLowerCase() === "workers_usage" && r.includes("Cloudflare Workers Usage") ? "今日请求量口径：Cloudflare Workers Usage" : r : "";
}
function $m(n = "") {
  const e = String(n || "").trim();
  return e ? e.includes("请求数已对齐 Workers Usage") ? "Cloudflare 统计正常" : e : "";
}
function Bm(n = "", e = "") {
  const r = String(n || "").trim();
  if (!r) return "";
  const t = String(e || "").trim().toLowerCase();
  return r.includes("已对齐脚本") || t === "workers_usage" && r.includes("脚本:") ? "" : r;
}
var Km = [
  "周日",
  "周一",
  "周二",
  "周三",
  "周四",
  "周五",
  "周六"
];
function wc() {
  return Array.from({ length: 24 }, (n, e) => String(e).padStart(2, "0"));
}
function Zn(n = "") {
  const e = /^(\d{4})-(\d{2})-(\d{2})$/.exec(String(n || "").trim());
  if (!e) return String(n || "").trim() || "-";
  const r = Km[new Date(Date.UTC(Number(e[1]), Number(e[2]) - 1, Number(e[3]))).getUTCDay()] || "";
  return `${e[2]}-${e[3]}${r ? ` ${r}` : ""}`;
}
function Lc(n = "", e = 0, r = 0, t = 0, a = 0) {
  const o = Math.max(0, Math.min(23, Number(e) || 0)), s = Math.max(0, Number(r) || 0), i = Math.max(0, Number(t) || 0), c = Math.max(0, Math.min(1, Number(a) || 0)), l = `${String(o).padStart(2, "0")}:00`, u = s > 0 ? Math.min(0.88, Number((0.12 + c * 0.68).toFixed(3))) : 0.04;
  return {
    key: `${n}:${o}`,
    hour: o,
    hourLabel: l,
    rowsWritten: s,
    writeQueries: i,
    intensity: c,
    className: s > 0 ? "d1-heat-cell is-active" : "d1-heat-cell is-empty",
    style: `--d1-heat-alpha:${u}`,
    title: `${n} ${l} · 写入 ${Se(s)} 行 · SQL 写 ${Se(i)} 次`
  };
}
function en(n = {}) {
  const e = ze(n.utcOffsetMinutes), r = Math.max(0, Number(n.nowMs) || H()), t = pt(new Date(r), e).startTs - 8640 * 60 * 1e3, a = Array.from({ length: 7 }, (o, s) => {
    const i = Dt(t + s * 24 * 60 * 60 * 1e3, e);
    return {
      key: i.dateKey,
      dateKey: i.dateKey,
      label: Zn(i.dateKey),
      cells: Array.from({ length: 24 }, (c, l) => Lc(i.dateKey, l))
    };
  });
  return {
    title: "D1 写入热点图",
    status: String(n.status || "idle").trim().toLowerCase() || "idle",
    source: String(n.source || "").trim(),
    summary: String(n.summary || "D1 写入热点尚未加载").trim() || "D1 写入热点尚未加载",
    detail: String(n.detail || "").trim(),
    periodLabel: String(n.periodLabel || `最近 7 天 · ${ho(e)}`).trim(),
    hourLabels: wc(),
    rows: a,
    available: !1,
    totalRowsWritten: 0,
    totalWriteQueries: 0,
    peakLabel: "",
    legendMaxLabel: "0"
  };
}
function zm(n = {}) {
  const e = n && typeof n == "object" ? { ...n } : {}, r = en({ status: "idle" });
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
function Uo(n = {}) {
  const e = n && typeof n == "object" ? { ...n } : {}, r = String(e.requestSource || "").trim().toLowerCase();
  return e.requestSourceText = Hm(e.requestSourceText, r), e.cfAnalyticsStatus = $m(e.cfAnalyticsStatus), e.cfAnalyticsDetail = Bm(e.cfAnalyticsDetail, r), e.d1WriteHotspot = zm(e.d1WriteHotspot), e;
}
function ko(n = "") {
  const e = String(n || "").trim().toLowerCase();
  return e === "cache" || e === "stale" || e === "live" ? e : "live";
}
function Dc(n, e = "dashboard_snapshot_failed") {
  const r = kt(n, e);
  return r.length <= 220 ? r : `${r.slice(0, 217)}...`;
}
function Ho(n = {}) {
  const e = ko(n.cacheStatus || n.status), r = Math.max(0, Number(n.cachedAt) || 0);
  return {
    cacheStatus: e,
    cachedAt: r,
    expiresAt: Math.max(r, Number(n.expiresAt) || r),
    updatedAt: Math.max(r, Number(n.updatedAt) || r),
    generatedAt: String(n.generatedAt || "").trim(),
    warning: String(n.warning || "").trim(),
    partial: n.partial === !0 || e === "stale"
  };
}
function eo(n = {}) {
  const e = n && typeof n == "object" ? { ...n } : {}, r = Uo(!k(e.stats) && (Array.isArray(e.hourlySeries) || Object.prototype.hasOwnProperty.call(e, "todayRequests") || Object.prototype.hasOwnProperty.call(e, "todayTraffic")) ? e : k(e.stats) ? e.stats : {}), t = k(e.runtimeStatus) ? { ...e.runtimeStatus } : {}, a = k(e.cacheMeta) ? e.cacheMeta : {}, o = Ho({
    cacheStatus: a.cacheStatus || r.cacheStatus || "live",
    cachedAt: a.cachedAt,
    expiresAt: a.expiresAt,
    updatedAt: a.updatedAt,
    generatedAt: a.generatedAt || r.generatedAt || "",
    warning: a.warning,
    partial: a.partial === !0
  });
  return r.cacheStatus = ko(r.cacheStatus || o.cacheStatus), {
    stats: r,
    runtimeStatus: t,
    cacheMeta: o
  };
}
function ta(n = {}, e = "live", r = {}) {
  const t = eo(n), a = ko(e || t.cacheMeta.cacheStatus);
  return {
    stats: Uo({
      ...t.stats,
      cacheStatus: a
    }),
    runtimeStatus: k(t.runtimeStatus) ? { ...t.runtimeStatus } : {},
    cacheMeta: Ho({
      ...t.cacheMeta,
      ...r,
      cacheStatus: a,
      generatedAt: String(r.generatedAt || t.cacheMeta.generatedAt || t.stats.generatedAt || "").trim()
    })
  };
}
function to(n) {
  if (!(!n || typeof n != "object")) {
    try {
      n.cancelScheduledDelay?.();
    } catch {
    }
    n.cancelScheduledDelay = null, n.pendingSnapshot = null, n.scheduledFlushAt = 0, n.scheduledPromise = null, n.waitUntilCtx = null;
  }
}
function Zt(n) {
  const e = ne.PlaybackProgressRelay;
  if (!(e instanceof Map)) return !1;
  const r = e.get(n);
  return r && to(r), e.delete(n);
}
function Is(n, e) {
  const r = ne.PlaybackProgressRelay;
  if (!(r instanceof Map)) return !1;
  const t = Math.max(1, Number(F.Defaults.VideoProgressForwardSessionMax) || 1);
  if (!r.has(n) && r.size >= t) {
    let a = "";
    for (const [o, s] of r) if (!s?.activeFlushPromise) {
      a = o;
      break;
    }
    if (!a) return !1;
    Zt(a);
  }
  return r.has(n) && r.delete(n), r.set(n, e), !0;
}
function hr(n, e = "/") {
  const r = rt(n) ? new URL(n.targetUrl.toString()) : n instanceof URL ? new URL(n.toString()) : new URL(String(n || "")), t = rt(n) ? n.normalizedBasePath : Nt(r.pathname), a = Q(e);
  return r.pathname = (a === "/" ? t ? `${t}/` : "/" : `${t}${a}`) || "/", r.search = "", r.hash = "", r;
}
var Wm = /* @__PURE__ */ new Set(["emby", "mediabrowser"]);
function Ms(n = "/") {
  return Q(n).split("/").filter(Boolean);
}
function Gm(n = "/", e = "") {
  const r = Q(n), t = String(e || "").trim();
  if (!t || t === "/") return null;
  const a = r.toLowerCase(), o = t.toLowerCase();
  return a !== o && !a.startsWith(`${o}/`) ? null : Q(r.slice(t.length) || "/");
}
function jm(n = "/", e = "") {
  const r = Ms(e), t = Ms(n);
  if (!r.length || !t.length) return null;
  const a = String(r[r.length - 1] || "").toLowerCase(), o = String(t[0] || "").toLowerCase();
  return !a || a !== o || !Wm.has(a) ? null : Q(`/${t.slice(1).join("/")}` || "/");
}
function Nc(n, e = "/") {
  const r = rt(n) ? n : mn(n);
  if (!r) return null;
  const t = Q(e), a = r.normalizedBasePath;
  let o = t;
  if (a) {
    const s = Gm(t, a);
    if (s !== null) o = s;
    else {
      const i = jm(t, a);
      i !== null && (o = i);
    }
  }
  return hr(r, o);
}
function Vm(n, e = "/", r = "") {
  if (!rt(n)) {
    const s = hr(n, e);
    return s.search = cs(r), s.toString();
  }
  const t = Q(e), a = cs(r), o = n.absoluteBasePrefix || n.originText;
  return `${(t === "/" ? `${o}/` : `${o}${t}`) || `${n.originText}/`}${a}`;
}
function Da(n, e) {
  try {
    const r = n instanceof URL ? new URL(n.toString()) : new URL(String(n || "")), t = e instanceof URL ? new URL(e.toString()) : new URL(String(e || ""));
    if (r.origin !== t.origin) return {
      resolvedUrl: r,
      proxyPath: null
    };
    const a = Nt(t.pathname);
    let o = r.pathname || "/";
    if (a) if (o === a || o === `${a}/`) o = "/";
    else if (o.startsWith(`${a}/`)) o = o.slice(a.length);
    else return {
      resolvedUrl: r,
      proxyPath: null
    };
    return {
      resolvedUrl: r,
      proxyPath: Q(o)
    };
  } catch {
    return {
      resolvedUrl: null,
      proxyPath: null
    };
  }
}
function Ps(n, e, r, t, a = {}) {
  try {
    const { resolvedUrl: o, proxyPath: s } = Da(n, e);
    return o ? s ? `${yt(r, t, a)}${s === "/" ? "/" : s}${o.search}${o.hash}` : o.toString() : null;
  } catch {
    return null;
  }
}
function Ic(n = "") {
  const e = Q(n), r = e.toLowerCase();
  let t = -1;
  for (const a of [
    "/items/",
    "/videos/",
    "/audio/",
    "/livetv/"
  ]) {
    const o = r.indexOf(a);
    o > 0 && (t === -1 || o < t) && (t = o);
  }
  return t <= 0 ? "" : Nt(e.slice(0, t));
}
function $o(n = "", e = "") {
  const r = Q(n), t = Nt(e);
  if (!t) return r;
  const a = r.toLowerCase(), o = t.toLowerCase();
  return a === o ? "/" : a.startsWith(`${o}/`) ? Q(r.slice(t.length) || "/") : r;
}
function ro(n = "", e = "") {
  const r = Nt(e);
  if (!r) return Q(n);
  let t = Q(n);
  for (; ; ) {
    if (t === r || t === `${r}/`) return "/";
    if (!t.startsWith(`${r}/`)) return t;
    t = Q(t.slice(r.length) || "/");
  }
}
function qm(n = "", e = null, r = "") {
  let t = Q(n);
  return t = ro(t, r), t = ro(t, e instanceof URL ? e.pathname : "/"), t;
}
function Xm(n = "", e = "", r = null, t = null, a = "") {
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
    if (Yd(o)) {
      i = new URL(o, s || "https://playback-info.local/");
      const u = String(i.protocol || "").toLowerCase(), d = String(s?.origin || "").trim().toLowerCase();
      if (!["http:", "https:"].includes(u) || !d || i.origin.toLowerCase() !== d) return null;
    } else i = new URL(o, "https://playback-info.local/");
  } catch {
    return null;
  }
  const c = qm(i.pathname || "/", r, a), l = $o(c, Ic(c));
  return ga(l) ? {
    proxyPath: Q(l),
    search: i.search || "",
    hash: i.hash || ""
  } : null;
}
function Ym(n = "", e = "", r = null) {
  let t = Q(n);
  const a = Ic(e);
  if (a) {
    const u = ro(t, a);
    u !== t && ga(u) && (t = u);
  }
  const o = Nt(r instanceof URL ? r.pathname : "/");
  if (!a || !o) return t;
  const s = `${a}${o}`, i = t.toLowerCase(), c = s.toLowerCase();
  if (i !== c && !i.startsWith(`${c}/`)) return t;
  const l = Q(`${a}${t.slice(s.length) || "/"}`);
  return ga(l) ? l : t;
}
function Jm(n = "") {
  return zt(n) === "rewrite" ? "relative" : "";
}
function Mc(n) {
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
function Qm(n = "/", e = null) {
  const r = Q(e instanceof URL ? e.pathname : n), t = new URLSearchParams(e instanceof URL ? e.search : String(e || ""));
  for (; t.has(Gn); ) t.delete(Gn);
  const a = t.toString();
  return `${r}${a ? `?${a}` : ""}`;
}
function yt(n, e, r = {}) {
  const t = Sd(r?.linkVariant), a = t ? "/" + encodeURIComponent(t) : "";
  if (Ze(r?.entryMode)) return a;
  const o = encodeURIComponent(String(n || "")), s = e ? "/" + encodeURIComponent(String(e)) : "";
  return "/" + o + s + a;
}
function Pc(n, e, r, t = "/", a = {}) {
  const o = n instanceof URL ? new URL(n.toString()) : new URL(String(n || "")), s = Q(t), i = new URL(o.origin);
  return i.pathname = `${yt(e, r, {
    linkVariant: a.linkVariant,
    entryMode: a.entryMode
  })}${s === "/" ? "/" : s}`, i.search = String(a.search || ""), i.hash = String(a.hash || ""), i;
}
function Zm(n, e, r, t, a = {}) {
  const o = t instanceof URL ? new URL(t.toString()) : new URL(String(t || "")), s = new URL(n instanceof URL ? n.origin : String(n || ""));
  return s.pathname = `${yt(e, r, {
    linkVariant: a.linkVariant,
    entryMode: a.entryMode
  })}/${Oi}${o.pathname || "/"}`, s.search = o.search || "", s.searchParams.append(vi, pa(o.toString())), s.hash = "", s;
}
function ep(n = "", e = "", r = "", t = {}) {
  let a = Q(n);
  const o = String(e || "").trim();
  if (!o && !Ze(t?.entryMode)) return a;
  const s = [...new Set([
    "proxy_a",
    "proxy_b",
    "main"
  ].map((c) => yt(o, r, {
    linkVariant: c,
    entryMode: t.entryMode
  })).filter((c) => c && c !== "/"))].sort((c, l) => l.length - c.length);
  if (!s.length) return a;
  let i = !0;
  for (; i; ) {
    i = !1;
    for (const c of s) {
      const l = $o(a, c);
      if (l !== a) {
        a = l, i = !0;
        break;
      }
    }
  }
  return a;
}
function tp(n = null) {
  const e = String(n?.routeContextDiagnostics?.routeKind || "").trim();
  return e !== "host_prefix_path_compat" && e !== "legacy_host_prefix_path_compat" ? "" : yt(n?.nodeName, n?.nodeKey, {
    linkVariant: n?.linkVariant,
    entryMode: "kv_route"
  });
}
function rp(n = "", e = "") {
  const r = Q(n), t = Nt(e);
  if (!t || t === "/") return r;
  const a = r.toLowerCase(), o = t.toLowerCase();
  return a === o || a.startsWith(`${o}/`) ? r : `${t}${r === "/" ? "/" : r}`;
}
function ap(n = "", e = null) {
  const r = Q(n), t = `/${Oi}`;
  if (!r.startsWith(t)) return null;
  const a = e instanceof URL && [...e.searchParams.getAll("__pb_target")].pop() || "";
  if (!a) return { error: "missing_target" };
  let o;
  try {
    o = new URL(qr(a));
  } catch {
    return { error: "invalid_target" };
  }
  return ["http:", "https:"].includes(String(o.protocol || "").toLowerCase()) ? {
    targetUrl: o,
    visibleProxyPath: Q(r.slice(t.length) || "/")
  } : { error: "unsupported_target" };
}
function xs(n = "", e = null, r = "") {
  const t = Q(n), a = t.search(/https?:\/\//i);
  if (a <= 0) return null;
  let o;
  try {
    o = e instanceof URL ? new URL(e.toString()) : new URL(String(e || ""));
  } catch {
    return null;
  }
  let s;
  try {
    s = new URL(t.slice(a));
  } catch {
    return null;
  }
  if (String(s.origin || "").toLowerCase() !== String(o.origin || "").toLowerCase()) return null;
  const i = Nt(r), c = Q(s.pathname || "/"), l = i ? $o(c, i) : c;
  if (i && l === c && c.toLowerCase() !== i.toLowerCase()) return null;
  const u = Q(t.slice(0, a) || "/"), d = [l];
  if (u !== "/") {
    const f = u.toLowerCase(), m = l.toLowerCase();
    m !== f && !m.startsWith(`${f}/`) && d.unshift(Q(`${u}${l === "/" ? "/" : l}`));
  }
  for (const f of d)
    if (ga(Q(oa(f).remaining || f)))
      return {
        kind: "embedded_absolute",
        originalPath: t,
        normalizedPath: Q(f),
        embeddedUrl: s.toString()
      };
  return null;
}
function tn(n) {
  const e = /* @__PURE__ */ new Map();
  if (!n || typeof n != "string") return e;
  for (const r of n.split(";")) {
    const t = r.trim();
    if (!t) continue;
    const a = t.indexOf("="), o = (a === -1 ? t : t.slice(0, a)).trim(), s = a === -1 ? "" : t.slice(a + 1).trim();
    o && e.set(o, s);
  }
  return e;
}
function xc(n) {
  const e = [];
  for (const [r, t] of n.entries()) e.push(t === "" ? r : `${r}=${t}`);
  return e.join("; ");
}
function Bo(n, e = []) {
  const r = new Set((Array.isArray(e) ? e : [e]).map((a) => String(a || "").trim().toLowerCase()).filter(Boolean)), t = tn(n);
  if (r.size > 0)
    for (const a of [...t.keys()]) r.has(String(a).trim().toLowerCase()) && t.delete(a);
  return xc(t) || null;
}
function np(n, e, r = ["auth_token"]) {
  const t = new Set(r.map((s) => String(s || "").trim().toLowerCase()).filter(Boolean)), a = tn(n);
  for (const s of [...a.keys()]) t.has(String(s).trim().toLowerCase()) && a.delete(s);
  const o = tn(e);
  for (const [s, i] of o.entries())
    t.has(String(s).trim().toLowerCase()) || a.set(s, i);
  return xc(a) || null;
}
function Os(n = "") {
  const e = Q(n).split("/").filter(Boolean);
  if (e.length === 0) return !1;
  const r = wt(e[0]).toLowerCase();
  return Fu.has(r);
}
async function op(n = "", e = "", r = null, t = {}) {
  const a = String(n || "").trim().toLowerCase(), o = re(e), s = String(r?.JWT_SECRET || "").trim();
  if (!a || !o || !s) return "";
  const i = Math.max(0, Math.floor(Number(t.nowMs ?? H()) / 1e3)), c = Math.max(1, Math.trunc(Number(t.maxAgeSec) || 86400)), l = pa(JSON.stringify({
    v: 1,
    node: a,
    host: o,
    iat: i,
    exp: i + c
  }));
  if (!l) return "";
  const u = await ft(s, l);
  return u ? `${l}.${u}` : "";
}
async function sp(n = "", e = null, r = {}) {
  const t = String(n || "").trim(), a = String(e?.JWT_SECRET || "").trim();
  if (!t) return {
    ok: !1,
    reason: "missing_cookie"
  };
  if (!a) return {
    ok: !1,
    reason: "missing_secret"
  };
  const o = t.indexOf(".");
  if (o <= 0 || o === t.length - 1) return {
    ok: !1,
    reason: "malformed_cookie"
  };
  const s = t.slice(0, o), i = t.slice(o + 1), c = await ft(a, s);
  if (!c || i !== c) return {
    ok: !1,
    reason: "bad_signature"
  };
  let l = null;
  try {
    l = JSON.parse(qr(s));
  } catch {
    return {
      ok: !1,
      reason: "malformed_payload"
    };
  }
  const u = {
    v: Number(l?.v) || 0,
    node: String(l?.node || "").trim().toLowerCase(),
    host: re(l?.host || ""),
    iat: Math.max(0, Math.floor(Number(l?.iat) || 0)),
    exp: Math.max(0, Math.floor(Number(l?.exp) || 0))
  };
  if (u.v !== 1 || !u.node || !u.host || !u.iat || !u.exp || u.exp <= u.iat) return {
    ok: !1,
    reason: "invalid_payload",
    payload: u
  };
  const d = re(r.requestHost || "");
  if (d && u.host !== d) return {
    ok: !1,
    reason: "host_mismatch",
    payload: u
  };
  const f = Math.max(0, Math.floor(Number(r.nowMs ?? H()) / 1e3));
  return u.exp <= f ? {
    ok: !1,
    reason: "expired",
    payload: u
  } : {
    ok: !0,
    payload: u
  };
}
function ip(n = "") {
  const e = String(n || "").trim();
  return e ? `${Co}=${e}; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=${vu}` : Oc();
}
function Oc() {
  return `${Co}=; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=0; Expires=Thu, 01 Jan 1970 00:00:00 GMT`;
}
function _n(n = "GET", e = null) {
  const r = e ? new Headers(e) : new Headers();
  return r.set("Content-Type", "text/plain; charset=utf-8"), r.set("Cache-Control", "no-store, max-age=0"), we(r), r.get("Access-Control-Allow-Origin") !== "*" && Hr(r, "Origin"), new Response(n === "HEAD" ? null : "Not Found", {
    status: 404,
    headers: r
  });
}
function Na(n = "") {
  return String(n || "").trim().toLowerCase().replace(/[^a-z0-9]+/g, "");
}
var vc = /* @__PURE__ */ new Set([
  "authorization",
  "x-emby-authorization",
  "x-mediabrowser-authorization"
]), cp = /* @__PURE__ */ new Set(["x-emby-token", "x-mediabrowser-token"]), lp = /* @__PURE__ */ new Set(["x-emby-device-id", "x-mediabrowser-device-id"]), Fc = /* @__PURE__ */ new Set([
  ...vc,
  ...cp,
  ...lp
]);
function bn(n) {
  if (n instanceof Headers) return [...n.entries()];
  if (n && typeof n == "object" && typeof n.entries == "function") try {
    return [...n.entries()].filter((e) => Array.isArray(e) && e.length >= 2).map((e) => [String(e[0] || ""), String(e[1] ?? "")]);
  } catch {
  }
  if (n && typeof n == "object" && typeof n[Symbol.iterator] == "function") try {
    return [...n].filter((e) => Array.isArray(e) && e.length >= 2).map((e) => [String(e[0] || ""), String(e[1] ?? "")]);
  } catch {
  }
  return Array.isArray(n) ? n.filter((e) => Array.isArray(e) && e.length >= 2).map((e) => [String(e[0] || ""), String(e[1] ?? "")]) : n && typeof n == "object" ? Object.entries(n).map(([e, r]) => [String(e || ""), String(r ?? "")]) : [];
}
function Uc(n = "") {
  const e = String(n || "").trim().toLowerCase();
  return !e || Fc.has(e) || e === "cookie" ? !1 : e.includes("authorization") || e.includes("api-key") || e.includes("apikey") || e.includes("access-key") || e.includes("accesskey") || e.includes("access-token") || e.includes("accesstoken") || e.includes("session") || e.includes("credential") || e.includes("signature") || e.includes("secret") || e.includes("auth") || e.includes("token");
}
var kc = /* @__PURE__ */ new Set([
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
]), Hc = "identity-http-v2", up = Object.freeze([
  "Range",
  "If-None-Match",
  "If-Modified-Since"
]), dp = [
  /^\/Videos\/[^/]+\/(?:main|master|stream)\.m3u8$/i,
  /^\/Videos\/[^/]+\/(?:manifest|main|master|stream)\.mpd$/i,
  /^\/Audio\/[^/]+\/(?:main|master|stream)\.m3u8$/i
], fp = /* @__PURE__ */ new Set([
  "mediasourceid",
  "static",
  "tag",
  "audiostreamindex",
  "subtitlestreamindex",
  "subtitlemethod",
  "starttimeticks"
]);
function $c(n = "") {
  return kc.has(Na(n));
}
function mp(n) {
  const e = n instanceof URL ? new URL(n.toString()) : new URL(String(n || ""));
  e.hash = "";
  const r = [];
  for (const [t, a] of e.searchParams.entries())
    $c(t) || r.push([t, a]);
  r.sort((t, a) => {
    const o = t[0].localeCompare(a[0]);
    return o !== 0 ? o : String(t[1]).localeCompare(String(a[1]));
  }), e.search = "";
  for (const [t, a] of r) e.searchParams.append(t, a);
  return e;
}
function Bc(n) {
  const e = n instanceof Request ? new URL(n.url) : new URL(String(n || "")), r = [];
  for (const [s, i] of e.searchParams.entries()) {
    const c = Na(s);
    kc.has(c) && r.push([c, String(i)]);
  }
  r.sort((s, i) => {
    const c = s[0].localeCompare(i[0]);
    return c !== 0 ? c : s[1].localeCompare(i[1]);
  });
  const t = n instanceof Request ? n.headers : new Headers(), a = [];
  for (const [s, i] of t.entries()) {
    const c = String(s || "").trim().toLowerCase();
    !c || !Fc.has(c) && !Uc(c) || a.push([c, String(i)]);
  }
  const o = Bo(t.get("Cookie") || "", ["auth_token", ...ln]);
  return o && a.push(["cookie", o]), a.sort((s, i) => {
    const c = s[0].localeCompare(i[0]);
    return c !== 0 ? c : s[1].localeCompare(i[1]);
  }), {
    queryEntries: r,
    headerEntries: a
  };
}
function pp(n) {
  const e = Bc(n);
  return e.queryEntries.length > 0 || e.headerEntries.length > 0;
}
async function Kc(n) {
  const e = Bc(n), r = await Fn().digest("SHA-256", new TextEncoder().encode(ee(e)));
  return [...new Uint8Array(r)].map((t) => t.toString(16).padStart(2, "0")).join("");
}
async function gp(n, e) {
  return await Kc(new Request(e instanceof URL ? e.toString() : String(e || ""), { headers: n.headers }));
}
function zc(n = "", e = {}) {
  const r = ht.test(String(n || ""));
  return ie(`${Hc}:${r ? "manifest" : "asset"}:${r ? Math.max(0, Number(e.prewarmCacheTtl) || 0) : Math.max(0, Number(e.imageCacheMaxAge) || 0)}`);
}
function hp(n, e) {
  if (!(n instanceof Request) || !(e instanceof Request) || e.headers.has("If-Range")) return null;
  const r = new Headers();
  for (const t of up) {
    const a = e.headers.get(t);
    a && r.set(t, a);
  }
  return new Request(n.url, {
    method: "GET",
    headers: r
  });
}
function yp(n = "") {
  const e = String(n || ""), r = /\/(?:Videos|Audio)\/.+$/i.exec(e);
  return r ? r[0] : e;
}
function Sp(n) {
  try {
    return new Request(mp(n).toString(), { method: "GET" });
  } catch {
    return null;
  }
}
function _p(n = {}) {
  const e = Array.isArray(n?.lines) ? n.lines.slice() : [];
  if (e.length > 1) {
    const r = String(n?.activeLineId || "").trim();
    if (r) {
      const t = e.findIndex((a) => String(a?.id || "").trim() === r);
      if (t > 0) {
        const [a] = e.splice(t, 1);
        e.unshift(a);
      }
    }
  }
  return e.length > 0 ? e.map((r) => String(r?.target || "").trim()).filter(Boolean) : String(n?.target || "").split(",").map((r) => r.trim()).filter(Boolean);
}
function ao(n = "", e = {}) {
  const r = String(n || "").trim().toLowerCase(), t = nr(e?.entryMode), a = bn(e?.headers).map(([o, s]) => [String(o || "").trim().toLowerCase(), String(s ?? "").trim()]).filter(([o]) => !!o).sort((o, s) => {
    const i = o[0].localeCompare(s[0]);
    return i !== 0 ? i : o[1].localeCompare(s[1]);
  });
  return ie(ee({
    nodeName: r,
    entryMode: t,
    secret: t === "host_prefix" ? "" : String(e?.secret || "").trim(),
    tags: Kr(e?.tags, e?.tag),
    remark: String(e?.remark || "").trim(),
    activeLineId: String(e?.activeLineId || "").trim(),
    orderedTargets: _p(e),
    headers: a,
    playbackInfoMode: String(e?.playbackInfoMode || "").trim().toLowerCase(),
    mediaAuthMode: String(e?.mediaAuthMode || "").trim().toLowerCase(),
    realClientIpMode: String(e?.realClientIpMode || "").trim().toLowerCase(),
    routingDecisionMode: String(e?.routingDecisionMode || "").trim().toLowerCase(),
    mainVideoStreamMode: String(e?.mainVideoStreamMode || e?.wangpanDirectMode || e?.wangpanMode || "").trim().toLowerCase()
  }));
}
function Wc(n = []) {
  const e = /* @__PURE__ */ new Set();
  for (const r of Array.isArray(n) ? n : [n]) {
    const t = String(r || "").trim().toLowerCase();
    t && e.add(t);
  }
  return e;
}
function Gc(n = []) {
  const e = Wc(n);
  if (!e.size) return;
  const r = ne.PlaybackInfoResponseCache;
  if (r instanceof Map) for (const [t, a] of r.entries()) {
    const o = String(a?.nodeName || "").trim().toLowerCase();
    e.has(o) && r.delete(t);
  }
}
function jc(n = []) {
  const e = Wc(n);
  if (!e.size) return;
  const r = ne.PlaybackProgressRelay;
  if (!(!(r instanceof Map) || r.size <= 0))
    for (const [t, a] of r.entries()) {
      const o = String(a?.nodeName || a?.pendingSnapshot?.nodeName || "").trim().toLowerCase();
      !o || !e.has(o) || Zt(t);
    }
}
function Vc(n, e, r, t = "/", a = {}) {
  try {
    const o = String(a.identityPartition || "").trim(), s = String(a.cachePolicyRevision || "").trim();
    if (!o || !s) return null;
    const i = n instanceof URL ? new URL(n.toString()) : new URL(String(n || "")), c = Q(t), l = new URL(i.origin);
    l.pathname = `${yt(e, r, {
      linkVariant: "main",
      entryMode: a.entryMode
    })}${c === "/" ? "/" : c}`, l.search = String(a.search || "");
    const u = String(a.nodeCacheRevision || "").trim();
    return u && l.searchParams.set("__proxyrev", u), l.searchParams.set("__metadatarev", Hc), l.searchParams.set("__identity", o), l.searchParams.set("__policy", s), l.hash = "", Sp(l);
  } catch {
    return null;
  }
}
function bp(n) {
  try {
    const e = n instanceof URL ? new URL(n.toString()) : new URL(String(n || ""));
    for (const [r, t] of e.searchParams.entries()) {
      const a = String(r || "").toLowerCase(), o = String(t || "").toLowerCase();
      if (a.includes("transcod") || o.includes("transcod")) return !0;
    }
    return !1;
  } catch {
    return !0;
  }
}
function Ep(n) {
  try {
    const e = n instanceof URL ? new URL(n.toString()) : new URL(String(n || "")), r = yp(e.pathname || "");
    if (!ht.test(r) || bp(e) || !dp.some((t) => t.test(r))) return !1;
    for (const [t] of e.searchParams.entries())
      if (!$c(t) && !fp.has(Na(t)))
        return !1;
    return !0;
  } catch {
    return !1;
  }
}
function no(n) {
  try {
    const e = n instanceof URL ? new URL(n.toString()) : new URL(String(n || "")), r = e.pathname || "";
    return Vr.test(r) || jr.test(r) || pr.test(r) ? !0 : ht.test(r) ? Ep(e) : !1;
  } catch {
    return !1;
  }
}
function Rp(n = "") {
  const e = String(n || "").toLowerCase();
  return e ? /\.(?:mp4|m4v|mkv|mov|avi|wmv|flv|ts|m4s)(?:$|[?#])/.test(e) ? !0 : ht.test(e) || pr.test(e) ? !1 : /\/videos\/[^/]+\/(?:stream|original|download|file)\b/.test(e) || /\/items\/[^/]+\/download\b/.test(e) : !1;
}
function oo(n, e = /* @__PURE__ */ new Set(), r = 0) {
  if (n == null || r > 5) return e;
  if (typeof n == "string") {
    const t = n.trim();
    if (t && /^(?:https?:\/\/|\/)/i.test(t)) {
      const a = t.toLowerCase(), o = a.split(/[?#]/, 1)[0] || a;
      (ht.test(o) || pr.test(o) || Vr.test(a) || jr.test(o)) && e.add(t);
    }
    return e;
  }
  return Array.isArray(n) ? (n.slice(0, 24).forEach((t) => oo(t, e, r + 1)), e) : (typeof n == "object" && Object.values(n).slice(0, 32).forEach((t) => oo(t, e, r + 1)), e);
}
function Tp(n = "") {
  const e = /^\/Items\/([^/]+)(?:\/|$)/i.exec(String(n || ""));
  return e ? wt(e[1]) : "";
}
function vs(n = "") {
  const e = String(n || "").toLowerCase();
  return Vr.test(e) || jr.test(e) ? 0 : ht.test(e) ? 1 : pr.test(e) ? 2 : 3;
}
function Ap(n = {}, e = {}) {
  const { D1TidyExecutor: r, D1TidyPlanner: t, Logger: a, buildAdminReleaseVendorManifest: o, normalizeAdminReleaseVendorManifestRecord: s, validateAdminShellHtmlSource: i } = n;
  return {
    async createKvTidyPlanToken(c, l = {}, u = {}) {
      const d = String(c?.JWT_SECRET || "").trim();
      if (!d) {
        const g = /* @__PURE__ */ new Error("JWT_SECRET is required to sign the KV tidy plan");
        throw g.code = "SERVER_MISCONFIGURED", g.status = 503, g;
      }
      const f = Math.max(0, Math.floor(Number(u.nowMs ?? H()) / 1e3)), m = f + Math.max(60, Math.floor(Number(u.ttlMs) || 6e5) / 1e3), p = pa(JSON.stringify({
        version: 1,
        scope: "kv",
        planHash: String(l?.planHash || e.buildKvTidyPlanHash(l)).trim(),
        issuedAt: f,
        expiresAt: m
      }));
      return `${p}.${await ft(d, p)}`;
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
      if (f.slice(m + 1) !== await ft(d, p)) {
        const y = /* @__PURE__ */ new Error("KV tidy plan token signature is invalid");
        throw y.code = "TIDY_PLAN_INVALID", y.status = 409, y;
      }
      let g = null;
      try {
        g = JSON.parse(qr(p));
      } catch {
        g = null;
      }
      const h = Math.max(0, Math.floor(Number(u.nowMs ?? H()) / 1e3));
      if (!k(g) || g.version !== 1 || g.scope !== "kv" || !String(g.planHash || "").trim()) {
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
      const l = k(c?.schemaStatus) ? c.schemaStatus : {};
      return ie(ee({
        scope: "d1",
        mode: String(c?.mode || "manual"),
        maintenanceMode: String(c?.maintenanceMode || "smart"),
        nowMs: Number(c?.nowMs) || 0,
        retentionDays: Number(c?.retentionDays) || 0,
        retentionCutoffMs: Number(c?.retentionCutoffMs) || 0,
        utcOffsetMinutes: Number(c?.utcOffsetMinutes) || 0,
        scheduledNowMs: Number(c?.scheduledNowMs) || 0,
        dayWindow: k(c?.dayWindow) ? c.dayWindow : {},
        statsBucketDate: String(c?.statsBucketDate || ""),
        statsStartTs: Number(c?.statsStartTs) || 0,
        statsEndTs: Number(c?.statsEndTs) || 0,
        statsUtcOffsetMinutes: Number(c?.statsUtcOffsetMinutes) || 0,
        schemaStatus: {
          schemaReady: l.schemaReady === !0,
          tables: k(l.tables) ? l.tables : {},
          columns: k(l.columns) ? l.columns : {},
          indexes: k(l.indexes) ? l.indexes : {},
          constraints: k(l.constraints) ? l.constraints : {},
          ftsReady: l.ftsReady === !0,
          issues: Array.isArray(l.issues) ? l.issues : []
        },
        flags: k(c?.flags) ? c.flags : {},
        summary: k(c?.summary) ? c.summary : {},
        preview: k(c?.preview) ? c.preview : {},
        d1DnsIpPoolSources: Array.isArray(c?.d1DnsIpPoolSources) ? c.d1DnsIpPoolSources : []
      }));
    },
    async createD1TidyPlanToken(c, l = {}, u = {}) {
      const d = String(c?.JWT_SECRET || "").trim();
      if (!d) {
        const g = /* @__PURE__ */ new Error("JWT_SECRET is required to sign the D1 tidy plan");
        throw g.code = "SERVER_MISCONFIGURED", g.status = 503, g;
      }
      const f = Math.max(0, Math.floor(Number(u.issuedAtMs ?? H()) / 1e3)), m = f + Math.max(60, Math.floor(Number(u.ttlMs) || 6e5) / 1e3), p = pa(JSON.stringify({
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
      return `${p}.${await ft(d, p)}`;
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
      if (f.slice(m + 1) !== await ft(d, p)) {
        const y = /* @__PURE__ */ new Error("D1 tidy plan token signature is invalid");
        throw y.code = "TIDY_PLAN_INVALID", y.status = 409, y;
      }
      let g = null;
      try {
        g = JSON.parse(qr(p));
      } catch {
        g = null;
      }
      const h = Math.max(0, Math.floor(Number(u.nowMs ?? H()) / 1e3));
      if (!k(g) || g.version !== 1 || g.scope !== "d1" || !String(g.planHash || "").trim() || !(Number(g.planNowMs) > 0)) {
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
      const d = u.kv || e.getKV(c), f = await of(oe(u.config || {})), m = Math.max(1, Math.floor(Number(f?.kv?.write) || 0)), p = (Array.isArray(l) ? l : []).map((R) => ({
        type: String(R?.type || "put").trim().toLowerCase() === "delete" ? "delete" : "put",
        key: String(R?.key || "").trim()
      })).filter((R) => R.key), g = p.filter((R) => R.type === "put").length, h = p.filter((R) => R.type === "delete").length, y = d ? await e.captureRawKvEntries(d, p.map((R) => R.key)) : [], _ = y.filter((R) => R?.exists === !0).length, S = y.filter((R) => R?.exists !== !0).length, A = g + h + _ + S, b = {
        planClass: String(f?.planClass || "free").trim().toLowerCase() === "paid" ? "paid" : "free",
        planLabel: String(f?.planLabel || "").trim() || "FREE",
        periodLabel: String(f?.periodLabel || "").trim() || "今日",
        writeLimit: m,
        estimatedPutCount: g,
        estimatedDeleteCount: h,
        estimatedRollbackWriteCount: _,
        estimatedRollbackDeleteCount: S,
        estimatedWorstCaseWriteCount: A,
        blocked: A > m,
        reason: ""
      };
      return b.reason = b.blocked === !0 ? sf(b) : "", b;
    },
    async buildKvTidyPlan(c, l = {}) {
      const u = l.kv || e.getKV(c);
      if (!u) throw new Error("KV not configured");
      const d = (await e.listKvKeysStrict(u)).sort(), f = d.filter((Z) => Z.startsWith(e.ADMIN_INDEX_UPLOAD_PREFIX)), { rawStoredSummaryIndexText: m, storedSummaryIndexState: p, previousFullIndexBytes: g } = await e.readStoredNodesSummaryState(u), { nodeNames: h, removableKeys: y, untouchedOtherKeyCount: _, opsStatusKeyCount: S, dnsRecordHistoryKeyCount: A, dnsIpPoolSourceKeyCount: b, configMetaKeyCount: R, snapshotMetaKeyCount: T, nodeIndexMetaKeyCount: L, telegramAlertStateKeyCount: D, loginFailureKeyCount: E, dnsFetchLockKeyCount: w } = await e.classifyKvTidyKeys(u, d), N = await e.readRepairableRuntimeConfig(u), O = k(N.rawConfig) ? N.rawConfig : {}, C = Kd(O);
      let v = C.cleanedConfig;
      const B = [...C.migratedConfigKeys], P = await e.captureRawKvEntries(u, [
        e.CONFIG_KEY,
        e.NODES_INDEX_KEY,
        e.NODES_SUMMARY_INDEX_KEY
      ]), I = String(P.find((Z) => Z?.key === e.NODES_INDEX_KEY)?.value || ""), { nextTidyConfig: M, rewrittenNodes: x, fullEntityNodes: U, rewrittenNodeCount: G, deletedLegacyNodeFieldCount: K, migratedTopLevelPortNodeCount: $, migratedLinePortCount: V, migratedDefaultPortNodeCount: se, migratedDefaultPortLineCount: pe, rollbackKvEntries: me } = await e.collectKvTidyNodeMutations(u, h, v, P), le = ee(v) !== ee(M);
      le && (v = M, B.push("sourceDirectNodes"));
      const ye = await e.readRevisionMetaForRead(u, e.CONFIG_META_KEY), xe = {
        configRevision: String(ye?.revision || ""),
        configContentHash: ie(ee(O))
      }, Ge = d.includes(e.CONFIG_SNAPSHOTS_KEY), at = N.hadMalformedValue || ee(O) !== ee(v), It = zd(N.config, v), yr = e.collectUnreferencedAdminIndexUploadKeys(v, [], f);
      for (const Z of yr) y.add(Z);
      d.includes(e.CONFIG_SNAPSHOTS_KEY) && y.add(e.CONFIG_SNAPSHOTS_KEY), d.includes(e.CONFIG_SNAPSHOTS_META_KEY) && y.add(e.CONFIG_SNAPSHOTS_META_KEY);
      const _t = e.normalizeNodeSummaryIndex(U).nodes, Vt = e.normalizeNodeIndex(_t.map((Z) => Z?.name)), Sr = JSON.stringify(Vt), Mt = JSON.stringify(_t), Pt = new TextEncoder().encode(Mt).length, _r = g - Pt, Qr = e.buildLegacyConfigCacheKeys(N.config, v), Oe = [...y].sort(), xt = [.../* @__PURE__ */ new Set([...Qr, ...Oe])].filter(Boolean).sort(), je = [];
      at && je.push({
        type: "put",
        key: e.CONFIG_KEY,
        value: JSON.stringify(v)
      });
      for (const Z of x) je.push({
        type: "put",
        key: `${e.PREFIX}${Z.name}`,
        value: JSON.stringify(Z.data)
      });
      I !== Sr && je.push({
        type: "put",
        key: e.NODES_INDEX_KEY,
        value: Sr
      }), m !== Mt && je.push({
        type: "put",
        key: e.NODES_SUMMARY_INDEX_KEY,
        value: Mt
      });
      for (const Z of xt) je.push({
        type: "delete",
        key: Z,
        value: ""
      });
      const nt = await e.resolveKvTidyQuotaBudget(c, je, {
        kv: u,
        config: v
      }), Ot = {
        scannedKeyCount: d.length,
        preservedNodeKeyCount: h.length,
        rebuiltNodeCount: Vt.length,
        rewrittenNodeCount: G,
        configWasMalformed: N.hadMalformedValue,
        configReadSource: N.source,
        configRewritten: at,
        migratedConfigKeys: Jt(B),
        deletedLegacyFieldCount: C.deletedLegacyFieldCount + K,
        deletedLegacyConfigFieldCount: C.deletedLegacyFieldCount,
        deletedLegacyNodeFieldCount: K,
        migratedTopLevelPortNodeCount: $,
        migratedLinePortCount: V,
        migratedDefaultPortNodeCount: se,
        migratedDefaultPortLineCount: pe,
        deletedKeyCount: Oe.length,
        deletedCacheKeyCount: Oe.filter((Z) => Z === "sys:cf_dash_cache" || Z.startsWith("sys:cf_dash_cache:")).length,
        deletedScheduledLockKeyCount: Oe.filter((Z) => Z === e.LEGACY_SCHEDULED_LOCK_KEY).length,
        deletedLoginFailureKeyCount: E,
        deletedDnsIpPoolSourceKeyCount: b,
        deletedOpsStatusKeyCount: S,
        deletedTelegramAlertStateKeyCount: D,
        deletedDnsFetchLockKeyCount: w,
        deletedAdminIndexUploadCount: yr.length,
        untouchedOtherKeyCount: _,
        previousFullIndexBytes: g,
        nextSummaryIndexBytes: Pt,
        savedBytes: _r
      }, br = Gd({
        configFieldTargets: Ot.migratedConfigKeys,
        sourceDirectNodesFromLegacyNodes: le,
        migratedTopLevelPortNodeCount: $,
        migratedLinePortCount: V,
        migratedDefaultPortNodeCount: se,
        migratedDefaultPortLineCount: pe
      }), He = [], bt = Oe.filter((Z) => Z === "sys:cf_dash_cache" || Z.startsWith("sys:cf_dash_cache:")), vt = Oe.filter((Z) => Z.startsWith("fail:")), qt = Oe.filter((Z) => Z === e.LEGACY_DNS_IP_POOL_SOURCES_KEY), Ft = Oe.filter((Z) => Z === e.LEGACY_OPS_STATUS_KEY || Object.values(e.LEGACY_OPS_STATUS_SECTION_KEYS).includes(Z)), z = Oe.filter((Z) => Z === e.LEGACY_TELEGRAM_ALERT_STATE_KEY), j = Oe.filter((Z) => Z === e.LEGACY_SCHEDULED_LOCK_KEY), q = Oe.filter((Z) => Z.startsWith(dm)), Y = Oe.filter((Z) => Z.startsWith(e.ADMIN_INDEX_UPLOAD_PREFIX)), X = x.map((Z) => Z.name);
      Ee(He, bt.length > 0, "cf_dash_cache", "Cloudflare 仪表盘缓存", bt, bt.length, "会删除遗留的 sys:cf_dash_cache 及其按日期 / Zone 生成的缓存键。"), Ee(He, vt.length > 0, "login_failures", "旧版登录失败计数", vt, vt.length, "会删除旧版 fail:* 登录失败计数键，后续仅保留 D1 auth_failures。"), Ee(He, qt.length > 0, "dns_ip_pool_sources", "旧版 DNS IP 池源配置", qt, qt.length, "会删除旧版 sys:dns_ip_pool_sources:v1，后续只保留 D1 dns_ip_pool_sources。"), Ee(He, Ft.length > 0, "ops_status", "旧版运维状态键", Ft, Ft.length, "会删除 sys:ops_status:v1 与 sys:ops_status:*，后续只保留 D1 sys_status。"), Ee(He, z.length > 0, "telegram_alert_state", "旧版 Telegram 告警冷却状态", z, z.length, "会删除 sys:telegram_alert_state:v1，后续只保留 D1 sys_status scope。"), Ee(He, j.length > 0, "scheduled_lock", "旧版定时租约键", j, j.length, "会删除 sys:scheduled_lock:v1，后续只保留 D1 sys_locks。"), Ee(He, q.length > 0, "dns_fetch_lock", "旧版 DNS 抓取锁键", q, q.length, "会删除 sys:dns_ip_pool_fetch_lock:v1:*，后续只保留 D1 sys_locks。"), Ee(He, Ge || T > 0, "legacy_config_snapshot_keys", "停用的设置历史键", [e.CONFIG_SNAPSHOTS_KEY, e.CONFIG_SNAPSHOTS_META_KEY], Number(Ge) + +(T > 0), "会删除已停用的设置历史键及其元数据。"), Ee(He, Y.length > 0, "admin_index_uploads", "未引用的本地 HTML 版本", Y, Y.length, "只保留当前配置引用的内容寻址 index.html。");
      const ae = [];
      if (at && Ee(ae, !0, "runtime_config", "全局设置 sys:theme", [...C.legacyKeysPresent, ...It.map((Z) => Z.key)], 1, "会把旧版设置字段吸收到当前 schema，并以后端 sanitizeRuntimeConfig() 结果回写。"), G > 0) {
        const Z = [];
        $ > 0 && Z.push(`旧版顶层 node.port 节点 ${$} 个`), V > 0 && Z.push(`旧版 lines[].port 线路 ${V} 条`), se > 0 && Z.push(`隐式默认端口节点 ${se} 个`), pe > 0 && Z.push(`按协议补齐默认端口线路 ${pe} 条`), Ee(ae, !0, "node_entities", "节点实体 node:* 标准化重写", X, G, Z.length ? `会把端口并入 lines[].target，并移除旧版节点字段。${Z.join("，")}。` : "会移除旧版节点字段，并统一回写当前节点 schema。");
      }
      Ee(ae, !0, "node_indexes", "节点索引 / 节点摘要索引", [e.NODES_INDEX_KEY, e.NODES_SUMMARY_INDEX_KEY], 2, `会按当前 node:* 实体重新生成轻量 name 索引与节点摘要索引，并把旧镜像压缩收敛为摘要格式（${g} -> ${Pt} bytes，节省 ${_r} bytes）。`);
      const ge = [lt("node_entities_preserved", "node:* 节点实体", h, {
        count: h.length,
        note: "不会整批删除 node:*，只会按需重写必要节点。"
      })];
      A > 0 && Ee(ge, !0, "dns_record_history", "DNS 历史记录", d.filter((Z) => Z.startsWith(e.DNS_RECORD_HISTORY_PREFIX)), A, "不会删除 sys:dns_record_history:v1:*。");
      const $e = R + L;
      $e > 0 && Ee(ge, !0, "meta_keys", "配置 / 索引元信息", [e.CONFIG_META_KEY, e.NODES_INDEX_META_KEY], $e, "不会删除这些 revision / meta 键。");
      const Re = [];
      N.hadMalformedValue && Re.push(`检测到异常 sys:theme（来源: ${N.source}），整理时会按当前 schema 修复。`), $ > 0 && Re.push(`检测到 ${$} 个旧节点仍使用顶层 node.port；整理后会把端口并入 lines[].target。`), V > 0 && Re.push(`检测到 ${V} 条旧线路仍使用独立 lines[].port；整理后会把端口并入 lines[].target。`), (se > 0 || pe > 0) && Re.push(`检测到 ${se} 个节点 / ${pe} 条线路仍未显式写端口；整理后会按协议补齐为 :443 / :80。`), p?.legacyMirrorDetected === !0 && Re.push(`检测到旧版 sys:nodes_index_full:v2 仍保存完整节点镜像；本次会按 node:* 重建并收敛为摘要索引（${g} -> ${Pt} bytes）。`), _ > 0 && Re.push(`发现 ${_} 个未列入整理白名单的 KV 键，本次不会自动删除。`), He.length === 0 && !at && G === 0 && Re.push("当前没有检测到需要执行的 KV 清理动作；本次更多是一轮一致性巡检。"), Re.push(cf(nt)), nt.blocked === !0 && nt.reason && Re.push(nt.reason);
      const Ne = {
        scope: "kv",
        scannedKeys: d,
        config: v,
        nodesIndex: Vt,
        rebuiltNodeSummaries: _t,
        revisions: xe,
        summary: Ot,
        quotaBudget: nt,
        mutationPlan: je,
        preview: {
          scope: "kv",
          quotaBudget: nt,
          fieldGroups: br,
          deleteGroups: He,
          rewriteGroups: ae,
          preserveGroups: ge,
          warnings: Re
        }
      };
      return Ne.planHash = e.buildKvTidyPlanHash(Ne), Ne;
    },
    async applyKvTidyPlan(c, l = {}) {
      const u = l.kv || e.getKV(l.env);
      if (!u) throw new Error("KV not configured");
      const d = _e(u), f = Array.isArray(c?.mutationPlan) ? c.mutationPlan : [];
      try {
        await e.applyKvMutationsWithRollback(u, f);
      } catch (m) {
        throw ja(l.env), d.NodesListCache = null, d.NodesIndexCache = null, cr(u), ws(d), d.NodeCache.clear(), d.PlaybackRouteHotCache.clear(), m;
      }
      return ja(l.env), ws(d), d.NodeCache.clear(), d.PlaybackRouteHotCache.clear(), Array.isArray(c?.nodesIndex) && c.nodesIndex.length > 0 && (Gc(c.nodesIndex), jc(c.nodesIndex)), e.primeNodeSummaryCaches(Array.isArray(c?.rebuiltNodeSummaries) ? c.rebuiltNodeSummaries : [], u), d.NodesIndexCache = {
        data: Array.isArray(c?.nodesIndex) ? c.nodesIndex : [],
        exp: H() + 6e4
      }, e.buildTidyResult(c, { ...c?.summary || {} }, "kv", {
        config: c?.config || {},
        nodesIndex: Array.isArray(c?.nodesIndex) ? c.nodesIndex : []
      });
    },
    async tidyKvData(c, l = {}) {
      return await Sl(l.kv || e.getKV(c))(async () => {
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
function Cp(n = {}, e = {}) {
  const { D1TidyExecutor: r, D1TidyPlanner: t, Logger: a, buildAdminReleaseVendorManifest: o, normalizeAdminReleaseVendorManifestRecord: s, validateAdminShellHtmlSource: i } = n;
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
      const u = k(c) ? c : {}, d = k(u.d1Tidy) ? u.d1Tidy : {};
      return Xe(k(l) ? l : k(u.cleanup) ? u.cleanup : {}, d);
    },
    buildD1TidyStatusPayload(c = {}, l = {}) {
      const u = String(l.mode || c.mode || "manual").trim().toLowerCase() === "scheduled" ? "scheduled" : "manual", d = st(l.maintenanceMode || c.maintenanceMode, u), f = String(l.triggeredBy || (u === "scheduled" ? "scheduled" : "manual")).trim() || (u === "scheduled" ? "scheduled" : "manual"), m = String(l.timestamp || c.finishedAt || (/* @__PURE__ */ new Date()).toISOString()).trim() || (/* @__PURE__ */ new Date()).toISOString(), p = String(l.status || c.status || "success").trim() || "success", g = String(l.lastError || c.lastError || "").trim(), h = p === "failed" || p === "partial_failure", y = p === "skipped" || p === "deferred", _ = {
        status: p,
        lastSuccessAt: !h && !y ? m : "",
        lastSkippedAt: y ? m : "",
        lastErrorAt: h ? m : "",
        lastError: h ? g : "",
        lastTriggeredBy: f,
        mode: u,
        maintenanceMode: d
      }, S = Math.max(0, Number(c.logRetentionDays ?? c.retentionDays) || 0);
      return {
        d1Tidy: {
          ..._,
          retentionDays: S,
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
          ..._,
          retentionDays: S,
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
      const f = k(c?.preview) ? c.preview : e.createEmptyTidyPreview(u);
      return {
        ...d,
        summary: l,
        preview: f,
        quotaBudget: k(c?.quotaBudget) ? c.quotaBudget : k(f?.quotaBudget) ? f.quotaBudget : null,
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
      const f = l.schemaStatus?.schemaReady === !0 ? l.schemaStatus : await e.getD1SchemaReadiness(u, {
        allowAttestedFastPath: !0,
        env: c
      });
      if (f.schemaReady !== !0) {
        const T = e.createEmptyTidyPreview("d1");
        return T.warnings.push("D1 结构尚未通过运行时兼容检查；本预览不授权删除，必须先完成统一“初始化 DB”并重新预览。"), {
          scope: "d1",
          mode: "manual",
          maintenanceMode: st(l.maintenanceMode, "manual"),
          schemaStatus: f,
          flags: {},
          summary: {
            status: "blocked",
            schemaReady: !1,
            requiresSchemaInitialization: !0,
            issues: f.issues
          },
          preview: T,
          planHash: ""
        };
      }
      const m = oe(l.config || (c ? await Ce(c) : {})), p = t.buildContext(m, l), g = t.attachPreviousState(e, p, l.previousCleanupStatus);
      g.schemaStatus = f, g.logQueuePendingCount = tr.get(u).LogQueue.length;
      const h = await t.readFacts(e, u, d, g), y = t.buildSourcePolicy(h.d1DnsIpPoolSources), _ = t.buildFlags(e, g, h, y), S = t.buildSummary(g, h, y, _), A = f.schemaReady === !0;
      S.schemaReady = A, S.requiresSchemaInitialization = !A;
      const b = t.buildPreview(g, h, y, _);
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
        statsRetentionBoundaryDate: h.statsRetentionBoundaryDate,
        d1DnsIpPoolSources: h.d1DnsIpPoolSources,
        kvDnsIpPoolSources: h.kvDnsIpPoolSources,
        dnsIpPoolSourceAction: y.dnsIpPoolSourceAction,
        skipDnsIpPoolSourceCleanup: y.skipDnsIpPoolSourceCleanup,
        previousD1State: g.previousD1State,
        schemaStatus: f,
        flags: _,
        summary: S,
        preview: b
      };
      return R.planHash = e.buildD1TidyPlanHash(R), R;
    },
    async applyD1TidyPlan(c, l = {}) {
      const u = l.env, d = l.db || e.getDB(u), f = l.kv || e.getKV(u) || null;
      if (!d) throw new Error("D1 not configured");
      const m = l.schemaStatus?.schemaReady === !0 ? l.schemaStatus : c?.schemaStatus?.schemaReady === !0 ? c.schemaStatus : await e.getD1SchemaReadiness(d, {
        allowAttestedFastPath: !0,
        env: u
      });
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
      }), g = String(p?.mode || l.mode || "manual").trim().toLowerCase() === "scheduled" ? "scheduled" : "manual", h = st(p?.maintenanceMode || l.maintenanceMode, g), y = k(p?.flags) ? p.flags : {}, _ = typeof l.beforeEachStep == "function" ? l.beforeEachStep : async () => {
      }, S = {
        kv: f,
        db: d
      }, A = g === "scheduled", b = r.createSummary(p, g, y);
      b.maintenanceMode = h;
      let R = !1;
      const T = (C, v, B, P) => {
        const I = B?.message || String(B);
        if (C && (b[C] = "failed"), v && (b[v] = I), b.lastError = I, b.status = b.status === "failed" ? "failed" : "partial_failure", console.error(`${P}: `, B), !A) throw B;
        return !1;
      }, L = tr.get(d);
      L.LogFlushTask && await Promise.resolve(L.LogFlushTask).catch(() => {
      });
      const D = H(), E = r.buildDeleteScopes(e, p, y, d), w = await r.runBudgetedDeleteScopes(E, b, _, { startedAt: D });
      if (b.hasMore = w.hasMore, b.remainingScopes = w.remainingScopes, b.budget = w.budget, R = w.budget.processedRows > 0, y.rebuildStatsHourly === !0 && H() - D < xr) try {
        await _("resetStatsHourly"), await e.clearStatsHourly(d), b.alignedStatsWindow = !0, b.statsAlignStatus = "success", b.statsRebuildStatus = "reset_for_new_logs", R = !0;
      } catch (C) {
        T("statsRebuildStatus", "statsRebuildError", C, "D1 stats reset Error");
      }
      else
        b.statsAlignStatus = y.rebuildStatsHourly === !0 ? "deferred_budget" : "skipped", b.statsRebuildStatus = y.rebuildStatsHourly === !0 ? "deferred_budget" : "skipped";
      const N = () => H() - D < xr;
      if (y.rebuildLogsFtsDeferred === !0) b.ftsRebuildStatus = y.ftsRebuildDeferredReason || "deferred_size_guard";
      else if (y.rebuildLogsFts === !0 && (b.hasMore || !N())) b.ftsRebuildStatus = "deferred_budget";
      else if (y.rebuildLogsFts === !0) try {
        await _("rebuildLogsFts");
        let C = !1;
        await e.hasLogsFtsTable(d) ? C = await e.rebuildLogsFts(d) : C = (await e.ensureLogsFtsSchema(d)).rebuilt === !0, b.rebuiltLogsFts = C === !0, b.ftsRebuildStatus = C === !0 ? "success" : "skipped", b.lastFtsRebuildAt = (/* @__PURE__ */ new Date()).toISOString(), R = R || C === !0;
      } catch (C) {
        T("ftsRebuildStatus", "ftsRebuildError", C, "D1 logs FTS rebuild Error");
      }
      if (y.optimizeDb === !0 && !b.hasMore && N()) try {
        await _("optimizeLogsDb"), await e.optimizeLogsDb(d), b.optimizedDb = !0, b.optimizeStatus = "success", b.lastOptimizeAt = (/* @__PURE__ */ new Date()).toISOString(), R = !0;
      } catch (C) {
        T("optimizeStatus", "optimizeError", C, g === "scheduled" ? "Scheduled DB optimize Error" : "D1 optimize Error");
      }
      else y.optimizeDb === !0 && (b.optimizeStatus = "deferred_budget");
      b.budget.durationMs = Math.max(0, H() - D), b.budget.durationMs >= xr && !b.budget.exhaustedBy && (b.budget.exhaustedBy = "time_limit"), await _("patchLogStatus");
      const O = await r.patchLogStatus(e, d, S, p, b, y, l);
      if (b.status !== "partial_failure" && b.status !== "failed") if (b.hasMore)
        b.status = "success", b.reason = "maintenance_budget_exhausted";
      else if (g === "scheduled") {
        const C = y.rebuildLogsFtsDeferred === !0 || y.optimizeDbDeferred === !0;
        R ? b.status = "success" : (b.status = "skipped", b.reason = C ? "maintenance_deferred" : "no_expired_data");
      } else b.status = "success";
      return b.finishedAt = O, e.buildTidyResult(p, b, "d1");
    },
    async tidyD1Data(c, l = {}) {
      const u = String(l.mode || "manual").trim().toLowerCase() === "scheduled" ? "scheduled" : "manual", d = st(l.maintenanceMode, u), f = l.db || e.getDB(c);
      if (!f) throw new Error("D1 not configured");
      if (u === "manual") {
        const g = await e.verifyD1TidyPlanToken(c, l.planToken), h = await e.getD1SchemaReadiness(f, {
          allowAttestedFastPath: !0,
          env: c
        });
        if (h.schemaReady !== !0) {
          const _ = /* @__PURE__ */ new Error("D1 schema changed after preview; initialize and preview again");
          throw _.code = "TIDY_PLAN_STALE", _.status = 409, _.details = {
            reason: "schema_changed",
            issues: h.issues
          }, _;
        }
        const y = await e.buildD1TidyPlan(c, {
          ...l,
          db: f,
          mode: u,
          maintenanceMode: st(g.maintenanceMode, u),
          nowMs: Number(g.planNowMs),
          scheduledNow: new Date(Number(g.scheduledNowMs) || Number(g.planNowMs)),
          statsBucketDate: String(g.statsBucketDate || ""),
          statsStartTs: Number(g.statsStartTs) || 0,
          statsEndTs: Number(g.statsEndTs) || 0,
          statsUtcOffsetMinutes: Number(g.statsUtcOffsetMinutes) || 0,
          schemaStatus: h
        });
        if (String(y.planHash || "") !== String(g.planHash || "")) {
          const _ = /* @__PURE__ */ new Error("D1 tidy data changed after preview");
          throw _.code = "TIDY_PLAN_STALE", _.status = 409, _.details = {
            reason: "plan_changed",
            previewPlanHash: String(g.planHash || ""),
            currentPlanHash: String(y.planHash || "")
          }, _;
        }
        return {
          ...await e.applyD1TidyPlan(y, {
            ...l,
            db: f,
            env: c,
            mode: u,
            maintenanceMode: y.maintenanceMode,
            schemaStatus: h
          }),
          schema: h
        };
      }
      const m = await e.getD1SchemaReadiness(f, {
        allowAttestedFastPath: !0,
        env: c
      });
      if (m.schemaReady !== !0) {
        const g = /* @__PURE__ */ new Error("D1 schema is not initialized");
        throw g.code = "D1_SCHEMA_NOT_READY", g.status = 409, g.details = { issues: m.issues }, g;
      }
      const p = l.plan || await e.buildD1TidyPlan(c, {
        ...l,
        db: f,
        mode: u,
        maintenanceMode: d,
        schemaStatus: m
      });
      return {
        ...await e.applyD1TidyPlan(p, {
          ...l,
          db: f,
          env: c,
          schemaStatus: m
        }),
        schema: m
      };
    },
    shouldRunLogsOptimize(c, l = {}) {
      const u = Number(l.nowMs) || H(), d = Math.max(0, Number(l.minIntervalMs) || F.Defaults.LogVacuumMinIntervalMs);
      if (l.force === !0) return !0;
      const f = typeof c == "string" ? new Date(c).getTime() : NaN;
      return Number.isFinite(f) ? u - f >= d : !0;
    },
    shouldRunLogsFtsRebuild(c, l = {}) {
      return e.shouldRunLogsOptimize(c, {
        ...l,
        minIntervalMs: Math.max(0, Number(l.minIntervalMs) || F.Defaults.LogFtsRebuildMinIntervalMs)
      });
    },
    async optimizeLogsDb(c) {
      return c ? (await c.prepare("PRAGMA optimize").run(), !0) : !1;
    }
  };
}
function wp(n = {}, e = {}) {
  const { D1TidyExecutor: r, D1TidyPlanner: t, Logger: a, buildAdminReleaseVendorManifest: o, normalizeAdminReleaseVendorManifestRecord: s, validateAdminShellHtmlSource: i } = n;
  return {
    async readLegacyConfigSnapshotRecordsStrict(c) {
      if (!c) return [];
      const l = await Me(c, e.CONFIG_SNAPSHOTS_KEY, { type: "json" });
      if (l == null) return [];
      if (Array.isArray(l)) return l;
      const u = /* @__PURE__ */ new Error("Stored legacy config snapshot records are invalid");
      throw u.code = "CONFIG_SNAPSHOTS_INVALID", u.status = 409, u;
    },
    buildAdminIndexUploadKey(c = "") {
      const l = Tt(c);
      return l ? `${e.ADMIN_INDEX_UPLOAD_PREFIX}${l}` : "";
    },
    normalizeAdminIndexUploadRecord(c = {}, l = "") {
      if (!k(c)) return null;
      const u = Tt(c.revision), d = Tt(l);
      if (!u || d && u !== d) return null;
      const f = Gr(u), m = Ro(u), p = String(c.html || "");
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
      if (!u || await vn(u.html) !== u.revision) return null;
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
      return c ? e.validateAdminIndexUploadRecord(await Me(c, e.ADMIN_ACTIVE_INDEX_KEY, { type: "json" })) : null;
    },
    async getAdminIndexUploadRecord(c, l = "") {
      const u = e.buildAdminIndexUploadKey(l);
      if (!c || !u) return null;
      const d = await e.validateAdminIndexUploadRecord(await Me(c, u, { type: "json" }), l);
      return d || e.validateAdminIndexUploadRecord(await Me(c, e.ADMIN_ACTIVE_INDEX_KEY, { type: "json" }), l);
    },
    collectReferencedAdminIndexUploadRevisions(c = {}, l = []) {
      const u = /* @__PURE__ */ new Set(), d = (f) => {
        const m = et(f?.indexUrl || "");
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
        const p = Tt(m.slice(e.ADMIN_INDEX_UPLOAD_PREFIX.length));
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
      return await Qt(d)(async () => {
        const p = e.buildAdminIndexUploadKey(m.revision), g = await Me(d, p, { type: "json" }), h = await Me(d, e.ADMIN_ACTIVE_INDEX_KEY, { type: "json" });
        let y = e.normalizeAdminIndexUploadRecord(g, m.revision);
        y && await vn(y.html) !== m.revision && (y = null);
        const _ = y || m;
        y || await d.put(p, JSON.stringify(m)), await d.put(e.ADMIN_ACTIVE_INDEX_KEY, JSON.stringify(_));
        try {
          const S = u ? await fe(u) : oe(await Me(d, e.CONFIG_KEY, { type: "json" }) || {});
          return {
            config: await e.commitRuntimeConfig({
              ...S,
              indexUrl: _.sourceUrl
            }, {
              env: u,
              kv: d,
              ctx: f
            }),
            previousConfig: S,
            record: _
          };
        } catch (S) {
          throw await he(h ? d.put(e.ADMIN_ACTIVE_INDEX_KEY, JSON.stringify(h)) : d.delete(e.ADMIN_ACTIVE_INDEX_KEY), "admin.active_index_upload_rollback", { revision: m.revision }, null), y || await he(g ? d.put(p, JSON.stringify(g)) : d.delete(p), "admin.local_index_upload_rollback", { revision: m.revision }, null), S;
        }
      });
    },
    async rollbackAdminIndexUploadActivation(c = {}, l = {}, u = {}) {
      const { env: d, kv: f, ctx: m } = u;
      if (!f) {
        const p = /* @__PURE__ */ new Error("KV namespace is required to roll back the local admin index");
        throw p.code = "KV_NOT_CONFIGURED", p.status = 503, p;
      }
      return await Qt(f)(async () => {
        const p = d ? await fe(d) : oe(await Me(f, e.CONFIG_KEY, { type: "json" }) || {}), g = et(l?.indexUrl || ""), h = et(p?.indexUrl || "");
        if (!g || h !== g) return {
          config: p,
          skipped: !0,
          reason: h ? "superseded_by_newer_admin_index" : "admin_index_already_restored"
        };
        const y = et(c?.indexUrl || ""), _ = await Me(f, e.ADMIN_ACTIVE_INDEX_KEY, { type: "json" }), S = y ? await e.getAdminIndexUploadRecord(f, y) : null;
        S ? await f.put(e.ADMIN_ACTIVE_INDEX_KEY, JSON.stringify(S)) : await f.delete(e.ADMIN_ACTIVE_INDEX_KEY);
        try {
          return {
            config: await e.commitRuntimeConfig({
              ...p,
              indexUrl: y ? Gr(y) : ""
            }, {
              env: d,
              kv: f,
              ctx: m
            }),
            skipped: !1,
            reason: ""
          };
        } catch (A) {
          throw await he(_ ? f.put(e.ADMIN_ACTIVE_INDEX_KEY, JSON.stringify(_)) : f.delete(e.ADMIN_ACTIVE_INDEX_KEY), "admin.active_index_rollback_restore", { revision: g }, null), A;
        }
      });
    },
    async captureRuntimeConfigRollbackState(c, l) {
      if (!l) return {
        config: oe(c ? await Ce(c) : {}),
        kvEntries: []
      };
      const u = c ? await fe(c) : oe(await Me(l, e.CONFIG_KEY, { type: "json" }) || {}), d = [
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
      const u = l.kv, d = oe(c?.config || {});
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
      return ja(l.env), l.env ? await Ce(l.env) : d;
    },
    async restoreCapturedRuntimeConfigAndDnsState(c = {}, l = {}) {
      const u = oe(c?.config || {});
      let d = null, f = null, m = u;
      try {
        await e.commitRuntimeConfig(u, {
          env: l.env,
          kv: l.kv,
          ctx: l.ctx
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
        const p = new Error([d ? `dns:${ce(d, "restore_failed")}` : "", f ? `kv:${ce(f, "restore_failed")}` : ""].filter(Boolean).join("; "));
        throw p.code = "CONFIG_DNS_RESTORE_FAILED", p.status = 500, p.details = {
          dnsRestoreError: d ? ce(d, "restore_failed") : "",
          kvRestoreError: f ? ce(f, "restore_failed") : ""
        }, p;
      }
      return m;
    }
  };
}
function Lp(n = {}, e = {}) {
  const { D1TidyExecutor: r, D1TidyPlanner: t, Logger: a, buildAdminReleaseVendorManifest: o, normalizeAdminReleaseVendorManifestRecord: s, validateAdminShellHtmlSource: i } = n;
  return {
    async persistRuntimeConfig(c, l = {}) {
      return await Qt(l.kv || La(l.env))(() => e.commitRuntimeConfig(c, {
        ...l,
        forceKvCommit: !0
      }));
    },
    async prepareRuntimeConfigPersistence(c, l = {}) {
      const { env: u, kv: d, ctx: f } = l;
      if (!d) {
        const y = /* @__PURE__ */ new Error("KV namespace is required to persist runtime config");
        throw y.code = "KV_NOT_CONFIGURED", y.status = 503, y;
      }
      ou(c?.defaultHostPrefixCnameTarget);
      const m = u ? await fe(u) : oe(await Me(d, e.CONFIG_KEY, { type: "json" }) || {}), p = oe(c);
      fu(c), mu(p, u);
      const g = Ve(u), h = Wa(null, m, g) !== Wa(null, p, g) ? (await e.loadAllNodeEntitiesFromKvStrict(d, { ctx: f })).filter((y) => Ze(y?.entryMode) && !Wt(y?.hostPrefixCnameTarget)) : [];
      return h.length > 0 && ia(p, u), {
        prevConfig: m,
        nextConfig: p,
        configuredHost: g,
        dnsPlans: h.map((y) => e.buildHostPrefixDnsSyncPlan(y.name, y, y.name, y, g, {
          previousConfig: m,
          nextConfig: p
        })).filter((y) => y.changed === !0),
        ctx: f,
        kv: d,
        env: u
      };
    },
    async buildRuntimeConfigMutationPlan(c, l, u) {
      const d = await e.readLegacyConfigSnapshotRecordsStrict(c), f = e.normalizeRevisionMeta(Vn(u)), m = [
        {
          type: "delete",
          key: e.CONFIG_SNAPSHOTS_KEY,
          value: ""
        },
        {
          type: "delete",
          key: e.CONFIG_SNAPSHOTS_META_KEY,
          value: ""
        },
        {
          type: "put",
          key: e.CONFIG_KEY,
          value: JSON.stringify(u)
        },
        {
          type: "put",
          key: e.CONFIG_META_KEY,
          value: JSON.stringify(f)
        }
      ];
      for (const h of e.buildLegacyConfigCacheKeys(l, u)) m.push({
        type: "delete",
        key: h,
        value: ""
      });
      const p = e.collectReferencedAdminIndexUploadRevisions(l, d), g = e.collectReferencedAdminIndexUploadRevisions(u, []);
      for (const h of p)
        g.has(h) || m.push({
          type: "delete",
          key: e.buildAdminIndexUploadKey(h),
          value: ""
        });
      return m;
    },
    async commitRuntimeConfig(c, l = {}) {
      const { prevConfig: u, nextConfig: d, configuredHost: f, dnsPlans: m, ctx: p, kv: g, env: h } = await e.prepareRuntimeConfigPersistence(c, l);
      if (Bd(l.expectedConfigRevision, u), ee(u) === ee(d))
        return await e.ensureConfigMeta(g, d, { ctx: p }), d;
      const y = [];
      let _ = null, S = !1;
      try {
        for (const b of m)
          _ = b, await e.persistHostPrefixDnsSyncPlan(b, {
            env: h,
            kv: g,
            ctx: p,
            config: d,
            requestHost: f
          }), y.push(b), _ = null;
        S = !0;
        const A = await e.buildRuntimeConfigMutationPlan(g, u, d);
        return await e.applyKvMutationsWithRollback(g, A), h ? Gu(h, d) : ja(), await e.invalidateDashboardSnapshotCacheForConfigChange(h, {
          prevConfig: u,
          nextConfig: d
        }), d;
      } catch (A) {
        const b = [], R = _ ? [...y, _] : y;
        for (let T = R.length - 1; T >= 0; T -= 1) try {
          await e.persistHostPrefixDnsSyncPlan({ steps: R[T].rollbackSteps }, {
            env: h,
            kv: g,
            ctx: p,
            config: d,
            requestHost: f,
            skipHistory: !0
          });
        } catch (L) {
          b.push(ce(L, "dns_rollback_failed"));
        }
        if (A && typeof A == "object") {
          const T = Array.isArray(A?.details?.rollbackConflicts) ? A.details.rollbackConflicts : [], L = Array.isArray(A?.details?.rollbackFailures) ? A.details.rollbackFailures : [];
          A.details = {
            ...k(A.details) ? A.details : {},
            hostPrefixDnsSyncAttempted: m.length > 0,
            hostPrefixDnsSyncedCount: y.length,
            failedHostPrefixDnsHost: String(_?.nextDnsHost || _?.previousDnsHost || ""),
            rollbackAttempted: R.length > 0 || S,
            rollbackSucceeded: b.length === 0 && T.length === 0 && L.length === 0,
            rollbackError: [...b, ...L].join("; "),
            rollbackConflicts: T
          };
        }
        throw A;
      }
    },
    async commitSourceDirectNodesConfigWithinMutation(c, l, u, d = {}) {
      if (!l) return null;
      const f = c ? await fe(c) : oe(await l.get(e.CONFIG_KEY, { type: "json" }) || {}), m = mt(f.sourceDirectNodes || []), p = Yn(m, {
        renameMap: d.renameMap,
        removedNames: d.removedNames,
        allowedNames: d.allowedNames
      });
      return ee(m) === ee(p) ? f : e.commitRuntimeConfig({
        ...f,
        sourceDirectNodes: p
      }, {
        env: c,
        kv: l,
        ctx: u
      });
    },
    async commitSingleNodeMainVideoStreamShortcutShadowWithinMutation(c, l, u, d = {}) {
      if (!l) return null;
      const f = c ? await fe(c) : oe(await l.get(e.CONFIG_KEY, { type: "json" }) || {}), m = String(d.originalName || "").trim().toLowerCase(), p = String(d.nodeName || "").trim().toLowerCase(), g = on(d.mode);
      let h = mt(f.sourceDirectNodes || []);
      return m && m !== p && (h = Yn(h, { renameMap: { [m]: p } })), h = h.filter((y) => String(y || "").trim().toLowerCase() !== p), p && g === "direct" && h.push(p), h = mt(h), ee(f.sourceDirectNodes || []) === ee(h) ? f : e.commitRuntimeConfig({
        ...f,
        sourceDirectNodes: h
      }, {
        env: c,
        kv: l,
        ctx: u
      });
    }
  };
}
function Dp(n = {}, e = {}) {
  const { D1TidyExecutor: r, D1TidyPlanner: t, Logger: a, buildAdminReleaseVendorManifest: o, normalizeAdminReleaseVendorManifestRecord: s, validateAdminShellHtmlSource: i } = n;
  return {
    async sendTelegramMessage({ tgBotToken: c, tgChatId: l, text: u }) {
      const d = String(c || "").trim(), f = String(l || "").trim();
      if (!d || !f) throw new Error("请先完善 Telegram Bot Token 和 Chat ID 配置");
      const m = await Pe(await We(`https://api.telegram.org/bot${d}/sendMessage`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          chat_id: f,
          text: String(u || "")
        })
      }), nn);
      if (m.exceeded) throw new Error("Telegram API response too large");
      const p = JSON.parse(m.text);
      if (!p.ok) throw new Error(p.description || "Telegram API 返回错误");
      return p;
    },
    async buildDailyTelegramSummaryPayload(c, l = {}) {
      const u = oe(l?.config || await fe(c)), d = l?.now instanceof Date ? new Date(l.now.getTime()) : new Date(l?.now || /* @__PURE__ */ new Date()), f = l?.dayWindow && typeof l.dayWindow == "object" ? l.dayWindow : pt(d, u.scheduleUtcOffsetMinutes), [m, p] = await Promise.all([e.buildDashboardStatsPayload(c, {
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
      const f = await d.get(e.CONFIG_KEY, { type: "json" }) || {}, m = oe(f), p = String(m.tgBotToken || "").trim(), g = String(m.tgChatId || "").trim();
      if (!p || !g) throw new Error("请先完善 Telegram Bot Token 和 Chat ID 配置");
      const h = l?.now instanceof Date ? new Date(l.now.getTime()) : new Date(l?.now || /* @__PURE__ */ new Date()), y = pt(h, m.scheduleUtcOffsetMinutes), _ = Pi(m, f, {
        reportKinds: l?.reportKinds,
        fallbackAllWhenLegacy: !0
      });
      if (!_.length) throw new Error("请先至少启用一个日报类型");
      const S = _.includes("summary") ? await e.buildDailyTelegramSummaryPayload(c, {
        config: m,
        now: h,
        dayWindow: y
      }) : null, A = _.some((R) => R !== "summary") ? await e.getCloudflareRuntimeQuotaStatus(c, {
        config: m,
        db: u
      }) : null, b = [];
      for (const R of _) {
        const T = ff(R, R === "summary" ? S : A?.[R], y);
        await e.sendTelegramMessage({
          tgBotToken: p,
          tgChatId: g,
          text: T
        }), b.push({
          kind: R,
          text: T
        });
      }
      return {
        success: b.length > 0,
        sentCount: b.length,
        reportKinds: _,
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
      const f = oe(await Ce(c)), m = u && typeof u == "object" ? u : {}, p = String(f.tgBotToken || "").trim(), g = String(f.tgChatId || "").trim();
      if (!p || !g) return {
        sent: !1,
        reason: "telegram_not_configured"
      };
      const h = ue(f.tgAlertDroppedBatchThreshold, F.Defaults.TgAlertDroppedBatchThreshold, 0, 5e3), y = ue(f.tgAlertFlushRetryThreshold, F.Defaults.TgAlertFlushRetryThreshold, 0, 10), _ = ue(f.tgAlertCooldownMinutes, F.Defaults.TgAlertCooldownMinutes, 1, 1440), S = f.tgAlertOnScheduledFailure === !0, A = f.tgAlertKvUsageEnabled === !0, b = f.tgAlertD1UsageEnabled === !0, R = ue(f.tgAlertKvUsageThresholdPercent, F.Defaults.TgAlertKvUsageThresholdPercent, 1, 100), T = ue(f.tgAlertD1UsageThresholdPercent, F.Defaults.TgAlertD1UsageThresholdPercent, 1, 100);
      if (h <= 0 && y <= 0 && !S && !A && !b) return {
        sent: !1,
        reason: "thresholds_disabled"
      };
      const L = await e.getOpsStatus(c), D = L && typeof L.log == "object" ? L.log : {}, E = l && typeof l == "object" && Object.keys(l).length ? l : L && typeof L.scheduled == "object" ? L.scheduled : {}, w = [], N = Number(D.lastDroppedBatchSize) || 0;
      h > 0 && N >= h && w.push({
        code: "log_drop",
        message: `日志刷盘疑似丢弃批次：${N} 条（阈值 ${h}）`,
        eventAt: D.lastFlushErrorAt || D.lastOverflowAt || D.updatedAt || L.updatedAt || ""
      });
      const O = Number(D.lastFlushRetryCount) || 0;
      y > 0 && O >= y && w.push({
        code: "log_retry",
        message: `D1 写入重试次数偏高：${O} 次（阈值 ${y}）`,
        eventAt: D.lastFlushAt || D.lastFlushErrorAt || D.updatedAt || L.updatedAt || ""
      });
      const C = String(E.status || "").toLowerCase();
      if (S && (C === "failed" || C === "partial_failure")) {
        const U = [];
        for (const [G, K] of Object.entries({
          cleanup: "日志清理",
          tgDailyReport: "每日报表",
          alerts: "异常告警"
        })) {
          const $ = E?.[G];
          if (!$ || typeof $ != "object") continue;
          const V = String($.status || "").trim(), se = String($.lastError || "").trim();
          !se && V !== "failed" && V !== "partial_failure" || U.push(`${K}：${V || "failed"}${se ? `，错误：${se}` : ""}`);
        }
        w.push({
          code: "scheduled_failure",
          message: U.length ? `定时任务状态异常：${U.join("；")}` : `定时任务状态异常：${E.status}${E.lastError ? `，错误：${E.lastError}` : ""}`,
          eventAt: E.lastFinishedAt || E.lastErrorAt || E.updatedAt || L.updatedAt || ""
        });
      }
      if (A || b) {
        const U = await e.getCloudflareRuntimeQuotaStatus(c, {
          config: f,
          db: d
        }), G = [{
          enabled: A,
          threshold: R,
          code: "cf_kv_usage",
          title: "KV",
          card: U?.kv
        }, {
          enabled: b,
          threshold: T,
          code: "cf_d1_usage",
          title: "D1",
          card: U?.d1
        }];
        for (const K of G) {
          if (K.enabled !== !0) continue;
          const $ = K.card && typeof K.card == "object" ? K.card : {}, V = String($.status || "").trim().toLowerCase();
          if (V !== "success" && V !== "partial_failure") continue;
          const se = (Array.isArray($.metrics) ? $.metrics : []).filter((me) => Number(me?.percent) >= K.threshold);
          if (!se.length) continue;
          const pe = se.map((me) => `${String(me?.key || "").trim()}:${String(me?.percentText || "").trim()}`).filter(Boolean).join(",");
          w.push({
            code: K.code,
            message: uf(K.title, $, K.threshold, se),
            eventAt: `${String($.resourceLabel || K.title || "").trim()}|${String($.planLabel || "").trim()}|${String($.periodLabel || "").trim()}|${pe}|${V}`
          });
        }
      }
      if (!w.length) return {
        sent: !1,
        reason: "no_alerts"
      };
      const v = JSON.stringify(w.map((U) => ({
        code: U.code,
        eventAt: U.eventAt,
        message: U.message
      }))), B = await e.getOpsStatusPayloadFromDb(d, e.TELEGRAM_ALERT_STATE_DB_SCOPE), P = Date.now(), I = _ * 60 * 1e3;
      if (m.ignoreCooldown !== !0 && B && B.signature === v && Number(B.sentAtMs) > 0 && P - Number(B.sentAtMs) < I) return {
        sent: !1,
        reason: "cooldown_active"
      };
      const M = Ol(/* @__PURE__ */ new Date(), f.scheduleUtcOffsetMinutes), x = [
        "⚠️ Emby Proxy 运行时异常告警",
        "",
        ...w.map((U) => `- ${U.message}`),
        "",
        `时间：${M.dateKey} ${M.clockTime} (${M.offsetLabel})`,
        "#Emby #Alert"
      ];
      return await e.sendTelegramMessage({
        tgBotToken: p,
        tgChatId: g,
        text: x.join(`
`)
      }), m.persistState !== !1 && (await e.putOpsStatusPayloadToDb(d, e.TELEGRAM_ALERT_STATE_DB_SCOPE, {
        signature: v,
        sentAt: new Date(P).toISOString(),
        sentAtMs: P,
        issues: w
      }, P) || Fe("telegram_alert_state.write_failed", /* @__PURE__ */ new Error("telegram alert cooldown state not persisted"), { issueCount: w.length })), {
        sent: !0,
        issueCount: w.length,
        reason: "alert_sent"
      };
    }
  };
}
function Np(n = {}, e = {}) {
  return {
    ...Ap(n, e),
    ...Cp(n, e),
    ...wp(n, e),
    ...Lp(n, e),
    ...Dp(n, e)
  };
}
var Ip = class {
  constructor({ logger: n, service: e }) {
    this.logger = n, this.service = e;
  }
  handle(n, e, r) {
    if (!r || typeof r.waitUntil != "function") throw new TypeError("ScheduledMaintenanceFacade.handle requires ctx.waitUntil");
    const t = this.#y(n, e, r);
    r.waitUntil(t);
  }
  #e(n = {}, ...e) {
    for (const r of e) {
      if (!r) continue;
      const t = n?.[r];
      if (k(t)) return t;
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
    const r = String(e || n?.localDateKey || "");
    return r ? {
      ...n,
      localDateKey: r,
      executedSlots: At(n?.executedSlots || [], [])
    } : {
      ...n,
      executedSlots: At(n?.executedSlots || [], [])
    };
  }
  #n(n = {}, e = "", r = "") {
    return this.#o({
      ...n,
      executedSlots: [...n?.executedSlots || [], r]
    }, e);
  }
  #s(n = "", e = []) {
    const r = e[e.length - 1] || "";
    return {
      processedSlots: e,
      lastPlannedSlot: r ? `${n} ${r}` : "",
      reason: e.length > 1 ? "clock_slots_processed" : "clock_slot_processed"
    };
  }
  #t(n = {}, e = "", r = "", t = {}) {
    return {
      ...n,
      status: "skipped",
      lastSkippedAt: e,
      reason: r,
      ...t
    };
  }
  #u(n = {}, e = "", r = {}) {
    return {
      ...n,
      status: "pending",
      reason: e,
      ...r
    };
  }
  #i(n = {}, e = "", r = {}) {
    return {
      ...n,
      status: "success",
      lastSuccessAt: e,
      ...r
    };
  }
  #r(n = {}, e = "", r = "", t = {}) {
    return {
      ...n,
      status: "failed",
      lastErrorAt: e,
      lastError: r,
      ...t
    };
  }
  #d(n = {}, e = {}, r = {}) {
    const t = k(e) ? e : {}, a = k(r.extra) ? r.extra : {};
    return t.status === "success" ? this.#i(n, String(t.lastSuccessAt || r.at || "").trim(), {
      ...t,
      ...a
    }) : t.status === "failed" ? this.#r(n, String(t.lastErrorAt || r.at || "").trim(), String(t.lastError || r.error || "").trim(), {
      ...t,
      ...a
    }) : this.#t(n, String(t.lastSkippedAt || r.at || "").trim(), String(t.reason || r.defaultReason || "").trim(), {
      ...t,
      ...a
    });
  }
  #l(n = "") {
    return async (e, r, t = null, a = null) => {
      try {
        return await e;
      } catch (o) {
        return this.logger.error(`scheduled.${r}`, o, {
          leaseToken: n,
          ...k(t) ? t : {}
        }), a;
      }
    };
  }
  #c(n, e, r) {
    return { scheduled: {
      lastSkippedAt: n,
      lastSkipReason: r,
      lock: {
        status: "busy",
        reason: r,
        expiresAt: e.lock?.expiresAt || null,
        backend: String(e?.backend || e?.lock?.backend || "").trim() || "d1"
      }
    } };
  }
  #m(n, e, r = "d1") {
    const t = String(e || "scheduled_skipped").trim() || "scheduled_skipped";
    return { scheduled: {
      status: "skipped",
      lastSkippedAt: n,
      lastSkipReason: t,
      lastFinishedAt: n,
      lock: {
        status: "skipped",
        reason: t,
        backend: String(r || "").trim() || "d1"
      }
    } };
  }
  #p(n, e, r, t) {
    return { scheduled: {
      status: "running",
      lastStartedAt: n,
      lock: {
        status: "held",
        token: e,
        expiresAt: r.lock?.expiresAt || H() + t
      }
    } };
  }
  #g(n, e, r) {
    return n.lostReason ? {
      status: "lost",
      reason: n.lostReason,
      lastCheckedAt: e
    } : {
      status: r ? "released" : "release_skipped",
      releasedAt: e
    };
  }
  #h({ leaseStores: n, leaseToken: e, scheduledLeaseMs: r, leaseBackend: t = "", initialLock: a = null }) {
    const o = {
      active: !0,
      lostReason: null,
      lock: a
    }, s = async () => {
      if (!o.active) return null;
      const l = await this.service.renewScheduledLease(n, e, r, { backend: t });
      return l ? (o.lock = l, l) : (o.active = !1, o.lostReason = o.lostReason || "lease_lost", null);
    }, i = async () => {
      if (!o.active) throw new Error(o.lostReason || "scheduled_lease_lost");
      const l = await s();
      if (!l) throw new Error(o.lostReason || "scheduled_lease_lost");
      return l;
    }, c = Math.max(5e3, Math.min(Math.floor(r / 3), 6e4));
    return {
      leaseState: o,
      ensureActive: i,
      keepalivePromise: (async () => {
        for (; o.active; ) {
          let l = c;
          for (; o.active && l > 0; ) {
            const u = Math.min(l, 1e3);
            await qs(u), l -= u;
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
  async #y(n, e, r) {
    const t = this.service.getDB(e), a = this.service.getKV(e);
    if (!a && !t) return;
    const o = { db: t }, s = await Ce(e), i = ze(s?.scheduleUtcOffsetMinutes), c = n?.scheduledTime !== void 0 ? new Date(n.scheduledTime) : /* @__PURE__ */ new Date(), l = jo(c, i), u = (T = /* @__PURE__ */ new Date()) => jo(T, i), d = ue(s?.scheduledLeaseMs, F.Defaults.ScheduledLeaseMs, F.Defaults.ScheduledLeaseMinMs, 900 * 1e3), f = `${H()}-${Math.random().toString(36).slice(2, 10)}`, m = this.#l(f), p = async (T) => {
      const L = String(T || "db_unavailable").trim() || "db_unavailable";
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
      leaseMs: d
    });
    if (!g.acquired) {
      const T = String(g.reason || "lease_not_acquired");
      if (T === "db_not_configured" || T === "db_unavailable" || T === "db_init_failed") {
        await p(T);
        return;
      }
      await m(this.service.patchOpsStatus(e, this.#c(l, g, T)), "patch_busy_status", { reason: T }, null);
      return;
    }
    const h = String(g.backend || g.lock?.backend || "").trim().toLowerCase(), { leaseState: y, ensureActive: _, keepalivePromise: S } = this.#h({
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
      const T = s || {}, L = await m(this.service.getOpsStatusSection(e, "scheduled"), "read_previous_status", null, {});
      if (t) try {
        await _();
        const P = pt(c, T.scheduleUtcOffsetMinutes), I = P.dateKey, M = P.startTs, x = P.endTs, U = ze(T.scheduleUtcOffsetMinutes), G = this.service.getPreviousD1TidyState(L), K = await this.service.tidyD1Data(e, {
          db: t,
          kv: a,
          ctx: r,
          config: T,
          mode: "scheduled",
          maintenanceMode: "smart",
          previousScheduledState: L,
          previousCleanupStatus: G,
          scheduledNow: c,
          dayWindow: P,
          statsBucketDate: I,
          statsStartTs: M,
          statsEndTs: x,
          statsUtcOffsetMinutes: U,
          beforeEachStep: _
        }), $ = R(), V = this.service.buildD1TidyStatusPayload(K.summary, {
          mode: "scheduled",
          maintenanceMode: "smart",
          triggeredBy: "scheduled",
          timestamp: $
        });
        b.d1Tidy = V.d1Tidy, b.cleanup = V.cleanup, (b.d1Tidy.status === "partial_failure" || b.d1Tidy.status === "failed") && (b.status = "partial_failure"), await _();
      } catch (P) {
        b.status = "partial_failure";
        const I = this.service.buildD1TidyStatusPayload({
          status: "failed",
          lastError: P?.message || String(P),
          maintenanceMode: "smart"
        }, {
          mode: "scheduled",
          maintenanceMode: "smart",
          triggeredBy: "scheduled",
          timestamp: R()
        });
        b.d1Tidy = I.d1Tidy, b.cleanup = I.cleanup, this.logger.error("Scheduled DB Cleanup Error: ", P);
      }
      else {
        const P = this.service.buildD1TidyStatusPayload({
          status: "skipped",
          reason: "db_not_configured",
          maintenanceMode: "smart"
        }, {
          mode: "scheduled",
          maintenanceMode: "smart",
          triggeredBy: "scheduled",
          timestamp: R()
        });
        b.d1Tidy = P.d1Tidy, b.cleanup = P.cleanup;
      }
      b.kvTidy = {
        ...this.#e(L, "kvTidy"),
        mode: "manual_only",
        lastAutoSkipAt: R(),
        autoSkipReason: "manual_only"
      };
      const { tgBotToken: D, tgChatId: E } = T, w = this.#e(L, "tgDailyReport", "report"), N = this.#e(L, "alerts"), O = At(T.tgDailyReportClockTimes, F.Defaults.TgDailyReportClockTimes), C = Fl(w, O, i, c), v = Pi(T, T), B = {
        ...w,
        clockTimes: O,
        reportKinds: v
      };
      if (T.tgDailyReportEnabled === !0) {
        let P = this.#o(C.fixedQueue);
        if (!v.length) b.tgDailyReport = this.#t(B, R(), "report_kinds_disabled", { fixedQueue: P });
        else if (!D || !E) b.tgDailyReport = this.#t(B, R(), "telegram_not_configured", { fixedQueue: P });
        else if (C.due !== !0) b.tgDailyReport = this.#t(B, R(), C.reason || "time_not_matched", { fixedQueue: P });
        else {
          let I = [], M = null, x = 0;
          for (const U of C.dueSlots) try {
            await _();
            const G = await this.service.sendDailyTelegramReport(e, {
              now: c,
              reportKinds: v
            });
            x += Number(G?.sentCount) || 0, I.push(U), P = this.#n(P, C.context.dateKey, U);
          } catch (G) {
            M = G, this.logger.error("Scheduled Daily Report Error: ", G);
            break;
          }
          M ? (b.status = this.#a(b.status), b.tgDailyReport = this.#r(B, R(), M?.message || String(M), {
            fixedQueue: P,
            processedSlots: I
          })) : b.tgDailyReport = this.#i(B, R(), {
            fixedQueue: P,
            sentCount: x,
            ...this.#s(C.context.dateKey, I)
          });
        }
      } else b.tgDailyReport = this.#t(B, R(), "disabled", { fixedQueue: C.fixedQueue });
      try {
        await _();
        const P = await this.service.maybeSendRuntimeAlerts(e, b);
        P.sent;
        const I = R();
        b.alerts = P.sent === !0 ? this.#i(N, I, {
          lastPolledAt: I,
          lastSkippedAt: N.lastSkippedAt || "",
          issueCount: Number(P.issueCount) || 0,
          reason: P.reason || "alert_sent"
        }) : this.#t(N, I, P.reason || "no_alerts", {
          lastPolledAt: I,
          lastSuccessAt: N.lastSuccessAt || "",
          issueCount: Number(P.issueCount) || 0
        });
      } catch (P) {
        b.status = this.#a(b.status);
        const I = R();
        b.alerts = this.#r(N, I, P?.message || String(P), { lastPolledAt: I }), this.logger.error("Scheduled Alert Error: ", P);
      }
    } catch (T) {
      b.status = "failed", b.lastErrorAt = R(), b.lastError = T?.message || String(T), this.logger.error("Scheduled Task Error: ", T);
    } finally {
      y.active = !1, await S;
      const T = R();
      b.lastFinishedAt = T, b.status === "success" && (b.lastSuccessAt = T);
      const L = y.lostReason ? !1 : await m(this.service.releaseScheduledLease(o, f, { backend: h }), "release_lease", { backend: h }, !1);
      b.lock = this.#g(y, T, L), await m(this.service.patchOpsStatus(e, { scheduled: b }), "patch_final_status", {
        finishedAt: T,
        finalStatus: b.status,
        leaseLostReason: y.lostReason || ""
      }, null);
    }
  }
};
function Mp(n = {}, e = {}) {
  const { CacheManager: r, persistCloudflareDnsRecordsForHost: t } = n;
  return {
    sanitizeHeaders(a) {
      if (!a || typeof a != "object" || Array.isArray(a)) return {};
      const o = {};
      for (const [s, i] of Object.entries(a)) {
        const c = String(s || "").trim();
        c && (Kn.has(c.toLowerCase()) || (o[c] = String(i ?? "")));
      }
      return o;
    },
    normalizeTargets(a) {
      const o = String(a || "").split(",").map((i) => i.trim()).filter(Boolean);
      if (!o.length) return null;
      const s = [];
      for (const i of o) {
        const c = ss(i);
        if (!c) return null;
        s.push(c);
      }
      return s.length ? s.join(",") : null;
    },
    normalizeSingleTarget(a) {
      const o = e.normalizeTargets(a);
      if (!o) return null;
      const [s] = o.split(",").map((i) => i.trim()).filter(Boolean);
      return s || null;
    },
    normalizeTargetPort(a) {
      const o = String(a ?? "").trim();
      if (!o) return "";
      if (!/^\d{1,5}$/.test(o)) return null;
      const s = Number(o);
      return !Number.isInteger(s) || s < 1 || s > 65535 ? null : String(s);
    },
    buildTargetWithPort(a, o = "", s = "") {
      return ss(a, o, s);
    },
    buildDefaultLineName(a) {
      return `线路${Number(a) + 1}`;
    },
    normalizeLineId(a, o = 0) {
      return String(a || "").trim().toLowerCase().replace(/[^a-z0-9_-]+/g, "-").replace(/^-+|-+$/g, "") || `line-${Number(o) + 1}`;
    },
    parseLatencyMs(a) {
      if (a === "" || a === null || a === void 0) return null;
      const o = Number(a);
      return !Number.isFinite(o) || o < 0 ? null : Math.round(o);
    },
    normalizeIsoDatetime(a) {
      if (!a) return "";
      const o = new Date(a);
      return Number.isFinite(o.getTime()) ? o.toISOString() : "";
    },
    normalizeLines(a, o = "", s = "") {
      const i = String(e.normalizeTargets(o) || "").split(",").map((m) => m.trim()).filter(Boolean), c = e.normalizeTargetPort(s), l = c === null ? "" : c, u = Array.isArray(a) && a.length ? a : i.map((m, p) => ({
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
        let _ = y, S = 2;
        for (; f.has(_); )
          _ = `${y}-${S}`, S += 1;
        f.add(_), d.push({
          id: _,
          name: String(g?.name || "").trim() || e.buildDefaultLineName(p),
          target: h
        });
      }), d;
    },
    resolveActiveLineId(a, o, s = [], i = "") {
      if (!Array.isArray(o) || !o.length) return "";
      const c = String(a || "").trim();
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
    buildLegacyTargetFromLines(a = []) {
      return (Array.isArray(a) ? a : []).map((o) => String(o?.target || "").trim()).filter(Boolean).join(",");
    },
    getActiveNodeLine(a) {
      const o = Array.isArray(a?.lines) ? a.lines : [];
      if (!o.length) return null;
      const s = String(a?.activeLineId || "").trim();
      return o.find((i) => i.id === s) || o[0];
    },
    getOrderedNodeLines(a) {
      const o = Array.isArray(a?.lines) ? a.lines.slice() : [];
      if (o.length <= 1) return o;
      const s = e.getActiveNodeLine(a);
      return s ? [s, ...o.filter((i) => i.id !== s.id)] : o;
    },
    sortNodeLinesByLatency(a = []) {
      return (Array.isArray(a) ? a : []).map((o, s) => ({
        line: o,
        index: s
      })).sort((o, s) => {
        const i = Number.isFinite(o.line?.latencyMs) ? o.line.latencyMs : Number.POSITIVE_INFINITY, c = Number.isFinite(s.line?.latencyMs) ? s.line.latencyMs : Number.POSITIVE_INFINITY;
        return i !== c ? i - c : o.index - s.index;
      }).map((o) => o.line);
    },
    isPingCacheFresh(a, o) {
      const s = Number(a?.latencyMs), i = Date.parse(String(a?.latencyUpdatedAt || ""));
      if (!Number.isFinite(s) || !Number.isFinite(i)) return !1;
      const c = Math.max(0, Number(o) || 0) * 60 * 1e3;
      return c <= 0 ? !1 : H() - i < c;
    }
  };
}
function Pn(n = "") {
  const e = String(n || "").trim().toLowerCase();
  return e.startsWith("emby ") ? "emby" : e.startsWith("mediabrowser ") ? "mediabrowser" : "";
}
function Pp(n = "", e = "") {
  const r = String(n || "").trim();
  if (!r) return "";
  const t = r.replace(/^[^\s]+\s+/i, "").trim();
  return t ? e === "emby" ? `Emby ${t}` : e === "mediabrowser" ? `MediaBrowser ${t}` : r : r;
}
function qc(n = "") {
  const e = String(n || "").trim();
  if (!e) return {};
  const r = e.replace(/^[^\s]+\s+/i, "").trim();
  if (!r || !r.includes("=")) return {};
  const t = {}, a = /([A-Za-z][A-Za-z0-9_-]*)\s*=\s*(?:"([^"]*)"|([^,]+))/g;
  let o;
  for (; (o = a.exec(r)) !== null; ) {
    const s = String(o[1] || "").trim().toLowerCase(), i = String(o[2] !== void 0 ? o[2] : o[3] || "").trim();
    !s || !i || Object.prototype.hasOwnProperty.call(t, s) || (t[s] = i);
  }
  return t;
}
var Xc = /* @__PURE__ */ new Set([
  "apikey",
  "accesstoken",
  "token",
  "authorization",
  "xembytoken",
  "xembyauthorization",
  "xmediabrowsertoken",
  "xmediabrowserauthorization"
]), Yc = /* @__PURE__ */ new Set([
  "deviceid",
  "xembydeviceid",
  "xmediabrowserdeviceid"
]);
function Fs(n, e) {
  const r = n instanceof URL ? n : null;
  if (!r || !(e instanceof Set)) return !1;
  for (const t of r.searchParams.keys()) if (e.has(Na(t))) return !0;
  return !1;
}
function Je(n, e = "") {
  if (n instanceof Headers) return n.get(e) || "";
  const r = String(e || "").trim().toLowerCase();
  for (const [t, a] of bn(n))
    if (String(t || "").trim().toLowerCase() === r)
      return String(a ?? "");
  return "";
}
function xp(n = "") {
  const e = String(n ?? "").replace(/[\r\n]+/g, " ").trim();
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
function Op(n) {
  const e = new Headers();
  for (const [r, t] of bn(n)) {
    const a = String(r || "").trim();
    if (!a) continue;
    const o = String(t ?? "");
    try {
      e.set(a, o);
    } catch {
      const s = xp(o);
      if (!s) continue;
      try {
        e.set(a, s);
      } catch {
      }
    }
  }
  return e;
}
function Ko(n) {
  const e = {
    token: "",
    deviceId: ""
  };
  for (const r of ["X-Emby-Token", "X-MediaBrowser-Token"]) {
    const t = Je(n, r).trim();
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
    const t = Je(n, r).trim();
    if (!t) continue;
    const a = qc(t);
    if (!e.token && a.token && (e.token = a.token), !e.deviceId && a.deviceid && (e.deviceId = a.deviceid), !e.token) {
      const o = /^Bearer\s+(.+)$/i.exec(t);
      o?.[1] && (e.token = o[1].trim());
    }
  }
  if (!e.deviceId) for (const r of ["X-Emby-Device-Id"]) {
    const t = Je(n, r).trim();
    if (t) {
      e.deviceId = t;
      break;
    }
  }
  return e;
}
function vp(n = "") {
  const e = String(n || "").trim();
  if (!e || /^Bearer\s+.+$/i.test(e)) return !0;
  const r = qc(e);
  return !!String(r.token || "").trim();
}
function Ea(n) {
  const e = Ko(n), r = [], t = [];
  Bo(Je(n, "Cookie"), ln) && t.push("cookie");
  for (const u of vc) {
    const d = Je(n, u).trim();
    d && (vp(d) || r.push(u));
  }
  for (const [u, d] of bn(n)) {
    const f = String(u || "").trim().toLowerCase(), m = String(d || "").trim();
    !f || !m || Uc(f) && r.push(f);
  }
  const a = [...new Set(r)], o = [...new Set(t)], s = !!String(e.token || "").trim() || !!String(e.deviceId || "").trim(), i = a.length > 0, c = o.length > 0, l = !i && !c;
  return {
    canDirect: l,
    reason: l ? "" : "direct_transport_incompatible",
    headerAuthHeaders: a,
    cookieAuthHeaders: o,
    hasQueryAuth: s,
    hasHeaderAuth: i,
    hasCookieAuth: c,
    auth: e
  };
}
function Jc(n, e) {
  const r = n instanceof URL ? new URL(n.toString()) : new URL(String(n || "")), t = (e && typeof e == "object" && "auth" in e ? e : { auth: Ko(e) }).auth || {};
  return t.token && !Fs(r, Xc) && r.searchParams.set("api_key", t.token), t.deviceId && !Fs(r, Yc) && r.searchParams.set("DeviceId", t.deviceId), r;
}
function Fp(n, e = "auto") {
  const r = ar(e);
  if (r === "passthrough") return n;
  const t = n.get("Authorization")?.trim() || "", a = n.get("X-Emby-Authorization")?.trim() || "", o = n.get("X-MediaBrowser-Authorization")?.trim() || "", s = Pn(t), i = Pn(o), c = Pn(a);
  let l = s ? t : i ? o : c ? a : "";
  if (!l) return n;
  const u = r === "emby" ? "emby" : r === "jellyfin" ? "mediabrowser" : s || i || c || "";
  return l = Pp(l, u), n.set("Authorization", l), u === "mediabrowser" ? (n.set("X-MediaBrowser-Authorization", l), n.delete("X-Emby-Authorization"), n) : (u === "emby" && (n.set("X-Emby-Authorization", l), n.delete("X-MediaBrowser-Authorization")), n);
}
function Us(n, e = {}) {
  if (!(n instanceof Headers)) return n;
  const r = e.dropTokenHeaders !== !1;
  return [
    "Authorization",
    "X-Emby-Authorization",
    "X-MediaBrowser-Authorization"
  ].forEach((t) => n.delete(t)), r && [
    "X-Emby-Token",
    "X-MediaBrowser-Token",
    "X-Emby-Auth-Token",
    "X-MediaBrowser-Auth-Token"
  ].forEach((t) => n.delete(t)), n;
}
function Up() {
  const n = {};
  for (const e of ["direct", "proxy"]) {
    n[e] = {};
    for (const r of [
      "none",
      "query",
      "header",
      "cookie"
    ]) {
      n[e][r] = {};
      for (const t of [
        "none",
        "same_origin",
        "external"
      ]) n[e][r][t] = {
        deliveryMode: e,
        authCarrier: r,
        redirectScope: t,
        clientVisibleRedirect: e === "direct" && t !== "none",
        workerFollowRedirect: e === "proxy",
        reasonCode: e === "direct" ? t === "none" ? "entry_direct" : "client_redirect" : "worker_follow_redirect"
      };
    }
  }
  return Object.freeze(n);
}
var kp = Up();
function ks(n = {}) {
  const e = n && typeof n == "object" ? n : null, r = String(n?.corsOrigins || ""), t = String(n?.ipBlacklist || ""), a = String(n?.geoAllowlist || ""), o = String(n?.geoBlocklist || ""), s = e ? ne.ProxyAccessRuleProfileCache.get(e) : null;
  if (s && s.corsOriginsRaw === r && s.ipBlacklistRaw === t && s.geoAllowlistRaw === a && s.geoBlocklistRaw === o) return s;
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
  }, c = i(r), l = {
    corsOriginsRaw: r,
    ipBlacklistRaw: t,
    geoAllowlistRaw: a,
    geoBlocklistRaw: o,
    corsOrigins: c.values,
    corsOriginSet: c.valueSet,
    ipBlacklist: i(t).valueSet,
    geoAllowlist: i(a, !0).valueSet,
    geoBlocklist: i(o, !0).valueSet
  };
  return e && ne.ProxyAccessRuleProfileCache.set(e, l), l;
}
function Hp(n = {}, e = {}) {
  const { CacheManager: r, persistCloudflareDnsRecordsForHost: t } = n;
  return {
    normalizeNode(a, o, s = {}) {
      const i = { ...o };
      let c = !1;
      const l = e.normalizeTargetPort(i.port), u = e.normalizeLines(i.lines, i.target, l || ""), d = e.resolveActiveLineId(i.activeLineId, u, Array.isArray(i.lines) ? i.lines : [], l || ""), f = e.buildLegacyTargetFromLines(u);
      JSON.stringify(u) !== JSON.stringify(Array.isArray(i.lines) ? i.lines : []) && (c = !0), String(i.activeLineId || "") !== d && (c = !0), String(i.target || "") !== f && (c = !0), i.lines = u, i.activeLineId = d, i.target = f, Object.prototype.hasOwnProperty.call(i, "port") && (delete i.port, c = !0), i.secret === void 0 && (i.secret = "", c = !0);
      const m = Kr(i.tags, i.tag), p = m[0] || "";
      JSON.stringify(m) !== JSON.stringify(Array.isArray(i.tags) ? i.tags : []) && (c = !0), String(i.tag || "") !== p && (c = !0), i.tags = m, i.tag = p;
      const g = [["server", "Record"].join(""), ["media", "Aggregation"].join("")];
      for (const D of Object.keys(i).filter((E) => g.some((w) => E.startsWith(w))))
        delete i[D], c = !0;
      i.remark === void 0 && (i.remark = "", c = !0), i.tagColor === void 0 && (i.tagColor = "", c = !0), i.remarkColor === void 0 && (i.remarkColor = "", c = !0), i.displayName === void 0 && (i.displayName = "", c = !0);
      const h = nr(i.entryMode);
      String(i.entryMode || "") !== h && (c = !0), i.entryMode = h, h === "host_prefix" && String(i.secret ?? "") !== "" && (i.secret = "", c = !0);
      const y = h === "host_prefix" ? Wt(i.hostPrefixCnameTarget) : "";
      String(i.hostPrefixCnameTarget || "") !== y && (c = !0), i.hostPrefixCnameTarget = y;
      const _ = Mr(i.playbackInfoMode);
      String(i.playbackInfoMode || "") !== _ && (c = !0), i.playbackInfoMode = _;
      const S = ar(i.mediaAuthMode);
      String(i.mediaAuthMode || "") !== S && (c = !0), i.mediaAuthMode = S;
      const A = Ir(i.realClientIpMode);
      String(i.realClientIpMode || "") !== A && (c = !0), i.realClientIpMode = A;
      const b = ca(i.hedgeProbePath);
      String(i.hedgeProbePath || "") !== b && (c = !0), i.hedgeProbePath = b;
      const R = Br(i);
      String(i.mainVideoStreamMode || "") !== R && (c = !0), i.mainVideoStreamMode = R;
      const T = vr(i.routingDecisionMode);
      if (String(i.routingDecisionMode || "") !== T && (c = !0), i.routingDecisionMode = T, Object.prototype.hasOwnProperty.call(i, "wangpanDirectMode") && (delete i.wangpanDirectMode, c = !0), Object.prototype.hasOwnProperty.call(i, "wangpanMode") && (delete i.wangpanMode, c = !0), s && typeof s == "object" && "dropLegacyDirectRouting" in s && s.dropLegacyDirectRouting === !0) for (const D of [...pn, ...gn])
        Object.prototype.hasOwnProperty.call(i, D) && (delete i[D], c = !0);
      const L = e.sanitizeHeaders(i.headers);
      return JSON.stringify(L) !== JSON.stringify(i.headers || {}) && (c = !0), i.headers = L, delete i.videoThrottling, delete i.interceptMs, i.schemaVersion !== 6 && (i.schemaVersion = 6, c = !0), Object.prototype.hasOwnProperty.call(i, "createdAt") && (delete i.createdAt, c = !0), Object.prototype.hasOwnProperty.call(i, "updatedAt") && (delete i.updatedAt, c = !0), {
        data: i,
        changed: c
      };
    },
    buildComparableNodePayload(a = {}, o = {}) {
      if (!k(a)) return null;
      const s = { ...a };
      o.includeName !== !0 && delete s.name, delete s.createdAt, delete s.updatedAt;
      const i = (c) => {
        if (Array.isArray(c)) return c.map((l) => i(l));
        if (k(c)) {
          const l = {};
          for (const u of Object.keys(c).sort()) l[u] = i(c[u]);
          return l;
        }
        return c;
      };
      return i(s);
    },
    areNodePayloadsEquivalent(a = {}, o = {}, s = {}) {
      const i = e.buildComparableNodePayload(a, s), c = e.buildComparableNodePayload(o, s);
      return ee(i) === ee(c);
    },
    buildNodeRecord(a, o, s = {}) {
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
      const m = e.resolveActiveLineId(o?.activeLineId !== void 0 ? o.activeLineId : s.activeLineId, f, Array.isArray(o?.lines) ? o.lines : s.lines, d), p = o?.mainVideoStreamMode !== void 0 ? o.mainVideoStreamMode : o?.wangpanDirectMode !== void 0 ? o.wangpanDirectMode : o?.wangpanMode, g = e.normalizeNode(a, {
        target: e.buildLegacyTargetFromLines(f),
        lines: f,
        activeLineId: m,
        ...c,
        entryMode: o?.entryMode !== void 0 ? nr(o.entryMode) : nr(s.entryMode),
        hostPrefixCnameTarget: o?.hostPrefixCnameTarget !== void 0 ? o.hostPrefixCnameTarget : s.hostPrefixCnameTarget,
        secret: o?.secret !== void 0 ? o.secret : s.secret || "",
        tag: o?.tag !== void 0 ? o.tag : s.tag || "",
        tags: o?.tags !== void 0 ? o.tags : o?.tag !== void 0 ? [o.tag, ...Kr(s.tags, s.tag).filter((h) => h.toLowerCase() !== String(s.tag || "").trim().toLowerCase())] : s.tags,
        remark: o?.remark !== void 0 ? o.remark : s.remark || "",
        tagColor: o?.tagColor !== void 0 ? String(o.tagColor || "").trim() : s.tagColor || "",
        remarkColor: o?.remarkColor !== void 0 ? String(o.remarkColor || "").trim() : s.remarkColor || "",
        displayName: o?.displayName !== void 0 ? String(o.displayName || "").trim() : s.displayName || "",
        playbackInfoMode: o?.playbackInfoMode !== void 0 ? Mr(o.playbackInfoMode) : Mr(s.playbackInfoMode),
        mediaAuthMode: o?.mediaAuthMode !== void 0 ? ar(o.mediaAuthMode) : ar(s.mediaAuthMode),
        realClientIpMode: o?.realClientIpMode !== void 0 ? Ir(o.realClientIpMode) : Ir(s.realClientIpMode),
        hedgeProbePath: o?.hedgeProbePath !== void 0 ? ca(o.hedgeProbePath) : ca(s.hedgeProbePath),
        routingDecisionMode: o?.routingDecisionMode !== void 0 ? vr(o.routingDecisionMode) : vr(s.routingDecisionMode),
        mainVideoStreamMode: p !== void 0 ? on(p) : Br(s),
        headers: e.sanitizeHeaders(i),
        schemaVersion: 6
      }).data;
      return e.normalizeNode(a, s || {}).data, g;
    },
    buildHostPrefixDnsRecordHost(a = "", o = "") {
      const s = String(a || "").trim().toLowerCase(), i = re(o);
      return !i || !Aa(s) ? "" : `${s}.${i}`;
    },
    buildHostPrefixDnsSyncPlan(a = "", o = null, s = "", i = null, c = "", l = {}) {
      const u = re(c), d = o && Ze(o?.entryMode) ? e.buildHostPrefixDnsRecordHost(a, u) : "", f = i && Ze(i?.entryMode) ? e.buildHostPrefixDnsRecordHost(s, u) : "", m = d ? Wa(o, l.previousConfig || l.config || {}, u) : "", p = f ? Wa(i, l.nextConfig || l.config || {}, u) : "", g = [], h = [];
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
    buildPreparedNodeMutation(a = {}, o = {}, s = {}) {
      const i = String(s.nextName || a?.name || "").trim().toLowerCase();
      if (!i) return null;
      const c = String(s.previousName || a?.originalName || i).trim().toLowerCase() || i, l = e.buildNodeRecord(i, a, o);
      if (!l) return null;
      const u = k(o) && Object.keys(o).length ? e.normalizeNode(c, o || {}).data : null, d = c !== i, f = !d && !!u && e.areNodePayloadsEquivalent(u, l);
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
    async upsertHostPrefixDnsRecord(a = "", o = {}) {
      const s = re(a);
      if (!s) return null;
      const i = o.config || await Ce(o.env), c = ia(i, o.env), l = Wt(o.cnameTarget) || re(c.host);
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
        requestHost: re(o.requestHost || c.host),
        skipHistory: o.skipHistory === !0,
        includeAllRecords: !1
      });
    },
    async deleteHostPrefixDnsRecord(a = "", o = {}) {
      const s = re(a);
      if (!s) return null;
      const i = ia(o.config || await Ce(o.env), o.env), c = String(i.cfZoneId || "").trim(), l = String(i.cfApiToken || "").trim(), u = await Po(c, l, { scope: "node.host_prefix_dns_delete.zone_lookup" }), d = String(u?.name || "").trim();
      if (d && !fa(s, d)) throw Le("INVALID_HOST", "当前子域不在 Cloudflare Zone 下", 400, {
        host: s,
        zoneName: d
      });
      const f = (await Ur(c, l, { nameExact: s })).filter((p) => re(p?.name) === s && String(p?.type || "").trim().toUpperCase() === "CNAME");
      if (!f.length) return {
        ok: !0,
        deletedCount: 0,
        host: s
      };
      const m = Ec(c, l, s, `https://api.cloudflare.com/client/v4/zones/${encodeURIComponent(c)}/dns_records`, f[0] || {
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
    async persistHostPrefixDnsSyncPlan(a = {}, o = {}) {
      const s = Array.isArray(a?.steps) ? a.steps : [];
      if (!s.length) return null;
      ia(o.config || await Ce(o.env), o.env);
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
    async applyPreparedNodeMutation(a = {}, o = {}) {
      const s = o.kv;
      if (!s || a?.nodeChanged !== !0) return !1;
      const i = String(a?.previousName || "").trim().toLowerCase(), c = String(a?.nextName || "").trim().toLowerCase();
      return a?.nextNode ? await s.put(`${e.PREFIX}${c}`, JSON.stringify(a.nextNode)) : c && await s.delete(`${e.PREFIX}${c}`), i && c && i !== c && await s.delete(`${e.PREFIX}${i}`), e.invalidateNodeCaches([i, c], {
        invalidateList: !0,
        kv: s
      }), !0;
    },
    async rollbackPreparedNodeMutation(a = {}, o = {}) {
      const s = o.kv;
      if (!s || a?.nodeChanged !== !0) return !1;
      const i = String(a?.previousName || "").trim().toLowerCase(), c = String(a?.nextName || "").trim().toLowerCase();
      return i && (a?.previousNode ? await s.put(`${e.PREFIX}${i}`, JSON.stringify(a.previousNode)) : await s.delete(`${e.PREFIX}${i}`)), c && c !== i && await s.delete(`${e.PREFIX}${c}`), e.invalidateNodeCaches([i, c], {
        invalidateList: !0,
        kv: s
      }), !0;
    },
    async rollbackPreparedNodeMutations(a = [], o = {}) {
      const s = o.kv;
      if (!s) return { rolledBackNodeCount: 0 };
      const i = (Array.isArray(a) ? a : []).filter(Boolean);
      if (!i.length) return { rolledBackNodeCount: 0 };
      const c = i.some((d) => d?.dnsPlan?.changed === !0) ? o.config || await Ce(o.env) : null;
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
          u.push(`dns:${ce(m, "rollback_failed")}`);
        }
        if (f?.nodeChanged === !0) try {
          await e.rollbackPreparedNodeMutation(f, o), l += 1;
        } catch (m) {
          u.push(`node:${ce(m, "rollback_failed")}`);
        }
      }
      if (o.rebuildIndexes === !0) try {
        await e.rebuildNodeIndexesFromKv(s, {
          ctx: o.ctx,
          syncLegacyIndex: !0
        });
      } catch (d) {
        u.push(`rebuild_indexes:${ce(d, "rollback_failed")}`);
      }
      if (u.length > 0) throw new Error(u.join("; "));
      return { rolledBackNodeCount: l };
    },
    async applyPreparedNodeMutations(a = [], o = {}) {
      if (!o.kv) return { mutatedNodeCount: 0 };
      const s = (Array.isArray(a) ? a : []).filter(Boolean);
      if (!s.length) return { mutatedNodeCount: 0 };
      const i = s.some((m) => m?.dnsPlan?.changed === !0) ? await Ce(o.env) : null;
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
          d = !1, f = ce(p, "rollback_failed");
        }
        throw m && typeof m == "object" && (String(m.code || "").trim() || (m.code = "NODE_MUTATION_FAILED"), m.status = De(m.status, 500), m.details = {
          ...k(m.details) ? m.details : {},
          rollbackAttempted: u,
          rollbackSucceeded: d,
          rollbackError: f
        }), m;
      }
    }
  };
}
function $p(n = {}, e = {}) {
  const { CacheManager: r, persistCloudflareDnsRecordsForHost: t } = n;
  return {
    async pingTarget(a, o) {
      const s = H(), i = hu, c = (g = {}) => ({
        ok: g.ok === !0,
        reason: String(g.reason || "network_error"),
        statusCode: Number.isInteger(g.statusCode) ? g.statusCode : null,
        elapsedMs: Math.max(0, H() - s),
        methodUsed: g.methodUsed === "HEAD" || g.methodUsed === "GET" ? g.methodUsed : null,
        probePath: i
      }), l = mn(String(a || "").trim());
      if (!l) return c({ reason: "invalid_target" });
      const u = Nc(l, i);
      if (!u) return c({ reason: "invalid_target" });
      const d = new AbortController();
      let f = !1;
      const m = "GET", p = setTimeout(() => {
        f = !0, d.abort();
      }, o);
      try {
        const g = await We(u.toString(), {
          method: "GET",
          signal: d.signal
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
        ].map((_) => String(_ || "")).join(" "), y = /\b(?:tls|ssl|x509|certificate|handshake)\b/i.test(h);
        return c({
          reason: f ? "timeout" : y ? "tls_error" : "network_error",
          methodUsed: m
        });
      } finally {
        clearTimeout(p);
      }
    },
    async getNode(a, o, s) {
      a = String(a).toLowerCase();
      const i = e.getKV(o);
      if (!i) return null;
      const c = _e(i), l = Ie(a, c), u = c.NodeCache.get(a);
      if (u && u.exp > Date.now()) {
        const f = await e.getNodesRevision(i), m = String(u?.nodesRevision || "").trim();
        if (Ie(a, c) === l && (!m || !f || m === f))
          return Za(c.NodeCache, a), u.data;
        Ie(a, c) === l && c.NodeCache.delete(a);
      }
      const d = Ie(a, c);
      return await dn(c.SingleFlightTasks, ct([
        "proxy_node",
        a,
        d
      ]), async () => {
        try {
          const f = await i.get(`${e.PREFIX}${a}`, { type: "json" });
          if (Ie(a, c) !== d) return null;
          if (!f) {
            const y = await e.getNodesSummaryIndex(i, { ctx: s });
            if (Array.isArray(y)) if (y.some((_) => String(_?.name || "").toLowerCase().trim() === a)) {
              const _ = e.rebuildNodeIndexesFromKv(i, { ctx: s });
              s ? s.waitUntil(_) : await _;
            } else {
              const _ = await e.getNodesRevision(i);
              Ie(a, c) === d && Ue(c.NodeCache, a, {
                data: null,
                exp: Date.now() + F.Defaults.NodeMissCacheTtlMs,
                nodesRevision: _
              }, F.Defaults.NodeCacheMax);
            }
            return null;
          }
          const { data: m, changed: p } = e.normalizeNode(a, f);
          if (tt(a, m))
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
          return h ? s ? s.waitUntil(g) : await g : (await g, h = await e.getNodesRevision(i)), Ie(a, c) !== d ? null : (Ue(c.NodeCache, a, {
            data: m,
            exp: Date.now() + F.Defaults.CacheTTL,
            nodesRevision: h
          }, F.Defaults.NodeCacheMax), m);
        } catch {
          return null;
        }
      });
    },
    async getNodeForRead(a, o) {
      a = String(a).toLowerCase();
      const s = e.getKV(o);
      if (!s) return null;
      const i = _e(s), c = Ie(a, i), l = i.NodeCache.get(a);
      if (l?.data === null) i.NodeCache.delete(a);
      else if (l && l.exp > Date.now()) {
        const d = await e.getNodesRevision(s), f = String(l?.nodesRevision || "").trim();
        if (Ie(a, i) === c && (!f || !d || f === d))
          return Za(i.NodeCache, a), l.data;
        Ie(a, i) === c && i.NodeCache.delete(a);
      }
      const u = Ie(a, i);
      try {
        const d = await s.get(`${e.PREFIX}${a}`, { type: "json" });
        if (Ie(a, i) !== u || !d) return null;
        const f = e.normalizeNode(a, d).data;
        if (tt(a, f))
          return i.NodeCache.delete(a), i.PlaybackRouteHotCache.delete(a), f;
        const m = await e.getNodesRevision(s);
        return Ie(a, i) !== u ? null : (Ue(i.NodeCache, a, {
          data: f,
          exp: Date.now() + F.Defaults.CacheTTL,
          nodesRevision: m
        }, F.Defaults.NodeCacheMax), f);
      } catch {
        return null;
      }
    },
    normalizeAdminActionRequest(a) {
      if (!a || typeof a != "object" || Array.isArray(a)) return null;
      const o = a.payload && typeof a.payload == "object" && !Array.isArray(a.payload) ? { ...a.payload } : null, s = String(a.action ?? o?.action ?? "").trim(), i = a.meta && typeof a.meta == "object" && !Array.isArray(a.meta) ? { ...a.meta } : {};
      return {
        action: s,
        data: o ? {
          ...o,
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
function Bp(n = {}, e = {}) {
  return {
    ...Mp(n, e),
    ...Hp(n, e),
    ...$p(n, e)
  };
}
var xn = "proxy_logs_fts";
function Kp(n = {}) {
  const e = {
    buildResponse(r = {}) {
      return te(r);
    },
    buildRange(r, t) {
      return {
        startDate: new Date(r).toISOString(),
        endDate: new Date(t).toISOString()
      };
    },
    normalizeRequest(r = {}) {
      const { page: t = 1, pageSize: a = 50, filters: o = {} } = r, s = Math.max(1, parseInt(t, 10) || 1), i = Math.min(200, Math.max(1, parseInt(a, 10) || 50)), c = String(r?.paginationMode || "").trim().toLowerCase(), l = zi(r?.pageCursor), u = c !== "offset" && (s === 1 || !!l), d = (s - 1) * i, f = Date.now(), m = F.Defaults.LogQueryDefaultDays * 24 * 60 * 60 * 1e3, p = (_) => {
        if (!_) return null;
        const S = new Date(String(_)).getTime();
        return Number.isFinite(S) ? S : null;
      }, g = (_) => {
        if (!_) return null;
        const S = (/* @__PURE__ */ new Date(String(_) + "T23:59:59.999")).getTime();
        return Number.isFinite(S) ? S : null;
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
    resolveSearch(r = {}, t = {}, a = {}) {
      const o = String(r.searchMode || "").trim().toLowerCase(), s = o === "fts" || o === "like";
      let i = $i(r.searchMode || t.logSearchMode), c = "";
      if (i === "fts" && a.ftsReady !== !0) {
        if (s) return { errorResponse: W("LOG_FTS_NOT_READY", "FTS5 虚拟表尚未初始化，请先点击“初始化 FTS5”", 400, {
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
    buildDisabledResponse(r = {}, t = {}, a = "", o = "") {
      return e.buildResponse(e.buildBasePayload(r, t, {
        logs: [],
        total: 0,
        totalPages: 1,
        searchMode: a,
        effectiveSearchMode: a,
        searchFallbackReason: o,
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
    buildSqlPlan(r = {}, t = {}, a = {}, o = "") {
      const { startTs: s, endTs: i } = t, c = e.buildDisplayState(a), l = Ad(r.requestGroup), u = Cd(r.statusGroup), d = ["proxy_logs.timestamp >= ?", "proxy_logs.timestamp <= ?"], f = [s, i], m = (b, ...R) => {
        d.push(b), R.length > 0 && f.push(...R);
      }, p = "LOWER(proxy_logs.request_path)", g = String(r.keyword || "").trim();
      let h = !1;
      if (g) {
        const b = F.Defaults.LogKeywordMaxWindowDays * 24 * 60 * 60 * 1e3;
        if (i - s > b) return { errorResponse: W("LOG_QUERY_RANGE_TOO_WIDE", `关键词搜索必须限制在 ${F.Defaults.LogKeywordMaxWindowDays} 天内`, 400, { maxWindowDays: F.Defaults.LogKeywordMaxWindowDays }) };
        if (/^\d{3}$/.test(g)) m("proxy_logs.status_code = ?", Number(g));
        else if (nl(g) || Wo(g)) {
          const R = [], T = [];
          if (c.displayClientIp && (R.push("proxy_logs.client_ip = ?"), T.push(g)), c.displayColo) {
            const L = Wo(g) ? g.toUpperCase() : g;
            R.push("COALESCE(proxy_logs.inbound_colo, proxy_logs.inbound_ip, '') = ?"), T.push(L), R.push("COALESCE(proxy_logs.outbound_colo, proxy_logs.outbound_ip, '') = ?"), T.push(L);
          }
          m(R.length ? `(${R.join(" OR ")})` : "1 = 0", ...T);
        } else if (o === "fts")
          m(`${xn} MATCH ?`, Pd(g)), h = !0;
        else {
          const R = `%${Ia(g)}%`;
          if (ve(R) > Yo) return { errorResponse: W("LOG_QUERY_KEYWORD_TOO_LONG", "LIKE 搜索关键词过长", 400, { maxPatternBytes: Yo }) };
          const T = [
            "proxy_logs.node_name LIKE ? ESCAPE '\\'",
            "proxy_logs.request_path LIKE ? ESCAPE '\\'",
            "proxy_logs.detail_json LIKE ? ESCAPE '\\'"
          ];
          f.push(R, R, R), c.displayClientIp && (T.push("proxy_logs.client_ip LIKE ? ESCAPE '\\'"), f.push(R)), c.displayUa && (T.push("proxy_logs.user_agent LIKE ? ESCAPE '\\'"), f.push(R)), T.push("proxy_logs.error_detail LIKE ? ESCAPE '\\'"), f.push(R), m(`(${T.join(" OR ")})`);
        }
      }
      r.category && m("proxy_logs.category = ?", String(r.category)), l === "playback_info" ? (m("proxy_logs.category = ?", "api"), m(`(${p} LIKE ? ESCAPE '\\' OR ${p} LIKE ? ESCAPE '\\')`, "%/playbackinfo%", "%/sessions/playing%")) : l === "image" ? m("proxy_logs.category = ?", "image") : l === "api" ? (m("proxy_logs.category = ?", "api"), m(`${p} NOT LIKE ? ESCAPE '\\'`, "%/playbackinfo%"), m(`${p} NOT LIKE ? ESCAPE '\\'`, "%/sessions/playing%"), m(`${p} NOT LIKE ? ESCAPE '\\'`, "%/users/authenticate%")) : l === "auth" && (m("proxy_logs.category = ?", "api"), m(`${p} LIKE ? ESCAPE '\\'`, "%/users/authenticate%")), u === "4xx" ? m("proxy_logs.status_code >= ? AND proxy_logs.status_code < ?", 400, 500) : u === "5xx" && m("proxy_logs.status_code >= ? AND proxy_logs.status_code < ?", 500, 600);
      const y = ls(r.deliveryMode || "");
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
        )`, y, ...R.map((T) => `%${Ia(T)}%`));
      }
      const _ = wd(r.protocolFailureReason || "");
      if (_ && m(`(
          LOWER(COALESCE(CAST(json_extract(proxy_logs.detail_json, '$.protocolFailureReason') AS TEXT), '')) = ?
          OR (
            COALESCE(proxy_logs.detail_json, '') = ''
            AND proxy_logs.error_detail LIKE ? ESCAPE '\\'
          )
        )`, _, `%${Ia(_)}%`), r.playbackMode) {
        const b = String(r.playbackMode || "").trim();
        ls(b) || m("proxy_logs.error_detail LIKE ? ESCAPE '\\'", `%${Ia(`Playback=${b}`)}%`);
      }
      const S = h ? `FROM proxy_logs INNER JOIN ${xn} ON ${xn}.rowid = proxy_logs.id` : "FROM proxy_logs", A = `SELECT proxy_logs.*,
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
        fromClause: S,
        selectClause: A,
        orderByClause: "ORDER BY proxy_logs.timestamp DESC, proxy_logs.id DESC"
      };
    },
    async executeSqlPlan(r, t = {}, a = {}) {
      const { safePage: o, safePageSize: s, requestedPageCursor: i, useSeekPagination: c, offset: l } = t, { whereClause: u = [], params: d = [], fromClause: f = "", selectClause: m = "", orderByClause: p = "", useFtsKeyword: g = !1, searchMode: h = "" } = a, y = "WHERE " + u.join(" AND ");
      let _ = 0, S = 1, A = o > 1, b = !1, R = null, T = [];
      try {
        if (c) {
          const L = u.slice(), D = d.slice();
          i && (L.push("(proxy_logs.timestamp < ? OR (proxy_logs.timestamp = ? AND proxy_logs.id < ?))"), D.push(i.timestamp, i.timestamp, i.id));
          const E = "WHERE " + L.join(" AND "), w = await r.prepare(`${m} ${f} ${E} ${p} LIMIT ?`).bind(...D, s + 1).all(), N = Array.isArray(w?.results) ? w.results : [];
          b = N.length > s, T = b ? N.slice(0, s) : N, R = b ? xd(T[T.length - 1]) : null, _ = null, S = b ? o + 1 : o;
        } else {
          _ = (await r.prepare(`SELECT COUNT(*) as total ${f} ${y}`).bind(...d).first())?.total || 0;
          const L = await r.prepare(`${m} ${f} ${y} ${p} LIMIT ? OFFSET ?`).bind(...d, s, l).all();
          T = Array.isArray(L?.results) ? L.results : [], S = Math.ceil(_ / s) || 1, A = o > 1, b = o < S;
        }
      } catch (L) {
        const D = String(L?.message || L || "");
        if (g && /no such table:\s*proxy_logs_fts/i.test(D)) return { errorResponse: W("LOG_FTS_NOT_READY", "FTS5 虚拟表尚未初始化，请先点击“初始化 FTS5”", 400, { searchMode: h }) };
        if (g && /fts5/i.test(D)) return { errorResponse: W("LOG_FTS_QUERY_INVALID", "FTS 查询语法无效，请检查引号、布尔表达式或前缀写法", 400, { detail: D }) };
        throw L;
      }
      return {
        logs: T,
        total: _,
        totalPages: S,
        hasPrevPage: A,
        hasNextPage: b,
        nextCursor: R,
        searchMode: h
      };
    }
  };
  return e;
}
var zp = "sys_status";
function Wp(n = {}) {
  const { logRepository: e } = n, r = {
    error(t, a, o = null) {
      Fe(t, a, o, "error");
    },
    scheduleFlush(t, a) {
      const o = e.getDB(t), s = tr.get(o);
      if (!o || !a || s.LogFlushPending) return null;
      s.LogFlushPending = !0;
      const i = r.flush(t).finally(() => {
        s.LogFlushTask === i && (s.LogFlushTask = null), s.LogFlushPending = !1, s.LogLastFlushAt = H();
      });
      return s.LogFlushTask = i, a.waitUntil(i), i;
    },
    record(t, a, o) {
      const s = e.getDB(t);
      if (!s || !a) return;
      const i = tr.get(s);
      if (o.requestMethod === "OPTIONS") return;
      const c = k(o.runtimeConfig) ? o.runtimeConfig : os(t) || {};
      if (i.runtimeConfig = c, c.logEnabled === !1) {
        i.LogQueue.length > 0 && (i.LogQueue.length = 0), i.LogDedupe.clear();
        return;
      }
      const l = Number(o.statusCode) || 0, u = Bi(c.logWriteMode);
      if (u === "error" && (l < 400 || l >= 600)) return;
      const d = ki(o.requestPath, o.category);
      if (d === "image_poster" && c.logWriteImagePoster !== !0 || d === "media_metadata" && c.logWriteMediaMetadata !== !0) return;
      const f = c.logWriteClientIp !== !1, m = c.logWriteColo !== !1, p = c.logWriteUa !== !1, g = (O, C) => String(O || "").slice(0, C), h = g(o.inboundColo || o.inboundIp || o.clientIp || "unknown", 32), y = g(o.outboundColo || o.outboundIp || "", 32), _ = f ? g(o.clientIp || "unknown", 128) : "", S = g(o.nodeName || "unknown", 128) || "unknown", A = g(o.requestPath || "/", 2048) || "/", b = H(), R = Math.max(0, Number(i.LogClearEpochMs) || 0), T = b <= R ? R + 1 : b;
      let L = 0;
      if (o.requestMethod === "HEAD" ? L = 3e5 : (o.category === "segment" || o.category === "prewarm") && (L = 3e4), L > 0) {
        const O = [
          S,
          o.requestMethod || "GET",
          l,
          A,
          _,
          y
        ].join("|"), C = i.LogDedupe.get(O);
        if (C && b - C < L) return;
        if (i.LogDedupe.set(O, b), i.LogDedupe.size > F.Defaults.LogDedupeMax) {
          for (const [v, B] of i.LogDedupe)
            if (i.LogDedupe.has(v) && ((b - B > L || i.LogDedupe.size > F.Defaults.LogDedupeTrimTarget) && i.LogDedupe.delete(v), i.LogDedupe.size <= F.Defaults.LogDedupeTrimTarget))
              break;
        }
      }
      if (i.LogQueue.push({
        timestamp: T,
        nodeName: S,
        requestPath: A,
        requestMethod: o.requestMethod || "GET",
        statusCode: l,
        responseTime: Number(o.responseTime) || 0,
        clientIp: _,
        inboundColo: m ? h : null,
        outboundColo: m ? y : null,
        userAgent: p && g(o.userAgent, 512) || null,
        referer: g(o.referer, 1024) || null,
        category: o.category || "api",
        errorDetail: g(o.errorDetail, 2048) || null,
        detailJson: o.detailJson ? rl(o.detailJson) : null,
        createdAt: new Date(T).toISOString()
      }), i.LogQueue.length > F.Defaults.LogQueueMax) {
        const O = Math.min(F.Defaults.LogQueueOverflowDropCount, i.LogQueue.length);
        i.LogQueue.splice(0, O), e.patchOpsStatus(t, { log: {
          lastOverflowAt: (/* @__PURE__ */ new Date()).toISOString(),
          lastOverflowDropCount: O,
          queueLengthAfterDrop: i.LogQueue.length
        } }, a), console.error(`Log queue overflow, dropping ${O} logs to preserve isolate headroom.`);
      }
      i.LogLastFlushAt || (i.LogLastFlushAt = b);
      const D = Number(c.logWriteDelayMinutes), E = Number(c.logFlushCountThreshold), w = Math.max(0, Number.isFinite(D) ? D * 6e4 : F.Defaults.LogFlushDelayMinutes * 6e4), N = Math.max(1, Number.isFinite(E) ? Math.floor(E) : F.Defaults.LogFlushCountThreshold);
      (u === "error" || i.LogQueue.length >= N || w === 0 || b - i.LogLastFlushAt >= w) && r.scheduleFlush(t, a);
    },
    async flush(t) {
      const a = e.getDB(t), o = tr.get(a);
      if (!a || o.LogQueue.length === 0) return;
      const s = k(o.runtimeConfig) ? o.runtimeConfig : os(t) || {}, i = ze(s.scheduleUtcOffsetMinutes);
      if (s.logEnabled === !1) {
        o.LogQueue.length = 0, o.LogDedupe.clear();
        return;
      }
      await e.ensureSysStatusTable(a);
      const c = await e.resolveLogsReadiness({
        db: a,
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
      const l = Number(s.logBatchChunkSize), u = Number(s.logBatchRetryCount), d = Number(s.logBatchRetryBackoffMs), f = ue(l, F.Defaults.LogBatchChunkSize, 1, 100), m = ue(u, F.Defaults.LogBatchRetryCount, 0, 5), p = ue(d, F.Defaults.LogBatchRetryBackoffMs, 0, 5e3), g = e.getOpsStatusDbScope("log");
      let h = 0, y = 0, _ = 0, S = 0;
      const A = /* @__PURE__ */ new Map(), b = (R = []) => {
        const T = e.summarizeStatsHourlyEntries(R, { utcOffsetMinutes: i });
        for (const L of T) {
          const D = `${L.bucketDate}:${L.bucketHour}`, E = A.get(D) || {
            bucketDate: L.bucketDate,
            bucketHour: L.bucketHour,
            requestCount: 0,
            playCount: 0,
            playbackInfoCount: 0
          };
          E.requestCount += Math.max(0, Number(L.requestCount) || 0), E.playCount += Math.max(0, Number(L.playCount) || 0), E.playbackInfoCount += Math.max(0, Number(L.playbackInfoCount) || 0), A.set(D, E);
        }
      };
      try {
        const R = Math.max(o.LogClearEpochMs || 0, await e.getLogClearEpochMs(t));
        for (; o.LogQueue.length > 0; ) {
          const L = o.LogQueue.splice(0, f).filter((N) => (Number(N?.timestamp) || 0) > R);
          if (!L.length) continue;
          _ = L.length, S = 0;
          const D = JSON.stringify(L);
          if (ve(D) > Gt) throw Ac("proxy_logs.batch", D);
          const E = a.prepare(`INSERT INTO proxy_logs (timestamp, node_name, request_path, request_method, status_code, response_time, client_ip, inbound_colo, outbound_colo, user_agent, referer, category, error_detail, detail_json, created_at)
						SELECT
							CAST(json_extract(entry.value, '$.timestamp') AS INTEGER),
							json_extract(entry.value, '$.nodeName'), json_extract(entry.value, '$.requestPath'), json_extract(entry.value, '$.requestMethod'),
							CAST(json_extract(entry.value, '$.statusCode') AS INTEGER), CAST(json_extract(entry.value, '$.responseTime') AS INTEGER),
							json_extract(entry.value, '$.clientIp'), json_extract(entry.value, '$.inboundColo'), json_extract(entry.value, '$.outboundColo'),
							json_extract(entry.value, '$.userAgent'), json_extract(entry.value, '$.referer'), json_extract(entry.value, '$.category'),
							json_extract(entry.value, '$.errorDetail'), json_extract(entry.value, '$.detailJson'), json_extract(entry.value, '$.createdAt')
						FROM json_each(?) AS entry
						WHERE CAST(json_extract(entry.value, '$.timestamp') AS INTEGER) > COALESCE((
							SELECT CAST(json_extract(payload, '$.clearEpochMs') AS INTEGER)
							FROM ${zp}
							WHERE scope = ?
							LIMIT 1
						), 0)`).bind(D, g);
          let w = 0;
          for (; ; ) try {
            await E.run();
            break;
          } catch (N) {
            if (w >= m) throw N;
            w += 1, y += 1, p > 0 && await qs(p * w);
          }
          c.statsReady === !0 && b(L), h += L.length, S += L.length;
        }
        if (c.statsReady === !0 && A.size > 0) try {
          await e.upsertStatsHourlyBuckets(a, [...A.values()], { useBatch: !0 });
        } catch (L) {
          console.warn("upsertStatsHourlyBuckets failed", L);
        }
        const T = {
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
        h > 0 ? await e.bumpLogsRevision(t, T) : await e.patchOpsStatus(t, { log: T });
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
          lastDroppedBatchSize: Math.max(0, _ - S),
          lastFlushWrittenBeforeError: h,
          queueLengthAfterFlush: o.LogQueue.length
        } }), console.log("Log flush failed, dropping batch.", R);
      }
    }
  };
  return r;
}
var On = "sys_status", Yt = "sys_locks", ra = "scheduled", Hs = Object.freeze({
  log: "ops_status:log",
  scheduled: "ops_status:scheduled",
  dnsIpPool: "ops_status:dns_ip_pool"
});
function Gp(n = {}) {
  const { bindingPort: e, schemaReadinessPort: r, statusPersistence: t } = n, a = {
    async getOpsStatusPayloadFromDb(o, s) {
      if (!o || !s) return null;
      const i = t.getOpsStatusPayloadCache(o), c = i?.get(String(s));
      if (c && Number(c.expiresAt) > H()) return c.payload;
      if (c && i.delete(String(s)), !await t.ensureSysStatusTable(o)) return null;
      try {
        const l = await o.prepare(`SELECT payload FROM ${On} WHERE scope = ? LIMIT 1`).bind(s).first(), u = l?.payload ? typeof l.payload == "string" ? JSON.parse(l.payload) : l.payload : null;
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
      const i = await o.prepare(`SELECT payload FROM ${On} WHERE scope = ? LIMIT 1`).bind(s).first();
      return i?.payload ? typeof i.payload == "string" ? JSON.parse(i.payload) : i.payload : null;
    },
    async putOpsStatusPayloadToDb(o, s, i, c) {
      if (!o || !s || !i || typeof i != "object" || !await t.ensureSysStatusTable(o)) return !1;
      const l = JSON.stringify(i);
      return ve(l) > Gt ? !1 : (await o.prepare(`INSERT INTO ${On} (scope, payload, updated_at) VALUES (?, ?, ?)
		ON CONFLICT(scope) DO UPDATE SET payload = excluded.payload, updated_at = excluded.updated_at`).bind(s, l, Number(c) || H()).run(), t.cacheOpsStatusPayload(o, s, i), !0);
    },
    getOpsStatusSectionEntries() {
      return Object.entries(Hs);
    },
    async getOpsStatusRootFromStores(o) {
      const s = o?.db || null;
      if (!s) return {};
      const i = await a.getOpsStatusPayloadFromDb(s, t.getOpsStatusDbScope()), c = i && typeof i == "object" ? i : {}, l = t.getOpsStatusShadowPatch(s);
      return Xe(c, l && typeof l == "object" ? l : {});
    },
    async getOpsStatusRoot(o) {
      return a.getOpsStatusRootFromStores(t.resolveOpsStatusStores(o));
    },
    async getOpsStatusSectionFromStores(o, s) {
      const i = o?.db || null;
      if (!s) return {};
      if (!Hs[s]) return {};
      const c = async () => {
        if (!i) return null;
        const f = await a.getOpsStatusPayloadFromDb(i, t.getOpsStatusDbScope(s));
        return f && typeof f == "object" ? f : null;
      }, [l, u] = await Promise.all([a.getOpsStatusRootFromStores(o), c()]), d = l && typeof l[s] == "object" ? l[s] : {};
      return Xe(u && typeof u == "object" ? u : {}, d);
    },
    async getOpsStatusSection(o, s) {
      return a.getOpsStatusSectionFromStores(t.resolveOpsStatusStores(o), s);
    },
    async getOpsStatusFromStores(o) {
      const s = o?.db || null;
      if (!s) return {};
      const i = await a.getOpsStatusRootFromStores(o), c = i && typeof i == "object" ? { ...i } : {};
      let l = typeof c.updatedAt == "string" ? c.updatedAt : "";
      const u = await Promise.all(a.getOpsStatusSectionEntries().map(async ([d]) => {
        const f = await a.getOpsStatusPayloadFromDb(s, t.getOpsStatusDbScope(d)), m = i && typeof i[d] == "object" ? i[d] : {};
        return [d, Xe(f && typeof f == "object" ? f : {}, m)];
      }));
      for (const [d, f] of u)
        !f || typeof f != "object" || Object.keys(f).length && (c[d] = Xe(c[d], f), typeof f.updatedAt == "string" && f.updatedAt > l && (l = f.updatedAt));
      return l && (c.updatedAt = l), c;
    },
    async getOpsStatus(o) {
      return a.getOpsStatusFromStores(t.resolveOpsStatusStores(o));
    },
    getLogClearEpochMsFromStatus(o) {
      const s = Number(o?.clearEpochMs);
      return Number.isFinite(s) && s > 0 ? Math.floor(s) : 0;
    },
    async getLogClearEpochMs(o) {
      const s = await a.getOpsStatusSection(o, "log"), i = a.getLogClearEpochMsFromStatus(s), c = tr.get(t.resolveOpsStatusStores(o).db);
      return i > c.LogClearEpochMs && (c.LogClearEpochMs = i), i;
    },
    async patchOpsStatus(o, s, i = null) {
      const c = t.resolveOpsStatusStores(o);
      if (!c.db) return {};
      const l = s && typeof s == "object" ? s : {}, u = Object.keys(l);
      if (!u.length) return await a.getOpsStatusFromStores(c);
      const d = t.buildOpsStatusRootPatch(l);
      if (!Object.keys(d).length) return await a.getOpsStatusFromStores(c);
      const f = t.getOpsStatusShadowState(c.db);
      f && (f.pendingPatch = Xe(f.pendingPatch && typeof f.pendingPatch == "object" ? f.pendingPatch : {}, d));
      const m = async () => await t.flushOpsStatusShadow(c, { patchKeys: u }), p = Promise.resolve(Qe.OpsStatusWriteChain).catch((g) => {
        Fe("ops_status.write_chain.previous_failure", g, { patchKeys: u });
      }).then(m);
      return Qe.OpsStatusWriteChain = p.catch((g) => {
        Fe("ops_status.write_chain.current_failure", g, { patchKeys: u });
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
      if (r.isD1SchemaReadyCached(o, "scheduledLeaseTable")) return !0;
      let s = J.ScheduledLeaseDbReady.get(o);
      s || (s = (async () => {
        try {
          return await o.prepare(`CREATE TABLE IF NOT EXISTS ${Yt} (scope TEXT PRIMARY KEY, token TEXT NOT NULL, owner TEXT NOT NULL, acquired_at INTEGER NOT NULL, renewed_at INTEGER, expires_at INTEGER NOT NULL)`).run(), await o.prepare(`CREATE INDEX IF NOT EXISTS idx_sys_locks_expires_at ON ${Yt} (expires_at DESC)`).run(), r.markD1SchemaReady(o, "scheduledLeaseTable"), !0;
        } catch (i) {
          return console.warn("scheduled lease table init failed", i), !1;
        }
      })(), J.ScheduledLeaseDbReady.set(o, s));
      try {
        return await s;
      } finally {
        J.ScheduledLeaseDbReady.get(o) === s && J.ScheduledLeaseDbReady.delete(o);
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
    async getScheduledLeaseLockFromDb(o, s = ra) {
      if (!o || !await a.ensureScheduledLeaseTable(o)) return null;
      try {
        const i = await o.prepare(`SELECT token, owner, acquired_at, renewed_at, expires_at FROM ${Yt} WHERE scope = ? LIMIT 1`).bind(String(s || ra)).first();
        return a.normalizeScheduledLeaseLock(i, "d1");
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
      if (!await a.ensureScheduledLeaseTable(o)) return {
        acquired: !1,
        reason: "db_init_failed",
        backend: "d1"
      };
      const i = H(), c = Math.max(F.Defaults.ScheduledLeaseMinMs, Number(s.leaseMs) || F.Defaults.ScheduledLeaseMs), l = String(s.token || `${i}-${Math.random().toString(36).slice(2, 10)}`), u = String(s.owner || "scheduled"), d = String(s.scope || ra), f = i + c;
      try {
        await o.prepare(`INSERT INTO ${Yt} (scope, token, owner, acquired_at, renewed_at, expires_at)
          VALUES (?, ?, ?, ?, NULL, ?)
          ON CONFLICT(scope) DO UPDATE SET
            token = excluded.token,
            owner = excluded.owner,
            acquired_at = excluded.acquired_at,
            renewed_at = NULL,
            expires_at = excluded.expires_at
          WHERE ${Yt}.expires_at <= ?`).bind(d, l, u, i, f, i).run();
        const m = await a.getScheduledLeaseLockFromDb(o, d);
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
      const i = a.resolveScheduledLeaseStores(o);
      return i.db ? await a.tryAcquireScheduledLeaseWithDb(i.db, s) : {
        acquired: !1,
        reason: "db_not_configured",
        backend: "d1"
      };
    },
    async renewScheduledLeaseWithDb(o, s, i, c = {}) {
      if (!o || !s || !await a.ensureScheduledLeaseTable(o)) return null;
      const l = H(), u = Math.max(F.Defaults.ScheduledLeaseMinMs, Number(i) || F.Defaults.ScheduledLeaseMs), d = String(c.scope || ra);
      try {
        await o.prepare(`UPDATE ${Yt}
          SET owner = ?, renewed_at = ?, expires_at = ?
          WHERE scope = ? AND token = ?`).bind(String(c.owner || "scheduled"), l, l + u, d, String(s)).run();
        const f = await a.getScheduledLeaseLockFromDb(o, d);
        return f && f.token === String(s) ? f : null;
      } catch {
        return null;
      }
    },
    async renewScheduledLease(o, s, i, c = {}) {
      const l = a.resolveScheduledLeaseStores(o);
      return l.db ? await a.renewScheduledLeaseWithDb(l.db, s, i, c) : null;
    },
    async releaseScheduledLeaseWithDb(o, s, i = {}) {
      if (!o || !s || !await a.ensureScheduledLeaseTable(o)) return !1;
      const c = String(i.scope || ra);
      try {
        return await o.prepare(`DELETE FROM ${Yt} WHERE scope = ? AND token = ?`).bind(c, String(s)).run(), !0;
      } catch {
        return !1;
      }
    },
    async releaseScheduledLease(o, s, i = {}) {
      const c = a.resolveScheduledLeaseStores(o);
      return c.db ? await a.releaseScheduledLeaseWithDb(c.db, s, i) : !1;
    }
  };
  return a;
}
function lr(n, e = "") {
  const r = String(n || "request_aborted").trim() || "request_aborted", t = new Error(e ? `${r}_${e}` : r);
  return r === "client_aborted" ? t.code = "CLIENT_ABORTED" : r === "downstream_cancelled" ? t.code = "DOWNSTREAM_CANCELLED" : r === "stream_idle_timeout" ? t.code = "STREAM_IDLE_TIMEOUT" : t.code = "REQUEST_ABORTED", t;
}
function Qc(n) {
  const e = new AbortController();
  let r = "", t = null, a = null, o = null;
  const s = /* @__PURE__ */ new Set(), i = (l) => {
    if (s.size)
      for (const u of [...s]) try {
        u(l);
      } catch {
      }
  }, c = (l = "request_aborted") => {
    const u = String(l || "request_aborted").trim() || "request_aborted";
    if (r || (r = u), a && !a.signal.aborted) try {
      a.abort(r);
    } catch {
    }
    if (!e.signal.aborted) try {
      e.abort(r);
    } catch {
    }
    i(r);
  };
  if (n && typeof n.addEventListener == "function") {
    const l = () => c("client_aborted");
    n.aborted ? l() : (n.addEventListener("abort", l, { once: !0 }), t = () => n.removeEventListener("abort", l));
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
      if (o && (o(), o = null), a = l || null, !l) return () => {
      };
      const u = () => {
        try {
          l.abort(r || "request_aborted");
        } catch {
        }
      };
      return r || e.signal.aborted ? u() : e.signal.addEventListener("abort", u, { once: !0 }), o = () => {
        e.signal.removeEventListener("abort", u), a === l && (a = null);
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
      } else a = null;
      s.clear();
    }
  };
}
function jp(n = []) {
  const e = new AbortController(), r = [], t = (a = "linked_abort") => {
    if (!e.signal.aborted)
      try {
        e.abort(a);
      } catch {
      }
  };
  for (const a of Array.isArray(n) ? n : [n]) {
    if (!a || typeof a.addEventListener != "function") continue;
    const o = () => t(a.reason || "linked_abort");
    if (a.aborted) {
      o();
      continue;
    }
    a.addEventListener("abort", o, { once: !0 }), r.push(() => a.removeEventListener("abort", o));
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
async function Vp(n, e, r = null) {
  return await new Promise((t, a) => {
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
        a(u);
      }
    };
    r?.onAbort && (i = r.onAbort((u) => l(lr(u)))), Number(e) > 0 && (s = setTimeout(() => c({
      timedOut: !0,
      value: null
    }), Math.max(0, Number(e) || 0))), Promise.resolve(n).then((u) => c({
      timedOut: !1,
      value: u
    }), l);
  });
}
async function qp(n, e = null) {
  const r = Math.max(0, Number(n) || 0);
  if (!(r <= 0))
    return await new Promise((t, a) => {
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
      }, r);
      e?.onAbort && (s = e.onAbort((c) => {
        o || (o = !0, clearTimeout(i), a(lr(c)));
      }));
    });
}
function Xp(n = {}, e = {}) {
  return {
    async tryServeMetadataCache(r) {
      if (!r.metadataCache || !r.metadataCacheKey) return null;
      try {
        const t = hp(r.metadataCacheKey, r.request);
        if (!t) return null;
        const a = await r.metadataCache.match(t);
        if (!a) return null;
        const o = e.buildProxyResponseHeaders(a, r.request, r.dynamicCors, r.finalOrigin, r.requestTraits, {
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
          headers: o
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
    enforceStrictClientDirectAuthPolicy(r, t, a, o = {}) {
      if (!e.shouldGuardClientDirectForRequest(r?.requestTraits, t)) return t;
      const s = a?.clientRedirectAuthPolicy || Ea(a?.newHeaders);
      return a && typeof a == "object" && (a.clientRedirectAuthPolicy = s), r.directRedirectAuthReason = s.reason || "", t;
    },
    createDirectTransportIncompatibleError(r, t = {}) {
      const a = /* @__PURE__ */ new Error("direct_transport_incompatible");
      return a.code = "DIRECT_TRANSPORT_INCOMPATIBLE", a.redirectTrace = t.redirectTrace || r?.redirectTrace || null, a;
    },
    async maybeProbeEntryDirectRangeRedirectResponse(r, t, a, o) {
      if (typeof a != "function") return null;
      const s = e.resolveEntryDirectTargetUrl(r, t);
      let i = null, c = () => {
      };
      const l = Qc(r?.request?.signal);
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
      const u = ba(i.headers.get("Location"), s);
      if (!u) {
        try {
          i.body?.cancel?.();
        } catch {
        }
        return c(), l.dispose(), null;
      }
      const d = r.playbackRelayTargetUrl instanceof URL ? r.playbackRelayTargetUrl : t, f = Da(u, d).proxyPath || (u.origin === d?.origin ? u.pathname : null);
      if (f && ma(f)) {
        const h = e.createRedirectTrace(r.requestUrl);
        e.recordRedirectTraceHop(h, i.status, u, {
          isSameOriginRedirect: !0,
          traceAction: "blocked_web"
        }), e.finalizeRedirectTrace(h, {
          terminalMode: "web_proxy_disabled",
          finalStatus: 404,
          finalHost: u.hostname || ""
        }), r.redirectTrace = h, r.defaultOutboundColo = Ga(i) || "";
        try {
          i.body?.cancel?.();
        } catch {
        }
        return c(), l.dispose(), e.recordAccessLog(r, e.buildDirectAccessLogPayload(r, 404, r.defaultOutboundColo, {
          redirectTrace: h,
          decisionReason: "web_proxy_disabled"
        })), _n(r.requestMethod, r.dynamicCors);
      }
      const m = e.buildClientVisibleRedirectUrl(u, r.playbackRelayTargetUrl || t, r.nodeName, r.nodeKey, r.requestUrl, { entryMode: r.entryMode }) || u, p = e.createRedirectTrace(r.requestUrl);
      e.recordRedirectTraceHop(p, i.status, u, {
        isSameOriginRedirect: u.origin === s.origin,
        traceAction: "direct",
        dataPlaneMode: o?.dataPlaneMode
      }), e.finalizeRedirectTrace(p, {
        terminalMode: "client_redirect",
        finalStatus: i.status,
        finalHost: String(u.hostname || "").trim().toLowerCase()
      }), r.redirectTrace = p, r.defaultOutboundColo = Ga(i) || "";
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
        decisionReason: String(o?.reason || o?.traceLabel || "").trim()
      })), c(), l.dispose(), new Response(r.requestMethod === "HEAD" ? null : i.body, {
        status: i.status,
        statusText: i.statusText,
        headers: g
      });
    },
    async maybeBuildEntryDirectResponse(r, t, a = null, o = null) {
      if (r?.forceWorkerProxy === !0) return null;
      const s = e.enforceStrictClientDirectAuthPolicy(r, r.entryRoutingDecision, a, {
        redirectStatus: r.entryRoutingDecision?.redirectStatus || 307,
        redirectMethod: r.requestMethod
      });
      if (r.entryRoutingDecision = s, s?.phase !== "entry" || s?.action !== "DIRECT") return null;
      const i = (rt(t[0]) ? t[0] : null)?.targetUrl || null;
      if (!(i instanceof URL)) return null;
      const c = a?.clientRedirectAuthPolicy || Ea(a?.newHeaders || r.request.headers);
      if (a && typeof a == "object" && (a.clientRedirectAuthPolicy = c), r?.requestTraits?.isBigStream === !0 && r?.requestTraits?.rangeHeader && c.hasQueryAuth !== !0 && c.hasHeaderAuth !== !0 && c.hasCookieAuth !== !0) {
        const f = await e.maybeProbeEntryDirectRangeRedirectResponse(r, i, o, s);
        if (f) return f;
      }
      if (c.canDirect !== !0)
        throw r.directRedirectAuthReason = c.reason || "direct_transport_incompatible", e.createDirectTransportIncompatibleError(r);
      const l = Jc(e.resolveEntryDirectTargetUrl(r, i), c), u = new Response(null, {
        status: 307,
        statusText: "Temporary Redirect"
      }), d = e.buildProxyResponseHeaders(u, r.request, r.dynamicCors, r.finalOrigin, r.requestTraits, {
        enableH3: r.enableH3,
        forceH1: r.forceH1,
        imageCacheMaxAge: r.imageCacheMaxAge
      });
      return e.applyProxyRedirectHeaders(d, u, i, r.nodeName, r.nodeKey, l, l, {
        linkVariant: r.linkVariant,
        entryMode: r.entryMode
      }), e.recordAccessLog(r, e.buildDirectAccessLogPayload(r, 307, "")), new Response(null, {
        status: 307,
        statusText: "Temporary Redirect",
        headers: d
      });
    },
    createBuildFetchOptions(r, t) {
      const { request: a, requestMethod: o, requestTraits: s, protocolFallback: i } = r, { newHeaders: c, adminCustomHeaders: l, preparedBody: u, preparedBodyMode: d } = t, f = t?.transportTemplate || null, m = Array.isArray(f?.baseHeaderEntries) ? f.baseHeaderEntries : [...c.entries()], p = f ? f.adminCustomHasOrigin === !0 : l.has("origin"), g = f ? f.adminCustomHasReferer === !0 : l.has("referer"), h = f ? f.hasOriginHeader === !0 : c.has("Origin"), y = f ? f.hasRefererHeader === !0 : c.has("Referer"), _ = String(f?.refererOrigin || "").trim(), S = String(f?.refererPathAndSearch || "/") || "/", A = f ? f.isHotMediaRequest === !0 : s.isBigStream === !0 || s.isManifest === !0 || s.isSegment === !0;
      return async (b, R = {}) => {
        const T = new Headers(m), L = (b instanceof URL ? b : new URL(String(b))).origin, D = R.method || o, E = R.bodyMode || d, w = R.body !== void 0 ? R.body : u, N = R.isExternalRedirect === !0, O = R.protocolFallbackRetry === !0, C = R.stripAuthOnProtocolFallback === !0;
        if (h && !p && T.set("Origin", L), y && !g)
          if (f) _ ? _ !== L && T.set("Referer", `${L}${S}`) : T.set("Referer", L + "/");
          else try {
            const B = new URL(T.get("Referer") || "");
            if (B.origin !== L) {
              const P = new URL(`${B.pathname || "/"}${B.search || ""}`, L);
              T.set("Referer", P.toString());
            }
          } catch {
            T.set("Referer", L + "/");
          }
        N && (A || (Us(T), T.delete("Cookie")), p || T.delete("Origin"), g || T.delete("Referer")), O && i && (C && Us(T), T.set("Connection", "keep-alive")), (s.isBigStream || s.isSmartStrmMedia || s.isManifest || s.isSegment) && s.rangeHeader && !T.has("Range") && T.set("Range", s.rangeHeader), (s.isBigStream || s.isSmartStrmMedia || s.isManifest || s.isSegment) && s.ifRangeHeader && !T.has("If-Range") && T.set("If-Range", s.ifRangeHeader), (D === "GET" || D === "HEAD") && T.delete("Content-Length");
        const v = {
          method: D,
          headers: T,
          redirect: "manual"
        };
        return s.isMetadataCacheable && (v.cache = "no-store"), D !== "GET" && D !== "HEAD" && (E === "buffered" && w !== null && w !== void 0 ? v.body = w.slice(0) : E === "stream" && (v.body = w)), v;
      };
    }
  };
}
function Yp(n = {}, e = {}) {
  return {
    async executeUpstreamFlow(r, t, a) {
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
      ]), s = r.requestTraits?.isSmartStrmMedia === !0 ? {
        mode: "proxy",
        forceVideoDirect: !1,
        forceVideoProxy: !1
      } : ld(r.node, r.currentConfig), i = e.createRedirectTrace(r.requestUrl), c = id(r.requestMethod, r.requestTraits, { playbackRelayTargetUrl: r.playbackRelayTargetUrl });
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
        retryableStatuses: o,
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
        retryableStatuses: o,
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
      let u = l.response, d = l.targetRecord || null, f = d?.targetUrl || (r.playbackRelayTargetUrl instanceof URL ? new URL(r.playbackRelayTargetUrl.toString()) : null), m = l.finalUrl, p = l.releaseFetchController, g = l.protocolFallbackRetry === !0, h = !1, y = null, _ = 0, S = r.requestMethod, A = t.preparedBodyMode, b = t.preparedBody;
      for (r.defaultOutboundColo = Ga(u) || ""; u.status >= 300 && u.status < 400 && _ < 8; ) {
        const R = Number(u.status) || 0, T = ba(u.headers.get("Location"), m || f);
        if (!T) {
          e.finalizeRedirectTrace(i, {
            terminalMode: "invalid_redirect_target",
            finalStatus: R,
            finalHost: m?.hostname || f?.hostname || ""
          });
          break;
        }
        const L = Da(T, f).proxyPath || (T.origin === f?.origin ? T.pathname : null);
        if (L && ma(L)) {
          e.recordRedirectTraceHop(i, R, T, {
            isSameOriginRedirect: !0,
            traceAction: "blocked_web"
          }), e.finalizeRedirectTrace(i, {
            terminalMode: "web_proxy_disabled",
            finalStatus: 404,
            finalHost: T.hostname || ""
          });
          try {
            u.body?.cancel?.();
          } catch {
          }
          try {
            p?.();
          } catch {
          }
          u = _n(r.requestMethod, r.dynamicCors), m = T, p = null, _ += 1;
          break;
        }
        const D = e.enforceStrictClientDirectAuthPolicy(r, e.getRoutingDecision({
          phase: "redirect",
          nextUrl: T,
          activeTargetBase: f,
          redirectMethod: S,
          redirectBodyMode: A,
          forceWorkerProxy: r.forceWorkerProxy === !0,
          forceWorkerProxyReason: r.forceWorkerProxyReason,
          currentStatus: u.status,
          policy: {
            forceVideoDirect: s.forceVideoDirect === !0,
            forceVideoProxy: s.forceVideoProxy === !0,
            currentStatus: u.status
          },
          routingDecisionMode: r.routingDecisionMode
        }), t, {
          redirectStatus: u.status,
          redirectMethod: S,
          redirectBodyMode: A
        });
        if (e.recordRedirectTraceHop(i, R, T, D), D.action === "DIRECT") {
          const C = t.clientRedirectAuthPolicy || Ea(t.newHeaders);
          if (C.canDirect !== !0)
            throw r.directRedirectAuthReason = C.reason || "direct_transport_incompatible", e.finalizeRedirectTrace(i, {
              terminalMode: "direct_incompatible",
              finalStatus: 409,
              finalHost: T.hostname || ""
            }), e.createDirectTransportIncompatibleError(r, { redirectTrace: i });
          const v = e.buildClientVisibleRedirectUrl(T, f, r.nodeName, r.nodeKey, r.requestUrl, {
            preserveWorkerProxy: D.preserveWorkerProxy === !0,
            linkVariant: r.linkVariant,
            entryMode: r.entryMode
          }) || T;
          y = D.preserveWorkerProxy === !0 ? v : Jc(v, t.clientRedirectAuthPolicy || t.newHeaders), e.finalizeRedirectTrace(i, {
            terminalMode: "client_redirect",
            finalStatus: R,
            finalHost: y.hostname || T.hostname || ""
          });
          break;
        }
        const E = D.nextMethod, w = D.nextBodyMode, N = w === "none" ? null : b;
        try {
          u.body?.cancel?.();
        } catch {
        }
        try {
          p?.();
        } catch {
        }
        let O;
        try {
          O = await e.fetchAbsoluteWithRetryLoop({
            absoluteUrl: T,
            buildFetchOptions: a,
            fetchOptions: {
              method: E,
              bodyMode: w,
              body: N,
              isExternalRedirect: !D.isSameOriginRedirect
            },
            retryableStatuses: o,
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
            finalStatus: R,
            finalHost: T.hostname || ""
          }), C && typeof C == "object" && (C.redirectTrace = i), C;
        }
        u = O.response, m = O.finalUrl, p = O.releaseFetchController, g = g || O.protocolFallbackRetry === !0, S = E, A = w, b = N, r.defaultOutboundColo = Ga(u) || "", D.isSameOriginRedirect || (h = !0), _ += 1;
      }
      if (!i.terminalMode && (i.hops.length > 0 || i.finalStatus > 0)) {
        const R = Number(u?.status) || 0;
        if (R >= 300 && R < 400) {
          const T = ba(u.headers.get("Location"), m || f);
          e.finalizeRedirectTrace(i, {
            terminalMode: _ >= 8 ? "redirect_limit" : "upstream_redirect_passthrough",
            finalStatus: R,
            finalHost: T?.hostname || m?.hostname || f?.hostname || ""
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
    async buildSuccessResponse(r, t, a, o = null) {
      let s = await e.guardApiResponseMime(r, a);
      r?.requestTraits?.isPlaybackInfoRequest === !0 && (s = await e.guardPlaybackInfoResponseContract(r, s), er(s.playbackInfoRepresentation) && (s = await e.maybeRewritePlaybackInfoResponse(r, s)));
      const i = String(s.redirectTrace?.terminalMode || r?.redirectTrace?.terminalMode || ""), c = r?.playbackAbsoluteFallbackEligible === !0 && !s.directRedirectUrl && i !== "web_proxy_disabled" && Number(s.response.status) === 404;
      c && (r.playbackFallback = "relative_307");
      const l = e.shouldLogDirectAccess(r, { directRedirectUrl: s.directRedirectUrl }), u = l ? "" : e.buildRedirectDiagnosticDetail(s.redirectTrace || r.redirectTrace), d = s.response.status, f = c ? 307 : s.directRedirectUrl && Number(s.redirectTrace?.finalStatus) || d, m = c ? "Temporary Redirect" : s.response.statusText;
      e.markFailoverBusinessSuccess(r, s.activeTargetRecord, { status: d });
      const p = e.buildProxyResponseHeaders(s.response, r.request, r.dynamicCors, r.finalOrigin, r.requestTraits, {
        enableH3: r.enableH3,
        forceH1: r.forceH1,
        proxiedExternalRedirect: s.proxiedExternalRedirect,
        imageCacheMaxAge: r.imageCacheMaxAge
      });
      e.applyProxyRedirectHeaders(p, s.response, s.activeTargetBase, r.nodeName, r.nodeKey, s.directRedirectUrl, s.finalUrl, {
        linkVariant: r.linkVariant,
        entryMode: r.entryMode
      }), c && (Mc(p), p.set("Location", r.playbackAbsoluteFallbackLocation || "/"), p.set("Cache-Control", "no-store"));
      const g = !c && e.shouldManageProxyResponseBody(r, s), h = r.defaultOutboundColo || "", y = e.buildRuntimeDiagnosticDetail(r), _ = l ? e.buildDirectAccessDiagnosticDetail(r, {
        directRedirectUrl: s.directRedirectUrl,
        redirectTrace: s.redirectTrace || r.redirectTrace
      }) : e.appendLogDiagnosticDetail(e.appendLogDiagnosticDetail(e.extractProxyErrorDetail(s.response), e.buildStreamDiagnosticDetail(r, s.response, {
        flow: g ? "managed" : "passthrough",
        source: "upstream",
        upstreamHost: s.finalUrl?.hostname || s.activeTargetBase?.hostname || "",
        protocolFallbackRetry: s.protocolFallbackRetry === !0,
        idleTimeoutMs: g ? e.resolveResponseStreamIdleTimeoutMs(r.requestTraits, r.upstreamTimeoutMs) : 0
      })), e.appendLogDiagnosticDetail(y, u)), S = l ? e.buildDirectAccessLogPayload(r, f, h, {
        directRedirectUrl: s.directRedirectUrl,
        redirectTrace: s.redirectTrace || r.redirectTrace
      }) : {
        statusCode: c ? f : d,
        category: e.classifyProxyLogCategory(r.requestTraits),
        errorDetail: _,
        detailJson: e.buildStructuredLogDetail(r, { statusCode: c ? f : d }, {
          transport: null,
          deliveryMode: "proxy",
          redirectTrace: s.redirectTrace || r.redirectTrace,
          redirectMode: c ? "playback_relative_fallback" : s.redirectTrace?.terminalMode || "proxied_follow",
          redirectUrl: s.finalUrl,
          decisionReason: c ? "playback_relative_fallback" : s.redirectTrace?.terminalMode || "proxied_follow",
          protocolFailureReason: s.protocolFallbackRetry === !0 ? e.classifyProtocolFailureReason("protocol_fallback", {
            upstreamStatus: d,
            protocolFallbackRetry: !0
          }) : Number(d) >= 400 ? e.classifyProtocolFailureReason(_ || s.response.statusText || "", {
            upstreamStatus: d,
            protocolFallbackRetry: s.protocolFallbackRetry === !0
          }) : null,
          protocolFallbackRetry: s.protocolFallbackRetry === !0,
          playbackInfoCache: r.playbackInfoCacheState,
          playbackInfoCacheTtlSec: r.playbackInfoCacheTtlSec,
          progressRelayMode: r.progressForwardMode,
          progressIntervalSec: r.videoProgressForwardIntervalSec,
          upstreamHost: s.finalUrl?.hostname || s.activeTargetBase?.hostname || "",
          upstreamStatus: d
        }),
        outboundColo: h
      };
      if (g || e.recordAccessLog(r, S), r.metadataCacheKey && r.ctx && s.response.status === 200) {
        const R = s.response.clone();
        r.ctx.waitUntil(e.storeMetadataCache(r.metadataCacheKey, R, r.requestTraits, {
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
        const R = {
          status: 101,
          statusText: s.response.statusText,
          headers: p,
          webSocket: A.webSocket
        };
        return new Response(null, R);
      }
      let b;
      return g ? b = e.buildManagedProxyResponseBody(r, s, S) : b = e.buildPassthroughProxyResponseBody(r, s), new Response(b, {
        status: f,
        statusText: m,
        headers: p
      });
    }
  };
}
function Jp(n = {}, e = {}) {
  return {
    buildErrorResponse(r, t) {
      const a = t?.message || String(t || "网关或 CF Workers 内部崩溃"), o = String(t?.code || "").toUpperCase(), s = e.buildRedirectDiagnosticDetail(t?.redirectTrace || r.redirectTrace), i = e.buildRuntimeDiagnosticDetail(r);
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
        r.requestLifecycle?.abort?.(o ? o.toLowerCase() : "proxy_error");
      } catch {
      }
      r.requestLifecycle?.dispose?.(), o === "DIRECT_TRANSPORT_INCOMPATIBLE" ? e.recordAccessLog(r, e.buildDirectAccessLogPayload(r, c, r.defaultOutboundColo || "", { redirectTrace: t?.redirectTrace || r.redirectTrace })) : e.recordAccessLog(r, {
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
          decisionReason: o || "proxy_error",
          protocolFailureReason: e.classifyProtocolFailureReason(t, {
            errorCode: o,
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
      const d = new Headers({
        "Content-Type": "application/json; charset=utf-8",
        "Access-Control-Allow-Origin": r.finalOrigin || "*",
        "Cache-Control": "no-store"
      });
      return r.finalOrigin !== "*" && Hr(d, "Origin"), we(d), new Response(JSON.stringify(u), {
        status: c,
        statusText: l,
        headers: d
      });
    },
    async handle(r, t, a, o, s, i, c, l = {}) {
      if (ma(a)) {
        const h = k(l.runtimeConfig) ? l.runtimeConfig : {}, y = Ca(i, r, e.resolveCorsOrigin(h, r));
        return _n(r.method, y);
      }
      let u = await e.prepareExecutionContext(r, t, a, o, s, i, c, l);
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
        const y = e.createBuildFetchOptions(u, g), _ = await e.maybeBuildEntryDirectResponse(u, f, g, y);
        if (_) return _;
        const S = await e.maybeHandlePlaybackProgressRelay(u, g, y, g.retryTargetRecords);
        if (S) return S;
        u.requestLifecycle = Qc(u.request?.signal);
        const A = await e.executeUpstreamFlow(u, g, y);
        return await e.buildSuccessResponse(u, y, A, g);
      } catch (h) {
        return e.buildErrorResponse(u, h);
      }
    }
  };
}
function Qp(n = {}, e = {}) {
  return {
    ...Xp(n, e),
    ...Yp(n, e),
    ...Jp(n, e)
  };
}
function Zp(n = {}, e = {}) {
  const { Logger: r } = n;
  return {
    resolveEntryDirectTargetUrl(t, a) {
      if (t?.playbackRelayTargetUrl instanceof URL) return new URL(t.playbackRelayTargetUrl.toString());
      const o = hr(a, t?.proxyPath || "/");
      return o.search = String(t?.requestUrl?.search || ""), o;
    },
    classifyProxyLogCategory(t) {
      return t.isSegment ? "segment" : t.isManifest ? "manifest" : t.isBigStream || t.isSmartStrmMedia ? "stream" : t.isImage ? "image" : t.isSubtitle ? "subtitle" : t.isStaticFile ? "asset" : t.isWsUpgrade ? "websocket" : "api";
    },
    extractProxyErrorDetail(t) {
      if (t.status < 400) return null;
      const a = [], o = t.headers.get("Server");
      o && a.push(`Server: ${o}`);
      const s = t.headers.get("CF-Ray");
      s && a.push(`CF-Ray: ${s}`);
      const i = t.headers.get("X-Application-Error-Code") || t.headers.get("X-Emby-Error") || t.headers.get("X-MediaBrowser-Error");
      i && a.push(`Media-Server-Error: ${i}`);
      const c = t.headers.get("CF-Cache-Status");
      return c && a.push(`CF-Cache: ${c}`), a.length > 0 ? a.join(" | ") : t.statusText;
    },
    appendLogDiagnosticDetail(t, a) {
      const o = [], s = (c) => {
        const l = String(c || "").trim();
        l && (o.includes(l) || o.push(l));
      };
      if (s(t), s(a), !o.length) return null;
      const i = o.join(" | ");
      return i.length > 1200 ? i.slice(0, 1197) + "..." : i;
    },
    shouldLogDirectAccess(t, a = {}) {
      return !!(e.isEntryDirectDataPlaneMode(t?.entryRoutingDecision?.dataPlaneMode) || a.directRedirectUrl);
    },
    buildDirectAccessDiagnosticDetail(t, a = {}) {
      let o = "直连";
      o = e.appendLogDiagnosticDetail(o, `RoutingMode=${Or(t?.routingDecisionMode)}`), o = e.appendLogDiagnosticDetail(o, e.buildTargetHotCacheDiagnosticDetail(t));
      const s = t?.entryRoutingDecision;
      return e.isEntryDirectDataPlaneMode(s?.dataPlaneMode) && (o = e.appendLogDiagnosticDetail(o, `Direct=entry_307 | Reason=${String(s?.reason || s?.traceLabel || "entry_direct").trim() || "entry_direct"}`)), o = e.appendLogDiagnosticDetail(o, e.buildPlaybackUrlDiagnosticDetail(t)), o = e.appendLogDiagnosticDetail(o, t?.directRedirectAuthReason ? `DirectAuth=${t.directRedirectAuthReason}` : ""), o = e.appendLogDiagnosticDetail(o, e.buildRouteContextDiagnosticDetail(t)), o = e.appendLogDiagnosticDetail(o, e.buildStreamDiagnosticDetail(t, null, {
        force: !0,
        flow: a.directRedirectUrl ? "client_redirect" : "entry_direct",
        source: "client_visible_redirect"
      })), (a.directRedirectUrl || a.redirectTrace) && (o = e.appendLogDiagnosticDetail(o, e.buildRedirectDiagnosticDetail(a.redirectTrace || t?.redirectTrace))), o;
    },
    buildDirectAccessLogPayload(t, a, o = "", s = {}) {
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
        outboundColo: o
      };
    },
    buildStreamDiagnosticDetail(t, a, o = {}) {
      const s = t?.requestTraits || {};
      if (!(o.force === !0 || s.isBigStream === !0 || s.isSmartStrmMedia === !0 || s.isSegment === !0 || s.isManifest === !0)) return "";
      const i = a?.headers, c = [], l = (u, d) => {
        const f = String(d || "").trim();
        f && c.push(`${u}=${f.length > 160 ? f.slice(0, 157) + "..." : f}`);
      };
      return l("Flow", o.flow || "passthrough"), l("Kind", e.classifyProxyLogCategory(s)), l("Source", o.source || "upstream"), l("Range", s.rangeHeader || t?.request?.headers?.get("Range")), l("Content-Range", i?.get("Content-Range")), l("Length", i?.get("Content-Length")), l("Accept-Ranges", i?.get("Accept-Ranges")), l("Cache", o.cacheStatus || i?.get("CF-Cache-Status")), l("Upstream", o.upstreamHost || o.upstreamUrlHost), l("RoutingMode", Or(t?.routingDecisionMode)), l("DirectAuth", t?.directRedirectAuthReason), o.protocolFallbackRetry === !0 && l("Retry", "protocol_fallback"), Number(o.idleTimeoutMs) > 0 && l("Idle", `${Number(o.idleTimeoutMs)}ms`), c.join(" | ");
    },
    buildPlaybackInfoCacheDiagnosticDetail(t) {
      if (t?.requestTraits?.isPlaybackInfoRequest !== !0) return "";
      const a = zt(t?.effectivePlaybackInfoMode), o = String(t?.playbackInfoCacheState || "").trim(), s = String(t?.playbackInfoRewrite || "").trim(), i = [`PlaybackInfoMode=${a}`];
      return s && i.push(`PlaybackInfoRewrite=${s}`), o && i.push(`PlaybackInfoCache=${o}`), Number(t?.playbackInfoCacheTtlSec) > 0 && i.push(`PlaybackInfoCacheTtl=${Number(t.playbackInfoCacheTtlSec)}s`), i.join(" | ");
    },
    buildPlaybackUrlDiagnosticDetail(t) {
      const a = String(t?.playbackUrlMode || "").trim(), o = String(t?.playbackFallback || "").trim(), s = String(t?.playbackPathFix || "").trim(), i = String(t?.rewritePlaybackEntry || "").trim(), c = [];
      return a && c.push(`PlaybackUrlMode=${a}`), o && c.push(`PlaybackFallback=${o}`), s && c.push(`PlaybackPathFix=${s}`), i && c.push(`RewritePlaybackEntry=${i}`), c.join(" | ");
    },
    buildTargetHotCacheDiagnosticDetail(t) {
      const a = String(t?.nodeCacheState || t?.targetHotCacheState || "").trim();
      return a ? t?.nodeCacheState ? `NodeCacheState=${a}` : `TargetHotCache=${a}` : "";
    },
    buildRouteContextDiagnosticDetail(t) {
      const a = t?.routeContextDiagnostics && typeof t.routeContextDiagnostics == "object" ? t.routeContextDiagnostics : null;
      if (!a) return "";
      const o = [], s = (i, c) => {
        const l = String(c || "").trim();
        l && o.push(`${i}=${l}`);
      };
      return s("RouteKind", a.routeKind), s("RequestHost", a.requestHost), s("ConfiguredHost", a.configuredHost), s("ConfiguredLegacyHost", a.configuredLegacyHost), o.push(`LegacyHostRequest=${a.isLegacyHostRequest === !0 ? "true" : "false"}`), o.join(" | ");
    },
    buildRuntimeDiagnosticDetail(t) {
      return e.appendLogDiagnosticDetail(e.appendLogDiagnosticDetail(e.appendLogDiagnosticDetail(e.appendLogDiagnosticDetail(e.buildTargetHotCacheDiagnosticDetail(t), e.buildPlaybackInfoCacheDiagnosticDetail(t)), e.buildFailoverDiagnosticDetail(t)), e.buildPlaybackUrlDiagnosticDetail(t)), e.appendLogDiagnosticDetail(e.buildProgressRelayDiagnosticDetail(t), e.buildRouteContextDiagnosticDetail(t)));
    },
    buildProgressRelayDiagnosticDetail(t) {
      if (t?.requestTraits?.isPlaybackSessionControlRequest !== !0) return "";
      const a = String(t?.progressForwardMode || "").trim();
      if (!a) return "";
      const o = [`ProgressRelay=${a}`];
      Number(t?.videoProgressForwardIntervalSec) > 0 && o.push(`ProgressInterval=${Number(t.videoProgressForwardIntervalSec)}s`);
      const s = String(t?.progressForwardSessionKey || "").trim();
      return s && o.push(`ProgressSession=${ie(s)}`), o.join(" | ");
    },
    collectLogAuthKinds(t, a = null) {
      const o = /* @__PURE__ */ new Set(), s = t?.requestUrl instanceof URL ? t.requestUrl : null;
      if (s) for (const l of s.searchParams.keys()) {
        const u = Na(l);
        if (Xc.has(u) || Yc.has(u)) {
          o.add("query");
          break;
        }
      }
      const i = a?.newHeaders || t?.request?.headers || new Headers(), c = a?.clientRedirectAuthPolicy || Ea(i);
      return c.hasQueryAuth && o.add("query"), c.hasHeaderAuth && o.add("header"), c.hasCookieAuth && o.add("cookie"), [...o];
    },
    pickPrimaryAuthCarrier(t = []) {
      return (t || []).includes("query") ? "query" : (t || []).includes("header") ? "header" : (t || []).includes("cookie") ? "cookie" : "none";
    },
    resolveRedirectScope(t, a) {
      if (!t) return "none";
      try {
        const o = t instanceof URL ? t : new URL(String(t || "")), s = a instanceof URL ? a : new URL(String(a || ""));
        return o.origin === s.origin ? "same_origin" : "external";
      } catch {
        return "external";
      }
    },
    resolveRoutingCapability(t = "proxy", a = [], o = "none") {
      const s = String(t || "").trim().toLowerCase() === "direct" ? "direct" : "proxy", i = e.pickPrimaryAuthCarrier(a), c = o === "same_origin" || o === "external" ? o : "none";
      return kp?.[s]?.[i]?.[c] || {
        deliveryMode: s,
        authCarrier: i,
        redirectScope: c,
        clientVisibleRedirect: s === "direct" && c !== "none",
        workerFollowRedirect: s !== "direct",
        reasonCode: s === "direct" ? "client_redirect" : "worker_follow_redirect"
      };
    },
    classifyProtocolFailureReason(t, a = {}) {
      const o = String(a.errorCode || t?.code || "").trim().toUpperCase(), s = String(a.message || t?.message || t || "").trim().toLowerCase(), i = Number(a.upstreamStatus) || 0;
      return String(a.abortReason || "").trim().toLowerCase() === "stream_idle_timeout" || o === "STREAM_IDLE_TIMEOUT" ? "idle_timeout" : o === "UPSTREAM_TIMEOUT" || s.includes("timed out") || s.includes("timeout") ? "connect_timeout" : s.includes("redirect loop") ? "redirect_loop" : s.includes("too many redirects") || s.includes("redirect limit") ? "redirect_limit_exceeded" : s.includes("tls") || s.includes("ssl") || s.includes("certificate") ? "tls_handshake_failed" : a.protocolFallbackRetry === !0 || s.includes("protocol_fallback") ? "http_version_fallback" : i === 416 || s.includes("range") && (s.includes("416") || s.includes("unsatisfied") || s.includes("satisfiable")) ? "range_unsatisfied" : i >= 400 && i < 500 ? "upstream_4xx" : i >= 500 ? "upstream_5xx" : "unknown_fetch_error";
    },
    buildStructuredLogDetail(t, a = {}, o = {}) {
      const s = String(o.deliveryMode || (e.shouldLogDirectAccess(t, { directRedirectUrl: o.directRedirectUrl }) ? "direct" : "proxy")).trim().toLowerCase() === "direct" ? "direct" : "proxy", i = e.collectLogAuthKinds(t, o.transport), c = o.redirectScope || e.resolveRedirectScope(o.directRedirectUrl || o.redirectUrl || o.finalUrl, t?.requestUrl), l = e.resolveRoutingCapability(s, i, c), u = Number(o.upstreamStatus || a.statusCode || 0) || 0, d = Dd(u), f = t?.routeContextDiagnostics && typeof t.routeContextDiagnostics == "object" ? t.routeContextDiagnostics : null, m = Array.isArray(o.authKindsForwarded) ? [...new Set(o.authKindsForwarded.map((g) => String(g || "").trim().toLowerCase()).filter(Boolean))] : s === "direct" ? i.filter((g) => g === "query") : i, p = e.ensureFailoverTelemetry(t);
      return {
        routingMode: Or(t?.routingDecisionMode),
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
        nodeCacheState: String(o.nodeCacheState || t?.nodeCacheState || "").trim() || null,
        playbackInfoCache: String(o.playbackInfoCache || t?.playbackInfoCacheState || "").trim() || null,
        playbackInfoCacheTtlSec: Number.isFinite(Number(o.playbackInfoCacheTtlSec)) ? Math.max(0, Math.trunc(Number(o.playbackInfoCacheTtlSec))) : Math.max(0, Math.trunc(Number(t?.playbackInfoCacheTtlSec) || 0)),
        playbackInfoMode: t?.requestTraits?.isPlaybackInfoRequest === !0 ? zt(o.playbackInfoMode || t?.effectivePlaybackInfoMode) : null,
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
    recordRedirectTraceHop(t, a, o, s = {}) {
      !t || !o || t.hops.push({
        status: Number(a) || 0,
        kind: s.isSameOriginRedirect === !0 ? "same" : "external",
        action: String(s.traceAction || (e.isEntryDirectDataPlaneMode(s.dataPlaneMode) ? "direct" : "proxy")).trim() || "proxy",
        host: String(o.hostname || "").trim().toLowerCase()
      });
    },
    finalizeRedirectTrace(t, a = {}) {
      if (!t || typeof t != "object") return null;
      const o = String(a.terminalMode || t.terminalMode || "").trim();
      o && (t.terminalMode = o);
      const s = Number(a.finalStatus);
      Number.isFinite(s) && s > 0 && (t.finalStatus = s);
      const i = String(a.finalHost || "").trim().toLowerCase();
      return i && (t.finalHost = i), t;
    },
    buildRedirectDiagnosticDetail(t) {
      if (!t || typeof t != "object") return "";
      const a = Array.isArray(t.hops) ? t.hops : [], o = a.length, s = String(t.terminalMode || "").trim(), i = Number(t.finalStatus) || 0, c = String(t.finalHost || "").trim().toLowerCase();
      if (!o && !s && i <= 0 && !c) return "";
      const l = [];
      s && l.push(`Redirect=${s}`), l.push(`RedirectHops=${o}`);
      const u = a.map((d) => {
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
function eg(n = {}, e = {}) {
  const { Logger: r } = n;
  return {
    buildProxyErrorState: Un,
    async guardApiResponseMime(t, a) {
      return fl(t, a, {
        sanitizePath: Q,
        buildErrorState: Un
      });
    },
    buildMetadataCacheStorageResponse(t, a, o = {}) {
      const s = new Headers(t.headers);
      return s.delete("Set-Cookie"), a.isImage || a.isSubtitle ? s.set("Cache-Control", `public, max-age=${Math.max(0, Number(o.imageCacheMaxAge) || 0)}`) : a.isManifest && s.set("Cache-Control", `public, max-age=${Math.max(0, Number(o.prewarmCacheTtl) || 0)}`), new Response(t.body, {
        status: t.status,
        statusText: t.statusText,
        headers: s
      });
    },
    async storeMetadataCache(t, a, o, s = {}) {
      const i = ur();
      if (!i || !t || !a || a.status !== 200 || s.proxiedExternalRedirect === !0 || o.isManifest && !no(s.sourceUrl)) return !1;
      try {
        return await i.put(t, e.buildMetadataCacheStorageResponse(a, o, s)), !0;
      } catch {
        return !1;
      }
    },
    resolveMetadataTarget(t, a, o, s) {
      const i = String(t || "").trim();
      if (!i) return null;
      let c;
      try {
        if (/^https?:\/\//i.test(i)) c = new URL(i);
        else {
          const d = new URL(i, "https://metadata-prewarm.invalid");
          c = hr(a, d.pathname || "/"), c.search = d.search || "", c.hash = d.hash || "";
        }
      } catch {
        return null;
      }
      if (Rp(c.pathname)) return null;
      const { proxyPath: l } = Da(c, a);
      if (!l) return null;
      const u = l || "/";
      return Vr.test(u) || jr.test(u) || ht.test(u) || pr.test(u) ? {
        upstreamUrl: c,
        proxyPath: u,
        proxySearch: c.search || ""
      } : null;
    },
    buildMetadataPrewarmTargets(t, a, o, s, i, c) {
      const l = /* @__PURE__ */ new Map(), u = Tp(t);
      if (u) {
        const d = e.resolveMetadataTarget(`/Items/${encodeURIComponent(u)}/Images/Primary`, o, s, i);
        d && l.set(`${d.proxyPath}${d.proxySearch}`, d);
      }
      return c !== "poster" && oo(a).forEach((d) => {
        const f = e.resolveMetadataTarget(d, o, s, i);
        f && l.set(`${f.proxyPath}${f.proxySearch}`, f);
      }), [...l.values()].sort((d, f) => vs(d.proxyPath) - vs(f.proxyPath)).slice(0, 4);
    },
    buildBudgetedPrewarmResponse(t, a) {
      const o = Math.max(0, Math.floor(Number(a) || 0)), s = so(t?.headers?.get("Content-Length"));
      if (o <= 0 || Number.isFinite(s) && s > o) {
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
      const u = () => {
        if (!l) {
          l = !0;
          try {
            i.releaseLock();
          } catch {
          }
        }
      }, d = new ReadableStream({
        async pull(f) {
          try {
            const { done: m, value: p } = await i.read();
            if (m) {
              u(), f.close();
              return;
            }
            const g = p instanceof Uint8Array ? p : new Uint8Array(p || 0);
            if (c + g.byteLength > o) {
              try {
                await i.cancel("metadata_prewarm_budget_exceeded");
              } catch {
              }
              u(), f.error(/* @__PURE__ */ new Error("metadata_prewarm_budget_exceeded"));
              return;
            }
            c += g.byteLength, f.enqueue(g);
          } catch (m) {
            u(), f.error(m);
          }
        },
        async cancel(f) {
          try {
            await i.cancel(f);
          } catch {
          }
          u();
        }
      });
      return {
        response: new Response(d, {
          status: t.status,
          statusText: t.statusText,
          headers: t.headers
        }),
        getBytes: () => c
      };
    },
    async runMetadataPrewarmSingleFlight(t, a) {
      const o = ne.MetadataPrewarmTasks, s = t instanceof Request ? t.url : String(t || "");
      if (!s) return {
        skipped: !0,
        result: null
      };
      const i = o.get(s);
      if (i) return {
        joined: !0,
        result: await i
      };
      if (o.size >= wu) return {
        skipped: !0,
        result: null
      };
      const c = Promise.resolve().then(a).finally(() => {
        o.get(s) === c && o.delete(s);
      });
      return o.set(s, c), {
        joined: !1,
        result: await c
      };
    },
    scheduleMetadataPrewarmResponse(t, a, o, s, i, c, l, u, d, f = {}) {
      if (!d || t.method !== "GET" || o.enablePrewarm !== !0 || o.isPlaybackInfoRequest === !0 || o.isImage || o.isSubtitle || o.isManifest || o.isSegment || o.isBigStream || !(a.status >= 200 && a.status < 300) || !Ha(a.headers.get("Content-Type"))) return;
      let m;
      try {
        m = a.clone();
      } catch {
        return;
      }
      const p = (async () => {
        const g = await Pe(m, Ei);
        if (g.exceeded) return;
        let h;
        try {
          h = JSON.parse(g.text);
        } catch {
          return;
        }
        const y = e.buildMetadataPrewarmTargets(f.proxyPath, h, s, c, l, o.prewarmDepth);
        if (!y.length) return;
        const _ = ur();
        if (!_) return;
        let S = ue(o.prewarmPrefetchBytes, F.Defaults.PrewarmPrefetchBytes, 0, Ao);
        for (const A of y) {
          if (S <= 0) break;
          if (!no(A.upstreamUrl)) continue;
          const b = await gp(t, A.upstreamUrl), R = Vc(u, c, l, A.proxyPath, {
            search: A.proxySearch,
            nodeCacheRevision: f.nodeCacheRevision,
            entryMode: f.entryMode,
            identityPartition: b,
            cachePolicyRevision: zc(A.proxyPath, f)
          });
          if (R) {
            if (_ && R) try {
              if (await _.match(R)) continue;
            } catch {
            }
            try {
              const T = await e.runMetadataPrewarmSingleFlight(R, async () => {
                const L = await i(A.upstreamUrl, { method: "GET" });
                L.cache = "no-store";
                const D = new Headers(L.headers);
                D.delete("Range"), D.delete("If-Modified-Since"), D.delete("If-None-Match"), D.set("X-Metadata-Prewarm", "1"), L.headers = D;
                const E = new AbortController();
                L.signal = E.signal;
                const w = ue(f.prewarmTimeoutMs, Su, 250, 1e4), N = setTimeout(() => E.abort(), w);
                try {
                  const O = await We(A.upstreamUrl.toString(), L);
                  if (O.status !== 200) {
                    try {
                      await O.body?.cancel?.();
                    } catch {
                    }
                    return {
                      cached: !1,
                      bytes: 0
                    };
                  }
                  const C = e.buildBudgetedPrewarmResponse(O, S);
                  if (!C) return {
                    cached: !1,
                    bytes: 0
                  };
                  const v = {
                    isImage: Vr.test(A.proxyPath) || jr.test(A.proxyPath),
                    isSubtitle: pr.test(A.proxyPath),
                    isManifest: ht.test(A.proxyPath)
                  };
                  return {
                    cached: await e.storeMetadataCache(R, C.response, v, {
                      ...f,
                      sourceUrl: A.upstreamUrl
                    }),
                    bytes: C.getBytes()
                  };
                } finally {
                  clearTimeout(N), E.abort();
                }
              });
              !T.joined && T.result && (S = Math.max(0, S - (Number(T.result.bytes) || 0)));
            } catch {
            }
          }
        }
      })().catch(() => {
      });
      return d.waitUntil(p), p;
    },
    shouldRetryWithProtocolFallback(t, a = {}) {
      return !(t.status !== 403 || a.isRetry !== !1 || a.protocolFallback !== !0 || a.allowAutomaticRetry !== !0 || a.preparedBodyMode === "stream");
    },
    resolveResponseStreamIdleTimeoutMs(t) {
      return t?.isManifest === !0 ? F.Defaults.ProxyPlaylistIdleTimeoutMs : t?.isSegment === !0 ? F.Defaults.ProxyStreamIdleTimeoutMs : 0;
    },
    shouldManageProxyResponseBody(t, a) {
      return (t.requestTraits.isSegment === !0 || t.requestTraits.isManifest === !0) && t.requestMethod !== "HEAD" && a.response.status !== 101 && !!a.response.body;
    },
    buildPassthroughProxyResponseBody(t, a) {
      const o = t.requestMethod === "HEAD" ? null : a.response.body;
      try {
        a.releaseFetchController?.();
      } catch {
      }
      return t.requestLifecycle?.dispose?.(), o;
    },
    buildManagedProxyResponseBody(t, a, o) {
      const s = a.response.body, i = t.requestLifecycle, c = o && typeof o == "object" ? o : {
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
      const l = s.getReader(), u = e.resolveResponseStreamIdleTimeoutMs(t.requestTraits, t.upstreamTimeoutMs), d = {
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
          ...k(b) ? b : {}
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
      }, _ = () => {
        p !== null && (clearTimeout(p), p = null);
      }, S = () => {
        if (!f) {
          f = !0, _();
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
        f || u <= 0 || (_(), p = setTimeout(() => i.abort("stream_idle_timeout"), u));
      };
      return g = i.onAbort((b) => {
        f || (_(), b === "stream_idle_timeout" ? y({
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
          f || S();
        }));
      }), new ReadableStream({
        pull: async (b) => {
          if (!f)
            return m || (A(), m = (async () => {
              try {
                const { done: R, value: T } = await l.read();
                if (_(), R) {
                  const L = i.getAbortReason();
                  if (S(), L === "stream_idle_timeout") {
                    try {
                      b.error(lr(L, `${u}ms`));
                    } catch {
                    }
                    return;
                  }
                  y(), b.close();
                  return;
                }
                b.enqueue(T), A();
              } catch (R) {
                _();
                const T = i.getAbortReason(), L = T === "stream_idle_timeout" ? lr(T, `${u}ms`) : T ? lr(T) : R;
                if (S(), T === "client_aborted" || T === "downstream_cancelled") {
                  y({
                    statusCode: 499,
                    category: e.classifyProxyLogCategory(t.requestTraits),
                    errorDetail: T
                  });
                  try {
                    b.close();
                  } catch {
                  }
                  return;
                }
                y(T === "stream_idle_timeout" ? {
                  statusCode: 504,
                  category: "error",
                  errorDetail: `stream_idle_timeout_${u}ms`
                } : {
                  statusCode: 502,
                  category: "error",
                  errorDetail: R?.message || String(R)
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
            i.abort("downstream_cancelled"), _();
            try {
              await l.cancel(b);
            } catch {
            }
            y({
              statusCode: 499,
              category: e.classifyProxyLogCategory(t.requestTraits),
              errorDetail: "downstream_cancelled"
            }), S();
          }
        }
      });
    }
  };
}
function tg(n = {}, e = {}) {
  const { Logger: r } = n;
  return {
    async performFetchWithTimeout(t, a, o = {}) {
      const s = await a(t, o), i = Math.max(0, Number(o.timeoutMs) || 0), c = o.requestLifecycle || null;
      let l = null, u = null, d = !1, f = () => {
      };
      (i > 0 || c) && (u = new AbortController(), s.signal = u.signal, c && (f = c.setActiveFetchController(u)), i > 0 && (l = setTimeout(() => {
        d = !0, u.abort(`upstream_timeout_${i}ms`);
      }, i)));
      try {
        return {
          response: await We(t.toString(), s),
          finalUrl: t,
          releaseFetchController: f
        };
      } catch (m) {
        if (f(), d) {
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
    async performUpstreamFetch(t, a, o, s, i = {}) {
      const c = i.useFastSegmentBuilder === !0, l = c ? new URL(Vm(t, a, o?.search || "")) : hr(t, a);
      return c || (l.search = o.search), {
        ...await e.performFetchWithTimeout(l, s, i),
        targetRecord: t
      };
    },
    async fetchAbsoluteWithRetryLoop(t) {
      let a = null;
      const o = t.absoluteUrl instanceof URL ? new URL(t.absoluteUrl.toString()) : new URL(String(t.absoluteUrl || "")), s = Math.max(1, ue(t.maxExtraAttempts, $n, 0, 3) + 1);
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
          a = l;
          const u = i === s - 1;
          if (t.allowAutomaticRetry !== !0 || u)
            throw l && typeof l == "object" && (l.lastFinalUrl = o), l;
        }
      }
      throw a && typeof a == "object" && (a.lastFinalUrl = o), a || /* @__PURE__ */ new Error("redirect_fetch_failed");
    },
    async fetchUpstreamWithRetryLoop(t) {
      let a = null, o = Array.isArray(t.retryTargetRecords) ? t.retryTargetRecords.slice() : [], s = o[0], i = hr(s, t.proxyPath);
      i.search = t.requestUrl.search;
      const c = Math.max(1, ue(t.maxExtraAttempts, $n, 0, 3) + 1);
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
            const _ = y.upstream;
            s = _.targetRecord || d, i = _.finalUrl || i;
            const S = _.response;
            if (S.status === 101) return {
              ..._,
              protocolFallbackRetry: t.protocolFallbackRetry === !0
            };
            if (e.shouldRetryWithProtocolFallback(S, {
              ...t,
              isRetry: !0
            })) {
              try {
                S.body?.cancel?.();
              } catch {
              }
              try {
                _.releaseFetchController?.();
              } catch {
              }
              return await e.fetchUpstreamWithRetryLoop({
                ...t,
                isRetry: !0,
                protocolFallbackRetry: !0
              });
            }
            if (!t.retryableStatuses.has(S.status)) return {
              ..._,
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
            const _ = e.getFailoverStateSnapshot(t.execution.failoverContext.cacheKey, t.execution.failoverContext.preferredTtlMs);
            o = e.reorderRetryTargetsForFailover(t.execution.failoverContext.originalTargetRecords, _);
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
              targetRecord: d,
              reason: p || "network_error"
            });
            if (y?.upstream) {
              const _ = y.upstream;
              s = _.targetRecord || d, i = _.finalUrl || i;
              const S = _.response;
              if (S.status === 101) return {
                ..._,
                protocolFallbackRetry: t.protocolFallbackRetry === !0
              };
              if (e.shouldRetryWithProtocolFallback(S, {
                ...t,
                isRetry: !0
              })) {
                try {
                  S.body?.cancel?.();
                } catch {
                }
                try {
                  _.releaseFetchController?.();
                } catch {
                }
                return await e.fetchUpstreamWithRetryLoop({
                  ...t,
                  isRetry: !0,
                  protocolFallbackRetry: !0
                });
              }
              if (!t.retryableStatuses.has(S.status)) return {
                ..._,
                protocolFallbackRetry: t.protocolFallbackRetry === !0
              };
            } else y?.error && (a = y.error);
            if (t.execution?.failoverContext?.eligible) {
              const _ = e.getFailoverStateSnapshot(t.execution.failoverContext.cacheKey, t.execution.failoverContext.preferredTtlMs);
              o = e.reorderRetryTargetsForFailover(t.execution.failoverContext.originalTargetRecords, _);
            }
          }
          const g = u === o.length - 1, h = l === c - 1;
          if (g && h)
            throw m && typeof m == "object" && (m.lastFinalUrl = i, m.lastTargetRecord = s, m.lastTargetBase = s?.targetUrl || null), m;
        }
      }
      throw a && typeof a == "object" && (a.lastFinalUrl = i, a.lastTargetRecord = s, a.lastTargetBase = s?.targetUrl || null), a || /* @__PURE__ */ new Error("upstream_fetch_failed");
    }
  };
}
function rg(n = {}, e = {}) {
  const { Logger: r } = n;
  return {
    recordAccessLog(t, a = {}) {
      const o = {
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
      r.record(t.env, t.ctx, o);
    },
    buildOptionsResponse(t) {
      const a = new Headers(t.dynamicCors);
      return we(a), t.finalOrigin !== "*" && Hr(a, "Origin"), new Response(null, { headers: a });
    }
  };
}
function ag(n = {}, e = {}) {
  return {
    ...Zp(n, e),
    ...eg(n, e),
    ...tg(n, e),
    ...rg(n, e)
  };
}
function ng(n = {}, e = {}) {
  const { CacheManager: r } = n, t = new hl({
    entries: ne.PlaybackInfoResponseCache,
    now: H,
    maxEntries: F.Defaults.PlaybackInfoCacheMax,
    maxEntryBytes: yi,
    maxTotalBytes: Eu
  });
  return {
    async prepareExecutionContext(a, o, s, i, c, l, u, d = {}) {
      const f = Date.now(), m = a.method;
      if (r.maybeCleanup(l), !o || !o.target) return { invalidResponse: new Response("Invalid Node", {
        status: 502,
        headers: we(new Headers())
      }) };
      const p = k(d.runtimeConfig) ? d.runtimeConfig : await Ce(l), g = d.requestUrl || new URL(a.url), h = d.runtimeRouteContext && typeof d.runtimeRouteContext == "object" ? d.runtimeRouteContext : null, y = typeof h?.requestHost == "string" ? h.requestHost : re(g.hostname), _ = typeof h?.configuredHost == "string" ? h.configuredHost : Ve(l), S = typeof h?.configuredLegacyHost == "string" ? h.configuredLegacyHost : Wr(l), A = nr(d.entryMode || o?.entryMode), b = String(d.routeKindOverride || "").trim(), R = !!(S && S !== _ && y && y === S), T = {
        requestHost: y,
        configuredHost: _,
        configuredLegacyHost: S,
        isLegacyHostRequest: R,
        routeKind: b || (R ? "legacy_host_kv_route" : A === "host_prefix" ? "host_prefix" : "kv_route")
      }, L = Q(s), D = String(d?.pathNormalizationState?.kind || "").trim(), E = a.headers.get("cf-connecting-ip") || "unknown", w = na(a), N = E, O = a.cf?.country || "UNKNOWN", C = e.resolveCorsOrigin(p, a), v = Ca(l, a, C), B = Fi(d.linkVariant), P = ap(L, g);
      if (P?.error) return { invalidResponse: new Response("Invalid Playback Relay", {
        status: 400,
        headers: we(new Headers(v))
      }) };
      const I = g.searchParams.has("__pb_abs") && (!!P || ga(L));
      let M = g;
      const x = P?.visibleProxyPath || L, U = P?.targetUrl instanceof URL ? P.targetUrl.pathname : "";
      if (ma(x) || U && ma(U)) return { invalidResponse: _n(m, v) };
      if ((P || I) && (M = new URL(g)), P) {
        M.searchParams.delete(vi);
        const ge = Pc(g, i, c, x, {
          linkVariant: B,
          entryMode: d.entryMode
        });
        M.pathname = ge.pathname;
      }
      I && M.searchParams.delete(Gn);
      const G = Wf(o, p, i), K = e.classifyRequest(a, x, M, p, {
        nodeDirectSource: G,
        directStaticAssets: p.directStaticAssets === !0,
        directHlsDash: p.directHlsDash === !0
      }), $ = pd(o, p), V = Jm($), se = $ === "rewrite" && P?.targetUrl instanceof URL ? "proxy" : "", pe = B !== "main" ? "link_variant_force_proxy" : se ? "rewrite_playback_entry_proxy" : "", me = !!pe, le = me ? {
        ...K,
        nodeDirectMedia: !1,
        directStaticAssets: !1,
        directHlsDash: !1,
        legacyEntryOffloadEnabled: !1,
        legacyEntryOffloadReason: "",
        direct307Mode: !1,
        enablePrewarm: p.enablePrewarm !== !1,
        isMetadataCacheable: m === "GET" && K.isWsUpgrade !== !0 && (K.isImage === !0 || K.isSubtitle === !0 || K.isManifest === !0)
      } : K, ye = jf(p), xe = p.protocolFallback !== !1, Ge = ue(p.upstreamTimeoutMs, gu, 0, 18e4), at = ue(p.upstreamRetryAttempts, $n, 0, 3), It = p.hedgeFailoverEnabled === !0, yr = p.hedgeProbePreferGet !== !1, _t = hd(o, p), Vt = ue(p.hedgeProbeTimeoutMs, To, 250, 1e4), Sr = ue(p.hedgeProbeParallelism, fi, 1, 2), Mt = ue(p.hedgeWaitTimeoutMs, mi, 250, 1e4), Pt = ue(p.hedgeLockTtlMs, pi, 1e3, 1e4), _r = ue(p.hedgePreferredTtlSec, aa, 30, 3600), Qr = ue(p.hedgeFailureCooldownSec, gi, 1, 300), Oe = ue(p.hedgeWakeJitterMs, hi, 0, 1e3), xt = ue(p.cacheTtlImages, _i, 0, 365) * 86400, je = ye.enableH3 === !0, nt = ye.forceH1 === !0, Ot = p.playbackInfoCacheEnabled !== !1, br = ue(p.playbackInfoCacheTtlSec, bu, 0, 60), He = p.videoProgressForwardEnabled !== !1, bt = ue(p.videoProgressForwardIntervalSec, Si, 0, 60), vt = gd(o, p), qt = md(o, p), Ft = String(d.nodeCacheRevision || "").trim() || ao(i, o), z = le.isMetadataCacheable ? await Kc(a) : "", j = le.isMetadataCacheable ? zc(x, {
        imageCacheMaxAge: xt,
        prewarmCacheTtl: le.prewarmCacheTtl
      }) : "", q = le.isMetadataCacheable && no(M) ? Vc(M, i, c, x, {
        search: M.search,
        nodeCacheRevision: Ft,
        entryMode: d.entryMode,
        identityPartition: z,
        cachePolicyRevision: j
      }) : null, Y = q ? ur() : null, X = ed(o, p), ae = e.getRoutingDecision({
        phase: "entry",
        request: a,
        requestUrl: M,
        proxyPath: x,
        requestTraits: le,
        currentConfig: p,
        node: o,
        nodeName: i,
        nodeKey: c,
        linkVariant: B,
        forceWorkerProxy: me,
        forceWorkerProxyReason: pe,
        routingDecisionMode: X
      });
      return {
        request: a,
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
        rawProxyPath: L,
        proxyPath: x,
        linkVariant: B,
        forceWorkerProxy: me,
        forceWorkerProxyReason: pe,
        clientIp: N,
        inboundIp: E,
        logInboundColo: w,
        country: O,
        finalOrigin: C,
        dynamicCors: v,
        routeContextDiagnostics: T,
        requestTraits: le,
        protocolStrategy: ye.strategy,
        routingDecisionMode: X,
        entryRoutingDecision: ae,
        enableH3: je,
        forceH1: nt,
        protocolFallback: xe,
        upstreamTimeoutMs: Ge,
        upstreamRetryAttempts: at,
        hedgeFailoverEnabled: It,
        hedgeProbePreferGet: yr,
        hedgeProbePath: _t,
        hedgeProbeTimeoutMs: Vt,
        hedgeProbeParallelism: Sr,
        hedgeWaitTimeoutMs: Mt,
        hedgeLockTtlMs: Pt,
        hedgePreferredTtlSec: _r,
        hedgeFailureCooldownSec: Qr,
        hedgeWakeJitterMs: Oe,
        playbackInfoCacheEnabled: Ot,
        playbackInfoCacheTtlSec: br,
        effectivePlaybackInfoMode: $,
        playbackInfoRewriteUrlMode: V,
        playbackInfoCacheState: le.isPlaybackInfoRequest === !0 ? Ot && br > 0 ? "miss" : "skip" : "",
        playbackInfoCacheKey: "",
        playbackInfoRewrite: le.isPlaybackInfoRequest === !0 && $ === "passthrough" ? "passthrough" : "",
        playbackAbsoluteFallbackEligible: I,
        playbackAbsoluteFallbackLocation: I ? Qm(L, g) : "",
        playbackUrlMode: I ? "absolute" : le.isPlaybackInfoRequest === !0 && $ === "rewrite" ? String(V || "relative") : "",
        playbackFallback: I ? "none" : "",
        playbackPathFix: D,
        rewritePlaybackEntry: se,
        playbackRelayTargetUrl: P?.targetUrl instanceof URL ? P.targetUrl : null,
        targetHotCacheState: String(d.targetHotCacheState || "").trim() || (le.isPlaybackCriticalRequest === !0 ? "miss" : "skip"),
        nodeCacheState: String(d.nodeCacheState || "").trim(),
        playbackRouteHotTargetRecords: Array.isArray(d.cachedTargetRecords) ? d.cachedTargetRecords : null,
        videoProgressForwardEnabled: He,
        videoProgressForwardIntervalSec: bt,
        effectiveRealClientIpMode: vt,
        effectiveMediaAuthMode: qt,
        nodeDerivedCacheRevision: Ft,
        failoverContext: null,
        failoverTelemetry: null,
        failoverForegroundWaitUsed: !1,
        progressForwardMode: "",
        progressForwardSessionKey: "",
        imageCacheMaxAge: xt,
        metadataCacheKey: q,
        metadataCache: Y,
        metadataCacheIdentityPartition: z,
        metadataCachePolicyRevision: j,
        redirectTrace: null
      };
    },
    cleanupPlaybackInfoResponseCache(a = H()) {
      t.cleanup(a);
    },
    buildPlaybackInfoAuthSignature(a, o = null) {
      const s = a?.requestUrl instanceof URL ? a.requestUrl : null, i = o?.newHeaders || a?.request?.headers || null, c = Ko(i), l = Bo(Je(i, "Cookie"), ln);
      return zo([
        s ? ie(s.searchParams.get("api_key") || s.searchParams.get("X-Emby-Token") || s.searchParams.get("X-MediaBrowser-Token") || "") : "",
        c?.token ? ie(c.token) : "",
        c?.deviceId ? ie(c.deviceId) : "",
        Je(i, "Authorization") ? ie(Je(i, "Authorization")) : "",
        Je(i, "X-Emby-Authorization") ? ie(Je(i, "X-Emby-Authorization")) : "",
        Je(i, "X-MediaBrowser-Authorization") ? ie(Je(i, "X-MediaBrowser-Authorization")) : "",
        l ? ie(l) : ""
      ]);
    },
    buildPlaybackInfoCacheKey(a, o = null) {
      if (a?.requestTraits?.isPlaybackInfoRequest !== !0) return "";
      if (a.playbackInfoCacheEnabled !== !0 || Number(a.playbackInfoCacheTtlSec) <= 0)
        return a.playbackInfoCacheState = "skip", a.playbackInfoCacheKey = "", "";
      const s = a.requestMethod;
      if (s !== "GET" && s !== "HEAD" && o?.preparedBodyMode !== "buffered")
        return a.playbackInfoCacheState = "skip", a.playbackInfoCacheKey = "", "";
      const i = o?.preparedBodyMode === "buffered" ? String(o?.preparedBodyText || io(o?.preparedBody)) : "", c = `playback-info:${zo([
        String(a?.nodeName || "").trim(),
        String(a?.nodeDerivedCacheRevision || "").trim(),
        s,
        String(a?.proxyPath || "").trim(),
        String(a?.requestUrl?.search || "").trim(),
        i ? ie(i) : "",
        e.buildPlaybackInfoAuthSignature(a, o),
        zt(a?.effectivePlaybackInfoMode),
        String(a?.playbackInfoRewriteUrlMode || "relative")
      ])}`;
      return a.playbackInfoCacheKey = c, c;
    },
    async storePlaybackInfoResponseCache(a, o, s = null, i = null) {
      if (a?.requestTraits?.isPlaybackInfoRequest !== !0) return !1;
      const c = a.playbackInfoCacheKey || e.buildPlaybackInfoCacheKey(a, s);
      return !c || !er(i) || i.response !== o ? !1 : t.set(c, i, {
        nodeName: String(a?.nodeName || "").trim().toLowerCase(),
        nodeRevision: String(a?.nodeDerivedCacheRevision || "").trim(),
        playbackInfoRewrite: String(a?.playbackInfoRewrite || "").trim(),
        ttlMs: Math.max(0, Number(a?.playbackInfoCacheTtlSec) || 0) * 1e3
      });
    },
    async tryServePlaybackInfoResponseCache(a, o = null) {
      if (a?.requestTraits?.isPlaybackInfoRequest !== !0) return null;
      const s = e.buildPlaybackInfoCacheKey(a, o);
      if (!s) return null;
      const i = t.get(s);
      if (!i)
        return a.playbackInfoCacheState = a.playbackInfoCacheState === "skip" ? "skip" : "miss", null;
      const c = i.metadata, l = i.representation, u = l.response, d = l.bodyText;
      a.playbackInfoCacheState = "hit", a.playbackInfoRewrite = String(c?.playbackInfoRewrite || a?.playbackInfoRewrite || "").trim();
      const f = e.buildProxyResponseHeaders(u, a.request, a.dynamicCors, a.finalOrigin, a.requestTraits, {
        enableH3: a.enableH3,
        forceH1: a.forceH1,
        imageCacheMaxAge: a.imageCacheMaxAge
      }), m = e.appendLogDiagnosticDetail(e.extractProxyErrorDetail(u), e.buildRuntimeDiagnosticDetail(a));
      return e.recordAccessLog(a, {
        statusCode: u.status,
        category: e.classifyProxyLogCategory(a.requestTraits),
        errorDetail: m,
        detailJson: e.buildStructuredLogDetail(a, { statusCode: u.status }, {
          deliveryMode: "proxy",
          redirectMode: "playback_info_cache",
          decisionReason: "playback_info_cache_hit",
          playbackInfoCache: a.playbackInfoCacheState,
          playbackInfoCacheTtlSec: a.playbackInfoCacheTtlSec,
          upstreamStatus: u.status
        }),
        outboundColo: ""
      }), new Response(a.requestMethod === "HEAD" ? null : d, {
        status: u.status,
        statusText: u.statusText,
        headers: f
      });
    }
  };
}
function og(n = {}, e = {}) {
  return {
    parsePlaybackSessionControlPayload(r, t = null) {
      if (r?.playbackSessionControlPayload) return r.playbackSessionControlPayload;
      const a = r?.requestUrl instanceof URL ? r.requestUrl : null, o = {};
      if (a) for (const [u, d] of a.searchParams.entries()) {
        const f = String(u || "").trim().toLowerCase();
        !f || o[f] !== void 0 || (o[f] = d);
      }
      const s = {
        query: o,
        body: {},
        parseError: !1,
        parseMode: "query_only",
        parseErrorReason: ""
      }, i = r.requestMethod;
      if (i === "GET" || i === "HEAD")
        return r && (r.playbackSessionControlPayload = s), s;
      if (t?.preparedBodyMode === "stream")
        return s.parseError = !0, s.parseMode = "stream", s.parseErrorReason = "unbuffered_body", r && (r.playbackSessionControlPayload = s), s;
      const c = String(t?.preparedBodyText || io(t?.preparedBody));
      if (!c.trim())
        return r && (r.playbackSessionControlPayload = s), s;
      const l = String(t?.newHeaders?.get("Content-Type") || r?.request?.headers?.get("Content-Type") || "").toLowerCase().split(";", 1)[0].trim();
      try {
        if (l === "application/json" || l === "text/json" || l === "text/plain" || /^application\/[a-z0-9!#$&^_.+-]+\+json$/i.test(l)) {
          const u = JSON.parse(c);
          if (!k(u)) throw new TypeError("playback_control_body_not_object");
          s.body = Li(u), s.parseMode = l === "text/plain" ? "text_plain_json" : "json";
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
      return r && (r.playbackSessionControlPayload = s), s;
    },
    resolvePlaybackProgressSessionKey(r, t = null) {
      const a = e.parsePlaybackSessionControlPayload(r, t), o = (g = []) => {
        const h = ns(a.query, g);
        if (String(h || "").trim()) return String(h).trim();
        const y = ns(a.body, g);
        return String(y || "").trim();
      }, s = o(["SessionId"]), i = o(["PlaySessionId"]), c = o(["DeviceId"]), l = o(["ItemId"]), u = String(r?.nodeName || "unknown").trim().toLowerCase() || "unknown";
      let d = "", f = "", m = "weak";
      if (s)
        d = `session:${s}`, f = `session:${s}`, m = "strong";
      else if (i)
        d = `play:${i}`, f = `play:${i}`, m = "strong";
      else if (c)
        d = `device-item:${c}:${l}`, f = `device:${c}`;
      else {
        const g = r?.request?.headers;
        d = `fallback:${En([
          g?.get?.("Authorization"),
          g?.get?.("X-Emby-Token"),
          g?.get?.("X-MediaBrowser-Token"),
          g?.get?.("X-Emby-Device-Id"),
          c,
          r?.clientIp,
          l
        ].map((h) => String(h || "").trim()).join("|"))}`, f = d;
      }
      const p = En(`${u}|${f}`);
      return {
        sessionKey: `${u}|${d}`,
        sessionIdentityFingerprint: p,
        sessionFingerprint: En(`${p}|${l}`),
        sessionStrength: m,
        itemId: l,
        parseError: a.parseError === !0
      };
    }
  };
}
function sg(n = {}, e = {}) {
  const { CacheManager: r } = n;
  return {
    buildPlaybackProgressRelayEntry(t = 0, a = null) {
      return {
        lastForwardAt: 0,
        lastTouchedAt: H(),
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
    isPlaybackProgressRelayTerminal(t, a = H()) {
      return !t || String(t.terminalState || "").trim().toLowerCase() !== "stopped" ? !1 : Number(t.terminalTombstoneUntil || 0) > a;
    },
    markPlaybackProgressRelayStopped(t, a) {
      const o = ne.PlaybackProgressRelay;
      if (!(o instanceof Map) || !t) return null;
      const s = Math.max(0, Number(a?.videoProgressForwardIntervalSec) || 0) * 1e3, i = o.get(t) || e.buildPlaybackProgressRelayEntry(s, a?.ctx || null), c = H();
      i.intervalMs = s > 0 ? s : Math.max(0, Number(i.intervalMs) || 0), i.waitUntilCtx = a?.ctx || i.waitUntilCtx || null, i.nodeName = String(a?.nodeName || i.nodeName || "").trim().toLowerCase(), i.nodeRevision = String(a?.nodeDerivedCacheRevision || i.nodeRevision || "").trim();
      try {
        i.cancelScheduledDelay?.();
      } catch {
      }
      return i.cancelScheduledDelay = null, i.scheduledPromise = null, i.pendingSnapshot = null, i.scheduledFlushAt = 0, i.terminalState = "stopped", i.terminalAt = c, i.terminalTombstoneUntil = c + e.getPlaybackProgressRelayTerminalTtlMs(i.intervalMs), i.lastTouchedAt = c, Is(t, i) ? i : (to(i), null);
    },
    cleanupPlaybackProgressRelay(t = H()) {
      const a = ne.PlaybackProgressRelay;
      if (!(a instanceof Map) || a.size <= 0) return;
      const o = Math.max(3e4, Math.max(1, Number(Si) || 1) * 2e4);
      for (const [i, c] of a) {
        const l = Number(c?.lastTouchedAt || c?.lastForwardAt || 0) || 0, u = !!c?.pendingSnapshot || !!c?.activeFlushPromise, d = Number(c?.terminalTombstoneUntil || 0) || 0;
        if (d > 0) {
          !u && d <= t && Zt(i);
          continue;
        }
        !u && l > 0 && l + o <= t && Zt(i);
      }
      const s = Math.max(1, Number(F.Defaults.VideoProgressForwardSessionMax) || 1);
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
    buildPlaybackProgressSnapshot(t, a, o, s) {
      if (!t || !a || typeof o != "function" || !rt(s) || (a.preparedBodyMode === "buffered" && Number(a.preparedBody?.byteLength) || 0) > Ru) return null;
      const i = a.preparedBodyMode === "buffered" && a.preparedBody ? a.preparedBody.slice(0) : a.preparedBody;
      return {
        ctx: t.ctx,
        nodeName: String(t.nodeName || "").trim().toLowerCase(),
        nodeRevision: String(t.nodeDerivedCacheRevision || "").trim(),
        targetRecord: s,
        proxyPath: String(t.proxyPath || "/"),
        requestUrl: new URL(t.requestUrl.toString()),
        buildFetchOptions: o,
        requestMethod: String(t.request?.method || "POST").toUpperCase(),
        preparedBodyMode: a.preparedBodyMode,
        preparedBody: i,
        upstreamTimeoutMs: t.upstreamTimeoutMs
      };
    },
    schedulePlaybackProgressRelayFlush(t, a) {
      if (!a?.pendingSnapshot || a?.scheduledFlushAt > 0 || e.isPlaybackProgressRelayTerminal(a)) return;
      const o = Math.max(0, Number(a.intervalMs) || 0);
      if (o <= 0) return;
      const s = Math.max(H(), Number(a.lastForwardAt) || 0) + o;
      a.scheduledFlushAt = s, a.lastTouchedAt = H();
      const i = Tl(Math.max(0, s - H())), c = (async () => {
        if (!await i.promise) return;
        const u = ne.PlaybackProgressRelay.get(t);
        !u || u !== a || Number(u.scheduledFlushAt) !== s || (u.scheduledFlushAt = 0, await e.flushPlaybackProgressRelayEntry(t, {
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
      const o = ne.PlaybackProgressRelay, s = o.get(t);
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
      s.cancelScheduledDelay = null, s.scheduledPromise = null, s.scheduledFlushAt = 0, s.lastForwardAt = H(), s.lastTouchedAt = s.lastForwardAt;
      const c = (async () => {
        try {
          return await e.forwardPlaybackProgressSnapshot(i), !0;
        } catch {
          const l = o.get(t);
          return l && l === s && !l.pendingSnapshot && (l.pendingSnapshot = i, l.lastForwardAt = H(), l.lastTouchedAt = l.lastForwardAt), !1;
        } finally {
          const l = o.get(t);
          if (!l || l !== s) return;
          l.activeFlushPromise = null, l.lastTouchedAt = H(), l.pendingSnapshot && e.schedulePlaybackProgressRelayFlush(t, l);
        }
      })();
      return s.activeFlushPromise = c, a.attachToCtx === !0 && s.waitUntilCtx?.waitUntil && s.waitUntilCtx.waitUntil(c), await c === !0;
    },
    async flushPlaybackProgressBeforeStopped(t) {
      const a = String(t?.progressForwardSessionKey || "").trim();
      if (!a) return !1;
      const o = ne.PlaybackProgressRelay.get(a);
      if (!o) return !1;
      if (o.activeFlushPromise) try {
        await o.activeFlushPromise;
      } catch {
      }
      if (!o.pendingSnapshot) return !1;
      try {
        o.cancelScheduledDelay?.();
      } catch {
      }
      return o.cancelScheduledDelay = null, o.scheduledPromise = null, o.scheduledFlushAt = 0, await e.flushPlaybackProgressRelayEntry(a, {
        background: !1,
        attachToCtx: !1
      });
    },
    buildPlaybackProgressThrottleResponse(t) {
      const a = e.buildEdgeResponseHeaders(t.finalOrigin), o = e.buildProgressRelayDiagnosticDetail(t);
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
        headers: a
      });
    },
    async maybeHandlePlaybackProgressRelay(t, a, o, s = []) {
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
      const l = rt(s[0]) ? s[0] : null;
      if (!l)
        return t.progressForwardMode = "pass_through", null;
      if (t.requestMethod !== "GET" && t.requestMethod !== "HEAD" && a?.preparedBodyMode !== "buffered")
        return t.progressForwardMode = "unbuffered_bypass", null;
      const u = ne.PlaybackProgressRelay;
      e.cleanupPlaybackProgressRelay();
      const d = t.progressForwardSessionKey || `fallback:${t.clientIp}:${t.proxyPath}`;
      let f = u.get(d);
      f || (f = e.buildPlaybackProgressRelayEntry(i * 1e3, t.ctx)), f.intervalMs = i * 1e3, f.waitUntilCtx = t.ctx, f.nodeName = String(t.nodeName || "").trim().toLowerCase(), f.nodeRevision = String(t.nodeDerivedCacheRevision || "").trim();
      const m = H();
      if (f.lastTouchedAt = m, e.isPlaybackProgressRelayTerminal(f, m))
        return t.progressForwardMode = "late_progress_dropped_after_stopped", e.buildPlaybackProgressThrottleResponse(t);
      if (f.terminalState = "", f.terminalAt = 0, f.terminalTombstoneUntil = 0, !Is(d, f))
        return to(f), t.progressForwardMode = "capacity_bypass", null;
      if (!(f.lastForwardAt > 0 && m - f.lastForwardAt < f.intervalMs) && !f.activeFlushPromise && !f.pendingSnapshot)
        return f.pendingSnapshot = null, f.scheduledFlushAt = 0, f.lastForwardAt = m, t.progressForwardMode = "forward_now", null;
      const p = e.buildPlaybackProgressSnapshot(t, a, o, l);
      return p ? (f.pendingSnapshot = p, f.lastTouchedAt = m, t.progressForwardMode = "throttled_204", e.schedulePlaybackProgressRelayFlush(d, f), e.buildPlaybackProgressThrottleResponse(t)) : (t.progressForwardMode = "snapshot_bypass", null);
    }
  };
}
function ig(n = {}, e = {}) {
  return {
    ...ng(n, e),
    ...og(n, e),
    ...sg(n, e)
  };
}
function cg(n = {}, e = {}) {
  const { nodeRepository: r } = n;
  return {
    resolveCorsOrigin(t, a) {
      const o = a.headers.get("Origin"), s = ks(t);
      return s.corsOrigins.length > 0 ? o && s.corsOriginSet.has(o) ? o : s.corsOrigins[0] : o || "*";
    },
    buildEdgeResponseHeaders(t, a = {}) {
      const o = new Headers({
        "Access-Control-Allow-Origin": t,
        "Cache-Control": "no-store",
        ...a
      });
      return we(o), o;
    },
    classifyRequest(t, a, o, s, i = {}) {
      const c = t.method, l = t.headers.get("Range"), u = t.headers.get("If-Range"), d = Vr.test(a) || jr.test(a), f = Mu.test(a), m = pr.test(a), p = ht.test(a), g = Ri.test(a), h = Io(a), y = t.headers.get("Upgrade")?.toLowerCase() === "websocket", _ = Zi(a), S = ec(a), A = tc(a), b = Qd(a), R = S || A || b, T = Pu.test(a) || /\/videos\/[^/]+\/(stream|original|download|file)/i.test(a) || /\/items\/[^/]+\/download/i.test(a) || o.searchParams.get("Static") === "true" || o.searchParams.get("Download") === "true", L = c === "GET" || c === "HEAD", D = T && !p && !g && !m && !d, E = _ || h || D || p || g, w = !d && !f && !m && !p && !g && !h && !D && !y, N = i.nodeDirectSource === !0 && L && D, O = i.directStaticAssets === !0 && L && f, C = i.directHlsDash === !0 && L && (p || g), v = N ? "entry_direct_media" : O ? "entry_direct_static_asset" : C ? "entry_direct_hls_dash" : "", B = !!v, P = B;
      return {
        rangeHeader: l,
        ifRangeHeader: u,
        enablePrewarm: s.enablePrewarm !== !1 && !B,
        prewarmCacheTtl: ue(s.prewarmCacheTtl, _u, 0, 3600),
        prewarmDepth: Hi(s.prewarmDepth),
        prewarmPrefetchBytes: s.disablePrewarmPrefetch === !0 ? 0 : ue(s.prewarmPrefetchBytes, F.Defaults.PrewarmPrefetchBytes, 0, Ao),
        isImage: d,
        isStaticFile: f,
        isSubtitle: m,
        isManifest: p,
        isSegment: g,
        isSmartStrmMedia: h,
        isWsUpgrade: y,
        looksLikeVideoRoute: T,
        isBigStream: D,
        isPlaybackCriticalRequest: E,
        isApiRequest: w,
        isPlaybackInfoRequest: _,
        isPlaybackProgressRequest: S,
        isPlaybackStoppedRequest: A,
        isPlaybackStartedRequest: b,
        isPlaybackSessionControlRequest: R,
        isMetadataCacheable: c === "GET" && !y && !B && (d || m || p),
        isCacheableAsset: c === "GET" && !y && (d || f || m || g || p),
        nodeDirectMedia: N,
        directStaticAssets: O,
        directHlsDash: C,
        legacyEntryOffloadEnabled: B,
        legacyEntryOffloadReason: v,
        canStripAuthOnProtocolFallback: L && !w && (h || D || p || g),
        direct307Mode: P
      };
    },
    isEntryDirectDataPlaneMode(t) {
      const a = String(t || "").trim();
      return a === "entry_direct" || a === "legacy_entry_offload";
    },
    buildRoutingDecision(t = {}) {
      const a = String(t.action || "PROXY").trim().toUpperCase() === "DIRECT" ? "DIRECT" : "PROXY", o = String(t.phase || "unknown").trim() || "unknown", s = String(t.reason || "").trim() || (a === "DIRECT" ? "direct" : "proxy"), i = String(t.traceAction || (a === "DIRECT" ? "direct" : "proxy")).trim() || (a === "DIRECT" ? "direct" : "proxy"), c = String(t.traceLabel || s).trim() || s, l = Number(t.redirectStatus);
      return {
        phase: o,
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
      const a = t.requestTraits || {}, o = a.nodeDirectMedia ? "entry_direct_media" : a.directStaticAssets ? "entry_direct_static_asset" : a.directHlsDash ? "entry_direct_hls_dash" : "";
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
      return Or(t.routingDecisionMode) === "legacy" ? e.buildLegacyEntryRoutingDecision(t.requestTraits) : e.buildSimplifiedEntryRoutingDecision(t);
    },
    buildSimplifiedRedirectRoutingDecision(t, a, o, s, i = {}, c = {}) {
      const l = t.origin === a.origin, u = i.forceVideoDirect === !0, d = i.forceVideoProxy === !0, f = Gf(i.currentStatus, o);
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
    evaluateFirewall(t, a, o, s) {
      const i = ks(t);
      return i.ipBlacklist.has(a) ? new Response("Forbidden by IP Firewall", {
        status: 403,
        headers: e.buildEdgeResponseHeaders(s)
      }) : i.geoAllowlist.size > 0 && !i.geoAllowlist.has(o) || i.geoBlocklist.size > 0 && i.geoBlocklist.has(o) ? new Response("Forbidden by Geo Firewall", {
        status: 403,
        headers: e.buildEdgeResponseHeaders(s)
      }) : null;
    },
    applyRateLimit(t, a, o, s, i) {
      const c = parseInt(t.rateLimitRpm) || 0;
      if (!(c > 0 && o.isPlaybackCriticalRequest !== !0)) return null;
      let l = Qe.RateLimitCache.get(a);
      return (!l || s > l.resetAt) && (l = {
        count: 0,
        resetAt: s + 6e4
      }), l.count += 1, Ue(Qe.RateLimitCache, a, l, F.Defaults.RateLimitCacheMax), l.count > c ? new Response("Rate Limit Exceeded", {
        status: 429,
        headers: e.buildEdgeResponseHeaders(i)
      }) : null;
    },
    parseTargetRecords(t, a, o = {}) {
      const s = Array.isArray(o.cachedTargetRecords) ? o.cachedTargetRecords : [];
      if (s.length > 0 && s.every(rt)) return {
        targetRecords: s,
        invalidResponse: null
      };
      const i = r.getOrderedNodeLines(t), c = (i.length ? i.map((l) => l.target) : String(t.target || "").split(",").map((l) => l.trim()).filter(Boolean)).map((l) => mn(l)).filter(rt);
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
function lg(n = {}, e = {}) {
  const { nodeRepository: r } = n;
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
      } : sd(a) < 2 ? {
        eligible: !1,
        reason: "single_target"
      } : {
        eligible: !0,
        reason: "eligible"
      };
    },
    buildFailoverCacheKey(t, a, o) {
      return [
        String(t || "").toLowerCase().trim(),
        String(a || "").trim(),
        String(o || "").trim()
      ].filter(Boolean).join(":");
    },
    pruneFailoverStateEntry(t, a = aa * 1e3, o = H()) {
      if (!t || typeof t != "object") return null;
      t.failingTargets instanceof Map || (t.failingTargets = /* @__PURE__ */ new Map());
      for (const [d, f] of t.failingTargets) Number(f) <= o && t.failingTargets.delete(d);
      Number(t.preferredTargetExpiresAt) <= o && (t.preferredTargetKey = "", t.preferredTargetExpiresAt = 0);
      const s = Number(t.lastProbeResult?.completedAt) || 0;
      t.lastProbeResult && s > 0 && s + Math.max(1e3, Number(a) || 0) <= o && (t.lastProbeResult = null), t.inFlightProbe && Number(t.inFlightProbe.expiresAt) <= o && (t.inFlightProbe = null);
      const i = !!String(t.preferredTargetKey || "").trim(), c = t.failingTargets.size > 0, l = !!t.inFlightProbe, u = !!t.lastProbeResult;
      return i || c || l || u ? t : null;
    },
    getOrCreateFailoverStateEntry(t, a = aa * 1e3) {
      const o = String(t || "").trim();
      if (!o) return null;
      const s = ne.ProxyFailoverStateCache;
      let i = s.get(o);
      (!i || typeof i != "object") && (i = {
        preferredTargetKey: "",
        preferredTargetExpiresAt: 0,
        failingTargets: /* @__PURE__ */ new Map(),
        inFlightProbe: null,
        lastProbeResult: null
      });
      const c = e.pruneFailoverStateEntry(i, a, H()) || i;
      return Ue(s, o, c, sr), c;
    },
    getFailoverStateSnapshot(t, a = aa * 1e3) {
      const o = String(t || "").trim();
      if (!o) return null;
      const s = ne.ProxyFailoverStateCache, i = s.get(o);
      if (!i) return null;
      const c = e.pruneFailoverStateEntry(i, a, H());
      return c ? (Za(s, o), {
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
      const a = t?.failoverContext && typeof t.failoverContext == "object" ? t.failoverContext : null, o = e.ensureFailoverTelemetry(t), s = a?.cacheKey ? e.getFailoverStateSnapshot(a.cacheKey, a.preferredTtlMs) : null;
      return {
        enabled: a?.enabled === !0,
        eligible: a?.eligible === !0,
        cacheKey: String(a?.cacheKey || "").trim() || null,
        reason: String(a?.eligibilityReason || "").trim() || null,
        overlay: String(o.overlay || "").trim() || null,
        preferredTarget: String(o.preferredTarget || s?.preferredTargetKey || "").trim() || null,
        probeWinner: String(o.probeWinner || s?.probeWinnerTargetKey || "").trim() || null,
        demotedTargets: Array.isArray(s?.failingTargetKeys) ? s.failingTargetKeys : [],
        inFlight: s?.inFlightProbe ? { reason: String(s.inFlightProbe.reason || "").trim() || null } : null
      };
    },
    buildFailoverDiagnosticDetail(t) {
      const a = t?.failoverContext && typeof t.failoverContext == "object" ? t.failoverContext : null;
      if (!a?.enabled) return "";
      const o = e.ensureFailoverTelemetry(t), s = e.buildFailoverStateSummary(t), i = [`Failover=${String(o.overlay || a.eligibilityReason || "ready").trim() || "ready"}`];
      return s.preferredTarget && i.push(`PreferredTarget=${s.preferredTarget}`), o.demotedTarget && i.push(`DemotedTarget=${o.demotedTarget}`), o.probeWinner && i.push(`ProbeWinner=${o.probeWinner}`), o.waitJoinMs > 0 && i.push(`WaitJoin=${o.waitJoinMs}ms`), o.fastFailReason && i.push(`FastFail=${o.fastFailReason}`), i.join(" | ");
    },
    reorderRetryTargetsForFailover(t, a = {}) {
      const o = Array.isArray(t) ? t.slice() : [];
      if (o.length <= 1) return o;
      const s = new Set((Array.isArray(a?.failingTargetKeys) ? a.failingTargetKeys : []).map((m) => String(m || "").trim()).filter(Boolean)), i = String(a?.preferredTargetKey || "").trim(), c = String(a?.probeWinnerTargetKey || "").trim(), l = i && !s.has(i) ? i : c && !s.has(c) ? c : "";
      if (!l && s.size <= 0) return o;
      const u = [], d = [], f = [];
      for (const m of o) {
        const p = qe(m);
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
    prepareFailoverOverlay(t, a = []) {
      const o = e.ensureFailoverTelemetry(t), s = od(a), i = Math.max(1e3, (Number(t?.hedgePreferredTtlSec) || aa) * 1e3), c = e.isFailoverEligible(t, a), l = e.buildFailoverCacheKey(t?.nodeName, s, t?.nodeDerivedCacheRevision), u = c.eligible ? e.getFailoverStateSnapshot(l, i) : null, d = c.eligible ? e.reorderRetryTargetsForFailover(a, u) : Array.isArray(a) ? a.slice() : [];
      let f = "disabled";
      return t?.hedgeFailoverEnabled === !0 && (c.eligible ? u?.preferredTargetKey ? f = "preferred_reordered" : u?.probeWinnerTargetKey ? f = "probe_hint_reordered" : Array.isArray(u?.failingTargetKeys) && u.failingTargetKeys.length > 0 ? f = "failure_demoted" : f = "ready" : f = c.reason || "ineligible"), o.overlay = f, o.preferredTarget = String(u?.preferredTargetKey || "").trim(), t.failoverContext = {
        enabled: t?.hedgeFailoverEnabled === !0,
        eligible: c.eligible,
        eligibilityReason: c.reason,
        cacheKey: l,
        orderedTargetSignature: s,
        preferredTtlMs: i,
        probePath: wa(t?.hedgeProbePath, di),
        probePreferGet: t?.hedgeProbePreferGet !== !1,
        probeTimeoutMs: Math.max(250, Number(t?.hedgeProbeTimeoutMs) || To),
        probeParallelism: Math.max(1, Math.min(2, Number(t?.hedgeProbeParallelism) || fi)),
        waitTimeoutMs: Math.max(250, Number(t?.hedgeWaitTimeoutMs) || mi),
        lockTtlMs: Math.max(1e3, Number(t?.hedgeLockTtlMs) || pi),
        failureCooldownMs: Math.max(1e3, (Number(t?.hedgeFailureCooldownSec) || gi) * 1e3),
        wakeJitterMs: Math.max(0, Number(t?.hedgeWakeJitterMs) || hi),
        originalTargetRecords: Array.isArray(a) ? a.slice() : [],
        retryTargetRecords: d.slice(),
        snapshot: u
      }, d;
    },
    maybeInvalidateHotSnapshotOnFailover(t, a) {
      if (String(t?.targetHotCacheState || "").trim() !== "hit") return;
      const o = qe(a);
      o && (Array.isArray(t?.playbackRouteHotTargetRecords) ? t.playbackRouteHotTargetRecords : []).map((s) => qe(s)).filter(Boolean).includes(o) && r.invalidatePlaybackRouteHotCache(t?.nodeName, t?.env);
    },
    markFailoverTargetFailure(t, a, o = "", s = {}) {
      const i = t?.failoverContext;
      if (!i?.eligible) return;
      const c = qe(a);
      if (!c) return;
      const l = e.ensureFailoverTelemetry(t), u = e.getOrCreateFailoverStateEntry(i.cacheKey, i.preferredTtlMs);
      u && (u.failingTargets.set(c, H() + i.failureCooldownMs), String(u.preferredTargetKey || "").trim() === c && (u.preferredTargetKey = "", u.preferredTargetExpiresAt = 0), Ue(ne.ProxyFailoverStateCache, i.cacheKey, u, sr), l.overlay = String(s.overlay || "target_demoted").trim() || "target_demoted", l.demotedTarget = c, l.fastFailReason = String(o || s.fastFailReason || l.fastFailReason || "").trim(), e.maybeInvalidateHotSnapshotOnFailover(t, a));
    },
    markFailoverBusinessSuccess(t, a, o = {}) {
      const s = t?.failoverContext;
      if (!s?.eligible) return;
      const i = Number(o.status) || 0;
      if (!(i >= 200 && i < 300 || i === 206 || i >= 300 && i < 400)) return;
      const c = qe(a);
      if (!c) return;
      const l = e.ensureFailoverTelemetry(t), u = e.getOrCreateFailoverStateEntry(s.cacheKey, s.preferredTtlMs);
      u && (u.failingTargets.delete(c), u.preferredTargetKey = c, u.preferredTargetExpiresAt = H() + s.preferredTtlMs, Ue(ne.ProxyFailoverStateCache, s.cacheKey, u, sr), l.overlay = String(o.overlay || "preferred_promoted").trim() || "preferred_promoted", l.preferredTarget = c);
    },
    getFailoverProbeCandidates(t, a = {}) {
      const o = t?.failoverContext;
      if (!o?.eligible) return [];
      const s = e.getFailoverStateSnapshot(o.cacheKey, o.preferredTtlMs), i = e.reorderRetryTargetsForFailover(o.originalTargetRecords, s), c = /* @__PURE__ */ new Set(), l = /* @__PURE__ */ new Set(), u = qe(a.failedTargetRecord), d = qe(a.activeTargetRecord), f = String(a.excludeTargetKey || "").trim();
      return u && c.add(u), d && c.add(d), f && c.add(f), i.filter((m) => {
        const p = qe(m);
        return !p || c.has(p) || l.has(p) ? !1 : (l.add(p), !0);
      }).slice(0, o.probeParallelism);
    }
  };
}
function ug(n = {}, e = {}) {
  return {
    buildFailoverProbeHeaders() {
      return new Headers({
        Accept: "*/*",
        "Cache-Control": "no-store",
        Pragma: "no-cache"
      });
    },
    async performFailoverProbeRequest(r, t, a, o, s = null) {
      const i = jp([
        r?.request?.signal,
        r?.requestLifecycle?.signal,
        s
      ]);
      let c = null, l = !1;
      try {
        return o > 0 && (c = setTimeout(() => {
          l = !0, i.abort(`probe_timeout_${o}ms`);
        }, o)), await We(t.toString(), {
          method: a,
          headers: e.buildFailoverProbeHeaders(),
          redirect: "manual",
          signal: i.signal
        });
      } catch (u) {
        if (l) {
          const d = /* @__PURE__ */ new Error(`probe_timeout_${o}ms`);
          throw d.code = "UPSTREAM_TIMEOUT", d;
        }
        throw r?.requestLifecycle?.getAbortReason?.() && rr(u) ? lr(r.requestLifecycle.getAbortReason()) : u;
      } finally {
        c !== null && clearTimeout(c), i.dispose();
      }
    },
    async runFailoverProbeCandidate(r, t, a = {}) {
      const o = r?.failoverContext, s = o?.probePath || wa(r?.hedgeProbePath, di), i = Math.max(250, Number(o?.probeTimeoutMs) || To), c = qe(t), l = Nc(t, s);
      if (!l) return {
        ok: !1,
        status: 0,
        targetRecord: t,
        targetKey: c,
        reason: "invalid_probe_target",
        elapsedMs: 0
      };
      const u = H();
      let d = null;
      const f = o?.probePreferGet !== !1;
      let m = f ? "GET" : "HEAD";
      try {
        if (d = await e.performFailoverProbeRequest(r, l, m, i, a.parentSignal || null), !f && (d.status === 405 || d.status === 501)) {
          try {
            d.body?.cancel?.();
          } catch {
          }
          m = "GET", d = await e.performFailoverProbeRequest(r, l, "GET", i, a.parentSignal || null);
        }
        const p = Math.max(0, H() - u);
        if (d.ok) {
          const g = d.status;
          try {
            d.body?.cancel?.();
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
          d.body?.cancel?.();
        } catch {
        }
        return {
          ok: !1,
          status: d.status,
          targetRecord: t,
          targetKey: c,
          reason: `probe_status_${Number(d.status) || 0}`,
          elapsedMs: p
        };
      } catch (p) {
        const g = Math.max(0, H() - u), h = String(p?.code || "").trim().toUpperCase(), y = String(r?.requestLifecycle?.getAbortReason?.() || "").trim();
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
      const o = r?.failoverContext;
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
      const u = H();
      await Promise.all(s.map(async (_) => {
        const S = await e.runFailoverProbeCandidate(r, _, { parentSignal: i.signal });
        if (c.push(S), !l && S?.ok === !0) {
          l = S;
          try {
            i.abort("probe_winner");
          } catch {
          }
        }
      }));
      const d = Math.max(0, H() - u), f = e.getOrCreateFailoverStateEntry(o.cacheKey, o.preferredTtlMs), m = l ? "ok" : "miss", p = l ? String(a.reason || "probe_ok").trim() || "probe_ok" : String(c.find((_) => _?.aborted !== !0 && _?.reason)?.reason || "probe_no_winner").trim() || "probe_no_winner", g = l && typeof l == "object" ? l : null, h = String(g ? g.targetKey : "").trim(), y = g ? g.targetRecord : null;
      return f && (f.lastProbeResult = {
        status: m,
        reason: p,
        winnerTargetKey: h,
        completedAt: H(),
        elapsedMs: d
      }, Ue(ne.ProxyFailoverStateCache, o.cacheKey, f, sr)), {
        status: m,
        reason: p,
        winnerTargetRecord: y,
        winnerTargetKey: h,
        elapsedMs: d,
        attempts: c
      };
    },
    startOrJoinFailoverProbe(r, t = {}) {
      const a = r?.failoverContext, o = e.ensureFailoverTelemetry(r);
      if (!a?.eligible) return null;
      const s = e.getOrCreateFailoverStateEntry(a.cacheKey, a.preferredTtlMs), i = H();
      if (s?.inFlightProbe && Number(s.inFlightProbe.expiresAt) > i && s.inFlightProbe.promise)
        return o.overlay = (t.background === !0 ? "background_probe_joined" : "probe_joined").trim(), {
          joined: !0,
          startedAt: Number(s.inFlightProbe.startedAt) || i,
          promise: s.inFlightProbe.promise
        };
      const c = e.getFailoverProbeCandidates(r, t);
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
      const l = `${i}-${Math.random().toString(36).slice(2, 10)}`, u = e.runFailoverProbeTask(r, c, t).finally(() => {
        const d = e.getOrCreateFailoverStateEntry(a.cacheKey, a.preferredTtlMs);
        !d?.inFlightProbe || String(d.inFlightProbe.token || "").trim() !== l || (d.inFlightProbe = null, Ue(ne.ProxyFailoverStateCache, a.cacheKey, d, sr));
      });
      return s && (s.inFlightProbe = {
        token: l,
        startedAt: i,
        expiresAt: i + a.lockTtlMs,
        reason: String(t.reason || "").trim(),
        promise: u
      }, Ue(ne.ProxyFailoverStateCache, a.cacheKey, s, sr)), o.overlay = (t.background === !0 ? "background_probe_started" : "probe_started").trim(), {
        joined: !1,
        startedAt: i,
        promise: u
      };
    },
    async maybeRunForegroundFailoverWait(r, t = {}) {
      const a = r?.execution, o = a?.failoverContext, s = e.ensureFailoverTelemetry(a);
      if (!o?.eligible || a?.failoverForegroundWaitUsed === !0) return null;
      a.failoverForegroundWaitUsed = !0;
      const i = t.targetRecord, c = Number(t.responseStatus) || 0, l = String(t.reason || (c > 0 ? `upstream_status_${c}` : "retryable_failure")).trim() || "retryable_failure";
      e.markFailoverTargetFailure(a, i, l, { overlay: "failure_demoted" });
      const u = e.startOrJoinFailoverProbe(a, {
        reason: l,
        failedTargetRecord: i
      });
      if (!u?.promise) return null;
      const d = await Vp(u.promise, o.waitTimeoutMs, a?.requestLifecycle);
      if (s.waitJoinMs = d.timedOut === !0 ? o.waitTimeoutMs : Math.max(0, H() - Number(u.startedAt || H())), d.timedOut === !0)
        return s.overlay = "probe_wait_timeout", s.fastFailReason = "probe_wait_timeout", null;
      const f = d.value && typeof d.value == "object" ? d.value : null;
      if (s.probeReason = u.joined === !0 ? "join_existing_probe" : l, s.probeElapsedMs = Math.max(0, Number(f?.elapsedMs) || 0), s.probeWinner = String(f?.winnerTargetKey || "").trim(), !f || f.status !== "ok" || !rt(f.winnerTargetRecord))
        return s.overlay = "probe_miss", s.fastFailReason = String(f?.reason || "probe_no_winner").trim() || "probe_no_winner", null;
      const m = qe(i), p = qe(f.winnerTargetRecord);
      if (!p || p === m)
        return s.overlay = "probe_miss", s.fastFailReason = "probe_reused_failed_target", null;
      o.wakeJitterMs > 0 && await qp(Math.floor(Math.random() * (o.wakeJitterMs + 1)), a?.requestLifecycle);
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
      const o = e.getFailoverStateSnapshot(a.cacheKey, a.preferredTtlMs);
      if ((Array.isArray(o?.failingTargetKeys) ? o.failingTargetKeys : []).length <= 0) return;
      const s = Number(o?.lastProbeResult?.completedAt) || 0;
      if (s > 0 && s + a.preferredTtlMs > H() || o?.inFlightProbe) return;
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
function dg(n = {}, e = {}) {
  return {
    ...cg(n, e),
    ...lg(n, e),
    ...ug(n, e)
  };
}
function fg(n = {}, e = {}) {
  const {} = n, r = {
    async buildProxyRequestState(t, a, o, s, i, c, l, u, d = {}) {
      const f = Op(t.headers);
      Kn.forEach((O) => f.delete(O));
      const m = /* @__PURE__ */ new Set();
      let p = null;
      if (a.headers && typeof a.headers == "object") for (const [O, C] of Object.entries(a.headers)) {
        const v = String(O).toLowerCase();
        Kn.has(v) || (m.add(v), v === "cookie" ? p = String(C) : f.set(O, String(C)));
      }
      const g = np(f.get("Cookie"), p, ["auth_token", ...ln]);
      g ? f.set("Cookie", g) : f.delete("Cookie"), Fp(f, d.effectiveMediaAuthMode || a.mediaAuthMode);
      const h = yd(d.effectiveRealClientIpMode || a.realClientIpMode);
      h === "none" && xu.forEach((O) => f.delete(O)), (h === "full" || h === "real-ip-only") && f.set("X-Real-IP", i), h === "full" && f.set("X-Forwarded-For", i), f.set("X-Forwarded-Host", s.host), f.set("X-Forwarded-Proto", s.protocol.replace(":", "")), c.isWsUpgrade ? (f.set("Upgrade", "websocket"), f.set("Connection", "Upgrade")) : l && f.set("Connection", "keep-alive"), (c.isBigStream || c.isSmartStrmMedia || c.isSegment || c.isManifest) && !m.has("referer") && f.delete("Referer");
      const y = m.has("origin"), _ = m.has("referer"), S = f.has("Origin"), A = f.has("Referer");
      let b = "", R = "/";
      if (A && !_) try {
        const O = new URL(f.get("Referer") || "");
        b = String(O.origin || "").trim(), R = `${O.pathname || "/"}${O.search || ""}` || "/";
      } catch {
        b = "", R = "/";
      }
      const T = {
        baseHeaderEntries: [...f.entries()],
        hasOriginHeader: S,
        hasRefererHeader: A,
        adminCustomHasOrigin: y,
        adminCustomHasReferer: _,
        refererOrigin: b,
        refererPathAndSearch: R,
        isHotMediaRequest: c.isSmartStrmMedia === !0 || c.isBigStream === !0 || c.isManifest === !0 || c.isSegment === !0
      }, L = t.method !== "GET" && t.method !== "HEAD";
      let D = null, E = "none", w = "";
      if (L && t.body) {
        const O = so(t.headers.get("Content-Length"));
        if (Number.isFinite(O) && O >= 0 && O <= yu) try {
          D = await t.clone().arrayBuffer(), E = "buffered", (c.isPlaybackInfoRequest === !0 || c.isPlaybackSessionControlRequest === !0) && (w = io(D));
        } catch {
          D = t.body, E = "stream";
        }
        else
          D = t.body, E = "stream";
      }
      const N = L ? u.slice(0, 1) : u;
      return {
        newHeaders: f,
        adminCustomHeaders: m,
        transportTemplate: T,
        preparedBody: D,
        preparedBodyMode: E,
        preparedBodyText: w,
        retryTargetRecords: N,
        allowAutomaticRetry: !L,
        clientRedirectAuthPolicy: Ea(f)
      };
    },
    buildProxyResponseHeaders(t, a, o, s, i, c = {}) {
      const l = new Headers(t.headers);
      Ou.forEach((f) => l.delete(f)), l.set("Access-Control-Allow-Origin", s), o && o["Access-Control-Expose-Headers"] && l.set("Access-Control-Expose-Headers", o["Access-Control-Expose-Headers"]), o && o["Access-Control-Allow-Methods"] && l.set("Access-Control-Allow-Methods", o["Access-Control-Allow-Methods"]);
      const u = a.headers.get("Access-Control-Request-Headers");
      u ? (l.set("Access-Control-Allow-Headers", u), Hr(l, "Access-Control-Request-Headers")) : o && o["Access-Control-Allow-Headers"] && l.set("Access-Control-Allow-Headers", o["Access-Control-Allow-Headers"]), s !== "*" && Hr(l, "Origin"), (!c.enableH3 || c.forceH1) && l.delete("Alt-Svc");
      const d = ue(c.imageCacheMaxAge, _i * 86400, 0, 365 * 86400);
      if (t.status >= 400 || i.isManifest || i.isBigStream || i.isSmartStrmMedia) l.set("Cache-Control", "no-store");
      else if (c.proxiedExternalRedirect) l.set("Cache-Control", "no-store");
      else if (i.isImage || i.isStaticFile || i.isSubtitle) {
        const f = pp(a) ? "private" : "public";
        l.set("Cache-Control", `${f}, max-age=${d}`);
      }
      return we(l), l;
    },
    applyProxyRedirectHeaders(t, a, o, s, i, c, l, u = {}) {
      if (c) {
        Mc(t), t.set("Location", c.toString()), t.set("Cache-Control", "no-store");
        return;
      }
      if (!(a.status >= 300 && a.status < 400)) return;
      const d = t.get("Location");
      if (!d) return;
      const f = Ps(ba(d, l || o), o, s, i, {
        linkVariant: u.linkVariant,
        entryMode: u.entryMode
      });
      f && t.set("Location", f);
    },
    buildClientVisibleRedirectUrl(t, a, o, s, i, c = {}) {
      const l = t instanceof URL ? t : ba(t, a);
      if (!l) return null;
      if (c.preserveWorkerProxy !== !0) return l;
      const u = Ps(l, a, o, s, {
        linkVariant: c.linkVariant,
        entryMode: c.entryMode
      }), d = yt(o, s, {
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
    buildPlaybackInfoClientVisibleUrl(t, a = "/", o = {}) {
      const s = Q(a), i = String(o.search || ""), c = String(o.hash || "");
      return String(t?.playbackInfoRewriteUrlMode || "").trim() === "absolute" ? Pc(t?.requestUrl || t?.rawRequestUrl || "https://playback-info.local/", t?.nodeName, t?.nodeKey, s, {
        linkVariant: t?.linkVariant,
        entryMode: t?.entryMode,
        search: i,
        hash: c
      }).toString() : `${rp(ep(s, t?.nodeName, t?.nodeKey, { entryMode: t?.entryMode }), tp(t))}${i}${c}`;
    },
    buildPlaybackInfoProxyUrl(t, a, o, s) {
      const i = String(a || "").trim();
      if (!i) return "";
      const c = Xm(i, t?.proxyPath || "/", o, t?.requestUrl || t?.rawRequestUrl || s, yt(t?.nodeName, t?.nodeKey, {
        linkVariant: t?.linkVariant,
        entryMode: t?.entryMode
      }));
      if (c) return r.buildPlaybackInfoClientVisibleUrl(t, c.proxyPath, {
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
        const { resolvedUrl: d, proxyPath: f } = Da(l, o);
        if (d && f) {
          const m = Ym(f, t?.proxyPath || "/", o);
          return r.buildPlaybackInfoClientVisibleUrl(t, m, {
            search: d.search,
            hash: d.hash
          });
        }
      }
      const u = Zm(t?.requestUrl || t?.rawRequestUrl || "https://playback-info.local/", t?.nodeName, t?.nodeKey, l, {
        linkVariant: t?.linkVariant,
        entryMode: t?.entryMode
      });
      return String(t?.playbackInfoRewriteUrlMode || "").trim() === "absolute" ? u.toString() : r.buildPlaybackInfoClientVisibleUrl(t, u.pathname || "/", {
        search: u.search || "",
        hash: u.hash || ""
      });
    },
    sanitizePlaybackInfoSerializedResponseHeaders: fo,
    parsePlaybackInfoRootObject: $a,
    buildPlaybackInfoContractErrorState(t, a, o = "invalid_payload", s = null) {
      const i = a?.response;
      return t.playbackInfoRewrite = "rejected", e.buildProxyErrorState(t, a, {
        message: "Upstream PlaybackInfo response must be a JSON object.",
        guardHeader: "X-Proxy-Contract-Guard",
        guardValue: "playback-info",
        details: k(s) ? s : {
          reason: String(o || "invalid_payload"),
          upstreamStatus: Number(i?.status) || 0,
          contentType: dr(i?.headers?.get?.("Content-Type")) || "missing"
        }
      });
    },
    async guardPlaybackInfoResponseContract(t, a) {
      if (t?.requestTraits?.isPlaybackInfoRequest !== !0 || er(a?.playbackInfoRepresentation) && a.playbackInfoRepresentation.response === a?.response) return a;
      const o = await pl(a?.response, {
        requestMethod: t.requestMethod,
        maxBytes: yi
      });
      return o.kind === "skip" ? a : o.kind === "invalid" ? r.buildPlaybackInfoContractErrorState(t, a, o.reason, o.details) : {
        ...a,
        playbackInfoRepresentation: o.representation
      };
    },
    decodePlaybackInfoJsonValue: Ba,
    normalizePlaybackInfoObjectArray: mo,
    sanitizePlaybackInfoMediaSource: zs,
    sanitizePlaybackInfoMediaSourcesPayload: po,
    rewritePlaybackInfoPayload(t, a, o, s) {
      return Ws(a, { buildProxyUrl: (i) => r.buildPlaybackInfoProxyUrl(t, i, o, s) });
    },
    async maybeRewritePlaybackInfoResponse(t, a) {
      if (t?.requestTraits?.isPlaybackInfoRequest !== !0) return a;
      const o = zt(t?.effectivePlaybackInfoMode) === "rewrite", s = o ? "not_needed" : "passthrough", i = a?.response;
      if (!i || !(i.status >= 200 && i.status < 300) || t.requestMethod === "HEAD" || i.status === 204 || i.status === 205 || !i.body)
        return t.playbackInfoRewrite !== "rejected" && (t.playbackInfoRewrite = s), a;
      if ((!er(a?.playbackInfoRepresentation) || a.playbackInfoRepresentation.response !== i) && (a = await r.guardPlaybackInfoResponseContract(t, a), !er(a?.playbackInfoRepresentation)))
        return a;
      try {
        const c = gl(a.playbackInfoRepresentation, {
          rewriteEnabled: o,
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
function mg({ configReader: n, nodeRepository: e, logger: r, cachePort: t, fetchPort: a }) {
  const o = {}, s = {
    CacheManager: t,
    Logger: r,
    configReader: n,
    fetchPort: a,
    nodeRepository: e
  }, i = [
    Qp(s, o),
    ag(s, o),
    ig(s, o),
    dg(s, o),
    fg(s, o)
  ];
  for (const c of i) for (const [l, u] of Object.entries(c)) o[l] = u;
  return o;
}
function pg({ configReader: n, nodeRepository: e, logger: r, cachePort: t, fetchPort: a }) {
  const o = mg({
    configReader: n,
    nodeRepository: e,
    logger: r,
    cachePort: t,
    fetchPort: a
  });
  return Object.freeze({
    handle: (...s) => o.handle(...s),
    testingSupport: o
  });
}
function gg(n = {}, e = {}) {
  const { CacheManager: r, withAdminShellRuntimeStatus: t } = n;
  return {
    getStatsBucketParts(a, o = F.Defaults.ScheduleUtcOffsetMinutes) {
      const s = Dt(Number(a) || 0, o);
      return {
        bucketDate: s.dateKey,
        bucketHour: s.hour
      };
    },
    summarizeStatsHourlyEntries(a = [], o = {}) {
      const s = ze(o.utcOffsetMinutes), i = /* @__PURE__ */ new Map();
      for (const c of Array.isArray(a) ? a : []) {
        const l = Number(c?.timestamp) || 0;
        if (l <= 0) continue;
        const { bucketDate: u, bucketHour: d } = e.getStatsBucketParts(l, s), f = `${u}:${d}`, m = i.get(f) || {
          bucketDate: u,
          bucketHour: d,
          requestCount: 0,
          playCount: 0,
          playbackInfoCount: 0
        };
        m.requestCount += 1, Td(c?.requestPath, c?.category) && (m.playCount += 1), Rd(c?.requestPath, c?.category) && (m.playbackInfoCount += 1), i.set(f, m);
      }
      return [...i.values()].sort((c, l) => c.bucketDate !== l.bucketDate ? String(c.bucketDate).localeCompare(String(l.bucketDate)) : Number(c.bucketHour) - Number(l.bucketHour));
    },
    async incrementStatsHourly(a, o = [], s = {}) {
      if (!a || !await e.hasStatsHourlyTable(a)) return !1;
      const i = e.summarizeStatsHourlyEntries(o, s);
      return i.length ? await e.upsertStatsHourlyBuckets(a, i, s) : !0;
    },
    async upsertStatsHourlyBuckets(a, o = [], s = {}) {
      if (!a || !await e.hasStatsHourlyTable(a)) return !1;
      const i = (Array.isArray(o) ? o : []).map((u) => ({
        bucketDate: String(u?.bucketDate || "").trim(),
        bucketHour: Math.max(0, Number(u?.bucketHour) || 0),
        requestCount: Math.max(0, Number(u?.requestCount) || 0),
        playCount: Math.max(0, Number(u?.playCount) || 0),
        playbackInfoCount: Math.max(0, Number(u?.playbackInfoCount) || 0)
      })).filter((u) => u.bucketDate);
      if (!i.length) return !0;
      const c = (/* @__PURE__ */ new Date()).toISOString(), l = ka("proxy_stats_hourly.batch", JSON.stringify(i));
      return await a.prepare(`INSERT INTO ${e.STATS_HOURLY_TABLE} (
				bucket_date, bucket_hour, request_count, play_count, playback_info_count, updated_at
			)
			SELECT json_extract(entry.value, '$.bucketDate'), CAST(json_extract(entry.value, '$.bucketHour') AS INTEGER),
				CAST(json_extract(entry.value, '$.requestCount') AS INTEGER), CAST(json_extract(entry.value, '$.playCount') AS INTEGER),
				CAST(json_extract(entry.value, '$.playbackInfoCount') AS INTEGER), ?
			FROM json_each(?) AS entry
			WHERE 1
			ON CONFLICT(bucket_date, bucket_hour) DO UPDATE SET
				request_count = ${e.STATS_HOURLY_TABLE}.request_count + excluded.request_count,
				play_count = ${e.STATS_HOURLY_TABLE}.play_count + excluded.play_count,
				playback_info_count = ${e.STATS_HOURLY_TABLE}.playback_info_count + excluded.playback_info_count,
				updated_at = excluded.updated_at`).bind(c, l).run(), !0;
    },
    async clearStatsHourly(a) {
      return !a || !await e.hasStatsHourlyTable(a) ? !1 : (await a.prepare(`DELETE FROM ${e.STATS_HOURLY_TABLE}`).run(), !0);
    },
    getStatsUtcOffsetMinutesFromStatus(a = {}) {
      const o = Number(a?.statsUtcOffsetMinutes);
      return Number.isFinite(o) ? ze(o) : null;
    },
    async getDailyStatsHourly(a, o) {
      if (!a || !o || !await e.hasStatsHourlyTable(a)) return [];
      try {
        const s = await a.prepare(`SELECT bucket_hour, request_count, play_count, playback_info_count
              FROM ${e.STATS_HOURLY_TABLE}
              WHERE bucket_date = ?
              ORDER BY bucket_hour ASC`).bind(String(o)).all();
        return Array.isArray(s?.results) ? s.results : [];
      } catch {
        return [];
      }
    },
    async rebuildStatsHourlyForDate(a, o = {}) {
      if (!a) return !1;
      const s = String(o.bucketDate || "").trim();
      return s ? (await e.ensureStatsHourlySchema(a), await a.prepare(`DELETE FROM ${e.STATS_HOURLY_TABLE} WHERE bucket_date = ?`).bind(s).run(), !0) : !1;
    },
    async rebuildStatsHourlyWindow(a, o = {}) {
      return a ? (await e.ensureStatsHourlySchema(a), await e.clearStatsHourly(a), !0) : !1;
    },
    async ensureStatsHourlyWindowAligned(a, o = {}) {
      const s = e.resolveOpsStatusStores(a), i = s?.db || null;
      if (!i || !await e.hasStatsHourlyTable(i)) return {
        rebuilt: !1,
        reason: "stats_unavailable"
      };
      const c = oe(o.config || {}), l = ze(c.scheduleUtcOffsetMinutes), u = await e.getOpsStatusSection(s, "log");
      if (e.getStatsUtcOffsetMinutesFromStatus(u) === l && o.force !== !0) return {
        rebuilt: !1,
        reason: "already_aligned",
        utcOffsetMinutes: l
      };
      const d = o.now instanceof Date ? o.now : /* @__PURE__ */ new Date(), f = ue(c.logRetentionDays, F.Defaults.LogRetentionDays, 1, F.Defaults.LogRetentionDaysMax), m = Math.max(0, d.getTime() - f * 24 * 60 * 60 * 1e3), p = d.getTime();
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
      let o = 0, s = [];
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
      ].map((u) => String(u || "").toLowerCase()));
      for (const u of s) {
        const d = String(u?.name || "").trim();
        if (!d) continue;
        const f = d.toLowerCase(), m = Lr(u?.sql || "");
        (l.has(f) || m.includes(i)) && (await a.prepare(`DROP TRIGGER IF EXISTS ${de(d)}`).run(), o += 1);
      }
      return o;
    },
    async rebuildLogsFts(a) {
      return !a || !await e.hasLogsFtsTable(a) ? !1 : (await a.prepare(`INSERT INTO ${e.LOGS_FTS_TABLE}(${e.LOGS_FTS_TABLE}) VALUES('rebuild')`).run(), !0);
    },
    async ensureLogsFtsSchema(a, o = {}) {
      if (!a) return {
        migratedRows: 0,
        droppedTriggers: 0,
        rebuilt: !1,
        recreated: !1
      };
      const s = o.forceRecreate === !0;
      o.baseSchemaReady !== !0 && await e.ensureLogsBaseSchema(a);
      const i = await e.getLogsFtsReadiness(a);
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
      s && (l = await e.dropLogsFtsSyncTriggers(a), await a.prepare(`DROP TABLE IF EXISTS ${e.LOGS_FTS_TABLE}`).run(), c = !0), await a.prepare(`CREATE VIRTUAL TABLE IF NOT EXISTS ${e.LOGS_FTS_TABLE} USING fts5(node_name, request_path, user_agent, error_detail, detail_json, content='${e.LOGS_TABLE}', content_rowid='id', tokenize='unicode61')`).run(), s && (l += await e.dropLogsFtsSyncTriggers(a)), await a.prepare(`CREATE TRIGGER IF NOT EXISTS ${e.LOGS_FTS_INSERT_TRIGGER} AFTER INSERT ON ${e.LOGS_TABLE} BEGIN
            INSERT INTO ${e.LOGS_FTS_TABLE}(rowid, node_name, request_path, user_agent, error_detail, detail_json)
            VALUES (new.id, new.node_name, new.request_path, COALESCE(new.user_agent, ''), COALESCE(new.error_detail, ''), COALESCE(new.detail_json, ''));
          END;`).run();
      const u = (await a.prepare(`SELECT COUNT(*) as total FROM ${e.LOGS_TABLE}`).first())?.total || 0;
      return await a.prepare(`INSERT INTO ${e.LOGS_FTS_TABLE}(${e.LOGS_FTS_TABLE}) VALUES('rebuild')`).run(), {
        migratedRows: u,
        droppedTriggers: l,
        rebuilt: !0,
        recreated: c
      };
    }
  };
}
function hg(n = {}, e = {}) {
  const { CacheManager: r, withAdminShellRuntimeStatus: t } = n;
  return {
    async ensureDnsIpWorkspaceSchema(a) {
      if (!a) return !1;
      if (e.isD1SchemaReadyCached(a, "dnsIpWorkspaceSchema")) return !0;
      let o = J.DnsIpWorkspaceDbReady.get(a);
      o || (o = (async () => (await a.prepare(`CREATE TABLE IF NOT EXISTS ${e.DNS_IP_POOL_ITEMS_TABLE} (
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
        throw J.DnsIpWorkspaceDbReady.delete(a), s;
      }), J.DnsIpWorkspaceDbReady.set(a, o));
      try {
        return await o;
      } finally {
        J.DnsIpWorkspaceDbReady.get(a) === o && J.DnsIpWorkspaceDbReady.delete(a);
      }
    },
    getDnsIpPoolRevisionFromStatus(a = {}) {
      const o = String(a?.revision || "").trim();
      return o || Ht("dns_ip_pool", String(a?.updatedAt || "").trim());
    },
    async bumpDnsIpPoolRevision(a, o = {}, s = null) {
      const i = await e.getOpsStatusSection(a, "dnsIpPool"), c = (/* @__PURE__ */ new Date()).toISOString(), l = ie(`${e.getDnsIpPoolRevisionFromStatus(i)}:${c}:${ee(o)}`);
      return await e.patchOpsStatus(a, { dnsIpPool: {
        ...o,
        revision: Ht(l, c),
        updatedAt: c
      } }, s);
    },
    async getDnsIpPoolItems(a) {
      if (!a) return [];
      await e.ensureDnsIpWorkspaceSchema(a);
      try {
        const o = await a.prepare(`SELECT id, ip, ip_type, source_kind, source_label, line_label, remark, created_at, updated_at
              FROM ${e.DNS_IP_POOL_ITEMS_TABLE}
              ORDER BY updated_at DESC, ip ASC`).all();
        return (Array.isArray(o?.results) ? o.results : []).map((s) => fr(s)).filter(Boolean);
      } catch {
        return [];
      }
    },
    async upsertDnsIpPoolItems(a, o = [], s = {}) {
      if (!a) return [];
      await e.ensureDnsIpWorkspaceSchema(a);
      const i = (/* @__PURE__ */ new Date()).toISOString(), c = /* @__PURE__ */ new Map();
      for (const f of Array.isArray(o) ? o : []) {
        const m = fr(f, {
          createdAt: i,
          updatedAt: i,
          sourceKind: s.sourceKind,
          sourceLabel: s.sourceLabel
        });
        m && c.set(m.ip.toLowerCase(), m);
      }
      const l = [...c.values()];
      if (!l.length) return [];
      const u = JSON.stringify(l.map((f) => ({
        id: f.id,
        ip: f.ip,
        ipType: f.ipType,
        sourceKind: f.sourceKind,
        sourceLabel: f.sourceLabel,
        lineLabel: f.lineLabel,
        remark: f.remark,
        createdAt: f.createdAt,
        updatedAt: f.updatedAt
      })));
      ka("dns_ip_pool_items.batch", u);
      const d = a.prepare(`INSERT INTO ${e.DNS_IP_POOL_ITEMS_TABLE} (
            id, ip, ip_type, source_kind, source_label, line_label, remark, created_at, updated_at
          )
          SELECT
            json_extract(entry.value, '$.id'),
            json_extract(entry.value, '$.ip'),
            json_extract(entry.value, '$.ipType'),
            json_extract(entry.value, '$.sourceKind'),
            json_extract(entry.value, '$.sourceLabel'),
            json_extract(entry.value, '$.lineLabel'),
            json_extract(entry.value, '$.remark'),
            json_extract(entry.value, '$.createdAt'),
            json_extract(entry.value, '$.updatedAt')
          FROM json_each(?) AS entry
          WHERE 1
          ON CONFLICT(ip) DO UPDATE SET
            ip_type = excluded.ip_type,
            source_kind = excluded.source_kind,
            source_label = excluded.source_label,
            line_label = CASE WHEN COALESCE(excluded.line_label, '') != '' THEN excluded.line_label ELSE ${e.DNS_IP_POOL_ITEMS_TABLE}.line_label END,
            remark = CASE WHEN COALESCE(excluded.remark, '') != '' THEN excluded.remark ELSE ${e.DNS_IP_POOL_ITEMS_TABLE}.remark END,
            updated_at = excluded.updated_at`).bind(u);
      return await a.batch([d]), l;
    },
    async deleteDnsIpPoolItems(a, o = []) {
      if (!a) return 0;
      await e.ensureDnsIpWorkspaceSchema(a);
      const s = [...new Set((Array.isArray(o) ? o : []).map((c) => String(c || "").trim()).filter((c) => Ye(c)))];
      if (!s.length) return 0;
      const i = JSON.stringify(s);
      return ka("dns_ip_pool_items.delete_batch", i), await a.batch([a.prepare(`DELETE FROM ${e.DNS_IP_POOL_ITEMS_TABLE} WHERE ip IN (SELECT value FROM json_each(?))`).bind(i), a.prepare(`DELETE FROM ${e.DNS_IP_PROBE_CACHE_TABLE} WHERE ip IN (SELECT value FROM json_each(?))`).bind(i)]), s.length;
    },
    async getDnsIpPoolSourcesFromDb(a, o = {}) {
      if (!a) return [];
      o.schemaReady !== !0 && await e.ensureDnsIpWorkspaceSchema(a);
      try {
        const s = await a.prepare(`SELECT id, name, url, source_type, domain, source_kind, preset_id, builtin_id, enabled, sort_order, ip_limit, last_fetch_at, last_fetch_status, last_fetch_count, created_at, updated_at
              FROM ${e.DNS_IP_POOL_SOURCES_TABLE}
              ORDER BY sort_order ASC, updated_at ASC`).all();
        return (Array.isArray(s?.results) ? s.results : []).map((i, c) => Ct(i, c)).filter((i) => or(i));
      } catch {
        return [];
      }
    },
    async getDnsIpPoolSourcesFromDbStrict(a) {
      if (!a) throw new Error("D1 not configured");
      await e.ensureDnsIpWorkspaceSchema(a);
      const o = await a.prepare(`SELECT id, name, url, source_type, domain, source_kind, preset_id, builtin_id, enabled, sort_order, ip_limit, last_fetch_at, last_fetch_status, last_fetch_count, created_at, updated_at
            FROM ${e.DNS_IP_POOL_SOURCES_TABLE}
            ORDER BY sort_order ASC, updated_at ASC`).all();
      return (Array.isArray(o?.results) ? o.results : []).map((s, i) => Ct(s, i)).filter((s) => or(s));
    },
    async getDnsIpPoolSources(a) {
      const o = e.resolveOpsStatusStores(a)?.db || null;
      return await e.getDnsIpPoolSourcesFromDb(o);
    },
    async getDnsIpPoolSourcesForRead(a) {
      const o = e.resolveOpsStatusStores(a)?.db || null;
      return await e.getDnsIpPoolSourcesFromDb(o);
    },
    async persistDnsIpPoolSources(a, o = [], s = null) {
      const i = (Array.isArray(o) ? o : []).map((u, d) => Ct(u, d)).filter((u) => or(u)), c = e.resolveOpsStatusStores(a)?.db || null;
      if (!c) throw new Error("D1 not configured");
      await e.ensureDnsIpWorkspaceSchema(c);
      const l = [c.prepare(`DELETE FROM ${e.DNS_IP_POOL_SOURCES_TABLE}`)];
      if (i.length) {
        const u = JSON.stringify(i.map((d) => ({
          id: d.id,
          name: d.name,
          url: d.url,
          sourceType: d.sourceType,
          domain: d.domain,
          sourceKind: d.sourceKind,
          presetId: d.presetId,
          builtinId: d.builtinId,
          enabled: d.enabled ? 1 : 0,
          sortOrder: d.sortOrder,
          ipLimit: d.ipLimit,
          lastFetchAt: d.lastFetchAt,
          lastFetchStatus: d.lastFetchStatus,
          lastFetchCount: d.lastFetchCount,
          createdAt: d.createdAt,
          updatedAt: d.updatedAt
        })));
        ka("dns_ip_pool_sources.batch", u), l.push(c.prepare(`INSERT INTO ${e.DNS_IP_POOL_SOURCES_TABLE} (
            id, name, url, source_type, domain, source_kind, preset_id, builtin_id, enabled, sort_order, ip_limit, last_fetch_at, last_fetch_status, last_fetch_count, created_at, updated_at
          ) SELECT
            json_extract(entry.value, '$.id'),
            json_extract(entry.value, '$.name'),
            json_extract(entry.value, '$.url'),
            json_extract(entry.value, '$.sourceType'),
            json_extract(entry.value, '$.domain'),
            json_extract(entry.value, '$.sourceKind'),
            json_extract(entry.value, '$.presetId'),
            json_extract(entry.value, '$.builtinId'),
            json_extract(entry.value, '$.enabled'),
            json_extract(entry.value, '$.sortOrder'),
            json_extract(entry.value, '$.ipLimit'),
            json_extract(entry.value, '$.lastFetchAt'),
            json_extract(entry.value, '$.lastFetchStatus'),
            json_extract(entry.value, '$.lastFetchCount'),
            json_extract(entry.value, '$.createdAt'),
            json_extract(entry.value, '$.updatedAt')
          FROM json_each(?) AS entry`).bind(u));
      }
      return await c.batch(l), i;
    },
    async updateDnsIpPoolSourceFetchState(a, o = "", s = {}) {
      if (!a || !o) return !1;
      await e.ensureDnsIpWorkspaceSchema(a);
      const i = (/* @__PURE__ */ new Date()).toISOString();
      return await a.prepare(`UPDATE ${e.DNS_IP_POOL_SOURCES_TABLE}
            SET last_fetch_at = ?, last_fetch_status = ?, last_fetch_count = ?, updated_at = ?
            WHERE id = ?`).bind(String(s.lastFetchAt || i), String(s.lastFetchStatus || ""), Math.max(0, Number(s.lastFetchCount) || 0), i, String(o)).run(), !0;
    },
    async getDnsIpPoolFetchCacheEntry(a, o = "") {
      if (!a || !o) return null;
      await e.ensureDnsIpWorkspaceSchema(a);
      try {
        const s = await a.prepare(`SELECT signature, items_json, source_results_json, imported_count, enabled_source_count, cached_at, expires_at, created_at, updated_at
              FROM ${e.DNS_IP_POOL_FETCH_CACHE_TABLE}
              WHERE signature = ? AND expires_at > ?
              LIMIT 1`).bind(String(o), H()).first();
        if (!s) return null;
        const i = JSON.parse(String(s.items_json || "[]")), c = JSON.parse(String(s.source_results_json || "[]")), l = mr(Array.isArray(i) ? i : []), u = Array.isArray(c) ? c : [];
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
    async upsertDnsIpPoolFetchCacheEntry(a, o = {}) {
      if (!a) return null;
      await e.ensureDnsIpWorkspaceSchema(a);
      const s = String(o?.signature || "").trim();
      if (!s) return null;
      const i = mr(o?.items || []), c = (Array.isArray(o?.sourceResults) ? o.sourceResults : []).map((y) => ni(y, y)), l = Math.max(0, Number(o?.cachedAtMs ?? o?.cached_at ?? H()) || H()), u = Math.max(l, Number(o?.expiresAtMs ?? o?.expires_at ?? l + 24e5) || l + 24e5), d = String(o?.createdAt || o?.created_at || new Date(l).toISOString()), f = String(o?.updatedAt || o?.updated_at || new Date(l).toISOString()), m = Math.max(0, Number(o?.importedCount ?? o?.imported_count) || i.length), p = Math.max(0, Number(o?.enabledSourceCount ?? o?.enabled_source_count) || 0), g = JSON.stringify(i), h = JSON.stringify(c);
      return ve(g) + ve(h) > Gt ? null : (await a.prepare(`INSERT INTO ${e.DNS_IP_POOL_FETCH_CACHE_TABLE} (
            signature, items_json, source_results_json, imported_count, enabled_source_count, cached_at, expires_at, created_at, updated_at
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
          ON CONFLICT(signature) DO UPDATE SET
            items_json = excluded.items_json,
            source_results_json = excluded.source_results_json,
            imported_count = excluded.imported_count,
            enabled_source_count = excluded.enabled_source_count,
            cached_at = excluded.cached_at,
            expires_at = excluded.expires_at,
				updated_at = excluded.updated_at`).bind(s, g, h, m, p, l, u, d, f).run(), {
        signature: s,
        items: i,
        sourceResults: c,
        importedCount: m,
        enabledSourceCount: p,
        cachedAtMs: l,
        expiresAtMs: u,
        createdAt: d,
        updatedAt: f
      });
    },
    async getDnsIpProbeCacheEntry(a, o = "", s = "") {
      if (!a || !o || !s) return null;
      await e.ensureDnsIpWorkspaceSchema(a);
      try {
        const i = await a.prepare(`SELECT ip, entry_colo, probe_status, latency_ms, cf_ray, colo_code, city_name, country_code, country_name, probed_at, expires_at
              FROM ${e.DNS_IP_PROBE_CACHE_TABLE}
              WHERE ip = ? AND entry_colo = ? AND expires_at > ?
              LIMIT 1`).bind(String(o), String(s).toUpperCase(), H()).first();
        return i ? {
          ip: String(i.ip || ""),
          entryColo: String(i.entry_colo || "").toUpperCase(),
          probeStatus: Fa(i.probe_status),
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
    async getDnsIpProbeCacheEntries(a, o = [], s = "") {
      if (!a || !s) return [];
      const i = [...new Set((Array.isArray(o) ? o : []).map((u) => String(u || "").trim()).filter(Boolean))];
      if (!i.length) return [];
      await e.ensureDnsIpWorkspaceSchema(a);
      const c = [], l = H();
      try {
        for (let u = 0; u < i.length; u += 98) {
          const d = i.slice(u, u + 98);
          if (!d.length) continue;
          const f = d.map(() => "?").join(", "), m = await a.prepare(`SELECT ip, entry_colo, probe_status, latency_ms, cf_ray, colo_code, city_name, country_code, country_name, probed_at, expires_at
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
        probeStatus: Fa(u?.probe_status),
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
    async upsertDnsIpProbeCacheEntries(a, o = []) {
      if (!a) return [];
      await e.ensureDnsIpWorkspaceSchema(a);
      const s = (Array.isArray(o) ? o : []).map((c) => ({
        ip: String(c?.ip || "").trim(),
        entryColo: String(c?.entryColo || c?.entry_colo || "").trim().toUpperCase(),
        probeStatus: Fa(c?.probeStatus || c?.probe_status || ""),
        latencyMs: Number.isFinite(Number(c?.latencyMs ?? c?.latency_ms)) ? Math.round(Number(c?.latencyMs ?? c?.latency_ms)) : null,
        cfRay: String(c?.cfRay || c?.cf_ray || ""),
        coloCode: String(c?.coloCode || c?.colo_code || "").toUpperCase(),
        cityName: String(c?.cityName || c?.city_name || ""),
        countryCode: String(c?.countryCode || c?.country_code || "").toUpperCase(),
        countryName: String(c?.countryName || c?.country_name || ""),
        probedAt: String(c?.probedAt || c?.probed_at || (/* @__PURE__ */ new Date()).toISOString()),
        expiresAt: Math.max(H(), Number(c?.expiresAt ?? c?.expires_at) || 0)
      })).filter((c) => Ye(c.ip) && c.entryColo);
      if (!s.length) return [];
      const i = JSON.stringify(s);
      return ve(i) > Gt ? [] : (await a.prepare(`INSERT INTO ${e.DNS_IP_PROBE_CACHE_TABLE} (
				ip, entry_colo, probe_status, latency_ms, cf_ray, colo_code, city_name, country_code, country_name, probed_at, expires_at
			) SELECT
				json_extract(entry.value, '$.ip'),
				json_extract(entry.value, '$.entryColo'),
				json_extract(entry.value, '$.probeStatus'),
				json_extract(entry.value, '$.latencyMs'),
				json_extract(entry.value, '$.cfRay'),
				json_extract(entry.value, '$.coloCode'),
				json_extract(entry.value, '$.cityName'),
				json_extract(entry.value, '$.countryCode'),
				json_extract(entry.value, '$.countryName'),
				json_extract(entry.value, '$.probedAt'),
				json_extract(entry.value, '$.expiresAt')
			FROM json_each(?) AS entry
			WHERE 1
			ON CONFLICT(ip, entry_colo) DO UPDATE SET
            probe_status = excluded.probe_status,
            latency_ms = excluded.latency_ms,
            cf_ray = excluded.cf_ray,
            colo_code = excluded.colo_code,
            city_name = excluded.city_name,
            country_code = excluded.country_code,
            country_name = excluded.country_name,
            probed_at = excluded.probed_at,
				expires_at = excluded.expires_at`).bind(i).run(), s);
    },
    async upsertDnsIpProbeCacheEntry(a, o = {}) {
      return (await e.upsertDnsIpProbeCacheEntries(a, [o]))[0] || null;
    }
  };
}
function yg(n = {}, e = {}) {
  const { CacheManager: r, withAdminShellRuntimeStatus: t } = n;
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
      let o = J.OpsStatusShadowCache.get(a);
      return o || (o = {
        pendingPatch: {},
        flushPromise: null,
        payloadCache: /* @__PURE__ */ new Map()
      }, J.OpsStatusShadowCache.set(a, o)), o;
    },
    getOpsStatusShadowPatch(a) {
      const o = e.getOpsStatusShadowState(a);
      return k(o?.pendingPatch) ? o.pendingPatch : {};
    },
    getOpsStatusPayloadCache(a) {
      const o = e.getOpsStatusShadowState(a);
      return o ? (o.payloadCache instanceof Map || (o.payloadCache = /* @__PURE__ */ new Map()), o.payloadCache) : null;
    },
    cacheOpsStatusPayload(a, o, s) {
      const i = e.getOpsStatusPayloadCache(a);
      i && Ue(i, String(o || ""), {
        payload: s && typeof s == "object" ? s : null,
        expiresAt: H() + Math.max(1e3, Number(F.Defaults.OpsStatusReadCacheTtlMs) || 1e3)
      }, 8);
    },
    buildOpsStatusRootPatch(a = {}) {
      const o = a && typeof a == "object" ? a : {}, s = (/* @__PURE__ */ new Date()).toISOString(), i = {};
      for (const [c, l] of Object.entries(o)) {
        if (e.OPS_STATUS_SECTION_SCOPES[c]) {
          const u = Xe(i[c], l);
          u.updatedAt = s, i[c] = u;
          continue;
        }
        i[c] = l;
      }
      return i;
    },
    async flushOpsStatusShadow(a, o = {}) {
      const s = a?.db || null;
      if (!s) return {};
      const i = Array.isArray(o.patchKeys) ? o.patchKeys : [], c = e.getOpsStatusShadowState(s);
      if (!c) return {};
      if (c.flushPromise) return c.flushPromise;
      const l = (async () => {
        const u = k(c.pendingPatch) ? c.pendingPatch : {};
        if (!Object.keys(u).length) return await e.getOpsStatusFromStores(a);
        c.pendingPatch = {};
        try {
          const d = H(), f = new Date(d).toISOString();
          if (!await e.ensureSysStatusTable(s))
            return Fe("ops_status.db_unavailable", /* @__PURE__ */ new Error("sys_status table unavailable"), { patchKeys: i }), c.pendingPatch = Xe(u, c.pendingPatch), await e.getOpsStatusFromStores(a);
          const m = await e.getOpsStatusPayloadFromDb(s, e.getOpsStatusDbScope()), p = Xe(m && typeof m == "object" ? m : {}, u);
          return p.updatedAt = f, await e.putOpsStatusPayloadToDb(s, e.getOpsStatusDbScope(), p, d), Xe(p, e.getOpsStatusShadowPatch(s));
        } catch (d) {
          throw c.pendingPatch = Xe(u, c.pendingPatch), d;
        }
      })().finally(() => {
        c.flushPromise === l && (c.flushPromise = null);
      });
      return c.flushPromise = l, l;
    },
    async ensureSysStatusTable(a) {
      if (!a || typeof a.prepare != "function") return !1;
      if (e.isD1SchemaReadyCached(a, "sysStatusTable")) return !0;
      let o = J.OpsStatusDbReady.get(a);
      o || (o = (async () => {
        try {
          return await a.prepare(`CREATE TABLE IF NOT EXISTS ${e.SYS_STATUS_TABLE} (scope TEXT PRIMARY KEY, payload TEXT NOT NULL, updated_at INTEGER NOT NULL)`).run(), e.markD1SchemaReady(a, "sysStatusTable"), !0;
        } catch (s) {
          return console.warn("sys_status init failed", s), !1;
        }
      })(), J.OpsStatusDbReady.set(a, o));
      try {
        return await o;
      } finally {
        J.OpsStatusDbReady.get(a) === o && J.OpsStatusDbReady.delete(a);
      }
    },
    async ensureAuthFailuresTable(a) {
      if (!a || typeof a.prepare != "function") return !1;
      if (e.isD1SchemaReadyCached(a, "authFailuresTable")) return !0;
      let o = J.AuthFailuresDbReady.get(a);
      o || (o = (async () => {
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
      })(), J.AuthFailuresDbReady.set(a, o));
      try {
        return await o;
      } finally {
        J.AuthFailuresDbReady.get(a) === o && J.AuthFailuresDbReady.delete(a);
      }
    },
    async getAuthFailureEntry(a, o = "") {
      const s = String(o || "").trim();
      if (!s || !a || !await e.ensureAuthFailuresTable(a)) return null;
      try {
        const i = await a.prepare(`SELECT ip, fail_count, expires_at, updated_at
              FROM ${e.AUTH_FAILURES_TABLE}
              WHERE ip = ?
              LIMIT 1`).bind(s).first();
        if (!i) return null;
        const c = Number(i?.expires_at ?? i?.expiresAt) || 0;
        return c > 0 && c <= H() ? (await e.deleteAuthFailureEntry(a, s).catch(() => !1), null) : {
          ip: s,
          failCount: Math.max(0, Number(i?.fail_count ?? i?.failCount) || 0),
          expiresAt: c,
          updatedAt: Number(i?.updated_at ?? i?.updatedAt) || 0
        };
      } catch (i) {
        return Fe("auth_failures.read_failed", i, { ip: s }), null;
      }
    },
    async upsertAuthFailureEntry(a, o = "", s = {}) {
      const i = String(o || "").trim();
      if (!i || !a || !await e.ensureAuthFailuresTable(a)) return null;
      const c = Math.max(0, Number(s?.failCount) || 0), l = Math.max(0, Number(s?.expiresAt) || 0), u = Math.max(0, Number(s?.updatedAt) || H());
      return await a.prepare(`INSERT INTO ${e.AUTH_FAILURES_TABLE} (ip, fail_count, expires_at, updated_at)
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
    async deleteAuthFailureEntry(a, o = "") {
      const s = String(o || "").trim();
      return !s || !a || !await e.ensureAuthFailuresTable(a) ? !1 : (await a.prepare(`DELETE FROM ${e.AUTH_FAILURES_TABLE} WHERE ip = ?`).bind(s).run(), !0);
    }
  };
}
function Sg(n = {}, e = {}) {
  const { CacheManager: r, withAdminShellRuntimeStatus: t } = n;
  return {
    async ensureCfDashboardCacheTable(a) {
      if (!a || typeof a.prepare != "function") return !1;
      if (e.isD1SchemaReadyCached(a, "cfDashboardCacheTable")) return !0;
      let o = J.CfDashboardCacheDbReady.get(a);
      o || (o = (async () => {
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
      })(), J.CfDashboardCacheDbReady.set(a, o));
      try {
        return await o;
      } finally {
        J.CfDashboardCacheDbReady.get(a) === o && J.CfDashboardCacheDbReady.delete(a);
      }
    },
    async getCfDashboardCacheEntry(a, o = "", s = {}) {
      const i = String(o || "").trim();
      if (!i || !a || !await e.ensureCfDashboardCacheTable(a)) return null;
      const c = Math.max(0, Number(s.nowMs) || H()), l = s.includeExpired === !0, u = l ? `SELECT cache_key, zone_id, bucket_date, payload, version, cached_at, expires_at, updated_at
                FROM ${e.CF_DASH_CACHE_TABLE}
                WHERE cache_key = ?
                LIMIT 1` : `SELECT cache_key, zone_id, bucket_date, payload, version, cached_at, expires_at, updated_at
                FROM ${e.CF_DASH_CACHE_TABLE}
                WHERE cache_key = ? AND expires_at > ?
                LIMIT 1`;
      try {
        let d = a.prepare(u).bind(i);
        l || (d = a.prepare(u).bind(i, c));
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
          payload: eo(m),
          version: Number(f?.version) || 0,
          cachedAt: Number(f?.cached_at ?? f?.cachedAt) || 0,
          expiresAt: Number(f?.expires_at ?? f?.expiresAt) || 0,
          updatedAt: Number(f?.updated_at ?? f?.updatedAt) || 0
        };
      } catch (d) {
        return Fe("cf_dashboard_cache.read_failed", d, { cacheKey: i }), null;
      }
    },
    async putCfDashboardCacheEntry(a, o = {}) {
      if (!a || !await e.ensureCfDashboardCacheTable(a)) return null;
      const s = String(o?.cacheKey || "").trim();
      if (!s) return null;
      const i = String(o?.zoneId || "").trim() || "default", c = String(o?.bucketDate || "").trim() || "current", l = Math.max(0, Number(o?.version) || 0), u = Math.max(0, Number(o?.cachedAt) || H()), d = Math.max(u, Number(o?.expiresAt) || u), f = Math.max(u, Number(o?.updatedAt) || u), m = JSON.stringify(eo(o?.payload || {}));
      return ve(m) > Gt ? null : (await a.prepare(`INSERT INTO ${e.CF_DASH_CACHE_TABLE} (
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
      });
    },
    async deleteCfDashboardCacheEntry(a, o = "") {
      const s = String(o || "").trim();
      if (!s || !a || !await e.ensureCfDashboardCacheTable(a)) return !1;
      try {
        return await a.prepare(`DELETE FROM ${e.CF_DASH_CACHE_TABLE} WHERE cache_key = ?`).bind(s).run(), !0;
      } catch (i) {
        return Fe("cf_dashboard_cache.delete_failed", i, { cacheKey: s }), !1;
      }
    },
    async invalidateDashboardSnapshotCacheForConfigChange(a, o = {}) {
      const s = o?.db || e.getDB(a);
      if (!s) return 0;
      const i = Math.max(0, Number(o.nowMs) || H()), c = /* @__PURE__ */ new Set();
      for (const l of [o?.prevConfig, o?.nextConfig]) {
        if (!l || typeof l != "object") continue;
        const u = oe(l), d = pt(new Date(i), u.scheduleUtcOffsetMinutes);
        c.add(Qn(u.cfZoneId, d.dateKey));
      }
      return c.size ? (await he(Promise.all([...c].map((l) => e.deleteCfDashboardCacheEntry(s, l))), "dashboard.cache_invalidate", { cacheKeys: [...c] }, null), c.size) : 0;
    },
    async ensureCfRuntimeCacheTable(a) {
      if (!a || typeof a.prepare != "function") return !1;
      if (e.isD1SchemaReadyCached(a, "cfRuntimeCacheTable")) return !0;
      let o = J.CfRuntimeCacheDbReady.get(a);
      o || (o = (async () => {
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
      })(), J.CfRuntimeCacheDbReady.set(a, o));
      try {
        return await o;
      } finally {
        J.CfRuntimeCacheDbReady.get(a) === o && J.CfRuntimeCacheDbReady.delete(a);
      }
    },
    async getCfRuntimeCacheEntry(a, o = "", s = {}) {
      const i = String(o || "").trim();
      if (!i || !a || !await e.ensureCfRuntimeCacheTable(a)) return null;
      const c = Math.max(0, Number(s.nowMs) || H()), l = s.includeExpired === !0, u = l ? `SELECT cache_key, cache_group, resource_id, payload, cached_at, expires_at, updated_at
                FROM ${e.CF_RUNTIME_CACHE_TABLE}
                WHERE cache_key = ?
                LIMIT 1` : `SELECT cache_key, cache_group, resource_id, payload, cached_at, expires_at, updated_at
                FROM ${e.CF_RUNTIME_CACHE_TABLE}
                WHERE cache_key = ? AND expires_at > ?
                LIMIT 1`;
      try {
        let d = a.prepare(u).bind(i);
        l || (d = a.prepare(u).bind(i, c));
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
          payload: (k(m), m),
          cachedAt: Number(f?.cached_at ?? f?.cachedAt) || 0,
          expiresAt: Number(f?.expires_at ?? f?.expiresAt) || 0,
          updatedAt: Number(f?.updated_at ?? f?.updatedAt) || 0
        };
      } catch (d) {
        return Fe("cf_runtime_cache.read_failed", d, { cacheKey: i }), null;
      }
    },
    async putCfRuntimeCacheEntry(a, o = {}) {
      if (!a || !await e.ensureCfRuntimeCacheTable(a)) return null;
      const s = String(o?.cacheKey || "").trim();
      if (!s) return null;
      const i = String(o?.cacheGroup || "").trim() || "runtime", c = String(o?.resourceId || "").trim() || "default", l = Math.max(0, Number(o?.cachedAt) || H()), u = Math.max(l, Number(o?.expiresAt) || l), d = Math.max(l, Number(o?.updatedAt) || l), f = JSON.stringify(o?.payload ?? {});
      return ve(f) > Gt ? null : (await a.prepare(`INSERT INTO ${e.CF_RUNTIME_CACHE_TABLE} (
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
      });
    },
    async loadCfRuntimeCachePayload(a, o = {}) {
      const s = String(o.cacheKey || "").trim(), i = String(o.cacheGroup || "").trim() || "runtime", c = String(o.resourceId || "").trim() || "default", l = Math.max(1e3, Number(o.ttlMs) || 3e5), u = Math.max(0, Number(o.nowMs) || H()), d = o.skipCacheRead === !0, f = typeof o.loader == "function" ? o.loader : null;
      if (!s || !f) throw new Error("cf_runtime_cache_loader_missing");
      const m = a ? await e.getCfRuntimeCacheEntry(a, s, {
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
          payload: await $t(ct([
            "cf_runtime",
            i,
            s
          ]), async () => {
            const h = await f();
            return a && await he(e.putCfRuntimeCacheEntry(a, {
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
          source: a ? "live_then_cached" : "live",
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
function _g(n = {}, e = {}) {
  const { CacheManager: r, withAdminShellRuntimeStatus: t } = n;
  return {
    buildCloudflareKvQuotaCard({ planProfile: a = {}, planState: o = {}, usageState: s = {}, namespaceId: i = "", nowTimestamp: c = H() } = {}) {
      const l = Sa(a?.planClass), u = k(s?.payload) ? s.payload : {}, d = String(u.namespaceTitle || a?.resourceMeta?.kv?.namespaceTitle || i || "未命名 Namespace").trim(), f = [
        Tr({
          key: "read",
          label: "读",
          used: u.readCount,
          limit: l.kv.read,
          kind: "count"
        }),
        Tr({
          key: "write",
          label: "写",
          used: u.writeCount,
          limit: l.kv.write,
          kind: "count"
        }),
        Tr({
          key: "storage",
          label: "容量",
          used: u.storageBytes,
          limit: l.kv.storageBytes,
          kind: "bytes"
        })
      ], m = [];
      o?.stale === !0 && m.push("计划信息"), s?.stale === !0 && m.push("实时指标");
      const p = [];
      m.length > 0 && p.push(`${m.join("、")} 使用 stale cache`), p.push(`delete：${Se(u.deleteCount)} / ${Se(l.kv.delete)}`), p.push(`list：${Se(u.listCount)} / ${Se(l.kv.list)}`), p.push(`命名空间：${d}`);
      const g = ms(s?.cachedAt, c);
      g && p.push(g), p.push(l.planClass === "paid" ? "容量条按 1 GB included quota 展示，PAID 下这是 included quota，不是硬停止线" : "容量条按 1 GB included quota 展示");
      const h = ps(f);
      return h.length > 0 && p.push(`超额项目：${h.join("、")}（进度条按 100% 封顶）`), s?.error && p.push(`Cloudflare 详情：${kt(s.error)}`), Ya({
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
    buildCloudflareD1QuotaCard({ planProfile: a = {}, planState: o = {}, usageState: s = {}, databaseId: i = "", nowTimestamp: c = H() } = {}) {
      const l = Sa(a?.planClass), u = k(s?.payload) ? s.payload : {}, d = String(u.databaseName || a?.resourceMeta?.d1?.databaseName || i || "未命名数据库").trim(), f = [
        Tr({
          key: "rowsRead",
          label: "读",
          used: u.rowsRead,
          limit: l.d1.rowsRead,
          kind: "count"
        }),
        Tr({
          key: "rowsWritten",
          label: "写",
          used: u.rowsWritten,
          limit: l.d1.rowsWritten,
          kind: "count"
        }),
        Tr({
          key: "storage",
          label: "容量",
          used: u.fileSizeBytes,
          limit: l.d1.storageBytes,
          kind: "bytes"
        })
      ], m = [];
      o?.stale === !0 && m.push("计划信息"), s?.stale === !0 && m.push("实时指标");
      const p = [];
      m.length > 0 && p.push(`${m.join("、")} 使用 stale cache`), p.push(`SQL 次数：读 ${Se(u.readQueries)} / 写 ${Se(u.writeQueries)}`), p.push(`数据库：${d}`);
      const g = ms(s?.cachedAt, c);
      g && p.push(g), p.push(`容量条按单库硬上限 ${Xa(l.d1.storageBytes)} 展示`);
      const h = ps(f);
      return h.length > 0 && p.push(`超额项目：${h.join("、")}（进度条按 100% 封顶）`), s?.error && p.push(`Cloudflare 详情：${kt(s.error)}`), Ya({
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
    async buildDashboardD1WriteHotspotPayload(a, o = {}) {
      const s = oe(o?.config || await fe(a)), i = Math.max(0, Number(o?.nowMs) || H()), c = ze(s.scheduleUtcOffsetMinutes), l = String(s.cfAccountId || "").trim(), u = String(s.cfApiToken || "").trim(), d = String(s.cfD1DatabaseId || "").trim(), f = {
        utcOffsetMinutes: c,
        nowMs: i,
        source: "cloudflare_d1_analytics"
      };
      if (!l || !u || !d) return en({
        ...f,
        status: "unconfigured",
        summary: "D1 写入热点尚未启用",
        detail: "请先在账号设置中填写 Cloudflare 账号 ID、API 令牌与 D1 Database ID。"
      });
      const m = pt(new Date(i), c).startTs - 8640 * 60 * 1e3, p = await hf({
        accountId: l,
        apiToken: u,
        databaseId: d,
        startIso: new Date(m).toISOString(),
        endIso: new Date(i).toISOString(),
        utcOffsetMinutes: c
      }), g = new Map(p.map((T) => [`${T.dateKey}:${T.hour}`, T])), h = wc(), y = [];
      let _ = 0, S = 0, A = 0, b = null;
      for (const T of p)
        _ += Math.max(0, Number(T?.rowsWritten) || 0), S += Math.max(0, Number(T?.writeQueries) || 0), (Number(T?.rowsWritten) || 0) > A && (A = Math.max(0, Number(T?.rowsWritten) || 0), b = T);
      for (let T = 0; T < 7; T += 1) {
        const L = Dt(m + T * 24 * 60 * 60 * 1e3, c).dateKey;
        y.push({
          key: L,
          dateKey: L,
          label: Zn(L),
          cells: Array.from({ length: 24 }, (D, E) => {
            const w = g.get(`${L}:${E}`) || null, N = Math.max(0, Number(w?.rowsWritten) || 0), O = Math.max(0, Number(w?.writeQueries) || 0), C = A > 0 ? N / A : 0;
            return Lc(L, E, N, O, C);
          })
        });
      }
      const R = b ? `峰值：${Zn(b.dateKey)} ${String(b.hour).padStart(2, "0")}:00 写入 ${Se(b.rowsWritten)} 行 / SQL ${Se(b.writeQueries)} 次` : "";
      return {
        title: "D1 写入热点图",
        status: "success",
        source: "cloudflare_d1_analytics",
        summary: _ > 0 ? `最近 7 天累计写入 ${Se(_)} 行` : "最近 7 天未检测到 D1 写入",
        detail: _ > 0 ? "热点强度按 rowsWritten 计算；悬停单元格可查看对应小时的 SQL 写次数。" : "Cloudflare D1 Analytics 当前窗口内没有返回 rowsWritten 数据。",
        periodLabel: `最近 7 天 · ${ho(c)}`,
        hourLabels: h,
        rows: y,
        available: _ > 0,
        totalRowsWritten: _,
        totalWriteQueries: S,
        peakLabel: R,
        legendMaxLabel: Se(A)
      };
    },
    async buildDashboardMonthlyTrafficPayload(a, o = {}) {
      const s = oe(o?.config || await fe(a)), i = Math.max(0, Number(o.nowMs) || H()), c = o?.monthWindow || Ns(new Date(i), s.scheduleUtcOffsetMinutes), l = String(s.cfZoneId || "").trim(), u = String(s.cfApiToken || "").trim(), d = {
        period: "month",
        periodKey: c.monthKey,
        periodLabel: c.periodLabel,
        generatedAt: new Date(i).toISOString(),
        cacheStatus: "live"
      };
      if (!l || !u) return Xt({
        ...d,
        traffic: "未配置",
        cfAnalyticsLoaded: !1,
        cfAnalyticsStatus: "未配置 Cloudflare",
        cfAnalyticsError: "请在账号设置中填写并保存 Cloudflare Zone ID 与 API 令牌",
        trafficSourceText: "本月视频流量：未配置 Cloudflare，无法获取 CF Zone 总流量"
      });
      const f = (_, S) => `
            query {
              viewer {
                zones(filter: { zoneTag: ${be(l)} }) {
                  series: httpRequestsAdaptiveGroups(limit: 10000, filter: { datetime_geq: ${be(new Date(_).toISOString())}, datetime_leq: ${be(new Date(S).toISOString())} }) {
                    sum { edgeResponseBytes }
                  }
                }
              }
            }`, m = async (_, S) => {
        const A = await sc(l, u, f(_, S));
        if (!A) throw new Error("cf_graphql_empty_zone");
        return (Array.isArray(A.series) ? A.series : []).reduce((b, R) => b + Math.max(0, Number(R?.sum?.edgeResponseBytes) || 0), 0);
      }, p = 1440 * 60 * 1e3, g = [];
      for (let _ = c.startTs; _ <= c.endTs; _ += p) g.push({
        startTs: _,
        endTs: Math.min(c.endTs, _ + p - 1)
      });
      let h = 0;
      const y = 4;
      for (let _ = 0; _ < g.length; _ += y) {
        const S = await Promise.all(g.slice(_, _ + y).map(({ startTs: A, endTs: b }) => m(A, b)));
        h += S.reduce((A, b) => A + b, 0);
      }
      return Xt({
        ...d,
        traffic: Xa(h),
        totalBytes: h,
        cfAnalyticsLoaded: !0,
        cfAnalyticsStatus: "Cloudflare 统计正常",
        cfAnalyticsError: "",
        cfAnalyticsDetail: "",
        trafficSourceText: `${c.periodLabel}视频流量：CF Zone 总流量（edgeResponseBytes）`
      });
    },
    async getDashboardMonthlyTrafficPayload(a, o = {}) {
      const s = oe(o?.config || await fe(a)), i = o?.ctx || null, c = o?.forceRefresh === !0, l = Math.max(0, Number(o.nowMs) || H()), u = o?.monthWindow || Ns(new Date(l), s.scheduleUtcOffsetMinutes), d = String(s.cfZoneId || "").trim();
      if (!d || !String(s.cfApiToken || "").trim()) return await e.buildDashboardMonthlyTrafficPayload(a, {
        config: s,
        monthWindow: u,
        nowMs: l
      });
      const f = Um(d, u.monthKey, s.scheduleUtcOffsetMinutes), m = km(f), p = ur();
      let g = null;
      const h = ne.DashboardMonthlyTrafficCache.get(f);
      if (h?.staleUntil > l) {
        if (Ue(ne.DashboardMonthlyTrafficCache, f, h, 64), g = h, !c && h.expiresAt > l) return Xt({
          ...h.payload,
          cacheStatus: "cache"
        });
      } else h && ne.DashboardMonthlyTrafficCache.delete(f);
      if (p && m) try {
        const y = await p.match(m);
        if (y) {
          const _ = await Pe(y, nn), S = _.exceeded ? null : JSON.parse(_.text || "null");
          if (Number(S?.version) === 1 && String(S?.cacheKey || "") === f && Number(S?.staleUntil) > l && (g = {
            payload: Xt(S.payload),
            cachedAt: Number(S.cachedAt) || 0,
            expiresAt: Number(S.expiresAt) || 0,
            staleUntil: Number(S.staleUntil) || 0
          }, Ue(ne.DashboardMonthlyTrafficCache, f, g, 64), !c && g.expiresAt > l))
            return Xt({
              ...g.payload,
              cacheStatus: "cache"
            });
        }
      } catch (y) {
        Fe("dashboard.monthly_traffic_cache_read_failed", y, { cacheKey: f });
      }
      try {
        return await $t(ct([
          "dashboard_monthly_traffic",
          f,
          c ? "force" : "default"
        ]), async () => {
          const y = await e.buildDashboardMonthlyTrafficPayload(a, {
            config: s,
            monthWindow: u,
            nowMs: l
          }), _ = l, S = _ + Fm, A = _ + Ls, b = {
            version: 1,
            cacheKey: f,
            cachedAt: _,
            expiresAt: S,
            staleUntil: A,
            payload: y
          };
          if (Ue(ne.DashboardMonthlyTrafficCache, f, {
            payload: y,
            cachedAt: _,
            expiresAt: S,
            staleUntil: A
          }, 64), p && m) {
            const R = p.put(m, new Response(JSON.stringify(b), { headers: {
              "Content-Type": "application/json; charset=utf-8",
              "Cache-Control": `public, max-age=${Math.floor(Ls / 1e3)}`
            } }));
            i ? i.waitUntil(he(R, "dashboard.monthly_traffic_cache_write", { cacheKey: f }, null)) : await he(R, "dashboard.monthly_traffic_cache_write", { cacheKey: f }, null);
          }
          return y;
        });
      } catch (y) {
        if (g?.payload && g.staleUntil > l) return Xt({
          ...g.payload,
          cacheStatus: "stale",
          warning: Dc(y, "monthly_traffic_refresh_failed")
        });
        const _ = Ji(y?.message || y, { zoneId: d });
        return Xt({
          periodKey: u.monthKey,
          periodLabel: u.periodLabel,
          traffic: "CF 查询失败",
          cfAnalyticsLoaded: !1,
          cfAnalyticsStatus: _.status,
          cfAnalyticsError: _.hint,
          cfAnalyticsDetail: _.detail,
          trafficSourceText: `${u.periodLabel}视频流量：CF Zone 总流量（edgeResponseBytes）`,
          generatedAt: new Date(l).toISOString(),
          cacheStatus: "live"
        });
      }
    }
  };
}
function bg(n = {}, e = {}) {
  const { CacheManager: r, withAdminShellRuntimeStatus: t } = n;
  return {
    async buildDashboardStatsPayload(a, o = {}) {
      const s = o?.ctx || null, i = o?.kv || e.getKV(a), c = o?.db || e.getDB(a), l = oe(o?.config || await fe(a)), u = Math.max(0, Number(o.nowMs) || H()), d = o?.dayWindow || pt(new Date(u), l.scheduleUtcOffsetMinutes), f = o?.skipD1WriteHotspot !== !1, m = f ? null : e.buildDashboardD1WriteHotspotPayload(a, {
        config: l,
        nowMs: u
      });
      let p = null, g = "未配置", h = 0, y = !1, _ = !1, S = "", A = "", b = "", R = "pending", T = "等待数据加载", L = "视频流量口径：CF Zone 总流量", D = new Date(u).toISOString(), E = Array.from({ length: 24 }, (U, G) => ({
        label: String(G).padStart(2, "0") + ":00",
        total: 0
      })), w = 0, N = 0, O = "", C = en({
        utcOffsetMinutes: l.scheduleUtcOffsetMinutes,
        nowMs: u
      });
      h = (await r.getNodesListStrict(a, s)).length || 0;
      const v = d.dateKey, B = d.startTs, P = d.endTs, I = String(l.cfZoneId || "").trim(), M = String(l.cfApiToken || "").trim();
      if (I && M) {
        const U = new Date(B).toISOString(), G = new Date(P).toISOString(), K = `
                query {
                  viewer {
                    zones(filter: { zoneTag: ${be(I)} }) {
                      series: httpRequestsAdaptiveGroups(limit: 10000, filter: { datetime_geq: ${be(U)}, datetime_leq: ${be(G)} }) {
                        count
                        dimensions { datetimeHour }
                        sum { edgeResponseBytes }
                      }
                    }
                  }
                }`;
        try {
          const $ = await cc(I, M, {
            scope: "dashboard.stats.zone_lookup",
            context: { feature: "dashboard_stats" }
          });
          O = String($?.name || "").trim();
          const V = await sc(I, M, K);
          if (V) {
            let se = 0, pe = 0, me = Array.from({ length: 24 }, (le, ye) => ({
              label: String(ye).padStart(2, "0") + ":00",
              total: 0
            }));
            (Array.isArray(V.series) ? [...V.series].sort((le, ye) => String(le?.dimensions?.datetimeHour || "").localeCompare(String(ye?.dimensions?.datetimeHour || ""))) : []).forEach((le) => {
              const ye = Number(le.count) || 0, xe = Number(le.sum?.edgeResponseBytes) || 0;
              se += ye, pe += xe;
              const Ge = le?.dimensions?.datetimeHour;
              if (Ge && !Number.isNaN(new Date(Ge).getTime())) {
                const at = Dt(new Date(Ge), l.scheduleUtcOffsetMinutes).hour;
                me[at].total += ye;
              }
            }), g = Xa(pe), y = !0, S = "Cloudflare 统计正常", L = "视频流量当前对齐：CF Zone 总流量（edgeResponseBytes）";
            try {
              const le = await yf({
                cfAccountId: String(l.cfAccountId || "").trim(),
                cfZoneId: I,
                cfApiToken: M,
                startIso: U,
                endIso: G,
                utcOffsetMinutes: l.scheduleUtcOffsetMinutes
              });
              le && Number.isFinite(le.totalRequests) && (p = le.totalRequests, E = le.hourlySeries, _ = !0, R = "workers_usage", T = "今日请求量口径：Cloudflare Workers Usage", S = "Cloudflare 统计正常");
            } catch (le) {
              console.log("CF workers usage fetch failed", le);
            }
            _ || (p = se, E = me, _ = !0, R = "zone_analytics", T = "今日请求量当前对齐：Cloudflare Zone Analytics");
          } else
            S = "Zone 未命中", A = "GraphQL 返回空；请检查 Zone ID 或权限", g = "CF 无统计数据";
        } catch ($) {
          const V = Ji($?.message || $, { zoneId: I });
          S = V.status, A = V.hint, b = V.detail, g = "CF 查询失败";
        }
      } else
        S = "未配置 Cloudflare", A = "请在账号设置中填写并保存 Cloudflare Zone ID 与 API 令牌", L = "视频流量当前对齐：未配置 Cloudflare，无法获取 CF Zone 总流量";
      if (c) try {
        await e.ensureStatsHourlyWindowAligned({
          db: c,
          kv: i
        }, {
          config: l,
          now: d.now
        });
        const U = await e.resolveLogsReadiness({
          db: c,
          kv: i
        }), G = U.statsReady === !0 ? await e.getDailyStatsHourly(c, v) : [];
        if (w = G.reduce((K, $) => K + (Number($?.play_count || $?.playCount) || 0), 0), N = G.reduce((K, $) => K + (Number($?.playback_info_count || $?.playbackInfoCount) || 0), 0), !_ && U.statsReady === !0) {
          p = G.reduce((K, $) => K + (Number($?.request_count || $?.requestCount) || 0), 0), E = Array.from({ length: 24 }, (K, $) => ({
            label: String($).padStart(2, "0") + ":00",
            total: 0
          }));
          for (const K of G) {
            const $ = Number.parseInt(String(K?.bucket_hour ?? K?.bucketHour), 10);
            !Number.isNaN($) && E[$] && (E[$].total += Number(K?.request_count || K?.requestCount) || 0);
          }
          _ = !0, R = "d1_hourly_stats", T = "今日请求量当前对齐：本地 D1 预聚合";
        }
      } catch (U) {
        console.log("DB aggregated stats read failed:", U);
      }
      if (_ || (p = null, !I || !M ? (R = "unconfigured", T = c ? "今日请求量暂不可用：未配置 Cloudflare 联动，且本地 D1 日志未初始化或不可读" : "今日请求量未配置：未绑定 D1，且未配置 Cloudflare 联动") : (R = "pending", T = c ? "今日请求量暂不可用：Cloudflare 请求数查询失败，且本地 D1 日志未初始化或不可读" : "今日请求量暂不可用：Cloudflare 请求数查询失败，且未绑定 D1")), !f) try {
        C = await m;
      } catch (U) {
        console.log("D1 write hotspot read failed:", U), C = en({
          utcOffsetMinutes: l.scheduleUtcOffsetMinutes,
          nowMs: u,
          status: "failed",
          source: "cloudflare_d1_analytics",
          summary: "D1 写入热点暂不可用",
          detail: kt(U, "d1_write_hotspot_failed")
        });
      }
      const x = p == null ? R === "unconfigured" ? "未配置" : "暂不可用" : String(Number(p) || 0);
      return Uo({
        todayRequests: p,
        requestCountDisplay: x,
        todayTraffic: g,
        hourlySeries: E,
        requestSource: R,
        requestSourceText: T,
        trafficSourceText: L,
        generatedAt: D,
        zoneName: O,
        cfAnalyticsLoaded: y,
        cfAnalyticsStatus: S,
        cfAnalyticsError: A,
        cfAnalyticsDetail: b,
        playCount: w,
        infoCount: N,
        nodeCount: h,
        cacheStatus: "live",
        d1WriteHotspot: C
      });
    },
    async buildDashboardRuntimeStatusPayload(a, o = {}) {
      const s = o?.db || e.getDB(a), i = o?.kv || e.getKV(a), c = oe(o?.config || await fe(a)), l = o?.forceRefresh === !0, u = await e.getOpsStatus({
        kv: i,
        db: s
      });
      let d = {
        kv: Ar("KV", "Cloudflare 配额尚未加载", "等待运行状态接口返回 Cloudflare 配额数据。"),
        d1: Ar("D1", "Cloudflare 配额尚未加载", "等待运行状态接口返回 Cloudflare 配额数据。")
      };
      try {
        d = await e.getCloudflareRuntimeQuotaStatus(a, {
          config: c,
          db: s,
          forceRefresh: l
        });
      } catch (f) {
        const m = kt(f, "runtime_config_read_failed");
        d = {
          kv: Cr("KV", "Cloudflare 配额读取失败", m),
          d1: Cr("D1", "Cloudflare 配额读取失败", m)
        };
      }
      return {
        ...u && typeof u == "object" ? u : {},
        cloudflare: d
      };
    },
    async getRuntimeStatusPayload(a, o = {}) {
      const s = o?.db || e.getDB(a), i = o?.kv || e.getKV(a), c = oe(o?.config || await fe(a)), l = Ke(a), u = o?.forceRefresh === !0, d = Math.max(0, Number(o.nowMs) || H()), f = await $t(ct(["runtime_status", u ? "force" : "default"]), async () => e.buildDashboardRuntimeStatusPayload(a, {
        kv: i,
        db: s,
        config: c,
        forceRefresh: u
      }));
      return {
        status: t(f, a, c, l),
        cacheMeta: Ho({
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
    async getDashboardSnapshotPayload(a, o = {}) {
      const s = o?.db || e.getDB(a), i = o?.kv || e.getKV(a), c = o?.ctx || null, l = oe(o?.config || await fe(a)), u = o?.forceRefresh === !0, d = Math.max(0, Number(o.nowMs) || H()), f = o?.dayWindow || pt(new Date(d), l.scheduleUtcOffsetMinutes), m = String(l.cfZoneId || "").trim(), p = Qn(m, f.dateKey), g = s ? await e.getCfDashboardCacheEntry(s, p, {
        nowMs: d,
        includeExpired: !0
      }) : null;
      if (!u && s) {
        const y = g && g.expiresAt > d ? g : null;
        if (y && y.version === 8) return ta(y.payload, "cache", {
          cachedAt: y.cachedAt,
          expiresAt: y.expiresAt,
          updatedAt: y.updatedAt,
          generatedAt: y.payload?.cacheMeta?.generatedAt || y.payload?.stats?.generatedAt || new Date(y.cachedAt || d).toISOString(),
          warning: ""
        });
      }
      const h = g;
      try {
        const y = await $t(ct([
          "dashboard_snapshot",
          p,
          u ? "force" : "default"
        ]), async () => {
          const [_, S] = await Promise.all([e.buildDashboardStatsPayload(a, {
            ctx: c,
            kv: i,
            db: s,
            config: l,
            dayWindow: f,
            nowMs: d
          }), e.buildDashboardRuntimeStatusPayload(a, {
            kv: i,
            db: s,
            config: l,
            forceRefresh: u
          })]), A = ta({
            stats: _,
            runtimeStatus: S,
            cacheMeta: { generatedAt: _.generatedAt }
          }, "live", {
            cachedAt: d,
            expiresAt: d + 3600 * 1e3,
            updatedAt: d,
            generatedAt: _.generatedAt,
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
            c ? c.waitUntil(he(b, "dashboard.cache_write", { cacheKey: p }, null)) : await he(b, "dashboard.cache_write", { cacheKey: p }, null);
          }
          return A;
        });
        return ta(y, "live", {
          cachedAt: d,
          expiresAt: d + 3600 * 1e3,
          updatedAt: d,
          generatedAt: y?.stats?.generatedAt || ""
        });
      } catch (y) {
        if (h && h.version === 8) return ta(h.payload, "stale", {
          cachedAt: h.cachedAt,
          expiresAt: h.expiresAt,
          updatedAt: h.updatedAt,
          generatedAt: h.payload?.cacheMeta?.generatedAt || h.payload?.stats?.generatedAt || new Date(h.cachedAt || d).toISOString(),
          warning: Dc(y),
          partial: !0
        });
        throw y;
      }
    },
    async getDashboardCachedSnapshotPayload(a, o = {}) {
      const s = o?.db || e.getDB(a);
      if (!s) return null;
      const i = oe(o?.config || await fe(a)), c = Math.max(0, Number(o.nowMs) || H()), l = pt(new Date(c), i.scheduleUtcOffsetMinutes), u = Qn(String(i.cfZoneId || "").trim(), l.dateKey), d = await e.getCfDashboardCacheEntry(s, u, {
        nowMs: c,
        includeExpired: !0
      });
      return !d || d.version !== 8 ? null : ta(d.payload, d.expiresAt > c ? "cache" : "stale", {
        cachedAt: d.cachedAt,
        expiresAt: d.expiresAt,
        updatedAt: d.updatedAt,
        generatedAt: d.payload?.cacheMeta?.generatedAt || d.payload?.stats?.generatedAt || "",
        warning: d.expiresAt > c ? "" : "dashboard_cache_expired",
        partial: d.expiresAt <= c
      });
    },
    async getCloudflareRuntimeQuotaStatus(a, o = {}) {
      const s = o?.db || e.getDB(a), i = oe(o?.config || {}), c = o?.forceRefresh === !0, l = String(i.cfAccountId || "").trim(), u = String(i.cfApiToken || "").trim(), d = String(i.cfKvNamespaceId || "").trim(), f = String(i.cfD1DatabaseId || "").trim();
      if (!l || !u) return {
        kv: Ar("KV", "未配置 Cloudflare 账号联动", "请先在账号设置中填写 Cloudflare 账号 ID 与 API 令牌。"),
        d1: Ar("D1", "未配置 Cloudflare 账号联动", "请先在账号设置中填写 Cloudflare 账号 ID 与 API 令牌。")
      };
      const m = H(), p = ue(i.cfQuotaPlanCacheMinutes, F.Defaults.CfQuotaPlanCacheMinutes, 1, 1440), g = p * 60 * 1e3;
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
            const R = nc(await lc(l, u)), [T, L] = await Promise.all([d ? he(mf(l, d, u), "cf_runtime.plan_profile.kv_details", {
              accountId: l,
              namespaceId: d
            }, null) : null, f ? he(hs(l, f, u), "cf_runtime.plan_profile.d1_details", {
              accountId: l,
              databaseId: f
            }, null) : null]);
            return {
              planClass: R.planClass,
              planLabel: R.planLabel,
              periodLabel: R.periodLabel,
              usageModel: R.usageModel,
              resourceMeta: {
                kv: { namespaceTitle: String(T?.title || "").trim() },
                d1: { databaseName: String(L?.name || "").trim() }
              }
            };
          }
        });
      } catch (R) {
        const T = kt(R);
        return {
          kv: Cr("KV", "Cloudflare 计划信息读取失败", T),
          d1: Cr("D1", "Cloudflare 计划信息读取失败", T)
        };
      }
      const y = k(h?.payload) ? h.payload : {}, _ = {
        ...qn({
          usageModel: y.usageModel || y.planClass,
          override: i.cfQuotaPlanOverride
        }),
        resourceMeta: {
          kv: { namespaceTitle: String(y?.resourceMeta?.kv?.namespaceTitle || "").trim() },
          d1: { databaseName: String(y?.resourceMeta?.d1?.databaseName || "").trim() }
        }
      }, S = lf(_.planClass), [A, b] = await Promise.all([(async () => {
        if (!d) return Ar("KV", "未配置 KV Namespace", "请在账号设置中填写 Cloudflare KV Namespace ID。");
        try {
          const R = await e.loadCfRuntimeCachePayload(s, {
            cacheKey: `usage_metrics:kv:${l}:${d}:${S.cacheBucketKey}`,
            cacheGroup: "usage_metrics",
            resourceId: `kv:${d}`,
            ttlMs: g,
            nowMs: m,
            skipCacheRead: c,
            loader: async () => ({
              ...await pf({
                accountId: l,
                apiToken: u,
                namespaceId: d,
                startIso: S.startIso,
                endIso: S.endIso
              }),
              namespaceTitle: String(_?.resourceMeta?.kv?.namespaceTitle || d).trim()
            })
          });
          return e.buildCloudflareKvQuotaCard({
            planProfile: _,
            planState: h,
            usageState: R,
            namespaceId: d,
            nowTimestamp: m
          });
        } catch (R) {
          return Cr("KV", "KV 指标读取失败", kt(R));
        }
      })(), (async () => {
        if (!f) return Ar("D1", "未配置 D1 数据库", "请在账号设置中填写 Cloudflare D1 Database ID。");
        try {
          const R = await e.loadCfRuntimeCachePayload(s, {
            cacheKey: `usage_metrics:d1:${l}:${f}:${S.cacheBucketKey}`,
            cacheGroup: "usage_metrics",
            resourceId: `d1:${f}`,
            ttlMs: g,
            nowMs: m,
            skipCacheRead: c,
            loader: async () => {
              const [T, L] = await Promise.all([gf({
                accountId: l,
                apiToken: u,
                databaseId: f,
                startIso: S.startIso,
                endIso: S.endIso
              }), hs(l, f, u)]);
              return {
                ...T,
                databaseName: String(L?.name || _?.resourceMeta?.d1?.databaseName || f).trim(),
                fileSizeBytes: Math.max(0, Number(L?.file_size ?? L?.fileSize) || 0)
              };
            }
          });
          return e.buildCloudflareD1QuotaCard({
            planProfile: _,
            planState: h,
            usageState: R,
            databaseId: f,
            nowTimestamp: m
          });
        } catch (R) {
          return Cr("D1", "D1 指标读取失败", kt(R));
        }
      })()]);
      return {
        kv: A,
        d1: b
      };
    }
  };
}
function Eg(n = {}, e = {}) {
  return {
    ...gg(n, e),
    ...hg(n, e),
    ...yg(n, e),
    ...Sg(n, e),
    ..._g(n, e),
    ...bg(n, e)
  };
}
function Rg(n = {}, e = {}) {
  return {
    getKV(r) {
      return La(r);
    },
    getDB(r) {
      return _d(r);
    },
    buildD1CreateTableSql(r, t = r, a = {}) {
      const o = de(t), s = `CREATE TABLE${a.ifNotExists === !0 ? " IF NOT EXISTS" : ""}`, i = {
        [e.D1_SCHEMA_META_TABLE]: `${s} ${o} (scope TEXT PRIMARY KEY, contract_version INTEGER NOT NULL, contract_hash TEXT NOT NULL, schema_fingerprint TEXT NOT NULL, schema_cookie INTEGER NOT NULL, last_plan_hash TEXT NOT NULL, verified_at TEXT NOT NULL, attestation TEXT NOT NULL, migration_owner TEXT, lease_expires_at INTEGER)`,
        [e.SYS_STATUS_TABLE]: `${s} ${o} (scope TEXT PRIMARY KEY, payload TEXT NOT NULL, updated_at INTEGER NOT NULL)`,
        [e.SCHEDULED_LOCKS_TABLE]: `${s} ${o} (scope TEXT PRIMARY KEY, token TEXT NOT NULL, owner TEXT NOT NULL, acquired_at INTEGER NOT NULL, renewed_at INTEGER, expires_at INTEGER NOT NULL)`,
        [e.AUTH_FAILURES_TABLE]: `${s} ${o} (ip TEXT PRIMARY KEY, fail_count INTEGER NOT NULL, expires_at INTEGER NOT NULL, updated_at INTEGER NOT NULL)`,
        [e.CF_DASH_CACHE_TABLE]: `${s} ${o} (cache_key TEXT PRIMARY KEY, zone_id TEXT NOT NULL, bucket_date TEXT NOT NULL, payload TEXT NOT NULL, version INTEGER NOT NULL, cached_at INTEGER NOT NULL, expires_at INTEGER NOT NULL, updated_at INTEGER NOT NULL)`,
        [e.CF_RUNTIME_CACHE_TABLE]: `${s} ${o} (cache_key TEXT PRIMARY KEY, cache_group TEXT NOT NULL, resource_id TEXT NOT NULL, payload TEXT NOT NULL, cached_at INTEGER NOT NULL, expires_at INTEGER NOT NULL, updated_at INTEGER NOT NULL)`,
        [e.DNS_IP_POOL_ITEMS_TABLE]: `${s} ${o} (id TEXT PRIMARY KEY, ip TEXT NOT NULL UNIQUE, ip_type TEXT NOT NULL, source_kind TEXT NOT NULL, source_label TEXT, line_label TEXT NOT NULL DEFAULT '', remark TEXT, created_at TEXT NOT NULL, updated_at TEXT NOT NULL)`,
        [e.DNS_IP_POOL_SOURCES_TABLE]: `${s} ${o} (id TEXT PRIMARY KEY, name TEXT NOT NULL, url TEXT NOT NULL, source_type TEXT NOT NULL DEFAULT 'url', domain TEXT, source_kind TEXT NOT NULL DEFAULT 'custom', preset_id TEXT NOT NULL DEFAULT '', builtin_id TEXT NOT NULL DEFAULT '', enabled INTEGER NOT NULL DEFAULT 1, sort_order INTEGER NOT NULL DEFAULT 0, ip_limit INTEGER NOT NULL DEFAULT 5, last_fetch_at TEXT, last_fetch_status TEXT, last_fetch_count INTEGER NOT NULL DEFAULT 0, created_at TEXT NOT NULL, updated_at TEXT NOT NULL)`,
        [e.DNS_IP_POOL_FETCH_CACHE_TABLE]: `${s} ${o} (signature TEXT PRIMARY KEY, items_json TEXT NOT NULL, source_results_json TEXT NOT NULL, imported_count INTEGER NOT NULL DEFAULT 0, enabled_source_count INTEGER NOT NULL DEFAULT 0, cached_at INTEGER NOT NULL, expires_at INTEGER NOT NULL, created_at TEXT NOT NULL, updated_at TEXT NOT NULL)`,
        [e.DNS_IP_PROBE_CACHE_TABLE]: `${s} ${o} (ip TEXT NOT NULL, entry_colo TEXT NOT NULL, probe_status TEXT NOT NULL, latency_ms INTEGER, cf_ray TEXT, colo_code TEXT, city_name TEXT, country_code TEXT, country_name TEXT, probed_at TEXT NOT NULL, expires_at INTEGER NOT NULL, PRIMARY KEY (ip, entry_colo))`,
        [e.LOGS_TABLE]: `${s} ${o} (id INTEGER PRIMARY KEY AUTOINCREMENT, timestamp INTEGER NOT NULL, node_name TEXT NOT NULL, request_path TEXT NOT NULL, request_method TEXT NOT NULL, status_code INTEGER NOT NULL, response_time INTEGER NOT NULL, client_ip TEXT NOT NULL, inbound_colo TEXT, outbound_colo TEXT, user_agent TEXT, referer TEXT, category TEXT DEFAULT 'api', error_detail TEXT, detail_json TEXT, created_at TEXT NOT NULL, inbound_ip TEXT, outbound_ip TEXT)`,
        [e.STATS_HOURLY_TABLE]: `${s} ${o} (bucket_date TEXT NOT NULL, bucket_hour INTEGER NOT NULL, request_count INTEGER NOT NULL DEFAULT 0, play_count INTEGER NOT NULL DEFAULT 0, playback_info_count INTEGER NOT NULL DEFAULT 0, updated_at TEXT NOT NULL, PRIMARY KEY (bucket_date, bucket_hour))`
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
      return ie(ee({
        version: ot,
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
      return 0;
    },
    buildD1SchemaAttestationPayload(r = {}) {
      return ee({
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
      return a ? await ft(a, e.buildD1SchemaAttestationPayload(t)) : "";
    },
    async readD1SchemaMeta(r) {
      try {
        return await r.prepare(`SELECT scope, contract_version, contract_hash, schema_fingerprint, schema_cookie, last_plan_hash, verified_at, attestation, migration_owner, lease_expires_at FROM ${de(e.D1_SCHEMA_META_TABLE)} WHERE scope = 'main' LIMIT 1`).first();
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
      const o = Math.max(0, Number(a.contract_version) || 0);
      if (o > ot) return {
        valid: !1,
        blocked: !0,
        reason: "schema_version_ahead",
        meta: a
      };
      if (o !== ot) return {
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
      const i = await e.getD1SchemaFingerprint(r);
      if (String(a.schema_fingerprint || "") !== i) return {
        valid: !1,
        reason: "schema_fingerprint_changed",
        meta: a,
        schemaCookie: s,
        schemaFingerprint: i
      };
      const c = await e.signD1SchemaAttestation(t, a);
      return !c || c !== String(a.attestation || "") ? {
        valid: !1,
        reason: "invalid_attestation",
        meta: a,
        schemaCookie: s
      } : {
        valid: !0,
        meta: a,
        schemaCookie: s,
        schemaFingerprint: i
      };
    },
    async writeVerifiedD1SchemaMeta(r, t, a = {}) {
      const o = e.getD1ContractHash(), s = String(a?.schemaFingerprint || "") || await e.getD1SchemaFingerprint(r), i = await e.getD1SchemaCookie(r), c = (/* @__PURE__ */ new Date()).toISOString(), l = {
        contractVersion: ot,
        contractHash: o,
        schemaFingerprint: s,
        schemaCookie: i,
        lastPlanHash: String(a?.planHash || ""),
        verifiedAt: c
      }, u = await e.signD1SchemaAttestation(t, l);
      return u ? (await r.prepare(`INSERT INTO ${de(e.D1_SCHEMA_META_TABLE)} (scope, contract_version, contract_hash, schema_fingerprint, schema_cookie, last_plan_hash, verified_at, attestation, migration_owner, lease_expires_at)
        VALUES ('main', ?, ?, ?, ?, ?, ?, ?, NULL, NULL)
        ON CONFLICT(scope) DO UPDATE SET contract_version = excluded.contract_version, contract_hash = excluded.contract_hash, schema_fingerprint = excluded.schema_fingerprint, schema_cookie = excluded.schema_cookie, last_plan_hash = excluded.last_plan_hash, verified_at = excluded.verified_at, attestation = excluded.attestation, migration_owner = NULL, lease_expires_at = NULL`).bind(ot, o, s, i, l.lastPlanHash, c, u).run(), {
        written: !0,
        attestation: u,
        ...l
      }) : {
        written: !1,
        reason: "missing_secret",
        ...l
      };
    },
    async acquireD1SchemaRepairLease(r, t, a = {}) {
      const o = Math.max(0, Number(a.nowMs ?? H()) || 0), s = o + Iu, i = await r.prepare(`INSERT INTO ${de(e.D1_SCHEMA_META_TABLE)} (scope, contract_version, contract_hash, schema_fingerprint, schema_cookie, last_plan_hash, verified_at, attestation, migration_owner, lease_expires_at)
        VALUES ('main', 0, '', '', 0, '', '', '', ?, ?)
        ON CONFLICT(scope) DO UPDATE SET migration_owner = excluded.migration_owner, lease_expires_at = excluded.lease_expires_at
        WHERE ${de(e.D1_SCHEMA_META_TABLE)}.migration_owner IS NULL OR ${de(e.D1_SCHEMA_META_TABLE)}.lease_expires_at IS NULL OR ${de(e.D1_SCHEMA_META_TABLE)}.lease_expires_at < ? OR ${de(e.D1_SCHEMA_META_TABLE)}.migration_owner = excluded.migration_owner`).bind(t, s, o).run();
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
      return t ? (await r.prepare(`UPDATE ${de(e.D1_SCHEMA_META_TABLE)} SET migration_owner = NULL, lease_expires_at = NULL WHERE scope = 'main' AND migration_owner = ?`).bind(t).run(), !0) : !1;
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
      let t = J.D1SchemaReadyState.get(r);
      return t instanceof Map || (t = /* @__PURE__ */ new Map(), J.D1SchemaReadyState.set(r, t)), t;
    },
    isD1SchemaReadyCached(r, t) {
      const a = e.getD1SchemaReadyState(r);
      return !!a && (Number(a.get(String(t || ""))) || 0) > H();
    },
    markD1SchemaReady(r, t) {
      const a = e.getD1SchemaReadyState(r);
      a && a.set(String(t || ""), H() + Math.max(1e3, Number(F.Defaults.D1SchemaReadyTtlMs) || 1e3));
    },
    clearD1SchemaReady(r, t = []) {
      const a = J.D1SchemaReadyState.get(r);
      if (!(a instanceof Map)) return;
      const o = (Array.isArray(t) ? t : [t]).map((s) => String(s || "").trim()).filter(Boolean);
      if (!o.length) {
        a.clear();
        return;
      }
      for (const s of o) a.delete(s);
    },
    normalizeRevisionMeta(r, t) {
      const a = k(r) ? r : {}, o = k(t) ? t : {}, s = String(a.updatedAt || o.updatedAt || "").trim(), i = String(a.hash || o.hash || "").trim();
      return {
        ...o,
        ...a,
        updatedAt: s,
        hash: i,
        revision: String(a.revision || o.revision || Ht(i, s)).trim()
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
      const o = await Me(r, t, { type: "json" });
      return k(o) ? e.normalizeRevisionMeta(o, a) : null;
    },
    async writeRevisionMeta(r, t, a, o = null) {
      if (!r || !t) return a;
      const s = r.put(t, JSON.stringify(a));
      return o && o.waitUntil(s), await s, a;
    },
    async ensureConfigMeta(r, t = null, a = {}) {
      const o = oe(t ?? (await r?.get(e.CONFIG_KEY, { type: "json" }) || {})), s = e.normalizeRevisionMeta(Vn(o)), i = await e.readRevisionMeta(r, e.CONFIG_META_KEY);
      return i.hash === s.hash && i.revision ? i : await e.writeRevisionMeta(r, e.CONFIG_META_KEY, s, a.ctx);
    },
    buildNodesIndexMeta(r = [], t = [], a = {}) {
      const o = e.normalizeNodeIndex(r), s = e.normalizeNodeSummaryIndex(t).nodes, i = String(a.updatedAt || "").trim() || (/* @__PURE__ */ new Date()).toISOString(), c = ie(ee(o)), l = ie(ee(s)), u = ie(`${c}:${l}:${o.length}`);
      return {
        revision: Ht(u, i),
        updatedAt: i,
        hash: u,
        count: o.length,
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
      const o = Array.isArray(t.index) ? e.normalizeNodeIndex(t.index) : e.normalizeNodeIndex(a.map((c) => c?.name)), s = e.buildNodesIndexMeta(o, a, t), i = await e.readRevisionMeta(r, e.NODES_INDEX_META_KEY, {
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
      const a = _e(r), o = H();
      if (t.forceFresh !== !0 && a.NodesRevisionCache?.loaded === !0 && a.NodesRevisionCache.exp > o) return String(a.NodesRevisionCache.revision || "").trim();
      const s = a.NodesRevisionCacheGeneration;
      return await dn(a.SingleFlightTasks, ct(["nodes_revision", s]), async () => {
        const i = a.NodesRevisionCache;
        if (t.forceFresh !== !0 && i?.loaded === !0 && i.exp > H()) return String(i.revision || "").trim();
        let c = null;
        try {
          c = await r.get(e.NODES_INDEX_META_KEY, { type: "json" });
        } catch {
          return "";
        }
        const l = k(c) ? String(c.revision || "").trim() : "";
        return a.NodesRevisionCacheGeneration === s && (a.NodesRevisionCache = {
          loaded: !0,
          revision: l,
          exp: H() + F.Defaults.NodesRevisionCacheTtlMs
        }), l;
      });
    },
    getLogsRevisionFromStatus(r = {}) {
      const t = String(r?.revision || "").trim();
      return t || Ht("logs", String(r?.updatedAt || "").trim());
    },
    async bumpLogsRevision(r, t = {}, a = null) {
      const o = await e.getOpsStatusSection(r, "log"), s = (/* @__PURE__ */ new Date()).toISOString(), i = ie(`${e.getLogsRevisionFromStatus(o)}:${s}:${ee(t)}`);
      return await e.patchOpsStatus(r, { log: {
        ...t,
        revision: Ht(i, s),
        updatedAt: s
      } }, a);
    },
    async getAdminRevisions(r, t = {}) {
      const a = e.resolveOpsStatusStores(r), o = a.kv, s = a.db, [i, c, l, u] = await Promise.all([
        e.ensureConfigMeta(o, t.config, { ctx: t.ctx }),
        e.ensureNodesIndexMeta(o, {
          ctx: t.ctx,
          index: t.nodes?.map?.((d) => d?.name),
          nodes: t.nodes
        }),
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
        logsRevision: e.getLogsRevisionFromStatus(l),
        dnsIpPoolRevision: e.getDnsIpPoolRevisionFromStatus(u)
      };
    },
    async getAdminRevisionsForRead(r, t = {}) {
      const a = e.resolveOpsStatusStores(r), o = a.kv, s = a.db, [i, c, l, u] = await Promise.all([
        e.readRevisionMetaForRead(o, e.CONFIG_META_KEY),
        e.readRevisionMetaForRead(o, e.NODES_INDEX_META_KEY, {
          count: 0,
          indexHash: "",
          fullIndexHash: ""
        }),
        e.getOpsStatusSection({
          kv: o,
          db: s
        }, "log"),
        e.getOpsStatusSection({
          kv: o,
          db: s
        }, "dnsIpPool")
      ]), d = t.config !== void 0 ? t.config : await Me(o, e.CONFIG_KEY, { type: "json" }) || {}, f = e.normalizeRevisionMeta(Vn(oe(d), { updatedAt: String(i?.updatedAt || "").trim() })), m = String(i?.revision || "").trim().split(".").pop() || "", p = i?.hash === f.hash && m === f.hash ? i : f;
      let g = c;
      if (!g) {
        const h = Array.isArray(t.nodes) ? t.nodes : await e.getNodesSummaryIndexStrict(o, { ctx: t.ctx });
        g = e.buildNodesIndexMeta((Array.isArray(h) ? h : []).map((y) => y?.name), Array.isArray(h) ? h : []);
      }
      return {
        configRevision: String(p?.revision || ""),
        nodesRevision: String(g?.revision || ""),
        logsRevision: e.getLogsRevisionFromStatus(l),
        dnsIpPoolRevision: e.getDnsIpPoolRevisionFromStatus(u)
      };
    }
  };
}
function Tg(n = {}, e = {}) {
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
      ].every((p) => t.has(p)), [o, s] = await Promise.all([r.prepare("SELECT sql FROM sqlite_master WHERE type = 'table' AND name = ? LIMIT 1").bind(e.LOGS_FTS_TABLE).first(), r.prepare("SELECT name, tbl_name, sql FROM sqlite_master WHERE type = 'trigger' AND name = ? LIMIT 1").bind(e.LOGS_FTS_INSERT_TRIGGER).first()]), i = Lr(o?.sql || "").replace(/'/g, ""), c = /^create\s+virtual\s+table\b/.test(i) && /\busing\s+fts5\s*\(/.test(i) && new RegExp(`\\bcontent\\s*=\\s*${e.LOGS_TABLE}\\b`).test(i) && /\bcontent_rowid\s*=\s*id\b/.test(i), l = Lr(s?.sql || ""), u = l.replace(/\s+/g, ""), d = `insert into ${e.LOGS_FTS_TABLE} (
            rowid, node_name, request_path, user_agent, error_detail, detail_json
          ) values (
            new.id, new.node_name, new.request_path,
            coalesce(new.user_agent, ''), coalesce(new.error_detail, ''), coalesce(new.detail_json, '')
          )`.replace(/\s+/g, ""), f = u.includes(d), m = String(s?.name || "") === e.LOGS_FTS_INSERT_TRIGGER && String(s?.tbl_name || "") === e.LOGS_TABLE && new RegExp(`\\bafter\\s+insert\\s+on\\s+${e.LOGS_TABLE}\\b`).test(l) && new RegExp(`\\binsert\\s+into\\s+${e.LOGS_FTS_TABLE}\\s*\\(`).test(l) && f;
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
        return ((await r.prepare(`PRAGMA table_xinfo(${de(t)})`).all())?.results || []).map((a) => ({
          name: String(a?.name || "").toLowerCase(),
          type: String(a?.type || "").trim().toUpperCase(),
          affinity: Dn(a?.type),
          primaryKeyOrder: Math.max(0, Number(a?.pk) || 0),
          notNull: Number(a?.notnull) === 1,
          defaultValue: a?.dflt_value ?? null,
          hidden: Math.max(0, Number(a?.hidden) || 0)
        })).filter((a) => a.name);
      } catch (a) {
        const o = /* @__PURE__ */ new Error(`D1 schema inspection failed for ${t}`);
        throw o.code = "D1_SCHEMA_INSPECTION_FAILED", o.status = 503, o.details = {
          tableName: String(t),
          cause: ce(a, "d1_pragma_failed")
        }, o;
      }
    },
    async getTableColumns(r, t) {
      const a = await e.getTableColumnDefinitions(r, t);
      return new Set(a.map((o) => o.name));
    },
    async getIndexKeyColumns(r, t) {
      if (!r || !t) return [];
      try {
        return ((await r.prepare(`PRAGMA index_xinfo(${de(t)})`).all())?.results || []).map((a) => ({
          order: Math.max(0, Number(a?.seqno) || 0),
          name: String(a?.name || "").toLowerCase(),
          key: a?.key === void 0 || Number(a.key) === 1,
          expression: Number(a?.cid) === -2 || !String(a?.name || "").trim()
        })).filter((a) => a.key).sort((a, o) => a.order - o.order).map((a) => a.expression ? "<expression>" : a.name);
      } catch (a) {
        const o = /* @__PURE__ */ new Error(`D1 schema inspection failed for ${t}`);
        throw o.code = "D1_SCHEMA_INSPECTION_FAILED", o.status = 503, o.details = {
          indexName: String(t),
          cause: ce(a, "d1_pragma_failed")
        }, o;
      }
    },
    async getTableIndexDefinitions(r, t) {
      if (!r || !t) return [];
      try {
        return ((await r.prepare(`PRAGMA index_list(${de(t)})`).all())?.results || []).map((a) => ({
          name: String(a?.name || ""),
          unique: Number(a?.unique) === 1,
          partial: Number(a?.partial) === 1
        })).filter((a) => a.name);
      } catch (a) {
        const o = /* @__PURE__ */ new Error(`D1 schema inspection failed for ${t}`);
        throw o.code = "D1_SCHEMA_INSPECTION_FAILED", o.status = 503, o.details = {
          tableName: String(t),
          cause: ce(a, "d1_pragma_failed")
        }, o;
      }
    },
    async getD1TableNameSet(r) {
      if (!r) return /* @__PURE__ */ new Set();
      const t = await r.prepare("SELECT name FROM sqlite_master WHERE type = 'table'").all();
      return new Set((t?.results || []).map((a) => String(a?.name || "")).filter(Boolean));
    },
    async getD1SchemaSnapshot(r) {
      if (!r) return {
        objects: [],
        columns: [],
        indexes: []
      };
      const t = Object.keys(e.getD1CurrentSchemaContract().columns), a = [...t, e.LOGS_FTS_TABLE], o = a.map(() => "?").join(", "), s = t.map(() => "?").join(", "), [i, c, l] = await Promise.all([
        r.prepare("SELECT type, name, tbl_name, sql FROM sqlite_master WHERE type IN ('table', 'index', 'trigger') ORDER BY type, name").all(),
        r.prepare(`SELECT schema_table.name AS table_name, column_info.name, column_info.type, column_info."notnull" AS is_not_null,
					column_info.dflt_value, column_info.pk, column_info.hidden
					FROM sqlite_master AS schema_table
					JOIN pragma_table_xinfo(schema_table.name) AS column_info
					WHERE schema_table.type = 'table' AND schema_table.name IN (${o})
					ORDER BY schema_table.name, column_info.cid`).bind(...a).all(),
        r.prepare(`SELECT schema_index.tbl_name AS table_name, index_list.name AS index_name, index_list."unique" AS is_unique,
					index_list.partial, index_list.origin, index_column.seqno, index_column.cid, index_column.name AS column_name, index_column."key" AS is_key
					FROM sqlite_master AS schema_index
					JOIN pragma_index_list(schema_index.tbl_name) AS index_list ON index_list.name = schema_index.name
					JOIN pragma_index_xinfo(index_list.name) AS index_column
					WHERE schema_index.type = 'index' AND schema_index.tbl_name IN (${s})
					ORDER BY schema_index.tbl_name, index_list.name, index_column.seqno`).bind(...t).all()
      ]);
      return {
        objects: i?.results || [],
        columns: c?.results || [],
        indexes: l?.results || []
      };
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
      }, a = Object.fromEntries(Object.entries(e.getD1RuntimeColumnAdditions()).map(([o, s]) => {
        const i = Object.fromEntries(Object.entries(s).map(([c, l]) => [c, String(l || "").trim().split(/\s+/, 1)[0].toUpperCase()]));
        return [o, {
          ...t[o],
          ...i
        }];
      }));
      return {
        columns: Object.fromEntries(Object.entries(a).map(([o, s]) => [o, Object.keys(s)])),
        columnTypes: a,
        columnAffinities: Object.fromEntries(Object.entries(a).map(([o, s]) => [o, Object.fromEntries(Object.entries(s).map(([i, c]) => [i, Dn(c)]))])),
        primaryKeys: r,
        indexes: e.getD1RuntimeIndexContract(),
        uniqueIndexes: e.getD1UniqueIndexContract()
      };
    },
    async getD1SchemaFingerprint(r) {
      return r ? ie(ee((await r.prepare("SELECT type, name, tbl_name, sql FROM sqlite_master WHERE type IN ('table', 'index', 'trigger') ORDER BY type, name").all())?.results || [])) : "";
    },
    async getD1SchemaStatus(r, t = {}) {
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
      const a = e.getD1CurrentSchemaContract(), o = t.snapshot || await e.getD1SchemaSnapshot(r), s = o.objects || [], i = new Set(s.filter((E) => E?.type === "table").map((E) => String(E?.name || "")).filter(Boolean)), c = /* @__PURE__ */ new Map();
      for (const E of o.indexes || []) {
        const w = String(E?.index_name || "");
        if (!w) continue;
        let N = c.get(w);
        N || (N = {
          name: w,
          table: String(E?.table_name || ""),
          unique: Number(E?.is_unique) === 1,
          partial: Number(E?.partial) === 1,
          origin: String(E?.origin || ""),
          columns: []
        }, c.set(w, N)), (E?.is_key === void 0 || Number(E.is_key) === 1) && N.columns.push({
          order: Math.max(0, Number(E?.seqno) || 0),
          name: Number(E?.cid) === -2 || !String(E?.column_name || "").trim() ? "<expression>" : String(E.column_name).toLowerCase()
        });
      }
      for (const E of c.values()) E.columns = E.columns.sort((w, N) => w.order - N.order).map((w) => w.name);
      const l = /* @__PURE__ */ new Map();
      for (const E of o.columns || []) {
        const w = String(E?.table_name || "");
        l.has(w) || l.set(w, []), l.get(w).push({
          name: String(E?.name || "").toLowerCase(),
          type: String(E?.type || "").trim().toUpperCase(),
          affinity: Dn(E?.type),
          primaryKeyOrder: Math.max(0, Number(E?.pk) || 0),
          notNull: Number(E?.is_not_null) === 1,
          defaultValue: E?.dflt_value ?? null,
          hidden: Math.max(0, Number(E?.hidden) || 0)
        });
      }
      const u = Object.fromEntries(Object.keys(a.columns).map((E) => [E, i.has(E)])), d = {}, f = {}, m = [];
      for (const [E, w] of Object.entries(a.columns)) {
        if (!i.has(E)) {
          d[E] = Object.fromEntries(w.map((P) => [P, !1])), f[E] = !1, m.push(`missing_table:${E}`);
          continue;
        }
        const N = l.get(E) || [], O = new Map(N.map((P) => [P.name, P]));
        d[E] = Object.fromEntries(w.map((P) => {
          const I = O.get(P), M = String(a.columnAffinities?.[E]?.[P] || "").toUpperCase(), x = E === e.LOGS_TABLE && P === "id";
          return [P, !!I && (!M || I.affinity === M) && (!x || I.type === "INTEGER")];
        }));
        for (const [P, I] of Object.entries(d[E])) if (!I) {
          const M = O.get(P);
          m.push(M ? `invalid_column_affinity:${E}.${P}` : `missing_column:${E}.${P}`);
        }
        const C = N.filter((P) => P.primaryKeyOrder > 0).sort((P, I) => P.primaryKeyOrder - I.primaryKeyOrder).map((P) => P.name), v = E === e.LOGS_TABLE ? N.find((P) => P.name === "id") : null;
        f[E] = ee(C) === ee(a.primaryKeys[E] || []) && (!v || v.type === "INTEGER"), f[E] || m.push(`invalid_primary_key:${E}`);
        const B = N.filter((P) => !w.includes(P.name) && P.notNull && P.defaultValue === null && P.primaryKeyOrder === 0).map((P) => P.name);
        B.length && m.push(`unsupported_required_columns:${E}:${B.join(",")}`);
      }
      let p = !1;
      if (i.has(e.DNS_IP_POOL_ITEMS_TABLE)) {
        for (const E of [...c.values()].filter((w) => w.table === e.DNS_IP_POOL_ITEMS_TABLE && w.unique && !w.partial)) if (ee(E.columns) === ee(["ip"])) {
          p = !0;
          break;
        }
        p || m.push(`missing_unique_key:${e.DNS_IP_POOL_ITEMS_TABLE}.ip`);
      }
      const g = {};
      for (const [E, w] of Object.entries(a.indexes)) {
        const N = c.get(E);
        if (!N) {
          g[E] = !1, m.push(`missing_index:${E}`);
          continue;
        }
        g[E] = N.table === w.table && N.unique === !1 && N.partial === !1 && ee(N.columns) === ee(w.columns), g[E] || m.push(`invalid_index:${E}`);
      }
      for (const E of Object.keys(a.columns)) {
        const w = [a.primaryKeys?.[E] || [], ...Object.values(a.uniqueIndexes || {}).filter((O) => O.table === E).map((O) => O.columns)], N = [...c.values()].filter((O) => O.table === E && O.unique && !O.partial && !w.some((C) => ee(C) === ee(O.columns))).map((O) => O.name);
        N.length && m.push(`unsupported_unique_indexes:${E}:${N.join(",")}`);
      }
      const h = /* @__PURE__ */ new Set([String(e.LOGS_FTS_INSERT_TRIGGER).toLowerCase()]);
      for (const E of Object.keys(a.columns)) {
        const w = s.filter((N) => N?.type === "trigger" && String(N?.tbl_name || "") === E && !h.has(String(N?.name || "").toLowerCase())).map((N) => String(N?.name || "")).filter(Boolean);
        w.length && m.push(`unsupported_triggers:${E}:${w.join(",")}`);
      }
      const y = s.find((E) => E?.type === "table" && String(E?.name || "") === e.LOGS_FTS_TABLE), _ = s.find((E) => E?.type === "trigger" && String(E?.name || "") === e.LOGS_FTS_INSERT_TRIGGER), S = new Set((l.get(e.LOGS_FTS_TABLE) || []).map((E) => E.name)), A = Lr(y?.sql || "").replace(/'/g, ""), b = Lr(_?.sql || ""), R = b.replace(/\s+/g, ""), T = `insertinto${e.LOGS_FTS_TABLE}(rowid,node_name,request_path,user_agent,error_detail,detail_json)values(new.id,new.node_name,new.request_path,coalesce(new.user_agent,''),coalesce(new.error_detail,''),coalesce(new.detail_json,''))`, L = {
        tableReady: !!y,
        virtualTableReady: !!y && /^create\s+virtual\s+table\b/.test(A) && /\busing\s+fts5\s*\(/.test(A) && new RegExp(`\\bcontent\\s*=\\s*${e.LOGS_TABLE}\\b`).test(A) && /\bcontent_rowid\s*=\s*id\b/.test(A),
        columnsReady: [
          "node_name",
          "request_path",
          "user_agent",
          "error_detail",
          "detail_json"
        ].every((E) => S.has(E)),
        triggerReady: String(_?.tbl_name || "") === e.LOGS_TABLE && new RegExp(`\\bafter\\s+insert\\s+on\\s+${e.LOGS_TABLE}\\b`).test(b) && R.includes(T)
      };
      L.ready = L.virtualTableReady && L.columnsReady && L.triggerReady, L.ready || m.push(L.tableReady ? "fts_contract_invalid" : `missing_table:${e.LOGS_FTS_TABLE}`);
      const D = m.length === 0 && Object.values(u).every(Boolean) && Object.values(d).every((E) => Object.values(E).every(Boolean)) && Object.values(f).every(Boolean) && p && Object.values(g).every(Boolean) && L.ready;
      return {
        tables: u,
        columns: d,
        indexes: g,
        constraints: {
          primaryKeys: f,
          uniqueKeys: { [`${e.DNS_IP_POOL_ITEMS_TABLE}.ip`]: p }
        },
        ftsReady: L.ready,
        fts: L,
        schemaReady: D,
        issues: m
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
          contractVersion: ot,
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
      const o = de(t), s = a.map((u) => de(u)), i = s.map((u) => `${u} IS NULL OR (typeof(${u}) = 'text' AND trim(${u}) = '')`).join(" OR "), [c, l] = await Promise.all([r.prepare(`SELECT 1 AS present FROM ${o} WHERE ${i} LIMIT 1`).first(), r.prepare(`SELECT 1 AS present FROM ${o} GROUP BY ${s.join(", ")} HAVING COUNT(*) > 1 LIMIT 1`).first()]);
      return {
        empty: !!c,
        duplicate: !!l
      };
    },
    async probeD1PrimaryKeyRepair(r, t, a) {
      const o = await e.getTableColumnDefinitions(r, t), s = t === e.LOGS_TABLE, i = new Set(a.columns?.[t] || []), c = a.primaryKeys?.[t] || [], l = new Map(o.map((h) => [h.name, h])), u = [];
      for (const h of c) {
        const y = l.get(h), _ = a.columnAffinities?.[t]?.[h];
        y ? (y.affinity !== _ || t === e.LOGS_TABLE && h === "id" && y.type !== "INTEGER") && u.push(`invalid_column_affinity:${t}.${h}`) : s || u.push(`missing_key_column:${t}.${h}`);
      }
      const d = o.filter((h) => !i.has(h.name)).map((h) => h.name);
      !s && d.length && u.push(`unsupported_extra_columns:${t}:${d.join(",")}`), !s && o.some((h) => h.hidden > 0) && u.push(`unsupported_hidden_columns:${t}`), ((await r.prepare(`PRAGMA foreign_key_list(${de(t)})`).all())?.results || []).length && u.push(`unsupported_foreign_keys:${t}`);
      const f = ((await r.prepare("SELECT name, sql FROM sqlite_master WHERE type = 'trigger' AND tbl_name = ?").bind(t).all())?.results || []).filter((h) => {
        if (t !== e.LOGS_TABLE) return !0;
        const y = String(h?.name || "").toLowerCase(), _ = Lr(h?.sql || "");
        return !(y === String(e.LOGS_FTS_INSERT_TRIGGER).toLowerCase() || y === `${e.LOGS_TABLE}_ai` || y === `${e.LOGS_TABLE}_au` || y === `${e.LOGS_TABLE}_ad` || _.includes(String(e.LOGS_FTS_TABLE).toLowerCase()));
      });
      !s && f.length && u.push(`unsupported_triggers:${t}:${f.map((h) => String(h?.name || "")).join(",")}`);
      const m = [`__d1_repair_${t}_`, `__d1_backup_${t}_`], p = await r.prepare("SELECT name FROM sqlite_master WHERE type = 'table' AND (name GLOB ? OR name GLOB ?) LIMIT 1").bind(`${m[0]}*`, `${m[1]}*`).first();
      p?.name && u.push(`repair_artifact_present:${t}:${String(p.name)}`);
      let g = null;
      if (!s) {
        const h = de(t), y = await r.prepare(`SELECT COUNT(*) AS total FROM (SELECT 1 FROM ${h} LIMIT ${Ln + 1})`).first();
        g = Math.max(0, Number(y?.total) || 0);
      }
      if (!s && g > Ln && u.push(`rebuild_row_limit_exceeded:${t}:${g}`), !s && !u.length) {
        const h = await e.probeD1UniqueKeyRepair(r, t, c);
        h.empty && u.push(`primary_key_empty:${t}`), h.duplicate && u.push(`primary_key_duplicate:${t}`);
      }
      return {
        repairable: u.length === 0,
        rowCount: g,
        estimatedRowsIsLowerBound: g !== null && g > Ln,
        rowCountMeasured: g !== null,
        allowsDataLoss: s,
        blockers: u
      };
    },
    async buildD1SchemaRepairPlan(r) {
      const t = await e.getD1SchemaSnapshot(r), a = await e.getD1SchemaStatus(r, { snapshot: t }), o = e.getD1CurrentSchemaContract(), s = ie(ee(t.objects || [])), i = await e.getD1SchemaCookie(r), c = e.getD1ContractHash(), l = await e.readD1SchemaMeta(r), u = [], d = [], f = [], m = [], p = (E, w, N = "low", O = 0, C = {}) => m.push({
        kind: E,
        target: w,
        risk: N,
        estimatedRows: O === null ? null : Math.max(0, Number(O) || 0),
        ...C
      });
      Math.max(0, Number(l?.contract_version) || 0) > ot && f.push(`schema_version_ahead:${Math.max(0, Number(l.contract_version) || 0)}`);
      for (const [E, w] of Object.entries(a.tables || {})) {
        if (!w) {
          const O = `missing_table:${E}`;
          u.push(O), p("create_table", E);
          continue;
        }
        const N = E === e.LOGS_TABLE && a.constraints?.primaryKeys?.[E] !== !0;
        for (const [O, C] of Object.entries(a.columns?.[E] || {})) {
          if (C) continue;
          const v = `${E}.${O}`, B = (a.issues || []).find((P) => String(P).endsWith(v)) || `missing_column:${v}`;
          N && String(B).startsWith("missing_column:") ? d.push(B) : String(B).startsWith("missing_column:") && e.getD1RuntimeColumnAdditions()?.[E]?.[O] ? (u.push(B), p("add_column", v)) : f.push(B);
        }
        if (a.constraints?.primaryKeys?.[E] !== !0) {
          const O = `invalid_primary_key:${E}`, C = await e.probeD1PrimaryKeyRepair(r, E, o);
          C.repairable ? (d.push(O), p(C.allowsDataLoss === !0 ? "recreate_log_table" : "rebuild_table", E, "high", C.rowCount, {
            allowsDataLoss: C.allowsDataLoss === !0,
            willDiscardData: C.allowsDataLoss === !0,
            dataMode: C.allowsDataLoss === !0 ? "discard" : "copy",
            estimatedRowsIsLowerBound: C.estimatedRowsIsLowerBound === !0,
            rowCountMeasured: C.rowCountMeasured === !0
          })) : f.push(O, ...C.blockers);
        }
      }
      for (const E of a.issues || []) if (/^unsupported_(?:required_columns|unique_indexes|triggers):/.test(String(E))) {
        const w = String(E).split(":", 2)[1];
        if (w === e.LOGS_TABLE && a.constraints?.primaryKeys?.[w] !== !0) continue;
        f.push(E);
      }
      const g = `${e.DNS_IP_POOL_ITEMS_TABLE}.ip`;
      if (a.tables?.[e.DNS_IP_POOL_ITEMS_TABLE] && a.constraints?.uniqueKeys?.[g] !== !0 && a.columns?.[e.DNS_IP_POOL_ITEMS_TABLE]?.ip === !0) {
        const E = await e.probeD1UniqueKeyRepair(r, e.DNS_IP_POOL_ITEMS_TABLE, ["ip"]);
        E.empty && f.push(`unique_key_empty:${g}`), E.duplicate && f.push(`unique_key_duplicate:${g}`), !E.empty && !E.duplicate && (u.push(`missing_unique_key:${g}`), p("create_unique_index", "ux_dns_ip_pool_items_ip"));
      }
      const h = m.some((E) => E.kind === "recreate_log_table" && E.target === e.LOGS_TABLE);
      for (const [E, w] of Object.entries(a.indexes || {})) if (!w) {
        const N = (a.issues || []).includes(`invalid_index:${E}`) ? `invalid_index:${E}` : `missing_index:${E}`;
        u.push(N), h && o.indexes?.[E]?.table === e.LOGS_TABLE || p(N.startsWith("invalid_") ? "repair_index" : "create_index", E);
      }
      if (a.ftsReady !== !0) {
        const E = a.fts?.tableReady ? "fts_contract_invalid" : `missing_table:${e.LOGS_FTS_TABLE}`;
        u.push(E), h || p(a.fts?.tableReady ? "recreate_fts" : "create_fts", e.LOGS_FTS_TABLE);
      }
      const y = (E) => [...new Set(E.map((w) => String(w || "").trim()).filter(Boolean))], _ = [...new Map(m.map((E) => [`${E.kind}:${E.target}`, E])).values()].sort((E, w) => `${E.risk}:${E.kind}:${E.target}`.localeCompare(`${w.risk}:${w.kind}:${w.target}`)), S = y(u), A = y(d), b = y(f), R = _.filter((E) => E.risk !== "high"), T = _.filter((E) => E.risk === "high"), L = b.length ? "blocked" : A.length ? "high" : S.length ? "low" : "none", D = b.length ? "blocked" : R.length ? "safe" : T.length ? "destructive" : "ready";
      return {
        version: Oa,
        phase: D,
        contractVersion: ot,
        contractHash: c,
        schemaCookie: i,
        planHash: ie(ee({
          version: Oa,
          contractVersion: ot,
          contractHash: c,
          schemaCookie: i,
          schemaFingerprint: s,
          phase: D,
          repairableIssues: S,
          highRiskIssues: A,
          blockingIssues: b,
          steps: _
        })),
        schemaFingerprint: s,
        risk: L,
        repairableIssues: S,
        highRiskIssues: A,
        blockingIssues: b,
        steps: _,
        status: a
      };
    },
    async createD1SchemaRepairToken(r, t, a = {}) {
      const o = String(r?.JWT_SECRET || "").trim();
      if (!o) {
        const l = /* @__PURE__ */ new Error("JWT_SECRET is required to sign the D1 schema repair plan");
        throw l.code = "SERVER_MISCONFIGURED", l.status = 503, l;
      }
      const s = Math.max(0, Math.floor(Number(a.nowMs ?? H()) / 1e3)), i = s + Math.floor(Nu / 1e3), c = pa(JSON.stringify({
        version: Oa,
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
        token: `${c}.${await ft(o, c)}`,
        expiresAt: i
      };
    },
    async verifyD1SchemaRepairToken(r, t, a, o = {}) {
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
      const u = i.slice(0, l);
      if (i.slice(l + 1) !== await ft(s, u)) throw c("invalid_signature");
      let d = null;
      try {
        d = JSON.parse(qr(u));
      } catch {
      }
      if (!k(d) || d.version !== Oa || d.scope !== "d1_schema_repair" || d.phase !== "destructive") throw c("invalid_payload");
      const f = Math.max(0, Math.floor(Number(o.nowMs ?? H()) / 1e3));
      if (Number(d.expiresAt) <= f) throw c("expired", { expiresAt: Number(d.expiresAt) || 0 });
      if (String(d.planHash || "") !== String(a?.planHash || "") || String(d.schemaFingerprint || "") !== String(a?.schemaFingerprint || "") || Number(d.schemaCookie) !== Number(a?.schemaCookie) || String(d.contractHash || "") !== String(a?.contractHash || "") || Number(d.contractVersion) !== Number(a?.contractVersion)) throw c("schema_changed", {
        previewPlanHash: String(d.planHash || ""),
        currentPlanHash: String(a?.planHash || "")
      });
      return d;
    },
    getD1SchemaRepairTokenPlanHash(r) {
      const t = String(r || "").trim().split(".", 1)[0];
      if (!t) return "";
      try {
        const a = JSON.parse(qr(t));
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
          cause: ce(t, "bookmark_failed")
        }, a;
      }
    },
    async ensureD1KnownColumns(r, t = {}) {
      const a = await e.getD1TableNameSet(r), o = new Set(Array.isArray(t.skipTables) ? t.skipTables : []), s = [];
      for (const [i, c] of Object.entries(e.getD1RuntimeColumnAdditions())) {
        if (!a.has(i) || o.has(i)) continue;
        const l = await e.getTableColumns(r, i);
        for (const [u, d] of Object.entries(c))
          l.has(u) || (await r.prepare(`ALTER TABLE ${de(i)} ADD COLUMN ${de(u)} ${d}`).run(), l.add(u), s.push(`${i}.${u}`));
      }
      return s;
    },
    async repairD1RuntimeIndexes(r, t = {}) {
      const a = await e.getD1TableNameSet(r), o = new Set(Array.isArray(t.skipTables) ? t.skipTables : []), s = [], i = [];
      for (const [c, l] of Object.entries(e.getD1RuntimeIndexContract())) {
        if (!a.has(l.table) || o.has(l.table)) continue;
        const u = await r.prepare("SELECT tbl_name FROM sqlite_master WHERE type = 'index' AND name = ? LIMIT 1").bind(c).first();
        let d = !1;
        if (u) {
          const f = (await e.getTableIndexDefinitions(r, l.table)).find((m) => m.name === c);
          d = String(u?.tbl_name || "") === l.table && f?.unique === !1 && f?.partial === !1 && ee(await e.getIndexKeyColumns(r, c)) === ee(l.columns);
        }
        d || (u ? (await r.prepare(`DROP INDEX IF EXISTS ${de(c)}`).run(), i.push(c)) : s.push(c), await r.prepare(l.createSql).run());
      }
      return {
        createdIndexes: s,
        repairedIndexes: i
      };
    },
    async ensureD1UniqueIndexes(r) {
      const t = [];
      for (const [a, o] of Object.entries(e.getD1UniqueIndexContract())) {
        if (!(await e.getD1TableNameSet(r)).has(o.table)) continue;
        let s = !1;
        for (const i of (await e.getTableIndexDefinitions(r, o.table)).filter((c) => c.unique && !c.partial)) if (ee(await e.getIndexKeyColumns(r, i.name)) === ee(o.columns)) {
          s = !0;
          break;
        }
        s || (await r.prepare("SELECT tbl_name FROM sqlite_master WHERE type = 'index' AND name = ? LIMIT 1").bind(a).first() && await r.prepare(`DROP INDEX IF EXISTS ${de(a)}`).run(), await r.prepare(o.createSql).run(), t.push(a));
      }
      return t;
    },
    async rebuildD1TableWithShadow(r, t, a) {
      const o = e.getD1CurrentSchemaContract();
      if (!Object.prototype.hasOwnProperty.call(o.columns, t)) throw new Error(`Unknown D1 rebuild table: ${t}`);
      if (t === e.LOGS_TABLE) throw new Error("proxy_logs must use destructive atomic recreation");
      const s = String(a?.planHash || "repair").replace(/[^a-z0-9]/gi, "").slice(0, 12) || "repair", i = `__d1_repair_${t}_${s}`, c = `__d1_backup_${t}_${s}`, l = await e.getD1TableNameSet(r);
      if (l.has(i) || l.has(c)) {
        const m = /* @__PURE__ */ new Error("D1 schema repair temporary table already exists");
        throw m.code = "D1_SCHEMA_REPAIR_BLOCKED", m.status = 409, m.details = {
          phase: "preflight",
          blockingIssues: [`repair_artifact_present:${t}`]
        }, m;
      }
      const u = o.columns[t].map((m) => de(m)).join(", "), d = (await r.prepare("SELECT name, sql FROM sqlite_master WHERE type = 'index' AND tbl_name = ? AND sql IS NOT NULL").bind(t).all())?.results || [];
      await r.prepare(e.buildD1CreateTableSql(t, i)).run();
      try {
        await r.batch([
          r.prepare(`INSERT INTO ${de(i)} (${u}) SELECT ${u} FROM ${de(t)}`),
          r.prepare(`ALTER TABLE ${de(t)} RENAME TO ${de(c)}`),
          r.prepare(`ALTER TABLE ${de(i)} RENAME TO ${de(t)}`),
          ...d.map((m) => r.prepare(`DROP INDEX ${de(m.name)}`)),
          ...d.map((m) => r.prepare(String(m.sql)))
        ]);
      } catch (m) {
        throw await r.prepare(`DROP TABLE IF EXISTS ${de(i)}`).run().catch(() => {
        }), m;
      }
      const f = await r.prepare(`SELECT COUNT(*) AS total FROM ${de(t)}`).first();
      return {
        table: t,
        rowCount: Math.max(0, Number(f?.total) || 0),
        allowsDataLoss: !1,
        willDiscardData: !1,
        dataMode: "copy",
        backupTable: c,
        originalIndexes: d
      };
    },
    async recreateD1LogsDestructively(r, t) {
      const a = (t?.steps || []).find((i) => i?.kind === "recreate_log_table" && i?.target === e.LOGS_TABLE);
      if (!a || a.willDiscardData !== !0 || a.dataMode !== "discard") throw new Error("Missing destructive proxy_logs repair step");
      const o = e.getD1LogsFtsContractSql(), s = Object.values(e.getD1RuntimeIndexContract()).filter((i) => i.table === e.LOGS_TABLE);
      return await r.batch([
        r.prepare(`DROP TABLE IF EXISTS ${de(e.LOGS_FTS_TABLE)}`),
        r.prepare(`DROP TABLE ${de(e.LOGS_TABLE)}`),
        r.prepare(e.buildD1CreateTableSql(e.LOGS_TABLE)),
        ...s.map((i) => r.prepare(i.createSql)),
        r.prepare(o.createTable),
        r.prepare(o.createTrigger)
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
        const o = String(a?.table || ""), s = String(a?.backupTable || "");
        if (!(!o || !s || !(await e.getD1TableNameSet(r)).has(s))) {
          o === e.LOGS_TABLE && (await e.dropLogsFtsSyncTriggers(r).catch(() => 0), await r.prepare(`DROP TABLE IF EXISTS ${de(e.LOGS_FTS_TABLE)}`).run().catch(() => {
          }));
          for (const i of (await r.prepare("SELECT name FROM sqlite_master WHERE type = 'index' AND tbl_name = ? AND sql IS NOT NULL").bind(o).all())?.results || []) await r.prepare(`DROP INDEX IF EXISTS ${de(i.name)}`).run().catch(() => {
          });
          await r.batch([r.prepare(`DROP TABLE IF EXISTS ${de(o)}`), r.prepare(`ALTER TABLE ${de(s)} RENAME TO ${de(o)}`)]);
          for (const i of a.originalIndexes || []) {
            const c = String(i?.sql || "").replace(/^CREATE\s+(UNIQUE\s+)?INDEX\s+/i, (l, u) => `CREATE ${u || ""}INDEX IF NOT EXISTS `);
            c && await r.prepare(c).run().catch(() => {
            });
          }
          o === e.LOGS_TABLE && await e.ensureLogsFtsSchema(r, { forceRecreate: !0 }).catch(() => {
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
      let o = J.D1DatabaseInitReady.get(r);
      (!o || !(o.inFlight instanceof Map)) && (o = {
        tail: Promise.resolve(),
        inFlight: /* @__PURE__ */ new Map()
      }, J.D1DatabaseInitReady.set(r, o));
      const s = `${a}:${e.getD1SchemaRepairTokenPlanHash(t.repairToken) || "automatic"}`;
      let i = o.inFlight.get(s);
      i || (i = Promise.resolve(o.tail).catch(() => {
      }).then(() => e.runD1DatabaseInitialization(r, {
        ...t,
        profile: a
      })), o.tail = i.catch(() => {
      }), o.inFlight.set(s, i));
      try {
        return await i;
      } finally {
        o.inFlight.get(s) === i && o.inFlight.delete(s);
      }
    },
    async runD1DatabaseInitialization(r, t = {}) {
      const a = t.profile || (t.includeFts === !1 ? "logs-core" : "logs-fts"), o = String(t.repairMode || (String(t.repairToken || "").trim() ? "confirmed-destructive" : "safe"));
      e.invalidateD1SchemaReadiness(r, "all");
      const s = await e.buildD1SchemaRepairPlan(r), i = new Set(Object.entries(s.status?.tables || {}).filter(([, f]) => f === !0).map(([f]) => f));
      if (s.status?.fts?.tableReady === !0 && i.add(e.LOGS_FTS_TABLE), s.blockingIssues.length) {
        const f = /* @__PURE__ */ new Error("D1 schema repair is blocked by incompatible data or table shape");
        throw f.code = "D1_SCHEMA_REPAIR_BLOCKED", f.status = 409, f.details = {
          phase: "preflight",
          blockingIssues: s.blockingIssues,
          repairPlan: s
        }, f;
      }
      let c = null;
      if (s.phase === "safe" && o === "confirmed-destructive") {
        const f = /* @__PURE__ */ new Error("D1 schema repair must complete safe preparation before destructive repair");
        throw f.code = "D1_SCHEMA_REPAIR_PREPARATION_REQUIRED", f.status = 409, f.details = { repairPlan: s }, f;
      }
      if (s.phase === "destructive") {
        if (t.confirmHighRisk !== !0 || !String(t.repairToken || "").trim()) {
          const f = t.env ? await e.createD1SchemaRepairToken(t.env, s) : {
            token: "",
            expiresAt: 0
          }, m = /* @__PURE__ */ new Error("D1 schema repair requires explicit confirmation");
          throw m.code = "D1_SCHEMA_REPAIR_CONFIRMATION_REQUIRED", m.status = 428, m.details = { repairPlan: {
            ...s,
            repairToken: f.token,
            expiresAt: f.expiresAt ? (/* @__PURE__ */ new Date(f.expiresAt * 1e3)).toISOString() : ""
          } }, m;
        }
        await e.verifyD1SchemaRepairToken(t.env, t.repairToken, s), c = await e.getD1TimeTravelBookmark(r);
      }
      const l = [], u = [];
      let d = "";
      try {
        if (s.steps.find((C) => C.kind === "create_table" && C.target === e.D1_SCHEMA_META_TABLE && C.risk !== "high") && (await r.prepare(e.buildD1CreateTableSql(e.D1_SCHEMA_META_TABLE, e.D1_SCHEMA_META_TABLE, { ifNotExists: !0 })).run(), u.push({
          kind: "create_table",
          target: e.D1_SCHEMA_META_TABLE
        })), (s.phase === "safe" || s.phase === "destructive") && (d = String(globalThis.crypto?.randomUUID?.() || `${H()}-${Math.random()}`), await e.acquireD1SchemaRepairLease(r, d)), s.phase === "destructive") {
          const C = await e.buildD1SchemaRepairPlan(r);
          await e.verifyD1SchemaRepairToken(t.env, t.repairToken, C);
        }
        const f = s.phase === "safe" ? s.steps.filter((C) => C.risk !== "high") : s.phase === "destructive" ? s.steps.filter((C) => C.risk === "high") : [], m = f.filter((C) => C.kind === "create_table" && C.target !== e.LOGS_FTS_TABLE && C.target !== e.D1_SCHEMA_META_TABLE).map((C) => C.target);
        for (const C of m)
          await r.prepare(e.buildD1CreateTableSql(C, C, { ifNotExists: !0 })).run(), u.push({
            kind: "create_table",
            target: C
          });
        const p = f.filter((C) => C.kind === "rebuild_table").map((C) => C.target), g = f.find((C) => C.kind === "recreate_log_table" && C.target === e.LOGS_TABLE), h = [];
        for (const C of f.filter((v) => v.kind === "add_column")) {
          const [v, B] = String(C.target || "").split(".", 2), P = e.getD1RuntimeColumnAdditions()?.[v]?.[B];
          if (!P) throw new Error(`Unknown D1 column addition: ${C.target}`);
          await r.prepare(`ALTER TABLE ${de(v)} ADD COLUMN ${de(B)} ${P}`).run(), h.push(C.target), u.push({
            kind: "add_column",
            target: C.target
          });
        }
        for (const C of p)
          l.push(await e.rebuildD1TableWithShadow(r, C, s)), u.push({
            kind: "rebuild_table",
            target: C
          });
        g && (l.push(await e.recreateD1LogsDestructively(r, s)), u.push({
          kind: "recreate_log_table",
          target: e.LOGS_TABLE
        }));
        const y = g ? Object.entries(e.getD1RuntimeIndexContract()).filter(([, C]) => C.table === e.LOGS_TABLE).map(([C]) => C) : [], _ = {
          createdIndexes: [],
          repairedIndexes: []
        };
        for (const C of f.filter((v) => v.kind === "create_index" || v.kind === "repair_index")) {
          const v = e.getD1RuntimeIndexContract()?.[C.target];
          if (!v) throw new Error(`Unknown D1 runtime index: ${C.target}`);
          C.kind === "repair_index" && await r.prepare(`DROP INDEX IF EXISTS ${de(C.target)}`).run(), await r.prepare(v.createSql).run(), _[C.kind === "repair_index" ? "repairedIndexes" : "createdIndexes"].push(C.target), u.push({
            kind: C.kind,
            target: C.target
          });
        }
        const S = [];
        for (const C of f.filter((v) => v.kind === "create_unique_index")) {
          const v = e.getD1UniqueIndexContract()?.[C.target];
          if (!v) throw new Error(`Unknown D1 unique index: ${C.target}`);
          await r.prepare(v.createSql).run(), S.push(C.target), u.push({
            kind: C.kind,
            target: C.target
          });
        }
        let A = {
          rebuilt: !1,
          recreated: !1
        };
        const b = f.find((C) => C.target === e.LOGS_FTS_TABLE);
        b && t.includeFts !== !1 && (A = await e.ensureLogsFtsSchema(r, {
          forceRecreate: !0,
          baseSchemaReady: !0
        })), A?.rebuilt === !0 && u.push({
          kind: String(b?.kind || "create_fts"),
          target: e.LOGS_FTS_TABLE
        }), e.invalidateD1SchemaReadiness(r, "all");
        const R = await e.getD1SchemaSnapshot(r), T = await e.getD1SchemaStatus(r, { snapshot: R }), L = ie(ee(R.objects || [])), D = (T.schemaReady ? null : await e.buildD1SchemaRepairPlan(r))?.phase === "destructive";
        if (!T.schemaReady && !D) {
          const C = /* @__PURE__ */ new Error("D1 schema repair did not produce the current contract");
          throw C.code = "D1_SCHEMA_REPAIR_FAILED", C.status = 503, C.details = {
            phase: "final_status",
            issues: T.issues
          }, C;
        }
        const E = l.filter((C) => C?.backupTable);
        E.length && await r.batch(E.map((C) => r.prepare(`DROP TABLE IF EXISTS ${de(C.backupTable)}`)));
        let w = {
          written: !1,
          reason: "pending_high_risk"
        };
        T.schemaReady && (s.phase === "ready" ? w = (await e.verifyD1SchemaAttestation(r, t.env)).valid ? {
          written: !1,
          reused: !0,
          contractVersion: ot,
          contractHash: s.contractHash
        } : await e.writeVerifiedD1SchemaMeta(r, t.env, {
          ...s,
          schemaFingerprint: L
        }) : w = await e.writeVerifiedD1SchemaMeta(r, t.env, {
          ...s,
          schemaFingerprint: L
        }));
        const N = /* @__PURE__ */ new Set([...Object.keys(e.getD1CurrentSchemaContract().columns), e.LOGS_FTS_TABLE]), O = R.objects.filter((C) => C?.type === "table").map((C) => String(C?.name || "")).filter((C) => N.has(C) && !i.has(C));
        return {
          profile: a,
          phase: s.phase,
          completed: T.schemaReady,
          pendingHighRisk: D,
          schemaReady: T.schemaReady,
          contractVersion: ot,
          contractHash: s.contractHash,
          planHash: s.planHash,
          risk: s.risk,
          createdTables: O,
          addedColumns: h,
          createdIndexes: [..._.createdIndexes, ...y],
          repairedIndexes: _.repairedIndexes,
          uniqueIndexesCreated: S,
          rebuiltTables: l.map(({ table: C, rowCount: v, rowCountMeasured: B, discardedRows: P, discardedRowsIsLowerBound: I, willDiscardData: M, dataMode: x }) => M ? {
            table: C,
            rowCount: v,
            rowCountMeasured: B,
            discardedRows: P,
            discardedRowsIsLowerBound: I,
            allowsDataLoss: !0,
            willDiscardData: !0,
            dataMode: x
          } : {
            table: C,
            rowCount: v
          }),
          ftsRebuilt: A?.rebuilt === !0,
          ftsRecreated: g ? !0 : A?.recreated === !0 && s.status?.fts?.tableReady === !0,
          recoveryBookmark: String(c?.bookmark || ""),
          bookmarkCapturedAt: String(c?.capturedAt || ""),
          schemaMeta: w,
          steps: s.steps.map((C) => ({
            ...C,
            ready: u.some((v) => v.kind === C.kind && v.target === C.target) || T.schemaReady
          })),
          status: T
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
          ...k(f.details) ? f.details : {},
          executedSteps: u,
          remainingIssues: m,
          recoveryBookmark: String(c?.bookmark || ""),
          bookmarkCapturedAt: String(c?.capturedAt || "")
        }), String(f?.code || "").startsWith("D1_SCHEMA_REPAIR_")) throw f;
        const p = new Error(ce(f, "D1 schema repair failed"));
        throw p.code = "D1_SCHEMA_REPAIR_FAILED", p.status = 503, p.details = {
          ...k(f?.details) ? f.details : {},
          phase: "execution"
        }, p;
      } finally {
        d && await e.releaseD1SchemaRepairLease(r, d).catch(() => {
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
      const a = ne.LogsReadinessProbeCache.get(r), o = Math.max(1e3, Number(t.maxAgeMs) || 15e3);
      if (t.force !== !0 && a && H() - a.ts < o) return a.data;
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
      return ne.LogsReadinessProbeCache.set(r, {
        ts: H(),
        data: l
      }), l;
    },
    async resolveLogsReadiness(r, t = {}) {
      const a = e.resolveOpsStatusStores(r), o = await e.getOpsStatusSection(a, "log"), s = o?.schemaReady === !0, i = o?.ftsReady === !0, c = o?.statsReady === !0;
      return s && c && (i || t.requireFts !== !0) || !a.db ? {
        schemaReady: s,
        ftsReady: i,
        statsReady: c,
        revision: e.getLogsRevisionFromStatus(o),
        source: "status",
        logStatus: o
      } : {
        ...await e.probeLogsReadiness(a.db, t),
        revision: e.getLogsRevisionFromStatus(o),
        source: "probe",
        logStatus: o
      };
    }
  };
}
function Ag(n = {}, e = {}) {
  return {
    async ensureLogsBaseSchema(r) {
      if (!r) return !1;
      if (e.isD1SchemaReadyCached(r, "logsBaseSchema")) return !0;
      let t = J.LogsBaseDbReady.get(r);
      t || (t = (async () => (await r.prepare(`CREATE TABLE IF NOT EXISTS ${e.LOGS_TABLE} (id INTEGER PRIMARY KEY AUTOINCREMENT, timestamp INTEGER NOT NULL, node_name TEXT NOT NULL, request_path TEXT NOT NULL, request_method TEXT NOT NULL, status_code INTEGER NOT NULL, response_time INTEGER NOT NULL, client_ip TEXT NOT NULL, inbound_colo TEXT, outbound_colo TEXT, user_agent TEXT, referer TEXT, category TEXT DEFAULT 'api', error_detail TEXT, detail_json TEXT, created_at TEXT NOT NULL, inbound_ip TEXT, outbound_ip TEXT)`).run(), await r.prepare(`CREATE INDEX IF NOT EXISTS idx_proxy_logs_timestamp ON ${e.LOGS_TABLE} (timestamp)`).run(), await r.prepare(`CREATE INDEX IF NOT EXISTS idx_proxy_logs_client_time ON ${e.LOGS_TABLE} (client_ip, timestamp DESC)`).run(), await r.prepare(`CREATE INDEX IF NOT EXISTS idx_proxy_logs_status_time ON ${e.LOGS_TABLE} (status_code, timestamp)`).run(), await r.prepare(`CREATE INDEX IF NOT EXISTS idx_proxy_logs_category_time ON ${e.LOGS_TABLE} (category, timestamp)`).run(), e.markD1SchemaReady(r, "logsBaseSchema"), e.markD1SchemaReady(r, "logsTableExists"), ne.LogsReadinessProbeCache.delete(r), !0))().catch((a) => {
        throw J.LogsBaseDbReady.delete(r), a;
      }), J.LogsBaseDbReady.set(r, t));
      try {
        return await t;
      } finally {
        J.LogsBaseDbReady.get(r) === t && J.LogsBaseDbReady.delete(r);
      }
    },
    async ensureStatsHourlySchema(r) {
      if (!r) return !1;
      if (e.isD1SchemaReadyCached(r, "statsHourlySchema")) return !0;
      let t = J.StatsHourlyDbReady.get(r);
      t || (t = r.prepare(`CREATE TABLE IF NOT EXISTS ${e.STATS_HOURLY_TABLE} (
              bucket_date TEXT NOT NULL,
              bucket_hour INTEGER NOT NULL,
              request_count INTEGER NOT NULL DEFAULT 0,
              play_count INTEGER NOT NULL DEFAULT 0,
              playback_info_count INTEGER NOT NULL DEFAULT 0,
              updated_at TEXT NOT NULL,
              PRIMARY KEY (bucket_date, bucket_hour)
            )`).run().then(() => (e.markD1SchemaReady(r, "statsHourlySchema"), e.markD1SchemaReady(r, "statsTableExists"), ne.LogsReadinessProbeCache.delete(r), !0)).catch((a) => {
        throw J.StatsHourlyDbReady.delete(r), a;
      }), J.StatsHourlyDbReady.set(r, t));
      try {
        return await t;
      } finally {
        J.StatsHourlyDbReady.get(r) === t && J.StatsHourlyDbReady.delete(r);
      }
    }
  };
}
function Cg(n = {}, e = {}) {
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
      ]), J.LogsBaseDbReady.delete(r), J.StatsHourlyDbReady.delete(r), ne.LogsReadinessProbeCache.delete(r)), a === "all") {
        e.clearD1SchemaReady(r);
        const o = J.OpsStatusShadowCache.get(r);
        o?.payloadCache instanceof Map && o.payloadCache.clear(), J.AdminShellStatusWriteState.delete(r), J.DnsIpWorkspaceDbReady.delete(r), J.OpsStatusDbReady.delete(r), J.ScheduledLeaseDbReady.delete(r), J.AuthFailuresDbReady.delete(r), J.CfDashboardCacheDbReady.delete(r), J.CfRuntimeCacheDbReady.delete(r);
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
      const o = [
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
      }], i = a === "runtime-core" ? o : a === "logs-fts" ? [
        ...o,
        ...s,
        {
          name: "ensureLogsFtsSchema",
          run: () => e.ensureLogsFtsSchema(r)
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
        u.name === "ensureLogsFtsSchema" && k(d) && (l = {
          migratedRows: Math.max(0, Number(d.migratedRows) || 0),
          droppedTriggers: Math.max(0, Number(d.droppedTriggers) || 0),
          rebuilt: d.rebuilt === !0,
          recreated: d.recreated === !0
        }), c.push({
          name: u.name,
          ready: u.name === "ensureLogsFtsSchema" ? await e.isLogsFtsReady(r) : d === !0
        });
      }
      return ne.LogsReadinessProbeCache.delete(r), {
        profile: a,
        runtimeTablesReady: o.every((u) => c.some((d) => d.name === u.name && d.ready === !0)),
        schemaReady: await e.hasLogsBaseTable(r),
        statsReady: await e.hasStatsHourlyTable(r),
        ftsReady: await e.isLogsFtsReady(r),
        ftsResult: l,
        steps: c
      };
    }
  };
}
function wg(n = {}, e = {}) {
  return {
    ...Rg(n, e),
    ...Tg(n, e),
    ...Ag(n, e),
    ...Cg(n, e)
  };
}
function Lg() {
  const n = {
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
      ].filter(([o]) => o === !0).map(([, o, s, i, c, l, u]) => ({
        key: o,
        summaryKey: s,
        stepName: i,
        tableName: c,
        whereClause: l,
        bindParams: u,
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
    async runBudgetedDeleteScopes(e = [], r = {}, t = async (o) => {
    }, a = {}) {
      const o = Number(a.startedAt) || H();
      let s = 0, i = "", c = [...e];
      for (; c.length > 0 && !i; ) {
        const d = [];
        for (const f of c) {
          if (s >= Pa) {
            i = "row_limit";
            break;
          }
          if (H() - o >= xr) {
            i = "time_limit";
            break;
          }
          await t(f.stepName);
          const m = Math.min(ts, Pa - s), p = await f.db.prepare(`DELETE FROM ${f.tableName} WHERE rowid IN (SELECT rowid FROM ${f.tableName} WHERE ${f.whereClause} ORDER BY rowid LIMIT ?)`).bind(...f.bindParams, m).run(), g = n.readChanges(p);
          s += g, r[f.summaryKey] = Math.max(0, Number(r[f.summaryKey]) || 0) + g, g >= m && d.push(f);
        }
        c = d;
      }
      const l = [];
      for (const d of e) await n.hasScopeRows(d) && l.push(d.key);
      const u = Math.max(0, H() - o);
      return !i && l.length > 0 && (i = u >= xr ? "time_limit" : s >= Pa ? "row_limit" : ""), {
        hasMore: l.length > 0,
        remainingScopes: l,
        budget: {
          batchSize: ts,
          rowLimit: Pa,
          timeLimitMs: xr,
          processedRows: s,
          durationMs: u,
          exhaustedBy: i || null
        }
      };
    },
    async patchLogStatus(e, r, t, a, o, s, i = {}) {
      const c = (/* @__PURE__ */ new Date()).toISOString(), l = String(a?.mode || i.mode || "manual").trim().toLowerCase() === "scheduled" ? "scheduled" : "manual", u = {
        schemaReady: !0,
        ftsReady: !0,
        statsReady: !0,
        categoryEnabled: !0
      };
      return (s.rebuildStatsHourly !== !0 || o.alignedStatsWindow === !0) && (u.statsUtcOffsetMinutes = a.statsUtcOffsetMinutes ?? a.utcOffsetMinutes), (o.rebuiltStatsHourly === !0 || o.alignedStatsWindow === !0) && (u.statsAlignedAt = c, u.statsAlignedWindowStartAt = new Date((l === "scheduled" ? a.statsStartTs : a.retentionCutoffMs) || a.retentionCutoffMs).toISOString(), u.statsAlignedWindowEndAt = new Date((l === "scheduled" ? a.statsEndTs : a.nowMs) || a.nowMs).toISOString()), l === "scheduled" && s.deleteExpiredLogs === !0 && Number(o.deletedExpiredLogCount) > 0 ? await e.bumpLogsRevision(t, u, i.ctx).catch(() => {
      }) : await he(e.patchOpsStatus(t, { log: u }, i.ctx), "d1_tidy.patch_log_status", { mode: l }, null), c;
    }
  };
  return n;
}
function Dg() {
  return {
    async readBoundedCount(n, e, r = "", t = []) {
      const a = String(r || "").trim(), o = `SELECT COUNT(*) AS total FROM (SELECT 1 FROM ${e}${a ? ` WHERE ${a}` : ""} LIMIT ${xa + 1})`, s = await n.prepare(o).bind(...t).first(), i = Math.max(0, Number(s?.total ?? s?.count) || 0);
      return {
        count: Math.min(xa, i),
        countIsLowerBound: i >= xa,
        exceedsLimit: i > xa
      };
    },
    buildContext(n = {}, e = {}) {
      const r = String(e.mode || "manual").trim().toLowerCase() === "scheduled" ? "scheduled" : "manual", t = st(e.maintenanceMode, r), a = e.scheduledNow instanceof Date ? new Date(e.scheduledNow.getTime()) : new Date(e.scheduledNow || H()), o = Number(e.nowMs) || (r === "scheduled" ? a.getTime() : H()), s = ue(n.logRetentionDays, F.Defaults.LogRetentionDays, 1, F.Defaults.LogRetentionDaysMax), i = Math.max(0, o - s * 24 * 60 * 60 * 1e3), c = ze(n.scheduleUtcOffsetMinutes), l = k(e.dayWindow) ? e.dayWindow : pt(a, n.scheduleUtcOffsetMinutes);
      return {
        mode: r,
        maintenanceMode: t,
        runtimeConfig: n,
        scheduledNow: a,
        nowTimestamp: o,
        retentionDays: s,
        retentionCutoffMs: i,
        utcOffsetMinutes: c,
        dayWindow: l,
        statsBucketDate: String(e.statsBucketDate || l?.dateKey || "").trim(),
        statsStartTs: Number(e.statsStartTs ?? l?.startTs) || 0,
        statsEndTs: Number(e.statsEndTs ?? l?.endTs) || 0,
        statsUtcOffsetMinutes: ze(e.statsUtcOffsetMinutes ?? l?.utcOffsetMinutes ?? n.scheduleUtcOffsetMinutes),
        previousScheduledState: k(e.previousScheduledState) ? e.previousScheduledState : {},
        previousD1State: null,
        lastFtsRebuildAt: "",
        lastOptimizeAt: ""
      };
    },
    attachPreviousState(n, e, r = null) {
      const t = n.getPreviousD1TidyState(e.previousScheduledState, r), a = typeof t.lastFtsRebuildAt == "string" ? t.lastFtsRebuildAt : "", o = typeof t.lastOptimizeAt == "string" ? t.lastOptimizeAt : "";
      return {
        ...e,
        previousD1State: t,
        lastFtsRebuildAt: a,
        lastOptimizeAt: o || (typeof t.lastVacuumAt == "string" ? t.lastVacuumAt : "")
      };
    },
    async readFacts(n, e, r, t) {
      const a = await this.readBoundedCount(e, n.LOGS_TABLE, "timestamp < ?", [t.retentionCutoffMs]), o = await this.readBoundedCount(e, n.LOGS_TABLE, "timestamp >= ?", [t.retentionCutoffMs]), s = await this.readBoundedCount(e, n.SCHEDULED_LOCKS_TABLE, "expires_at <= ?", [t.nowTimestamp]), i = await this.readBoundedCount(e, n.DNS_IP_POOL_FETCH_CACHE_TABLE, "expires_at <= ?", [t.nowTimestamp]), c = await this.readBoundedCount(e, n.DNS_IP_PROBE_CACHE_TABLE, "expires_at <= ?", [t.nowTimestamp]), l = await this.readBoundedCount(e, n.AUTH_FAILURES_TABLE, "expires_at <= ?", [t.nowTimestamp]), u = await this.readBoundedCount(e, n.CF_DASH_CACHE_TABLE, "expires_at <= ?", [t.nowTimestamp]), d = await this.readBoundedCount(e, n.CF_RUNTIME_CACHE_TABLE, "expires_at <= ?", [t.nowTimestamp]), f = await this.readBoundedCount(e, n.STATS_HOURLY_TABLE), m = Dt(t.retentionCutoffMs, t.utcOffsetMinutes).dateKey, p = await this.readBoundedCount(e, n.STATS_HOURLY_TABLE, "bucket_date < ?", [m]), g = await this.readBoundedCount(e, n.DNS_IP_POOL_ITEMS_TABLE), h = await this.readBoundedCount(e, n.DNS_IP_POOL_SOURCES_TABLE), y = await this.readBoundedCount(e, n.SYS_STATUS_TABLE), _ = await n.getOpsStatusSection({
        db: e,
        kv: r
      }, "log");
      return {
        deletedExpiredLogCount: a.count,
        preservedLogCount: o.count,
        preservedLogCountExceedsLimit: o.exceedsLimit,
        deletedExpiredLockCount: s.count,
        deletedExpiredFetchCacheCount: i.count,
        deletedExpiredProbeCacheCount: c.count,
        deletedExpiredAuthFailureCount: l.count,
        deletedExpiredDashboardCacheCount: u.count,
        deletedExpiredRuntimeCacheCount: d.count,
        deletedExpiredStatsHourlyCount: p.count,
        statsRetentionBoundaryDate: m,
        statsHourlyRowCount: f.count,
        dnsIpPoolItemCount: g.count,
        dnsIpPoolSourceCount: h.count,
        sysStatusCount: y.count,
        statsUtcOffsetMinutes: n.getStatsUtcOffsetMinutesFromStatus(_),
        countLowerBounds: {
          proxy_logs: a.countIsLowerBound,
          proxy_logs_retained: o.countIsLowerBound,
          proxy_logs_fts: o.countIsLowerBound,
          sys_locks: s.countIsLowerBound,
          dns_ip_pool_fetch_cache: i.countIsLowerBound,
          dns_ip_probe_cache: c.countIsLowerBound,
          auth_failures: l.countIsLowerBound,
          cf_dashboard_cache: u.countIsLowerBound,
          cf_runtime_cache: d.countIsLowerBound,
          proxy_stats_hourly: f.countIsLowerBound || p.countIsLowerBound,
          dns_ip_pool_items: g.countIsLowerBound,
          sys_status: y.countIsLowerBound
        },
        ftsReady: t.schemaStatus?.schemaReady === !0 || await n.isLogsFtsReady(e),
        d1DnsIpPoolSources: await n.getDnsIpPoolSourcesFromDb(e, { schemaReady: t.schemaStatus?.schemaReady === !0 }),
        kvDnsIpPoolSources: []
      };
    },
    buildSourcePolicy(n = []) {
      return {
        dnsIpPoolSourceAction: Array.isArray(n) && n.length > 0 ? "preserve_d1_primary" : "noop",
        skipDnsIpPoolSourceCleanup: !0
      };
    },
    buildFlags(n, e, r, t) {
      const a = r.deletedExpiredLogCount > 0, o = Of(e.maintenanceMode, e.mode), s = n.shouldRunLogsFtsRebuild(e.lastFtsRebuildAt, { nowMs: e.nowTimestamp }), i = (!r.ftsReady || o || a) && s, c = r.preservedLogCount > Du || r.preservedLogCountExceedsLimit === !0, l = i && !c, u = o ? !0 : a && n.shouldRunLogsOptimize(e.lastOptimizeAt, { nowMs: e.nowTimestamp }), d = o || r.statsUtcOffsetMinutes !== e.utcOffsetMinutes;
      return {
        deleteExpiredLogs: a,
        deleteExpiredLocks: r.deletedExpiredLockCount > 0,
        deleteExpiredFetchCache: r.deletedExpiredFetchCacheCount > 0,
        deleteExpiredProbeCache: r.deletedExpiredProbeCacheCount > 0,
        deleteExpiredAuthFailures: r.deletedExpiredAuthFailureCount > 0,
        deleteExpiredDashboardCache: r.deletedExpiredDashboardCacheCount > 0,
        deleteExpiredRuntimeCache: r.deletedExpiredRuntimeCacheCount > 0,
        deleteExpiredStatsHourly: r.deletedExpiredStatsHourlyCount > 0,
        rebuildStatsHourly: d,
        rebuildLogsFts: l,
        rebuildLogsFtsDeferred: i && !l,
        ftsRebuildDeferredReason: c ? "deferred_size_guard" : "",
        rebuildLogsFtsForceRecreate: !1,
        optimizeDb: u,
        optimizeDbDeferred: e.mode === "scheduled" && a && u !== !0,
        alignStatsWindow: d,
        rebuildDailyStats: !1,
        processDnsIpPoolSources: !1
      };
    },
    buildPreview(n, e, r, t) {
      const a = [], o = jd(e.d1DnsIpPoolSources);
      Ee(a, e.deletedExpiredLogCount > 0, "proxy_logs", "超保留期 proxy_logs 日志", [], e.deletedExpiredLogCount, `只会删除早于 ${new Date(n.retentionCutoffMs).toISOString()} 的日志。`), Ee(a, e.deletedExpiredLockCount > 0, "sys_locks", "过期 sys_locks 定时租约", [], e.deletedExpiredLockCount, "只会删除 expires_at 已过期的租约记录。"), Ee(a, e.deletedExpiredFetchCacheCount > 0, "dns_ip_pool_fetch_cache", "过期 dns_ip_pool_fetch_cache 聚合缓存", [], e.deletedExpiredFetchCacheCount, "只会删除 expires_at 已过期的 API 抓取聚合缓存。"), Ee(a, e.deletedExpiredProbeCacheCount > 0, "dns_ip_probe_cache", "过期 dns_ip_probe_cache 探测缓存", [], e.deletedExpiredProbeCacheCount, "只会删除 expires_at 已过期的探测缓存。"), Ee(a, e.deletedExpiredAuthFailureCount > 0, "auth_failures", "过期 auth_failures 登录失败计数", [], e.deletedExpiredAuthFailureCount, "只会删除 expires_at 已过期的登录失败计数。"), Ee(a, e.deletedExpiredDashboardCacheCount > 0, "cf_dashboard_cache", "过期 cf_dashboard_cache 仪表盘缓存", [], e.deletedExpiredDashboardCacheCount, "只会删除 expires_at 已过期的仪表盘缓存。"), Ee(a, e.deletedExpiredRuntimeCacheCount > 0, "cf_runtime_cache", "过期 cf_runtime_cache 运行缓存", [], e.deletedExpiredRuntimeCacheCount, "只会删除 expires_at 已过期的运行缓存。"), Ee(a, e.deletedExpiredStatsHourlyCount > 0, "proxy_stats_hourly_expired", "过期 proxy_stats_hourly 日期桶", [], e.deletedExpiredStatsHourlyCount, `只删除早于边界日 ${e.statsRetentionBoundaryDate} 的统计桶。`);
      const s = [
        lt("proxy_stats_hourly", "proxy_stats_hourly 统计表", [], {
          count: Math.max(1, e.statsHourlyRowCount),
          note: t.rebuildStatsHourly ? `会清空当前统计（当前行数 ${e.statsHourlyRowCount}），并从后续新日志重新累计，不扫描历史日志。` : `保留当前统计，仅分页删除保留期边界前的日期桶（当前行数 ${e.statsHourlyRowCount}）。`
        }),
        lt("proxy_logs_fts", "proxy_logs_fts 全文索引", [], {
          count: Math.max(1, e.preservedLogCount),
          note: t.ftsRebuildDeferredReason === "deferred_size_guard" ? "基础日志超过 10000 行，本轮不会自动 rebuild。" : e.ftsReady ? "仅在无清理积压、预算有余量且满足最小间隔时重建。" : "当前未检测到 FTS 表，整理时会按资源预算决定是否补建。"
        }),
        lt("scheduled_d1_tidy", "scheduled.d1Tidy 运行状态", ["scheduled.d1Tidy"], {
          count: 1,
          note: "整理完成后会写入一份新的运行状态摘要。"
        })
      ], i = [
        lt("proxy_logs_retained", "保留期内 proxy_logs 日志", [], {
          count: e.preservedLogCount,
          note: `会保留最近 ${n.retentionDays} 天的日志。`
        }),
        lt("dns_ip_pool_items", "dns_ip_pool_items 共享 IP 池", [], {
          count: e.dnsIpPoolItemCount,
          note: "不会删除 dns_ip_pool_items。"
        }),
        lt("sys_status", "sys_status 运行状态", [], {
          count: e.sysStatusCount,
          note: "不会删除 sys_status 中的有效运行状态。"
        })
      ];
      Ee(i, e.d1DnsIpPoolSources.length > 0, "dns_ip_pool_sources_d1_primary", "dns_ip_pool_sources 主数据", o, e.d1DnsIpPoolSources.length, "dns_ip_pool_sources 现在是正式主数据，本次不会迁回 KV，也不会清空该表。");
      const c = { proxy_stats_hourly_expired: "proxy_stats_hourly" };
      for (const d of [
        ...a,
        ...s,
        ...i
      ]) {
        const f = c[d.key] || d.key;
        e.countLowerBounds?.[f] === !0 && (d.countIsLowerBound = !0);
      }
      const l = [], u = Math.max(0, Number(n.logQueuePendingCount) || 0);
      return u > 0 && l.push(`执行前会先尝试 flush ${u} 条内存日志，再开始清理 D1。`), l.push(n.maintenanceMode === "full" ? "当前为 full 维护模式；统计会清空后重新累计，FTS 与 optimize 仍受大小、积压、间隔和时间预算约束。" : "当前为 smart 维护模式，只在检测到必要条件且预算允许时执行较重的统计、FTS 与 optimize。"), a.length === 0 && l.push(n.mode === "scheduled" ? "当前定时 D1 维护没有检测到需要删除的旧数据，本轮会按计划检查统计与索引维护。" : "当前没有检测到需要删除的 D1 旧数据；本次主要会执行统计表与 FTS 维护。"), {
        scope: "d1",
        fieldGroups: [],
        deleteGroups: a,
        rewriteGroups: s,
        preserveGroups: i,
        warnings: l
      };
    },
    buildSummary(n, e, r, t = {}) {
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
        deletedExpiredStatsHourlyCount: e.deletedExpiredStatsHourlyCount,
        rebuiltStatsHourly: t.rebuildStatsHourly === !0,
        rebuiltLogsFts: t.rebuildLogsFts === !0,
        alignedStatsWindow: t.alignStatsWindow === !0,
        migratedDnsIpPoolSourcesToKvCount: 0,
        clearedLegacyDnsIpPoolSourcesCount: 0,
        preservedDnsIpPoolItemCount: e.dnsIpPoolItemCount,
        preservedDnsIpPoolSourceCount: e.dnsIpPoolSourceCount,
        preservedSysStatusCount: e.sysStatusCount,
        logQueuePendingCount: Math.max(0, Number(n.logQueuePendingCount) || 0),
        dnsIpPoolSourceAction: r.dnsIpPoolSourceAction,
        lastFtsRebuildAt: n.lastFtsRebuildAt,
        lastOptimizeAt: n.lastOptimizeAt
      };
    }
  };
}
var Ng = Object.freeze({
  PREFIX: "node:",
  CONFIG_KEY: "sys:theme",
  NODES_INDEX_KEY: "sys:nodes_index:v1",
  NODES_SUMMARY_INDEX_KEY: "sys:nodes_index_full:v2",
  ADMIN_INDEX_UPLOAD_PREFIX: cu,
  ADMIN_ACTIVE_INDEX_KEY: lu,
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
function Ig(n = {}) {
  const { nodeRepository: e } = n;
  return {
    async getNodesList(r, t) {
      const a = e.getKV(r);
      if (!a) return [];
      const o = _e(a);
      if (o.NodesListCache && o.NodesListCache.exp > H()) return o.NodesListCache.data;
      const s = await e.getNodesSummaryIndex(a, { ctx: t });
      if (Array.isArray(s)) return s;
      const i = await e.rebuildNodeIndexesFromKv(a, { ctx: t });
      return Array.isArray(i?.summaries) ? i.summaries : [];
    },
    async getNodesListStrict(r, t) {
      const a = e.getKV(r);
      if (!a) return [];
      const o = _e(a);
      if (o.NodesListCache && o.NodesListCache.exp > H()) return o.NodesListCache.data;
      const s = await e.getNodesSummaryIndexStrict(a, { ctx: t });
      if (Array.isArray(s)) return s;
      const i = await e.rebuildNodeIndexesFromKvStrict(a, { ctx: t });
      return Array.isArray(i?.summaries) ? i.summaries : [];
    },
    async invalidateList(r, t = null) {
      const a = e.getKV(t), o = _e(a);
      o.NodesListCache = null, o.NodesIndexCache = null, cr(a);
    },
    maybeCleanup(r = null) {
      const t = r ? _e(e.getKV(r)) : gt.current(), a = H(), o = t.CleanupState;
      if (a - (o.lastRunAt || 0) < F.Defaults.CleanupMinIntervalMs) return;
      o.lastRunAt = a;
      const s = F.Defaults.CleanupBudgetMs, i = F.Defaults.CleanupChunkSize, c = o.iterators || (o.iterators = {
        node: null,
        playbackRoute: null,
        crypto: null,
        rate: null,
        log: null,
        playbackInfo: null,
        failover: null,
        progress: null,
        monthlyTraffic: null
      }), l = a, u = (d, f, m, p = c, g = (h) => d.delete(h)) => {
        let h = p[m];
        h || (h = d.entries(), p[m] = h);
        let y = 0;
        for (; y < i && (y === 0 || H() - l < s); ) {
          const _ = h.next();
          if (_.done) {
            p[m] = null;
            break;
          }
          y += 1;
          const [S, A] = _.value;
          d.has(S) && f(A, a) && g(S);
        }
      };
      if (o.phase === 0)
        u(t.NodeCache, (d) => d?.exp && d.exp < a, "node", t.CleanupIterators), o.phase = 1;
      else if (o.phase === 1)
        u(t.PlaybackRouteHotCache, (d) => !d || Number(d.expiresAt) <= a, "playbackRoute", t.CleanupIterators), o.phase = 2;
      else if (o.phase === 2)
        u(ne.CryptoKeyCache, (d) => d?.exp && d.exp < a, "crypto"), o.phase = 3;
      else if (o.phase === 3)
        u(Qe.RateLimitCache, (d) => !d || d.resetAt < a, "rate"), o.phase = 4;
      else if (o.phase === 4) o.phase = 5;
      else if (o.phase === 5)
        u(ne.PlaybackInfoResponseCache, (d) => !d || (Number(d.expiresAt) || 0) <= a, "playbackInfo"), o.phase = 6;
      else if (o.phase === 6)
        u(ne.ProxyFailoverStateCache, (d) => {
          if (!d || typeof d != "object") return !0;
          if (d.failingTargets instanceof Map)
            for (const [y, _] of d.failingTargets) Number(_) <= a && d.failingTargets.delete(y);
          const f = Number(d.preferredTargetExpiresAt) > a, m = d.failingTargets instanceof Map && d.failingTargets.size > 0, p = !!d.inFlightProbe && Number(d.inFlightProbe.expiresAt) > a, g = Number(d.lastProbeResult?.completedAt) || 0, h = !!d.lastProbeResult && g + F.Defaults.HedgePreferredTtlSec * 1e3 > a;
          return !f && !m && !p && !h;
        }, "failover"), o.phase = 7;
      else if (o.phase === 7) {
        const d = Math.max(3e4, Math.max(1, Number(F.Defaults.VideoProgressForwardIntervalSec) || 1) * 2e4);
        u(ne.PlaybackProgressRelay, (f) => {
          if (!f || f.pendingSnapshot || f.activeFlushPromise) return !f;
          const m = Number(f.terminalTombstoneUntil) || 0;
          if (m > 0) return m < a;
          const p = Number(f.lastTouchedAt || f.lastForwardAt) || 0;
          return p > 0 && p + d <= a;
        }, "progress", c, Zt), o.phase = 8;
      } else
        u(ne.DashboardMonthlyTrafficCache, (d) => !d || (Number(d.staleUntil) || 0) <= a, "monthlyTraffic"), o.phase = 0;
    }
  };
}
function Mg(n = {}, e = {}) {
  const {} = n;
  return {
    normalizeNodeIndex(r = []) {
      return [...new Set((Array.isArray(r) ? r : []).map((t) => String(t || "").toLowerCase().trim()).filter(Boolean))];
    },
    normalizeNodeSummaryPayload(r, t = {}) {
      if (!k(t)) return null;
      const a = String(r || t.name || "").toLowerCase().trim();
      if (!a) return null;
      const o = e.normalizeLines(t.lines, t.target, t.port).slice(0, Bn);
      if (!o.length) return null;
      const s = e.resolveActiveLineId(t.activeLineId, o, Array.isArray(t.lines) ? t.lines : [], t.port), i = nr(t.entryMode);
      return {
        name: a,
        cacheRevision: ao(a, t),
        displayName: String(t.displayName ?? ""),
        entryMode: i,
        hostPrefixCnameTarget: i === "host_prefix" ? Wt(t.hostPrefixCnameTarget) : "",
        secret: i === "host_prefix" ? "" : String(t.secret ?? ""),
        tag: Kr(t.tags, t.tag)[0] || "",
        tags: Kr(t.tags, t.tag),
        tagColor: String(t.tagColor ?? ""),
        remark: String(t.remark ?? ""),
        lines: o.map((c) => ({
          id: String(c.id || "").trim(),
          name: String(c.name || "").trim(),
          target: String(c.target || "").trim()
        })),
        activeLineId: s,
        playbackInfoMode: Mr(t.playbackInfoMode),
        mediaAuthMode: ar(t.mediaAuthMode),
        realClientIpMode: Ir(t.realClientIpMode),
        hedgeProbePath: ca(t.hedgeProbePath),
        routingDecisionMode: vr(t.routingDecisionMode),
        mainVideoStreamMode: on(t.mainVideoStreamMode ?? t.wangpanDirectMode ?? t.wangpanMode)
      };
    },
    buildComparableNodeSummary(r = {}) {
      return e.normalizeNodeSummaryPayload(r?.name, r);
    },
    areNodeSummariesEquivalent(r = {}, t = {}) {
      return ee(e.buildComparableNodeSummary(r)) === ee(e.buildComparableNodeSummary(t));
    },
    hasLegacyNodeMirrorFields(r = {}) {
      return k(r) ? Object.prototype.hasOwnProperty.call(r, "headers") || Object.prototype.hasOwnProperty.call(r, "target") || Object.prototype.hasOwnProperty.call(r, "port") || Object.prototype.hasOwnProperty.call(r, "schemaVersion") || Object.prototype.hasOwnProperty.call(r, "createdAt") || Object.prototype.hasOwnProperty.call(r, "updatedAt") || Object.prototype.hasOwnProperty.call(r, "remarkColor") || Object.prototype.hasOwnProperty.call(r, "wangpanDirectMode") || Object.prototype.hasOwnProperty.call(r, "wangpanMode") || [...pn, ...gn].some((t) => Object.prototype.hasOwnProperty.call(r, t)) ? !0 : (Array.isArray(r.lines) ? r.lines : []).some((t) => k(t) ? Object.prototype.hasOwnProperty.call(t, "port") || Object.prototype.hasOwnProperty.call(t, "latencyMs") || Object.prototype.hasOwnProperty.call(t, "latencyUpdatedAt") : !1) : !1;
    },
    summaryEntryRequiresNodeEntityRebuild(r = {}) {
      if (!k(r) || e.hasLegacyNodeMirrorFields(r)) return !0;
      const t = Array.isArray(r.lines) ? r.lines : [], a = e.normalizeLines(t, r.target, r.port);
      if (!a.length || t.length !== a.length) return !0;
      for (let o = 0; o < a.length; o += 1) {
        const s = t[o], i = a[o];
        if (!k(s) || !k(i) || String(s.target || "").trim() !== String(i.target || "").trim()) return !0;
      }
      return String(r.activeLineId || "").trim() !== e.resolveActiveLineId(r.activeLineId, a, t, r.port);
    },
    buildNodeSummary(r, t = {}, a = {}) {
      const o = String(r || t.name || "").toLowerCase().trim();
      if (!o || !k(t)) return {
        summary: null,
        changed: !1,
        legacyMirrorDetected: !1
      };
      const s = e.normalizeNode(o, t, a), i = e.normalizeNodeSummaryPayload(o, s.data);
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
    normalizeNodeSummaryIndex(r = []) {
      const t = [], a = /* @__PURE__ */ new Set();
      let o = !1, s = !1, i = !1;
      for (const c of Array.isArray(r) ? r : []) {
        if (!k(c)) {
          o = !0, i = !0;
          continue;
        }
        const l = String(c.name || "").trim(), u = l.toLowerCase();
        if (!u || a.has(u)) {
          o = !0, i = !0;
          continue;
        }
        const { name: d, ...f } = c, m = e.buildNodeSummary(u, f);
        if (!m.summary) {
          o = !0, i = !0;
          continue;
        }
        (m.changed || l !== u) && (o = !0), m.legacyMirrorDetected && (s = !0), e.summaryEntryRequiresNodeEntityRebuild(f) && (i = !0), t.push(m.summary), a.add(u);
      }
      return {
        nodes: t,
        changed: o,
        legacyMirrorDetected: s,
        requiresRebuild: i
      };
    },
    primeNodeSummaryCaches(r = [], t = null) {
      const a = _e(t), o = Array.isArray(r) ? r.filter((i) => k(i) && i.name) : [], s = e.normalizeNodeIndex(o.map((i) => i.name));
      return a.NodesListCache = {
        data: o.map((i) => ({ ...i })),
        exp: H() + 6e4
      }, a.NodesIndexCache = {
        data: s,
        exp: H() + 6e4
      }, o;
    },
    async getNodesSummaryIndex(r, t = {}) {
      if (!r) return null;
      const a = _e(r);
      if (t.useCache !== !1 && a.NodesListCache?.exp > H() && Array.isArray(a.NodesListCache.data)) return a.NodesListCache.data;
      const o = a.NodesRevisionCacheGeneration;
      let s = null;
      try {
        s = await r.get(e.NODES_SUMMARY_INDEX_KEY, { type: "json" });
      } catch {
        return null;
      }
      if (a.NodesRevisionCacheGeneration !== o) return Array.isArray(s) ? e.normalizeNodeSummaryIndex(s).nodes : null;
      if (!Array.isArray(s)) return null;
      const i = e.normalizeNodeSummaryIndex(s);
      if (i.requiresRebuild === !0) {
        const c = await e.rebuildNodeIndexesFromKv(r, { ctx: t.ctx });
        return Array.isArray(c?.summaries) ? c.summaries : [];
      }
      return a.NodesRevisionCacheGeneration === o ? e.primeNodeSummaryCaches(i.nodes, r) : i.nodes;
    },
    async getNodesSummaryIndexStrict(r, t = {}) {
      if (!r) return null;
      const a = _e(r);
      if (t.useCache !== !1 && a.NodesListCache?.exp > H() && Array.isArray(a.NodesListCache.data)) return a.NodesListCache.data;
      const o = a.NodesRevisionCacheGeneration, s = await Me(r, e.NODES_SUMMARY_INDEX_KEY, { type: "json" });
      if (a.NodesRevisionCacheGeneration !== o) return Array.isArray(s) ? e.normalizeNodeSummaryIndex(s).nodes : [];
      if (!Array.isArray(s)) {
        const c = await e.rebuildNodeIndexesFromKvStrict(r, { ctx: t.ctx });
        return Array.isArray(c?.summaries) ? c.summaries : [];
      }
      const i = e.normalizeNodeSummaryIndex(s);
      if (i.requiresRebuild === !0) {
        const c = await e.rebuildNodeIndexesFromKvStrict(r, { ctx: t.ctx });
        return Array.isArray(c?.summaries) ? c.summaries : [];
      }
      return a.NodesRevisionCacheGeneration === o ? e.primeNodeSummaryCaches(i.nodes, r) : i.nodes;
    },
    async loadNodeSummariesForMutation(r, t = {}) {
      const a = await r.get(e.NODES_SUMMARY_INDEX_KEY, { type: "json" });
      if (Array.isArray(a)) {
        const o = e.normalizeNodeSummaryIndex(a);
        if (o.requiresRebuild !== !0) return o.nodes;
      }
      return (await e.loadAllNodeEntitiesFromKvStrict(r, { ctx: t.ctx })).map((o) => e.buildNodeSummary(o?.name, o).summary).filter(Boolean);
    },
    async commitNodesSummaryIndexMutation(r, t = {}) {
      const { kv: a, ctx: o, syncLegacyIndex: s = !1 } = t, i = e.normalizeNodeSummaryIndex(r).nodes, c = e.normalizeNodeIndex(i.map((g) => g.name)), l = e.buildNodesIndexMeta(c, i), u = await e.readRevisionMeta(a, e.NODES_INDEX_META_KEY, {
        count: 0,
        indexHash: "",
        fullIndexHash: ""
      }), d = [];
      (u.fullIndexHash !== l.fullIndexHash || !u.revision) && d.push(a.put(e.NODES_SUMMARY_INDEX_KEY, JSON.stringify(i))), s !== !1 && (u.indexHash !== l.indexHash || !u.revision) && d.push(a.put(e.NODES_INDEX_KEY, JSON.stringify(c)));
      const f = u.indexHash !== l.indexHash || u.fullIndexHash !== l.fullIndexHash || Number(u.count) !== Number(l.count) || !u.revision;
      if (d.length > 0) {
        const g = Promise.all(d);
        o && o.waitUntil(g), await g;
      }
      if (f) {
        const g = a.put(e.NODES_INDEX_META_KEY, JSON.stringify(l));
        o && o.waitUntil(g), await g;
      }
      const m = e.primeNodeSummaryCaches(i, a), p = f ? l : u;
      return Cs(p.revision, a), {
        summaries: m,
        meta: p
      };
    },
    async persistNodesSummaryIndex(r, t = {}) {
      const { kv: a, ctx: o, syncLegacyIndex: s = !1 } = t, i = e.normalizeNodeSummaryIndex(r).nodes;
      if (!a) {
        const c = e.primeNodeSummaryCaches(i, a);
        return cr(a), c;
      }
      return await Dr(async () => (await e.commitNodesSummaryIndexMutation(i, {
        kv: a,
        ctx: o,
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
      return r ? (await Jr(await e.listNodeEntityKeys(r), F.Defaults.NodesReadConcurrency, async (o) => {
        try {
          const s = await r.get(`${e.PREFIX}${o}`, { type: "json" });
          if (!s) return null;
          const i = e.normalizeNode(o, s);
          if (i.changed && !tt(o, i.data)) {
            const c = r.put(`${e.PREFIX}${o}`, JSON.stringify(i.data));
            a ? a.waitUntil(c) : await c;
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
    async loadAllNodeEntitiesFromKvStrict(r, t = {}) {
      return r ? (await Jr(await e.listNodeEntityKeysStrict(r), F.Defaults.NodesReadConcurrency, async (a) => {
        const o = await Me(r, `${e.PREFIX}${a}`, { type: "json" });
        return o ? {
          name: a,
          ...e.normalizeNode(a, o).data
        } : null;
      })).filter(Boolean) : [];
    },
    async rebuildNodeIndexesFromKv(r, t = {}) {
      const { ctx: a, syncLegacyIndex: o = !1 } = t;
      return r ? await Dr(async () => {
        const s = await e.loadAllNodeEntitiesFromKvStrict(r, { ctx: a }), i = s.map((l) => e.buildNodeSummary(l?.name, l).summary).filter(Boolean), c = await e.commitNodesSummaryIndexMutation(i, {
          kv: r,
          ctx: a,
          syncLegacyIndex: o
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
      const a = _e(r), o = a.NodesRevisionCacheGeneration, s = await e.loadAllNodeEntitiesFromKvStrict(r, t), i = s.map((l) => e.buildNodeSummary(l?.name, l).summary).filter(Boolean), c = a.NodesRevisionCacheGeneration === o ? e.primeNodeSummaryCaches(i, r) : i;
      return {
        index: e.normalizeNodeIndex(c.map((l) => l?.name)),
        summaries: c,
        nodes: s
      };
    },
    async upsertNodeSummaryEntry(r, t, a = {}) {
      const { kv: o, ctx: s } = a;
      if (!o) return null;
      const i = String(r || "").toLowerCase().trim();
      if (!i || tt(i, t)) return null;
      const c = e.buildNodeSummary(i, t).summary;
      if (!c) return null;
      const l = _e(o), u = l.NodesListCache?.exp > H() && Array.isArray(l.NodesListCache.data) ? l.NodesListCache.data.find((d) => String(d?.name || "").toLowerCase().trim() === i) : null;
      return u && e.areNodeSummariesEquivalent(u, c) ? u : await Dr(async () => {
        const d = await e.loadNodeSummariesForMutation(o, { ctx: s });
        let f = !1;
        const m = d.map((p) => String(p?.name || "").toLowerCase().trim() !== i ? p : (f = !0, e.areNodeSummariesEquivalent(p, c) ? p : c));
        return f || m.push(c), (await e.commitNodesSummaryIndexMutation(m, {
          kv: o,
          ctx: s
        })).summaries.find((p) => String(p?.name || "").toLowerCase().trim() === i) || c;
      }, o);
    },
    async removeNodeSummaryEntry(r, t = {}) {
      const { kv: a, ctx: o } = t;
      if (!a) return [];
      const s = String(r || "").toLowerCase().trim();
      return await Dr(async () => {
        const i = (await e.loadNodeSummariesForMutation(a, { ctx: o })).filter((c) => String(c?.name || "").toLowerCase().trim() !== s);
        return (await e.commitNodesSummaryIndexMutation(i, {
          kv: a,
          ctx: o
        })).summaries;
      }, a);
    },
    async getNodesIndex(r) {
      if (!r) return [];
      const t = _e(r);
      if (t.NodesIndexCache?.exp > H() && Array.isArray(t.NodesIndexCache.data)) return [...t.NodesIndexCache.data];
      if (t.NodesListCache?.exp > H() && Array.isArray(t.NodesListCache.data)) {
        const s = e.normalizeNodeIndex(t.NodesListCache.data.map((i) => i?.name));
        return t.NodesIndexCache = {
          data: s,
          exp: H() + 6e4
        }, [...s];
      }
      const a = t.NodesRevisionCacheGeneration, o = e.normalizeNodeIndex(await r.get(e.NODES_INDEX_KEY, { type: "json" }) || []);
      if (t.NodesRevisionCacheGeneration !== a) return [...o];
      if (!o.length) {
        const s = await e.rebuildNodeIndexesFromKv(r);
        return [...e.normalizeNodeIndex(s.index)];
      }
      return t.NodesRevisionCacheGeneration === a && (t.NodesIndexCache = {
        data: o,
        exp: H() + 6e4
      }), [...o];
    },
    buildPlaybackRouteHotSignature(r, t = {}) {
      const a = String(r || "").toLowerCase().trim(), o = ie(ee(e.getOrderedNodeLines(t).map((s) => String(s?.target || "").trim()).filter(Boolean)));
      return {
        cacheKey: `${a}:${String(t?.activeLineId || "").trim()}:${o}`,
        orderedTargetSignature: o
      };
    },
    buildPlaybackRouteHotSnapshot(r, t = {}, a = {}) {
      const o = String(r || "").toLowerCase().trim();
      if (!o || !k(t) || tt(o, t)) return null;
      const s = e.getOrderedNodeLines(t), i = (s.length ? s.map((m) => m?.target) : String(t.target || "").split(",").map((m) => m.trim()).filter(Boolean)).map((m) => mn(m)).filter(rt);
      if (!i.length) return null;
      const c = Array.isArray(t.lines) ? t.lines.map((m) => k(m) ? { ...m } : m) : [], l = k(t.headers) ? { ...t.headers } : {}, u = {
        ...t,
        lines: c,
        headers: l
      }, { cacheKey: d, orderedTargetSignature: f } = e.buildPlaybackRouteHotSignature(o, u);
      return {
        nodeName: o,
        cacheKey: d,
        expiresAt: H() + Tu,
        nodesRevision: String(a.nodesRevision || "").trim(),
        nodeCacheRevision: ao(o, u),
        orderedTargetSignature: f,
        secret: String(u.secret || "").trim(),
        headers: l,
        lines: c,
        activeLineId: String(u.activeLineId || "").trim(),
        mainVideoStreamMode: Br(u),
        playbackInfoMode: Mr(u.playbackInfoMode),
        mediaAuthMode: ar(u.mediaAuthMode),
        realClientIpMode: Ir(u.realClientIpMode),
        routingDecisionMode: vr(u.routingDecisionMode),
        targetRecords: i,
        nodeData: u
      };
    },
    getPlaybackRouteHotSnapshot(r, t = null) {
      const a = String(r || "").toLowerCase().trim();
      if (!a) return null;
      const o = _e(t ? e.getKV(t) : null).PlaybackRouteHotCache, s = o.get(a);
      return s ? Number(s.expiresAt) <= H() ? (o.delete(a), null) : (Za(o, a), s) : null;
    },
    async getVerifiedPlaybackRouteHotSnapshot(r, t) {
      const a = e.getKV(t), o = _e(a), s = Ie(r, o), i = e.getPlaybackRouteHotSnapshot(r, t);
      if (!i) return null;
      if (!a) return i;
      const c = await e.getNodesRevision(a);
      return Ie(r, o) !== s ? null : !i.nodesRevision || !c || i.nodesRevision === c ? i : (e.invalidatePlaybackRouteHotCache(r, t), null);
    },
    setPlaybackRouteHotSnapshot(r, t = {}, a = {}, o = null) {
      const s = e.buildPlaybackRouteHotSnapshot(r, t, a);
      return s ? (Ue(_e(o ? e.getKV(o) : null).PlaybackRouteHotCache, s.nodeName, s, sr), s) : null;
    },
    async primePlaybackRouteHotSnapshot(r, t = {}, a) {
      const o = e.getKV(a), s = _e(o), i = Ie(r, s), c = o ? await e.getNodesRevision(o) : "";
      return Ie(r, s) !== i ? null : e.setPlaybackRouteHotSnapshot(r, t, { nodesRevision: c }, a);
    },
    invalidatePlaybackRouteHotCache(r = [], t = null) {
      const a = _e(t ? e.getKV(t) : null).PlaybackRouteHotCache;
      for (const o of Array.isArray(r) ? r : [r]) {
        const s = String(o || "").toLowerCase().trim();
        s && a.delete(s);
      }
    },
    invalidateNodeCaches(r = [], t = {}) {
      const a = t.kv || (t.env ? e.getKV(t.env) : null), o = _e(a), s = [];
      for (const i of Array.isArray(r) ? r : [r]) {
        const c = String(i || "").toLowerCase().trim();
        c && (s.push(c), o.NodeCache.delete(c), o.PlaybackRouteHotCache.delete(c));
      }
      s.length > 0 && (xm(s, o), Gc(s), jc(s)), t.invalidateList && (o.NodesListCache = null, o.NodesIndexCache = null, cr(a));
    },
    async persistNodesIndex(r, t = {}) {
      const { kv: a, ctx: o, invalidateList: s = !1 } = t, i = _e(a), c = e.normalizeNodeIndex(r);
      return s && (i.NodesListCache = null), a ? await Dr(async () => {
        const l = await e.readRevisionMeta(a, e.NODES_INDEX_META_KEY, {
          count: 0,
          indexHash: "",
          fullIndexHash: ""
        }), u = ie(ee(c)), d = l.indexHash === u && l.revision ? l.updatedAt : (/* @__PURE__ */ new Date()).toISOString(), f = {
          ...l,
          updatedAt: d,
          revision: l.indexHash === u && l.revision ? l.revision : Ht(ie(`${u}:${l.fullIndexHash || ""}:${c.length}`), d),
          hash: l.hash || "",
          count: c.length,
          indexHash: u,
          fullIndexHash: String(l.fullIndexHash || "")
        }, m = [];
        (l.indexHash !== u || !l.revision) && m.push(a.put(e.NODES_INDEX_KEY, JSON.stringify(c)));
        const p = l.indexHash !== u || Number(l.count) !== c.length || !l.revision;
        if (m.length > 0) {
          const g = Promise.all(m);
          o && o.waitUntil(g), await g;
        }
        if (p) {
          const g = a.put(e.NODES_INDEX_META_KEY, JSON.stringify(f));
          o && o.waitUntil(g), await g;
        }
        return i.NodesIndexCache = {
          data: c,
          exp: H() + 6e4
        }, Cs(f.revision, a), c;
      }, a) : (i.NodesIndexCache = {
        data: c,
        exp: H() + 6e4
      }, cr(a), c);
    }
  };
}
function Pg(n = {}, e = {}) {
  const {} = n;
  return {
    getDnsRecordHistoryKey(r, t) {
      const a = encodeURIComponent(String(r || "").trim() || "default"), o = encodeURIComponent(String(t || "").trim() || "unknown");
      return `${e.DNS_RECORD_HISTORY_PREFIX}${a}:${o}`;
    },
    getDnsHostHistoryRecordId(r) {
      return `host:${re(r) || "unknown"}`;
    },
    normalizeDnsHistoryValueKey(r, t) {
      return `${String(r || "").trim().toUpperCase()}::${String(t || "").trim().toLowerCase()}`;
    },
    normalizeDnsRecordHistoryEntry(r = {}) {
      const t = r && typeof r == "object" ? r : {}, a = String(t.type || "").trim().toUpperCase(), o = String(t.content || "").trim(), s = String(t.savedAt || t.updatedAt || t.createdAt || "").trim(), i = s ? new Date(s) : null, c = i && !Number.isNaN(i.getTime()) ? i.toISOString() : "", l = String(t.name || "").trim(), u = String(t.actor || "admin").trim() || "admin", d = String(t.source || "ui").trim() || "ui", f = re(t.requestHost), m = [
        a,
        o.toLowerCase(),
        l.toLowerCase(),
        f,
        c || s,
        d.toLowerCase()
      ].join("|");
      return {
        id: String(t.id || `dns-hist-${ie(m || "empty")}`),
        name: l,
        type: a,
        content: o,
        savedAt: c,
        actor: u,
        source: d,
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
        if (a.set(c, t.length), t.push(i), t.length >= F.Defaults.DnsHistoryLimit) break;
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
    async getDnsRecordHistory(r, t, a) {
      if (!r || !t || !a) return [];
      try {
        const o = await r.get(e.getDnsRecordHistoryKey(t, a), { type: "json" });
        return e.normalizeDnsRecordHistory(o);
      } catch {
        return [];
      }
    },
    async getDnsRecordHistoryForMutation(r, t, a) {
      if (!r || !t || !a) return [];
      const o = await r.get(e.getDnsRecordHistoryKey(t, a), { type: "json" });
      return e.normalizeDnsRecordHistory(o);
    },
    async persistDnsRecordHistory(r, t, a, o) {
      if (!r || !t || !a) return [];
      const s = e.normalizeDnsRecordHistory(o);
      return await r.put(e.getDnsRecordHistoryKey(t, a), JSON.stringify(s)), s;
    },
    async recordDnsRecordHistory(r, t, a, o = {}) {
      if (!r || !t || !a) return [];
      const s = await e.getDnsRecordHistoryForMutation(r, t, a), i = e.normalizeDnsRecordHistoryEntry(o);
      if (i.type !== "CNAME" || !i.content) return s;
      s.find((u) => e.normalizeDnsHistoryValueKey(u?.type, u?.content) === e.normalizeDnsHistoryValueKey(i.type, i.content))?.preferredFallback === !0 && (i.preferredFallback = !0);
      const c = e.normalizeDnsHistoryValueKey(i.type, i.content), l = s[0] ? e.normalizeDnsHistoryValueKey(s[0].type, s[0].content) : "";
      return l && l === c ? s : e.persistDnsRecordHistory(r, t, a, [i, ...s]);
    },
    async getDnsHostHistory(r, t, a) {
      return e.getDnsRecordHistory(r, t, e.getDnsHostHistoryRecordId(a));
    },
    async persistDnsHostHistory(r, t, a, o) {
      return e.persistDnsRecordHistory(r, t, e.getDnsHostHistoryRecordId(a), o);
    },
    async recordDnsHostHistory(r, t, a, o = {}) {
      return e.recordDnsRecordHistory(r, t, e.getDnsHostHistoryRecordId(a), o);
    },
    async setDnsHostHistoryPreferredFallback(r, t, a, o = "", s = !0) {
      if (!r || !t || !a) return [];
      const i = await e.getDnsHostHistory(r, t, a), c = String(o || "").trim();
      let l = !1;
      const u = i.map((d) => {
        const f = c && String(d?.id || "").trim() === c;
        return f && (l = !0), {
          ...d,
          preferredFallback: s === !0 ? f : !1
        };
      });
      if (s === !0 && c && !l) throw new Error("dns_history_entry_not_found");
      return e.persistDnsHostHistory(r, t, a, u);
    },
    getCurrentDateKey(r = /* @__PURE__ */ new Date(), t = F.Defaults.ScheduleUtcOffsetMinutes) {
      return Dt(r, t).dateKey;
    }
  };
}
function xg(n = {}, e = {}) {
  const {} = n;
  return {
    buildLegacyConfigCacheKeys(...r) {
      const t = /* @__PURE__ */ new Set([Cc]);
      for (const a of r) {
        const o = e.getCurrentDateKey(/* @__PURE__ */ new Date(), a?.scheduleUtcOffsetMinutes);
        t.add(Ds(a?.cfZoneId)), t.add(Ds(a?.cfZoneId, o));
      }
      return [...t].filter(Boolean);
    },
    async listKvKeys(r, t = {}) {
      if (!r || typeof r.list != "function") return [];
      const a = String(t.prefix || ""), o = [];
      let s = "", i = 0, c = !1;
      const l = /* @__PURE__ */ new Set();
      for (; i < 1e3; ) {
        i += 1;
        const u = s ? await r.list({
          prefix: a,
          cursor: s
        }) : await r.list({ prefix: a });
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
            prefix: a,
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
          prefix: a,
          pageCount: i,
          cursor: s,
          reason: "page_limit"
        }, u;
      }
      return [...new Set(o)];
    },
    async listKvKeysStrict(r, t = {}) {
      if (!r || typeof r.list != "function") return [];
      const a = String(t.prefix || ""), o = [];
      let s = "", i = 0, c = !1;
      const l = /* @__PURE__ */ new Set();
      for (; i < 1e3; ) {
        i += 1;
        const u = await Vd(r, s ? {
          prefix: a,
          cursor: s
        } : { prefix: a });
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
            prefix: a,
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
          prefix: a,
          pageCount: i,
          cursor: s,
          reason: "page_limit"
        }, u;
      }
      return [...new Set(o)];
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
        const o = /* @__PURE__ */ new Error("KV tidy could not read the runtime config");
        throw o.code = "KV_TIDY_CONFIG_READ_FAILED", o.status = 503, o.details = {
          key: e.CONFIG_KEY,
          cause: ce(a, "kv_read_failed")
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
        const a = JSON.parse(String(t));
        return {
          config: oe(k(a) ? a : {}),
          rawConfig: k(a) ? a : {},
          hadMalformedValue: !k(a),
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
      const a = [], o = /* @__PURE__ */ new Set();
      for (const s of Array.isArray(t) ? t : []) {
        const i = String(s || "").trim();
        !i || o.has(i) || (o.add(i), a.push({
          key: i,
          ...await e.readRawKvEntry(r, i)
        }));
      }
      return a;
    },
    async applyKvMutationsWithRollback(r, t = []) {
      if (!r) return [];
      const a = [], o = /* @__PURE__ */ new Map(), s = /* @__PURE__ */ new Set();
      for (const l of Array.isArray(t) ? t : []) {
        const u = String(l?.key || "").trim();
        if (!u) continue;
        const d = String(l?.type || "put").trim().toLowerCase() === "delete" ? "delete" : "put";
        a.push({
          type: d,
          key: u,
          value: String(l?.value ?? "")
        }), !s.has(u) && (s.add(u), o.set(u, {
          key: u,
          ...await e.readRawKvEntry(r, u)
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
        const u = [], d = [];
        for (let f = i.length - 1; f >= 0; f -= 1) {
          const m = i[f], p = o.get(m), g = c.get(m);
          if (!(!p || !g))
            try {
              const h = await e.readRawKvEntry(r, m);
              if (!(h.exists === g.exists && (g.exists !== !0 || h.value === g.value))) {
                d.push(m);
                continue;
              }
              p.exists ? await r.put(p.key, p.value) : await r.delete(p.key);
            } catch (h) {
              u.push(`${p.key}:${h?.message || String(h)}`);
            }
        }
        if (u.length > 0 || d.length > 0) {
          const f = /* @__PURE__ */ new Error(`${l?.message || String(l)}; rollback_incomplete`);
          throw f.code = "KV_MUTATION_ROLLBACK_CONFLICT", f.status = 409, f.details = {
            rollbackConflicts: d,
            rollbackFailures: u,
            originalError: ce(l, "kv_mutation_failed")
          }, f;
        }
        throw l;
      }
    }
  };
}
function Og(n = {}, e = {}) {
  const {} = n;
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
      const a = [], o = /* @__PURE__ */ new Set(), s = new Set(Object.values(e.LEGACY_OPS_STATUS_SECTION_KEYS));
      let i = 0, c = 0, l = 0, u = 0, d = 0, f = 0, m = 0, p = 0, g = 0, h = 0;
      for (const y of t)
        if (y) {
          if (y.startsWith(e.PREFIX)) {
            a.push(y.slice(e.PREFIX.length));
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
        nodeNames: a,
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
    async collectKvTidyNodeMutations(r, t = [], a = {}, o = []) {
      const s = [], i = [];
      let c = 0, l = 0, u = 0, d = 0, f = 0, m = 0, p = mt(a.sourceDirectNodes || []);
      const g = [];
      for (const y of t) {
        const _ = `${e.PREFIX}${y}`;
        let S = null;
        try {
          S = await Me(r, _, { type: "json" });
        } catch (T) {
          const L = /* @__PURE__ */ new Error(`KV tidy could not read node ${y}`);
          throw L.code = "KV_TIDY_NODE_READ_FAILED", L.status = 503, L.details = {
            key: _,
            nodeName: y,
            cause: ce(T, "kv_read_failed")
          }, L;
        }
        if (!k(S)) {
          const T = /* @__PURE__ */ new Error(`KV tidy found an invalid node entity: ${y}`);
          throw T.code = "KV_TIDY_NODE_INVALID", T.status = 409, T.details = {
            key: _,
            nodeName: y
          }, T;
        }
        const A = cd(S);
        A.shouldAddToSourceDirectNodes && (p = mt([...p, y])), A.topLevelPortPresent && (u += 1), d += Number(A.linePortCount) || 0, A.defaultPortNodePresent && (f += 1), m += Number(A.defaultPortLineCount) || 0, l += A.legacyKeysPresent.length;
        const { data: b, changed: R } = e.normalizeNode(y, S, { dropLegacyDirectRouting: !0 });
        i.push({
          name: y,
          ...b
        }), !tt(y, b) && R && (g.push({
          key: _,
          ...await e.readRawKvEntry(r, _)
        }), c += 1, s.push({
          name: y,
          data: b
        }));
      }
      let h = a;
      return ee(h.sourceDirectNodes || []) !== ee(p) && (h = oe({
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
    buildKvTidyNoteParts(r = {}, t = {}) {
      const a = [];
      return Array.isArray(r.legacyKeysPresent) && r.legacyKeysPresent.length && a.push(`legacy_keys=${r.legacyKeysPresent.join(",")}`), Number(r.rewrittenNodeCount) > 0 && a.push(`rewritten_nodes=${r.rewrittenNodeCount}`), Number(r.migratedTopLevelPortNodeCount) > 0 && a.push(`top_level_port_nodes=${r.migratedTopLevelPortNodeCount}`), Number(r.migratedLinePortCount) > 0 && a.push(`line_ports=${r.migratedLinePortCount}`), Number(r.migratedDefaultPortNodeCount) > 0 && a.push(`default_port_nodes=${r.migratedDefaultPortNodeCount}`), Number(r.migratedDefaultPortLineCount) > 0 && a.push(`default_port_lines=${r.migratedDefaultPortLineCount}`), t.includeRepairSource === !0 && t.repairedConfig?.hadMalformedValue && a.push(`${t.repairLabel || "config_source"}=${t.repairedConfig.source}`), a;
    },
    buildKvTidyPlanHash(r = {}) {
      const t = (Array.isArray(r?.mutationPlan) ? r.mutationPlan : []).map((a) => ({
        type: String(a?.type || "put").trim().toLowerCase() === "delete" ? "delete" : "put",
        key: String(a?.key || "").trim(),
        value: String(a?.value ?? "")
      }));
      return ie(ee({
        scope: "kv",
        scannedKeys: [...new Set(Array.isArray(r?.scannedKeys) ? r.scannedKeys : [])].sort(),
        revisions: k(r?.revisions) ? r.revisions : {},
        mutationPlan: t,
        rebuiltNodeSummaries: Array.isArray(r?.rebuiltNodeSummaries) ? r.rebuiltNodeSummaries : []
      }));
    }
  };
}
function vg(n = {}, e = {}) {
  return {
    ...Mg(n, e),
    ...Pg(n, e),
    ...xg(n, e),
    ...Og(n, e)
  };
}
var Fg = class {
  constructor({ configReader: n, httpService: e, nodeRouteReader: r, proxyApi: t }) {
    this.configReader = n, this.httpService = e, this.nodeRouteReader = r, this.proxyApi = t;
  }
  #e(n, e, r, t = 200) {
    return this.httpService.buildCorsResponse(Ca(e, n), r, t, { mergeOriginVary: !0 });
  }
  #a(n, e) {
    const r = new URL(n.url);
    r.pathname = e + "/";
    const t = new Headers({
      Location: r.toString(),
      "Cache-Control": "no-store"
    });
    we(t);
    const a = n.method === "GET" || n.method === "HEAD" ? 301 : 307;
    return new Response(null, {
      status: a,
      headers: t
    });
  }
  #f(n, e) {
    const r = re(e);
    if (!r) return null;
    const t = new URL(n.url);
    t.hostname = r;
    const a = new Headers({
      Location: t.toString(),
      "Cache-Control": "no-store"
    });
    return we(a), new Response(null, {
      status: 301,
      headers: a
    });
  }
  #o(n, e = "") {
    const r = String(e || "").trim();
    if (!n || !r || n.status === 101) return n;
    const t = new Headers(n.headers || {});
    return t.append("Set-Cookie", r), new Response(n.body, {
      status: n.status,
      statusText: n.statusText,
      headers: t
    });
  }
  #n(n, e) {
    const r = this.#e(n, e, "Not Found", 404);
    return this.#o(r, Oc());
  }
  async #s(n, e, r, t) {
    if (!n || n.status === 101) return n;
    const a = await op(r, e, t);
    return a ? this.#o(n, ip(a)) : n;
  }
  #t(n) {
    const e = n.segments;
    return e.length <= 1 ? !1 : this.httpService.isPlaybackCriticalSegments(e, 1) ? !0 : e.length <= 2 ? !1 : this.httpService.isPlaybackCriticalSegments(e, 2);
  }
  async #u(n, e, r, t) {
    if (!n.root) return null;
    const a = this.#t(n);
    let o = a ? await this.nodeRouteReader.getVerifiedPlaybackRouteHotSnapshot(n.root, e) : null, s = a ? o ? "hit" : "miss" : "skip";
    const i = o?.nodeData || await this.nodeRouteReader.getNode(n.root, e, r);
    if (!i) return null;
    const c = tt(n.root, i) ? "oversized_bypass" : "";
    if (c && (s = c), Ze(i?.entryMode)) return null;
    const l = i.secret, u = yt(n.root, l), d = 1 + n.rootRaw.length, f = n.normalizedPathname.substring(d), m = xs(f, n.requestUrl, u), p = m?.normalizedPath || f, g = `/${n.rootRaw}${p === "/" ? "/" : p}`, h = m ? g.split("/").filter(Boolean) : n.segments;
    let y = d;
    if (l) {
      const R = h[1] || "";
      if (wt(R) !== l) return null;
      y += 1 + R.length;
    }
    const _ = g.substring(y), S = m ? (() => {
      const R = new URL(n.requestUrl.toString());
      return R.pathname = g, R;
    })() : n.requestUrl, A = oa(_);
    let b = A.remaining;
    return _ === "" && !S.pathname.endsWith("/") || A.needsTrailingSlashRedirect === !0 ? { response: this.#a(t, g) } : (b === "" && (b = "/"), a && !o && (o = await this.nodeRouteReader.primePlaybackRouteHotSnapshot(n.root, i, e)), {
      nodeData: i,
      secret: l,
      remaining: Q(b),
      linkVariant: A.linkVariant,
      requestUrl: S,
      pathNormalizationState: m,
      playbackRouteHotSnapshot: o,
      targetHotCacheState: s,
      nodeCacheState: c,
      entryMode: "kv_route"
    });
  }
  #i(n) {
    return n ? qa(oa(n.normalizedPathname)?.remaining || "/") : !1;
  }
  async #r(n, e, r, t) {
    const a = n?.hostPrefixMatch;
    if (!a?.prefix) return null;
    const o = a.prefix, s = this.#i(n);
    let i = s ? await this.nodeRouteReader.getVerifiedPlaybackRouteHotSnapshot(o, e) : null, c = s ? i ? "hit" : "miss" : "skip";
    const l = i?.nodeData || await this.nodeRouteReader.getNode(o, e, r);
    if (!l || !Ze(l?.entryMode)) return null;
    const u = tt(o, l) ? "oversized_bypass" : "";
    u && (c = u);
    const d = oa(n.normalizedPathname);
    let f = d.remaining;
    return d.needsTrailingSlashRedirect === !0 ? { response: this.#a(t, n.normalizedPathname) } : (f === "" && (f = "/"), s && !i && (i = await this.nodeRouteReader.primePlaybackRouteHotSnapshot(o, l, e)), {
      nodeData: l,
      secret: "",
      remaining: Q(f),
      linkVariant: d.linkVariant,
      requestUrl: n.requestUrl,
      playbackRouteHotSnapshot: i,
      targetHotCacheState: c,
      nodeCacheState: u,
      entryMode: "host_prefix"
    });
  }
  #d(n) {
    const e = n?.requestHost || "", r = n?.configuredHost || "", t = n?.configuredLegacyHost || "";
    return e ? r && e === r ? !0 : !!(t && t !== r && e === t) : !1;
  }
  async #l(n, e, r, t, a = {}) {
    if (!this.#d(n) || !n?.root) return null;
    const o = n.root, s = this.#t(n);
    let i = s ? await this.nodeRouteReader.getVerifiedPlaybackRouteHotSnapshot(o, e) : null, c = s ? i ? "hit" : "miss" : "skip";
    const l = i?.nodeData || await this.nodeRouteReader.getNode(o, e, r);
    if (!l || !Ze(l?.entryMode)) return null;
    const u = tt(o, l) ? "oversized_bypass" : "";
    u && (c = u);
    const d = yt(o, "", { entryMode: "kv_route" }), f = 1 + n.rootRaw.length, m = n.normalizedPathname.substring(f), p = xs(m, n.requestUrl, d), g = p?.normalizedPath || m, h = `/${n.rootRaw}${g === "/" ? "/" : g}`, y = h.substring(f), _ = p ? (() => {
      const b = new URL(n.requestUrl.toString());
      return b.pathname = h, b;
    })() : n.requestUrl, S = oa(y);
    let A = S.remaining;
    return y === "" && !_.pathname.endsWith("/") || S.needsTrailingSlashRedirect === !0 ? { response: this.#a(t, h) } : (A === "" && (A = "/"), s && !i && (i = await this.nodeRouteReader.primePlaybackRouteHotSnapshot(o, l, e)), {
      nodeData: l,
      nodeName: o,
      secret: "",
      remaining: Q(A),
      linkVariant: S.linkVariant,
      requestUrl: _,
      pathNormalizationState: p,
      playbackRouteHotSnapshot: i,
      targetHotCacheState: c,
      nodeCacheState: u,
      entryMode: "kv_route",
      routeKindOverride: a.isLegacyHostRequest === !0 ? "legacy_host_prefix_path_compat" : "host_prefix_path_compat",
      attachLegacyProxyContext: a.isLegacyHostRequest === !0
    });
  }
  async #c(n, e, r, t) {
    if (!Os(n?.normalizedPathname)) return null;
    const a = t.headers.get("Cookie") || "", o = String(tn(a).get("legacy_proxy_ctx") || "").trim();
    if (!o) return null;
    const s = await sp(o, e, { requestHost: n.requestHost });
    if (s?.ok !== !0) return { response: this.#n(t, e) };
    const i = String(s.payload?.node || "").trim().toLowerCase();
    if (!i) return { response: this.#n(t, e) };
    const c = qa(n.normalizedPathname);
    let l = c ? await this.nodeRouteReader.getVerifiedPlaybackRouteHotSnapshot(i, e) : null, u = c ? l ? "hit" : "miss" : "skip";
    const d = l?.nodeData || await this.nodeRouteReader.getNode(i, e, r);
    if (!d) return { response: this.#n(t, e) };
    const f = tt(i, d) ? "oversized_bypass" : "";
    f && (u = f);
    const m = Ze(d?.entryMode);
    return c && !l && (l = await this.nodeRouteReader.primePlaybackRouteHotSnapshot(i, d, e)), {
      nodeData: d,
      nodeName: i,
      secret: m ? "" : d.secret,
      remaining: n.normalizedPathname,
      linkVariant: "main",
      requestUrl: n.requestUrl,
      playbackRouteHotSnapshot: l,
      targetHotCacheState: u,
      nodeCacheState: f,
      entryMode: "kv_route",
      routeKindOverride: m ? "legacy_host_context_cookie_host_prefix_compat" : "legacy_host_context_cookie"
    };
  }
  async handle(n, e, r, t) {
    if (!t) throw new TypeError("NodeProxyFacade.handle requires routeContext");
    const { requestHost: a, configuredHost: o, configuredLegacyHost: s } = t, i = await this.configReader.getRuntimeConfig(e), c = !!(s && s !== o && a === s), l = i.enableHostPrefixProxy === !0 && !!o && !c;
    t.hostPrefixMatch = l ? bo(a, o) : null;
    const u = !!(l && a !== o && a.endsWith(`.${o}`));
    if (t.hostPrefixMatch) {
      const m = await this.#r(t, e, r, n);
      return m?.response ? m.response : m?.nodeData ? this.proxyApi.handle(n, m.nodeData, m.remaining, t.hostPrefixMatch.prefix, m.secret, e, r, {
        requestUrl: m.requestUrl || t.requestUrl,
        linkVariant: m.linkVariant,
        targetHotCacheState: m.targetHotCacheState,
        nodeCacheState: m.nodeCacheState,
        cachedTargetRecords: Array.isArray(m.playbackRouteHotSnapshot?.targetRecords) ? m.playbackRouteHotSnapshot.targetRecords : null,
        nodeCacheRevision: m.playbackRouteHotSnapshot?.nodeCacheRevision || "",
        runtimeConfig: i,
        runtimeRouteContext: t,
        entryMode: m.entryMode
      }) : this.#e(n, e, "Not Found", 404);
    }
    if (u) return this.#e(n, e, "Not Found", 404);
    const d = await this.#l(t, e, r, n, { isLegacyHostRequest: c });
    if (d?.response) return d.response;
    if (d?.nodeData) {
      const m = await this.proxyApi.handle(n, d.nodeData, d.remaining, d.nodeName, d.secret, e, r, {
        requestUrl: d.requestUrl || t.requestUrl,
        linkVariant: d.linkVariant,
        pathNormalizationState: d.pathNormalizationState,
        targetHotCacheState: d.targetHotCacheState,
        nodeCacheState: d.nodeCacheState,
        cachedTargetRecords: Array.isArray(d.playbackRouteHotSnapshot?.targetRecords) ? d.playbackRouteHotSnapshot.targetRecords : null,
        nodeCacheRevision: d.playbackRouteHotSnapshot?.nodeCacheRevision || "",
        runtimeConfig: i,
        runtimeRouteContext: t,
        entryMode: d.entryMode,
        routeKindOverride: d.routeKindOverride
      });
      return d.attachLegacyProxyContext === !0 ? await this.#s(m, a, d.nodeName, e) : m;
    }
    const f = await this.#u(t, e, r, n);
    if (f?.response) return f.response;
    if (f?.nodeData) {
      const m = await this.proxyApi.handle(n, f.nodeData, f.remaining, t.root, f.secret, e, r, {
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
    if (c && Os(t.normalizedPathname)) {
      const m = await this.#c(t, e, r, n);
      if (m?.response) return m.response;
      if (m?.nodeData) {
        const p = await this.proxyApi.handle(n, m.nodeData, m.remaining, m.nodeName, m.secret, e, r, {
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
    return this.#e(n, e, "Not Found", 404);
  }
};
function Ug(n) {
  return Object.freeze({
    persistCloudflareDnsRecordsForHost(e) {
      return am({
        ...e,
        dnsHistoryRepository: n
      });
    },
    buildDnsIpWorkspaceItems(e, r, t, a = {}) {
      return Tc(e, r, t, {
        ...a,
        probeRepository: n
      });
    },
    buildDnsIpPoolWorkspacePreviewItems(e, r, t, a, o = {}) {
      return bm(e, r, t, a, {
        ...o,
        probeRepository: n
      });
    },
    tryAcquireDnsIpPoolFetchRefreshLock(e, r) {
      return Cm({
        ...e,
        leaseRepository: n
      }, r);
    },
    releaseDnsIpPoolFetchRefreshLock(e, r) {
      return wm({
        ...e,
        leaseRepository: n
      }, r);
    },
    runDnsIpPoolSourcesLiveRefresh(e) {
      return Lm({
        ...e,
        poolRepository: n
      });
    }
  });
}
function kg(n, e) {
  const r = e.shellService, t = [
    Pm({
      kernel: n,
      bindingPort: n,
      CacheManager: e.cacheManager,
      LogQueryPlanner: e.logQueryPlanner,
      Logger: e.logger,
      requestModel: n,
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
    Np({
      D1TidyExecutor: e.d1TidyExecutor,
      D1TidyPlanner: e.d1TidyPlanner,
      Logger: e.logger,
      buildAdminReleaseVendorManifest: r.buildAdminReleaseVendorManifest,
      normalizeAdminReleaseVendorManifestRecord: r.normalizeAdminReleaseVendorManifestRecord,
      validateAdminShellHtmlSource: r.validateAdminShellHtmlSource
    }, n),
    Bp({
      CacheManager: e.cacheManager,
      persistCloudflareDnsRecordsForHost: e.dns.persistCloudflareDnsRecordsForHost
    }, n),
    Gp({
      bindingPort: n,
      schemaReadinessPort: n,
      statusPersistence: n
    }),
    Eg({
      CacheManager: e.cacheManager,
      withAdminShellRuntimeStatus: r.withAdminShellRuntimeStatus
    }, n),
    wg({}, n),
    vg({}, n)
  ];
  for (const a of t) for (const [o, s] of Object.entries(a)) n[o] = s;
  return n;
}
function Hg({ includeTestingSupport: n = !1 } = {}) {
  const e = { ...Ng }, r = Object.freeze({ getRuntimeConfig: Ce }), t = Ig({ nodeRepository: e }), a = Wp({ logRepository: e }), o = ef({
    indexRepository: e,
    statusPort: e
  });
  kg(e, {
    cacheManager: t,
    d1TidyExecutor: Lg(),
    d1TidyPlanner: Dg(),
    dns: Ug(e),
    logger: a,
    logQueryPlanner: Kp(),
    shellService: o
  });
  const s = pg({
    cachePort: t,
    configReader: r,
    fetchPort: { fetchRequest: We },
    logger: a,
    nodeRepository: e
  }), i = new Ed({
    actionHandlers: e.adminActionHandlers,
    bindingService: e,
    configReader: r,
    repository: e,
    requestModel: e,
    shellService: o
  }), c = new Fg({
    configReader: r,
    httpService: Object.freeze({
      buildCorsResponse: o.buildEdgeCorsResponse,
      isPlaybackCriticalSegments: o.isPlaybackCriticalSegments
    }),
    nodeRouteReader: e,
    proxyApi: s
  }), l = new Ip({
    logger: a,
    service: e
  }), u = (m, p) => {
    const g = new URL(m.url), h = re(g.hostname), y = Q(g.pathname), _ = y.toLowerCase(), S = it(p), A = S.toLowerCase(), b = un(S), R = b.toLowerCase(), T = wi(p, {
      adminPath: S,
      loginPath: b
    }), L = y.split("/").filter(Boolean), D = L[0] || "", E = wt(D).toLowerCase();
    return {
      initHealth: T,
      requestUrl: g,
      requestHost: h,
      configuredHost: Ve(p),
      configuredLegacyHost: Wr(p),
      normalizedPathname: y,
      pathnameLower: _,
      adminPath: S,
      adminPathLower: A,
      adminLoginPath: b,
      adminLoginPathLower: R,
      segments: L,
      rootRaw: D,
      root: E
    };
  }, d = (m, p) => (p === "GET" || p === "HEAD") && m.pathnameLower === "/favicon.ico" || p === "GET" && m.normalizedPathname === "/" || Ai(m.pathnameLower, m.adminPathLower) || wr(m.pathnameLower, m.adminLoginPathLower) ? !0 : m.adminPathLower === "/admin" && m.pathnameLower === "/api/auth/login" && m.root === "api" && m.segments[1] === "auth" && m.segments[2] === "login", f = {
    adminConsole: i,
    nodeProxy: c,
    scheduledMaintenance: l,
    workerHandler: Object.freeze({
      async fetch(m, p, g) {
        const h = u(m, p), y = m.method;
        if (!((y === "GET" || y === "HEAD") && h.pathnameLower === "/favicon.ico")) {
          const _ = await r.getRuntimeConfig(p), S = !!(h.configuredLegacyHost && h.configuredLegacyHost !== h.configuredHost && h.requestHost === h.configuredLegacyHost);
          if (_.enableHostPrefixProxy === !0 && h.configuredHost && !S && h.requestHost !== h.configuredHost && h.requestHost.endsWith(`.${h.configuredHost}`)) return c.handle(m, p, g, h);
        }
        if (d(h, y)) {
          const _ = await i.handle(m, p, g);
          if (_) return _;
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
    logger: a,
    shellService: o,
    buildNodeRouteContext: u,
    buildRouteCorsResponse(m, p, g, h = 200) {
      return o.buildEdgeCorsResponse(Ca(p, m), g, h, { mergeOriginVary: !0 });
    },
    isPlaybackCriticalRouteContext(m) {
      const p = Array.isArray(m?.segments) ? m.segments : [];
      return p.length <= 1 ? !1 : o.isPlaybackCriticalSegments(p, 1) ? !0 : p.length > 2 && o.isPlaybackCriticalSegments(p, 2);
    },
    isolateState: bl,
    proxyService: s.testingSupport
  })), Object.freeze(f);
}
var { workerHandler: $g } = Hg();
export {
  $g as default
};
