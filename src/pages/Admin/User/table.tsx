"use client"

import { useState, useMemo, useCallback, useEffect } from "react"
import {
  useReactTable,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  flexRender,
  createColumnHelper,
  Row,
  ColumnFiltersState,
  FilterFn,
} from "@tanstack/react-table"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { ChevronDown, MoreHorizontal, ChevronLeft, ChevronRight, Bell, UserMinus, UserPlus } from 'lucide-react'
import { useDispatch, useSelector } from "react-redux"
import { activateUserThunk, deactivateUserThunk, loadUpcomingTaskThunk, removeMemberFromBoardThunk, selectAllMembersBoard, selectBoardMembersId, selectMembersUpcomingTask, selectMembersUpcomingTaskAll } from "../../../redux/board/boardSlice"
import { useAppDispatch } from "../../../hooks/useAppDispatch"
import { User } from "../../../interfaces/user"
import { useTranslation } from "react-i18next"
import { Checkbox } from "@/components/ui/checkbox"
import React from "react"
import { selectCurrentUser } from "../../../redux/user/userSlice"
import { sendReminderAPI } from "../../../apis"
import { toast } from "react-toastify"

interface Member extends User {
  upcomingTask?: string;
  dueDateTask?: string;
  selected?: boolean;
}

const roles = ["manager", "client"]
const statuses = ["active", "inactive"]

const statusToBoolean = (status: string): boolean => status === 'active'

// Define custom filter functions
const roleFilterFn: FilterFn<Member> = (row, columnId, filterValue) => {
  if (!Array.isArray(filterValue)) return true
  return filterValue.includes(row.getValue(columnId))
}

const statusFilterFn: FilterFn<Member> = (row, columnId, filterValue) => {
  if (!Array.isArray(filterValue)) return true
  return filterValue.includes(row.getValue(columnId))
}

interface ManagerMembersTableProps {
  boardId?: string
}

