import {
    animationFrameScheduler,
    fromEvent,
    interval,
    merge
} from "rxjs";
import {
    delay, distinctUntilChanged, endWith, filter, finalize, map,
    mapTo,
    mergeMap,
    startWith, switchMap,
    take,
    takeUntil, takeWhile, tap
} from "rxjs/operators";
import {
    attachAnimation,
    cancel, commit, createAnimation,
    createTimeline, destroy, finish, pause, play,
    releaseAnimation,
    resume, reverse,
    scrub,
    updateSpeed
} from "@kredo/tumle";
  
  
  const scale = (x: number, y = x) => [{ transform: `scale(${x},${y})` }];
  const offsetDistance = () => [
      { 'offsetDistance': '0%' },
      { 'offsetDistance': '100%' },
];
  
  const translate = (x: string, y: string) => [
    { transform: `translateX(${x}) translateY(${y})` }
  ];

  const particle = createAnimation(
    () => {
        const x = Math.round(Math.random()) ? (Math.random()*500)+'px' : -(Math.random()*500)+'px';
        const y = Math.round(Math.random()) ? (Math.random()*500)+'px' : -(Math.random()*500)+'px';
        return [
            [
                { opacity: 1, transform: `translateX(0) translateY(0)` },
                { opacity: 0, transform: `translateX(${x}) translateY(${y})` },
            ]
        ];
    },
    () => ({
      duration: 10000,
      iterations: 1,
      fill: "forwards",
    //  delay: Math.round(Math.random() * 2000)
      //easing: 'cubic-bezier(.75,-0.5,0,1.75)'
    })
  );
  
  const drop = createAnimation(
    () => [offsetDistance()],
    () => ({
      duration: 1000,
      iterations: 1,
      fill: "both",
      //easing: 'cubic-bezier(.75,-0.5,0,1.75)'
    })
  );

  const zoom = createAnimation(
    () => [scale(1), scale(1.5), scale(1)],
    () => ({
      duration: 1000,
      iterations: 1,
      fill: "forwards",
      composite: 'replace',
      easing: 'cubic-bezier(.75, -0.2, 0, 1.20)'
    })
  );
  
  const tinyBall = document.querySelector('.tiny-ball');
  const spawner = document.querySelector('.spawner');

  const start = document.querySelector(".start");
  const spawn = document.querySelector(".spawn");
  const despawn = document.querySelector(".despawn");
  const finishBtn = document.querySelector(".finish");
  const pauseBtn = document.querySelector(".pause");
  const resumeBtn = document.querySelector(".resume");
  const cancelBtn = document.querySelector(".cancel");
  const reverseBtn = document.querySelector(".reverse");
  const scrubSl = document.querySelector(".scrub");
  const speedSl = document.querySelector(".speed");
  const destroyBtn = document.querySelector(".destroy");
  
  const ball = document.querySelector(".ball");
  const square = document.querySelector(".square");
  
  const startClick$ = fromEvent(start, "click");
  const spawnClick$ = fromEvent(spawn, "click");
  const despawnClick$ = fromEvent(despawn, "click");
  const finishClick$ = fromEvent(finishBtn, "click");
  const pauseClick$ = fromEvent(pauseBtn, "click");
  const resumeClick$ = fromEvent(resumeBtn, "click");
  const cancelClick$ = fromEvent(cancelBtn, "click");
  const reverseClick$ = fromEvent(reverseBtn, "click");
  const destroyClick$ = fromEvent(destroyBtn, "click");
  
  const scrubDown$ = fromEvent(scrubSl, "mousedown");
  const scrubUp$ = fromEvent(scrubSl, "mouseup");
  const scrubValues$ = fromEvent(scrubSl, "input").pipe(
    map(event => parseInt((event.target as any).value, 10) / 100)
  );
  
  const speedValues$ = fromEvent(speedSl, "input").pipe(
    map(event => parseInt((event.target as any).value, 10))
  );
  
  const dropBall = drop(ball);
  const zoomSquare = zoom(square);
  
  const timeline = createTimeline([dropBall, zoomSquare]);

  
  const start$ = startClick$.pipe(mapTo([updateSpeed(1), play()]));
  const pause$ = pauseClick$.pipe(mapTo([pause()]));
  const finish$ = finishClick$.pipe(mapTo([finish()]));
  const cancel$ = cancelClick$.pipe(mapTo([cancel()]));
  const destroy$ = destroyClick$.pipe(mapTo([destroy()]));
  const resume$ = resumeClick$.pipe(mapTo([resume()]));
  const reverse$ = reverseClick$.pipe(mapTo([reverse()]));
  
  const scrub$ = scrubDown$.pipe(
    switchMap(() =>
      scrubValues$.pipe(
        map(n => [scrub(n)]),
        startWith([pause()]),
        takeUntil(scrubUp$),
        endWith([resume()])
      )
    )
  );

  const pool = Array(100).fill(null).map(() => tinyBall.cloneNode(true))

  
  const spawn$ = spawnClick$.pipe(
    takeWhile(() => !!pool.length),
    map(() => pool.pop()),
    tap(node => spawner.appendChild(node)),
    map(particle),
    tap(a => timeline.next(attachAnimation(a))),
  //  tap(a => a.next(play())),
    mergeMap(a => {
        return despawnClick$.pipe(
            tap(() => timeline.next(releaseAnimation(a))),
        //    tap(() => a.element.remove()),
            tap(() => pool.unshift(a.element))
        )
    })
  )
  
  spawn$.subscribe()
  
  const speed$ = speedValues$.pipe(map(n => [updateSpeed(n)]));
  
  merge(
    start$,
    pause$,
    resume$,
    finish$,
    reverse$,
    scrub$,
    speed$,
    cancel$,
    destroy$
  )
.pipe(tap(e => timeline.next(...e)))
.subscribe();

timeline.progress$.pipe(
    map(({ progress }) => Math.ceil(progress * 100)),
    distinctUntilChanged()
).subscribe((percent) => {
    (scrubSl as any).value = percent;
});

// timeline.progress$.pipe(
//     filter(({ progress }) => progress >  0.3),
//     tap(({ progress}) => console.log(progress)),
//     tap(() => timeline.next(commit(), cancel()))
// ).subscribe()

//timeline.action$.subscribe(console.log);