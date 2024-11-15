import Box from '@mui/material/Box'
import Profiles from './Menus/Profiles'
import Tooltip from '@mui/material/Tooltip'
import HelpOutlineIcon from '@mui/icons-material/HelpOutline'
import Notifications from './Notifications/Notifications'
import AutoCompleteSearchBoard from './SearchBoards/AutoCompleteSearchBoard'
import colors from '@/constants/color';

function AppBar() {
  return (
    <Box sx={{
      width: '100%',
      height: (theme) => theme.Effiwork.appBarHeight,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: 2,
      paddingX: 2,
      overflowX: 'auto',
      bgcolor: (theme) => (theme.palette.mode === 'dark' ? '#fff' : '#fff')
    }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
      <AutoCompleteSearchBoard />
      </Box>

      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
        <Notifications />

        <Tooltip title="Help">
          <HelpOutlineIcon sx={{ cursor: 'pointer', color: colors.default[100] }} />
        </Tooltip>

        <Profiles />

      </Box>
    </Box>
  )
}

export default AppBar
