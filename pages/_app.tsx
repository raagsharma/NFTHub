/* pages/_app.js */
import "@fontsource/roboto/300.css";
import "@fontsource/roboto/400.css";
import "@fontsource/roboto/500.css";
import "@fontsource/roboto/700.css";
import "../styles/globals.css";
import CssBaseline from "@mui/material/CssBaseline";
import { ThemeProvider, createTheme } from "@mui/material";
import ResponsiveAppBar from "../components/ResponsiveAppBar";
import Container from "@mui/material/Container";

import { Web3Provider } from "../contexts/Web3";

function MyApp({ Component, pageProps }) {
  const darkTheme = createTheme({
    palette: {
      mode: "light",
    },
  });

  return (
    <ThemeProvider theme={darkTheme}>
      <CssBaseline />
      <Web3Provider>
        <ResponsiveAppBar />
        <Container maxWidth="xl">
          <Component {...pageProps} />
        </Container>
      </Web3Provider>
    </ThemeProvider>
  );
}

export default MyApp;
