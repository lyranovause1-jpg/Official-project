import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

interface ChecklistItemProps {
  id: string;
  text: string;
  isChecked: boolean;
  onToggle: (id: string) => void;
}

export function ChecklistItem({ id, text, isChecked, onToggle }: ChecklistItemProps) {
  return (
    <motion.button
      layout
      onClick={() => onToggle(id)}
      className={cn(
        "group relative flex w-full items-start gap-4 rounded-xl p-4 text-left transition-all duration-300",
        "hover:bg-white/60 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/50",
        isChecked ? "opacity-60" : "opacity-100"
      )}
    >
      <div className="relative mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center">
        <div
          className={cn(
            "absolute inset-0 rounded-full border-2 transition-colors duration-300",
            isChecked ? "border-primary bg-primary" : "border-muted-foreground/30 bg-white group-hover:border-primary/50"
          )}
        />
        <AnimatePresence>
          {isChecked && (
            <motion.div
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0, opacity: 0 }}
              transition={{ type: "spring", stiffness: 400, damping: 25 }}
            >
              <Check className="h-3.5 w-3.5 text-white" strokeWidth={3} />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <div className="flex-1">
        <span
          className={cn(
            "text-base leading-relaxed transition-all duration-300",
            isChecked ? "text-muted-foreground line-through decoration-muted-foreground/30" : "text-foreground font-medium"
          )}
        >
          {text}
        </span>
      </div>
    </motion.button>
  );
}
