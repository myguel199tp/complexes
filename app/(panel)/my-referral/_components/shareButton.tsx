import {
  FacebookShareButton,
  TwitterShareButton,
  WhatsappShareButton,
  LinkedinShareButton,
  FacebookIcon,
  LinkedinIcon,
  XIcon,
  WhatsappIcon,
} from "react-share";

interface Props {
  url: string;
}

const ShareButtons = ({ url }: Props) => {
  const shareUrl =
    url || (typeof window !== "undefined" ? window.location.href : "");

  const message = `Únete a Complexesph y gestiona tu conjunto de forma fácil 🏢✨
Regístrate usando mi link de referido 👇`;

  return (
    <div className="flex gap-2">
      {/* WhatsApp */}
      <WhatsappShareButton url={shareUrl} title={message} separator="\n\n">
        <WhatsappIcon size={20} round />
      </WhatsappShareButton>

      {/* Facebook */}
      <FacebookShareButton url={shareUrl} title={message}>
        <FacebookIcon size={20} round />
      </FacebookShareButton>

      {/* Twitter / X */}
      <TwitterShareButton url={shareUrl} title={message}>
        <XIcon size={20} round />
      </TwitterShareButton>

      <LinkedinShareButton url={shareUrl} title={message}>
        <LinkedinIcon size={20} round />
      </LinkedinShareButton>
    </div>
  );
};

export default ShareButtons;
