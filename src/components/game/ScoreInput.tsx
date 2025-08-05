"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Minus, Plus } from "lucide-react";

interface ScoreInputProps {
  value: number;
  onChange: (value: number) => void;
}

export function ScoreInput({ value, onChange }: ScoreInputProps) {
  const increment = () => onChange(value + 1);
  const decrement = () => onChange(Math.max(0, value - 1));

  const handleManualChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const num = parseInt(e.target.value, 10);
    if (!isNaN(num) && num >= 0) {
      onChange(num);
    } else if (e.target.value === "") {
      onChange(0);
    }
  };

  return (
    <div className="flex items-center gap-2">
      <Button
        size="icon"
        variant="outline"
        className="h-10 w-10"
        onClick={decrement}
        disabled={value === 0}
      >
        <Minus className="h-4 w-4" />
      </Button>
      <Input
        type="number"
        min="0"
        value={value}
        onChange={handleManualChange}
        className="text-center font-bold text-lg w-full"
      />
      <Button size="icon" variant="outline" className="h-10 w-10" onClick={increment}>
        <Plus className="h-4 w-4" />
      </Button>
    </div>
  );
}
