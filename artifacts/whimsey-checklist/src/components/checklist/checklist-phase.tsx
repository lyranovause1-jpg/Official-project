import React from "react";
import { ChecklistPhase as PhaseType } from "@/data/checklist";
import { ChecklistStep } from "./checklist-step";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Progress } from "@/components/ui/progress";

interface ChecklistPhaseProps {
  phase: PhaseType;
  checkedItems: Set<string>;
  onToggleItem: (id: string) => void;
  phaseStats: { total: number; completed: number };
  stepStats: Record<string, { total: number; completed: number }>;
}

export function ChecklistPhase({ phase, checkedItems, onToggleItem, phaseStats, stepStats }: ChecklistPhaseProps) {
  const percentComplete = phaseStats.total > 0 ? Math.round((phaseStats.completed / phaseStats.total) * 100) : 0;

  return (
    <AccordionItem value={phase.id} className="border-none mb-8">
      <AccordionTrigger className="group rounded-3xl bg-white p-6 shadow-sm ring-1 ring-border/50 hover:no-underline hover:shadow-md transition-all data-[state=open]:rounded-b-none data-[state=open]:shadow-md">
        <div className="flex w-full flex-col gap-4 text-left sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-4">
            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-primary/10 text-3xl shadow-inner">
              {phase.emoji}
            </div>
            <div>
              <h2 className="text-2xl font-extrabold text-foreground sm:text-3xl">{phase.title}</h2>
              <p className="text-sm font-medium text-muted-foreground mt-1">{phase.subtitle}</p>
            </div>
          </div>
          
          <div className="flex w-full max-w-xs items-center gap-4 pr-4">
            <div className="flex-1 space-y-1.5">
              <div className="flex justify-between text-xs font-semibold text-muted-foreground">
                <span>{percentComplete}%</span>
                <span>{phaseStats.completed} / {phaseStats.total}</span>
              </div>
              <Progress value={percentComplete} className="h-2.5 rounded-full" />
            </div>
          </div>
        </div>
      </AccordionTrigger>
      
      <AccordionContent className="rounded-b-3xl bg-white/40 p-6 pt-8 backdrop-blur-xl ring-1 ring-border/50 border-t-0">
        <div className="space-y-2">
          {phase.steps.map((step) => (
            <ChecklistStep
              key={step.id}
              step={step}
              checkedItems={checkedItems}
              onToggleItem={onToggleItem}
              stats={stepStats[step.id] || { total: 0, completed: 0 }}
            />
          ))}
        </div>
      </AccordionContent>
    </AccordionItem>
  );
}
