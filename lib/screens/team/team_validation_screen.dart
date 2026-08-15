import 'dart:async';
import 'dart:convert';
import 'dart:math' as math;
import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_animate/flutter_animate.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:provider/provider.dart';
import '../../providers/app_provider.dart';
import '../../services/auth_api_service.dart';
import '../../widgets/approval_tracker.dart';

class TeamValidationScreen extends StatefulWidget {
  const TeamValidationScreen({super.key});
  @override
  State<TeamValidationScreen> createState() => _TeamValidationScreenState();
}

class _TeamValidationScreenState extends State<TeamValidationScreen>
    with TickerProviderStateMixin {
  int _tabIndex = 0;
  List<dynamic> _leaveRequests = [];
  List<dynamic> _absenceRequests = [];
  bool _loading = true;
  String? _error;

  @override
  void initState() {
    super.initState();
    _loadPending();
  }

  Future<void> _loadPending() async {
    setState(() { _loading = true; _error = null; });
    try {
      final leaveRes = await AuthApiService.getPendingApprovals();
      final absenceRes = await AuthApiService.getPendingAbsencesForManager();
      if (mounted) {
        setState(() {
          _leaveRequests = leaveRes.isSuccess ? (leaveRes.data ?? []) : [];
          _absenceRequests = absenceRes.isSuccess ? (absenceRes.data ?? []) : [];
          _loading = false;
        });
      }
    } catch (e) {
      if (mounted) setState(() { _loading = false; _error = e.toString(); });
    }
  }

  Future<void> _handleLeaveDecision(int index, String decision) async {
    HapticFeedback.mediumImpact();
    final request = _leaveRequests[index];
    final leaveId = request['_id'] as String;
    String? commentaire;
    if (decision == 'REJECTED') {
      commentaire = await _showRejectDialog();
      if (commentaire == null) return;
    }
    setState(() => _leaveRequests.removeAt(index));
    final res = await AuthApiService.handleLeaveApproval(
      leaveRequestId: leaveId,
      decision: decision,
      commentaire: commentaire,
    );
    if (!res.isSuccess && mounted) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text(res.error ?? 'Erreur'), backgroundColor: Colors.red),
      );
      _loadPending();
    }
  }

  Future<void> _handleAbsenceDecision(int index, String decision) async {
    HapticFeedback.mediumImpact();
    final request = _absenceRequests[index];
    final absenceId = request['_id'] as String;
    String? commentaire;
    if (decision == 'REJECTED') {
      commentaire = await _showRejectDialog();
      if (commentaire == null) return;
    }
    setState(() => _absenceRequests.removeAt(index));
    final res = await AuthApiService.handleAbsenceManagerApproval(
      absenceId: absenceId,
      decision: decision,
      commentaire: commentaire,
    );
    if (!res.isSuccess && mounted) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text(res.error ?? 'Erreur'), backgroundColor: Colors.red),
      );
      _loadPending();
    }
  }

  Future<String?> _showRejectDialog() async {
    final ctrl = TextEditingController();
    return showModalBottomSheet<String>(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      builder: (ctx) => Padding(
        padding: EdgeInsets.only(bottom: MediaQuery.of(ctx).viewInsets.bottom),
        child: Container(
          decoration: const BoxDecoration(
            color: Color(0xFF0F1B2D),
            borderRadius: BorderRadius.vertical(top: Radius.circular(24)),
          ),
          padding: const EdgeInsets.all(24),
          child: Column(mainAxisSize: MainAxisSize.min, crossAxisAlignment: CrossAxisAlignment.start, children: [
            Row(children: [
              Container(padding: const EdgeInsets.all(8), decoration: BoxDecoration(color: Colors.red.withValues(alpha: 0.15), shape: BoxShape.circle),
                child: const Icon(Icons.close_rounded, color: Colors.red, size: 18)),
              const SizedBox(width: 12),
              Text('Motif de refus', style: GoogleFonts.outfit(color: Colors.white, fontSize: 18, fontWeight: FontWeight.w800)),
            ]),
            const SizedBox(height: 16),
            TextField(
              controller: ctrl,
              autofocus: true,
              style: const TextStyle(color: Colors.white),
              maxLines: 3,
              decoration: InputDecoration(
                hintText: 'Expliquez le motif du refus...',
                hintStyle: const TextStyle(color: Colors.white38),
                filled: true, fillColor: Colors.white.withValues(alpha: 0.07),
                border: OutlineInputBorder(borderRadius: BorderRadius.circular(14), borderSide: BorderSide.none),
              ),
            ),
            const SizedBox(height: 16),
            Row(children: [
              Expanded(child: OutlinedButton(
                onPressed: () => Navigator.pop(ctx, null),
                style: OutlinedButton.styleFrom(foregroundColor: Colors.white60, side: const BorderSide(color: Colors.white24), padding: const EdgeInsets.symmetric(vertical: 14), shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12))),
                child: const Text('Annuler'),
              )),
              const SizedBox(width: 12),
              Expanded(child: ElevatedButton(
                onPressed: () => Navigator.pop(ctx, ctrl.text.trim().isEmpty ? 'Refus sans motif' : ctrl.text.trim()),
                style: ElevatedButton.styleFrom(backgroundColor: Colors.red, foregroundColor: Colors.white, padding: const EdgeInsets.symmetric(vertical: 14), shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12))),
                child: const Text('Confirmer le refus', style: TextStyle(fontWeight: FontWeight.w700)),
              )),
            ]),
          ]),
        ),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    final p = Provider.of<AppProvider>(context);
    final dk = p.themeMode == ThemeMode.dark;
    final bg = dk ? const Color(0xFF060D1A) : const Color(0xFFF8FAFC);

    final currentList = _tabIndex == 0 ? _leaveRequests : _absenceRequests;
    final pendingLeave = _leaveRequests.length;
    final pendingAbsence = _absenceRequests.length;

    return Scaffold(
      backgroundColor: bg,
      body: NestedScrollView(
        headerSliverBuilder: (context, _) => [
          SliverAppBar(
            pinned: true,
            expandedHeight: 160,
            backgroundColor: Colors.transparent,
            surfaceTintColor: Colors.transparent,
            elevation: 0,
            flexibleSpace: FlexibleSpaceBar(
              background: Container(
                decoration: const BoxDecoration(
                  gradient: LinearGradient(
                    colors: [Color(0xFF1E3A8A), Color(0xFF2962FF), Color(0xFF00B4FF)],
                    begin: Alignment.topLeft,
                    end: Alignment.bottomRight,
                  ),
                ),
                child: SafeArea(
                  child: Padding(
                    padding: const EdgeInsets.fromLTRB(20, 16, 20, 0),
                    child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
                      Row(children: [
                        GestureDetector(
                          onTap: () {
                            HapticFeedback.lightImpact();
                            Navigator.of(context).pop();
                          },
                          child: Container(
                            padding: const EdgeInsets.all(10),
                            decoration: BoxDecoration(
                              color: Colors.white.withValues(alpha: 0.15), 
                              shape: BoxShape.circle,
                              border: Border.all(color: Colors.white.withValues(alpha: 0.2), width: 1),
                            ),
                            child: const Icon(Icons.arrow_back_rounded, color: Colors.white, size: 22),
                          ),
                        ),
                        const SizedBox(width: 12),
                        Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
                          Text('Mon Équipe', style: GoogleFonts.outfit(color: Colors.white, fontSize: 22, fontWeight: FontWeight.w900)),
                          Text('Validation des demandes', style: GoogleFonts.inter(color: Colors.white70, fontSize: 12)),
                        ]),
                        const Spacer(),
                        IconButton(
                          onPressed: _loadPending,
                          icon: const Icon(Icons.refresh_rounded, color: Colors.white),
                        ),
                      ]),
                      const SizedBox(height: 16),
                      Row(children: [
                        _StatChip(icon: Icons.beach_access_rounded, label: 'Congés', count: pendingLeave, color: const Color(0xFF93C5FD)),
                        const SizedBox(width: 12),
                        _StatChip(icon: Icons.event_busy_rounded, label: 'Absences', count: pendingAbsence, color: const Color(0xFFFBBF24)),
                      ]),
                    ]),
                  ),
                ),
              ),
            ),
            bottom: PreferredSize(
              preferredSize: const Size.fromHeight(52),
              child: Container(
                color: dk ? const Color(0xFF0D1F35) : Colors.white,
                child: Row(children: [
                  _TabBtn(label: 'Congés', icon: Icons.beach_access_rounded, count: pendingLeave, selected: _tabIndex == 0, onTap: () => setState(() => _tabIndex = 0), color: const Color(0xFF2962FF)),
                  _TabBtn(label: 'Absences', icon: Icons.event_busy_rounded, count: pendingAbsence, selected: _tabIndex == 1, onTap: () => setState(() => _tabIndex = 1), color: const Color(0xFFF59E0B)),
                ]),
              ),
            ),
          ),
        ],
        body: _loading
            ? const Center(child: CircularProgressIndicator(color: Color(0xFF2962FF)))
            : _error != null
                ? _ErrorView(error: _error!, onRetry: _loadPending, dk: dk)
                : currentList.isEmpty
                    ? _EmptyView(tabIndex: _tabIndex, dk: dk)
                    : _SwipeCardStack(
                        requests: currentList,
                        isLeave: _tabIndex == 0,
                        dk: dk,
                        onApprove: (i) => _tabIndex == 0 ? _handleLeaveDecision(i, 'APPROVED') : _handleAbsenceDecision(i, 'APPROVED'),
                        onReject: (i) => _tabIndex == 0 ? _handleLeaveDecision(i, 'REJECTED') : _handleAbsenceDecision(i, 'REJECTED'),
                      ),
      ),
    );
  }
}

