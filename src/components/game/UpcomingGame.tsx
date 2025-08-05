"use client"
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar, Clock } from "lucide-react";

export function UpcomingGame() {
  const [nextGame, setNextGame] = useState("Calculating...");

  useEffect(() => {
    const today = new Date();
    const dayOfWeek = today.getDay(); // 0=Sun, 1=Mon, ..., 4=Thu
    const hours = today.getHours();

    let nextGameDay: string;

    if (dayOfWeek < 1) { // Sunday
      nextGameDay = "Monday @ 8:00 PM";
    } else if (dayOfWeek === 1 && hours < 20) { // Monday before 8 PM
      nextGameDay = "This Monday @ 8:00 PM";
    } else if (dayOfWeek >= 1 && dayOfWeek < 4) { // Mon after 8pm, Tue, Wed
      nextGameDay = "This Thursday @ 7:00 PM";
    } else if (dayOfWeek === 4 && hours < 19) { // Thursday before 7 PM
      nextGameDay = "This Thursday @ 7:00 PM";
    } else { // Thu after 7pm, Fri, Sat
      nextGameDay = "Next Monday @ 8:00 PM";
    }
    setNextGame(nextGameDay);
  }, []);

  return (
    <Card className="bg-card/80">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-xl font-headline">
          <Calendar className="w-5 h-5 text-primary" />
          <span>Upcoming Match</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-3xl font-bold flex items-center gap-3">
          <Clock className="w-7 h-7 text-accent" />
          <span>{nextGame}</span>
        </p>
        <p className="text-sm text-muted-foreground mt-2">
          Set your availability below. Selection is 1hr prior to game time.
        </p>
      </CardContent>
    </Card>
  );
}
