import { Routes, Route, Navigate, Outlet } from 'react-router-dom'
import { useSelector } from 'react-redux'
import { styled } from '@mui/material/styles'

import Board from './pages/Boards/_id'
import NotFound from './pages/404/NotFound'
import Auth from './pages/Auth/Auth'
import AccountVerification from './pages/Auth/AccountVerification'
import { selectCurrentUser } from './redux/user/userSlice'
import Settings from './pages/Settings/Settings'
import Boards from './pages/Boards'
import AppBar from './components/AppBar/AppBar'
import { AppSidebar } from './components/Appsidebar/Appsidebar'
import { SidebarTrigger, SidebarProvider } from './components/ui/sidebar'
import { useEffect } from 'react'
import { Box } from '@mui/material'
import Dashboard from './pages/Dashboard'
import Admin from './pages/Admin'

import MyCalendar from './pages/Calendar/Calendar';
import { Can, RoleProvider } from './context/RoleContext'
import { useTranslation } from 'react-i18next'
import AdminUsers from './pages/Admin/User'
import UserDetailPage from './pages/Users'

// Styled components for layout
const MainLayout = styled('div')({
  display: 'flex',
  minHeight: '100vh',
  width: '100%'
});

const MainContent = styled('main')(({ theme }) => ({
  flexGrow: 1,
  display: 'flex',
  flexDirection: 'column',
  minHeight: '100vh',
  position: 'relative',
  backgroundColor: theme.palette.mode === 'light' ? '#f5f5f5' : '#121212',
  transition: theme.transitions.create('margin', {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.leavingScreen,
  }),
  overflow: 'hidden',
}));

const MainContainer = styled('div')({
  flexGrow: 1,
  display: 'flex',
  flexDirection: 'column',
  position: 'relative',
  // padding: '20px',
  overflow: 'hidden',
});

const ProtectedRoute = ({ user }) => {
  if (!user) return <Navigate to='/login' replace={true} />
  return <Outlet />
}

function App() {
  const currentUser = useSelector(selectCurrentUser)
  const { t, i18n } = useTranslation();

  useEffect(() => {
    i18n.changeLanguage(localStorage.getItem('i18nextLng') || 'en');
  }, []);

  return (
    <RoleProvider initialRole={currentUser?.role || 'client'}>
      <SidebarProvider>
        <MainLayout>
        {currentUser && <AppSidebar />}
        <MainContent>
          {currentUser && <AppBar />}
          {/* {currentUser &&
            <Box sx={{ position: 'sticky', top: 0, zIndex: 1000 }}>
              <SidebarTrigger />
            </Box>
          } */}
          <MainContainer>
            <Routes>
              {/* Redirect Route */}
              <Route path='/' element={
                <Navigate to="/boards" replace={true} />
              } />

                {/* Protected Routes */}
                <Route element={<ProtectedRoute user={currentUser} />}>
                  {/* Board Routes */}
                  <Route path='/boards/:boardId' element={<Board />} />
                  <Route path='/boards' element={<Boards />} />
                  
                  {/* Calendar Routes */}
                  <Route path='/calendar' element={<MyCalendar />} />

                  {/* Settings Routes */}
                  <Route path='/settings/account' element={<Settings />} />
                  <Route path='/settings/security' element={<Settings />} />

                  {/* Dashboard Routes */}
                  <Route path='/dashboard' element={<Dashboard id={currentUser?._id} />} />
                  {/* Admin Routes */}
                  {currentUser?.role === 'admin' && <Route path='/admin' element={<Admin />} />}

                  {currentUser?.role === 'admin' && <Route path='/admin/users' element={<AdminUsers />} />}
                  <Route path='/users/:userId' element={<UserDetailPage />} />
                </Route>

              {/* Authentication Routes */}
              <Route path='/login' element={<Auth />} />
              <Route path='/register' element={<Auth />} />
              <Route path='/account/verification' element={<AccountVerification />} />

              {/* 404 Route */}
              <Route path='*' element={<NotFound />} />
            </Routes>
          </MainContainer>
        </MainContent>
      </MainLayout>
    </SidebarProvider>
    </RoleProvider>
  )
}

export default App
