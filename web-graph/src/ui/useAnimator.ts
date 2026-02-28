'use client';

import { useState, useRef, useCallback, useEffect } from 'react';
import type { StepFrame } from '../algorithms/types';

export type AnimatorState = 'idle' | 'playing' | 'paused' | 'done';

export interface AnimatorControls {
  state: AnimatorState;
  currentIndex: number;
  frameCount: number;
  progress: number;                  // 0–1
  currentFrame: StepFrame | null;
  speed: number;                     // ms per frame
  load: (frames: StepFrame[]) => void;
  play: () => void;
  pause: () => void;
  stop: () => void;
  stepForward: () => void;
  stepBack: () => void;
  setSpeed: (ms: number) => void;
}

/**
 * Manages playback of a StepFrame[] array. Fires onFrame(frame, index)
 * on every step so Cytoscape can apply the appropriate styles.
 */
export function useAnimator(
  onFrame: (frame: StepFrame, index: number) => void,
): AnimatorControls {
  const [state, setState]               = useState<AnimatorState>('idle');
  const [currentIndex, setCurrentIndex] = useState(-1);
  const [frameCount, setFrameCount]     = useState(0);
  const [speed, setSpeedState]          = useState(800);

  const framesRef  = useRef<StepFrame[]>([]);
  const indexRef   = useRef(-1);       // mirror of currentIndex for use inside timer
  const stateRef   = useRef<AnimatorState>('idle');
  const speedRef   = useRef(800);
  const timerRef   = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Keep refs in sync with state so timer callbacks always see latest values
  useEffect(() => { stateRef.current = state; }, [state]);

  const clearTimer = useCallback(() => {
    if (timerRef.current !== null) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  const applyFrame = useCallback((index: number) => {
    const frame = framesRef.current[index];
    if (!frame) return;
    indexRef.current = index;
    setCurrentIndex(index);
    onFrame(frame, index);
  }, [onFrame]);

  const tick = useCallback(() => {
    if (stateRef.current !== 'playing') return;
    const next = indexRef.current + 1;
    if (next >= framesRef.current.length) {
      setState('done');
      stateRef.current = 'done';
      return;
    }
    applyFrame(next);
    timerRef.current = setTimeout(tick, speedRef.current);
  }, [applyFrame]);

  const load = useCallback((frames: StepFrame[]) => {
    clearTimer();
    framesRef.current = frames;
    indexRef.current  = -1;
    setCurrentIndex(-1);
    setFrameCount(frames.length);
    setState('idle');
    stateRef.current = 'idle';
  }, [clearTimer]);

  const play = useCallback(() => {
    if (stateRef.current === 'done') return;
    if (indexRef.current >= framesRef.current.length - 1) return;
    setState('playing');
    stateRef.current = 'playing';
    timerRef.current = setTimeout(tick, speedRef.current);
  }, [tick]);

  const pause = useCallback(() => {
    clearTimer();
    setState('paused');
    stateRef.current = 'paused';
  }, [clearTimer]);

  const stop = useCallback(() => {
    clearTimer();
    framesRef.current = [];
    indexRef.current  = -1;
    setCurrentIndex(-1);
    setFrameCount(0);
    setState('idle');
    stateRef.current = 'idle';
  }, [clearTimer]);

  const stepForward = useCallback(() => {
    clearTimer();
    const next = indexRef.current + 1;
    if (next >= framesRef.current.length) return;
    applyFrame(next);
    const isDone = next === framesRef.current.length - 1;
    setState(isDone ? 'done' : 'paused');
    stateRef.current = isDone ? 'done' : 'paused';
  }, [clearTimer, applyFrame]);

  const stepBack = useCallback(() => {
    clearTimer();
    const target = indexRef.current - 1;
    if (target < 0) {
      indexRef.current = -1;
      setCurrentIndex(-1);
      setState('idle');
      stateRef.current = 'idle';
      // Signal caller to reset styles with index -1
      onFrame({ activeNodes: [], visitedNodes: [], activeEdges: [], pathEdges: [], category: 'init' }, -1);
      return;
    }
    // Replay from scratch to target to get correct visual state
    for (let i = 0; i <= target; i++) {
      applyFrame(i);
    }
    setState('paused');
    stateRef.current = 'paused';
  }, [clearTimer, applyFrame, onFrame]);

  const setSpeed = useCallback((ms: number) => {
    speedRef.current = ms;
    setSpeedState(ms);
  }, []);

  const progress = frameCount === 0 ? 0 : (currentIndex + 1) / frameCount;
  const currentFrame = currentIndex >= 0 ? framesRef.current[currentIndex] ?? null : null;

  return {
    state, currentIndex, frameCount, progress, currentFrame, speed,
    load, play, pause, stop, stepForward, stepBack, setSpeed,
  };
}