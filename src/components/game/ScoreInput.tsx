"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Minus, Plus } from "lucide-react";

interface ScoreInputProps {
  value: number;
  onChange: (value: number) => void;
}

export function ScoreInput({ value, onChange }: ScoreInputProps) {
  const handleIncrement = () => {
    onChange(value + 1);
  };

  const handleDecrement = () => {
    if (value > 0) {
      onChange(value - 1);
    }
  };

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
      {value > 0 && (
        <Button size="icon" variant="outline" onClick={handleDecrement}>
          <Minus className="h-4 w-4" />
        </Button>
      )}
      <Input
        type="number"
        min="0"
        value={value}
        onChange={handleManualChange}
        className="text-center font-bold text-lg w-full"
      />
      <Button size="icon" variant="outline" onClick={handleIncrement}>
        <Plus className="h-4 w-4" />
      </Button>
    </div>
  );
}
