export let activeEffect = undefined;

class ReactiveEffect {
  // 默认会将fn挂载到类的实例上
  constructor(private fn) {}
  parent = undefined;
  deps = [];
  run() {
    try {
      debugger;
      parent = activeEffect;
      activeEffect = this;
      cleanupEffect(this);
      return this.fn();
    } finally {
      activeEffect = this.parent;
    }
  }
}

export function effect(fn) {
  debugger;
  const _effect = new ReactiveEffect(fn);
  _effect.run();
}

// weakMap -> map -> set(一个effect中有两个属性无需添加两次(去重))
// {name: 'mdk',age: 18} : name -> [effect,effect]
//                         age -> [effect]
const targetMap = new WeakMap();
export function track(target, key) {
  debugger;
  // 让这个对象上的属性，记录当前的activeEffect
  if (activeEffect) {
    // 说明用户是在effect中使用的这个数据
    let depsMap = targetMap.get(target);
    if (!depsMap) {
      targetMap.set(target, (depsMap = new Map()));
    }
    let dep = depsMap.get(target);
    if (!dep) {
      depsMap.set(key, (dep = new Set()));
    }
    if (!dep.has(activeEffect)) {
      dep.add(activeEffect);
      activeEffect.deps.push(dep);
    }
  }
}
export function trigger(target, key, newValue, oldValue) {
  debugger;
  // 通过对象找到对应的属性，让这个属性对应的effect重新执行
  const depsMap = targetMap.get(target);
  if (!depsMap) {
    return;
  }
  const dep = depsMap.get(key); // name 或者 age对应的所有effect
  const effects = [...dep];
  effects &&
    effects.forEach((effect) => {
      // 正在执行的effect，不要执行多次
      if (effect !== activeEffect) effect.run();
    });
}

const cleanupEffect = function (effect) {
  const { deps } = effect;
  for (let i = 0; i < deps.length; i++) {
    // 找到set, 让set 移除掉自己
    deps[i].delete(effect);
  }
  effect.deps.length = 0;
};
