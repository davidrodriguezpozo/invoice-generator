import process from 'node:process';globalThis._importMeta_=globalThis._importMeta_||{url:"file:///_entry.js",env:process.env};import { hasInjectionContext, getCurrentInstance, ref, defineComponent, useSSRContext, createApp, watch, nextTick, computed, unref, reactive, mergeProps, provide, toRef, onErrorCaptured, onServerPrefetch, createVNode, resolveDynamicComponent, shallowReactive, effectScope, h, isReadonly, isRef, isShallow, isReactive, toRaw, inject, defineAsyncComponent, getCurrentScope } from 'vue';
import { k as hasProtocol, l as isScriptProtocol, h as joinURL, w as withQuery, s as sanitizeStatusCode, m as getContext, $ as $fetch, n as createHooks, c as createError$1, o as isEqual, p as stringifyParsedURL, q as stringifyQuery, t as parseQuery, v as toRouteMatcher, x as createRouter, y as defu } from '../nitro/nitro.mjs';
import { b as baseURL } from '../routes/renderer.mjs';
import { ssrRenderTeleport, ssrRenderList, ssrRenderClass, ssrInterpolate, ssrIncludeBooleanAttr, ssrLooseContain, ssrRenderAttr, ssrRenderStyle, ssrRenderAttrs, ssrLooseEqual, ssrRenderComponent, ssrRenderSuspense, ssrRenderVNode } from 'vue/server-renderer';
import { v4 } from 'uuid';
import 'node:http';
import 'node:https';
import 'node:events';
import 'node:buffer';
import 'node:fs';
import 'node:path';
import 'node:crypto';
import 'node:url';
import 'vue-bundle-renderer/runtime';
import 'unhead/server';
import 'devalue';
import 'unhead/utils';

