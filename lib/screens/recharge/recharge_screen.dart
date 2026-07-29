import 'dart:ui';
import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_animate/flutter_animate.dart';
import 'package:flutter_svg/flutter_svg.dart';
import 'package:provider/provider.dart';
import '../../providers/app_provider.dart';
import '../../theme/app_theme.dart';
import '../../services/auth_api_service.dart';

// ─────────────────────────────────────────────────────────────────────────────
//  Operator model
// ─────────────────────────────────────────────────────────────────────────────
class _Operator {
  final String id;
  final String name;
  final String logoPath;
  final List<Color> gradient;
  final Color glow;

  const _Operator({
    required this.id,
    required this.name,
    required this.logoPath,
    required this.gradient,
    required this.glow,
  });
}

const _operators = [
  _Operator(
    id: 'OOREDOO',
    name: 'Ooredoo',
    logoPath: 'public/ooredoo.svg',
    gradient: [Color(0xFFE53935), Color(0xFFFF6F00)],
    glow: Color(0xFFE53935),
  ),
  _Operator(
    id: 'TUNISIE_TELECOM',
    name: 'Tunisie Telecom',
    logoPath: 'public/telecom.png',
    gradient: [Color(0xFF1A56DB), Color(0xFF0D47A1)],
    glow: Color(0xFF1A56DB),
  ),
  _Operator(
    id: 'ORANGE',
    name: 'Orange',
    logoPath: 'public/orange.svg',
    gradient: [Color(0xFFFF7900), Color(0xFFE65100)],
    glow: Color(0xFFFF7900),
  ),
];

const _quickAmounts = [5, 10, 20, 30, 50];

// ─────────────────────────────────────────────────────────────────────────────
//  Screen
// ─────────────────────────────────────────────────────────────────────────────
class RechargeScreen extends StatefulWidget {
  const RechargeScreen({super.key});

  @override
  State<RechargeScreen> createState() => _RechargeScreenState();
}

