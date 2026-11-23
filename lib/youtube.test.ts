import { describe, expect, it } from 'vitest';
import { youtubeId, youtubePlaylistId, isoDurationToSeconds } from './youtube';

describe('youtube helpers', () => {
  it('extracts video ids from the link shapes used in the content', () => {
    expect(youtubeId('https://youtu.be/AB-l2FyMU54?si=QTYx')).toBe('AB-l2FyMU54');
    expect(youtubeId('https://www.youtube.com/live/S9ONd7RMUGk?si=hgV0')).toBe('S9ONd7RMUGk');
    expect(youtubeId('https://www.youtube.com/watch?v=dQw4w9WgXcQ&t=10')).toBe('dQw4w9WgXcQ');
    expect(youtubeId('https://drive.google.com/file/d/x/view')).toBeNull();
  });
  it('extracts playlist ids', () => {
    expect(youtubePlaylistId('https://www.youtube.com/playlist?list=PLabc_123-x')).toBe('PLabc_123-x');
    expect(youtubePlaylistId('https://youtu.be/AB-l2FyMU54')).toBeNull();
  });
  it('parses ISO-8601 durations', () => {
    expect(isoDurationToSeconds('PT1H2M3S')).toBe(3723);
    expect(isoDurationToSeconds('PT45M')).toBe(2700);
    expect(isoDurationToSeconds('P0D')).toBe(0);
  });
});
