"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Calendar, Users, FileText, Settings, BarChart3, Shield, Activity } from "lucide-react"
import { cn } from "@/app/lib/utils"

interface SidebarProps {
  userType: 'patient' | 'doctor' | 'staff'
}

const getSidebarItems = (userType: string) => {
  const baseItems = [
    {
      title: "Dashboard",
      href: "/dashboard",
      icon: FileText,
    },
  ]

  switch (userType) {
    case 'patient':
      return [
        ...baseItems,
        {
          title: "Appointments",
          href: "/appointments",
          icon: Calendar,
        },
        {
          title: "Health Records",
          href: "/health-records",
          icon: FileText,
        },
        {
          title: "Find Doctors",
          href: "/doctors",
          icon: Users,
        },
        {
          title: "Health Metrics",
          href: "/health-metrics",
          icon: Activity,
        },
        {
          title: "Settings",
          href: "/settings",
          icon: Settings,
        },
      ]
    
    case 'doctor':
      return [
        ...baseItems,
        {
          title: "Schedule",
          href: "/appointments",
          icon: Calendar,
        },
        {
          title: "Patients",
          href: "/patients",
          icon: Users,
        },
        {
          title: "Consultations",
          href: "/consultations",
          icon: FileText,
        },
        {
          title: "Settings",
          href: "/settings",
          icon: Settings,
        },
      ]
    
    case 'staff':
      return [
        ...baseItems,
        {
          title: "User Management",
          href: "/admin/users",
          icon: Users,
        },
        {
          title: "Appointments",
          href: "/admin/appointments",
          icon: Calendar,
        },
        {
          title: "Reports",
          href: "/admin/reports",
          icon: BarChart3,
        },
        {
          title: "Security",
          href: "/admin/security",
          icon: Shield,
        },
        {
          title: "Settings",
          href: "/admin/settings",
          icon: Settings,
        },
      ]
    
    default:
      return baseItems
  }
}

export function Sidebar({ userType }: SidebarProps) {
  const pathname = usePathname()
  const sidebarItems = getSidebarItems(userType)

  return (
    <div className="pb-12 w-64 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700">
      <div className="space-y-4 py-4">
        <div className="px-3 py-2">
          <h2 className="mb-2 px-4 text-lg font-semibold text-gray-900 dark:text-white">Health Bridge</h2>
          <div className="space-y-1">
            {sidebarItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center rounded-lg px-3 py-2 text-sm font-medium hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors",
                  pathname === item.href 
                    ? "bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300" 
                    : "text-gray-700 dark:text-gray-300"
                )}
              >
                <item.icon className="mr-2 h-4 w-4" />
                {item.title}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}