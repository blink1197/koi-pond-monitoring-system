'use client';
import { Button } from '@/components/ui/button';
import { createClient } from '@/lib/supabase/client';
import { getTimeRangeMs } from '@/lib/utils';
import { Settings } from 'lucide-react';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { Reading, Sensor } from '../types';
import PHCurrent from './PHCurrent';
import PHGraph from './PHGraph';
import PHTable from './PHTable';

export default function TemperaturePage() {
    const [sensor, setSensor] = useState<Sensor | null>(null);
    const [readings, setReadings] = useState<Reading[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchPHSensor() {
            const supabase = createClient();

            const { data: sensorData, error: sensorError } = await supabase
                .from("sensors")
                .select("*")
                .eq("type", "ph")
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

        fetchPHSensor();
    }, []);

    return (
        <div className="space-y-6">
            <div className='flex justify-between'>
                <div>
                    <h1 className="text-2xl font-semibold">pH Details</h1>
                    <p className="text-sm text-muted-foreground">
                        Latest pH reading and sensor info
                    </p>
                </div>
                <Button variant="outline" size="sm">
                    <Link href="/sensors/ph-level/settings" className="flex items-center gap-2">
                        <Settings />
                        Settings
                    </Link>
                </Button>
            </div>

            {/* Current temperature + graph */}
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
                <PHCurrent sensor={sensor} loading={loading} />

                {/* Graph and table */}
                <PHGraph readings={readings} sensor={sensor} loading={loading} />
            </div>

            <PHTable sensor={sensor} readings={readings} loading={loading} />
        </div>
    );
}
