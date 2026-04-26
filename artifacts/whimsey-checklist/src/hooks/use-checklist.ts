import { useState, useEffect, useCallback } from "react";
import { CHECKLIST } from "@/data/checklist";

const STORAGE_KEY = "whimsey-checklist-v1";

export function useChecklist() {
  const [checkedItems, setCheckedItems] = useState<Set<string>>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        return new Set(JSON.parse(stored));
      }
    } catch (e) {
      console.error("Failed to parse checklist from localStorage", e);
    }
    return new Set();
  });

  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    setIsLoaded(true);
  }, []);

  useEffect(() => {
    if (isLoaded) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(Array.from(checkedItems)));
    }
  }, [checkedItems, isLoaded]);

  const toggleItem = useCallback((id: string) => {
    setCheckedItems((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  }, []);

  const resetAll = useCallback(() => {
    setCheckedItems(new Set());
  }, []);

  const getStats = useCallback(() => {
    let total = 0;
    let completed = 0;
    const phaseStats: Record<string, { total: number; completed: number }> = {};
    const stepStats: Record<string, { total: number; completed: number }> = {};

    CHECKLIST.forEach((phase) => {
      phaseStats[phase.id] = { total: 0, completed: 0 };
      phase.steps.forEach((step) => {
        stepStats[step.id] = { total: 0, completed: 0 };
        step.items.forEach((item) => {
          total++;
          phaseStats[phase.id].total++;
          stepStats[step.id].total++;
          if (checkedItems.has(item.id)) {
            completed++;
            phaseStats[phase.id].completed++;
            stepStats[step.id].completed++;
          }
        });
      });
    });

    return { total, completed, phaseStats, stepStats };
  }, [checkedItems]);

  const exportProgress = useCallback(() => {
    const data = {
      version: 1,
      exportedAt: new Date().toISOString(),
      checkedItems: Array.from(checkedItems),
      stats: getStats(),
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `whimsey-checklist-${new Date().toISOString().split("T")[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }, [checkedItems, getStats]);

  const scrollToNextIncomplete = useCallback(() => {
    for (const phase of CHECKLIST) {
      for (const step of phase.steps) {
        for (const item of step.items) {
          if (!checkedItems.has(item.id)) {
            const el = document.getElementById(`step-${step.id}`);
            if (el) {
              el.scrollIntoView({ behavior: "smooth", block: "center" });
              return;
            }
          }
        }
      }
    }
  }, [checkedItems]);

  return {
    checkedItems,
    toggleItem,
    resetAll,
    getStats,
    exportProgress,
    scrollToNextIncomplete,
    isLoaded,
  };
}
