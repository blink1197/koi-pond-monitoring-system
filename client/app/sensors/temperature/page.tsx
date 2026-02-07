'use client';
import { createClient } from '@/lib/supabase/client';
import { useEffect, useState } from 'react';
import { Reading, Sensor } from '../types';
import TemperatureCurrent from "./TemperatureCurrent";
import TemperatureGraph from "./TemperatureGraph";
import TemperatureTable from "./TemperatureTable";

export default function TemperaturePage() {
    const [sensor, setSensor] = useState<Sensor | null>(null);
    const [readings, setReadings] = useState<Reading[]>([]);
    const [loading, setLoading] = useState(true);

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

            // Fetch valid readings for this sensor
            const { data: readingsData, error: readingsError } = await supabase
                .from("readings")
                .select("*")
                .eq("sensor_id", sensorData.id)
                .eq("is_valid", true)
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
            <div>
                <h1 className="text-2xl font-semibold">Temperature Details</h1>
                <p className="text-sm text-muted-foreground">
                    Latest temperature reading and sensor info
                </p>
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
