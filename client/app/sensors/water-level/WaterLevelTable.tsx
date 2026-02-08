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
import { findThreshold, getPageItems, getReadingStatus, getStatusLabel, getThresholdColorStyle } from '@/lib/utils';
import { useState } from 'react';
import { Reading, Sensor, ThresholdColors } from "../types";

interface WaterLevelTableProps {
    sensor: Sensor | null;
    readings: Reading[];
    loading: boolean;
}

const ITEMS_PER_PAGE = 10;


export default function WaterLevelTable({ sensor, readings, loading }: WaterLevelTableProps) {
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
                    <CardTitle>Water Level Readings</CardTitle>
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
                    <CardTitle>Water Level Readings</CardTitle>
                    <CardDescription>
                        Detailed list of recorded values
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="h-64 flex items-center justify-center rounded-md border border-dashed text-sm text-muted-foreground">
                        No water level readings available
                    </div>
                </CardContent>
            </Card>
        );
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle>Water Level Readings</CardTitle>
                <CardDescription>
                    Detailed list of recorded values ({readings.length} total)
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="rounded-md border overflow-hidden">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead className="text-center">Water Level (cm)</TableHead>
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
                                            const matched = findThreshold(reading.value, sensor?.thresholds, 'water_level');
                                            const status = matched?.name ?? getReadingStatus(reading.value, sensor?.thresholds, 'water_level');
                                            const colorKey = (matched?.color ?? 'none') as ThresholdColors;
                                            const style = matched ? getThresholdColorStyle(colorKey) : undefined;

                                            return (
                                                <Badge style={style}>
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

