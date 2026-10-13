import { useState } from 'react';
import type { Ref } from 'react';
import type { Locale } from '../catalog/schema';
import type { AccountController, AccountState } from '../diary/controller';
import type { Night } from '../diary/types';
import { today } from '../diary/guest';
import { diaryT } from '../diary/i18n';
import { date, number } from '../i18n';

function DiaryRow({ entry,locale,busy,undoConflict,onWatch,onUndo,onDelete }: {
  entry: Night; locale: Locale; busy: boolean; undoConflict: boolean;
  onWatch: (id: string,date: string) => void; onUndo: () => void; onDelete: () => void;
}) {
  const t = diaryT(locale);
  const [on,setOn] = useState(today);
  return <article className="diary-row" data-night-id={entry.id}>
    <div className="diary-entry-info"><span className={`diary-status ${entry.status}`}>{t(entry.status)}</span><h2>{(locale === 'ar' ? entry.title_ar : entry.title_en) ?? t('unknownTitle')}</h2>
      {entry.is_synthetic && <p className="help">{t('synthetic')}</p>}
      <dl><div><dt>{t('chosenDate')}</dt><dd>{entry.chosen_at ? new Intl.DateTimeFormat(locale,{ dateStyle: 'medium',timeStyle: 'short',numberingSystem: locale === 'ar' ? 'arab' : 'latn' }).format(new Date(entry.chosen_at)) : t('unknownDate')}</dd></div>
        {entry.status === 'watched' && <div><dt>{t('watchedDate')}</dt><dd>{entry.watched_on ? date(`${entry.watched_on}T12:00:00Z`,locale) : t('unknownDate')}</dd></div>}</dl>
    </div>
    <div className="diary-entry-actions">{entry.status === 'chosen' ? <>
      <label>{t('watchDate')}<input type="date" value={on} max={today()} onChange={event => setOn(event.target.value)} /></label>
      <button className="primary" disabled={busy || !on || on > today()} onClick={() => onWatch(entry.id,on)}>{t('markWatched')}</button>
    </> : <><button className="secondary" disabled={busy || undoConflict} onClick={onUndo}>{t('undo')}</button>{undoConflict && <p className="help">{t('undoConflict')}</p>}</>}
      <button className="text-button" disabled={busy} onClick={onDelete}>{t('delete')}</button>
    </div>
  </article>;
}

export function DiaryPanel({ headingRef,account,controller,locale,guestCount,onBack,onImport,onDelete,onClear }: {
  headingRef?: Ref<HTMLHeadingElement>;
  account: AccountState; controller: AccountController; locale: Locale; guestCount: number;
  onBack: () => void; onImport: () => void; onDelete: (id: string) => void; onClear: () => void;
}) {
  const t = diaryT(locale);
  return <section className="diary-panel">
    <div className="results-heading"><div><h1 ref={headingRef} tabIndex={-1}>{t('title')}</h1><p className="lead">{account.identity ? t('intro') : t('optional')}</p></div><button className="secondary" onClick={onBack}>{t('back')}</button></div>
    {account.error && <p className="notice" role="status">{t(account.error)}</p>}
    {account.phase === 'restoring' || account.phase === 'signing-out' ? <p role="status">{t('restoring')}</p> : account.identity ? <>
      <div className="diary-toolbar"><bdi className="account-identity">{account.identity.email}</bdi><button className="secondary" disabled={account.busy || account.loading} onClick={() => { void controller.reload(); }}>{t('retry')}</button><button className="text-button" onClick={() => { void controller.signOut(); }}>{t('signOut')}</button></div>
      <div className="diary-import"><p>{t('guestCount').replace('{count}',number(guestCount,locale))}</p><button className="secondary" disabled={!guestCount || !account.historyReady || account.busy} onClick={onImport}>{t('import')}</button></div>
      <p className="help">{t('dateHelp')}</p>
      {account.loading && <p role="status">{t('loading')}</p>}
      {account.historyReady && !account.entries.length && <p className="empty-panel">{t('empty')}</p>}
      <div className="diary-list">{account.entries.map(entry => <DiaryRow key={entry.id} entry={entry} locale={locale} busy={account.busy || account.loading}
        undoConflict={account.entries.some(other => other.id !== entry.id && other.movie_id === entry.movie_id && other.status === 'chosen')}
        onWatch={(id,on) => { void controller.watched(id,on); }} onUndo={() => { void controller.undo(entry.id); }} onDelete={() => onDelete(entry.id)} />)}</div>
      <button className="secondary" disabled={!account.entries.length || account.busy || account.loading} onClick={onClear}>{t('clear')}</button>
    </> : <div className="account-welcome"><p className="privacy">{t('guests')}</p>
      <button className="primary" disabled={account.google !== 'ready' || account.busy} onClick={() => { void controller.signIn(); }}>{t('signIn')}</button>
      {account.google === 'checking' ? <p role="status">{t('checking')}</p> : account.google === 'disabled' ? <p className="help">{t('signInDisabled')}</p> : account.google === 'unavailable' && <p className="help">{t('signInUnavailable')}</p>}
      <button className="text-button" disabled={account.google === 'checking'} onClick={() => { void controller.checkGoogle(); }}>{t('checkSetup')}</button>
    </div>}
  </section>;
}
