import Box from '@mui/material/Box'
import Modal from '@mui/material/Modal'
import Typography from '@mui/material/Typography'
import CreditCardIcon from '@mui/icons-material/CreditCard'
import CancelIcon from '@mui/icons-material/Cancel'
import Grid from '@mui/material/Unstable_Grid2'
import Stack from '@mui/material/Stack'
import PersonOutlineOutlinedIcon from '@mui/icons-material/PersonOutlineOutlined'
import TaskAltOutlinedIcon from '@mui/icons-material/TaskAltOutlined'
import AttachFileOutlinedIcon from '@mui/icons-material/AttachFileOutlined'
import ImageOutlinedIcon from '@mui/icons-material/ImageOutlined'
import AutoFixHighOutlinedIcon from '@mui/icons-material/AutoFixHighOutlined'
import SubjectRoundedIcon from '@mui/icons-material/SubjectRounded'
import DvrOutlinedIcon from '@mui/icons-material/DvrOutlined'

import ToggleFocusInput from '@/components/Form/ToggleFocusInput'
import VisuallyHiddenInput from '@/components/Form/VisuallyHiddenInput'
import { singleFileValidator } from '@/utils/validators'
import { toast } from 'react-toastify'
import CardUserGroup from './CardUserGroup'
import CardDescriptionMdEditor from './CardDescriptionMdEditor'
import CardActivitySection from './CardActivitySection'
import { useSelector } from 'react-redux'
import {
  clearAndHideCurrentActiveCard,
  selectCurrentActiveCard,
  updateCurrentActiveCard,
  selectIsShowModalActiveCard
} from '@/redux/activeCard/activeCardSlice'
import { updateCardDetailsAPI } from '@/apis'
import { updateCardInBoard } from '@/redux/activeBoard/activeBoardSlice'
import { selectCurrentUser } from '@/redux/user/userSlice'
import { CARD_MEMBER_ACTIONS } from '@/utils/constants'
import ExitToAppIcon from '@mui/icons-material/ExitToApp'
import CheckCircleIcon from '@mui/icons-material/CheckCircle'

import { styled } from '@mui/material/styles'
import { useAppDispatch } from '@/hooks/useAppDispatch'
import { DatePicker } from '../DatePicker/DatePicker'
import React from 'react'

import { loadHistoryCardThunk, selectHistoryByCardId } from '@/redux/historyCard/historyCardSlice'
import { addCommentThunk, loadCommentsThunk, selectCommentsByCardId } from '../../../redux/comment/commentSlice'
import { Tab, Tabs } from '@mui/material'
import CardHistory from './CardHistory'
import { Checkbox } from '../../ui/checkbox'
import Tasks from './Tasks'
import { loadTasksThunk } from '../../../redux/task/taskSlice'
import Checklist from './Checklist'

const SidebarItem = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  gap: '6px',
  cursor: 'pointer',
  fontSize: '14px',
  fontWeight: '600',
  color: theme.palette.mode === 'dark' ? '#90caf9' : '#172b4d',
  backgroundColor: theme.palette.mode === 'dark' ? '#2f3542' : '#091e420f',
  padding: '10px',
  borderRadius: '4px',
  '&:hover': {
    backgroundColor: theme.palette.mode === 'dark' ? '#33485D' : theme.palette.grey[300],
    '&.active': {
      color: theme.palette.mode === 'dark' ? '#000000de' : '#0c66e4',
      backgroundColor: theme.palette.mode === 'dark' ? '#90caf9' : '#e9f2ff'
    }
  }
}))

