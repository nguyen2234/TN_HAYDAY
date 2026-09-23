import React, { useState } from 'react'
import { Alert, Box, Button, Checkbox, Container, FormControlLabel, Link, Paper, Stack, TextField, Typography } from '@mui/material'
import { Helmet } from 'react-helmet-async'
import { Link as RouterLink } from 'react-router-dom'
import { AUTH_ROUTE_REGISTER } from './constants'

export const Login: React.FC = () => {
  const [notice, setNotice] = useState<string | null>(null)

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const fd = new FormData(e.currentTarget)
    const email = String(fd.get('email') ?? '').trim()
    const password = String(fd.get('password') ?? '')
    if (!email || !password) return
    setNotice('Backend đăng nhập chưa được kết nối. Đây là giao diện chuẩn bị cho API.')
  }

  return (
    <>
      <Helmet>
        <title>Đăng nhập - TN_HAYDAY</title>
      </Helmet>

      <Container maxWidth="sm" sx={{ py: 4 }}>
        <Paper elevation={0} sx={{ p: { xs: 2, sm: 4 }, border: 1, borderColor: 'divider', borderRadius: 2 }}>
          <Box component={RouterLink} to="/" sx={{ textAlign: 'center', textDecoration: 'none', color: 'inherit', display: 'block', mb: 1 }}>
            <Typography variant="h5" sx={{ fontWeight: 800 }}>
              TN_
              <Box component="span" sx={{ color: 'primary.main' }}>
                HAYDAY
              </Box>
            </Typography>
          </Box>
          <Typography color="text.secondary" sx={{ mb: 3, textAlign: 'center' }}>
            Đăng nhập để đồng bộ theo dõi và bình luận (khi có API).
          </Typography>
          <Typography variant="h6" sx={{ fontWeight: 800, mb: 2 }}>
            Đăng nhập
          </Typography>

          {notice ? (
            <Alert severity="warning" onClose={() => setNotice(null)} sx={{ mb: 2 }}>
              {notice}
            </Alert>
          ) : null}

          <Stack component="form" spacing={2.5} onSubmit={handleSubmit} noValidate>
            <TextField name="email" type="email" label="Email" autoComplete="email" placeholder="you@example.com" required fullWidth />
            <TextField
              name="password"
              type="password"
              label="Mật khẩu"
              autoComplete="current-password"
              placeholder="••••••••"
              required
              fullWidth
            />
            <FormControlLabel control={<Checkbox name="remember" />} label="Ghi nhớ đăng nhập" />
            <Button type="submit" variant="contained" color="primary" size="large" fullWidth>
              Đăng nhập
            </Button>
          </Stack>

          <Typography color="text.secondary" sx={{ mt: 3, textAlign: 'center' }}>
            Chưa có tài khoản?{' '}
            <Link component={RouterLink} to={AUTH_ROUTE_REGISTER} sx={{ fontWeight: 700 }}>
              Đăng ký
            </Link>
          </Typography>
        </Paper>
      </Container>
    </>
  )
}