// ── Swipe Card Stack ─────────────────────────────────────────────────────────
class _SwipeCardStack extends StatefulWidget {
  final List<dynamic> requests;
  final bool isLeave;
  final bool dk;
  final Function(int) onApprove;
  final Function(int) onReject;

  const _SwipeCardStack({required this.requests, required this.isLeave, required this.dk, required this.onApprove, required this.onReject});

  @override
  State<_SwipeCardStack> createState() => _SwipeCardStackState();
}

class _SwipeCardStackState extends State<_SwipeCardStack> with SingleTickerProviderStateMixin {
  late AnimationController _animCtrl;
  Offset _dragOffset = Offset.zero;
  bool _isDragging = false;
  static const double _swipeThreshold = 100.0;

  @override
  void initState() {
    super.initState();
    _animCtrl = AnimationController(vsync: this, duration: const Duration(milliseconds: 300));
  }

  @override
  void dispose() { _animCtrl.dispose(); super.dispose(); }

  void _onPanStart(DragStartDetails d) => setState(() { _isDragging = true; _dragOffset = Offset.zero; });

  void _onPanUpdate(DragUpdateDetails d) => setState(() => _dragOffset += d.delta);

  void _onPanEnd(DragEndDetails d) {
    final dx = _dragOffset.dx;
    if (dx > _swipeThreshold) {
      widget.onApprove(0);
    } else if (dx < -_swipeThreshold) {
      widget.onReject(0);
    }
    setState(() { _isDragging = false; _dragOffset = Offset.zero; });
  }

