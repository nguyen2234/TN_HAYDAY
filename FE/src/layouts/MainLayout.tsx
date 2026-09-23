import React from 'react'
import { Outlet } from 'react-router-dom'
import { Header } from '~components/Header'
import styles from './MainLayout.module.scss'

export const MainLayout: React.FC = () => {
  return (
    <div className={styles.shell}>
      <Header />
      <main className={styles.main}>
        <Outlet />
      </main>

      <footer className={styles.footer}>
        <div className={styles.footerInner}>
          <p className={styles.footerBrand}>
            TN_<span>HAYDAY</span>
          </p>
          <p className={styles.footerNote}>
            &copy; {new Date().getFullYear()} TN_HAYDAY — Nền tảng đọc truyện tranh trực tuyến.
          </p>
        </div>
      </footer>
    </div>
  )
}
