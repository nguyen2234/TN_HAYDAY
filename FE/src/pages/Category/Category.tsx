import React, { useCallback, useMemo } from 'react'
import {
  Box,
  Chip,
  CircularProgress,
  Container,
  Pagination,
  Paper,
  Stack,
  Typography,
} from '@mui/material'
import { Helmet } from 'react-helmet-async'
import { keepPreviousData, useQuery } from '@tanstack/react-query'
import { Link as RouterLink, useNavigate, useParams, useSearchParams } from 'react-router-dom'
import { Skeleton } from '~components/Skeleton'
import { getComicCategories, getComicsByCategory } from '~services/comic'
import type { Comic } from '~types/comic'

const ROUTE_CATEGORIES = '/the-loai'

const STATUS_OPTIONS = [
  { key: '', label: 'Tất cả' },
  { key: '0', label: 'Đang tiến hành' },
  { key: '2', label: 'Hoàn thành' },
] as const

const COUNTRY_OPTIONS = [
  { key: '', label: 'Tất cả' },
  { key: '1', label: 'Trung Quốc' },
  { key: '2', label: 'Việt Nam' },
  { key: '3', label: 'Hàn Quốc' },
  { key: '4', label: 'Nhật Bản' },
  { key: '5', label: 'Mỹ' },
] as const

const SORT_OPTIONS = [
  { key: '', label: 'Mặc định' },
  { key: 'updated_at.desc', label: 'Ngày cập nhật giảm dần' },
  { key: 'updated_at.asc', label: 'Ngày cập nhật tăng dần' },
  { key: 'created_at.desc', label: 'Ngày đăng giảm dần' },
  { key: 'created_at.asc', label: 'Ngày đăng tăng dần' },
  { key: 'view.desc', label: 'Lượt xem giảm dần' },
  { key: 'view.asc', label: 'Lượt xem tăng dần' },
] as const

const comicStatusVi = (s: Comic['status']) => {
  if (s === 'completed') return 'Hoàn thành'
  if (s === 'ongoing') return 'Đang cập nhật'
  return 'Tạm ngưng'
}

const filterRowSx = {
  display: 'grid',
  gridTemplateColumns: { xs: '1fr', sm: 'minmax(100px, 150px) 1fr' },
  gap: { xs: 1, sm: '10px 16px' },
  p: '12px 14px',
  borderBottom: 1,
  borderColor: 'divider',
  alignItems: 'start',
  '&:last-of-type': { borderBottom: 'none' },
} as const