  @override
  Widget build(BuildContext context) {
    final swipeRatio = (_dragOffset.dx / _swipeThreshold).clamp(-1.0, 1.0);
    final isApproving = swipeRatio > 0.15;
    final isRejecting = swipeRatio < -0.15;

    return Column(children: [
      // Hint row
      Padding(
        padding: const EdgeInsets.fromLTRB(24, 16, 24, 8),
        child: Row(mainAxisAlignment: MainAxisAlignment.spaceBetween, children: [
          Row(children: [
            const Icon(Icons.arrow_back_rounded, color: Colors.red, size: 16),
            const SizedBox(width: 4),
            Text('Refuser', style: GoogleFonts.inter(color: Colors.red, fontSize: 12, fontWeight: FontWeight.w600)),
          ]),
          Text('${widget.requests.length} en attente', style: GoogleFonts.inter(color: Colors.white54, fontSize: 12)),
          Row(children: [
            Text('Approuver', style: GoogleFonts.inter(color: Colors.green, fontSize: 12, fontWeight: FontWeight.w600)),
            const SizedBox(width: 4),
            const Icon(Icons.arrow_forward_rounded, color: Colors.green, size: 16),
          ]),
        ]),
      ),

      // Card Stack
      Expanded(
        child: Stack(alignment: Alignment.center, children: [
          // Background cards (peek effect)
          ...widget.requests.reversed.toList().asMap().entries.map((e) {
            final stackIndex = widget.requests.length - 1 - e.key;
            if (stackIndex == 0) return const SizedBox.shrink();
            final scale = 1.0 - (stackIndex * 0.04).clamp(0, 0.12);
            final offsetY = (stackIndex * 12.0).clamp(0.0, 36.0);
            return Transform.translate(
              offset: Offset(0, offsetY),
              child: Transform.scale(
                scale: scale,
                child: _RequestCard(request: widget.requests[e.key], isLeave: widget.isLeave, dk: widget.dk, swipeRatio: 0, isApproving: false, isRejecting: false),
              ),
            );
          }),

          // Top draggable card
          if (widget.requests.isNotEmpty)
            GestureDetector(
              onPanStart: _onPanStart,
              onPanUpdate: _onPanUpdate,
              onPanEnd: _onPanEnd,
              child: Transform.translate(
                offset: _dragOffset,
                child: Transform.rotate(
                  angle: _dragOffset.dx / 600 * math.pi / 8,
                  child: _RequestCard(
                    request: widget.requests[0],
                    isLeave: widget.isLeave,
                    dk: widget.dk,
                    swipeRatio: swipeRatio,
                    isApproving: isApproving,
                    isRejecting: isRejecting,
                  ),
                ),
              ),
            ),
        ]),
      ),

      // Action Buttons
      Padding(
        padding: const EdgeInsets.fromLTRB(24, 16, 24, 32),
        child: Row(children: [
          Expanded(child: _ActionBtn(
            icon: Icons.close_rounded,
            label: 'Refuser',
            color: Colors.red,
            onTap: widget.requests.isNotEmpty ? () => widget.onReject(0) : null,
          )),
          const SizedBox(width: 20),
          Expanded(child: _ActionBtn(
            icon: Icons.check_rounded,
            label: 'Approuver',
            color: Colors.green,
            onTap: widget.requests.isNotEmpty ? () => widget.onApprove(0) : null,
          )),
        ]),
      ),
    ]);
  }
}

