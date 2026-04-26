import React from "react";
import { useChecklist } from "@/hooks/use-checklist";
import { CHECKLIST, PROJECT_META } from "@/data/checklist";
import { ChecklistPhase } from "@/components/checklist/checklist-phase";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Download, RefreshCw, Sparkles, ArrowDown } from "lucide-react";
import { Accordion } from "@/components/ui/accordion";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { motion } from "framer-motion";

export default function Home() {
  const { checkedItems, toggleItem, resetAll, getStats, exportProgress, scrollToNextIncomplete, isLoaded } = useChecklist();
  
  if (!isLoaded) return null;

  const stats = getStats();
  const overallPercent = stats.total > 0 ? Math.round((stats.completed / stats.total) * 100) : 0;
  const isAllComplete = stats.completed === stats.total && stats.total > 0;

  return (
    <div className="min-h-[100dvh] w-full px-4 py-8 sm:px-6 lg:px-8 pb-32">
      <div className="mx-auto max-w-4xl space-y-10">
        
        {/* Header Section */}
        <header className="relative overflow-hidden rounded-3xl bg-white p-8 shadow-xl ring-1 ring-border/50 text-center sm:p-12">
          <div className="absolute inset-0 pointer-events-none opacity-40 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-pink-100 via-transparent to-transparent" />
          <div className="absolute inset-0 pointer-events-none opacity-40 bg-[radial-gradient(ellipse_at_bottom_left,_var(--tw-gradient-stops))] from-blue-100 via-transparent to-transparent" />
          
          <motion.div 
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="relative z-10 space-y-6"
          >
            <div className="flex justify-center gap-2 text-2xl">
              {PROJECT_META.brandEmojis.map((emoji, i) => (
                <motion.span 
                  key={i} 
                  initial={{ scale: 0 }} 
                  animate={{ scale: 1 }} 
                  transition={{ delay: i * 0.1, type: "spring" }}
                >
                  {emoji}
                </motion.span>
              ))}
            </div>
            
            <div className="space-y-2">
              <h1 className="font-serif-brand text-4xl text-foreground sm:text-6xl tracking-tight">
                {PROJECT_META.name} Setup
              </h1>
              <p className="text-lg font-medium text-muted-foreground max-w-xl mx-auto">
                Your personal notebook for the next 15 days. Dreamy, soft, and methodical.
              </p>
            </div>

            <div className="inline-flex flex-col items-center justify-center rounded-2xl bg-primary/10 px-6 py-4 shadow-inner ring-1 ring-primary/20">
              <div className="text-3xl font-black text-primary font-serif-brand">T-MINUS {PROJECT_META.daysUntilMint} DAYS</div>
              <div className="text-sm font-bold uppercase tracking-widest text-primary/80">UNTIL MINT</div>
            </div>
          </motion.div>
        </header>

        {/* Global Progress */}
        <section className="sticky top-4 z-40 rounded-3xl bg-white/80 p-6 backdrop-blur-xl shadow-lg ring-1 ring-border/50">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex-1 space-y-2">
              <div className="flex items-end justify-between">
                <div className="space-y-1">
                  <h2 className="text-lg font-bold text-foreground">Launch Readiness</h2>
                  <p className="text-sm font-medium text-muted-foreground">
                    {stats.completed} of {stats.total} tasks completed
                  </p>
                </div>
                <div className="text-2xl font-black text-primary">{overallPercent}%</div>
              </div>
              <Progress value={overallPercent} className="h-4 rounded-full bg-secondary/50" />
            </div>
            
            <div className="flex items-center gap-2 sm:pl-6 border-t sm:border-t-0 sm:border-l border-border/50 pt-4 sm:pt-0">
              <Button onClick={scrollToNextIncomplete} variant="secondary" className="flex-1 sm:flex-none rounded-xl gap-2 font-bold shadow-sm">
                Next <ArrowDown className="h-4 w-4" />
              </Button>
              <Button onClick={exportProgress} variant="outline" size="icon" className="rounded-xl shadow-sm" title="Export Progress">
                <Download className="h-4 w-4" />
              </Button>
              
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="outline" size="icon" className="rounded-xl text-destructive hover:bg-destructive/10 hover:text-destructive shadow-sm" title="Reset All">
                    <RefreshCw className="h-4 w-4" />
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent className="rounded-3xl">
                  <AlertDialogHeader>
                    <AlertDialogTitle>Reset all progress?</AlertDialogTitle>
                    <AlertDialogDescription>
                      This will uncheck all {stats.total} items and wipe your local progress. This action cannot be undone.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel className="rounded-xl">Cancel</AlertDialogCancel>
                    <AlertDialogAction onClick={resetAll} className="rounded-xl bg-destructive hover:bg-destructive/90">
                      Yes, reset everything
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          </div>
        </section>

        {/* Checklist Content */}
        <div className="space-y-8">
          <Accordion type="multiple" defaultValue={CHECKLIST.map(p => p.id)} className="w-full space-y-6">
            {CHECKLIST.map((phase) => (
              <ChecklistPhase
                key={phase.id}
                phase={phase}
                checkedItems={checkedItems}
                onToggleItem={toggleItem}
                phaseStats={stats.phaseStats[phase.id]}
                stepStats={stats.stepStats}
              />
            ))}
          </Accordion>
        </div>

        {/* Completion State */}
        {isAllComplete && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex flex-col items-center justify-center rounded-3xl bg-gradient-to-br from-primary/20 via-accent/20 to-secondary/20 p-12 text-center shadow-xl ring-1 ring-primary/30"
          >
            <div className="mb-6 flex h-24 w-24 items-center justify-center rounded-full bg-white shadow-xl">
              <Sparkles className="h-12 w-12 text-primary" />
            </div>
            <h2 className="font-serif-brand text-4xl text-foreground mb-4">You are ready.</h2>
            <p className="text-lg font-medium text-muted-foreground">
              All tasks complete. The server is locked down, bots are armed, and momentum is tracking. Time to launch {PROJECT_META.name}.
            </p>
          </motion.div>
        )}
      </div>
    </div>
  );
}
