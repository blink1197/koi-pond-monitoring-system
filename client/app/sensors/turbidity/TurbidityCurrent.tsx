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
import { findThreshold, getStatusLabel, getThresholdColorStyle } from '@/lib/utils';
import { useEffect, useState } from "react";
import { Sensor, SensorWithReading, ThresholdColors } from "../types";

const TurbidityCardHeader = () => {
    return (
        <CardHeader>
            <CardTitle>Current Turbidity</CardTitle>
            <CardDescription>Latest recorded turbidity from the pond sensor</CardDescription>
        </CardHeader>
    );
}

interface TurbidityCurrentProps {
    sensor: Sensor | null;
    loading: boolean;
}

export default function TurbidityCurrent({ sensor, loading: parentLoading }: TurbidityCurrentProps) {
    const [sensorData, setSensorData] = useState<SensorWithReading | null>(null);

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
                <TurbidityCardHeader />
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
                    <CardDescription>There is no turbidity sensor available.</CardDescription>
                </CardHeader>
                <CardContent />
            </Card>
        );
    }

    // Sensor found and has data
    const currentTurbidity = sensorData.latestReading.value;
    const recordedAt = sensorData.latestReading.recorded_at;
    const matchedThreshold = findThreshold(currentTurbidity, sensorData.thresholds, 'turbidity');
    const turbidityStatus = matchedThreshold?.name ?? 'Unknown';
    const statusLabel = getStatusLabel(turbidityStatus);
    const colorKey = (matchedThreshold?.color ?? 'none') as ThresholdColors;
    const statusStyle = matchedThreshold ? getThresholdColorStyle(colorKey) : undefined;

    return (
        <Card>
            <TurbidityCardHeader />

            <CardContent className="space-y-4">
                {/* Main reading */}
                <div className="flex items-center justify-between">
                    <span className="text-4xl font-bold">{currentTurbidity.toFixed(1)} NTU</span>
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
                                    <Badge style={statusStyle}>{statusLabel}</Badge>
                                </span>
                            </TooltipTrigger>
                            <TooltipContent className="max-w-xs">
                                {(() => {
                                    const threshold = matchedThreshold ?? null;
                                    const min = threshold?.min;
                                    const max = threshold?.max;

                                    if (min !== undefined && max !== undefined) {
                                        return `${turbidityStatus}: ${min}-${max} NTU`;
                                    } else if (min !== undefined) {
                                        return `${turbidityStatus}: ≥ ${min} NTU`;
                                    } else if (max !== undefined) {
                                        return `${turbidityStatus}: ≤ ${max} NTU`;
                                    } else {
                                        return `Status: ${turbidityStatus}`;
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
                        <span className="text-muted-foreground">Ideal level</span>
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <span className="font-medium cursor-pointer">0-10 NTU</span>
                            </TooltipTrigger>
                            <TooltipContent>
                                Ideal range for koi growth and activity.
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