class _RechargeScreenState extends State<RechargeScreen>
    with SingleTickerProviderStateMixin {
  List<dynamic> _recharges = [];
  bool _loading = true;

  int _selectedOperator = 0;
  int? _selectedAmount;
  final _phoneController = TextEditingController();
  final _customAmountController = TextEditingController();
  final _phoneFocus = FocusNode();
  bool _paying = false;

  late AnimationController _bgAnim;

  @override
  void initState() {
    super.initState();
    _bgAnim = AnimationController(
      vsync: this,
      duration: const Duration(seconds: 8),
    )..repeat(reverse: true);
    _fetchRecharges();
  }

  Future<void> _fetchRecharges() async {
    final res = await AuthApiService.getRecharges();
    if (mounted) {
      setState(() {
        _recharges = res.data ?? [];
        _loading = false;
      });
    }
  }

  @override
  void dispose() {
    _bgAnim.dispose();
    _phoneController.dispose();
    _customAmountController.dispose();
    _phoneFocus.dispose();
    super.dispose();
  }

  double get _amount {
    if (_selectedAmount != null) return _selectedAmount!.toDouble();
    return double.tryParse(_customAmountController.text) ?? 0;
  }

  Future<void> _onRecharge() async {
    if (_phoneController.text.length < 8) {
      _showError('Veuillez entrer un numéro valide.');
      return;
    }
    if (_amount <= 0) {
      _showError('Veuillez choisir un montant.');
      return;
    }
    setState(() => _paying = true);
    final op = _operators[_selectedOperator];
    final res = await AuthApiService.submitRecharge(op.id, _phoneController.text, _amount);
    setState(() => _paying = false);
    
    if (res.isSuccess) {
      if (mounted) _showSuccessSheet();
      _fetchRecharges(); // Refresh list
    } else {
      _showError(res.error ?? 'Erreur de recharge');
    }
  }

  void _showError(String msg) {
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(
        content: Text(msg, style: const TextStyle(color: Colors.white)),
        backgroundColor: AppTheme.coralRed,
        behavior: SnackBarBehavior.floating,
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14)),
      ),
    );
  }

  void _showSuccessSheet() {
    final op = _operators[_selectedOperator];
    showModalBottomSheet(
      context: context,
      backgroundColor: Colors.transparent,
      isScrollControlled: true,
      builder: (_) => _SuccessSheet(
        operator: op,
        phone: _phoneController.text,
        amount: _amount,
      ),
    ).then((_) {
      setState(() {
        _selectedAmount = null;
        _customAmountController.clear();
        _phoneController.clear();
      });
    });
  }

  @override
  Widget build(BuildContext context) {
    final p = Provider.of<AppProvider>(context);
    final dk = p.themeMode == ThemeMode.dark;

    return Scaffold(
      backgroundColor: dk ? AppTheme.bgDark : AppTheme.bgLight,
      body: Stack(
        children: [
          // Animated ambient background
          _AmbientBg(anim: _bgAnim, isDark: dk),

          SafeArea(
            child: _loading
                ? const Center(
                    child: CircularProgressIndicator(
                        color: AppTheme.electricBlue))
                : GestureDetector(
                    onTap: () => FocusScope.of(context).unfocus(),
                    child: CustomScrollView(
                      physics: const BouncingScrollPhysics(),
                      slivers: [
                        // ── Header
                        SliverToBoxAdapter(
                          child: Padding(
                            padding: const EdgeInsets.fromLTRB(20, 16, 20, 0),
                            child: _Header(isDark: dk)
                                .animate()
                                .fadeIn(duration: 500.ms)
                                .slideY(begin: -0.15, curve: Curves.easeOut),
                          ),
                        ),

                        // ── Operator Selector
                        SliverToBoxAdapter(
                          child: Padding(
                            padding: const EdgeInsets.fromLTRB(20, 24, 20, 0),
                            child: Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                Text(
                                  'Opérateur',
                                  style: AppTheme.caption(dk
                                      ? Colors.white54
                                      : AppTheme.textMutedLight),
                                ),
                                const SizedBox(height: 12),
                                Row(
                                  children: List.generate(
                                    _operators.length,
                                    (i) => Expanded(
                                      child: Padding(
                                        padding: EdgeInsets.only(
                                            right: i < 2 ? 10 : 0),
                                        child: _OperatorCard(
                                          op: _operators[i],
                                          selected: _selectedOperator == i,
                                          isDark: dk,
                                          onTap: () => setState(
                                              () => _selectedOperator = i),
                                        )
                                            .animate()
                                            .fadeIn(
                                                delay: (i * 120).ms,
                                                duration: 400.ms)
                                            .scale(
                                                begin: const Offset(0.85, 0.85),
                                                curve: Curves.easeOut),
                                      ),
                                    ),
                                  ),
                                ),
                              ],
                            ),
                          ),
                        ),

                        // ── Phone input
                        SliverToBoxAdapter(
                          child: Padding(
                            padding: const EdgeInsets.fromLTRB(20, 24, 20, 0),
                            child: Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                Text(
                                  'Numéro de téléphone',
                                  style: AppTheme.caption(dk
                                      ? Colors.white54
                                      : AppTheme.textMutedLight),
                                ),
                                const SizedBox(height: 10),
                                _GlassInput(
                                  controller: _phoneController,
                                  focusNode: _phoneFocus,
                                  isDark: dk,
                                  hint: '2X XXX XXX',
                                  icon: Icons.phone_rounded,
                                  keyboardType: TextInputType.phone,
                                  inputFormatters: [
                                    FilteringTextInputFormatter.digitsOnly,
                                    LengthLimitingTextInputFormatter(8),
                                  ],
                                ),
                              ],
                            ).animate().fadeIn(delay: 200.ms).slideY(begin: 0.1),
                          ),
                        ),

                        // ── Amount pills
                        SliverToBoxAdapter(
                          child: Padding(
                            padding: const EdgeInsets.fromLTRB(20, 24, 20, 0),
                            child: Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                Text(
                                  'Montant rapide',
                                  style: AppTheme.caption(dk
                                      ? Colors.white54
                                      : AppTheme.textMutedLight),
                                ),
                                const SizedBox(height: 12),
                                Wrap(
                                  spacing: 10,
                                  runSpacing: 10,
                                  children: List.generate(
                                    _quickAmounts.length,
                                    (i) {
                                      final amt = _quickAmounts[i];
                                      final sel = _selectedAmount == amt;
                                      final op = _operators[_selectedOperator];
                                      return _AmountPill(
                                        label: '$amt TND',
                                        selected: sel,
                                        gradient: op.gradient,
                                        isDark: dk,
                                        onTap: () => setState(() {
                                          _selectedAmount = sel ? null : amt;
                                          if (!sel) {
                                            _customAmountController.clear();
                                          }
                                        }),
                                      )
                                          .animate()
                                          .fadeIn(
                                              delay: (i * 60 + 300).ms,
                                              duration: 350.ms)
                                          .scale(
                                              begin: const Offset(0.8, 0.8),
                                              curve: Curves.easeOut);
                                    },
                                  ),
                                ),
                              ],
                            ),
                          ),
                        ),

                        // ── Custom amount input
                        SliverToBoxAdapter(
                          child: Padding(
                            padding: const EdgeInsets.fromLTRB(20, 16, 20, 0),
                            child: Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                Text(
                                  'Autre montant (TND)',
                                  style: AppTheme.caption(dk
                                      ? Colors.white54
                                      : AppTheme.textMutedLight),
                                ),
                                const SizedBox(height: 10),
                                _GlassInput(
                                  controller: _customAmountController,
                                  isDark: dk,
                                  hint: '0.000',
                                  icon: Icons.attach_money_rounded,
                                  keyboardType:
                                      const TextInputType.numberWithOptions(
                                          decimal: true),
                                  onChanged: (_) =>
                                      setState(() => _selectedAmount = null),
                                ),
                              ],
                            ).animate().fadeIn(delay: 400.ms).slideY(begin: 0.1),
                          ),
                        ),

                        // ── Recharger button
                        SliverToBoxAdapter(
                          child: Padding(
                            padding: const EdgeInsets.fromLTRB(20, 28, 20, 0),
                            child: _RechargerButton(
                              isDark: dk,
                              loading: _paying,
                              gradient: _operators[_selectedOperator].gradient,
                              glow: _operators[_selectedOperator].glow,
                              onTap: _onRecharge,
                            )
                                .animate()
                                .fadeIn(delay: 500.ms)
                                .slideY(begin: 0.2, curve: Curves.easeOut),
                          ),
                        ),

                        // ── History header
                        SliverToBoxAdapter(
                          child: Padding(
                            padding: const EdgeInsets.fromLTRB(20, 32, 20, 12),
                            child: Row(
                              children: [
                                Text(
                                  'Historique',
                                  style: AppTheme.title(dk
                                      ? AppTheme.textPrimaryDark
                                      : AppTheme.textPrimaryLight),
                                ),
                                const Spacer(),
                                if (_recharges.isNotEmpty)
                                  Text(
                                    '${_recharges.length} recharges',
                                    style: AppTheme.caption(
                                        AppTheme.electricBlue),
                                  ),
                              ],
                            ).animate().fadeIn(delay: 600.ms),
                          ),
                        ),

                        // ── History list or placeholder cards
                        if (_recharges.isEmpty)
                          SliverPadding(
                            padding:
                                const EdgeInsets.symmetric(horizontal: 20),
                            sliver: SliverList(
                              delegate: SliverChildBuilderDelegate(
                                (context, i) => _PlaceholderRechargeCard(
                                  op: _operators[i],
                                  isDark: dk,
                                )
                                    .animate()
                                    .fadeIn(delay: (i * 100 + 700).ms)
                                    .slideX(begin: 0.1),
                                childCount: 3,
                              ),
                            ),
                          )
                        else
                          SliverPadding(
                            padding:
                                const EdgeInsets.symmetric(horizontal: 20),
                            sliver: SliverList(
                              delegate: SliverChildBuilderDelegate(
                                (context, index) {
                                  final r = _recharges[index]
                                      as Map<String, dynamic>;
                                  return _HistoryCard(
                                    recharge: r,
                                    isDark: dk,
                                  )
                                      .animate()
                                      .fadeIn(
                                          delay: (index * 80 + 700).ms,
                                          duration: 400.ms)
                                      .slideY(begin: 0.15);
                                },
                                childCount: _recharges.length,
                              ),
                            ),
                          ),

                        const SliverToBoxAdapter(
                            child: SizedBox(height: 110)),
                      ],
                    ),
                  ),
          ),
        ],
      ),
    );
  }
}

