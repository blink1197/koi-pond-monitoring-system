'use client';
import { Button } from '@/components/ui/button';
import { createClient } from '@/lib/supabase/client';
import { Settings } from 'lucide-react';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { Reading, Sensor } from '../types';
import TemperatureCurrent from "./TemperatureCurrent";
import TemperatureGraph from "./TemperatureGraph";
import TemperatureTable from "./TemperatureTable";

export default function TemperaturePage() {
    const [sensor, setSensor] = useState<Sensor | null>(null);
    const [readings, setReadings] = useState<Reading[]>([]);
    const [loading, setLoading] = useState(true);

    // Helper function to get time range in milliseconds based on aggregation interval
    const getTimeRangeMs = (interval: string): number => {
        switch (interval) {
            case 'hourly':
                return 60 * 60 * 1000; // 1 hour
            case 'daily':
                return 24 * 60 * 60 * 1000; // 24 hours
            case 'weekly':
                return 7 * 24 * 60 * 60 * 1000; // 7 days
            case 'monthly':
                return 30 * 24 * 60 * 60 * 1000; // 30 days
            case 'yearly':
                return 365 * 24 * 60 * 60 * 1000; // 365 days
            default:
                return 24 * 60 * 60 * 1000; // default to daily
        }
    };

    useEffect(() => {
        async function fetchTemperatureSensor() {
            const supabase = createClient();

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

            setSensor(sensorData);

            // Fetch valid readings based on aggregation interval
            const aggregationInterval = sensorData.aggregation_interval || 'daily';
            const timeRangeMs = getTimeRangeMs(aggregationInterval);
            const cutoffTime = new Date(Date.now() - timeRangeMs).toISOString();

            const { data: readingsData, error: readingsError } = await supabase
                .from("readings")
                .select("*")
                .eq("sensor_id", sensorData.id)
                .eq("is_valid", true)
                .gte("recorded_at", cutoffTime)
                .order("recorded_at", { ascending: false });

            if (readingsError) {
                console.error(readingsError);
            } else {
                setReadings(readingsData || []);
            }
            setLoading(false);
        }

        fetchTemperatureSensor();
    }, []);

    return (
        <div className="space-y-6">
            <div className='flex justify-between'>
                <div>
                    <h1 className="text-2xl font-semibold">Temperature Details</h1>
                    <p className="text-sm text-muted-foreground">
                        Latest temperature reading and sensor info
                    </p>
                </div>
                <Button variant="outline" size="sm">
                    <Link href="/sensors/temperature/settings" className="flex items-center gap-2">
                        <Settings />
                        Settings
                    </Link>
                </Button>
            </div>

            {/* Current temperature + graph */}
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
                <TemperatureCurrent sensor={sensor} loading={loading} />

                {/* Graph and table */}
                <TemperatureGraph readings={readings} sensor={sensor} loading={loading} />
            </div>

            <TemperatureTable sensor={sensor} readings={readings} loading={loading} />
        </div>
    );
}
