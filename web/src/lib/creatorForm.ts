import type { CreatorApplication } from '@affordly/engine';
export type Draft = Omit<CreatorApplication, 'platform' | 'followers'> & {
  platform: CreatorApplication['platform'] | '';
  followers: CreatorApplication['followers'] | '';
};
export const empty: Draft = { name: '', platform: '', handle: '', followers: '', note: '' };
export const platforms = { tiktok: 'TikTok', instagram: 'Instagram', youtube: 'YouTube', other: 'Other' };
export const followers = {
  'under-1k': 'Under 1k', '1k-10k': '1k-10k', '10k-100k': '10k-100k',
  'over-100k': 'Over 100k'
};
export function validate(value: Draft) {
  const errors: Record<string, string> = {};
  if (!value.name.trim())
    errors.name = 'Enter your name.';
  else
    if (value.name.length > 80)
      errors.name = 'Use 80 characters or fewer.';
  if (!value.platform)
    errors.platform = 'Choose where you post.';
  if (!value.handle.trim())
    errors.handle = 'Enter your handle or a link to your profile.';
  else
    if (value.handle.length > 120)
      errors.handle = 'Use 120 characters or fewer.';
  if (!value.followers)
    errors.followers = 'Choose a follower range.';
  if (value.note.length > 500)
    errors.note = 'Keep the note to 500 characters.';
  return errors;
}
export let rateLimited = false;
try {
  rateLimited = sessionStorage.getItem('affordly.creatorLimited') === '1';
}
catch { /* In-memory rate limit remains available. */ }
export function limitApplications() {
  rateLimited = true;
  try {
    sessionStorage.setItem('affordly.creatorLimited', '1');
  }
  catch { /* Keep the in-memory limit. */ }
}