// ─────────────────────────────────────────────────────────────────────────────
//  Ambient Bg
// ─────────────────────────────────────────────────────────────────────────────
class _AmbientBg extends StatelessWidget {
  final AnimationController anim;
  final bool isDark;
  const _AmbientBg({required this.anim, required this.isDark});

  @override
  Widget build(BuildContext context) {
    return AnimatedBuilder(
      animation: anim,
      builder: (_, __) {
        final t = anim.value;
        return Stack(
          children: [
            Positioned(
              top: -60 + t * 30,
              right: -40 + t * 20,
              child: Container(
                width: 280,
                height: 280,
                decoration: BoxDecoration(
                  shape: BoxShape.circle,
                  gradient: RadialGradient(
                    colors: [
                      AppTheme.electricBlue
                          .withValues(alpha: isDark ? 0.18 : 0.10),
                      Colors.transparent,
                    ],
                  ),
                ),
              ),
            ),
            Positioned(
              bottom: 100 + t * 40,
              left: -60 + t * 20,
              child: Container(
                width: 220,
                height: 220,
                decoration: BoxDecoration(
                  shape: BoxShape.circle,
                  gradient: RadialGradient(
                    colors: [
                      AppTheme.violet
                          .withValues(alpha: isDark ? 0.14 : 0.07),
                      Colors.transparent,
                    ],
                  ),
                ),
              ),
            ),
          ],
        );
      },
    );
  }
}

// ─────────────────────────────────────────────────────────────────────────────
//  Header with Back Button
// ─────────────────────────────────────────────────────────────────────────────
class _Header extends StatelessWidget {
  final bool isDark;
  const _Header({required this.isDark});

  @override
  Widget build(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        // Back Button Row
        Row(
          children: [
            GestureDetector(
              onTap: () {
                HapticFeedback.lightImpact();
                Navigator.pop(context);
              },
              child: Container(
                width: 44,
                height: 44,
                decoration: BoxDecoration(
                  color: isDark
                      ? Colors.white.withValues(alpha: 0.08)
                      : Colors.white.withValues(alpha: 0.85),
                  borderRadius: BorderRadius.circular(14),
                  border: Border.all(
                    color: isDark
                        ? Colors.white.withValues(alpha: 0.12)
                        : Colors.black.withValues(alpha: 0.06),
                  ),
                  boxShadow: [
                    BoxShadow(
                      color: Colors.black.withValues(alpha: isDark ? 0.15 : 0.05),
                      blurRadius: 10,
                      offset: const Offset(0, 2),
                    ),
                  ],
                ),
                child: Icon(
                  Icons.arrow_back_ios_new_rounded,
                  color: isDark ? Colors.white : AppTheme.textPrimaryLight,
                  size: 18,
                ),
              ),
            ),
            const Spacer(),
            Container(
              width: 52,
              height: 52,
              decoration: BoxDecoration(
                gradient: const LinearGradient(
                  colors: [AppTheme.electricBlue, AppTheme.violet],
                  begin: Alignment.topLeft,
                  end: Alignment.bottomRight,
                ),
                borderRadius: BorderRadius.circular(18),
                boxShadow: [
                  BoxShadow(
                    color: AppTheme.electricBlue.withValues(alpha: 0.35),
                    blurRadius: 16,
                    offset: const Offset(0, 6),
                  )
                ],
              ),
              child: const Icon(Icons.phone_android_rounded,
                  color: Colors.white, size: 26),
            ),
          ],
        ),
        const SizedBox(height: 24),
        // Title Section
        ShaderMask(
          shaderCallback: (b) => const LinearGradient(
            colors: [AppTheme.electricBlue, AppTheme.violet],
          ).createShader(b),
          child: Text(
            'Recharge',
            style: AppTheme.display(Colors.white)
                .copyWith(fontSize: 36, height: 1.1, fontWeight: FontWeight.w900),
          ),
        ),
        const SizedBox(height: 6),
        Text(
          'Rechargez votre mobile instantanément',
          style: AppTheme.body(isDark
              ? Colors.white.withValues(alpha: 0.5)
              : AppTheme.textMutedLight).copyWith(fontSize: 15),
        ),
      ],
    );
  }
}

