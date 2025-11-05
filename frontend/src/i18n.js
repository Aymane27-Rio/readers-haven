export const dictionaries = {
  en: {
    nav: { home: 'Home', books: 'My Books', community: 'Community', signIn: 'Sign In', join: 'Join', profile: 'Profile', settings: 'Settings', signOut: 'Sign Out' },
    settings: {
      title: 'Settings', hello: 'Hello', manage: 'Manage your preferences.',
      theme: 'Theme', system: 'System', light: 'Light', dark: 'Dark',
      email: 'Notifications', email_hint: 'Receive updates about comments and community activity',
      privacy: 'Visibility', shelves_public: 'Show my shelves on my public profile',
      language: 'Language', save: 'Save', signin_required: 'Please sign in to manage your settings.'
    },
    auth: {
      app: 'Readers Haven',
      tagline: 'Where stories are etched in time',
      login: 'Login',
      signup: 'Sign Up',
      email: 'Email',
      email_ph: 'you@example.com',
      password: 'Password',
      password_ph: '••••••••',
      remember: 'Remember me',
      forgot: 'Forgot password?',
      no_account: "Don’t have an account?",
      create_account: 'Create account',
      continue_google: 'Continue with Google',
      name: 'Full name',
      confirm_password: 'Confirm password',
      join_title: 'Create an Account',
      join_tagline: 'Join Readers Haven',
      already: 'Already have an account?',
      back_login: 'Back to Login'
    }
  },
  ar: {
    nav: { home: 'الرئيسية', books: 'كتبي', community: 'المجتمع', signIn: 'تسجيل الدخول', join: 'إنشاء حساب', profile: 'الملف الشخصي', settings: 'الإعدادات', signOut: 'تسجيل الخروج' },
    settings: {
      title: 'الإعدادات', hello: 'مرحبًا', manage: 'قم بإدارة تفضيلاتك.',
      theme: 'السمة', system: 'النظام', light: 'فاتح', dark: 'داكن',
      email: 'الإشعارات', email_hint: 'تلقي تحديثات حول التعليقات ونشاط المجتمع',
      privacy: 'الظهور', shelves_public: 'إظهار رفوفي في صفحتي العامة',
      language: 'اللغة', save: 'حفظ', signin_required: 'يرجى تسجيل الدخول لإدارة الإعدادات.'
    },
    auth: {
      app: 'مكتبة القرّاء',
      tagline: 'حيث تُنقش الحكايات عبر الزمن',
      login: 'تسجيل الدخول',
      signup: 'إنشاء حساب',
      email: 'البريد الإلكتروني',
      email_ph: 'you@example.com',
      password: 'كلمة المرور',
      password_ph: '••••••••',
      remember: 'تذكرني',
      forgot: 'هل نسيت كلمة المرور؟',
      no_account: 'ليس لديك حساب؟',
      create_account: 'إنشاء حساب',
      continue_google: 'المتابعة عبر Google',
      name: 'الاسم الكامل',
      confirm_password: 'تأكيد كلمة المرور',
      join_title: 'إنشاء حساب جديد',
      join_tagline: 'انضم إلى مكتبة القرّاء',
      already: 'لديك حساب بالفعل؟',
      back_login: 'العودة لتسجيل الدخول'
    }
  }
  ,
  zgh: {
    nav: { home: 'Home', books: 'My Books', community: 'Community', signIn: 'Sign In', join: 'Join', profile: 'Profile', settings: 'Settings', signOut: 'Sign Out' },
    settings: {
      title: 'Settings', hello: 'Azul', manage: 'Ssexdem iɣewwaren nnek.',
      theme: 'Asentel', system: 'Anagraw', light: 'Aceɛlal', dark: 'Aberkan',
      email: 'Iɣmumen', email_hint: 'Rmes-d ileqman ɣef iwenniten d urmud',
      privacy: 'Tuffirt', shelves_public: 'Sken agdilen inu deg usebter azayez',
      language: 'Tutlayt', save: 'Sekles', signin_required: 'Ma ulac aɣilif, qqen i wakken ad tsesxdem iɣewwaren.'
    },
    auth: {
      app: 'Readers Haven',
      tagline: 'Akan d tidyanin ttwasleḍen deg wakud',
      login: 'Qqen',
      signup: 'Rnu amiḍan',
      email: 'Imayl',
      email_ph: 'you@example.com',
      password: 'Awal uffir',
      password_ph: '••••••••',
      remember: 'Cfu-yiyi',
      forgot: 'Tettuḍ awal uffir?',
      no_account: 'Ulac amiḍan?',
      create_account: 'Rnu amiḍan',
      continue_google: 'Kemmel s Google',
      name: 'Isem ummid',
      confirm_password: 'Sentem awal uffir',
      join_title: 'Rnu amiḍan',
      join_tagline: 'Rzu ɣer Readers Haven',
      already: 'Ɣur-k yakan amiḍan?',
      back_login: 'Uɣal ɣer usenqed'
    }
  }
};

export function getLang() {
  const ls = (typeof localStorage !== 'undefined') ? localStorage.getItem('lang') : null;
  if (ls === 'ar' || ls === 'en' || ls === 'zgh') return ls;
  return 'en';
}

export function t(path) {
  const lang = getLang();
  const dict = dictionaries[lang] || dictionaries.en;
  return path.split('.').reduce((acc, k) => (acc && acc[k] != null ? acc[k] : null), dict) || path;
}
