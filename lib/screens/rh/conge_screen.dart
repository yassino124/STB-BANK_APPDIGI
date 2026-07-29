import 'dart:math' as math;
import 'dart:async';
import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_animate/flutter_animate.dart';
import 'package:provider/provider.dart';
import 'package:intl/intl.dart';
import '../../providers/app_provider.dart';
import '../../theme/app_theme.dart';
import '../../services/auth_api_service.dart';
import '../../viewmodels/rh_viewmodel.dart';
import '../../models/rh_models.dart';
import 'ai_leave_planner_screen.dart';

class CongeScreen extends StatefulWidget {
  const CongeScreen({super.key});
  @override
  State<CongeScreen> createState() => _CongeScreenState();
}

class _CongeScreenState extends State<CongeScreen> with TickerProviderStateMixin {
  late AnimationController _counterCtrl;
  late Animation<double> _counterAnim;
  late AnimationController _waveCtrl;
  int _selectedType = 0; // 0=Repos, 1=Maladie, 2=Exceptionnel

  final _typeLabels = [
    'Repos', 
    'Maladie', 
    'Mariage', 
    'Naissance', 
    'Décès', 
    'Pèlerinage',
    'Sans Solde'
  ];
  
  final _typeIcons = [
    Icons.umbrella_rounded,          // Repos - plus relaxant
    Icons.medication_rounded,        // Maladie - icon médicaments
    Icons.favorite_rounded,          // Mariage - coeur
    Icons.child_care_rounded,        // Naissance - bébé
    Icons.sentiment_very_dissatisfied_rounded, // Décès - triste
    Icons.mosque_rounded,            // Pèlerinage - mosquée
    Icons.money_off_rounded,         // Sans Solde - pas d'argent
  ];

  bool _showNewRequestForm = false;

  String _durationStr = '1 jour';
  bool _isSubmitting = false;
  DateTime _startDate = DateTime.now();
  DateTime _endDate = DateTime.now().add(const Duration(days: 1));

  @override
  void initState() {
    super.initState();
    _counterCtrl = AnimationController(vsync: this, duration: const Duration(milliseconds: 1200));
    _counterAnim = CurvedAnimation(parent: _counterCtrl, curve: Curves.easeOutExpo);
    _counterCtrl.forward();
    _waveCtrl = AnimationController(vsync: this, duration: const Duration(milliseconds: 3000))..repeat();
    _loadRequests();
    
    // ✅ Auto-refresh every 10 seconds to catch status updates from RH dashboard
    _startAutoRefresh();
  }
  
  Timer? _autoRefreshTimer;
  
  void _startAutoRefresh() {
    WidgetsBinding.instance.addPostFrameCallback((_) {
      context.read<RhViewModel>().startPolling(conges: true);
    });
  }

  Future<void> _loadRequests() async {
    WidgetsBinding.instance.addPostFrameCallback((_) {
      context.read<RhViewModel>().loadConges();
    });
  }

