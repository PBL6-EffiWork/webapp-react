import React, { useState, useEffect } from 'react';
import { Calendar, dateFnsLocalizer, Views, Event as CalendarEvent } from 'react-big-calendar';
import { format, parse, startOfWeek, getDay } from 'date-fns';
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
} from '@mui/material';
import { styled } from '@mui/material/styles';
import authorizedAxiosInstance from '../../utils/authorizeAxios';
import { API_ROOT } from '../../utils/constants';

interface User {
    _id: string;
    username: string;
}

interface Project {
    id: string;
    name: string;
}

interface MyEvent extends CalendarEvent {
    _id: string;         // MongoDB ObjectId
    event_id: string;    // UUID from backend
    id?: string;         // ID for react-big-calendar (mapped from event_id)
    title: string;
    start_time: string;
    end_time: string;
    user_ids: string[];
    description: string;
    event_type_id: string;
    project_id: string;
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
    const [projects, setProjects] = useState<Project[]>([]);
    const [open, setOpen] = useState<boolean>(false);
    const [openDetails, setOpenDetails] = useState<boolean>(false);
    const [selectedEvent, setSelectedEvent] = useState<MyEvent | null>(null);

    const [newEvent, setNewEvent] = useState<Partial<MyEvent>>({
        title: '',
        start_time: new Date().toISOString(),
        end_time: new Date().toISOString(),
        user_ids: [],
        description: '',
        event_type_id: '',
        project_id: '',
    });

    const API_BASE_URL = `${API_ROOT}/v1`;

    useEffect(() => {
        const fetchUsers = async () => {
            try {
                const response = await authorizedAxiosInstance.get(`${API_BASE_URL}/users/list`);
                setUsers(response.data);
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

        const fetchEvents = async () => {
            try {
                const response = await authorizedAxiosInstance.get(`${API_BASE_URL}/events`);
                const eventsFromAPI = response.data.map((event: any) => ({
                    ...event,
                    id: event.event_id,
                    start: new Date(event.start_time),
                    end: new Date(event.end_time),
                }));
                setEvents(eventsFromAPI);
            } catch (error) {
                console.error('Error fetching events:', error);
            }
        };

        fetchUsers();
        fetchProjects();
        fetchEvents();
    }, []);

    const handleOpen = () => {
        setNewEvent({
            title: '',
            start_time: new Date().toISOString(),
            end_time: new Date().toISOString(),
            user_ids: [],
            description: '',
            event_type_id: '',
            project_id: '',
        });
        setOpen(true);
    };

    const handleClose = () => {
        setOpen(false);
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
            newEvent.description &&
            newEvent.event_type_id &&
            newEvent.project_id &&
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
                description: newEvent.description!,
                event_type_id: newEvent.event_type_id!,
                project_id: newEvent.project_id!,
            };

            try {
                const response = await authorizedAxiosInstance.post(`${API_BASE_URL}/events`, eventToAdd);
                const createdEvent: MyEvent = {
                    _id: response.data._id,
                    event_id: response.data.event_id,
                    id: response.data.event_id,
                    title: response.data.title!,
                    start_time: response.data.start_time!,
                    end_time: response.data.end_time!,
                    user_ids: response.data.user_ids!,
                    description: response.data.description!,
                    event_type_id: response.data.event_type_id!,
                    project_id: response.data.project_id!,
                    start: new Date(response.data.start_time!),
                    end: new Date(response.data.end_time!),
                };
                setEvents([...events, createdEvent]);
                setOpen(false);
            } catch (error: any) {
                console.error('Failed to save event:', error);
                alert(`Failed to save event: ${error.response?.data?.message || 'Please try again.'}`);
            }
        } else {
            alert('Please fill in all required fields.');
        }
    };

    const handleEventClick = (event: MyEvent) => {
        setSelectedEvent({ ...event });
        setOpenDetails(true);
    };

