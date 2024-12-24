import { useEffect, useState } from 'react'
import Container from '@mui/material/Container'
import AppBar from '../../components/AppBar/AppBar'
import BoardBar from './BoardBar/BoardBar'
import BoardContent from './BoardContent/BoardContent'

import {
  updateBoardDetailsAPI,
  updateColumnDetailsAPI,
  moveCardToDifferentColumnAPI
} from '../../apis'
import { cloneDeep } from 'lodash'
import {
  fetchBoardDetailsAPI,
  updateCurrentActiveBoard,
  selectCurrentActiveBoard,
  selectError
} from '../../redux/activeBoard/activeBoardSlice'
import { useSelector } from 'react-redux'
import { useNavigate, useParams } from 'react-router-dom'
import PageLoadingSpinner from '../../components/Loading/PageLoadingSpinner'
import ActiveCard from '../../components/Modal/ActiveCard/ActiveCard'
import { useAppDispatch } from '../../hooks/useAppDispatch'
import BoardTools from './BoardTools/BoardTools'
import { Box, Tab, Tabs, Typography } from '@mui/material'
import React from 'react'
import BoardTable from './BoardTable/BoardTable'
import { Column } from '../../interfaces/column'
import { Card } from '../../interfaces/card'
import { loadCardsStatusOfBoardThunk, loadMembersBoardThunk } from '../../redux/board/boardSlice'
import { useAbility } from '@casl/react'
import { useRole } from '../../context/RoleContext'
import ManagerMembersTable from './ManagerMember/ManagerMember'

function TabPanel(props: any) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`simple-tabpanel-${index}`}
      aria-labelledby={`simple-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ p: 3 }}>
          <Typography component="div">{children}</Typography>
        </Box>
      )}
    </div>
  );
}

function Board() {
  const dispatch = useAppDispatch()
  const navigate = useNavigate()
  const board = useSelector(selectCurrentActiveBoard)
  const [columns, setColumns] = useState<Column[]>([])
  const error = useSelector(selectError);
  const [value, setValue] = useState(0);

  const { ability } = useRole()

  const handleChange = (event: React.SyntheticEvent, newValue: number) => {
    setValue(newValue);
  };

  const { boardId } = useParams()

  useEffect(() => {

    // Call API
    if (!boardId) {
      return;
    }

    dispatch(fetchBoardDetailsAPI(boardId as string))
    dispatch(loadMembersBoardThunk(boardId as string))
    dispatch(loadCardsStatusOfBoardThunk(boardId as string))
  }, [dispatch, boardId])

  useEffect(() => {
    if (error){
      navigate('/404', { replace: true })
    }

    return () => {
      // Cleanup
    }
  }, [error])

  const moveColumns = (dndOrderedColumns: any[]) => {
    const dndOrderedColumnsIds = dndOrderedColumns.map(c => c._id)

    const newBoard = { ...board }
    newBoard.columns = dndOrderedColumns
    newBoard.columnOrderIds = dndOrderedColumnsIds
    // setBoard(newBoard)
    dispatch(updateCurrentActiveBoard(newBoard as any))

    // Gọi API update Board
    updateBoardDetailsAPI(newBoard._id, { columnOrderIds: dndOrderedColumnsIds })
  }

  const moveCardInTheSameColumn = (dndOrderedCards: any[], dndOrderedCardIds: string[], columnId: string) => {
    const newBoard = cloneDeep(board)
    const columnToUpdate = newBoard!.columns.find((column: any) => column._id === columnId)
    if (columnToUpdate) {
      columnToUpdate.cards = dndOrderedCards
      columnToUpdate.cardOrderIds = dndOrderedCardIds
    }
    dispatch(updateCurrentActiveBoard(newBoard as any))

    updateColumnDetailsAPI(columnId, { cardOrderIds: dndOrderedCardIds })
  }

  const moveCardToDifferentColumn = (currentCardId: string, prevColumnId: string, nextColumnId: string | undefined, dndOrderedColumns: any[]) => {
    const dndOrderedColumnsIds = dndOrderedColumns.map(c => c._id)

    const newBoard = { ...board }
    newBoard.columns = dndOrderedColumns
    newBoard.columnOrderIds = dndOrderedColumnsIds
    dispatch(updateCurrentActiveBoard(newBoard as any))

    let prevCardOrderIds = dndOrderedColumns.find(c => c._id === prevColumnId)?.cardOrderIds
    if (prevCardOrderIds[0].includes('placeholder-card')) prevCardOrderIds = []

    moveCardToDifferentColumnAPI({
      currentCardId,
      prevColumnId,
      prevCardOrderIds: prevCardOrderIds || [],
      nextColumnId: nextColumnId as string,
      nextCardOrderIds: dndOrderedColumns.find(c => c._id === nextColumnId)?.cardOrderIds || []
    })
  }

  useEffect(() => {
    return () => {
      dispatch(updateCurrentActiveBoard(null))
    }
  },[dispatch])

  useEffect(() => {
    if (board) {
      const columnsData = board.columns
      setColumns(columnsData)
    }
  }, [board])

  if (!board) {
    return <PageLoadingSpinner caption="Loading Board..." />
  }

  return (
    <Container disableGutters maxWidth={false} sx={{ height: '100vh' }}>
      <ActiveCard />

      <BoardBar board={board} />
      <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
        <Tabs value={value} onChange={handleChange} aria-label="dashboard tabs">
          <Tab label="Board" />
          <Tab label="Table" />
          {ability.can('manage', 'board') && <Tab label="Members" />}
        </Tabs>
      </Box>
      <TabPanel value={value} index={0}>
        <Box sx={{ flexGrow: 1, overflow: 'auto', background: 'white', padding: 2, borderRadius: 2 }}>
          <BoardContent
            board={board}
            moveColumns={moveColumns}
            moveCardInTheSameColumn={moveCardInTheSameColumn}
            moveCardToDifferentColumn={moveCardToDifferentColumn}
          />
        </Box>
      </TabPanel>
      <TabPanel value={value} index={1}>
        <Box sx={{ flexGrow: 1, overflow: 'auto', background: 'white', padding: 2, borderRadius: 2 }}>
          <BoardTable data={columns} boardId={board._id} />
        </Box>
      </TabPanel>
      <TabPanel value={value} index={2}>
        <Box sx={{ flexGrow: 1, overflow: 'auto', background: 'white', padding: 2, borderRadius: 2 }}>
          <ManagerMembersTable boardId={board._id} /> 
        </Box>
      </TabPanel>
    </Container>
  )
}

export default React.memo(Board)
