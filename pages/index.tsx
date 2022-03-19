import { ethers } from "ethers";
import { useEffect, useState } from "react";
import axios from "axios";
import Web3Modal from "web3modal";
import Image from "next/image";

import { marketplaceAddress } from "../config";

import NFTMarketplaceArtifact from "../artifacts/contracts/NFTMarketplace.sol/NFTMarketplace.json";
import { NFTMarketplace } from "../typechain-types";
import Stack from "@mui/material/Stack";
import Grid from "@mui/material/Grid";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Link from "@mui/material/Link";
import ImgMediaCard from "../components/ImgMediaCard";
import LoadingButton from "@mui/lab/LoadingButton";

export default function Home() {
  const [nfts, setNfts] = useState([]);
  const [loadingState, setLoadingState] = useState("not-loaded");
  useEffect(() => {
    loadNFTs();
  }, []);
  async function loadNFTs() {
    setLoadingState("loading");
    /* create a generic provider and query for unsold market items */
    const provider = new ethers.providers.JsonRpcProvider(
      "https://rpc.nfthub.kira.yt/"
    );
    const contract = new ethers.Contract(
      marketplaceAddress,
      NFTMarketplaceArtifact.abi,
      provider
    ) as NFTMarketplace;
    const data = await contract.fetchMarketItems();

    /*
     *  map over items returned from smart contract and format
     *  them as well as fetch their token metadata
     */
    const items = await Promise.all(
      data.map(async (i) => {
        const tokenUri = await contract.tokenURI(i.tokenId);
        const meta = await axios.get(tokenUri);
        const price = ethers.utils.formatUnits(i.price.toString(), "ether");
        const item = {
          price,
          tokenId: i.tokenId.toNumber(),
          seller: i.seller,
          owner: i.owner,
          image: meta.data.image,
          name: meta.data.name,
          description: meta.data.description,
        };
        return item;
      })
    );
    setNfts(items);
    setLoadingState("loaded");
  }
  async function buyNft(nft: NFTMarketplace.MarketItemStruct) {
    /* needs the user to sign the transaction, so will use Web3Provider and sign it */
    const web3Modal = new Web3Modal();
    const connection = await web3Modal.connect();
    const provider = new ethers.providers.Web3Provider(connection);
    const signer = provider.getSigner();
    const contract = new ethers.Contract(
      marketplaceAddress,
      NFTMarketplaceArtifact.abi,
      signer
    ) as NFTMarketplace;

    /* user will be prompted to pay the asking proces to complete the transaction */
    const price = ethers.utils.parseUnits(nft.price.toString(), "ether");
    const transaction = await contract.createMarketSale(nft.tokenId, {
      value: price,
    });
    await transaction.wait();
    loadNFTs();
  }

  if (loadingState === "loading") {
    return (
      <Box>
        <LoadingButton loading size="large" />
      </Box>
    );
  }

  if (loadingState === "loaded" && !nfts.length)
    return (
      <Stack mt={20} spacing={2} justifyContent="center" alignItems="center">
        <Image src="/void.svg" height={300} width={300} alt="void" />
        <Typography>
          There are no NFTs in the marketplace, please create new NFT{" "}
          <Link color="secondary" variant="body1" href="/create-nft">
            here.
          </Link>
        </Typography>
      </Stack>
    );
  return (
    <Box justifyContent={"center"} mt={4}>
      <Grid container spacing={2}>
        {nfts.map((nft, i) => (
          <Grid item key={i}>
            <ImgMediaCard
              text="Buy now"
              name={nft.name}
              price={nft.price}
              image={nft.image}
              description={nft.description}
              onClick={() => buyNft(nft)}
              color={"success"}
            />
          </Grid>
        ))}
      </Grid>
    </Box>
  );
}