// ── Request Card ─────────────────────────────────────────────────────────────
class _RequestCard extends StatelessWidget {
  final dynamic request;
  final bool isLeave;
  final bool dk;
  final double swipeRatio;
  final bool isApproving;
  final bool isRejecting;

  const _RequestCard({required this.request, required this.isLeave, required this.dk, required this.swipeRatio, required this.isApproving, required this.isRejecting});

  @override
  Widget build(BuildContext context) {
    final emp = request['employee'] ?? request['employeeId'] ?? {};
    final prenom = emp['prenom']?.toString() ?? 'Collaborateur';
    final nom = emp['nom']?.toString() ?? '';
    final poste = emp['poste']?.toString() ?? '';
    final avatar = emp['avatar']?.toString();
    final initials = '${prenom.isNotEmpty ? prenom[0] : '?'}${nom.isNotEmpty ? nom[0] : ''}';

    // Leave specific
    final startDate = _formatDate(request['startDate']?.toString() ?? request['dateDebut']?.toString() ?? '');
    final endDate = _formatDate(request['endDate']?.toString() ?? request['dateFin']?.toString() ?? '');
    final days = request['numberOfDays']?.toString() ?? request['nbJours']?.toString() ?? '?';
    final type = request['type']?.toString() ?? 'CONGE';
    final motif = request['motif']?.toString() ?? request['description']?.toString() ?? '';
    final solde = request['soldeConges']?.toString() ?? emp['soldeConges']?.toString() ?? '?';

    Color approveOverlay = Colors.green.withValues(alpha: isApproving ? 0.15 : 0);
    Color rejectOverlay = Colors.red.withValues(alpha: isRejecting ? 0.15 : 0);

    return Container(
      width: MediaQuery.of(context).size.width - 48,
      margin: const EdgeInsets.symmetric(horizontal: 0),
      decoration: BoxDecoration(
        color: dk ? const Color(0xFF0F1B2D) : Colors.white,
        borderRadius: BorderRadius.circular(24),
        border: Border.all(
          color: isApproving ? Colors.green.withValues(alpha: 0.5) : isRejecting ? Colors.red.withValues(alpha: 0.5) : (dk ? Colors.white.withValues(alpha: 0.08) : Colors.black.withValues(alpha: 0.06)),
          width: isApproving || isRejecting ? 2 : 1,
        ),
        boxShadow: [BoxShadow(color: Colors.black.withValues(alpha: 0.2), blurRadius: 30, offset: const Offset(0, 12))],
      ),
      child: Stack(children: [
        // Swipe overlay
        if (isApproving)
          Positioned.fill(child: Container(decoration: BoxDecoration(color: approveOverlay, borderRadius: BorderRadius.circular(24)))),
        if (isRejecting)
          Positioned.fill(child: Container(decoration: BoxDecoration(color: rejectOverlay, borderRadius: BorderRadius.circular(24)))),

        // Content
        Padding(
          padding: const EdgeInsets.all(24),
          child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
            // Employee header
            Row(children: [
              ClipOval(
                child: Container(
                  width: 56, height: 56,
                  decoration: const BoxDecoration(
                    gradient: LinearGradient(colors: [Color(0xFF2962FF), Color(0xFF00B4FF)]),
                  ),
                  child: (avatar != null && avatar.isNotEmpty)
                      ? (avatar.startsWith('data:image') 
                          ? Image.memory(
                              base64Decode(avatar.split(',').last),
                              fit: BoxFit.cover,
                              errorBuilder: (context, error, stackTrace) => Center(child: Text(initials.toUpperCase(), style: GoogleFonts.outfit(color: Colors.white, fontSize: 18, fontWeight: FontWeight.w800))),
                            )
                          : Image.network(
                              avatar.startsWith('http') ? avatar : 'https://stb-backend-blno.onrender.com/$avatar',
                              fit: BoxFit.cover,
                              errorBuilder: (context, error, stackTrace) => Center(child: Text(initials.toUpperCase(), style: GoogleFonts.outfit(color: Colors.white, fontSize: 18, fontWeight: FontWeight.w800))),
                            ))
                      : Center(child: Text(initials.toUpperCase(), style: GoogleFonts.outfit(color: Colors.white, fontSize: 18, fontWeight: FontWeight.w800))),
                ),
              ),
              const SizedBox(width: 14),
              Expanded(child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
                Text('$prenom $nom', style: GoogleFonts.outfit(color: dk ? Colors.white : const Color(0xFF0F172A), fontSize: 16, fontWeight: FontWeight.w800)),
                Text(poste, style: GoogleFonts.inter(color: dk ? Colors.white60 : Colors.black54, fontSize: 12)),
              ])),
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
                decoration: BoxDecoration(color: const Color(0xFF2962FF).withValues(alpha: 0.15), borderRadius: BorderRadius.circular(20)),
                child: Text(type.replaceAll('_', ' '), style: GoogleFonts.outfit(color: const Color(0xFF2962FF), fontSize: 10, fontWeight: FontWeight.w700)),
              ),
              const SizedBox(width: 8),
              GestureDetector(
                onTap: () {
                  HapticFeedback.lightImpact();
                  showModalBottomSheet(
                    context: context,
                    backgroundColor: Colors.transparent,
                    isScrollControlled: true,
                    builder: (context) => Padding(
                      padding: const EdgeInsets.only(top: 100),
                      child: ApprovalTrackerWidget(
                        history: request['approvalHistory'] ?? [],
                        status: request['status'] ?? 'PENDING_MANAGER',
                        dk: dk,
                      ),
                    ),
                  );
                },
                child: Container(
                  padding: const EdgeInsets.all(8),
                  decoration: BoxDecoration(
                    color: dk ? Colors.white10 : Colors.black.withValues(alpha: 0.05),
                    shape: BoxShape.circle,
                  ),
                  child: Icon(Icons.info_outline_rounded, color: dk ? Colors.white54 : Colors.black54, size: 20),
                ),
              ),
            ]),

            const SizedBox(height: 20),
            Container(height: 1, color: dk ? Colors.white.withValues(alpha: 0.06) : Colors.black.withValues(alpha: 0.06)),
            const SizedBox(height: 20),

            // Date range
            Row(children: [
              Expanded(child: _InfoBlock(label: 'Du', value: startDate, icon: Icons.calendar_today_rounded, dk: dk)),
              const SizedBox(width: 12),
              Expanded(child: _InfoBlock(label: 'Au', value: endDate, icon: Icons.calendar_month_rounded, dk: dk)),
              const SizedBox(width: 12),
              _InfoBlock(label: 'Jours', value: '$days j', icon: Icons.hourglass_bottom_rounded, dk: dk, highlight: true),
            ]),

            const SizedBox(height: 16),

            Row(children: [
              _InfoBlock(label: 'Solde actuel', value: '$solde jours', icon: Icons.account_balance_wallet_rounded, dk: dk),
              const SizedBox(width: 12),
              if (motif.isNotEmpty) Expanded(child: _InfoBlock(label: 'Motif', value: motif, icon: Icons.notes_rounded, dk: dk)),
            ]),

            const SizedBox(height: 16),

            // Swipe indicator
            Row(mainAxisAlignment: MainAxisAlignment.center, children: [
              if (isApproving) ...[
                const Icon(Icons.check_circle_rounded, color: Colors.green, size: 20),
                const SizedBox(width: 6),
                Text('Approuver', style: GoogleFonts.outfit(color: Colors.green, fontSize: 14, fontWeight: FontWeight.w800)),
              ] else if (isRejecting) ...[
                const Icon(Icons.cancel_rounded, color: Colors.red, size: 20),
                const SizedBox(width: 6),
                Text('Refuser', style: GoogleFonts.outfit(color: Colors.red, fontSize: 14, fontWeight: FontWeight.w800)),
              ] else
                Text('← Glissez pour décider →', style: GoogleFonts.inter(color: dk ? Colors.white38 : Colors.black38, fontSize: 12)),
            ]),
          ]),
        ),
      ]),
    ).animate().fadeIn(duration: 300.ms).slideY(begin: 0.05, end: 0);
  }

  String _formatDate(String raw) {
    try {
      final d = DateTime.parse(raw);
      return '${d.day.toString().padLeft(2, '0')}/${d.month.toString().padLeft(2, '0')}/${d.year}';
    } catch (_) { return raw; }
  }
}

