import 'package:flutter/material.dart';
import 'package:flutter_animate/flutter_animate.dart';
import 'package:provider/provider.dart';
import '../../providers/app_provider.dart';
import '../../theme/app_theme.dart';
import '../../../services/auth_api_service.dart';

class MessagesScreen extends StatefulWidget {
  const MessagesScreen({super.key});

  @override
  State<MessagesScreen> createState() => _MessagesScreenState();
}

class _MessagesScreenState extends State<MessagesScreen> {
  List<dynamic> _conversations = [];
  List<dynamic> _messages = [];
  bool _loading = true;
  String? _selectedConversationId;

  @override
  void initState() {
    super.initState();
    _fetchConversations();
  }

  Future<void> _fetchConversations() async {
    final res = await AuthApiService.getConversations();
    if (mounted) {
      setState(() {
        _conversations = res.data ?? [];
        _loading = false;
      });
    }
  }

  Future<void> _selectConversation(String conversationId) async {
    setState(() {
      _selectedConversationId = conversationId;
    });
    final res = await AuthApiService.getMessages(conversationId);
    if (mounted) {
      setState(() {
        _messages = res.data ?? [];
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
            : _selectedConversationId == null
                ? _buildConversationsList(dk)
                : _buildMessagesList(dk),
      ),
    );
  }

  Widget _buildConversationsList(bool dk) {
    return Column(
      children: [
        Padding(
          padding: const EdgeInsets.all(20),
          child: Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    'Messages',
                    style: (dk ? AppTheme.h1Dark : AppTheme.h1Light).copyWith(fontSize: 28),
                  ),
                  const SizedBox(height: 4),
                  Text(
                    'Your conversations',
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
                child: const Icon(Icons.message_rounded, color: Colors.white, size: 22),
              ),
            ],
          ),
        ),
        Expanded(
          child: _conversations.isEmpty
              ? Center(
                  child: Column(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      Icon(Icons.message_rounded, size: 64, color: dk ? Colors.white.withValues(alpha: 0.1) : Colors.black.withValues(alpha: 0.1)),
                      const SizedBox(height: 16),
                      Text('No conversations yet', style: (dk ? AppTheme.bodyDark : AppTheme.bodyLight).copyWith(color: AppTheme.textMutedLight)),
                    ],
                  ),
                )
              : ListView.builder(
                  padding: const EdgeInsets.symmetric(horizontal: 20),
                  itemCount: _conversations.length,
                  itemBuilder: (context, index) {
                    final conv = _conversations[index];
                    final title = conv['title'] ?? conv['participants']?.map((p) => '${p['prenom']} ${p['nom']}').join(', ') ?? 'Conversation';
                    final preview = conv['lastMessagePreview'] ?? 'No messages yet';

                    return GestureDetector(
                      onTap: () => _selectConversation(conv['_id']),
                      child: Container(
                        margin: const EdgeInsets.only(bottom: 12),
                        padding: const EdgeInsets.all(16),
                        decoration: BoxDecoration(
                          color: dk ? const Color(0xFF1A1F2E) : Colors.white,
                          borderRadius: BorderRadius.circular(20),
                          border: Border.all(color: dk ? Colors.white.withValues(alpha: 0.06) : Colors.black.withValues(alpha: 0.04)),
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
                              child: const Icon(Icons.person_rounded, color: Colors.white, size: 24),
                            ),
                            const SizedBox(width: 14),
                            Expanded(
                              child: Column(
                                crossAxisAlignment: CrossAxisAlignment.start,
                                children: [
                                  Text(title, style: (dk ? AppTheme.bodyDark : AppTheme.bodyLight).copyWith(fontWeight: FontWeight.w800, fontSize: 15)),
                                  const SizedBox(height: 4),
                                  Text(preview, style: (dk ? AppTheme.bodyDark : AppTheme.bodyLight).copyWith(color: AppTheme.textMutedLight, fontSize: 12), maxLines: 1, overflow: TextOverflow.ellipsis),
                                ],
                              ),
                            ),
                          ],
                        ),
                      ).animate().fadeIn(delay: (index * 80).ms).slideY(begin: 0.2),
                    );
                  },
                ),
        ),
      ],
    );
  }

  Widget _buildMessagesList(bool dk) {
    return Column(
      children: [
        Padding(
          padding: const EdgeInsets.all(20),
          child: Row(
            children: [
              IconButton(
                onPressed: () {
                  setState(() {
                    _selectedConversationId = null;
                    _messages = [];
                  });
                },
                icon: Icon(Icons.arrow_back_rounded, color: dk ? Colors.white : Colors.black),
              ),
              const SizedBox(width: 8),
              Text('Messages', style: (dk ? AppTheme.h1Dark : AppTheme.h1Light).copyWith(fontSize: 20)),
            ],
          ),
        ),
        Expanded(
          child: _messages.isEmpty
              ? Center(
                  child: Text('No messages yet', style: (dk ? AppTheme.bodyDark : AppTheme.bodyLight).copyWith(color: AppTheme.textMutedLight)),
                )
              : ListView.builder(
                  padding: const EdgeInsets.symmetric(horizontal: 20),
                  itemCount: _messages.length,
                  itemBuilder: (context, index) {
                    final msg = _messages[index];
                    final content = msg['content'] ?? '';
                    final isMe = msg['senderId']?['_id'] == 'current-user-id';

                    return Align(
                      alignment: isMe ? Alignment.centerRight : Alignment.centerLeft,
                      child: Container(
                        margin: const EdgeInsets.only(bottom: 8),
                        padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 10),
                        decoration: BoxDecoration(
                          gradient: isMe ? LinearGradient(colors: [AppTheme.electricBlue, Color(0xFF7C3AED)]) : null,
                          color: isMe ? null : (dk ? const Color(0xFF2A3142) : Colors.grey.shade200),
                          borderRadius: BorderRadius.circular(16),
                        ),
                        child: Text(content, style: TextStyle(color: isMe ? Colors.white : (dk ? Colors.white : Colors.black), fontSize: 14)),
                      ),
                    );
                  },
                ),
        ),
      ],
    );
  }
}
