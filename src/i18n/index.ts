import type { Locale } from '../catalog/schema';
import type { Reason } from '../engine/types';

export const en = {
  brand: 'Movie Night Engine', brandSmall: 'A little less scrolling. A little more watching.',
  demo: 'Synthetic demo catalog — these are fictional movies', demoDetail: 'All titles, metadata and provider examples are invented for local testing. Nothing here claims real streaming availability.',
  start: 'Find tonight’s picks', startTitle: 'Less searching. More movie night.', startCopy: 'Your mood. Your time. Your kind of movie. A few quick choices, then a shortlist worth settling into.',
  demoAbout: 'About the demo', heroNote: 'Six short steps. Up to three considered picks.', coverLabel: 'A glimpse of the fictional catalog', flowAside: 'Set the mood. We’ll narrow the choices.', yourNight: 'Your movie night',
  local: 'Your history stays on this device. No account, keys or movie-data requests.',
  clear: 'Clear history', clearConfirm: 'Clear watched, chosen and rejected history on this device? Your preferences stay.', cancel: 'Cancel', confirmClear: 'Yes, clear history', cleared: 'History cleared. Your preferences are kept.',
  language: 'Language', country: 'Country', QA: 'Qatar', AE: 'United Arab Emirates', GB: 'United Kingdom',
  solo: 'Solo', couple: 'With a partner', friends: 'With friends', watchingMode: 'Who’s watching?', shared: 'One shared set of tastes on this device.',
  step: 'Step', of: 'of', next: 'Continue', back: 'Back', finish: 'Show my picks', edit: 'Change inputs',
  step1: 'Set the scene.', step2: 'What should tonight feel like?', step3: 'How much time do you have?',
  step4: 'Where will you watch?', step5: 'Familiar comfort or a little surprise?', step6: 'Set your boundaries.',
  mood: 'Tonight’s mood', light: 'Light & easy', thoughtful: 'Something thoughtful', tense: 'Keep me guessing', wonder: 'A sense of wonder',
  genres: 'Genres', genresHelp: 'Choose up to three, or leave open.', comedy: 'Comedy', drama: 'Drama', mystery: 'Mystery', adventure: 'Adventure', romance: 'Romance', scifi: 'Science fiction',
  runtime: 'Maximum runtime', minutes: 'minutes', overrun: 'Allow up to 10 extra minutes', overrunHelp: 'Your limit is strict unless you explicitly allow this.',
  selfCheck: 'I will check availability myself', strict: 'Require current service evidence', providerHelp: 'The demo providers are imaginary. Real services below have no supported catalog coverage.',
  'demo-lantern': 'Lantern — simulated', 'demo-orbit': 'Orbit — simulated', netflix: 'Netflix — unsupported', prime: 'Prime Video — unsupported',
  strictHelp: 'Only a current, matching subscription record passes. Unknown, expired, rental and other-country records do not.',
  chooseProvider: 'Select at least one service for strict filtering.',
  comfort: 'Familiar comfort', balanced: 'A mix of both', surprise: 'More adventurous', adventureHelp: 'Surprise stays inside every hard boundary you set.',
  watched: 'Exclude films I’ve marked seen', advanced: 'Title and content exclusions', excludeTitle: 'Do not suggest these titles', vetoHelp: 'Unknown content tags fail an exclusion; this is not a family-safety guarantee.',
  violence: 'Violence', sexualContent: 'Sexual content', strongLanguage: 'Strong language', horror: 'Horror',
  content: 'Avoid this content', review: 'Tonight, at a glance', openGenres: 'Any genre', noVetoes: 'No content vetoes',
  resultsTitle: 'A shortlist for tonight.', resultIntro: 'Start with the first pick. Every option respects your hard filters.', recommended: 'Start here', pick: 'Pick',
  fewer: 'Fewer than three picks remain under your filters and history. We have kept your boundaries.', eligible: 'eligible titles',
  emptyTitle: 'No honest match tonight.', emptyCopy: 'Nothing passes all your filters and history. Your boundaries have not been relaxed.',
  adjustAvailability: 'Continue without availability filtering', adjustRuntime: 'Set the runtime limit to', adjustReview: 'Review exclusions and history',
  choose: 'Choose this', chosen: 'Chosen for tonight', chosenNote: 'Choosing records your decision; it does not mark a film watched.',
  seen: 'Mark seen', alreadySeen: 'Marked seen', replace: 'Replace', replaced: 'Replacement used', exhausted: 'No eligible replacement remains. Your other picks are kept.',
  seenNote: 'Marked seen. This title is saved in your local history.', replaceNote: 'Pick replaced. Your other picks are kept.',
  tradeOff: 'Worth knowing', dialogue: 'More dialogue than action.', slow: 'A slower pace; give it room to unfold.', intense: 'Some tense scenes; less suited to an easy evening.', subtitles: 'The fictional original is in Arabic; you may want subtitles.', none: 'No reviewed trade-off is recorded for this fixture.',
  runtimeReason: 'Fits your limit: {minutes} minutes within {limit}.', moodReason: 'Reviewed demo tags match your mood: {mood}.',
  genreReason: 'Includes your requested genre: {genre}.', contextReason: 'Reviewed demo tags suit watching {context}.',
  contextLimitedReason: 'Reviewed demo tags show a weaker fit for watching {context}.', adventureReason: 'Reviewed demo tags fit your {preference} preference.',
  weakEvidence: 'No second supported reason is recorded for this fixture.',
  unknown: 'Availability unknown', simulated: 'Simulated availability only', checked: 'Demo check', expires: 'Expires', checkAction: 'How to check availability',
  checkHelp: 'These films and providers are fictional. For a real catalog, confirm the title, country, subscription access and runtime in your own service before watching. No provider link exists in this demo.',
  storageRecovered: 'Unreadable local data was reset. You can continue.', storageUnavailable: 'Local storage is unavailable. This session works, but changes may not survive a reload.',
  storageFuture: 'Saved data uses a newer format. This session will not overwrite it.',
  history: 'Local history', watchedCount: 'seen', selectedCount: 'chosen', rejectedCount: 'rejected', historyEmpty: 'No titles marked seen yet.',
  fixture: 'Fictional title', simulationDate: 'Simulated evidence expires after seven days and is never renewed automatically.',
  footer: 'Made for the part of the evening before you press play.', close: 'Close',
} as const;

