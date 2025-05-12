import {
  FacebookShareButton,
  TwitterShareButton,
  WhatsappShareButton,
  FacebookIcon,
  TwitterIcon,
  WhatsappIcon,
} from "react-share";

interface props {
  neigborhood?: string;
  city?: string;
}

const ShareButtons = ({ neigborhood, city }: props) => {
  const shareUrl = typeof window !== "undefined" ? window.location.href : "";
  const title = `Inmueble en ${neigborhood ?? "barrio desconocido"} - ${
    city ?? "ciudad desconocida"
  }`;
  return (
    <div className="flex flex-col gap-2">
      <WhatsappShareButton url={shareUrl} title={title} separator=" - ">
        <WhatsappIcon size={32} round />
      </WhatsappShareButton>

      <FacebookShareButton url={shareUrl} title={title}>
        <FacebookIcon size={32} round />
      </FacebookShareButton>

      <TwitterShareButton url={shareUrl} title={title}>
        <TwitterIcon size={32} round />
      </TwitterShareButton>
    </div>
  );
};

export default ShareButtons;
