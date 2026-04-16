export const i18n: Record<string, Record<string, Record<string, string>>> = {
  signals: {
    LONG: { en: "Bullish Signal", hi: "तेजी का संकेत", mr: "तेजीचा संकेत", ta: "காளை சமிக்ஞை" },
    SHORT: { en: "Bearish Signal", hi: "मंदी का संकेत", mr: "मंदीचा संकेत", ta: "கரடி சமிக்ஞை" },
    WATCH: { en: "Watch Closely", hi: "ध्यान से देखें", mr: "लक्षपूर्वक पहा", ta: "கவனமாக கவனிக்கவும்" },
    AVOID: { en: "Avoid Now", hi: "अभी मत जाएं", mr: "आत्ता टाळा", ta: "இப்போது தவிர்க்கவும்" },
  },
  reasons: {
    funding_neg: {
      en: "Funding negative — short squeeze potential",
      hi: "फंडिंग नेगेटिव — शॉर्ट स्क्वीज़ हो सकता है",
      mr: "फंडिंग नेगेटिव — शॉर्ट स्क्वीज़ शक्य",
      ta: "நிதியுதவி எதிர்மறை — குறுகிய அழுத்தம் சாத்தியம்",
    },
    funding_pos_extreme: {
      en: "Funding extremely positive — crowded longs",
      hi: "फंडिंग बहुत ज़्यादा — लॉन्ग भरे हुए हैं",
      mr: "फंडिंग खूप जास्त — लॉन्ग भरलेले",
      ta: "நிதியுதவி மிக அதிகம் — நீண்ட கூட்டம்",
    },
    oi_rising: {
      en: "OI rising with price — accumulation signal",
      hi: "OI और कीमत बढ़ रहे हैं — संचय का संकेत",
      mr: "OI आणि किंमत वाढत आहे — संचयाचा संकेत",
      ta: "OI மற்றும் விலை உயர்கிறது — திரட்சி சமிக்ஞை",
    },
    oi_falling: {
      en: "OI falling with price — distribution signal",
      hi: "OI और कीमत गिर रहे हैं — बिकवाली का संकेत",
      mr: "OI आणि किंमत घसरत आहे — वितरणाचा संकेत",
      ta: "OI மற்றும் விலை குறைகிறது — விநியோக சமிக்ஞை",
    },
    ls_short_heavy: {
      en: "Majority short — squeeze potential",
      hi: "ज़्यादातर शॉर्ट — स्क्वीज़ का मौका",
      mr: "बहुतांश शॉर्ट — स्क्वीज़ शक्य",
      ta: "பெரும்பாலும் குறுகிய — அழுத்தம் சாத்தியம்",
    },
    ls_long_crowded: {
      en: "Crowded longs — reversal risk",
      hi: "बहुत ज़्यादा लॉन्ग — पलटने का खतरा",
      mr: "खूप जास्त लॉन्ग — उलटण्याचा धोका",
      ta: "கூட்டமான நீண்ட — திருப்பு ஆபத்து",
    },
    earnings_near: {
      en: "Earnings approaching — elevated volatility expected",
      hi: "अर्निंग्स नज़दीक — ज़्यादा उतार-चढ़ाव की उम्मीद",
      mr: "कमाई जवळ — जास्त अस्थिरता अपेक्षित",
      ta: "வருவாய் நெருங்குகிறது — அதிக ஏற்ற இறக்கம் எதிர்பார்க்கப்படுகிறது",
    },
    sector_strength: {
      en: "Sector showing relative strength",
      hi: "सेक्टर मज़बूत दिख रहा है",
      mr: "सेक्टर सापेक्ष मजबूत",
      ta: "துறை ஒப்பீட்டு வலிமை காட்டுகிறது",
    },
    sector_weakness: {
      en: "Sector showing weakness",
      hi: "सेक्टर कमज़ोर दिख रहा है",
      mr: "सेक्टर कमकुवत",
      ta: "துறை பலவீனம் காட்டுகிறது",
    },
    premarket_gap_up: {
      en: "Pre-market gap up confirmed at open",
      hi: "प्री-मार्केट गैप अप, ओपन पर कन्फर्म",
      mr: "प्री-मार्केट गॅप अप, ओपन वर कन्फर्म",
      ta: "சந்தைக்கு முன் இடைவெளி உறுதி",
    },
  },
  sessions: {
    premarket: { en: "Pre-Market", hi: "प्री-मार्केट", mr: "प्री-मार्केट", ta: "சந்தைக்கு முன்" },
    open: { en: "Market Open", hi: "बाजार खुला है", mr: "बाजार उघडा आहे", ta: "சந்தை திறந்துள்ளது" },
    afterhours: { en: "After Hours", hi: "आफ्टर-आवर्स", mr: "आफ्टर-अवर्स", ta: "சந்தை நேரத்திற்கு பிறகு" },
    overnight: { en: "Overnight", hi: "रात भर", mr: "रात्रभर", ta: "இரவு" },
  },
  ui: {
    overview: { en: "Overview", hi: "सारांश", mr: "सारांश", ta: "கண்ணோட்டம்" },
    markets: { en: "Markets", hi: "बाज़ार", mr: "बाजार", ta: "சந்தைகள்" },
    signals: { en: "Signals", hi: "संकेत", mr: "संकेत", ta: "சமிக்ஞைகள்" },
    events: { en: "Events", hi: "इवेंट्स", mr: "इव्हेंट्स", ta: "நிகழ்வுகள்" },
    sentiment: { en: "Sentiment", hi: "भावना", mr: "भावना", ta: "உணர்வு" },
    tonight_setup: { en: "Tonight's Setup", hi: "आज रात की तैयारी", mr: "आजच्या रात्रीची तयारी", ta: "இன்றிரவு அமைப்பு" },
    market_pulse: { en: "Market Pulse", hi: "बाज़ार की नब्ज़", mr: "बाजाराची नाडी", ta: "சந்தை துடிப்பு" },
  },
};

export type Lang = "en" | "hi" | "mr" | "ta";

export function t(key: string, lang: Lang): string {
  const keys = key.split(".");
  let val: any = i18n;
  for (const k of keys) val = val?.[k];
  return val?.[lang] ?? val?.["en"] ?? key;
}
