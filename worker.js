function Ns(n) {
  const e = String(n || "").trim();
  if (!/^\d+$/.test(e)) return null;
  const r = Number(e);
  return Number.isFinite(r) ? r : null;
}
function to(n) {
  if (n == null) return "";
  try {
    return n instanceof ArrayBuffer ? new TextDecoder().decode(new Uint8Array(n)) : ArrayBuffer.isView(n) ? new TextDecoder().decode(n) : String(n || "");
  } catch {
    return "";
  }
}
async function Ls(n, e) {
  const r = Math.max(0, Math.floor(Number(e) || 0)), t = Ns(n?.headers?.get?.("Content-Length"));
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
      o.push(u), s += u.byteLength;
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
  const r = await Ls(n, e);
  return {
    text: r.exceeded ? "" : new TextDecoder().decode(r.bodyBytes),
    bytes: r.bytes,
    exceeded: r.exceeded
  };
}
function Za(n) {
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
function zc(n, e = 8192) {
  const r = Math.max(2, Math.floor(Number(e) || 8192)), t = Math.max(1, Math.min(32, Math.floor(r / 256))), a = Math.max(16, Math.min(512, Math.floor(r / Math.max(4, t * 2)))), o = 4, s = Math.max(8, Math.min(256, Math.floor(r / 32))), i = /* @__PURE__ */ new WeakSet();
  let c = 0, l = !1;
  const d = (f, m = 0) => {
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
    const f = JSON.stringify(d(n));
    if (!l && f && f.length <= r) return f;
  } catch {
  }
  const u = JSON.stringify({ truncated: !0 });
  return u.length <= r ? u : "{}";
}
function ce(n = "") {
  const e = String(n || "");
  let r = 2166136261;
  for (let t = 0; t < e.length; t += 1)
    r ^= e.charCodeAt(t), r = Math.imul(r, 16777619);
  return (r >>> 0).toString(36);
}
function Uo(n = []) {
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
function bn(n = "") {
  const e = new TextEncoder().encode(String(n || ""));
  let r = 14695981039346656037n;
  const t = 1099511628211n;
  for (const a of e)
    r ^= BigInt(a), r = BigInt.asUintN(64, r * t);
  return r.toString(16).padStart(16, "0");
}
async function In(n = "") {
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
function ro(n) {
  const e = String(n || "").trim().toLowerCase();
  if (!e) return null;
  const r = e.includes("*"), t = e.replace(/^\*\./, "").replace(/^\*+/, "").replace(/\*+$/g, "").replace(/^\.+|\.+$/g, "");
  return t ? {
    hostname: t,
    wildcard: r
  } : null;
}
function ee(n) {
  return ro(n)?.hostname || "";
}
function Et(n = []) {
  const e = Array.isArray(n) ? n : [n], r = [], t = /* @__PURE__ */ new Set();
  for (const a of e) {
    const o = String(a || "").trim();
    !o || t.has(o) || (t.add(o), r.push(o));
  }
  return r;
}
function F(n) {
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
function $c(n, e, r, t) {
  const a = Number(n);
  return Number.isFinite(a) ? Math.min(t, Math.max(r, a)) : e;
}
function ia(n, e) {
  return !!n && typeof n == "object" && Object.prototype.hasOwnProperty.call(n, e);
}
function Na(n) {
  return String(n || "").replace(/[\\%_]/g, "\\$&");
}
function Bc(n) {
  const e = String(n || "").trim();
  return e ? /^(?:\d{1,3}\.){3}\d{1,3}$/.test(e) ? !0 : /^[0-9a-f:]+$/i.test(e) && e.includes(":") : !1;
}
function Ho(n) {
  const e = String(n || "").trim();
  return e ? /^[a-z]{3,4}$/i.test(e) : !1;
}
function Wc() {
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
function Vc() {
  const n = Za(() => ({ namespaces: /* @__PURE__ */ new Map() }));
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
function Gc() {
  const n = Za(() => ({
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
function sr(n = globalThis) {
  try {
    return n?.caches?.default ?? null;
  } catch {
    return null;
  }
}
function Pn(n = globalThis) {
  return n.crypto.subtle;
}
function ko(n) {
  return String(n || "").trim();
}
function jc(n = [], e = {}) {
  const r = /* @__PURE__ */ Object.create(null), t = /* @__PURE__ */ new Map();
  for (const s of n) {
    const i = ko(s?.name) || "anonymous", c = s?.handlers && typeof s.handlers == "object" ? s.handlers : s;
    for (const [l, d] of Object.entries(c || {})) {
      if (typeof d != "function") throw new TypeError(`Admin action ${l} from ${i} is not a function`);
      if (r[l]) throw new Error(`Duplicate admin action ${l}: ${t.get(l)} and ${i}`);
      r[l] = d, t.set(l, i);
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
      const i = ko(s);
      return o[a[i] || i] || null;
    }
  });
}
function qc(n) {
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
function Xc() {
  return Za(() => ({
    LogQueue: [],
    LogDedupe: /* @__PURE__ */ new Map(),
    LogFlushPending: !1,
    LogFlushTask: null,
    LogClearEpochMs: 0,
    LogLastFlushAt: 0,
    runtimeConfig: null
  }));
}
function ir(n = "") {
  return String(n || "").trim().toLowerCase().split(";", 1)[0].trim();
}
function Oa(n = "") {
  const e = ir(n);
  return e === "application/json" || e === "text/json" || /^application\/[a-z0-9!#$&^_.+-]+\+json$/i.test(e);
}
function Ms(n = "") {
  const e = ir(n);
  return e === "text/html" || e === "application/xhtml+xml";
}
function Yc(n = "", e = "text/html") {
  const r = ir(e);
  if (!Ms(r)) return !1;
  const [t, a] = r.split("/", 2);
  let o = -1, s = 0;
  for (const i of String(n || "").split(",")) {
    const [c, ...l] = i.split(";"), [d, u] = ir(c).split("/", 2);
    let f = -1;
    if (d === t && u === a ? f = 2 : d === t && u === "*" ? f = 1 : d === "*" && u === "*" && (f = 0), f < o || f < 0) continue;
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
function xn(n, e, r = {}) {
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
  ].forEach((d) => s.delete(d)), s.set("Content-Type", "application/json; charset=utf-8"), s.set("Cache-Control", "no-store"), s.delete("X-Proxy-Mime-Guard"), s.delete("X-Proxy-Contract-Guard");
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
function Jc(n, e, r = {}) {
  const t = e?.response;
  if (!t || n?.requestTraits?.isApiRequest !== !0 || t.status === 101 || t.status === 204 || t.status === 205 || t.status === 304) return e;
  const a = typeof r.sanitizePath == "function" ? r.sanitizePath : (s) => String(s || "/"), o = t.headers.get("Content-Type");
  return (n?.requestMethod === "GET" || n?.requestMethod === "HEAD") && a(n?.proxyPath || "/") === "/" && Yc(n?.request?.headers?.get("Accept"), o) || !Ms(o) ? e : (typeof r.buildErrorState == "function" ? r.buildErrorState : xn)(n, e, {
    message: "Upstream API returned an HTML document instead of API data.",
    guardHeader: "X-Proxy-Mime-Guard",
    guardValue: "html-document",
    details: {
      upstreamStatus: t.status,
      contentType: ir(o) || "missing"
    }
  });
}
var Qc = "playback-info", Is = /* @__PURE__ */ new WeakSet();
function ao(n) {
  if (!n || typeof n != "object" || Array.isArray(n)) return !1;
  const e = Object.getPrototypeOf(n);
  return e === Object.prototype || e === null;
}
function va(n = "") {
  let e;
  try {
    e = JSON.parse(String(n || ""));
  } catch {
    return null;
  }
  return ao(e) ? e : null;
}
function no({ response: n, bodyText: e, bodyBytes: r, payload: t }) {
  if (!n || !ao(t)) return null;
  const a = Object.freeze({
    contract: Qc,
    response: n,
    bodyText: String(e || ""),
    bodyBytes: Math.max(0, Number(r) || 0),
    payload: t
  });
  return Is.add(a), a;
}
function Jt(n) {
  return Is.has(n) && n?.contract === "playback-info" && !!n.response && typeof n.bodyText == "string" && Number.isFinite(n.bodyBytes) && n.bodyBytes >= 0 && ao(n.payload);
}
function Rn(n, e) {
  return Object.freeze({
    kind: "invalid",
    reason: e,
    details: Object.freeze({
      reason: e,
      upstreamStatus: Number(n?.status) || 0,
      contentType: ir(n?.headers?.get?.("Content-Type")) || "missing"
    })
  });
}
async function Zc(n, e = {}) {
  const r = String(e.requestMethod || "GET").toUpperCase();
  if (!n || !(n.status >= 200 && n.status < 300) || r === "HEAD" || n.status === 204 || n.status === 205 || !n.body) return Object.freeze({ kind: "skip" });
  if (!Oa(n.headers.get("Content-Type"))) return Rn(n, "unsupported_content_type");
  const t = await Pe(n.clone(), e.maxBytes);
  if (t.exceeded) return Rn(n, "body_too_large");
  const a = va(t.text);
  return a ? Object.freeze({
    kind: "valid",
    representation: no({
      response: n,
      bodyText: t.text,
      bodyBytes: t.bytes,
      payload: a
    })
  }) : Rn(n, "invalid_root_object");
}
function oo(n) {
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
function Fa(n) {
  if (typeof n != "string") return n;
  const e = n.trim();
  if (!e || !e.startsWith("{") && !e.startsWith("[")) return n;
  try {
    return JSON.parse(e);
  } catch {
    return n;
  }
}
function so(n) {
  const e = Fa(n);
  if (!Array.isArray(e)) return {
    items: [],
    changed: !0
  };
  let r = e !== n;
  const t = [];
  for (const a of e) {
    const o = Fa(a);
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
function Ps(n) {
  let e = n, r = !1;
  const t = (a, o) => {
    e === n && (e = { ...n }), e[a] = o, r = !0;
  };
  for (const a of ["MediaStreams", "MediaAttachments"]) {
    if (!Object.prototype.hasOwnProperty.call(n, a)) continue;
    const o = so(n[a]);
    o.changed && t(a, o.items);
  }
  if (Object.prototype.hasOwnProperty.call(n, "RequiredHttpHeaders")) {
    const a = Fa(n.RequiredHttpHeaders);
    !a || typeof a != "object" || Array.isArray(a) ? t("RequiredHttpHeaders", {}) : a !== n.RequiredHttpHeaders && t("RequiredHttpHeaders", a);
  }
  return {
    mediaSource: e,
    changed: r
  };
}
function io(n) {
  if (!n || typeof n != "object" || Array.isArray(n) || !Object.prototype.hasOwnProperty.call(n, "MediaSources")) return {
    payload: n,
    rewriteState: "not_needed"
  };
  const e = so(n.MediaSources);
  let r = e.changed;
  const t = e.items.map((a) => {
    const o = Ps(a);
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
function xs(n, e = {}) {
  const r = io(n), t = r.payload;
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
    }, d = String(i.DirectStreamUrl || "").trim(), u = String(i.Path || "").trim(), f = d || u, m = f ? a(f) : "";
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
function el(n, e = {}) {
  if (!Jt(n)) return {
    kind: "invalid",
    reason: "invalid_representation"
  };
  const r = e.rewriteEnabled === !0 ? xs(n.payload, { buildProxyUrl: e.buildProxyUrl }) : io(n.payload);
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
    representation: no({
      response: new Response(t, {
        status: o.status,
        statusText: o.statusText,
        headers: oo(o.headers)
      }),
      bodyText: t,
      bodyBytes: a,
      payload: r.payload
    }),
    rewriteState: "applied"
  };
}
function La(n) {
  return new TextEncoder().encode(String(n || "")).byteLength;
}
var tl = class {
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
    if (!Oa(r.get("Content-Type"))) return null;
    const t = String(n.bodyText || ""), a = La(t);
    if (a > this.maxEntryBytes) return null;
    const o = va(t);
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
    for (const r of this.entries.values()) e += La(r?.bodyText);
    for (; this.entries.size > 0 && e > this.maxTotalBytes; ) {
      const r = this.entries.keys().next().value;
      if (!r) break;
      const t = this.entries.get(r);
      e -= La(t?.bodyText), this.entries.delete(r);
    }
  }
  set(n, e, r = {}) {
    if (!n || !Jt(e)) return !1;
    const t = e.response;
    if (!(t.status >= 200 && t.status < 300) || t.status === 204 || t.status === 205 || !Oa(t.headers.get("Content-Type"))) return !1;
    const a = La(e.bodyText);
    if (a > this.maxEntryBytes || !va(e.bodyText)) return !1;
    const o = Math.max(0, Number(r.ttlMs) || 0);
    if (o <= 0) return !1;
    const s = oo(t.headers);
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
    const a = no({
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
function rl() {
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
    CleanupState: Wc()
  };
}
var gt = Za(rl), Se = (n = null) => gt.get(n), Ut = Xc(), Ua = Vc(), On = Gc(), { runDataMutation: Xt, runTidyMutation: al } = qc(On), oe = {
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
  get: () => gt.current()[n],
  set: (e) => {
    gt.current()[n] = e;
  }
});
for (const n of ["ConfigCache", "RuntimeConfigCacheGeneration"]) Object.defineProperty(oe, n, {
  enumerable: !0,
  configurable: !1,
  get: () => Ua.current()[n],
  set: (e) => {
    Ua.current()[n] = e;
  }
});
var Ye = {
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
for (const n of ["CleanupState"]) Object.defineProperty(Ye, n, {
  enumerable: !0,
  configurable: !1,
  get: () => gt.current()[n],
  set: (e) => {
    gt.current()[n] = e;
  }
});
for (const n of ["KvDataMutationChain", "KvTidyMutationChain"]) Object.defineProperty(Ye, n, {
  enumerable: !0,
  configurable: !1,
  get: () => On.current()[n],
  set: (e) => {
    On.current()[n] = e;
  }
});
var Q = {
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
function nl(n) {
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
var ol = nl([
  oe,
  Ye,
  Q
]);
function ie(n, e = "unknown_error") {
  const r = String(n?.message || "").trim();
  return r || String(n || "").trim() || e;
}
function De(n, e = 500) {
  const r = Number(n);
  if (Number.isFinite(r) && r >= 400 && r <= 599) return Math.floor(r);
  const t = Number(e);
  return Number.isFinite(t) && t >= 400 && t <= 599 ? Math.floor(t) : 500;
}
function en(n) {
  if (!n || typeof n != "object") return !1;
  const e = String(n?.code || "").trim(), r = Number(n?.status);
  return !!e || Number.isFinite(r) && r >= 400 && r <= 599;
}
function sl(n, e = {}) {
  const r = De(e?.status, 500), t = String(e?.code || "INTERNAL_ERROR").trim().toUpperCase() || "INTERNAL_ERROR", a = String(e?.message || "Server Error").trim() || "Server Error", o = en(n);
  return {
    status: o ? De(n?.status, r) : r,
    code: o && String(n?.code || t).trim().toUpperCase() || t,
    message: o && String(n?.message || a).trim() || a,
    details: o && n?.details !== void 0 ? n.details : e?.details !== void 0 ? e.details : null
  };
}
function Os(n = "get", e = {}, r = "unknown_error") {
  const t = F(e) ? e : {}, a = {
    dependency: "KV",
    operation: String(n || "").trim().toLowerCase() === "list" ? "list" : "get",
    reason: String(r || "unknown_error").trim() || "unknown_error"
  }, o = String(t.key || "").trim(), s = String(t.prefix || "").trim();
  return o && (a.key = o), s && (a.prefix = s), Te("KV_READ_FAILED", "KV 读取异常", 503, a);
}
function tn(n) {
  return en(n) && String(n?.code || "").trim().toUpperCase() === "KV_READ_FAILED" && String(n?.details?.dependency || "").trim().toUpperCase() === "KV";
}
function il(n, e = "INTERNAL_ERROR", r = "Server Error", t = "admin.read.kv_read_failed") {
  if (!tn(n)) return n;
  const a = Te(e, r, 503, { ...F(n?.details) ? n.details : {} });
  return Ne(t, a, a.details), a;
}
function At(n, e, r, t = "admin.read") {
  if (!tn(n)) return n;
  const a = String(n?.details?.operation || "").trim().toLowerCase() === "list" ? "list" : "get";
  return il(n, e, r, `${String(t || "admin.read").trim() || "admin.read"}.kv_${a}_failed`);
}
function Ko(n = "CONFIG_SNAPSHOTS_CLEAR_FAILED", e = "设置快照清理失败：KV 写入异常", r = null) {
  return Te(n, e, 503, r);
}
function Ne(n, e, r = null, t = "warn") {
  const a = t === "error" ? "error" : "warn", o = String(n || "runtime_failure").trim() || "runtime_failure", s = F(r) ? { ...r } : {}, i = String(e?.code || "").trim(), c = Number(e?.status);
  i && (s.errorCode = i), Number.isFinite(c) && (s.errorStatus = Math.floor(c)), Object.keys(s).length > 0 ? console[a](`[${o}] ${ie(e)}`, s) : console[a](`[${o}] ${ie(e)}`);
}
async function he(n, e, r = null, t = null) {
  try {
    return await n;
  } catch (a) {
    return Ne(e, a, r), t;
  }
}
function Te(n = "CONFIG_INVALID", e = "配置无效", r = 400, t = null) {
  const a = new Error(String(e || "配置无效"));
  return a.code = String(n || "CONFIG_INVALID"), a.status = De(r, 400), t != null && (a.details = t), a;
}
function Qt(n) {
  return n ? n.name === "AbortError" ? !0 : String(n.message || "").toLowerCase().includes("abort") : !1;
}
var vs = 4 * 1024 * 1024, rn = 64 * 1024, Fs = Object.freeze({
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
function xr(n, e) {
  const r = n.get("Vary");
  if (!r) {
    n.set("Vary", e);
    return;
  }
  const t = r.split(",").map((a) => a.trim()).filter(Boolean);
  t.includes(e) || t.push(e), n.set("Vary", t.join(", "));
}
function Ce(n) {
  return Object.entries(Fs).forEach(([e, r]) => n.set(e, r)), n;
}
function se(n) {
  return Array.isArray(n) || F(n) ? JSON.stringify(n) : n === void 0 ? "" : JSON.stringify(n);
}
var K = () => Date.now(), co = (n) => new Promise((e) => setTimeout(e, Math.max(0, Number(n) || 0))), cl = Object.freeze({
  JwtExpiry: 3600 * 24 * 30,
  LoginLockDuration: 900,
  MaxLoginAttempts: 5
}), Nt = Object.freeze({
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
}), ll = Object.freeze({
  EnableHostPrefixProxy: !1,
  MultiLinkCopyPanelEnabled: !1,
  DashboardShowD1WriteHotspot: !1,
  DashboardShowKvD1Status: !1,
  UiRadiusPx: 10,
  NodePanelPingAutoSort: !1
}), dl = Object.freeze({
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
}), ul = Object.freeze({
  ScheduledLeaseMinMs: 30 * 1e3,
  ScheduledLeaseMs: 300 * 1e3,
  ScheduleUtcOffsetMinutes: 480,
  TgDailyReportSummaryEnabled: !1,
  TgDailyReportKvEnabled: !1,
  TgDailyReportD1Enabled: !1,
  TgDailyReportClockTimes: ["09:00"]
}), Fe = Object.freeze({
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
}), fl = Object.freeze({
  ConfigSnapshotLimit: 5,
  DnsHistoryLimit: 5,
  DnsIpProbeCacheTtlSec: 600,
  DnsIpProbeTimeoutMs: 2500,
  DnsIpProbeConcurrency: 4,
  DnsIpWorkspaceSyncProbeLimit: 2,
  DnsIpSourceConcurrency: 4,
  DnsIpSourceFetchMaxBytes: 2 * 1024 * 1024,
  DnsIpSourceIpLimit: 5
}), ml = Object.freeze({
  CfQuotaPlanCacheMinutes: 60,
  CfQuotaPlanOverride: ""
}), pl = Object.freeze({
  AssetHash: "v19.3",
  Version: "19.3"
}), gl = Object.freeze({
  ...cl,
  ...Nt,
  ...ll,
  ...dl,
  ...ul,
  ...Fe,
  ...fl,
  ...ml,
  ...pl
}), O = Object.freeze({ Defaults: gl });
function ke(n) {
  return ue(n, O.Defaults.ScheduleUtcOffsetMinutes, -720, 840);
}
function ca(n = "", e = "00:00") {
  const r = String(e || "00:00").trim() || "00:00", t = String(n || "").trim().match(/^(\d{1,2}):(\d{1,2})$/);
  if (!t) return r;
  const a = Number(t[1]), o = Number(t[2]);
  return !Number.isInteger(a) || a < 0 || a > 23 || !Number.isInteger(o) || o < 0 || o > 59 ? r : `${String(a).padStart(2, "0")}:${String(o).padStart(2, "0")}`;
}
function Tt(n = [], e = []) {
  const r = Array.isArray(n) ? n : String(n || "").split(/[\r\n,]+/), t = [], a = /* @__PURE__ */ new Set();
  for (const o of r) {
    const s = ca(o, "");
    !s || a.has(s) || (a.add(s), t.push(s));
  }
  return t.sort((o, s) => Ar(o) - Ar(s)), t.length ? t : [...new Set((Array.isArray(e) ? e : [e]).map((o) => ca(o, "")).filter(Boolean))].sort((o, s) => Ar(o) - Ar(s));
}
function Ar(n = "") {
  const e = ca(n, "");
  if (!e) return -1;
  const [r, t] = e.split(":");
  return (Number(r) || 0) * 60 + (Number(t) || 0);
}
function hl(n = "") {
  const e = String(n || "").trim().match(/^(\d{4}-\d{2}-\d{2})\s+(\d{2}:\d{2})$/);
  return e ? {
    dateKey: e[1],
    clockTime: ca(e[2], "")
  } : {
    dateKey: "",
    clockTime: ""
  };
}
function yl(n, e = O.Defaults.ScheduleUtcOffsetMinutes) {
  const r = ke(e), t = n.getUTCFullYear(), a = String(n.getUTCMonth() + 1).padStart(2, "0"), o = String(n.getUTCDate()).padStart(2, "0"), s = String(n.getUTCHours()).padStart(2, "0"), i = String(n.getUTCMinutes()).padStart(2, "0"), c = String(n.getUTCSeconds()).padStart(2, "0"), l = String(n.getUTCMilliseconds()).padStart(3, "0"), d = r >= 0 ? "+" : "-", u = Math.abs(r);
  return `${t}-${a}-${o}T${s}:${i}:${c}.${l}${d}${String(Math.floor(u / 60)).padStart(2, "0")}:${String(u % 60).padStart(2, "0")}`;
}
function _a(n = /* @__PURE__ */ new Date(), e = O.Defaults.ScheduleUtcOffsetMinutes) {
  const r = ke(e), t = r * 60 * 1e3, a = n instanceof Date ? new Date(n.getTime()) : new Date(n), o = a.getTime() + t, s = new Date(o), i = s.getUTCFullYear(), c = String(s.getUTCMonth() + 1).padStart(2, "0"), l = String(s.getUTCDate()).padStart(2, "0"), d = String(s.getUTCHours()).padStart(2, "0"), u = String(s.getUTCMinutes()).padStart(2, "0"), f = String(s.getUTCSeconds()).padStart(2, "0"), m = String(s.getUTCMilliseconds()).padStart(3, "0"), p = Number(d), g = Number(u);
  return {
    now: a,
    shiftedDate: s,
    utcOffsetMinutes: r,
    offsetLabel: lo(r),
    dateKey: `${i}-${c}-${l}`,
    clockTime: `${d}:${u}`,
    hour: p,
    minute: g,
    second: Number(f),
    millisecond: Number(m),
    minuteOfDay: p * 60 + g,
    localIso: yl(s, r)
  };
}
function zo(n = /* @__PURE__ */ new Date(), e = O.Defaults.ScheduleUtcOffsetMinutes) {
  return _a(n, e).localIso;
}
function Bt(n = /* @__PURE__ */ new Date(), e = O.Defaults.ScheduleUtcOffsetMinutes) {
  return _a(n, e);
}
function pt(n = /* @__PURE__ */ new Date(), e = O.Defaults.ScheduleUtcOffsetMinutes, r = "") {
  const t = _a(n, e), a = ca(r || t.clockTime, t.clockTime), o = Ar(a), s = Date.UTC(t.shiftedDate.getUTCFullYear(), t.shiftedDate.getUTCMonth(), t.shiftedDate.getUTCDate()) - t.utcOffsetMinutes * 60 * 1e3, i = s + 1440 * 60 * 1e3 - 1, c = s + Math.max(0, o) * 60 * 1e3;
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
function Sl(n = /* @__PURE__ */ new Date(), e = O.Defaults.ScheduleUtcOffsetMinutes) {
  const r = Bt(n, e);
  return {
    ...r,
    slotKey: `${r.dateKey} ${r.clockTime}`
  };
}
function lo(n = O.Defaults.ScheduleUtcOffsetMinutes) {
  const e = ke(n), r = e >= 0 ? "+" : "-", t = Math.abs(e);
  return `UTC${r}${String(Math.floor(t / 60)).padStart(2, "0")}:${String(t % 60).padStart(2, "0")}`;
}
function _l(n = {}, e = "") {
  const r = n?.fixedQueue && typeof n.fixedQueue == "object" ? n.fixedQueue : {};
  let t = String(r.localDateKey || "").trim(), a = Tt(r.executedSlots || [], []);
  if (!t) {
    const o = hl(n?.lastPlannedSlot || "");
    o.dateKey && o.dateKey === e && (t = o.dateKey, a = Tt([...a, o.clockTime], []));
  }
  return !e || t !== e ? {
    localDateKey: e,
    executedSlots: []
  } : {
    localDateKey: t,
    executedSlots: a
  };
}
function bl(n = {}, e = [], r = O.Defaults.ScheduleUtcOffsetMinutes, t = /* @__PURE__ */ new Date()) {
  const a = _a(t, r), o = Tt(e, []), s = _l(n, a.dateKey);
  if (!o.length) return {
    due: !1,
    context: a,
    normalizedClockTimes: o,
    fixedQueue: s,
    dueSlots: [],
    reason: "no_clock_times_configured"
  };
  const i = new Set(Tt(s.executedSlots || [], [])), c = o.filter((d) => Ar(d) <= a.minuteOfDay), l = c.filter((d) => !i.has(d));
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
function Zt(n = "") {
  const e = String(n || "").trim().toLowerCase();
  return e === "inherit" ? "inherit" : e === "emby" ? "emby" : e === "jellyfin" ? "jellyfin" : e === "passthrough" ? "passthrough" : "auto";
}
function Tr(n = "") {
  const e = String(n || "").trim().toLowerCase();
  return e === "inherit" ? "inherit" : e === "forward" ? "forward" : e === "strip" ? "strip" : e === "disable" || e === "none" ? "disable" : "forward";
}
function wr(n = "") {
  const e = String(n || "").trim().toLowerCase();
  return e === "inherit" ? "inherit" : e === "rewrite" ? "rewrite" : e === "passthrough" ? "passthrough" : "inherit";
}
function er(n = "") {
  return String(n || "").trim().toLowerCase() === "host_prefix" ? "host_prefix" : "kv_route";
}
function Je(n = "") {
  return er(n) === "host_prefix";
}
function Us(n = "") {
  const e = String(n || "").trim().toLowerCase();
  return e === "emby" ? "emby" : e === "jellyfin" ? "jellyfin" : e === "passthrough" ? "passthrough" : "auto";
}
function zt(n = "") {
  return String(n || "").trim().toLowerCase() === "rewrite" ? "rewrite" : O.Defaults.DefaultPlaybackInfoMode;
}
function uo(n = "") {
  const e = String(n || "").trim().toLowerCase();
  return e === "strip" ? "strip" : e === "disable" || e === "none" ? "disable" : "forward";
}
function Or(n) {
  return ue(n, O.Defaults.DnsIpSourceIpLimit, 1, 1e3);
}
function an(n = "") {
  const e = String(n || "").trim().toLowerCase();
  return e === "direct" ? "direct" : e === "proxy" ? "proxy" : "inherit";
}
function vr(n = {}) {
  return an(n?.mainVideoStreamMode ?? n?.wangpanDirectMode ?? n?.wangpanMode);
}
function Fr(n = [], e = "") {
  const r = Array.isArray(n) ? n : String(n || "").split(/[,，\r\n]+/), t = [], a = /* @__PURE__ */ new Set();
  for (const o of [...r, e]) {
    const s = String(o || "").trim().slice(0, 24), i = s.toLowerCase();
    if (!(!s || a.has(i)) && (a.add(i), t.push(s), t.length >= 20))
      break;
  }
  return t;
}
var vn = /\b(?:(?:(?:25[0-5]|2[0-4]\d|1?\d?\d)\.){3}(?:25[0-5]|2[0-4]\d|1?\d?\d)|[0-9a-f:]{2,})\b/gi, Hs = {
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
}, $o = Object.freeze((() => {
  const n = {};
  for (const e of Object.values(Hs)) {
    const r = String(e?.countryCode || "").trim().toUpperCase(), t = String(e?.countryName || "").trim();
    !r || !t || n[r] || (n[r] = t);
  }
  return n.CN = n.CN || "中国", n.HK = n.HK || "中国香港", n.MO = n.MO || "中国澳门", n.TW = n.TW || "中国台湾", n;
})()), Yr = null;
function ba(n = "") {
  const e = String(n || "").trim();
  if (!e || !/^(?:\d{1,3}\.){3}\d{1,3}$/.test(e)) return !1;
  const r = e.split(".");
  return r.length === 4 && r.every((t) => {
    const a = Number(t);
    return Number.isInteger(a) && a >= 0 && a <= 255;
  });
}
function Rl(n = "") {
  if (!ba(n)) return !1;
  const [e = 0, r = 0] = String(n || "").trim().split(".").map((t) => Number(t));
  return e === 10 || e === 127 || e === 169 && r === 254 || e === 172 && r >= 16 && r <= 31 ? !0 : e === 192 && r === 168;
}
function nn(n = "") {
  const e = String(n || "").trim();
  if (!e || !e.includes(":") || /\s/.test(e)) return !1;
  try {
    return new URL(`http://[${e}]/`), !0;
  } catch {
    return !1;
  }
}
function ks(n = "") {
  return String(n || "").trim().toUpperCase() === "IPV6" ? "IPv6" : "IPv4";
}
function Qe(n = "") {
  return nn(n) ? "IPv6" : ba(n) ? "IPv4" : "";
}
function fo(n = "", e = {}) {
  const r = String(n || ""), t = /* @__PURE__ */ new Set(), a = [], o = Number(e?.limit), s = Number.isFinite(o) && o > 0 ? Math.max(1, Math.floor(o)) : Number.POSITIVE_INFINITY, i = (l) => {
    const d = String(l || "").trim();
    if (!d) return !1;
    const u = Qe(d);
    if (!u) return !1;
    const f = d.toLowerCase();
    return t.has(f) ? !1 : (t.add(f), a.push({
      ip: d,
      ipType: u
    }), a.length >= s);
  };
  vn.lastIndex = 0;
  let c = null;
  for (; (c = vn.exec(r)) !== null && !i(c[0]); ) ;
  return a;
}
function El(n = null) {
  const e = Array.isArray(n?.Answer) ? n.Answer : [], r = /* @__PURE__ */ new Set(), t = [];
  for (const a of e) {
    const o = String(a?.data || "").trim(), s = Qe(o);
    if (!s) continue;
    const i = o.toLowerCase();
    r.has(i) || (r.add(i), t.push({
      ip: o,
      ipType: s
    }));
  }
  return t;
}
function En(n = "") {
  return String(n || "").replace(/&nbsp;/gi, " ").replace(/&amp;/gi, "&").replace(/&lt;/gi, "<").replace(/&gt;/gi, ">").replace(/&quot;/gi, '"').replace(/&#39;/gi, "'");
}
function Al(n = "") {
  const e = /* @__PURE__ */ new Map(), r = String(n || ""), t = r.match(/\[[0-9a-f:]{2,}\]/gi) || [];
  for (const o of t) {
    const s = String(o || "").replace(/^\[|\]$/g, "").trim();
    Qe(s) && e.set(s.toLowerCase(), s);
  }
  const a = r.match(vn) || [];
  for (const o of a) {
    const s = String(o || "").trim();
    Qe(s) && e.set(s.toLowerCase(), s);
  }
  return [...e.values()];
}
function Cl(n = "") {
  const e = String(n || "").trim().toLowerCase();
  return e === "联通" ? "联通" : e === "电信" ? "电信" : e === "移动" ? "移动" : e === "多线" ? "多线" : e === "ipv6" ? "ipv6" : "";
}
function Bo(n = "", e = "") {
  const r = Cl(e);
  return r ? String(n || "").trim().toLowerCase() === r.toLowerCase() : !0;
}
function Tl(n = "", e = "") {
  const r = /* @__PURE__ */ new Map(), t = (s, i = "") => {
    const c = String(s || "").trim(), l = Qe(c);
    if (!l || Rl(c)) return;
    const d = c.toLowerCase(), u = Ur(i), f = r.get(d);
    if (!f) {
      r.set(d, {
        ip: c,
        ipType: l,
        lineLabel: u
      });
      return;
    }
    !Ur(f?.lineLabel) && u && r.set(d, {
      ...f,
      lineLabel: u
    });
  }, a = String(n || ""), o = a.match(/<tr\b[^>]*>[\s\S]*?<\/tr>/gi) || [];
  for (const s of o) {
    const i = s.match(/<t[dh]\b[^>]*>[\s\S]*?<\/t[dh]>/gi) || [];
    if (i.length < 3) continue;
    const c = En(String(i[1] || "").replace(/<[^>]+>/g, " ")).replace(/\s+/g, " ").trim();
    if (!Bo(c, e)) continue;
    const l = Al(En(String(i[2] || "").replace(/<[^>]+>/g, " "))).find((d) => Qe(d)) || "";
    l && t(l, c);
  }
  if (!r.size) {
    const s = En(a.replace(/<[^>]+>/g, `
`)), i = /(?:^|\n)\s*(?:\d+\s+)?(电信|联通|移动|多线|ipv6)\s+((?:(?:25[0-5]|2[0-4]\d|[01]?\d\d?)\.){3}(?:25[0-5]|2[0-4]\d|[01]?\d\d?)|(?:[a-f0-9]{1,4}:){2,}[a-f0-9:]{1,39})/gi;
    let c = null;
    for (; (c = i.exec(s)) !== null; )
      Bo(c[1], e) && t(c[2], c[1]);
  }
  return [...r.values()];
}
function wl(n = "", e = {}) {
  return fo(n, e);
}
function Dl(n = "") {
  const e = String(n || "").trim().toUpperCase(), r = Hs[e];
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
function Nl(n = "") {
  const e = String(n || "").trim().toUpperCase();
  if (!e || e === "UNKNOWN") return "未知";
  if ($o[e]) return $o[e];
  try {
    if (Yr === null && (Yr = typeof Intl?.DisplayNames == "function" ? new Intl.DisplayNames(["zh-CN"], { type: "region" }) : !1), Yr && typeof Yr.of == "function") {
      const r = String(Yr.of(e) || "").trim();
      if (r) return r;
    }
  } catch {
  }
  return e;
}
function Ks(n = "") {
  const e = String(n || "").trim();
  if (!e) return "";
  const r = e.match(/-([A-Za-z]{3,4})$/);
  return r ? String(r[1] || "").trim().toUpperCase() : "";
}
function Ll(n = "") {
  return `dns-ip-source-${ce(n || `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`)}`;
}
function St(n = "") {
  return String(n || "").trim().toLowerCase() === "domain" ? "domain" : "url";
}
var zs = Object.freeze([Object.freeze({
  id: "all",
  label: "麒麟优选",
  sourceType: "url",
  url: "https://api.uouin.com/cloudflare.html"
}), Object.freeze({
  id: "preferred",
  label: "CF-SPEED-DNS优选",
  sourceType: "url",
  url: "https://raw.githubusercontent.com/ZhiXuanWang/cf-speed-dns/refs/heads/main/ipTop10.html"
})]), $s = Object.freeze([
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
]), Ml = Object.freeze([
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
]), Il = Object.freeze([Object.freeze({
  label: "VPS789 优选IP",
  url: "https://vps789.com/cfip/"
}), Object.freeze({
  label: "Wetest IPv4 优选",
  url: "https://www.wetest.vip/page/cloudflare/address_v4.html"
})]);
function Pl(n = "") {
  const e = String(n || "").trim().toLowerCase();
  return e === "builtin" ? "builtin" : e === "preset" ? "preset" : "custom";
}
function Bs(n = "") {
  const e = String(n || "").trim().toLowerCase();
  return e === "preferred" ? "preferred" : e === "all" ? "all" : "";
}
function xl(n = "") {
  return String(n || "").trim().toLowerCase().replace(/[^a-z0-9_:-]+/g, "_");
}
function Ol(n = "") {
  const e = Bs(n);
  return zs.find((r) => r.id === e) || null;
}
function vl(n = "") {
  const e = xl(n);
  return e && $s.find((r) => r.id === e) || null;
}
function yr() {
  return {
    builtInSourceOptions: zs.map((n) => ({
      id: n.id,
      label: n.label,
      sourceType: n.sourceType,
      value: "domain" in n ? n.domain : n.url
    })),
    presetList: $s.map((n) => ({
      id: n.id,
      label: n.label,
      sourceType: n.sourceType,
      value: "domain" in n ? n.domain : n.url
    })),
    preferredDomainLinks: Ml.map((n) => ({ ...n })),
    preferredIpLinks: Il.map((n) => ({ ...n }))
  };
}
function Ur(n = "") {
  const e = String(n || "").trim().toLowerCase();
  return e.includes("联通") ? "联通" : e.includes("电信") ? "电信" : e.includes("移动") ? "移动" : e.includes("多线") ? "多线" : e.includes("ipv6") ? "ipv6" : "";
}
function Ws(n = {}) {
  const e = Pl(n?.sourceKind || n?.source_kind || ""), r = e === "builtin" ? Ol(n?.builtinId || n?.builtin_id || n?.presetId || n?.preset_id || n?.name) : null, t = e === "preset" ? vl(n?.presetId || n?.preset_id || n?.builtinId || n?.builtin_id || n?.name) : null, a = r || t || null, o = St(a?.sourceType || n?.sourceType || n?.source_type || ""), s = a && "url" in a ? a.url : "", i = a && "domain" in a ? a.domain : "", c = String(s || n?.url || "").trim(), l = ee(i || n?.domain || ""), d = String(n?.name || a?.label || "").trim();
  return {
    sourceKind: e,
    builtinId: r?.id || "",
    presetId: t?.id || "",
    name: d,
    sourceType: o,
    url: c,
    domain: l,
    resolvedLabel: String(a?.label || "").trim()
  };
}
function Vs(n = {}) {
  const e = Ws(n);
  return St(e.sourceType) === "domain" ? ee(e.domain || "") : String(e.url || "").trim();
}
function tr(n = {}) {
  return !!Vs(n);
}
function cr(n = {}, e = {}) {
  const r = String(n?.ip || n?.content || "").trim(), t = Qe(r);
  if (!r || !t) return null;
  const a = String(e.updatedAt || (/* @__PURE__ */ new Date()).toISOString()), o = String(n?.sourceKind || n?.source_kind || e.sourceKind || "manual").trim().toLowerCase() || "manual", s = String(n?.sourceLabel || n?.source_label || e.sourceLabel || "").trim(), i = Ur(n?.lineLabel || n?.line_label || e.lineLabel || ""), c = String(n?.remark || "").trim();
  return {
    id: String(n?.id || `dns-ip-${ce(r.toLowerCase())}`),
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
function wt(n = {}, e = 0) {
  const r = (/* @__PURE__ */ new Date()).toISOString(), t = Ws(n), a = t.sourceKind, o = St(t.sourceType), s = String(t.builtinId || n?.builtinId || n?.builtin_id || "").trim(), i = String(t.presetId || n?.presetId || n?.preset_id || "").trim(), c = String(t.resolvedLabel || "").trim(), l = String(t.url || "").trim(), d = ee(t.domain || ""), u = o === "domain" ? d : l, f = String(n?.name || c || "").trim(), m = n?.enabled, p = m == null ? !0 : !(m === !1 || m === 0 || String(m).trim() === "0");
  return {
    id: String(n?.id || Ll(`${a}|${s}|${i}|${o}|${u}|${e}`)),
    name: f || c || `抓取源 ${Number(e) + 1}`,
    url: l,
    domain: d,
    sourceType: o,
    sourceKind: a,
    presetId: i,
    builtinId: s,
    enabled: p,
    sortOrder: Math.max(0, Number.parseInt(String(n?.sortOrder ?? n?.sort_order ?? e), 10) || 0),
    ipLimit: Or(n?.ipLimit ?? n?.ip_limit),
    lastFetchAt: String(n?.lastFetchAt || n?.last_fetch_at || ""),
    lastFetchStatus: String(n?.lastFetchStatus || n?.last_fetch_status || ""),
    lastFetchCount: Math.max(0, Number(n?.lastFetchCount ?? n?.last_fetch_count) || 0),
    createdAt: String(n?.createdAt || n?.created_at || r),
    updatedAt: String(n?.updatedAt || n?.updated_at || r)
  };
}
function lr(n = []) {
  const e = [], r = /* @__PURE__ */ new Map();
  for (const t of Array.isArray(n) ? n : []) {
    const a = cr(t);
    if (!a) continue;
    const o = String(a.ip || "").trim().toLowerCase();
    if (!o) continue;
    const s = r.get(o);
    if (s === void 0) {
      r.set(o, e.length), e.push(a);
      continue;
    }
    const i = e[s];
    i && !Ur(i.lineLabel) && Ur(a.lineLabel) && (e[s] = {
      ...i,
      lineLabel: a.lineLabel
    });
  }
  return e;
}
function Fl(n = {}) {
  const e = cr(n);
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
function mo(n = []) {
  return lr(n).map((e) => Fl(e)).filter(Boolean);
}
function on(n = "") {
  const e = String(n || "").trim().toLowerCase();
  return e === "success" ? "success" : e === "failed" ? "failed" : "empty";
}
function Gs(n = {}, e = {}) {
  const r = wt(e), t = lr(n?.items || []).slice(0, Or(r?.ipLimit)), a = on(n?.status || (t.length ? "success" : "empty"));
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
function js(n = []) {
  return (Array.isArray(n) ? n : []).map((e) => {
    const r = Gs(e, e), t = mo(r?.items || []);
    return {
      id: String(r?.id || ""),
      name: String(r?.name || ""),
      sourceType: St(r?.sourceType || ""),
      status: on(r?.status),
      count: Math.max(0, Number(r?.count) || t.length),
      items: t,
      error: String(r?.error || ""),
      lastFetchAt: String(r?.lastFetchAt || "")
    };
  });
}
function Ul(n = []) {
  const e = Array.isArray(n) ? n : [];
  return e.length ? e.some((r) => on(r?.status) !== "failed") : !0;
}
function Ha(n) {
  const e = Number(n) || 0;
  return !Number.isFinite(e) || e <= 0 ? "" : new Date(e).toISOString();
}
function Ma(n = [], e = O.Defaults.DnsIpSourceFetchMaxBytes) {
  return ce(se({
    maxBytes: ue(e, O.Defaults.DnsIpSourceFetchMaxBytes, 1024, 8 * 1024 * 1024),
    enabledSources: (Array.isArray(n) ? n : []).map((r, t) => wt(r, t)).filter((r) => r.enabled === !0 && tr(r)).map((r) => ({
      id: String(r.id || ""),
      name: String(r.name || ""),
      sourceType: St(r.sourceType),
      target: Vs(r),
      ipLimit: Or(r.ipLimit),
      enabled: r.enabled !== !1
    }))
  }));
}
function Hl(n = "") {
  return String(n || "").trim().toLowerCase() === "shared_snapshot" ? "shared_snapshot" : "local_pool";
}
function qs(n = []) {
  const e = [], r = /* @__PURE__ */ new Set();
  for (const t of Array.isArray(n) ? n : []) {
    const a = String(t?.ip || t || "").trim();
    if (!Qe(a)) continue;
    const o = a.toLowerCase();
    r.has(o) || (r.add(o), e.push(a));
  }
  return {
    normalizedIps: e,
    deleteKeySet: r
  };
}
function Wo(n = [], e = /* @__PURE__ */ new Set()) {
  const r = [], t = [];
  for (const a of lr(n)) {
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
function kl(n = {}, e = []) {
  const { deleteKeySet: r } = qs(e), t = lr(n?.items || []), a = Array.isArray(n?.sourceResults) ? n.sourceResults : [];
  if (!r.size) return {
    deletedCount: 0,
    deletedIps: [],
    items: t,
    sourceResults: a
  };
  const { keptItems: o, removedItems: s } = Wo(t, r), i = new Set(s.map((l) => String(l?.ip || "").trim().toLowerCase()).filter(Boolean)), c = a.map((l) => {
    const { keptItems: d } = Wo(l?.items || [], i), u = on(l?.status) === "failed" ? "failed" : d.length ? "success" : "empty";
    return {
      id: String(l?.id || ""),
      name: String(l?.name || ""),
      sourceType: St(l?.sourceType || l?.source_type || ""),
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
    items: o,
    sourceResults: c
  };
}
function Ia(n = "") {
  const e = String(n || "").trim().toLowerCase();
  return e === "ok" ? "ok" : e === "pending" ? "pending" : e === "cf_header_missing" ? "cf_header_missing" : e === "non_cloudflare" ? "non_cloudflare" : e === "timeout" ? "timeout" : "network_error";
}
function An(n = []) {
  const e = Array.isArray(n) ? n : [], r = /* @__PURE__ */ new Set(), t = /* @__PURE__ */ new Set();
  let a = 0, o = 0;
  for (const s of e) {
    ks(s?.ipType || s?.ip_type || s?.type || "") === "IPv6" ? o += 1 : a += 1;
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
function Kl(n = [], e = []) {
  const r = Array.isArray(n) ? n : [], t = Array.isArray(e) ? e : [];
  return {
    currentHost: An(r),
    sharedPool: An(t),
    combined: An([...r, ...t])
  };
}
function zl(n = "") {
  const e = String(n || "").trim().toLowerCase();
  if (!e) return "";
  const r = e.endsWith(".") ? e.slice(0, -1) : e;
  return !r || r.length > 253 || r.endsWith(".") || /\s|[:\/@*?#\\]/.test(r) || ba(r) || nn(r) || r.split(".").some((t) => !Ra(t)) ? "" : r;
}
function $e(n) {
  return zl(n?.HOST);
}
function Hr(n) {
  return ee(n?.LEGACY_HOST);
}
function $l(n) {
  const e = $e(n), r = Hr(n), t = po(r, e);
  return t?.prefix ? {
    name: String(t.prefix || "").trim().toLowerCase(),
    reservedBy: r,
    reason: "legacy_host",
    legacyHost: r,
    host: e
  } : null;
}
function la(n, e) {
  const r = ee(n), t = ee(e);
  return !r || !t ? !1 : r === t || r.endsWith(`.${t}`);
}
function Ra(n = "") {
  const e = String(n || "").trim().toLowerCase();
  return !e || e.length > 63 ? !1 : /^[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?$/.test(e);
}
function $t(n = "") {
  const e = String(n || "").trim().toLowerCase().replace(/\.+$/, "");
  return !e || e.length > 253 || /\s|[:/@*]/.test(e) || ba(e) || nn(e) || e.split(".").some((r) => !Ra(r)) ? "" : e;
}
function Xs(n = "") {
  const e = String(n || "").trim();
  return !e || $t(e) ? "" : "CNAME 指向必须是合法主机名，不能包含协议、端口、路径、通配符、空格或 IP 地址";
}
function Bl(n = "", e = "defaultHostPrefixCnameTarget") {
  const r = Xs(n);
  if (r)
    throw Te("HOST_PREFIX_CNAME_TARGET_INVALID", r, 400, {
      field: e,
      value: String(n || "").trim()
    });
}
function ka(n = null, e = {}, r = "") {
  return $t(n?.hostPrefixCnameTarget) || $t(e?.defaultHostPrefixCnameTarget) || ee(r);
}
function po(n = "", e = "") {
  const r = ee(n), t = ee(e);
  if (!r || !t || r === t) return null;
  const a = `.${t}`;
  if (!r.endsWith(a)) return null;
  const o = r.slice(0, -a.length);
  return !o || o.includes(".") || !Ra(o) ? null : {
    hostname: r,
    host: t,
    prefix: o
  };
}
function Ys(n) {
  const e = String(n || "").trim();
  if (!e) return null;
  const r = e.indexOf("/"), t = r === -1 ? e : e.slice(0, r), a = r === -1 ? "" : e.slice(r), o = ro(t);
  return o ? {
    ...o,
    path: a,
    pattern: e
  } : null;
}
function go(n, e = {}) {
  const r = String(e.path || "");
  let t = 0;
  return e.wildcard || (t += 100), n.includes(".workers.dev") && (t -= 20), r === "/" || r === "/*" ? t += 20 : r.endsWith("*") ? t += 10 : r && (t += 4), t += n.split(".").length * 4, t -= Math.min(r.length, 30), t;
}
var Wl = "https://admin-local-index.invalid", Vl = "local-", Gl = "sys:admin_index_upload:v1:", jl = "sys:admin_index_active:v2";
function Dr(n = "") {
  const e = String(n || "").trim();
  if (!e) return "";
  try {
    const r = new URL(e);
    return ["http:", "https:"].includes(r.protocol) ? r.toString() : "";
  } catch {
    return "";
  }
}
function ql(n = "") {
  const e = String(n || "").trim();
  return !(!e || /[\x00-\x20~^:?*[\\\]]/.test(e) || e.includes("..") || e.includes("@{") || e.includes("//") || e.startsWith("/") || e.endsWith("/") || e.endsWith(".") || e.endsWith(".lock"));
}
function dt(n = "") {
  const e = String(n || "").trim();
  return ql(e) ? e : "";
}
function Ct(n = "") {
  const e = String(n || "").trim().toLowerCase();
  return /^[a-f0-9]{64}$/.test(e) ? e : "";
}
function kr(n = "") {
  const e = Ct(n);
  return e ? `${Wl}/${e}/index.html` : "";
}
function qe(n = "") {
  const e = Dr(n);
  if (!e) return "";
  try {
    const r = new URL(e);
    return r.origin !== "https://admin-local-index.invalid" || r.search || r.hash ? "" : Ct(r.pathname.match(/^\/([a-f0-9]{64})\/index\.html$/i)?.[1] || "");
  } catch {
    return "";
  }
}
function ho(n = "") {
  const e = Ct(n);
  return e ? `${Vl}${e}` : "";
}
function Xl(n = "") {
  const e = String(n || "").trim().toLowerCase();
  return e.startsWith("local-") ? Ct(e.slice(6)) : "";
}
function ut(n = null, e = {}) {
  const r = Dr((F(e) ? e : {}).indexUrl), t = qe(r), a = !!t, o = a ? kr(t) : "";
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
    assetRevision: a ? ho(t) : "",
    hasGithubRelease: !1,
    hasLocalUpload: a,
    hasDerivedIndexUrl: !1,
    gateState: o ? "shell_ready" : "setup_required"
  };
}
function Yl(n = {}) {
  const e = String(F(n) && n.indexUrl || "").trim();
  if (!(!e || qe(e)))
    throw Te("ADMIN_INDEX_SOURCE_UPLOAD_ONLY", "管理台 HTML 仅支持本地上传，请通过启动门或 Worker 和 HTML 更新面板提交 index.html", 400, { field: "indexUrl" });
}
function Js(n = {}, e = null) {
  const r = String(e?.HOST || "").trim(), t = $e(e), a = String(n?.cfZoneId || "").trim(), o = String(n?.cfApiToken || "").trim(), s = [], i = [];
  return r ? t || i.push("HOST") : s.push("HOST"), a || s.push("cfZoneId"), o || s.push("cfApiToken"), {
    host: t,
    cfZoneId: a,
    cfApiToken: o,
    missingFields: s,
    invalidFields: i
  };
}
function Qs(n = {}) {
  if (!(!Array.isArray(n?.invalidFields) || !n.invalidFields.includes("HOST")))
    throw Te("HOST_PREFIX_HOST_INVALID", "HOST 必须是合法 DNS 主机名，不能包含协议、用户信息、端口、路径、通配符、下划线、空标签或 IP 地址", 400, {
      field: "HOST",
      reason: "invalid_hostname"
    });
}
function Jl(n = {}, e = null) {
  if (n?.enableHostPrefixProxy !== !0) return;
  const r = Js(n, e);
  if (Qs(r), !(r.missingFields.length <= 0))
    throw Te("HOST_PREFIX_PROXY_CONFIG_REQUIRED", "启用域名前缀代理前，必须先配置 HOST、Cloudflare Zone ID 和 API 令牌", 400, {
      missingFields: r.missingFields,
      host: r.host
    });
}
function na(n = {}, e = null) {
  const r = Js(n, e);
  if (Qs(r), r.missingFields.length <= 0) return r;
  throw Te("HOST_PREFIX_DNS_CONFIG_REQUIRED", "保存域名前缀节点前，必须先配置 HOST、Cloudflare Zone ID 和 API 令牌", 400, {
    missingFields: r.missingFields,
    host: r.host
  });
}
function Cn(n = [], e = {}, r = null) {
  return (Array.isArray(n) ? n : [n]).some((t) => Je(t?.nextNode?.entryMode)) ? na(e, r) : null;
}
var Ql = Fe.PingTimeoutMs, Zl = Fe.UpstreamTimeoutMs, Fn = Fe.UpstreamRetryAttempts, Zs = Fe.HedgeProbePath, ed = "/emby/system/info/public", yo = Fe.HedgeProbeTimeoutMs, ei = Fe.HedgeProbeParallelism, ti = Fe.HedgeWaitTimeoutMs, ri = Fe.HedgeLockTtlMs, Zr = Fe.HedgePreferredTtlSec, ai = Fe.HedgeFailureCooldownSec, ni = Fe.HedgeWakeJitterMs, td = Fe.BufferedRetryBodyMaxBytes, rd = Fe.MetadataPrewarmTimeoutMs, ad = Fe.PrewarmCacheTtl;
Fe.DefaultPlaybackInfoMode;
var nd = Nt.PlaybackInfoCacheTtlSec, oi = Nt.PlaybackInfoCacheEntryMaxBytes, od = Nt.PlaybackInfoCacheTotalMaxBytes, si = Nt.VideoProgressForwardIntervalSec, sd = Nt.VideoProgressSnapshotMaxBytes, ii = Nt.CacheTtlImagesDays, id = Nt.PlaybackRouteHotCacheTtlMs, rr = Nt.PlaybackRouteHotCacheMax, ci = 12 * 1024 * 1024, cd = ci - 64 * 1024, li = 512 * 1024, Kr = /\.(?:jpg|jpeg|gif|png|svg|ico|webp)$/i, ld = /\.(?:js|css|woff2?|ttf|otf|map|webmanifest)$/i, dr = /\.(?:srt|ass|vtt|sub)$/i, zr = /(?:\/Images\/|\/Icons\/|\/Branding\/|\/emby\/covers\/)/i, ht = /\.(?:m3u8|mpd)$/i, di = /\.(?:ts|m4s)$/i, dd = /\.(?:mp4|m4v|m4a|ogv|webm|mkv|mov|avi|wmv|flv)$/i, Un = /* @__PURE__ */ new Set([
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
]), ud = /* @__PURE__ */ new Set([
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
]), fd = /* @__PURE__ */ new Set([
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
]), So = "legacy_proxy_ctx", md = 86400, sn = [So, "emby_web_bypass"], pd = /* @__PURE__ */ new Set([
  "users",
  "items",
  "videos",
  "audio",
  "livetv",
  "sessions",
  "system"
]);
function Ea(n, e, r = null) {
  const t = e.headers.get("Origin"), a = e.headers.get("Access-Control-Request-Headers") || aa["Access-Control-Allow-Headers"];
  return {
    "Access-Control-Allow-Origin": r || t || aa["Access-Control-Allow-Origin"],
    "Access-Control-Allow-Methods": aa["Access-Control-Allow-Methods"],
    "Access-Control-Allow-Headers": a,
    "Access-Control-Expose-Headers": "Content-Length, Content-Range",
    "Access-Control-Max-Age": "86400"
  };
}
function Dt(n = "") {
  if (!n) return "";
  try {
    return decodeURIComponent(n);
  } catch {
    return n;
  }
}
function Z(n) {
  let e = typeof n == "string" ? n : "/";
  return e ? (e.startsWith("/") || (e = "/" + e), e = e.replace(/^\/+/, "/"), e) : "/";
}
function da(n = "") {
  let e = Z(n);
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
function Ka(n = "") {
  const e = String(n || ""), r = new TextEncoder().encode(e);
  let t = "";
  for (const a of r) t += String.fromCharCode(a);
  return btoa(t).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "");
}
function za(n = "") {
  const e = String(n || "").trim().replace(/-/g, "+").replace(/_/g, "/");
  if (!e) return "";
  const r = e.length % 4, t = e + (r ? "=".repeat(4 - r) : ""), a = atob(t), o = Uint8Array.from(a, (s) => s.charCodeAt(0));
  return new TextDecoder().decode(o);
}
function ui(n) {
  const e = "/admin", r = String(n || "").trim();
  if (!r) return e;
  let t = Z(r);
  return t = t.replace(/\/{2,}/g, "/"), t.length > 1 && (t = t.replace(/\/+$/, "")), !t || t === "/" || t.toLowerCase().startsWith("/api") ? e : t;
}
function fi(n, e) {
  const r = Z(n || "/"), t = Z(e || "/");
  return r === t || r.startsWith(t + "/");
}
function Rr(n, e) {
  const r = Z(n || "/"), t = Z(e || "/");
  return !t || t === "/" ? r === t : r === t || r === `${t}/`;
}
function et(n) {
  return ui(n?.ADMIN_PATH);
}
function cn(n = "/admin") {
  const e = ui(n);
  return e === "/" ? "/login" : `${e}/login`;
}
function _o(n) {
  return cn(et(n));
}
function gd(n) {
  const e = et(n), r = Z(e).toLowerCase(), t = [], a = r.split("/").filter(Boolean).map((o) => Dt(o).toLowerCase());
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
function hd(n, e) {
  const r = String(n || "").trim().toLowerCase();
  return r && gd(e).find((t) => t.name === r) || null;
}
function mi(n = {}) {
  return String(n?.name || "").trim() ? String(n?.target || "").trim() ? !0 : Array.isArray(n?.lines) && n.lines.length > 0 : !1;
}
function Vo(n, e) {
  const r = Array.isArray(n) ? n : [n];
  for (const t of r) {
    if (!mi(t) || Je(t?.entryMode)) continue;
    const a = hd(t?.name, e);
    if (a)
      return {
        ...a,
        name: String(t?.name || "").trim().toLowerCase()
      };
  }
  return null;
}
function yd(n = {}, e = null) {
  if (!Je(n?.entryMode)) return null;
  const r = String(n?.name || "").trim().toLowerCase();
  if (!r) return {
    code: "HOST_PREFIX_REQUIRED",
    message: "域名前缀不能为空",
    name: r
  };
  if (!Ra(r)) return {
    code: "HOST_PREFIX_INVALID",
    message: "域名前缀仅支持小写字母、数字、连字符，且不能以下划线、点或连字符结尾",
    name: r
  };
  const t = $l(e);
  if (t && t.name === r) return {
    code: "HOST_PREFIX_RESERVED_BY_LEGACY_HOST",
    message: "该域名前缀已被旧部署子域兼容入口保留，请更换后重试",
    name: r,
    reservedBy: t.reservedBy,
    reason: t.reason,
    legacyHost: t.legacyHost,
    host: t.host
  };
  const a = Xs(n?.hostPrefixCnameTarget);
  return a ? {
    code: "HOST_PREFIX_CNAME_TARGET_INVALID",
    message: a,
    field: "hostPrefixCnameTarget",
    value: String(n?.hostPrefixCnameTarget || "").trim(),
    name: r
  } : null;
}
function Go(n, e = null) {
  const r = Array.isArray(n) ? n : [n];
  for (const t of r) {
    if (!mi(t)) continue;
    const a = yd(t, e);
    if (a) return a;
  }
  return null;
}
function Sd(n) {
  const e = et(n);
  return e === "/" ? "/" : e;
}
function Re(n) {
  return String(n ?? "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#39;");
}
function $r(n) {
  return JSON.stringify(n).replace(/</g, "\\u003c").replace(/>/g, "\\u003e").replace(/&/g, "\\u0026").replace(/\u2028/g, "\\u2028").replace(/\u2029/g, "\\u2029");
}
function He(n, e = null) {
  const r = [];
  n?.JWT_SECRET || r.push("JWT_SECRET"), n?.ADMIN_PASS || r.push("ADMIN_PASS");
  const t = typeof e?.adminPath == "string" ? e.adminPath : et(n), a = typeof e?.loginPath == "string" ? e.loginPath : cn(t);
  return {
    ok: r.length === 0,
    missing: r,
    adminPath: t,
    loginPath: a,
    message: r.length ? `系统未初始化：缺少 ${r.join("、")}。` : "系统初始化检查通过。"
  };
}
function pi(n, e = null) {
  const r = He(n, e);
  if (r.ok) return r;
  const t = r.missing.join("|") || "unknown";
  return Ye.InitCheckWarnedFingerprints.has(t) || (Ye.InitCheckWarnedFingerprints.size >= 32 && Ye.InitCheckWarnedFingerprints.clear(), Ye.InitCheckWarnedFingerprints.add(t), console.warn(`[Init Check] ${r.message} 管理入口: ${r.adminPath}`)), r;
}
function Hn(n) {
  if (!n || n.ok) return "";
  const e = Array.isArray(n.missing) && n.missing.length ? n.missing.map((r) => `<code class="rounded bg-amber-100/80 px-1.5 py-0.5 text-[11px] font-semibold text-amber-700">${Re(r)}</code>`).join(" ") : '<code class="rounded bg-amber-100/80 px-1.5 py-0.5 text-[11px] font-semibold text-amber-700">UNKNOWN</code>';
  return `<div id="init-health-banner" class="mx-4 mt-4 rounded-2xl border border-amber-200 bg-amber-50/95 px-4 py-3 text-sm text-amber-900 shadow-sm"><div class="flex flex-col gap-1 md:flex-row md:items-center md:justify-between"><div class="font-semibold">系统未初始化</div><div class="text-xs text-amber-700">管理入口：${Re(n.adminPath || "/admin")}</div></div><p class="mt-2 leading-6">检测到关键环境变量缺失：${e}</p><p class="mt-1 text-xs leading-5 text-amber-700">请先在 Cloudflare Worker 环境变量中补齐后再使用管理台登录与敏感操作。</p></div>`;
}
function ea(n) {
  return String(n?.cf?.colo || "").trim().toUpperCase() || "UNKNOWN";
}
function $a(n) {
  return Ks(String(n?.headers?.get?.("CF-RAY") || n?.headers?.get?.("cf-ray") || "").trim());
}
function _d(n) {
  return String(n?.cf?.country || "").trim().toUpperCase() || "UNKNOWN";
}
function bd(n) {
  const e = _d(n);
  return {
    countryCode: e,
    countryName: Nl(e)
  };
}
function Rd(n = {}, e = {}) {
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
    const V = new Headers({
      "Content-Type": "image/svg+xml;charset=UTF-8",
      "Cache-Control": "public, max-age=86400, s-maxage=604800, immutable"
    });
    return Ce(V), new Response(z === "HEAD" ? null : o, { headers: V });
  }
  const c = Object.freeze([
    "__ADMIN_BOOTSTRAP_JSON__",
    "__INIT_HEALTH_BANNER__",
    "__ADMIN_APP_ROOT__"
  ]), l = "embedded-fallback-v1", d = m(t), u = "minimal-split-parts", f = !0;
  function m(z = "") {
    const V = String(z || ""), q = [];
    let X = 0;
    for (const Y of c) {
      const re = V.indexOf(Y, X);
      if (re < 0) throw new Error(`missing admin html placeholder: ${Y}`);
      q.push(V.slice(X, re)), X = re + Y.length;
    }
    return q.push(V.slice(X)), q;
  }
  function p(z = [], V = {}) {
    let q = String(z[0] || "");
    for (let X = 0; X < c.length; X += 1) {
      const Y = c[X];
      q += String(V[Y] || ""), q += String(z[X + 1] || "");
    }
    return q;
  }
  const g = "__ADMIN_BOOTSTRAP_JSON__", h = "__INIT_HEALTH_BANNER__", y = "__ADMIN_APP_ROOT__", S = "", _ = "https://admin-shell-cache.invalid", A = "private, no-store, max-age=0", b = "public, max-age=31536000, immutable", R = 300 * 1e3, E = 2 * 1024 * 1024, w = "bootstrap-tailwind-assets-v3-active-index", D = "X-Admin-Shell-Cached-At", C = "X-Admin-Shell-Source-Etag", T = "X-Admin-Shell-Source-Last-Modified", I = "X-Admin-Shell-Source-Hash", x = "__release", U = "vendor", k = "__warm", G = "https://admin-release-vendor-cache.invalid", P = "https://admin-release-vendor-manifest.invalid", N = "public, max-age=31536000, immutable", L = "no-store, max-age=0", M = 8 * 1024 * 1024, v = 3, W = "X-Admin-Release-Vendor-Cached-At", $ = "X-Admin-Release-Vendor-Source-Hash", H = Object.freeze([
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
  function me(z, V = He(z), q = {}) {
    return {
      adminPath: et(z),
      loginPath: _o(z),
      initHealth: V,
      hostDomain: $e(z),
      contract: fe(),
      shell: rt(z, V, q)
    };
  }
  function le() {
    if (a >= 0) return a;
    if (!Array.isArray(d) || d.length !== c.length + 1)
      return a = 0, 0;
    const z = new TextEncoder();
    let V = 0;
    for (let q = 0; q < d.length; q += 1)
      V += z.encode(String(d[q] || "")).length, q < c.length && (V += z.encode(c[q]).length);
    return a = V, a;
  }
  function pe(z = !1, V = "") {
    const q = String(V || "").trim().toLowerCase();
    return z ? "remote_ready" : q === "setup_required" ? "setup_required" : "embedded_only";
  }
  function Oe(z = !1, V = f) {
    return z ? V ? "embedded_fallback_retained" : "legacy_inline_shell_active" : "embedded_fallback_missing";
  }
  function Be(z = "embedded", V = "") {
    return String(z || "").trim().toLowerCase() === "gate" || String(V || "").trim() === "setup_gate" ? "setup_gate" : String(z || "").trim().toLowerCase() === "remote" ? "remote_shell" : String(V || "").trim() === "embedded_fallback" ? "embedded_fallback" : "embedded_shell";
  }
  function Mt(z = !1, V = "") {
    return z ? String(V || "").trim() === "embedded_fallback" ? "active" : "retained" : "missing";
  }
  function rt(z, V = He(z), q = {}) {
    const X = ut(z, q), Y = X.indexUrl, re = le(), ge = !!Y, ve = !!(z?.ASSETS && typeof z.ASSETS.fetch == "function"), ze = !ge && ve ? "shell_ready" : X.gateState, Me = re > 0;
    let Ve = "";
    if (Y) try {
      Ve = new URL(Y).origin;
    } catch {
      Ve = "";
    }
    return {
      mode: ge ? "remote-preferred" : ve ? "embedded" : "setup_required",
      lifecycleState: pe(ge, ze),
      embeddedFallbackState: Me ? "retained" : "missing",
      retirementState: Oe(Me),
      gateState: ze,
      indexUrl: X.indexUrl,
      indexUrlSource: X.indexUrlSource,
      effectiveRef: X.effectiveRef,
      remoteShellConfigured: ge,
      remoteShellIndexUrl: Y,
      remoteShellOrigin: Ve,
      bundledShellAvailable: ve,
      bundledShellSource: ve ? "frontend/dist/index.html" : "",
      initHealthOk: V?.ok === !0,
      embeddedFallbackAvailable: Me,
      embeddedTemplateSource: u,
      embeddedTemplateMode: u,
      embeddedTemplateBytes: re,
      finalUiHtmlRetired: f
    };
  }
  function It(z, V = {}) {
    return ut(z, V).indexUrl;
  }
  function Pt(z = {}) {
    const V = F(z.shellState) ? z.shellState : {}, q = F(z.initHealth) ? z.initHealth : {}, X = F(z.indexState) ? z.indexState : {}, Y = String(z.remoteShellIndexUrl || V.remoteShellIndexUrl || X.indexUrl || "").trim(), re = String(z.mode || "").trim().toLowerCase(), ge = re === "remote" ? "remote" : re === "gate" ? "gate" : "embedded", ve = V.remoteShellConfigured === !0 || !!Y, ze = V.embeddedFallbackAvailable === !0, Me = V.finalUiHtmlRetired !== !1, Ve = String(z.routeState || "").trim() || (ge === "remote" ? "remote_active" : ge === "gate" ? "setup_gate" : "embedded_active"), Rt = String(z.lifecycleState || V.lifecycleState || "").trim() || pe(ve, z.gateState || V.gateState || X.gateState || ""), st = String(z.embeddedFallbackState || V.embeddedFallbackState || "").trim() || Mt(ze, Ve), hr = String(z.retirementState || V.retirementState || "").trim() || Oe(ze, Me), Xr = String(z.gateState || V.gateState || X.gateState || (Y ? "shell_ready" : "setup_required")).trim() || "setup_required";
    return {
      ...V,
      mode: ge,
      effectiveMode: Be(ge, Ve),
      gateState: Xr,
      lifecycleState: Rt,
      embeddedFallbackState: st,
      retirementState: hr,
      sourceType: String(z.sourceType || "").trim().toLowerCase() || (ge === "remote" ? "remote_fetch" : ge === "gate" ? "setup_gate" : "embedded_local"),
      routeState: Ve,
      indexUrl: String(z.indexUrl || V.indexUrl || X.indexUrl || Y).trim(),
      indexUrlSource: String(z.indexUrlSource || V.indexUrlSource || X.indexUrlSource || "").trim(),
      effectiveRef: String(z.effectiveRef || V.effectiveRef || X.effectiveRef || "").trim(),
      effectiveRefType: String(z.effectiveRefType || V.effectiveRefType || X.effectiveRefType || "").trim(),
      remoteShellIndexUrl: Y,
      remoteShellOrigin: String(V.remoteShellOrigin || "").trim(),
      remoteCacheState: String(z.remoteCacheState || "").trim().toLowerCase(),
      revalidateDue: z.revalidateDue === !0,
      lastFetchStatus: String(z.lastFetchStatus || "").trim().toLowerCase(),
      reason: String(z.reason || "").trim(),
      requestPath: String(z.requestPath || "").trim(),
      initHealthOk: q.ok === !0,
      initHealthMissing: [...new Set((Array.isArray(q.missing) ? q.missing : []).map((Da) => String(Da || "").trim()).filter(Boolean))],
      fallbackRetained: ze,
      templateMode: String(V.embeddedTemplateMode || V.embeddedTemplateSource || "").trim() || u,
      finalUiHtmlRetired: Me,
      updatedAt: String(z.updatedAt || "").trim() || (/* @__PURE__ */ new Date()).toISOString()
    };
  }
  async function Gr(z, V = {}, q = null) {
    const X = F(V.shellState) ? V.shellState : rt(z, V.initHealth, V.config || {}), Y = Pt({
      ...V,
      shellState: X
    }), re = r.resolveOpsStatusStores(z).db, { updatedAt: ge, ...ve } = Y, ze = ce(se(ve)), Me = re ? Q.AdminShellStatusWriteState.get(re) : null, Ve = Math.max(1e3, Number(O.Defaults.AdminShellStatusStableWriteIntervalMs) || 1e3);
    if (V.throttleStableWrites === !0 && Me?.fingerprint === ze) {
      if (Me.writePromise) return Me.writePromise;
      if (K() - (Number(Me.writtenAt) || 0) < Ve) return null;
    }
    const Rt = he(Promise.resolve(r.patchOpsStatus(z, { adminShell: Y }, q)).then((st) => ({
      ok: !0,
      result: st
    })), "admin.shell_status_patch", {
      requestPath: Y.requestPath,
      mode: Y.mode,
      sourceType: Y.sourceType
    }, {
      ok: !1,
      result: null
    }).then((st) => (!re || Q.AdminShellStatusWriteState.get(re)?.writePromise !== Rt || (st?.ok === !0 ? Q.AdminShellStatusWriteState.set(re, {
      fingerprint: ze,
      writtenAt: K(),
      writePromise: null
    }) : Me ? Q.AdminShellStatusWriteState.set(re, Me) : Q.AdminShellStatusWriteState.delete(re)), st?.result ?? null));
    return re && Q.AdminShellStatusWriteState.set(re, {
      fingerprint: ze,
      writtenAt: 0,
      writePromise: Rt
    }), Rt;
  }
  function xt(z = {}, V, q = {}, X = He(V)) {
    const Y = F(z) ? z : {}, re = ut(V, q), ge = rt(V, X, q);
    return {
      ...Y,
      adminShell: Pt({
        ...F(Y.adminShell) ? Y.adminShell : {},
        shellState: ge,
        initHealth: X,
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
  function mr(z = "") {
    const V = String(z || "").trim();
    if (!V) return "已上传的管理台 HTML 暂时不可用，请重新上传。";
    if (V.startsWith("remote_shell_render_failed")) {
      const q = V.replace(/^remote_shell_render_failed:\s*/i, "").trim();
      return q ? `Worker 读取 index.html 失败：${q}` : "Worker 读取 index.html 失败。";
    }
    return V;
  }
  function Ot(z = {}, V = {}, q = {}, X = {}) {
    const Y = String(z.adminPath || "/admin").trim() || "/admin", re = String(X.remoteShellIndexUrl || V.remoteShellIndexUrl || "").trim(), ge = mr(X.reason || ""), ve = `${Y}?setup=1`;
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
            <p class="admin-remote-error-desc">${Re(ge)}</p>
          </div>
          <div class="admin-remote-error-body">
            <div class="admin-remote-error-grid">
              <article class="admin-remote-error-stat"><div class="admin-remote-error-k">错误原因</div><div class="admin-remote-error-v">${Re(ge)}</div></article>
              <article class="admin-remote-error-stat"><div class="admin-remote-error-k">本地版本标识</div><div class="admin-remote-error-v">${Re(re || "未找到本地 HTML 版本")}</div></article>
            </div>
            <div class="admin-remote-error-actions">
              <a href="${Re(Y)}" class="admin-remote-error-btn admin-remote-error-btn-primary">刷新 /admin</a>
              <a href="${Re(ve)}" class="admin-remote-error-btn admin-remote-error-btn-secondary">重新上传 index.html</a>
            </div>
            <p class="admin-remote-error-note">如果这里继续报错，请重新上传与当前 Worker 匹配的 index.html。</p>
          </div>
        </section>
      </div>`;
  }
  function at(z = {}, V = {}, q = {}, X = {}, Y = {}) {
    const re = String(z.adminPath || "/admin").trim() || "/admin", ge = Y?.isLocalUpload === !0, ve = $r({ adminPath: re });
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
  function jr(z = "{}", V = "", q = S) {
    return !Array.isArray(d) || d.length !== c.length + 1 ? "" : p(d, {
      [g]: String(z || "{}"),
      [h]: String(V || ""),
      [y]: String(q || S)
    });
  }
  function pr(z = {}, V = null, q = S) {
    const X = F(z) ? z : {}, Y = F(V) ? V : F(X.initHealth) ? X.initHealth : {}, re = {
      templateRevision: String(l).trim() || "admin-shell",
      adminPath: String(X.adminPath || "").trim(),
      loginPath: String(X.loginPath || "").trim(),
      hostDomain: ee(X.hostDomain),
      contractHash: ce(se(X.contract || fe())),
      initHealthOk: Y.ok === !0,
      initHealthMissing: [...new Set((Array.isArray(Y.missing) ? Y.missing : []).map((ge) => String(ge || "").trim()).filter(Boolean))],
      appRootHash: ce(String(q || S))
    };
    return `${re.templateRevision}-${ce(se(re))}`;
  }
  function nt(z = "") {
    return `"${String(z || "").trim()}"`;
  }
  function ot(z = "") {
    return String(z || "").trim().replace(/^W\//i, "").replace(/^"(.*)"$/, "$1");
  }
  function Vt(z, V = "") {
    const q = String(z?.headers?.get?.("If-None-Match") || "").trim(), X = ot(V);
    return !q || !X ? !1 : q.split(",").some((Y) => {
      const re = ot(Y);
      return re === "*" || re === X;
    });
  }
  function _t(z, V = "") {
    const q = z instanceof Request ? new URL(z.url) : new URL(String(z || ""), _), X = new URL(q.pathname, _);
    return X.searchParams.set("remote", ce(String(V || "").trim())), new Request(X.toString(), { method: "GET" });
  }
  function bt(z, V = "", q = {}) {
    const X = _t(z, V), Y = new URL(X.url);
    return Y.searchParams.set("transform", w), Y.searchParams.set("bootstrap", ce(se(F(q) ? q : {}))), new Request(Y.toString(), { method: "GET" });
  }
  function gr(z = "", V = "no-store, max-age=0") {
    const q = new Headers({
      "Content-Type": "text/html;charset=UTF-8",
      "Cache-Control": String(V || "no-store, max-age=0")
    });
    return Ce(q), z && q.set("ETag", nt(z)), q;
  }
  function Gt(z = "") {
    const V = String(z || "").trim();
    if (!V) return "";
    const q = Date.parse(V);
    return Number.isFinite(q) ? new Date(q).toUTCString() : "";
  }
  function Le(z, V = "") {
    const q = String(z?.headers?.get?.("If-Modified-Since") || "").trim(), X = Gt(V);
    if (!q || !X) return !1;
    const Y = Date.parse(q), re = Date.parse(X);
    return !Number.isFinite(Y) || !Number.isFinite(re) ? !1 : Y >= re;
  }
  function qr(z, V) {
    return String(z?.headers?.get?.("If-None-Match") || "").trim() ? Vt(z, V?.headers?.get?.("ETag") || "") : Le(z, V?.headers?.get?.("Last-Modified") || "");
  }
  function We(z, V = "no-store, max-age=0") {
    const q = new Headers({ "Cache-Control": String(V || "no-store, max-age=0") }), X = ot(z?.headers?.get?.("ETag") || ""), Y = Gt(z?.headers?.get?.("Last-Modified") || "");
    X && q.set("ETag", nt(X)), Y && q.set("Last-Modified", Y);
    const re = String(z?.headers?.get?.("X-Admin-Shell-Revision") || "").trim();
    return re && q.set("X-Admin-Shell-Revision", re), Ce(q), new Response(null, {
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
    ADMIN_REMOTE_SHELL_REVALIDATE_MS: R,
    ADMIN_REMOTE_SHELL_MAX_BYTES: E,
    ADMIN_REMOTE_SHELL_TRANSFORM_REVISION: w,
    ADMIN_REMOTE_SHELL_CACHED_AT_HEADER: D,
    ADMIN_REMOTE_SHELL_SOURCE_ETAG_HEADER: C,
    ADMIN_REMOTE_SHELL_SOURCE_LAST_MODIFIED_HEADER: T,
    ADMIN_REMOTE_SHELL_SOURCE_HASH_HEADER: I,
    ADMIN_RELEASE_PROXY_PATH_SEGMENT: x,
    ADMIN_RELEASE_VENDOR_PATH_SEGMENT: U,
    ADMIN_WARM_PATH_SEGMENT: k,
    ADMIN_RELEASE_VENDOR_CACHE_KEY_ORIGIN: G,
    ADMIN_RELEASE_VENDOR_MANIFEST_CACHE_KEY_ORIGIN: P,
    ADMIN_RELEASE_VENDOR_CACHE_CONTROL: N,
    ADMIN_RELEASE_VENDOR_MUTABLE_CACHE_CONTROL: L,
    ADMIN_RELEASE_VENDOR_MAX_BYTES: M,
    ADMIN_WARM_VENDOR_CONCURRENCY: v,
    ADMIN_RELEASE_VENDOR_CACHED_AT_HEADER: W,
    ADMIN_RELEASE_VENDOR_SOURCE_HASH_HEADER: $,
    ADMIN_PRIMARY_VIEWS: H,
    ADMIN_SETTINGS_VISUAL_SECTIONS: j,
    ADMIN_SETTINGS_SAVE_GROUPS: ne,
    buildAdminUiContract: fe,
    buildAdminBootstrapPayload: me,
    measureAdminShellTemplateBytes: le,
    buildAdminShellLifecycleState: pe,
    buildAdminShellRetirementState: Oe,
    buildAdminShellEffectiveMode: Be,
    buildAdminEmbeddedFallbackRuntimeState: Mt,
    buildAdminShellState: rt,
    resolveAdminShellIndexUrl: It,
    normalizeAdminShellRuntimeStatus: Pt,
    patchAdminShellRuntimeStatus: Gr,
    withAdminShellRuntimeStatus: xt,
    describeAdminRemoteShellFailureReason: mr,
    buildAdminRemoteShellErrorContent: Ot,
    buildAdminIndexSetupContent: at,
    renderAdminHtmlShell: jr,
    buildAdminHtmlVariantEtag: pr,
    formatAdminHtmlEtag: nt,
    normalizeEtagToken: ot,
    requestHasMatchingEtag: Vt,
    buildAdminRemoteShellLegacyCacheKeyRequest: _t,
    buildAdminRemoteShellCacheKeyRequest: bt,
    buildAdminHtmlResponseHeaders: gr,
    normalizeAdminHttpDateHeader: Gt,
    requestHasMatchingLastModified: Le,
    requestMatchesAdminHtmlResponse: qr,
    buildConditionalNotModifiedResponseFromStoredResponse: We
  };
}
function Ed(n = {}, e = {}) {
  function r(N = "{}") {
    return `${s(N)}${t}`;
  }
  const t = '<script id="admin-bootstrap-loader">try{window.__ADMIN_BOOTSTRAP__=JSON.parse(document.getElementById("admin-bootstrap")?.textContent||"{}")}catch(_){window.__ADMIN_BOOTSTRAP__=window.__ADMIN_BOOTSTRAP__||{},window.__ADMIN_UI_BOOT_ERROR__=window.__ADMIN_UI_BOOT_ERROR__||"admin bootstrap parse failed: "+(_?.message||String(_||"unknown_error"))}<\/script>', a = '<script id="admin-tailwind-prelude">window.tailwind=window.tailwind||{};<\/script>', o = /* @__PURE__ */ new Set([
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
  function c(N, L) {
    let M = "";
    for (let v = L; v < N.length; v += 1) {
      const W = N[v];
      if (M)
        W === M && (M = "");
      else if (W === '"' || W === "'") M = W;
      else if (W === ">") return v;
    }
    return -1;
  }
  function l(N, L) {
    let M = L + 1;
    if (!/[A-Za-z]/.test(N[M] || "")) return null;
    const v = c(N, M);
    if (v < 0) return null;
    const W = M;
    for (; M < v && !i(N[M]) && N[M] !== "/"; ) M += 1;
    const $ = N.slice(W, M).toLowerCase(), H = /* @__PURE__ */ new Map();
    for (; M < v; ) {
      for (; M < v && i(N[M]); ) M += 1;
      if (M >= v) break;
      if (N[M] === "/") {
        M += 1;
        continue;
      }
      const j = M;
      for (; M < v && !i(N[M]) && N[M] !== "=" && N[M] !== "/"; ) M += 1;
      if (M === j) {
        M += 1;
        continue;
      }
      const ne = N.slice(j, M).toLowerCase();
      for (; M < v && i(N[M]); ) M += 1;
      let fe = "", me = !1, le = -1, pe = -1;
      if (N[M] === "=") {
        for (M += 1; M < v && i(N[M]); ) M += 1;
        const Oe = N[M];
        if (Oe === '"' || Oe === "'") {
          for (me = !0, M += 1, le = M; M < v && N[M] !== Oe; ) M += 1;
          pe = M, fe = N.slice(le, pe), M < v && (M += 1);
        } else {
          for (le = M; M < v && !i(N[M]); ) M += 1;
          pe = M, fe = N.slice(le, pe);
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
      tagName: $,
      attributes: H,
      start: L,
      tagEnd: v
    };
  }
  function d(N, L, M, v) {
    const W = `</${M}`;
    let $ = v;
    for (; $ < N.length; ) {
      const H = L.indexOf(W, $);
      if (H < 0) return null;
      const j = N[H + W.length] || "";
      if (!j || i(j) || j === "/" || j === ">") {
        const ne = c(N, H + W.length);
        return ne >= 0 ? {
          start: H,
          tagEnd: ne
        } : null;
      }
      $ = H + W.length;
    }
    return null;
  }
  function* u(N = "") {
    const L = String(N || ""), M = L.toLowerCase();
    let v = 0;
    for (; v < L.length; ) {
      const W = L.indexOf("<", v);
      if (W < 0) return;
      if (L.startsWith("<!--", W)) {
        const me = L.indexOf("-->", W + 4);
        v = me < 0 ? L.length : me + 3;
        continue;
      }
      const $ = L[W + 1] || "";
      if ($ === "!" || $ === "?" || $ === "/") {
        const me = c(L, W + 2);
        if (me < 0) return;
        v = me + 1;
        continue;
      }
      const H = l(L, W);
      if (!H) {
        if (/[A-Za-z]/.test($)) return;
        v = W + 1;
        continue;
      }
      const j = H.tagEnd + 1, ne = o.has(H.tagName) ? d(L, M, H.tagName, j) : null, fe = ne ? ne.start : j;
      if (v = ne ? ne.tagEnd + 1 : j, yield {
        ...H,
        contentStart: j,
        contentEnd: ne || !o.has(H.tagName) ? fe : L.length,
        contentTagEnd: ne ? ne.tagEnd : -1,
        contentClosed: !!ne || !o.has(H.tagName)
      }, o.has(H.tagName) && !ne) return;
    }
  }
  function f(N = "", L = "") {
    const M = String(N || ""), v = String(L || "");
    if (!M || !v) return M;
    let W = -1;
    for (const $ of u(M)) {
      if ($.tagName === "head") {
        const H = $.tagEnd + 1;
        return `${M.slice(0, H)}${v}${M.slice(H)}`;
      }
      $.tagName === "body" && W < 0 && (W = $.tagEnd + 1);
    }
    return W >= 0 ? `${M.slice(0, W)}${v}${M.slice(W)}` : `${v}${M}`;
  }
  function m(N = "") {
    const L = String(N || "");
    if (!L) return L;
    let M = -1;
    for (const v of u(L)) {
      if (v.tagName !== "script" || !v.contentClosed) continue;
      if (v.attributes.get("id")?.value === "admin-tailwind-prelude") return L;
      if (M >= 0 || v.attributes.has("src")) continue;
      const W = L.slice(v.contentStart, v.contentEnd);
      /\btailwind\s*\.\s*config\s*=/i.test(W) && (M = v.start);
    }
    return M < 0 ? L : `${L.slice(0, M)}${a}${L.slice(M)}`;
  }
  function p(N = "", L = "{}") {
    const M = m(String(N || ""));
    if (!M) return M;
    const v = s(L);
    let W = null, $ = null;
    for (const H of u(M)) {
      if (H.tagName !== "script" || !H.contentClosed) continue;
      const j = String(H.attributes.get("id")?.value || "").trim();
      j === "admin-bootstrap" && String(H.attributes.get("type")?.value || "").trim().toLowerCase() === "application/json" ? W = H : j === "admin-bootstrap-loader" && ($ = H);
    }
    if (W && W.contentTagEnd >= W.tagEnd) {
      const H = M.slice(0, W.start), j = M.slice(W.contentTagEnd + 1);
      return `${H}${v}${$ ? "" : t}${j}`;
    }
    return $ ? `${M.slice(0, $.start)}${v}${M.slice($.start)}` : f(M, r(L));
  }
  function g(N) {
    const L = String(N?.tagName || "").trim().toLowerCase();
    let M = "", v = "";
    if (L === "script" && N.attributes?.has("src"))
      M = "src", v = "script";
    else if (L === "link" && N.attributes?.has("href")) {
      const j = new Set(String(N.attributes.get("rel")?.value || "").trim().toLowerCase().split(/\s+/).filter(Boolean)), ne = String(N.attributes.get("as")?.value || "").trim().toLowerCase();
      j.has("stylesheet") ? v = "css" : j.has("modulepreload") ? v = "script" : (j.has("preload") || j.has("prefetch")) && ne === "style" ? v = "css" : (j.has("preload") || j.has("prefetch")) && ne === "script" && (v = "script"), v && (M = "href");
    }
    if (!M || !v) return null;
    const W = N.attributes.get(M), $ = Number(W?.valueStart), H = Number(W?.valueEnd);
    return !Number.isInteger($) || !Number.isInteger(H) || $ < 0 || H < $ ? null : {
      rawValue: String(W?.value || ""),
      assetKind: v,
      valueStart: $,
      valueEnd: H
    };
  }
  function h(N = "") {
    const L = [];
    for (const M of u(N)) {
      const v = g(M);
      v && L.push(v);
    }
    return L;
  }
  function y(N = "") {
    for (const L of u(N))
      if (L.tagName === "script" && String(L.attributes.get("type")?.value || "").trim().toLowerCase() === "importmap")
        return !0;
    return !1;
  }
  function S(N = "", L = "") {
    const M = String(N || "");
    if (!M) return [];
    let v = null;
    try {
      v = new URL(String(L || "").trim());
    } catch {
      v = null;
    }
    const W = [];
    for (const $ of h(M)) {
      const H = String($.rawValue || "").trim();
      if (!(!H || /^data:/i.test(H) || /^javascript:/i.test(H)))
        try {
          const j = v ? new URL(H, v).toString() : new URL(H).toString();
          W.push({
            rawValue: H,
            normalizedUrl: j,
            assetKind: $.assetKind
          });
        } catch {
          continue;
        }
    }
    return W.filter(($, H, j) => j.findIndex((ne) => ne.normalizedUrl === $.normalizedUrl) === H);
  }
  function _(N = "", L = "") {
    return S(N, L).map((M) => M.normalizedUrl);
  }
  function A(N = "") {
    return String(N || "").replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  }
  function b(N = "", L = "") {
    const M = String(N || "").trim(), v = String(L || "").trim().toLowerCase() === "css" ? "css" : "js";
    return M ? `${ce(M)}.${v}` : "";
  }
  function R(N = "/admin", L = "", M = "") {
    const v = Z(N || "/admin").replace(/\/+$/, "") || "/admin", W = dt(L), $ = String(M || "").trim();
    return !W || !$ ? "" : `${v}/${e.ADMIN_RELEASE_PROXY_PATH_SEGMENT}/${encodeURIComponent(W)}/${e.ADMIN_RELEASE_VENDOR_PATH_SEGMENT}/${encodeURIComponent($)}`;
  }
  function E(N = "", L = {}) {
    const M = S(N, L.baseUrl || L.sourceUrl || "").map((v) => ({
      assetKey: b(v.normalizedUrl, v.assetKind),
      assetKind: v.assetKind,
      upstreamUrl: v.normalizedUrl
    })).filter((v) => v.assetKey && v.upstreamUrl).filter((v, W, $) => $.findIndex((H) => H.assetKey === v.assetKey) === W);
    return {
      version: 1,
      releaseTag: dt(L.releaseTag),
      sourceUrl: Dr(L.sourceUrl || L.baseUrl || ""),
      entries: M
    };
  }
  function w(N = "", L = {}, M = {}) {
    const v = String(N || "");
    if (!v) return v;
    const W = String(M.adminPath || "/admin").trim() || "/admin", $ = dt(M.releaseTag), H = new Map((Array.isArray(L?.entries) ? L.entries : []).map((me) => [String(me?.upstreamUrl || "").trim(), String(me?.assetKey || "").trim()]));
    if (!$ || H.size === 0) return v;
    let j = null;
    try {
      j = new URL(String(M.baseUrl || M.sourceUrl || "").trim());
    } catch {
      j = null;
    }
    const ne = [];
    for (const me of h(v)) {
      const le = String(me.rawValue || "").trim();
      if (!(!le || /^data:/i.test(le) || /^javascript:/i.test(le)))
        try {
          const pe = j ? new URL(le, j).toString() : new URL(le).toString(), Oe = H.get(pe), Be = R(W, $, Oe);
          if (!Oe || !Be) continue;
          ne.push({
            start: me.valueStart,
            end: me.valueEnd,
            value: Be
          });
        } catch {
          continue;
        }
    }
    let fe = v;
    for (const me of ne.sort((le, pe) => pe.start - le.start)) fe = `${fe.slice(0, me.start)}${me.value}${fe.slice(me.end)}`;
    return fe;
  }
  function D(N = {}) {
    const L = F(N) ? N : {};
    return {
      version: Number(L.version) || 1,
      releaseTag: dt(L.releaseTag),
      sourceUrl: Dr(L.sourceUrl),
      entries: (Array.isArray(L.entries) ? L.entries : []).map((M) => ({
        assetKey: String(M?.assetKey || "").trim(),
        assetKind: String(M?.assetKind || "").trim().toLowerCase() === "css" ? "css" : "script",
        upstreamUrl: Dr(M?.upstreamUrl)
      })).filter((M) => M.assetKey && M.upstreamUrl)
    };
  }
  function C(N = "") {
    let L = null;
    try {
      L = new URL(String(N || "").trim());
    } catch {
      return !1;
    }
    const M = L.hostname.replace(/\.+$/, "");
    if (!/(^|\.)jsdelivr\.net$/i.test(M) || !/^\/gh\/[^/]+\/[^/]+\//i.test(L.pathname)) return !1;
    const v = L.pathname.match(/^\/gh\/[^/]+\/[^@/]+@([^/]+)\//i);
    if (!v) return !0;
    const W = decodeURIComponent(String(v[1] || "").trim());
    return W ? !(/^[0-9a-f]{7,40}$/i.test(W) || /^v?\d+\.\d+\.\d+(?:[-+][0-9A-Za-z.-]+)?$/i.test(W)) : !0;
  }
  function T(N = "") {
    const L = String(N || ""), M = [], v = ($ = "") => /[A-Za-z0-9_$]/.test($), W = ($) => {
      let H = $;
      for (; H < L.length; ) {
        if (/\s/.test(L[H])) {
          H += 1;
          continue;
        }
        if (L.startsWith("//", H)) {
          const j = L.indexOf(`
`, H + 2);
          H = j < 0 ? L.length : j + 1;
          continue;
        }
        if (L.startsWith("/*", H)) {
          const j = L.indexOf("*/", H + 2);
          H = j < 0 ? L.length : j + 2;
          continue;
        }
        break;
      }
      return H;
    };
    for (let $ = 0; $ < L.length; ) {
      if (L.startsWith("import", $) && !v(L[$ - 1]) && !v(L[$ + 6])) {
        let H = $ - 1;
        for (; H >= 0 && /\s/.test(L[H]); ) H -= 1;
        const j = W($ + 6);
        L[H] !== "." && L[j] === "(" && M.push({
          index: $,
          reference: L.slice($, j + 1)
        });
      }
      $ += 1;
    }
    return M;
  }
  function I(N = "") {
    const L = String(N || "");
    for (const M of u(L)) {
      if (M.tagName !== "script" || !M.contentClosed || M.attributes.get("src")?.value) continue;
      const v = String(M.attributes.get("type")?.value || "").trim().toLowerCase().split(";")[0];
      if (!(v && ![
        "module",
        "text/javascript",
        "application/javascript",
        "text/ecmascript",
        "application/ecmascript"
      ].includes(v)) && T(L.slice(M.contentStart, M.contentEnd)).length > 0)
        return !0;
    }
    return !1;
  }
  function x(N = "", L = "") {
    const M = S(N, L), v = [];
    y(N) && v.push("远端 index.html 不允许 importmap；所有运行时依赖必须通过显式 script/link 标签交付"), I(N) && v.push("index.html 不允许 inline 动态 import()；所有运行时依赖必须通过显式 script/link 标签交付");
    for (const W of M) {
      const $ = String(W?.rawValue || "").trim(), H = String(W?.normalizedUrl || "").trim();
      let j = "", ne = "";
      try {
        const fe = new URL(H);
        j = fe.hostname.replace(/\.+$/, "").toLowerCase(), ne = fe.pathname;
      } catch {
      }
      if (!/^(?:https?:)?\/\//i.test($)) {
        v.push(`远端 index.html 不允许相对或本地 bundle 资源：${$}`);
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
    for (const L of u(N)) {
      if (o.has(L.tagName)) continue;
      const M = L.attributes.get("id");
      if (M?.quoted && M.value === "app") return !0;
    }
    return !1;
  }
  function k(N = "") {
    const L = String(N || "").trim();
    return L ? /<!doctype\s+html\b/i.test(L) || /<html\b/i.test(L) : !1;
  }
  function G(N = "", L = !1) {
    const M = String(N || "").trim().toLowerCase();
    return !M || M.includes("text/html") || M.includes("application/xhtml+xml") ? !0 : L ? M.startsWith("text/plain") || M.startsWith("application/octet-stream") : !1;
  }
  function P(N = {}) {
    const L = F(N.bootstrap) ? N.bootstrap : {}, M = F(N.initHealth) ? N.initHealth : F(L.initHealth) ? L.initHealth : {};
    return `admin-remote-shell-${ce(se({
      templateRevision: "admin-remote-shell",
      sourceHash: ce(String(N.sourceUrl || "").trim()),
      originEtag: e.normalizeEtagToken(N.originEtag || ""),
      originLastModified: e.normalizeAdminHttpDateHeader(N.originLastModified || ""),
      htmlHash: ce(String(N.html || "")),
      variantSeed: e.buildAdminHtmlVariantEtag(L, M, "remote-admin-shell")
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
    buildAdminReleaseVendorProxyPath: R,
    buildAdminReleaseVendorManifest: E,
    rewriteAdminRemoteShellAssetUrlsToProxy: w,
    normalizeAdminReleaseVendorManifestRecord: D,
    isMutableJsdelivrGithubAssetUrl: C,
    collectAdminInlineDynamicImports: T,
    hasAdminRemoteShellInlineDynamicImport: I,
    getAdminRemoteShellAssetPolicyViolations: x,
    hasAdminRemoteShellAppRoot: U,
    hasAdminRemoteShellHtmlDocument: k,
    isAcceptedAdminHtmlDocumentContentType: G,
    buildAdminRemoteShellVariantEtag: P
  };
}
function Ke(n, e) {
  return fetch(n, e);
}
function gi(n = {}) {
  const e = {};
  if (!n || typeof n != "object" || Array.isArray(n)) return e;
  for (const [r, t] of Object.entries(n)) {
    const a = String(r || "").trim().toLowerCase();
    !a || e[a] !== void 0 || (e[a] = t);
  }
  return e;
}
function jo(n = {}, e = []) {
  const r = gi(n);
  for (const t of Array.isArray(e) ? e : [e]) {
    const a = String(t || "").trim().toLowerCase();
    if (!a) continue;
    const o = r[a];
    if (!(o == null || o === ""))
      return o;
  }
  return "";
}
function tt(n = []) {
  return (Array.isArray(n) ? n : [n]).map((e) => String(e ?? "").trim()).filter(Boolean).join(":");
}
async function Ht(n, e) {
  return await ln(oe.SingleFlightTasks, n, e);
}
async function ln(n, e, r) {
  const t = String(e || "").trim();
  if (!t) return await r();
  const a = n.get(t);
  if (a) return await a;
  const o = Promise.resolve().then(() => r()).finally(() => {
    n.get(t) === o && n.delete(t);
  });
  return n.set(t, o), await o;
}
function bo(n) {
  return String(n?.__CONFIG_CACHE_NAMESPACE || n?.__WORKER_CACHE_SCOPE || "default").trim() || "default";
}
function dn(n) {
  return Ua.get(Ca(n), bo(n));
}
function qo(n) {
  return dn(n).ConfigCache?.data || null;
}
function Ba(n) {
  if (arguments.length === 0) {
    Ua.reset();
    return;
  }
  const e = dn(n);
  e.RuntimeConfigCacheGeneration += 1, e.ConfigCache = null;
}
function Ad(n, e) {
  const r = dn(n);
  r.RuntimeConfigCacheGeneration += 1, r.ConfigCache = {
    data: e,
    exp: Date.now() + O.Defaults.CacheTTL,
    namespace: bo(n)
  };
}
async function kn(n, e) {
  const r = String(n), t = (oe.AdminRemoteShellCacheMutationChains.get(r) || Promise.resolve()).catch(() => null).then(() => e()).finally(() => {
    oe.AdminRemoteShellCacheMutationChains.get(r) === t && oe.AdminRemoteShellCacheMutationChains.delete(r);
  });
  return oe.AdminRemoteShellCacheMutationChains.set(r, t), await t;
}
function Cd(n = {}, e = {}) {
  function r(D = "", C = {}) {
    const T = e.buildAdminHtmlResponseHeaders(C.variantEtag || "", e.ADMIN_REMOTE_SHELL_EDGE_CACHE_CONTROL), I = Number.parseInt(String(C.cachedAt || ""), 10);
    T.set(e.ADMIN_REMOTE_SHELL_CACHED_AT_HEADER, String(Number.isFinite(I) && I > 0 ? I : K()));
    const x = e.normalizeEtagToken(C.originEtag || "");
    x && T.set(e.ADMIN_REMOTE_SHELL_SOURCE_ETAG_HEADER, x);
    const U = e.normalizeAdminHttpDateHeader(C.originLastModified || "");
    U && T.set(e.ADMIN_REMOTE_SHELL_SOURCE_LAST_MODIFIED_HEADER, U);
    const k = ce(String(C.sourceUrl || "").trim());
    k && T.set(e.ADMIN_REMOTE_SHELL_SOURCE_HASH_HEADER, k);
    const G = Ct(C.shellRevision || qe(C.sourceUrl));
    return G && T.set("X-Admin-Shell-Revision", G), new Response(String(D || ""), {
      status: 200,
      headers: T
    });
  }
  async function t(D, C, T, I) {
    const x = await Pe(D, e.ADMIN_REMOTE_SHELL_MAX_BYTES);
    if (x.exceeded) throw new Error("legacy remote admin shell too large");
    const U = x.text, k = e.applyAdminRemoteBootstrapMarkup(U, $r(T)), G = D.headers.get(e.ADMIN_REMOTE_SHELL_SOURCE_ETAG_HEADER) || "", P = e.normalizeAdminHttpDateHeader(D.headers.get(e.ADMIN_REMOTE_SHELL_SOURCE_LAST_MODIFIED_HEADER) || ""), N = e.normalizeAdminHttpDateHeader(D.headers.get("Last-Modified") || "") || P;
    return r(k, {
      variantEtag: e.buildAdminRemoteShellVariantEtag({
        html: k,
        bootstrap: T,
        initHealth: I,
        sourceUrl: C,
        originEtag: G,
        originLastModified: P || N
      }),
      lastModified: N,
      originEtag: G,
      originLastModified: P || N,
      sourceUrl: C,
      cachedAt: y(D)
    });
  }
  function a(D, C = "GET") {
    if (!D) return new Response("Remote admin shell unavailable", { status: 502 });
    const T = new Headers(D.headers || {});
    return T.set("Content-Type", "text/html;charset=UTF-8"), T.set("Cache-Control", e.ADMIN_REMOTE_SHELL_BROWSER_CACHE_CONTROL), T.delete(e.ADMIN_REMOTE_SHELL_CACHED_AT_HEADER), T.delete(e.ADMIN_REMOTE_SHELL_SOURCE_ETAG_HEADER), T.delete(e.ADMIN_REMOTE_SHELL_SOURCE_LAST_MODIFIED_HEADER), T.delete(e.ADMIN_REMOTE_SHELL_SOURCE_HASH_HEADER), Ce(T), new Response(C === "HEAD" ? null : D.body, {
      status: D.status,
      statusText: D.statusText,
      headers: T
    });
  }
  function o(D = "", C = "") {
    const T = new URL(`/${encodeURIComponent(dt(D) || "release")}`, e.ADMIN_RELEASE_VENDOR_MANIFEST_CACHE_KEY_ORIGIN);
    return T.searchParams.set("source", ce(String(C || "").trim())), new Request(T.toString(), { method: "GET" });
  }
  function s(D = "", C = "", T = "") {
    const I = new URL(`/${encodeURIComponent(dt(D) || "release")}/${encodeURIComponent(String(C || "").trim())}`, e.ADMIN_RELEASE_VENDOR_CACHE_KEY_ORIGIN);
    return I.searchParams.set("source", ce(String(T || "").trim())), new Request(I.toString(), { method: "GET" });
  }
  function i(D = {}, C = "") {
    const T = new Headers({
      "Content-Type": "application/json;charset=UTF-8",
      "Cache-Control": e.ADMIN_REMOTE_SHELL_EDGE_CACHE_CONTROL
    }), I = String(C || D?.sourceUrl || "").trim();
    return T.set(e.ADMIN_RELEASE_VENDOR_CACHED_AT_HEADER, String(K())), I && T.set(e.ADMIN_RELEASE_VENDOR_SOURCE_HASH_HEADER, ce(I)), new Response(JSON.stringify(D), {
      status: 200,
      headers: T
    });
  }
  function c(D = "", C = "script") {
    const T = String(D || "").trim().toLowerCase(), I = String(C || "").trim().toLowerCase() === "css" ? "css" : "script";
    return T ? I === "css" ? T.includes("text/css") || T.includes("application/css") || T.startsWith("text/plain") : T.includes("javascript") || T.includes("ecmascript") || T.startsWith("text/plain") || T.startsWith("application/octet-stream") : !0;
  }
  function l(D, C = "GET") {
    const T = new Headers(D.headers);
    return T.set("Cache-Control", String(D.headers.get("Cache-Control") || e.ADMIN_RELEASE_VENDOR_CACHE_CONTROL).trim() || e.ADMIN_RELEASE_VENDOR_CACHE_CONTROL), T.delete(e.ADMIN_RELEASE_VENDOR_CACHED_AT_HEADER), T.delete(e.ADMIN_RELEASE_VENDOR_SOURCE_HASH_HEADER), Ce(T), new Response(C === "HEAD" ? null : D.body, {
      status: D.status,
      statusText: D.statusText,
      headers: T
    });
  }
  async function d(D, C = "", T = "") {
    if (!D || typeof D.match != "function") return null;
    const I = await D.match(o(C, T));
    if (!I) return null;
    try {
      const x = await Pe(I, li);
      return x.exceeded ? null : e.normalizeAdminReleaseVendorManifestRecord(JSON.parse(x.text));
    } catch {
      return null;
    }
  }
  async function u(D = "", C = "") {
    const T = dt(D), I = Dr(C);
    if (!T || !I) return null;
    const x = await Ke(I, { method: "GET" });
    if (!x.ok) throw new Error(`release index fetch failed: HTTP ${x.status}`);
    const U = String(x.headers.get("Content-Type") || "").trim().toLowerCase(), k = Number.parseInt(String(x.headers.get("Content-Length") || ""), 10);
    if (Number.isFinite(k) && k > e.ADMIN_REMOTE_SHELL_MAX_BYTES) throw new Error(`release index too large: ${k} bytes`);
    const G = await Pe(x, e.ADMIN_REMOTE_SHELL_MAX_BYTES), P = G.text, N = G.bytes;
    if (G.exceeded || !P || N > e.ADMIN_REMOTE_SHELL_MAX_BYTES) throw new Error(`release index payload invalid: ${N} bytes`);
    const L = e.hasAdminRemoteShellHtmlDocument(P);
    if (!e.isAcceptedAdminHtmlDocumentContentType(U, L)) throw new Error(`release index content-type invalid: ${U}`);
    if (!L) throw new Error("release index payload invalid: html document expected");
    if (!e.hasAdminRemoteShellAppRoot(P)) throw new Error("release index missing #app root");
    const M = e.getAdminRemoteShellAssetPolicyViolations(P, I);
    if (M.length > 0) throw new Error(`release index asset policy invalid: ${M.slice(0, 3).join(" | ")}`);
    return e.normalizeAdminReleaseVendorManifestRecord(e.buildAdminReleaseVendorManifest(P, {
      releaseTag: T,
      sourceUrl: I
    }));
  }
  async function f(D, C = {}, T = null) {
    const I = e.normalizeAdminReleaseVendorManifestRecord(C);
    if (!D || typeof D.put != "function" || !I.releaseTag || !I.sourceUrl) return I;
    const x = he(D.put(o(I.releaseTag, I.sourceUrl), i(I, I.sourceUrl)), "admin.release_vendor_manifest_cache_write", { releaseTag: I.releaseTag }, null);
    return T && typeof T.waitUntil == "function" ? T.waitUntil(x) : await x, I;
  }
  async function m(D, C = "", T = "", I = null) {
    const x = await d(D, C, T);
    if (x?.entries?.length) return x;
    const U = await u(C, T);
    return U ? (await f(D, U, I), U) : null;
  }
  function p(D = {}, C = "") {
    const T = String(C || "").trim();
    return T && (Array.isArray(D?.entries) ? D.entries : []).find((I) => String(I?.assetKey || "").trim() === T) || null;
  }
  function g(D = "", C = "/admin") {
    const T = Z(C || "/admin").replace(/\/+$/, "") || "/admin", I = Z(D || "/"), x = new RegExp(`^${e.escapeRegexForRoute(T)}/${e.ADMIN_RELEASE_PROXY_PATH_SEGMENT}/([^/]+)/${e.ADMIN_RELEASE_VENDOR_PATH_SEGMENT}/([^/]+)/*$`, "i"), U = I.match(x);
    if (!U) return null;
    try {
      return {
        releaseTag: dt(decodeURIComponent(String(U[1] || ""))),
        assetKey: String(decodeURIComponent(String(U[2] || "")) || "").trim()
      };
    } catch {
      return null;
    }
  }
  function h(D = "", C = "/admin") {
    const T = Z(C || "/admin").replace(/\/+$/, "") || "/admin";
    return (Z(D || "/").replace(/\/+$/, "") || "/").toLowerCase() === `${T}/${e.ADMIN_WARM_PATH_SEGMENT}`.toLowerCase();
  }
  function y(D) {
    const C = Number.parseInt(String(D?.headers?.get?.(e.ADMIN_REMOTE_SHELL_CACHED_AT_HEADER) || ""), 10);
    return Number.isFinite(C) && C > 0 ? C : 0;
  }
  function S(D) {
    const C = y(D);
    return C ? K() - C >= e.ADMIN_REMOTE_SHELL_REVALIDATE_MS : !0;
  }
  function _(D = "", C = "", T = {}) {
    const I = String(D || ""), x = String(T.sourceLabel || "admin shell").trim() || "admin shell", U = String(T.contentType || "").trim().toLowerCase(), k = new TextEncoder().encode(I).length;
    if (!I || k > e.ADMIN_REMOTE_SHELL_MAX_BYTES) throw new Error(`${x} payload invalid: ${k} bytes`);
    const G = e.hasAdminRemoteShellHtmlDocument(I);
    if (!e.isAcceptedAdminHtmlDocumentContentType(U, G)) throw new Error(`${x} content-type invalid: ${U}`);
    if (!G) throw new Error(`${x} payload invalid: html document expected`);
    if (!e.hasAdminRemoteShellAppRoot(I)) throw new Error(`${x} missing #app root`);
    const P = e.getAdminRemoteShellAssetPolicyViolations(I, C);
    if (P.length > 0) throw new Error(`${x} asset policy invalid: ${P.slice(0, 3).join(" | ")}`);
    return {
      html: I,
      bytes: k
    };
  }
  function A(D = "", C = {}, T = {}, I = "", x = {}) {
    const U = _(D, I, x), k = dt(x.assetRevision || x.releaseTag), G = k ? e.normalizeAdminReleaseVendorManifestRecord(e.buildAdminReleaseVendorManifest(U.html, {
      releaseTag: k,
      sourceUrl: I
    })) : null, P = G?.entries?.length ? e.rewriteAdminRemoteShellAssetUrlsToProxy(U.html, G, {
      adminPath: String(x.adminPath || C?.adminPath || "/admin").trim() || "/admin",
      releaseTag: k,
      sourceUrl: I
    }) : U.html, N = e.applyAdminRemoteBootstrapMarkup(P, $r(C)), L = e.normalizeAdminHttpDateHeader(x.lastModified || "") || (/* @__PURE__ */ new Date()).toUTCString(), M = String(x.originEtag || "").trim();
    return {
      storedResponse: r(N, {
        variantEtag: e.buildAdminRemoteShellVariantEtag({
          html: N,
          bootstrap: C,
          initHealth: T,
          sourceUrl: I,
          originEtag: M,
          originLastModified: L
        }),
        lastModified: L,
        originEtag: M,
        originLastModified: L,
        sourceUrl: I,
        shellRevision: qe(I)
      }),
      vendorManifest: G
    };
  }
  async function b(D = "", C = "index.html") {
    const T = String(D || ""), I = await In(T), x = kr(I);
    let U;
    try {
      U = _(T, x, {
        sourceLabel: "local admin index",
        contentType: "text/html"
      });
    } catch (P) {
      throw P && typeof P == "object" && (P.code = String(P.code || "ADMIN_INDEX_UPLOAD_INVALID"), P.status = De(P.status, 400)), P;
    }
    const k = ho(I), G = e.normalizeAdminReleaseVendorManifestRecord(e.buildAdminReleaseVendorManifest(U.html, {
      releaseTag: k,
      sourceUrl: x
    }));
    return {
      version: 1,
      revision: I,
      assetRevision: k,
      sourceUrl: x,
      fileName: (String(C || "index.html").trim().replace(/^.*[\\/]/, "") || "index.html").slice(0, 180),
      uploadedAt: (/* @__PURE__ */ new Date()).toISOString(),
      bytes: U.bytes,
      html: U.html,
      manifest: G
    };
  }
  async function R(D, C, T, I = null, x = {}) {
    if (qe(D)) {
      const H = typeof x.loadLocalIndexRecord == "function" ? await x.loadLocalIndexRecord() : null;
      if (!H?.html) throw new Error("local admin index upload is missing");
      return A(H.html, C, T, D, {
        sourceLabel: "local admin index",
        contentType: "text/html",
        adminPath: x.adminPath,
        assetRevision: x.assetRevision || H.assetRevision,
        lastModified: H.uploadedAt
      });
    }
    const U = new Headers(), k = e.normalizeEtagToken(I?.headers?.get?.(e.ADMIN_REMOTE_SHELL_SOURCE_ETAG_HEADER) || ""), G = e.normalizeAdminHttpDateHeader(I?.headers?.get?.(e.ADMIN_REMOTE_SHELL_SOURCE_LAST_MODIFIED_HEADER) || "");
    k && U.set("If-None-Match", k), G && U.set("If-Modified-Since", G);
    const P = await Ke(D, {
      method: "GET",
      headers: U
    });
    if (P.status === 304 && I) {
      const H = await Pe(I, e.ADMIN_REMOTE_SHELL_MAX_BYTES);
      if (H.exceeded) throw new Error("cached remote admin shell too large");
      const j = H.text;
      return {
        storedResponse: r(j, {
          variantEtag: e.normalizeEtagToken(I.headers.get("ETag") || ""),
          lastModified: e.normalizeAdminHttpDateHeader(I.headers.get("Last-Modified") || ""),
          originEtag: k,
          originLastModified: G,
          sourceUrl: D
        }),
        vendorManifest: null
      };
    }
    if (!P.ok) throw new Error(`remote admin shell fetch failed: HTTP ${P.status}`);
    const N = String(P.headers.get("Content-Type") || "").trim().toLowerCase(), L = Number.parseInt(String(P.headers.get("Content-Length") || ""), 10);
    if (Number.isFinite(L) && L > e.ADMIN_REMOTE_SHELL_MAX_BYTES) throw new Error(`remote admin shell too large: ${L} bytes`);
    const M = await Pe(P, e.ADMIN_REMOTE_SHELL_MAX_BYTES), v = M.text, W = M.bytes;
    if (M.exceeded || !v || W > e.ADMIN_REMOTE_SHELL_MAX_BYTES) throw new Error(`remote admin shell payload invalid: ${W} bytes`);
    const $ = e.normalizeAdminHttpDateHeader(P.headers.get("Last-Modified") || "") || (/* @__PURE__ */ new Date()).toUTCString();
    return A(v, C, T, D, {
      sourceLabel: "remote admin shell",
      contentType: N,
      adminPath: x.adminPath,
      assetRevision: x.assetRevision || x.releaseTag,
      lastModified: $,
      originEtag: P.headers.get("ETag") || ""
    });
  }
  async function E(D, C, T, I, x, U, k, G = {}, P = null) {
    if (!C || typeof C.put != "function") return null;
    const N = await R(I, x, U, k, G), L = N?.storedResponse || null;
    return L ? (await C.put(T, L.clone()), N?.vendorManifest?.entries?.length && await f(C, N.vendorManifest, P), L) : null;
  }
  async function w(D, C, T, I, x, U = {}) {
    return Ht(tt(["admin_remote_shell_cold_load", C.url]), () => kn(C.url, async () => {
      if (D && typeof D.match == "function") {
        const P = await D.match(C);
        if (P) return {
          storedResponse: P,
          vendorManifest: null,
          loadedFromCache: !0
        };
      }
      const k = await R(T, I, x, null, U), G = k?.storedResponse || null;
      return G ? (D && typeof D.put == "function" && (await D.put(C, G.clone()), k?.vendorManifest?.entries?.length && await f(D, k.vendorManifest, null)), {
        ...k,
        loadedFromCache: !1
      }) : k;
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
    fetchAdminRemoteShellStoredResponse: R,
    revalidateAdminRemoteShellCache: E,
    loadAdminRemoteShellColdCache: w
  };
}
function Td(n = {}, e = {}) {
  const { indexRepository: r } = n;
  async function t(d, u, f, m = He(u), p = {}) {
    const g = u?.ASSETS;
    if (!g || typeof g.fetch != "function") return null;
    const h = new URL("/index.html", d.url), y = await g.fetch(new Request(h, {
      method: "GET",
      headers: { Accept: "text/html" }
    }));
    if (!y?.ok) throw new Error(`bundled admin shell fetch failed: HTTP ${Number(y?.status) || 0}`);
    const S = Number.parseInt(String(y.headers.get("Content-Length") || ""), 10);
    if (Number.isFinite(S) && S > e.ADMIN_REMOTE_SHELL_MAX_BYTES) throw new Error(`bundled admin shell too large: ${S} bytes`);
    const _ = await Pe(y, e.ADMIN_REMOTE_SHELL_MAX_BYTES);
    if (_.exceeded || !_.text) throw new Error(`bundled admin shell payload invalid: ${_.bytes} bytes`);
    const A = e.buildAdminShellState(u, m, p), b = e.buildAdminBootstrapPayload(u, m, p), R = ut(u, p), E = h.toString(), w = e.buildAdminShellStoredPayloadFromHtml(_.text, b, m, E, {
      sourceLabel: "bundled admin shell",
      contentType: y.headers.get("Content-Type") || "text/html",
      adminPath: b.adminPath,
      lastModified: y.headers.get("Last-Modified") || "Thu, 01 Jan 1970 00:00:00 GMT",
      originEtag: y.headers.get("ETag") || ""
    })?.storedResponse || null;
    if (!w) throw new Error("bundled admin shell response is unavailable");
    return await e.patchAdminShellRuntimeStatus(u, {
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
      requestPath: new URL(d.url).pathname,
      indexUrl: E,
      indexUrlSource: "worker_assets",
      effectiveRef: "frontend/dist/index.html",
      effectiveRefType: "static_assets"
    }, f), e.requestMatchesAdminHtmlResponse(d, w) ? e.buildConditionalNotModifiedResponseFromStoredResponse(w, e.ADMIN_REMOTE_SHELL_BROWSER_CACHE_CONTROL) : e.buildAdminRemoteShellClientResponse(w, d.method);
  }
  async function a(d, u, f, m = He(u), p = {}, g = "index_url_not_configured") {
    const h = ut(u, p), y = e.buildAdminShellState(u, m, p), S = e.buildAdminBootstrapPayload(u, m, p), _ = $r(S), A = Hn(m), b = new URL(d.url).pathname;
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
    const R = e.buildAdminIndexSetupContent(S, y, m, p, h), E = e.renderAdminHtmlShell(_, A, R);
    return new Response(d.method === "HEAD" ? null : E, { headers: e.buildAdminHtmlResponseHeaders("", "no-store, max-age=0") });
  }
  function o(d) {
    const u = String(new URL(d.url).searchParams.get("setup") || "").trim().toLowerCase();
    return u === "1" || u === "true";
  }
  async function s(d, u, f, m = He(u), p = {}, g = {}) {
    const h = e.buildAdminShellState(u, m, g), y = e.buildAdminBootstrapPayload(u, m, g), S = ut(u, g), _ = $r(y), A = Hn(m), b = new URL(d.url).pathname, R = {
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
    }, E = e.buildAdminRemoteShellErrorContent(y, h, m, R);
    await e.patchAdminShellRuntimeStatus(u, R, f);
    const w = e.renderAdminHtmlShell(_, A, E);
    return new Response(d.method === "HEAD" ? null : w, { headers: e.buildAdminHtmlResponseHeaders("", "no-store, max-age=0") });
  }
  async function i(d, u, f, m = He(u), p = e.resolveAdminShellIndexUrl(u), g = {}) {
    const h = sr(), y = e.buildAdminShellState(u, m, g), S = e.buildAdminBootstrapPayload(u, m, g), _ = ut(u, g), A = {
      releaseTag: _.assetRevision || _.releaseTag,
      assetRevision: _.assetRevision || _.releaseTag,
      adminPath: S.adminPath,
      ..._.isLocalUpload ? { loadLocalIndexRecord: () => r.getAdminIndexUploadRecord(r.getKV(u), _.localUploadRevision) } : {}
    }, b = e.buildAdminRemoteShellCacheKeyRequest(d, p, S), R = e.buildAdminRemoteShellLegacyCacheKeyRequest(d, p), E = new URL(d.url).pathname;
    if (h && typeof h.match == "function") {
      const T = await Ht(tt(["admin_remote_shell_cache_read", b.url]), async () => {
        const U = await h.match(b);
        if (U) return {
          storedResponse: U,
          legacyCacheMigrated: !1
        };
        const k = await h.match(R);
        if (!k) return null;
        const G = await he(e.migrateLegacyAdminRemoteShellStoredResponse(k, p, S, m), "admin.remote_shell_legacy_cache_read", {
          path: E,
          remoteShellIndexUrl: p
        }, null);
        return G ? await kn(b.url, async () => {
          const P = await h.match(b);
          return P ? {
            storedResponse: P,
            legacyCacheMigrated: !1
          } : (typeof h.put == "function" && await he(h.put(b, G.clone()), "admin.remote_shell_legacy_cache_migrate", {
            path: E,
            remoteShellIndexUrl: p
          }, null), {
            storedResponse: G,
            legacyCacheMigrated: !0
          });
        }) : null;
      }), I = T === null ? null : T.storedResponse.clone(), x = T !== null && T.legacyCacheMigrated;
      if (I) {
        const U = e.shouldRevalidateAdminRemoteShell(I);
        let k = null;
        if (U) {
          const N = I.clone();
          k = Ht(tt(["admin_remote_shell_revalidate", b.url]), async () => he(kn(b.url, () => e.revalidateAdminRemoteShellCache(d, h, b, p, S, m, N, A, f)), "admin.remote_shell_revalidate", {
            path: E,
            remoteShellIndexUrl: p
          }, null));
        }
        const G = e.patchAdminShellRuntimeStatus(u, {
          shellState: y,
          initHealth: m,
          indexState: _,
          remoteShellIndexUrl: p,
          mode: "remote",
          sourceType: x ? "remote_legacy_cache" : "remote_cache",
          routeState: "remote_active",
          remoteCacheState: x ? U ? "legacy_stale_hit" : "legacy_hit" : U ? "stale_hit" : "hit",
          revalidateDue: U,
          lastFetchStatus: "cached",
          reason: x ? U ? "migrated_legacy_remote_shell_and_scheduled_revalidate" : "migrated_legacy_remote_shell" : U ? "served_cached_remote_shell_and_scheduled_revalidate" : "served_cached_remote_shell",
          requestPath: E,
          throttleStableWrites: !0
        }, null), P = k ? Promise.all([k, G]) : G;
        return f && typeof f.waitUntil == "function" && f.waitUntil(P), e.requestMatchesAdminHtmlResponse(d, I) ? e.buildConditionalNotModifiedResponseFromStoredResponse(I, e.ADMIN_REMOTE_SHELL_BROWSER_CACHE_CONTROL) : e.buildAdminRemoteShellClientResponse(I, d.method);
      }
    }
    const w = await e.loadAdminRemoteShellColdCache(h, b, p, S, m, A), D = (w?.storedResponse ? {
      ...w,
      storedResponse: w.storedResponse.clone()
    } : w)?.storedResponse || null;
    if (!D) throw new Error("remote admin shell payload missing");
    const C = Ht(tt(["admin_remote_shell_cold_status", b.url]), () => e.patchAdminShellRuntimeStatus(u, {
      shellState: y,
      initHealth: m,
      indexState: _,
      remoteShellIndexUrl: p,
      mode: "remote",
      sourceType: w?.loadedFromCache ? "remote_cache" : "remote_fetch",
      routeState: "remote_active",
      remoteCacheState: w?.loadedFromCache ? "filled_while_waiting" : "miss",
      lastFetchStatus: w?.loadedFromCache ? "cached" : "fetched",
      reason: w?.loadedFromCache ? "served_cache_filled_while_waiting" : "fetched_remote_shell_index",
      requestPath: E
    }, null));
    return f && typeof f.waitUntil == "function" ? f.waitUntil(C) : await C, e.requestMatchesAdminHtmlResponse(d, D) ? e.buildConditionalNotModifiedResponseFromStoredResponse(D, e.ADMIN_REMOTE_SHELL_BROWSER_CACHE_CONTROL) : e.buildAdminRemoteShellClientResponse(D, d.method);
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
    const g = dt(m?.releaseTag), h = String(m?.assetKey || "").trim();
    if (!g || !h) return c("Release vendor asset not found", 404);
    const y = sr(), S = Xl(g);
    if (!S) return c("Local index vendor asset not found", 404);
    const _ = S ? await r.getAdminIndexUploadRecord(r.getKV(u), S) : null;
    if (S && !_) return c("Local index vendor asset not found", 404);
    const A = _?.sourceUrl || "";
    if (!A) return c("Release vendor asset not found", 404);
    let b = null;
    _?.manifest ? (b = await e.readAdminReleaseVendorManifestFromCache(y, g, A), b || (b = await e.cacheAdminReleaseVendorManifest(y, _.manifest, f))) : b = await e.getOrCreateAdminReleaseVendorManifest(y, g, A, f);
    const R = e.resolveAdminReleaseVendorManifestEntry(b, h);
    if (!R?.upstreamUrl) return c("Release vendor asset not found", 404);
    const E = e.isMutableJsdelivrGithubAssetUrl(R.upstreamUrl), w = E ? e.ADMIN_RELEASE_VENDOR_MUTABLE_CACHE_CONTROL : e.ADMIN_RELEASE_VENDOR_CACHE_CONTROL, D = e.buildAdminReleaseVendorAssetCacheKeyRequest(g, h, R.upstreamUrl);
    if (!E && y && typeof y.match == "function") {
      const L = await y.match(D);
      if (L)
        return e.requestMatchesAdminHtmlResponse(d, L) ? e.buildConditionalNotModifiedResponseFromStoredResponse(L, w) : e.buildAdminReleaseVendorClientResponse(L, d.method);
    }
    let C = null;
    try {
      C = await Ke(R.upstreamUrl, {
        method: "GET",
        headers: { Accept: R.assetKind === "css" ? "text/css, text/plain;q=0.9, */*;q=0.1" : "application/javascript, text/javascript, text/plain;q=0.9, */*;q=0.1" }
      });
    } catch (L) {
      return c(`Release vendor asset fetch failed: ${String(L?.message || L || "unknown_error").trim() || "unknown_error"}`, 502);
    }
    if (!C.ok) return c(C.status === 404 ? "Release vendor asset not found" : `Release vendor asset fetch failed (HTTP ${C.status})`, C.status === 404 ? 404 : 502);
    const T = String(C.headers.get("Content-Type") || "").trim();
    if (!e.isAcceptedAdminReleaseVendorContentType(T, R.assetKind)) return c(`Release vendor asset content-type invalid: ${T || "unknown"}`, 502);
    const I = Number.parseInt(String(C.headers.get("Content-Length") || ""), 10);
    if (Number.isFinite(I) && I > e.ADMIN_RELEASE_VENDOR_MAX_BYTES) return c(`Release vendor asset too large: ${I} bytes`, 502);
    const x = await Ls(C, e.ADMIN_RELEASE_VENDOR_MAX_BYTES), U = x.bytes;
    if (x.exceeded || !U || U > e.ADMIN_RELEASE_VENDOR_MAX_BYTES) return c(`Release vendor asset payload invalid: ${U} bytes`, 502);
    const k = new Headers({ "Cache-Control": w }), G = e.normalizeEtagToken(C.headers.get("ETag") || ""), P = e.normalizeAdminHttpDateHeader(C.headers.get("Last-Modified") || "");
    T && k.set("Content-Type", T), G && k.set("ETag", e.formatAdminHtmlEtag(G)), P && k.set("Last-Modified", P), k.set(e.ADMIN_RELEASE_VENDOR_CACHED_AT_HEADER, String(K())), k.set(e.ADMIN_RELEASE_VENDOR_SOURCE_HASH_HEADER, ce(R.upstreamUrl));
    const N = new Response(x.bodyBytes, {
      status: 200,
      headers: k
    });
    if (!E && y && typeof y.put == "function") {
      const L = he(y.put(D, N.clone()), "admin.release_vendor_cache_write", {
        releaseTag: g,
        assetKey: h
      }, null);
      f && typeof f.waitUntil == "function" ? f.waitUntil(L) : await L;
    }
    return e.requestMatchesAdminHtmlResponse(d, N) ? e.buildConditionalNotModifiedResponseFromStoredResponse(N, w) : e.buildAdminReleaseVendorClientResponse(N, d.method);
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
function wd(n = {}) {
  return {
    ...Fs,
    ...aa,
    "Content-Type": "application/json; charset=utf-8",
    "Cache-Control": "no-store, max-age=0",
    ...n
  };
}
function J(n, e = 200, r = {}) {
  return new Response(JSON.stringify(n), {
    status: e,
    headers: wd(r)
  });
}
function B(n, e, r = 400, t = null, a = {}) {
  const o = {
    ok: !1,
    error: {
      code: n,
      message: e
    }
  };
  return t != null && (o.error.details = t), J(o, r, a);
}
async function Dd(n) {
  const e = new Headers(n.headers || {});
  if (e.set("Content-Type", "application/json; charset=utf-8"), e.set("Cache-Control", "no-store, max-age=0"), Object.entries(aa).forEach(([c, l]) => e.set(c, l)), Ce(e), n.ok) return new Response(n.body, {
    status: n.status,
    headers: e
  });
  const r = await Pe(n, rn);
  let t = null;
  const a = r.text;
  try {
    t = JSON.parse(a);
  } catch {
  }
  const o = t?.error?.code || (typeof t?.error == "string" ? t.error.toUpperCase() : `HTTP_${n.status}`), s = t?.error?.message || t?.message || (typeof t?.error == "string" ? t.error : a || n.statusText || "request_failed"), i = t?.error?.details ?? t?.details ?? null;
  return B(o, s, n.status || 500, i);
}
function Nr(n = "") {
  return String(n || "").trim().toLowerCase() === "simplified" ? "simplified" : "legacy";
}
function hi(n = "") {
  const e = String(n || "").trim().toLowerCase();
  return e === "balanced" ? "balanced" : e === "aggressive" ? "aggressive" : "compat";
}
function Ro(n = {}) {
  const e = n?.enableH2 === !0, r = n?.enableH3 === !0;
  return !e && !r ? "compat" : n?.peakDowngrade === !1 ? "aggressive" : "balanced";
}
var yi = Object.freeze([
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
function Si(n = "") {
  const e = String(n || "").trim().toLowerCase();
  return e === "summary" || e === "kv" || e === "d1" ? e : "";
}
function Nd(n = []) {
  const e = [], r = /* @__PURE__ */ new Set();
  for (const t of Array.isArray(n) ? n : [n]) {
    const a = Si(t);
    !a || r.has(a) || (r.add(a), e.push(a));
  }
  return e;
}
function Ld(n = {}) {
  return yi.some(({ configKey: e }) => ia(n, e));
}
function _i(n = {}, e = n) {
  const r = n && typeof n == "object" ? n : {}, t = e && typeof e == "object" ? e : {};
  return r.tgDailyReportEnabled === !0 && !Ld(t);
}
function Md(n = {}, e = {}) {
  const r = n && typeof n == "object" ? n : {};
  return _i(r, e && typeof e == "object" ? e : {}) ? (r.tgDailyReportSummaryEnabled = !0, r.tgDailyReportKvEnabled = !1, r.tgDailyReportD1Enabled = !1, r) : (r.tgDailyReportSummaryEnabled = r.tgDailyReportSummaryEnabled === !0, r.tgDailyReportKvEnabled = r.tgDailyReportKvEnabled === !0, r.tgDailyReportD1Enabled = r.tgDailyReportD1Enabled === !0, r);
}
function bi(n = {}, e = n, r = {}) {
  const t = n && typeof n == "object" ? n : {}, a = Nd(r?.reportKinds);
  if (a.length > 0) return a;
  const o = yi.filter(({ configKey: s }) => t[s] === !0).map(({ kind: s }) => s);
  return o.length > 0 ? o : r?.fallbackAllWhenLegacy === !0 && _i(t, e) ? ["summary"] : [];
}
function Id(n = {}) {
  return Nr(n?.routingDecisionMode);
}
function Lr(n = "") {
  const e = String(n || "").trim().toLowerCase();
  return e === "legacy" || e === "simplified" ? e : "inherit";
}
function Pd(n = {}, e = {}) {
  const r = Lr(n?.routingDecisionMode);
  return r === "inherit" ? Id(e) : r;
}
function ar(n) {
  const e = String(n ?? "").trim();
  if (!e) return "";
  if (!/^\d{1,5}$/.test(e)) return null;
  const r = Number(e);
  return !Number.isInteger(r) || r < 1 || r > 65535 ? null : String(r);
}
function xd(n) {
  return n === "http:" ? "80" : n === "https:" ? "443" : "";
}
function Od(n) {
  const e = String(n?.username || ""), r = String(n?.password || "");
  return !e && !r ? "" : `${e}${r ? `:${r}` : ""}@`;
}
function vd(n, e = "") {
  if (!(n instanceof URL)) return "";
  const r = String(n.protocol || "").trim().toLowerCase();
  if (!["http:", "https:"].includes(r)) return "";
  const t = ar(e);
  if (t === null) return "";
  const a = String(n.hostname || "").trim();
  if (!a) return "";
  const o = String(n.pathname || "/") || "/", s = String(n.search || ""), i = String(n.hash || "");
  return `${r}//${Od(n)}${a}${t ? `:${t}` : ""}${o}${s}${i}`.replace(/\/$/, "");
}
function Xo(n, e = "", r = "") {
  const t = String(n || "").trim();
  if (!t) return null;
  try {
    const a = new URL(t);
    if (!["http:", "https:"].includes(a.protocol)) return null;
    const o = ar(a.port), s = ar(e), i = ar(r);
    return o === null || s === null || i === null ? null : vd(a, o || s || i || xd(a.protocol)) || null;
  } catch {
    return null;
  }
}
function Fd(n = "") {
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
function Yo(n = "") {
  const e = String(n || "").trim();
  if (!e) return !1;
  try {
    const r = new URL(e);
    return ["http:", "https:"].includes(r.protocol) ? !Fd(e) : !1;
  } catch {
    return !1;
  }
}
function _e(n) {
  return JSON.stringify(String(n ?? ""));
}
function Lt(n = "/") {
  const e = Z(n || "/");
  return e === "/" ? "" : e.replace(/\/+$/, "");
}
function un(n) {
  try {
    const e = n instanceof URL ? n : new URL(String(n || ""));
    if (!["http:", "https:"].includes(e.protocol)) return null;
    const r = String(e.origin || "").trim();
    if (!r) return null;
    const t = Lt(e.pathname);
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
function Ge(n) {
  return Ze(n) ? String(n.absoluteBasePrefix || n.originText || "").trim() : "";
}
function Ud(n = []) {
  return ce(se((Array.isArray(n) ? n : []).map((e) => Ge(e)).filter(Boolean)));
}
function Hd(n = []) {
  return new Set((Array.isArray(n) ? n : []).map((e) => Ge(e)).filter(Boolean)).size;
}
function Aa(n = "", e = O.Defaults.HedgeProbePath) {
  const r = String(n || e || "").trim() || String(e || "/emby/system/ping").trim() || "/emby/system/ping";
  try {
    return Z(new URL(r, "https://hedge-probe.invalid").pathname || "/");
  } catch {
    return Z(r);
  }
}
function oa(n = "") {
  const e = String(n || "").trim();
  return e ? Aa(e, O.Defaults.HedgeProbePath) : "";
}
function Ze(n) {
  return !!n && typeof n == "object" && n.targetUrl instanceof URL && typeof n.originText == "string" && typeof n.normalizedBasePath == "string" && typeof n.absoluteBasePrefix == "string";
}
function Jo(n = "") {
  const e = String(n || "");
  return e ? e.startsWith("?") ? e : `?${e}` : "";
}
function kd(n = "GET", e = {}, r = {}) {
  const t = String(n || "GET").toUpperCase();
  return !(t !== "GET" && t !== "HEAD" || e?.isSegment !== !0 || e?.isWsUpgrade === !0 || r.playbackRelayTargetUrl instanceof URL || r.protocolFallbackRetry === !0 || r.isExternalRedirect === !0);
}
var fn = ["proxyMode", "mode"], mn = [
  "direct",
  "sourceDirect",
  "directSource",
  "direct2xx"
], Ri = [
  "wangpanMode",
  "videoThrottling",
  "interceptMs"
], Ei = "__playback-relay", Ai = "__pb_target", Kn = "__pb_abs", zn = Object.freeze({
  main: "",
  proxy_a: "__proxy-a",
  proxy_b: "__proxy-b"
});
[
  ...fn,
  ...mn,
  ...Ri
];
function Kd(n = {}) {
  const e = n && typeof n == "object" && !Array.isArray(n) ? n : {}, r = [];
  let t = !1;
  const a = ar(e.port), o = Array.isArray(e.lines) ? e.lines.reduce((i, c) => i + (ar(c?.port) ? 1 : 0), 0) : 0, s = Array.isArray(e.lines) && e.lines.length ? e.lines.reduce((i, c) => ar(c?.port) || a ? i : i + (Yo(c?.target) ? 1 : 0), 0) : a ? 0 : String(e.target || "").split(",").map((i) => i.trim()).filter(Boolean).reduce((i, c) => i + (Yo(c) ? 1 : 0), 0);
  for (const i of fn) {
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
  for (const i of mn)
    Object.prototype.hasOwnProperty.call(e, i) && (r.push(i), e[i] === !0 && (t = !0));
  for (const i of Ri)
    Object.prototype.hasOwnProperty.call(e, i) && r.push(i);
  return {
    legacyKeysPresent: Et(r),
    shouldAddToSourceDirectNodes: t,
    topLevelPortPresent: a !== null && a !== "",
    linePortCount: o,
    defaultPortNodePresent: s > 0,
    defaultPortLineCount: s
  };
}
function zd(n, e = {}) {
  const r = vr(n);
  return {
    mode: r,
    forceVideoDirect: r === "direct",
    forceVideoProxy: r === "proxy"
  };
}
function $d(n = {}) {
  return Us(n?.defaultMediaAuthMode);
}
function Wa(n = {}) {
  return ia(n, "defaultPlaybackInfoMode") ? zt(n?.defaultPlaybackInfoMode) : Reflect.get(n, "playbackInfoAutoProxy") !== void 0 ? Reflect.get(n, "playbackInfoAutoProxy") !== !1 ? "rewrite" : "passthrough" : Reflect.get(n, "playbackInfoBlockWangpanProxy") !== void 0 ? "rewrite" : O.Defaults.DefaultPlaybackInfoMode;
}
function Bd(n = {}) {
  return zt(Wa(n));
}
function Wd(n = {}) {
  return uo(n?.defaultRealClientIpMode);
}
function Vd(n = {}, e = {}) {
  const r = n || {}, t = n && typeof n == "object" && Object.prototype.hasOwnProperty.call(n, "mediaAuthMode") ? Zt(r.mediaAuthMode) : "auto";
  return t === "inherit" ? $d(e) : t;
}
function Gd(n = {}, e = {}) {
  const r = n || {}, t = n && typeof n == "object" && Object.prototype.hasOwnProperty.call(n, "playbackInfoMode") ? wr(r.playbackInfoMode) : "inherit";
  return t === "inherit" ? Bd(e) : t;
}
function jd(n = {}, e = {}) {
  const r = n || {}, t = n && typeof n == "object" && Object.prototype.hasOwnProperty.call(n, "realClientIpMode") ? Tr(r.realClientIpMode) : "forward";
  return t === "inherit" ? Wd(e) : t;
}
function qd(n = {}, e = {}) {
  const r = n || {};
  return (n && typeof n == "object" && Object.prototype.hasOwnProperty.call(n, "hedgeProbePath") ? oa(r.hedgeProbePath) : "") || Aa(e?.hedgeProbePath, O.Defaults.HedgeProbePath);
}
function Xd(n) {
  const e = uo(typeof n == "string" ? n : n?.realClientIpMode);
  return e === "forward" ? "full" : e === "strip" ? "real-ip-only" : e === "disable" ? "none" : "full";
}
function Ci(n = "") {
  const e = String(n || "").trim().toLowerCase();
  return e === "proxy_a" || e === "__proxy-a" ? "proxy_a" : e === "proxy_b" || e === "__proxy-b" ? "proxy_b" : "main";
}
function Yd(n = "main") {
  return zn[Ci(n)] || "";
}
function Ti(n = "") {
  const e = String(n || "").trim().toLowerCase();
  return e ? e === zn.proxy_a ? "proxy_a" : e === zn.proxy_b ? "proxy_b" : "main" : "main";
}
function ta(n = "") {
  const e = String(n || "");
  if (!e) return {
    linkVariant: "main",
    remaining: "",
    needsTrailingSlashRedirect: !1
  };
  const r = e.startsWith("/") ? e : "/" + e, t = r.split("/"), a = Ti(Dt(t[1] || ""));
  return a === "main" ? {
    linkVariant: a,
    remaining: Z(r),
    needsTrailingSlashRedirect: !1
  } : {
    linkVariant: a,
    remaining: Z("/" + t.slice(2).join("/")),
    needsTrailingSlashRedirect: t.length === 2 && !r.endsWith("/")
  };
}
function Ca(n = {}) {
  return n.ENI_KV || n.KV || n.EMBY_KV || n.EMBY_PROXY || null;
}
function Jd(n = {}) {
  return n.DB || n.D1 || n.PROXY_LOGS || null;
}
var Qd = 16 * 1024;
async function Yt(n, e) {
  const r = new TextEncoder(), t = Date.now();
  let a = oe.CryptoKeyCache.get(n);
  for ((!a || a.exp <= t) && (a = {
    key: await Pn().importKey("raw", r.encode(n), {
      name: "HMAC",
      hash: "SHA-256"
    }, !1, ["sign"]),
    exp: t + O.Defaults.CryptoKeyCacheTTL * 1e3
  }), oe.CryptoKeyCache.has(n) && oe.CryptoKeyCache.delete(n), oe.CryptoKeyCache.set(n, a); oe.CryptoKeyCache.size > O.Defaults.CryptoKeyCacheMax; ) {
    const s = oe.CryptoKeyCache.keys().next().value;
    if (s === void 0) break;
    oe.CryptoKeyCache.delete(s);
  }
  const o = await Pn().sign("HMAC", a.key, r.encode(e));
  return btoa(String.fromCharCode(...new Uint8Array(o))).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}
var Zd = class {
  constructor({ actionHandlers: n, bindingService: e, configReader: r, repository: t, requestModel: a, shellService: o }) {
    this.actionHandlers = Object.freeze({ ...n }), this.bindingService = e, this.configReader = r, this.repository = t, this.requestModel = a, this.shellService = o, this.actionAliases = Object.freeze({
      import: "saveOrImport",
      save: "saveOrImport"
    }), this.#e();
  }
  async handle(n, e, r) {
    const t = this.#d(n, e), { requestHost: a, configuredHost: o, configuredLegacyHost: s } = t, i = n.method, c = i === "GET" || i === "HEAD";
    if (c && t.pathnameLower === "/favicon.ico") return this.#_(i);
    const l = await this.configReader.getRuntimeConfig(e), d = !!(s && s !== o && a === s), u = l.enableHostPrefixProxy === !0 && !!o && !d, f = u ? po(a, o) : null, m = !!(u && a !== o && a.endsWith(`.${o}`));
    if (f || m) return null;
    if (i === "GET" && t.normalizedPathname === "/") return this.#m(e, t.initHealth);
    const p = c ? this.#b(t.normalizedPathname, t.adminPath) : null;
    if (p)
      return await this.#r(n, e) ? this.#h(n, e, r, p, l) : this.#E("Unauthorized", 401);
    if (c && this.#R(t.normalizedPathname, t.adminPath))
      return await this.#r(n, e) ? this.#y(n, e, t.initHealth, l) : this.#S(n, t.adminLoginPath);
    if (c && Rr(t.pathnameLower, t.adminLoginPathLower))
      return await this.#r(n, e) ? this.#S(n, t.adminPath) : this.#p(n, e, t.initHealth);
    if (c && Rr(t.pathnameLower, t.adminPathLower))
      return await this.#r(n, e) ? this.#g(n, e, r, t.initHealth) : this.#S(n, t.adminLoginPath);
    if (i === "OPTIONS" && this.#s(t)) return this.#t(n, e, null);
    if (i === "POST" && (Rr(t.pathnameLower, t.adminLoginPathLower) || this.#n(t))) return this.#i(n, e);
    if (i !== "POST" || !Rr(t.pathnameLower, t.adminPathLower)) return null;
    if (!await this.#r(n, e)) return B("UNAUTHORIZED", "未授权", 401);
    try {
      return await Dd(await this.#o(n, e, r));
    } catch (g) {
      const h = sl(g, {
        code: "INTERNAL_ERROR",
        message: "Server Error",
        status: 500
      });
      return Ne("admin_api.unhandled_error", g, {
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
    const e = this.#a(n), r = this.actionAliases[e] || e;
    return this.actionHandlers[r] || null;
  }
  async #o(n, e, r) {
    const t = this.bindingService.getKV(e);
    if (!t) return B("KV_NOT_CONFIGURED", "请先绑定 ENI_KV / KV Namespace", 503);
    let a;
    try {
      const i = await Pe(n, ci);
      if (i.exceeded) return B("REQUEST_TOO_LARGE", "请求体过大", 413);
      a = JSON.parse(i.text || "");
    } catch {
      return B("INVALID_JSON", "请求 JSON 无效", 400);
    }
    const o = this.requestModel.normalizeAdminActionRequest(a);
    if (!o) return B("INVALID_REQUEST", "请求体必须是 JSON 对象", 400);
    const s = this.#f(o.action);
    return s ? s(o.data, {
      action: o.action,
      meta: o.meta,
      request: n,
      env: e,
      ctx: r,
      kv: t,
      db: this.bindingService.getDB(e)
    }) : B("INVALID_ACTION", "未知的管理动作", 400, { action: o.action || null });
  }
  #n(n) {
    return n.adminPathLower === "/admin" && n.pathnameLower === "/api/auth/login" && n.root === "api" && n.segments[1] === "auth" && n.segments[2] === "login";
  }
  #s(n) {
    return fi(n.pathnameLower, n.adminPathLower) || Rr(n.pathnameLower, n.adminLoginPathLower) || this.#n(n);
  }
  #t(n, e, r, t = 200) {
    return this.shellService.buildEdgeCorsResponse(Ea(e, n), r, t, { mergeOriginVary: !0 });
  }
  #d(n, e) {
    const r = new URL(n.url), t = ee(r.hostname), a = Z(r.pathname), o = a.toLowerCase(), s = et(e), i = s.toLowerCase(), c = cn(s), l = c.toLowerCase(), d = pi(e, {
      adminPath: s,
      loginPath: c
    }), u = a.split("/").filter(Boolean), f = u[0] || "", m = Dt(f).toLowerCase();
    return {
      initHealth: d,
      requestUrl: r,
      requestHost: t,
      configuredHost: $e(e),
      configuredLegacyHost: Hr(e),
      normalizedPathname: a,
      pathnameLower: o,
      adminPath: s,
      adminPathLower: i,
      adminLoginPath: c,
      adminLoginPathLower: l,
      segments: u,
      rootRaw: f,
      root: m
    };
  }
  async #i(n, e) {
    const r = n.headers.get("cf-connecting-ip") || "unknown", t = this.repository.getDB(e), a = Sd(e), o = await this.configReader.getRuntimeConfig(e), s = Math.max(1, parseInt(o.jwtExpiryDays) || 30) * 86400;
    try {
      const i = await he(this.repository.getAuthFailureEntry(t, r), "auth.login.read_auth_failure", { ip: r }, null), c = Math.max(0, Number(i?.failCount) || 0);
      if (c >= O.Defaults.MaxLoginAttempts) return B("TOO_MANY_ATTEMPTS", "账户已锁定，请稍后再试", 429);
      let l = "";
      if ((n.headers.get("content-type") || "").includes("application/json")) {
        const u = await Pe(n, Qd);
        if (u.exceeded) return B("REQUEST_TOO_LARGE", "请求体过大", 413);
        const f = JSON.parse(u.text || "{}");
        l = typeof f.password == "string" ? f.password : "";
      }
      if (!e.JWT_SECRET) return B("SERVER_MISCONFIGURED", "JWT_SECRET 未配置", 503);
      if (!e.ADMIN_PASS) return B("SERVER_MISCONFIGURED", "ADMIN_PASS 未配置", 503);
      if (l && l === e.ADMIN_PASS) {
        i && await he(this.repository.deleteAuthFailureEntry(t, r), "auth.login.clear_auth_failure", { ip: r }, !1);
        const u = await this.#u(e.JWT_SECRET, s);
        return J({
          ok: !0,
          expiresIn: s
        }, 200, { "Set-Cookie": `auth_token=${u}; Path=${a}; Max-Age=${s}; HttpOnly; Secure; SameSite=Strict` });
      }
      const d = c + 1;
      return await he(this.repository.upsertAuthFailureEntry(t, r, {
        failCount: d,
        expiresAt: K() + O.Defaults.LoginLockDuration * 1e3
      }), "auth.login.write_auth_failure", {
        ip: r,
        nextFailCount: d
      }, null), J({
        ok: !1,
        error: {
          code: "INVALID_PASSWORD",
          message: "密码错误"
        },
        remain: Math.max(0, O.Defaults.MaxLoginAttempts - d)
      }, 401);
    } catch (i) {
      return B("INVALID_REQUEST", "请求无效", 400, { reason: i.message });
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
  async #u(n, e) {
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
    return Yt(n, e);
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
function wi(n = "", e = "") {
  const r = String(n || "").trim().toLowerCase(), t = String(e || "").trim().toLowerCase();
  return t === "image" || r.includes("/images/") || r.includes("/emby/covers/") || /\.(jpe?g|png|webp|gif)(?:$|[?#])/.test(r) ? "image_poster" : r.includes("/sessions/playing") || r.includes("/playbackinfo") ? "playback_info" : r.includes("/users/authenticate") ? "auth" : r.includes("/items/") || r.includes("/shows/") || r.includes("/movies/") || r.includes("/users/") ? "media_metadata" : t || "api";
}
function eu(n = "", e = "") {
  return wi(n, e) === "playback_info";
}
function tu(n = "", e = "") {
  const r = String(n || "").trim().toLowerCase(), t = String(e || "").trim().toLowerCase();
  return t === "stream" || t === "segment" || t === "manifest" ? !0 : /\/stream(?:$|[/?])/.test(r) || r.includes("/master.m3u8") || /\/videos\/[^/]+\/(?:original|download|file)(?:$|[/?])/.test(r) || /\/items\/[^/]+\/download(?:$|[/?])/.test(r) || r.includes("static=true") || r.includes("download=true");
}
function Di(n) {
  return String(n || "").trim().toLowerCase().replace(/[\s-]+/g, "_") === "poster_manifest" ? "poster_manifest" : "poster";
}
function Ni(n) {
  const e = String(n || "").trim().toLowerCase();
  return e === "fts" ? "fts" : e === "like" ? "like" : O.Defaults.LogSearchMode;
}
function Li(n) {
  return String(n || "").trim().toLowerCase() === "error" ? "error" : O.Defaults.LogWriteMode;
}
function ru(n) {
  const e = String(n || "").trim().toLowerCase().replace(/[\s-]+/g, "_");
  return e === "playback" || e === "playback_info" ? "playback_info" : e === "image" ? "image" : e === "api" ? "api" : e === "auth" ? "auth" : "";
}
function au(n) {
  const e = String(n || "").trim().toLowerCase().replace(/[\s-]+/g, "_");
  return e === "4xx" || e === "status_4xx" ? "4xx" : e === "5xx" || e === "status_5xx" ? "5xx" : "";
}
function Qo(n) {
  const e = String(n || "").trim().toLowerCase().replace(/[\s-]+/g, "_");
  return e === "direct" ? "direct" : e === "proxy" || e === "proxied" ? "proxy" : "";
}
function nu(n = "") {
  const e = String(n || "").trim().toLowerCase().replace(/[\s-]+/g, "_");
  return e === "connect_timeout" ? "connect_timeout" : e === "idle_timeout" ? "idle_timeout" : e === "tls_handshake_failed" ? "tls_handshake_failed" : e === "http_version_fallback" ? "http_version_fallback" : e === "redirect_loop" ? "redirect_loop" : e === "redirect_limit_exceeded" ? "redirect_limit_exceeded" : e === "range_unsatisfied" ? "range_unsatisfied" : e === "upstream_4xx" ? "upstream_4xx" : e === "upstream_5xx" ? "upstream_5xx" : e === "unknown_fetch_error" ? "unknown_fetch_error" : "";
}
var ou = Object.freeze({
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
function su(n) {
  const e = Math.trunc(Number(n) || 0);
  if (!Number.isFinite(e) || e <= 0) return {
    code: null,
    text: null
  };
  const r = ou[e];
  return r ? {
    code: r.code,
    text: r.text
  } : {
    code: null,
    text: null
  };
}
function iu(n) {
  const e = String(n || "").trim();
  return e ? /\b(?:AND|OR|NOT|NEAR)\b/i.test(e) || /(?:^|\s)(?:node_name|request_path|user_agent|error_detail)\s*:/i.test(e) || /(?:^|\s)[^\s"]+\*/.test(e) ? !0 : /^"(?:[^"]|"")+"$/.test(e) : !1;
}
function Mi(n) {
  return `"${String(n || "").replace(/"/g, '""')}"`;
}
function cu(n) {
  return `${Mi(n)}*`;
}
function lu(n) {
  return String(n || "").replace(/(^|\s)((?:node_name|request_path|user_agent|error_detail)\s*:\s*)([^"\s()]+)(?=\s|$)/gi, (e, r, t, a) => `${r}${t}${Mi(a)}`);
}
function du(n) {
  const e = String(n || "").trim();
  return e ? iu(e) ? lu(e) : e.split(/\s+/).filter(Boolean).map((r) => cu(r)).join(" AND ") : "";
}
function Ii(n = null) {
  if (!n || typeof n != "object") return null;
  const e = Math.floor(Number(n.timestamp)), r = Math.floor(Number(n.id));
  return !Number.isFinite(e) || !Number.isFinite(r) || e < 0 || r < 0 ? null : {
    timestamp: e,
    id: r
  };
}
function uu(n = null) {
  return Ii({
    timestamp: Number(n?.timestamp),
    id: Number(n?.id)
  });
}
function Pa(n) {
  return `"${String(n || "").replace(/"/g, '""')}"`;
}
function $n(n) {
  return String(n || "").toLowerCase().replace(/["`\[\]]/g, "").replace(/\s+/g, " ").trim();
}
function Eo(n = "") {
  const e = String(n || "").trim().toLowerCase();
  return e === "paid" ? "paid" : e === "free" ? "free" : "";
}
function ur(n = "") {
  const e = String(n || "").trim().toUpperCase();
  return e === "A" || e === "AAAA" || e === "CNAME";
}
function xa(n, e, r = {}) {
  const t = String(n || "").trim().toUpperCase(), a = String(e || "").trim(), o = r.allowCname !== !1;
  if (!ur(t)) return "Type 仅允许 A / AAAA / CNAME";
  if (!o && t === "CNAME") return "A 模式仅允许 A / AAAA";
  if (!a) return "Content 不能为空";
  if (t === "A" && !ba(a)) return "A 记录 Content 必须是合法 IPv4 地址";
  if (t === "AAAA" && !nn(a)) return "AAAA 记录 Content 必须是合法 IPv6 地址";
  if (t === "CNAME") {
    if (/\s/.test(a)) return "CNAME 记录 Content 不能包含空格";
    if (a.length > 255) return "CNAME 记录 Content 过长";
  }
  return "";
}
function fu(n = "") {
  const e = String(n || "").trim();
  return e ? xa("CNAME", e) ? "" : e : "";
}
var mu = [
  "logIncludeClientIp",
  "logIncludeColo",
  "logIncludeUa"
], Pi = [
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
], xi = ["directSourceNodes", "nodeDirectList"], Oi = ["sourceSameOriginProxy", "forceExternalProxy"], vi = [
  "enableH2",
  "enableH3",
  "peakDowngrade"
], Zo = [
  ...mu,
  ...Pi,
  ...xi,
  ...Oi,
  ...vi
], pu = {
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
}, gu = /* @__PURE__ */ new Set([...Pi, ...Oi]), Fi = {
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
function hu(n = {}, e = {}) {
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
function yu(n = {}, e = {}) {
  const r = Array.isArray(e.allowedFields) ? e.allowedFields : [];
  if (!r.length) return n;
  const t = {};
  for (const a of r)
    Object.prototype.hasOwnProperty.call(n, a) && (t[a] = n[a]);
  return t;
}
function Su(n = {}, e = Fi, r = {}) {
  let t = n && typeof n == "object" && !Array.isArray(n) ? { ...n } : {};
  t = hu(t, e);
  for (const a of e.trimFields || [])
    t[a] === void 0 || t[a] === null || (t[a] = String(t[a]).trim());
  for (const [a, o] of Object.entries(e.arrayNormalizers || {}))
    Array.isArray(t[a]) && o === "nodeNameList" && typeof r.normalizeNodeNameList == "function" && (t[a] = r.normalizeNodeNameList(t[a]));
  for (const [a, o] of Object.entries(e.integerFields || {})) t[a] = ue(t[a], o.fallback, o.min, o.max);
  for (const [a, o] of Object.entries(e.numberFields || {})) t[a] = $c(t[a], o.fallback, o.min, o.max);
  for (const a of e.booleanTrueFields || []) t[a] = t[a] !== !1;
  for (const a of e.booleanFalseFields || []) t[a] = t[a] === !0;
  return yu(t, e);
}
function Ui(n = {}) {
  const e = n && typeof n == "object" && !Array.isArray(n) ? n : {}, r = { ...e };
  let t = !1;
  const a = [], o = [], s = {};
  for (const c of Zo)
    Object.prototype.hasOwnProperty.call(e, c) && a.push(c);
  const i = (c, l) => {
    const d = String(c || "").trim(), u = String(l || "").trim();
    !d || !u || (o.push(u), s[d] || (s[d] = []), s[d].push(u));
  };
  if (!Object.prototype.hasOwnProperty.call(r, "sourceDirectNodes")) {
    for (const c of xi)
      if (Object.prototype.hasOwnProperty.call(e, c)) {
        r.sourceDirectNodes = mt(e[c]), t = !0, i(c, "sourceDirectNodes");
        break;
      }
  }
  if (!Object.prototype.hasOwnProperty.call(r, "logWriteClientIp") && Reflect.get(e, "logIncludeClientIp") !== void 0 && (r.logWriteClientIp = e.logIncludeClientIp !== !1, t = !0, i("logIncludeClientIp", "logWriteClientIp")), !Object.prototype.hasOwnProperty.call(r, "logDisplayClientIp") && Reflect.get(e, "logIncludeClientIp") !== void 0 && (r.logDisplayClientIp = e.logIncludeClientIp !== !1, t = !0, i("logIncludeClientIp", "logDisplayClientIp")), !Object.prototype.hasOwnProperty.call(r, "logWriteColo") && Reflect.get(e, "logIncludeColo") !== void 0 && (r.logWriteColo = e.logIncludeColo !== !1, t = !0, i("logIncludeColo", "logWriteColo")), !Object.prototype.hasOwnProperty.call(r, "logDisplayColo") && Reflect.get(e, "logIncludeColo") !== void 0 && (r.logDisplayColo = e.logIncludeColo !== !1, t = !0, i("logIncludeColo", "logDisplayColo")), !Object.prototype.hasOwnProperty.call(r, "logWriteUa") && Reflect.get(e, "logIncludeUa") !== void 0 && (r.logWriteUa = e.logIncludeUa !== !1, t = !0, i("logIncludeUa", "logWriteUa")), !Object.prototype.hasOwnProperty.call(r, "logDisplayUa") && Reflect.get(e, "logIncludeUa") !== void 0 && (r.logDisplayUa = e.logIncludeUa !== !1, t = !0, i("logIncludeUa", "logDisplayUa")), !Object.prototype.hasOwnProperty.call(r, "protocolStrategy")) {
    let c = !1;
    for (const l of vi)
      Object.prototype.hasOwnProperty.call(e, l) && (i(l, "protocolStrategy"), c = !0);
    c && (r.protocolStrategy = Ro(e), t = !0);
  }
  Object.prototype.hasOwnProperty.call(r, "defaultPlaybackInfoMode") || (Reflect.get(e, "playbackInfoAutoProxy") !== void 0 ? (r.defaultPlaybackInfoMode = Wa(e), t = !0, i("playbackInfoAutoProxy", "defaultPlaybackInfoMode")) : Reflect.get(e, "playbackInfoBlockWangpanProxy") !== void 0 && (r.defaultPlaybackInfoMode = Wa(e), t = !0, i("playbackInfoBlockWangpanProxy", "defaultPlaybackInfoMode"))), Object.prototype.hasOwnProperty.call(r, "tgDailyReportClockTimes") || (r.tgDailyReportClockTimes = Tt(Object.prototype.hasOwnProperty.call(e, "tgDailyReportTime") ? e.tgDailyReportTime : e.tgDailyReportClockTimes, O.Defaults.TgDailyReportClockTimes), Object.prototype.hasOwnProperty.call(e, "tgDailyReportTime") && (t = !0, i("tgDailyReportTime", "tgDailyReportClockTimes")));
  for (const c of Zo)
    Object.prototype.hasOwnProperty.call(r, c) && (delete r[c], t = !0);
  return {
    config: r,
    migrated: t,
    legacyKeysPresent: Et(a),
    deletedLegacyFieldCount: Et(a).length,
    migratedConfigKeys: Et(o),
    migratedKeyMap: Object.fromEntries(Object.entries(s).map(([c, l]) => [c, Et(l)]))
  };
}
function te(n = {}) {
  const { config: e } = Ui(n && typeof n == "object" && !Array.isArray(n) ? n : {});
  return Hi(e);
}
function Hi(n = {}) {
  const e = Su({
    ...n,
    defaultPlaybackInfoMode: ia(n, "defaultPlaybackInfoMode") ? Reflect.get(n, "defaultPlaybackInfoMode") : Wa(n),
    protocolStrategy: ia(n, "protocolStrategy") ? Reflect.get(n, "protocolStrategy") : Ro(n)
  }, Fi, { normalizeNodeNameList: mt });
  e.prewarmDepth = Di(e.prewarmDepth), e.hedgeProbePath = Aa(e.hedgeProbePath, O.Defaults.HedgeProbePath), e.dnsDefaultFallbackCname = fu(e.dnsDefaultFallbackCname), e.defaultHostPrefixCnameTarget = $t(e.defaultHostPrefixCnameTarget), e.settingsExperienceMode = String(e.settingsExperienceMode || "").trim().toLowerCase() === "expert" ? "expert" : "novice", e.cfQuotaPlanOverride = Eo(e.cfQuotaPlanOverride), e.logSearchMode = Ni(e.logSearchMode), e.logWriteMode = Li(e.logWriteMode), e.routingDecisionMode = Nr(e.routingDecisionMode), e.protocolStrategy = hi(e.protocolStrategy), e.defaultPlaybackInfoMode = zt(e.defaultPlaybackInfoMode), e.defaultRealClientIpMode = uo(e.defaultRealClientIpMode), e.defaultMediaAuthMode = Us(e.defaultMediaAuthMode), e.scheduleUtcOffsetMinutes = ke(e.scheduleUtcOffsetMinutes), e.tgDailyReportClockTimes = Tt(e.tgDailyReportClockTimes, O.Defaults.TgDailyReportClockTimes);
  const r = qe(e.indexUrl);
  return e.indexUrl = r ? kr(r) : "", Md(e, n), e;
}
var Ao = ["cfApiToken", "tgBotToken"];
function Br(n = {}) {
  const e = te(n);
  for (const r of Ao) delete e[r];
  return e;
}
function ct(n = {}) {
  return te(n);
}
function _u(n = {}, e = {}) {
  const r = te(n), t = te(e);
  for (const a of Ao) String(t[a] || "").length > 0 ? r[a] = t[a] : delete r[a];
  return r;
}
function ki(n = {}, e = {}) {
  const r = F(n) ? { ...n } : {}, t = te(e);
  for (const a of Ao)
    Object.prototype.hasOwnProperty.call(r, a) || String(t[a] || "").length > 0 && (r[a] = t[a]);
  return r;
}
function Tn(n = {}, e = {}) {
  const r = ki(n, e), t = qe(te(e).indexUrl);
  return r.indexUrl = t ? kr(t) : "", r;
}
function bu(n = "", e = {}) {
  const r = String(n || "").trim();
  if (!r) return;
  const t = r.split(".").pop() || "", a = ce(se(te(e)));
  if (t !== a)
    throw Te("CONFIG_REVISION_CONFLICT", "配置已被其他设备更新，请刷新设置后重新提交", 409, {
      expectedRevision: r,
      currentHash: a
    });
}
function ua(n = {}) {
  if (!F(n)) return n;
  const e = {
    ...n,
    config: Br(n.config || {})
  };
  return F(n.rollbackPayload) && Array.isArray(n.rollbackPayload.kvEntries) && (e.rollbackPayload = {
    ...n.rollbackPayload,
    kvEntries: n.rollbackPayload.kvEntries.map((r) => {
      if (!F(r) || r.exists !== !0) return r;
      const t = String(r.key || "");
      if (t === "sys:config_snapshots:v1") try {
        const a = JSON.parse(String(r.value || "[]"));
        return {
          ...r,
          value: JSON.stringify(Array.isArray(a) ? a.map((o) => ua(o)) : [])
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
          value: JSON.stringify(Br(JSON.parse(String(r.value || "{}"))))
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
function Ki(n = {}) {
  const e = Ui(n);
  return {
    cleanedConfig: Hi(e.config),
    legacyKeysPresent: e.legacyKeysPresent,
    deletedLegacyFieldCount: e.deletedLegacyFieldCount,
    migratedConfigKeys: e.migratedConfigKeys,
    migratedKeyMap: e.migratedKeyMap
  };
}
function Ru(n = []) {
  const e = [], r = [], t = /* @__PURE__ */ new Set();
  for (const a of Array.isArray(n) ? n : []) {
    const o = String(a || "").trim();
    if (!o) continue;
    const s = pu[o];
    if (Array.isArray(s) && s.length) {
      r.push(o);
      for (const i of s)
        !i || t.has(i) || (t.add(i), e.push(i));
      continue;
    }
    if (gu.has(o)) {
      r.push(o);
      continue;
    }
    t.has(o) || (t.add(o), e.push(o));
  }
  return {
    changedKeys: e,
    removedLegacyKeys: Et(r)
  };
}
function Eu(n) {
  if (!n || typeof n != "object" || Array.isArray(n)) return {
    snapshot: n,
    rewritten: !1,
    deletedLegacyFieldCount: 0,
    migratedConfigKeys: []
  };
  const e = Ki(n.config && typeof n.config == "object" && !Array.isArray(n.config) ? n.config : {}), r = Ru(n.changedKeys), t = {
    ...n,
    changedKeys: r.changedKeys,
    changeCount: r.changedKeys.length,
    config: e.cleanedConfig
  }, a = Array.isArray(n.changedKeys) ? n.changedKeys : [], o = Number(n.changeCount) || a.length || 0;
  return {
    snapshot: t,
    rewritten: se(n.config || {}) !== se(t.config) || se(a) !== se(t.changedKeys) || o !== t.changeCount,
    deletedLegacyFieldCount: e.deletedLegacyFieldCount + r.removedLegacyKeys.length,
    migratedConfigKeys: e.migratedConfigKeys
  };
}
function Ft(n = "", e = "") {
  const r = String(n || "").trim() || "empty";
  return `${String(e || "").trim() || (/* @__PURE__ */ new Date()).toISOString()}.${r}`;
}
function Cr(n, e = {}) {
  const r = ce(se(n)), t = String(e.updatedAt || "").trim() || (/* @__PURE__ */ new Date()).toISOString();
  return {
    ...e,
    hash: r,
    updatedAt: t,
    revision: Ft(r, t)
  };
}
function Bn(n = {}, e = {}) {
  const r = te(n), t = te(e), a = [.../* @__PURE__ */ new Set([...Object.keys(r), ...Object.keys(t)])].sort(), o = [];
  for (const s of a)
    se(r[s]) !== se(t[s]) && o.push({
      key: s,
      previousValue: r[s],
      nextValue: t[s]
    });
  return o;
}
function Au(n = [], e = 20) {
  const r = Math.max(1, Number(e) || 20);
  return [...new Set((Array.isArray(n) ? n : [n]).map((t) => String(t ?? "").trim()).filter(Boolean))].slice(0, r);
}
function lt(n = "", e = "", r = [], t = {}) {
  const a = Au(r, t.limit), o = Number(t.count), s = Number.isFinite(o) ? Math.max(0, Math.floor(o)) : a.length, i = String(t.note || "").trim();
  return {
    key: String(n || "").trim(),
    label: String(e || "").trim(),
    count: s,
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
function Cu(n = {}) {
  const e = [], r = Et(n.configFieldTargets || []);
  if (r.length > 0) {
    const i = [];
    n.sourceDirectNodesFromLegacyNodes === !0 && i.push("包含节点遗留直连标记折叠进 sourceDirectNodes"), Number(n.rewrittenSnapshotCount) > 0 && i.push(`会同步迁移 ${Math.max(0, Math.floor(Number(n.rewrittenSnapshotCount) || 0))} 份旧快照中的相关配置字段`), e.push(lt("config_current_fields", "全局设置当前字段", r, {
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
function Tu(n = []) {
  return (Array.isArray(n) ? n : []).map((e) => e?.name || e?.id);
}
async function we(n, e, r = {}) {
  if (!n) return null;
  const t = String(e || "").trim(), a = F(r) ? r : {};
  try {
    return Object.prototype.hasOwnProperty.call(a, "type") ? await n.get(t, { type: a.type }) : await n.get(t);
  } catch (o) {
    throw Os("get", { key: t }, ie(o));
  }
}
async function wu(n, e = {}) {
  if (!n || typeof n.list != "function") return {
    keys: [],
    list_complete: !0,
    cursor: ""
  };
  const r = F(e) ? e : {}, t = String(r.prefix || "").trim(), a = String(r.cursor || "").trim();
  try {
    return a ? await n.list({
      prefix: t,
      cursor: a
    }) : await n.list({ prefix: t });
  } catch (o) {
    throw Os("list", { prefix: t }, ie(o));
  }
}
var Du = "sys:theme";
function zi(n, e = {}) {
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
async function Ae(n) {
  const e = Ca(n);
  if (!e) return {};
  const r = bo(n), t = dn(n), a = t.ConfigCache;
  if (a?.exp > K() && a.data) return a.data;
  const o = t.RuntimeConfigCacheGeneration;
  return await ln(t.SingleFlightTasks, tt([
    "runtime_config",
    r,
    o
  ]), async () => {
    const s = t.ConfigCache;
    if (s?.exp > K() && s.data) return s.data;
    const i = s?.data && typeof s.data == "object" ? s.data : a?.data && typeof a.data == "object" ? a.data : null;
    let c = i || {};
    try {
      c = te(await e.get("sys:theme", { type: "json" }) || {});
    } catch (l) {
      const d = i && typeof i == "object";
      Ne("runtime_config.load_failed", l, {
        cacheNamespace: r,
        configKey: Du,
        usedCachedConfig: d === !0
      }), c = d ? i : te({});
    }
    return t.RuntimeConfigCacheGeneration === o && (t.ConfigCache = {
      data: c,
      exp: K() + O.Defaults.CacheTTL,
      namespace: r
    }), c;
  });
}
async function de(n) {
  const e = Ca(n);
  return e ? te(await we(e, "sys:theme", { type: "json" }) || {}) : {};
}
function Nu(n = {}, e = {}) {
  const { indexRepository: r } = n;
  async function t(f, m, p, g = He(m), h = null) {
    const y = F(h) ? te(h) : te(await de(m)), S = await r.getAdminActiveIndexRecord(r.getKV(m)), _ = S ? te({
      ...y,
      indexUrl: S.sourceUrl
    }) : y;
    if (e.isAdminIndexSetupForced(f)) return e.renderAdminIndexSetupPage(f, m, p, g, _, "manual_setup_requested");
    const A = ut(m, _);
    if (!A.indexUrl) {
      try {
        const R = await e.renderBundledAdminPage(f, m, p, g, _);
        if (R) return R;
      } catch (R) {
        return Ne("admin.bundled_shell_render", R, { path: new URL(f.url).pathname }), e.renderAdminIndexSetupPage(f, m, p, g, _, "bundled_shell_render_failed");
      }
      return e.renderAdminIndexSetupPage(f, m, p, g, _);
    }
    const b = A.indexUrl;
    if (b) try {
      const R = await e.renderRemoteAdminPage(f, m, p, g, b, _);
      if (R) return R;
    } catch (R) {
      return Ne("admin.remote_shell_render", R, {
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
  async function i(f, m, p = He(m), g = null) {
    const h = F(g) ? te(g) : te(await de(m)), y = ut(m, h);
    if (!y.indexUrl) return B("ADMIN_INDEX_NOT_CONFIGURED", "管理台 index.html 尚未配置", 409);
    const S = [], _ = { waitUntil(P) {
      S.push(Promise.resolve(P));
    } }, A = et(m), b = new URL(f.url);
    b.pathname = A, b.search = "";
    const R = await e.renderRemoteAdminPage(o(b), m, _, p, y.indexUrl, h);
    await Promise.all(S.splice(0));
    const E = sr(), w = y.assetRevision || y.releaseTag, D = y.isLocalUpload ? await r.getAdminIndexUploadRecord(r.getKV(m), y.localUploadRevision) : null;
    let C = null;
    D?.manifest ? (C = await e.readAdminReleaseVendorManifestFromCache(E, w, y.indexUrl), C || (C = await e.cacheAdminReleaseVendorManifest(E, D.manifest, _))) : C = await e.getOrCreateAdminReleaseVendorManifest(E, w, y.indexUrl, _);
    const T = (Array.isArray(C?.entries) ? C.entries : []).filter((P) => P?.assetKey && !e.isMutableJsdelivrGithubAssetUrl(P.upstreamUrl)), I = await a(T, async (P) => {
      const N = e.buildAdminReleaseVendorProxyPath(A, w, P.assetKey), L = new URL(f.url);
      return L.pathname = N, L.search = "", e.renderAdminReleaseVendorAsset(o(L), m, _, {
        releaseTag: w,
        assetKey: P.assetKey
      }, h);
    });
    await Promise.all(S.splice(0));
    const x = I.filter((P) => !s(P)).length, U = s(R), k = JSON.stringify({
      ok: U && x === 0,
      shellStatus: Number(R?.status) || 0,
      warmedAssetCount: T.length - x,
      failedAssetCount: x
    }), G = new Headers({
      "Content-Type": "application/json;charset=UTF-8",
      "Cache-Control": "no-store, max-age=0"
    });
    return Ce(G), new Response(f.method === "HEAD" ? null : k, {
      status: U && x === 0 ? 200 : 502,
      headers: G
    });
  }
  function c(f, m = He(f)) {
    const p = et(f), g = m.ok ? "" : `<div class="landing-banner"><div class="landing-banner-title">系统未初始化</div><div class="landing-banner-text">缺少关键环境变量：${m.missing.map((S) => Re(S)).join("、")}</div></div>`, h = `<!DOCTYPE html><html lang="zh-CN"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"><link rel="icon" href="/favicon.ico" sizes="any"><title>Emby Proxy V19.3</title>${e.LANDING_PAGE_STYLE_HTML}</head><body><main class="landing-shell"><section class="landing-card"><div class="landing-grid"><div class="landing-primary">${g}<div class="landing-pill">Headless Edge Relay</div><h1 class="landing-title">Emby Proxy V19.3</h1><p class="landing-text">为了极致优化视频代理性能，根路径默认只保留无头中继与说明壳；真正的管理台入口固定收口到 <span class="landing-highlight">${Re(p)}</span>，并由 Worker 读取随部署发布或已上传的 <code>index.html</code> 返回。</p><div class="landing-actions"><a href="${Re(p)}" class="landing-btn landing-btn-primary">访问 ${Re(p)}</a><a href="https://github.com/axuitomo/CF-EMBY-PROXY-UI" target="_blank" rel="noopener noreferrer" class="landing-btn landing-btn-secondary">查看项目说明</a></div></div><div class="landing-side"><div class="landing-notes"><div class="landing-notes-title">Routing Notes</div><ul class="landing-note-list"><li>根路径仅提供静态说明页，不承载实时配置数据。</li><li><code>${Re(p)}</code> 只负责返回管理台壳与 bootstrap，动态数据继续走 <code>POST ${Re(p)}</code> API。</li><li>正式真相源固定为 <code>frontend/</code>、<code>worker.js</code> 与 <code>worker.md</code>。</li><li>媒体代理、日志与 KV / D1 逻辑保持原 Worker 主链路不变。</li></ul></div></div></div></section></main></body></html>`, y = new Headers({
      "Content-Type": "text/html;charset=UTF-8",
      "Cache-Control": "public, max-age=3600, s-maxage=86400"
    });
    return Ce(y), y.set("X-Frame-Options", "DENY"), new Response(h, { headers: y });
  }
  function l(f, m = "/", p = 302) {
    const g = new URL(f.url);
    g.pathname = Z(m || "/"), g.search = "", g.hash = "";
    const h = new Headers({
      Location: g.toString(),
      "Cache-Control": "no-store, max-age=0"
    });
    return Ce(h), new Response(null, {
      status: p,
      headers: h
    });
  }
  async function d(f, m, p = He(m)) {
    const g = et(m), h = _o(m), y = Hn(p), S = $r({
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
  function u(f, m, p = 200, g = {}) {
    const h = new Headers(f);
    return Ce(h), g.mergeOriginVary === !0 && h.get("Access-Control-Allow-Origin") !== "*" && xr(h, "Origin"), new Response(m, {
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
    renderAdminLoginPage: d,
    buildEdgeCorsResponse: u
  };
}
function Co(n = "") {
  return /(?:^|\/)smartstrm(?:$|[/?])/i.test(String(n || ""));
}
function fa(n = "") {
  return Va(n) || /\/audio\/[^/]+(?:\/|$)/i.test(String(n || "")) || /\/livetv\/[^/]+(?:\/|$)/i.test(String(n || "")) || Co(n);
}
function Lu(n = "") {
  const e = String(n || "").trim();
  return /^[a-z][a-z0-9+.-]*:/i.test(e) || e.startsWith("//");
}
function $i(n = "") {
  return /\/playbackinfo(?:$|[/?])/i.test(String(n || ""));
}
function Va(n = "") {
  const e = Z(n);
  return $i(e) || Co(e) || ht.test(e) || di.test(e) ? !0 : /\/videos\/[^/]+\/(?:stream|original|download|file)\b/i.test(e) || /\/items\/[^/]+\/download\b/i.test(e);
}
function Bi(n = "") {
  return /\/sessions\/playing\/progress(?:$|[/?])/i.test(String(n || ""));
}
function Wi(n = "") {
  return /\/sessions\/playing\/stopped(?:$|[/?])/i.test(String(n || ""));
}
function Mu(n = "") {
  return /\/sessions\/playing\/ping(?:$|[/?])/i.test(String(n || ""));
}
function Iu(n = "") {
  const e = String(n || "");
  return Bi(e) || Wi(e) || Mu(e) ? !1 : /\/sessions\/playing(?:\/started)?(?:$|[/?])/i.test(e);
}
function Pu(n = {}, e = {}) {
  function r(t, a) {
    let o = a;
    const s = Dt(t[o]);
    let i = Ti(s) === "main" ? "/" + s : "";
    for (o += 1; o < t.length; o += 1) i += "/" + Dt(t[o]);
    return Va(i || "/");
  }
  return { isPlaybackCriticalSegments: r };
}
function xu(n = {}) {
  const e = {};
  for (const [r, t] of Object.entries(Rd(n, e))) e[r] = t;
  for (const [r, t] of Object.entries(Ed(n, e))) e[r] = t;
  for (const [r, t] of Object.entries(Cd(n, e))) e[r] = t;
  for (const [r, t] of Object.entries(Td(n, e))) e[r] = t;
  for (const [r, t] of Object.entries(Nu(n, e))) e[r] = t;
  for (const [r, t] of Object.entries(Pu(n, e))) e[r] = t;
  return e;
}
function Ga(n) {
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
var Vi = 1024 * 1024 * 1024, Ou = 500 * 1024 * 1024, vu = 10 * 1024 * 1024 * 1024, To = Object.freeze({
  planClass: "free",
  planLabel: "FREE",
  periodLabel: "今日",
  kv: {
    read: 1e5,
    write: 1e3,
    delete: 1e3,
    list: 1e3,
    storageBytes: Vi
  },
  d1: {
    rowsRead: 5e6,
    rowsWritten: 1e5,
    storageBytes: Ou
  }
}), Gi = Object.freeze({
  planClass: "paid",
  planLabel: "PAID",
  periodLabel: "本月",
  kv: {
    read: 1e7,
    write: 1e6,
    delete: 1e6,
    list: 1e6,
    storageBytes: Vi
  },
  d1: {
    rowsRead: 25e9,
    rowsWritten: 5e7,
    storageBytes: vu
  }
}), Fu = Object.freeze({
  free: To,
  paid: Gi
});
function ye(n) {
  const e = Number(n);
  return Number.isFinite(e) ? Math.max(0, Math.round(e)).toLocaleString("en-US") : "0";
}
function ma(n) {
  const e = Number(n);
  return !Number.isFinite(e) || e <= 0 ? 0 : e >= 100 ? 100 : Math.max(0, Math.round(e * 10) / 10);
}
function Uu(n = 0) {
  const e = Number(n);
  return !Number.isFinite(e) || e <= 0 ? "slate" : e >= 90 ? "danger" : e >= 70 ? "warning" : "success";
}
function pa(n = "") {
  return String(n || "").trim().toLowerCase() || "bundled";
}
function ji(n = "") {
  const e = pa(n);
  return e === "standard" || e === "unbound" ? {
    ...Gi,
    usageModel: e
  } : {
    ...To,
    usageModel: e
  };
}
function Wn(n = {}) {
  const e = Eo(n?.override);
  return e ? {
    ...ga(e),
    usageModel: pa(n?.usageModel),
    override: e
  } : {
    ...ji(n?.usageModel),
    override: ""
  };
}
function ga(n = "free") {
  return Fu[String(n || "").trim().toLowerCase() === "paid" ? "paid" : "free"] || To;
}
async function Hu(n = {}) {
  const e = te(F(n) ? n : {}), r = Eo(e.cfQuotaPlanOverride);
  if (r) return Wn({ override: r });
  const t = String(e.cfAccountId || "").trim(), a = String(e.cfApiToken || "").trim();
  if (!t || !a) return {
    ...ga("free"),
    usageModel: pa("bundled"),
    override: ""
  };
  try {
    return Wn({ usageModel: await Qi(t, a) });
  } catch {
    return {
      ...ga("free"),
      usageModel: pa("bundled"),
      override: ""
    };
  }
}
function ku(n = {}) {
  const e = F(n) ? n : {}, r = Math.max(1, Math.floor(Number(e.writeLimit) || 0)), t = Math.max(0, Math.floor(Number(e.estimatedPutCount) || 0)), a = Math.max(0, Math.floor(Number(e.estimatedRollbackWriteCount) || 0)), o = Math.max(0, Math.floor(Number(e.estimatedWorstCaseWriteCount) || 0)), s = Math.max(0, o - r), i = String(e.planLabel || "").trim() || "FREE", c = String(e.periodLabel || "").trim() || "今日";
  return o <= r ? "" : `KV 整理已拦截：当前 ${i} 计划 · ${c} 写入上限为 ${ye(r)}，本次预计写入 ${ye(t)} 次，最坏回滚写回 ${ye(a)} 次，最坏共 ${ye(o)} 次，超出 ${ye(s)} 次。`;
}
function Ku(n = {}) {
  const e = F(n) ? n : {}, r = String(e.planLabel || "").trim() || "FREE", t = String(e.periodLabel || "").trim() || "今日", a = Math.max(1, Math.floor(Number(e.writeLimit) || 0)), o = Math.max(0, Math.floor(Number(e.estimatedPutCount) || 0)), s = Math.max(0, Math.floor(Number(e.estimatedDeleteCount) || 0)), i = Math.max(0, Math.floor(Number(e.estimatedRollbackWriteCount) || 0)), c = Math.max(0, Math.floor(Number(e.estimatedWorstCaseWriteCount) || 0));
  return `KV 配额预算：${r} 计划 · ${t}，预计 put ${ye(o)} 次，delete ${ye(s)} 次，最坏回滚写回 ${ye(i)} 次，最坏写入 ${ye(c)} / ${ye(a)}。`;
}
function zu(n = "free", e = /* @__PURE__ */ new Date()) {
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
function vt(n, e = "cloudflare_runtime_error") {
  return String(n?.message || n || e).trim().replace(/\s+/g, " ").slice(0, 240) || e;
}
function es(n, e = "count") {
  return e === "bytes" ? Ga(Math.max(0, Number(n) || 0)) : ye(n);
}
function ts(n = 0, e = K()) {
  const r = Math.max(0, Number(n) || 0), t = Math.max(r, Number(e) || K());
  if (r <= 0) return "";
  const a = Math.max(0, t - r);
  return a < 60 * 1e3 ? "缓存年龄：不到 1 分钟" : a < 3600 * 1e3 ? `缓存年龄：${Math.max(1, Math.round(a / (60 * 1e3)))} 分钟` : `缓存年龄：${Math.max(1, Math.round(a / (3600 * 1e3)))} 小时`;
}
function Sr({ key: n = "", label: e = "", used: r = 0, limit: t = 0, kind: a = "count" } = {}) {
  const o = Math.max(0, Number(r) || 0), s = Math.max(0, Number(t) || 0), i = s > 0 ? o / s * 100 : 0, c = ma(i);
  return {
    key: String(n || "").trim(),
    label: String(e || "").trim(),
    usedValue: o,
    limitValue: s,
    usedText: es(o, a),
    limitText: es(s, a),
    percent: c,
    percentText: `${c % 1 === 0 ? Math.round(c) : c}%`,
    tone: Uu(i),
    rawPercent: i
  };
}
function rs(n = []) {
  return (Array.isArray(n) ? n : []).filter((e) => Number(e?.rawPercent) > 100).map((e) => String(e?.label || "").trim()).filter(Boolean);
}
function ja(n = {}, e = {}) {
  const r = (Array.isArray(n.metrics) ? n.metrics : []).map((t) => ({
    key: String(t?.key || "").trim(),
    label: String(t?.label || "").trim(),
    usedText: String(t?.usedText || "").trim(),
    limitText: String(t?.limitText || "").trim(),
    percent: ma(t?.percent),
    percentText: String(t?.percentText || `${ma(t?.percent)}%`).trim(),
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
function _r(n = "", e = "", r = "") {
  return ja({
    title: n,
    status: "skipped",
    summary: e,
    detail: r
  });
}
function br(n = "", e = "", r = "") {
  return ja({
    title: n,
    status: "failed",
    summary: e,
    detail: r
  });
}
function $u(n = "", e = {}, r = 0, t = []) {
  const a = Math.max(1, Math.min(100, Math.round(Number(r) || 0))), o = e && typeof e == "object" ? e : {}, s = (Array.isArray(t) ? t : []).map((p) => ({
    label: String(p?.label || "").trim(),
    percentText: String(p?.percentText || `${ma(p?.percent)}%`).trim()
  })).filter((p) => p.label), i = String(o.resourceLabel || "").trim() || String(n || "").trim(), c = String(o.planLabel || "").trim(), l = String(o.periodLabel || "").trim(), d = [i], u = [c, l].filter(Boolean);
  u.length > 0 && d.push(`（${u.join(" / ")}）`);
  const f = s.map((p) => `${p.label} ${p.percentText}`).join("、"), m = String(o.status || "").trim().toLowerCase() === "partial_failure" ? "（使用缓存数据）" : "";
  return `${String(n || "Cloudflare").trim() || "Cloudflare"} 使用量达到阈值：${d.join("")}，${f}（阈值 ${a}%）${m}`;
}
function wn(n = [], e = []) {
  const r = new Set((Array.isArray(e) ? e : [e]).map((t) => String(t || "").trim()).filter(Boolean));
  for (const t of Array.isArray(n) ? n : []) {
    const a = String(t?.key || "").trim();
    if (!r.has(a)) continue;
    const o = String(t?.percentText || "").trim();
    if (o) return o;
    if (t?.percent !== void 0 && t?.percent !== null) return `${ma(t.percent)}%`;
  }
  return "暂不可用";
}
function Bu(n = {}, e = {}) {
  const r = n && typeof n == "object" ? n : {}, t = e && typeof e == "object" ? e : {}, a = String(r.requestCountDisplay || "").trim() || (r.todayRequests === null || r.todayRequests === void 0 ? "暂不可用" : String(Number(r.todayRequests) || 0)), o = String(r.todayTraffic || "").trim() || "暂不可用", s = String(r.monthlyTraffic || "").trim() || "暂不可用", i = Math.max(0, Number(r.playCount) || 0), c = Math.max(0, Number(r.infoCount) || 0);
  return [
    `📊 EMBY-PROXY每日报表${t.dateKey ? ` (${t.dateKey})` : ""}`,
    "",
    `请求数: ${a}`,
    `视频流量 (CF 总计): ${o}`,
    `本月流量 (CF 总计): ${s}`,
    `请求: 播放请求 ${ye(i)} 次 | 获取播放信息 ${ye(c)} 次`,
    "#Cloudflare #Emby #日报"
  ].map((l) => String(l || "").trim()).filter((l, d, u) => !(l === "" && (d === 0 || u[d - 1] === ""))).join(`
`);
}
function Wu(n = "", e = {}, r = {}) {
  const t = Si(n);
  if (t === "summary") return Bu(e, r);
  const a = t === "d1" ? "d1" : "kv", o = e && typeof e == "object" ? e : {}, s = r && typeof r == "object" ? r : {}, i = a === "d1" ? "D1 数据库每日消耗报告" : "KV 数据库每日消耗报告", c = a === "d1" ? "#D1" : "#KV", l = Array.isArray(o.metrics) ? o.metrics : [], d = s.dateKey ? ` (${s.dateKey})` : "", u = String(o.planLabel || "").trim(), f = String(o.periodLabel || "").trim(), m = u || f ? `${u || "未知"} 计划 X ${f || "当前"}配额` : String(o.summary || "").trim() || "暂不可用", p = wn(l, a === "d1" ? ["rowsRead", "read"] : ["read", "rowsRead"]), g = wn(l, a === "d1" ? ["rowsWritten", "write"] : ["write", "rowsWritten"]), h = wn(l, ["storage"]);
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
function as(n = null, e = "") {
  const r = (Array.isArray(n?.errors) ? n.errors : []).map((a) => {
    const o = String(a?.code || "").trim(), s = String(a?.message || "").trim();
    return o && s ? `${o}: ${s}` : s || o;
  }).filter(Boolean);
  if (r.length > 0) return r.join("; ");
  const t = String(e || "").trim();
  return t ? t.replace(/\s+/g, " ").slice(0, 300) : "";
}
async function be(n, e, r = {}) {
  const t = r && typeof r == "object" ? r : {};
  let a = {};
  const o = t?.headers;
  o && (o instanceof Headers ? a = Object.fromEntries(o.entries()) : typeof o == "object" && (a = o));
  const s = typeof FormData < "u" && t?.body instanceof FormData, i = await Ke(n, {
    ...t,
    headers: {
      Authorization: `Bearer ${e}`,
      ...s ? {} : { "Content-Type": "application/json" },
      ...a
    }
  }), c = await Pe(i, vs);
  if (c.exceeded) throw new Error("cf_api_response_too_large");
  const l = c.text;
  let d = null;
  if (l) try {
    d = JSON.parse(l);
  } catch {
  }
  if (!i.ok) {
    const u = Number(i.status) || 0, f = as(d, l), m = /* @__PURE__ */ new Error(f ? `cf_api_http_${u}: ${f}` : `cf_api_http_${u}`);
    throw m.status = u, m;
  }
  if (!d || typeof d != "object") return {};
  if (d?.success === !1) {
    const u = as(d, l);
    throw new Error(u || "cf_api_error");
  }
  return d;
}
async function qi(n, e, r) {
  const t = r && typeof r == "object" ? {
    query: e,
    variables: r
  } : { query: e }, a = await Ke("https://api.cloudflare.com/client/v4/graphql", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${n}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify(t)
  });
  if (!a.ok) throw new Error(`cf_graphql_http_${a.status}`);
  const o = await Pe(a, vs);
  if (o.exceeded) throw new Error("cf_graphql_response_too_large");
  const s = JSON.parse(o.text);
  if (Array.isArray(s?.errors) && s.errors.length) throw new Error(s.errors.map((i) => i?.message).filter(Boolean).join("; ") || "cf_graphql_error");
  return s;
}
async function Xi(n, e, r, t) {
  return (await qi(e, r, t))?.data?.viewer?.zones?.[0] || null;
}
async function pn(n, e, r, t) {
  return (await qi(e, r, t))?.data?.viewer?.accounts?.[0] || null;
}
async function Yi(n, e) {
  return !n || !e ? null : (await be(`https://api.cloudflare.com/client/v4/zones/${encodeURIComponent(String(n).trim())}`, e))?.result || null;
}
async function Ji(n, e, r = {}) {
  const t = String(n || "").trim();
  return await he(Yi(t, e), String(r?.scope || "cloudflare.zone_lookup"), {
    zoneId: t,
    ...F(r?.context) ? r.context : {}
  }, null);
}
async function wo(n, e, r = {}) {
  const t = await Yi(n, e), a = String(t?.name || "").trim();
  if (t && a) return t;
  const o = /* @__PURE__ */ new Error("cf_zone_context_missing");
  throw o.code = "CF_ZONE_CONTEXT_MISSING", o.status = 400, o.details = {
    zoneId: String(n || "").trim(),
    scope: String(r?.scope || "").trim()
  }, o;
}
async function Qi(n, e) {
  const r = String(n || "").trim(), t = String(e || "").trim();
  return !r || !t ? "" : pa((await be(`https://api.cloudflare.com/client/v4/accounts/${encodeURIComponent(r)}/workers/account-settings`, t))?.result?.default_usage_model);
}
async function Vu(n, e, r) {
  const t = String(n || "").trim(), a = String(e || "").trim(), o = String(r || "").trim();
  return !t || !a || !o ? null : (await be(`https://api.cloudflare.com/client/v4/accounts/${encodeURIComponent(t)}/storage/kv/namespaces/${encodeURIComponent(a)}`, o))?.result || null;
}
async function ns(n, e, r) {
  const t = String(n || "").trim(), a = String(e || "").trim(), o = String(r || "").trim();
  return !t || !a || !o ? null : (await be(`https://api.cloudflare.com/client/v4/accounts/${encodeURIComponent(t)}/d1/database/${encodeURIComponent(a)}`, o))?.result || null;
}
async function Gu({ accountId: n, apiToken: e, namespaceId: r, startIso: t, endIso: a }) {
  const o = String(n || "").trim(), s = String(e || "").trim(), i = String(r || "").trim();
  if (!o || !s || !i) return null;
  const c = await pn(o, s, `
    query {
      viewer {
        accounts(filter: { accountTag: ${_e(o)} }) {
          kvOperationsAdaptiveGroups(
            limit: 1000
            filter: {
              namespaceId: ${_e(i)}
              datetime_geq: ${_e(String(t || "").trim())}
              datetime_leq: ${_e(String(a || "").trim())}
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
              datetime_leq: ${_e(String(a || "").trim())}
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
async function ju({ accountId: n, apiToken: e, databaseId: r, startIso: t, endIso: a }) {
  const o = String(n || "").trim(), s = String(e || "").trim(), i = String(r || "").trim();
  if (!o || !s || !i) return null;
  const c = await pn(o, s, `
    query {
      viewer {
        accounts(filter: { accountTag: ${_e(o)} }) {
          d1AnalyticsAdaptiveGroups(
            limit: 1000
            filter: {
              databaseId: ${_e(i)}
              datetime_geq: ${_e(String(t || "").trim())}
              datetime_leq: ${_e(String(a || "").trim())}
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
async function qu({ accountId: n, apiToken: e, databaseId: r, startIso: t, endIso: a, utcOffsetMinutes: o = O.Defaults.ScheduleUtcOffsetMinutes }) {
  const s = String(n || "").trim(), i = String(e || "").trim(), c = String(r || "").trim();
  if (!s || !i || !c) return [];
  const l = await pn(s, i, `
    query {
      viewer {
        accounts(filter: { accountTag: ${_e(s)} }) {
          d1AnalyticsAdaptiveGroups(
            limit: 10000
            filter: {
              databaseId: ${_e(c)}
              datetime_geq: ${_e(String(t || "").trim())}
              datetime_leq: ${_e(String(a || "").trim())}
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
    const g = Bt(new Date(p), o), h = `${g.dateKey}:${g.hour}`, y = u.get(h) || {
      dateKey: g.dateKey,
      hour: g.hour,
      rowsWritten: 0,
      writeQueries: 0
    };
    y.rowsWritten += Math.max(0, Number(f?.sum?.rowsWritten) || 0), y.writeQueries += Math.max(0, Number(f?.sum?.writeQueries) || 0), u.set(h, y);
  }
  return [...u.values()].sort((f, m) => f.dateKey !== m.dateKey ? String(f.dateKey).localeCompare(String(m.dateKey)) : Number(f.hour) - Number(m.hour));
}
async function Xu({ cfAccountId: n, cfZoneId: e, cfApiToken: r, startIso: t, endIso: a, utcOffsetMinutes: o = O.Defaults.ScheduleUtcOffsetMinutes }) {
  if (!n || !r) return null;
  const s = await pn(n, r, `
  query {
    viewer {
      accounts(filter: { accountTag: ${_e(n)} }) {
        workersInvocationsAdaptive(limit: 10000, filter: { datetime_geq: ${_e(t)}, datetime_leq: ${_e(a)} }) {
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
    const p = Bt(m, o).hour;
    c[p] && (c[p].total += u);
  }
  return {
    totalRequests: l,
    hourlySeries: c
  };
}
async function Yu({ cfAccountId: n, cfZoneId: e, cfApiToken: r, zoneNameFallback: t = "" }) {
  const a = [], o = (s, i = {}) => {
    const c = ro(s);
    if (!c) return;
    const l = i.wildcard === !0 || c.wildcard === !0;
    a.push({
      hostname: c.hostname,
      path: String(i.path || ""),
      wildcard: l,
      score: go(c.hostname, {
        wildcard: l,
        path: i.path || ""
      })
    });
  };
  if (n && e) try {
    const s = await be(`https://api.cloudflare.com/client/v4/accounts/${encodeURIComponent(String(n).trim())}/workers/domains?zone_id=${encodeURIComponent(String(e).trim())}`, r);
    for (const i of s?.result || []) o(i?.hostname);
  } catch (s) {
    console.log("CF Workers domains lookup failed, will try routes", s);
  }
  if (!a.length && e) try {
    let s = 1, i = 1;
    do {
      const c = await be(`https://api.cloudflare.com/client/v4/zones/${encodeURIComponent(String(e).trim())}/workers/routes?page=${s}&per_page=100`, r);
      i = Number(c?.result_info?.total_pages || c?.result_info?.totalPages || 1);
      for (const l of c?.result || []) {
        const d = Ys(l?.pattern);
        d && o(d.hostname, {
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
function Wt(n = "") {
  const e = String(n || "").trim();
  return /^[a-z0-9_][a-z0-9-_]*$/i.test(e) ? e : "";
}
function gn(n) {
  if (n !== void 0)
    try {
      return JSON.parse(JSON.stringify(n));
    } catch {
      return null;
    }
}
function Ue(n, e = [], r = {}) {
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
  for (const l of i) for (const d of l) {
    if (c.has(d)) continue;
    c.add(d);
    const u = n?.[d];
    if (typeof u == "string" && u.trim()) return u.trim();
    if (!(!u || typeof u != "object"))
      for (const f of l) {
        const m = u?.[f];
        if (typeof m == "string" && m.trim()) return m.trim();
      }
  }
  return "";
}
function Ju(n = "") {
  const e = String(n || "").trim().toLowerCase();
  return e ? e === "aws" ? "AWS" : e === "gcp" || e === "google" ? "GCP" : e === "azure" ? "Azure" : e.toUpperCase() : "";
}
function Qu(n = "", e = "") {
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
function Zu(n) {
  return Array.isArray(n) ? n : n && typeof n == "object" ? [n] : typeof n == "string" && n.trim() ? [{ value: n }] : [];
}
function ef(n = []) {
  const e = [], r = /* @__PURE__ */ new Set();
  for (const t of Array.isArray(n) ? n : []) {
    const a = String(t?.id || t?.provider || t?.providerId || "").trim().toLowerCase();
    if (!a) continue;
    const o = Ju(a);
    for (const s of Array.isArray(t?.regions) ? t.regions : []) {
      const i = String(s?.id || s?.region || s?.value || "").trim();
      if (!i) continue;
      const c = `${a}:${i}`;
      if (r.has(c)) continue;
      r.add(c);
      const l = Qu(i, a);
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
function Mr(n, e = "", r = []) {
  const t = Ue(n, [
    "region",
    "value",
    "id"
  ]);
  if (!t) return "";
  if (t.includes(":")) return t;
  const a = Ue(e, [
    "provider",
    "providerId",
    "id",
    "value"
  ]).toLowerCase();
  if (a) return `${a}:${t}`;
  const o = (Array.isArray(r) ? r : []).filter((s) => String(s?.region || "").trim() === t || String(s?.value || "").trim() === t);
  return o.length === 1 ? String(o[0]?.value || "").trim() : t;
}
function ha(n = {}, e = []) {
  const r = n && typeof n == "object" ? n : {}, t = String(r?.mode || "").trim().toLowerCase(), a = Zu(r?.target), o = Mr(r?.region, r?.provider || r?.providerId || "", e), s = a.find((S) => !!Mr(Ue(S, [
    "region",
    "value",
    "id"
  ]), Ue(S, ["provider", "providerId"]), e)), i = s ? Mr(Ue(s, [
    "region",
    "value",
    "id"
  ]), Ue(s, ["provider", "providerId"]), e) : "", c = Ue(r?.hostname, ["hostname"], { allowFallback: !1 }) || Ue(r, ["hostname"], { allowFallback: !1 }), l = Ue(a.find((S) => Ue(S, ["hostname"], { allowFallback: !1 })), ["hostname"], { allowFallback: !1 }), d = Ue(r?.host, ["host"], { allowFallback: !1 }) || Ue(r, ["host"], { allowFallback: !1 }), u = Ue(a.find((S) => Ue(S, ["host"], { allowFallback: !1 })), ["host"], { allowFallback: !1 }), f = Ue(a[0], ["value", "id"]);
  let m = "default", p = "__default__", g = "", h = "default", y = "";
  return t === "smart" ? (m = "smart", p = "__smart__", h = "smart") : t === "targeted" ? c || l ? (m = "hostname", p = "", g = c || l, h = "") : d || u ? (m = "host", p = "", g = d || u, h = "") : (m = "targeted", p = i || o || "", g = p || f || "", h = "") : o ? (m = "region", p = o, h = "region", y = o) : c ? (m = "hostname", p = "", g = c, h = "") : d ? (m = "host", p = "", g = d, h = "") : (i || a.length > 0) && (m = "targeted", p = i || "", g = p || f || "", h = ""), {
    currentMode: m,
    currentValue: p,
    currentTarget: g,
    selectedMode: h,
    selectedRegion: y,
    isTargetedOverride: m === "hostname" || m === "host" || m === "targeted"
  };
}
function Zi(n = []) {
  return (Array.isArray(n) ? n : []).filter((e) => e && typeof e == "object").map((e) => {
    const r = String(e.scope || "").trim(), t = String(e.permission || "").trim(), a = String(e.alternative || "").trim(), o = String(e.note || "").trim(), s = [];
    return r && s.push(`${r}级`), t && s.push(`"${t}"`), a && s.push(`（若当前令牌仅授予写权限，可改用 "${a}"）`), o && s.push(`：${o}`), s.join("");
  }).filter(Boolean);
}
function ec(n = "", e = {}) {
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
function tf(n = "", e = "读取", r = {}) {
  const t = Zi(ec(n, r));
  return t.length <= 0 ? `Cloudflare Worker 放置${e}失败：API Token 权限不足` : `Cloudflare Worker 放置${e}失败：API Token 权限不足。至少需要：${t.join("；")}`;
}
function hn(n = "WORKER_PLACEMENT_FORBIDDEN", e = "", r = "读取", t = {}) {
  return Te(n, tf(e, r, t), 403, {
    permissionKind: String(e || "").trim(),
    requiredPermissions: ec(e, t)
  });
}
function Vn(n = {}) {
  const e = n && typeof n == "object" && !Array.isArray(n) ? n : {}, r = Object.prototype.hasOwnProperty.call(e, "currentValue"), t = Object.prototype.hasOwnProperty.call(e, "selectedMode");
  return {
    configured: e.configured === !0,
    scriptName: String(e.scriptName || "").trim(),
    requestHost: ee(e.requestHost || ""),
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
function rf(n = "", e = "", r = !1) {
  const t = ee(n), a = ee(e);
  return !t || !a ? !1 : r ? t === a || t.endsWith(`.${a}`) : t === a;
}
function af(n = "", e = "/") {
  const r = String(n || "").trim(), t = String(e || "/").trim() || "/";
  return !r || r === "/" || r === "/*" ? !0 : r.endsWith("*") ? t.startsWith(r.slice(0, -1)) : t === r;
}
function nf(n = {}) {
  const e = ee(n?.hostname || ""), r = Wt(n?.service || n?.script || n?.name || "");
  return !e || !r ? null : {
    source: "domains",
    hostname: e,
    wildcard: !1,
    path: "/",
    scriptName: r,
    score: go(e, {
      wildcard: !1,
      path: "/"
    })
  };
}
function of(n = {}) {
  const e = Ys(n?.pattern), r = Wt(n?.script || n?.service || n?.name || "");
  return !e || !r ? null : {
    source: "routes",
    hostname: e.hostname,
    wildcard: e.wildcard === !0,
    path: e.path || "/",
    pattern: e.pattern,
    scriptName: r,
    score: go(e.hostname, {
      wildcard: e.wildcard === !0,
      path: e.path || "/"
    })
  };
}
function os(n = [], e = "", r = "/") {
  const t = ee(e), a = String(r || "/").trim() || "/", o = [];
  for (const i of Array.isArray(n) ? n : [])
    !i?.scriptName || !i?.hostname || rf(t, i.hostname, i.wildcard === !0) && af(i.path || "/", a) && o.push({
      ...i,
      exactHostname: t === ee(i.hostname),
      exactPath: String(i.path || "/") === a
    });
  if (o.length > 0)
    return o.sort((i, c) => Number(c.exactHostname) - Number(i.exactHostname) || Number(c.exactPath) - Number(i.exactPath) || Number(c.score || 0) - Number(i.score || 0) || String(i.hostname || "").length - String(c.hostname || "").length || String(i.scriptName || "").localeCompare(String(c.scriptName || ""))), o[0];
  const s = [...new Set((Array.isArray(n) ? n : []).map((i) => String(i?.scriptName || "").trim()).filter(Boolean))];
  return s.length === 1 && (Array.isArray(n) ? n : []).find((i) => String(i?.scriptName || "").trim() === s[0]) || null;
}
async function tc(n, e) {
  const r = String(n || "").trim(), t = String(e || "").trim();
  if (!r || !t) return [];
  let a = null;
  try {
    a = await be(`https://api.cloudflare.com/client/v4/accounts/${encodeURIComponent(r)}/workers/placement/regions`, t);
  } catch (o) {
    throw Number(o?.status) === 403 ? hn("WORKER_PLACEMENT_REGIONS_FORBIDDEN", "regions_read", "读取") : o;
  }
  return ef(a?.result?.providers);
}
async function sf(n, e, r = {}) {
  const t = String(n || "").trim(), a = String(e || "").trim();
  if (!t || !a) return [];
  const o = new URL(`https://api.cloudflare.com/client/v4/accounts/${encodeURIComponent(t)}/workers/domains`), s = String(r?.zoneId || "").trim(), i = ee(r?.hostname || ""), c = Wt(r?.service || "");
  s && o.searchParams.set("zone_id", s), i && o.searchParams.set("hostname", i), c && o.searchParams.set("service", c);
  const l = await be(o.toString(), a);
  return Array.isArray(l?.result) ? l.result : [];
}
async function cf(n, e) {
  const r = String(n || "").trim(), t = String(e || "").trim();
  if (!r || !t) return [];
  const a = [];
  let o = 1, s = 1;
  do {
    const i = await be(`https://api.cloudflare.com/client/v4/zones/${encodeURIComponent(r)}/workers/routes?page=${o}&per_page=100`, t);
    Array.isArray(i?.result) && a.push(...i.result), s = Number(i?.result_info?.total_pages || i?.result_info?.totalPages || 1), o += 1;
  } while (o <= s && o <= 10);
  return a;
}
async function Do({ cfAccountId: n, cfZoneId: e, cfApiToken: r, request: t }) {
  const a = new URL(t?.url || "https://invalid.local/"), o = ee(a.hostname), s = String(a.pathname || "/").trim() || "/";
  if (!o) throw Te("WORKER_PLACEMENT_HOST_INVALID", "当前请求 host 无效，无法识别 Worker 脚本", 400);
  const i = [], c = /* @__PURE__ */ new Set();
  let l = null, d = !1, u = !1;
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
        const g = await sf(n, r, m);
        for (const y of g) {
          const S = nf(y);
          if (!S) continue;
          const _ = `${S.source}|${S.scriptName}|${S.hostname}|${S.path}`;
          c.has(_) || (c.add(_), i.push(S));
        }
        const h = os(i, o, s);
        if (h?.scriptName) return {
          requestHost: o,
          requestPath: s,
          scriptName: h.scriptName,
          resolvedBy: h.source
        };
      } catch (g) {
        l = g, Number(g?.status) === 403 && (d = !0), console.warn("[worker_placement.resolve_script.domains_failed]", {
          requestHost: o,
          zoneId: String(m?.zoneId || "").trim(),
          hostname: ee(m?.hostname || ""),
          reason: ie(g)
        });
      }
    }
  }
  try {
    const m = os(await cf(e, r).then((p) => p.map((g) => of(g)).filter(Boolean)), o, s);
    if (m?.scriptName) return {
      requestHost: o,
      requestPath: s,
      scriptName: m.scriptName,
      resolvedBy: m.source
    };
  } catch (m) {
    l = m, Number(m?.status) === 403 && (u = !0), console.warn("[worker_placement.resolve_script.routes_failed]", {
      requestHost: o,
      zoneId: String(e || "").trim(),
      reason: ie(m)
    });
  }
  throw d || u ? hn("WORKER_PLACEMENT_SCRIPT_DISCOVERY_FORBIDDEN", "discovery", "读取", { includeRouteFallback: u }) : l || Te("WORKER_PLACEMENT_SCRIPT_UNRESOLVED", "未能根据当前站点自动识别 Worker 脚本，请确认当前 host 已绑定到该 Zone 的 Workers Domain 或 Workers Route", 400, { requestHost: o });
}
async function qa(n, e, r) {
  let t = null;
  try {
    t = await be(`https://api.cloudflare.com/client/v4/accounts/${encodeURIComponent(String(n || "").trim())}/workers/scripts/${encodeURIComponent(String(e || "").trim())}/settings`, String(r || "").trim());
  } catch (a) {
    throw Number(a?.status) === 403 ? hn("WORKER_PLACEMENT_SETTINGS_READ_FORBIDDEN", "settings_read", "读取") : a;
  }
  return F(t?.result) ? t.result : {};
}
async function Wr(n, e, r, t = {}) {
  const a = new FormData();
  a.append("settings", new Blob([JSON.stringify(t && typeof t == "object" ? t : {})], { type: "application/json" }), "settings.json");
  let o = null;
  try {
    o = await be(`https://api.cloudflare.com/client/v4/accounts/${encodeURIComponent(String(n || "").trim())}/workers/scripts/${encodeURIComponent(String(e || "").trim())}/settings`, String(r || "").trim(), {
      method: "PATCH",
      body: a
    });
  } catch (s) {
    throw Number(s?.status) === 403 ? hn("WORKER_PLACEMENT_SETTINGS_WRITE_FORBIDDEN", "settings_write", "保存") : s;
  }
  return F(o?.result) ? o.result : {};
}
function Xa(n, e = "read") {
  const r = e === "write" ? "保存" : e === "default" ? "恢复默认" : "读取", t = String(n?.message || n || "").trim() || `Worker 放置${r}失败`, a = Number(n?.status) || Number(/cf_api_http_(\d+)/i.exec(t)?.[1] || 0), o = String(n?.code || "").trim().toUpperCase();
  return o.startsWith("WORKER_PLACEMENT_") && String(n?.message || "").trim() ? n.message : a === 401 ? `Cloudflare Worker 放置${r}失败：API Token 无效` : a === 403 ? `Cloudflare Worker 放置${r}失败：API Token 权限不足` : a === 404 && e !== "read" ? "Cloudflare Worker 放置保存失败：未找到目标 Worker 脚本" : a === 404 ? "Cloudflare Worker 放置读取失败：未找到目标 Worker 脚本" : o === "WORKER_PLACEMENT_SCRIPT_UNRESOLVED" || o === "WORKER_PLACEMENT_HOST_INVALID" || o === "WORKER_PLACEMENT_CONFIG_REQUIRED" ? n.message : t;
}
function No(n = {}) {
  const e = String(n?.cfAccountId || "").trim(), r = String(n?.cfZoneId || "").trim(), t = String(n?.cfApiToken || "").trim(), a = [];
  if (e || a.push("cfAccountId"), r || a.push("cfZoneId"), t || a.push("cfApiToken"), a.length <= 0) return {
    cfAccountId: e,
    cfZoneId: r,
    cfApiToken: t
  };
  throw Te("WORKER_PLACEMENT_CONFIG_REQUIRED", "请先在账号设置中填写并保存 Cloudflare Account ID、Zone ID 与 API Token", 400, { missingFields: a });
}
function Lo(n = "") {
  const e = Wt(n);
  return e ? `sys:worker_placement_region:v1:${e}` : "";
}
function kt(n = "WORKER_PLACEMENT_KV_FAILED", e = "Worker 放置 KV 持久化失败", r = null) {
  return Te(n, e, 503, r);
}
function lf(n) {
  return en(n) && String(n?.code || "").trim().toUpperCase().startsWith("WORKER_PLACEMENT_") && String(n?.details?.dependency || "").trim().toUpperCase() === "KV";
}
function rc(n = {}, e = "") {
  const r = Wt(e);
  if (!r || !F(n)) return null;
  const t = Mr(n?.region, n?.provider || n?.providerId || "", []);
  return t ? {
    scriptName: r,
    region: t,
    updatedAt: String(n?.updatedAt || "").trim()
  } : null;
}
async function ac(n, e = "") {
  if (!n) return null;
  const r = Lo(e);
  return r ? rc(await we(n, r, { type: "json" }), e) : null;
}
async function nc(n, e = "", r = "") {
  if (!n) throw kt("WORKER_PLACEMENT_REGION_OVERRIDE_WRITE_FAILED", "Worker 放置 Region 持久化失败：KV 未配置", {
    dependency: "KV",
    operation: "put",
    reason: "kv_not_configured"
  });
  const t = Lo(e), a = Wt(e), o = Mr(r, "", []);
  if (!t || !a || !o) throw kt("WORKER_PLACEMENT_REGION_OVERRIDE_WRITE_FAILED", "Worker 放置 Region 持久化失败：Region 数据无效", {
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
    throw kt("WORKER_PLACEMENT_REGION_OVERRIDE_WRITE_FAILED", "Worker 放置 Region 持久化失败：KV 写入异常", {
      dependency: "KV",
      operation: "put",
      key: t,
      scriptName: a,
      region: o,
      reason: ie(i)
    });
  }
  return s;
}
async function ss(n, e = "") {
  if (!n) throw kt("WORKER_PLACEMENT_REGION_OVERRIDE_DELETE_FAILED", "Worker 放置 Region 清理失败：KV 未配置", {
    dependency: "KV",
    operation: "delete",
    reason: "kv_not_configured"
  });
  const r = Lo(e), t = Wt(e);
  if (!r || !t) return !1;
  try {
    await n.delete(r);
  } catch (a) {
    throw kt("WORKER_PLACEMENT_REGION_OVERRIDE_DELETE_FAILED", "Worker 放置 Region 清理失败：KV 删除异常", {
      dependency: "KV",
      operation: "delete",
      key: r,
      scriptName: t,
      reason: ie(a)
    });
  }
  return !0;
}
function df(n = "") {
  const e = String(n || "").trim();
  return e ? `当前已保存的 Worker Placement Region（${e}）已不在 Cloudflare 可选区域列表中，请重新选择并保存` : "当前已保存的 Worker Placement Region 已不在 Cloudflare 可选区域列表中，请重新选择并保存";
}
function is(n = "", e = "", r = "", t = [], a = {}) {
  const o = Mr(r, "", t), s = Array.isArray(t) ? t : [], i = s.find((d) => String(d?.value || "").trim() === o) || null, c = a?.regionError || null;
  let l = String(a?.error || "").trim();
  return !l && c ? l = Xa(c, "read") : !l && o && s.length > 0 && !i && (l = df(o)), Vn({
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
async function Dn(n, e, r, t = {}) {
  let a = !1, o = !1, s = "";
  try {
    const i = rc(t?.previousOverride, e), c = t?.originalState && typeof t.originalState == "object" ? t.originalState : ha(t?.originalPlacement, t?.regionOptions);
    if (i?.region)
      return a = !0, await Wr(n, e, r, { placement: { region: i.region } }), o = !0, {
        rollbackAttempted: a,
        rollbackSucceeded: o,
        rollbackError: s
      };
    a = !0, String(c?.currentMode || "").trim().toLowerCase() === "default" ? await oc(n, e, r, t?.regionOptions) : await Wr(n, e, r, { placement: gn(t?.originalPlacement) }), o = !0;
  } catch (i) {
    o = !1, s = ie(i);
  }
  return {
    rollbackAttempted: a,
    rollbackSucceeded: o,
    rollbackError: s
  };
}
async function cs(n = {}, e, r = {}) {
  let t = "", a = "";
  try {
    const o = No(n), s = await Do({
      ...o,
      request: e
    });
    t = s.scriptName, a = s.requestHost;
    const i = await ac(r?.kv, s.scriptName);
    let c = [], l = null;
    try {
      c = await tc(o.cfAccountId, o.cfApiToken);
    } catch (u) {
      l = u;
    }
    if (i?.region) return is(s.scriptName, s.requestHost, i.region, c, {
      configured: !l,
      regionError: l
    });
    const d = ha(gn((await qa(o.cfAccountId, s.scriptName, o.cfApiToken))?.placement), c);
    return d.currentMode === "region" && d.currentValue ? (await nc(r?.kv, s.scriptName, d.currentValue), is(s.scriptName, s.requestHost, d.currentValue, c, {
      configured: !l,
      regionError: l
    })) : Vn({
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
      error: l ? Xa(l, "read") : ""
    });
  } catch (o) {
    if (tn(o) || lf(o) || r?.softFail !== !0) throw o;
    return Vn({
      configured: !1,
      scriptName: t,
      requestHost: a,
      selectedMode: "",
      currentMode: "default",
      currentValue: "__default__",
      error: Xa(o, "read")
    });
  }
}
async function oc(n, e, r, t = []) {
  const a = await qa(n, e, r), o = gn(a?.placement), s = ha(o, t);
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
    await Wr(n, e, r, d.patch);
    const u = await qa(n, e, r), f = ha(u?.placement, t);
    if (f.currentMode === "default") return {
      settings: u,
      placementState: f,
      clearedBy: d.tag
    };
  }
  let i = !1, c = !1, l = "";
  if (o !== void 0) {
    i = !0;
    try {
      await Wr(n, e, r, { placement: o }), c = !0;
    } catch (d) {
      c = !1, l = ie(d);
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
  const { kernel: r } = n, { CacheManager: t, buildAdminShellState: a, buildAdminUiContract: o, withAdminShellRuntimeStatus: s } = n;
  return {
    async getDashboardSnapshot(i, { env: c, ctx: l, kv: d, db: u }) {
      const f = await de(c);
      return J(await r.getDashboardSnapshotPayload(c, {
        ctx: l,
        kv: d,
        db: u,
        config: f,
        forceRefresh: i?.forceRefresh === !0
      }));
    },
    async getDashboardStats(i, { env: c, ctx: l, kv: d, db: u }) {
      const f = await de(c), m = await r.getDashboardSnapshotPayload(c, {
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
      const d = await de(c);
      return J(await r.getDashboardMonthlyTrafficPayload(c, {
        ctx: l,
        config: d,
        forceRefresh: i?.forceRefresh === !0
      }));
    },
    async getRuntimeStatus(i, { env: c, db: l }) {
      const d = await de(c), u = await r.getRuntimeStatusPayload(c, {
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
        const f = await de(c), m = He(c), [p, g, h, y] = await Promise.all([
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
          adminPath: et(c),
          loginPath: _o(c),
          initHealth: m,
          config: ct(f),
          hostDomain: $e(c),
          legacyHost: Hr(c),
          contract: o(),
          nodes: p,
          configSnapshots: g,
          shell: a(c, m, f),
          runtimeStatus: y?.status && typeof y.status == "object" ? y.status : s({}, c, f, m),
          revisions: S,
          generatedAt: (/* @__PURE__ */ new Date()).toISOString()
        });
      } catch (f) {
        throw At(f, "ADMIN_BOOTSTRAP_READ_FAILED", "管理台启动数据加载失败：KV 读取异常", "admin.read.bootstrap");
      }
    },
    async getSettingsBootstrap(i, { env: c, ctx: l, kv: d, db: u }) {
      let f;
      try {
        f = await de(c);
      } catch (S) {
        throw At(S, "SETTINGS_BOOTSTRAP_READ_FAILED", "设置页加载失败：KV 读取异常", "admin.read.settings_bootstrap");
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
        config: ct(f),
        hostDomain: $e(c),
        legacyHost: Hr(c),
        contract: o(),
        nodes: m,
        configSnapshots: p,
        runtimeStatus: s(h, c, f, He(c)),
        revisions: y,
        generatedAt: (/* @__PURE__ */ new Date()).toISOString()
      });
    },
    async getWorkerPlacementStatus(i, { env: c, request: l, kv: d }) {
      try {
        return J(await cs(await de(c), l, {
          softFail: !0,
          kv: d
        }));
      } catch (u) {
        throw At(u, "WORKER_PLACEMENT_READ_FAILED", "Worker 放置状态读取失败：KV 读取异常", "admin.read.worker_placement");
      }
    },
    async saveWorkerPlacement(i, { env: c, request: l, kv: d }) {
      let u;
      try {
        u = await de(c);
      } catch (m) {
        throw At(m, "WORKER_PLACEMENT_SAVE_FAILED", "Worker 放置保存失败：KV 读取异常", "admin.write.worker_placement");
      }
      const f = String(i?.mode || "").trim().toLowerCase();
      if (f !== "default" && f !== "smart" && f !== "region") return B("WORKER_PLACEMENT_MODE_INVALID", "请选择有效的 Worker 放置模式");
      try {
        const m = No(u), p = await Do({
          ...m,
          request: l
        }), g = await ac(d, p.scriptName), h = await tc(m.cfAccountId, m.cfApiToken), y = gn((await qa(m.cfAccountId, p.scriptName, m.cfApiToken))?.placement), S = ha(y, h);
        if (f === "region") {
          const _ = String(i?.region || "").trim(), A = h.find((b) => String(b?.value || "").trim() === _);
          if (!A) return B("WORKER_PLACEMENT_REGION_INVALID", "所选 Placement 区域已失效，请刷新后重试");
          await Wr(m.cfAccountId, p.scriptName, m.cfApiToken, { placement: { region: A.value } });
          try {
            await nc(d, p.scriptName, A.value);
          } catch (b) {
            const R = await Dn(m.cfAccountId, p.scriptName, m.cfApiToken, {
              previousOverride: g,
              originalPlacement: y,
              originalState: S,
              regionOptions: h
            });
            throw kt(b?.code || "WORKER_PLACEMENT_REGION_OVERRIDE_WRITE_FAILED", String(b?.message || "Worker 放置 Region 持久化失败：KV 写入异常"), {
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
          if (await Wr(m.cfAccountId, p.scriptName, m.cfApiToken, { placement: { mode: "smart" } }), g) try {
            await ss(d, p.scriptName);
          } catch (_) {
            const A = await Dn(m.cfAccountId, p.scriptName, m.cfApiToken, {
              previousOverride: g,
              originalPlacement: y,
              originalState: S,
              regionOptions: h
            });
            throw kt(_?.code || "WORKER_PLACEMENT_REGION_OVERRIDE_DELETE_FAILED", String(_?.message || "Worker 放置 Region 清理失败：KV 删除异常"), {
              ...F(_?.details) ? _.details : {},
              requestedMode: f,
              dependency: "KV",
              rollbackAttempted: A.rollbackAttempted,
              rollbackSucceeded: A.rollbackSucceeded,
              rollbackError: A.rollbackError
            });
          }
        } else if (await oc(m.cfAccountId, p.scriptName, m.cfApiToken, h), g) try {
          await ss(d, p.scriptName);
        } catch (_) {
          const A = await Dn(m.cfAccountId, p.scriptName, m.cfApiToken, {
            previousOverride: g,
            originalPlacement: y,
            originalState: S,
            regionOptions: h
          });
          throw kt(_?.code || "WORKER_PLACEMENT_REGION_OVERRIDE_DELETE_FAILED", String(_?.message || "Worker 放置 Region 清理失败：KV 删除异常"), {
            ...F(_?.details) ? _.details : {},
            requestedMode: f,
            dependency: "KV",
            rollbackAttempted: A.rollbackAttempted,
            rollbackSucceeded: A.rollbackSucceeded,
            rollbackError: A.rollbackError
          });
        }
        return J(await cs(u, l, {
          softFail: !1,
          kv: d
        }));
      } catch (m) {
        return B("WORKER_PLACEMENT_SAVE_FAILED", Xa(m, f === "default" ? "default" : "write"), De(m?.status, f === "default" ? 409 : 400), F(m?.details) ? m.details : null);
      }
    }
  };
}
var sc = 600 * 1e3, ff = sc;
function ft(n = "", e = "manual") {
  const r = String(e || "manual").trim().toLowerCase() === "scheduled" ? "scheduled" : "manual", t = String(n || "").trim().toLowerCase();
  return r !== "manual" ? "smart" : t === "full" ? "full" : "smart";
}
function mf(n = "", e = "manual") {
  return ft(n, e) === "full";
}
function Mo(n = "worker.js") {
  const e = String(n || "").trim().split(/[\\/]+/).pop() || "";
  return e && /\.js$/i.test(e) ? e : "";
}
function ic(n = "") {
  const e = String(n || "");
  return e && (/(^|\n)\s*export\s+/m.test(e) || /(^|\n)\s*import\s+(?:[\w*{]|["'])/m.test(e)) ? "module" : "service-worker";
}
function pf(n = "", e = "worker.js") {
  const r = Mo(e);
  if (r.toLowerCase() !== "worker.js") throw Te("WORKER_UPLOAD_FILE_NAME_INVALID", "Worker 文件名必须是 worker.js", 400, { fileName: r || String(e || "").trim() });
  const t = String(n || ""), a = new TextEncoder().encode(t).length;
  if (!t.trim()) throw Te("WORKER_UPLOAD_EMPTY", "worker.js 不能为空", 400);
  if (a > 3145728) throw Te("WORKER_UPLOAD_TOO_LARGE", `worker.js 体积超过限制（${a} bytes）`, 400, {
    contentLength: a,
    maxBytes: _f
  });
  return {
    fileName: r,
    scriptContent: t,
    contentLength: a,
    syntax: ic(t)
  };
}
function gf(n = "", e = "module") {
  const r = Mo(n) || "worker.js";
  return e === "module" ? { main_module: r } : { body_part: r };
}
function hf(n = "module") {
  return n === "module" ? "application/javascript+module" : "application/javascript";
}
function cc() {
  return [{
    scope: "账号",
    permission: "Workers Scripts Write",
    alternative: "",
    note: "这是账号级 Worker 脚本编辑权限，用于上传 .js 文件并仅更新脚本代码，不修改 bindings 或 settings"
  }];
}
function lc(n = "更新") {
  const e = Zi(cc());
  return e.length > 0 ? `Cloudflare Worker 脚本${n}失败：API Token 权限不足。至少需要：${e.join("；")}` : `Cloudflare Worker 脚本${n}失败：API Token 权限不足`;
}
function yf(n = "WORKER_SCRIPT_UPDATE_FORBIDDEN", e = "更新") {
  return Te(n, lc(e), 403, { requiredPermissions: cc() });
}
async function Sf(n, e, r, t, a = {}) {
  const o = String(n || "").trim(), s = Wt(e), i = String(r || "").trim(), c = Mo(a?.fileName) || "worker.js", l = String(t || ""), d = ic(l), u = new FormData();
  u.append("metadata", new Blob([JSON.stringify(gf(c, d))], { type: "application/json" }), "metadata.json"), u.append("files", new Blob([l], { type: hf(d) }), c);
  let f = null;
  try {
    f = await be(`https://api.cloudflare.com/client/v4/accounts/${encodeURIComponent(o)}/workers/scripts/${encodeURIComponent(s)}/content`, i, {
      method: "PUT",
      body: u
    });
  } catch (m) {
    throw Number(m?.status) === 403 ? yf("WORKER_SCRIPT_UPDATE_FORBIDDEN", "更新") : m;
  }
  return {
    syntax: d,
    fileName: c,
    result: F(f?.result) ? f.result : {}
  };
}
function ls(n) {
  const e = String(n?.message || n || "").trim() || "Worker 脚本更新失败", r = Number(n?.status) || Number(/cf_api_http_(\d+)/i.exec(e)?.[1] || 0), t = String(n?.code || "").trim().toUpperCase();
  return t === "WORKER_SCRIPT_UPDATE_FORBIDDEN" && String(n?.message || "").trim() ? n.message : t === "WORKER_PLACEMENT_SCRIPT_DISCOVERY_FORBIDDEN" ? String(n?.message || "").replace("Cloudflare Worker 放置读取失败", "Cloudflare Worker 脚本定位失败").trim() : t === "WORKER_PLACEMENT_SCRIPT_UNRESOLVED" || t === "WORKER_PLACEMENT_HOST_INVALID" || t === "WORKER_PLACEMENT_CONFIG_REQUIRED" ? e : r === 401 ? "Cloudflare Worker 和 HTML 更新失败：API Token 无效" : r === 403 ? lc("更新") : r === 404 ? "Cloudflare Worker 和 HTML 更新失败：未找到目标 Worker 脚本" : e;
}
var _f = 3 * 1024 * 1024;
function bf(n = {}, e = {}) {
  const { kernel: r } = n, { buildAdminLocalIndexUploadRecord: t } = n;
  return {
    async loadConfig(a, { env: o, kv: s, db: i, ctx: c }) {
      try {
        const l = await de(o), d = await r.getAdminRevisionsForRead({
          env: o,
          kv: s,
          db: i
        }, {
          ctx: c,
          config: l
        });
        return J({
          config: ct(l),
          revisions: d
        });
      } catch (l) {
        throw At(l, "CONFIG_READ_FAILED", "设置读取失败：KV 读取异常", "admin.read.config");
      }
    },
    async previewConfig(a, { env: o, kv: s, ctx: i }) {
      const c = a?.config && typeof a.config == "object" && !Array.isArray(a.config) ? a.config : {};
      if (!s) return B("KV_NOT_CONFIGURED", "请先绑定 ENI_KV / KV Namespace", 503);
      const l = await de(o), d = await r.prepareRuntimeConfigPersistence(Tn(c, l), {
        env: o,
        kv: s,
        ctx: i
      });
      return J({
        config: ct(d.nextConfig),
        hostPrefixDnsSyncCount: d.dnsPlans.length
      });
    },
    async previewTidyData(a, { env: o, kv: s, db: i }) {
      const c = String(a?.scope || "kv").trim().toLowerCase() === "d1" ? "d1" : "kv";
      try {
        if (c === "d1") {
          if (!i) return B("D1_NOT_CONFIGURED", "请先绑定 D1 / PROXY_LOGS 数据库");
          const u = await r.buildD1TidyPlan(o, {
            db: i,
            kv: s,
            maintenanceMode: ft(a?.maintenanceMode, "manual")
          }), f = u.schemaStatus?.schemaReady !== !0, m = f ? "" : await r.createD1TidyPlanToken(o, u);
          return J({
            success: !0,
            scope: "d1",
            planHash: f ? "" : u.planHash,
            planToken: m,
            planExpiresAt: m ? new Date(K() + ff).toISOString() : "",
            requiresSchemaInitialization: f,
            summary: u.summary,
            ...u.preview
          });
        }
        if (!s) return B("KV_NOT_CONFIGURED", "请先绑定 ENI_KV / KV Namespace");
        const l = await r.buildKvTidyPlan(o, {
          kv: s,
          db: i
        }), d = await r.createKvTidyPlanToken(o, l);
        return J({
          success: !0,
          scope: "kv",
          planHash: l.planHash,
          planToken: d,
          planExpiresAt: new Date(K() + sc).toISOString(),
          summary: l.summary,
          ...l.preview
        });
      } catch (l) {
        const d = l?.message || String(l);
        return B(String(l?.code || "TIDY_PREVIEW_FAILED"), d, De(l?.status, 500), {
          scope: c,
          ...F(l?.details) ? l.details : {}
        });
      }
    },
    async updateWorkerAndAdminIndex(a, { env: o, request: s, kv: i, ctx: c }) {
      if (!i) return B("KV_NOT_CONFIGURED", "请先绑定 ENI_KV / KV Namespace", 503);
      let l;
      try {
        l = await de(o);
      } catch (_) {
        throw At(_, "WORKER_HTML_UPDATE_FAILED", "Worker 和 HTML 更新失败：KV 读取异常", "admin.write.worker_html");
      }
      const d = typeof a?.workerScriptContent == "string" ? a.workerScriptContent : "", u = typeof a?.indexHtml == "string" ? a.indexHtml : "";
      if (!d.trim() || !u.trim()) return B("WORKER_HTML_FILES_REQUIRED", "必须同时上传 worker.js 和 index.html，缺一不可", 400, {
        workerFileProvided: !!d.trim(),
        indexFileProvided: !!u.trim()
      });
      let f, m;
      try {
        f = pf(d, a?.workerFileName);
        const _ = String(a?.indexFileName || "").trim().split(/[\\/]+/).pop() || "";
        if (_.toLowerCase() !== "index.html") return B("ADMIN_INDEX_UPLOAD_FILE_NAME_INVALID", "HTML 文件名必须是 index.html", 400, { fileName: _ || String(a?.indexFileName || "").trim() });
        m = await t(u, _);
      } catch (_) {
        return B(String(_?.code || "WORKER_HTML_VALIDATION_FAILED"), ie(_, "Worker 或 HTML 文件校验失败"), De(_?.status, 400), F(_?.details) ? _.details : null);
      }
      let p, g;
      try {
        p = No(l), g = await Do({
          ...p,
          request: s
        });
      } catch (_) {
        return B(String(_?.code || "WORKER_SCRIPT_CONTEXT_FAILED"), ls(_), De(_?.status, 400), F(_?.details) ? _.details : null);
      }
      let h;
      try {
        h = await r.persistAdminIndexUpload(m, {
          env: o,
          kv: i,
          ctx: c
        });
      } catch (_) {
        return B(String(_?.code || "ADMIN_INDEX_UPLOAD_FAILED"), ie(_, "index.html 激活失败"), De(_?.status, 500), F(_?.details) ? _.details : null);
      }
      let y;
      try {
        y = await Sf(p.cfAccountId, g.scriptName, p.cfApiToken, f.scriptContent, { fileName: f.fileName });
      } catch (_) {
        let A = !1, b = !1, R = "", E = "";
        try {
          const w = await r.rollbackAdminIndexUploadActivation(h.previousConfig, h.config, {
            env: o,
            kv: i,
            ctx: c
          });
          A = !0, b = w.skipped === !0, R = String(w.reason || "").trim();
        } catch (w) {
          E = ie(w, "rollback_failed");
        }
        return B(String(_?.code || "WORKER_HTML_UPDATE_FAILED"), ls(_), De(_?.status, 400), {
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
        config: ct(h.config),
        revisions: await r.getAdminRevisions(o, {
          ctx: c,
          config: h.config
        })
      });
    },
    async saveConfig(a, { env: o, ctx: s, kv: i, meta: c }) {
      if (!i) return B("KV_NOT_CONFIGURED", "请先绑定 ENI_KV / KV Namespace", 503);
      const l = await de(o);
      bu(a?.expectedConfigRevision, l);
      const d = a.config ? await r.persistRuntimeConfig(Tn(a.config, l), {
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
        config: ct(d),
        revisions: await r.getAdminRevisions(o, {
          ctx: s,
          config: d
        })
      });
    },
    async uploadAdminIndex(a, { env: o, ctx: s, kv: i }) {
      if (!i) return B("KV_NOT_CONFIGURED", "请先绑定 ENI_KV / KV Namespace", 503);
      try {
        const c = String(a?.fileName || "").trim().split(/[\\/]+/).pop() || "";
        if (c.toLowerCase() !== "index.html") return B("ADMIN_INDEX_UPLOAD_FILE_NAME_INVALID", "HTML 文件名必须是 index.html", 400, { fileName: c || String(a?.fileName || "").trim() });
        const l = await t(a?.indexHtml, c), d = await r.persistAdminIndexUpload(l, {
          env: o,
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
          config: ct(d.config),
          revisions: await r.getAdminRevisions(o, {
            ctx: s,
            config: d.config
          })
        });
      } catch (c) {
        return B(String(c?.code || "ADMIN_INDEX_UPLOAD_FAILED"), ie(c, "本地 index.html 上传失败"), De(c?.status, 500), F(c?.details) ? c.details : null);
      }
    },
    async exportConfig(a, { env: o, ctx: s, request: i }) {
      const c = r.getKV(o), l = a?.includeSecrets === !0;
      if (l && String(i.headers.get("X-Admin-Confirm") || "").trim() !== "exportConfig") return B("CONFIRMATION_REQUIRED", "Exporting secrets requires explicit confirmation", 428);
      const d = await de(o), u = ut(o, d), f = c && u.localUploadRevision ? await r.getAdminIndexUploadRecord(c, u.localUploadRevision) : null, m = c ? (await r.loadAllNodeEntitiesFromKvStrict(c, { ctx: s })).filter(Boolean) : [], p = {
        version: O.Defaults.Version,
        exportTime: (/* @__PURE__ */ new Date()).toISOString(),
        nodes: m,
        config: l ? d : Br(d),
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
        maxBytes: cd,
        nodeCount: p.nodes.length,
        adminIndexBytes: Number(f?.bytes) || 0
      }) : J(p);
    },
    async exportSettings(a, { env: o, request: s }) {
      const i = a?.includeSecrets === !0;
      if (i && String(s.headers.get("X-Admin-Confirm") || "").trim() !== "exportSettings") return B("CONFIRMATION_REQUIRED", "导出完整密钥需要显式确认", 428);
      const c = await de(o);
      return J({
        version: O.Defaults.Version,
        type: "settings-only",
        exportTime: (/* @__PURE__ */ new Date()).toISOString(),
        config: i ? c : Br(c),
        secretsRedacted: i !== !0,
        containsSecrets: i === !0
      });
    },
    async importSettings(a, { env: o, ctx: s, kv: i, meta: c }) {
      if (!i) return B("KV_NOT_CONFIGURED", "请先绑定 ENI_KV / KV Namespace", 503);
      const l = a?.config && typeof a.config == "object" && !Array.isArray(a.config) ? a.config : a?.settings && typeof a.settings == "object" && !Array.isArray(a.settings) ? a.settings : null;
      if (!l) return B("INVALID_SETTINGS_BACKUP", "设置备份文件无效，缺少 config/settings 对象");
      const d = await de(o), u = await r.persistRuntimeConfig(Tn(l, d), {
        env: o,
        kv: i,
        ctx: s,
        snapshotMeta: {
          reason: "import_settings",
          section: String(c?.section || "settings"),
          source: String(c?.source || "settings_backup"),
          actor: "admin"
        }
      }), [f, m] = await Promise.all([r.getConfigSnapshotsForRead(i), r.getAdminRevisions(o, {
        ctx: s,
        config: u
      })]);
      return J({
        success: !0,
        config: ct(u),
        configSnapshots: f,
        revisions: m,
        generatedAt: (/* @__PURE__ */ new Date()).toISOString()
      });
    },
    async getConfigSnapshots(a, { env: o, kv: s, db: i, ctx: c }) {
      const l = await r.getConfigSnapshotsForRead(s), d = await r.readStoredConfigSnapshotsStrict(s);
      return J({
        snapshots: l,
        revisions: await r.getAdminRevisionsForRead({
          env: o,
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
function Rf(n = {}, e = {}) {
  const { kernel: r } = n, { CacheManager: t, Logger: a } = n;
  return {
    async clearConfigSnapshots(o, { kv: s }) {
      const i = r.CONFIG_SNAPSHOTS_KEY, c = r.CONFIG_SNAPSHOTS_META_KEY;
      try {
        await r.clearConfigSnapshots(s);
      } catch (l) {
        const d = Ko("CONFIG_SNAPSHOTS_CLEAR_FAILED", "设置快照清理失败：KV 写入异常", {
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
        const d = Ko("CONFIG_SNAPSHOTS_REVISIONS_REFRESH_FAILED", "设置快照已清理，但版本信息刷新失败", {
          ...tn(l) && F(l?.details) ? l.details : {},
          phase: "refresh_revisions",
          clearApplied: !0,
          reason: ie(l)
        });
        throw Ne("admin.write.config_snapshots.revisions_refresh_failed", d, d.details), d;
      }
    },
    async restoreConfigSnapshot(o, { env: s, ctx: i, kv: c }) {
      const l = String(o?.id || "").trim();
      if (!l) return B("SNAPSHOT_ID_REQUIRED", "请提供要恢复的快照 ID");
      const d = await r.getConfigSnapshotById(c, l);
      if (!d) return B("SNAPSHOT_NOT_FOUND", "指定的配置快照不存在", 404);
      const u = await de(s), f = _u(d.config || {}, u), m = qe(f.indexUrl || ""), p = m ? await r.getAdminIndexUploadRecord(c, m) : null;
      if (m && !p) return B("SNAPSHOT_ADMIN_INDEX_MISSING", "配置快照引用的 index.html 已不存在", 409, { revision: m });
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
        config: ct(h),
        restoredSnapshotId: l,
        revisions: await r.getAdminRevisions(s, {
          ctx: i,
          config: h
        })
      });
    },
    async list(o, { env: s, ctx: i, kv: c, db: l }) {
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
        throw At(d, "NODE_LIST_READ_FAILED", "节点列表读取失败：KV 读取异常", "admin.read.nodes");
      }
    },
    async getDashboardD1WriteHotspot(o, { env: s, ctx: i }) {
      const c = await de(s);
      return J(await r.buildDashboardD1WriteHotspotPayload(s, {
        config: c,
        nowMs: K()
      }));
    },
    async getDashboardCoreStats(o, { env: s, ctx: i, kv: c, db: l }) {
      const d = await de(s);
      return J(await r.buildDashboardStatsPayload(s, {
        ctx: i,
        kv: c,
        db: l,
        config: d,
        skipD1WriteHotspot: !0
      }));
    },
    async getDashboardCachedSnapshot(o, { env: s, db: i }) {
      const c = await de(s);
      return J({ snapshot: await r.getDashboardCachedSnapshotPayload(s, {
        db: i,
        config: c
      }) });
    },
    async getNode(o, { env: s, ctx: i, kv: c, db: l }) {
      const d = String(o?.name || "").trim();
      if (!d) return B("NODE_NAME_REQUIRED", "请提供节点路径");
      const u = await r.getNodeForRead(d, s);
      return u ? J({
        success: !0,
        node: {
          name: d.toLowerCase(),
          ...u
        },
        revisions: await r.getAdminRevisionsForRead({
          env: s,
          kv: c,
          db: l
        }, { ctx: i })
      }) : B("NODE_NOT_FOUND", "节点不存在", 404);
    }
  };
}
function Gn(n = [], e = {}) {
  const r = e.renameMap instanceof Map ? e.renameMap : new Map(Object.entries(e.renameMap && typeof e.renameMap == "object" ? e.renameMap : {})), t = /* @__PURE__ */ new Map();
  for (const [l, d] of r.entries()) {
    const u = String(l || "").trim().toLowerCase(), f = String(d || "").trim();
    !u || !f || t.set(u, f);
  }
  const a = new Set(mt(e.removedNames || []).map((l) => String(l || "").trim().toLowerCase()).filter(Boolean)), o = e.allowedNames === void 0 ? null : mt(e.allowedNames || []).map((l) => [String(l || "").trim().toLowerCase(), String(l || "").trim()]).filter(([l, d]) => l && d), s = o ? new Map(o) : null, i = [], c = /* @__PURE__ */ new Set();
  for (const l of mt(n)) {
    const d = String(l || "").trim().toLowerCase();
    if (!d || a.has(d)) continue;
    const u = t.get(d) || String(l || "").trim(), f = u.toLowerCase();
    !f || a.has(f) || s && !s.has(f) || c.has(f) || (c.add(f), i.push(s?.get(f) || u));
  }
  return i;
}
function Ef(n, e = null, r = "") {
  const t = String(n?.proxyMode || n?.mode || "").trim().toLowerCase();
  if ([
    "direct",
    "source-direct",
    "origin-direct",
    "node-direct"
  ].includes(t) || n?.direct === !0 || n?.sourceDirect === !0 || n?.directSource === !0 || n?.direct2xx === !0) return !0;
  const a = `${Fr(n?.tags, n?.tag).join(" ")} ${n?.remark || ""}`;
  return /(?:^|[\s\[(【])(?:直连|source-direct|origin-direct|node-direct)(?:$|[\s\])】])/i.test(a);
}
function Af(n, e = null, r = "") {
  const t = vr(n);
  return t === "direct" ? !0 : t === "proxy" ? !1 : Ef(n, e, r);
}
function ya(n, e) {
  if (!n) return null;
  try {
    return new URL(n, e instanceof URL ? e : String(e || ""));
  } catch {
    return null;
  }
}
function Cf(n, e = "GET") {
  const r = String(e || "GET").toUpperCase();
  return n === 303 && r !== "GET" && r !== "HEAD" || (n === 301 || n === 302) && r === "POST" ? "GET" : r;
}
function Tf(n = {}, e = {}) {
  const r = hi(ia(n, "protocolStrategy") ? n?.protocolStrategy : Ro(n)), t = Number.isFinite(Number(e.hourUtc8)) ? Number(e.hourUtc8) : ((/* @__PURE__ */ new Date()).getUTCHours() + 8) % 24, a = t >= 20 && t < 24;
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
function wf(n = {}, e = {}) {
  const { kernel: r } = n, { CacheManager: t, buildAdminLocalIndexUploadRecord: a } = n;
  return {
    async saveOrImport(o, { action: s, ctx: i, kv: c, env: l }) {
      const d = s === "save" ? [o] : o.nodes, u = Vo(d, l);
      if (u) return B("NODE_NAME_RESERVED", "节点路径与系统保留路由冲突，请更换后重试", 409, u);
      const f = Go(d, l);
      return f ? B(f.code, f.message, 400, f) : await Xt(c)(async () => {
        const m = [], p = /* @__PURE__ */ new Map(), g = [], h = $e(l), y = await de(l);
        for (const b of d) {
          if (!b.name || !b.target && !(Array.isArray(b.lines) && b.lines.length)) continue;
          const R = String(b.name).toLowerCase(), E = b.originalName ? String(b.originalName).toLowerCase() : null, w = !!(E && E !== R);
          if (s === "save" && (!E || E !== R) && await c.get(`${r.PREFIX}${R}`, { type: "json" }))
            return B("NODE_NAME_CONFLICT", "节点路径已存在，请更换后重试", 409, { name: R });
          let D = {};
          w ? D = await c.get(`${r.PREFIX}${E}`, { type: "json" }) || {} : D = await c.get(`${r.PREFIX}${R}`, { type: "json" }) || {};
          const C = r.buildPreparedNodeMutation(b, D, {
            previousName: E || R,
            nextName: R
          });
          C && (C.dnsPlan = r.buildHostPrefixDnsSyncPlan(C.previousName, C.previousNode, C.nextName, C.nextNode, h, {
            config: y,
            forceUpsert: !0
          }), g.push(C), C.isRename && p.set(C.previousName, C.nextName), m.push(R));
        }
        if (s === "save" && m.length === 0) return B("INVALID_TARGET", "目标源站必须是有效的 http/https URL");
        Cn(g, y, l);
        const S = m.length > 0 || p.size > 0;
        let _ = !1, A = null;
        try {
          await r.applyPreparedNodeMutations(g, {
            env: l,
            kv: c,
            ctx: i,
            requestHost: h
          }), _ = g.some((C) => C?.nodeChanged === !0);
          const b = S ? await r.rebuildNodeIndexesFromKv(c, {
            ctx: i,
            syncLegacyIndex: s === "import"
          }) : null, R = Array.isArray(b?.summaries) ? b.summaries : await t.getNodesList(l, i), E = new Map((Array.isArray(R) ? R : []).map((C) => [String(C?.name || "").toLowerCase().trim(), C])), w = m.map((C) => E.get(String(C || "").toLowerCase().trim()) || null).filter(Boolean), D = Array.isArray(b?.index) ? b.index : Array.isArray(R) ? R.map((C) => C?.name) : [];
          if ((p.size > 0 || s === "save" && w.length === 1) && (A = await r.captureRuntimeConfigRollbackState(l, c), p.size > 0 && await r.commitSourceDirectNodesConfigWithinMutation(l, c, i, {
            renameMap: p,
            allowedNames: D,
            source: s === "import" ? "node_import" : "node_save",
            note: [...p.entries()].map(([C, T]) => `${C}->${T}`).join(",")
          }), s === "save" && w.length === 1)) {
            const C = w[0];
            await r.commitSingleNodeMainVideoStreamShortcutShadowWithinMutation(l, c, i, {
              originalName: o.originalName,
              nodeName: C?.name,
              mode: C?.mainVideoStreamMode,
              source: "node_save",
              note: String(C?.name || "").trim()
            });
          }
          return J({
            success: !0,
            node: s === "save" ? w[0] : void 0,
            nodes: R,
            importedNodes: s === "import" ? w : void 0,
            revisions: await r.getAdminRevisions(l, {
              ctx: i,
              nodes: R
            })
          });
        } catch (b) {
          let R = "", E = "";
          if (A) try {
            await r.restoreCapturedRuntimeConfigState(A, {
              env: l,
              kv: c,
              ctx: i
            });
          } catch (w) {
            R = ie(w, "config_restore_failed");
          }
          if (_) try {
            await r.rollbackPreparedNodeMutations(g, {
              env: l,
              kv: c,
              ctx: i,
              requestHost: h,
              rebuildIndexes: !0
            });
          } catch (w) {
            E = ie(w, "rollback_failed");
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
      return c ? await Xt(c)(async () => {
        const l = await r.loadAllNodeEntitiesFromKvStrict(c, { ctx: i }), d = Array.isArray(l) ? l.map((R) => R?.name) : [], u = Gn(o?.selectedNodeNames || [], { allowedNames: d }), f = new Set(u.map((R) => String(R || "").trim().toLowerCase()).filter(Boolean));
        let m = 0;
        const p = $e(s), g = await de(s), h = [];
        for (const R of Array.isArray(l) ? l : []) {
          if (!F(R)) continue;
          const E = String(R.name || "").trim().toLowerCase();
          if (!E) continue;
          const w = vr(R);
          let D = w;
          if (f.has(E) ? D = "direct" : w === "direct" && (D = "inherit"), D !== w) {
            const { name: C, ...T } = R, I = {
              name: E,
              ...T,
              mainVideoStreamMode: D
            }, x = r.buildPreparedNodeMutation(I, R, {
              previousName: E,
              nextName: E
            });
            if (!x) continue;
            x.nextNode = r.normalizeNode(E, x.nextNode || I, { dropLegacyDirectRouting: !0 }).data, x.dnsPlan = r.buildHostPrefixDnsSyncPlan(x.previousName, x.previousNode, x.nextName, x.nextNode, p, {
              config: g,
              forceUpsert: !0
            }), h.push(x), m += 1;
          }
        }
        Cn(h, g, s);
        const y = se(g.sourceDirectNodes || []) !== se(u), S = m > 0 || y ? await r.captureRuntimeConfigRollbackState(s, c) : null;
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
        } catch (R) {
          let E = "", w = "";
          if (S) try {
            await r.restoreCapturedRuntimeConfigState(S, {
              env: s,
              kv: c,
              ctx: i
            });
          } catch (D) {
            E = ie(D, "config_restore_failed");
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
            w = ie(D, "rollback_failed");
          }
          throw R && typeof R == "object" && (String(R.code || "").trim() || (R.code = "NODE_MUTATION_FAILED"), R.status = De(R.status, 500), R.details = {
            ...F(R.details) ? R.details : {},
            rollbackAttempted: !0,
            configRollbackError: E,
            nodeRollbackError: w
          }), R;
        }
        const b = Array.isArray(_?.summaries) ? _.summaries : await t.getNodesList(s, i);
        return J({
          success: !0,
          selectedNodeNames: u,
          updatedNodeCount: m,
          config: ct(A),
          nodes: b,
          revisions: await r.getAdminRevisions(s, {
            ctx: i,
            config: A,
            nodes: b
          })
        });
      }) : B("KV_UNAVAILABLE", "KV 未绑定或不可用", 500);
    },
    async importFull(o, { env: s, ctx: i, kv: c }) {
      const l = Vo(o?.nodes, s);
      if (l) return B("NODE_NAME_RESERVED", "节点路径与系统保留路由冲突，请更换后重试", 409, l);
      const d = Go(o?.nodes, s);
      if (d) return B(d.code, d.message, 400, d);
      const u = qe(o?.config?.indexUrl || "");
      let f = null;
      if (F(o?.adminIndexUpload)) {
        const m = String(o.adminIndexUpload.fileName || "").trim().split(/[\\/]+/).pop() || "";
        if (m.toLowerCase() !== "index.html") return B("ADMIN_INDEX_BACKUP_INVALID", "完整备份中的 HTML 文件名必须是 index.html", 400);
        try {
          f = await a(o.adminIndexUpload.html, m);
        } catch (p) {
          return B(String(p?.code || "ADMIN_INDEX_BACKUP_INVALID"), ie(p, "完整备份中的 index.html 无效"), De(p?.status, 400), F(p?.details) ? p.details : null);
        }
        if (u && f.revision !== u) return B("ADMIN_INDEX_BACKUP_REVISION_MISMATCH", "完整备份中的 index.html 与配置版本不一致", 400, {
          expectedRevision: u,
          actualRevision: f.revision
        });
      }
      return u && !f && !await r.getAdminIndexUploadRecord(c, u) ? B("ADMIN_INDEX_BACKUP_MISSING", "完整备份缺少当前配置引用的 index.html", 400, { revision: u }) : await Xt(c)(async () => {
        const m = await de(s), p = o.config ? await r.captureRuntimeConfigRollbackState(s, c) : null, g = o.config ? ki(o.config, m) : null, h = g ? te(g) : m, y = $e(s), S = f ? r.buildAdminIndexUploadKey(f.revision) : "", _ = S ? await c.get(S) : null, A = o.config ? await c.get(r.ADMIN_ACTIVE_INDEX_KEY) : null, b = u ? f || await r.getAdminIndexUploadRecord(c, u) : null, R = [];
        if (Array.isArray(o.nodes)) for (const T of o.nodes) {
          if (!T.name || !T.target && !(Array.isArray(T.lines) && T.lines.length)) continue;
          const I = String(T.name).toLowerCase(), x = await c.get(`${r.PREFIX}${I}`, { type: "json" }) || {}, U = r.buildPreparedNodeMutation(T, x, {
            previousName: I,
            nextName: I
          });
          U && (U.dnsPlan = r.buildHostPrefixDnsSyncPlan(U.previousName, U.previousNode, U.nextName, U.nextNode, y, {
            previousConfig: m,
            nextConfig: h,
            forceUpsert: !0
          }), R.push(U));
        }
        Cn(R, h, s);
        let E = null, w = !1;
        try {
          S && await c.put(S, JSON.stringify(f)), g && (b ? await c.put(r.ADMIN_ACTIVE_INDEX_KEY, JSON.stringify(b)) : await c.delete(r.ADMIN_ACTIVE_INDEX_KEY)), g && (E = await r.commitRuntimeConfig(g, {
            env: s,
            kv: c,
            ctx: i,
            snapshotMeta: {
              reason: "import_full",
              section: "all",
              source: "full_backup",
              actor: "admin"
            }
          })), R.length > 0 && (await r.applyPreparedNodeMutations(R, {
            env: s,
            kv: c,
            ctx: i,
            requestHost: y
          }), w = !0, await r.rebuildNodeIndexesFromKv(c, {
            ctx: i,
            syncLegacyIndex: !0
          }));
        } catch (T) {
          let I = "", x = "", U = "";
          if (w) try {
            await r.rollbackPreparedNodeMutations(R, {
              env: s,
              kv: c,
              ctx: i,
              requestHost: y,
              rebuildIndexes: !0
            });
          } catch (k) {
            x = ie(k, "rollback_failed");
          }
          if (p) try {
            await r.restoreCapturedRuntimeConfigAndDnsState(p, {
              env: s,
              kv: c,
              ctx: i
            });
          } catch (k) {
            I = ie(k, "config_restore_failed");
          }
          if (S) try {
            _ === null ? await c.delete(S) : await c.put(S, _);
          } catch (k) {
            U = ie(k, "admin_index_restore_failed");
          }
          if (o.config) try {
            A === null ? await c.delete(r.ADMIN_ACTIVE_INDEX_KEY) : await c.put(r.ADMIN_ACTIVE_INDEX_KEY, A);
          } catch (k) {
            U = [U, ie(k, "active_admin_index_restore_failed")].filter(Boolean).join("; ");
          }
          throw T && typeof T == "object" && (String(T.code || "").trim() || (T.code = "IMPORT_FULL_FAILED"), T.status = De(T.status, 500), T.details = {
            ...F(T.details) ? T.details : {},
            rollbackAttempted: !!p || w || !!S,
            configRollbackError: I,
            nodeRollbackError: x,
            adminIndexRollbackError: U
          }), T;
        }
        const D = E || await Ae(s), C = await t.getNodesList(s, i);
        return J({
          success: !0,
          config: D,
          nodes: C,
          adminIndexUpload: f ? {
            revision: f.revision,
            fileName: f.fileName,
            bytes: f.bytes
          } : null,
          revisions: await r.getAdminRevisions(s, {
            ctx: i,
            config: D,
            nodes: C
          })
        });
      });
    },
    async delete(o, { ctx: s, kv: i, env: c }) {
      return await Xt(i)(async () => {
        if (o.name) {
          const l = String(o.name).toLowerCase(), d = await de(c), u = await i.get(`${r.PREFIX}${l}`, { type: "json" }) || null, f = u ? r.normalizeNode(l, u || {}).data : null, m = {
            previousName: l,
            previousNode: f,
            nextName: l,
            nextNode: null,
            isRename: !1,
            nodeChanged: !!f,
            isSemanticNoop: !f,
            dnsPlan: r.buildHostPrefixDnsSyncPlan(l, f, "", null, $e(c), { config: d })
          }, p = $e(c);
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
              ...F(y.details) ? y.details : {},
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
    async purgeCache(o, { kv: s, request: i }) {
      if (i.headers.get("X-Admin-Confirm") !== "purgeCache") return B("CONFIRMATION_REQUIRED", "敏感操作需要显式确认头", 428);
      const c = await s.get(r.CONFIG_KEY, { type: "json" }) || {};
      if (!c.cfZoneId || !c.cfApiToken) return B("CF_API_ERROR", "请在账号设置中完善 Zone ID 和 API 令牌");
      try {
        return (await Ke(`https://api.cloudflare.com/client/v4/zones/${encodeURIComponent(String(c.cfZoneId).trim())}/purge_cache`, {
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
function Df(n = {}, e = {}) {
  const { kernel: r } = n;
  return {
    async tidyKvData(t, { env: a, ctx: o, kv: s, db: i }) {
      if (!s) return B("KV_NOT_CONFIGURED", "请先绑定 ENI_KV / KV Namespace");
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
        } } }), "manual.tidy_kv.patch_success_status", null, null), J({
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
        } } }), "manual.tidy_kv.patch_failed_status", { message: l }, null), B(String(c?.code || "KV_TIDY_FAILED"), l, De(c?.status, 500), F(c?.details) ? c.details : null);
      }
    },
    async tidyD1Data(t, { env: a, ctx: o, kv: s, db: i }) {
      if (!i) return B("D1_NOT_CONFIGURED", "请先绑定 D1 / PROXY_LOGS 数据库");
      try {
        const c = ft(t?.maintenanceMode, "manual"), l = await r.tidyD1Data(a, {
          db: i,
          kv: s,
          ctx: o,
          maintenanceMode: c,
          planToken: String(t?.planToken || "").trim()
        }), d = (/* @__PURE__ */ new Date()).toISOString(), u = r.buildD1TidyStatusPayload(l.summary, {
          mode: "manual",
          maintenanceMode: c,
          triggeredBy: "manual",
          timestamp: d
        });
        return await he(r.patchOpsStatus({
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
          maintenanceMode: ft(t?.maintenanceMode, "manual")
        }, {
          mode: "manual",
          maintenanceMode: ft(t?.maintenanceMode, "manual"),
          triggeredBy: "manual",
          timestamp: (/* @__PURE__ */ new Date()).toISOString()
        });
        return await he(r.patchOpsStatus({
          kv: s,
          db: i
        }, { scheduled: { ...d } }), "manual.tidy_d1.patch_failed_status", { message: l }, null), B("D1_TIDY_FAILED", l, 500);
      }
    }
  };
}
function Nf(n = "") {
  return String(n || "").trim().toLowerCase() === "a" ? "a" : "cname";
}
function Kt(n = {}) {
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
async function Ir(n, e, r = {}) {
  const t = [];
  let a = 1, o = 1;
  const s = 100, i = ee(r?.nameExact || "");
  do {
    const c = new URL(`https://api.cloudflare.com/client/v4/zones/${encodeURIComponent(n)}/dns_records`);
    c.searchParams.set("page", String(a)), c.searchParams.set("per_page", String(s)), i && c.searchParams.set("name.exact", i);
    const l = await be(c.toString(), e);
    Array.isArray(l?.result) && t.push(...l.result.map((d) => Kt(d)).filter((d) => d.id && d.name)), o = Number(l?.result_info?.total_pages || l?.result_info?.totalPages || 1), a += 1;
  } while (a <= o && a <= 20);
  return t;
}
function sa(n = {}, e = {}) {
  const r = {
    type: String(e.type || n?.type || "A").trim().toUpperCase(),
    name: ee(e.host || n?.name),
    content: String(e.content || "").trim(),
    ttl: Number(n?.ttl) || 1,
    proxied: n?.proxied === !0
  };
  return typeof n?.comment == "string" && (r.comment = n.comment), Array.isArray(n?.tags) && (r.tags = n.tags.map((t) => String(t))), r;
}
function Lf(n = "", e = "") {
  const r = String(n || "").trim().toUpperCase(), t = String(e || "").trim();
  return t ? r === "A" ? t : t.toLowerCase() : "";
}
function Pr(n = "", e = "") {
  const r = String(n || "").trim().toUpperCase(), t = Lf(r, e);
  return !r || !t ? "" : `${r}|${t}`;
}
function Mf(n = []) {
  const e = [], r = /* @__PURE__ */ new Set();
  let t = 0;
  for (const a of Array.isArray(n) ? n : []) {
    const o = String(a?.type || "").trim().toUpperCase(), s = String(a?.content || "").trim(), i = Pr(o, s);
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
function ds(n = "", e = 0) {
  return {
    type: String(n || "").trim().toUpperCase(),
    desiredCount: Math.max(0, Number(e) || 0),
    identicalCount: 0,
    updatedCount: 0,
    createdCount: 0,
    deletedCount: 0
  };
}
function If(n = "a", e = {}, r = {}) {
  const t = {};
  let a = 0, o = 0, s = 0, i = 0, c = 0;
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
    }, a += t[d].desiredCount, o += t[d].identicalCount, s += t[d].updatedCount, i += t[d].createdCount, c += t[d].deletedCount);
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
async function Pf(n = {}, e) {
  const r = String(n?.cfZoneId || "").trim(), t = String(n?.cfApiToken || "").trim();
  if (!r || !t) throw new Error("cf_api_missing");
  const a = ee(new URL(e.url).hostname), o = await Ji(r, t, {
    scope: "dns.resolve_admin_context.zone_lookup",
    context: { requestHost: a }
  }), s = await Ir(r, t), i = String(o?.name || "").trim() || "", c = i || ee(s[0]?.name || "");
  let l = a;
  la(l, c || i) || (l = ee(await Yu({
    cfAccountId: n.cfAccountId,
    cfZoneId: r,
    cfApiToken: t,
    zoneNameFallback: c || i || a
  })));
  const d = s.filter((f) => ur(f.type)), u = l ? d.filter((f) => ee(f.name) === l) : d;
  return {
    cfZoneId: r,
    cfApiToken: t,
    zone: o,
    zoneName: i,
    currentHost: l,
    requestHost: a,
    totalRecords: s.length,
    editableRecords: d,
    currentHostRecords: u
  };
}
function xf(n = {}) {
  const e = te(n), r = String(e.cfZoneId || "").trim(), t = String(e.cfApiToken || "").trim();
  if (!r || !t) {
    const a = /* @__PURE__ */ new Error("请在账号设置中完善 Zone ID 和 API 令牌");
    throw a.code = "CF_API_ERROR", a.status = 400, a;
  }
  return {
    cfZoneId: r,
    cfApiToken: t
  };
}
function Of(n = []) {
  return {
    A: ds("A", n.filter((e) => e.type === "A").length),
    AAAA: ds("AAAA", n.filter((e) => e.type === "AAAA").length)
  };
}
function vf(n = "", e = [], r = []) {
  const t = /* @__PURE__ */ new Map(), a = [];
  let o = 0;
  for (const i of e) {
    const c = Pr(n, i?.content);
    c && t.set(c, (t.get(c) || 0) + 1);
  }
  for (const i of r) {
    const c = Pr(n, i?.content), l = t.get(c) || 0;
    if (l > 0) {
      o += 1, t.set(c, l - 1);
      continue;
    }
    a.push(i);
  }
  const s = [];
  for (const i of e) {
    const c = Pr(n, i?.content), l = t.get(c) || 0;
    l <= 0 || (s.push(i), t.set(c, l - 1));
  }
  return {
    identicalCount: o,
    reusableCurrentRecords: a,
    pendingDesiredRecords: s
  };
}
function dc(n = "", e = "", r = "", t = "", a = {}) {
  const o = async () => (await Ir(n, e, { nameExact: r })).filter((s) => ee(s.name) === r && ur(s.type));
  return {
    async deleteRecord(s) {
      s?.id && await be(`${t}/${encodeURIComponent(s.id)}`, e, { method: "DELETE" });
    },
    async updateRecord(s, i, c) {
      const l = sa(s, {
        host: r,
        type: i,
        content: c
      });
      return Kt((await be(`${t}/${encodeURIComponent(s.id)}`, e, {
        method: "PUT",
        body: JSON.stringify(l)
      }))?.result || {
        id: s.id,
        ...l
      });
    },
    async createRecord(s, i, c = a) {
      const l = sa(c, {
        host: r,
        type: s,
        content: i
      });
      try {
        return {
          record: Kt((await be(t, e, {
            method: "POST",
            body: JSON.stringify(l)
          }))?.result || l),
          reusedExisting: !1
        };
      } catch (d) {
        if (String(d?.message || d || "").includes("81058")) {
          const u = (await o()).find((f) => ee(f?.name) === r && String(f?.type || "").toUpperCase() === String(s || "").trim().toUpperCase() && Pr(f?.type, f?.content) === Pr(s, i));
          if (u) return {
            record: Kt(u),
            reusedExisting: !0
          };
        }
        throw d;
      }
    },
    async listCurrentHostRecords() {
      return await o();
    }
  };
}
async function us(n = "", e = [], r = [], t = {}, a = {}) {
  const o = vf(n, e, r);
  t.identicalCount += o.identicalCount;
  const { reusableCurrentRecords: s, pendingDesiredRecords: i } = o;
  for (let c = 0; c < i.length; c += 1) {
    const l = i[c], d = s[c];
    if (d) {
      await a.updateRecord(d, n, l.content), t.updatedCount += 1;
      continue;
    }
    (await a.createRecord(n, l.content, r[0]))?.reusedExisting === !0 ? t.identicalCount += 1 : t.createdCount += 1;
  }
  for (let c = i.length; c < s.length; c += 1)
    await a.deleteRecord(s[c]), t.deletedCount += 1;
}
async function Ff({ env: n, kv: e, dnsHistoryRepository: r, config: t, host: a, mode: o = "a", desiredRecords: s = [], requestHost: i = "", skipHistory: c = !1, includeAllRecords: l = !0, includeHistory: d = !0 }) {
  const { cfZoneId: u, cfApiToken: f } = xf(t || await Ae(n));
  let m = !1, p = !1, g = "";
  const h = Mf(s), y = h.records, S = Of(y);
  try {
    const _ = await wo(u, f, { scope: "dns.persist_records.zone_lookup" }), A = String(_?.name || "").trim() || "";
    if (A && !la(a, A)) {
      const P = /* @__PURE__ */ new Error("当前站点不在该 Zone 下");
      throw P.code = "INVALID_HOST", P.status = 400, P;
    }
    const b = (await Ir(u, f, { nameExact: a })).filter((P) => ee(P.name) === a && ur(P.type)), R = {
      baseRecord: b[0] || {
        name: a,
        ttl: 1,
        proxied: !1
      },
      zoneRecordsUrl: `https://api.cloudflare.com/client/v4/zones/${encodeURIComponent(u)}/dns_records`
    }, E = dc(u, f, a, R.zoneRecordsUrl, R.baseRecord), w = b.map((P) => Kt(P));
    let D = !1;
    const C = {
      ...E,
      async deleteRecord(P) {
        return D = !0, await E.deleteRecord(P);
      },
      async updateRecord(P, N, L) {
        return D = !0, await E.updateRecord(P, N, L);
      },
      async createRecord(P, N, L) {
        return D = !0, await E.createRecord(P, N, L);
      }
    };
    let T = [], I = null;
    try {
      if (o === "cname") {
        const P = b.filter(($) => $.type === "CNAME"), N = b.filter(($) => $.type === "A" || $.type === "AAAA");
        for (const $ of N) await C.deleteRecord($);
        for (let $ = 1; $ < P.length; $ += 1) await C.deleteRecord(P[$]);
        const L = P[0] || null, M = y[0], v = Number(M?.ttl) || 1, W = M?.proxied === !0;
        if (L) {
          const $ = String(L.content || "").trim() !== M.content, H = Number(L.ttl) !== v, j = L.proxied === !0 !== W;
          ($ || H || j) && await C.updateRecord({
            ...L,
            ttl: v,
            proxied: W
          }, "CNAME", M.content);
        } else await C.createRecord("CNAME", M.content, {
          ...R.baseRecord,
          ttl: v,
          proxied: W
        });
        T = await Ir(u, f, { nameExact: a }), c || (I = await r.recordDnsHostHistory(e, u, a, {
          name: a,
          type: "CNAME",
          content: M.content,
          actor: "admin",
          source: "ui",
          requestHost: i,
          savedAt: (/* @__PURE__ */ new Date()).toISOString()
        }));
      } else {
        const P = b.filter((N) => N.type === "CNAME");
        for (const N of P) await C.deleteRecord(N);
        await us("A", y.filter((N) => N.type === "A"), b.filter((N) => N.type === "A"), S.A, C), await us("AAAA", y.filter((N) => N.type === "AAAA"), b.filter((N) => N.type === "AAAA"), S.AAAA, C), T = await Ir(u, f, { nameExact: a });
      }
    } catch (P) {
      if (D) {
        m = !0;
        try {
          const N = await E.listCurrentHostRecords();
          for (const L of N) await E.deleteRecord(L);
          for (const L of w) await E.createRecord(L.type, L.content, L);
          p = !0;
        } catch (N) {
          p = !1, g = String(N?.message || N || "unknown_rollback_error");
        }
      }
      throw P;
    }
    const x = T.filter((P) => ur(P.type)), U = x.filter((P) => ee(P.name) === a), k = d === !0 ? I || await r.getDnsHostHistory(e, u, a) : [], G = o === "a" ? If(o, S, { dedupedDesiredCount: h.duplicateCount }) : null;
    return {
      ok: !0,
      zoneId: u,
      zoneName: A,
      currentHost: a,
      totalRecords: T.length,
      editableRecordCount: x.length,
      filteredCount: U.length,
      records: U,
      ...l === !0 ? { allRecords: x } : {},
      allRecordsIncluded: l === !0,
      history: k,
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
function Uf(n = {}, e = {}) {
  const { kernel: r } = n, { persistCloudflareDnsRecordsForHost: t } = n;
  return {
    async listDnsRecords(a, { env: o, kv: s, request: i }) {
      const c = te(await Ae(o)), l = String(c.cfZoneId || "").trim(), d = String(c.cfApiToken || "").trim(), u = a?.includeAllRecords !== !1;
      if (!l || !d) return B("CF_API_ERROR", "请在账号设置中完善 Zone ID 和 API 令牌");
      try {
        const f = await Pf(c, i), m = f.currentHostRecords, p = f.currentHost ? await r.getDnsHostHistory(s, l, f.currentHost) : [];
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
        return B("CF_DNS_LIST_FAILED", m.includes("cf_api_http_403") ? "Cloudflare DNS 读取失败：API 令牌权限不足（需要 Zone.DNS:Read）" : m.includes("cf_api_http_401") ? "Cloudflare DNS 读取失败：API 令牌无效" : "Cloudflare DNS 读取失败", 400, { reason: m });
      }
    },
    async setDnsHistoryFallback(a, { env: o, kv: s }) {
      const i = ee(a?.host || ""), c = String(a?.entryId || "").trim(), l = a?.enabled !== !1;
      if (!i) return B("MISSING_PARAMS", "host 不能为空");
      if (l && !c) return B("MISSING_PARAMS", "entryId 不能为空");
      const d = te(await Ae(o)), u = String(d.cfZoneId || "").trim();
      if (!u) return B("CF_API_ERROR", "请先在账号设置中保存 Zone ID");
      try {
        return J({
          ok: !0,
          history: await r.setDnsHostHistoryPreferredFallback(s, u, i, c, l)
        });
      } catch (f) {
        const m = String(f?.message || f || "unknown_error");
        return m.includes("dns_history_entry_not_found") ? B("DNS_HISTORY_ENTRY_NOT_FOUND", "指定的 DNS 历史记录不存在", 404) : B("DNS_HISTORY_FALLBACK_UPDATE_FAILED", "设置 DNS 默认回退值失败", 400, { reason: m });
      }
    },
    async createDnsRecord(a, o) {
      return e.updateDnsRecord(a, o);
    },
    async updateDnsRecord(a, { env: o, kv: s, request: i }) {
      const c = String(i.headers.get("X-Admin-Confirm") || "").trim();
      if (c !== "updateDnsRecord" && c !== "createDnsRecord") return B("CONFIRMATION_REQUIRED", "敏感 DNS 操作需要显式确认头", 428);
      const l = String(a?.recordId || a?.id || "").trim(), d = ee(a?.host || a?.name || ""), u = String(a?.type || "").trim().toUpperCase(), f = String(a?.content || "").trim(), m = a?.skipHistory === !0;
      if (!ur(u)) return B("INVALID_TYPE", "Type 仅允许 A / AAAA / CNAME");
      const p = xa(u, f);
      if (p) return B("INVALID_CONTENT", p);
      if (!l && !d) return B("MISSING_PARAMS", "host 不能为空");
      const g = te(await Ae(o)), h = String(g.cfZoneId || "").trim(), y = String(g.cfApiToken || "").trim();
      if (!h || !y) return B("CF_API_ERROR", "请在账号设置中完善 Zone ID 和 API 令牌");
      let S = null, _ = !1, A = !1, b = "";
      try {
        const R = await wo(h, y, { scope: "dns.update_record.zone_lookup" }), E = String(R?.name || "").trim(), w = ee(new URL(i.url).hostname);
        let D = null;
        if (l) {
          const T = `https://api.cloudflare.com/client/v4/zones/${encodeURIComponent(h)}/dns_records/${encodeURIComponent(l)}`, I = Kt((await be(T, y))?.result || null);
          if (!I?.id) return B("NOT_FOUND", "DNS 记录不存在", 404);
          const x = String(I?.type || "").toUpperCase();
          if (!ur(x)) return B("UNSUPPORTED_RECORD_TYPE", "该 DNS 记录类型不支持编辑", 400, { currentType: x });
          const U = d || I.name;
          if (!U) return B("MISSING_PARAMS", "host 不能为空");
          if (E && !la(U, E)) return B("INVALID_HOST", "记录名称必须位于当前 Zone 下");
          const k = sa(I, {
            host: U,
            type: u,
            content: f
          });
          D = Kt((await be(T, y, {
            method: "PUT",
            body: JSON.stringify(k)
          }))?.result || {
            id: l,
            ...k
          }), S = async () => {
            const G = sa(I, {
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
          if (E && !la(d, E)) return B("INVALID_HOST", "记录名称必须位于当前 Zone 下");
          const T = `https://api.cloudflare.com/client/v4/zones/${encodeURIComponent(h)}/dns_records`, I = sa({
            name: d,
            ttl: 1,
            proxied: !1
          }, {
            host: d,
            type: u,
            content: f
          });
          D = Kt((await be(T, y, {
            method: "POST",
            body: JSON.stringify(I)
          }))?.result || I), S = async () => {
            if (!D?.id) throw new Error("created_dns_record_id_missing");
            await be(`${T}/${encodeURIComponent(D.id)}`, y, { method: "DELETE" });
          };
        }
        let C;
        try {
          C = D.type === "CNAME" && !m ? await r.recordDnsHostHistory(s, h, D.name, {
            name: D.name,
            type: D.type,
            content: D.content,
            actor: "admin",
            source: "ui",
            requestHost: w,
            savedAt: (/* @__PURE__ */ new Date()).toISOString()
          }) : await r.getDnsHostHistory(s, h, D.name);
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
          record: D,
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
    async saveDnsRecords(a, { env: o, kv: s, request: i }) {
      if (i.headers.get("X-Admin-Confirm") !== "saveDnsRecords") return B("CONFIRMATION_REQUIRED", "敏感 DNS 操作需要显式确认头", 428);
      const c = Nf(a?.mode), l = ee(a?.host || ""), d = a?.includeAllRecords === !0, u = Array.isArray(a?.records) ? a.records : [];
      if (!l) return B("MISSING_PARAMS", "host 不能为空");
      const f = [];
      if (c === "cname") {
        const h = String(u[0]?.content || "").trim(), y = xa("CNAME", h);
        if (y) return B("INVALID_CONTENT", y);
        f.push({
          type: "CNAME",
          content: h
        });
      } else {
        const h = u.map((y) => ({
          type: String(y?.type || "").trim().toUpperCase(),
          content: String(y?.content || "").trim()
        })).filter((y) => y.type || y.content);
        if (!h.length) return B("INVALID_CONTENT", "A 模式至少保留 1 条 A / AAAA 记录");
        for (const y of h) {
          if (!["A", "AAAA"].includes(y.type)) return B("INVALID_TYPE", "A 模式仅允许 A / AAAA");
          const S = xa(y.type, y.content, { allowCname: !1 });
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
          includeAllRecords: d
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
async function Vr(n, e, r) {
  const t = Array.isArray(n) ? n : [];
  if (t.length === 0) return [];
  if (typeof r != "function") throw new TypeError("worker must be a function");
  const a = Number(e), o = Number.isFinite(a) && a > 0 ? Math.min(t.length, Math.max(1, Math.floor(a))) : 1, s = new Array(t.length);
  let i = 0;
  const c = Array.from({ length: o }, async () => {
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
var Hf = Object.freeze([{
  id: "cloudflare",
  label: "Cloudflare",
  endpoint: "https://cloudflare-dns.com/dns-query"
}]), uc = 30 * 1e3, kf = uc, Kf = "emby-proxy-ui-dns-probe/1.0", zf = 2400 * 1e3, $f = 35 * 1e3, Bf = "dns_ip_pool_fetch_lock:", Wf = "sys:dns_ip_pool_fetch_lock:v1:";
function Vf(n = {}, e = [], r = {}) {
  const t = /* @__PURE__ */ new Set(), a = [];
  for (const s of Array.isArray(e) ? e : []) {
    const i = cr(s);
    if (!i) continue;
    const c = String(i.ip || "").trim().toLowerCase();
    !c || t.has(c) || (t.add(c), a.push(i));
  }
  const o = a.slice(0, Or(n?.ipLimit));
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
async function Gf(n = {}, e = O.Defaults.DnsIpSourceFetchMaxBytes) {
  const r = String(n?.url || "").trim();
  if (!r) throw new Error("empty_source_url");
  const t = new AbortController(), a = setTimeout(() => t.abort(), uc);
  try {
    const o = await Ke(r, {
      redirect: "follow",
      signal: t.signal
    });
    if (!o.ok) throw new Error(`HTTP_${o.status}`);
    const s = await Pe(o, e);
    if (s.exceeded) throw new Error("SOURCE_TOO_LARGE");
    const i = s.text, c = Bs(n?.builtinId || n?.builtin_id || "");
    return (c === "all" ? Tl(i) : c === "preferred" ? wl(i, { limit: Or(n?.ipLimit) }) : fo(i, { limit: Or(n?.ipLimit) })).map((l) => ({
      ...l,
      sourceKind: "api",
      sourceLabel: n?.name || r
    }));
  } catch (o) {
    throw Qt(o) ? new Error("FETCH_TIMEOUT") : o;
  } finally {
    clearTimeout(a);
  }
}
function jf(n = {}, e = "", r = "A") {
  const t = new URL(String(n?.endpoint || ""));
  return t.searchParams.set("name", ee(e)), t.searchParams.set("type", String(r || "A").toUpperCase()), t;
}
async function qf(n = {}, e = "", r = "A") {
  const t = new AbortController(), a = setTimeout(() => t.abort(), kf);
  try {
    const o = await Ke(jf(n, e, r).toString(), {
      headers: { accept: "application/dns-json" },
      redirect: "follow",
      signal: t.signal
    });
    if (!o.ok) throw new Error(`DOH_HTTP_${o.status}`);
    const s = await Pe(o, rn);
    return El(s.exceeded ? null : JSON.parse(s.text || "null")).map((i) => ({
      ...i,
      sourceKind: "domain",
      sourceLabel: String(e || "").trim()
    }));
  } catch (o) {
    throw Qt(o) ? new Error("DOH_TIMEOUT") : o;
  } finally {
    clearTimeout(a);
  }
}
function Xf(n = []) {
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
async function Yf(n = {}) {
  const e = ee(n?.domain || "");
  if (!e) throw new Error("empty_source_domain");
  const r = [], t = [], a = [];
  for (const i of ["A", "AAAA"]) for (const c of Hf) a.push({
    resolver: c,
    recordType: i
  });
  const o = await Vr(a, Math.min(2, Math.max(1, a.length)), async ({ resolver: i, recordType: c }) => {
    try {
      return {
        resolver: i,
        recordType: c,
        items: await qf(i, e, c),
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
  const s = Xf(r);
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
async function Jf(n = {}, e = O.Defaults.DnsIpSourceFetchMaxBytes) {
  const r = (/* @__PURE__ */ new Date()).toISOString(), t = wt(n);
  try {
    return Vf(t, t.sourceType === "domain" ? await Yf(t) : await Gf(t, e), { lastFetchAt: r });
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
async function fs(n, e = "", r = "UNKNOWN", t = {}) {
  const { probeRepository: a } = t, o = String(e || "").trim(), s = Qe(o), i = String(r || "UNKNOWN").trim().toUpperCase() || "UNKNOWN";
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
    expiresAt: K()
  };
  if (n && t.forceRefresh !== !0 && t.skipCacheRead !== !0) {
    const m = await a.getDnsIpProbeCacheEntry(n, o, i);
    if (m) return m;
  }
  const c = new AbortController(), l = setTimeout(() => c.abort(), ue(t.probeTimeoutMs ?? t.timeoutMs, O.Defaults.DnsIpProbeTimeoutMs, 250, 3e4)), d = K(), u = s === "IPv6" ? `http://[${o}]/` : `http://${o}/`, f = (/* @__PURE__ */ new Date()).toISOString();
  try {
    const m = await Ke(u, {
      headers: { "user-agent": Kf },
      method: "HEAD",
      redirect: "manual",
      signal: c.signal
    }), p = Math.max(0, K() - d), g = String(m.headers.get("CF-RAY") || m.headers.get("cf-ray") || "").trim(), h = String(m.headers.get("Server") || m.headers.get("server") || "").trim(), y = Ks(g), S = y ? "ok" : /cloudflare/i.test(h) ? "cf_header_missing" : "non_cloudflare", _ = Dl(y), A = {
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
      expiresAt: K() + O.Defaults.DnsIpProbeCacheTtlSec * 1e3
    };
    return n && await a.upsertDnsIpProbeCacheEntry(n, A), A;
  } catch (m) {
    const p = {
      ip: o,
      entryColo: i,
      probeStatus: Qt(m) ? "timeout" : "network_error",
      latencyMs: null,
      cfRay: "",
      coloCode: "",
      cityName: "",
      countryCode: "UNKNOWN",
      countryName: "未知",
      probedAt: f,
      expiresAt: K() + O.Defaults.DnsIpProbeCacheTtlSec * 1e3
    };
    return n && await a.upsertDnsIpProbeCacheEntry(n, p), p;
  } finally {
    clearTimeout(l);
  }
}
async function fc(n = [], e, r = "UNKNOWN", t = {}) {
  const a = [], o = /* @__PURE__ */ new Map(), s = /* @__PURE__ */ new Set(), i = String(r || "UNKNOWN").trim().toUpperCase() || "UNKNOWN";
  for (const S of Array.isArray(n) ? n : []) {
    const _ = String(S?.ip || S?.content || "").trim(), A = Qe(_) || ks(S?.ipType || S?.ip_type || S?.type || "");
    if (!_ || !A) continue;
    const b = {
      id: String(S?.id || S?.recordId || `${t.scope || "dns"}-${ce(`${_}|${S?.sourceKind || S?.source_kind || ""}`)}`),
      ip: _,
      ipType: A,
      recordId: String(S?.recordId || S?.id || ""),
      host: String(S?.host || S?.name || t.host || ""),
      sourceKind: String(S?.sourceKind || S?.source_kind || t.scope || "shared_pool"),
      sourceLabel: String(S?.sourceLabel || S?.source_label || t.sourceLabel || ""),
      lineLabel: Ur(S?.lineLabel || S?.line_label || ""),
      remark: String(S?.remark || ""),
      createdAt: String(S?.createdAt || S?.created_at || ""),
      updatedAt: String(S?.updatedAt || S?.updated_at || ""),
      probeStatus: Ia(S?.probeStatus || S?.probe_status || ""),
      latencyMs: Number.isFinite(Number(S?.latencyMs ?? S?.latency_ms)) ? Math.max(0, Math.round(Number(S?.latencyMs ?? S?.latency_ms))) : null,
      cfRay: String(S?.cfRay || S?.cf_ray || ""),
      coloCode: String(S?.coloCode || S?.colo_code || "").trim().toUpperCase(),
      cityName: String(S?.cityName || S?.city_name || ""),
      countryCode: String(S?.countryCode || S?.country_code || "").trim().toUpperCase() || "UNKNOWN",
      countryName: String(S?.countryName || S?.country_name || "") || "未知",
      probedAt: String(S?.probedAt || S?.probed_at || "")
    };
    a.push(b), o.set(_.toLowerCase(), _);
  }
  if (!a.length) return {
    items: [],
    probeEntryColo: i,
    probeDataSource: "cache"
  };
  const c = /* @__PURE__ */ new Map(), l = [], d = [...o.values()], u = e ? await t.probeRepository.getDnsIpProbeCacheEntries(e, d, i) : [];
  for (const S of Array.isArray(u) ? u : []) {
    const _ = String(S?.ip || "").trim().toLowerCase();
    _ && c.set(_, S);
  }
  for (const S of d)
    c.has(String(S || "").toLowerCase()) && t.forceRefresh !== !0 || l.push(S);
  const f = t.deferProbe === !0 && !!t.ctx?.waitUntil, m = ue(t.syncProbeLimit, O.Defaults.DnsIpWorkspaceSyncProbeLimit, 0, 64), p = f && l.length > m ? l.slice(0, m) : l, g = f && l.length > m ? l.slice(m) : [], h = ue(t.probeConcurrency, O.Defaults.DnsIpProbeConcurrency, 1, 4);
  let y = "cache";
  return p.length > 0 && (y = "live_sync"), g.length > 0 && (y = "live_deferred"), await Vr(p, h, async (S) => {
    const _ = await fs(e, S, r, t);
    c.set(String(S || "").toLowerCase(), _);
  }), g.length && (g.forEach((S) => s.add(String(S || "").toLowerCase())), t.ctx.waitUntil(Vr(g, h, async (S) => {
    await fs(e, S, r, t);
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
    probeDataSource: jn(y)
  };
}
function Qf(n = {}) {
  const e = mo(n?.items || []);
  return {
    sourceResults: js(n?.sourceResults || []),
    importedCount: Math.max(0, Number(n?.importedCount) || e.length),
    items: e,
    enabledSourceCount: Math.max(0, Number(n?.enabledSourceCount) || 0),
    cachedAt: Ha(n?.cachedAtMs),
    expiresAt: Ha(n?.expiresAtMs)
  };
}
async function Zf(n = [], e, r = "UNKNOWN", t = null, a = {}) {
  const o = t && typeof t.waitUntil == "function" ? t : { waitUntil() {
  } }, s = await fc(n, e, r, {
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
function jn(n = "") {
  const e = String(n || "").trim().toLowerCase();
  return e === "live_deferred" ? "live_deferred" : e === "live_sync" ? "live_sync" : "cache";
}
function em(n = "", e = "") {
  const r = jn(n), t = jn(e), a = {
    cache: 0,
    live_sync: 1,
    live_deferred: 2
  };
  return (a[t] || 0) > (a[r] || 0) ? t : r;
}
function tm(n = {}) {
  const e = [];
  Array.isArray(n?.localPoolItems) && e.push(...n.localPoolItems), Array.isArray(n?.poolItems) && e.push(...n.poolItems), Array.isArray(n?.sharedPoolItems) && e.push(...n.sharedPoolItems);
  const r = [], t = /* @__PURE__ */ new Set();
  for (const a of e) {
    const o = cr(a);
    if (!o) continue;
    const s = String(o.ip || "").trim().toLowerCase();
    !s || t.has(s) || (t.add(s), r.push({
      ...a,
      ...o
    }));
  }
  return r;
}
function rm(n = [], e = []) {
  const r = /* @__PURE__ */ new Map(), t = (a) => {
    for (const o of Array.isArray(a) ? a : []) {
      const s = cr(o);
      s && r.set(String(s.ip || "").trim().toLowerCase(), {
        ...o,
        ...s
      });
    }
  };
  return t(n), t(e), [...r.values()];
}
function am(n = "") {
  return `${Bf}${String(n || "").trim()}`;
}
async function nm({ kv: n = null, db: e = null, leaseRepository: r = null } = {}, t = "") {
  const a = am(t);
  if (!a || a === "dns_ip_pool_fetch_lock:") return {
    acquired: !1,
    reason: "empty_signature"
  };
  const o = `${K()}-${Math.random().toString(36).slice(2, 10)}`;
  return e ? {
    ...await r.tryAcquireScheduledLeaseWithDb(e, {
      scope: a,
      token: o,
      owner: "dns_ip_pool_fetch",
      leaseMs: $f
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
async function om({ kv: n = null, db: e = null, leaseRepository: r = null } = {}, t = null) {
  if (!t?.token) return !1;
  const a = String(t?.key || "").trim();
  return e && a ? await r.releaseScheduledLeaseWithDb(e, t.token, { scope: a }) : !1;
}
async function sm({ kv: n = null, db: e = null, ctx: r = null, sourceList: t = [], maxBytes: a = O.Defaults.DnsIpSourceFetchMaxBytes, poolRepository: o = null } = {}) {
  const s = (Array.isArray(t) ? t : []).map((_, A) => wt(_, A)), i = s.filter((_) => _.enabled === !0 && tr(_)), c = ue(O.Defaults.DnsIpSourceConcurrency, O.Defaults.DnsIpSourceConcurrency, 1, 4), l = await Vr(i, i.some((_) => St(_?.sourceType) === "domain") ? Math.min(c, 2) : c, async (_) => Jf(_, a)), d = [], u = /* @__PURE__ */ new Map();
  for (const _ of l)
    u.set(String(_?.id || ""), _), Array.isArray(_?.items) && d.push(..._.items);
  const f = s.map((_, A) => {
    const b = u.get(String(_?.id || ""));
    return wt(b ? {
      ..._,
      lastFetchAt: b.lastFetchAt,
      lastFetchStatus: b.status,
      lastFetchCount: b.count
    } : _, A);
  }), m = await he(o.persistDnsIpPoolSources({
    kv: n,
    db: e
  }, f, null), "dns_ip_pool.refresh.persist_source_state", {
    sourceCount: f.length,
    enabledSourceCount: i.length
  }, f), p = lr(d), g = mo(p), h = js(l);
  let y = "", S = "";
  if (e) {
    const _ = Ma(s, a);
    if (_ && Ul(l)) {
      const A = K(), b = A + zf, R = await o.upsertDnsIpPoolFetchCacheEntry(e, {
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
      y = Ha(R?.cachedAtMs), S = Ha(R?.expiresAtMs);
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
    expiresAt: S
  };
}
function im(n = {}, e = {}) {
  const { kernel: r } = n, { buildDnsIpPoolWorkspacePreviewItems: t, buildDnsIpWorkspaceItems: a, releaseDnsIpPoolFetchRefreshLock: o, runDnsIpPoolSourcesLiveRefresh: s, tryAcquireDnsIpPoolFetchRefreshLock: i } = n;
  return {
    async getDnsIpWorkspace(c, { env: l, kv: d, db: u, request: f, ctx: m }) {
      try {
        const p = c?.forceRefresh === !0;
        u && await r.ensureDnsIpWorkspaceSchema(u);
        const g = await de(l), h = ea(f), y = bd(f);
        let S = await r.getDnsIpPoolSourcesForRead({
          kv: d,
          db: u
        });
        const _ = tm(c), A = O.Defaults.DnsIpSourceFetchMaxBytes, b = S.filter((k) => k.enabled === !0 && tr(k));
        let R = [], E = "empty", w = !1;
        if (p && b.length > 0) {
          const k = await s({
            kv: d,
            db: u,
            ctx: m,
            sourceList: S,
            maxBytes: A
          });
          S = Array.isArray(k?.sourceList) ? k.sourceList : S, R = Array.isArray(k?.items) ? k.items : [], E = "live_sync";
        } else {
          const k = Ma(S, A), G = u && k ? await r.getDnsIpPoolFetchCacheEntry(u, k) : null;
          if (G)
            R = Array.isArray(G?.items) ? G.items : [], E = "cache";
          else if (b.length > 0 && m?.waitUntil && k) {
            const P = await i({
              kv: d,
              db: u
            }, k);
            P?.acquired === !0 && (w = !0, E = "live_deferred", m.waitUntil((async () => {
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
                await o({
                  kv: d,
                  db: u
                }, P);
              }
            })()));
          }
        }
        const D = rm(R, _), C = await a(D, u, h, {
          forceRefresh: p,
          scope: "shared_pool",
          ctx: m,
          deferProbe: !0,
          syncProbeLimit: 0,
          probeTimeoutMs: 500
        }), T = [], I = Array.isArray(C?.items) ? C.items : [], x = await r.getOpsStatusSection({
          kv: d,
          db: u
        }, "dnsIpPool"), U = /* @__PURE__ */ new Map();
        for (const k of I) {
          const G = String(k?.countryCode || "").trim().toUpperCase();
          if (!G) continue;
          const P = U.get(G) || {
            code: G,
            name: String(k?.countryName || "未知"),
            count: 0
          };
          P.count += 1, U.set(G, P);
        }
        return J({
          zoneId: String(g.cfZoneId || "").trim(),
          zoneName: "",
          host: "",
          requestColo: h,
          probeEntryColo: h,
          probeDataSource: em("cache", C?.probeDataSource),
          sourceSnapshotStatus: E,
          backgroundRefreshQueued: w,
          requestCountryCode: y.countryCode,
          requestCountryName: y.countryName,
          currentHostItems: T,
          sharedPoolItems: I,
          sourceList: S,
          availableCountries: [...U.values()].sort((k, G) => String(k.code || "").localeCompare(String(G.code || ""))),
          summary: Kl(T, I),
          dnsIpPoolRevision: r.getDnsIpPoolRevisionFromStatus(x),
          generatedAt: (/* @__PURE__ */ new Date()).toISOString(),
          ...yr(),
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
        throw At(p, "DNS_IP_WORKSPACE_READ_FAILED", "独立 IP 池工作区读取失败：KV 读取异常", "admin.read.dns_ip_workspace");
      }
    },
    async importDnsIpPoolItems(c, { env: l, kv: d, db: u, request: f }) {
      const m = String(c?.text || c?.content || "").trim();
      if (!m) return B("EMPTY_IMPORT_TEXT", "请先提供要导入的文本内容");
      const p = String(c?.sourceKind || "manual").trim().toLowerCase() || "manual", g = String(c?.sourceLabel || "").trim() || (p === "file" ? "文件导入" : "手动导入"), h = fo(m).map((_) => ({
        ..._,
        sourceKind: p,
        sourceLabel: g
      })), y = await a(h, u, ea(f), {
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
      if (!u) return B("D1_NOT_CONFIGURED", "请先绑定 D1 / PROXY_LOGS 数据库");
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
        ...yr(),
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
          ...yr(),
          revisions: await r.getAdminRevisionsForRead({
            env: l,
            kv: d,
            db: u
          }, { config: await de(l) })
        });
        u && await r.ensureDnsIpWorkspaceSchema(u);
        const [f, m, p] = await Promise.all([
          de(l),
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
          ...yr(),
          revisions: await r.getAdminRevisionsForRead({
            env: l,
            kv: d,
            db: u
          }, { config: f })
        });
      } catch (f) {
        throw At(f, "DNS_IP_POOL_SOURCES_READ_FAILED", "独立 IP 池抓取源读取失败：D1 读取异常", "admin.read.dns_ip_pool_sources");
      }
    },
    async refreshDnsIpPoolFromSources(c, { env: l, kv: d, db: u, ctx: f, request: m }) {
      try {
        if (!u) return B("D1_NOT_CONFIGURED", "请先绑定 D1 / PROXY_LOGS 数据库");
        u && await r.ensureDnsIpWorkspaceSchema(u);
        const p = ue(c?.maxBytes, O.Defaults.DnsIpSourceFetchMaxBytes, 1024, 8 * 1024 * 1024), g = await r.getDnsIpPoolSources({
          kv: d,
          db: u
        }), h = Ma(g, p), y = u && h ? await r.getDnsIpPoolFetchCacheEntry(u, h) : null;
        if (y) {
          let A = !1;
          if (f?.waitUntil) {
            const E = await i({
              kv: d,
              db: u
            }, h);
            E?.acquired === !0 && (A = !0, f.waitUntil((async () => {
              try {
                await s({
                  kv: d,
                  db: u,
                  sourceList: g,
                  maxBytes: p
                });
              } catch (w) {
                console.warn("[DNS IP Pool] background refresh failed:", w?.message || w);
              } finally {
                await o({
                  kv: d,
                  db: u
                }, E);
              }
            })()));
          }
          const b = Qf(y), R = await t(b.items, u, ea(m), f, { syncProbeLimit: 0 });
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
            dnsIpPoolRevision: await r.getOpsStatusSection({
              kv: d,
              db: u
            }, "dnsIpPool").then((E) => r.getDnsIpPoolRevisionFromStatus(E)).catch(() => ""),
            ...yr(),
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
        }), _ = await t(S.items, u, ea(m), f, {
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
          ...yr(),
          revisions: await r.getAdminRevisions({
            env: l,
            kv: d,
            db: u
          })
        });
      } catch (p) {
        if (en(p)) throw p;
        const g = ie(p, "unknown_error"), h = /* @__PURE__ */ new Error(`更新服务端共享快照失败: ${g}`);
        throw h.code = "DNS_IP_POOL_REFRESH_FAILED", h.status = 500, h.details = { reason: g }, h;
      }
    },
    async deleteDnsIpPoolItems(c, { env: l, kv: d, db: u, ctx: f }) {
      u && await r.ensureDnsIpWorkspaceSchema(u);
      const m = Hl(c?.target);
      if (m === "shared_snapshot") {
        if (!u) return B("D1_NOT_CONFIGURED", "请先绑定 D1 / PROXY_LOGS 数据库");
        const g = await r.getDnsIpPoolSourcesForRead({
          kv: d,
          db: u
        }), h = Ma(g, O.Defaults.DnsIpSourceFetchMaxBytes), y = h ? await r.getDnsIpPoolFetchCacheEntry(u, h) : null, S = kl(y, c?.ips || []);
        if (y && h && S.deletedCount > 0) {
          const _ = (/* @__PURE__ */ new Date()).toISOString(), A = Math.max(0, Number(y?.cachedAtMs) || 0), b = Math.max(A, Number(y?.expiresAtMs) || A), R = Math.max(0, Number(y?.enabledSourceCount) || (Array.isArray(g) ? g.filter((E) => E?.enabled === !0 && tr(E)).length : 0));
          await r.upsertDnsIpPoolFetchCacheEntry(u, {
            signature: h,
            items: S.items,
            sourceResults: S.sourceResults,
            importedCount: S.items.length,
            enabledSourceCount: R,
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
      const p = qs(c?.ips || []).normalizedIps;
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
        const m = String(f?.ip || f || "").trim(), p = Qe(m);
        !m || !p || l.push({
          type: p === "IPv6" ? "AAAA" : "A",
          content: m
        });
      }
      if (!l.length) return B("EMPTY_IP_SELECTION", "请先选择至少一个可用 IP");
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
function cm(n = {}, e = {}) {
  const { kernel: r } = n;
  return {
    async testTelegram(t) {
      const { tgBotToken: a, tgChatId: o } = t;
      if (!a || !o) return B("MISSING_PARAMS", "请先填写 Bot Token 和 Chat ID");
      try {
        return await r.sendTelegramMessage({
          tgBotToken: a,
          tgChatId: o,
          text: `✅ Emby Proxy: Telegram 机器人测试通知成功！
如果您能看到这条消息，说明您的通知配置完全正确。`
        }), J({ success: !0 });
      } catch (s) {
        return B("NETWORK_ERROR", s.message);
      }
    },
    async sendDailyReport(t, { env: a }) {
      try {
        const o = await r.sendDailyTelegramReport(a);
        return J({
          success: !0,
          sentCount: Number(o?.sentCount) || 0,
          reportKinds: Array.isArray(o?.reportKinds) ? o.reportKinds : []
        });
      } catch (o) {
        return B("REPORT_FAILED", o.message);
      }
    },
    async sendPredictedAlert(t, { env: a }) {
      try {
        const o = await r.maybeSendRuntimeAlerts(a, null, {
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
    async pingNode(t, { env: a, ctx: o }) {
      const s = await Ae(a), i = ue(t.timeout, s.pingTimeout ?? Ql, 1e3, 18e4);
      if (t.target) {
        const S = r.normalizeSingleTarget(t.target);
        if (!S) return B("INVALID_TARGET", "目标源站必须是有效的 http/https URL");
        const _ = await r.pingTarget(S, i);
        return J({
          ..._.ok ? { ms: _.elapsedMs } : {},
          probe: _,
          target: S,
          usedCache: !1,
          scope: "target"
        });
      }
      const c = String(t.name || "").trim(), l = await r.getNode(c, a, o);
      if (!l || !Array.isArray(l.lines) || !l.lines.length) return B("NOT_FOUND", "节点不存在");
      const d = String(t.lineId || "").trim(), u = d ? l.lines.filter((S) => S.id === d) : l.lines.slice();
      if (d && !u.length) return B("LINE_NOT_FOUND", "线路不存在", 404);
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
function lm(n = {}, e = {}) {
  const { kernel: r } = n, { LogQueryPlanner: t } = n;
  return {
    async getLogs(a, { db: o, env: s }) {
      if (!o) return J({ error: "D1 not configured" }, 500);
      const i = t.normalizeRequest(a), { filters: c } = i, l = s ? await Ae(s) : {}, d = await r.resolveLogsReadiness({
        db: o,
        kv: r.getKV(s)
      }), u = t.resolveSearch(c, l, d);
      if (u.errorResponse) return u.errorResponse;
      const { effectiveSearchMode: f, searchFallbackReason: m } = u;
      if (l.logEnabled === !1) return t.buildDisabledResponse(i, d, f, m);
      if (d.schemaReady !== !0) return B("LOG_SCHEMA_NOT_READY", "日志表尚未初始化，请先点击“初始化日志表”", 400, {
        effectiveSearchMode: f,
        searchFallbackReason: m,
        revisions: { logsRevision: d.revision }
      });
      const p = t.buildSqlPlan(c, i, l, f);
      if (p.errorResponse) return p.errorResponse;
      const g = await t.executeSqlPlan(o, i, p);
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
    async clearLogs(a, { db: o, env: s, ctx: i, request: c }) {
      if (c.headers.get("X-Admin-Confirm") !== "clearLogs") return B("CONFIRMATION_REQUIRED", "敏感操作需要显式确认头", 428);
      if (!o) return J({ error: "D1 not configured" }, 500);
      await r.ensureLogsBaseSchema(o), await r.ensureStatsHourlySchema(o);
      const l = K(), d = Ut.get(o);
      d.LogClearEpochMs = Math.max(d.LogClearEpochMs || 0, l), await r.patchOpsStatus(s || o, { log: {
        clearEpochMs: l,
        clearEpochAt: new Date(l).toISOString()
      } }, i);
      const u = d.LogFlushTask;
      if (u) try {
        await u;
      } catch {
      }
      d.LogQueue.length = 0, d.LogDedupe.clear(), d.LogLastFlushAt = 0, await o.prepare(`DELETE FROM ${r.LOGS_TABLE}`).run(), await r.clearStatsHourly(o).catch(() => !1);
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
      return J({
        success: !0,
        ftsRebuilt: f,
        revisions: { logsRevision: r.getLogsRevisionFromStatus(g?.log || g) }
      });
    },
    async getD1SchemaStatus(a, { db: o }) {
      return o ? J({
        success: !0,
        status: await r.getD1SchemaStatus(o)
      }) : B("D1_NOT_CONFIGURED", "请先绑定 D1 / PROXY_LOGS 数据库", 503);
    },
    async initLogsDb(a, { db: o }) {
      if (!o) return B("D1_NOT_CONFIGURED", "D1 database is not configured", 503);
      const s = await r.initializeD1Database(o, { includeFts: !0 }), i = s.status, c = i.ftsReady === !0, l = i.tables?.[r.STATS_HOURLY_TABLE] === !0, d = await r.bumpLogsRevision(o, {
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
        revisions: { logsRevision: r.getLogsRevisionFromStatus(d?.log || d) }
      });
    }
  };
}
function dm(n = {}) {
  const { kernel: e } = n, r = {}, t = jc([
    {
      name: "dashboard",
      handlers: uf({
        ...n,
        kernel: e
      }, r)
    },
    {
      name: "config",
      handlers: bf({
        ...n,
        kernel: e
      }, r)
    },
    {
      name: "backup",
      handlers: Rf({
        ...n,
        kernel: e
      }, r)
    },
    {
      name: "nodes",
      handlers: wf({
        ...n,
        kernel: e
      }, r)
    },
    {
      name: "maintenance",
      handlers: Df({
        ...n,
        kernel: e
      }, r)
    },
    {
      name: "dns-records",
      handlers: Uf({
        ...n,
        kernel: e
      }, r)
    },
    {
      name: "dns-pool",
      handlers: im({
        ...n,
        kernel: e
      }, r)
    },
    {
      name: "notifications",
      handlers: cm({
        ...n,
        kernel: e
      }, r)
    },
    {
      name: "database",
      handlers: lm({
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
function um(n = {}) {
  return { adminActionHandlers: dm(n).handlers };
}
function je(n, e) {
  const r = F(n) ? n : {}, t = F(e) ? e : {}, a = { ...r };
  for (const [o, s] of Object.entries(t))
    s !== void 0 && (F(s) && F(r[o]) ? a[o] = je(r[o], s) : F(s) ? a[o] = je({}, s) : a[o] = s);
  return a;
}
function xe(n, e, r, t) {
  n.has(e) && n.delete(e), n.set(e, r);
  const a = Math.floor(Number(t));
  if (!(!Number.isFinite(a) || a < 1))
    for (; n.size > a; ) {
      const o = n.keys().next().value;
      if (o === void 0) break;
      n.delete(o);
    }
}
function Ya(n, e) {
  if (!n.has(e)) return;
  const r = n.get(e);
  return n.delete(e), n.set(e, r), r;
}
function nr(n = void 0) {
  const e = n === void 0 ? gt.current() : Se(n);
  e.NodesRevisionCacheGeneration += 1, e.NodesRevisionCache = null;
}
function ms(n, e = null) {
  const r = Se(e);
  r.NodesRevisionCacheGeneration += 1, r.NodesRevisionCache = {
    loaded: !0,
    revision: String(n || "").trim(),
    exp: Date.now() + O.Defaults.NodesRevisionCacheTtlMs
  };
}
function Ie(n, e = gt.current()) {
  const r = String(n || "").trim().toLowerCase(), t = r && Number(e.NodeCacheGenerations.get(r)) || 0, a = t ? `node:${t}` : `missing:${e.NodeCacheGenerationEvictionEpoch}`;
  return `${e.NodeCacheResetGeneration}:${a}`;
}
function fm(n = [], e = gt.current()) {
  for (const r of Array.isArray(n) ? n : [n]) {
    const t = String(r || "").trim().toLowerCase();
    if (!t) continue;
    !e.NodeCacheGenerations.has(t) && e.NodeCacheGenerations.size >= O.Defaults.NodeCacheMax && (e.NodeCacheGenerationEvictionEpoch += 1);
    const a = ++e.NodeCacheGenerationNonce;
    xe(e.NodeCacheGenerations, t, a, O.Defaults.NodeCacheMax);
  }
}
function ps(n = gt.current()) {
  n.NodeCacheResetGeneration += 1, n.NodeCacheGenerations.clear();
}
async function Er(n, e = null) {
  const r = Se(e), t = r.NodeIndexMutationChain.catch(() => null).then(async () => {
    r.NodesListCache = null, r.NodesIndexCache = null, nr(e);
    try {
      return await n();
    } catch (a) {
      throw r.NodesListCache = null, r.NodesIndexCache = null, nr(e), a;
    }
  });
  return r.NodeIndexMutationChain = t.catch(() => null), await t;
}
var mm = "cf_dashboard_cache:", mc = "sys:cf_dash_cache", pm = 1800 * 1e3, gs = 1440 * 60 * 1e3;
function qn(n, e = "") {
  return `${mm}${encodeURIComponent(String(n || "default").trim() || "default")}:${encodeURIComponent(String(e || "current").trim() || "current")}`;
}
function hs(n, e = "") {
  return `${mc}:${encodeURIComponent(String(n || "default").trim() || "default")}:${encodeURIComponent(String(e || "current").trim() || "current")}`;
}
function ys(n = /* @__PURE__ */ new Date(), e = O.Defaults.ScheduleUtcOffsetMinutes) {
  const r = _a(n, e), t = r.shiftedDate.getUTCFullYear(), a = r.shiftedDate.getUTCMonth(), o = Date.UTC(t, a, 1) - r.utcOffsetMinutes * 60 * 1e3, s = Date.UTC(t, a + 1, 1) - r.utcOffsetMinutes * 60 * 1e3, i = r.now.getTime();
  return {
    ...r,
    monthKey: `${t}-${String(a + 1).padStart(2, "0")}`,
    periodLabel: `${t}年${a + 1}月`,
    startTs: o,
    endTs: Math.min(Math.max(o, i), s - 1),
    nextMonthTs: s
  };
}
function gm(n = "", e = "", r = 0) {
  return [
    "dashboard_monthly_traffic",
    1,
    encodeURIComponent(String(n || "default").trim() || "default"),
    encodeURIComponent(String(e || "current").trim() || "current"),
    ke(r)
  ].join(":");
}
function hm(n = "") {
  const e = String(n || "").trim();
  return e ? new Request(`https://dashboard-monthly-traffic-cache.invalid/${encodeURIComponent(e)}`) : null;
}
function jt(n = {}) {
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
function ym(n = "", e = "") {
  const r = String(n || "").trim();
  return r ? String(e || "").trim().toLowerCase() === "workers_usage" && r.includes("Cloudflare Workers Usage") ? "今日请求量口径：Cloudflare Workers Usage" : r : "";
}
function Sm(n = "") {
  const e = String(n || "").trim();
  return e ? e.includes("请求数已对齐 Workers Usage") ? "Cloudflare 统计正常" : e : "";
}
function _m(n = "", e = "") {
  const r = String(n || "").trim();
  if (!r) return "";
  const t = String(e || "").trim().toLowerCase();
  return r.includes("已对齐脚本") || t === "workers_usage" && r.includes("脚本:") ? "" : r;
}
var bm = [
  "周日",
  "周一",
  "周二",
  "周三",
  "周四",
  "周五",
  "周六"
];
function pc() {
  return Array.from({ length: 24 }, (n, e) => String(e).padStart(2, "0"));
}
function Xn(n = "") {
  const e = /^(\d{4})-(\d{2})-(\d{2})$/.exec(String(n || "").trim());
  if (!e) return String(n || "").trim() || "-";
  const r = bm[new Date(Date.UTC(Number(e[1]), Number(e[2]) - 1, Number(e[3]))).getUTCDay()] || "";
  return `${e[2]}-${e[3]}${r ? ` ${r}` : ""}`;
}
function gc(n = "", e = 0, r = 0, t = 0, a = 0) {
  const o = Math.max(0, Math.min(23, Number(e) || 0)), s = Math.max(0, Number(r) || 0), i = Math.max(0, Number(t) || 0), c = Math.max(0, Math.min(1, Number(a) || 0)), l = `${String(o).padStart(2, "0")}:00`, d = s > 0 ? Math.min(0.88, Number((0.12 + c * 0.68).toFixed(3))) : 0.04;
  return {
    key: `${n}:${o}`,
    hour: o,
    hourLabel: l,
    rowsWritten: s,
    writeQueries: i,
    intensity: c,
    className: s > 0 ? "d1-heat-cell is-active" : "d1-heat-cell is-empty",
    style: `--d1-heat-alpha:${d}`,
    title: `${n} ${l} · 写入 ${ye(s)} 行 · SQL 写 ${ye(i)} 次`
  };
}
function Ja(n = {}) {
  const e = ke(n.utcOffsetMinutes), r = Math.max(0, Number(n.nowMs) || K()), t = pt(new Date(r), e).startTs - 8640 * 60 * 1e3, a = Array.from({ length: 7 }, (o, s) => {
    const i = Bt(t + s * 24 * 60 * 60 * 1e3, e);
    return {
      key: i.dateKey,
      dateKey: i.dateKey,
      label: Xn(i.dateKey),
      cells: Array.from({ length: 24 }, (c, l) => gc(i.dateKey, l))
    };
  });
  return {
    title: "D1 写入热点图",
    status: String(n.status || "idle").trim().toLowerCase() || "idle",
    source: String(n.source || "").trim(),
    summary: String(n.summary || "D1 写入热点尚未加载").trim() || "D1 写入热点尚未加载",
    detail: String(n.detail || "").trim(),
    periodLabel: String(n.periodLabel || `最近 7 天 · ${lo(e)}`).trim(),
    hourLabels: pc(),
    rows: a,
    available: !1,
    totalRowsWritten: 0,
    totalWriteQueries: 0,
    peakLabel: "",
    legendMaxLabel: "0"
  };
}
function Rm(n = {}) {
  const e = n && typeof n == "object" ? { ...n } : {}, r = Ja({ status: "idle" });
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
function Io(n = {}) {
  const e = n && typeof n == "object" ? { ...n } : {}, r = String(e.requestSource || "").trim().toLowerCase();
  return e.requestSourceText = ym(e.requestSourceText, r), e.cfAnalyticsStatus = Sm(e.cfAnalyticsStatus), e.cfAnalyticsDetail = _m(e.cfAnalyticsDetail, r), e.d1WriteHotspot = Rm(e.d1WriteHotspot), e;
}
function Po(n = "") {
  const e = String(n || "").trim().toLowerCase();
  return e === "cache" || e === "stale" || e === "live" ? e : "live";
}
function hc(n, e = "dashboard_snapshot_failed") {
  const r = vt(n, e);
  return r.length <= 220 ? r : `${r.slice(0, 217)}...`;
}
function xo(n = {}) {
  const e = Po(n.cacheStatus || n.status), r = Math.max(0, Number(n.cachedAt) || 0);
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
function Yn(n = {}) {
  const e = n && typeof n == "object" ? { ...n } : {}, r = Io(!F(e.stats) && (Array.isArray(e.hourlySeries) || Object.prototype.hasOwnProperty.call(e, "todayRequests") || Object.prototype.hasOwnProperty.call(e, "todayTraffic")) ? e : F(e.stats) ? e.stats : {}), t = F(e.runtimeStatus) ? { ...e.runtimeStatus } : {}, a = F(e.cacheMeta) ? e.cacheMeta : {}, o = xo({
    cacheStatus: a.cacheStatus || r.cacheStatus || "live",
    cachedAt: a.cachedAt,
    expiresAt: a.expiresAt,
    updatedAt: a.updatedAt,
    generatedAt: a.generatedAt || r.generatedAt || "",
    warning: a.warning,
    partial: a.partial === !0
  });
  return r.cacheStatus = Po(r.cacheStatus || o.cacheStatus), {
    stats: r,
    runtimeStatus: t,
    cacheMeta: o
  };
}
function Jr(n = {}, e = "live", r = {}) {
  const t = Yn(n), a = Po(e || t.cacheMeta.cacheStatus);
  return {
    stats: Io({
      ...t.stats,
      cacheStatus: a
    }),
    runtimeStatus: F(t.runtimeStatus) ? { ...t.runtimeStatus } : {},
    cacheMeta: xo({
      ...t.cacheMeta,
      ...r,
      cacheStatus: a,
      generatedAt: String(r.generatedAt || t.cacheMeta.generatedAt || t.stats.generatedAt || "").trim()
    })
  };
}
function Em(n) {
  !n || typeof n != "object" || (n.pendingSnapshot = null, n.scheduledFlushAt = 0, n.waitUntilCtx = null);
}
function ra(n) {
  const e = oe.PlaybackProgressRelay;
  if (!(e instanceof Map)) return !1;
  const r = e.get(n);
  return r && Em(r), e.delete(n);
}
function Ss(n, e) {
  const r = oe.PlaybackProgressRelay;
  return r instanceof Map && xe(r, n, e, Math.max(1, Number(O.Defaults.VideoProgressForwardSessionMax) || 1)), e;
}
function fr(n, e = "/") {
  const r = Ze(n) ? new URL(n.targetUrl.toString()) : n instanceof URL ? new URL(n.toString()) : new URL(String(n || "")), t = Ze(n) ? n.normalizedBasePath : Lt(r.pathname), a = Z(e);
  return r.pathname = (a === "/" ? t ? `${t}/` : "/" : `${t}${a}`) || "/", r.search = "", r.hash = "", r;
}
var Am = /* @__PURE__ */ new Set(["emby", "mediabrowser"]);
function _s(n = "/") {
  return Z(n).split("/").filter(Boolean);
}
function Cm(n = "/", e = "") {
  const r = Z(n), t = String(e || "").trim();
  if (!t || t === "/") return null;
  const a = r.toLowerCase(), o = t.toLowerCase();
  return a !== o && !a.startsWith(`${o}/`) ? null : Z(r.slice(t.length) || "/");
}
function Tm(n = "/", e = "") {
  const r = _s(e), t = _s(n);
  if (!r.length || !t.length) return null;
  const a = String(r[r.length - 1] || "").toLowerCase(), o = String(t[0] || "").toLowerCase();
  return !a || a !== o || !Am.has(a) ? null : Z(`/${t.slice(1).join("/")}` || "/");
}
function yc(n, e = "/") {
  const r = Ze(n) ? n : un(n);
  if (!r) return null;
  const t = Z(e), a = r.normalizedBasePath;
  let o = t;
  if (a) {
    const s = Cm(t, a);
    if (s !== null) o = s;
    else {
      const i = Tm(t, a);
      i !== null && (o = i);
    }
  }
  return fr(r, o);
}
function wm(n, e = "/", r = "") {
  if (!Ze(n)) {
    const s = fr(n, e);
    return s.search = Jo(r), s.toString();
  }
  const t = Z(e), a = Jo(r), o = n.absoluteBasePrefix || n.originText;
  return `${(t === "/" ? `${o}/` : `${o}${t}`) || `${n.originText}/`}${a}`;
}
function Ta(n, e) {
  try {
    const r = n instanceof URL ? new URL(n.toString()) : new URL(String(n || "")), t = e instanceof URL ? new URL(e.toString()) : new URL(String(e || ""));
    if (r.origin !== t.origin) return {
      resolvedUrl: r,
      proxyPath: null
    };
    const a = Lt(t.pathname);
    let o = r.pathname || "/";
    if (a) if (o === a || o === `${a}/`) o = "/";
    else if (o.startsWith(`${a}/`)) o = o.slice(a.length);
    else return {
      resolvedUrl: r,
      proxyPath: null
    };
    return {
      resolvedUrl: r,
      proxyPath: Z(o)
    };
  } catch {
    return {
      resolvedUrl: null,
      proxyPath: null
    };
  }
}
function bs(n, e, r, t, a = {}) {
  try {
    const { resolvedUrl: o, proxyPath: s } = Ta(n, e);
    return o ? s ? `${yt(r, t, a)}${s === "/" ? "/" : s}${o.search}${o.hash}` : o.toString() : null;
  } catch {
    return null;
  }
}
function Sc(n = "") {
  const e = Z(n), r = e.toLowerCase();
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
  return t <= 0 ? "" : Lt(e.slice(0, t));
}
function Oo(n = "", e = "") {
  const r = Z(n), t = Lt(e);
  if (!t) return r;
  const a = r.toLowerCase(), o = t.toLowerCase();
  return a === o ? "/" : a.startsWith(`${o}/`) ? Z(r.slice(t.length) || "/") : r;
}
function Jn(n = "", e = "") {
  const r = Lt(e);
  if (!r) return Z(n);
  let t = Z(n);
  for (; ; ) {
    if (t === r || t === `${r}/`) return "/";
    if (!t.startsWith(`${r}/`)) return t;
    t = Z(t.slice(r.length) || "/");
  }
}
function Dm(n = "", e = null, r = "") {
  let t = Z(n);
  return t = Jn(t, r), t = Jn(t, e instanceof URL ? e.pathname : "/"), t;
}
function Nm(n = "", e = "", r = null, t = null, a = "") {
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
    if (Lu(o)) {
      i = new URL(o, s || "https://playback-info.local/");
      const d = String(i.protocol || "").toLowerCase(), u = String(s?.origin || "").trim().toLowerCase();
      if (!["http:", "https:"].includes(d) || !u || i.origin.toLowerCase() !== u) return null;
    } else i = new URL(o, "https://playback-info.local/");
  } catch {
    return null;
  }
  const c = Dm(i.pathname || "/", r, a), l = Oo(c, Sc(c));
  return fa(l) ? {
    proxyPath: Z(l),
    search: i.search || "",
    hash: i.hash || ""
  } : null;
}
function Lm(n = "", e = "", r = null) {
  let t = Z(n);
  const a = Sc(e);
  if (a) {
    const d = Jn(t, a);
    d !== t && fa(d) && (t = d);
  }
  const o = Lt(r instanceof URL ? r.pathname : "/");
  if (!a || !o) return t;
  const s = `${a}${o}`, i = t.toLowerCase(), c = s.toLowerCase();
  if (i !== c && !i.startsWith(`${c}/`)) return t;
  const l = Z(`${a}${t.slice(s.length) || "/"}`);
  return fa(l) ? l : t;
}
function Mm(n = "") {
  return zt(n) === "rewrite" ? "relative" : "";
}
function _c(n) {
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
function Im(n = "/", e = null) {
  const r = Z(e instanceof URL ? e.pathname : n), t = new URLSearchParams(e instanceof URL ? e.search : String(e || ""));
  for (; t.has(Kn); ) t.delete(Kn);
  const a = t.toString();
  return `${r}${a ? `?${a}` : ""}`;
}
function yt(n, e, r = {}) {
  const t = Yd(r?.linkVariant), a = t ? "/" + encodeURIComponent(t) : "";
  if (Je(r?.entryMode)) return a;
  const o = encodeURIComponent(String(n || "")), s = e ? "/" + encodeURIComponent(String(e)) : "";
  return "/" + o + s + a;
}
function bc(n, e, r, t = "/", a = {}) {
  const o = n instanceof URL ? new URL(n.toString()) : new URL(String(n || "")), s = Z(t), i = new URL(o.origin);
  return i.pathname = `${yt(e, r, {
    linkVariant: a.linkVariant,
    entryMode: a.entryMode
  })}${s === "/" ? "/" : s}`, i.search = String(a.search || ""), i.hash = String(a.hash || ""), i;
}
function Pm(n, e, r, t, a = {}) {
  const o = t instanceof URL ? new URL(t.toString()) : new URL(String(t || "")), s = new URL(n instanceof URL ? n.origin : String(n || ""));
  return s.pathname = `${yt(e, r, {
    linkVariant: a.linkVariant,
    entryMode: a.entryMode
  })}/${Ei}${o.pathname || "/"}`, s.search = o.search || "", s.searchParams.append(Ai, Ka(o.toString())), s.hash = "", s;
}
function xm(n = "", e = "", r = "", t = {}) {
  let a = Z(n);
  const o = String(e || "").trim();
  if (!o && !Je(t?.entryMode)) return a;
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
      const l = Oo(a, c);
      if (l !== a) {
        a = l, i = !0;
        break;
      }
    }
  }
  return a;
}
function Om(n = null) {
  const e = String(n?.routeContextDiagnostics?.routeKind || "").trim();
  return e !== "host_prefix_path_compat" && e !== "legacy_host_prefix_path_compat" ? "" : yt(n?.nodeName, n?.nodeKey, {
    linkVariant: n?.linkVariant,
    entryMode: "kv_route"
  });
}
function vm(n = "", e = "") {
  const r = Z(n), t = Lt(e);
  if (!t || t === "/") return r;
  const a = r.toLowerCase(), o = t.toLowerCase();
  return a === o || a.startsWith(`${o}/`) ? r : `${t}${r === "/" ? "/" : r}`;
}
function Fm(n = "", e = null) {
  const r = Z(n), t = `/${Ei}`;
  if (!r.startsWith(t)) return null;
  const a = e instanceof URL && [...e.searchParams.getAll("__pb_target")].pop() || "";
  if (!a) return { error: "missing_target" };
  let o;
  try {
    o = new URL(za(a));
  } catch {
    return { error: "invalid_target" };
  }
  return ["http:", "https:"].includes(String(o.protocol || "").toLowerCase()) ? {
    targetUrl: o,
    visibleProxyPath: Z(r.slice(t.length) || "/")
  } : { error: "unsupported_target" };
}
function Rs(n = "", e = null, r = "") {
  const t = Z(n), a = t.search(/https?:\/\//i);
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
  const i = Lt(r), c = Z(s.pathname || "/"), l = i ? Oo(c, i) : c;
  if (i && l === c && c.toLowerCase() !== i.toLowerCase()) return null;
  const d = Z(t.slice(0, a) || "/"), u = [l];
  if (d !== "/") {
    const f = d.toLowerCase(), m = l.toLowerCase();
    m !== f && !m.startsWith(`${f}/`) && u.unshift(Z(`${d}${l === "/" ? "/" : l}`));
  }
  for (const f of u)
    if (fa(Z(ta(f).remaining || f)))
      return {
        kind: "embedded_absolute",
        originalPath: t,
        normalizedPath: Z(f),
        embeddedUrl: s.toString()
      };
  return null;
}
function Qa(n) {
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
function Rc(n) {
  const e = [];
  for (const [r, t] of n.entries()) e.push(t === "" ? r : `${r}=${t}`);
  return e.join("; ");
}
function vo(n, e = []) {
  const r = new Set((Array.isArray(e) ? e : [e]).map((a) => String(a || "").trim().toLowerCase()).filter(Boolean)), t = Qa(n);
  if (r.size > 0)
    for (const a of [...t.keys()]) r.has(String(a).trim().toLowerCase()) && t.delete(a);
  return Rc(t) || null;
}
function Um(n, e, r = ["auth_token"]) {
  const t = new Set(r.map((s) => String(s || "").trim().toLowerCase()).filter(Boolean)), a = Qa(n);
  for (const s of [...a.keys()]) t.has(String(s).trim().toLowerCase()) && a.delete(s);
  const o = Qa(e);
  for (const [s, i] of o.entries())
    t.has(String(s).trim().toLowerCase()) || a.set(s, i);
  return Rc(a) || null;
}
function Es(n = "") {
  const e = Z(n).split("/").filter(Boolean);
  if (e.length === 0) return !1;
  const r = Dt(e[0]).toLowerCase();
  return pd.has(r);
}
async function Hm(n = "", e = "", r = null, t = {}) {
  const a = String(n || "").trim().toLowerCase(), o = ee(e), s = String(r?.JWT_SECRET || "").trim();
  if (!a || !o || !s) return "";
  const i = Math.max(0, Math.floor(Number(t.nowMs ?? K()) / 1e3)), c = Math.max(1, Math.trunc(Number(t.maxAgeSec) || 86400)), l = Ka(JSON.stringify({
    v: 1,
    node: a,
    host: o,
    iat: i,
    exp: i + c
  }));
  if (!l) return "";
  const d = await Yt(s, l);
  return d ? `${l}.${d}` : "";
}
async function km(n = "", e = null, r = {}) {
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
  const s = t.slice(0, o), i = t.slice(o + 1), c = await Yt(a, s);
  if (!c || i !== c) return {
    ok: !1,
    reason: "bad_signature"
  };
  let l = null;
  try {
    l = JSON.parse(za(s));
  } catch {
    return {
      ok: !1,
      reason: "malformed_payload"
    };
  }
  const d = {
    v: Number(l?.v) || 0,
    node: String(l?.node || "").trim().toLowerCase(),
    host: ee(l?.host || ""),
    iat: Math.max(0, Math.floor(Number(l?.iat) || 0)),
    exp: Math.max(0, Math.floor(Number(l?.exp) || 0))
  };
  if (d.v !== 1 || !d.node || !d.host || !d.iat || !d.exp || d.exp <= d.iat) return {
    ok: !1,
    reason: "invalid_payload",
    payload: d
  };
  const u = ee(r.requestHost || "");
  if (u && d.host !== u) return {
    ok: !1,
    reason: "host_mismatch",
    payload: d
  };
  const f = Math.max(0, Math.floor(Number(r.nowMs ?? K()) / 1e3));
  return d.exp <= f ? {
    ok: !1,
    reason: "expired",
    payload: d
  } : {
    ok: !0,
    payload: d
  };
}
function Km(n = "") {
  const e = String(n || "").trim();
  return e ? `${So}=${e}; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=${md}` : Ec();
}
function Ec() {
  return `${So}=; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=0; Expires=Thu, 01 Jan 1970 00:00:00 GMT`;
}
function yn(n = "GET", e = null) {
  const r = e ? new Headers(e) : new Headers();
  return r.set("Content-Type", "text/plain; charset=utf-8"), r.set("Cache-Control", "no-store, max-age=0"), Ce(r), r.get("Access-Control-Allow-Origin") !== "*" && xr(r, "Origin"), new Response(n === "HEAD" ? null : "Not Found", {
    status: 404,
    headers: r
  });
}
function wa(n = "") {
  return String(n || "").trim().toLowerCase().replace(/[^a-z0-9]+/g, "");
}
var Ac = /* @__PURE__ */ new Set([
  "authorization",
  "x-emby-authorization",
  "x-mediabrowser-authorization"
]), zm = /* @__PURE__ */ new Set(["x-emby-token", "x-mediabrowser-token"]), $m = /* @__PURE__ */ new Set(["x-emby-device-id", "x-mediabrowser-device-id"]), Cc = /* @__PURE__ */ new Set([
  ...Ac,
  ...zm,
  ...$m
]);
function Sn(n) {
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
function Tc(n = "") {
  const e = String(n || "").trim().toLowerCase();
  return !e || Cc.has(e) || e === "cookie" ? !1 : e.includes("authorization") || e.includes("api-key") || e.includes("apikey") || e.includes("access-key") || e.includes("accesskey") || e.includes("access-token") || e.includes("accesstoken") || e.includes("session") || e.includes("credential") || e.includes("signature") || e.includes("secret") || e.includes("auth") || e.includes("token");
}
var wc = /* @__PURE__ */ new Set([
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
]), Dc = "identity-http-v2", Bm = Object.freeze([
  "Range",
  "If-None-Match",
  "If-Modified-Since"
]), Wm = [
  /^\/Videos\/[^/]+\/(?:main|master|stream)\.m3u8$/i,
  /^\/Videos\/[^/]+\/(?:manifest|main|master|stream)\.mpd$/i,
  /^\/Audio\/[^/]+\/(?:main|master|stream)\.m3u8$/i
], Vm = /* @__PURE__ */ new Set([
  "mediasourceid",
  "static",
  "tag",
  "audiostreamindex",
  "subtitlestreamindex",
  "subtitlemethod",
  "starttimeticks"
]);
function Nc(n = "") {
  return wc.has(wa(n));
}
function Gm(n) {
  const e = n instanceof URL ? new URL(n.toString()) : new URL(String(n || ""));
  e.hash = "";
  const r = [];
  for (const [t, a] of e.searchParams.entries())
    Nc(t) || r.push([t, a]);
  r.sort((t, a) => {
    const o = t[0].localeCompare(a[0]);
    return o !== 0 ? o : String(t[1]).localeCompare(String(a[1]));
  }), e.search = "";
  for (const [t, a] of r) e.searchParams.append(t, a);
  return e;
}
function Lc(n) {
  const e = n instanceof Request ? new URL(n.url) : new URL(String(n || "")), r = [];
  for (const [s, i] of e.searchParams.entries()) {
    const c = wa(s);
    wc.has(c) && r.push([c, String(i)]);
  }
  r.sort((s, i) => {
    const c = s[0].localeCompare(i[0]);
    return c !== 0 ? c : s[1].localeCompare(i[1]);
  });
  const t = n instanceof Request ? n.headers : new Headers(), a = [];
  for (const [s, i] of t.entries()) {
    const c = String(s || "").trim().toLowerCase();
    !c || !Cc.has(c) && !Tc(c) || a.push([c, String(i)]);
  }
  const o = vo(t.get("Cookie") || "", ["auth_token", ...sn]);
  return o && a.push(["cookie", o]), a.sort((s, i) => {
    const c = s[0].localeCompare(i[0]);
    return c !== 0 ? c : s[1].localeCompare(i[1]);
  }), {
    queryEntries: r,
    headerEntries: a
  };
}
function jm(n) {
  const e = Lc(n);
  return e.queryEntries.length > 0 || e.headerEntries.length > 0;
}
async function Mc(n) {
  const e = Lc(n), r = await Pn().digest("SHA-256", new TextEncoder().encode(se(e)));
  return [...new Uint8Array(r)].map((t) => t.toString(16).padStart(2, "0")).join("");
}
async function qm(n, e) {
  return await Mc(new Request(e instanceof URL ? e.toString() : String(e || ""), { headers: n.headers }));
}
function Ic(n = "", e = {}) {
  const r = ht.test(String(n || ""));
  return ce(`${Dc}:${r ? "manifest" : "asset"}:${r ? Math.max(0, Number(e.prewarmCacheTtl) || 0) : Math.max(0, Number(e.imageCacheMaxAge) || 0)}`);
}
function Xm(n, e) {
  if (!(n instanceof Request) || !(e instanceof Request) || e.headers.has("If-Range")) return null;
  const r = new Headers();
  for (const t of Bm) {
    const a = e.headers.get(t);
    a && r.set(t, a);
  }
  return new Request(n.url, {
    method: "GET",
    headers: r
  });
}
function Ym(n = "") {
  const e = String(n || ""), r = /\/(?:Videos|Audio)\/.+$/i.exec(e);
  return r ? r[0] : e;
}
function Jm(n) {
  try {
    return new Request(Gm(n).toString(), { method: "GET" });
  } catch {
    return null;
  }
}
function Qm(n = {}) {
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
function Qn(n = "", e = {}) {
  const r = String(n || "").trim().toLowerCase(), t = er(e?.entryMode), a = Sn(e?.headers).map(([o, s]) => [String(o || "").trim().toLowerCase(), String(s ?? "").trim()]).filter(([o]) => !!o).sort((o, s) => {
    const i = o[0].localeCompare(s[0]);
    return i !== 0 ? i : o[1].localeCompare(s[1]);
  });
  return ce(se({
    nodeName: r,
    entryMode: t,
    secret: t === "host_prefix" ? "" : String(e?.secret || "").trim(),
    tags: Fr(e?.tags, e?.tag),
    remark: String(e?.remark || "").trim(),
    activeLineId: String(e?.activeLineId || "").trim(),
    orderedTargets: Qm(e),
    headers: a,
    playbackInfoMode: String(e?.playbackInfoMode || "").trim().toLowerCase(),
    mediaAuthMode: String(e?.mediaAuthMode || "").trim().toLowerCase(),
    realClientIpMode: String(e?.realClientIpMode || "").trim().toLowerCase(),
    routingDecisionMode: String(e?.routingDecisionMode || "").trim().toLowerCase(),
    mainVideoStreamMode: String(e?.mainVideoStreamMode || e?.wangpanDirectMode || e?.wangpanMode || "").trim().toLowerCase()
  }));
}
function Pc(n = []) {
  const e = /* @__PURE__ */ new Set();
  for (const r of Array.isArray(n) ? n : [n]) {
    const t = String(r || "").trim().toLowerCase();
    t && e.add(t);
  }
  return e;
}
function xc(n = []) {
  const e = Pc(n);
  if (!e.size) return;
  const r = oe.PlaybackInfoResponseCache;
  if (r instanceof Map) for (const [t, a] of r.entries()) {
    const o = String(a?.nodeName || "").trim().toLowerCase();
    e.has(o) && r.delete(t);
  }
}
function Oc(n = []) {
  const e = Pc(n);
  if (!e.size) return;
  const r = oe.PlaybackProgressRelay;
  if (!(!(r instanceof Map) || r.size <= 0))
    for (const [t, a] of r.entries()) {
      const o = String(a?.nodeName || a?.pendingSnapshot?.nodeName || "").trim().toLowerCase();
      !o || !e.has(o) || ra(t);
    }
}
function vc(n, e, r, t = "/", a = {}) {
  try {
    const o = String(a.identityPartition || "").trim(), s = String(a.cachePolicyRevision || "").trim();
    if (!o || !s) return null;
    const i = n instanceof URL ? new URL(n.toString()) : new URL(String(n || "")), c = Z(t), l = new URL(i.origin);
    l.pathname = `${yt(e, r, {
      linkVariant: "main",
      entryMode: a.entryMode
    })}${c === "/" ? "/" : c}`, l.search = String(a.search || "");
    const d = String(a.nodeCacheRevision || "").trim();
    return d && l.searchParams.set("__proxyrev", d), l.searchParams.set("__metadatarev", Dc), l.searchParams.set("__identity", o), l.searchParams.set("__policy", s), l.hash = "", Jm(l);
  } catch {
    return null;
  }
}
function Zm(n) {
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
function ep(n) {
  try {
    const e = n instanceof URL ? new URL(n.toString()) : new URL(String(n || "")), r = Ym(e.pathname || "");
    if (!ht.test(r) || Zm(e) || !Wm.some((t) => t.test(r))) return !1;
    for (const [t] of e.searchParams.entries())
      if (!Nc(t) && !Vm.has(wa(t)))
        return !1;
    return !0;
  } catch {
    return !1;
  }
}
function Zn(n) {
  try {
    const e = n instanceof URL ? new URL(n.toString()) : new URL(String(n || "")), r = e.pathname || "";
    return zr.test(r) || Kr.test(r) || dr.test(r) ? !0 : ht.test(r) ? ep(e) : !1;
  } catch {
    return !1;
  }
}
function tp(n = "") {
  const e = String(n || "").toLowerCase();
  return e ? /\.(?:mp4|m4v|mkv|mov|avi|wmv|flv|ts|m4s)(?:$|[?#])/.test(e) ? !0 : ht.test(e) || dr.test(e) ? !1 : /\/videos\/[^/]+\/(?:stream|original|download|file)\b/.test(e) || /\/items\/[^/]+\/download\b/.test(e) : !1;
}
function eo(n, e = /* @__PURE__ */ new Set(), r = 0) {
  if (n == null || r > 5) return e;
  if (typeof n == "string") {
    const t = n.trim();
    if (t && /^(?:https?:\/\/|\/)/i.test(t)) {
      const a = t.toLowerCase(), o = a.split(/[?#]/, 1)[0] || a;
      (ht.test(o) || dr.test(o) || zr.test(a) || Kr.test(o)) && e.add(t);
    }
    return e;
  }
  return Array.isArray(n) ? (n.slice(0, 24).forEach((t) => eo(t, e, r + 1)), e) : (typeof n == "object" && Object.values(n).slice(0, 32).forEach((t) => eo(t, e, r + 1)), e);
}
function rp(n = "") {
  const e = /^\/Items\/([^/]+)(?:\/|$)/i.exec(String(n || ""));
  return e ? Dt(e[1]) : "";
}
function As(n = "") {
  const e = String(n || "").toLowerCase();
  return zr.test(e) || Kr.test(e) ? 0 : ht.test(e) ? 1 : dr.test(e) ? 2 : 3;
}
function ap(n = {}, e = {}) {
  const { D1TidyExecutor: r, D1TidyPlanner: t, Logger: a, buildAdminReleaseVendorManifest: o, normalizeAdminReleaseVendorManifestRecord: s, validateAdminShellHtmlSource: i } = n;
  return {
    async createKvTidyPlanToken(c, l = {}, d = {}) {
      const u = String(c?.JWT_SECRET || "").trim();
      if (!u) {
        const g = /* @__PURE__ */ new Error("JWT_SECRET is required to sign the KV tidy plan");
        throw g.code = "SERVER_MISCONFIGURED", g.status = 503, g;
      }
      const f = Math.max(0, Math.floor(Number(d.nowMs ?? K()) / 1e3)), m = f + Math.max(60, Math.floor(Number(d.ttlMs) || 6e5) / 1e3), p = Ka(JSON.stringify({
        version: 1,
        scope: "kv",
        planHash: String(l?.planHash || e.buildKvTidyPlanHash(l)).trim(),
        issuedAt: f,
        expiresAt: m
      }));
      return `${p}.${await Yt(u, p)}`;
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
      if (f.slice(m + 1) !== await Yt(u, p)) {
        const y = /* @__PURE__ */ new Error("KV tidy plan token signature is invalid");
        throw y.code = "TIDY_PLAN_INVALID", y.status = 409, y;
      }
      let g = null;
      try {
        g = JSON.parse(za(p));
      } catch {
        g = null;
      }
      const h = Math.max(0, Math.floor(Number(d.nowMs ?? K()) / 1e3));
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
    async createD1TidyPlanToken(c, l = {}, d = {}) {
      const u = String(c?.JWT_SECRET || "").trim();
      if (!u) {
        const g = /* @__PURE__ */ new Error("JWT_SECRET is required to sign the D1 tidy plan");
        throw g.code = "SERVER_MISCONFIGURED", g.status = 503, g;
      }
      const f = Math.max(0, Math.floor(Number(d.issuedAtMs ?? K()) / 1e3)), m = f + Math.max(60, Math.floor(Number(d.ttlMs) || 6e5) / 1e3), p = Ka(JSON.stringify({
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
      return `${p}.${await Yt(u, p)}`;
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
      if (f.slice(m + 1) !== await Yt(u, p)) {
        const y = /* @__PURE__ */ new Error("D1 tidy plan token signature is invalid");
        throw y.code = "TIDY_PLAN_INVALID", y.status = 409, y;
      }
      let g = null;
      try {
        g = JSON.parse(za(p));
      } catch {
        g = null;
      }
      const h = Math.max(0, Math.floor(Number(d.nowMs ?? K()) / 1e3));
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
    async resolveKvTidyQuotaBudget(c, l = [], d = {}) {
      const u = d.kv || e.getKV(c), f = await Hu(te(d.config || {})), m = Math.max(1, Math.floor(Number(f?.kv?.write) || 0)), p = (Array.isArray(l) ? l : []).map((R) => ({
        type: String(R?.type || "put").trim().toLowerCase() === "delete" ? "delete" : "put",
        key: String(R?.key || "").trim()
      })).filter((R) => R.key), g = p.filter((R) => R.type === "put").length, h = p.filter((R) => R.type === "delete").length, y = u ? await e.captureRawKvEntries(u, p.map((R) => R.key)) : [], S = y.filter((R) => R?.exists === !0).length, _ = y.filter((R) => R?.exists !== !0).length, A = g + h + S + _, b = {
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
      return b.reason = b.blocked === !0 ? ku(b) : "", b;
    },
    async buildKvTidyPlan(c, l = {}) {
      const d = l.kv || e.getKV(c);
      if (!d) throw new Error("KV not configured");
      const u = (await e.listKvKeysStrict(d)).sort(), f = u.filter((ae) => ae.startsWith(e.ADMIN_INDEX_UPLOAD_PREFIX)), { rawStoredSummaryIndexText: m, storedSummaryIndexState: p, previousFullIndexBytes: g } = await e.readStoredNodesSummaryState(d), { nodeNames: h, removableKeys: y, untouchedOtherKeyCount: S, opsStatusKeyCount: _, dnsRecordHistoryKeyCount: A, dnsIpPoolSourceKeyCount: b, configMetaKeyCount: R, snapshotMetaKeyCount: E, nodeIndexMetaKeyCount: w, telegramAlertStateKeyCount: D, loginFailureKeyCount: C, dnsFetchLockKeyCount: T } = await e.classifyKvTidyKeys(d, u), I = await e.readRepairableRuntimeConfig(d), x = F(I.rawConfig) ? I.rawConfig : {}, U = Ki(x);
      let k = U.cleanedConfig;
      const G = [...U.migratedConfigKeys], P = await e.captureRawKvEntries(d, [
        e.CONFIG_KEY,
        e.NODES_INDEX_KEY,
        e.NODES_SUMMARY_INDEX_KEY
      ]), N = String(P.find((ae) => ae?.key === e.NODES_INDEX_KEY)?.value || ""), { nextTidyConfig: L, rewrittenNodes: M, fullEntityNodes: v, rewrittenNodeCount: W, deletedLegacyNodeFieldCount: $, migratedTopLevelPortNodeCount: H, migratedLinePortCount: j, migratedDefaultPortNodeCount: ne, migratedDefaultPortLineCount: fe, rollbackKvEntries: me } = await e.collectKvTidyNodeMutations(d, h, k, P), le = se(k) !== se(L);
      le && (k = L, G.push("sourceDirectNodes"));
      const pe = await e.readStoredConfigSnapshotsStrict(d), [Oe, Be] = await Promise.all([e.readRevisionMetaForRead(d, e.CONFIG_META_KEY), e.readRevisionMetaForRead(d, e.CONFIG_SNAPSHOTS_META_KEY, { count: 0 })]), Mt = {
        configRevision: String(Oe?.revision || ""),
        configContentHash: ce(se(x)),
        snapshotsRevision: String(Be?.revision || ""),
        snapshotsContentHash: ce(se(pe))
      }, { rewrittenSnapshots: rt, rewrittenSnapshotCount: It, deletedLegacySnapshotFieldCount: Pt, migratedConfigKeys: Gr } = e.rewriteKvTidySnapshots(pe);
      G.push(...Gr);
      const xt = I.hadMalformedValue || se(x) !== se(k), mr = e.buildKvTidyNoteParts({
        legacyKeysPresent: U.legacyKeysPresent,
        rewrittenSnapshotCount: It,
        rewrittenNodeCount: W,
        migratedTopLevelPortNodeCount: H,
        migratedLinePortCount: j,
        migratedDefaultPortNodeCount: ne,
        migratedDefaultPortLineCount: fe
      }, {
        includeRepairSource: !0,
        repairLabel: "repair_source",
        repairedConfig: I
      }), Ot = Bn(I.config, k), at = [];
      Ot.length > 0 && at.push(e.createSyntheticConfigSnapshot(I.config, {
        reason: "tidy_kv_data",
        section: "all",
        source: "kv_tidy",
        actor: "admin",
        note: mr.join("; ") || (I.hadMalformedValue ? "repair_malformed_sys_config" : "sanitize_runtime_config")
      }, {
        changedKeys: Ot.map((ae) => ae.key),
        changeCount: Ot.length
      })), rt.length > 0 && at.push(...rt);
      const jr = at.length > 0 ? at : pe, pr = e.collectUnreferencedAdminIndexUploadKeys(k, jr, f);
      for (const ae of pr) y.add(ae);
      const nt = e.normalizeNodeSummaryIndex(v).nodes, ot = e.normalizeNodeIndex(nt.map((ae) => ae?.name)), Vt = JSON.stringify(ot), _t = JSON.stringify(nt), bt = new TextEncoder().encode(_t).length, gr = g - bt, Gt = e.buildLegacyConfigCacheKeys(I.config, k), Le = [...y].sort(), qr = [.../* @__PURE__ */ new Set([...Gt, ...Le])].filter(Boolean).sort(), We = [];
      at.length > 0 && We.push({
        type: "put",
        key: e.CONFIG_SNAPSHOTS_KEY,
        value: JSON.stringify(at)
      }), xt && We.push({
        type: "put",
        key: e.CONFIG_KEY,
        value: JSON.stringify(k)
      });
      for (const ae of M) We.push({
        type: "put",
        key: `${e.PREFIX}${ae.name}`,
        value: JSON.stringify(ae.data)
      });
      N !== Vt && We.push({
        type: "put",
        key: e.NODES_INDEX_KEY,
        value: Vt
      }), m !== _t && We.push({
        type: "put",
        key: e.NODES_SUMMARY_INDEX_KEY,
        value: _t
      });
      for (const ae of qr) We.push({
        type: "delete",
        key: ae,
        value: ""
      });
      const z = await e.resolveKvTidyQuotaBudget(c, We, {
        kv: d,
        config: k
      }), V = {
        scannedKeyCount: u.length,
        preservedNodeKeyCount: h.length,
        rebuiltNodeCount: ot.length,
        rewrittenNodeCount: W,
        configWasMalformed: I.hadMalformedValue,
        configReadSource: I.source,
        configRewritten: xt,
        migratedConfigKeys: Et(G),
        rewrittenSnapshotCount: It,
        deletedLegacyFieldCount: U.deletedLegacyFieldCount + Pt + $,
        deletedLegacyConfigFieldCount: U.deletedLegacyFieldCount,
        deletedLegacyNodeFieldCount: $,
        deletedLegacySnapshotFieldCount: Pt,
        migratedTopLevelPortNodeCount: H,
        migratedLinePortCount: j,
        migratedDefaultPortNodeCount: ne,
        migratedDefaultPortLineCount: fe,
        deletedKeyCount: Le.length,
        deletedCacheKeyCount: Le.filter((ae) => ae === "sys:cf_dash_cache" || ae.startsWith("sys:cf_dash_cache:")).length,
        deletedScheduledLockKeyCount: Le.filter((ae) => ae === e.LEGACY_SCHEDULED_LOCK_KEY).length,
        deletedLoginFailureKeyCount: C,
        deletedDnsIpPoolSourceKeyCount: b,
        deletedOpsStatusKeyCount: _,
        deletedTelegramAlertStateKeyCount: D,
        deletedDnsFetchLockKeyCount: T,
        deletedAdminIndexUploadCount: pr.length,
        untouchedOtherKeyCount: S,
        rawSnapshotCount: pe.length,
        previousFullIndexBytes: g,
        nextSummaryIndexBytes: bt,
        savedBytes: gr
      }, q = Cu({
        configFieldTargets: V.migratedConfigKeys,
        rewrittenSnapshotCount: It,
        sourceDirectNodesFromLegacyNodes: le,
        migratedTopLevelPortNodeCount: H,
        migratedLinePortCount: j,
        migratedDefaultPortNodeCount: ne,
        migratedDefaultPortLineCount: fe
      }), X = [], Y = Le.filter((ae) => ae === "sys:cf_dash_cache" || ae.startsWith("sys:cf_dash_cache:")), re = Le.filter((ae) => ae.startsWith("fail:")), ge = Le.filter((ae) => ae === e.LEGACY_DNS_IP_POOL_SOURCES_KEY), ve = Le.filter((ae) => ae === e.LEGACY_OPS_STATUS_KEY || Object.values(e.LEGACY_OPS_STATUS_SECTION_KEYS).includes(ae)), ze = Le.filter((ae) => ae === e.LEGACY_TELEGRAM_ALERT_STATE_KEY), Me = Le.filter((ae) => ae === e.LEGACY_SCHEDULED_LOCK_KEY), Ve = Le.filter((ae) => ae.startsWith(Wf)), Rt = Le.filter((ae) => ae.startsWith(e.ADMIN_INDEX_UPLOAD_PREFIX));
      rt.map((ae) => ae?.id);
      const st = M.map((ae) => ae.name);
      Ee(X, Y.length > 0, "cf_dash_cache", "Cloudflare 仪表盘缓存", Y, Y.length, "会删除遗留的 sys:cf_dash_cache 及其按日期 / Zone 生成的缓存键。"), Ee(X, re.length > 0, "login_failures", "旧版登录失败计数", re, re.length, "会删除旧版 fail:* 登录失败计数键，后续仅保留 D1 auth_failures。"), Ee(X, ge.length > 0, "dns_ip_pool_sources", "旧版 DNS IP 池源配置", ge, ge.length, "会删除旧版 sys:dns_ip_pool_sources:v1，后续只保留 D1 dns_ip_pool_sources。"), Ee(X, ve.length > 0, "ops_status", "旧版运维状态键", ve, ve.length, "会删除 sys:ops_status:v1 与 sys:ops_status:*，后续只保留 D1 sys_status。"), Ee(X, ze.length > 0, "telegram_alert_state", "旧版 Telegram 告警冷却状态", ze, ze.length, "会删除 sys:telegram_alert_state:v1，后续只保留 D1 sys_status scope。"), Ee(X, Me.length > 0, "scheduled_lock", "旧版定时租约键", Me, Me.length, "会删除 sys:scheduled_lock:v1，后续只保留 D1 sys_locks。"), Ee(X, Ve.length > 0, "dns_fetch_lock", "旧版 DNS 抓取锁键", Ve, Ve.length, "会删除 sys:dns_ip_pool_fetch_lock:v1:*，后续只保留 D1 sys_locks。"), Ee(X, Rt.length > 0, "admin_index_uploads", "未引用的本地 HTML 版本", Rt, Rt.length, "只删除当前配置和保留快照都不再引用的内容寻址 index.html。");
      const hr = [];
      if (xt && Ee(hr, !0, "runtime_config", "全局设置 sys:theme", [...U.legacyKeysPresent, ...Ot.map((ae) => ae.key)], 1, "会把旧版设置字段吸收到当前 schema，并以后端 sanitizeRuntimeConfig() 结果回写。"), W > 0) {
        const ae = [];
        H > 0 && ae.push(`旧版顶层 node.port 节点 ${H} 个`), j > 0 && ae.push(`旧版 lines[].port 线路 ${j} 条`), ne > 0 && ae.push(`隐式默认端口节点 ${ne} 个`), fe > 0 && ae.push(`按协议补齐默认端口线路 ${fe} 条`), Ee(hr, !0, "node_entities", "节点实体 node:* 标准化重写", st, W, ae.length ? `会把端口并入 lines[].target，并移除旧版节点字段。${ae.join("，")}。` : "会移除旧版节点字段，并统一回写当前节点 schema。");
      }
      Ee(hr, !0, "node_indexes", "节点索引 / 节点摘要索引", [e.NODES_INDEX_KEY, e.NODES_SUMMARY_INDEX_KEY], 2, `会按当前 node:* 实体重新生成轻量 name 索引与节点摘要索引，并把旧镜像压缩收敛为摘要格式（${g} -> ${bt} bytes，节省 ${gr} bytes）。`);
      const Xr = [lt("node_entities_preserved", "node:* 节点实体", h, {
        count: h.length,
        note: "不会整批删除 node:*，只会按需重写必要节点。"
      })];
      A > 0 && Ee(Xr, !0, "dns_record_history", "DNS 历史记录", u.filter((ae) => ae.startsWith(e.DNS_RECORD_HISTORY_PREFIX)), A, "不会删除 sys:dns_record_history:v1:*。");
      const Da = R + E + w;
      Da > 0 && Ee(Xr, !0, "meta_keys", "配置 / 快照 / 索引元信息", [
        e.CONFIG_META_KEY,
        e.CONFIG_SNAPSHOTS_META_KEY,
        e.NODES_INDEX_META_KEY
      ], Da, "不会删除这些 revision / meta 键。");
      const it = [];
      I.hadMalformedValue && it.push(`检测到异常 sys:theme（来源: ${I.source}），整理时会按当前 schema 修复。`), H > 0 && it.push(`检测到 ${H} 个旧节点仍使用顶层 node.port；整理后会把端口并入 lines[].target。`), j > 0 && it.push(`检测到 ${j} 条旧线路仍使用独立 lines[].port；整理后会把端口并入 lines[].target。`), (ne > 0 || fe > 0) && it.push(`检测到 ${ne} 个节点 / ${fe} 条线路仍未显式写端口；整理后会按协议补齐为 :443 / :80。`), p?.legacyMirrorDetected === !0 && it.push(`检测到旧版 sys:nodes_index_full:v2 仍保存完整节点镜像；本次会按 node:* 重建并收敛为摘要索引（${g} -> ${bt} bytes）。`), S > 0 && it.push(`发现 ${S} 个未列入整理白名单的 KV 键，本次不会自动删除。`), X.length === 0 && !xt && It === 0 && W === 0 && it.push("当前没有检测到需要执行的 KV 清理动作；本次更多是一轮一致性巡检。"), it.push(Ku(z)), z.blocked === !0 && z.reason && it.push(z.reason);
      const _n = {
        scope: "kv",
        scannedKeys: u,
        config: k,
        nodesIndex: ot,
        rebuiltNodeSummaries: nt,
        revisions: Mt,
        summary: V,
        quotaBudget: z,
        mutationPlan: We,
        preview: {
          scope: "kv",
          quotaBudget: z,
          fieldGroups: q,
          deleteGroups: X,
          rewriteGroups: hr,
          preserveGroups: Xr,
          warnings: it
        }
      };
      return _n.planHash = e.buildKvTidyPlanHash(_n), _n;
    },
    async applyKvTidyPlan(c, l = {}) {
      const d = l.kv || e.getKV(l.env);
      if (!d) throw new Error("KV not configured");
      const u = Se(d), f = Array.isArray(c?.mutationPlan) ? c.mutationPlan : [];
      try {
        await e.applyKvMutationsWithRollback(d, f);
      } catch (m) {
        throw Ba(l.env), u.NodesListCache = null, u.NodesIndexCache = null, nr(d), ps(u), u.NodeCache.clear(), u.PlaybackRouteHotCache.clear(), m;
      }
      return Ba(l.env), ps(u), u.NodeCache.clear(), u.PlaybackRouteHotCache.clear(), Array.isArray(c?.nodesIndex) && c.nodesIndex.length > 0 && (xc(c.nodesIndex), Oc(c.nodesIndex)), e.primeNodeSummaryCaches(Array.isArray(c?.rebuiltNodeSummaries) ? c.rebuiltNodeSummaries : [], d), u.NodesIndexCache = {
        data: Array.isArray(c?.nodesIndex) ? c.nodesIndex : [],
        exp: K() + 6e4
      }, e.buildTidyResult(c, { ...c?.summary || {} }, "kv", {
        config: c?.config || {},
        nodesIndex: Array.isArray(c?.nodesIndex) ? c.nodesIndex : []
      });
    },
    async tidyKvData(c, l = {}) {
      return await al(l.kv || e.getKV(c))(async () => {
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
function np(n = {}, e = {}) {
  const { D1TidyExecutor: r, D1TidyPlanner: t, Logger: a, buildAdminReleaseVendorManifest: o, normalizeAdminReleaseVendorManifestRecord: s, validateAdminShellHtmlSource: i } = n;
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
      const d = F(c) ? c : {}, u = F(d.d1Tidy) ? d.d1Tidy : {};
      return je(F(l) ? l : F(d.cleanup) ? d.cleanup : {}, u);
    },
    buildD1TidyStatusPayload(c = {}, l = {}) {
      const d = String(l.mode || c.mode || "manual").trim().toLowerCase() === "scheduled" ? "scheduled" : "manual", u = ft(l.maintenanceMode || c.maintenanceMode, d), f = String(l.triggeredBy || (d === "scheduled" ? "scheduled" : "manual")).trim() || (d === "scheduled" ? "scheduled" : "manual"), m = String(l.timestamp || c.finishedAt || (/* @__PURE__ */ new Date()).toISOString()).trim() || (/* @__PURE__ */ new Date()).toISOString(), p = String(l.status || c.status || "success").trim() || "success", g = String(l.lastError || c.lastError || "").trim(), h = p === "failed" || p === "partial_failure", y = p === "skipped" || p === "deferred", S = {
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
      const f = F(c?.preview) ? c.preview : e.createEmptyTidyPreview(d);
      return {
        ...u,
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
      const d = l.db || e.getDB(c), u = l.kv || e.getKV(c) || null;
      if (!d) throw new Error("D1 not configured");
      const f = await e.getD1SchemaStatus(d), m = te(l.config || (c ? await Ae(c) : {})), p = t.buildContext(m, l), g = t.attachPreviousState(e, p, l.previousCleanupStatus);
      g.logQueuePendingCount = Ut.get(d).LogQueue.length;
      const h = await t.readFacts(e, d, u, g), y = t.buildSourcePolicy(h.d1DnsIpPoolSources), S = t.buildFlags(e, g, h, y), _ = t.buildSummary(g, h, y, S), A = f.schemaReady === !0;
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
      }), g = String(p?.mode || l.mode || "manual").trim().toLowerCase() === "scheduled" ? "scheduled" : "manual", h = ft(p?.maintenanceMode || l.maintenanceMode, g), y = F(p?.flags) ? p.flags : {}, S = typeof l.beforeEachStep == "function" ? l.beforeEachStep : async () => {
      }, _ = {
        kv: f,
        db: u
      }, A = g === "scheduled", b = r.createSummary(p, g, y);
      b.maintenanceMode = h;
      let R = !1;
      const E = (C, T, I, x) => {
        const U = I?.message || String(I);
        if (C && (b[C] = "failed"), T && (b[T] = U), b.lastError = U, b.status = b.status === "failed" ? "failed" : "partial_failure", console.error(`${x}: `, I), !A) throw I;
        return !1;
      };
      await S("bootstrapD1Schema"), await e.bootstrapD1Schema(u, "logs-core");
      const w = Ut.get(u);
      if (w.LogFlushTask && await Promise.resolve(w.LogFlushTask).catch(() => {
      }), d && w.LogQueue.length > 0 && (await S("flushLogQueue"), await a.flush(d).catch(() => {
      })), R = await r.runDeleteSteps(r.buildDeleteSteps(e, p, b, y, u), S) || R, g === "manual")
        y.rebuildStatsHourly === !0 ? (await S("rebuildStatsHourlyWindow"), await e.rebuildStatsHourlyWindow(u, {
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
          await S("rebuildDailyStatsHourly"), await e.rebuildStatsHourlyForDate(u, {
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
        await e.hasLogsFtsTable(u) ? C = await e.rebuildLogsFts(u) : C = (await e.ensureLogsFtsSchema(u)).rebuilt === !0, b.rebuiltLogsFts = C === !0, b.ftsRebuildStatus = C === !0 ? "success" : "skipped", b.lastFtsRebuildAt = (/* @__PURE__ */ new Date()).toISOString(), R = R || C === !0;
      } catch (C) {
        if (g === "scheduled") try {
          await S("rebuildLogsFtsForceRecreate");
          const T = await e.ensureLogsFtsSchema(u, { forceRecreate: !0 });
          b.rebuiltLogsFts = T.rebuilt === !0, b.ftsRebuildStatus = T.rebuilt === !0 ? "success" : "skipped", b.ftsRebuildRecovered = T.recreated === !0, b.ftsRebuildError = "", b.lastFtsRebuildAt = (/* @__PURE__ */ new Date()).toISOString(), R = R || T.rebuilt === !0, console.warn("Scheduled FTS rebuild recovered by recreating schema.");
        } catch (T) {
          E("ftsRebuildStatus", "ftsRebuildError", T, "Scheduled FTS rebuild Error");
        }
        else E("ftsRebuildStatus", "ftsRebuildError", C, "D1 logs FTS rebuild Error");
      }
      if (y.optimizeDb === !0) try {
        await S("optimizeLogsDb"), await e.optimizeLogsDb(u), b.optimizedDb = !0, b.optimizeStatus = "success", b.lastOptimizeAt = (/* @__PURE__ */ new Date()).toISOString(), R = !0;
      } catch (C) {
        E("optimizeStatus", "optimizeError", C, g === "scheduled" ? "Scheduled DB optimize Error" : "D1 optimize Error");
      }
      await S("patchLogStatus");
      const D = await r.patchLogStatus(e, u, _, p, b, y, l);
      if (b.status !== "partial_failure" && b.status !== "failed") if (g === "scheduled") {
        const C = y.rebuildLogsFtsDeferred === !0 || y.optimizeDbDeferred === !0;
        R ? b.status = "success" : (b.status = "skipped", b.reason = C ? "maintenance_deferred" : "no_expired_data");
      } else b.status = "success";
      return b.finishedAt = D, e.buildTidyResult(p, b, "d1");
    },
    async tidyD1Data(c, l = {}) {
      const d = String(l.mode || "manual").trim().toLowerCase() === "scheduled" ? "scheduled" : "manual", u = ft(l.maintenanceMode, d), f = l.db || e.getDB(c);
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
          maintenanceMode: ft(g.maintenanceMode, d),
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
      const d = Number(l.nowMs) || K(), u = Math.max(0, Number(l.minIntervalMs) || O.Defaults.LogVacuumMinIntervalMs);
      if (l.force === !0) return !0;
      const f = typeof c == "string" ? new Date(c).getTime() : NaN;
      return Number.isFinite(f) ? d - f >= u : !0;
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
function op(n = {}, e = {}) {
  const { D1TidyExecutor: r, D1TidyPlanner: t, Logger: a, buildAdminReleaseVendorManifest: o, normalizeAdminReleaseVendorManifestRecord: s, validateAdminShellHtmlSource: i } = n;
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
      const d = /* @__PURE__ */ new Error("Stored config snapshots are invalid");
      throw d.code = "CONFIG_SNAPSHOTS_INVALID", d.status = 409, d;
    },
    async writeStoredConfigSnapshots(c, l = [], d = {}) {
      if (!c) return [];
      const u = Array.isArray(l) ? l.slice(0, O.Defaults.ConfigSnapshotLimit) : [];
      return await c.put(e.CONFIG_SNAPSHOTS_KEY, JSON.stringify(u)), await e.ensureConfigSnapshotsMeta(c, u, d), u;
    },
    createSyntheticConfigSnapshot(c, l = {}, d = {}) {
      const u = e.normalizeConfigSnapshotMeta(l), f = Et(d.changedKeys || []), m = F(d.extraFields) ? d.extraFields : {};
      return ua({
        id: `cfg-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
        createdAt: (/* @__PURE__ */ new Date()).toISOString(),
        reason: u.reason,
        section: u.section,
        actor: u.actor,
        source: u.source,
        note: u.note,
        changedKeys: f,
        changeCount: Number(d.changeCount) || f.length,
        config: Br(c),
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
      return (Array.isArray(c) ? c : []).filter((u) => u && typeof u == "object" && Array.isArray(u.changedKeys) && u.createdAt).map((u) => d ? ua(u) : {
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
      const l = Ct(c);
      return l ? `${e.ADMIN_INDEX_UPLOAD_PREFIX}${l}` : "";
    },
    normalizeAdminIndexUploadRecord(c = {}, l = "") {
      if (!F(c)) return null;
      const d = Ct(c.revision), u = Ct(l);
      if (!d || u && d !== u) return null;
      const f = kr(d), m = ho(d), p = String(c.html || "");
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
      if (!d || await In(d.html) !== d.revision) return null;
      try {
        const u = i(d.html, d.sourceUrl, {
          sourceLabel: "local admin index",
          contentType: "text/html"
        });
        return {
          ...d,
          bytes: u.bytes,
          manifest: s(o(u.html, {
            releaseTag: d.assetRevision,
            sourceUrl: d.sourceUrl
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
      const d = e.buildAdminIndexUploadKey(l);
      if (!c || !d) return null;
      const u = await e.validateAdminIndexUploadRecord(await we(c, d, { type: "json" }), l);
      return u || e.validateAdminIndexUploadRecord(await we(c, e.ADMIN_ACTIVE_INDEX_KEY, { type: "json" }), l);
    },
    collectReferencedAdminIndexUploadRevisions(c = {}, l = []) {
      const d = /* @__PURE__ */ new Set(), u = (f) => {
        const m = qe(f?.indexUrl || "");
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
        const p = Ct(m.slice(e.ADMIN_INDEX_UPLOAD_PREFIX.length));
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
      return await Xt(u)(async () => {
        const p = e.buildAdminIndexUploadKey(m.revision), g = await we(u, p, { type: "json" }), h = await we(u, e.ADMIN_ACTIVE_INDEX_KEY, { type: "json" });
        let y = e.normalizeAdminIndexUploadRecord(g, m.revision);
        y && await In(y.html) !== m.revision && (y = null);
        const S = y || m;
        y || await u.put(p, JSON.stringify(m)), await u.put(e.ADMIN_ACTIVE_INDEX_KEY, JSON.stringify(S));
        try {
          const _ = d ? await de(d) : te(await we(u, e.CONFIG_KEY, { type: "json" }) || {});
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
          throw await he(h ? u.put(e.ADMIN_ACTIVE_INDEX_KEY, JSON.stringify(h)) : u.delete(e.ADMIN_ACTIVE_INDEX_KEY), "admin.active_index_upload_rollback", { revision: m.revision }, null), y || await he(g ? u.put(p, JSON.stringify(g)) : u.delete(p), "admin.local_index_upload_rollback", { revision: m.revision }, null), _;
        }
      });
    },
    async rollbackAdminIndexUploadActivation(c = {}, l = {}, d = {}) {
      const { env: u, kv: f, ctx: m } = d;
      if (!f) {
        const p = /* @__PURE__ */ new Error("KV namespace is required to roll back the local admin index");
        throw p.code = "KV_NOT_CONFIGURED", p.status = 503, p;
      }
      return await Xt(f)(async () => {
        const p = u ? await de(u) : te(await we(f, e.CONFIG_KEY, { type: "json" }) || {}), g = qe(l?.indexUrl || ""), h = qe(p?.indexUrl || "");
        if (!g || h !== g) return {
          config: p,
          skipped: !0,
          reason: h ? "superseded_by_newer_admin_index" : "admin_index_already_restored"
        };
        const y = qe(c?.indexUrl || ""), S = await we(f, e.ADMIN_ACTIVE_INDEX_KEY, { type: "json" }), _ = y ? await e.getAdminIndexUploadRecord(f, y) : null;
        _ ? await f.put(e.ADMIN_ACTIVE_INDEX_KEY, JSON.stringify(_)) : await f.delete(e.ADMIN_ACTIVE_INDEX_KEY);
        try {
          return {
            config: await e.commitRuntimeConfig({
              ...p,
              indexUrl: y ? kr(y) : ""
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
          throw await he(S ? f.put(e.ADMIN_ACTIVE_INDEX_KEY, JSON.stringify(S)) : f.delete(e.ADMIN_ACTIVE_INDEX_KEY), "admin.active_index_rollback_restore", { revision: g }, null), A;
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
      const d = c ? await de(c) : te(await we(l, e.CONFIG_KEY, { type: "json" }) || {}), u = [
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
      const d = l.kv, u = te(c?.config || {});
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
      return Ba(l.env), l.env ? await Ae(l.env) : u;
    },
    async restoreCapturedRuntimeConfigAndDnsState(c = {}, l = {}) {
      const d = te(c?.config || {});
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
function sp(n = {}, e = {}) {
  const { D1TidyExecutor: r, D1TidyPlanner: t, Logger: a, buildAdminReleaseVendorManifest: o, normalizeAdminReleaseVendorManifestRecord: s, validateAdminShellHtmlSource: i } = n;
  return {
    async recordConfigSnapshot(c, l, d, u = {}) {
      if (!c) return null;
      const f = Bn(l, d);
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
        config: Br(l)
      }, h = [g, ...p].slice(0, O.Defaults.ConfigSnapshotLimit);
      return await e.writeStoredConfigSnapshots(c, h), g;
    },
    async persistRuntimeConfig(c, l = {}) {
      return await Xt(l.kv || Ca(l.env))(() => e.commitRuntimeConfig(c, l));
    },
    async prepareRuntimeConfigPersistence(c, l = {}) {
      const { env: d, kv: u, ctx: f, snapshotMeta: m } = l;
      if (!u) {
        const S = /* @__PURE__ */ new Error("KV namespace is required to persist runtime config");
        throw S.code = "KV_NOT_CONFIGURED", S.status = 503, S;
      }
      Bl(c?.defaultHostPrefixCnameTarget);
      const p = d ? await de(d) : te(await we(u, e.CONFIG_KEY, { type: "json" }) || {}), g = te(c);
      Yl(c), Jl(g, d);
      const h = $e(d), y = ka(null, p, h) !== ka(null, g, h) ? (await e.loadAllNodeEntitiesFromKvStrict(u, { ctx: f })).filter((S) => Je(S?.entryMode) && !$t(S?.hostPrefixCnameTarget)) : [];
      return y.length > 0 && na(g, d), {
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
      const f = Bn(l, d), m = (await e.readStoredConfigSnapshotsStrict(c)).map((A) => ua(A)), p = f.length > 0 ? [e.createSyntheticConfigSnapshot(l, u, {
        changedKeys: f.map((A) => A.key),
        changeCount: f.length
      }), ...m].slice(0, O.Defaults.ConfigSnapshotLimit) : m.slice(0, O.Defaults.ConfigSnapshotLimit), g = e.normalizeRevisionMeta(Cr(d)), h = e.normalizeRevisionMeta({
        ...Cr(p),
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
      if (se(d) === se(u))
        return await e.ensureConfigMeta(h, u, { ctx: g }), u;
      const S = [];
      let _ = null, A = !1;
      try {
        for (const R of m)
          _ = R, await e.persistHostPrefixDnsSyncPlan(R, {
            env: y,
            kv: h,
            ctx: g,
            config: u,
            requestHost: f
          }), S.push(R), _ = null;
        A = !0;
        const b = await e.buildRuntimeConfigMutationPlan(h, d, u, p);
        return await e.applyKvMutationsWithRollback(h, b), y ? Ad(y, u) : Ba(), await e.invalidateDashboardSnapshotCacheForConfigChange(y, {
          prevConfig: d,
          nextConfig: u
        }), u;
      } catch (b) {
        const R = [], E = _ ? [...S, _] : S;
        for (let w = E.length - 1; w >= 0; w -= 1) try {
          await e.persistHostPrefixDnsSyncPlan({ steps: E[w].rollbackSteps }, {
            env: y,
            kv: h,
            ctx: g,
            config: u,
            requestHost: f,
            skipHistory: !0
          });
        } catch (D) {
          R.push(ie(D, "dns_rollback_failed"));
        }
        if (b && typeof b == "object") {
          const w = Array.isArray(b?.details?.rollbackConflicts) ? b.details.rollbackConflicts : [], D = Array.isArray(b?.details?.rollbackFailures) ? b.details.rollbackFailures : [];
          b.details = {
            ...F(b.details) ? b.details : {},
            hostPrefixDnsSyncAttempted: m.length > 0,
            hostPrefixDnsSyncedCount: S.length,
            failedHostPrefixDnsHost: String(_?.nextDnsHost || _?.previousDnsHost || ""),
            rollbackAttempted: E.length > 0 || A,
            rollbackSucceeded: R.length === 0 && w.length === 0 && D.length === 0,
            rollbackError: [...R, ...D].join("; "),
            rollbackConflicts: w
          };
        }
        throw b;
      }
    },
    async commitSourceDirectNodesConfigWithinMutation(c, l, d, u = {}) {
      if (!l) return null;
      const f = c ? await de(c) : te(await l.get(e.CONFIG_KEY, { type: "json" }) || {}), m = mt(f.sourceDirectNodes || []), p = Gn(m, {
        renameMap: u.renameMap,
        removedNames: u.removedNames,
        allowedNames: u.allowedNames
      });
      return se(m) === se(p) ? f : e.commitRuntimeConfig({
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
      const f = c ? await de(c) : te(await l.get(e.CONFIG_KEY, { type: "json" }) || {}), m = String(u.originalName || "").trim().toLowerCase(), p = String(u.nodeName || "").trim().toLowerCase(), g = an(u.mode);
      let h = mt(f.sourceDirectNodes || []);
      return m && m !== p && (h = Gn(h, { renameMap: { [m]: p } })), h = h.filter((y) => String(y || "").trim().toLowerCase() !== p), p && g === "direct" && h.push(p), h = mt(h), se(f.sourceDirectNodes || []) === se(h) ? f : e.commitRuntimeConfig({
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
function ip(n = {}, e = {}) {
  const { D1TidyExecutor: r, D1TidyPlanner: t, Logger: a, buildAdminReleaseVendorManifest: o, normalizeAdminReleaseVendorManifestRecord: s, validateAdminShellHtmlSource: i } = n;
  return {
    async sendTelegramMessage({ tgBotToken: c, tgChatId: l, text: d }) {
      const u = String(c || "").trim(), f = String(l || "").trim();
      if (!u || !f) throw new Error("请先完善 Telegram Bot Token 和 Chat ID 配置");
      const m = await Pe(await Ke(`https://api.telegram.org/bot${u}/sendMessage`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          chat_id: f,
          text: String(d || "")
        })
      }), rn);
      if (m.exceeded) throw new Error("Telegram API response too large");
      const p = JSON.parse(m.text);
      if (!p.ok) throw new Error(p.description || "Telegram API 返回错误");
      return p;
    },
    async buildDailyTelegramSummaryPayload(c, l = {}) {
      const d = te(l?.config || await de(c)), u = l?.now instanceof Date ? new Date(l.now.getTime()) : new Date(l?.now || /* @__PURE__ */ new Date()), f = l?.dayWindow && typeof l.dayWindow == "object" ? l.dayWindow : pt(u, d.scheduleUtcOffsetMinutes), [m, p] = await Promise.all([e.buildDashboardStatsPayload(c, {
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
      const f = await u.get(e.CONFIG_KEY, { type: "json" }) || {}, m = te(f), p = String(m.tgBotToken || "").trim(), g = String(m.tgChatId || "").trim();
      if (!p || !g) throw new Error("请先完善 Telegram Bot Token 和 Chat ID 配置");
      const h = l?.now instanceof Date ? new Date(l.now.getTime()) : new Date(l?.now || /* @__PURE__ */ new Date()), y = pt(h, m.scheduleUtcOffsetMinutes), S = bi(m, f, {
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
        db: d
      }) : null, b = [];
      for (const R of S) {
        const E = Wu(R, R === "summary" ? _ : A?.[R], y);
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
      const f = te(await Ae(c)), m = d && typeof d == "object" ? d : {}, p = String(f.tgBotToken || "").trim(), g = String(f.tgChatId || "").trim();
      if (!p || !g) return {
        sent: !1,
        reason: "telegram_not_configured"
      };
      const h = ue(f.tgAlertDroppedBatchThreshold, O.Defaults.TgAlertDroppedBatchThreshold, 0, 5e3), y = ue(f.tgAlertFlushRetryThreshold, O.Defaults.TgAlertFlushRetryThreshold, 0, 10), S = ue(f.tgAlertCooldownMinutes, O.Defaults.TgAlertCooldownMinutes, 1, 1440), _ = f.tgAlertOnScheduledFailure === !0, A = f.tgAlertKvUsageEnabled === !0, b = f.tgAlertD1UsageEnabled === !0, R = ue(f.tgAlertKvUsageThresholdPercent, O.Defaults.TgAlertKvUsageThresholdPercent, 1, 100), E = ue(f.tgAlertD1UsageThresholdPercent, O.Defaults.TgAlertD1UsageThresholdPercent, 1, 100);
      if (h <= 0 && y <= 0 && !_ && !A && !b) return {
        sent: !1,
        reason: "thresholds_disabled"
      };
      const w = await e.getOpsStatus(c), D = w && typeof w.log == "object" ? w.log : {}, C = l && typeof l == "object" && Object.keys(l).length ? l : w && typeof w.scheduled == "object" ? w.scheduled : {}, T = [], I = Number(D.lastDroppedBatchSize) || 0;
      h > 0 && I >= h && T.push({
        code: "log_drop",
        message: `日志刷盘疑似丢弃批次：${I} 条（阈值 ${h}）`,
        eventAt: D.lastFlushErrorAt || D.lastOverflowAt || D.updatedAt || w.updatedAt || ""
      });
      const x = Number(D.lastFlushRetryCount) || 0;
      y > 0 && x >= y && T.push({
        code: "log_retry",
        message: `D1 写入重试次数偏高：${x} 次（阈值 ${y}）`,
        eventAt: D.lastFlushAt || D.lastFlushErrorAt || D.updatedAt || w.updatedAt || ""
      });
      const U = String(C.status || "").toLowerCase();
      if (_ && (U === "failed" || U === "partial_failure")) {
        const v = [];
        for (const [W, $] of Object.entries({
          cleanup: "日志清理",
          tgDailyReport: "每日报表",
          alerts: "异常告警"
        })) {
          const H = C?.[W];
          if (!H || typeof H != "object") continue;
          const j = String(H.status || "").trim(), ne = String(H.lastError || "").trim();
          !ne && j !== "failed" && j !== "partial_failure" || v.push(`${$}：${j || "failed"}${ne ? `，错误：${ne}` : ""}`);
        }
        T.push({
          code: "scheduled_failure",
          message: v.length ? `定时任务状态异常：${v.join("；")}` : `定时任务状态异常：${C.status}${C.lastError ? `，错误：${C.lastError}` : ""}`,
          eventAt: C.lastFinishedAt || C.lastErrorAt || C.updatedAt || w.updatedAt || ""
        });
      }
      if (A || b) {
        const v = await e.getCloudflareRuntimeQuotaStatus(c, {
          config: f,
          db: u
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
        for (const $ of W) {
          if ($.enabled !== !0) continue;
          const H = $.card && typeof $.card == "object" ? $.card : {}, j = String(H.status || "").trim().toLowerCase();
          if (j !== "success" && j !== "partial_failure") continue;
          const ne = (Array.isArray(H.metrics) ? H.metrics : []).filter((me) => Number(me?.percent) >= $.threshold);
          if (!ne.length) continue;
          const fe = ne.map((me) => `${String(me?.key || "").trim()}:${String(me?.percentText || "").trim()}`).filter(Boolean).join(",");
          T.push({
            code: $.code,
            message: $u($.title, H, $.threshold, ne),
            eventAt: `${String(H.resourceLabel || $.title || "").trim()}|${String(H.planLabel || "").trim()}|${String(H.periodLabel || "").trim()}|${fe}|${j}`
          });
        }
      }
      if (!T.length) return {
        sent: !1,
        reason: "no_alerts"
      };
      const k = JSON.stringify(T.map((v) => ({
        code: v.code,
        eventAt: v.eventAt,
        message: v.message
      }))), G = await e.getOpsStatusPayloadFromDb(u, e.TELEGRAM_ALERT_STATE_DB_SCOPE), P = Date.now(), N = S * 60 * 1e3;
      if (m.ignoreCooldown !== !0 && G && G.signature === k && Number(G.sentAtMs) > 0 && P - Number(G.sentAtMs) < N) return {
        sent: !1,
        reason: "cooldown_active"
      };
      const L = Sl(/* @__PURE__ */ new Date(), f.scheduleUtcOffsetMinutes), M = [
        "⚠️ Emby Proxy 运行时异常告警",
        "",
        ...T.map((v) => `- ${v.message}`),
        "",
        `时间：${L.dateKey} ${L.clockTime} (${L.offsetLabel})`,
        "#Emby #Alert"
      ];
      return await e.sendTelegramMessage({
        tgBotToken: p,
        tgChatId: g,
        text: M.join(`
`)
      }), m.persistState !== !1 && (await e.putOpsStatusPayloadToDb(u, e.TELEGRAM_ALERT_STATE_DB_SCOPE, {
        signature: k,
        sentAt: new Date(P).toISOString(),
        sentAtMs: P,
        issues: T
      }, P) || Ne("telegram_alert_state.write_failed", /* @__PURE__ */ new Error("telegram alert cooldown state not persisted"), { issueCount: T.length })), {
        sent: !0,
        issueCount: T.length,
        reason: "alert_sent"
      };
    }
  };
}
function cp(n = {}, e = {}) {
  return {
    ...ap(n, e),
    ...np(n, e),
    ...op(n, e),
    ...sp(n, e),
    ...ip(n, e)
  };
}
var lp = class {
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
    const r = String(e || n?.localDateKey || "");
    return r ? {
      ...n,
      localDateKey: r,
      executedSlots: Tt(n?.executedSlots || [], [])
    } : {
      ...n,
      executedSlots: Tt(n?.executedSlots || [], [])
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
  #d(n = {}, e = "", r = {}) {
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
  #u(n = {}, e = {}, r = {}) {
    const t = F(e) ? e : {}, a = F(r.extra) ? r.extra : {};
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
          ...F(t) ? t : {}
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
        expiresAt: r.lock?.expiresAt || K() + t
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
            const d = Math.min(l, 1e3);
            await co(d), l -= d;
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
    const o = { db: t }, s = await Ae(e), i = ke(s?.scheduleUtcOffsetMinutes), c = n?.scheduledTime !== void 0 ? new Date(n.scheduledTime) : /* @__PURE__ */ new Date(), l = zo(c, i), d = (E = /* @__PURE__ */ new Date()) => zo(E, i), u = ue(s?.scheduledLeaseMs, O.Defaults.ScheduledLeaseMs, O.Defaults.ScheduledLeaseMinMs, 900 * 1e3), f = `${K()}-${Math.random().toString(36).slice(2, 10)}`, m = this.#l(f), p = async (E) => {
      const w = String(E || "db_unavailable").trim() || "db_unavailable";
      await m(this.service.patchOpsStatus(e, this.#m(l, w, "d1")), "patch_skipped_status", {
        reason: w,
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
    }, R = () => d(/* @__PURE__ */ new Date());
    try {
      const E = s || {}, w = await m(this.service.getOpsStatusSection(e, "scheduled"), "read_previous_status", null, {});
      if (t) try {
        await S();
        const P = pt(c, E.scheduleUtcOffsetMinutes), N = P.dateKey, L = P.startTs, M = P.endTs, v = ke(E.scheduleUtcOffsetMinutes), W = this.service.getPreviousD1TidyState(w), $ = await this.service.tidyD1Data(e, {
          db: t,
          kv: a,
          ctx: r,
          config: E,
          mode: "scheduled",
          maintenanceMode: "smart",
          previousScheduledState: w,
          previousCleanupStatus: W,
          scheduledNow: c,
          dayWindow: P,
          statsBucketDate: N,
          statsStartTs: L,
          statsEndTs: M,
          statsUtcOffsetMinutes: v,
          beforeEachStep: S
        }), H = R(), j = this.service.buildD1TidyStatusPayload($.summary, {
          mode: "scheduled",
          maintenanceMode: "smart",
          triggeredBy: "scheduled",
          timestamp: H
        });
        b.d1Tidy = j.d1Tidy, b.cleanup = j.cleanup, (b.d1Tidy.status === "partial_failure" || b.d1Tidy.status === "failed") && (b.status = "partial_failure"), await S();
      } catch (P) {
        b.status = "partial_failure";
        const N = this.service.buildD1TidyStatusPayload({
          status: "failed",
          lastError: P?.message || String(P),
          maintenanceMode: "smart"
        }, {
          mode: "scheduled",
          maintenanceMode: "smart",
          triggeredBy: "scheduled",
          timestamp: R()
        });
        b.d1Tidy = N.d1Tidy, b.cleanup = N.cleanup, this.logger.error("Scheduled DB Cleanup Error: ", P);
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
        ...this.#e(w, "kvTidy"),
        mode: "manual_only",
        lastAutoSkipAt: R(),
        autoSkipReason: "manual_only"
      };
      const { tgBotToken: D, tgChatId: C } = E, T = this.#e(w, "tgDailyReport", "report"), I = this.#e(w, "alerts"), x = Tt(E.tgDailyReportClockTimes, O.Defaults.TgDailyReportClockTimes), U = bl(T, x, i, c), k = bi(E, E), G = {
        ...T,
        clockTimes: x,
        reportKinds: k
      };
      if (E.tgDailyReportEnabled === !0) {
        let P = this.#o(U.fixedQueue);
        if (!k.length) b.tgDailyReport = this.#t(G, R(), "report_kinds_disabled", { fixedQueue: P });
        else if (!D || !C) b.tgDailyReport = this.#t(G, R(), "telegram_not_configured", { fixedQueue: P });
        else if (U.due !== !0) b.tgDailyReport = this.#t(G, R(), U.reason || "time_not_matched", { fixedQueue: P });
        else {
          let N = [], L = null, M = 0;
          for (const v of U.dueSlots) try {
            await S();
            const W = await this.service.sendDailyTelegramReport(e, {
              now: c,
              reportKinds: k
            });
            M += Number(W?.sentCount) || 0, N.push(v), P = this.#n(P, U.context.dateKey, v);
          } catch (W) {
            L = W, this.logger.error("Scheduled Daily Report Error: ", W);
            break;
          }
          L ? (b.status = this.#a(b.status), b.tgDailyReport = this.#r(G, R(), L?.message || String(L), {
            fixedQueue: P,
            processedSlots: N
          })) : b.tgDailyReport = this.#i(G, R(), {
            fixedQueue: P,
            sentCount: M,
            ...this.#s(U.context.dateKey, N)
          });
        }
      } else b.tgDailyReport = this.#t(G, R(), "disabled", { fixedQueue: U.fixedQueue });
      try {
        await S();
        const P = await this.service.maybeSendRuntimeAlerts(e, b);
        P.sent;
        const N = R();
        b.alerts = P.sent === !0 ? this.#i(I, N, {
          lastPolledAt: N,
          lastSkippedAt: I.lastSkippedAt || "",
          issueCount: Number(P.issueCount) || 0,
          reason: P.reason || "alert_sent"
        }) : this.#t(I, N, P.reason || "no_alerts", {
          lastPolledAt: N,
          lastSuccessAt: I.lastSuccessAt || "",
          issueCount: Number(P.issueCount) || 0
        });
      } catch (P) {
        b.status = this.#a(b.status);
        const N = R();
        b.alerts = this.#r(I, N, P?.message || String(P), { lastPolledAt: N }), this.logger.error("Scheduled Alert Error: ", P);
      }
    } catch (E) {
      b.status = "failed", b.lastErrorAt = R(), b.lastError = E?.message || String(E), this.logger.error("Scheduled Task Error: ", E);
    } finally {
      y.active = !1, await _;
      const E = R();
      b.lastFinishedAt = E, b.status === "success" && (b.lastSuccessAt = E);
      const w = y.lostReason ? !1 : await m(this.service.releaseScheduledLease(o, f, { backend: h }), "release_lease", { backend: h }, !1);
      b.lock = this.#g(y, E, w), await m(this.service.patchOpsStatus(e, { scheduled: b }), "patch_final_status", {
        finishedAt: E,
        finalStatus: b.status,
        leaseLostReason: y.lostReason || ""
      }, null);
    }
  }
};
function dp(n = {}, e = {}) {
  const { CacheManager: r, persistCloudflareDnsRecordsForHost: t } = n;
  return {
    sanitizeHeaders(a) {
      if (!a || typeof a != "object" || Array.isArray(a)) return {};
      const o = {};
      for (const [s, i] of Object.entries(a)) {
        const c = String(s || "").trim();
        c && (Un.has(c.toLowerCase()) || (o[c] = String(i ?? "")));
      }
      return o;
    },
    normalizeTargets(a) {
      const o = String(a || "").split(",").map((i) => i.trim()).filter(Boolean);
      if (!o.length) return null;
      const s = [];
      for (const i of o) {
        const c = Xo(i);
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
      return Xo(a, o, s);
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
      const i = String(e.normalizeTargets(o) || "").split(",").map((m) => m.trim()).filter(Boolean), c = e.normalizeTargetPort(s), l = c === null ? "" : c, d = Array.isArray(a) && a.length ? a : i.map((m, p) => ({
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
    resolveActiveLineId(a, o, s = [], i = "") {
      if (!Array.isArray(o) || !o.length) return "";
      const c = String(a || "").trim();
      if (c && o.some((l) => l.id === c)) return c;
      if (Array.isArray(s)) for (const l of s) {
        if (!l || typeof l != "object" || Array.isArray(l) || l.enabled !== !0) continue;
        const d = String(l.id || "").trim();
        if (d && o.some((m) => m.id === d)) return d;
        const u = e.normalizeSingleTarget(e.buildTargetWithPort(l.target, l.port, i));
        if (!u) continue;
        const f = o.find((m) => m.target === u);
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
      return c <= 0 ? !1 : K() - i < c;
    }
  };
}
function Nn(n = "") {
  const e = String(n || "").trim().toLowerCase();
  return e.startsWith("emby ") ? "emby" : e.startsWith("mediabrowser ") ? "mediabrowser" : "";
}
function up(n = "", e = "") {
  const r = String(n || "").trim();
  if (!r) return "";
  const t = r.replace(/^[^\s]+\s+/i, "").trim();
  return t ? e === "emby" ? `Emby ${t}` : e === "mediabrowser" ? `MediaBrowser ${t}` : r : r;
}
function Fc(n = "") {
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
var Uc = /* @__PURE__ */ new Set([
  "apikey",
  "accesstoken",
  "token",
  "authorization",
  "xembytoken",
  "xembyauthorization",
  "xmediabrowsertoken",
  "xmediabrowserauthorization"
]), Hc = /* @__PURE__ */ new Set([
  "deviceid",
  "xembydeviceid",
  "xmediabrowserdeviceid"
]);
function Cs(n, e) {
  const r = n instanceof URL ? n : null;
  if (!r || !(e instanceof Set)) return !1;
  for (const t of r.searchParams.keys()) if (e.has(wa(t))) return !0;
  return !1;
}
function Xe(n, e = "") {
  if (n instanceof Headers) return n.get(e) || "";
  const r = String(e || "").trim().toLowerCase();
  for (const [t, a] of Sn(n))
    if (String(t || "").trim().toLowerCase() === r)
      return String(a ?? "");
  return "";
}
function fp(n = "") {
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
function mp(n) {
  const e = new Headers();
  for (const [r, t] of Sn(n)) {
    const a = String(r || "").trim();
    if (!a) continue;
    const o = String(t ?? "");
    try {
      e.set(a, o);
    } catch {
      const s = fp(o);
      if (!s) continue;
      try {
        e.set(a, s);
      } catch {
      }
    }
  }
  return e;
}
function Fo(n) {
  const e = {
    token: "",
    deviceId: ""
  };
  for (const r of ["X-Emby-Token", "X-MediaBrowser-Token"]) {
    const t = Xe(n, r).trim();
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
    const t = Xe(n, r).trim();
    if (!t) continue;
    const a = Fc(t);
    if (!e.token && a.token && (e.token = a.token), !e.deviceId && a.deviceid && (e.deviceId = a.deviceid), !e.token) {
      const o = /^Bearer\s+(.+)$/i.exec(t);
      o?.[1] && (e.token = o[1].trim());
    }
  }
  if (!e.deviceId) for (const r of ["X-Emby-Device-Id"]) {
    const t = Xe(n, r).trim();
    if (t) {
      e.deviceId = t;
      break;
    }
  }
  return e;
}
function pp(n = "") {
  const e = String(n || "").trim();
  if (!e || /^Bearer\s+.+$/i.test(e)) return !0;
  const r = Fc(e);
  return !!String(r.token || "").trim();
}
function Sa(n) {
  const e = Fo(n), r = [], t = [];
  vo(Xe(n, "Cookie"), sn) && t.push("cookie");
  for (const d of Ac) {
    const u = Xe(n, d).trim();
    u && (pp(u) || r.push(d));
  }
  for (const [d, u] of Sn(n)) {
    const f = String(d || "").trim().toLowerCase(), m = String(u || "").trim();
    !f || !m || Tc(f) && r.push(f);
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
function kc(n, e) {
  const r = n instanceof URL ? new URL(n.toString()) : new URL(String(n || "")), t = (e && typeof e == "object" && "auth" in e ? e : { auth: Fo(e) }).auth || {};
  return t.token && !Cs(r, Uc) && r.searchParams.set("api_key", t.token), t.deviceId && !Cs(r, Hc) && r.searchParams.set("DeviceId", t.deviceId), r;
}
function gp(n, e = "auto") {
  const r = Zt(e);
  if (r === "passthrough") return n;
  const t = n.get("Authorization")?.trim() || "", a = n.get("X-Emby-Authorization")?.trim() || "", o = n.get("X-MediaBrowser-Authorization")?.trim() || "", s = Nn(t), i = Nn(o), c = Nn(a);
  let l = s ? t : i ? o : c ? a : "";
  if (!l) return n;
  const d = r === "emby" ? "emby" : r === "jellyfin" ? "mediabrowser" : s || i || c || "";
  return l = up(l, d), n.set("Authorization", l), d === "mediabrowser" ? (n.set("X-MediaBrowser-Authorization", l), n.delete("X-Emby-Authorization"), n) : (d === "emby" && (n.set("X-Emby-Authorization", l), n.delete("X-MediaBrowser-Authorization")), n);
}
function Ts(n, e = {}) {
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
function hp() {
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
var yp = hp();
function ws(n = {}) {
  const e = n && typeof n == "object" ? n : null, r = String(n?.corsOrigins || ""), t = String(n?.ipBlacklist || ""), a = String(n?.geoAllowlist || ""), o = String(n?.geoBlocklist || ""), s = e ? oe.ProxyAccessRuleProfileCache.get(e) : null;
  if (s && s.corsOriginsRaw === r && s.ipBlacklistRaw === t && s.geoAllowlistRaw === a && s.geoBlocklistRaw === o) return s;
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
    geoBlocklistRaw: o,
    corsOrigins: c.values,
    corsOriginSet: c.valueSet,
    ipBlacklist: i(t).valueSet,
    geoAllowlist: i(a, !0).valueSet,
    geoBlocklist: i(o, !0).valueSet
  };
  return e && oe.ProxyAccessRuleProfileCache.set(e, l), l;
}
function Sp(n = {}, e = {}) {
  const { CacheManager: r, persistCloudflareDnsRecordsForHost: t } = n;
  return {
    normalizeNode(a, o, s = {}) {
      const i = { ...o };
      let c = !1;
      const l = e.normalizeTargetPort(i.port), d = e.normalizeLines(i.lines, i.target, l || ""), u = e.resolveActiveLineId(i.activeLineId, d, Array.isArray(i.lines) ? i.lines : [], l || ""), f = e.buildLegacyTargetFromLines(d);
      JSON.stringify(d) !== JSON.stringify(Array.isArray(i.lines) ? i.lines : []) && (c = !0), String(i.activeLineId || "") !== u && (c = !0), String(i.target || "") !== f && (c = !0), i.lines = d, i.activeLineId = u, i.target = f, Object.prototype.hasOwnProperty.call(i, "port") && (delete i.port, c = !0), i.secret === void 0 && (i.secret = "", c = !0);
      const m = Fr(i.tags, i.tag), p = m[0] || "";
      JSON.stringify(m) !== JSON.stringify(Array.isArray(i.tags) ? i.tags : []) && (c = !0), String(i.tag || "") !== p && (c = !0), i.tags = m, i.tag = p;
      const g = [["server", "Record"].join(""), ["media", "Aggregation"].join("")];
      for (const D of Object.keys(i).filter((C) => g.some((T) => C.startsWith(T))))
        delete i[D], c = !0;
      i.remark === void 0 && (i.remark = "", c = !0), i.tagColor === void 0 && (i.tagColor = "", c = !0), i.remarkColor === void 0 && (i.remarkColor = "", c = !0), i.displayName === void 0 && (i.displayName = "", c = !0);
      const h = er(i.entryMode);
      String(i.entryMode || "") !== h && (c = !0), i.entryMode = h, h === "host_prefix" && String(i.secret ?? "") !== "" && (i.secret = "", c = !0);
      const y = h === "host_prefix" ? $t(i.hostPrefixCnameTarget) : "";
      String(i.hostPrefixCnameTarget || "") !== y && (c = !0), i.hostPrefixCnameTarget = y;
      const S = wr(i.playbackInfoMode);
      String(i.playbackInfoMode || "") !== S && (c = !0), i.playbackInfoMode = S;
      const _ = Zt(i.mediaAuthMode);
      String(i.mediaAuthMode || "") !== _ && (c = !0), i.mediaAuthMode = _;
      const A = Tr(i.realClientIpMode);
      String(i.realClientIpMode || "") !== A && (c = !0), i.realClientIpMode = A;
      const b = oa(i.hedgeProbePath);
      String(i.hedgeProbePath || "") !== b && (c = !0), i.hedgeProbePath = b;
      const R = vr(i);
      String(i.mainVideoStreamMode || "") !== R && (c = !0), i.mainVideoStreamMode = R;
      const E = Lr(i.routingDecisionMode);
      if (String(i.routingDecisionMode || "") !== E && (c = !0), i.routingDecisionMode = E, Object.prototype.hasOwnProperty.call(i, "wangpanDirectMode") && (delete i.wangpanDirectMode, c = !0), Object.prototype.hasOwnProperty.call(i, "wangpanMode") && (delete i.wangpanMode, c = !0), s && typeof s == "object" && "dropLegacyDirectRouting" in s && s.dropLegacyDirectRouting === !0) for (const D of [...fn, ...mn])
        Object.prototype.hasOwnProperty.call(i, D) && (delete i[D], c = !0);
      const w = e.sanitizeHeaders(i.headers);
      return JSON.stringify(w) !== JSON.stringify(i.headers || {}) && (c = !0), i.headers = w, delete i.videoThrottling, delete i.interceptMs, i.schemaVersion !== 6 && (i.schemaVersion = 6, c = !0), Object.prototype.hasOwnProperty.call(i, "createdAt") && (delete i.createdAt, c = !0), Object.prototype.hasOwnProperty.call(i, "updatedAt") && (delete i.updatedAt, c = !0), {
        data: i,
        changed: c
      };
    },
    buildComparableNodePayload(a = {}, o = {}) {
      if (!F(a)) return null;
      const s = { ...a };
      o.includeName !== !0 && delete s.name, delete s.createdAt, delete s.updatedAt;
      const i = (c) => {
        if (Array.isArray(c)) return c.map((l) => i(l));
        if (F(c)) {
          const l = {};
          for (const d of Object.keys(c).sort()) l[d] = i(c[d]);
          return l;
        }
        return c;
      };
      return i(s);
    },
    areNodePayloadsEquivalent(a = {}, o = {}, s = {}) {
      const i = e.buildComparableNodePayload(a, s), c = e.buildComparableNodePayload(o, s);
      return se(i) === se(c);
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
      const l = Array.isArray(o?.lines) ? o.lines : o?.target !== void 0 ? [] : s.lines, d = o?.target !== void 0 ? o.target : s.target, u = o?.port !== void 0 ? o.port : s.port, f = e.normalizeLines(l, d, u);
      if (!f.length) return null;
      const m = e.resolveActiveLineId(o?.activeLineId !== void 0 ? o.activeLineId : s.activeLineId, f, Array.isArray(o?.lines) ? o.lines : s.lines, u), p = o?.mainVideoStreamMode !== void 0 ? o.mainVideoStreamMode : o?.wangpanDirectMode !== void 0 ? o.wangpanDirectMode : o?.wangpanMode, g = e.normalizeNode(a, {
        target: e.buildLegacyTargetFromLines(f),
        lines: f,
        activeLineId: m,
        ...c,
        entryMode: o?.entryMode !== void 0 ? er(o.entryMode) : er(s.entryMode),
        hostPrefixCnameTarget: o?.hostPrefixCnameTarget !== void 0 ? o.hostPrefixCnameTarget : s.hostPrefixCnameTarget,
        secret: o?.secret !== void 0 ? o.secret : s.secret || "",
        tag: o?.tag !== void 0 ? o.tag : s.tag || "",
        tags: o?.tags !== void 0 ? o.tags : o?.tag !== void 0 ? [o.tag, ...Fr(s.tags, s.tag).filter((h) => h.toLowerCase() !== String(s.tag || "").trim().toLowerCase())] : s.tags,
        remark: o?.remark !== void 0 ? o.remark : s.remark || "",
        tagColor: o?.tagColor !== void 0 ? String(o.tagColor || "").trim() : s.tagColor || "",
        remarkColor: o?.remarkColor !== void 0 ? String(o.remarkColor || "").trim() : s.remarkColor || "",
        displayName: o?.displayName !== void 0 ? String(o.displayName || "").trim() : s.displayName || "",
        playbackInfoMode: o?.playbackInfoMode !== void 0 ? wr(o.playbackInfoMode) : wr(s.playbackInfoMode),
        mediaAuthMode: o?.mediaAuthMode !== void 0 ? Zt(o.mediaAuthMode) : Zt(s.mediaAuthMode),
        realClientIpMode: o?.realClientIpMode !== void 0 ? Tr(o.realClientIpMode) : Tr(s.realClientIpMode),
        hedgeProbePath: o?.hedgeProbePath !== void 0 ? oa(o.hedgeProbePath) : oa(s.hedgeProbePath),
        routingDecisionMode: o?.routingDecisionMode !== void 0 ? Lr(o.routingDecisionMode) : Lr(s.routingDecisionMode),
        mainVideoStreamMode: p !== void 0 ? an(p) : vr(s),
        headers: e.sanitizeHeaders(i),
        schemaVersion: 6
      }).data;
      return e.normalizeNode(a, s || {}).data, g;
    },
    buildHostPrefixDnsRecordHost(a = "", o = "") {
      const s = String(a || "").trim().toLowerCase(), i = ee(o);
      return !i || !Ra(s) ? "" : `${s}.${i}`;
    },
    buildHostPrefixDnsSyncPlan(a = "", o = null, s = "", i = null, c = "", l = {}) {
      const d = ee(c), u = o && Je(o?.entryMode) ? e.buildHostPrefixDnsRecordHost(a, d) : "", f = i && Je(i?.entryMode) ? e.buildHostPrefixDnsRecordHost(s, d) : "", m = u ? ka(o, l.previousConfig || l.config || {}, d) : "", p = f ? ka(i, l.nextConfig || l.config || {}, d) : "", g = [], h = [];
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
    buildPreparedNodeMutation(a = {}, o = {}, s = {}) {
      const i = String(s.nextName || a?.name || "").trim().toLowerCase();
      if (!i) return null;
      const c = String(s.previousName || a?.originalName || i).trim().toLowerCase() || i, l = e.buildNodeRecord(i, a, o);
      if (!l) return null;
      const d = F(o) && Object.keys(o).length ? e.normalizeNode(c, o || {}).data : null, u = c !== i, f = !u && !!d && e.areNodePayloadsEquivalent(d, l);
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
    async upsertHostPrefixDnsRecord(a = "", o = {}) {
      const s = ee(a);
      if (!s) return null;
      const i = o.config || await Ae(o.env), c = na(i, o.env), l = $t(o.cnameTarget) || ee(c.host);
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
    async deleteHostPrefixDnsRecord(a = "", o = {}) {
      const s = ee(a);
      if (!s) return null;
      const i = na(o.config || await Ae(o.env), o.env), c = String(i.cfZoneId || "").trim(), l = String(i.cfApiToken || "").trim(), d = await wo(c, l, { scope: "node.host_prefix_dns_delete.zone_lookup" }), u = String(d?.name || "").trim();
      if (u && !la(s, u)) throw Te("INVALID_HOST", "当前子域不在 Cloudflare Zone 下", 400, {
        host: s,
        zoneName: u
      });
      const f = (await Ir(c, l, { nameExact: s })).filter((p) => ee(p?.name) === s && String(p?.type || "").trim().toUpperCase() === "CNAME");
      if (!f.length) return {
        ok: !0,
        deletedCount: 0,
        host: s
      };
      const m = dc(c, l, s, `https://api.cloudflare.com/client/v4/zones/${encodeURIComponent(c)}/dns_records`, f[0] || {
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
      na(o.config || await Ae(o.env), o.env);
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
      const c = i.some((u) => u?.dnsPlan?.changed === !0) ? o.config || await Ae(o.env) : null;
      let l = 0;
      const d = [];
      for (let u = i.length - 1; u >= 0; u -= 1) {
        const f = i[u];
        if (f?.dnsPlan?.changed === !0) try {
          await e.persistHostPrefixDnsSyncPlan({ steps: f?.dnsPlan?.rollbackSteps || [] }, {
            ...o,
            config: c,
            skipHistory: !0
          });
        } catch (m) {
          d.push(`dns:${ie(m, "rollback_failed")}`);
        }
        if (f?.nodeChanged === !0) try {
          await e.rollbackPreparedNodeMutation(f, o), l += 1;
        } catch (m) {
          d.push(`node:${ie(m, "rollback_failed")}`);
        }
      }
      if (o.rebuildIndexes === !0) try {
        await e.rebuildNodeIndexesFromKv(s, {
          ctx: o.ctx,
          syncLegacyIndex: !0
        });
      } catch (u) {
        d.push(`rebuild_indexes:${ie(u, "rollback_failed")}`);
      }
      if (d.length > 0) throw new Error(d.join("; "));
      return { rolledBackNodeCount: l };
    },
    async applyPreparedNodeMutations(a = [], o = {}) {
      if (!o.kv) return { mutatedNodeCount: 0 };
      const s = (Array.isArray(a) ? a : []).filter(Boolean);
      if (!s.length) return { mutatedNodeCount: 0 };
      const i = s.some((m) => m?.dnsPlan?.changed === !0) ? await Ae(o.env) : null;
      let c = 0;
      const l = [];
      let d = !1, u = !0, f = "";
      try {
        for (const m of s)
          l.push(m), m?.nodeChanged === !0 && (await e.applyPreparedNodeMutation(m, o), c += 1), m?.dnsPlan?.changed === !0 && await e.persistHostPrefixDnsSyncPlan(m.dnsPlan, {
            ...o,
            config: i
          });
        return { mutatedNodeCount: c };
      } catch (m) {
        d = l.length > 0;
        try {
          await e.rollbackPreparedNodeMutations(l, {
            ...o,
            config: i,
            rebuildIndexes: !1
          });
        } catch (p) {
          u = !1, f = ie(p, "rollback_failed");
        }
        throw m && typeof m == "object" && (String(m.code || "").trim() || (m.code = "NODE_MUTATION_FAILED"), m.status = De(m.status, 500), m.details = {
          ...F(m.details) ? m.details : {},
          rollbackAttempted: d,
          rollbackSucceeded: u,
          rollbackError: f
        }), m;
      }
    }
  };
}
function _p(n = {}, e = {}) {
  const { CacheManager: r, persistCloudflareDnsRecordsForHost: t } = n;
  return {
    async pingTarget(a, o) {
      const s = K(), i = ed, c = (g = {}) => ({
        ok: g.ok === !0,
        reason: String(g.reason || "network_error"),
        statusCode: Number.isInteger(g.statusCode) ? g.statusCode : null,
        elapsedMs: Math.max(0, K() - s),
        methodUsed: g.methodUsed === "HEAD" || g.methodUsed === "GET" ? g.methodUsed : null,
        probePath: i
      }), l = un(String(a || "").trim());
      if (!l) return c({ reason: "invalid_target" });
      const d = yc(l, i);
      if (!d) return c({ reason: "invalid_target" });
      const u = new AbortController();
      let f = !1;
      const m = "GET", p = setTimeout(() => {
        f = !0, u.abort();
      }, o);
      try {
        const g = await Ke(d.toString(), {
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
    async getNode(a, o, s) {
      a = String(a).toLowerCase();
      const i = e.getKV(o);
      if (!i) return null;
      const c = Se(i), l = Ie(a, c), d = c.NodeCache.get(a);
      if (d && d.exp > Date.now()) {
        const f = await e.getNodesRevision(i), m = String(d?.nodesRevision || "").trim();
        if (Ie(a, c) === l && (!m || !f || m === f))
          return Ya(c.NodeCache, a), d.data;
        Ie(a, c) === l && c.NodeCache.delete(a);
      }
      const u = Ie(a, c);
      return await ln(c.SingleFlightTasks, tt([
        "proxy_node",
        a,
        u
      ]), async () => {
        try {
          const f = await i.get(`${e.PREFIX}${a}`, { type: "json" });
          if (Ie(a, c) !== u) return null;
          if (!f) {
            const y = await e.getNodesSummaryIndex(i, { ctx: s });
            if (Array.isArray(y)) if (y.some((S) => String(S?.name || "").toLowerCase().trim() === a)) {
              const S = e.rebuildNodeIndexesFromKv(i, { ctx: s });
              s ? s.waitUntil(S) : await S;
            } else {
              const S = await e.getNodesRevision(i);
              Ie(a, c) === u && xe(c.NodeCache, a, {
                data: null,
                exp: Date.now() + O.Defaults.NodeMissCacheTtlMs,
                nodesRevision: S
              }, O.Defaults.NodeCacheMax);
            }
            return null;
          }
          const { data: m, changed: p } = e.normalizeNode(a, f);
          if (p) {
            const y = i.put(`${e.PREFIX}${a}`, JSON.stringify(m));
            s ? s.waitUntil(y) : await y;
          }
          const g = e.upsertNodeSummaryEntry(a, m, {
            kv: i,
            ctx: s
          });
          let h = await e.getNodesRevision(i);
          return h ? s ? s.waitUntil(g) : await g : (await g, h = await e.getNodesRevision(i)), Ie(a, c) !== u ? null : (xe(c.NodeCache, a, {
            data: m,
            exp: Date.now() + O.Defaults.CacheTTL,
            nodesRevision: h
          }, O.Defaults.NodeCacheMax), m);
        } catch {
          return null;
        }
      });
    },
    async getNodeForRead(a, o) {
      a = String(a).toLowerCase();
      const s = e.getKV(o);
      if (!s) return null;
      const i = Se(s), c = Ie(a, i), l = i.NodeCache.get(a);
      if (l?.data === null) i.NodeCache.delete(a);
      else if (l && l.exp > Date.now()) {
        const u = await e.getNodesRevision(s), f = String(l?.nodesRevision || "").trim();
        if (Ie(a, i) === c && (!f || !u || f === u))
          return Ya(i.NodeCache, a), l.data;
        Ie(a, i) === c && i.NodeCache.delete(a);
      }
      const d = Ie(a, i);
      try {
        const u = await s.get(`${e.PREFIX}${a}`, { type: "json" });
        if (Ie(a, i) !== d || !u) return null;
        const f = e.normalizeNode(a, u).data, m = await e.getNodesRevision(s);
        return Ie(a, i) !== d ? null : (xe(i.NodeCache, a, {
          data: f,
          exp: Date.now() + O.Defaults.CacheTTL,
          nodesRevision: m
        }, O.Defaults.NodeCacheMax), f);
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
function bp(n = {}, e = {}) {
  return {
    ...dp(n, e),
    ...Sp(n, e),
    ..._p(n, e)
  };
}
var Ln = "proxy_logs_fts";
function Rp(n = {}) {
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
      const { page: t = 1, pageSize: a = 50, filters: o = {} } = r, s = Math.max(1, parseInt(t, 10) || 1), i = Math.min(200, Math.max(1, parseInt(a, 10) || 50)), c = String(r?.paginationMode || "").trim().toLowerCase(), l = Ii(r?.pageCursor), d = c !== "offset" && (s === 1 || !!l), u = (s - 1) * i, f = Date.now(), m = O.Defaults.LogQueryDefaultDays * 24 * 60 * 60 * 1e3, p = (S) => {
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
        useSeekPagination: d,
        offset: u,
        startTs: h,
        endTs: y
      };
    },
    resolveSearch(r = {}, t = {}, a = {}) {
      const o = String(r.searchMode || "").trim().toLowerCase(), s = o === "fts" || o === "like";
      let i = Ni(r.searchMode || t.logSearchMode), c = "";
      if (i === "fts" && a.ftsReady !== !0) {
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
      const { startTs: s, endTs: i } = t, c = e.buildDisplayState(a), l = ru(r.requestGroup), d = au(r.statusGroup), u = ["proxy_logs.timestamp >= ?", "proxy_logs.timestamp <= ?"], f = [s, i], m = (b, ...R) => {
        u.push(b), R.length > 0 && f.push(...R);
      }, p = "LOWER(proxy_logs.request_path)", g = String(r.keyword || "").trim();
      let h = !1;
      if (g) {
        const b = O.Defaults.LogKeywordMaxWindowDays * 24 * 60 * 60 * 1e3;
        if (i - s > b) return { errorResponse: B("LOG_QUERY_RANGE_TOO_WIDE", `关键词搜索必须限制在 ${O.Defaults.LogKeywordMaxWindowDays} 天内`, 400, { maxWindowDays: O.Defaults.LogKeywordMaxWindowDays }) };
        if (/^\d{3}$/.test(g)) m("proxy_logs.status_code = ?", Number(g));
        else if (Bc(g) || Ho(g)) {
          const R = [], E = [];
          if (c.displayClientIp && (R.push("proxy_logs.client_ip = ?"), E.push(g)), c.displayColo) {
            const w = Ho(g) ? g.toUpperCase() : g;
            R.push("COALESCE(proxy_logs.inbound_colo, proxy_logs.inbound_ip, '') = ?"), E.push(w), R.push("COALESCE(proxy_logs.outbound_colo, proxy_logs.outbound_ip, '') = ?"), E.push(w);
          }
          m(R.length ? `(${R.join(" OR ")})` : "1 = 0", ...E);
        } else if (o === "fts")
          m(`${Ln} MATCH ?`, du(g)), h = !0;
        else {
          const R = `%${Na(g)}%`, E = [
            "proxy_logs.node_name LIKE ? ESCAPE '\\'",
            "proxy_logs.request_path LIKE ? ESCAPE '\\'",
            "proxy_logs.detail_json LIKE ? ESCAPE '\\'"
          ];
          f.push(R, R, R), c.displayClientIp && (E.push("proxy_logs.client_ip LIKE ? ESCAPE '\\'"), f.push(R)), c.displayUa && (E.push("proxy_logs.user_agent LIKE ? ESCAPE '\\'"), f.push(R)), E.push("proxy_logs.error_detail LIKE ? ESCAPE '\\'"), f.push(R), m(`(${E.join(" OR ")})`);
        }
      }
      r.category && m("proxy_logs.category = ?", String(r.category)), l === "playback_info" ? (m("proxy_logs.category = ?", "api"), m(`(${p} LIKE ? ESCAPE '\\' OR ${p} LIKE ? ESCAPE '\\')`, "%/playbackinfo%", "%/sessions/playing%")) : l === "image" ? m("proxy_logs.category = ?", "image") : l === "api" ? (m("proxy_logs.category = ?", "api"), m(`${p} NOT LIKE ? ESCAPE '\\'`, "%/playbackinfo%"), m(`${p} NOT LIKE ? ESCAPE '\\'`, "%/sessions/playing%"), m(`${p} NOT LIKE ? ESCAPE '\\'`, "%/users/authenticate%")) : l === "auth" && (m("proxy_logs.category = ?", "api"), m(`${p} LIKE ? ESCAPE '\\'`, "%/users/authenticate%")), d === "4xx" ? m("proxy_logs.status_code >= ? AND proxy_logs.status_code < ?", 400, 500) : d === "5xx" && m("proxy_logs.status_code >= ? AND proxy_logs.status_code < ?", 500, 600);
      const y = Qo(r.deliveryMode || "");
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
        )`, y, ...R.map((E) => `%${Na(E)}%`));
      }
      const S = nu(r.protocolFailureReason || "");
      if (S && m(`(
          LOWER(COALESCE(CAST(json_extract(proxy_logs.detail_json, '$.protocolFailureReason') AS TEXT), '')) = ?
          OR (
            COALESCE(proxy_logs.detail_json, '') = ''
            AND proxy_logs.error_detail LIKE ? ESCAPE '\\'
          )
        )`, S, `%${Na(S)}%`), r.playbackMode) {
        const b = String(r.playbackMode || "").trim();
        Qo(b) || m("proxy_logs.error_detail LIKE ? ESCAPE '\\'", `%${Na(`Playback=${b}`)}%`);
      }
      const _ = h ? `FROM proxy_logs INNER JOIN ${Ln} ON ${Ln}.rowid = proxy_logs.id` : "FROM proxy_logs", A = `SELECT proxy_logs.*,
          ${c.displayClientIp ? "NULLIF(proxy_logs.client_ip, '') AS client_ip" : "NULL AS client_ip"},
          ${c.displayColo ? `COALESCE(proxy_logs.inbound_colo, proxy_logs.inbound_ip, proxy_logs.client_ip, '') AS inbound_colo,
        COALESCE(proxy_logs.outbound_colo, proxy_logs.outbound_ip, '') AS outbound_colo` : `'' AS inbound_colo,
        '' AS outbound_colo`},
          ${c.displayUa ? "proxy_logs.user_agent AS user_agent" : "NULL AS user_agent"},
          proxy_logs.detail_json AS detail_json`;
      return {
        searchMode: o,
        useFtsKeyword: h,
        whereClause: u,
        params: f,
        fromClause: _,
        selectClause: A,
        orderByClause: "ORDER BY proxy_logs.timestamp DESC, proxy_logs.id DESC"
      };
    },
    async executeSqlPlan(r, t = {}, a = {}) {
      const { safePage: o, safePageSize: s, requestedPageCursor: i, useSeekPagination: c, offset: l } = t, { whereClause: d = [], params: u = [], fromClause: f = "", selectClause: m = "", orderByClause: p = "", useFtsKeyword: g = !1, searchMode: h = "" } = a, y = "WHERE " + d.join(" AND ");
      let S = 0, _ = 1, A = o > 1, b = !1, R = null, E = [];
      try {
        if (c) {
          const w = d.slice(), D = u.slice();
          i && (w.push("(proxy_logs.timestamp < ? OR (proxy_logs.timestamp = ? AND proxy_logs.id < ?))"), D.push(i.timestamp, i.timestamp, i.id));
          const C = "WHERE " + w.join(" AND "), T = await r.prepare(`${m} ${f} ${C} ${p} LIMIT ?`).bind(...D, s + 1).all(), I = Array.isArray(T?.results) ? T.results : [];
          b = I.length > s, E = b ? I.slice(0, s) : I, R = b ? uu(E[E.length - 1]) : null, S = null, _ = b ? o + 1 : o;
        } else {
          S = (await r.prepare(`SELECT COUNT(*) as total ${f} ${y}`).bind(...u).first())?.total || 0;
          const w = await r.prepare(`${m} ${f} ${y} ${p} LIMIT ? OFFSET ?`).bind(...u, s, l).all();
          E = Array.isArray(w?.results) ? w.results : [], _ = Math.ceil(S / s) || 1, A = o > 1, b = o < _;
        }
      } catch (w) {
        const D = String(w?.message || w || "");
        if (g && /no such table:\s*proxy_logs_fts/i.test(D)) return { errorResponse: B("LOG_FTS_NOT_READY", "FTS5 虚拟表尚未初始化，请先点击“初始化 FTS5”", 400, { searchMode: h }) };
        if (g && /fts5/i.test(D)) return { errorResponse: B("LOG_FTS_QUERY_INVALID", "FTS 查询语法无效，请检查引号、布尔表达式或前缀写法", 400, { detail: D }) };
        throw w;
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
var Ep = "sys_status";
function Ap(n = {}) {
  const { logRepository: e } = n, r = {
    error(t, a, o = null) {
      Ne(t, a, o, "error");
    },
    scheduleFlush(t, a) {
      const o = e.getDB(t), s = Ut.get(o);
      if (!o || !a || s.LogFlushPending) return null;
      s.LogFlushPending = !0;
      const i = r.flush(t).finally(() => {
        s.LogFlushTask === i && (s.LogFlushTask = null), s.LogFlushPending = !1, s.LogLastFlushAt = K(), s.LogQueue.length > 0 && r.scheduleFlush(t, a);
      });
      return s.LogFlushTask = i, a.waitUntil(i), i;
    },
    record(t, a, o) {
      const s = e.getDB(t);
      if (!s || !a) return;
      const i = Ut.get(s);
      if (o.requestMethod === "OPTIONS") return;
      const c = F(o.runtimeConfig) ? o.runtimeConfig : qo(t) || {};
      if (i.runtimeConfig = c, c.logEnabled === !1) {
        i.LogQueue.length > 0 && (i.LogQueue.length = 0), i.LogDedupe.clear();
        return;
      }
      const l = Number(o.statusCode) || 0, d = Li(c.logWriteMode);
      if (d === "error" && (l < 400 || l >= 600)) return;
      const u = wi(o.requestPath, o.category);
      if (u === "image_poster" && c.logWriteImagePoster !== !0 || u === "media_metadata" && c.logWriteMediaMetadata !== !0) return;
      const f = c.logWriteClientIp !== !1, m = c.logWriteColo !== !1, p = c.logWriteUa !== !1, g = (x, U) => String(x || "").slice(0, U), h = g(o.inboundColo || o.inboundIp || o.clientIp || "unknown", 32), y = g(o.outboundColo || o.outboundIp || "", 32), S = f ? g(o.clientIp || "unknown", 128) : "", _ = g(o.nodeName || "unknown", 128) || "unknown", A = g(o.requestPath || "/", 2048) || "/", b = K(), R = Math.max(0, Number(i.LogClearEpochMs) || 0), E = b <= R ? R + 1 : b;
      let w = 0;
      if (o.requestMethod === "HEAD" ? w = 3e5 : (o.category === "segment" || o.category === "prewarm") && (w = 3e4), w > 0) {
        const x = [
          _,
          o.requestMethod || "GET",
          l,
          A,
          S,
          y
        ].join("|"), U = i.LogDedupe.get(x);
        if (U && b - U < w) return;
        if (i.LogDedupe.set(x, b), i.LogDedupe.size > O.Defaults.LogDedupeMax) {
          for (const [k, G] of i.LogDedupe)
            if (i.LogDedupe.has(k) && ((b - G > w || i.LogDedupe.size > O.Defaults.LogDedupeTrimTarget) && i.LogDedupe.delete(k), i.LogDedupe.size <= O.Defaults.LogDedupeTrimTarget))
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
        detailJson: o.detailJson ? zc(o.detailJson) : null,
        createdAt: new Date(E).toISOString()
      }), i.LogQueue.length > O.Defaults.LogQueueMax) {
        const x = Math.min(O.Defaults.LogQueueOverflowDropCount, i.LogQueue.length);
        i.LogQueue.splice(0, x), e.patchOpsStatus(t, { log: {
          lastOverflowAt: (/* @__PURE__ */ new Date()).toISOString(),
          lastOverflowDropCount: x,
          queueLengthAfterDrop: i.LogQueue.length
        } }, a), console.error(`Log queue overflow, dropping ${x} logs to preserve isolate headroom.`);
      }
      i.LogLastFlushAt || (i.LogLastFlushAt = b);
      const D = Number(c.logWriteDelayMinutes), C = Number(c.logFlushCountThreshold), T = Math.max(0, Number.isFinite(D) ? D * 6e4 : O.Defaults.LogFlushDelayMinutes * 6e4), I = Math.max(1, Number.isFinite(C) ? Math.floor(C) : O.Defaults.LogFlushCountThreshold);
      (d === "error" || i.LogQueue.length >= I || T === 0 || b - i.LogLastFlushAt >= T) && r.scheduleFlush(t, a);
    },
    async flush(t) {
      const a = e.getDB(t), o = Ut.get(a);
      if (!a || o.LogQueue.length === 0) return;
      const s = F(o.runtimeConfig) ? o.runtimeConfig : qo(t) || {}, i = ke(s.scheduleUtcOffsetMinutes);
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
      const l = Number(s.logBatchChunkSize), d = Number(s.logBatchRetryCount), u = Number(s.logBatchRetryBackoffMs), f = ue(l, O.Defaults.LogBatchChunkSize, 1, 100), m = ue(d, O.Defaults.LogBatchRetryCount, 0, 5), p = ue(u, O.Defaults.LogBatchRetryBackoffMs, 0, 5e3), g = e.getOpsStatusDbScope("log");
      let h = 0, y = 0, S = 0, _ = 0;
      const A = /* @__PURE__ */ new Map(), b = (R = []) => {
        const E = e.summarizeStatsHourlyEntries(R, { utcOffsetMinutes: i });
        for (const w of E) {
          const D = `${w.bucketDate}:${w.bucketHour}`, C = A.get(D) || {
            bucketDate: w.bucketDate,
            bucketHour: w.bucketHour,
            requestCount: 0,
            playCount: 0,
            playbackInfoCount: 0
          };
          C.requestCount += Math.max(0, Number(w.requestCount) || 0), C.playCount += Math.max(0, Number(w.playCount) || 0), C.playbackInfoCount += Math.max(0, Number(w.playbackInfoCount) || 0), A.set(D, C);
        }
      };
      try {
        const R = Math.max(o.LogClearEpochMs || 0, await e.getLogClearEpochMs(t));
        for (; o.LogQueue.length > 0; ) {
          const w = o.LogQueue.splice(0, f).filter((T) => (Number(T?.timestamp) || 0) > R);
          if (!w.length) continue;
          S = w.length, _ = 0;
          const D = w.map((T) => a.prepare(`INSERT INTO proxy_logs (timestamp, node_name, request_path, request_method, status_code, response_time, client_ip, inbound_colo, outbound_colo, user_agent, referer, category, error_detail, detail_json, created_at)
            SELECT ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?
            WHERE ? > COALESCE((
              SELECT CAST(json_extract(payload, '$.clearEpochMs') AS INTEGER)
              FROM ${Ep}
              WHERE scope = ?
              LIMIT 1
            ), 0)`).bind(T.timestamp, T.nodeName, T.requestPath, T.requestMethod, T.statusCode, T.responseTime, T.clientIp, T.inboundColo, T.outboundColo, T.userAgent, T.referer, T.category, T.errorDetail, T.detailJson, T.createdAt, T.timestamp, g));
          let C = 0;
          for (; ; ) try {
            await a.batch(D);
            break;
          } catch (T) {
            if (C >= m) throw T;
            C += 1, y += 1, p > 0 && await co(p * C);
          }
          c.statsReady === !0 && b(w), h += w.length, _ += w.length;
        }
        if (c.statsReady === !0 && A.size > 0) try {
          await e.upsertStatsHourlyBuckets(a, [...A.values()], { useBatch: !0 });
        } catch (w) {
          console.warn("upsertStatsHourlyBuckets failed", w);
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
  return r;
}
var Mn = "sys_status", qt = "sys_locks", Qr = "scheduled", Ds = Object.freeze({
  log: "ops_status:log",
  scheduled: "ops_status:scheduled",
  dnsIpPool: "ops_status:dns_ip_pool"
});
function Cp(n = {}) {
  const { bindingPort: e, schemaReadinessPort: r, statusPersistence: t } = n, a = {
    async getOpsStatusPayloadFromDb(o, s) {
      if (!o || !s) return null;
      const i = t.getOpsStatusPayloadCache(o), c = i?.get(String(s));
      if (c && Number(c.expiresAt) > K()) return c.payload;
      if (c && i.delete(String(s)), !await t.ensureSysStatusTable(o)) return null;
      try {
        const l = await o.prepare(`SELECT payload FROM ${Mn} WHERE scope = ? LIMIT 1`).bind(s).first(), d = l?.payload ? typeof l.payload == "string" ? JSON.parse(l.payload) : l.payload : null;
        return t.cacheOpsStatusPayload(o, s, d), d;
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
      const i = await o.prepare(`SELECT payload FROM ${Mn} WHERE scope = ? LIMIT 1`).bind(s).first();
      return i?.payload ? typeof i.payload == "string" ? JSON.parse(i.payload) : i.payload : null;
    },
    async putOpsStatusPayloadToDb(o, s, i, c) {
      return !o || !s || !i || typeof i != "object" || !await t.ensureSysStatusTable(o) ? !1 : (await o.prepare(`INSERT INTO ${Mn} (scope, payload, updated_at) VALUES (?, ?, ?)
        ON CONFLICT(scope) DO UPDATE SET payload = excluded.payload, updated_at = excluded.updated_at`).bind(s, JSON.stringify(i), Number(c) || K()).run(), t.cacheOpsStatusPayload(o, s, i), !0);
    },
    getOpsStatusSectionEntries() {
      return Object.entries(Ds);
    },
    async getOpsStatusRootFromStores(o) {
      const s = o?.db || null;
      if (!s) return {};
      const i = await a.getOpsStatusPayloadFromDb(s, t.getOpsStatusDbScope()), c = i && typeof i == "object" ? i : {}, l = t.getOpsStatusShadowPatch(s);
      return je(c, l && typeof l == "object" ? l : {});
    },
    async getOpsStatusRoot(o) {
      return a.getOpsStatusRootFromStores(t.resolveOpsStatusStores(o));
    },
    async getOpsStatusSectionFromStores(o, s) {
      const i = o?.db || null;
      if (!s) return {};
      if (!Ds[s]) return {};
      const c = async () => {
        if (!i) return null;
        const f = await a.getOpsStatusPayloadFromDb(i, t.getOpsStatusDbScope(s));
        return f && typeof f == "object" ? f : null;
      }, [l, d] = await Promise.all([a.getOpsStatusRootFromStores(o), c()]), u = l && typeof l[s] == "object" ? l[s] : {};
      return je(d && typeof d == "object" ? d : {}, u);
    },
    async getOpsStatusSection(o, s) {
      return a.getOpsStatusSectionFromStores(t.resolveOpsStatusStores(o), s);
    },
    async getOpsStatusFromStores(o) {
      const s = o?.db || null;
      if (!s) return {};
      const i = await a.getOpsStatusRootFromStores(o), c = i && typeof i == "object" ? { ...i } : {};
      let l = typeof c.updatedAt == "string" ? c.updatedAt : "";
      const d = await Promise.all(a.getOpsStatusSectionEntries().map(async ([u]) => {
        const f = await a.getOpsStatusPayloadFromDb(s, t.getOpsStatusDbScope(u)), m = i && typeof i[u] == "object" ? i[u] : {};
        return [u, je(f && typeof f == "object" ? f : {}, m)];
      }));
      for (const [u, f] of d)
        !f || typeof f != "object" || Object.keys(f).length && (c[u] = je(c[u], f), typeof f.updatedAt == "string" && f.updatedAt > l && (l = f.updatedAt));
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
      const s = await a.getOpsStatusSection(o, "log"), i = a.getLogClearEpochMsFromStatus(s), c = Ut.get(t.resolveOpsStatusStores(o).db);
      return i > c.LogClearEpochMs && (c.LogClearEpochMs = i), i;
    },
    async patchOpsStatus(o, s, i = null) {
      const c = t.resolveOpsStatusStores(o);
      if (!c.db) return {};
      const l = s && typeof s == "object" ? s : {}, d = Object.keys(l);
      if (!d.length) return await a.getOpsStatusFromStores(c);
      const u = t.buildOpsStatusRootPatch(l);
      if (!Object.keys(u).length) return await a.getOpsStatusFromStores(c);
      const f = t.getOpsStatusShadowState(c.db);
      f && (f.pendingPatch = je(f.pendingPatch && typeof f.pendingPatch == "object" ? f.pendingPatch : {}, u));
      const m = async () => await t.flushOpsStatusShadow(c, { patchKeys: d }), p = Promise.resolve(Ye.OpsStatusWriteChain).catch((g) => {
        Ne("ops_status.write_chain.previous_failure", g, { patchKeys: d });
      }).then(m);
      return Ye.OpsStatusWriteChain = p.catch((g) => {
        Ne("ops_status.write_chain.current_failure", g, { patchKeys: d });
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
      let s = Q.ScheduledLeaseDbReady.get(o);
      s || (s = (async () => {
        try {
          return await o.prepare(`CREATE TABLE IF NOT EXISTS ${qt} (scope TEXT PRIMARY KEY, token TEXT NOT NULL, owner TEXT NOT NULL, acquired_at INTEGER NOT NULL, renewed_at INTEGER, expires_at INTEGER NOT NULL)`).run(), await o.prepare(`CREATE INDEX IF NOT EXISTS idx_sys_locks_expires_at ON ${qt} (expires_at DESC)`).run(), r.markD1SchemaReady(o, "scheduledLeaseTable"), !0;
        } catch (i) {
          return console.warn("scheduled lease table init failed", i), !1;
        }
      })(), Q.ScheduledLeaseDbReady.set(o, s));
      try {
        return await s;
      } finally {
        Q.ScheduledLeaseDbReady.get(o) === s && Q.ScheduledLeaseDbReady.delete(o);
      }
    },
    normalizeScheduledLeaseLock(o, s = "") {
      if (!o || typeof o != "object") return null;
      const i = String(o.token || "").trim();
      if (!i) return null;
      const c = String(o.owner || "scheduled").trim() || "scheduled", l = Number(o.expiresAt ?? o.expires_at ?? 0), d = Number(o.acquiredAtMs ?? o.acquired_at), u = Number(o.renewedAtMs ?? o.renewed_at);
      return {
        token: i,
        owner: c,
        acquiredAt: typeof o.acquiredAt == "string" ? o.acquiredAt : Number.isFinite(d) && d > 0 ? new Date(d).toISOString() : "",
        renewedAt: typeof o.renewedAt == "string" ? o.renewedAt : Number.isFinite(u) && u > 0 ? new Date(u).toISOString() : "",
        expiresAt: Number.isFinite(l) ? l : 0,
        backend: s || String(o.backend || "").trim() || ""
      };
    },
    async getScheduledLeaseLockFromDb(o, s = Qr) {
      if (!o || !await a.ensureScheduledLeaseTable(o)) return null;
      try {
        const i = await o.prepare(`SELECT token, owner, acquired_at, renewed_at, expires_at FROM ${qt} WHERE scope = ? LIMIT 1`).bind(String(s || Qr)).first();
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
      const i = K(), c = Math.max(O.Defaults.ScheduledLeaseMinMs, Number(s.leaseMs) || O.Defaults.ScheduledLeaseMs), l = String(s.token || `${i}-${Math.random().toString(36).slice(2, 10)}`), d = String(s.owner || "scheduled"), u = String(s.scope || Qr), f = i + c;
      try {
        await o.prepare(`INSERT INTO ${qt} (scope, token, owner, acquired_at, renewed_at, expires_at)
          VALUES (?, ?, ?, ?, NULL, ?)
          ON CONFLICT(scope) DO UPDATE SET
            token = excluded.token,
            owner = excluded.owner,
            acquired_at = excluded.acquired_at,
            renewed_at = NULL,
            expires_at = excluded.expires_at
          WHERE ${qt}.expires_at <= ?`).bind(u, l, d, i, f, i).run();
        const m = await a.getScheduledLeaseLockFromDb(o, u);
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
      const l = K(), d = Math.max(O.Defaults.ScheduledLeaseMinMs, Number(i) || O.Defaults.ScheduledLeaseMs), u = String(c.scope || Qr);
      try {
        await o.prepare(`UPDATE ${qt}
          SET owner = ?, renewed_at = ?, expires_at = ?
          WHERE scope = ? AND token = ?`).bind(String(c.owner || "scheduled"), l, l + d, u, String(s)).run();
        const f = await a.getScheduledLeaseLockFromDb(o, u);
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
      const c = String(i.scope || Qr);
      try {
        return await o.prepare(`DELETE FROM ${qt} WHERE scope = ? AND token = ?`).bind(c, String(s)).run(), !0;
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
function or(n, e = "") {
  const r = String(n || "request_aborted").trim() || "request_aborted", t = new Error(e ? `${r}_${e}` : r);
  return r === "client_aborted" ? t.code = "CLIENT_ABORTED" : r === "downstream_cancelled" ? t.code = "DOWNSTREAM_CANCELLED" : r === "stream_idle_timeout" ? t.code = "STREAM_IDLE_TIMEOUT" : t.code = "REQUEST_ABORTED", t;
}
function Kc(n) {
  const e = new AbortController();
  let r = "", t = null, a = null, o = null;
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
      const d = () => {
        try {
          l.abort(r || "request_aborted");
        } catch {
        }
      };
      return r || e.signal.aborted ? d() : e.signal.addEventListener("abort", d, { once: !0 }), o = () => {
        e.signal.removeEventListener("abort", d), a === l && (a = null);
      }, () => {
        if (!o) return;
        const u = o;
        o = null, u();
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
function Tp(n = []) {
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
async function wp(n, e, r = null) {
  return await new Promise((t, a) => {
    let o = !1, s = null, i = () => {
    };
    const c = (d) => {
      if (!o) {
        o = !0, s !== null && clearTimeout(s);
        try {
          i();
        } catch {
        }
        t(d);
      }
    }, l = (d) => {
      if (!o) {
        o = !0, s !== null && clearTimeout(s);
        try {
          i();
        } catch {
        }
        a(d);
      }
    };
    r?.onAbort && (i = r.onAbort((d) => l(or(d)))), Number(e) > 0 && (s = setTimeout(() => c({
      timedOut: !0,
      value: null
    }), Math.max(0, Number(e) || 0))), Promise.resolve(n).then((d) => c({
      timedOut: !1,
      value: d
    }), l);
  });
}
async function Dp(n, e = null) {
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
        o || (o = !0, clearTimeout(i), a(or(c)));
      }));
    });
}
function Np(n = {}, e = {}) {
  return {
    async tryServeMetadataCache(r) {
      if (!r.metadataCache || !r.metadataCacheKey) return null;
      try {
        const t = Xm(r.metadataCacheKey, r.request);
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
      const s = a?.clientRedirectAuthPolicy || Sa(a?.newHeaders);
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
      const l = Kc(r?.request?.signal);
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
      const d = ya(i.headers.get("Location"), s);
      if (!d) {
        try {
          i.body?.cancel?.();
        } catch {
        }
        return c(), l.dispose(), null;
      }
      const u = r.playbackRelayTargetUrl instanceof URL ? r.playbackRelayTargetUrl : t, f = Ta(d, u).proxyPath || (d.origin === u?.origin ? d.pathname : null);
      if (f && da(f)) {
        const h = e.createRedirectTrace(r.requestUrl);
        e.recordRedirectTraceHop(h, i.status, d, {
          isSameOriginRedirect: !0,
          traceAction: "blocked_web"
        }), e.finalizeRedirectTrace(h, {
          terminalMode: "web_proxy_disabled",
          finalStatus: 404,
          finalHost: d.hostname || ""
        }), r.redirectTrace = h, r.defaultOutboundColo = $a(i) || "";
        try {
          i.body?.cancel?.();
        } catch {
        }
        return c(), l.dispose(), e.recordAccessLog(r, e.buildDirectAccessLogPayload(r, 404, r.defaultOutboundColo, {
          redirectTrace: h,
          decisionReason: "web_proxy_disabled"
        })), yn(r.requestMethod, r.dynamicCors);
      }
      const m = e.buildClientVisibleRedirectUrl(d, r.playbackRelayTargetUrl || t, r.nodeName, r.nodeKey, r.requestUrl, { entryMode: r.entryMode }) || d, p = e.createRedirectTrace(r.requestUrl);
      e.recordRedirectTraceHop(p, i.status, d, {
        isSameOriginRedirect: d.origin === s.origin,
        traceAction: "direct",
        dataPlaneMode: o?.dataPlaneMode
      }), e.finalizeRedirectTrace(p, {
        terminalMode: "client_redirect",
        finalStatus: i.status,
        finalHost: String(d.hostname || "").trim().toLowerCase()
      }), r.redirectTrace = p, r.defaultOutboundColo = $a(i) || "";
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
      const i = (Ze(t[0]) ? t[0] : null)?.targetUrl || null;
      if (!(i instanceof URL)) return null;
      const c = a?.clientRedirectAuthPolicy || Sa(a?.newHeaders || r.request.headers);
      if (a && typeof a == "object" && (a.clientRedirectAuthPolicy = c), r?.requestTraits?.isBigStream === !0 && r?.requestTraits?.rangeHeader && c.hasQueryAuth !== !0 && c.hasHeaderAuth !== !0 && c.hasCookieAuth !== !0) {
        const f = await e.maybeProbeEntryDirectRangeRedirectResponse(r, i, o, s);
        if (f) return f;
      }
      if (c.canDirect !== !0)
        throw r.directRedirectAuthReason = c.reason || "direct_transport_incompatible", e.createDirectTransportIncompatibleError(r);
      const l = kc(e.resolveEntryDirectTargetUrl(r, i), c), d = new Response(null, {
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
      const { request: a, requestMethod: o, requestTraits: s, protocolFallback: i } = r, { newHeaders: c, adminCustomHeaders: l, preparedBody: d, preparedBodyMode: u } = t, f = t?.transportTemplate || null, m = Array.isArray(f?.baseHeaderEntries) ? f.baseHeaderEntries : [...c.entries()], p = f ? f.adminCustomHasOrigin === !0 : l.has("origin"), g = f ? f.adminCustomHasReferer === !0 : l.has("referer"), h = f ? f.hasOriginHeader === !0 : c.has("Origin"), y = f ? f.hasRefererHeader === !0 : c.has("Referer"), S = String(f?.refererOrigin || "").trim(), _ = String(f?.refererPathAndSearch || "/") || "/", A = f ? f.isHotMediaRequest === !0 : s.isBigStream === !0 || s.isManifest === !0 || s.isSegment === !0;
      return async (b, R = {}) => {
        const E = new Headers(m), w = (b instanceof URL ? b : new URL(String(b))).origin, D = R.method || o, C = R.bodyMode || u, T = R.body !== void 0 ? R.body : d, I = R.isExternalRedirect === !0, x = R.protocolFallbackRetry === !0, U = R.stripAuthOnProtocolFallback === !0;
        if (h && !p && E.set("Origin", w), y && !g)
          if (f) S ? S !== w && E.set("Referer", `${w}${_}`) : E.set("Referer", w + "/");
          else try {
            const G = new URL(E.get("Referer") || "");
            if (G.origin !== w) {
              const P = new URL(`${G.pathname || "/"}${G.search || ""}`, w);
              E.set("Referer", P.toString());
            }
          } catch {
            E.set("Referer", w + "/");
          }
        I && (A || (Ts(E), E.delete("Cookie")), p || E.delete("Origin"), g || E.delete("Referer")), x && i && (U && Ts(E), E.set("Connection", "keep-alive")), (s.isBigStream || s.isSmartStrmMedia || s.isManifest || s.isSegment) && s.rangeHeader && !E.has("Range") && E.set("Range", s.rangeHeader), (s.isBigStream || s.isSmartStrmMedia || s.isManifest || s.isSegment) && s.ifRangeHeader && !E.has("If-Range") && E.set("If-Range", s.ifRangeHeader), (D === "GET" || D === "HEAD") && E.delete("Content-Length");
        const k = {
          method: D,
          headers: E,
          redirect: "manual"
        };
        return s.isMetadataCacheable && (k.cache = "no-store"), D !== "GET" && D !== "HEAD" && (C === "buffered" && T !== null && T !== void 0 ? k.body = T.slice(0) : C === "stream" && (k.body = T)), k;
      };
    }
  };
}
function Lp(n = {}, e = {}) {
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
      } : zd(r.node, r.currentConfig), i = e.createRedirectTrace(r.requestUrl), c = kd(r.requestMethod, r.requestTraits, { playbackRelayTargetUrl: r.playbackRelayTargetUrl });
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
      let d = l.response, u = l.targetRecord || null, f = u?.targetUrl || (r.playbackRelayTargetUrl instanceof URL ? new URL(r.playbackRelayTargetUrl.toString()) : null), m = l.finalUrl, p = l.releaseFetchController, g = l.protocolFallbackRetry === !0, h = !1, y = null, S = 0, _ = r.requestMethod, A = t.preparedBodyMode, b = t.preparedBody;
      for (r.defaultOutboundColo = $a(d) || ""; d.status >= 300 && d.status < 400 && S < 8; ) {
        const R = Number(d.status) || 0, E = ya(d.headers.get("Location"), m || f);
        if (!E) {
          e.finalizeRedirectTrace(i, {
            terminalMode: "invalid_redirect_target",
            finalStatus: R,
            finalHost: m?.hostname || f?.hostname || ""
          });
          break;
        }
        const w = Ta(E, f).proxyPath || (E.origin === f?.origin ? E.pathname : null);
        if (w && da(w)) {
          e.recordRedirectTraceHop(i, R, E, {
            isSameOriginRedirect: !0,
            traceAction: "blocked_web"
          }), e.finalizeRedirectTrace(i, {
            terminalMode: "web_proxy_disabled",
            finalStatus: 404,
            finalHost: E.hostname || ""
          });
          try {
            d.body?.cancel?.();
          } catch {
          }
          try {
            p?.();
          } catch {
          }
          d = yn(r.requestMethod, r.dynamicCors), m = E, p = null, S += 1;
          break;
        }
        const D = e.enforceStrictClientDirectAuthPolicy(r, e.getRoutingDecision({
          phase: "redirect",
          nextUrl: E,
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
        if (e.recordRedirectTraceHop(i, R, E, D), D.action === "DIRECT") {
          const U = t.clientRedirectAuthPolicy || Sa(t.newHeaders);
          if (U.canDirect !== !0)
            throw r.directRedirectAuthReason = U.reason || "direct_transport_incompatible", e.finalizeRedirectTrace(i, {
              terminalMode: "direct_incompatible",
              finalStatus: 409,
              finalHost: E.hostname || ""
            }), e.createDirectTransportIncompatibleError(r, { redirectTrace: i });
          const k = e.buildClientVisibleRedirectUrl(E, f, r.nodeName, r.nodeKey, r.requestUrl, {
            preserveWorkerProxy: D.preserveWorkerProxy === !0,
            linkVariant: r.linkVariant,
            entryMode: r.entryMode
          }) || E;
          y = D.preserveWorkerProxy === !0 ? k : kc(k, t.clientRedirectAuthPolicy || t.newHeaders), e.finalizeRedirectTrace(i, {
            terminalMode: "client_redirect",
            finalStatus: R,
            finalHost: y.hostname || E.hostname || ""
          });
          break;
        }
        const C = D.nextMethod, T = D.nextBodyMode, I = T === "none" ? null : b;
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
            absoluteUrl: E,
            buildFetchOptions: a,
            fetchOptions: {
              method: C,
              bodyMode: T,
              body: I,
              isExternalRedirect: !D.isSameOriginRedirect
            },
            retryableStatuses: o,
            protocolFallback: r.protocolFallback,
            preparedBodyMode: T,
            allowAutomaticRetry: t.allowAutomaticRetry,
            stripAuthOnProtocolFallback: r.requestTraits.canStripAuthOnProtocolFallback,
            upstreamTimeoutMs: r.upstreamTimeoutMs,
            maxExtraAttempts: t.allowAutomaticRetry ? r.upstreamRetryAttempts : 0,
            isRetry: !1,
            requestLifecycle: r.requestLifecycle
          });
        } catch (U) {
          throw e.finalizeRedirectTrace(i, {
            terminalMode: "proxy_error_after_redirect",
            finalStatus: R,
            finalHost: E.hostname || ""
          }), U && typeof U == "object" && (U.redirectTrace = i), U;
        }
        d = x.response, m = x.finalUrl, p = x.releaseFetchController, g = g || x.protocolFallbackRetry === !0, _ = C, A = T, b = I, r.defaultOutboundColo = $a(d) || "", D.isSameOriginRedirect || (h = !0), S += 1;
      }
      if (!i.terminalMode && (i.hops.length > 0 || i.finalStatus > 0)) {
        const R = Number(d?.status) || 0;
        if (R >= 300 && R < 400) {
          const E = ya(d.headers.get("Location"), m || f);
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
    async buildSuccessResponse(r, t, a, o = null) {
      let s = await e.guardApiResponseMime(r, a);
      r?.requestTraits?.isPlaybackInfoRequest === !0 && (s = await e.guardPlaybackInfoResponseContract(r, s), Jt(s.playbackInfoRepresentation) && (s = await e.maybeRewritePlaybackInfoResponse(r, s)));
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
      }), c && (_c(p), p.set("Location", r.playbackAbsoluteFallbackLocation || "/"), p.set("Cache-Control", "no-store"));
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
      if (g || (e.recordAccessLog(r, _), await e.flushCriticalLogsIfNeeded(r)), r.metadataCacheKey && r.ctx && s.response.status === 200) {
        const R = s.response.clone();
        r.ctx.waitUntil(e.storeMetadataCache(r.metadataCacheKey, R, r.requestTraits, {
          sourceUrl: r.requestUrl,
          prewarmCacheTtl: r.requestTraits.prewarmCacheTtl,
          imageCacheMaxAge: r.imageCacheMaxAge,
          proxiedExternalRedirect: s.proxiedExternalRedirect === !0
        }));
      }
      r.requestTraits.isPlaybackInfoRequest === !0 && await e.storePlaybackInfoResponseCache(r, s.response, null, s.playbackInfoRepresentation), await e.maybePrewarmMetadataResponse(r.request, s.response, r.requestTraits, s.activeTargetBase, t, r.nodeName, r.nodeKey, r.requestUrl, r.ctx, {
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
      return g ? b = e.buildManagedProxyResponseBody(r, s, _) : b = e.buildPassthroughProxyResponseBody(r, s), new Response(b, {
        status: f,
        statusText: m,
        headers: p
      });
    }
  };
}
function Mp(n = {}, e = {}) {
  return {
    buildErrorResponse(r, t) {
      const a = t?.message || String(t || "网关或 CF Workers 内部崩溃"), o = String(t?.code || "").toUpperCase(), s = e.buildRedirectDiagnosticDetail(t?.redirectTrace || r.redirectTrace), i = e.buildRuntimeDiagnosticDetail(r);
      let c = 502, l = "Bad Gateway", d = {
        error: "Bad Gateway",
        code: 502,
        message: "All proxy attempts failed."
      };
      o === "UPSTREAM_TIMEOUT" || o === "STREAM_IDLE_TIMEOUT" ? (c = 504, l = "Gateway Timeout", d = {
        error: "Gateway Timeout",
        code: 504,
        message: "Upstream response timed out."
      }) : o === "DIRECT_TRANSPORT_INCOMPATIBLE" ? (c = 409, l = "Conflict", d = {
        error: "Conflict",
        code: 409,
        message: "DIRECT mode is strict and will not fall back to proxy when custom auth headers or cookies are required."
      }) : (o === "CLIENT_ABORTED" || o === "DOWNSTREAM_CANCELLED" || o === "REQUEST_ABORTED") && (c = 499, l = "Client Closed Request", d = {
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
      const u = new Headers({
        "Content-Type": "application/json; charset=utf-8",
        "Access-Control-Allow-Origin": r.finalOrigin || "*",
        "Cache-Control": "no-store"
      });
      return r.finalOrigin !== "*" && xr(u, "Origin"), Ce(u), new Response(JSON.stringify(d), {
        status: c,
        statusText: l,
        headers: u
      });
    },
    async handle(r, t, a, o, s, i, c, l = {}) {
      if (da(a)) {
        const h = F(l.runtimeConfig) ? l.runtimeConfig : {}, y = Ea(i, r, e.resolveCorsOrigin(h, r));
        return yn(r.method, y);
      }
      let d = await e.prepareExecutionContext(r, t, a, o, s, i, c, l);
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
        d.requestLifecycle = Kc(d.request?.signal);
        const A = await e.executeUpstreamFlow(d, g, y);
        return await e.buildSuccessResponse(d, y, A, g);
      } catch (h) {
        return e.buildErrorResponse(d, h);
      }
    }
  };
}
function Ip(n = {}, e = {}) {
  return {
    ...Np(n, e),
    ...Lp(n, e),
    ...Mp(n, e)
  };
}
function Pp(n = {}, e = {}) {
  const { Logger: r } = n;
  return {
    resolveEntryDirectTargetUrl(t, a) {
      if (t?.playbackRelayTargetUrl instanceof URL) return new URL(t.playbackRelayTargetUrl.toString());
      const o = fr(a, t?.proxyPath || "/");
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
      o = e.appendLogDiagnosticDetail(o, `RoutingMode=${Nr(t?.routingDecisionMode)}`), o = e.appendLogDiagnosticDetail(o, e.buildTargetHotCacheDiagnosticDetail(t));
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
      const i = a?.headers, c = [], l = (d, u) => {
        const f = String(u || "").trim();
        f && c.push(`${d}=${f.length > 160 ? f.slice(0, 157) + "..." : f}`);
      };
      return l("Flow", o.flow || "passthrough"), l("Kind", e.classifyProxyLogCategory(s)), l("Source", o.source || "upstream"), l("Range", s.rangeHeader || t?.request?.headers?.get("Range")), l("Content-Range", i?.get("Content-Range")), l("Length", i?.get("Content-Length")), l("Accept-Ranges", i?.get("Accept-Ranges")), l("Cache", o.cacheStatus || i?.get("CF-Cache-Status")), l("Upstream", o.upstreamHost || o.upstreamUrlHost), l("RoutingMode", Nr(t?.routingDecisionMode)), l("DirectAuth", t?.directRedirectAuthReason), o.protocolFallbackRetry === !0 && l("Retry", "protocol_fallback"), Number(o.idleTimeoutMs) > 0 && l("Idle", `${Number(o.idleTimeoutMs)}ms`), c.join(" | ");
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
      const a = String(t?.targetHotCacheState || "").trim();
      return a ? `TargetHotCache=${a}` : "";
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
      return s && o.push(`ProgressSession=${ce(s)}`), o.join(" | ");
    },
    collectLogAuthKinds(t, a = null) {
      const o = /* @__PURE__ */ new Set(), s = t?.requestUrl instanceof URL ? t.requestUrl : null;
      if (s) for (const l of s.searchParams.keys()) {
        const d = wa(l);
        if (Uc.has(d) || Hc.has(d)) {
          o.add("query");
          break;
        }
      }
      const i = a?.newHeaders || t?.request?.headers || new Headers(), c = a?.clientRedirectAuthPolicy || Sa(i);
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
      return yp?.[s]?.[i]?.[c] || {
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
      const s = String(o.deliveryMode || (e.shouldLogDirectAccess(t, { directRedirectUrl: o.directRedirectUrl }) ? "direct" : "proxy")).trim().toLowerCase() === "direct" ? "direct" : "proxy", i = e.collectLogAuthKinds(t, o.transport), c = o.redirectScope || e.resolveRedirectScope(o.directRedirectUrl || o.redirectUrl || o.finalUrl, t?.requestUrl), l = e.resolveRoutingCapability(s, i, c), d = Number(o.upstreamStatus || a.statusCode || 0) || 0, u = su(d), f = t?.routeContextDiagnostics && typeof t.routeContextDiagnostics == "object" ? t.routeContextDiagnostics : null, m = Array.isArray(o.authKindsForwarded) ? [...new Set(o.authKindsForwarded.map((g) => String(g || "").trim().toLowerCase()).filter(Boolean))] : s === "direct" ? i.filter((g) => g === "query") : i, p = e.ensureFailoverTelemetry(t);
      return {
        routingMode: Nr(t?.routingDecisionMode),
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
        statusReasonCode: u.code,
        statusReasonText: u.text,
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
function xp(n = {}, e = {}) {
  const { Logger: r } = n;
  return {
    buildProxyErrorState: xn,
    async guardApiResponseMime(t, a) {
      return Jc(t, a, {
        sanitizePath: Z,
        buildErrorState: xn
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
      const i = sr();
      if (!i || !t || !a || a.status !== 200 || s.proxiedExternalRedirect === !0 || o.isManifest && !Zn(s.sourceUrl)) return !1;
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
          const u = new URL(i, "https://metadata-prewarm.invalid");
          c = fr(a, u.pathname || "/"), c.search = u.search || "", c.hash = u.hash || "";
        }
      } catch {
        return null;
      }
      if (tp(c.pathname)) return null;
      const { proxyPath: l } = Ta(c, a);
      if (!l) return null;
      const d = l || "/";
      return zr.test(d) || Kr.test(d) || ht.test(d) || dr.test(d) ? {
        upstreamUrl: c,
        proxyPath: d,
        proxySearch: c.search || ""
      } : null;
    },
    buildMetadataPrewarmTargets(t, a, o, s, i, c) {
      const l = /* @__PURE__ */ new Map(), d = rp(t);
      if (d) {
        const u = e.resolveMetadataTarget(`/Items/${encodeURIComponent(d)}/Images/Primary`, o, s, i);
        u && l.set(`${u.proxyPath}${u.proxySearch}`, u);
      }
      return c !== "poster" && eo(a).forEach((u) => {
        const f = e.resolveMetadataTarget(u, o, s, i);
        f && l.set(`${f.proxyPath}${f.proxySearch}`, f);
      }), [...l.values()].sort((u, f) => As(u.proxyPath) - As(f.proxyPath)).slice(0, 4);
    },
    async maybePrewarmMetadataResponse(t, a, o, s, i, c, l, d, u, f = {}) {
      if (!u || t.method !== "GET" || o.enablePrewarm !== !0 || o.isPlaybackInfoRequest === !0 || o.isImage || o.isSubtitle || o.isManifest || o.isSegment || o.isBigStream || !(a.status >= 200 && a.status < 300) || !Oa(a.headers.get("Content-Type"))) return;
      const m = await Pe(a.clone(), li);
      if (m.exceeded) return;
      let p;
      try {
        p = JSON.parse(m.text);
      } catch {
        return;
      }
      const g = e.buildMetadataPrewarmTargets(f.proxyPath, p, s, c, l, o.prewarmDepth);
      g.length && u.waitUntil((async () => {
        const h = sr();
        for (const y of g) {
          if (!Zn(y.upstreamUrl)) continue;
          const S = await qm(t, y.upstreamUrl), _ = vc(d, c, l, y.proxyPath, {
            search: y.proxySearch,
            nodeCacheRevision: f.nodeCacheRevision,
            entryMode: f.entryMode,
            identityPartition: S,
            cachePolicyRevision: Ic(y.proxyPath, f)
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
            const R = ue(f.prewarmTimeoutMs, rd, 250, 1e4);
            let E = null;
            try {
              if (R > 0) {
                const C = new AbortController();
                A.signal = C.signal, E = setTimeout(() => C.abort(), R);
              }
              const w = await Ke(y.upstreamUrl.toString(), A), D = {
                isImage: zr.test(y.proxyPath) || Kr.test(y.proxyPath),
                isSubtitle: dr.test(y.proxyPath),
                isManifest: ht.test(y.proxyPath)
              };
              await e.storeMetadataCache(_, w, D, {
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
    shouldRetryWithProtocolFallback(t, a = {}) {
      return !(t.status !== 403 || a.isRetry !== !1 || a.protocolFallback !== !0 || a.allowAutomaticRetry !== !0 || a.preparedBodyMode === "stream");
    },
    resolveResponseStreamIdleTimeoutMs(t, a) {
      return 0;
    },
    shouldManageProxyResponseBody(t, a) {
      return t.requestTraits.isSegment === !0 && t.requestMethod !== "HEAD" && a.response.status !== 101 && !!a.response.body;
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
        const R = {
          ...u,
          ...F(b) ? b : {}
        };
        R.errorDetail = e.appendLogDiagnosticDetail(b.errorDetail, u.errorDetail), R.detailJson = {
          ...u.detailJson || {},
          ...b.detailJson && typeof b.detailJson == "object" ? b.detailJson : {},
          protocolFailureReason: b?.detailJson?.protocolFailureReason || (Number(R.statusCode) >= 400 ? e.classifyProtocolFailureReason(R.errorDetail, {
            upstreamStatus: R.statusCode,
            protocolFallbackRetry: u?.detailJson?.protocolFallbackRetry === !0
          }) : u?.detailJson?.protocolFailureReason || null),
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
                const { done: R, value: E } = await l.read();
                if (S(), R) {
                  const w = i.getAbortReason();
                  if (_(), w === "stream_idle_timeout") {
                    try {
                      b.error(or(w, `${d}ms`));
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
                const E = i.getAbortReason(), w = E === "stream_idle_timeout" ? or(E, `${d}ms`) : E ? or(E) : R;
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
                  errorDetail: `stream_idle_timeout_${d}ms`
                } : {
                  statusCode: 502,
                  category: "error",
                  errorDetail: R?.message || String(R)
                });
                try {
                  b.error(w);
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
function Op(n = {}, e = {}) {
  const { Logger: r } = n;
  return {
    async performFetchWithTimeout(t, a, o = {}) {
      const s = await a(t, o), i = Math.max(0, Number(o.timeoutMs) || 0), c = o.requestLifecycle || null;
      let l = null, d = null, u = !1, f = () => {
      };
      (i > 0 || c) && (d = new AbortController(), s.signal = d.signal, c && (f = c.setActiveFetchController(d)), i > 0 && (l = setTimeout(() => {
        u = !0, d.abort(`upstream_timeout_${i}ms`);
      }, i)));
      try {
        return {
          response: await Ke(t.toString(), s),
          finalUrl: t,
          releaseFetchController: f
        };
      } catch (m) {
        if (f(), u) {
          const p = /* @__PURE__ */ new Error(`upstream_timeout_${i}ms`);
          throw p.code = "UPSTREAM_TIMEOUT", p;
        }
        if (c && Qt(m)) {
          const p = c.getAbortReason();
          if (p) throw or(p);
        }
        throw m;
      } finally {
        l !== null && clearTimeout(l);
      }
    },
    async performUpstreamFetch(t, a, o, s, i = {}) {
      const c = i.useFastSegmentBuilder === !0, l = c ? new URL(wm(t, a, o?.search || "")) : fr(t, a);
      return c || (l.search = o.search), {
        ...await e.performFetchWithTimeout(l, s, i),
        targetRecord: t
      };
    },
    async fetchAbsoluteWithRetryLoop(t) {
      let a = null;
      const o = t.absoluteUrl instanceof URL ? new URL(t.absoluteUrl.toString()) : new URL(String(t.absoluteUrl || "")), s = Math.max(1, ue(t.maxExtraAttempts, Fn, 0, 3) + 1);
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
            throw l && typeof l == "object" && (l.lastFinalUrl = o), l;
        }
      }
      throw a && typeof a == "object" && (a.lastFinalUrl = o), a || /* @__PURE__ */ new Error("redirect_fetch_failed");
    },
    async fetchUpstreamWithRetryLoop(t) {
      let a = null, o = Array.isArray(t.retryTargetRecords) ? t.retryTargetRecords.slice() : [], s = o[0], i = fr(s, t.proxyPath);
      i.search = t.requestUrl.search;
      const c = Math.max(1, ue(t.maxExtraAttempts, Fn, 0, 3) + 1);
      for (let l = 0; l < c; l++) for (let d = 0; d < o.length; d++) {
        const u = o[d];
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
          const g = d === o.length - 1, h = l === c - 1;
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
            o = e.reorderRetryTargetsForFailover(t.execution.failoverContext.originalTargetRecords, S);
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
              o = e.reorderRetryTargetsForFailover(t.execution.failoverContext.originalTargetRecords, S);
            }
          }
          const g = d === o.length - 1, h = l === c - 1;
          if (g && h)
            throw m && typeof m == "object" && (m.lastFinalUrl = i, m.lastTargetRecord = s, m.lastTargetBase = s?.targetUrl || null), m;
        }
      }
      throw a && typeof a == "object" && (a.lastFinalUrl = i, a.lastTargetRecord = s, a.lastTargetBase = s?.targetUrl || null), a || /* @__PURE__ */ new Error("upstream_fetch_failed");
    }
  };
}
function vp(n = {}, e = {}) {
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
    async flushCriticalLogsIfNeeded(t) {
      const a = t?.requestTraits || {};
      if (!(a.isPlaybackInfoRequest === !0 || a.isPlaybackSessionControlRequest === !0)) return;
      const o = t?.currentConfig || {};
      if (o.logEnabled === !1) return;
      const s = Number(o.logWriteDelayMinutes);
      if (Math.max(0, Number.isFinite(s) ? s * 6e4 : O.Defaults.LogFlushDelayMinutes * 6e4) !== 0) return;
      const i = Ut.get(t?.env ? e.getDB(t.env) : null);
      if (i.LogFlushTask) try {
        await i.LogFlushTask;
      } catch {
      }
      if (i.LogQueue.length > 0) try {
        await r.flush(t.env);
      } catch {
      }
    },
    buildOptionsResponse(t) {
      const a = new Headers(t.dynamicCors);
      return Ce(a), t.finalOrigin !== "*" && xr(a, "Origin"), new Response(null, { headers: a });
    }
  };
}
function Fp(n = {}, e = {}) {
  return {
    ...Pp(n, e),
    ...xp(n, e),
    ...Op(n, e),
    ...vp(n, e)
  };
}
function Up(n = {}, e = {}) {
  const { CacheManager: r } = n, t = new tl({
    entries: oe.PlaybackInfoResponseCache,
    now: K,
    maxEntries: O.Defaults.PlaybackInfoCacheMax,
    maxEntryBytes: oi,
    maxTotalBytes: od
  });
  return {
    async prepareExecutionContext(a, o, s, i, c, l, d, u = {}) {
      const f = Date.now(), m = a.method;
      if (r.maybeCleanup(l), !o || !o.target) return { invalidResponse: new Response("Invalid Node", {
        status: 502,
        headers: Ce(new Headers())
      }) };
      const p = F(u.runtimeConfig) ? u.runtimeConfig : await Ae(l), g = u.requestUrl || new URL(a.url), h = u.runtimeRouteContext && typeof u.runtimeRouteContext == "object" ? u.runtimeRouteContext : null, y = typeof h?.requestHost == "string" ? h.requestHost : ee(g.hostname), S = typeof h?.configuredHost == "string" ? h.configuredHost : $e(l), _ = typeof h?.configuredLegacyHost == "string" ? h.configuredLegacyHost : Hr(l), A = er(u.entryMode || o?.entryMode), b = String(u.routeKindOverride || "").trim(), R = !!(_ && _ !== S && y && y === _), E = {
        requestHost: y,
        configuredHost: S,
        configuredLegacyHost: _,
        isLegacyHostRequest: R,
        routeKind: b || (R ? "legacy_host_kv_route" : A === "host_prefix" ? "host_prefix" : "kv_route")
      }, w = Z(s), D = String(u?.pathNormalizationState?.kind || "").trim(), C = a.headers.get("cf-connecting-ip") || "unknown", T = ea(a), I = C, x = a.cf?.country || "UNKNOWN", U = e.resolveCorsOrigin(p, a), k = Ea(l, a, U), G = Ci(u.linkVariant), P = Fm(w, g);
      if (P?.error) return { invalidResponse: new Response("Invalid Playback Relay", {
        status: 400,
        headers: Ce(new Headers(k))
      }) };
      const N = g.searchParams.has("__pb_abs") && (!!P || fa(w));
      let L = g;
      const M = P?.visibleProxyPath || w, v = P?.targetUrl instanceof URL ? P.targetUrl.pathname : "";
      if (da(M) || v && da(v)) return { invalidResponse: yn(m, k) };
      if ((P || N) && (L = new URL(g)), P) {
        L.searchParams.delete(Ai);
        const ge = bc(g, i, c, M, {
          linkVariant: G,
          entryMode: u.entryMode
        });
        L.pathname = ge.pathname;
      }
      N && L.searchParams.delete(Kn);
      const W = Af(o, p, i), $ = e.classifyRequest(a, M, L, p, {
        nodeDirectSource: W,
        directStaticAssets: p.directStaticAssets === !0,
        directHlsDash: p.directHlsDash === !0
      }), H = Gd(o, p), j = Mm(H), ne = H === "rewrite" && P?.targetUrl instanceof URL ? "proxy" : "", fe = G !== "main" ? "link_variant_force_proxy" : ne ? "rewrite_playback_entry_proxy" : "", me = !!fe, le = me ? {
        ...$,
        nodeDirectMedia: !1,
        directStaticAssets: !1,
        directHlsDash: !1,
        legacyEntryOffloadEnabled: !1,
        legacyEntryOffloadReason: "",
        direct307Mode: !1,
        enablePrewarm: p.enablePrewarm !== !1,
        isMetadataCacheable: m === "GET" && $.isWsUpgrade !== !0 && ($.isImage === !0 || $.isSubtitle === !0 || $.isManifest === !0)
      } : $, pe = Tf(p), Oe = p.protocolFallback !== !1, Be = ue(p.upstreamTimeoutMs, Zl, 0, 18e4), Mt = ue(p.upstreamRetryAttempts, Fn, 0, 3), rt = p.hedgeFailoverEnabled === !0, It = p.hedgeProbePreferGet !== !1, Pt = qd(o, p), Gr = ue(p.hedgeProbeTimeoutMs, yo, 250, 1e4), xt = ue(p.hedgeProbeParallelism, ei, 1, 2), mr = ue(p.hedgeWaitTimeoutMs, ti, 250, 1e4), Ot = ue(p.hedgeLockTtlMs, ri, 1e3, 1e4), at = ue(p.hedgePreferredTtlSec, Zr, 30, 3600), jr = ue(p.hedgeFailureCooldownSec, ai, 1, 300), pr = ue(p.hedgeWakeJitterMs, ni, 0, 1e3), nt = ue(p.cacheTtlImages, ii, 0, 365) * 86400, ot = pe.enableH3 === !0, Vt = pe.forceH1 === !0, _t = p.playbackInfoCacheEnabled !== !1, bt = ue(p.playbackInfoCacheTtlSec, nd, 0, 60), gr = p.videoProgressForwardEnabled !== !1, Gt = ue(p.videoProgressForwardIntervalSec, si, 0, 60), Le = jd(o, p), qr = Vd(o, p), We = String(u.nodeCacheRevision || "").trim() || Qn(i, o), z = le.isMetadataCacheable ? await Mc(a) : "", V = le.isMetadataCacheable ? Ic(M, {
        imageCacheMaxAge: nt,
        prewarmCacheTtl: le.prewarmCacheTtl
      }) : "", q = le.isMetadataCacheable && Zn(L) ? vc(L, i, c, M, {
        search: L.search,
        nodeCacheRevision: We,
        entryMode: u.entryMode,
        identityPartition: z,
        cachePolicyRevision: V
      }) : null, X = q ? sr() : null, Y = Pd(o, p), re = e.getRoutingDecision({
        phase: "entry",
        request: a,
        requestUrl: L,
        proxyPath: M,
        requestTraits: le,
        currentConfig: p,
        node: o,
        nodeName: i,
        nodeKey: c,
        linkVariant: G,
        forceWorkerProxy: me,
        forceWorkerProxyReason: fe,
        routingDecisionMode: Y
      });
      return {
        request: a,
        requestMethod: m,
        node: o,
        nodeName: i,
        nodeKey: c,
        entryMode: A,
        env: l,
        ctx: d,
        startTime: f,
        currentConfig: p,
        rawRequestUrl: g,
        requestUrl: L,
        requestOrigin: g.origin,
        rawProxyPath: w,
        proxyPath: M,
        linkVariant: G,
        forceWorkerProxy: me,
        forceWorkerProxyReason: fe,
        clientIp: I,
        inboundIp: C,
        logInboundColo: T,
        country: x,
        finalOrigin: U,
        dynamicCors: k,
        routeContextDiagnostics: E,
        requestTraits: le,
        protocolStrategy: pe.strategy,
        routingDecisionMode: Y,
        entryRoutingDecision: re,
        enableH3: ot,
        forceH1: Vt,
        protocolFallback: Oe,
        upstreamTimeoutMs: Be,
        upstreamRetryAttempts: Mt,
        hedgeFailoverEnabled: rt,
        hedgeProbePreferGet: It,
        hedgeProbePath: Pt,
        hedgeProbeTimeoutMs: Gr,
        hedgeProbeParallelism: xt,
        hedgeWaitTimeoutMs: mr,
        hedgeLockTtlMs: Ot,
        hedgePreferredTtlSec: at,
        hedgeFailureCooldownSec: jr,
        hedgeWakeJitterMs: pr,
        playbackInfoCacheEnabled: _t,
        playbackInfoCacheTtlSec: bt,
        effectivePlaybackInfoMode: H,
        playbackInfoRewriteUrlMode: j,
        playbackInfoCacheState: le.isPlaybackInfoRequest === !0 ? _t && bt > 0 ? "miss" : "skip" : "",
        playbackInfoCacheKey: "",
        playbackInfoRewrite: le.isPlaybackInfoRequest === !0 && H === "passthrough" ? "passthrough" : "",
        playbackAbsoluteFallbackEligible: N,
        playbackAbsoluteFallbackLocation: N ? Im(w, g) : "",
        playbackUrlMode: N ? "absolute" : le.isPlaybackInfoRequest === !0 && H === "rewrite" ? String(j || "relative") : "",
        playbackFallback: N ? "none" : "",
        playbackPathFix: D,
        rewritePlaybackEntry: ne,
        playbackRelayTargetUrl: P?.targetUrl instanceof URL ? P.targetUrl : null,
        targetHotCacheState: String(u.targetHotCacheState || "").trim() || (le.isPlaybackCriticalRequest === !0 ? "miss" : "skip"),
        playbackRouteHotTargetRecords: Array.isArray(u.cachedTargetRecords) ? u.cachedTargetRecords : null,
        videoProgressForwardEnabled: gr,
        videoProgressForwardIntervalSec: Gt,
        effectiveRealClientIpMode: Le,
        effectiveMediaAuthMode: qr,
        nodeDerivedCacheRevision: We,
        failoverContext: null,
        failoverTelemetry: null,
        failoverForegroundWaitUsed: !1,
        progressForwardMode: "",
        progressForwardSessionKey: "",
        imageCacheMaxAge: nt,
        metadataCacheKey: q,
        metadataCache: X,
        metadataCacheIdentityPartition: z,
        metadataCachePolicyRevision: V,
        redirectTrace: null
      };
    },
    cleanupPlaybackInfoResponseCache(a = K()) {
      t.cleanup(a);
    },
    buildPlaybackInfoAuthSignature(a, o = null) {
      const s = a?.requestUrl instanceof URL ? a.requestUrl : null, i = o?.newHeaders || a?.request?.headers || null, c = Fo(i), l = vo(Xe(i, "Cookie"), sn);
      return Uo([
        s ? ce(s.searchParams.get("api_key") || s.searchParams.get("X-Emby-Token") || s.searchParams.get("X-MediaBrowser-Token") || "") : "",
        c?.token ? ce(c.token) : "",
        c?.deviceId ? ce(c.deviceId) : "",
        Xe(i, "Authorization") ? ce(Xe(i, "Authorization")) : "",
        Xe(i, "X-Emby-Authorization") ? ce(Xe(i, "X-Emby-Authorization")) : "",
        Xe(i, "X-MediaBrowser-Authorization") ? ce(Xe(i, "X-MediaBrowser-Authorization")) : "",
        l ? ce(l) : ""
      ]);
    },
    buildPlaybackInfoCacheKey(a, o = null) {
      if (a?.requestTraits?.isPlaybackInfoRequest !== !0) return "";
      if (a.playbackInfoCacheEnabled !== !0 || Number(a.playbackInfoCacheTtlSec) <= 0)
        return a.playbackInfoCacheState = "skip", a.playbackInfoCacheKey = "", "";
      const s = a.requestMethod;
      if (s !== "GET" && s !== "HEAD" && o?.preparedBodyMode !== "buffered")
        return a.playbackInfoCacheState = "skip", a.playbackInfoCacheKey = "", "";
      const i = o?.preparedBodyMode === "buffered" ? String(o?.preparedBodyText || to(o?.preparedBody)) : "", c = `playback-info:${Uo([
        String(a?.nodeName || "").trim(),
        String(a?.nodeDerivedCacheRevision || "").trim(),
        s,
        String(a?.proxyPath || "").trim(),
        String(a?.requestUrl?.search || "").trim(),
        i ? ce(i) : "",
        e.buildPlaybackInfoAuthSignature(a, o),
        zt(a?.effectivePlaybackInfoMode),
        String(a?.playbackInfoRewriteUrlMode || "relative")
      ])}`;
      return a.playbackInfoCacheKey = c, c;
    },
    async storePlaybackInfoResponseCache(a, o, s = null, i = null) {
      if (a?.requestTraits?.isPlaybackInfoRequest !== !0) return !1;
      const c = a.playbackInfoCacheKey || e.buildPlaybackInfoCacheKey(a, s);
      return !c || !Jt(i) || i.response !== o ? !1 : t.set(c, i, {
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
function Hp(n = {}, e = {}) {
  return {
    parsePlaybackSessionControlPayload(r, t = null) {
      if (r?.playbackSessionControlPayload) return r.playbackSessionControlPayload;
      const a = r?.requestUrl instanceof URL ? r.requestUrl : null, o = {};
      if (a) for (const [d, u] of a.searchParams.entries()) {
        const f = String(d || "").trim().toLowerCase();
        !f || o[f] !== void 0 || (o[f] = u);
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
      const c = String(t?.preparedBodyText || to(t?.preparedBody));
      if (!c.trim())
        return r && (r.playbackSessionControlPayload = s), s;
      const l = String(t?.newHeaders?.get("Content-Type") || r?.request?.headers?.get("Content-Type") || "").toLowerCase().split(";", 1)[0].trim();
      try {
        if (l === "application/json" || l === "text/json" || l === "text/plain" || /^application\/[a-z0-9!#$&^_.+-]+\+json$/i.test(l)) {
          const d = JSON.parse(c);
          if (!F(d)) throw new TypeError("playback_control_body_not_object");
          s.body = gi(d), s.parseMode = l === "text/plain" ? "text_plain_json" : "json";
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
      const a = e.parsePlaybackSessionControlPayload(r, t), o = (g = []) => {
        const h = jo(a.query, g);
        if (String(h || "").trim()) return String(h).trim();
        const y = jo(a.body, g);
        return String(y || "").trim();
      }, s = o(["SessionId"]), i = o(["PlaySessionId"]), c = o(["DeviceId"]), l = o(["ItemId"]), d = String(r?.nodeName || "unknown").trim().toLowerCase() || "unknown";
      let u = "", f = "", m = "weak";
      if (s)
        u = `session:${s}`, f = `session:${s}`, m = "strong";
      else if (i)
        u = `play:${i}`, f = `play:${i}`, m = "strong";
      else if (c)
        u = `device-item:${c}:${l}`, f = `device:${c}`;
      else {
        const g = r?.request?.headers;
        u = `fallback:${bn([
          g?.get?.("Authorization"),
          g?.get?.("X-Emby-Token"),
          g?.get?.("X-MediaBrowser-Token"),
          g?.get?.("X-Emby-Device-Id"),
          c,
          r?.clientIp,
          l
        ].map((h) => String(h || "").trim()).join("|"))}`, f = u;
      }
      const p = bn(`${d}|${f}`);
      return {
        sessionKey: `${d}|${u}`,
        sessionIdentityFingerprint: p,
        sessionFingerprint: bn(`${p}|${l}`),
        sessionStrength: m,
        itemId: l,
        parseError: a.parseError === !0
      };
    }
  };
}
function kp(n = {}, e = {}) {
  const { CacheManager: r } = n;
  return {
    buildPlaybackProgressRelayEntry(t = 0, a = null) {
      return {
        lastForwardAt: 0,
        lastTouchedAt: K(),
        intervalMs: Math.max(0, Number(t) || 0),
        waitUntilCtx: a || null,
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
    isPlaybackProgressRelayTerminal(t, a = K()) {
      return !t || String(t.terminalState || "").trim().toLowerCase() !== "stopped" ? !1 : Number(t.terminalTombstoneUntil || 0) > a;
    },
    markPlaybackProgressRelayStopped(t, a) {
      const o = oe.PlaybackProgressRelay;
      if (!(o instanceof Map) || !t) return null;
      const s = Math.max(0, Number(a?.videoProgressForwardIntervalSec) || 0) * 1e3, i = o.get(t) || e.buildPlaybackProgressRelayEntry(s, a?.ctx || null), c = K();
      return i.intervalMs = s > 0 ? s : Math.max(0, Number(i.intervalMs) || 0), i.waitUntilCtx = a?.ctx || i.waitUntilCtx || null, i.nodeName = String(a?.nodeName || i.nodeName || "").trim().toLowerCase(), i.nodeRevision = String(a?.nodeDerivedCacheRevision || i.nodeRevision || "").trim(), i.pendingSnapshot = null, i.scheduledFlushAt = 0, i.terminalState = "stopped", i.terminalAt = c, i.terminalTombstoneUntil = c + e.getPlaybackProgressRelayTerminalTtlMs(i.intervalMs), i.lastTouchedAt = c, Ss(t, i), i;
    },
    cleanupPlaybackProgressRelay(t = K()) {
      const a = oe.PlaybackProgressRelay;
      if (!(a instanceof Map) || a.size <= 0) return;
      const o = Math.max(3e4, Math.max(1, Number(si) || 1) * 2e4);
      for (const [i, c] of a) {
        const l = Number(c?.lastTouchedAt || c?.lastForwardAt || 0) || 0, d = !!c?.pendingSnapshot || !!c?.activeFlushPromise, u = Number(c?.terminalTombstoneUntil || 0) || 0;
        if (u > 0) {
          !d && u <= t && ra(i);
          continue;
        }
        !d && l > 0 && l + o <= t && ra(i);
      }
      const s = Math.max(1, Number(O.Defaults.VideoProgressForwardSessionMax) || 1);
      for (; a.size > s; ) {
        const i = a.keys().next().value;
        if (!i) break;
        ra(i);
      }
    },
    buildPlaybackProgressSnapshot(t, a, o, s) {
      if (!t || !a || typeof o != "function" || !Ze(s) || (a.preparedBodyMode === "buffered" && Number(a.preparedBody?.byteLength) || 0) > sd) return null;
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
      const s = Math.max(K(), Number(a.lastForwardAt) || 0) + o;
      a.scheduledFlushAt = s, a.lastTouchedAt = K();
      const i = (async () => {
        await co(Math.max(0, s - K()));
        const l = oe.PlaybackProgressRelay.get(t);
        !l || l !== a || Number(l.scheduledFlushAt) !== s || (l.scheduledFlushAt = 0, await e.flushPlaybackProgressRelayEntry(t, {
          background: !0,
          attachToCtx: !1
        }));
      })();
      a.scheduledPromise = i;
      const c = a.waitUntilCtx || a.pendingSnapshot?.ctx || null;
      c?.waitUntil && c.waitUntil(i);
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
      const o = oe.PlaybackProgressRelay, s = o.get(t);
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
      s.pendingSnapshot = null, s.scheduledFlushAt = 0, s.lastForwardAt = K(), s.lastTouchedAt = s.lastForwardAt;
      const c = (async () => {
        try {
          return await e.forwardPlaybackProgressSnapshot(i), !0;
        } catch {
          const l = o.get(t);
          return l && l === s && !l.pendingSnapshot && (l.pendingSnapshot = i, l.lastForwardAt = K(), l.lastTouchedAt = l.lastForwardAt), !1;
        } finally {
          const l = o.get(t);
          if (!l || l !== s) return;
          l.activeFlushPromise = null, l.lastTouchedAt = K(), l.pendingSnapshot && e.schedulePlaybackProgressRelayFlush(t, l);
        }
      })();
      return s.activeFlushPromise = c, a.attachToCtx === !0 && s.waitUntilCtx?.waitUntil && s.waitUntilCtx.waitUntil(c), await c === !0;
    },
    async flushPlaybackProgressBeforeStopped(t) {
      const a = String(t?.progressForwardSessionKey || "").trim();
      if (!a) return !1;
      const o = oe.PlaybackProgressRelay.get(a);
      if (!o) return !1;
      if (o.activeFlushPromise) try {
        await o.activeFlushPromise;
      } catch {
      }
      return o.pendingSnapshot ? (o.scheduledFlushAt = 0, await e.flushPlaybackProgressRelayEntry(a, {
        background: !1,
        attachToCtx: !1
      })) : !1;
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
        return t.progressForwardMode = "started_passthrough", t.progressForwardSessionKey && ra(t.progressForwardSessionKey), null;
      if (t.requestTraits.isPlaybackStoppedRequest === !0)
        return t.progressForwardMode = await e.flushPlaybackProgressBeforeStopped(t) ? "flush_before_stopped" : "stopped_passthrough", t.progressForwardSessionKey && e.markPlaybackProgressRelayStopped(t.progressForwardSessionKey, t), null;
      if (t.requestTraits.isPlaybackProgressRequest !== !0) return null;
      const l = Ze(s[0]) ? s[0] : null;
      if (!l)
        return t.progressForwardMode = "pass_through", null;
      if (t.requestMethod !== "GET" && t.requestMethod !== "HEAD" && a?.preparedBodyMode !== "buffered")
        return t.progressForwardMode = "unbuffered_bypass", null;
      const d = oe.PlaybackProgressRelay;
      e.cleanupPlaybackProgressRelay();
      const u = t.progressForwardSessionKey || `fallback:${t.clientIp}:${t.proxyPath}`;
      let f = d.get(u);
      f || (f = e.buildPlaybackProgressRelayEntry(i * 1e3, t.ctx)), f.intervalMs = i * 1e3, f.waitUntilCtx = t.ctx, f.nodeName = String(t.nodeName || "").trim().toLowerCase(), f.nodeRevision = String(t.nodeDerivedCacheRevision || "").trim();
      const m = K();
      if (f.lastTouchedAt = m, e.isPlaybackProgressRelayTerminal(f, m))
        return t.progressForwardMode = "late_progress_dropped_after_stopped", e.buildPlaybackProgressThrottleResponse(t);
      if (f.terminalState = "", f.terminalAt = 0, f.terminalTombstoneUntil = 0, Ss(u, f), !(f.lastForwardAt > 0 && m - f.lastForwardAt < f.intervalMs) && !f.activeFlushPromise && !f.pendingSnapshot)
        return f.pendingSnapshot = null, f.scheduledFlushAt = 0, f.lastForwardAt = m, t.progressForwardMode = "forward_now", null;
      const p = e.buildPlaybackProgressSnapshot(t, a, o, l);
      return p ? (f.pendingSnapshot = p, f.lastTouchedAt = m, t.progressForwardMode = "throttled_204", e.schedulePlaybackProgressRelayFlush(u, f), e.buildPlaybackProgressThrottleResponse(t)) : (t.progressForwardMode = "snapshot_bypass", null);
    }
  };
}
function Kp(n = {}, e = {}) {
  return {
    ...Up(n, e),
    ...Hp(n, e),
    ...kp(n, e)
  };
}
function zp(n = {}, e = {}) {
  const { nodeRepository: r } = n;
  return {
    resolveCorsOrigin(t, a) {
      const o = a.headers.get("Origin"), s = ws(t);
      return s.corsOrigins.length > 0 ? o && s.corsOriginSet.has(o) ? o : s.corsOrigins[0] : o || "*";
    },
    buildEdgeResponseHeaders(t, a = {}) {
      const o = new Headers({
        "Access-Control-Allow-Origin": t,
        "Cache-Control": "no-store",
        ...a
      });
      return Ce(o), o;
    },
    classifyRequest(t, a, o, s, i = {}) {
      const c = t.method, l = t.headers.get("Range"), d = t.headers.get("If-Range"), u = zr.test(a) || Kr.test(a), f = ld.test(a), m = dr.test(a), p = ht.test(a), g = di.test(a), h = Co(a), y = t.headers.get("Upgrade")?.toLowerCase() === "websocket", S = $i(a), _ = Bi(a), A = Wi(a), b = Iu(a), R = _ || A || b, E = dd.test(a) || /\/videos\/[^/]+\/(stream|original|download|file)/i.test(a) || /\/items\/[^/]+\/download/i.test(a) || o.searchParams.get("Static") === "true" || o.searchParams.get("Download") === "true", w = c === "GET" || c === "HEAD", D = E && !p && !g && !m && !u, C = S || h || D || p || g, T = !u && !f && !m && !p && !g && !h && !D && !y, I = i.nodeDirectSource === !0 && w && D, x = i.directStaticAssets === !0 && w && f, U = i.directHlsDash === !0 && w && (p || g), k = I ? "entry_direct_media" : x ? "entry_direct_static_asset" : U ? "entry_direct_hls_dash" : "", G = !!k, P = G;
      return {
        rangeHeader: l,
        ifRangeHeader: d,
        enablePrewarm: s.enablePrewarm !== !1 && !G,
        prewarmCacheTtl: ue(s.prewarmCacheTtl, ad, 0, 3600),
        prewarmDepth: Di(s.prewarmDepth),
        isImage: u,
        isStaticFile: f,
        isSubtitle: m,
        isManifest: p,
        isSegment: g,
        isSmartStrmMedia: h,
        isWsUpgrade: y,
        looksLikeVideoRoute: E,
        isBigStream: D,
        isPlaybackCriticalRequest: C,
        isApiRequest: T,
        isPlaybackInfoRequest: S,
        isPlaybackProgressRequest: _,
        isPlaybackStoppedRequest: A,
        isPlaybackStartedRequest: b,
        isPlaybackSessionControlRequest: R,
        isMetadataCacheable: c === "GET" && !y && !G && (u || m || p),
        isCacheableAsset: c === "GET" && !y && (u || f || m || g || p),
        nodeDirectMedia: I,
        directStaticAssets: x,
        directHlsDash: U,
        legacyEntryOffloadEnabled: G,
        legacyEntryOffloadReason: k,
        canStripAuthOnProtocolFallback: w && !T && (h || D || p || g),
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
      return Nr(t.routingDecisionMode) === "legacy" ? e.buildLegacyEntryRoutingDecision(t.requestTraits) : e.buildSimplifiedEntryRoutingDecision(t);
    },
    buildSimplifiedRedirectRoutingDecision(t, a, o, s, i = {}, c = {}) {
      const l = t.origin === a.origin, d = i.forceVideoDirect === !0, u = i.forceVideoProxy === !0, f = Cf(i.currentStatus, o);
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
    evaluateFirewall(t, a, o, s) {
      const i = ws(t);
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
      let l = Ye.RateLimitCache.get(a);
      return (!l || s > l.resetAt) && (l = {
        count: 0,
        resetAt: s + 6e4
      }), l.count += 1, xe(Ye.RateLimitCache, a, l, O.Defaults.RateLimitCacheMax), l.count > c ? new Response("Rate Limit Exceeded", {
        status: 429,
        headers: e.buildEdgeResponseHeaders(i)
      }) : null;
    },
    parseTargetRecords(t, a, o = {}) {
      const s = Array.isArray(o.cachedTargetRecords) ? o.cachedTargetRecords : [];
      if (s.length > 0 && s.every(Ze)) return {
        targetRecords: s,
        invalidResponse: null
      };
      const i = r.getOrderedNodeLines(t), c = (i.length ? i.map((l) => l.target) : String(t.target || "").split(",").map((l) => l.trim()).filter(Boolean)).map((l) => un(l)).filter(Ze);
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
function $p(n = {}, e = {}) {
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
      } : Hd(a) < 2 ? {
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
    pruneFailoverStateEntry(t, a = Zr * 1e3, o = K()) {
      if (!t || typeof t != "object") return null;
      t.failingTargets instanceof Map || (t.failingTargets = /* @__PURE__ */ new Map());
      for (const [u, f] of t.failingTargets) Number(f) <= o && t.failingTargets.delete(u);
      Number(t.preferredTargetExpiresAt) <= o && (t.preferredTargetKey = "", t.preferredTargetExpiresAt = 0);
      const s = Number(t.lastProbeResult?.completedAt) || 0;
      t.lastProbeResult && s > 0 && s + Math.max(1e3, Number(a) || 0) <= o && (t.lastProbeResult = null), t.inFlightProbe && Number(t.inFlightProbe.expiresAt) <= o && (t.inFlightProbe = null);
      const i = !!String(t.preferredTargetKey || "").trim(), c = t.failingTargets.size > 0, l = !!t.inFlightProbe, d = !!t.lastProbeResult;
      return i || c || l || d ? t : null;
    },
    getOrCreateFailoverStateEntry(t, a = Zr * 1e3) {
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
      const c = e.pruneFailoverStateEntry(i, a, K()) || i;
      return xe(s, o, c, rr), c;
    },
    getFailoverStateSnapshot(t, a = Zr * 1e3) {
      const o = String(t || "").trim();
      if (!o) return null;
      const s = oe.ProxyFailoverStateCache, i = s.get(o);
      if (!i) return null;
      const c = e.pruneFailoverStateEntry(i, a, K());
      return c ? (Ya(s, o), {
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
      const d = [], u = [], f = [];
      for (const m of o) {
        const p = Ge(m);
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
      const o = e.ensureFailoverTelemetry(t), s = Ud(a), i = Math.max(1e3, (Number(t?.hedgePreferredTtlSec) || Zr) * 1e3), c = e.isFailoverEligible(t, a), l = e.buildFailoverCacheKey(t?.nodeName, s, t?.nodeDerivedCacheRevision), d = c.eligible ? e.getFailoverStateSnapshot(l, i) : null, u = c.eligible ? e.reorderRetryTargetsForFailover(a, d) : Array.isArray(a) ? a.slice() : [];
      let f = "disabled";
      return t?.hedgeFailoverEnabled === !0 && (c.eligible ? d?.preferredTargetKey ? f = "preferred_reordered" : d?.probeWinnerTargetKey ? f = "probe_hint_reordered" : Array.isArray(d?.failingTargetKeys) && d.failingTargetKeys.length > 0 ? f = "failure_demoted" : f = "ready" : f = c.reason || "ineligible"), o.overlay = f, o.preferredTarget = String(d?.preferredTargetKey || "").trim(), t.failoverContext = {
        enabled: t?.hedgeFailoverEnabled === !0,
        eligible: c.eligible,
        eligibilityReason: c.reason,
        cacheKey: l,
        orderedTargetSignature: s,
        preferredTtlMs: i,
        probePath: Aa(t?.hedgeProbePath, Zs),
        probePreferGet: t?.hedgeProbePreferGet !== !1,
        probeTimeoutMs: Math.max(250, Number(t?.hedgeProbeTimeoutMs) || yo),
        probeParallelism: Math.max(1, Math.min(2, Number(t?.hedgeProbeParallelism) || ei)),
        waitTimeoutMs: Math.max(250, Number(t?.hedgeWaitTimeoutMs) || ti),
        lockTtlMs: Math.max(1e3, Number(t?.hedgeLockTtlMs) || ri),
        failureCooldownMs: Math.max(1e3, (Number(t?.hedgeFailureCooldownSec) || ai) * 1e3),
        wakeJitterMs: Math.max(0, Number(t?.hedgeWakeJitterMs) || ni),
        originalTargetRecords: Array.isArray(a) ? a.slice() : [],
        retryTargetRecords: u.slice(),
        snapshot: d
      }, u;
    },
    maybeInvalidateHotSnapshotOnFailover(t, a) {
      if (String(t?.targetHotCacheState || "").trim() !== "hit") return;
      const o = Ge(a);
      o && (Array.isArray(t?.playbackRouteHotTargetRecords) ? t.playbackRouteHotTargetRecords : []).map((s) => Ge(s)).filter(Boolean).includes(o) && r.invalidatePlaybackRouteHotCache(t?.nodeName, t?.env);
    },
    markFailoverTargetFailure(t, a, o = "", s = {}) {
      const i = t?.failoverContext;
      if (!i?.eligible) return;
      const c = Ge(a);
      if (!c) return;
      const l = e.ensureFailoverTelemetry(t), d = e.getOrCreateFailoverStateEntry(i.cacheKey, i.preferredTtlMs);
      d && (d.failingTargets.set(c, K() + i.failureCooldownMs), String(d.preferredTargetKey || "").trim() === c && (d.preferredTargetKey = "", d.preferredTargetExpiresAt = 0), xe(oe.ProxyFailoverStateCache, i.cacheKey, d, rr), l.overlay = String(s.overlay || "target_demoted").trim() || "target_demoted", l.demotedTarget = c, l.fastFailReason = String(o || s.fastFailReason || l.fastFailReason || "").trim(), e.maybeInvalidateHotSnapshotOnFailover(t, a));
    },
    markFailoverBusinessSuccess(t, a, o = {}) {
      const s = t?.failoverContext;
      if (!s?.eligible) return;
      const i = Number(o.status) || 0;
      if (!(i >= 200 && i < 300 || i === 206 || i >= 300 && i < 400)) return;
      const c = Ge(a);
      if (!c) return;
      const l = e.ensureFailoverTelemetry(t), d = e.getOrCreateFailoverStateEntry(s.cacheKey, s.preferredTtlMs);
      d && (d.failingTargets.delete(c), d.preferredTargetKey = c, d.preferredTargetExpiresAt = K() + s.preferredTtlMs, xe(oe.ProxyFailoverStateCache, s.cacheKey, d, rr), l.overlay = String(o.overlay || "preferred_promoted").trim() || "preferred_promoted", l.preferredTarget = c);
    },
    getFailoverProbeCandidates(t, a = {}) {
      const o = t?.failoverContext;
      if (!o?.eligible) return [];
      const s = e.getFailoverStateSnapshot(o.cacheKey, o.preferredTtlMs), i = e.reorderRetryTargetsForFailover(o.originalTargetRecords, s), c = /* @__PURE__ */ new Set(), l = /* @__PURE__ */ new Set(), d = Ge(a.failedTargetRecord), u = Ge(a.activeTargetRecord), f = String(a.excludeTargetKey || "").trim();
      return d && c.add(d), u && c.add(u), f && c.add(f), i.filter((m) => {
        const p = Ge(m);
        return !p || c.has(p) || l.has(p) ? !1 : (l.add(p), !0);
      }).slice(0, o.probeParallelism);
    }
  };
}
function Bp(n = {}, e = {}) {
  return {
    buildFailoverProbeHeaders() {
      return new Headers({
        Accept: "*/*",
        "Cache-Control": "no-store",
        Pragma: "no-cache"
      });
    },
    async performFailoverProbeRequest(r, t, a, o, s = null) {
      const i = Tp([
        r?.request?.signal,
        r?.requestLifecycle?.signal,
        s
      ]);
      let c = null, l = !1;
      try {
        return o > 0 && (c = setTimeout(() => {
          l = !0, i.abort(`probe_timeout_${o}ms`);
        }, o)), await Ke(t.toString(), {
          method: a,
          headers: e.buildFailoverProbeHeaders(),
          redirect: "manual",
          signal: i.signal
        });
      } catch (d) {
        if (l) {
          const u = /* @__PURE__ */ new Error(`probe_timeout_${o}ms`);
          throw u.code = "UPSTREAM_TIMEOUT", u;
        }
        throw r?.requestLifecycle?.getAbortReason?.() && Qt(d) ? or(r.requestLifecycle.getAbortReason()) : d;
      } finally {
        c !== null && clearTimeout(c), i.dispose();
      }
    },
    async runFailoverProbeCandidate(r, t, a = {}) {
      const o = r?.failoverContext, s = o?.probePath || Aa(r?.hedgeProbePath, Zs), i = Math.max(250, Number(o?.probeTimeoutMs) || yo), c = Ge(t), l = yc(t, s);
      if (!l) return {
        ok: !1,
        status: 0,
        targetRecord: t,
        targetKey: c,
        reason: "invalid_probe_target",
        elapsedMs: 0
      };
      const d = K();
      let u = null;
      const f = o?.probePreferGet !== !1;
      let m = f ? "GET" : "HEAD";
      try {
        if (u = await e.performFailoverProbeRequest(r, l, m, i, a.parentSignal || null), !f && (u.status === 405 || u.status === 501)) {
          try {
            u.body?.cancel?.();
          } catch {
          }
          m = "GET", u = await e.performFailoverProbeRequest(r, l, "GET", i, a.parentSignal || null);
        }
        const p = Math.max(0, K() - d);
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
        const g = Math.max(0, K() - d), h = String(p?.code || "").trim().toUpperCase(), y = String(r?.requestLifecycle?.getAbortReason?.() || "").trim();
        return y ? {
          ok: !1,
          targetRecord: t,
          targetKey: c,
          reason: y.toLowerCase(),
          elapsedMs: g,
          aborted: !0
        } : String(a.parentSignal?.reason || "").trim() === "probe_winner" && Qt(p) ? {
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
          aborted: Qt(p)
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
      const d = K();
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
      const u = Math.max(0, K() - d), f = e.getOrCreateFailoverStateEntry(o.cacheKey, o.preferredTtlMs), m = l ? "ok" : "miss", p = l ? String(a.reason || "probe_ok").trim() || "probe_ok" : String(c.find((S) => S?.aborted !== !0 && S?.reason)?.reason || "probe_no_winner").trim() || "probe_no_winner", g = l && typeof l == "object" ? l : null, h = String(g ? g.targetKey : "").trim(), y = g ? g.targetRecord : null;
      return f && (f.lastProbeResult = {
        status: m,
        reason: p,
        winnerTargetKey: h,
        completedAt: K(),
        elapsedMs: u
      }, xe(oe.ProxyFailoverStateCache, o.cacheKey, f, rr)), {
        status: m,
        reason: p,
        winnerTargetRecord: y,
        winnerTargetKey: h,
        elapsedMs: u,
        attempts: c
      };
    },
    startOrJoinFailoverProbe(r, t = {}) {
      const a = r?.failoverContext, o = e.ensureFailoverTelemetry(r);
      if (!a?.eligible) return null;
      const s = e.getOrCreateFailoverStateEntry(a.cacheKey, a.preferredTtlMs), i = K();
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
      const l = `${i}-${Math.random().toString(36).slice(2, 10)}`, d = e.runFailoverProbeTask(r, c, t).finally(() => {
        const u = e.getOrCreateFailoverStateEntry(a.cacheKey, a.preferredTtlMs);
        !u?.inFlightProbe || String(u.inFlightProbe.token || "").trim() !== l || (u.inFlightProbe = null, xe(oe.ProxyFailoverStateCache, a.cacheKey, u, rr));
      });
      return s && (s.inFlightProbe = {
        token: l,
        startedAt: i,
        expiresAt: i + a.lockTtlMs,
        reason: String(t.reason || "").trim(),
        promise: d
      }, xe(oe.ProxyFailoverStateCache, a.cacheKey, s, rr)), o.overlay = (t.background === !0 ? "background_probe_started" : "probe_started").trim(), {
        joined: !1,
        startedAt: i,
        promise: d
      };
    },
    async maybeRunForegroundFailoverWait(r, t = {}) {
      const a = r?.execution, o = a?.failoverContext, s = e.ensureFailoverTelemetry(a);
      if (!o?.eligible || a?.failoverForegroundWaitUsed === !0) return null;
      a.failoverForegroundWaitUsed = !0;
      const i = t.targetRecord, c = Number(t.responseStatus) || 0, l = String(t.reason || (c > 0 ? `upstream_status_${c}` : "retryable_failure")).trim() || "retryable_failure";
      e.markFailoverTargetFailure(a, i, l, { overlay: "failure_demoted" });
      const d = e.startOrJoinFailoverProbe(a, {
        reason: l,
        failedTargetRecord: i
      });
      if (!d?.promise) return null;
      const u = await wp(d.promise, o.waitTimeoutMs, a?.requestLifecycle);
      if (s.waitJoinMs = u.timedOut === !0 ? o.waitTimeoutMs : Math.max(0, K() - Number(d.startedAt || K())), u.timedOut === !0)
        return s.overlay = "probe_wait_timeout", s.fastFailReason = "probe_wait_timeout", null;
      const f = u.value && typeof u.value == "object" ? u.value : null;
      if (s.probeReason = d.joined === !0 ? "join_existing_probe" : l, s.probeElapsedMs = Math.max(0, Number(f?.elapsedMs) || 0), s.probeWinner = String(f?.winnerTargetKey || "").trim(), !f || f.status !== "ok" || !Ze(f.winnerTargetRecord))
        return s.overlay = "probe_miss", s.fastFailReason = String(f?.reason || "probe_no_winner").trim() || "probe_no_winner", null;
      const m = Ge(i), p = Ge(f.winnerTargetRecord);
      if (!p || p === m)
        return s.overlay = "probe_miss", s.fastFailReason = "probe_reused_failed_target", null;
      o.wakeJitterMs > 0 && await Dp(Math.floor(Math.random() * (o.wakeJitterMs + 1)), a?.requestLifecycle);
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
          const y = fr(f.winnerTargetRecord, r.proxyPath);
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
      if (s > 0 && s + a.preferredTtlMs > K() || o?.inFlightProbe) return;
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
function Wp(n = {}, e = {}) {
  return {
    ...zp(n, e),
    ...$p(n, e),
    ...Bp(n, e)
  };
}
function Vp(n = {}, e = {}) {
  const {} = n, r = {
    async buildProxyRequestState(t, a, o, s, i, c, l, d, u = {}) {
      const f = mp(t.headers);
      Un.forEach((x) => f.delete(x));
      const m = /* @__PURE__ */ new Set();
      let p = null;
      if (a.headers && typeof a.headers == "object") for (const [x, U] of Object.entries(a.headers)) {
        const k = String(x).toLowerCase();
        Un.has(k) || (m.add(k), k === "cookie" ? p = String(U) : f.set(x, String(U)));
      }
      const g = Um(f.get("Cookie"), p, ["auth_token", ...sn]);
      g ? f.set("Cookie", g) : f.delete("Cookie"), gp(f, u.effectiveMediaAuthMode || a.mediaAuthMode);
      const h = Xd(u.effectiveRealClientIpMode || a.realClientIpMode);
      h === "none" && ud.forEach((x) => f.delete(x)), (h === "full" || h === "real-ip-only") && f.set("X-Real-IP", i), h === "full" && f.set("X-Forwarded-For", i), f.set("X-Forwarded-Host", s.host), f.set("X-Forwarded-Proto", s.protocol.replace(":", "")), c.isWsUpgrade ? (f.set("Upgrade", "websocket"), f.set("Connection", "Upgrade")) : l && f.set("Connection", "keep-alive"), (c.isBigStream || c.isSmartStrmMedia || c.isSegment || c.isManifest) && !m.has("referer") && f.delete("Referer");
      const y = m.has("origin"), S = m.has("referer"), _ = f.has("Origin"), A = f.has("Referer");
      let b = "", R = "/";
      if (A && !S) try {
        const x = new URL(f.get("Referer") || "");
        b = String(x.origin || "").trim(), R = `${x.pathname || "/"}${x.search || ""}` || "/";
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
      }, w = t.method !== "GET" && t.method !== "HEAD";
      let D = null, C = "none", T = "";
      if (w && t.body) {
        const x = Ns(t.headers.get("Content-Length"));
        if (Number.isFinite(x) && x >= 0 && x <= td) try {
          D = await t.clone().arrayBuffer(), C = "buffered", (c.isPlaybackInfoRequest === !0 || c.isPlaybackSessionControlRequest === !0) && (T = to(D));
        } catch {
          D = t.body, C = "stream";
        }
        else
          D = t.body, C = "stream";
      }
      const I = w ? d.slice(0, 1) : d;
      return {
        newHeaders: f,
        adminCustomHeaders: m,
        transportTemplate: E,
        preparedBody: D,
        preparedBodyMode: C,
        preparedBodyText: T,
        retryTargetRecords: I,
        allowAutomaticRetry: !w,
        clientRedirectAuthPolicy: Sa(f)
      };
    },
    buildProxyResponseHeaders(t, a, o, s, i, c = {}) {
      const l = new Headers(t.headers);
      fd.forEach((f) => l.delete(f)), l.set("Access-Control-Allow-Origin", s), o && o["Access-Control-Expose-Headers"] && l.set("Access-Control-Expose-Headers", o["Access-Control-Expose-Headers"]), o && o["Access-Control-Allow-Methods"] && l.set("Access-Control-Allow-Methods", o["Access-Control-Allow-Methods"]);
      const d = a.headers.get("Access-Control-Request-Headers");
      d ? (l.set("Access-Control-Allow-Headers", d), xr(l, "Access-Control-Request-Headers")) : o && o["Access-Control-Allow-Headers"] && l.set("Access-Control-Allow-Headers", o["Access-Control-Allow-Headers"]), s !== "*" && xr(l, "Origin"), (!c.enableH3 || c.forceH1) && l.delete("Alt-Svc");
      const u = ue(c.imageCacheMaxAge, ii * 86400, 0, 365 * 86400);
      if (t.status >= 400 || i.isManifest || i.isBigStream || i.isSmartStrmMedia) l.set("Cache-Control", "no-store");
      else if (c.proxiedExternalRedirect) l.set("Cache-Control", "no-store");
      else if (i.isImage || i.isStaticFile || i.isSubtitle) {
        const f = jm(a) ? "private" : "public";
        l.set("Cache-Control", `${f}, max-age=${u}`);
      }
      return Ce(l), l;
    },
    applyProxyRedirectHeaders(t, a, o, s, i, c, l, d = {}) {
      if (c) {
        _c(t), t.set("Location", c.toString()), t.set("Cache-Control", "no-store");
        return;
      }
      if (!(a.status >= 300 && a.status < 400)) return;
      const u = t.get("Location");
      if (!u) return;
      const f = bs(ya(u, l || o), o, s, i, {
        linkVariant: d.linkVariant,
        entryMode: d.entryMode
      });
      f && t.set("Location", f);
    },
    buildClientVisibleRedirectUrl(t, a, o, s, i, c = {}) {
      const l = t instanceof URL ? t : ya(t, a);
      if (!l) return null;
      if (c.preserveWorkerProxy !== !0) return l;
      const d = bs(l, a, o, s, {
        linkVariant: c.linkVariant,
        entryMode: c.entryMode
      }), u = yt(o, s, {
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
    buildPlaybackInfoClientVisibleUrl(t, a = "/", o = {}) {
      const s = Z(a), i = String(o.search || ""), c = String(o.hash || "");
      return String(t?.playbackInfoRewriteUrlMode || "").trim() === "absolute" ? bc(t?.requestUrl || t?.rawRequestUrl || "https://playback-info.local/", t?.nodeName, t?.nodeKey, s, {
        linkVariant: t?.linkVariant,
        entryMode: t?.entryMode,
        search: i,
        hash: c
      }).toString() : `${vm(xm(s, t?.nodeName, t?.nodeKey, { entryMode: t?.entryMode }), Om(t))}${i}${c}`;
    },
    buildPlaybackInfoProxyUrl(t, a, o, s) {
      const i = String(a || "").trim();
      if (!i) return "";
      const c = Nm(i, t?.proxyPath || "/", o, t?.requestUrl || t?.rawRequestUrl || s, yt(t?.nodeName, t?.nodeKey, {
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
      if (o) {
        const { resolvedUrl: u, proxyPath: f } = Ta(l, o);
        if (u && f) {
          const m = Lm(f, t?.proxyPath || "/", o);
          return r.buildPlaybackInfoClientVisibleUrl(t, m, {
            search: u.search,
            hash: u.hash
          });
        }
      }
      const d = Pm(t?.requestUrl || t?.rawRequestUrl || "https://playback-info.local/", t?.nodeName, t?.nodeKey, l, {
        linkVariant: t?.linkVariant,
        entryMode: t?.entryMode
      });
      return String(t?.playbackInfoRewriteUrlMode || "").trim() === "absolute" ? d.toString() : r.buildPlaybackInfoClientVisibleUrl(t, d.pathname || "/", {
        search: d.search || "",
        hash: d.hash || ""
      });
    },
    sanitizePlaybackInfoSerializedResponseHeaders: oo,
    parsePlaybackInfoRootObject: va,
    buildPlaybackInfoContractErrorState(t, a, o = "invalid_payload", s = null) {
      const i = a?.response;
      return t.playbackInfoRewrite = "rejected", e.buildProxyErrorState(t, a, {
        message: "Upstream PlaybackInfo response must be a JSON object.",
        guardHeader: "X-Proxy-Contract-Guard",
        guardValue: "playback-info",
        details: F(s) ? s : {
          reason: String(o || "invalid_payload"),
          upstreamStatus: Number(i?.status) || 0,
          contentType: ir(i?.headers?.get?.("Content-Type")) || "missing"
        }
      });
    },
    async guardPlaybackInfoResponseContract(t, a) {
      if (t?.requestTraits?.isPlaybackInfoRequest !== !0 || Jt(a?.playbackInfoRepresentation) && a.playbackInfoRepresentation.response === a?.response) return a;
      const o = await Zc(a?.response, {
        requestMethod: t.requestMethod,
        maxBytes: oi
      });
      return o.kind === "skip" ? a : o.kind === "invalid" ? r.buildPlaybackInfoContractErrorState(t, a, o.reason, o.details) : {
        ...a,
        playbackInfoRepresentation: o.representation
      };
    },
    decodePlaybackInfoJsonValue: Fa,
    normalizePlaybackInfoObjectArray: so,
    sanitizePlaybackInfoMediaSource: Ps,
    sanitizePlaybackInfoMediaSourcesPayload: io,
    rewritePlaybackInfoPayload(t, a, o, s) {
      return xs(a, { buildProxyUrl: (i) => r.buildPlaybackInfoProxyUrl(t, i, o, s) });
    },
    async maybeRewritePlaybackInfoResponse(t, a) {
      if (t?.requestTraits?.isPlaybackInfoRequest !== !0) return a;
      const o = zt(t?.effectivePlaybackInfoMode) === "rewrite", s = o ? "not_needed" : "passthrough", i = a?.response;
      if (!i || !(i.status >= 200 && i.status < 300) || t.requestMethod === "HEAD" || i.status === 204 || i.status === 205 || !i.body)
        return t.playbackInfoRewrite !== "rejected" && (t.playbackInfoRewrite = s), a;
      if ((!Jt(a?.playbackInfoRepresentation) || a.playbackInfoRepresentation.response !== i) && (a = await r.guardPlaybackInfoResponseContract(t, a), !Jt(a?.playbackInfoRepresentation)))
        return a;
      try {
        const c = el(a.playbackInfoRepresentation, {
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
function Gp({ configReader: n, nodeRepository: e, logger: r, cachePort: t, fetchPort: a }) {
  const o = {}, s = {
    CacheManager: t,
    Logger: r,
    configReader: n,
    fetchPort: a,
    nodeRepository: e
  }, i = [
    Ip(s, o),
    Fp(s, o),
    Kp(s, o),
    Wp(s, o),
    Vp(s, o)
  ];
  for (const c of i) for (const [l, d] of Object.entries(c)) o[l] = d;
  return o;
}
function jp({ configReader: n, nodeRepository: e, logger: r, cachePort: t, fetchPort: a }) {
  const o = Gp({
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
function qp(n = {}, e = {}) {
  const { CacheManager: r, withAdminShellRuntimeStatus: t } = n;
  return {
    getStatsBucketParts(a, o = O.Defaults.ScheduleUtcOffsetMinutes) {
      const s = Bt(Number(a) || 0, o);
      return {
        bucketDate: s.dateKey,
        bucketHour: s.hour
      };
    },
    summarizeStatsHourlyEntries(a = [], o = {}) {
      const s = ke(o.utcOffsetMinutes), i = /* @__PURE__ */ new Map();
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
        m.requestCount += 1, tu(c?.requestPath, c?.category) && (m.playCount += 1), eu(c?.requestPath, c?.category) && (m.playbackInfoCount += 1), i.set(f, m);
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
      const i = (Array.isArray(o) ? o : []).map((d) => ({
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
      const o = Number(a?.statsUtcOffsetMinutes);
      return Number.isFinite(o) ? ke(o) : null;
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
      const s = String(o.bucketDate || "").trim(), i = Number(o.startTs) || 0, c = Number(o.endTs) || 0;
      if (!s || i <= 0 || c <= 0 || c < i) return !1;
      await e.ensureStatsHourlySchema(a), await a.prepare(`DELETE FROM ${e.STATS_HOURLY_TABLE} WHERE bucket_date = ?`).bind(s).run();
      const l = await a.prepare(`SELECT timestamp, request_path, category
            FROM ${e.LOGS_TABLE}
            WHERE timestamp >= ? AND timestamp <= ?
            ORDER BY timestamp ASC`).bind(i, c).all(), d = (Array.isArray(l?.results) ? l.results : []).map((u) => ({
        timestamp: Number(u?.timestamp) || 0,
        requestPath: u?.request_path || u?.requestPath || "",
        category: u?.category || ""
      }));
      return await e.incrementStatsHourly(a, d, {
        utcOffsetMinutes: o.utcOffsetMinutes,
        useBatch: !0
      });
    },
    async rebuildStatsHourlyWindow(a, o = {}) {
      if (!a) return !1;
      const s = Number(o.startTs) || 0, i = Number(o.endTs) || 0;
      if (s < 0 || i <= 0 || i < s) return !1;
      await e.ensureStatsHourlySchema(a), await e.clearStatsHourly(a);
      const c = await a.prepare(`SELECT timestamp, request_path, category
            FROM ${e.LOGS_TABLE}
            WHERE timestamp >= ? AND timestamp <= ?
            ORDER BY timestamp ASC`).bind(s, i).all(), l = (Array.isArray(c?.results) ? c.results : []).map((d) => ({
        timestamp: Number(d?.timestamp) || 0,
        requestPath: d?.request_path || d?.requestPath || "",
        category: d?.category || ""
      }));
      return await e.incrementStatsHourly(a, l, {
        utcOffsetMinutes: o.utcOffsetMinutes,
        useBatch: !0
      });
    },
    async ensureStatsHourlyWindowAligned(a, o = {}) {
      const s = e.resolveOpsStatusStores(a), i = s?.db || null;
      if (!i || !await e.hasStatsHourlyTable(i)) return {
        rebuilt: !1,
        reason: "stats_unavailable"
      };
      const c = te(o.config || {}), l = ke(c.scheduleUtcOffsetMinutes), d = await e.getOpsStatusSection(s, "log");
      if (e.getStatsUtcOffsetMinutesFromStatus(d) === l && o.force !== !0) return {
        rebuilt: !1,
        reason: "already_aligned",
        utcOffsetMinutes: l
      };
      const u = o.now instanceof Date ? o.now : /* @__PURE__ */ new Date(), f = ue(c.logRetentionDays, O.Defaults.LogRetentionDays, 1, O.Defaults.LogRetentionDaysMax), m = Math.max(0, u.getTime() - f * 24 * 60 * 60 * 1e3), p = u.getTime();
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
      ].map((d) => String(d || "").toLowerCase()));
      for (const d of s) {
        const u = String(d?.name || "").trim();
        if (!u) continue;
        const f = u.toLowerCase(), m = $n(d?.sql || "");
        (l.has(f) || m.includes(i)) && (await a.prepare(`DROP TRIGGER IF EXISTS ${Pa(u)}`).run(), o += 1);
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
function Xp(n = {}, e = {}) {
  const { CacheManager: r, withAdminShellRuntimeStatus: t } = n;
  return {
    async ensureDnsIpWorkspaceSchema(a) {
      if (!a) return !1;
      if (e.isD1SchemaReadyCached(a, "dnsIpWorkspaceSchema")) return !0;
      let o = Q.DnsIpWorkspaceDbReady.get(a);
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
        throw Q.DnsIpWorkspaceDbReady.delete(a), s;
      }), Q.DnsIpWorkspaceDbReady.set(a, o));
      try {
        return await o;
      } finally {
        Q.DnsIpWorkspaceDbReady.get(a) === o && Q.DnsIpWorkspaceDbReady.delete(a);
      }
    },
    getDnsIpPoolRevisionFromStatus(a = {}) {
      const o = String(a?.revision || "").trim();
      return o || Ft("dns_ip_pool", String(a?.updatedAt || "").trim());
    },
    async bumpDnsIpPoolRevision(a, o = {}, s = null) {
      const i = await e.getOpsStatusSection(a, "dnsIpPool"), c = (/* @__PURE__ */ new Date()).toISOString(), l = ce(`${e.getDnsIpPoolRevisionFromStatus(i)}:${c}:${se(o)}`);
      return await e.patchOpsStatus(a, { dnsIpPool: {
        ...o,
        revision: Ft(l, c),
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
        return (Array.isArray(o?.results) ? o.results : []).map((s) => cr(s)).filter(Boolean);
      } catch {
        return [];
      }
    },
    async upsertDnsIpPoolItems(a, o = [], s = {}) {
      if (!a) return [];
      await e.ensureDnsIpWorkspaceSchema(a);
      const i = (/* @__PURE__ */ new Date()).toISOString(), c = /* @__PURE__ */ new Map();
      for (const u of Array.isArray(o) ? o : []) {
        const f = cr(u, {
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
    async deleteDnsIpPoolItems(a, o = []) {
      if (!a) return 0;
      await e.ensureDnsIpWorkspaceSchema(a);
      const s = [...new Set((Array.isArray(o) ? o : []).map((l) => String(l || "").trim()).filter((l) => Qe(l)))];
      if (!s.length) return 0;
      const i = s.flatMap((l) => [a.prepare(`DELETE FROM ${e.DNS_IP_POOL_ITEMS_TABLE} WHERE ip = ?`).bind(l), a.prepare(`DELETE FROM ${e.DNS_IP_PROBE_CACHE_TABLE} WHERE ip = ?`).bind(l)]), c = 50;
      for (let l = 0; l < i.length; l += c) await a.batch(i.slice(l, l + c));
      return s.length;
    },
    async getDnsIpPoolSourcesFromDb(a) {
      if (!a) return [];
      await e.ensureDnsIpWorkspaceSchema(a);
      try {
        const o = await a.prepare(`SELECT id, name, url, source_type, domain, source_kind, preset_id, builtin_id, enabled, sort_order, ip_limit, last_fetch_at, last_fetch_status, last_fetch_count, created_at, updated_at
              FROM ${e.DNS_IP_POOL_SOURCES_TABLE}
              ORDER BY sort_order ASC, updated_at ASC`).all();
        return (Array.isArray(o?.results) ? o.results : []).map((s, i) => wt(s, i)).filter((s) => tr(s));
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
      return (Array.isArray(o?.results) ? o.results : []).map((s, i) => wt(s, i)).filter((s) => tr(s));
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
      const i = (Array.isArray(o) ? o : []).map((d, u) => wt(d, u)).filter((d) => tr(d)), c = e.resolveOpsStatusStores(a)?.db || null;
      if (!c) throw new Error("D1 not configured");
      await e.ensureDnsIpWorkspaceSchema(c);
      const l = [c.prepare(`DELETE FROM ${e.DNS_IP_POOL_SOURCES_TABLE}`)];
      return l.push(...i.map((d) => c.prepare(`INSERT INTO ${e.DNS_IP_POOL_SOURCES_TABLE} (
            id, name, url, source_type, domain, source_kind, preset_id, builtin_id, enabled, sort_order, ip_limit, last_fetch_at, last_fetch_status, last_fetch_count, created_at, updated_at
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`).bind(d.id, d.name, d.url, d.sourceType, d.domain, d.sourceKind, d.presetId, d.builtinId, d.enabled ? 1 : 0, d.sortOrder, d.ipLimit, d.lastFetchAt, d.lastFetchStatus, d.lastFetchCount, d.createdAt, d.updatedAt))), await c.batch(l), i;
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
              LIMIT 1`).bind(String(o), K()).first();
        if (!s) return null;
        const i = JSON.parse(String(s.items_json || "[]")), c = JSON.parse(String(s.source_results_json || "[]")), l = lr(Array.isArray(i) ? i : []), d = Array.isArray(c) ? c : [];
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
    async upsertDnsIpPoolFetchCacheEntry(a, o = {}) {
      if (!a) return null;
      await e.ensureDnsIpWorkspaceSchema(a);
      const s = String(o?.signature || "").trim();
      if (!s) return null;
      const i = lr(o?.items || []), c = (Array.isArray(o?.sourceResults) ? o.sourceResults : []).map((g) => Gs(g, g)), l = Math.max(0, Number(o?.cachedAtMs ?? o?.cached_at ?? K()) || K()), d = Math.max(l, Number(o?.expiresAtMs ?? o?.expires_at ?? l + 24e5) || l + 24e5), u = String(o?.createdAt || o?.created_at || new Date(l).toISOString()), f = String(o?.updatedAt || o?.updated_at || new Date(l).toISOString()), m = Math.max(0, Number(o?.importedCount ?? o?.imported_count) || i.length), p = Math.max(0, Number(o?.enabledSourceCount ?? o?.enabled_source_count) || 0);
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
    async getDnsIpProbeCacheEntry(a, o = "", s = "") {
      if (!a || !o || !s) return null;
      await e.ensureDnsIpWorkspaceSchema(a);
      try {
        const i = await a.prepare(`SELECT ip, entry_colo, probe_status, latency_ms, cf_ray, colo_code, city_name, country_code, country_name, probed_at, expires_at
              FROM ${e.DNS_IP_PROBE_CACHE_TABLE}
              WHERE ip = ? AND entry_colo = ? AND expires_at > ?
              LIMIT 1`).bind(String(o), String(s).toUpperCase(), K()).first();
        return i ? {
          ip: String(i.ip || ""),
          entryColo: String(i.entry_colo || "").toUpperCase(),
          probeStatus: Ia(i.probe_status),
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
      const i = [...new Set((Array.isArray(o) ? o : []).map((d) => String(d || "").trim()).filter(Boolean))];
      if (!i.length) return [];
      await e.ensureDnsIpWorkspaceSchema(a);
      const c = [], l = K();
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
        probeStatus: Ia(d?.probe_status),
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
    async upsertDnsIpProbeCacheEntry(a, o = {}) {
      if (!a) return null;
      await e.ensureDnsIpWorkspaceSchema(a);
      const s = String(o?.ip || "").trim(), i = String(o?.entryColo || o?.entry_colo || "").trim().toUpperCase(), c = Ia(o?.probeStatus || o?.probe_status || "");
      if (!s || !i) return null;
      const l = Math.max(K(), Number(o?.expiresAt ?? o?.expires_at) || 0), d = String(o?.probedAt || o?.probed_at || (/* @__PURE__ */ new Date()).toISOString());
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
            expires_at = excluded.expires_at`).bind(s, i, c, Number.isFinite(Number(o?.latencyMs ?? o?.latency_ms)) ? Math.round(Number(o?.latencyMs ?? o?.latency_ms)) : null, String(o?.cfRay || o?.cf_ray || ""), String(o?.coloCode || o?.colo_code || "").toUpperCase(), String(o?.cityName || o?.city_name || ""), String(o?.countryCode || o?.country_code || "").toUpperCase(), String(o?.countryName || o?.country_name || ""), d, l).run(), {
        ip: s,
        entryColo: i,
        probeStatus: c,
        latencyMs: Number.isFinite(Number(o?.latencyMs ?? o?.latency_ms)) ? Math.round(Number(o?.latencyMs ?? o?.latency_ms)) : null,
        cfRay: String(o?.cfRay || o?.cf_ray || ""),
        coloCode: String(o?.coloCode || o?.colo_code || "").toUpperCase(),
        cityName: String(o?.cityName || o?.city_name || ""),
        countryCode: String(o?.countryCode || o?.country_code || "").toUpperCase(),
        countryName: String(o?.countryName || o?.country_name || ""),
        probedAt: d,
        expiresAt: l
      };
    }
  };
}
function Yp(n = {}, e = {}) {
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
      let o = Q.OpsStatusShadowCache.get(a);
      return o || (o = {
        pendingPatch: {},
        flushPromise: null,
        payloadCache: /* @__PURE__ */ new Map()
      }, Q.OpsStatusShadowCache.set(a, o)), o;
    },
    getOpsStatusShadowPatch(a) {
      const o = e.getOpsStatusShadowState(a);
      return F(o?.pendingPatch) ? o.pendingPatch : {};
    },
    getOpsStatusPayloadCache(a) {
      const o = e.getOpsStatusShadowState(a);
      return o ? (o.payloadCache instanceof Map || (o.payloadCache = /* @__PURE__ */ new Map()), o.payloadCache) : null;
    },
    cacheOpsStatusPayload(a, o, s) {
      const i = e.getOpsStatusPayloadCache(a);
      i && xe(i, String(o || ""), {
        payload: s && typeof s == "object" ? s : null,
        expiresAt: K() + Math.max(1e3, Number(O.Defaults.OpsStatusReadCacheTtlMs) || 1e3)
      }, 8);
    },
    buildOpsStatusRootPatch(a = {}) {
      const o = a && typeof a == "object" ? a : {}, s = (/* @__PURE__ */ new Date()).toISOString(), i = {};
      for (const [c, l] of Object.entries(o)) {
        if (e.OPS_STATUS_SECTION_SCOPES[c]) {
          const d = je(i[c], l);
          d.updatedAt = s, i[c] = d;
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
        const d = F(c.pendingPatch) ? c.pendingPatch : {};
        if (!Object.keys(d).length) return await e.getOpsStatusFromStores(a);
        c.pendingPatch = {};
        try {
          const u = K(), f = new Date(u).toISOString();
          if (!await e.ensureSysStatusTable(s))
            return Ne("ops_status.db_unavailable", /* @__PURE__ */ new Error("sys_status table unavailable"), { patchKeys: i }), c.pendingPatch = je(d, c.pendingPatch), await e.getOpsStatusFromStores(a);
          const m = await e.getOpsStatusPayloadFromDb(s, e.getOpsStatusDbScope()), p = je(m && typeof m == "object" ? m : {}, d);
          return p.updatedAt = f, await e.putOpsStatusPayloadToDb(s, e.getOpsStatusDbScope(), p, u), je(p, e.getOpsStatusShadowPatch(s));
        } catch (u) {
          throw c.pendingPatch = je(d, c.pendingPatch), u;
        }
      })().finally(() => {
        c.flushPromise === l && (c.flushPromise = null);
      });
      return c.flushPromise = l, l;
    },
    async ensureSysStatusTable(a) {
      if (!a || typeof a.prepare != "function") return !1;
      if (e.isD1SchemaReadyCached(a, "sysStatusTable")) return !0;
      let o = Q.OpsStatusDbReady.get(a);
      o || (o = (async () => {
        try {
          return await a.prepare(`CREATE TABLE IF NOT EXISTS ${e.SYS_STATUS_TABLE} (scope TEXT PRIMARY KEY, payload TEXT NOT NULL, updated_at INTEGER NOT NULL)`).run(), e.markD1SchemaReady(a, "sysStatusTable"), !0;
        } catch (s) {
          return console.warn("sys_status init failed", s), !1;
        }
      })(), Q.OpsStatusDbReady.set(a, o));
      try {
        return await o;
      } finally {
        Q.OpsStatusDbReady.get(a) === o && Q.OpsStatusDbReady.delete(a);
      }
    },
    async ensureAuthFailuresTable(a) {
      if (!a || typeof a.prepare != "function") return !1;
      if (e.isD1SchemaReadyCached(a, "authFailuresTable")) return !0;
      let o = Q.AuthFailuresDbReady.get(a);
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
      })(), Q.AuthFailuresDbReady.set(a, o));
      try {
        return await o;
      } finally {
        Q.AuthFailuresDbReady.get(a) === o && Q.AuthFailuresDbReady.delete(a);
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
        return c > 0 && c <= K() ? (await e.deleteAuthFailureEntry(a, s).catch(() => !1), null) : {
          ip: s,
          failCount: Math.max(0, Number(i?.fail_count ?? i?.failCount) || 0),
          expiresAt: c,
          updatedAt: Number(i?.updated_at ?? i?.updatedAt) || 0
        };
      } catch (i) {
        return Ne("auth_failures.read_failed", i, { ip: s }), null;
      }
    },
    async upsertAuthFailureEntry(a, o = "", s = {}) {
      const i = String(o || "").trim();
      if (!i || !a || !await e.ensureAuthFailuresTable(a)) return null;
      const c = Math.max(0, Number(s?.failCount) || 0), l = Math.max(0, Number(s?.expiresAt) || 0), d = Math.max(0, Number(s?.updatedAt) || K());
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
    async deleteAuthFailureEntry(a, o = "") {
      const s = String(o || "").trim();
      return !s || !a || !await e.ensureAuthFailuresTable(a) ? !1 : (await a.prepare(`DELETE FROM ${e.AUTH_FAILURES_TABLE} WHERE ip = ?`).bind(s).run(), !0);
    }
  };
}
function Jp(n = {}, e = {}) {
  const { CacheManager: r, withAdminShellRuntimeStatus: t } = n;
  return {
    async ensureCfDashboardCacheTable(a) {
      if (!a || typeof a.prepare != "function") return !1;
      if (e.isD1SchemaReadyCached(a, "cfDashboardCacheTable")) return !0;
      let o = Q.CfDashboardCacheDbReady.get(a);
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
      })(), Q.CfDashboardCacheDbReady.set(a, o));
      try {
        return await o;
      } finally {
        Q.CfDashboardCacheDbReady.get(a) === o && Q.CfDashboardCacheDbReady.delete(a);
      }
    },
    async getCfDashboardCacheEntry(a, o = "", s = {}) {
      const i = String(o || "").trim();
      if (!i || !a || !await e.ensureCfDashboardCacheTable(a)) return null;
      const c = Math.max(0, Number(s.nowMs) || K()), l = s.includeExpired === !0, d = l ? `SELECT cache_key, zone_id, bucket_date, payload, version, cached_at, expires_at, updated_at
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
          payload: Yn(m),
          version: Number(f?.version) || 0,
          cachedAt: Number(f?.cached_at ?? f?.cachedAt) || 0,
          expiresAt: Number(f?.expires_at ?? f?.expiresAt) || 0,
          updatedAt: Number(f?.updated_at ?? f?.updatedAt) || 0
        };
      } catch (u) {
        return Ne("cf_dashboard_cache.read_failed", u, { cacheKey: i }), null;
      }
    },
    async putCfDashboardCacheEntry(a, o = {}) {
      if (!a || !await e.ensureCfDashboardCacheTable(a)) return null;
      const s = String(o?.cacheKey || "").trim();
      if (!s) return null;
      const i = String(o?.zoneId || "").trim() || "default", c = String(o?.bucketDate || "").trim() || "current", l = Math.max(0, Number(o?.version) || 0), d = Math.max(0, Number(o?.cachedAt) || K()), u = Math.max(d, Number(o?.expiresAt) || d), f = Math.max(d, Number(o?.updatedAt) || d), m = JSON.stringify(Yn(o?.payload || {}));
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
    async deleteCfDashboardCacheEntry(a, o = "") {
      const s = String(o || "").trim();
      if (!s || !a || !await e.ensureCfDashboardCacheTable(a)) return !1;
      try {
        return await a.prepare(`DELETE FROM ${e.CF_DASH_CACHE_TABLE} WHERE cache_key = ?`).bind(s).run(), !0;
      } catch (i) {
        return Ne("cf_dashboard_cache.delete_failed", i, { cacheKey: s }), !1;
      }
    },
    async invalidateDashboardSnapshotCacheForConfigChange(a, o = {}) {
      const s = o?.db || e.getDB(a);
      if (!s) return 0;
      const i = Math.max(0, Number(o.nowMs) || K()), c = /* @__PURE__ */ new Set();
      for (const l of [o?.prevConfig, o?.nextConfig]) {
        if (!l || typeof l != "object") continue;
        const d = te(l), u = pt(new Date(i), d.scheduleUtcOffsetMinutes);
        c.add(qn(d.cfZoneId, u.dateKey));
      }
      return c.size ? (await he(Promise.all([...c].map((l) => e.deleteCfDashboardCacheEntry(s, l))), "dashboard.cache_invalidate", { cacheKeys: [...c] }, null), c.size) : 0;
    },
    async ensureCfRuntimeCacheTable(a) {
      if (!a || typeof a.prepare != "function") return !1;
      if (e.isD1SchemaReadyCached(a, "cfRuntimeCacheTable")) return !0;
      let o = Q.CfRuntimeCacheDbReady.get(a);
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
      })(), Q.CfRuntimeCacheDbReady.set(a, o));
      try {
        return await o;
      } finally {
        Q.CfRuntimeCacheDbReady.get(a) === o && Q.CfRuntimeCacheDbReady.delete(a);
      }
    },
    async getCfRuntimeCacheEntry(a, o = "", s = {}) {
      const i = String(o || "").trim();
      if (!i || !a || !await e.ensureCfRuntimeCacheTable(a)) return null;
      const c = Math.max(0, Number(s.nowMs) || K()), l = s.includeExpired === !0, d = l ? `SELECT cache_key, cache_group, resource_id, payload, cached_at, expires_at, updated_at
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
          payload: (F(m), m),
          cachedAt: Number(f?.cached_at ?? f?.cachedAt) || 0,
          expiresAt: Number(f?.expires_at ?? f?.expiresAt) || 0,
          updatedAt: Number(f?.updated_at ?? f?.updatedAt) || 0
        };
      } catch (u) {
        return Ne("cf_runtime_cache.read_failed", u, { cacheKey: i }), null;
      }
    },
    async putCfRuntimeCacheEntry(a, o = {}) {
      if (!a || !await e.ensureCfRuntimeCacheTable(a)) return null;
      const s = String(o?.cacheKey || "").trim();
      if (!s) return null;
      const i = String(o?.cacheGroup || "").trim() || "runtime", c = String(o?.resourceId || "").trim() || "default", l = Math.max(0, Number(o?.cachedAt) || K()), d = Math.max(l, Number(o?.expiresAt) || l), u = Math.max(l, Number(o?.updatedAt) || l), f = JSON.stringify(o?.payload ?? {});
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
    async loadCfRuntimeCachePayload(a, o = {}) {
      const s = String(o.cacheKey || "").trim(), i = String(o.cacheGroup || "").trim() || "runtime", c = String(o.resourceId || "").trim() || "default", l = Math.max(1e3, Number(o.ttlMs) || 3e5), d = Math.max(0, Number(o.nowMs) || K()), u = o.skipCacheRead === !0, f = typeof o.loader == "function" ? o.loader : null;
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
          payload: await Ht(tt([
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
function Qp(n = {}, e = {}) {
  const { CacheManager: r, withAdminShellRuntimeStatus: t } = n;
  return {
    buildCloudflareKvQuotaCard({ planProfile: a = {}, planState: o = {}, usageState: s = {}, namespaceId: i = "", nowTimestamp: c = K() } = {}) {
      const l = ga(a?.planClass), d = F(s?.payload) ? s.payload : {}, u = String(d.namespaceTitle || a?.resourceMeta?.kv?.namespaceTitle || i || "未命名 Namespace").trim(), f = [
        Sr({
          key: "read",
          label: "读",
          used: d.readCount,
          limit: l.kv.read,
          kind: "count"
        }),
        Sr({
          key: "write",
          label: "写",
          used: d.writeCount,
          limit: l.kv.write,
          kind: "count"
        }),
        Sr({
          key: "storage",
          label: "容量",
          used: d.storageBytes,
          limit: l.kv.storageBytes,
          kind: "bytes"
        })
      ], m = [];
      o?.stale === !0 && m.push("计划信息"), s?.stale === !0 && m.push("实时指标");
      const p = [];
      m.length > 0 && p.push(`${m.join("、")} 使用 stale cache`), p.push(`delete：${ye(d.deleteCount)} / ${ye(l.kv.delete)}`), p.push(`list：${ye(d.listCount)} / ${ye(l.kv.list)}`), p.push(`命名空间：${u}`);
      const g = ts(s?.cachedAt, c);
      g && p.push(g), p.push(l.planClass === "paid" ? "容量条按 1 GB included quota 展示，PAID 下这是 included quota，不是硬停止线" : "容量条按 1 GB included quota 展示");
      const h = rs(f);
      return h.length > 0 && p.push(`超额项目：${h.join("、")}（进度条按 100% 封顶）`), s?.error && p.push(`Cloudflare 详情：${vt(s.error)}`), ja({
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
    buildCloudflareD1QuotaCard({ planProfile: a = {}, planState: o = {}, usageState: s = {}, databaseId: i = "", nowTimestamp: c = K() } = {}) {
      const l = ga(a?.planClass), d = F(s?.payload) ? s.payload : {}, u = String(d.databaseName || a?.resourceMeta?.d1?.databaseName || i || "未命名数据库").trim(), f = [
        Sr({
          key: "rowsRead",
          label: "读",
          used: d.rowsRead,
          limit: l.d1.rowsRead,
          kind: "count"
        }),
        Sr({
          key: "rowsWritten",
          label: "写",
          used: d.rowsWritten,
          limit: l.d1.rowsWritten,
          kind: "count"
        }),
        Sr({
          key: "storage",
          label: "容量",
          used: d.fileSizeBytes,
          limit: l.d1.storageBytes,
          kind: "bytes"
        })
      ], m = [];
      o?.stale === !0 && m.push("计划信息"), s?.stale === !0 && m.push("实时指标");
      const p = [];
      m.length > 0 && p.push(`${m.join("、")} 使用 stale cache`), p.push(`SQL 次数：读 ${ye(d.readQueries)} / 写 ${ye(d.writeQueries)}`), p.push(`数据库：${u}`);
      const g = ts(s?.cachedAt, c);
      g && p.push(g), p.push(`容量条按单库硬上限 ${Ga(l.d1.storageBytes)} 展示`);
      const h = rs(f);
      return h.length > 0 && p.push(`超额项目：${h.join("、")}（进度条按 100% 封顶）`), s?.error && p.push(`Cloudflare 详情：${vt(s.error)}`), ja({
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
    async buildDashboardD1WriteHotspotPayload(a, o = {}) {
      const s = te(o?.config || await de(a)), i = Math.max(0, Number(o?.nowMs) || K()), c = ke(s.scheduleUtcOffsetMinutes), l = String(s.cfAccountId || "").trim(), d = String(s.cfApiToken || "").trim(), u = String(s.cfD1DatabaseId || "").trim(), f = {
        utcOffsetMinutes: c,
        nowMs: i,
        source: "cloudflare_d1_analytics"
      };
      if (!l || !d || !u) return Ja({
        ...f,
        status: "unconfigured",
        summary: "D1 写入热点尚未启用",
        detail: "请先在账号设置中填写 Cloudflare 账号 ID、API 令牌与 D1 Database ID。"
      });
      const m = pt(new Date(i), c).startTs - 8640 * 60 * 1e3, p = await qu({
        accountId: l,
        apiToken: d,
        databaseId: u,
        startIso: new Date(m).toISOString(),
        endIso: new Date(i).toISOString(),
        utcOffsetMinutes: c
      }), g = new Map(p.map((E) => [`${E.dateKey}:${E.hour}`, E])), h = pc(), y = [];
      let S = 0, _ = 0, A = 0, b = null;
      for (const E of p)
        S += Math.max(0, Number(E?.rowsWritten) || 0), _ += Math.max(0, Number(E?.writeQueries) || 0), (Number(E?.rowsWritten) || 0) > A && (A = Math.max(0, Number(E?.rowsWritten) || 0), b = E);
      for (let E = 0; E < 7; E += 1) {
        const w = Bt(m + E * 24 * 60 * 60 * 1e3, c).dateKey;
        y.push({
          key: w,
          dateKey: w,
          label: Xn(w),
          cells: Array.from({ length: 24 }, (D, C) => {
            const T = g.get(`${w}:${C}`) || null, I = Math.max(0, Number(T?.rowsWritten) || 0), x = Math.max(0, Number(T?.writeQueries) || 0), U = A > 0 ? I / A : 0;
            return gc(w, C, I, x, U);
          })
        });
      }
      const R = b ? `峰值：${Xn(b.dateKey)} ${String(b.hour).padStart(2, "0")}:00 写入 ${ye(b.rowsWritten)} 行 / SQL ${ye(b.writeQueries)} 次` : "";
      return {
        title: "D1 写入热点图",
        status: "success",
        source: "cloudflare_d1_analytics",
        summary: S > 0 ? `最近 7 天累计写入 ${ye(S)} 行` : "最近 7 天未检测到 D1 写入",
        detail: S > 0 ? "热点强度按 rowsWritten 计算；悬停单元格可查看对应小时的 SQL 写次数。" : "Cloudflare D1 Analytics 当前窗口内没有返回 rowsWritten 数据。",
        periodLabel: `最近 7 天 · ${lo(c)}`,
        hourLabels: h,
        rows: y,
        available: S > 0,
        totalRowsWritten: S,
        totalWriteQueries: _,
        peakLabel: R,
        legendMaxLabel: ye(A)
      };
    },
    async buildDashboardMonthlyTrafficPayload(a, o = {}) {
      const s = te(o?.config || await de(a)), i = Math.max(0, Number(o.nowMs) || K()), c = o?.monthWindow || ys(new Date(i), s.scheduleUtcOffsetMinutes), l = String(s.cfZoneId || "").trim(), d = String(s.cfApiToken || "").trim(), u = {
        period: "month",
        periodKey: c.monthKey,
        periodLabel: c.periodLabel,
        generatedAt: new Date(i).toISOString(),
        cacheStatus: "live"
      };
      if (!l || !d) return jt({
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
                zones(filter: { zoneTag: ${_e(l)} }) {
                  series: httpRequestsAdaptiveGroups(limit: 10000, filter: { datetime_geq: ${_e(new Date(S).toISOString())}, datetime_leq: ${_e(new Date(_).toISOString())} }) {
                    sum { edgeResponseBytes }
                  }
                }
              }
            }`, m = async (S, _) => {
        const A = await Xi(l, d, f(S, _));
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
      return jt({
        ...u,
        traffic: Ga(h),
        totalBytes: h,
        cfAnalyticsLoaded: !0,
        cfAnalyticsStatus: "Cloudflare 统计正常",
        cfAnalyticsError: "",
        cfAnalyticsDetail: "",
        trafficSourceText: `${c.periodLabel}视频流量：CF Zone 总流量（edgeResponseBytes）`
      });
    },
    async getDashboardMonthlyTrafficPayload(a, o = {}) {
      const s = te(o?.config || await de(a)), i = o?.ctx || null, c = o?.forceRefresh === !0, l = Math.max(0, Number(o.nowMs) || K()), d = o?.monthWindow || ys(new Date(l), s.scheduleUtcOffsetMinutes), u = String(s.cfZoneId || "").trim();
      if (!u || !String(s.cfApiToken || "").trim()) return await e.buildDashboardMonthlyTrafficPayload(a, {
        config: s,
        monthWindow: d,
        nowMs: l
      });
      const f = gm(u, d.monthKey, s.scheduleUtcOffsetMinutes), m = hm(f), p = sr();
      let g = null;
      const h = oe.DashboardMonthlyTrafficCache.get(f);
      if (h?.staleUntil > l) {
        if (xe(oe.DashboardMonthlyTrafficCache, f, h, 64), g = h, !c && h.expiresAt > l) return jt({
          ...h.payload,
          cacheStatus: "cache"
        });
      } else h && oe.DashboardMonthlyTrafficCache.delete(f);
      if (p && m) try {
        const y = await p.match(m);
        if (y) {
          const S = await Pe(y, rn), _ = S.exceeded ? null : JSON.parse(S.text || "null");
          if (Number(_?.version) === 1 && String(_?.cacheKey || "") === f && Number(_?.staleUntil) > l && (g = {
            payload: jt(_.payload),
            cachedAt: Number(_.cachedAt) || 0,
            expiresAt: Number(_.expiresAt) || 0,
            staleUntil: Number(_.staleUntil) || 0
          }, xe(oe.DashboardMonthlyTrafficCache, f, g, 64), !c && g.expiresAt > l))
            return jt({
              ...g.payload,
              cacheStatus: "cache"
            });
        }
      } catch (y) {
        Ne("dashboard.monthly_traffic_cache_read_failed", y, { cacheKey: f });
      }
      try {
        return await Ht(tt([
          "dashboard_monthly_traffic",
          f,
          c ? "force" : "default"
        ]), async () => {
          const y = await e.buildDashboardMonthlyTrafficPayload(a, {
            config: s,
            monthWindow: d,
            nowMs: l
          }), S = l, _ = S + pm, A = S + gs, b = {
            version: 1,
            cacheKey: f,
            cachedAt: S,
            expiresAt: _,
            staleUntil: A,
            payload: y
          };
          if (xe(oe.DashboardMonthlyTrafficCache, f, {
            payload: y,
            cachedAt: S,
            expiresAt: _,
            staleUntil: A
          }, 64), p && m) {
            const R = p.put(m, new Response(JSON.stringify(b), { headers: {
              "Content-Type": "application/json; charset=utf-8",
              "Cache-Control": `public, max-age=${Math.floor(gs / 1e3)}`
            } }));
            i ? i.waitUntil(he(R, "dashboard.monthly_traffic_cache_write", { cacheKey: f }, null)) : await he(R, "dashboard.monthly_traffic_cache_write", { cacheKey: f }, null);
          }
          return y;
        });
      } catch (y) {
        if (g?.payload && g.staleUntil > l) return jt({
          ...g.payload,
          cacheStatus: "stale",
          warning: hc(y, "monthly_traffic_refresh_failed")
        });
        const S = zi(y?.message || y, { zoneId: u });
        return jt({
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
function Zp(n = {}, e = {}) {
  const { CacheManager: r, withAdminShellRuntimeStatus: t } = n;
  return {
    async buildDashboardStatsPayload(a, o = {}) {
      const s = o?.ctx || null, i = o?.kv || e.getKV(a), c = o?.db || e.getDB(a), l = te(o?.config || await de(a)), d = Math.max(0, Number(o.nowMs) || K()), u = o?.dayWindow || pt(new Date(d), l.scheduleUtcOffsetMinutes), f = o?.skipD1WriteHotspot !== !1, m = f ? null : e.buildDashboardD1WriteHotspotPayload(a, {
        config: l,
        nowMs: d
      });
      let p = null, g = "未配置", h = 0, y = !1, S = !1, _ = "", A = "", b = "", R = "pending", E = "等待数据加载", w = "视频流量口径：CF Zone 总流量", D = new Date(d).toISOString(), C = Array.from({ length: 24 }, (v, W) => ({
        label: String(W).padStart(2, "0") + ":00",
        total: 0
      })), T = 0, I = 0, x = "", U = Ja({
        utcOffsetMinutes: l.scheduleUtcOffsetMinutes,
        nowMs: d
      });
      h = (await r.getNodesListStrict(a, s)).length || 0;
      const k = u.dateKey, G = u.startTs, P = u.endTs, N = String(l.cfZoneId || "").trim(), L = String(l.cfApiToken || "").trim();
      if (N && L) {
        const v = new Date(G).toISOString(), W = new Date(P).toISOString(), $ = `
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
          const H = await Ji(N, L, {
            scope: "dashboard.stats.zone_lookup",
            context: { feature: "dashboard_stats" }
          });
          x = String(H?.name || "").trim();
          const j = await Xi(N, L, $);
          if (j) {
            let ne = 0, fe = 0, me = Array.from({ length: 24 }, (le, pe) => ({
              label: String(pe).padStart(2, "0") + ":00",
              total: 0
            }));
            (Array.isArray(j.series) ? [...j.series].sort((le, pe) => String(le?.dimensions?.datetimeHour || "").localeCompare(String(pe?.dimensions?.datetimeHour || ""))) : []).forEach((le) => {
              const pe = Number(le.count) || 0, Oe = Number(le.sum?.edgeResponseBytes) || 0;
              ne += pe, fe += Oe;
              const Be = le?.dimensions?.datetimeHour;
              if (Be && !Number.isNaN(new Date(Be).getTime())) {
                const Mt = Bt(new Date(Be), l.scheduleUtcOffsetMinutes).hour;
                me[Mt].total += pe;
              }
            }), g = Ga(fe), y = !0, _ = "Cloudflare 统计正常", w = "视频流量当前对齐：CF Zone 总流量（edgeResponseBytes）";
            try {
              const le = await Xu({
                cfAccountId: String(l.cfAccountId || "").trim(),
                cfZoneId: N,
                cfApiToken: L,
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
          const j = zi(H?.message || H, { zoneId: N });
          _ = j.status, A = j.hint, b = j.detail, g = "CF 查询失败";
        }
      } else
        _ = "未配置 Cloudflare", A = "请在账号设置中填写并保存 Cloudflare Zone ID 与 API 令牌", w = "视频流量当前对齐：未配置 Cloudflare，无法获取 CF Zone 总流量";
      if (c) try {
        await e.ensureStatsHourlyWindowAligned({
          db: c,
          kv: i
        }, {
          config: l,
          now: u.now
        });
        const v = await e.resolveLogsReadiness({
          db: c,
          kv: i
        }), W = v.statsReady === !0 ? await e.getDailyStatsHourly(c, k) : [];
        if (T = W.reduce(($, H) => $ + (Number(H?.play_count || H?.playCount) || 0), 0), I = W.reduce(($, H) => $ + (Number(H?.playback_info_count || H?.playbackInfoCount) || 0), 0), !S && v.statsReady === !0) {
          p = W.reduce(($, H) => $ + (Number(H?.request_count || H?.requestCount) || 0), 0), C = Array.from({ length: 24 }, ($, H) => ({
            label: String(H).padStart(2, "0") + ":00",
            total: 0
          }));
          for (const $ of W) {
            const H = Number.parseInt(String($?.bucket_hour ?? $?.bucketHour), 10);
            !Number.isNaN(H) && C[H] && (C[H].total += Number($?.request_count || $?.requestCount) || 0);
          }
          S = !0, R = "d1_hourly_stats", E = "今日请求量当前对齐：本地 D1 预聚合";
        }
      } catch (v) {
        console.log("DB aggregated stats read failed:", v);
      }
      if (S || (p = null, !N || !L ? (R = "unconfigured", E = c ? "今日请求量暂不可用：未配置 Cloudflare 联动，且本地 D1 日志未初始化或不可读" : "今日请求量未配置：未绑定 D1，且未配置 Cloudflare 联动") : (R = "pending", E = c ? "今日请求量暂不可用：Cloudflare 请求数查询失败，且本地 D1 日志未初始化或不可读" : "今日请求量暂不可用：Cloudflare 请求数查询失败，且未绑定 D1")), !f) try {
        U = await m;
      } catch (v) {
        console.log("D1 write hotspot read failed:", v), U = Ja({
          utcOffsetMinutes: l.scheduleUtcOffsetMinutes,
          nowMs: d,
          status: "failed",
          source: "cloudflare_d1_analytics",
          summary: "D1 写入热点暂不可用",
          detail: vt(v, "d1_write_hotspot_failed")
        });
      }
      const M = p == null ? R === "unconfigured" ? "未配置" : "暂不可用" : String(Number(p) || 0);
      return Io({
        todayRequests: p,
        requestCountDisplay: M,
        todayTraffic: g,
        hourlySeries: C,
        requestSource: R,
        requestSourceText: E,
        trafficSourceText: w,
        generatedAt: D,
        zoneName: x,
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
    async buildDashboardRuntimeStatusPayload(a, o = {}) {
      const s = o?.db || e.getDB(a), i = o?.kv || e.getKV(a), c = te(o?.config || await de(a)), l = o?.forceRefresh === !0, d = await e.getOpsStatus({
        kv: i,
        db: s
      });
      let u = {
        kv: _r("KV", "Cloudflare 配额尚未加载", "等待运行状态接口返回 Cloudflare 配额数据。"),
        d1: _r("D1", "Cloudflare 配额尚未加载", "等待运行状态接口返回 Cloudflare 配额数据。")
      };
      try {
        u = await e.getCloudflareRuntimeQuotaStatus(a, {
          config: c,
          db: s,
          forceRefresh: l
        });
      } catch (f) {
        const m = vt(f, "runtime_config_read_failed");
        u = {
          kv: br("KV", "Cloudflare 配额读取失败", m),
          d1: br("D1", "Cloudflare 配额读取失败", m)
        };
      }
      return {
        ...d && typeof d == "object" ? d : {},
        cloudflare: u
      };
    },
    async getRuntimeStatusPayload(a, o = {}) {
      const s = o?.db || e.getDB(a), i = o?.kv || e.getKV(a), c = te(o?.config || await de(a)), l = He(a), d = o?.forceRefresh === !0, u = Math.max(0, Number(o.nowMs) || K()), f = await Ht(tt(["runtime_status", d ? "force" : "default"]), async () => e.buildDashboardRuntimeStatusPayload(a, {
        kv: i,
        db: s,
        config: c,
        forceRefresh: d
      }));
      return {
        status: t(f, a, c, l),
        cacheMeta: xo({
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
    async getDashboardSnapshotPayload(a, o = {}) {
      const s = o?.db || e.getDB(a), i = o?.kv || e.getKV(a), c = o?.ctx || null, l = te(o?.config || await de(a)), d = o?.forceRefresh === !0, u = Math.max(0, Number(o.nowMs) || K()), f = o?.dayWindow || pt(new Date(u), l.scheduleUtcOffsetMinutes), m = String(l.cfZoneId || "").trim(), p = qn(m, f.dateKey), g = s ? await e.getCfDashboardCacheEntry(s, p, {
        nowMs: u,
        includeExpired: !0
      }) : null;
      if (!d && s) {
        const y = g && g.expiresAt > u ? g : null;
        if (y && y.version === 8) return Jr(y.payload, "cache", {
          cachedAt: y.cachedAt,
          expiresAt: y.expiresAt,
          updatedAt: y.updatedAt,
          generatedAt: y.payload?.cacheMeta?.generatedAt || y.payload?.stats?.generatedAt || new Date(y.cachedAt || u).toISOString(),
          warning: ""
        });
      }
      const h = g;
      try {
        const y = await Ht(tt([
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
          })]), A = Jr({
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
            c ? c.waitUntil(he(b, "dashboard.cache_write", { cacheKey: p }, null)) : await he(b, "dashboard.cache_write", { cacheKey: p }, null);
          }
          return A;
        });
        return Jr(y, "live", {
          cachedAt: u,
          expiresAt: u + 3600 * 1e3,
          updatedAt: u,
          generatedAt: y?.stats?.generatedAt || ""
        });
      } catch (y) {
        if (h && h.version === 8) return Jr(h.payload, "stale", {
          cachedAt: h.cachedAt,
          expiresAt: h.expiresAt,
          updatedAt: h.updatedAt,
          generatedAt: h.payload?.cacheMeta?.generatedAt || h.payload?.stats?.generatedAt || new Date(h.cachedAt || u).toISOString(),
          warning: hc(y),
          partial: !0
        });
        throw y;
      }
    },
    async getDashboardCachedSnapshotPayload(a, o = {}) {
      const s = o?.db || e.getDB(a);
      if (!s) return null;
      const i = te(o?.config || await de(a)), c = Math.max(0, Number(o.nowMs) || K()), l = pt(new Date(c), i.scheduleUtcOffsetMinutes), d = qn(String(i.cfZoneId || "").trim(), l.dateKey), u = await e.getCfDashboardCacheEntry(s, d, {
        nowMs: c,
        includeExpired: !0
      });
      return !u || u.version !== 8 ? null : Jr(u.payload, u.expiresAt > c ? "cache" : "stale", {
        cachedAt: u.cachedAt,
        expiresAt: u.expiresAt,
        updatedAt: u.updatedAt,
        generatedAt: u.payload?.cacheMeta?.generatedAt || u.payload?.stats?.generatedAt || "",
        warning: u.expiresAt > c ? "" : "dashboard_cache_expired",
        partial: u.expiresAt <= c
      });
    },
    async getCloudflareRuntimeQuotaStatus(a, o = {}) {
      const s = o?.db || e.getDB(a), i = te(o?.config || {}), c = o?.forceRefresh === !0, l = String(i.cfAccountId || "").trim(), d = String(i.cfApiToken || "").trim(), u = String(i.cfKvNamespaceId || "").trim(), f = String(i.cfD1DatabaseId || "").trim();
      if (!l || !d) return {
        kv: _r("KV", "未配置 Cloudflare 账号联动", "请先在账号设置中填写 Cloudflare 账号 ID 与 API 令牌。"),
        d1: _r("D1", "未配置 Cloudflare 账号联动", "请先在账号设置中填写 Cloudflare 账号 ID 与 API 令牌。")
      };
      const m = K(), p = ue(i.cfQuotaPlanCacheMinutes, O.Defaults.CfQuotaPlanCacheMinutes, 1, 1440), g = p * 60 * 1e3;
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
            const R = ji(await Qi(l, d)), [E, w] = await Promise.all([u ? he(Vu(l, u, d), "cf_runtime.plan_profile.kv_details", {
              accountId: l,
              namespaceId: u
            }, null) : null, f ? he(ns(l, f, d), "cf_runtime.plan_profile.d1_details", {
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
                d1: { databaseName: String(w?.name || "").trim() }
              }
            };
          }
        });
      } catch (R) {
        const E = vt(R);
        return {
          kv: br("KV", "Cloudflare 计划信息读取失败", E),
          d1: br("D1", "Cloudflare 计划信息读取失败", E)
        };
      }
      const y = F(h?.payload) ? h.payload : {}, S = {
        ...Wn({
          usageModel: y.usageModel || y.planClass,
          override: i.cfQuotaPlanOverride
        }),
        resourceMeta: {
          kv: { namespaceTitle: String(y?.resourceMeta?.kv?.namespaceTitle || "").trim() },
          d1: { databaseName: String(y?.resourceMeta?.d1?.databaseName || "").trim() }
        }
      }, _ = zu(S.planClass), [A, b] = await Promise.all([(async () => {
        if (!u) return _r("KV", "未配置 KV Namespace", "请在账号设置中填写 Cloudflare KV Namespace ID。");
        try {
          const R = await e.loadCfRuntimeCachePayload(s, {
            cacheKey: `usage_metrics:kv:${l}:${u}:${_.cacheBucketKey}`,
            cacheGroup: "usage_metrics",
            resourceId: `kv:${u}`,
            ttlMs: g,
            nowMs: m,
            skipCacheRead: c,
            loader: async () => ({
              ...await Gu({
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
            usageState: R,
            namespaceId: u,
            nowTimestamp: m
          });
        } catch (R) {
          return br("KV", "KV 指标读取失败", vt(R));
        }
      })(), (async () => {
        if (!f) return _r("D1", "未配置 D1 数据库", "请在账号设置中填写 Cloudflare D1 Database ID。");
        try {
          const R = await e.loadCfRuntimeCachePayload(s, {
            cacheKey: `usage_metrics:d1:${l}:${f}:${_.cacheBucketKey}`,
            cacheGroup: "usage_metrics",
            resourceId: `d1:${f}`,
            ttlMs: g,
            nowMs: m,
            skipCacheRead: c,
            loader: async () => {
              const [E, w] = await Promise.all([ju({
                accountId: l,
                apiToken: d,
                databaseId: f,
                startIso: _.startIso,
                endIso: _.endIso
              }), ns(l, f, d)]);
              return {
                ...E,
                databaseName: String(w?.name || S?.resourceMeta?.d1?.databaseName || f).trim(),
                fileSizeBytes: Math.max(0, Number(w?.file_size ?? w?.fileSize) || 0)
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
          return br("D1", "D1 指标读取失败", vt(R));
        }
      })()]);
      return {
        kv: A,
        d1: b
      };
    }
  };
}
function eg(n = {}, e = {}) {
  return {
    ...qp(n, e),
    ...Xp(n, e),
    ...Yp(n, e),
    ...Jp(n, e),
    ...Qp(n, e),
    ...Zp(n, e)
  };
}
function tg(n = {}, e = {}) {
  return {
    getKV(r) {
      return Ca(r);
    },
    getDB(r) {
      return Jd(r);
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
    getD1SchemaReadyState(r) {
      if (!r || typeof r.prepare != "function") return null;
      let t = Q.D1SchemaReadyState.get(r);
      return t instanceof Map || (t = /* @__PURE__ */ new Map(), Q.D1SchemaReadyState.set(r, t)), t;
    },
    isD1SchemaReadyCached(r, t) {
      const a = e.getD1SchemaReadyState(r);
      return !!a && (Number(a.get(String(t || ""))) || 0) > K();
    },
    markD1SchemaReady(r, t) {
      const a = e.getD1SchemaReadyState(r);
      a && a.set(String(t || ""), K() + Math.max(1e3, Number(O.Defaults.D1SchemaReadyTtlMs) || 1e3));
    },
    clearD1SchemaReady(r, t = []) {
      const a = Q.D1SchemaReadyState.get(r);
      if (!(a instanceof Map)) return;
      const o = (Array.isArray(t) ? t : [t]).map((s) => String(s || "").trim()).filter(Boolean);
      if (!o.length) {
        a.clear();
        return;
      }
      for (const s of o) a.delete(s);
    },
    normalizeRevisionMeta(r, t) {
      const a = F(r) ? r : {}, o = F(t) ? t : {}, s = String(a.updatedAt || o.updatedAt || "").trim(), i = String(a.hash || o.hash || "").trim();
      return {
        ...o,
        ...a,
        updatedAt: s,
        hash: i,
        revision: String(a.revision || o.revision || Ft(i, s)).trim()
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
      const o = await we(r, t, { type: "json" });
      return F(o) ? e.normalizeRevisionMeta(o, a) : null;
    },
    async writeRevisionMeta(r, t, a, o = null) {
      if (!r || !t) return a;
      const s = r.put(t, JSON.stringify(a));
      return o && o.waitUntil(s), await s, a;
    },
    async ensureConfigMeta(r, t = null, a = {}) {
      const o = te(t ?? (await r?.get(e.CONFIG_KEY, { type: "json" }) || {})), s = e.normalizeRevisionMeta(Cr(o)), i = await e.readRevisionMeta(r, e.CONFIG_META_KEY);
      return i.hash === s.hash && i.revision ? i : await e.writeRevisionMeta(r, e.CONFIG_META_KEY, s, a.ctx);
    },
    async ensureConfigSnapshotsMeta(r, t = null, a = {}) {
      const o = Array.isArray(t) ? t : await e.readStoredConfigSnapshots(r), s = e.normalizeRevisionMeta({
        ...Cr(o),
        count: o.length
      }, { count: 0 }), i = await e.readRevisionMeta(r, e.CONFIG_SNAPSHOTS_META_KEY, { count: 0 });
      return i.hash === s.hash && Number(i.count) === Number(s.count) && i.revision ? i : await e.writeRevisionMeta(r, e.CONFIG_SNAPSHOTS_META_KEY, s, a.ctx);
    },
    buildNodesIndexMeta(r = [], t = [], a = {}) {
      const o = e.normalizeNodeIndex(r), s = e.normalizeNodeSummaryIndex(t).nodes, i = String(a.updatedAt || "").trim() || (/* @__PURE__ */ new Date()).toISOString(), c = ce(se(o)), l = ce(se(s)), d = ce(`${c}:${l}:${o.length}`);
      return {
        revision: Ft(d, i),
        updatedAt: i,
        hash: d,
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
      return i.indexHash === s.indexHash && i.fullIndexHash === s.fullIndexHash && Number(i.count) === Number(s.count) && i.revision ? i : await Er(async () => {
        const c = await e.loadNodeSummariesForMutation(r, { ctx: t.ctx });
        return (await e.commitNodesSummaryIndexMutation(c, {
          kv: r,
          ctx: t.ctx
        })).meta;
      }, r);
    },
    async getNodesRevision(r, t = {}) {
      if (!r) return "";
      const a = Se(r), o = K();
      if (t.forceFresh !== !0 && a.NodesRevisionCache?.loaded === !0 && a.NodesRevisionCache.exp > o) return String(a.NodesRevisionCache.revision || "").trim();
      const s = a.NodesRevisionCacheGeneration;
      return await ln(a.SingleFlightTasks, tt(["nodes_revision", s]), async () => {
        const i = a.NodesRevisionCache;
        if (t.forceFresh !== !0 && i?.loaded === !0 && i.exp > K()) return String(i.revision || "").trim();
        let c = null;
        try {
          c = await r.get(e.NODES_INDEX_META_KEY, { type: "json" });
        } catch {
          return "";
        }
        const l = F(c) ? String(c.revision || "").trim() : "";
        return a.NodesRevisionCacheGeneration === s && (a.NodesRevisionCache = {
          loaded: !0,
          revision: l,
          exp: K() + O.Defaults.NodesRevisionCacheTtlMs
        }), l;
      });
    },
    getLogsRevisionFromStatus(r = {}) {
      const t = String(r?.revision || "").trim();
      return t || Ft("logs", String(r?.updatedAt || "").trim());
    },
    async bumpLogsRevision(r, t = {}, a = null) {
      const o = await e.getOpsStatusSection(r, "log"), s = (/* @__PURE__ */ new Date()).toISOString(), i = ce(`${e.getLogsRevisionFromStatus(o)}:${s}:${se(t)}`);
      return await e.patchOpsStatus(r, { log: {
        ...t,
        revision: Ft(i, s),
        updatedAt: s
      } }, a);
    },
    async getAdminRevisions(r, t = {}) {
      const a = e.resolveOpsStatusStores(r), o = a.kv, s = a.db, [i, c, l, d, u] = await Promise.all([
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
        logsRevision: e.getLogsRevisionFromStatus(d),
        dnsIpPoolRevision: e.getDnsIpPoolRevisionFromStatus(u)
      };
    },
    async getAdminRevisionsForRead(r, t = {}) {
      const a = e.resolveOpsStatusStores(r), o = a.kv, s = a.db, [i, c, l, d, u] = await Promise.all([
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
        f = e.normalizeRevisionMeta(Cr(te(g)));
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
          ...Cr(Array.isArray(g) ? g : []),
          count: Array.isArray(g) ? g.length : 0
        }, { count: 0 });
      }
      return {
        configRevision: String(f?.revision || ""),
        nodesRevision: String(m?.revision || ""),
        snapshotsRevision: String(p?.revision || ""),
        logsRevision: e.getLogsRevisionFromStatus(d),
        dnsIpPoolRevision: e.getDnsIpPoolRevisionFromStatus(u)
      };
    }
  };
}
function rg(n = {}, e = {}) {
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
      ].every((p) => t.has(p)), [o, s] = await Promise.all([r.prepare("SELECT sql FROM sqlite_master WHERE type = 'table' AND name = ? LIMIT 1").bind(e.LOGS_FTS_TABLE).first(), r.prepare("SELECT name, tbl_name, sql FROM sqlite_master WHERE type = 'trigger' AND name = ? LIMIT 1").bind(e.LOGS_FTS_INSERT_TRIGGER).first()]), i = $n(o?.sql || "").replace(/'/g, ""), c = /^create\s+virtual\s+table\b/.test(i) && /\busing\s+fts5\s*\(/.test(i) && new RegExp(`\\bcontent\\s*=\\s*${e.LOGS_TABLE}\\b`).test(i) && /\bcontent_rowid\s*=\s*id\b/.test(i), l = $n(s?.sql || ""), d = l.replace(/\s+/g, ""), u = `insert into ${e.LOGS_FTS_TABLE} (
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
        return ((await r.prepare(`PRAGMA table_info(${Pa(t)})`).all())?.results || []).map((a) => ({
          name: String(a?.name || "").toLowerCase(),
          type: String(a?.type || "").trim().toUpperCase(),
          primaryKeyOrder: Math.max(0, Number(a?.pk) || 0)
        })).filter((a) => a.name);
      } catch (a) {
        const o = /* @__PURE__ */ new Error(`D1 schema inspection failed for ${t}`);
        throw o.code = "D1_SCHEMA_INSPECTION_FAILED", o.status = 503, o.details = {
          tableName: String(t),
          cause: ie(a, "d1_pragma_failed")
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
        return ((await r.prepare(`PRAGMA index_xinfo(${Pa(t)})`).all())?.results || []).map((a) => ({
          order: Math.max(0, Number(a?.seqno) || 0),
          name: String(a?.name || "").toLowerCase(),
          key: a?.key === void 0 || Number(a.key) === 1,
          expression: Number(a?.cid) === -2 || !String(a?.name || "").trim()
        })).filter((a) => a.key).sort((a, o) => a.order - o.order).map((a) => a.expression ? "<expression>" : a.name);
      } catch (a) {
        const o = /* @__PURE__ */ new Error(`D1 schema inspection failed for ${t}`);
        throw o.code = "D1_SCHEMA_INSPECTION_FAILED", o.status = 503, o.details = {
          indexName: String(t),
          cause: ie(a, "d1_pragma_failed")
        }, o;
      }
    },
    async getTableIndexDefinitions(r, t) {
      if (!r || !t) return [];
      try {
        return ((await r.prepare(`PRAGMA index_list(${Pa(t)})`).all())?.results || []).map((a) => ({
          name: String(a?.name || ""),
          unique: Number(a?.unique) === 1,
          partial: Number(a?.partial) === 1
        })).filter((a) => a.name);
      } catch (a) {
        const o = /* @__PURE__ */ new Error(`D1 schema inspection failed for ${t}`);
        throw o.code = "D1_SCHEMA_INSPECTION_FAILED", o.status = 503, o.details = {
          tableName: String(t),
          cause: ie(a, "d1_pragma_failed")
        }, o;
      }
    },
    async getD1TableNameSet(r) {
      if (!r) return /* @__PURE__ */ new Set();
      const t = await r.prepare("SELECT name FROM sqlite_master WHERE type = 'table'").all();
      return new Set((t?.results || []).map((a) => String(a?.name || "")).filter(Boolean));
    },
    getD1CurrentSchemaContract() {
      const r = e.getD1RequiredPrimaryKeyContract(), t = {
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
        primaryKeys: r,
        indexes: e.getD1RuntimeIndexContract()
      };
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
      const t = e.getD1CurrentSchemaContract(), [a, o] = await Promise.all([r.prepare("SELECT name FROM sqlite_master WHERE type = 'table'").all(), r.prepare("SELECT name, tbl_name FROM sqlite_master WHERE type = 'index'").all()]), s = new Set((a?.results || []).map((h) => String(h?.name || "")).filter(Boolean)), i = new Map((o?.results || []).map((h) => [String(h?.name || ""), String(h?.tbl_name || "")]).filter(([h]) => h)), c = Object.fromEntries(Object.keys(t.columns).map((h) => [h, s.has(h)])), l = {}, d = {}, u = [];
      for (const [h, y] of Object.entries(t.columns)) {
        if (!s.has(h)) {
          l[h] = Object.fromEntries(y.map((R) => [R, !1])), d[h] = !1, u.push(`missing_table:${h}`);
          continue;
        }
        const S = await e.getTableColumnDefinitions(r, h), _ = new Map(S.map((R) => [R.name, R]));
        l[h] = Object.fromEntries(y.map((R) => {
          const E = _.get(R), w = String(t.columnTypes?.[h]?.[R] || "").toUpperCase();
          return [R, !!E && (!w || E.type === w)];
        }));
        for (const [R, E] of Object.entries(l[h])) if (!E) {
          const w = _.get(R);
          u.push(w ? `invalid_column_type:${h}.${R}` : `missing_column:${h}.${R}`);
        }
        const A = S.filter((R) => R.primaryKeyOrder > 0).sort((R, E) => R.primaryKeyOrder - E.primaryKeyOrder).map((R) => R.name), b = h === e.LOGS_TABLE ? S.find((R) => R.name === "id") : null;
        d[h] = se(A) === se(t.primaryKeys[h] || []) && (!b || b.type === "INTEGER"), d[h] || u.push(`invalid_primary_key:${h}`);
      }
      let f = !1;
      if (s.has(e.DNS_IP_POOL_ITEMS_TABLE)) {
        for (const h of (await e.getTableIndexDefinitions(r, e.DNS_IP_POOL_ITEMS_TABLE)).filter((y) => y.unique && !y.partial)) if (se(await e.getIndexKeyColumns(r, h.name)) === se(["ip"])) {
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
        m[h] = S === y.table && _?.unique === !1 && _?.partial === !1 && se(await e.getIndexKeyColumns(r, h)) === se(y.columns), m[h] || u.push(`invalid_index:${h}`);
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
    async assertD1CurrentSchema(r, t = null) {
      const a = t || await e.getD1SchemaStatus(r);
      e.getD1CurrentSchemaContract();
      const o = [];
      for (const [s, i] of Object.entries(a.tables || {}))
        if (i) {
          for (const [c, l] of Object.entries(a.columns?.[s] || {})) if (!l) {
            const d = `${s}.${c}`;
            o.push((a.issues || []).find((u) => String(u).endsWith(d)) || `missing_column:${d}`);
          }
          a.constraints?.primaryKeys?.[s] !== !0 && o.push(`invalid_primary_key:${s}`);
        }
      a.tables?.[e.DNS_IP_POOL_ITEMS_TABLE] && a.constraints?.uniqueKeys?.[`${e.DNS_IP_POOL_ITEMS_TABLE}.ip`] !== !0 && o.push(`missing_unique_key:${e.DNS_IP_POOL_ITEMS_TABLE}.ip`);
      for (const [s, i] of Object.entries(a.indexes || {})) i || await r.prepare("SELECT tbl_name FROM sqlite_master WHERE type = 'index' AND name = ? LIMIT 1").bind(s).first() && o.push(`invalid_index:${s}`);
      if (a.fts?.tableReady && a.ftsReady !== !0 && o.push("fts_contract_invalid"), o.length) {
        const s = /* @__PURE__ */ new Error("Existing D1 schema does not match the current contract");
        throw s.code = "D1_SCHEMA_INCOMPATIBLE", s.status = 409, s.details = {
          phase: "preflight",
          issues: [...new Set(o)]
        }, s;
      }
      return !0;
    },
    async initializeD1Database(r, t = {}) {
      if (!r) {
        const i = /* @__PURE__ */ new Error("D1 not configured");
        throw i.code = "D1_NOT_CONFIGURED", i.status = 503, i;
      }
      const a = t.includeFts === !1 ? "logs-core" : "logs-fts";
      let o = Q.D1DatabaseInitReady.get(r);
      (!o || !(o.inFlight instanceof Map)) && (o = {
        tail: Promise.resolve(),
        inFlight: /* @__PURE__ */ new Map()
      }, Q.D1DatabaseInitReady.set(r, o));
      let s = o.inFlight.get(a);
      s || (s = Promise.resolve(o.tail).catch(() => {
      }).then(() => e.runD1DatabaseInitialization(r, {
        ...t,
        profile: a
      })), o.tail = s.catch(() => {
      }), o.inFlight.set(a, s));
      try {
        return await s;
      } finally {
        o.inFlight.get(a) === s && o.inFlight.delete(a);
      }
    },
    async runD1DatabaseInitialization(r, t = {}) {
      const a = t.profile || (t.includeFts === !1 ? "logs-core" : "logs-fts");
      e.invalidateD1SchemaReadiness(r, "all");
      const o = await e.getD1TableNameSet(r), s = await e.getD1SchemaStatus(r);
      await e.assertD1CurrentSchema(r, s);
      try {
        const i = await e.bootstrapD1Schema(r, a);
        e.invalidateD1SchemaReadiness(r, "all");
        const c = await e.getD1SchemaStatus(r);
        if (!c.schemaReady) {
          const l = /* @__PURE__ */ new Error("D1 schema initialization did not produce the current contract");
          throw l.code = "D1_SCHEMA_INCOMPATIBLE", l.status = 409, l.details = {
            phase: "final_status",
            issues: c.issues
          }, l;
        }
        return {
          profile: a,
          schemaReady: !0,
          createdTables: [...await e.getD1TableNameSet(r)].filter((l) => !o.has(l)),
          ftsRebuilt: i.ftsResult?.rebuilt === !0,
          ftsRecreated: i.ftsResult?.recreated === !0,
          steps: i.steps,
          status: c
        };
      } catch (i) {
        throw i;
      }
    },
    async probeLogsReadiness(r, t = {}) {
      if (!r) return {
        schemaReady: !1,
        ftsReady: !1,
        statsReady: !1,
        probedAt: (/* @__PURE__ */ new Date()).toISOString()
      };
      const a = oe.LogsReadinessProbeCache.get(r), o = Math.max(1e3, Number(t.maxAgeMs) || 15e3);
      if (t.force !== !0 && a && K() - a.ts < o) return a.data;
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
        ts: K(),
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
function ag(n = {}, e = {}) {
  return {
    async ensureLogsBaseSchema(r) {
      if (!r) return !1;
      if (e.isD1SchemaReadyCached(r, "logsBaseSchema")) return !0;
      let t = Q.LogsBaseDbReady.get(r);
      t || (t = (async () => (await r.prepare(`CREATE TABLE IF NOT EXISTS ${e.LOGS_TABLE} (id INTEGER PRIMARY KEY AUTOINCREMENT, timestamp INTEGER NOT NULL, node_name TEXT NOT NULL, request_path TEXT NOT NULL, request_method TEXT NOT NULL, status_code INTEGER NOT NULL, response_time INTEGER NOT NULL, client_ip TEXT NOT NULL, inbound_colo TEXT, outbound_colo TEXT, user_agent TEXT, referer TEXT, category TEXT DEFAULT 'api', error_detail TEXT, detail_json TEXT, created_at TEXT NOT NULL, inbound_ip TEXT, outbound_ip TEXT)`).run(), await r.prepare(`CREATE INDEX IF NOT EXISTS idx_proxy_logs_timestamp ON ${e.LOGS_TABLE} (timestamp)`).run(), await r.prepare(`CREATE INDEX IF NOT EXISTS idx_proxy_logs_client_time ON ${e.LOGS_TABLE} (client_ip, timestamp DESC)`).run(), await r.prepare(`CREATE INDEX IF NOT EXISTS idx_proxy_logs_status_time ON ${e.LOGS_TABLE} (status_code, timestamp)`).run(), await r.prepare(`CREATE INDEX IF NOT EXISTS idx_proxy_logs_category_time ON ${e.LOGS_TABLE} (category, timestamp)`).run(), e.markD1SchemaReady(r, "logsBaseSchema"), e.markD1SchemaReady(r, "logsTableExists"), oe.LogsReadinessProbeCache.delete(r), !0))().catch((a) => {
        throw Q.LogsBaseDbReady.delete(r), a;
      }), Q.LogsBaseDbReady.set(r, t));
      try {
        return await t;
      } finally {
        Q.LogsBaseDbReady.get(r) === t && Q.LogsBaseDbReady.delete(r);
      }
    },
    async ensureStatsHourlySchema(r) {
      if (!r) return !1;
      if (e.isD1SchemaReadyCached(r, "statsHourlySchema")) return !0;
      let t = Q.StatsHourlyDbReady.get(r);
      t || (t = r.prepare(`CREATE TABLE IF NOT EXISTS ${e.STATS_HOURLY_TABLE} (
              bucket_date TEXT NOT NULL,
              bucket_hour INTEGER NOT NULL,
              request_count INTEGER NOT NULL DEFAULT 0,
              play_count INTEGER NOT NULL DEFAULT 0,
              playback_info_count INTEGER NOT NULL DEFAULT 0,
              updated_at TEXT NOT NULL,
              PRIMARY KEY (bucket_date, bucket_hour)
            )`).run().then(() => (e.markD1SchemaReady(r, "statsHourlySchema"), e.markD1SchemaReady(r, "statsTableExists"), oe.LogsReadinessProbeCache.delete(r), !0)).catch((a) => {
        throw Q.StatsHourlyDbReady.delete(r), a;
      }), Q.StatsHourlyDbReady.set(r, t));
      try {
        return await t;
      } finally {
        Q.StatsHourlyDbReady.get(r) === t && Q.StatsHourlyDbReady.delete(r);
      }
    }
  };
}
function ng(n = {}, e = {}) {
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
      ]), Q.LogsBaseDbReady.delete(r), Q.StatsHourlyDbReady.delete(r), oe.LogsReadinessProbeCache.delete(r)), a === "all") {
        e.clearD1SchemaReady(r);
        const o = Q.OpsStatusShadowCache.get(r);
        o?.payloadCache instanceof Map && o.payloadCache.clear(), Q.AdminShellStatusWriteState.delete(r), Q.DnsIpWorkspaceDbReady.delete(r), Q.OpsStatusDbReady.delete(r), Q.ScheduledLeaseDbReady.delete(r), Q.AuthFailuresDbReady.delete(r), Q.CfDashboardCacheDbReady.delete(r), Q.CfRuntimeCacheDbReady.delete(r);
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
      for (const d of i) {
        const u = await d.run();
        d.name === "ensureLogsFtsSchema" && F(u) && (l = {
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
        runtimeTablesReady: o.every((d) => c.some((u) => u.name === d.name && u.ready === !0)),
        schemaReady: await e.hasLogsBaseTable(r),
        statsReady: await e.hasStatsHourlyTable(r),
        ftsReady: await e.isLogsFtsReady(r),
        ftsResult: l,
        steps: c
      };
    }
  };
}
function og(n = {}, e = {}) {
  return {
    ...tg(n, e),
    ...rg(n, e),
    ...ag(n, e),
    ...ng(n, e)
  };
}
function sg() {
  const n = {
    createSummary(e = {}, r = "manual", t = {}) {
      return {
        ...e.summary || {},
        mode: r,
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
    buildDeleteSteps(e, r = {}, t = {}, a = {}, o) {
      return [
        [
          a.deleteExpiredLogs,
          t.deletedExpiredLogCount,
          "deleteExpiredLogs",
          e.LOGS_TABLE,
          "timestamp < ?",
          r.retentionCutoffMs
        ],
        [
          a.deleteExpiredLocks,
          t.deletedExpiredLockCount,
          "deleteExpiredLocks",
          e.SCHEDULED_LOCKS_TABLE,
          "expires_at <= ?",
          r.nowMs
        ],
        [
          a.deleteExpiredFetchCache,
          t.deletedExpiredFetchCacheCount,
          "deleteExpiredFetchCache",
          e.DNS_IP_POOL_FETCH_CACHE_TABLE,
          "expires_at <= ?",
          r.nowMs
        ],
        [
          a.deleteExpiredProbeCache,
          t.deletedExpiredProbeCacheCount,
          "deleteExpiredProbeCache",
          e.DNS_IP_PROBE_CACHE_TABLE,
          "expires_at <= ?",
          r.nowMs
        ],
        [
          a.deleteExpiredAuthFailures,
          t.deletedExpiredAuthFailureCount,
          "deleteExpiredAuthFailures",
          e.AUTH_FAILURES_TABLE,
          "expires_at <= ?",
          r.nowMs
        ],
        [
          a.deleteExpiredDashboardCache,
          t.deletedExpiredDashboardCacheCount,
          "deleteExpiredDashboardCache",
          e.CF_DASH_CACHE_TABLE,
          "expires_at <= ?",
          r.nowMs
        ],
        [
          a.deleteExpiredRuntimeCache,
          t.deletedExpiredRuntimeCacheCount,
          "deleteExpiredRuntimeCache",
          e.CF_RUNTIME_CACHE_TABLE,
          "expires_at <= ?",
          r.nowMs
        ]
      ].map(([s, i, c, l, d, u]) => ({
        enabled: s,
        count: i,
        stepName: c,
        db: o,
        sql: `DELETE FROM ${l} WHERE ${d}`,
        bindParams: [u]
      }));
    },
    async runDeleteStep({ enabled: e = !1, count: r = 0, beforeStep: t = async (c) => {
    }, stepName: a = "", db: o, sql: s = "", bindParams: i = [] }) {
      return e !== !0 || Number(r) <= 0 ? !1 : (await t(a), await o.prepare(s).bind(...i).run(), !0);
    },
    async runDeleteSteps(e = [], r = async (t) => {
    }) {
      let t = !1;
      for (const a of Array.isArray(e) ? e : []) t = await n.runDeleteStep({
        beforeStep: r,
        ...F(a) ? a : {}
      }) || t;
      return t;
    },
    async patchLogStatus(e, r, t, a, o, s, i = {}) {
      const c = (/* @__PURE__ */ new Date()).toISOString(), l = String(a?.mode || i.mode || "manual").trim().toLowerCase() === "scheduled" ? "scheduled" : "manual", d = await e.isLogsFtsReady(r), u = await e.hasStatsHourlyTable(r);
      await e.getD1SchemaStatus(r);
      const f = {
        schemaReady: !0,
        ftsReady: d,
        statsReady: u,
        categoryEnabled: !0,
        statsUtcOffsetMinutes: a.statsUtcOffsetMinutes || a.utcOffsetMinutes
      };
      return (o.rebuiltStatsHourly === !0 || o.alignedStatsWindow === !0) && (f.statsAlignedAt = c, f.statsAlignedWindowStartAt = new Date((l === "scheduled" ? a.statsStartTs : a.retentionCutoffMs) || a.retentionCutoffMs).toISOString(), f.statsAlignedWindowEndAt = new Date((l === "scheduled" ? a.statsEndTs : a.nowMs) || a.nowMs).toISOString()), l === "scheduled" && s.deleteExpiredLogs === !0 && Number(o.deletedExpiredLogCount) > 0 ? await e.bumpLogsRevision(t, f, i.ctx).catch(() => {
      }) : await he(e.patchOpsStatus(t, { log: f }, i.ctx), "d1_tidy.patch_log_status", { mode: l }, null), c;
    }
  };
  return n;
}
function ig() {
  return {
    buildContext(n = {}, e = {}) {
      const r = String(e.mode || "manual").trim().toLowerCase() === "scheduled" ? "scheduled" : "manual", t = ft(e.maintenanceMode, r), a = e.scheduledNow instanceof Date ? new Date(e.scheduledNow.getTime()) : new Date(e.scheduledNow || K()), o = Number(e.nowMs) || (r === "scheduled" ? a.getTime() : K()), s = ue(n.logRetentionDays, O.Defaults.LogRetentionDays, 1, O.Defaults.LogRetentionDaysMax), i = Math.max(0, o - s * 24 * 60 * 60 * 1e3), c = ke(n.scheduleUtcOffsetMinutes), l = F(e.dayWindow) ? e.dayWindow : pt(a, n.scheduleUtcOffsetMinutes);
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
        statsUtcOffsetMinutes: ke(e.statsUtcOffsetMinutes ?? l?.utcOffsetMinutes ?? n.scheduleUtcOffsetMinutes),
        previousScheduledState: F(e.previousScheduledState) ? e.previousScheduledState : {},
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
    buildFlags(n, e, r, t) {
      const a = r.deletedExpiredLogCount > 0, o = mf(e.maintenanceMode, e.mode), s = o || !r.ftsReady || a && n.shouldRunLogsFtsRebuild(e.lastFtsRebuildAt, { nowMs: e.nowTimestamp }), i = o ? !0 : a && n.shouldRunLogsOptimize(e.lastOptimizeAt, { nowMs: e.nowTimestamp }), c = e.mode === "scheduled" && a, l = o || a;
      return {
        deleteExpiredLogs: a,
        deleteExpiredLocks: r.deletedExpiredLockCount > 0,
        deleteExpiredFetchCache: r.deletedExpiredFetchCacheCount > 0,
        deleteExpiredProbeCache: r.deletedExpiredProbeCacheCount > 0,
        deleteExpiredAuthFailures: r.deletedExpiredAuthFailureCount > 0,
        deleteExpiredDashboardCache: r.deletedExpiredDashboardCacheCount > 0,
        deleteExpiredRuntimeCache: r.deletedExpiredRuntimeCacheCount > 0,
        rebuildStatsHourly: l,
        rebuildLogsFts: s,
        rebuildLogsFtsDeferred: e.mode === "scheduled" && a && r.ftsReady && s !== !0,
        rebuildLogsFtsForceRecreate: !1,
        optimizeDb: i,
        optimizeDbDeferred: e.mode === "scheduled" && a && i !== !0,
        alignStatsWindow: c,
        rebuildDailyStats: c,
        processDnsIpPoolSources: !1
      };
    },
    buildPreview(n, e, r, t) {
      const a = [], o = Tu(e.d1DnsIpPoolSources);
      Ee(a, e.deletedExpiredLogCount > 0, "proxy_logs", "超保留期 proxy_logs 日志", [], e.deletedExpiredLogCount, `只会删除早于 ${new Date(n.retentionCutoffMs).toISOString()} 的日志。`), Ee(a, e.deletedExpiredLockCount > 0, "sys_locks", "过期 sys_locks 定时租约", [], e.deletedExpiredLockCount, "只会删除 expires_at 已过期的租约记录。"), Ee(a, e.deletedExpiredFetchCacheCount > 0, "dns_ip_pool_fetch_cache", "过期 dns_ip_pool_fetch_cache 聚合缓存", [], e.deletedExpiredFetchCacheCount, "只会删除 expires_at 已过期的 API 抓取聚合缓存。"), Ee(a, e.deletedExpiredProbeCacheCount > 0, "dns_ip_probe_cache", "过期 dns_ip_probe_cache 探测缓存", [], e.deletedExpiredProbeCacheCount, "只会删除 expires_at 已过期的探测缓存。"), Ee(a, e.deletedExpiredAuthFailureCount > 0, "auth_failures", "过期 auth_failures 登录失败计数", [], e.deletedExpiredAuthFailureCount, "只会删除 expires_at 已过期的登录失败计数。"), Ee(a, e.deletedExpiredDashboardCacheCount > 0, "cf_dashboard_cache", "过期 cf_dashboard_cache 仪表盘缓存", [], e.deletedExpiredDashboardCacheCount, "只会删除 expires_at 已过期的仪表盘缓存。");
      const s = [
        lt("proxy_stats_hourly", "proxy_stats_hourly 统计表", [], {
          count: Math.max(1, e.statsHourlyRowCount),
          note: n.maintenanceMode === "full" ? `会按保留期内日志全量重建小时统计（当前行数 ${e.statsHourlyRowCount}）。` : `会在必要时对齐小时统计（当前行数 ${e.statsHourlyRowCount}）。`
        }),
        lt("proxy_logs_fts", "proxy_logs_fts 全文索引", [], {
          count: Math.max(1, e.preservedLogCount),
          note: e.ftsReady ? n.maintenanceMode === "full" ? "会基于当前保留日志重建全文索引。" : "会在必要时重建全文索引。" : "当前未检测到 FTS 表，整理时会按策略补建并重建全文索引。"
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
      const c = [], l = Math.max(0, Number(n.logQueuePendingCount) || 0);
      return l > 0 && c.push(`执行前会先尝试 flush ${l} 条内存日志，再开始清理 D1。`), c.push(n.maintenanceMode === "full" ? "当前为 full 维护模式，会强制执行统计、FTS 与 optimize。" : "当前为 smart 维护模式，只在检测到必要条件时执行较重的统计、FTS 与 optimize。"), a.length === 0 && c.push(n.mode === "scheduled" ? "当前定时 D1 维护没有检测到需要删除的旧数据，本轮会按计划检查统计与索引维护。" : "当前没有检测到需要删除的 D1 旧数据；本次主要会执行统计表与 FTS 维护。"), {
        scope: "d1",
        fieldGroups: [],
        deleteGroups: a,
        rewriteGroups: s,
        preserveGroups: i,
        warnings: c
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
var cg = Object.freeze({
  PREFIX: "node:",
  CONFIG_KEY: "sys:theme",
  NODES_INDEX_KEY: "sys:nodes_index:v1",
  NODES_SUMMARY_INDEX_KEY: "sys:nodes_index_full:v2",
  ADMIN_INDEX_UPLOAD_PREFIX: Gl,
  ADMIN_ACTIVE_INDEX_KEY: jl,
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
function lg(n = {}) {
  const { nodeRepository: e } = n;
  return {
    async getNodesList(r, t) {
      const a = e.getKV(r);
      if (!a) return [];
      const o = Se(a);
      if (o.NodesListCache && o.NodesListCache.exp > K()) return o.NodesListCache.data;
      const s = await e.getNodesSummaryIndex(a, { ctx: t });
      if (Array.isArray(s)) return s;
      const i = await e.rebuildNodeIndexesFromKv(a, { ctx: t });
      return Array.isArray(i?.summaries) ? i.summaries : [];
    },
    async getNodesListStrict(r, t) {
      const a = e.getKV(r);
      if (!a) return [];
      const o = Se(a);
      if (o.NodesListCache && o.NodesListCache.exp > K()) return o.NodesListCache.data;
      const s = await e.getNodesSummaryIndexStrict(a, { ctx: t });
      if (Array.isArray(s)) return s;
      const i = await e.rebuildNodeIndexesFromKvStrict(a, { ctx: t });
      return Array.isArray(i?.summaries) ? i.summaries : [];
    },
    async invalidateList(r, t = null) {
      const a = e.getKV(t), o = Se(a);
      o.NodesListCache = null, o.NodesIndexCache = null, nr(a);
    },
    maybeCleanup(r = null) {
      const t = r ? Se(e.getKV(r)) : gt.current(), a = K(), o = t.CleanupState;
      if (a - (o.lastRunAt || 0) < O.Defaults.CleanupMinIntervalMs) return;
      o.lastRunAt = a;
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
      }), l = a, d = (u, f, m, p = c) => {
        let g = p[m];
        g || (g = u.entries(), p[m] = g);
        let h = 0;
        for (; h < i && (h === 0 || K() - l < s); ) {
          const y = g.next();
          if (y.done) {
            p[m] = null;
            break;
          }
          h += 1;
          const [S, _] = y.value;
          u.has(S) && f(_, a) && u.delete(S);
        }
      };
      if (o.phase === 0)
        d(t.NodeCache, (u) => u?.exp && u.exp < a, "node", t.CleanupIterators), o.phase = 1;
      else if (o.phase === 1)
        d(t.PlaybackRouteHotCache, (u) => !u || Number(u.expiresAt) <= a, "playbackRoute", t.CleanupIterators), o.phase = 2;
      else if (o.phase === 2)
        d(oe.CryptoKeyCache, (u) => u?.exp && u.exp < a, "crypto"), o.phase = 3;
      else if (o.phase === 3)
        d(Ye.RateLimitCache, (u) => !u || u.resetAt < a, "rate"), o.phase = 4;
      else if (o.phase === 4) o.phase = 5;
      else if (o.phase === 5)
        d(oe.PlaybackInfoResponseCache, (u) => !u || (Number(u.expiresAt) || 0) <= a, "playbackInfo"), o.phase = 6;
      else if (o.phase === 6)
        d(oe.ProxyFailoverStateCache, (u) => {
          if (!u || typeof u != "object") return !0;
          if (u.failingTargets instanceof Map)
            for (const [y, S] of u.failingTargets) Number(S) <= a && u.failingTargets.delete(y);
          const f = Number(u.preferredTargetExpiresAt) > a, m = u.failingTargets instanceof Map && u.failingTargets.size > 0, p = !!u.inFlightProbe && Number(u.inFlightProbe.expiresAt) > a, g = Number(u.lastProbeResult?.completedAt) || 0, h = !!u.lastProbeResult && g + O.Defaults.HedgePreferredTtlSec * 1e3 > a;
          return !f && !m && !p && !h;
        }, "failover"), o.phase = 7;
      else if (o.phase === 7) {
        const u = Math.max(3e4, Math.max(1, Number(O.Defaults.VideoProgressForwardIntervalSec) || 1) * 2e4);
        d(oe.PlaybackProgressRelay, (f) => {
          if (!f || f.pendingSnapshot || f.activeFlushPromise) return !f;
          const m = Number(f.terminalTombstoneUntil) || 0;
          if (m > 0) return m < a;
          const p = Number(f.lastTouchedAt || f.lastForwardAt) || 0;
          return p > 0 && p + u <= a;
        }, "progress"), o.phase = 8;
      } else
        d(oe.DashboardMonthlyTrafficCache, (u) => !u || (Number(u.staleUntil) || 0) <= a, "monthlyTraffic"), o.phase = 0;
    }
  };
}
function dg(n = {}, e = {}) {
  const {} = n;
  return {
    normalizeNodeIndex(r = []) {
      return [...new Set((Array.isArray(r) ? r : []).map((t) => String(t || "").toLowerCase().trim()).filter(Boolean))];
    },
    normalizeNodeSummaryPayload(r, t = {}) {
      if (!F(t)) return null;
      const a = String(r || t.name || "").toLowerCase().trim();
      if (!a) return null;
      const o = e.normalizeLines(t.lines, t.target, t.port);
      if (!o.length) return null;
      const s = e.resolveActiveLineId(t.activeLineId, o, Array.isArray(t.lines) ? t.lines : [], t.port), i = er(t.entryMode);
      return {
        name: a,
        cacheRevision: Qn(a, t),
        displayName: String(t.displayName ?? ""),
        entryMode: i,
        hostPrefixCnameTarget: i === "host_prefix" ? $t(t.hostPrefixCnameTarget) : "",
        secret: i === "host_prefix" ? "" : String(t.secret ?? ""),
        tag: Fr(t.tags, t.tag)[0] || "",
        tags: Fr(t.tags, t.tag),
        tagColor: String(t.tagColor ?? ""),
        remark: String(t.remark ?? ""),
        lines: o.map((c) => ({
          id: String(c.id || "").trim(),
          name: String(c.name || "").trim(),
          target: String(c.target || "").trim()
        })),
        activeLineId: s,
        playbackInfoMode: wr(t.playbackInfoMode),
        mediaAuthMode: Zt(t.mediaAuthMode),
        realClientIpMode: Tr(t.realClientIpMode),
        hedgeProbePath: oa(t.hedgeProbePath),
        routingDecisionMode: Lr(t.routingDecisionMode),
        mainVideoStreamMode: an(t.mainVideoStreamMode ?? t.wangpanDirectMode ?? t.wangpanMode)
      };
    },
    buildComparableNodeSummary(r = {}) {
      return e.normalizeNodeSummaryPayload(r?.name, r);
    },
    areNodeSummariesEquivalent(r = {}, t = {}) {
      return se(e.buildComparableNodeSummary(r)) === se(e.buildComparableNodeSummary(t));
    },
    hasLegacyNodeMirrorFields(r = {}) {
      return F(r) ? Object.prototype.hasOwnProperty.call(r, "headers") || Object.prototype.hasOwnProperty.call(r, "target") || Object.prototype.hasOwnProperty.call(r, "port") || Object.prototype.hasOwnProperty.call(r, "schemaVersion") || Object.prototype.hasOwnProperty.call(r, "createdAt") || Object.prototype.hasOwnProperty.call(r, "updatedAt") || Object.prototype.hasOwnProperty.call(r, "remarkColor") || Object.prototype.hasOwnProperty.call(r, "wangpanDirectMode") || Object.prototype.hasOwnProperty.call(r, "wangpanMode") || [...fn, ...mn].some((t) => Object.prototype.hasOwnProperty.call(r, t)) ? !0 : (Array.isArray(r.lines) ? r.lines : []).some((t) => F(t) ? Object.prototype.hasOwnProperty.call(t, "port") || Object.prototype.hasOwnProperty.call(t, "latencyMs") || Object.prototype.hasOwnProperty.call(t, "latencyUpdatedAt") : !1) : !1;
    },
    summaryEntryRequiresNodeEntityRebuild(r = {}) {
      if (!F(r) || e.hasLegacyNodeMirrorFields(r)) return !0;
      const t = Array.isArray(r.lines) ? r.lines : [], a = e.normalizeLines(t, r.target, r.port);
      if (!a.length || t.length !== a.length) return !0;
      for (let o = 0; o < a.length; o += 1) {
        const s = t[o], i = a[o];
        if (!F(s) || !F(i) || String(s.target || "").trim() !== String(i.target || "").trim()) return !0;
      }
      return String(r.activeLineId || "").trim() !== e.resolveActiveLineId(r.activeLineId, a, t, r.port);
    },
    buildNodeSummary(r, t = {}, a = {}) {
      const o = String(r || t.name || "").toLowerCase().trim();
      if (!o || !F(t)) return {
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
        if (!F(c)) {
          o = !0, i = !0;
          continue;
        }
        const l = String(c.name || "").trim(), d = l.toLowerCase();
        if (!d || a.has(d)) {
          o = !0, i = !0;
          continue;
        }
        const { name: u, ...f } = c, m = e.buildNodeSummary(d, f);
        if (!m.summary) {
          o = !0, i = !0;
          continue;
        }
        (m.changed || l !== d) && (o = !0), m.legacyMirrorDetected && (s = !0), e.summaryEntryRequiresNodeEntityRebuild(f) && (i = !0), t.push(m.summary), a.add(d);
      }
      return {
        nodes: t,
        changed: o,
        legacyMirrorDetected: s,
        requiresRebuild: i
      };
    },
    primeNodeSummaryCaches(r = [], t = null) {
      const a = Se(t), o = Array.isArray(r) ? r.filter((i) => F(i) && i.name) : [], s = e.normalizeNodeIndex(o.map((i) => i.name));
      return a.NodesListCache = {
        data: o.map((i) => ({ ...i })),
        exp: K() + 6e4
      }, a.NodesIndexCache = {
        data: s,
        exp: K() + 6e4
      }, o;
    },
    async getNodesSummaryIndex(r, t = {}) {
      if (!r) return null;
      const a = Se(r);
      if (t.useCache !== !1 && a.NodesListCache?.exp > K() && Array.isArray(a.NodesListCache.data)) return a.NodesListCache.data;
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
      const a = Se(r);
      if (t.useCache !== !1 && a.NodesListCache?.exp > K() && Array.isArray(a.NodesListCache.data)) return a.NodesListCache.data;
      const o = a.NodesRevisionCacheGeneration, s = await we(r, e.NODES_SUMMARY_INDEX_KEY, { type: "json" });
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
      const { kv: a, ctx: o, syncLegacyIndex: s = !1 } = t, i = e.normalizeNodeSummaryIndex(r).nodes, c = e.normalizeNodeIndex(i.map((g) => g.name)), l = e.buildNodesIndexMeta(c, i), d = await e.readRevisionMeta(a, e.NODES_INDEX_META_KEY, {
        count: 0,
        indexHash: "",
        fullIndexHash: ""
      }), u = [];
      (d.fullIndexHash !== l.fullIndexHash || !d.revision) && u.push(a.put(e.NODES_SUMMARY_INDEX_KEY, JSON.stringify(i))), s !== !1 && (d.indexHash !== l.indexHash || !d.revision) && u.push(a.put(e.NODES_INDEX_KEY, JSON.stringify(c)));
      const f = d.indexHash !== l.indexHash || d.fullIndexHash !== l.fullIndexHash || Number(d.count) !== Number(l.count) || !d.revision;
      if (u.length > 0) {
        const g = Promise.all(u);
        o && o.waitUntil(g), await g;
      }
      if (f) {
        const g = a.put(e.NODES_INDEX_META_KEY, JSON.stringify(l));
        o && o.waitUntil(g), await g;
      }
      const m = e.primeNodeSummaryCaches(i, a), p = f ? l : d;
      return ms(p.revision, a), {
        summaries: m,
        meta: p
      };
    },
    async persistNodesSummaryIndex(r, t = {}) {
      const { kv: a, ctx: o, syncLegacyIndex: s = !1 } = t, i = e.normalizeNodeSummaryIndex(r).nodes;
      if (!a) {
        const c = e.primeNodeSummaryCaches(i, a);
        return nr(a), c;
      }
      return await Er(async () => (await e.commitNodesSummaryIndexMutation(i, {
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
      return r ? (await Vr(await e.listNodeEntityKeys(r), O.Defaults.NodesReadConcurrency, async (o) => {
        try {
          const s = await r.get(`${e.PREFIX}${o}`, { type: "json" });
          if (!s) return null;
          const i = e.normalizeNode(o, s);
          if (i.changed) {
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
      return r ? (await Vr(await e.listNodeEntityKeysStrict(r), O.Defaults.NodesReadConcurrency, async (a) => {
        const o = await we(r, `${e.PREFIX}${a}`, { type: "json" });
        return o ? {
          name: a,
          ...e.normalizeNode(a, o).data
        } : null;
      })).filter(Boolean) : [];
    },
    async rebuildNodeIndexesFromKv(r, t = {}) {
      const { ctx: a, syncLegacyIndex: o = !1 } = t;
      return r ? await Er(async () => {
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
      const a = Se(r), o = a.NodesRevisionCacheGeneration, s = await e.loadAllNodeEntitiesFromKvStrict(r, t), i = s.map((l) => e.buildNodeSummary(l?.name, l).summary).filter(Boolean), c = a.NodesRevisionCacheGeneration === o ? e.primeNodeSummaryCaches(i, r) : i;
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
      if (!i) return null;
      const c = e.buildNodeSummary(i, t).summary;
      if (!c) return null;
      const l = Se(o), d = l.NodesListCache?.exp > K() && Array.isArray(l.NodesListCache.data) ? l.NodesListCache.data.find((u) => String(u?.name || "").toLowerCase().trim() === i) : null;
      return d && e.areNodeSummariesEquivalent(d, c) ? d : await Er(async () => {
        const u = await e.loadNodeSummariesForMutation(o, { ctx: s });
        let f = !1;
        const m = u.map((p) => String(p?.name || "").toLowerCase().trim() !== i ? p : (f = !0, e.areNodeSummariesEquivalent(p, c) ? p : c));
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
      return await Er(async () => {
        const i = (await e.loadNodeSummariesForMutation(a, { ctx: o })).filter((c) => String(c?.name || "").toLowerCase().trim() !== s);
        return (await e.commitNodesSummaryIndexMutation(i, {
          kv: a,
          ctx: o
        })).summaries;
      }, a);
    },
    async getNodesIndex(r) {
      if (!r) return [];
      const t = Se(r);
      if (t.NodesIndexCache?.exp > K() && Array.isArray(t.NodesIndexCache.data)) return [...t.NodesIndexCache.data];
      if (t.NodesListCache?.exp > K() && Array.isArray(t.NodesListCache.data)) {
        const s = e.normalizeNodeIndex(t.NodesListCache.data.map((i) => i?.name));
        return t.NodesIndexCache = {
          data: s,
          exp: K() + 6e4
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
        exp: K() + 6e4
      }), [...o];
    },
    buildPlaybackRouteHotSignature(r, t = {}) {
      const a = String(r || "").toLowerCase().trim(), o = ce(se(e.getOrderedNodeLines(t).map((s) => String(s?.target || "").trim()).filter(Boolean)));
      return {
        cacheKey: `${a}:${String(t?.activeLineId || "").trim()}:${o}`,
        orderedTargetSignature: o
      };
    },
    buildPlaybackRouteHotSnapshot(r, t = {}, a = {}) {
      const o = String(r || "").toLowerCase().trim();
      if (!o || !F(t)) return null;
      const s = e.getOrderedNodeLines(t), i = (s.length ? s.map((m) => m?.target) : String(t.target || "").split(",").map((m) => m.trim()).filter(Boolean)).map((m) => un(m)).filter(Ze);
      if (!i.length) return null;
      const c = Array.isArray(t.lines) ? t.lines.map((m) => F(m) ? { ...m } : m) : [], l = F(t.headers) ? { ...t.headers } : {}, d = {
        ...t,
        lines: c,
        headers: l
      }, { cacheKey: u, orderedTargetSignature: f } = e.buildPlaybackRouteHotSignature(o, d);
      return {
        nodeName: o,
        cacheKey: u,
        expiresAt: K() + id,
        nodesRevision: String(a.nodesRevision || "").trim(),
        nodeCacheRevision: Qn(o, d),
        orderedTargetSignature: f,
        secret: String(d.secret || "").trim(),
        headers: l,
        lines: c,
        activeLineId: String(d.activeLineId || "").trim(),
        mainVideoStreamMode: vr(d),
        playbackInfoMode: wr(d.playbackInfoMode),
        mediaAuthMode: Zt(d.mediaAuthMode),
        realClientIpMode: Tr(d.realClientIpMode),
        routingDecisionMode: Lr(d.routingDecisionMode),
        targetRecords: i,
        nodeData: d
      };
    },
    getPlaybackRouteHotSnapshot(r, t = null) {
      const a = String(r || "").toLowerCase().trim();
      if (!a) return null;
      const o = Se(t ? e.getKV(t) : null).PlaybackRouteHotCache, s = o.get(a);
      return s ? Number(s.expiresAt) <= K() ? (o.delete(a), null) : (Ya(o, a), s) : null;
    },
    async getVerifiedPlaybackRouteHotSnapshot(r, t) {
      const a = e.getKV(t), o = Se(a), s = Ie(r, o), i = e.getPlaybackRouteHotSnapshot(r, t);
      if (!i) return null;
      if (!a) return i;
      const c = await e.getNodesRevision(a);
      return Ie(r, o) !== s ? null : !i.nodesRevision || !c || i.nodesRevision === c ? i : (e.invalidatePlaybackRouteHotCache(r, t), null);
    },
    setPlaybackRouteHotSnapshot(r, t = {}, a = {}, o = null) {
      const s = e.buildPlaybackRouteHotSnapshot(r, t, a);
      return s ? (xe(Se(o ? e.getKV(o) : null).PlaybackRouteHotCache, s.nodeName, s, rr), s) : null;
    },
    async primePlaybackRouteHotSnapshot(r, t = {}, a) {
      const o = e.getKV(a), s = Se(o), i = Ie(r, s), c = o ? await e.getNodesRevision(o) : "";
      return Ie(r, s) !== i ? null : e.setPlaybackRouteHotSnapshot(r, t, { nodesRevision: c }, a);
    },
    invalidatePlaybackRouteHotCache(r = [], t = null) {
      const a = Se(t ? e.getKV(t) : null).PlaybackRouteHotCache;
      for (const o of Array.isArray(r) ? r : [r]) {
        const s = String(o || "").toLowerCase().trim();
        s && a.delete(s);
      }
    },
    invalidateNodeCaches(r = [], t = {}) {
      const a = t.kv || (t.env ? e.getKV(t.env) : null), o = Se(a), s = [];
      for (const i of Array.isArray(r) ? r : [r]) {
        const c = String(i || "").toLowerCase().trim();
        c && (s.push(c), o.NodeCache.delete(c), o.PlaybackRouteHotCache.delete(c));
      }
      s.length > 0 && (fm(s, o), xc(s), Oc(s)), t.invalidateList && (o.NodesListCache = null, o.NodesIndexCache = null, nr(a));
    },
    async persistNodesIndex(r, t = {}) {
      const { kv: a, ctx: o, invalidateList: s = !1 } = t, i = Se(a), c = e.normalizeNodeIndex(r);
      return s && (i.NodesListCache = null), a ? await Er(async () => {
        const l = await e.readRevisionMeta(a, e.NODES_INDEX_META_KEY, {
          count: 0,
          indexHash: "",
          fullIndexHash: ""
        }), d = ce(se(c)), u = l.indexHash === d && l.revision ? l.updatedAt : (/* @__PURE__ */ new Date()).toISOString(), f = {
          ...l,
          updatedAt: u,
          revision: l.indexHash === d && l.revision ? l.revision : Ft(ce(`${d}:${l.fullIndexHash || ""}:${c.length}`), u),
          hash: l.hash || "",
          count: c.length,
          indexHash: d,
          fullIndexHash: String(l.fullIndexHash || "")
        }, m = [];
        (l.indexHash !== d || !l.revision) && m.push(a.put(e.NODES_INDEX_KEY, JSON.stringify(c)));
        const p = l.indexHash !== d || Number(l.count) !== c.length || !l.revision;
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
          exp: K() + 6e4
        }, ms(f.revision, a), c;
      }, a) : (i.NodesIndexCache = {
        data: c,
        exp: K() + 6e4
      }, nr(a), c);
    }
  };
}
function ug(n = {}, e = {}) {
  const {} = n;
  return {
    getDnsRecordHistoryKey(r, t) {
      const a = encodeURIComponent(String(r || "").trim() || "default"), o = encodeURIComponent(String(t || "").trim() || "unknown");
      return `${e.DNS_RECORD_HISTORY_PREFIX}${a}:${o}`;
    },
    getDnsHostHistoryRecordId(r) {
      return `host:${ee(r) || "unknown"}`;
    },
    normalizeDnsHistoryValueKey(r, t) {
      return `${String(r || "").trim().toUpperCase()}::${String(t || "").trim().toLowerCase()}`;
    },
    normalizeDnsRecordHistoryEntry(r = {}) {
      const t = r && typeof r == "object" ? r : {}, a = String(t.type || "").trim().toUpperCase(), o = String(t.content || "").trim(), s = String(t.savedAt || t.updatedAt || t.createdAt || "").trim(), i = s ? new Date(s) : null, c = i && !Number.isNaN(i.getTime()) ? i.toISOString() : "", l = String(t.name || "").trim(), d = String(t.actor || "admin").trim() || "admin", u = String(t.source || "ui").trim() || "ui", f = ee(t.requestHost), m = [
        a,
        o.toLowerCase(),
        l.toLowerCase(),
        f,
        c || s,
        u.toLowerCase()
      ].join("|");
      return {
        id: String(t.id || `dns-hist-${ce(m || "empty")}`),
        name: l,
        type: a,
        content: o,
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
        if (a.set(c, t.length), t.push(i), t.length >= O.Defaults.DnsHistoryLimit) break;
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
      s.find((d) => e.normalizeDnsHistoryValueKey(d?.type, d?.content) === e.normalizeDnsHistoryValueKey(i.type, i.content))?.preferredFallback === !0 && (i.preferredFallback = !0);
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
    getCurrentDateKey(r = /* @__PURE__ */ new Date(), t = O.Defaults.ScheduleUtcOffsetMinutes) {
      return Bt(r, t).dateKey;
    }
  };
}
function fg(n = {}, e = {}) {
  const {} = n;
  return {
    buildLegacyConfigCacheKeys(...r) {
      const t = /* @__PURE__ */ new Set([mc]);
      for (const a of r) {
        const o = e.getCurrentDateKey(/* @__PURE__ */ new Date(), a?.scheduleUtcOffsetMinutes);
        t.add(hs(a?.cfZoneId)), t.add(hs(a?.cfZoneId, o));
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
        const d = s ? await r.list({
          prefix: a,
          cursor: s
        }) : await r.list({ prefix: a });
        for (const f of d?.keys || []) {
          const m = String(f?.name || "").trim();
          m && o.push(m);
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
      return [...new Set(o)];
    },
    async listKvKeysStrict(r, t = {}) {
      if (!r || typeof r.list != "function") return [];
      const a = String(t.prefix || ""), o = [];
      let s = "", i = 0, c = !1;
      const l = /* @__PURE__ */ new Set();
      for (; i < 1e3; ) {
        i += 1;
        const d = await wu(r, s ? {
          prefix: a,
          cursor: s
        } : { prefix: a });
        for (const f of d?.keys || []) {
          const m = String(f?.name || "").trim();
          m && o.push(m);
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
          cause: ie(a, "kv_read_failed")
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
          config: te(F(a) ? a : {}),
          rawConfig: F(a) ? a : {},
          hadMalformedValue: !F(a),
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
        const d = String(l?.key || "").trim();
        if (!d) continue;
        const u = String(l?.type || "put").trim().toLowerCase() === "delete" ? "delete" : "put";
        a.push({
          type: u,
          key: d,
          value: String(l?.value ?? "")
        }), !s.has(d) && (s.add(d), o.set(d, {
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
          const m = i[f], p = o.get(m), g = c.get(m);
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
function mg(n = {}, e = {}) {
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
      let i = 0, c = 0, l = 0, d = 0, u = 0, f = 0, m = 0, p = 0, g = 0, h = 0;
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
        removableKeys: o,
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
    async collectKvTidyNodeMutations(r, t = [], a = {}, o = []) {
      const s = [], i = [];
      let c = 0, l = 0, d = 0, u = 0, f = 0, m = 0, p = mt(a.sourceDirectNodes || []);
      const g = [];
      for (const y of t) {
        const S = `${e.PREFIX}${y}`;
        let _ = null;
        try {
          _ = await we(r, S, { type: "json" });
        } catch (E) {
          const w = /* @__PURE__ */ new Error(`KV tidy could not read node ${y}`);
          throw w.code = "KV_TIDY_NODE_READ_FAILED", w.status = 503, w.details = {
            key: S,
            nodeName: y,
            cause: ie(E, "kv_read_failed")
          }, w;
        }
        if (!F(_)) {
          const E = /* @__PURE__ */ new Error(`KV tidy found an invalid node entity: ${y}`);
          throw E.code = "KV_TIDY_NODE_INVALID", E.status = 409, E.details = {
            key: S,
            nodeName: y
          }, E;
        }
        const A = Kd(_);
        A.shouldAddToSourceDirectNodes && (p = mt([...p, y])), A.topLevelPortPresent && (d += 1), u += Number(A.linePortCount) || 0, A.defaultPortNodePresent && (f += 1), m += Number(A.defaultPortLineCount) || 0, l += A.legacyKeysPresent.length;
        const { data: b, changed: R } = e.normalizeNode(y, _, { dropLegacyDirectRouting: !0 });
        i.push({
          name: y,
          ...b
        }), R && (g.push({
          key: S,
          ...await e.readRawKvEntry(r, S)
        }), c += 1, s.push({
          name: y,
          data: b
        }));
      }
      let h = a;
      return se(h.sourceDirectNodes || []) !== se(p) && (h = te({
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
        rollbackKvEntries: [...o, ...g]
      };
    },
    rewriteKvTidySnapshots(r = []) {
      const t = [];
      let a = 0, o = 0;
      const s = [];
      for (const i of r) {
        const c = Eu(i);
        t.push(ua(c.snapshot)), c.rewritten && (a += 1), o += Number(c.deletedLegacyFieldCount) || 0, s.push(...c.migratedConfigKeys || []);
      }
      return {
        rewrittenSnapshots: t,
        rewrittenSnapshotCount: a,
        deletedLegacySnapshotFieldCount: o,
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
        const o = JSON.parse(a);
        return Array.isArray(o) ? JSON.stringify(o.map((s) => {
          if (!F(s)) return s;
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
      return ce(se({
        scope: "kv",
        scannedKeys: [...new Set(Array.isArray(r?.scannedKeys) ? r.scannedKeys : [])].sort(),
        revisions: F(r?.revisions) ? r.revisions : {},
        mutationPlan: t,
        rebuiltNodeSummaries: Array.isArray(r?.rebuiltNodeSummaries) ? r.rebuiltNodeSummaries : []
      }));
    }
  };
}
function pg(n = {}, e = {}) {
  return {
    ...dg(n, e),
    ...ug(n, e),
    ...fg(n, e),
    ...mg(n, e)
  };
}
var gg = class {
  constructor({ configReader: n, httpService: e, nodeRouteReader: r, proxyApi: t }) {
    this.configReader = n, this.httpService = e, this.nodeRouteReader = r, this.proxyApi = t;
  }
  #e(n, e, r, t = 200) {
    return this.httpService.buildCorsResponse(Ea(e, n), r, t, { mergeOriginVary: !0 });
  }
  #a(n, e) {
    const r = new URL(n.url);
    r.pathname = e + "/";
    const t = new Headers({
      Location: r.toString(),
      "Cache-Control": "no-store"
    });
    Ce(t);
    const a = n.method === "GET" || n.method === "HEAD" ? 301 : 307;
    return new Response(null, {
      status: a,
      headers: t
    });
  }
  #f(n, e) {
    const r = ee(e);
    if (!r) return null;
    const t = new URL(n.url);
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
    return this.#o(r, Ec());
  }
  async #s(n, e, r, t) {
    if (!n || n.status === 101) return n;
    const a = await Hm(r, e, t);
    return a ? this.#o(n, Km(a)) : n;
  }
  #t(n) {
    const e = n.segments;
    return e.length <= 1 ? !1 : this.httpService.isPlaybackCriticalSegments(e, 1) ? !0 : e.length <= 2 ? !1 : this.httpService.isPlaybackCriticalSegments(e, 2);
  }
  async #d(n, e, r, t) {
    if (!n.root) return null;
    const a = this.#t(n);
    let o = a ? await this.nodeRouteReader.getVerifiedPlaybackRouteHotSnapshot(n.root, e) : null;
    const s = a ? o ? "hit" : "miss" : "skip", i = o?.nodeData || await this.nodeRouteReader.getNode(n.root, e, r);
    if (!i || Je(i?.entryMode)) return null;
    const c = i.secret, l = yt(n.root, c), d = 1 + n.rootRaw.length, u = n.normalizedPathname.substring(d), f = Rs(u, n.requestUrl, l), m = f?.normalizedPath || u, p = `/${n.rootRaw}${m === "/" ? "/" : m}`, g = f ? p.split("/").filter(Boolean) : n.segments;
    let h = d;
    if (c) {
      const b = g[1] || "";
      if (Dt(b) !== c) return null;
      h += 1 + b.length;
    }
    const y = p.substring(h), S = f ? (() => {
      const b = new URL(n.requestUrl.toString());
      return b.pathname = p, b;
    })() : n.requestUrl, _ = ta(y);
    let A = _.remaining;
    return y === "" && !S.pathname.endsWith("/") || _.needsTrailingSlashRedirect === !0 ? { response: this.#a(t, p) } : (A === "" && (A = "/"), a && !o && (o = await this.nodeRouteReader.primePlaybackRouteHotSnapshot(n.root, i, e)), {
      nodeData: i,
      secret: c,
      remaining: Z(A),
      linkVariant: _.linkVariant,
      requestUrl: S,
      pathNormalizationState: f,
      playbackRouteHotSnapshot: o,
      targetHotCacheState: s,
      entryMode: "kv_route"
    });
  }
  #i(n) {
    return n ? Va(ta(n.normalizedPathname)?.remaining || "/") : !1;
  }
  async #r(n, e, r, t) {
    const a = n?.hostPrefixMatch;
    if (!a?.prefix) return null;
    const o = a.prefix, s = this.#i(n);
    let i = s ? await this.nodeRouteReader.getVerifiedPlaybackRouteHotSnapshot(o, e) : null;
    const c = s ? i ? "hit" : "miss" : "skip", l = i?.nodeData || await this.nodeRouteReader.getNode(o, e, r);
    if (!l || !Je(l?.entryMode)) return null;
    const d = ta(n.normalizedPathname);
    let u = d.remaining;
    return d.needsTrailingSlashRedirect === !0 ? { response: this.#a(t, n.normalizedPathname) } : (u === "" && (u = "/"), s && !i && (i = await this.nodeRouteReader.primePlaybackRouteHotSnapshot(o, l, e)), {
      nodeData: l,
      secret: "",
      remaining: Z(u),
      linkVariant: d.linkVariant,
      requestUrl: n.requestUrl,
      playbackRouteHotSnapshot: i,
      targetHotCacheState: c,
      entryMode: "host_prefix"
    });
  }
  #u(n) {
    const e = n?.requestHost || "", r = n?.configuredHost || "", t = n?.configuredLegacyHost || "";
    return e ? r && e === r ? !0 : !!(t && t !== r && e === t) : !1;
  }
  async #l(n, e, r, t, a = {}) {
    if (!this.#u(n) || !n?.root) return null;
    const o = n.root, s = this.#t(n);
    let i = s ? await this.nodeRouteReader.getVerifiedPlaybackRouteHotSnapshot(o, e) : null;
    const c = s ? i ? "hit" : "miss" : "skip", l = i?.nodeData || await this.nodeRouteReader.getNode(o, e, r);
    if (!l || !Je(l?.entryMode)) return null;
    const d = yt(o, "", { entryMode: "kv_route" }), u = 1 + n.rootRaw.length, f = n.normalizedPathname.substring(u), m = Rs(f, n.requestUrl, d), p = m?.normalizedPath || f, g = `/${n.rootRaw}${p === "/" ? "/" : p}`, h = g.substring(u), y = m ? (() => {
      const A = new URL(n.requestUrl.toString());
      return A.pathname = g, A;
    })() : n.requestUrl, S = ta(h);
    let _ = S.remaining;
    return h === "" && !y.pathname.endsWith("/") || S.needsTrailingSlashRedirect === !0 ? { response: this.#a(t, g) } : (_ === "" && (_ = "/"), s && !i && (i = await this.nodeRouteReader.primePlaybackRouteHotSnapshot(o, l, e)), {
      nodeData: l,
      nodeName: o,
      secret: "",
      remaining: Z(_),
      linkVariant: S.linkVariant,
      requestUrl: y,
      pathNormalizationState: m,
      playbackRouteHotSnapshot: i,
      targetHotCacheState: c,
      entryMode: "kv_route",
      routeKindOverride: a.isLegacyHostRequest === !0 ? "legacy_host_prefix_path_compat" : "host_prefix_path_compat",
      attachLegacyProxyContext: a.isLegacyHostRequest === !0
    });
  }
  async #c(n, e, r, t) {
    if (!Es(n?.normalizedPathname)) return null;
    const a = t.headers.get("Cookie") || "", o = String(Qa(a).get("legacy_proxy_ctx") || "").trim();
    if (!o) return null;
    const s = await km(o, e, { requestHost: n.requestHost });
    if (s?.ok !== !0) return { response: this.#n(t, e) };
    const i = String(s.payload?.node || "").trim().toLowerCase();
    if (!i) return { response: this.#n(t, e) };
    const c = Va(n.normalizedPathname);
    let l = c ? await this.nodeRouteReader.getVerifiedPlaybackRouteHotSnapshot(i, e) : null;
    const d = c ? l ? "hit" : "miss" : "skip", u = l?.nodeData || await this.nodeRouteReader.getNode(i, e, r);
    if (!u) return { response: this.#n(t, e) };
    const f = Je(u?.entryMode);
    return c && !l && (l = await this.nodeRouteReader.primePlaybackRouteHotSnapshot(i, u, e)), {
      nodeData: u,
      nodeName: i,
      secret: f ? "" : u.secret,
      remaining: n.normalizedPathname,
      linkVariant: "main",
      requestUrl: n.requestUrl,
      playbackRouteHotSnapshot: l,
      targetHotCacheState: d,
      entryMode: "kv_route",
      routeKindOverride: f ? "legacy_host_context_cookie_host_prefix_compat" : "legacy_host_context_cookie"
    };
  }
  async handle(n, e, r, t) {
    if (!t) throw new TypeError("NodeProxyFacade.handle requires routeContext");
    const { requestHost: a, configuredHost: o, configuredLegacyHost: s } = t, i = await this.configReader.getRuntimeConfig(e), c = !!(s && s !== o && a === s), l = i.enableHostPrefixProxy === !0 && !!o && !c;
    t.hostPrefixMatch = l ? po(a, o) : null;
    const d = !!(l && a !== o && a.endsWith(`.${o}`));
    if (t.hostPrefixMatch) {
      const m = await this.#r(t, e, r, n);
      return m?.response ? m.response : m?.nodeData ? this.proxyApi.handle(n, m.nodeData, m.remaining, t.hostPrefixMatch.prefix, m.secret, e, r, {
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
    if (d) return this.#e(n, e, "Not Found", 404);
    const u = await this.#l(t, e, r, n, { isLegacyHostRequest: c });
    if (u?.response) return u.response;
    if (u?.nodeData) {
      const m = await this.proxyApi.handle(n, u.nodeData, u.remaining, u.nodeName, u.secret, e, r, {
        requestUrl: u.requestUrl || t.requestUrl,
        linkVariant: u.linkVariant,
        pathNormalizationState: u.pathNormalizationState,
        targetHotCacheState: u.targetHotCacheState,
        cachedTargetRecords: Array.isArray(u.playbackRouteHotSnapshot?.targetRecords) ? u.playbackRouteHotSnapshot.targetRecords : null,
        nodeCacheRevision: u.playbackRouteHotSnapshot?.nodeCacheRevision || "",
        runtimeConfig: i,
        runtimeRouteContext: t,
        entryMode: u.entryMode,
        routeKindOverride: u.routeKindOverride
      });
      return u.attachLegacyProxyContext === !0 ? await this.#s(m, a, u.nodeName, e) : m;
    }
    const f = await this.#d(t, e, r, n);
    if (f?.response) return f.response;
    if (f?.nodeData) {
      const m = await this.proxyApi.handle(n, f.nodeData, f.remaining, t.root, f.secret, e, r, {
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
      return c ? await this.#s(m, a, t.root, e) : m;
    }
    if (c && Es(t.normalizedPathname)) {
      const m = await this.#c(t, e, r, n);
      if (m?.response) return m.response;
      if (m?.nodeData) {
        const p = await this.proxyApi.handle(n, m.nodeData, m.remaining, m.nodeName, m.secret, e, r, {
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
        return this.#s(p, a, m.nodeName, e);
      }
    }
    return this.#e(n, e, "Not Found", 404);
  }
};
function hg(n) {
  return Object.freeze({
    persistCloudflareDnsRecordsForHost(e) {
      return Ff({
        ...e,
        dnsHistoryRepository: n
      });
    },
    buildDnsIpWorkspaceItems(e, r, t, a = {}) {
      return fc(e, r, t, {
        ...a,
        probeRepository: n
      });
    },
    buildDnsIpPoolWorkspacePreviewItems(e, r, t, a, o = {}) {
      return Zf(e, r, t, a, {
        ...o,
        probeRepository: n
      });
    },
    tryAcquireDnsIpPoolFetchRefreshLock(e, r) {
      return nm({
        ...e,
        leaseRepository: n
      }, r);
    },
    releaseDnsIpPoolFetchRefreshLock(e, r) {
      return om({
        ...e,
        leaseRepository: n
      }, r);
    },
    runDnsIpPoolSourcesLiveRefresh(e) {
      return sm({
        ...e,
        poolRepository: n
      });
    }
  });
}
function yg(n, e) {
  const r = e.shellService, t = [
    um({
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
    cp({
      D1TidyExecutor: e.d1TidyExecutor,
      D1TidyPlanner: e.d1TidyPlanner,
      Logger: e.logger,
      buildAdminReleaseVendorManifest: r.buildAdminReleaseVendorManifest,
      normalizeAdminReleaseVendorManifestRecord: r.normalizeAdminReleaseVendorManifestRecord,
      validateAdminShellHtmlSource: r.validateAdminShellHtmlSource
    }, n),
    bp({
      CacheManager: e.cacheManager,
      persistCloudflareDnsRecordsForHost: e.dns.persistCloudflareDnsRecordsForHost
    }, n),
    Cp({
      bindingPort: n,
      schemaReadinessPort: n,
      statusPersistence: n
    }),
    eg({
      CacheManager: e.cacheManager,
      withAdminShellRuntimeStatus: r.withAdminShellRuntimeStatus
    }, n),
    og({}, n),
    pg({}, n)
  ];
  for (const a of t) for (const [o, s] of Object.entries(a)) n[o] = s;
  return n;
}
function Sg({ includeTestingSupport: n = !1 } = {}) {
  const e = { ...cg }, r = Object.freeze({ getRuntimeConfig: Ae }), t = lg({ nodeRepository: e }), a = Ap({ logRepository: e }), o = xu({
    indexRepository: e,
    statusPort: e
  });
  yg(e, {
    cacheManager: t,
    d1TidyExecutor: sg(),
    d1TidyPlanner: ig(),
    dns: hg(e),
    logger: a,
    logQueryPlanner: Rp(),
    shellService: o
  });
  const s = jp({
    cachePort: t,
    configReader: r,
    fetchPort: { fetchRequest: Ke },
    logger: a,
    nodeRepository: e
  }), i = new Zd({
    actionHandlers: e.adminActionHandlers,
    bindingService: e,
    configReader: r,
    repository: e,
    requestModel: e,
    shellService: o
  }), c = new gg({
    configReader: r,
    httpService: Object.freeze({
      buildCorsResponse: o.buildEdgeCorsResponse,
      isPlaybackCriticalSegments: o.isPlaybackCriticalSegments
    }),
    nodeRouteReader: e,
    proxyApi: s
  }), l = new lp({
    logger: a,
    service: e
  }), d = (m, p) => {
    const g = new URL(m.url), h = ee(g.hostname), y = Z(g.pathname), S = y.toLowerCase(), _ = et(p), A = _.toLowerCase(), b = cn(_), R = b.toLowerCase(), E = pi(p, {
      adminPath: _,
      loginPath: b
    }), w = y.split("/").filter(Boolean), D = w[0] || "", C = Dt(D).toLowerCase();
    return {
      initHealth: E,
      requestUrl: g,
      requestHost: h,
      configuredHost: $e(p),
      configuredLegacyHost: Hr(p),
      normalizedPathname: y,
      pathnameLower: S,
      adminPath: _,
      adminPathLower: A,
      adminLoginPath: b,
      adminLoginPathLower: R,
      segments: w,
      rootRaw: D,
      root: C
    };
  }, u = (m, p) => (p === "GET" || p === "HEAD") && m.pathnameLower === "/favicon.ico" || p === "GET" && m.normalizedPathname === "/" || fi(m.pathnameLower, m.adminPathLower) || Rr(m.pathnameLower, m.adminLoginPathLower) ? !0 : m.adminPathLower === "/admin" && m.pathnameLower === "/api/auth/login" && m.root === "api" && m.segments[1] === "auth" && m.segments[2] === "login", f = {
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
  return n === !0 && (f.testingSupport = Object.freeze({
    cacheManager: t,
    kernel: e,
    logger: a,
    shellService: o,
    buildNodeRouteContext: d,
    buildRouteCorsResponse(m, p, g, h = 200) {
      return o.buildEdgeCorsResponse(Ea(p, m), g, h, { mergeOriginVary: !0 });
    },
    isPlaybackCriticalRouteContext(m) {
      const p = Array.isArray(m?.segments) ? m.segments : [];
      return p.length <= 1 ? !1 : o.isPlaybackCriticalSegments(p, 1) ? !0 : p.length > 2 && o.isPlaybackCriticalSegments(p, 2);
    },
    isolateState: ol,
    proxyService: s.testingSupport
  })), Object.freeze(f);
}
var { workerHandler: _g } = Sg();
export {
  _g as default
};
