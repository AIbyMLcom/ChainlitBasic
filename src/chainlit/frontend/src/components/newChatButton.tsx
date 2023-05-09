import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import useClearChat from 'hooks/clearChat';
import AddIcon from '@mui/icons-material/Add';
import { Box, useTheme } from '@mui/material';
import AccentButton from 'components/accentButton';
import RegularButton from 'components/button';

export default function NewChatButton() {
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const clearChat = useClearChat();
  const theme = useTheme();

  const handleClickOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

  const handleConfirm = () => {
    clearChat();
    navigate('/');
    handleClose();
  };

  return (
    <Box>
      <AccentButton
        variant="outlined"
        onClick={handleClickOpen}
        startIcon={<AddIcon />}
      >
        New Chat
      </AccentButton>
      <Dialog
        open={open}
        onClose={handleClose}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
        PaperProps={{
          sx: {
            backgroundImage: 'none'
          }
        }}
      >
        <DialogTitle id="alert-dialog-title">
          {'Create a new chat?'}
        </DialogTitle>
        <DialogContent>
          <DialogContentText id="alert-dialog-description">
            This will clear the current messages and start a new chat.
          </DialogContentText>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <RegularButton onClick={handleClose}>Cancel</RegularButton>
          <AccentButton variant="outlined" onClick={handleConfirm} autoFocus>
            Confirm
          </AccentButton>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
