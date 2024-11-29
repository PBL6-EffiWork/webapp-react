import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, Tooltip, Cell } from "recharts"

import { countBoard, countCard, countUser, top5Cards, countEvent } from '../../apis/index';
import { Card as CardType } from '../../interfaces/card';
import { formatDate } from '../../utils/time';
import { Button } from '@mui/material';
import { Link } from 'react-router-dom';
import { useRole } from '../../context/RoleContext';

function Dashboard({id}: {id: string}) {
  const { ability } = useRole()
  const [stats, setStats] = useState({
      users: 0,
      projects: 0,
      cards: 0,
      topCards: [],
      events: 0
  });

  useEffect(() => {
      const fetchData = async () => {
          try {
              const [
                  userData,
                  projectData, 
                  cardData,
                  topCardData,
                  eventData
              ] = await Promise.all([
                  countUser(),
                  countBoard(id),
                  countCard('year', id),
                  top5Cards(id),
                  countEvent(id)
              ]);

              setStats({
                  users: userData.total,
                  projects: projectData.total,
                  cards: cardData.total,
                  topCards: topCardData,
                  events: eventData.total
              });
          } catch (error) {
              console.error('Error fetching dashboard data:', error);
          }
      };

      fetchData();
  }, [id]);

  const getDiffDate = (dueDate: any) => {
    if (!dueDate) return 0;

    const daysDiff = Math.floor(
      (new Date(dueDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24)
    );

    return daysDiff;
  }

  const getColor = (daysDiff: number) => {
    if (daysDiff === 0) return 'text-yellow-600';
    if (daysDiff < 0) return 'text-red-600';
    return 'text-green-600';
  }

  const getBackgroundColor = (daysDiff: number) => {
    if (daysDiff === 0) return 'bg-yellow-100';
    if (daysDiff < 0) return 'bg-red-100';
    return 'bg-green-100';
  }

  const data = [
                { name: "Project 1", completion: 90 },
                { name: "Project 2", completion: 95 },
                { name: "Project 3", completion: 92 },
                { name: "Project 4", completion: 91 },
                { name: "Project 5", completion: 94 },
              ]

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
                {/* <div className="text-2xl font-bold">{stats.projects}</div> */}
                <span className="text-2xl font-bold">{stats.projects}</span>
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
              <div className="text-2xl font-bold">{stats.cards}</div>
              {/* <p className="text-xs text-muted-foreground">+180.1% so với tháng trước</p> */}
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
                <rect width="20" height="14" x="2" y="5" rx="2" />
                <path d="M2 10h20" />
              </svg>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.events}</div>
              {/* <p className="text-xs text-muted-foreground">+19% so với tháng trước</p> */}
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Inbox</CardTitle>
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

        <div className="grid gap-6 md:grid-cols-1">
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
                    <TableHead>Board</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Due date</TableHead>
                    <TableHead>Created at</TableHead>
                    <TableHead>Updated at</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {stats.topCards.map((card: CardType, index) => (
                    <TableRow key={card.title}>
                      <TableCell className="font-medium">{index + 1}</TableCell>
                      <TableCell>{card.title}</TableCell>
                      <TableCell>{card.boardName}</TableCell>
                      <TableCell>{card.columnName}</TableCell>
                      <TableCell>
                        <span className={`${getColor(getDiffDate(card.dueDate))} ${getBackgroundColor(getDiffDate(card.dueDate))} rounded-md px-2 py-1 font-medium`}>
                          {(() => {
                            if (!card.dueDate) return "Today";
      
                            const daysDiff = getDiffDate(card.dueDate);
                            const absDaysDiff = Math.abs(daysDiff);

                            if (daysDiff === 0) return "Today";
                            if (daysDiff < 0) {
                              return absDaysDiff === 1 ? "Yesterday" : `${absDaysDiff} days late`;
                            };
                            return daysDiff === 1 ? "Tomorrow" : `${daysDiff} days left`;
                          })()}
                        </span>
                      </TableCell>
                      <TableCell>{formatDate(card.createdAt)}</TableCell>
                      <TableCell>{formatDate(card.updatedAt)}</TableCell>
                      <TableCell>
                        <Link to={`/boards/${card.boardId}?cardId=${card._id}`}>
                          <Button variant="outlined" size="small">View</Button>
                        </Link>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          {/* <Card className="grid gap-6 md:grid-cols">
            <CardHeader>
              <CardTitle className="font-bold text-emerald-800">Top 5 Projects About to be Completed</CardTitle>
              <CardDescription className="text-sm text-emerald-600">Project completion percentages</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={350}>
                <BarChart data={data}>
                  <XAxis
                    dataKey="name"
                    stroke="#059669"
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                  />
                  <YAxis
                    stroke="#059669"
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                    tickFormatter={(value) => `${value}%`}
                  />
                  <Tooltip
                    contentStyle={{ background: 'white', border: '1px solid #d1fae5', borderRadius: '8px' }}
                    labelStyle={{ color: '#065f46', fontWeight: 'bold' }}
                  />
                  <Bar
                    dataKey="completion"
                    radius={[8, 8, 0, 0]}
                  >
                    {data.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={`url(#colorGradient-${index})`} />
                    ))}
                  </Bar>
                  <defs>
                    {data.map((entry, index) => (
                      <linearGradient key={`gradient-${index}`} id={`colorGradient-${index}`} x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#4ade80" stopOpacity={0.8}/>
                        <stop offset="100%" stopColor="#86efac" stopOpacity={0.8}/>
                      </linearGradient>
                    ))}
                  </defs>
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card> */}
        </div>
      </main>
    </div>
  )
}

export default Dashboard
