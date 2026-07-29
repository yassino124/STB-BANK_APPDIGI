import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_animate/flutter_animate.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:provider/provider.dart';
import '../../providers/app_provider.dart';
import '../../theme/app_theme.dart';
import '../../services/auth_api_service.dart';
import 'dialogs/early_repayment_dialog.dart';
import 'dialogs/retry_late_payment_dialog.dart';

class CreditDetailScreen extends StatefulWidget {
  final Map<String, dynamic> credit;
  
  const CreditDetailScreen({super.key, required this.credit});
  
  @override
  State<CreditDetailScreen> createState() => _CreditDetailScreenState();
}

class _CreditDetailScreenState extends State<CreditDetailScreen> with TickerProviderStateMixin {
  late TabController _tabCtrl;
  int _selectedTab = 0;
  
  Map<String, dynamic>? _tableauData;
  Map<String, dynamic>? _historyData;
  
  bool _isLoadingTableau = false;
  bool _isLoadingHistory = false;
  
  @override
  void initState() {
    super.initState();
    _tabCtrl = TabController(length: 3, vsync: this);
    _tabCtrl.addListener(() {
      if (!_tabCtrl.indexIsChanging) {
        setState(() => _selectedTab = _tabCtrl.index);
        if (_selectedTab == 1 && _tableauData == null) _loadTableau();
        if (_selectedTab == 2 && _historyData == null) _loadHistory();
      }
    });
  }
  
  Future<void> _loadTableau() async {
    setState(() => _isLoadingTableau = true);
    try {
      final res = await AuthApiService.getCreditAmortizationTable(widget.credit['_id']);
      if (res.isSuccess && mounted) {
        setState(() => _tableauData = res.data);
      }
    } catch (e) {
      debugPrint('Error loading tableau: $e');
    } finally {
      if (mounted) setState(() => _isLoadingTableau = false);
    }
  }
  
  Future<void> _loadHistory() async {
    setState(() => _isLoadingHistory = true);
    try {
      final res = await AuthApiService.getCreditPaymentHistory(widget.credit['_id']);
      if (res.isSuccess && mounted) {
        setState(() => _historyData = res.data);
      }
    } catch (e) {
      debugPrint('Error loading history: $e');
    } finally {
      if (mounted) setState(() => _isLoadingHistory = false);
    }
  }
  
  @override
  void dispose() {
    _tabCtrl.dispose();
    super.dispose();
  }
  
