import type { Input, Movie } from '../catalog/schema';
import type { Result } from '../engine/types';
import { date, number, reasonText, translator } from '../i18n';
import { MovieArtwork } from './MovieArtwork';

export function MovieCard({ movie, result, input, now, index, chosen, seen, replaced, busy = false, onChoose, onSeen, onReplace, onCheck }: {
  movie: Movie; result: Result; input: Input; now: number; index: number; chosen: boolean; seen: boolean; replaced: boolean; busy?: boolean;
  onChoose: () => void; onSeen: () => void; onReplace: () => void; onCheck: () => void;
}) {
  const t = translator(input.locale);
  const record = result.availabilityState.record;
  const fresh = record && Date.parse(record.verifiedAt) <= now && now < Date.parse(record.expiresAt);
  return <article className={`movie-card ${chosen ? 'is-chosen' : ''}`} data-movie-id={movie.id}>
    <MovieArtwork movie={movie} locale={input.locale} label={index === 0 ? t('recommended') : `${t('pick')} ${number(index + 1,input.locale)}`} />
    <div className="card-body">
      <h2>{movie.titles[input.locale]}</h2>
      <p className="metadata"><bdi>{number(movie.year,input.locale)}</bdi><span>{number(movie.runtimeMinutes!,input.locale)} {t('minutes')}</span><span>{movie.genres.map(genre => t(genre)).join('، ')}</span></p>
      <p className="hook">{movie.originalHooks[input.locale]}</p>
      <ul className="reasons">{result.reasons.map(reason => <li key={reason.key}>{reasonText(reason,input.locale)}</li>)}{result.reasons.length < 2 && <li>{t('weakEvidence')}</li>}</ul>
      <p className="tradeoff"><strong>{t('tradeOff')}: </strong>{t(result.tradeOffKey)}</p>
      <div className="availability"><strong>{fresh ? t('simulated') : t('unknown')}</strong><span>{t(input.countryCode)}{fresh && record ? ` · ${t(record.providerId)}` : ''}</span>
        {fresh && record && <span>{t('checked')}: {date(record.verifiedAt,input.locale)} · {t('expires')}: {date(record.expiresAt,input.locale)}</span>}
        <button className="text-button" onClick={onCheck}>{t('checkAction')}</button>
      </div>
      <button className="primary choose" disabled={busy} aria-pressed={chosen} onClick={onChoose}>{chosen ? t('chosen') : t('choose')}</button>
      <div className="card-actions"><button className="secondary" disabled={replaced || busy} onClick={onReplace}>{replaced ? t('replaced') : t('replace')}</button><button className="secondary" disabled={seen || busy} onClick={onSeen}>{seen ? t('alreadySeen') : t('seen')}</button></div>
    </div>
  </article>;
}
