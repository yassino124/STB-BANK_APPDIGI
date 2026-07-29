import 'dart:convert';
import 'dart:async';
import 'package:flutter/material.dart';
import 'package:shared_preferences/shared_preferences.dart';
import '../services/auth_api_service.dart';
import '../screens/auth/login_screen.dart';

class AppProvider extends ChangeNotifier {
  Timer? _pollingTimer;
  ThemeMode _themeMode = ThemeMode.light;
  String _currentLanguage = 'en';
  Map<String, dynamic>? _userProfile;
  int _unreadNotifs = 0;
  double _compteSolde = 0.0;

  AppProvider() {
    _loadSettings(); // ✅ Load theme + language immediately at construction
  }

  // ── RH Data ──────────────────────────────────────────────────────
  List<dynamic> _payrolls = [];
  List<dynamic> _credits = [];
  List<dynamic> _myRequests = [];
  List<dynamic> _investments = [];
  List<dynamic> _budgets = [];
  List<dynamic> _qrPayments = [];
  List<dynamic> _bills = [];
  List<dynamic> _recharges = [];
  List<dynamic> _conversations = [];
  List<dynamic> _messages = [];
  bool _rhDataLoaded = false;

  // ── Absence Data ─────────────────────────────────────────────────
  List<dynamic> _myAbsences = [];
  List<dynamic> _pendingAbsences = [];
  bool _absenceDataLoaded = false;

  List<dynamic> get myAbsences => _myAbsences;
  List<dynamic> get pendingAbsences => _pendingAbsences;
  bool get absenceDataLoaded => _absenceDataLoaded;

  ThemeMode get themeMode => _themeMode;
  String get currentLanguage => _currentLanguage;
  Map<String, dynamic>? get userProfile => _userProfile;
  int get unreadNotifs => _unreadNotifs;
  List<dynamic> get payrolls => _payrolls;
  List<dynamic> get credits => _credits;
  List<dynamic> get myRequests => _myRequests;
  List<dynamic> get investments => _investments;
  List<dynamic> get budgets => _budgets;
  List<dynamic> get qrPayments => _qrPayments;
  List<dynamic> get bills => _bills;
  List<dynamic> get recharges => _recharges;
  List<dynamic> get conversations => _conversations;
  List<dynamic> get messages => _messages;
  bool get rhDataLoaded => _rhDataLoaded;

  // Computed getters for common values
  double get salaireBase => (_userProfile?['salaireBase'] as num?)?.toDouble() ?? 1200.0;
  double get compteSolde => _compteSolde;
  int get soldeConges => (_userProfile?['soldeConges'] as num?)?.toInt() ?? 30;
  double get creditsEnCours => (_userProfile?['creditsEnCours'] as num?)?.toDouble() ?? 0.0;
  double get prime => (_userProfile?['prime'] as num?)?.toDouble() ?? 0.0;

  List<dynamic> get userRoles => _userProfile?['roles'] as List<dynamic>? ?? [];

  bool get isManager => userRoles.any((r) => r.toString() == 'MANAGER');

  bool get isRH => userRoles.any((r) => r.toString() == 'RH');

  bool get isFinance => userRoles.any((r) => r.toString() == 'FINANCE');

  bool get isAgence => userRoles.any((r) => r.toString() == 'AGENCE');

  Future<void> fetchProfile() async {
    // 1. Load cached profile instantly (no loading state)
    await _loadCachedProfile();

    // 2. Try live API refresh in background
    try {
      final res = await AuthApiService.getMe();
      if (res.isSuccess && res.data != null) {
        final apiData = res.data!;
        // Merge: keep cached non-null values for fields the API might return null
        if (_userProfile != null) {
          final merged = Map<String, dynamic>.from(_userProfile!);
          apiData.forEach((k, v) {
            if (v != null) merged[k] = v;
          });
          _userProfile = merged;
        } else {
          _userProfile = apiData;
        }
        // Cache updated profile
        await AuthApiService.saveProfile(jsonEncode(_userProfile));
        notifyListeners();
      }
    } catch (e) {
      debugPrint('Erreur fetchProfile API: $e');
    }

    // 3. Final fallback — if still null or missing name, use mock
    if (_userProfile == null || 
        _userProfile!['nom'] == null || 
        _userProfile!['nom'].toString().isEmpty) {
      await _applyFallbackProfile();
    }
    
    // Fetch notifications + RH data in parallel
    await Future.wait([
      fetchNotificationsCount(),
      fetchAccounts(),
      fetchPayrolls(),
      fetchCredits(),
      fetchMyRequests(),
    ]);

    // Start background polling for silent updates
    _startPolling();
  }

