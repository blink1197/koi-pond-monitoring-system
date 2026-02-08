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

    function getTemperatureStatus(value: number, thresholds?: Sensor['thresholds']): string {
        const tempThresholds = thresholds?.temperature;
        if (!Array.isArray(tempThresholds) || tempThresholds.length === 0) return 'Unknown';

        // Find the threshold that matches the current value
        for (const threshold of tempThresholds) {
            const { min, max } = threshold;

            // Check if value falls within this threshold's range
            if ((min === undefined || value >= min) && (max === undefined || value <= max)) {
                return threshold.name;
            }
        }

        // If no threshold matches, return 'Unknown'
        return 'Unknown';
    }

    function getStatusClasses(status: string): string {
        const statusLower = status.toLowerCase();

        // Map status names to color classes
        if (statusLower.includes('cold') || statusLower.includes('freezing')) {
            return 'bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-300';
        }
        if (statusLower.includes('hot') || statusLower.includes('extreme')) {
            return 'bg-red-50 text-red-700 dark:bg-red-950 dark:text-red-300';
        }
        if (statusLower.includes('warm') || statusLower.includes('high')) {
            return 'bg-yellow-50 text-yellow-700 dark:bg-yellow-950 dark:text-yellow-300';
        }
        if (statusLower.includes('normal') || statusLower.includes('ideal') || statusLower.includes('optimal')) {
            return 'bg-green-50 text-green-700 dark:bg-green-950 dark:text-green-300';
        }

        // Default to neutral gray
        return 'bg-gray-50 text-gray-700 dark:bg-gray-950 dark:text-gray-300';
    }

    function getStatusLabel(status: string) {
        return status.charAt(0).toUpperCase() + status.slice(1);
    }

    function getThresholdInfo(status: string): { min?: number; max?: number } | null {
        const tempThresholds = sensorData?.thresholds?.temperature;
        if (!Array.isArray(tempThresholds)) return null;

        const threshold = tempThresholds.find(t => t.name === status);
        return threshold ? { min: threshold.min, max: threshold.max } : null;
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
                                    const thresholdInfo = getThresholdInfo(tempStatus);
                                    const { min, max } = thresholdInfo || {};

                                    if (min !== undefined && max !== undefined) {
                                        return `${tempStatus}: ${min}–${max}°C`;
                                    } else if (min !== undefined) {
                                        return `${tempStatus}: ≥ ${min}°C`;
                                    } else if (max !== undefined) {
                                        return `${tempStatus}: ≤ ${max}°C`;
                                    } else {
                                        return `Status: ${tempStatus}`;
                                    }
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
