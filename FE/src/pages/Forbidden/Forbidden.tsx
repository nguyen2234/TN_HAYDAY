import React from 'react'
import { Box, Button, Container, Typography } from '@mui/material'
import { Helmet } from 'react-helmet-async'
import { useNavigate } from 'react-router-dom'

export const Forbidden: React.FC = () => {
  const navigate = useNavigate()

  return (
    <>
      <Helmet>
        <title>403 - Không có quyền truy cập</title>
      </Helmet>
      <Container maxWidth="sm">
        <Box
          sx={{
            minHeight: '60vh',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            textAlign: 'center',
            py: 5,
          }}
        >
          <Typography
            component="h1"
            sx={{
              fontSize: { xs: '4.5rem', sm: '6rem' },
              fontWeight: 800,
              color: 'error.main',
              textShadow: theme => `0 4px 24px ${theme.palette.error.main}55`,
              lineHeight: 1,
              mb: 1,
            }}
          >
            403
          </Typography>
          <Typography variant="h5" component="h2" sx={{ fontWeight: 700, mb: 2 }}>
            Khu vực cấm thuật!
          </Typography>
          <Typography color="text.secondary" sx={{ maxWidth: 500, mb: 4 }}>
            Bạn không có đủ ma lực (quyền) để tiến vào khu vực này. Vui lòng đăng nhập bằng tài khoản có thẩm quyền
            cao hơn.
          </Typography>
          <Button variant="contained" color="error" size="large" onClick={() => navigate('/')} sx={{ borderRadius: 999, px: 4 }}>
            Trở về an toàn
          </Button>
        </Box>
      </Container>
    </>
  )
}
