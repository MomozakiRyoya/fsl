"use client";

import { useState, useEffect, useCallback } from "react";

export type FanAction =
  | "winner_vote"
  | "mvp_vote"
  | "match_predict"
  | "cheer_comment"
  | "team_follow";

export interface PointEvent {
  action: FanAction;
  amount: number;
  ts: number;
}

const STORAGE_KEY = "fsl-fan-points";

function loadHistory(): PointEvent[] {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) return JSON.parse(stored) as PointEvent[];
  } catch {
    /* ignore */
  }
  return [];
}

function saveHistory(history: PointEvent[]) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(history));
  } catch {
    /* ignore */
  }
}

export function useFanPoints() {
  const [pointHistory, setPointHistory] = useState<PointEvent[]>([]);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    setPointHistory(loadHistory());
  }, []);

  const addPoints = useCallback((action: FanAction, amount: number) => {
    const event: PointEvent = { action, amount, ts: Date.now() };
    setPointHistory((prev) => {
      const updated = [...prev, event];
      saveHistory(updated);
      return updated;
    });
  }, []);

  const totalPoints = pointHistory.reduce((sum, e) => sum + e.amount, 0);

  const hasAction = useCallback(
    (action: FanAction) => pointHistory.some((e) => e.action === action),
    [pointHistory],
  );

  return { totalPoints, pointHistory, addPoints, hasAction, mounted };
}
