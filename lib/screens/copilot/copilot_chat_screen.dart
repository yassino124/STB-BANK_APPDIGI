import 'dart:convert';
import 'dart:math';
import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_animate/flutter_animate.dart';
import 'package:flutter_tts/flutter_tts.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:speech_to_text/speech_to_text.dart' as stt;
import 'package:speech_to_text/speech_recognition_result.dart';
import 'package:provider/provider.dart';
import '../../providers/app_provider.dart';
import '../../services/auth_api_service.dart';
import '../../services/pdf_report_service.dart';
import '../../screens/main_screen.dart';
import '../../screens/copilot/ai_predictions_screen.dart';
import '../../screens/rh/ai_leave_planner_screen.dart';
import '../../services/ai_api_service.dart';

class _C {
  static const navy     = Color(0xFF04111F);
  static const navyCard = Color(0xFF0D1F35);
  static const blue     = Color(0xFF2962FF);
  static const cyan     = Color(0xFF00B4FF);
  static const gold     = Color(0xFFF59E0B);
  static const emerald  = Color(0xFF10B981);
  static const rose     = Color(0xFFEF4444);
  static const violet   = Color(0xFF8B5CF6);
}

class CopilotChatScreen extends StatefulWidget {
  const CopilotChatScreen({super.key});
  @override
  State<CopilotChatScreen> createState() => _CopilotChatScreenState();
}

