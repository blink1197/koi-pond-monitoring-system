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

type TemperatureStatus = 'cold' | 'normal' | 'warm' | 'hot';

interface TemperatureThresholds {
    temperature?: {
        cold?: { max: number };
        normal?: { min: number; max: number };
        warm?: { min: number; max: number };
        hot?: { min: number };
    };
}

function getTemperatureStatus(value: number, thresholds?: TemperatureThresholds): TemperatureStatus {
    const tempThresholds = thresholds?.temperature;

    if (!tempThresholds) return 'normal';

    if (tempThresholds.cold && value <= tempThresholds.cold.max) {
        return 'cold';
    }
    if (tempThresholds.hot && value >= tempThresholds.hot.min) {
        return 'hot';
    }
    if (tempThresholds.warm && value >= tempThresholds.warm.min && value <= tempThresholds.warm.max) {
        return 'warm';
    }
    if (tempThresholds.normal && value >= tempThresholds.normal.min && value <= tempThresholds.normal.max) {
        return 'normal';
    }

    return 'normal';
}

function getStatusClasses(status: TemperatureStatus): string {
    switch (status) {
        case 'cold':
            return 'bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-300';
        case 'normal':
            return 'bg-green-50 text-green-700 dark:bg-green-950 dark:text-green-300';
        case 'warm':
            return 'bg-yellow-50 text-yellow-700 dark:bg-yellow-950 dark:text-yellow-300';
        case 'hot':
            return 'bg-red-50 text-red-700 dark:bg-red-950 dark:text-red-300';
        default:
            return '';
    }
}

function getStatusLabel(status: TemperatureStatus): string {
    return status.charAt(0).toUpperCase() + status.slice(1);
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

                                {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                                    <PaginationItem key={page}>
                                        <PaginationLink
                                            onClick={() => handlePageChange(page)}
                                            isActive={currentPage === page}
                                            className="cursor-pointer"
                                        >
                                            {page}
                                        </PaginationLink>
                                    </PaginationItem>
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