// ─────────────────────────────────────────────────────────────────────────────
//  Operator Card - Improved Design
// ─────────────────────────────────────────────────────────────────────────────
class _OperatorCard extends StatelessWidget {
  final _Operator op;
  final bool selected;
  final bool isDark;
  final VoidCallback onTap;
  const _OperatorCard(
      {required this.op,
      required this.selected,
      required this.isDark,
      required this.onTap});

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: () {
        HapticFeedback.lightImpact();
        onTap();
      },
      child: AnimatedContainer(
        duration: const Duration(milliseconds: 300),
        curve: Curves.easeOutCubic,
        padding: const EdgeInsets.symmetric(vertical: 18, horizontal: 8),
        decoration: BoxDecoration(
          gradient: selected
              ? LinearGradient(
                  colors: op.gradient,
                  begin: Alignment.topLeft,
                  end: Alignment.bottomRight,
                )
              : null,
          color: selected
              ? null
              : (isDark
                  ? Colors.white.withValues(alpha: 0.07)
                  : Colors.white.withValues(alpha: 0.90)),
          borderRadius: BorderRadius.circular(20),
          border: Border.all(
            color: selected
                ? op.gradient.first.withValues(alpha: 0.7)
                : (isDark
                    ? Colors.white.withValues(alpha: 0.12)
                    : Colors.black.withValues(alpha: 0.08)),
            width: selected ? 2.5 : 1.5,
          ),
          boxShadow: selected
              ? [
                  BoxShadow(
                    color: op.glow.withValues(alpha: 0.4),
                    blurRadius: 24,
                    spreadRadius: 2,
                    offset: const Offset(0, 8),
                  ),
                  BoxShadow(
                    color: op.glow.withValues(alpha: 0.2),
                    blurRadius: 40,
                    spreadRadius: 0,
                    offset: const Offset(0, 12),
                  ),
                ]
              : [
                  BoxShadow(
                    color: Colors.black.withValues(alpha: isDark ? 0.15 : 0.06),
                    blurRadius: 12,
                    offset: const Offset(0, 4),
                  ),
                ],
        ),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            // Logo container with improved styling
            AnimatedContainer(
              duration: const Duration(milliseconds: 300),
              padding: const EdgeInsets.all(10),
              decoration: BoxDecoration(
                color: selected 
                    ? Colors.white 
                    : (isDark 
                        ? Colors.white.withValues(alpha: 0.12) 
                        : Colors.white.withValues(alpha: 0.60)),
                shape: BoxShape.circle,
                boxShadow: selected ? [
                  BoxShadow(
                    color: Colors.black.withValues(alpha: 0.25),
                    blurRadius: 12,
                    offset: const Offset(0, 4)
                  )
                ] : [
                  BoxShadow(
                    color: Colors.black.withValues(alpha: isDark ? 0.1 : 0.04),
                    blurRadius: 6,
                    offset: const Offset(0, 2)
                  )
                ],
                border: selected ? Border.all(
                  color: Colors.white.withValues(alpha: 0.3),
                  width: 2,
                ) : null,
              ),
              child: op.logoPath.endsWith('.svg')
                  ? SvgPicture.asset(
                      op.logoPath,
                      width: 36,
                      height: 36,
                      fit: BoxFit.contain,
                      // Don't apply color filter - keep original colors
                    )
                  : Image.asset(
                      op.logoPath,
                      width: 36,
                      height: 36,
                      fit: BoxFit.contain,
                    ),
            ),
            const SizedBox(height: 12),
            Text(
              op.name,
              textAlign: TextAlign.center,
              maxLines: 1,
              overflow: TextOverflow.ellipsis,
              style: TextStyle(
                fontSize: 12,
                fontWeight: FontWeight.w800,
                color: selected
                    ? Colors.white
                    : (isDark ? Colors.white.withValues(alpha: 0.8) : AppTheme.textPrimaryLight),
                letterSpacing: 0.3,
                shadows: selected ? [
                  Shadow(
                    color: Colors.black.withValues(alpha: 0.2),
                    offset: const Offset(0, 1),
                    blurRadius: 2,
                  )
                ] : [],
              ),
            ),
          ],
        ),
      ),
    );
  }
}