export default function ManagerMembersTable({ boardId }: ManagerMembersTableProps) {
  const [globalFilter, setGlobalFilter] = useState("")
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])
  const { t } = useTranslation()
  const dispatch = useAppDispatch()
  const members = useSelector(selectAllMembersBoard)
  const currentUser = useSelector(selectCurrentUser)
  const [selectedMembers, setSelectedMembers] = useState<string[]>([])


  const deactivateUser = (member: Member) => {
    dispatch(deactivateUserThunk(member._id))
  }

  const activateUser = (member: Member) => {
    dispatch(activateUserThunk(member._id))
  }

  const handleCheckboxChange = useCallback((memberId: string, checked: boolean | string) => {
    setSelectedMembers((prev) => checked ? [...prev, memberId] : prev.filter((id) => id !== memberId))
  }, [])

  const handleAllCheckboxChange = useCallback((checked: boolean | string) => {
    setSelectedMembers(checked ? members.map((member) => member._id) : [])
  }, [members])

  const columnHelper = createColumnHelper<Member>()
  const columns = useMemo(
    () => [
      columnHelper.accessor("selected", {
        header: () => <Checkbox checked={selectedMembers.length === members.length} onCheckedChange={(checked) => handleAllCheckboxChange(checked)} />,
        cell: (info) => <Checkbox checked={selectedMembers.includes(info.row.original._id)} onCheckedChange={(checked) => handleCheckboxChange(info.row.original._id, checked)} id={info.row.original._id} />,
      }),
      columnHelper.accessor("displayName", {
        header: t('displayName'),
        cell: (info) => (
          <span className="font-semibold">{info.getValue()}</span>
        ),
      }),
      columnHelper.accessor("email", {
        header: t('email'),
      }),
      columnHelper.accessor("role", {
        header: t('role'),
        filterFn: roleFilterFn,
        enableSorting: true,
        cell: (info) => (
          <Badge variant={info.getValue() as "manager" | "member" | "admin"}>
            {t(`roles.${info.getValue()}`)}
          </Badge>
        ),
      }),
      columnHelper.accessor("isActive", {
        header: t('isActive'),
        filterFn: statusFilterFn,
        cell: (info) => (
          <Badge variant={info.getValue() ? "default" : "destructive"}>
            {info.getValue() ? t('active') : t('inactive')}
          </Badge>
        ),
      }),
      columnHelper.accessor("createdAt", {
        header: t('createdAt'),
        cell: (info) => new Date(info.getValue()).toLocaleDateString(),
      }),
      columnHelper.display({
        id: "actions",
        cell: (info) => {
          return currentUser?._id === info.row.original._id ? null : (
              <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="h-8 w-8 p-0">
                  <span className="sr-only">Open menu</span>
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>{t('actions')}</DropdownMenuLabel>
                <DropdownMenuItem 
                  className="cursor-pointer"
                >
                  <Bell className="mr-2 h-4 w-4" />
                  View Profile
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                {
                  info.row.original.isActive ? (
                    <DropdownMenuItem 
                      className="bg-destructive text-destructive-foreground focus:bg-danger focus:text-danger-foreground cursor-pointer" 
                      onClick={() => deactivateUser(info.row.original)}
                    >
                      <UserMinus className="mr-2 h-4 w-4" />
                      Deactivate User
                    </DropdownMenuItem>
                  ) : (
                    <DropdownMenuItem 
                      className="bg-green-500 text-green-100 focus:bg-green-600 focus:text-green-200 cursor-pointer" 
                      onClick={() => activateUser(info.row.original)}
                    >
                      <UserPlus className="mr-2 h-4 w-4" />
                      Activate User
                    </DropdownMenuItem>
                  )
                }
              </DropdownMenuContent>
            </DropdownMenu>
          )
        },
      }),
    ],
    [columnHelper]
  )

  const table = useReactTable({
    data: members,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    initialState: {
      pagination: {
        pageSize: 10,
      },
    },
    state: {
      globalFilter,
      columnFilters,
    },
    onGlobalFilterChange: setGlobalFilter,
    onColumnFiltersChange: setColumnFilters,
  })

  // Handlers to update column filters
  const handleRoleFilterChange = (role: string) => {
    setColumnFilters((current) => {
      const existingFilter = current.find(filter => filter.id === 'role')
      
      if (existingFilter) {
        // Type assertion: existingFilter.value is string[]
        const currentValues = existingFilter.value as string[]
        const newValues = currentValues.includes(role)
          ? currentValues.filter((val: string) => val !== role)
          : [...currentValues, role]
        
        // If no filters left, remove the filter
        if (newValues.length === 0) {
          return current.filter(filter => filter.id !== 'role')
        }

        // Otherwise, update the filter
        return current.map(filter =>
          filter.id === 'role' ? { ...filter, value: newValues } : filter
        )
      } else {
        // Add new filter
        return [...current, { id: 'role', value: [role] }]
      }
    })
  }

  const handleStatusFilterChange = (status: string) => {
    const boolValue = statusToBoolean(status)
    setColumnFilters((current) => {
      const existingFilter = current.find(filter => filter.id === 'isActive')
      
      if (existingFilter) {
        // Type assertion: existingFilter.value is boolean[]
        const currentValues = existingFilter.value as boolean[]
        const newValues = currentValues.includes(boolValue)
          ? currentValues.filter((val: boolean) => val !== boolValue)
          : [...currentValues, boolValue]
        
        // If no filters left, remove the filter
        if (newValues.length === 0) {
          return current.filter(filter => filter.id !== 'isActive')
        }

        // Otherwise, update the filter
        return current.map(filter =>
          filter.id === 'isActive' ? { ...filter, value: newValues } : filter
        )
      } else {
        // Add new filter
        return [...current, { id: 'isActive', value: [boolValue] }]
      }
    })
  }


  useEffect(() => {
    if (!members.length) return
    
    members.forEach(member => {
      dispatch(loadUpcomingTaskThunk(member._id))
    })
  }, [members, dispatch])

  return (
    <div className="space-y-4 min-h-[500px]">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Input
            placeholder="Search members..."
            value={globalFilter ?? ""}
            onChange={(e) => setGlobalFilter(e.target.value)}
            className="w-[300px]"
          />
          {/* Filters */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline">
                Filters <ChevronDown className="ml-2 h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-60">
              <DropdownMenuLabel>Filter by</DropdownMenuLabel>
              
              <div className="px-4 py-2">
                <div className="font-semibold mb-2">Role</div>
                <div className="flex flex-col space-y-1">
                  {roles.map(role => {
                    const roleFilter = table
                      .getColumn('role')
                      ?.getFilterValue() as string[] | undefined
                    const isChecked = roleFilter?.includes(role) || false
                    return (
                      <label key={role} className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => handleRoleFilterChange(role)}
                        />
                        <span className="capitalize">{t(`roles.${role}`)}</span>
                      </label>
                    )
                  })}
                </div>
              </div>
              
              <div className="px-4 py-2">
                <div className="font-semibold mb-2">Status</div>
                <div className="flex flex-col space-y-1">
                  {statuses.map(status => {
                    const boolValue = statusToBoolean(status)
                    const statusFilter = table
                      .getColumn('isActive')
                      ?.getFilterValue() as boolean[] | undefined
                    const isChecked = statusFilter?.includes(boolValue) || false
                    return (
                      <label key={status} className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => handleStatusFilterChange(status)}
                        />
                        <span>{t(`${status}`)}</span>
                      </label>
                    )
                  })}
                </div>
              </div>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="ml-auto">
              Columns <ChevronDown className="ml-2 h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            {table.getAllLeafColumns().map((column) => {
              if (column.id === 'actions') return null 
              return (
                <DropdownMenuCheckboxItem
                  key={column.id}
                  className="capitalize"
                  checked={column.getIsVisible()}
                  onCheckedChange={(value) => column.toggleVisibility(!!value)}
                >
                  {t(`${column.id}`)}
                </DropdownMenuCheckboxItem>
              )
            })}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      <div className="rounded-md border bg-white">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  return (
                    <TableHead key={header.id}>
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
                    </TableHead>
                  )
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && "selected"}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={columns.length} className="h-24 text-center">
                  No results.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      <div className="flex items-center justify-end space-x-2 py-4">
        <Button
          variant="outline"
          size="sm"
          onClick={() => table.previousPage()}
          disabled={!table.getCanPreviousPage()}
        >
          <ChevronLeft className="h-4 w-4" />
          Previous
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => table.nextPage()}
          disabled={!table.getCanNextPage()}
        >
          Next
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  )
}
