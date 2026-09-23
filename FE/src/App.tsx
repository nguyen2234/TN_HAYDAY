import { Helmet } from 'react-helmet-async'
import { BrowserRouter, Routes, Route, useParams, Navigate } from 'react-router-dom'
import { MainLayout } from './layouts'
import { Home } from './pages/Home'
import { Category } from './pages/Category'
import { Forbidden } from './pages/Forbidden'
import { NotFound } from './pages/NotFound'
import { ComicDetail } from './pages/ComicDetail'
import { ComicReader } from './pages/ComicReader'
import { Login, Register } from './pages/Auth'
import { AccountPage } from './pages/Account'

const ComicRouteResolver = () => {
  const { slug } = useParams<{ slug: string }>()
  if (!slug) return <Navigate to="/404" replace />
  if (slug.includes('-chap-')) {
    return <ComicReader />
  }
  return <ComicDetail />
}

function App() {
  return (
    <>
      <Helmet>
        <meta charSet="utf-8" />
        <title>TN_HAYDAY - Truyện Mới Cập Nhật</title>
        <meta
          name="description"
          content="Nền tảng đọc truyện trực tuyến, cập nhật truyện tranh nhanh nhất, giao diện đẹp và hiện đại."
        />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Helmet>

      <BrowserRouter>
        <Routes>
          <Route path="/" element={<MainLayout />}>
            <Route index element={<Home />} />
            <Route path="the-loai" element={<Category />} />
            <Route path="the-loai/:slug" element={<Category />} />
            <Route path="truyen-tranh/:slug" element={<ComicRouteResolver />} />
            <Route path="dang-nhap" element={<Login />} />
            <Route path="dang-ky" element={<Register />} />
            <Route path="quan-ly-tai-khoan" element={<AccountPage />} />
            <Route path="403" element={<Forbidden />} />
            <Route path="*" element={<NotFound />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </>
  )
}

export default App
