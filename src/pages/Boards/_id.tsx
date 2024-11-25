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
  const [cards, setCards] = useState<Card[]>([])
  const error = useSelector(selectError);
  const [value, setValue] = useState(0);

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

  /**
   * Func này có nhiệm vụ gọi API và xử lý khi kéo thả Column xong xuôi
   * Chỉ cần gọi API để cập nhật mảng columnOrderIds của Board chứa nó (thay đổi vị trí trong board)
   */
  const moveColumns = (dndOrderedColumns: any[]) => {
    // Update cho chuẩn dữ liệu state Board
    const dndOrderedColumnsIds = dndOrderedColumns.map(c => c._id)

    /**
    * Trường hợp dùng Spread Operator này thì lại không sao bởi vì ở đây chúng ta không dùng push như ở trên làm thay đổi trực tiếp kiểu mở rộng mảng, mà chỉ đang gán lại toàn bộ giá trị columns và columnOrderIds bằng 2 mảng mới. Tương tự như cách làm concat ở trường hợp createNewColumn thôi :))
    */
    const newBoard = { ...board }
    newBoard.columns = dndOrderedColumns
    newBoard.columnOrderIds = dndOrderedColumnsIds
    // setBoard(newBoard)
    dispatch(updateCurrentActiveBoard(newBoard as any))

    // Gọi API update Board
    updateBoardDetailsAPI(newBoard._id, { columnOrderIds: dndOrderedColumnsIds })
  }

  /**
   * Khi di chuyển card trong cùng Column:
   * Chỉ cần gọi API để cập nhật mảng cardOrderIds của Column chứa nó (thay đổi vị trí trong mảng)
   */
  const moveCardInTheSameColumn = (dndOrderedCards: any[], dndOrderedCardIds: string[], columnId: string) => {
    // Update cho chuẩn dữ liệu state Board

    /**
    * Cannot assign to read only property 'cards' of object
    * Trường hợp Immutability ở đây đã đụng tới giá trị cards đang được coi là chỉ đọc read only - (nested object - can thiệp sâu dữ liệu)
    */
    // const newBoard = { ...board }
    const newBoard = cloneDeep(board)
    const columnToUpdate = newBoard!.columns.find((column: any) => column._id === columnId)
    if (columnToUpdate) {
      columnToUpdate.cards = dndOrderedCards
      columnToUpdate.cardOrderIds = dndOrderedCardIds
    }
    // setBoard(newBoard)
    dispatch(updateCurrentActiveBoard(newBoard as any))

    // Gọi API update Column
    updateColumnDetailsAPI(columnId, { cardOrderIds: dndOrderedCardIds })
  }

  /**
   * Khi di chuyển card sang Column khác:
   * B1: Cập nhật mảng cardOrderIds của Column ban đầu chứa nó (Hiểu bản chất là xóa cái _id của Card ra khỏi mảng)
   * B2: Cập nhật mảng cardOrderIds của Column tiếp theo (Hiểu bản chất là thêm _id của Card vào mảng)
   * B3: Cập nhật lại trường columnId mới của cái Card đã kéo
   * => Làm một API support riêng.
   */
  const moveCardToDifferentColumn = (currentCardId: string, prevColumnId: string, nextColumnId: string | undefined, dndOrderedColumns: any[]) => {
    // Update cho chuẩn dữ liệu state Board
    const dndOrderedColumnsIds = dndOrderedColumns.map(c => c._id)

    // Tương tự đoạn xử lý chỗ hàm moveColumns nên không ảnh hưởng Redux Toolkit Immutability gì ở đây cả.
    const newBoard = { ...board }
    newBoard.columns = dndOrderedColumns
    newBoard.columnOrderIds = dndOrderedColumnsIds
    // setBoard(newBoard)
    dispatch(updateCurrentActiveBoard(newBoard as any))

    // Gọi API xử lý phía BE
    let prevCardOrderIds = dndOrderedColumns.find(c => c._id === prevColumnId)?.cardOrderIds
    // Xử lý vấn đề khi kéo Card cuối cùng ra khỏi Column, Column rỗng sẽ có placeholder card, cần xóa nó đi trước khi gửi dữ liệu lên cho phía BE. (Nhớ lại video 37.2)
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
      const cardsData: Card[] = columnsData.flatMap((col) => col.cards)
      setColumns(columnsData)
      setCards(cardsData)
    }
  }, [board])

  if (!board) {
    console.log('Board is null', board);
    return <PageLoadingSpinner caption="Loading Board..." />
  }

  return (
    <Container disableGutters maxWidth={false} sx={{ height: '100vh' }}>
      {/* Modal Active Card, check đóng/mở dựa theo cái State isShowModalActiveCard lưu trong Redux */}
      <ActiveCard />

      {/* Các thành phần còn lại của Board Details */}
      <BoardBar board={board} />
      {/* <BoardTools /> */}
      <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
        <Tabs value={value} onChange={handleChange} aria-label="dashboard tabs">
          <Tab label="Board" />
          <Tab label="Table" />
          {/* <Tab label="Timeline" /> */}
        </Tabs>
      </Box>
      {/* Nội dung từng Tab */}
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
        {/* <TimelineComponent /> */}
      </TabPanel>
    </Container>
  )
}

export default React.memo(Board)
