'use client'

import { useEffect, useRef, useState } from 'react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog"
import { useTranslation } from 'react-i18next'
import { getDetailUserAPI, loadHistoryAPI } from '../../apis'
import { useNavigate, useParams } from 'react-router-dom'
import { useAppDispatch } from '../../hooks/useAppDispatch'
import { getDetailsUserThunk, selectCurrentUser, selectUserDetailView, selectUserError, updateUserThunk } from '../../redux/user/userSlice'
import { useSelector } from 'react-redux'
import { History } from '../../interfaces/history'

import AddCardIcon from '@mui/icons-material/AddCard';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import DateRangeIcon from '@mui/icons-material/DateRange';
import PeopleIcon from '@mui/icons-material/People';
import ImageIcon from '@mui/icons-material/Image';
import { Cancel, CheckCircle, SwapCallsOutlined, SwapCallsTwoTone, SwapHorizRounded, SwapHorizTwoTone } from '@mui/icons-material';

import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemAvatar from '@mui/material/ListItemAvatar';
import ListItemText from '@mui/material/ListItemText';
import Typography from '@mui/material/Typography';
import { differenceInDays, format } from 'date-fns';
import Box from '@mui/material/Box';
import Tooltip from '@mui/material/Tooltip';
import Icon from '@mui/material/Icon';
import { get } from 'lodash'
import { Paper } from '@mui/material'

// Mock history data
const mockHistory = [
  { action: "Login", timestamp: 1731677725862 },
  { action: "Password changed", timestamp: 1731677725862 - 86400000 },
  { action: "Email updated", timestamp: 1731677725862 - 172800000 },
]

const historyTypeLabels: { [key in History['type']]: string } = {
  CREATE_NEW_CARD: 'Created a new card',
  UPDATE_MEMBERS_CARD: 'Updated card members',
  UPDATE_CARD_COVER: 'Updated card cover',
  UPDATE_INFO_CARD: 'Updated card information',
  DELETE_CARD: 'Deleted the card',
  UPDATE_CARD_DUE_DATE: 'Updated due date',
  UPDATE_CARD_STATUS: 'Updated status',
  UPDATE_CARD_STATE: 'Updated state',

  CREATE_NEW_SUBTASK: 'Created a new subtask',
  UPDATE_SUBTASK: 'Updated subtask',
  DELETE_SUBTASK: 'Deleted subtask',

  CREATE_NEW_COLUMN: 'Created a new column',
  UPDATE_COLUMN_TITLE: 'Updated column title',
  DELETE_COLUMN: 'Deleted the column',
};

const historyTypeIcons: { [key in History['type']]: JSX.Element } = {
  CREATE_NEW_CARD: <AddCardIcon className="text-blue-500" />, // Tailwind classes for color
  UPDATE_MEMBERS_CARD: <PeopleIcon className="text-green-500" />,
  UPDATE_CARD_COVER: <ImageIcon className="text-gray-500" />,
  UPDATE_INFO_CARD: <EditIcon className="text-indigo-500" />,
  DELETE_CARD: <DeleteIcon className="text-red-500" />,
  UPDATE_CARD_DUE_DATE: <DateRangeIcon className="text-yellow-500" />,
  UPDATE_CARD_STATUS: <SwapCallsTwoTone className="text-purple-500" />,
  UPDATE_CARD_STATE: <SwapHorizRounded className="text-blue-500" />,

  CREATE_NEW_SUBTASK: <AddCardIcon className="text-blue-500" />,
  UPDATE_SUBTASK: <EditIcon className="text-indigo-500" />,
  DELETE_SUBTASK: <DeleteIcon className="text-red-500" />,

  CREATE_NEW_COLUMN: <AddCardIcon className="text-blue-500" />,
  UPDATE_COLUMN_TITLE: <EditIcon className="text-indigo-500" />,
  DELETE_COLUMN: <DeleteIcon className="text-red-500" />,
};