if (!globalThis.$fetch) {
  globalThis.$fetch = $fetch.create({
    baseURL: baseURL()
  });
}
if (!("global" in globalThis)) {
  globalThis.global = globalThis;
}
const nuxtLinkDefaults = { "componentName": "NuxtLink" };
const appId = "nuxt-app";
function getNuxtAppCtx(id = appId) {
  return getContext(id, {
    asyncContext: false
  });
}
const NuxtPluginIndicator = "__nuxt_plugin";
function createNuxtApp(options) {
  let hydratingCount = 0;
  const nuxtApp = {
    _id: options.id || appId || "nuxt-app",
    _scope: effectScope(),
    provide: void 0,
    versions: {
      get nuxt() {
        return "4.1.3";
      },
      get vue() {
        return nuxtApp.vueApp.version;
      }
    },
    payload: shallowReactive({
      ...options.ssrContext?.payload || {},
      data: shallowReactive({}),
      state: reactive({}),
      once: /* @__PURE__ */ new Set(),
      _errors: shallowReactive({})
    }),
    static: {
      data: {}
    },
    runWithContext(fn) {
      if (nuxtApp._scope.active && !getCurrentScope()) {
        return nuxtApp._scope.run(() => callWithNuxt(nuxtApp, fn));
      }
      return callWithNuxt(nuxtApp, fn);
    },
    isHydrating: false,
    deferHydration() {
      if (!nuxtApp.isHydrating) {
        return () => {
        };
      }
      hydratingCount++;
      let called = false;
      return () => {
        if (called) {
          return;
        }
        called = true;
        hydratingCount--;
        if (hydratingCount === 0) {
          nuxtApp.isHydrating = false;
          return nuxtApp.callHook("app:suspense:resolve");
        }
      };
    },
    _asyncDataPromises: {},
    _asyncData: shallowReactive({}),
    _payloadRevivers: {},
    ...options
  };
  {
    nuxtApp.payload.serverRendered = true;
  }
  if (nuxtApp.ssrContext) {
    nuxtApp.payload.path = nuxtApp.ssrContext.url;
    nuxtApp.ssrContext.nuxt = nuxtApp;
    nuxtApp.ssrContext.payload = nuxtApp.payload;
    nuxtApp.ssrContext.config = {
      public: nuxtApp.ssrContext.runtimeConfig.public,
      app: nuxtApp.ssrContext.runtimeConfig.app
    };
  }
  nuxtApp.hooks = createHooks();
  nuxtApp.hook = nuxtApp.hooks.hook;
  {
    const contextCaller = async function(hooks, args) {
      for (const hook of hooks) {
        await nuxtApp.runWithContext(() => hook(...args));
      }
    };
    nuxtApp.hooks.callHook = (name, ...args) => nuxtApp.hooks.callHookWith(contextCaller, name, ...args);
  }
  nuxtApp.callHook = nuxtApp.hooks.callHook;
  nuxtApp.provide = (name, value) => {
    const $name = "$" + name;
    defineGetter(nuxtApp, $name, value);
    defineGetter(nuxtApp.vueApp.config.globalProperties, $name, value);
  };
  defineGetter(nuxtApp.vueApp, "$nuxt", nuxtApp);
  defineGetter(nuxtApp.vueApp.config.globalProperties, "$nuxt", nuxtApp);
  const runtimeConfig = options.ssrContext.runtimeConfig;
  nuxtApp.provide("config", runtimeConfig);
  return nuxtApp;
}
function registerPluginHooks(nuxtApp, plugin) {
  if (plugin.hooks) {
    nuxtApp.hooks.addHooks(plugin.hooks);
  }
}
async function applyPlugin(nuxtApp, plugin) {
  if (typeof plugin === "function") {
    const { provide: provide2 } = await nuxtApp.runWithContext(() => plugin(nuxtApp)) || {};
    if (provide2 && typeof provide2 === "object") {
      for (const key in provide2) {
        nuxtApp.provide(key, provide2[key]);
      }
    }
  }
}
async function applyPlugins(nuxtApp, plugins2) {
  const resolvedPlugins = /* @__PURE__ */ new Set();
  const unresolvedPlugins = [];
  const parallels = [];
  let error = void 0;
  let promiseDepth = 0;
  async function executePlugin(plugin) {
    const unresolvedPluginsForThisPlugin = plugin.dependsOn?.filter((name) => plugins2.some((p) => p._name === name) && !resolvedPlugins.has(name)) ?? [];
    if (unresolvedPluginsForThisPlugin.length > 0) {
      unresolvedPlugins.push([new Set(unresolvedPluginsForThisPlugin), plugin]);
    } else {
      const promise = applyPlugin(nuxtApp, plugin).then(async () => {
        if (plugin._name) {
          resolvedPlugins.add(plugin._name);
          await Promise.all(unresolvedPlugins.map(async ([dependsOn, unexecutedPlugin]) => {
            if (dependsOn.has(plugin._name)) {
              dependsOn.delete(plugin._name);
              if (dependsOn.size === 0) {
                promiseDepth++;
                await executePlugin(unexecutedPlugin);
              }
            }
          }));
        }
      }).catch((e) => {
        if (!plugin.parallel && !nuxtApp.payload.error) {
          throw e;
        }
        error ||= e;
      });
      if (plugin.parallel) {
        parallels.push(promise);
      } else {
        await promise;
      }
    }
  }
  for (const plugin of plugins2) {
    if (nuxtApp.ssrContext?.islandContext && plugin.env?.islands === false) {
      continue;
    }
    registerPluginHooks(nuxtApp, plugin);
  }
  for (const plugin of plugins2) {
    if (nuxtApp.ssrContext?.islandContext && plugin.env?.islands === false) {
      continue;
    }
    await executePlugin(plugin);
  }
  await Promise.all(parallels);
  if (promiseDepth) {
    for (let i = 0; i < promiseDepth; i++) {
      await Promise.all(parallels);
    }
  }
  if (error) {
    throw nuxtApp.payload.error || error;
  }
}
// @__NO_SIDE_EFFECTS__
function defineNuxtPlugin(plugin) {
  if (typeof plugin === "function") {
    return plugin;
  }
  const _name = plugin._name || plugin.name;
  delete plugin.name;
  return Object.assign(plugin.setup || (() => {
  }), plugin, { [NuxtPluginIndicator]: true, _name });
}
function callWithNuxt(nuxt, setup, args) {
  const fn = () => setup();
  const nuxtAppCtx = getNuxtAppCtx(nuxt._id);
  {
    return nuxt.vueApp.runWithContext(() => nuxtAppCtx.callAsync(nuxt, fn));
  }
}
function tryUseNuxtApp(id) {
  let nuxtAppInstance;
  if (hasInjectionContext()) {
    nuxtAppInstance = getCurrentInstance()?.appContext.app.$nuxt;
  }
  nuxtAppInstance ||= getNuxtAppCtx(id).tryUse();
  return nuxtAppInstance || null;
}
function useNuxtApp(id) {
  const nuxtAppInstance = tryUseNuxtApp(id);
  if (!nuxtAppInstance) {
    {
      throw new Error("[nuxt] instance unavailable");
    }
  }
  return nuxtAppInstance;
}
// @__NO_SIDE_EFFECTS__
function useRuntimeConfig(_event) {
  return useNuxtApp().$config;
}
function defineGetter(obj, key, val) {
  Object.defineProperty(obj, key, { get: () => val });
}
const PageRouteSymbol = Symbol("route");
globalThis._importMeta_.url.replace(/\/app\/.*$/, "/");
const useRouter = () => {
  return useNuxtApp()?.$router;
};
const useRoute = () => {
  if (hasInjectionContext()) {
    return inject(PageRouteSymbol, useNuxtApp()._route);
  }
  return useNuxtApp()._route;
};
// @__NO_SIDE_EFFECTS__
function defineNuxtRouteMiddleware(middleware) {
  return middleware;
}
const isProcessingMiddleware = () => {
  try {
    if (useNuxtApp()._processingMiddleware) {
      return true;
    }
  } catch {
    return false;
  }
  return false;
};
const URL_QUOTE_RE = /"/g;
const navigateTo = (to, options) => {
  to ||= "/";
  const toPath = typeof to === "string" ? to : "path" in to ? resolveRouteObject(to) : useRouter().resolve(to).href;
  const isExternalHost = hasProtocol(toPath, { acceptRelative: true });
  const isExternal = options?.external || isExternalHost;
  if (isExternal) {
    if (!options?.external) {
      throw new Error("Navigating to an external URL is not allowed by default. Use `navigateTo(url, { external: true })`.");
    }
    const { protocol } = new URL(toPath, "http://localhost");
    if (protocol && isScriptProtocol(protocol)) {
      throw new Error(`Cannot navigate to a URL with '${protocol}' protocol.`);
    }
  }
  const inMiddleware = isProcessingMiddleware();
  const router = useRouter();
  const nuxtApp = useNuxtApp();
  {
    if (nuxtApp.ssrContext) {
      const fullPath = typeof to === "string" || isExternal ? toPath : router.resolve(to).fullPath || "/";
      const location2 = isExternal ? toPath : joinURL((/* @__PURE__ */ useRuntimeConfig()).app.baseURL, fullPath);
      const redirect = async function(response) {
        await nuxtApp.callHook("app:redirected");
        const encodedLoc = location2.replace(URL_QUOTE_RE, "%22");
        const encodedHeader = encodeURL(location2, isExternalHost);
        nuxtApp.ssrContext._renderResponse = {
          statusCode: sanitizeStatusCode(options?.redirectCode || 302, 302),
          body: `<!DOCTYPE html><html><head><meta http-equiv="refresh" content="0; url=${encodedLoc}"></head></html>`,
          headers: { location: encodedHeader }
        };
        return response;
      };
      if (!isExternal && inMiddleware) {
        router.afterEach((final) => final.fullPath === fullPath ? redirect(false) : void 0);
        return to;
      }
      return redirect(!inMiddleware ? void 0 : (
        /* abort route navigation */
        false
      ));
    }
  }
  if (isExternal) {
    nuxtApp._scope.stop();
    if (options?.replace) {
      (void 0).replace(toPath);
    } else {
      (void 0).href = toPath;
    }
    if (inMiddleware) {
      if (!nuxtApp.isHydrating) {
        return false;
      }
      return new Promise(() => {
      });
    }
    return Promise.resolve();
  }
  return options?.replace ? router.replace(to) : router.push(to);
};
function resolveRouteObject(to) {
  return withQuery(to.path || "", to.query || {}) + (to.hash || "");
}
function encodeURL(location2, isExternalHost = false) {
  const url = new URL(location2, "http://localhost");
  if (!isExternalHost) {
    return url.pathname + url.search + url.hash;
  }
  if (location2.startsWith("//")) {
    return url.toString().replace(url.protocol, "");
  }
  return url.toString();
}
const NUXT_ERROR_SIGNATURE = "__nuxt_error";
const useError = /* @__NO_SIDE_EFFECTS__ */ () => toRef(useNuxtApp().payload, "error");
const showError = (error) => {
  const nuxtError = createError(error);
  try {
    const error2 = /* @__PURE__ */ useError();
    if (false) ;
    error2.value ||= nuxtError;
  } catch {
    throw nuxtError;
  }
  return nuxtError;
};
const isNuxtError = (error) => !!error && typeof error === "object" && NUXT_ERROR_SIGNATURE in error;
const createError = (error) => {
  const nuxtError = createError$1(error);
  Object.defineProperty(nuxtError, NUXT_ERROR_SIGNATURE, {
    value: true,
    configurable: false,
    writable: false
  });
  return nuxtError;
};
const unhead_k2P3m_ZDyjlr2mMYnoDPwavjsDN8hBlk9cFai0bbopU = /* @__PURE__ */ defineNuxtPlugin({
  name: "nuxt:head",
  enforce: "pre",
  setup(nuxtApp) {
    const head = nuxtApp.ssrContext.head;
    nuxtApp.vueApp.use(head);
  }
});
async function getRouteRules(arg) {
  const path = typeof arg === "string" ? arg : arg.path;
  {
    useNuxtApp().ssrContext._preloadManifest = true;
    const _routeRulesMatcher = toRouteMatcher(
      createRouter({ routes: (/* @__PURE__ */ useRuntimeConfig()).nitro.routeRules })
    );
    return defu({}, ..._routeRulesMatcher.matchAll(path).reverse());
  }
}
const manifest_45route_45rule = /* @__PURE__ */ defineNuxtRouteMiddleware(async (to) => {
  {
    return;
  }
});
const globalMiddleware = [
  manifest_45route_45rule
];
function getRouteFromPath(fullPath) {
  const route = fullPath && typeof fullPath === "object" ? fullPath : {};
  if (typeof fullPath === "object") {
    fullPath = stringifyParsedURL({
      pathname: fullPath.path || "",
      search: stringifyQuery(fullPath.query || {}),
      hash: fullPath.hash || ""
    });
  }
  const url = new URL(fullPath.toString(), "http://localhost");
  return {
    path: url.pathname,
    fullPath,
    query: parseQuery(url.search),
    hash: url.hash,
    // stub properties for compat with vue-router
    params: route.params || {},
    name: void 0,
    matched: route.matched || [],
    redirectedFrom: void 0,
    meta: route.meta || {},
    href: fullPath
  };
}
const router_DclsWNDeVV7SyG4lslgLnjbQUK1ws8wgf2FHaAbo7Cw = /* @__PURE__ */ defineNuxtPlugin({
  name: "nuxt:router",
  enforce: "pre",
  setup(nuxtApp) {
    const initialURL = nuxtApp.ssrContext.url;
    const routes = [];
    const hooks = {
      "navigate:before": [],
      "resolve:before": [],
      "navigate:after": [],
      "error": []
    };
    const registerHook = (hook, guard) => {
      hooks[hook].push(guard);
      return () => hooks[hook].splice(hooks[hook].indexOf(guard), 1);
    };
    (/* @__PURE__ */ useRuntimeConfig()).app.baseURL;
    const route = reactive(getRouteFromPath(initialURL));
    async function handleNavigation(url, replace) {
      try {
        const to = getRouteFromPath(url);
        for (const middleware of hooks["navigate:before"]) {
          const result = await middleware(to, route);
          if (result === false || result instanceof Error) {
            return;
          }
          if (typeof result === "string" && result.length) {
            return handleNavigation(result, true);
          }
        }
        for (const handler of hooks["resolve:before"]) {
          await handler(to, route);
        }
        Object.assign(route, to);
        if (false) ;
        for (const middleware of hooks["navigate:after"]) {
          await middleware(to, route);
        }
      } catch (err) {
        for (const handler of hooks.error) {
          await handler(err);
        }
      }
    }
    const currentRoute = computed(() => route);
    const router = {
      currentRoute,
      isReady: () => Promise.resolve(),
      // These options provide a similar API to vue-router but have no effect
      options: {},
      install: () => Promise.resolve(),
      // Navigation
      push: (url) => handleNavigation(url),
      replace: (url) => handleNavigation(url),
      back: () => (void 0).history.go(-1),
      go: (delta) => (void 0).history.go(delta),
      forward: () => (void 0).history.go(1),
      // Guards
      beforeResolve: (guard) => registerHook("resolve:before", guard),
      beforeEach: (guard) => registerHook("navigate:before", guard),
      afterEach: (guard) => registerHook("navigate:after", guard),
      onError: (handler) => registerHook("error", handler),
      // Routes
      resolve: getRouteFromPath,
      addRoute: (parentName, route2) => {
        routes.push(route2);
      },
      getRoutes: () => routes,
      hasRoute: (name) => routes.some((route2) => route2.name === name),
      removeRoute: (name) => {
        const index = routes.findIndex((route2) => route2.name === name);
        if (index !== -1) {
          routes.splice(index, 1);
        }
      }
    };
    nuxtApp.vueApp.component("RouterLink", defineComponent({
      functional: true,
      props: {
        to: {
          type: String,
          required: true
        },
        custom: Boolean,
        replace: Boolean,
        // Not implemented
        activeClass: String,
        exactActiveClass: String,
        ariaCurrentValue: String
      },
      setup: (props, { slots }) => {
        const navigate = () => handleNavigation(props.to, props.replace);
        return () => {
          const route2 = router.resolve(props.to);
          return props.custom ? slots.default?.({ href: props.to, navigate, route: route2 }) : h("a", { href: props.to, onClick: (e) => {
            e.preventDefault();
            return navigate();
          } }, slots);
        };
      }
    }));
    nuxtApp._route = route;
    nuxtApp._middleware ||= {
      global: [],
      named: {}
    };
    const initialLayout = nuxtApp.payload.state._layout;
    nuxtApp.hooks.hookOnce("app:created", async () => {
      router.beforeEach(async (to, from) => {
        to.meta = reactive(to.meta || {});
        if (nuxtApp.isHydrating && initialLayout && !isReadonly(to.meta.layout)) {
          to.meta.layout = initialLayout;
        }
        nuxtApp._processingMiddleware = true;
        if (!nuxtApp.ssrContext?.islandContext) {
          const middlewareEntries = /* @__PURE__ */ new Set([...globalMiddleware, ...nuxtApp._middleware.global]);
          {
            const routeRules = await nuxtApp.runWithContext(() => getRouteRules({ path: to.path }));
            if (routeRules.appMiddleware) {
              for (const key in routeRules.appMiddleware) {
                const guard = nuxtApp._middleware.named[key];
                if (!guard) {
                  return;
                }
                if (routeRules.appMiddleware[key]) {
                  middlewareEntries.add(guard);
                } else {
                  middlewareEntries.delete(guard);
                }
              }
            }
          }
          for (const middleware of middlewareEntries) {
            const result = await nuxtApp.runWithContext(() => middleware(to, from));
            {
              if (result === false || result instanceof Error) {
                const error = result || createError$1({
                  statusCode: 404,
                  statusMessage: `Page Not Found: ${initialURL}`,
                  data: {
                    path: initialURL
                  }
                });
                delete nuxtApp._processingMiddleware;
                return nuxtApp.runWithContext(() => showError(error));
              }
            }
            if (result === true) {
              continue;
            }
            if (result || result === false) {
              return result;
            }
          }
        }
      });
      router.afterEach(() => {
        delete nuxtApp._processingMiddleware;
      });
      await router.replace(initialURL);
      if (!isEqual(route.fullPath, initialURL)) {
        await nuxtApp.runWithContext(() => navigateTo(route.fullPath));
      }
    });
    return {
      provide: {
        route,
        router
      }
    };
  }
});
function definePayloadReducer(name, reduce) {
  {
    useNuxtApp().ssrContext._payloadReducers[name] = reduce;
  }
}
const reducers = [
  ["NuxtError", (data) => isNuxtError(data) && data.toJSON()],
  ["EmptyShallowRef", (data) => isRef(data) && isShallow(data) && !data.value && (typeof data.value === "bigint" ? "0n" : JSON.stringify(data.value) || "_")],
  ["EmptyRef", (data) => isRef(data) && !data.value && (typeof data.value === "bigint" ? "0n" : JSON.stringify(data.value) || "_")],
  ["ShallowRef", (data) => isRef(data) && isShallow(data) && data.value],
  ["ShallowReactive", (data) => isReactive(data) && isShallow(data) && toRaw(data)],
  ["Ref", (data) => isRef(data) && data.value],
  ["Reactive", (data) => isReactive(data) && toRaw(data)]
];
const revive_payload_server_MVtmlZaQpj6ApFmshWfUWl5PehCebzaBf2NuRMiIbms = /* @__PURE__ */ defineNuxtPlugin({
  name: "nuxt:revive-payload:server",
  setup() {
    for (const [reducer, fn] of reducers) {
      definePayloadReducer(reducer, fn);
    }
  }
});
const components_plugin_4kY4pyzJIYX99vmMAAIorFf3CnAaptHitJgf7JxiED8 = /* @__PURE__ */ defineNuxtPlugin({
  name: "nuxt:global-components"
});
const plugins = [
  unhead_k2P3m_ZDyjlr2mMYnoDPwavjsDN8hBlk9cFai0bbopU,
  router_DclsWNDeVV7SyG4lslgLnjbQUK1ws8wgf2FHaAbo7Cw,
  revive_payload_server_MVtmlZaQpj6ApFmshWfUWl5PehCebzaBf2NuRMiIbms,
  components_plugin_4kY4pyzJIYX99vmMAAIorFf3CnAaptHitJgf7JxiED8
];
const chaosEnabled = ref(false);
const chaosConfig = ref({
  intensity: "medium",
  enableTaxChaos: true,
  enableNegativeAmounts: true,
  enableTotalMismatch: true,
  enableEmojiInjection: true,
  enableDateChaos: true,
  enableInvalidEmails: true,
  enableCrazyInvoiceNumbers: true,
  enableBadScanEffect: true
});
const chaosOverrides = ref(null);
const originalInvoice = ref(null);
const EMOJIS = {
  business: ["🏢", "🏭", "🏦", "🏪", "🏬", "💼", "📊"],
  money: ["💰", "💵", "💸", "🤑", "💲", "🪙"],
  random: ["🔥", "💀", "🎉", "🚀", "⚡", "🌈", "🦄", "👻", "🤖", "🎭"],
  warning: ["⚠️", "🚨", "❌", "💥", "🆘", "☠️"]
};
const CLEAN_BUSINESS_NAMES = [
  "Totally Legit Corp",
  "Acme Inc.",
  "404 Business Not Found LLC",
  "Trust Me Bro Enterprises",
  '<script>alert("hacked")<\/script> Ltd',
  "NULL",
  "undefined",
  "DROP TABLE invoices;--",
  "Very Real Company GmbH",
  "NaN Industries",
  "Whitespace Corp"
];
const CLEAN_CUSTOMER_NAMES = [
  'John "The Invoice" Doe',
  "Jane <marquee>Smith</marquee>",
  "Customer #undefined",
  "NaN McNotANumber",
  "   (leading spaces)",
  "AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA",
  "Robert'); DROP TABLE customers;--",
  "Ghost Customer",
  "0xDEADBEEF"
];
const CLEAN_DESCRIPTIONS = [
  "Professional consulting services",
  "Widget (definitely not defective)",
  "1x Mystery Box",
  "Services rendered (trust us)",
  "Thing that does stuff",
  "Premium nothing",
  "<img src=x onerror=alert(1)>",
  "Quantum uncertainty service",
  "NEGATIVE REVENUE ADJUSTMENT",
  "HOT DEAL - DISCOUNT ITEM",
  "Invisible product (you cant see it)",
  "Refund for previous mistake",
  "Air (compressed)",
  "Unlimited consulting hours"
];
const CLEAN_ADDRESSES = [
  "123 Fake Street\nNowhere, XX 00000",
  "0x7F000001\nLocalhost, LO 127",
  "/dev/null\nVoid, -- -----",
  "42 Answer Lane\nUniverse, GA 42424",
  "1 Infinite Loop\nCupertino, CA 95014",
  "666 Hell Avenue\nHades, HE 66666",
  "P.O. Box 999999\nInfinity, IN 99999"
];
const CLEAN_PHONES = [
  "555-FAKE-NUM",
  "000-000-0000",
  "1234567890123456789",
  "call me maybe",
  "NaN-NaN-NaN",
  "555-000-0000"
];
const CLEAN_TAX_IDS = [
  "XX-XXXXXXX",
  "00-0000000",
  "FAKE-1234567",
  "NULL",
  "undefined",
  "NaN",
  "12-3456789012345678901234567890"
];
const CLEAN_INVOICE_NUMBERS = [
  "FAKE-0001",
  "-999",
  "INV#$%^&*()",
  "INV'; DROP TABLE invoices;--",
  "INV-" + "A".repeat(50),
  "INV-NaN",
  "INV--1",
  "0",
  "INV-1e999"
];
const EMOJI_BUSINESS_NAMES = [
  "Totally Legit Corp 🏢",
  "Acme 💥 Inc.",
  "DROP TABLE invoices;-- 💀",
  "Very Real Company GmbH 🦄",
  "🚀 Rocket Money LLC 🚀",
  "NaN Industries 🤖"
];
const EMOJI_CUSTOMER_NAMES = [
  'John "The Invoice" Doe 💼',
  "🤑 Money Bags McGee 💰",
  "👻 Ghost Customer 👻",
  "Jane Smith 🎭"
];
const EMOJI_DESCRIPTIONS = [
  "Professional consulting services 💼",
  "Widget (definitely not defective) 🔧",
  "1x Mystery Box 📦🎁",
  "Services rendered (trust us) 🤝",
  "Premium nothing™ 🦄",
  "Quantum uncertainty service ⚛️",
  "NEGATIVE REVENUE ADJUSTMENT 📉",
  "🔥 HOT DEAL 🔥 - DISCOUNT ITEM",
  "💀 Skull service 💀",
  "Air (compressed) 💨"
];
const EMOJI_ADDRESSES = [
  "123 Fake Street 🏠\nNowhere, XX 00000",
  "42 Answer Lane 🌌\nUniverse, GA 42424",
  "1 Infinite Loop 🔄\nCupertino, CA 95014",
  "💀 666 Hell Avenue 🔥\nHades, HE 66666",
  "🚀 Mars Colony Alpha\nOlympus Mons, MA 00001"
];
const EMOJI_PHONES = [
  "+1 (💀) 666-6666",
  "📞 ring ring 📞",
  "☎️ 555-EMOJI"
];
const EMOJI_TAX_IDS = [
  "💰-MONEY-💰",
  "🧾-TAX-ID-🧾"
];
const EMOJI_INVOICE_NUMBERS = [
  "INV-💀-666",
  "INV-∞",
  "🧾📄🧾-001",
  "🔥HOT-INVOICE🔥"
];
const randomFromArray = (arr) => arr[Math.floor(Math.random() * arr.length)];
const randomEmoji = () => {
  const allEmojis = [...EMOJIS.business, ...EMOJIS.money, ...EMOJIS.random, ...EMOJIS.warning];
  return randomFromArray(allEmojis);
};
const coinFlip = (probability = 0.5) => Math.random() < probability;
const getIntensityMultiplier = (intensity) => {
  switch (intensity) {
    case "mild":
      return 0.3;
    case "medium":
      return 0.6;
    case "extreme":
      return 0.9;
  }
};
function useChaosMode() {
  const generateChaoticTax = () => {
    const { intensity, enableTaxChaos } = chaosConfig.value;
    if (!enableTaxChaos) return Math.random() * 25;
    const multiplier = getIntensityMultiplier(intensity);
    const options = [
      () => -Math.random() * 200 * multiplier,
      // Negative tax
      () => 100 + Math.random() * 900 * multiplier,
      // Over 100%
      () => Math.PI * 100,
      // 314.159...%
      () => 1e-6,
      // Tiny tax
      () => 999.999,
      // Almost 1000%
      () => -999,
      // Very negative
      () => 69.42,
      // Meme number
      () => NaN,
      // Not a number (will display as NaN)
      () => Infinity,
      // Infinite tax
      () => 17.777777777777
      // Repeating decimal
    ];
    return coinFlip(multiplier) ? randomFromArray(options)() : Math.random() * 25;
  };
  const generateChaoticAmount = () => {
    const { intensity, enableNegativeAmounts } = chaosConfig.value;
    if (!enableNegativeAmounts) {
      return { quantity: Math.floor(Math.random() * 10) + 1, price: Math.random() * 1e3 };
    }
    const multiplier = getIntensityMultiplier(intensity);
    const quantityOptions = [
      () => -Math.floor(Math.random() * 100),
      // Negative quantity
      () => 0,
      // Zero quantity
      () => 999999999,
      // Huge quantity
      () => 0.5,
      // Half item
      () => Math.PI,
      // Pi items
      () => -1,
      // Minus one
      () => 1e-4
      // Tiny fraction
    ];
    const priceOptions = [
      () => -Math.random() * 1e3,
      // Negative price
      () => 0,
      // Free
      () => 99999999999e-2,
      // Very expensive
      () => 0.01,
      // One cent
      () => 1e-3,
      // Less than a cent
      () => -0.01,
      // Negative cent
      () => Math.E * 100,
      // Euler's number
      () => 1e-10
      // Scientific notation tiny
    ];
    return {
      quantity: coinFlip(multiplier) ? randomFromArray(quantityOptions)() : Math.floor(Math.random() * 10) + 1,
      price: coinFlip(multiplier) ? randomFromArray(priceOptions)() : Math.random() * 500
    };
  };
  const generateChaoticDates = () => {
    const { intensity, enableDateChaos } = chaosConfig.value;
    if (!enableDateChaos) {
      const today2 = /* @__PURE__ */ new Date();
      const dueDate2 = new Date(today2);
      dueDate2.setDate(dueDate2.getDate() + 30);
      return {
        date: today2.toISOString().split("T")[0],
        dueDate: dueDate2.toISOString().split("T")[0]
      };
    }
    const multiplier = getIntensityMultiplier(intensity);
    const dateOptions = [
      // Due date before invoice date
      () => {
        const invoice2 = /* @__PURE__ */ new Date("2025-06-15");
        const due = /* @__PURE__ */ new Date("2024-01-01");
        return { date: invoice2.toISOString().split("T")[0], dueDate: due.toISOString().split("T")[0] };
      },
      // Far future
      () => ({ date: "2099-12-31", dueDate: "2100-01-01" }),
      // Far past
      () => ({ date: "1900-01-01", dueDate: "1899-12-31" }),
      // Same date
      () => ({ date: "2025-01-01", dueDate: "2025-01-01" }),
      // Leap year edge case
      () => ({ date: "2024-02-29", dueDate: "2023-02-28" }),
      // Year 1
      () => ({ date: "0001-01-01", dueDate: "0001-01-02" })
    ];
    if (coinFlip(multiplier)) {
      return randomFromArray(dateOptions)();
    }
    const today = /* @__PURE__ */ new Date();
    const dueDate = new Date(today);
    dueDate.setDate(dueDate.getDate() + 30);
    return {
      date: today.toISOString().split("T")[0],
      dueDate: dueDate.toISOString().split("T")[0]
    };
  };
  const generateChaoticEmail = () => {
    const { intensity, enableInvalidEmails } = chaosConfig.value;
    if (!enableInvalidEmails) return "valid@email.com";
    const multiplier = getIntensityMultiplier(intensity);
    const options = [
      "notanemail",
      "missing@",
      "@nodomain.com",
      "double@@at.com",
      "john<script>@evil.com",
      "💀@skull.emoji",
      "spaces in email@test.com",
      'quote"in"middle@test.com',
      "a".repeat(100) + "@toolong.com",
      "null@undefined.nan",
      '"><script>alert(1)<\/script>@xss.com',
      "email\n@newline.com"
    ];
    return coinFlip(multiplier) ? randomFromArray(options) : "chaos@test.com";
  };
  const injectEmojis = (text) => {
    const { intensity, enableEmojiInjection } = chaosConfig.value;
    if (!enableEmojiInjection) return text;
    const multiplier = getIntensityMultiplier(intensity);
    const emojiCount = Math.floor(multiplier * 5) + 1;
    let result = text;
    for (let i = 0; i < emojiCount; i++) {
      const position = Math.floor(Math.random() * (result.length + 1));
      result = result.slice(0, position) + randomEmoji() + result.slice(position);
    }
    return result;
  };
  const generateChaoticItems = (count = 5) => {
    const { enableEmojiInjection } = chaosConfig.value;
    const descriptions = enableEmojiInjection ? [...CLEAN_DESCRIPTIONS, ...EMOJI_DESCRIPTIONS] : CLEAN_DESCRIPTIONS;
    const items = [];
    const actualCount = Math.max(1, count + Math.floor((Math.random() - 0.5) * 4));
    for (let i = 0; i < actualCount; i++) {
      const { quantity, price } = generateChaoticAmount();
      items.push({
        id: v4(),
        description: randomFromArray(descriptions),
        quantity,
        price,
        tax: generateChaoticTax()
      });
    }
    return items;
  };
  const generateMismatchedTotals = (items) => {
    const { enableTotalMismatch, intensity } = chaosConfig.value;
    if (!enableTotalMismatch) {
      chaosOverrides.value = null;
      return;
    }
    const multiplier = getIntensityMultiplier(intensity);
    if (!coinFlip(multiplier)) {
      chaosOverrides.value = null;
      return;
    }
    const actualSubtotal = items.reduce((sum, item) => sum + item.quantity * item.price, 0);
    const actualTax = items.reduce((sum, item) => {
      const itemSubtotal = item.quantity * item.price;
      return sum + itemSubtotal * item.tax / 100;
    }, 0);
    const wrongSubtotal = actualSubtotal * (0.5 + Math.random());
    const wrongTax = actualTax * (0.3 + Math.random() * 2);
    const wrongTotal = wrongSubtotal + wrongTax + (Math.random() - 0.5) * 1e3;
    chaosOverrides.value = {
      subtotal: wrongSubtotal,
      totalTax: wrongTax,
      total: wrongTotal
    };
  };
  const applyChaosToInvoice = (invoice2) => {
    const {
      enableEmojiInjection,
      enableCrazyInvoiceNumbers,
      enableDateChaos,
      enableInvalidEmails,
      enableTaxChaos,
      enableNegativeAmounts,
      enableTotalMismatch
    } = chaosConfig.value;
    if (!chaosEnabled.value) {
      originalInvoice.value = JSON.parse(JSON.stringify(invoice2));
    }
    const chaosInvoice = JSON.parse(JSON.stringify(invoice2));
    if (enableDateChaos) {
      const dates = generateChaoticDates();
      chaosInvoice.date = dates.date;
      chaosInvoice.dueDate = dates.dueDate;
    }
    if (enableCrazyInvoiceNumbers) {
      const invoiceNumbers = enableEmojiInjection ? [...CLEAN_INVOICE_NUMBERS, ...EMOJI_INVOICE_NUMBERS] : CLEAN_INVOICE_NUMBERS;
      chaosInvoice.number = randomFromArray(invoiceNumbers);
    }
    if (enableInvalidEmails) {
      chaosInvoice.from.email = generateChaoticEmail();
      chaosInvoice.to.email = generateChaoticEmail();
    }
    if (enableEmojiInjection) {
      if (chaosInvoice.from.businessName) {
        chaosInvoice.from.businessName = injectEmojis(chaosInvoice.from.businessName);
      }
      if (chaosInvoice.to.customerName) {
        chaosInvoice.to.customerName = injectEmojis(chaosInvoice.to.customerName);
      }
      if (chaosInvoice.notes) {
        chaosInvoice.notes = injectEmojis(chaosInvoice.notes);
      }
      if (chaosInvoice.terms) {
        chaosInvoice.terms = injectEmojis(chaosInvoice.terms);
      }
      chaosInvoice.items.forEach((item) => {
        if (item.description) {
          item.description = injectEmojis(item.description);
        }
      });
    }
    if (enableTaxChaos) {
      chaosInvoice.items.forEach((item) => {
        item.tax = generateChaoticTax();
      });
    }
    if (enableNegativeAmounts) {
      chaosInvoice.items.forEach((item) => {
        const { quantity, price } = generateChaoticAmount();
        item.quantity = quantity;
        item.price = price;
      });
    }
    if (enableTotalMismatch) {
      generateMismatchedTotals(chaosInvoice.items);
    } else {
      chaosOverrides.value = null;
    }
    chaosEnabled.value = true;
    return chaosInvoice;
  };
  const generateChaoticInvoice = () => {
    const {
      enableEmojiInjection,
      enableCrazyInvoiceNumbers
    } = chaosConfig.value;
    const businessNames = enableEmojiInjection ? [...CLEAN_BUSINESS_NAMES, ...EMOJI_BUSINESS_NAMES] : CLEAN_BUSINESS_NAMES;
    const customerNames = enableEmojiInjection ? [...CLEAN_CUSTOMER_NAMES, ...EMOJI_CUSTOMER_NAMES] : CLEAN_CUSTOMER_NAMES;
    const addresses = enableEmojiInjection ? [...CLEAN_ADDRESSES, ...EMOJI_ADDRESSES] : CLEAN_ADDRESSES;
    const phones = enableEmojiInjection ? [...CLEAN_PHONES, ...EMOJI_PHONES] : CLEAN_PHONES;
    const taxIds = enableEmojiInjection ? [...CLEAN_TAX_IDS, ...EMOJI_TAX_IDS] : CLEAN_TAX_IDS;
    const invoiceNumbers = enableEmojiInjection ? [...CLEAN_INVOICE_NUMBERS, ...EMOJI_INVOICE_NUMBERS] : CLEAN_INVOICE_NUMBERS;
    const dates = generateChaoticDates();
    const items = generateChaoticItems();
    generateMismatchedTotals(items);
    const invoice2 = {
      number: enableCrazyInvoiceNumbers ? randomFromArray(invoiceNumbers) : `INV-${Math.floor(Math.random() * 1e4)}`,
      date: dates.date,
      dueDate: dates.dueDate,
      logo: null,
      from: {
        businessName: randomFromArray(businessNames),
        taxId: randomFromArray(taxIds),
        address: randomFromArray(addresses),
        email: generateChaoticEmail(),
        phone: randomFromArray(phones)
      },
      to: {
        customerName: randomFromArray(customerNames),
        taxId: randomFromArray(taxIds),
        address: randomFromArray(addresses),
        email: generateChaoticEmail(),
        phone: randomFromArray(phones)
      },
      items,
      notes: injectEmojis("Payment is due upon receipt. Thank you for your business!"),
      terms: injectEmojis("Net 30. Late fees may apply. Or not. Who knows? Not financial advice.")
    };
    chaosEnabled.value = true;
    return invoice2;
  };
  const resetChaosMode = () => {
    chaosEnabled.value = false;
    chaosOverrides.value = null;
    const original = originalInvoice.value;
    originalInvoice.value = null;
    return original;
  };
  const setIntensity = (intensity) => {
    chaosConfig.value.intensity = intensity;
  };
  const toggleFeature = (feature, value) => {
    chaosConfig.value[feature] = value;
  };
  return {
    // State
    chaosEnabled,
    chaosConfig,
    chaosOverrides,
    // Methods
    applyChaosToInvoice,
    generateChaoticInvoice,
    resetChaosMode,
    setIntensity,
    toggleFeature,
    // Individual generators (for testing/customization)
    generateChaoticTax,
    generateChaoticAmount,
    generateChaoticDates,
    generateChaoticEmail,
    injectEmojis,
    generateChaoticItems
  };
}
const _sfc_main$4 = /* @__PURE__ */ defineComponent({
  __name: "ChaosConfigModal",
  __ssrInlineRender: true,
  props: {
    isOpen: { type: Boolean }
  },
  emits: ["close", "apply"],
  setup(__props) {
    const props = __props;
    const { chaosConfig: chaosConfig2 } = useChaosMode();
    const scrollContainer = ref(null);
    const canScrollDown = ref(false);
    const updateScrollState = () => {
      if (scrollContainer.value) {
        const { scrollTop, scrollHeight, clientHeight } = scrollContainer.value;
        canScrollDown.value = scrollTop + clientHeight < scrollHeight - 10;
      }
    };
    watch(() => props.isOpen, async (isOpen) => {
      if (isOpen) {
        await nextTick();
        updateScrollState();
      }
    });
    const intensityLevels = [
      { value: "mild", label: "Mild" },
      { value: "medium", label: "Medium" },
      { value: "extreme", label: "Extreme" }
    ];
    const features = [
      { key: "enableTaxChaos", label: "Crazy Taxes", description: "Negative, >100%, weird decimals" },
      { key: "enableNegativeAmounts", label: "Negative Amounts", description: "Negative quantities and prices" },
      { key: "enableTotalMismatch", label: "Mismatched Totals", description: "Totals that don't add up" },
      { key: "enableEmojiInjection", label: "Emoji Injection", description: "Random emojis everywhere" },
      { key: "enableDateChaos", label: "Date Chaos", description: "Due dates before invoice dates" },
      { key: "enableInvalidEmails", label: "Invalid Emails", description: "Broken email formats" },
      { key: "enableCrazyInvoiceNumbers", label: "Crazy Invoice Numbers", description: "SQL injection, special chars" },
      { key: "enableBadScanEffect", label: "Bad Scan Effect", description: "Randomized gradient overlay on PDF" }
    ];
    const allSelected = computed(() => features.every((f) => chaosConfig2.value[f.key]));
    return (_ctx, _push, _parent, _attrs) => {
      ssrRenderTeleport(_push, (_push2) => {
        if (__props.isOpen) {
          _push2(`<div class="fixed inset-0 bg-black/20 z-50 flex items-center justify-center" data-v-a24f1625><div class="bg-white shadow-xl w-96" data-v-a24f1625><div class="p-4 border-b border-stone-200 flex items-center justify-between" data-v-a24f1625><span class="text-sm font-medium" data-v-a24f1625>Chaos Mode</span><button class="text-stone-400 hover:text-stone-600" data-v-a24f1625><svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" data-v-a24f1625><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M6 18L18 6M6 6l12 12" data-v-a24f1625></path></svg></button></div><div class="p-4 border-b border-stone-100" data-v-a24f1625><div class="text-[10px] uppercase tracking-wider text-stone-400 mb-3" data-v-a24f1625>Intensity</div><div class="flex gap-1" data-v-a24f1625><!--[-->`);
          ssrRenderList(intensityLevels, (level) => {
            _push2(`<button class="${ssrRenderClass([
              "flex-1 py-2 text-xs font-medium transition-colors",
              unref(chaosConfig2).intensity === level.value ? "bg-stone-900 text-white" : "text-stone-500 hover:bg-stone-100"
            ])}" data-v-a24f1625>${ssrInterpolate(level.label)}</button>`);
          });
          _push2(`<!--]--></div></div><div class="px-4 pt-3 pb-1 flex items-center justify-between" data-v-a24f1625><div class="text-[10px] uppercase tracking-wider text-stone-400" data-v-a24f1625>Features</div><button class="text-[10px] text-stone-400 hover:text-stone-600 transition-colors" data-v-a24f1625>${ssrInterpolate(allSelected.value ? "Deselect all" : "Select all")}</button></div><div class="relative" data-v-a24f1625><div class="px-2 pb-2 max-h-96 overflow-y-auto" data-v-a24f1625><!--[-->`);
          ssrRenderList(features, (feature) => {
            _push2(`<label class="flex items-center gap-3 px-2 py-2 hover:bg-stone-50 cursor-pointer transition-colors" data-v-a24f1625><input type="checkbox"${ssrIncludeBooleanAttr(Array.isArray(unref(chaosConfig2)[feature.key]) ? ssrLooseContain(unref(chaosConfig2)[feature.key], null) : unref(chaosConfig2)[feature.key]) ? " checked" : ""} class="w-4 h-4 border-stone-300 text-stone-900 focus:ring-stone-500 focus:ring-offset-0" data-v-a24f1625><div class="flex-1 min-w-0" data-v-a24f1625><span class="text-sm text-stone-700 block" data-v-a24f1625>${ssrInterpolate(feature.label)}</span><span class="text-[10px] text-stone-400 block truncate" data-v-a24f1625>${ssrInterpolate(feature.description)}</span></div></label>`);
          });
          _push2(`<!--]--></div>`);
          if (canScrollDown.value) {
            _push2(`<div class="absolute bottom-0 left-0 right-0 h-8 bg-gradient-to-t from-white to-transparent pointer-events-none" data-v-a24f1625></div>`);
          } else {
            _push2(`<!---->`);
          }
          _push2(`</div><div class="p-3 border-t border-stone-100 flex gap-2" data-v-a24f1625><button class="flex-1 py-2 text-xs font-medium text-stone-500 hover:text-stone-700 hover:bg-stone-50 transition-colors" data-v-a24f1625> Cancel </button><button class="flex-1 py-2 text-xs font-medium bg-stone-900 text-white hover:bg-stone-800 transition-colors" data-v-a24f1625> Unleash Chaos </button></div></div></div>`);
        } else {
          _push2(`<!---->`);
        }
      }, "body", false, _parent);
    };
  }
});
const _export_sfc = (sfc, props) => {
  const target = sfc.__vccOpts || sfc;
  for (const [key, val] of props) {
    target[key] = val;
  }
  return target;
};
const _sfc_setup$4 = _sfc_main$4.setup;
_sfc_main$4.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("components/ChaosConfigModal.vue");
  return _sfc_setup$4 ? _sfc_setup$4(props, ctx) : void 0;
};
const ChaosConfigModal = /* @__PURE__ */ Object.assign(_export_sfc(_sfc_main$4, [["__scopeId", "data-v-a24f1625"]]), { __name: "ChaosConfigModal" });
const PDF_THEME = {
  id: "professional",
  name: "Professional",
  description: "Clean and corporate",
  primary: "#1e40af",
  accent: "#6b7280",
  text: "#374151",
  background: "#ffffff"
};
const getDefaultInvoice = (defaultLogo = null) => ({
  number: "",
  date: (/* @__PURE__ */ new Date()).toISOString().split("T")[0],
  dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1e3).toISOString().split("T")[0],
  logo: defaultLogo,
  from: {
    businessName: "",
    taxId: "",
    address: "",
    email: "",
    phone: ""
  },
  to: {
    customerName: "",
    taxId: "",
    address: "",
    email: "",
    phone: ""
  },
  items: [],
  notes: "",
  terms: ""
});
const invoice = ref(getDefaultInvoice());
const invoiceHistory = ref([]);
const customers = ref([]);
const currency = ref("$");
const language = ref("EN");
const hasCompletedOnboarding = ref(false);
const isInitialized = ref(false);
function useInvoice() {
  const saveInvoiceHistory = (invoices) => {
    return;
  };
  const loadInvoiceHistory = () => {
    return [];
  };
  const saveCustomersToStorage = (customerList) => {
    return;
  };
  const loadCustomersFromStorage = () => {
    return [];
  };
  const loadDefaultLogo = () => {
    return null;
  };
  const loadLanguage = () => {
    return "EN";
  };
  const loadOnboardingStatus = () => {
    return false;
  };
  const initialize = () => {
    if (isInitialized.value) return;
    const defaultLogo = loadDefaultLogo();
    {
      invoice.value = getDefaultInvoice(defaultLogo);
    }
    invoiceHistory.value = loadInvoiceHistory();
    customers.value = loadCustomersFromStorage();
    language.value = loadLanguage();
    hasCompletedOnboarding.value = loadOnboardingStatus();
    isInitialized.value = true;
  };
  const { chaosOverrides: chaosOverrides2, generateChaoticInvoice, resetChaosMode, chaosEnabled: chaosEnabled2 } = useChaosMode();
  const subtotal = computed(() => {
    if (chaosOverrides2.value?.subtotal !== void 0) {
      return chaosOverrides2.value.subtotal;
    }
    return invoice.value.items.reduce((sum, item) => sum + item.quantity * item.price, 0);
  });
  const totalTax = computed(() => {
    if (chaosOverrides2.value?.totalTax !== void 0) {
      return chaosOverrides2.value.totalTax;
    }
    return invoice.value.items.reduce((sum, item) => {
      const itemSubtotal = item.quantity * item.price;
      return sum + itemSubtotal * item.tax / 100;
    }, 0);
  });
  const total = computed(() => {
    if (chaosOverrides2.value?.total !== void 0) {
      return chaosOverrides2.value.total;
    }
    return subtotal.value + totalTax.value;
  });
  const canDownload = computed(() => {
    return invoice.value.number?.trim() && invoice.value.from.businessName?.trim() && invoice.value.to.customerName?.trim();
  });
  const validationErrors = computed(() => {
    const errors = {};
    if (!invoice.value.number?.trim()) {
      errors.invoiceNumber = "Invoice number is required";
    }
    if (!invoice.value.from.businessName?.trim()) {
      errors.businessName = "Business name is required";
    }
    if (!invoice.value.to.customerName?.trim()) {
      errors.customerName = "Customer name is required";
    }
    return errors;
  });
  const hasValidationErrors = computed(() => Object.keys(validationErrors.value).length > 0);
  const itemTotal = (item) => {
    const subtotal2 = item.quantity * item.price;
    const taxAmount = subtotal2 * item.tax / 100;
    return subtotal2 + taxAmount;
  };
  const addItem = () => {
    invoice.value.items.push({
      id: v4(),
      description: "",
      quantity: 1,
      price: 0,
      tax: 0
    });
  };
  const removeItem = (index) => {
    invoice.value.items.splice(index, 1);
  };
  const duplicateItem = (index) => {
    const item = invoice.value.items[index];
    const newItem = { ...item, id: v4() };
    invoice.value.items.splice(index + 1, 0, newItem);
  };
  const reorderItems = (fromIndex, toIndex) => {
    const items = [...invoice.value.items];
    const [removed] = items.splice(fromIndex, 1);
    items.splice(toIndex, 0, removed);
    invoice.value.items = items;
  };
  const saveCurrentInvoice = () => {
    if (!canDownload.value) return false;
    const savedInvoice = {
      id: v4(),
      invoice: JSON.parse(JSON.stringify(invoice.value)),
      savedAt: (/* @__PURE__ */ new Date()).toISOString(),
      totalAmount: total.value,
      customerName: invoice.value.to.customerName || "Unknown Customer"
    };
    invoiceHistory.value.unshift(savedInvoice);
    saveInvoiceHistory(invoiceHistory.value);
    return true;
  };
  const loadInvoice = (savedInvoice) => {
    invoice.value = JSON.parse(JSON.stringify(savedInvoice.invoice));
  };
  const deleteInvoiceFromHistory = (id) => {
    invoiceHistory.value = invoiceHistory.value.filter((inv) => inv.id !== id);
    saveInvoiceHistory(invoiceHistory.value);
  };
  const duplicateInvoice = (savedInvoice) => {
    const duplicated = JSON.parse(JSON.stringify(savedInvoice.invoice));
    duplicated.number = `${duplicated.number}-COPY`;
    duplicated.date = (/* @__PURE__ */ new Date()).toISOString().split("T")[0];
    duplicated.dueDate = new Date(Date.now() + 30 * 24 * 60 * 60 * 1e3).toISOString().split("T")[0];
    invoice.value = duplicated;
  };
  const clearInvoice = () => {
    invoice.value = getDefaultInvoice(loadDefaultLogo());
    resetChaosMode();
  };
  const applyChaosMode = () => {
    const chaoticInvoice = generateChaoticInvoice();
    const currentLogo = invoice.value.logo;
    invoice.value = chaoticInvoice;
    if (currentLogo) {
      invoice.value.logo = currentLogo;
    }
  };
  const saveCurrentCustomer = () => {
    const customerData = invoice.value.to;
    if (!customerData.customerName.trim()) return false;
    const existingCustomer = customers.value.find(
      (c) => c.customerName.toLowerCase() === customerData.customerName.toLowerCase() || c.email && customerData.email && c.email.toLowerCase() === customerData.email.toLowerCase()
    );
    if (existingCustomer) {
      existingCustomer.customerName = customerData.customerName;
      existingCustomer.taxId = customerData.taxId;
      existingCustomer.address = customerData.address;
      existingCustomer.email = customerData.email;
      existingCustomer.phone = customerData.phone;
      existingCustomer.lastUsed = (/* @__PURE__ */ new Date()).toISOString();
    } else {
      const newCustomer = {
        id: v4(),
        customerName: customerData.customerName,
        taxId: customerData.taxId,
        address: customerData.address,
        email: customerData.email,
        phone: customerData.phone,
        createdAt: (/* @__PURE__ */ new Date()).toISOString(),
        lastUsed: (/* @__PURE__ */ new Date()).toISOString()
      };
      customers.value.unshift(newCustomer);
    }
    saveCustomersToStorage(customers.value);
    return true;
  };
  const selectCustomer = (customer) => {
    invoice.value.to = {
      customerName: customer.customerName,
      taxId: customer.taxId,
      address: customer.address,
      email: customer.email,
      phone: customer.phone
    };
    customer.lastUsed = (/* @__PURE__ */ new Date()).toISOString();
    saveCustomersToStorage(customers.value);
  };
  const deleteCustomer = (id) => {
    customers.value = customers.value.filter((c) => c.id !== id);
    saveCustomersToStorage(customers.value);
  };
  const filteredCustomers = (searchQuery) => {
    const searchTerm = searchQuery.trim().toLowerCase();
    const sorted = [...customers.value].sort(
      (a, b) => new Date(b.lastUsed).getTime() - new Date(a.lastUsed).getTime()
    );
    if (!searchTerm) return sorted;
    return sorted.filter(
      (customer) => customer.customerName.toLowerCase().includes(searchTerm) || customer.email.toLowerCase().includes(searchTerm) || customer.taxId.toLowerCase().includes(searchTerm)
    );
  };
  const setLogo = (logo) => {
    invoice.value.logo = logo;
  };
  const removeLogo = () => {
    invoice.value.logo = null;
  };
  const setLanguage = (lang) => {
    language.value = lang;
  };
  const completeOnboarding = () => {
    hasCompletedOnboarding.value = true;
  };
  const resetOnboarding = () => {
    hasCompletedOnboarding.value = false;
  };
  watch(
    invoice,
    (newInvoice) => {
      if (isInitialized.value) ;
    },
    { deep: true }
  );
  const formatDate = (dateString) => {
    if (!dateString) return "—";
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit"
    });
  };
  const setDueDateFromInvoiceDate = (days = 30) => {
    if (invoice.value.date) {
      const invoiceDate = new Date(invoice.value.date);
      invoiceDate.setDate(invoiceDate.getDate() + days);
      invoice.value.dueDate = invoiceDate.toISOString().split("T")[0];
    }
  };
  return {
    // State
    invoice,
    invoiceHistory,
    customers,
    currency,
    language,
    hasCompletedOnboarding,
    isInitialized,
    // Computed
    subtotal,
    totalTax,
    total,
    canDownload,
    validationErrors,
    hasValidationErrors,
    // Methods
    initialize,
    itemTotal,
    addItem,
    removeItem,
    duplicateItem,
    reorderItems,
    saveCurrentInvoice,
    loadInvoice,
    deleteInvoiceFromHistory,
    duplicateInvoice,
    clearInvoice,
    saveCurrentCustomer,
    selectCustomer,
    deleteCustomer,
    filteredCustomers,
    setLogo,
    removeLogo,
    setLanguage,
    completeOnboarding,
    resetOnboarding,
    formatDate,
    setDueDateFromInvoiceDate,
    loadDefaultLogo,
    // Chaos Mode
    chaosEnabled: chaosEnabled2,
    chaosOverrides: chaosOverrides2,
    applyChaosMode,
    resetChaosMode,
    // Constants
    PDF_THEME
  };
}
const isGenerating = ref(false);
const progress = ref({ current: 0, total: 0 });
function useBulkGeneration() {
  const { generateChaoticInvoice } = useChaosMode();
  const { invoiceHistory: invoiceHistory2 } = useInvoice();
  const HISTORY_KEY = "invoice-generator-history";
  const randomDateInRange = (start, end) => {
    const startTime = new Date(start).getTime();
    const endTime = new Date(end).getTime();
    const randomTime = startTime + Math.random() * (endTime - startTime);
    return new Date(randomTime).toISOString().split("T")[0];
  };
  const addDays = (dateStr, days) => {
    const date = new Date(dateStr);
    date.setDate(date.getDate() + days);
    return date.toISOString().split("T")[0];
  };
  const calculateTotal = (invoice2) => {
    return invoice2.items.reduce((sum, item) => {
      const itemSubtotal = item.quantity * item.price;
      const itemTax = itemSubtotal * (item.tax / 100);
      return sum + itemSubtotal + itemTax;
    }, 0);
  };
  const generateBulkInvoices = async (options) => {
    isGenerating.value = true;
    progress.value = { current: 0, total: options.count };
    const invoices = [];
    try {
      for (let i = 0; i < options.count; i++) {
        const invoice2 = generateChaoticInvoice();
        invoice2.number = `${options.prefix}${String(i + 1).padStart(3, "0")}`;
        if (options.useDateRange && options.startDate && options.endDate) {
          invoice2.date = randomDateInRange(options.startDate, options.endDate);
          invoice2.dueDate = addDays(invoice2.date, 30);
        }
        const savedInvoice = {
          id: v4(),
          invoice: invoice2,
          savedAt: (/* @__PURE__ */ new Date()).toISOString(),
          totalAmount: calculateTotal(invoice2),
          customerName: invoice2.to.customerName
        };
        invoices.push(savedInvoice);
        progress.value.current = i + 1;
        if (i % 10 === 0) {
          await new Promise((resolve) => setTimeout(resolve, 0));
        }
      }
      invoiceHistory2.value = [...invoices, ...invoiceHistory2.value];
      localStorage.setItem(HISTORY_KEY, JSON.stringify(invoiceHistory2.value));
      return invoices;
    } finally {
      isGenerating.value = false;
      progress.value = { current: 0, total: 0 };
    }
  };
  return {
    // State
    isGenerating,
    progress,
    // Methods
    generateBulkInvoices
  };
}
const _sfc_main$3 = /* @__PURE__ */ defineComponent({
  __name: "BulkGenerateModal",
  __ssrInlineRender: true,
  props: {
    isOpen: { type: Boolean }
  },
  emits: ["close", "generated"],
  setup(__props, { emit: __emit }) {
    const { isGenerating: isGenerating2, progress: progress2 } = useBulkGeneration();
    const countOptions = [5, 10, 25, 50, 100];
    const today = /* @__PURE__ */ new Date();
    const sixMonthsAgo = new Date(today);
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
    const options = reactive({
      count: 10,
      prefix: "TEST-",
      useDateRange: false,
      startDate: sixMonthsAgo.toISOString().split("T")[0],
      endDate: today.toISOString().split("T")[0]
    });
    return (_ctx, _push, _parent, _attrs) => {
      ssrRenderTeleport(_push, (_push2) => {
        if (__props.isOpen) {
          _push2(`<div class="fixed inset-0 bg-black/20 z-50 flex items-center justify-center" data-v-ed927912><div class="bg-white shadow-xl w-96" data-v-ed927912><div class="p-4 border-b border-stone-200 flex items-center justify-between" data-v-ed927912><span class="text-sm font-medium" data-v-ed927912>Bulk Generate</span><button class="text-stone-400 hover:text-stone-600" data-v-ed927912><svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" data-v-ed927912><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M6 18L18 6M6 6l12 12" data-v-ed927912></path></svg></button></div><div class="p-4 space-y-4" data-v-ed927912><div data-v-ed927912><div class="text-[10px] uppercase tracking-wider text-stone-400 mb-2" data-v-ed927912>Number of Invoices</div><div class="flex gap-1" data-v-ed927912><!--[-->`);
          ssrRenderList(countOptions, (count) => {
            _push2(`<button class="${ssrRenderClass([
              "flex-1 py-2 text-sm font-medium transition-colors",
              options.count === count ? "bg-stone-900 text-white" : "text-stone-500 hover:bg-stone-100"
            ])}" data-v-ed927912>${ssrInterpolate(count)}</button>`);
          });
          _push2(`<!--]--></div></div><div data-v-ed927912><div class="text-[10px] uppercase tracking-wider text-stone-400 mb-2" data-v-ed927912>Invoice Number Prefix</div><input${ssrRenderAttr("value", options.prefix)} type="text" placeholder="TEST-" class="w-full text-sm text-stone-900 placeholder-stone-300 border border-stone-200 focus:border-stone-900 focus:ring-0 px-3 py-2" data-v-ed927912><div class="text-[10px] text-stone-400 mt-1" data-v-ed927912> Preview: ${ssrInterpolate(options.prefix)}001, ${ssrInterpolate(options.prefix)}002, ... </div></div><div data-v-ed927912><label class="flex items-center gap-2 cursor-pointer" data-v-ed927912><input type="checkbox"${ssrIncludeBooleanAttr(Array.isArray(options.useDateRange) ? ssrLooseContain(options.useDateRange, null) : options.useDateRange) ? " checked" : ""} class="w-4 h-4 border-stone-300 text-stone-900 focus:ring-stone-500" data-v-ed927912><span class="text-sm text-stone-700" data-v-ed927912>Spread across date range</span></label>`);
          if (options.useDateRange) {
            _push2(`<div class="mt-3 grid grid-cols-2 gap-3" data-v-ed927912><div data-v-ed927912><label class="block text-[10px] uppercase tracking-wider text-stone-400 mb-1" data-v-ed927912>Start Date</label><input${ssrRenderAttr("value", options.startDate)} type="date" class="w-full text-sm text-stone-900 border border-stone-200 focus:border-stone-900 focus:ring-0 px-2 py-1.5" data-v-ed927912></div><div data-v-ed927912><label class="block text-[10px] uppercase tracking-wider text-stone-400 mb-1" data-v-ed927912>End Date</label><input${ssrRenderAttr("value", options.endDate)} type="date" class="w-full text-sm text-stone-900 border border-stone-200 focus:border-stone-900 focus:ring-0 px-2 py-1.5" data-v-ed927912></div></div>`);
          } else {
            _push2(`<!---->`);
          }
          _push2(`</div><div class="bg-stone-50 p-3 text-xs text-stone-500" data-v-ed927912><div class="flex items-start gap-2" data-v-ed927912><svg class="w-4 h-4 text-stone-400 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" data-v-ed927912><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z" data-v-ed927912></path></svg><span data-v-ed927912>Uses current Chaos Mode settings. Configure chaos features before generating.</span></div></div></div>`);
          if (unref(isGenerating2)) {
            _push2(`<div class="px-4 pb-4" data-v-ed927912><div class="bg-stone-100 h-2 rounded-full overflow-hidden" data-v-ed927912><div class="bg-stone-900 h-full transition-all duration-150" style="${ssrRenderStyle({ width: `${unref(progress2).current / unref(progress2).total * 100}%` })}" data-v-ed927912></div></div><div class="text-xs text-stone-500 mt-1 text-center" data-v-ed927912> Generating ${ssrInterpolate(unref(progress2).current)} of ${ssrInterpolate(unref(progress2).total)}... </div></div>`);
          } else {
            _push2(`<!---->`);
          }
          _push2(`<div class="p-3 border-t border-stone-100 flex gap-2" data-v-ed927912><button${ssrIncludeBooleanAttr(unref(isGenerating2)) ? " disabled" : ""} class="flex-1 py-2 text-xs font-medium text-stone-500 hover:text-stone-700 hover:bg-stone-50 transition-colors disabled:opacity-50" data-v-ed927912> Cancel </button><button${ssrIncludeBooleanAttr(unref(isGenerating2) || !options.prefix) ? " disabled" : ""} class="flex-1 py-2 text-xs font-medium bg-stone-900 text-white hover:bg-stone-800 transition-colors disabled:opacity-50 flex items-center justify-center gap-2" data-v-ed927912>`);
          if (unref(isGenerating2)) {
            _push2(`<svg class="animate-spin w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" data-v-ed927912><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" data-v-ed927912></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" data-v-ed927912></path></svg>`);
          } else {
            _push2(`<!---->`);
          }
          _push2(` ${ssrInterpolate(unref(isGenerating2) ? "Generating..." : `Generate ${options.count} Invoices`)}</button></div></div></div>`);
        } else {
          _push2(`<!---->`);
        }
      }, "body", false, _parent);
    };
  }
});
const _sfc_setup$3 = _sfc_main$3.setup;
_sfc_main$3.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("components/BulkGenerateModal.vue");
  return _sfc_setup$3 ? _sfc_setup$3(props, ctx) : void 0;
};
const BulkGenerateModal = /* @__PURE__ */ Object.assign(_export_sfc(_sfc_main$3, [["__scopeId", "data-v-ed927912"]]), { __name: "BulkGenerateModal" });
const STORAGE_KEY = "invoice-generator-data";
const _sfc_main$2 = /* @__PURE__ */ defineComponent({
  __name: "app",
  __ssrInlineRender: true,
  setup(__props) {
    const { chaosEnabled: chaosEnabled2, applyChaosToInvoice, chaosOverrides: chaosOverrides2, chaosConfig: chaosConfig2 } = useChaosMode();
    const { invoiceHistory: invoiceHistory2 } = useInvoice();
    const invoice2 = ref({
      number: "",
      date: (/* @__PURE__ */ new Date()).toISOString().split("T")[0],
      dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1e3).toISOString().split("T")[0],
      logo: null,
      from: { businessName: "", taxId: "", address: "", email: "", phone: "" },
      to: { customerName: "", taxId: "", address: "", email: "", phone: "" },
      items: [],
      notes: "",
      terms: ""
    });
    const customers2 = ref([]);
    const currency2 = ref("$");
    const language2 = ref("EN");
    const translations = {
      EN: {
        invoice: "INVOICE",
        from: "FROM",
        to: "TO",
        description: "DESCRIPTION",
        qty: "QTY",
        price: "PRICE",
        total: "TOTAL",
        subtotal: "Subtotal",
        tax: "Tax",
        notes: "NOTES",
        paymentTerms: "PAYMENT TERMS",
        taxId: "Tax ID",
        date: "Date",
        due: "Due",
        noItems: "No items",
        generatedWith: "Generated with",
        by: "by"
      },
      ES: {
        invoice: "FACTURA",
        from: "DE",
        to: "PARA",
        description: "DESCRIPCIÓN",
        qty: "CANT",
        price: "PRECIO",
        total: "TOTAL",
        subtotal: "Subtotal",
        tax: "Impuesto",
        notes: "NOTAS",
        paymentTerms: "CONDICIONES DE PAGO",
        taxId: "NIF/CIF",
        date: "Fecha",
        due: "Vencimiento",
        noItems: "Sin artículos",
        generatedWith: "Generado con",
        by: "por"
      },
      FR: {
        invoice: "FACTURE",
        from: "DE",
        to: "À",
        description: "DESCRIPTION",
        qty: "QTÉ",
        price: "PRIX",
        total: "TOTAL",
        subtotal: "Sous-total",
        tax: "TVA",
        notes: "NOTES",
        paymentTerms: "CONDITIONS DE PAIEMENT",
        taxId: "N° TVA",
        date: "Date",
        due: "Échéance",
        noItems: "Aucun article",
        generatedWith: "Généré avec",
        by: "par"
      },
      DE: {
        invoice: "RECHNUNG",
        from: "VON",
        to: "AN",
        description: "BESCHREIBUNG",
        qty: "MENGE",
        price: "PREIS",
        total: "GESAMT",
        subtotal: "Zwischensumme",
        tax: "MwSt",
        notes: "ANMERKUNGEN",
        paymentTerms: "ZAHLUNGSBEDINGUNGEN",
        taxId: "USt-IdNr",
        date: "Datum",
        due: "Fällig",
        noItems: "Keine Artikel",
        generatedWith: "Erstellt mit",
        by: "von"
      }
    };
    const t = (key) => translations[language2.value]?.[key] || translations.EN[key] || key;
    const showHistory = ref(false);
    const showExport = ref(false);
    const showChaos = ref(false);
    const showExportAllMenu = ref(false);
    const showBulkGenerate = ref(false);
    const isExporting = ref(false);
    const exportingFormat = ref(null);
    const justSaved = ref(false);
    const justExported = ref(false);
    const showCustomerDropdown = ref(false);
    const touchedFields = ref({});
    const fieldErrors = computed(() => ({
      invoiceNumber: touchedFields.value.invoiceNumber && !invoice2.value.number?.trim(),
      businessName: touchedFields.value.businessName && !invoice2.value.from.businessName?.trim(),
      customerName: touchedFields.value.customerName && !invoice2.value.to.customerName?.trim()
    }));
    const mobileView = ref("form");
    const toasts = ref([]);
    const pdfPreviewUrl = ref(null);
    const isGeneratingPreview = ref(false);
    ref(false);
    ref(null);
    const watermarkLogo = ref(null);
    const subtotal = computed(() => {
      if (chaosOverrides2.value?.subtotal !== void 0) {
        return chaosOverrides2.value.subtotal;
      }
      return invoice2.value.items.reduce((sum, item) => sum + item.quantity * item.price, 0);
    });
    const totalTax = computed(() => {
      if (chaosOverrides2.value?.totalTax !== void 0) {
        return chaosOverrides2.value.totalTax;
      }
      return invoice2.value.items.reduce((sum, item) => sum + item.quantity * item.price * item.tax / 100, 0);
    });
    const total = computed(() => {
      if (chaosOverrides2.value?.total !== void 0) {
        return chaosOverrides2.value.total;
      }
      return subtotal.value + totalTax.value;
    });
    const canDownload = computed(() => invoice2.value.number?.trim() && invoice2.value.from.businessName?.trim() && invoice2.value.to.customerName?.trim());
    const showToast = (message, type = "success", action) => {
      const id = v4();
      const toast = { id, message, type };
      toasts.value.push(toast);
      setTimeout(() => {
        toasts.value = toasts.value.filter((t2) => t2.id !== id);
      }, 3e3);
    };
    ref({});
    const handleApplyChaos = () => {
      const chaoticInvoice = applyChaosToInvoice(invoice2.value);
      const currentLogo = invoice2.value.logo;
      invoice2.value = chaoticInvoice;
      if (currentLogo) {
        invoice2.value.logo = currentLogo;
      }
      showChaos.value = false;
      showToast("Chaos applied to invoice!");
    };
    const handleBulkGenerated = (count) => {
      showToast(`Generated ${count} invoices`);
    };
    const formatDate = (dateString) => {
      if (!dateString) return "—";
      return new Date(dateString).toLocaleDateString("en-US", { year: "numeric", month: "2-digit", day: "2-digit" });
    };
    const applyBadScanEffect = (pdf, pageWidth, pageHeight) => {
      pdf.saveGraphicsState();
      const tintOpacity = 0.04 + Math.random() * 0.08;
      const tintColors = ["#d4a574", "#c4956a", "#b8a082", "#cdb891", "#a89070"];
      const tintColor = tintColors[Math.floor(Math.random() * tintColors.length)];
      const tintGState = pdf.GState({ opacity: tintOpacity });
      pdf.setGState(tintGState);
      pdf.setFillColor(tintColor);
      pdf.rect(0, 0, pageWidth, pageHeight, "F");
      const gradientDirection = Math.floor(Math.random() * 8);
      const gradientSteps = 5 + Math.floor(Math.random() * 6);
      const baseOpacity = 0.02 + Math.random() * 0.03;
      pdf.setFillColor("#1c1917");
      for (let i = 0; i < gradientSteps; i++) {
        const stepOpacity = baseOpacity * (gradientSteps - i);
        const gState = pdf.GState({ opacity: stepOpacity });
        pdf.setGState(gState);
        const ratio = (i + 1) / gradientSteps;
        switch (gradientDirection) {
          case 0:
            pdf.rect(0, 0, pageWidth * ratio, pageHeight * ratio, "F");
            break;
          case 1:
            pdf.rect(pageWidth * (1 - ratio), 0, pageWidth * ratio, pageHeight * ratio, "F");
            break;
          case 2:
            pdf.rect(0, pageHeight * (1 - ratio), pageWidth * ratio, pageHeight * ratio, "F");
            break;
          case 3:
            pdf.rect(pageWidth * (1 - ratio), pageHeight * (1 - ratio), pageWidth * ratio, pageHeight * ratio, "F");
            break;
          case 4:
            pdf.rect(0, 0, pageWidth, pageHeight * ratio, "F");
            break;
          case 5:
            pdf.rect(0, pageHeight * (1 - ratio), pageWidth, pageHeight * ratio, "F");
            break;
          case 6:
            pdf.rect(0, 0, pageWidth * ratio, pageHeight, "F");
            break;
          case 7:
            pdf.rect(pageWidth * (1 - ratio), 0, pageWidth * ratio, pageHeight, "F");
            break;
        }
      }
      const noiseCount = 8 + Math.floor(Math.random() * 18);
      const noiseOpacity = 0.03 + Math.random() * 0.06;
      const noiseGState = pdf.GState({ opacity: noiseOpacity });
      pdf.setGState(noiseGState);
      const noiseColors = ["#78716c", "#57534e", "#a8a29e", "#44403c"];
      for (let i = 0; i < noiseCount; i++) {
        pdf.setFillColor(noiseColors[Math.floor(Math.random() * noiseColors.length)]);
        const x = Math.random() * pageWidth;
        const y = Math.random() * pageHeight;
        const size = Math.random() * 4 + 0.3;
        pdf.circle(x, y, size, "F");
      }
      const vignetteOpacity = 0.08 + Math.random() * 0.12;
      const vignetteGState = pdf.GState({ opacity: vignetteOpacity });
      pdf.setGState(vignetteGState);
      pdf.setFillColor("#1c1917");
      const cornerSizes = [
        20 + Math.random() * 40,
        20 + Math.random() * 40,
        20 + Math.random() * 40,
        20 + Math.random() * 40
      ];
      pdf.triangle(0, 0, cornerSizes[0], 0, 0, cornerSizes[0], "F");
      pdf.triangle(pageWidth, 0, pageWidth - cornerSizes[1], 0, pageWidth, cornerSizes[1], "F");
      pdf.triangle(0, pageHeight, cornerSizes[2], pageHeight, 0, pageHeight - cornerSizes[2], "F");
      pdf.triangle(pageWidth, pageHeight, pageWidth - cornerSizes[3], pageHeight, pageWidth, pageHeight - cornerSizes[3], "F");
      pdf.restoreGraphicsState();
    };
    let previewDebounce = null;
    const generatePreview = async () => {
      if (isGeneratingPreview.value) return;
      isGeneratingPreview.value = true;
      try {
        const { default: jsPDF } = await import('jspdf');
        const pdf = new jsPDF("p", "mm", "a4");
        const invoiceTitle = invoice2.value.number || "Invoice";
        pdf.setProperties({
          title: invoiceTitle,
          subject: `Invoice ${invoiceTitle}`,
          creator: "Numerand Invoice Generator"
        });
        const pageWidth = 210;
        const pageHeight = 297;
        const margin = 20;
        const contentWidth = pageWidth - margin * 2;
        let y = margin;
        const addWatermark = () => {
          pdf.saveGraphicsState();
          const textGState = pdf.GState({ opacity: 0.08 });
          pdf.setGState(textGState);
          pdf.setFontSize(48);
          pdf.setFont("helvetica", "bold");
          pdf.setTextColor("#78716c");
          const text = "SAMPLE INVOICE";
          for (let i = -1; i <= 1; i++) {
            const yPos = pageHeight / 2 + i * 80;
            pdf.text(text, pageWidth / 2, yPos, { angle: -35, align: "center" });
          }
          pdf.restoreGraphicsState();
        };
        const addFooter = () => {
          const footerY = pageHeight - 12;
          pdf.setFontSize(10);
          pdf.setFont("helvetica", "normal");
          pdf.setTextColor("#a8a29e");
          const drawHeart = (x, y2, size) => {
            pdf.setFillColor("#ef4444");
            const s = size;
            pdf.ellipse(x - s * 0.25, y2 - s * 0.15, s * 0.28, s * 0.25, "F");
            pdf.ellipse(x + s * 0.25, y2 - s * 0.15, s * 0.28, s * 0.25, "F");
            pdf.triangle(x - s * 0.5, y2, x + s * 0.5, y2, x, y2 + s * 0.55, "F");
          };
          const text1 = t("generatedWith");
          const text2 = `${t("by")} Numerand`;
          const heartSize = 3;
          const spacing = 1.8;
          pdf.setFontSize(10);
          const text1Width = pdf.getTextWidth(text1);
          const text2Width = pdf.getTextWidth(text2);
          const totalWidth = text1Width + heartSize + text2Width + spacing * 2;
          let startX = (pageWidth - totalWidth) / 2;
          if (watermarkLogo.value) {
            try {
              const logoSize = 5;
              startX = (pageWidth - totalWidth - logoSize - spacing) / 2;
              pdf.addImage(watermarkLogo.value, "PNG", startX, footerY - 4, logoSize, logoSize);
              startX += logoSize + spacing;
            } catch (e) {
            }
          }
          pdf.text(text1, startX, footerY);
          startX += text1Width + spacing;
          drawHeart(startX + heartSize / 2, footerY - 1, heartSize);
          startX += heartSize + spacing;
          pdf.setTextColor("#a8a29e");
          pdf.text(text2, startX, footerY);
        };
        addWatermark();
        const addText = (text, x, yPos, size = 9, style = "normal", align = "left", color = "#374151") => {
          pdf.setFontSize(size);
          pdf.setFont("helvetica", style);
          pdf.setTextColor(color);
          let finalX = x;
          if (align === "right") finalX = x - pdf.getTextWidth(text);
          else if (align === "center") finalX = x - pdf.getTextWidth(text) / 2;
          pdf.text(text, finalX, yPos);
        };
        y += 5;
        if (invoice2.value.logo) {
          try {
            pdf.addImage(invoice2.value.logo, "JPEG", margin, y, 18, 18);
          } catch {
          }
        }
        addText(t("invoice"), invoice2.value.logo ? margin + 25 : margin, y + 10, 24, "bold", "left", "#1c1917");
        addText(invoice2.value.number || "Draft", invoice2.value.logo ? margin + 25 : margin, y + 16, 10, "normal", "left", "#78716c");
        addText(`${t("date")}: ${formatDate(invoice2.value.date)}`, pageWidth - margin, y + 8, 9, "normal", "right", "#78716c");
        addText(`${t("due")}: ${formatDate(invoice2.value.dueDate)}`, pageWidth - margin, y + 14, 9, "normal", "right", "#78716c");
        y += 35;
        addText(t("from"), margin, y, 8, "bold", "left", "#a8a29e");
        addText(t("to"), pageWidth / 2 + 10, y, 8, "bold", "left", "#a8a29e");
        y += 6;
        if (invoice2.value.from.businessName) {
          addText(invoice2.value.from.businessName, margin, y, 10, "bold", "left", "#1c1917");
          y += 5;
        }
        let fromY = y;
        if (invoice2.value.from.email) {
          addText(invoice2.value.from.email, margin, y, 9);
          y += 4;
        }
        if (invoice2.value.from.address) {
          addText(invoice2.value.from.address, margin, y, 9);
          y += 4;
        }
        if (invoice2.value.from.phone) {
          addText(invoice2.value.from.phone, margin, y, 9);
          y += 4;
        }
        if (invoice2.value.from.taxId) {
          addText(`${t("taxId")}: ${invoice2.value.from.taxId}`, margin, y, 8, "normal", "left", "#a8a29e");
          y += 4;
        }
        let toY = fromY - 5;
        if (invoice2.value.to.customerName) {
          addText(invoice2.value.to.customerName, pageWidth / 2 + 10, toY, 10, "bold", "left", "#1c1917");
          toY += 5;
        }
        if (invoice2.value.to.email) {
          addText(invoice2.value.to.email, pageWidth / 2 + 10, toY, 9);
          toY += 4;
        }
        if (invoice2.value.to.address) {
          addText(invoice2.value.to.address, pageWidth / 2 + 10, toY, 9);
          toY += 4;
        }
        if (invoice2.value.to.phone) {
          addText(invoice2.value.to.phone, pageWidth / 2 + 10, toY, 9);
          toY += 4;
        }
        if (invoice2.value.to.taxId) {
          addText(`${t("taxId")}: ${invoice2.value.to.taxId}`, pageWidth / 2 + 10, toY, 8, "normal", "left", "#a8a29e");
        }
        y = Math.max(y, toY) + 15;
        pdf.setDrawColor("#e7e5e4");
        pdf.setLineWidth(0.3);
        pdf.line(margin, y, pageWidth - margin, y);
        y += 6;
        addText(t("description"), margin, y, 8, "bold", "left", "#a8a29e");
        addText(t("qty"), pageWidth - margin - 60, y, 8, "bold", "right", "#a8a29e");
        addText(t("price"), pageWidth - margin - 30, y, 8, "bold", "right", "#a8a29e");
        addText(t("total"), pageWidth - margin, y, 8, "bold", "right", "#a8a29e");
        y += 3;
        pdf.line(margin, y, pageWidth - margin, y);
        y += 6;
        if (invoice2.value.items.length === 0) {
          addText(t("noItems"), pageWidth / 2, y + 10, 9, "normal", "center", "#a8a29e");
          y += 25;
        } else {
          invoice2.value.items.forEach((item) => {
            const desc = item.description?.length > 40 ? item.description.substring(0, 37) + "..." : item.description || "—";
            addText(desc, margin, y, 9, "normal", "left", "#1c1917");
            addText(String(item.quantity), pageWidth - margin - 60, y, 9, "normal", "right", "#57534e");
            addText(`${currency2.value}${item.price.toFixed(2)}`, pageWidth - margin - 30, y, 9, "normal", "right", "#57534e");
            addText(`${currency2.value}${(item.quantity * item.price).toFixed(2)}`, pageWidth - margin, y, 9, "normal", "right", "#1c1917");
            y += 7;
          });
        }
        y += 5;
        pdf.line(margin, y, pageWidth - margin, y);
        y += 12;
        addText(t("subtotal"), pageWidth - margin - 40, y, 9, "normal", "left", "#78716c");
        addText(`${currency2.value}${subtotal.value.toFixed(2)}`, pageWidth - margin, y, 9, "normal", "right", "#57534e");
        y += 6;
        addText(t("tax"), pageWidth - margin - 40, y, 9, "normal", "left", "#78716c");
        addText(`${currency2.value}${totalTax.value.toFixed(2)}`, pageWidth - margin, y, 9, "normal", "right", "#57534e");
        y += 8;
        pdf.line(pageWidth - margin - 50, y, pageWidth - margin, y);
        y += 6;
        addText(t("total"), pageWidth - margin - 40, y, 10, "bold", "left", "#1c1917");
        addText(`${currency2.value}${total.value.toFixed(2)}`, pageWidth - margin, y, 10, "bold", "right", "#1c1917");
        if (invoice2.value.notes || invoice2.value.terms) {
          y += 20;
          pdf.line(margin, y, pageWidth - margin, y);
          y += 10;
          if (invoice2.value.notes) {
            addText(t("notes"), margin, y, 8, "bold", "left", "#a8a29e");
            y += 6;
            const notesLines = pdf.splitTextToSize(invoice2.value.notes, contentWidth);
            notesLines.forEach((line) => {
              addText(line, margin, y, 9, "normal", "left", "#57534e");
              y += 5;
            });
            y += 5;
          }
          if (invoice2.value.terms) {
            addText(t("paymentTerms"), margin, y, 8, "bold", "left", "#a8a29e");
            y += 6;
            const termsLines = pdf.splitTextToSize(invoice2.value.terms, contentWidth);
            termsLines.forEach((line) => {
              addText(line, margin, y, 9, "normal", "left", "#57534e");
              y += 5;
            });
          }
        }
        addFooter();
        if (chaosEnabled2.value && chaosConfig2.value.enableBadScanEffect) {
          applyBadScanEffect(pdf, pageWidth, pageHeight);
        }
        if (pdfPreviewUrl.value) URL.revokeObjectURL(pdfPreviewUrl.value.split("#")[0]);
        pdfPreviewUrl.value = URL.createObjectURL(pdf.output("blob")) + `#${invoice2.value.number || "invoice"}.pdf`;
      } catch (e) {
        console.error("PDF error:", e);
      } finally {
        isGeneratingPreview.value = false;
      }
    };
    const debouncedPreview = () => {
      if (previewDebounce) clearTimeout(previewDebounce);
      previewDebounce = setTimeout(generatePreview, 400);
    };
    const isBulkExporting = ref(false);
    const bulkExportProgress = ref({ current: 0, total: 0 });
    watch([invoice2, currency2, language2], debouncedPreview, { deep: true });
    watch(invoice2, (val) => {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(val));
    }, { deep: true });
    return (_ctx, _push, _parent, _attrs) => {
      _push(`<div${ssrRenderAttrs(mergeProps({ class: "h-screen flex flex-col bg-stone-50" }, _attrs))}><header class="h-14 border-b border-stone-200 bg-white flex-shrink-0 px-3 sm:px-4 flex items-center justify-between"><div class="flex items-center gap-2 sm:gap-4 min-w-0"><h1 class="text-sm font-medium tracking-tight whitespace-nowrap"><span class="text-stone-400">Sample</span> <span class="text-stone-900">Invoice Generator</span></h1><div class="hidden sm:flex items-center gap-2 text-xs"><span class="text-stone-600 font-medium">${ssrInterpolate(invoice2.value.number || "Untitled")}</span><span class="flex items-center gap-1 text-stone-400"><span class="w-1.5 h-1.5 rounded-full bg-emerald-400"></span> Auto-saved </span></div></div><div class="flex items-center gap-1 sm:gap-3"><select class="text-xs text-stone-500 bg-transparent border-0 focus:ring-0 cursor-pointer hover:text-stone-900 transition-colors pr-4 sm:pr-6"><option value="$"${ssrIncludeBooleanAttr(Array.isArray(currency2.value) ? ssrLooseContain(currency2.value, "$") : ssrLooseEqual(currency2.value, "$")) ? " selected" : ""}>USD</option><option value="€"${ssrIncludeBooleanAttr(Array.isArray(currency2.value) ? ssrLooseContain(currency2.value, "€") : ssrLooseEqual(currency2.value, "€")) ? " selected" : ""}>EUR</option><option value="£"${ssrIncludeBooleanAttr(Array.isArray(currency2.value) ? ssrLooseContain(currency2.value, "£") : ssrLooseEqual(currency2.value, "£")) ? " selected" : ""}>GBP</option><option value="¥"${ssrIncludeBooleanAttr(Array.isArray(currency2.value) ? ssrLooseContain(currency2.value, "¥") : ssrLooseEqual(currency2.value, "¥")) ? " selected" : ""}>JPY</option><option value="CHF"${ssrIncludeBooleanAttr(Array.isArray(currency2.value) ? ssrLooseContain(currency2.value, "CHF") : ssrLooseEqual(currency2.value, "CHF")) ? " selected" : ""}>CHF</option></select><select${ssrRenderAttr("value", language2.value)} class="hidden sm:block text-xs text-stone-500 bg-transparent border-0 focus:ring-0 cursor-pointer hover:text-stone-900 transition-colors pr-6"><option value="EN">EN</option><option value="ES">ES</option><option value="FR">FR</option><option value="DE">DE</option></select><div class="hidden sm:block w-px h-4 bg-stone-200"></div><button class="btn-ghost hidden sm:inline-flex"> History </button><button class="btn-ghost hidden sm:inline-flex"> Clear </button><button${ssrIncludeBooleanAttr(!canDownload.value || justSaved.value) ? " disabled" : ""} class="${ssrRenderClass([
        "hidden sm:inline-flex items-center gap-1.5 transition-all duration-200",
        justSaved.value ? "btn-success" : "btn-secondary"
      ])}">`);
      if (justSaved.value) {
        _push(`<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path></svg>`);
      } else {
        _push(`<!---->`);
      }
      _push(` ${ssrInterpolate(justSaved.value ? "Saved!" : "Save")}</button><button class="${ssrRenderClass([
        "hidden sm:inline-flex text-xs font-medium px-3 py-1.5 transition-colors",
        unref(chaosEnabled2) ? "bg-stone-900 text-white" : "text-stone-500 hover:text-stone-900"
      ])}" title="Configure chaos mode settings"> Chaos </button><button class="hidden sm:inline-flex text-xs font-medium px-3 py-1.5 transition-colors text-stone-500 hover:text-stone-900 items-center gap-1" title="Generate multiple test invoices"><svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"></path></svg> Bulk </button><button${ssrIncludeBooleanAttr(!canDownload.value || justExported.value) ? " disabled" : ""} class="${ssrRenderClass([
        "inline-flex items-center gap-1.5 transition-all duration-200",
        justExported.value ? "btn-success" : "btn-primary"
      ])}">`);
      if (justExported.value) {
        _push(`<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path></svg>`);
      } else {
        _push(`<!---->`);
      }
      _push(` ${ssrInterpolate(justExported.value ? "Exported!" : "Export")}</button></div></header><div class="lg:hidden border-b border-stone-200 bg-white"><div class="flex"><button class="${ssrRenderClass([
        "flex-1 py-3 text-xs font-medium transition-colors border-b-2",
        mobileView.value === "form" ? "text-stone-900 border-stone-900" : "text-stone-400 border-transparent hover:text-stone-600"
      ])}"> Edit </button><button class="${ssrRenderClass([
        "flex-1 py-3 text-xs font-medium transition-colors border-b-2",
        mobileView.value === "preview" ? "text-stone-900 border-stone-900" : "text-stone-400 border-transparent hover:text-stone-600"
      ])}"> Preview </button></div></div><div class="flex-1 flex min-h-0"><div class="${ssrRenderClass([
        "w-full lg:w-1/2 overflow-y-auto bg-white lg:border-r border-stone-200",
        mobileView.value === "form" ? "block" : "hidden lg:block"
      ])}"><div class="p-4 sm:p-8 max-w-2xl mx-auto space-y-6 sm:space-y-10"><div>`);
      if (!invoice2.value.logo) {
        _push(`<div class="group relative h-20 border border-dashed border-stone-300 hover:border-stone-400 transition-colors cursor-pointer flex items-center justify-center"><span class="text-xs text-stone-400 group-hover:text-stone-500 transition-colors"> + Add logo </span></div>`);
      } else {
        _push(`<div class="group relative h-20 border border-stone-200 flex items-center justify-center"><img${ssrRenderAttr("src", invoice2.value.logo)} alt="Logo" class="max-h-16 max-w-32 object-contain"><div class="absolute inset-0 bg-white/90 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-4"><button class="text-xs text-stone-600 hover:text-stone-900">Change</button><button class="text-xs text-red-600 hover:text-red-700">Remove</button></div></div>`);
      }
      _push(`<input type="file" accept="image/*" class="hidden"></div><div class="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4"><div><label class="block text-[10px] uppercase tracking-wider text-stone-400 mb-2">Number *</label><input${ssrRenderAttr("value", invoice2.value.number)} type="text" placeholder="INV-001" class="${ssrRenderClass([
        "w-full text-sm text-stone-900 placeholder-stone-300 border-0 border-b focus:ring-0 px-0 py-1 transition-colors",
        fieldErrors.value.invoiceNumber ? "border-red-400 focus:border-red-500" : "border-stone-200 focus:border-stone-900"
      ])}">`);
      if (fieldErrors.value.invoiceNumber) {
        _push(`<span class="text-[10px] text-red-500 mt-1 block">Required</span>`);
      } else {
        _push(`<!---->`);
      }
      _push(`</div><div><label class="block text-[10px] uppercase tracking-wider text-stone-400 mb-2">Date</label><input${ssrRenderAttr("value", invoice2.value.date)} type="date" class="w-full text-sm text-stone-900 border-0 border-b border-stone-200 focus:border-stone-900 focus:ring-0 px-0 py-1 transition-colors"></div><div><label class="block text-[10px] uppercase tracking-wider text-stone-400 mb-2">Due</label><input${ssrRenderAttr("value", invoice2.value.dueDate)} type="date" class="w-full text-sm text-stone-900 border-0 border-b border-stone-200 focus:border-stone-900 focus:ring-0 px-0 py-1 transition-colors"></div></div><div class="grid grid-cols-1 sm:grid-cols-2 gap-6 sm:gap-8"><div class="space-y-3"><label class="block text-[10px] uppercase tracking-wider text-stone-400">From *</label><div><input${ssrRenderAttr("value", invoice2.value.from.businessName)} type="text" placeholder="Your business" class="${ssrRenderClass([
        "w-full text-sm text-stone-900 placeholder-stone-300 border-0 border-b focus:ring-0 px-0 py-1",
        fieldErrors.value.businessName ? "border-red-400 focus:border-red-500" : "border-stone-200 focus:border-stone-900"
      ])}">`);
      if (fieldErrors.value.businessName) {
        _push(`<span class="text-[10px] text-red-500 mt-1 block">Required</span>`);
      } else {
        _push(`<!---->`);
      }
      _push(`</div><input${ssrRenderAttr("value", invoice2.value.from.email)} type="email" placeholder="email@company.com" class="w-full text-sm text-stone-900 placeholder-stone-300 border-0 border-b border-stone-200 focus:border-stone-900 focus:ring-0 px-0 py-1"><input${ssrRenderAttr("value", invoice2.value.from.address)} type="text" placeholder="Address" class="w-full text-sm text-stone-900 placeholder-stone-300 border-0 border-b border-stone-200 focus:border-stone-900 focus:ring-0 px-0 py-1"><div class="grid grid-cols-2 gap-3"><input${ssrRenderAttr("value", invoice2.value.from.phone)} type="tel" placeholder="Phone" class="w-full text-sm text-stone-900 placeholder-stone-300 border-0 border-b border-stone-200 focus:border-stone-900 focus:ring-0 px-0 py-1"><input${ssrRenderAttr("value", invoice2.value.from.taxId)} type="text" placeholder="Tax ID" class="w-full text-sm text-stone-900 placeholder-stone-300 border-0 border-b border-stone-200 focus:border-stone-900 focus:ring-0 px-0 py-1"></div></div><div class="space-y-3 relative"><div class="flex items-center justify-between"><label class="block text-[10px] uppercase tracking-wider text-stone-400">To *</label><div class="flex items-center gap-2">`);
      if (customers2.value.length > 0) {
        _push(`<button class="text-[10px] text-stone-400 hover:text-stone-600 transition-colors">${ssrInterpolate(showCustomerDropdown.value ? "Close" : "Select")}</button>`);
      } else {
        _push(`<!---->`);
      }
      _push(`<button class="text-[10px] text-stone-400 hover:text-stone-600 transition-colors"> Save </button></div></div>`);
      if (showCustomerDropdown.value && customers2.value.length > 0) {
        _push(`<div class="absolute top-6 left-0 right-0 bg-white border border-stone-200 shadow-lg z-20 max-h-48 overflow-y-auto rounded-b"><!--[-->`);
        ssrRenderList(customers2.value, (customer) => {
          _push(`<div class="flex items-center justify-between px-3 py-2 hover:bg-stone-50 active:bg-stone-100 cursor-pointer group transition-colors duration-150"><div class="flex-1"><div class="text-sm text-stone-900">${ssrInterpolate(customer.customerName)}</div><div class="text-xs text-stone-400">${ssrInterpolate(customer.email || customer.address || "No details")}</div></div><button class="text-xs text-stone-300 hover:text-red-500 hover:bg-red-50 opacity-0 group-hover:opacity-100 transition-all duration-150 ml-2 px-2 py-1 -my-1 rounded"> Delete </button></div>`);
        });
        _push(`<!--]--></div>`);
      } else {
        _push(`<!---->`);
      }
      _push(`<div><input${ssrRenderAttr("value", invoice2.value.to.customerName)} type="text" placeholder="Client name" class="${ssrRenderClass([
        "w-full text-sm text-stone-900 placeholder-stone-300 border-0 border-b focus:ring-0 px-0 py-1",
        fieldErrors.value.customerName ? "border-red-400 focus:border-red-500" : "border-stone-200 focus:border-stone-900"
      ])}">`);
      if (fieldErrors.value.customerName) {
        _push(`<span class="text-[10px] text-red-500 mt-1 block">Required</span>`);
      } else {
        _push(`<!---->`);
      }
      _push(`</div><input${ssrRenderAttr("value", invoice2.value.to.email)} type="email" placeholder="client@email.com" class="w-full text-sm text-stone-900 placeholder-stone-300 border-0 border-b border-stone-200 focus:border-stone-900 focus:ring-0 px-0 py-1"><input${ssrRenderAttr("value", invoice2.value.to.address)} type="text" placeholder="Address" class="w-full text-sm text-stone-900 placeholder-stone-300 border-0 border-b border-stone-200 focus:border-stone-900 focus:ring-0 px-0 py-1"><div class="grid grid-cols-2 gap-3"><input${ssrRenderAttr("value", invoice2.value.to.phone)} type="tel" placeholder="Phone" class="w-full text-sm text-stone-900 placeholder-stone-300 border-0 border-b border-stone-200 focus:border-stone-900 focus:ring-0 px-0 py-1"><input${ssrRenderAttr("value", invoice2.value.to.taxId)} type="text" placeholder="Tax ID" class="w-full text-sm text-stone-900 placeholder-stone-300 border-0 border-b border-stone-200 focus:border-stone-900 focus:ring-0 px-0 py-1"></div></div></div><div><div class="flex items-center justify-between mb-4"><div class="flex items-center gap-3"><label class="text-[10px] uppercase tracking-wider text-stone-400">Items</label><span class="text-[10px] text-stone-300">${ssrInterpolate(invoice2.value.items.length)} item${ssrInterpolate(invoice2.value.items.length !== 1 ? "s" : "")}</span></div><button class="text-xs text-stone-500 hover:text-stone-900 hover:bg-stone-100 active:bg-stone-200 transition-all duration-150 flex items-center gap-1 px-2 py-1 -mx-2 rounded"><svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"></path></svg> Add item </button></div>`);
      if (invoice2.value.items.length === 0) {
        _push(`<div class="py-16 text-center border border-dashed border-stone-200 bg-stone-50/50"><svg class="w-10 h-10 mx-auto text-stone-300 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"></path></svg><p class="text-sm text-stone-500 mb-1">No line items yet</p><p class="text-xs text-stone-400 mb-4">Add products or services to your invoice</p><button class="text-xs font-medium text-stone-600 hover:text-stone-900 hover:bg-stone-50 active:bg-stone-100 transition-all duration-150 px-3 py-1.5 border border-stone-300 hover:border-stone-400 rounded active:scale-[0.98]"> Add first item </button></div>`);
      } else {
        _push(`<div class="space-y-0"><div class="hidden sm:grid grid-cols-12 gap-2 pb-2 border-b border-stone-200 text-[10px] uppercase tracking-wider text-stone-400"><div class="col-span-5">Description</div><div class="col-span-1 text-center">Qty</div><div class="col-span-2 text-right">Price</div><div class="col-span-1 text-center">Tax %</div><div class="col-span-2 text-right">Total</div><div class="col-span-1"></div></div><div${ssrRenderAttrs({
          name: "item-list",
          class: "hidden sm:block relative"
        })}>`);
        ssrRenderList(invoice2.value.items, (item, index) => {
          _push(`<div class="grid grid-cols-12 gap-2 py-3 border-b border-stone-100 group items-center hover:bg-stone-50/50 transition-colors -mx-2 px-2"><div class="col-span-5"><input${ssrRenderAttr("value", item.description)} type="text" placeholder="Item description" class="w-full text-sm text-stone-900 placeholder-stone-300 border-0 focus:ring-0 p-0 bg-transparent"></div><div class="col-span-1"><input${ssrRenderAttr("value", item.quantity)} type="number" min="0" step="1" class="w-full text-sm text-stone-900 text-center border-0 focus:ring-0 p-0 tabular-nums bg-transparent"></div><div class="col-span-2"><input${ssrRenderAttr("value", item.price)} type="number" min="0" step="0.01" class="w-full text-sm text-stone-900 text-right border-0 focus:ring-0 p-0 tabular-nums bg-transparent"></div><div class="col-span-1"><input${ssrRenderAttr("value", item.tax)} type="number" min="0" max="100" step="0.5" class="w-full text-sm text-stone-500 text-center border-0 focus:ring-0 p-0 tabular-nums bg-transparent"></div><div class="col-span-2 text-sm text-stone-900 text-right tabular-nums font-medium">${ssrInterpolate(currency2.value)}${ssrInterpolate((item.quantity * item.price * (1 + item.tax / 100)).toFixed(2))}</div><div class="col-span-1 text-right"><button class="text-stone-300 hover:text-red-500 hover:bg-red-50 active:bg-red-100 transition-all duration-150 opacity-0 group-hover:opacity-100 p-1 -m-1 rounded" title="Remove item"><svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M6 18L18 6M6 6l12 12"></path></svg></button></div></div>`);
        });
        _push(`</div><div${ssrRenderAttrs({
          name: "item-list",
          class: "sm:hidden space-y-4 pt-2 relative"
        })}>`);
        ssrRenderList(invoice2.value.items, (item, index) => {
          _push(`<div class="border border-stone-200 rounded-lg p-4 bg-white shadow-sm"><div class="flex items-center justify-between gap-3 mb-4"><input${ssrRenderAttr("value", item.description)} type="text" placeholder="Item description" class="flex-1 text-sm text-stone-900 placeholder-stone-300 border-0 border-b border-stone-200 focus:border-stone-900 focus:ring-0 px-0 py-2 bg-transparent min-h-[44px]"><button class="text-stone-400 hover:text-red-500 active:text-red-600 active:bg-red-50 p-2 -m-2 rounded-lg min-w-[44px] min-h-[44px] flex items-center justify-center transition-colors" aria-label="Remove item"><svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M6 18L18 6M6 6l12 12"></path></svg></button></div><div class="grid grid-cols-4 gap-3"><div><label class="block text-xs uppercase tracking-wider text-stone-400 mb-1.5">Qty</label><input${ssrRenderAttr("value", item.quantity)} type="number" min="0" step="1" class="w-full text-sm text-stone-900 text-center border border-stone-200 rounded-lg px-2 py-2 tabular-nums min-h-[44px]"></div><div><label class="block text-xs uppercase tracking-wider text-stone-400 mb-1.5">Price</label><input${ssrRenderAttr("value", item.price)} type="number" min="0" step="0.01" class="w-full text-sm text-stone-900 border border-stone-200 rounded-lg px-2 py-2 tabular-nums min-h-[44px]"></div><div><label class="block text-xs uppercase tracking-wider text-stone-400 mb-1.5">Tax %</label><input${ssrRenderAttr("value", item.tax)} type="number" min="0" max="100" step="0.5" class="w-full text-sm text-stone-500 text-center border border-stone-200 rounded-lg px-2 py-2 tabular-nums min-h-[44px]"></div><div><label class="block text-xs uppercase tracking-wider text-stone-400 mb-1.5">Total</label><div class="text-sm text-stone-900 font-medium tabular-nums py-2 text-right min-h-[44px] flex items-center justify-end">${ssrInterpolate(currency2.value)}${ssrInterpolate((item.quantity * item.price * (1 + item.tax / 100)).toFixed(2))}</div></div></div></div>`);
        });
        _push(`</div><div class="pt-3 pb-2 flex flex-wrap items-center gap-2"><span class="text-[10px] uppercase tracking-wider text-stone-400">Quick tax:</span><div class="flex flex-wrap gap-1"><!--[-->`);
        ssrRenderList([0, 5, 10, 15, 20, 21], (rate) => {
          _push(`<button class="text-[10px] px-2 py-0.5 text-stone-500 hover:text-stone-900 hover:bg-stone-100 active:bg-stone-200 transition-all duration-150 rounded">${ssrInterpolate(rate)}% </button>`);
        });
        _push(`<!--]--></div></div><div class="pt-4 space-y-2 border-t border-stone-200"><div class="flex justify-between text-sm"><span class="text-stone-400">Subtotal</span><span class="tabular-nums">${ssrInterpolate(currency2.value)}${ssrInterpolate(subtotal.value.toFixed(2))}</span></div><div class="flex justify-between text-sm"><span class="text-stone-400">Tax</span><span class="tabular-nums">${ssrInterpolate(currency2.value)}${ssrInterpolate(totalTax.value.toFixed(2))}</span></div><div class="flex justify-between text-sm font-semibold pt-2 border-t border-stone-900"><span>Total</span><span class="tabular-nums text-lg">${ssrInterpolate(currency2.value)}${ssrInterpolate(total.value.toFixed(2))}</span></div></div></div>`);
      }
      _push(`</div><div class="space-y-4 pt-6 border-t border-stone-200"><div><label class="block text-[10px] uppercase tracking-wider text-stone-400 mb-2">Notes</label><textarea rows="2" placeholder="Additional notes for the client..." class="w-full text-sm text-stone-900 placeholder-stone-300 bg-transparent border-0 border-b-2 border-stone-200 focus:border-stone-900 focus:ring-0 px-0 py-2 resize-none transition-colors">${ssrInterpolate(invoice2.value.notes)}</textarea></div><div><label class="block text-[10px] uppercase tracking-wider text-stone-400 mb-2">Payment Terms</label><textarea rows="2" placeholder="Payment terms and conditions..." class="w-full text-sm text-stone-900 placeholder-stone-300 bg-transparent border-0 border-b-2 border-stone-200 focus:border-stone-900 focus:ring-0 px-0 py-2 resize-none transition-colors">${ssrInterpolate(invoice2.value.terms)}</textarea></div></div><div class="text-[10px] text-stone-400 pt-4 flex items-center gap-4"><span>Tab to navigate</span><span class="text-stone-300">|</span><span>Changes auto-save</span></div></div></div><div class="${ssrRenderClass([
        "w-full lg:w-1/2 flex flex-col bg-stone-100 min-h-0 overflow-hidden",
        mobileView.value === "preview" ? "flex" : "hidden lg:flex"
      ])}">`);
      if (isGeneratingPreview.value && !pdfPreviewUrl.value) {
        _push(`<div class="flex-1 flex items-center justify-center"><div class="text-center"><svg class="animate-spin w-8 h-8 mx-auto text-stone-300 mb-3" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="3"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg><p class="text-xs text-stone-400">Generating preview...</p></div></div>`);
      } else if (pdfPreviewUrl.value) {
        _push(`<iframe${ssrRenderAttr("src", pdfPreviewUrl.value)} class="flex-1 w-full border-0" title="Invoice PDF Preview"></iframe>`);
      } else {
        _push(`<div class="flex-1 flex items-center justify-center"><div class="text-center px-8"><svg class="w-16 h-16 mx-auto text-stone-200 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path></svg><p class="text-sm text-stone-400 mb-1">PDF preview</p><p class="text-xs text-stone-300">Fill in invoice details to see preview</p></div></div>`);
      }
      _push(`</div></div>`);
      ssrRenderTeleport(_push, (_push2) => {
        if (showHistory.value) {
          _push2(`<div class="fixed inset-0 bg-black/20 z-50"></div>`);
        } else {
          _push2(`<!---->`);
        }
        if (showHistory.value) {
          _push2(`<div class="fixed inset-y-0 right-0 w-80 bg-white shadow-xl z-50 flex flex-col"><div class="p-4 border-b border-stone-200 flex items-center justify-between"><div><span class="text-sm font-medium block">History</span><span class="text-[10px] text-stone-400">${ssrInterpolate(unref(invoiceHistory2).length)} invoices</span></div><div class="flex items-center gap-1">`);
          if (unref(invoiceHistory2).length > 0) {
            _push2(`<div class="relative"><button${ssrIncludeBooleanAttr(isBulkExporting.value) ? " disabled" : ""} class="p-2 text-stone-400 hover:text-stone-600 hover:bg-stone-100 rounded transition-colors disabled:opacity-50" title="Export All">`);
            if (isBulkExporting.value) {
              _push2(`<svg class="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>`);
            } else {
              _push2(`<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"></path></svg>`);
            }
            _push2(`</button>`);
            if (isBulkExporting.value && bulkExportProgress.value.total > 0) {
              _push2(`<span class="absolute -bottom-4 left-1/2 -translate-x-1/2 text-[9px] text-stone-500 whitespace-nowrap">${ssrInterpolate(bulkExportProgress.value.current)}/${ssrInterpolate(bulkExportProgress.value.total)}</span>`);
            } else {
              _push2(`<!---->`);
            }
            if (showExportAllMenu.value) {
              _push2(`<div class="absolute right-0 mt-1 w-36 bg-white border border-stone-200 rounded shadow-lg z-10"><button class="w-full text-left px-3 py-2 text-xs text-stone-700 hover:bg-stone-50 flex items-center gap-2"><svg class="w-3.5 h-3.5 text-stone-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4"></path></svg> ZIP (PDFs) </button><button class="w-full text-left px-3 py-2 text-xs text-stone-700 hover:bg-stone-50 flex items-center gap-2"><svg class="w-3.5 h-3.5 text-stone-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4"></path></svg> JSON </button><button class="w-full text-left px-3 py-2 text-xs text-stone-700 hover:bg-stone-50 flex items-center gap-2"><svg class="w-3.5 h-3.5 text-stone-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path></svg> CSV </button></div>`);
            } else {
              _push2(`<!---->`);
            }
            _push2(`</div>`);
          } else {
            _push2(`<!---->`);
          }
          _push2(`<button class="p-2 text-stone-400 hover:text-stone-600 hover:bg-stone-100 rounded transition-colors"><svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M6 18L18 6M6 6l12 12"></path></svg></button></div></div><div class="flex-1 overflow-y-auto">`);
          if (unref(invoiceHistory2).length === 0) {
            _push2(`<div class="p-8 text-center"><p class="text-sm text-stone-400">No saved invoices</p></div>`);
          } else {
            _push2(`<div class="divide-y divide-stone-100"><!--[-->`);
            ssrRenderList(unref(invoiceHistory2), (saved) => {
              _push2(`<div class="p-4 hover:bg-stone-50 cursor-pointer group"><div class="flex items-center justify-between"><span class="text-sm font-medium text-stone-900">${ssrInterpolate(saved.invoice.number)}</span><span class="text-xs text-stone-500 tabular-nums">${ssrInterpolate(currency2.value)}${ssrInterpolate((saved.totalAmount ?? 0).toFixed(2))}</span></div><div class="text-xs text-stone-400 mt-1">${ssrInterpolate(saved.customerName)}</div><div class="flex items-center justify-between mt-2"><span class="text-[10px] text-stone-300">${ssrInterpolate(new Date(saved.savedAt).toLocaleDateString())}</span><button class="text-[10px] text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"> Delete </button></div></div>`);
            });
            _push2(`<!--]--></div>`);
          }
          _push2(`</div></div>`);
        } else {
          _push2(`<!---->`);
        }
      }, "body", false, _parent);
      ssrRenderTeleport(_push, (_push2) => {
        if (showExport.value) {
          _push2(`<div class="fixed inset-0 bg-black/20 z-50 flex items-center justify-center"><div class="bg-white shadow-xl w-72"><div class="p-4 border-b border-stone-200 flex items-center justify-between"><span class="text-sm font-medium">Export</span><button class="text-stone-400 hover:text-stone-600"><svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M6 18L18 6M6 6l12 12"></path></svg></button></div><div class="p-2"><button${ssrIncludeBooleanAttr(isExporting.value) ? " disabled" : ""} class="w-full text-left px-3 py-2 text-sm text-stone-700 hover:bg-stone-50 transition-colors disabled:opacity-50 flex items-center gap-2">`);
          if (exportingFormat.value === "pdf") {
            _push2(`<span class="btn-spinner"></span>`);
          } else {
            _push2(`<!---->`);
          }
          _push2(` PDF </button><button${ssrIncludeBooleanAttr(isExporting.value) ? " disabled" : ""} class="w-full text-left px-3 py-2 text-sm text-stone-700 hover:bg-stone-50 transition-colors disabled:opacity-50 flex items-center gap-2">`);
          if (exportingFormat.value === "excel") {
            _push2(`<span class="btn-spinner"></span>`);
          } else {
            _push2(`<!---->`);
          }
          _push2(` Excel </button><button${ssrIncludeBooleanAttr(isExporting.value) ? " disabled" : ""} class="w-full text-left px-3 py-2 text-sm text-stone-700 hover:bg-stone-50 transition-colors disabled:opacity-50 flex items-center gap-2">`);
          if (exportingFormat.value === "csv") {
            _push2(`<span class="btn-spinner"></span>`);
          } else {
            _push2(`<!---->`);
          }
          _push2(` CSV </button><button${ssrIncludeBooleanAttr(isExporting.value) ? " disabled" : ""} class="w-full text-left px-3 py-2 text-sm text-stone-700 hover:bg-stone-50 transition-colors disabled:opacity-50 flex items-center gap-2">`);
          if (exportingFormat.value === "json") {
            _push2(`<span class="btn-spinner"></span>`);
          } else {
            _push2(`<!---->`);
          }
          _push2(` JSON </button></div></div></div>`);
        } else {
          _push2(`<!---->`);
        }
      }, "body", false, _parent);
      ssrRenderTeleport(_push, (_push2) => {
        _push2(`<div class="fixed bottom-4 right-4 z-50 space-y-2"><!--[-->`);
        ssrRenderList(toasts.value, (toast) => {
          _push2(`<div class="${ssrRenderClass([
            "px-4 py-2 text-xs font-medium shadow-lg flex items-center gap-3",
            toast.type === "error" ? "bg-red-600 text-white" : "bg-stone-900 text-white"
          ])}"><span>${ssrInterpolate(toast.message)}</span>`);
          if (toast.action) {
            _push2(`<button class="text-white/70 hover:text-white font-semibold underline underline-offset-2 transition-colors">${ssrInterpolate(toast.action.label)}</button>`);
          } else {
            _push2(`<!---->`);
          }
          _push2(`</div>`);
        });
        _push2(`<!--]--></div>`);
      }, "body", false, _parent);
      _push(ssrRenderComponent(ChaosConfigModal, {
        "is-open": showChaos.value,
        onClose: ($event) => showChaos.value = false,
        onApply: handleApplyChaos
      }, null, _parent));
      _push(ssrRenderComponent(BulkGenerateModal, {
        "is-open": showBulkGenerate.value,
        onClose: ($event) => showBulkGenerate.value = false,
        onGenerated: handleBulkGenerated
      }, null, _parent));
      if (unref(chaosEnabled2)) {
        _push(`<div class="fixed top-14 left-0 right-0 z-40 bg-stone-900 text-white px-4 py-1.5 flex items-center justify-center gap-3 text-xs"><span class="text-stone-400">Chaos Mode</span><span class="text-stone-500">|</span><span>Data is intentionally incorrect</span><button class="ml-2 text-stone-400 hover:text-white transition-colors flex items-center gap-1" title="Generate new chaotic invoice"><svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path></svg> Regenerate </button><span class="text-stone-500">|</span><button class="text-stone-400 hover:text-white transition-colors"> Reset </button></div>`);
      } else {
        _push(`<!---->`);
      }
      _push(`</div>`);
    };
  }
});
const _sfc_setup$2 = _sfc_main$2.setup;
_sfc_main$2.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("app.vue");
  return _sfc_setup$2 ? _sfc_setup$2(props, ctx) : void 0;
};
const _sfc_main$1 = {
  __name: "nuxt-error-page",
  __ssrInlineRender: true,
  props: {
    error: Object
  },
  setup(__props) {
    const props = __props;
    const _error = props.error;
    _error.stack ? _error.stack.split("\n").splice(1).map((line) => {
      const text = line.replace("webpack:/", "").replace(".vue", ".js").trim();
      return {
        text,
        internal: line.includes("node_modules") && !line.includes(".cache") || line.includes("internal") || line.includes("new Promise")
      };
    }).map((i) => `<span class="stack${i.internal ? " internal" : ""}">${i.text}</span>`).join("\n") : "";
    const statusCode = Number(_error.statusCode || 500);
    const is404 = statusCode === 404;
    const statusMessage = _error.statusMessage ?? (is404 ? "Page Not Found" : "Internal Server Error");
    const description = _error.message || _error.toString();
    const stack = void 0;
    const _Error404 = defineAsyncComponent(() => import('./error-404-DdycNnq4.mjs'));
    const _Error = defineAsyncComponent(() => import('./error-500-CdIuUe_2.mjs'));
    const ErrorTemplate = is404 ? _Error404 : _Error;
    return (_ctx, _push, _parent, _attrs) => {
      _push(ssrRenderComponent(unref(ErrorTemplate), mergeProps({ statusCode: unref(statusCode), statusMessage: unref(statusMessage), description: unref(description), stack: unref(stack) }, _attrs), null, _parent));
    };
  }
};
const _sfc_setup$1 = _sfc_main$1.setup;
_sfc_main$1.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("../node_modules/nuxt/dist/app/components/nuxt-error-page.vue");
  return _sfc_setup$1 ? _sfc_setup$1(props, ctx) : void 0;
};
const _sfc_main = {
  __name: "nuxt-root",
  __ssrInlineRender: true,
  setup(__props) {
    const IslandRenderer = () => null;
    const nuxtApp = useNuxtApp();
    nuxtApp.deferHydration();
    nuxtApp.ssrContext.url;
    const SingleRenderer = false;
    provide(PageRouteSymbol, useRoute());
    nuxtApp.hooks.callHookWith((hooks) => hooks.map((hook) => hook()), "vue:setup");
    const error = /* @__PURE__ */ useError();
    const abortRender = error.value && !nuxtApp.ssrContext.error;
    onErrorCaptured((err, target, info) => {
      nuxtApp.hooks.callHook("vue:error", err, target, info).catch((hookError) => console.error("[nuxt] Error in `vue:error` hook", hookError));
      {
        const p = nuxtApp.runWithContext(() => showError(err));
        onServerPrefetch(() => p);
        return false;
      }
    });
    const islandContext = nuxtApp.ssrContext.islandContext;
    return (_ctx, _push, _parent, _attrs) => {
      ssrRenderSuspense(_push, {
        default: () => {
          if (unref(abortRender)) {
            _push(`<div></div>`);
          } else if (unref(error)) {
            _push(ssrRenderComponent(unref(_sfc_main$1), { error: unref(error) }, null, _parent));
          } else if (unref(islandContext)) {
            _push(ssrRenderComponent(unref(IslandRenderer), { context: unref(islandContext) }, null, _parent));
          } else if (unref(SingleRenderer)) {
            ssrRenderVNode(_push, createVNode(resolveDynamicComponent(unref(SingleRenderer)), null, null), _parent);
          } else {
            _push(ssrRenderComponent(unref(_sfc_main$2), null, null, _parent));
          }
        },
        _: 1
      });
    };
  }
};
const _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("../node_modules/nuxt/dist/app/components/nuxt-root.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};
let entry;
{
  entry = async function createNuxtAppServer(ssrContext) {
    const vueApp = createApp(_sfc_main);
    const nuxt = createNuxtApp({ vueApp, ssrContext });
    try {
      await applyPlugins(nuxt, plugins);
      await nuxt.hooks.callHook("app:created", vueApp);
    } catch (error) {
      await nuxt.hooks.callHook("app:error", error);
      nuxt.payload.error ||= createError(error);
    }
    if (ssrContext?._renderResponse) {
      throw new Error("skipping render");
    }
    return vueApp;
  };
}
const entry$1 = (ssrContext) => entry(ssrContext);

export { _export_sfc as _, useNuxtApp as a, useRuntimeConfig as b, nuxtLinkDefaults as c, entry$1 as default, navigateTo as n, resolveRouteObject as r, useRouter as u };
//# sourceMappingURL=server.mjs.map
