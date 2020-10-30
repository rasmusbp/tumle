import { Timeline } from "../common/models";
import { ReactiveTimeline } from "./reactive-timeline";

export const createTimeline = (timeline: Timeline) => {
  return new ReactiveTimeline(timeline);
};