// ─────────────────────────────────────────────────────────────────────────────
//  Glass Input - Improved Design
// ─────────────────────────────────────────────────────────────────────────────
class _GlassInput extends StatefulWidget {
  final TextEditingController controller;
  final FocusNode? focusNode;
  final bool isDark;
  final String hint;
  final IconData icon;
  final TextInputType? keyboardType;
  final List<TextInputFormatter>? inputFormatters;
  final ValueChanged<String>? onChanged;

  const _GlassInput({
    required this.controller,
    this.focusNode,
    required this.isDark,
    required this.hint,
    required this.icon,
    this.keyboardType,
    this.inputFormatters,
    this.onChanged,
  });

  @override
  State<_GlassInput> createState() => _GlassInputState();
}

class _GlassInputState extends State<_GlassInput> {
  bool _isFocused = false;

  @override
  void initState() {
    super.initState();
    widget.focusNode?.addListener(_onFocusChange);
  }

  @override
  void dispose() {
    widget.focusNode?.removeListener(_onFocusChange);
    super.dispose();
  }

  void _onFocusChange() {
    setState(() => _isFocused = widget.focusNode?.hasFocus ?? false);
  }

  @override
  Widget build(BuildContext context) {
    return AnimatedContainer(
      duration: const Duration(milliseconds: 250),
      decoration: BoxDecoration(
        color: widget.isDark
            ? Colors.white.withValues(alpha: _isFocused ? 0.09 : 0.06)
            : Colors.white.withValues(alpha: _isFocused ? 0.95 : 0.80),
        borderRadius: BorderRadius.circular(20),
        border: Border.all(
          color: _isFocused
              ? AppTheme.electricBlue.withValues(alpha: 0.5)
              : (widget.isDark
                  ? Colors.white.withValues(alpha: 0.12)
                  : Colors.black.withValues(alpha: 0.08)),
          width: _isFocused ? 2 : 1.5,
        ),
        boxShadow: _isFocused
            ? [
                BoxShadow(
                  color: AppTheme.electricBlue.withValues(alpha: 0.2),
                  blurRadius: 20,
                  spreadRadius: 0,
                  offset: const Offset(0, 4),
                ),
              ]
            : [
                BoxShadow(
                  color: Colors.black.withValues(alpha: widget.isDark ? 0.1 : 0.04),
                  blurRadius: 8,
                  offset: const Offset(0, 2),
                ),
              ],
      ),
      child: TextField(
        controller: widget.controller,
        focusNode: widget.focusNode,
        keyboardType: widget.keyboardType,
        inputFormatters: widget.inputFormatters,
        onChanged: widget.onChanged,
        style: AppTheme.body(
            widget.isDark ? AppTheme.textPrimaryDark : AppTheme.textPrimaryLight)
            .copyWith(fontSize: 16, fontWeight: FontWeight.w600, letterSpacing: 0.3),
        decoration: InputDecoration(
          hintText: widget.hint,
          hintStyle: AppTheme.body(widget.isDark
              ? Colors.white.withValues(alpha: 0.3)
              : Colors.black.withValues(alpha: 0.35)),
          prefixIcon: AnimatedContainer(
            duration: const Duration(milliseconds: 250),
            child: Icon(
              widget.icon,
              color: _isFocused
                  ? AppTheme.electricBlue
                  : (widget.isDark
                      ? Colors.white.withValues(alpha: 0.5)
                      : Colors.black.withValues(alpha: 0.4)),
              size: 22,
            ),
          ),
          border: InputBorder.none,
          contentPadding:
              const EdgeInsets.symmetric(horizontal: 18, vertical: 18),
        ),
      ),
    );
  }
}

// ─────────────────────────────────────────────────────────────────────────────
//  Amount Pill - Improved Design
// ─────────────────────────────────────────────────────────────────────────────
class _AmountPill extends StatelessWidget {
  final String label;
  final bool selected;
  final List<Color> gradient;
  final bool isDark;
  final VoidCallback onTap;
  const _AmountPill(
      {required this.label,
      required this.selected,
      required this.gradient,
      required this.isDark,
      required this.onTap});

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: () {
        HapticFeedback.selectionClick();
        onTap();
      },
      child: AnimatedContainer(
        duration: const Duration(milliseconds: 250),
        curve: Curves.easeOutCubic,
        padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 14),
        decoration: BoxDecoration(
          gradient: selected
              ? LinearGradient(
                  colors: gradient,
                  begin: Alignment.topLeft,
                  end: Alignment.bottomRight,
                )
              : null,
          color: selected
              ? null
              : (isDark
                  ? Colors.white.withValues(alpha: 0.08)
                  : Colors.white.withValues(alpha: 0.90)),
          borderRadius: BorderRadius.circular(50),
          border: Border.all(
            color: selected
                ? gradient.first.withValues(alpha: 0.6)
                : (isDark
                    ? Colors.white.withValues(alpha: 0.12)
                    : Colors.black.withValues(alpha: 0.08)),
            width: selected ? 2 : 1.5,
          ),
          boxShadow: selected
              ? [
                  BoxShadow(
                    color: gradient.first.withValues(alpha: 0.35),
                    blurRadius: 16,
                    spreadRadius: 0,
                    offset: const Offset(0, 4),
                  ),
                ]
              : [
                  BoxShadow(
                    color: Colors.black.withValues(alpha: isDark ? 0.1 : 0.04),
                    blurRadius: 6,
                    offset: const Offset(0, 2),
                  ),
                ],
        ),
        child: Text(
          label,
          style: TextStyle(
            fontSize: 14,
            fontWeight: FontWeight.w800,
            color: selected
                ? Colors.white
                : (isDark ? Colors.white.withValues(alpha: 0.7) : AppTheme.textPrimaryLight),
            letterSpacing: 0.3,
            shadows: selected ? [
              Shadow(
                color: Colors.black.withValues(alpha: 0.15),
                offset: const Offset(0, 1),
                blurRadius: 2,
              )
            ] : [],
          ),
        ),
      ),
    );
  }
}

