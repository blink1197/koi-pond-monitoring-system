"use client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
    CartesianGrid,
    Line,
    LineChart,
    Tooltip as RechartsTooltip,
    ResponsiveContainer,
    XAxis,
} from "recharts";
import { Reading, Sensor } from "../types";

interface TemperatureGraphProps {
    readings: Reading[];
    sensor: Sensor | null;
    loading: boolean;
}

// Aggregate readings into hourly buckets and return points for plotting
function aggregateHourly(readings: Reading[]) {
    const buckets: Record<string, number[]> = {};
    readings.forEach((r) => {
        const d = new Date(r.recorded_at);
        // bucket key ISO hour
        const key = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate(), d.getHours())).toISOString();
        buckets[key] = buckets[key] || [];
        buckets[key].push(r.value);
    });

    const entries = Object.entries(buckets).sort((a, b) => a[0].localeCompare(b[0]));
    return entries.map(([key, vals]) => ({
        time: key,
        value: vals.reduce((s, n) => s + n, 0) / vals.length,
    }));
}

function formatLabel(iso: string) {
    const d = new Date(iso);
    // show local date hour e.g. "Feb 08 14:00"
    return d.toLocaleString(undefined, { month: "short", day: "2-digit", hour: "2-digit", hour12: false });
}

export default function TemperatureGraph({ readings, loading }: TemperatureGraphProps) {
    if (loading) {
        return (
            <Card className="lg:col-span-2">
                <CardHeader>
                    <CardTitle>Temperature Trend</CardTitle>
                    <CardDescription>Temperature changes over time</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="h-64">
                        <Skeleton className="h-64 w-full" />
                    </div>
                </CardContent>
            </Card>
        );
    }

    const points = aggregateHourly(readings);

    if (!points || points.length === 0) {
        return (
            <Card className="lg:col-span-2">
                <CardHeader>
                    <CardTitle>Temperature Trend</CardTitle>
                    <CardDescription>Temperature changes over time</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="h-64 flex items-center justify-center rounded-md border border-dashed text-sm text-muted-foreground">
                        Not enough data to display chart
                    </div>
                </CardContent>
            </Card>
        );
    }

    // Recharts expects an array of objects; use formatted label for XAxis
    const data = points.map((p) => ({ label: formatLabel(p.time), value: Number(p.value.toFixed(2)) }));

    return (
        <Card className="lg:col-span-2">
            <CardHeader>
                <CardTitle>Temperature Trend</CardTitle>
                <CardDescription>Hourly average temperature</CardDescription>
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
                                formatter={(value: unknown) => `${value} °C`}
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
