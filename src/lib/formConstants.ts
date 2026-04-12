
export const DEFAULT_SYSTEM_MESSAGES = {
  buttons: {
    confirm: "OK",
    next_instruction: "press Enter ↵",
    hint_multiple: "Choose as many as you like",
    dropdown_instruction: "Type or select an option",
    dropdown_touch: "Select an option",
    other_label: "Other",
    other_hint: "Type your answer",
    multiple_min: "Choose {min_selection}",
    multiple_additional: "Choose {additional_selections} more",
    multiple_max_step1: "You can choose up to {max_selection}",
    multiple_max_step2: "You can choose {additional_selections} more",
    multiple_range: "Make between {min_selection} and {max_selection} choices",
    multiple_at_least: "Choose at least {min_selection}",
    multiple_range_additional: "Choose at least {additional_selections} more",
    text_hint: "Type your answer here...",
    keyboard_hint: "Key",
    yes: "Yes",
    no: "No",
    yes_shortcut: "Y",
    no_shortcut: "N",
    legal_accept: "I accept",
    legal_reject: "I don't accept",
    review_errors: "Review",
    submit: "Submit",
    continue: "Continue"
  },
  errors: {
    required: "Please fill this in",
    selection_required: "Oops! Please make a selection",
    value_required: "Oops! Please enter a value",
    legal_rejected: "Please agree to the terms & conditions",
    email_invalid: "Hmm... that email doesn't look right",
    url_invalid: "Hmm… that web address doesn’t look right. Check for any typos or errors.",
    number_range: "Please enter a number between {min_value} and {max_value}",
    number_min: "Please enter a number greater than {min_value}",
    number_max: "Please enter a number lower than {max_value}",
    dropdown_no_suggestions: "No suggestions found",
    phone_invalid: "Hmm... that phone number doesn't look right"
  },
  loading: {
    all_done: "All done! Thanks for your time.",
    no_connection: "Oh no, you can't connect to the server right now",
    server_error: "Server error! Your request wasn't completed",
    not_available: "The Biotra form {name}, is currently unavailable. Please try again in a few moments."
  },
  other: {
    simple_mode: "You're viewing this form in \"simple\" mode. This is because your device is not yet supported by Biotra.",
    line_break_hint: "Shift ⇧ + Enter ↵ to make a line break"
  },
  file_upload: {
    required: "Oops! Please upload a file",
    button: "Choose file",
    drag_hint: "or drag here",
    too_big: "Your file is too big",
    uploading: "Your file is still uploading, please wait..."
  }
};

