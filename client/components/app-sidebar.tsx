"use client"

import {
    ComponentIcon,
    Radio
} from "lucide-react"
import Image from "next/image"
import * as React from "react"

import { NavMain } from "@/components/nav-main"
import { NavUser } from "@/components/nav-user"
import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarHeader,
    SidebarRail,
} from "@/components/ui/sidebar"
import { createClient } from "@/lib/supabase/client"
import { ThemeSwitcher } from "./theme-switcher"

const navMain = [
    {
        title: "Sensors",
        url: "#",
        icon: Radio,
        isActive: true,
        items: [
            { title: "Temperature", url: "/sensors/temperature" },
            { title: "pH Level", url: "/sensors/ph-level" },
            { title: "Water Level", url: "/sensors/water-level" },
            { title: "Turbidity", url: "/sensors/turbidity" },
            { title: "Live Video Feed", url: "/sensors/#" },
        ],
    },
    {
        title: "Actuators",
        url: "#",
        icon: ComponentIcon,
        isActive: true,
        items: [{ title: "Fish Feeder", url: "#" }],
    },
    // {
    //     title: "Settings",
    //     url: "#",
    //     icon: Settings2,
    //     items: [{ title: "General", url: "#" }],
    // },
]

export function AppSidebar(props: React.ComponentProps<typeof Sidebar>) {
    const [user, setUser] = React.useState<{
        name: string
        email: string
        avatar: string
    } | null>(null)

    React.useEffect(() => {
        const getUser = async () => {
            const supabase = createClient()
            const { data } = await supabase.auth.getUser()

            if (data?.user) {
                const u = data.user
                setUser({
                    name: "Admin",
                    email: u.email || "",
                    avatar: u.user_metadata?.avatar_url || "/avatars/default.png",
                })
            }
        }

        getUser()
    }, [])

    return (
        <Sidebar
            {...props}
            className="bg-background border-r z-50"
        >
            <SidebarHeader>
                <div className="flex items-center gap-2 px-2 py-1.5">
                    <Image src="/logo.png" alt="Aqua Sense logo" width={64} height={64} />
                    <span className="text-sm font-semibold">Aqua Sense</span>
                </div>
            </SidebarHeader>

            <SidebarContent>
                <NavMain items={navMain} />
            </SidebarContent>

            <SidebarFooter>
                <div className="flex items-center justify-between px-2">
                    <span className="text-xs text-foreground">Change Theme</span>
                    <ThemeSwitcher />
                </div>

                {/* show fallback while loading */}
                {user ? (
                    <NavUser user={user} />
                ) : (
                    <NavUser
                        user={{
                            name: "Loading...",
                            email: "",
                            avatar: "/avatars/default.png",
                        }}
                    />
                )}
            </SidebarFooter>

            <SidebarRail />
        </Sidebar>
    )
}
