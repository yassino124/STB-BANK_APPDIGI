import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_animate/flutter_animate.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:provider/provider.dart';
import '../../../providers/app_provider.dart';
import '../../../theme/app_theme.dart';
import '../../../services/auth_api_service.dart';

class EarlyRepaymentDialog extends StatefulWidget {
  final String creditId;
  
  const EarlyRepaymentDialog({super.key, required this.creditId});
  
  @override
  State<EarlyRepaymentDialog> createState() => _EarlyRepaymentDialogState();
}

class _EarlyRepaymentDialogState extends State<EarlyRepaymentDialog> {
  final _pinCtrl = TextEditingController();
  bool _isLoadingCalc = true;
  bool _isProcessing = false;
  Map<String, dynamic>? _calculation;
  String _errorMsg = '';
  
  @override
  void initState() {
    super.initState();
    _loadCalculation();
  }
  
  Future<void> _loadCalculation() async {
    setState(() => _isLoadingCalc = true);
    try {
      final res = await AuthApiService.calculateEarlyRepayment(widget.creditId);
      if (res.isSuccess && mounted) {
        setState(() {
          _calculation = res.data;
          _errorMsg = '';
        });
      } else {
        setState(() => _errorMsg = res.error ?? 'Erreur de calcul');
      }
    } catch (e) {
      setState(() => _errorMsg = 'Erreur réseau');
    } finally {
      if (mounted) setState(() => _isLoadingCalc = false);
    }
  }
  
  Future<void> _confirmRepayment() async {
    if (_pinCtrl.text.length != 4) {
      setState(() => _errorMsg = 'Code PIN à 4 chiffres requis');
      return;
    }
    
    setState(() {
      _isProcessing = true;
      _errorMsg = '';
    });
    
    try {
      final res = await AuthApiService.performEarlyRepayment(widget.creditId, _pinCtrl.text);
      if (res.isSuccess && mounted) {
        Navigator.pop(context, true); // Return success
        _showSuccessAnimation();
      } else {
        setState(() => _errorMsg = res.error ?? 'Échec du remboursement');
      }
    } catch (e) {
      setState(() => _errorMsg = 'Erreur réseau');
    } finally {
      if (mounted) setState(() => _isProcessing = false);
    }
  }
  
  void _showSuccessAnimation() {
    showDialog(
      context: context,
      barrierDismissible: false,
      builder: (ctx) => _SuccessDialog(),
    );
  }
  
  @override
  void dispose() {
    _pinCtrl.dispose();
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
    
    return Dialog(
      backgroundColor: Colors.transparent,
      child: Container(
        constraints: const BoxConstraints(maxWidth: 400),
        decoration: BoxDecoration(
          color: cd,
          borderRadius: BorderRadius.circular(28),
          border: Border.all(color: bd),
        ),
        child: _isLoadingCalc 
          ? _buildLoading(fg, mt)
          : _calculation == null 
            ? _buildError(fg, mt, bd)
            : _buildContent(fg, mt, cd, bd, bg),
      ),
    ).animate().scale(duration: 300.ms, curve: Curves.easeOutBack);
  }
  
  Widget _buildLoading(Color fg, Color mt) {
    return Padding(
      padding: const EdgeInsets.all(40),
      child: Column(
        mainAxisSize: MainAxisSize.min,
        children: [
          CircularProgressIndicator(color: AppTheme.emerald),
          const SizedBox(height: 20),
          Text('Calcul en cours...', 
            style: TextStyle(color: mt, fontSize: 14, fontWeight: FontWeight.w600)),
        ],
      ),
    );
  }
  
  Widget _buildError(Color fg, Color mt, Color bd) {
    return Padding(
      padding: const EdgeInsets.all(24),
      child: Column(
        mainAxisSize: MainAxisSize.min,
        children: [
          Icon(Icons.error_outline_rounded, size: 64, color: AppTheme.coralRed),
          const SizedBox(height: 16),
          Text(_errorMsg, 
            style: TextStyle(color: fg, fontSize: 16, fontWeight: FontWeight.w700),
            textAlign: TextAlign.center),
          const SizedBox(height: 24),
          GestureDetector(
            onTap: () => Navigator.pop(context),
            child: Container(
              width: double.infinity,
              height: 50,
              decoration: BoxDecoration(
                color: bd,
                borderRadius: BorderRadius.circular(16),
              ),
              child: Center(
                child: Text('Fermer',
                  style: TextStyle(color: fg, fontSize: 15, fontWeight: FontWeight.w700)),
              ),
            ),
          ),
        ],
      ),
    );
  }
  
