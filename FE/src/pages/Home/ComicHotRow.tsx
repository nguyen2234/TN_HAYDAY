import React from 'react'
import { Box, Chip, Typography } from '@mui/material'
import { Link } from 'react-router-dom'
import type { Comic } from '~types/comic'

const ROUTE_COMIC_BASE = '/truyen-tranh'
const HOT_BADGE_MAX_RANK = 3

interface ComicHotRowProps {
  comic: Comic
  rank: number
}

export const ComicHotRow: React.FC<ComicHotRowProps> = ({ comic, rank }) => {
  const showHot = rank <= HOT_BADGE_MAX_RANK

  return (
    <Box
      component={Link}
      to={`${ROUTE_COMIC_BASE}/${comic.slug}`}
      sx={{
        display: 'flex',
        alignItems: 'stretch',
        gap: 1.5,
        py: 1.25,
        px: 1.5,
        borderRadius: 1.25,
        textDecoration: 'none',
        color: 'inherit',
        border: '1px solid transparent',
        transition: theme =>
          theme.transitions.create(['background-color', 'border-color', 'transform'], { duration: 200 }),
        '&:hover': {
          bgcolor: 'action.hover',
          borderColor: 'divider',
          '& .ComicHotRow-thumb': { transform: 'scale(1.04)' },
          '& .ComicHotRow-title': { color: 'primary.main' },
        },
      }}
    >
      <Box
        className="ComicHotRow-thumbWrap"
        sx={{
          flexShrink: 0,
          width: 56,
          borderRadius: 1,
          overflow: 'hidden',
          alignSelf: 'center',
          boxShadow: '0 4px 12px rgba(0,0,0,0.35)',
          border: 1,
          borderColor: 'divider',
        }}
      >
        <Box
          component="img"
          className="ComicHotRow-thumb"
          src={comic.coverUrl}
          alt={comic.title}
          width={56}
          height={78}
          loading="lazy"
          sx={{
            display: 'block',
            width: 56,
            height: 78,
            objectFit: 'cover',
            transition: theme => theme.transitions.create('transform', { duration: 250 }),
          }}
        />
      </Box>
      <Box sx={{ minWidth: 0, flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: 0.5 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
          <Typography variant="caption" sx={{ fontWeight: 700, color: 'text.secondary' }}>
            {comic.updatedAt}
          </Typography>
          {showHot ? (
            <Chip
              label="Hot"
              size="small"
              sx={{
                height: 20,
                fontSize: '0.65rem',
                fontWeight: 800,
                letterSpacing: '0.04em',
                color: 'primary.contrastText',
                background: theme =>
                  `linear-gradient(135deg, ${theme.palette.primary.light} 0%, ${theme.palette.primary.main} 100%)`,
              }}
            />
          ) : null}
        </Box>
        <Typography
          className="ComicHotRow-title"
          variant="body2"
          sx={{
            fontWeight: 700,
            lineHeight: 1.35,
            m: 0,
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
            transition: theme => theme.transitions.create('color', { duration: 200 }),
          }}
        >
          {comic.title}
        </Typography>
        <Typography variant="caption" sx={{ fontWeight: 600, color: 'primary.main', m: 0 }}>
          {comic.latestChapter}
        </Typography>
      </Box>
    </Box>
  )
}
