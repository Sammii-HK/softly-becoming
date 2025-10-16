import axios from "axios";

const API = "https://app.ayrshare.com/api/post";

type PostArgs = {
  caption: string;
  mediaUrls: string[];
  profile?: string;
};

export async function postToAyrshare({ caption, mediaUrls, profile }: PostArgs) {
  const headers = {
    Authorization: `Bearer ${process.env.AYRSHARE_API_KEY}`,
    "Content-Type": "application/json",
  };
  const body = {
    post: caption,
    mediaUrls,
    platforms: ["instagram"],
    profile: profile ?? process.env.AYRSHARE_PROFILE,
  };
  const res = await axios.post(API, body, { headers, timeout: 15000 });
  return res.data;
}
