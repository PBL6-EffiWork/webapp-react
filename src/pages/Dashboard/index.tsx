import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, Tooltip, Cell } from "recharts"

import { countBoard, countCard, countUser, top5Cards, countEvent, fetchBoardsAPI, analyticsCardAPI } from '../../apis/index';
import { Card as CardType } from '../../interfaces/card';
import { formatDate } from '../../utils/time';
import { Button } from '@mui/material';
import { Link } from 'react-router-dom';
import { useRole } from '../../context/RoleContext';
import { DropdownMenu } from '../../components/ui/dropdown-menu';
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { useSelector } from 'react-redux';
import { selectBoard } from '../../redux/board/boardSlice';

function Dashboard({id}: {id: string}) {
  const { ability } = useRole()
  const [stats, setStats] = useState({
      users: 0,
      projects: 0,
      cards: 0,
      topCards: [],
      events: 0
  });

  const [boards, setBoards] = useState<any>([]);
  const [selectBoard, setSelectBoard] = useState('');
  const [cards, setCards] = useState([]);

  useEffect(() => {
      const fetchData = async () => {
          try {
              const [
                  // userData,
                  projectData, 
                  cardData,
                  topCardData,
                  eventData
              ] = await Promise.all([
                  // countUser(),
                  countBoard(id),
                  countCard('year', id),
                  top5Cards(id),
                  countEvent(id)
              ]);

              setStats({
                  users: 0,
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

  useEffect(() => {
    const fetchBoards = async () => {
      try {
        const response = await fetchBoardsAPI('');
        console.log('response:', response.boards);
        setBoards(response.boards);
      } catch (error) {
        console.error('Error fetching boards:', error);
      }
    };

    fetchBoards();
  }, []);

  useEffect(() => {
    if (!selectBoard) return;
    const getCardsBoard = async () => {
      try {
        const res = await analyticsCardAPI(selectBoard);
        setCards(res);
      } catch (error) {
        console.error('Error fetching boards:', error);
      }
    }

    getCardsBoard();
  }, [selectBoard]);

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 p-8">
      <main className="container mx-auto">
        <h1 className="text-3xl font-bold text-gray-800 dark:text-white mb-8">Home</h1>
        
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
        </div>
        <div className="grid gap-6 md:grid-cols-1 mt-2">
          <Card>
            <CardHeader>
              <CardTitle>Personal Task</CardTitle>
            </CardHeader>
            <CardContent>
              <Select
                value={selectBoard}
                onValueChange={(value) =>{
                  setSelectBoard(value);
                }}
              >
                <SelectTrigger className="w-[300px]">
                  <SelectValue placeholder="Board" />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    <SelectLabel>Board</SelectLabel>
                    <SelectItem value="all">All</SelectItem>
                    {
                      boards.map((board: any) => (
                        <SelectItem key={board._id} value={board._id}>{board.title}</SelectItem>
                      ))
                    }
                  </SelectGroup>
                </SelectContent>
              </Select>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[100px]"></TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead>Board</TableHead>
                    <TableHead>Due date</TableHead>
                    <TableHead>Created at</TableHead>
                    <TableHead>Updated at</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {cards.map((card: CardType, index) => (
                    <TableRow key={card.title}>
                      <TableCell className="font-medium">{index + 1}</TableCell>
                      <TableCell>{card.title}</TableCell>
                      <TableCell>
                        {
                          boards.find((board: { _id: string; }) => board._id === card.boardId)?.title
                        }
                      </TableCell>
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
        </div>
      </main>
    </div>
  )
}

export default Dashboard