function ActiveCard() {
  const dispatch = useAppDispatch()
  const activeCard = useSelector(selectCurrentActiveCard)
  const isShowModalActiveCard = useSelector(selectIsShowModalActiveCard)
  const currentUser = useSelector(selectCurrentUser)
  const comments = useSelector(selectCommentsByCardId(activeCard?._id))
  const histories = useSelector(selectHistoryByCardId(activeCard?._id))
  
  const [currentTab, setCurrentTab] = React.useState(0) // Trạng thái tab hiện tại

  const handleChangeTab = (event: React.SyntheticEvent, newValue: number) => {
    setCurrentTab(newValue)
  };

  const handleCloseModal = () => {
    dispatch(clearAndHideCurrentActiveCard())
  }

  const callApiUpdateCard = async (updateData: any) => {
    const updatedCard = await updateCardDetailsAPI(activeCard?._id, updateData)

    dispatch(updateCurrentActiveCard(updatedCard))

    dispatch(updateCardInBoard(updatedCard))

    return updatedCard
  }

  const onUpdateCardTitle = (newTitle: any) => {
    callApiUpdateCard({ title: newTitle.trim() })
  }

  const onUpdateCardDescription = (newDescription: any) => {
    callApiUpdateCard({ description: newDescription })
  }

  const onUpdateCardDate = (date: any) => {
    if (date?.to !== undefined && date?.from !== undefined &&
      new Date(date.from).getTime() === new Date(activeCard?.startDate).getTime() &&
      new Date(date.to).getTime() ===   new Date(activeCard?.dueDate).getTime()
    ) {
      return;
    }

    callApiUpdateCard({ updateStartDate: date?.from ?? null, updateDueDate: date?.to ?? null })
  }

  const onUploadCardCover = (event: any) => {
    const error = singleFileValidator(event.target?.files[0])
    if (error) {
      toast.error(error)
      return
    }
    let reqData = new FormData()
    reqData.append('cardCover', event.target?.files[0])

    toast.promise(
      callApiUpdateCard(reqData).finally(() => event.target.value = ''),
      { pending: 'Updating...' }
    )
  }

  const onAddCardComment = async (commentToAdd: any) => {
    dispatch(addCommentThunk(commentToAdd))
  }

  const onUpdateCardMembers = (incomingMemberInfo: any) => {
    callApiUpdateCard({ incomingMemberInfo })
  }

  React.useEffect(() => {
    if (activeCard) {
      dispatch(loadHistoryCardThunk(activeCard._id))
      dispatch(loadCommentsThunk(activeCard._id))
      dispatch(loadTasksThunk(activeCard._id))
    }
  }, [activeCard])

  return (
    <Modal
      disableScrollLock
      open={isShowModalActiveCard}
      onClose={handleCloseModal}
      sx={{ overflowY: 'auto' }}>
      <Box sx={{
        position: 'relative',
        width: 900,
        maxWidth: 900,
        bgcolor: 'white',
        boxShadow: 24,
        borderRadius: '8px',
        border: 'none',
        outline: 0,
        padding: '40px 20px 20px',
        margin: '50px auto',
        backgroundColor: (theme) => theme.palette.mode === 'dark' ? '#1A2027' : '#fff'
      }}>
        <Box sx={{
          position: 'absolute',
          top: '12px',
          right: '10px',
          cursor: 'pointer'
        }}>
          <CancelIcon color="error" sx={{ '&:hover': { color: 'error.light' } }} onClick={handleCloseModal} />
        </Box>

        {activeCard?.cover &&
          <Box sx={{ mb: 4 }}>
            <img
              style={{ width: '100%', height: '320px', borderRadius: '6px', objectFit: 'cover' }}
              src={activeCard?.cover}
              alt="card-cover"
            />
          </Box>
        }

        <Box sx={{ mb: 1, mt: -3, pr: 2.5, display: 'flex', alignItems: 'center', gap: 1 }}>
          <CreditCardIcon />

          {/* Feature 01: Xử lý tiêu đề của Card */}
          <ToggleFocusInput
            inputFontSize='22px'
            value={activeCard?.title}
            onChangedValue={onUpdateCardTitle} />
        </Box>

        <Grid container spacing={2} sx={{ mb: 3 }}>
          {/* Left side */}
          <Grid xs={12} sm={9}>
            <Box sx={{ mb: 3 }}>
              <Typography sx={{ fontWeight: '600', color: 'primary.main', mb: 1 }}>Members</Typography>

              {/* Feature 02: Xử lý các thành viên của Card */}
              <CardUserGroup
                cardMemberIds={activeCard?.memberIds as string[]}
                onUpdateCardMembers={onUpdateCardMembers}
              />
            </Box>

            <Box sx={{ mb: 3, display: 'flex', flexDirection: 'row', alignItems: 'center', gap: '10px' }}>
              <Typography component="span" sx={{ fontWeight: '600', fontSize: '20px' }}>Due Date</Typography>

              <DatePicker isShowLastDate={true} selectedDate={{
                from: activeCard?.startDate,
                to: activeCard?.dueDate
              }} onDateChange={(date) => {
                onUpdateCardDate(date)
              }}/>

              <Checkbox 
                id='isDone' 
                checked={activeCard?.isDone} 
                className="border-border"
                onCheckedChange={() => {
                  callApiUpdateCard({ isDone: !activeCard?.isDone })
                }}
              ></Checkbox>
            </Box>

            <Box sx={{ mb: 3 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                <SubjectRoundedIcon />
                <Typography component="span" sx={{ fontWeight: '600', fontSize: '20px' }}>Description</Typography>
              </Box>

              {/* Feature 03: Xử lý mô tả của Card */}
              <CardDescriptionMdEditor
                cardDescriptionProp={activeCard?.description}
                handleUpdateCardDescription={onUpdateCardDescription}
              />
            </Box>

            <Box sx={{ mb: 3 }}>
              <Tasks cardId={activeCard?._id} boardId={activeCard?.boardId} />
            </Box>

            <Box sx={{ mb: 3 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                <DvrOutlinedIcon />
                <Typography component="span" sx={{ fontWeight: '600' }}>Activity</Typography>
              </Box>
              <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
                <Tabs
                  value={currentTab}
                  onChange={handleChangeTab}
                  aria-label="activity tabs"
                >
                  <Tab label="Comments" />
                  <Tab label="Histories" />
                </Tabs>
              </Box>

              {/* Feature 04: Xử lý các hành động, ví dụ comment vào Card */}
              <Box sx={{ mt: 2 }}>
                {currentTab === 0 && (
                  <CardActivitySection
                    cardId={activeCard?._id}
                    cardComments={comments}
                    onAddCardComment={onAddCardComment}
                  />
                )}
                {currentTab === 1 && (
                  <CardHistory histories={histories} />
                )}
              </Box>
            </Box>
          </Grid>

          {/* Right side */}
          <Grid xs={12} sm={3}>
            <Typography sx={{ fontWeight: '600', color: 'primary.main', mb: 1 }}>Add To Card</Typography>
            <Stack direction="column" spacing={1}>
              {/* Feature 05: Xử lý hành động bản thân user tự join vào card */}
              {/* Nếu user hiện tại đang đăng nhập chưa thuộc mảng memberIds của card thì mới cho hiện nút Join và ngược lại */}
              {activeCard?.memberIds?.includes(currentUser._id)
                ? <SidebarItem
                  sx={{ color: 'error.light', '&:hover': { color: 'error.light' } }}
                  onClick={() => onUpdateCardMembers({
                    userId: currentUser._id,
                    action: CARD_MEMBER_ACTIONS.REMOVE
                  })}
                >
                  <ExitToAppIcon fontSize="small" />
                  Leave
                </SidebarItem>
                : <SidebarItem
                  className="active"
                  onClick={() => onUpdateCardMembers({
                    userId: currentUser._id,
                    action: CARD_MEMBER_ACTIONS.ADD
                  })}
                >
                  <Box sx={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <PersonOutlineOutlinedIcon fontSize="small" />
                      <span>Join</span>
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <CheckCircleIcon fontSize="small" sx={{ color: '#27ae60' }} />
                    </Box>
                  </Box>
                </SidebarItem>
              }

              {/* Feature 06: Xử lý hành động cập nhật ảnh Cover của Card */}
              <SidebarItem className="active" component="label">
                <Box sx={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <ImageOutlinedIcon fontSize="small" />
                    <span>Cover</span>
                  </Box>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <CheckCircleIcon fontSize="small" sx={{ color: '#27ae60' }} />
                  </Box>
                </Box>
                <VisuallyHiddenInput type="file" onChange={onUploadCardCover} />
              </SidebarItem>

              <SidebarItem><AttachFileOutlinedIcon fontSize="small" />Attachment</SidebarItem>
              {/* <SidebarItem><LocalOfferOutlinedIcon fontSize="small" />Labels</SidebarItem> */}
              <Checklist
                cardId={activeCard?._id ?? ''}
                boardId={activeCard?.boardId ?? ''}
                button={
                  <SidebarItem>
                    <TaskAltOutlinedIcon fontSize="small" />
                    Check list
                  </SidebarItem>
                }
              />
              
              <SidebarItem><AutoFixHighOutlinedIcon fontSize="small" />Custom Fields</SidebarItem>
            </Stack>

            {/* <Divider sx={{ my: 2 }} /> */}

            {/* <Typography sx={{ fontWeight: '600', color: 'primary.main', mb: 1 }}>Power-Ups</Typography>
            <Stack direction="column" spacing={1}>
              <SidebarItem><AspectRatioOutlinedIcon fontSize="small" />Card Size</SidebarItem>
              <SidebarItem><AddToDriveOutlinedIcon fontSize="small" />Google Drive</SidebarItem>
              <SidebarItem><AddOutlinedIcon fontSize="small" />Add Power-Ups</SidebarItem>
            </Stack> */}

            {/* <Divider sx={{ my: 2 }} /> */}

            {/* <Typography sx={{ fontWeight: '600', color: 'primary.main', mb: 1 }}>Actions</Typography>
            <Stack direction="column" spacing={1}>
              <SidebarItem><ArrowForwardOutlinedIcon fontSize="small" />Move</SidebarItem>
              <SidebarItem><ContentCopyOutlinedIcon fontSize="small" />Copy</SidebarItem>
              <SidebarItem><AutoAwesomeOutlinedIcon fontSize="small" />Make Template</SidebarItem>
              <SidebarItem><ArchiveOutlinedIcon fontSize="small" />Archive</SidebarItem>
              <SidebarItem><ShareOutlinedIcon fontSize="small" />Share</SidebarItem>
            </Stack> */}
          </Grid>
        </Grid>
      </Box>
    </Modal>
  )
}

export default ActiveCard
