import { useState } from 'react';
import { Box, TextField, Button, Typography, Checkbox, FormControlLabel } from '@mui/material';
import { styled } from '@mui/material/styles';

const Logo = styled(Typography)({
  color: '#ffffff',
  fontSize: '36px',
  fontWeight: 'bold',
  marginBottom: '40px',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  gap: '8px',
});

const StyledTextField = styled(TextField)({
  marginBottom: '20px',
  '& .MuiOutlinedInput-root': {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: '4px',
    '& fieldset': {
      borderColor: 'rgba(255, 255, 255, 0.2)',
    },
    '&:hover fieldset': {
      borderColor: 'rgba(255, 255, 255, 0.3)',
    },
    '&.Mui-focused fieldset': {
      borderColor: '#00A4DC',
    },
  },
  '& .MuiInputLabel-root': {
    color: 'rgba(255, 255, 255, 0.7)',
  },
  '& .MuiOutlinedInput-input': {
    color: 'white',
  },
});

const SignInButton = styled(Button)({
  backgroundColor: '#00A4DC',
  color: 'white',
  padding: '12px 0',
  fontSize: '16px',
  fontWeight: 'bold',
  borderRadius: '4px',
  marginBottom: '30px',
  '&:hover': {
    backgroundColor: '#00A4DC',
  },
});

const StyledCheckbox = styled(Checkbox)({
  color: 'rgba(255, 255, 255, 0.5)',
  '&.Mui-checked': {
    color: '#00A4DC',
  },
});

export default function SignInPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);

  return (
    <Box sx={{ 
      minHeight: '100vh',
      backgroundColor: '#2a2a2a',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '20px'
    }}>
      <Box sx={{ width: '100%', maxWidth: '400px', textAlign: 'center' }}>
        <Logo>
          Sajipati
        </Logo>

        <Box>
          <StyledTextField
            fullWidth
            label="Username"
            variant="outlined"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />

          <StyledTextField
            fullWidth
            label="Password"
            type="password"
            variant="outlined"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />

          <Box sx={{ textAlign: 'left', mb: 3 }}>
            <FormControlLabel
              control={
                <StyledCheckbox
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                />
              }
              label={
                <Typography sx={{ color: 'rgba(255, 255, 255, 0.7)', fontSize: '14px' }}>
                  Remember me
                </Typography>
              }
            />
          </Box>

          <SignInButton fullWidth>
            Sign In
          </SignInButton>
        </Box>
      </Box>
    </Box>
  );
}