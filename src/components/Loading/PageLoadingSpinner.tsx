import Box from '@mui/material/Box'
import CircularProgress from '@mui/material/CircularProgress'
import Typography from '@mui/material/Typography'

interface PageLoadingSpinnerProps {
  caption: string;
}

function PageLoadingSpinner({ caption }: PageLoadingSpinnerProps) {
  return (
    <Box sx={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 2,
      width: '100%',
      height: '100%',
      backgroundColor: '#fff'
    }}>
      <CircularProgress />
      <Typography>{caption}</Typography>
    </Box>
  )
}

export default PageLoadingSpinner
