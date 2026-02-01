import Image from "next/image";
import { Button } from "./ui/button";

export function Hero() {
  return (
    <div className="flex flex-col gap-10 items-center">
      {/* Centered Image */}
      <div className="flex justify-center">
        <Image
          src="/logo.png"
          alt="Aqua Sense Logo"
          width={240}
          height={240}
          className="mx-auto"
        />
      </div>

      <p className="text-3xl lg:text-4xl !leading-tight mx-auto max-w-xl text-center">
        Smart Monitoring for a Healthier Koi Pond
      </p>
      <p className="max-w-md text-zinc-600 dark:text-zinc-400">
        Track water temperature, pH, turbidity, and more — all in one dashboard.
      </p>



      <div className="w-full p-[1px] bg-gradient-to-r from-transparent via-foreground/10 to-transparent my-8" />

      <Button>
        Get Started
      </Button>
    </div>
  );
}