  @override
  Widget build(BuildContext context) {
    final p = Provider.of<AppProvider>(context);
    final dk = p.themeMode == ThemeMode.dark;
    final fg = dk ? Colors.white : const Color(0xFF0F172A);
    final mt = dk ? const Color(0xFF94A3B8) : const Color(0xFF64748B);
    final cd = dk ? const Color(0xFF131E30) : Colors.white;
    final bd = dk ? const Color(0xFF1C2D44) : const Color(0xFFE8EDF5);
    final bg = dk ? const Color(0xFF0A101A) : const Color(0xFFF8FAFC);
    
    final status = widget.credit['status'] ?? 'ACTIVE';
    final isLate = status == 'LATE';
    final isClosed = status == 'CLOSED';
    
    Color statusColor = AppTheme.electricBlue;
    if (isLate) statusColor = AppTheme.coralRed;
    if (isClosed) statusColor = AppTheme.emerald;
    
    // Read from transformed field names created by credit_screen.dart
    final montantInitial = (widget.credit['montant'] as num?)?.toDouble() ?? 0.0;
    final montantRestant = (widget.credit['encours'] as num?)?.toDouble() ?? 0.0;
    final paidPct = montantInitial > 0 ? ((montantInitial - montantRestant) / montantInitial) : 0.0;
    
    return Scaffold(
      backgroundColor: bg,
      body: SafeArea(
        child: Column(
          children: [
            // Header
            Padding(
              padding: const EdgeInsets.fromLTRB(20, 16, 20, 0),
              child: Row(
                children: [
                  GestureDetector(
                    onTap: () { HapticFeedback.lightImpact(); Navigator.pop(context); },
                    child: Container(
                      width: 44, height: 44,
                      decoration: BoxDecoration(color: cd, shape: BoxShape.circle, border: Border.all(color: bd)),
                      child: Icon(Icons.arrow_back_rounded, color: fg, size: 20),
                    ),
                  ),
                  const SizedBox(width: 16),
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(widget.credit['title'] ?? 'Crédit', 
                          style: TextStyle(color: fg, fontSize: 20, fontWeight: FontWeight.w800)),
                        Text('Détails & Échéancier', 
                          style: TextStyle(color: mt, fontSize: 12, fontWeight: FontWeight.w600)),
                      ],
                    ),
                  ),
                  // Status Badge
                  Container(
                    padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
                    decoration: BoxDecoration(
                      color: statusColor.withValues(alpha: 0.15),
                      borderRadius: BorderRadius.circular(12),
                      border: Border.all(color: statusColor.withValues(alpha: 0.3)),
                    ),
                    child: Text(
                      isLate ? '⚠️ RETARD' : isClosed ? '✅ SOLDÉ' : '✓ ACTIF',
                      style: TextStyle(color: statusColor, fontSize: 10, fontWeight: FontWeight.w800),
                    ),
                  ),
                ],
              ),
            ),
            
            const SizedBox(height: 20),
            
            // Tab Bar
            Padding(
              padding: const EdgeInsets.symmetric(horizontal: 20),
              child: Container(
                height: 48,
                decoration: BoxDecoration(
                  color: cd,
                  borderRadius: BorderRadius.circular(16),
                  border: Border.all(color: bd),
                ),
                child: TabBar(
                  controller: _tabCtrl,
                  indicatorSize: TabBarIndicatorSize.tab,
                  dividerColor: Colors.transparent,
                  indicator: BoxDecoration(
                    gradient: LinearGradient(colors: [statusColor, statusColor.withValues(alpha: 0.7)]),
                    borderRadius: BorderRadius.circular(14),
                  ),
                  labelColor: Colors.white,
                  unselectedLabelColor: mt,
                  labelStyle: const TextStyle(fontSize: 13, fontWeight: FontWeight.w700),
                  tabs: const [
                    Tab(text: 'Résumé'),
                    Tab(text: 'Tableau'),
                    Tab(text: 'Historique'),
                  ],
                ),
              ),
            ),
            
            const SizedBox(height: 20),
            
            // Tab Views
            Expanded(
              child: TabBarView(
                controller: _tabCtrl,
                children: [
                  _buildResumeTab(fg, mt, cd, bd, statusColor, montantInitial, montantRestant, paidPct),
                  _buildTableauTab(fg, mt, cd, bd),
                  _buildHistoryTab(fg, mt, cd, bd),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }
  
  Widget _buildResumeTab(Color fg, Color mt, Color cd, Color bd, Color statusColor, 
    double montantInitial, double montantRestant, double paidPct) {
    
    final mensualite = (widget.credit['mensualite'] as num?)?.toDouble() ?? 0.0;
    final tauxInteret = (widget.credit['tauxInteret'] as num?)?.toDouble() ?? 0.0;
    final nombreMois = (widget.credit['nombreMois'] as num?)?.toInt() ?? 0;
    final montantInitialField = widget.credit['montantInitial'] ?? widget.credit['montant'];
    
    return SingleChildScrollView(
      padding: const EdgeInsets.symmetric(horizontal: 20),
      physics: const BouncingScrollPhysics(),
      child: Column(
        children: [
          // Gauge Card
          Container(
            padding: const EdgeInsets.all(24),
            decoration: BoxDecoration(
              color: cd,
              borderRadius: BorderRadius.circular(24),
              border: Border.all(color: bd),
            ),
            child: Column(
              children: [
                // Circular Progress
                SizedBox(
                  height: 180,
                  width: 180,
                  child: Stack(
                    alignment: Alignment.center,
                    children: [
                      Container(
                        height: 160, width: 160,
                        decoration: BoxDecoration(
                          shape: BoxShape.circle,
                          boxShadow: [BoxShadow(color: statusColor.withValues(alpha: 0.15), blurRadius: 40)],
                        ),
                      ),
                      SizedBox(
                        height: 180,
                        width: 180,
                        child: TweenAnimationBuilder<double>(
                          tween: Tween<double>(begin: 0.0, end: paidPct),
                          duration: const Duration(milliseconds: 1500),
                          curve: Curves.easeOutCubic,
                          builder: (context, value, _) {
                            return CircularProgressIndicator(
                              value: value,
                              strokeWidth: 16,
                              strokeCap: StrokeCap.round,
                              backgroundColor: statusColor.withValues(alpha: 0.1),
                              valueColor: AlwaysStoppedAnimation(statusColor),
                            );
                          },
                        ),
                      ),
                      Column(
                        mainAxisSize: MainAxisSize.min,
                        children: [
                          Text('${(paidPct * 100).toStringAsFixed(0)}%',
                            style: GoogleFonts.inter(color: fg, fontSize: 46, fontWeight: FontWeight.w900, height: 1.1)),
                          Text('PAYÉ', style: TextStyle(color: statusColor, fontSize: 12, 
                            fontWeight: FontWeight.w800, letterSpacing: 2.0)),
                        ],
                      ).animate().scale(delay: 400.ms, duration: 600.ms, curve: Curves.easeOutBack),
                    ],
                  ),
                ).animate().fadeIn(duration: 800.ms).slideY(begin: 0.1),
                
                const SizedBox(height: 32),
                
                // Stats Grid
                Row(
                  children: [
                    Expanded(
                      child: _statBox('Initial', '${montantInitial.toStringAsFixed(0)} TND', 
                        AppTheme.electricBlue, bd),
                    ),
                    const SizedBox(width: 12),
                    Expanded(
                      child: _statBox('Restant', '${montantRestant.toStringAsFixed(0)} TND', 
                        AppTheme.coralRed, bd),
                    ),
                  ],
                ),
                
                const SizedBox(height: 12),
                
                Row(
                  children: [
                    Expanded(
                      child: _statBox('Mensualité', '${mensualite.toStringAsFixed(0)} TND', 
                        const Color(0xFF8B5CF6), bd),
                    ),
                    const SizedBox(width: 12),
                    Expanded(
                      child: _statBox('Taux', '$tauxInteret%', 
                        const Color(0xFFF59E0B), bd),
                    ),
                  ],
                ).animate().fadeIn(delay: 200.ms).slideY(begin: 0.1),
              ],
            ),
          ),
          
          const SizedBox(height: 24),
          
          // Action Buttons
          if (widget.credit['status'] == 'ACTIVE') ...[
            _buildActionButton(
              'Solder Maintenant',
              Icons.flash_on_rounded,
              AppTheme.emerald,
              _showEarlyRepaymentDialog,
            ),
            const SizedBox(height: 12),
          ],
          
          if (widget.credit['status'] == 'LATE') ...[
            _buildActionButton(
              'Régulariser le Retard',
              Icons.refresh_rounded,
              AppTheme.coralRed,
              _retryLatePayment,
            ),
            const SizedBox(height: 12),
          ],
          
          const SizedBox(height: 20),
        ],
      ),
    );
  }

  
  Widget _buildTableauTab(Color fg, Color mt, Color cd, Color bd) {
    if (_isLoadingTableau) {
      return const Center(child: CircularProgressIndicator());
    }
    
    if (_tableauData == null) {
      return Center(
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            Icon(Icons.table_chart_outlined, size: 64, color: mt.withValues(alpha: 0.5)),
            const SizedBox(height: 16),
            Text('Chargement du tableau...', style: TextStyle(color: mt)),
          ],
        ),
      );
    }
    
    final tableau = _tableauData!['tableau'] as List<dynamic>? ?? [];
    
    return ListView.builder(
      padding: const EdgeInsets.symmetric(horizontal: 20),
      physics: const BouncingScrollPhysics(),
      itemCount: tableau.length,
      itemBuilder: (context, i) {
        final row = tableau[i] as Map<String, dynamic>;
        final isPaid = row['isPaid'] as bool? ?? false;
        final mois = row['mois'] as int? ?? 0;
        final capital = (row['capital'] as num?)?.toDouble() ?? 0.0;
        final interets = (row['interets'] as num?)?.toDouble() ?? 0.0;
        final mensualite = (row['mensualite'] as num?)?.toDouble() ?? 0.0;
        final soldeRestant = (row['soldeRestant'] as num?)?.toDouble() ?? 0.0;
        
        return Container(
          margin: const EdgeInsets.only(bottom: 12),
          padding: const EdgeInsets.all(16),
          decoration: BoxDecoration(
            color: cd,
            borderRadius: BorderRadius.circular(16),
            border: Border.all(color: bd),
          ),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Row(
                children: [
                  Container(
                    padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
                    decoration: BoxDecoration(
                      gradient: LinearGradient(
                        colors: isPaid 
                          ? [AppTheme.emerald.withValues(alpha: 0.2), AppTheme.emerald.withValues(alpha: 0.05)]
                          : [AppTheme.coralRed.withValues(alpha: 0.2), AppTheme.coralRed.withValues(alpha: 0.05)],
                      ),
                      borderRadius: BorderRadius.circular(10),
                      border: Border.all(color: isPaid ? AppTheme.emerald.withValues(alpha: 0.3) : AppTheme.coralRed.withValues(alpha: 0.3)),
                    ),
                    child: Row(
                      children: [
                        Icon(isPaid ? Icons.check_circle_rounded : Icons.hourglass_empty_rounded, 
                          color: isPaid ? AppTheme.emerald : AppTheme.coralRed, size: 12),
                        const SizedBox(width: 4),
                        Text(
                          isPaid ? 'Payé' : 'À venir',
                          style: TextStyle(
                            color: isPaid ? AppTheme.emerald : AppTheme.coralRed,
                            fontSize: 11,
                            fontWeight: FontWeight.w800,
                          ),
                        ),
                      ],
                    ),
                  ),
                  const Spacer(),
                  Text('Mois $mois', 
                    style: TextStyle(color: fg, fontSize: 14, fontWeight: FontWeight.w700)),
                ],
              ),
              
              const SizedBox(height: 12),
              
              _detailRow('Mensualité', '${mensualite.toStringAsFixed(2)} TND', fg, mt),
              _detailRow('Capital', '${capital.toStringAsFixed(2)} TND', fg, AppTheme.electricBlue),
              _detailRow('Intérêts', '${interets.toStringAsFixed(2)} TND', fg, AppTheme.coralRed),
              _detailRow('Solde restant', '${soldeRestant.toStringAsFixed(2)} TND', fg, mt),
            ],
          ),
        ).animate().fadeIn(delay: (i * 50).ms);
      },
    );
  }
  