  void _startPolling() {
    _pollingTimer?.cancel();
    _pollingTimer = Timer.periodic(const Duration(seconds: 15), (_) {
      _silentRefresh();
    });
  }

  Future<void> _silentRefresh() async {
    try {
      // ✅ Refresh avances + congés for activity feed
      await fetchMyRequests();
      
      // Refresh user profile
      final meRes = await AuthApiService.getMe();
      if (meRes.isSuccess && meRes.data != null) {
        if (_userProfile != null) {
          final merged = Map<String, dynamic>.from(_userProfile!);
          meRes.data!.forEach((k, v) {
            if (v != null) merged[k] = v;
          });
          _userProfile = merged;
          await AuthApiService.saveProfile(jsonEncode(_userProfile));
        }
      }
      notifyListeners();
    } catch (e) {
      // ignore
    }
  }

  Future<void> fetchAccounts() async {
    try {
      final res = await AuthApiService.getMyAccounts();
      if (res.isSuccess && res.data != null && res.data!.isNotEmpty) {
        _compteSolde = (res.data!.first['solde'] as num?)?.toDouble() ?? 0.0;
        notifyListeners();
      } else {
        // Fallback: use compteSolde from employee profile
        _compteSolde = (_userProfile?['compteSolde'] as num?)?.toDouble() ?? 0.0;
        notifyListeners();
      }
    } catch (e) {
      debugPrint('Erreur fetchAccounts: $e');
      // Fallback from profile
      _compteSolde = (_userProfile?['compteSolde'] as num?)?.toDouble() ?? 0.0;
      notifyListeners();
    }
  }

  Future<void> fetchNotificationsCount() async {
    final res = await AuthApiService.getUnreadCount();
    if (res.isSuccess && res.data != null) {
      _unreadNotifs = res.data!;
      notifyListeners();
    }
  }

  Future<void> fetchPayrolls() async {
    try {
      final res = await AuthApiService.getMyPayrolls();
      if (res.isSuccess && res.data != null) {
        _payrolls = res.data!;
        notifyListeners();
      }
    } catch (e) {
      debugPrint('Erreur fetchPayrolls: $e');
    }
  }

  Future<void> fetchCredits() async {
    try {
      final res = await AuthApiService.getMyCredits();
      if (res.isSuccess && res.data != null) {
        _credits = res.data!;
        notifyListeners();
      }
    } catch (e) {
      debugPrint('Erreur fetchCredits: $e');
    }
  }

  Future<void> fetchMyRequests() async {
    try {
      // ✅ Fetch avances, congés, AND primes to show real-time activity
      final avancesRes = await AuthApiService.getMyAvances();
      final congesRes = await AuthApiService.getMyConges();
      final primesRes = await AuthApiService.getMyPrimes();
      
      List<dynamic> combined = [];
      
      // Add avances with AVANCE type
      if (avancesRes.isSuccess && avancesRes.data != null) {
        combined.addAll(avancesRes.data!.map((a) => {
          '_id': a['_id'],
          'type': 'AVANCE',
          'status': a['statut'] ?? 'EN_ATTENTE', // ✅ Avances backend uses 'statut' field
          'createdAt': a['dateCreation'] ?? a['createdAt'] ?? DateTime.now().toIso8601String(),
          'payload': {
            'motif': a['type'] ?? 'Avance Salaire',
            'amount': a['montant'],
          },
        }).toList());
      }
      
      // Add congés with CONGE type
      if (congesRes.isSuccess && congesRes.data != null) {
        combined.addAll(congesRes.data!.map((c) => {
          '_id': c['_id'],
          'type': 'CONGE',
          'status': c['status'] ?? 'EN_ATTENTE', // ✅ Congés backend uses 'status' field
          'createdAt': c['dateCreation'] ?? c['createdAt'] ?? DateTime.now().toIso8601String(),
          'payload': {
            'motif': c['motif'] ?? 'Congé ${c['type'] ?? 'REPOS'}',
            'days': c['dureeDays'],
            'type': c['type'],
          },
        }).toList());
      }
      
      // Add primes with PRIME type
      if (primesRes.isSuccess && primesRes.data != null) {
        combined.addAll(primesRes.data!.map((p) => {
          '_id': p['_id'],
          'type': 'PRIME',
          'status': p['status'] == 'PENDING' ? 'EN_ATTENTE' : 
                   (p['status'] == 'APPROVED' ? 'APPROUVE' : 'REFUSE'),
          'createdAt': p['dateCreation'] ?? p['createdAt'] ?? DateTime.now().toIso8601String(),
          'payload': {
            'motif': p['type'] == 'AID' || p['type'] == 'PRIME_AID' ? 'Prime Aïd' : 'Prime Rendement',
            'amount': p['montant'],
          },
        }).toList());
      }
      
      // Add absences with ABSENCE type
      final absencesRes = await AuthApiService.getMyAbsences();
      if (absencesRes.isSuccess && absencesRes.data != null) {
        combined.addAll(absencesRes.data!.map((a) => {
          '_id': a['_id'],
          'type': 'ABSENCE',
          'status': a['status'] ?? 'EN_ATTENTE',
          'createdAt': a['createdAt'] ?? DateTime.now().toIso8601String(),
          'payload': {
            'motif': a['motif'] ?? 'Absence',
            'hours': a['nombreHeures'],
            'type': a['type'],
          },
        }).toList());
      }
      
      // Sort by date (most recent first)
      combined.sort((a, b) {
        try {
          final dateA = DateTime.parse(a['createdAt'] as String? ?? '');
          final dateB = DateTime.parse(b['createdAt'] as String? ?? '');
          return dateB.compareTo(dateA);
        } catch (_) {
          return 0;
        }
      });
      
      _myRequests = combined;
      _rhDataLoaded = true;
      notifyListeners();
    } catch (e) {
      debugPrint('Erreur fetchMyRequests: $e');
      _rhDataLoaded = true;
      notifyListeners();
    }
  }

