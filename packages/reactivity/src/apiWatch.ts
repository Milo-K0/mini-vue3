import { isReactive } from "./reactive";
import { isFunction, isObject } from "@vue/shared";
import { ReactiveEffect } from "./effect";

// = 深拷贝， seen防止死循环
function traverse(value, seen = new Set()) {
  if (!isObject(value)) return value;
  // 如果已经循环了这个对象，不反回会造成死循环
  if (seen.has(value)) return value;
  seen.add(value);
  for (const key in value) {
    traverse(value[key], seen); // 触发属性的getter
  }
  return value;
}

export function doWatch(source, cb, options) {
  // 1) source是一个响应式对象
  // 2) source是一个函数
  let getter;
  if (isReactive(source)) {
    getter = () => traverse(source);
  } else if (isFunction(source)) {
    getter = source;
  }
  let oldVal;
  // 里面的属性就会收集当前的effect
  // 如果数据变化后会执行对应的scheduler
  let clear;
  let onCleanup = (fn) => {
    clear = fn;
  };
  const job = () => {
    if (cb) {
      if (clear) clear(); // 下次执行时将上一次设定清理函数执行以下
      const newVal = effect.run();
      cb(newVal, oldVal, onCleanup);
      oldVal = newVal;
    } else {
      effect.run(); // watchEffect 只需要直接运行就可以了
    }
  };
  const effect = new ReactiveEffect(getter, job);
  // 创建effect后立即执行
  oldVal = effect.run(); // 会让属性和effect关联在一起
}

export function watch(source, cb, options) {
  return doWatch(source, cb, options);
}

export function watchEffect(source, options) {
  return doWatch(source, null, options);
}
