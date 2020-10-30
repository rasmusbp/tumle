import { animationFrameScheduler, interval } from "rxjs";
import { filter, share, tap } from "rxjs/operators";
import { ActionTypes, Action } from "./models";

export const tick$ = interval(0, animationFrameScheduler).pipe(
  tap(n => console.log(n)),
    share(),
);

export function ofTypes(...types: ActionTypes[]) {
    return filter((e: Action) => types.includes(e.type));
}

export function notOfTypes(...types: ActionTypes[]) {
    return filter((e: Action) => !types.includes(e.type));
  }
export function calculateProgress(relativeTime: number, iteration: number) {
  return relativeTime - (iteration - 1);
};

export function calculateIteration (relativeTime: number) {
  return Math.ceil(relativeTime);
};