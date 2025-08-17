
"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Target } from "lucide-react";

interface SeasonProgressProps {
  current: number;
  total: number;
}

export function SeasonProgress({ current, total }: SeasonProgressProps) {
  const percentage = total > 0 ? (current / total) * 100 : 0;
  const isComplete = current >= total;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-xl font-headline">
          <Target className="w-5 h-5 text-primary" />
          <span>Season Progress</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
            <Progress value={percentage} />
            <p className="text-sm text-muted-foreground text-center">
                {isComplete ? (
                    <span className="font-bold text-primary">Season Complete!</span>
                ) : (
                    `Match ${current} of ${total}`
                )}
            </p>
        </div>
      </CardContent>
    </Card>
  );
}