type Key = keyof typeof en;
export const ar: Record<Key, string> = {
  brand: 'محرّك سهرة الأفلام', brandSmall: 'تصفّح أقل، ووقت أكثر للمشاهدة.',
  demo: 'كتالوج تجريبي اصطناعي — هذه أفلام خيالية', demoDetail: 'كل العناوين والبيانات وأمثلة المنصّات خيالية للاختبار المحلي. لا تدّعي أي معلومات توفّر حقيقي للمشاهدة.',
  start: 'اعثر على اقتراحات الليلة', startTitle: 'بحث أقل. سهرة أفلام أجمل.', startCopy: 'جوّك ووقتك ونوع الفيلم الذي تحبّه. خيارات سريعة، ثم قائمة قصيرة تستحقّ سهرتك.',
  demoAbout: 'عن العرض التجريبي', heroNote: 'ستّ خطوات قصيرة، وحتى ثلاثة اقتراحات مدروسة.', coverLabel: 'لمحة من الكتالوج الخيالي', flowAside: 'حدّد جوّك، وسنختصر الخيارات.', yourNight: 'سهرة أفلامك',
  local: 'يبقى سجلك على هذا الجهاز. دون حساب أو مفاتيح أو طلبات بيانات أفلام.',
  clear: 'مسح السجل', clearConfirm: 'هل تريد مسح سجل الأفلام المشاهَدة والمختارة والمرفوضة على هذا الجهاز؟ ستبقى تفضيلاتك.', cancel: 'إلغاء', confirmClear: 'نعم، امسح السجل', cleared: 'مُسح السجل وبقيت تفضيلاتك.',
  language: 'اللغة', country: 'البلد', QA: 'قطر', AE: 'الإمارات العربية المتحدة', GB: 'المملكة المتحدة',
  solo: 'بمفردي', couple: 'مع شريك', friends: 'مع الأصدقاء', watchingMode: 'من سيشاهد؟', shared: 'مجموعة أذواق مشتركة على جهاز واحد.',
  step: 'الخطوة', of: 'من', next: 'متابعة', back: 'رجوع', finish: 'عرض اقتراحاتي', edit: 'تغيير الخيارات',
  step1: 'لنهيّئ السهرة.', step2: 'أيّ جوّ تريد الليلة؟', step3: 'كم لديك من الوقت؟', step4: 'أين ستشاهد؟', step5: 'راحة مألوفة أم مفاجأة صغيرة؟', step6: 'حدّد حدودك.',
  mood: 'جوّ الليلة', light: 'خفيف ومريح', thoughtful: 'شيء يدعو للتأمّل', tense: 'تشويق وترقّب', wonder: 'إحساس بالدهشة',
  genres: 'الأنواع', genresHelp: 'اختر حتى ثلاثة أنواع، أو اترك الاختيار مفتوحًا.', comedy: 'كوميديا', drama: 'دراما', mystery: 'غموض', adventure: 'مغامرة', romance: 'رومانسية', scifi: 'خيال علمي',
  runtime: 'المدة القصوى', minutes: 'دقيقة', overrun: 'السماح بعشر دقائق إضافية كحدّ أقصى', overrunHelp: 'نلتزم بحدّك ما لم تسمح بهذه الزيادة صراحةً.',
  selfCheck: 'سأتحقّق من التوفّر بنفسي', strict: 'اشتراط دليل توفّر حديث على المنصّة', providerHelp: 'منصّات العرض التجريبية خيالية. لا توجد تغطية معتمدة للمنصّات الحقيقية أدناه.',
  'demo-lantern': 'فانوس — محاكاة', 'demo-orbit': 'مدار — محاكاة', netflix: 'نتفليكس — غير مدعوم', prime: 'برايم فيديو — غير مدعوم',
  strictHelp: 'يمرّ فقط سجل اشتراك حديث يطابق البلد والمنصّة. لا تمرّ السجلات المجهولة أو المنتهية أو المؤجّرة أو الخاصة ببلد آخر.', chooseProvider: 'اختر منصّة واحدة على الأقل للتصفية الصارمة.',
  comfort: 'راحة مألوفة', balanced: 'مزيج من الاثنين', surprise: 'مغامرة أكثر', adventureHelp: 'تبقى المفاجأة ضمن كل الحدود التي حدّدتها.',
  watched: 'استبعاد الأفلام التي علّمتها كمشاهَدة', advanced: 'استبعاد عناوين ومحتوى', excludeTitle: 'لا تقترح هذه العناوين', vetoHelp: 'يُستبعد المحتوى مجهول التصنيف عند طلب تجنّبه؛ هذا ليس ضمانًا لملاءمة عائلية.',
  violence: 'عنف', sexualContent: 'محتوى جنسي', strongLanguage: 'ألفاظ قوية', horror: 'رعب', content: 'تجنّب هذا المحتوى', review: 'ملخّص الليلة', openGenres: 'أيّ نوع', noVetoes: 'دون استبعادات محتوى',
  resultsTitle: 'قائمة قصيرة لليلتك.', resultIntro: 'ابدأ بالاقتراح الأول. كل الخيارات تلتزم بحدودك الصارمة.', recommended: 'ابدأ هنا', pick: 'اقتراح',
  fewer: 'تبقّى أقل من ثلاثة اقتراحات وفق خياراتك وسجلك. حافظنا على حدودك.', eligible: 'عناوين مؤهّلة',
  emptyTitle: 'لا توجد نتيجة صادقة الليلة.', emptyCopy: 'لا يمرّ أيّ عنوان بكل خياراتك وسجلك. لم نخفّف حدودك.',
  adjustAvailability: 'المتابعة دون تصفية التوفّر', adjustRuntime: 'تعديل الحدّ الزمني إلى', adjustReview: 'مراجعة الاستبعادات والسجل',
  choose: 'اختر هذا', chosen: 'اختيار الليلة', chosenNote: 'الاختيار يسجّل قرارك؛ لا يُصنّف الفيلم كمشاهَد.', seen: 'علّمه كمشاهَد', alreadySeen: 'مُعلَّم كمشاهَد', replace: 'استبدال', replaced: 'استُخدم الاستبدال', exhausted: 'لا يوجد بديل مؤهّل. احتفظنا بباقي اقتراحاتك.',
  seenNote: 'عُلّم كمشاهَد وحُفظ في سجلك المحلي.', replaceNote: 'استُبدل الاقتراح واحتُفظ بباقي الخيارات.',
  tradeOff: 'ما يستحقّ المعرفة', dialogue: 'حوارات أكثر من الحركة.', slow: 'إيقاع أبطأ؛ امنحه وقتًا ليتطوّر.', intense: 'بعض المشاهد المتوتّرة؛ أقل ملاءمة لسهرة هادئة.', subtitles: 'اللغة الأصلية الخيالية عربية؛ قد تحتاج إلى ترجمة.', none: 'لم تُسجّل ملاحظة تحريرية مُراجَعة لهذه العيّنة.',
  runtimeReason: 'يناسب حدّك: {minutes} دقيقة ضمن {limit}.', moodReason: 'التصنيفات التجريبية المُراجَعة تناسب جوّك: {mood}.', genreReason: 'يتضمّن النوع الذي طلبته: {genre}.',
  contextReason: 'التصنيفات التجريبية المُراجَعة تناسب المشاهدة {context}.', contextLimitedReason: 'تشير التصنيفات التجريبية المُراجَعة إلى ملاءمة أضعف للمشاهدة {context}.', adventureReason: 'التصنيفات التجريبية المُراجَعة تناسب تفضيلك: {preference}.', weakEvidence: 'لم يُسجّل سبب ثانٍ مدعوم لهذه العيّنة.',
  unknown: 'التوفّر مجهول', simulated: 'محاكاة للتوفّر فقط', checked: 'التحقّق التجريبي', expires: 'ينتهي', checkAction: 'كيفية التحقّق من التوفّر',
  checkHelp: 'هذه الأفلام والمنصّات خيالية. في الكتالوج الحقيقي، تحقّق من العنوان والبلد ونوع الاشتراك والمدة في منصّتك قبل المشاهدة. لا يوجد رابط منصّة في هذا العرض التجريبي.',
  storageRecovered: 'أُعيد ضبط بيانات محلية غير مقروءة. يمكنك المتابعة.', storageUnavailable: 'التخزين المحلي غير متاح. تعمل هذه الجلسة، لكن قد لا تبقى تغييراتك بعد إعادة التحميل.', storageFuture: 'تستخدم البيانات المحفوظة صيغة أحدث. لن تستبدلها هذه الجلسة.',
  history: 'السجل المحلي', watchedCount: 'مشاهَد', selectedCount: 'مختار', rejectedCount: 'مرفوض', historyEmpty: 'لم تعلّم أيّ عنوان كمشاهَد بعد.', fixture: 'عنوان خيالي', simulationDate: 'ينتهي دليل المحاكاة بعد سبعة أيام ولا يتجدّد تلقائيًا.', footer: 'صُنع للحظات التي تسبق بدء الفيلم.', close: 'إغلاق',
};

