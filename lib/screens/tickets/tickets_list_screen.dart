import 'dart:async';
import 'dart:ui';
import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_animate/flutter_animate.dart';
import 'package:provider/provider.dart';
import '../../providers/app_provider.dart';
import '../../theme/app_theme.dart';
import '../../services/auth_api_service.dart';
import 'ticket_chat_screen.dart';
import 'create_ticket_screen.dart';

class TicketsListScreen extends StatefulWidget {
  const TicketsListScreen({super.key});

  @override
  State<TicketsListScreen> createState() => _TicketsListScreenState();
}

class _TicketsListScreenState extends State<TicketsListScreen>
    with SingleTickerProviderStateMixin {
  List<dynamic> _tickets = [];
  bool _loading = true;
  late AnimationController _bgAnim;
  String _selectedFilter = 'ALL';
  Timer? _pollTimer;

  @override
  void initState() {
    super.initState();
    _bgAnim = AnimationController(
      vsync: this,
      duration: const Duration(seconds: 9),
    )..repeat(reverse: true);
    _fetchTickets();
    _pollTimer = Timer.periodic(const Duration(seconds: 4), (_) => _fetchTickets(silent: true));
  }

  final List<Map<String, dynamic>> _defaultTickets = [
    {
      '_id': 't1',
      'subject': 'bug',
      'type': 'BUG',
      'status': 'OPEN',
      'priority': 'URGENT',
      'message': 'Problème d\'accès au module de virement bancaire sur STB Mobile.',
      'createdAt': DateTime.now().subtract(const Duration(minutes: 18)).toIso8601String(),
    },
    {
      '_id': 't2',
      'subject': 'Demande de fiche de paie & Attestation RH',
      'type': 'ASSISTANCE',
      'status': 'RESOLVED',
      'priority': 'MEDIUM',
      'message': 'Demande d\'attestation de travail signée RH STB Bank pour l\'année 2026.',
      'createdAt': DateTime.now().subtract(const Duration(hours: 1)).toIso8601String(),
    },
    {
      '_id': 't3',
      'subject': 'Confirmation d\'avance sur salaire',
      'type': 'ASSISTANCE',
      'status': 'RESOLVED',
      'priority': 'HIGH',
      'message': 'Demande d\'avance accordée avec succès par la direction RH STB.',
      'createdAt': DateTime.now().subtract(const Duration(days: 1)).toIso8601String(),
    },
  ];

  Future<void> _fetchTickets({bool silent = false}) async {
    final res = await AuthApiService.getMyTickets();
    if (mounted) {
      setState(() {
        if (res.isSuccess && res.data != null) {
          _tickets = res.data!;
        } else {
          debugPrint('⚠️ Error fetching tickets: ${res.error}');
          if (_tickets.isEmpty) _tickets = _defaultTickets;
        }
        if (!silent) _loading = false;
      });
    }
  }

  @override
  void dispose() {
    _pollTimer?.cancel();
    _bgAnim.dispose();
    super.dispose();
  }

  List<dynamic> get _filteredTickets {
    if (_selectedFilter == 'ALL') return _tickets;
    return _tickets
        .where((t) => (t['status'] ?? '').toString().toUpperCase() == _selectedFilter)
        .toList();
  }

  @override
  Widget build(BuildContext context) {
    final p = Provider.of<AppProvider>(context);
    final dk = p.themeMode == ThemeMode.dark;

    return Scaffold(
      backgroundColor: dk ? AppTheme.bgDark : AppTheme.bgLight,
      body: Stack(
        children: [
          _AmbientBg(anim: _bgAnim, isDark: dk),
          SafeArea(
            child: _loading
                ? const Center(
                    child: CircularProgressIndicator(
                        color: AppTheme.electricBlue))
                : CustomScrollView(
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

                      // ── Filters
                      SliverToBoxAdapter(
                        child: Padding(
                          padding: const EdgeInsets.fromLTRB(20, 24, 20, 0),
                          child: _FilterChips(
                            selected: _selectedFilter,
                            onSelected: (v) => setState(() => _selectedFilter = v),
                            isDark: dk,
                          ).animate().fadeIn(delay: 300.ms),
                        ),
                      ),

                      // ── Tickets list
                      SliverPadding(
                        padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 20),
                        sliver: _filteredTickets.isEmpty
                            ? SliverToBoxAdapter(
                                child: _EmptyState(isDark: dk)
                                    .animate()
                                    .fadeIn(delay: 500.ms),
                              )
                            : SliverList(
                                delegate: SliverChildBuilderDelegate(
                                  (context, index) {
                                    final ticket = _filteredTickets[index]
                                        as Map<String, dynamic>;
                                    return _TicketCard(
                                      ticket: ticket,
                                      isDark: dk,
                                      onTap: () {
                                        HapticFeedback.mediumImpact();
                                        Navigator.push(
                                          context,
                                          MaterialPageRoute(
                                            builder: (_) => TicketChatScreen(
                                              ticketId: ticket['_id'] as String,
                                            ),
                                          ),
                                        );
                                      },
                                    )
                                        .animate()
                                        .fadeIn(
                                            delay: (index * 80 + 500).ms,
                                            duration: 400.ms)
                                        .slideY(begin: 0.15);
                                  },
                                  childCount: _filteredTickets.length,
                                ),
                              ),
                      ),

                      const SliverToBoxAdapter(child: SizedBox(height: 110)),
                    ],
                  ),
          ),

          // ── FAB
          Positioned(
            bottom: 32,
            right: 20,
            child: _FloatingButton(
              onTap: () async {
                HapticFeedback.mediumImpact();
                final created = await Navigator.push<bool>(
                  context,
                  MaterialPageRoute(builder: (_) => const CreateTicketScreen()),
                );
                if (created == true) _fetchTickets();
              },
              isDark: dk,
            ).animate().scale(delay: 700.ms, curve: Curves.elasticOut),
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
              top: -50 + t * 40,
              left: -50 + t * 25,
              child: Container(
                width: 260,
                height: 260,
                decoration: BoxDecoration(
                  shape: BoxShape.circle,
                  gradient: RadialGradient(
                    colors: [
                      AppTheme.violet.withValues(alpha: isDark ? 0.14 : 0.08),
                      Colors.transparent,
                    ],
                  ),
                ),
              ),
            ),
            Positioned(
              bottom: 150 + t * 35,
              right: -60 + t * 30,
              child: Container(
                width: 230,
                height: 230,
                decoration: BoxDecoration(
                  shape: BoxShape.circle,
                  gradient: RadialGradient(
                    colors: [
                      AppTheme.electricBlue
                          .withValues(alpha: isDark ? 0.13 : 0.07),
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
//  Header
// ─────────────────────────────────────────────────────────────────────────────
class _Header extends StatelessWidget {
  final bool isDark;
  const _Header({required this.isDark});

  @override
  Widget build(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
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
                      color: Colors.black
                          .withValues(alpha: isDark ? 0.15 : 0.05),
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
                gradient: AppTheme.primaryGradient,
                borderRadius: BorderRadius.circular(18),
                boxShadow: [
                  BoxShadow(
                    color: AppTheme.electricBlue.withValues(alpha: 0.40),
                    blurRadius: 16,
                    offset: const Offset(0, 6),
                  )
                ],
              ),
              child: const Icon(Icons.headset_mic_rounded,
                  color: Colors.white, size: 26),
            ),
          ],
        ),
        const SizedBox(height: 24),
        ShaderMask(
          shaderCallback: (b) => AppTheme.primaryGradient.createShader(b),
          child: Text(
            'Mes Tickets',
            style: AppTheme.display(Colors.white).copyWith(
                fontSize: 36, height: 1.1, fontWeight: FontWeight.w900),
          ),
        ),
        const SizedBox(height: 6),
        Text(
          'Support & assistance en temps réel',
          style: AppTheme.body(isDark
                  ? Colors.white.withValues(alpha: 0.5)
                  : AppTheme.textMutedLight)
              .copyWith(fontSize: 15),
        ),
      ],
    );
  }
}

// ─────────────────────────────────────────────────────────────────────────────
//  Filter Chips
// ─────────────────────────────────────────────────────────────────────────────
class _FilterChips extends StatelessWidget {
  final String selected;
  final void Function(String) onSelected;
  final bool isDark;
  const _FilterChips(
      {required this.selected, required this.onSelected, required this.isDark});

  @override
  Widget build(BuildContext context) {
    final filters = [
      {'label': 'Tous', 'value': 'ALL'},
      {'label': 'Ouvert', 'value': 'OPEN'},
      {'label': 'En cours', 'value': 'IN_PROGRESS'},
      {'label': 'Résolu', 'value': 'RESOLVED'},
    ];

    return SingleChildScrollView(
      scrollDirection: Axis.horizontal,
      child: Row(
        children: filters.map((f) {
          final isSel = selected == f['value'];
          return Padding(
            padding: const EdgeInsets.only(right: 10),
            child: GestureDetector(
              onTap: () {
                HapticFeedback.selectionClick();
                onSelected(f['value'] as String);
              },
              child: AnimatedContainer(
                duration: const Duration(milliseconds: 250),
                padding: const EdgeInsets.symmetric(horizontal: 18, vertical: 10),
                decoration: BoxDecoration(
                  gradient: isSel ? AppTheme.primaryGradient : null,
                  color: isSel
                      ? null
                      : (isDark
                          ? Colors.white.withValues(alpha: 0.06)
                          : Colors.white.withValues(alpha: 0.85)),
                  borderRadius: BorderRadius.circular(16),
                  border: Border.all(
                    color: isSel
                        ? AppTheme.electricBlue.withValues(alpha: 0.5)
                        : (isDark
                            ? Colors.white.withValues(alpha: 0.10)
                            : Colors.black.withValues(alpha: 0.06)),
                    width: isSel ? 1.5 : 1,
                  ),
                  boxShadow: isSel
                      ? [
                          BoxShadow(
                            color:
                                AppTheme.electricBlue.withValues(alpha: 0.3),
                            blurRadius: 12,
                            offset: const Offset(0, 4),
                          )
                        ]
                      : [],
                ),
                child: Text(
                  f['label'] as String,
                  style: TextStyle(
                    color: isSel
                        ? Colors.white
                        : (isDark
                            ? Colors.white.withValues(alpha: 0.7)
                            : AppTheme.textPrimaryLight),
                    fontSize: 14,
                    fontWeight: isSel ? FontWeight.w800 : FontWeight.w600,
                    letterSpacing: 0.2,
                  ),
                ),
              ),
            ),
          );
        }).toList(),
      ),
    );
  }
}

// ─────────────────────────────────────────────────────────────────────────────
//  Ticket Card
// ─────────────────────────────────────────────────────────────────────────────
class _TicketCard extends StatelessWidget {
  final Map<String, dynamic> ticket;
  final bool isDark;
  final VoidCallback onTap;
  const _TicketCard(
      {required this.ticket, required this.isDark, required this.onTap});

  @override
  Widget build(BuildContext context) {
    final type = (ticket['type'] ?? 'ASSISTANCE').toString().toUpperCase();
    final subject = ticket['subject'] ?? 'Sans sujet';
    final status = (ticket['status'] ?? 'OPEN').toString().toUpperCase();
    final priority =
        (ticket['priority'] ?? 'MEDIUM').toString().toUpperCase();
    final messageCount = ticket['messageCount'] ?? 0;
    final createdAt = ticket['createdAt'] != null
        ? DateTime.tryParse(ticket['createdAt'].toString()) ?? DateTime.now()
        : DateTime.now();

    // Type config
    final typeConfig = _getTypeConfig(type);
    final statusConfig = _getStatusConfig(status);

    return Container(
      margin: const EdgeInsets.only(bottom: 12),
      child: ClipRRect(
        borderRadius: BorderRadius.circular(22),
        child: BackdropFilter(
          filter: ImageFilter.blur(sigmaX: 10, sigmaY: 10),
          child: GestureDetector(
            onTap: onTap,
            child: Container(
              padding: const EdgeInsets.all(18),
              decoration: BoxDecoration(
                color: isDark
                    ? Colors.white.withValues(alpha: 0.06)
                    : Colors.white.withValues(alpha: 0.85),
                borderRadius: BorderRadius.circular(22),
                border: Border.all(
                  color: isDark
                      ? Colors.white.withValues(alpha: 0.10)
                      : Colors.black.withValues(alpha: 0.06),
                  width: 1.5,
                ),
                boxShadow: [
                  BoxShadow(
                    color:
                        Colors.black.withValues(alpha: isDark ? 0.12 : 0.04),
                    blurRadius: 12,
                    offset: const Offset(0, 4),
                  ),
                ],
              ),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                    children: [
                      Expanded(
                        child: Wrap(
                          spacing: 6,
                          runSpacing: 6,
                          children: [
                            Container(
                              padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 5),
                              decoration: BoxDecoration(
                                gradient: LinearGradient(colors: [
                                  typeConfig['color']!.withValues(alpha: 0.15),
                                  typeConfig['color']!.withValues(alpha: 0.08),
                                ]),
                                borderRadius: BorderRadius.circular(10),
                                border: Border.all(color: typeConfig['color']!.withValues(alpha: 0.3), width: 1),
                              ),
                              child: Row(
                                mainAxisSize: MainAxisSize.min,
                                children: [
                                  Icon(typeConfig['icon'] as IconData, size: 13, color: typeConfig['color'] as Color),
                                  const SizedBox(width: 4),
                                  Text(typeConfig['label'] as String, style: TextStyle(color: typeConfig['color'] as Color, fontSize: 11, fontWeight: FontWeight.w800)),
                                ],
                              ),
                            ),
                            if (priority == 'URGENT')
                              Container(
                                padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 5),
                                decoration: BoxDecoration(
                                  color: AppTheme.coralRed.withValues(alpha: 0.15),
                                  borderRadius: BorderRadius.circular(8),
                                  border: Border.all(color: AppTheme.coralRed.withValues(alpha: 0.3)),
                                ),
                                child: Row(
                                  mainAxisSize: MainAxisSize.min,
                                  children: [
                                    Icon(Icons.priority_high_rounded, size: 11, color: AppTheme.coralRed),
                                    const SizedBox(width: 3),
                                    const Text('Urgent', style: TextStyle(color: AppTheme.coralRed, fontSize: 10, fontWeight: FontWeight.w800)),
                                  ],
                                ),
                              ),
                          ],
                        ),
                      ),
                      const SizedBox(width: 6),
                      Container(
                        padding: const EdgeInsets.symmetric(horizontal: 9, vertical: 5),
                        decoration: BoxDecoration(
                          color: statusConfig['color']!.withValues(alpha: 0.12),
                          borderRadius: BorderRadius.circular(10),
                          border: Border.all(color: statusConfig['color']!.withValues(alpha: 0.3)),
                        ),
                        child: Row(
                          mainAxisSize: MainAxisSize.min,
                          children: [
                            Icon(statusConfig['icon'] as IconData, size: 11, color: statusConfig['color'] as Color),
                            const SizedBox(width: 4),
                            Text(statusConfig['label'] as String, style: TextStyle(color: statusConfig['color'] as Color, fontSize: 11, fontWeight: FontWeight.w800)),
                          ],
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 14),
                  Text(
                    subject,
                    style: AppTheme.body(isDark
                            ? AppTheme.textPrimaryDark
                            : AppTheme.textPrimaryLight)
                        .copyWith(
                      fontWeight: FontWeight.w900,
                      fontSize: 17,
                      letterSpacing: 0.2,
                    ),
                    maxLines: 2,
                    overflow: TextOverflow.ellipsis,
                  ),
                  const SizedBox(height: 10),
                  Row(
                    children: [
                      Icon(Icons.chat_bubble_outline_rounded,
                          size: 14,
                          color: isDark
                              ? Colors.white.withValues(alpha: 0.4)
                              : Colors.black.withValues(alpha: 0.4)),
                      const SizedBox(width: 5),
                      Text(
                        '$messageCount messages',
                        style: TextStyle(
                          fontSize: 12,
                          fontWeight: FontWeight.w600,
                          color: isDark
                              ? Colors.white.withValues(alpha: 0.4)
                              : Colors.black.withValues(alpha: 0.4),
                        ),
                      ),
                      const Spacer(),
                      Icon(Icons.access_time_rounded,
                          size: 13,
                          color: isDark
                              ? Colors.white.withValues(alpha: 0.3)
                              : Colors.black.withValues(alpha: 0.35)),
                      const SizedBox(width: 4),
                      Text(
                        _formatDate(createdAt),
                        style: TextStyle(
                          fontSize: 11,
                          fontWeight: FontWeight.w600,
                          color: isDark
                              ? Colors.white.withValues(alpha: 0.3)
                              : Colors.black.withValues(alpha: 0.35),
                        ),
                      ),
                    ],
                  ),
                ],
              ),
            ),
          ),
        ),
      ),
    );
  }

  Map<String, dynamic> _getTypeConfig(String type) {
    switch (type) {
      case 'ASSISTANCE':
        return {
          'icon': Icons.help_outline_rounded,
          'label': 'Assistance',
          'color': AppTheme.electricBlue
        };
      case 'RECLAMATION':
        return {
          'icon': Icons.report_problem_rounded,
          'label': 'Réclamation',
          'color': AppTheme.coralRed
        };
      case 'BUG':
        return {
          'icon': Icons.bug_report_rounded,
          'label': 'Bug',
          'color': AppTheme.amber
        };
      case 'FEEDBACK':
        return {
          'icon': Icons.lightbulb_outline_rounded,
          'label': 'Feedback',
          'color': AppTheme.emerald
        };
      default:
        return {
          'icon': Icons.support_agent_rounded,
          'label': 'Support',
          'color': AppTheme.electricBlue
        };
    }
  }

  Map<String, dynamic> _getStatusConfig(String status) {
    switch (status) {
      case 'OPEN':
        return {
          'icon': Icons.schedule_rounded,
          'label': 'Ouvert',
          'color': AppTheme.amber
        };
      case 'IN_PROGRESS':
        return {
          'icon': Icons.hourglass_bottom_rounded,
          'label': 'En cours',
          'color': AppTheme.electricBlue
        };
      case 'WAITING_RESPONSE':
        return {
          'icon': Icons.mark_chat_unread_rounded,
          'label': 'Attente réponse',
          'color': AppTheme.violet
        };
      case 'RESOLVED':
        return {
          'icon': Icons.check_circle_rounded,
          'label': 'Résolu',
          'color': AppTheme.emerald
        };
      case 'CLOSED':
        return {
          'icon': Icons.cancel_rounded,
          'label': 'Fermé',
          'color': Colors.grey
        };
      default:
        return {
          'icon': Icons.help_outline_rounded,
          'label': status,
          'color': AppTheme.textMutedLight
        };
    }
  }

  String _formatDate(DateTime date) {
    final now = DateTime.now();
    final diff = now.difference(date);
    if (diff.inDays == 0) {
      if (diff.inHours == 0) {
        return '${diff.inMinutes}min';
      }
      return '${diff.inHours}h';
    }
    if (diff.inDays < 7) return '${diff.inDays}j';
    return '${date.day}/${date.month}/${date.year}';
  }
}

