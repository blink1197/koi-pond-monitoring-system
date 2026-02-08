'use client';

import { Button } from "@/components/ui/button";
import {
    Card,
    CardContent,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { createClient } from "@/lib/supabase/client";
import { findThreshold, getStatusLabel, getThresholdColorStyle } from '@/lib/utils';
import { Waves } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { SensorWithReading, ThresholdColors } from "../../sensors/types";

export default function WaterLevelCard() {
    const [sensorData, setSensorData] = useState<SensorWithReading | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchWaterLevelSensor() {
            const supabase = createClient();

            // Fetch the water level sensor
            const { data: sensorData, error: sensorError } = await supabase
                .from("sensors")
                .select("*")
                .eq("type", "water_level")
                .limit(1)
                .single();

            if (sensorError) {
                console.error(sensorError);
                setLoading(false);
                return;
            }

            // Fetch the latest reading
            const { data: readingData, error: readingError } = await supabase
                .from("readings")
                .select("*")
                .eq("sensor_id", sensorData.id)
                .eq("is_valid", true)
                .order("recorded_at", { ascending: false })
                .limit(1)
                .single();

            if (readingError) {
                console.error(readingError);
            }

            setSensorData({
                ...sensorData,
                latestReading: readingData || null,
            });

            setLoading(false);
        }

        fetchWaterLevelSensor();
    }, []);

    // Loading state
    if (loading || !sensorData) {
        return (
            <Card className="w-full min-h-[140px] flex flex-col">
                <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                        <div className="flex items-center gap-2 text-sm font-medium">
                            <Waves className="h-4 w-4 text-muted-foreground" />
                            Water Level
                        </div>
                        <div className="flex items-center gap-2 text-xs">
                            <Skeleton className="h-2 w-2 rounded-full" />
                            <Skeleton className="h-4 w-12" />
                        </div>
                    </CardTitle>
                </CardHeader>
                <CardContent className="flex-1 text-center">
                    <Skeleton className="h-9 w-24 mx-auto mb-2" />
                    <Skeleton className="h-4 w-32 mx-auto" />
                </CardContent>
                <CardFooter>
                    <Skeleton className="h-8 w-32" />
                </CardFooter>
            </Card>
        );
    }

    // No reading found
    if (!sensorData.latestReading) {
        return (
            <Card className="w-full min-h-[140px] flex flex-col">
                <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                        <div className="flex items-center gap-2 text-sm font-medium">
                            <Waves className="h-4 w-4 text-muted-foreground" />
                            Water Level
                        </div>
                        <div className="flex items-center gap-2 text-xs">
                            <span className="h-2 w-2 rounded-full bg-gray-500" />
                            No Data
                        </div>
                    </CardTitle>
                </CardHeader>
                <CardContent className="flex-1 text-center">
                    <div className="text-3xl font-bold">N/A</div>
                    <p className="text-xs text-muted-foreground">No readings available</p>
                </CardContent>
                <CardFooter>
                    <Button variant="ghost" size="sm" asChild className="px-2">
                        <Link href="/sensors/water-level">View details →</Link>
                    </Button>
                </CardFooter>
            </Card>
        );
    }

    // Sensor found and has data
    const currentWaterLevel = sensorData.latestReading.value;
    const matchedThreshold = findThreshold(currentWaterLevel, sensorData.thresholds, 'water_level');
    const waterLevelStatus = matchedThreshold?.name ?? 'Unknown';
    const statusLabel = getStatusLabel(waterLevelStatus);
    const colorKey = (matchedThreshold?.color ?? 'none') as ThresholdColors;
    const statusStyle = matchedThreshold ? getThresholdColorStyle(colorKey) : undefined;

    return (
        <Card className="w-full min-h-[140px] flex flex-col">
            <CardHeader>
                <CardTitle className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-sm font-medium">
                        <Waves className="h-4 w-4 text-muted-foreground" />
                        Water Level
                    </div>
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <div className="flex items-center gap-2 text-xs cursor-pointer">
                                <span
                                    className="h-2 w-2 rounded-full"
                                    style={{
                                        backgroundColor: statusStyle?.backgroundColor || '#10b981'
                                    }}
                                />
                                <span>{statusLabel}</span>
                            </div>
                        </TooltipTrigger>
                        <TooltipContent className="max-w-xs">
                            {(() => {
                                const threshold = matchedThreshold ?? null;
                                const min = threshold?.min;
                                const max = threshold?.max;

                                if (min !== undefined && max !== undefined) {
                                    return `${waterLevelStatus}: ${min}–${max} cm`;
                                } else if (min !== undefined) {
                                    return `${waterLevelStatus}: ≥ ${min} cm`;
                                } else if (max !== undefined) {
                                    return `${waterLevelStatus}: ≤ ${max} cm`;
                                } else {
                                    return `Status: ${waterLevelStatus}`;
                                }
                            })()}
                        </TooltipContent>
                    </Tooltip>
                </CardTitle>
            </CardHeader>
            <CardContent className="flex-1 text-center">
                <div className="text-3xl font-bold">{currentWaterLevel.toFixed(1)} cm</div>
                <p className="text-xs text-muted-foreground">{waterLevelStatus} range</p>
            </CardContent>
            <CardFooter>
                <Button variant="ghost" size="sm" asChild className="px-2">
                    <Link href="/sensors/water-level">View details →</Link>
                </Button>
            </CardFooter>
        </Card>
    );
}