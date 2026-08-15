import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_animate/flutter_animate.dart';
import 'package:provider/provider.dart';
import '../../providers/app_provider.dart';
import '../../theme/app_theme.dart';
import '../../services/auth_api_service.dart';
import '../../viewmodels/dashboard_viewmodel.dart';
import '../../viewmodels/notifications_viewmodel.dart';
import 'dart:ui';
import 'dart:convert';
import 'dart:typed_data';

class TransferScreen extends StatefulWidget {
  const TransferScreen({super.key});

  @override
  State<TransferScreen> createState() => _TransferScreenState();
}

class _TransferScreenState extends State<TransferScreen> {
  int _step = 0; // 0: Amount selection, 1: Beneficiary selection, 2: Receipt verification
  String _amount = "";
  int _selectedRecipient = -1;

  List<Map<String, dynamic>> _searchResults = [];
  List<Map<String, dynamic>> _allCollaborators = []; // Store all collaborators
  bool _isSearching = false;
  bool _isLoadingInitial = false;
  final TextEditingController _searchCtrl = TextEditingController();

  final List<String> _quickAmounts = ["10", "20", "50", "100", "200"];
  
  // Avatar cache for performance
  static final Map<String, Uint8List> _avatarBytesCache = {};

  @override
  void initState() {
    super.initState();
    _loadAllCollaborators();
  }

  // Helper to decode avatar from backend (base64 or URL)
  ImageProvider? _getAvatarImageProvider(String? avatarUrl) {
    if (avatarUrl == null || avatarUrl.isEmpty) return null;
    
    try {
      // Base64 data URI format: data:image/png;base64,iVBORw0KGgo...
      if (avatarUrl.startsWith('data:image')) {
        final base64String = avatarUrl.split(',')[1];
        Uint8List bytes;
        if (_avatarBytesCache.containsKey(base64String)) {
          bytes = _avatarBytesCache[base64String]!;
        } else {
          bytes = base64Decode(base64String);
          _avatarBytesCache[base64String] = bytes;
        }
        return MemoryImage(bytes);
      } else if (avatarUrl.startsWith('http://') || avatarUrl.startsWith('https://')) {
        // Full URL from backend or CDN
        return NetworkImage(avatarUrl);
      } else if (avatarUrl.startsWith('/') || avatarUrl.startsWith('public/')) {
        // Relative path - convert to full API URL
        const apiBaseUrl = 'http://localhost:3000'; // TODO: Get from env
        final cleanPath = avatarUrl.startsWith('/') ? avatarUrl : '/$avatarUrl';
        return NetworkImage('$apiBaseUrl$cleanPath');
      } else {
        // Unknown format
        return null;
      }
    } catch (e) {
      print('Error loading avatar: $e');
      return null;
    }
  }

  // Load all collaborators from backend on init
  Future<void> _loadAllCollaborators() async {
    setState(() => _isLoadingInitial = true);
    // Search with minimal query to get all active employees
    final res = await AuthApiService.searchDirectory("");  // Empty = get all
    if (res.isSuccess && res.data != null) {
      setState(() {
        _allCollaborators = res.data!.map((e) => e as Map<String, dynamic>).toList();
        _searchResults = _allCollaborators; // Show all by default
      });
    }
    setState(() => _isLoadingInitial = false);
  }

  void _onAmountKey(String k) {
    HapticFeedback.lightImpact();
    if (k == "." && _amount.contains(".")) return;
    if (k == "." && _amount.isEmpty) {
      setState(() => _amount = "0.");
      return;
    }
    // Limit to 2 decimal places
    if (_amount.contains(".") && _amount.split(".")[1].length >= 2) return;
    // Limit max transfer value
    if (_amount.length > 8) return;

    setState(() => _amount += k);
  }

  void _onAmountDelete() {
    HapticFeedback.lightImpact();
    if (_amount.isNotEmpty) {
      setState(() => _amount = _amount.substring(0, _amount.length - 1));
    }
  }