  Widget _buildContent(Color fg, Color mt, Color cd, Color bd, Color bg) {
    final capitalRestant = (_calculation!['capitalRestant'] as num?)?.toDouble() ?? 0.0;
    final fraisRemboursement = (_calculation!['fraisRemboursement'] as num?)?.toDouble() ?? 0.0;
    final totalAPayer = (_calculation!['totalAPayer'] as num?)?.toDouble() ?? 0.0;
    final interetsRestantsTheorique = (_calculation!['interetsRestantsTheorique'] as num?)?.toDouble() ?? 0.0;
    final economieInterets = (_calculation!['economieInterets'] as num?)?.toDouble() ?? 0.0;
    final economieNette = (_calculation!['economieNette'] as num?)?.toDouble() ?? 0.0;
    
    return SingleChildScrollView(
      padding: const EdgeInsets.all(24),
      child: Column(
        mainAxisSize: MainAxisSize.min,
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // Header
          Row(
            children: [
              Container(
                width: 56,
                height: 56,
                decoration: BoxDecoration(
                  gradient: LinearGradient(
                    colors: [AppTheme.emerald, AppTheme.emerald.withValues(alpha: 0.7)],
                  ),
                  borderRadius: BorderRadius.circular(16),
                ),
                child: const Icon(Icons.flash_on_rounded, color: Colors.white, size: 28),
              ),
              const SizedBox(width: 16),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text('Remboursement Anticipé',
                      style: TextStyle(color: fg, fontSize: 18, fontWeight: FontWeight.w800)),
                    Text('Solder votre crédit',
                      style: TextStyle(color: mt, fontSize: 12, fontWeight: FontWeight.w600)),
                  ],
                ),
              ),
              GestureDetector(
                onTap: () => Navigator.pop(context),
                child: Container(
                  width: 36,
                  height: 36,
                  decoration: BoxDecoration(
                    color: bd,
                    shape: BoxShape.circle,
                  ),
                  child: Icon(Icons.close_rounded, color: mt, size: 18),
                ),
              ),
            ],
          ),
          
          const SizedBox(height: 24),
          
          // Preview Card
          Container(
            padding: const EdgeInsets.all(20),
            decoration: BoxDecoration(
              gradient: LinearGradient(
                colors: [
                  AppTheme.emerald.withValues(alpha: 0.15),
                  AppTheme.emerald.withValues(alpha: 0.05),
                ],
                begin: Alignment.topLeft,
                end: Alignment.bottomRight,
              ),
              borderRadius: BorderRadius.circular(20),
              border: Border.all(color: AppTheme.emerald.withValues(alpha: 0.3)),
            ),
            child: Column(
              children: [
                _previewRow('Capital restant', capitalRestant, fg, AppTheme.electricBlue),
                _previewRow('Frais (1%)', fraisRemboursement, fg, AppTheme.coralRed),
                const SizedBox(height: 12),
                Divider(color: bd, height: 1),
                const SizedBox(height: 12),
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Text('Total à payer', 
                      style: TextStyle(color: fg, fontSize: 15, fontWeight: FontWeight.w800)),
                    Text('${totalAPayer.toStringAsFixed(2)} TND',
                      style: GoogleFonts.inter(color: AppTheme.emerald, 
                        fontSize: 20, fontWeight: FontWeight.w900)),
                  ],
                ),
              ],
            ),
          ),
          
          const SizedBox(height: 16),
          
          // Savings Card
          Container(
            padding: const EdgeInsets.all(16),
            decoration: BoxDecoration(
              color: AppTheme.emerald.withValues(alpha: 0.1),
              borderRadius: BorderRadius.circular(16),
              border: Border.all(color: AppTheme.emerald.withValues(alpha: 0.25)),
            ),
            child: Column(
              children: [
                Row(
                  children: [
                    Icon(Icons.savings_rounded, color: AppTheme.emerald, size: 20),
                    const SizedBox(width: 8),
                    Text('Économies réalisées',
                      style: TextStyle(color: AppTheme.emerald, fontSize: 13, fontWeight: FontWeight.w700)),
                  ],
                ),
                const SizedBox(height: 12),
                _savingRow('Intérêts évités', economieInterets, fg),
                _savingRow('Économie nette', economieNette, AppTheme.emerald),
              ],
            ),
          ),
          
          const SizedBox(height: 24),
          
          // PIN Input
          Text('Code PIN de confirmation',
            style: TextStyle(color: fg, fontSize: 14, fontWeight: FontWeight.w700)),
          const SizedBox(height: 12),
          TextField(
            controller: _pinCtrl,
            keyboardType: TextInputType.number,
            maxLength: 4,
            obscureText: true,
            style: TextStyle(color: fg, fontSize: 24, fontWeight: FontWeight.w700, letterSpacing: 8),
            textAlign: TextAlign.center,
            decoration: InputDecoration(
              filled: true,
              fillColor: bg,
              counterText: '',
              hintText: '••••',
              hintStyle: TextStyle(color: mt.withValues(alpha: 0.5)),
              border: OutlineInputBorder(
                borderRadius: BorderRadius.circular(16),
                borderSide: BorderSide(color: bd),
              ),
              enabledBorder: OutlineInputBorder(
                borderRadius: BorderRadius.circular(16),
                borderSide: BorderSide(color: bd),
              ),
              focusedBorder: OutlineInputBorder(
                borderRadius: BorderRadius.circular(16),
                borderSide: BorderSide(color: AppTheme.emerald, width: 2),
              ),
            ),
            onChanged: (_) {
              if (_errorMsg.isNotEmpty) setState(() => _errorMsg = '');
            },
          ),
          
          if (_errorMsg.isNotEmpty) ...[
            const SizedBox(height: 12),
            Container(
              padding: const EdgeInsets.all(12),
              decoration: BoxDecoration(
                color: AppTheme.coralRed.withValues(alpha: 0.1),
                borderRadius: BorderRadius.circular(12),
              ),
              child: Row(
                children: [
                  Icon(Icons.error_outline_rounded, color: AppTheme.coralRed, size: 18),
                  const SizedBox(width: 8),
                  Expanded(
                    child: Text(_errorMsg,
                      style: TextStyle(color: AppTheme.coralRed, fontSize: 12, fontWeight: FontWeight.w600)),
                  ),
                ],
              ),
            ),
          ],
          
          const SizedBox(height: 24),
          
          // Action Buttons
          Row(
            children: [
              Expanded(
                child: GestureDetector(
                  onTap: () => Navigator.pop(context),
                  child: Container(
                    height: 50,
                    decoration: BoxDecoration(
                      color: bd,
                      borderRadius: BorderRadius.circular(16),
                    ),
                    child: Center(
                      child: Text('Annuler',
                        style: TextStyle(color: fg, fontSize: 15, fontWeight: FontWeight.w700)),
                    ),
                  ),
                ),
              ),
              const SizedBox(width: 12),
              Expanded(
                child: GestureDetector(
                  onTap: _isProcessing || _pinCtrl.text.length != 4 ? null : _confirmRepayment,
                  child: Container(
                    height: 50,
                    decoration: BoxDecoration(
                      gradient: _isProcessing || _pinCtrl.text.length != 4
                        ? null
                        : LinearGradient(colors: [AppTheme.emerald, AppTheme.emerald.withValues(alpha: 0.7)]),
                      color: _isProcessing || _pinCtrl.text.length != 4 ? Colors.grey.withValues(alpha: 0.3) : null,
                      borderRadius: BorderRadius.circular(16),
                    ),
                    child: Center(
                      child: Text(_isProcessing ? 'Traitement...' : 'Confirmer',
                        style: TextStyle(
                          color: _isProcessing || _pinCtrl.text.length != 4 ? mt : Colors.white,
                          fontSize: 15,
                          fontWeight: FontWeight.w700,
                        )),
                    ),
                  ),
                ),
              ),
            ],
          ),
        ],
      ),
    );
  }
  
  Widget _previewRow(String label, double value, Color fg, Color vc) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 10),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Text(label, style: TextStyle(color: fg.withValues(alpha: 0.7), 
            fontSize: 13, fontWeight: FontWeight.w600)),
          Text('${value.toStringAsFixed(2)} TND',
            style: TextStyle(color: vc, fontSize: 14, fontWeight: FontWeight.w800)),
        ],
      ),
    );
  }
  
  Widget _savingRow(String label, double value, Color vc) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 8),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Text(label, style: TextStyle(color: vc.withValues(alpha: 0.8), 
            fontSize: 12, fontWeight: FontWeight.w600)),
          Text('${value.toStringAsFixed(2)} TND',
            style: TextStyle(color: vc, fontSize: 13, fontWeight: FontWeight.w800)),
        ],
      ),
    );
  }
}