export function translator(locale: Locale) { const dictionary = locale === 'ar' ? ar : en; return (key: Key): string => dictionary[key]; }
export function number(value: number, locale: Locale): string { return new Intl.NumberFormat(locale, { useGrouping: false, numberingSystem: locale === 'ar' ? 'arab' : 'latn' }).format(value); }
export function date(value: string, locale: Locale): string { return new Intl.DateTimeFormat(locale, { dateStyle: 'medium', timeZone: 'UTC', calendar: 'gregory', numberingSystem: locale === 'ar' ? 'arab' : 'latn' }).format(new Date(value)); }
function interpolate(template: string, variables: Record<string,string>): string { return template.replace(/\{(\w+)\}/g, (_,key: string) => variables[key] ?? ''); }
export function reasonText(reason: Reason, locale: Locale): string {
  const t = translator(locale);
  switch (reason.key) {
    case 'runtime': return interpolate(t('runtimeReason'), { minutes: number(reason.evidence.minutes,locale), limit: number(reason.evidence.limit,locale) });
    case 'mood': return interpolate(t('moodReason'), { mood: t(reason.evidence.mood) });
    case 'genre': return interpolate(t('genreReason'), { genre: t(reason.evidence.genre) });
    case 'context': return interpolate(t(reason.evidence.score >= .7 ? 'contextReason' : 'contextLimitedReason'), { context: t(reason.evidence.context) });
    case 'adventure': return interpolate(t('adventureReason'), { preference: t(reason.evidence.preference >= .7 ? 'surprise' : reason.evidence.preference >= .4 ? 'balanced' : 'comfort') });
  }
}
