export interface YouTubeVideo {
  videoId: string;
  title: string;
  thumbnail: string;
  publishedAt: string;
  url: string;
}

export async function getLatestYouTubeVideo(): Promise<YouTubeVideo | null> {
  const channelId = process.env.YOUTUBE_CHANNEL_ID;
  if (!channelId) return null;

  try {
    const res = await fetch(
      `https://www.youtube.com/feeds/videos.xml?channel_id=${channelId}`,
      { next: { revalidate: 3600 } },
    );
    if (!res.ok) return null;

    const xml = await res.text();

    const videoIdMatch = xml.match(/<yt:videoId>([^<]+)<\/yt:videoId>/);
    const titleMatch = xml.match(/<media:title>([^<]+)<\/media:title>/);
    const publishedMatch = xml.match(/<published>([^<]+)<\/published>/);

    if (!videoIdMatch) return null;

    const videoId = videoIdMatch[1];
    const title = titleMatch ? titleMatch[1] : "最新動画";
    const publishedAt = publishedMatch ? publishedMatch[1].slice(0, 10) : "";

    return {
      videoId,
      title,
      thumbnail: `https://i.ytimg.com/vi/${videoId}/maxresdefault.jpg`,
      publishedAt,
      url: `https://www.youtube.com/watch?v=${videoId}`,
    };
  } catch {
    return null;
  }
}
