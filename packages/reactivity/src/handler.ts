import { reactive, ReactiveFlag } from "./reactive";
import { track } from "./effect";
import { trigger } from "./effect";
import { isObject } from "@vue/shared";

export const mutableHandlers = {
  get(target, key, receiver) {
    // 取值的时候，让这个属性和effect产生依赖关系
    if (key === ReactiveFlag.ISREACTIVE) return true;
    // 如果在取值的时候，发现需要代理的属性为对象，返回代理后的对象
    if (isObject(target[key])) {
      return reactive(target[key]);
    }
    // 做依赖收集，记录属性和当前effect的关系
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
  },
};
