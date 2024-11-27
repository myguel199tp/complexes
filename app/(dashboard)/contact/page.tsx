import React from "react";
import {
  FaFacebookSquare,
  FaInstagramSquare,
  FaLinkedin,
  FaYoutubeSquare,
  FaPinterestSquare,
} from "react-icons/fa";
import { FaSquareXTwitter } from "react-icons/fa6";

export default function page() {
  return (
    <div>
      <div className="flex justify-center mt-12">
        <div className="flex ">
          <FaFacebookSquare className="w-12 h-12 text-[#1877F2]" />
          <FaLinkedin className="w-12 h-12 text-[#0077B5]" />
          <FaYoutubeSquare className="w-12 h-12 text-[#FF0000]" />
          <FaInstagramSquare className="w-12 h-12 text-[#E1306C]" />
          <FaSquareXTwitter className="w-12 h-12 text-[#1D9BF0]" />
          <FaPinterestSquare className="w-12 h-12 text-[#E60023]" />
        </div>
      </div>
    </div>
  );
}
