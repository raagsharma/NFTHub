import * as React from "react";
import Card from "@mui/material/Card";
import CardActions from "@mui/material/CardActions";
import CardContent from "@mui/material/CardContent";
import CardMedia from "@mui/material/CardMedia";
import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";
import EtheriumIcon from "../components/EtheriumIcon";

type ImgMediaCard = {
  name: string;
  description: string;
  image: string;
  price: string;
  color: any;
  text: string;
  showBtn?: boolean;
  onClick: Function;
};

export default function ImgMediaCard({
  name,
  price,
  image,
  description,
  color,
  text,
  showBtn = true,
  onClick,
}: ImgMediaCard) {
  return (
    <Card sx={{ maxWidth: 350 }}>
      <CardMedia component="img" alt={name} height="300" image={image} />
      <CardContent sx={{ height: "120px" }}>
        <Typography gutterBottom variant="h5" component="div">
          {name}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          {description}
        </Typography>
      </CardContent>
      <CardActions>
        {showBtn && (
          <Button
            variant="contained"
            size="small"
            color={color}
            onClick={() => onClick()}
          >
            {text}
          </Button>
        )}
        <Button size="small" color="info">
          <EtheriumIcon />
          {price}
          {" ETH"}
        </Button>
      </CardActions>
    </Card>
  );
}
