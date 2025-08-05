"use client"

import type React from "react"

import { useSortable } from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"
import { Card } from "@/components/ui/card"
import { GripVertical } from "lucide-react"

interface DraggableCardProps {
  id: string
  children: React.ReactNode
  className?: string
}

export function DraggableCard({ id, children, className }: DraggableCardProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  }

  return (
    <div ref={setNodeRef} style={style} className={`relative ${isDragging ? "z-50" : ""}`} {...attributes}>
      <Card className={`${className} ${isDragging ? "shadow-lg ring-2 ring-blue-500" : ""}`}>
        <div
          {...listeners}
          className="absolute top-2 right-2 p-1 opacity-0 hover:opacity-100 transition-opacity cursor-grab active:cursor-grabbing z-10"
        >
          <GripVertical className="h-4 w-4 text-muted-foreground" />
        </div>
        {children}
      </Card>
    </div>
  )
}
