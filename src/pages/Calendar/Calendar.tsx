import React, { useState, useEffect } from 'react';
import { Calendar, dateFnsLocalizer, Views, Event as CalendarEvent } from 'react-big-calendar';
import { parse, startOfWeek, getDay } from 'date-fns';
import { vi } from 'date-fns/locale/vi';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    TextField,
    MenuItem,
    Select,
    InputLabel,
    FormControl,
    Box,
    Checkbox,
    ListItemText,
    OutlinedInput,
    FormControlLabel,
} from '@mui/material';
import { styled } from '@mui/material/styles';
import authorizedAxiosInstance from '../../utils/authorizeAxios';
import { API_ROOT } from '../../utils/constants';
import { toZonedTime, toDate, format } from 'date-fns-tz';
import Typography from "@mui/material/Typography";
import ListItem from "@mui/material/ListItem";
import List from "@mui/material/List";

const DEFAULT_TIMEZONE = 'Asia/Ho_Chi_Minh';

// Helper functions for timezone conversion
const convertUtcToZoned = (utcDate: string | Date) =>
    toZonedTime(utcDate, DEFAULT_TIMEZONE);

const convertZonedToUtc = (zonedDate: string | Date) =>
    toDate(zonedDate, { timeZone: DEFAULT_TIMEZONE });

interface User {
    _id: string;
    username: string;
}

interface Project {
    id: string;
    name: string;
}

interface EventStats {
    accept: { count: number; users: string[] };
    reject: { count: number; users: string[] };
    pending: { count: number; users: string[] };
}

interface MyEvent extends CalendarEvent {
    _id: string;         // MongoDB ObjectId
    event_id: string;    // UUID from backend
    id?: string;         // ID for react-big-calendar (mapped from event_id)
    title: string;
    start_time: string;
    end_time: string;
    user_ids: string[];
    description?: string; // Optional
    event_type?: string;  // Optional
    project_id: string | null; // Allows null
    color?: string;       // Optional color field
    stats?: EventStats;  // <-- Add stats property here
}

const locales = {
    'vi-VN': vi,
};

const localizer = dateFnsLocalizer({
    format,
    parse,
    startOfWeek: () => startOfWeek(new Date(), { weekStartsOn: 1 }),
    getDay,
    locales,
});

const StyledButton = styled(Button)(({ theme }) => ({
    margin: '10px 0',
    backgroundColor: theme.palette.primary.main,
    color: '#fff',
    borderRadius: '20px',
    padding: '10px 20px',
    textTransform: 'none',
    fontSize: '1rem',
    fontWeight: 'bold',
    '&:hover': {
        backgroundColor: theme.palette.primary.dark,
    },
    transition: 'all 0.3s ease',
}));