  Widget _buildHistoryTab(Color fg, Color mt, Color cd, Color bd) {
    if (_isLoadingHistory) {
      return const Center(child: CircularProgressIndicator());
    }
    
    if (_historyData == null) {
      return Center(
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            Icon(Icons.history_rounded, size: 64, color: mt.withValues(alpha: 0.5)),
            const SizedBox(height: 16),
            Text('Chargement de l\'historique...', style: TextStyle(color: mt)),
          ],
        ),
      );
    }
    
    final payments = _historyData!['payments'] as List<dynamic>? ?? [];
    
    if (payments.isEmpty) {
      return Center(
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            Icon(Icons.receipt_long_outlined, size: 64, color: mt.withValues(alpha: 0.5)),
            const SizedBox(height: 16),
            Text('Aucun paiement effectué', style: TextStyle(color: mt)),
          ],
        ),
      );
    }
    
    return ListView.builder(
      padding: const EdgeInsets.symmetric(horizontal: 20),
      physics: const BouncingScrollPhysics(),
      itemCount: payments.length,
      itemBuilder: (context, i) {
        final payment = payments[i] as Map<String, dynamic>;
        final montant = (payment['montant'] as num?)?.toDouble() ?? 0.0;
        final capital = (payment['capital'] as num?)?.toDouble() ?? 0.0;
        final interets = (payment['interets'] as num?)?.toDouble() ?? 0.0;
        final mode = payment['mode'] as String? ?? '';
        final transactionRef = payment['transactionRef'] as String? ?? '';
        
        IconData modeIcon = Icons.payment_rounded;
        if (mode == 'PAYROLL') modeIcon = Icons.account_balance_wallet_rounded;
        if (mode == 'AUTO') modeIcon = Icons.schedule_rounded;
        if (mode == 'EARLY_REPAYMENT') modeIcon = Icons.flash_on_rounded;
        
        return Container(
          margin: const EdgeInsets.only(bottom: 12),
          padding: const EdgeInsets.all(16),
          decoration: BoxDecoration(
            color: cd,
            borderRadius: BorderRadius.circular(16),
            border: Border.all(color: bd),
          ),
          child: Row(
            children: [
              Container(
                width: 52,
                height: 52,
                decoration: BoxDecoration(
                  gradient: LinearGradient(
                    colors: [AppTheme.emerald.withValues(alpha: 0.2), AppTheme.emerald.withValues(alpha: 0.05)],
                    begin: Alignment.topLeft, end: Alignment.bottomRight,
                  ),
                  borderRadius: BorderRadius.circular(14),
                  border: Border.all(color: AppTheme.emerald.withValues(alpha: 0.3)),
                ),
                child: Icon(modeIcon, color: AppTheme.emerald, size: 24),
              ),
              
              const SizedBox(width: 16),
              
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text('${montant.toStringAsFixed(2)} TND',
                      style: GoogleFonts.inter(color: fg, fontSize: 17, fontWeight: FontWeight.w800)),
                    const SizedBox(height: 6),
                    Text('Capital: ${capital.toStringAsFixed(2)} • Intérêts: ${interets.toStringAsFixed(2)}',
                      style: TextStyle(color: mt, fontSize: 12, fontWeight: FontWeight.w600)),
                    if (transactionRef.isNotEmpty) ...[
                      const SizedBox(height: 4),
                      Text('Réf: $transactionRef',
                        style: TextStyle(color: mt.withValues(alpha: 0.6), fontSize: 10, fontFamily: 'Courier')),
                    ],
                  ],
                ),
              ),
            ],
          ),
        ).animate().fadeIn(delay: (i * 50).ms);
      },
    );
  }
  
  Widget _statBox(String label, String value, Color color, Color bd) {
    return Container(
      padding: const EdgeInsets.symmetric(vertical: 18, horizontal: 12),
      decoration: BoxDecoration(
        gradient: LinearGradient(
          colors: [color.withValues(alpha: 0.15), color.withValues(alpha: 0.05)],
          begin: Alignment.topLeft, end: Alignment.bottomRight,
        ),
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: color.withValues(alpha: 0.3)),
        boxShadow: [BoxShadow(color: color.withValues(alpha: 0.05), blurRadius: 10, offset: const Offset(0, 4))],
      ),
      child: Column(
        children: [
          Text(label, style: TextStyle(color: color.withValues(alpha: 0.9), 
            fontSize: 12, fontWeight: FontWeight.w800, letterSpacing: 0.5)),
          const SizedBox(height: 8),
          Text(value, style: GoogleFonts.inter(color: color, 
            fontSize: 17, fontWeight: FontWeight.w900)),
        ],
      ),
    );
  }
  
  Widget _detailRow(String label, String value, Color fg, Color vc) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 8),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Text(label, style: TextStyle(color: fg.withValues(alpha: 0.6), 
            fontSize: 12, fontWeight: FontWeight.w500)),
          Text(value, style: TextStyle(color: vc, fontSize: 12, fontWeight: FontWeight.w700)),
        ],
      ),
    );
  }
  
  Widget _buildActionButton(String label, IconData icon, Color color, VoidCallback onTap) {
    return GestureDetector(
      onTap: () {
        HapticFeedback.mediumImpact();
        onTap();
      },
      child: Container(
        padding: const EdgeInsets.symmetric(vertical: 16),
        decoration: BoxDecoration(
          gradient: LinearGradient(colors: [color, color.withValues(alpha: 0.7)]),
          borderRadius: BorderRadius.circular(16),
        ),
        child: Row(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Icon(icon, color: Colors.white, size: 20),
            const SizedBox(width: 10),
            Text(label, style: const TextStyle(color: Colors.white, 
              fontSize: 15, fontWeight: FontWeight.w800)),
          ],
        ),
      ),
    );
  }
  
  void _showEarlyRepaymentDialog() async {
    final result = await showDialog<bool>(
      context: context,
      builder: (ctx) => EarlyRepaymentDialog(creditId: widget.credit['_id']),
    );
    
    if (result == true && mounted) {
      // Refresh data
      Navigator.pop(context, true);
    }
  }
  
  void _retryLatePayment() async {
    // Get current balance from provider
    final p = Provider.of<AppProvider>(context, listen: false);
    final userProfile = p.userProfile;
    final balance = (userProfile?['compteSolde'] as num?)?.toDouble() ?? 0.0;
    final mensualite = (widget.credit['mensualite'] as num?)?.toDouble() ?? 0.0;
    
    final result = await showDialog<bool>(
      context: context,
      builder: (ctx) => RetryLatePaymentDialog(
        creditId: widget.credit['_id'],
        mensualite: mensualite,
        accountBalance: balance,
      ),
    );
    
    if (result == true && mounted) {
      // Refresh data
      Navigator.pop(context, true);
    }
  }
}