export default function UserDetailPage() {
  const user = useSelector(selectUserDetailView)
  const error = useSelector(selectUserError)
  const [histories, setHistories] = useState<any[]>([]) 

  const { userId } = useParams()

  const { t } = useTranslation()
  const navigate = useNavigate()
  const dispatch = useAppDispatch()
  const roleRef = useRef<any>(null)
  const currentUser = useSelector(selectCurrentUser)

  const getOldValue = (history: History, key: string) => {
    return history.previous && history.previous[key];
  };

  const getNewValue = (history: History, key: string) => {
    return history.current && history.current[key];
  };

  function getDateColor(dueDate: number) {
    const now = new Date().getTime();
    const isCardDue = now > dueDate;
    const isNearDue = dueDate - now <= 24 * 60 * 60 * 1000;

    if (isCardDue) {
      return 'text-red-500';
    }

    if (isNearDue) {
      return 'text-yellow-500';
    }

    return 'text-green-500';
  }

  function getBackgroundColor(dueDate: number) {
    const now = new Date().getTime();
    const isCardDue = now > dueDate;
    const isNearDue = dueDate - now <= 24 * 60 * 60 * 1000;

    if (isCardDue) {
      return 'bg-red-100';
    }

    if (isNearDue) {
      return 'bg-yellow-100';
    }

    return 'bg-green-100';
  }

  const getChange = (history: History, key: string) => {
    const oldVal = getOldValue(history, key);
    const newVal = getNewValue(history, key);

    if (key === 'title' || key === 'description' || key === 'cover') {
      return `${oldVal || 'None'} → ${newVal || 'None'}`;
    }

    if (key === 'dueDate') {
      return (
        <Box className="flex items-center">
          <Typography className={`mr-2 ${getDateColor(oldVal)} ${getBackgroundColor(oldVal)} p-1 rounded-sm`}>
            {oldVal ? format(new Date(oldVal), 'PP') : 'None'}
          </Typography>
          <SwapHorizTwoTone />
          <Typography className={`ml-2 ${getDateColor(newVal)} ${getBackgroundColor(newVal)} p-1 rounded-sm`}>
            {newVal ? format(new Date(newVal), 'PP') : 'None'}
          </Typography>
        </Box>
      )
    }

    if (key === 'isDone') {
      return oldVal ? (
        <Box className="text-red-500 flex items-center">
          <Cancel className="mr-2" />
          Marked as incomplete
        </Box>
      ) : (
        <Box className="text-green-500 flex items-center">
          <CheckCircle className="mr-2" />
          Marked as complete
        </Box>
      );
    }

    // if (key === 'memberIds') {
    //   const oldMembers = history.previous[key] || [];
    //   const newMembers = history.current[key] || [];

    //   const addedMembers = newMembers.filter((member: string) => !oldMembers.includes(member));
    //   const removedMembers = oldMembers.filter((member: string) => !newMembers.includes(member));

    //   const memberChanges = [...addedMembers, ...removedMembers];

    //   if (oldMembers.length < newMembers.length) {
    //     if (history.actor.userId === memberChanges[0]) {
    //       return (currentUser?._id === memberChanges[0] ? 'You' : boardMembers?.find((member) => member._id === memberChanges[0])?.displayName) + ' joined';
    //     }
    //     return (currentUser?._id === history.actor.userId ? 'You' : history.actor.displayName) + ' added ' + (currentUser?._id === memberChanges[0] ? 'You' : boardMembers?.find((member) => member._id === memberChanges[0])?.displayName);
    //   }

    //   if (newMembers.length < oldMembers.length) {
    //     if (history.actor.userId === memberChanges[0]) {
    //       return (currentUser?._id === memberChanges[0] ? 'You' : boardMembers?.find((member) => member._id === memberChanges[0])?.displayName) + ' left';
    //     }

    //     return (currentUser?._id === history.actor.userId ? 'You' : history.actor.displayName) + ' removed ' + (currentUser?._id === memberChanges[0] ? 'You' : boardMembers?.find((member) => member._id === memberChanges[0])?.displayName);
    //   }
    // }

    if (key === 'completed') {
      return <div className="flex items-center">
        {
          oldVal ? (
            <Box className="text-red-500 flex items-center">
              <Cancel className="mr-2" />
              Marked as incomplete
            </Box>
          ) : (
            <Box className="text-green-500 flex items-center">
              <CheckCircle className="mr-2" />
              Marked as complete
            </Box>
          )
        }
        <label className="ml-2 text-gray-500">
          {
            get(history, 'current.title', '')
          }
        </label>
      </div>
    }

    if (key === 'status') {
      return <div className="flex items-center">
        <span className="text-gray-500 mr-2">Column: {get(history, 'column.title', '')} </span>
        {
          oldVal ? (
            <Box className="text-red-500 flex items-center">
              <Cancel className="mr-2" />
              Marked as incomplete
            </Box>
          ) : (
            <Box className="text-green-500 flex items-center">
              <CheckCircle className="mr-2" />
              Marked as complete
            </Box>
          )
        }
      </div>
    }

    return `${oldVal} → ${newVal}`;
  };


  const createChangeText = (history: History) => {
    const changes: any[] = [];
    switch (history.type) {
      case 'UPDATE_INFO_CARD':
        if (history.previous?.title !== history.current?.title) {
          changes.push(`Title: ${getChange(history, 'title')}`);
        }
        if (history.previous?.description !== history.current?.description) {
          changes.push(`Description: ${getChange(history, 'description')}`);
        }
        break;
      case 'UPDATE_CARD_DUE_DATE':
        changes.push(getChange(history, 'dueDate'));
        break;
      case 'UPDATE_CARD_STATUS':
        changes.push(getChange(history, 'status'));
        break;
      case 'UPDATE_MEMBERS_CARD':
        // changes.push(`Members: ${getChange(history, 'memberIds')}`);
        break;
      case 'UPDATE_CARD_COVER':
        changes.push(`Cover: ${getChange(history, 'cover')}`);
        break;
      case 'UPDATE_SUBTASK':
        changes.push(getChange(history, 'completed'));
        break;
      case 'CREATE_NEW_SUBTASK':
      case 'CREATE_NEW_CARD':
      case 'DELETE_CARD':
      case 'CREATE_NEW_COLUMN':
      case 'UPDATE_COLUMN_TITLE':
      case 'DELETE_COLUMN':
        break;
      default:
        break;
    }
    return changes;
  };


  const handleRoleChange = (newRole: string) => {
    if (!userId) {
      return
    }

    dispatch(updateUserThunk({
      userId,
      data: {
        role: newRole
      }
    }))
  }

  useEffect(() => {
    if (!userId) {
      return 
    }

    dispatch(getDetailsUserThunk(userId))
    const fetchHistory = async () => {
      const response = await loadHistoryAPI(userId)
      setHistories(response.data)
    }
    fetchHistory()
  }, [userId])

  useEffect(() => {
    if (error) {
      navigate('/404')
    }
  }, [error])

  if (!user || !user.displayName) {
    return null
  }
  return (
    <Card className="w-full max-w-4xl mx-auto mt-5">
      <CardHeader>
        <CardTitle className="text-2xl">User Details</CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="information" className="w-full">
          <TabsList>
            <TabsTrigger value="information">Information</TabsTrigger>
            <TabsTrigger value="history">History</TabsTrigger>
          </TabsList>
          <TabsContent value="information">
            <div className="space-y-6">
              <div className="flex items-center space-x-4">
                <Avatar className="w-20 h-20">
                  <AvatarImage src={user.avatar} alt={user.displayName} />
                  <AvatarFallback>{user.displayName.charAt(0)}</AvatarFallback>
                </Avatar>
                <div>
                  <h2 className="text-2xl font-bold">{user.displayName}</h2>
                  <p className="text-sm text-muted-foreground">{user.email}</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Username</Label>
                  <p>{user.username}</p>
                </div>
                <div>
                  <Label>Role</Label>
                  <Select
                    onValueChange={handleRoleChange} 
                    value={user.role}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select a role" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="client">{t('roles.client')}</SelectItem>
                      <SelectItem value="manager">{t('roles.manager')}</SelectItem>
                      <SelectItem value="admin">{t('roles.admin')}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Created At</Label>
                  <p>{format(user.createdAt, 'PPpp')}</p>
                </div>
                <div>
                  <Label>Last Updated</Label>
                  <p>{user.updatedAt ? format(user.updatedAt, 'PPpp') : 'Never'}</p>
                </div>
              </div>
            </div>
          </TabsContent>
          <TabsContent value="history">
            {/* <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Action</TableHead>
                  <TableHead>Timestamp</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {mockHistory.map((item, index) => (
                  <TableRow key={index}>
                    <TableCell>{item.action}</TableCell>
                    <TableCell>{format(item.timestamp, 'PPpp')}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table> */}
            {
              (histories || []).length === 0 ? (
                <div className="flex items-center justify-center h-40">
                  <p className="text-gray-500">No history available</p>
                </div>
              ) : (
                <List className="space-y-4">
                  {(histories as History[] || []).filter(
                    (history) => !(history.type === 'UPDATE_CARD_DUE_DATE' && history.previous?.dueDate === null && history.current?.dueDate === null)
                  ).map((history) => (
                    <Paper
                      key={history._id}
                      elevation={2}
                    >
                      <ListItem alignItems="flex-start" className="flex-col items-start">
                        <Box className="flex items-center w-full">
                          <ListItemAvatar>
                            {/* <Avatar alt={history.actor.displayName} src={history.actor.avatar} /> */}
                            <Avatar className="w-10 h-10">
                              <AvatarImage src={history.actor.avatar} alt={history.actor.displayName} />
                              <AvatarFallback>{history.actor.displayName.charAt(0)}</AvatarFallback>
                            </Avatar>
                          </ListItemAvatar>
                          <ListItemText
                            primary={
                              <Box className="flex items-center">
                                {historyTypeIcons[history.type]}
                                <Box className="ml-2">
                                  <Typography variant="body1" component="span" className="font-semibold">
                                    {history.actor.displayName}
                                  </Typography>
                                  <span className="ml-1">{historyTypeLabels[history.type]}</span>
                                </Box>
                              </Box>
                            }
                            secondary={
                              <>
                                {history.current && history.previous && createChangeText(history).length > 0 && (
                                  <Box className="my-2">
                                    {createChangeText(history).map((change, index) => (
                                      <Box key={index} className="text-gray-700">
                                        {change}
                                      </Box>
                                    ))}
                                  </Box>
                                )}
                                <Typography variant="caption" className="text-gray-500 mt-1">
                                  {format(new Date(history.createdAt), 'PPpp')}
                                </Typography>
                              </>
                            }
                            secondaryTypographyProps={{ component: 'div' }}
                          />
                        </Box>
                      </ListItem>
                    </Paper>
                  ))}
                </List>
              )
            }
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}

