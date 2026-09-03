/**
 * Zabandaan — content database seed script
 *
 * Populates the three content tables with Urdu learning data:
 *   - idioms_content        20 idioms   (10 easy with images, 10 hard)
 *   - poetry_content        12 couplets (4 Allama Iqbal, 4 Faiz, 4 Ghalib)
 *   - wordsearch_wordlists  25 words    (15 easy, 10 hard)
 *
 * The script is idempotent: it clears the three content tables inside a
 * single transaction and re-inserts fresh data. User / progress tables
 * are never touched.
 *
 * Usage:
 *   npm run seed        (from the server/ directory)
 *   node seed.js
 */

const db = require("./db");

/* =================================================================== */
/* IDIOMS — 20 total (10 easy + 10 hard)                                */
/* =================================================================== */

const idioms = [
  /* ---------- Easy (with illustrations from client/public/images/idioms/) ---------- */

  {
    idiom_urdu: "آنکھوں کا تارا",
    idiom_roman: "Aankhon ka tara",
    correct_meaning: "The apple of one's eye; someone very dear and beloved",
    distractor_1: "To keep a close watch on someone",
    distractor_2: "To feel jealous of someone",
    distractor_3: "To be extremely angry with someone",
    example_sentence: "میری چھوٹی بیٹی مجھے آنکھوں کا تارا لگتی ہے۔",
    difficulty: "easy",
    image_path: "/images/idioms/aankhon-ka-tara.png",
  },
  {
    idiom_urdu: "آسمان سر پر اٹھانا",
    idiom_roman: "Aasman sar par uthana",
    correct_meaning: "To make a lot of noise; raise a huge commotion",
    distractor_1: "To achieve the impossible",
    distractor_2: "To be overjoyed with happiness",
    distractor_3: "To burden someone with heavy responsibilities",
    example_sentence: "بچوں نے اتنا شور مچایا کہ آسمان سر پر اٹھا دیا۔",
    difficulty: "easy",
    image_path: "/images/idioms/aasman-sar-par.png",
  },
  {
    idiom_urdu: "دال میں کالا",
    idiom_roman: "Daal mein kaala",
    correct_meaning: "Something fishy; a suspicious element in the affair",
    distractor_1: "To spoil a well-made plan",
    distractor_2: "A very generous and kind person",
    distractor_3: "To mix up two different things",
    example_sentence: "اس کے رویے سے لگتا ہے کہ دال میں کچھ کالا ہے۔",
    difficulty: "easy",
    image_path: "/images/idioms/daal-mein-kaala.png",
  },
  {
    idiom_urdu: "دانتوں تلے انگلی دبانا",
    idiom_roman: "Danton tale ungli dabana",
    correct_meaning: "To be utterly amazed; completely astonished",
    distractor_1: "To be extremely frightened",
    distractor_2: "To suppress one's laughter",
    distractor_3: "To regret a missed opportunity",
    example_sentence: "اس کی کامیابی کی خبر سن کر سب دانتوں تلے انگلی دبا بیٹھے۔",
    difficulty: "easy",
    image_path: "/images/idioms/danton-ungli.png",
  },
  {
    idiom_urdu: "کان بھرنا",
    idiom_roman: "Kaan bharna",
    correct_meaning: "To poison someone's mind; fill someone's ears with gossip",
    distractor_1: "To listen very attentively",
    distractor_2: "To obey someone's every command",
    distractor_3: "To pretend not to hear anything",
    example_sentence: "کسی نے اس کے کان بھر دیے تھے، اسی لیے وہ مجھ سے ناراض ہے۔",
    difficulty: "easy",
    image_path: "/images/idioms/kaan-bharna.png",
  },
  {
    idiom_urdu: "منہ میں پانی آنا",
    idiom_roman: "Mun mein paani aana",
    correct_meaning: "To crave something; to have one's mouth water",
    distractor_1: "To be speechless with anger",
    distractor_2: "To speak rudely to elders",
    distractor_3: "To feel pity for someone",
    example_sentence: "بریانی کی خوشبو سے مجھے منہ میں پانی آ گیا۔",
    difficulty: "easy",
    image_path: "/images/idioms/mun-paani.png",
  },
  {
    idiom_urdu: "ناک میں دم کرنا",
    idiom_roman: "Naak mein dam karna",
    correct_meaning: "To annoy someone greatly; to be a constant nuisance",
    distractor_1: "To help someone catch their breath",
    distractor_2: "To praise someone excessively",
    distractor_3: "To breathe peacefully after hard work",
    example_sentence: "اس کی مسلسل شکایتوں نے مجھے ناک میں دم کر دیا۔",
    difficulty: "easy",
    image_path: "/images/idioms/naak-mein-dam.png",
  },
  {
    idiom_urdu: "اونٹ کے منہ میں زیرا",
    idiom_roman: "Oont ke mun mein zeera",
    correct_meaning: "A drop in the ocean; an amount far too small for the need",
    distractor_1: "A perfect match made in heaven",
    distractor_2: "Too much of a good thing",
    distractor_3: "A very expensive bargain",
    example_sentence: "اتنی بڑی ضرورت میں یہ چند روپے تو اونٹ کے منہ میں زیرا ہیں۔",
    difficulty: "easy",
    image_path: "/images/idioms/oont-zeera.png",
  },
  {
    idiom_urdu: "پاؤں زمین پر نہ پڑنا",
    idiom_roman: "Paon zameen par na padna",
    correct_meaning: "To be overjoyed; so happy that one floats on air",
    distractor_1: "To be extremely tired and weak",
    distractor_2: "To feel lost and confused",
    distractor_3: "To stumble repeatedly while walking",
    example_sentence: "اول درجے میں آنے کی خوشی میں اس کے پاؤں زمین پر نہیں پڑ رہے تھے۔",
    difficulty: "easy",
    image_path: "/images/idioms/paon-zameen.png",
  },
  {
    idiom_urdu: "الٹی گنگا بہانا",
    idiom_roman: "Ulti ganga bahana",
    correct_meaning: "To do things the wrong way round; reverse the natural order",
    distractor_1: "To go with the flow of events",
    distractor_2: "To finish work smoothly and quickly",
    distractor_3: "To waste a golden opportunity",
    example_sentence: "پہلے جواب دے رہے ہو، سوال آخر میں پوچھا تھا — الٹی گنگا بہا دی تم نے۔",
    difficulty: "easy",
    image_path: "/images/idioms/ulti-ganga.png",
  },

  /* ---------- Hard (no illustrations) ---------- */

  {
    idiom_urdu: "نو دو گیارہ ہونا",
    idiom_roman: "Nau do gyarah hona",
    correct_meaning: "To run away; to make a quick escape",
    distractor_1: "To count numbers in a hurry",
    distractor_2: "To be caught red-handed",
    distractor_3: "To make a firm, final decision",
    example_sentence: "گارڈ آتا دیکھ کر چور نو دو گیارہ ہو گیا۔",
    difficulty: "hard",
    image_path: null,
  },
  {
    idiom_urdu: "ٹکے سیر ہو جانا",
    idiom_roman: "Tukke sair ho jana",
    correct_meaning: "To become dirt cheap; available in abundance",
    distractor_1: "To become extremely expensive",
    distractor_2: "To become rare and precious",
    distractor_3: "To travel around the world",
    example_sentence: "اس موسم میں یہ پھل بازار میں ٹکے سیر ہو جاتے ہیں۔",
    difficulty: "hard",
    image_path: null,
  },
  {
    idiom_urdu: "آستین کا سانپ",
    idiom_roman: "Aasteen ka saanp",
    correct_meaning: "A hidden enemy; a traitor within one's own trusted circle",
    distractor_1: "A loyal and trusted friend",
    distractor_2: "A sudden stroke of good luck",
    distractor_3: "A very difficult problem to solve",
    example_sentence: "راز فاش ہوا تو پتہ چلا کہ وہ خود آستین کا سانپ تھا۔",
    difficulty: "hard",
    image_path: null,
  },
  {
    idiom_urdu: "اپنی کھچڑی الگ پکانا",
    idiom_roman: "Apni khichdi alag pakana",
    correct_meaning: "To keep to oneself; to pursue one's own separate agenda",
    distractor_1: "To prepare a special meal for guests",
    distractor_2: "To work hard day and night",
    distractor_3: "To share everything with everyone",
    example_sentence: "ٹیم کے فیصلوں سے ہٹ کر وہ ہمیشہ اپنی کھچڑی الگ پکاتا ہے۔",
    difficulty: "hard",
    image_path: null,
  },
  {
    idiom_urdu: "گھر کی مرغی دال برابر",
    idiom_roman: "Ghar ki murghi daal barabar",
    correct_meaning: "Familiar things are undervalued; one's own people are taken for granted",
    distractor_1: "Home-cooked food is the healthiest food",
    distractor_2: "To sell household items at a low price",
    distractor_3: "To waste household resources carelessly",
    example_sentence: "شہر بھر میں اس کے فن کی دھوم ہے، مگر گھر کی مرغی دال برابر ہے۔",
    difficulty: "hard",
    image_path: null,
  },
  {
    idiom_urdu: "لوہے کے چنے چبانا",
    idiom_roman: "Lohe ke chane chabana",
    correct_meaning: "To grapple with an extremely difficult task; to suffer great hardship",
    distractor_1: "To enjoy a delicious, hearty meal",
    distractor_2: "To build a strong and healthy body",
    distractor_3: "To win a prize without any effort",
    example_sentence: "سرکاری دفتروں میں کام کروانا لوہے کے چنے چبانے سے کم نہیں۔",
    difficulty: "hard",
    image_path: null,
  },
  {
    idiom_urdu: "تیر تکے پر مارنا",
    idiom_roman: "Teer tukke par maarna",
    correct_meaning: "To succeed by sheer luck; to hit the mark by a fluke",
    distractor_1: "To aim carefully and succeed",
    distractor_2: "To fail despite trying hard",
    distractor_3: "To waste all one's arrows",
    example_sentence: "بغیر تیاری کے امتحان دیا اور تیر تکے پر مار دیا۔",
    difficulty: "hard",
    image_path: null,
  },
  {
    idiom_urdu: "چراغ تلے اندھیرا",
    idiom_roman: "Chirag tale andhera",
    correct_meaning: "Wrongdoing hidden right under one's nose; darkness beneath the lamp",
    distractor_1: "A small lamp can spread great light",
    distractor_2: "To keep a treasure safely hidden away",
    distractor_3: "To shine brightly in one's own hometown",
    example_sentence: "چوکیدار خود چوری میں ملوث نکلا — سچ مچ چراغ تلے اندھیرا تھا۔",
    difficulty: "hard",
    image_path: null,
  },
  {
    idiom_urdu: "ہاتھ کنگن کو آرسی کیا",
    idiom_roman: "Haath kangan ko aarsi kya",
    correct_meaning: "The obvious needs no proof; what is evident requires no evidence",
    distractor_1: "To buy jewellery without inspecting it",
    distractor_2: "To admire oneself in the mirror daily",
    distractor_3: "A true gift must come from the heart",
    example_sentence: "تم نے خود یہ کام کیا ہے، ثبوت کی کیا ضرورت — ہاتھ کنگن کو آرسی کیا۔",
    difficulty: "hard",
    image_path: null,
  },
  {
    idiom_urdu: "بندر کیا جانے ادرک کا سواد",
    idiom_roman: "Bandar kya jaane adrak ka swaad",
    correct_meaning: "One who cannot appreciate value; pearls before swine",
    distractor_1: "Animals enjoy eating spicy food",
    distractor_2: "A monkey stole the ginger crop",
    distractor_3: "To develop a taste for new things",
    example_sentence: "اسے کلاسیکی موسیقی کا کیا پتہ — بندر کیا جانے ادرک کا سواد۔",
    difficulty: "hard",
    image_path: null,
  },
];

