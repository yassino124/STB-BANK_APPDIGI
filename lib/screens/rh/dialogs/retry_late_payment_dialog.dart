import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_animate/flutter_animate.dart';
import 'package:provider/provider.dart';
import '../../../providers/app_provider.dart';
import '../../../theme/app_theme.dart';
import '../../../services/auth_api_service.dart';

class RetryLatePaymentDialog extends StatefulWidget {
  final String creditId;
  final double mensualite;
  final double accountBalance;
  
  const RetryLatePaymentDialog({
    super.key,
    required this.creditId,
    required this.mensualite,
    required this.accountBalance,
  });
  
  @override
  State<RetryLatePaymentDialog> createState() => _RetryLatePaymentDialogState();
}

class _RetryLatePaymentDialogState extends State<RetryLatePaymentDialog> {
  final _pinCtrl = TextEditingController();
  bool _isProcessing = false;
  String _errorMsg = '';
  
  bool get _hasSufficientBalance => widget.accountBalance >= widget.mensualite;
  
  Future<void> _confirmRetry() async {
    if (!_hasSufficientBalance) {
      setState(() => _errorMsg = 'Solde insuffisant');
      return;
    }
    
    if (_pinCtrl.text.length != 4) {
      setState(() => _errorMsg = 'Code PIN à 4 chiffres requis');
      return;
    }
    
    setState(() {
      _isProcessing = true;
      _errorMsg = '';
    });
    
    try {
      // Call retry endpoint
      final res = await AuthApiService.retryLatePayment(widget.creditId, _pinCtrl.text);
      if (res.isSuccess && mounted) {
        Navigator.pop(context, true); // Return success
        _showSuccessAnimation();
      } else {
        setState(() => _errorMsg = res.error ?? 'Échec de la régularisation');
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
        child: SingleChildScrollView(
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
                        colors: [AppTheme.coralRed, AppTheme.coralRed.withValues(alpha: 0.7)],
                      ),
                      borderRadius: BorderRadius.circular(16),
                    ),
                    child: const Icon(Icons.refresh_rounded, color: Colors.white, size: 28),
                  ),
                  const SizedBox(width: 16),
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text('Régulariser le Retard',
                          style: TextStyle(color: fg, fontSize: 18, fontWeight: FontWeight.w800)),
                        Text('Traiter le paiement en retard',
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
              
              // Balance Check Card
              Container(
                padding: const EdgeInsets.all(20),
                decoration: BoxDecoration(
                  color: _hasSufficientBalance 
                    ? AppTheme.emerald.withValues(alpha: 0.1)
                    : AppTheme.coralRed.withValues(alpha: 0.1),
                  borderRadius: BorderRadius.circular(20),
                  border: Border.all(
                    color: _hasSufficientBalance 
                      ? AppTheme.emerald.withValues(alpha: 0.3)
                      : AppTheme.coralRed.withValues(alpha: 0.3),
                  ),
                ),
                child: Column(
                  children: [
                    Row(
                      children: [
                        Icon(
                          _hasSufficientBalance ? Icons.check_circle_rounded : Icons.warning_rounded,
                          color: _hasSufficientBalance ? AppTheme.emerald : AppTheme.coralRed,
                          size: 24,
                        ),
                        const SizedBox(width: 12),
                        Expanded(
                          child: Text(
                            _hasSufficientBalance ? 'Solde suffisant' : 'Solde insuffisant',
                            style: TextStyle(
                              color: _hasSufficientBalance ? AppTheme.emerald : AppTheme.coralRed,
                              fontSize: 14,
                              fontWeight: FontWeight.w800,
                            ),
                          ),
                        ),
                      ],
                    ),
                    
                    const SizedBox(height: 16),
                    
                    _detailRow('Mensualité à payer', widget.mensualite, fg, AppTheme.coralRed),
                    _detailRow('Solde disponible', widget.accountBalance, fg, 
                      _hasSufficientBalance ? AppTheme.emerald : AppTheme.coralRed),
                    
                    if (!_hasSufficientBalance) ...[
                      const SizedBox(height: 12),
                      Container(
                        padding: const EdgeInsets.all(12),
                        decoration: BoxDecoration(
                          color: AppTheme.coralRed.withValues(alpha: 0.1),
                          borderRadius: BorderRadius.circular(12),
                        ),
                        child: Row(
                          children: [
                            Icon(Icons.info_outline_rounded, color: AppTheme.coralRed, size: 18),
                            const SizedBox(width: 8),
                            Expanded(
                              child: Text(
                                'Manque: ${(widget.mensualite - widget.accountBalance).toStringAsFixed(2)} TND',
                                style: TextStyle(
                                  color: AppTheme.coralRed,
                                  fontSize: 12,
                                  fontWeight: FontWeight.w700,
                                ),
                              ),
                            ),
                          ],
                        ),
                      ),
                    ],
                  ],
                ),
              ),
              
              if (!_hasSufficientBalance) ...[
                const SizedBox(height: 16),
                Container(
                  padding: const EdgeInsets.all(16),
                  decoration: BoxDecoration(
                    color: bg,
                    borderRadius: BorderRadius.circular(16),
                    border: Border.all(color: bd),
                  ),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text('💡 Conseil',
                        style: TextStyle(color: fg, fontSize: 13, fontWeight: FontWeight.w800)),
                      const SizedBox(height: 8),
                      Text(
                        'Alimentez votre compte puis réessayez. Les pénalités continuent de s\'accumuler quotidiennement.',
                        style: TextStyle(color: mt, fontSize: 12, fontWeight: FontWeight.w500),
                      ),
                    ],
                  ),
                ),
              ],
              
              if (_hasSufficientBalance) ...[
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
                      borderSide: BorderSide(color: AppTheme.coralRed, width: 2),
                    ),
                  ),
                  onChanged: (_) {
                    if (_errorMsg.isNotEmpty) setState(() => _errorMsg = '');
                  },
                ),
              ],
              
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
                      onTap: _isProcessing ? null : () => Navigator.pop(context),
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
                  if (_hasSufficientBalance) ...[
                    const SizedBox(width: 12),
                    Expanded(
                      child: GestureDetector(
                        onTap: _isProcessing || _pinCtrl.text.length != 4 ? null : _confirmRetry,
                        child: Container(
                          height: 50,
                          decoration: BoxDecoration(
                            gradient: _isProcessing || _pinCtrl.text.length != 4
                              ? null
                              : LinearGradient(colors: [AppTheme.coralRed, AppTheme.coralRed.withValues(alpha: 0.7)]),
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
                ],
              ),
            ],
          ),
        ),
      ),
    ).animate().scale(duration: 300.ms, curve: Curves.easeOutBack);
  }
  
  Widget _detailRow(String label, double value, Color fg, Color vc) {
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
            
            Text('Paiement Régularisé!',
              style: TextStyle(color: AppTheme.emerald, fontSize: 24, fontWeight: FontWeight.w900)),
            
            const SizedBox(height: 12),
            
            Text('Le retard a été traité avec succès',
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