const MyCalendar: React.FC = () => {
    const [events, setEvents] = useState<MyEvent[]>([]);
    const [users, setUsers] = useState<User[]>([]);
    const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
    const [projects, setProjects] = useState<Project[]>([]);
    const [open, setOpen] = useState<boolean>(false);
    const [openDetails, setOpenDetails] = useState<boolean>(false);
    const [selectedEvent, setSelectedEvent] = useState<MyEvent | null>(null);

    const [newEvent, setNewEvent] = useState<Partial<MyEvent>>({
        title: '',
        start_time: new Date().toISOString(),
        end_time: new Date().toISOString(),
        user_ids: [], // Initialize as empty
        event_type: '', // Optional
        project_id: null,
        color: '#3174ad', // Default color
    });

    const [selectAllUsers, setSelectAllUsers] = useState<boolean>(false);

    const API_BASE_URL = `${API_ROOT}/v1`;

    // Fetch events
    const fetchEvents = async () => {
        try {
            const response = await authorizedAxiosInstance.get(`${API_BASE_URL}/events`);
            const eventsFromAPI = response.data.map((event: any) => ({
                ...event,
                id: event.event_id,
                // Convert UTC to Zoned Time (UTC+7) for display
                start: convertUtcToZoned(new Date(event.start_time)),
                end: convertUtcToZoned(new Date(event.end_time)),
                color: event.color || '#4CAF50', // Ensure color is present
            }));
            setEvents(eventsFromAPI);
        } catch (error) {
            console.error('Error fetching events:', error);
        }
    };

    useEffect(() => {
        const fetchUsers = async () => {
            try {
                const response = await authorizedAxiosInstance.get(`${API_BASE_URL}/users/active`);
                setUsers(response.data);
                setFilteredUsers(response.data); // Initialize filteredUsers
            } catch (error) {
                console.error('Error fetching users:', error);
            }
        };

        const fetchProjects = async () => {
            try {
                const response = await authorizedAxiosInstance.get(`${API_BASE_URL}/boards`);
                setProjects(response.data.boards.map((board: any) => ({ id: board._id, name: board.title })));
            } catch (error) {
                console.error('Error fetching projects:', error);
            }
        };

        fetchEvents();
        fetchUsers();
        fetchProjects();
    }, [API_BASE_URL]);

    const fetchProjectMembers = async (projectId: string | null) => {
        try {
            if (!projectId) {
                setFilteredUsers(users); // Show all users if no project
                return;
            }

            const response = await authorizedAxiosInstance.get(`${API_BASE_URL}/boards/${projectId}/members`);
            const projectMembers: User[] = response.data;
            setFilteredUsers(projectMembers);
        } catch (error) {
            console.error('Error fetching project members:', error);
            setFilteredUsers([]);
        }
    };

    useEffect(() => {
        if (selectedEvent?.project_id) {
            fetchProjectMembers(selectedEvent.project_id);
        } else {
            setFilteredUsers(users);
        }
    }, [selectedEvent?.project_id, users]);

    const handleOpen = () => {
        setNewEvent({
            title: '',
            start_time: new Date().toISOString(),
            end_time: new Date().toISOString(),
            user_ids: [], // Initialize as empty
            event_type: '', // Optional
            project_id: null,
            color: '#3174ad', // Default color
        });
        setFilteredUsers(users); // Initially show all users
        setSelectAllUsers(false);
        setOpen(true);
    };

    const handleClose = () => {
        setOpen(false);
        setFilteredUsers([]);
        setSelectAllUsers(false);
    };

    const handleDetailsClose = () => {
        setOpenDetails(false);
        setSelectedEvent(null);
    };

    const handleSave = async () => {
        if (
            newEvent.title &&
            newEvent.start_time &&
            newEvent.end_time &&
            newEvent.user_ids?.length
        ) {
            if (new Date(newEvent.end_time) <= new Date(newEvent.start_time)) {
                alert('End time must be after start time.');
                return;
            }

            const eventToAdd: Partial<MyEvent> = {
                title: newEvent.title!,
                start_time: newEvent.start_time!,
                end_time: newEvent.end_time!,
                user_ids: newEvent.user_ids!,
                description: newEvent.description || '', // Optional
                event_type: newEvent.event_type || '', // Optional field
                project_id: newEvent.project_id || null,
                color: newEvent.color || '#3174ad', // Default color if not set
            };

            try {
                await authorizedAxiosInstance.post(`${API_BASE_URL}/events`, eventToAdd);
                // After successful addition, fetch the latest events
                await fetchEvents();
                setOpen(false);
            } catch (error: any) {
                console.error('Failed to save event:', error);
                alert(`Failed to save event: ${error.response?.data?.message || 'Please try again.'}`);
            }
        } else {
            alert('Please fill in all required fields.');
        }
    };

    const handleProjectChange = async (projectId: string | null) => {
        setNewEvent({ ...newEvent, project_id: projectId });

        await fetchProjectMembers(projectId);

        if (projectId) {
            setNewEvent(prev => ({
                ...prev,
                user_ids: [], // Initialize as empty when a project is selected
            }));
            setSelectAllUsers(false);
        } else {
            setNewEvent(prev => ({
                ...prev,
                user_ids: [], // Initialize as empty when no project is selected
            }));
            setSelectAllUsers(false);
        }
    };

    const handleStatsClick = (type: 'accept' | 'reject' | 'pending') => {
        setShowUserList(type);
    };

    const handleCloseUserList = () => {
        setShowUserList(null);
    };

    const [showUserList, setShowUserList] = useState<'accept' | 'reject' | 'pending' | null>(null);

    const handleEventClick = async (event: MyEvent) => {
        setSelectedEvent({ ...event });
        setOpenDetails(true);

        try {
            const response = await authorizedAxiosInstance.get(`${API_BASE_URL}/events/stats/${event.event_id}`);
            const stats = response.data; // Assuming the stats response structure is like { accepted, rejected, pending }
            setSelectedEvent(prev => ({
                ...prev!,
                stats, // Store the stats in the selected event
            }));
        } catch (error) {
            console.error('Error fetching event stats:', error);
        }

        if (event.user_ids && event.user_ids.length > 0) {
            const eventUsers = users.filter(user => event.user_ids.includes(user._id));
            setFilteredUsers(eventUsers);
            setSelectedEvent(prev => ({
                ...prev!,
                user_ids: event.user_ids,
            }));
        } else {
            setFilteredUsers([]);
            setSelectedEvent(prev => ({ ...prev!, user_ids: [] }));
        }
    };

    const handleDelete = async () => {
        if (selectedEvent) {
            if (!window.confirm('Are you sure you want to delete this event?')) {
                return;
            }
            try {
                await authorizedAxiosInstance.delete(`${API_BASE_URL}/events/${selectedEvent.event_id}`);
                // After successful deletion, fetch the latest events
                await fetchEvents();
                setOpenDetails(false);
                setSelectedEvent(null);
            } catch (error: any) {
                console.error('Failed to delete event:', error);
                alert(`Failed to delete event: ${error.response?.data?.message || 'Please try again.'}`);
            }
        }
    };

    const handleUpdate = async () => {
        if (
            selectedEvent?.title &&
            selectedEvent.start_time &&
            selectedEvent.end_time &&
            selectedEvent.user_ids?.length
        ) {
            if (new Date(selectedEvent.end_time) <= new Date(selectedEvent.start_time)) {
                alert('End time must be after start time.');
                return;
            }

            const updatedEvent: Partial<MyEvent> = {
                title: selectedEvent.title,
                start_time: selectedEvent.start_time,
                end_time: selectedEvent.end_time,
                user_ids: selectedEvent.user_ids,
                description: selectedEvent.description || '', // Optional
                event_type: selectedEvent.event_type || '', // Optional field
                project_id: selectedEvent.project_id,
                color: selectedEvent.color || '#3174ad', // Default color if not set
            };

            try {
                await authorizedAxiosInstance.put(
                    `${API_BASE_URL}/events/${selectedEvent.event_id}`,
                    updatedEvent
                );
                // After successful update, fetch the latest events
                await fetchEvents();
                setOpenDetails(false);
                alert('Event updated successfully');
            } catch (error: any) {
                console.error('Failed to update event:', error.response || error.message);
                alert(`Failed to update event: ${error.response?.data?.message || 'Unknown error'}`);
            }
        } else {
            alert('Please fill in all required fields.');
        }
    };

    const eventStyleGetter = (event: MyEvent) => {
        return {
            style: {
                backgroundColor: event.color || '#4CAF50', // Use event's color or default
                color: '#ffffff',
                borderRadius: '8px',
                padding: '6px',
                fontWeight: 'bold',
                fontSize: '0.85rem',
                boxShadow: '0 2px 6px rgba(0, 0, 0, 0.1)',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
            },
        };
    };

    // Handler for "Select All" checkbox
    const handleSelectAllChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const checked = event.target.checked;
        setSelectAllUsers(checked);
        if (checked) {
            setNewEvent(prev => ({
                ...prev,
                user_ids: filteredUsers.map(user => user._id),
            }));
        } else {
            setNewEvent(prev => ({
                ...prev,
                user_ids: [],
            }));
        }
    };

    // Handler for "Select All" in Event Details
    const handleSelectAllDetailsChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const checked = event.target.checked;
        if (checked) {
            setSelectedEvent(prev => ({
                ...prev!,
                user_ids: filteredUsers.map(user => user._id),
            }));
        } else {
            setSelectedEvent(prev => ({
                ...prev!,
                user_ids: [],
            }));
        }
    };

    return (
        <Box sx={{ padding: '20px', backgroundColor: '#f9f9f9', height: '100vh', boxSizing: 'border-box' }}>
            <StyledButton variant="contained" onClick={handleOpen}>
                Add Event
            </StyledButton>
            <Calendar
                localizer={localizer}
                events={events}
                startAccessor="start"
                endAccessor="end"
                style={{
                    height: '85%',
                    margin: '20px 0',
                    borderRadius: '10px',
                    backgroundColor: '#ffffff',
                    boxShadow: '0 8px 16px rgba(0, 0, 0, 0.2)',
                    padding: '15px',
                }}
                views={[Views.MONTH, Views.WEEK, Views.DAY]}
                popup
                eventPropGetter={eventStyleGetter}
                dayPropGetter={() => ({
                    style: {
                        border: '1px solid #e0e0e0',
                        padding: '5px',
                    },
                })}
                onSelectEvent={handleEventClick}
            />
            {/* Add Event Dialog */}
            <Dialog open={open} onClose={handleClose} fullWidth maxWidth="sm">
                <DialogTitle sx={{ backgroundColor: '#4CAF50', color: '#fff' }}>Add New Event</DialogTitle>
                <DialogContent>
                    <TextField
                        autoFocus
                        margin="dense"
                        label="Event Title"
                        type="text"
                        fullWidth
                        variant="outlined"
                        value={newEvent.title || ''}
                        onChange={(e) => setNewEvent({ ...newEvent, title: e.target.value })}
                        required
                    />
                    <TextField
                        margin="dense"
                        label="Description"
                        type="text"
                        fullWidth
                        variant="outlined"
                        multiline
                        rows={4}
                        value={newEvent.description || ''}
                        onChange={(e) => setNewEvent({ ...newEvent, description: e.target.value })}
                        // Removed `required` attribute
                    />
                    <TextField
                        margin="dense"
                        label="Start Time"
                        type="datetime-local"
                        fullWidth
                        variant="outlined"
                        value={newEvent.start_time ? format(convertUtcToZoned(newEvent.start_time), "yyyy-MM-dd'T'HH:mm") : ''}
                        onChange={(e) => {
                            // Convert from Zoned Time to UTC
                            const newStart = convertZonedToUtc(e.target.value);
                            setNewEvent({ ...newEvent, start_time: newStart.toISOString() });
                        }}
                        InputLabelProps={{
                            shrink: true,
                        }}
                        required
                    />
                    <TextField
                        margin="dense"
                        label="End Time"
                        type="datetime-local"
                        fullWidth
                        variant="outlined"
                        value={newEvent.end_time ? format(convertUtcToZoned(newEvent.end_time), "yyyy-MM-dd'T'HH:mm") : ''}
                        onChange={(e) => {
                            // Convert from Zoned Time to UTC
                            const newEnd = convertZonedToUtc(e.target.value);
                            setNewEvent({ ...newEvent, end_time: newEnd.toISOString() });
                        }}
                        InputLabelProps={{
                            shrink: true,
                        }}
                        required
                    />
                    <FormControl fullWidth margin="dense">
                        <TextField
                            label="Event Type"
                            type="text"
                            fullWidth
                            variant="outlined"
                            value={newEvent.event_type || ''}
                            onChange={(e) => setNewEvent({ ...newEvent, event_type: e.target.value })}
                            placeholder="e.g., Meeting, Deadline, etc. (Optional)"
                        />
                    </FormControl>
                    <FormControl fullWidth margin="dense">
                        <InputLabel>Project</InputLabel>
                        <Select
                            value={newEvent.project_id || ''}
                            onChange={(e) => handleProjectChange(e.target.value || null)}
                            label="Project"
                        >
                            <MenuItem value="">
                                <em>None</em>
                            </MenuItem>
                            {projects.map((project) => (
                                <MenuItem key={project.id} value={project.id}>
                                    {project.name}
                                </MenuItem>
                            ))}
                        </Select>
                    </FormControl>
                    {/* Separate "Select All" Checkbox */}
                    <FormControlLabel
                        control={
                            <Checkbox
                                checked={selectAllUsers}
                                onChange={handleSelectAllChange}
                                color="primary"
                            />
                        }
                        label="Select All Users"
                        sx={{ marginTop: 2 }}
                    />
                    <FormControl fullWidth margin="dense">
                        <InputLabel>Users</InputLabel>
                        <Select
                            multiple
                            value={newEvent.user_ids || []}
                            onChange={(e) => {
                                const value = e.target.value;
                                if (typeof value === 'string') {
                                    // This case won't occur since "Select All" is handled separately
                                } else {
                                    setNewEvent({ ...newEvent, user_ids: value as string[] });
                                    setSelectAllUsers((value as string[]).length === filteredUsers.length);
                                }
                            }}
                            input={<OutlinedInput label="Users" />}
                            renderValue={(selected) => {
                                const selectedUsers = filteredUsers.filter((user) => selected.includes(user._id));
                                return selectedUsers.map((user) => user.username).join(', ');
                            }}
                        >
                            {filteredUsers.map((user) => (
                                <MenuItem key={user._id} value={user._id}>
                                    <Checkbox checked={(newEvent.user_ids || []).includes(user._id)} />
                                    <ListItemText primary={user.username} />
                                </MenuItem>
                            ))}
                        </Select>
                    </FormControl>
                    {/* Adjusted Color Picker */}
                    <FormControl margin="dense">
                        <Box sx={{ display: 'flex', alignItems: 'center', marginTop: 2 }}>
                            <InputLabel shrink>Event Color</InputLabel>
                            <input
                                type="color"
                                value={newEvent.color || '#3174ad'} // Default color
                                onChange={(e) => setNewEvent({ ...newEvent, color: e.target.value })}
                                style={{
                                    width: '40px',
                                    height: '40px',
                                    border: 'none',
                                    padding: '0',
                                    marginLeft: '10px',
                                    cursor: 'pointer',
                                }}
                            />
                        </Box>
                    </FormControl>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleClose} color="secondary">
                        Cancel
                    </Button>
                    <Button onClick={handleSave} variant="contained" color="primary">
                        Save
                    </Button>
                </DialogActions>
            </Dialog>
            {/* Event Details Dialog */}
            <Dialog open={openDetails} onClose={handleDetailsClose} fullWidth maxWidth="sm">
                <DialogTitle sx={{ backgroundColor: '#4CAF50', color: '#fff' }}>Event Details</DialogTitle>
                <DialogContent>
                    {selectedEvent && (
                        <>
                            <TextField
                                margin="dense"
                                label="Title"
                                type="text"
                                fullWidth
                                variant="outlined"
                                value={selectedEvent.title}
                                onChange={(e) => setSelectedEvent({ ...selectedEvent, title: e.target.value })}
                                required
                            />
                            <TextField
                                margin="dense"
                                label="Description"
                                type="text"
                                fullWidth
                                variant="outlined"
                                multiline
                                rows={4}
                                value={selectedEvent.description || ''}
                                onChange={(e) => setSelectedEvent({ ...selectedEvent, description: e.target.value })}
                                // Removed `required` attribute
                            />
                            <TextField
                                margin="dense"
                                label="Start Time"
                                type="datetime-local"
                                fullWidth
                                variant="outlined"
                                value={selectedEvent.start_time ? format(convertUtcToZoned(selectedEvent.start_time), "yyyy-MM-dd'T'HH:mm") : ''}
                                onChange={(e) => {
                                    // Convert from Zoned Time to UTC
                                    const newStart = convertZonedToUtc(e.target.value);
                                    setSelectedEvent({
                                        ...selectedEvent,
                                        start_time: newStart.toISOString(),
                                        start: convertUtcToZoned(newStart)
                                    });
                                }}
                                InputLabelProps={{
                                    shrink: true,
                                }}
                                required
                            />
                            <TextField
                                margin="dense"
                                label="End Time"
                                type="datetime-local"
                                fullWidth
                                variant="outlined"
                                value={selectedEvent.end_time ? format(convertUtcToZoned(selectedEvent.end_time), "yyyy-MM-dd'T'HH:mm") : ''}
                                onChange={(e) => {
                                    // Convert from Zoned Time to UTC
                                    const newEnd = convertZonedToUtc(e.target.value);
                                    setSelectedEvent({
                                        ...selectedEvent,
                                        end_time: newEnd.toISOString(),
                                        end: convertUtcToZoned(newEnd)
                                    });
                                }}
                                InputLabelProps={{
                                    shrink: true,
                                }}
                                required
                            />
                            <FormControl fullWidth margin="dense">
                                <TextField
                                    label="Event Type"
                                    type="text"
                                    fullWidth
                                    variant="outlined"
                                    value={selectedEvent.event_type || ''}
                                    onChange={(e) => setSelectedEvent({ ...selectedEvent, event_type: e.target.value })}
                                    placeholder="e.g., Meeting, Deadline, etc. (Optional)"
                                />
                            </FormControl>
                            <FormControl fullWidth margin="dense">
                                <InputLabel>Project</InputLabel>
                                <Select
                                    value={selectedEvent?.project_id || ''}
                                    onChange={(e) => handleProjectChange(e.target.value || null)}
                                    label="Project"
                                >
                                    <MenuItem value="">
                                        <em>None</em>
                                    </MenuItem>
                                    {projects.map((project) => (
                                        <MenuItem key={project.id} value={project.id}>
                                            {project.name}
                                        </MenuItem>
                                    ))}
                                </Select>
                            </FormControl>
                            {/* Separate "Select All" Checkbox for Details */}
                            <FormControlLabel
                                control={
                                    <Checkbox
                                        checked={selectedEvent.user_ids.length === filteredUsers.length && filteredUsers.length > 0}
                                        onChange={handleSelectAllDetailsChange}
                                        color="primary"
                                    />
                                }
                                label="Select All Users"
                                sx={{ marginTop: 2 }}
                            />
                            <FormControl fullWidth margin="dense">
                                <InputLabel>Users</InputLabel>
                                <Select
                                    multiple
                                    value={selectedEvent?.user_ids || []}
                                    onChange={(e) => {
                                        const value = e.target.value;
                                        if (typeof value === 'string') {
                                            // This case won't occur since "Select All" is handled separately
                                        } else {
                                            setSelectedEvent({ ...selectedEvent!, user_ids: value as string[] });
                                        }
                                    }}
                                    input={<OutlinedInput label="Users" />}
                                    renderValue={(selected) => {
                                        const selectedUsers = filteredUsers.filter((user) => selected.includes(user._id));
                                        return selectedUsers.map((user) => user.username).join(', ');
                                    }}
                                >
                                    {filteredUsers.map((user) => (
                                        <MenuItem key={user._id} value={user._id}>
                                            <Checkbox checked={(selectedEvent?.user_ids || []).includes(user._id)} />
                                            <ListItemText primary={user.username} />
                                        </MenuItem>
                                    ))}
                                </Select>
                            </FormControl>
                            {/* Adjusted Color Picker */}
                            <FormControl margin="dense">
                                <Box sx={{ display: 'flex', alignItems: 'center', marginTop: 2 }}>
                                    <InputLabel shrink>Event Color</InputLabel>
                                    <input
                                        type="color"
                                        value={selectedEvent.color || '#3174ad'} // Default color
                                        onChange={(e) => setSelectedEvent({ ...selectedEvent, color: e.target.value })}
                                        style={{
                                            width: '40px',
                                            height: '40px',
                                            border: 'none',
                                            padding: '0',
                                            marginLeft: '10px',
                                            cursor: 'pointer',
                                        }}
                                    />
                                </Box>
                            </FormControl>
                            {selectedEvent.stats && (
                                <Box sx={{ marginTop: 2 }}>
                                    <Typography variant="h6">Event Stats</Typography>
                                    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                                        <Button onClick={() => handleStatsClick('accept')}>
                                            Accepted: {selectedEvent.stats.accept.count}
                                        </Button>
                                        <Button onClick={() => handleStatsClick('reject')}>
                                            Rejected: {selectedEvent.stats.reject.count}
                                        </Button>
                                        <Button onClick={() => handleStatsClick('pending')}>
                                            Pending: {selectedEvent.stats.pending.count}
                                        </Button>
                                    </Box>
                                </Box>
                            )}
                        </>
                    )}

                </DialogContent>
                <DialogActions>
                    <Button onClick={handleDetailsClose} color="secondary">
                        Close
                    </Button>
                    <Button onClick={handleUpdate} variant="contained" color="primary">
                        Update
                    </Button>
                    <Button onClick={handleDelete} variant="contained" color="error">
                        Delete
                    </Button>
                </DialogActions>
                <Dialog open={showUserList !== null} onClose={handleCloseUserList}>
                    <DialogTitle>
                        {showUserList && `${showUserList.charAt(0).toUpperCase() + showUserList.slice(1)} Users`}
                    </DialogTitle>
                    <DialogContent>
                        <List>
                            {selectedEvent?.stats && showUserList && selectedEvent.stats[showUserList].users.map((username, index) => (
                                <ListItem key={index}>{username}</ListItem>
                            ))}
                        </List>
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={handleCloseUserList} color="primary">
                            Close
                        </Button>
                    </DialogActions>
                </Dialog>
            </Dialog>
        </Box>
    );
};

export default MyCalendar;
