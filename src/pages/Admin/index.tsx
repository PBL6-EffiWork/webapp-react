"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Cell,
  PieChart,
  Pie,
  Legend,
} from "recharts";
import { Users } from "lucide-react";
import { analyticsBoardAPI, analyticsColumnsAPI, analyticsMemberAPI } from "../../apis";

// Sample data - replace with your actual data fetching logic
// const totalProjects = 12;
// const totalCards = 89;
// const totalEvents = 24;

const taskData = [
  { name: "Complete project proposal", daysLeft: 5, completion: 75 },
  { name: "Review client feedback", daysLeft: 2, completion: 90 },
  { name: "Update website content", daysLeft: 4, completion: 60 },
  { name: "Prepare presentation slides", daysLeft: 6, completion: 40 },
  { name: "Submit expense report", daysLeft: 1, completion: 95 },
];

// const projectData = [
//   { name: "In Process", value: 30 },
//   { name: "Experired", value: 29 },
//   { name: "Finished", value: 41 },
// ];

const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884D8"];

export default function DashboardPage() {
  const [chartData, setChartData] = useState([]);
  const [timeFrames, setTimeFrames] = useState({
    all: { label: "All", value: 0 },
    manager: { label: "Manager", value: 0 },
    client: { label: "Member", value: 0 },
  });
  const [timeFrame, setTimeFrame] = useState<keyof typeof timeFrames>("all");
  const [totalProjects, setTotalProjects] = useState(0);
  const [projects, setProjects] = useState<{
    id: string;
    title: string;
  }[]>([]);

  const getProgressProject = async (id: string) => {
    try {
      const res = await analyticsColumnsAPI(id);

      const { data } = res;
      const charData = data.map(({ title, totalCards }: {
        title: string;
        totalCards: number;
      }) => ({ name: title, value: totalCards }));

      setChartData(charData);
    } catch (error) {
      console.error(error);
    }
  }

  useEffect(() => {
    // Fetch data
    const fetchData = async () => {
      const res = await analyticsBoardAPI();

      const { total, boards } = res;

      setTotalProjects(total);
      setProjects(boards);
    };

    fetchData();
  }, []);

  useEffect(() => {
    const fetchData = async (role: keyof typeof timeFrames) => {

      const res = await analyticsMemberAPI(role);
      
      const { total } = res;
      
      setTimeFrames((prev) => ({ ...prev, [role]: { ...prev[role], value: total } }));
    };

    fetchData(timeFrame);
  }, [timeFrame]);
  
  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 p-8">
      <main className="container mx-auto">
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
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">User</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div className="text-2xl font-bold">{timeFrames[timeFrame].value}</div>
                <Select
                  value={timeFrame}
                  onValueChange={(value: keyof typeof timeFrames) => setTimeFrame(value)}
                >
                  <SelectTrigger className="w-[120px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(timeFrames).map(([key, { label }]) => (
                      <SelectItem key={key} value={key}>
                        {label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>
          {/* <Card>
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
              <div className="text-2xl font-bold">1234</div>
            </CardContent>
          </Card> */}
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          {/* <Card className="grid gap-6 md:grid-cols">
            <CardHeader>
              <CardTitle className="font-bold text-gray-800 dark:text-white">
                The 5 highest progress projects
              </CardTitle>
              <CardDescription className="text-sm text-gray-600 dark:text-gray-400">
                Evaluated according to completion rate
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={350}>
                <BarChart data={taskData}>
                  <XAxis
                    dataKey="name"
                    angle={-45}
                    textAnchor="end"
                    height={70}
                    tick={{ fill: "hsl(var(--foreground))" }}
                  />
                  <YAxis tick={{ fill: "hsl(var(--foreground))" }} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "hsl(var(--background))",
                      border: "1px solid hsl(var(--border))",
                    }}
                  />
                  <Bar
                    dataKey="completion"
                    fill="hsl(var(--primary))"
                    name="Completion %"
                    radius={[4, 4, 0, 0]}
                  >
                    {taskData.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={`hsl(var(--primary) / ${0.5 + entry.completion / 200})`}
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card> */}

          <Card className="grid gap-6 md:grid-cols">
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle className="font-bold text-gray-800 dark:text-white">
                  The number of tasks
                </CardTitle>
                <CardDescription className="text-sm text-gray-600 dark:text-gray-400">
                  Evaluated according to completion rate
                </CardDescription>
              </div>
              <Select
                onValueChange={(value) =>
                  getProgressProject(value)
                }
              >
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Select a project" />
                </SelectTrigger>
                <SelectContent>
                  {
                    projects.map(({ id, title }) => (
                      <SelectItem key={id} value={id}>
                        {title}
                      </SelectItem>
                    ))
                  }
                </SelectContent>
              </Select>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={350}>
                <PieChart>
                  <Pie
                    data={chartData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  >
                    {chartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
