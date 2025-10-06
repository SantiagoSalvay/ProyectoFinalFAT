import { 
  FaFacebook,
  FaInstagram,
  FaTwitter,
  FaLinkedin,
  FaYoutube,
  FaTiktok,
  FaWhatsapp,
  FaGlobe,
  FaEnvelope,
  FaLink
} from 'react-icons/fa'
import type { IconType } from 'react-icons'

export type SocialMediaType = 
  | 'facebook' 
  | 'instagram' 
  | 'twitter' 
  | 'linkedin' 
  | 'youtube' 
  | 'tiktok'
  | 'whatsapp'
  | 'website'
  | 'email'
  | 'other';

export interface SocialMediaLink {
  id: string;
  url: string;
  type: SocialMediaType;
  displayName: string;
}

export function detectSocialMediaType(url: string): SocialMediaType {
  const normalizedUrl = url.toLowerCase().trim();
  
  // Email
  if (normalizedUrl.includes('@') || normalizedUrl.startsWith('mailto:')) {
    return 'email';
  }
  
  // WhatsApp
  if (normalizedUrl.includes('wa.me') || normalizedUrl.includes('whatsapp.com') || normalizedUrl.includes('api.whatsapp.com')) {
    return 'whatsapp';
  }
  
  // Facebook
  if (normalizedUrl.includes('facebook.com') || normalizedUrl.includes('fb.com') || normalizedUrl.includes('fb.me')) {
    return 'facebook';
  }
  
  // Instagram
  if (normalizedUrl.includes('instagram.com') || normalizedUrl.includes('instagr.am')) {
    return 'instagram';
  }
  
  // Twitter / X
  if (normalizedUrl.includes('twitter.com') || normalizedUrl.includes('x.com')) {
    return 'twitter';
  }
  
  // LinkedIn
  if (normalizedUrl.includes('linkedin.com')) {
    return 'linkedin';
  }
  
  // YouTube
  if (normalizedUrl.includes('youtube.com') || normalizedUrl.includes('youtu.be')) {
    return 'youtube';
  }
  
  // TikTok
  if (normalizedUrl.includes('tiktok.com')) {
    return 'tiktok';
  }
  
  // Website genérico
  if (normalizedUrl.startsWith('http') || normalizedUrl.startsWith('www.')) {
    return 'website';
  }
  
  return 'other';
}

export function getSocialMediaIcon(type: SocialMediaType): IconType {
  const icons: Record<SocialMediaType, IconType> = {
    facebook: FaFacebook,
    instagram: FaInstagram,
    twitter: FaTwitter,
    linkedin: FaLinkedin,
    youtube: FaYoutube,
    tiktok: FaTiktok,
    whatsapp: FaWhatsapp,
    website: FaGlobe,
    email: FaEnvelope,
    other: FaLink
  };
  
  return icons[type] || icons.other;
}

export function getSocialMediaColor(type: SocialMediaType): string {
  const colors: Record<SocialMediaType, string> = {
    facebook: '#1877F2',
    instagram: '#E4405F',
    twitter: '#1DA1F2',
    linkedin: '#0A66C2',
    youtube: '#FF0000',
    tiktok: '#000000',
    whatsapp: '#25D366',
    website: '#6B7280',
    email: '#EA4335',
    other: '#9CA3AF'
  };
  
  return colors[type] || colors.other;
}

export function formatSocialMediaUrl(url: string): string {
  let formatted = url.trim();
  
  // Si es email y no tiene mailto:
  if (formatted.includes('@') && !formatted.startsWith('mailto:')) {
    return `mailto:${formatted}`;
  }
  
  // Si no tiene protocolo, agregar https://
  if (!formatted.startsWith('http') && !formatted.startsWith('mailto:')) {
    formatted = `https://${formatted}`;
  }
  
  return formatted;
}

export function getDisplayName(type: SocialMediaType): string {
  const names: Record<SocialMediaType, string> = {
    facebook: 'Facebook',
    instagram: 'Instagram',
    twitter: 'Twitter/X',
    linkedin: 'LinkedIn',
    youtube: 'YouTube',
    tiktok: 'TikTok',
    whatsapp: 'WhatsApp',
    website: 'Sitio Web',
    email: 'Email',
    other: 'Otro enlace'
  };
  
  return names[type] || names.other;
}
