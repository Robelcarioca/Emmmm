/* eslint-disable react/display-name */
const ic = (path, opts = {}) => ({ s = 24, c = 'currentColor', ...rest } = {}) => (
  <svg width={s} height={s} viewBox="0 0 24 24" fill="none" {...rest}>
    {typeof path === 'function' ? path(c) : <path d={path} stroke={c} strokeWidth={1.85} strokeLinecap="round" strokeLinejoin="round"/>}
  </svg>
);

export const HomeIcon    = ({s,c}) => <svg width={s} height={s} viewBox="0 0 24 24" fill="none"><path d="M3 9.5L12 3l9 6.5V20a1 1 0 01-1 1H4a1 1 0 01-1-1V9.5z" stroke={c} strokeWidth={1.8} strokeLinejoin="round"/><path d="M9 21V12h6v9" stroke={c} strokeWidth={1.8} strokeLinecap="round"/></svg>;
export const SearchIcon  = ({s,c}) => <svg width={s} height={s} viewBox="0 0 24 24" fill="none"><circle cx="11" cy="11" r="7" stroke={c} strokeWidth={1.8}/><path d="M21 21l-4.35-4.35" stroke={c} strokeWidth={1.8} strokeLinecap="round"/></svg>;
export const LibIcon     = ({s,c}) => <svg width={s} height={s} viewBox="0 0 24 24" fill="none"><rect x="3" y="3" width="6" height="18" rx="2" stroke={c} strokeWidth={1.8}/><rect x="12" y="3" width="9" height="5" rx="2" stroke={c} strokeWidth={1.8}/><rect x="12" y="11" width="9" height="10" rx="2" stroke={c} strokeWidth={1.8}/></svg>;
export const UserIcon    = ({s,c}) => <svg width={s} height={s} viewBox="0 0 24 24" fill="none"><circle cx="12" cy="8" r="4" stroke={c} strokeWidth={1.8}/><path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" stroke={c} strokeWidth={1.8} strokeLinecap="round"/></svg>;
export const PlayFill    = ({s=20,c='#fff'}) => <svg width={s} height={s} viewBox="0 0 24 24" fill={c}><path d="M6 4l15 8-15 8V4z"/></svg>;
export const PauseFill   = ({s=20,c='#fff'}) => <svg width={s} height={s} viewBox="0 0 24 24" fill={c}><rect x="5" y="3" width="4.5" height="18" rx="2"/><rect x="14.5" y="3" width="4.5" height="18" rx="2"/></svg>;
export const PlusIcon    = ({s,c}) => <svg width={s} height={s} viewBox="0 0 24 24" fill="none"><path d="M12 5v14M5 12h14" stroke={c} strokeWidth={2.1} strokeLinecap="round"/></svg>;
export const CheckIcon   = ({s,c}) => <svg width={s} height={s} viewBox="0 0 24 24" fill="none"><path d="M5 12l5 5L20 7" stroke={c} strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round"/></svg>;
export const ChevDown    = ({s,c}) => <svg width={s} height={s} viewBox="0 0 24 24" fill="none"><path d="M6 9l6 6 6-6" stroke={c} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"/></svg>;
export const ListIcon    = ({s,c}) => <svg width={s} height={s} viewBox="0 0 24 24" fill="none"><path d="M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01" stroke={c} strokeWidth={1.8} strokeLinecap="round"/></svg>;
export const BellIcon    = ({s,c}) => <svg width={s} height={s} viewBox="0 0 24 24" fill="none"><path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9" stroke={c} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round"/><path d="M13.73 21a2 2 0 01-3.46 0" stroke={c} strokeWidth={1.8} strokeLinecap="round"/></svg>;
export const HeartIcon   = ({s,c,filled}) => <svg width={s} height={s} viewBox="0 0 24 24" fill={filled?c:'none'}><path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z" stroke={c} strokeWidth={1.8} strokeLinejoin="round"/></svg>;
export const DlIcon      = ({s,c}) => <svg width={s} height={s} viewBox="0 0 24 24" fill="none"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" stroke={c} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round"/><polyline points="7,10 12,15 17,10" stroke={c} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round"/><line x1="12" y1="15" x2="12" y2="3" stroke={c} strokeWidth={1.8} strokeLinecap="round"/></svg>;
export const MoonIcon    = ({s,c}) => <svg width={s} height={s} viewBox="0 0 24 24" fill="none"><path d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z" stroke={c} strokeWidth={1.8} strokeLinejoin="round"/></svg>;
export const VolIcon     = ({s,c,off}) => off
  ? <svg width={s} height={s} viewBox="0 0 24 24" fill="none"><path d="M11 5L6 9H2v6h4l5 4V5z" stroke={c} strokeWidth={1.8} strokeLinejoin="round"/><line x1="23" y1="9" x2="17" y2="15" stroke={c} strokeWidth={1.8} strokeLinecap="round"/><line x1="17" y1="9" x2="23" y2="15" stroke={c} strokeWidth={1.8} strokeLinecap="round"/></svg>
  : <svg width={s} height={s} viewBox="0 0 24 24" fill="none"><path d="M11 5L6 9H2v6h4l5 4V5z" stroke={c} strokeWidth={1.8} strokeLinejoin="round"/><path d="M19.07 4.93a10 10 0 010 14.14M15.54 8.46a5 5 0 010 7.07" stroke={c} strokeWidth={1.8} strokeLinecap="round"/></svg>;
