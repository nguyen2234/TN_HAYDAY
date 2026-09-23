import React, { useCallback, useEffect, useRef, useState } from 'react'
import ChevronLeft from '@mui/icons-material/ChevronLeft'
import ChevronRight from '@mui/icons-material/ChevronRight'
import {
  Box,
  Card,
  CardActionArea,
  CardContent,
  CardMedia,
  IconButton,
  Skeleton,
  Typography,
  useMediaQuery,
  useTheme,
} from '@mui/material'
import type { Comic } from '~types/comic'

const SCROLL_RATIO = 0.92
const SKELETON_COUNT = 8

export interface ComicCarouselProps {
  comics: Comic[]
  isLoading?: boolean
  onComicClick: (slug: string) => void
  title?: string
}

export const ComicCarousel: React.FC<ComicCarouselProps> = ({
  comics,
  isLoading = false,
  onComicClick,
  title = 'Truyện nổi bật',
}) => {
  const theme = useTheme()
  const reduceMotion = useMediaQuery('(prefers-reduced-motion: reduce)')
  const scrollerRef = useRef<HTMLDivElement>(null)
  const [canPrev, setCanPrev] = useState(false)
  const [canNext, setCanNext] = useState(false)

  const updateArrows = useCallback(() => {
    const el = scrollerRef.current
    if (!el) return
    const { scrollLeft, scrollWidth, clientWidth } = el
    const maxScroll = scrollWidth - clientWidth
    setCanPrev(scrollLeft > 4)
    setCanNext(scrollLeft < maxScroll - 4)
  }, [])

  useEffect(() => {
    const el = scrollerRef.current
    if (!el) return
    updateArrows()
    el.addEventListener('scroll', updateArrows, { passive: true })
    const ro = new ResizeObserver(() => updateArrows())
    ro.observe(el)
    return () => {
      el.removeEventListener('scroll', updateArrows)
      ro.disconnect()
    }
  }, [comics.length, isLoading, updateArrows])

  const scrollByDir = (direction: -1 | 1) => {
    const el = scrollerRef.current
    if (!el) return
    const delta = el.clientWidth * SCROLL_RATIO * direction
    el.scrollBy({ left: delta, behavior: reduceMotion ? 'auto' : 'smooth' })
  }

  const navBtnSx = {
    position: 'absolute',
    top: '50%',
    transform: 'translateY(-50%)',
    zIndex: 2,
    bgcolor: 'rgba(0,0,0,0.45)',
    color: 'common.white',
    border: '1px solid',
    borderColor: 'rgba(255,255,255,0.2)',
    '&:hover': { bgcolor: 'rgba(0,0,0,0.65)' },
    '&.Mui-disabled': { opacity: 0.25, bgcolor: 'rgba(0,0,0,0.25)' },
  } as const

  return (
    <Box
      component="section"
      aria-label={title}
      sx={{
        mb: 3,
        p: 2,
        borderRadius: 2,
        border: 1,
        borderColor: 'divider',
        bgcolor: 'background.paper',
        boxShadow: theme.palette.mode === 'dark' ? '0 8px 28px rgba(0,0,0,0.35)' : '0 4px 18px rgba(0,0,0,0.06)',
      }}
    >
      <Typography variant="h2" component="h2" sx={{ fontSize: { xs: '1.15rem', sm: '1.35rem' }, mb: 2 }}>
        <Box
          component="span"
          sx={{
            display: 'inline-block',
            width: 5,
            height: 22,
            borderRadius: 0.75,
            mr: 1.25,
            verticalAlign: 'middle',
            background: `linear-gradient(180deg, ${theme.palette.primary.light} 0%, ${theme.palette.primary.dark} 100%)`,
          }}
        />
        {title}
      </Typography>

      <Box sx={{ position: 'relative' }}>
        <IconButton
          size="medium"
          aria-label="Cuộn trái"
          onClick={() => scrollByDir(-1)}
          disabled={!canPrev || isLoading}
          sx={{ ...navBtnSx, left: { xs: 4, sm: 8 } }}
        >
          <ChevronLeft fontSize="large" />
        </IconButton>
        <IconButton
          size="medium"
          aria-label="Cuộn phải"
          onClick={() => scrollByDir(1)}
          disabled={!canNext || isLoading}
          sx={{ ...navBtnSx, right: { xs: 4, sm: 8 } }}
        >
          <ChevronRight fontSize="large" />
        </IconButton>

        <Box
          ref={scrollerRef}
          role="list"
          sx={{
            display: 'flex',
            gap: 1.5,
            overflowX: 'auto',
            scrollSnapType: 'x mandatory',
            scrollBehavior: reduceMotion ? 'auto' : 'smooth',
            py: 0.5,
            px: { xs: 5, sm: 6 },
            mx: { xs: -1, sm: 0 },
            scrollbarWidth: 'thin',
            '&::-webkit-scrollbar': { height: 8 },
            '&::-webkit-scrollbar-thumb': {
              borderRadius: 999,
              bgcolor: 'divider',
            },
          }}
        >
          {isLoading &&
            Array.from({ length: SKELETON_COUNT }).map((_, i) => (
              <Card
                key={i}
                variant="outlined"
                sx={{
                  flex: '0 0 auto',
                  width: { xs: 132, sm: 152, md: 172 },
                  scrollSnapAlign: 'start',
                }}
              >
                <Skeleton variant="rectangular" height={200} animation="wave" />
                <CardContent sx={{ py: 1.5 }}>
                  <Skeleton width="90%" height={18} animation="wave" />
                  <Skeleton width="55%" height={14} sx={{ mt: 0.75 }} animation="wave" />
                </CardContent>
              </Card>
            ))}

          {!isLoading &&
            comics.map(comic => (
              <Card
                key={comic.id}
                role="listitem"
                variant="outlined"
                sx={{
                  flex: '0 0 auto',
                  width: { xs: 132, sm: 152, md: 172 },
                  scrollSnapAlign: 'start',
                  borderColor: 'divider',
                  transition: 'transform 0.2s ease, box-shadow 0.2s ease',
                  '&:hover': {
                    transform: 'translateY(-4px)',
                    boxShadow: 6,
                  },
                }}
              >
                <CardActionArea onClick={() => onComicClick(comic.slug)}>
                  <CardMedia
                    component="img"
                    image={comic.coverUrl}
                    alt={comic.title}
                    loading="lazy"
                    sx={{ height: { xs: 186, sm: 200 }, objectFit: 'cover' }}
                  />
                  <CardContent sx={{ py: 1.25, px: 1.5 }}>
                    <Typography variant="subtitle2" component="h3" noWrap title={comic.title}>
                      {comic.title}
                    </Typography>
                    <Typography variant="caption" color="primary" noWrap sx={{ mt: 0.25, display: 'block' }}>
                      {comic.latestChapter}
                    </Typography>
                    <Typography variant="caption" color="text.secondary" noWrap sx={{ display: 'block' }}>
                      {comic.updatedAt}
                    </Typography>
                  </CardContent>
                </CardActionArea>
              </Card>
            ))}
        </Box>
      </Box>
    </Box>
  )
}
