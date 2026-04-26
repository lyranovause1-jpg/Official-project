import React from "react";
import { ChecklistStep as StepType } from "@/data/checklist";
import { ChecklistItem } from "./checklist-item";
import { Badge } from "@/components/ui/badge";
import { Clock, FileText } from "lucide-react";
import { Progress } from "@/components/ui/progress";

interface ChecklistStepProps {
  step: StepType;
  checkedItems: Set<string>;
  onToggleItem: (id: string) => void;
  stats: { total: number; completed: number };
}

export function ChecklistStep({ step, checkedItems, onToggleItem, stats }: ChecklistStepProps) {
  const percentComplete = stats.total > 0 ? Math.round((stats.completed / stats.total) * 100) : 0;
  const isComplete = percentComplete === 100;

  return (
    <div id={`step-${step.id}`} className="mb-6 overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-border/50 transition-all duration-300 hover:shadow-md">
      <div className="border-b border-border/50 bg-gradient-to-r from-background to-white p-5">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="space-y-1.5">
            <h3 className="text-lg font-semibold tracking-tight text-foreground">{step.title}</h3>
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant="secondary" className="bg-blue-50 text-blue-700 hover:bg-blue-100">
                <Clock className="mr-1 h-3 w-3" />
                {step.timeEstimate}
              </Badge>
              <Badge variant="outline" className="bg-purple-50 text-purple-700 hover:bg-purple-100 border-purple-200">
                <FileText className="mr-1 h-3 w-3" />
                {step.docSection}
              </Badge>
            </div>
          </div>
          <div className="flex items-center gap-4 sm:w-32">
            <div className="flex flex-1 items-center gap-2">
              <Progress value={percentComplete} className="h-2" />
            </div>
            <span className="text-xs font-medium text-muted-foreground w-8 text-right">
              {stats.completed}/{stats.total}
            </span>
          </div>
        </div>
      </div>
      <div className="divide-y divide-border/30 p-2 bg-gradient-to-b from-white to-background/30">
        {step.items.map((item) => (
          <ChecklistItem
            key={item.id}
            id={item.id}
            text={item.text}
            isChecked={checkedItems.has(item.id)}
            onToggle={onToggleItem}
          />
        ))}
      </div>
    </div>
  );
}
