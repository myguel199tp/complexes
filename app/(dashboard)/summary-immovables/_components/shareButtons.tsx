import {
  FacebookShareButton,
  TwitterShareButton,
  WhatsappShareButton,
  FacebookIcon,
  TwitterIcon,
  WhatsappIcon,
} from "react-share";

interface Props {
  neigborhood?: string;
  city?: string;
  url?: string; // ← añadimos esto
}

const ShareButtons = ({ neigborhood, city, url }: Props) => {
  const shareUrl =
    url || (typeof window !== "undefined" ? window.location.href : "");
  const title = `Inmueble en ${neigborhood ?? "barrio desconocido"} - ${
    city ?? "ciudad desconocida"
  }`;

  return (
    <div className="flex gap-2">
      <WhatsappShareButton url={shareUrl} title={title} separator=" - ">
        <WhatsappIcon size={32} round />
      </WhatsappShareButton>

      <FacebookShareButton url={shareUrl}>
        <FacebookIcon size={32} round />
      </FacebookShareButton>

      <TwitterShareButton url={shareUrl} title={title}>
        <TwitterIcon size={32} round />
      </TwitterShareButton>
    </div>
  );
};

export default ShareButtons;
