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
import { Thermometer } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { SensorWithReading, ThresholdColors } from "../../sensors/types";

export default function TemperatureCard() {
    const [sensorData, setSensorData] = useState<SensorWithReading | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchTemperatureSensor() {
            const supabase = createClient();

            // Fetch the temperature sensor
            const { data: sensorData, error: sensorError } = await supabase
                .from("sensors")
                .select("*")
                .eq("type", "temperature")
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

        fetchTemperatureSensor();
    }, []);

    // Loading state
    if (loading || !sensorData) {
        return (
            <Card className="w-full min-h-[140px] flex flex-col">
                <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                        <div className="flex items-center gap-2 text-sm font-medium">
                            <Thermometer className="h-4 w-4 text-muted-foreground" />
                            Temperature
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
                            <Thermometer className="h-4 w-4 text-muted-foreground" />
                            Temperature
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
                        <Link href="/sensors/temperature">View details →</Link>
                    </Button>
                </CardFooter>
            </Card>
        );
    }

    // Sensor found and has data
    const currentTemp = sensorData.latestReading.value;
    const matchedThreshold = findThreshold(currentTemp, sensorData.thresholds, 'temperature');
    const tempStatus = matchedThreshold?.name ?? 'Unknown';
    const statusLabel = getStatusLabel(tempStatus);
    const colorKey = (matchedThreshold?.color ?? 'none') as ThresholdColors;
    const statusStyle = matchedThreshold ? getThresholdColorStyle(colorKey) : undefined;

    return (
        <Card className="w-full min-h-[140px] flex flex-col">
            <CardHeader>
                <CardTitle className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-sm font-medium">
                        <Thermometer className="h-4 w-4 text-muted-foreground" />
                        Temperature
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
                </CardTitle>
            </CardHeader>
            <CardContent className="flex-1 text-center">
                <div className="text-3xl font-bold">{currentTemp.toFixed(1)}°C</div>
                <p className="text-xs text-muted-foreground">{tempStatus} range</p>
            </CardContent>
            <CardFooter>
                <Button variant="ghost" size="sm" asChild className="px-2">
                    <Link href="/sensors/temperature">View details →</Link>
                </Button>
            </CardFooter>
        </Card>
    );
}