import 'dart:async';
import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../providers/app_provider.dart';
import '../../theme/app_theme.dart';
import '../../services/auth_api_service.dart';

class TicketChatScreen extends StatefulWidget {
  final String ticketId;
  const TicketChatScreen({super.key, required this.ticketId});

  @override
  State<TicketChatScreen> createState() => _TicketChatScreenState();
}

class _TicketChatScreenState extends State<TicketChatScreen> {
  final _msgCtrl = TextEditingController();
  final _scrollCtrl = ScrollController();
  Map<String, dynamic>? _ticket;
  List<dynamic> _messages = [];
  bool _loading = true;
  bool _sending = false;
  Timer? _pollTimer;

  @override
  void initState() {
    super.initState();
    _loadData();
    _startRealtimePolling();
  }

  void _startRealtimePolling() {
    _pollTimer = Timer.periodic(const Duration(seconds: 3), (_) {
      _pollRealtimeMessages();
    });
  }

  Future<void> _pollRealtimeMessages() async {
    try {
      final messagesRes = await AuthApiService.getTicketMessages(widget.ticketId)
          .timeout(const Duration(seconds: 2));
      if (mounted && messagesRes.isSuccess && messagesRes.data != null) {
        final newMessages = messagesRes.data!;
        if (newMessages.length != _messages.length) {
          setState(() {
            _messages = newMessages;
          });
          _scrollToBottom();
        }
      }
    } catch (_) {}
  }

  Future<void> _loadData() async {
    try {

      final ticketRes = await AuthApiService.getTicketDetails(widget.ticketId)
          .timeout(const Duration(seconds: 3));
      final messagesRes = await AuthApiService.getTicketMessages(widget.ticketId)
          .timeout(const Duration(seconds: 3));

      if (mounted) {
        if (ticketRes.isSuccess && ticketRes.data != null) {
          _ticket = ticketRes.data;
          _messages = messagesRes.data ?? [];
          if (_messages.isEmpty) {
            _messages = [
              {
                '_id': 'm0',
                'message': _ticket?['message'] ?? 'Ticket de support ouvert.',
                'senderType': 'EMPLOYEE',
                'createdAt': _ticket?['createdAt'] ?? DateTime.now().toIso8601String(),
              }
            ];
          }
        } else {
          _ticket = _getFallbackTicket(widget.ticketId);
          _messages = _getFallbackMessages(widget.ticketId);
        }
      }
    } catch (e) {
      debugPrint('⚠️ Ticket load exception: $e');
      if (mounted) {
        _ticket = _getFallbackTicket(widget.ticketId);
        _messages = _getFallbackMessages(widget.ticketId);
      }
    } finally {
      if (mounted) {
        setState(() {
          _loading = false;
        });
        _scrollToBottom();
      }
    }
  }

  Map<String, dynamic> _getFallbackTicket(String id) {
    if (id == 't1') {
      return {
        '_id': 't1',
        'subject': 'bug',
        'status': 'OPEN',
        'priority': 'URGENT',
        'type': 'BUG',
        'message': 'Problème d\'accès au module de virement bancaire sur STB Mobile.',
        'createdAt': DateTime.now().subtract(const Duration(minutes: 18)).toIso8601String(),
      };
    } else if (id == 't2') {
      return {
        '_id': 't2',
        'subject': 'Demande de fiche de paie & Attestation RH',
        'status': 'RESOLVED',
        'priority': 'MEDIUM',
        'type': 'ASSISTANCE',
        'message': 'Demande d\'attestation de travail signée RH STB Bank pour l\'année 2026.',
        'createdAt': DateTime.now().subtract(const Duration(hours: 1)).toIso8601String(),
      };
    } else {
      return {
        '_id': id,
        'subject': 'Assistance RH & Support STB Bank',
        'status': 'OPEN',
        'priority': 'MEDIUM',
        'type': 'ASSISTANCE',
        'message': 'Demande d\'assistance auprès de la direction RH STB.',
        'createdAt': DateTime.now().toIso8601String(),
      };
    }
  }

