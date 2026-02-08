"use client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { AGGREGATION_OPTIONS } from "@/lib/consts";
import {
    aggregateDaily,
    aggregateHourly,
    aggregateMonthly,
    aggregateWeekly,
    aggregateYearly,
    formatLabel
} from "@/lib/utils";
import { useState } from "react";
import {
    CartesianGrid,
    Line,
    LineChart,
    Tooltip as RechartsTooltip,
    ResponsiveContainer,
    XAxis,
} from "recharts";
import { Reading, Sensor } from "../types";


interface TurbidityGraphProps {
    readings: Reading[];
    sensor: Sensor | null;
    loading: boolean;
}

export default function TurbidityGraph({ readings, loading }: TurbidityGraphProps) {
    const [interval, setInterval] = useState<string>('daily');

    if (loading) {
        return (
            <Card className="lg:col-span-2">
                <CardHeader>
                    <CardTitle>Turbidity Trend</CardTitle>
                    <CardDescription>Turbidity changes over time</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="h-64">
                        <Skeleton className="h-64 w-full" />
                    </div>
                </CardContent>
            </Card>
        );
    }

    // Get aggregated data based on selected interval
    const getAggregatedData = () => {
        switch (interval) {
            case 'hourly':
                return aggregateHourly(readings);
            case 'weekly':
                return aggregateWeekly(readings);
            case 'monthly':
                return aggregateMonthly(readings);
            case 'yearly':
                return aggregateYearly(readings);
            case 'daily':
            default:
                return aggregateDaily(readings);
        }
    };

    const points = getAggregatedData();
    const descriptionMap = {
        hourly: 'Hourly average turbidity',
        daily: 'Daily average turbidity',
        weekly: 'Weekly average turbidity',
        monthly: 'Monthly average turbidity',
        yearly: 'Yearly average turbidity',
    };

    if (!points || points.length === 0) {
        return (
            <Card className="lg:col-span-2">
                <CardHeader>
                    <CardTitle>Turbidity Trend</CardTitle>
                    <CardDescription>Turbidity changes over time</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="h-64 flex items-center justify-center rounded-md border border-dashed text-sm text-muted-foreground">
                        Not enough data to display chart
                    </div>
                </CardContent>
            </Card>
        );
    }

    const data = points.map((p) => ({ label: formatLabel(p.time, interval), value: Number(p.value.toFixed(2)) }));

    return (
        <Card className="lg:col-span-2">
            <CardHeader className="overflow-visible">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                    <div>
                        <CardTitle>Turbidity Trend</CardTitle>
                        <CardDescription>{descriptionMap[interval as keyof typeof descriptionMap] || 'Turbidity changes over time'}</CardDescription>
                    </div>
                    <Select value={interval} onValueChange={setInterval}>
                        <SelectTrigger className="w-32 flex-shrink-0">
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent side="bottom" align="end" sideOffset={4}>
                            {AGGREGATION_OPTIONS.map((option) => (
                                <SelectItem key={option.value} value={option.value}>
                                    {option.label}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
            </CardHeader>
            <CardContent>
                <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={data} margin={{ top: 8, right: 12, left: 0, bottom: 8 }}>
                            <CartesianGrid vertical={false} stroke="var(--border)" strokeOpacity={0.12} />
                            <XAxis
                                dataKey="label"
                                tickLine={false}
                                axisLine={false}
                                tick={{ fontSize: 12, fill: 'hsl(var(--foreground))' }}
                            />
                            <RechartsTooltip
                                formatter={(value: unknown) => `${value} NTU`}
                                wrapperStyle={{ outline: 'none' }}
                                contentStyle={{
                                    background: 'hsl(var(--popover))',
                                    color: 'hsl(var(--popover-foreground))',
                                    border: '1px solid hsl(var(--border))',
                                    boxShadow: 'var(--shadow, 0 4px 12px rgba(0,0,0,0.06))',
                                }}
                                labelStyle={{ color: 'hsl(var(--muted-foreground))', fontSize: 12 }}
                                cursor={{ stroke: 'var(--border)', strokeWidth: 1 }}
                            />
                            <Line
                                dataKey="value"
                                type="monotone"
                                stroke={"hsl(var(--chart-1))"}
                                strokeWidth={3}
                                dot={{ r: 4, stroke: 'hsl(var(--chart-1))', strokeWidth: 2, fill: 'var(--card)' }}
                                activeDot={{ r: 6, stroke: 'hsl(var(--chart-1))', strokeWidth: 2, fill: 'hsl(var(--chart-1))' }}
                            />
                        </LineChart>
                    </ResponsiveContainer>
                </div>
            </CardContent>
        </Card>
    );
}
