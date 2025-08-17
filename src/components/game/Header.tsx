import { Trophy } from 'lucide-react';
import { format } from 'date-fns';

export function Header({ leagueName }: { leagueName: string }) {
  return (
    <header className="mb-6 pb-4 border-b-2 border-primary/20 md:mb-8 md:pb-6 text-center">
      <div className="flex justify-center items-center gap-2 md:gap-4">
        <Trophy className="w-7 h-7 md:w-12 md:h-12 text-primary" />
        <h1 className="text-3xl md:text-5xl font-bold font-headline text-foreground">
          {leagueName}
        </h1>
      </div>
       <p className="mt-2 text-base md:text-xl font-semibold text-muted-foreground">
        {format(new Date(), "eeee, MMMM do, yyyy")}
      </p>
      <p className="mt-1 text-sm md:text-lg text-muted-foreground">
        Automated Team Draft & Leaderboard
      </p>
    </header>
  );
}
