"use client"

import { ColumnDef } from "@tanstack/react-table"
import { VendingpreneurClient } from "@/lib/types"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import { Button } from "@/components/ui/button"
import { ArrowUpDown, MoreHorizontal } from "lucide-react"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

export const columns: ColumnDef<VendingpreneurClient>[] = [
    {
        id: "select",
        header: ({ table }) => (
            <Checkbox
                checked={table.getIsAllPageRowsSelected()}
                onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
                aria-label="Select all"
            />
        ),
        cell: ({ row }) => (
            <Checkbox
                checked={row.getIsSelected()}
                onCheckedChange={(value) => row.toggleSelected(!!value)}
                aria-label="Select row"
            />
        ),
        enableSorting: false,
        enableHiding: false,
    },
    {
        accessorKey: "fullName",
        header: ({ column }) => {
            return (
                <Button
                    variant="ghost"
                    onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
                >
                    Name
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
            )
        },
    },
    {
        accessorKey: "personalEmail",
        header: "Email",
    },
    {
        accessorKey: "city",
        header: "City",
    },
    {
        accessorKey: "state",
        header: "State",
    },
    {
        accessorKey: "membershipLevel",
        header: "Level",
        cell: ({ row }) => {
            const level = row.getValue("membershipLevel") as string
            return (
                <Badge variant={level === "Pro" ? "default" : "secondary"}>
                    {level || "Standard"}
                </Badge>
            )
        },
    },
    {
        accessorKey: "totalMonthlyRevenue",
        header: ({ column }) => {
            return (
                <Button
                    variant="ghost"
                    onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
                >
                    revenue
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
            )
        },
        cell: ({ row }) => {
            return <div className="font-medium">{row.getValue("totalMonthlyRevenue")}</div>
        }
    },
    {
        id: "actions",
        cell: ({ row }) => <ClientActions client={row.original} />,
    },
]

import { ClientSheet } from "@/components/admin/clients/ClientSheet"
import { useState } from "react"

function ClientActions({ client }: { client: VendingpreneurClient }) {
    const [isEditOpen, setIsEditOpen] = useState(false)

    return (
        <>
            <ClientSheet
                client={client}
                open={isEditOpen}
                onOpenChange={setIsEditOpen}
            />
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="h-8 w-8 p-0">
                        <span className="sr-only">Open menu</span>
                        <MoreHorizontal className="h-4 w-4" />
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                    <DropdownMenuLabel>Actions</DropdownMenuLabel>
                    <DropdownMenuItem
                        onClick={() => navigator.clipboard.writeText(client.id)}
                    >
                        Copy Client ID
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setIsEditOpen(true)}>
                        Edit Client
                    </DropdownMenuItem>
                    <DropdownMenuItem className="text-red-600">Delete Client</DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>
        </>
    )
}
