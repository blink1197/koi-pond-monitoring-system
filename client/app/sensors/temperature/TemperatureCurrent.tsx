'use client';
import { Badge } from "@/components/ui/badge";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { createClient } from "@/lib/supabase/client";
import { useEffect, useState } from "react";
import { Sensor, SensorWithReading } from "../types";

const TempCardHeader = () => {
    return (
        <CardHeader>
            <CardTitle>Current Temperature</CardTitle>
            <CardDescription>Latest recorded temperature from the pond sensor</CardDescription>
        </CardHeader>
    );
}

interface TemperatureCurrentProps {
    sensor: Sensor | null;
    loading: boolean;
}

export default function TemperatureCurrent({ sensor, loading: parentLoading }: TemperatureCurrentProps) {
    const [sensorData, setSensorData] = useState<SensorWithReading | null>(null);

    type TemperatureStatus = 'cold' | 'normal' | 'warm' | 'hot';

    function getTemperatureStatus(value: number, thresholds?: Sensor['thresholds']): TemperatureStatus {
        const tempThresholds = thresholds?.temperature;
        if (!tempThresholds) return 'normal';

        if (tempThresholds.cold && value <= tempThresholds.cold.max) return 'cold';
        if (tempThresholds.hot && value >= tempThresholds.hot.min) return 'hot';
        if (tempThresholds.warm && value >= tempThresholds.warm.min && value <= tempThresholds.warm.max) return 'warm';
        if (tempThresholds.normal && value >= tempThresholds.normal.min && value <= tempThresholds.normal.max) return 'normal';

        return 'normal';
    }

    function getStatusClasses(status: TemperatureStatus): string {
        switch (status) {
            case 'cold':
                return 'bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-300';
            case 'normal':
                return 'bg-green-50 text-green-700 dark:bg-green-950 dark:text-green-300';
            case 'warm':
                return 'bg-yellow-50 text-yellow-700 dark:bg-yellow-950 dark:text-yellow-300';
            case 'hot':
                return 'bg-red-50 text-red-700 dark:bg-red-950 dark:text-red-300';
            default:
                return '';
        }
    }

    function getStatusLabel(status: TemperatureStatus) {
        return status.charAt(0).toUpperCase() + status.slice(1);
    }

    useEffect(() => {
        async function fetchLatestReading() {
            if (!sensor) return;

            const supabase = createClient();

            // Fetch the latest reading for this sensor
            const { data: readingData, error: readingError } = await supabase
                .from("readings")
                .select("*")
                .eq("sensor_id", sensor.id)
                .order("recorded_at", { ascending: false })
                .limit(1)
                .single();

            if (readingError) {
                console.error(readingError);
                return;
            }

            setSensorData({
                ...sensor,
                latestReading: readingData || null,
            });
        }

        fetchLatestReading();
    }, [sensor]);

    // Loading state
    if (!sensorData || parentLoading) {
        return (
            <Card>
                <TempCardHeader />
                <CardContent className="space-y-4">
                    <div className="flex items-center justify-between">
                        <Skeleton className="w-24 h-10" />
                        <Skeleton className="w-20 h-4" />
                    </div>
                    <div className="border-t pt-4 space-y-2">
                        {[...Array(6)].map((_, i) => (
                            <div key={i} className="flex justify-between">
                                <Skeleton className="w-24 h-4" />
                                <Skeleton className="w-28 h-4" />
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>
        );
    }

    // No sensor found
    if (!sensorData || !sensorData.latestReading) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle>No Sensor Found</CardTitle>
                    <CardDescription>There is no temperature sensor available.</CardDescription>
                </CardHeader>
                <CardContent />
            </Card>
        );
    }

    // Sensor found and has data
    const currentTemp = sensorData.latestReading.value;
    const recordedAt = sensorData.latestReading.recorded_at;

    const tempStatus = getTemperatureStatus(currentTemp, sensorData.thresholds);
    const statusLabel = getStatusLabel(tempStatus);
    const statusClasses = getStatusClasses(tempStatus);

    return (
        <Card>
            <TempCardHeader />

            <CardContent className="space-y-4">
                {/* Main reading */}
                <div className="flex items-center justify-between">
                    <span className="text-4xl font-bold">{currentTemp.toFixed(1)} °C</span>
                    <span className="text-sm text-muted-foreground">
                        Updated {new Date(recordedAt).toLocaleTimeString()}
                    </span>
                </div>

                {/* Sensor info */}
                <div className="border-t pt-4 space-y-2 text-sm">
                    <div className="flex justify-between">
                        <span className="text-muted-foreground">Sensor ID</span>
                        <span className="font-medium">{sensorData.id}</span>
                    </div>

                    <div className="flex justify-between">
                        <span className="text-muted-foreground">Sensor Model</span>
                        <span className="font-medium">{sensorData.model || "-"}</span>
                    </div>

                    <div className="flex justify-between">
                        <span className="text-muted-foreground">Description</span>
                        <span className="font-medium">{sensorData.description || "-"}</span>
                    </div>

                    {/* Status with tooltip */}
                    <div className="flex justify-between items-center">
                        <span className="text-muted-foreground">Status</span>
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <span className="flex items-center gap-2 font-medium cursor-pointer">
                                    <Badge className={statusClasses}>{statusLabel}</Badge>
                                </span>
                            </TooltipTrigger>
                            <TooltipContent className="max-w-xs">
                                {(() => {
                                    const t = sensorData.thresholds?.temperature;
                                    if (tempStatus === 'cold') {
                                        const max = t?.cold?.max ?? '??';
                                        return `Temperature is cold (≤ ${max}°C).`;
                                    }
                                    if (tempStatus === 'normal') {
                                        const min = t?.normal?.min ?? '??';
                                        const max = t?.normal?.max ?? '??';
                                        return `Temperature is normal (${min}–${max}°C).`;
                                    }
                                    if (tempStatus === 'warm') {
                                        const min = t?.warm?.min ?? '??';
                                        const max = t?.warm?.max ?? '??';
                                        return `Temperature is warm (${min}–${max}°C). Monitor fish closely.`;
                                    }
                                    if (tempStatus === 'hot') {
                                        const min = t?.hot?.min ?? '??';
                                        return `Temperature is hot (≥ ${min}°C). Immediate action recommended.`;
                                    }
                                    return 'Temperature status unknown.';
                                })()}
                            </TooltipContent>
                        </Tooltip>
                    </div>

                    <div className="flex justify-between">
                        <span className="text-muted-foreground">Location</span>
                        <span className="font-medium">{sensorData.location || "-"}</span>
                    </div>

                    <div className="flex justify-between">
                        <span className="text-muted-foreground">Ideal Temp</span>
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <span className="font-medium cursor-pointer">24-27°C</span>
                            </TooltipTrigger>
                            <TooltipContent>
                                Ideal temperature range for koi growth and activity.
                            </TooltipContent>
                        </Tooltip>
                    </div>
                    <div className="flex justify-between">
                        <span className="text-muted-foreground">Interval</span>
                        <span className="font-medium">1 min.</span>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