  Future<void> fetchAbsences() async {
    try {
      final myAbsencesRes = await AuthApiService.getMyAbsences();
      final pendingAbsencesRes = await AuthApiService.getPendingAbsencesForManager();
      
      if (myAbsencesRes.isSuccess && myAbsencesRes.data != null) {
        _myAbsences = myAbsencesRes.data!;
      }
      if (pendingAbsencesRes.isSuccess && pendingAbsencesRes.data != null) {
        _pendingAbsences = pendingAbsencesRes.data!;
      }
      _absenceDataLoaded = true;
      notifyListeners();
    } catch (e) {
      debugPrint('Erreur fetchAbsences: $e');
      _absenceDataLoaded = true;
      notifyListeners();
    }
  }

  Future<void> fetchInvestments() async {
    try {
      final res = await AuthApiService.getInvestments();
      if (res.isSuccess && res.data != null) {
        _investments = res.data!;
        notifyListeners();
      }
    } catch (e) {
      debugPrint('Erreur fetchInvestments: $e');
    }
  }

  Future<void> fetchBudgets() async {
    try {
      final res = await AuthApiService.getBudgets();
      if (res.isSuccess && res.data != null) {
        _budgets = res.data!;
        notifyListeners();
      }
    } catch (e) {
      debugPrint('Erreur fetchBudgets: $e');
    }
  }

  Future<void> fetchQrPayments() async {
    try {
      final res = await AuthApiService.getQrPayments();
      if (res.isSuccess && res.data != null) {
        _qrPayments = res.data!;
        notifyListeners();
      }
    } catch (e) {
      debugPrint('Erreur fetchQrPayments: $e');
    }
  }

  Future<void> fetchBills() async {
    try {
      final res = await AuthApiService.getBills();
      if (res.isSuccess && res.data != null) {
        _bills = res.data!;
        notifyListeners();
      }
    } catch (e) {
      debugPrint('Erreur fetchBills: $e');
    }
  }

  Future<void> fetchRecharges() async {
    try {
      final res = await AuthApiService.getRecharges();
      if (res.isSuccess && res.data != null) {
        _recharges = res.data!;
        notifyListeners();
      }
    } catch (e) {
      debugPrint('Erreur fetchRecharges: $e');
    }
  }

  Future<void> fetchConversations() async {
    try {
      final res = await AuthApiService.getConversations();
      if (res.isSuccess && res.data != null) {
        _conversations = res.data!;
        notifyListeners();
      }
    } catch (e) {
      debugPrint('Erreur fetchConversations: $e');
    }
  }

