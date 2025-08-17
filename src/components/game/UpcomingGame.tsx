"use client"
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar, Clock, MapPin } from "lucide-react";

export function UpcomingGame({ location }: { location: string }) {
  const [nextGameDate, setNextGameDate] = useState("Calculating...");

  useEffect(() => {
    const today = new Date();
    const dayOfWeek = today.getDay(); // 0=Sun, 1=Mon, ..., 4=Thu
    const hours = today.getHours();

    let nextGameDay: string;

    // Monday 8 PM game
    if (dayOfWeek < 1 || (dayOfWeek === 1 && hours < 20)) { 
      nextGameDay = "This Monday @ 8:00 PM";
    } 
    // Thursday 7 PM game
    else if (dayOfWeek < 4 || (dayOfWeek === 4 && hours < 19)) { 
      nextGameDay = "This Thursday @ 7:00 PM";
    }
    // Next week's Monday game
    else { 
      nextGameDay = "Next Monday @ 8:00 PM";
    }
    setNextGameDate(nextGameDay);
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
          <span>{nextGameDate}</span>
        </p>
         <p className="text-md text-muted-foreground mt-2 flex items-center gap-2">
          <MapPin className="w-4 h-4" /> {location}
        </p>
        <p className="text-sm text-muted-foreground mt-2">
          Set your availability below. Selection is 1hr prior to game time.
        </p>
      </CardContent>
    </Card>
  );
}