// ── Helper Widgets ───────────────────────────────────────────────────────────
class _InfoBlock extends StatelessWidget {
  final String label;
  final String value;
  final IconData icon;
  final bool dk;
  final bool highlight;
  const _InfoBlock({required this.label, required this.value, required this.icon, required this.dk, this.highlight = false});

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 10),
      decoration: BoxDecoration(
        color: highlight ? const Color(0xFF2962FF).withValues(alpha: 0.1) : (dk ? Colors.white.withValues(alpha: 0.05) : Colors.black.withValues(alpha: 0.04)),
        borderRadius: BorderRadius.circular(12),
      ),
      child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
        Row(children: [
          Icon(icon, size: 12, color: highlight ? const Color(0xFF2962FF) : (dk ? Colors.white54 : Colors.black45)),
          const SizedBox(width: 4),
          Text(label, style: GoogleFonts.inter(color: dk ? Colors.white54 : Colors.black45, fontSize: 10)),
        ]),
        const SizedBox(height: 4),
        Text(value, style: GoogleFonts.outfit(color: highlight ? const Color(0xFF2962FF) : (dk ? Colors.white : const Color(0xFF0F172A)), fontSize: 12, fontWeight: FontWeight.w700), maxLines: 1, overflow: TextOverflow.ellipsis),
      ]),
    );
  }
}