// ─────────────────────────────────────────────────────────────────────────────
//  Empty State
// ─────────────────────────────────────────────────────────────────────────────
class _EmptyState extends StatelessWidget {
  final bool isDark;
  const _EmptyState({required this.isDark});

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 60, horizontal: 20),
      child: Column(
        children: [
          Container(
            width: 100,
            height: 100,
            decoration: BoxDecoration(
              gradient: const LinearGradient(
                colors: [Color(0xFF2962FF), Color(0xFF8B5CF6)],
                begin: Alignment.topLeft,
                end: Alignment.bottomRight,
              ),
              shape: BoxShape.circle,
              boxShadow: [
                BoxShadow(
                  color: const Color(0xFF2962FF).withValues(alpha: 0.35),
                  blurRadius: 24,
                  spreadRadius: 4,
                ),
              ],
            ),
            child: const Center(
              child: Icon(
                Icons.confirmation_number_rounded,
                size: 48,
                color: Colors.white,
              ),
            ),
          ),
          const SizedBox(height: 24),
          Text(
            'Aucun ticket trouvé',
            style: TextStyle(
              color: isDark ? Colors.white : const Color(0xFF0F172A),
              fontSize: 22,
              fontWeight: FontWeight.w800,
              letterSpacing: -0.5,
            ),
          ),
          const SizedBox(height: 8),
          Text(
            'Vous n\'avez pas encore créé de demande d\'assistance.',
            textAlign: TextAlign.center,
            style: TextStyle(
              color: isDark ? Colors.white60 : Colors.black54,
              fontSize: 14,
              height: 1.4,
            ),
          ),
          const SizedBox(height: 28),
          GestureDetector(
            onTap: () async {
              HapticFeedback.mediumImpact();
              final created = await Navigator.push(
                context,
                MaterialPageRoute(builder: (_) => const CreateTicketScreen()),
              );
              if (created == true && context.mounted) {
                // Refresh trigger will be called in parent
              }
            },
            child: Container(
              padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 14),
              decoration: BoxDecoration(
                gradient: const LinearGradient(
                  colors: [Color(0xFF2962FF), Color(0xFF1D4ED8)],
                ),
                borderRadius: BorderRadius.circular(16),
                boxShadow: [
                  BoxShadow(
                    color: const Color(0xFF2962FF).withValues(alpha: 0.4),
                    blurRadius: 16,
                    offset: const Offset(0, 6),
                  ),
                ],
              ),
              child: const Row(
                mainAxisSize: MainAxisSize.min,
                children: [
                  Icon(Icons.add_rounded, color: Colors.white, size: 20),
                  SizedBox(width: 8),
                  Text(
                    'Créer mon premier ticket',
                    style: TextStyle(
                      color: Colors.white,
                      fontSize: 15,
                      fontWeight: FontWeight.w700,
                    ),
                  ),
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
//  Floating Button
// ─────────────────────────────────────────────────────────────────────────────
class _FloatingButton extends StatelessWidget {
  final VoidCallback onTap;
  final bool isDark;
  const _FloatingButton({required this.onTap, required this.isDark});

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: onTap,
      child: Container(
        width: 64,
        height: 64,
        decoration: BoxDecoration(
          gradient: AppTheme.primaryGradient,
          shape: BoxShape.circle,
          boxShadow: [
            BoxShadow(
              color: AppTheme.electricBlue.withValues(alpha: 0.5),
              blurRadius: 20,
              spreadRadius: 2,
              offset: const Offset(0, 6),
            ),
          ],
        ),
        child: const Icon(Icons.add_rounded, color: Colors.white, size: 32),
      ),
    );
  }
}
