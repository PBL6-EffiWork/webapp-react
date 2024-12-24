import * as React from "react"
import {
  ColumnDef,
  ColumnFiltersState,
  SortingState,
  VisibilityState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
  FilterFn,
} from "@tanstack/react-table"
import { ArrowUpDown, ChevronDown, MoreHorizontal } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
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
import { Card } from "../../../interfaces/card"
import { Column } from "../../../interfaces/column"
import { BoardTableRow } from "../../../interfaces/table"
import { useSelector } from "react-redux"
import { selectBoardMembersId } from "../../../redux/board/boardSlice"
import { User } from "../../../interfaces/user"
import BoardUserGroup from "../BoardBar/BoardUserGroup"
import { useAppDispatch } from "../../../hooks/useAppDispatch"
import { showModalActiveCard, updateCurrentActiveCard } from "../../../redux/activeCard/activeCardSlice"
import { useSearchParams } from "react-router-dom"

// Định nghĩa các hàm filter tùy chỉnh
const memberFilter: FilterFn<BoardTableRow> = (row, columnId, filterValue) => {
  const members = row.getValue(columnId) as User[] | undefined
  if (!members || !filterValue || filterValue.length === 0) return true
  return members.some(member => filterValue.includes(member._id))
}

const statusFilter: FilterFn<BoardTableRow> = (row, columnId, filterValue) => {
  const status = row.getValue(columnId) as string
  if (!filterValue || filterValue.length === 0) return true
  return filterValue.includes(status)
}

