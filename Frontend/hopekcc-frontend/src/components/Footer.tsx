export const Footer = () => {
  return (
    <div className="flex justify-between items-center w-full bottom-0 h-96 p-4 bg-[#1d769f] text-white">
      <div className=" basis-3/5">
        <img
          loading="lazy"
          decoding="async"
          width="297px"
          height="auto"
          src="https://www.hopekcc.org/wp-content/uploads/2024/03/HopeKCC-txt-White-1024x213.png"
          alt=""
          sizes="(max-width: 1024px) 100vw, 1024px"
        ></img>
      </div>
      <div className="basis-1/3">
        <div className="p-3 font-bold">CONTACT</div>
        <a className="underline">info@hopekcc.org</a>
      </div>
      <div className="basis-1/3 ">
        <div className="p-3 font-bold">FOLLOW</div>
        <div>
          <a
            className="underline"
            href="https://www.instagram.com/hopekccinc?utm_source=ig_web_button_share_sheet"
          >
            Instagram
          </a>
          /
          <a
            className="underline"
            href="https://www.facebook.com/profile.php?id=61558063464286"
          >
            Facebook
          </a>
          /
          <a className="underline" href="https://www.youtube.com/@HopeKCC">
            Youtube
          </a>
          /
          <a
            className="underline"
            href="https://www.instagram.com/hopekccinc?utm_source=ig_web_button_share_sheet"
          >
            Linkedin
          </a>
        </div>
      </div>
    </div>
  );
};

export default Footer;
