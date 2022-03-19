import React, { createContext, Dispatch, useEffect, useReducer } from "react";
import { reducer, initialState, State, Action } from "./reducer";
import Web3Modal from "web3modal";
import { ethers } from "ethers";
import LoadingButton from "@mui/lab/LoadingButton";
import Stack from "@mui/material/Stack";
import Container from "@mui/material/Container";
import Box from "@mui/material/Box";
import Snackbar from "@mui/material/Snackbar";
import Alert from "@mui/material/Alert";

export const Web3Context = createContext<{
  state: State;
  dispatch: Dispatch<Action>;
}>({
  state: initialState,
  dispatch: () => null,
});

export const Web3Provider = ({ children }) => {
  const [state, dispatch] = useReducer(reducer, initialState);

  async function connectWallet() {
    dispatch({ type: "setLoading", loading: true });
    try {
      const web3Modal = new Web3Modal();
      const connection = await web3Modal.connect();
      const provider = new ethers.providers.Web3Provider(connection);

      dispatch({ type: "setProvider", provider });
    } catch (error) {
      console.log(error);
      dispatch({ type: "setError", error: error.message });
    }
  }

  function handleClose() {
    dispatch({ type: "clearError" });
  }

  useEffect(() => {
    connectWallet();
  }, []);

  return (
    <Web3Context.Provider value={{ state, dispatch }}>
      {state.data.provider ? (
        children
      ) : (
        <Container maxWidth="xl">
          <Snackbar
            open={!!state.error}
            autoHideDuration={6000}
            onClose={handleClose}
          >
            <Alert
              onClose={handleClose}
              severity="error"
              sx={{ width: "100%" }}
            >
              {state.error}
            </Alert>
          </Snackbar>
          <Stack
            height="90vh"
            direction="column"
            justifyContent="center"
            alignItems="center"
          >
            <Box width={190}>
              <LoadingButton
                loading={state.isLoading}
                variant="contained"
                color={"secondary"}
                onClick={connectWallet}
              >
                Connect Wallet :)
              </LoadingButton>
            </Box>
          </Stack>
        </Container>
      )}
    </Web3Context.Provider>
  );
};
