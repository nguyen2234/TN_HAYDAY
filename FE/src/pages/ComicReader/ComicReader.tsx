import React, { useCallback, useEffect, useMemo, useState } from 'react'
import {
  Alert,
  Box,
  Breadcrumbs,
  Button,
  ButtonGroup,
  CircularProgress,
  Container,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  type SelectChangeEvent,
  Stack,
  Typography,
} from '@mui/material'
import { Helmet } from 'react-helmet-async'
import { useQuery } from '@tanstack/react-query'
import { Link as RouterLink, Navigate, useNavigate, useParams } from 'react-router-dom'
import { getChapterRead, getComicDetail } from '~services/comic'

const ROUTE_HOME = '/'

const readerDocPath = (slug: string, chapterName: string) => `/truyen-tranh/${slug}-chap-${chapterName}`

export const ComicReader: React.FC = () => {
  const { slug: rawSlug } = useParams<{ slug: string }>()
  const navigate = useNavigate()
  const [serverIdx, setServerIdx] = useState(0)

  const match = rawSlug?.match(/^(.*)-chap-([\w.-]+)$/i)
  const slug = match ? match[1] : rawSlug
  const chapId = match ? match[2] : ''

  const {
    data: comic,
    isLoading: comicLoading,
    isError: comicError,
  } = useQuery({
    queryKey: ['comic-detail', slug],
    queryFn: () => getComicDetail(slug ?? ''),
    enabled: Boolean(slug),
  })

  const chapterCount = comic?.chapterCount ?? 0
  const safeOrder = useMemo(() => {
    if (!comic) return 0
    const idx = comic.chaptersAscending.findIndex(c => c.chapterName === chapId)
    return idx >= 0 ? idx : 0
  }, [chapId, comic])

  const servers = comic?.chapterServers ?? []
  const activeServer = servers[serverIdx] ?? servers[0]
  const currentChapter = activeServer?.chapters[safeOrder]
  const chapterApiData = currentChapter?.chapterApiData

  const {
    data: chapterPayload,
    isLoading: pagesLoading,
    isError: pagesError,
    refetch: refetchPages,
  } = useQuery({
    queryKey: ['chapter-read', chapterApiData],
    queryFn: () => getChapterRead(chapterApiData!),
    enabled: Boolean(chapterApiData),
    retry: 1,
  })

  const goPrev = useCallback(() => {
    if (!slug || !comic || safeOrder <= 0) return
    navigate(readerDocPath(slug, comic.chaptersAscending[safeOrder - 1].chapterName))
  }, [navigate, slug, comic, safeOrder])

  const goNext = useCallback(() => {
    if (!slug || !comic || chapterCount < 1 || safeOrder >= chapterCount - 1) return
    navigate(readerDocPath(slug, comic.chaptersAscending[safeOrder + 1].chapterName))
  }, [navigate, slug, comic, safeOrder, chapterCount])

  const onChapterSelect = useCallback(
    (e: SelectChangeEvent<number>) => {
      if (!slug || !comic) return
      const next = Number(e.target.value)
      if (!Number.isFinite(next) || next < 0 || next >= chapterCount) return
      navigate(readerDocPath(slug, comic.chaptersAscending[next].chapterName))
    },
    [navigate, slug, comic, chapterCount],
  )

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const t = e.target as HTMLElement | null
      if (t && (t.tagName === 'INPUT' || t.tagName === 'TEXTAREA' || t.isContentEditable)) return
      if (e.key === 'ArrowLeft') {
        e.preventDefault()
        goPrev()
      }
      if (e.key === 'ArrowRight') {
        e.preventDefault()
        goNext()
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [goPrev, goNext])

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'auto' })
  }, [slug, safeOrder, serverIdx])

  if (!slug) return <Navigate to="/404" replace />

  if (comicLoading) {
    return (
      <Container maxWidth="lg" sx={{ py: 5, textAlign: 'center' }}>
        <CircularProgress color="primary" aria-busy />
        <Typography color="text.secondary" sx={{ mt: 2 }}>
          Đang tải truyện…
        </Typography>
      </Container>
    )
  }

  if (comicError || !comic) {
    return (
      <Container maxWidth="lg" sx={{ py: 5 }}>
        <Alert severity="error" sx={{ maxWidth: 520, mx: 'auto' }}>
          Không tải được dữ liệu truyện.
        </Alert>
      </Container>
    )
  }

  if (chapterCount === 0) {
    return <Navigate to={`/truyen-tranh/${slug}`} replace />
  }

  if (!comic.chaptersAscending.some(c => c.chapterName === chapId)) {
    return <Navigate to={readerDocPath(comic.slug, comic.firstChapter?.chapterName || '0')} replace />
  }

  const detailPath = `/truyen-tranh/${comic.slug}`
  const chName = currentChapter?.chapterName ?? String(safeOrder + 1)
  const chTitle = currentChapter?.chapterTitle
  const nextCh = comic.chaptersAscending[safeOrder + 1]
  const pageUrls = chapterPayload?.pageUrls ?? []

  const helmetTitle = `${comic.title} - Chương ${chName} - TN_HAYDAY`

  return (
    <>
      <Helmet>
        <title>{helmetTitle}</title>
        <meta name="description" content={`Đọc ${comic.title} chương ${chName} tại TN_HAYDAY.`} />
      </Helmet>

      <Box sx={{ pb: 6 }}>
        <Container maxWidth="lg" sx={{ py: 1 }}>
          <Box
            sx={{
              position: 'sticky',
              top: 0,
              zIndex: 20,
              mx: { xs: -1.5, sm: 0 },
              px: 1.5,
              py: 1.25,
              mb: 2,
              bgcolor: theme => (theme.palette.mode === 'dark' ? 'rgba(26,26,26,0.92)' : 'rgba(255,255,255,0.92)'),
              backdropFilter: 'blur(8px)',
              borderBottom: 1,
              borderColor: 'divider',
              borderRadius: { xs: 0, sm: '0 0 10px 10px' },
            }}
          >
            {servers.length > 1 ? (
              <Stack direction="row" sx={{ mb: 1, gap: 1, flexWrap: 'wrap', alignItems: 'center' }}>
                <Typography variant="caption" sx={{ fontWeight: 800, letterSpacing: '0.1em', color: 'text.secondary' }}>
                  Server ảnh
                </Typography>
                <ButtonGroup size="small" variant="outlined">
                  {servers.map((s, i) => (
                    <Button
                      key={s.serverName}
                      type="button"
                      variant={i === serverIdx ? 'contained' : 'outlined'}
                      color="primary"
                      onClick={() => setServerIdx(i)}
                    >
                      {s.serverName || `Server ${i + 1}`}
                    </Button>
                  ))}
                </ButtonGroup>
              </Stack>
            ) : null}
            <Typography variant="body2" color="text.secondary" sx={{ m: 0 }}>
              Nếu không xem được ảnh, hãy thử đổi &quot;Server ảnh&quot; phía trên.
            </Typography>
          </Box>

          <Breadcrumbs aria-label="Breadcrumb" sx={{ mb: 1.5, flexWrap: 'wrap', '& a': { color: 'text.secondary' } }}>
            <Typography component={RouterLink} to={ROUTE_HOME} variant="body2" sx={{ textDecoration: 'none', '&:hover': { color: 'primary.main' } }}>
              Trang Chủ
            </Typography>
            <Typography component={RouterLink} to={detailPath} variant="body2" sx={{ textDecoration: 'none', '&:hover': { color: 'primary.main' } }}>
              {comic.title}
            </Typography>
            <Typography color="text.primary" variant="body2" sx={{ fontWeight: 600 }}>
              Chương {chName}
            </Typography>
          </Breadcrumbs>

          <Box sx={{ mb: 2 }}>
            <Typography variant="h5" component="h1" sx={{ fontWeight: 800, lineHeight: 1.3, mb: 0.75 }}>
              {comic.title} — Chapter {chName}
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ m: 0 }}>
              {chapterPayload?.updatedAtLabel
                ? `(Cập nhật lúc: ${chapterPayload.updatedAtLabel})`
                : pagesLoading
                  ? '(Đang tải thông tin chương…)'
                  : `(Truyện cập nhật: ${comic.updatedAtCalendar})`}
            </Typography>
          </Box>

          <Stack direction="row" sx={{ mb: 2.5, gap: 1.25, flexWrap: 'wrap', alignItems: 'center' }}>
            <Button type="button" variant="outlined" color="primary" disabled={safeOrder <= 0} onClick={goPrev}>
              ← Chap trước
            </Button>
            <Button
              type="button"
              variant="outlined"
              color="primary"
              disabled={safeOrder >= chapterCount - 1}
              onClick={goNext}
            >
              Chap sau →
            </Button>
            <Button type="button" size="small" disabled sx={{ color: 'text.secondary' }}>
              Báo lỗi chương
            </Button>
          </Stack>

          <Typography variant="body2" color="text.secondary" sx={{ mb: 2, fontStyle: 'italic' }}>
            Dùng phím ← hoặc → để chuyển chương.
            {nextCh ? ` Tiếp theo: Chương ${nextCh.chapterName}.` : ' Đây là chương mới nhất.'}
          </Typography>

          {pagesLoading ? (
            <Box sx={{ textAlign: 'center', py: 6 }}>
              <CircularProgress color="primary" />
              <Typography color="text.secondary" sx={{ mt: 2 }}>
                Đang tải ảnh chương…
              </Typography>
            </Box>
          ) : null}

          {pagesError ? (
            <Alert
              severity="error"
              sx={{ maxWidth: 520, mx: 'auto', textAlign: 'center', py: 3 }}
              action={
                <Button color="inherit" size="small" onClick={() => refetchPages()}>
                  Thử lại
                </Button>
              }
            >
              Không tải được ảnh chương.
            </Alert>
          ) : null}

          {!pagesLoading && !pagesError && pageUrls.length === 0 && chapterApiData ? (
            <Alert severity="warning" sx={{ maxWidth: 520, mx: 'auto' }}>
              Chương không có dữ liệu ảnh.
              {servers.length > 1 ? (
                <Typography variant="caption" sx={{ mt: 1, display: 'block' }}>
                  Thử đổi server ảnh khác.
                </Typography>
              ) : null}
            </Alert>
          ) : null}

          {!pagesLoading && !pagesError && pageUrls.length > 0 ? (
            <Stack
              spacing={0}
              sx={{
                alignItems: 'center',
                bgcolor: '#0d0d0d',
                borderRadius: 1.5,
                overflow: 'hidden',
                border: 1,
                borderColor: 'divider',
              }}
            >
              {pageUrls.map((src, i) => (
                <Box
                  key={i}
                  component="img"
                  src={src}
                  alt={
                    chTitle
                      ? `${comic.title} — ${chTitle} — trang ${i + 1}`
                      : `${comic.title} chương ${chName} trang ${i + 1}`
                  }
                  loading={i < 3 ? 'eager' : 'lazy'}
                  sx={{
                    display: 'block',
                    width: '100%',
                    maxWidth: 'min(920px, 100%)',
                    height: 'auto',
                    verticalAlign: 'middle',
                  }}
                />
              ))}
            </Stack>
          ) : null}

          <Box
            sx={{
              mt: 2.5,
              p: 2,
              bgcolor: 'background.paper',
              border: 1,
              borderColor: 'divider',
              borderRadius: 1.5,
            }}
          >
            <Stack direction="row" sx={{ mb: 2, gap: 1.5, flexWrap: 'wrap', alignItems: 'center' }}>
              <FormControl size="small" sx={{ flex: '1 1 200px', minWidth: 0, maxWidth: '100%' }}>
                <InputLabel id="reader-chapter-select-label">Chọn chương</InputLabel>
                <Select<number>
                  labelId="reader-chapter-select-label"
                  id="reader-chapter-select"
                  label="Chọn chương"
                  value={safeOrder}
                  onChange={onChapterSelect}
                >
                  {comic.chaptersAscending.map(ch => {
                    const label = ch.chapterTitle?.trim()
                      ? `${ch.chapterName} — ${ch.chapterTitle.trim()}`
                      : `Chương ${ch.chapterName}`
                    return (
                      <MenuItem key={ch.orderIndex} value={ch.orderIndex}>
                        {label}
                      </MenuItem>
                    )
                  })}
                </Select>
              </FormControl>
              <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 700, fontVariantNumeric: 'tabular-nums' }}>
                {safeOrder + 1} / {chapterCount}
              </Typography>
            </Stack>
            <Stack direction="row" sx={{ gap: 1.25, flexWrap: 'wrap', justifyContent: 'center' }}>
              <Button type="button" variant="outlined" disabled={safeOrder <= 0} onClick={goPrev}>
                Chap trước
              </Button>
              <Button type="button" variant="outlined" disabled={safeOrder >= chapterCount - 1} onClick={goNext}>
                Chap sau
              </Button>
              <Button type="button" variant="outlined" color="primary" disabled>
                Theo dõi
              </Button>
            </Stack>
          </Box>

          <Box sx={{ mt: 3, py: 2, borderTop: 1, borderColor: 'divider' }}>
            <Typography variant="subtitle2" sx={{ mb: 1 }}>
              Bình luận
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Tính năng bình luận sẽ được bổ sung sau.
            </Typography>
          </Box>
        </Container>
      </Box>
    </>
  )
}
