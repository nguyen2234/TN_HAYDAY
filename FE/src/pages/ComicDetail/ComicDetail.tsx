import React, { useEffect, useMemo, useState } from 'react'
import AutoStoriesOutlined from '@mui/icons-material/AutoStoriesOutlined'
import CalendarMonthOutlined from '@mui/icons-material/CalendarMonthOutlined'
import ChatBubbleOutlineOutlined from '@mui/icons-material/ChatBubbleOutlineOutlined'
import FavoriteBorderOutlined from '@mui/icons-material/FavoriteBorderOutlined'
import GroupsOutlined from '@mui/icons-material/GroupsOutlined'
import InfoOutlined from '@mui/icons-material/InfoOutlined'
import MenuBookOutlined from '@mui/icons-material/MenuBookOutlined'
import PersonOutlineOutlined from '@mui/icons-material/PersonOutlineOutlined'
import SupervisorAccountOutlined from '@mui/icons-material/SupervisorAccountOutlined'
import ThumbUpAltOutlined from '@mui/icons-material/ThumbUpAltOutlined'
import ThumbUpOutlined from '@mui/icons-material/ThumbUpOutlined'
import ViewListOutlined from '@mui/icons-material/ViewListOutlined'
import VisibilityOutlined from '@mui/icons-material/VisibilityOutlined'
import {
  Avatar,
  Backdrop,
  Box,
  Breadcrumbs,
  Button,
  Chip,
  CircularProgress,
  Container,
  Link,
  Paper,
  Stack,
  TextField,
  Typography,
} from '@mui/material'
import { Helmet } from 'react-helmet-async'
import { useQuery } from '@tanstack/react-query'
import { Link as RouterLink, Navigate, useParams } from 'react-router-dom'
import { getComicDetail } from '~services/comic'

const ROUTE_HOME = '/'
const ROUTE_CATEGORIES = '/the-loai'

const readerDocPath = (slug: string, chapterName: string) => `/truyen-tranh/${slug}-chap-${chapterName}`

/** Số liệu mẫu ổn định theo slug (API chi tiết chưa có lượt thích / theo dõi / xem). */
function mockEngagementFromSlug(slug: string) {
  let h = 0
  for (let i = 0; i < slug.length; i++) h = Math.imul(31, h) + slug.charCodeAt(i) | 0
  const u = Math.abs(h)
  return {
    likes: 5_000 + (u % 50_000),
    follows: 10_000 + ((u >> 5) % 200_000),
    views: 1_000_000 + ((u >> 10) % 50_000_000),
  }
}

const handlePlaceholderAction = (e: React.MouseEvent) => {
  e.preventDefault()
}

const introParagraphsFromText = (text: string): string[] => {
  const t = text.trim()
  if (!t) return ['Chưa có mô tả.']
  const parts = t.split(/\n\n+/).map(p => p.trim()).filter(Boolean)
  return parts.length ? parts : [t]
}

/** Bình luận mẫu (chỉ hiển thị — chưa nối API). */
const MOCK_COMMENT_COUNT = 128

type MockComment = {
  id: string
  userName: string
  initials: string
  rank: string
  rankTone: 'pink' | 'violet'
  nameTone: 'blue' | 'gold'
  body: string | null
  stickerEmoji?: string
  likes: number
  timeLabel: string
  replyCount?: number
}

const MOCK_COMMENTS: MockComment[] = [
  {
    id: '1',
    userName: 'Nh… Hoa Cô Nương',
    initials: 'NH',
    rank: 'Hóa Thần',
    rankTone: 'pink',
    nameTone: 'blue',
    body: null,
    stickerEmoji: '🐱',
    likes: 0,
    timeLabel: '1 ngày trước',
    replyCount: 2,
  },
  {
    id: '2',
    userName: 'Vãi skibidi',
    initials: 'VS',
    rank: 'Vũ Trụ',
    rankTone: 'violet',
    nameTone: 'gold',
    body: 'Truyện ra lâu kiểu này thì chẳng bt khi nào end',
    likes: 3,
    timeLabel: '4 ngày trước',
  },
  {
    id: '3',
    userName: 'Bo Bo',
    initials: 'BB',
    rank: 'Hóa Thần',
    rankTone: 'pink',
    nameTone: 'blue',
    body: 'Với tốc độ ra chap đều ntn, khả năng end truyện mất hơn 3 năm nữa =((',
    likes: 12,
    timeLabel: '6 ngày trước',
  },
  {
    id: '4',
    userName: 'sins',
    initials: 'S',
    rank: 'Hóa Thần',
    rankTone: 'pink',
    nameTone: 'gold',
    body: 'Nvp trong đây toàn bọn thiếu năng buff iq cho main hay ho gì ko bt',
    likes: 1,
    timeLabel: '7 ngày trước',
  },
]

