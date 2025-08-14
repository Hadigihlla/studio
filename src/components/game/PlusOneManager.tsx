
"use client";

import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Minus, Plus, UserPlus } from "lucide-react";
import type { Toast } from "@/hooks/use-toast";

interface PlusOneManagerProps {
  count: number;
  setCount: (count: number) => void;
  maxGuests: number;
  rosterInCount: number;
  maxPlayersIn: number;
  showToast: (props: Parameters<typeof Toast>[0]) => void;
}

export function PlusOneManager({ 
  count, 
  setCount, 
  maxGuests,
  rosterInCount,
  maxPlayersIn,
  showToast
}: PlusOneManagerProps) {
  
  const handleIncrement = () => {
    if (count < maxGuests) {
      const newCount = count + 1;
      const totalPlayersIfAdded = rosterInCount + newCount;
      if (totalPlayersIfAdded > maxPlayersIn) {
        showToast({
          title: "Heads Up: Waiting List",
          description: `Adding this guest will place them on the waiting list as the game is full.`
        });
      }
      setCount(newCount);
    }
  };

  const handleDecrement = () => {
    if (count > 0) {
      setCount(count - 1);
    }
  };

  return (
    <div>
        <h3 className="text-lg font-semibold flex items-center gap-2 mb-2">
            <UserPlus /> Guest Players
        </h3>
        <div className="flex items-center gap-4 p-4 rounded-lg bg-muted/50 justify-between">
            <Label htmlFor="plus-one-count" className="font-semibold">
                Add guests to the match ({count} / {maxGuests})
            </Label>
            <div className="flex items-center gap-2">
                <Button
                    size="icon"
                    variant="outline"
                    onClick={handleDecrement}
                    disabled={count <= 0}
                    aria-label="Remove guest player"
                >
                    <Minus className="h-4 w-4" />
                </Button>
                <span className="text-xl font-bold w-10 text-center" id="plus-one-count">
                    {count}
                </span>
                <Button
                    size="icon"
                    variant="outline"
                    onClick={handleIncrement}
                    disabled={count >= maxGuests}
                    aria-label="Add guest player"
                >
                    <Plus className="h-4 w-4" />
                </Button>
            </div>
        </div>
        <p className="text-sm text-muted-foreground mt-2">
            Guests are included in the team draft but do not affect league standings. A max of {maxPlayersIn} total players (roster + guests) can be "In" for a match.
        </p>
    </div>
  );
}
