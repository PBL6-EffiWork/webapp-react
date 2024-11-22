import { useState } from 'react'
import Box from '@mui/material/Box'
import Avatar from '@mui/material/Avatar'
import Tooltip from '@mui/material/Tooltip'
import Popover from '@mui/material/Popover'
import Members from '../Members'

interface BoardUserGroupProps {
  boardUsers?: any[];
  limit?: number;
  size?: number;
  isOnBoardBar?: boolean;
  boardId?: string;
}


function BoardUserGroup({ boardUsers = [], limit = 6, size = 34, boardId }: BoardUserGroupProps) {
  /**
   * Xử lý Popover để ẩn hoặc hiện toàn bộ user trên một cái popup, tương tự docs để tham khảo ở đây:
   * https://mui.com/material-ui/react-popover/
   */
  const [isOpenMembers, setIsOpenMembers] = useState(false)
  const handleToggleMembers = (isOpen?: boolean) => {
    console.log('isOpen', isOpen)
    setIsOpenMembers(!isOpenMembers)
  }

  // Lưu ý ở đây chúng ta không dùng Component AvatarGroup của MUI bởi nó không hỗ trợ tốt trong việc chúng ta cần custom & trigger xử lý phần tử tính toán cuối, đơn giản là cứ dùng Box và CSS - Style đám Avatar cho chuẩn kết hợp tính toán một chút thôi.
  return (
    <Members
      members={boardUsers}
      button={
        <Box sx={{ display: 'flex', gap: '4px' }} onClick={() => handleToggleMembers()}>
          {/* Hiển thị giới hạn số lượng user theo số limit */}
          {boardUsers.map((user, index) => {
          if (index < limit) {
            return (
              <Tooltip title={user?.displayName} key={index}>
                <Avatar
                  sx={{ width: size, height: size, cursor: 'pointer' }}
                  alt="Effiwork"
                  src={user?.avatar}
                />
              </Tooltip>
            )
          }
        })}

        {/* Nếu số lượng users nhiều hơn limit thì hiện thêm +number */}
        {boardUsers.length > limit &&
          <Tooltip title="Show more">
            <Box
              sx={{
                width: 36,
                height: 36,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '14px',
                fontWeight: '500',
                borderRadius: '50%',
                color: 'white',
                backgroundColor: '#a4b0be'
              }}
            >
              +{boardUsers.length - limit}
            </Box>
          </Tooltip>
        }


        

        {/* Khi Click vào +number ở trên thì sẽ mở popover hiện toàn bộ users, sẽ không limit nữa */}
        {/* <Popover
          id={popoverId}
          open={isOpenPopover}
          anchorEl={anchorPopoverElement}
          onClose={handleTogglePopover}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
        >
          <Box sx={{ p: 2, maxWidth: '235px', display: 'flex', flexWrap: 'wrap', gap: 1 }}>
            {boardUsers.map((user, index) =>
              <Tooltip title={user?.displayName} key={index}>
                <Avatar
                  sx={{ width: size, height: size, cursor: 'pointer' }}
                  alt="Effiwork"
                  src={user?.avatar}
                />
              </Tooltip>
            )}
          </Box>
        </Popover> */}
      </Box>
    }/>
    
  )
}

export default BoardUserGroup