const userNameSx = (tone: MockComment['nameTone']) =>
  tone === 'gold'
    ? { color: '#e8c547' }
    : { color: '#5b9fd8' }

const rankSx = (tone: MockComment['rankTone']) =>
  tone === 'violet'
    ? {
        color: '#c4a8ff',
        bgcolor: 'rgba(138, 92, 246, 0.14)',
        border: '1px solid rgba(138, 92, 246, 0.35)',
      }
    : {
        color: '#f0a8d8',
        bgcolor: 'rgba(224, 64, 150, 0.12)',
        border: '1px solid rgba(224, 64, 150, 0.35)',
      }

export const ComicDetail: React.FC = () => {
  const { slug } = useParams<{ slug: string }>()

  const { data, isLoading, isError } = useQuery({
    queryKey: ['comic-detail', slug],
    queryFn: () => getComicDetail(slug ?? ''),
    enabled: Boolean(slug),
  })

  const introParagraphs = useMemo(() => (data ? introParagraphsFromText(data.description) : []), [data])
  const introFullText = useMemo(() => introParagraphs.join('\n\n'), [introParagraphs])
  const introNeedsToggle = introFullText.length > 280 || introParagraphs.length > 1
  const [introExpanded, setIntroExpanded] = useState(false)

  useEffect(() => {
    if (!data) return
    const raw = window.location.hash.replace(/^#/, '')
    if (!raw.startsWith('chapter-')) return
    const el = document.getElementById(raw)
    if (el) {
      requestAnimationFrame(() => {
        el.scrollIntoView({ behavior: 'smooth', block: 'center' })
      })
    }
  }, [data])

  if (!slug) return <Navigate to="/404" replace />

  if (isLoading) {
    return (
      <Backdrop open sx={{ color: '#fff', zIndex: theme => theme.zIndex.modal }}>
        <Stack sx={{ gap: 1.5, alignItems: 'center' }}>
          <CircularProgress color="inherit" />
          <Typography>Đang tải thông tin truyện...</Typography>
        </Stack>
      </Backdrop>
    )
  }

  if (isError || !data) {
    return (
      <Container maxWidth="lg" sx={{ py: 5 }}>
        <AlertBox>Không thể tải chi tiết truyện. Vui lòng thử lại sau.</AlertBox>
      </Container>
    )
  }

  const firstOrder = data.firstChapter?.orderIndex
  const latestOrder = data.lastChapter?.orderIndex

  const metaDescription = (data.description || data.title).slice(0, 160)
  const mockStats = mockEngagementFromSlug(data.slug)

  const sectionPaperSx = {
    mb: 3.5,
    p: { xs: 2, sm: 2.75 },
    bgcolor: 'background.paper',
    border: 1,
    borderColor: 'divider',
    borderRadius: 1.75,
  }

  return (
    <>
      <Helmet>
        <title>{`${data.title} - TN_HAYDAY`}</title>
        <meta name="description" content={metaDescription} />
      </Helmet>

      <Box sx={{ pb: 6 }}>
        <Container maxWidth="lg" sx={{ py: 2 }}>
          <Breadcrumbs
            aria-label="Breadcrumb"
            separator={<Typography component="span" color="text.disabled" sx={{ mx: 0.5 }}>/</Typography>}
            sx={{ mb: 2.5, flexWrap: 'wrap', '& a': { color: 'text.secondary', fontSize: '0.875rem' } }}
          >
            <Link component={RouterLink} to={ROUTE_HOME} underline="hover" color="inherit" variant="body2">
              Trang Chủ
            </Link>
            <Typography color="text.secondary" variant="body2" sx={{ fontWeight: 500 }}>
              {data.title}
            </Typography>
          </Breadcrumbs>

          <Paper
            elevation={0}
            sx={{
              mb: 3,
              display: 'flex',
              flexDirection: { xs: 'column', md: 'row' },
              alignItems: { xs: 'stretch', md: 'flex-start' },
              overflow: 'hidden',
              borderRadius: 3,
              border: 1,
              borderColor: 'divider',
              bgcolor: 'background.paper',
              boxShadow: theme =>
                theme.palette.mode === 'dark' ? '0 8px 40px rgba(0,0,0,0.45)' : '0 2px 16px rgba(0,0,0,0.06)',
            }}
          >
            <Box
              sx={{
                flexShrink: 0,
                width: { xs: '100%', md: 228 },
                maxWidth: { xs: 260, md: 228 },
                mx: { xs: 'auto', md: 0 },
                p: { xs: 2.5, md: 3 },
                pb: { xs: 0, md: 3 },
              }}
            >
              <Box
                component="img"
                src={data.coverUrl}
                alt={data.title}
                sx={{
                  display: 'block',
                  width: '100%',
                  aspectRatio: '3/4',
                  objectFit: 'cover',
                  borderRadius: 2,
                  boxShadow: theme => (theme.palette.mode === 'dark' ? '0 8px 28px rgba(0,0,0,0.55)' : '0 6px 20px rgba(0,0,0,0.12)'),
                }}
              />
            </Box>

            <Stack
              spacing={2}
              sx={{
                flex: 1,
                minWidth: 0,
                p: { xs: 2.5, sm: 3, md: 3.5 },
                pt: { xs: 0, md: 3.5 },
                pb: { xs: 3, md: 3.5 },
                textAlign: 'left',
                alignItems: 'flex-start',
              }}
            >
              <Typography
                variant="h4"
                component="h1"
                sx={{
                  fontWeight: 800,
                  lineHeight: 1.25,
                  m: 0,
                  fontSize: { xs: '1.35rem', sm: '1.5rem', md: '1.65rem' },
                  color: 'text.primary',
                }}
              >
                {data.title}
              </Typography>
              <Chip
                label={data.latestChapter}
                size="small"
                sx={{
                  alignSelf: 'flex-start',
                  fontWeight: 800,
                  letterSpacing: '0.04em',
                  height: 26,
                  color: 'primary.contrastText',
                  background: theme =>
                    `linear-gradient(135deg, ${theme.palette.primary.light}, ${theme.palette.primary.main})`,
                }}
              />

              <Stack spacing={1.25} sx={{ width: '100%', maxWidth: 560 }}>
                {(
                  [
                    { icon: <PersonOutlineOutlined sx={{ fontSize: 22 }} />, label: 'Tác giả', value: data.author },
                    { icon: <CalendarMonthOutlined sx={{ fontSize: 22 }} />, label: 'Ngày cập nhật', value: data.updatedAtCalendar },
                    { icon: <GroupsOutlined sx={{ fontSize: 22 }} />, label: 'Nhóm dịch', value: 'TN_HAYDAY · Cộng đồng (mẫu)' },
                    { icon: <ViewListOutlined sx={{ fontSize: 22 }} />, label: 'Tổng số chương', value: String(data.chapterCount) },
                    { icon: <AutoStoriesOutlined sx={{ fontSize: 22 }} />, label: 'Tình trạng', value: data.statusLabel },
                    { icon: <SupervisorAccountOutlined sx={{ fontSize: 22 }} />, label: 'Độ tuổi', value: '13+' },
                    { icon: <ThumbUpOutlined sx={{ fontSize: 22 }} />, label: 'Lượt thích', value: mockStats.likes.toLocaleString('vi-VN') },
                    { icon: <FavoriteBorderOutlined sx={{ fontSize: 22 }} />, label: 'Lượt theo dõi', value: mockStats.follows.toLocaleString('vi-VN') },
                    { icon: <VisibilityOutlined sx={{ fontSize: 22 }} />, label: 'Lượt xem', value: mockStats.views.toLocaleString('vi-VN') },
                  ] as const
                ).map(row => (
                  <Stack key={row.label} direction="row" sx={{ gap: 1.5, alignItems: 'flex-start' }}>
                    <Box sx={{ color: 'text.secondary', display: 'flex', flexShrink: 0, pt: 0.1 }} aria-hidden>
                      {row.icon}
                    </Box>
                    <Typography variant="body2" sx={{ m: 0, lineHeight: 1.55 }}>
                      <Box component="span" sx={{ fontWeight: 700, color: 'text.primary' }}>
                        {row.label}:{' '}
                      </Box>
                      <Box component="span" sx={{ color: 'text.secondary', fontWeight: 500 }}>
                        {row.value}
                      </Box>
                    </Typography>
                  </Stack>
                ))}
              </Stack>

              {data.categories.length > 0 ? (
                <Stack direction="row" sx={{ gap: 1, flexWrap: 'wrap', pt: 0.25 }}>
                  {data.categories.map(cat => (
                    <Chip
                      key={cat.slug}
                      component={RouterLink}
                      to={`${ROUTE_CATEGORIES}/${cat.slug}`}
                      label={cat.name}
                      clickable
                      variant="outlined"
                      color="primary"
                      size="small"
                      sx={{
                        fontWeight: 700,
                        borderRadius: 2,
                        bgcolor: theme => (theme.palette.mode === 'dark' ? 'transparent' : '#fff'),
                        borderWidth: 1,
                      }}
                    />
                  ))}
                </Stack>
              ) : null}

              <Stack direction="row" sx={{ gap: 1.5, flexWrap: 'wrap', alignItems: 'center', pt: 0.5 }}>
                {firstOrder != null ? (
                  <Button
                    component={RouterLink}
                    to={readerDocPath(data.slug, data.firstChapter?.chapterName || '0')}
                    variant="contained"
                    size="medium"
                    startIcon={<MenuBookOutlined />}
                    sx={{
                      borderRadius: 2,
                      px: 2.5,
                      py: 1,
                      fontWeight: 800,
                      textTransform: 'none',
                      bgcolor: '#2e7d32',
                      color: '#fff',
                      boxShadow: 'none',
                      '&:hover': { bgcolor: '#1b5e20', boxShadow: 'none' },
                    }}
                  >
                    Đọc từ đầu
                  </Button>
                ) : (
                  <Button variant="contained" size="medium" disabled sx={{ borderRadius: 2, fontWeight: 800 }}>
                    Đọc từ đầu
                  </Button>
                )}
                <Button
                  variant="contained"
                  size="medium"
                  startIcon={<FavoriteBorderOutlined />}
                  onClick={handlePlaceholderAction}
                  sx={{
                    borderRadius: 2,
                    px: 2.5,
                    py: 1,
                    fontWeight: 800,
                    textTransform: 'none',
                    bgcolor: '#e91e63',
                    color: '#fff',
                    boxShadow: 'none',
                    '&:hover': { bgcolor: '#c2185b', boxShadow: 'none' },
                  }}
                >
                  Theo dõi
                </Button>
                <Button
                  variant="contained"
                  size="medium"
                  startIcon={<ThumbUpOutlined />}
                  onClick={handlePlaceholderAction}
                  sx={{
                    borderRadius: 2,
                    px: 2.5,
                    py: 1,
                    fontWeight: 800,
                    textTransform: 'none',
                    bgcolor: '#7b1fa2',
                    color: '#fff',
                    boxShadow: 'none',
                    '&:hover': { bgcolor: '#6a1b9a', boxShadow: 'none' },
                  }}
                >
                  Thích
                </Button>
              </Stack>

              {latestOrder != null && latestOrder !== firstOrder ? (
                <Button component={RouterLink} to={readerDocPath(data.slug, data.lastChapter?.chapterName || '0')} variant="text" color="primary" size="small" sx={{ fontWeight: 700, mt: -0.5 }}>
                  Chương mới nhất →
                </Button>
              ) : null}
            </Stack>
          </Paper>

          <Box component="section" aria-labelledby="comic-intro-heading" sx={{ ...sectionPaperSx, p: { xs: 2.5, sm: 3 } }}>
            <Stack direction="row" spacing={1} sx={{ mb: 1.5, alignItems: 'center' }}>
              <InfoOutlined sx={{ fontSize: 22, color: 'text.secondary' }} aria-hidden />
              <Typography id="comic-intro-heading" variant="h6" component="h2" sx={{ fontWeight: 800, m: 0 }}>
                Giới thiệu
              </Typography>
            </Stack>
            <Typography variant="subtitle2" sx={{ fontWeight: 700, color: 'primary.main', mb: 2 }}>
              Thông tin cơ bản về {data.title}
            </Typography>
            <Box
              sx={{
                fontSize: '0.9375rem',
                lineHeight: 1.75,
                color: 'text.secondary',
                whiteSpace: 'pre-line',
                ...(!introExpanded && introNeedsToggle
                  ? {
                      display: '-webkit-box',
                      WebkitLineClamp: 5,
                      WebkitBoxOrient: 'vertical',
                      overflow: 'hidden',
                    }
                  : {}),
              }}
            >
              {introFullText || 'Chưa có mô tả.'}
            </Box>
            {introNeedsToggle ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2.5 }}>
                <Button
                  type="button"
                  variant="contained"
                  color="primary"
                  size="small"
                  onClick={() => setIntroExpanded(e => !e)}
                  sx={{ borderRadius: 2, px: 3, fontWeight: 800, textTransform: 'none', boxShadow: 'none' }}
                >
                  {introExpanded ? 'Thu gọn' : 'Xem thêm'}
                </Button>
              </Box>
            ) : null}
          </Box>

          <Box component="section" aria-labelledby="comic-chapters-heading" sx={sectionPaperSx}>
            <Stack direction="row" spacing={1.25} sx={{ mb: 2, alignItems: 'center' }}>
              <Box
                aria-hidden
                sx={{
                  width: 4,
                  height: '1.1em',
                  borderRadius: 0.5,
                  background: theme => `linear-gradient(180deg, ${theme.palette.primary.light}, ${theme.palette.primary.main})`,
                }}
              />
              <Typography id="comic-chapters-heading" variant="h6" component="h2" sx={{ fontWeight: 800, m: 0 }}>
                Danh sách chương
              </Typography>
            </Stack>
            {data.chaptersNewestFirst.length === 0 ? (
              <Typography color="text.secondary">Chưa có dữ liệu chương.</Typography>
            ) : (
              <Box
                role="list"
                sx={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))',
                  gap: 1,
                  maxHeight: 'min(70vh, 560px)',
                  overflowY: 'auto',
                  pr: 0.5,
                }}
              >
                {data.chaptersNewestFirst.map(ch => (
                  <Box
                    key={ch.orderIndex}
                    component={RouterLink}
                    id={`chapter-${ch.orderIndex}`}
                    to={readerDocPath(data.slug, ch.chapterName)}
                    role="listitem"
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      gap: 1.5,
                      p: '10px 14px',
                      textDecoration: 'none',
                      color: 'inherit',
                      bgcolor: theme => (theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.03)'),
                      border: 1,
                      borderColor: 'divider',
                      borderRadius: 1.25,
                      transition: theme => theme.transitions.create(['background-color', 'border-color']),
                      '&:hover': {
                        bgcolor: 'action.hover',
                        borderColor: 'rgba(245, 165, 36, 0.35)',
                      },
                    }}
                  >
                    <Typography variant="body2" sx={{ fontWeight: 700 }}>
                      Chương {ch.chapterName}
                      {ch.chapterTitle ? ` — ${ch.chapterTitle}` : ''}
                    </Typography>
                    <Typography variant="caption" color="text.secondary" sx={{ flexShrink: 0 }}>
                      {data.updatedAtCalendar}
                    </Typography>
                  </Box>
                ))}
              </Box>
            )}
          </Box>

          <Box component="section" aria-labelledby="comic-comments-heading" sx={sectionPaperSx}>
            <Stack spacing={1} sx={{ mb: 2 }}>
              <Stack direction="row" sx={{ gap: 1, flexWrap: 'wrap', alignItems: 'center', color: 'primary.main' }}>
                <ChatBubbleOutlineOutlined sx={{ fontSize: 20 }} />
                <Typography id="comic-comments-heading" variant="h6" component="h2" sx={{ fontWeight: 800, m: 0, color: 'primary.main' }}>
                  Bình luận
                </Typography>
                <Typography component="span" variant="h6" sx={{ fontWeight: 800, color: 'primary.main' }}>
                  ({MOCK_COMMENT_COUNT})
                </Typography>
              </Stack>
              <Typography variant="body2" color="text.secondary">
                Đây là bình luận mẫu để xem giao diện. Tính năng gửi bình luận thật sẽ được bổ sung sau.
              </Typography>
            </Stack>

            <TextField
              id="comic-comment-draft"
              fullWidth
              multiline
              minRows={4}
              placeholder="Hãy bình luận có văn hóa để tránh bị khóa tài khoản"
              slotProps={{ htmlInput: { readOnly: true, 'aria-describedby': 'comic-comments-heading' } }}
              sx={{ mb: 2.25 }}
            />

            <Stack component="ul" role="list" spacing={2} sx={{ m: 0, p: 0, listStyle: 'none' }}>
              {MOCK_COMMENTS.map(c => (
                <Box
                  key={c.id}
                  component="li"
                  role="listitem"
                  sx={{
                    p: '14px 14px 12px',
                    bgcolor: theme => (theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.03)'),
                    border: 1,
                    borderColor: 'divider',
                    borderRadius: 1.5,
                  }}
                >
                  <Stack direction="row" spacing={1.5} sx={{ alignItems: 'flex-start' }}>
                    <Avatar
                      sx={{
                        width: 44,
                        height: 44,
                        fontSize: '0.72rem',
                        fontWeight: 800,
                        color: 'primary.contrastText',
                        background: theme => `linear-gradient(135deg, ${theme.palette.primary.light}, ${theme.palette.primary.main})`,
                        border: '1px solid rgba(245, 165, 36, 0.35)',
                      }}
                    >
                      {c.initials}
                    </Avatar>
                    <Stack direction="row" sx={{ gap: 1, minWidth: 0, pt: 0.25, flexWrap: 'wrap', alignItems: 'center' }}>
                      <Typography variant="body2" sx={{ fontWeight: 700, ...userNameSx(c.nameTone) }}>
                        {c.userName}
                      </Typography>
                      <Typography component="span" variant="caption" sx={{ fontWeight: 800, letterSpacing: '0.04em', borderRadius: 0.75, px: 1, py: 0.25, ...rankSx(c.rankTone) }}>
                        [{c.rank}]
                      </Typography>
                    </Stack>
                  </Stack>
                  <Box
                    aria-hidden
                    sx={{
                      height: 1,
                      mt: '10px',
                      mb: '12px',
                      ml: { xs: 0, sm: 7 },
                      background: 'linear-gradient(90deg, rgba(245, 165, 36, 0.55), rgba(245, 165, 36, 0.08))',
                      borderRadius: 0.5,
                    }}
                  />
                  <Box sx={{ mb: 1.25, ml: { xs: 0, sm: 7 } }}>
                    {c.stickerEmoji ? (
                      <Typography component="span" sx={{ fontSize: '2.5rem', lineHeight: 1, userSelect: 'none' }} title="Sticker">
                        {c.stickerEmoji}
                      </Typography>
                    ) : (
                      <Typography variant="body2" sx={{ m: 0, lineHeight: 1.65 }}>
                        {c.body}
                      </Typography>
                    )}
                  </Box>
                  <Stack direction="row" sx={{ ml: { xs: 0, sm: 7 }, flexWrap: 'wrap', alignItems: 'center', gap: { xs: '14px 18px', sm: '14px 18px' } }}>
                    <Button
                      type="button"
                      size="small"
                      startIcon={<ThumbUpAltOutlined sx={{ fontSize: 16 }} />}
                      onClick={handlePlaceholderAction}
                      sx={{ color: '#6eb5e8', minWidth: 0, p: 0, '&:hover': { color: 'primary.main', bgcolor: 'transparent' } }}
                    >
                      {c.likes}
                    </Button>
                    <Button
                      type="button"
                      size="small"
                      startIcon={<ChatBubbleOutlineOutlined sx={{ fontSize: 16 }} />}
                      onClick={handlePlaceholderAction}
                      sx={{ color: '#6eb5e8', minWidth: 0, p: 0, '&:hover': { color: 'primary.main', bgcolor: 'transparent' } }}
                    >
                      Trả lời
                    </Button>
                    <Typography variant="caption" color="text.secondary" sx={{ ml: { xs: 0, sm: 'auto' }, width: { xs: '100%', sm: 'auto' } }}>
                      {c.timeLabel}
                    </Typography>
                  </Stack>
                  {c.replyCount != null && c.replyCount > 0 ? (
                    <Typography variant="body2" sx={{ mt: 1.25, mb: 0, ml: { xs: 0, sm: 7 } }}>
                      <strong>{c.replyCount} phản hồi</strong>
                    </Typography>
                  ) : null}
                </Box>
              ))}
            </Stack>
          </Box>
        </Container>
      </Box>
    </>
  )
}

function AlertBox({ children }: { children: React.ReactNode }) {
  return (
    <Box
      sx={{
        maxWidth: 560,
        mx: 'auto',
        p: 3,
        textAlign: 'center',
        bgcolor: 'background.paper',
        border: 1,
        borderColor: 'divider',
        borderRadius: 1.75,
      }}
    >
      <Typography sx={{ m: 0 }}>{children}</Typography>
    </Box>
  )
}