export const LANGUAGE_PRESETS: Record<string, typeof DEFAULT_SYSTEM_MESSAGES> = {
  English: DEFAULT_SYSTEM_MESSAGES,
  Hindi: {
    buttons: {
      confirm: "ठीक है",
      next_instruction: "Enter दबाएं ↵",
      hint_multiple: "जितने चाहें चुनें",
      dropdown_instruction: "टाइप करें या चुनें",
      dropdown_touch: "एक विकल्प चुनें",
      other_label: "अन्य",
      other_hint: "अपना उत्तर टाइप करें",
      multiple_min: "{min_selection} चुनें",
      multiple_additional: "{additional_selections} और चुनें",
      multiple_max_step1: "आप {max_selection} तक चुन सकते हैं",
      multiple_max_step2: "आप {additional_selections} और चुन सकते हैं",
      multiple_range: "{min_selection} और {max_selection} के बीच चुनें",
      multiple_at_least: "कम से कम {min_selection} चुनें",
      multiple_range_additional: "कम से कम {additional_selections} और चुनें",
      text_hint: "अपना उत्तर यहाँ लिखें...",
      keyboard_hint: "कुंजी",
      yes: "हाँ",
      no: "नहीं",
      yes_shortcut: "Y",
      no_shortcut: "N",
      legal_accept: "मैं स्वीकार करता हूँ",
      legal_reject: "मैं स्वीकार नहीं करता",
      review_errors: "समीक्षा करें",
      submit: "सबमिट करें",
      continue: "जारी रखें"
    },
    errors: {
      required: "कृपया इसे भरें",
      selection_required: "कृपया एक विकल्प चुनें",
      value_required: "कृपया मान दर्ज करें",
      legal_rejected: "कृपया शर्तों से सहमत हों",
      email_invalid: "यह ईमेल सही नहीं लग रहा है",
      url_invalid: "यह वेब पता सही नहीं लग रहा है",
      number_range: "{min_value} और {max_value} के बीच संख्या दर्ज करें",
      number_min: "{min_value} से बड़ी संख्या दर्ज करें",
      number_max: "{max_value} से छोटी संख्या दर्ज करें",
      dropdown_no_suggestions: "कोई सुझाव नहीं मिला",
      phone_invalid: "यह फ़ोन नंबर सही नहीं लग रहा है"
    },
    loading: {
      all_done: "सब हो गया! धन्यवाद।",
      no_connection: "अभी सर्वर से कनेक्शन नहीं हो पा रहा है",
      server_error: "सर्वर त्रुटि!",
      not_available: "बायोट्रा फॉर्म {name} अभी उपलब्ध नहीं है।"
    },
    other: {
      simple_mode: "आप इसे सरल मोड में देख रहे हैं।",
      line_break_hint: "लाइन ब्रेक के लिए Shift ⇧ + Enter ↵"
    },
    file_upload: {
      required: "कृपया फ़ाइल अपलोड करें",
      button: "फ़ाइल चुनें",
      drag_hint: "या यहाँ खींचें",
      too_big: "आपकी फ़ाइल बहुत बड़ी है",
      uploading: "फ़ाइल अपलोड हो रही है..."
    }
  },
  Marathi: {
    buttons: {
      confirm: "ठीक आहे",
      next_instruction: "Enter दाबा ↵",
      hint_multiple: "तुम्हाला हवे तितके निवडा",
      dropdown_instruction: "टाईप करा किंवा निवडा",
      dropdown_touch: "एक पर्याय निवडा",
      other_label: "इतर",
      other_hint: "तुमचे उत्तर लिहा",
      multiple_min: "{min_selection} निवडा",
      multiple_additional: "आणखी {additional_selections} निवडा",
      multiple_max_step1: "तुम्ही {max_selection} पर्यंत निवडू शकता",
      multiple_max_step2: "तुम्ही आणखी {additional_selections} निवडू शकता",
      multiple_range: "{min_selection} आणि {max_selection} दरम्यान निवडा",
      multiple_at_least: "किमान {min_selection} निवडा",
      multiple_range_additional: "आणखी किमान {additional_selections} निवडा",
      text_hint: "तुमचे उत्तर इथे लिहा...",
      keyboard_hint: "की",
      yes: "हो",
      no: "नाही",
      yes_shortcut: "Y",
      no_shortcut: "N",
      legal_accept: "मी मान्य करतो",
      legal_reject: "मी मान्य करत नाही",
      review_errors: "पुनरावलोकन करा",
      submit: "सबमिट करा",
      continue: "पुढे जा"
    },
    errors: {
      required: "कृपया ही माहिती भरा",
      selection_required: "कृपया एक पर्याय निवडा",
      value_required: "कृपया माहिती भरा",
      legal_rejected: "कृपया अटी व शर्ती मान्य करा",
      email_invalid: "हा ईमेल आयडी चुकीचा वाटतोय",
      url_invalid: "ही वेबसाईट लिंक चुकीची वाटत आहे",
      number_range: "{min_value} ते {max_value} दरम्यानची संख्या भरा",
      number_min: "{min_value} पेक्षा मोठी संख्या भरा",
      number_max: "{max_value} पेक्षा लहान संख्या भरा",
      dropdown_no_suggestions: "काहीही सापडले नाही",
      phone_invalid: "हा फोन नंबर चुकीचा वाटतोय"
    },
    loading: {
      all_done: "पूर्ण झाले! धन्यवाद।",
      no_connection: "सर्व्हरशी संपर्क होऊ शकत नाही",
      server_error: "सर्व्हर एरर!",
      not_available: "हा फॉर्म {name} सध्या उपलब्ध नाही।"
    },
    other: {
      simple_mode: "तुम्ही हे साध्या मोडमध्ये पाहत आहात।",
      line_break_hint: "बदलण्यासाठी Shift ⇧ + Enter ↵"
    },
    file_upload: {
      required: "कृपया फाईल अपलोड करा",
      button: "फाईल निवडा",
      drag_hint: "किंवा इथे ओढा",
      too_big: "तुमची फाईल खूप मोठी आहे",
      uploading: "फाईल अपलोड होत आहे..."
    }
  },
  Gujarati: {
    buttons: {
      confirm: "ઠીક છે",
      next_instruction: "Enter દબાવો ↵",
      hint_multiple: "તમને ગમે તેટલા પસંદ કરો",
      dropdown_instruction: "ટાઈપ કરો અથવા પસંદ કરો",
      dropdown_touch: "એક વિકલ્પ પસંદ કરો",
      other_label: "અન્ય",
      other_hint: "તમારો જવાબ લખો",
      multiple_min: "{min_selection} પસંદ કરો",
      multiple_additional: "વધુ {additional_selections} પસંદ કરો",
      multiple_max_step1: "તમે {max_selection} સુધી પસંદ કરી શકો છો",
      multiple_max_step2: "તમે વધુ {additional_selections} પસંદ કરી શકો છો",
      multiple_range: "{min_selection} અને {max_selection} વચ્ચે પસંદ કરો",
      multiple_at_least: "ઓછામાં ઓછા {min_selection} પસંદ કરો",
      multiple_range_additional: "વધુમાં વધુ {additional_selections} પસંદ કરો",
      text_hint: "તમારો જવાબ અહીં લખો...",
      keyboard_hint: "કી",
      yes: "હા",
      no: "ના",
      yes_shortcut: "Y",
      no_shortcut: "N",
      legal_accept: "હું સ્વીકારું છું",
      legal_reject: "હું સ્વીકારતો નથી",
      review_errors: "ફરી તપાસો",
      submit: "સબમિટ કરો",
      continue: "ચાલુ રાખો"
    },
    errors: {
      required: "કૃપા કરીને આ ભરો",
      selection_required: "કૃપા કરીને એક વિકલ્પ પસંદ કરો",
      value_required: "કૃપા કરીને કિંમત દાખલ કરો",
      legal_rejected: "કૃપા કરીને શરતો સાથે સંમત થાઓ",
      email_invalid: "આ ઇમેઇલ સાચો લાગતો નથી",
      url_invalid: "આ વેબ સરનામું સાચું લાગતું નથી",
      number_range: "{min_value} અને {max_value} ની વચ્ચેની સંખ્યા દાખલ કરો",
      number_min: "{min_value} થી મોટી સંખ્યા દાखલ કરો",
      number_max: "{max_value} થી નાની संख्या દાખલ કરો",
      dropdown_no_suggestions: "કોઈ સૂચનો મળ્યા નથી",
      phone_invalid: "આ ફોન નંબર સાચો લાગતો નથી"
    },
    loading: {
      all_done: "બધું થઈ ગયું! આભાર।",
      no_connection: "અત્યારે સર્વર સાથે જોડાણ થઈ શકતું નથી",
      server_error: "સર્વર ભૂલ!",
      not_available: "આ ફોર્મ {name} અત્યારે ઉપલબ્ધ નથી।"
    },
    other: {
      simple_mode: "તમે આ સરળ મોડમાં જોઈ રહ્યા છો।",
      line_break_hint: "ലൈൻ മാറാൻ Shift ⇧ + Enter ↵"
    },
    file_upload: {
      required: "કૃપા કરીને ફાઇલ અપલોડ કરો",
      button: "ફાઇલ પસંદ કરો",
      drag_hint: "અથવા અહીં ખેંચો",
      too_big: "તમારી ફાઇલ ખૂબ મોટી છે",
      uploading: "ફાઇલ અપલોડ થઈ રહી છે..."
    }
  },
  Spanish: {
    buttons: {
      confirm: "OK",
      next_instruction: "presione Enter ↵",
      hint_multiple: "Elige tantas como quieras",
      dropdown_instruction: "Escribe o selecciona una opción",
      dropdown_touch: "Selecciona una opción",
      other_label: "Otro",
      other_hint: "Escribe tu respuesta",
      multiple_min: "Elige {min_selection}",
      multiple_additional: "Elige {additional_selections} más",
      multiple_max_step1: "Puedes elegir hasta {max_selection}",
      multiple_max_step2: "Puedes elegir {additional_selections} más",
      multiple_range: "Elige entre {min_selection} y {max_selection}",
      multiple_at_least: "Elige al menos {min_selection}",
      multiple_range_additional: "Elige al menos {additional_selections} más",
      text_hint: "Escribe tu respuesta aquí...",
      keyboard_hint: "Tecla",
      yes: "Sí",
      no: "No",
      yes_shortcut: "S",
      no_shortcut: "N",
      legal_accept: "Acepto",
      legal_reject: "No acepto",
      review_errors: "Revisar",
      submit: "Enviar",
      continue: "Continuar"
    },
    errors: {
      required: "Por favor, completa esto",
      selection_required: "¡Uy! Por favor, haz una selección",
      value_required: "¡Uy! Por favor, introduce un valor",
      legal_rejected: "Por favor, acepta los términos y condiciones",
      email_invalid: "Mmm... ese correo no parece correcto",
      url_invalid: "Mmm... esa dirección web no parece correcta.",
      number_range: "Por favor, introduce un número entre {min_value} y {max_value}",
      number_min: "Por favor, introduce un número mayor que {min_value}",
      number_max: "Por favor, introduce un número menor que {max_value}",
      dropdown_no_suggestions: "No se encontraron sugerencias",
      phone_invalid: "Mmm... ese número de teléfono no parece correcto"
    },
    loading: {
      all_done: "¡Todo listo! Gracias por tu tiempo.",
      no_connection: "Oh no, no puedes conectarte al servidor en este momento",
      server_error: "¡Error del servidor! Tu solicitud no se completó",
      not_available: "El formulario {name} no está disponible actualmente."
    },
    other: {
      simple_mode: "Estás viendo este formulario en modo \"simple\".",
      line_break_hint: "Shift ⇧ + Enter ↵ para un salto de línea"
    },
    file_upload: {
      required: "¡Uy! Por favor, sube un archivo",
      button: "Elegir archivo",
      drag_hint: "o arrastra aquí",
      too_big: "Tu archivo es demasiado grande",
      uploading: "Tu archivo aún se está subiendo, por favor espera..."
    }
  }
};