  Future<void> fetchMessages(String conversationId) async {
    try {
      final res = await AuthApiService.getMessages(conversationId);
      if (res.isSuccess && res.data != null) {
        _messages = res.data!;
        notifyListeners();
      }
    } catch (e) {
      debugPrint('Erreur fetchMessages: $e');
    }
  }

  Future<void> _loadCachedProfile() async {
    try {
      final cached = await AuthApiService.getProfile();
      if (cached != null) {
        _userProfile = jsonDecode(cached) as Map<String, dynamic>;
        notifyListeners();
      }
    } catch (e) {
      debugPrint('Erreur cache profile: $e');
    }
  }

  Future<void> _applyFallbackProfile() async {
    final matricule = await AuthApiService.getMatricule();
    _userProfile = {
      'nom': 'Ouertani',
      'prenom': 'Yassine',
      'matricule': matricule ?? 'EMP001',
      'poste': 'Collaborateur STB',
      'departement': 'Direction Générale',
      'agence': 'Siège Social',
      'email': 'employee@stb.com.tn',
      'soldeConges': 90,
      'creditsEnCours': 0,
      'prime': 0,
    };
    notifyListeners();
  }

  /// Called right after login with the employee object from the login response
  Future<void> setProfileFromLogin(Map<String, dynamic> employeeData) async {
    _userProfile = employeeData;
    await AuthApiService.saveProfile(jsonEncode(employeeData));
    notifyListeners();
  }

  void clearProfile() {
    _userProfile = null;
    AuthApiService.clearProfile();
    notifyListeners();
  }

  void toggleTheme() {
    _themeMode = _themeMode == ThemeMode.dark ? ThemeMode.light : ThemeMode.dark;
    notifyListeners();
    SharedPreferences.getInstance().then((prefs) {
      prefs.setString('app_theme', _themeMode == ThemeMode.dark ? 'dark' : 'light');
    });
  }

  void setLanguage(String lang) {
    _currentLanguage = lang;
    notifyListeners();
    SharedPreferences.getInstance().then((prefs) {
      prefs.setString('app_language', lang);
    });
  }

  Future<void> _loadSettings() async {
    try {
      final prefs = await SharedPreferences.getInstance();
      final savedTheme = prefs.getString('app_theme');
      final savedLang = prefs.getString('app_language');
      if (savedTheme != null) {
        _themeMode = savedTheme == 'dark' ? ThemeMode.dark : ThemeMode.light;
      }
      if (savedLang != null) {
        _currentLanguage = savedLang;
      }
      notifyListeners();
    } catch (_) {}
  }