  void _selectQuickAmount(String amt) {
    HapticFeedback.mediumImpact();
    setState(() => _amount = amt);
  }

  void _searchBeneficiaries(String query) async {
    // If query is empty, show all collaborators
    if (query.isEmpty) {
      setState(() {
        _searchResults = _allCollaborators;
        _selectedRecipient = -1;
      });
      return;
    }
    
    // Filter locally first for instant response
    final localResults = _allCollaborators.where((e) {
      final name = "${e['prenom']} ${e['nom']}".toLowerCase();
      final matricule = (e['matricule'] ?? "").toLowerCase();
      final q = query.toLowerCase();
      return name.contains(q) || matricule.contains(q);
    }).toList();
    
    setState(() {
      _searchResults = localResults;
      _selectedRecipient = -1;
    });
    
    // Also search from API for fresh results if query >= 2 chars
    if (query.length >= 2) {
      setState(() => _isSearching = true);
      final res = await AuthApiService.searchDirectory(query);
      if (res.isSuccess && res.data != null && mounted) {
        setState(() {
          _searchResults = res.data!.map((e) => e as Map<String, dynamic>).toList();
        });
      }
      setState(() => _isSearching = false);
    }
  }

  bool _canProceed() {
    if (_step == 0) return _amount.isNotEmpty && double.tryParse(_amount) != null && double.parse(_amount) > 0;
    if (_step == 1) return _selectedRecipient >= 0 && _selectedRecipient < _searchResults.length;
    return true;
  }