    const handleDelete = async () => {
        if (selectedEvent) {
            if (!window.confirm('Are you sure you want to delete this event?')) {
                return;
            }
            try {
                await authorizedAxiosInstance.delete(`${API_BASE_URL}/events/${selectedEvent.event_id}`);
                setEvents(events.filter((event) => event.event_id !== selectedEvent.event_id));
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
            selectedEvent.description &&
            selectedEvent.event_type_id &&
            selectedEvent.project_id &&
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
                description: selectedEvent.description,
                event_type_id: selectedEvent.event_type_id,
                project_id: selectedEvent.project_id,
            };

            try {
                const response = await authorizedAxiosInstance.put(
                    `${API_BASE_URL}/events/${selectedEvent.event_id}`,
                    updatedEvent
                );
                console.log(response.data);
                if (response.data) {
                    const updatedEventFromAPI = response.data;
                    setEvents((prevEvents) =>
                        prevEvents.map((event) =>
                            event.event_id === selectedEvent.event_id
                                ? {
                                    ...event,
                                    ...updatedEventFromAPI,
                                    start: new Date(updatedEventFromAPI.start_time),
                                    end: new Date(updatedEventFromAPI.end_time),
                                }
                                : event
                        )
                    );
                    setOpenDetails(false);
                    alert('Event updated successfully');
                } else {
                    throw new Error('Invalid response format');
                }
            } catch (error: any) {
                console.error('Failed to update event:', error.response || error.message);
                alert(`Failed to update event: ${error.response?.data?.message || 'Unknown error'}`);
            }
        } else {
            alert('Please fill in all required fields.');
        }
    };