class _CopilotChatScreenState extends State<CopilotChatScreen>
    with TickerProviderStateMixin {

  final _ctrl      = TextEditingController();
  final _scrollCtrl = ScrollController();
  final _tts       = FlutterTts();
  late stt.SpeechToText _stt;

  bool    _isTyping    = false;
  bool    _isListening = false;
  bool    _sttReady    = false;
  String? _speakingId;

  late AnimationController _orbCtrl;
  late AnimationController _waveCtrl;
  late AnimationController _pulseCtrl;

  // Loan simulator state
  double _loanAmount   = 10000;
  double _loanYears    = 5;
  double _loanRate     = 6.5;

  // Currency converter state
  final _currencyCtrl = TextEditingController(text: '100');
  String _fromCcy = 'EUR';
  String _toCcy   = 'TND';

  static const Map<String, double> _rates = {
    'EUR': 3.340, 'USD': 3.085, 'GBP': 3.925, 'SAR': 0.822, 'CHF': 3.434,
    'TND': 1.0,
  };

  final List<Map<String, dynamic>> _messages = [];

  final List<String> _quickPrompts = [
    '🏥 Score santé financière',
    '🏦 Simulateur crédit',
    '💱 Convertir devise',
    '🌴 Demande de congé',
    '💵 Avance salaire',
    '💸 Virement vocal',
    '📅 Planifier congés IA',
    '📈 Prédictions financières',
    '📄 Rapport mensuel PDF',
  ];

  @override
  void initState() {
    super.initState();
    _stt = stt.SpeechToText();
    _initTts();
    _initStt();
    _orbCtrl   = AnimationController(vsync: this, duration: const Duration(seconds: 3))..repeat(reverse: true);
    _waveCtrl  = AnimationController(vsync: this, duration: const Duration(milliseconds: 900))..repeat(reverse: true);
    _pulseCtrl = AnimationController(vsync: this, duration: const Duration(milliseconds: 1400))..repeat(reverse: true);

    WidgetsBinding.instance.addPostFrameCallback((_) {
      final p = Provider.of<AppProvider>(context, listen: false);
      _addWelcome(p);
    });
  }

  void _addWelcome(AppProvider p) {
    final prenom = p.userProfile?['prenom'] ?? 'Collaborateur';
    final solde = p.compteSolde;
    final conges = p.soldeConges;
    setState(() {
      _messages.add({
        'id': 'msg_0',
        'isUser': false,
        'cardType': 'text',
        'text': '**STB Copilot AI** 🏦✨\n\nBonjour **$prenom** ! Je suis votre assistant financier & RH personnel.\n\n'
            '• 💰 Solde : **${(solde > 0 ? solde : p.salaireBase).toStringAsFixed(3)} TND**\n'
            '• 🌴 Congés : **$conges jours** disponibles\n\n'
            'Que puis-je faire pour vous aujourd\'hui ? Choisissez une action ou tapez votre question 🎙️',
        'time': 'Maintenant',
      });
    });
  }

  Future<void> _initTts() async {
    try {
      await _tts.setLanguage('fr-FR');
      await _tts.setSpeechRate(0.48);
      await _tts.setVolume(1.0);
      await _tts.setPitch(1.05);
      _tts.setCompletionHandler(() { if (mounted) setState(() => _speakingId = null); });
    } catch (e) { debugPrint('TTS: $e'); }
  }

  Future<void> _initStt() async {
    try {
      _sttReady = await _stt.initialize(
        onStatus: (s) { if ((s == 'done' || s == 'notListening') && mounted) setState(() => _isListening = false); },
        onError:  (e) { debugPrint('STT: $e'); if (mounted) setState(() => _isListening = false); },
      );
    } catch (e) { debugPrint('STT init: $e'); }
  }

  @override
  void dispose() {
    _tts.stop(); _stt.stop();
    _ctrl.dispose(); _scrollCtrl.dispose(); _currencyCtrl.dispose();
    _orbCtrl.dispose(); _waveCtrl.dispose(); _pulseCtrl.dispose();
    super.dispose();
  }

  void _scrollToBottom() {
    WidgetsBinding.instance.addPostFrameCallback((_) {
      if (_scrollCtrl.hasClients) {
        _scrollCtrl.animateTo(_scrollCtrl.position.maxScrollExtent,
            duration: const Duration(milliseconds: 350), curve: Curves.easeOut);
      }
    });
  }

  Future<void> _speak(String msgId, String text) async {
    try {
      if (_speakingId == msgId) { await _tts.stop(); if (mounted) setState(() => _speakingId = null); return; }
      await _tts.stop();
      final clean = text.replaceAll(RegExp(r'[*_#~`•]'), '').replaceAll('TND', 'Dinars').replaceAll('STB', 'S T B');
      if (mounted) setState(() => _speakingId = msgId);
      await _tts.speak(clean);
    } catch (e) { debugPrint('TTS speak: $e'); }
  }

  // ── Routing — detect rich card intent ────────────────────────────────────────
  Future<void> _sendMessage(String text) async {
    if (text.trim().isEmpty) return;
    final q = text.trim();
    _ctrl.clear();
    final p = Provider.of<AppProvider>(context, listen: false);
    final uid = 'u_${DateTime.now().millisecondsSinceEpoch}';
    setState(() {
      _messages.add({'id': uid, 'isUser': true, 'cardType': 'text', 'text': q, 'time': 'À l\'instant'});
      _isTyping = true;
    });
    _scrollToBottom();

    await Future.delayed(const Duration(milliseconds: 700));

    final ql = q.toLowerCase();
    final rid = 'r_${DateTime.now().millisecondsSinceEpoch}';

    // Rich card routing
    if (_isHealthQuery(ql)) {
      _addHealthScoreCard(rid, p);
    } else if (_isLoanQuery(ql)) {
      _addLoanSimulatorCard(rid, p);
    } else if (_isCurrencyQuery(ql)) {
      _addCurrencyCard(rid);
    } else if (_isSpendingQuery(ql)) {
      _addSpendingCard(rid, p);
    } else if (_isTransferAction(ql)) {
      _addTransferActionCard(rid, q, p);
    } else if (_isLeaveAction(ql)) {
      _addLeaveActionCard(rid, q, p);
    } else if (_isAvanceAction(ql)) {
      _addAvanceActionCard(rid, p);
    } else if (_isLeavePlannerQuery(ql)) {
      _openAILeavePlanner(p);
    } else if (_isPredictionsQuery(ql)) {
      _openAIPredictions();
    } else if (_isMonthlyReportQuery(ql)) {
      _generateMonthlyReport(rid, p);
    } else if (_isNavQuery(ql)) {
      _handleNavigation(ql, rid);
    } else {
      // Text response
      String reply = '';
      try {
        final ctx = _buildCtx(p);
        final res = await AuthApiService.sendCopilotMessage(q, userContext: ctx);
        if (res.isSuccess && res.data != null && res.data!.isNotEmpty) reply = res.data!;
        else reply = await AiApiService.generateResponse('STB Copilot', q);
      } catch (_) {}
      if (reply.isEmpty || reply.contains('hors ligne')) reply = _textFallback(q, p);
      if (mounted) {
        setState(() {
          _messages.add({'id': rid, 'isUser': false, 'cardType': 'text', 'text': reply, 'time': 'À l\'instant'});
          _isTyping = false;
        });
        _scrollToBottom();
        _speak(rid, reply);
      }
    }
  }

  bool _isHealthQuery(String q)      => q.contains('santé') || q.contains('score') || q.contains('sante') || q.contains('financier') || q.contains('bilan');
  bool _isLoanQuery(String q)        => q.contains('simulat') || q.contains('crédit') || q.contains('credit') || q.contains('prêt') || q.contains('pret') || q.contains('emprunt');
  bool _isCurrencyQuery(String q)    => q.contains('convertir') || q.contains('devise') || q.contains('change') || q.contains('euro') || q.contains('dollar') || q.contains('eur') || q.contains('usd');
  bool _isSpendingQuery(String q)    => q.contains('dépense') || q.contains('depense') || q.contains('budget') || q.contains('analys') || q.contains('répartit');
  bool _isLeaveAction(String q)      => (q.contains('demand') || q.contains('prend') || q.contains('poser') || q.contains('pose') || q.contains('veux') || q.contains('amel') || q.contains('faire') || q.contains('creer') || q.contains('créer')) && (q.contains('cong') || q.contains('vacance') || q.contains('repos'));
  bool _isAvanceAction(String q)     => (q.contains('demand') || q.contains('veux') || q.contains('amel') || q.contains('faire') || q.contains('creer') || q.contains('créer')) && (q.contains('avance') || q.contains('acompte'));
  bool _isTransferAction(String q)   => q.contains('virement') || q.contains('vire') || q.contains('envoie') || q.contains('transfert') || q.contains('vocal') && q.contains('vir');
  bool _isLeavePlannerQuery(String q) => q.contains('planif') || q.contains('planner') || q.contains('congés ia') || q.contains('conges ia') || q.contains('ai leave') || (q.contains('ia') && q.contains('cong'));
  bool _isPredictionsQuery(String q)  => q.contains('prédict') || q.contains('predict') || q.contains('prévision') || q.contains('prevision') || q.contains('financ') && q.contains('futur');
  bool _isMonthlyReportQuery(String q) => q.contains('rapport') || q.contains('mensuel') || q.contains('pdf') || q.contains('bilan mensuel') || q.contains('résumé mensuel');
  bool _isNavQuery(String q)         => q.contains('nav') || q.contains('aller') || q.contains('ouvrir') || q.contains('ouvre') || q.contains('affich') || q.contains('go to') || q.contains('nheb') || q.contains('navigate');

  void _addHealthScoreCard(String id, AppProvider p) {
    if (!mounted) return;
    setState(() {
      _isTyping = false;
      _messages.add({'id': id, 'isUser': false, 'cardType': 'health_score', 'time': 'À l\'instant', 'provider': p});
    });
    _scrollToBottom();
  }

  void _addLoanSimulatorCard(String id, AppProvider p) {
    if (!mounted) return;
    setState(() {
      _isTyping = false;
      _messages.add({'id': id, 'isUser': false, 'cardType': 'loan_simulator', 'time': 'À l\'instant'});
    });
    _scrollToBottom();
  }

  void _addCurrencyCard(String id) {
    if (!mounted) return;
    setState(() {
      _isTyping = false;
      _messages.add({'id': id, 'isUser': false, 'cardType': 'currency', 'time': 'À l\'instant'});
    });
    _scrollToBottom();
  }

  void _addSpendingCard(String id, AppProvider p) {
    if (!mounted) return;
    setState(() {
      _isTyping = false;
      _messages.add({'id': id, 'isUser': false, 'cardType': 'spending', 'time': 'À l\'instant', 'provider': p});
    });
    _scrollToBottom();
  }

  // ── Leave action card ─────────────────────────────────────────────────────
  void _addLeaveActionCard(String id, String originalText, AppProvider p) {
    if (!mounted) return;
    // Try to parse dates from text
    final parsed = _parseLeaveIntent(originalText, p);
    setState(() {
      _isTyping = false;
      _messages.add({
        'id': id, 'isUser': false, 'cardType': 'leave_action',
        'time': 'À l\'instant',
        'leaveData': parsed,
      });
    });
    _scrollToBottom();
    _speak(id, parsed['summary'] as String);
  }

  Map<String, dynamic> _parseLeaveIntent(String text, AppProvider p) {
    final ql = text.toLowerCase();
    final now = DateTime.now();

    // Detect duration (Xjours / X jours / X semaines)
    int days = 1;
    final dayMatch = RegExp(r'(\d+)\s*j(ours?)?').firstMatch(ql);
    final weekMatch = RegExp(r'(\d+)\s*s(emaines?)?').firstMatch(ql);
    if (dayMatch != null) days = int.tryParse(dayMatch.group(1)!) ?? 1;
    else if (weekMatch != null) days = (int.tryParse(weekMatch.group(1)!) ?? 1) * 5;

    // Detect month
    const months = {'janvier':1,'février':2,'fevrier':2,'mars':3,'avril':4,'mai':5,'juin':6,'juillet':7,'août':8,'aout':8,'septembre':9,'octobre':10,'novembre':11,'décembre':12,'decembre':12};
    int month = now.month;
    months.forEach((k, v) { if (ql.contains(k)) month = v; });

    // Detect start day
    int startDay = 1;
    final dayNumMatch = RegExp(r'(?:du|le|le\s+)(\d{1,2})(?:er|ème|eme)?\s').firstMatch(ql);
    if (dayNumMatch != null) startDay = int.tryParse(dayNumMatch.group(1)!) ?? 1;

    // Build dates
    int year = now.year;
    if (month < now.month) year++;
    final startDate = DateTime(year, month, startDay);
    final endDate = startDate.add(Duration(days: days - 1));

    final fmt = (DateTime d) => '${d.day.toString().padLeft(2,'0')}/${d.month.toString().padLeft(2,'0')}/${d.year}';
    final iso = (DateTime d) => '${d.year}-${d.month.toString().padLeft(2,'0')}-${d.day.toString().padLeft(2,'0')}';

    return {
      'days': days,
      'startDate': iso(startDate),
      'endDate': iso(endDate),
      'startFmt': fmt(startDate),
      'endFmt': fmt(endDate),
      'type': 'REPOS',
      'soldeConges': p.soldeConges,
      'summary': 'J\'ai détecté une demande de $days jours du ${fmt(startDate)} au ${fmt(endDate)}. Confirmez pour créer la demande.',
    };
  }

  // ── Avance action card ────────────────────────────────────────────────────
  void _addAvanceActionCard(String id, AppProvider p) {
    if (!mounted) return;
    final maxAvance = p.salaireBase * 1.5;
    final summary = 'Vous êtes éligible à une avance de jusqu\'à **${maxAvance.toStringAsFixed(3)} TND** (1.5× salaire). Confirmer la demande ?';
    setState(() {
      _isTyping = false;
      _messages.add({
        'id': id, 'isUser': false, 'cardType': 'avance_action',
        'time': 'À l\'instant',
        'maxAvance': maxAvance,
        'summary': summary,
      });
    });
    _scrollToBottom();
    _speak(id, 'Avance salaire disponible. Montant maximum: ${maxAvance.toStringAsFixed(0)} dinars. Confirmez-vous la demande ?');
  }

  // ── Navigation handler ────────────────────────────────────────────────────
  void _handleNavigation(String ql, String rid) {
    if (!mounted) return;
    setState(() => _isTyping = false);

    String dest = '';
    String reply = '';
    int tabIndex = -1;

    if (ql.contains('accueil') || ql.contains('home') || ql.contains('dashboard')) {
      dest = 'Accueil'; tabIndex = 0;
    } else if (ql.contains('rh') || ql.contains('congé') || ql.contains('conge') || ql.contains('ressource')) {
      dest = 'Espace RH'; tabIndex = 1;
    } else if (ql.contains('profil') || ql.contains('profile') || ql.contains('compte')) {
      dest = 'Mon Profil'; tabIndex = 4;
    } else if (ql.contains('copilot') || ql.contains('assistant') || ql.contains('chat')) {
      dest = 'Copilot AI'; tabIndex = 3;
    } else if (ql.contains('budget') || ql.contains('épargne') || ql.contains('epargne')) {
      dest = 'Budgets'; tabIndex = 5;
    }

    if (tabIndex >= 0) {
      reply = '🧭 Navigation vers **$dest**... Je vous y emmène !';
      setState(() => _messages.add({'id': rid, 'isUser': false, 'cardType': 'text', 'text': reply, 'time': 'À l\'instant'}));
      _scrollToBottom();
      _speak(rid, 'Navigation vers $dest');
      Future.delayed(const Duration(milliseconds: 1200), () {
        if (!mounted) return;
        if (Navigator.canPop(context)) Navigator.of(context).pop();
        MainScreenState.navigateGlobal(tabIndex);
      });
    } else {
      reply = '🧭 Dites "aller à l\'accueil", "aller au RH", "ouvrir le profil" ou "aller aux budgets" pour naviguer.';
      setState(() => _messages.add({'id': rid, 'isUser': false, 'cardType': 'text', 'text': reply, 'time': 'À l\'instant'}));
      _scrollToBottom();
    }
  }

  // ── Execute leave request ─────────────────────────────────────────────────
  Future<void> _executeLeaveRequest(Map<String, dynamic> leaveData) async {
    final rid = 'r_exec_${DateTime.now().millisecondsSinceEpoch}';
    setState(() => _messages.add({'id': rid, 'isUser': false, 'cardType': 'text',
        'text': '⏳ Création de la demande de congé en cours...', 'time': 'À l\'instant'}));
    _scrollToBottom();

    final res = await AuthApiService.createConge(
      type: leaveData['type'] as String,
      startDate: leaveData['startDate'] as String,
      endDate: leaveData['endDate'] as String,
      motif: 'Demande via STB Copilot AI',
    );

    final confirmId = 'r_done_${DateTime.now().millisecondsSinceEpoch}';
    if (res.isSuccess) {
      HapticFeedback.mediumImpact();
      final reply = '✅ **Demande créée avec succès !**\n\n📅 Du **${leaveData['startFmt']}** au **${leaveData['endFmt']}**\n🗓️ **${leaveData['days']} jours** de congé REPOS\n\nStatut : **En attente d\'approbation** ⏳\n\n_Vous recevrez une notification dès validation par votre RH._';
      setState(() { _messages.last = {'id': rid, 'isUser': false, 'cardType': 'text', 'text': reply, 'time': 'À l\'instant'}; });
      _speak(confirmId, 'Demande de congé créée avec succès. En attente d\'approbation.');
    } else {
      setState(() { _messages.last = {'id': rid, 'isUser': false, 'cardType': 'text',
          'text': '❌ Erreur : ${res.error ?? "Impossible de créer la demande"}', 'time': 'À l\'instant'}; });
    }
    _scrollToBottom();
  }

  // ── Execute avance request ────────────────────────────────────────────────
  Future<void> _executeAvanceRequest(double montant) async {
    final rid = 'r_avance_${DateTime.now().millisecondsSinceEpoch}';
    setState(() => _messages.add({'id': rid, 'isUser': false, 'cardType': 'text',
        'text': '⏳ Création de la demande d\'avance en cours...', 'time': 'À l\'instant'}));
    _scrollToBottom();

    final res = await AuthApiService.createAvance(
      type: 'SALAIRE',
      montant: montant,
      motif: 'Demande via STB Copilot AI',
    );

    if (res.isSuccess) {
      HapticFeedback.mediumImpact();
      final reply = '✅ **Avance demandée avec succès !**\n\n💵 Montant : **${montant.toStringAsFixed(3)} TND**\nType : **Avance Salaire**\n\nStatut : **En attente d\'approbation** ⏳\n\n_Versement dans 24-48h après approbation RH._';
      setState(() { _messages.last = {'id': rid, 'isUser': false, 'cardType': 'text', 'text': reply, 'time': 'À l\'instant'}; });
      _speak(rid, 'Avance salaire demandée avec succès.');
    } else {
      setState(() { _messages.last = {'id': rid, 'isUser': false, 'cardType': 'text',
          'text': '❌ Erreur : ${res.error ?? "Impossible de créer l\'avance"}', 'time': 'À l\'instant'}; });
    }
    _scrollToBottom();
  }

  void _addTransferActionCard(String rid, String query, AppProvider p) {
    if (!mounted) return;
    setState(() {
      _isTyping = false;
      _messages.add({
        'id': rid, 'isUser': false, 'cardType': 'transfer_action',
        'time': 'À l\'instant', 'provider': p, 'initialQuery': query
      });
    });
    _scrollToBottom();
  }

  void _openAILeavePlanner(AppProvider p) {
    if (!mounted) return;
    Navigator.push(context, MaterialPageRoute(
      builder: (context) => AILeavePlannerScreen(remainingDays: p.soldeConges),
    ));
  }

  void _openAIPredictions() {
    if (!mounted) return;
    Navigator.push(context, MaterialPageRoute(
      builder: (context) => const AIPredictionsScreen(),
    ));
  }

  Future<void> _generateMonthlyReport(String rid, AppProvider p) async {
    if (!mounted) return;
    setState(() {
      _isTyping = true;
      _messages.add({'id': rid, 'isUser': false, 'cardType': 'text', 'text': '📄 Génération de votre rapport mensuel en cours...', 'time': 'À l\'instant'});
    });
    _scrollToBottom();
    
    try {
      final u = p.userProfile ?? {};
      final res = await AuthApiService.getMyTransactions();
      final transactions = res.isSuccess ? (res.data ?? []) : [];
      
      final pdfPath = await PdfReportService.generateMonthlyReport(
        prenom: u['prenom']?.toString() ?? 'Collaborateur',
        nom: u['nom']?.toString() ?? '',
        poste: u['poste']?.toString() ?? 'Employé',
        solde: p.compteSolde,
        salaireBase: p.salaireBase,
        soldeConges: p.soldeConges,
        prime: p.prime,
        creditsEnCours: p.creditsEnCours,
        transactions: transactions,
      );

      if (!mounted) return;
      setState(() {
        _isTyping = false;
        _messages.last = {
          'id': rid, 'isUser': false, 'cardType': 'pdf_report',
          'pdfPath': pdfPath, 'time': 'À l\'instant', 'provider': p
        };
      });
      _scrollToBottom();
      _speak(rid, 'Votre rapport financier mensuel est prêt. Vous pouvez l\'ouvrir.');
    } catch (e) {
      if (!mounted) return;
      setState(() {
        _isTyping = false;
        _messages.last = {'id': rid, 'isUser': false, 'cardType': 'text', 'text': '❌ Erreur lors de la génération du rapport : $e', 'time': 'À l\'instant'};
      });
      _scrollToBottom();
    }
  }

  Future<void> _executeTransferRequest(String toMatricule, double montant, String motif) async {
    final rid = 'r_trans_${DateTime.now().millisecondsSinceEpoch}';
    setState(() => _messages.add({'id': rid, 'isUser': false, 'cardType': 'text',
        'text': '⏳ Envoi du virement en cours...', 'time': 'À l\'instant'}));
    _scrollToBottom();

    final res = await AuthApiService.createTransfer(
      toMatricule: toMatricule,
      montant: montant,
      motif: motif,
    );

    if (res.isSuccess) {
      HapticFeedback.mediumImpact();
      final reply = '✅ **Virement effectué avec succès !**\n\n💵 Montant : **${montant.toStringAsFixed(3)} TND**\nVers : **$toMatricule**\n\n_Les fonds seront disponibles immédiatement sur le compte de votre collègue._';
      setState(() { _messages.last = {'id': rid, 'isUser': false, 'cardType': 'text', 'text': reply, 'time': 'À l\'instant'}; });
      _speak(rid, 'Virement effectué avec succès.');
    } else {
      setState(() { _messages.last = {'id': rid, 'isUser': false, 'cardType': 'text',
          'text': '❌ Erreur : ${res.error ?? "Impossible d\'effectuer le virement"}', 'time': 'À l\'instant'}; });
    }
    _scrollToBottom();
  }

  Map<String, dynamic> _buildCtx(AppProvider p) {
    final u = p.userProfile ?? {};
    return {
      'nom': u['nom'] ?? '', 'prenom': u['prenom'] ?? '',
      'poste': u['poste'] ?? '', 'soldeConges': p.soldeConges,
      'salaireBase': p.salaireBase, 'compteSolde': p.compteSolde,
      'creditsEnCours': p.creditsEnCours, 'prime': p.prime,
    };
  }

  String _textFallback(String q, AppProvider p) {
    final ql = q.toLowerCase();
    final u = p.userProfile ?? {};
    final prenom = u['prenom'] ?? 'Collaborateur';
    final conges = p.soldeConges;
    final salaire = p.salaireBase;
    final solde = p.compteSolde;
    final prime = p.prime;
    final net = (salaire * 0.75).toStringAsFixed(3);
    final maxAvance = (salaire * 1.5).toStringAsFixed(3);

    if (ql.contains('cong') || ql.contains('vacance') || ql.contains('repos')) {
      final weeks = (conges / 5).floor();
      return '🌴 **Vos Congés — $prenom** :\n\nSolde disponible : **$conges jours** (~$weeks semaines)\n\n**Types :** Annuel · Maladie · Mariage · Maternité\n\n💡 _Demandez via **Espace RH → Congés**_';
    }
    if (ql.contains('salaire') || ql.contains('fiche') || ql.contains('paie') || ql.contains('net') || ql.contains('brut')) {
      return '💼 **Rémunération — $prenom** :\n\n• Brut : **${salaire.toStringAsFixed(3)} TND**\n• Net estimé : **$net TND**\n• Prime : **${prime > 0 ? prime.toStringAsFixed(3) : "—"} TND**\n\n📄 _Fiches de paie → **Espace RH → Documents**_';
    }
    if ((ql.contains('solde') && !ql.contains('cong')) || ql.contains('compte') || ql.contains('argent')) {
      return '💰 **Solde Compte — $prenom** :\n\nSolde disponible : **${solde.toStringAsFixed(3)} TND**\n\n💡 _Virement & paiements → **Accueil**_';
    }
    if (ql.contains('avance') || ql.contains('acompte')) {
      return '💵 **Avance Salaire — $prenom** :\n\nMax éligible : **$maxAvance TND** (1.5× salaire)\n\n1. Espace RH → Demandes\n2. "Avance Salaire"\n3. Approbation RH 24h → versement 48h';
    }
    if (ql.contains('prime') || ql.contains('bonus') || ql.contains('rendement') || ql.contains('aïd')) {
      return '⭐ **Primes — $prenom** :\n\n• Prime active : **${prime > 0 ? prime.toStringAsFixed(3) + " TND" : "Aucune"}**\n• Rendement (trim.) · Aïd (annuelle) · Objectifs\n\n💡 _Les primes sont gérées automatiquement par les RH_';
    }
    if (ql.contains('document') || ql.contains('attestation') || ql.contains('contrat')) {
      return '📄 **Documents RH — $prenom** :\n\n• Attestation de travail\n• Attestation de salaire\n• Fiches de paie PDF\n• Contrat de travail · CNSS\n\n📁 _Disponibles → **Espace RH → Documents**_';
    }
    if (ql.contains('ticket') || ql.contains('support') || ql.contains('problème') || ql.contains('réclamation')) {
      return '🎫 **Support STB** :\n\n1. Mes Tickets → Nouveau ticket\n2. Réclamation / Assistance / Feedback\n3. Suivi temps réel\n\n📞 _71 340 477_ · ✉️ _support@stb.com.tn_';
    }
    if (ql.contains('facture') || ql.contains('steg') || ql.contains('sonede') || ql.contains('recharge')) {
      return '📱 **Factures & Recharges** :\n\n💡 STEG · 💧 SONEDE · 🌐 Internet · 📱 Mobile\n\nPaiement sécurisé instantané\n📍 _Accueil → Payer_';
    }
    if (ql.contains('virement') || ql.contains('transfert') || ql.contains('carte') || ql.contains('qr')) {
      return '💳 **Virements & Paiements** :\n\n• STB → STB : instantané\n• Interbancaire : J+1\n• QR Code · International\n\nSolde : **${solde.toStringAsFixed(3)} TND**\n📍 _Accueil → Virement_';
    }
    if (ql.contains('épargne') || ql.contains('investiss') || ql.contains('dat') || ql.contains('placement')) {
      return '📈 **Épargne & Investissement** :\n\n• 💹 Compte Épargne STB Pro : 4.5%/an\n• 📊 DAT 12 mois : 5.2%\n• 🏦 SICAV STB Oblig\n• 💎 Assurance-vie (avantages fiscaux)\n\n_Consultez → **Investissements**_';
    }

    return '🏦 **STB Copilot — Bonjour $prenom !**\n\n**Finance :** Solde (${solde.toStringAsFixed(3)} TND) · Virement · Crédit · Devises · Épargne\n\n**RH :** Congés ($conges j) · Avance · Primes · Documents\n\n**Support :** Tickets · Factures · Recharges\n\n_Choisissez un bouton rapide ou posez votre question_ 🎙️';
  }

  // ── Build ────────────────────────────────────────────────────────────────────
  @override
  Widget build(BuildContext context) {
    final p   = Provider.of<AppProvider>(context);
    final dk  = p.themeMode == ThemeMode.dark;
    final u   = p.userProfile ?? {};
    final avatarUrl = u['avatar'] as String?;
    final initials = '${(u['prenom'] as String? ?? 'Y')[0]}${(u['nom'] as String? ?? 'O')[0]}'.toUpperCase();
    final bg  = dk ? _C.navy : const Color(0xFFF1F5F9);
    final cardBg = dk ? _C.navyCard : Colors.white;
    final fg  = dk ? Colors.white : const Color(0xFF0F172A);

    return Scaffold(
      backgroundColor: bg,
      appBar: _buildAppBar(dk, fg, p),
      body: Stack(children: [
        // Background gradient
        Positioned.fill(child: Container(decoration: BoxDecoration(
          gradient: LinearGradient(begin: Alignment.topLeft, end: Alignment.bottomRight,
            colors: dk
              ? [const Color(0xFF020617), const Color(0xFF0A1930), const Color(0xFF020617)]
              : [const Color(0xFFF8FAFC), const Color(0xFFE2E8F0), const Color(0xFFF8FAFC)]),
        ))),
        // Watermark
        Positioned(right: -60, bottom: 130,
          child: Icon(Icons.account_balance_rounded, size: 280,
            color: dk ? Colors.white.withValues(alpha: 0.02) : _C.blue.withValues(alpha: 0.03))),

        Column(children: [
          // Quick prompts
          SizedBox(height: 48, child: ListView.separated(
            scrollDirection: Axis.horizontal,
            padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 5),
            physics: const BouncingScrollPhysics(),
            itemCount: _quickPrompts.length,
            separatorBuilder: (_, __) => const SizedBox(width: 8),
            itemBuilder: (_, i) => GestureDetector(
              onTap: () { HapticFeedback.selectionClick(); _sendMessage(_quickPrompts[i]); },
              child: Container(
                padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 8),
                decoration: BoxDecoration(
                  gradient: LinearGradient(colors: dk
                    ? [const Color(0xFF1E293B), const Color(0xFF0F172A)]
                    : [Colors.white, const Color(0xFFF8FAFC)]),
                  borderRadius: BorderRadius.circular(20),
                  border: Border.all(color: dk ? Colors.white12 : _C.blue.withValues(alpha: 0.2)),
                  boxShadow: [BoxShadow(color: Colors.black.withValues(alpha: 0.04), blurRadius: 4)],
                ),
                child: Text(_quickPrompts[i],
                  style: GoogleFonts.outfit(color: dk ? Colors.white : const Color(0xFF0D47A1), fontSize: 12, fontWeight: FontWeight.w700)),
              ),
            ),
          )),

          Divider(height: 1, color: dk ? Colors.white.withValues(alpha: 0.06) : Colors.black.withValues(alpha: 0.05)),

          // Messages
          Expanded(child: ListView.builder(
            controller: _scrollCtrl,
            padding: const EdgeInsets.fromLTRB(14, 16, 14, 8),
            physics: const BouncingScrollPhysics(),
            itemCount: _messages.length,
            itemBuilder: (ctx, i) => _buildMessage(_messages[i], dk, cardBg, fg, initials, avatarUrl, p),
          )),

          // Typing indicator
          if (_isTyping) Padding(
            padding: const EdgeInsets.fromLTRB(20, 0, 20, 8),
            child: Row(children: [
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 10),
                decoration: BoxDecoration(
                  color: cardBg, borderRadius: const BorderRadius.only(
                    topLeft: Radius.circular(18), topRight: Radius.circular(18), bottomRight: Radius.circular(18)),
                  border: Border.all(color: dk ? Colors.white12 : Colors.black.withValues(alpha: 0.05)),
                ),
                child: Row(mainAxisSize: MainAxisSize.min, children: [
                  _ThreeDotsAnimation(),
                  const SizedBox(width: 10),
                  Text('STB Copilot rédige...', style: GoogleFonts.inter(color: dk ? Colors.white54 : Colors.black45, fontSize: 12, fontStyle: FontStyle.italic)),
                ]),
              ),
            ]),
          ),

          // Input bar
          _buildInputBar(dk, fg),
        ]),
      ]),
    );
  }

  AppBar _buildAppBar(bool dk, Color fg, AppProvider p) {
    return AppBar(
      backgroundColor: Colors.transparent, elevation: 0,
      systemOverlayStyle: dk ? SystemUiOverlayStyle.light : SystemUiOverlayStyle.dark,
      leadingWidth: 52,
      leading: Padding(padding: const EdgeInsets.only(left: 12),
        child: GestureDetector(onTap: () => Navigator.pop(context),
          child: Container(width: 40, height: 40,
            decoration: BoxDecoration(color: dk ? Colors.white10 : Colors.black.withValues(alpha: 0.06), shape: BoxShape.circle),
            child: Icon(Icons.arrow_back_ios_new_rounded, color: fg, size: 16)))),
      title: Row(mainAxisSize: MainAxisSize.min, children: [
        AnimatedBuilder(animation: _pulseCtrl, builder: (_, __) => Container(
          padding: EdgeInsets.all(2 + _pulseCtrl.value),
          decoration: BoxDecoration(shape: BoxShape.circle,
            gradient: const LinearGradient(colors: [_C.blue, _C.cyan]),
            boxShadow: [BoxShadow(color: _C.blue.withValues(alpha: 0.4 + _pulseCtrl.value * 0.2), blurRadius: 14)]),
          child: const CircleAvatar(radius: 16, backgroundColor: Colors.transparent,
            child: Icon(Icons.account_balance_rounded, color: Colors.white, size: 17)))),
        const SizedBox(width: 10),
        Expanded(child: Column(crossAxisAlignment: CrossAxisAlignment.start, mainAxisSize: MainAxisSize.min, children: [
          Text('STB Copilot AI', overflow: TextOverflow.ellipsis,
            style: GoogleFonts.outfit(color: fg, fontSize: 15, fontWeight: FontWeight.w800)),
          Row(children: [
            Container(width: 6, height: 6, decoration: const BoxDecoration(color: _C.emerald, shape: BoxShape.circle)),
            const SizedBox(width: 5),
            Text('Assistant Financier · Actif', overflow: TextOverflow.ellipsis,
              style: GoogleFonts.inter(color: dk ? Colors.white60 : Colors.black54, fontSize: 10)),
          ]),
        ])),
      ]),
      actions: [
        GestureDetector(
          onTap: () => _openVoiceModal(context),
          child: Container(margin: const EdgeInsets.only(right: 14), width: 40, height: 40,
            decoration: BoxDecoration(gradient: const LinearGradient(colors: [_C.cyan, _C.blue]),
              shape: BoxShape.circle,
              boxShadow: [BoxShadow(color: _C.blue.withValues(alpha: 0.45), blurRadius: 10)]),
            child: const Icon(Icons.mic_rounded, color: Colors.white, size: 19))),
      ],
    );
  }

  Widget _buildInputBar(bool dk, Color fg) {
    return Container(
      margin: EdgeInsets.fromLTRB(14, 6, 14, MediaQuery.of(context).padding.bottom + 14),
      padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 6),
      decoration: BoxDecoration(
        color: dk ? _C.navyCard.withValues(alpha: 0.9) : Colors.white,
        borderRadius: BorderRadius.circular(32),
        border: Border.all(color: dk ? Colors.white12 : Colors.black.withValues(alpha: 0.06)),
        boxShadow: [BoxShadow(color: dk ? Colors.black45 : _C.blue.withValues(alpha: 0.08), blurRadius: 20, offset: const Offset(0, 8))],
      ),
      child: Row(children: [
        Expanded(child: TextField(
          controller: _ctrl,
          style: GoogleFonts.inter(color: fg, fontSize: 14),
          decoration: InputDecoration(
            hintText: 'Posez votre question financière...',
            hintStyle: GoogleFonts.inter(color: dk ? Colors.white38 : Colors.black38, fontSize: 13),
            filled: true, fillColor: Colors.transparent,
            contentPadding: const EdgeInsets.symmetric(horizontal: 18, vertical: 12),
            border: InputBorder.none),
          onSubmitted: _sendMessage,
        )),
        const SizedBox(width: 4),
        GestureDetector(onTap: () => _openVoiceModal(context),
          child: Container(width: 44, height: 44,
            decoration: BoxDecoration(gradient: const LinearGradient(colors: [_C.cyan, _C.blue]),
              shape: BoxShape.circle,
              boxShadow: [BoxShadow(color: _C.blue.withValues(alpha: 0.4), blurRadius: 10)]),
            child: const Icon(Icons.mic_rounded, color: Colors.white, size: 20))),
        const SizedBox(width: 8),
        GestureDetector(onTap: () => _sendMessage(_ctrl.text),
          child: Container(width: 44, height: 44,
            decoration: const BoxDecoration(
              gradient: LinearGradient(colors: [_C.blue, Color(0xFF1D4ED8)]), shape: BoxShape.circle,
              boxShadow: [BoxShadow(color: _C.blue, blurRadius: 10, offset: Offset(0, 3))]),
            child: const Icon(Icons.send_rounded, color: Colors.white, size: 20))),
      ]),
    );
  }

  // ── Message Dispatcher ────────────────────────────────────────────────────────
  Widget _buildMessage(Map<String, dynamic> msg, bool dk, Color cardBg, Color fg, String initials, String? avatarUrl, AppProvider p) {
    final isUser = msg['isUser'] as bool;
    final type   = msg['cardType'] as String? ?? 'text';
    final msgId  = msg['id'] as String;

    Widget bubble;
    switch (type) {
      case 'health_score':   bubble = _HealthScoreCard(p: p, dk: dk); break;
      case 'loan_simulator': bubble = _buildLoanSimulator(dk); break;
      case 'currency':       bubble = _buildCurrencyConverter(dk); break;
      case 'spending':       bubble = _buildSpendingChart(p, dk); break;
      case 'leave_action':
        bubble = _LeaveActionCard(
          leaveData: msg['leaveData'] as Map<String, dynamic>,
          dk: dk,
          onConfirm: () => _executeLeaveRequest(msg['leaveData'] as Map<String, dynamic>),
          onEdit: () => _sendMessage('Je veux modifier ma demande de congé'),
        );
        break;
      case 'avance_action':
        bubble = _AvanceActionCard(
          maxAvance: (msg['maxAvance'] as num? ?? 1500).toDouble(),
          dk: dk,
          onConfirm: (double amt) => _executeAvanceRequest(amt),
        );
        break;
      case 'transfer_action':
        bubble = _TransferActionCard(
          dk: dk,
          onConfirm: (String toMatricule, double montant, String motif) => _executeTransferRequest(toMatricule, montant, motif),
        );
        break;
      case 'pdf_report':
        bubble = _PdfReportCard(
          dk: dk,
          pdfPath: msg['pdfPath'] as String,
        );
        break;
      default:
        bubble = _TextBubble(
          text: msg['text'] as String, time: msg['time'] as String,
          isUser: isUser, dk: dk, cardBg: cardBg,
          isSpeaking: _speakingId == msgId,
          onSpeak: () => _speak(msgId, msg['text'] as String),
        );
    }


    return Padding(
      padding: const EdgeInsets.only(bottom: 16),
      child: Row(
        mainAxisAlignment: isUser ? MainAxisAlignment.end : MainAxisAlignment.start,
        crossAxisAlignment: CrossAxisAlignment.end,
        children: [
          if (!isUser) ...[
            Container(width: 34, height: 34,
              decoration: BoxDecoration(gradient: const LinearGradient(colors: [Color(0xFF0D47A1), _C.blue]),
                shape: BoxShape.circle,
                boxShadow: [BoxShadow(color: _C.blue.withValues(alpha: 0.35), blurRadius: 8)]),
              child: const Icon(Icons.account_balance_rounded, color: Colors.white, size: 16)),
            const SizedBox(width: 8),
          ],
          Flexible(child: bubble),
          if (isUser) ...[
            const SizedBox(width: 8),
            _userAvatar(initials, avatarUrl),
          ],
        ],
      ).animate().fadeIn(duration: 250.ms).slideY(begin: 0.08),
    );
  }

  Widget _userAvatar(String initials, String? avatarUrl) {
    ImageProvider? img;
    if (avatarUrl != null && avatarUrl.isNotEmpty) {
      try {
        if (avatarUrl.startsWith('data:image')) {
          final b64 = avatarUrl.split(',')[1];
          img = MemoryImage(base64Decode(b64));
        } else {
          img = NetworkImage(avatarUrl);
        }
      } catch (_) { img = null; }
    }
    return Container(
      width: 34, height: 34,
      decoration: BoxDecoration(
        shape: BoxShape.circle,
        gradient: img == null
            ? const LinearGradient(colors: [Color(0xFF0D47A1), Color(0xFF0A3D91)])
            : null,
        image: img != null ? DecorationImage(image: img, fit: BoxFit.cover) : null,
        boxShadow: [BoxShadow(color: _C.blue.withValues(alpha: 0.3), blurRadius: 6)],
      ),
      child: img == null
          ? Center(child: Text(initials,
              style: GoogleFonts.outfit(color: Colors.white, fontWeight: FontWeight.w800, fontSize: 13)))
          : null,
    );
  }

  // ══════════════════════════════════════════════════════════════════════════════
  // RICH CARD: Loan Simulator
  // ══════════════════════════════════════════════════════════════════════════════
  Widget _buildLoanSimulator(bool dk) {
    final monthly = _loanAmount * (_loanRate / 100 / 12) /
        (1 - pow(1 + _loanRate / 100 / 12, -(_loanYears * 12)));
    final total   = monthly * _loanYears * 12;
    final interest = total - _loanAmount;

    return StatefulBuilder(builder: (ctx, setS) {
      final mon = _loanAmount * (_loanRate / 100 / 12) /
          (1 - pow(1 + _loanRate / 100 / 12, -(_loanYears * 12)));
      final tot = mon * _loanYears * 12;
      final intr = tot - _loanAmount;

      return Container(
        width: double.infinity,
        decoration: BoxDecoration(
          gradient: const LinearGradient(colors: [Color(0xFF0D47A1), Color(0xFF1565C0), Color(0xFF0A3D91)],
            begin: Alignment.topLeft, end: Alignment.bottomRight),
          borderRadius: BorderRadius.circular(24),
          boxShadow: [BoxShadow(color: _C.blue.withValues(alpha: 0.4), blurRadius: 20, offset: const Offset(0, 8))],
        ),
        padding: const EdgeInsets.all(20),
        child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
          // Header
          Row(children: [
            Container(padding: const EdgeInsets.all(8),
              decoration: BoxDecoration(color: Colors.white12, borderRadius: BorderRadius.circular(12)),
              child: const Icon(Icons.calculate_rounded, color: Colors.white, size: 20)),
            const SizedBox(width: 10),
            Text('Simulateur de Crédit', style: GoogleFonts.outfit(color: Colors.white, fontSize: 16, fontWeight: FontWeight.w800)),
          ]),
          const SizedBox(height: 20),

          // Result
          Container(padding: const EdgeInsets.all(16),
            decoration: BoxDecoration(color: Colors.white12, borderRadius: BorderRadius.circular(16)),
            child: Column(children: [
              Text('Mensualité estimée', style: GoogleFonts.inter(color: Colors.white70, fontSize: 11, fontWeight: FontWeight.w600)),
              const SizedBox(height: 4),
              Text('${mon.toStringAsFixed(3)} TND', style: GoogleFonts.outfit(color: Colors.white, fontSize: 28, fontWeight: FontWeight.w900)),
              const SizedBox(height: 12),
              Row(children: [
                Expanded(child: _loanStat('Montant', '${_loanAmount.toInt()} TND')),
                Expanded(child: _loanStat('Total intérêts', '${intr.toStringAsFixed(0)} TND')),
                Expanded(child: _loanStat('Coût total', '${tot.toStringAsFixed(0)} TND')),
              ]),
            ]),
          ),
          const SizedBox(height: 20),

          // Sliders
          _loanSlider('Montant', '${_loanAmount.toInt()} TND',
            _loanAmount, 1000, 50000, (v) => setState(() => _loanAmount = v)),
          _loanSlider('Durée', '${_loanYears.toInt()} ans',
            _loanYears, 1, 25, (v) => setState(() => _loanYears = v)),
          _loanSlider('Taux annuel', '${_loanRate.toStringAsFixed(1)}%',
            _loanRate, 3, 15, (v) => setState(() => _loanRate = v)),

          const SizedBox(height: 12),
          Container(padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 8),
            decoration: BoxDecoration(color: _C.gold.withValues(alpha: 0.15),
              borderRadius: BorderRadius.circular(12), border: Border.all(color: _C.gold.withValues(alpha: 0.4))),
            child: Row(children: [
              const Icon(Icons.lightbulb_rounded, color: _C.gold, size: 16),
              const SizedBox(width: 8),
              Expanded(child: Text('Demandez votre crédit dans Crédits & Financement',
                style: GoogleFonts.inter(color: _C.gold, fontSize: 11, fontWeight: FontWeight.w600))),
            ])),
        ]),
      );
    });
  }

  Widget _loanStat(String label, String value) => Column(children: [
    Text(value, style: GoogleFonts.outfit(color: Colors.white, fontSize: 13, fontWeight: FontWeight.w800)),
    Text(label, style: GoogleFonts.inter(color: Colors.white60, fontSize: 10)),
  ]);

  Widget _loanSlider(String label, String val, double v, double min, double max, ValueChanged<double> onChange) {
    return Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
      Row(mainAxisAlignment: MainAxisAlignment.spaceBetween, children: [
        Text(label, style: GoogleFonts.inter(color: Colors.white70, fontSize: 12, fontWeight: FontWeight.w600)),
        Text(val, style: GoogleFonts.outfit(color: _C.cyan, fontSize: 13, fontWeight: FontWeight.w800)),
      ]),
      SliderTheme(
        data: SliderThemeData(
          trackHeight: 4,
          activeTrackColor: _C.cyan, inactiveTrackColor: Colors.white.withValues(alpha: 0.2),
          thumbColor: Colors.white, overlayColor: _C.cyan.withValues(alpha: 0.2),
        ),
        child: Slider(value: v, min: min, max: max, onChanged: onChange),
      ),
    ]);
  }

  // ══════════════════════════════════════════════════════════════════════════════
  // RICH CARD: Currency Converter
  // ══════════════════════════════════════════════════════════════════════════════
  Widget _buildCurrencyConverter(bool dk) {
    return StatefulBuilder(builder: (ctx, setS) {
      final amt    = double.tryParse(_currencyCtrl.text) ?? 100;
      final from   = _rates[_fromCcy] ?? 1.0;
      final to     = _rates[_toCcy] ?? 1.0;
      final result = amt * from / to;

      return Container(
        width: double.infinity,
        decoration: BoxDecoration(
          gradient: const LinearGradient(colors: [Color(0xFF065F46), Color(0xFF047857)],
            begin: Alignment.topLeft, end: Alignment.bottomRight),
          borderRadius: BorderRadius.circular(24),
          boxShadow: [BoxShadow(color: _C.emerald.withValues(alpha: 0.4), blurRadius: 20, offset: const Offset(0, 8))],
        ),
        padding: const EdgeInsets.all(20),
        child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
          Row(children: [
            Container(padding: const EdgeInsets.all(8),
              decoration: BoxDecoration(color: Colors.white12, borderRadius: BorderRadius.circular(12)),
              child: const Icon(Icons.currency_exchange_rounded, color: Colors.white, size: 20)),
            const SizedBox(width: 10),
            Text('Convertisseur de Devises', style: GoogleFonts.outfit(color: Colors.white, fontSize: 16, fontWeight: FontWeight.w800)),
          ]),
          const SizedBox(height: 20),

          // Amount input
          Container(padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 10),
            decoration: BoxDecoration(color: Colors.white12, borderRadius: BorderRadius.circular(14)),
            child: Row(children: [
              Expanded(child: TextField(
                controller: _currencyCtrl,
                keyboardType: TextInputType.number,
                style: GoogleFonts.outfit(color: Colors.white, fontSize: 24, fontWeight: FontWeight.w900),
                decoration: const InputDecoration(border: InputBorder.none, hintText: '100',
                  hintStyle: TextStyle(color: Colors.white38)),
                onChanged: (_) => setS(() {}),
              )),
              _ccyDropdown(_fromCcy, (v) => setS(() => _fromCcy = v!)),
            ]),
          ),

          const SizedBox(height: 12),
          Center(child: GestureDetector(
            onTap: () => setS(() { final tmp = _fromCcy; _fromCcy = _toCcy; _toCcy = tmp; }),
            child: Container(padding: const EdgeInsets.all(10),
              decoration: BoxDecoration(color: Colors.white.withValues(alpha: 0.2), shape: BoxShape.circle),
              child: const Icon(Icons.swap_vert_rounded, color: Colors.white, size: 22)),
          )),
          const SizedBox(height: 12),

          // Result
          Container(padding: const EdgeInsets.all(16),
            decoration: BoxDecoration(color: Colors.white12, borderRadius: BorderRadius.circular(14)),
            child: Row(mainAxisAlignment: MainAxisAlignment.spaceBetween, children: [
              Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
                Text('Résultat', style: GoogleFonts.inter(color: Colors.white60, fontSize: 11)),
                const SizedBox(height: 4),
                Text('${result.toStringAsFixed(3)} $_toCcy',
                  style: GoogleFonts.outfit(color: Colors.white, fontSize: 26, fontWeight: FontWeight.w900)),
                Text('1 $_fromCcy = ${(from / to).toStringAsFixed(4)} $_toCcy',
                  style: GoogleFonts.inter(color: Colors.white60, fontSize: 10)),
              ]),
              _ccyDropdown(_toCcy, (v) => setS(() => _toCcy = v!)),
            ]),
          ),
          const SizedBox(height: 12),
          Text('Source : BCT · Mis à jour 08h00',
            style: GoogleFonts.inter(color: Colors.white38, fontSize: 10)),
        ]),
      );
    });
  }

  Widget _ccyDropdown(String val, ValueChanged<String?> onChanged) {
    return DropdownButton<String>(
      value: val, dropdownColor: const Color(0xFF065F46),
      style: GoogleFonts.outfit(color: Colors.white, fontSize: 16, fontWeight: FontWeight.w800),
      underline: const SizedBox(),
      icon: const Icon(Icons.expand_more_rounded, color: Colors.white54, size: 18),
      items: _rates.keys.map((c) => DropdownMenuItem(value: c, child: Text(c))).toList(),
      onChanged: onChanged,
    );
  }

  // ══════════════════════════════════════════════════════════════════════════════
  // RICH CARD: Spending Breakdown
  // ══════════════════════════════════════════════════════════════════════════════
  Widget _buildSpendingChart(AppProvider p, bool dk) {
    final salaire = p.salaireBase;
    final categories = [
      {'label': 'Logement',     'pct': 0.30, 'color': _C.blue,    'icon': Icons.home_rounded},
      {'label': 'Alimentation', 'pct': 0.20, 'color': _C.emerald, 'icon': Icons.restaurant_rounded},
      {'label': 'Transport',    'pct': 0.12, 'color': _C.gold,    'icon': Icons.directions_car_rounded},
      {'label': 'Loisirs',      'pct': 0.10, 'color': _C.violet,  'icon': Icons.sports_esports_rounded},
      {'label': 'Factures',     'pct': 0.13, 'color': _C.rose,    'icon': Icons.bolt_rounded},
      {'label': 'Épargne',      'pct': 0.15, 'color': _C.cyan,    'icon': Icons.savings_rounded},
    ];

    return Container(
      width: double.infinity,
      decoration: BoxDecoration(
        color: dk ? _C.navyCard : Colors.white,
        borderRadius: BorderRadius.circular(24),
        border: Border.all(color: dk ? Colors.white12 : Colors.black.withValues(alpha: 0.06)),
        boxShadow: [BoxShadow(color: Colors.black.withValues(alpha: 0.08), blurRadius: 20, offset: const Offset(0, 8))],
      ),
      padding: const EdgeInsets.all(20),
      child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
        Row(children: [
          Container(padding: const EdgeInsets.all(8),
            decoration: BoxDecoration(gradient: const LinearGradient(colors: [_C.blue, _C.cyan]),
              borderRadius: BorderRadius.circular(12)),
            child: const Icon(Icons.donut_large_rounded, color: Colors.white, size: 20)),
          const SizedBox(width: 10),
          Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
            Text('Analyse Budgétaire', style: GoogleFonts.outfit(
              color: dk ? Colors.white : const Color(0xFF0F172A), fontSize: 16, fontWeight: FontWeight.w800)),
            Text('Basée sur votre salaire de ${salaire.toStringAsFixed(0)} TND',
              style: GoogleFonts.inter(color: dk ? Colors.white54 : Colors.black45, fontSize: 10)),
          ]),
        ]),
        const SizedBox(height: 20),

        // Bar chart
        ...categories.map((cat) {
          final pct    = cat['pct'] as double;
          final color  = cat['color'] as Color;
          final amount = salaire * pct;
          return Padding(
            padding: const EdgeInsets.only(bottom: 12),
            child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
              Row(mainAxisAlignment: MainAxisAlignment.spaceBetween, children: [
                Row(children: [
                  Icon(cat['icon'] as IconData, color: color, size: 14),
                  const SizedBox(width: 6),
                  Text(cat['label'] as String,
                    style: GoogleFonts.inter(color: dk ? Colors.white70 : Colors.black54, fontSize: 12, fontWeight: FontWeight.w600)),
                ]),
                Row(children: [
                  Text('${(pct * 100).toInt()}%',
                    style: GoogleFonts.outfit(color: color, fontSize: 12, fontWeight: FontWeight.w800)),
                  const SizedBox(width: 8),
                  Text('${amount.toStringAsFixed(0)} TND',
                    style: GoogleFonts.inter(color: dk ? Colors.white54 : Colors.black45, fontSize: 11)),
                ]),
              ]),
              const SizedBox(height: 5),
              ClipRRect(borderRadius: BorderRadius.circular(4),
                child: LinearProgressIndicator(value: pct, minHeight: 7,
                  backgroundColor: color.withValues(alpha: 0.12),
                  valueColor: AlwaysStoppedAnimation<Color>(color))),
            ]),
          );
        }),

        const SizedBox(height: 8),
        Container(padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 10),
          decoration: BoxDecoration(color: _C.emerald.withValues(alpha: 0.1),
            borderRadius: BorderRadius.circular(12), border: Border.all(color: _C.emerald.withValues(alpha: 0.3))),
          child: Row(children: [
            const Icon(Icons.savings_rounded, color: _C.emerald, size: 16),
            const SizedBox(width: 8),
            Expanded(child: Text(
              '💡 Conseil : Augmenter votre épargne à 20% (${(salaire * 0.20).toStringAsFixed(0)} TND/mois) vous permettrait d\'atteindre ${(salaire * 0.20 * 12).toStringAsFixed(0)} TND en 1 an.',
              style: GoogleFonts.inter(color: _C.emerald, fontSize: 11, fontWeight: FontWeight.w600))),
          ])),
      ]),
    );
  }

  // ── Voice Modal ──────────────────────────────────────────────────────────────
  void _openVoiceModal(BuildContext context) {
    HapticFeedback.heavyImpact();
    String transcript = 'Touchez le micro et parlez...';
    bool isListeningLocal = false;

    showModalBottomSheet(
      context: context, isScrollControlled: true, backgroundColor: Colors.transparent,
      builder: (ctx) => StatefulBuilder(builder: (_, setM) {
        Future<void> startListening() async {
          if (!_sttReady) await _initStt();
          if (_sttReady && !_stt.isListening) {
            setM(() { isListeningLocal = true; transcript = '🎙️ Écoute en cours...'; });
            await _stt.listen(
              onResult: (SpeechRecognitionResult result) {
                setM(() { if (result.recognizedWords.isNotEmpty) transcript = result.recognizedWords; });
                if (result.finalResult && result.recognizedWords.isNotEmpty) {
                  Future.delayed(const Duration(milliseconds: 500), () {
                    if (ctx.mounted) { Navigator.pop(ctx); _sendMessage(result.recognizedWords); }
                  });
                }
              },
              localeId: 'fr_FR',
              pauseFor: const Duration(seconds: 4),
              listenOptions: stt.SpeechListenOptions(partialResults: true, cancelOnError: false, listenMode: stt.ListenMode.dictation),
            );
          } else {
            setM(() { transcript = 'Micro non disponible. Choisissez une commande :'; isListeningLocal = false; });
          }
        }

        return Container(
          height: MediaQuery.of(context).size.height * 0.78,
          decoration: const BoxDecoration(
            gradient: LinearGradient(colors: [Color(0xFF060D1A), Color(0xFF091E42), Color(0xFF040914)],
              begin: Alignment.topCenter, end: Alignment.bottomCenter),
            borderRadius: BorderRadius.vertical(top: Radius.circular(36)),
            boxShadow: [BoxShadow(color: _C.blue, blurRadius: 60, offset: Offset(0, -20))]),
          child: Column(children: [
            const SizedBox(height: 14),
            Container(width: 44, height: 4, decoration: BoxDecoration(color: Colors.white24, borderRadius: BorderRadius.circular(2))),
            const SizedBox(height: 20),
            Container(padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
              decoration: BoxDecoration(color: _C.gold.withValues(alpha: 0.15),
                borderRadius: BorderRadius.circular(24), border: Border.all(color: _C.gold.withValues(alpha: 0.5))),
              child: Row(mainAxisSize: MainAxisSize.min, children: [
                const Icon(Icons.account_balance_rounded, color: _C.gold, size: 15),
                const SizedBox(width: 8),
                Text('STB Bank · AI Voice Studio', style: GoogleFonts.outfit(color: _C.gold, fontSize: 12, fontWeight: FontWeight.w800)),
              ])),
            const Spacer(),
            GestureDetector(
              onTap: startListening,
              child: AnimatedBuilder(animation: _orbCtrl, builder: (_, __) {
                final s = isListeningLocal ? 1.0 + _orbCtrl.value * 0.25 : 1.0;
                return Stack(alignment: Alignment.center, children: [
                  Container(width: 190 * s, height: 190 * s,
                    decoration: BoxDecoration(shape: BoxShape.circle,
                      color: _C.blue.withValues(alpha: 0.08 * (1 + _orbCtrl.value)))),
                  Container(width: 160 * s, height: 160 * s,
                    decoration: BoxDecoration(shape: BoxShape.circle,
                      color: _C.blue.withValues(alpha: 0.12),
                      border: Border.all(color: isListeningLocal ? _C.cyan : _C.gold, width: 2),
                      boxShadow: [
                        BoxShadow(color: (isListeningLocal ? _C.cyan : _C.gold).withValues(alpha: 0.5), blurRadius: 40 * s, spreadRadius: 6),
                        BoxShadow(color: _C.blue.withValues(alpha: 0.3), blurRadius: 60 * s, spreadRadius: 10),
                      ])),
                  Container(width: 110, height: 110,
                    decoration: BoxDecoration(shape: BoxShape.circle,
                      gradient: RadialGradient(colors: isListeningLocal
                        ? [_C.cyan, _C.blue, const Color(0xFF0D47A1)]
                        : [_C.blue, const Color(0xFF0D47A1), _C.navy]),
                      boxShadow: [BoxShadow(color: _C.blue.withValues(alpha: 0.6), blurRadius: 24, spreadRadius: 4)]),
                    child: Icon(isListeningLocal ? Icons.graphic_eq_rounded : Icons.mic_rounded, color: Colors.white, size: 44)),
                ]);
              }),
            ),
            const SizedBox(height: 28),
            AnimatedBuilder(animation: _waveCtrl, builder: (_, __) => Row(
              mainAxisAlignment: MainAxisAlignment.center,
              children: List.generate(11, (i) {
                final h = isListeningLocal
                    ? 6.0 + (sin((_waveCtrl.value * 2 * pi) + (i * 0.65)) * 22.0).abs()
                    : 4.0 + (sin((i * 0.5)) * 6.0).abs();
                return Container(width: 4, height: h, margin: const EdgeInsets.symmetric(horizontal: 3),
                  decoration: BoxDecoration(borderRadius: BorderRadius.circular(4),
                    gradient: LinearGradient(begin: Alignment.topCenter, end: Alignment.bottomCenter,
                      colors: isListeningLocal ? [_C.cyan, _C.blue] : [Colors.white24, Colors.white12])));
              }),
            )),
            const SizedBox(height: 20),
            Padding(padding: const EdgeInsets.symmetric(horizontal: 32),
              child: Text(transcript, textAlign: TextAlign.center,
                style: GoogleFonts.inter(color: Colors.white, fontSize: 15, fontWeight: FontWeight.w600, height: 1.5))),
            const Spacer(),
            Wrap(alignment: WrapAlignment.center, spacing: 8, runSpacing: 8,
              children: ['📊 Mes dépenses', '🌴 Mes congés', '🏦 Simuler crédit', '💱 Convertir devise'].map((q) =>
                GestureDetector(onTap: () { HapticFeedback.mediumImpact(); Navigator.pop(ctx); _sendMessage(q); },
                  child: Container(padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 9),
                    decoration: BoxDecoration(color: Colors.white.withValues(alpha: 0.08),
                      borderRadius: BorderRadius.circular(20), border: Border.all(color: Colors.white.withValues(alpha: 0.2))),
                    child: Text(q, style: GoogleFonts.outfit(color: Colors.white, fontSize: 12, fontWeight: FontWeight.w700))))).toList()),
            const SizedBox(height: 20),
            GestureDetector(
              onTap: isListeningLocal
                  ? () async { await _stt.stop(); setM(() => isListeningLocal = false); }
                  : startListening,
              child: AnimatedContainer(duration: const Duration(milliseconds: 300),
                padding: const EdgeInsets.symmetric(horizontal: 32, vertical: 14),
                decoration: BoxDecoration(
                  gradient: LinearGradient(colors: isListeningLocal ? [_C.rose, const Color(0xFFB91C1C)] : [_C.blue, _C.cyan]),
                  borderRadius: BorderRadius.circular(28),
                  boxShadow: [BoxShadow(color: (isListeningLocal ? _C.rose : _C.blue).withValues(alpha: 0.5), blurRadius: 20)]),
                child: Row(mainAxisSize: MainAxisSize.min, children: [
                  Icon(isListeningLocal ? Icons.stop_rounded : Icons.mic_rounded, color: Colors.white, size: 22),
                  const SizedBox(width: 10),
                  Text(isListeningLocal ? 'Arrêter l\'écoute' : 'Appuyez pour parler',
                    style: GoogleFonts.outfit(color: Colors.white, fontWeight: FontWeight.w800, fontSize: 15)),
                ])),
            ),
            SizedBox(height: MediaQuery.of(context).padding.bottom + 20),
          ]),
        );
      }),
    );
  }
}