export const FORM_THEMES = [
  {
    id: "brutal",
    name: "Brutalist Default",
    page: "bg-[#f2f3f5]",
    card: "border-4 border-black bg-white shadow-[10px_10px_0_0_rgba(0,0,0,1)]",
    button: "border-3 border-black bg-black text-white hover:bg-emerald-500",
    field: "border-2 border-black bg-white focus:bg-emerald-50",
    accent: "bg-emerald-500",
    text: "text-black"
  },
  {
    id: "glass",
    name: "Frosted Glass",
    page: "bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500",
    card: "bg-white/10 backdrop-blur-xl border border-white/20 shadow-2xl rounded-3xl text-white",
    button: "bg-white text-indigo-600 hover:bg-white/90 rounded-xl font-bold shadow-lg",
    field: "bg-white/10 border border-white/30 text-white placeholder:text-white/50 focus:bg-white/20 rounded-lg",
    accent: "bg-white",
    text: "text-white"
  },
  {
    id: "midnight",
    name: "Midnight Noir",
    page: "bg-[#050505]",
    card: "bg-[#111] border border-white/5 shadow-[0_0_50px_rgba(0,0,0,1)] rounded-2xl text-white",
    button: "bg-emerald-500 text-black hover:bg-emerald-400 rounded-lg font-black uppercase tracking-widest",
    field: "bg-black border border-white/10 text-white focus:border-emerald-500/50 rounded-md",
    accent: "bg-emerald-500",
    text: "text-white"
  },
  {
    id: "aurora",
    name: "Soft Aurora",
    page: "bg-[#fdfcfb] bg-gradient-to-tr from-[#e2ebf0] to-[#fdfcfb]",
    card: "bg-white shadow-[0_20px_60px_rgba(0,0,0,0.05)] border border-slate-100 rounded-[32px] text-slate-800",
    button: "bg-indigo-600 text-white hover:bg-indigo-700 rounded-2xl shadow-indigo-200 shadow-xl",
    field: "bg-slate-50 border-none focus:ring-2 focus:ring-indigo-100 rounded-xl",
    accent: "bg-indigo-600",
    text: "text-slate-800"
  },
  {
    id: "plain-blue",
    name: "Corporate Blue",
    page: "bg-[#f8fafc]",
    card: "border border-slate-200 bg-white shadow-sm rounded-xl text-slate-900",
    button: "bg-blue-600 text-white hover:bg-blue-700 rounded-md",
    field: "border border-slate-200 bg-white focus:border-blue-500 rounded-md",
    accent: "bg-blue-500",
    text: "text-slate-900"
  },
  {
    id: "minimal",
    name: "Zen Minimal",
    page: "bg-white",
    card: "bg-white border-none text-black p-0",
    button: "bg-black text-white hover:opacity-80 rounded-none h-14 px-10 text-lg",
    field: "border-b-2 border-black bg-transparent rounded-none focus:border-emerald-500 px-0",
    accent: "bg-black",
    text: "text-black"
  }
];

