import React, { useState } from 'react'
import {
  Alert,
  Box,
  Button,
  Checkbox,
  Container,
  FormControlLabel,
  Link,
  Paper,
  Stack,
  TextField,
  Typography,
} from '@mui/material'
import { Helmet } from 'react-helmet-async'
import { Link as RouterLink } from 'react-router-dom'
import { AUTH_ROUTE_LOGIN } from './constants'

const MIN_PASSWORD_LEN = 8

export const Register: React.FC = () => {
  const [notice, setNotice] = useState<string | null>(null)
  const [fieldError, setFieldError] = useState<string | null>(null)

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setFieldError(null)
    const fd = new FormData(e.currentTarget)
    const displayName = String(fd.get('displayName') ?? '').trim()
    const email = String(fd.get('email') ?? '').trim()
    const password = String(fd.get('password') ?? '')
    const confirm = String(fd.get('confirmPassword') ?? '')
    const agree = fd.get('agree') === 'on'
    if (!email || !password) return
    if (password.length < MIN_PASSWORD_LEN) {
      setFieldError(`Mật khẩu cần ít nhất ${MIN_PASSWORD_LEN} ký tự.`)
      return
    }
    if (password !== confirm) {
      setFieldError('Mật khẩu xác nhận không khớp.')
      return
    }
    if (!agree) {
      setFieldError('Vui lòng đồng ý điều khoản sử dụng.')
      return
    }
    setNotice(
      `Yêu cầu đăng ký cho "${displayName || email}" đã được ghi nhận trên giao diện. Backend chưa kết nối.`,
    )
  }

  return (
    <>
      <Helmet>
        <title>Đăng ký - TN_HAYDAY</title>
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
            Tạo tài khoản để lưu truyện theo dõi và tham gia cộng đồng (khi có API).
          </Typography>
          <Typography variant="h6" sx={{ fontWeight: 800, mb: 2 }}>
            Đăng ký
          </Typography>

          {notice ? (
            <Alert severity="warning" onClose={() => setNotice(null)} sx={{ mb: 2 }}>
              {notice}
            </Alert>
          ) : null}
          {fieldError && !notice ? (
            <Alert severity="error" sx={{ mb: 2 }}>
              {fieldError}
            </Alert>
          ) : null}

          <Stack component="form" spacing={2.5} onSubmit={handleSubmit} noValidate>
            <TextField name="displayName" label="Tên hiển thị (tuỳ chọn)" autoComplete="nickname" placeholder="Bạn đọc truyện" fullWidth />
            <TextField name="email" type="email" label="Email" autoComplete="email" placeholder="you@example.com" required fullWidth />
            <TextField
              name="password"
              type="password"
              label="Mật khẩu"
              autoComplete="new-password"
              placeholder={`Tối thiểu ${MIN_PASSWORD_LEN} ký tự`}
              required
              fullWidth
              slotProps={{ htmlInput: { minLength: MIN_PASSWORD_LEN } }}
            />
            <TextField
              name="confirmPassword"
              type="password"
              label="Nhập lại mật khẩu"
              autoComplete="new-password"
              placeholder="••••••••"
              required
              fullWidth
              slotProps={{ htmlInput: { minLength: MIN_PASSWORD_LEN } }}
            />
            <FormControlLabel
              control={<Checkbox name="agree" />}
              label={
                <Typography variant="body2" color="text.secondary">
                  Tôi đồng ý với{' '}
                  <Link component={RouterLink} to="/">
                    điều khoản sử dụng
                  </Link>{' '}
                  của TN_HAYDAY.
                </Typography>
              }
            />
            <Button type="submit" variant="contained" color="primary" size="large" fullWidth>
              Đăng ký
            </Button>
          </Stack>

          <Typography color="text.secondary" sx={{ mt: 3, textAlign: 'center' }}>
            Đã có tài khoản?{' '}
            <Link component={RouterLink} to={AUTH_ROUTE_LOGIN} sx={{ fontWeight: 700 }}>
              Đăng nhập
            </Link>
          </Typography>
        </Paper>
      </Container>
    </>
  )
}