// ══════════════════════════════════════════════════════════════════════════════
// RICH CARD: Financial Health Score
// ══════════════════════════════════════════════════════════════════════════════
class _HealthScoreCard extends StatefulWidget {
  final AppProvider p;
  final bool dk;
  const _HealthScoreCard({required this.p, required this.dk});
  @override
  State<_HealthScoreCard> createState() => _HealthScoreCardState();
}

class _HealthScoreCardState extends State<_HealthScoreCard> with SingleTickerProviderStateMixin {
  late AnimationController _ac;
  late Animation<double> _anim;

  @override
  void initState() {
    super.initState();
    _ac = AnimationController(vsync: this, duration: const Duration(milliseconds: 1500));
    _anim = CurvedAnimation(parent: _ac, curve: Curves.easeOutCubic);
    _ac.forward();
  }

  @override
  void dispose() { _ac.dispose(); super.dispose(); }

  @override
  Widget build(BuildContext context) {
    final p = widget.p;
    final salaire  = p.salaireBase;
    final solde    = p.compteSolde;
    final credits  = p.creditsEnCours;
    final conges   = p.soldeConges;

    // Score calculation
    final solvency   = (solde / salaire).clamp(0.0, 1.0);
    final debtRatio  = credits > 0 ? (1.0 - (credits / salaire / 10).clamp(0.0, 1.0)) : 1.0;
    final leaveScore = (conges / 90.0).clamp(0.0, 1.0);
    final saving     = 0.7; // estimated
    final score      = ((solvency * 30 + debtRatio * 30 + leaveScore * 20 + saving * 20)).clamp(0.0, 100.0);
    final pct        = score / 100.0;

    final Color scoreColor = score >= 75 ? _C.emerald : score >= 50 ? _C.gold : _C.rose;
    final String grade     = score >= 80 ? 'Excellent' : score >= 65 ? 'Très Bon' : score >= 50 ? 'Bon' : 'À améliorer';

    final metrics = [
      {'label': 'Solvabilité', 'val': solvency, 'color': _C.blue},
      {'label': 'Endettement', 'val': debtRatio, 'color': _C.emerald},
      {'label': 'Épargne',     'val': saving,    'color': _C.cyan},
      {'label': 'Congés',      'val': leaveScore,'color': _C.violet},
    ];

    return Container(
      width: double.infinity,
      decoration: BoxDecoration(
        gradient: LinearGradient(
          colors: [const Color(0xFF1A0533), Color.lerp(const Color(0xFF1A0533), scoreColor, 0.3)!],
          begin: Alignment.topLeft, end: Alignment.bottomRight),
        borderRadius: BorderRadius.circular(24),
        border: Border.all(color: scoreColor.withValues(alpha: 0.3)),
        boxShadow: [BoxShadow(color: scoreColor.withValues(alpha: 0.35), blurRadius: 20, offset: const Offset(0, 8))],
      ),
      padding: const EdgeInsets.all(20),
      child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
        Row(children: [
          Container(padding: const EdgeInsets.all(8),
            decoration: BoxDecoration(color: scoreColor.withValues(alpha: 0.2), borderRadius: BorderRadius.circular(12)),
            child: Icon(Icons.health_and_safety_rounded, color: scoreColor, size: 20)),
          const SizedBox(width: 10),
          Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
            Text('Score Santé Financière', style: GoogleFonts.outfit(color: Colors.white, fontSize: 15, fontWeight: FontWeight.w800)),
            Text('Analyse personnalisée de votre profil', style: GoogleFonts.inter(color: Colors.white54, fontSize: 10)),
          ]),
        ]),
        const SizedBox(height: 24),