/* =================================================================== */
/* POETRY — 12 couplets (4 Iqbal, 4 Faiz, 4 Ghalib)                     */
/* =================================================================== */

const poetry = [
  /* ---------- Allama Iqbal ---------- */

  {
    couplet_urdu: "لب پہ آتی ہے دعا بن کے تمنا میری\nزندگی شمع کی صورت ہو خدایا میری",
    couplet_roman: "Lab pe aati hai dua ban ke tamanna meri\nZindagi shama ki surat ho Khudaya meri",
    poet_name: "Allama Iqbal",
    poem_title: "Lab Pe Aati Hai Dua",
    word_breakdown: [
      { word_urdu: "لب", word_roman: "Lab", word_meaning: "Lips" },
      { word_urdu: "دعا", word_roman: "Dua", word_meaning: "Prayer" },
      { word_urdu: "تمنا", word_roman: "Tamanna", word_meaning: "Desire, wish" },
      { word_urdu: "زندگی", word_roman: "Zindagi", word_meaning: "Life" },
      { word_urdu: "شمع", word_roman: "Shama", word_meaning: "Candle" },
      { word_urdu: "صورت", word_roman: "Surat", word_meaning: "Form, likeness" },
    ],
    overall_meaning:
      "The poet's deepest wish rises to his lips as a prayer: O God, make my life like a candle that burns itself to spread light for others.",
    tashri:
      "شاعر خدا سے دعا کرتا ہے کہ اس کی زندگی شمع کی مانند ہو جو اپنے آپ کو جلا کر دوسروں کو روشنی دیتی ہے۔ یہ نظم بچوں کی مشہور دعا سمجھی جاتی ہے جس میں خود غرضی کے بجائے دوسروں کے لیے جینے کا درس ہے۔",
  },
  {
    couplet_urdu: "سارے جہاں سے اچھا ہندوستاں ہمارا\nہم بلبلیں ہیں اس کی یہ گلستان ہمارا",
    couplet_roman: "Sare jahan se achha Hindostan hamara\nHum bulbulen hain is ki yeh gulistan hamara",
    poet_name: "Allama Iqbal",
    poem_title: "Tarana-e-Hindi",
    word_breakdown: [
      { word_urdu: "جہاں", word_roman: "Jahan", word_meaning: "World" },
      { word_urdu: "اچھا", word_roman: "Achha", word_meaning: "Good, better" },
      { word_urdu: "بلبلیں", word_roman: "Bulbulen", word_meaning: "Nightingales" },
      { word_urdu: "گلستان", word_roman: "Gulistan", word_meaning: "Garden" },
      { word_urdu: "ہمارا", word_roman: "Hamara", word_meaning: "Ours" },
    ],
    overall_meaning:
      "A beloved patriotic anthem: of all the lands in the world, ours is the finest — and we, its people, are the nightingales singing in its garden.",
    tashri:
      "اقبال نے اس ترانے میں اپنی سرزمین کی عظمت کا اعلان کیا ہے۔ شاعر کہتا ہے کہ پوری دنیا میں ہمارا ہندوستان سب سے بہتر ہے اور ہم اس کے چمن کی بلبلیں ہیں، یعنی ہم اسی کی خوبصورتی اور شان کے امین ہیں۔",
  },
  {
    couplet_urdu: "وہ زمانے میں معزز تھے مسلمان ہو کر\nاور تم خوار ہوئے تارکِ قرآں ہو کر",
    couplet_roman: "Woh zamane mein muazzaz thay Musalman hokar\nAur tum khwar hue taariq-e-Quran hokar",
    poet_name: "Allama Iqbal",
    poem_title: "Jawab-e-Shikwa",
    word_breakdown: [
      { word_urdu: "زمانے", word_roman: "Zamane", word_meaning: "In the world, in age" },
      { word_urdu: "معزز", word_roman: "Muazzaz", word_meaning: "Honoured, respected" },
      { word_urdu: "مسلمان", word_roman: "Musalman", word_meaning: "A Muslim" },
      { word_urdu: "خوار", word_roman: "Khwar", word_meaning: "Humiliated, disgraced" },
      { word_urdu: "تارک", word_roman: "Taariq", word_meaning: "One who abandons" },
      { word_urdu: "قرآں", word_roman: "Quran", word_meaning: "The Quran" },
    ],
    overall_meaning:
      "In God's reply, the Muslims of the past were honoured because they truly lived by their faith, while those of today stand disgraced because they abandoned the Quran.",
    tashri:
      "جوابِ شکوے میں خدا مسلمانوں سے خطاب کرتا ہے کہ ماضی کے مسلمان دین پر عمل کرنے کی وجہ سے دنیا میں معزز تھے، جبکہ آج کے مسلمان قرآن کو چھوڑ بیٹھنے کی سزا میں ذلیل و خوار ہو گئے ہیں۔",
  },
  {
    couplet_urdu: "خودی کو کر بلند اتنا کہ ہر تقدیر سے پہلے\nخدا بندے سے خود پوچھے بتا تیری رضا کیا ہے",
    couplet_roman: "Khudi ko kar buland itna ke har taqdeer se pehle\nKhuda bande se khud poochhe bata teri raza kya hai",
    poet_name: "Allama Iqbal",
    poem_title: "Bal-e-Jibril",
    word_breakdown: [
      { word_urdu: "خودی", word_roman: "Khudi", word_meaning: "Selfhood, self-respect" },
      { word_urdu: "بلند", word_roman: "Buland", word_meaning: "High, lofty" },
      { word_urdu: "تقدیر", word_roman: "Taqdeer", word_meaning: "Destiny, fate" },
      { word_urdu: "بندے", word_roman: "Bande", word_meaning: "Servant, devotee" },
      { word_urdu: "رضا", word_roman: "Raza", word_meaning: "Will, consent" },
    ],
    overall_meaning:
      "Raise your selfhood so high that before writing any destiny, God Himself asks you: 'Tell Me, what is it that you desire?'",
    tashri:
      "خودی کا تصور اقبال کی شاعری کا مرکزی نکتہ ہے۔ شاعر کہتا ہے کہ انسان اپنے عزم اور خود اعتمادی کو اتنا بلند کرے کہ تقدیر بھی اس کی خواہش کے سامنے سرنگوں ہو جائے اور خدا خود بندے سے اس کی مرضی پوچھنے پر مجبور ہو۔",
  },

  /* ---------- Faiz Ahmed Faiz ---------- */

  {
    couplet_urdu: "گلوں میں رنگ بھرے بادِ نوبہار چلے\nچلے بھی آؤ کہ گلشن کا کاروبار چلے",
    couplet_roman: "Gulon mein rang bhare baad-e-naubahaar chale\nChale bhi aao ke gulshan ka kaarobaar chale",
    poet_name: "Faiz Ahmed Faiz",
    poem_title: "Gulon Mein Rang Bhare",
    word_breakdown: [
      { word_urdu: "گلوں", word_roman: "Gulon", word_meaning: "Flowers" },
      { word_urdu: "رنگ بھرے", word_roman: "Rang bhare", word_meaning: "Filled with colour" },
      { word_urdu: "باد", word_roman: "Baad", word_meaning: "Wind, breeze" },
      { word_urdu: "نوبہار", word_roman: "Naubahaar", word_meaning: "New spring" },
      { word_urdu: "گلشن", word_roman: "Gulshan", word_meaning: "Garden" },
      { word_urdu: "کاروبار", word_roman: "Kaarobaar", word_meaning: "Work, affair" },
    ],
    overall_meaning:
      "A breeze full of colour drifts through the flowers of a new spring — come, so the garden's work may flourish. On the surface an invitation to the beloved, it is also read as a call to revive life and hope.",
    tashri:
      "ظاہری طور پر یہ شعر محبوب کو بہار کے موسم میں آنے کی دعوت ہے، مگر اس کے پیچھے شاعر کی وہ خواہش چھپی ہے کہ زندگی اور معاشرے کے باغ کو دوبارہ آباد کیا جائے۔ یہ فیض کی مشہور ترین غزلوں میں سے ہے۔",
  },
  {
    couplet_urdu: "اور بھی دکھ ہیں زمانے میں محبت کے سوا\nراحتیں اور بھی ہیں وصل کی راحت کے سوا",
    couplet_roman: "Aur bhi dukh hain zamane mein mohabbat ke siva\nRahaten aur bhi hain wasl ki rahat ke siva",
    poet_name: "Faiz Ahmed Faiz",
    poem_title: "Mujh Se Pehli Si Mohabbat",
    word_breakdown: [
      { word_urdu: "دکھ", word_roman: "Dukh", word_meaning: "Sorrows" },
      { word_urdu: "زمانے", word_roman: "Zamane", word_meaning: "In the world, in the times" },
      { word_urdu: "محبت", word_roman: "Mohabbat", word_meaning: "Love" },
      { word_urdu: "راحتیں", word_roman: "Rahaten", word_meaning: "Comforts, reliefs" },
      { word_urdu: "وصل", word_roman: "Wasl", word_meaning: "Union with the beloved" },
      { word_urdu: "سوا", word_roman: "Siva", word_meaning: "Besides, other than" },
    ],
    overall_meaning:
      "There are sorrows in this world other than love, and comforts beyond the relief of union — a poet who once lived only for love awakens to the wider suffering of humanity.",
    tashri:
      "فیض کہتا ہے کہ دنیا میں محبت کے سوا بھی بہت دکھ ہیں اور محبوب کی وصل کی راحت کے علاوہ بھی زندگی کے بہت سے کام ہیں۔ انسانیت کے دکھوں نے شاعر کو صرف ذاتی محبت تک محدود رہنے نہیں دیا۔",
  },
  {
    couplet_urdu: "ہم دیکھیں گے\nلازم ہے کہ ہم بھی دیکھیں گے",
    couplet_roman: "Hum dekhenge\nLazim hai ke hum bhi dekhenge",
    poet_name: "Faiz Ahmed Faiz",
    poem_title: "Hum Dekhenge",
    word_breakdown: [
      { word_urdu: "ہم", word_roman: "Hum", word_meaning: "We" },
      { word_urdu: "دیکھیں گے", word_roman: "Dekhenge", word_meaning: "Will see, will witness" },
      { word_urdu: "لازم", word_roman: "Lazim", word_meaning: "Certain, inevitable" },
      { word_urdu: "بھی", word_roman: "Bhi", word_meaning: "Also, too" },
    ],
    overall_meaning:
      "'We shall see' — a defiant promise that the oppressed, too, shall live to witness the day of deliverance that destiny has already written.",
    tashri:
      "اس مشہور ترانے میں فیض ظلم و ستم کے خلاف امید کا پیغام دیتے ہیں۔ مظلوموں کا ایمان ہے کہ وہ دن ضرور دیکھیں گے جس کا وعدہ ازل کی لوح پر لکھا جا چکا ہے۔",
  },
  {
    couplet_urdu: "بول کہ لب آزاد ہیں تیرے\nبول زباں اب تک تری ہے",
    couplet_roman: "Bol ke lab azaad hain tere\nBol zabaan ab tak tiri hai",
    poet_name: "Faiz Ahmed Faiz",
    poem_title: "Bol",
    word_breakdown: [
      { word_urdu: "بول", word_roman: "Bol", word_meaning: "Speak" },
      { word_urdu: "لب", word_roman: "Lab", word_meaning: "Lips" },
      { word_urdu: "آزاد", word_roman: "Azaad", word_meaning: "Free" },
      { word_urdu: "زباں", word_roman: "Zabaan", word_meaning: "Tongue, speech" },
      { word_urdu: "اب تک", word_roman: "Ab tak", word_meaning: "Still, until now" },
    ],
    overall_meaning:
      "Speak — your lips are still free and your tongue still yours. A stirring call to raise one's voice for truth before freedom of speech is lost.",
    tashri:
      "فیض نے اس نظم کا آغاز اے انسان! حق بات کہنے سے غافل نہ ہو، کے پیغام سے کیا ہے: جب تک تیرے ہونٹ آزاد ہیں اور زبان تیری اپنی ہے، سچ بول دے۔ یہ آزادیِ اظہار کا سب سے مشہور ترانہ سمجھا جاتا ہے۔",
  },

  /* ---------- Mirza Ghalib ---------- */

  {
    couplet_urdu: "ہزاروں خواہشیں ایسی کہ ہر خواہش پہ دم نکلے\nبہت نکلے مرے ارمان لیکن پھر بھی کم نکلے",
    couplet_roman: "Hazaaron khwahishein aisi ke har khwahish pe dam nikle\nBahut nikle mere armaan lekin phir bhi kam nikle",
    poet_name: "Mirza Ghalib",
    poem_title: "Hazaaron Khwahishein Aisi",
    word_breakdown: [
      { word_urdu: "ہزاروں", word_roman: "Hazaaron", word_meaning: "Thousands" },
      { word_urdu: "خواہشیں", word_roman: "Khwahishein", word_meaning: "Desires" },
      { word_urdu: "دم", word_roman: "Dam", word_meaning: "Breath, life" },
      { word_urdu: "ارمان", word_roman: "Armaan", word_meaning: "Longings, heartfelt wishes" },
      { word_urdu: "کم", word_roman: "Kam", word_meaning: "Few, less" },
    ],
    overall_meaning:
      "Thousands of desires, each worth dying for; many of my wishes were granted, yet even then too few. Human desire is endless — no fulfilment ever feels like enough.",
    tashri:
      "غالب کہتا ہے کہ انسان کی ہزاروں خواہشیں ہوتی ہیں اور ہر خواہش پوری ہونے پر جان نکل جاتی ہے۔ بہت سے ارمان پورے بھی ہوئے مگر دل کو یہ سکون نہیں ملا کہ سب کچھ مل گیا — انسانی فطرت کبھی مطمئن نہیں ہوتی۔",
  },
  {
    couplet_urdu: "ہم کو معلوم ہے جنت کی حقیقت لیکن\nدل کے خوش رکھنے کو غالب یہ خیال اچھا ہے",
    couplet_roman: "Hum ko maaloom hai jannat ki haqiqat lekin\nDil ke khush rakhne ko Ghalib ye khayal achha hai",
    poet_name: "Mirza Ghalib",
    poem_title: "Hum Ko Maaloom Hai Jannat Ki Haqiqat Lekin",
    word_breakdown: [
      { word_urdu: "معلوم", word_roman: "Maaloom", word_meaning: "Known, understood" },
      { word_urdu: "جنت", word_roman: "Jannat", word_meaning: "Paradise" },
      { word_urdu: "حقیقت", word_roman: "Haqiqat", word_meaning: "Reality, truth" },
      { word_urdu: "دل", word_roman: "Dil", word_meaning: "Heart" },
      { word_urdu: "خیال", word_roman: "Khayal", word_meaning: "Thought, idea" },
    ],
    overall_meaning:
      "I know the reality of paradise, but Ghalib — to keep the heart happy, this belief is a good one. A witty reflection on faith: believing in paradise comforts the heart.",
    tashri:
      "غالب کا یہ شعر ان کی فلسفیانہ اندازِ فکر کا بہترین نمونہ ہے۔ شاعر کہتا ہے کہ جنت کی حقیقت سے واقف ہوں مگر دل کو خوش رکھنے کے لیے تصورِ جنت جیسا خیال بہت اچھا ہے۔",
  },
  {
    couplet_urdu: "عشق پر زور نہیں ہے یہ وہ آتشِ غالب\nکہ لگائے نہ لگے اور بجھائے نہ بنے",
    couplet_roman: "Ishq par zor nahin hai, yeh woh aatish-e-Ghalib\nKe lagaye na lage aur bujhaaye na bane",
    poet_name: "Mirza Ghalib",
    poem_title: "Ishq Par Zor Nahin",
    word_breakdown: [
      { word_urdu: "عشق", word_roman: "Ishq", word_meaning: "Passionate love" },
      { word_urdu: "زور", word_roman: "Zor", word_meaning: "Force, compulsion" },
      { word_urdu: "آتش", word_roman: "Aatish", word_meaning: "Fire" },
      { word_urdu: "لگائے", word_roman: "Lagaye", word_meaning: "To kindle, ignite" },
      { word_urdu: "بجھائے", word_roman: "Bujhaaye", word_meaning: "To extinguish" },
    ],
    overall_meaning:
      "Love cannot be commanded, Ghalib — it is that fire which cannot be lit at will, nor put out once it burns. Love lies beyond human control.",
    tashri:
      "غالب کہتے ہیں کہ عشق کسی کے بس میں نہیں۔ یہ ایک ایسی آگ ہے جسے چاہ کر نہیں لگایا جا سکتا اور جب لگ جائے تو اسے بجھایا بھی نہیں جا سکتا۔",
  },
  {
    couplet_urdu: "دلِ ناداں تجھے ہوا کیا ہے\nآخر اس درد کی دوا کیا ہے",
    couplet_roman: "Dil-e-nadaan tujhe hua kya hai\nAakhir is dard ki dawa kya hai",
    poet_name: "Mirza Ghalib",
    poem_title: "Dil-e-Nadaan Tujhe Hua Kya Hai",
    word_breakdown: [
      { word_urdu: "دل", word_roman: "Dil", word_meaning: "Heart" },
      { word_urdu: "ناداں", word_roman: "Nadaan", word_meaning: "Innocent, naive" },
      { word_urdu: "درد", word_roman: "Dard", word_meaning: "Pain, ache" },
      { word_urdu: "دوا", word_roman: "Dawa", word_meaning: "Cure, remedy" },
      { word_urdu: "آخر", word_roman: "Aakhir", word_meaning: "After all, in the end" },
    ],
    overall_meaning:
      "O naive heart, what has happened to you? What, after all, is the cure for this pain? The poet marvels at his heart's endless suffering in love, for which there seems no remedy.",
    tashri:
      "شاعر اپنے سادہ لوح دل سے مخاطب ہے: تجھے کیا ہو گیا ہے؟ اس محبت کے درد کا کوئی علاج بھی ہے یا نہیں؟ غالب نے اس غزل کے آغاز میں عشق کے سوز کو بیان کیا ہے جو ہر قاری کے دل کو چھو لیتا ہے۔",
  },
];