  final Map<String, Map<String, String>> _dict = {
    'en': {
      'good_morning': 'Good Morning,',
      'good_evening': 'Good Evening,',
      'total_balance': 'Total Balance',
      'add_money': 'Add Money',
      'transfer': 'Transfer',
      'pay_qr': 'Scan QR',
      'recharge': 'Recharge',
      'pay_bills': 'Bills',
      'recent_transactions': 'Transactions',
      'more': 'See all',
      'home': 'Home',
      'cards': 'Cards',
      'invest': 'Invest',
      'profile': 'Profile',
      'copilot_greeting': 'Hello Yassine! 👋\nI\'m your STB Copilot. I can analyze your spending, suggest savings, and help you reach your financial goals.',
      'analytics': 'Analytics',
      'goals': 'Goals',
      'rewards': 'Rewards',
      'login_title': 'STB RH DIGI',
      'client_space': 'EMPLOYEE PORTAL',
      'username': 'Matricule / ID',
      'password': 'Password',
      'forgot_password': 'Forgot password?',
      'sign_in': 'SIGN IN',
      'or_biometric': 'OR SIGN IN WITH BIOMETRICS / FACE ID',
      'explore_guest': 'Quick HR Access',
      'biometric_validation': 'Biometric Verification...',
      'place_finger': 'Place your finger on the sensor',
      'explore_title': 'Explore STB',
      'explore_subtitle': 'Discover the app without an account.\nChoose your profile to continue.',
      'particular': 'Individual',
      'particular_desc': 'Accounts, transfers, personal cards',
      'company': 'Corporate',
      'company_desc': 'Business management, cash flows',
      'demo_mode': 'Demonstration Mode — simulated data',
    },
    'fr': {
      'good_morning': 'Bonjour,',
      'good_evening': 'Bonsoir,',
      'total_balance': 'Solde Total',
      'add_money': 'Alimenter',
      'transfer': 'Virement',
      'pay_qr': 'Scanner QR',
      'recharge': 'Recharge',
      'pay_bills': 'Factures',
      'recent_transactions': 'Transactions',
      'more': 'Voir tout',
      'home': 'Accueil',
      'cards': 'Cartes',
      'invest': 'Investir',
      'profile': 'Profil',
      'copilot_greeting': 'Salut Yassine! 👋\nJe suis votre copilote STB. Je peux analyser vos dépenses et vous aider à atteindre vos objectifs.',
      'analytics': 'Statistiques',
      'goals': 'Objectifs',
      'rewards': 'Fidélité',
      'login_title': 'STB RH DIGI',
      'client_space': 'ESPACE COLLABORATEUR',
      'username': 'Matricule',
      'password': 'Mot de passe',
      'forgot_password': 'Mot de passe oublié?',
      'sign_in': 'SE CONNECTER',
      'or_biometric': 'OU SE CONNECTER PAR EMPREINTE / FACE ID',
      'explore_guest': 'Accès Rapide RH',
      'biometric_validation': 'Validation Biométrique...',
      'place_finger': 'Posez votre doigt sur le capteur',
      'explore_title': 'Explorer STB',
      'explore_subtitle': 'Découvrez l\'application sans compte.\nChoisissez votre profil pour continuer.',
      'particular': 'Particulier',
      'particular_desc': 'Comptes, virements, cartes personnelles',
      'company': 'Entreprise',
      'company_desc': 'Gestion d\'entreprise, flux de trésorerie',
      'demo_mode': 'Mode démonstration — données fictives',
    },
    'ar': {
      'good_morning': 'صباح الخير،',
      'good_evening': 'مساء الخير،',
      'total_balance': 'الرصيد الجملي',
      'add_money': 'شحن الرصيد',
      'transfer': 'تحويل',
      'pay_qr': 'مسح QR',
      'recharge': 'شحن هاتف',
      'pay_bills': 'فواتير',
      'recent_transactions': 'آخر العمليات',
      'more': 'عرض الكل',
      'home': 'الرئيسية',
      'cards': 'بطاقاتي',
      'invest': 'إستثمار',
      'profile': 'حسابي',
      'copilot_greeting': 'عسلامة ياسين! 👋\nأنا المساعد المالي متاعك. نجم نحلل مصاريفك وتعاونك توصل لأهدافك.',
      'analytics': 'مصاريفي',
      'goals': 'أهدافي',
      'rewards': 'نقاطي',
      'login_title': 'STB RH DIGI',
      'client_space': 'فضاء المتعاونين',
      'username': 'المعرف / Matricule',
      'password': 'كلمة المرور',
      'forgot_password': 'نسيت كلمة المرور؟',
      'sign_in': 'تسجيل الدخول',
      'or_biometric': 'أو تسجيل الدخول بالبصمة / Face ID',
      'explore_guest': 'دخول سريع للموارد البشرية',
      'biometric_validation': 'التحقق البيومتري...',
      'place_finger': 'ضع إصبعك على المستشعر',
      'explore_title': 'استكشف التطبيق',
      'explore_subtitle': 'اكتشف التطبيق بدون حساب.\nاختر نوع الحساب للمتابعة.',
      'particular': 'حساب خاص',
      'particular_desc': 'حسابات، تحويلات، بطاقات شخصية',
      'company': 'حساب شركة',
      'company_desc': 'حساب شركة، تدفقات مالية',
      'demo_mode': 'وضع تجريبي — بيانات افتراضية',
    },
  };

  String translate(String key) => _dict[_currentLanguage]?[key] ?? key;

  Future<void> logout() async {
    _pollingTimer?.cancel();
    _pollingTimer = null;
    await AuthApiService.logout();
    _userProfile = null;
    _payrolls = [];
    _credits = [];
    _myRequests = [];
    _investments = [];
    _budgets = [];
    _qrPayments = [];
    _bills = [];
    _recharges = [];
    _conversations = [];
    _messages = [];
    _rhDataLoaded = false;
    _unreadNotifs = 0;
    notifyListeners();
  }

  void handleSessionExpired(BuildContext context) {
    logout().then((_) {
      Navigator.of(context).pushAndRemoveUntil(
        PageRouteBuilder(
          pageBuilder: (_, __, ___) => const LoginScreen(),
          transitionDuration: const Duration(milliseconds: 300),
          transitionsBuilder: (_, a, __, c) => FadeTransition(opacity: a, child: c),
        ),
        (route) => false,
      );
    });
  }
}
