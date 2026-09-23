export interface Comic {
  id: string
  slug: string
  title: string
  coverUrl: string
  latestChapter: string
  viewCount: number
  status: 'ongoing' | 'completed' | 'paused'
  categories: string[]
  updatedAt: string
}
