'use client';
import { Badge } from "@/components/ui/badge";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import {
    Pagination,
    PaginationContent,
    PaginationEllipsis,
    PaginationItem,
    PaginationLink,
    PaginationNext,
    PaginationPrevious,
} from "@/components/ui/pagination";
import { Skeleton } from "@/components/ui/skeleton";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { useState } from 'react';
import { Reading, Sensor } from "../types";

interface TemperatureTableProps {
    sensor: Sensor | null;
    readings: Reading[];
    loading: boolean;
}

const ITEMS_PER_PAGE = 10;

function getTemperatureStatus(value: number, thresholds?: Sensor['thresholds']): string {
    const tempThresholds = thresholds?.temperature;
    if (!Array.isArray(tempThresholds) || tempThresholds.length === 0) return 'Unknown';

    // First, try to find an exact match
    for (const threshold of tempThresholds) {
        const { min, max } = threshold;

        // Check if value falls within this threshold's range
        if ((min === undefined || value >= min) && (max === undefined || value <= max)) {
            return threshold.name;
        }
    }

    // If no exact match, find the closest threshold
    let closestThreshold = tempThresholds[0];
    let closestDistance = Math.abs(value - (closestThreshold.max ?? closestThreshold.min ?? 0));

    for (const threshold of tempThresholds.slice(1)) {
        const thresholdCenter = threshold.max !== undefined && threshold.min !== undefined
            ? (threshold.min + threshold.max) / 2
            : threshold.max ?? threshold.min ?? 0;

        const distance = Math.abs(value - thresholdCenter);
        if (distance < closestDistance) {
            closestDistance = distance;
            closestThreshold = threshold;
        }
    }

    return closestThreshold.name;
}

function getStatusClasses(status: string): string {
    const statusLower = status.toLowerCase();

    // Map status names to color classes
    if (statusLower.includes('cold') || statusLower.includes('freezing')) {
        return 'bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-300';
    }
    if (statusLower.includes('hot') || statusLower.includes('extreme')) {
        return 'bg-red-50 text-red-700 dark:bg-red-950 dark:text-red-300';
    }
    if (statusLower.includes('warm') || statusLower.includes('high')) {
        return 'bg-yellow-50 text-yellow-700 dark:bg-yellow-950 dark:text-yellow-300';
    }
    if (statusLower.includes('normal') || statusLower.includes('ideal') || statusLower.includes('optimal')) {
        return 'bg-green-50 text-green-700 dark:bg-green-950 dark:text-green-300';
    }

    // Default to neutral gray
    return 'bg-gray-50 text-gray-700 dark:bg-gray-950 dark:text-gray-300';
}

function getStatusLabel(status: string): string {
    return status.charAt(0).toUpperCase() + status.slice(1);
}

function getPageItems(totalPages: number, currentPage: number): (number | 'ellipsis')[] {
    if (totalPages <= 7) return Array.from({ length: totalPages }, (_, i) => i + 1);

    const pages: (number | 'ellipsis')[] = [];
    pages.push(1);

    const left = Math.max(2, currentPage - 1);
    const right = Math.min(totalPages - 1, currentPage + 1);

    if (left > 2) pages.push('ellipsis');

    for (let i = left; i <= right; i++) pages.push(i);

    if (right < totalPages - 1) pages.push('ellipsis');

    pages.push(totalPages);
    return pages;
}

export default function TemperatureTable({ sensor, readings, loading }: TemperatureTableProps) {
    const [currentPage, setCurrentPage] = useState(1);

    const totalPages = Math.ceil(readings.length / ITEMS_PER_PAGE);
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    const currentReadings = readings.slice(startIndex, startIndex + ITEMS_PER_PAGE);

    const handlePageChange = (page: number) => {
        setCurrentPage(Math.max(1, Math.min(page, totalPages)));
    };

    if (loading) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle>Temperature Readings</CardTitle>
                    <CardDescription>
                        Detailed list of recorded values
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    {[...Array(5)].map((_, i) => (
                        <div key={i} className="flex justify-between">
                            <Skeleton className="w-32 h-4" />
                            <Skeleton className="w-20 h-4" />
                            <Skeleton className="w-16 h-4" />
                        </div>
                    ))}
                </CardContent>
            </Card>
        );
    }

    if (readings.length === 0) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle>Temperature Readings</CardTitle>
                    <CardDescription>
                        Detailed list of recorded values
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="h-64 flex items-center justify-center rounded-md border border-dashed text-sm text-muted-foreground">
                        No temperature readings available
                    </div>
                </CardContent>
            </Card>
        );
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle>Temperature Readings</CardTitle>
                <CardDescription>
                    Detailed list of recorded values ({readings.length} total)
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="rounded-md border overflow-hidden">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead className="text-center">Temp (°C)</TableHead>
                                <TableHead className="text-center">Recorded At</TableHead>
                                <TableHead className="text-center">Status</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {currentReadings.map((reading) => (
                                <TableRow key={`${reading.sensor_id}-${reading.recorded_at}`}>
                                    <TableCell className="font-medium text-center">
                                        {reading.value.toFixed(1)}
                                    </TableCell>
                                    <TableCell className="text-sm text-muted-foreground text-center">
                                        {new Date(reading.recorded_at).toLocaleString()}
                                    </TableCell>
                                    <TableCell className="text-center">
                                        {(() => {
                                            const status = getTemperatureStatus(reading.value, sensor?.thresholds);
                                            return (
                                                <Badge className={getStatusClasses(status)}>
                                                    {getStatusLabel(status)}
                                                </Badge>
                                            );
                                        })()}
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                    <div className="flex justify-center">
                        <Pagination>
                            <PaginationContent>
                                <PaginationItem>
                                    <PaginationPrevious
                                        onClick={() => handlePageChange(currentPage - 1)}
                                        className={currentPage === 1 ? "pointer-events-none opacity-50" : "cursor-pointer"}
                                    />
                                </PaginationItem>

                                {getPageItems(totalPages, currentPage).map((p, idx) => (
                                    p === 'ellipsis' ? (
                                        <PaginationItem key={`e-${idx}`}>
                                            <PaginationEllipsis />
                                        </PaginationItem>
                                    ) : (
                                        <PaginationItem key={p}>
                                            <PaginationLink
                                                onClick={() => handlePageChange(Number(p))}
                                                isActive={currentPage === p}
                                                className="cursor-pointer"
                                            >
                                                {p}
                                            </PaginationLink>
                                        </PaginationItem>
                                    )
                                ))}

                                <PaginationItem>
                                    <PaginationNext
                                        onClick={() => handlePageChange(currentPage + 1)}
                                        className={currentPage === totalPages ? "pointer-events-none opacity-50" : "cursor-pointer"}
                                    />
                                </PaginationItem>
                            </PaginationContent>
                        </Pagination>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}

