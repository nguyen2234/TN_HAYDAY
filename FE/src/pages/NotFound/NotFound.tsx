import React from 'react'
import { Box, Button, Container, Typography } from '@mui/material'
import { Helmet } from 'react-helmet-async'
import { useNavigate } from 'react-router-dom'

export const NotFound: React.FC = () => {
  const navigate = useNavigate()

  return (
    <>
      <Helmet>
        <title>404 - Không tìm thấy trang</title>
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
              color: 'primary.main',
              textShadow: theme => `0 4px 24px ${theme.palette.primary.main}55`,
              lineHeight: 1,
              mb: 1,
            }}
          >
            404
          </Typography>
          <Typography variant="h5" component="h2" sx={{ fontWeight: 700, mb: 2 }}>
            Ối! Trang này không tồn tại.
          </Typography>
          <Typography color="text.secondary" sx={{ maxWidth: 500, mb: 4 }}>
            Có vẻ như bạn đã đi lạc vào một không gian rạn nứt. Trang bạn đang tìm kiếm đã bị dịch chuyển hoặc chưa
            từng tồn tại.
          </Typography>
          <Button variant="contained" color="primary" size="large" onClick={() => navigate('/')} sx={{ borderRadius: 999, px: 4 }}>
            Trở về trang chủ
          </Button>
        </Box>
      </Container>
    </>
  )
}
