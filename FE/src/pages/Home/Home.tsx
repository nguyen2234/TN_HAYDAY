import React, { useMemo } from 'react'
import {
  Box,
  Button,
  Container,
  Link,
  Paper,
  Skeleton,
  Stack,
  Typography,
} from '@mui/material'
import Grid from '@mui/material/Grid'
import { Helmet } from 'react-helmet-async'
import { useQuery } from '@tanstack/react-query'
import { Link as RouterLink, useLocation, useNavigate } from 'react-router-dom'
import { ComicCard } from '~components/ComicCard'
import { ComicCarousel } from '~components/ComicCarousel'
import { getComicCategories, getHomeComics } from '~services/comic'
import { ComicHotRow } from './ComicHotRow'

const ROUTE_CATEGORIES = '/the-loai'
const ROUTE_COMIC_BASE = '/truyen-tranh'
const SKELETON_CARD_COUNT = 12
const HOT_ROW_COUNT = 8
const CAROUSEL_COMIC_LIMIT = 18

const slugForName = (categories: { name: string; slug: string }[], name: string) =>
  categories.find(c => c.name.toLowerCase() === name.toLowerCase())?.slug

export const Home: React.FC = () => {
  const navigate = useNavigate()
  const location = useLocation()

  const {
    data: comics = [],
    isLoading,
    isError,
    isFetching,
    refetch,
  } = useQuery({
    queryKey: ['home-comics'],
    queryFn: getHomeComics,
  })

  const { data: categories = [] } = useQuery({
    queryKey: ['comic-categories'],
    queryFn: getComicCategories,
  })

  const pills = useMemo(() => {
    const manga = slugForName(categories, 'Manga')
    const manhwa = slugForName(categories, 'Manhwa')
    const manhua = slugForName(categories, 'Manhua')
    return [
      { key: 'top', label: 'Top tháng', to: ROUTE_CATEGORIES },
      { key: 'manga', label: 'Manga', to: manga ? `${ROUTE_CATEGORIES}/${manga}` : ROUTE_CATEGORIES },
      { key: 'manhwa', label: 'Manhwa', to: manhwa ? `${ROUTE_CATEGORIES}/${manhwa}` : ROUTE_CATEGORIES },
      { key: 'manhua', label: 'Manhua', to: manhua ? `${ROUTE_CATEGORIES}/${manhua}` : ROUTE_CATEGORIES },
    ]
  }, [categories])

  const carouselComics = useMemo(() => comics.slice(0, CAROUSEL_COMIC_LIMIT), [comics])

  const showHotBlock = !isLoading && !isError && comics.length > HOT_ROW_COUNT
  const hotComics = showHotBlock ? comics.slice(0, HOT_ROW_COUNT) : []
  const gridComics = showHotBlock ? comics.slice(HOT_ROW_COUNT) : comics

  const showEmpty = !isLoading && !isError && comics.length === 0

  const isHomePath = location.pathname === '/'

  return (
    <>
      <Helmet>
        <title>TN_HAYDAY - Trang Chủ</title>
        <meta
          name="description"
          content="Đọc truyện tranh online — cập nhật nhanh, thể loại đa dạng."
        />
      </Helmet>

      <Box component="div" sx={{ pb: 4 }}>
        <Container maxWidth="lg" sx={{ pt: 2 }}>
          <Stack
            direction="row"
            sx={{
              flexWrap: 'wrap',
              alignItems: 'center',
              gap: 1.5,
              pb: 2.5,
              mb: 2.5,
              borderBottom: 1,
              borderColor: 'divider',
            }}
          >
            <Typography
              variant="overline"
              sx={{ fontWeight: 800, letterSpacing: '0.14em', color: 'text.secondary', m: 0 }}
            >
              Gợi ý
            </Typography>
            <Stack direction="row" sx={{ flexWrap: 'wrap', gap: 1 }}>
              {pills.map(p => {
                const active = p.key === 'top' && isHomePath
                return (
                  <Button
                    key={p.key}
                    component={RouterLink}
                    to={p.to}
                    variant={active ? 'contained' : 'outlined'}
                    color="primary"
                    size="small"
                    sx={{ borderRadius: 999, fontWeight: 700, textTransform: 'none' }}
                  >
                    {p.label}
                  </Button>
                )
              })}
            </Stack>
          </Stack>

          {(isLoading || carouselComics.length > 0) && (
            <ComicCarousel
              comics={carouselComics}
              isLoading={isLoading}
              onComicClick={slug => navigate(`${ROUTE_COMIC_BASE}/${slug}`)}
              title="Truyện đề cử"
            />
          )}

          {showHotBlock && (
            <Paper
              component="section"
              variant="outlined"
              aria-labelledby="home-hot-heading"
              sx={{
                p: 2,
                mb: 3,
                borderRadius: 2,
                bgcolor: 'background.paper',
                boxShadow: theme =>
                  theme.palette.mode === 'dark' ? '0 8px 28px rgba(0,0,0,0.35)' : '0 4px 18px rgba(0,0,0,0.06)',
              }}
            >
              <Typography
                id="home-hot-heading"
                variant="h2"
                component="h2"
                sx={{ fontSize: { xs: '1.15rem', sm: '1.35rem' }, mb: 2, fontWeight: 800 }}
              >
                <Box
                  component="span"
                  sx={theme => ({
                    display: 'inline-block',
                    width: 5,
                    height: 22,
                    borderRadius: 0.75,
                    mr: 1.25,
                    verticalAlign: 'middle',
                    background: `linear-gradient(180deg, ${theme.palette.primary.light} 0%, ${theme.palette.primary.dark} 100%)`,
                  })}
                />
                Truyện hay
              </Typography>
              <Box
                sx={{
                  display: 'grid',
                  gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' },
                  gap: 0.5,
                }}
              >
                {hotComics.map((comic, index) => (
                  <ComicHotRow key={comic.id} comic={comic} rank={index + 1} />
                ))}
              </Box>
            </Paper>
          )}

          <Paper
            component="section"
            variant="outlined"
            aria-labelledby="home-new-heading"
            sx={{
              p: 2,
              borderRadius: 2,
              bgcolor: 'background.paper',
              boxShadow: theme =>
                theme.palette.mode === 'dark' ? '0 8px 28px rgba(0,0,0,0.35)' : '0 4px 18px rgba(0,0,0,0.06)',
            }}
          >
            <Stack
              direction="row"
              sx={{
                mb: 2,
                flexWrap: 'wrap',
                alignItems: 'flex-end',
                justifyContent: 'space-between',
                gap: 2,
              }}
            >
              <Typography
                id="home-new-heading"
                variant="h2"
                component="h2"
                sx={{ fontSize: { xs: '1.15rem', sm: '1.35rem' }, fontWeight: 800, m: 0 }}
              >
                <Box
                  component="span"
                  sx={theme => ({
                    display: 'inline-block',
                    width: 5,
                    height: 22,
                    borderRadius: 0.75,
                    mr: 1.25,
                    verticalAlign: 'middle',
                    background: `linear-gradient(180deg, ${theme.palette.primary.light} 0%, ${theme.palette.primary.dark} 100%)`,
                  })}
                />
                Danh sách truyện tranh mới
              </Typography>
              {!isLoading && !isError && (
                <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 600 }}>
                  {comics.length} bộ
                  {isFetching ? ' · Đang làm mới…' : ''}
                </Typography>
              )}
              {isLoading && (
                <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 600 }}>
                  Đang tải…
                </Typography>
              )}
            </Stack>

            {isError && (
              <Box
                role="alert"
                sx={{
                  textAlign: 'center',
                  py: 4,
                  px: 2,
                  maxWidth: 400,
                  mx: 'auto',
                  borderRadius: 2,
                  border: 1,
                  borderColor: 'divider',
                  bgcolor: 'action.hover',
                }}
              >
                <Box
                  sx={{
                    width: 48,
                    height: 48,
                    mx: 'auto',
                    mb: 1.5,
                    borderRadius: 1.5,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    bgcolor: 'error.main',
                    color: 'error.contrastText',
                    fontWeight: 800,
                    fontSize: '1.35rem',
                  }}
                  aria-hidden
                >
                  !
                </Box>
                <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 800 }}>
                  Không tải được danh sách
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                  Vui lòng kiểm tra kết nối và thử lại.
                </Typography>
                <Button variant="outlined" color="warning" onClick={() => refetch()} sx={{ borderRadius: 999 }}>
                  Thử lại
                </Button>
              </Box>
            )}

            {isLoading && (
              <Grid container spacing={1.5}>
                {Array.from({ length: SKELETON_CARD_COUNT }).map((_, i) => (
                  <Grid key={i} size={{ xs: 6, sm: 4, md: 3, lg: 2 }}>
                    <Paper variant="outlined" sx={{ overflow: 'hidden', borderRadius: 1.25 }}>
                      <Skeleton variant="rectangular" animation="wave" sx={{ width: '100%', aspectRatio: '2/3' }} />
                      <Box sx={{ p: 1.25 }}>
                        <Skeleton width="90%" height={14} animation="wave" />
                        <Skeleton width="68%" height={12} animation="wave" sx={{ mt: 1 }} />
                      </Box>
                    </Paper>
                  </Grid>
                ))}
              </Grid>
            )}

            {showEmpty && (
              <Box
                sx={{
                  textAlign: 'center',
                  py: 5,
                  px: 2,
                  borderRadius: 2,
                  border: '1px dashed',
                  borderColor: 'divider',
                }}
              >
                <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 800 }}>
                  Chưa có truyện để hiển thị
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Thử lại sau hoặc{' '}
                  <Link
                    component={RouterLink}
                    to={ROUTE_CATEGORIES}
                    underline="hover"
                    color="primary"
                    sx={{ fontWeight: 700 }}
                  >
                    duyệt thể loại
                  </Link>
                  .
                </Typography>
              </Box>
            )}

            {!isLoading && !isError && gridComics.length > 0 && (
              <Grid container spacing={1.5}>
                {gridComics.map(comic => (
                  <Grid key={comic.id} size={{ xs: 6, sm: 4, md: 3, lg: 2 }}>
                    <ComicCard comic={comic} onClick={slug => navigate(`${ROUTE_COMIC_BASE}/${slug}`)} />
                  </Grid>
                ))}
              </Grid>
            )}
          </Paper>
        </Container>
      </Box>
    </>
  )
}
