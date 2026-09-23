import axios from 'axios'
import { get } from '~services/http'
import type { Comic } from '~types/comic'
import type {
  OTruyenCategoryComicsResponse,
  OTruyenCategoryListResponse,
  OTruyenComicDetailResponse,
  OTruyenComicItem,
  OTruyenHomeResponse,
} from '~types/otruyen'

const mapStatus = (status: string): Comic['status'] => {
  if (status === 'completed') return 'completed'
  if (status === 'ongoing') return 'ongoing'
  return 'paused'
}

const formatUpdatedAt = (updatedAt: string) => {
  const date = new Date(updatedAt)
  if (Number.isNaN(date.getTime())) return updatedAt
  const diffMs = Date.now() - date.getTime()
  const diffMinutes = Math.floor(diffMs / 60_000)
  if (diffMinutes < 1) return 'Vừa xong'
  if (diffMinutes < 60) return `${diffMinutes} phút trước`
  const diffHours = Math.floor(diffMinutes / 60)
  if (diffHours < 24) return `${diffHours} giờ trước`
  const diffDays = Math.floor(diffHours / 24)
  if (diffDays < 7) return `${diffDays} ngày trước`
  return date.toLocaleDateString('vi-VN')
}

const formatCalendarDateVi = (iso: string) => {
  const date = new Date(iso)
  if (Number.isNaN(date.getTime())) return '—'
  return date.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' })
}

const statusLabelVi = (status: ReturnType<typeof mapStatus>) => {
  if (status === 'completed') return 'Hoàn thành'
  if (status === 'ongoing') return 'Đang ra'
  return 'Tạm ngưng'
}

const mapComic = (item: OTruyenComicItem, cdnDomain: string): Comic => ({
  id: item._id,
  slug: item.slug,
  title: item.name,
  coverUrl: `${cdnDomain}/uploads/comics/${item.thumb_url}`,
  latestChapter: item.chaptersLatest?.[0]?.chapter_name
    ? `Chương ${item.chaptersLatest[0].chapter_name}`
    : 'Đang cập nhật',
  viewCount: 0,
  status: mapStatus(item.status),
  categories: item.category.map(category => category.name),
  updatedAt: formatUpdatedAt(item.updatedAt),
})

export const getHomeComics = async (): Promise<Comic[]> => {
  const response = await get<OTruyenHomeResponse>('/home')
  return response.data.items.map(item => mapComic(item, response.data.APP_DOMAIN_CDN_IMAGE))
}

export interface ComicDetailChapter {
  /** Thứ tự tăng dần từ chương đầu (0 = chương đầu), dùng cho neo URL. */
  orderIndex: number
  chapterName: string
  chapterTitle: string
  chapterApiData: string
}

export interface ComicDetailCategory {
  name: string
  slug: string
}

export interface ComicChapterServer {
  serverName: string
  chapters: ComicDetailChapter[]
}

export interface ComicDetail {
  id: string
  slug: string
  title: string
  description: string
  coverUrl: string
  status: ReturnType<typeof mapStatus>
  statusLabel: string
  author: string
  categories: ComicDetailCategory[]
  updatedAt: string
  updatedAtCalendar: string
  latestChapter: string
  chapterCount: number
  /** Thứ tự chương chuẩn (server đầu tiên), index 0 = chương đầu. */
  chaptersAscending: ComicDetailChapter[]
  chaptersNewestFirst: ComicDetailChapter[]
  /** Mỗi server một bản danh sách chương cùng `orderIndex` (đổi server khi đọc). */
  chapterServers: ComicChapterServer[]
  firstChapter: ComicDetailChapter | null
  lastChapter: ComicDetailChapter | null
}

const mapChapterRow = (ch: { chapter_name: string; chapter_title: string; chapter_api_data: string }, orderIndex: number): ComicDetailChapter => ({
  orderIndex,
  chapterName: ch.chapter_name,
  chapterTitle: ch.chapter_title?.trim() || '',
  chapterApiData: ch.chapter_api_data,
})

