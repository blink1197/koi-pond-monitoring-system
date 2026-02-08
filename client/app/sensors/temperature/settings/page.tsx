'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { createClient } from '@/lib/supabase/client';
import { ArrowDown, ArrowUp, Plus, Trash2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Toaster, toast } from 'sonner';
import { Sensor } from '../../types';

const SENSOR_TYPES = ['temperature', 'ph', 'turbidity', 'oxygen', 'water_level'];
const AGGREGATION_INTERVALS = ['hourly', 'daily', 'weekly', 'monthly', 'yearly'];

interface ThresholdLevel {
    name: string;
    min?: number;
    max?: number;
}

export default function TempertureSettingsPage() {
    const [sensor, setSensor] = useState<Sensor | null>(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    // Form state
    const [type, setType] = useState('');
    const [model, setModel] = useState('');
    const [location, setLocation] = useState('');
    const [description, setDescription] = useState('');
    const [aggregationInterval, setAggregationInterval] = useState('daily');
    const [thresholds, setThresholds] = useState<ThresholdLevel[]>([]);

    const supabase = createClient();
    const router = useRouter();

    // Fetch sensor data
    useEffect(() => {
        const fetchSensor = async () => {
            try {
                const { data, error: fetchError } = await supabase
                    .from('sensors')
                    .select('*')
                    .eq('type', 'temperature')
                    .limit(1)
                    .single();

                if (fetchError) throw fetchError;
                if (!data) throw new Error('Sensor not found');

                setSensor(data);
                setType(data.type || '');
                setModel(data.model || '');
                setLocation(data.location || '');
                setDescription(data.description || '');
                setAggregationInterval(data.aggregation_interval || 'daily');

                // Parse thresholds from the temperature key - now as array
                if (data.thresholds && Array.isArray(data.thresholds.temperature)) {
                    setThresholds(data.thresholds.temperature);
                }
            } catch (err) {
                console.error('Error fetching sensor:', err);
                toast.error(err instanceof Error ? err.message : 'Failed to fetch sensor');
            } finally {
                setLoading(false);
            }
        };

        fetchSensor();
    }, [supabase]);

    // Add a new threshold level
    const addThreshold = () => {
        setThresholds([...thresholds, { name: '', min: undefined, max: undefined }]);
    };

    // Update threshold level
    const updateThreshold = (index: number, field: keyof ThresholdLevel, value: string | number | undefined) => {
        const updatedThresholds = [...thresholds];
        if (field === 'min' || field === 'max') {
            updatedThresholds[index][field] = value === '' ? undefined : Number(value);
        } else {
            updatedThresholds[index][field as 'name'] = value as string;
        }
        setThresholds(updatedThresholds);
    };

    // Remove threshold level
    const removeThreshold = (index: number) => {
        setThresholds(thresholds.filter((_, i) => i !== index));
    };

    // Move threshold up
    const moveThresholdUp = (index: number) => {
        if (index === 0) return;
        const updatedThresholds = [...thresholds];
        [updatedThresholds[index - 1], updatedThresholds[index]] = [updatedThresholds[index], updatedThresholds[index - 1]];
        setThresholds(updatedThresholds);
    };

    // Move threshold down
    const moveThresholdDown = (index: number) => {
        if (index === thresholds.length - 1) return;
        const updatedThresholds = [...thresholds];
        [updatedThresholds[index], updatedThresholds[index + 1]] = [updatedThresholds[index + 1], updatedThresholds[index]];
        setThresholds(updatedThresholds);
    };

    // Save settings
    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);

        try {
            if (!sensor) throw new Error('Sensor not found');

            // Build thresholds object with array format
            const thresholdsObj: Record<string, ThresholdLevel[]> = {
                temperature: thresholds.map((threshold) => ({
                    name: threshold.name,
                    ...(threshold.min !== undefined && { min: threshold.min }),
                    ...(threshold.max !== undefined && { max: threshold.max }),
                })),
            };

            const { error: updateError } = await supabase
                .from('sensors')
                .update({
                    type,
                    model,
                    location,
                    description,
                    aggregation_interval: aggregationInterval,
                    thresholds: thresholdsObj,
                })
                .eq('id', sensor.id);

            if (updateError) throw updateError;
            toast.success('Sensor settings updated successfully!');
        } catch (err) {
            console.error('Error saving sensor:', err);
            toast.error(err instanceof Error ? err.message : 'Failed to save sensor settings');
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <p>Loading sensor data...</p>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header Section */}
            <div>
                <h1 className="text-3xl font-bold">Sensor Settings</h1>
                <p className="text-sm text-muted-foreground mt-2">
                    Edit sensor information and configure thresholds
                </p>
            </div>

            <form onSubmit={handleSave} className="space-y-6">
                {/* Cards Grid - Two columns on large screens */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div>
                        {/* Basic Information Card */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Basic Information</CardTitle>
                                <CardDescription>Configure sensor type and identification</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                {/* Sensor ID (read-only) */}
                                <div className="grid gap-2">
                                    <Label htmlFor="id">Sensor ID</Label>
                                    <Input
                                        id="id"
                                        type="text"
                                        value={sensor?.id || ''}
                                        disabled
                                        className="bg-muted"
                                    />
                                </div>

                                {/* Sensor Type */}
                                <div className="grid gap-2">
                                    <Label htmlFor="type">Sensor Type</Label>
                                    <Select value={type} onValueChange={setType} disabled>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select a type" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {SENSOR_TYPES.map((sensorType) => (
                                                <SelectItem key={sensorType} value={sensorType}>
                                                    {sensorType.charAt(0).toUpperCase() + sensorType.slice(1)}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>

                                {/* Model */}
                                <div className="grid gap-2">
                                    <Label htmlFor="model">Model</Label>
                                    <Input
                                        id="model"
                                        type="text"
                                        placeholder="e.g., DS18B20"
                                        value={model}
                                        onChange={(e) => setModel(e.target.value)}
                                    />
                                </div>

                                {/* Location */}
                                <div className="grid gap-2">
                                    <Label htmlFor="location">Location</Label>
                                    <Input
                                        id="location"
                                        type="text"
                                        placeholder="e.g., Top water surface"
                                        value={location}
                                        onChange={(e) => setLocation(e.target.value)}
                                    />
                                </div>

                                {/* Description */}
                                <div className="grid gap-2">
                                    <Label htmlFor="description">Description</Label>
                                    <Input
                                        id="description"
                                        type="text"
                                        placeholder="e.g., Main temperature sensor for koi pond"
                                        value={description}
                                        onChange={(e) => setDescription(e.target.value)}
                                    />
                                </div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle>Data Aggregation</CardTitle>
                                <CardDescription>Configure how sensor data is aggregated over time</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="grid gap-2">
                                    <Label htmlFor="aggregation-interval">Aggregation Interval</Label>
                                    <Select value={aggregationInterval} onValueChange={setAggregationInterval}>
                                        <SelectTrigger>
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {AGGREGATION_INTERVALS.map((interval) => (
                                                <SelectItem key={interval} value={interval}>
                                                    {interval.charAt(0).toUpperCase() + interval.slice(1)}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    <p className="text-sm text-muted-foreground mt-2">
                                        Data will be aggregated at the selected interval for reporting and analysis.
                                    </p>
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Thresholds Card */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Thresholds</CardTitle>
                            <CardDescription>Define temperature ranges for different conditions</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {thresholds.length === 0 ? (
                                <p className="text-sm text-muted-foreground">No thresholds defined yet</p>
                            ) : (
                                <div className="space-y-4">
                                    {thresholds.map((threshold, index) => (
                                        <div key={index} className="border rounded-lg p-4 space-y-3">
                                            <div className="flex items-center justify-between">
                                                <h4 className="font-medium">Threshold {index + 1}</h4>
                                                <div className="flex gap-1">
                                                    {index > 0 && (
                                                        <button
                                                            type="button"
                                                            onClick={() => moveThresholdUp(index)}
                                                            className="text-gray-600 hover:text-gray-700 p-1"
                                                            title="Move up"
                                                        >
                                                            <ArrowUp className="w-4 h-4" />
                                                        </button>
                                                    )}
                                                    {index < thresholds.length - 1 && (
                                                        <button
                                                            type="button"
                                                            onClick={() => moveThresholdDown(index)}
                                                            className="text-gray-600 hover:text-gray-700 p-1"
                                                            title="Move down"
                                                        >
                                                            <ArrowDown className="w-4 h-4" />
                                                        </button>
                                                    )}
                                                    <button
                                                        type="button"
                                                        onClick={() => removeThreshold(index)}
                                                        className="text-red-600 hover:text-red-700 p-1"
                                                    >
                                                        <Trash2 className="w-4 h-4" />
                                                    </button>
                                                </div>
                                            </div>

                                            <div className="grid gap-2">
                                                <Label htmlFor={`threshold-name-${index}`}>Condition Name</Label>
                                                <Input
                                                    id={`threshold-name-${index}`}
                                                    type="text"
                                                    placeholder="e.g., normal, warm, hot, cold"
                                                    value={threshold.name}
                                                    onChange={(e) => updateThreshold(index, 'name', e.target.value)}
                                                />
                                            </div>

                                            <div className="grid grid-cols-2 gap-4">
                                                <div className="grid gap-2">
                                                    <Label htmlFor={`threshold-min-${index}`}>Min Value</Label>
                                                    <Input
                                                        id={`threshold-min-${index}`}
                                                        type="number"
                                                        step="0.1"
                                                        placeholder="e.g., 20"
                                                        value={threshold.min ?? ''}
                                                        onChange={(e) => updateThreshold(index, 'min', e.target.value)}
                                                    />
                                                </div>
                                                <div className="grid gap-2">
                                                    <Label htmlFor={`threshold-max-${index}`}>Max Value</Label>
                                                    <Input
                                                        id={`threshold-max-${index}`}
                                                        type="number"
                                                        step="0.1"
                                                        placeholder="e.g., 27"
                                                        value={threshold.max ?? ''}
                                                        onChange={(e) => updateThreshold(index, 'max', e.target.value)}
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}

                            <Button
                                type="button"
                                variant="outline"
                                onClick={addThreshold}
                                className="w-full"
                            >
                                <Plus className="w-4 h-4 mr-2" />
                                Add Threshold
                            </Button>
                        </CardContent>
                    </Card>
                </div>

                {/* Aggregation Interval Card */}


                {/* Action Buttons */}
                <div className="flex gap-3 justify-end">
                    <Button
                        type="submit"
                        disabled={saving}
                    >
                        {saving ? 'Saving...' : 'Save Settings'}
                    </Button>
                    <Button
                        type="button"
                        variant="outline"
                        onClick={() => router.push('/sensors/temperature')}
                    >
                        Cancel
                    </Button>
                </div>
            </form>
            <Toaster />
        </div>
    );
}   