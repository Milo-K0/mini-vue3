import { ReactiveFlag } from "./reactive";
import { track } from "./effect";
import { trigger } from "./effect";

export const mutableHandlers = {
  get(target, key, receiver) {
    // 取值的时候，让这个属性和effect产生依赖关系
    debugger;
    if (key === target[ReactiveFlag.ISREACTIVE]) return true;
    console.log("be tracked");
    // 做依赖收集，记录属性和当前effect的关系
    track(target, key);
    return Reflect.get(target, key, receiver);
  },
  set(target, key, value, receiver) {
    debugger;
    console.log("be triggered");
    let oldValue = target[key];
    const r = Reflect.set(target, key, value, receiver);
    if (oldValue !== value) {
      trigger(target, key, value, oldValue);
    }
    return r;
  },
};
