"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { Package } from "lucide-react"
import type { Equipment } from "@/lib/db/schema"

interface EquipmentSelectorProps {
  date: string
  startTime: string
  endTime: string
  selectedEquipmentIds: string[]
  onSelectionChange: (equipmentIds: string[]) => void
}

export function EquipmentSelector({
  date,
  startTime,
  endTime,
  selectedEquipmentIds,
  onSelectionChange,
}: EquipmentSelectorProps) {
  const [equipment, setEquipment] = useState<Equipment[]>([])

  useEffect(() => {
    async function fetchEquipment() {
      const res = await fetch("/api/admin/equipment")
      const data = await res.json()
      setEquipment(data.equipment || [])
    }

    fetchEquipment()
  }, [])

  function handleToggle(equipmentId: string, checked: boolean) {
    if (checked) {
      onSelectionChange([...selectedEquipmentIds, equipmentId])
    } else {
      onSelectionChange(selectedEquipmentIds.filter((id) => id !== equipmentId))
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Package className="h-5 w-5" />
          Add Equipment (Optional)
        </CardTitle>
        <CardDescription>Select any equipment you need to rent</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {equipment.map((item) => (
            <div key={item.id} className="flex items-center justify-between rounded-lg border p-3">
              <div className="flex items-center gap-3">
                <Checkbox
                  id={item.id}
                  checked={selectedEquipmentIds.includes(item.id)}
                  onCheckedChange={(checked) => handleToggle(item.id, checked as boolean)}
                />
                <Label htmlFor={item.id} className="cursor-pointer">
                  <div className="font-medium">{item.name}</div>
                  <div className="text-xs text-muted-foreground capitalize">
                    {item.category} • {item.quantity} available
                  </div>
                </Label>
              </div>
              <div className="text-sm font-semibold">${item.pricePerHour}/hr</div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
