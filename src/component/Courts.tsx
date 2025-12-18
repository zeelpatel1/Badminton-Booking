"use client"

import { useState, useEffect, ChangeEvent } from "react";
import { Button } from "@/components/ui/button";
import { MapPin } from "lucide-react";
import { CourtsGrid } from "@/components/courts-grid";
import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
    SheetFooter,
} from "@/components/sheet";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";

type CourtType = "INDOOR" | "OUTDOOR";

export default function Courts() {
    const [courts, setCourts] = useState([]);
    const [open, setOpen] = useState(false);
    const [newCourt, setNewCourt] = useState({
        name: "",
        type: "INDOOR" as CourtType,
        basePrice: 0,
        enabled: true,
    });

    // Fetch courts
    useEffect(() => {
        const fetchCourts = async () => {
            try {
                const res = await fetch("/api/admin/courts");
                if (!res.ok) throw new Error("Failed to fetch courts");
                const data = await res.json();
                setCourts(data);
            } catch (err) {
                console.error(err);
            }
        };
        fetchCourts();
    }, []);

    const handleAddCourt = async () => {
        try {
            const res = await fetch("/api/admin/courts", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(newCourt),
            });
            if (!res.ok) throw new Error("Failed to add court");
            const data = await res.json();
            setCourts((prev) => [...prev, data]);
            setOpen(false);
            setNewCourt({ name: "", type: "", basePrice: 0, enabled: true });
        } catch (err) {
            console.error(err);
        }
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Courts Management</h1>
                    <p className="text-muted-foreground mt-1">
                        Configure and manage your badminton courts
                    </p>
                </div>
                <Button onClick={() => setOpen(true)}>
                    <MapPin className="mr-2 size-4" />
                    Add Court
                </Button>
            </div>

            {/* Courts Grid */}
            <CourtsGrid courts={courts} />

            {/* Add Court Sheet */}
            <Sheet open={open} onOpenChange={setOpen}>
                <SheetContent side="right" className="w-full">
                    <SheetHeader>
                        <SheetTitle>Add New Court</SheetTitle>
                    </SheetHeader>

                    <div className="space-y-4 mt-4">
                        {/* Court Name */}
                        <div className="grid gap-2">
                            <label className="text-sm font-medium">Court Name</label>
                            <Input
                                value={newCourt.name}
                                onChange={(e: ChangeEvent<HTMLInputElement>) =>
                                    setNewCourt((prev) => ({ ...prev, name: e.target.value }))
                                }
                                placeholder="Court 1"
                            />
                        </div>

                        {/* Court Type */}
                        <div className="grid gap-2">
                            <label className="text-sm font-medium">Type</label>
                            <Select
                                value={newCourt.type}
                                onValueChange={(value) =>
                                    setNewCourt((prev) => ({ ...prev, type: value as CourtType }))
                                }
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Select type" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="INDOOR">Indoor</SelectItem>
                                    <SelectItem value="OUTDOOR">Outdoor</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        {/* Base Price */}
                        <div className="grid gap-2">
                            <label className="text-sm font-medium">Base Price</label>
                            <Input
                                type="number"
                                value={newCourt.basePrice}
                                onChange={(e) =>
                                    setNewCourt((prev) => ({ ...prev, basePrice: Number(e.target.value) }))
                                }
                            />
                        </div>

                        {/* Enabled */}
                        <div className="flex items-center gap-2">
                            <Switch
                                checked={newCourt.enabled}
                                onCheckedChange={(value) =>
                                    setNewCourt((prev) => ({ ...prev, enabled: value }))
                                }
                            />
                            <span className="text-sm">Enabled</span>
                        </div>
                    </div>

                    <SheetFooter className="mt-4">
                        <Button onClick={handleAddCourt} className="w-full">
                            Add Court
                        </Button>
                    </SheetFooter>
                </SheetContent>
            </Sheet>
        </div>
    );
}