/* =================================================================== */
/* WORDSEARCH — 25 words (15 easy + 10 hard)                            */
/* =================================================================== */

const wordsearchWords = [
  /* ---------- Easy: common everyday words ---------- */
  { word_urdu: "کتاب", word_meaning: "Book", difficulty: "easy" },
  { word_urdu: "پانی", word_meaning: "Water", difficulty: "easy" },
  { word_urdu: "گھر", word_meaning: "Home", difficulty: "easy" },
  { word_urdu: "سورج", word_meaning: "Sun", difficulty: "easy" },
  { word_urdu: "چاند", word_meaning: "Moon", difficulty: "easy" },
  { word_urdu: "پھول", word_meaning: "Flower", difficulty: "easy" },
  { word_urdu: "درخت", word_meaning: "Tree", difficulty: "easy" },
  { word_urdu: "بلی", word_meaning: "Cat", difficulty: "easy" },
  { word_urdu: "کتا", word_meaning: "Dog", difficulty: "easy" },
  { word_urdu: "مچھلی", word_meaning: "Fish", difficulty: "easy" },
  { word_urdu: "پرندہ", word_meaning: "Bird", difficulty: "easy" },
  { word_urdu: "ستارا", word_meaning: "Star", difficulty: "easy" },
  { word_urdu: "آسمان", word_meaning: "Sky", difficulty: "easy" },
  { word_urdu: "سمندر", word_meaning: "Sea", difficulty: "easy" },
  { word_urdu: "بادل", word_meaning: "Cloud", difficulty: "easy" },

  /* ---------- Hard: less common / longer words ---------- */
  { word_urdu: "خوبصورتی", word_meaning: "Beauty", difficulty: "hard" },
  { word_urdu: "دوستی", word_meaning: "Friendship", difficulty: "hard" },
  { word_urdu: "محبت", word_meaning: "Love", difficulty: "hard" },
  { word_urdu: "خوشی", word_meaning: "Happiness", difficulty: "hard" },
  { word_urdu: "آزادی", word_meaning: "Freedom", difficulty: "hard" },
  { word_urdu: "حکومت", word_meaning: "Government", difficulty: "hard" },
  { word_urdu: "تعلیم", word_meaning: "Education", difficulty: "hard" },
  { word_urdu: "مہربانی", word_meaning: "Kindness", difficulty: "hard" },
  { word_urdu: "زندگی", word_meaning: "Life", difficulty: "hard" },
  { word_urdu: "کامیابی", word_meaning: "Success", difficulty: "hard" },
];

