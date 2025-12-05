// components/Navbar.tsx
import { AppBar, Toolbar, IconButton, Typography } from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";

interface NavbarProps {
  onToggle: () => void;
}

export default function Navbar({ onToggle }: NavbarProps) {
  return (
    <AppBar position="fixed" sx={{ zIndex: 1201 }}>
      <Toolbar>
        <IconButton
          color="inherit"
          edge="start"
          onClick={onToggle}
          sx={{ mr: 2, outline: 'none', boxShadow: 'none', '&:focus': { outline: 'none', boxShadow: 'none' } }}
        >
          <MenuIcon />
        </IconButton>
        <Typography variant="h6" noWrap>
          Despro
        </Typography>
      </Toolbar>
    </AppBar>
  );
}