class _SuccessDialog extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    return Dialog(
      backgroundColor: Colors.transparent,
      child: Container(
        padding: const EdgeInsets.all(32),
        decoration: BoxDecoration(
          color: Colors.white,
          borderRadius: BorderRadius.circular(28),
        ),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            Container(
              width: 80,
              height: 80,
              decoration: BoxDecoration(
                gradient: LinearGradient(
                  colors: [AppTheme.emerald, AppTheme.emerald.withValues(alpha: 0.7)],
                ),
                shape: BoxShape.circle,
              ),
              child: const Icon(Icons.check_rounded, color: Colors.white, size: 48),
            ).animate().scale(duration: 500.ms, curve: Curves.elasticOut),
            
            const SizedBox(height: 24),
            
            Text('Crédit Soldé!',
              style: TextStyle(color: AppTheme.emerald, fontSize: 24, fontWeight: FontWeight.w900)),
            
            const SizedBox(height: 12),
            
            Text('Votre crédit a été remboursé avec succès',
              style: const TextStyle(color: Color(0xFF64748B), fontSize: 14, fontWeight: FontWeight.w600),
              textAlign: TextAlign.center),
            
            const SizedBox(height: 28),
            
            GestureDetector(
              onTap: () {
                Navigator.pop(context); // Close success dialog
                Navigator.pop(context, true); // Close detail screen with refresh flag
              },
              child: Container(
                width: double.infinity,
                height: 50,
                decoration: BoxDecoration(
                  gradient: LinearGradient(colors: [AppTheme.emerald, AppTheme.emerald.withValues(alpha: 0.7)]),
                  borderRadius: BorderRadius.circular(16),
                ),
                child: const Center(
                  child: Text('Fermer',
                    style: TextStyle(color: Colors.white, fontSize: 15, fontWeight: FontWeight.w700)),
                ),
              ),
            ),
          ],
        ),
      ),
    ).animate().scale(delay: 200.ms, duration: 400.ms, curve: Curves.elasticOut);
  }
}