export const Rew15       = ({s,c}) => <svg width={s} height={s} viewBox="0 0 32 32" fill="none"><path d="M8 7L4 11l4 4" stroke={c} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"/><path d="M4 11h14a9 9 0 110 18H8" stroke={c} strokeWidth={2} strokeLinecap="round"/><text x="11" y="19" fontSize="8" fill={c} fontFamily="'DM Sans',sans-serif" fontWeight="700">15</text></svg>;
export const Fwd30       = ({s,c}) => <svg width={s} height={s} viewBox="0 0 32 32" fill="none"><path d="M24 7l4 4-4 4" stroke={c} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"/><path d="M28 11H14a9 9 0 100 18h10" stroke={c} strokeWidth={2} strokeLinecap="round"/><text x="11" y="19" fontSize="8" fill={c} fontFamily="'DM Sans',sans-serif" fontWeight="700">30</text></svg>;

// Brand logos
export const SpotifyLogo = ({s=18}) => (
  <svg width={s} height={s} viewBox="0 0 24 24">
    <circle cx="12" cy="12" r="12" fill="#1ED760"/>
    <path d="M17 16.5c-.2 0-.4-.06-.55-.18-2.48-1.52-5.58-1.86-9.24-1.02-.37.08-.73-.15-.81-.51-.08-.37.15-.73.51-.81 3.98-.9 7.43-.51 10.19 1.14.32.2.43.61.23.93-.14.24-.4.45-.33.45z" fill="white"/>
    <path d="M18.2 13.7c-.26 0-.48-.08-.67-.22-2.84-1.74-7.16-2.24-10.52-1.22-.44.13-.9-.12-1.03-.55-.13-.44.12-.9.55-1.03 3.85-1.17 8.62-.6 11.89 1.38.4.24.52.76.28 1.16-.16.26-.44.48-.5.48z" fill="white"/>
    <path d="M19.5 10.6c-.3 0-.56-.1-.77-.27-3.24-1.94-8.59-2.12-11.7-1.17-.5.15-1.04-.13-1.19-.64-.16-.5.13-1.04.64-1.19 3.57-1.08 9.5-.87 13.23 1.35.47.28.63.9.34 1.36-.2.31-.53.56-.55.56z" fill="white"/>
  </svg>
);
export const YTLogo = ({s=18}) => (
  <svg width={s} height={s} viewBox="0 0 24 24">
    <path d="M23.5 6.2a3 3 0 00-2.12-2.12C19.54 3.5 12 3.5 12 3.5s-7.54 0-9.38.58A3 3 0 00.5 6.2C0 8.06 0 12 0 12s0 3.94.5 5.8a3 3 0 002.12 2.12c1.84.58 9.38.58 9.38.58s7.54 0 9.38-.58a3 3 0 002.12-2.12C24 15.94 24 12 24 12s0-3.94-.5-5.8zM9.75 15.28V8.73L15.5 12l-5.75 3.28z" fill="#FF0000"/>
  </svg>
);