  @override
  void dispose() {
    _counterCtrl.dispose();
    _waveCtrl.dispose();
    context.read<RhViewModel>().stopPolling();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final p = Provider.of<AppProvider>(context);
    final dk = p.themeMode == ThemeMode.dark;
    final fg = Theme.of(context).colorScheme.onSurface;
    final mt = dk ? const Color(0xFF94A3B8) : const Color(0xFF64748B);
    final cd = Theme.of(context).cardColor;
    final bd = dk ? Colors.white.withValues(alpha: 0.07) : Colors.black.withValues(alpha: 0.04);

    return Scaffold(
      backgroundColor: Theme.of(context).scaffoldBackgroundColor,
      floatingActionButton: GestureDetector(
        onTap: () {
          HapticFeedback.mediumImpact();
          final remaining = (p.userProfile?['soldeConges'] as num?)?.toInt() ?? 30;
          Navigator.push(context, MaterialPageRoute(
            builder: (_) => AILeavePlannerScreen(remainingDays: remaining),
          ));
        },
        child: Container(
          padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 14),
          decoration: BoxDecoration(
            gradient: const LinearGradient(
              colors: [Color(0xFF667EEA), Color(0xFF764BA2)],
              begin: Alignment.topLeft,
              end: Alignment.bottomRight,
            ),
            borderRadius: BorderRadius.circular(30),
            boxShadow: [
              BoxShadow(
                color: const Color(0xFF667EEA).withValues(alpha: 0.5),
                blurRadius: 20,
                spreadRadius: 2,
                offset: const Offset(0, 6),
              ),
              BoxShadow(
                color: Colors.black.withValues(alpha: 0.1),
                blurRadius: 10,
                offset: const Offset(0, 4),
              ),
            ],
          ),
          child: Row(
            mainAxisSize: MainAxisSize.min,
            children: [
              Container(
                padding: const EdgeInsets.all(8),
                decoration: BoxDecoration(
                  color: Colors.white.withValues(alpha: 0.2),
                  shape: BoxShape.circle,
                ),
                child: const Icon(
                  Icons.auto_awesome_rounded, 
                  color: Colors.white, 
                  size: 20
                ),
              ),
              const SizedBox(width: 12),
              const Column(
                mainAxisSize: MainAxisSize.min,
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    'Planifier avec l\'IA',
                    style: TextStyle(
                      color: Colors.white,
                      fontSize: 14,
                      fontWeight: FontWeight.w800,
                      letterSpacing: 0.3,
                    ),
                  ),
                  Text(
                    'Smart dates suggestion',
                    style: TextStyle(
                      color: Colors.white70,
                      fontSize: 10,
                      fontWeight: FontWeight.w600,
                    ),
                  ),
                ],
              ),
            ],
          ),
        ),
      ),
      floatingActionButtonLocation: FloatingActionButtonLocation.centerFloat,
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
                        Text("Mes Congés", style: TextStyle(color: fg, fontSize: 22, fontWeight: FontWeight.w800, letterSpacing: -0.5)),
                        Text("Solde & Demandes", style: TextStyle(color: mt, fontSize: 12, fontWeight: FontWeight.w600)),
                      ],
                    ),
                  ),
                  GestureDetector(
                    onTap: () {
                      HapticFeedback.lightImpact();
                      setState(() => _showNewRequestForm = !_showNewRequestForm);
                    },
                    child: Container(
                      width: 44, height: 44,
                      decoration: BoxDecoration(
                        gradient: const LinearGradient(colors: [AppTheme.electricBlue, AppTheme.royalBlue]),
                        borderRadius: BorderRadius.circular(14),
                        boxShadow: [BoxShadow(color: AppTheme.electricBlue.withValues(alpha: 0.3), blurRadius: 10, offset: const Offset(0, 4))],
                      ),
                      child: const Icon(Icons.add_rounded, color: Colors.white, size: 22),
                    ),
                  ),
                ],
              ).animate().fadeIn(),
            ),

            const SizedBox(height: 20),

            Expanded(
              child: SingleChildScrollView(
                physics: const BouncingScrollPhysics(),
                padding: const EdgeInsets.symmetric(horizontal: 20),
                child: Column(
                  children: [
                    // Animated Solde Card
                    _buildSoldeCard(fg, mt, cd, bd, dk),
                    const SizedBox(height: 20),

                    // Type Selector
                    _buildTypeSelector(fg, mt, cd, bd),
                    const SizedBox(height: 20),

                    // New Request Form (collapsible)
                    if (_showNewRequestForm) ...[
                      _buildNewRequestForm(fg, mt, cd, bd, dk),
                      const SizedBox(height: 20),
                    ],

                    // Demandes List
                    Consumer<RhViewModel>(
                      builder: (context, vm, child) {
                        return _buildHistory(vm, fg, mt, cd, bd, dk);
                      },
                    ),

                    const SizedBox(height: 20),
                  ],
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildSoldeCard(Color fg, Color mt, Color cd, Color bd, bool dk) {
    final p = Provider.of<AppProvider>(context, listen: false);
    final solde = (p.userProfile?['soldeConges'] as num?)?.toInt() ?? 30;
    return Container(
      padding: const EdgeInsets.all(24),
      decoration: BoxDecoration(
        gradient: LinearGradient(
          colors: dk
              ? [const Color(0xFF003D30), const Color(0xFF001A14)]
              : [const Color(0xFF00BFA5), const Color(0xFF00897B)],
          begin: Alignment.topLeft,
          end: Alignment.bottomRight,
        ),
        borderRadius: BorderRadius.circular(28),
        boxShadow: [
          BoxShadow(
            color: const Color(0xFF00BFA5).withValues(alpha: 0.35),
            blurRadius: 24,
            offset: const Offset(0, 8),
          ),
        ],
      ),
      child: Column(
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              const Text(
                "Solde Annuel Disponible",
                style: TextStyle(color: Colors.white70, fontSize: 12, fontWeight: FontWeight.w600, letterSpacing: 0.3),
              ),
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                decoration: BoxDecoration(
                  color: Colors.white.withValues(alpha: 0.15),
                  borderRadius: BorderRadius.circular(10),
                ),
                child: const Text(
                  "2026", style: TextStyle(color: Colors.white, fontSize: 11, fontWeight: FontWeight.w800),
                ),
              ),
            ],
          ),
          const SizedBox(height: 24),
          Row(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              // Circular liquid gauge
              SizedBox(
                width: 110,
                height: 110,
                child: AnimatedBuilder(
                  animation: Listenable.merge([_counterAnim, _waveCtrl]),
                  builder: (_, __) {
                    return CustomPaint(
                      painter: LiquidGaugePainter(
                        fraction: (solde / 90) * _counterAnim.value,
                        wavePhase: _waveCtrl.value * 2 * math.pi,
                      ),
                      child: Center(
                        child: Column(
                          mainAxisAlignment: MainAxisAlignment.center,
                          children: [
                            Text(
                              "${(solde * _counterAnim.value).round()}",
                              style: const TextStyle(
                                color: Colors.white,
                                fontSize: 36,
                                fontWeight: FontWeight.w900,
                                letterSpacing: -1,
                                shadows: [Shadow(color: Colors.black26, blurRadius: 4, offset: Offset(0, 2))],
                              ),
                            ),
                            const Text(
                              "jours",
                              style: TextStyle(
                                color: Colors.white,
                                fontSize: 10,
                                fontWeight: FontWeight.w700,
                                shadows: [Shadow(color: Colors.black26, blurRadius: 4, offset: Offset(0, 1))],
                              ),
                            ),
                          ],
                        ),
                      ),
                    );
                  }
                ),
              ),
              const SizedBox(width: 32),
              // Digit details
              Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  _statRow(Icons.check_circle_outline_rounded, "Disponible", "$solde j", const Color(0xFF00E676)),
                  const SizedBox(height: 10),
                  _statRow(Icons.history_rounded, "Utilisés", "${90 - solde} j", Colors.white70),
                  const SizedBox(height: 10),
                  _statRow(Icons.pie_chart_outline_rounded, "Total Annuel", "90 j", Colors.white54),
                ],
              ),
            ],
          ),
        ],
      ),
    ).animate().fadeIn(delay: 100.ms).slideY(begin: 0.05);
  }

  Widget _statRow(IconData icon, String label, String value, Color color) {
    return Row(
      mainAxisSize: MainAxisSize.min,
      children: [
        Icon(icon, color: color, size: 14),
        const SizedBox(width: 8),
        Text(
          "$label : ",
          style: const TextStyle(color: Colors.white70, fontSize: 11, fontWeight: FontWeight.w600),
        ),
        Text(
          value,
          style: const TextStyle(color: Colors.white, fontSize: 12, fontWeight: FontWeight.w800),
        ),
      ],
    );
  }

  Widget _buildTypeSelector(Color fg, Color mt, Color cd, Color bd) {
    return Container(
      height: 56,
      decoration: BoxDecoration(
        color: cd,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: bd),
      ),
      child: ListView.builder(
        scrollDirection: Axis.horizontal,
        padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 6),
        itemCount: _typeLabels.length,
        itemBuilder: (context, index) {
          final sel = _selectedType == index;
          return GestureDetector(
            onTap: () {
              HapticFeedback.selectionClick();
              setState(() => _selectedType = index);
            },
            child: AnimatedContainer(
              duration: const Duration(milliseconds: 250),
              margin: const EdgeInsets.only(right: 8),
              padding: const EdgeInsets.symmetric(horizontal: 16),
              decoration: BoxDecoration(
                gradient: sel
                    ? const LinearGradient(colors: [Color(0xFF00BFA5), Color(0xFF00897B)])
                    : null,
                color: sel ? null : Colors.transparent,
                borderRadius: BorderRadius.circular(12),
              ),
              child: Row(
                mainAxisSize: MainAxisSize.min,
                children: [
                  Icon(_typeIcons[index], color: sel ? Colors.white : mt, size: 18),
                  const SizedBox(width: 8),
                  Text(
                    _typeLabels[index],
                    style: TextStyle(
                      color: sel ? Colors.white : mt,
                      fontSize: 13,
                      fontWeight: FontWeight.w700,
                    ),
                  ),
                ],
              ),
            ),
          );
        },
      ),
    );
  }

  Widget _buildNewRequestForm(Color fg, Color mt, Color cd, Color bd, bool dk) {
    final selectedTypeLabel = _typeLabels[_selectedType];
    final durationDays = _endDate.difference(_startDate).inDays + 1;
    
    return Container(
      padding: const EdgeInsets.all(20),
      decoration: BoxDecoration(
        color: cd,
        borderRadius: BorderRadius.circular(24),
        border: Border.all(color: const Color(0xFF00BFA5).withValues(alpha: 0.3)),
        boxShadow: [
          BoxShadow(color: const Color(0xFF00BFA5).withValues(alpha: 0.1), blurRadius: 20, offset: const Offset(0, 8)),
        ],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              Container(
                width: 32, height: 32,
                decoration: BoxDecoration(
                  color: const Color(0xFF00BFA5).withValues(alpha: 0.12),
                  borderRadius: BorderRadius.circular(10),
                ),
                child: const Icon(Icons.edit_calendar_rounded, color: Color(0xFF00BFA5), size: 16),
              ),
              const SizedBox(width: 12),
              Text("Nouvelle Demande", style: TextStyle(color: fg, fontSize: 16, fontWeight: FontWeight.w800)),
            ],
          ),
          const SizedBox(height: 18),
          // Type de congé sélectionné
          Container(
            padding: const EdgeInsets.all(12),
            decoration: BoxDecoration(
              color: const Color(0xFF00BFA5).withValues(alpha: 0.08),
              borderRadius: BorderRadius.circular(12),
            ),
            child: Row(
              children: [
                Icon(_typeIcons[_selectedType], color: const Color(0xFF00BFA5), size: 18),
                const SizedBox(width: 10),
                Text(
                  "Type : $selectedTypeLabel",
                  style: TextStyle(color: fg, fontSize: 13, fontWeight: FontWeight.w700),
                ),
              ],
            ),
          ),
          const SizedBox(height: 18),
          _buildDateField("Date Début", true, fg, mt, cd, bd, dk),
          const SizedBox(height: 12),
          _buildDateField("Date Fin", false, fg, mt, cd, bd, dk),
          const SizedBox(height: 16),
          // Durée calculée
          Container(
            padding: const EdgeInsets.all(12),
            decoration: BoxDecoration(
              color: dk ? Colors.white.withValues(alpha: 0.03) : const Color(0xFFF8FAFC),
              borderRadius: BorderRadius.circular(12),
            ),
            child: Row(
              children: [
                Icon(Icons.timelapse_rounded, color: mt, size: 16),
                const SizedBox(width: 10),
                Text(
                  "Durée : $durationDays jour${durationDays > 1 ? 's' : ''}",
                  style: TextStyle(color: fg, fontSize: 13, fontWeight: FontWeight.w600),
                ),
              ],
            ),
          ),
          const SizedBox(height: 20),
          // Bouton Soumettre
          GestureDetector(
            onTap: _isSubmitting ? null : _submitRequest,
            child: Container(
              width: double.infinity,
              padding: const EdgeInsets.symmetric(vertical: 16),
              decoration: BoxDecoration(
                gradient: _isSubmitting
                    ? null
                    : const LinearGradient(colors: [Color(0xFF00BFA5), Color(0xFF00897B)]),
                color: _isSubmitting ? Colors.grey.withValues(alpha: 0.3) : null,
                borderRadius: BorderRadius.circular(16),
                boxShadow: _isSubmitting ? [] : [
                  BoxShadow(
                    color: const Color(0xFF00BFA5).withValues(alpha: 0.3),
                    blurRadius: 12,
                    offset: const Offset(0, 6),
                  ),
                ],
              ),
              child: Row(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  if (_isSubmitting)
                    const SizedBox(
                      width: 16,
                      height: 16,
                      child: CircularProgressIndicator(
                        strokeWidth: 2,
                        valueColor: AlwaysStoppedAnimation(Colors.white),
                      ),
                    )
                  else
                    const Icon(Icons.send_rounded, color: Colors.white, size: 18),
                  const SizedBox(width: 10),
                  Text(
                    _isSubmitting ? "Envoi en cours..." : "Soumettre la demande",
                    style: const TextStyle(
                      color: Colors.white,
                      fontSize: 15,
                      fontWeight: FontWeight.w800,
                      letterSpacing: 0.3,
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

  Future<void> _submitRequest() async {
    setState(() => _isSubmitting = true);
    HapticFeedback.mediumImpact();
    
    try {
      final typeMapping = {
        0: 'REPOS',
        1: 'MALADIE',
        2: 'MARIAGE',
        3: 'NAISSANCE',
        4: 'DECES',
        5: 'PELERINAGE',
        6: 'SANS_SOLDE',
      };
      
      final type = typeMapping[_selectedType] ?? 'REPOS';
      final motif = "Congé ${_typeLabels[_selectedType]} ${DateFormat('dd/MM', 'fr').format(_startDate)} - ${DateFormat('dd/MM', 'fr').format(_endDate)}";
      
      final result = await AuthApiService.createConge(
        type: type,
        startDate: _startDate.toIso8601String(),
        endDate: _endDate.toIso8601String(),
        motif: motif,
      );
      
      if (result.isSuccess && mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Row(
              children: const [
                Icon(Icons.check_circle_rounded, color: Colors.white, size: 20),
                SizedBox(width: 12),
                Text("Demande envoyée avec succès!", style: TextStyle(fontWeight: FontWeight.w700)),
              ],
            ),
            backgroundColor: const Color(0xFF10B981),
            behavior: SnackBarBehavior.floating,
            shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
            duration: const Duration(seconds: 3),
          ),
        );
        
        // Recharger la liste
        if (mounted) {
          context.read<RhViewModel>().loadConges();
        }
        
        // Fermer le formulaire
        setState(() {
          _showNewRequestForm = false;
          _startDate = DateTime.now();
          _endDate = DateTime.now().add(const Duration(days: 1));
        });
      } else if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text(result.error ?? "Erreur lors de l'envoi"),
            backgroundColor: const Color(0xFFEF4444),
            behavior: SnackBarBehavior.floating,
          ),
        );
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text("Erreur : $e"),
            backgroundColor: const Color(0xFFEF4444),
            behavior: SnackBarBehavior.floating,
          ),
        );
      }
    } finally {
      if (mounted) {
        setState(() => _isSubmitting = false);
      }
    }
  }

  Widget _buildDateField(String label, bool isStart, Color fg, Color mt, Color cd, Color bd, bool dk) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(label, style: TextStyle(color: mt, fontSize: 12, fontWeight: FontWeight.w600)),
        const SizedBox(height: 8),
        GestureDetector(
          onTap: () async {
            HapticFeedback.lightImpact();
            final picked = await showDatePicker(
              context: context,
              initialDate: isStart ? _startDate : _endDate,
              firstDate: DateTime.now(),
              lastDate: DateTime.now().add(const Duration(days: 365)),
              locale: const Locale('fr', 'FR'),
              builder: (context, child) {
                return Theme(
                  data: Theme.of(context).copyWith(
                    colorScheme: ColorScheme.light(
                      primary: const Color(0xFF00BFA5),
                      onPrimary: Colors.white,
                      surface: cd,
                      onSurface: fg,
                    ),
                  ),
                  child: child!,
                );
              },
            );
            if (picked != null) {
              setState(() {
                if (isStart) {
                  _startDate = picked;
                  // Ajuster endDate si nécessaire
                  if (_endDate.isBefore(_startDate)) {
                    _endDate = _startDate.add(const Duration(days: 1));
                  }
                } else {
                  _endDate = picked;
                }
              });
            }
          },
          child: Container(
            padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 14),
            decoration: BoxDecoration(
              color: dk ? Colors.white.withValues(alpha: 0.03) : const Color(0xFFF8FAFC),
              borderRadius: BorderRadius.circular(12),
              border: Border.all(color: bd),
            ),
            child: Row(
              children: [
                Icon(Icons.calendar_today_rounded, color: mt, size: 16),
                const SizedBox(width: 12),
                Text(
                  DateFormat('dd MMM yyyy', 'fr').format(isStart ? _startDate : _endDate),
                  style: TextStyle(color: fg, fontSize: 14, fontWeight: FontWeight.w600),
                ),
                const Spacer(),
                Icon(Icons.edit_rounded, color: mt, size: 14),
              ],
            ),
          ),
        ),
      ],
    );
  }

  Widget _buildHistory(RhViewModel vm, Color fg, Color mt, Color cd, Color bd, bool dk) {
    if (vm.congesLoading) {
      return const Center(child: CircularProgressIndicator());
    }
    if (vm.conges.isEmpty) {
      return Padding(
        padding: const EdgeInsets.all(24),
        child: Center(
          child: Text(
            "Aucune demande récente",
            style: TextStyle(color: mt, fontSize: 14),
          ),
        ),
      );
    }
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text("Historique", style: TextStyle(color: fg, fontSize: 18, fontWeight: FontWeight.w800)),
        const SizedBox(height: 16),
        ...vm.conges.map((d) => _buildDemandeCard(d, fg, mt, cd, bd, dk)),
      ],
    );
  }

  Widget _buildDemandeCard(CongeRequest d, Color fg, Color mt, Color cd, Color bd, bool dk) {
    final status = d.status;

    Color statusColor;
    String statusText;

    switch (status) {
      case RhStatus.approuve:
        statusColor = const Color(0xFF10B981);
        statusText = 'Approuvée';
        break;
      case RhStatus.rejete:
        statusColor = const Color(0xFFEF4444);
        statusText = 'Refusée';
        break;
      case RhStatus.annule:
        statusColor = const Color(0xFF94A3B8);
        statusText = 'Annulée';
        break;
      case RhStatus.traite:
        statusColor = const Color(0xFF3B82F6);
        statusText = 'Traitée';
        break;
      default:
        statusColor = const Color(0xFFF59E0B);
        statusText = 'En cours';
    }

    // Dynamic icon and color per congé type
    final typeConfig = _getCongeTypeConfig(d.type);
    final typeIcon = typeConfig.$1;
    final typeColor = typeConfig.$2;

    return Container(
      margin: const EdgeInsets.only(bottom: 12),
      decoration: BoxDecoration(
        color: cd,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: bd),
        boxShadow: [
          BoxShadow(color: Colors.black.withValues(alpha: dk ? 0.15 : 0.04), blurRadius: 10, offset: const Offset(0, 4)),
        ],
      ),
      child: ClipRRect(
        borderRadius: BorderRadius.circular(16),
        child: IntrinsicHeight(
          child: Row(
            children: [
              // Colored left accent bar
              Container(width: 4, color: typeColor),
              Expanded(
                child: Padding(
                  padding: const EdgeInsets.all(14),
                  child: Row(
                    children: [
                      // Type icon in colored bubble
                      Container(
                        width: 44,
                        height: 44,
                        decoration: BoxDecoration(
                          color: typeColor.withValues(alpha: 0.12),
                          borderRadius: BorderRadius.circular(12),
                        ),
                        child: Icon(typeIcon, color: typeColor, size: 22),
                      ),
                      const SizedBox(width: 14),
                      Expanded(
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          mainAxisAlignment: MainAxisAlignment.center,
                          children: [
                            Text(
                              d.type.label,
                              style: TextStyle(color: fg, fontSize: 15, fontWeight: FontWeight.w700),
                            ),
                            const SizedBox(height: 3),
                            Text(
                              "${d.dureeDays} jour(s)  ·  ${DateFormat('dd/MM/yyyy', 'fr').format(d.startDate)}",
                              style: TextStyle(color: mt, fontSize: 12, fontWeight: FontWeight.w500),
                            ),
                          ],
                        ),
                      ),
                      const SizedBox(width: 8),
                      // Status chip
                      Column(
                        mainAxisAlignment: MainAxisAlignment.center,
                        crossAxisAlignment: CrossAxisAlignment.end,
                        children: [
                          Container(
                            padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 5),
                            decoration: BoxDecoration(
                              color: statusColor.withValues(alpha: 0.12),
                              borderRadius: BorderRadius.circular(20),
                            ),
                            child: Row(
                              mainAxisSize: MainAxisSize.min,
                              children: [
                                Container(width: 6, height: 6, decoration: BoxDecoration(color: statusColor, shape: BoxShape.circle)),
                                const SizedBox(width: 5),
                                Text(statusText, style: TextStyle(color: statusColor, fontSize: 11, fontWeight: FontWeight.w700)),
                              ],
                            ),
                          ),
                          const SizedBox(height: 4),
                          Text(
                            DateFormat('dd/MM/yyyy', 'fr').format(d.createdAt),
                            style: TextStyle(color: mt, fontSize: 10),
                          ),
                        ],
                      ),
                    ],
                  ),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }

  /// Returns (icon, color) for each congé type
  (IconData, Color) _getCongeTypeConfig(CongeType type) {
    switch (type) {
      case CongeType.repos:
        return (Icons.beach_access_rounded, const Color(0xFF00BFA5));
      case CongeType.maladie:
        return (Icons.medical_services_rounded, const Color(0xFFEF4444));
      case CongeType.mariage:
        return (Icons.favorite_rounded, const Color(0xFFEC4899));
      case CongeType.naissance:
        return (Icons.child_care_rounded, const Color(0xFF06B6D4));
      case CongeType.deces:
        return (Icons.sentiment_very_dissatisfied_rounded, const Color(0xFF64748B));
      case CongeType.pelerinage:
        return (Icons.mosque_rounded, const Color(0xFF8B5CF6));
      case CongeType.sansSolde:
        return (Icons.money_off_rounded, const Color(0xFFF59E0B));
    }
  }
}

// Missing classes like LiquidGaugePainter will be recreated below.
class LiquidGaugePainter extends CustomPainter {
  final double fraction;
  final double wavePhase;
  LiquidGaugePainter({required this.fraction, required this.wavePhase});

  @override
  void paint(Canvas canvas, Size size) {
    final center = Offset(size.width / 2, size.height / 2);
    final radius = size.width / 2;
    
    final bgPaint = Paint()..color = Colors.white.withValues(alpha: 0.1)..style = PaintingStyle.fill;
    canvas.drawCircle(center, radius, bgPaint);

    final path = Path();
    final waveHeight = 5.0;
    final baseHeight = size.height - (size.height * fraction);

    path.moveTo(0, size.height);
    path.lineTo(0, baseHeight);

    for (double i = 0; i <= size.width; i++) {
      path.lineTo(i, baseHeight + math.sin((i / size.width * 2 * math.pi) + wavePhase) * waveHeight);
    }
    
    path.lineTo(size.width, size.height);
    path.close();

    final clipPath = Path()..addOval(Rect.fromCircle(center: center, radius: radius));
    canvas.clipPath(clipPath);

    final wavePaint = Paint()
      ..shader = const LinearGradient(
        colors: [Color(0xFF00E676), Color(0xFF00BFA5)],
        begin: Alignment.topCenter,
        end: Alignment.bottomCenter,
      ).createShader(Rect.fromLTWH(0, 0, size.width, size.height));

    canvas.drawPath(path, wavePaint);
    
    final borderPaint = Paint()
      ..color = Colors.white.withValues(alpha: 0.2)
      ..style = PaintingStyle.stroke
      ..strokeWidth = 2;
    canvas.drawCircle(center, radius - 1, borderPaint);
  }

  @override
  bool shouldRepaint(covariant CustomPainter oldDelegate) => true;
}
