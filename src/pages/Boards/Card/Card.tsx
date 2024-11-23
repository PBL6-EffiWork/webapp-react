import { Box, Card as MuiCard } from '@mui/material'
import CardActions from '@mui/material/CardActions'
import CardContent from '@mui/material/CardContent'
import CardMedia from '@mui/material/CardMedia'
import GroupIcon from '@mui/icons-material/Group'
import CommentIcon from '@mui/icons-material/Comment'
import AttachmentIcon from '@mui/icons-material/Attachment'
import Button from '@mui/material/Button'
import Typography from '@mui/material/Typography'

import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { updateCurrentActiveCard, showModalActiveCard } from '../../../redux/activeCard/activeCardSlice'
import { useAppDispatch } from '../../../hooks/useAppDispatch'
import React, { useEffect } from 'react'
import { useSelector } from 'react-redux'
import { selectBoardMembersId } from '../../../redux/board/boardSlice'
import { Card as ICard } from '../../../interfaces/card'
import BoardUserGroup from '../BoardBar/BoardUserGroup'
import { loadCommentsThunk, selectCommentsByCardId } from '../../../redux/comment/commentSlice'
import { WatchIcon } from 'lucide-react'
import { CheckBox, CheckBoxOutlineBlankOutlined } from '@mui/icons-material'
import color from '../../../constants/color'
import { updateCardDetailsAPI } from '../../../apis'
import { updateCardInBoard } from '../../../redux/activeBoard/activeBoardSlice'
import { useSearchParams } from 'react-router-dom';

interface CardProps {
  card: ICard;
  activeCardId?: string;
}

const CardDate = ({ card }: CardProps) => {
  const dispatch = useAppDispatch();

  const convertDate = (timestamp: number) => {
    const date = new Date(timestamp);
    return `${date.getDate()} ${date.toLocaleString('default', { month: 'short' })}`;
  };

  const callApiUpdateCard = async (updateData: any) => {
    const updatedCard = await updateCardDetailsAPI(card?._id, updateData);
    dispatch(updateCurrentActiveCard(updatedCard));
    dispatch(updateCardInBoard(updatedCard));
    return updatedCard;
  };

  const isCardDue = new Date().getTime() > card.dueDate;
  const isNearDue = new Date(card.dueDate).getTime() - new Date().getTime() <= 24 * 60 * 60 * 1000 && !isCardDue;
  
  return (
    <Box
      onClick={(e) => {
        e.stopPropagation();
        callApiUpdateCard({ isDone: !card.isDone });
      }}
      sx={{
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'center',
        '&:hover .checkbox': {
          display: 'block',
        },
        '&:hover .watch': {
          display: 'none',
        },
        marginLeft: 1,
        width: 'fit-content',
        paddingY: 0.5,
        paddingX: 1,
        color: card.isDone || isCardDue ? 'white' : 'black',
        borderRadius: 1,
        backgroundColor: (theme) => {
          if (card.isDone) {
            return color.success[80];
          }
          if (isNearDue) {
            return color.warning[80];
          }
          return isCardDue ? color.danger[80] : 'white';
        },
      }}
    >
      <Box className="watch" sx={{ display: 'block' }}>
        <WatchIcon />
      </Box>
      <Box className="checkbox" sx={{ display: 'none' }}>
        {card.isDone ? <CheckBox /> : <CheckBoxOutlineBlankOutlined />}
      </Box>
      <Typography>{`${convertDate(card.startDate)} - ${convertDate(card.dueDate)}`}</Typography>
    </Box>
  );
};


function Card({ card, activeCardId }: CardProps) {
  const dispatch = useAppDispatch()
  const membersBoard = useSelector(selectBoardMembersId(card.boardId))
  const comments = useSelector(selectCommentsByCardId(card._id))

  const [searchParams, setSearchParams] = useSearchParams();

  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: card._id,
    data: { ...card }
  })
  const dndKitCardStyles = {
    // touchAction: 'none', // Dành cho sensor default dạng PointerSensor
    // Nếu sử dụng CSS.Transform như docs sẽ lỗi kiểu stretch
    // https://github.com/clauderic/dnd-kit/issues/117
    transform: CSS.Translate.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : undefined,
    border: isDragging ? '1px solid #2ecc71' : undefined
  }

  const setActiveCard = () => {
    // Cập nhật data cho cái activeCard trong Redux
    dispatch(updateCurrentActiveCard(card as any))
    // Hiện Modal ActiveCard lên
    dispatch(showModalActiveCard())

    setSearchParams({ cardId: card._id })
  }

  useEffect(() => {
    dispatch(loadCommentsThunk(card._id))

    if (activeCardId === card._id) {
      setActiveCard()
    }
  }, [])

  return (
    <MuiCard
      onClick={setActiveCard}
      ref={setNodeRef} style={dndKitCardStyles} {...attributes} {...listeners}
      sx={{
        cursor: 'pointer',
        boxShadow: '0 1px 1px rgba(0, 0, 0, 0.2)',
        overflow: 'unset',
        display: card?.FE_PlaceholderCard ? 'none' : 'block',
        border: '1px solid transparent',
        '&:hover': { borderColor: (theme) => theme.palette.primary.main }
        // overflow: card?.FE_PlaceholderCard ? 'hidden' : 'unset',
        // height: card?.FE_PlaceholderCard ? '0px' : 'unset'
      }}
    >
      {card?.cover && <CardMedia sx={{ height: 140, borderRadius: 1 }} image={card?.cover} /> }
      <CardContent sx={{ p: 1.5, '&:last-child': { p: 1.5 } }}>
        <Typography>{card?.title}</Typography>
      </CardContent>
      {
        !!card?.dueDate && <CardDate card={card} />
      }
      {!!comments?.length &&
        <Button size="medium" startIcon={<CommentIcon />}>{comments?.length}</Button>
      }
      {!!card?.attachments?.length &&
        <Button size="medium" startIcon={<AttachmentIcon />}>{card?.attachments?.length}</Button>
      }
      <Box sx={{ display: 'flex', flexDirection:'row-reverse', alignItems: 'center', paddingBottom: 1, paddingRight: 1 }}>
        {!!card?.memberIds?.length &&
          // <Button size="small" startIcon={<GroupIcon />}>{card?.memberIds?.length}</Button>
          <BoardUserGroup boardUsers={(membersBoard || []).filter(user => card.memberIds.includes(user._id))} limit={3} size={24} />
        }
      </Box>
    </MuiCard>
  )
}

export default React.memo(Card)