        // Score ring
        Center(child: AnimatedBuilder(animation: _anim, builder: (_, __) => SizedBox(
          width: 160, height: 160,
          child: Stack(alignment: Alignment.center, children: [
            CustomPaint(painter: _RingPainter(value: _anim.value * pct, color: scoreColor, bg: Colors.white12), child: const SizedBox.expand()),
            Column(mainAxisAlignment: MainAxisAlignment.center, children: [
              Text('${(score * _anim.value).toInt()}', style: GoogleFonts.outfit(color: Colors.white, fontSize: 42, fontWeight: FontWeight.w900)),
              Text('/100', style: GoogleFonts.inter(color: Colors.white54, fontSize: 12)),
              Text(grade, style: GoogleFonts.outfit(color: scoreColor, fontSize: 14, fontWeight: FontWeight.w800)),
            ]),
          ]),
        ))),

        const SizedBox(height: 24),

        // Metrics bars
        ...metrics.map((m) {
          final val   = m['val'] as double;
          final color = m['color'] as Color;
          return Padding(padding: const EdgeInsets.only(bottom: 10), child: Column(
            crossAxisAlignment: CrossAxisAlignment.start, children: [
              Row(mainAxisAlignment: MainAxisAlignment.spaceBetween, children: [
                Text(m['label'] as String, style: GoogleFonts.inter(color: Colors.white70, fontSize: 12, fontWeight: FontWeight.w600)),
                Text('${(val * 100).toInt()}%', style: GoogleFonts.outfit(color: color, fontSize: 12, fontWeight: FontWeight.w800)),
              ]),
              const SizedBox(height: 4),
              AnimatedBuilder(animation: _anim, builder: (_, __) => ClipRRect(
                borderRadius: BorderRadius.circular(4),
                child: LinearProgressIndicator(value: val * _anim.value, minHeight: 6,
                  backgroundColor: color.withValues(alpha: 0.15),
                  valueColor: AlwaysStoppedAnimation<Color>(color)))),
            ],
          ));
        }),

