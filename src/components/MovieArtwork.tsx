import type { Locale, Movie } from '../catalog/schema';
import { number, translator } from '../i18n';

// Original vector compositions. No movie posters, stock images or network assets.
export function MovieArtwork({ movie, locale, label }: { movie: Movie; locale: Locale; label?: string }) {
  const t = translator(locale);
  const theme = movie.genres[0];
  return <div className="artwork" data-theme={theme}>
    <svg className="art-scene" viewBox="0 0 360 480" fill="none" aria-hidden="true">
      {theme === 'comedy' && <><circle cx="270" cy="138" r="125" fill="currentColor" /><path d="M-50 305C55 92 180 189 234 480" stroke="currentColor" strokeWidth="42" /><path d="M0 401L360 245V480H0Z" fill="currentColor" opacity=".4" /><path d="M50 50H132M91 9V91" stroke="currentColor" strokeWidth="2" /></>}
      {theme === 'romance' && <><circle cx="185" cy="140" r="118" fill="currentColor" opacity=".5" /><path d="M64 480V225a116 116 0 01232 0v255" stroke="currentColor" strokeWidth="34" /><path d="M150 0V480" stroke="currentColor" opacity=".5" /><circle cx="265" cy="128" r="42" fill="currentColor" /></>}
      {theme === 'adventure' && <><circle cx="265" cy="110" r="63" fill="currentColor" /><path d="M-10 390L134 91L285 480M164 480L331 222L420 410" stroke="currentColor" strokeWidth="34" /><path d="M0 390H360M0 420H360M0 450H360" stroke="currentColor" opacity=".3" /></>}
      {theme === 'scifi' && <><ellipse cx="186" cy="208" rx="173" ry="59" transform="rotate(-39 186 208)" stroke="currentColor" strokeWidth="20" /><ellipse cx="186" cy="208" rx="136" ry="41" transform="rotate(-39 186 208)" stroke="currentColor" strokeWidth="2" /><circle cx="188" cy="204" r="74" fill="currentColor" opacity=".45" /><path d="M270 40V72M254 56H286M51 296V322M38 309H64M306 390V410M296 400H316" stroke="currentColor" strokeWidth="3" /></>}
      {theme === 'mystery' && <><path d="M-10 50L295 0L194 480L80 480Z" fill="currentColor" opacity=".2" /><circle cx="181" cy="175" r="82" stroke="currentColor" strokeWidth="19" /><path d="M0 0L360 480M190 249L249 333" stroke="currentColor" strokeWidth="12" /><path d="M18 439L342 341" stroke="currentColor" strokeWidth="3" /></>}
      {theme === 'drama' && <><path d="M70 480V175a110 110 0 01220 0v305" fill="currentColor" opacity=".4" /><path d="M95 480V186a85 85 0 01170 0v294" stroke="currentColor" strokeWidth="2" /><path d="M20 0L330 480M0 325L360 245" stroke="currentColor" strokeWidth="24" /><circle cx="130" cy="180" r="46" fill="currentColor" /></>}
    </svg>
    {label && <span className="pick-label">{label}</span>}
    <div className="artwork-title" aria-hidden="true">{movie.titles[locale]}</div>
    <div className="artwork-bottom"><span>{t('fixture')}</span><span>{number(movie.year,locale)}</span></div>
  </div>;
}
