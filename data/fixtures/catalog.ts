import type { Movie, Availability } from '../../src/catalog/schema';

// Every fact below belongs to an ORIGINAL FICTIONAL movie. No real catalog claims.
// The tuples explicitly author title, translation, hook, duration and editorial traits.
type Seed = [string, string, string, string, string, number, Movie['genres'], number[], number[], number, Movie['tradeOff'], Movie['contentFlags']['violence'], Movie['franchiseId']?];
const seeds: Seed[] = [
  ['rooftop-radio', 'Rooftop Radio', 'راديو السطح', 'Two neighbours turn a broken antenna into an unlikely evening concert.', 'جاران يحوّلان هوائيًا معطّلًا إلى حفلة مسائية غير متوقعة.', 86, ['comedy', 'romance'], [1,.4,.1,.6], [.7,1,.8], .2, 'dialogue', 'no'],
  ['paper-moon-cafe', 'Paper Moon Café', 'مقهى القمر الورقي', 'A quiet café hosts a contest for the most peculiar handwritten menu.', 'مقهى هادئ ينظّم مسابقة لأغرب قائمة طعام مكتوبة باليد.', 94, ['comedy', 'drama'], [.9,.6,.1,.5], [.8,.9,.8], .3, 'slow', 'no'],
  ['last-tram', 'The Last Tram', 'الترام الأخير', 'Three strangers solve a curious puzzle before their final stop.', 'ثلاثة غرباء يحلّون لغزًا غريبًا قبل محطتهم الأخيرة.', 108, ['mystery', 'drama'], [.3,.8,.8,.4], [1,.8,.7], .5, 'dialogue', 'no'],
  ['small-orbit', 'A Small Orbit', 'مدار صغير', 'A repair crew finds a miniature planet inside an abandoned observatory.', 'فريق صيانة يجد كوكبًا مصغّرًا داخل مرصد مهجور.', 112, ['scifi', 'adventure'], [.6,.6,.4,1], [.9,.8,1], .8, 'subtitles', 'no'],
  ['umbrella-club', 'The Umbrella Club', 'نادي المظلات', 'Friends invent a neighbourhood sport for a week of endless rain.', 'أصدقاء يبتكرون رياضة للحَيّ خلال أسبوع من المطر المتواصل.', 78, ['comedy', 'adventure'], [1,.2,.1,.7], [.6,.8,1], .2, 'dialogue', 'no'],
  ['borrowed-tuesday', 'Borrowed Tuesday', 'ثلاثاء مستعار', 'A clockmaker lends one ordinary afternoon to a stranger.', 'صانع ساعات يعير عصرًا عاديًا لشخص غريب.', 101, ['drama', 'romance'], [.5,1,.2,.7], [1,1,.5], .6, 'slow', 'no'],
  ['night-map', 'The Night Map', 'خريطة الليل', 'A courier follows a map whose streets change after sunset.', 'ساعٍ يتبع خريطة تتغيّر شوارعها بعد الغروب.', 117, ['mystery', 'adventure'], [.2,.5,1,.8], [.9,.8,.9], .7, 'intense', 'yes'],
  ['blue-suitcase', 'The Blue Suitcase', 'الحقيبة الزرقاء', 'An accidental luggage swap becomes a gentle railway treasure hunt.', 'تبديل حقائب بالخطأ يتحوّل إلى رحلة هادئة للبحث عن كنز.', 92, ['romance', 'comedy'], [.9,.5,.2,.6], [.7,1,.7], .3, 'subtitles', 'no'],
  ['silent-garden', 'The Silent Garden', 'الحديقة الصامتة', 'A gardener records the stories of a courtyard about to change.', 'بستاني يسجّل حكايات فناء على وشك التغيّر.', 119, ['drama'], [.3,1,.1,.5], [1,.7,.4], .6, 'slow', 'no'],
  ['star-archive', 'The Star Archive', 'أرشيف النجوم', 'An archivist receives postcards from a city that has not been built.', 'أمين أرشيف يتلقّى بطاقات من مدينة لم تُبنَ بعد.', 126, ['scifi', 'mystery'], [.3,.9,.7,1], [1,.8,.7], .9, 'dialogue', 'no'],
  ['midnight-bakery', 'Midnight Bakery', 'مخبز منتصف الليل', 'A disastrous baking shift turns into a friendly competition.', 'وردية خبز كارثية تتحوّل إلى منافسة ودّية.', 83, ['comedy'], [1,.3,.1,.4], [.6,.9,1], .1, 'dialogue', 'no'],
  ['glass-bridge', 'The Glass Bridge', 'الجسر الزجاجي', 'Two engineers must cross their unfinished bridge before a storm.', 'مهندسان يحاولان عبور جسرهما غير المكتمل قبل العاصفة.', 110, ['adventure', 'drama'], [.1,.7,1,.5], [.9,.7,.9], .5, 'intense', 'yes'],
  ['sunday-detectives', 'Sunday Detectives', 'محقّقو الأحد', 'Amateur detectives investigate a missing community trophy.', 'محقّقون هواة يبحثون عن كأس الحَيّ المفقود.', 96, ['comedy', 'mystery'], [.9,.5,.5,.4], [.7,.9,1], .2, 'dialogue', 'no', 'sunday'],
  ['sunday-return', 'Sunday Detectives: The Return', 'محقّقو الأحد: العودة', 'The same club tackles a mystery of vanishing picnic baskets.', 'النادي نفسه يحلّ لغز اختفاء سلّات النزهات.', 98, ['comedy', 'mystery'], [.9,.4,.5,.4], [.7,.9,1], .25, 'dialogue', 'no', 'sunday'],
  ['floating-library', 'The Floating Library', 'المكتبة العائمة', 'A librarian sails between islands to reunite unfinished stories.', 'أمينة مكتبة تبحر بين الجزر لتجمع حكايات غير مكتملة.', 104, ['adventure', 'drama'], [.6,.9,.2,1], [1,.8,.7], .8, 'slow', 'no'],
  ['second-window', 'The Second Window', 'النافذة الثانية', 'A photographer discovers a different city through one apartment window.', 'مصوّر يكتشف مدينة أخرى من نافذة شقّته.', 114, ['mystery', 'scifi'], [.2,.8,.9,.9], [1,.8,.6], .9, 'intense', 'unknown'],
  ['little-detour', 'A Little Detour', 'منعطف صغير', 'A short bus detour leads a pair of rivals to an unexpected picnic.', 'انحراف قصير للحافلة يقود منافسَين إلى نزهة غير متوقعة.', 72, ['comedy', 'romance'], [1,.3,.1,.5], [.7,1,.8], .2, 'dialogue', 'no'],
  ['winter-signal', 'Winter Signal', 'إشارة الشتاء', 'A remote station receives a message repeating tomorrow’s weather.', 'محطّة نائية تتلقّى رسالة تكرّر طقس الغد.', 132, ['scifi', 'drama'], [.1,1,.8,.8], [1,.7,.6], .9, 'slow', 'no'],
  ['lantern-race', 'The Lantern Race', 'سباق الفوانيس', 'A village relay team carries one fragile lantern over the hills.', 'فريق من القرية يحمل فانوسًا هشًّا في سباق عبر التلال.', 89, ['adventure', 'comedy'], [.8,.4,.4,.8], [.7,.8,1], .4, 'subtitles', 'no'],
  ['fourth-chair', 'The Fourth Chair', 'الكرسي الرابع', 'An empty chair changes a family’s weekly board-game ritual.', 'كرسي فارغ يغيّر طقس العائلة الأسبوعي لألعاب الطاولة.', 107, ['drama', 'comedy'], [.6,1,.2,.3], [1,.9,.7], .4, 'dialogue', 'no'],
  ['violet-hour', 'The Violet Hour', 'الساعة البنفسجية', 'An illustrator and a musician try to capture the same sunset.', 'رسّامة وموسيقي يحاولان توثيق الغروب نفسه.', 91, ['romance', 'drama'], [.7,.9,.1,.7], [.8,1,.5], .5, 'slow', 'no'],
  ['echo-vault', 'The Echo Vault', 'خزنة الصدى', 'A sound technician hears a hidden countdown in an empty theatre.', 'فنّي صوت يسمع عدًّا تنازليًا مخفيًّا في مسرح فارغ.', 103, ['mystery'], [.1,.5,1,.3], [1,.6,.8], .6, 'intense', 'yes'],
  ['kite-workshop', 'The Kite Workshop', 'ورشة الطائرات الورقية', 'A mismatched team builds a kite large enough to shade the town square.', 'فريق متباين يصنع طائرة ورقية تُظلّل ساحة البلدة.', 80, ['comedy', 'adventure'], [1,.4,.1,.8], [.6,.9,1], .3, 'dialogue', 'no'],
  ['museum-tomorrow', 'The Museum of Tomorrow’s Ordinary Things', 'متحف الأشياء العادية في الغد', 'A museum curator catalogues everyday objects brought back from the future.', 'أمينة متحف تُفهرس أشياء يومية وصلت من المستقبل.', 118, ['scifi', 'comedy'], [.8,.8,.3,1], [1,.8,.8], .85, 'dialogue', 'no'],
];