class _StatChip extends StatelessWidget {
  final IconData icon;
  final String label;
  final int count;
  final Color color;
  const _StatChip({required this.icon, required this.label, required this.count, required this.color});

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 8),
      decoration: BoxDecoration(color: Colors.white.withValues(alpha: 0.12), borderRadius: BorderRadius.circular(20)),
      child: Row(children: [
        Icon(icon, color: color, size: 16),
        const SizedBox(width: 6),
        Text('$count $label', style: GoogleFonts.outfit(color: Colors.white, fontSize: 12, fontWeight: FontWeight.w700)),
      ]),
    );
  }
}

class _TabBtn extends StatelessWidget {
  final String label;
  final IconData icon;
  final int count;
  final bool selected;
  final VoidCallback onTap;
  final Color color;
  const _TabBtn({required this.label, required this.icon, required this.count, required this.selected, required this.onTap, required this.color});

  @override
  Widget build(BuildContext context) {
    return Expanded(child: GestureDetector(
      onTap: onTap,
      child: Container(
        padding: const EdgeInsets.symmetric(vertical: 12),
        decoration: BoxDecoration(border: Border(bottom: BorderSide(color: selected ? color : Colors.transparent, width: 2))),
        child: Row(mainAxisAlignment: MainAxisAlignment.center, children: [
          Icon(icon, size: 16, color: selected ? color : Colors.white38),
          const SizedBox(width: 6),
          Text(label, style: GoogleFonts.outfit(color: selected ? color : Colors.white38, fontSize: 13, fontWeight: FontWeight.w700)),
          if (count > 0) ...[
            const SizedBox(width: 6),
            Container(
              padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 2),
              decoration: BoxDecoration(color: color.withValues(alpha: 0.15), borderRadius: BorderRadius.circular(10)),
              child: Text('$count', style: GoogleFonts.outfit(color: color, fontSize: 11, fontWeight: FontWeight.w800)),
            ),
          ],
        ]),
      ),
    ));
  }
}

