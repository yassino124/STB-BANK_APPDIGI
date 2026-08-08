import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_animate/flutter_animate.dart';
import 'package:provider/provider.dart';
import '../../providers/app_provider.dart';
import '../../theme/app_theme.dart';
import '../../models/banking_models.dart';
import '../../data/repositories/banking_repository.dart';
import 'dart:ui';

class CardsScreen extends StatefulWidget {
  const CardsScreen({super.key});
  @override
  State<CardsScreen> createState() => _CardsScreenState();
}

class _CardsScreenState extends State<CardsScreen> {
  int _selectedCard = 0;
  bool _frozen = false;
  bool _online = true;
  bool _contactless = true;
  bool _isCardFlipped = false;
  List<BankCard> _cards = [];
  bool _loading = true;
  String? _error;

  @override
  void initState() {
    super.initState();
    _fetchCards();
  }

  Future<void> _fetchCards() async {
    setState(() {
      _loading = true;
      _error = null;
    });
    try {
      final repo = BankingRepository.instance;
      final cards = await repo.getCards();
      if (mounted) {
        setState(() {
          _cards = cards;
          _loading = false;
        });
      }
    } catch (e) {
      if (mounted) {
        setState(() {
          _error = e.toString();
          _loading = false;
        });
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    final p = Provider.of<AppProvider>(context);
    final dk = p.themeMode == ThemeMode.dark;
    final fg = Theme.of(context).colorScheme.onSurface;
    final mt = dk ? const Color(0xFF94A3B8) : const Color(0xFF64748B);
    final cd = Theme.of(context).cardColor;
    final bd = dk ? Colors.white.withOpacity(0.08) : Colors.black.withOpacity(0.04);
    
    if (_loading) {
      return Scaffold(
        backgroundColor: Theme.of(context).scaffoldBackgroundColor,
        body: const Center(child: CircularProgressIndicator(color: AppTheme.electricBlue)),
      );
    }

    if (_error != null || _cards.isEmpty) {
      return Scaffold(
        backgroundColor: Theme.of(context).scaffoldBackgroundColor,
        body: Center(
          child: Padding(
            padding: const EdgeInsets.all(20),
            child: Column(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                Icon(Icons.credit_card_rounded, size: 64, color: dk ? Colors.white.withValues(alpha: 0.1) : Colors.black.withValues(alpha: 0.1)),
                const SizedBox(height: 16),
                Text(_error != null ? 'Erreur: $_error' : 'Aucune carte', style: TextStyle(color: mt, fontSize: 16, fontWeight: FontWeight.w600)),
                const SizedBox(height: 16),
                ElevatedButton.icon(onPressed: _fetchCards, icon: const Icon(Icons.refresh_rounded), label: const Text('Réessayer')),
              ],
            ),
          ),
        ),
      );
    }

    return Scaffold(
      backgroundColor: Theme.of(context).scaffoldBackgroundColor,
      body: SafeArea(
        bottom: false,
        child: SingleChildScrollView(
          physics: const BouncingScrollPhysics(),
          padding: const EdgeInsets.only(bottom: 120),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              // Header
              Padding(
                padding: const EdgeInsets.fromLTRB(20, 20, 20, 0),
                child: Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    // Back button
                    GestureDetector(
                      onTap: () {
                        HapticFeedback.lightImpact();
                        Navigator.maybePop(context);
                      },
                      child: Container(
                        width: 40, height: 40,
                        decoration: BoxDecoration(
                          color: dk ? Colors.white.withValues(alpha: 0.07) : Colors.black.withValues(alpha: 0.05),
                          borderRadius: BorderRadius.circular(14),
                          border: Border.all(color: bd),
                        ),
                        child: Icon(Icons.arrow_back_ios_new_rounded, color: fg, size: 18),
                      ),
                    ),
                    const SizedBox(width: 12),
                    Expanded(
                      child: Text(
                        "Cards",
                        style: TextStyle(color: fg, fontSize: 28, fontWeight: FontWeight.w800, letterSpacing: -0.8),
                      ),
                    ),
                    GestureDetector(
                      onTap: () {
                        HapticFeedback.mediumImpact();
                      },
                      child: Container(
                        width: 44, height: 44,
                        decoration: BoxDecoration(
                          color: cd,
                          shape: BoxShape.circle,
                          border: Border.all(color: bd),
                          boxShadow: [BoxShadow(color: Colors.black.withValues(alpha: 0.02), blurRadius: 10, offset: const Offset(0, 4))],
                        ),
                        child: Icon(Icons.add_rounded, color: fg, size: 22),
                      ),
                    ),
                  ],
                ).animate().fadeIn(),
              ),
              const SizedBox(height: 12),
               
              Padding(
                padding: const EdgeInsets.symmetric(horizontal: 20),
                child: Text(
                  "Tap card to flip and view details",
                  style: TextStyle(color: mt, fontSize: 13, fontWeight: FontWeight.w600),
                ),
              ).animate().fadeIn(delay: 50.ms),
              const SizedBox(height: 16),

              // Cards Carousel (3D Flip Animated Card)
              SizedBox(
                height: 220,
                child: PageView.builder(
                  controller: PageController(viewportFraction: 0.88),
                  itemCount: _cards.length,
                  onPageChanged: (i) => setState(() {
                    _selectedCard = i;
                    _isCardFlipped = false; // reset flip state on page swipe
                  }),
                  itemBuilder: (_, i) {
                    final c = _cards[i];
                    final isActive = i == _selectedCard;
                    final colors = [AppTheme.royalBlue, AppTheme.electricBlue];

                    return AnimatedScale(
                      scale: isActive ? 1.0 : 0.93,
                      duration: const Duration(milliseconds: 300),
                      curve: Curves.easeOutCubic,
                      child: GestureDetector(
                        onTap: () {
                          if (isActive) {
                            HapticFeedback.mediumImpact();
                            setState(() => _isCardFlipped = !_isCardFlipped);
                          }
                        },
                        child: TweenAnimationBuilder<double>(
                          tween: Tween<double>(begin: 0, end: (isActive && _isCardFlipped) ? 3.14159 : 0),
                          duration: const Duration(milliseconds: 550),
                          curve: Curves.easeInOutCubic,
                          builder: (context, val, __) {
                            final isBack = val >= 3.14159 / 2;
                            return Transform(
                              alignment: Alignment.center,
                              transform: Matrix4.identity()
                                ..setEntry(3, 2, 0.0012) // 3D Perspective
                                ..rotateY(val),
                              child: isBack
                                  ? Transform(
                                      alignment: Alignment.center,
                                      transform: Matrix4.identity()..rotateY(3.14159), // avoid mirrored content
                                      child: _buildCardBack(c, colors, isActive),
                                    )
                                  : _buildCardFront(c, colors, isActive),
                            );
                          },
                        ),
                      ),
                    );
                  },
                ),
              ).animate().fadeIn(delay: 100.ms),

              // Page Indicator Dots
              Center(
                child: Padding(
                  padding: const EdgeInsets.only(top: 14),
                  child: Row(
                    mainAxisSize: MainAxisSize.min,
                    children: List.generate(_cards.length, (i) => AnimatedContainer(
                      duration: const Duration(milliseconds: 250),
                      margin: const EdgeInsets.symmetric(horizontal: 4),
                      width: i == _selectedCard ? 20 : 6,
                      height: 6,
                      decoration: BoxDecoration(
                        color: i == _selectedCard ? AppTheme.electricBlue : mt.withValues(alpha: 0.3),
                        borderRadius: BorderRadius.circular(3),
                      ),
                    )),
                  ),
                ),
              ),
              const SizedBox(height: 28),

              // Quick Actions Row
              Padding(
                padding: const EdgeInsets.symmetric(horizontal: 20),
                child: Row(
                  mainAxisAlignment: MainAxisAlignment.spaceEvenly,
                  children: [
                    _qa(Icons.lock_outline_rounded, _frozen ? "Unfreeze" : "Freeze", fg, mt, cd, bd, () => setState(() => _frozen = !_frozen)),
                    _qa(Icons.visibility_outlined, "Reveal PIN", fg, mt, cd, bd, () {
                      // Trigger flip as shortcut
                      setState(() => _isCardFlipped = !_isCardFlipped);
                    }),
                    _qa(Icons.receipt_long_outlined, "Statement", fg, mt, cd, bd, () {}),
                    _qa(Icons.tune_rounded, "Limits", fg, mt, cd, bd, () {}),
                  ],
                ).animate().fadeIn(delay: 200.ms),
              ),
              const SizedBox(height: 32),

              // Security & Settings
              Padding(
                padding: const EdgeInsets.symmetric(horizontal: 20),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      "Security & Settings",
                      style: TextStyle(color: fg, fontSize: 18, fontWeight: FontWeight.w800, letterSpacing: -0.5),
                    ).animate().fadeIn(delay: 250.ms),
                    const SizedBox(height: 16),
                    _toggle("Online Transactions", "Allow online purchases and payments", Icons.language_rounded, _online, (v) => setState(() => _online = v), fg, mt, cd, bd),
                    const SizedBox(height: 12),
                    _toggle("Contactless (NFC)", "Tap to pay at POS terminals", Icons.contactless_rounded, _contactless, (v) => setState(() => _contactless = v), fg, mt, cd, bd),
                    
                    const SizedBox(height: 32),
                    Text(
                      "Spending Limits",
                      style: TextStyle(color: fg, fontSize: 18, fontWeight: FontWeight.w800, letterSpacing: -0.5),
                    ).animate().fadeIn(delay: 300.ms),
                    const SizedBox(height: 20),
                    _bar(
                      "Daily Limit", 
                      _cards[_selectedCard].dailySpent, 
                      _cards[_selectedCard].dailyLimit, 
                      fg, mt, cd, bd
                    ),
                    const SizedBox(height: 12),
                    _bar(
                      "Monthly Limit", 
                      _cards[_selectedCard].monthlySpent, 
                      _cards[_selectedCard].monthlyLimit, 
                      fg, mt, cd, bd
                    ),

                    const SizedBox(height: 32),
                    Text(
                      "Recent Card Transactions",
                      style: TextStyle(color: fg, fontSize: 18, fontWeight: FontWeight.w800, letterSpacing: -0.5),
                    ).animate().fadeIn(delay: 350.ms),
                    const SizedBox(height: 16),
                    ..._buildTransactionsList(_cards[_selectedCard], fg, mt, cd, bd),
                  ],
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildCardFront(BankCard c, List<Color> colors, bool isActive) {
    return Container(
      margin: const EdgeInsets.symmetric(horizontal: 6, vertical: 4),
      padding: const EdgeInsets.all(24),
      decoration: BoxDecoration(
        gradient: LinearGradient(
          colors: colors,
          begin: Alignment.topLeft,
          end: Alignment.bottomRight,
        ),
        borderRadius: BorderRadius.circular(30),
        border: Border.all(color: Colors.white.withValues(alpha: 0.15)),
        boxShadow: isActive 
            ? [BoxShadow(color: colors.last.withValues(alpha: 0.3), blurRadius: 20, offset: const Offset(0, 10))] 
            : [],
      ),
      child: Stack(
        children: [
          // 3D reflection circles
          Positioned(
            right: -40, top: -40,
            child: Container(
              width: 160, height: 160,
              decoration: BoxDecoration(
                shape: BoxShape.circle,
                border: Border.all(color: Colors.white.withValues(alpha: 0.06), width: 2),
              ),
            ),
          ),
          Positioned(
            right: 20, top: 20,
            child: Container(
              width: 80, height: 80,
              decoration: BoxDecoration(
                shape: BoxShape.circle,
                border: Border.all(color: Colors.white.withValues(alpha: 0.06), width: 2),
              ),
            ),
          ),
          Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Text(
                    "STB BANK",
                    style: TextStyle(
                      color: Colors.white.withValues(alpha: 0.7),
                      fontWeight: FontWeight.w800,
                      fontSize: 12,
                      letterSpacing: 2,
                    ),
                  ),
                  Icon(Icons.contactless_rounded, color: Colors.white.withValues(alpha: 0.8), size: 24),
                ],
              ),
              Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    "${c.balance.toStringAsFixed(2)} TND",
                    style: const TextStyle(color: Colors.white, fontSize: 24, fontWeight: FontWeight.w800, letterSpacing: -0.5),
                  ),
                  const SizedBox(height: 12),
                  Text(
                    "****  ****  ****  ${c.lastFour}",
                    style: TextStyle(color: Colors.white.withValues(alpha: 0.9), fontSize: 18, fontWeight: FontWeight.w700, letterSpacing: 2),
                  ),
                  const SizedBox(height: 12),
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Text(
                        c.type.toUpperCase(),
                        style: TextStyle(color: Colors.white.withValues(alpha: 0.5), fontSize: 9, fontWeight: FontWeight.w800, letterSpacing: 1.5),
                      ),
                      Text(
                        "EXP ${c.expiry}",
                        style: TextStyle(color: Colors.white.withValues(alpha: 0.6), fontSize: 11, fontWeight: FontWeight.w700),
                      ),
                    ],
                  ),
                ],
              ),
            ],
          ),
          if (_frozen && isActive)
            Positioned.fill(
              child: ClipRRect(
                borderRadius: BorderRadius.circular(30),
                child: BackdropFilter(
                  filter: ImageFilter.blur(sigmaX: 8, sigmaY: 8),
                  child: Container(
                    color: Colors.black.withValues(alpha: 0.4),
                    child: Center(
                      child: Column(
                        mainAxisSize: MainAxisSize.min,
                        children: [
                          const Icon(Icons.lock_rounded, color: Colors.white, size: 36),
                          const SizedBox(height: 8),
                          Text(
                            "FROZEN",
                            style: TextStyle(
                              color: Colors.white.withValues(alpha: 0.9),
                              fontWeight: FontWeight.w800,
                              letterSpacing: 1.5,
                              fontSize: 13,
                            ),
                          ),
                        ],
                      ),
                    ),
                  ),
                ),
              ),
            ),
        ],
      ),
    );
  }

  Widget _buildCardBack(BankCard c, List<Color> colors, bool isActive) {
    return Container(
      margin: const EdgeInsets.symmetric(horizontal: 6, vertical: 4),
      decoration: BoxDecoration(
        gradient: LinearGradient(
          colors: colors,
          begin: Alignment.topLeft,
          end: Alignment.bottomRight,
        ),
        borderRadius: BorderRadius.circular(30),
        border: Border.all(color: Colors.white.withValues(alpha: 0.15)),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const SizedBox(height: 24),
          // Magnetic Strip
          Container(
            height: 40,
            color: Colors.black.withValues(alpha: 0.85),
            width: double.infinity,
          ),
          const SizedBox(height: 16),
          // Signature area
          Padding(
            padding: const EdgeInsets.symmetric(horizontal: 20),
            child: Row(
              children: [
                Expanded(
                  child: Container(
                    height: 38,
                    decoration: BoxDecoration(
                      color: Colors.white.withValues(alpha: 0.2),
                      borderRadius: BorderRadius.circular(6),
                    ),
                    alignment: Alignment.centerLeft,
                    padding: const EdgeInsets.symmetric(horizontal: 12),
                    child: Text(
                      c.holderName,
                      style: TextStyle(
                        fontFamily: 'Courier',
                        color: Colors.white.withValues(alpha: 0.9),
                        fontSize: 14,
                        fontWeight: FontWeight.w600,
                        fontStyle: FontStyle.italic,
                      ),
                    ),
                  ),
                ),
                const SizedBox(width: 12),
                Container(
                  height: 38,
                  width: 58,
                  decoration: BoxDecoration(
                    color: Colors.white,
                    borderRadius: BorderRadius.circular(6),
                  ),
                  alignment: Alignment.center,
                  child: const Text(
                    "482",
                    style: TextStyle(
                      color: Colors.black,
                      fontSize: 14,
                      fontWeight: FontWeight.w900,
                      letterSpacing: 0.5,
                    ),
                  ),
                ),
              ],
            ),
          ),
          const Spacer(),
          // Back details text
          Padding(
            padding: const EdgeInsets.fromLTRB(20, 0, 20, 20),
            child: Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              crossAxisAlignment: CrossAxisAlignment.end,
              children: [
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      Text(
                        "STB Support: +216 71 340 011",
                        style: TextStyle(color: Colors.white.withValues(alpha: 0.7), fontSize: 9, fontWeight: FontWeight.w700),
                      ),
                      const SizedBox(height: 4),
                      Text(
                        "This card is property of STB Bank. If found, please return to any branch.",
                        style: TextStyle(color: Colors.white.withValues(alpha: 0.5), fontSize: 7, fontWeight: FontWeight.w500, height: 1.2),
                      ),
                    ],
                  ),
                ),
                // Tiny Hologram sticker
                Container(
                  width: 32,
                  height: 32,
                  decoration: BoxDecoration(
                    borderRadius: BorderRadius.circular(8),
                    gradient: LinearGradient(
                      colors: [
                        Colors.white.withValues(alpha: 0.3),
                        Colors.yellow.withValues(alpha: 0.2),
                        Colors.cyan.withValues(alpha: 0.3),
                      ],
                      begin: Alignment.topLeft,
                      end: Alignment.bottomRight,
                    ),
                    border: Border.all(color: Colors.white.withValues(alpha: 0.2)),
                  ),
                  child: const Icon(Icons.security, color: Colors.white70, size: 16),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _qa(IconData icon, String label, Color fg, Color mt, Color cd, Color bd, VoidCallback onTap) {
    return GestureDetector(
      onTap: () {
        HapticFeedback.lightImpact();
        onTap();
      },
      child: Column(
        children: [
          Container(
            width: 58, height: 58,
            decoration: BoxDecoration(
              color: cd,
              borderRadius: BorderRadius.circular(20),
              border: Border.all(color: bd),
              boxShadow: [BoxShadow(color: Colors.black.withValues(alpha: 0.01), blurRadius: 10, offset: const Offset(0, 4))],
            ),
            child: Icon(icon, color: fg, size: 22),
          ),
          const SizedBox(height: 8),
          Text(label, style: TextStyle(color: mt, fontSize: 11, fontWeight: FontWeight.w700)),
        ],
      ),
    );
  }

  Widget _toggle(String title, String sub, IconData icon, bool val, ValueChanged<bool> onChange, Color fg, Color mt, Color cd, Color bd) {
    return Container(
      padding: const EdgeInsets.all(18),
      decoration: BoxDecoration(
        color: cd,
        borderRadius: BorderRadius.circular(22),
        border: Border.all(color: bd),
        boxShadow: [BoxShadow(color: Colors.black.withValues(alpha: 0.01), blurRadius: 10, offset: const Offset(0, 4))],
      ),
      child: Row(
        children: [
          Container(
            padding: const EdgeInsets.all(8),
            decoration: BoxDecoration(color: AppTheme.electricBlue.withValues(alpha: 0.1), borderRadius: BorderRadius.circular(12)),
            child: Icon(icon, color: AppTheme.electricBlue, size: 20),
          ),
          const SizedBox(width: 14),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(title, style: TextStyle(color: fg, fontWeight: FontWeight.w700, fontSize: 14)),
                const SizedBox(height: 2),
                Text(sub, style: TextStyle(color: mt, fontSize: 11, fontWeight: FontWeight.w500)),
              ],
            ),
          ),
          Switch.adaptive(
            value: val,
            onChanged: (v) {
              HapticFeedback.lightImpact();
              onChange(v);
            },
            activeColor: AppTheme.electricBlue,
          ),
        ],
      ),
    );
  }

  Widget _bar(String label, double cur, double max, Color fg, Color mt, Color cd, Color bd) {
    final pct = cur / max;
    return Container(
      padding: const EdgeInsets.all(18),
      decoration: BoxDecoration(
        color: cd,
        borderRadius: BorderRadius.circular(22),
        border: Border.all(color: bd),
      ),
      child: Column(
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Text(label, style: TextStyle(color: fg, fontWeight: FontWeight.w700, fontSize: 14)),
              Text(
                "${cur.toInt()} / ${max.toInt()} TND",
                style: TextStyle(color: AppTheme.electricBlue, fontSize: 13, fontWeight: FontWeight.w700),
              ),
            ],
          ),
          const SizedBox(height: 14),
          Stack(
            children: [
              Container(
                height: 8,
                decoration: BoxDecoration(
                  color: mt.withValues(alpha: 0.1),
                  borderRadius: BorderRadius.circular(4),
                ),
              ),
              FractionallySizedBox(
                widthFactor: pct,
                child: Container(
                  height: 8,
                  decoration: BoxDecoration(
                    gradient: const LinearGradient(
                      colors: [AppTheme.electricBlue, AppTheme.turquoise],
                    ),
                    borderRadius: BorderRadius.circular(4),
                    boxShadow: [
                      BoxShadow(color: AppTheme.electricBlue.withValues(alpha: 0.2), blurRadius: 4, offset: const Offset(0, 2))
                    ],
                  ),
                ),
              ),
            ],
          ),
        ],
      ),
    );
  }

  List<Widget> _buildTransactionsList(BankCard card, Color fg, Color mt, Color cd, Color bd) {
    if (card.recentTransactions.isEmpty) {
      return [
        Container(
          padding: const EdgeInsets.all(32),
          decoration: BoxDecoration(
            color: cd,
            borderRadius: BorderRadius.circular(22),
            border: Border.all(color: bd),
          ),
          child: Center(
            child: Column(
              children: [
                Icon(Icons.receipt_long_rounded, size: 48, color: mt.withValues(alpha: 0.3)),
                const SizedBox(height: 12),
                Text(
                  'Aucune transaction récente',
                  style: TextStyle(color: mt, fontSize: 14, fontWeight: FontWeight.w600),
                ),
              ],
            ),
          ),
        ),
      ];
    }

    return card.recentTransactions.take(5).map((tx) {
      final title = tx['description'] ?? tx['merchant'] ?? 'Transaction';
      final date = tx['date'] ?? tx['createdAt'] ?? '';
      final amount = tx['amount'] ?? 0.0;
      final formattedAmount = amount >= 0 
          ? '+${amount.toStringAsFixed(2)} TND' 
          : '${amount.toStringAsFixed(2)} TND';
      
      // Determine icon and color based on category or merchant
      IconData icon = Icons.shopping_bag_rounded;
      Color color = AppTheme.electricBlue;
      
      final category = (tx['category'] ?? '').toString().toLowerCase();
      final merchant = (tx['merchant'] ?? '').toString().toLowerCase();
      
      if (category.contains('entertainment') || merchant.contains('netflix') || merchant.contains('spotify')) {
        icon = Icons.tv_rounded;
        color = AppTheme.royalBlue;
      } else if (category.contains('food') || merchant.contains('restaurant') || merchant.contains('cafe') || merchant.contains('carrefour')) {
        icon = Icons.restaurant_rounded;
        color = AppTheme.emerald;
      } else if (category.contains('transport') || merchant.contains('gas') || merchant.contains('station') || merchant.contains('total') || merchant.contains('shell')) {
        icon = Icons.local_gas_station_rounded;
        color = AppTheme.turquoise;
      } else if (category.contains('shopping')) {
        icon = Icons.shopping_bag_rounded;
        color = AppTheme.violet;
      } else if (category.contains('health')) {
        icon = Icons.local_hospital_rounded;
        color = AppTheme.coralRed;
      }
      
      return _txItem(title, date, formattedAmount, icon, color, fg, mt, cd, bd);
    }).toList();
  }

  Widget _txItem(String title, String date, String amount, IconData icon, Color color, Color fg, Color mt, Color cd, Color bd) {
    return Container(
      margin: const EdgeInsets.only(bottom: 12),
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: cd,
        borderRadius: BorderRadius.circular(22),
        border: Border.all(color: bd),
        boxShadow: [BoxShadow(color: Colors.black.withValues(alpha: 0.01), blurRadius: 8, offset: const Offset(0, 4))],
      ),
      child: Row(
        children: [
          Container(
            width: 44, height: 44,
            decoration: BoxDecoration(
              color: color.withValues(alpha: 0.1),
              borderRadius: BorderRadius.circular(14),
            ),
            child: Icon(icon, color: color, size: 20),
          ),
          const SizedBox(width: 14),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(title, style: TextStyle(color: fg, fontWeight: FontWeight.w700, fontSize: 14, letterSpacing: -0.2)),
                const SizedBox(height: 3),
                Text(date, style: TextStyle(color: mt, fontSize: 11, fontWeight: FontWeight.w500)),
              ],
            ),
          ),
          Text(
            amount,
            style: TextStyle(
              color: amount.startsWith('+') ? AppTheme.emerald : fg,
              fontWeight: FontWeight.w800,
              fontSize: 14,
              letterSpacing: -0.3,
            ),
          ),
        ],
      ),
    );
  }
}
