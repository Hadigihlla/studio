import { Trophy } from 'lucide-react';
import { format } from 'date-fns';

export function Header() {
  return (
    <header className="mb-8 pb-6 border-b-2 border-primary/20">
      <div className="flex justify-center items-center gap-3 md:gap-4">
        <Trophy className="w-8 h-8 md:w-12 md:h-12 text-primary" />
        <h1 className="text-4xl md:text-5xl font-bold font-headline text-foreground">
          Gridiron Guru
        </h1>
      </div>
       <p className="mt-4 text-center text-lg md:text-xl font-semibold text-muted-foreground">
        {format(new Date(), "eeee, MMMM do, yyyy")}
      </p>
      <p className="mt-1 text-center text-base md:text-lg text-muted-foreground">
        Weekly Football Team Selections & Leaderboard
      </p>
    </header>
  );
}