class _ActionBtn extends StatelessWidget {
  final IconData icon;
  final String label;
  final Color color;
  final VoidCallback? onTap;
  const _ActionBtn({required this.icon, required this.label, required this.color, this.onTap});

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: onTap,
      child: Container(
        padding: const EdgeInsets.symmetric(vertical: 16),
        decoration: BoxDecoration(
          color: color.withValues(alpha: onTap != null ? 0.12 : 0.05),
          borderRadius: BorderRadius.circular(18),
          border: Border.all(color: color.withValues(alpha: onTap != null ? 0.3 : 0.1), width: 1.5),
        ),
        child: Row(mainAxisAlignment: MainAxisAlignment.center, children: [
          Icon(icon, color: onTap != null ? color : color.withValues(alpha: 0.4), size: 22),
          const SizedBox(width: 8),
          Text(label, style: GoogleFonts.outfit(color: onTap != null ? color : color.withValues(alpha: 0.4), fontSize: 15, fontWeight: FontWeight.w800)),
        ]),
      ),
    );
  }
}

class _EmptyView extends StatelessWidget {
  final int tabIndex;
  final bool dk;
  const _EmptyView({required this.tabIndex, required this.dk});

  @override
  Widget build(BuildContext context) {
    final fg = dk ? Colors.white : const Color(0xFF0F172A);
    final mt = dk ? Colors.white54 : Colors.black45;
    return Center(child: Column(mainAxisAlignment: MainAxisAlignment.center, children: [
      Container(
        padding: const EdgeInsets.all(28),
        decoration: BoxDecoration(
          color: Colors.green.withValues(alpha: dk ? 0.12 : 0.08),
          shape: BoxShape.circle,
          border: Border.all(color: Colors.green.withValues(alpha: 0.2), width: 2),
        ),
        child: Icon(Icons.check_circle_outline_rounded, color: Colors.green.shade400, size: 64),
      ).animate().scale(duration: 600.ms, curve: Curves.elasticOut),
      const SizedBox(height: 20),
      Text(
        'Tout est à jour !',
        style: GoogleFonts.outfit(color: fg, fontSize: 20, fontWeight: FontWeight.w800),
      ).animate().fadeIn(delay: 300.ms),
      const SizedBox(height: 8),
      Text(
        tabIndex == 0 ? 'Aucune demande de congé en attente' : 'Aucune demande d\'absence en attente',
        style: GoogleFonts.inter(color: mt, fontSize: 14),
      ).animate().fadeIn(delay: 400.ms),
    ]));
  }
}

class _ErrorView extends StatelessWidget {
  final String error;
  final VoidCallback onRetry;
  final bool dk;
  const _ErrorView({required this.error, required this.onRetry, required this.dk});

  @override
  Widget build(BuildContext context) {
    final fg = dk ? Colors.white : const Color(0xFF0F172A);
    final mt = dk ? Colors.white54 : Colors.black45;
    return Center(child: Column(mainAxisAlignment: MainAxisAlignment.center, children: [
      Container(
        padding: const EdgeInsets.all(20),
        decoration: BoxDecoration(
          color: Colors.red.withValues(alpha: 0.08),
          shape: BoxShape.circle,
          border: Border.all(color: Colors.red.withValues(alpha: 0.2), width: 2),
        ),
        child: const Icon(Icons.wifi_off_rounded, color: Colors.red, size: 48),
      ),
      const SizedBox(height: 16),
      Text('Erreur de connexion', style: GoogleFonts.outfit(color: fg, fontSize: 18, fontWeight: FontWeight.w700)),
      const SizedBox(height: 8),
      Text(error, style: GoogleFonts.inter(color: mt, fontSize: 12), textAlign: TextAlign.center),
      const SizedBox(height: 20),
      ElevatedButton.icon(
        onPressed: onRetry,
        icon: const Icon(Icons.refresh_rounded),
        label: const Text('Réessayer'),
        style: ElevatedButton.styleFrom(backgroundColor: const Color(0xFF2962FF), foregroundColor: Colors.white, shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14))),
      ),
    ]));
  }
}