        const SizedBox(height: 12),
        Container(padding: const EdgeInsets.all(12),
          decoration: BoxDecoration(color: Colors.white10, borderRadius: BorderRadius.circular(12)),
          child: Row(children: [
            Icon(Icons.tips_and_updates_rounded, color: scoreColor, size: 16),
            const SizedBox(width: 8),
            Expanded(child: Text(
              score >= 75
                  ? '✨ Excellent profil ! Pensez à optimiser votre épargne long terme.'
                  : score >= 50
                  ? '📈 Bon profil. Réduisez vos crédits pour améliorer votre score.'
                  : '💡 Consultez un conseiller STB pour optimiser vos finances.',
              style: GoogleFonts.inter(color: scoreColor, fontSize: 11, fontWeight: FontWeight.w600))),
          ])),
      ]),
    );
  }
}

class _RingPainter extends CustomPainter {
  final double value;
  final Color  color;
  final Color  bg;
  _RingPainter({required this.value, required this.color, required this.bg});

  @override
  void paint(Canvas canvas, Size size) {
    final center = Offset(size.width / 2, size.height / 2);
    final radius = size.width / 2 - 12;
    final stroke = 14.0;
    final paint  = Paint()..style = PaintingStyle.stroke..strokeWidth = stroke..strokeCap = StrokeCap.round;

    paint.color = bg;
    canvas.drawCircle(center, radius, paint);

    paint.color = color;
    paint.shader = SweepGradient(colors: [color.withValues(alpha: 0.5), color], startAngle: -pi / 2, endAngle: -pi / 2 + pi * 2)
        .createShader(Rect.fromCircle(center: center, radius: radius));
    canvas.drawArc(Rect.fromCircle(center: center, radius: radius), -pi / 2, pi * 2 * value, false, paint);
  }