// ─────────────────────────────────────────────────────────────────────────────
//  Recharger button - Improved Design
// ─────────────────────────────────────────────────────────────────────────────
class _RechargerButton extends StatelessWidget {
  final bool isDark;
  final bool loading;
  final List<Color> gradient;
  final Color glow;
  final VoidCallback onTap;
  const _RechargerButton(
      {required this.isDark,
      required this.loading,
      required this.gradient,
      required this.glow,
      required this.onTap});

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: loading ? null : () {
        HapticFeedback.mediumImpact();
        onTap();
      },
      child: AnimatedContainer(
        duration: const Duration(milliseconds: 250),
        height: 62,
        decoration: BoxDecoration(
          gradient: LinearGradient(
            colors: loading
                ? [Colors.grey.shade400, Colors.grey.shade500]
                : gradient,
            begin: Alignment.topLeft,
            end: Alignment.bottomRight,
          ),
          borderRadius: BorderRadius.circular(22),
          boxShadow: loading
              ? []
              : [
                  BoxShadow(
                    color: glow.withValues(alpha: 0.45),
                    blurRadius: 24,
                    spreadRadius: 2,
                    offset: const Offset(0, 8),
                  ),
                  BoxShadow(
                    color: glow.withValues(alpha: 0.2),
                    blurRadius: 40,
                    spreadRadius: 0,
                    offset: const Offset(0, 12),
                  ),
                ],
        ),
        child: Center(
          child: loading
              ? const SizedBox(
                  width: 26,
                  height: 26,
                  child: CircularProgressIndicator(
                      color: Colors.white, strokeWidth: 3),
                )
              : Row(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    const Icon(Icons.flash_on_rounded,
                        color: Colors.white, size: 22),
                    const SizedBox(width: 10),
                    Text(
                      'Recharger',
                      style: AppTheme.title(Colors.white).copyWith(
                        fontSize: 17,
                        letterSpacing: 0.5,
                        fontWeight: FontWeight.w900,
                        shadows: [
                          Shadow(
                            color: Colors.black.withValues(alpha: 0.2),
                            offset: const Offset(0, 1),
                            blurRadius: 2,
                          )
                        ],
                      ),
                    ),
                  ],
                ),
        ),
      ),
    );
  }
}

// ─────────────────────────────────────────────────────────────────────────────
//  History Card
// ─────────────────────────────────────────────────────────────────────────────
class _HistoryCard extends StatelessWidget {
  final Map<String, dynamic> recharge;
  final bool isDark;
  const _HistoryCard({required this.recharge, required this.isDark});

