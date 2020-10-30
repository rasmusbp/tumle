import { ReactiveAnimation } from "../animation/reactive-animation";

export type Timeline = ReactiveAnimation[]

export enum ActionTypes {
    PLAY = "play",
    REVERSE = "reverse",
    UPDATE_SPEED = "update_speed",
    UPDATE_TIMING = "update_timing",
    COMMIT = "commit",
    PAUSE = "pause",
    RESUME = "resume",
    FINISH = "finish",
    CANCEL = "cancel",
    SCRUB = "scrub",
    DESTROY = "destroy",
    ATTACH_ANIMATION = "attach_animation",
    RELEASE_ANIMATION = "release_animation",
    REPLACE_EFFECTS = "replace_effects",
}

export type Action = { type: ActionTypes; payload?: any };

export type AnimationEvent = {
    id: string;
    duration: number;
    totalIterations: number;
    iteration: number;
    progress: number;
    state: "idle" | "running" | "paused" | "finished";
    time: number;
}

export type TimelineEvent = {
    progress: number;
    duration: number;
    time: number;
}