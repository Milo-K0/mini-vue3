import { isObject } from "@vue/shared";
import { mutableHandlers } from "./handler";

const reactiveProxyMap = new WeakMap();
export const enum ReactiveFlag {
  ISREACTIVE = "is_reactive",
}

export const reactive = function (target) {
  // 判断target是否为对象
  if (!isObject(target)) return target;
  // 判断target是否已经被代理
  if (reactiveProxyMap.get(target)) return target;
  /**
   * 判断target是否为代理某对象的代理
   */
  if (target[ReactiveFlag.ISREACTIVE]) return target;
  // 未被代理则创建代理对象，并将其存入映射中
  const proxy = new Proxy(target, mutableHandlers);
  console.log("already being proxy");
  reactiveProxyMap.set(target, proxy);
  return proxy;
};

// 判断对象是否为响应式对象
export function isReactive(value) {
  return value[ReactiveFlag.ISREACTIVE];
}
