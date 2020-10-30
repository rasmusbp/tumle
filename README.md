# Tumle
### A utility library for reactive animations. Built on top of the native Web Animation API.

> Tumle `[ˈtɔmlə]`: Danish, meaning "to romp" (moving friskly around).

## Concepts
Tumle provides a thin-wrapper around the native Web Animation API that elevates animations on the web closer to the reactive programming paradigm. 

Tumle consists of 3 main building blocks: Animations, Timelines and Actions. 

### Animations
TBD
#### Creating an animation
`createAnimation` is a function that, based on an animation configuration, returns a factory function for future elements to be animated.
```ts
// Signature
createAnimation(
    keyframes: (element: Element) => KeyframeEffect[],
    options?: (element: Element) => KeyframeAnimationOptions
): ReactiveAnimation;
```
```ts
// Example
const scale = (n) => () => [{ transform: `scale(${n})` }];
const fast = () => ({ duration: 250 });
const doubleInSize = createAnimation(scale(2), fast);

const ball = document.querySelector('.ball')
const doubleBallInSize = doubleInSize(element);
```


> ℹ️ [`KeyframeEffect`](https://developer.mozilla.org/en-US/docs/Web/API/KeyframeEffect) and [`KeyframeAnimationOptions`](https://developer.mozilla.org/en-US/docs/Web/API/KeyframeEffectOptions) are objects defined by the native Web Animation API.

As seen above a `ReactiveAnimation` class instance is returned by `createAnimation`. We use this instance to monitor and control the flow of an animation.

`ReactiveAnimation` implements the following interface:

```ts
interface ReactiveAnimation {
    progress$: Observable<AnimationEvent>,
    action$: Observable<Action>
    next(...actions: Action[]): ReactiveAnimation
}
```


```ts
// Example
const click$ = fromEvent(balls, 'click')
const ball$ = click$.pipe(map(event => event.target))
const scale$ = ball$.pipe(
    map(doubleBallInSize), // <- factory to create animation for target
    tap(animation => animation.next(play())),
    take(1)
).subscribe();
```

TBD

### Timelines
A timeline is a collection of animations. It provides the same API as an animation (with a few additional Actions available), but rather than controlling a single animation it controls a collection of animations via a single API.

```ts
// Signature
createTimeline(ReactiveAnimation[]): ReactiveTimeline;
```

`ReactiveTimeline` implements the following interface:

```ts
interface ReactiveTimeline {
    progress$: Observable<AnimationEvent>,
    action$: Observable<Action>
    next(...actions: Action[]): ReactiveTimeline
}
```

TBD

### Actions
TBD
