import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:intl/intl.dart';

class ApprovalTrackerWidget extends StatelessWidget {
  final List<dynamic> history;
  final String status; // PENDING_MANAGER, PENDING_RH, APPROVED, REJECTED
  final bool dk; // Dark mode

  const ApprovalTrackerWidget({
    super.key,
    required this.history,
    required this.status,
    required this.dk,
  });

  @override
  Widget build(BuildContext context) {
    // Reconstruct the expected chain from history + current status
    List<_Step> steps = [];

    // Add historical/future manager steps from approvalHistory
    for (int i = 0; i < history.length; i++) {
      final h = history[i];
      final approverName = h['approverName'] ?? 'Manager Niv ${h['level'] ?? (i + 1)}';
      final decision = h['decision'] as String? ?? '';
      final comment = h['comment'] as String? ?? '';
      final date = h['date'] != null ? DateTime.tryParse(h['date']) : null;

      _StepState state;
      String title;
      String subtitle = date != null ? DateFormat('dd/MM/yyyy HH:mm').format(date) : '';

      if (decision == 'APPROVED') {
        state = _StepState.completed;
        title = 'Approuvé par $approverName';
      } else if (decision == 'REJECTED') {
        state = _StepState.rejected;
        title = 'Refusé par $approverName';
      } else {
        // PENDING
        bool isFirstPending = !steps.any((s) => s.state == _StepState.current || s.state == _StepState.upcoming);
        final isActivelyPending = status == 'PENDING_MANAGER' || status == 'PENDING_N1';
        state = isFirstPending && isActivelyPending ? _StepState.current : _StepState.upcoming;
        title = isFirstPending && isActivelyPending ? 'En attente de $approverName' : 'Validation $approverName';
        subtitle = 'Manager';
      }

      steps.add(_Step(
        title: title,
        subtitle: subtitle,
        description: comment.isNotEmpty ? '"$comment"' : null,
        state: state,
      ));
    }

    // Add RH step
    if (status == 'PENDING_RH' || status == 'APPROVED_N1') {
      steps.add(_Step(
        title: 'En attente de validation',
        subtitle: 'Ressources Humaines',
        state: _StepState.current,
      ));
    } else if (status == 'APPROVED') {
      steps.add(_Step(
        title: 'Approuvé par les RH',
        subtitle: 'Demande validée',
        state: _StepState.completed,
      ));
    } else if (status != 'REJECTED' && status != 'CANCELLED') {
      steps.add(_Step(
        title: 'Validation finale',
        subtitle: 'Ressources Humaines',
        state: _StepState.upcoming,
      ));
    }

    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 28),
      decoration: BoxDecoration(
        color: dk ? const Color(0xFF0F172A) : Colors.white,
        borderRadius: BorderRadius.circular(24),
        border: Border.all(color: dk ? Colors.white.withOpacity(0.08) : Colors.black.withOpacity(0.04)),
        boxShadow: [
          BoxShadow(
            color: dk ? Colors.black.withOpacity(0.3) : const Color(0xFF0F172A).withOpacity(0.04),
            blurRadius: 24,
            offset: const Offset(0, 10),
          ),
        ],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              Container(
                padding: const EdgeInsets.all(8),
                decoration: BoxDecoration(
                  color: dk ? Colors.white.withOpacity(0.1) : const Color(0xFF0F172A).withOpacity(0.05),
                  borderRadius: BorderRadius.circular(10),
                ),
                child: Icon(
                  Icons.route_rounded,
                  size: 18,
                  color: dk ? Colors.white : const Color(0xFF0F172A),
                ),
              ),
              const SizedBox(width: 12),
              Text(
                'Circuit de Validation',
                style: GoogleFonts.outfit(
                  fontSize: 18,
                  fontWeight: FontWeight.w700,
                  letterSpacing: -0.3,
                  color: dk ? Colors.white : const Color(0xFF0F172A),
                ),
              ),
            ],
          ),
          const SizedBox(height: 32),
          ...List.generate(steps.length, (index) {
            final isLast = index == steps.length - 1;
            return _buildStep(steps[index], isLast);
          }),
        ],
      ),
    );
  }

  Widget _buildStep(_Step step, bool isLast) {
    Color dotColor;
    Color lineColor;
    IconData? icon;
    Color bgColor;

    switch (step.state) {
      case _StepState.completed:
        dotColor = const Color(0xFF10B981); // Emerald 500
        lineColor = const Color(0xFF10B981).withOpacity(0.5);
        bgColor = const Color(0xFF10B981).withOpacity(0.1);
        icon = Icons.check_circle_rounded;
        break;
      case _StepState.current:
        dotColor = const Color(0xFF3B82F6); // Blue 500
        lineColor = dk ? Colors.white12 : Colors.black12;
        bgColor = const Color(0xFF3B82F6).withOpacity(0.1);
        icon = Icons.radio_button_checked_rounded;
        break;
      case _StepState.upcoming:
        dotColor = dk ? Colors.white30 : Colors.black26;
        lineColor = dk ? Colors.white12 : Colors.black12;
        bgColor = Colors.transparent;
        icon = Icons.circle_outlined;
        break;
      case _StepState.rejected:
        dotColor = const Color(0xFFEF4444); // Red 500
        lineColor = Colors.transparent;
        bgColor = const Color(0xFFEF4444).withOpacity(0.1);
        icon = Icons.cancel_rounded;
        break;
    }

    return IntrinsicHeight(
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // Timeline Node
          Column(
            children: [
              Container(
                width: 32,
                height: 32,
                decoration: BoxDecoration(
                  color: bgColor,
                  shape: BoxShape.circle,
                ),
                child: Center(
                  child: step.state == _StepState.current
                      ? _PulseIcon(color: dotColor)
                      : Icon(
                          icon,
                          size: 18,
                          color: dotColor,
                        ),
                ),
              ),
              if (!isLast)
                Expanded(
                  child: Container(
                    width: 2,
                    margin: const EdgeInsets.symmetric(vertical: 6),
                    decoration: BoxDecoration(
                      color: lineColor,
                      borderRadius: BorderRadius.circular(1),
                    ),
                  ),
                ),
            ],
          ),
          const SizedBox(width: 16),
          // Content
          Expanded(
            child: Padding(
              padding: EdgeInsets.only(bottom: isLast ? 0 : 32.0, top: 4),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    step.title,
                    style: GoogleFonts.inter(
                      fontSize: 15,
                      fontWeight: step.state == _StepState.current || step.state == _StepState.rejected 
                        ? FontWeight.w700 
                        : FontWeight.w600,
                      color: step.state == _StepState.upcoming
                          ? (dk ? Colors.white54 : Colors.black54)
                          : (dk ? Colors.white : const Color(0xFF0F172A)),
                      letterSpacing: -0.2,
                    ),
                  ),
                  if (step.subtitle.isNotEmpty)
                    Padding(
                      padding: const EdgeInsets.only(top: 4),
                      child: Text(
                        step.subtitle,
                        style: GoogleFonts.inter(
                          fontSize: 13,
                          fontWeight: FontWeight.w500,
                          color: step.state == _StepState.upcoming 
                            ? (dk ? Colors.white30 : Colors.black38)
                            : (dk ? Colors.white60 : const Color(0xFF64748B)),
                        ),
                      ),
                    ),
                  if (step.description != null)
                    Container(
                      margin: const EdgeInsets.only(top: 12),
                      padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 12),
                      decoration: BoxDecoration(
                        color: step.state == _StepState.rejected
                            ? const Color(0xFFEF4444).withOpacity(0.08)
                            : (dk ? Colors.white.withOpacity(0.05) : const Color(0xFFF8FAFC)),
                        borderRadius: BorderRadius.circular(12),
                        border: Border.all(
                          color: step.state == _StepState.rejected
                            ? const Color(0xFFEF4444).withOpacity(0.2)
                            : (dk ? Colors.white10 : Colors.black.withOpacity(0.04)),
                        )
                      ),
                      child: Row(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Icon(
                            Icons.format_quote_rounded,
                            size: 16,
                            color: step.state == _StepState.rejected
                                ? const Color(0xFFEF4444).withOpacity(0.7)
                                : (dk ? Colors.white54 : const Color(0xFF94A3B8)),
                          ),
                          const SizedBox(width: 8),
                          Expanded(
                            child: Text(
                              step.description!,
                              style: GoogleFonts.inter(
                                fontSize: 13.5,
                                height: 1.4,
                                color: step.state == _StepState.rejected
                                    ? const Color(0xFFEF4444)
                                    : (dk ? Colors.white70 : const Color(0xFF334155)),
                              ),
                            ),
                          ),
                        ],
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

enum _StepState { completed, current, upcoming, rejected }

class _Step {
  final String title;
  final String subtitle;
  final String? description;
  final _StepState state;

  _Step({
    required this.title,
    required this.subtitle,
    this.description,
    required this.state,
  });
}

class _PulseIcon extends StatefulWidget {
  final Color color;
  const _PulseIcon({required this.color});

  @override
  State<_PulseIcon> createState() => _PulseIconState();
}

class _PulseIconState extends State<_PulseIcon> with SingleTickerProviderStateMixin {
  late AnimationController _controller;

  @override
  void initState() {
    super.initState();
    _controller = AnimationController(vsync: this, duration: const Duration(seconds: 1))..repeat(reverse: true);
  }

  @override
  void dispose() {
    _controller.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return FadeTransition(
      opacity: Tween<double>(begin: 0.4, end: 1.0).animate(_controller),
      child: Icon(Icons.access_time_filled_rounded, size: 16, color: widget.color),
    );
  }
}
