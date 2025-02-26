import Box from '@mui/material/Box'
import Card from '../Card/Card'
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable'
import React from 'react';

interface Card {
  _id: string;
  memberIds?: string[];
  comments?: string[];
  attachments?: string[];
  cover?: string;
  title?: string;
  FE_PlaceholderCard?: boolean;
}

interface ListCardsProps {
  cards: Card[];
  activeCardId?: string;
}

function ListCards({ cards, activeCardId }: ListCardsProps) {
  return (
    <SortableContext items={cards?.map(c => c._id)} strategy={verticalListSortingStrategy}>
      <Box sx={{
        p: '0 5px 5px 5px',
        m: '0 5px',
        display: 'flex',
        flexDirection: 'column',
        gap: 1,
        overflowX: 'hidden',
        overflowY: 'auto',
        maxHeight: (theme) => `calc(
          ${theme.Effiwork.boardContentHeight} -
          ${theme.spacing(5)} -
          ${theme.Effiwork.columnHeaderHeight} -
          ${theme.Effiwork.columnFooterHeight}
        )`,
        '&::-webkit-scrollbar-thumb': { backgroundColor: '#ced0da' },
        '&::-webkit-scrollbar-thumb:hover': { backgroundColor: '#bfc2cf' }
      }}>
        {cards?.map(card => <Card key={card._id} card={card} activeCardId={activeCardId} />)}
      </Box>
    </SortableContext>
  )
}

export default React.memo(ListCards)
