import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"


export default function TemperatureTable() {
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
                    Temperature data table placeholder
                </div>
            </CardContent>
        </Card>
    )
}

