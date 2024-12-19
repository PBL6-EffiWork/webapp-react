import { useState, useEffect } from 'react'
import AppBar from '../../components/AppBar/AppBar'
import PageLoadingSpinner from '../../components/Loading/PageLoadingSpinner'
import Container from '@mui/material/Container'
import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import Grid from '@mui/material/Unstable_Grid2'
import Stack from '@mui/material/Stack'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Pagination from '@mui/material/Pagination'
import PaginationItem from '@mui/material/PaginationItem'
import { Link, useLocation } from 'react-router-dom'
import randomColor from 'randomcolor'
import ArrowRightIcon from '@mui/icons-material/ArrowRight'
import SidebarCreateBoardModal from './create'
import { fetchBoardsAPI } from '../../apis'
import { DEFAULT_PAGE, DEFAULT_ITEMS_PER_PAGE } from '../../utils/constants'
import { Card as CardUI, CardContent as CardContentUI } from '@/components/ui/card';
import { ArrowRight } from 'lucide-react'
import SvgIcon from '@mui/icons-material/ArrowRight'
import { DashboardIcon } from '@radix-ui/react-icons'

// Interface definitions
interface BoardResponse {
  boards: Array<{ _id: string; title: string; description: string }>;
  totalBoards: number;
}

interface BoardCard {
  _id: string;
  title: string;
  description: string;
}

const BoardCardUI = ({ _id, title, description }: BoardCard) => {
  const randomColor = () => {
    return '#' + Math.floor(Math.random()*16777215).toString(16);
  };

  return (
    <Card className="h-full flex flex-col transition-all duration-200 ease-in-out hover:-translate-y-1 hover:shadow-lg">
      <div 
        className="h-32"
        style={{ backgroundColor: randomColor() }} 
      />
      <CardContent className="p-4 flex-grow flex flex-col">
        <h3 className="text-base sm:text-xl font-semibold mb-2">
          {title}
        </h3>
        <p className="text-sm text-muted-foreground mb-4 flex-grow line-clamp-2">
          {description}
        </p>
        <Link 
          to={`/boards/${_id}`}
          className="flex items-center justify-end text-primary hover:text-primary/80 transition-colors no-underline"
        >
          <span className="font-medium text-sm mr-1">Go to board</span>
          <ArrowRight className="h-4 w-4" />
        </Link>
      </CardContent>
    </Card>
  );
};

function Boards() {
  const [boards, setBoards] = useState<BoardCard[]>([]);
  const [totalBoards, setTotalBoards] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const location = useLocation();
  const query = new URLSearchParams(location.search);
  const page = parseInt(query.get('page') || '1', 10);

  const updateStateData = (res: BoardResponse) => {
    setBoards(res.boards || []);
    setTotalBoards(res.totalBoards || 0);
    setIsLoading(false);
  };

  useEffect(() => {
    setIsLoading(true);
    fetchBoardsAPI(location.search)
      .then(updateStateData)
      .catch(error => {
        console.error('Error fetching boards:', error);
        setIsLoading(false);
      });
  }, [location.search]);

  const afterCreateNewBoard = () => {
    setIsLoading(true);
    fetchBoardsAPI(location.search).then(updateStateData);
  };

  if (isLoading) {
    return <PageLoadingSpinner caption="Loading Boards..." />;
  }

  return (
    <Container maxWidth="xl" sx={{ py: { xs: 2, sm: 4 } }}>
      <Box sx={{ px: { xs: 1, sm: 2 } }}>
        <Stack spacing={3}>
          {/* Header Section */}
          <Box sx={{ 
            display: 'flex', 
            flexDirection: { xs: 'column', sm: 'row' },
            justifyContent: 'space-between',
            alignItems: { xs: 'flex-start', sm: 'center' },
            gap: 2
          }}>
            <Typography 
              variant="h4" 
              sx={{ 
                fontWeight: 'bold',
                fontSize: { xs: '1.5rem', sm: '2rem' }
              }}
            >
              Your boards
            </Typography>
            <Box>
              <SidebarCreateBoardModal afterCreateNewBoard={afterCreateNewBoard} />
            </Box>
          </Box>

          {/* Boards Grid */}
          {boards.length === 0 ? (
            <Box
            sx={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              textAlign: 'center',
              py: 4,
            }}
          >
            <DashboardIcon />
            <Typography variant="h6" color="text.secondary">
              No boards found. Create your first board!
            </Typography>
          </Box>
          ) 
          : 
          (
            <Grid 
              container 
              spacing={{ xs: 2, sm: 3 }}
              columns={{ xs: 1, sm: 2, md: 3, lg: 4, xl: 5 }}
            >
              {boards.map(board => (
                <Grid key={board._id} xs={1}>
                  <BoardCardUI {...board} />
                </Grid>
              ))}
            </Grid>
          )}

          {/* Pagination */}
          {totalBoards && totalBoards > DEFAULT_ITEMS_PER_PAGE && (
            <Box sx={{ 
              display: 'flex', 
              justifyContent: 'center',
              mt: 4 
            }}>
              <Pagination
                size="large"
                color="primary"
                shape="rounded"
                showFirstButton
                showLastButton
                count={Math.ceil(totalBoards / DEFAULT_ITEMS_PER_PAGE)}
                page={page}
                renderItem={(item) => (
                  <PaginationItem
                    component={Link}
                    to={`/boards${item.page === DEFAULT_PAGE ? '' : `?page=${item.page}`}`}
                    {...item}
                  />
                )}
              />
            </Box>
          )}
        </Stack>
      </Box>
    </Container>
  );
}

export default Boards;
