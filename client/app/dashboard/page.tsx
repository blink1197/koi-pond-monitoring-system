import PHCard from "./_components/PHCard"
import TemperatureCard from "./_components/TemperatureCard"
import TurbidityCard from "./_components/TurbidityCard"
import WaterLevelCard from "./_components/WaterLevelCard"

export default function DashboardPage() {
  return (
    <div className="grid auto-rows-fr gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">

      {/* Temperature */}
      <TemperatureCard />

      {/* pH */}
      <PHCard />

      {/* Water Level */}
      <WaterLevelCard />

      {/* Turbidity */}
      <TurbidityCard />

    </div>
  )
}
