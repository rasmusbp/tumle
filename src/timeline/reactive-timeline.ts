import { defer, merge, Observable, ReplaySubject, Subject } from "rxjs";
import { distinctUntilKeyChanged, scan, startWith, switchMap, takeUntil, withLatestFrom } from "rxjs/operators";
import { ReactiveAnimation } from "../animation/reactive-animation";
import { notOfTypes, ofTypes } from "../common/utils";
import { Action, ActionTypes, Timeline, TimelineEvent } from "../common/models";

export class ReactiveTimeline {
    private actionStream = new ReplaySubject<Action>(1);
    private readonly timelineStream = new Subject<Action>();
    private readonly timeline$!: Observable<Timeline>
    private destroySubject = new Subject();
    
    public readonly action$ = this.actionStream.asObservable();
    public readonly duration!: number;

    private forwardAction(timeline: Timeline, action: Action) {
        timeline.forEach((anim) => anim.next(action));
    }

    private destroy() {
        this.actionStream.complete();
        this.timelineStream.complete();
        this.destroySubject.next();
        this.destroySubject.complete();
    }

    private calculateDuration(timeline: Timeline) {
        return Math.max(
            ...timeline.map((animation) => {
                return animation.duration * animation.iterations
            })
        );
    }

    constructor(private timeline: Timeline = []) {
        const clonedTimeline = [...this.timeline] as Timeline;

        this.timeline$ = this.timelineStream.pipe(
            scan((acc, { type, payload }) => {
                if (type === ActionTypes.ATTACH_ANIMATION) {
                    return [...acc, payload];
                } else {
                    acc.splice(acc.indexOf(payload), 1);
                    return acc;
                }
            }, clonedTimeline),
            startWith(clonedTimeline)
        );

        this.action$.pipe(
            ofTypes(ActionTypes.ATTACH_ANIMATION, ActionTypes.RELEASE_ANIMATION)
        ).subscribe((action) => {
            this.timelineStream.next(action);
        })

        this.action$.pipe(
            notOfTypes(ActionTypes.ATTACH_ANIMATION, ActionTypes.RELEASE_ANIMATION),
            withLatestFrom(this.timeline$)
        ).subscribe(([action, timeline]) => {
            this.forwardAction(timeline, action)
            if (action.type === ActionTypes.DESTROY) {
                this.destroy();
            }
        });
    }

    public readonly progress$ = defer(() => this.timeline$.pipe(
        switchMap(animations => {
            const duration =  this.calculateDuration(animations);
            return merge(...animations.map(({ progress$ }) => progress$)).pipe(
                scan((acc, event) => ({
                    ...acc,
                    duration,
                    time: event.time || 0,
                    progress: event.time / duration
                }), { progress: 0, time: 0, duration: duration } as TimelineEvent),
                distinctUntilKeyChanged("progress"),
                takeUntil(this.destroySubject)
            )
        }
        ))
    )

    next(...actions: Action[]) {
        if (this.destroySubject.isStopped) {
            console.error(`Timeline is destroyed. Cannot execute actions '${actions.map(({ type }) => type).join(', ')}'.`)
            return this;
        }
        actions.forEach(action => this.actionStream.next(action));
        return this;
    }
}