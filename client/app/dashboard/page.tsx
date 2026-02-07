import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Bubbles, Droplet, Thermometer, Waves } from "lucide-react"
import Link from "next/link"

export default function DashboardPage() {
  return (
    <div className="grid auto-rows-fr gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">

      {/* Temperature */}
      <Card className="w-full min-h-[140px] flex flex-col">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-sm font-medium">
              <Thermometer className="h-4 w-4 text-muted-foreground" />
              Temperature
            </div>
            <div className="flex items-center gap-2 text-xs">
              <span className="h-2 w-2 rounded-full bg-green-500" />
              Normal
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent className="flex-1 text-center">
          <div className="text-3xl font-bold">26.4°C</div>
          <p className="text-xs text-muted-foreground">Normal range</p>
        </CardContent>
        <CardFooter>
          <Button variant="ghost" size="sm" asChild className="px-2">
            <Link href="/sensors/temperature">View details →</Link>
          </Button>
        </CardFooter>
      </Card>

      {/* pH */}
      <Card className="w-full min-h-[140px] flex flex-col">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-sm font-medium">
              <Droplet className="h-4 w-4 text-muted-foreground" />
              pH Level
            </div>
            <div className="flex items-center gap-2 text-xs">
              <span className="h-2 w-2 rounded-full bg-green-500" />
              Normal
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent className="flex-1 text-center">
          <div className="text-3xl font-bold">7.2</div>
          <p className="text-xs text-muted-foreground">Slightly alkaline</p>
        </CardContent>
        <CardFooter>
          <Button variant="ghost" size="sm" asChild className="px-2">
            <Link href="/sensors/ph-level">View details →</Link>
          </Button>
        </CardFooter>
      </Card>

      {/* Water Level */}
      <Card className="w-full min-h-[140px] flex flex-col">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-sm font-medium">
              <Waves className="h-4 w-4 text-muted-foreground" />
              Water Level
            </div>
            <div className="flex items-center gap-2 text-xs">
              <span className="h-2 w-2 rounded-full bg-green-500" />
              Normal
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent className="flex-1 text-center">
          <div className="text-3xl font-bold">78%</div>
          <p className="text-xs text-muted-foreground">Optimal</p>
        </CardContent>
        <CardFooter>
          <Button variant="ghost" size="sm" asChild className="px-2">
            <Link href="/sensors/water-level">View details →</Link>
          </Button>
        </CardFooter>
      </Card>

      {/* Turbidity */}
      <Card className="w-full min-h-[140px] flex flex-col">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-sm font-medium">
              <Bubbles className="h-4 w-4 text-muted-foreground" />
              Turbidity
            </div>
            <div className="flex items-center gap-2 text-xs">
              <span className="h-2 w-2 rounded-full bg-green-500" />
              Normal
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent className="flex-1 text-center">
          <div className="text-3xl font-bold">3.1 NTU</div>
          <p className="text-xs text-muted-foreground">Clear water</p>
        </CardContent>
        <CardFooter>
          <Button variant="ghost" size="sm" asChild className="px-2">
            <Link href="/sensors/turbidity">View details →</Link>
          </Button>
        </CardFooter>
      </Card>

    </div>
  )
}