export default function CardListTable({ data, boardId }: { data: Column[], boardId: string }) {
  const [sorting, setSorting] = React.useState<SortingState>([])
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([])
  const [columnVisibility, setColumnVisibility] = React.useState<VisibilityState>({})
  const [rowSelection, setRowSelection] = React.useState({})
  
  const members = useSelector(selectBoardMembersId(boardId))
  const dispatch = useAppDispatch()
  const [searchParams, setSearchParams] = useSearchParams()

  const setActiveCard = (card: any) => {
    // Cập nhật data cho cái activeCard trong Redux
    dispatch(updateCurrentActiveCard({
      ...card,
      _id: card.id,
      boardId
    }))
    // Hiện Modal ActiveCard lên
    dispatch(showModalActiveCard())

    setSearchParams({ cardId: card.id })
  }

  const columns: ColumnDef<BoardTableRow>[] = [
    {
      accessorKey: "title",
      header: "Title",
      cell: ({ row }) => <div className="capitalize">{row.getValue("title")}</div>,
      filterFn: "includesString",
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => <div className="capitalize">{row.getValue("status")}</div>,
      filterFn: statusFilter,
    },
    {
      accessorKey: "members",
      header: "Members",
      cell: ({ row }) => {
        const members = row.getValue("members") as User[] | undefined
        if (!members) return null
        return <BoardUserGroup boardUsers={members} limit={3} size={28} />
      },
      filterFn: memberFilter,
    },
    {
      accessorKey: "startDate",
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            Start Date
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        )
      },
      cell: ({ row }) => {
        const startDate = row.getValue("startDate") as number | null
        return startDate ? new Date(startDate).toLocaleDateString() : "N/A"
      },
    },
    {
      accessorKey: "dueDate",
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            Due Date
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        )
      },
      cell: ({ row }) => {
        const dueDate = row.getValue("dueDate") as number | null
        return dueDate ? new Date(dueDate).toLocaleDateString() : "N/A"
      },
    },
    {
      id: "actions",
      enableHiding: false,
      cell: ({ row }) => {
        const card = row.original
  
        return (
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
                onClick={() => navigator.clipboard.writeText(card.id)}
              >
                Copy card ID
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => {
                  setActiveCard(card)
                }}
              >View card details</DropdownMenuItem>
              {/* <DropdownMenuItem>Edit card</DropdownMenuItem> */}
            </DropdownMenuContent>
          </DropdownMenu>
        )
      },
    },
  ]

  // Lấy các giá trị duy nhất cho filter Status
  const statusOptions = React.useMemo(() => {
    const statuses = new Set<string>()
    data.forEach(column => {
      statuses.add(column.title)
    })
    return Array.from(statuses)
  }, [data])

  // Lấy các giá trị thành viên
  const memberOptions = React.useMemo(() => {
    return (members || []).map(member => ({
      id: member._id,
      name: member.displayName,
    }))
  }, [members])

  // Xác định các tùy chọn filter
  const filterOptions = [
    { value: "status", label: "Status" },
    { value: "members", label: "Members" },
  ]

  // Cập nhật columnFilters khi filter được chọn
  // Không cần sử dụng selectedFilter và filterValue riêng lẻ nữa

  const tableData: BoardTableRow[] = React.useMemo(() => {
    return data.flatMap((column) =>
      column.cards.map((card) => ({
        id: card._id,
        title: card.title,
        status: column.title,
        members: (members || []).filter((member) => (card.memberIds || []).includes(member._id)),
        startDate: card.startDate,
        dueDate: card.dueDate,
      }))
    )
  }, [data, members])

  const table = useReactTable({
    data: tableData,
    columns,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      rowSelection,
    },
    // Đăng ký các hàm filter tùy chỉnh
    filterFns: {
      includesString: (row, columnId, filterValue: string[]) => {
        const rowValue = row.getValue(columnId)
        if (typeof rowValue !== "string") return false
        return filterValue.some(value => rowValue.toLowerCase().includes(value.toLowerCase()))
      },
      memberFilter: memberFilter,
      statusFilter: statusFilter,
    },
  })

  // Quản lý trạng thái filter
  const [activeFilters, setActiveFilters] = React.useState<{
    status: string[]
    members: string[]
  }>({
    status: [],
    members: [],
  })

  const handleFilterChange = (filterName: "status" | "members", value: string, checked: boolean) => {
    setActiveFilters(prev => {
      const currentValues = prev[filterName]
      if (checked) {
        return {
          ...prev,
          [filterName]: [...currentValues, value],
        }
      } else {
        return {
          ...prev,
          [filterName]: currentValues.filter(v => v !== value),
        }
      }
    })
  }

  // Cập nhật columnFilters từ activeFilters
  React.useEffect(() => {
    const newFilters: ColumnFiltersState = []

    if (activeFilters.status.length > 0) {
      newFilters.push({
        id: "status",
        value: activeFilters.status,
      })
    }

    if (activeFilters.members.length > 0) {
      newFilters.push({
        id: "members",
        value: activeFilters.members,
      })
    }

    setColumnFilters(newFilters)
  }, [activeFilters])

  return (
    <div className="w-full">
      <div className="flex flex-wrap items-center justify-between py-4 space-x-4">
        <div className="flex items-center space-x-2">
          <Input
            placeholder="Filter titles..."
            value={(table.getColumn("title")?.getFilterValue() as string) ?? ""}
            onChange={(event) =>
              table.getColumn("title")?.setFilterValue(event.target.value)
            }
            className="max-w-sm"
          />

          {/* Dropdown để chọn và quản lý nhiều bộ lọc */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline">
                Filters <ChevronDown className="ml-2 h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-60">
              <DropdownMenuLabel>Filter by</DropdownMenuLabel>
              
              {filterOptions.map(option => (
                <div key={option.value} className="px-4 py-2">
                  <div className="font-semibold mb-2">{option.label}</div>
                  <div className="flex flex-col space-y-1">
                    {option.value === "status" && statusOptions.map(status => (
                      <label key={status} className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          checked={activeFilters.status.includes(status)}
                          onChange={(e) => handleFilterChange("status", status, e.target.checked)}
                        />
                        <span>{status}</span>
                      </label>
                    ))}
                    {option.value === "members" && memberOptions.map(member => (
                      <label key={member.id} className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          checked={activeFilters.members.includes(member.id)}
                          onChange={(e) => handleFilterChange("members", member.id, e.target.checked)}
                        />
                        <span>{member.name}</span>
                      </label>
                    ))}
                  </div>
                </div>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Nút Clear All Filters */}
          {(activeFilters.status.length > 0 || activeFilters.members.length > 0) && (
            <Button variant="ghost" onClick={() => setActiveFilters({ status: [], members: [] })}>
              Clear All Filters
            </Button>
          )}
        </div>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="ml-auto">
              Columns <ChevronDown className="ml-2 h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            {table
              .getAllColumns()
              .filter((column) => column.getCanHide())
              .map((column) => {
                return (
                  <DropdownMenuCheckboxItem
                    key={column.id}
                    className="capitalize"
                    checked={column.getIsVisible()}
                    onCheckedChange={(value) => column.toggleVisibility(!!value)}
                  >
                    {column.id}
                  </DropdownMenuCheckboxItem>
                )
              })}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      <div className="rounded-md border">
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
        {/* <div className="flex-1 text-sm text-muted-foreground">
          {table.getFilteredSelectedRowModel().rows.length} of{" "}
          {table.getFilteredRowModel().rows.length} row(s) selected.
        </div> */}
        <div className="space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
          >
            Previous
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
          >
            Next
          </Button>
        </div>
      </div>
    </div>
  )
}
