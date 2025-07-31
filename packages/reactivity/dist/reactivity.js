// packages/shared/src/index.ts
var isObject = function(obj) {
  return obj !== null && typeof obj === "object";
};
var isFunction = function(obj) {
  return typeof obj === "function";
};

// packages/reactivity/src/effect.ts
var activeEffect = void 0;
var ReactiveEffect = class {
  // 默认会将fn挂载到类的实例上
  constructor(fn, scheduler) {
    this.fn = fn;
    this.scheduler = scheduler;
    this.parent = void 0;
    this.deps = [];
    this.active = true;
  }
  run() {
    if (!this.active) {
      return this.run();
    }
    try {
      parent = activeEffect;
      activeEffect = this;
      cleanupEffect(this);
      return this.fn();
    } finally {
      activeEffect = this.parent;
    }
  }
  stop() {
    this.active = false;
    cleanupEffect(this);
  }
};
function effect(fn, option = {}) {
  const _effect = new ReactiveEffect(fn, option);
  _effect.run();
  const runner = _effect.run.bind(_effect);
  runner.effect = _effect;
  return runner;
}
var targetMap = /* @__PURE__ */ new WeakMap();
function track(target, key) {
  if (activeEffect) {
    let depsMap = targetMap.get(target);
    if (!depsMap) {
      targetMap.set(target, depsMap = /* @__PURE__ */ new Map());
    }
    let dep = depsMap.get(target);
    if (!dep) {
      depsMap.set(key, dep = /* @__PURE__ */ new Set());
    }
    if (!dep.has(activeEffect)) {
      dep.add(activeEffect);
      activeEffect.deps.push(dep);
    }
  }
}
function trigger(target, key, newValue, oldValue) {
  const depsMap = targetMap.get(target);
  if (!depsMap) {
    return;
  }
  const dep = depsMap.get(key);
  const effects = [...dep];
  effects && effects.forEach((effect2) => {
    if (effect2 !== activeEffect) {
      if (effect2.scheduler) {
        effect2.scheduler();
      }
      effect2.run();
    }
  });
}
var cleanupEffect = function(effect2) {
  const { deps } = effect2;
  for (let i = 0; i < deps.length; i++) {
    deps[i].delete(effect2);
  }
  effect2.deps.length = 0;
};

// packages/reactivity/src/handler.ts
var mutableHandlers = {
  get(target, key, receiver) {
    if (key === "is_reactive" /* ISREACTIVE */) return true;
    if (isObject(target[key])) {
      return reactive(target[key]);
    }
    track(target, key);
    return Reflect.get(target, key, receiver);
  },
  set(target, key, value, receiver) {
    let oldValue = target[key];
    const r = Reflect.set(target, key, value, receiver);
    if (oldValue !== value) {
      trigger(target, key, value, oldValue);
    }
    return r;
  }
};

// packages/reactivity/src/reactive.ts
var reactiveProxyMap = /* @__PURE__ */ new WeakMap();
var ReactiveFlag = /* @__PURE__ */ ((ReactiveFlag2) => {
  ReactiveFlag2["ISREACTIVE"] = "is_reactive";
  return ReactiveFlag2;
})(ReactiveFlag || {});
var reactive = function(target) {
  if (!isObject(target)) return target;
  if (reactiveProxyMap.get(target)) return target;
  if (target["is_reactive" /* ISREACTIVE */]) return target;
  const proxy = new Proxy(target, mutableHandlers);
  console.log("already being proxy");
  reactiveProxyMap.set(target, proxy);
  return proxy;
};
function isReactive(value) {
  return value["is_reactive" /* ISREACTIVE */];
}

// packages/reactivity/src/apiWatch.ts
function traverse(value, seen = /* @__PURE__ */ new Set()) {
  if (!isObject(value)) return value;
  if (seen.has(value)) return value;
  seen.add(value);
  for (const key in value) {
    traverse(value[key], seen);
  }
  return value;
}
function doWatch(source, cb, options) {
  let getter;
  if (isReactive(source)) {
    getter = () => traverse(source);
  } else if (isFunction(source)) {
    getter = source;
  }
  let oldVal;
  let clear;
  let onCleanup = (fn) => {
    clear = fn;
  };
  const job = () => {
    if (cb) {
      if (clear) clear();
      const newVal = effect2.run();
      cb(newVal, oldVal, onCleanup);
      oldVal = newVal;
    } else {
      effect2.run();
    }
  };
  const effect2 = new ReactiveEffect(getter, job);
  oldVal = effect2.run();
}
function watch(source, cb, options) {
  return doWatch(source, cb, options);
}
function watchEffect(source, options) {
  return doWatch(source, null, options);
}
export {
  ReactiveEffect,
  ReactiveFlag,
  activeEffect,
  doWatch,
  effect,
  isReactive,
  reactive,
  track,
  trigger,
  watch,
  watchEffect
};
//# sourceMappingURL=reactivity.js.map
