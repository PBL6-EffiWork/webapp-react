import moment from 'moment'
import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import Avatar from '@mui/material/Avatar'
import TextField from '@mui/material/TextField'
import Tooltip from '@mui/material/Tooltip'

import { useSelector } from 'react-redux'
import { selectCurrentUser } from '../../../redux/user/userSlice'
import { Comment } from '../../../interfaces/comment'
import React from 'react'

interface CardActivitySectionProps {
  cardId?: string;
  cardComments: any[];
  onAddCardComment: (comment: Comment) => Promise<void>;
}

function CardActivitySection({ cardId ,cardComments = [], onAddCardComment }: CardActivitySectionProps) {
  const currentUser = useSelector(selectCurrentUser)

  const handleAddCardComment = React.useCallback(
    (event: React.KeyboardEvent<HTMLDivElement>) => {
    // Bắt hành động người dùng nhấn phím Enter && không phải hành động Shift + Enter
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault() // Thêm dòng này để khi Enter không bị nhảy dòng
      const target = event.target as HTMLInputElement;
      if (!target.value) return // Nếu không có giá trị gì thì return không làm gì cả

      // Tạo một biến commend data để gửi api
      const commentToAdd = {
        userId: currentUser._id,
        cardId: cardId as string,
        content: (event.target as HTMLInputElement).value.trim()
      }
      // Gọi lên Props ở component cha
      onAddCardComment(commentToAdd).then(() => {
        (event.target as HTMLInputElement).value = ''
      })
    }
  }, [cardId, currentUser, onAddCardComment])

  return (
    <Box sx={{ mt: 2 }}>
      {/* Xử lý thêm comment vào Card */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
        <Avatar
          sx={{ width: 36, height: 36, cursor: 'pointer' }}
          alt="Effiwork"
          src={currentUser?.avatar}
        />
        <TextField
          fullWidth
          placeholder="Write a comment..."
          type="text"
          variant="outlined"
          multiline
          onKeyDown={handleAddCardComment}
        />
      </Box>

      <Box className="max-h-[300px] overflow-auto">
        {/* Hiển thị danh sách các comments */}
        {!cardComments || cardComments.length === 0 &&
          <Typography sx={{ pl: '45px', fontSize: '14px', fontWeight: '500', color: '#b1b1b1' }}>No comments!</Typography>
        }
        {cardComments.map((comment, index) =>
          <Box sx={{ display: 'flex', gap: 1, width: '100%', mb: 1.5 }} key={index}>
            <Tooltip title="Effiwork">
              <Avatar
                sx={{ width: 36, height: 36, cursor: 'pointer' }}
                alt="Effiwork"
                src={comment.avatar}
              />
            </Tooltip>
            <Box sx={{ width: 'inherit' }}>
              <Typography component="span" sx={{ fontWeight: 'bold', mr: 1 }}>
                {comment.userDisplayName}
              </Typography>

              <Typography component="span" sx={{ fontSize: '12px' }}>
                {moment(comment.createdAt).format('llll')}
              </Typography>

              <Box sx={{
                display: 'block',
                bgcolor: (theme) => theme.palette.mode === 'dark' ? '#33485D' : 'white',
                p: '8px 12px',
                mt: '4px',
                border: '0.5px solid rgba(0, 0, 0, 0.2)',
                borderRadius: '4px',
                wordBreak: 'break-word',
                boxShadow: '0 0 1px rgba(0, 0, 0, 0.2)'
              }}>
                {comment.content}
              </Box>
            </Box>
          </Box>
        )}
      </Box>
    </Box>
  )
}

export default CardActivitySection
