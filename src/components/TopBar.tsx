import icon from "../assets/icon.svg";
import React, { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import github from "../assets/github-dark.svg";
import { AddressInput } from "../components/AddressInput";
import { CenteringBox } from "./Common.styled";
import { githubLink } from "../const";
import {
  AppLogo,
  ContentColumn,
  GitLogo,
  LinkWrapper,
  SearchWrapper,
  TopBarContent,
  TopBarHeading,
  TopBarWrapper,
} from "./TopBar.styled";
import { IconButton, styled, useMediaQuery, useTheme } from "@mui/material";
import MenuRoundedIcon from "@mui/icons-material/MenuRounded";
import { MobileMenu } from "./MobileMenu";
import { useNavigatePreserveQuery } from "../lib/useNavigatePreserveQuery";
import { StyledTonConnectButton } from "../styles";
import ThemeToggle from "./icon/ThemeToggle";
import { usePage } from "../contexts/ThemeProvider";

export function TopBar() {
  const { pathname } = useLocation();

  const theme = useTheme();
  const navigate = useNavigatePreserveQuery();
  const headerSpacings = useMediaQuery(theme.breakpoints.down("lg"));
  const isSmallScreen = useMediaQuery(theme.breakpoints.down("md"));
  const [showExpanded, setShowExpanded] = useState(pathname.length === 1);
  const [showMenu, setShowMenu] = useState(false);

  useEffect(() => {
    setShowExpanded(pathname.length === 1);
  }, [pathname]);

  const { pageTheme, switchTheme } = usePage();
  const handleSwitchTheme = (event: { preventDefault: () => void }) => {
    event.preventDefault();
    switchTheme();
  };

  const isThemeDark = pageTheme === "dark";

  return (
    <TopBarWrapper
      px={headerSpacings ? 2.4 : 0}
      isMobile={isSmallScreen}
      showExpanded={showExpanded}>
      {isSmallScreen && (
        <IconButton
          sx={{ width: 35, height: 35, marginRight: 2.4 }}
          onClick={() => setShowMenu(true)}>
          <MenuRoundedIcon sx={{ width: 35, height: 35 }} />
        </IconButton>
      )}
      {!isSmallScreen && (
        <TopBarContent mb={5}>
          <LinkWrapper onClick={() => navigate("/")}>
            <img src={icon} width={30} height={30} alt="App icon" />
            <AppLogo>TON VERIFIER</AppLogo>
          </LinkWrapper>
          <ContentColumn>
            <CenteringBox mr={2}>
              <StyledTonConnectButton />
            </CenteringBox>
            <LinkWrapper href={githubLink} target="_blank">
              <img src={github} alt="Github icon" width={20} height={20} />
              <GitLogo>GitHub</GitLogo>
            </LinkWrapper>
            <Link
              className="contrast"
              onClick={handleSwitchTheme}
              aria-label={isThemeDark ? "Turn off dark mode" : "Turn on dark mode"}
              to={""}>
              <ThemeToggle isDark={isThemeDark} className="w-6 h-6" />
            </Link>
          </ContentColumn>
        </TopBarContent>
      )}
      {pathname.length < 2 && !isSmallScreen && (
        <TopBarHeading>Smart Contract Verifier</TopBarHeading>
      )}
      <SearchWrapper>
        <AddressInput />
      </SearchWrapper>
      <MobileMenu closeMenu={() => setShowMenu(false)} showMenu={showMenu} />
    </TopBarWrapper>
  );
}
