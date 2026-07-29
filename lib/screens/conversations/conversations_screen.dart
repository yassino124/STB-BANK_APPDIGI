import 'package:flutter/material.dart';
import 'package:flutter_animate/flutter_animate.dart';
import 'package:provider/provider.dart';
import '../../providers/app_provider.dart';
import '../../theme/app_theme.dart';
import '../../services/auth_api_service.dart';

class ConversationsScreen extends StatefulWidget {
  const ConversationsScreen({super.key});

  @override
  State<ConversationsScreen> createState() => _ConversationsScreenState();
}

class _ConversationsScreenState extends State<ConversationsScreen> {
  List<dynamic> _conversations = [];
  bool _loading = true;

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

  @override
  Widget build(BuildContext context) {
    final p = Provider.of<AppProvider>(context);
    final dk = p.themeMode == ThemeMode.dark;

    return Scaffold(
      backgroundColor: dk ? AppTheme.bgDark : AppTheme.bgLight,
      body: SafeArea(
        child: _loading
            ? const Center(child: CircularProgressIndicator(color: AppTheme.electricBlue))
            : Column(
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
                              'Conversations',
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
                          child: const Icon(Icons.people_rounded, color: Colors.white, size: 22),
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
                                Icon(Icons.people_rounded, size: 64, color: dk ? Colors.white.withValues(alpha: 0.1) : Colors.black.withValues(alpha: 0.1)),
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
                              final type = conv['type'] ?? 'DIRECT';

                              return Container(
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
                                      child: Icon(type == 'GROUP' ? Icons.group_rounded : Icons.person_rounded, color: Colors.white, size: 24),
                                    ),
                                    const SizedBox(width: 14),
                                    Expanded(
                                      child: Column(
                                        crossAxisAlignment: CrossAxisAlignment.start,
                                        children: [
                                          Text(title, style: (dk ? AppTheme.bodyDark : AppTheme.bodyLight).copyWith(fontWeight: FontWeight.w800, fontSize: 15)),
                                          const SizedBox(height: 4),
                                          Text(type, style: (dk ? AppTheme.bodyDark : AppTheme.bodyLight).copyWith(color: AppTheme.textMutedLight, fontSize: 12)),
                                        ],
                                      ),
                                    ),
                                  ],
                                ),
                              ).animate().fadeIn(delay: (index * 80).ms).slideY(begin: 0.2);
                            },
                          ),
                  ),
                ],
              ),
      ),
    );
  }

}