  @override
  bool shouldRepaint(_RingPainter old) => old.value != value;
}

// ══════════════════════════════════════════════════════════════════════════════
// Text Bubble
// ══════════════════════════════════════════════════════════════════════════════
class _TextBubble extends StatelessWidget {
  final String text, time;
  final bool isUser, dk, isSpeaking;
  final Color cardBg;
  final VoidCallback onSpeak;
  const _TextBubble({required this.text, required this.time, required this.isUser,
    required this.dk, required this.cardBg, required this.isSpeaking, required this.onSpeak});

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(15),
      decoration: BoxDecoration(
        gradient: isUser ? const LinearGradient(colors: [_C.blue, Color(0xFF1565C0)],
          begin: Alignment.topLeft, end: Alignment.bottomRight) : null,
        color: isUser ? null : cardBg,
        borderRadius: BorderRadius.only(topLeft: const Radius.circular(20), topRight: const Radius.circular(20),
          bottomLeft: Radius.circular(isUser ? 20 : 4), bottomRight: Radius.circular(isUser ? 4 : 20)),
        border: isUser ? null : Border.all(color: dk ? Colors.white.withValues(alpha: 0.07) : Colors.black.withValues(alpha: 0.05)),
        boxShadow: [BoxShadow(color: isUser ? _C.blue.withValues(alpha: 0.25) : Colors.black.withValues(alpha: 0.04),
          blurRadius: 12, offset: const Offset(0, 4))],
      ),
      child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
        _richText(text, isUser, dk),
        const SizedBox(height: 8),
        Row(mainAxisAlignment: MainAxisAlignment.spaceBetween, children: [
          Text(time, style: TextStyle(color: isUser ? Colors.white70 : (dk ? Colors.white38 : Colors.black38), fontSize: 10)),
          if (!isUser) GestureDetector(onTap: onSpeak,
            child: AnimatedContainer(duration: const Duration(milliseconds: 200),
              padding: const EdgeInsets.symmetric(horizontal: 9, vertical: 4),
              decoration: BoxDecoration(
                color: isSpeaking ? _C.emerald.withValues(alpha: 0.15) : (dk ? Colors.white10 : Colors.black.withValues(alpha: 0.05)),
                borderRadius: BorderRadius.circular(12),
                border: Border.all(color: isSpeaking ? _C.emerald.withValues(alpha: 0.4) : Colors.transparent)),
              child: Row(mainAxisSize: MainAxisSize.min, children: [
                Icon(isSpeaking ? Icons.stop_circle_rounded : Icons.volume_up_rounded,
                  color: isSpeaking ? _C.emerald : (dk ? Colors.white60 : Colors.black45), size: 13),
                const SizedBox(width: 4),
                Text(isSpeaking ? 'Stop' : 'Écouter',
                  style: TextStyle(color: isSpeaking ? _C.emerald : (dk ? Colors.white60 : Colors.black45),
                    fontSize: 10, fontWeight: FontWeight.w700)),
              ]))),
        ]),
      ]),
    );
  }

  Widget _richText(String text, bool isUser, bool dk) {
    final base = isUser ? Colors.white : (dk ? Colors.white.withValues(alpha: 0.92) : const Color(0xFF0F172A));
    final spans = <InlineSpan>[];
    int lastEnd = 0;
    for (final m in RegExp(r'\*\*(.+?)\*\*').allMatches(text)) {
      if (m.start > lastEnd) spans.add(TextSpan(text: text.substring(lastEnd, m.start)));
      spans.add(TextSpan(text: m.group(1), style: const TextStyle(fontWeight: FontWeight.w800)));
      lastEnd = m.end;
    }
    if (lastEnd < text.length) spans.add(TextSpan(text: text.substring(lastEnd)));
    return RichText(text: TextSpan(
      style: GoogleFonts.inter(color: base, fontSize: 14, height: 1.5, fontWeight: FontWeight.w500),
      children: spans));
  }
}

