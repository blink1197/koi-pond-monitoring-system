import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"


export default function TemperatureGraph() {
    return (
        <Card className="lg:col-span-2">
            <CardHeader>
                <CardTitle>Temperature Trend</CardTitle>
                <CardDescription>
                    Temperature changes over time
                </CardDescription>
            </CardHeader>
            <CardContent>
                <div className="h-64 flex items-center justify-center rounded-md border border-dashed text-sm text-muted-foreground">
                    Temperature line graph placeholder
                </div>
            </CardContent>
        </Card>
    )
}

