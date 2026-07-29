import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_animate/flutter_animate.dart';
import 'package:provider/provider.dart';
import '../../providers/app_provider.dart';
import '../../theme/app_theme.dart';
import '../../viewmodels/cheques_viewmodel.dart';
import '../../models/banking_models.dart';

class ChequesScreen extends StatefulWidget {
  const ChequesScreen({super.key});

  @override
  State<ChequesScreen> createState() => _ChequesScreenState();
}

class _ChequesScreenState extends State<ChequesScreen> with SingleTickerProviderStateMixin {
  late TabController _tabController;

  @override
  void initState() {
    super.initState();
    _tabController = TabController(length: 3, vsync: this);
    WidgetsBinding.instance.addPostFrameCallback((_) {
      context.read<ChequesViewModel>().load();
    });
  }

  @override
  void dispose() {
    _tabController.dispose();
    super.dispose();
  }

  void _showDepositSuccessModal() {
    final dk = Theme.of(context).brightness == Brightness.dark;
    final fg = dk ? AppTheme.textPrimaryDark : AppTheme.textPrimaryLight;
    final cd = Theme.of(context).cardColor;
    final bd = dk ? AppTheme.borderDark : AppTheme.borderLight;

    showModalBottomSheet(
      context: context,
      backgroundColor: Colors.transparent,
      isScrollControlled: true,
      builder: (_) => Container(
        padding: const EdgeInsets.all(24),
        decoration: BoxDecoration(
          color: cd,
          borderRadius: const BorderRadius.vertical(top: Radius.circular(32)),
          border: Border.all(color: bd),
        ),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            Container(width: 40, height: 4, decoration: BoxDecoration(color: Colors.grey.withValues(alpha: 0.3), borderRadius: BorderRadius.circular(2))),
            const SizedBox(height: 24),
            Container(
              width: 64, height: 64,
              decoration: BoxDecoration(color: AppTheme.emerald.withValues(alpha: 0.1), shape: BoxShape.circle),
              child: const Icon(Icons.check_circle_rounded, color: AppTheme.emerald, size: 32),
            ).animate().scale(delay: 200.ms, duration: 400.ms, curve: Curves.easeOutBack),
            const SizedBox(height: 16),
            Text("Chèque Scanné avec Succès", style: AppTheme.title(fg)),
            const SizedBox(height: 8),
            Text("Le montant sera crédité sur votre compte après vérification (48h max).", textAlign: TextAlign.center, style: AppTheme.caption(fg.withValues(alpha: 0.6))),
            const SizedBox(height: 24),
            Container(
              padding: const EdgeInsets.all(16),
              decoration: BoxDecoration(
                color: dk ? Colors.white.withValues(alpha: 0.05) : Colors.black.withValues(alpha: 0.02),
                borderRadius: BorderRadius.circular(16),
                border: Border.all(color: bd),
              ),
              child: Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
                    Text("Montant détecté", style: AppTheme.label(fg.withValues(alpha: 0.5))),
                    const SizedBox(height: 4),
                    Text("1,450.00 TND", style: AppTheme.title(fg).copyWith(fontWeight: FontWeight.w800)),
                  ]),
                  Column(crossAxisAlignment: CrossAxisAlignment.end, children: [
                    Text("N° Chèque", style: AppTheme.label(fg.withValues(alpha: 0.5))),
                    const SizedBox(height: 4),
                    Text("9832746", style: AppTheme.body(fg).copyWith(fontWeight: FontWeight.w700)),
                  ]),
                ],
              ),
            ),
            const SizedBox(height: 24),
            GestureDetector(
              onTap: () => Navigator.pop(context),
              child: Container(
                height: 56,
                decoration: BoxDecoration(
                  gradient: AppTheme.primaryGradient,
                  borderRadius: BorderRadius.circular(16),
                ),
                child: Center(child: Text("Terminer", style: AppTheme.body(Colors.white).copyWith(fontWeight: FontWeight.w700))),
              ),
            ),
            SizedBox(height: MediaQuery.of(context).padding.bottom),
          ],
        ),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    final vm = context.watch<ChequesViewModel>();
    final p = context.watch<AppProvider>();
    final dk = p.themeMode == ThemeMode.dark;
    final fg = dk ? AppTheme.textPrimaryDark : AppTheme.textPrimaryLight;
    final cd = Theme.of(context).cardColor;
    final bd = dk ? AppTheme.borderDark : AppTheme.borderLight;
    final mt = dk ? AppTheme.textMutedDark : AppTheme.textMutedLight;

    return Scaffold(
      backgroundColor: Theme.of(context).scaffoldBackgroundColor,
      body: SafeArea(
        bottom: false,
        child: Column(
          children: [
            // Header
            Padding(
              padding: const EdgeInsets.fromLTRB(20, 20, 20, 10),
              child: Row(
                children: [
                  Container(
                    width: 44, height: 44,
                    decoration: BoxDecoration(
                      color: cd, shape: BoxShape.circle, border: Border.all(color: bd),
                      boxShadow: AppTheme.cardShadow(dk),
                    ),
                    child: const Icon(Icons.receipt_long_rounded, color: AppTheme.electricBlue, size: 22),
                  ),
                  const SizedBox(width: 16),
                  Text("Gestion Chèques", style: AppTheme.headline(fg)),
                ],
              ),
            ),

            // Tabs
            Container(
              margin: const EdgeInsets.symmetric(horizontal: 20, vertical: 10),
              padding: const EdgeInsets.all(4),
              decoration: BoxDecoration(color: cd, borderRadius: BorderRadius.circular(20), border: Border.all(color: bd)),
              child: TabBar(
                controller: _tabController,
                indicator: BoxDecoration(
                  color: dk ? Colors.white.withValues(alpha: 0.1) : Colors.black.withValues(alpha: 0.05),
                  borderRadius: BorderRadius.circular(16),
                ),
                labelColor: fg,
                unselectedLabelColor: mt,
                labelStyle: AppTheme.caption(fg).copyWith(fontWeight: FontWeight.w700),
                unselectedLabelStyle: AppTheme.caption(mt).copyWith(fontWeight: FontWeight.w600),
                indicatorSize: TabBarIndicatorSize.tab,
                dividerColor: Colors.transparent,
                onTap: (_) => HapticFeedback.selectionClick(),
                tabs: const [Tab(text: "Mes Chèques"), Tab(text: "Commander"), Tab(text: "Dépôt Digital")],
              ),
            ),

            // Tab Views
            Expanded(
              child: TabBarView(
                controller: _tabController,
                physics: const BouncingScrollPhysics(),
                children: [
                  _buildHistoryTab(vm, dk, fg, cd, bd, mt),
                  _buildOrderTab(vm, dk, fg, cd, bd, mt),
                  _buildDepositTab(vm, dk, fg, cd, bd, mt),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildHistoryTab(ChequesViewModel vm, bool dk, Color fg, Color cd, Color bd, Color mt) {
    if (vm.isLoading) {
      return const Center(child: CircularProgressIndicator(color: AppTheme.electricBlue));
    }
    return ListView(
      padding: const EdgeInsets.fromLTRB(20, 10, 20, 120),
      physics: const BouncingScrollPhysics(),
      children: [
        // Premium Mockup of a Cheque
        Container(
          width: double.infinity,
          height: 190,
          padding: const EdgeInsets.all(18),
          decoration: BoxDecoration(
            color: Colors.white,
            borderRadius: BorderRadius.circular(AppTheme.radiusCard),
            boxShadow: AppTheme.cardShadow(dk),
          ),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Row(mainAxisSize: MainAxisSize.min, children: [
                    Container(
                      width: 30, height: 30,
                      decoration: BoxDecoration(color: AppTheme.royalBlue, borderRadius: BorderRadius.circular(6)),
                      child: Center(child: Text("STB", style: AppTheme.label(Colors.white).copyWith(fontSize: 9))),
                    ),
                    const SizedBox(width: 6),
                    Text("STB BANK", style: AppTheme.label(AppTheme.royalBlue).copyWith(fontSize: 12)),
                  ]),
                  Text("N° 9832746", style: AppTheme.caption(Colors.black.withValues(alpha: 0.45)).copyWith(fontWeight: FontWeight.w600)),
                ],
              ),
              Text("Payez contre ce chèque", style: AppTheme.label(Colors.black.withValues(alpha: 0.4))),
              Text("Mille Quatre Cent Cinquante Dinars", style: const TextStyle(color: Colors.black87, fontSize: 12, fontWeight: FontWeight.w600, fontStyle: FontStyle.italic), overflow: TextOverflow.ellipsis),
              Row(
                crossAxisAlignment: CrossAxisAlignment.end,
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Flexible(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text("YASSINE WERTANI", style: AppTheme.caption(Colors.black).copyWith(fontWeight: FontWeight.w800), overflow: TextOverflow.ellipsis),
                      ],
                    ),
                  ),
                  const SizedBox(width: 8),
                  Container(
                    padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
                    decoration: BoxDecoration(border: Border.all(color: Colors.black12, width: 2), borderRadius: BorderRadius.circular(8)),
                    child: Text("# 1,450.00 #", style: AppTheme.body(Colors.black).copyWith(fontWeight: FontWeight.w900)),
                  ),
                ],
              ),
            ],
          ),
        ).animate().fadeIn(duration: 400.ms).slideY(begin: 0.1),

        const SizedBox(height: 24),
        Text("Derniers Chèques Émis", style: AppTheme.title(fg).copyWith(fontSize: 16)),
        const SizedBox(height: 16),

        ...vm.chequeRequests.map((chq) => _checkItem(chq, cd, bd, fg, mt)),
      ],
    );
  }

  Widget _checkItem(dynamic chq, Color cd, Color bd, Color fg, Color mt) {
    Color color;
    String statusLabel = '';
    switch (chq['status']) {
      case 'APPROUVE': color = AppTheme.emerald; statusLabel = 'Approuvée'; break;
      case 'EN_ATTENTE': 
      case 'PENDING': color = Colors.orange; statusLabel = 'En traitement'; break;
      case 'REFUSE': color = AppTheme.coralRed; statusLabel = 'Refusée'; break;
      default: color = Colors.grey; statusLabel = chq['status'] ?? 'Inconnu'; break;
    }
    
    final typeLabel = chq['type'] == 'CERTIFIE' ? 'Chèque Certifié' : 'Chéquier ${chq['type']} pages';
    
    return Container(
      margin: const EdgeInsets.only(bottom: 12),
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(color: cd, borderRadius: BorderRadius.circular(AppTheme.radiusMd), border: Border.all(color: bd)),
      child: Row(
        children: [
          Container(
            width: 44, height: 44, 
            decoration: BoxDecoration(color: color.withValues(alpha: 0.1), borderRadius: BorderRadius.circular(12)), 
            child: Icon(Icons.receipt_long_rounded, color: color, size: 20)
          ),
          const SizedBox(width: 14),
          Expanded(child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
            Text(typeLabel, style: AppTheme.body(fg).copyWith(fontWeight: FontWeight.w800)),
            const SizedBox(height: 2),
            Text(statusLabel, style: AppTheme.caption(color).copyWith(fontWeight: FontWeight.w600)),
          ])),
          Column(crossAxisAlignment: CrossAxisAlignment.end, children: [
            Text("Date demande", style: AppTheme.caption(mt)),
            const SizedBox(height: 2),
            Text(chq['createdAt'] != null ? chq['createdAt'].toString().substring(0, 10) : 'Récemment', style: AppTheme.body(fg).copyWith(fontWeight: FontWeight.w700)),
          ]),
        ],
      ),
    ).animate().fadeIn();
  }

  Widget _buildOrderTab(ChequesViewModel vm, bool dk, Color fg, Color cd, Color bd, Color mt) {
    return ListView(
      padding: const EdgeInsets.fromLTRB(20, 10, 20, 120),
      physics: const BouncingScrollPhysics(),
      children: [
        Text("Taille du chéquier", style: AppTheme.title(fg).copyWith(fontSize: 16)),
        const SizedBox(height: 12),
        Row(children: [
          Expanded(child: _selectionCard("25 Pages", 25, vm.selectedSize == 25, () => vm.setSize(25), cd, bd, fg)),
          const SizedBox(width: 12),
          Expanded(child: _selectionCard("50 Pages", 50, vm.selectedSize == 50, () => vm.setSize(50), cd, bd, fg)),
        ]),
        const SizedBox(height: 24),
        Text("Type de chèque", style: AppTheme.title(fg).copyWith(fontSize: 16)),
        const SizedBox(height: 12),
        Row(children: [
          Expanded(child: _selectionCard("Barré", "Barré", vm.selectedType == 'Barré', () => vm.setType('Barré'), cd, bd, fg)),
          const SizedBox(width: 12),
          Expanded(child: _selectionCard("Non-barré", "Non-barré", vm.selectedType == 'Non-barré', () => vm.setType('Non-barré'), cd, bd, fg)),
        ]),
        const SizedBox(height: 32),
        Container(
          padding: const EdgeInsets.all(20),
          decoration: BoxDecoration(
            color: AppTheme.electricBlue.withValues(alpha: 0.05),
            borderRadius: BorderRadius.circular(AppTheme.radiusLg),
            border: Border.all(color: AppTheme.electricBlue.withValues(alpha: 0.2)),
          ),
          child: Row(crossAxisAlignment: CrossAxisAlignment.start, children: [
            const Icon(Icons.info_outline_rounded, color: AppTheme.electricBlue, size: 20),
            const SizedBox(width: 10),
            Expanded(child: Text("Votre chéquier de ${vm.selectedSize} pages (${vm.selectedType}) sera disponible à votre agence principale sous 48 à 72 heures ouvrables.", style: AppTheme.caption(fg.withValues(alpha: 0.7)).copyWith(height: 1.5))),
          ]),
        ),
        const SizedBox(height: 32),
        GestureDetector(
          onTap: vm.isOrdering ? null : () async {
            HapticFeedback.mediumImpact();
            await vm.orderCheckbook();
            if (mounted) {
              ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text("Commande passée avec succès!"), backgroundColor: AppTheme.emerald));
            }
          },
          child: Container(
            height: 56,
            decoration: BoxDecoration(
              gradient: AppTheme.primaryGradient,
              borderRadius: BorderRadius.circular(16),
              boxShadow: [BoxShadow(color: AppTheme.electricBlue.withValues(alpha: 0.3), blurRadius: 12, offset: const Offset(0, 6))],
            ),
            child: Center(
              child: vm.isOrdering
                  ? const SizedBox(height: 24, width: 24, child: CircularProgressIndicator(color: Colors.white, strokeWidth: 2))
                  : Text("Confirmer la commande", style: AppTheme.body(Colors.white).copyWith(fontWeight: FontWeight.w700)),
            ),
          ),
        ),
      ],
    );
  }

  Widget _selectionCard(String title, dynamic value, bool isSelected, VoidCallback onTap, Color cd, Color bd, Color fg) {
    return GestureDetector(
      onTap: () { HapticFeedback.selectionClick(); onTap(); },
      child: AnimatedContainer(
        duration: const Duration(milliseconds: 200),
        padding: const EdgeInsets.symmetric(vertical: 20),
        decoration: BoxDecoration(
          color: isSelected ? AppTheme.electricBlue.withValues(alpha: 0.1) : cd,
          borderRadius: BorderRadius.circular(20),
          border: Border.all(color: isSelected ? AppTheme.electricBlue : bd, width: isSelected ? 2 : 1),
        ),
        child: Center(child: Text(title, style: AppTheme.body(isSelected ? AppTheme.electricBlue : fg).copyWith(fontWeight: FontWeight.w700))),
      ),
    );
  }

  Widget _buildDepositTab(ChequesViewModel vm, bool dk, Color fg, Color cd, Color bd, Color mt) {
    return Padding(
      padding: const EdgeInsets.fromLTRB(20, 10, 20, 120),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.center,
        children: [
          Text("Scanner votre chèque", style: AppTheme.title(fg).copyWith(fontSize: 16)),
          const SizedBox(height: 8),
          Text("Placez le chèque dans le cadre ci-dessous", style: AppTheme.caption(mt)),
          const SizedBox(height: 24),
          Expanded(
            child: Container(
              width: double.infinity,
              decoration: BoxDecoration(
                color: Colors.black.withValues(alpha: dk ? 0.4 : 0.8),
                borderRadius: BorderRadius.circular(AppTheme.radiusCard),
                border: Border.all(color: bd),
              ),
              child: Stack(
                alignment: Alignment.center,
                children: [
                  Positioned(
                    top: 40, left: 20, right: 20, bottom: 40,
                    child: Container(
                      decoration: BoxDecoration(
                        border: Border.all(color: AppTheme.electricBlue.withValues(alpha: 0.5), width: 2),
                        borderRadius: BorderRadius.circular(16),
                      ),
                    ),
                  ),
                  if (vm.isScanning)
                    Positioned(
                      top: 40 + (vm.scanProgress * 200),
                      left: 20, right: 20,
                      child: Container(
                        height: 3,
                        decoration: BoxDecoration(
                          color: AppTheme.turquoise,
                          boxShadow: [BoxShadow(color: AppTheme.turquoise.withValues(alpha: 0.8), blurRadius: 8, spreadRadius: 2)],
                        ),
                      ),
                    ),
                  if (!vm.isScanning)
                    const Icon(Icons.document_scanner_rounded, color: Colors.white54, size: 48),
                ],
              ),
            ),
          ),
          const SizedBox(height: 24),
          GestureDetector(
            onTap: vm.isScanning ? null : () {
              HapticFeedback.heavyImpact();
              vm.startScan(() {
                HapticFeedback.heavyImpact();
                _showDepositSuccessModal();
              });
            },
            child: AnimatedContainer(
              duration: const Duration(milliseconds: 300),
              height: 64, width: 64,
              decoration: BoxDecoration(
                color: vm.isScanning ? Colors.grey : Colors.white,
                shape: BoxShape.circle,
                boxShadow: [BoxShadow(color: Colors.black.withValues(alpha: 0.2), blurRadius: 10, offset: const Offset(0, 4))],
              ),
              child: Stack(alignment: Alignment.center, children: [
                if (vm.isScanning)
                  SizedBox(width: 64, height: 64, child: CircularProgressIndicator(value: vm.scanProgress, color: AppTheme.electricBlue, strokeWidth: 4)),
                Container(width: 52, height: 52, decoration: BoxDecoration(color: vm.isScanning ? Colors.transparent : Colors.white, shape: BoxShape.circle, border: Border.all(color: Colors.black12, width: 2))),
              ]),
            ),
          ),
        ],
      ),
    );
  }
}
