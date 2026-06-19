// Translation dictionary. English (en) and Hindi (hi) are fully localized.
// Marathi (mr), Tamil (ta), Telugu (te) and Gujarati (gu) cover the most
// visible surfaces (landing, login, navigation, common actions); any missing
// key falls back to English via the t() resolver in ./index.js.

export const translations = {
  // ---- App / brand ----
  'app.tagline': {
    en: 'Your AI GST Assistant',
    hi: 'आपका AI GST सहायक',
    mr: 'तुमचा AI GST सहाय्यक',
    ta: 'உங்கள் AI GST உதவியாளர்',
    te: 'మీ AI GST సహాయకుడు',
    gu: 'તમારો AI GST સહાયક',
  },

  // ---- Landing ----
  'landing.heroTitle': {
    en: "Hello, it's Hisably!", hi: 'नमस्ते, यह Hisably है!', mr: 'नमस्कार, हे Hisably आहे!',
    ta: 'வணக்கம், இது Hisably!', te: 'హలో, ఇది Hisably!', gu: 'નમસ્તે, આ Hisably છે!',
  },
  'landing.heroSubtitle': {
    en: 'Your AI-powered GST assistant. Here are a few steps to get you started.',
    hi: 'आपका AI-powered GST सहायक। शुरू करने के लिए कुछ आसान steps।',
    mr: 'तुमचा AI-powered GST सहाय्यक. सुरू करण्यासाठी काही पायऱ्या.',
    ta: 'உங்கள் AI GST உதவியாளர். தொடங்க சில படிகள்.',
    te: 'మీ AI GST సహాయకుడు. ప్రారంభించడానికి కొన్ని దశలు.',
    gu: 'તમારો AI GST સહાયક. શરૂ કરવા માટે થોડા પગલાં.',
  },
  'landing.signIn': {
    en: 'Sign In', hi: 'Sign In', mr: 'साइन इन', ta: 'உள்நுழைக', te: 'సైన్ ఇన్', gu: 'સાઇન ઇન',
  },
  'landing.selectLanguage': {
    en: 'Select Language', hi: 'भाषा चुनें', mr: 'भाषा निवडा',
    ta: 'மொழியைத் தேர்ந்தெடுக்கவும்', te: 'భాషను ఎంచుకోండి', gu: 'ભાષા પસંદ કરો',
  },
  'landing.about': {
    en: 'Hisably is built for small business owners who want easy GST compliance — without a CA.',
    hi: 'Hisably छोटे व्यापारियों के लिए बनाया गया है जो GST compliance आसान बनाना चाहते हैं — बिना किसी CA के।',
  },
  'landing.benefit1.title': {
    en: 'Instant Scan', hi: 'तुरंत स्कैन', mr: 'झटपट स्कॅन',
    ta: 'உடனடி ஸ்கேன்', te: 'తక్షణ స్కాన్', gu: 'તરત સ્કેન',
  },
  'landing.benefit1.desc': {
    en: 'Simply scan invoices and let AI extract all GST details accurately.',
    hi: 'बस invoice scan करें और AI सारी GST जानकारी सही निकाल देगा।',
  },
  'landing.benefit2.title': {
    en: 'Auto Reconciliation', hi: 'ऑटो मिलान', mr: 'ऑटो जुळवणी',
    ta: 'தானியங்கு சரிபார்ப்பு', te: 'ఆటో సరిపోలిక', gu: 'ઑટો મેળવણી',
  },
  'landing.benefit2.desc': {
    en: 'Match purchases with GSTR-2B effortlessly and track ITC.',
    hi: 'खरीद को GSTR-2B से आसानी से मिलाएँ और ITC track करें।',
  },
  'landing.benefit3.title': {
    en: 'Compliance Check', hi: 'अनुपालन जाँच', mr: 'अनुपालन तपासणी',
    ta: 'இணக்க சரிபார்ப்பு', te: 'వర్తింపు తనిఖీ', gu: 'અનુપાલન તપાસ',
  },
  'landing.benefit3.desc': {
    en: 'Real-time alerts for mismatches and filing deadlines.',
    hi: 'Mismatch और filing deadline के लिए real-time alerts।',
  },
  'landing.haveAccount': {
    en: 'Already have an account?',
    hi: 'पहले से account है?',
    mr: 'आधीच खाते आहे?',
    ta: 'ஏற்கனவே கணக்கு உள்ளதா?',
    te: 'ఇప్పటికే ఖాతా ఉందా?',
    gu: 'પહેલેથી એકાઉન્ટ છે?',
  },
  'landing.demoMode': {
    en: 'Explore Demo Mode', hi: 'Demo Mode देखें', mr: 'डेमो मोड पहा',
    ta: 'டெமோ பயன்முறையை ஆராயுங்கள்', te: 'డెమో మోడ్‌ను చూడండి', gu: 'ડેમો મોડ જુઓ',
  },

  // ---- Common ----
  'common.getStarted': {
    en: 'Get Started', hi: 'शुरू करें', mr: 'सुरू करा',
    ta: 'தொடங்குங்கள்', te: 'ప్రారంభించండి', gu: 'શરૂ કરો',
  },
  'common.viewAll': { en: 'View All', hi: 'सभी देखें', mr: 'सर्व पहा', ta: 'அனைத்தையும் காண்க', te: 'అన్నీ చూడండి', gu: 'બધું જુઓ' },
  'common.sendOtp': { en: 'Send OTP', hi: 'OTP भेजें', mr: 'OTP पाठवा', ta: 'OTP அனுப்பு', te: 'OTP పంపండి', gu: 'OTP મોકલો' },
  'common.verify': { en: 'Verify', hi: 'Verify करें', mr: 'पडताळा', ta: 'சரிபார்க்க', te: 'ధృవీకరించండి', gu: 'ચકાસો' },
  'common.review': { en: 'Review', hi: 'देखें' },
  'common.fix': { en: 'Fix', hi: 'ठीक करें' },
  'common.action': { en: 'Action', hi: 'कार्रवाई' },
  'common.due': { en: 'Due', hi: 'देय' },
  'common.now': { en: 'Just now', hi: 'अभी' },
  'common.unknown': { en: 'Unknown', hi: 'अज्ञात' },
  'common.general': { en: 'General', hi: 'सामान्य' },
  'common.error': { en: 'Error', hi: 'त्रुटि' },

  // ---- Navigation ----
  'nav.home': { en: 'Home', hi: 'होम', mr: 'होम', ta: 'முகப்பு', te: 'హోమ్', gu: 'હોમ' },
  'nav.invoices': { en: 'Invoices', hi: 'Invoice', mr: 'इन्व्हॉइस', ta: 'விலைப்பட்டியல்', te: 'ఇన్‌వాయిస్‌లు', gu: 'ઇન્વોઇસ' },
  'nav.gstr2b': { en: 'GSTR-2B', hi: 'GSTR-2B', mr: 'GSTR-2B', ta: 'GSTR-2B', te: 'GSTR-2B', gu: 'GSTR-2B' },
  'nav.tasks': { en: 'Tasks', hi: 'काम', mr: 'कार्ये', ta: 'பணிகள்', te: 'పనులు', gu: 'કાર્યો' },
  'nav.voice': { en: 'Voice', hi: 'आवाज़', mr: 'व्हॉइस', ta: 'குரல்', te: 'వాయిస్', gu: 'વોઇસ' },

  // ---- Login ----
  'login.tagline': {
    en: 'Manage your business easily.', hi: 'अपना व्यापार आसानी से संभालें।',
    mr: 'तुमचा व्यवसाय सहज सांभाळा.', ta: 'உங்கள் வணிகத்தை எளிதாக நிர்வகியுங்கள்.',
    te: 'మీ వ్యాపారాన్ని సులభంగా నిర్వహించండి.', gu: 'તમારો વ્યવસાય સરળતાથી સંભાળો.',
  },
  'login.welcome': { en: 'Welcome Back', hi: 'फिर से स्वागत है', mr: 'पुन्हा स्वागत आहे', ta: 'மீண்டும் வரவேற்பு', te: 'తిరిగి స్వాగతం', gu: 'ફરી સ્વાગત છે' },
  'login.subtitle': {
    en: 'Enter your mobile number to securely log in or create an account.',
    hi: 'सुरक्षित login या नया account बनाने के लिए अपना मोबाइल नंबर डालें।',
    mr: 'सुरक्षित लॉगिनसाठी तुमचा मोबाइल नंबर टाका.', ta: 'பாதுகாப்பாக உள்நுழைய மொபைல் எண்ணை உள்ளிடவும்.',
    te: 'సురక్షితంగా లాగిన్ అవ్వడానికి మీ మొబైల్ నంబర్ నమోదు చేయండి.', gu: 'સુરક્ષિત લોગિન માટે મોબાઇલ નંબર દાખલ કરો.',
  },
  'login.fullName': { en: 'Full Name', hi: 'पूरा नाम', mr: 'पूर्ण नाव', ta: 'முழு பெயர்', te: 'పూర్తి పేరు', gu: 'પૂરું નામ' },
  'login.fullNamePlaceholder': {
    en: 'Enter your full name', hi: 'अपना पूरा नाम डालें', mr: 'तुमचे पूर्ण नाव टाका',
    ta: 'உங்கள் முழு பெயரை உள்ளிடவும்', te: 'మీ పూర్తి పేరును నమోదు చేయండి', gu: 'તમારું પૂરું નામ દાખલ કરો',
  },
  'login.mobileNumber': {
    en: 'Mobile Number', hi: 'मोबाइल नंबर', mr: 'मोबाइल नंबर',
    ta: 'மொபைல் எண்', te: 'మొబైల్ నంబర్', gu: 'મોબાઇલ નંબર',
  },
  'login.phonePlaceholder': {
    en: 'Enter your 10-digit number', hi: '10 अंकों का नंबर डालें',
    mr: '10 अंकी नंबर टाका', ta: '10 இலக்க எண்ணை உள்ளிடவும்',
    te: '10 అంకెల నంబర్‌ను నమోదు చేయండి', gu: '10 અંકનો નંબર દાખલ કરો',
  },
  'login.enterOtp': { en: 'Enter OTP', hi: 'OTP डालें', mr: 'OTP टाका', ta: 'OTP உள்ளிடவும்', te: 'OTP నమోదు చేయండి', gu: 'OTP દાખલ કરો' },
  'login.otpSentTo': { en: 'Sent to +91 {masked}', hi: '+91 {masked} पर भेजा गया' },
  'login.resendOtp': { en: 'Resend OTP', hi: 'OTP फिर से भेजें', mr: 'OTP पुन्हा पाठवा', ta: 'OTP மீண்டும் அனுப்பு', te: 'OTP మళ్లీ పంపండి', gu: 'OTP ફરી મોકલો' },
  'login.invalidPhone': { en: 'Please enter a 10-digit mobile number', hi: 'कृपया 10 अंकों का मोबाइल नंबर डालें' },
  'login.invalidOtp': { en: 'Please enter the 6-digit OTP', hi: 'कृपया 6 अंकों का OTP डालें' },
  'login.wrongOtp': { en: 'Wrong OTP. Test OTP: 123456', hi: 'गलत OTP। Test OTP: 123456' },

  // ---- Dashboard ----
  'dash.greeting': { en: 'Hello, {name}', hi: 'नमस्ते, {name}' },
  'dash.itcStatus': { en: 'Your ITC status for {month}', hi: '{month} के लिए आपका ITC status' },
  'dash.readyToClaim': { en: 'Ready to claim', hi: 'claim के लिए तैयार' },
  'dash.itcSummary': { en: 'ITC Summary', hi: 'ITC सारांश' },
  'dash.openTasks': { en: 'Open Tasks', hi: 'खुले काम' },
  'dash.noTasks': { en: 'No pending tasks', hi: 'कोई pending काम नहीं' },
  'dash.recentAlerts': { en: 'Recent Alerts', hi: 'हाल की जानकारी' },
  'dash.connected': { en: 'Connected to server', hi: 'Server से जुड़ा है' },

  // ---- ITC ----
  'itc.title': { en: 'ITC Dashboard', hi: 'ITC की जानकारी' },
  'itc.eligible': { en: 'Eligible ITC', hi: 'योग्य ITC' },
  'itc.recoverable': { en: 'Recoverable ITC', hi: 'वापस मिल सकने वाला ITC' },
  'itc.blocked': { en: 'Blocked ITC', hi: 'अटका हुआ ITC' },
  'itc.pendingAction': { en: 'Pending Action', hi: 'लंबित कार्रवाई' },
  'itc.disputed': { en: 'Disputed', hi: 'विवादित' },
  'itc.eligibleTrend': { en: 'Eligible ITC Trend', hi: 'योग्य ITC रुझान' },
  'itc.last6': { en: 'Last 6 Months', hi: 'पिछले 6 महीने' },
  'itc.blockedCauses': { en: 'Blocked Causes', hi: 'रुकावट के कारण' },
  'itc.highPriority': { en: 'High Priority Recovery', hi: 'जरूरी वसूली' },
  'itc.highPriorityNote': { en: 'Top value invoices needing action.', hi: 'सबसे ज्यादा रकम वाले invoice जिन पर कार्रवाई चाहिए।' },
  'itc.notifySupplier': { en: 'Notify Supplier', hi: 'Supplier को बताएं' },

  // ---- Invoice upload ----
  'upload.title': { en: 'Upload Invoice', hi: 'Invoice जोड़ें' },
  'upload.subtitle': { en: 'Upload a photo or PDF you received on WhatsApp', hi: 'WhatsApp से मिली photo या PDF यहाँ upload करें' },
  'upload.scan': { en: 'Scan Document', hi: 'Document Scan करें' },
  'upload.gallery': { en: 'Choose from Gallery', hi: 'Gallery से चुनें' },
  'upload.pdf': { en: 'Upload PDF', hi: 'PDF Upload करें' },
  'upload.manual': { en: 'Manual Entry', hi: 'खुद भरें' },
  'upload.recent': { en: 'Recent Uploads', hi: 'हाल के Uploads' },
  'upload.processing': { en: 'Reading your invoice...', hi: 'Invoice पढ़ रहे हैं...' },
  'upload.processingSub': { en: 'This will take a few seconds', hi: 'कुछ सेकंड लगेंगे' },
  'upload.uploaded': { en: 'Invoice uploaded', hi: 'Invoice upload हो गया' },
  'upload.error': { en: 'Something went wrong uploading. Please try again.', hi: 'Invoice upload में गड़बड़ हुई। दोबारा try करें।' },
  'upload.cameraPerm': { en: 'Camera permission required', hi: 'Camera की अनुमति चाहिए' },
  'upload.unreadable': { en: 'Document unreadable?', hi: 'Document पढ़ा नहीं जा रहा?' },
  'upload.manualSoon': { en: 'Manual entry form coming soon.', hi: 'खुद भरने का form जल्द आ रहा है।' },

  // ---- Data Verification ----
  'verify.extracted': { en: 'Invoice Extracted', hi: 'Invoice निकाला गया' },
  'verify.details': { en: 'Invoice Details', hi: 'Invoice जानकारी' },
  'verify.amounts': { en: 'Amount Breakdown', hi: 'रकम का विवरण' },
  'verify.total': { en: 'Total Amount', hi: 'कुल रकम' },
  'verify.uploadAnother': { en: 'Upload Another Invoice', hi: 'दूसरा Invoice जोड़ें' },
  'verify.saveAndContinue': { en: 'Save & Continue', hi: 'सेव करें और आगे बढ़ें' },

  // ---- Status ----
  'status.processing': { en: 'Processing', hi: 'Processing' },
  'status.completed': { en: 'Completed', hi: 'पूरा' },
  'status.open': { en: 'Open', hi: 'खुला' },
  'status.inProgress': { en: 'In Progress', hi: 'चल रहा है' },
  'status.done': { en: 'Done', hi: 'पूरा' },

  // ---- GSTR-2B ----
  'gstr.title': { en: 'GSTR-2B Reconciliation', hi: 'GSTR-2B मिलान' },
  'gstr.subtitle': { en: 'Review and resolve invoice mismatches for the current filing period.', hi: 'इस filing period के invoice mismatches देखें और सुलझाएँ।' },
  'gstr.totalInvoices': { en: 'Total Invoices', hi: 'कुल Invoice' },
  'gstr.matched': { en: 'Matched', hi: 'मिले' },
  'gstr.mismatched': { en: 'Mismatched', hi: 'नहीं मिले' },
  'gstr.missingIn2b': { en: 'Missing in 2B', hi: '2B में नहीं' },
  'gstr.matchStatus': { en: 'Match Status', hi: 'मिलान स्थिति' },
  'gstr.blockedByType': { en: 'Blocked ITC by Mismatch Type', hi: 'Mismatch के अनुसार रुका ITC' },
  'gstr.actionRequired': { en: 'Action Required: Mismatched Records', hi: 'कार्रवाई चाहिए: गलत Records' },
  'gstr.uploadFile': { en: 'Upload File', hi: 'File Upload करें' },
  'gstr.uploadPrompt': { en: 'Upload your GSTR-2B file to start reconciliation', hi: 'मिलान शुरू करने के लिए GSTR-2B file upload करें' },
  'gstr.uploadSuccess': { en: 'GSTR-2B processed successfully', hi: 'GSTR-2B सफलतापूर्वक process हुआ' },
  'gstr.uploadError': { en: 'Upload failed', hi: 'Upload में गड़बड़ हुई' },

  // ---- Filters ----
  'filter.all': { en: 'All', hi: 'सभी' },
  'filter.gstinError': { en: 'GSTIN Error', hi: 'GSTIN गलत' },
  'filter.valueMismatch': { en: 'Value Mismatch', hi: 'रकम गलत' },
  'filter.missing': { en: 'Missing', hi: 'नहीं मिला' },
  'filter.overdue': { en: 'Overdue', hi: 'देरी' },
  'filter.dueToday': { en: 'Due Today', hi: 'आज देय' },
  'filter.high': { en: 'High Priority', hi: 'जरूरी' },

  // ---- Tasks ----
  'tasks.title': { en: 'Task Manager', hi: 'काम प्रबंधक' },
  'tasks.tagline': { en: 'Keep your GST compliance on track.', hi: 'अपनी GST compliance सही रखें।' },
  'tasks.allTasks': { en: 'All Tasks', hi: 'सभी काम' },
  'tasks.summary': { en: 'Task Summary', hi: 'काम का सारांश' },
  'tasks.completionRate': { en: 'Completion Rate', hi: 'पूर्णता दर' },
  'tasks.highPriorityCount': { en: '{n} High Priority Tasks', hi: '{n} जरूरी काम' },
  'tasks.highPriorityNote': { en: 'Require attention today to avoid late fees.', hi: 'Late fees से बचने के लिए आज ध्यान दें।' },
  'tasks.noTasks': { en: 'All done! No pending tasks.', hi: 'सब हो गया! कोई pending काम नहीं।' },
  'tasks.markDone': { en: 'Mark Done', hi: 'पूरा करें' },
  'tasks.itcAffected': { en: '{amount} ITC affected', hi: '{amount} ITC प्रभावित' },

  // ---- Voice ----
  'voice.title': { en: 'Voice Assistant', hi: 'आवाज़ सहायक', mr: 'व्हॉइस सहाय्यक', ta: 'குரல் உதவியாளர்', te: 'వాయిస్ అసిస్టెంట్', gu: 'વોઇસ સહાયક' },
  'voice.listening': { en: 'Listening...', hi: 'सुन रहा हूँ...' },
  'voice.assistant': { en: 'Assistant', hi: 'सहायक' },
  'voice.greeting': { en: 'Hello{name}. How can I assist you with your compliance today?', hi: 'नमस्ते{name}। आज आपकी GST compliance में कैसे मदद करूँ?' },
  'voice.suggested': { en: 'Suggested Queries', hi: 'सुझाए गए सवाल' },
  'voice.q1': { en: 'Show ITC Summary', hi: 'ITC सारांश दिखाएँ' },
  'voice.q2': { en: 'Open Tasks', hi: 'खुले काम' },
  'voice.q3': { en: 'Recent Alerts', hi: 'हाल की जानकारी' },
  'voice.thinking': { en: 'Thinking...', hi: 'सोच रहा हूँ...' },
  'voice.error': { en: 'Something went wrong. Please try again.', hi: 'कुछ गड़बड़ हुई। दोबारा try करें।' },
  'voice.placeholder': { en: 'Ask anything about your GST', hi: 'अपना GST सवाल लिखें' },

  // ---- Suppliers ----
  'supplier.title': { en: 'Suppliers', hi: 'Suppliers' },
  'supplier.empty': { en: 'No suppliers found.', hi: 'कोई supplier नहीं मिला।' },
  'supplier.emptySub': { en: 'Suppliers will appear after invoice uploads', hi: 'Invoice upload के बाद suppliers दिखेंगे' },
  'supplier.score': { en: 'Score', hi: 'स्कोर' },
  'supplier.invoices': { en: 'Invoices', hi: 'Invoice' },
  'supplier.errors': { en: 'Errors', hi: 'गलतियाँ' },
  'supplier.blocked': { en: 'Blocked', hi: 'अटका' },
  'supplier.reliable': { en: 'Reliable', hi: 'विश्वसनीय' },
  'supplier.caution': { en: 'Caution', hi: 'सावधान' },
  'supplier.problematic': { en: 'Problematic', hi: 'समस्या' },

  // ---- Profile ----
  'profile.title': { en: 'Profile', hi: 'प्रोफ़ाइल' },
  'profile.totalInvoices': { en: 'Total Invoices', hi: 'कुल Invoice' },
  'profile.itcClaimed': { en: 'ITC Claimed', hi: 'ITC लिया गया' },
  'profile.pendingTasks': { en: 'Pending Tasks', hi: 'बाकी काम' },
  'profile.actionsRequired': { en: '{n} Actions Required', hi: '{n} काम बाकी' },
  'profile.complianceCalendar': { en: 'GST Compliance Calendar', hi: 'GST अनुपालन कैलेंडर' },
  'profile.gstr1Due': { en: 'GSTR-1 Due Soon', hi: 'GSTR-1 जल्द देय' },
  'profile.gstr1DueNote': { en: 'Last date to file GSTR-1 is 11th. File early to avoid penalties.', hi: 'GSTR-1 भरने की आखिरी तारीख 11 है। Penalty से बचने के लिए जल्दी भरें।' },
  'profile.accountSettings': { en: 'Account Settings', hi: 'खाता सेटिंग्स' },
  'profile.notifications': { en: 'Notifications', hi: 'सूचनाएँ' },
  'profile.security': { en: 'Security', hi: 'सुरक्षा' },
  'profile.help': { en: 'Help & Support', hi: 'मदद और सहायता' },
  'profile.logout': { en: 'Logout', hi: 'लॉग आउट' },

  // ---- Risk tiers ----
  'risk.low': { en: 'Low Risk', hi: 'कम जोखिम' },
  'risk.medium': { en: 'Medium Risk', hi: 'मध्यम जोखिम' },
  'risk.high': { en: 'High Risk', hi: 'अधिक जोखिम' },
  'risk.critical': { en: 'Critical', hi: 'गंभीर' },
  'risk.score': { en: 'Score', hi: 'स्कोर' },
};