// ── Three dots typing animation ───────────────────────────────────────────────
class _ThreeDotsAnimation extends StatefulWidget {
  @override
  State<_ThreeDotsAnimation> createState() => _ThreeDotsAnimationState();
}

class _ThreeDotsAnimationState extends State<_ThreeDotsAnimation> with SingleTickerProviderStateMixin {
  late AnimationController _ac;
  @override
  void initState() { super.initState(); _ac = AnimationController(vsync: this, duration: const Duration(milliseconds: 900))..repeat(); }
  @override
  void dispose() { _ac.dispose(); super.dispose(); }
  @override
  Widget build(BuildContext context) => AnimatedBuilder(animation: _ac, builder: (_, __) => Row(
    children: List.generate(3, (i) {
      final phase = (_ac.value * 3 - i).clamp(0.0, 1.0);
      final opacity = sin(phase * pi).clamp(0.2, 1.0);
      return Container(width: 5, height: 5, margin: const EdgeInsets.symmetric(horizontal: 2),
        decoration: BoxDecoration(shape: BoxShape.circle, color: _C.blue.withValues(alpha: opacity)));
    }),
  ));
}

// ══════════════════════════════════════════════════════════════════════════════
// LEAVE ACTION CARD
// ══════════════════════════════════════════════════════════════════════════════
class _LeaveActionCard extends StatefulWidget {
  final Map<String, dynamic> leaveData;
  final bool dk;
  final VoidCallback onConfirm;
  final VoidCallback onEdit;
  const _LeaveActionCard({required this.leaveData, required this.dk, required this.onConfirm, required this.onEdit});
  @override
  State<_LeaveActionCard> createState() => _LeaveActionCardState();
}

class _LeaveActionCardState extends State<_LeaveActionCard> {
  bool _confirmed = false;
  String _selectedType = 'REPOS';

  final _types = {
    'REPOS': '🏖️ Repos Annuel',
    'MALADIE': '🏥 Maladie',
    'MARIAGE': '💍 Mariage',
    'NAISSANCE': '👶 Naissance',
    'SANS_SOLDE': '📋 Sans Solde',
  };

  @override
  Widget build(BuildContext context) {
    final d = widget.leaveData;
    final days = d['days'] as int;
    final solde = d['soldeConges'] as int;
    final dk = widget.dk;
    final canApply = days <= solde;

    return Container(
      width: double.infinity,
      decoration: BoxDecoration(
        gradient: const LinearGradient(
          colors: [Color(0xFF065F46), Color(0xFF047857)],
          begin: Alignment.topLeft, end: Alignment.bottomRight),
        borderRadius: BorderRadius.circular(20),
        boxShadow: [BoxShadow(color: const Color(0xFF10B981).withValues(alpha: 0.35), blurRadius: 16, offset: const Offset(0, 6))],
      ),
      padding: const EdgeInsets.all(18),
      child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
        // Header
        Row(children: [
          Container(padding: const EdgeInsets.all(8), decoration: BoxDecoration(color: Colors.white12, borderRadius: BorderRadius.circular(12)),
            child: const Icon(Icons.event_available_rounded, color: Colors.white, size: 20)),
          const SizedBox(width: 10),
          Expanded(child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
            Text('Demande de Congé Détectée 🤖', style: GoogleFonts.outfit(color: Colors.white, fontSize: 14, fontWeight: FontWeight.w800)),
            Text('J\'ai analysé votre demande', style: GoogleFonts.inter(color: Colors.white60, fontSize: 10)),
          ])),
          if (!_confirmed) Container(
            padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
            decoration: BoxDecoration(color: Colors.white.withValues(alpha: 0.15), borderRadius: BorderRadius.circular(8)),
            child: Text('$days j / $solde j dispo', style: GoogleFonts.outfit(color: Colors.white, fontSize: 10, fontWeight: FontWeight.w800)),
          ),
        ]),
        const SizedBox(height: 14),

        if (!_confirmed) ...[ 
          // Dates summary
          Container(
            padding: const EdgeInsets.all(14),
            decoration: BoxDecoration(color: Colors.white.withValues(alpha: 0.1), borderRadius: BorderRadius.circular(14)),
            child: Row(children: [
              Expanded(child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
                Text('Du', style: GoogleFonts.inter(color: Colors.white60, fontSize: 10)),
                Text(d['startFmt'] as String, style: GoogleFonts.outfit(color: Colors.white, fontSize: 16, fontWeight: FontWeight.w900)),
              ])),
              Container(width: 1, height: 36, color: Colors.white24),
              Expanded(child: Column(crossAxisAlignment: CrossAxisAlignment.center, children: [
                Text('Durée', style: GoogleFonts.inter(color: Colors.white60, fontSize: 10)),
                Text('$days jours', style: GoogleFonts.outfit(color: const Color(0xFF6EE7B7), fontSize: 16, fontWeight: FontWeight.w900)),
              ])),
              Container(width: 1, height: 36, color: Colors.white24),
              Expanded(child: Column(crossAxisAlignment: CrossAxisAlignment.end, children: [
                Text('Au', style: GoogleFonts.inter(color: Colors.white60, fontSize: 10)),
                Text(d['endFmt'] as String, style: GoogleFonts.outfit(color: Colors.white, fontSize: 16, fontWeight: FontWeight.w900)),
              ])),
            ]),
          ),
          const SizedBox(height: 12),

          // Type selector
          Text('Type de congé :', style: GoogleFonts.inter(color: Colors.white70, fontSize: 11, fontWeight: FontWeight.w600)),
          const SizedBox(height: 8),
          SizedBox(
            height: 36,
            child: ListView.separated(
              scrollDirection: Axis.horizontal,
              itemCount: _types.length,
              separatorBuilder: (_, __) => const SizedBox(width: 6),
              itemBuilder: (_, i) {
                final entry = _types.entries.elementAt(i);
                final sel = _selectedType == entry.key;
                return GestureDetector(
                  onTap: () { HapticFeedback.selectionClick(); setState(() => _selectedType = entry.key); },
                  child: AnimatedContainer(duration: const Duration(milliseconds: 200),
                    padding: const EdgeInsets.symmetric(horizontal: 12),
                    decoration: BoxDecoration(
                      color: sel ? Colors.white : Colors.white12,
                      borderRadius: BorderRadius.circular(18),
                    ),
                    child: Center(child: Text(entry.value, style: GoogleFonts.outfit(
                      color: sel ? const Color(0xFF065F46) : Colors.white70,
                      fontSize: 11, fontWeight: FontWeight.w800)))),
                );
              },
            ),
          ),
          const SizedBox(height: 14),

          // Warning
          if (!canApply)
            Container(
              padding: const EdgeInsets.all(10),
              decoration: BoxDecoration(color: const Color(0xFFF59E0B).withValues(alpha: 0.2), borderRadius: BorderRadius.circular(10)),
              child: Row(children: [
                const Icon(Icons.warning_amber_rounded, color: Color(0xFFF59E0B), size: 16),
                const SizedBox(width: 8),
                Expanded(child: Text('Solde insuffisant ($solde j disponible vs $days j demandé)', style: GoogleFonts.inter(color: const Color(0xFFF59E0B), fontSize: 11))),
              ]),
            ),
          if (canApply) const SizedBox(height: 0),

          const SizedBox(height: 14),

          // Action buttons
          Row(children: [
            Expanded(child: GestureDetector(
              onTap: widget.onEdit,
              child: Container(
                padding: const EdgeInsets.symmetric(vertical: 12),
                decoration: BoxDecoration(color: Colors.white12, borderRadius: BorderRadius.circular(14)),
                child: Center(child: Text('✏️ Modifier', style: GoogleFonts.outfit(color: Colors.white70, fontSize: 13, fontWeight: FontWeight.w700)))),
            )),
            const SizedBox(width: 10),
            Expanded(flex: 2, child: GestureDetector(
              onTap: canApply ? () { setState(() => _confirmed = true); widget.onConfirm(); } : null,
              child: Container(
                padding: const EdgeInsets.symmetric(vertical: 12),
                decoration: BoxDecoration(
                  color: canApply ? Colors.white : Colors.white24,
                  borderRadius: BorderRadius.circular(14),
                ),
                child: Center(child: Text('✅ Confirmer la demande', style: GoogleFonts.outfit(
                  color: canApply ? const Color(0xFF065F46) : Colors.white38, fontSize: 13, fontWeight: FontWeight.w900)))),
            )),
          ]),
        ] else ...[
          const SizedBox(height: 8),
          Center(child: Column(children: [
            const Icon(Icons.check_circle_rounded, color: Color(0xFF6EE7B7), size: 40),
            const SizedBox(height: 8),
            Text('Demande envoyée !', style: GoogleFonts.outfit(color: Colors.white, fontSize: 16, fontWeight: FontWeight.w800)),
            Text('En attente d\'approbation...', style: GoogleFonts.inter(color: Colors.white60, fontSize: 12)),
          ])),
          const SizedBox(height: 8),
        ],
      ]),
    );
  }
}

// ══════════════════════════════════════════════════════════════════════════════
// AVANCE ACTION CARD
// ══════════════════════════════════════════════════════════════════════════════
class _AvanceActionCard extends StatefulWidget {
  final double maxAvance;
  final bool dk;
  final void Function(double) onConfirm;
  const _AvanceActionCard({required this.maxAvance, required this.dk, required this.onConfirm});
  @override
  State<_AvanceActionCard> createState() => _AvanceActionCardState();
}

