import { catalog } from '../catalog';
import { contentFlags, contexts, countries, genres, moods, providers } from '../catalog/schema';
import type { Input } from '../catalog/schema';
import { number, translator } from '../i18n';
import { Check, Options } from './Options';

function toggle<T>(items: T[], item: T): T[] { return items.includes(item) ? items.filter(value => value !== item) : [...items,item]; }

export function InputScreen({ step, input, update }: { step: number; input: Input; update: (patch: Partial<Input>) => void }) {
  const t = translator(input.locale);
  switch (step) {
    case 1: return <>
      <Options label={t('language')} options={[{ value: 'en', label: 'English' }, { value: 'ar', label: 'العربية' }]} value={input.locale} onChange={locale => update({ locale })} />
      <label className="select-label">{t('country')}<select value={input.countryCode} onChange={event => update({ countryCode: event.target.value as Input['countryCode'] })}>
        {countries.map(country => <option key={country} value={country}>{t(country)}</option>)}
      </select></label>
      <Options label={t('watchingMode')} options={contexts.map(value => ({ value, label: t(value) }))} value={input.watchingMode} onChange={watchingMode => update({ watchingMode })} />
      <p className="help">{t('shared')}</p>
    </>;
    case 2: return <>
      <Options label={t('mood')} options={moods.map(value => ({ value, label: t(value) }))} value={input.mood} onChange={mood => update({ mood })} />
      <fieldset><legend>{t('genres')}</legend><p className="help">{t('genresHelp')}</p><div className="chip-checks">
        {genres.map(genre => <Check key={genre} label={t(genre)} checked={input.preferredGenres.includes(genre)}
          disabled={input.preferredGenres.length >= 3 && !input.preferredGenres.includes(genre)} onChange={() => update({ preferredGenres: toggle(input.preferredGenres,genre) })} />)}
      </div></fieldset>
    </>;
    case 3: return <>
      <label className="runtime-label" htmlFor="runtime">{t('runtime')}<span className="runtime-value"><output htmlFor="runtime">{number(input.maxRuntimeMinutes,input.locale)}</output> {t('minutes')}</span></label>
      <input id="runtime" className="runtime-slider" type="range" min="30" max="240" step="1" value={input.maxRuntimeMinutes} onChange={event => update({ maxRuntimeMinutes: Number(event.target.value) })} />
      <div className="range-labels"><span>{number(30,input.locale)}</span><span>{number(240,input.locale)}</span></div>
      <Options label={t('runtime')} options={[75,90,120,150,180].map(value => ({ value, label: `${number(value,input.locale)} ${t('minutes')}` }))} value={input.maxRuntimeMinutes} onChange={maxRuntimeMinutes => update({ maxRuntimeMinutes })} />
      <Check label={t('overrun')} checked={input.allowOverrun} onChange={() => update({ allowOverrun: !input.allowOverrun })} />
      <p className="help">{t('overrunHelp')}</p>
    </>;
    case 4: return <>
      <Options label={t('step4')} options={[{ value: 'self-check', label: t('selfCheck') }, { value: 'strict', label: t('strict') }]} value={input.availabilityMode} onChange={availabilityMode => update({ availabilityMode })} />
      <p className="help">{t('providerHelp')}</p>
      {input.availabilityMode === 'strict' && <fieldset><legend>{t('country')}: {t(input.countryCode)}</legend><div className="service-options">
        {providers.map(provider => <Check key={provider} label={t(provider)} checked={input.providerIds.includes(provider)} onChange={() => update({ providerIds: toggle(input.providerIds,provider) })} />)}
      </div><p className="help">{t('strictHelp')}</p><p className="help">{t('simulationDate')}</p></fieldset>}
    </>;
    case 5: return <>
      <Options label={t('step5')} options={[{ value: .25, label: t('comfort') }, { value: .5, label: t('balanced') }, { value: .9, label: t('surprise') }]} value={input.adventurousness} onChange={adventurousness => update({ adventurousness })} />
      <p className="help">{t('adventureHelp')}</p>
    </>;
    case 6: return <>
      <Check label={t('watched')} checked={input.excludeWatched} onChange={() => update({ excludeWatched: !input.excludeWatched })} />
      <details className="advanced"><summary>{t('advanced')}</summary>
        <fieldset><legend>{t('content')}</legend><div className="chip-checks">
          {contentFlags.map(flag => <Check key={flag} label={t(flag)} checked={input.excludedContentFlags.includes(flag)} onChange={() => update({ excludedContentFlags: toggle(input.excludedContentFlags,flag) })} />)}
        </div><p className="help">{t('vetoHelp')}</p></fieldset>
        <fieldset><legend>{t('excludeTitle')}</legend><div className="title-exclusions">
          {catalog.movies.map(movie => <Check key={movie.id} label={movie.titles[input.locale]} checked={input.excludedMovieIds.includes(movie.id)} onChange={() => update({ excludedMovieIds: toggle(input.excludedMovieIds,movie.id) })} />)}
        </div></fieldset>
      </details>
      <section className="review" aria-label={t('review')}><h2>{t('review')}</h2><dl>
        <div><dt>{t('country')}</dt><dd>{t(input.countryCode)}</dd></div>
        <div><dt>{t('watchingMode')}</dt><dd>{t(input.watchingMode)}</dd></div>
        <div><dt>{t('mood')}</dt><dd>{t(input.mood)}</dd></div>
        <div><dt>{t('genres')}</dt><dd>{input.preferredGenres.length ? input.preferredGenres.map(genre => t(genre)).join('، ') : t('openGenres')}</dd></div>
        <div><dt>{t('runtime')}</dt><dd>{number(input.maxRuntimeMinutes + (input.allowOverrun ? 10 : 0),input.locale)} {t('minutes')}</dd></div>
        <div><dt>{t('step4')}</dt><dd>{input.availabilityMode === 'self-check' ? t('selfCheck') : input.providerIds.map(provider => t(provider)).join('، ')}</dd></div>
        <div><dt>{t('content')}</dt><dd>{input.excludedContentFlags.length ? input.excludedContentFlags.map(flag => t(flag)).join('، ') : t('noVetoes')}</dd></div>
      </dl></section>
    </>;
    default: return null;
  }
}
