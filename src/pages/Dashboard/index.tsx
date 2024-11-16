import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"

import { dashboardHelper } from './services/api';

function Dashboard({id}: any) {
    const [totalUsers, setTotalUsers] = useState([]);
    useEffect(() => {
        dashboardHelper.countUser()
        .then(data => setTotalUsers(data.total))
        .catch(error => console.error(error));
    }, []);

    const [totalProjects, setTotalProjects] = useState([]);
    useEffect(() => {
        dashboardHelper.countBoard(id)
        .then(data => setTotalProjects(data.total))
        .catch(error => console.error(error));
    }, []); 

    const [topcards, setTopcards] = useState([]);
    useEffect(() => {
        dashboardHelper.top5Cards(id)
        .then(data => setTopcards(data))
        .catch(error => console.error(error));
    }, []);
    console.log(topcards)
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
              <CardTitle className="text-sm font-medium">TotalTasks</CardTitle>
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
              <CardTitle className="text-sm font-medium">Finished</CardTitle>
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
              <CardTitle className="text-sm font-medium">Fail</CardTitle>
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
              <CardTitle>Top 5 tasks about to expire</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[100px]">Top</TableHead>
                    <TableHead>Name</TableHead>
                    {/* <TableHead>Status</TableHead> */}
                    <TableHead className="text-right">Due date</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {topcards.map((card, index) => (
                    <TableRow key={card.title}>
                      <TableCell className="font-medium">{index + 1}</TableCell>
                      {/* <TableCell>{card.cover}</TableCell> */}
                      <TableCell>{card.title}</TableCell>
                      <TableCell className="text-right">
                        { 
                          card.dueDate !== null ? 
                          ( Math.floor((- Date.now() + new Date(card.dueDate).getTime()) / (1000 * 60 * 60 * 24)) === 0
                            ? "Today"
                            : `${Math.floor((- Date.now() + new Date(card.dueDate).getTime()) / (1000 * 60 * 60 * 24))} days`
                          ) : "Today"
                        }
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Top 5 projects about to be completed</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[100px]">Hạng</TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead>StartDate</TableHead>
                    <TableHead className="text-right">Process</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {[
                    { rank: 1, name: "Project 1", startDate: "15/11/2024", process: "90%" },
                    { rank: 2, name: "Project 2", startDate: "15/11/2024", process: "95%" },
                    { rank: 3, name: "Project 3", startDate: "15/11/2024", process: "92%" },
                    { rank: 4, name: "Project 4", startDate: "15/11/2024", process: "91%" },
                    { rank: 5, name: "Project 5", startDate: "15/11/2024", process: "94%" },
                  ].map((product) => (
                    <TableRow key={product.rank}>
                      <TableCell className="font-medium">{product.rank}</TableCell>
                      <TableCell>{product.name}</TableCell>
                      <TableCell>{product.startDate}</TableCell>
                      <TableCell className="text-right">{product.process}</TableCell>
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