/* =================================================================== */
/* SEED LOGIC                                                           */
/* =================================================================== */

const insertIdiom = db.prepare(`
  INSERT INTO idioms_content
    (idiom_urdu, idiom_roman, correct_meaning, distractor_1, distractor_2,
     distractor_3, example_sentence, difficulty, image_path)
  VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
`);

const insertPoetry = db.prepare(`
  INSERT INTO poetry_content
    (couplet_urdu, couplet_roman, poet_name, poem_title,
     word_breakdown, overall_meaning, tashri)
  VALUES (?, ?, ?, ?, ?, ?, ?)
`);

const insertWord = db.prepare(`
  INSERT INTO wordsearch_wordlists (word_urdu, word_meaning, difficulty)
  VALUES (?, ?, ?)
`);

function seed() {
  console.log("Zabandaan seed script");
  console.log("---------------------");
  console.log("Clearing existing content rows...");

  db.exec("BEGIN");
  try {
    db.prepare("DELETE FROM idioms_content").run();
    db.prepare("DELETE FROM wordsearch_wordlists").run();
    db.prepare("DELETE FROM poetry_content").run();

    console.log(`Inserting ${idioms.length} idioms...`);
    for (const item of idioms) {
      insertIdiom.run(
        item.idiom_urdu,
        item.idiom_roman,
        item.correct_meaning,
        item.distractor_1,
        item.distractor_2,
        item.distractor_3,
        item.example_sentence,
        item.difficulty,
        item.image_path
      );
    }

    console.log(`Inserting ${poetry.length} poetry couplets...`);
    for (const c of poetry) {
      insertPoetry.run(
        c.couplet_urdu,
        c.couplet_roman,
        c.poet_name,
        c.poem_title,
        JSON.stringify(c.word_breakdown),
        c.overall_meaning,
        c.tashri
      );
    }

    console.log(`Inserting ${wordsearchWords.length} wordsearch words...`);
    for (const w of wordsearchWords) {
      insertWord.run(w.word_urdu, w.word_meaning, w.difficulty);
    }

    db.exec("COMMIT");
  } catch (err) {
    db.exec("ROLLBACK");
    console.error("Seed failed — transaction rolled back.");
    console.error(err);
    process.exitCode = 1;
    return;
  }

  /* ---- Post-seed verification counts ---- */
  const total = (table) =>
    db.prepare(`SELECT COUNT(*) AS n FROM ${table}`).get().n;

  const idiomCounts = db
    .prepare("SELECT difficulty, COUNT(*) AS n FROM idioms_content GROUP BY difficulty ORDER BY difficulty")
    .all();
  const wordCounts = db
    .prepare("SELECT difficulty, COUNT(*) AS n FROM wordsearch_wordlists GROUP BY difficulty ORDER BY difficulty")
    .all();
  const poetCounts = db
    .prepare("SELECT poet_name, COUNT(*) AS n FROM poetry_content GROUP BY poet_name ORDER BY n DESC")
    .all();

  console.log("");
  console.log("Seed complete. Row counts:");
  console.log(`  idioms_content        : ${total("idioms_content")} (${idiomCounts.map((r) => `${r.difficulty}: ${r.n}`).join(", ")})`);
  console.log(`  poetry_content        : ${total("poetry_content")} (${poetCounts.map((r) => `${r.poet_name}: ${r.n}`).join(", ")})`);
  console.log(`  wordsearch_wordlists  : ${total("wordsearch_wordlists")} (${wordCounts.map((r) => `${r.difficulty}: ${r.n}`).join(", ")})`);
  console.log("");
  console.log("Done. Database seeded successfully.");
}

try {
  seed();
} finally {
  db.close();
}