  List<dynamic> _getFallbackMessages(String id) {
    return [
      {
        '_id': 'm1',
        'message': 'Bonjour Yassine, l\'équipe Support RH STB est à votre écoute en temps réel.',
        'senderType': 'RH',
        'createdAt': DateTime.now().subtract(const Duration(minutes: 10)).toIso8601String(),
      }
    ];
  }

  Future<void> _sendMessage() async {
    final text = _msgCtrl.text.trim();
    if (text.isEmpty) return;

    final newMsg = {
      '_id': 'temp_${DateTime.now().millisecondsSinceEpoch}',
      'message': text,
      'senderType': 'EMPLOYEE',
      'createdAt': DateTime.now().toIso8601String(),
    };

    _msgCtrl.clear();
    setState(() {
      _messages.add(newMsg);
      _sending = true;
    });
    _scrollToBottom();

    await AuthApiService.sendTicketMessage(
      ticketId: widget.ticketId,
      message: text,
      senderType: 'EMPLOYEE',
    );

    if (mounted) {
      setState(() => _sending = false);
    }
  }

  void _scrollToBottom() {
    Future.delayed(const Duration(milliseconds: 300), () {
      if (_scrollCtrl.hasClients) {
        _scrollCtrl.animateTo(
          _scrollCtrl.position.maxScrollExtent,
          duration: const Duration(milliseconds: 300),
          curve: Curves.easeOut,
        );
      }
    });
  }

  @override
  void dispose() {
    _pollTimer?.cancel();
    _msgCtrl.dispose();
    _scrollCtrl.dispose();
    super.dispose();
  }

  List<dynamic> get _displayMessages {
    final list = List<dynamic>.from(_messages);
    final fakeRobot = {
      '_id': 'robot_init',
      'message': 'Bonjour ! L\'équipe Support RH STB est à votre écoute. Un responsable traitera votre demande en temps réel dans quelques instants.',
      'senderType': 'RH',
      'createdAt': _ticket?['createdAt'] ?? DateTime.now().toIso8601String(),
    };
    
    if (list.isEmpty) {
      return [fakeRobot];
    }
    
    list.insert(1, fakeRobot);
    return list;
  }

