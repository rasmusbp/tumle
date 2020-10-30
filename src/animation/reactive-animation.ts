import { ReplaySubject, Subject } from "rxjs";
import { distinctUntilKeyChanged, map, switchMap, switchMapTo, takeUntil } from "rxjs/operators";
import { Action, ActionTypes, AnimationEvent } from "../common/models";
import { calculateIteration, calculateProgress, ofTypes, tick$ } from "../common/utils";

export class ReactiveAnimation {
    private actionStream = new ReplaySubject<Action>(1);
    private get timing() {
      return this.animation.effect.getTiming();
    }
    public get duration() {
      const timing = this.timing;
      return timing.delay + parseInt(timing.duration as string, 10);
    }
    public get iterations() {
        const timing = this.timing;
        return timing.iterations;
    }
    public readonly action$ = this.actionStream.asObservable();
    private destroySubject = new Subject()

    private startEvent: Partial<AnimationEvent> = {
        id: this.animation.id || null,
        duration: this.duration,
        totalIterations: this.timing.iterations,
        iteration: 1,
        progress: 0,
        state: "idle"
    };

    private destroy() {
        this.actionStream.complete();
        this.destroySubject.next();
        this.destroySubject.complete();
    }
    
    constructor(private animation: Animation, public element: Element) {
      this.action$.subscribe(event => this.actionHandler(event));
    }
    // TODO: How to "pause" ticks emitting when animation is idle? 
    public progress$ = this.action$.pipe(
        ofTypes(ActionTypes.PLAY, ActionTypes.SCRUB),
        switchMapTo(tick$.pipe(
            map(() => {
              const time = this.animation.currentTime;
              const relativeTime = time / this.duration;
              const iteration = calculateIteration(relativeTime);
              return {
                ...this.startEvent,
                iteration,
                progress:
                  time === null || time <= 0
                    ? 0
                    : calculateProgress(relativeTime, iteration),
                time,
                state: this.animation.playState
              } as AnimationEvent
            }),
            distinctUntilKeyChanged("progress"),
        )),
        takeUntil(this.destroySubject)
    )

    private actionHandler({ type, payload }: Action)  {
        switch (type) {
          case ActionTypes.PLAY:
            this.animation.play();
            break;
          case ActionTypes.PAUSE:
            this.animation.pause();
            break;
          case ActionTypes.RESUME: {
            if (this.animation.playState === "paused") {
              this.animation.play();
            }
            break;
          }
          case ActionTypes.SCRUB: {
            const iteration = calculateIteration(payload);
            const progress = calculateProgress(payload, iteration);
            this.animation.currentTime = progress * this.duration;
            break;
          }
          case ActionTypes.REVERSE: {
            this.animation.updatePlaybackRate(this.animation.playbackRate * -1);
            if (this.animation.playState !== "running") {
              this.animation.play();
            }
            break;
          }
          case ActionTypes.UPDATE_SPEED: {
            this.animation.updatePlaybackRate(payload);
            break;
          }
          case ActionTypes.UPDATE_TIMING: {
            this.animation.effect.updateTiming(payload);
            break;
          }
          case ActionTypes.FINISH:
            this.animation.finish();
            break;
          case ActionTypes.CANCEL:
            this.animation.cancel();
            break;
          case ActionTypes.COMMIT: 
            try {
              (this.animation as any).commitStyles();
            } catch(e) {}
            break;
          case ActionTypes.DESTROY:
            this.animation.cancel();
            this.destroy();
            break;
        }
    }
      
    next(...actions: Action[]) {
      if (this.destroySubject.isStopped) {
        console.error(`Animation is destroyed. Cannot execute actions '${actions.map(({type}) => type).join(', ')}'.`)
        return this;
      }
      actions.forEach(action => this.actionStream.next(action));
      return this;
    }
  }
  