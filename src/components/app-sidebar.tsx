import * as React from "react"

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
} from "@/components/ui/sidebar"
import { LogoComponent } from "./LogoComponent"
import { useAuth } from "../auth/useAuth";

// This is sample data.
const data = {
  navMain: [
    {
      title: "Main",
      items: [
        {
          title: "Dashboard",
          url: "/dashboard",
        },
        {
          title: "Acquisition",
          url: "/acquisition",
        },
        {
          title: "Closers",
          url: "/closers",
        },
        {
          title: "Setters",
          url: "/setters",
        },
        {
          title: "Coaches",
          url: "/coaches",
        },
        {
          title: "Leads",
          url: "/leads",
        }
      ],
    },
    {
      title: "Admin",
      items: [
        {
          title: "Invite",
          url: "/invite",
        },
      ],
    },
    {
      title: "Account",
      items: [
        {
          title: "Log out",
          url: "#",
        },
      ],
    },
  ],
}

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  // Track the current active path to highlight the corresponding sidebar item.
  const [activePath, setActivePath] = React.useState<string>("/dashboard")
  const { logout } = useAuth();

  // Sync with the browser's current location on mount (client-side only).
  React.useEffect(() => {
    if (typeof window !== "undefined" && window.location.pathname) {
      setActivePath(window.location.pathname)
    }
  }, [])

  return (
      <Sidebar variant="floating" {...props}>
        <SidebarHeader>
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton className="hover:bg-transparent hover:text-inherit focus-visible:ring-2 focus-visible:ring-sidebar-ring" size="lg" asChild>
                <a href="#">
                  <div className="text-primary-foreground flex aspect-square size-8 items-center justify-center rounded-lg">
                    <LogoComponent />
                  </div>
                  <div className="flex flex-col gap-0.5 leading-none">
                    <span className="font-medium">INFOSCALER</span>
                    {/* <span className="">v1.0.0</span> */}
                  </div>
                </a>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarHeader>
        <SidebarContent>
          <SidebarGroup>
            <SidebarMenu className="gap-2">
              {data.navMain.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton
                    asChild
                    className="hover:bg-transparent hover:text-inherit focus-visible:ring-2 focus-visible:ring-sidebar-ring"
                  >
                    <p className="font-medium">
                      {item.title}
                    </p>
                  </SidebarMenuButton>
                  {item.items?.length ? (
                    <SidebarMenuSub className="ml-0 border-l-0 px-1.5">
                      {item.items.map((item) => (
                        <SidebarMenuSubItem key={item.title}>
                          <SidebarMenuSubButton 
                            asChild 
                            isActive={activePath === item.url && item.title !== "Log out"}
                            onClick={() => {
                              if (item.title === "Log out") {
                                logout();
                              } else {
                                setActivePath(item.url);
                              }
                            }}
                          >
                            {item.title === "Log out" ? (
                              <a href={item.url}>
                                <button type="button">{item.title}</button>
                              </a>
                            ) : (
                              <a href={item.url}>{item.title}</a>
                            )}
                          </SidebarMenuSubButton>
                        </SidebarMenuSubItem>
                      ))}
                    </SidebarMenuSub>
                  ) : null}
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroup>
        </SidebarContent>
      </Sidebar>
  )
}
