"use client";

import { Input } from "@/components/ui/input";

interface ScoreInputProps {
  value: number;
  onChange: (value: number) => void;
}

export function ScoreInput({ value, onChange }: ScoreInputProps) {
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
      <Input
        type="number"
        min="0"
        value={value}
        onChange={handleManualChange}
        className="text-center font-bold text-lg w-full"
      />
    </div>
  );
}
