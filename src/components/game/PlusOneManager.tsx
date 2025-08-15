
"use client";

import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Minus, Plus, UserPlus } from "lucide-react";
import type { Toast } from "@/hooks/use-toast";
import type { GuestPlayer } from "@/types";

interface PlusOneManagerProps {
  guestPlayers: GuestPlayer[];
  setGuestPlayers: (guests: GuestPlayer[] | ((guests: GuestPlayer[]) => GuestPlayer[])) => void;
  maxGuests: number;
  playersInCount: number;
  maxPlayersIn: number;
  medianPoints: number;
  showToast: (props: Parameters<typeof Toast>[0]) => void;
}

export function PlusOneManager({ 
  guestPlayers,
  setGuestPlayers,
  maxGuests,
  playersInCount,
  maxPlayersIn,
  medianPoints,
  showToast
}: PlusOneManagerProps) {
  
  const handleIncrement = () => {
    if (guestPlayers.length < maxGuests) {
      const currentlyInCount = playersInCount + guestPlayers.filter(g => g.status === 'in').length;
      const isGameFull = currentlyInCount >= maxPlayersIn;
      
      const newGuest: GuestPlayer = {
        id: `guest${Date.now()}`,
        name: `Guest ${guestPlayers.length + 1}`,
        points: medianPoints,
        status: isGameFull ? 'waiting' : 'in',
        matchesPlayed: 0,
        wins: 0,
        draws: 0,
        losses: 0,
        form: [],
        photoURL: `https://placehold.co/40x40.png?text=G${guestPlayers.length + 1}`,
        isGuest: true,
        waitingTimestamp: isGameFull ? Date.now() : null,
      };

      setGuestPlayers(current => [...current, newGuest]);
    }
  };

  const handleDecrement = () => {
    if (guestPlayers.length > 0) {
        const lastGuest = guestPlayers[guestPlayers.length - 1];
        setGuestPlayers(current => current.filter(g => g.id !== lastGuest.id));
    }
  };

  return (
    <div>
        <h3 className="text-lg font-semibold flex items-center gap-2 mb-2">
            <UserPlus /> Guest Players
        </h3>
        <div className="flex items-center gap-4 p-4 rounded-lg bg-muted/50 justify-between">
            <Label htmlFor="plus-one-count" className="font-semibold">
                {guestPlayers.length > 0 ? "Guest Players" : "Add guests to the match"} ({guestPlayers.length} / {maxGuests})
            </Label>
            <div className="flex items-center gap-2">
                <Button
                    size="icon"
                    variant="outline"
                    onClick={handleDecrement}
                    disabled={guestPlayers.length <= 0}
                    aria-label="Remove guest player"
                >
                    <Minus className="h-4 w-4" />
                </Button>
                <span className="text-xl font-bold w-10 text-center" id="plus-one-count">
                    {guestPlayers.length}
                </span>
                <Button
                    size="icon"
                    variant="outline"
                    onClick={handleIncrement}
                    disabled={guestPlayers.length >= maxGuests}
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
