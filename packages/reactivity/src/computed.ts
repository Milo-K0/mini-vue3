import { isFunction } from "@vue/shared";
import {
  ReactiveEffect,
  trackEffects,
  trigger,
  triggerEffects,
} from "./effect";

class ComputedRefImpl {
  public effect;
  public _value;
  public _dirty = true;
  public dep = new Set();
  constructor(getter, public setter) {
    this.effect = new ReactiveEffect(getter, () => {
      triggerEffects(this.dep);
      if (!this._dirty) {
        this._dirty = true; // 依赖的值变化了 会将dirty变为true
      }
    });
  }
  get value() {
    // 在获取数据时，如果数据在effect中，对其做依赖收集
    trackEffects(this.dep);
    if (this._dirty) {
      this._dirty = false;
      this._value = this.effect.run();
    }
    return this._value;
  }
  set value(newVal) {
    this.setter(newVal);
  }
}
export function computed(getterOrOptions) {
  let getter;
  let setter;
  const isGetter = isFunction(getterOrOptions);
  if (isGetter) {
    getter = getterOrOptions;
    setter = () => {
      console.log("warn");
    };
  } else {
    getter = getterOrOptions.get;
    setter = getterOrOptions.set;
  }
  return new ComputedRefImpl(getter, setter);
}
