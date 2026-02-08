export interface Sensor {
    id: string;
    location: string | null;
    description: string | null;
    model: string | null;
    type: string | null;
    thresholds?: {
        temperature?: {
            cold?: { max: number };
            normal?: { min: number; max: number };
            warm?: { min: number; max: number };
            hot?: { min: number };
        };
    };
}

export interface Reading {
    value: number;
    recorded_at: string;
    is_valid: boolean;
    sensor_id: string;
}

export interface SensorWithReading extends Sensor {
    latestReading: Reading | null;
    loading?: boolean;
}

export type ThresholdColors = 'none' | 'blue' | 'green' | 'yellow' | 'orange' | 'red';