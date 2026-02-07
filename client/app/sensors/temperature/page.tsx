import TemperatureCurrent from "./TemperatureCurrent"
import TemperatureGraph from "./TemperatureGraph"
import TemperatureTable from "./TemperatureTable"

export default function TemperaturePage() {
    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-semibold">Temperature Details</h1>
                <p className="text-sm text-muted-foreground">
                    Historical temperature readings and sensor data
                </p>
            </div>

            {/* Current temp + line graph */}
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
                {/* Current reading */}
                <TemperatureCurrent />
                {/* Line graph */}
                <TemperatureGraph />
            </div>
            {/* Data table */}
            <TemperatureTable />
        </div>
    )
}
