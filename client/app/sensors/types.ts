export interface Threshold {
    name: string;
    min?: number;
    max?: number;
    color?: ThresholdColors;
}

export interface Sensor {
    id: string;
    location: string | null;
    description: string | null;
    model: string | null;
    type: string | null;
    thresholds?: Record<string, Threshold[]>;
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

export type SensorTypes = 'temperature' | 'ph' | 'oxygen' | 'turbidity' | 'water_level';


export interface AggregatedPoint {
    time: string;
    value: number;
}