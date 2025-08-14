
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
  latePenalty: z.coerce.number().int().min(0, {
    message: "Points must be a positive number.",
  }),
  noShowPenalty: z.coerce.number().int().min(0, {
      message: "Points must be a positive number."
  }),
})

export function SettingsDialog({ isOpen, onOpenChange, onSave, settings }: SettingsDialogProps) {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      latePenalty: 2,
      noShowPenalty: 3,
    },
  })
  
  useEffect(() => {
    if (isOpen) {
      form.reset({
        latePenalty: settings.latePenalty,
        noShowPenalty: settings.noShowPenalty,
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
            Adjust the point deductions for penalties.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-4">
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
            <DialogFooter>
              <Button type="submit">Save Settings</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
