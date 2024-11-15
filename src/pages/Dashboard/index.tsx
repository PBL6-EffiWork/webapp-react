import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"

import { dashboardHelper } from './services/api';

function Dashboard() {
    const [totalUsers, setTotalUsers] = useState([]);
    useEffect(() => {
        dashboardHelper.countUser()
        .then(data => setTotalUsers(data.total))
        .catch(error => console.error(error));
    }, []);

    const [totalProjects, setTotalProjects] = useState([]);
    useEffect(() => {
        dashboardHelper.countBoard()
        .then(data => setTotalProjects(data.total))
        .catch(error => console.error(error));
    }, []);

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 p-8">
      <main className="container mx-auto">
        <h1 className="text-3xl font-bold text-gray-800 dark:text-white mb-8">Dashboard</h1>
        
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Projects</CardTitle>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                className="h-4 w-4 text-muted-foreground"
              >
                <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
              </svg>
            </CardHeader>
            <CardContent>
                <div className="text-2xl font-bold">{totalProjects}</div>
              {/* <p className="text-xs text-muted-foreground">+20.1% so với tháng trước</p> */}
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Users</CardTitle>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                className="h-4 w-4 text-muted-foreground"
              >
                <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
                <circle cx="9" cy="7" r="4" />
                <path d="M22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" />
              </svg>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalUsers}</div>
              {/* <p className="text-xs text-muted-foreground">+180.1% so với tháng trước</p> */}
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Managers</CardTitle>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                className="h-4 w-4 text-muted-foreground"
              >
                <rect width="20" height="14" x="2" y="5" rx="2" />
                <path d="M2 10h20" />
              </svg>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">+12.234</div>
              {/* <p className="text-xs text-muted-foreground">+19% so với tháng trước</p> */}
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Events</CardTitle>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                className="h-4 w-4 text-muted-foreground"
              >
                <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
              </svg>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">+573</div>
              {/* <p className="text-xs text-muted-foreground">+201 từ giờ trước</p> */}
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Top 5 Khách hàng</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[100px]">Hạng</TableHead>
                    <TableHead>Tên</TableHead>
                    <TableHead>Tổng chi tiêu</TableHead>
                    <TableHead className="text-right">Lần mua gần nhất</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {[
                    { rank: 1, name: "Nguyễn Văn A", spend: "5.230.000 ₫", lastPurchase: "15/11/2023" },
                    { rank: 2, name: "Trần Thị B", spend: "4.180.000 ₫", lastPurchase: "14/11/2023" },
                    { rank: 3, name: "Lê Văn C", spend: "3.950.000 ₫", lastPurchase: "13/11/2023" },
                    { rank: 4, name: "Phạm Thị D", spend: "3.640.000 ₫", lastPurchase: "12/11/2023" },
                    { rank: 5, name: "Hoàng Văn E", spend: "3.470.000 ₫", lastPurchase: "11/11/2023" },
                  ].map((customer) => (
                    <TableRow key={customer.rank}>
                      <TableCell className="font-medium">{customer.rank}</TableCell>
                      <TableCell>{customer.name}</TableCell>
                      <TableCell>{customer.spend}</TableCell>
                      <TableCell className="text-right">{customer.lastPurchase}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Top 5 Sản phẩm bán chạy</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[100px]">Hạng</TableHead>
                    <TableHead>Tên sản phẩm</TableHead>
                    <TableHead>Số lượng bán</TableHead>
                    <TableHead className="text-right">Doanh thu</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {[
                    { rank: 1, name: "Sản phẩm X", quantity: 1200, revenue: "120.000.000 ₫" },
                    { rank: 2, name: "Sản phẩm Y", quantity: 950, revenue: "95.000.000 ₫" },
                    { rank: 3, name: "Sản phẩm Z", quantity: 820, revenue: "82.000.000 ₫" },
                    { rank: 4, name: "Sản phẩm W", quantity: 700, revenue: "70.000.000 ₫" },
                    { rank: 5, name: "Sản phẩm V", quantity: 650, revenue: "65.000.000 ₫" },
                  ].map((product) => (
                    <TableRow key={product.rank}>
                      <TableCell className="font-medium">{product.rank}</TableCell>
                      <TableCell>{product.name}</TableCell>
                      <TableCell>{product.quantity}</TableCell>
                      <TableCell className="text-right">{product.revenue}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}

export default Dashboard