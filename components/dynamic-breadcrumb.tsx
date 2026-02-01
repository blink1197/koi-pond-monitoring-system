"use client"

import {
    Breadcrumb,
    BreadcrumbItem,
    BreadcrumbLink,
    BreadcrumbList,
    BreadcrumbPage,
    BreadcrumbSeparator
} from "@/components/ui/breadcrumb"
import Link from "next/link"
import { usePathname } from "next/navigation"

export function DynamicBreadcrumb() {
    const pathname = usePathname()

    // Split path into segments
    const segments = pathname.split("/").filter(Boolean)

    // Build breadcrumb paths
    const breadcrumbs = segments.map((segment, index) => {
        const href = "/" + segments.slice(0, index + 1).join("/")
        const label = segment
            .replace(/-/g, " ")
            .replace(/\b\w/g, (c) => c.toUpperCase())

        return { href, label }
    })

    return (
        <Breadcrumb>
            <BreadcrumbList>
                <BreadcrumbItem>
                    <BreadcrumbLink asChild>
                        <Link href="/">Home</Link>
                    </BreadcrumbLink>
                </BreadcrumbItem>

                {breadcrumbs.map((crumb, index) => (
                    <span key={crumb.href} className="flex items-center">
                        <BreadcrumbSeparator />
                        <BreadcrumbItem>
                            {index === breadcrumbs.length - 1 ? (
                                <BreadcrumbPage>{crumb.label}</BreadcrumbPage>
                            ) : (
                                <BreadcrumbLink asChild>
                                    <Link href={crumb.href}>{crumb.label}</Link>
                                </BreadcrumbLink>
                            )}
                        </BreadcrumbItem>
                    </span>
                ))}
            </BreadcrumbList>
        </Breadcrumb>
    )
}
