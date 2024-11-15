import React, { useState, useEffect } from 'react';
import { Calendar, dateFnsLocalizer, Views } from 'react-big-calendar';
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
} from '@mui/material';
import Autocomplete from '@mui/material/Autocomplete';
import authorizedAxiosInstance from '../../utils/authorizeAxios';

interface User {
    _id: string;
    username: string;
}

interface Project {
    id: string;
    name: string;
}

interface MyEvent {
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

    const API_BASE_URL = 'http://localhost:8017/v1';

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
                const eventsFromAPI = response.data.map((event: MyEvent) => ({
                    ...event,
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
            const eventToAdd: MyEvent = {
                title: newEvent.title,
                start_time: newEvent.start_time,
                end_time: newEvent.end_time,
                user_ids: newEvent.user_ids,
                description: newEvent.description,
                event_type_id: newEvent.event_type_id,
                project_id: newEvent.project_id,
            };

            try {
                const response = await authorizedAxiosInstance.post(`${API_BASE_URL}/events`, eventToAdd);
                setEvents([...events, {
                    ...response.data,
                    start: new Date(response.data.start_time),
                    end: new Date(response.data.end_time)
                }]);
                setOpen(false);
            } catch (error) {
                console.error("Failed to save event:", error);
                alert('Failed to save event. Please try again.');
            }
        } else {
            alert('Please fill in all required fields.');
        }
    };

    const handleEventClick = (event: MyEvent) => {
        setSelectedEvent(event);
        setOpenDetails(true);
    };

    return (
        <div style={{ height: '100vh', padding: '10px' }}>
            <Button
                variant="contained"
                color="primary"
                onClick={handleOpen}
                style={{ marginBottom: '10px' }}
            >
                Add Event
            </Button>
            <Calendar
                localizer={localizer}
                events={events}
                startAccessor="start"
                endAccessor="end"
                style={{ height: '90%' }}
                views={[Views.MONTH, Views.WEEK, Views.DAY, Views.AGENDA]}
                defaultView={Views.MONTH}
                selectable
                onSelectEvent={handleEventClick}
                messages={{
                    today: 'Today',
                    previous: 'Back',
                    next: 'Next',
                    month: 'Month',
                    week: 'Week',
                    day: 'Day',
                    agenda: 'Agenda',
                    date: 'Date',
                    time: 'Time',
                    event: 'Event',
                    noEventsInRange: 'No events in this range.',
                    showMore: (total) => `+ Show more (${total})`,
                }}
            />

            {/* Dialog to add new event */}
            <Dialog open={open} onClose={handleClose}>
                <DialogTitle>Add New Event</DialogTitle>
                <DialogContent>
                    <TextField
                        autoFocus
                        margin="dense"
                        label="Event Title"
                        type="text"
                        fullWidth
                        variant="standard"
                        value={newEvent.title || ''}
                        onChange={(e) =>
                            setNewEvent({ ...newEvent, title: e.target.value })
                        }
                    />
                    {/* Other fields for adding event */}
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleClose}>Cancel</Button>
                    <Button onClick={handleSave} variant="contained">
                        Save
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Dialog to show event details */}
            <Dialog open={openDetails} onClose={handleDetailsClose}>
                <DialogTitle>Event Details</DialogTitle>
                <DialogContent>
                    {selectedEvent && (
                        <>
                            <TextField
                                label="Title"
                                fullWidth
                                margin="dense"
                                variant="outlined"
                                value={selectedEvent.title}
                                InputProps={{
                                    readOnly: true,
                                }}
                            />
                            <TextField
                                label="Description"
                                fullWidth
                                margin="dense"
                                variant="outlined"
                                value={selectedEvent.description}
                                InputProps={{
                                    readOnly: true,
                                }}
                            />
                            <TextField
                                label="Start Time"
                                fullWidth
                                margin="dense"
                                variant="outlined"
                                value={format(new Date(selectedEvent.start_time), "yyyy-MM-dd HH:mm")}
                                InputProps={{
                                    readOnly: true,
                                }}
                            />
                            <TextField
                                label="End Time"
                                fullWidth
                                margin="dense"
                                variant="outlined"
                                value={format(new Date(selectedEvent.end_time), "yyyy-MM-dd HH:mm")}
                                InputProps={{
                                    readOnly: true,
                                }}
                            />
                            <TextField
                                label="Event Type"
                                fullWidth
                                margin="dense"
                                variant="outlined"
                                value={
                                    selectedEvent.event_type_id === "1" ? "Meeting" :
                                        selectedEvent.event_type_id === "2" ? "Deadline" : "Presentation"
                                }
                                InputProps={{
                                    readOnly: true,
                                }}
                            />
                            <TextField
                                label="Project Name"
                                fullWidth
                                margin="dense"
                                variant="outlined"
                                value={
                                    projects.find(project => project.id === selectedEvent.project_id)?.name || ""
                                }
                                InputProps={{
                                    readOnly: true,
                                }}
                            />
                            <TextField
                                label="Participants"
                                fullWidth
                                margin="dense"
                                variant="outlined"
                                value={
                                    users.filter(user => selectedEvent.user_ids.includes(user._id))
                                        .map(user => user.username)
                                        .join(', ') || "No participants"
                                }
                                InputProps={{
                                    readOnly: true,
                                }}
                            />
                        </>
                    )}
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleDetailsClose}>Close</Button>
                </DialogActions>
            </Dialog>
        </div>
    );
};

export default MyCalendar;