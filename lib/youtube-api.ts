import 'server-only';
import { isoDurationToSeconds } from './youtube';

const API = 'https://www.googleapis.com/youtube/v3';
const key = () => {
  const k = process.env.YOUTUBE_API_KEY;
  if (!k) throw new Error('YOUTUBE_API_KEY is not set');
  return k;
};

export interface VideoMeta {
  id: string;
  title: string;
  seconds: number;
}

/** Up to 50 ids per request; returns only the videos YouTube knows. */
export async function fetchVideos(ids: string[]): Promise<VideoMeta[]> {
  const out: VideoMeta[] = [];
  for (let i = 0; i < ids.length; i += 50) {
    const batch = ids.slice(i, i + 50);
    const res = await fetch(`${API}/videos?part=contentDetails,snippet&id=${batch.join(',')}&key=${key()}`, { cache: 'no-store' });
    if (!res.ok) throw new Error(`YouTube API ${res.status}`);
    const json = await res.json();
    for (const v of json.items ?? []) {
      out.push({ id: v.id, title: v.snippet.title, seconds: isoDurationToSeconds(v.contentDetails.duration) });
    }
  }
  return out;
}

/** All video ids of a playlist, in order. */
export async function fetchPlaylistVideoIds(playlistId: string): Promise<{ title: string; ids: string[] }> {
  const ids: string[] = [];
  let page = '';
  do {
    const res = await fetch(
      `${API}/playlistItems?part=contentDetails&maxResults=50&playlistId=${playlistId}&key=${key()}${page ? `&pageToken=${page}` : ''}`,
      { cache: 'no-store' },
    );
    if (!res.ok) throw new Error(`YouTube API ${res.status}`);
    const json = await res.json();
    ids.push(...(json.items ?? []).map((x: { contentDetails: { videoId: string } }) => x.contentDetails.videoId));
    page = json.nextPageToken ?? '';
  } while (page);

  const meta = await fetch(`${API}/playlists?part=snippet&id=${playlistId}&key=${key()}`, { cache: 'no-store' });
  const title = meta.ok ? ((await meta.json()).items?.[0]?.snippet?.title ?? '') : '';
  return { title, ids };
}