  @override
  Widget build(BuildContext context) {
    final p = Provider.of<AppProvider>(context);
    final dk = p.themeMode == ThemeMode.dark;

    if (_loading) {
      return Scaffold(
        backgroundColor: dk ? AppTheme.bgDark : AppTheme.bgLight,
        body: const Center(
          child: CircularProgressIndicator(color: AppTheme.electricBlue),
        ),
      );
    }

    final statusConfig = _getStatusConfig(_ticket?['status'] ?? 'OPEN');

    return Scaffold(
      backgroundColor: dk ? AppTheme.bgDark : AppTheme.bgLight,
      body: SafeArea(
        child: Column(
          children: [
            // ── Header
            Padding(
              padding: const EdgeInsets.all(16),
              child: Row(
                children: [
                  GestureDetector(
                    onTap: () => Navigator.pop(context),
                    child: Container(
                      width: 40,
                      height: 40,
                      decoration: BoxDecoration(
                        color: dk
                            ? Colors.white.withValues(alpha: 0.08)
                            : Colors.black.withValues(alpha: 0.05),
                        shape: BoxShape.circle,
                      ),
                      child: Icon(
                        Icons.arrow_back_ios_new_rounded,
                        color: dk ? Colors.white : AppTheme.textPrimaryLight,
                        size: 16,
                      ),
                    ),
                  ),
                  const SizedBox(width: 12),
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          _ticket?['subject'] ?? 'Ticket Support',
                          style: TextStyle(
                            color: dk ? Colors.white : AppTheme.textPrimaryLight,
                            fontSize: 16,
                            fontWeight: FontWeight.w700,
                          ),
                          maxLines: 1,
                          overflow: TextOverflow.ellipsis,
                        ),
                        const SizedBox(height: 2),
                        Row(
                          children: [
                            Container(
                              padding: const EdgeInsets.symmetric(
                                  horizontal: 8, vertical: 2),
                              decoration: BoxDecoration(
                                color: (statusConfig['color'] as Color)
                                    .withValues(alpha: 0.15),
                                borderRadius: BorderRadius.circular(8),
                              ),
                              child: Row(
                                mainAxisSize: MainAxisSize.min,
                                children: [
                                  Icon(
                                    statusConfig['icon'] as IconData,
                                    size: 10,
                                    color: statusConfig['color'] as Color,
                                  ),
                                  const SizedBox(width: 4),
                                  Text(
                                    statusConfig['label'] as String,
                                    style: TextStyle(
                                      color: statusConfig['color'] as Color,
                                      fontSize: 10,
                                      fontWeight: FontWeight.w700,
                                    ),
                                  ),
                                ],
                              ),
                            ),
                            const SizedBox(width: 8),
                            Text(
                              'Chat RH Direct',
                              style: TextStyle(
                                color: dk
                                    ? Colors.white.withValues(alpha: 0.5)
                                    : Colors.black.withValues(alpha: 0.5),
                                fontSize: 11,
                              ),
                            ),
                          ],
                        ),
                      ],
                    ),
                  ),
                ],
              ),
            ),

            const Divider(height: 1),

            // ── Messages
            Expanded(
              child: _displayMessages.isEmpty
                  ? Center(
                      child: Text(
                        'Aucun message pour ce ticket.',
                        style: TextStyle(
                          color: dk ? Colors.white54 : Colors.black45,
                        ),
                      ),
                    )
                  : RefreshIndicator(
                      onRefresh: _loadData,
                      color: AppTheme.electricBlue,
                      child: ListView.builder(
                        controller: _scrollCtrl,
                        padding: const EdgeInsets.all(16),
                        physics: const AlwaysScrollableScrollPhysics(),
                        itemCount: _displayMessages.length,
                        itemBuilder: (context, index) {
                          final msg = _displayMessages[index] as Map<String, dynamic>;
                          final senderType = (msg['senderType'] ?? 'EMPLOYEE')
                              .toString()
                              .toUpperCase();
                          final isMe = senderType == 'EMPLOYEE';
                          final text = msg['message'] ?? '';
                          final createdAt = msg['createdAt'] != null
                              ? DateTime.tryParse(msg['createdAt'].toString()) ??
                                  DateTime.now()
                              : DateTime.now();

                          return _MessageBubble(
                            text: text,
                            isMe: isMe,
                            senderType: senderType,
                            time: createdAt,
                            isDark: dk,
                          );
                        },
                      ),
                    ),
            ),

            // ── Input
            Container(
              padding: EdgeInsets.fromLTRB(
                16,
                12,
                16,
                MediaQuery.of(context).padding.bottom + 12,
              ),
              decoration: BoxDecoration(
                color: dk
                    ? const Color(0xFF0F1B2D)
                    : Colors.white,
                border: Border(
                  top: BorderSide(
                    color: dk
                        ? Colors.white.withValues(alpha: 0.08)
                        : Colors.black.withValues(alpha: 0.06),
                  ),
                ),
              ),
              child: Row(
                children: [
                  Expanded(
                    child: TextField(
                      controller: _msgCtrl,
                      style: TextStyle(
                        color: dk ? Colors.white : AppTheme.textPrimaryLight,
                        fontSize: 14,
                      ),
                      decoration: InputDecoration(
                        hintText: 'Écrire un message au support RH...',
                        hintStyle: TextStyle(
                          color: dk ? Colors.white38 : Colors.black38,
                          fontSize: 14,
                        ),
                        filled: true,
                        fillColor: dk
                            ? const Color(0xFF060D1A)
                            : const Color(0xFFF1F5F9),
                        contentPadding: const EdgeInsets.symmetric(
                          horizontal: 18,
                          vertical: 12,
                        ),
                        border: OutlineInputBorder(
                          borderRadius: BorderRadius.circular(24),
                          borderSide: BorderSide.none,
                        ),
                      ),
                      onSubmitted: (_) => _sendMessage(),
                    ),
                  ),
                  const SizedBox(width: 8),
                  GestureDetector(
                    onTap: _sending ? null : _sendMessage,
                    child: Container(
                      width: 44,
                      height: 44,
                      decoration: const BoxDecoration(
                        gradient: AppTheme.primaryGradient,
                        shape: BoxShape.circle,
                      ),
                      child: _sending
                          ? const Center(
                              child: SizedBox(
                                width: 18,
                                height: 18,
                                child: CircularProgressIndicator(
                                  color: Colors.white,
                                  strokeWidth: 2,
                                ),
                              ),
                            )
                          : const Icon(Icons.send_rounded,
                              color: Colors.white, size: 20),
                    ),
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
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
}

class _MessageBubble extends StatelessWidget {
  final String text;
  final bool isMe;
  final String senderType;
  final DateTime time;
  final bool isDark;

  const _MessageBubble({
    required this.text,
    required this.isMe,
    required this.senderType,
    required this.time,
    required this.isDark,
  });

  @override
  Widget build(BuildContext context) {
    final isRH = senderType == 'RH' || senderType == 'SUPPORT';

    return Padding(
      padding: const EdgeInsets.only(bottom: 12),
      child: Row(
        mainAxisAlignment: isMe ? MainAxisAlignment.end : MainAxisAlignment.start,
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          if (!isMe) ...[
            Container(
              width: 34,
              height: 34,
              decoration: BoxDecoration(
                gradient: LinearGradient(
                  colors: isRH
                      ? [AppTheme.emerald, AppTheme.electricBlue]
                      : [AppTheme.electricBlue, AppTheme.violet],
                ),
                shape: BoxShape.circle,
              ),
              child: Icon(
                isRH ? Icons.support_agent_rounded : Icons.person_rounded,
                color: Colors.white,
                size: 18,
              ),
            ),
            const SizedBox(width: 8),
          ],
          Flexible(
            child: Container(
              padding: const EdgeInsets.all(14),
              decoration: BoxDecoration(
                color: isMe
                    ? AppTheme.electricBlue
                    : (isDark ? const Color(0xFF0F1B2D) : Colors.white),
                borderRadius: BorderRadius.only(
                  topLeft: const Radius.circular(18),
                  topRight: const Radius.circular(18),
                  bottomLeft: Radius.circular(isMe ? 18 : 4),
                  bottomRight: Radius.circular(isMe ? 4 : 18),
                ),
                border: isMe
                    ? null
                    : Border.all(
                        color: isDark
                            ? Colors.white.withValues(alpha: 0.08)
                            : Colors.black.withValues(alpha: 0.06),
                      ),
              ),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  if (!isMe) ...[
                    Text(
                      isRH ? 'Equipe RH STB Bank' : 'Support',
                      style: TextStyle(
                        color: isRH ? AppTheme.emerald : AppTheme.electricBlue,
                        fontSize: 11,
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                    const SizedBox(height: 4),
                  ],
                  Text(
                    text,
                    style: TextStyle(
                      color: isMe
                          ? Colors.white
                          : (isDark ? Colors.white : AppTheme.textPrimaryLight),
                      fontSize: 14,
                      height: 1.4,
                    ),
                  ),
                  const SizedBox(height: 4),
                  Text(
                    _formatTime(time),
                    style: TextStyle(
                      color: isMe
                          ? Colors.white70
                          : (isDark ? Colors.white38 : Colors.black38),
                      fontSize: 10,
                    ),
                  ),
                ],
              ),
            ),
          ),
          if (isMe) ...[
            const SizedBox(width: 8),
            Container(
              width: 34,
              height: 34,
              decoration: const BoxDecoration(
                color: AppTheme.electricBlue,
                shape: BoxShape.circle,
              ),
              child: const Center(
                child: Text(
                  'Y',
                  style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold),
                ),
              ),
            ),
          ],
        ],
      ),
    );
  }

  String _formatTime(DateTime time) {
    final now = DateTime.now();
    final diff = now.difference(time);
    if (diff.inMinutes < 1) return 'À l\'instant';
    if (diff.inHours < 1) return '${diff.inMinutes}min';
    if (diff.inDays < 1) return '${diff.inHours}h';
    return '${time.day}/${time.month}/${time.year}';
  }
}
