'use client';

import { AppBar, Toolbar, Typography, Button, Box, Container, Grid, Paper } from '@mui/material';

export default function HomePage() {
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', width: '100%' }}>
      {/* Topbar */}
      <AppBar position="static" sx={{ backgroundColor: '#f5f5f5', boxShadow: 'none' }}>
        <Container maxWidth="lg">
          <Toolbar sx={{ justifyContent: 'space-between', padding: '0' }}>
            <Typography variant="h6" color="primary">
              Mais Nfe
            </Typography>
            <Box>
              <Button variant="outlined" color="primary" href="/login" sx={{ marginRight: '10px' }}>
                Login
              </Button>
              <Button variant="contained" color="primary" href="/cadastro">
                Cadastro
              </Button>
            </Box>
          </Toolbar>
        </Container>
      </AppBar>

      {/* Conteúdo Principal */}
      <Container sx={{ marginTop: '40px' }} maxWidth="lg">
        <Grid container spacing={4}>
          <Grid item xs={12}>
            <Paper sx={{ padding: '40px', textAlign: 'center', backgroundColor: '#ffffff' }}>
              <Typography variant="h4" color="primary" gutterBottom>
                Bem-vindo à Mais Nfe
              </Typography>
              <Typography variant="body1" color="textSecondary">
                Sua solução para gerenciamento de notas fiscais eletrônicas.
              </Typography>
            </Paper>
          </Grid>
          <Grid item xs={12} sm={6}>
            <Paper sx={{ padding: '20px', textAlign: 'center', backgroundColor: '#ffffff' }}>
              <Typography variant="h6" color="primary">
                Funcionalidade 1
              </Typography>
              <Typography variant="body2" color="textSecondary">
                Descrição da funcionalidade 1.
              </Typography>
            </Paper>
          </Grid>
          <Grid item xs={12} sm={6}>
            <Paper sx={{ padding: '20px', textAlign: 'center', backgroundColor: '#ffffff' }}>
              <Typography variant="h6" color="primary">
                Funcionalidade 2
              </Typography>
              <Typography variant="body2" color="textSecondary">
                Descrição da funcionalidade 2.
              </Typography>
            </Paper>
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
}

