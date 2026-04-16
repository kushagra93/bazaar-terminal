export const i18n: Record<string, Record<string, Record<string, string>>> = {
  // ── Navigation ──
  nav: {
    overview: { en: "Overview", hi: "सारांश", mr: "सारांश", ta: "கண்ணோட்டம்" },
    markets: { en: "Markets", hi: "बाज़ार", mr: "बाजार", ta: "சந்தைகள்" },
    events: { en: "Events", hi: "इवेंट्स", mr: "इव्हेंट्स", ta: "நிகழ்வுகள்" },
    signals: { en: "Signals", hi: "संकेत", mr: "संकेत", ta: "சமிக்ஞைகள்" },
    sentiment: { en: "Sentiment", hi: "भावना", mr: "भावना", ta: "உணர்வு" },
  },

  // ── Session States ──
  sessions: {
    premarket: { en: "PRE-MARKET", hi: "प्री-मार्केट", mr: "प्री-मार्केट", ta: "சந்தைக்கு முன்" },
    open: { en: "MARKET OPEN", hi: "बाज़ार खुला", mr: "बाजार उघडा", ta: "சந்தை திறந்தது" },
    afterhours: { en: "AFTER-HOURS", hi: "आफ्टर-आवर्स", mr: "आफ्टर-अवर्स", ta: "நேரத்திற்குப் பின்" },
    overnight: { en: "OVERNIGHT", hi: "ओवरनाइट", mr: "रात्रभर", ta: "இரவு நேரம்" },
  },
  session_context: {
    premarket: { en: "Price discovery underway", hi: "प्राइस डिस्कवरी चल रही है", mr: "किंमत शोध चालू", ta: "விலை கண்டறிதல் நடைபெறுகிறது" },
    open: { en: "Full liquidity. All signals active. Prime trading window.", hi: "पूरी लिक्विडिटी। सभी सिग्नल एक्टिव। ट्रेडिंग का सबसे अच्छा समय।", mr: "पूर्ण लिक्विडिटी. सर्व सिग्नल सक्रिय.", ta: "முழு பணப்புழக்கம். அனைத்து சமிக்ஞைகளும் செயலில்." },
    afterhours: { en: "Earnings releases likely. Thin liquidity.", hi: "अर्निंग्स आने की संभावना। कम लिक्विडिटी।", mr: "कमाई जाहीर होऊ शकते. कमी लिक्विडिटी.", ta: "வருவாய் வெளியீடு சாத்தியம். குறைந்த பணப்புழக்கம்." },
    overnight: { en: "Low volatility. Good time to plan, not trade.", hi: "कम उतार-चढ़ाव। प्लान करने का अच्छा समय।", mr: "कमी अस्थिरता. नियोजनासाठी चांगला वेळ.", ta: "குறைந்த ஏற்ற இறக்கம். திட்டமிட நல்ல நேரம்." },
  },

  // ── Overview Page ──
  overview: {
    terminal_intelligence: { en: "Terminal Intelligence", hi: "टर्मिनल इंटेलिजेंस", mr: "टर्मिनल इंटेलिजन्स", ta: "டெர்மினல் நுண்ணறிவு" },
    market_pulse: { en: "Market Pulse", hi: "बाज़ार की नब्ज़", mr: "बाजाराची नाडी", ta: "சந்தை துடிப்பு" },
    live_update: { en: "Live Update", hi: "लाइव अपडेट", mr: "लाइव अपडेट", ta: "நேரடி புதுப்பிப்பு" },
    top_movers: { en: "Top Movers", hi: "टॉप मूवर्स", mr: "टॉप मूव्हर्स", ta: "முக்கிய நகர்வுகள்" },
    earnings_this_week: { en: "Earnings This Week", hi: "इस हफ्ते की अर्निंग्स", mr: "या आठवड्याची कमाई", ta: "இந்த வார வருவாய்" },
    sector_distribution: { en: "Sector Distribution", hi: "सेक्टर डिस्ट्रीब्यूशन", mr: "सेक्टर वितरण", ta: "துறை பரவல்" },
    most_volatile: { en: "Most Volatile", hi: "सबसे ज़्यादा उतार-चढ़ाव", mr: "सर्वाधिक अस्थिर", ta: "அதிக ஏற்ற இறக்கம்" },
    detailed_watchlist: { en: "Detailed Watchlist", hi: "विस्तृत वॉचलिस्ट", mr: "तपशीलवार वॉचलिस्ट", ta: "விரிவான கண்காணிப்பு" },
    view_all: { en: "View All", hi: "सभी देखें", mr: "सर्व पहा", ta: "அனைத்தும் காண" },
    today: { en: "Today", hi: "आज", mr: "आज", ta: "இன்று" },
  },

  // ── Markets Page ──
  markets: {
    title: { en: "MARKETS", hi: "बाज़ार", mr: "बाजार", ta: "சந்தைகள்" },
    market_intelligence: { en: "Market Intelligence", hi: "मार्केट इंटेलिजेंस", mr: "बाजार बुद्धिमत्ता", ta: "சந்தை நுண்ணறிவு" },
    all_sectors: { en: "All Sectors", hi: "सभी सेक्टर", mr: "सर्व सेक्टर", ta: "அனைத்து துறைகள்" },
    search_assets: { en: "Search assets...", hi: "एसेट खोजें...", mr: "अ‍ॅसेट शोधा...", ta: "சொத்துகளைத் தேடு..." },
    assets: { en: "assets", hi: "एसेट्स", mr: "अ‍ॅसेट्स", ta: "சொத்துகள்" },
    ticker: { en: "Ticker", hi: "टिकर", mr: "टिकर", ta: "டிக்கர்" },
    price: { en: "Price", hi: "कीमत", mr: "किंमत", ta: "விலை" },
    change: { en: "Change", hi: "बदलाव", mr: "बदल", ta: "மாற்றம்" },
    volume: { en: "Volume", hi: "वॉल्यूम", mr: "व्हॉल्यूम", ta: "அளவு" },
    funding: { en: "Funding", hi: "फंडिंग", mr: "फंडिंग", ta: "நிதியுதவி" },
  },

  // ── Signals ──
  signals: {
    LONG: { en: "Bullish Signal", hi: "तेजी का संकेत", mr: "तेजीचा संकेत", ta: "காளை சமிக்ஞை" },
    SHORT: { en: "Bearish Signal", hi: "मंदी का संकेत", mr: "मंदीचा संकेत", ta: "கரடி சமிக்ஞை" },
    WATCH: { en: "Watch Closely", hi: "ध्यान से देखें", mr: "लक्षपूर्वक पहा", ta: "கவனமாக கவனிக்கவும்" },
    title: { en: "MARKET OPEN", hi: "बाज़ार खुला", mr: "बाजार उघडा", ta: "சந்தை திறந்தது" },
    live_transmission: { en: "Live Transmission", hi: "लाइव ट्रांसमिशन", mr: "लाइव ट्रान्समिशन", ta: "நேரடி ஒளிபரப்பு" },
    all_intelligence: { en: "All Intelligence", hi: "सभी सिग्नल", mr: "सर्व सिग्नल", ta: "அனைத்து சமிக்ஞைகள்" },
    algo_scanning: { en: "Algorithmic scanning across assets. Technical patterns and social sentiment consolidated into a unified intelligence feed.", hi: "एसेट्स पर एल्गोरिथमिक स्कैनिंग। टेक्निकल पैटर्न और सोशल सेंटिमेंट एक एकीकृत इंटेलिजेंस फीड में।", mr: "अ‍ॅसेट्सवर अल्गोरिदमिक स्कॅनिंग. तांत्रिक नमुने आणि सामाजिक भावना एकत्रित.", ta: "சொத்துகளில் வழிமுறை ஸ்கேனிங். தொழில்நுட்ப வடிவங்கள் மற்றும் சமூக உணர்வு ஒருங்கிணைக்கப்பட்டது." },
    global_sentiment: { en: "Global Sentiment", hi: "ग्लोबल सेंटिमेंट", mr: "जागतिक भावना", ta: "உலகளாவிய உணர்வு" },
    confidence: { en: "Confidence", hi: "कॉन्फिडेंस", mr: "आत्मविश्वास", ta: "நம்பிக்கை" },
    no_entry: { en: "No entry levels — wait for directional confirmation", hi: "एंट्री लेवल नहीं — दिशा की पुष्टि का इंतज़ार करें", mr: "एंट्री लेव्हल नाही — दिशा निश्चिती वाट पहा", ta: "நுழைவு நிலைகள் இல்லை — திசை உறுதிப்படுத்தல் காத்திருங்கள்" },
  },

  // ── Signal Reasons ──
  reasons: {
    funding_neg: { en: "Funding negative — short squeeze potential", hi: "फंडिंग नेगेटिव — शॉर्ट स्क्वीज़ हो सकता है", mr: "फंडिंग नेगेटिव — शॉर्ट स्क्वीज़ शक्य", ta: "நிதியுதவி எதிர்மறை — குறுகிய அழுத்தம் சாத்தியம்" },
    funding_pos_extreme: { en: "Funding extremely positive — crowded longs", hi: "फंडिंग बहुत ज़्यादा — लॉन्ग भरे हुए हैं", mr: "फंडिंग खूप जास्त — लॉन्ग भरलेले", ta: "நிதியுதவி மிக அதிகம் — நீண்ட கூட்டம்" },
    oi_rising: { en: "OI rising with price — accumulation signal", hi: "OI और कीमत बढ़ रहे हैं — संचय का संकेत", mr: "OI आणि किंमत वाढत आहे — संचयाचा संकेत", ta: "OI மற்றும் விலை உயர்கிறது — திரட்சி சமிக்ஞை" },
    oi_falling: { en: "OI falling with price — distribution signal", hi: "OI और कीमत गिर रहे हैं — बिकवाली का संकेत", mr: "OI आणि किंमत घसरत आहे — वितरणाचा संकेत", ta: "OI மற்றும் விலை குறைகிறது — விநியோக சமிக்ஞை" },
    ls_short_heavy: { en: "Majority short — squeeze potential", hi: "ज़्यादातर शॉर्ट — स्क्वीज़ का मौका", mr: "बहुतांश शॉर्ट — स्क्वीज़ शक्य", ta: "பெரும்பாலும் குறுகிய — அழுத்தம் சாத்தியம்" },
    ls_long_crowded: { en: "Crowded longs — reversal risk", hi: "बहुत ज़्यादा लॉन्ग — पलटने का खतरा", mr: "खूप जास्त लॉन्ग — उलटण्याचा धोका", ta: "கூட்டமான நீண்ட — திருப்பு ஆபத்து" },
    earnings_near: { en: "Earnings approaching — elevated volatility", hi: "अर्निंग्स नज़दीक — ज़्यादा उतार-चढ़ाव", mr: "कमाई जवळ — जास्त अस्थिरता", ta: "வருவாய் நெருங்குகிறது — அதிக ஏற்ற இறக்கம்" },
    sector_strength: { en: "Sector showing relative strength", hi: "सेक्टर मज़बूत दिख रहा है", mr: "सेक्टर सापेक्ष मजबूत", ta: "துறை ஒப்பீட்டு வலிமை" },
  },

  // ── Events Page ──
  events: {
    title: { en: "Macro Events", hi: "मैक्रो इवेंट्स", mr: "मॅक्रो इव्हेंट्स", ta: "மேக்ரோ நிகழ்வுகள்" },
    calendar: { en: "Calendar", hi: "कैलेंडर", mr: "कॅलेंडर", ta: "நாட்காட்டி" },
    all_events: { en: "All Events", hi: "सभी इवेंट्स", mr: "सर्व इव्हेंट्स", ta: "அனைத்து நிகழ்வுகள்" },
    earnings: { en: "Earnings", hi: "अर्निंग्स", mr: "कमाई", ta: "வருவாய்" },
    central_banks: { en: "Central Banks", hi: "सेंट्रल बैंक", mr: "मध्यवर्ती बँक", ta: "மத்திய வங்கிகள்" },
    high_impact: { en: "High Impact", hi: "ज़्यादा प्रभाव", mr: "उच्च प्रभाव", ta: "அதிக தாக்கம்" },
    today: { en: "TODAY", hi: "आज", mr: "आज", ta: "இன்று" },
    tomorrow: { en: "TOMORROW", hi: "कल", mr: "उद्या", ta: "நாளை" },
    earnings_watchlist: { en: "Earnings Watchlist", hi: "अर्निंग्स वॉचलिस्ट", mr: "कमाई वॉचलिस्ट", ta: "வருவாய் கண்காணிப்பு" },
    est_eps: { en: "Est. EPS", hi: "अनुमानित EPS", mr: "अंदाजित EPS", ta: "மதிப்பிடப்பட்ட EPS" },
    est_revenue: { en: "Est. Revenue", hi: "अनुमानित रेवेन्यू", mr: "अंदाजित महसूल", ta: "மதிப்பிடப்பட்ட வருவாய்" },
  },

  // ── Sentiment Page ──
  sentiment: {
    title: { en: "SENTIMENT", hi: "भावना", mr: "भावना", ta: "உணர்வு" },
    engine: { en: "Sentiment Engine", hi: "सेंटिमेंट इंजन", mr: "सेंटिमेंट इंजिन", ta: "உணர்வு இயந்திரம்" },
    fear_greed: { en: "Fear & Greed Dial", hi: "फियर & ग्रीड डायल", mr: "भय आणि लोभ डायल", ta: "பயம் & பேராசை டயல்" },
    market_bias: { en: "Market Bias", hi: "मार्केट बायस", mr: "बाजार बायस", ta: "சந்தை சார்பு" },
    bullish: { en: "Bullish", hi: "तेजी", mr: "तेजी", ta: "காளை" },
    bearish: { en: "Bearish", hi: "मंदी", mr: "मंदी", ta: "கரடி" },
    social_intelligence: { en: "Social Intelligence", hi: "सोशल इंटेलिजेंस", mr: "सोशल इंटेलिजन्स", ta: "சமூக நுண்ணறிவு" },
    live_feed: { en: "Live Feed", hi: "लाइव फीड", mr: "लाइव फीड", ta: "நேரடி ஊட்டம்" },
    trending_tickers: { en: "Trending Tickers", hi: "ट्रेंडिंग टिकर्स", mr: "ट्रेंडिंग टिकर्स", ta: "டிரெண்டிங் டிக்கர்கள்" },
    top_analysts: { en: "Top Analysts", hi: "टॉप एनालिस्ट", mr: "टॉप विश्लेषक", ta: "சிறந்த ஆய்வாளர்கள்" },
    summary: { en: "Sentiment Intelligence Summary", hi: "सेंटिमेंट इंटेलिजेंस सारांश", mr: "भावना बुद्धिमत्ता सारांश", ta: "உணர்வு நுண்ணறிவு சுருக்கம்" },
    favor_longs: { en: "Favor Longs", hi: "लॉन्ग पक्ष", mr: "लॉन्ग बाजू", ta: "நீண்ட ஆதரவு" },
    favor_shorts: { en: "Favor Shorts", hi: "शॉर्ट पक्ष", mr: "शॉर्ट बाजू", ta: "குறுகிய ஆதரவு" },
    low_volatility: { en: "Low Volatility", hi: "कम उतार-चढ़ाव", mr: "कमी अस्थिरता", ta: "குறைந்த ஏற்ற இறக்கம்" },
  },

  // ── Common ──
  common: {
    loading: { en: "Loading...", hi: "लोड हो रहा है...", mr: "लोड होत आहे...", ta: "ஏற்றுகிறது..." },
    no_data: { en: "No data available", hi: "कोई डेटा उपलब्ध नहीं", mr: "डेटा उपलब्ध नाही", ta: "தரவு கிடைக்கவில்லை" },
    view_all: { en: "View All", hi: "सभी देखें", mr: "सर्व पहा", ta: "அனைத்தும் காண" },
  },
};

export type Lang = "en" | "hi" | "mr" | "ta";

export function t(key: string, lang: Lang): string {
  const keys = key.split(".");
  let val: any = i18n;
  for (const k of keys) val = val?.[k];
  return val?.[lang] ?? val?.["en"] ?? key;
}