  @override
  Widget build(BuildContext context) {
    final phoneNumber = recharge['phoneNumber'] ?? '—';
    final operatorId = (recharge['operator'] ?? 'TUNISIE_TELECOM').toString().toUpperCase();
    final amount = (recharge['amount'] as num?)?.toDouble() ?? 0;
    final status = (recharge['status'] ?? 'PENDING').toString().toUpperCase();
    final date = recharge['createdAt'] != null
        ? DateTime.tryParse(recharge['createdAt'].toString()) ?? DateTime.now()
        : DateTime.now();

    final op = _operators.firstWhere(
      (o) => o.id == operatorId,
      orElse: () => _operators[1],
    );

    Color statusColor;
    String statusLabel;
    switch (status) {
      case 'COMPLETED':
        statusColor = AppTheme.emerald;
        statusLabel = 'Effectuée';
        break;
      case 'PENDING':
        statusColor = AppTheme.amber;
        statusLabel = 'En cours';
        break;
      case 'FAILED':
        statusColor = AppTheme.coralRed;
        statusLabel = 'Échouée';
        break;
      default:
        statusColor = AppTheme.textMutedLight;
        statusLabel = status;
    }

    return Container(
      margin: const EdgeInsets.only(bottom: 12),
      child: ClipRRect(
        borderRadius: BorderRadius.circular(20),
        child: BackdropFilter(
          filter: ImageFilter.blur(sigmaX: 8, sigmaY: 8),
          child: Container(
            padding: const EdgeInsets.all(16),
            decoration: BoxDecoration(
              color: isDark
                  ? Colors.white.withValues(alpha: 0.05)
                  : Colors.white.withValues(alpha: 0.80),
              borderRadius: BorderRadius.circular(20),
              border: Border.all(
                color: isDark
                    ? Colors.white.withValues(alpha: 0.08)
                    : Colors.black.withValues(alpha: 0.05),
              ),
            ),
            child: Row(
              children: [
                Container(
                  width: 48,
                  height: 48,
                  padding: const EdgeInsets.all(8),
                  decoration: BoxDecoration(
                    gradient: LinearGradient(
                      colors: op.gradient,
                      begin: Alignment.topLeft,
                      end: Alignment.bottomRight,
                    ),
                    borderRadius: BorderRadius.circular(14),
                    boxShadow: [
                      BoxShadow(
                        color: op.glow.withValues(alpha: 0.3),
                        blurRadius: 10,
                        offset: const Offset(0, 4),
                      )
                    ],
                  ),
                  child: op.logoPath.endsWith('.svg')
                      ? SvgPicture.asset(
                          op.logoPath,
                          width: 28,
                          height: 28,
                          fit: BoxFit.contain,
                        )
                      : Image.asset(
                          op.logoPath,
                          width: 28,
                          height: 28,
                          fit: BoxFit.contain,
                        ),
                ),
                const SizedBox(width: 14),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        phoneNumber,
                        style: AppTheme.body(isDark
                                ? AppTheme.textPrimaryDark
                                : AppTheme.textPrimaryLight)
                            .copyWith(
                                fontWeight: FontWeight.w800, fontSize: 15),
                      ),
                      const SizedBox(height: 2),
                      Text(
                        op.name,
                        style: AppTheme.caption(isDark
                            ? Colors.white38
                            : AppTheme.textMutedLight),
                      ),
                    ],
                  ),
                ),
                Column(
                  crossAxisAlignment: CrossAxisAlignment.end,
                  children: [
                    Text(
                      '${amount.toStringAsFixed(3)} TND',
                      style: AppTheme.body(AppTheme.electricBlue)
                          .copyWith(
                              fontWeight: FontWeight.w900, fontSize: 15),
                    ),
                    const SizedBox(height: 4),
                    Container(
                      padding: const EdgeInsets.symmetric(
                          horizontal: 8, vertical: 3),
                      decoration: BoxDecoration(
                        color: statusColor.withValues(alpha: 0.12),
                        borderRadius: BorderRadius.circular(8),
                      ),
                      child: Text(
                        statusLabel,
                        style: TextStyle(
                          color: statusColor,
                          fontSize: 10,
                          fontWeight: FontWeight.w800,
                        ),
                      ),
                    ),
                    const SizedBox(height: 4),
                    Text(
                      '${date.day.toString().padLeft(2, '0')}/${date.month.toString().padLeft(2, '0')}/${date.year}',
                      style: AppTheme.caption(isDark
                          ? Colors.white24
                          : AppTheme.textMutedLight),
                    ),
                  ],
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }
}

// ─────────────────────────────────────────────────────────────────────────────
//  Placeholder card (when no history)
// ─────────────────────────────────────────────────────────────────────────────
class _PlaceholderRechargeCard extends StatelessWidget {
  final _Operator op;
  final bool isDark;
  const _PlaceholderRechargeCard(
      {required this.op, required this.isDark});

  @override
  Widget build(BuildContext context) {
    return Container(
      margin: const EdgeInsets.only(bottom: 12),
      child: ClipRRect(
        borderRadius: BorderRadius.circular(20),
        child: BackdropFilter(
          filter: ImageFilter.blur(sigmaX: 8, sigmaY: 8),
          child: Container(
            padding: const EdgeInsets.all(16),
            decoration: BoxDecoration(
              color: isDark
                  ? Colors.white.withValues(alpha: 0.04)
                  : Colors.white.withValues(alpha: 0.70),
              borderRadius: BorderRadius.circular(20),
              border: Border.all(
                color: isDark
                    ? Colors.white.withValues(alpha: 0.06)
                    : Colors.black.withValues(alpha: 0.04),
              ),
            ),
            child: Row(
              children: [
                Container(
                  width: 48,
                  height: 48,
                  padding: const EdgeInsets.all(8),
                  decoration: BoxDecoration(
                    gradient: LinearGradient(
                      colors: op.gradient
                          .map((c) => c.withValues(alpha: 0.5))
                          .toList(),
                      begin: Alignment.topLeft,
                      end: Alignment.bottomRight,
                    ),
                    borderRadius: BorderRadius.circular(14),
                  ),
                  child: op.logoPath.endsWith('.svg')
                      ? SvgPicture.asset(
                          op.logoPath,
                          width: 28,
                          height: 28,
                          fit: BoxFit.contain,
                        )
                      : Image.asset(
                          op.logoPath,
                          width: 28,
                          height: 28,
                          fit: BoxFit.contain,
                        ),
                ),
                const SizedBox(width: 14),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Container(
                        height: 12,
                        width: 100,
                        decoration: BoxDecoration(
                          color: isDark
                              ? Colors.white.withValues(alpha: 0.08)
                              : Colors.black.withValues(alpha: 0.06),
                          borderRadius: BorderRadius.circular(6),
                        ),
                      ),
                      const SizedBox(height: 6),
                      Text(
                        op.name,
                        style: AppTheme.caption(
                            isDark ? Colors.white24 : Colors.black26),
                      ),
                    ],
                  ),
                ),
                Column(
                  crossAxisAlignment: CrossAxisAlignment.end,
                  children: [
                    Container(
                      height: 14,
                      width: 70,
                      decoration: BoxDecoration(
                        color: isDark
                            ? Colors.white.withValues(alpha: 0.08)
                            : Colors.black.withValues(alpha: 0.06),
                        borderRadius: BorderRadius.circular(7),
                      ),
                    ),
                    const SizedBox(height: 6),
                    Text(
                      'Aucune recharge',
                      style: AppTheme.caption(
                          isDark ? Colors.white.withOpacity(0.18) : Colors.black26)
                          .copyWith(fontSize: 9),
                    ),
                  ],
                ),
              ],
            ),
          ),
        ),
      )
          .animate(onPlay: (c) => c.repeat(reverse: true))
          .shimmer(duration: 1800.ms, color: Colors.white.withValues(alpha: 0.05)),
    );
  }
}

