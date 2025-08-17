
"use client"

import { useEffect, useState, useRef } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import type { Player } from "@/types"

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"
import { User, Upload } from "lucide-react"

interface PlayerDialogProps {
  isOpen: boolean
  onOpenChange: (isOpen: boolean) => void
  onSave: (playerData: Omit<Player, 'status' | 'form' | 'waitingTimestamp'>) => void
  player: Player | null
}

const formSchema = z.object({
  name: z.string().min(2, { message: "Player name must be at least 2 characters." }),
  points: z.coerce.number().int(),
  photoURL: z.string().optional(),
  matchesPlayed: z.coerce.number().int().min(0),
  wins: z.coerce.number().int().min(0),
  draws: z.coerce.number().int().min(0),
  losses: z.coerce.number().int().min(0),
  lateCount: z.coerce.number().int().min(0),
  noShowCount: z.coerce.number().int().min(0),
})

export function PlayerDialog({ isOpen, onOpenChange, onSave, player }: PlayerDialogProps) {
  const [preview, setPreview] = useState<string | undefined>(undefined);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      points: 0,
      photoURL: undefined,
      matchesPlayed: 0,
      wins: 0,
      draws: 0,
      losses: 0,
      lateCount: 0,
      noShowCount: 0,
    },
  })
  
  useEffect(() => {
    if (isOpen) {
      if (player) {
        form.reset({
          name: player.name,
          points: player.points,
          photoURL: player.photoURL,
          matchesPlayed: player.matchesPlayed,
          wins: player.wins,
          draws: player.draws,
          losses: player.losses,
          lateCount: player.lateCount,
          noShowCount: player.noShowCount,
        })
        setPreview(player.photoURL)
      } else {
        form.reset({
          name: "",
          points: 10, // Default points for new player
          photoURL: undefined,
          matchesPlayed: 0,
          wins: 0,
          draws: 0,
          losses: 0,
          lateCount: 0,
          noShowCount: 0,
        })
        setPreview(undefined);
      }
    }
  }, [player, isOpen, form])

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const dataUrl = reader.result as string;
        setPreview(dataUrl);
        form.setValue("photoURL", dataUrl);
      };
      reader.readAsDataURL(file);
    }
  };

  function onSubmit(values: z.infer<typeof formSchema>) {
    onSave({ ...values, id: player?.id ?? '' });
  }

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{player ? "Edit Player" : "Add New Player"}</DialogTitle>
          <DialogDescription>
            {player ? "Update the player's details below." : "Enter the new player's details."}
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-4">
            <div className="flex items-center gap-4">
              <Avatar className="h-20 w-20">
                <AvatarImage src={preview} />
                <AvatarFallback className="bg-muted">
                  <User className="h-10 w-10 text-muted-foreground" />
                </AvatarFallback>
              </Avatar>
              <Button type="button" variant="outline" onClick={() => fileInputRef.current?.click()}>
                <Upload className="mr-2 h-4 w-4" />
                Upload Photo
              </Button>
              <Input 
                type="file" 
                ref={fileInputRef}
                className="hidden"
                accept="image/png, image/jpeg, image/gif"
                onChange={handleFileChange}
              />
            </div>

            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Player Name</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g. Leo Messi" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="points"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Points</FormLabel>
                  <FormControl>
                    <Input type="number" placeholder="e.g. 100" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="grid grid-cols-2 gap-4">
               <FormField
                  control={form.control}
                  name="matchesPlayed"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>MP</FormLabel>
                      <FormControl>
                        <Input type="number" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                 <FormField
                  control={form.control}
                  name="wins"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Wins</FormLabel>
                      <FormControl>
                        <Input type="number" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
            </div>
             <div className="grid grid-cols-2 gap-4">
               <FormField
                  control={form.control}
                  name="draws"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Draws</FormLabel>
                      <FormControl>
                        <Input type="number" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                 <FormField
                  control={form.control}
                  name="losses"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Losses</FormLabel>
                      <FormControl>
                        <Input type="number" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
            </div>
             <div className="grid grid-cols-2 gap-4">
               <FormField
                  control={form.control}
                  name="lateCount"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Late</FormLabel>
                      <FormControl>
                        <Input type="number" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                 <FormField
                  control={form.control}
                  name="noShowCount"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>No Show</FormLabel>
                      <FormControl>
                        <Input type="number" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
            </div>
            <DialogFooter>
              <Button type="submit">Save Player</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
