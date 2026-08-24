import React, { useMemo, useState } from "react";
import { createRoot } from "react-dom/client";
import {
  ThemeProvider,
  CssBaseline,
  Box,
  AppBar,
  Toolbar,
  IconButton,
  Avatar,
  Typography,
  InputBase,
  Drawer,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Collapse,
  Divider,
  Breadcrumbs,
  Stack,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  useMediaQuery,
} from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import HomeIcon from "@mui/icons-material/Home";
import SearchIcon from "@mui/icons-material/Search";
import Brightness4Icon from "@mui/icons-material/Brightness4";
import Brightness7Icon from "@mui/icons-material/Brightness7";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import handbook from "./data/handbook.json";
import { buildTheme } from "./theme.js";

const icons = ["⚡", "⚛", "▣", "◉", "⬢", "⌁", "🔐", "🏗", "🚀", "🧠", "💬", "⌘", "📅"];
const DRAWER_WIDTH = 290;
const stripPartPrefix = (t) => t.replace(/^PART\s+[IVXLCDM]+\s+—\s*/i, "");
const stripSectionPrefix = (t) => t.replace(/^\d+\.\s*/, "").replace(/^[A-Z]\.\s*/, "");

function App() {
  const [selectedPart, setSelectedPart] = useState(handbook.parts[0]?.title || "");
  const [selectedSection, setSelectedSection] = useState("");
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(null);
  const [mode, setMode] = useState("dark");
  const [mobileOpen, setMobileOpen] = useState(false);

  const theme = useMemo(() => buildTheme(mode), [mode]);
  const isDesktop = useMediaQuery(theme.breakpoints.up("md"));

  const part = handbook.parts.find((p) => p.title === selectedPart) || handbook.parts[0];
  const sections = part?.sections || [];
  const activeSection = selectedSection
    ? sections.find((s) => s.title === selectedSection)
    : sections[0];

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    const list = activeSection?.questions || [];
    if (!q) return list;
    return list.filter((item) =>
      `${item.id} ${item.question} ${item.answer} ${item.code}`.toLowerCase().includes(q)
    );
  }, [activeSection, query]);

  const selectPart = (title) => {
    setSelectedPart(title);
    const next = handbook.parts.find((p) => p.title === title);
    setSelectedSection(next?.sections?.[0]?.title || "");
    setOpen(null);
    if (!isDesktop) setMobileOpen(false);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const selectSection = (title) => {
    setSelectedSection(title);
    setOpen(null);
    if (!isDesktop) setMobileOpen(false);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const goHome = () => {
    setSelectedPart(handbook.parts[0]?.title);
    setSelectedSection("");
    setQuery("");
    if (!isDesktop) setMobileOpen(false);
  };

  const drawerContent = (
    <Box sx={{ display: "flex", flexDirection: "column", height: "100%", px: 1.5, py: 2.5 }}>
      <Typography
        variant="overline"
        sx={{ color: "text.secondary", fontWeight: 800, letterSpacing: ".15em", px: 1.25, pb: 1 }}
      >
        Handbook
      </Typography>
      <ListItemButton onClick={goHome} sx={{ borderRadius: 2, mb: 1 }}>
        <ListItemIcon sx={{ minWidth: 30 }}>
          <HomeIcon fontSize="small" />
        </ListItemIcon>
        <ListItemText primary="Overview" />
      </ListItemButton>

      <List sx={{ flexGrow: 1, overflowY: "auto" }} disablePadding>
        {handbook.parts.map((p, i) => {
          const isActive = selectedPart === p.title;
          return (
            <Box key={p.title}>
              <ListItemButton
                onClick={() => selectPart(p.title)}
                selected={isActive}
                sx={{
                  borderRadius: 2,
                  mb: 0.5,
                  "&.Mui-selected": {
                    bgcolor: (t) =>
                      t.palette.mode === "dark"
                        ? "rgba(110,168,255,.15)"
                        : "rgba(53,111,230,.1)",
                  },
                }}
              >
                <ListItemIcon sx={{ minWidth: 28, fontSize: 15 }}>
                  {icons[i % icons.length]}
                </ListItemIcon>
                <ListItemText
                  slotProps={{ primary: { sx: { fontSize: 13, fontWeight: isActive ? 700 : 500 } } }}
                  primary={stripPartPrefix(p.title)}
                />
                {isActive ? (
                  <ExpandMoreIcon fontSize="small" sx={{ color: "text.secondary" }} />
                ) : (
                  <ChevronRightIcon fontSize="small" sx={{ color: "text.secondary" }} />
                )}
              </ListItemButton>
              <Collapse in={isActive} timeout="auto" unmountOnExit>
                <List disablePadding sx={{ pl: 2, borderLeft: 1, borderColor: "divider", ml: 2 }}>
                  {p.sections.map((s) => {
                    const isSelected =
                      selectedSection === s.title || (!selectedSection && s === p.sections[0]);
                    return (
                      <ListItemButton
                        key={s.title}
                        onClick={() => selectSection(s.title)}
                        selected={isSelected}
                        sx={{
                          borderRadius: 1,
                          py: 0.6,
                          "&.Mui-selected": {
                            color: "primary.main",
                            bgcolor: (t) =>
                              t.palette.mode === "dark"
                                ? "rgba(110,168,255,.06)"
                                : "rgba(53,111,230,.06)",
                          },
                        }}
                      >
                        <ListItemText
                          slotProps={{ primary: { sx: { fontSize: 12, lineHeight: 1.35 } } }}
                          primary={stripSectionPrefix(s.title)}
                        />
                      </ListItemButton>
                    );
                  })}
                </List>
              </Collapse>
            </Box>
          );
        })}
      </List>

      <Divider sx={{ my: 1.5 }} />
      <Typography variant="caption" sx={{ color: "text.secondary", px: 1 }}>
        Built from the handbook by <b>Abhijit Gawankar</b>
      </Typography>
    </Box>
  );

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Box sx={{ display: "flex", minHeight: "100vh", bgcolor: "background.default" }}>
        <AppBar position="fixed" elevation={0} sx={{ zIndex: (t) => t.zIndex.drawer + 1 }}>
          <Toolbar sx={{ gap: { xs: 1, sm: 1.5 }, px: { xs: 1.5, sm: 3 } }}>
            <IconButton
              edge="start"
              onClick={() => setMobileOpen((v) => !v)}
              sx={{ display: { md: "none" }, color: "text.primary" }}
            >
              <MenuIcon />
            </IconButton>

            <Avatar
              sx={{
                width: 36,
                height: 36,
                fontWeight: 800,
                fontSize: 14,
                background: "linear-gradient(135deg, #6ea8ff, #8b7cff)",
              }}
            >
              AG
            </Avatar>

            <Box sx={{ minWidth: 0, display: { xs: "none", sm: "block" } }}>
              <Typography
                noWrap
                sx={{ fontWeight: 750, fontSize: { sm: 14, md: 15 }, lineHeight: 1.2 }}
              >
                Frontend Interview Handbook
              </Typography>
              <Typography
                noWrap
                variant="caption"
                sx={{ color: "text.secondary", display: { xs: "none", md: "block" } }}
              >
                Complete Prep Guide
              </Typography>
            </Box>

            <Box sx={{ flexGrow: 1 }} />

            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                gap: 1,
                height: 40,
                width: { xs: 150, sm: 220, md: 300, lg: 330 },
                border: 1,
                borderColor: "divider",
                borderRadius: 2.5,
                px: 1.25,
                bgcolor: "background.paper",
              }}
            >
              <SearchIcon fontSize="small" sx={{ color: "text.secondary" }} />
              <InputBase
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search questions..."
                sx={{ flex: 1, fontSize: 14, color: "text.primary" }}
              />
            </Box>

            <IconButton
              onClick={() => setMode((m) => (m === "dark" ? "light" : "dark"))}
              sx={{ border: 1, borderColor: "divider", borderRadius: 2.5, color: "text.primary" }}
            >
              {mode === "dark" ? <Brightness7Icon fontSize="small" /> : <Brightness4Icon fontSize="small" />}
            </IconButton>
          </Toolbar>
        </AppBar>

        <Box component="nav" sx={{ width: { md: DRAWER_WIDTH }, flexShrink: { md: 0 } }}>
          <Drawer
            variant={isDesktop ? "permanent" : "temporary"}
            open={isDesktop ? true : mobileOpen}
            onClose={() => setMobileOpen(false)}
            ModalProps={{ keepMounted: true }}
            sx={{
              "& .MuiDrawer-paper": {
                width: DRAWER_WIDTH,
                boxSizing: "border-box",
                top: isDesktop ? 64 : 0,
                height: isDesktop ? "calc(100% - 64px)" : "100%",
              },
            }}
          >
            {drawerContent}
          </Drawer>
        </Box>

        <Box
          component="main"
          sx={{
            flexGrow: 1,
            minWidth: 0,
            width: { md: `calc(100% - ${DRAWER_WIDTH}px)` },
            pt: "64px",
          }}
        >
          <Box sx={{ maxWidth: 1000, mx: "auto", px: { xs: 2, sm: 3, md: 4 }, py: { xs: 2.5, sm: 4 } }}>
            <Breadcrumbs sx={{ fontSize: 12, color: "text.secondary", mb: 2.5 }}>
              <Typography variant="caption" color="text.secondary">
                Handbook
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {stripPartPrefix(selectedPart)}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {activeSection?.title || "Overview"}
              </Typography>
            </Breadcrumbs>

            <Box sx={{ mb: 2 }}>
              <Typography variant="h5" sx={{ fontWeight: 750, fontSize: { xs: 19, sm: 21 } }}>
                {activeSection?.title || "Questions"}
              </Typography>
              <Typography variant="caption" sx={{ color: "text.secondary" }}>
                {filtered.length} questions shown{query ? ` for "${query}"` : ""}
              </Typography>
            </Box>

            <Box>
              {filtered.map((item) => (
                <Accordion
                  key={item.id}
                  disableGutters
                  elevation={0}
                  expanded={open === item.id}
                  onChange={() => setOpen(open === item.id ? null : item.id)}
                  sx={{ borderRadius: 2.5, mb: 1, "&:before": { display: "none" }, overflow: "hidden" }}
                >
                  <AccordionSummary
                    expandIcon={<ExpandMoreIcon sx={{ color: "text.secondary" }} />}
                    sx={{ minHeight: 62, px: { xs: 1.5, sm: 2 } }}
                  >
                      <Stack direction="row" spacing={1.5} sx={{ width: "100%", alignItems: "center" }}>
                        <Typography sx={{ fontSize: 11, fontWeight: 800, color: "primary.main", minWidth: 34 }}>
                          {item.id}
                        </Typography>
                        <Typography sx={{ fontSize: 14, fontWeight: 650, flexGrow: 1 }}>
                          {item.question}
                        </Typography>
                      </Stack>
                    </AccordionSummary>
                    <AccordionDetails sx={{ px: { xs: 2, sm: 3.5 }, pb: 2.5, pt: 0 }}>
                    <Typography
                      variant="overline"
                      sx={{ fontSize: 9, letterSpacing: ".15em", color: "primary.main", fontWeight: 800 }}
                    >
                      Answer
                    </Typography>
                    <Typography
                      sx={{ whiteSpace: "pre-line", color: "text.secondary", fontSize: 14, lineHeight: 1.75, mb: item.code ? 1.5 : 1 }}
                    >
                      {item.answer}
                    </Typography>
                    {item.code && (
                      <Box
                        component="pre"
                        sx={{
                          m: 0,
                          mb: 1.5,
                          p: 2,
                          border: 1,
                          borderColor: "divider",
                          borderRadius: 2,
                          bgcolor: (t) => t.custom.code,
                          color: "#dbe7ff",
                          fontSize: 12,
                          lineHeight: 1.6,
                          overflow: "auto",
                        }}
                      >
                        <code>{item.code}</code>
                      </Box>
                    )}
                    <Stack
                      direction="row"
                      spacing={1}
                      sx={{ alignItems: "center", fontSize: 11, borderTop: 1, borderColor: "divider", pt: 1.5, color: "text.secondary" }}
                    >
                      <Typography variant="caption" sx={{ color: "primary.main", fontWeight: 700 }}>
                        Interview tip
                      </Typography>
                      <Typography variant="caption">
                        Explain the "why", not only the definition.
                      </Typography>
                    </Stack>
                  </AccordionDetails>
                </Accordion>
              ))}
              {filtered.length === 0 && (
                <Box
                  sx={{
                    p: 6,
                    textAlign: "center",
                    color: "text.secondary",
                    border: "1px dashed",
                    borderColor: "divider",
                    borderRadius: 3,
                  }}
                >
                  No questions match your search in this section.
                </Box>
              )}
            </Box>
          </Box>
        </Box>
      </Box>
    </ThemeProvider>
  );
}

createRoot(document.getElementById("root")).render(<App />);