export const getComicDetail = async (slug: string): Promise<ComicDetail> => {
  const response = await get<OTruyenComicDetailResponse>(`/truyen-tranh/${slug}`)
  const { item, APP_DOMAIN_CDN_IMAGE: cdnDomain } = response.data
  const primaryList = item.chapters[0]?.server_data ?? []
  const chapterRows: ComicDetailChapter[] = primaryList.map((ch, orderIndex) => mapChapterRow(ch, orderIndex))
  const latestName = chapterRows.at(-1)?.chapterName ?? 'Đang cập nhật'
  const status = mapStatus(item.status)
  const chaptersNewestFirst = [...chapterRows].reverse()

  const chapterServers: ComicChapterServer[] = item.chapters.map(server => ({
    serverName: server.server_name,
    chapters: primaryList.map((primaryCh, orderIndex) => {
      const match = server.server_data.find(c => c.chapter_name === primaryCh.chapter_name)
      const ch = match ?? primaryCh
      return mapChapterRow(ch, orderIndex)
    }),
  }))

  return {
    id: item._id,
    slug: item.slug,
    title: item.name,
    description: item.content.replace(/<[^>]*>/g, '').trim(),
    coverUrl: `${cdnDomain}/uploads/comics/${item.thumb_url}`,
    status,
    statusLabel: statusLabelVi(status),
    author: item.author?.filter(Boolean).join(', ') || 'Đang cập nhật',
    categories: item.category.map(c => ({ name: c.name, slug: c.slug })),
    updatedAt: formatUpdatedAt(item.updatedAt),
    updatedAtCalendar: formatCalendarDateVi(item.updatedAt),
    latestChapter: `Chương ${latestName}`,
    chapterCount: chapterRows.length,
    chaptersAscending: chapterRows,
    chaptersNewestFirst,
    chapterServers,
    firstChapter: chapterRows[0] ?? null,
    lastChapter: chapterRows.length ? chapterRows[chapterRows.length - 1] : null,
  }
}

const resolveChapterApiUrl = (chapterApiData: string) => {
  if (/^https?:\/\//i.test(chapterApiData)) return chapterApiData
  const base = import.meta.env.VITE_API_URL ?? ''
  if (!base) return chapterApiData
  return `${String(base).replace(/\/$/, '')}/${chapterApiData.replace(/^\//, '')}`
}

const buildPageUrl = (domainRaw: string, chapterPath: string, imageFile: string) => {
  const file = imageFile.trim()
  if (/^https?:\/\//i.test(file)) return file
  const domain = domainRaw.replace(/\/$/, '')
  const path = chapterPath.replace(/^\//, '').replace(/\/$/, '')
  const segments = [domain, path, file.replace(/^\//, '')].filter(Boolean)
  return segments.join('/')
}

export interface ChapterReadPayload {
  pageUrls: string[]
  updatedAtLabel?: string
}

export const getChapterRead = async (chapterApiData: string): Promise<ChapterReadPayload> => {
  const url = resolveChapterApiUrl(chapterApiData)
  const { data: body } = await axios.get<unknown>(url, { timeout: 25_000 })
  const root = body as Record<string, unknown>
  const d = (typeof root.data === 'object' && root.data != null ? root.data : root) as Record<string, unknown>
  const domain =
    (typeof d.domain_cdn === 'string' && d.domain_cdn) ||
    (typeof d.APP_DOMAIN_CDN_IMAGE === 'string' && d.APP_DOMAIN_CDN_IMAGE) ||
    ''
  const item = (typeof d.item === 'object' && d.item != null ? d.item : {}) as Record<string, unknown>
  const chapterPath = typeof item.chapter_path === 'string' ? item.chapter_path : ''
  const images = Array.isArray(item.chapter_image) ? item.chapter_image : []
  const pageUrls = images
    .map(img => {
      const row = img as Record<string, unknown>
      const file = typeof row.image_file === 'string' ? row.image_file : ''
      return buildPageUrl(domain, chapterPath, file)
    })
    .filter(Boolean)

  let updatedAtLabel: string | undefined
  if (typeof item.updatedAt === 'string' && item.updatedAt) {
    const dt = new Date(item.updatedAt)
    if (!Number.isNaN(dt.getTime())) {
      updatedAtLabel = dt.toLocaleString('vi-VN', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      })
    }
  }

  return { pageUrls, updatedAtLabel }
}

export interface ComicCategory {
  id: string
  slug: string
  name: string
}

export const getComicCategories = async (): Promise<ComicCategory[]> => {
  const response = await get<OTruyenCategoryListResponse>('/the-loai')
  return response.data.items.map(item => ({
    id: item.id,
    slug: item.slug,
    name: item.name,
  }))
}

export interface CategoryComicResult {
  title: string
  comics: Comic[]
  pagination: {
    currentPage: number
    totalItems: number
    totalItemsPerPage: number
  }
}

export interface CategoryComicsFilters {
  status?: string
  country?: string
  sort?: string
}

export const getComicsByCategory = async (
  slug: string,
  page = 1,
  filters?: CategoryComicsFilters,
): Promise<CategoryComicResult> => {
  const response = await get<OTruyenCategoryComicsResponse>(`/the-loai/${slug}`, {
    params: {
      page,
      ...(filters?.status ? { status: filters.status } : {}),
      ...(filters?.country ? { country: filters.country } : {}),
      ...(filters?.sort ? { sort: filters.sort } : {}),
    },
  })

  return {
    title: response.data.titlePage || slug,
    comics: response.data.items.map(item => mapComic(item, response.data.APP_DOMAIN_CDN_IMAGE)),
    pagination: {
      currentPage: response.data.params.pagination.currentPage,
      totalItems: response.data.params.pagination.totalItems,
      totalItemsPerPage: response.data.params.pagination.totalItemsPerPage,
    },
  }
}