export const Category: React.FC = () => {
  const navigate = useNavigate()
  const { slug } = useParams<{ slug?: string }>()
  const [searchParams] = useSearchParams()

  const pageParam = Number(searchParams.get('page') ?? '1')
  const page = Number.isNaN(pageParam) || pageParam < 1 ? 1 : pageParam
  const statusFilter = searchParams.get('status') ?? ''
  const countryFilter = searchParams.get('country') ?? ''
  const sortFilter = searchParams.get('sort') ?? ''

  const mergeSearch = useCallback(
    (updates: Record<string, string | null | undefined>) => {
      const p = new URLSearchParams(searchParams)
      const touchedPage = Object.prototype.hasOwnProperty.call(updates, 'page')
      if (!touchedPage) p.delete('page')
      for (const [k, v] of Object.entries(updates)) {
        if (v === null || v === undefined || v === '') p.delete(k)
        else p.set(k, v)
      }
      return p.toString()
    },
    [searchParams],
  )

  const { data: categories = [], isLoading, isError } = useQuery({
    queryKey: ['comic-categories'],
    queryFn: getComicCategories,
  })

  const apiFilters = useMemo(
    () => ({
      ...(statusFilter ? { status: statusFilter } : {}),
      ...(countryFilter ? { country: countryFilter } : {}),
      ...(sortFilter ? { sort: sortFilter } : {}),
    }),
    [statusFilter, countryFilter, sortFilter],
  )

  const {
    data: categoryResult,
    isLoading: isCategoryLoading,
    isError: isCategoryError,
  } = useQuery({
    queryKey: ['category-comics', slug, page, statusFilter, countryFilter, sortFilter],
    queryFn: () => getComicsByCategory(slug ?? '', page, apiFilters),
    enabled: Boolean(slug),
    placeholderData: keepPreviousData,
  })

  const totalPages = categoryResult
    ? Math.ceil(categoryResult.pagination.totalItems / categoryResult.pagination.totalItemsPerPage) || 1
    : 1

  const goPage = (n: number) => {
    if (!slug) return
    const s = mergeSearch({ page: n <= 1 ? null : String(n) })
    navigate({ pathname: `${ROUTE_CATEGORIES}/${slug}`, search: s })
  }

  const listSkeleton = (
    <Stack spacing={2}>
      {Array.from({ length: 8 }).map((_, i) => (
        <Paper
          key={i}
          elevation={0}
          sx={{
            p: 2,
            display: 'grid',
            gridTemplateColumns: { xs: '88px 1fr', sm: '112px 1fr' },
            gap: { xs: 1.5, sm: 2 },
            bgcolor: 'background.paper',
            border: 1,
            borderColor: 'divider',
            borderRadius: 1.5,
          }}
        >
          <Skeleton width="100%" height={149} borderRadius="8px" />
          <Stack spacing={1} sx={{ flex: 1, minWidth: 0 }}>
            <Skeleton height="14px" width="40%" borderRadius="4px" />
            <Skeleton height="22px" width="85%" borderRadius="4px" />
            <Skeleton height="14px" width="60%" borderRadius="4px" />
          </Stack>
        </Paper>
      ))}
    </Stack>
  )

  return (
    <>
      <Helmet>
        <title>
          {slug && categoryResult ? `${categoryResult.title} - TN_HAYDAY` : 'Thể loại truyện - TN_HAYDAY'}
        </title>
      </Helmet>

      <Container maxWidth="lg" sx={{ py: { xs: 2, md: 3 } }}>
        {!slug && (
          <>
            <Paper
              elevation={0}
              sx={{
                py: 3.5,
                px: 2.5,
                textAlign: 'center',
                bgcolor: 'background.paper',
                border: 1,
                borderColor: 'divider',
                borderRadius: 1.75,
                mb: 3.5,
              }}
            >
              <Typography variant="h4" component="h1" sx={{ fontWeight: 800, mb: 1, fontSize: { xs: '1.5rem', sm: 'clamp(1.5rem, 4vw, 2rem)' } }}>
                Thể loại truyện
              </Typography>
              <Typography color="text.secondary" sx={{ m: 0, maxWidth: 560, mx: 'auto', lineHeight: 1.55 }}>
                Chọn thể loại để xem danh sách truyện. Giao diện danh sách theo từng thể loại được làm tương tự TruyenQQ.
              </Typography>
            </Paper>

            {isError ? (
              <Typography color="text.secondary" sx={{ textAlign: 'center' }}>
                Không thể tải thể loại. Vui lòng thử lại sau.
              </Typography>
            ) : null}

            {isLoading ? (
              <Stack direction="row" sx={{ mb: 4, gap: 1, flexWrap: 'wrap', justifyContent: 'center' }}>
                {Array.from({ length: 24 }).map((_, i) => (
                  <Skeleton key={i} width="100px" height="36px" borderRadius="999px" />
                ))}
              </Stack>
            ) : null}

            {!isLoading && !isError ? (
              <Stack direction="row" sx={{ mb: 4, gap: 1, flexWrap: 'wrap', justifyContent: 'center' }}>
                {categories.map(category => (
                  <Chip
                    key={category.id}
                    component={RouterLink}
                    to={`${ROUTE_CATEGORIES}/${category.slug}`}
                    label={category.name}
                    clickable
                    variant="outlined"
                    sx={{ fontWeight: 600 }}
                  />
                ))}
              </Stack>
            ) : null}
          </>
        )}

        {slug && (
          <>
            <Box component="header" sx={{ mb: 2.5 }}>
              <Typography variant="h4" component="h1" sx={{ fontWeight: 800, mb: 1, fontSize: { xs: '1.35rem', sm: 'clamp(1.35rem, 3vw, 1.75rem)' } }}>
                Truyện {categoryResult?.title ?? '…'}
              </Typography>
              <Typography color="text.secondary" sx={{ m: 0, maxWidth: 720, lineHeight: 1.6 }}>
                Danh sách truyện thuộc thể loại này. Dùng bộ lọc bên dưới để thu hẹp (nếu API hỗ trợ tham số tương
                ứng).
              </Typography>
            </Box>

            <Paper
              elevation={0}
              sx={{
                bgcolor: 'background.paper',
                border: 1,
                borderColor: 'divider',
                borderRadius: 1.5,
                overflow: 'hidden',
                mb: 3,
              }}
            >
              <Box sx={filterRowSx}>
                <Typography variant="caption" sx={{ fontWeight: 800, letterSpacing: '0.08em', color: 'text.secondary', pt: 0.5 }}>
                  Thể loại truyện
                </Typography>
                <Stack direction="row" sx={{ gap: 0.75, flexWrap: 'wrap', alignItems: 'center' }}>
                  {isLoading ? (
                    <CircularProgress size={22} color="primary" />
                  ) : (
                    categories.map(cat => (
                      <Chip
                        key={cat.id}
                        component={RouterLink}
                        to={`${ROUTE_CATEGORIES}/${cat.slug}`}
                        label={cat.name}
                        clickable
                        size="small"
                        color={cat.slug === slug ? 'primary' : 'default'}
                        variant={cat.slug === slug ? 'filled' : 'outlined'}
                        sx={{ fontWeight: 600, fontSize: '0.78rem' }}
                      />
                    ))
                  )}
                </Stack>
              </Box>

              <Box sx={filterRowSx}>
                <Typography variant="caption" sx={{ fontWeight: 800, letterSpacing: '0.08em', color: 'text.secondary', pt: 0.5 }}>
                  Tình trạng
                </Typography>
                <Stack direction="row" sx={{ gap: 0.75, flexWrap: 'wrap' }}>
                  {STATUS_OPTIONS.map(opt => (
                    <Chip
                      key={`st-${opt.key}`}
                      component={RouterLink}
                      to={{ pathname: `${ROUTE_CATEGORIES}/${slug}`, search: mergeSearch({ status: opt.key || null }) }}
                      label={opt.label}
                      clickable
                      size="small"
                      color={statusFilter === opt.key ? 'primary' : 'default'}
                      variant={statusFilter === opt.key ? 'filled' : 'outlined'}
                      sx={{ fontWeight: 600 }}
                    />
                  ))}
                </Stack>
              </Box>

              <Box sx={filterRowSx}>
                <Typography variant="caption" sx={{ fontWeight: 800, letterSpacing: '0.08em', color: 'text.secondary', pt: 0.5 }}>
                  Quốc gia
                </Typography>
                <Stack direction="row" sx={{ gap: 0.75, flexWrap: 'wrap' }}>
                  {COUNTRY_OPTIONS.map(opt => (
                    <Chip
                      key={`ct-${opt.key}`}
                      component={RouterLink}
                      to={{ pathname: `${ROUTE_CATEGORIES}/${slug}`, search: mergeSearch({ country: opt.key || null }) }}
                      label={opt.label}
                      clickable
                      size="small"
                      color={countryFilter === opt.key ? 'primary' : 'default'}
                      variant={countryFilter === opt.key ? 'filled' : 'outlined'}
                      sx={{ fontWeight: 600 }}
                    />
                  ))}
                </Stack>
              </Box>

              <Box sx={filterRowSx}>
                <Typography variant="caption" sx={{ fontWeight: 800, letterSpacing: '0.08em', color: 'text.secondary', pt: 0.5 }}>
                  Sắp xếp
                </Typography>
                <Stack direction="row" sx={{ gap: 0.75, flexWrap: 'wrap' }}>
                  {SORT_OPTIONS.map(opt => (
                    <Chip
                      key={`so-${opt.key}`}
                      component={RouterLink}
                      to={{ pathname: `${ROUTE_CATEGORIES}/${slug}`, search: mergeSearch({ sort: opt.key || null }) }}
                      label={opt.label}
                      clickable
                      size="small"
                      color={sortFilter === opt.key ? 'primary' : 'default'}
                      variant={sortFilter === opt.key ? 'filled' : 'outlined'}
                      sx={{ fontWeight: 600 }}
                    />
                  ))}
                </Stack>
              </Box>
            </Paper>

            {isCategoryError ? (
              <Typography color="text.secondary" sx={{ textAlign: 'center' }}>
                Không thể tải truyện theo thể loại này.
              </Typography>
            ) : null}

            <Box sx={{ position: 'relative', minHeight: 200 }}>
              {isCategoryLoading && !categoryResult ? listSkeleton : null}

              {!isCategoryLoading && !isCategoryError && categoryResult ? (
                <>
                  <Stack spacing={2}>
                    {categoryResult.comics.map(comic => (
                      <Paper
                        key={comic.id}
                        component="article"
                        elevation={0}
                        sx={{
                          p: { xs: 1.5, sm: 2 },
                          display: 'grid',
                          gridTemplateColumns: { xs: '88px 1fr', sm: '112px 1fr' },
                          gap: { xs: 1.5, sm: 2 },
                          bgcolor: 'background.paper',
                          border: 1,
                          borderColor: 'divider',
                          borderRadius: 1.5,
                          transition: theme => theme.transitions.create(['border-color', 'box-shadow']),
                          '&:hover': {
                            borderColor: 'rgba(245, 165, 36, 0.35)',
                            boxShadow: '0 8px 24px rgba(0,0,0,0.2)',
                          },
                        }}
                      >
                        <Box
                          component={RouterLink}
                          to={`/truyen-tranh/${comic.slug}`}
                          sx={{
                            display: 'block',
                            borderRadius: 1,
                            overflow: 'hidden',
                            border: 1,
                            borderColor: 'divider',
                            boxShadow: '0 4px 14px rgba(0,0,0,0.25)',
                          }}
                        >
                          <Box component="img" src={comic.coverUrl} alt="" loading="lazy" sx={{ display: 'block', width: '100%', aspectRatio: '3/4', objectFit: 'cover' }} />
                        </Box>
                        <Stack spacing={0.5} sx={{ minWidth: 0 }}>
                          <Typography variant="caption" sx={{ fontWeight: 700, color: 'primary.main' }}>
                            {comic.updatedAt}
                          </Typography>
                          <Typography variant="h6" component="h2" sx={{ m: 0, fontWeight: 800, lineHeight: 1.3, fontSize: '1.05rem' }}>
                            <Box
                              component={RouterLink}
                              to={`/truyen-tranh/${comic.slug}`}
                              sx={{ color: 'text.primary', textDecoration: 'none', '&:hover': { color: 'primary.main' } }}
                            >
                              {comic.title}
                            </Box>
                          </Typography>
                          <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 600 }}>
                            Lượt xem: {comic.viewCount > 0 ? comic.viewCount.toLocaleString('vi-VN') : '—'}
                            <Box component="span" aria-hidden>
                              {' '}
                              ·{' '}
                            </Box>
                            Lượt theo dõi: —
                          </Typography>
                          <Typography variant="body2" sx={{ fontWeight: 700 }}>
                            {comic.latestChapter}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            Tình trạng: {comicStatusVi(comic.status)}
                          </Typography>
                          {comic.categories.length > 0 ? (
                            <Stack direction="row" sx={{ mt: 0.5, gap: 0.75, flexWrap: 'wrap' }}>
                              {comic.categories.map(name => (
                                <Chip key={name} label={name} size="small" variant="outlined" sx={{ fontSize: '0.72rem', fontWeight: 700, height: 22 }} />
                              ))}
                            </Stack>
                          ) : null}
                        </Stack>
                      </Paper>
                    ))}
                  </Stack>

                  {totalPages > 1 ? (
                    <Paper
                      elevation={0}
                      sx={{
                        mt: 3.5,
                        py: 2,
                        px: 2,
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        gap: 1.25,
                        bgcolor: 'background.paper',
                        border: 1,
                        borderColor: 'divider',
                        borderRadius: 1.5,
                      }}
                    >
                      <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 600 }}>
                        Trang {categoryResult.pagination.currentPage} / {totalPages}
                      </Typography>
                      <Pagination
                        count={totalPages}
                        page={page}
                        onChange={(_, value) => goPage(value)}
                        color="primary"
                        showFirstButton
                        showLastButton
                        siblingCount={1}
                        boundaryCount={1}
                        size="large"
                      />
                    </Paper>
                  ) : null}
                </>
              ) : null}
            </Box>
          </>
        )}
      </Container>
    </>
  )
}
