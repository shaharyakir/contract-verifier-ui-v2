import { styled } from "@mui/material/styles";
import { Box, Link } from "@mui/material";
import { contentMaxWidth } from "../const";
import { CenteringBox } from "./Common.styled";

const expandedHeaderHeight = 250;
const headerHeight = 188;

interface TopBarWrapperProps {
  showExpanded: boolean;
  isMobile: boolean;
}

const TopBarWrapper = styled(Box)(({ theme }) => (props: TopBarWrapperProps) => ({
  display: props.isMobile ? "flex" : "inherit",
  alignItems: props.isMobile ? "center" : "inherit",
  fontWeight: 700,
  minHeight: props.isMobile ? 80 : headerHeight,
  height:
    props.showExpanded && !props.isMobile
      ? expandedHeaderHeight
      : props.isMobile
        ? 80
        : headerHeight,
  background: theme.palette.mode === "dark" ? theme.palette.background.default : "#fff",
  borderBottomLeftRadius: theme.spacing(6),
  borderBottomRightRadius: theme.spacing(6),
  border:
    theme.palette.mode === "dark"
      ? `0.5px solid ${theme.palette.divider}`
      : "0.5px solid rgba(114, 138, 150, 0.24)",
  boxShadow:
    theme.palette.mode === "dark"
      ? `${theme.palette.background.paper} 0px 2px 16px`
      : "rgb(114 138 150 / 8%) 0px 2px 16px",
}));

const ContentColumn = styled(CenteringBox)(() => ({
  gap: 10,
}));

const LinkWrapper = styled(Link)(({ theme }) => ({
  display: "flex",
  alignItems: "center",
  gap: 10,
  color: theme.palette.mode === "dark" ? theme.palette.text.primary : "#000",
  textDecoration: "none",
  cursor: "pointer",
}));

const TopBarContent = styled(CenteringBox)(({ theme }) => ({
  margin: "auto",
  maxWidth: contentMaxWidth,
  height: 100,
  width: "100%",
  justifyContent: "space-between",
  gap: 10,
}));

const AppLogo = styled("h4")(({ theme }) => ({
  color: theme.palette.mode === "dark" ? theme.palette.text.primary : "#000",
  fontSize: 20,
  fontWeight: 800,
  [theme.breakpoints.down("sm")]: {
    fontSize: 16,
  },
}));

const GitLogo = styled("h5")(({ theme }) => ({
  color: theme.palette.mode === "dark" ? theme.palette.text.primary : "#000",
  fontWeight: 700,
  fontSize: 18,
}));

const TopBarHeading = styled("h3")(({ theme }) => ({
  color: theme.palette.mode === "dark" ? theme.palette.text.primary : "#000",
  fontSize: 26,
  marginTop: 0,
  textAlign: "center",
  fontWeight: 800,
}));

const SearchWrapper = styled(CenteringBox)({
  margin: "auto",
  maxWidth: contentMaxWidth,
  width: "100%",
});

export {
  SearchWrapper,
  LinkWrapper,
  AppLogo,
  TopBarWrapper,
  TopBarContent,
  TopBarHeading,
  GitLogo,
  ContentColumn,
};
