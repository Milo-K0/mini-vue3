// packages/shared/src/index.ts
var isObject = function(obj) {
  return obj !== null && typeof obj === "object";
};

// packages/reactivity/src/effect.ts
var activeEffect = void 0;
var ReactiveEffect = class {
  // 默认会将fn挂载到类的实例上
  constructor(fn, schaduler) {
    this.fn = fn;
    this.schaduler = schaduler;
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
      if (effect2.schaduler) {
        effect2.schaduler();
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
    if (key === target["is_reactive" /* ISREACTIVE */]) return true;
    console.log("be tracked");
    track(target, key);
    return Reflect.get(target, key, receiver);
  },
  set(target, key, value, receiver) {
    console.log("be triggered");
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
export {
  ReactiveFlag,
  activeEffect,
  effect,
  reactive,
  track,
  trigger
};
//# sourceMappingURL=reactivity.js.map