class _AvanceActionCardState extends State<_AvanceActionCard> {
  late double _amount;
  bool _confirmed = false;

  @override
  void initState() { super.initState(); _amount = (widget.maxAvance * 0.5).roundToDouble(); }

  @override
  Widget build(BuildContext context) {
    return Container(
      width: double.infinity,
      decoration: BoxDecoration(
        gradient: const LinearGradient(colors: [Color(0xFF1E3A5F), Color(0xFF2563EB)],
          begin: Alignment.topLeft, end: Alignment.bottomRight),
        borderRadius: BorderRadius.circular(20),
        boxShadow: [BoxShadow(color: _C.blue.withValues(alpha: 0.4), blurRadius: 16, offset: const Offset(0, 6))],
      ),
      padding: const EdgeInsets.all(18),
      child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
        Row(children: [
          Container(padding: const EdgeInsets.all(8), decoration: BoxDecoration(color: Colors.white12, borderRadius: BorderRadius.circular(12)),
            child: const Icon(Icons.account_balance_wallet_rounded, color: Colors.white, size: 20)),
          const SizedBox(width: 10),
          Expanded(child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
            Text('Avance Salaire 💵', style: GoogleFonts.outfit(color: Colors.white, fontSize: 14, fontWeight: FontWeight.w800)),
            Text('Maximum éligible : ${widget.maxAvance.toStringAsFixed(3)} TND', style: GoogleFonts.inter(color: Colors.white60, fontSize: 10)),
          ])),
        ]),
        const SizedBox(height: 16),

        if (!_confirmed) ...[ 
          // Amount display
          Container(
            padding: const EdgeInsets.all(14),
            decoration: BoxDecoration(color: Colors.white.withValues(alpha: 0.1), borderRadius: BorderRadius.circular(14)),
            child: Row(mainAxisAlignment: MainAxisAlignment.spaceBetween, children: [
              Text('Montant sélectionné', style: GoogleFonts.inter(color: Colors.white60, fontSize: 11)),
              Text('${_amount.toStringAsFixed(3)} TND', style: GoogleFonts.outfit(color: const Color(0xFF93C5FD), fontSize: 18, fontWeight: FontWeight.w900)),
            ]),
          ),
          const SizedBox(height: 12),

          // Slider
          SliderTheme(
            data: SliderThemeData(
              trackHeight: 5,
              activeTrackColor: const Color(0xFF60A5FA),
              inactiveTrackColor: Colors.white12,
              thumbColor: Colors.white,
              overlayColor: _C.blue.withValues(alpha: 0.2),
            ),
            child: Slider(
              value: _amount, min: 100, max: widget.maxAvance,
              divisions: ((widget.maxAvance - 100) / 100).floor().clamp(1, 100),
              onChanged: (v) => setState(() => _amount = (v / 100).round() * 100.0),
            ),
          ),
          Row(mainAxisAlignment: MainAxisAlignment.spaceBetween, children: [
            Text('100 TND', style: GoogleFonts.inter(color: Colors.white38, fontSize: 10)),
            Text('${widget.maxAvance.toStringAsFixed(0)} TND', style: GoogleFonts.inter(color: Colors.white38, fontSize: 10)),
          ]),
          const SizedBox(height: 16),

          // Confirm button
          SizedBox(width: double.infinity, child: GestureDetector(
            onTap: () { setState(() => _confirmed = true); widget.onConfirm(_amount); },
            child: Container(
              padding: const EdgeInsets.symmetric(vertical: 14),
              decoration: BoxDecoration(color: Colors.white, borderRadius: BorderRadius.circular(14)),
              child: Center(child: Text('✅ Demander ${_amount.toStringAsFixed(3)} TND',
                style: GoogleFonts.outfit(color: const Color(0xFF1E3A5F), fontSize: 14, fontWeight: FontWeight.w900)))),
          )),
        ] else ...[
          const SizedBox(height: 8),
          Center(child: Column(children: [
            const Icon(Icons.check_circle_rounded, color: Color(0xFF93C5FD), size: 40),
            const SizedBox(height: 8),
            Text('Avance demandée !', style: GoogleFonts.outfit(color: Colors.white, fontSize: 16, fontWeight: FontWeight.w800)),
            Text('${_amount.toStringAsFixed(3)} TND — En attente RH', style: GoogleFonts.inter(color: Colors.white60, fontSize: 12)),
          ])),
          const SizedBox(height: 8),
        ],
      ]),
    );
  }
}

class _TransferActionCard extends StatefulWidget {
  final bool dk;
  final Function(String, double, String) onConfirm;

  const _TransferActionCard({required this.dk, required this.onConfirm});

  @override
  State<_TransferActionCard> createState() => _TransferActionCardState();
}

class _TransferActionCardState extends State<_TransferActionCard> {
  bool _confirmed = false;
  double _amount = 100.0;
  final TextEditingController _matriculeCtrl = TextEditingController();
  final TextEditingController _motifCtrl = TextEditingController();

  @override
  void dispose() {
    _matriculeCtrl.dispose();
    _motifCtrl.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Container(
      width: double.infinity,
      padding: const EdgeInsets.all(20),
      decoration: BoxDecoration(
        gradient: LinearGradient(
          colors: widget.dk ? [const Color(0xFF1E3A8A), const Color(0xFF172554)] : [_C.blue, const Color(0xFF1E3A8A)],
          begin: Alignment.topLeft, end: Alignment.bottomRight,
        ),
        borderRadius: BorderRadius.circular(20),
        border: Border.all(color: Colors.white.withValues(alpha: 0.1)),
        boxShadow: [BoxShadow(color: _C.blue.withValues(alpha: 0.2), blurRadius: 16, offset: const Offset(0, 8))],
      ),
      child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
        Row(children: [
          Container(
            padding: const EdgeInsets.all(10),
            decoration: BoxDecoration(color: Colors.white.withValues(alpha: 0.15), shape: BoxShape.circle),
            child: const Icon(Icons.send_rounded, color: Colors.white, size: 20),
          ),
          const SizedBox(width: 12),
          Expanded(child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
            Text('Nouveau Virement 💸', style: GoogleFonts.outfit(color: Colors.white, fontSize: 14, fontWeight: FontWeight.w800)),
            Text('Saisie des informations', style: GoogleFonts.inter(color: Colors.white60, fontSize: 10)),
          ])),
        ]),
        const SizedBox(height: 16),

        if (!_confirmed) ...[
          // Montant
          Container(
            padding: const EdgeInsets.all(14),
            decoration: BoxDecoration(color: Colors.white.withValues(alpha: 0.1), borderRadius: BorderRadius.circular(14)),
            child: Row(mainAxisAlignment: MainAxisAlignment.spaceBetween, children: [
              Text('Montant (TND)', style: GoogleFonts.inter(color: Colors.white60, fontSize: 11)),
              Text('${_amount.toStringAsFixed(3)}', style: GoogleFonts.outfit(color: const Color(0xFF93C5FD), fontSize: 18, fontWeight: FontWeight.w900)),
            ]),
          ),
          const SizedBox(height: 8),
          SliderTheme(
            data: SliderThemeData(
              trackHeight: 5, activeTrackColor: const Color(0xFF60A5FA),
              inactiveTrackColor: Colors.white12, thumbColor: Colors.white,
              overlayColor: _C.blue.withValues(alpha: 0.2),
            ),
            child: Slider(
              value: _amount, min: 10, max: 2000, divisions: 199,
              onChanged: (v) => setState(() => _amount = (v / 10).round() * 10.0),
            ),
          ),
          const SizedBox(height: 12),
          // Matricule Destinataire
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 4),
            decoration: BoxDecoration(color: Colors.white.withValues(alpha: 0.1), borderRadius: BorderRadius.circular(14)),
            child: TextField(
              controller: _matriculeCtrl,
              style: const TextStyle(color: Colors.white, fontSize: 14),
              decoration: const InputDecoration(
                hintText: 'Matricule destinataire...', hintStyle: TextStyle(color: Colors.white38, fontSize: 12),
                border: InputBorder.none,
                icon: Icon(Icons.person_rounded, color: Colors.white54, size: 16),
              ),
            ),
          ),
          const SizedBox(height: 12),
          // Motif
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 4),
            decoration: BoxDecoration(color: Colors.white.withValues(alpha: 0.1), borderRadius: BorderRadius.circular(14)),
            child: TextField(
              controller: _motifCtrl,
              style: const TextStyle(color: Colors.white, fontSize: 14),
              decoration: const InputDecoration(
                hintText: 'Motif du virement (optionnel)', hintStyle: TextStyle(color: Colors.white38, fontSize: 12),
                border: InputBorder.none,
                icon: Icon(Icons.edit_note_rounded, color: Colors.white54, size: 16),
              ),
            ),
          ),
          const SizedBox(height: 16),

          // Confirm button
          SizedBox(width: double.infinity, child: GestureDetector(
            onTap: () { 
              if (_matriculeCtrl.text.trim().isEmpty) return;
              setState(() => _confirmed = true); 
              widget.onConfirm(_matriculeCtrl.text.trim(), _amount, _motifCtrl.text.trim()); 
            },
            child: Container(
              padding: const EdgeInsets.symmetric(vertical: 14),
              decoration: BoxDecoration(color: Colors.white, borderRadius: BorderRadius.circular(14)),
              child: Center(child: Text('✅ Confirmer le virement',
                style: GoogleFonts.outfit(color: const Color(0xFF1E3A5F), fontSize: 14, fontWeight: FontWeight.w900)))),
          )),
        ] else ...[
          const SizedBox(height: 8),
          Center(child: Column(children: [
            const Icon(Icons.check_circle_rounded, color: Color(0xFF93C5FD), size: 40),
            const SizedBox(height: 8),
            Text('Virement en cours !', style: GoogleFonts.outfit(color: Colors.white, fontSize: 16, fontWeight: FontWeight.w800)),
            Text('${_amount.toStringAsFixed(3)} TND vers ${_matriculeCtrl.text.trim()}', style: GoogleFonts.inter(color: Colors.white60, fontSize: 12)),
          ])),
          const SizedBox(height: 8),
        ],
      ]),
    );
  }
}

class _PdfReportCard extends StatelessWidget {
  final bool dk;
  final String pdfPath;

  const _PdfReportCard({required this.dk, required this.pdfPath});

  @override
  Widget build(BuildContext context) {
    return Container(
      width: double.infinity,
      padding: const EdgeInsets.all(20),
      decoration: BoxDecoration(
        color: dk ? _C.navyCard : Colors.white,
        borderRadius: BorderRadius.circular(20),
        border: Border.all(color: dk ? Colors.white.withValues(alpha: 0.1) : Colors.black.withValues(alpha: 0.05)),
        boxShadow: [BoxShadow(color: Colors.black.withValues(alpha: 0.03), blurRadius: 10, offset: const Offset(0, 4))],
      ),
      child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
        Row(children: [
          Container(
            padding: const EdgeInsets.all(10),
            decoration: BoxDecoration(color: const Color(0xFFEF4444).withValues(alpha: 0.15), shape: BoxShape.circle),
            child: const Icon(Icons.picture_as_pdf_rounded, color: Color(0xFFEF4444), size: 20),
          ),
          const SizedBox(width: 12),
          Expanded(child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
            Text('Rapport Mensuel IA', style: GoogleFonts.outfit(color: dk ? Colors.white : _C.navy, fontSize: 14, fontWeight: FontWeight.w800)),
            Text('PDF généré avec succès', style: GoogleFonts.inter(color: dk ? Colors.white60 : Colors.black54, fontSize: 10)),
          ])),
        ]),
        const SizedBox(height: 16),
        SizedBox(width: double.infinity, child: GestureDetector(
          onTap: () {
            HapticFeedback.lightImpact();
            PdfReportService.openReport(pdfPath);
          },
          child: Container(
            padding: const EdgeInsets.symmetric(vertical: 12),
            decoration: BoxDecoration(color: _C.blue, borderRadius: BorderRadius.circular(14)),
            child: Center(child: Text('📄 Ouvrir le PDF',
              style: GoogleFonts.outfit(color: Colors.white, fontSize: 14, fontWeight: FontWeight.w900)))),
        )),
      ]),
    );
  }
}
