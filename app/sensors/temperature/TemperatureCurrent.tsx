import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"

export default function TemperatureCurrent() {
    const currentTemp = 26 // example value, could be dynamic
    let status = "Normal"
    let statusColor = "green-500"

    // Determine status based on koi pond thresholds
    if (currentTemp < 18 || currentTemp > 30) {
        status = "Critical"
        statusColor = "red-500"
    } else if (currentTemp < 24 || currentTemp > 27) {
        status = "Caution"
        statusColor = "yellow-500"
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle>Current Temperature</CardTitle>
                <CardDescription>
                    Latest recorded temperature from the pond sensor
                </CardDescription>
            </CardHeader>

            <CardContent className="space-y-4">
                {/* Main reading */}
                <div className="flex items-center justify-between">
                    <span className="text-4xl font-bold">{currentTemp} °C</span>
                    <span className="text-sm text-muted-foreground">Updated just now</span>
                </div>

                {/* Sensor info */}
                <div className="border-t pt-4 space-y-2 text-sm">
                    <div className="flex justify-between">
                        <span className="text-muted-foreground">Sensor ID</span>
                        <span className="font-medium">KOI-001</span>
                    </div>

                    <div className="flex justify-between">
                        <span className="text-muted-foreground">Sensor Type</span>
                        <span className="font-medium">DS18B20</span>
                    </div>

                    {/* Status with tooltip */}
                    <div className="flex justify-between items-center">
                        <span className="text-muted-foreground">Status</span>
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <span className="flex items-center gap-2 font-medium cursor-pointer">
                                    <span
                                        className={`h-2.5 w-2.5 rounded-full bg-${statusColor}`}
                                    />
                                    {status}
                                </span>
                            </TooltipTrigger>
                            <TooltipContent className="max-w-xs">
                                {status === "Normal" &&
                                    "Temperature is optimal for koi (24-27°C)."}
                                {status === "Caution" &&
                                    "Temperature is outside ideal range (18-23°C or 28-30°C). Monitor fish closely."}
                                {status === "Critical" &&
                                    "Temperature is critical (<18°C or >30°C). Immediate action needed!"}
                            </TooltipContent>
                        </Tooltip>
                    </div>

                    <div className="flex justify-between">
                        <span className="text-muted-foreground">Location</span>
                        <span className="font-medium">Pond A</span>
                    </div>

                    {/* Thresholds tooltip */}
                    <div className="flex justify-between">
                        <span className="text-muted-foreground">Ideal Temp</span>
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <span className="font-medium cursor-pointer">24-27°C</span>
                            </TooltipTrigger>
                            <TooltipContent>
                                Ideal temperature range for koi growth and activity.
                            </TooltipContent>
                        </Tooltip>
                    </div>
                </div>
            </CardContent>
        </Card>
    )
}