export const fixtureMovies: Movie[] = seeds.map(([slug,en,ar,hookEn,hookAr,runtime,genre,mood,context,adventure,tradeOff,violence,franchise]) => ({
  id: `fixture-${slug}`, dataKind: 'synthetic', titles: { en, ar }, year: 2024,
  releaseDate: '2024-01-01', runtimeMinutes: runtime, genres: genre,
  originalLanguage: tradeOff === 'subtitles' ? 'ar' : 'en', originalHooks: { en: hookEn, ar: hookAr },
  moodScores: { light: mood[0], thoughtful: mood[1], tense: mood[2], wonder: mood[3] },
  contextScores: { solo: context[0], couple: context[1], friends: context[2] },
  adventureScore: adventure, editorialConfidence: .9,
  contentFlags: { violence, sexualContent: 'no', strongLanguage: slug === 'echo-vault' ? 'yes' : 'no', horror: slug === 'second-window' ? 'unknown' : 'no' },
  tradeOff, franchiseId: franchise ?? null, reviewState: 'fixture-reviewed',
  provenance: { kind: 'synthetic', sourceUrls: [], license: 'original-synthetic', retrievedAt: '2026-10-13', reviewer: 'Codex fixture audit' },
}));

// Fixed dates are intentional: simulation evidence really expires, never rolls forward silently.
export const fixtureAvailability: Availability[] = fixtureMovies.slice(0, 14).map((movie,index) => ({
  movieId: movie.id, countryCode: index === 13 ? 'AE' : 'QA',
  providerId: index % 2 ? 'demo-orbit' : 'demo-lantern', accessType: index === 12 ? 'rent' : 'subscription',
  verifiedAt: index === 11 ? '2026-10-01T00:00:00Z' : '2026-10-13T00:00:00Z',
  expiresAt: index === 11 ? '2026-10-08T00:00:00Z' : '2026-10-20T00:00:00Z',
  sourceUrl: null, destinationUrl: null, reviewer: 'Codex fixture audit', reviewState: 'fixture-reviewed', dataKind: 'synthetic',
}));

export const fixtureCatalog = { version: 'synthetic-1', movies: fixtureMovies, availability: fixtureAvailability };
