import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_animate/flutter_animate.dart';
import 'package:provider/provider.dart';
import '../../providers/app_provider.dart';
import '../../theme/app_theme.dart';
import '../../../services/auth_api_service.dart';

class InvestmentsScreen extends StatefulWidget {
  const InvestmentsScreen({super.key});

  @override
  State<InvestmentsScreen> createState() => _InvestmentsScreenState();
}

class _InvestmentsScreenState extends State<InvestmentsScreen> {
  List<dynamic> _investments = [];
  bool _loading = true;

  @override
  void initState() {
    super.initState();
    _fetchInvestments();
  }

  Future<void> _fetchInvestments() async {
    final res = await AuthApiService.getInvestments();
    if (mounted) {
      setState(() {
        _investments = res.data ?? [];
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
                                    p.translate('analytics'),
                                    style: (dk ? AppTheme.h1Dark : AppTheme.h1Light).copyWith(fontSize: 28),
                                  ),
                                  const SizedBox(height: 4),
                                  Text(
                                    'Track your portfolio',
                                    style: (dk ? AppTheme.bodyDark : AppTheme.bodyLight).copyWith(color: AppTheme.textMutedLight),
                                  ),
                                ],
                              ),
                            ],
                          ),
                          const SizedBox(height: 24),
                        ],
                      ),
                    ),
                  ),
                  if (_investments.isEmpty)
                    SliverFillRemaining(
                      child: Center(
                        child: Column(
                          mainAxisAlignment: MainAxisAlignment.center,
                          children: [
                            Icon(Icons.account_balance_wallet_rounded, size: 64, color: dk ? Colors.white.withValues(alpha: 0.1) : Colors.black.withValues(alpha: 0.1)),
                            const SizedBox(height: 16),
                            Text('No investments yet', style: (dk ? AppTheme.bodyDark : AppTheme.bodyLight).copyWith(color: AppTheme.textMutedLight)),
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
                            final inv = _investments[index];
                            return _InvestmentCard(investment: inv, isDark: dk).animate().fadeIn(delay: (index * 80).ms).slideY(begin: 0.2);
                          },
                          childCount: _investments.length,
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

class _InvestmentCard extends StatelessWidget {
  final Map<String, dynamic> investment;
  final bool isDark;

  const _InvestmentCard({required this.investment, required this.isDark});

  @override
  Widget build(BuildContext context) {
    final type = investment['type'] ?? 'INVESTMENT';
    final name = investment['name'] ?? 'Investment';
    final initial = investment['initialAmount']?.toDouble() ?? 0;
    final current = investment['currentValue']?.toDouble() ?? initial;
    final return_ = current - initial;
    final returnPercent = initial > 0 ? (return_ / initial * 100) : 0;

    return Container(
      margin: const EdgeInsets.only(bottom: 12),
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: isDark ? const Color(0xFF1A1F2E) : Colors.white,
        borderRadius: BorderRadius.circular(20),
        border: Border.all(color: isDark ? Colors.white.withValues(alpha: 0.06) : Colors.black.withValues(alpha: 0.04)),
        boxShadow: [BoxShadow(color: isDark ? Colors.black.withValues(alpha: 0.2) : Colors.black.withValues(alpha: 0.05), blurRadius: 16, offset: const Offset(0, 4))],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(name, style: (isDark ? AppTheme.bodyDark : AppTheme.bodyLight).copyWith(fontWeight: FontWeight.w800, fontSize: 16)),
                    const SizedBox(height: 4),
                    Container(
                      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                      decoration: BoxDecoration(
                        color: AppTheme.electricBlue.withValues(alpha: 0.1),
                        borderRadius: BorderRadius.circular(8),
                      ),
                      child: Text(type, style: const TextStyle(color: AppTheme.electricBlue, fontSize: 10, fontWeight: FontWeight.w800)),
                    ),
                  ],
                ),
              ),
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
                decoration: BoxDecoration(
                  gradient: LinearGradient(colors: [AppTheme.emerald, AppTheme.turquoise]),
                  borderRadius: BorderRadius.circular(12),
                ),
                child: Text('${returnPercent >= 0 ? '+' : ''}${returnPercent.toStringAsFixed(1)}%', style: const TextStyle(color: Colors.white, fontSize: 12, fontWeight: FontWeight.w900)),
              ),
            ],
          ),
          const SizedBox(height: 16),
          Row(
            children: [
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text('Initial', style: (isDark ? AppTheme.bodyDark : AppTheme.bodyLight).copyWith(color: AppTheme.textMutedLight, fontSize: 11)),
                    const SizedBox(height: 4),
                    Text('${initial.toStringAsFixed(2)} TND', style: (isDark ? AppTheme.bodyDark : AppTheme.bodyLight).copyWith(fontWeight: FontWeight.w700, fontSize: 15)),
                  ],
                ),
              ),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text('Current', style: (isDark ? AppTheme.bodyDark : AppTheme.bodyLight).copyWith(color: AppTheme.textMutedLight, fontSize: 11)),
                    const SizedBox(height: 4),
                    Text('${current.toStringAsFixed(2)} TND', style: (isDark ? AppTheme.bodyDark : AppTheme.bodyLight).copyWith(fontWeight: FontWeight.w800, fontSize: 15, color: AppTheme.electricBlue)),
                  ],
                ),
              ),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text('Return', style: (isDark ? AppTheme.bodyDark : AppTheme.bodyLight).copyWith(color: AppTheme.textMutedLight, fontSize: 11)),
                    const SizedBox(height: 4),
                    Text('${return_ >= 0 ? '+' : ''}${return_.toStringAsFixed(2)} TND', style: (isDark ? AppTheme.bodyDark : AppTheme.bodyLight).copyWith(fontWeight: FontWeight.w700, fontSize: 15, color: return_ >= 0 ? AppTheme.emerald : AppTheme.danger)),
                  ],
                ),
              ),
            ],
          ),
        ],
      ),
    );
  }
}
