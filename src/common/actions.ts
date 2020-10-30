import { ReactiveAnimation } from "src/animation/reactive-animation";
import { ActionTypes, Action } from "./models";

const createAction = (type: ActionTypes, payload = null): Action => ({
    type,
    payload
});

export const play = () => createAction(ActionTypes.PLAY);
export const reverse = () => createAction(ActionTypes.REVERSE);
export const pause = () => createAction(ActionTypes.PAUSE);
export const resume = () => createAction(ActionTypes.RESUME);
export const finish = () => createAction(ActionTypes.FINISH);
export const cancel = () => createAction(ActionTypes.CANCEL);
export const destroy = () => createAction(ActionTypes.DESTROY);
export const commit = () => createAction(ActionTypes.COMMIT);
export const scrub = (time: number) => createAction(ActionTypes.SCRUB, time);
export const updateSpeed = (speed: number) => createAction(ActionTypes.UPDATE_SPEED, speed);
export const updateTiming = (options: OptionalEffectTiming) => createAction(ActionTypes.UPDATE_TIMING, options);
export const attachAnimation = (animation: ReactiveAnimation) => createAction(ActionTypes.ATTACH_ANIMATION, animation);
export const releaseAnimation = (animation: ReactiveAnimation) => createAction(ActionTypes.RELEASE_ANIMATION, animation);