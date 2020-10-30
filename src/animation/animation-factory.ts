import { ReactiveAnimation } from "./reactive-animation";
  
  export const createAnimation = (
    keyframes: ((element: Element) => Keyframe[][]) | Keyframe[][],
    keyframeOptions:
      | ((element: Element) => KeyframeAnimationOptions)
      | KeyframeAnimationOptions = { duration: 250 }
  ) => (element: Element) => {
    const resolvedKeyframes =
      typeof keyframes === "function" ? keyframes(element) : keyframes;
    const resolvedKeyframeOptions =
      typeof keyframeOptions === "function"
        ? keyframeOptions(element)
        : keyframeOptions;
  
    const keyframeEffect = new KeyframeEffect(
      element,
      (resolvedKeyframes as any).flat(),
      resolvedKeyframeOptions
    );
  
    const animation = new Animation(keyframeEffect);
    return new ReactiveAnimation(animation, element);
  };
  