// ─────────────────────────────────────────────────────────────────────────────
//  Success Bottom Sheet
// ─────────────────────────────────────────────────────────────────────────────
class _SuccessSheet extends StatelessWidget {
  final _Operator operator;
  final String phone;
  final double amount;
  const _SuccessSheet(
      {required this.operator, required this.phone, required this.amount});

  @override
  Widget build(BuildContext context) {
    return Container(
      margin: const EdgeInsets.symmetric(horizontal: 16, vertical: 24),
      child: ClipRRect(
        borderRadius: BorderRadius.circular(32),
        child: BackdropFilter(
          filter: ImageFilter.blur(sigmaX: 20, sigmaY: 20),
          child: Container(
            padding: const EdgeInsets.fromLTRB(28, 32, 28, 40),
            decoration: BoxDecoration(
              gradient: LinearGradient(
                colors: [
                  Colors.white.withValues(alpha: 0.12),
                  Colors.white.withValues(alpha: 0.06),
                ],
                begin: Alignment.topCenter,
                end: Alignment.bottomCenter,
              ),
              borderRadius: BorderRadius.circular(32),
              border: Border.all(
                  color: Colors.white.withValues(alpha: 0.15)),
            ),
            child: Column(
              mainAxisSize: MainAxisSize.min,
              children: [
                // Green checkmark animation
                Container(
                  width: 90,
                  height: 90,
                  decoration: BoxDecoration(
                    shape: BoxShape.circle,
                    gradient: AppTheme.successGradient,
                    boxShadow: [
                      BoxShadow(
                        color: AppTheme.emerald.withValues(alpha: 0.4),
                        blurRadius: 24,
                        spreadRadius: 4,
                      )
                    ],
                  ),
                  child: const Icon(Icons.check_rounded,
                      color: Colors.white, size: 48),
                )
                    .animate()
                    .scale(
                        begin: const Offset(0, 0),
                        duration: 500.ms,
                        curve: Curves.elasticOut)
                    .fadeIn(),
                const SizedBox(height: 24),
                Text(
                  'Recharge Réussie!',
                  style: AppTheme.title(Colors.white)
                      .copyWith(fontSize: 22, fontWeight: FontWeight.w900),
                )
                    .animate()
                    .fadeIn(delay: 300.ms)
                    .slideY(begin: 0.2),
                const SizedBox(height: 8),
                Text(
                  '${amount.toStringAsFixed(3)} TND → $phone',
                  style: AppTheme.body(Colors.white70)
                      .copyWith(fontSize: 15),
                )
                    .animate()
                    .fadeIn(delay: 400.ms),
                const SizedBox(height: 6),
                Container(
                  padding: const EdgeInsets.symmetric(
                      horizontal: 14, vertical: 6),
                  decoration: BoxDecoration(
                    gradient: LinearGradient(colors: operator.gradient),
                    borderRadius: BorderRadius.circular(50),
                  ),
                  child: Row(
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      operator.logoPath.endsWith('.svg')
                          ? SvgPicture.asset(
                              operator.logoPath,
                              width: 20,
                              height: 20,
                            )
                          : Image.asset(
                              operator.logoPath,
                              width: 20,
                              height: 20,
                            ),
                      const SizedBox(width: 8),
                      Text(operator.name,
                          style: const TextStyle(
                              color: Colors.white,
                              fontWeight: FontWeight.w700,
                              fontSize: 13)),
                    ],
                  ),
                )
                    .animate()
                    .fadeIn(delay: 450.ms)
                    .scale(begin: const Offset(0.8, 0.8)),
                const SizedBox(height: 28),
                SizedBox(
                  width: double.infinity,
                  child: ElevatedButton(
                    onPressed: () => Navigator.pop(context),
                    style: ElevatedButton.styleFrom(
                      backgroundColor: AppTheme.electricBlue,
                      foregroundColor: Colors.white,
                      padding: const EdgeInsets.symmetric(vertical: 16),
                      shape: RoundedRectangleBorder(
                          borderRadius: BorderRadius.circular(18)),
                      elevation: 0,
                    ),
                    child: Text(
                      'Parfait!',
                      style: AppTheme.title(Colors.white)
                          .copyWith(fontSize: 15),
                    ),
                  ),
                )
                    .animate()
                    .fadeIn(delay: 550.ms)
                    .slideY(begin: 0.3),
              ],
            ),
          ),
        ),
      ),
    );
  }
}
