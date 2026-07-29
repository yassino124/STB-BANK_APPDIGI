import 'package:flutter/material.dart';
import 'package:flutter_animate/flutter_animate.dart';
import 'package:provider/provider.dart';
import '../../providers/app_provider.dart';
import '../../theme/app_theme.dart';
import '../../../services/auth_api_service.dart';

class QrPaymentsScreen extends StatefulWidget {
  const QrPaymentsScreen({super.key});

  @override
  State<QrPaymentsScreen> createState() => _QrPaymentsScreenState();
}

class _QrPaymentsScreenState extends State<QrPaymentsScreen> {
  List<dynamic> _qrPayments = [];
  bool _loading = true;

  @override
  void initState() {
    super.initState();
    _fetchQrPayments();
  }

  Future<void> _fetchQrPayments() async {
    final res = await AuthApiService.getQrPayments();
    if (mounted) {
      setState(() {
        _qrPayments = res.data ?? [];
        _loading = false;
      });
    }
  }

  @override
  Widget build(BuildContext context) {
    final p = Provider.of<AppProvider>(context);
    final dk = p.themeMode == ThemeMode.dark;

    return Scaffold(
      backgroundColor: dk ? AppTheme.bgDark : AppTheme.bgLight,
      body: SafeArea(
        child: _loading
            ? const Center(child: CircularProgressIndicator(color: AppTheme.electricBlue))
            : CustomScrollView(
                slivers: [
                  SliverToBoxAdapter(
                    child: Padding(
                      padding: const EdgeInsets.all(20),
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Row(
                            mainAxisAlignment: MainAxisAlignment.spaceBetween,
                            children: [
                              Column(
                                crossAxisAlignment: CrossAxisAlignment.start,
                                children: [
                                  Text(
                                    'QR Payments',
                                    style: (dk ? AppTheme.h1Dark : AppTheme.h1Light).copyWith(fontSize: 28),
                                  ),
                                  const SizedBox(height: 4),
                                  Text(
                                    'Scan and pay with QR',
                                    style: (dk ? AppTheme.bodyDark : AppTheme.bodyLight).copyWith(color: AppTheme.textMutedLight),
                                  ),
                                ],
                              ),
                              Container(
                                padding: const EdgeInsets.all(12),
                                decoration: BoxDecoration(
                                  gradient: const LinearGradient(
                                    colors: [AppTheme.electricBlue, Color(0xFF7C3AED)],
                                    begin: Alignment.topLeft, end: Alignment.bottomRight,
                                  ),
                                  borderRadius: BorderRadius.circular(16),
                                  boxShadow: [BoxShadow(color: AppTheme.electricBlue.withValues(alpha: 0.3), blurRadius: 12, offset: const Offset(0, 4))],
                                ),
                                child: const Icon(Icons.qr_code_scanner_rounded, color: Colors.white, size: 22),
                              ),
                            ],
                          ),
                          const SizedBox(height: 24),
                        ],
                      ),
                    ),
                  ),
                  if (_qrPayments.isEmpty)
                    SliverFillRemaining(
                      child: Center(
                        child: Column(
                          mainAxisAlignment: MainAxisAlignment.center,
                          children: [
                            Icon(Icons.qr_code_scanner_rounded, size: 64, color: dk ? Colors.white.withValues(alpha: 0.1) : Colors.black.withValues(alpha: 0.1)),
                            const SizedBox(height: 16),
                            Text('No QR payments yet', style: (dk ? AppTheme.bodyDark : AppTheme.bodyLight).copyWith(color: AppTheme.textMutedLight)),
                          ],
                        ),
                      ),
                    )
                  else
                    SliverPadding(
                      padding: const EdgeInsets.symmetric(horizontal: 20),
                      sliver: SliverList(
                        delegate: SliverChildBuilderDelegate(
                          (context, index) {
                            final qr = _qrPayments[index];
                            return _QrPaymentCard(qrPayment: qr, isDark: dk).animate().fadeIn(delay: (index * 80).ms).slideY(begin: 0.2);
                          },
                          childCount: _qrPayments.length,
                        ),
                      ),
                    ),
                  const SliverToBoxAdapter(child: SizedBox(height: 100)),
                ],
              ),
      ),
    );
  }
}

class _QrPaymentCard extends StatelessWidget {
  final Map<String, dynamic> qrPayment;
  final bool isDark;

  const _QrPaymentCard({required this.qrPayment, required this.isDark});

  @override
  Widget build(BuildContext context) {
    final type = qrPayment['type'] ?? 'STATIC';
    final amount = qrPayment['amount']?.toDouble() ?? 0;
    final merchantName = qrPayment['merchantName'] ?? 'Merchant';
    final status = qrPayment['status'] ?? 'PENDING';
    final date = qrPayment['createdAt'] != null ? DateTime.parse(qrPayment['createdAt']) : DateTime.now();

    Color statusColor;
    switch (status) {
      case 'COMPLETED': statusColor = AppTheme.emerald; break;
      case 'PENDING': statusColor = AppTheme.amber; break;
      case 'EXPIRED': statusColor = AppTheme.danger; break;
      case 'CANCELLED': statusColor = AppTheme.textMutedLight; break;
      default: statusColor = AppTheme.textMutedLight;
    }

    return Container(
      margin: const EdgeInsets.only(bottom: 12),
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: isDark ? const Color(0xFF1A1F2E) : Colors.white,
        borderRadius: BorderRadius.circular(20),
        border: Border.all(color: isDark ? Colors.white.withValues(alpha: 0.06) : Colors.black.withValues(alpha: 0.04)),
        boxShadow: [BoxShadow(color: isDark ? Colors.black.withValues(alpha: 0.2) : Colors.black.withValues(alpha: 0.05), blurRadius: 16, offset: const Offset(0, 4))],
      ),
      child: Row(
        children: [
          Container(
            width: 48,
            height: 48,
            decoration: BoxDecoration(
              gradient: LinearGradient(colors: [AppTheme.electricBlue, Color(0xFF7C3AED)]),
              borderRadius: BorderRadius.circular(14),
            ),
            child: const Icon(Icons.qr_code_rounded, color: Colors.white, size: 24),
          ),
          const SizedBox(width: 14),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(merchantName, style: (isDark ? AppTheme.bodyDark : AppTheme.bodyLight).copyWith(fontWeight: FontWeight.w800, fontSize: 15)),
                const SizedBox(height: 2),
                Text(type, style: (isDark ? AppTheme.bodyDark : AppTheme.bodyLight).copyWith(color: AppTheme.textMutedLight, fontSize: 12)),
              ],
            ),
          ),
          Column(
            crossAxisAlignment: CrossAxisAlignment.end,
            children: [
              Text('${amount.toStringAsFixed(2)} TND', style: (isDark ? AppTheme.bodyDark : AppTheme.bodyLight).copyWith(fontWeight: FontWeight.w900, fontSize: 16, color: AppTheme.electricBlue)),
              const SizedBox(height: 2),
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 2),
                decoration: BoxDecoration(color: statusColor.withValues(alpha: 0.1), borderRadius: BorderRadius.circular(6)),
                child: Text(status, style: TextStyle(color: statusColor, fontSize: 10, fontWeight: FontWeight.w800)),
              ),
            ],
          ),
        ],
      ),
    );
  }
}
