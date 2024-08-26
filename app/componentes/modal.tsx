import React from 'react';
import { Modal, Box, Typography, Button, useTheme } from '@mui/material';

interface CustomModalProps {
    open: boolean;
    handleClose: () => void;
    title: string;
    message: string;
    isSuccess: boolean;
}

export default function CustomModal({ open, handleClose, title, message, isSuccess }: CustomModalProps) {
    const theme = useTheme(); // Hook do Material-UI para acessar o tema atual

    return (
        <Modal
            open={open}
            onClose={handleClose}
            aria-labelledby="modal-title"
            aria-describedby="modal-description"
        >
            <Box
                sx={{
                    position: 'absolute',
                    top: '50%',
                    left: '50%',
                    transform: 'translate(-50%, -50%)',
                    width: 300,
                    bgcolor: theme.palette.background.paper,
                    borderRadius: 2,
                    boxShadow: 24,
                    p: 3,
                    textAlign: 'center',
                    border: isSuccess 
                        ? `2px solid ${theme.palette.primary.main}` 
                        : `2px solid ${theme.palette.error.main}`,
                }}
            >
                <Typography
                    id="modal-title"
                    variant="h6"
                    component="h2"
                    sx={{ color: isSuccess ? theme.palette.primary.main : theme.palette.error.main }}
                >
                    {title}
                </Typography>
                <Typography id="modal-description" sx={{ mt: 2, color: theme.palette.text.primary }}>
                    {message}
                </Typography>
                <Button
                    variant="contained"
                    onClick={handleClose}
                    sx={{ 
                        mt: 3, 
                        bgcolor: isSuccess ? theme.palette.primary.main : theme.palette.error.main,
                        '&:hover': {
                            bgcolor: isSuccess 
                                ? theme.palette.primary.dark 
                                : theme.palette.error.dark,
                        },
                    }}
                >
                    Fechar
                </Button>
            </Box>
        </Modal>
    );
}

