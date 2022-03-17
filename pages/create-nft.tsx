import { useState } from "react";
import { ethers } from "ethers";
import { create as ipfsHttpClient } from "ipfs-http-client";
import { useRouter } from "next/router";
import Web3Modal from "web3modal";
import Image from "next/image";

import Button from "@mui/material/Button";
import Box from "@mui/material/Box";
import CardActions from "@mui/material/CardActions";
import CardContent from "@mui/material/CardContent";
import Card from "@mui/material/Card";
import Stack from "@mui/material/Stack";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";
import FormControl from "@mui/material/FormControl";
import InputLabel from "@mui/material/InputLabel";
import FilledInput from "@mui/material/FilledInput";
import InputAdornment from "@mui/material/InputAdornment";
import EtheriumIcon from "../components/EtheriumIcon";

const projectId = process.env.NEXT_PUBLIC_INFURA_IPFS_PROJECT_ID;
const projectSecret = process.env.NEXT_PUBLIC_INFURA_IPFS_PROJECT_SECRET;
const projectIdAndSecret = `${projectId}:${projectSecret}`;

const client = ipfsHttpClient({
  host: "ipfs.infura.io",
  port: 5001,
  protocol: "https",
  headers: {
    authorization: `Basic ${Buffer.from(projectIdAndSecret).toString(
      "base64"
    )}`,
  },
});

import { marketplaceAddress } from "../config";

import NFTMarketplace from "../artifacts/contracts/NFTMarketplace.sol/NFTMarketplace.json";

export default function CreateItem() {
  const [fileUrl, setFileUrl] = useState(null);
  const [formInput, updateFormInput] = useState({
    price: "",
    name: "",
    description: "",
  });
  const router = useRouter();

  async function onChange(e) {
    console.log(projectId);
    const file = e.target.files[0];
    try {
      const added = await client.add(file, {
        progress: (prog) => console.log(`received: ${prog}`),
      });
      const url = `https://ipfs.infura.io/ipfs/${added.path}`;
      setFileUrl(url);
    } catch (error) {
      console.log("Error uploading file: ", error);
    }
  }
  async function uploadToIPFS() {
    const { name, description, price } = formInput;
    if (!name || !description || !price || !fileUrl) return;
    /* first, upload to IPFS */
    const data = JSON.stringify({
      name,
      description,
      image: fileUrl,
    });
    try {
      const added = await client.add(data);
      const url = `https://ipfs.infura.io/ipfs/${added.path}`;
      /* after file is uploaded to IPFS, return the URL to use it in the transaction */
      return url;
    } catch (error) {
      console.log("Error uploading file: ", error);
    }
  }

  async function listNFTForSale() {
    const url = await uploadToIPFS();
    const web3Modal = new Web3Modal();
    const connection = await web3Modal.connect();
    const provider = new ethers.providers.Web3Provider(connection);
    const signer = provider.getSigner();

    /* next, create the item */
    const price = ethers.utils.parseUnits(formInput.price, "ether");
    let contract = new ethers.Contract(
      marketplaceAddress,
      NFTMarketplace.abi,
      signer
    );
    let listingPrice = await contract.getListingPrice();
    listingPrice = listingPrice.toString();
    let transaction = await contract.createToken(url, price, {
      value: listingPrice,
    });
    await transaction.wait();

    router.push("/");
  }

  return (
    <Stack
      sx={{
        justifyContent: "center",
        alignItems: "center",
        width: "100%",
        mt: 4,
      }}
    >
      <Card sx={{ width: 600 }}>
        <CardContent>
          <Stack spacing={2}>
            <Typography align="center" variant="h6">
              Please enter NFT details below.
            </Typography>
            <TextField
              id="nft-name"
              label="NFT name"
              variant="filled"
              onChange={(e) =>
                updateFormInput({ ...formInput, name: e.target.value })
              }
            />
            <TextField
              id="nft-description"
              label="NFT Description"
              variant="filled"
              multiline
              rows={4}
              onChange={(e) =>
                updateFormInput({ ...formInput, description: e.target.value })
              }
            />

            <FormControl fullWidth sx={{ m: 1 }} variant="filled">
              <InputLabel htmlFor="filled-adornment-amount">Amount</InputLabel>
              <FilledInput
                id="filled-adornment-amount"
                startAdornment={
                  <InputAdornment position="start">
                    <EtheriumIcon />
                  </InputAdornment>
                }
                onChange={(e) =>
                  updateFormInput({ ...formInput, price: e.target.value })
                }
              />
            </FormControl>

            {fileUrl ? (
              <Stack
                sx={{ mt: 4, justifyContent: "center", alignItems: "center" }}
              >
                <Box>
                  <Image
                    width="150"
                    src={fileUrl}
                    alt=""
                    height="150"
                    objectFit="contain"
                  />
                </Box>
                <Box>
                  <Button
                    size="small"
                    color="error"
                    onClick={() => setFileUrl(null)}
                  >
                    Clear image
                  </Button>
                </Box>
              </Stack>
            ) : (
              <Button variant="outlined" component="label" size="small">
                Upload File
                <input
                  type="file"
                  name="Asset"
                  className="my-4"
                  onChange={onChange}
                  hidden
                />
              </Button>
            )}
            <Button
              variant="contained"
              color="success"
              onClick={listNFTForSale}
            >
              Create NFT
            </Button>
          </Stack>
        </CardContent>
      </Card>
    </Stack>
  );
}
