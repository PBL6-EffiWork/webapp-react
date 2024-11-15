// src/components/CardHistory.tsx
import React from 'react';
import { History } from '@/interfaces/history'; // Ensure the correct path
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemAvatar from '@mui/material/ListItemAvatar';
import Avatar from '@mui/material/Avatar';
import ListItemText from '@mui/material/ListItemText';
import Typography from '@mui/material/Typography';
import Divider from '@mui/material/Divider';
import { differenceInDays, format } from 'date-fns';
import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';
import Tooltip from '@mui/material/Tooltip';
import Icon from '@mui/material/Icon';

// Import appropriate icons
import AddCardIcon from '@mui/icons-material/AddCard';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import DateRangeIcon from '@mui/icons-material/DateRange';
import PeopleIcon from '@mui/icons-material/People';
import ImageIcon from '@mui/icons-material/Image';
import { Cancel, CheckCircle, SwapCallsOutlined, SwapHorizRounded, SwapHorizTwoTone } from '@mui/icons-material';

interface CardHistoryProps {
  histories: History[];
}

const historyTypeLabels: { [key in History['type']]: string } = {
  CREATE_NEW_CARD: 'Created a new card',
  UPDATE_MEMBERS_CARD: 'Updated card members',
  UPDATE_CARD_COVER: 'Updated card cover',
  UPDATE_INFO_CARD: 'Updated card information',
  DELETE_CARD: 'Deleted the card',
  UPDATE_CARD_DUE_DATE: 'Updated due date',
  UPDATE_CARD_STATUS: 'Updated status',
  UPDATE_CARD_STATE: 'Updated state',

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
  UPDATE_CARD_STATUS: <Icon className="text-purple-500">swap_horiz</Icon>, // Custom icon
  UPDATE_CARD_STATE: <SwapHorizRounded className="text-blue-500" />,

  CREATE_NEW_COLUMN: <AddCardIcon className="text-blue-500" />,
  UPDATE_COLUMN_TITLE: <EditIcon className="text-indigo-500" />,
  DELETE_COLUMN: <DeleteIcon className="text-red-500" />,
};

function CardHistory({ histories }: CardHistoryProps) {
  if (!histories || histories.length === 0) {
    return (
      <Typography variant="body1" color="text.secondary" className="text-center mt-4">
        No history available.
      </Typography>
    );
  }

  const getOldValue = (history: History, key: string) => {
    return history.previous && history.previous[key];
  };

  const getNewValue = (history: History, key: string) => {
    return history.current && history.current[key];
  };

  function getDateColor(dueDate: number) {
    const isCardDue = new Date().getTime() > dueDate;
    const isNearDue = new Date(dueDate).getTime() - new Date().getTime() <= 24 * 60 * 60 * 1000;
  
    if (isCardDue) {
      return 'text-red-500';
    }
    
    if (isNearDue) {
      return 'text-yellow-500';
    }

    return 'text-green-500';
  }

  function getBackgroundColor(dueDate: number) {
    const isCardDue = new Date().getTime() > dueDate;
    const isNearDue = new Date(dueDate).getTime() - new Date().getTime() <= 24 * 60 * 60 * 1000;
  
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
      // return `${oldVal ? format(new Date(oldVal), 'PP') : 'None'} → ${newVal ? format(new Date(newVal), 'PP') : 'None'}`;
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
  
    if (key === 'memberIds') {
      const oldMembers = history.previous[key] || [];
      const newMembers = history.current[key] || [];
      const members = history.members;
  
      if (oldMembers.length === 0) {
        if (history.actor.userId === newMembers[0]) {
          return members?.find((member) => member.userId === newMembers[0])?.displayName || 'You' + ' joined';
        }
  
        return history.actor.displayName + ' added ' + members?.find((member) => member.userId === newMembers[0])?.displayName;
      }
  
      if (newMembers.length === 0) {
        if (history.actor.userId === oldMembers[0]) {
          return members?.find((member) => member.userId === oldMembers[0])?.displayName || 'You' + ' left';
        }
  
        return history.actor.displayName + ' removed ' + members?.find((member) => member.userId === oldMembers[0])?.displayName;
      }
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
        changes.push(`Status: ${getChange(history, 'status')}`);
        break;
      case 'UPDATE_CARD_STATE':
        changes.push(getChange(history, 'isDone'));
        break;
      case 'UPDATE_MEMBERS_CARD':
        changes.push(`Members: ${getChange(history, 'memberIds')}`);
        break;
      case 'UPDATE_CARD_COVER':
        changes.push(`Cover: ${getChange(history, 'cover')}`);
        break;
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

  return (
    <List className="space-y-4">
      {histories.filter(
        (history) => !(history.type === 'UPDATE_CARD_DUE_DATE' && history.previous?.dueDate === null && history.current?.dueDate === null)
      ).map((history) => (
        <Paper
          key={history._id}
          elevation={2}
        >
          <ListItem alignItems="flex-start" className="flex-col items-start">
            <Box className="flex items-center w-full">
              <ListItemAvatar>
                <Avatar alt={history.actor.displayName} src={history.actor.avatar} />
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
  );
}

export default CardHistory;