export const QUESTION_CATEGORIES = [
  {
    id: "contact",
    name: "Contact info",
    items: [
      { type: "contact_info", label: "Contact Info", icon: "User" },
      { type: "email", label: "Email", icon: "Mail" },
      { type: "phone", label: "Phone Number", icon: "Phone" },
      { type: "address", label: "Address", icon: "MapPin" },
      { type: "website", label: "Website", icon: "Link" }
    ]
  },
  {
    id: "choice",
    name: "Choice",
    items: [
      { type: "multiple_choice", label: "Multiple Choice", icon: "List" },
      { type: "dropdown", label: "Dropdown", icon: "ChevronDown" },
      { type: "picture_choice", label: "Picture Choice", icon: "Image" },
      { type: "yes_no", label: "Yes/No", icon: "CircleDot" },
      { type: "legal", label: "Legal", icon: "Scale" },
      { type: "checkbox", label: "Checkbox", icon: "CheckSquare" }
    ]
  },
  {
    id: "rating",
    name: "Rating & ranking",
    items: [
      { type: "nps", label: "Net Promoter Score®", icon: "Activity" },
      { type: "opinion_scale", label: "Opinion Scale", icon: "BarChart3" },
      { type: "rating", label: "Rating", icon: "Star" },
      { type: "ranking", label: "Ranking", icon: "ListOrdered" },
      { type: "matrix", label: "Matrix", icon: "Grid" }
    ]
  },
  {
    id: "text",
    name: "Text & Video",
    items: [
      { type: "long_text", label: "Long Text", icon: "AlignLeft" },
      { type: "short_text", label: "Short Text", icon: "Minus" },
      { type: "video_audio", label: "Video and Audio", icon: "Video" },
      { type: "ai_clarify", label: "Clarify with AI", icon: "Sparkles" },
      { type: "ai_faq", label: "FAQ with AI", icon: "MessageCircle" }
    ]
  },
  {
    id: "other",
    name: "Other",
    items: [
      { type: "number", label: "Number", icon: "Hash" },
      { type: "date", label: "Date", icon: "Calendar" },
      { type: "signature", label: "Signature", icon: "PenTool" },
      { type: "payment", label: "Payment", icon: "CreditCard" },
      { type: "file", label: "File Upload", icon: "Upload" },
      { type: "google_drive", label: "Google Drive", icon: "Download" },
      { type: "calendly", label: "Calendly", icon: "Clock" }
    ]
  },
  {
    id: "layout",
    name: "Layout",
    items: [
      { type: "welcome_screen", label: "Welcome Screen", icon: "Home" },
      { type: "partial_submit", label: "Partial Submit Point", icon: "Filter" },
      { type: "statement", label: "Statement", icon: "Quote" },
      { type: "question_group", label: "Question Group", icon: "Layers" },
      { type: "end_screen", label: "End Screen", icon: "CheckCircle" },
      { type: "redirect", label: "Redirect to URL", icon: "ExternalLink" }
    ]
  }
];
