"use client"

import { useEffect } from "react"
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

interface PlayerDialogProps {
  isOpen: boolean
  onOpenChange: (isOpen: boolean) => void
  onSave: (playerData: Omit<Player, 'id' | 'status' | 'matchesPlayed' | 'wins' | 'draws' | 'losses' | 'form' | 'waitingTimestamp'> & { id?: number }) => void
  player: Player | null
}

const formSchema = z.object({
  name: z.string().min(2, {
    message: "Player name must be at least 2 characters.",
  }),
  points: z.coerce.number().int().min(0, {
      message: "Points must be a positive number."
  }),
})

export function PlayerDialog({ isOpen, onOpenChange, onSave, player }: PlayerDialogProps) {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      points: 0,
    },
  })
  
  useEffect(() => {
    if (isOpen) {
      if (player) {
        form.reset({
          name: player.name,
          points: player.points,
        })
      } else {
        form.reset({
          name: "",
          points: 10, // Default points for new player
        })
      }
    }
  }, [player, isOpen, form])

  function onSubmit(values: z.infer<typeof formSchema>) {
    onSave({ ...values, id: player?.id });
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
            <DialogFooter>
              <Button type="submit">Save Player</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