    const eventStyleGetter = () => ({
        style: {
            backgroundColor: '#4CAF50',
            color: '#ffffff',
            borderRadius: '8px',
            padding: '6px',
            fontWeight: 'bold',
            fontSize: '0.85rem',
            boxShadow: '0 2px 6px rgba(0, 0, 0, 0.1)',
            cursor: 'pointer',
            transition: 'all 0.3s ease',
        },
    });

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
                        required
                    />
                    <TextField
                        margin="dense"
                        label="Start Time"
                        type="datetime-local"
                        fullWidth
                        variant="outlined"
                        value={newEvent.start_time ? new Date(newEvent.start_time).toISOString().slice(0, 16) : ''}
                        onChange={(e) => {
                            const newStart = new Date(e.target.value).toISOString();
                            setNewEvent({ ...newEvent, start_time: newStart });
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
                        value={newEvent.end_time ? new Date(newEvent.end_time).toISOString().slice(0, 16) : ''}
                        onChange={(e) => {
                            const newEnd = new Date(e.target.value).toISOString();
                            setNewEvent({ ...newEvent, end_time: newEnd });
                        }}
                        InputLabelProps={{
                            shrink: true,
                        }}
                        required
                    />
                    <FormControl fullWidth margin="dense" variant="outlined" required>
                        <InputLabel>Event Type</InputLabel>
                        <Select
                            value={newEvent.event_type_id || ''}
                            onChange={(e) => setNewEvent({ ...newEvent, event_type_id: e.target.value })}
                            label="Event Type"
                        >
                            <MenuItem value="1">Meeting</MenuItem>
                            <MenuItem value="2">Deadline</MenuItem>
                            <MenuItem value="3">Presentation</MenuItem>
                        </Select>
                    </FormControl>
                    <FormControl fullWidth margin="dense" variant="outlined" required>
                        <InputLabel>Project</InputLabel>
                        <Select
                            value={newEvent.project_id || ''}
                            onChange={(e) => setNewEvent({ ...newEvent, project_id: e.target.value })}
                            label="Project"
                        >
                            {projects.map((project) => (
                                <MenuItem key={project.id} value={project.id}>
                                    {project.name}
                                </MenuItem>
                            ))}
                        </Select>
                    </FormControl>
                    <FormControl fullWidth margin="dense" required>
                        <InputLabel>Users</InputLabel>
                        <Select
                            multiple
                            value={newEvent.user_ids || []}
                            onChange={(e) => setNewEvent({ ...newEvent, user_ids: e.target.value as string[] })}
                            input={<OutlinedInput label="Users" />}
                            renderValue={(selected) => {
                                const selectedUsers = users.filter((user) => selected.includes(user._id));
                                return selectedUsers.map((user) => user.username).join(', ');
                            }}
                        >
                            {users.map((user) => (
                                <MenuItem key={user._id} value={user._id}>
                                    <Checkbox checked={(newEvent.user_ids || []).includes(user._id)} />
                                    <ListItemText primary={user.username} />
                                </MenuItem>
                            ))}
                        </Select>
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
                                value={selectedEvent.description}
                                onChange={(e) => setSelectedEvent({ ...selectedEvent, description: e.target.value })}
                                required
                            />
                            <TextField
                                margin="dense"
                                label="Start Time"
                                type="datetime-local"
                                fullWidth
                                variant="outlined"
                                value={selectedEvent.start_time ? new Date(selectedEvent.start_time).toISOString().slice(0, 16) : ''}
                                onChange={(e) => {
                                    const newStart = new Date(e.target.value).toISOString();
                                    setSelectedEvent({ ...selectedEvent, start_time: newStart, start: new Date(newStart) });
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
                                value={selectedEvent.end_time ? new Date(selectedEvent.end_time).toISOString().slice(0, 16) : ''}
                                onChange={(e) => {
                                    const newEnd = new Date(e.target.value).toISOString();
                                    setSelectedEvent({ ...selectedEvent, end_time: newEnd, end: new Date(newEnd) });
                                }}
                                InputLabelProps={{
                                    shrink: true,
                                }}
                                required
                            />
                            <FormControl fullWidth margin="dense" variant="outlined" required>
                                <InputLabel>Event Type</InputLabel>
                                <Select
                                    value={selectedEvent.event_type_id}
                                    onChange={(e) => setSelectedEvent({ ...selectedEvent, event_type_id: e.target.value })}
                                    label="Event Type"
                                >
                                    <MenuItem value="1">Meeting</MenuItem>
                                    <MenuItem value="2">Deadline</MenuItem>
                                    <MenuItem value="3">Presentation</MenuItem>
                                </Select>
                            </FormControl>
                            <FormControl fullWidth margin="dense" variant="outlined" required>
                                <InputLabel>Project</InputLabel>
                                <Select
                                    value={selectedEvent.project_id}
                                    onChange={(e) => setSelectedEvent({ ...selectedEvent, project_id: e.target.value })}
                                    label="Project"
                                >
                                    {projects.map((project) => (
                                        <MenuItem key={project.id} value={project.id}>
                                            {project.name}
                                        </MenuItem>
                                    ))}
                                </Select>
                            </FormControl>
                            <FormControl fullWidth margin="dense" required>
                                <InputLabel>Users</InputLabel>
                                <Select
                                    multiple
                                    value={selectedEvent.user_ids}
                                    onChange={(e) => setSelectedEvent({ ...selectedEvent, user_ids: e.target.value as string[] })}
                                    input={<OutlinedInput label="Users" />}
                                    renderValue={(selected) => {
                                        const selectedUsers = users.filter((user) => selected.includes(user._id));
                                        return selectedUsers.map((user) => user.username).join(', ');
                                    }}
                                >
                                    {users.map((user) => (
                                        <MenuItem key={user._id} value={user._id}>
                                            <Checkbox checked={selectedEvent.user_ids.includes(user._id)} />
                                            <ListItemText primary={user.username} />
                                        </MenuItem>
                                    ))}
                                </Select>
                            </FormControl>
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
            </Dialog>
        </Box>
    );
};

export default MyCalendar;
