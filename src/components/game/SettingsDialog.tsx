
"use client"

import { useEffect } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import type { Settings } from "@/types"

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

interface SettingsDialogProps {
  isOpen: boolean
  onOpenChange: (isOpen: boolean) => void
  onSave: (settings: Settings) => void
  settings: Settings
}

const formSchema = z.object({
  leagueName: z.string().min(1, { message: "League name is required." }),
  location: z.string().min(1, { message: "Location is required." }),
  totalMatches: z.coerce.number().int().min(1, { message: "Must be at least 1 match." }),
  latePenalty: z.coerce.number().int().min(0, {
    message: "Points must be a positive number.",
  }),
  noShowPenalty: z.coerce.number().int().min(0, {
      message: "Points must be a positive number."
  }),
  bonusPoint: z.coerce.number().int().min(0, {
    message: "Points must be a positive number."
  }),
})

export function SettingsDialog({ isOpen, onOpenChange, onSave, settings }: SettingsDialogProps) {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      leagueName: 'Hirafus League',
      location: 'City Arena',
      totalMatches: 38,
      latePenalty: 2,
      noShowPenalty: 3,
      bonusPoint: 1,
    },
  })
  
  useEffect(() => {
    if (isOpen) {
      form.reset({
        leagueName: settings.leagueName,
        location: settings.location,
        totalMatches: settings.totalMatches,
        latePenalty: settings.latePenalty,
        noShowPenalty: settings.noShowPenalty,
        bonusPoint: settings.bonusPoint,
      })
    }
  }, [settings, isOpen, form])

  function onSubmit(values: z.infer<typeof formSchema>) {
    onSave(values);
  }

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>League Settings</DialogTitle>
          <DialogDescription>
            Customize your league name, location, season length, and penalty points.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-4">
             <FormField
              control={form.control}
              name="leagueName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>League Name</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="location"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Location</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="totalMatches"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Total Matches</FormLabel>
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
                name="latePenalty"
                render={({ field }) => (
                    <FormItem>
                    <FormLabel>Late Penalty Points</FormLabel>
                    <FormControl>
                        <Input type="number" {...field} />
                    </FormControl>
                    <FormMessage />
                    </FormItem>
                )}
                />
                <FormField
                control={form.control}
                name="noShowPenalty"
                render={({ field }) => (
                    <FormItem>
                    <FormLabel>No-Show Penalty Points</FormLabel>
                    <FormControl>
                        <Input type="number" {...field} />
                    </FormControl>
                    <FormMessage />
                    </FormItem>
                )}
                />
            </div>
             <FormField
              control={form.control}
              name="bonusPoint"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>No-Show Bonus Point</FormLabel>
                  <FormControl>
                    <Input type="number" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter>
              <Button type="submit">Save Settings</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