  @override
  void dispose() {
    _searchCtrl.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final provider = Provider.of<AppProvider>(context);
    final dk = provider.themeMode == ThemeMode.dark;
    final fg = Theme.of(context).colorScheme.onSurface;
    final mt = dk ? const Color(0xFF94A3B8) : const Color(0xFF64748B);
    final cd = Theme.of(context).cardColor;
    final bd = dk ? Colors.white.withValues(alpha: 0.08) : Colors.black.withValues(alpha: 0.04);

    return Scaffold(
      backgroundColor: Theme.of(context).scaffoldBackgroundColor,
      body: Stack(
        children: [
          // ── Futuristic Glowing Orbs in Background ──────────────────────────
          Positioned(
            top: -80,
            right: -80,
            child: Container(
              width: 250,
              height: 250,
              decoration: BoxDecoration(
                shape: BoxShape.circle,
                color: AppTheme.electricBlue.withValues(alpha: dk ? 0.15 : 0.08),
              ),
            ).animate(onPlay: (c) => c.repeat(reverse: true))
             .scale(begin: const Offset(1, 1), end: const Offset(1.2, 1.2), duration: 4.seconds)
             .blur(begin: const Offset(40, 40), end: const Offset(60, 60)),
          ),
          Positioned(
            bottom: -50,
            left: -50,
            child: Container(
              width: 200,
              height: 200,
              decoration: BoxDecoration(
                shape: BoxShape.circle,
                color: AppTheme.turquoise.withValues(alpha: dk ? 0.12 : 0.05),
              ),
            ).animate(onPlay: (c) => c.repeat(reverse: true))
             .scale(begin: const Offset(1, 1), end: const Offset(1.15, 1.15), duration: 5.seconds)
             .blur(begin: const Offset(30, 30), end: const Offset(50, 50)),
          ),

          SafeArea(
            child: Column(
              children: [
                // ── Top Navigation Bar ─────────────────────────────────────────
                Padding(
                  padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 12),
                  child: Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      GestureDetector(
                        onTap: () {
                          HapticFeedback.lightImpact();
                          if (_step > 0) {
                            setState(() => _step--);
                          } else {
                            Navigator.pop(context);
                          }
                        },
                        child: Container(
                          width: 44, height: 44,
                          decoration: BoxDecoration(
                            color: cd,
                            shape: BoxShape.circle,
                            border: Border.all(color: bd),
                          ),
                          child: Icon(Icons.arrow_back_rounded, color: fg, size: 20),
                        ),
                      ),
                      
                      // Title indicating the flow stage
                      Text(
                        _step == 0 ? "Enter Amount" : _step == 1 ? "Choose Recipient" : "Confirm Transfer",
                        style: TextStyle(color: fg, fontSize: 16, fontWeight: FontWeight.w800, letterSpacing: -0.3),
                      ),

                      // Stepper progress indicator
                      Row(
                        children: List.generate(3, (i) {
                          final active = i <= _step;
                          return AnimatedContainer(
                            duration: const Duration(milliseconds: 300),
                            margin: const EdgeInsets.symmetric(horizontal: 3),
                            width: i == _step ? 18 : 6,
                            height: 6,
                            decoration: BoxDecoration(
                              color: active ? AppTheme.electricBlue : mt.withValues(alpha: 0.2),
                              borderRadius: BorderRadius.circular(3),
                            ),
                          );
                        }),
                      ),
                    ],
                  ),
                ),

                // ── Stepper Content Area ───────────────────────────────────────
                Expanded(
                  child: AnimatedSwitcher(
                    duration: const Duration(milliseconds: 300),
                    transitionBuilder: (child, animation) {
                      return FadeTransition(
                        opacity: animation,
                        child: SlideTransition(
                          position: Tween<Offset>(
                            begin: const Offset(0.04, 0.0),
                            end: Offset.zero,
                          ).animate(animation),
                          child: child,
                        ),
                      );
                    },
                    child: _step == 0
                        ? _buildAmountStep(dk, fg, mt, cd, bd)
                        : _step == 1
                            ? _buildRecipientStep(dk, fg, mt, cd, bd)
                            : _buildConfirmStep(dk, fg, mt, cd, bd),
                  ),
                ),

                // ── Main Call To Action Button ─────────────────────────────────
                Padding(
                  padding: EdgeInsets.fromLTRB(24, 16, 24, MediaQuery.of(context).padding.bottom + 16),
                  child: GestureDetector(
                    onTap: _canProceed()
                        ? () {
                            HapticFeedback.mediumImpact();
                            if (_step < 2) {
                              setState(() => _step++);
                            } else {
                              _showSuccess(context, dk, fg, mt);
                            }
                          }
                        : null,
                    child: AnimatedContainer(
                      duration: const Duration(milliseconds: 200),
                      height: 58,
                      decoration: BoxDecoration(
                        gradient: _canProceed()
                            ? const LinearGradient(colors: [AppTheme.royalBlue, AppTheme.electricBlue])
                            : null,
                        color: _canProceed() ? null : mt.withValues(alpha: 0.1),
                        borderRadius: BorderRadius.circular(22),
                        boxShadow: _canProceed() ? [
                          BoxShadow(color: AppTheme.electricBlue.withValues(alpha: 0.3), blurRadius: 18, offset: const Offset(0, 6))
                        ] : [],
                        border: Border.all(
                          color: _canProceed() ? Colors.white.withValues(alpha: 0.1) : Colors.transparent,
                        ),
                      ),
                      child: Center(
                        child: Text(
                          _step == 2 ? "Confirm & Send Funds" : "Continue",
                          style: TextStyle(
                            color: _canProceed() ? Colors.white : mt.withValues(alpha: 0.4),
                            fontSize: 16,
                            fontWeight: FontWeight.w800,
                            letterSpacing: -0.2,
                          ),
                        ),
                      ),
                    ),
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  // ── STEP 0: Amount input step ──
  Widget _buildAmountStep(bool dk, Color fg, Color mt, Color cd, Color bd) {
    return Column(
      key: const ValueKey(0),
      mainAxisAlignment: MainAxisAlignment.center,
      children: [
        const Spacer(),
        
        // Large Pulse animation for active input
        Container(
          padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 12),
          decoration: BoxDecoration(
            color: AppTheme.electricBlue.withValues(alpha: 0.04),
            borderRadius: BorderRadius.circular(24),
          ),
          child: Row(
            mainAxisSize: MainAxisSize.min,
            mainAxisAlignment: MainAxisAlignment.center,
            crossAxisAlignment: CrossAxisAlignment.baseline,
            textBaseline: TextBaseline.alphabetic,
            children: [
              Text(
                _amount.isEmpty ? "0" : _amount,
                style: TextStyle(color: fg, fontSize: 64, fontWeight: FontWeight.w900, letterSpacing: -2),
              ),
              const SizedBox(width: 8),
              const Text(
                "TND",
                style: TextStyle(color: AppTheme.electricBlue, fontSize: 24, fontWeight: FontWeight.w800),
              ),
            ],
          ),
        ).animate(target: _amount.isNotEmpty ? 1.0 : 0.0)
         .scale(end: const Offset(1.05, 1.05), duration: 150.ms, curve: Curves.easeOut),
        
        const SizedBox(height: 12),
        
        // Dynamic balance warning or info
        Text(
          "Available: ${Provider.of<AppProvider>(context).compteSolde.toStringAsFixed(2)} TND",
          style: TextStyle(color: mt, fontSize: 13, fontWeight: FontWeight.w600),
        ),

        const Spacer(),

        // Quick amount selection pills
        SizedBox(
          height: 42,
          child: ListView.builder(
            scrollDirection: Axis.horizontal,
            physics: const BouncingScrollPhysics(),
            itemCount: _quickAmounts.length,
            padding: const EdgeInsets.symmetric(horizontal: 20),
            itemBuilder: (context, i) {
              final amt = _quickAmounts[i];
              final isMatched = _amount == amt;
              return GestureDetector(
                onTap: () => _selectQuickAmount(amt),
                child: AnimatedContainer(
                  duration: const Duration(milliseconds: 200),
                  margin: const EdgeInsets.only(right: 10),
                  padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 10),
                  decoration: BoxDecoration(
                    color: isMatched ? AppTheme.electricBlue : cd,
                    borderRadius: BorderRadius.circular(16),
                    border: Border.all(
                      color: isMatched ? AppTheme.electricBlue : bd,
                    ),
                    boxShadow: [
                      if (isMatched) BoxShadow(color: AppTheme.electricBlue.withValues(alpha: 0.2), blurRadius: 8, offset: const Offset(0, 3))
                    ],
                  ),
                  child: Center(
                    child: Text(
                      "+$amt TND",
                      style: TextStyle(
                        color: isMatched ? Colors.white : fg,
                        fontSize: 13,
                        fontWeight: FontWeight.w800,
                      ),
                    ),
                  ),
                ),
              );
            },
          ),
        ).animate().fadeIn(delay: 100.ms),

        const SizedBox(height: 32),

        // Elegant glass numpad
        Padding(
          padding: const EdgeInsets.symmetric(horizontal: 40),
          child: Column(
            children: [
              for (var row in [["1", "2", "3"], ["4", "5", "6"], ["7", "8", "9"]])
                Padding(
                  padding: const EdgeInsets.only(bottom: 12),
                  child: Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: row.map((k) => _buildNumpadKey(k, fg, cd, bd)).toList(),
                  ),
                ),
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  _buildNumpadKey(".", fg, cd, bd),
                  _buildNumpadKey("0", fg, cd, bd),
                  _buildActionKey(Icons.backspace_outlined, fg, cd, bd, _onAmountDelete),
                ],
              ),
            ],
          ),
        ).animate().fadeIn(delay: 200.ms),
        const SizedBox(height: 24),
      ],
    );
  }

  Widget _buildNumpadKey(String text, Color fg, Color cd, Color bd) {
    return GestureDetector(
      onTap: () => _onAmountKey(text),
      child: Container(
        width: 76, height: 64,
        decoration: BoxDecoration(
          color: cd,
          borderRadius: BorderRadius.circular(20),
          border: Border.all(color: bd),
          boxShadow: [BoxShadow(color: Colors.black.withValues(alpha: 0.01), blurRadius: 4, offset: const Offset(0, 2))],
        ),
        child: Center(
          child: Text(
            text, 
            style: TextStyle(color: fg, fontSize: 24, fontWeight: FontWeight.w800, letterSpacing: -0.5),
          ),
        ),
      ),
    );
  }

  Widget _buildActionKey(IconData icon, Color fg, Color cd, Color bd, VoidCallback onTap) {
    return GestureDetector(
      onTap: onTap,
      child: Container(
        width: 76, height: 64,
        decoration: BoxDecoration(
          color: cd.withValues(alpha: 0.5),
          borderRadius: BorderRadius.circular(20),
          border: Border.all(color: bd),
        ),
        child: Center(
          child: Icon(icon, color: fg, size: 22),
        ),
      ),
    );
  }

  // ── STEP 1: Select Recipient ──
  Widget _buildRecipientStep(bool dk, Color fg, Color mt, Color cd, Color bd) {
    return Padding(
      key: const ValueKey(1),
      padding: const EdgeInsets.symmetric(horizontal: 24),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const SizedBox(height: 20),
          Text(
            "Transfer To",
            style: TextStyle(color: fg, fontSize: 26, fontWeight: FontWeight.w800, letterSpacing: -0.8),
          ),
          const SizedBox(height: 4),
          Text("Select a beneficiary to send funds", style: TextStyle(color: mt, fontSize: 13, fontWeight: FontWeight.w500)),
          
          const SizedBox(height: 20),
          
          // Premium Glass search bar
          Container(
            height: 52,
            padding: const EdgeInsets.symmetric(horizontal: 16),
            decoration: BoxDecoration(
              color: cd,
              borderRadius: BorderRadius.circular(18),
              border: Border.all(color: bd),
            ),
            child: Row(
              children: [
                Icon(Icons.search_rounded, color: mt, size: 20),
                const SizedBox(width: 12),
                Expanded(
                  child: TextField(
                    controller: _searchCtrl,
                    style: TextStyle(color: fg, fontSize: 14),
                    decoration: InputDecoration(
                      hintText: "Search name, phone or account...",
                      hintStyle: TextStyle(color: mt.withValues(alpha: 0.6), fontSize: 13, fontWeight: FontWeight.w600),
                      border: InputBorder.none,
                    ),
                    onChanged: _searchBeneficiaries,
                  ),
                ),
                if (_isSearching)
                  const SizedBox(
                    width: 16, height: 16,
                    child: CircularProgressIndicator(strokeWidth: 2),
                  )
              ],
            ),
          ),
          
          const SizedBox(height: 28),
          Text(
            "STB BENEFICIARIES",
            style: TextStyle(color: mt, fontSize: 10, fontWeight: FontWeight.w800, letterSpacing: 1.5),
          ),
          const SizedBox(height: 12),
          
          Expanded(
            child: _isLoadingInitial
                ? const Center(child: CircularProgressIndicator())
                : _searchResults.isEmpty
                    ? Center(
                        child: Column(
                          mainAxisAlignment: MainAxisAlignment.center,
                          children: [
                            Icon(Icons.person_search_rounded, size: 64, color: mt.withValues(alpha: 0.3)),
                            const SizedBox(height: 16),
                            Text(
                              _searchCtrl.text.isEmpty
                                  ? "No collaborators found"
                                  : "No results for \"${_searchCtrl.text}\"",
                              style: TextStyle(color: mt, fontSize: 14, fontWeight: FontWeight.w600),
                            ),
                          ],
                        ),
                      )
                    : ListView.builder(
                        physics: const BouncingScrollPhysics(),
                        itemCount: _searchResults.length,
                        itemBuilder: (context, i) {
                final r = _searchResults[i];
                final active = _selectedRecipient == i;
                final name = "${r['prenom']} ${r['nom']}";
                final matricule = r['matricule'] ?? "";
                final avatarColor = Color(r['avatarColor'] as int? ?? 0xFF2962FF);

                return GestureDetector(
                  onTap: () {
                    HapticFeedback.selectionClick();
                    setState(() => _selectedRecipient = i);
                  },
                  child: AnimatedContainer(
                    duration: const Duration(milliseconds: 200),
                    margin: const EdgeInsets.only(bottom: 12),
                    padding: const EdgeInsets.all(16),
                    decoration: BoxDecoration(
                      color: active ? AppTheme.electricBlue.withValues(alpha: 0.08) : cd,
                      borderRadius: BorderRadius.circular(22),
                      border: Border.all(
                        color: active ? AppTheme.electricBlue : bd,
                        width: active ? 2 : 1,
                      ),
                      boxShadow: [
                        if (active) BoxShadow(color: AppTheme.electricBlue.withValues(alpha: 0.1), blurRadius: 10, offset: const Offset(0, 4))
                      ],
                    ),
                    child: Row(
                      children: [
                        // Avatar with image from backend or initials
                        Container(
                          width: 44, height: 44,
                          decoration: BoxDecoration(
                            shape: BoxShape.circle,
                            color: avatarColor,
                            image: r['avatar'] != null && r['avatar'].toString().isNotEmpty
                                ? DecorationImage(
                                    image: NetworkImage('${r['avatar']}'),
                                    fit: BoxFit.cover,
                                  )
                                : null,
                          ),
                          child: r['avatar'] == null || r['avatar'].toString().isEmpty
                              ? Center(
                                  child: Text(
                                    name.isNotEmpty ? name.substring(0, 1).toUpperCase() : "?",
                                    style: const TextStyle(color: Colors.white, fontWeight: FontWeight.bold, fontSize: 18),
                                  ),
                                )
                              : null,
                        ),
                        const SizedBox(width: 16),
                        Expanded(
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Text(
                                name,
                                style: TextStyle(color: fg, fontWeight: FontWeight.w700, fontSize: 14),
                              ),
                              const SizedBox(height: 2),
                              Text(
                                "Matricule: $matricule",
                                style: TextStyle(color: mt, fontSize: 11, fontWeight: FontWeight.w600),
                              ),
                            ],
                          ),
                        ),
                        if (active)
                          Container(
                            width: 22, height: 22,
                            decoration: const BoxDecoration(color: AppTheme.electricBlue, shape: BoxShape.circle),
                            child: const Icon(Icons.check_rounded, color: Colors.white, size: 14),
                          ),
                      ],
                    ),
                  ),
                ).animate().fadeIn(delay: (i * 40).ms);
                        },
                      ),
          ),
        ],
      ),
    );
  }

  // ── STEP 2: Confirm step ──
  Widget _buildConfirmStep(bool dk, Color fg, Color mt, Color cd, Color bd) {
    final recipient = _selectedRecipient >= 0 && _selectedRecipient < _searchResults.length ? _searchResults[_selectedRecipient] : null;
    final rName = recipient != null ? "${recipient['prenom']} ${recipient['nom']}" : "—";
    final rRib = recipient != null ? "Matricule: ${recipient['matricule']}" : "—";
    
    return Padding(
      key: const ValueKey(2),
      padding: const EdgeInsets.symmetric(horizontal: 24),
      child: Column(
        children: [
          const SizedBox(height: 24),
          
          // Transaction graphic illustration
          Container(
            width: 76, height: 76,
            decoration: BoxDecoration(
              gradient: const LinearGradient(colors: [AppTheme.royalBlue, AppTheme.electricBlue]),
              shape: BoxShape.circle,
              boxShadow: [
                BoxShadow(color: AppTheme.electricBlue.withValues(alpha: 0.3), blurRadius: 16, offset: const Offset(0, 6))
              ],
            ),
            child: const Icon(Icons.arrow_upward_rounded, color: Colors.white, size: 28),
          ).animate().scale(duration: 400.ms, curve: Curves.easeOutBack),
          
          const SizedBox(height: 18),
          
          Row(
            mainAxisAlignment: MainAxisAlignment.center,
            crossAxisAlignment: CrossAxisAlignment.baseline,
            textBaseline: TextBaseline.alphabetic,
            children: [
              Text(
                _amount,
                style: TextStyle(color: fg, fontSize: 44, fontWeight: FontWeight.w900, letterSpacing: -1.5),
              ),
              const SizedBox(width: 6),
              const Text(
                "TND",
                style: TextStyle(color: AppTheme.electricBlue, fontSize: 18, fontWeight: FontWeight.w800),
              ),
            ],
          ),
          const SizedBox(height: 4),
          Text(
            "Transferring to $rName",
            style: TextStyle(color: mt, fontSize: 13, fontWeight: FontWeight.w600),
          ),
          
          const SizedBox(height: 28),
          
          // Glass ticket confirmation design
          Container(
            padding: const EdgeInsets.all(22),
            decoration: BoxDecoration(
              color: cd,
              borderRadius: BorderRadius.circular(28),
              border: Border.all(color: bd),
              boxShadow: [BoxShadow(color: Colors.black.withValues(alpha: 0.01), blurRadius: 15, offset: const Offset(0, 5))],
            ),
            child: Column(
              children: [
                _confirmRow("Beneficiary Name", rName, fg, mt),
                Divider(color: bd, height: 28),
                _confirmRow("Beneficiary Account", rRib, fg, mt),
                Divider(color: bd, height: 28),
                _confirmRow("Amount to Send", "$_amount TND", fg, mt),
                Divider(color: bd, height: 28),
                _confirmRow("Transfer Fees", "0.00 TND (Free)", AppTheme.emerald, mt),
              ],
            ),
          ).animate().fadeIn(delay: 150.ms).slideY(begin: 0.05),
        ],
      ),
    );
  }

  Widget _confirmRow(String label, String value, Color valueColor, Color labelColor) {
    return Row(
      mainAxisAlignment: MainAxisAlignment.spaceBetween,
      children: [
        Text(label, style: TextStyle(color: labelColor, fontSize: 12, fontWeight: FontWeight.w600)),
        Text(value, style: TextStyle(color: valueColor, fontSize: 13, fontWeight: FontWeight.w800)),
      ],
    );
  }

  void _showSuccess(BuildContext context, bool dk, Color fg, Color mt) async {
    final amt = double.tryParse(_amount) ?? 0.0;
    if (amt <= 0 || _selectedRecipient < 0) return;

    final recipient = _searchResults[_selectedRecipient];
    final matricule = recipient['matricule'] as String;

    // Show loading
    showDialog(context: context, barrierDismissible: false, builder: (_) => const Center(child: CircularProgressIndicator()));

    final res = await AuthApiService.createTransfer(toMatricule: matricule, montant: amt, motif: "Virement STB Mobile");
    
    // Hide loading
    if (mounted) Navigator.pop(context);

    if (!mounted) return;

    if (!res.isSuccess) {
      ScaffoldMessenger.of(context).showSnackBar(SnackBar(
        content: Text("Transfer failed: ${res.error}"),
        backgroundColor: Colors.red,
      ));
      return;
    }

    // ✅ REFRESH USER PROFILE TO UPDATE BALANCE
    if (mounted) {
      final provider = Provider.of<AppProvider>(context, listen: false);
      await provider.fetchProfile(); // ✅ Correct method name - This will update the balance
      
      // ✅ FORCE IMMEDIATE REFRESH OF DASHBOARD AND NOTIFICATIONS
      try {
        final dashboardVM = Provider.of<DashboardViewModel>(context, listen: false);
        final notificationsVM = Provider.of<NotificationsViewModel>(context, listen: false);
        
        // Refresh both in parallel
        await Future.wait([
          dashboardVM.load(),
          notificationsVM.load(),
        ]);
        
      } catch (e) {
      }
    }

    showModalBottomSheet(
      context: context,
      backgroundColor: Colors.transparent,
      isScrollControlled: true,
      builder: (_) => Container(
        padding: EdgeInsets.fromLTRB(24, 32, 24, MediaQuery.of(context).padding.bottom + 24),
        decoration: BoxDecoration(
          color: Theme.of(context).cardColor,
          borderRadius: const BorderRadius.vertical(top: Radius.circular(32)),
          border: Border.all(color: dk ? Colors.white.withValues(alpha: 0.08) : Colors.black.withValues(alpha: 0.04)),
        ),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            Container(
              width: 84, height: 84,
              decoration: BoxDecoration(
                color: AppTheme.emerald.withValues(alpha: 0.12),
                shape: BoxShape.circle,
                border: Border.all(color: AppTheme.emerald.withValues(alpha: 0.3), width: 2),
              ),
              child: const Icon(Icons.check_rounded, color: AppTheme.emerald, size: 42),
            ).animate().scale(duration: 400.ms, curve: Curves.easeOutBack),
            const SizedBox(height: 24),
            Text(
              "Transfer Completed",
              style: TextStyle(color: fg, fontSize: 24, fontWeight: FontWeight.w800, letterSpacing: -0.5),
            ),
            const SizedBox(height: 8),
            Text(
              "Funds have been dispatched successfully.",
              style: TextStyle(color: mt, fontSize: 13, fontWeight: FontWeight.w600),
            ),
            const SizedBox(height: 24),
            
            // Receipt panel
            Container(
              padding: const EdgeInsets.all(18),
              decoration: BoxDecoration(
                color: dk ? Colors.white.withValues(alpha: 0.02) : Colors.black.withValues(alpha: 0.01),
                borderRadius: BorderRadius.circular(20),
                border: Border.all(color: dk ? Colors.white.withValues(alpha: 0.04) : Colors.black.withValues(alpha: 0.02)),
              ),
              child: Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text("RECIPIENT", style: TextStyle(color: mt, fontSize: 9, fontWeight: FontWeight.w800, letterSpacing: 1.5)),
                      const SizedBox(height: 4),
                      Text("${_searchResults[_selectedRecipient]['prenom']} ${_searchResults[_selectedRecipient]['nom']}", style: TextStyle(color: fg, fontSize: 13, fontWeight: FontWeight.w800)),
                    ],
                  ),
                  Column(
                    crossAxisAlignment: CrossAxisAlignment.end,
                    children: [
                      Text("AMOUNT SENT", style: TextStyle(color: mt, fontSize: 9, fontWeight: FontWeight.w800, letterSpacing: 1.5)),
                      const SizedBox(height: 4),
                      Text("$_amount TND", style: const TextStyle(color: AppTheme.electricBlue, fontSize: 15, fontWeight: FontWeight.w800)),
                    ],
                  ),
                ],
              ),
            ),
            const SizedBox(height: 32),
            GestureDetector(
              onTap: () async {
                Navigator.pop(context); // pop modal
                Navigator.pop(context); // pop screen
                // ✅ Trigger dashboard refresh when going back
                // The dashboard will refresh when it regains focus
              },
              child: Container(
                height: 56,
                decoration: BoxDecoration(
                  gradient: const LinearGradient(colors: [AppTheme.royalBlue, AppTheme.electricBlue]),
                  borderRadius: BorderRadius.circular(18),
                  boxShadow: [
                    BoxShadow(color: AppTheme.electricBlue.withValues(alpha: 0.2), blurRadius: 10, offset: const Offset(0, 4))
                  ],
                ),
                child: const Center(
                  child: Text(
                    "Back to Dashboard",
                    style: TextStyle(color: Colors.white, fontSize: 15, fontWeight: FontWeight.w700),
                  ),
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }
}
